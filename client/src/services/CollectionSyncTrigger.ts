/**
 * Collection Sync Trigger Service
 * 
 * This service provides utilities to trigger collection metadata sync
 * when collections are created or deleted in the application.
 * 
 * Usage:
 * - Call triggerCollectionSync() after creating or deleting collections
 * - The sync will update the metadata that Firestore listeners monitor
 * - UI will update automatically via real-time listeners
 */

import { dynamicCollectionDiscovery } from './DynamicCollectionDiscovery';
import { authService } from './authService';

class CollectionSyncTriggerService {
    private static instance: CollectionSyncTriggerService;
    private syncInProgress = false;
    private pendingSync = false;

    public static getInstance(): CollectionSyncTriggerService {
        if (!CollectionSyncTriggerService.instance) {
            CollectionSyncTriggerService.instance = new CollectionSyncTriggerService();
        }
        return CollectionSyncTriggerService.instance;
    }

    /**
     * Trigger collection metadata sync
     * This should be called whenever collections are created or deleted
     */
    public async triggerCollectionSync(reason?: string): Promise<void> {
        const logReason = reason ? ` (${reason})` : '';
        console.log(`🔄 [CollectionSyncTrigger] Triggering collection sync${logReason}...`);

        // If sync is already in progress, mark that we need another sync
        if (this.syncInProgress) {
            console.log('⏳ [CollectionSyncTrigger] Sync already in progress, marking for retry...');
            this.pendingSync = true;
            return;
        }

        try {
            this.syncInProgress = true;
            const authToken = authService.getStoredToken() || undefined;
            
            if (!authToken) {
                console.warn('⚠️ [CollectionSyncTrigger] No auth token available for sync');
                return;
            }

            await dynamicCollectionDiscovery.triggerSync(authToken);
            console.log(`✅ [CollectionSyncTrigger] Collection sync completed${logReason}`);

            // If there was a pending sync request, execute it
            if (this.pendingSync) {
                this.pendingSync = false;
                console.log('🔄 [CollectionSyncTrigger] Executing pending sync...');
                // Use setTimeout to avoid recursion issues
                setTimeout(() => this.triggerCollectionSync('pending sync'), 100);
            }

        } catch (error) {
            console.error(`❌ [CollectionSyncTrigger] Collection sync failed${logReason}:`, error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Trigger sync after collection creation
     */
    public async onCollectionCreated(collectionName: string): Promise<void> {
        console.log(`📝 [CollectionSyncTrigger] Collection created: ${collectionName}`);
        await this.triggerCollectionSync(`collection created: ${collectionName}`);
    }

    /**
     * Trigger sync after collection deletion
     */
    public async onCollectionDeleted(collectionName: string): Promise<void> {
        console.log(`🗑️ [CollectionSyncTrigger] Collection deleted: ${collectionName}`);
        await this.triggerCollectionSync(`collection deleted: ${collectionName}`);
    }

    /**
     * Trigger sync after bulk collection operations
     */
    public async onBulkCollectionOperation(operation: string, count: number): Promise<void> {
        console.log(`📦 [CollectionSyncTrigger] Bulk operation: ${operation} (${count} collections)`);
        await this.triggerCollectionSync(`bulk operation: ${operation}`);
    }

    /**
     * Check if sync is currently in progress
     */
    public isSyncInProgress(): boolean {
        return this.syncInProgress;
    }
}

// Export singleton instance
export const collectionSyncTrigger = CollectionSyncTriggerService.getInstance();

// Export convenience functions
export const triggerCollectionSync = (reason?: string) => 
    collectionSyncTrigger.triggerCollectionSync(reason);

export const onCollectionCreated = (collectionName: string) => 
    collectionSyncTrigger.onCollectionCreated(collectionName);

export const onCollectionDeleted = (collectionName: string) => 
    collectionSyncTrigger.onCollectionDeleted(collectionName);

export const onBulkCollectionOperation = (operation: string, count: number) => 
    collectionSyncTrigger.onBulkCollectionOperation(operation, count);
