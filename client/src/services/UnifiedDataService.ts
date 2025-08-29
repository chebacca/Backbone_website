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
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';

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
  role: 'admin' | 'member' | 'viewer' | 'owner' | 'manager';
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
  assignedProjects: string[];
  
  // Metadata
  avatar?: string;
  joinedAt: Date;
  lastActive?: Date;
  invitedBy?: string;
  createdAt: Date;
  updatedAt: Date;
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
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate()
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
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastAccessedAt: data.lastAccessedAt?.toDate() || new Date()
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
      
      // Create team assignment
      const teamAssignment = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role,
        assignedAt: new Date(),
        assignedBy: currentUser?.email || 'system'
      };

      // Update project with new team assignment
      await updateDoc(doc(this.db, 'projects', projectId), {
        teamAssignments: arrayUnion(teamAssignment),
        updatedAt: new Date()
      });

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

    const cacheKey = `org-licenses-${user.organization.id}`;
    const cached = this.getFromCache<StreamlinedLicense[]>(cacheKey);
    if (cached) return cached;

    try {
      // Query licenses by organizationId to match actual data structure
      const licensesQuery = query(
        collection(this.db, 'licenses'),
        where('organizationId', '==', user.organization.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(licensesQuery);
      const licenses = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Map the actual seeded data structure to StreamlinedLicense interface
        return {
          id: doc.id,
          key: data.key || '',
          name: data.name || `License ${doc.id}`,
          tier: data.tier || 'BASIC',
          status: data.status || 'PENDING',
          
          // Map organization data from top-level organizationId
          organization: {
            id: data.organizationId || '',
            name: data.organizationName || 'Unknown Organization',
            tier: data.tier || 'BASIC'
          },
          
          // Map assignment data if exists
          assignedTo: data.userId ? {
            userId: data.userId,
            name: data.userName || data.userEmail || 'Unknown User',
            email: data.userEmail || '',
            assignedAt: data.activatedAt?.toDate() || new Date()
          } : undefined,
          
          // Map usage data
          usage: {
            apiCalls: data.usageCount || 0,
            dataTransfer: 0, // Not in seeded data
            deviceCount: 1, // Default
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

      const newLicense: Omit<StreamlinedLicense, 'id'> = {
        ...licenseData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, 'licenses'), newLicense);
      
      // Clear related caches
      this.clearCacheByPattern('org-licenses-');
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating license:', error);
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
      // Get user info
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      if (!userDoc.exists()) throw new Error('User not found');
      
      const userData = userDoc.data();
      
      // Update license with assignment
      await updateDoc(doc(this.db, 'licenses', licenseId), {
        assignedTo: {
          userId: userId,
          name: userData.name || userData.email,
          email: userData.email,
          assignedAt: new Date()
        },
        status: 'ACTIVE',
        updatedAt: new Date()
      });

      // Clear caches
      this.clearCacheByPattern('org-licenses-');
    } catch (error) {
      console.error('Error assigning license:', error);
      throw error;
    }
  }

  async unassignLicense(licenseId: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'licenses', licenseId), {
        assignedTo: null,
        updatedAt: new Date()
      });

      // Clear caches
      this.clearCacheByPattern('org-licenses-');
    } catch (error) {
      console.error('Error unassigning license:', error);
      throw error;
    }
  }

  // ============================================================================
  // TEAM MEMBER OPERATIONS
  // ============================================================================
  
  async getTeamMembersForOrganization(): Promise<StreamlinedTeamMember[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const cacheKey = `org-team-members-${user.organization.id}`;
    const cached = this.getFromCache<StreamlinedTeamMember[]>(cacheKey);
    if (cached) return cached;

    try {
      // Query team members by organizationId to match actual data structure
      const teamQuery = query(
        collection(this.db, 'teamMembers'),
        where('organizationId', '==', user.organization.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(teamQuery);
      const teamMembers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          joinedAt: data.joinedAt?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate(),
          licenseAssignment: data.licenseAssignment ? {
            ...data.licenseAssignment,
            assignedAt: data.licenseAssignment.assignedAt?.toDate() || new Date()
          } : undefined
        } as StreamlinedTeamMember;
      });
      
      this.setCache(cacheKey, teamMembers);
      return teamMembers;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  async inviteTeamMember(memberData: Omit<StreamlinedTeamMember, 'id' | 'createdAt' | 'updatedAt' | 'joinedAt'>): Promise<string> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      const newMember: Omit<StreamlinedTeamMember, 'id'> = {
        ...memberData,
        status: 'pending',
        invitedBy: user.email,
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, 'team_members'), newMember);
      
      // Clear related caches
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-users-');
      
      return docRef.id;
    } catch (error) {
      console.error('Error inviting team member:', error);
      throw error;
    }
  }

  async updateTeamMember(memberId: string, updates: Partial<StreamlinedTeamMember>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(doc(this.db, 'team_members', memberId), updateData);
      
      // Clear related caches
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-users-');
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  }

  async removeTeamMember(memberId: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'team_members', memberId), {
        status: 'removed',
        updatedAt: new Date()
      });

      // Clear caches
      this.clearCacheByPattern('org-team-members-');
      this.clearCacheByPattern('org-users-');
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  async assignLicenseToTeamMember(memberId: string, licenseId: string, licenseKey: string, licenseType: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'team_members', memberId), {
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
  // SINGLETON PATTERN
  // ============================================================================
  
  static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }
}

// Export singleton instance
export const unifiedDataService = UnifiedDataService.getInstance();
export default unifiedDataService;
