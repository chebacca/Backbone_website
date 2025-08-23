/**
 * Sync Service
 * 
 * Handles synchronization of offline data with Firestore when online.
 */

import { offlineStorageManager, OfflineProject, SyncQueueItem } from './OfflineStorageManager';
import { isOnline, registerNetworkListeners, testNetworkConnectivity } from '../utils/NetworkUtils';
import { cloudProjectIntegration } from './CloudProjectIntegration';

export class SyncService {
  private static instance: SyncService;
  private syncInProgress = false;
  private networkListenerCleanup: (() => void) | null = null;
  private syncInterval: number | null = null;
  
  private constructor() {
    this.setupNetworkListeners();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Set up network listeners to trigger sync when online
   */
  private setupNetworkListeners(): void {
    // Clean up existing listeners if any
    if (this.networkListenerCleanup) {
      this.networkListenerCleanup();
    }

    // Register new listeners
    this.networkListenerCleanup = registerNetworkListeners(
      // onOnline
      () => {
        console.log('🌐 Network connection restored - starting sync');
        this.startSync();
      },
      // onOffline
      () => {
        console.log('📴 Network connection lost - pausing sync');
        this.pauseSync();
      }
    );
  }

  /**
   * Start periodic sync
   */
  public startSync(immediate = true): void {
    // Clear any existing interval
    this.pauseSync();
    
    // Start immediate sync if requested
    if (immediate) {
      this.syncOfflineData();
    }
    
    // Set up periodic sync (every 5 minutes)
    this.syncInterval = window.setInterval(() => {
      this.syncOfflineData();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Pause sync
   */
  public pauseSync(): void {
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync offline data with Firestore
   */
  public async syncOfflineData(): Promise<void> {
    // Avoid concurrent syncs
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress, skipping');
      return;
    }

    // Check network connectivity
    if (!isOnline()) {
      console.log('📴 Device is offline, skipping sync');
      return;
    }

    try {
      this.syncInProgress = true;
      
      // Test actual network connectivity (more reliable than navigator.onLine)
      const isConnected = await testNetworkConnectivity();
      if (!isConnected) {
        console.log('📴 Network connectivity test failed, skipping sync');
        return;
      }

      console.log('🔄 Starting offline data sync');
      
      // Sync pending projects
      await this.syncPendingProjects();
      
      // Sync queue items
      await this.processSyncQueue();
      
      console.log('✅ Offline data sync completed');
    } catch (error) {
      console.error('❌ Error during offline data sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync pending projects
   */
  private async syncPendingProjects(): Promise<void> {
    try {
      // Get pending projects
      const pendingProjects = await offlineStorageManager.getPendingSyncProjects();
      
      if (pendingProjects.length === 0) {
        console.log('✅ No pending projects to sync');
        return;
      }
      
      console.log(`🔄 Syncing ${pendingProjects.length} pending projects`);
      
      // Process each project
      for (const project of pendingProjects) {
        try {
          // Create project in Firestore
          const cloudProject = await cloudProjectIntegration.createCloudProjectInFirestore(
            project.originalOptions
          );
          
          // Mark project as synced
          if (cloudProject && cloudProject.id) {
            await offlineStorageManager.markProjectSynced(project.id, cloudProject.id);
            console.log(`✅ Project synced: ${project.id} -> ${cloudProject.id}`);
          } else {
            console.warn(`⚠️ Project sync failed: ${project.id} - no valid cloud project ID returned`);
          }
        } catch (error) {
          console.error(`❌ Failed to sync project ${project.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error syncing pending projects:', error);
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    try {
      // Get sync queue
      const queue = await offlineStorageManager.getSyncQueue();
      
      if (queue.length === 0) {
        console.log('✅ No items in sync queue');
        return;
      }
      
      console.log(`🔄 Processing ${queue.length} items in sync queue`);
      
      // Process each item
      for (const item of queue) {
        try {
          await this.processSyncQueueItem(item);
          
          // Remove from queue on success
          await offlineStorageManager.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`❌ Failed to process sync queue item ${item.id}:`, error);
          
          // Update attempt count
          await offlineStorageManager.updateSyncAttempt(item.id);
        }
      }
    } catch (error) {
      console.error('❌ Error processing sync queue:', error);
    }
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncQueueItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'project_create':
        await cloudProjectIntegration.createCloudProjectInFirestore(item.data);
        break;
      case 'project_update':
        await cloudProjectIntegration.updateProjectInFirestore(item.data.id, item.data.updates);
        break;
      case 'project_delete':
        await cloudProjectIntegration.archiveProjectInFirestore(item.data.id);
        break;
      default:
        throw new Error(`Unknown sync queue item type: ${(item as any).type}`);
    }
  }

  /**
   * Force immediate sync
   */
  public async forceSyncNow(): Promise<boolean> {
    if (!isOnline()) {
      console.log('📴 Device is offline, cannot force sync');
      return false;
    }
    
    try {
      await this.syncOfflineData();
      return true;
    } catch (error) {
      console.error('❌ Error during forced sync:', error);
      return false;
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.pauseSync();
    
    if (this.networkListenerCleanup) {
      this.networkListenerCleanup();
      this.networkListenerCleanup = null;
    }
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();

// Start sync service when imported
syncService.startSync(false);

export default syncService;