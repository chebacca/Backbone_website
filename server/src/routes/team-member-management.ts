/**
 * Enhanced Team Member Management Routes
 * 
 * Provides comprehensive team member management including:
 * - Complete removal with cleanup and license restoration
 * - Email uniqueness validation within organizations
 * - Multi-tenant email support
 */

import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken, authenticateFirebaseToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiError } from '../utils/apiError.js';
import { validationErrorHandler } from '../utils/validation.js';
import TeamMemberCleanupService from '../services/teamMemberCleanupService.js';
import EmailValidationService from '../services/emailValidationService.js';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';

const router: express.Router = express.Router();

/**
 * POST /api/team-members/remove-completely
 * Comprehensive team member removal with full cleanup and license restoration
 */
router.post('/remove-completely', authenticateFirebaseToken, [
  body('teamMemberId').isLength({ min: 1 }).withMessage('Team member ID is required'),
  body('organizationId').isLength({ min: 1 }).withMessage('Organization ID is required')
], asyncHandler(async (req: any, res: express.Response) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    throw validationErrorHandler(validationErrors.array());
  }

  const { teamMemberId, organizationId } = req.body;
  const removedBy = req.user?.id;

  if (!removedBy) {
    throw createApiError('Authentication required', 401);
  }

  logger.info('Team member removal requested', {
    teamMemberId,
    organizationId,
    removedBy
  });

  // Validate user has permission to remove team members
  const user = await firestoreService.getUserById(removedBy);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  // Check if user is owner/admin of the organization
  const organization = await firestoreService.getOrganizationById(organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  logger.info('Authorization check for team member removal', {
    userId: removedBy,
    userEmail: user.email,
    userRole: user.role,
    userOrgId: user.organizationId,
    organizationId,
    organizationOwner: organization.ownerUserId,
    organizationName: organization.name,
    isOwner: organization.ownerUserId === removedBy,
    isOwnerByEmail: organization.ownerUserId === user.email,
    isAdmin: ['ADMIN', 'SUPERADMIN', 'admin', 'owner'].includes(user.role)
  });

  // Enhanced permission check - allow organization owner, admins, or superadmins
  const isOwner = organization.ownerUserId === removedBy || organization.ownerUserId === user.email;
  const isAdmin = ['ADMIN', 'SUPERADMIN', 'admin', 'owner'].includes(user.role);
  const hasOrgAdminRole = user.organizationId === organizationId && ['ADMIN', 'admin', 'owner'].includes(user.role);

  if (!isOwner && !isAdmin && !hasOrgAdminRole) {
    logger.warn('Authorization failed for team member removal', {
      userId: removedBy,
      userRole: user.role,
      organizationId,
      organizationOwner: organization.ownerUserId,
      reason: 'User is not owner, admin, or organization admin'
    });
    throw createApiError('Insufficient permissions to remove team members. You must be the organization owner or an admin.', 403);
  }

  // 🔧 CRITICAL: Prevent removing account owners
  if (organization.ownerUserId === teamMemberId) {
    throw createApiError('Cannot remove account owner. Account owners cannot be removed from their own organization.', 400);
  }

  // Validate removal is safe
  const removalValidation = await TeamMemberCleanupService.validateRemoval(teamMemberId, organizationId);
  
  if (!removalValidation.canRemove) {
    throw createApiError(
      `Cannot remove team member: ${removalValidation.blockers.join(', ')}`, 
      400
    );
  }

  // Perform comprehensive removal
  const result = await TeamMemberCleanupService.removeTeamMemberCompletely(
    teamMemberId,
    organizationId,
    removedBy
  );

  if (!result.success) {
    throw createApiError(result.error || 'Failed to remove team member', 500);
  }

  logger.info('Team member removal completed successfully', {
    teamMemberId,
    organizationId,
    removedBy,
    result
  });

  res.json({
    success: true,
    message: 'Team member removed successfully with complete cleanup',
    data: {
      cleanedCollections: result.cleanedCollections,
      licenseRestored: result.licenseRestored,
      firebaseUserDeleted: result.firebaseUserDeleted
    },
    warnings: removalValidation.warnings
  });
}));

/**
 * POST /api/team-members/validate-removal
 * Validate if a team member can be safely removed
 */
router.post('/validate-removal', authenticateFirebaseToken, [
  body('teamMemberId').isLength({ min: 1 }).withMessage('Team member ID is required'),
  body('organizationId').isLength({ min: 1 }).withMessage('Organization ID is required')
], asyncHandler(async (req: any, res: express.Response) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    throw validationErrorHandler(validationErrors.array());
  }

  const { teamMemberId, organizationId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Validate user has permission
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  const organization = await firestoreService.getOrganizationById(organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  // Enhanced permission check - allow organization owner, admins, or superadmins
  const isOwner = organization.ownerUserId === userId || organization.ownerUserId === user.email;
  const isAdmin = ['ADMIN', 'SUPERADMIN', 'admin', 'owner'].includes(user.role);
  const hasOrgAdminRole = user.organizationId === organizationId && ['ADMIN', 'admin', 'owner'].includes(user.role);

  if (!isOwner && !isAdmin && !hasOrgAdminRole) {
    throw createApiError('Insufficient permissions', 403);
  }

  const removalValidation = await TeamMemberCleanupService.validateRemoval(teamMemberId, organizationId);

  res.json({
    success: true,
    data: removalValidation
  });
}));

/**
 * POST /api/team-members/validate-email
 * Validate email uniqueness within organization
 */
router.post('/validate-email', authenticateFirebaseToken, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('organizationId').isLength({ min: 1 }).withMessage('Organization ID is required'),
  body('excludeUserId').optional().isLength({ min: 1 })
], asyncHandler(async (req: any, res: express.Response) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    throw validationErrorHandler(validationErrors.array());
  }

  const { email, organizationId, excludeUserId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  logger.info('Email validation requested', {
    email,
    organizationId,
    excludeUserId,
    requestedBy: userId
  });

  // Validate user has permission to add team members to this organization
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  const organization = await firestoreService.getOrganizationById(organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  if (organization.ownerUserId !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions to manage team members', 403);
  }

  // Perform comprehensive email validation
  const emailValidation = await EmailValidationService.validateTeamMemberEmail(
    email,
    organizationId,
    excludeUserId
  );

  logger.info('Email validation completed', {
    email,
    organizationId,
    result: emailValidation
  });

  res.json({
    success: true,
    data: emailValidation
  });
}));

/**
 * GET /api/team-members/email-check/:email
 * Global email check (informational only)
 */
router.get('/email-check/:email', authenticateToken, [
  param('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], asyncHandler(async (req: any, res: express.Response) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    throw validationErrorHandler(validationErrors.array());
  }

  const { email } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Only allow admins to perform global email checks
  const user = await firestoreService.getUserById(userId);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    throw createApiError('Insufficient permissions for global email check', 403);
  }

  const globalCheck = await EmailValidationService.checkEmailGlobally(email);

  res.json({
    success: true,
    data: globalCheck
  });
}));

/**
 * POST /api/team-members/bulk-validate-emails
 * Validate multiple emails for bulk operations
 */
router.post('/bulk-validate-emails', authenticateToken, [
  body('emails').isArray({ min: 1 }).withMessage('Emails array is required'),
  body('emails.*').isEmail().normalizeEmail().withMessage('All emails must be valid'),
  body('organizationId').isLength({ min: 1 }).withMessage('Organization ID is required')
], asyncHandler(async (req: any, res: express.Response) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    throw validationErrorHandler(validationErrors.array());
  }

  const { emails, organizationId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw createApiError('Authentication required', 401);
  }

  // Validate permissions
  const user = await firestoreService.getUserById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  const organization = await firestoreService.getOrganizationById(organizationId);
  if (!organization) {
    throw createApiError('Organization not found', 404);
  }

  if (organization.ownerUserId !== userId && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions', 403);
  }

  // Validate each email
  const results = await Promise.all(
    emails.map(async (email: string) => {
      const validation = await EmailValidationService.validateTeamMemberEmail(
        email,
        organizationId
      );
      
      return {
        email,
        ...validation
      };
    })
  );

  const validEmails = results.filter(r => r.canProceed);
  const invalidEmails = results.filter(r => !r.canProceed);

  res.json({
    success: true,
    data: {
      totalEmails: emails.length,
      validEmails: validEmails.length,
      invalidEmails: invalidEmails.length,
      results,
      summary: {
        canProceedWith: validEmails.map(r => r.email),
        blocked: invalidEmails.map(r => ({ email: r.email, errors: r.errors }))
      }
    }
  });
}));

export default router;
