import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { firestoreService } from '../services/firestoreService.js';
import { LicenseService } from '../services/licenseService.js';
import { 
  asyncHandler,
  validationErrorHandler,
  createApiError,
} from '../middleware/errorHandler.js';
import {
  authenticateToken,
  requireEmailVerification,
  requireEnterpriseAdminStrict,
  addRequestInfo,
} from '../middleware/auth.js';
import { PasswordUtil } from '../utils/password.js';
import { ComplianceService } from '../services/complianceService.js';
import { v4 as uuidv4 } from 'uuid';
import { ProjectBridgeService } from '../services/projectBridgeService.js';

const router: Router = Router();

// All org routes require auth and verified email
router.use(addRequestInfo);
router.use(authenticateToken);
router.use(requireEmailVerification);

// GET /organizations/my
router.get('/my', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [owned, memberOf] = await Promise.all([
    firestoreService.getOrganizationsOwnedByUser(userId),
    firestoreService.getOrganizationsForMemberUser(userId),
  ]);

  // Attach member lists for quick UI rendering
  const withMembers = await Promise.all([
    ...owned.map(async (o) => ({
      ...o,
      members: await firestoreService.getOrgMembers(o.id),
    })),
    ...memberOf.map(async (o) => ({
      ...o,
      members: await firestoreService.getOrgMembers(o.id),
    })),
  ]);

  res.json({
    success: true,
    data: {
      owned: withMembers.slice(0, owned.length),
      memberOf: withMembers.slice(owned.length),
    },
  });
}));

// GET /organizations/my/context
// Returns the primary organization context for the current user (owned if any, else first membership)
router.get('/my/context', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [owned, memberOf] = await Promise.all([
    firestoreService.getOrganizationsOwnedByUser(userId),
    firestoreService.getOrganizationsForMemberUser(userId),
  ]);

  let primaryOrg: any = null;
  let primaryRole: 'OWNER' | 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER' | undefined = undefined;
  let members: any[] = [];
  let activeSubscription: any = null;

  if (owned && owned.length > 0) {
    primaryOrg = owned[0];
    members = await firestoreService.getOrgMembers(primaryOrg.id);
    primaryRole = 'OWNER';
  } else if (memberOf && memberOf.length > 0) {
    primaryOrg = memberOf[0];
    members = await firestoreService.getOrgMembers(primaryOrg.id);
    const me = members.find(m => m.userId === userId);
    primaryRole = me?.role;
  }

  if (primaryOrg) {
    const subs = await firestoreService.getSubscriptionsByOrganizationId(primaryOrg.id);
    activeSubscription = subs.find(s => s.status === 'ACTIVE') || null;
  }

  res.json({
    success: true,
    data: {
      primaryOrgId: primaryOrg?.id || null,
      primaryRole: primaryRole || null,
      organization: primaryOrg,
      members,
      activeSubscription,
    },
  });
}));

// POST /organizations/authorize-member
// Validates that the provided email belongs to an ACTIVE member of the caller's primary organization
router.post('/authorize-member', requireEnterpriseAdminStrict, [
  body('email').isEmail().withMessage('Valid email required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const userId = req.user!.id;
  const { email } = req.body as { email: string };

  const owned = await firestoreService.getOrganizationsOwnedByUser(userId);
  if (!owned || owned.length === 0) {
    throw createApiError('No owned organization found for caller', 400);
  }
  const orgId = owned[0].id;

  const member = await firestoreService.getOrgMemberByEmail(orgId, email);
  if (!member) {
    return res.json({ success: true, data: { allowed: false, reason: 'NOT_A_MEMBER' } });
  }
  if (member.status !== 'ACTIVE') {
    return res.json({ success: true, data: { allowed: false, reason: member.status } });
  }

  return res.json({ success: true, data: { allowed: true, role: member.role, memberId: member.id, orgId } });
}));

// POST /organizations/:orgId/invitations
router.post('/:orgId/invitations', requireEnterpriseAdminStrict, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').isIn(['OWNER', 'ENTERPRISE_ADMIN', 'MANAGER', 'MEMBER']).withMessage('Valid role required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { orgId } = req.params;
  const { email, role } = req.body as { email: string; role: 'OWNER' | 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER' };
  const inviterUserId = req.user!.id;

  const org = await firestoreService.getOrganizationById(orgId);
  if (!org) throw createApiError('Organization not found', 404);

  // Check seat availability: seats on active subscription - active members
  const subs = await firestoreService.getSubscriptionsByOrganizationId(orgId);
  const activeSub = subs.find(s => s.status === 'ACTIVE');
  if (!activeSub) throw createApiError('No active subscription for organization', 400);

  const members = await firestoreService.getOrgMembers(orgId);
  const activeSeats = members.filter(m => m.status === 'ACTIVE' || m.seatReserved).length;
  if (activeSeats >= activeSub.seats) {
    throw createApiError('No seats available', 400);
  }

  // Reserve a seat via member record in INVITED status
  const member = await firestoreService.createOrgMember({
    orgId,
    email,
    role: role === 'OWNER' ? 'OWNER' : (role === 'ENTERPRISE_ADMIN' ? 'ENTERPRISE_ADMIN' : role),
    status: 'INVITED',
    seatReserved: true,
    invitedByUserId: inviterUserId,
    invitedAt: new Date(),
  });

  // Create invitation token
  const token = uuidv4();
  const invitationRole: 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER' = role === 'OWNER' ? 'ENTERPRISE_ADMIN' : (role as any);
  const invitation = await firestoreService.createInvitation({
    orgId,
    email,
    role: invitationRole,
    invitedByUserId: inviterUserId,
    token,
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'Invitation created',
    data: { invitationId: invitation.id, token },
  });
}));

// POST /organizations/invitations/accept
router.post('/invitations/accept', [
  body('token').notEmpty().withMessage('Token required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { token } = req.body as { token: string };
  const userId = req.user!.id;

  const invite = await firestoreService.getInvitationByToken(token);
  if (!invite || invite.status !== 'PENDING') throw createApiError('Invalid or expired invitation', 400);

  const org = await firestoreService.getOrganizationById(invite.orgId);
  if (!org) throw createApiError('Organization not found', 404);

  // Link member
  const member = await firestoreService.getOrgMemberByEmail(invite.orgId, invite.email);
  if (!member) throw createApiError('Member placeholder not found', 404);

  await firestoreService.updateOrgMember(member.id, {
    userId,
    status: 'ACTIVE',
    seatReserved: true,
    joinedAt: new Date(),
  });

  // Ensure the user's account reflects their organization membership
  await firestoreService.updateUser(userId, { organizationId: invite.orgId } as any);

  // Assign license (JIT) against active org subscription, avoiding duplicates per user+subscription
  const subs = await firestoreService.getSubscriptionsByOrganizationId(invite.orgId);
  const activeSub = subs.find(s => s.status === 'ACTIVE');
  if (!activeSub) throw createApiError('No active subscription for organization', 400);

  const existingLicenses = await firestoreService.getLicensesByUserAndSubscription(userId, activeSub.id);
  const hasNonRevoked = existingLicenses.some(l => l.status !== 'REVOKED' && l.status !== 'EXPIRED');
  if (!hasNonRevoked) {
    await LicenseService.generateLicenses(
      userId,
      activeSub.id,
      activeSub.tier as any,
      1,
      'PENDING',
      12,
      invite.orgId
    );
  }

  // Mark invitation accepted
  await firestoreService.updateInvitation(invite.id, { status: 'ACCEPTED' });

  res.json({ success: true, message: 'Invitation accepted and license assigned' });
}));

// POST /organizations/:orgId/members/:memberId/remove (optional)
router.post('/:orgId/members/:memberId/remove', requireEnterpriseAdminStrict, asyncHandler(async (req: Request, res: Response) => {
  const { orgId, memberId } = req.params;

  const member = (await firestoreService.getOrgMembers(orgId)).find(m => m.id === memberId);
  if (!member) throw createApiError('Member not found', 404);

  // Set member removed and free seat
  await firestoreService.updateOrgMember(memberId, { status: 'REMOVED', seatReserved: false });

  // Revoke licenses tied to org subscription for this user
  if (member.userId) {
    // Fetch licenses for user and revoke those belonging to org subscriptions
    const subs = await firestoreService.getSubscriptionsByOrganizationId(orgId);
    const subIds = new Set(subs.map(s => s.id));
    const userLicenses = await firestoreService.getLicensesByUserId(member.userId);
    for (const lic of userLicenses) {
      if (lic.subscriptionId && subIds.has(lic.subscriptionId)) {
        await firestoreService.updateLicense(lic.id, { status: 'REVOKED' } as any);
      }
    }
  }

  res.json({ success: true, message: 'Member removed and licenses revoked where applicable' });
}));

// PATCH /organizations/:orgId/members/:memberId
// Update member properties (email, role, status)
router.patch('/:orgId/members/:memberId', requireEnterpriseAdminStrict, [
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['OWNER', 'ENTERPRISE_ADMIN', 'MANAGER', 'MEMBER']).withMessage('Invalid role'),
  body('status').optional().isIn(['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED']).withMessage('Invalid status')
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { orgId, memberId } = req.params;
  const { email, role, status } = req.body as Partial<{ email: string; role: string; status: string }>;

  const member = (await firestoreService.getOrgMembers(orgId)).find(m => m.id === memberId);
  if (!member) throw createApiError('Member not found', 404);

  // Enforce seat constraints when activating
  if (status === 'ACTIVE' && member.status !== 'ACTIVE') {
    const subs = await firestoreService.getSubscriptionsByOrganizationId(orgId);
    const activeSub = subs.find(s => s.status === 'ACTIVE');
    if (!activeSub) throw createApiError('No active subscription for organization', 400);
    const current = await firestoreService.getOrgMembers(orgId);
    const activeSeats = current.filter(m => m.status === 'ACTIVE' || m.seatReserved).length;
    if (activeSeats >= (activeSub.seats || 0)) {
      throw createApiError('No seats available', 400);
    }
  }

  const updates: any = {};
  if (email !== undefined) updates.email = email;
  if (role !== undefined) updates.role = role;
  if (status !== undefined) {
    updates.status = status;
    // Manage seat reservation flag for clarity
    if (status === 'INVITED') updates.seatReserved = true;
    if (status === 'REMOVED') updates.seatReserved = false;
  }

  await firestoreService.updateOrgMember(memberId, updates);

  res.json({ success: true, message: 'Member updated', data: { memberId, updates } });
}));

// PUT /organizations/:orgId/members/:memberId/password
// Enterprise Admin within the org can set a member's password
// If the member hasn't accepted the invite yet (no linked user), this endpoint will:
// - Create or link a user account by the member's email
// - Set the provided password
// - Link the org member to the user and activate the member
router.put('/:orgId/members/:memberId/password', requireEnterpriseAdminStrict, [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { orgId, memberId } = req.params;
  const { password } = req.body as { password: string };

  // Validate org membership
  const member = (await firestoreService.getOrgMembers(orgId)).find(m => m.id === memberId);
  if (!member) throw createApiError('Member not found', 404);

  // Validate password policy and compute hash
  const passCheck = PasswordUtil.validate(password);
  if (!passCheck.isValid) {
    throw createApiError('Password does not meet requirements', 400, 'WEAK_PASSWORD', { requirements: passCheck.errors });
  }
  const hashed = await PasswordUtil.hash(password);

  // Resolve or create user account for this member
  let targetUserId = member.userId;
  if (!targetUserId) {
    // Try to find an existing user by email
    const existing = await firestoreService.getUserByEmail(member.email);
    if (existing) {
      targetUserId = existing.id;
      // Ensure account is active and verified for enterprise onboarding
      await firestoreService.updateUser(existing.id, { password: hashed, isEmailVerified: true } as any);
    } else {
      // Create a minimal user account so the member can log in
      const created = await firestoreService.createUser({
        email: member.email,
        name: member.email.split('@')[0],
        password: hashed,
        role: 'USER',
        isEmailVerified: true,
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
        privacyConsent: [],
        marketingConsent: false,
        dataProcessingConsent: false,
        identityVerified: false,
        kycStatus: 'COMPLETED',
        registrationSource: 'enterprise_invite',
        organizationId: orgId,
      } as any);
      targetUserId = created.id;
    }

    // Link the org member to the user and activate seat
    await firestoreService.updateOrgMember(member.id, {
      userId: targetUserId,
      status: 'ACTIVE',
      seatReserved: true,
      joinedAt: new Date(),
    });
  } else {
    // Update password for already-linked user
    await firestoreService.updateUser(targetUserId, { password: hashed } as any);
  }

  // Attempt to sync password to project server user account as well (best-effort)
  try {
    await ProjectBridgeService.setProjectUserPasswordByEmail(member.email, password);
  } catch {}

  // Audit log for compliance
  const adminUserId = req.user!.id;
  const requestInfo = (req as any).requestInfo;
  await ComplianceService.createAuditLog(
    targetUserId!,
    'PASSWORD_CHANGE',
    `Enterprise admin ${adminUserId} set password for org member`,
    { orgId, memberId, adminUserId },
    requestInfo
  );

  res.json({ success: true, message: 'Password updated successfully' });
}));

export { router as organizationsRouter };


