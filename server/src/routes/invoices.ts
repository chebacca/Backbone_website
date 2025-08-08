import { Router, Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService.js';
import { authMiddleware } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router: Router = Router();

/**
 * @route GET /api/invoices
 * @desc Get all invoices for the authenticated user
 * @access Private
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const invoices = await InvoiceService.getUserInvoices(userId);
    
    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    logger.error('Error getting user invoices:', error);
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
 * @access Private
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.getInvoiceById(id);
    
    // Check if user owns this invoice
    if (invoice.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
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
 * @route POST /api/invoices
 * @desc Create a new invoice for a subscription
 * @access Private
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required',
      });
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
 * @desc Update invoice status
 * @access Private (Admin only)
 */
router.put('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    
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
 * @route GET /api/invoices/:id/pdf
 * @desc Generate PDF for invoice
 * @access Private
 */
router.get('/:id/pdf', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pdfUrl = await InvoiceService.generateInvoicePDF(id);
    
    res.json({
      success: true,
      data: { pdfUrl },
      message: 'PDF generated successfully',
    });
  } catch (error) {
    logger.error('Error generating invoice PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route POST /api/invoices/:id/send
 * @desc Send invoice email
 * @access Private
 */
router.post('/:id/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await InvoiceService.sendInvoiceEmail(id);
    
    res.json({
      success: true,
      message: 'Invoice email sent successfully',
    });
  } catch (error) {
    logger.error('Error sending invoice email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Admin routes
/**
 * @route GET /api/admin/invoices
 * @desc Get all invoices (admin only)
 * @access Private (Admin only)
 */
router.get('/admin/all', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await InvoiceService.getAllInvoices(page, limit);
    
    return res.json({
      success: true,
      data: result.invoices,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    logger.error('Error getting all invoices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get invoices',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route GET /api/admin/invoices/summary
 * @desc Get invoice summary statistics (admin only)
 * @access Private (Admin only)
 */
router.get('/admin/summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    
    const summary = await InvoiceService.getInvoiceSummary();
    
    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Error getting invoice summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get invoice summary',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route DELETE /api/admin/invoices/:id
 * @desc Delete invoice (admin only)
 * @access Private (Admin only)
 */
router.delete('/admin/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    
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

export default router;
