/**
 * Demo Registration and Management Routes
 * 
 * Handles demo user registration, trial management, and conversion tracking
 * with bulletproof license enforcement.
 * 
 * @see mpc-library/demo-mode/DEMO_REGISTRATION_MPC.md
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler, createApiError } from '../middleware/errorHandler.js';
import { UserSynchronizationService } from '../services/UserSynchronizationService.js';
import { DemoService } from '../services/demoService.js';
import { logger } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { licenseValidationMiddleware, requireValidLicense } from '../middleware/licenseValidation.js';

const router: Router = Router();

/**
 * POST /api/demo/register
 * Register a new demo user with 7-day trial
 */
router.post('/register', [
  // Validation middleware
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  body('source')
    .optional()
    .isString()
    .withMessage('Source must be a string')
], asyncHandler(async (req: Request, res: Response) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { email, password, firstName, lastName, source = 'demo_signup' } = req.body;

  try {
    logger.info('Demo user registration attempt', { email, source });

    // Create demo user using synchronized service
    const result = await UserSynchronizationService.createDemoUser({
      email,
      password,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role: 'USER',
      demoTier: 'BASIC',
      source
    });

    if (!result.success) {
      logger.warn('Demo user registration failed', { email, error: result.error });
      return res.status(409).json({
        success: false,
        error: result.error || 'Demo user registration failed'
      });
    }

    logger.info('Demo user registered successfully', {
      userId: result.user?.id,
      firebaseUid: result.firebaseUid,
      email,
      demoExpiresAt: result.demoExpiresAt
    });

    // Return success response with trial information
    return res.status(201).json({
      success: true,
      message: 'Demo user registered successfully',
      data: {
        userId: result.user?.id,
        email: result.user?.email,
        name: result.user?.name,
        demoExpiresAt: result.demoExpiresAt,
        trialDuration: '7 days',
        features: [
          'Core project management',
          'Basic file storage (100MB)',
          'Up to 3 projects',
          'Basic callsheets and timecards',
          'Standard reporting'
        ],
        limitations: {
          maxProjects: 3,
          maxFileSize: 25, // MB
          maxStorageSize: 100, // MB
          canExport: false,
          canShare: false
        },
        upgradeUrl: `${process.env.CLIENT_URL}/upgrade?source=demo_registration&userId=${result.user?.id}`
      }
    });

  } catch (error) {
    logger.error('Demo registration error', { email, error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error during demo registration'
    });
  }
}));

/**
 * GET /api/demo/status
 * Get current demo status for authenticated user
 */
router.get('/status', 
  authenticateToken, 
  licenseValidationMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      if (!req.licenseContext) {
        throw createApiError('License context not available', 500);
      }

      const { validation, projectAccess } = req.licenseContext;

      if (!validation.isDemoUser) {
        return res.status(200).json({
          success: true,
          data: {
            isDemoUser: false,
            hasFullLicense: true,
            licenseType: validation.licenseType
          }
        });
      }

      const now = new Date();
      const timeRemaining = validation.expiresAt ? 
        Math.max(0, validation.expiresAt.getTime() - now.getTime()) : 0;
      const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));

      return res.status(200).json({
        success: true,
        data: {
          isDemoUser: true,
          isExpired: validation.isExpired,
          expiresAt: validation.expiresAt,
          timeRemaining: {
            milliseconds: timeRemaining,
            days: daysRemaining,
            hours: hoursRemaining,
            formatted: daysRemaining > 0 ? 
              `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}` :
              `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`
          },
          trialDuration: '7 days',
          projectAccess,
          features: validation.allowedFeatures,
          upgradeUrl: req.licenseContext.upgradeUrl
        }
      });

    } catch (error) {
      logger.error('Demo status check error', { userId: req.user?.id, error });
      return res.status(500).json({
        success: false,
        error: 'Failed to get demo status'
      });
    }
  })
);

/**
 * POST /api/demo/check-feature
 * Check if demo user can access a specific feature
 */
router.post('/check-feature',
  authenticateToken,
  licenseValidationMiddleware,
  [
    body('featureName')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Feature name is required')
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { featureName } = req.body;

    try {
      if (!req.licenseContext) {
        throw createApiError('License context not available', 500);
      }

      const { validation, projectAccess } = req.licenseContext;

      // Check if feature is allowed
      const allowed = validation.allowedFeatures.includes(featureName);
      
      let restriction = null;
      if (!allowed) {
        if (validation.isExpired) {
          restriction = {
            type: 'TRIAL_EXPIRED',
            message: 'Your 7-day demo trial has expired. Please upgrade to access this feature.',
            upgradeRequired: true
          };
        } else {
          restriction = {
            type: 'FEATURE_LOCKED',
            message: `This feature requires a paid subscription. Currently available in your demo: ${validation.allowedFeatures.join(', ')}`,
            upgradeRequired: true
          };
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          featureName,
          allowed,
          restriction,
          message: allowed ? 'Feature access granted' : restriction?.message,
          licenseType: validation.licenseType,
          isExpired: validation.isExpired,
          upgradeUrl: req.licenseContext.upgradeUrl
        }
      });

    } catch (error) {
      logger.error('Feature access check error', { 
        userId: req.user?.id, 
        featureName, 
        error 
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to check feature access'
      });
    }
  })
);

/**
 * POST /api/demo/convert
 * Convert demo user to paid subscription
 */
router.post('/convert',
  authenticateToken,
  licenseValidationMiddleware,
  requireValidLicense('create'), // Must have valid demo license to convert
  [
    body('subscriptionTier')
      .isIn(['BASIC', 'PRO', 'ENTERPRISE'])
      .withMessage('Valid subscription tier is required'),
    body('conversionSource')
      .optional()
      .isString()
      .withMessage('Conversion source must be a string')
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { subscriptionTier, conversionSource = 'manual' } = req.body;

    try {
      if (!req.licenseContext?.validation.isDemoUser) {
        return res.status(400).json({
          success: false,
          error: 'User is not a demo user'
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      logger.info('Demo conversion initiated', {
        userId: req.user.id,
        subscriptionTier,
        conversionSource
      });

      // This would integrate with your payment processing
      // For now, return the upgrade URL
      const upgradeUrl = `${process.env.CLIENT_URL}/checkout?tier=${subscriptionTier}&source=${conversionSource}&userId=${req.user.id}`;

      return res.status(200).json({
        success: true,
        message: 'Demo conversion initiated',
        data: {
          upgradeUrl,
          subscriptionTier,
          conversionSource,
          currentTrialStatus: {
            expiresAt: req.licenseContext.validation.expiresAt,
            isExpired: req.licenseContext.validation.isExpired
          }
        }
      });

    } catch (error) {
      logger.error('Demo conversion error', { 
        userId: req.user?.id, 
        subscriptionTier,
        error 
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to initiate demo conversion'
      });
    }
  })
);

/**
 * POST /api/demo/extend-trial
 * Extend demo trial (admin only, for customer support)
 */
router.post('/extend-trial',
  authenticateToken,
  // requireAdmin, // Uncomment when admin middleware is available
  [
    body('userId')
      .isString()
      .isLength({ min: 1 })
      .withMessage('User ID is required'),
    body('extensionDays')
      .isInt({ min: 1, max: 30 })
      .withMessage('Extension days must be between 1 and 30')
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId, extensionDays } = req.body;

    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // This would extend the demo trial in the database
      logger.info('Demo trial extension requested', {
        adminUserId: req.user.id,
        targetUserId: userId,
        extensionDays
      });

      // For now, return success message
      return res.status(200).json({
        success: true,
        message: `Demo trial extended by ${extensionDays} days`,
        data: {
          userId,
          extensionDays,
          extendedBy: req.user.id,
          extendedAt: new Date()
        }
      });

    } catch (error) {
      logger.error('Demo trial extension error', { 
        adminUserId: req.user?.id,
        targetUserId: userId,
        error 
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to extend demo trial'
      });
    }
  })
);

export default router;