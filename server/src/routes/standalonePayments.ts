import { Router, Request, Response } from 'express';
import { StandalonePaymentService } from '../services/standalonePaymentService.js';
import { logger } from '../utils/logger.js';
import { 
  asyncHandler, 
  createApiError
} from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = Router();

/**
 * POST /api/standalone-payments/create-payment-intent
 * Create a payment intent for standalone products
 */
router.post('/create-payment-intent', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { items, currency = 'usd' } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createApiError('Items are required', 400);
  }

  // Validate items structure
  for (const item of items) {
    if (!item.product || !item.quantity || item.quantity < 1) {
      throw createApiError('Invalid item structure', 400);
    }
    if (!item.product.id || !item.product.name || !item.product.price) {
      throw createApiError('Invalid product structure', 400);
    }
  }

  try {
    const result = await StandalonePaymentService.createPaymentIntent(userId, items, currency);
    
    logger.info('Created standalone payment intent', {
      userId,
      orderId: result.orderId,
      amount: result.amount
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to create standalone payment intent', error);
    throw createApiError(
      error instanceof Error ? error.message : 'Failed to create payment intent',
      500
    );
  }
}));

/**
 * POST /api/standalone-payments/confirm-payment
 * Confirm payment completion for standalone products
 */
router.post('/confirm-payment', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    throw createApiError('Payment intent ID is required', 400);
  }

  try {
    const result = await StandalonePaymentService.handlePaymentSuccess(paymentIntentId);
    
    logger.info('Confirmed standalone payment', {
      userId,
      orderId: result.orderId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to confirm standalone payment', error);
    throw createApiError(
      error instanceof Error ? error.message : 'Failed to confirm payment',
      500
    );
  }
}));

/**
 * GET /api/standalone-payments/purchases
 * Get user's standalone purchases
 */
router.get('/purchases', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const purchases = await StandalonePaymentService.getUserPurchases(userId);
    
    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    logger.error('Failed to get user purchases', error);
    throw createApiError(
      error instanceof Error ? error.message : 'Failed to get purchases',
      500
    );
  }
}));

/**
 * POST /api/standalone-payments/validate-download
 * Validate download token and get download URL
 */
router.post('/validate-download', asyncHandler(async (req: Request, res: Response) => {
  const { token, productId } = req.body;

  if (!token || !productId) {
    throw createApiError('Token and product ID are required', 400);
  }

  try {
    const result = await StandalonePaymentService.validateDownloadToken(token, productId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to validate download token', error);
    throw createApiError(
      error instanceof Error ? error.message : 'Invalid download token',
      400
    );
  }
}));

/**
 * GET /api/standalone-payments/products
 * Get available standalone products
 */
router.get('/products', asyncHandler(async (req: Request, res: Response) => {
  // In a real implementation, this would fetch from a products database
  // For now, we'll return a static list
  const products = [
    {
      id: 'backbone-editor-pro',
      name: 'Backbone Editor Pro',
      description: 'Professional video editing suite with advanced timeline controls, multi-camera editing, and AI-powered color correction.',
      shortDescription: 'Professional video editing suite with AI-powered features',
      price: 299.99,
      originalPrice: 399.99,
      category: 'Video Editing',
      image: '/api/placeholder/400/300',
      features: [
        'Multi-camera editing support',
        'AI-powered color correction',
        'Advanced timeline controls',
        'Real-time collaboration',
        '4K/8K video support',
        'Professional audio mixing',
        'Motion graphics templates',
        'Cloud rendering support'
      ],
      requirements: [
        'Windows 10/11 or macOS 10.15+',
        '8GB RAM minimum (16GB recommended)',
        'DirectX 11 compatible graphics card',
        '50GB free disk space'
      ],
      rating: 4.8,
      reviewCount: 1247,
      downloads: 15420,
      tags: ['video-editing', 'professional', 'ai-powered', 'collaboration'],
      isPopular: true,
      fileSize: '2.1 GB',
      version: '2.4.1',
      lastUpdated: '2024-01-15',
      developer: 'BackboneLogic, Inc.',
      compatibility: ['Windows', 'macOS', 'Linux'],
      support: {
        email: true,
        documentation: true,
        updates: true,
        community: true
      }
    },
    {
      id: 'backbone-audio-master',
      name: 'Backbone Audio Master',
      description: 'Advanced audio production toolkit with professional-grade mixing, mastering, and sound design capabilities.',
      shortDescription: 'Professional audio production toolkit with 50+ effects',
      price: 199.99,
      originalPrice: 249.99,
      category: 'Audio Production',
      image: '/api/placeholder/400/300',
      features: [
        'Professional mixing console',
        '50+ audio effects',
        'Mastering suite',
        'MIDI support',
        'Real-time audio processing',
        'Multi-track recording',
        'Audio restoration tools',
        'VST plugin support'
      ],
      requirements: [
        'Windows 10/11 or macOS 10.15+',
        '4GB RAM minimum (8GB recommended)',
        'ASIO-compatible audio interface',
        '20GB free disk space'
      ],
      rating: 4.7,
      reviewCount: 892,
      downloads: 8930,
      tags: ['audio', 'mixing', 'mastering', 'effects'],
      isNew: true,
      fileSize: '1.8 GB',
      version: '1.2.0',
      lastUpdated: '2024-01-10',
      developer: 'BackboneLogic, Inc.',
      compatibility: ['Windows', 'macOS'],
      support: {
        email: true,
        documentation: true,
        updates: true,
        community: true
      }
    },
    {
      id: 'backbone-motion-graphics',
      name: 'Backbone Motion Graphics',
      description: 'Create stunning motion graphics and animations with our intuitive timeline-based editor.',
      shortDescription: 'Professional motion graphics and animation toolkit',
      price: 149.99,
      category: 'Motion Graphics',
      image: '/api/placeholder/400/300',
      features: [
        'Timeline-based animation editor',
        '3D text and shapes',
        'Particle systems',
        'Keyframe animation',
        'Template library',
        'Export to multiple formats',
        'Real-time preview',
        'Collaboration tools'
      ],
      requirements: [
        'Windows 10/11 or macOS 10.15+',
        '6GB RAM minimum (12GB recommended)',
        'OpenGL 3.3 compatible graphics',
        '30GB free disk space'
      ],
      rating: 4.6,
      reviewCount: 634,
      downloads: 5670,
      tags: ['motion-graphics', 'animation', '3d', 'templates'],
      fileSize: '1.5 GB',
      version: '3.1.2',
      lastUpdated: '2024-01-08',
      developer: 'BackboneLogic, Inc.',
      compatibility: ['Windows', 'macOS', 'Linux'],
      support: {
        email: true,
        documentation: true,
        updates: true,
        community: false
      }
    },
    {
      id: 'backbone-color-grading',
      name: 'Backbone Color Grading',
      description: 'Professional color grading and correction tool with advanced color wheels, curves, and AI-powered auto-correction.',
      shortDescription: 'Professional color grading with AI-powered correction',
      price: 179.99,
      originalPrice: 229.99,
      category: 'Color Grading',
      image: '/api/placeholder/400/300',
      features: [
        'Advanced color wheels',
        'Curves and levels',
        'AI auto-correction',
        'LUT support',
        'HDR workflow',
        'Scopes and vectorscope',
        'Batch processing',
        'Preset library'
      ],
      requirements: [
        'Windows 10/11 or macOS 10.15+',
        '8GB RAM minimum (16GB recommended)',
        'DirectX 11 compatible graphics',
        '25GB free disk space'
      ],
      rating: 4.9,
      reviewCount: 445,
      downloads: 3420,
      tags: ['color-grading', 'correction', 'ai', 'cinematic'],
      isPopular: true,
      fileSize: '1.2 GB',
      version: '2.0.3',
      lastUpdated: '2024-01-12',
      developer: 'BackboneLogic, Inc.',
      compatibility: ['Windows', 'macOS'],
      support: {
        email: true,
        documentation: true,
        updates: true,
        community: true
      }
    },
    {
      id: 'backbone-streaming-suite',
      name: 'Backbone Streaming Suite',
      description: 'Complete streaming solution with multi-platform broadcasting, scene composition, and real-time effects.',
      shortDescription: 'Complete streaming solution with multi-platform support',
      price: 249.99,
      category: 'Streaming',
      image: '/api/placeholder/400/300',
      features: [
        'Multi-platform streaming',
        'Scene composition',
        'Real-time effects',
        'Chat integration',
        'Recording capabilities',
        'Custom overlays',
        'Audio mixing',
        'Stream analytics'
      ],
      requirements: [
        'Windows 10/11 or macOS 10.15+',
        '8GB RAM minimum (16GB recommended)',
        'DirectX 11 compatible graphics',
        '40GB free disk space'
      ],
      rating: 4.5,
      reviewCount: 789,
      downloads: 6780,
      tags: ['streaming', 'broadcasting', 'live', 'content-creation'],
      fileSize: '2.8 GB',
      version: '1.8.4',
      lastUpdated: '2024-01-05',
      developer: 'BackboneLogic, Inc.',
      compatibility: ['Windows', 'macOS'],
      support: {
        email: true,
        documentation: true,
        updates: true,
        community: true
      }
    },
    {
      id: 'backbone-project-manager',
      name: 'Backbone Project Manager',
      description: 'Comprehensive project management tool designed specifically for creative teams.',
      shortDescription: 'Project management tool for creative teams',
      price: 99.99,
      originalPrice: 149.99,
      category: 'Project Management',
      image: '/api/placeholder/400/300',
      features: [
        'Task and milestone tracking',
        'Asset management',
        'Team collaboration',
        'Time tracking',
        'Budget management',
        'Client communication',
        'Progress reporting',
        'Integration with creative tools'
      ],
      requirements: [
        'Windows 10/11, macOS 10.15+, or Linux',
        '4GB RAM minimum (8GB recommended)',
        '10GB free disk space',
        'Internet connection for cloud sync'
      ],
      rating: 4.4,
      reviewCount: 523,
      downloads: 4560,
      tags: ['project-management', 'collaboration', 'productivity', 'creative'],
      fileSize: '800 MB',
      version: '4.2.1',
      lastUpdated: '2024-01-03',
      developer: 'BackboneLogic, Inc.',
      compatibility: ['Windows', 'macOS', 'Linux'],
      support: {
        email: true,
        documentation: true,
        updates: true,
        community: true
      }
    }
  ];

  res.json({
    success: true,
    data: products
  });
}));

export default router;
