/**
 * Dataset Collection Validator
 * 
 * Ensures dataset collection assignments are complete and up-to-date
 * with all available Firestore collections.
 */

import { ALL_DASHBOARD_COLLECTIONS } from '../constants/dashboardCollections';
import { DynamicCollectionDiscoveryService } from './DynamicCollectionDiscovery';

export interface CollectionValidationResult {
    isValid: boolean;
    missingCollections: string[];
    extraCollections: string[];
    totalCollections: number;
    expectedCollections: number;
    recommendations: string[];
}

export interface DatasetCollectionSyncOptions {
    forceUpdate?: boolean;
    addMissingCollections?: boolean;
    removeExtraCollections?: boolean;
    validateAgainstFirestore?: boolean;
}

export class DatasetCollectionValidator {
    private static instance: DatasetCollectionValidator;
    private dynamicDiscovery: DynamicCollectionDiscovery;
    private cachedCollections: string[] | null = null;
    private lastCacheUpdate: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.dynamicDiscovery = new DynamicCollectionDiscovery();
    }

    public static getInstance(): DatasetCollectionValidator {
        if (!DatasetCollectionValidator.instance) {
            DatasetCollectionValidator.instance = new DatasetCollectionValidator();
        }
        return DatasetCollectionValidator.instance;
    }

    /**
     * Get all available collections (with caching)
     */
    private async getAllAvailableCollections(): Promise<string[]> {
        const now = Date.now();
        
        // Return cached collections if still valid
        if (this.cachedCollections && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
            return this.cachedCollections;
        }

        try {
            // Try to get collections from dynamic discovery first
            const discoveryResult = await this.dynamicDiscovery.discoverCollections();
            if (discoveryResult.success && discoveryResult.collections.length > 0) {
                this.cachedCollections = discoveryResult.collections;
                this.lastCacheUpdate = now;
                console.log('🔍 [DatasetCollectionValidator] Using dynamic collections:', this.cachedCollections.length);
                return this.cachedCollections;
            }
        } catch (error) {
            console.warn('⚠️ [DatasetCollectionValidator] Dynamic discovery failed, using static collections:', error);
        }

        // Fallback to static collections
        this.cachedCollections = ALL_DASHBOARD_COLLECTIONS;
        this.lastCacheUpdate = now;
        console.log('🔍 [DatasetCollectionValidator] Using static collections:', this.cachedCollections.length);
        return this.cachedCollections;
    }

    /**
     * Validate dataset collection assignments
     */
    public async validateDatasetCollections(
        datasetCollections: string[],
        options: DatasetCollectionSyncOptions = {}
    ): Promise<CollectionValidationResult> {
        const allAvailableCollections = await this.getAllAvailableCollections();
        const expectedCollections = allAvailableCollections;
        
        const missingCollections = expectedCollections.filter(
            collection => !datasetCollections.includes(collection)
        );
        
        const extraCollections = datasetCollections.filter(
            collection => !expectedCollections.includes(collection)
        );

        const isValid = missingCollections.length === 0 && extraCollections.length === 0;
        
        const recommendations: string[] = [];
        
        if (missingCollections.length > 0) {
            recommendations.push(`Add ${missingCollections.length} missing collections: ${missingCollections.slice(0, 5).join(', ')}${missingCollections.length > 5 ? '...' : ''}`);
        }
        
        if (extraCollections.length > 0) {
            recommendations.push(`Remove ${extraCollections.length} invalid collections: ${extraCollections.slice(0, 5).join(', ')}${extraCollections.length > 5 ? '...' : ''}`);
        }

        if (datasetCollections.length < expectedCollections.length * 0.8) {
            recommendations.push('Consider using "Select All" to ensure complete data access');
        }

        return {
            isValid,
            missingCollections,
            extraCollections,
            totalCollections: datasetCollections.length,
            expectedCollections: expectedCollections.length,
            recommendations
        };
    }

    /**
     * Sync dataset collections to include all available collections
     */
    public async syncDatasetCollections(
        currentCollections: string[],
        options: DatasetCollectionSyncOptions = {}
    ): Promise<string[]> {
        const allAvailableCollections = await this.getAllAvailableCollections();
        
        let syncedCollections = [...currentCollections];

        if (options.addMissingCollections !== false) {
            // Add missing collections
            const missingCollections = allAvailableCollections.filter(
                collection => !currentCollections.includes(collection)
            );
            syncedCollections = [...syncedCollections, ...missingCollections];
            
            if (missingCollections.length > 0) {
                console.log('✅ [DatasetCollectionValidator] Added missing collections:', missingCollections.length);
            }
        }

        if (options.removeExtraCollections) {
            // Remove invalid collections
            const validCollections = syncedCollections.filter(
                collection => allAvailableCollections.includes(collection)
            );
            const removedCount = syncedCollections.length - validCollections.length;
            syncedCollections = validCollections;
            
            if (removedCount > 0) {
                console.log('✅ [DatasetCollectionValidator] Removed invalid collections:', removedCount);
            }
        }

        return syncedCollections;
    }

    /**
     * Get collection assignment recommendations for a dataset
     */
    public async getCollectionRecommendations(
        datasetType: 'ALL_DATA' | 'CUSTOM' | 'SPECIFIC' = 'ALL_DATA'
    ): Promise<string[]> {
        const allAvailableCollections = await this.getAllAvailableCollections();
        
        switch (datasetType) {
            case 'ALL_DATA':
                return allAvailableCollections;
            
            case 'CUSTOM':
                // Return a curated subset for custom datasets
                return allAvailableCollections.filter(collection => 
                    !['audit_logs', 'roleSyncEvents', 'datasetAssignments'].includes(collection)
                );
            
            case 'SPECIFIC':
                // Return core collections only
                return allAvailableCollections.filter(collection => 
                    ['users', 'projects', 'sessions', 'inventoryItems', 'organizations'].includes(collection)
                );
            
            default:
                return allAvailableCollections;
        }
    }

    /**
     * Check if a dataset needs collection synchronization
     */
    public async needsSync(datasetCollections: string[]): Promise<boolean> {
        const validation = await this.validateDatasetCollections(datasetCollections);
        return !validation.isValid;
    }

    /**
     * Get collection statistics
     */
    public async getCollectionStats(): Promise<{
        totalAvailable: number;
        totalAssigned: number;
        coveragePercentage: number;
        missingCount: number;
        extraCount: number;
    }> {
        const allAvailableCollections = await this.getAllAvailableCollections();
        return {
            totalAvailable: allAvailableCollections.length,
            totalAssigned: 0, // This would be passed from the dataset
            coveragePercentage: 0, // This would be calculated
            missingCount: 0, // This would be calculated
            extraCount: 0 // This would be calculated
        };
    }

    /**
     * Force refresh of collection cache
     */
    public async refreshCollectionCache(): Promise<void> {
        this.cachedCollections = null;
        this.lastCacheUpdate = 0;
        await this.getAllAvailableCollections();
        console.log('🔄 [DatasetCollectionValidator] Collection cache refreshed');
    }
}

// Export singleton instance
export const datasetCollectionValidator = DatasetCollectionValidator.getInstance();
