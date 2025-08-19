import type { Router as ExpressRouter, Request, Response } from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
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
  if (teamMember.hashedPassword) {
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

  // Generate tokens
  const tokens = JwtUtil.generateTokens({ 
    userId: user.id, 
    email: user.email, 
    role: user.role 
  });
  
  // Update last login time
  await firestoreService.updateTeamMember(teamMember.id, { lastLoginAt: new Date() });
  
  // Create audit log
  await ComplianceService.createAuditLog(
    teamMember.id, 
    'LOGIN', 
    'Team member logged in successfully', 
    { email, isTeamMember: true }, 
    requestInfo
  );
  
  logger.info(`Team member logged in successfully: ${email}`, { 
    teamMemberId: teamMember.id, 
    organizationId: teamMember.organizationId 
  });

  // Get team member's project access and licenses
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
      teamMemberData
    }
  });
  return;
}));

// Get licensed team members (available for assignment to projects)
router.get('/licensed', authenticateToken, async (req: any, res) => {
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
router.get('/:id', authenticateToken, async (req: any, res) => {
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
router.get('/getProjectTeamMembers', authenticateToken, async (req: any, res) => {
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
router.get('/getLicensedTeamMembers', authenticateToken, async (req: any, res) => {
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
 * Team Member Authentication - Direct login for team members
 * POST /api/team-members/auth/login
 */
router.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { email, password } = req.body;

  try {
    // Find team member by email using the firestore service
    const teamMember = await firestoreService.getTeamMemberByEmail(email);
    if (!teamMember) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Verify password
    const isValidPassword = await PasswordUtil.compare(password, teamMember.hashedPassword || '');
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const tokenPayload = {
      userId: teamMember.id,
      email: teamMember.email,
      role: teamMember.role,
    };

    const { accessToken, refreshToken } = JwtUtil.generateTokens(tokenPayload);

    // Update last login
    await firestoreService.updateTeamMember(teamMember.id, {
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Team member login successful',
      data: {
        user: {
          id: teamMember.id,
          email: teamMember.email,
          name: teamMember.name || `${teamMember.firstName} ${teamMember.lastName}`.trim(),
          role: teamMember.role,
          licenseType: teamMember.licenseType || 'PROFESSIONAL',
          organizationId: teamMember.organizationId,
        },
        tokens: {
          accessToken,
          refreshToken,
        }
      }
    });

  } catch (error: any) {
    logger.error('Team member authentication failed:', error);
    res.status(500).json({
      success: false,
        error: 'Authentication failed'
    });
  }
}));

/**
 * Create Team Member - Account owners can create team members automatically
 * POST /api/team-members/create
 */
router.post('/create', authenticateToken, [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('department').optional().trim(),
  body('licenseType').optional().isIn(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']),
  body('organizationId').isLength({ min: 1, max: 100 }).custom((value) => {
    // More flexible validation - allow common characters used in IDs
    if (!/^[a-zA-Z0-9\-_\.]+$/.test(value)) {
      throw new Error('Organization ID can only contain letters, numbers, hyphens, underscores, and dots');
    }
    return true;
  }),
  body('sendWelcomeEmail').optional().isBoolean(),
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
    sendWelcomeEmail 
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
router.post('/bulk-create', authenticateToken, [
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
router.post('/:id/reset-password', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
router.post('/:id/verify', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
router.post('/:id/disable', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
router.post('/:id/enable', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

