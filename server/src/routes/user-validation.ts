/**
 * User Validation Routes
 * 
 * Provides endpoints for validating user data uniqueness and synchronization status
 * 
 * @see mpc-library/authentication/USER_VALIDATION_PATTERNS.md
 * @see mpc-library/CODING_STANDARDS_MPC.md
 */

import { Router, Request, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { UserSynchronizationService } from '../services/UserSynchronizationService.js';
import { firestoreService } from '../services/firestoreService.js';
import { 
  asyncHandler, 
  validationErrorHandler, 
  createApiError 
} from '../middleware/errorHandler.js';
import { 
  authenticateToken,
  requireRole
} from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router: Router = Router();

/**
 * Check email uniqueness across Firebase Auth and Firestore
 * GET /api/validation/email-uniqueness?email=user@example.com
 */
router.get('/email-uniqueness', [
  query('email').isEmail().normalizeEmail(),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { email } = req.query as { email: string };

  try {
    const validation = await UserSynchronizationService.validateEmailUniqueness(email);
    
    res.json({
      success: true,
      data: {
        email,
        isUnique: validation.isUnique,
        existsIn: validation.existsIn,
        canRegister: validation.isUnique
      }
    });
  } catch (error: any) {
    logger.error('Email uniqueness validation failed', {
      email,
      error: error.message
    });
    
    throw createApiError('Failed to validate email uniqueness', 500);
  }
}));

/**
 * Get user synchronization status
 * GET /api/validation/user-sync-status?email=user@example.com
 */
router.get('/user-sync-status', [
  query('email').isEmail().normalizeEmail(),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { email } = req.query as { email: string };

  try {
    const userStatus = await UserSynchronizationService.getUserByEmail(email);
    
    res.json({
      success: true,
      data: {
        email,
        hasFirestoreUser: !!userStatus.firestoreUser,
        hasFirebaseUser: !!userStatus.firebaseUser,
        synchronized: userStatus.synchronized,
        firestoreUserId: userStatus.firestoreUser?.id,
        firebaseUid: userStatus.firebaseUser?.uid,
        syncRequired: !userStatus.synchronized && (userStatus.firestoreUser || userStatus.firebaseUser)
      }
    });
  } catch (error: any) {
    logger.error('User sync status check failed', {
      email,
      error: error.message
    });
    
    throw createApiError('Failed to check user synchronization status', 500);
  }
}));

/**
 * Synchronize existing user (Admin only)
 * POST /api/validation/sync-user/:userId
 */
router.post('/sync-user/:userId', [
  authenticateToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  param('userId').isString().isLength({ min: 1 }),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { userId } = req.params;
  const { password } = req.body; // Optional temporary password

  try {
    const syncResult = await UserSynchronizationService.synchronizeExistingUser(userId, password);
    
    if (syncResult.success) {
      logger.info('User synchronized successfully', {
        userId,
        firebaseUid: syncResult.firebaseUid,
        adminUserId: (req as any).user?.id
      });
      
      res.json({
        success: true,
        message: 'User synchronized successfully',
        data: {
          userId,
          firebaseUid: syncResult.firebaseUid,
          user: syncResult.user
        }
      });
    } else {
      logger.warn('User synchronization failed', {
        userId,
        error: syncResult.error,
        adminUserId: (req as any).user?.id
      });
      
      throw createApiError(syncResult.error || 'Synchronization failed', 400);
    }
  } catch (error: any) {
    logger.error('User synchronization error', {
      userId,
      error: error.message,
      adminUserId: (req as any).user?.id
    });
    
    throw createApiError('Failed to synchronize user', 500);
  }
}));

/**
 * Validate system-wide email uniqueness (Admin only)
 * GET /api/validation/system-email-check
 */
router.get('/system-email-check', [
  authenticateToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all users from Firestore
    const db = require('firebase-admin').firestore();
    const usersSnapshot = await db.collection('users').get();
    
    const emailCounts: { [email: string]: number } = {};
    const duplicates: string[] = [];
    const users: any[] = [];
    
    usersSnapshot.forEach((doc: any) => {
      const userData = { id: doc.id, ...doc.data() };
      users.push(userData);
      
      if (emailCounts[userData.email]) {
        emailCounts[userData.email]++;
        if (emailCounts[userData.email] === 2) {
          duplicates.push(userData.email);
        }
      } else {
        emailCounts[userData.email] = 1;
      }
    });
    
    // Check for orphaned Firebase Auth users
    const firebaseUsers: any[] = [];
    const listAllUsers = async (nextPageToken?: string): Promise<void> => {
      const listUsersResult = await require('firebase-admin').auth().listUsers(1000, nextPageToken);
      firebaseUsers.push(...listUsersResult.users);
      
      if (listUsersResult.pageToken) {
        await listAllUsers(listUsersResult.pageToken);
      }
    };
    
    await listAllUsers();
    
    // Find Firebase users without Firestore records
    const firestoreEmails = new Set(users.map(u => u.email));
    const orphanedFirebaseUsers = firebaseUsers.filter(fbUser => 
      fbUser.email && !firestoreEmails.has(fbUser.email)
    );
    
    // Find Firestore users without Firebase UIDs
    const unsyncedFirestoreUsers = users.filter(user => !user.firebaseUid);
    
    logger.info('System email check completed', {
      totalFirestoreUsers: users.length,
      totalFirebaseUsers: firebaseUsers.length,
      duplicateEmails: duplicates.length,
      orphanedFirebaseUsers: orphanedFirebaseUsers.length,
      unsyncedFirestoreUsers: unsyncedFirestoreUsers.length,
      adminUserId: (req as any).user?.id
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalFirestoreUsers: users.length,
          totalFirebaseUsers: firebaseUsers.length,
          duplicateEmails: duplicates.length,
          orphanedFirebaseUsers: orphanedFirebaseUsers.length,
          unsyncedFirestoreUsers: unsyncedFirestoreUsers.length,
          systemHealthy: duplicates.length === 0 && orphanedFirebaseUsers.length === 0 && unsyncedFirestoreUsers.length === 0
        },
        issues: {
          duplicateEmails: duplicates,
          orphanedFirebaseUsers: orphanedFirebaseUsers.map(u => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName
          })),
          unsyncedFirestoreUsers: unsyncedFirestoreUsers.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name
          }))
        }
      }
    });
  } catch (error: any) {
    logger.error('System email check failed', {
      error: error.message,
      adminUserId: (req as any).user?.id
    });
    
    throw createApiError('Failed to perform system email check', 500);
  }
}));

/**
 * Create synchronized user (Admin only)
 * POST /api/validation/create-sync-user
 */
router.post('/create-sync-user', [
  authenticateToken,
  requireRole(['ADMIN', 'SUPER_ADMIN']),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, role, organizationId, isTeamMember } = req.body;

  if (!email || !password || !name) {
    throw createApiError('Email, password, and name are required', 400);
  }

  try {
    const syncResult = await UserSynchronizationService.createSynchronizedUser({
      email,
      password,
      name,
      role: role || 'USER',
      organizationId,
      isTeamMember: isTeamMember || false
    });

    if (syncResult.success) {
      logger.info('Synchronized user created successfully', {
        email,
        userId: syncResult.user?.id,
        firebaseUid: syncResult.firebaseUid,
        adminUserId: (req as any).user?.id
      });

      res.status(201).json({
        success: true,
        message: 'Synchronized user created successfully',
        data: {
          user: syncResult.user,
          firebaseUid: syncResult.firebaseUid
        }
      });
    } else {
      logger.warn('Synchronized user creation failed', {
        email,
        error: syncResult.error,
        adminUserId: (req as any).user?.id
      });

      throw createApiError(syncResult.error || 'User creation failed', 400);
    }
  } catch (error: any) {
    logger.error('Synchronized user creation error', {
      email,
      error: error.message,
      adminUserId: (req as any).user?.id
    });

    throw createApiError('Failed to create synchronized user', 500);
  }
}));

export default router;
