import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();

// ============================================================================
// CALLSHEETS API - Basic implementation for Cloud Function
// ============================================================================

/**
 * GET /api/callsheets
 * Get all call sheets with pagination
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🔍 [GET /callsheets] Cloud Function endpoint called');
    
    const { page = '1', limit = '20' } = req.query;
    
    // For now, return empty array since this is a licensing website
    // In the future, this could integrate with a callsheets database
    res.json({
      success: true,
      data: {
        callSheets: [],
        total: 0,
        pages: 0,
        currentPage: parseInt(page as string),
        limit: parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Error in GET /callsheets:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/callsheets/:id
 * Get call sheet by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [GET /callsheets/${id}] Cloud Function endpoint called`);
    
    // For now, return 404 since this is a licensing website
    res.status(404).json({
      success: false,
      error: 'Call sheet not found - this is a licensing website'
    });
  } catch (error) {
    console.error(`Error in GET /callsheets/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/callsheets
 * Create new call sheet (not supported in licensing website)
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  res.status(405).json({
    success: false,
    error: 'Method not allowed - call sheets are not supported in this licensing website'
  });
});

/**
 * PUT /api/callsheets/:id
 * Update call sheet (not supported in licensing website)
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  res.status(405).json({
    success: false,
    error: 'Method not allowed - call sheets are not supported in this licensing website'
  });
});

/**
 * DELETE /api/callsheets/:id
 * Delete call sheet (not supported in licensing website)
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  res.status(405).json({
    success: false,
    error: 'Method not allowed - call sheets are not supported in this licensing website'
  });
});

export { router as callsheetsRouter };
