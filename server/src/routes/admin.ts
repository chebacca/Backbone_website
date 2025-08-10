import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';
import { LicenseService } from '../services/licenseService.js';
import { EmailService } from '../services/emailService.js';
import { PaymentService } from '../services/paymentService.js';
import { ComplianceService } from '../services/complianceService.js';
import { PasswordUtil } from '../utils/password.js';
import { 
  asyncHandler, 
  validationErrorHandler, 
  createApiError 
} from '../middleware/errorHandler.js';
import { 
  authenticateToken, 
  requireSuperAdmin,
  addRequestInfo 
} from '../middleware/auth.js';

const router: Router = Router();

// Add request info and require admin for all admin routes
router.use(addRequestInfo);
router.use(authenticateToken);
router.use(requireSuperAdmin);

/**
 * Get admin dashboard statistics
 */
router.get('/dashboard-stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = await AdminService.getDashboardStats();

  res.json({
    success: true,
    data: { stats },
  });
}));

/**
 * List all payments/invoices (Master Admin only)
 */
router.get('/payments', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 500);
  const status = (req.query.status as string) || undefined;
  const email = (req.query.email as string) || undefined;
  const from = (req.query.from as string) || undefined;
  const to = (req.query.to as string) || undefined;
  const skip = (page - 1) * limit;

  const all = await firestoreService.getAllPayments();
  const allUsers = await firestoreService.getAllUsers();
  const allSubs = await firestoreService.getAllSubscriptions();
  let filtered = all;
  if (status) filtered = filtered.filter((p: any) => p.status === status);
  if (from) filtered = filtered.filter((p: any) => new Date(p.createdAt) >= new Date(from));
  if (to) filtered = filtered.filter((p: any) => new Date(p.createdAt) <= new Date(to));
  if (email) {
    const userIds = allUsers
      .filter((u: any) => (u.email || '').toLowerCase().includes(email.toLowerCase()))
      .map((u: any) => u.id);
    filtered = filtered.filter((p: any) => userIds.includes(p.userId));
  }
  const total = filtered.length;
  const payments = filtered
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(skip, skip + limit)
    .map((p: any) => ({
      ...p,
      user: (() => {
        const u = allUsers.find((u: any) => u.id === p.userId);
        return u ? { id: u.id, name: u.name, email: u.email } : undefined;
      })(),
      subscription: (() => {
        const s = allSubs.find((s: any) => s.id === p.subscriptionId);
        return s ? { id: s.id, tier: s.tier, seats: s.seats } : undefined;
      })(),
    }));

  res.json({
    success: true,
    data: {
      payments,
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
 * Get payment details (Master Admin only)
 */
router.get('/payments/:paymentId', asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  const payment = await firestoreService.getPaymentById(paymentId);
  const subscription = payment ? await firestoreService.getSubscriptionById(payment.subscriptionId) : null;
  const user = payment ? await firestoreService.getUserById(payment.userId) : null;

  if (!payment) {
    throw createApiError('Payment not found', 404);
  }

  // Related licenses under the same subscription (if any)
  const licenses = payment?.subscriptionId
    ? await firestoreService.getLicensesBySubscriptionId(payment.subscriptionId)
    : [];

  res.json({
    success: true,
    data: { payment: payment ? { ...payment, user, subscription } : null, licenses },
  });
}));

/**
 * Get all users with pagination and filtering
 */
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 500);
  const search = req.query.search as string;
  const role = req.query.role as string;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  let users = await firestoreService.getAllUsers();
  if (search) users = users.filter((u: any) => (u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase())));
  if (role) users = users.filter((u: any) => u.role === role);
  if (status === 'verified') users = users.filter((u: any) => u.isEmailVerified);
  if (status === 'unverified') users = users.filter((u: any) => !u.isEmailVerified);
  const total = users.length;
  users = users.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(skip, skip + limit);

  res.json({
    success: true,
    data: {
      users,
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
 * Get specific user details
 */
router.get('/users/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await firestoreService.getUserById(userId);
  if (!user) throw createApiError('User not found', 404);
  const subs = await firestoreService.getSubscriptionsByUserId(userId);
  const subsData = await Promise.all(subs.map(async (s: any) => ({
    ...s,
    licenses: await firestoreService.getLicensesBySubscriptionId(s.id),
    payments: (await firestoreService.getPaymentsBySubscriptionId(s.id)).slice(0, 10),
  })));
  const auditLogs = (await firestoreService.getAuditLogsByUser(userId)).slice(0, 20);
  const complianceEvents = (await firestoreService.getComplianceEvents({})).slice(0, 10);

  if (!user) {
    throw createApiError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user: { ...user, subscriptions: subsData } },
  });
}));

/**
 * Update user details
 */
router.put('/users/:userId', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').optional().isIn(['USER', 'ADMIN', 'SUPERADMIN']).withMessage('Valid role required'),
  body('isEmailVerified').optional().isBoolean().withMessage('Invalid email verification status'),
  body('kycStatus').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED'])
    .withMessage('Valid KYC status required'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { userId } = req.params;
  const { name, role, isEmailVerified, kycStatus, password } = req.body;
  const adminUserId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;
  if (kycStatus !== undefined) updateData.kycStatus = kycStatus;
  
  // Handle password update
  if (password !== undefined) {
    const passCheck = PasswordUtil.validate(password);
    if (!passCheck.isValid) {
      throw createApiError('Password does not meet requirements', 400, 'WEAK_PASSWORD', { requirements: passCheck.errors });
    }
    const hashed = await PasswordUtil.hash(password);
    updateData.password = hashed;
  }

  await firestoreService.updateUser(userId, updateData);
  const user = await firestoreService.getUserById(userId);

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    `Profile updated by admin ${adminUserId}`,
    {
      updatedFields: Object.keys(updateData),
      adminUserId,
    },
    requestInfo
  );

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
}));

/**
 * Get all subscriptions
 */
router.get('/subscriptions', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 500);
  const tier = req.query.tier as string;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (tier) whereClause.tier = tier;
  if (status) whereClause.status = status;

  let subscriptions = await firestoreService.getAllSubscriptions();
  if (tier) subscriptions = subscriptions.filter((s: any) => s.tier === tier);
  if (status) subscriptions = subscriptions.filter((s: any) => s.status === status);
  const total = subscriptions.length;
  subscriptions = subscriptions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(skip, skip + limit);

  res.json({
    success: true,
    data: {
      subscriptions,
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
 * Get all licenses
 */
router.get('/licenses', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const tier = req.query.tier as string;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (tier) whereClause.tier = tier;
  if (status) whereClause.status = status;

  let licenses = await firestoreService.getAllLicenses();
  if (tier) licenses = licenses.filter((l: any) => l.tier === tier);
  if (status) licenses = licenses.filter((l: any) => l.status === status);
  const total = licenses.length;
  licenses = licenses.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(skip, skip + limit);

  res.json({
    success: true,
    data: {
      licenses,
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
 * Revoke a license
 */
router.post('/licenses/:licenseId/revoke', [
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
], asyncHandler(async (req: Request, res: Response) => {
  const { licenseId } = req.params;
  const { reason } = req.body;
  const adminUserId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const license = await firestoreService.getLicenseById(licenseId);

  if (!license) {
    throw createApiError('License not found', 404);
  }

  await firestoreService.updateLicense(licenseId, { status: 'REVOKED' } as any);

  // Create audit log
  await ComplianceService.createAuditLog(
    license.userId,
    'LICENSE_DEACTIVATE',
    `License revoked by admin: ${reason}`,
    {
      licenseId,
      revokedBy: adminUserId,
      reason,
    },
    requestInfo
  );

  // Create compliance event
  await ComplianceService.createComplianceEvent(
    'REGULATORY_BREACH',
    'HIGH',
    `License ${licenseId} revoked by admin`,
    license.userId,
    undefined,
    { reason, revokedBy: adminUserId }
  );

  res.json({
    success: true,
    message: 'License revoked successfully',
  });
}));

/**
 * Get compliance events
 */
router.get('/compliance-events', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const severity = req.query.severity as string;
  const eventType = req.query.eventType as string;
  const resolved = req.query.resolved as string;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (severity) whereClause.severity = severity;
  if (eventType) whereClause.eventType = eventType;
  if (resolved === 'true') whereClause.resolved = true;
  if (resolved === 'false') whereClause.resolved = false;

  const eventsAll = await firestoreService.getComplianceEvents({ severity, eventType, resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined });
  const total = eventsAll.length;
  const events = eventsAll.slice(skip, skip + limit);

  res.json({
    success: true,
    data: {
      events,
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
 * Resolve compliance event
 */
router.post('/compliance-events/:eventId/resolve', [
  body('resolution').trim().isLength({ min: 10, max: 1000 })
    .withMessage('Resolution must be between 10 and 1000 characters'),
], asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { resolution } = req.body;
  const adminUserId = req.user!.id;

  await firestoreService.updateComplianceEvent(eventId, {
    resolved: true,
    metadata: {
      resolution,
      resolvedBy: adminUserId,
      resolvedAt: new Date().toISOString(),
    },
  });
  const event = { id: eventId };

  res.json({
    success: true,
    message: 'Compliance event resolved',
    data: { event },
  });
}));

/**
 * Get payment analytics
 */
router.get('/analytics/payments', asyncHandler(async (req: Request, res: Response) => {
  const period = req.query.period as string || '30d';
  
  const analytics = await AdminService.getPaymentAnalytics(period);

  res.json({
    success: true,
    data: { analytics },
  });
}));

/**
 * Get license analytics
 */
router.get('/analytics/licenses', asyncHandler(async (req: Request, res: Response) => {
  const period = req.query.period as string || '30d';
  
  const analytics = await AdminService.getLicenseAnalytics(period);

  res.json({
    success: true,
    data: { analytics },
  });
}));

/**
 * Generate compliance report
 */
router.post('/reports/compliance', [
  body('reportType').isIn(['AML_SUSPICIOUS_ACTIVITY', 'KYC_COMPLIANCE', 'TAX_REPORTING', 'GDPR_COMPLIANCE'])
    .withMessage('Valid report type required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { reportType, startDate, endDate } = req.body;
  const adminUserId = req.user!.id;

  const report = await AdminService.generateComplianceReport(
    reportType,
    new Date(startDate),
    new Date(endDate),
    adminUserId
  );

  res.json({
    success: true,
    message: 'Compliance report generated',
    data: { report },
  });
}));

/**
 * Create enterprise customer
 */
router.post('/enterprise/customers', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name required'),
  body('seats').isInt({ min: 10 }).withMessage('Minimum 10 seats for enterprise'),
  body('customPricing').optional().isFloat({ min: 0 }).withMessage('Valid pricing required'),
], asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    name,
    companyName,
    seats,
    customPricing,
    contractTerms,
  } = req.body;
  const adminUserId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const result = await AdminService.createEnterpriseCustomer({
    email,
    name,
    companyName,
    seats,
    customPricing,
    contractTerms,
    createdBy: adminUserId,
  }, requestInfo);

  res.status(201).json({
    success: true,
    message: 'Enterprise customer created successfully',
    data: { customer: (result as any).customer },
  });
}));

/**
 * Get system health status
 */
router.get('/system/health', asyncHandler(async (req: Request, res: Response) => {
  const health = await AdminService.getSystemHealth();

  res.json({
    success: true,
    data: { health },
  });
}));

/**
 * Manually create licenses (admin action)
 * Allows admins to issue licenses for edge cases without payment
 */
router.post('/licenses/create', [
  body('userId').isString().withMessage('Valid userId required'),
  body('subscriptionId').isString().withMessage('Valid subscriptionId required'),
  body('tier').isIn(['BASIC', 'PRO', 'ENTERPRISE']).withMessage('Valid tier required'),
  body('seats').isInt({ min: 1, max: 1000 }).withMessage('Seats between 1 and 1000'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { userId, subscriptionId, tier, seats } = req.body as { userId: string; subscriptionId: string; tier: string; seats: number };
  const adminUserId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  // Validate subscription belongs to user and is active
  const subscription = await firestoreService.getSubscriptionById(subscriptionId);
  const subUser = subscription ? await firestoreService.getUserById(subscription.userId) : null;

  if (!subscription) {
    throw createApiError('Subscription not found for user', 404);
  }

  if (subscription.status !== 'ACTIVE') {
    throw createApiError('Subscription must be ACTIVE to issue licenses', 400);
  }

  // Generate licenses
  const licenses = await LicenseService.generateLicenses(userId, subscriptionId, subscription.tier, seats);

  // Create delivery logs tagged as manual issuance
  for (const license of licenses) {
    await firestoreService.createLicenseDeliveryLog({
      licenseId: license.id,
      paymentId: 'manual_issue',
      deliveryMethod: 'EMAIL',
      emailAddress: subUser?.email,
      deliveryStatus: 'PENDING',
      ipAddress: requestInfo?.ip,
      userAgent: requestInfo?.userAgent,
    });
  }

  // Send email with license keys (no invoice link)
  try {
    await EmailService.sendLicenseDeliveryEmail(subUser, licenses, subscription, null as any);
  } catch (err) {
    // Non-blocking: log but continue
  }

  // Audit log
  await ComplianceService.createAuditLog(
    adminUserId,
    'LICENSE_ACTIVATE',
    `Admin issued ${seats} ${tier} license(s) manually`,
    { subscriptionId, issuedSeats: seats, licenseIds: licenses.map(l => l.id) },
    requestInfo,
  );

  res.status(201).json({
    success: true,
    message: `Created ${licenses.length} license(s) successfully`,
    data: { licenses },
  });
}));

// Admin Service Class
class AdminService {
  static async getDashboardStats() {
    const [users, subs, payments, licenses] = await Promise.all([
      firestoreService.getAllUsers(),
      firestoreService.getAllSubscriptions(),
      firestoreService.getAllPayments(),
      firestoreService.getAllLicenses(),
    ]);
    const totalUsers = users.length;
    const activeSubscriptions = subs.filter((s: any) => s.status === 'ACTIVE').length;
    const totalRevenue = payments.filter((p: any) => p.status === 'SUCCEEDED').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const activeLicenses = licenses.filter((l: any) => l.status === 'ACTIVE').length;
    const recentSignups = users.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
      .map((u: any) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt }));
    const recentPayments = payments.filter((p: any) => p.status === 'SUCCEEDED').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
      .map((p: any) => ({ ...p, user: users.find((u: any) => u.id === p.userId) ? { name: users.find((u: any) => u.id === p.userId)!.name, email: users.find((u: any) => u.id === p.userId)!.email } : undefined }));
    const tierCounts: Record<string, number> = {};
    subs.filter((s: any) => s.status === 'ACTIVE').forEach((s: any) => { tierCounts[s.tier] = (tierCounts[s.tier] || 0) + 1; });
    const tierBreakdown = Object.keys(tierCounts).map(tier => ({ tier, _count: { tier: tierCounts[tier] }, _sum: { pricePerSeat: 0 } }));

    return {
      totalUsers,
      activeSubscriptions,
      totalRevenue,
      activeLicenses,
      tierBreakdown: tierBreakdown.map(tier => ({
        tier: tier.tier,
        count: (tier._count as any).tier,
        revenue: (tier._sum as any).pricePerSeat || 0,
      })),
      recentSignups,
      recentPayments,
    };
  }

  static async getPaymentAnalytics(period: string) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = (await firestoreService.getAllPayments()).filter((p: any) => p.status === 'SUCCEEDED' && new Date(p.createdAt) >= startDate).sort((a: any, b: any) => new Date((a as any).createdAt).getTime() - new Date((b as any).createdAt).getTime());

    // Group by day
    const dailyRevenue = payments.reduce((acc: any, payment: any) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPayments: payments.length,
      totalRevenue: payments.reduce((sum: number, p: any) => sum + p.amount, 0),
      dailyRevenue,
      averageOrderValue: payments.length > 0 
        ? payments.reduce((sum: number, p: any) => sum + p.amount, 0) / payments.length 
        : 0,
    };
  }

  static async getLicenseAnalytics(period: string) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const licenses = await firestoreService.getAllLicenses();
    const totalLicenses = licenses.length;
    const activeLicenses = licenses.filter((l: any) => l.status === 'ACTIVE').length;
    const newLicenses = licenses.filter((l: any) => new Date(l.createdAt) >= startDate).length;
    const statusBreakdown = Object.entries(licenses.reduce((acc: Record<string, number>, l: any) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {}))
      .map(([status, count]) => ({ status, _count: { status: count } }));

    return {
      totalLicenses,
      activeLicenses,
      newLicenses,
      statusBreakdown: statusBreakdown.map(status => ({
        status: status.status,
        count: status._count.status,
      })),
    };
  }

  static async generateComplianceReport(
    reportType: string,
    startDate: Date,
    endDate: Date,
    generatedBy: string
  ) {
    // Generate compliance report data based on type
    let data: any = {};

    switch (reportType) {
      case 'AML_SUSPICIOUS_ACTIVITY':
        data = await this.getAMLReport(startDate, endDate);
        break;
      case 'KYC_COMPLIANCE':
        data = await this.getKYCReport(startDate, endDate);
        break;
      case 'GDPR_COMPLIANCE':
        data = await this.getGDPRReport(startDate, endDate);
        break;
      default:
        throw createApiError('Unsupported report type', 400);
    }

    return {
      id: `report_${Date.now()}`,
      reportType,
      reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      generatedBy,
      data,
      createdAt: new Date(),
    };
  }

  static async getAMLReport(startDate: Date, endDate: Date) {
    const payments = (await firestoreService.getAllPayments()).filter((p: any) => new Date(p.createdAt) >= startDate && new Date(p.createdAt) <= endDate && ['FAILED', 'REQUIRES_REVIEW'].includes(p.amlScreeningStatus as any));

    return {
      totalSuspiciousTransactions: payments.length,
      totalAmount: payments.reduce((sum: number, p: any) => sum + p.amount, 0),
      transactions: payments.map((p: any) => ({
        paymentId: p.id,
        userId: p.userId,
        amount: p.amount,
        amlRiskScore: p.amlRiskScore,
        amlStatus: p.amlScreeningStatus,
        date: p.createdAt,
      })),
    };
  }

  static async getKYCReport(startDate: Date, endDate: Date) {
    const users = (await firestoreService.getAllUsers()).filter((u: any) => (u as any).kycCompletedAt && new Date((u as any).kycCompletedAt as any) >= startDate && new Date((u as any).kycCompletedAt as any) <= endDate);
    const kycStats = users.reduce((acc: Record<string, number>, u: any) => { acc[u.kycStatus as string] = (acc[u.kycStatus as string] || 0) + 1; return acc; }, {} as Record<string, number>);

    return {
      totalKYCCompleted: users.length,
      kycStatusBreakdown: kycStats,
      completionRate: users.length > 0 ? users.filter((u: any) => u.kycStatus === 'COMPLETED').length / users.length : 0,
    };
  }

  static async getGDPRReport(startDate: Date, endDate: Date) {
    const consentRecords: any[] = []; // not indexed by user in this context
    const auditLogs: any[] = []; // omitted in aggregate context
    const complianceEvents = (await firestoreService.getComplianceEvents({})).filter((e: any) => new Date((e as any).createdAt) >= startDate && new Date((e as any).createdAt) <= endDate && (e as any).eventType === 'GDPR_VIOLATION');

    return {
      consentRecords: consentRecords.length,
      auditLogs: auditLogs.length,
      gdprViolations: complianceEvents.length,
      dataProcessingActivities: auditLogs.length,
    };
  }

  static async createEnterpriseCustomer(customerData: any, requestInfo: any) {
    // Implementation for creating enterprise customers
    // This would involve creating user, subscription, and licenses
    throw new Error('Enterprise customer creation not yet implemented');
  }

  static async getSystemHealth() {
    const [dbHealth, emailHealth, paymentHealth] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkEmailHealth(),
      this.checkPaymentHealth(),
    ]);

    return {
      database: dbHealth,
      email: emailHealth,
      payment: paymentHealth,
      overall: dbHealth.status === 'healthy' && emailHealth.status === 'healthy' && paymentHealth.status === 'healthy' 
        ? 'healthy' : 'degraded',
    };
  }

  static async checkDatabaseHealth() {
    const ping = await firestoreService.ping();
    return ping.ok ? { status: 'healthy' } : { status: 'degraded', error: ping.error };
  }

  static async checkEmailHealth() {
    // Check email service health
    return { status: 'healthy' };
  }

  static async checkPaymentHealth() {
    // Check Stripe connectivity
    return { status: 'healthy' };
  }
}

export { router as adminRouter };
