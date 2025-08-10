import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.js';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
      });
      return;
    }

    // Verify JWT token
    const payload = JwtUtil.verifyToken(token);

    // Block access if token is interim (2FA pending)
    if ((payload as any).twofaPending) {
      res.status(401).json({
        success: false,
        error: 'Two-factor authentication required',
        code: 'TWO_FACTOR_REQUIRED',
      });
      return;
    }
    
    // Get user to ensure they still exist and are active (Firestore authoritative)
    const user = await firestoreService.getUserById(payload.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
    };

    next();
  } catch (error) {
    logger.error('Token authentication failed', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to require email verification
 */
export const requireEmailVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

  const user = await firestoreService.getUserById(req.user.id);

    if (!user?.isEmailVerified) {
      res.status(403).json({
        success: false,
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Email verification check failed', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

/**
 * Middleware to require specific user roles
 */
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Role check failed', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole(['SUPERADMIN', 'ADMIN']);

/**
 * Alias for authenticateToken for backward compatibility
 */
export const authMiddleware = authenticateToken;

/**
 * Middleware to require enterprise admin role
 */
// Deprecated: enterprise admin role removed. Keep alias to ADMIN for backward compatibility
export const requireEnterpriseAdmin = requireRole(['ADMIN']);

/**
 * Middleware to require superadmin role
 */
export const requireSuperAdmin = requireRole(['SUPERADMIN']);

/**
 * Optional authentication - adds user to request if token is valid, but doesn't require it
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const payload = JwtUtil.verifyToken(token);
        const user = await firestoreService.getUserById(payload.userId);

        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name || '',
          };
        }
      } catch (error) {
        // Token invalid but that's ok for optional auth
        logger.debug('Optional auth token invalid', error);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth failed', error);
    next(); // Continue anyway for optional auth
  }
};

/**
 * Middleware to validate request origin and add IP/User-Agent to request
 */
export const addRequestInfo = (req: Request, res: Response, next: NextFunction) => {
  // Add IP address (handle proxy headers)
  const ip = req.headers['x-forwarded-for'] as string || 
             req.headers['x-real-ip'] as string ||
             req.connection.remoteAddress ||
             req.ip;

  // Add user agent
  const userAgent = req.headers['user-agent'] || '';

  // Add to request object for use in services
  (req as any).requestInfo = {
    ip: Array.isArray(ip) ? ip[0] : ip,
    userAgent,
    timestamp: new Date(),
  };

  next();
};

/**
 * Middleware to validate subscription ownership
 */
export const validateSubscriptionOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const subscriptionId = req.params.subscriptionId || req.body.subscriptionId;
    
    if (!subscriptionId) {
      res.status(400).json({
        success: false,
        error: 'Subscription ID required',
      });
      return;
    }

    const subscription = await firestoreService.getSubscriptionById(subscriptionId);

    if (!subscription) {
      res.status(404).json({
        success: false,
        error: 'Subscription not found',
      });
      return;
    }

    // Check if user owns the subscription or is an admin
    const hasAccess = 
      subscription.userId === req.user.id ||
      req.user.role === 'SUPERADMIN' ||
      req.user.role === 'ADMIN';

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: 'Access denied to this subscription',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Subscription ownership validation failed', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

/**
 * Middleware to validate license ownership
 */
export const validateLicenseOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const licenseId = req.params.licenseId || req.body.licenseId;
    const licenseKey = req.params.licenseKey || req.body.licenseKey;
    
    if (!licenseId && !licenseKey) {
      res.status(400).json({
        success: false,
        error: 'License ID or key required',
      });
      return;
    }

    const license = licenseId
      ? await firestoreService.getLicenseById(licenseId)
      : await firestoreService.getLicenseByKey(licenseKey);

    if (!license) {
      res.status(404).json({
        success: false,
        error: 'License not found',
      });
      return;
    }

    // Check if user owns the license or subscription, or is an admin
    const hasAccess = 
      license.userId === req.user.id ||
      req.user.role === 'SUPERADMIN' ||
      req.user.role === 'ADMIN';

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: 'Access denied to this license',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('License ownership validation failed', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};
