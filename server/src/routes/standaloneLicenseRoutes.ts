/**
 * 🔥 STANDALONE LICENSE ROUTES
 * API endpoints for managing Call Sheet Pro and EDL Converter Pro licenses
 */

import express from 'express';
import { StandaloneLicenseService, STANDALONE_LICENSE_TYPES } from '../services/standaloneLicenseService.js';
import { authenticateToken } from '../middleware/auth.js';

const router: express.Router = express.Router();

/**
 * GET /api/standalone/licenses
 * Get user's standalone licenses
 */
router.get('/licenses', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'User email not found'
      });
    }

    const user = await StandaloneLicenseService.getStandaloneUser(userEmail);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Standalone user not found'
      });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType
        },
        licenses: user.licenses
      }
    });

  } catch (error) {
    console.error('Error getting standalone licenses:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get licenses'
    });
  }
});

/**
 * POST /api/standalone/licenses/validate
 * Validate a specific license
 */
router.post('/licenses/validate', authenticateToken, async (req, res) => {
  try {
    const { licenseType } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'User email not found'
      });
    }

    if (!licenseType || !Object.values(STANDALONE_LICENSE_TYPES).includes(licenseType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid license type'
      });
    }

    const validation = await StandaloneLicenseService.validateStandaloneLicense(
      userEmail,
      licenseType
    );

    return res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Error validating license:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate license'
    });
  }
});

/**
 * GET /api/standalone/licenses/:type/limits
 * Get license limits for a specific type
 */
router.get('/licenses/:type/limits', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'User email not found'
      });
    }

    if (!Object.values(STANDALONE_LICENSE_TYPES).includes(type as any)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid license type'
      });
    }

    const limits = await StandaloneLicenseService.getLicenseLimits(userEmail, type as any);

    if (!limits) {
      return res.status(404).json({
        success: false,
        error: 'License not found or invalid'
      });
    }

    return res.json({
      success: true,
      data: { limits }
    });

  } catch (error) {
    console.error('Error getting license limits:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get license limits'
    });
  }
});

/**
 * POST /api/standalone/licenses/:type/usage
 * Update license usage
 */
router.post('/licenses/:type/usage', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { action, metadata } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'User email not found'
      });
    }

    if (!Object.values(STANDALONE_LICENSE_TYPES).includes(type as any)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid license type'
      });
    }

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required'
      });
    }

    await StandaloneLicenseService.updateLicenseUsage(userEmail, type as any, {
      action,
      metadata
    });

    return res.json({
      success: true,
      message: 'Usage updated successfully'
    });

  } catch (error) {
    console.error('Error updating license usage:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update usage'
    });
  }
});

/**
 * POST /api/standalone/licenses/:type/check-feature
 * Check if user has access to a specific feature
 */
router.post('/licenses/:type/check-feature', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { feature } = req.body;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'User email not found'
      });
    }

    if (!Object.values(STANDALONE_LICENSE_TYPES).includes(type as any)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid license type'
      });
    }

    if (!feature) {
      return res.status(400).json({
        success: false,
        error: 'Feature is required'
      });
    }

    const hasAccess = await StandaloneLicenseService.hasFeatureAccess(
      userEmail,
      type as any,
      feature
    );

    return res.json({
      success: true,
      data: { hasAccess }
    });

  } catch (error) {
    console.error('Error checking feature access:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check feature access'
    });
  }
});

/**
 * POST /api/standalone/licenses/:type/deactivate
 * Deactivate a license
 */
router.post('/licenses/:type/deactivate', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'User email not found'
      });
    }

    if (!Object.values(STANDALONE_LICENSE_TYPES).includes(type as any)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid license type'
      });
    }

    await StandaloneLicenseService.deactivateLicense(userEmail, type as any);

    return res.json({
      success: true,
      message: 'License deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating license:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to deactivate license'
    });
  }
});

/**
 * GET /api/standalone/statistics
 * Get license statistics (admin only)
 */
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userRole = req.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const stats = await StandaloneLicenseService.getLicenseStatistics();

    return res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting license statistics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

export default router;
