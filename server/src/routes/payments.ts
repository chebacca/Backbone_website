import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
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
import { db } from '../services/db.js';

const router: Router = Router();

// Add request info to all payment routes
router.use(addRequestInfo);

/**
 * Create subscription with payment
 */
router.post('/create-subscription', [
  authenticateToken,
  requireEmailVerification,
  body('tier').isIn(['BASIC', 'PRO', 'ENTERPRISE']).withMessage('Valid tier required'),
  body('seats').isInt({ min: 1, max: 1000 }).withMessage('Seats must be between 1 and 1000'),
  body('paymentMethodId').notEmpty().withMessage('Payment method required'),
  body('billingAddress.firstName').trim().notEmpty().withMessage('First name required'),
  body('billingAddress.lastName').trim().notEmpty().withMessage('Last name required'),
  body('billingAddress.addressLine1').trim().notEmpty().withMessage('Address required'),
  body('billingAddress.city').trim().notEmpty().withMessage('City required'),
  body('billingAddress.postalCode').trim().notEmpty().withMessage('Postal code required'),
  body('billingAddress.country').isLength({ min: 2, max: 2 }).withMessage('Valid country code required'),
  body('acceptTerms').equals('true').withMessage('Terms must be accepted'),
  body('acceptPrivacy').equals('true').withMessage('Privacy policy must be accepted'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;
  const {
    tier,
    seats,
    paymentMethodId,
    billingAddress,
    taxInformation,
    businessProfile,
    acceptTerms,
    acceptPrivacy
  } = req.body;

  // Record consent for payment processing
  await ComplianceService.recordConsent(
    userId,
    'DATA_PROCESSING',
    true,
    '1.0',
    requestInfo.ip,
    requestInfo.userAgent
  );

  // Enterprise tier validation
  if (tier === 'ENTERPRISE' && seats < 10) {
    throw createApiError('Enterprise tier requires minimum 10 seats', 400);
  }

  const result = await PaymentService.createSubscription(
    userId,
    {
      tier,
      seats,
      paymentMethodId,
      billingAddress,
      taxInformation,
      businessProfile,
    },
    requestInfo
  );

  res.status(201).json({
    success: true,
    message: 'Subscription created successfully',
    data: {
      subscription: {
        id: result.subscription.id,
        tier: result.subscription.tier,
        status: result.subscription.status,
        seats: result.subscription.seats,
        pricePerSeat: result.subscription.pricePerSeat,
        currentPeriodEnd: result.subscription.currentPeriodEnd,
      },
      payment: {
        id: result.payment.id,
        amount: result.payment.amount,
        currency: result.payment.currency,
        status: result.payment.status,
        receiptUrl: result.payment.receiptUrl,
      },
      taxCalculation: result.taxCalculation,
    },
  });
}));

/**
 * Get payment history
 */
router.get('/history', [
  authenticateToken,
  requireEmailVerification,
], asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const skip = (page - 1) * limit;

  const payments = await PaymentService.getPaymentHistory(userId, {
    skip,
    take: limit,
  });

  res.json({
    success: true,
    data: {
      payments: payments.payments,
      pagination: {
        page,
        limit,
        total: payments.total,
        pages: Math.ceil(payments.total / limit),
      },
    },
  });
}));

/**
 * Get specific payment details
 */
router.get('/:paymentId', [
  authenticateToken,
  requireEmailVerification,
], asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paymentId } = req.params;

  const payment = await PaymentService.getPaymentDetails(userId, paymentId);

  if (!payment) {
    throw createApiError('Payment not found', 404);
  }

  res.json({
    success: true,
    data: { payment },
  });
}));

/**
 * Cancel subscription
 */
router.post('/cancel-subscription/:subscriptionId', [
  authenticateToken,
  requireEmailVerification,
  validateSubscriptionOwnership,
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long'),
  body('cancelAtPeriodEnd').optional().isBoolean().withMessage('Invalid cancel option'),
], asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const { reason, cancelAtPeriodEnd = true } = req.body;
  const userId = req.user!.id;
  const requestInfo = (req as any).requestInfo;

  const result = await PaymentService.cancelSubscription(
    userId,
    subscriptionId,
    {
      reason,
      cancelAtPeriodEnd,
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
 * Update payment method
 */
router.put('/payment-method/:subscriptionId', [
  authenticateToken,
  requireEmailVerification,
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
 * Webhook endpoint for Stripe
 */
router.post('/webhook', [
  // Raw body parser for webhook signature verification
  body().custom((value, { req }) => {
    (req as any).rawBody = (req as any).body;
    return true;
  }),
], asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const event = req.body;

  if (!signature) {
    throw createApiError('Missing Stripe signature', 400);
  }

  const result = await PaymentService.handleWebhook(event, signature);

  res.json(result);
}));

/**
 * Get pricing information
 */
router.get('/pricing', asyncHandler(async (req: Request, res: Response) => {
  const pricingTiers = [
    {
      id: 'BASIC',
      name: 'Basic',
      description: 'Perfect for individual creators and small teams',
      price: 29,
      priceId: 'price_basic_monthly',
      features: [
        'Single user license',
        'Core session management',
        'Basic workflow tools',
        'Local file storage',
        'Standard support',
        'Desktop application access',
        'Basic reporting',
      ],
      maxSeats: 1,
      popular: false,
    },
    {
      id: 'PRO',
      name: 'Pro',
      description: 'Ideal for growing production teams',
      price: 99,
      priceId: 'price_pro_monthly',
      features: [
        'Multi-user collaboration',
        'Advanced workflow automation',
        'AI Brain system access',
        'Real-time team coordination',
        'Advanced analytics & reporting',
        'Priority support',
        'Cloud storage integration',
        'Custom role assignments',
        'Timecard & approval system',
      ],
      maxSeats: 50,
      popular: true,
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      description: 'For large organizations and studios',
      price: null, // Custom pricing
      priceId: 'price_enterprise_custom',
      features: [
        'Unlimited seats with bulk licensing',
        'Dedicated account management',
        'Custom integrations & API access',
        'Advanced security & compliance',
        'White-label options',
        'On-premise deployment',
        '24/7 premium support',
        'Custom training & onboarding',
        'Advanced audit logging',
        'SSO integration',
      ],
      maxSeats: null, // Unlimited
      popular: false,
      enterprise: true,
    },
  ];

  res.json({
    success: true,
    data: { pricingTiers },
  });
}));

/**
 * Calculate tax for a given amount and address
 */
router.post('/calculate-tax', [
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
  body('billingAddress.country').isLength({ min: 2, max: 2 }).withMessage('Valid country code required'),
  body('billingAddress.state').optional().trim(),
  body('userType').optional().isIn(['individual', 'business']).withMessage('Valid user type required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { amount, billingAddress, userType = 'individual' } = req.body;

  const taxCalculation = await ComplianceService.calculateTax(
    amount,
    billingAddress,
    userType
  );

  res.json({
    success: true,
    data: { taxCalculation },
  });
}));

export { router as paymentsRouter };
