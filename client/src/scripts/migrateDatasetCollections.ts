/**
 * Dataset Collection Migration Script
 * 
 * Migrates existing datasets to include all available collections
 * and ensures compatibility with the Dashboard application.
 */

import { collection, doc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { datasetCollectionValidator } from '../services/DatasetCollectionValidator';

export interface MigrationResult {
    success: boolean;
    datasetsProcessed: number;
    datasetsUpdated: number;
    errors: string[];
    summary: {
        totalCollections: number;
        missingCollectionsAdded: number;
        invalidCollectionsRemoved: number;
    };
}

export class DatasetCollectionMigrator {
    private static instance: DatasetCollectionMigrator;

    public static getInstance(): DatasetCollectionMigrator {
        if (!DatasetCollectionMigrator.instance) {
            DatasetCollectionMigrator.instance = new DatasetCollectionMigrator();
        }
        return DatasetCollectionMigrator.instance;
    }

    /**
     * Migrate all datasets to include complete collection assignments
     */
    public async migrateAllDatasets(options: {
        dryRun?: boolean;
        forceUpdate?: boolean;
        organizationId?: string;
    } = {}): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: true,
            datasetsProcessed: 0,
            datasetsUpdated: 0,
            errors: [],
            summary: {
                totalCollections: 0,
                missingCollectionsAdded: 0,
                invalidCollectionsRemoved: 0
            }
        };

        try {
            console.log('🚀 [DatasetCollectionMigrator] Starting dataset collection migration...');
            
            // Get all datasets
            const datasetsQuery = options.organizationId 
                ? query(collection(db, 'datasets'), where('organizationId', '==', options.organizationId))
                : collection(db, 'datasets');
            
            const datasetsSnapshot = await getDocs(datasetsQuery);
            console.log(`📋 [DatasetCollectionMigrator] Found ${datasetsSnapshot.docs.length} datasets to process`);

            for (const datasetDoc of datasetsSnapshot.docs) {
                try {
                    result.datasetsProcessed++;
                    const datasetData = datasetDoc.data();
                    const datasetId = datasetDoc.id;
                    
                    console.log(`🔍 [DatasetCollectionMigrator] Processing dataset: ${datasetId} (${datasetData.name})`);
                    
                    // Get current collections
                    const currentCollections = datasetData.collections || 
                                            datasetData.collectionAssignment?.selectedCollections || 
                                            [];
                    
                    // Validate and sync collections
                    const validation = await datasetCollectionValidator.validateDatasetCollections(currentCollections);
                    
                    if (!validation.isValid || options.forceUpdate) {
                        console.log(`⚠️ [DatasetCollectionMigrator] Dataset ${datasetId} needs updates:`, {
                            missing: validation.missingCollections.length,
                            extra: validation.extraCollections.length
                        });
                        
                        if (!options.dryRun) {
                            // Sync collections
                            const syncedCollections = await datasetCollectionValidator.syncDatasetCollections(
                                currentCollections,
                                {
                                    addMissingCollections: true,
                                    removeExtraCollections: false // Don't remove extra collections to be safe
                                }
                            );
                            
                            // Update dataset document
                            const updateData = {
                                collections: syncedCollections,
                                collectionAssignment: {
                                    selectedCollections: syncedCollections,
                                    assignmentMode: 'EXCLUSIVE',
                                    priority: 1,
                                    routingEnabled: true,
                                    includeSubcollections: datasetData.collectionAssignment?.includeSubcollections || false,
                                    dataFilters: datasetData.collectionAssignment?.dataFilters || [],
                                    organizationScope: datasetData.collectionAssignment?.organizationScope !== false
                                },
                                updatedAt: new Date().toISOString(),
                                lastModifiedBy: 'dataset-collection-migrator',
                                totalCollections: syncedCollections.length
                            };
                            
                            await updateDoc(datasetDoc.ref, updateData);
                            
                            result.datasetsUpdated++;
                            result.summary.missingCollectionsAdded += validation.missingCollections.length;
                            result.summary.invalidCollectionsRemoved += validation.extraCollections.length;
                            
                            console.log(`✅ [DatasetCollectionMigrator] Updated dataset ${datasetId}: ${syncedCollections.length} collections`);
                        } else {
                            console.log(`🔍 [DatasetCollectionMigrator] DRY RUN - Would update dataset ${datasetId}`);
                        }
                    } else {
                        console.log(`✅ [DatasetCollectionMigrator] Dataset ${datasetId} is already up to date`);
                    }
                    
                } catch (error) {
                    const errorMsg = `Failed to process dataset ${datasetDoc.id}: ${error}`;
                    console.error(`❌ [DatasetCollectionMigrator] ${errorMsg}`);
                    result.errors.push(errorMsg);
                }
            }
            
            // Update project_datasets assignments
            await this.migrateProjectDatasetAssignments(options);
            
            console.log('🎉 [DatasetCollectionMigrator] Migration completed successfully!');
            console.log(`📊 [DatasetCollectionMigrator] Summary:`, result.summary);
            
        } catch (error) {
            const errorMsg = `Migration failed: ${error}`;
            console.error(`❌ [DatasetCollectionMigrator] ${errorMsg}`);
            result.errors.push(errorMsg);
            result.success = false;
        }

        return result;
    }

    /**
     * Migrate project_datasets assignments to include collection data
     */
    private async migrateProjectDatasetAssignments(options: {
        dryRun?: boolean;
        organizationId?: string;
    } = {}): Promise<void> {
        try {
            console.log('🔧 [DatasetCollectionMigrator] Migrating project_datasets assignments...');
            
            const projectDatasetsQuery = options.organizationId
                ? query(collection(db, 'project_datasets'), where('organizationId', '==', options.organizationId))
                : collection(db, 'project_datasets');
            
            const projectDatasetsSnapshot = await getDocs(projectDatasetsQuery);
            console.log(`📋 [DatasetCollectionMigrator] Found ${projectDatasetsSnapshot.docs.length} project_datasets to process`);

            for (const projectDatasetDoc of projectDatasetsSnapshot.docs) {
                try {
                    const projectDatasetData = projectDatasetDoc.data();
                    const datasetId = projectDatasetData.datasetId;
                    
                    // Get the corresponding dataset to get collections
                    const datasetDoc = await getDocs(query(collection(db, 'datasets'), where('id', '==', datasetId)));
                    if (datasetDoc.empty) {
                        console.warn(`⚠️ [DatasetCollectionMigrator] Dataset ${datasetId} not found for project assignment`);
                        continue;
                    }
                    
                    const datasetData = datasetDoc.docs[0].data();
                    const collections = datasetData.collections || datasetData.collectionAssignment?.selectedCollections || [];
                    
                    // Check if project_dataset needs updates
                    const needsUpdate = !projectDatasetData.assignedCollections || 
                                      projectDatasetData.assignedCollections.length !== collections.length;
                    
                    if (needsUpdate) {
                        console.log(`🔧 [DatasetCollectionMigrator] Updating project_dataset ${projectDatasetDoc.id}`);
                        
                        if (!options.dryRun) {
                            const updateData = {
                                assignedCollections: collections,
                                collectionAssignment: {
                                    selectedCollections: collections,
                                    assignmentMode: 'EXCLUSIVE',
                                    priority: 1,
                                    routingEnabled: true
                                },
                                updatedAt: new Date().toISOString(),
                                lastModifiedBy: 'dataset-collection-migrator',
                                totalCollections: collections.length
                            };
                            
                            await updateDoc(projectDatasetDoc.ref, updateData);
                            console.log(`✅ [DatasetCollectionMigrator] Updated project_dataset ${projectDatasetDoc.id}`);
                        } else {
                            console.log(`🔍 [DatasetCollectionMigrator] DRY RUN - Would update project_dataset ${projectDatasetDoc.id}`);
                        }
                    }
                    
                } catch (error) {
                    console.error(`❌ [DatasetCollectionMigrator] Failed to process project_dataset ${projectDatasetDoc.id}:`, error);
                }
            }
            
        } catch (error) {
            console.error('❌ [DatasetCollectionMigrator] Failed to migrate project_datasets:', error);
        }
    }

    /**
     * Validate all datasets and return a report
     */
    public async validateAllDatasets(): Promise<{
        totalDatasets: number;
        validDatasets: number;
        invalidDatasets: number;
        validationResults: Array<{
            datasetId: string;
            datasetName: string;
            isValid: boolean;
            missingCollections: string[];
            extraCollections: string[];
        }>;
    }> {
        const results = {
            totalDatasets: 0,
            validDatasets: 0,
            invalidDatasets: 0,
            validationResults: [] as any[]
        };

        try {
            const datasetsSnapshot = await getDocs(collection(db, 'datasets'));
            results.totalDatasets = datasetsSnapshot.docs.length;

            for (const datasetDoc of datasetsSnapshot.docs) {
                const datasetData = datasetDoc.data();
                const currentCollections = datasetData.collections || 
                                        datasetData.collectionAssignment?.selectedCollections || 
                                        [];
                
                const validation = await datasetCollectionValidator.validateDatasetCollections(currentCollections);
                
                results.validationResults.push({
                    datasetId: datasetDoc.id,
                    datasetName: datasetData.name,
                    isValid: validation.isValid,
                    missingCollections: validation.missingCollections,
                    extraCollections: validation.extraCollections
                });
                
                if (validation.isValid) {
                    results.validDatasets++;
                } else {
                    results.invalidDatasets++;
                }
            }
            
        } catch (error) {
            console.error('❌ [DatasetCollectionMigrator] Validation failed:', error);
        }

        return results;
    }
}

// Export singleton instance
export const datasetCollectionMigrator = DatasetCollectionMigrator.getInstance();
