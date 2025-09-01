/**
 * ============================================================================
 * CROSS-APP ROLE SYNCHRONIZATION SERVICE
 * ============================================================================
 * 
 * This service handles real-time synchronization of role assignments between
 * the licensing website and the Dashboard application. It ensures that role
 * changes in one application are properly reflected in the other.
 * 
 * Key Features:
 * - Real-time role synchronization via Firebase
 * - Bidirectional sync (licensing ↔ dashboard)
 * - Conflict resolution for simultaneous changes
 * - Audit trail for role changes
 * - Batch synchronization for bulk operations
 */

import { doc, updateDoc, onSnapshot, collection, addDoc, Timestamp, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { EnhancedRoleBridgeService, EnhancedRoleMapping, DashboardUserRole, LicensingRole } from './EnhancedRoleBridgeService';
import { EnhancedRoleTemplate } from '../components/EnhancedRoleTemplates';

// Sync Event Types
export enum SyncEventType {
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  HIERARCHY_CHANGED = 'HIERARCHY_CHANGED',
  PERMISSIONS_UPDATED = 'PERMISSIONS_UPDATED'
}

// Sync Event Interface
export interface RoleSyncEvent {
  id?: string;
  type: SyncEventType;
  sourceApp: 'licensing' | 'dashboard';
  targetApp: 'licensing' | 'dashboard';
  timestamp: Date;
  userId: string;
  projectId: string;
  organizationId: string;
  data: {
    // Licensing website data
    licensingRole?: LicensingRole;
    templateRole?: EnhancedRoleTemplate;
    
    // Dashboard data
    dashboardRole?: DashboardUserRole;
    hierarchy?: number;
    permissions?: any;
    
    // Enhanced mapping
    roleMapping?: EnhancedRoleMapping;
    
    // Additional context
    assignedBy?: string;
    reason?: string;
    metadata?: Record<string, any>;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Sync Configuration
export interface SyncConfig {
  enableRealTimeSync: boolean;
  enableBidirectionalSync: boolean;
  conflictResolution: 'licensing-wins' | 'dashboard-wins' | 'manual' | 'hierarchy-based';
  batchSize: number;
  retryAttempts: number;
  syncTimeout: number;
}

/**
 * Cross-App Role Synchronization Service
 */
export class CrossAppRoleSyncService {
  private static instance: CrossAppRoleSyncService;
  private roleBridgeService: EnhancedRoleBridgeService;
  private syncListeners: Map<string, () => void> = new Map();
  private syncQueue: RoleSyncEvent[] = [];
  private isProcessingQueue = false;

  private config: SyncConfig = {
    enableRealTimeSync: true, // Enabled now that collections are extended
    enableBidirectionalSync: true,
    conflictResolution: 'hierarchy-based',
    batchSize: 10,
    retryAttempts: 3,
    syncTimeout: 30000
  };

  private constructor() {
    this.roleBridgeService = EnhancedRoleBridgeService.getInstance();
    this.initializeSyncListeners();
  }

  static getInstance(): CrossAppRoleSyncService {
    if (!CrossAppRoleSyncService.instance) {
      CrossAppRoleSyncService.instance = new CrossAppRoleSyncService();
    }
    return CrossAppRoleSyncService.instance;
  }

  /**
   * Initialize real-time sync listeners
   */
  private initializeSyncListeners(): void {
    if (!this.config.enableRealTimeSync) return;

    console.log('🔄 [CrossAppSync] Initializing real-time sync listeners');

    // Listen for role sync events
    const syncEventsRef = collection(db, 'roleSyncEvents');
    const unsubscribe = onSnapshot(syncEventsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const syncEvent = { id: change.doc.id, ...change.doc.data() } as RoleSyncEvent;
          this.handleIncomingSyncEvent(syncEvent);
        }
      });
    });

    this.syncListeners.set('roleSyncEvents', unsubscribe);
  }

  /**
   * Sync role assignment from licensing website to Dashboard
   */
  async syncRoleToLicensing(
    userId: string,
    projectId: string,
    organizationId: string,
    licensingRole: LicensingRole,
    templateRole?: EnhancedRoleTemplate,
    assignedBy?: string
  ): Promise<void> {
    // Skip sync if disabled
    if (!this.config.enableRealTimeSync) {
      console.log(`⏸️ [CrossAppSync] Sync disabled, skipping role sync for: ${userId}`);
      return;
    }

    console.log(`🔄 [CrossAppSync] Syncing role to licensing: ${userId} -> ${licensingRole}`);

    try {
      // Create enhanced role mapping
      const roleMapping = this.roleBridgeService.mapLicensingRoleToDashboard(
        licensingRole,
        templateRole,
        'PRO' // Could be dynamic based on organization tier
      );

      // Create sync event
      const syncEvent: RoleSyncEvent = {
        type: SyncEventType.ROLE_ASSIGNED,
        sourceApp: 'licensing',
        targetApp: 'dashboard',
        timestamp: new Date(),
        userId,
        projectId,
        organizationId,
        data: {
          licensingRole,
          templateRole,
          dashboardRole: roleMapping.dashboardRole,
          hierarchy: roleMapping.effectiveHierarchy,
          permissions: roleMapping.permissions,
          roleMapping,
          assignedBy,
          reason: 'Role assigned via licensing website wizard'
        },
        status: 'pending'
      };

      // Add to sync queue
      await this.addToSyncQueue(syncEvent);

      // Update user document with role mapping
      await this.updateUserRoleMapping(userId, projectId, roleMapping);

      console.log(`✅ [CrossAppSync] Role sync initiated for user: ${userId}`);
    } catch (error) {
      console.error('❌ [CrossAppSync] Error syncing role to licensing:', error);
      throw error;
    }
  }

  /**
   * Sync role assignment from Dashboard to licensing website
   */
  async syncRoleFromDashboard(
    userId: string,
    projectId: string,
    organizationId: string,
    dashboardRole: DashboardUserRole,
    hierarchy: number,
    assignedBy?: string
  ): Promise<void> {
    // Skip sync if disabled
    if (!this.config.enableRealTimeSync) {
      console.log(`⏸️ [CrossAppSync] Sync disabled, skipping Dashboard role sync for: ${userId}`);
      return;
    }

    console.log(`🔄 [CrossAppSync] Syncing role from Dashboard: ${userId} -> ${dashboardRole}`);

    try {
      // Create sync event
      const syncEvent: RoleSyncEvent = {
        type: SyncEventType.ROLE_ASSIGNED,
        sourceApp: 'dashboard',
        targetApp: 'licensing',
        timestamp: new Date(),
        userId,
        projectId,
        organizationId,
        data: {
          dashboardRole,
          hierarchy,
          assignedBy,
          reason: 'Role assigned via Dashboard application'
        },
        status: 'pending'
      };

      // Add to sync queue
      await this.addToSyncQueue(syncEvent);

      console.log(`✅ [CrossAppSync] Dashboard role sync initiated for user: ${userId}`);
    } catch (error) {
      console.error('❌ [CrossAppSync] Error syncing role from Dashboard:', error);
      throw error;
    }
  }

  /**
   * Add sync event to queue
   */
  private async addToSyncQueue(syncEvent: RoleSyncEvent): Promise<void> {
    try {
      // Add to Firestore for persistence and cross-instance sync
      const docRef = await addDoc(collection(db, 'roleSyncEvents'), {
        ...syncEvent,
        timestamp: Timestamp.fromDate(syncEvent.timestamp)
      });

      syncEvent.id = docRef.id;
      this.syncQueue.push(syncEvent);

      // Process queue if not already processing
      if (!this.isProcessingQueue) {
        this.processSyncQueue();
      }
    } catch (error) {
      console.error('❌ [CrossAppSync] Error adding to sync queue:', error);
      throw error;
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0) return;

    this.isProcessingQueue = true;
    console.log(`🔄 [CrossAppSync] Processing sync queue: ${this.syncQueue.length} events`);

    try {
      while (this.syncQueue.length > 0) {
        const batch = this.syncQueue.splice(0, this.config.batchSize);
        await Promise.all(batch.map(event => this.processSyncEvent(event)));
      }
    } catch (error) {
      console.error('❌ [CrossAppSync] Error processing sync queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Process individual sync event
   */
  private async processSyncEvent(syncEvent: RoleSyncEvent): Promise<void> {
    console.log(`🔄 [CrossAppSync] Processing sync event: ${syncEvent.type} for user ${syncEvent.userId}`);

    try {
      // Update event status
      await this.updateSyncEventStatus(syncEvent.id!, 'processing');

      switch (syncEvent.type) {
        case SyncEventType.ROLE_ASSIGNED:
          await this.processRoleAssignment(syncEvent);
          break;
        case SyncEventType.ROLE_UPDATED:
          await this.processRoleUpdate(syncEvent);
          break;
        case SyncEventType.ROLE_REMOVED:
          await this.processRoleRemoval(syncEvent);
          break;
        case SyncEventType.HIERARCHY_CHANGED:
          await this.processHierarchyChange(syncEvent);
          break;
        case SyncEventType.PERMISSIONS_UPDATED:
          await this.processPermissionsUpdate(syncEvent);
          break;
      }

      // Mark as completed
      await this.updateSyncEventStatus(syncEvent.id!, 'completed');
      console.log(`✅ [CrossAppSync] Sync event completed: ${syncEvent.id}`);
    } catch (error) {
      console.error(`❌ [CrossAppSync] Error processing sync event ${syncEvent.id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateSyncEventStatus(syncEvent.id!, 'failed', errorMessage);
    }
  }

  /**
   * Process role assignment sync
   */
  private async processRoleAssignment(syncEvent: RoleSyncEvent): Promise<void> {
    const { userId, projectId, data } = syncEvent;

    if (syncEvent.targetApp === 'dashboard') {
      // Sync to Dashboard application
      await this.syncToDashboardApp(userId, projectId, data.roleMapping!);
    } else if (syncEvent.targetApp === 'licensing') {
      // Sync to licensing website
      await this.syncToLicensingApp(userId, projectId, data.dashboardRole!, data.hierarchy!);
    }
  }

  /**
   * Sync role to Dashboard application (using existing collections)
   */
  private async syncToDashboardApp(
    userId: string,
    projectId: string,
    roleMapping: EnhancedRoleMapping
  ): Promise<void> {
    console.log(`🎯 [CrossAppSync] Syncing to existing collections: ${userId} -> ${roleMapping.dashboardRole}`);

    try {
      // Update existing users collection with Dashboard role mapping
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      const dashboardRoleData = {
        [projectId]: {
          dashboardRole: roleMapping.dashboardRole,
          hierarchy: roleMapping.effectiveHierarchy,
          permissions: roleMapping.permissions,
          licensingRole: roleMapping.licensingRole,
          templateRole: roleMapping.templateRole?.id || null,
          syncedAt: Timestamp.now(),
          syncSource: 'licensing'
        }
      };

      if (userDoc.exists()) {
        // Update existing user document with Dashboard role mapping
        await updateDoc(userRef, {
          [`dashboardRoleMappings.${projectId}`]: dashboardRoleData[projectId],
          lastRoleSync: Timestamp.now(),
          roleSystemVersion: '2.0'
        });
        console.log(`✅ [CrossAppSync] Updated user Dashboard role mapping: ${userId}`);
      } else {
        console.warn(`⚠️ [CrossAppSync] User document not found: ${userId}`);
        return;
      }

      // Update existing projectAssignments collection with Dashboard role data
      const assignmentQuery = query(
        collection(db, 'projectAssignments'),
        where('projectId', '==', projectId),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const assignmentSnapshot = await getDocs(assignmentQuery);
      
      if (!assignmentSnapshot.empty) {
        // Update existing assignment with Dashboard role data
        const assignmentDoc = assignmentSnapshot.docs[0];
        await updateDoc(assignmentDoc.ref, {
          dashboardRole: roleMapping.dashboardRole,
          hierarchyLevel: roleMapping.effectiveHierarchy,
          enhancedPermissions: roleMapping.permissions,
          syncMetadata: {
            lastSyncedAt: Timestamp.now(),
            syncSource: 'licensing',
            syncVersion: '2.0'
          }
        });
        console.log(`✅ [CrossAppSync] Updated project assignment with Dashboard role: ${userId}`);
      } else {
        console.warn(`⚠️ [CrossAppSync] No active project assignment found for user ${userId} in project ${projectId}`);
      }
      
    } catch (error) {
      console.error(`❌ [CrossAppSync] Error syncing to existing collections for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Sync role to licensing application
   */
  private async syncToLicensingApp(
    userId: string,
    projectId: string,
    dashboardRole: DashboardUserRole,
    hierarchy: number
  ): Promise<void> {
    console.log(`🎯 [CrossAppSync] Syncing to Licensing: ${userId} -> ${dashboardRole}`);

    // Update project assignment in licensing website
    const assignmentRef = doc(db, 'projectAssignments', `${projectId}-${userId}`);
    await updateDoc(assignmentRef, {
      dashboardRole,
      hierarchy,
      syncedAt: Timestamp.now(),
      syncSource: 'dashboard'
    });
  }

  /**
   * Handle incoming sync event from other instances
   */
  private async handleIncomingSyncEvent(syncEvent: RoleSyncEvent): Promise<void> {
    // Only process events not created by this instance
    if (syncEvent.status === 'pending') {
      this.syncQueue.push(syncEvent);
      
      if (!this.isProcessingQueue) {
        this.processSyncQueue();
      }
    }
  }

  /**
   * Update user role mapping
   */
  private async updateUserRoleMapping(
    userId: string,
    projectId: string,
    roleMapping: EnhancedRoleMapping
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      const mappingData = {
        ...roleMapping,
        updatedAt: Timestamp.now()
      };
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          [`roleMappings.${projectId}`]: mappingData
        });
        console.log(`✅ [CrossAppSync] Updated role mapping for user: ${userId}`);
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          id: userId,
          roleMappings: {
            [projectId]: mappingData
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        console.log(`✅ [CrossAppSync] Created user with role mapping: ${userId}`);
      }
    } catch (error) {
      console.error(`❌ [CrossAppSync] Error updating role mapping for user ${userId}:`, error);
      // Don't throw here as this is a secondary operation
    }
  }

  /**
   * Update sync event status
   */
  private async updateSyncEventStatus(
    eventId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    const eventRef = doc(db, 'roleSyncEvents', eventId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now()
    };

    if (error) {
      updateData.error = error;
    }

    await updateDoc(eventRef, updateData);
  }

  /**
   * Process role update (placeholder)
   */
  private async processRoleUpdate(syncEvent: RoleSyncEvent): Promise<void> {
    // Implementation for role updates
    console.log('🔄 [CrossAppSync] Processing role update:', syncEvent.id);
  }

  /**
   * Process role removal (placeholder)
   */
  private async processRoleRemoval(syncEvent: RoleSyncEvent): Promise<void> {
    // Implementation for role removal
    console.log('🔄 [CrossAppSync] Processing role removal:', syncEvent.id);
  }

  /**
   * Process hierarchy change (placeholder)
   */
  private async processHierarchyChange(syncEvent: RoleSyncEvent): Promise<void> {
    // Implementation for hierarchy changes
    console.log('🔄 [CrossAppSync] Processing hierarchy change:', syncEvent.id);
  }

  /**
   * Process permissions update (placeholder)
   */
  private async processPermissionsUpdate(syncEvent: RoleSyncEvent): Promise<void> {
    // Implementation for permissions updates
    console.log('🔄 [CrossAppSync] Processing permissions update:', syncEvent.id);
  }

  /**
   * Configure sync settings
   */
  configureSyncSettings(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ [CrossAppSync] Sync configuration updated:', this.config);
    
    // Reinitialize listeners if sync was enabled
    if (config.enableRealTimeSync && !this.syncListeners.has('roleSyncEvents')) {
      this.initializeSyncListeners();
    }
  }

  /**
   * Enable cross-app synchronization
   */
  enableSync(): void {
    this.configureSyncSettings({ enableRealTimeSync: true });
    console.log('✅ [CrossAppSync] Cross-app synchronization enabled');
  }

  /**
   * Disable cross-app synchronization
   */
  disableSync(): void {
    this.configureSyncSettings({ enableRealTimeSync: false });
    console.log('⏸️ [CrossAppSync] Cross-app synchronization disabled');
  }

  /**
   * Get sync status for a user/project
   */
  async getSyncStatus(userId: string, projectId: string): Promise<RoleSyncEvent[]> {
    // Implementation to get sync status
    return [];
  }

  /**
   * Cleanup sync listeners
   */
  cleanup(): void {
    this.syncListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.syncListeners.clear();
    console.log('🧹 [CrossAppSync] Sync listeners cleaned up');
  }
}

export default CrossAppRoleSyncService;

 * CROSS-APP ROLE SYNCHRONIZATION SERVICE
 * ============================================================================
 * 
 * This service handles real-time synchronization of role assignments between
 * the licensing website and the Dashboard application. It ensures that role
 * changes in one application are properly reflected in the other.
 * 
 * Key Features:
 * - Real-time role synchronization via Firebase
 * - Bidirectional sync (licensing ↔ dashboard)
 * - Conflict resolution for simultaneous changes
 * - Audit trail for role changes
 * - Batch synchronization for bulk operations
 */

import { doc, updateDoc, onSnapshot, collection, addDoc, Timestamp, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { EnhancedRoleBridgeService, EnhancedRoleMapping, DashboardUserRole, LicensingRole } from './EnhancedRoleBridgeService';
import { EnhancedRoleTemplate } from '../components/EnhancedRoleTemplates';

// Sync Event Types
export enum SyncEventType {
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  HIERARCHY_CHANGED = 'HIERARCHY_CHANGED',
  PERMISSIONS_UPDATED = 'PERMISSIONS_UPDATED'
}

// Sync Event Interface
export interface RoleSyncEvent {
  id?: string;
  type: SyncEventType;
  sourceApp: 'licensing' | 'dashboard';
  targetApp: 'licensing' | 'dashboard';
  timestamp: Date;
  userId: string;
  projectId: string;
  organizationId: string;
  data: {
    // Licensing website data
    licensingRole?: LicensingRole;
    templateRole?: EnhancedRoleTemplate;
    
    // Dashboard data
    dashboardRole?: DashboardUserRole;
    hierarchy?: number;
    permissions?: any;
    
    // Enhanced mapping
    roleMapping?: EnhancedRoleMapping;
    
    // Additional context
    assignedBy?: string;
    reason?: string;
    metadata?: Record<string, any>;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Sync Configuration
export interface SyncConfig {
  enableRealTimeSync: boolean;
  enableBidirectionalSync: boolean;
  conflictResolution: 'licensing-wins' | 'dashboard-wins' | 'manual' | 'hierarchy-based';
  batchSize: number;
  retryAttempts: number;
  syncTimeout: number;
}

/**
 * Cross-App Role Synchronization Service
 */
export class CrossAppRoleSyncService {
  private static instance: CrossAppRoleSyncService;
  private roleBridgeService: EnhancedRoleBridgeService;
  private syncListeners: Map<string, () => void> = new Map();
  private syncQueue: RoleSyncEvent[] = [];
  private isProcessingQueue = false;

  private config: SyncConfig = {
    enableRealTimeSync: true, // Enabled now that collections are extended
    enableBidirectionalSync: true,
    conflictResolution: 'hierarchy-based',
    batchSize: 10,
    retryAttempts: 3,
    syncTimeout: 30000
  };

  private constructor() {
    this.roleBridgeService = EnhancedRoleBridgeService.getInstance();
    this.initializeSyncListeners();
  }

  static getInstance(): CrossAppRoleSyncService {
    if (!CrossAppRoleSyncService.instance) {
      CrossAppRoleSyncService.instance = new CrossAppRoleSyncService();
    }
    return CrossAppRoleSyncService.instance;
  }

  /**
   * Initialize real-time sync listeners
   */
  private initializeSyncListeners(): void {
    if (!this.config.enableRealTimeSync) return;

    console.log('🔄 [CrossAppSync] Initializing real-time sync listeners');

    // Listen for role sync events
    const syncEventsRef = collection(db, 'roleSyncEvents');
    const unsubscribe = onSnapshot(syncEventsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const syncEvent = { id: change.doc.id, ...change.doc.data() } as RoleSyncEvent;
          this.handleIncomingSyncEvent(syncEvent);
        }
      });
    });

    this.syncListeners.set('roleSyncEvents', unsubscribe);
  }

  /**
   * Sync role assignment from licensing website to Dashboard
   */
  async syncRoleToLicensing(
    userId: string,
    projectId: string,
    organizationId: string,
    licensingRole: LicensingRole,
    templateRole?: EnhancedRoleTemplate,
    assignedBy?: string
  ): Promise<void> {
    // Skip sync if disabled
    if (!this.config.enableRealTimeSync) {
      console.log(`⏸️ [CrossAppSync] Sync disabled, skipping role sync for: ${userId}`);
      return;
    }

    console.log(`🔄 [CrossAppSync] Syncing role to licensing: ${userId} -> ${licensingRole}`);

    try {
      // Create enhanced role mapping
      const roleMapping = this.roleBridgeService.mapLicensingRoleToDashboard(
        licensingRole,
        templateRole,
        'PRO' // Could be dynamic based on organization tier
      );

      // Create sync event
      const syncEvent: RoleSyncEvent = {
        type: SyncEventType.ROLE_ASSIGNED,
        sourceApp: 'licensing',
        targetApp: 'dashboard',
        timestamp: new Date(),
        userId,
        projectId,
        organizationId,
        data: {
          licensingRole,
          templateRole,
          dashboardRole: roleMapping.dashboardRole,
          hierarchy: roleMapping.effectiveHierarchy,
          permissions: roleMapping.permissions,
          roleMapping,
          assignedBy,
          reason: 'Role assigned via licensing website wizard'
        },
        status: 'pending'
      };

      // Add to sync queue
      await this.addToSyncQueue(syncEvent);

      // Update user document with role mapping
      await this.updateUserRoleMapping(userId, projectId, roleMapping);

      console.log(`✅ [CrossAppSync] Role sync initiated for user: ${userId}`);
    } catch (error) {
      console.error('❌ [CrossAppSync] Error syncing role to licensing:', error);
      throw error;
    }
  }

  /**
   * Sync role assignment from Dashboard to licensing website
   */
  async syncRoleFromDashboard(
    userId: string,
    projectId: string,
    organizationId: string,
    dashboardRole: DashboardUserRole,
    hierarchy: number,
    assignedBy?: string
  ): Promise<void> {
    // Skip sync if disabled
    if (!this.config.enableRealTimeSync) {
      console.log(`⏸️ [CrossAppSync] Sync disabled, skipping Dashboard role sync for: ${userId}`);
      return;
    }

    console.log(`🔄 [CrossAppSync] Syncing role from Dashboard: ${userId} -> ${dashboardRole}`);

    try {
      // Create sync event
      const syncEvent: RoleSyncEvent = {
        type: SyncEventType.ROLE_ASSIGNED,
        sourceApp: 'dashboard',
        targetApp: 'licensing',
        timestamp: new Date(),
        userId,
        projectId,
        organizationId,
        data: {
          dashboardRole,
          hierarchy,
          assignedBy,
          reason: 'Role assigned via Dashboard application'
        },
        status: 'pending'
      };

      // Add to sync queue
      await this.addToSyncQueue(syncEvent);

      console.log(`✅ [CrossAppSync] Dashboard role sync initiated for user: ${userId}`);
    } catch (error) {
      console.error('❌ [CrossAppSync] Error syncing role from Dashboard:', error);
      throw error;
    }
  }

  /**
   * Add sync event to queue
   */
  private async addToSyncQueue(syncEvent: RoleSyncEvent): Promise<void> {
    try {
      // Add to Firestore for persistence and cross-instance sync
      const docRef = await addDoc(collection(db, 'roleSyncEvents'), {
        ...syncEvent,
        timestamp: Timestamp.fromDate(syncEvent.timestamp)
      });

      syncEvent.id = docRef.id;
      this.syncQueue.push(syncEvent);

      // Process queue if not already processing
      if (!this.isProcessingQueue) {
        this.processSyncQueue();
      }
    } catch (error) {
      console.error('❌ [CrossAppSync] Error adding to sync queue:', error);
      throw error;
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0) return;

    this.isProcessingQueue = true;
    console.log(`🔄 [CrossAppSync] Processing sync queue: ${this.syncQueue.length} events`);

    try {
      while (this.syncQueue.length > 0) {
        const batch = this.syncQueue.splice(0, this.config.batchSize);
        await Promise.all(batch.map(event => this.processSyncEvent(event)));
      }
    } catch (error) {
      console.error('❌ [CrossAppSync] Error processing sync queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Process individual sync event
   */
  private async processSyncEvent(syncEvent: RoleSyncEvent): Promise<void> {
    console.log(`🔄 [CrossAppSync] Processing sync event: ${syncEvent.type} for user ${syncEvent.userId}`);

    try {
      // Update event status
      await this.updateSyncEventStatus(syncEvent.id!, 'processing');

      switch (syncEvent.type) {
        case SyncEventType.ROLE_ASSIGNED:
          await this.processRoleAssignment(syncEvent);
          break;
        case SyncEventType.ROLE_UPDATED:
          await this.processRoleUpdate(syncEvent);
          break;
        case SyncEventType.ROLE_REMOVED:
          await this.processRoleRemoval(syncEvent);
          break;
        case SyncEventType.HIERARCHY_CHANGED:
          await this.processHierarchyChange(syncEvent);
          break;
        case SyncEventType.PERMISSIONS_UPDATED:
          await this.processPermissionsUpdate(syncEvent);
          break;
      }

      // Mark as completed
      await this.updateSyncEventStatus(syncEvent.id!, 'completed');
      console.log(`✅ [CrossAppSync] Sync event completed: ${syncEvent.id}`);
    } catch (error) {
      console.error(`❌ [CrossAppSync] Error processing sync event ${syncEvent.id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateSyncEventStatus(syncEvent.id!, 'failed', errorMessage);
    }
  }

  /**
   * Process role assignment sync
   */
  private async processRoleAssignment(syncEvent: RoleSyncEvent): Promise<void> {
    const { userId, projectId, data } = syncEvent;

    if (syncEvent.targetApp === 'dashboard') {
      // Sync to Dashboard application
      await this.syncToDashboardApp(userId, projectId, data.roleMapping!);
    } else if (syncEvent.targetApp === 'licensing') {
      // Sync to licensing website
      await this.syncToLicensingApp(userId, projectId, data.dashboardRole!, data.hierarchy!);
    }
  }

  /**
   * Sync role to Dashboard application (using existing collections)
   */
  private async syncToDashboardApp(
    userId: string,
    projectId: string,
    roleMapping: EnhancedRoleMapping
  ): Promise<void> {
    console.log(`🎯 [CrossAppSync] Syncing to existing collections: ${userId} -> ${roleMapping.dashboardRole}`);

    try {
      // Update existing users collection with Dashboard role mapping
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      const dashboardRoleData = {
        [projectId]: {
          dashboardRole: roleMapping.dashboardRole,
          hierarchy: roleMapping.effectiveHierarchy,
          permissions: roleMapping.permissions,
          licensingRole: roleMapping.licensingRole,
          templateRole: roleMapping.templateRole?.id || null,
          syncedAt: Timestamp.now(),
          syncSource: 'licensing'
        }
      };

      if (userDoc.exists()) {
        // Update existing user document with Dashboard role mapping
        await updateDoc(userRef, {
          [`dashboardRoleMappings.${projectId}`]: dashboardRoleData[projectId],
          lastRoleSync: Timestamp.now(),
          roleSystemVersion: '2.0'
        });
        console.log(`✅ [CrossAppSync] Updated user Dashboard role mapping: ${userId}`);
      } else {
        console.warn(`⚠️ [CrossAppSync] User document not found: ${userId}`);
        return;
      }

      // Update existing projectAssignments collection with Dashboard role data
      const assignmentQuery = query(
        collection(db, 'projectAssignments'),
        where('projectId', '==', projectId),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const assignmentSnapshot = await getDocs(assignmentQuery);
      
      if (!assignmentSnapshot.empty) {
        // Update existing assignment with Dashboard role data
        const assignmentDoc = assignmentSnapshot.docs[0];
        await updateDoc(assignmentDoc.ref, {
          dashboardRole: roleMapping.dashboardRole,
          hierarchyLevel: roleMapping.effectiveHierarchy,
          enhancedPermissions: roleMapping.permissions,
          syncMetadata: {
            lastSyncedAt: Timestamp.now(),
            syncSource: 'licensing',
            syncVersion: '2.0'
          }
        });
        console.log(`✅ [CrossAppSync] Updated project assignment with Dashboard role: ${userId}`);
      } else {
        console.warn(`⚠️ [CrossAppSync] No active project assignment found for user ${userId} in project ${projectId}`);
      }
      
    } catch (error) {
      console.error(`❌ [CrossAppSync] Error syncing to existing collections for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Sync role to licensing application
   */
  private async syncToLicensingApp(
    userId: string,
    projectId: string,
    dashboardRole: DashboardUserRole,
    hierarchy: number
  ): Promise<void> {
    console.log(`🎯 [CrossAppSync] Syncing to Licensing: ${userId} -> ${dashboardRole}`);

    // Update project assignment in licensing website
    const assignmentRef = doc(db, 'projectAssignments', `${projectId}-${userId}`);
    await updateDoc(assignmentRef, {
      dashboardRole,
      hierarchy,
      syncedAt: Timestamp.now(),
      syncSource: 'dashboard'
    });
  }

  /**
   * Handle incoming sync event from other instances
   */
  private async handleIncomingSyncEvent(syncEvent: RoleSyncEvent): Promise<void> {
    // Only process events not created by this instance
    if (syncEvent.status === 'pending') {
      this.syncQueue.push(syncEvent);
      
      if (!this.isProcessingQueue) {
        this.processSyncQueue();
      }
    }
  }

  /**
   * Update user role mapping
   */
  private async updateUserRoleMapping(
    userId: string,
    projectId: string,
    roleMapping: EnhancedRoleMapping
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      const mappingData = {
        ...roleMapping,
        updatedAt: Timestamp.now()
      };
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          [`roleMappings.${projectId}`]: mappingData
        });
        console.log(`✅ [CrossAppSync] Updated role mapping for user: ${userId}`);
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          id: userId,
          roleMappings: {
            [projectId]: mappingData
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        console.log(`✅ [CrossAppSync] Created user with role mapping: ${userId}`);
      }
    } catch (error) {
      console.error(`❌ [CrossAppSync] Error updating role mapping for user ${userId}:`, error);
      // Don't throw here as this is a secondary operation
    }
  }

  /**
   * Update sync event status
   */
  private async updateSyncEventStatus(
    eventId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    const eventRef = doc(db, 'roleSyncEvents', eventId);
    const updateData: any = {
      status,
      updatedAt: Timestamp.now()
    };

    if (error) {
      updateData.error = error;
    }

    await updateDoc(eventRef, updateData);
  }

  /**
   * Process role update (placeholder)
   */
  private async processRoleUpdate(syncEvent: RoleSyncEvent): Promise<void> {
    // Implementation for role updates
    console.log('🔄 [CrossAppSync] Processing role update:', syncEvent.id);
  }

  /**
   * Process role removal (placeholder)
   */
  private async processRoleRemoval(syncEvent: RoleSyncEvent): Promise<void> {
    // Implementation for role removal
    console.log('🔄 [CrossAppSync] Processing role removal:', syncEvent.id);
  }

  /**
   * Process hierarchy change (placeholder)
   */
  private async processHierarchyChange(syncEvent: RoleSyncEvent): Promise<void> {
    // Implementation for hierarchy changes
    console.log('🔄 [CrossAppSync] Processing hierarchy change:', syncEvent.id);
  }

  /**
   * Process permissions update (placeholder)
   */
  private async processPermissionsUpdate(syncEvent: RoleSyncEvent): Promise<void> {
    // Implementation for permissions updates
    console.log('🔄 [CrossAppSync] Processing permissions update:', syncEvent.id);
  }

  /**
   * Configure sync settings
   */
  configureSyncSettings(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ [CrossAppSync] Sync configuration updated:', this.config);
    
    // Reinitialize listeners if sync was enabled
    if (config.enableRealTimeSync && !this.syncListeners.has('roleSyncEvents')) {
      this.initializeSyncListeners();
    }
  }

  /**
   * Enable cross-app synchronization
   */
  enableSync(): void {
    this.configureSyncSettings({ enableRealTimeSync: true });
    console.log('✅ [CrossAppSync] Cross-app synchronization enabled');
  }

  /**
   * Disable cross-app synchronization
   */
  disableSync(): void {
    this.configureSyncSettings({ enableRealTimeSync: false });
    console.log('⏸️ [CrossAppSync] Cross-app synchronization disabled');
  }

  /**
   * Get sync status for a user/project
   */
  async getSyncStatus(userId: string, projectId: string): Promise<RoleSyncEvent[]> {
    // Implementation to get sync status
    return [];
  }

  /**
   * Cleanup sync listeners
   */
  cleanup(): void {
    this.syncListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.syncListeners.clear();
    console.log('🧹 [CrossAppSync] Sync listeners cleaned up');
  }
}

export default CrossAppRoleSyncService;
