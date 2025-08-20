/**
 * User Synchronization Service
 * 
 * Ensures proper synchronization between Firebase Authentication and Firestore users collection
 * with strict email uniqueness enforcement across both systems.
 * 
 * @see mpc-library/authentication/USER_SYNC_PATTERNS.md
 * @see mpc-library/CODING_STANDARDS_MPC.md
 */

import { getAuth } from 'firebase-admin/auth';
import { firestoreService, FirestoreUser } from './firestoreService.js';
import { logger } from '../utils/logger.js';
import { createApiError } from '../middleware/errorHandler.js';
import { PasswordUtil } from '../utils/password.js';

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
  organizationId?: string;
  department?: string;
  firstName?: string;
  lastName?: string;
  isTeamMember?: boolean;
  memberRole?: string;
  licenseType?: string;
}

export interface UserSyncResult {
  success: boolean;
  user?: FirestoreUser;
  firebaseUid?: string;
  error?: string;
  rollbackPerformed?: boolean;
}

export class UserSynchronizationService {
  
  /**
   * Create a new user with proper synchronization between Firebase Auth and Firestore
   * Ensures email uniqueness across both systems
   */
  static async createSynchronizedUser(request: CreateUserRequest): Promise<UserSyncResult> {
    let firebaseUserRecord: any = null;
    let firestoreUser: FirestoreUser | null = null;
    let rollbackPerformed = false;

    try {
      // STEP 1: Validate email uniqueness across both systems
      const emailValidation = await this.validateEmailUniqueness(request.email);
      if (!emailValidation.isUnique) {
        return {
          success: false,
          error: `Email ${request.email} already exists in ${emailValidation.existsIn.join(' and ')}`
        };
      }

      // STEP 2: Validate password requirements
      const passwordValidation = PasswordUtil.validate(request.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: `Password does not meet requirements: ${passwordValidation.errors.join(', ')}`
        };
      }

      // STEP 3: Create Firebase Auth user first
      try {
        firebaseUserRecord = await getAuth().createUser({
          email: request.email,
          password: request.password,
          displayName: request.name,
          emailVerified: false, // Keep false for security
          disabled: false,
        });

        logger.info('Firebase Auth user created successfully', {
          firebaseUid: firebaseUserRecord.uid,
          email: request.email
        });
      } catch (firebaseError: any) {
        logger.error('Failed to create Firebase Auth user', {
          email: request.email,
          error: firebaseError.message,
          code: firebaseError.code
        });

        // Handle specific Firebase Auth errors
        if (firebaseError.code === 'auth/email-already-exists') {
          return {
            success: false,
            error: 'Email already exists in Firebase Authentication'
          };
        }

        return {
          success: false,
          error: `Firebase Authentication user creation failed: ${firebaseError.message}`
        };
      }

      // STEP 4: Create Firestore user with Firebase UID reference
      try {
        const hashedPassword = await PasswordUtil.hash(request.password);
        
        const firestoreUserData = {
          email: request.email,
          password: hashedPassword,
          name: request.name,
          firstName: request.firstName || request.name.split(' ')[0] || '',
          lastName: request.lastName || request.name.split(' ').slice(1).join(' ') || '',
          role: (request.role || 'USER') as 'SUPERADMIN' | 'USER' | 'ADMIN' | 'ACCOUNTING' | 'TEAM_MEMBER',
          firebaseUid: firebaseUserRecord.uid,
          isEmailVerified: false,
          twoFactorEnabled: false,
          twoFactorBackupCodes: [],
          privacyConsent: [],
          marketingConsent: false,
          dataProcessingConsent: false,
          identityVerified: false,
          kycStatus: 'PENDING' as const,
          registrationSource: 'api',
          // Team member specific fields
          ...(request.isTeamMember && {
            isTeamMember: true,
            organizationId: request.organizationId,
            memberRole: request.memberRole || 'MEMBER',
            memberStatus: 'ACTIVE',
            department: request.department,
            licenseType: request.licenseType || 'PROFESSIONAL'
          })
        };

        firestoreUser = await firestoreService.createUser(firestoreUserData);

        logger.info('Firestore user created successfully', {
          firestoreUserId: firestoreUser.id,
          firebaseUid: firebaseUserRecord.uid,
          email: request.email
        });

        return {
          success: true,
          user: firestoreUser,
          firebaseUid: firebaseUserRecord.uid
        };

      } catch (firestoreError: any) {
        logger.error('Failed to create Firestore user, performing rollback', {
          email: request.email,
          firebaseUid: firebaseUserRecord.uid,
          error: firestoreError.message
        });

        // ROLLBACK: Delete Firebase Auth user if Firestore creation fails
        try {
          await getAuth().deleteUser(firebaseUserRecord.uid);
          rollbackPerformed = true;
          logger.info('Successfully rolled back Firebase Auth user creation', {
            firebaseUid: firebaseUserRecord.uid,
            email: request.email
          });
        } catch (rollbackError: any) {
          logger.error('Failed to rollback Firebase Auth user creation', {
            firebaseUid: firebaseUserRecord.uid,
            email: request.email,
            rollbackError: rollbackError.message
          });
        }

        return {
          success: false,
          error: `Firestore user creation failed: ${firestoreError.message}`,
          rollbackPerformed
        };
      }

    } catch (error: any) {
      logger.error('Unexpected error in user synchronization', {
        email: request.email,
        error: error.message
      });

      return {
        success: false,
        error: `Unexpected error: ${error.message}`,
        rollbackPerformed
      };
    }
  }

  /**
   * Validate that an email is unique across both Firebase Auth and Firestore
   */
  static async validateEmailUniqueness(email: string): Promise<{
    isUnique: boolean;
    existsIn: string[];
  }> {
    const existsIn: string[] = [];

    try {
      // Check Firebase Auth
      try {
        await getAuth().getUserByEmail(email);
        existsIn.push('Firebase Authentication');
      } catch (firebaseError: any) {
        // User not found in Firebase Auth is expected for new users
        if (firebaseError.code !== 'auth/user-not-found') {
          logger.warn('Unexpected error checking Firebase Auth for email', {
            email,
            error: firebaseError.message
          });
        }
      }

      // Check Firestore users collection
      const firestoreUser = await firestoreService.getUserByEmail(email);
      if (firestoreUser) {
        existsIn.push('Firestore users collection');
      }

      return {
        isUnique: existsIn.length === 0,
        existsIn
      };

    } catch (error: any) {
      logger.error('Error validating email uniqueness', {
        email,
        error: error.message
      });

      // In case of error, assume email is not unique for safety
      return {
        isUnique: false,
        existsIn: ['validation error']
      };
    }
  }

  /**
   * Synchronize an existing Firestore user with Firebase Auth
   * Useful for migrating existing users
   */
  static async synchronizeExistingUser(firestoreUserId: string, password?: string): Promise<UserSyncResult> {
    try {
      // Get Firestore user
      const firestoreUser = await firestoreService.getUserById(firestoreUserId);
      if (!firestoreUser) {
        return {
          success: false,
          error: 'Firestore user not found'
        };
      }

      // Check if user already has Firebase UID
      if (firestoreUser.firebaseUid) {
        try {
          await getAuth().getUser(firestoreUser.firebaseUid);
          return {
            success: true,
            user: firestoreUser,
            firebaseUid: firestoreUser.firebaseUid
          };
        } catch (firebaseError: any) {
          if (firebaseError.code === 'auth/user-not-found') {
            // Firebase user was deleted, need to recreate
            logger.warn('Firebase user not found for existing Firestore user', {
              firestoreUserId,
              firebaseUid: firestoreUser.firebaseUid
            });
          } else {
            throw firebaseError;
          }
        }
      }

      // Create Firebase Auth user for existing Firestore user
      const tempPassword = password || this.generateSecurePassword();
      
      try {
        const firebaseUserRecord = await getAuth().createUser({
          email: firestoreUser.email,
          password: tempPassword,
          displayName: firestoreUser.name,
          emailVerified: firestoreUser.isEmailVerified || false,
          disabled: false,
        });

        // Update Firestore user with Firebase UID
        await firestoreService.updateUser(firestoreUserId, {
          firebaseUid: firebaseUserRecord.uid
        });

        logger.info('Successfully synchronized existing user with Firebase Auth', {
          firestoreUserId,
          firebaseUid: firebaseUserRecord.uid,
          email: firestoreUser.email
        });

        return {
          success: true,
          user: { ...firestoreUser, firebaseUid: firebaseUserRecord.uid },
          firebaseUid: firebaseUserRecord.uid
        };

      } catch (firebaseError: any) {
        if (firebaseError.code === 'auth/email-already-exists') {
          // Try to get the existing Firebase user and link it
          try {
            const existingFirebaseUser = await getAuth().getUserByEmail(firestoreUser.email);
            
            // Update Firestore user with existing Firebase UID
            await firestoreService.updateUser(firestoreUserId, {
              firebaseUid: existingFirebaseUser.uid
            });

            logger.info('Linked existing Firebase user to Firestore user', {
              firestoreUserId,
              firebaseUid: existingFirebaseUser.uid,
              email: firestoreUser.email
            });

            return {
              success: true,
              user: { ...firestoreUser, firebaseUid: existingFirebaseUser.uid },
              firebaseUid: existingFirebaseUser.uid
            };

          } catch (linkError: any) {
            logger.error('Failed to link existing Firebase user', {
              firestoreUserId,
              email: firestoreUser.email,
              error: linkError.message
            });

            return {
              success: false,
              error: `Failed to link existing Firebase user: ${linkError.message}`
            };
          }
        }

        return {
          success: false,
          error: `Firebase user creation failed: ${firebaseError.message}`
        };
      }

    } catch (error: any) {
      logger.error('Error synchronizing existing user', {
        firestoreUserId,
        error: error.message
      });

      return {
        success: false,
        error: `Synchronization failed: ${error.message}`
      };
    }
  }

  /**
   * Clean up orphaned records (Firebase Auth users without Firestore records or vice versa)
   */
  static async cleanupOrphanedRecords(): Promise<{
    orphanedFirebaseUsers: number;
    orphanedFirestoreUsers: number;
    errors: string[];
  }> {
    const results = {
      orphanedFirebaseUsers: 0,
      orphanedFirestoreUsers: 0,
      errors: [] as string[]
    };

    try {
      // This is a complex operation that should be run carefully
      // For now, just return the structure - implementation would require
      // careful consideration of data safety
      logger.info('Orphaned record cleanup requested - manual review recommended');
      
      return results;
    } catch (error: any) {
      results.errors.push(`Cleanup failed: ${error.message}`);
      return results;
    }
  }

  /**
   * Generate a secure temporary password
   */
  private static generateSecurePassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  /**
   * Get user by email from either system
   */
  static async getUserByEmail(email: string): Promise<{
    firestoreUser?: FirestoreUser;
    firebaseUser?: any;
    synchronized: boolean;
  }> {
    try {
      const [firestoreUser, firebaseUserResult] = await Promise.allSettled([
        firestoreService.getUserByEmail(email),
        getAuth().getUserByEmail(email)
      ]);

      const firestoreUserData = firestoreUser.status === 'fulfilled' ? firestoreUser.value : null;
      const firebaseUserData = firebaseUserResult.status === 'fulfilled' ? firebaseUserResult.value : null;

      const synchronized = !!(
        firestoreUserData && 
        firebaseUserData && 
        firestoreUserData.firebaseUid === firebaseUserData.uid
      );

      return {
        firestoreUser: firestoreUserData || undefined,
        firebaseUser: firebaseUserData || undefined,
        synchronized
      };

    } catch (error: any) {
      logger.error('Error getting user by email', {
        email,
        error: error.message
      });

      return { synchronized: false };
    }
  }
}
