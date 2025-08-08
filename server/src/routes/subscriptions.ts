import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma.js';
import { PaymentService } from '../services/paymentService.js';
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
  validateSubscriptionOwnership 
} from '../middleware/auth.js';

const router: Router = Router();

// Add request info to all subscription routes
router.use(addRequestInfo);
router.use(authenticateToken);
router.use(requireEmailVerification);

/**
 * Get user's subscriptions
 */
router.get('/my-subscriptions', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: {
      licenses: {
        where: { status: { in: ['ACTIVE', 'PENDING'] } },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          licenses: true,
          payments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { subscriptions },
  });
}));

/**
 * Get specific subscription details
 */
router.get('/:subscriptionId', [
  validateSubscriptionOwnership,
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      licenses: {
        orderBy: { createdAt: 'desc' },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
      organization: true,
    },
  });

  if (!subscription) {
    throw createApiError('Subscription not found', 404);
  }

  res.json({
    success: true,
    data: { subscription },
  });
}));

/**
 * Update subscription (change seats, etc.)
 */
router.put('/:subscriptionId', [
  validateSubscriptionOwnership,
  body('seats').optional().isInt({ min: 1, max: 1000 }).withMessage('Seats must be between 1 and 1000'),
  body('tier').optional().isIn(['BASIC', 'PRO', 'ENTERPRISE']).withMessage('Valid tier required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { seats, tier } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw createApiError('Subscription not found', 404);
  }

  if (subscription.status !== 'ACTIVE') {
    throw createApiError('Can only update active subscriptions', 400);
  }

  // Validate tier upgrade rules
  if (tier && tier !== subscription.tier) {
    const tierHierarchy = { BASIC: 1, PRO: 2, ENTERPRISE: 3 };
    if (tierHierarchy[tier as keyof typeof tierHierarchy] < tierHierarchy[subscription.tier as keyof typeof tierHierarchy]) {
      throw createApiError('Cannot downgrade subscription tier. Please contact support.', 400);
    }
  }

  // Enterprise tier validation
  if (tier === 'ENTERPRISE' && seats && seats < 10) {
    throw createApiError('Enterprise tier requires minimum 10 seats', 400);
  }

  const result = await PaymentService.updateSubscription(
    userId,
    subscriptionId,
    { seats, tier },
    requestInfo
  );

  res.json({
    success: true,
    message: 'Subscription updated successfully',
    data: { subscription: result.subscription },
  });
}));

/**
 * Cancel subscription
 */
router.post('/:subscriptionId/cancel', [
  validateSubscriptionOwnership,
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long'),
  body('cancelAtPeriodEnd').optional().isBoolean().withMessage('Invalid cancel option'),
  body('feedback').optional().trim().isLength({ max: 1000 }).withMessage('Feedback too long'),
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { reason, cancelAtPeriodEnd = true, feedback } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const result = await PaymentService.cancelSubscription(
    userId,
    subscriptionId,
    {
      reason,
      cancelAtPeriodEnd,
      feedback,
    },
    requestInfo
  );

  res.json({
    success: true,
    message: cancelAtPeriodEnd 
      ? 'Subscription will be cancelled at the end of the current period'
      : 'Subscription cancelled immediately',
    data: { subscription: result.subscription },
  });
}));

/**
 * Reactivate cancelled subscription
 */
router.post('/:subscriptionId/reactivate', [
  validateSubscriptionOwnership,
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw createApiError('Subscription not found', 404);
  }

  if (subscription.status !== 'CANCELLED' || !subscription.cancelAtPeriodEnd) {
    throw createApiError('Cannot reactivate this subscription', 400);
  }

  if (new Date() > subscription.currentPeriodEnd!) {
    throw createApiError('Subscription period has already ended', 400);
  }

  const result = await PaymentService.reactivateSubscription(
    userId,
    subscriptionId,
    requestInfo
  );

  res.json({
    success: true,
    message: 'Subscription reactivated successfully',
    data: { subscription: result.subscription },
  });
}));

/**
 * Get subscription invoices
 */
router.get('/:subscriptionId/invoices', [
  validateSubscriptionOwnership,
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: { subscriptionId } }),
  ]);

  res.json({
    success: true,
    data: {
      invoices: payments,
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
 * Get subscription usage analytics
 */
router.get('/:subscriptionId/usage', [
  validateSubscriptionOwnership,
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const period = req.query.period as string || '30d';

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [licenses, usageAnalytics] = await Promise.all([
    prisma.license.findMany({
      where: { subscriptionId },
      include: {
        usageAnalytics: {
          where: { timestamp: { gte: startDate } },
          orderBy: { timestamp: 'desc' },
        },
      },
    }),
    prisma.usageAnalytics.findMany({
      where: {
        license: { subscriptionId },
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
    }),
  ]);

  // Aggregate usage data
  const usageStats = {
    totalLicenses: licenses.length,
    activeLicenses: licenses.filter(l => l.status === 'ACTIVE').length,
    totalUsageEvents: usageAnalytics.length,
    eventTypes: usageAnalytics.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    dailyUsage: usageAnalytics.reduce((acc, event) => {
      const date = event.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  res.json({
    success: true,
    data: {
      usage: usageStats,
      licenses: licenses.map(l => ({
        id: l.id,
        key: l.key.substring(0, 8) + '...',
        status: l.status,
        activatedAt: l.activatedAt,
        usageCount: l.usageAnalytics.length,
      })),
    },
  });
}));

/**
 * Update subscription payment method
 */
router.put('/:subscriptionId/payment-method', [
  validateSubscriptionOwnership,
  body('paymentMethodId').notEmpty().withMessage('Payment method required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { paymentMethodId } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const result = await PaymentService.updatePaymentMethod(
    userId,
    subscriptionId,
    paymentMethodId,
    requestInfo
  );

  res.json({
    success: true,
    message: 'Payment method updated successfully',
    data: { subscription: result.subscription },
  });
}));

/**
 * Get subscription billing history
 */
router.get('/:subscriptionId/billing-history', [
  validateSubscriptionOwnership,
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  const billingHistory = await prisma.payment.findMany({
    where: { subscriptionId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      description: true,
      receiptUrl: true,
      taxAmount: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: { billingHistory },
  });
}));

/**
 * Preview subscription changes
 */
router.post('/:subscriptionId/preview-changes', [
  validateSubscriptionOwnership,
  body('seats').optional().isInt({ min: 1, max: 1000 }).withMessage('Seats must be between 1 and 1000'),
  body('tier').optional().isIn(['BASIC', 'PRO', 'ENTERPRISE']).withMessage('Valid tier required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { seats, tier } = req.body;

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        include: {
          billingAddress: true,
        },
      },
    },
  });

  if (!subscription) {
    throw createApiError('Subscription not found', 404);
  }

  const preview = await PaymentService.previewSubscriptionChanges(
    subscription,
    { seats, tier }
  );

  res.json({
    success: true,
    data: { preview },
  });
}));

/**
 * Get subscription renewal information
 */
router.get('/:subscriptionId/renewal', [
  validateSubscriptionOwnership,
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: {
      id: true,
      tier: true,
      seats: true,
      pricePerSeat: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      status: true,
    },
  });

  if (!subscription) {
    throw createApiError('Subscription not found', 404);
  }

  const renewalInfo = {
    subscriptionId: subscription.id,
    currentTier: subscription.tier,
    currentSeats: subscription.seats,
    currentPrice: subscription.pricePerSeat * subscription.seats,
    currentPeriodEnd: subscription.currentPeriodEnd,
    willRenew: !subscription.cancelAtPeriodEnd && subscription.status === 'ACTIVE',
    daysUntilRenewal: subscription.currentPeriodEnd 
      ? Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
  };

  res.json({
    success: true,
    data: { renewalInfo },
  });
}));

/**
 * Add seats to subscription
 */
router.post('/:subscriptionId/add-seats', [
  validateSubscriptionOwnership,
  body('additionalSeats').isInt({ min: 1, max: 100 }).withMessage('Additional seats must be between 1 and 100'),
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { additionalSeats } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw createApiError('Subscription not found', 404);
  }

  const newSeatCount = subscription.seats + additionalSeats;

  // Validate seat limits
  if (subscription.tier === 'BASIC' && newSeatCount > 1) {
    throw createApiError('Basic plan is limited to 1 seat', 400);
  }

  if (subscription.tier === 'PRO' && newSeatCount > 50) {
    throw createApiError('Pro plan is limited to 50 seats', 400);
  }

  const result = await PaymentService.updateSubscription(
    userId,
    subscriptionId,
    { seats: newSeatCount },
    requestInfo
  );

  res.json({
    success: true,
    message: `Added ${additionalSeats} seats successfully`,
    data: { subscription: result.subscription },
  });
}));

export { router as subscriptionsRouter };
