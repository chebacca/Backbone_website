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
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

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
    databaseURL: "https://backbone-logic-default-rtdb.firebaseio.com",
    storageBucket: "backbone-logic.firebasestorage.app",
    messagingSenderId: "749245129278",
    appId: "1:749245129278:web:dfa5647101ea160a3b276f",
    measurementId: "G-8SZRDQ4XVR"
  };
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase app with race condition handling
let app: FirebaseApp | undefined;

// 🔧 CRITICAL FIX: Check if Firebase is already initialized globally first
if (typeof window !== 'undefined' && (window as any).firebaseApp) {
  console.log('🔥 [Firebase] Using globally initialized Firebase app');
  app = (window as any).firebaseApp;
} else {
  // Check existing apps first to avoid duplicate initialization
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log('🔥 [Firebase] Using existing Firebase app:', app.name);
    // Store globally for consistency
    if (typeof window !== 'undefined') {
      (window as any).firebaseApp = app;
    }
  } else {
    // Initialize new app
    try {
      app = initializeApp(firebaseConfig);
      console.log('🔥 [Firebase] App initialized successfully');
      
      // Store globally for consistency
      if (typeof window !== 'undefined') {
        (window as any).firebaseApp = app;
      }
    } catch (error) {
      console.error('❌ [Firebase] Failed to initialize app:', error);
      // Try to get existing app if initialization failed due to duplicate
      const fallbackApps = getApps();
      if (fallbackApps.length > 0) {
        app = fallbackApps[0];
        console.log('🔥 [Firebase] Using fallback existing app:', app.name);
      }
    }
  }
}

// Function to ensure app is properly initialized
async function ensureAppInitialized(): Promise<FirebaseApp> {
  if (app) return app;
  
  // 🔧 CRITICAL FIX: Check global Firebase app first
  if (typeof window !== 'undefined' && (window as any).firebaseApp) {
    app = (window as any).firebaseApp;
    console.log('✅ [Firebase] Found global app instance');
    return app as FirebaseApp;
  }
  
  try {
    const { getApps } = await import('firebase/app');
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
      console.log('✅ [Firebase] Using existing app instance');
      
      // Store globally for consistency
      if (typeof window !== 'undefined') {
        (window as any).firebaseApp = app;
      }
      
      return app;
    }
  } catch (importError) {
    console.warn('⚠️ [Firebase] Failed to get existing apps:', importError);
  }
  
  // Create a new app if none exists
  try {
    app = initializeApp(firebaseConfig, 'fallback');
    console.log('✅ [Firebase] Created fallback app instance');
    
    // Store globally for consistency
    if (typeof window !== 'undefined') {
      (window as any).firebaseApp = app;
    }
    
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

// Connect to emulators in development mode
const isEmulator = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

if (isEmulator && app) {
  console.log('🔧 [FIREBASE SERVICE] Connecting to Firebase emulators...');
  
  try {
    // Connect to SHARED Auth Emulator (same as Dashboard)
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✅ [FIREBASE SERVICE] Connected to SHARED Auth Emulator (port 9099)');
    
    // Connect to SHARED Firestore Emulator (same as Dashboard)
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ [FIREBASE SERVICE] Connected to SHARED Firestore Emulator (port 8080)');
    
    // Connect to SHARED Functions Emulator (same as Dashboard)
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ [FIREBASE SERVICE] Connected to SHARED Functions Emulator (port 5001)');
    
    // Connect to SHARED Storage Emulator (same as Dashboard)
    const storage = getStorage(app);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ [FIREBASE SERVICE] Connected to SHARED Storage Emulator (port 9199)');
    
    console.log('🎉 [FIREBASE SERVICE] All emulators connected successfully!');
    
  } catch (error) {
    console.warn('⚠️ [FIREBASE SERVICE] Emulators may already be connected:', (error as Error)?.message || error);
  }
}

// Configure Firebase Auth to persist authentication state
if (auth) {
  // Set persistence to LOCAL to maintain auth state across page refreshes
  import('firebase/auth').then(({ setPersistence, browserLocalPersistence }) => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('⚠️ [Firebase] Failed to set auth persistence:', error);
    });
  }).catch((error) => {
    console.warn('⚠️ [Firebase] Failed to import auth persistence:', error);
  });
}

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
 * Load user data from Firestore by Firebase UID or email
 */
export const loadUserFromFirestore = async (firebaseUser: any) => {
  try {
    const { doc, getDoc, query, collection, where, getDocs } = await import('firebase/firestore');
    
    // Try to get user document by Firebase UID first
    let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    let userData = null;
    let userId = null;
    
    if (userDoc.exists()) {
      userData = userDoc.data();
      userId = userDoc.id;
      console.log('✅ [Firebase] Found user by Firebase UID:', userData.email);
    } else {
      // Try to find user by email
      const userQuery = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
      const userQuerySnap = await getDocs(userQuery);
      
      if (!userQuerySnap.empty) {
        userData = userQuerySnap.docs[0].data();
        userId = userQuerySnap.docs[0].id;
        console.log('✅ [Firebase] Found user by email:', userData.email);
      }
    }
    
    if (userData && userId) {
      // Create user object in expected format
      return {
        id: userId,
        email: userData.email,
        name: userData.name || userData.displayName || firebaseUser.displayName || userData.email.split('@')[0],
        role: userData.role || 'USER',
        organizationId: userData.organizationId,
        isTeamMember: userData.isTeamMember,
        memberRole: userData.memberRole,
        memberStatus: userData.memberStatus,
        firebaseUid: firebaseUser.uid,
        // Add subscription and license data if available
        subscription: userData.subscription,
        licenses: userData.licenses,
        teamMemberData: userData.teamMemberData
      };
    }
    
    // Return fallback user if no Firestore document found
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      role: 'USER' as const,
      firebaseUid: firebaseUser.uid
    };
  } catch (error) {
    console.warn('⚠️ [Firebase] Failed to load user from Firestore:', error);
    // Return fallback user on error
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      role: 'USER' as const,
      firebaseUid: firebaseUser.uid
    };
  }
};

/**
 * Try to restore Firebase Auth session for an existing user
 * This is useful when the user has a server session but needs Firebase Auth for Firestore access
 */
export const tryRestoreFirebaseSession = async (email: string): Promise<boolean> => {
  try {
    console.log('🔑 [Firebase] Attempting to restore Firebase Auth session for:', email);
    
    // Check if already authenticated with the right user
    if (isEmailAuthenticated(email)) {
      console.log('✅ [Firebase] User already authenticated with correct email');
      return true;
    }
    
    // Check if there's a different user authenticated
    if (auth.currentUser && auth.currentUser.email !== email) {
      console.log('🔄 [Firebase] Different user authenticated, signing out first');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    }
    
    // Try to get the password from AuthContext temp credentials
    try {
      const tempCredentials = localStorage.getItem('temp_credentials');
      
      if (tempCredentials) {
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
      
      // First, verify the team member exists in one of the collections
      let teamMemberExists = false;
      let teamMemberData: any = null;
      
      // Check teamMembers collection
      try {
        const teamMemberDoc = await getDoc(doc(db, 'teamMembers', teamMemberId));
        if (teamMemberDoc.exists()) {
          teamMemberExists = true;
          teamMemberData = teamMemberDoc.data();
          console.log('✅ [Firebase] Found team member in teamMembers collection');
        }
      } catch (error) {
        console.log('🔍 [Firebase] Team member not found in teamMembers, checking other collections...');
      }
      
      // Check users collection if not found
      if (!teamMemberExists) {
        try {
          const userDoc = await getDoc(doc(db, 'users', teamMemberId));
          if (userDoc.exists()) {
            teamMemberExists = true;
            teamMemberData = userDoc.data();
            console.log('✅ [Firebase] Found team member in users collection');
          }
        } catch (error) {
          console.log('🔍 [Firebase] Team member not found in users collection...');
        }
      }
      
      // Check orgMembers collection if still not found
      if (!teamMemberExists) {
        try {
          const orgMemberDoc = await getDoc(doc(db, 'orgMembers', teamMemberId));
          if (orgMemberDoc.exists()) {
            teamMemberExists = true;
            teamMemberData = orgMemberDoc.data();
            console.log('✅ [Firebase] Found team member in orgMembers collection');
          }
        } catch (error) {
          console.log('🔍 [Firebase] Team member not found in orgMembers collection...');
        }
      }
      
      if (!teamMemberExists) {
        throw new Error(`Team member not found in any collection: ${teamMemberId}`);
      }
      
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
      const cleanedData = Object.fromEntries(
        Object.entries(projectTeamMember).filter(([_, value]) => value !== undefined && value !== null)
      );
      
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
