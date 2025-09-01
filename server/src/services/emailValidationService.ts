/**
 * Email Validation Service
 * 
 * Handles email uniqueness validation within organizations (multi-tenant isolation).
 * Prevents duplicate emails within the same organization while allowing the same
 * email to exist across different organizations.
 */

import { firestoreService } from './firestoreService.js';
import { logger } from '../utils/logger.js';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export interface EmailValidationResult {
  isValid: boolean;
  isDuplicate: boolean;
  existingUser?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    status?: string;
    collection: string;
  };
  error?: string;
}

export interface EmailUniquenessCheck {
  isUnique: boolean;
  existsInCollections: string[];
  conflictingUsers: Array<{
    id: string;
    email: string;
    name?: string;
    collection: string;
    organizationId?: string;
  }>;
}

export class EmailValidationService {
  
  /**
   * Validate email uniqueness within a specific organization
   * Allows same email across different organizations (multi-tenant)
   */
  static async validateEmailInOrganization(
    email: string,
    organizationId: string,
    excludeUserId?: string
  ): Promise<EmailValidationResult> {
    try {
      logger.info('Validating email uniqueness within organization', {
        email,
        organizationId,
        excludeUserId
      });

      const normalizedEmail = email.toLowerCase().trim();
      const db = getFirestore();
      
      // Collections to check for email duplicates within the organization
      const collectionsToCheck = [
        'users',
        'teamMembers', 
        'orgMembers'
      ];

      for (const collectionName of collectionsToCheck) {
        const duplicateUser = await this.checkEmailInCollection(
          db,
          collectionName,
          normalizedEmail,
          organizationId,
          excludeUserId
        );
        
        if (duplicateUser) {
          logger.warn('Email already exists in organization', {
            email: normalizedEmail,
            organizationId,
            collection: collectionName,
            existingUserId: duplicateUser.id
          });
          
          return {
            isValid: false,
            isDuplicate: true,
            existingUser: duplicateUser
          };
        }
      }

      // Also check Firebase Auth for existing users in this organization
      try {
        const firebaseUser = await getAuth().getUserByEmail(normalizedEmail);
        if (firebaseUser) {
          // Check if this Firebase user belongs to the same organization
          const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData?.organizationId === organizationId && userData?.id !== excludeUserId) {
              return {
                isValid: false,
                isDuplicate: true,
                existingUser: {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || normalizedEmail,
                  name: firebaseUser.displayName || undefined,
                  collection: 'firebase_auth'
                }
              };
            }
          }
        }
      } catch (firebaseError: any) {
        // User not found in Firebase Auth is expected for new users
        if (firebaseError.code !== 'auth/user-not-found') {
          logger.warn('Unexpected Firebase Auth error during email validation', {
            email: normalizedEmail,
            error: firebaseError.message
          });
        }
      }

      logger.info('Email is unique within organization', {
        email: normalizedEmail,
        organizationId
      });

      return {
        isValid: true,
        isDuplicate: false
      };

    } catch (error) {
      logger.error('Error validating email in organization', {
        email,
        organizationId,
        error: (error as any)?.message
      });

      return {
        isValid: false,
        isDuplicate: false,
        error: (error as any)?.message || 'Email validation failed'
      };
    }
  }

  /**
   * Check for email duplicates across all organizations (global check)
   * Returns which organizations the email exists in
   */
  static async checkEmailGlobally(email: string): Promise<EmailUniquenessCheck> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const db = getFirestore();
      const existsInCollections: string[] = [];
      const conflictingUsers: Array<{
        id: string;
        email: string;
        name?: string;
        collection: string;
        organizationId?: string;
      }> = [];

      const collectionsToCheck = ['users', 'teamMembers', 'orgMembers'];

      for (const collectionName of collectionsToCheck) {
        const snapshot = await db.collection(collectionName)
          .where('email', '==', normalizedEmail)
          .get();

        if (!snapshot.empty) {
          existsInCollections.push(collectionName);
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            conflictingUsers.push({
              id: doc.id,
              email: data.email,
              name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
              collection: collectionName,
              organizationId: data.organizationId || data.orgId
            });
          });
        }
      }

      // Check Firebase Auth
      try {
        const firebaseUser = await getAuth().getUserByEmail(normalizedEmail);
        if (firebaseUser) {
          existsInCollections.push('firebase_auth');
          conflictingUsers.push({
            id: firebaseUser.uid,
            email: firebaseUser.email || normalizedEmail,
            name: firebaseUser.displayName || undefined,
            collection: 'firebase_auth'
          });
        }
      } catch (firebaseError: any) {
        // User not found is expected
        if (firebaseError.code !== 'auth/user-not-found') {
          logger.warn('Firebase Auth error during global email check', {
            email: normalizedEmail,
            error: firebaseError.message
          });
        }
      }

      return {
        isUnique: existsInCollections.length === 0,
        existsInCollections,
        conflictingUsers
      };

    } catch (error) {
      logger.error('Error checking email globally', {
        email,
        error: (error as any)?.message
      });

      return {
        isUnique: false,
        existsInCollections: ['validation_error'],
        conflictingUsers: []
      };
    }
  }

  /**
   * Check email in a specific collection within an organization
   */
  private static async checkEmailInCollection(
    db: any,
    collectionName: string,
    email: string,
    organizationId: string,
    excludeUserId?: string
  ): Promise<{
    id: string;
    email: string;
    name?: string;
    role?: string;
    status?: string;
    collection: string;
  } | null> {
    
    let query = db.collection(collectionName).where('email', '==', email);
    
    // Add organization filter based on collection structure
    if (collectionName === 'orgMembers') {
      query = query.where('organizationId', '==', organizationId);
    } else if (collectionName === 'users' || collectionName === 'teamMembers') {
      // For users and teamMembers, we'll filter after the query since
      // Firestore doesn't support multiple equality filters well
    }

    const snapshot = await query.get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Skip if this is the user we're excluding
      if (excludeUserId && doc.id === excludeUserId) {
        continue;
      }
      
      // Check organization match for collections that have organizationId
      const userOrgId = data.organizationId || data.orgId;
      if (userOrgId && userOrgId === organizationId) {
        return {
          id: doc.id,
          email: data.email,
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          role: data.role,
          status: data.status,
          collection: collectionName
        };
      }
    }
    
    return null;
  }

  /**
   * Validate email format
   */
  static validateEmailFormat(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }
    
    const trimmedEmail = email.trim();
    
    if (trimmedEmail.length === 0) {
      return { isValid: false, error: 'Email cannot be empty' };
    }
    
    if (trimmedEmail.length > 254) {
      return { isValid: false, error: 'Email is too long' };
    }
    
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    return { isValid: true };
  }

  /**
   * Comprehensive email validation for team member creation
   */
  static async validateTeamMemberEmail(
    email: string,
    organizationId: string,
    excludeUserId?: string
  ): Promise<{
    isValid: boolean;
    canProceed: boolean;
    errors: string[];
    warnings: string[];
    globalCheck?: EmailUniquenessCheck;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Step 1: Validate email format
      const formatCheck = this.validateEmailFormat(email);
      if (!formatCheck.isValid) {
        errors.push(formatCheck.error!);
        return {
          isValid: false,
          canProceed: false,
          errors,
          warnings
        };
      }

      // Step 2: Check uniqueness within organization (this is the critical check)
      const orgValidation = await this.validateEmailInOrganization(email, organizationId, excludeUserId);
      if (!orgValidation.isValid) {
        if (orgValidation.isDuplicate) {
          errors.push(`Email already exists in this organization (found in ${orgValidation.existingUser?.collection})`);
        } else if (orgValidation.error) {
          errors.push(orgValidation.error);
        }
      }

      // Step 3: Global check for informational purposes
      const globalCheck = await this.checkEmailGlobally(email);
      if (!globalCheck.isUnique && globalCheck.conflictingUsers.length > 0) {
        const otherOrgs = globalCheck.conflictingUsers
          .filter(user => user.organizationId && user.organizationId !== organizationId)
          .map(user => user.organizationId)
          .filter((orgId, index, arr) => arr.indexOf(orgId) === index);
        
        if (otherOrgs.length > 0) {
          warnings.push(`This email exists in ${otherOrgs.length} other organization(s). This is allowed in multi-tenant mode.`);
        }
      }

      const isValid = errors.length === 0;
      const canProceed = isValid; // Can proceed if no errors (warnings are OK)

      return {
        isValid,
        canProceed,
        errors,
        warnings,
        globalCheck
      };

    } catch (error) {
      logger.error('Error in comprehensive email validation', {
        email,
        organizationId,
        error: (error as any)?.message
      });

      return {
        isValid: false,
        canProceed: false,
        errors: ['Email validation system error'],
        warnings
      };
    }
  }
}

export default EmailValidationService;

