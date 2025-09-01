/**
 * Team Member Cleanup Service
 * 
 * Handles comprehensive cleanup when team members are removed from organizations.
 * Ensures all data is properly cleaned up and licenses are restored to the pool.
 */

import { firestoreService } from './firestoreService.js';
import { logger } from '../utils/logger.js';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export interface TeamMemberCleanupResult {
  success: boolean;
  cleanedCollections: string[];
  licenseRestored: boolean;
  firebaseUserDeleted: boolean;
  error?: string;
}

export class TeamMemberCleanupService {
  
  /**
   * Comprehensive team member removal with complete data cleanup
   * and license restoration
   */
  static async removeTeamMemberCompletely(
    teamMemberId: string,
    organizationId: string,
    removedBy: string
  ): Promise<TeamMemberCleanupResult> {
    const db = getFirestore();
    const auth = getAuth();
    const cleanedCollections: string[] = [];
    let licenseRestored = false;
    let firebaseUserDeleted = false;
    
    try {
      logger.info('Starting comprehensive team member removal', {
        teamMemberId,
        organizationId,
        removedBy
      });

      // Step 1: Get team member data before cleanup
      const teamMember = await firestoreService.getTeamMemberById(teamMemberId);
      if (!teamMember) {
        throw new Error('Team member not found');
      }

      const userEmail = teamMember.email;
      const firebaseUid = teamMember.firebaseUid;

      // Step 2: Find and restore any assigned licenses back to the organization pool
      try {
        // Find licenses assigned to this team member
        const licensesSnapshot = await db.collection('licenses')
          .where('assignedTo.userId', '==', teamMemberId)
          .where('organizationId', '==', organizationId)
          .get();

        if (!licensesSnapshot.empty) {
          const batch = db.batch();
          
          licensesSnapshot.docs.forEach((doc: any) => {
            const licenseRef = db.collection('licenses').doc(doc.id);
            batch.update(licenseRef, {
              assignedTo: null,
              status: 'PENDING', // Return to available pool
              updatedAt: new Date(),
              removedFrom: {
                userId: teamMemberId,
                email: userEmail,
                removedAt: new Date(),
                removedBy: removedBy
              }
            });
          });

          await batch.commit();
          licenseRestored = true;
          
          logger.info('Licenses restored to organization pool', {
            teamMemberId,
            licenseCount: licensesSnapshot.docs.length,
            organizationId
          });
        }
      } catch (licenseError) {
        logger.error('Error restoring licenses to pool', {
          teamMemberId,
          error: (licenseError as any)?.message
        });
        // Continue with cleanup even if license restoration fails
      }

      // Step 3: Clean up all collections where team member data exists
      const collectionsToClean = [
        'teamMembers',
        'users', 
        'orgMembers',
        'userProfiles',
        'projectTeamMembers',
        'projectAssignments',
        'sessions',
        'notifications'
      ];

      for (const collectionName of collectionsToClean) {
        try {
          await this.cleanupCollection(db, collectionName, teamMemberId, userEmail, organizationId);
          cleanedCollections.push(collectionName);
          
          logger.info(`Cleaned up collection: ${collectionName}`, {
            teamMemberId,
            organizationId
          });
        } catch (cleanupError) {
          logger.error(`Failed to cleanup collection: ${collectionName}`, {
            teamMemberId,
            error: (cleanupError as any)?.message
          });
          // Continue with other collections even if one fails
        }
      }

      // Step 4: Remove Firebase Authentication user
      if (firebaseUid) {
        try {
          await auth.deleteUser(firebaseUid);
          firebaseUserDeleted = true;
          
          logger.info('Firebase Auth user deleted', {
            teamMemberId,
            firebaseUid,
            email: userEmail
          });
        } catch (firebaseError) {
          logger.error('Failed to delete Firebase Auth user', {
            teamMemberId,
            firebaseUid,
            error: (firebaseError as any)?.message
          });
          // Continue even if Firebase deletion fails
        }
      }

      // Step 5: Create audit log entry
      try {
        await db.collection('auditLogs').add({
          action: 'TEAM_MEMBER_REMOVED',
          targetType: 'TEAM_MEMBER',
          targetId: teamMemberId,
          targetEmail: userEmail,
          organizationId: organizationId,
          performedBy: removedBy,
          timestamp: new Date(),
          details: {
            cleanedCollections,
            licenseRestored,
            firebaseUserDeleted,
            originalTeamMemberData: {
              email: userEmail,
              name: teamMember.name || `${teamMember.firstName} ${teamMember.lastName}`,
              role: teamMember.role,
              department: teamMember.department
            }
          }
        });
        
        logger.info('Audit log created for team member removal', {
          teamMemberId,
          organizationId
        });
      } catch (auditError) {
        logger.error('Failed to create audit log', {
          teamMemberId,
          error: (auditError as any)?.message
        });
        // Don't fail the operation if audit logging fails
      }

      logger.info('Team member removal completed successfully', {
        teamMemberId,
        organizationId,
        cleanedCollections,
        licenseRestored,
        firebaseUserDeleted
      });

      return {
        success: true,
        cleanedCollections,
        licenseRestored,
        firebaseUserDeleted
      };

    } catch (error) {
      logger.error('Failed to remove team member completely', {
        teamMemberId,
        organizationId,
        error: (error as any)?.message
      });

      return {
        success: false,
        cleanedCollections,
        licenseRestored,
        firebaseUserDeleted,
        error: (error as any)?.message || 'Failed to remove team member'
      };
    }
  }

  /**
   * Clean up a specific collection for the team member
   */
  private static async cleanupCollection(
    db: any,
    collectionName: string,
    teamMemberId: string,
    userEmail: string,
    organizationId: string
  ): Promise<void> {
    
    const queries = this.getCleanupQueries(collectionName, teamMemberId, userEmail, organizationId);
    
    for (const query of queries) {
      const snapshot = await query.get();
      
      if (!snapshot.empty) {
        const batch = db.batch();
        
        snapshot.docs.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        logger.info(`Deleted ${snapshot.docs.length} documents from ${collectionName}`, {
          teamMemberId,
          organizationId
        });
      }
    }
  }

  /**
   * Get appropriate queries for each collection type
   */
  private static getCleanupQueries(
    collectionName: string,
    teamMemberId: string,
    userEmail: string,
    organizationId: string
  ): any[] {
    const db = getFirestore();
    const queries: any[] = [];

    switch (collectionName) {
      case 'teamMembers':
        queries.push(db.collection(collectionName).doc(teamMemberId));
        queries.push(db.collection(collectionName).where('email', '==', userEmail));
        break;
        
      case 'users':
        queries.push(db.collection(collectionName).doc(teamMemberId));
        queries.push(db.collection(collectionName).where('email', '==', userEmail));
        break;
        
      case 'orgMembers':
        queries.push(db.collection(collectionName).where('userId', '==', teamMemberId));
        queries.push(db.collection(collectionName).where('email', '==', userEmail));
        queries.push(db.collection(collectionName).where('organizationId', '==', organizationId).where('email', '==', userEmail));
        break;
        
      case 'userProfiles':
        queries.push(db.collection(collectionName).where('userId', '==', teamMemberId));
        queries.push(db.collection(collectionName).where('email', '==', userEmail));
        break;
        
      case 'projectTeamMembers':
        queries.push(db.collection(collectionName).where('teamMemberId', '==', teamMemberId));
        queries.push(db.collection(collectionName).where('teamMemberEmail', '==', userEmail));
        break;
        
      case 'projectAssignments':
        queries.push(db.collection(collectionName).where('userId', '==', teamMemberId));
        queries.push(db.collection(collectionName).where('teamMemberId', '==', teamMemberId));
        break;
        
      case 'sessions':
        queries.push(db.collection(collectionName).where('userId', '==', teamMemberId));
        break;
        
      case 'notifications':
        queries.push(db.collection(collectionName).where('userId', '==', teamMemberId));
        queries.push(db.collection(collectionName).where('targetUserId', '==', teamMemberId));
        break;
        
      default:
        // Generic cleanup for other collections
        queries.push(db.collection(collectionName).where('userId', '==', teamMemberId));
        queries.push(db.collection(collectionName).where('teamMemberId', '==', teamMemberId));
    }

    // Filter out document references and return only queries
    return queries.filter(query => typeof query.get === 'function');
  }

  /**
   * Validate team member can be safely removed
   */
  static async validateRemoval(
    teamMemberId: string,
    organizationId: string
  ): Promise<{ canRemove: boolean; warnings: string[]; blockers: string[] }> {
    const warnings: string[] = [];
    const blockers: string[] = [];
    
    try {
      const db = getFirestore();
      
      // Check if team member is assigned to active projects
      const projectAssignments = await db.collection('projectTeamMembers')
        .where('teamMemberId', '==', teamMemberId)
        .get();
        
      if (!projectAssignments.empty) {
        warnings.push(`Team member is assigned to ${projectAssignments.docs.length} project(s). These assignments will be removed.`);
      }
      
      // Check if team member has active licenses
      const licenses = await db.collection('licenses')
        .where('assignedTo.userId', '==', teamMemberId)
        .where('organizationId', '==', organizationId)
        .get();
        
      if (!licenses.empty) {
        warnings.push(`Team member has ${licenses.docs.length} active license(s). These will be returned to the organization pool.`);
      }
      
      // Check if team member is the only admin (this would be a blocker)
      const teamMember = await firestoreService.getTeamMemberById(teamMemberId);
      if (teamMember?.role === 'ADMIN' || teamMember?.role === 'OWNER') {
        const otherAdmins = await db.collection('orgMembers')
          .where('organizationId', '==', organizationId)
          .where('role', 'in', ['ADMIN', 'OWNER'])
          .get();
          
        const activeAdmins = otherAdmins.docs.filter((doc: any) => {
          const data = doc.data();
          return data.userId !== teamMemberId && data.status === 'ACTIVE';
        });
        
        if (activeAdmins.length === 0) {
          blockers.push('Cannot remove the last admin/owner from the organization. Please assign another admin first.');
        }
      }
      
      return {
        canRemove: blockers.length === 0,
        warnings,
        blockers
      };
      
    } catch (error) {
      logger.error('Error validating team member removal', {
        teamMemberId,
        organizationId,
        error: (error as any)?.message
      });
      
      return {
        canRemove: false,
        warnings: [],
        blockers: ['Unable to validate removal due to system error']
      };
    }
  }
}

export default TeamMemberCleanupService;
