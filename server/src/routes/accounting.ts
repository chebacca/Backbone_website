import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { firestoreService } from '../services/firestoreService.js';
import { asyncHandler, validationErrorHandler, createApiError } from '../middleware/errorHandler.js';
import { authenticateToken, addRequestInfo, requireAccounting } from '../middleware/auth.js';

const router: Router = Router();

// Apply request info and role guard to all accounting routes
router.use(addRequestInfo);
router.use(authenticateToken);
router.use(requireAccounting);

/**
 * Accounting: List payments with tax/AML/KYC context and minimal PII
 */
router.get('/payments', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('status').optional().isIn(['PENDING','SUCCEEDED','FAILED','CANCELLED','REFUNDED','PROCESSING']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 200);
  const status = (req.query.status as string) || undefined;
  const from = (req.query.from as string) || undefined;
  const to = (req.query.to as string) || undefined;
  const skip = (page - 1) * limit;

  const payments = await firestoreService.getAllPayments();
  const users = await firestoreService.getAllUsers();
  const filtered = payments
    .filter(p => !status || p.status === status)
    .filter(p => !from || new Date(p.createdAt) >= new Date(from))
    .filter(p => !to || new Date(p.createdAt) <= new Date(to))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pageItems = filtered.slice(skip, skip + limit).map((p) => {
    const user = users.find(u => u.id === p.userId);
    return {
      id: p.id,
      createdAt: p.createdAt,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      stripeInvoiceId: p.stripeInvoiceId,
      taxAmount: p.taxAmount,
      taxRate: p.taxRate,
      taxJurisdiction: p.taxJurisdiction,
      billingAddress: {
        country: p.billingAddressSnapshot?.country,
        state: p.billingAddressSnapshot?.state,
        city: p.billingAddressSnapshot?.city,
        postalCode: p.billingAddressSnapshot?.postalCode,
      },
      user: user ? {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        kycStatus: (user as any).kycStatus,
        taxInformation: {
          taxResidency: (user as any)?.taxInformation?.taxResidency,
          taxIdType: (user as any)?.taxInformation?.taxIdType,
          vatNumber: (user as any)?.taxInformation?.vatNumber,
          taxExempt: (user as any)?.taxInformation?.taxExempt,
        },
        businessProfile: {
          companyName: (user as any)?.businessProfile?.companyName,
          registrationNumber: (user as any)?.businessProfile?.registrationNumber,
          country: (user as any)?.businessProfile?.country,
        },
      } : undefined,
    };
  });

  res.json({
    success: true,
    data: {
      payments: pageItems,
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit),
      },
    },
  });
}));

/**
 * Accounting: Export payments window as rows for CSV
 */
router.post('/payments/export', [
  body('from').isISO8601(),
  body('to').isISO8601(),
  body('includePII').optional().isBoolean(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { from, to, includePII = false } = req.body as { from: string; to: string; includePII?: boolean };
  const payments = (await firestoreService.getAllPayments())
    .filter(p => new Date(p.createdAt) >= new Date(from) && new Date(p.createdAt) <= new Date(to))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const users = await firestoreService.getAllUsers();

  const rows = payments.map(p => {
    const user = users.find(u => u.id === p.userId);
    return {
      date: new Date(p.createdAt).toISOString(),
      invoice: p.stripeInvoiceId || '',
      amount_cents: p.amount,
      currency: p.currency,
      tax_cents: p.taxAmount ?? 0,
      tax_rate: p.taxRate ?? 0,
      jurisdiction: p.taxJurisdiction || '',
      user_email: user?.email || '',
      user_tax_residency: (user as any)?.taxInformation?.taxResidency || '',
      user_tax_id_type: (user as any)?.taxInformation?.taxIdType || '',
      vat_number: (user as any)?.taxInformation?.vatNumber || '',
      ...(includePII ? {
        billing_country: p.billingAddressSnapshot?.country || '',
        billing_state: p.billingAddressSnapshot?.state || '',
        billing_city: p.billingAddressSnapshot?.city || '',
        billing_postal: p.billingAddressSnapshot?.postalCode || '',
      } : {}),
    };
  });

  res.json({ success: true, data: { rows } });
}));

/**
 * Accounting: KYC overview
 */
router.get('/kyc', [
  query('status').optional().isIn(['PENDING','IN_PROGRESS','COMPLETED','FAILED','EXPIRED'])
], asyncHandler(async (req: Request, res: Response) => {
  const status = (req.query.status as string) || undefined;
  const users = await firestoreService.getAllUsers();

  const kyc = users
    .filter(u => !status || (u as any).kycStatus === status)
    .map(u => ({
      id: u.id,
      email: u.email,
      kycStatus: (u as any).kycStatus,
      kycCompletedAt: (u as any).kycCompletedAt,
      identityVerified: (u as any).identityVerified,
      complianceProfile: {
        firstName: (u as any)?.complianceProfile?.firstName,
        lastName: (u as any)?.complianceProfile?.lastName,
        nationality: (u as any)?.complianceProfile?.nationality,
        countryOfResidence: (u as any)?.complianceProfile?.countryOfResidence,
      },
      businessProfile: {
        companyName: (u as any)?.businessProfile?.companyName,
        registrationNumber: (u as any)?.businessProfile?.registrationNumber,
        country: (u as any)?.businessProfile?.country,
      }
    }));

  res.json({ success: true, data: { users: kyc } });
}));

/**
 * Accounting: Payment detail with invoice data (complianceData)
 */
router.get('/payments/:paymentId', asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const payment = await firestoreService.getPaymentById(paymentId);
  if (!payment) throw createApiError('Payment not found', 404);
  const user = await firestoreService.getUserById(payment.userId);

  const data = {
    id: payment.id,
    createdAt: payment.createdAt,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    stripeInvoiceId: payment.stripeInvoiceId,
    taxAmount: payment.taxAmount,
    taxRate: payment.taxRate,
    taxJurisdiction: payment.taxJurisdiction,
    billingAddress: {
      country: payment.billingAddressSnapshot?.country,
      state: payment.billingAddressSnapshot?.state,
      city: payment.billingAddressSnapshot?.city,
      postalCode: payment.billingAddressSnapshot?.postalCode,
    },
    complianceData: payment.complianceData, // contains invoice structure (items, totals)
    user: user ? {
      id: user.id,
      email: user.email,
      kycStatus: (user as any).kycStatus,
    } : undefined,
  };

  res.json({ success: true, data: { payment: data } });
}));

/**
 * Accounting: Privacy consent history for a user (minimal, no IP/UA unless includePII=true)
 */
router.get('/users/:userId/consent-history', [
  query('includePII').optional().isBoolean(),
], asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const includePII = String(req.query.includePII || 'false') === 'true';
  const consents = await firestoreService.getPrivacyConsentsByUser(userId);
  const rows = consents.map(c => ({
    consentType: c.consentType,
    granted: c.consentGranted,
    version: c.consentVersion,
    consentDate: c.consentDate,
    ...(includePII ? { ipAddress: c.ipAddress, userAgent: c.userAgent } : {}),
  }));
  res.json({ success: true, data: { consents: rows } });
}));

export { router as accountingRouter };


