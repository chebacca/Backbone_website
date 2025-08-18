import express from 'express';
import { body, validationResult } from 'express-validator';
import { DemoService } from '../services/demoService.js';
import { firestoreService } from '../services/firestoreService.js';
import { ComplianceService } from '../services/complianceService.js';
import { logger } from '../utils/logger.js';
import { createApiError, validationErrorHandler } from '../middleware/errorHandler.js';
import { addRequestInfo } from '../middleware/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';
import { asyncHandler } from '../middleware/errorHandler.js';
import type { Request, Response } from 'express';

const router: express.Router = express.Router();

// Rate limiting for demo registration (more restrictive)
const demoRegistrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 demo registration attempts per windowMs
  message: 'Too many demo registration attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for demo status checks
const demoStatusLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 status check requests per windowMs
  message: 'Too many demo status requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Add request info to all demo routes
router.use(addRequestInfo);

/**
 * POST /api/demo/register
 * Register a new demo user with 14-day Basic tier trial
 */
router.post('/register', [
  demoRegistrationLimiter,
  body('email').isEmail().normalizeEmail(),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('acceptTerms').custom((v) => v === true || v === 'true').withMessage('Must accept terms of service'),
  body('acceptPrivacy').custom((v) => v === true || v === 'true').withMessage('Must accept privacy policy'),
  body('referralSource').optional().trim().isLength({ max: 255 }),
  body('utmSource').optional().trim().isLength({ max: 100 }),
  body('utmCampaign').optional().trim().isLength({ max: 100 }),
  body('utmMedium').optional().trim().isLength({ max: 100 }),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { email, name, password, referralSource, utmSource, utmCampaign, utmMedium } = req.body;
  const requestInfo = (req as any).requestInfo;

  try {
    logger.info(`Demo registration attempt for: ${email}`, { 
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      referralSource,
      utm: { utmSource, utmCampaign, utmMedium }
    });

    // Check if user already has an account (demo or full)
    const existingUser = await firestoreService.getUserByEmail(email);
    if (existingUser && !existingUser.isDemoUser) {
      throw createApiError('User already exists with a full account. Please log in instead.', 409);
    }

    if (existingUser && existingUser.isDemoUser) {
      // Check for active demo session
      const demoStatus = await DemoService.getDemoStatus(existingUser.id);
      if (demoStatus && demoStatus.status === 'ACTIVE') {
        throw createApiError('You already have an active demo session. Check your email for login details.', 409);
      }
    }

    // Register demo user
    const { user, demoSession } = await DemoService.registerDemoUser({
      email,
      name,
      password,
      ipAddress: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      referralSource,
      utmSource,
      utmCampaign,
      utmMedium,
    });

    // Record compliance consent
    await ComplianceService.recordConsent(
      user.id,
      'DEMO_TERMS_OF_SERVICE',
      true,
      '1.0',
      requestInfo.ip,
      requestInfo.userAgent
    );

    await ComplianceService.recordConsent(
      user.id,
      'DEMO_PRIVACY_POLICY',
      true,
      '1.0',
      requestInfo.ip,
      requestInfo.userAgent
    );

    // Create audit log
    await ComplianceService.createAuditLog(
      user.id,
      'DEMO_REGISTER',
      'Demo user registered successfully',
      {
        email,
        sessionId: demoSession.sessionId,
        trialDays: 14,
        tier: 'BASIC',
        referralSource,
        utm: { utmSource, utmCampaign, utmMedium }
      },
      requestInfo
    );

    logger.info(`Demo registration successful for: ${email}`, {
      userId: user.id,
      sessionId: demoSession.sessionId,
      expiresAt: demoSession.expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'Demo trial registration successful! Check your email for next steps.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isDemoUser: true,
        },
        demo: {
          sessionId: demoSession.sessionId,
          tier: demoSession.tier,
          expiresAt: demoSession.expiresAt,
          trialDays: 14,
          featuresIncluded: [
            'projects.core',
            'files.basic',
            'callsheets.basic',
            'timecards.submit',
            'chat.basic',
            'reports.basic',
            'export.basic'
          ]
        }
      }
    });
  } catch (error) {
    logger.error('Demo registration failed', { email, error });
    throw error;
  }
}));

/**
 * GET /api/demo/status
 * Get current demo session status and countdown information
 * Requires authentication
 */
router.get('/status', [
  demoStatusLimiter,
  authenticateToken
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  if (!user) {
    throw createApiError('Authentication required', 401);
  }

  try {
    const demoStatus = await DemoService.getDemoStatus(user.id);

    if (!demoStatus) {
      res.status(200).json({
        success: true,
        data: {
          isDemoUser: false,
          message: 'User does not have a demo account'
        }
      });
      return;
    }

    const now = Date.now();
    const expiresAt = new Date(demoStatus.timeRemaining + now);
    const daysRemaining = Math.ceil(demoStatus.timeRemaining / (24 * 60 * 60 * 1000));
    const hoursRemaining = Math.ceil(demoStatus.timeRemaining / (60 * 60 * 1000));

    res.status(200).json({
      success: true,
      data: {
        isDemoUser: true,
        status: demoStatus.status,
        sessionId: demoStatus.sessionId,
        tier: demoStatus.tier,
        timeRemaining: demoStatus.timeRemaining,
        expiresAt: expiresAt.toISOString(),
        daysRemaining: Math.max(0, daysRemaining),
        hoursRemaining: Math.max(0, hoursRemaining),
        isExpired: demoStatus.status === 'EXPIRED' || demoStatus.timeRemaining <= 0,
        canUpgrade: demoStatus.canUpgrade,
        featuresAccessed: demoStatus.featuresAccessed,
        restrictionsHit: demoStatus.restrictionsHit,
        countdown: {
          days: Math.max(0, Math.floor(daysRemaining)),
          hours: Math.max(0, Math.floor(hoursRemaining % 24)),
          minutes: Math.max(0, Math.floor((demoStatus.timeRemaining / (60 * 1000)) % 60)),
          seconds: Math.max(0, Math.floor((demoStatus.timeRemaining / 1000) % 60))
        }
      }
    });

    logger.info(`Demo status checked`, {
      userId: user.id,
      status: demoStatus.status,
      timeRemaining: demoStatus.timeRemaining,
      daysRemaining
    });
  } catch (error) {
    logger.error('Failed to get demo status', { userId: user.id, error });
    throw error;
  }
}));

/**
 * POST /api/demo/check-feature
 * Check if user can access a specific feature and enforce restrictions
 * Requires authentication
 */
router.post('/check-feature', [
  authenticateToken,
  body('featureName').notEmpty().trim().isLength({ min: 1, max: 100 })
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const user = (req as any).user;
  const { featureName } = req.body;

  if (!user) {
    throw createApiError('Authentication required', 401);
  }

  try {
    const accessResult = await DemoService.checkFeatureAccess(user.id, featureName);

    res.status(200).json({
      success: true,
      data: {
        featureName,
        allowed: accessResult.allowed,
        restriction: accessResult.restriction || null,
        message: accessResult.allowed 
          ? 'Feature access granted' 
          : accessResult.restriction?.message || 'Feature access denied'
      }
    });

    logger.info(`Feature access checked`, {
      userId: user.id,
      featureName,
      allowed: accessResult.allowed,
      restriction: accessResult.restriction?.type
    });
  } catch (error) {
    logger.error('Failed to check feature access', { userId: user.id, featureName, error });
    throw error;
  }
}));

/**
 * POST /api/demo/convert
 * Convert demo user to paid subscription
 * Requires authentication
 */
router.post('/convert', [
  authenticateToken,
  body('subscriptionId').notEmpty().trim().isUUID(),
  body('conversionSource').notEmpty().isIn(['COUNTDOWN_TIMER', 'FEATURE_RESTRICTION', 'UPGRADE_PROMPT', 'EMAIL_CAMPAIGN', 'MANUAL'])
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const user = (req as any).user;
  const { subscriptionId, conversionSource } = req.body;
  const requestInfo = (req as any).requestInfo;

  if (!user) {
    throw createApiError('Authentication required', 401);
  }

  try {
    // Verify subscription exists and belongs to user
    const subscription = await firestoreService.getSubscriptionById(subscriptionId);
    if (!subscription || subscription.userId !== user.id) {
      throw createApiError('Invalid subscription', 400);
    }

    // Convert demo user
    await DemoService.convertDemoUser(user.id, subscriptionId, conversionSource);

    // Create audit log
    await ComplianceService.createAuditLog(
      user.id,
      'DEMO_CONVERT',
      'Demo user converted to paid subscription',
      {
        subscriptionId,
        conversionSource,
        tier: subscription.tier
      },
      requestInfo
    );

    logger.info(`Demo user converted successfully`, {
      userId: user.id,
      subscriptionId,
      conversionSource,
      tier: subscription.tier
    });

    res.status(200).json({
      success: true,
      message: 'Demo user converted successfully! Welcome to full access.',
      data: {
        subscriptionId,
        tier: subscription.tier,
        status: 'converted',
        fullAccessActive: true
      }
    });
  } catch (error) {
    logger.error('Failed to convert demo user', { 
      userId: user.id, 
      subscriptionId, 
      conversionSource, 
      error 
    });
    throw error;
  }
}));

/**
 * POST /api/demo/activity
 * Log demo user activity (for analytics and tracking)
 * Requires authentication
 */
router.post('/activity', [
  authenticateToken,
  body('activityType').notEmpty().trim().isIn([
    'LOGIN', 'FEATURE_ACCESS', 'RESTRICTION_HIT', 'UPGRADE_PROMPT_SHOWN', 
    'CONVERSION_ATTEMPT', 'FILE_UPLOAD', 'PROJECT_CREATED', 'REPORT_GENERATED'
  ]),
  body('featureName').optional().trim().isLength({ max: 100 }),
  body('metadata').optional().isObject()
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const user = (req as any).user;
  const { activityType, featureName, metadata } = req.body;
  const requestInfo = (req as any).requestInfo;

  if (!user) {
    throw createApiError('Authentication required', 401);
  }

  try {
    // Get active demo session
    const demoStatus = await DemoService.getDemoStatus(user.id);
    if (!demoStatus || demoStatus.status !== 'ACTIVE') {
      // Not a demo user or demo expired, but don't throw error
      res.status(200).json({
        success: true,
        message: 'Activity logged (non-demo user)'
      });
      return;
    }

    // Log activity through internal method
    await (DemoService as any).logDemoActivity({
      userId: user.id,
      demoSessionId: demoStatus.sessionId,
      activityType,
      featureName,
      metadata,
      ipAddress: requestInfo.ip,
      userAgent: requestInfo.userAgent,
    });

    res.status(200).json({
      success: true,
      message: 'Demo activity logged successfully'
    });

    logger.info(`Demo activity logged`, {
      userId: user.id,
      activityType,
      featureName,
      sessionId: demoStatus.sessionId
    });
  } catch (error) {
    logger.error('Failed to log demo activity', { 
      userId: user.id, 
      activityType, 
      featureName, 
      error 
    });
    // Don't throw error for activity logging failures
    res.status(200).json({
      success: true,
      message: 'Activity logging failed but request processed'
    });
  }
}));

/**
 * GET /api/demo/analytics
 * Get demo analytics for the current user (for personalized insights)
 * Requires authentication
 */
router.get('/analytics', [
  authenticateToken
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  if (!user) {
    throw createApiError('Authentication required', 401);
  }

  try {
    const userRecord = await firestoreService.getUserById(user.id);
    if (!userRecord || !userRecord.isDemoUser) {
      res.status(200).json({
        success: true,
        data: {
          isDemoUser: false,
          message: 'Analytics not available for non-demo users'
        }
      });
      return;
    }

    // Get demo session info
    const demoStatus = await DemoService.getDemoStatus(user.id);
    
    res.status(200).json({
      success: true,
      data: {
        isDemoUser: true,
        analytics: {
          sessionCount: userRecord.demoSessionCount || 0,
          appUsageMinutes: userRecord.demoAppUsageMinutes || 0,
          featuresUsed: userRecord.demoFeaturesUsed || [],
          remindersSent: userRecord.demoRemindersSent || 0,
          lastActivityAt: userRecord.demoLastActivityAt,
          demoStartedAt: userRecord.demoStartedAt,
          demoExpiresAt: userRecord.demoExpiresAt,
          currentSession: demoStatus ? {
            sessionId: demoStatus.sessionId,
            status: demoStatus.status,
            featuresAccessed: demoStatus.featuresAccessed,
            restrictionsHit: demoStatus.restrictionsHit,
            timeRemaining: demoStatus.timeRemaining
          } : null
        }
      }
    });

    logger.info(`Demo analytics retrieved`, {
      userId: user.id,
      sessionCount: userRecord.demoSessionCount,
      featuresUsed: userRecord.demoFeaturesUsed?.length || 0
    });
  } catch (error) {
    logger.error('Failed to get demo analytics', { userId: user.id, error });
    throw error;
  }
}));

/**
 * POST /api/demo/extend-trial
 * Extend demo trial (admin function or special cases)
 * Requires authentication and special permissions
 */
router.post('/extend-trial', [
  authenticateToken,
  body('additionalDays').isInt({ min: 1, max: 30 }),
  body('reason').notEmpty().trim().isLength({ min: 5, max: 255 })
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const user = (req as any).user;
  const { additionalDays, reason } = req.body;
  const requestInfo = (req as any).requestInfo;

  if (!user) {
    throw createApiError('Authentication required', 401);
  }

  // Check if user has admin permissions or is extending their own trial under special conditions
  if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
    throw createApiError('Insufficient permissions to extend trial', 403);
  }

  try {
    const targetUser = await firestoreService.getUserById(user.id);
    if (!targetUser || !targetUser.isDemoUser) {
      throw createApiError('User is not a demo user', 400);
    }

    const currentExpiresAt = new Date(targetUser.demoExpiresAt!);
    const newExpiresAt = new Date(currentExpiresAt.getTime() + (additionalDays * 24 * 60 * 60 * 1000));

    // Update user demo expiration
    await firestoreService.updateUser(user.id, {
      demoExpiresAt: newExpiresAt,
      updatedAt: new Date(),
    });

    // Update active demo session if exists
    const demoStatus = await DemoService.getDemoStatus(user.id);
    if (demoStatus && demoStatus.status === 'ACTIVE') {
      await (DemoService as any).updateDemoSession(demoStatus.sessionId, {
        expiresAt: newExpiresAt
      });
    }

    // Create audit log
    await ComplianceService.createAuditLog(
      user.id,
      'DEMO_EXTEND',
      'Demo trial extended',
      {
        additionalDays,
        reason,
        oldExpiresAt: currentExpiresAt.toISOString(),
        newExpiresAt: newExpiresAt.toISOString(),
        extendedBy: user.email
      },
      requestInfo
    );

    logger.info(`Demo trial extended`, {
      userId: user.id,
      additionalDays,
      reason,
      newExpiresAt: newExpiresAt.toISOString()
    });

    res.status(200).json({
      success: true,
      message: `Demo trial extended by ${additionalDays} day${additionalDays === 1 ? '' : 's'}`,
      data: {
        newExpiresAt: newExpiresAt.toISOString(),
        additionalDays,
        reason
      }
    });
  } catch (error) {
    logger.error('Failed to extend demo trial', { 
      userId: user.id, 
      additionalDays, 
      reason, 
      error 
    });
    throw error;
  }
}));

export default router;
