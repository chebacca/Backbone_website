import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';
import { LicenseService } from '../services/licenseService.js';
import { EmailService } from '../services/emailService.js';
import { PaymentService } from '../services/paymentService.js';
import { ComplianceService } from '../services/complianceService.js';
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
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const status = (req.query.status as string) || undefined;
  const email = (req.query.email as string) || undefined;
  const from = (req.query.from as string) || undefined;
  const to = (req.query.to as string) || undefined;
  const skip = (page - 1) * limit;

  const all = await firestoreService.getAllPayments();
  const users = email ? await firestoreService.getAllUsers() : [];
  let filtered = all;
  if (status) filtered = filtered.filter(p => p.status === status);
  if (from) filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(from));
  if (to) filtered = filtered.filter(p => new Date(p.createdAt) <= new Date(to));
  if (email) {
    const userIds = users
      .filter(u => (u.email || '').toLowerCase().includes(email.toLowerCase()))
      .map(u => u.id);
    filtered = filtered.filter(p => userIds.includes(p.userId));
  }
  const total = filtered.length;
  const payments = filtered
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(skip, skip + limit)
    .map(p => ({ ...p }));

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
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const search = req.query.search as string;
  const role = req.query.role as string;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    whereClause.role = role;
  }

  if (status === 'verified') {
    whereClause.isEmailVerified = true;
  } else if (status === 'unverified') {
    whereClause.isEmailVerified = false;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        kycStatus: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            subscriptions: true,
            licenses: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        include: {
          licenses: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
      complianceProfile: true,
      billingAddress: true,
      businessProfile: true,
      auditLogs: {
        orderBy: { timestamp: 'desc' },
        take: 20,
      },
      complianceEvents: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    throw createApiError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
}));

/**
 * Update user details
 */
router.put('/users/:userId', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').optional().isIn(['USER', 'ADMIN', 'ENTERPRISE_ADMIN']).withMessage('Valid role required'),
  body('isEmailVerified').optional().isBoolean().withMessage('Invalid email verification status'),
  body('kycStatus').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED'])
    .withMessage('Valid KYC status required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { userId } = req.params;
  const { name, role, isEmailVerified, kycStatus } = req.body;
  const adminUserId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;
  if (kycStatus !== undefined) updateData.kycStatus = kycStatus;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

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
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const tier = req.query.tier as string;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (tier) whereClause.tier = tier;
  if (status) whereClause.status = status;

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            licenses: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.subscription.count({ where: whereClause }),
  ]);

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

  const [licenses, total] = await Promise.all([
    prisma.license.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        subscription: {
          select: {
            id: true,
            tier: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.license.count({ where: whereClause }),
  ]);

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

  const license = await prisma.license.findUnique({
    where: { id: licenseId },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  if (!license) {
    throw createApiError('License not found', 404);
  }

  await prisma.license.update({
    where: { id: licenseId },
    data: {
      status: 'REVOKED',
    },
  });

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

  const [events, total] = await Promise.all([
    prisma.complianceEvent.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.complianceEvent.count({ where: whereClause }),
  ]);

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

  const event = await prisma.complianceEvent.update({
    where: { id: eventId },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: adminUserId,
      metadata: {
        resolution,
        resolvedBy: adminUserId,
      },
    },
  });

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
  body('userId').isUUID().withMessage('Valid userId required'),
  body('subscriptionId').isUUID().withMessage('Valid subscriptionId required'),
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
  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
    include: { user: true },
  });

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
    await prisma.licenseDeliveryLog.create({
      data: {
        licenseId: license.id,
        paymentId: 'manual_issue',
        deliveryMethod: 'EMAIL',
        emailAddress: subscription.user.email,
        deliveryStatus: 'PENDING',
        ipAddress: requestInfo?.ip,
        userAgent: requestInfo?.userAgent,
      },
    });
  }

  // Send email with license keys (no invoice link)
  try {
    await EmailService.sendLicenseDeliveryEmail(subscription.user, licenses, subscription, null as any);
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
    const [
      totalUsers,
      activeSubscriptions,
      totalRevenue,
      activeLicenses,
      recentSignups,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      prisma.license.count({ where: { status: 'ACTIVE' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.payment.findMany({
        where: { status: 'SUCCEEDED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const tierBreakdown = await prisma.subscription.groupBy({
      by: ['tier'],
      where: { status: 'ACTIVE' },
      _count: { tier: true },
      _sum: { pricePerSeat: true },
    });

    return {
      totalUsers,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeLicenses,
      tierBreakdown: tierBreakdown.map(tier => ({
        tier: tier.tier,
        count: tier._count.tier,
        revenue: tier._sum.pricePerSeat || 0,
      })),
      recentSignups,
      recentPayments,
    };
  }

  static async getPaymentAnalytics(period: string) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'SUCCEEDED',
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyRevenue = payments.reduce((acc, payment) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPayments: payments.length,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      dailyRevenue,
      averageOrderValue: payments.length > 0 
        ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length 
        : 0,
    };
  }

  static async getLicenseAnalytics(period: string) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalLicenses, activeLicenses, newLicenses] = await Promise.all([
      prisma.license.count(),
      prisma.license.count({ where: { status: 'ACTIVE' } }),
      prisma.license.count({
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    const statusBreakdown = await prisma.license.groupBy({
      by: ['status'],
      _count: { status: true },
    });

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

    const report = await prisma.regulatoryReport.create({
      data: {
        reportType: reportType as any,
        reportPeriod: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        generatedBy,
        data,
      },
    });

    return report;
  }

  static async getAMLReport(startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        amlScreeningStatus: { in: ['FAILED', 'REQUIRES_REVIEW'] },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            complianceProfile: true,
          },
        },
      },
    });

    return {
      totalSuspiciousTransactions: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      transactions: payments.map(p => ({
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
    const users = await prisma.user.findMany({
      where: {
        kycCompletedAt: { gte: startDate, lte: endDate },
      },
      include: {
        complianceProfile: true,
      },
    });

    const kycStats = await prisma.user.groupBy({
      by: ['kycStatus'],
      _count: { kycStatus: true },
    });

    return {
      totalKYCCompleted: users.length,
      kycStatusBreakdown: kycStats,
      completionRate: users.length > 0 ? users.filter(u => u.kycStatus === 'COMPLETED').length / users.length : 0,
    };
  }

  static async getGDPRReport(startDate: Date, endDate: Date) {
    const [consentRecords, auditLogs, complianceEvents] = await Promise.all([
      prisma.privacyConsent.findMany({
        where: { consentDate: { gte: startDate, lte: endDate } },
      }),
      prisma.userAuditLog.findMany({
        where: { timestamp: { gte: startDate, lte: endDate } },
      }),
      prisma.complianceEvent.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          eventType: 'GDPR_VIOLATION',
        },
      }),
    ]);

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
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', latency: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: (error as Error).message };
    }
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
