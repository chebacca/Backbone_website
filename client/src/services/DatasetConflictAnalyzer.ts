/**
 * Dataset Conflict Analyzer Service
 * 
 * Provides intelligent analysis of dataset collection assignments to detect:
 * - Collection overlaps between datasets
 * - Potential data conflicts and redundancy
 * - Schema compatibility issues
 * - Organization-wide dataset insights
 * 
 * Follows MPC library patterns for conflict detection and resolution.
 */

import { CloudDataset } from './CloudProjectIntegration';
import { COLLECTIONS } from './FirestoreCollectionManager';

export interface CollectionOverlap {
    collection: string;
    datasets: Array<{
        id: string;
        name: string;
        visibility: string;
        organizationScope: boolean;
        filters?: Array<{
            field: string;
            operator: string;
            value: any;
        }>;
    }>;
    conflictLevel: 'none' | 'low' | 'medium' | 'high';
    conflictReasons: string[];
    recommendations: string[];
}

export interface DatasetConflictAnalysis {
    organizationId: string;
    totalDatasets: number;
    totalCollections: number;
    overlaps: CollectionOverlap[];
    globalInsights: {
        mostUsedCollections: Array<{ collection: string; count: number; datasets: string[] }>;
        redundantAssignments: Array<{ collection: string; reason: string; affectedDatasets: string[] }>;
        schemaConflicts: Array<{ collection: string; issue: string; datasets: string[] }>;
        recommendations: string[];
    };
    healthScore: number; // 0-100, higher is better
}

export interface DatasetCreationConflictCheck {
    hasConflicts: boolean;
    warnings: Array<{
        type: 'overlap' | 'redundancy' | 'schema' | 'performance';
        severity: 'info' | 'warning' | 'error';
        message: string;
        affectedCollections: string[];
        affectedDatasets: string[];
        recommendation: string;
    }>;
    suggestions: Array<{
        type: 'merge' | 'filter' | 'rename' | 'split';
        message: string;
        collections: string[];
    }>;
}

export class DatasetConflictAnalyzer {
    private static instance: DatasetConflictAnalyzer;
    
    public static getInstance(): DatasetConflictAnalyzer {
        if (!DatasetConflictAnalyzer.instance) {
            DatasetConflictAnalyzer.instance = new DatasetConflictAnalyzer();
        }
        return DatasetConflictAnalyzer.instance;
    }

    /**
     * Analyze all datasets in an organization for conflicts and overlaps
     */
    public async analyzeOrganizationDatasets(organizationId: string, datasets: CloudDataset[]): Promise<DatasetConflictAnalysis> {
        console.log('🔍 [DatasetConflictAnalyzer] Analyzing datasets for organization:', organizationId);
        
        // Filter datasets with collection assignments
        const datasetsWithCollections = datasets.filter(ds => 
            ds.storage?.backend === 'firestore' && 
            ds.collectionAssignment?.selectedCollections?.length > 0
        );

        // Build collection usage map
        const collectionUsage = this.buildCollectionUsageMap(datasetsWithCollections);
        
        // Detect overlaps
        const overlaps = this.detectCollectionOverlaps(collectionUsage, datasetsWithCollections);
        
        // Generate global insights
        const globalInsights = this.generateGlobalInsights(collectionUsage, datasetsWithCollections);
        
        // Calculate health score
        const healthScore = this.calculateHealthScore(overlaps, globalInsights);

        const analysis: DatasetConflictAnalysis = {
            organizationId,
            totalDatasets: datasetsWithCollections.length,
            totalCollections: Object.keys(collectionUsage).length,
            overlaps,
            globalInsights,
            healthScore
        };

        console.log('✅ [DatasetConflictAnalyzer] Analysis complete:', {
            datasets: analysis.totalDatasets,
            overlaps: analysis.overlaps.length,
            healthScore: analysis.healthScore
        });

        return analysis;
    }

    /**
     * Check for conflicts when creating a new dataset
     */
    public async checkDatasetCreationConflicts(
        newDatasetConfig: {
            name: string;
            collectionAssignment?: {
                selectedCollections: string[];
                organizationScope?: boolean;
                dataFilters?: Array<{
                    collection: string;
                    field: string;
                    operator: string;
                    value: any;
                }>;
            };
        },
        existingDatasets: CloudDataset[]
    ): Promise<DatasetCreationConflictCheck> {
        console.log('🔍 [DatasetConflictAnalyzer] Checking conflicts for new dataset:', newDatasetConfig.name);

        const warnings: DatasetCreationConflictCheck['warnings'] = [];
        const suggestions: DatasetCreationConflictCheck['suggestions'] = [];

        if (!newDatasetConfig.collectionAssignment?.selectedCollections?.length) {
            return { hasConflicts: false, warnings: [], suggestions: [] };
        }

        const newCollections = newDatasetConfig.collectionAssignment.selectedCollections;
        
        // Check for collection overlaps
        for (const collection of newCollections) {
            const existingUsage = existingDatasets.filter(ds => 
                ds.collectionAssignment?.selectedCollections?.includes(collection)
            );

            if (existingUsage.length > 0) {
                const conflictLevel = this.assessConflictLevel(collection, existingUsage, newDatasetConfig);
                
                if (conflictLevel !== 'none') {
                    warnings.push({
                        type: 'overlap',
                        severity: conflictLevel === 'high' ? 'error' : conflictLevel === 'medium' ? 'warning' : 'info',
                        message: `Collection "${collection}" is already used by ${existingUsage.length} other dataset(s)`,
                        affectedCollections: [collection],
                        affectedDatasets: existingUsage.map(ds => ds.name),
                        recommendation: this.getConflictRecommendation(collection, existingUsage, newDatasetConfig)
                    });
                }

                // Generate suggestions for conflict resolution
                if (conflictLevel === 'high') {
                    suggestions.push({
                        type: 'filter',
                        message: `Consider adding data filters to differentiate from existing datasets`,
                        collections: [collection]
                    });
                } else if (existingUsage.length >= 3) {
                    suggestions.push({
                        type: 'merge',
                        message: `Collection "${collection}" is heavily used. Consider merging with existing dataset "${existingUsage[0].name}"`,
                        collections: [collection]
                    });
                }
            }
        }

        // Check for redundancy patterns
        const redundancyCheck = this.checkRedundancyPatterns(newCollections, existingDatasets);
        warnings.push(...redundancyCheck.warnings);
        suggestions.push(...redundancyCheck.suggestions);

        // Check for performance implications
        const performanceCheck = this.checkPerformanceImplications(newCollections, existingDatasets);
        warnings.push(...performanceCheck);

        return {
            hasConflicts: warnings.some(w => w.severity === 'error'),
            warnings,
            suggestions
        };
    }

    /**
     * Get recommendations for resolving dataset conflicts
     */
    public getConflictResolutionRecommendations(analysis: DatasetConflictAnalysis): Array<{
        type: 'merge' | 'split' | 'filter' | 'reorganize';
        priority: 'high' | 'medium' | 'low';
        title: string;
        description: string;
        affectedDatasets: string[];
        estimatedImpact: string;
        steps: string[];
    }> {
        const recommendations = [];

        // High-conflict overlaps
        const highConflictOverlaps = analysis.overlaps.filter(o => o.conflictLevel === 'high');
        for (const overlap of highConflictOverlaps) {
            recommendations.push({
                type: 'merge' as const,
                priority: 'high' as const,
                title: `Merge datasets using "${overlap.collection}"`,
                description: `Collection "${overlap.collection}" is used by ${overlap.datasets.length} datasets with high conflict potential`,
                affectedDatasets: overlap.datasets.map(d => d.name),
                estimatedImpact: 'Reduces data redundancy and improves query performance',
                steps: [
                    'Review data usage patterns for each dataset',
                    'Identify common use cases and data access patterns',
                    'Create a unified dataset with appropriate data filters',
                    'Migrate existing queries to use the new unified dataset'
                ]
            });
        }

        // Redundant assignments
        for (const redundant of analysis.globalInsights.redundantAssignments) {
            recommendations.push({
                type: 'filter' as const,
                priority: 'medium' as const,
                title: `Add data filters for "${redundant.collection}"`,
                description: redundant.reason,
                affectedDatasets: redundant.affectedDatasets,
                estimatedImpact: 'Improves data organization and reduces confusion',
                steps: [
                    'Analyze data access patterns for each dataset',
                    'Define specific filter criteria for each use case',
                    'Update dataset configurations with appropriate filters',
                    'Test data access to ensure proper isolation'
                ]
            });
        }

        // Performance optimizations
        if (analysis.globalInsights.mostUsedCollections.length > 0) {
            const topCollection = analysis.globalInsights.mostUsedCollections[0];
            if (topCollection.count > 3) {
                recommendations.push({
                    type: 'reorganize' as const,
                    priority: 'low' as const,
                    title: `Optimize "${topCollection.collection}" usage`,
                    description: `This collection is used by ${topCollection.count} datasets, consider optimization`,
                    affectedDatasets: topCollection.datasets,
                    estimatedImpact: 'Improves query performance and reduces resource usage',
                    steps: [
                        'Review query patterns for this collection',
                        'Consider creating specialized views or indexes',
                        'Implement caching strategies for frequently accessed data',
                        'Monitor performance improvements'
                    ]
                });
            }
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * Build a map of collection usage across datasets
     */
    private buildCollectionUsageMap(datasets: CloudDataset[]): Record<string, CloudDataset[]> {
        const usage: Record<string, CloudDataset[]> = {};

        for (const dataset of datasets) {
            if (dataset.collectionAssignment?.selectedCollections) {
                for (const collection of dataset.collectionAssignment.selectedCollections) {
                    if (!usage[collection]) {
                        usage[collection] = [];
                    }
                    usage[collection].push(dataset);
                }
            }
        }

        return usage;
    }

    /**
     * Detect overlaps between datasets for each collection
     */
    private detectCollectionOverlaps(
        collectionUsage: Record<string, CloudDataset[]>, 
        datasets: CloudDataset[]
    ): CollectionOverlap[] {
        const overlaps: CollectionOverlap[] = [];

        for (const [collection, usageDatasets] of Object.entries(collectionUsage)) {
            if (usageDatasets.length > 1) {
                const conflictLevel = this.assessOverlapConflictLevel(collection, usageDatasets);
                const conflictReasons = this.getConflictReasons(collection, usageDatasets);
                const recommendations = this.getOverlapRecommendations(collection, usageDatasets);

                overlaps.push({
                    collection,
                    datasets: usageDatasets.map(ds => ({
                        id: ds.id,
                        name: ds.name,
                        visibility: ds.visibility || 'private',
                        organizationScope: ds.collectionAssignment?.organizationScope !== false,
                        filters: ds.collectionAssignment?.dataFilters?.filter((f: any) => f.collection === collection)
                    })),
                    conflictLevel,
                    conflictReasons,
                    recommendations
                });
            }
        }

        return overlaps.sort((a, b) => {
            const levelOrder = { high: 4, medium: 3, low: 2, none: 1 };
            return levelOrder[b.conflictLevel] - levelOrder[a.conflictLevel];
        });
    }

    /**
     * Generate global insights about dataset organization
     */
    private generateGlobalInsights(
        collectionUsage: Record<string, CloudDataset[]>, 
        datasets: CloudDataset[]
    ) {
        // Most used collections
        const mostUsedCollections = Object.entries(collectionUsage)
            .map(([collection, datasets]) => ({
                collection,
                count: datasets.length,
                datasets: datasets.map(ds => ds.name)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Redundant assignments (collections used by multiple datasets without filters)
        const redundantAssignments = Object.entries(collectionUsage)
            .filter(([_, datasets]) => datasets.length > 1)
            .map(([collection, datasets]) => {
                const hasFilters = datasets.some(ds => 
                    ds.collectionAssignment?.dataFilters?.some((f: any) => f.collection === collection)
                );
                
                if (!hasFilters) {
                    return {
                        collection,
                        reason: `Used by ${datasets.length} datasets without data filters - potential redundancy`,
                        affectedDatasets: datasets.map(ds => ds.name)
                    };
                }
                return null;
            })
            .filter(Boolean) as Array<{
                collection: string;
                reason: string;
                affectedDatasets: string[];
            }>;

        // Schema conflicts (placeholder - would need actual schema analysis)
        const schemaConflicts: Array<{ collection: string; issue: string; datasets: string[] }> = [];

        // Global recommendations
        const recommendations = [];
        if (redundantAssignments.length > 0) {
            recommendations.push('Consider adding data filters to datasets with overlapping collections');
        }
        if (mostUsedCollections[0]?.count > 3) {
            recommendations.push(`Collection "${mostUsedCollections[0].collection}" is heavily used - consider optimization`);
        }
        if (datasets.length > 10) {
            recommendations.push('Large number of datasets detected - consider consolidation opportunities');
        }

        return {
            mostUsedCollections,
            redundantAssignments,
            schemaConflicts,
            recommendations
        };
    }

    /**
     * Calculate overall health score for dataset organization
     */
    private calculateHealthScore(overlaps: CollectionOverlap[], globalInsights: any): number {
        let score = 100;

        // Deduct points for conflicts
        for (const overlap of overlaps) {
            switch (overlap.conflictLevel) {
                case 'high':
                    score -= 15;
                    break;
                case 'medium':
                    score -= 8;
                    break;
                case 'low':
                    score -= 3;
                    break;
            }
        }

        // Deduct points for redundancy
        score -= globalInsights.redundantAssignments.length * 5;

        // Deduct points for schema conflicts
        score -= globalInsights.schemaConflicts.length * 10;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Assess conflict level for a specific collection overlap
     */
    private assessOverlapConflictLevel(collection: string, datasets: CloudDataset[]): 'none' | 'low' | 'medium' | 'high' {
        // Check if datasets have different visibility levels
        const visibilities = new Set(datasets.map(ds => ds.visibility));
        if (visibilities.size > 1) {
            return 'high'; // Different visibility levels can cause access issues
        }

        // Check if datasets have filters
        const hasFilters = datasets.some(ds => 
            ds.collectionAssignment?.dataFilters?.some((f: any) => f.collection === collection)
        );

        if (!hasFilters && datasets.length > 2) {
            return 'medium'; // Multiple datasets without filters
        }

        if (!hasFilters && datasets.length === 2) {
            return 'low'; // Two datasets without filters
        }

        return 'none'; // Filtered or single usage
    }

    /**
     * Assess conflict level for dataset creation
     */
    private assessConflictLevel(
        collection: string, 
        existingDatasets: CloudDataset[], 
        newConfig: any
    ): 'none' | 'low' | 'medium' | 'high' {
        // Check visibility conflicts
        const existingVisibilities = new Set(existingDatasets.map(ds => ds.visibility));
        if (existingVisibilities.has('public') && newConfig.visibility !== 'public') {
            return 'high';
        }

        // Check filter presence
        const hasExistingFilters = existingDatasets.some(ds => 
            ds.collectionAssignment?.dataFilters?.some((f: any) => f.collection === collection)
        );
        const hasNewFilters = newConfig.collectionAssignment?.dataFilters?.some((f: any) => f.collection === collection);

        if (!hasExistingFilters && !hasNewFilters) {
            return existingDatasets.length > 1 ? 'high' : 'medium';
        }

        return 'low';
    }

    /**
     * Get reasons for conflicts
     */
    private getConflictReasons(collection: string, datasets: CloudDataset[]): string[] {
        const reasons = [];

        const visibilities = new Set(datasets.map(ds => ds.visibility));
        if (visibilities.size > 1) {
            reasons.push('Datasets have different visibility levels');
        }

        const hasFilters = datasets.some(ds => 
            ds.collectionAssignment?.dataFilters?.some((f: any) => f.collection === collection)
        );
        if (!hasFilters) {
            reasons.push('No data filters defined - potential data redundancy');
        }

        if (datasets.length > 3) {
            reasons.push('Collection used by many datasets - consider consolidation');
        }

        return reasons;
    }

    /**
     * Get recommendations for overlap resolution
     */
    private getOverlapRecommendations(collection: string, datasets: CloudDataset[]): string[] {
        const recommendations = [];

        const hasFilters = datasets.some(ds => 
            ds.collectionAssignment?.dataFilters?.some((f: any) => f.collection === collection)
        );

        if (!hasFilters) {
            recommendations.push('Add data filters to differentiate dataset purposes');
        }

        if (datasets.length > 2) {
            recommendations.push('Consider merging similar datasets to reduce redundancy');
        }

        const visibilities = new Set(datasets.map(ds => ds.visibility));
        if (visibilities.size > 1) {
            recommendations.push('Standardize visibility levels across related datasets');
        }

        return recommendations;
    }

    /**
     * Get conflict recommendation for dataset creation
     */
    private getConflictRecommendation(
        collection: string, 
        existingDatasets: CloudDataset[], 
        newConfig: any
    ): string {
        const hasFilters = existingDatasets.some(ds => 
            ds.collectionAssignment?.dataFilters?.some((f: any) => f.collection === collection)
        );

        if (!hasFilters) {
            return 'Add data filters to differentiate from existing datasets';
        }

        if (existingDatasets.length > 2) {
            return `Consider merging with existing dataset "${existingDatasets[0].name}"`;
        }

        return 'Review existing usage to avoid data redundancy';
    }

    /**
     * Check for redundancy patterns
     */
    private checkRedundancyPatterns(
        newCollections: string[], 
        existingDatasets: CloudDataset[]
    ): { warnings: any[]; suggestions: any[] } {
        const warnings = [];
        const suggestions = [];

        // Check if new dataset is very similar to existing ones
        for (const existing of existingDatasets) {
            if (existing.collectionAssignment?.selectedCollections) {
                const overlap = newCollections.filter(c => 
                    existing.collectionAssignment!.selectedCollections.includes(c)
                ).length;
                
                const overlapPercentage = overlap / newCollections.length;
                
                if (overlapPercentage > 0.7) {
                    warnings.push({
                        type: 'redundancy' as const,
                        severity: 'warning' as const,
                        message: `${Math.round(overlapPercentage * 100)}% overlap with existing dataset "${existing.name}"`,
                        affectedCollections: newCollections,
                        affectedDatasets: [existing.name],
                        recommendation: 'Consider extending the existing dataset instead of creating a new one'
                    });

                    suggestions.push({
                        type: 'merge' as const,
                        message: `Merge with "${existing.name}" to avoid redundancy`,
                        collections: newCollections
                    });
                }
            }
        }

        return { warnings, suggestions };
    }

    /**
     * Check for performance implications
     */
    private checkPerformanceImplications(
        newCollections: string[], 
        existingDatasets: CloudDataset[]
    ): any[] {
        const warnings = [];

        // Check for large collections
        const largeCollections = ['users', 'activities', 'sessions', 'audit_log'];
        const hasLargeCollections = newCollections.some(c => largeCollections.includes(c));

        if (hasLargeCollections && newCollections.length > 5) {
            warnings.push({
                type: 'performance' as const,
                severity: 'info' as const,
                message: 'Dataset includes large collections - consider performance implications',
                affectedCollections: newCollections.filter(c => largeCollections.includes(c)),
                affectedDatasets: [],
                recommendation: 'Add data filters or consider splitting into smaller datasets'
            });
        }

        return warnings;
    }
}

// Export singleton instance
export const datasetConflictAnalyzer = DatasetConflictAnalyzer.getInstance();
