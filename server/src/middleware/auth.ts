import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.js';
import { firestoreService } from '../services/firestoreService.js';
import { logger } from '../utils/logger.js';
import { getAuth } from 'firebase-admin/auth';

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
 * Middleware to authenticate Firebase ID tokens
 */
export const authenticateFirebaseToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    // Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // 🔧 FIXED: Get user from Firestore using Firebase UID lookup (not document ID)
    // First try to find user by firebaseUid field
    let user = await firestoreService.getUserByFirebaseUid(decodedToken.uid);
    
    // Fallback: try to find by email if no firebaseUid match
    if (!user && decodedToken.email) {
      user = await firestoreService.getUserByEmail(decodedToken.email);
    }

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
    logger.error('Firebase token authentication failed', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

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
 * Middleware to require accounting role (or superadmin)
 */
export const requireAccounting = requireRole(['ACCOUNTING', 'SUPERADMIN']);

/**
 * Alias for authenticateToken for backward compatibility
 */
export const authMiddleware = authenticateToken;

/**
 * Middleware to require enterprise admin role
 */
// Deprecated: enterprise admin role removed. Keep alias to ADMIN for backward compatibility
export const requireEnterpriseAdmin = requireRole(['ADMIN']);
export const requireOrgManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    // Global admins pass
    if (req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN') {
      next();
      return;
    }
    const orgId = (req.params as any).orgId || (req.body as any).orgId || (req.query as any).orgId;
    if (!orgId) {
      res.status(400).json({ success: false, error: 'orgId required' });
      return;
    }
    const members = await firestoreService.getOrgMembers(orgId);
    const role = members.find((m: any) => m.userId === req.user!.id)?.role;
    const allowed = ['ENTERPRISE_ADMIN', 'OWNER', 'MANAGER'];
    if (role && allowed.includes(String(role).toUpperCase())) {
      next();
      return;
    }
    res.status(403).json({ success: false, error: 'Manager or admin role required' });
  } catch (err) {
    logger.error('Org manager check failed', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

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
 * Middleware to require Enterprise Admin role and validate ENTERPRISE context
 * - If a subscriptionId is provided (params/body/query), verifies it is ENTERPRISE tier
 * - If a licenseKey/licenseId is provided, resolves its subscription and verifies ENTERPRISE tier
 * - Otherwise, only role is enforced (use on endpoints that are ENTERPRISE by definition)
 */
export const requireEnterpriseAdminStrict = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // Allow global admins automatically
    if (req.user.role === 'SUPERADMIN' || req.user.role === 'ADMIN') {
      next();
      return;
    }

    // If an orgId is present, verify the user is an ENTERPRISE_ADMIN (or OWNER) of that org
    const orgId = (req.params as any).orgId || (req.body as any).orgId || (req.query as any).orgId;
    if (orgId) {
      try {
        const members = await firestoreService.getOrgMembers(orgId);
        const role = (r: string) => String(r || '').toUpperCase();
        const isOrgEnterpriseAdmin = members.some((m: any) => m.userId === req.user!.id && ['ENTERPRISE_ADMIN','OWNER'].includes(role(m.role)) && (m.status === 'ACTIVE' || m.seatReserved));
        if (isOrgEnterpriseAdmin) {
          next();
          return;
        }
      } catch (err) {
        // Fall through to forbidden below on errors
      }
    }

    res.status(403).json({ success: false, error: 'Enterprise admin role required' });
    return;

    // Determine enterprise context from request
    const subscriptionId = (req.params as any).subscriptionId || (req.body as any).subscriptionId || (req.query as any).subscriptionId;
    const licenseKey = (req.params as any).licenseKey || (req.body as any).licenseKey;
    const licenseId = (req.params as any).licenseId || (req.body as any).licenseId;

    if (subscriptionId) {
      const subResult = await firestoreService.getSubscriptionById(subscriptionId);
      if (!subResult) {
        res.status(404).json({ success: false, error: 'Subscription not found' });
        return;
      }
      const subTier = String((subResult as any).tier || '').toUpperCase();
      if (subTier !== 'ENTERPRISE') {
        res.status(403).json({ success: false, error: 'Enterprise subscription required' });
        return;
      }
    } else if (licenseKey || licenseId) {
      const licenseResult = licenseId
        ? await firestoreService.getLicenseById(licenseId)
        : await firestoreService.getLicenseByKey(licenseKey);
      if (!licenseResult) {
        res.status(404).json({ success: false, error: 'License not found' });
        return;
      }
      const lic = licenseResult as any;
      if (lic.subscriptionId) {
        const subCheck = await firestoreService.getSubscriptionById(lic.subscriptionId);
        const tierCheck = String((subCheck as any)?.tier || '').toUpperCase();
        if (!subCheck || tierCheck !== 'ENTERPRISE') {
          res.status(403).json({ success: false, error: 'Enterprise subscription required' });
          return;
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Enterprise admin strict check failed', error);
    res.status(500).json({ success: false, error: 'Server error' });
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
