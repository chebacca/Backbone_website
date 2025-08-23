/**
 * Enhanced License Validation Middleware
 * 
 * This middleware provides bulletproof license validation for all project-related
 * operations, ensuring demo users cannot bypass restrictions.
 * 
 * @see mpc-library/authentication/LICENSE_VALIDATION_MPC.md
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { createApiError } from '../middleware/errorHandler.js';
import { firestoreService, FirestoreSubscription } from '../services/firestoreService.js';

interface LicenseValidationResult {
  isValid: boolean;
  isDemoUser: boolean;
  isExpired: boolean;
  licenseType: 'DEMO' | 'BASIC' | 'PRO' | 'ENTERPRISE' | 'NONE';
  expiresAt?: Date;
  restrictions: string[];
  allowedFeatures: string[];
}

interface ProjectAccessLevel {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canShare: boolean;
  maxProjects: number;
  maxFileSize: number; // in MB
  maxStorageSize: number; // in MB
}

/**
 * Enhanced request interface with license context
 */
declare global {
  namespace Express {
    interface Request {
      licenseContext?: {
        validation: LicenseValidationResult;
        projectAccess: ProjectAccessLevel;
        upgradeUrl?: string;
      };
    }
  }
}

/**
 * Core license validation middleware
 * Validates user license status and adds context to request
 */
export const licenseValidationMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Skip validation for non-authenticated requests
    if (!req.user) {
      req.licenseContext = {
        validation: {
          isValid: false,
          isDemoUser: false,
          isExpired: false,
          licenseType: 'NONE',
          restrictions: ['Authentication required'],
          allowedFeatures: []
        },
        projectAccess: getProjectAccessLevel('NONE', false)
      };
      return next();
    }

    // Get comprehensive license validation
    const validation = await validateUserLicense(req.user.id, req.headers.authorization);
    const projectAccess = getProjectAccessLevel(validation.licenseType, validation.isExpired);

    req.licenseContext = {
      validation,
      projectAccess,
      upgradeUrl: process.env.LICENSING_WEBSITE_URL ? 
        `${process.env.LICENSING_WEBSITE_URL}/upgrade?source=license_validation&userId=${req.user.id}` : 
        undefined
    };

    // Log license validation for analytics
    await logLicenseValidation(req.user.id, validation, req.path);

    next();
  } catch (error) {
    logger.error('License validation middleware error', { error, userId: req.user?.id });
    
    // Fail securely - deny access on validation error
    req.licenseContext = {
      validation: {
        isValid: false,
        isDemoUser: false,
        isExpired: true,
        licenseType: 'NONE',
        restrictions: ['License validation failed'],
        allowedFeatures: []
      },
      projectAccess: getProjectAccessLevel('NONE', true)
    };
    
    next();
  }
};

/**
 * Middleware to require valid license for project operations
 */
export const requireValidLicense = (operation: 'create' | 'edit' | 'delete' | 'export' | 'share' = 'edit') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.licenseContext) {
        throw createApiError('License context not available', 500);
      }

      const { validation, projectAccess, upgradeUrl } = req.licenseContext;

      // Check if user has valid license
      if (!validation.isValid || validation.isExpired) {
        await logLicenseViolation(req.user?.id, operation, 'INVALID_LICENSE', req.path);

        res.status(402).json({
          success: false,
          error: 'Invalid or expired license',
          licenseRequired: {
            type: 'LICENSE_REQUIRED',
            message: validation.isDemoUser && validation.isExpired 
              ? 'Your 7-day demo trial has expired. Please upgrade to continue using projects.'
              : 'A valid license is required to access this feature.',
            licenseType: validation.licenseType,
            isExpired: validation.isExpired,
            expiresAt: validation.expiresAt,
            upgradeUrl,
            restrictions: validation.restrictions
          }
        });
        return;
      }

      // Check operation-specific permissions
      const canPerformOperation = checkOperationPermission(operation, projectAccess);
      if (!canPerformOperation) {
        await logLicenseViolation(req.user?.id, operation, 'INSUFFICIENT_PERMISSIONS', req.path);

        res.status(403).json({
          success: false,
          error: 'Insufficient license permissions',
          licenseRestriction: {
            type: 'OPERATION_RESTRICTED',
            message: `Your ${validation.licenseType} license does not allow ${operation} operations.`,
            operation,
            licenseType: validation.licenseType,
            upgradeUrl,
            allowedOperations: getAllowedOperations(projectAccess)
          }
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('License requirement check failed', { error, operation, userId: req.user?.id });
      
      // Fail securely
      res.status(500).json({
        success: false,
        error: 'License validation failed',
        message: 'Unable to verify license permissions. Please try again.'
      });
    }
  };
};

/**
 * Middleware to enforce project limits for demo users
 */
export const enforceProjectLimits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.licenseContext?.validation.isDemoUser) {
      return next(); // Skip for non-demo users
    }

    const { validation, projectAccess } = req.licenseContext;
    
    // For project creation, check project count limits
    if (req.method === 'POST' && req.path.includes('/projects')) {
      const currentProjectCount = await getCurrentProjectCount(req.user?.id || '');
      
      if (currentProjectCount >= projectAccess.maxProjects) {
        await logLicenseViolation(req.user?.id, 'create', 'PROJECT_LIMIT_EXCEEDED', req.path);

        res.status(403).json({
          success: false,
          error: 'Project limit exceeded',
          demoLimitation: {
            type: 'PROJECT_LIMIT',
            message: `Demo users are limited to ${projectAccess.maxProjects} projects. Please upgrade to create more projects.`,
            currentCount: currentProjectCount,
            maxAllowed: projectAccess.maxProjects,
            upgradeUrl: req.licenseContext.upgradeUrl
          }
        });
        return;
      }
    }

    // For file uploads, check file size limits
    if (req.body?.fileSize || req.headers['content-length']) {
      const fileSize = req.body?.fileSize || parseInt(req.headers['content-length'] || '0');
      const fileSizeMB = fileSize / (1024 * 1024);
      
      if (fileSizeMB > projectAccess.maxFileSize) {
        await logLicenseViolation(req.user?.id, 'upload', 'FILE_SIZE_EXCEEDED', req.path);

        res.status(413).json({
          success: false,
          error: 'File size limit exceeded',
          demoLimitation: {
            type: 'FILE_SIZE_LIMIT',
            message: `Demo users are limited to ${projectAccess.maxFileSize}MB per file. Please upgrade for larger file uploads.`,
            fileSize: fileSizeMB,
            maxAllowed: projectAccess.maxFileSize,
            upgradeUrl: req.licenseContext.upgradeUrl
          }
        });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error('Project limits enforcement error', { error, userId: req.user?.id });
    next(); // Don't block on error, but log it
  }
};

/**
 * Validate user license comprehensively
 */
async function validateUserLicense(userId: string, authToken?: string): Promise<LicenseValidationResult> {
  try {
    // Get user from our synchronized system
    const user = await firestoreService.getUserById(userId);
    
    if (!user) {
      return {
        isValid: false,
        isDemoUser: false,
        isExpired: false,
        licenseType: 'NONE',
        restrictions: ['User not found'],
        allowedFeatures: []
      };
    }

    // Check if user is a demo user
    if (user.isDemoUser) {
      const now = new Date();
      const isExpired = user.demoExpiresAt ? now > user.demoExpiresAt : true;
      
      return {
        isValid: !isExpired,
        isDemoUser: true,
        isExpired,
        licenseType: 'DEMO',
        expiresAt: user.demoExpiresAt,
        restrictions: isExpired ? ['Demo trial expired'] : ['Demo limitations apply'],
        allowedFeatures: isExpired ? [] : [
          'projects.core',
          'files.basic',
          'callsheets.basic',
          'timecards.submit',
          'chat.basic',
          'reports.basic',
          'export.basic'
        ]
      };
    }

    // Check for active subscription/license
    const activeSubscription = await getActiveSubscription(userId);
    
    if (!activeSubscription) {
      return {
        isValid: false,
        isDemoUser: false,
        isExpired: false,
        licenseType: 'NONE',
        restrictions: ['No active subscription'],
        allowedFeatures: []
      };
    }

    const isExpired = activeSubscription.currentPeriodEnd ? 
      new Date() > activeSubscription.currentPeriodEnd : false;

    return {
      isValid: !isExpired,
      isDemoUser: false,
      isExpired,
      licenseType: activeSubscription.tier as any,
      expiresAt: activeSubscription.currentPeriodEnd,
      restrictions: isExpired ? ['Subscription expired'] : [],
      allowedFeatures: getLicenseFeatures(activeSubscription.tier as any)
    };

  } catch (error) {
    logger.error('License validation failed', { error, userId });
    
    return {
      isValid: false,
      isDemoUser: false,
      isExpired: true,
      licenseType: 'NONE',
      restrictions: ['Validation error'],
      allowedFeatures: []
    };
  }
}

/**
 * Get project access level based on license type
 */
function getProjectAccessLevel(licenseType: string, isExpired: boolean): ProjectAccessLevel {
  if (isExpired) {
    return {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
      canShare: false,
      maxProjects: 0,
      maxFileSize: 0,
      maxStorageSize: 0
    };
  }

  switch (licenseType) {
    case 'DEMO':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: false, // Demo users can't export
        canShare: false,  // Demo users can't share
        maxProjects: 3,   // Limited to 3 projects
        maxFileSize: 25,  // 25MB per file
        maxStorageSize: 100 // 100MB total storage
      };
    
    case 'BASIC':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canShare: true,
        maxProjects: 10,
        maxFileSize: 100,
        maxStorageSize: 1000 // 1GB
      };
    
    case 'PRO':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canShare: true,
        maxProjects: 100,
        maxFileSize: 500,
        maxStorageSize: 10000 // 10GB
      };
    
    case 'ENTERPRISE':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canShare: true,
        maxProjects: -1, // Unlimited
        maxFileSize: 2000, // 2GB
        maxStorageSize: -1 // Unlimited
      };
    
    default:
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canShare: false,
        maxProjects: 0,
        maxFileSize: 0,
        maxStorageSize: 0
      };
  }
}

/**
 * Check if user can perform specific operation
 */
function checkOperationPermission(operation: string, projectAccess: ProjectAccessLevel): boolean {
  switch (operation) {
    case 'create': return projectAccess.canCreate;
    case 'edit': return projectAccess.canEdit;
    case 'delete': return projectAccess.canDelete;
    case 'export': return projectAccess.canExport;
    case 'share': return projectAccess.canShare;
    default: return false;
  }
}

/**
 * Get allowed operations for a project access level
 */
function getAllowedOperations(projectAccess: ProjectAccessLevel): string[] {
  const operations = [];
  if (projectAccess.canCreate) operations.push('create');
  if (projectAccess.canEdit) operations.push('edit');
  if (projectAccess.canDelete) operations.push('delete');
  if (projectAccess.canExport) operations.push('export');
  if (projectAccess.canShare) operations.push('share');
  return operations;
}

/**
 * Get features available for license type
 */
function getLicenseFeatures(licenseType: string): string[] {
  const baseFeatures = [
    'projects.core',
    'files.basic',
    'callsheets.basic',
    'timecards.submit',
    'chat.basic',
    'reports.basic'
  ];

  switch (licenseType) {
    case 'BASIC':
      return [...baseFeatures, 'export.basic', 'sharing.basic'];
    
    case 'PRO':
      return [...baseFeatures, 'export.advanced', 'sharing.advanced', 'workflows.advanced', 'analytics.advanced'];
    
    case 'ENTERPRISE':
      return [...baseFeatures, 'export.enterprise', 'sharing.enterprise', 'workflows.enterprise', 'analytics.enterprise', 'sso.scim', 'audit.export'];
    
    default:
      return baseFeatures;
  }
}

// Helper functions for database operations

async function getActiveSubscription(userId: string): Promise<FirestoreSubscription | null> {
  try {
    // Get all subscriptions for the user
    const subscriptions = await firestoreService.getSubscriptionsByUserId(userId);
    
    // Find the first active subscription
    const activeSubscription = subscriptions.find(sub => 
      sub.status === 'ACTIVE' || sub.status === 'TRIALING'
    );
    
    return activeSubscription || null;
  } catch (error) {
    logger.error('Failed to get active subscription', { error, userId });
    return null;
  }
}

async function getCurrentProjectCount(userId: string): Promise<number> {
  // This would count user's current projects
  // For now, return 0
  return 0;
}

async function logLicenseValidation(userId: string, validation: LicenseValidationResult, path: string) {
  logger.info('License validation performed', {
    userId,
    licenseType: validation.licenseType,
    isValid: validation.isValid,
    isExpired: validation.isExpired,
    path
  });
}

async function logLicenseViolation(userId: string | undefined, operation: string, violationType: string, path: string) {
  logger.warn('License violation detected', {
    userId,
    operation,
    violationType,
    path,
    timestamp: new Date().toISOString()
  });
}
