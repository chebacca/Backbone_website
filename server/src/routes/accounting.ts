import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { firestoreService } from '../services/firestoreService.js';
import { asyncHandler, validationErrorHandler, createApiError } from '../middleware/errorHandler.js';
import { authenticateToken, addRequestInfo, requireAccounting } from '../middleware/auth.js';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const router: Router = Router();

// Apply request info and role guard to all accounting routes
router.use(addRequestInfo);
router.use(authenticateToken);
router.use(requireAccounting);

/**
 * Accounting: Overview aggregates (revenue, tax by jurisdiction, kyc status counts)
 */
router.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  const [payments, users] = await Promise.all([
    firestoreService.getAllPayments(),
    firestoreService.getAllUsers(),
  ]);

  const succeeded = payments.filter(p => p.status === 'SUCCEEDED');
  const totalRevenue = succeeded.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalTax = succeeded.reduce((sum, p) => sum + (p.taxAmount || 0), 0);

  const taxByJurisdiction: Record<string, number> = {};
  for (const p of succeeded) {
    const j = p.taxJurisdiction || 'UNKNOWN';
    taxByJurisdiction[j] = (taxByJurisdiction[j] || 0) + (p.taxAmount || 0);
  }

  const kycCounts: Record<string, number> = {};
  for (const u of users) {
    const status = (u as any).kycStatus || 'PENDING';
    kycCounts[status] = (kycCounts[status] || 0) + 1;
  }

  const recent = succeeded
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      createdAt: p.createdAt,
      amount: p.amount,
      currency: p.currency,
      stripeInvoiceId: p.stripeInvoiceId,
      taxAmount: p.taxAmount,
      taxRate: p.taxRate,
      jurisdiction: p.taxJurisdiction,
    }));

  res.json({
    success: true,
    data: {
      totals: {
        revenue_cents: totalRevenue,
        tax_cents: totalTax,
        paymentsCount: succeeded.length,
      },
      taxByJurisdiction,
      kycCounts,
      recentPayments: recent,
    }
  });
}));

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
 * Accounting: Tax summary by jurisdiction and country
 */
router.get('/tax/summary', [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
], asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };
  const payments = (await firestoreService.getAllPayments())
    .filter(p => p.status === 'SUCCEEDED')
    .filter(p => !from || new Date(p.createdAt) >= new Date(from))
    .filter(p => !to || new Date(p.createdAt) <= new Date(to));

  const byJurisdiction: Record<string, { tax_cents: number; taxable_cents: number; count: number }> = {};
  const byCountry: Record<string, { tax_cents: number; taxable_cents: number; count: number }> = {};

  for (const p of payments) {
    const tax = p.taxAmount || 0;
    const amount = p.amount || 0;
    const j = p.taxJurisdiction || 'UNKNOWN';
    const c = p.billingAddressSnapshot?.country || 'UNKNOWN';
    byJurisdiction[j] = byJurisdiction[j] || { tax_cents: 0, taxable_cents: 0, count: 0 };
    byJurisdiction[j].tax_cents += tax;
    byJurisdiction[j].taxable_cents += amount - tax;
    byJurisdiction[j].count += 1;
    byCountry[c] = byCountry[c] || { tax_cents: 0, taxable_cents: 0, count: 0 };
    byCountry[c].tax_cents += tax;
    byCountry[c].taxable_cents += amount - tax;
    byCountry[c].count += 1;
  }

  res.json({ success: true, data: { byJurisdiction, byCountry } });
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

/**
 * Accounting: Users with latest legal acceptance snapshot
 */
router.get('/consents/latest', asyncHandler(async (req: Request, res: Response) => {
  const users = await firestoreService.getAllUsers();
  const rows = users.map((u: any) => ({
    id: u.id,
    email: u.email,
    termsVersionAccepted: u.termsVersionAccepted || null,
    termsAcceptedAt: u.termsAcceptedAt || null,
    privacyPolicyVersionAccepted: u.privacyPolicyVersionAccepted || null,
    privacyPolicyAcceptedAt: u.privacyPolicyAcceptedAt || null,
  }));
  res.json({ success: true, data: { users: rows } });
}));

/**
 * Accounting: Compliance events (read-only)
 */
router.get('/compliance-events', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 }),
  query('severity').optional().isIn(['LOW','MEDIUM','HIGH','CRITICAL']),
  query('eventType').optional().isString(),
  query('resolved').optional().isIn(['true','false'])
], asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 200);
  const severity = req.query.severity as string | undefined;
  const eventType = req.query.eventType as string | undefined;
  const resolvedStr = req.query.resolved as string | undefined;
  const resolved = resolvedStr === undefined ? undefined : resolvedStr === 'true';
  const skip = (page - 1) * limit;

  const eventsAll = await firestoreService.getComplianceEvents({ severity, eventType, resolved });
  const total = eventsAll.length;
  const events = eventsAll.slice(skip, skip + limit);
  res.json({ success: true, data: { events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
}));

export { router as accountingRouter };

/**
 * PDF generation helpers (for cover sheets / worksheets)
 * Basic text-only PDFs to avoid adding heavy headless browsers.
 */
router.post('/filings/pdf', asyncHandler(async (req: Request, res: Response) => {
  const { title, company, period, rows, footerNote } = req.body as {
    title: string;
    company: { legalName?: string; addressLine1?: string; addressLine2?: string; city?: string; region?: string; postalCode?: string; country?: string; taxId?: string; contactEmail?: string };
    period: string;
    rows: Array<{ c1: string; c2: string; c3?: string; c4?: string }>;
    footerNote?: string;
  };

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let y = 760;
  const drawText = (text: string, x: number, yPos: number, bold = false, size = 12) => {
    page.drawText(text, { x, y: yPos, size, font: bold ? fontBold : font });
  };

  drawText(title || 'Filing Worksheet', 50, y, true, 16); y -= 20;
  drawText('Company', 50, y, true); y -= 16;
  drawText(company?.legalName || '-', 50, y); y -= 14;
  drawText(`${company?.addressLine1 || ''} ${company?.addressLine2 || ''}`.trim(), 50, y); y -= 14;
  drawText(`${company?.city || ''} ${company?.region || ''} ${company?.postalCode || ''} ${company?.country || ''}`.trim(), 50, y); y -= 14;
  drawText(`Tax ID: ${company?.taxId || '-'}`, 50, y); y -= 14;
  drawText(`Contact: ${company?.contactEmail || '-'}`, 50, y); y -= 20;
  drawText(`Period: ${period}`, 50, y); y -= 20;

  // Table header
  drawText('Item', 50, y, true); drawText('Value 1', 250, y, true); drawText('Value 2', 400, y, true); y -= 16;
  rows.forEach(r => {
    if (y < 60) { y = 760; }
    drawText(r.c1, 50, y);
    drawText(r.c2, 250, y);
    if (r.c3) drawText(r.c3, 400, y);
    if (r.c4) drawText(r.c4, 500, y);
    y -= 14;
  });

  if (footerNote) {
    y -= 20;
    drawText(footerNote, 50, y);
  }

  const pdfBytes = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="filing.pdf"');
  res.send(Buffer.from(pdfBytes));
}));


