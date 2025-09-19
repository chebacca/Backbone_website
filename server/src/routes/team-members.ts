import type { Router as ExpressRouter, Request, Response } from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, authenticateFirebaseToken } from '../middleware/auth.js';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';
import { PasswordUtil } from '../utils/password.js';
import { JwtUtil } from '../utils/jwt.js';
import { ComplianceService } from '../services/complianceService.js';
// Removed db import as it's not needed for this route
import { TeamMemberAutoRegistrationService } from '../services/teamMemberAutoRegistration.js';
import { 
  asyncHandler, 
  validationErrorHandler, 
  createApiError 
} from '../middleware/errorHandler.js';
import admin from 'firebase-admin';

const router: ExpressRouter = Router();

/**
 * Team Member Authentication - Only for Desktop/Web App, NOT for licensing website
 * This endpoint allows team members to authenticate into the actual Backbone application
 */
router.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { email, password } = req.body;
  const requestInfo = (req as any).requestInfo;
  
  // Find team member by email
  const teamMember = await firestoreService.getTeamMemberByEmail(email);
  if (!teamMember) {
    throw createApiError('Invalid credentials', 401);
  }

  // Validate team member password
  let isValidPassword = false;
  if (teamMember.password) {
    isValidPassword = await PasswordUtil.compare(password, teamMember.password);
  } else if (teamMember.hashedPassword) {
    // Fallback for legacy field name
    isValidPassword = await PasswordUtil.compare(password, teamMember.hashedPassword);
  } else {
    // For development/testing, accept any password for team members without hashed passwords
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_TEAM_MEMBER_DEV_LOGIN === 'true') {
      isValidPassword = true;
    }
  }

  if (!isValidPassword) {
    throw createApiError('Invalid credentials', 401);
  }

  // Create user object for JWT token generation
  const user = {
    id: teamMember.id,
    email: teamMember.email,
    name: teamMember.name || `${teamMember.firstName} ${teamMember.lastName}`.trim(),
    role: 'TEAM_MEMBER' as const
  };

  // Generate JWT tokens
  const tokens = JwtUtil.generateTokens({ 
    userId: user.id, 
    email: user.email, 
    role: user.role 
  });
  
  // 🔧 WORKAROUND: Generate Firebase credentials for Firestore access
  // Since custom token generation requires special IAM permissions, we'll use
  // a different approach: ensure the team member has Firebase Auth credentials
  let firebaseCustomToken = null;
  let firebaseCredentials = null;
  
  try {
    // Check if team member has a Firebase UID
    if (teamMember.firebaseUid) {
      logger.info(`Team member has existing Firebase UID: ${teamMember.firebaseUid}`);
      
      // 🔧 WORKAROUND: Instead of custom token, provide Firebase Auth credentials
      // The client will use these to sign in with Firebase Auth directly
      firebaseCredentials = {
        email: teamMember.email,
        uid: teamMember.firebaseUid,
        // Generate a temporary password for Firebase Auth (if needed)
        tempPassword: 'TempPass123!' // This should be replaced with proper password management
      };
      
      // Try to update the Firebase user's password to ensure they can sign in
      try {
        await admin.auth().updateUser(teamMember.firebaseUid, {
          password: firebaseCredentials.tempPassword,
          emailVerified: true, // Mark as verified for team members
        });
        logger.info(`Updated Firebase user password for: ${teamMember.firebaseUid}`);
      } catch (updateError) {
        logger.warn('Could not update Firebase user password:', updateError instanceof Error ? updateError.message : 'Unknown error');
      }
      
    } else {
      // Create a new Firebase user with email/password
      const tempPassword = 'TempPass123!'; // This should be replaced with proper password management
      
      const firebaseUserRecord = await admin.auth().createUser({
        email: teamMember.email,
        password: tempPassword,
        displayName: teamMember.name || `${teamMember.firstName} ${teamMember.lastName}`.trim(),
        emailVerified: true, // Mark as verified for team members
        disabled: false,
      });
      
      // Update team member with Firebase UID
      await firestoreService.updateTeamMember(teamMember.id, { 
        firebaseUid: firebaseUserRecord.uid,
        lastLoginAt: new Date()
      });
      
      firebaseCredentials = {
        email: teamMember.email,
        uid: firebaseUserRecord.uid,
        tempPassword: tempPassword
      };
      
      logger.info(`Created new Firebase user with credentials: ${firebaseUserRecord.uid}`);
    }
  } catch (firebaseError) {
    logger.error('Failed to setup Firebase credentials:', firebaseError);
    // Don't fail the entire authentication if Firebase setup fails
    // The team member can still use JWT tokens for API access
  }
  
  // Update last login time
  await firestoreService.updateTeamMember(teamMember.id, { lastLoginAt: new Date() });
  
  // Create audit log
  await ComplianceService.createAuditLog(teamMember.id, 'LOGIN', 'Team member logged in successfully', { email }, requestInfo);
  logger.info(`Team member logged in successfully: ${email}`, { userId: teamMember.id });

  // Get team member's project access and license data
  let teamMemberData = null;
  try {
    const projectAccess = await firestoreService.getTeamMemberProjectAccess(teamMember.id);
    const licenses = await firestoreService.getTeamMemberLicenses(teamMember.id);
    
    teamMemberData = {
      projectAccess,
      licenses,
      organizationId: teamMember.organizationId,
      licenseType: teamMember.licenseType,
      status: teamMember.status
    };
  } catch (error) {
    logger.warn('Error fetching team member data:', error);
    teamMemberData = {
      projectAccess: [],
      licenses: [],
      organizationId: teamMember.organizationId,
      licenseType: teamMember.licenseType,
      status: teamMember.status
    };
  }

  res.json({
    success: true,
    message: 'Team member login successful',
    data: {
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        isEmailVerified: true,
        isTeamMember: true,
        organizationId: teamMember.organizationId,
        licenseType: teamMember.licenseType,
        status: teamMember.status
      },
      tokens,
      firebaseCustomToken, // Include Firebase custom token for Firestore access (may be null)
      firebaseCredentials, // 🔧 WORKAROUND: Include Firebase Auth credentials
      teamMemberData
    }
  });
  return;
}));

// Get licensed team members (available for assignment to projects)
// GET /api/team-members/test - Simple test endpoint
router.get('/test', (req: any, res: Response) => {
  res.json({ success: true, message: 'Team members router is working' });
});

// GET /api/team-members - List all team members for an organization
router.get('/', authenticateFirebaseToken, asyncHandler(async (req: any, res: Response): Promise<void> => {
  const { organizationId } = req.query;
  
  if (!organizationId) {
    throw createApiError('Organization ID is required', 400);
  }

  try {
    const teamMembers = await firestoreService.getTeamMembersByOrganization(organizationId);
    
    res.json({
      success: true,
      data: teamMembers,
      count: teamMembers.length
    });
  } catch (error) {
    logger.error('Failed to fetch team members:', error);
    throw createApiError('Failed to fetch team members', 500);
  }
}));

router.get('/licensed', authenticateFirebaseToken, async (req: any, res) => {
  try {
    const userId = req.user?.id as string;
    const { search, excludeProjectId } = req.query;

    logger.info(`🔍 Fetching licensed team members for user: ${userId}`);

    // Get user's organization to find team members
    const userOrgs = await firestoreService.getOrganizationsForUser(userId);
    logger.info(`📋 User organizations found: ${userOrgs.length}`, { orgIds: userOrgs.map(org => org.id) });
    
    if (!userOrgs || userOrgs.length === 0) {
      logger.warn(`⚠️ No organizations found for user: ${userId}`);
      res.json({ success: true, data: [] });
      return;
    }

    // For now, use the first organization
    const orgId = userOrgs[0].id;
    logger.info(`🏢 Using organization: ${orgId}`);
    
    // Get all active organization members
    const orgMembers = await firestoreService.getOrgMembers(orgId);
    logger.info(`👥 Raw organization members found: ${orgMembers.length}`, { 
      members: orgMembers.map(m => ({ id: m.id, email: m.email, status: m.status, role: m.role, licenseType: m.licenseType }))
    });
    
    // Filter for active members - include all active members regardless of license type
    // The license information will be determined by their role and subscription
    const activeMembers = orgMembers.filter(member => 
      member.status === 'ACTIVE'
    );
    logger.info(`✅ Active members after status filter: ${activeMembers.length}`, {
      activeMembers: activeMembers.map(m => ({ id: m.id, email: m.email, role: m.role, licenseType: m.licenseType }))
    });

    let filteredMembers = activeMembers;

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredMembers = filteredMembers.filter(member => 
        member.name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower)
      );
      logger.info(`🔍 After search filter "${search}": ${filteredMembers.length} members`);
    }

    // Exclude members already assigned to the project
    if (excludeProjectId && typeof excludeProjectId === 'string') {
      const projectMembers = await firestoreService.getProjectTeamMembers(excludeProjectId);
      const assignedMemberIds = projectMembers.map(pm => pm.teamMemberId);
      logger.info(`🚫 Project ${excludeProjectId} already has ${assignedMemberIds.length} members:`, assignedMemberIds);
      
      filteredMembers = filteredMembers.filter(member => 
        !assignedMemberIds.includes(member.id)
      );
      logger.info(`✅ After excluding assigned members: ${filteredMembers.length} available members`);
    }

    // Get organization details to determine license inheritance
    const organization = await firestoreService.getOrganizationById(orgId);
    const orgTier = organization?.tier;
    
    // Transform to expected format
    const teamMembers = filteredMembers.map(member => {
      // Generate a better display name
      let displayName = member.name;
      
      if (!displayName) {
        if (member.firstName && member.lastName) {
          displayName = `${member.firstName} ${member.lastName}`;
        } else if (member.firstName) {
          displayName = member.firstName;
        } else if (member.lastName) {
          displayName = member.lastName;
        } else {
          // If no name fields at all, create a name from email
          const emailParts = member.email.split('@');
          const username = emailParts[0];
          // Convert username to title case (e.g., "john.doe" -> "John Doe")
          displayName = username
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
      }

      // Determine license type - inherit from organization tier if not explicitly set
      let licenseType = member.licenseType;
      if (!licenseType && orgTier) {
        switch (orgTier) {
          case 'ENTERPRISE':
            licenseType = 'ENTERPRISE';
            break;
          case 'PRO':
            licenseType = 'PROFESSIONAL';
            break;
          default:
            licenseType = 'BASIC';
        }
      } else if (!licenseType) {
        licenseType = 'PROFESSIONAL'; // Final fallback
      }

      return {
        id: member.id,
        name: displayName,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        licenseType: licenseType,
        status: member.status,
        organizationId: orgId,
        department: member.department || 'Not assigned',
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        lastActive: member.lastActiveAt || member.updatedAt
      };
    });

    logger.info(`🎯 Final team members being returned: ${teamMembers.length}`, {
      teamMembers: teamMembers.map(tm => ({ id: tm.id, email: tm.email, name: tm.name, licenseType: tm.licenseType }))
    });

    res.json({ success: true, data: teamMembers });
  } catch (e: any) {
    logger.error('❌ get licensed team members failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to get licensed team members' });
  }
});

// Get team member by ID
router.get('/:id', authenticateFirebaseToken, async (req: any, res) => {
  try {
    const teamMemberId = req.params.id as string;
    const userId = req.user?.id as string;

    // Get team member details
    const teamMember = await firestoreService.getTeamMemberById(teamMemberId);
    if (!teamMember) {
      res.status(404).json({ success: false, error: 'Team member not found' });
      return;
    }

    // Verify user has access to this team member (same organization)
    const userOrgs = await firestoreService.getOrganizationsForUser(userId);
    const memberOrgs = await firestoreService.getOrganizationsForUser(teamMemberId);
    
    const hasSharedOrg = userOrgs.some(userOrg => 
      memberOrgs.some(memberOrg => memberOrg.id === userOrg.id)
    );

    if (!hasSharedOrg && teamMemberId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.json({ success: true, data: teamMember });
  } catch (e: any) {
    logger.error('get team member by id failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to get team member' });
  }
});

// Legacy endpoint for backward compatibility - Get project team members
router.get('/getProjectTeamMembers', authenticateFirebaseToken, async (req: any, res) => {
  try {
    const { projectId } = req.query;
    const userId = req.user?.id as string;

    if (!projectId) {
      res.status(400).json({ success: false, error: 'Project ID is required' });
      return;
    }

    // Authorization - ensure user can access project
    const project = await firestoreService.getProjectByIdAuthorized(projectId as string, userId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Get project team members from Firestore
    const teamMembers = await firestoreService.getProjectTeamMembers(projectId as string);
    
    res.json({ success: true, data: teamMembers });
  } catch (e: any) {
    logger.error('getProjectTeamMembers failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to get project team members' });
  }
});

// Legacy endpoint for backward compatibility - Get licensed team members with exclusion
router.get('/getLicensedTeamMembers', authenticateFirebaseToken, async (req: any, res) => {
  try {
    const { excludeProjectId } = req.query;
    const userId = req.user?.id as string;

    // Get user's organization
    const userOrgs = await firestoreService.getOrganizationsForUser(userId);
    if (!userOrgs.length) {
      res.json({ success: true, data: [] });
      return;
    }

    const orgId = userOrgs[0].id;
    
    // Get organization details to determine license inheritance
    const organization = await firestoreService.getOrganizationById(orgId);
    const orgTier = organization?.tier;

    // Get all active organization members
    const orgMembers = await firestoreService.getOrgMembers(orgId);
    
    // Filter for active members
    let teamMembers = orgMembers.filter(member => member.status === 'ACTIVE');

    // If excludeProjectId is provided, filter out team members already assigned to that project
    if (excludeProjectId) {
      try {
        const projectTeamMembers = await firestoreService.getProjectTeamMembers(excludeProjectId as string);
        const assignedMemberIds = projectTeamMembers.map(ptm => ptm.teamMemberId);
        teamMembers = teamMembers.filter(member => !assignedMemberIds.includes(member.id));
      } catch (error) {
        logger.warn('Error filtering project team members:', error);
        // Continue without filtering if there's an error
      }
    }

    // Transform team members to match expected format
    const transformedMembers = teamMembers.map(member => {
      let displayName = member.name;
      
      if (!displayName) {
        if (member.firstName && member.lastName) {
          displayName = `${member.firstName} ${member.lastName}`;
        } else if (member.firstName) {
          displayName = member.firstName;
        } else if (member.lastName) {
          displayName = member.lastName;
        } else {
          // If no name fields at all, create a name from email
          const emailParts = member.email.split('@');
          const username = emailParts[0];
          // Convert username to title case (e.g., "john.doe" -> "John Doe")
          displayName = username
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
      }

      // Determine license type - inherit from organization tier if not explicitly set
      let licenseType = member.licenseType;
      if (!licenseType && orgTier) {
        switch (orgTier) {
          case 'ENTERPRISE':
            licenseType = 'ENTERPRISE';
            break;
          case 'PRO':
            licenseType = 'PROFESSIONAL';
            break;
          default:
            licenseType = 'BASIC';
        }
      } else if (!licenseType) {
        licenseType = 'PROFESSIONAL'; // Final fallback
      }

      return {
        id: member.id,
        name: displayName,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        licenseType: licenseType,
        status: member.status,
        organizationId: orgId,
        department: member.department || 'Not assigned',
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        lastActive: member.lastActiveAt || member.updatedAt
      };
    });

    logger.info(`🎯 getLicensedTeamMembers returning: ${transformedMembers.length} members`, {
      excludeProjectId,
      teamMembers: transformedMembers.map(tm => ({ id: tm.id, email: tm.email, name: tm.name, licenseType: tm.licenseType }))
    });

    res.json({ success: true, data: transformedMembers });
  } catch (e: any) {
    logger.error('getLicensedTeamMembers failed', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to get licensed team members' });
  }
});



/**
 * Create Team Member - Account owners can create team members automatically
 * POST /api/team-members/create
 */
router.post('/create', authenticateFirebaseToken, [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('department').optional().trim().custom((value) => {
    // Convert empty string to undefined to prevent Firestore undefined value errors
    if (value === '') {
      return undefined;
    }
    return value;
  }),
  body('licenseType').optional().isIn(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  body('organizationId').isLength({ min: 1, max: 100 }).custom((value) => {
    // More flexible validation - allow common characters used in IDs
    if (!/^[a-zA-Z0-9\-_\.]+$/.test(value)) {
      throw new Error('Organization ID can only contain letters, numbers, hyphens, underscores, and dots');
    }
    return true;
  }),
  body('sendWelcomeEmail').optional().isBoolean(),
  body('temporaryPassword').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Team member creation validation failed', { 
      errors: errors.array(),
      body: req.body,
      userId: (req as any).user?.id 
    });
    throw validationErrorHandler(errors.array());
  }

  const { 
    email, 
    firstName, 
    lastName, 
    department, 
    licenseType, 
    organizationId, 
    sendWelcomeEmail,
    temporaryPassword 
  } = req.body;
  
  const userId = (req as any).user?.id;
  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Verify user has permission to create team members for this organization
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  // Check if user is owner/admin of the organization
  const organization = await firestoreService.getOrganizationById(organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  if (organization.ownerUserId !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions to create team members', 403);
  }

  // Create team member using auto-registration service
  const result = await TeamMemberAutoRegistrationService.createTeamMember({
    email,
    firstName,
    lastName,
    department,
    licenseType: licenseType || 'PROFESSIONAL',
    organizationId,
    createdBy: userId,
    sendWelcomeEmail: sendWelcomeEmail !== false, // Default to true
    temporaryPassword, // Pass the custom password if provided
  });

  if (!result.success) {
    throw createApiError(result.error || 'Failed to create team member', 400);
  }

  logger.info('Team member created successfully', { 
    teamMemberId: result.teamMember?.id,
    email,
    organizationId,
    createdBy: userId 
  });

  res.status(201).json({
    success: true,
    message: 'Team member created successfully',
    data: {
      teamMember: {
        id: result.teamMember?.id,
        email: result.teamMember?.email,
        name: result.teamMember?.name,
        firstName: result.teamMember?.firstName,
        lastName: result.teamMember?.lastName,
        department: result.teamMember?.department,
        licenseType: result.teamMember?.licenseType,
        status: result.teamMember?.status,
        organizationId: result.teamMember?.organizationId,
        createdAt: result.teamMember?.createdAt,
      },
      temporaryPassword: result.temporaryPassword, // Only returned on creation
    }
  });
}));

/**
 * Bulk Create Team Members
 * POST /api/team-members/bulk-create
 */
router.post('/bulk-create', authenticateFirebaseToken, [
  body('teamMembers').isArray({ min: 1, max: 50 }),
  body('teamMembers.*.email').isEmail().normalizeEmail(),
  body('teamMembers.*.firstName').trim().isLength({ min: 1 }),
  body('teamMembers.*.lastName').trim().isLength({ min: 1 }),
  body('teamMembers.*.department').optional().trim(),
  body('teamMembers.*.licenseType').optional().isIn(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  body('organizationId').isLength({ min: 1, max: 50 }).matches(/^[a-zA-Z0-9]+$/),
  body('sendWelcomeEmails').optional().isBoolean(),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { teamMembers, organizationId, sendWelcomeEmails } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Verify permissions (same as single create)
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  const organization = await firestoreService.getOrganizationById(organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  if (organization.ownerUserId !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions to create team members', 403);
  }

  // Prepare requests
  const requests = teamMembers.map((tm: any) => ({
    email: tm.email,
    firstName: tm.firstName,
    lastName: tm.lastName,
    department: tm.department,
    licenseType: tm.licenseType || 'PROFESSIONAL',
    organizationId,
    createdBy: userId,
    sendWelcomeEmail: sendWelcomeEmails !== false,
  }));

  // Create team members
  const results = await TeamMemberAutoRegistrationService.createMultipleTeamMembers(requests);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  logger.info('Bulk team member creation completed', { 
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    organizationId,
    createdBy: userId 
  });

  res.status(201).json({
    success: true,
    message: `Created ${successful.length} of ${results.length} team members`,
    data: {
      successful: successful.map(r => ({
        teamMember: {
          id: r.teamMember?.id,
          email: r.teamMember?.email,
          name: r.teamMember?.name,
          firstName: r.teamMember?.firstName,
          lastName: r.teamMember?.lastName,
          department: r.teamMember?.department,
          licenseType: r.teamMember?.licenseType,
          status: r.teamMember?.status,
          organizationId: r.teamMember?.organizationId,
          createdAt: r.teamMember?.createdAt,
        },
        temporaryPassword: r.temporaryPassword,
      })),
      failed: failed.map(r => ({
        error: r.error,
      })),
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      }
    }
  });
}));

/**
 * Reset Team Member Password
 * POST /api/team-members/:id/reset-password
 */
router.post('/:id/reset-password', authenticateFirebaseToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Get team member
  const teamMember = await firestoreService.getTeamMemberById(id);
  if (!teamMember) {
    throw createApiError('Team member not found', 404);
  }

  // Verify permissions
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  const organization = await firestoreService.getOrganizationById(teamMember.organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  if (organization.ownerUserId !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions', 403);
  }

  // Reset password
  const result = await TeamMemberAutoRegistrationService.resetTeamMemberPassword(id);

  if (!result.success) {
    throw createApiError(result.error || 'Failed to reset password', 400);
  }

  logger.info('Team member password reset', { 
    teamMemberId: id,
    resetBy: userId 
  });

  res.json({
    success: true,
    message: 'Password reset successfully',
    data: {
      temporaryPassword: result.temporaryPassword,
    }
  });
}));

/**
 * Verify Team Member in Firebase Auth
 * POST /api/team-members/:id/verify
 */
router.post('/:id/verify', authenticateFirebaseToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Get team member
  const teamMember = await firestoreService.getTeamMemberById(id);
  if (!teamMember) {
    throw createApiError('Team member not found', 404);
  }

  // Verify permissions
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  const organization = await firestoreService.getOrganizationById(teamMember.organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  if (organization.ownerUserId !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions', 403);
  }

  // Verify in Firebase Auth
  const result = await TeamMemberAutoRegistrationService.verifyTeamMemberInFirebase(id);

  if (!result.success) {
    throw createApiError(result.error || 'Failed to verify team member', 400);
  }

  logger.info('Team member verified in Firebase Auth', { 
    teamMemberId: id,
    verifiedBy: userId 
  });

  res.json({
    success: true,
    message: 'Team member verified successfully',
    data: {
      teamMemberId: id,
      email: teamMember.email,
    }
  });
}));

/**
 * Disable Team Member in Firebase Auth
 * POST /api/team-members/:id/disable
 */
router.post('/:id/disable', authenticateFirebaseToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Get team member
  const teamMember = await firestoreService.getTeamMemberById(id);
  if (!teamMember) {
    throw createApiError('Team member not found', 404);
  }

  // Verify permissions
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  const organization = await firestoreService.getOrganizationById(teamMember.organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  if (organization.ownerUserId !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions', 403);
  }

  // Disable in Firebase Auth
  const result = await TeamMemberAutoRegistrationService.disableTeamMemberInFirebase(id);

  if (!result.success) {
    throw createApiError(result.error || 'Failed to disable team member', 400);
  }

  logger.info('Team member disabled in Firebase Auth', { 
    teamMemberId: id,
    disabledBy: userId 
  });

  res.json({
    success: true,
    message: 'Team member disabled successfully',
    data: {
      teamMemberId: id,
      email: teamMember.email,
    }
  });
}));

/**
 * Enable Team Member in Firebase Auth
 * POST /api/team-members/:id/enable
 */
router.post('/:id/enable', authenticateFirebaseToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Get team member
  const teamMember = await firestoreService.getTeamMemberById(id);
  if (!teamMember) {
    throw createApiError('Team member not found', 404);
  }

  // Verify permissions
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  const organization = await firestoreService.getOrganizationById(teamMember.organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  if (organization.ownerUserId !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions', 403);
  }

  // Enable in Firebase Auth
  const result = await TeamMemberAutoRegistrationService.enableTeamMemberInFirebase(id);

  if (!result.success) {
    throw createApiError(result.error || 'Failed to enable team member', 400);
  }

  logger.info('Team member enabled in Firebase Auth', { 
    teamMemberId: id,
    enabledBy: userId 
  });

  res.json({
    success: true,
    message: 'Team member enabled successfully',
    data: {
      teamMemberId: id,
      email: teamMember.email,
    }
  });
}));

export const teamMembersRouter: ExpressRouter = router;
export default router;

