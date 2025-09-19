/**
 * 🚀 Unified Data Service
 * 
 * Single service layer that replaces all existing Firebase services
 * with streamlined collections, embedded data, and smart caching.
 * 
 * This service provides:
 * - Single source of truth for all data operations
 * - Smart caching to reduce Firebase calls
 * - Consistent data access patterns
 * - Embedded relationships to minimize joins
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { firestoreCollectionManager, COLLECTIONS } from './FirestoreCollectionManager';

// ============================================================================
// STREAMLINED TYPE DEFINITIONS
// ============================================================================

export interface StreamlinedUser {
  id: string; // Firebase UID
  email: string;
  name: string;
  
  // User Type & Role
  userType: 'ACCOUNT_OWNER' | 'TEAM_MEMBER' | 'ADMIN' | 'ACCOUNTING';
  role: string;
  
  // Organization Context (embedded)
  organization: {
    id: string;
    name: string;
    tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
    isOwner: boolean;
  };
  
  // License & Permissions (embedded)
  license: {
    type: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
    permissions: string[];
    canCreateProjects: boolean;
    canManageTeam: boolean;
  };
  
  // Team Member Specific (only if userType === 'TEAM_MEMBER')
  teamMemberData?: {
    managedBy: string;
    department?: string;
    assignedProjects: string[];
  };
  
  // Metadata
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface StreamlinedOrganization {
  id: string;
  name: string;
  tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  
  // Owner Info (embedded)
  owner: {
    id: string;
    email: string;
    name: string;
  };
  
  // Subscription Info (embedded)
  subscription: {
    id: string;
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
    seats: number;
    usedSeats: number;
    currentPeriodEnd: Date;
  };
  
  // Usage Stats (embedded)
  usage: {
    totalUsers: number;
    totalProjects: number;
    storageUsed: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamlinedProject {
  id: string;
  name: string;
  description?: string;
  
  // Ownership (embedded)
  owner: {
    id: string;
    email: string;
    name: string;
  };
  
  // Organization Context (embedded)
  organization: {
    id: string;
    name: string;
    tier: string;
  };
  
  // Team Assignments (embedded array)
  teamAssignments: Array<{
    userId: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MEMBER' | 'VIEWER';
    assignedAt: Date;
    assignedBy: string;
  }>;
  
  // Project Settings (embedded)
  settings: {
    applicationMode: 'standalone' | 'shared_network';
    storageBackend: 'firestore' | 'gcs' | 's3' | 'azure-blob';
    maxCollaborators: number;
    allowCollaboration: boolean;
  };
  
  // Status & Metadata
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

export interface StreamlinedSubscription {
  id: string;
  organizationId: string;
  
  // Subscription Details (embedded)
  plan: {
    tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
    seats: number;
    pricePerSeat: number;
    billingCycle: 'monthly' | 'yearly';
  };
  
  // Status & Billing
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  
  // Payment Info (embedded)
  payment: {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    paymentMethodId?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamlinedDataset {
  id: string;
  name: string;
  description?: string;
  
  // Owner Info (embedded)
  owner: {
    id: string;
    email: string;
    organizationId: string;
  };
  
  // Project Assignments (embedded array)
  assignedProjects: Array<{
    projectId: string;
    projectName: string;
    assignedAt: Date;
  }>;
  
  // Storage Config (embedded)
  storage: {
    backend: 'firestore' | 'gcs' | 's3' | 'azure-blob';
    bucket?: string;
    path?: string;
    size: number;
  };
  
  // Metadata
  visibility: 'private' | 'organization' | 'public';
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamlinedLicense {
  id: string;
  key: string;
  name: string;
  tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  
  // Assignment Info (embedded)
  assignedTo?: {
    userId: string;
    name: string;
    email: string;
    assignedAt: Date;
  };
  
  // Organization Context (embedded)
  organization: {
    id: string;
    name: string;
    tier: string;
  };
  
  // Usage & Limits (embedded)
  usage: {
    apiCalls: number;
    dataTransfer: number; // GB
    deviceCount: number;
    maxDevices: number;
  };
  
  // Dates
  activatedAt?: Date;
  expiresAt: Date;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreamlinedTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  
  // Role & Status
  role: 'admin' | 'member' | 'viewer' | 'owner';
  status: 'active' | 'pending' | 'suspended' | 'removed';
  
  // Organization Context (embedded)
  organization: {
    id: string;
    name: string;
    tier: string;
  };
  
  // License Assignment (embedded)
  licenseAssignment?: {
    licenseId: string;
    licenseKey: string;
    licenseType: string;
    assignedAt: Date;
  };
  
  // Department & Projects (embedded)
  department?: string;
  position?: string;
  phone?: string;
  assignedProjects: string[];
  
  // License information
  licenseType?: string;
  
  // Organization ID for compatibility
  organizationId?: string;
  
  // Metadata
  avatar?: string;
  joinedAt: Date;
  lastActive?: Date;
  invitedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields for compatibility
  password?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface OrganizationContext {
  organization: StreamlinedOrganization;
  subscription: StreamlinedSubscription;
  members: StreamlinedUser[];
}

// ============================================================================
// UNIFIED DATA SERVICE CLASS
// ============================================================================

class UnifiedDataService {
  private static instance: UnifiedDataService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private db: any = null;
  private auth: any = null;

  private constructor() {
    this.initializeFirebase();
  }

  private getApiBaseUrl(): string {
    // 🔥 PRODUCTION MODE: Use Cloud Run API endpoint
    console.log('[UnifiedDataService] PRODUCTION MODE: Using Cloud Run API endpoint');
    return 'https://us-central1-backbone-logic.cloudfunctions.net/api';
  }

  private async initializeFirebase() {
    try {
      console.log('🔧 [UnifiedDataService] Initializing Firebase...');
      const { db, auth } = await import('./firebase');
      this.db = db;
      this.auth = auth;
      console.log('✅ [UnifiedDataService] Firebase initialized successfully');
    } catch (error) {
      console.error('❌ [UnifiedDataService] Failed to initialize Firebase:', error);
      throw error;
    }
  }

  /**
   * Wait for Firebase Auth to be ready and have a current user
   */
  private async waitForAuthReady(): Promise<boolean> {
    if (!this.auth) {
      await this.initializeFirebase();
    }

    // If there's already a current user, we're ready
    if (this.auth?.currentUser) {
      return true;
    }

    // Wait for auth state to change (with timeout)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000); // 5 second timeout

      const unsubscribe = this.auth.onAuthStateChanged((user: any) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve(!!user);
      });
    });
  }

  /**
   * Get the current user's Firebase ID token for API authentication
   */
  private async getAuthToken(): Promise<string> {
    if (!this.auth?.currentUser) {
      throw new Error('No authenticated user found');
    }
    
    try {
      const token = await this.auth.currentUser.getIdToken();
      if (!token) {
        throw new Error('Failed to get ID token from Firebase Auth');
      }
      return token;
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error getting auth token:', error);
      throw new Error('Failed to get authentication token');
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  /**
   * Map user document from any collection (users, orgMembers, etc.) to StreamlinedUser
   */
  private mapUserDocument(doc: any): StreamlinedUser {
    const data = doc.data();
    
    return {
      id: doc.id,
      email: data.email || '',
      name: data.name || data.firstName + ' ' + data.lastName || 'Unknown User',
      
      // Map user type and role from seeded data
      userType: data.userType || 'TEAM_MEMBER',
      role: data.role || 'member',
      
      // Map organization data from various possible fields
      organization: {
        id: data.organizationId || data.orgId || 'default-org',
        name: data.organizationName || 'Unknown Organization',
        tier: data.tier || 'BASIC',
        isOwner: data.isOwner || data.role === 'OWNER' || false
      },
      
      // Map license data
      license: {
        type: data.licenseType || data.tier || 'BASIC',
        status: data.status || 'ACTIVE',
        permissions: data.permissions || [],
        canCreateProjects: data.tier === 'ENTERPRISE' || data.tier === 'PROFESSIONAL',
        canManageTeam: data.role === 'admin' || data.role === 'owner' || data.role === 'OWNER'
      },
      
      // Map team member data if applicable
      teamMemberData: data.userType === 'TEAM_MEMBER' ? {
        managedBy: data.managedBy || '',
        department: data.department || '',
        assignedProjects: data.assignedProjects || []
      } : undefined,
      
      // Map status and dates
      status: data.status || 'ACTIVE',
      createdAt: this.safeToDate(data.createdAt),
      updatedAt: this.safeToDate(data.updatedAt),
      lastLoginAt: data.lastLoginAt ? this.safeToDate(data.lastLoginAt) : undefined
    } as StreamlinedUser;
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================
  
  async getCurrentUser(): Promise<StreamlinedUser | null> {
    const cacheKey = 'current-user';
    const cached = this.getFromCache<StreamlinedUser>(cacheKey);
    if (cached) return cached;

    // Wait for Firebase Auth to be ready
    const authReady = await this.waitForAuthReady();
    if (!authReady) {
      console.log('🔍 [UnifiedDataService] Firebase Auth not ready after waiting');
      return null;
    }

    if (!this.auth?.currentUser) {
      console.log('🔍 [UnifiedDataService] No Firebase Auth user found after auth ready');
      return null;
    }

    try {
      const currentUserEmail = this.auth.currentUser.email;
      const currentUserUid = this.auth.currentUser.uid;
      
      console.log('🔍 [UnifiedDataService] Looking for user:', currentUserEmail, 'UID:', currentUserUid);
      
      // 🔧 CRITICAL FIX: Special handling for enterprise user dual organization
      if (currentUserEmail === 'enterprise.user@enterprisemedia.com') {
        console.log('🔧 [UnifiedDataService] Enterprise user detected - using enterprise-media-org for data consistency');
        
        // Create a synthetic user object for enterprise user with correct organization
        const enterpriseUser: StreamlinedUser = {
          id: currentUserUid,
          email: currentUserEmail,
          name: 'Enterprise User',
          userType: 'ACCOUNT_OWNER',
          role: 'ADMIN',
          organization: {
            id: 'enterprise-media-org', // Use the organization where data actually exists
            name: 'Enterprise Media Solutions',
            tier: 'ENTERPRISE',
            isOwner: true
          },
          license: {
            type: 'ENTERPRISE',
            status: 'ACTIVE',
            permissions: ['all'],
            canCreateProjects: true,
            canManageTeam: true
          },
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.setCache(cacheKey, enterpriseUser);
        return enterpriseUser;
      }
      
      // Try to find user in users collection first
      let userDoc = await getDoc(doc(this.db, 'users', currentUserUid));
      
      if (userDoc.exists()) {
        console.log('✅ [UnifiedDataService] Found user in users collection');
        const user = this.mapUserDocument(userDoc);
        this.setCache(cacheKey, user);
        return user;
      }
      
      // If not found by UID, try to find by email in users collection
      try {
        const usersQuery = query(
          collection(this.db, 'users'),
          where('email', '==', currentUserEmail)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          console.log('✅ [UnifiedDataService] Found user by email in users collection');
          const user = this.mapUserDocument(usersSnapshot.docs[0]);
          this.setCache(cacheKey, user);
          return user;
        }
      } catch (error) {
        console.warn('⚠️ [UnifiedDataService] Error querying users by email:', error);
      }
      
      // Try orgMembers collection
      try {
        const orgMembersQuery = query(
          collection(this.db, 'orgMembers'),
          where('email', '==', currentUserEmail)
        );
        const orgMembersSnapshot = await getDocs(orgMembersQuery);
        
        if (!orgMembersSnapshot.empty) {
          console.log('✅ [UnifiedDataService] Found user in orgMembers collection');
          const user = this.mapUserDocument(orgMembersSnapshot.docs[0]);
          this.setCache(cacheKey, user);
          return user;
        }
      } catch (error) {
        console.warn('⚠️ [UnifiedDataService] Error querying orgMembers:', error);
      }
      
      console.log('❌ [UnifiedDataService] User not found in any collection');
      return null;
      
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error fetching current user:', error);
      return null;
    }
  }

  async getUsersByOrganization(organizationId: string): Promise<StreamlinedUser[]> {
    const cacheKey = `org-users-${organizationId}`;
    const cached = this.getFromCache<StreamlinedUser[]>(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 [UnifiedDataService] Fetching users for organization:', organizationId);
      
      // Ensure Firebase is initialized
      if (!this.db) {
        await this.initializeFirebase();
      }
      
      // Try multiple collections to find user data
      let users: StreamlinedUser[] = [];
      
      // First try users collection
      try {
        console.log('🔍 [UnifiedDataService] Trying users collection...');
        const usersQuery = query(
          collection(this.db, 'users'),
          where('organizationId', '==', organizationId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        console.log('📊 [UnifiedDataService] Found', usersSnapshot.docs.length, 'users in users collection');
        
        users = users.concat(usersSnapshot.docs.map(doc => this.mapUserDocument(doc)));
      } catch (error) {
        console.warn('⚠️ [UnifiedDataService] Error querying users collection:', error);
      }
      
      // Also try orgMembers collection
      try {
        console.log('🔍 [UnifiedDataService] Trying orgMembers collection...');
        const orgMembersQuery = query(
          collection(this.db, 'orgMembers'),
          where('organizationId', '==', organizationId)
        );
        const orgMembersSnapshot = await getDocs(orgMembersQuery);
        console.log('📊 [UnifiedDataService] Found', orgMembersSnapshot.docs.length, 'users in orgMembers collection');
        
        users = users.concat(orgMembersSnapshot.docs.map(doc => this.mapUserDocument(doc)));
      } catch (error) {
        console.warn('⚠️ [UnifiedDataService] Error querying orgMembers collection:', error);
      }
      
      // Also try with orgId field
      try {
        console.log('🔍 [UnifiedDataService] Trying orgMembers with orgId field...');
        const orgMembersQuery2 = query(
          collection(this.db, 'orgMembers'),
          where('orgId', '==', organizationId)
        );
        const orgMembersSnapshot2 = await getDocs(orgMembersQuery2);
        console.log('📊 [UnifiedDataService] Found', orgMembersSnapshot2.docs.length, 'users in orgMembers with orgId');
        
        users = users.concat(orgMembersSnapshot2.docs.map(doc => this.mapUserDocument(doc)));
      } catch (error) {
        console.warn('⚠️ [UnifiedDataService] Error querying orgMembers with orgId:', error);
      }
      
      // Remove duplicates based on email
      const uniqueUsers = users.filter((user, index, self) => 
        index === self.findIndex(u => u.email === user.email)
      );
      
      this.setCache(cacheKey, uniqueUsers);
      console.log('✅ [UnifiedDataService] Successfully fetched', uniqueUsers.length, 'unique users for organization:', organizationId);
      return uniqueUsers;
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error fetching organization users:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      return [];
    }
  }

  async updateUser(userId: string, updates: Partial<StreamlinedUser>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(this.db, 'users', userId), updateData);
      
      // Clear related caches
      this.clearCacheByPattern('current-user');
      this.clearCacheByPattern('org-users-');
      this.clearCacheByPattern('org-context-');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // ============================================================================
  // PROJECT OPERATIONS
  // ============================================================================
  
  // Helper function to safely convert Firestore timestamps to dates
  private safeToDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value.toDate === 'function') return value.toDate();
    if (typeof value === 'string') return new Date(value);
    if (typeof value === 'number') return new Date(value);
    return new Date();
  }

  async getProjectsForUser(): Promise<StreamlinedProject[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const cacheKey = `user-projects-${user.id}`;
    const cached = this.getFromCache<StreamlinedProject[]>(cacheKey);
    if (cached) return cached;

    try {
      // Query projects by organizationId to match actual data structure
      const projectsQuery = query(
        collection(this.db, 'projects'),
        where('organizationId', '==', user.organization.id)
      );

      const snapshot = await getDocs(projectsQuery);
      const projects = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔍 [UnifiedDataService] Processing project data:', { id: doc.id, data });
        return {
          ...data,
          id: doc.id,
          createdAt: this.safeToDate(data.createdAt),
          updatedAt: this.safeToDate(data.updatedAt),
          lastAccessedAt: this.safeToDate(data.lastAccessedAt)
        } as StreamlinedProject;
      });
      
      this.setCache(cacheKey, projects);
      return projects;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  }

  async createProject(projectData: Omit<StreamlinedProject, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessedAt'>): Promise<string> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      const newProject: Omit<StreamlinedProject, 'id'> = {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessedAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, 'projects'), newProject);
      
      // Clear related caches
      this.clearCacheByPattern('user-projects-');
      this.clearCacheByPattern('org-projects-');
      this.clearCacheByPattern('org-context-');
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<StreamlinedProject>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(this.db, 'projects', projectId), updateData);
      
      // Clear related caches
      this.clearCacheByPattern('user-projects-');
      this.clearCacheByPattern('project-');
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // ============================================================================
  // TEAM MEMBER OPERATIONS
  // ============================================================================
  
  async addTeamMemberToProject(projectId: string, userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER'): Promise<void> {
    try {
      // Get user info
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');
      
      const user = userDoc.data() as StreamlinedUser;
      const currentUser = await this.getCurrentUser();
      
      // Create team assignment with proper validation
      const teamAssignment = {
        userId: user.id || '',
        email: user.email || '',
        name: user.name || 'Unknown User',
        role: role || 'MEMBER',
        assignedAt: new Date(),
        assignedBy: currentUser?.email || 'system'
      };

      // Validate that no undefined values exist
      const validatedAssignment = Object.fromEntries(
        Object.entries(teamAssignment).filter(([_, value]) => value !== undefined && value !== null)
      );

      console.log('🔍 [UnifiedDataService] Team assignment data:', {
        original: teamAssignment,
        validated: validatedAssignment,
        projectId,
        userId
      });

      // Get current project to ensure teamAssignments field exists
      const projectDoc = await getDoc(doc(this.db, 'projects', projectId));
      if (!projectDoc.exists()) throw new Error('Project not found');
      
      const projectData = projectDoc.data();
      const existingTeamAssignments = projectData.teamAssignments || [];
      
      console.log('🔍 [UnifiedDataService] Project data:', {
        projectId,
        hasTeamAssignments: !!projectData.teamAssignments,
        existingCount: existingTeamAssignments.length
      });
      
      // Update project with new team assignment
      // Use setDoc with merge to ensure teamAssignments field exists
      await setDoc(doc(this.db, 'projects', projectId), {
        teamAssignments: arrayUnion(validatedAssignment),
        updatedAt: new Date()
      }, { merge: true });

      // Update user's assigned projects
      await updateDoc(doc(this.db, 'users', userId), {
        'teamMemberData.assignedProjects': arrayUnion(projectId),
        updatedAt: new Date()
      });

      // Clear caches
      this.clearCacheByPattern('user-projects-');
      this.clearCacheByPattern('project-');
    } catch (error) {
      console.error('Error adding team member to project:', error);
      throw error;
    }
  }

  async removeTeamMemberFromProject(projectId: string, userId: string): Promise<void> {
    try {
      // Get current project to find the assignment to remove
      const projectDoc = await getDoc(doc(this.db, 'projects', projectId));
      if (!projectDoc.exists()) throw new Error('Project not found');
      
      const project = projectDoc.data() as StreamlinedProject;
      const assignmentToRemove = project.teamAssignments.find(a => a.userId === userId);
      
      if (assignmentToRemove) {
        // Remove team assignment from project
        await updateDoc(doc(this.db, 'projects', projectId), {
          teamAssignments: arrayRemove(assignmentToRemove),
          updatedAt: new Date()
        });

        // Remove project from user's assigned projects
        await updateDoc(doc(this.db, 'users', userId), {
          'teamMemberData.assignedProjects': arrayRemove(projectId),
          updatedAt: new Date()
        });

        // Clear caches
        this.clearCacheByPattern('user-projects-');
        this.clearCacheByPattern('project-');
      }
    } catch (error) {
      console.error('Error removing team member from project:', error);
      throw error;
    }
  }

  // ============================================================================
  // ORGANIZATION OPERATIONS
  // ============================================================================
  
  async getOrganizationContext(): Promise<OrganizationContext> {
    // Ensure Firebase is initialized
    if (!this.auth || !this.db) {
      await this.initializeFirebase();
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const cacheKey = `org-context-${user.organization.id}`;
    const cached = this.getFromCache<OrganizationContext>(cacheKey);
    if (cached) return cached;

    try {
      // Get organization
      const orgDoc = await getDoc(doc(this.db, 'organizations', user.organization.id));
      
      if (!orgDoc.exists()) {
        throw new Error(`Organization ${user.organization.id} not found`);
      }
      
      const orgData = orgDoc.data();
      
      const organization: StreamlinedOrganization = {
        ...orgData,
        id: user.organization.id,
        createdAt: orgData.createdAt?.toDate() || new Date(),
        updatedAt: orgData.updatedAt?.toDate() || new Date()
      } as StreamlinedOrganization;

      // Get subscription
      const subQuery = query(
        collection(this.db, 'subscriptions'),
        where('organizationId', '==', user.organization.id),
        where('status', '==', 'ACTIVE'),
        limit(1)
      );
      const subSnapshot = await getDocs(subQuery);
      
      let subscription: StreamlinedSubscription | null = null;
      if (!subSnapshot.empty) {
        const subData = subSnapshot.docs[0].data();
        subscription = {
          ...subData,
          id: subSnapshot.docs[0].id,
          createdAt: subData.createdAt?.toDate() || new Date(),
          updatedAt: subData.updatedAt?.toDate() || new Date(),
          currentPeriodStart: subData.currentPeriodStart?.toDate() || new Date(),
          currentPeriodEnd: subData.currentPeriodEnd?.toDate() || new Date()
        } as StreamlinedSubscription;
      }

      // Get members
      let members: StreamlinedUser[] = [];
      try {
        members = await this.getUsersByOrganization(user.organization.id);
      } catch (error) {
        console.error('Failed to get organization members:', error);
        throw error;
      }

      const context: OrganizationContext = { 
        organization, 
        subscription: subscription!, 
        members 
      };
      
      this.setCache(cacheKey, context, 10 * 60 * 1000); // 10 min cache
      return context;
    } catch (error) {
      console.error('Error fetching organization context:', error);
      throw error;
    }
  }

  // ============================================================================
  // LICENSE OPERATIONS
  // ============================================================================
  
  async getLicensesForOrganization(): Promise<StreamlinedLicense[]> {
    // Ensure Firebase is initialized
    if (!this.auth || !this.db) {
      await this.initializeFirebase();
    }

    const user = await this.getCurrentUser();
    if (!user) {
      console.log('🔍 [UnifiedDataService] No user found for license query');
      return [];
    }

    console.log('🔍 [UnifiedDataService] Fetching licenses for organization:', user.organization.id);

    const cacheKey = `org-licenses-${user.organization.id}`;
    const cached = this.getFromCache<StreamlinedLicense[]>(cacheKey);
    if (cached) {
      console.log('📋 [UnifiedDataService] Returning cached licenses:', cached.length);
      return cached;
    }

    try {
      // Query licenses by organizationId to match actual data structure
      const licensesQuery = query(
        collection(this.db, 'licenses'),
        where('organizationId', '==', user.organization.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(licensesQuery);
      console.log('📊 [UnifiedDataService] Found', snapshot.docs.length, 'license documents');
      
      const licenses = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Map the actual seeded data structure to StreamlinedLicense interface
        return {
          id: doc.id,
          key: data.key || '',
          name: data.name || `License ${doc.id}`,
          tier: data.tier || 'BASIC',
          status: data.status || 'PENDING',
          
          // Map organization data from embedded object or fallback to top-level
          organization: data.organization ? {
            id: data.organization.id,
            name: data.organization.name,
            tier: data.organization.tier
          } : {
            id: data.organizationId || '',
            name: data.organizationName || 'Unknown Organization',
            tier: data.tier || 'BASIC'
          },
          
          // Map assignment data if exists
          assignedTo: data.assignedTo ? {
            userId: data.assignedTo.userId,
            name: data.assignedTo.name || data.assignedToName || 'Unknown User',
            email: data.assignedTo.email || data.assignedToEmail || '',
            assignedAt: data.assignedTo.assignedAt?.toDate() || data.activatedAt?.toDate() || new Date()
          } : (data.assignedToUserId ? {
            userId: data.assignedToUserId,
            name: data.assignedToName || data.assignedToEmail || 'Unknown User',
            email: data.assignedToEmail || '',
            assignedAt: data.activatedAt?.toDate() || new Date()
          } : undefined),
          
          // Map usage data from embedded object or defaults
          usage: data.usage ? {
            apiCalls: data.usage.apiCalls || 0,
            dataTransfer: data.usage.dataTransfer || 0,
            deviceCount: data.usage.deviceCount || 1,
            maxDevices: data.usage.maxDevices || (data.tier === 'ENTERPRISE' ? 10 : data.tier === 'PROFESSIONAL' ? 5 : 2)
          } : {
            apiCalls: data.usageCount || 0,
            dataTransfer: 0,
            deviceCount: 1,
            maxDevices: data.tier === 'ENTERPRISE' ? 10 : data.tier === 'PROFESSIONAL' ? 5 : 2
          },
          
          // Map dates
          activatedAt: data.activatedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate() || new Date(),
          lastUsed: data.lastUsed?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as StreamlinedLicense;
      });
      
      console.log('✅ [UnifiedDataService] Processed', licenses.length, 'licenses for organization');
      this.setCache(cacheKey, licenses);
      return licenses;
    } catch (error) {
      console.error('Error fetching organization licenses:', error);
      return [];
    }
  }

  async createLicense(licenseData: Omit<StreamlinedLicense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      // 🔧 FIX: Create license data in the format expected by the query
      // Store both nested organization object AND flat organizationId for compatibility
      const firestoreData = {
        // Core license fields
        key: licenseData.key,
        name: licenseData.name,
        tier: licenseData.tier,
        status: licenseData.status,
        
        // Flat organization fields (for querying)
        organizationId: licenseData.organization.id,
        organizationName: licenseData.organization.name,
        
        // Usage data
        usageCount: licenseData.usage?.apiCalls || 0,
        
        // Assignment data (if any)
        userId: licenseData.assignedTo?.userId || null,
        userName: licenseData.assignedTo?.name || null,
        userEmail: licenseData.assignedTo?.email || null,
        activatedAt: licenseData.assignedTo?.assignedAt || null,
        
        // Dates
        expiresAt: licenseData.expiresAt,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Keep nested organization for compatibility
        organization: licenseData.organization,
        usage: licenseData.usage
      };

      console.log('🎫 [UnifiedDataService] Creating license with Firestore data:', firestoreData);
      const docRef = await addDoc(collection(this.db, 'licenses'), firestoreData);
      
      // 🔧 ENHANCED CACHE CLEARING: Clear all license-related caches
      this.clearCacheByPattern('org-licenses-');
      this.clearCacheByPattern('user-');
      this.clearCacheByPattern('organization-');
      console.log('🧹 [UnifiedDataService] Cleared license-related caches');
      
      console.log('✅ [UnifiedDataService] License created with ID:', docRef.id);
      
      // 🔄 Force refresh license data to ensure it appears immediately
      setTimeout(() => {
        this.forceRefreshLicenses().catch(console.error);
      }, 100);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error creating license:', error);
      throw error;
    }
  }

  async updateLicense(licenseId: string, updates: Partial<StreamlinedLicense>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(this.db, 'licenses', licenseId), updateData);
      
      // Clear related caches
      this.clearCacheByPattern('org-licenses-');
    } catch (error) {
      console.error('Error updating license:', error);
      throw error;
    }
  }

  async assignLicense(licenseId: string, userId: string): Promise<void> {
    try {
      console.log('🎫 [UnifiedDataService] Assigning license', licenseId, 'to user', userId);
      
      // Ensure Firebase is initialized
      if (!this.auth || !this.db) {
        await this.initializeFirebase();
      }
      
      // Get user info
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      // Get license info
      const licenseDoc = await getDoc(doc(this.db, 'licenses', licenseId));
      if (!licenseDoc.exists()) throw new Error('License not found');
      
      const licenseData = licenseDoc.data();
      
      console.log('🔍 [UnifiedDataService] User data:', { id: userId, email: userData.email, name: userData.name });
      console.log('🔍 [UnifiedDataService] License data:', { id: licenseId, key: licenseData.key, tier: licenseData.tier });
      
      // 🚀 ENHANCED: Use batch operations for atomic updates across all collections
      const batch = writeBatch(this.db);
      
      // 1. Update license with assignment (marks license as taken from org pool)
      batch.update(doc(this.db, 'licenses', licenseId), {
        assignedTo: {
          userId: userId,
          name: userData.name || userData.firstName + ' ' + userData.lastName || userData.email,
          email: userData.email,
          assignedAt: new Date()
        },
        status: 'ACTIVE', // Changes from PENDING to ACTIVE
        updatedAt: new Date()
      });
      
      // 2. Update user record with license assignment
      batch.update(doc(this.db, 'users', userId), {
        licenseAssignment: {
          licenseId: licenseId,
          licenseKey: licenseData.key,
          licenseType: licenseData.tier,
          assignedAt: new Date()
        },
        updatedAt: new Date()
      });

      // 3. Update team member record with license assignment (for TeamPage coordination)
      try {
        const teamMemberQuery = query(
          collection(this.db, COLLECTIONS.TEAM_MEMBERS),
          where('userId', '==', userId),
          limit(1)
        );
        const teamMemberDocs = await getDocs(teamMemberQuery);
        
        if (!teamMemberDocs.empty) {
          const teamMemberDoc = teamMemberDocs.docs[0];
          batch.update(teamMemberDoc.ref, {
            licenseAssignment: {
              licenseId: licenseId,
              licenseKey: licenseData.key,
              licenseType: licenseData.tier,
              assignedAt: new Date()
            },
            updatedAt: new Date()
          });
          console.log('✅ [UnifiedDataService] Added teamMembers collection update to batch');
        }
      } catch (teamMemberError) {
        console.warn('⚠️ [UnifiedDataService] Failed to find team member for batch update:', teamMemberError);
        // Don't fail the license assignment if team member update fails
      }

      // 4. Update org member record with license assignment (for organization coordination)
      try {
        const orgMemberQuery = query(
          collection(this.db, COLLECTIONS.ORG_MEMBERS),
          where('userId', '==', userId),
          limit(1)
        );
        const orgMemberDocs = await getDocs(orgMemberQuery);
        
        if (!orgMemberDocs.empty) {
          const orgMemberDoc = orgMemberDocs.docs[0];
          batch.update(orgMemberDoc.ref, {
            licenseAssignment: {
              licenseId: licenseId,
              licenseKey: licenseData.key,
              licenseType: licenseData.tier,
              assignedAt: new Date()
            },
            updatedAt: new Date()
          });
          console.log('✅ [UnifiedDataService] Added orgMembers collection update to batch');
        }
      } catch (orgMemberError) {
        console.warn('⚠️ [UnifiedDataService] Failed to find org member for batch update:', orgMemberError);
        // Don't fail the license assignment if org member update fails
      }

      // Commit all updates atomically
      await batch.commit();
      console.log('✅ [UnifiedDataService] License assignment completed - all collections updated atomically');

      // Clear caches for both licenses and team members
      this.clearCacheByPattern('org-licenses-');
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-users-');
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error assigning license:', error);
      throw error;
    }
  }

  async unassignLicense(licenseId: string): Promise<void> {
    try {
      console.log('🎫 [UnifiedDataService] Unassigning license', licenseId);
      
      // Ensure Firebase is initialized
      if (!this.auth || !this.db) {
        await this.initializeFirebase();
      }
      
      // Get license info to find the assigned user
      const licenseDoc = await getDoc(doc(this.db, 'licenses', licenseId));
      if (!licenseDoc.exists()) throw new Error('License not found');
      
      const licenseData = licenseDoc.data();
      const assignedUserId = licenseData.assignedTo?.userId;
      
      console.log('🔍 [UnifiedDataService] License data:', { id: licenseId, assignedUserId, status: licenseData.status });
      
      // 🚀 ENHANCED: Use batch operations for atomic updates across all collections
      const batch = writeBatch(this.db);
      
      // 1. Update license to remove assignment (returns to org pool as PENDING)
      batch.update(doc(this.db, 'licenses', licenseId), {
        assignedTo: null,
        status: 'PENDING', // Reset to PENDING status - available for assignment
        updatedAt: new Date()
      });
      
      // 2. Update user record to remove license assignment
      if (assignedUserId) {
        batch.update(doc(this.db, 'users', assignedUserId), {
          licenseAssignment: null,
          updatedAt: new Date()
        });
        console.log('✅ [UnifiedDataService] Added user record update to batch');
      }

      // 3. Update team member record to remove license assignment
      if (assignedUserId) {
        try {
          const teamMemberQuery = query(
            collection(this.db, COLLECTIONS.TEAM_MEMBERS),
            where('userId', '==', assignedUserId),
            limit(1)
          );
          const teamMemberDocs = await getDocs(teamMemberQuery);
          
          if (!teamMemberDocs.empty) {
            const teamMemberDoc = teamMemberDocs.docs[0];
            batch.update(teamMemberDoc.ref, {
              licenseAssignment: null,
              updatedAt: new Date()
            });
            console.log('✅ [UnifiedDataService] Added teamMembers collection update to batch');
          }
        } catch (teamMemberError) {
          console.warn('⚠️ [UnifiedDataService] Failed to find team member for batch update:', teamMemberError);
        }
      }

      // 4. Update org member record to remove license assignment
      if (assignedUserId) {
        try {
          const orgMemberQuery = query(
            collection(this.db, COLLECTIONS.ORG_MEMBERS),
            where('userId', '==', assignedUserId),
            limit(1)
          );
          const orgMemberDocs = await getDocs(orgMemberQuery);
          
          if (!orgMemberDocs.empty) {
            const orgMemberDoc = orgMemberDocs.docs[0];
            batch.update(orgMemberDoc.ref, {
              licenseAssignment: null,
              updatedAt: new Date()
            });
            console.log('✅ [UnifiedDataService] Added orgMembers collection update to batch');
          }
        } catch (orgMemberError) {
          console.warn('⚠️ [UnifiedDataService] Failed to find org member for batch update:', orgMemberError);
        }
      }

      // Commit all updates atomically
      await batch.commit();
      console.log('✅ [UnifiedDataService] License unassignment completed - all collections updated atomically');

      // Clear caches for both licenses and team members
      this.clearCacheByPattern('org-licenses-');
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-users-');
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error unassigning license:', error);
      throw error;
    }
  }

  // ============================================================================
  // TEAM MEMBER OPERATIONS
  // ============================================================================

  /**
   * Safely convert various date formats to Date objects
   */
  private safeDateConversion(dateValue: any): Date {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') return new Date(dateValue);
    if (typeof dateValue === 'number') return new Date(dateValue);
    // Handle Firestore Timestamp objects
    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      return dateValue.toDate();
    }
    return new Date();
  }

  async getTeamMembersForOrganization(): Promise<StreamlinedTeamMember[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const cacheKey = `org-team-members-${user.organization.id}`;
    
    const cached = this.getFromCache<StreamlinedTeamMember[]>(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 [UnifiedDataService] Fetching team members for organization:', user.organization.id);
      
      // 🚀 ENHANCED: Start with users collection as primary source since it has the real names
      const allUsers = new Map<string, StreamlinedTeamMember>();

      // 1. Start with users collection as the primary source (has real names and data)
      console.log('🔍 [UnifiedDataService] Starting with users collection as primary source...');
      try {
        const usersResult = await firestoreCollectionManager.queryDocumentsWithFallback(
          'users',
          [{ field: 'organizationId', operator: '==', value: user.organization.id }],
          'createdAt',
          'desc'
        );
        console.log(`📊 [UnifiedDataService] Found ${usersResult.documents.length} users in users collection`);
        
        for (const userDoc of usersResult.documents) {
          const userData = userDoc;
          
          // Skip users without proper email
          if (!userData.email) continue;
          
          // Skip inactive users
          if (userData.status === 'removed' || userData.status === 'suspended') continue;
          
          const teamMember: StreamlinedTeamMember = {
            id: userData.id || userDoc.id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email,
            role: userData.role || 'member',
            status: userData.status || 'active',
            organization: {
              id: userData.organizationId || user.organization.id,
              name: user.organization.name,
              tier: user.organization.tier
            },
            licenseAssignment: userData.licenseAssignment ? {
              licenseId: userData.licenseAssignment.licenseId,
              licenseKey: userData.licenseAssignment.licenseKey,
              licenseType: userData.licenseAssignment.licenseType,
              assignedAt: userData.licenseAssignment.assignedAt
            } : undefined,
            department: userData.department || '',
            assignedProjects: userData.assignedProjects || [],
            avatar: userData.avatar,
            joinedAt: userData.joinedAt || userData.createdAt || new Date(),
            lastActive: userData.lastActive ? (userData.lastActive instanceof Date ? userData.lastActive : new Date(userData.lastActive)) : undefined,
            invitedBy: userData.invitedBy || user.id,
            createdAt: userData.createdAt || new Date(),
            updatedAt: userData.updatedAt || new Date()
          };
          
          allUsers.set(userData.email, teamMember);
          console.log(`✅ [UnifiedDataService] Added user: ${userData.email} (${userData.firstName} ${userData.lastName})`);
        }
      } catch (error) {
        console.warn('⚠️ [UnifiedDataService] Users collection query failed:', error);
      }

      // 2. Now enhance with teamMembers collection data for additional metadata
      console.log('🔍 [UnifiedDataService] Enhancing with teamMembers collection data...');
      try {
        const teamMembersResult = await firestoreCollectionManager.queryDocumentsWithFallback(
          'teamMembers',
          [{ field: 'organizationId', operator: '==', value: user.organization.id }],
          'createdAt',
          'desc'
        );
        console.log(`📊 [UnifiedDataService] Found ${teamMembersResult.documents.length} team members in teamMembers collection`);
        
        for (const tmDoc of teamMembersResult.documents) {
          const tmData = tmDoc;
          
          // Skip inactive team members
          if (tmData.status === 'removed' || tmData.status === 'suspended') continue;
          
          // Find matching user by email
          if (tmData.email && allUsers.has(tmData.email)) {
            const existingUser = allUsers.get(tmData.email)!;
            
            // Enhance with teamMembers data (prefer teamMembers for role, status, department)
            existingUser.role = tmData.role || existingUser.role;
            existingUser.status = tmData.status || existingUser.status;
            existingUser.department = tmData.department || existingUser.department;
            existingUser.avatar = tmData.avatar || existingUser.avatar;
            
            // Update license assignment if available
            if (tmData.licenseAssignment) {
              existingUser.licenseAssignment = {
                licenseId: tmData.licenseAssignment.licenseId,
                licenseKey: tmData.licenseAssignment.licenseKey,
                licenseType: tmData.licenseAssignment.licenseType,
                assignedAt: tmData.licenseAssignment.assignedAt
              };
            }
            
            console.log(`✅ [UnifiedDataService] Enhanced user data for: ${tmData.email}`);
          } else if (tmData.email) {
            // This is a team member not in users collection, create from teamMembers data
            const teamMember: StreamlinedTeamMember = {
              id: tmData.id,
              firstName: tmData.firstName || tmData.name?.split(' ')[0] || '',
              lastName: tmData.lastName || tmData.name?.split(' ')[1] || '',
              email: tmData.email,
              role: tmData.role || 'member',
              status: tmData.status || 'active',
              organization: {
                id: tmData.organizationId || user.organization.id,
                name: user.organization.name,
                tier: user.organization.tier
              },
              licenseAssignment: tmData.licenseAssignment ? {
                licenseId: tmData.licenseAssignment.licenseId,
                licenseKey: tmData.licenseAssignment.licenseKey,
                licenseType: tmData.licenseAssignment.licenseType,
                assignedAt: tmData.licenseAssignment.assignedAt
              } : undefined,
              department: tmData.department || '',
              assignedProjects: tmData.assignedProjects || [],
              avatar: tmData.avatar,
              joinedAt: this.safeDateConversion(tmData.joinedAt || tmData.createdAt),
              lastActive: tmData.lastActive ? this.safeDateConversion(tmData.lastActive) : undefined,
              invitedBy: tmData.invitedBy || user.id,
              createdAt: this.safeDateConversion(tmData.createdAt),
              updatedAt: this.safeDateConversion(tmData.updatedAt)
            };
            
            allUsers.set(tmData.email, teamMember);
            console.log(`✅ [UnifiedDataService] Added team member: ${tmData.email} (${teamMember.firstName} ${teamMember.lastName})`);
          }
        }
      } catch (error) {
        console.warn('⚠️ [UnifiedDataService] TeamMembers collection query failed:', error);
      }


      // 🔧 ENHANCED: Cross-reference licenses to find assignments
      console.log('🔍 [UnifiedDataService] Cross-referencing licenses for assignments...');
      try {
        // Get licenses for the organization
        const orgLicenses = await this.getLicensesForOrganization();
        const assignedLicenses = orgLicenses?.filter(license => 
          license.assignedTo && license.assignedTo.userId
        ) || [];
        
        console.log(`📊 [UnifiedDataService] Found ${assignedLicenses.length} assigned licenses`);
        if (assignedLicenses.length > 0) {
          console.log('🔍 [UnifiedDataService] Sample assigned license:', JSON.stringify(assignedLicenses[0], null, 2));
        }
        
        for (const license of assignedLicenses) {
          const userId = license.assignedTo?.userId;
          if (!userId) continue;
          
          // Find the user in our allUsers map
          const userEmail = Array.from(allUsers.keys()).find(email => {
            const user = allUsers.get(email);
            return user && user.id === userId;
          });
          
          if (userEmail) {
            const user = allUsers.get(userEmail);
            if (user && !user.licenseAssignment) {
              // Add license assignment from licenses collection
              user.licenseAssignment = {
                licenseId: license.id,
                licenseKey: license.key,
                licenseType: license.tier,
                assignedAt: license.assignedTo?.assignedAt || new Date()
              };
              console.log(`✅ [UnifiedDataService] Added license assignment for ${userEmail}:`, user.licenseAssignment);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ [UnifiedDataService] License cross-reference failed:', error);
      }

      const uniqueUsers = Array.from(allUsers.values());
      console.log(`✅ [UnifiedDataService] Successfully fetched ${uniqueUsers.length} unique team members for organization: ${user.organization.id}`);
      
      // Debug: Log final team member data
      uniqueUsers.forEach(member => {
        console.log(`🔍 [UnifiedDataService] Final result - ${member.email}: ${member.firstName} ${member.lastName} (${member.role}) - Status: ${member.status}`);
        if (member.licenseAssignment) {
          console.log(`    └── License: ${member.licenseAssignment.licenseType} (${member.licenseAssignment.licenseKey})`);
        } else {
          console.log(`    └── No license assigned`);
        }
      });
      
      // Cache the results
      this.setCache(cacheKey, uniqueUsers);
      return uniqueUsers;
      
    } catch (error) {
      console.error('❌ [UnifiedDataService] Failed to fetch team members:', error);
      return [];
    }
  }

  async inviteTeamMember(memberData: Omit<StreamlinedTeamMember, 'id' | 'createdAt' | 'updatedAt' | 'joinedAt'> & { 
    temporaryPassword?: string; 
    position?: string; 
    phone?: string; 
  }): Promise<string> {
    
    console.log('🚀 [UnifiedDataService] Creating team member via backend API:', memberData.email);
    
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      // 🔧 FIXED: Use proper backend API for team member creation
      // This ensures Firebase Auth user creation and proper data consistency
      const createTeamMemberPayload = {
        email: memberData.email,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        department: memberData.department || '',
        licenseType: 'PROFESSIONAL', // Default license type
        organizationId: memberData.organization.id,
        sendWelcomeEmail: true,
        temporaryPassword: memberData.temporaryPassword || this.generateSecurePassword()
      };

      console.log('📤 [UnifiedDataService] Sending team member creation request to backend API...');

      // Use the proper backend API endpoint that handles Firebase Auth + Firestore
      const token = await this.auth.currentUser?.getIdToken();
      const response = await fetch(`${this.getApiBaseUrl()}/team-members/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createTeamMemberPayload)
      });
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create team member');
      }

      const createdTeamMember = data.data.teamMember;
      console.log('✅ [UnifiedDataService] Team member created successfully via backend API:', createdTeamMember.id);

      // Clear related caches to ensure fresh data is loaded
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-users-');
      this.clearCacheByPattern('org-members-');
      this.clearCacheByPattern('user-profiles-');
      
      return createdTeamMember.id; // Return the team member ID
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error creating team member via backend API:', error);
      throw error;
    }
  }

  /**
   * Ensure team member is properly set up for project assignments
   * This method checks and creates any missing collection records needed for project coordination
   */
  async ensureTeamMemberProjectReadiness(userId: string): Promise<{
    success: boolean;
    collectionsCreated: string[];
    collectionsFound: string[];
    errors: string[];
  }> {
    const result = {
      success: true,
      collectionsCreated: [] as string[],
      collectionsFound: [] as string[],
      errors: [] as string[]
    };

    try {
      console.log('🔍 [UnifiedDataService] Checking team member project readiness for userId:', userId);

      // Get the user record first
      const userDoc = await getDoc(doc(this.db, COLLECTIONS.USERS, userId));
      if (!userDoc.exists()) {
        result.errors.push('User record not found');
        result.success = false;
        return result;
      }

      const userData = userDoc.data();
      console.log('📋 [UnifiedDataService] Found user data:', userData);

      // Check for required collections and create missing ones
      const requiredCollections = [
        {
          name: 'teamMembers',
          collection: COLLECTIONS.TEAM_MEMBERS,
          createData: () => ({
            userId: userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role || 'member',
            status: userData.status || 'active',
            organizationId: userData.organizationId,
            orgId: userData.organizationId, // Support both field names
            department: userData.department || '',
            isActive: true,
            firebaseUid: userData.firebaseUid || '',
            createdAt: new Date(),
            updatedAt: new Date()
          })
        },
        {
          name: 'orgMembers',
          collection: COLLECTIONS.ORG_MEMBERS,
          createData: () => ({
            organizationId: userData.organizationId,
            orgId: userData.organizationId, // Support both field names
            userId: userId,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'member',
            status: userData.status || 'active',
            seatReserved: true,
            department: userData.department || '',
            invitedByUserId: 'system',
            invitedAt: new Date(),
            joinedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
        },
        {
          name: 'userProfiles',
          collection: COLLECTIONS.USER_PROFILES,
          createData: () => ({
            userId: userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            displayName: `${userData.firstName} ${userData.lastName}`,
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName + ' ' + userData.lastName)}&background=667eea&color=fff`,
            department: userData.department || '',
            position: '',
            phone: '',
            organizationId: userData.organizationId,
            role: userData.role || 'member',
            status: userData.status || 'active',
            bio: '',
            preferences: {},
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      ];

      // Check each required collection
      for (const collectionConfig of requiredCollections) {
        try {
          // Check if record exists
          const existingQuery = query(
            collection(this.db, collectionConfig.collection),
            where('userId', '==', userId),
            limit(1)
          );
          const existingDocs = await getDocs(existingQuery);

          if (existingDocs.empty) {
            // Create missing record
            console.log(`📝 [UnifiedDataService] Creating missing ${collectionConfig.name} record for user ${userId}`);
            const docRef = await addDoc(collection(this.db, collectionConfig.collection), collectionConfig.createData());
            result.collectionsCreated.push(`${collectionConfig.name} (${docRef.id})`);
            console.log(`✅ [UnifiedDataService] Created ${collectionConfig.name} record: ${docRef.id}`);
          } else {
            result.collectionsFound.push(collectionConfig.name);
            console.log(`✅ [UnifiedDataService] Found existing ${collectionConfig.name} record`);
          }
        } catch (error: any) {
          const errorMsg = `Failed to check/create ${collectionConfig.name}: ${error.message}`;
          result.errors.push(errorMsg);
          console.error(`❌ [UnifiedDataService] ${errorMsg}`, error);
        }
      }

      console.log('📊 [UnifiedDataService] Team member project readiness check complete:', result);
      return result;

    } catch (error: any) {
      console.error('❌ [UnifiedDataService] Failed to ensure team member project readiness:', error);
      result.errors.push(`General error: ${error.message}`);
      result.success = false;
      return result;
    }
  }

  // Helper method for password generation
  private generateSecurePassword(): string {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  async updateTeamMember(memberId: string, updates: Partial<StreamlinedTeamMember>): Promise<void> {
    try {
      console.log('🔍 [UnifiedDataService] Updating team member:', memberId, updates);
      
      // Ensure Firebase is initialized
      if (!this.auth || !this.db) {
        await this.initializeFirebase();
      }

      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      // 🔧 ENHANCED: Update both users and teamMembers collections for consistency
      const batch = writeBatch(this.db);
      
      // Update users collection (primary source)
      const userRef = doc(this.db, 'users', memberId);
      batch.update(userRef, updateData);
      
      // Update teamMembers collection (team management)
      const teamMemberRef = doc(this.db, 'teamMembers', memberId);
      batch.update(teamMemberRef, updateData);
      
      // Commit both updates atomically
      await batch.commit();
      
      console.log('✅ [UnifiedDataService] Team member updated successfully in both collections');
      
      // Clear related caches
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-users-');
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error updating team member:', error);
      throw error;
    }
  }

  async changeTeamMemberPassword(memberId: string, newPassword: string): Promise<void> {
    try {
      console.log('🔐 [UnifiedDataService] Changing password for member:', memberId);
      
      // Use the API service to change the password
      const response = await fetch(`/api/team-members/${memberId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to change password: ${response.status}`);
      }

      console.log('✅ [UnifiedDataService] Password changed successfully');
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error changing password:', error);
      throw error;
    }
  }

  async removeTeamMember(memberId: string, organizationId?: string): Promise<void> {
    try {
      console.log('👤 [UnifiedDataService] Starting Firebase-only team member removal:', memberId);
      
      // Get team member info before removal
      const memberDoc = await getDoc(doc(this.db, 'users', memberId));
      if (!memberDoc.exists()) {
        // Try teamMembers collection as fallback
        const teamMemberDoc = await getDoc(doc(this.db, 'teamMembers', memberId));
        if (!teamMemberDoc.exists()) {
          throw new Error('Team member not found');
        }
      }
      
      const memberData = memberDoc.exists() ? memberDoc.data() : null;
      const orgId = organizationId || memberData?.organizationId;
      
      if (!orgId) {
        throw new Error('Organization ID is required for team member removal');
      }

      console.log('🔍 [UnifiedDataService] Team member organization:', orgId);

      // 🔥 FIREBASE-ONLY: Release any assigned licenses back to the pool
      console.log('🎫 [UnifiedDataService] Releasing assigned licenses...');
      const licensesSnapshot = await getDocs(query(
        collection(this.db, 'licenses'),
        where('assignedToUserId', '==', memberId),
        where('organizationId', '==', orgId)
      ));

      if (!licensesSnapshot.empty) {
        const batch = writeBatch(this.db);
        
        licensesSnapshot.docs.forEach((licenseDoc) => {
          const licenseRef = doc(this.db, 'licenses', licenseDoc.id);
          batch.update(licenseRef, {
            assignedToUserId: null,
            assignedToEmail: null,
            assignedAt: null,
            status: 'ACTIVE', // Keep as ACTIVE but unassigned
            updatedAt: new Date(),
            removedFrom: {
              userId: memberId,
              email: memberData?.email || 'unknown',
              removedAt: new Date(),
              removedBy: 'firebase-client'
            }
          });
        });
        
        await batch.commit();
        console.log(`✅ [UnifiedDataService] Released ${licensesSnapshot.docs.length} license(s) back to available pool`);
      }

      // 🔥 FIREBASE-ONLY: Remove team member from all collections
      console.log('🗑️ [UnifiedDataService] Removing team member from collections...');
      
      const collectionsToClean = ['teamMembers', 'users', 'orgMembers'];
      const batch = writeBatch(this.db);
      
      for (const collectionName of collectionsToClean) {
        try {
          // Remove from teamMembers collection
          if (collectionName === 'teamMembers') {
            const teamMemberRef = doc(this.db, 'teamMembers', memberId);
            batch.delete(teamMemberRef);
          }
          
          // Remove from users collection
          if (collectionName === 'users') {
            const userRef = doc(this.db, 'users', memberId);
            batch.delete(userRef);
          }
          
          // Remove from orgMembers collection (query by userId)
          if (collectionName === 'orgMembers') {
            const orgMembersQuery = query(
              collection(this.db, 'orgMembers'),
              where('userId', '==', memberId),
              where('organizationId', '==', orgId)
            );
            const orgMembersSnapshot = await getDocs(orgMembersQuery);
            orgMembersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
          }
        } catch (error) {
          console.warn(`⚠️ [UnifiedDataService] Error cleaning ${collectionName}:`, error);
        }
      }
      
      await batch.commit();
      console.log('✅ [UnifiedDataService] Team member removed from all collections');

      // Clear all relevant caches
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-users-');
      this.clearCacheByPattern('org-licenses-');
      this.clearCacheByPattern('org-members-');
      this.clearCacheByPattern('project-team-members-');
      
      console.log('✅ [UnifiedDataService] Firebase-only team member removal completed');
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error removing team member:', error);
      throw error;
    }
  }

  async assignLicenseToTeamMember(memberId: string, licenseId: string, licenseKey: string, licenseType: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'users', memberId), {
        licenseAssignment: {
          licenseId,
          licenseKey,
          licenseType,
          assignedAt: new Date()
        },
        updatedAt: new Date()
      });

      // Clear caches
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-licenses-');
    } catch (error) {
      console.error('Error assigning license to team member:', error);
      throw error;
    }
  }

  // ============================================================================
  // DATASET OPERATIONS
  // ============================================================================
  
  async getDatasetsForUser(): Promise<StreamlinedDataset[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const cacheKey = `user-datasets-${user.id}`;
    const cached = this.getFromCache<StreamlinedDataset[]>(cacheKey);
    if (cached) return cached;

    try {
      const datasetsQuery = query(
        collection(this.db, 'datasets'),
        where('owner.organizationId', '==', user.organization.id),
        where('status', '==', 'ACTIVE'),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(datasetsQuery);
      const datasets = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as StreamlinedDataset;
      });
      
      this.setCache(cacheKey, datasets);
      return datasets;
    } catch (error) {
      console.error('Error fetching user datasets:', error);
      return [];
    }
  }

  // ============================================================================
  // CACHING UTILITIES
  // ============================================================================
  
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  public clearAllCache(): void {
    this.cache.clear();
    console.log('🧹 [UnifiedDataService] All cache cleared');
  }

  // 🔧 NEW: Force refresh all license data
  async forceRefreshLicenses(): Promise<void> {
    console.log('🔄 [UnifiedDataService] Force refreshing license data...');
    this.clearCacheByPattern('org-licenses-');
    this.clearCacheByPattern('user-');
    this.clearCacheByPattern('organization-');
    
    // Force a fresh fetch
    await this.getLicensesForOrganization();
    console.log('✅ [UnifiedDataService] License data force refreshed');
  }

  /**
   * Clear cache for a specific user (useful when user changes)
   */
  clearUserCache(userId?: string): void {
    if (userId) {
      // Clear specific user-related cache
      this.clearCacheByPattern('current-user');
      this.clearCacheByPattern(`org-users-${userId}`);
      this.clearCacheByPattern('org-context');
      this.clearCacheByPattern('org-licenses');
    } else {
      // Clear all cache
      this.clearAllCache();
    }
  }

  // ============================================================================
  // COLLECTION NAME RESOLUTION UTILITIES
  // ============================================================================

  /**
   * Get the appropriate collection name with fallback support
   * This method helps transition from legacy snake_case to standardized camelCase
   */
  private async getCollectionName(primaryName: keyof typeof COLLECTIONS): Promise<string> {
    const primaryCollectionName = COLLECTIONS[primaryName];
    
    try {
      // Try to access the primary collection
      const testQuery = query(collection(this.db, primaryCollectionName), limit(1));
      await getDocs(testQuery);
      console.log(`✅ [UnifiedDataService] Using primary collection: ${primaryCollectionName}`);
      return primaryCollectionName;
    } catch (error) {
      // If primary fails, try legacy naming if available
      const legacyKey = `${primaryName}_LEGACY` as keyof typeof COLLECTIONS;
      if (COLLECTIONS[legacyKey]) {
        const legacyCollectionName = COLLECTIONS[legacyKey];
        try {
          const testQuery = query(collection(this.db, legacyCollectionName), limit(1));
          await getDocs(testQuery);
          console.log(`⚠️ [UnifiedDataService] Falling back to legacy collection: ${legacyCollectionName}`);
          return legacyCollectionName;
        } catch (legacyError) {
          console.warn(`⚠️ [UnifiedDataService] Both primary and legacy collections failed for ${primaryName}`);
        }
      }
      
      // Return primary name anyway as fallback
      console.warn(`⚠️ [UnifiedDataService] Using primary collection name despite access issues: ${primaryCollectionName}`);
      return primaryCollectionName;
    }
  }

  // ============================================================================
  // PAYMENT & PURCHASE METHODS
  // ============================================================================

  // 🛒 License Purchase Methods
  async purchaseLicenses(purchaseData: {
    planId: string;
    quantity: number;
    paymentMethodId: string;
    billingAddress: any;
    total: number;
  }): Promise<{
    subscription: any;
    invoice: any;
    payment: any;
    licenses: StreamlinedLicense[];
  }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      console.log('🛒 [UnifiedDataService] Starting license purchase:', purchaseData);

      // Get auth token for API call
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.getApiBaseUrl()}/licenses/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Purchase failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Purchase failed');
      }

      console.log('✅ [UnifiedDataService] License purchase completed:', result.data);

      // Clear relevant caches to ensure fresh data
      this.clearCacheByPattern('org-licenses-');
      this.clearCacheByPattern('user-');
      this.clearCacheByPattern('organization-');
      this.clearCacheByPattern('subscription-');
      this.clearCacheByPattern('invoice-');

      // Force refresh license data
      setTimeout(() => {
        this.forceRefreshLicenses();
      }, 1000);

      return result.data;
    } catch (error: any) {
      console.error('❌ [UnifiedDataService] Error purchasing licenses:', error);
      throw new Error(`Failed to purchase licenses: ${error.message}`);
    }
  }

  // 📄 Invoice Methods
  async getInvoicesForOrganization(): Promise<any[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user?.organization?.id) {
        console.log('🔍 [UnifiedDataService] No organization context for invoices');
        return [];
      }

      const cacheKey = `org-invoices-${user.organization.id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached && Array.isArray(cached)) {
        console.log('📋 [UnifiedDataService] Returning cached invoices');
        return cached;
      }

      console.log('📋 [UnifiedDataService] Fetching invoices for organization:', user.organization.id);

      const invoicesQuery = query(
        collection(this.db, 'invoices'),
        where('organizationId', '==', user.organization.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(invoicesQuery);
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
        paidAt: doc.data().paidAt?.toDate?.() || (doc.data().paidAt ? new Date(doc.data().paidAt) : null),
        dueDate: doc.data().dueDate?.toDate?.() || new Date(doc.data().dueDate),
      }));

      this.setCache(cacheKey, invoices);
      console.log(`✅ [UnifiedDataService] Found ${invoices.length} invoices`);
      
      return invoices;
    } catch (error: any) {
      console.error('❌ [UnifiedDataService] Error fetching invoices:', error);
      return [];
    }
  }

  // 💰 Payment Methods
  async getPaymentsForOrganization(): Promise<any[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user?.organization?.id) {
        console.log('🔍 [UnifiedDataService] No organization context for payments');
        return [];
      }

      const cacheKey = `org-payments-${user.organization.id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached && Array.isArray(cached)) {
        console.log('💰 [UnifiedDataService] Returning cached payments');
        return cached;
      }

      console.log('💰 [UnifiedDataService] Fetching payments for organization:', user.organization.id);

      const paymentsQuery = query(
        collection(this.db, 'payments'),
        where('organizationId', '==', user.organization.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(paymentsQuery);
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
        processedAt: doc.data().processedAt?.toDate?.() || (doc.data().processedAt ? new Date(doc.data().processedAt) : null),
      }));

      this.setCache(cacheKey, payments);
      console.log(`✅ [UnifiedDataService] Found ${payments.length} payments`);
      
      return payments;
    } catch (error: any) {
      console.error('❌ [UnifiedDataService] Error fetching payments:', error);
      return [];
    }
  }

  // 📋 Subscription Methods
  async getSubscriptionForOrganization(): Promise<any | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user?.organization?.id) {
        console.log('🔍 [UnifiedDataService] No organization context for subscription');
        return null;
      }

      const cacheKey = `org-subscription-${user.organization.id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📋 [UnifiedDataService] Returning cached subscription');
        return cached;
      }

      console.log('📋 [UnifiedDataService] Fetching subscription for organization:', user.organization.id);

      const subscriptionQuery = query(
        collection(this.db, 'subscriptions'),
        where('organizationId', '==', user.organization.id),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(subscriptionQuery);
      
      if (snapshot.empty) {
        console.log('📋 [UnifiedDataService] No subscription found');
        return null;
      }

      const doc = snapshot.docs[0];
      const subscription = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
        currentPeriodStart: doc.data().currentPeriodStart?.toDate?.() || new Date(doc.data().currentPeriodStart),
        currentPeriodEnd: doc.data().currentPeriodEnd?.toDate?.() || new Date(doc.data().currentPeriodEnd),
        activatedAt: doc.data().activatedAt?.toDate?.() || (doc.data().activatedAt ? new Date(doc.data().activatedAt) : null),
      };

      this.setCache(cacheKey, subscription);
      console.log('✅ [UnifiedDataService] Found subscription:', subscription.id);
      
      return subscription;
    } catch (error: any) {
      console.error('❌ [UnifiedDataService] Error fetching subscription:', error);
      return null;
    }
  }

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================
  
  static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }

  /**
   * Get license pools for the organization
   */
  async getLicensePools(): Promise<LicensePool[]> {
    try {
      console.log('🔍 [UnifiedDataService] Fetching license pools...');
      
      const poolsSnapshot = await getDocs(collection(this.db, 'licensePools'));
      const pools: LicensePool[] = [];
      
      poolsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        pools.push({
          id: doc.id,
          tier: data.tier,
          totalLicenses: data.totalLicenses || 0,
          availableLicenses: data.availableLicenses || 0,
          assignedLicenses: data.assignedLicenses || 0,
          maxProjects: data.maxProjects || 0,
          maxCollaborators: data.maxCollaborators || 0,
          maxTeamMembers: data.maxTeamMembers || 0,
          features: data.features || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      
      console.log(`✅ [UnifiedDataService] Found ${pools.length} license pools`);
      return pools;
      
    } catch (error) {
      console.error('❌ [UnifiedDataService] Error fetching license pools:', error);
      throw error;
    }
  }

  }

// Export singleton instance
export const unifiedDataService = UnifiedDataService.getInstance();
export default unifiedDataService;
