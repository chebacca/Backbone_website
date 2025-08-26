/**
 * Team Member Auto-Registration Service
 * 
 * This service automatically creates team member accounts when account owners
 * add new team members to their organization.
 * 
 * NEW: Now also creates Firebase Authentication users automatically for verification
 */

import { firestoreService } from './firestoreService.js';
import { UserSynchronizationService } from './UserSynchronizationService.js';
import { PasswordUtil } from '../utils/password.js';
import { EmailService } from './emailService.js';
import { logger } from '../utils/logger.js';
import { getAuth } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

export interface CreateTeamMemberRequest {
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  licenseType?: string;
  organizationId: string;
  createdBy: string; // User ID of the account owner
  sendWelcomeEmail?: boolean;
  temporaryPassword?: string;
}

export interface TeamMemberCreationResult {
  success: boolean;
  teamMember?: any;
  temporaryPassword?: string;
  firebaseUid?: string; // Firebase Authentication UID
  error?: string;
}

export class TeamMemberAutoRegistrationService {
  
  /**
   * Create a new team member account automatically
   * Now includes Firebase Auth user creation for automatic verification
   */
  static async createTeamMember(request: CreateTeamMemberRequest): Promise<TeamMemberCreationResult> {
    let firebaseUserRecord: any = null;
    let teamMemberRef: any = null;
    
    try {
      logger.info('Creating new team member account', { 
        email: request.email, 
        organizationId: request.organizationId,
        createdBy: request.createdBy 
      });

      // Generate temporary password if not provided
      const temporaryPassword = request.temporaryPassword || this.generateTemporaryPassword();

      // Use synchronized user creation to ensure Firebase Auth and Firestore consistency
      const syncResult = await UserSynchronizationService.createSynchronizedUser({
        email: request.email,
        password: temporaryPassword,
        name: `${request.firstName} ${request.lastName}`.trim(),
        firstName: request.firstName,
        lastName: request.lastName,
        role: 'TEAM_MEMBER',
        organizationId: request.organizationId,
        department: request.department,
        licenseType: request.licenseType || 'PROFESSIONAL',
        isTeamMember: true,
        memberRole: 'MEMBER'
      });

      if (!syncResult.success) {
        return {
          success: false,
          error: syncResult.error || 'Failed to create synchronized team member account'
        };
      }

      const teamMember = syncResult.user!;
      firebaseUserRecord = { uid: syncResult.firebaseUid };
      teamMemberRef = teamMember;
      
      // 🔧 CRITICAL FIX: Create proper teamMembers collection record for Dashboard app compatibility
      const licenseType: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' = 
        (request.licenseType === 'BASIC' || request.licenseType === 'ENTERPRISE' || request.licenseType === 'PROFESSIONAL') 
          ? request.licenseType 
          : 'PROFESSIONAL';

      // Hash the password for storage in teamMembers collection
      const hashedPassword = await PasswordUtil.hash(temporaryPassword);
      
      const teamMemberCollectionData = {
        id: firebaseUserRecord.uid,
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        name: `${request.firstName} ${request.lastName}`,
        role: 'ADMIN', // Set as ADMIN for proper dashboard access
        licenseType: licenseType,
        status: 'ACTIVE',
        organizationId: request.organizationId,
        department: request.department,
        firebaseUid: firebaseUserRecord.uid,
        password: hashedPassword, // Store hashed password
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: request.createdBy
      };
      
      // Create teamMembers collection document
      const { getFirestore } = await import('firebase-admin/firestore');
      const db = getFirestore();
      await db.collection('teamMembers').doc(firebaseUserRecord.uid).set(teamMemberCollectionData);
      
      logger.info('Team member document created in teamMembers collection', { 
        teamMemberId: firebaseUserRecord.uid,
        email: request.email 
      });

      // Create organization membership record
      const orgMemberData = {
        id: `${firebaseUserRecord.uid}_${request.organizationId}`,
        email: request.email,
        name: `${request.firstName} ${request.lastName}`,
        role: 'ADMIN', // Set as ADMIN for proper access
        status: 'ACTIVE',
        organizationId: request.organizationId,
        teamMemberId: firebaseUserRecord.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('orgMembers').doc(orgMemberData.id).set(orgMemberData);
      
      logger.info('Organization membership created', { 
        orgMemberId: orgMemberData.id,
        email: request.email,
        organizationId: request.organizationId
      });

      // Set Firebase custom claims for proper role recognition
      const { getAuth } = await import('firebase-admin/auth');
      const auth = getAuth();
      await auth.setCustomUserClaims(firebaseUserRecord.uid, {
        role: 'ADMIN',
        teamMemberRole: 'ADMIN',
        isAdmin: true,
        teamMemberId: firebaseUserRecord.uid,
        organizationId: request.organizationId
      });
      
      logger.info('Firebase custom claims set', { 
        firebaseUid: firebaseUserRecord.uid,
        email: request.email 
      });
      
      // Update the user record with team member data
      const teamMemberUpdate = {
        role: 'TEAM_MEMBER',
        organizationId: request.organizationId,
        teamMemberData: {
          licenseType: licenseType,
          department: request.department || null,
          status: 'ACTIVE',
          createdBy: request.createdBy,
          joinedAt: new Date()
        },
        updatedAt: new Date()
      };
      
      await teamMemberRef.update(teamMemberUpdate);
      
      logger.info('User updated with team member data', { 
        userId: teamMemberRef.id,
        email: request.email,
        organizationId: request.organizationId
      });
      
      const finalTeamMember = {
        id: teamMemberRef.id,
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        name: `${request.firstName} ${request.lastName}`,
        licenseType: licenseType,
        status: 'ACTIVE',
        organizationId: request.organizationId,
        department: request.department,
        firebaseUid: firebaseUserRecord.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      logger.info('Team member account created successfully', { 
        teamMemberId: finalTeamMember.id,
        firebaseUid: firebaseUserRecord.uid,
        email: request.email,
        organizationId: request.organizationId 
      });

      // Send welcome email if requested
      if (request.sendWelcomeEmail !== false) {
        try {
          await this.sendWelcomeEmail(finalTeamMember, temporaryPassword, request.createdBy);
          logger.info('Welcome email sent to new team member', { 
            teamMemberId: finalTeamMember.id,
            email: request.email 
          });
        } catch (emailError) {
          logger.warn('Failed to send welcome email to team member', { 
            teamMemberId: finalTeamMember.id,
            email: request.email,
            error: (emailError as any)?.message 
          });
          // Don't fail the entire operation if email fails
        }
      }

      return {
        success: true,
        teamMember: finalTeamMember,
        temporaryPassword: temporaryPassword,
        firebaseUid: firebaseUserRecord.uid,
      };

    } catch (error) {
      logger.error('Failed to create team member account', { 
        email: request.email,
        organizationId: request.organizationId,
        error: (error as any)?.message 
      });
      
      // Cleanup: If we created Firebase user or Firestore user but something failed, clean up
      if (firebaseUserRecord) {
        try {
          await getAuth().deleteUser(firebaseUserRecord.uid);
          logger.info('Cleaned up Firebase Auth user after failure', { 
            firebaseUid: firebaseUserRecord.uid,
            email: request.email 
          });
        } catch (cleanupError) {
          logger.error('Failed to cleanup Firebase Auth user after rollback', { 
            firebaseUid: firebaseUserRecord.uid,
            email: request.email,
            error: (cleanupError as any)?.message 
          });
        }
      }
      
      if (teamMemberRef) {
        try {
          await firestoreService.deleteUser(teamMemberRef.id);
          logger.info('Cleaned up Firestore user after failure', { 
            teamMemberId: teamMemberRef.id,
            email: request.email 
          });
        } catch (cleanupError) {
          logger.error('Failed to cleanup Firestore user after rollback', { 
            teamMemberId: teamMemberRef.id,
            email: request.email,
            error: (cleanupError as any)?.message 
          });
        }
      }
      
      return {
        success: false,
        error: (error as any)?.message || 'Failed to create team member account'
      };
    }
  }

  /**
   * Bulk create multiple team members
   */
  static async createMultipleTeamMembers(
    requests: CreateTeamMemberRequest[]
  ): Promise<TeamMemberCreationResult[]> {
    const results: TeamMemberCreationResult[] = [];
    
    for (const request of requests) {
      const result = await this.createTeamMember(request);
      results.push(result);
      
      // Add small delay between creations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Update team member password (for password resets)
   * Now also updates Firebase Auth user password for verification
   */
  static async resetTeamMemberPassword(
    teamMemberId: string, 
    newPassword?: string
  ): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
    try {
      const temporaryPassword = newPassword || this.generateTemporaryPassword();
      const hashedPassword = await PasswordUtil.hash(temporaryPassword);

      // Get team member to find Firebase UID
      const teamMember = await firestoreService.getTeamMemberById(teamMemberId);
      if (!teamMember) {
        throw new Error('Team member not found');
      }

      // Update password in Firestore
      await firestoreService.updateTeamMember(teamMemberId, {
        hashedPassword: hashedPassword,
        updatedAt: new Date(),
      });

      // Update password in Firebase Auth if UID exists
      if (teamMember.firebaseUid) {
        try {
          await getAuth().updateUser(teamMember.firebaseUid, {
            password: temporaryPassword,
          });
          
          logger.info('Firebase Auth password updated successfully', { 
            teamMemberId,
            firebaseUid: teamMember.firebaseUid 
          });
        } catch (firebaseError: any) {
          logger.error('Failed to update Firebase Auth password', { 
            teamMemberId,
            firebaseUid: teamMember.firebaseUid,
            error: firebaseError.message 
          });
          
          // Don't fail the entire operation if Firebase update fails
          // The team member can still use the dashboard with the updated password
        }
      } else {
        logger.warn('No Firebase UID found for team member during password reset', { 
          teamMemberId,
          email: teamMember.email 
        });
      }

      logger.info('Team member password reset successfully', { teamMemberId });

      return {
        success: true,
        temporaryPassword: temporaryPassword,
      };

    } catch (error) {
      logger.error('Failed to reset team member password', { 
        teamMemberId,
        error: (error as any)?.message 
      });
      
      return {
        success: false,
        error: (error as any)?.message || 'Failed to reset password'
      };
    }
  }

  /**
   * Verify a team member in Firebase Auth (mark email as verified)
   * This allows account admins to verify team members automatically
   */
  static async verifyTeamMemberInFirebase(
    teamMemberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get team member to find Firebase UID
      const teamMember = await firestoreService.getTeamMemberById(teamMemberId);
      if (!teamMember) {
        throw new Error('Team member not found');
      }

      if (!teamMember.firebaseUid) {
        throw new Error('No Firebase UID found for this team member');
      }

      // Verify email in Firebase Auth
      await getAuth().updateUser(teamMember.firebaseUid, {
        emailVerified: true,
      });

      // Update verification status in Firestore
      await firestoreService.updateTeamMember(teamMemberId, {
        isEmailVerified: true,
        updatedAt: new Date(),
      });

      logger.info('Team member verified successfully in Firebase Auth', { 
        teamMemberId,
        firebaseUid: teamMember.firebaseUid,
        email: teamMember.email 
      });

      return { success: true };

    } catch (error) {
      logger.error('Failed to verify team member in Firebase Auth', { 
        teamMemberId,
        error: (error as any)?.message 
      });
      
      return {
        success: false,
        error: (error as any)?.message || 'Failed to verify team member'
      };
    }
  }

  /**
   * Disable a team member in Firebase Auth (for deactivation)
   */
  static async disableTeamMemberInFirebase(
    teamMemberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get team member to find Firebase UID
      const teamMember = await firestoreService.getTeamMemberById(teamMemberId);
      if (!teamMember) {
        throw new Error('Team member not found');
      }

      if (!teamMember.firebaseUid) {
        throw new Error('No Firebase UID found for this team member');
      }

      // Disable user in Firebase Auth
      await getAuth().updateUser(teamMember.firebaseUid, {
        disabled: true,
      });

      // Update status in Firestore
      await firestoreService.updateTeamMember(teamMemberId, {
        status: 'INACTIVE',
        memberStatus: 'INACTIVE',
        updatedAt: new Date(),
      });

      logger.info('Team member disabled successfully in Firebase Auth', { 
        teamMemberId,
        firebaseUid: teamMember.firebaseUid,
        email: teamMember.email 
      });

      return { success: true };

    } catch (error) {
      logger.error('Failed to disable team member in Firebase Auth', { 
        teamMemberId,
        error: (error as any)?.message 
      });
      
      return {
        success: false,
        error: (error as any)?.message || 'Failed to disable team member'
      };
    }
  }

  /**
   * Re-enable a team member in Firebase Auth (for reactivation)
   */
  static async enableTeamMemberInFirebase(
    teamMemberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get team member to find Firebase UID
      const teamMember = await firestoreService.getTeamMemberById(teamMemberId);
      if (!teamMember) {
        throw new Error('Team member not found');
      }

      if (!teamMember.firebaseUid) {
        throw new Error('No Firebase UID found for this team member');
      }

      // Re-enable user in Firebase Auth
      await getAuth().updateUser(teamMember.firebaseUid, {
        disabled: false,
      });

      // Update status in Firestore
      await firestoreService.updateTeamMember(teamMemberId, {
        status: 'ACTIVE',
        memberStatus: 'ACTIVE',
        updatedAt: new Date(),
      });

      logger.info('Team member re-enabled successfully in Firebase Auth', { 
        teamMemberId,
        firebaseUid: teamMember.firebaseUid,
        email: teamMember.email 
      });

      return { success: true };

    } catch (error) {
      logger.error('Failed to re-enable team member in Firebase Auth', { 
        teamMemberId,
        error: (error as any)?.message 
      });
      
      return {
        success: false,
        error: (error as any)?.message || 'Failed to re-enable team member'
      };
    }
  }

  /**
   * Generate a secure temporary password
   */
  private static generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Send welcome email to new team member
   */
  private static async sendWelcomeEmail(
    teamMember: any, 
    temporaryPassword: string, 
    createdBy: string
  ): Promise<void> {
    try {
      // Get organization info for context
      const organization = await firestoreService.getOrganizationById(teamMember.organizationId);
      const creator = await firestoreService.getUserById(createdBy);
      
      // Use the public sendWelcomeEmail method instead
      await EmailService.sendWelcomeEmail(teamMember);
      
    } catch (error) {
      logger.error('Failed to send welcome email', { 
        teamMemberId: teamMember.id,
        error: (error as any)?.message 
      });
      throw error;
    }
  }


}

export default TeamMemberAutoRegistrationService;
