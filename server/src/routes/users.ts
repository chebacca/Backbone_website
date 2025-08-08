import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma.js';
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

  const address = await prisma.billingAddress.upsert({
    where: { userId },
    create: {
      userId,
      ...addressData,
      validated: true,
      validatedAt: new Date(),
      validationSource: 'user_update',
    },
    update: {
      ...addressData,
      validated: true,
      validatedAt: new Date(),
      validationSource: 'user_update',
    },
  });

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    'Billing address updated',
    { addressId: address.id },
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

  const taxInfo = await prisma.taxInformation.upsert({
    where: { userId },
    create: {
      userId,
      ...taxData,
    },
    update: taxData,
  });

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    'Tax information updated',
    { taxInfoId: taxInfo.id },
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

  const businessProfile = await prisma.businessProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...businessData,
    },
    update: businessData,
  });

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    'Business profile updated',
    { businessProfileId: businessProfile.id },
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

  const consents = await prisma.privacyConsent.findMany({
    where: { userId },
    orderBy: { consentDate: 'desc' },
  });

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

  const [auditLogs, total] = await Promise.all([
    prisma.userAuditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    }),
    prisma.userAuditLog.count({ where: { userId } }),
  ]);

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

  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        include: {
          licenses: true,
          payments: true,
        },
      },
      complianceProfile: true,
      billingAddress: true,
      taxInformation: true,
      businessProfile: true,
      privacyConsent: true,
      auditLogs: true,
      usageAnalytics: true,
    },
  });

  if (!userData) {
    throw createApiError('User not found', 404);
  }

  // Remove sensitive data before export
  const exportData = {
    ...userData,
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user || user.email !== confirmEmail) {
    throw createApiError('Email confirmation does not match', 400);
  }

  // Check for active subscriptions
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      userId,
      status: 'ACTIVE',
    },
  });

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

  const [
    subscriptionCount,
    licenseCount,
    paymentCount,
    totalSpent,
    lastLogin,
    accountAge,
  ] = await Promise.all([
    prisma.subscription.count({ where: { userId } }),
    prisma.license.count({ where: { userId } }),
    prisma.payment.count({ where: { userId, status: 'SUCCEEDED' } }),
    prisma.payment.aggregate({
      where: { userId, status: 'SUCCEEDED' },
      _sum: { amount: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true, createdAt: true },
    }),
    prisma.userAuditLog.count({ where: { userId } }),
  ]);

  const stats = {
    subscriptions: subscriptionCount,
    licenses: licenseCount,
    payments: paymentCount,
    totalSpent: totalSpent._sum.amount || 0,
    lastLogin: lastLogin?.lastLoginAt,
    memberSince: lastLogin?.createdAt,
    accountAge: lastLogin?.createdAt 
      ? Math.floor((Date.now() - lastLogin.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0,
    activityLogs: accountAge,
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
  await prisma.user.update({
    where: { id: userId },
    data: {
      marketingConsent: marketingEmails,
    },
  });

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
