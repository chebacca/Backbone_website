import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firestoreService, FirestoreUser } from './firestoreService.js';
import { ComplianceService } from './complianceService.js';
import { logger } from '../utils/logger.js';

/**
 * Service to synchronize Firebase Auth state with Firestore
 * Ensures both systems stay in sync for email verification and user status
 */
export class FirebaseAuthSyncService {
  
  /**
   * Check if a user's email is verified in Firebase Auth
   */
  static async checkEmailVerificationStatus(firebaseUid: string): Promise<boolean> {
    try {
      const userRecord = await getAuth().getUser(firebaseUid);
      return userRecord.emailVerified;
    } catch (error) {
      logger.error('Failed to check Firebase Auth email verification status', { firebaseUid, error });
      return false;
    }
  }

  /**
   * Sync Firebase Auth email verification status with Firestore
   */
  static async syncEmailVerificationStatus(firebaseUid: string): Promise<{ success: boolean; isVerified: boolean; error?: string }> {
    try {
      // Get user from Firestore by Firebase UID
      const db = getFirestore();
      const usersSnapshot = await db.collection('users').where('firebaseUid', '==', firebaseUid).limit(1).get();
      if (usersSnapshot.empty) {
        return {
          success: false,
          isVerified: false,
          error: 'User not found in Firestore'
        };
      }
      const user: FirestoreUser = { id: usersSnapshot.docs[0].id, ...usersSnapshot.docs[0].data() } as FirestoreUser;
      if (!user) {
        return {
          success: false,
          isVerified: false,
          error: 'User not found in Firestore'
        };
      }

      // Check Firebase Auth status
      const isVerifiedInFirebase = await this.checkEmailVerificationStatus(firebaseUid);
      
      // Update Firestore if status differs
      if (user.isEmailVerified !== isVerifiedInFirebase) {
        await firestoreService.updateUser(user.id, {
          isEmailVerified: isVerifiedInFirebase,
          updatedAt: new Date()
        });

        // Log the sync
        await ComplianceService.createAuditLog(user.id, 'PROFILE_UPDATE', 
          `Email verification status synced with Firebase Auth: ${isVerifiedInFirebase}`, 
          { firebaseUid, previousStatus: user.isEmailVerified, newStatus: isVerifiedInFirebase }
        );

        logger.info('Email verification status synced with Firebase Auth', {
          userId: user.id,
          firebaseUid,
          previousStatus: user.isEmailVerified,
          newStatus: isVerifiedInFirebase
        });
      }

      return {
        success: true,
        isVerified: isVerifiedInFirebase
      };

    } catch (error) {
      logger.error('Failed to sync email verification status', { firebaseUid, error });
      return {
        success: false,
        isVerified: false,
        error: (error as any)?.message || 'Unknown error'
      };
    }
  }

  /**
   * Sync all users' email verification status from Firebase Auth
   */
  static async syncAllUsersEmailVerificationStatus(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    try {
      let syncedCount = 0;
      const users = await firestoreService.getAllUsers();

      for (const user of users) {
        if (user.firebaseUid) {
          const result = await this.syncEmailVerificationStatus(user.firebaseUid);
          if (result.success) {
            syncedCount++;
          }
        }
      }

      logger.info('Completed bulk email verification status sync', { syncedCount, totalUsers: users.length });
      
      return {
        success: true,
        syncedCount
      };

    } catch (error) {
      logger.error('Failed to sync all users email verification status', { error });
      return {
        success: false,
        syncedCount: 0,
        error: (error as any)?.message || 'Unknown error'
      };
    }
  }

  /**
   * Verify a user's email in Firebase Auth (admin action)
   */
  static async verifyUserEmail(firebaseUid: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update Firebase Auth
      await getAuth().updateUser(firebaseUid, {
        emailVerified: true
      });

      // Sync with Firestore
      const syncResult = await this.syncEmailVerificationStatus(firebaseUid);
      
      if (syncResult.success) {
        logger.info('User email verified in Firebase Auth', { firebaseUid });
        return { success: true };
      } else {
        return {
          success: false,
          error: `Failed to sync with Firestore: ${syncResult.error}`
        };
      }

    } catch (error) {
      logger.error('Failed to verify user email in Firebase Auth', { firebaseUid, error });
      return {
        success: false,
        error: (error as any)?.message || 'Unknown error'
      };
    }
  }

  /**
   * Get user's current Firebase Auth status
   */
  static async getUserFirebaseStatus(firebaseUid: string): Promise<{
    success: boolean;
    data?: {
      emailVerified: boolean;
      disabled: boolean;
      lastSignInTime?: string;
      creationTime: string;
    };
    error?: string;
  }> {
    try {
      const userRecord = await getAuth().getUser(firebaseUid);
      
      return {
        success: true,
        data: {
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          lastSignInTime: userRecord.metadata.lastSignInTime,
          creationTime: userRecord.metadata.creationTime
        }
      };

    } catch (error) {
      logger.error('Failed to get user Firebase Auth status', { firebaseUid, error });
      return {
        success: false,
        error: (error as any)?.message || 'Unknown error'
      };
    }
  }
}
