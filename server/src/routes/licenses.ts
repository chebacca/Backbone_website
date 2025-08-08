import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { LicenseService } from '../services/licenseService.js';
import { ComplianceService } from '../services/complianceService.js';
import { 
  asyncHandler, 
  validationErrorHandler, 
  createApiError 
} from '../middleware/errorHandler.js';
import { 
  authenticateToken, 
  requireEmailVerification,
  addRequestInfo,
  validateLicenseOwnership,
  optionalAuth 
} from '../middleware/auth.js';

const router: Router = Router();

// Add request info to all license routes
router.use(addRequestInfo);

/**
 * Get user's licenses
 */
router.get('/my-licenses', [
  authenticateToken,
  requireEmailVerification,
], asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const licenses = await LicenseService.getUserLicenses(userId);

  res.json({
    success: true,
    data: { licenses },
  });
}));

/**
 * Activate a license
 */
router.post('/activate', [
  body('licenseKey').trim().notEmpty().withMessage('License key required'),
  body('deviceInfo.platform').trim().notEmpty().withMessage('Platform required'),
  body('deviceInfo.version').trim().notEmpty().withMessage('Version required'),
  body('deviceInfo.deviceId').trim().notEmpty().withMessage('Device ID required'),
  body('deviceInfo.deviceName').optional().trim(),
  body('deviceInfo.architecture').optional().trim(),
  body('deviceInfo.osVersion').optional().trim(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { licenseKey, deviceInfo } = req.body;
  const requestInfo = (req as any).requestInfo;

  const result = await LicenseService.activateLicense(
    licenseKey,
    deviceInfo,
    requestInfo
  );

  res.json({
    success: true,
    message: result.message,
    data: {
      license: result.license,
      cloudConfig: result.cloudConfig,
    },
  });
}));

/**
 * Deactivate a license
 */
router.post('/deactivate', [
  authenticateToken,
  requireEmailVerification,
  validateLicenseOwnership,
  body('licenseKey').trim().notEmpty().withMessage('License key required'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long'),
], asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey, reason } = req.body;
  const userId = req.user!.id;

  const result = await LicenseService.deactivateLicense(
    licenseKey,
    userId,
    reason
  );

  res.json({
    success: true,
    message: result.message,
  });
}));

/**
 * Validate a license (public endpoint for software to check)
 */
router.post('/validate', [
  body('licenseKey').trim().notEmpty().withMessage('License key required'),
  body('deviceInfo').optional().isObject().withMessage('Invalid device info'),
], asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey, deviceInfo } = req.body;
  const requestInfo = (req as any).requestInfo;

  const result = await LicenseService.validateLicense(licenseKey);

  // Log validation attempt
  if (result.valid && result.license) {
    await ComplianceService.createAuditLog(
      result.license.user.id,
      'LICENSE_ACTIVATE',
      'License validation check',
      {
        licenseKey: licenseKey.substring(0, 8) + '...',
        deviceInfo,
        validationResult: 'valid',
      },
      requestInfo
    );
  }

  res.json({
    success: true,
    data: result,
  });
}));

// NOTE: Route for `/:licenseId` MUST remain at the bottom to avoid catching
// more specific routes like `/analytics`, `/sdk/versions`, etc.

/**
 * Get SDK downloads for a license
 */
router.get('/download-sdk/:licenseKey', [
  optionalAuth,
], asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey } = req.params;
  const requestInfo = (req as any).requestInfo;

  try {
    const downloads = await LicenseService.generateSDKDownloads(licenseKey);

    res.json({
      success: true,
      data: { downloads },
    });
  } catch (error) {
    // Log unauthorized download attempts
    await ComplianceService.createComplianceEvent(
      'REGULATORY_BREACH',
      'MEDIUM',
      `Unauthorized SDK download attempt: ${(error as Error).message}`,
      req.user?.id,
      undefined,
      {
        licenseKey: licenseKey.substring(0, 8) + '...',
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
      }
    ).catch(() => {});

    throw error;
  }
}));

/**
 * Download specific SDK version
 */
router.get('/download-sdk/:sdkId/:licenseKey', [
  optionalAuth,
], asyncHandler(async (req: Request, res: Response) => {
  const { sdkId, licenseKey } = req.params;
  const requestInfo = (req as any).requestInfo;

  // Validate license first
  const validation = await LicenseService.validateLicense(licenseKey);
  
  if (!validation.valid) {
    throw createApiError('Invalid license', 403);
  }

  // Get SDK version
  const sdkVersion = await LicenseService.getSDKVersion(sdkId);
  
  if (!sdkVersion) {
    throw createApiError('SDK version not found', 404);
  }

  // Log download
  await ComplianceService.createAuditLog(
    validation.license!.user.id,
    'LICENSE_ACTIVATE',
    `SDK downloaded: ${sdkVersion.platform} v${sdkVersion.version}`,
    {
      sdkId,
      platform: sdkVersion.platform,
      version: sdkVersion.version,
      licenseKey: licenseKey.substring(0, 8) + '...',
    },
    requestInfo
  );

  // In production, this would redirect to a secure download URL
  // For now, return the download information
  res.json({
    success: true,
    data: {
      downloadUrl: sdkVersion.downloadUrl,
      platform: sdkVersion.platform,
      version: sdkVersion.version,
      size: sdkVersion.size,
      checksum: sdkVersion.checksum,
      releaseNotes: sdkVersion.releaseNotes,
    },
  });
}));

/**
 * Get license analytics
 */
router.get('/analytics', [
  authenticateToken,
  requireEmailVerification,
], asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  console.log('Analytics route hit (no licenseId):', { userId, params: req.params });

  try {
    const analytics = await LicenseService.getLicenseAnalytics(userId);
    
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Internal server error',
    });
  }
}));

/**
 * Get license analytics for specific license
 */
router.get('/analytics/:licenseId', [
  authenticateToken,
  requireEmailVerification,
], asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { licenseId } = req.params;

  console.log('Analytics route hit (with licenseId):', { userId, licenseId, params: req.params });

  try {
    const analytics = await LicenseService.getLicenseAnalytics(userId, licenseId);
    
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Internal server error',
    });
  }
}));

/**
 * Transfer license ownership (Enterprise feature)
 */
router.post('/transfer', [
  authenticateToken,
  requireEmailVerification,
  validateLicenseOwnership,
  body('licenseKey').trim().notEmpty().withMessage('License key required'),
  body('newOwnerEmail').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long'),
], asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey, newOwnerEmail, reason } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const result = await LicenseService.transferLicense(
    licenseKey,
    userId,
    newOwnerEmail,
    reason,
    requestInfo
  );

  res.json({
    success: true,
    message: 'License transfer initiated',
    data: { transferId: result.transferId },
  });
}));

/**
 * Bulk license operations (Enterprise only)
 */
router.post('/bulk/create', [
  authenticateToken,
  requireEmailVerification,
  body('subscriptionId').isUUID().withMessage('Valid subscription ID required'),
  body('seatCount').isInt({ min: 1, max: 1000 }).withMessage('Seats must be between 1 and 1000'),
  body('userEmails').optional().isArray().withMessage('User emails must be an array'),
  body('userEmails.*').optional().isEmail().withMessage('Valid emails required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId, seatCount, userEmails = [] } = req.body;
  const adminUserId = req.user!.id;

  const result = await LicenseService.createBulkLicenses(
    adminUserId,
    subscriptionId,
    seatCount,
    userEmails
  );

  res.status(201).json({
    success: true,
    message: result.message,
    data: {
      licenses: result.licenses,
      totalCreated: result.licenses.length,
    },
  });
}));

/**
 * Get available SDK versions
 */
router.get('/sdk/versions', asyncHandler(async (req: Request, res: Response) => {
  const platform = req.query.platform as string;

  const versions = await LicenseService.getAvailableSDKVersions(platform);

  res.json({
    success: true,
    data: { versions },
  });
}));

/**
 * Report license issue
 */
router.post('/report-issue', [
  authenticateToken,
  requireEmailVerification,
  body('licenseKey').trim().notEmpty().withMessage('License key required'),
  body('issueType').isIn(['activation', 'deactivation', 'performance', 'compatibility', 'other'])
    .withMessage('Valid issue type required'),
  body('description').trim().isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('deviceInfo').optional().isObject().withMessage('Invalid device info'),
], asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey, issueType, description, deviceInfo } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const result = await LicenseService.reportLicenseIssue(
    userId,
    licenseKey,
    issueType,
    description,
    deviceInfo,
    requestInfo
  );

  res.json({
    success: true,
    message: 'Issue reported successfully',
    data: { ticketId: result.ticketId },
  });
}));

/**
 * Get license usage statistics
 */
router.get('/usage/:licenseKey', [
  authenticateToken,
  requireEmailVerification,
  validateLicenseOwnership,
], asyncHandler(async (req: Request, res: Response) => {
  const { licenseKey } = req.params;
  const userId = req.user!.id;

  const usage = await LicenseService.getLicenseUsage(licenseKey, userId);

  res.json({
    success: true,
    data: { usage },
  });
}));

/**
 * Get license details (keep this LAST)
 */
router.get('/:licenseId', [
  authenticateToken,
  requireEmailVerification,
  validateLicenseOwnership,
], asyncHandler(async (req: Request, res: Response) => {
  const { licenseId } = req.params;

  const license = await LicenseService.getLicenseDetails(licenseId);

  if (!license) {
    throw createApiError('License not found', 404);
  }

  res.json({
    success: true,
    data: { license },
  });
}));

export { router as licensesRouter };
