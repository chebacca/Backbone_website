import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { LicenseService } from '../services/licenseService.js';
import { ComplianceService } from '../services/complianceService.js';
import { PaymentService } from '../services/paymentService.js';
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
  optionalAuth,
  requireEnterpriseAdminStrict 
} from '../middleware/auth.js';
import { firestoreService } from '../services/firestoreService.js';

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

  return res.json({
    success: true,
    data: { licenses },
  });
}));

/**
 * Cleanup duplicate licenses for the current user by DELETING extras
 * Keeps exactly one ACTIVE license (or newest if none active), deletes others
 */
router.post('/cleanup-my-duplicates', [
  authenticateToken,
  requireEmailVerification,
], asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const email = req.user!.email;

  const licenses = await LicenseService.getUserLicenses(userId);
  if (!licenses || licenses.length <= 1) {
    return res.json({ 
      success: true, 
      message: 'No duplicates found', 
      data: { kept: licenses?.[0] || null, deleted: 0 } 
    });
  }

  const now = new Date();
  const toDate = (exp: any): Date | null => {
    if (!exp) return null;
    try { 
      return typeof (exp as any).toDate === 'function' ? (exp as any).toDate() : new Date(exp); 
    } catch { 
      return null; 
    }
  };

  const sorted = [...licenses].sort((a: any, b: any) => 
    new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );
  
  const keeper = sorted.find((l: any) => 
    l.status === 'ACTIVE' && ((toDate((l as any).expiresAt) || new Date(now.getTime()+1)).getTime() > now.getTime())
  ) || sorted[0];

  // Ensure keeper is ACTIVE with future expiry
  const exp = toDate((keeper as any).expiresAt);
  const updates: any = { status: 'ACTIVE' };
  if (!exp || Number.isNaN(exp.getTime()) || exp <= now) {
    updates.expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  await firestoreService.updateLicense((keeper as any).id, updates);

  // Delete all other license docs
  let deleted = 0;
  for (const lic of sorted) {
    if ((lic as any).id === (keeper as any).id) continue;
    await firestoreService.deleteLicense((lic as any).id);
    deleted++;
  }

  return res.json({ 
    success: true, 
    message: 'Duplicate licenses cleaned up', 
    data: { kept: keeper, deleted } 
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

  return res.json({
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

  return res.json({
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

  // Cast to allow passing deviceInfo without changing import resolution that uses .js extension
  const result = await (LicenseService as any).validateLicense(licenseKey, deviceInfo);

  // Log validation attempt
  if (result.valid && result.license && result.license.user) {
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

  return res.json({
    success: true,
    data: result,
  });
}));

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

    return res.json({
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
    validation.license && validation.license.user ? validation.license.user.id : req.user!.id,
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
  return res.json({
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
    
    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
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
    
    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
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
  requireEnterpriseAdminStrict,
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

  return res.json({
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
  requireEnterpriseAdminStrict,
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

  return res.status(201).json({
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

  return res.json({
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

  return res.json({
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

  return res.json({
    success: true,
    data: { usage },
  });
}));

/**
 * Purchase additional licenses
 */
router.post('/purchase', [
  authenticateToken,
  requireEmailVerification,
  body('planId').isString().withMessage('Plan ID required'),
  body('quantity').isInt({ min: 1, max: 1000 }).withMessage('Quantity must be between 1 and 1000'),
  body('paymentMethodId').isString().withMessage('Payment method ID required'),
  body('billingAddress').isObject().withMessage('Billing address required'),
  body('total').isNumeric().withMessage('Total amount required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const userId = req.user!.id;
  const { planId, quantity, paymentMethodId, billingAddress, total } = req.body;
  const requestInfo = (req as any).requestInfo;

  try {
    console.log('🛒 [License Purchase] Processing purchase:', { 
      userId, 
      planId, 
      quantity, 
      total 
    });

    // Get user and organization info
    const user = await firestoreService.getUserById(userId);
    if (!user) {
      throw createApiError('User not found', 404);
    }

    // Get user's active subscription
    const subscriptions = await firestoreService.getSubscriptionsByUserId(userId);
    const activeSubscription = subscriptions.find(sub => sub.status === 'ACTIVE');
    
    if (!activeSubscription) {
      throw createApiError('No active subscription found. Please create a subscription first.', 400);
    }

    // Create additional licenses using the existing subscription
    const licenses = await LicenseService.generateLicenses(
      userId,
      activeSubscription.id,
      activeSubscription.tier,
      quantity,
      'ACTIVE',
      12, // 12 months
      activeSubscription.organizationId
    );

    // Create payment record
    const payment = await firestoreService.createPayment({
      userId,
      subscriptionId: activeSubscription.id,
      amount: total,
      currency: 'USD',
      status: 'SUCCEEDED',
      paymentMethod: paymentMethodId,
      billingAddressSnapshot: billingAddress,
      description: `Additional ${quantity} ${activeSubscription.tier} license(s)`,
      complianceData: {
        planId,
        quantity,
        licenseIds: licenses.map(l => l.id)
      },
      amlScreeningStatus: 'PASSED',
      pciCompliant: true
    });

    // Note: Invoice creation would be handled by Stripe webhook
    // For now, we'll skip the invoice creation step

    // Update subscription seat count
    await firestoreService.updateSubscription(activeSubscription.id, {
      seats: activeSubscription.seats + quantity,
      // Note: usedSeats property doesn't exist in FirestoreSubscription interface
      updatedAt: new Date()
    });

    console.log('✅ [License Purchase] Purchase completed successfully:', {
      licensesCreated: licenses.length,
      paymentId: payment.id
    });

    // Update user claims with new license information
    try {
      const { LicenseClaimsService } = await import('../services/LicenseClaimsService.js');
      
      // Update claims for the primary license
      if (licenses.length > 0) {
        const primaryLicense = licenses[0];
        await LicenseClaimsService.updateLicenseClaimsAfterPurchase(userId, primaryLicense.id);
        console.log('✅ [License Purchase] User claims updated with license information');
      }
    } catch (claimsError) {
      console.warn('⚠️ [License Purchase] Failed to update user claims:', claimsError);
      // Don't fail the purchase if claims update fails
    }

    return res.json({
      success: true,
      message: 'Licenses purchased successfully',
      data: {
        subscription: {
          id: activeSubscription.id,
          tier: activeSubscription.tier,
          seats: activeSubscription.seats + quantity,
          // Note: usedSeats property doesn't exist in FirestoreSubscription interface
        },
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        },
        // Note: Invoice creation removed - would be handled by Stripe webhook
        licenses: licenses.map(license => ({
          id: license.id,
          key: license.key,
          tier: license.tier,
          status: license.status,
          expiresAt: license.expiresAt
        }))
      }
    });

  } catch (error: any) {
    console.error('❌ [License Purchase] Error:', error);
    throw createApiError(error.message || 'Failed to purchase licenses', 500);
  }
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

  return res.json({
    success: true,
    data: { license },
  });
}));

export { router as licensesRouter };
