/**
 * Firebase Client Configuration for WebOnly Mode
 * 
 * This service provides direct Firestore access in webonly production mode
 * without relying on API endpoints. Integrates with FirestoreCollectionManager
 * for centralized collection management.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
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
  Firestore,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration - these are public config values
// For backbone-logic project - these are safe to expose in client code
const getFirebaseConfig = () => {
  // Prefer runtime-injected global to avoid drift across apps
  if (typeof window !== 'undefined' && (window as any).FIREBASE_CONFIG) {
    return (window as any).FIREBASE_CONFIG;
  }

  // Try to get from environment variables first
  const envApiKey = (import.meta.env as any)?.VITE_FIREBASE_API_KEY;
  
  // Fallback to static config for backbone-logic project
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

// Initialize Firebase app
let app: FirebaseApp | undefined;
try {
  app = initializeApp(firebaseConfig);
  console.log('🔥 [Firebase] App initialized successfully');
} catch (error) {
  // App might already be initialized
  console.log('ℹ️ [Firebase] App already initialized or error:', error);
}

// Function to ensure app is properly initialized
async function ensureAppInitialized(): Promise<FirebaseApp> {
  if (app) return app;
  
  try {
    const { getApps } = await import('firebase/app');
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
      console.log('✅ [Firebase] Using existing app instance');
      return app;
    }
  } catch (importError) {
    console.warn('⚠️ [Firebase] Failed to get existing apps:', importError);
  }
  
  // Create a new app if none exists
  try {
    app = initializeApp(firebaseConfig, 'fallback');
    console.log('✅ [Firebase] Created fallback app instance');
    return app;
  } catch (fallbackError) {
    console.error('❌ [Firebase] Failed to create fallback app:', fallbackError);
    throw new Error('Failed to initialize Firebase app');
  }
}

// Initialize Firestore with lazy initialization
export const db = app ? getFirestore(app) : getFirestore();

// Initialize Auth with lazy initialization
export const auth = app ? getAuth(app) : getAuth();

// Function to get properly initialized services
export async function getInitializedServices() {
  const initializedApp = await ensureAppInitialized();
  return {
    app: initializedApp,
    db: getFirestore(initializedApp),
    auth: getAuth(initializedApp)
  };
}

// Fix Content Security Policy issues for WebOnly mode
export function fixCSPIssues() {
  if (typeof window === 'undefined') return;
  
  try {
    // TEMPORARY FIX: Disable client-side CSP override to prevent SES lockdown conflicts
    // The Firebase hosting CSP should be sufficient
    console.log('ℹ️ [Firebase] Skipping client-side CSP override - relying on Firebase hosting CSP');
    
    // Remove any existing CSP meta tag that might conflict
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
      console.log('🧹 [Firebase] Removed conflicting client-side CSP meta tag');
    }
    
  } catch (error) {
    console.warn('⚠️ [Firebase] Failed to clean up CSP:', error);
  }
}

// Apply CSP fixes immediately
fixCSPIssues();

// Export the app instance
export { app };

// Export Firebase services
export { db as firestore, auth as firebaseAuth };

// Configure Firestore settings to ignore undefined properties
// This prevents errors when creating documents with undefined fields
const firestoreSettings = {
  ignoreUndefinedProperties: true
};

// Apply settings to Firestore instance
if (typeof window !== 'undefined') {
  // In web environment, we need to configure this through the app
  // The setting will be applied when Firestore operations are performed
  (window as any).FIREBASE_IGNORE_UNDEFINED_PROPERTIES = true;
}

/**
 * Clean document data by removing undefined and null values
 * This prevents Firestore errors when creating/updating documents
 */
const cleanDocumentData = <T>(data: T): T => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => cleanDocumentData(item)) as T;
  }
  
  const cleaned: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = cleanDocumentData(value);
    }
  }
  
  return cleaned as T;
};

// Emulator connection - Licensing website never uses emulators
// Licensing website is ALWAYS in production mode (web-only)
console.log('🌐 [Firebase] Licensing website mode: production (web-only) - no emulators');

// WebOnly mode detection - Licensing website is ALWAYS web-only
export const isWebOnlyMode = (): boolean => {
  // Licensing website is always in web-only mode
  // This ensures consistent behavior across all environments
  return true;
};

// Initialize collection manager on load
let collectionManagerInitialized = false;
export const initializeFirebaseCollections = async (): Promise<void> => {
  if (collectionManagerInitialized) return;
  
  try {
    const { firestoreCollectionManager } = await import('./FirestoreCollectionManager');
    await firestoreCollectionManager.initializeCollections();
    collectionManagerInitialized = true;
    console.log('✅ [Firebase] Collection manager initialized');
  } catch (error) {
    console.error('❌ [Firebase] Failed to initialize collection manager:', error);
  }
};

/**
 * Check if a user is already authenticated with Firebase Auth
 */
export const isUserAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Get the current Firebase Auth user
 */
export const getCurrentFirebaseUser = () => {
  return auth.currentUser;
};

/**
 * Check if a specific email is already authenticated
 */
export const isEmailAuthenticated = (email: string): boolean => {
  return auth.currentUser?.email === email;
};

/**
 * Try to restore Firebase Auth session for an existing user
 * This is useful when the user has a server session but needs Firebase Auth for Firestore access
 */
export const tryRestoreFirebaseSession = async (email: string): Promise<boolean> => {
  try {
    // Check if already authenticated with the right user
    if (isEmailAuthenticated(email)) {
      return true;
    }
    
    // Check if there's a different user authenticated
    if (auth.currentUser && auth.currentUser.email !== email) {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    }
    
    // Try to get the password from AuthContext temp credentials
    try {
      const authUserStr = localStorage.getItem('auth_user');
      const tempCredentials = localStorage.getItem('temp_credentials');
      
      if (authUserStr && tempCredentials) {
        const credentials = JSON.parse(tempCredentials);
        if (credentials.email === email && credentials.password) {
          console.log('🔑 [Firebase] Attempting to restore Firebase Auth session with stored credentials');
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          await signInWithEmailAndPassword(auth, email, credentials.password);
          console.log('✅ [Firebase] Firebase Auth session restored successfully');
          return true;
        }
      }
    } catch (credError) {
      console.warn('⚠️ [Firebase] Could not restore session with stored credentials:', credError);
    }
    
    // If we can't restore with credentials, return false
    console.log('ℹ️ [Firebase] No stored credentials available for session restoration');
    return false;
    
  } catch (error) {
    console.warn('⚠️ [Firebase] Error during session restoration:', error);
    return false;
  }
};

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
      
      // Clean the data to remove undefined values that could cause Firestore errors
      const cleanedData = cleanDocumentData(projectTeamMember);
      
      const docRef = await addDoc(collection(db, 'projectTeamMembers'), cleanedData);
      
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
