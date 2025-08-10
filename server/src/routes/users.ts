import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../services/db.js';
import { ComplianceService } from '../services/complianceService.js';
import { 
  asyncHandler, 
  validationErrorHandler, 
  createApiError 
} from '../middleware/errorHandler.js';
import { 
  authenticateToken, 
  requireEmailVerification,
  addRequestInfo 
} from '../middleware/auth.js';
import { firestoreService } from '../services/firestoreService.js';

const router: Router = Router();

// Add request info to all user routes
router.use(addRequestInfo);
router.use(authenticateToken);
router.use(requireEmailVerification);

/**
 * Update billing address
 */
router.put('/billing-address', [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name required'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 required'),
  body('city').trim().notEmpty().withMessage('City required'),
  body('postalCode').trim().notEmpty().withMessage('Postal code required'),
  body('country').isLength({ min: 2, max: 2 }).withMessage('Valid country code required'),
  body('state').optional().trim(),
  body('company').optional().trim(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;
  const addressData = req.body;

  // Validate address
  const validation = await ComplianceService.validateBillingAddress(addressData);
  
  if (!validation.valid) {
    throw createApiError(`Invalid address: ${validation.errors.join(', ')}`, 400);
  }

  await db.updateUser(userId, {
    billingAddress: {
      ...addressData,
      validated: true,
      validatedAt: new Date(),
      validationSource: 'user_update',
    },
  } as any);
  const address = (await db.getUserById(userId))?.billingAddress as any;

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    'Billing address updated',
    { addressId: (address && (address as any).id) || undefined },
    requestInfo
  );

  res.json({
    success: true,
    message: 'Billing address updated successfully',
    data: { address },
  });
}));

/**
 * Update tax information
 */
router.put('/tax-information', [
  body('taxResidency').isLength({ min: 2, max: 2 }).withMessage('Valid tax residency country required'),
  body('taxId').optional().trim(),
  body('taxIdType').optional().isIn(['SSN', 'EIN', 'VAT', 'GST', 'OTHER']).withMessage('Valid tax ID type required'),
  body('vatNumber').optional().trim(),
  body('taxExempt').optional().isBoolean().withMessage('Invalid tax exempt status'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;
  const taxData = req.body;

  await db.updateUser(userId, { taxInformation: taxData } as any);
  const taxInfo = (await db.getUserById(userId))?.taxInformation as any;

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    'Tax information updated',
    { taxInfoId: (taxInfo && (taxInfo as any).id) || undefined },
    requestInfo
  );

  res.json({
    success: true,
    message: 'Tax information updated successfully',
    data: { taxInfo },
  });
}));

/**
 * Update business profile
 */
router.put('/business-profile', [
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name required'),
  body('companyType').isIn(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'NON_PROFIT', 'GOVERNMENT', 'OTHER'])
    .withMessage('Valid company type required'),
  body('incorporationCountry').isLength({ min: 2, max: 2 }).withMessage('Valid incorporation country required'),
  body('businessDescription').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;
  const businessData = req.body;

  await db.updateUser(userId, { businessProfile: businessData } as any);
  const businessProfile = (await db.getUserById(userId))?.businessProfile as any;

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    'Business profile updated',
    { businessProfileId: (businessProfile && (businessProfile as any).id) || undefined },
    requestInfo
  );

  res.json({
    success: true,
    message: 'Business profile updated successfully',
    data: { businessProfile },
  });
}));

/**
 * Complete KYC verification
 */
router.post('/kyc/verify', [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth required'),
  body('nationality').isLength({ min: 2, max: 2 }).withMessage('Valid nationality required'),
  body('countryOfResidence').isLength({ min: 2, max: 2 }).withMessage('Valid country of residence required'),
  body('phoneNumber').optional().trim(),
  body('governmentIdType').optional().trim(),
  body('governmentIdNumber').optional().trim(),
  body('governmentIdCountry').optional().isLength({ min: 2, max: 2 }).withMessage('Valid ID country required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const userId = req.user!.id;
  const kycData = req.body;

  const result = await ComplianceService.performKYC(userId, kycData);

  res.json({
    success: true,
    message: `KYC verification ${result.status.toLowerCase()}`,
    data: {
      status: result.status,
      complianceProfile: result.complianceProfile,
    },
  });
}));

/**
 * Grant or withdraw consent
 */
router.post('/consent', [
  body('consentType').isIn(['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING', 'DATA_PROCESSING', 'COOKIES', 'ANALYTICS'])
    .withMessage('Valid consent type required'),
  body('granted').isBoolean().withMessage('Consent status required'),
  body('version').trim().notEmpty().withMessage('Consent version required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { consentType, granted, version } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const consent = await ComplianceService.recordConsent(
    userId,
    consentType,
    granted,
    version,
    requestInfo.ip,
    requestInfo.userAgent
  );

  // Update snapshot fields on user for quick lookups
  if (consentType === 'TERMS_OF_SERVICE' && granted) {
    await firestoreService.updateUser(userId, { termsAcceptedAt: new Date(), termsVersionAccepted: version } as any);
  }
  if (consentType === 'PRIVACY_POLICY' && granted) {
    await firestoreService.updateUser(userId, { privacyPolicyAcceptedAt: new Date(), privacyPolicyVersionAccepted: version } as any);
  }

  res.json({
    success: true,
    message: `Consent ${granted ? 'granted' : 'withdrawn'} successfully`,
    data: { consent },
  });
}));

/**
 * Get user's consent history
 */
router.get('/consent-history', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const consents = await db.getPrivacyConsentsByUser(userId);

  res.json({
    success: true,
    data: { consents },
  });
}));

/**
 * Get user's audit log
 */
router.get('/audit-log', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  const all = await db.getAuditLogsByUser(userId);
  const total = all.length;
  const auditLogs = all.slice(skip, skip + limit);

  res.json({
    success: true,
    data: {
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

/**
 * Export user data (GDPR compliance)
 */
router.post('/export-data', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const userDoc = await db.getUserById(userId);
  if (!userDoc) throw createApiError('User not found', 404);
  const subscriptions = await db.getSubscriptionsByUserId(userId);
  const subsWithData = await Promise.all(subscriptions.map(async (s: any) => ({
    ...s,
    licenses: (await db.getLicensesByUserId(userId)).filter((l: any) => l.subscriptionId === s.id),
    payments: (await db.getPaymentsBySubscriptionId(s.id)),
  })));
  const privacyConsent = await db.getPrivacyConsentsByUser(userId);
  const auditLogsAll = await db.getAuditLogsByUser(userId);
  const usageAnalytics = await db.getUsageAnalyticsByUser(userId);

  // Remove sensitive data before export
  const exportData = {
    ...userDoc,
    subscriptions: subsWithData,
    privacyConsent,
    auditLogs: auditLogsAll,
    usageAnalytics,
    password: undefined, // Never export password
    emailVerifyToken: undefined,
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
  };

  // Create audit log for data export
  await ComplianceService.createAuditLog(
    userId,
    'DATA_EXPORT',
    'User data exported',
    { exportedAt: new Date() },
    requestInfo
  );

  res.json({
    success: true,
    message: 'User data exported successfully',
    data: { userData: exportData },
  });
}));

/**
 * Request account deletion (GDPR Right to be Forgotten)
 */
router.post('/request-deletion', [
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long'),
  body('confirmEmail').isEmail().normalizeEmail().withMessage('Email confirmation required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { reason, confirmEmail } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const user = await db.getUserById(userId);

  if (!user || user.email !== confirmEmail) {
    throw createApiError('Email confirmation does not match', 400);
  }

  // Check for active subscriptions
  const subs = await db.getSubscriptionsByUserId(userId);
  const activeSubscriptions = subs.filter((s: any) => s.status === 'ACTIVE').length;

  if (activeSubscriptions > 0) {
    throw createApiError('Cannot delete account with active subscriptions. Please cancel all subscriptions first.', 400);
  }

  // Create deletion request (in production, this would queue for manual review)
  await ComplianceService.createComplianceEvent(
    'GDPR_VIOLATION', // Using as a generic GDPR event
    'MEDIUM',
    'Account deletion requested',
    userId,
    undefined,
    {
      reason,
      confirmedEmail: confirmEmail,
      activeSubscriptions,
    }
  );

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'DATA_DELETE',
    'Account deletion requested',
    { reason },
    requestInfo
  );

  res.json({
    success: true,
    message: 'Account deletion request submitted. We will process your request within 30 days as required by GDPR.',
  });
}));

/**
 * Get user statistics
 */
router.get('/statistics', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [subs2, licenses, paymentsAll, userLatest, auditAll] = await Promise.all([
    db.getSubscriptionsByUserId(userId),
    db.getLicensesByUserId(userId),
    db.getPaymentsByUserId(userId),
    db.getUserById(userId),
    db.getAuditLogsByUser(userId),
  ]);
  const succeeded = paymentsAll.filter((p: any) => p.status === 'SUCCEEDED');

  const stats = {
    subscriptions: subs2.length,
    licenses: licenses.length,
    payments: succeeded.length,
    totalSpent: succeeded.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    lastLogin: (userLatest as any)?.lastLoginAt,
    memberSince: (userLatest as any)?.createdAt,
    accountAge: (userLatest as any)?.createdAt 
      ? Math.floor((Date.now() - new Date((userLatest as any).createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    activityLogs: auditAll.length,
  };

  res.json({
    success: true,
    data: { stats },
  });
}));

/**
 * Update notification preferences
 */
router.put('/notifications', [
  body('emailNotifications').optional().isBoolean().withMessage('Invalid email notification setting'),
  body('marketingEmails').optional().isBoolean().withMessage('Invalid marketing email setting'),
  body('securityAlerts').optional().isBoolean().withMessage('Invalid security alert setting'),
  body('paymentNotifications').optional().isBoolean().withMessage('Invalid payment notification setting'),
], asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;
  const {
    emailNotifications,
    marketingEmails,
    securityAlerts,
    paymentNotifications,
  } = req.body;

  // Update marketing consent if changed
  if (marketingEmails !== undefined) {
    await ComplianceService.recordConsent(
      userId,
      'MARKETING',
      marketingEmails,
      '1.0',
      requestInfo.ip,
      requestInfo.userAgent
    );
  }

  // In a full implementation, you'd store these preferences
  // For now, just update the marketing consent
  await db.updateUser(userId, { marketingConsent: marketingEmails } as any);

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    'Notification preferences updated',
    {
      emailNotifications,
      marketingEmails,
      securityAlerts,
      paymentNotifications,
    },
    requestInfo
  );

  res.json({
    success: true,
    message: 'Notification preferences updated successfully',
  });
}));

export { router as usersRouter };
