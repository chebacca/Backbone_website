import { Router, Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService.js';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth.js';
import { JwtUtil } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

const router: Router = Router();

/**
 * @route GET /api/invoices
 * @desc Get invoices based on user role:
 *       - SUPERADMIN: Get all invoices
 *       - Regular users: Get only their own invoices
 * @access Private
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    let invoices;
    
    // SUPERADMIN can see all invoices
    if (userRole === 'SUPERADMIN') {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const status = (req.query.status as string) || undefined;
      const email = (req.query.email as string) || undefined;
      const from = (req.query.from as string) || undefined;
      const to = (req.query.to as string) || undefined;
      
      invoices = await InvoiceService.getAllInvoices(page, limit, {
        status,
        email,
        from,
        to
      });
    } else {
      // Regular users can only see their own invoices
      invoices = await InvoiceService.getUserInvoices(userId);
    }
    
    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    logger.error('Error getting invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invoices',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/invoices/:id
 * @desc Get specific invoice by ID
 * @access Private - User must own the invoice or be SUPERADMIN
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    const invoice = await InvoiceService.getInvoiceById(id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }
    
    // Check access: user must own this invoice or be SUPERADMIN
    if (invoice.userId !== userId && userRole !== 'SUPERADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only view your own invoices',
      });
    }
    
    return res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    logger.error('Error getting invoice by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/invoices/:id/pdf
 * @desc Render a real HTML invoice document (simple server-side template)
 * @access Private - User must own the invoice or be SUPERADMIN
 */
router.get('/:id/pdf', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id is the invoice number (stripeInvoiceId)
    // Try to set user from query token if not present (for direct link opening)
    if (!req.user && typeof req.query.token === 'string') {
      try {
        const payload = JwtUtil.verifyToken(req.query.token as string);
        (req as any).user = { id: (payload as any).userId, email: (payload as any).email, role: (payload as any).role || 'USER', name: (payload as any).name || '' };
      } catch {
        // ignore, will fail auth below
      }
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    const payment = await InvoiceService.getInvoiceById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Check access: user must own this invoice or be SUPERADMIN
    if (!userId || (payment.userId !== userId && userRole !== 'SUPERADMIN')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const subscription = (payment as any).subscription;
    const owner = subscription?.user || {};

    const issuedAt = new Date(payment.createdAt);
    const dueAt = new Date((payment as any)?.complianceData?.dueDate || issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    const items = ((payment as any)?.complianceData?.items || []).map((it: any) => ({
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
      taxRate: it.taxRate,
      taxAmount: it.taxAmount,
    }));

    const billing = payment.billingAddressSnapshot || owner?.billingAddress || {};
    const subtotal = (payment as any)?.complianceData?.subtotal ?? Math.round(((payment.amount || 0) - (payment.taxAmount || 0)) / 100 * 100) / 100;
    const taxTotal = ((payment.taxAmount || 0) / 100).toFixed(2);
    const total = ((payment.amount || 0) / 100).toFixed(2);

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${payment.stripeInvoiceId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 24px; color: #111; }
    .container { max-width: 820px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .brand { font-size: 20px; font-weight: 700; color: #0a84ff; }
    .muted { color: #666; }
    .section { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; }
    th { background: #eef2f7; font-weight: 600; }
    .right { text-align: right; }
    .total { font-weight: 700; font-size: 18px; }
    .footer { margin-top: 24px; color: #666; font-size: 12px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
    .badge-success { background: #e7f8ef; color: #0f8f3f; }
    .badge-pending { background: #fff5e6; color: #9a6000; }
    .badge-failed { background: #fde8e8; color: #c81e1e; }
  </style>
  </head>
  <body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand">Backbone Logic, Inc.</div>
        <div class="muted">Invoice # ${payment.stripeInvoiceId}</div>
        <div class="muted">Issued: ${issuedAt.toLocaleDateString()}</div>
        <div class="muted">Due: ${dueAt.toLocaleDateString()}</div>
      </div>
      <div class="right">
        <div>Amount Due</div>
        <div class="total">$${total}</div>
        <div><span class="badge ${payment.status === 'SUCCEEDED' ? 'badge-success' : payment.status === 'FAILED' ? 'badge-failed' : 'badge-pending'}">${payment.status}</span></div>
      </div>
    </div>

    <div class="section">
      <strong>Billed To</strong>
      <div>${owner?.name || owner?.email || 'Customer'}</div>
      <div>${owner?.email || ''}</div>
      <div>${billing.addressLine1 || ''} ${billing.addressLine2 || ''}</div>
      <div>${billing.city || ''} ${billing.state || ''} ${billing.postalCode || ''}</div>
      <div>${billing.country || ''}</div>
    </div>

    <div class="section">
      <strong>Line Items</strong>
      <table>
        <thead>
          <tr><th>Description</th><th>Qty</th><th class="right">Unit</th><th class="right">Total</th></tr>
        </thead>
        <tbody>
          ${items.map((it: any) => `<tr>
            <td>${it.description}</td>
            <td>${it.quantity}</td>
            <td class="right">$${(it.unitPrice || 0).toFixed ? it.unitPrice.toFixed(2) : Number(it.unitPrice).toFixed(2)}</td>
            <td class="right">$${(it.total || 0).toFixed ? it.total.toFixed(2) : Number(it.total).toFixed(2)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section" style="display:flex; justify-content:flex-end;">
      <table style="width:auto;">
        <tbody>
          <tr><td class="right">Subtotal</td><td class="right" style="min-width:120px;">$${(subtotal || 0).toFixed ? subtotal.toFixed(2) : Number(subtotal).toFixed(2)}</td></tr>
          <tr><td class="right">Tax</td><td class="right">$${taxTotal}</td></tr>
          <tr><td class="right total">Total</td><td class="right total">$${total}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      Thank you for your business. For billing questions, contact support@backbonelogic.com.
    </div>
  </div>
  </body>
  </html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    logger.error('Error rendering invoice:', error);
    return res.status(500).json({ success: false, message: 'Failed to render invoice' });
  }
});

/**
 * @route POST /api/invoices
 * @desc Create a new invoice for a subscription
 * @access Private - User must own the subscription or be SUPERADMIN
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required',
      });
    }
    
    // Verify subscription ownership unless SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const subscription = await InvoiceService.getSubscriptionById(subscriptionId);
      if (!subscription || subscription.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only create invoices for your own subscriptions',
        });
      }
    }
    
    const invoice = await InvoiceService.createInvoice(subscriptionId);
    
    return res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully',
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route PUT /api/invoices/:id/status
 * @desc Update invoice status - SUPERADMIN only
 * @access Private (SUPERADMIN only)
 */
router.put('/:id/status', authenticateToken, requireRole(['SUPERADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }
    
    const invoice = await InvoiceService.updateInvoiceStatus(id, status);
    
    return res.json({
      success: true,
      data: invoice,
      message: 'Invoice status updated successfully',
    });
  } catch (error) {
    logger.error('Error updating invoice status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update invoice status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route DELETE /api/invoices/:id
 * @desc Delete invoice - SUPERADMIN only
 * @access Private (SUPERADMIN only)
 */
router.delete('/:id', authenticateToken, requireRole(['SUPERADMIN']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await InvoiceService.deleteInvoice(id);
    
    return res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Admin routes - moved to separate admin routes file
// These routes are now handled by /api/admin/invoices/*

export default router;
