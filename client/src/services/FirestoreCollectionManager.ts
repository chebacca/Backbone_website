/**
 * Firestore Collection Manager
 * 
 * Centralized management of all Firestore collections and their schemas
 * for webonly production mode with hybrid local/webonly storage capability.
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
  limit as limit,
  writeBatch,
  onSnapshot,
  Timestamp,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Collection Names - Centralized definition with standardized camelCase
export const COLLECTIONS = {
  // Core User Management
  USERS: 'users',
  USER_PROFILES: 'userProfiles',
  USER_SETTINGS: 'userSettings', // Standardized from 'user_settingss'
  USER_SETTINGS_LEGACY: 'user_settingss', // Legacy with typo preserved
  USER_TIME_CARDS: 'userTimeCards', // Standardized from 'user_time_cards'
  USER_TIME_CARDS_LEGACY: 'user_time_cards', // Legacy collection
  
  // Organization & Team Management - STANDARDIZED TO CAMELCASE
  ORGANIZATIONS: 'organizations',
  ORG_MEMBERS: 'orgMembers', // STANDARDIZED from 'org_members'
  ORG_MEMBERS_LEGACY: 'org_members', // Legacy snake_case collection
  TEAM_MEMBERS: 'teamMembers', // Already camelCase
  TEAM_MEMBERS_LEGACY: 'team_members', // Legacy snake_case collection
  
  // Project Management - STANDARDIZED TO CAMELCASE
  PROJECTS: 'projects',
  PROJECT_TEAM_MEMBERS: 'projectTeamMembers', // STANDARDIZED from 'project_team_members'
  PROJECT_TEAM_MEMBERS_LEGACY: 'project_team_members', // Legacy snake_case collection
  PROJECT_PARTICIPANTS: 'projectParticipants', // Standardized from 'project_participants'
  PROJECT_PARTICIPANTS_LEGACY: 'project_participants', // Legacy collection
  DATASETS: 'datasets',
  
  // Licensing & Payments
  LICENSES: 'licenses',
  SUBSCRIPTIONS: 'subscriptions',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  INVOICE_PAYMENTS: 'invoice_payments',
  
  // Activity & Monitoring
  ACTIVITIES: 'activities',
  AUDIT_LOG: 'audit_log',
  AUDIT_LOGS: 'auditLogs', // Alternative naming
  SESSIONS: 'sessions',
  USAGE_ANALYTICS: 'usage_analytics',
  
  // System & Configuration
  SYSTEM_SETTINGS: 'systemSettings',
  SDK_VERSIONS: 'sdkVersions',
  WEBHOOK_EVENTS: 'webhookEvents',
  WEBHOOK_EVENTS_ALT: 'webhook_events',
  
  // Communication & Notifications
  NOTIFICATIONS: 'notifications',
  PRIVACY_CONSENTS: 'privacy_consents',
  
  // Delivery & Logging
  LICENSE_DELIVERY_LOGS: 'license_delivery_logs',
  
  // Workflow & Diagrams
  WORKFLOW_DIAGRAMS: 'workflowDiagrams', // Standardized from 'workflow_diagrams'
  WORKFLOW_DIAGRAMS_LEGACY: 'workflow_diagrams', // Legacy collection
  
  // Network Delivery & Deliverables Collections
  NETWORK_DELIVERY_BIBLES: 'networkDeliveryBibles',
  DELIVERABLES: 'deliverables',
  NETWORK_DELIVERY_CHATS: 'networkDeliveryChats',
  DELIVERY_SPECS: 'deliverySpecs',
  DELIVERY_TEMPLATES: 'deliveryTemplates',
  DELIVERY_TRACKING: 'deliveryTracking',
  
  // Additional Production Collections
  SESSION_WORKFLOWS: 'sessionWorkflows',
  SESSION_ASSIGNMENTS: 'sessionAssignments',
  SESSION_PARTICIPANTS: 'sessionParticipants',
  WORKFLOW_TEMPLATES: 'workflowTemplates',
  WORKFLOW_INSTANCES: 'workflowInstances',
  WORKFLOW_STEPS: 'workflowSteps',
  WORKFLOW_ASSIGNMENTS: 'workflowAssignments',
  SESSION_PHASE_TRANSITIONS: 'sessionPhaseTransitions',
  SESSION_REVIEWS: 'sessionReviews',
  SESSION_QC: 'sessionQc',
  SESSION_TASKS: 'sessionTasks',
  DEMO_SESSIONS: 'demoSessions',
  
  // Inventory & Equipment Collections
  INVENTORY_ITEMS: 'inventoryItems',
  INVENTORY: 'inventory',
  NETWORK_IP_ASSIGNMENTS: 'networkIPAssignments',
  NETWORK_IP_RANGES: 'networkIPRanges',
  NETWORKS: 'networks',
  INVENTORY_HISTORY: 'inventoryHistory',
  SETUP_PROFILES: 'setupProfiles',
  SCHEMAS: 'schemas',
  SCHEMA_FIELDS: 'schemaFields',
  MAP_LAYOUTS: 'mapLayouts',
  MAP_LOCATIONS: 'mapLocations',
  INVENTORY_MAPS: 'inventoryMaps',
  MAP_DATA: 'mapData',
  
  // Timecard Collections
  TIMECARD_ENTRIES: 'timecard_entries',
  USER_TIMECARDS: 'user_timecards',
  TIMECARD_APPROVALS: 'timecard_approvals',
  TIMECARD_TEMPLATES: 'timecard_templates',
  
  // Media & Content Collections
  MEDIA_FILES: 'mediaFiles',
  POST_PRODUCTION_TASKS: 'postProductionTasks',
  STAGES: 'stages',
  NOTES: 'notes',
  REPORTS: 'reports',
  CALL_SHEETS: 'callSheets',
  
  // AI & Automation Collections
  AI_AGENTS: 'aiAgents',
  MESSAGES: 'messages',
  CHATS: 'chats',
  MESSAGE_SESSIONS: 'messageSessions',
  
  // PBM Collections
  PBM_PROJECTS: 'pbmProjects',
  PBM_SCHEDULES: 'pbmSchedules',
  PBM_PAYSCALES: 'pbmPayscales',
  PBM_DAILY_STATUS: 'pbmDailyStatus'
} as const;

// Collection mapping for transition period - handles both camelCase and snake_case
export const COLLECTION_MAPPINGS = {
  // Primary collections (camelCase) with fallback to legacy (snake_case)
  orgMembers: ['orgMembers', 'org_members'],
  teamMembers: ['teamMembers', 'team_members'], 
  projectTeamMembers: ['projectTeamMembers', 'project_team_members'],
  projectParticipants: ['projectParticipants', 'project_participants'],
  userSettings: ['userSettings', 'user_settingss'], // Note: legacy has typo
  userTimeCards: ['userTimeCards', 'user_time_cards'],
  workflowDiagrams: ['workflowDiagrams', 'workflow_diagrams'],
  auditLogs: ['auditLogs', 'audit_log'],
  webhookEvents: ['webhookEvents', 'webhook_events'],
  usageAnalytics: ['usageAnalytics', 'usage_analytics'],
  privacyConsents: ['privacyConsents', 'privacy_consents'],
  licenseDeliveryLogs: ['licenseDeliveryLogs', 'license_delivery_logs']
} as const;

// Type definitions for collection documents
export interface FirestoreUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user' | 'owner';
  organizationId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  lastActive?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FirestoreOrganization {
  id: string;
  name: string;
  ownerUserId: string;
  tier?: 'PRO' | 'ENTERPRISE';
  status?: 'active' | 'suspended';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FirestoreProject {
  id: string;
  name: string;
  description?: string;
  type: string;
  applicationMode: string;
  visibility: 'private' | 'organization' | 'public';
  storageBackend: 'firestore' | 'gcs' | 's3' | 'local' | 'azure-blob';
  ownerId: string;
  organizationId?: string;
  status?: 'active' | 'archived' | 'deleted';
  isActive: boolean;
  isArchived?: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastAccessedAt?: Timestamp | Date;
}

export interface FirestoreLicense {
  id: string;
  key: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING' | 'REVOKED';
  userId?: string;
  subscriptionId?: string;
  organizationId?: string;
  assignedToUserId?: string;
  assignedToEmail?: string;
  activatedAt?: Timestamp | Date;
  expiresAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  maxActivations?: number;
  activationCount?: number;
  currentPeriodEnd?: Timestamp | Date;
  type?: string;
}

// Network Delivery & Deliverables Types
export interface FirestoreDeliveryBible {
  id: string;
  organizationId: string;
  projectId?: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  uploadedAt: Timestamp | Date;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FirestoreDeliverable {
  id: string;
  bibleId: string;
  organizationId: string;
  projectId?: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  relatedSessions?: string[];
  relatedMedia?: string[];
  gaps?: string[];
  recommendations?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FirestoreNetworkDeliveryChat {
  id: string;
  organizationId: string;
  projectId?: string;
  deliverableId?: string;
  messages: Array<{
    id: string;
    type: 'user' | 'bot' | 'system';
    content: string;
    timestamp: Timestamp | Date;
    metadata?: Record<string, any>;
  }>;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FirestoreDeliverySpec {
  id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  description: string;
  specifications: Record<string, any>;
  category: string;
  isTemplate: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FirestoreDeliveryTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  template: Record<string, any>;
  category: string;
  isActive: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FirestoreDeliveryTracking {
  id: string;
  organizationId: string;
  projectId?: string;
  deliverableId: string;
  status: string;
  progress: number; // 0-100
  milestones: Array<{
    name: string;
    completed: boolean;
    completedAt?: Timestamp | Date;
  }>;
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Session Types
export interface FirestoreSession {
  id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  description?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startDate?: Timestamp | Date;
  endDate?: Timestamp | Date;
  participants: string[];
  workflowId?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Inventory Types
export interface FirestoreInventoryItem {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  location?: string;
  assignedTo?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Media Types
export interface FirestoreMediaFile {
  id: string;
  organizationId: string;
  projectId?: string;
  sessionId?: string;
  name: string;
  description?: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  mimeType: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

/**
 * Firestore Collection Manager
 * Provides centralized access to all Firestore collections with proper typing
 */
export class FirestoreCollectionManager {
  private static instance: FirestoreCollectionManager;
  
  public static getInstance(): FirestoreCollectionManager {
    if (!FirestoreCollectionManager.instance) {
      FirestoreCollectionManager.instance = new FirestoreCollectionManager();
    }
    return FirestoreCollectionManager.instance;
  }
  
  /**
   * Check if we're in webonly mode
   * Licensing website is ALWAYS in web-only mode
   */
  public isWebOnlyMode(): boolean {
    // Licensing website is always in web-only mode
    // This ensures consistent behavior across all environments
    return true;
  }
  
  /**
   * Get collection reference with proper typing and fallback support
   */
  public getCollection<T = any>(collectionName: string): CollectionReference<T> {
    return collection(db, collectionName) as CollectionReference<T>;
  }

  /**
   * Get collection with automatic fallback to legacy naming
   * This method tries the primary (camelCase) collection first, then falls back to legacy (snake_case)
   */
  public async getCollectionWithFallback<T = any>(
    primaryCollectionName: string
  ): Promise<{ collection: CollectionReference<T>; collectionName: string; isLegacy: boolean }> {
    const mappingKey = primaryCollectionName as keyof typeof COLLECTION_MAPPINGS;
    const possibleNames = COLLECTION_MAPPINGS[mappingKey] || [primaryCollectionName];
    
    // Try each collection name in order (primary first, then legacy)
    for (let i = 0; i < possibleNames.length; i++) {
      const collectionName = possibleNames[i];
      const isLegacy = i > 0; // First item is primary, rest are legacy
      
      try {
        const collectionRef = this.getCollection<T>(collectionName);
        // Test if collection is accessible by trying a small query
        const testQuery = query(collectionRef, limit(1));
        await getDocs(testQuery);
        
        console.log(`✅ [FirestoreCollectionManager] Using ${isLegacy ? 'legacy' : 'primary'} collection: '${collectionName}'`);
        return { collection: collectionRef, collectionName, isLegacy };
      } catch (error) {
        console.warn(`⚠️ [FirestoreCollectionManager] Collection '${collectionName}' not accessible, trying next...`);
        continue;
      }
    }
    
    // If no collections are accessible, return the primary collection anyway
    const primaryCollection = this.getCollection<T>(possibleNames[0]);
    console.warn(`⚠️ [FirestoreCollectionManager] No accessible collections found, using primary: '${possibleNames[0]}'`);
    return { collection: primaryCollection, collectionName: possibleNames[0], isLegacy: false };
  }
  
  /**
   * Get document reference with proper typing
   */
  public getDocument<T = any>(collectionName: string, docId: string): DocumentReference<T> {
    return doc(db, collectionName, docId) as DocumentReference<T>;
  }
  
  /**
   * Initialize all required collections and ensure they exist
   */
  public async initializeCollections(): Promise<void> {
    console.log('🔧 [FirestoreCollectionManager] Initializing Firestore collections...');
    
    try {
      // Check if we have proper Firebase Auth
      const { auth } = await import('./firebase');
      if (!auth.currentUser && this.isWebOnlyMode()) {
        console.warn('⚠️ [FirestoreCollectionManager] No authenticated user - some operations may fail');
        return;
      }
      
      // Initialize core collections by ensuring they're accessible
      const coreCollections = [
        COLLECTIONS.USERS,
        COLLECTIONS.ORGANIZATIONS,
        COLLECTIONS.ORG_MEMBERS,
        COLLECTIONS.PROJECTS,
        COLLECTIONS.LICENSES,
        COLLECTIONS.TEAM_MEMBERS,
        COLLECTIONS.PROJECT_TEAM_MEMBERS
      ];
      
      for (const collectionName of coreCollections) {
        try {
          const collectionRef = this.getCollection(collectionName);
          // Try to read from collection to ensure it's accessible
          const testQuery = query(collectionRef, limit(1));
          await getDocs(testQuery);
          console.log(`✅ [FirestoreCollectionManager] Collection '${collectionName}' is accessible`);
        } catch (error) {
          console.warn(`⚠️ [FirestoreCollectionManager] Collection '${collectionName}' may not be accessible:`, error);
        }
      }
      
      console.log('✅ [FirestoreCollectionManager] Collection initialization completed');
    } catch (error) {
      console.error('❌ [FirestoreCollectionManager] Failed to initialize collections:', error);
    }
  }
  
  /**
   * Clean document data by removing undefined and null values
   * This prevents Firestore errors when creating/updating documents
   */
  private cleanDocumentData<T>(data: T): T {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.cleanDocumentData(item)) as T;
    }
    
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        cleaned[key] = this.cleanDocumentData(value);
      }
    }
    
    return cleaned as T;
  }

  /**
   * Create a new document in a collection
   */
  public async createDocument<T = any>(
    collectionName: string, 
    data: Omit<T, 'id'> & { createdAt?: any; updatedAt?: any }
  ): Promise<string> {
    try {
      const collectionRef = this.getCollection<T>(collectionName);
      const now = Timestamp.now();
      
      const docData = {
        ...data,
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now
      };
      
      // Clean the data to remove undefined values that could cause Firestore errors
      const cleanedData = this.cleanDocumentData(docData);
      
      const docRef = await addDoc(collectionRef, cleanedData as any);
      console.log(`✅ [FirestoreCollectionManager] Created document in '${collectionName}':`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`❌ [FirestoreCollectionManager] Failed to create document in '${collectionName}':`, error);
      throw error;
    }
  }
  
  /**
   * Update a document in a collection
   */
  public async updateDocument<T = any>(
    collectionName: string, 
    docId: string, 
    data: Partial<T> & { updatedAt?: any }
  ): Promise<void> {
    try {
      const docRef = this.getDocument<T>(collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: data.updatedAt || Timestamp.now()
      };
      
      // Clean the data to remove undefined values that could cause Firestore errors
      const cleanedData = this.cleanDocumentData(updateData);
      
      await updateDoc(docRef, cleanedData);
      console.log(`✅ [FirestoreCollectionManager] Updated document in '${collectionName}':`, docId);
    } catch (error) {
      console.error(`❌ [FirestoreCollectionManager] Failed to update document in '${collectionName}':`, error);
      throw error;
    }
  }
  
  /**
   * Delete a document from a collection
   */
  public async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = this.getDocument(collectionName, docId);
      await deleteDoc(docRef);
      console.log(`✅ [FirestoreCollectionManager] Deleted document from '${collectionName}':`, docId);
    } catch (error) {
      console.error(`❌ [FirestoreCollectionManager] Failed to delete document from '${collectionName}':`, error);
      throw error;
    }
  }
  
  /**
   * Get a single document by ID
   */
  public async getDocumentById<T = any>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = this.getDocument<T>(collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ [FirestoreCollectionManager] Failed to get document from '${collectionName}':`, error);
      throw error;
    }
  }
  
  /**
   * Query documents with filters
   */
  public async queryDocuments<T = any>(
    collectionName: string,
    filters: Array<{ field: string; operator: any; value: any }> = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      const collectionRef = this.getCollection<T>(collectionName);
      let q = query(collectionRef);
      
      // Apply filters
      for (const filter of filters) {
        q = query(q, where(filter.field, filter.operator, filter.value));
      }
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents: T[] = [];
      
      querySnapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() } as T);
      });
      
      return documents;
    } catch (error: any) {
      // If it's an index error, try a simpler query without ordering
      if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
        console.warn(`⚠️ [FirestoreCollectionManager] Index missing for '${collectionName}', trying simpler query...`);
        try {
          const collectionRef = this.getCollection<T>(collectionName);
          let q = query(collectionRef);
          
          // Apply only the filters, skip ordering to avoid index requirements
          for (const filter of filters) {
            q = query(q, where(filter.field, filter.operator, filter.value));
          }
          
          // Apply limit without ordering
          if (limitCount) {
            q = query(q, limit(limitCount));
          }
          
          const querySnapshot = await getDocs(q);
          const documents: T[] = [];
          
          querySnapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() } as T);
          });
          
          // Sort in memory if ordering was requested
          if (orderByField && documents.length > 0) {
            documents.sort((a: any, b: any) => {
              const aVal = a[orderByField];
              const bVal = b[orderByField];
              
              if (orderDirection === 'desc') {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
              } else {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
              }
            });
          }
          
          console.log(`✅ [FirestoreCollectionManager] Fallback query successful for '${collectionName}': ${documents.length} documents`);
          return documents;
        } catch (fallbackError) {
          console.error(`❌ [FirestoreCollectionManager] Fallback query also failed for '${collectionName}':`, fallbackError);
          throw fallbackError;
        }
      }
      
      console.error(`❌ [FirestoreCollectionManager] Failed to query documents from '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * Query documents with automatic fallback to legacy collections
   * This method tries the primary collection first, then falls back to legacy naming
   */
  public async queryDocumentsWithFallback<T = any>(
    primaryCollectionName: string,
    filters: Array<{ field: string; operator: any; value: any }> = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Promise<{ documents: T[]; collectionUsed: string; isLegacy: boolean }> {
    const mappingKey = primaryCollectionName as keyof typeof COLLECTION_MAPPINGS;
    const possibleNames = COLLECTION_MAPPINGS[mappingKey] || [primaryCollectionName];
    
    let lastError: any = null;
    
    // Try each collection name in order (primary first, then legacy)
    for (let i = 0; i < possibleNames.length; i++) {
      const collectionName = possibleNames[i];
      const isLegacy = i > 0;
      
      try {
        const documents = await this.queryDocuments<T>(
          collectionName,
          filters,
          orderByField,
          orderDirection,
          limitCount
        );
        
        console.log(`✅ [FirestoreCollectionManager] Successfully queried ${isLegacy ? 'legacy' : 'primary'} collection '${collectionName}': ${documents.length} documents`);
        return { documents, collectionUsed: collectionName, isLegacy };
      } catch (error) {
        console.warn(`⚠️ [FirestoreCollectionManager] Failed to query '${collectionName}', trying next...`, error);
        lastError = error;
        continue;
      }
    }
    
    // If all collections failed, throw the last error
    console.error(`❌ [FirestoreCollectionManager] All collection queries failed for '${primaryCollectionName}'`);
    throw lastError || new Error(`No accessible collections found for '${primaryCollectionName}'`);
  }
  
  /**
   * Batch operations for multiple documents
   */
  public async batchOperations(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    docId?: string;
    data?: any;
  }>): Promise<void> {
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();
      
      for (const operation of operations) {
        switch (operation.type) {
          case 'create':
            if (operation.data) {
              const docRef = doc(this.getCollection(operation.collection));
              batch.set(docRef, {
                ...operation.data,
                createdAt: operation.data.createdAt || now,
                updatedAt: operation.data.updatedAt || now
              });
            }
            break;
            
          case 'update':
            if (operation.docId && operation.data) {
              const docRef = this.getDocument(operation.collection, operation.docId);
              batch.update(docRef, {
                ...operation.data,
                updatedAt: operation.data.updatedAt || now
              });
            }
            break;
            
          case 'delete':
            if (operation.docId) {
              const docRef = this.getDocument(operation.collection, operation.docId);
              batch.delete(docRef);
            }
            break;
        }
      }
      
      await batch.commit();
      console.log(`✅ [FirestoreCollectionManager] Completed batch operations:`, operations.length);
    } catch (error) {
      console.error('❌ [FirestoreCollectionManager] Failed to execute batch operations:', error);
      throw error;
    }
  }
  
  /**
   * Set up real-time listener for a collection
   */
  public subscribeToCollection<T = any>(
    collectionName: string,
    callback: (documents: T[]) => void,
    filters: Array<{ field: string; operator: any; value: any }> = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): () => void {
    try {
      const collectionRef = this.getCollection<T>(collectionName);
      let q = query(collectionRef);
      
      // Apply filters
      for (const filter of filters) {
        q = query(q, where(filter.field, filter.operator, filter.value));
      }
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents: T[] = [];
        querySnapshot.forEach(doc => {
          documents.push({ id: doc.id, ...doc.data() } as T);
        });
        callback(documents);
      }, (error) => {
        console.error(`❌ [FirestoreCollectionManager] Subscription error for '${collectionName}':`, error);
      });
      
      console.log(`✅ [FirestoreCollectionManager] Set up subscription for '${collectionName}'`);
      return unsubscribe;
    } catch (error) {
      console.error(`❌ [FirestoreCollectionManager] Failed to set up subscription for '${collectionName}':`, error);
      return () => {}; // Return empty unsubscribe function
    }
  }
  
  /**
   * Validate collection access and permissions
   */
  public async validateCollectionAccess(collectionName: string): Promise<boolean> {
    try {
      const collectionRef = this.getCollection(collectionName);
      const testQuery = query(collectionRef, limit(1));
      await getDocs(testQuery);
      return true;
    } catch (error) {
      console.warn(`⚠️ [FirestoreCollectionManager] No access to collection '${collectionName}':`, error);
      return false;
    }
  }
  
  /**
   * Get collection statistics
   */
  public async getCollectionStats(collectionName: string): Promise<{
    accessible: boolean;
    documentCount?: number;
    lastUpdated?: Date;
  }> {
    try {
      const accessible = await this.validateCollectionAccess(collectionName);
      if (!accessible) {
        return { accessible: false };
      }
      
      const documents = await this.queryDocuments(collectionName, [], 'updatedAt', 'desc', 100);
      
      return {
        accessible: true,
        documentCount: documents.length,
        lastUpdated: documents.length > 0 && documents[0].updatedAt 
          ? new Date(documents[0].updatedAt.toDate ? documents[0].updatedAt.toDate() : documents[0].updatedAt)
          : undefined
      };
    } catch (error) {
      console.error(`❌ [FirestoreCollectionManager] Failed to get stats for '${collectionName}':`, error);
      return { accessible: false };
    }
  }
}

// Export singleton instance
export const firestoreCollectionManager = FirestoreCollectionManager.getInstance();

// Export collection-specific helpers
export class UserManager {
  static async getUser(userId: string): Promise<FirestoreUser | null> {
    return firestoreCollectionManager.getDocumentById<FirestoreUser>(COLLECTIONS.USERS, userId);
  }
  
  static async getUsersByOrganization(organizationId: string): Promise<FirestoreUser[]> {
    return firestoreCollectionManager.queryDocuments<FirestoreUser>(
      COLLECTIONS.USERS,
      [{ field: 'organizationId', operator: '==', value: organizationId }],
      'createdAt',
      'desc'
    );
  }
  
  static async updateUser(userId: string, data: Partial<FirestoreUser>): Promise<void> {
    return firestoreCollectionManager.updateDocument(COLLECTIONS.USERS, userId, data);
  }
}

export class OrganizationManager {
  static async getOrganization(orgId: string): Promise<FirestoreOrganization | null> {
    return firestoreCollectionManager.getDocumentById<FirestoreOrganization>(COLLECTIONS.ORGANIZATIONS, orgId);
  }
  
  static async getOrganizationsByOwner(ownerUserId: string): Promise<FirestoreOrganization[]> {
    return firestoreCollectionManager.queryDocuments<FirestoreOrganization>(
      COLLECTIONS.ORGANIZATIONS,
      [{ field: 'ownerUserId', operator: '==', value: ownerUserId }],
      'createdAt',
      'desc'
    );
  }
}

export class ProjectManager {
  static async getProject(projectId: string): Promise<FirestoreProject | null> {
    return firestoreCollectionManager.getDocumentById<FirestoreProject>(COLLECTIONS.PROJECTS, projectId);
  }
  
  static async getProjectsByOwner(ownerId: string): Promise<FirestoreProject[]> {
    return firestoreCollectionManager.queryDocuments<FirestoreProject>(
      COLLECTIONS.PROJECTS,
      [
        { field: 'ownerId', operator: '==', value: ownerId },
        { field: 'isActive', operator: '==', value: true },
        { field: 'isArchived', operator: '==', value: false }
      ],
      'updatedAt',
      'desc'
    );
  }
  
  static async getProjectsByOrganization(organizationId: string): Promise<FirestoreProject[]> {
    return firestoreCollectionManager.queryDocuments<FirestoreProject>(
      COLLECTIONS.PROJECTS,
      [
        { field: 'organizationId', operator: '==', value: organizationId },
        { field: 'visibility', operator: '==', value: 'organization' }
      ],
      'updatedAt',
      'desc'
    );
  }
}

export class LicenseManager {
  static async getLicense(licenseId: string): Promise<FirestoreLicense | null> {
    return firestoreCollectionManager.getDocumentById<FirestoreLicense>(COLLECTIONS.LICENSES, licenseId);
  }
  
  static async getLicensesByUser(userId: string): Promise<FirestoreLicense[]> {
    return firestoreCollectionManager.queryDocuments<FirestoreLicense>(
      COLLECTIONS.LICENSES,
      [{ field: 'userId', operator: '==', value: userId }],
      'createdAt',
      'desc'
    );
  }
  
  static async getLicensesByOrganization(organizationId: string): Promise<FirestoreLicense[]> {
    return firestoreCollectionManager.queryDocuments<FirestoreLicense>(
      COLLECTIONS.LICENSES,
      [{ field: 'organizationId', operator: '==', value: organizationId }],
      'createdAt',
      'desc'
    );
  }
}

export default FirestoreCollectionManager;
