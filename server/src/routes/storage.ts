/**
 * Storage Analytics and Management Routes
 * 
 * Handles storage usage tracking, warnings, and capacity management
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { firestoreService } from '../services/firestoreService.js';

const router: Router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// Storage usage thresholds (matching client-side)
const STORAGE_WARNING_THRESHOLDS = {
  warning: 0.85, // 85%
  critical: 0.95, // 95%
  emergency: 0.98 // 98%
} as const;

// License tier storage limits (in GB)
const TIER_STORAGE_LIMITS = {
  BASIC: 5, // Updated from free tier
  PRO: 50,
  ENTERPRISE: -1 // Unlimited
} as const;

/**
 * GET /api/storage/usage
 * Get current storage usage for authenticated user
 */
router.get('/usage', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    // Get user's active subscription to determine tier
    const user = await firestoreService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const subscriptions = await firestoreService.getSubscriptionsByUserId(userId);
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const subscription = activeSubscriptions[0];
    const tier = subscription?.tier || 'BASIC';
    const storageLimit = TIER_STORAGE_LIMITS[tier as keyof typeof TIER_STORAGE_LIMITS] || TIER_STORAGE_LIMITS.BASIC;

    // Calculate storage usage from various sources
    // This is a simplified calculation - in production you'd integrate with actual storage providers
    let totalUsageBytes = 0;
    const breakdown = {
      firestore: 0,
      gcs: 0,
      s3: 0,
      azure: 0,
      local: 0
    };

    // Get usage from licenses/projects (placeholder calculation)
    const licenses = await firestoreService.getLicensesByUserId(userId);
    // Note: Analytics data would need to be implemented in Firestore if needed
    // For now, we'll use placeholder data

    // Estimate storage usage based on license count
    // In production, this would query actual storage providers
    for (const license of licenses) {
      const eventCount = 10; // Placeholder - would come from actual analytics
      const estimatedBytes = eventCount * 1024; // 1KB per event (rough estimate)
      totalUsageBytes += estimatedBytes;
      
      // Distribute across storage backends (simplified)
      breakdown.firestore += estimatedBytes * 0.6;
      breakdown.gcs += estimatedBytes * 0.2;
      breakdown.s3 += estimatedBytes * 0.15;
      breakdown.azure += estimatedBytes * 0.05;
    }

    // Add some base usage for account data
    totalUsageBytes += 10 * 1024 * 1024; // 10MB base usage

    const usageGB = totalUsageBytes / (1024 * 1024 * 1024);
    let percentage = 0;
    let warningLevel = 'none';

    if (storageLimit > 0) {
      percentage = (usageGB / storageLimit) * 100;
      
      if (percentage >= STORAGE_WARNING_THRESHOLDS.emergency * 100) {
        warningLevel = 'emergency';
      } else if (percentage >= STORAGE_WARNING_THRESHOLDS.critical * 100) {
        warningLevel = 'critical';
      } else if (percentage >= STORAGE_WARNING_THRESHOLDS.warning * 100) {
        warningLevel = 'warning';
      }
    }

    return res.json({
      success: true,
      data: {
        used: totalUsageBytes,
        usedGB: Math.round(usageGB * 100) / 100,
        limit: storageLimit,
        percentage: Math.round(percentage * 100) / 100,
        warningLevel,
        tier,
        breakdown: {
          firestore: Math.round(breakdown.firestore / (1024 * 1024 * 1024) * 100) / 100,
          gcs: Math.round(breakdown.gcs / (1024 * 1024 * 1024) * 100) / 100,
          s3: Math.round(breakdown.s3 / (1024 * 1024 * 1024) * 100) / 100,
          azure: Math.round(breakdown.azure / (1024 * 1024 * 1024) * 100) / 100,
          local: Math.round(breakdown.local / (1024 * 1024 * 1024) * 100) / 100,
          total: Math.round(usageGB * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('Error fetching storage usage:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch storage usage',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * GET /api/storage/breakdown
 * Get detailed storage breakdown by provider
 */
router.get('/breakdown', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    // This would integrate with actual storage provider APIs in production
    // For now, return estimated breakdown based on user activity
    
    const licenses = await firestoreService.getLicensesByUserId(userId);

    let totalEvents = 0;
    for (const license of licenses) {
      totalEvents += 10; // Placeholder - would come from actual analytics
    }

    // Estimate storage distribution
    const baseStorage = 10 * 1024 * 1024; // 10MB base
    const eventStorage = totalEvents * 1024; // 1KB per event
    const totalStorage = baseStorage + eventStorage;

    const breakdown = {
      firestore: Math.round((totalStorage * 0.6) / (1024 * 1024) * 100) / 100, // MB
      gcs: Math.round((totalStorage * 0.2) / (1024 * 1024) * 100) / 100,
      s3: Math.round((totalStorage * 0.15) / (1024 * 1024) * 100) / 100,
      azure: Math.round((totalStorage * 0.05) / (1024 * 1024) * 100) / 100,
      local: 0,
      total: Math.round(totalStorage / (1024 * 1024) * 100) / 100
    };

    return res.json({
      success: true,
      data: breakdown
    });

  } catch (error) {
    console.error('Error fetching storage breakdown:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch storage breakdown',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * POST /api/storage/purchase
 * Initiate additional storage purchase
 */
router.post('/purchase', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { additionalGB } = req.body;

  if (!additionalGB || additionalGB < 1 || additionalGB > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Invalid storage amount. Must be between 1 and 1000 GB.'
    });
  }

  try {
    // Get user's subscription to determine pricing
    const user = await firestoreService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const subscriptions = await firestoreService.getSubscriptionsByUserId(userId);
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (activeSubscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const subscription = activeSubscriptions[0];
    const tier = subscription.tier;

    // Pricing per GB per month
    const pricing = {
      BASIC: 0.15, // $0.15/GB/month
      PRO: 0.10,   // $0.10/GB/month  
      ENTERPRISE: 0.08 // $0.08/GB/month (volume discount)
    };

    const pricePerGB = pricing[tier as keyof typeof pricing] || pricing.BASIC;
    const monthlyPrice = additionalGB * pricePerGB;

    // In production, this would integrate with Stripe or payment processor
    // For now, return a mock payment URL
    const paymentUrl = `${process.env.FRONTEND_URL}/payment/storage?amount=${monthlyPrice}&storage=${additionalGB}&subscription=${subscription.id}`;

    // Log the storage purchase request
    console.log(`Storage purchase request: User ${userId}, ${additionalGB}GB, $${monthlyPrice}/month`);

    return res.json({
      success: true,
      data: {
        additionalGB,
        monthlyPrice,
        pricePerGB,
        paymentUrl,
        tier
      }
    });

  } catch (error) {
    console.error('Error initiating storage purchase:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate storage purchase',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

/**
 * GET /api/storage/alerts
 * Get storage alerts for user
 */
router.get('/alerts', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    // Get current storage usage
    const usageResponse = await fetch(`${req.protocol}://${req.get('host')}/api/storage/usage`, {
      headers: {
        'Authorization': req.headers.authorization || ''
      }
    });

    if (!usageResponse.ok) {
      throw new Error('Failed to fetch storage usage');
    }

    const usageData = await usageResponse.json();
    const usage = usageData.data;

    const alerts = [];

    if (usage.warningLevel !== 'none' && usage.limit > 0) {
      const alertConfig = {
        warning: {
          title: 'Storage Usage Warning',
          severity: 'warning',
          message: `You're using ${usage.percentage}% of your ${usage.limit}GB storage limit.`
        },
        critical: {
          title: 'Critical Storage Usage',
          severity: 'error',
          message: `You're using ${usage.percentage}% of your ${usage.limit}GB storage limit. Your account may be restricted soon.`
        },
        emergency: {
          title: 'Storage Limit Almost Reached',
          severity: 'error',
          message: `URGENT: You're using ${usage.percentage}% of your ${usage.limit}GB storage limit. New uploads will be blocked soon.`
        }
      };

      const config = alertConfig[usage.warningLevel as keyof typeof alertConfig];
      if (config) {
        alerts.push({
          id: `storage-${usage.warningLevel}-${Date.now()}`,
          type: usage.warningLevel,
          title: config.title,
          message: config.message,
          severity: config.severity,
          timestamp: new Date(),
          actionRequired: usage.warningLevel !== 'warning'
        });
      }
    }

    return res.json({
      success: true,
      data: {
        alerts,
        usage
      }
    });

  } catch (error) {
    console.error('Error fetching storage alerts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch storage alerts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;
