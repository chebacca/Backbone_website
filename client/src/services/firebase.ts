/**
 * Firebase Client Configuration for WebOnly Mode
 * 
 * This service provides direct Firestore access in webonly production mode
 * without relying on API endpoints.
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  orderBy,
  limit,
  Firestore 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration - these are public config values
// For backbone-logic project - these are safe to expose in client code
const getFirebaseConfig = () => {
  // Try to get from environment variables first
  const envApiKey = (import.meta.env as any)?.VITE_FIREBASE_API_KEY;
  
  // Actual Firebase config for backbone-logic project
  return {
    apiKey: envApiKey || "AIzaSyDFnIzSYCdPsDDdvP1lympVxEeUn0AQhWs",
    authDomain: "backbone-logic.firebaseapp.com",
    projectId: "backbone-logic",
    storageBucket: "backbone-logic.firebasestorage.app",
    messagingSenderId: "749245129278",
    appId: "1:749245129278:web:dfa5647101ea160a3b276f",
    measurementId: "G-8SZRDQ4XVR"
  };
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

// Team Member interfaces
export interface FirestoreTeamMember {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  licenseType: string;
  status: string;
  organizationId: string;
  department?: string;
  createdAt: any;
  updatedAt: any;
  lastActive?: any;
}

export interface FirestoreProjectTeamMember {
  id: string;
  projectId: string;
  teamMemberId: string;
  role: string;
  assignedAt: any;
  assignedBy: string;
  isActive: boolean;
  teamMember?: FirestoreTeamMember;
}

export interface FirestoreOrganization {
  id: string;
  name: string;
  ownerUserId: string;
  tier?: 'PRO' | 'ENTERPRISE';
  createdAt: any;
  updatedAt: any;
}

export interface FirestoreOrgMember {
  id: string;
  orgId: string;
  email: string;
  userId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: 'OWNER' | 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER';
  status: 'INVITED' | 'ACTIVE' | 'REMOVED';
  seatReserved: boolean;
  licenseType?: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'NONE';
  department?: string;
  invitedByUserId?: string;
  invitedAt?: Date | any; // Support both Date objects and Firestore Timestamps
  joinedAt?: Date | any;
  lastActiveAt?: Date | any;
  createdAt: Date | any;
  updatedAt: Date | any;
}

/**
 * Firebase Team Member Service
 * Provides direct Firestore access for team member operations in webonly mode
 */
export class FirebaseTeamMemberService {
  
  /**
   * Get organizations for a user
   */
  static async getOrganizationsForUser(userId: string): Promise<FirestoreOrganization[]> {
    try {
      console.log('🔍 [Firebase] Getting organizations for user:', userId);
      
      // Get organizations where user is owner
      const ownerQuery = query(
        collection(db, 'organizations'),
        where('ownerUserId', '==', userId)
      );
      const ownerSnapshot = await getDocs(ownerQuery);
      
      // Get organizations where user is a member
      const memberQuery = query(
        collection(db, 'org_members'),
        where('userId', '==', userId),
        where('status', '==', 'ACTIVE')
      );
      const memberSnapshot = await getDocs(memberQuery);
      
      const orgIds = new Set<string>();
      const organizations: FirestoreOrganization[] = [];
      
      // Add owned organizations
      ownerSnapshot.forEach(doc => {
        const org = { id: doc.id, ...doc.data() } as FirestoreOrganization;
        organizations.push(org);
        orgIds.add(doc.id);
      });
      
      // Add member organizations
      for (const memberDoc of memberSnapshot.docs) {
        const memberData = memberDoc.data();
        const orgId = memberData.orgId;
        
        if (!orgIds.has(orgId)) {
          const orgDoc = await getDoc(doc(db, 'organizations', orgId));
          if (orgDoc.exists()) {
            const org = { id: orgDoc.id, ...orgDoc.data() } as FirestoreOrganization;
            organizations.push(org);
            orgIds.add(orgId);
          }
        }
      }
      
      console.log('✅ [Firebase] Found organizations:', organizations.length);
      return organizations;
    } catch (error) {
      console.error('❌ [Firebase] Error getting organizations:', error);
      return [];
    }
  }
  
  /**
   * Get organization members (licensed team members)
   */
  static async getOrgMembers(orgId: string): Promise<FirestoreOrgMember[]> {
    try {
      console.log('🔍 [Firebase] Getting org members for:', orgId);
      
      const q = query(
        collection(db, 'org_members'),
        where('orgId', '==', orgId),
        where('status', '==', 'ACTIVE'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const members: FirestoreOrgMember[] = [];
      
      snapshot.forEach(doc => {
        const memberData = doc.data();
        
        // Generate display name if not present
        let displayName = memberData.name;
        if (!displayName) {
          if (memberData.firstName && memberData.lastName) {
            displayName = `${memberData.firstName} ${memberData.lastName}`;
          } else if (memberData.firstName) {
            displayName = memberData.firstName;
          } else if (memberData.lastName) {
            displayName = memberData.lastName;
          } else if (memberData.email) {
            // Create name from email
            const emailParts = memberData.email.split('@');
            const username = emailParts[0];
            displayName = username
              .replace(/[._-]/g, ' ')
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          } else {
            displayName = 'Unknown User';
          }
        }
        
        const member: FirestoreOrgMember = {
          id: doc.id,
          ...memberData,
          name: displayName
        } as FirestoreOrgMember;
        
        members.push(member);
      });
      
      console.log('✅ [Firebase] Found org members:', members.length);
      return members;
    } catch (error) {
      console.error('❌ [Firebase] Error getting org members:', error);
      return [];
    }
  }
  
  /**
   * Get team members assigned to a project
   */
  static async getProjectTeamMembers(projectId: string): Promise<FirestoreProjectTeamMember[]> {
    try {
      console.log('🔍 [Firebase] Getting project team members for:', projectId);
      
      const q = query(
        collection(db, 'projectTeamMembers'),
        where('projectId', '==', projectId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const projectMembers: FirestoreProjectTeamMember[] = [];
      
      for (const docSnap of snapshot.docs) {
        const memberData = docSnap.data();
        
        // Get the team member details
        let teamMember: FirestoreTeamMember | undefined;
        try {
          const teamMemberDoc = await getDoc(doc(db, 'org_members', memberData.teamMemberId));
          if (teamMemberDoc.exists()) {
            const tmData = teamMemberDoc.data();
            
            // Generate display name
            let displayName = tmData.name;
            if (!displayName) {
              if (tmData.firstName && tmData.lastName) {
                displayName = `${tmData.firstName} ${tmData.lastName}`;
              } else if (tmData.firstName) {
                displayName = tmData.firstName;
              } else if (tmData.lastName) {
                displayName = tmData.lastName;
              } else if (tmData.email) {
                const emailParts = tmData.email.split('@');
                const username = emailParts[0];
                displayName = username
                  .replace(/[._-]/g, ' ')
                  .split(' ')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
              } else {
                displayName = 'Unknown User';
              }
            }
            
            teamMember = {
              id: teamMemberDoc.id,
              ...tmData,
              name: displayName
            } as FirestoreTeamMember;
          }
        } catch (error) {
          console.warn('Failed to get team member details:', error);
        }
        
        const projectMember: FirestoreProjectTeamMember = {
          id: docSnap.id,
          ...memberData,
          teamMember
        } as FirestoreProjectTeamMember;
        
        projectMembers.push(projectMember);
      }
      
      console.log('✅ [Firebase] Found project team members:', projectMembers.length);
      return projectMembers;
    } catch (error) {
      console.error('❌ [Firebase] Error getting project team members:', error);
      return [];
    }
  }
  
  /**
   * Add a team member to a project
   */
  static async addTeamMemberToProject(
    projectId: string, 
    teamMemberId: string, 
    role: string = 'DO_ER'
  ): Promise<FirestoreProjectTeamMember> {
    try {
      console.log('🔍 [Firebase] Adding team member to project:', { projectId, teamMemberId, role });
      
      // Check if already assigned
      const existingQuery = query(
        collection(db, 'projectTeamMembers'),
        where('projectId', '==', projectId),
        where('teamMemberId', '==', teamMemberId),
        where('isActive', '==', true)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) {
        throw new Error('Team member is already assigned to this project');
      }
      
      // Check if role is ADMIN and there's already an admin
      if (role === 'ADMIN') {
        const adminQuery = query(
          collection(db, 'projectTeamMembers'),
          where('projectId', '==', projectId),
          where('role', '==', 'ADMIN'),
          where('isActive', '==', true)
        );
        
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          throw new Error('Only one Admin is allowed per project. Please remove the existing Admin first.');
        }
      }
      
      // Add the team member
      const projectTeamMember = {
        projectId,
        teamMemberId,
        role,
        assignedAt: new Date(),
        assignedBy: 'current_user', // TODO: Get from auth context
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, 'projectTeamMembers'), projectTeamMember);
      
      console.log('✅ [Firebase] Team member added successfully:', docRef.id);
      
      return {
        id: docRef.id,
        ...projectTeamMember
      } as FirestoreProjectTeamMember;
    } catch (error) {
      console.error('❌ [Firebase] Error adding team member:', error);
      throw error;
    }
  }
  
  /**
   * Remove a team member from a project
   */
  static async removeTeamMemberFromProject(projectId: string, teamMemberId: string): Promise<void> {
    try {
      console.log('🔍 [Firebase] Removing team member from project:', { projectId, teamMemberId });
      
      const q = query(
        collection(db, 'projectTeamMembers'),
        where('projectId', '==', projectId),
        where('teamMemberId', '==', teamMemberId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'projectTeamMembers', docSnap.id));
      }
      
      console.log('✅ [Firebase] Team member removed successfully');
    } catch (error) {
      console.error('❌ [Firebase] Error removing team member:', error);
      throw error;
    }
  }
}

export default FirebaseTeamMemberService;
