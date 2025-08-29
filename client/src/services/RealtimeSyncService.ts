import { db } from './firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';

interface SyncEvent {
  id: string;
  type: 'role_assignment' | 'project_assignment' | 'team_member_update' | 'permission_change';
  projectId: string;
  teamMemberId: string;
  data: any;
  timestamp: Date;
  syncedToDashboard: boolean;
}

interface RoleAssignmentData {
  teamMemberId: string;
  projectId: string;
  baseRole: 'ADMIN' | 'DO_ER' | 'GUEST';
  productionRoles: string[];
  permissions?: any;
  updatedBy: string;
  updatedAt: Date;
}

type SyncEventCallback = (event: SyncEvent) => void;
type RoleUpdateCallback = (data: RoleAssignmentData) => void;

class RealtimeSyncService {
  private listeners: Map<string, () => void> = new Map();
  private eventCallbacks: Set<SyncEventCallback> = new Set();
  private roleUpdateCallbacks: Set<RoleUpdateCallback> = new Set();

  /**
   * Start listening for real-time sync events
   */
  startSync(organizationId: string): void {
    console.log('🔄 [REALTIME SYNC] Starting sync for organization:', organizationId);
    
    // Listen for project assignment changes
    this.listenToProjectAssignments(organizationId);
    
    // Listen for sync events
    this.listenToSyncEvents(organizationId);
    
    // Listen for team member updates
    this.listenToTeamMemberUpdates(organizationId);
  }

  /**
   * Stop all real-time listeners
   */
  stopSync(): void {
    console.log('🛑 [REALTIME SYNC] Stopping all sync listeners');
    
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  /**
   * Listen for project assignment changes
   */
  private listenToProjectAssignments(organizationId: string): void {
    const assignmentsRef = collection(db, 'projectAssignments');
    const q = query(
      assignmentsRef,
      where('organizationId', '==', organizationId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const assignmentData: RoleAssignmentData = {
          teamMemberId: data.teamMemberId,
          projectId: data.projectId,
          baseRole: data.baseRole,
          productionRoles: data.productionRoles || [],
          permissions: data.permissions,
          updatedBy: data.updatedBy,
          updatedAt: data.updatedAt?.toDate() || new Date()
        };

        if (change.type === 'added' || change.type === 'modified') {
          console.log('📝 [REALTIME SYNC] Project assignment updated:', assignmentData);
          this.notifyRoleUpdate(assignmentData);
          this.createSyncEvent('role_assignment', assignmentData);
        }
      });
    });

    this.listeners.set('projectAssignments', unsubscribe);
  }

  /**
   * Listen for sync events
   */
  private listenToSyncEvents(organizationId: string): void {
    const eventsRef = collection(db, 'syncEvents');
    const q = query(
      eventsRef,
      where('organizationId', '==', organizationId),
      where('syncedToDashboard', '==', false),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const syncEvent: SyncEvent = {
            id: change.doc.id,
            type: data.type,
            projectId: data.projectId,
            teamMemberId: data.teamMemberId,
            data: data.data,
            timestamp: data.timestamp?.toDate() || new Date(),
            syncedToDashboard: data.syncedToDashboard
          };

          console.log('🔔 [REALTIME SYNC] New sync event:', syncEvent);
          this.notifyEventCallbacks(syncEvent);
          this.processSyncEvent(syncEvent);
        }
      });
    });

    this.listeners.set('syncEvents', unsubscribe);
  }

  /**
   * Listen for team member updates
   */
  private listenToTeamMemberUpdates(organizationId: string): void {
    const teamMembersRef = collection(db, 'orgMembers');
    const q = query(
      teamMembersRef,
      where('orgId', '==', organizationId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        
        if (change.type === 'modified') {
          console.log('👤 [REALTIME SYNC] Team member updated:', data);
          this.createSyncEvent('team_member_update', {
            teamMemberId: change.doc.id,
            projectId: 'all', // Affects all projects
            memberData: data
          });
        }
      });
    });

    this.listeners.set('teamMembers', unsubscribe);
  }

  /**
   * Create a sync event
   */
  private async createSyncEvent(
    type: SyncEvent['type'], 
    data: RoleAssignmentData | any
  ): Promise<void> {
    try {
      const syncEvent = {
        type,
        projectId: data.projectId || 'unknown',
        teamMemberId: data.teamMemberId || 'unknown',
        organizationId: data.organizationId || 'unknown',
        data,
        timestamp: Timestamp.now(),
        syncedToDashboard: false,
        createdBy: 'licensing-website'
      };

      await addDoc(collection(db, 'syncEvents'), syncEvent);
      console.log('✅ [REALTIME SYNC] Sync event created:', type);
    } catch (error) {
      console.error('❌ [REALTIME SYNC] Failed to create sync event:', error);
    }
  }

  /**
   * Process sync event (sync to Dashboard)
   */
  private async processSyncEvent(event: SyncEvent): Promise<void> {
    try {
      console.log('🔄 [REALTIME SYNC] Processing sync event:', event.type);
      
      // Send to Dashboard via API or direct Firestore update
      await this.syncToDashboard(event);
      
      // Mark as synced
      await this.markEventAsSynced(event.id);
      
    } catch (error) {
      console.error('❌ [REALTIME SYNC] Failed to process sync event:', error);
    }
  }

  /**
   * Sync event to Dashboard
   */
  private async syncToDashboard(event: SyncEvent): Promise<void> {
    try {
      // Update Dashboard collections directly via Firestore
      switch (event.type) {
        case 'role_assignment':
          await this.syncRoleAssignment(event);
          break;
        case 'project_assignment':
          await this.syncProjectAssignment(event);
          break;
        case 'team_member_update':
          await this.syncTeamMemberUpdate(event);
          break;
        case 'permission_change':
          await this.syncPermissionChange(event);
          break;
      }
      
      console.log('✅ [REALTIME SYNC] Successfully synced to Dashboard:', event.type);
    } catch (error) {
      console.error('❌ [REALTIME SYNC] Failed to sync to Dashboard:', error);
      throw error;
    }
  }

  /**
   * Sync role assignment to Dashboard
   */
  private async syncRoleAssignment(event: SyncEvent): Promise<void> {
    const { teamMemberId, projectId, baseRole, productionRoles } = event.data;
    
    // Update Dashboard user document with new roles
    const userRef = doc(db, 'users', teamMemberId);
    await updateDoc(userRef, {
      [`projectRoles.${projectId}`]: {
        baseRole,
        productionRoles,
        updatedAt: Timestamp.now(),
        syncedFromLicensing: true
      }
    });

    // Update project team members collection
    const projectTeamRef = doc(db, 'projects', projectId, 'teamMembers', teamMemberId);
    await updateDoc(projectTeamRef, {
      baseRole,
      productionRoles,
      updatedAt: Timestamp.now(),
      syncedFromLicensing: true
    });
  }

  /**
   * Sync project assignment to Dashboard
   */
  private async syncProjectAssignment(event: SyncEvent): Promise<void> {
    const { teamMemberId, projectId, isActive } = event.data;
    
    if (isActive) {
      // Add team member to Dashboard project
      const projectTeamRef = doc(db, 'projects', projectId, 'teamMembers', teamMemberId);
      await updateDoc(projectTeamRef, {
        addedAt: Timestamp.now(),
        syncedFromLicensing: true,
        isActive: true
      });
    } else {
      // Remove team member from Dashboard project
      const projectTeamRef = doc(db, 'projects', projectId, 'teamMembers', teamMemberId);
      await deleteDoc(projectTeamRef);
    }
  }

  /**
   * Sync team member update to Dashboard
   */
  private async syncTeamMemberUpdate(event: SyncEvent): Promise<void> {
    const { teamMemberId, memberData } = event.data;
    
    // Update Dashboard user document
    const userRef = doc(db, 'users', teamMemberId);
    await updateDoc(userRef, {
      name: memberData.name,
      email: memberData.email,
      status: memberData.status,
      updatedAt: Timestamp.now(),
      syncedFromLicensing: true
    });
  }

  /**
   * Sync permission change to Dashboard
   */
  private async syncPermissionChange(event: SyncEvent): Promise<void> {
    const { teamMemberId, projectId, permissions } = event.data;
    
    // Update Dashboard user permissions
    const userRef = doc(db, 'users', teamMemberId);
    await updateDoc(userRef, {
      [`permissions.${projectId}`]: permissions,
      updatedAt: Timestamp.now(),
      syncedFromLicensing: true
    });
  }

  /**
   * Mark sync event as processed
   */
  private async markEventAsSynced(eventId: string): Promise<void> {
    try {
      const eventRef = doc(db, 'syncEvents', eventId);
      await updateDoc(eventRef, {
        syncedToDashboard: true,
        syncedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('❌ [REALTIME SYNC] Failed to mark event as synced:', error);
    }
  }

  /**
   * Subscribe to sync events
   */
  onSyncEvent(callback: SyncEventCallback): () => void {
    this.eventCallbacks.add(callback);
    return () => {
      this.eventCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to role updates
   */
  onRoleUpdate(callback: RoleUpdateCallback): () => void {
    this.roleUpdateCallbacks.add(callback);
    return () => {
      this.roleUpdateCallbacks.delete(callback);
    };
  }

  /**
   * Notify event callbacks
   */
  private notifyEventCallbacks(event: SyncEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ [REALTIME SYNC] Error in event callback:', error);
      }
    });
  }

  /**
   * Notify role update callbacks
   */
  private notifyRoleUpdate(data: RoleAssignmentData): void {
    this.roleUpdateCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ [REALTIME SYNC] Error in role update callback:', error);
      }
    });
  }

  /**
   * Manually trigger sync for a specific project
   */
  async triggerProjectSync(projectId: string): Promise<void> {
    try {
      console.log('🔄 [REALTIME SYNC] Triggering manual sync for project:', projectId);
      
      // Get all project assignments
      const assignmentsRef = collection(db, 'projectAssignments');
      const q = query(assignmentsRef, where('projectId', '==', projectId));
      
      const snapshot = await new Promise<QuerySnapshot<DocumentData>>((resolve, reject) => {
        const unsubscribe = onSnapshot(q, resolve, reject);
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Timeout'));
        }, 5000);
      });
      
      // Create sync events for all assignments
      for (const doc of snapshot.docs) {
        const data = doc.data();
        await this.createSyncEvent('role_assignment', {
          teamMemberId: data.teamMemberId,
          projectId: data.projectId,
          baseRole: data.baseRole,
          productionRoles: data.productionRoles || [],
          updatedBy: 'manual-sync',
          updatedAt: new Date()
        });
      }
      
      console.log('✅ [REALTIME SYNC] Manual sync completed for project:', projectId);
    } catch (error) {
      console.error('❌ [REALTIME SYNC] Manual sync failed:', error);
      throw error;
    }
  }

  /**
   * Get sync status for organization
   */
  async getSyncStatus(organizationId: string): Promise<{
    totalEvents: number;
    pendingEvents: number;
    lastSyncTime: Date | null;
  }> {
    try {
      const eventsRef = collection(db, 'syncEvents');
      const allEventsQuery = query(eventsRef, where('organizationId', '==', organizationId));
      const pendingEventsQuery = query(
        eventsRef, 
        where('organizationId', '==', organizationId),
        where('syncedToDashboard', '==', false)
      );
      
      const [allSnapshot, pendingSnapshot] = await Promise.all([
        new Promise<QuerySnapshot<DocumentData>>((resolve, reject) => {
          const unsubscribe = onSnapshot(allEventsQuery, resolve, reject);
          setTimeout(() => {
            unsubscribe();
            reject(new Error('Timeout'));
          }, 5000);
        }),
        new Promise<QuerySnapshot<DocumentData>>((resolve, reject) => {
          const unsubscribe = onSnapshot(pendingEventsQuery, resolve, reject);
          setTimeout(() => {
            unsubscribe();
            reject(new Error('Timeout'));
          }, 5000);
        })
      ]);
      
      // Get last sync time
      let lastSyncTime: Date | null = null;
      if (!allSnapshot.empty) {
        const sortedDocs = allSnapshot.docs
          .filter(doc => doc.data().syncedToDashboard)
          .sort((a, b) => b.data().syncedAt?.seconds - a.data().syncedAt?.seconds);
        
        if (sortedDocs.length > 0) {
          lastSyncTime = sortedDocs[0].data().syncedAt?.toDate() || null;
        }
      }
      
      return {
        totalEvents: allSnapshot.size,
        pendingEvents: pendingSnapshot.size,
        lastSyncTime
      };
    } catch (error) {
      console.error('❌ [REALTIME SYNC] Failed to get sync status:', error);
      return {
        totalEvents: 0,
        pendingEvents: 0,
        lastSyncTime: null
      };
    }
  }
}

export const realtimeSyncService = new RealtimeSyncService();
export default realtimeSyncService;
