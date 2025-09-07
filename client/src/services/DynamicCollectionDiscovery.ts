/**
 * Dynamic Collection Discovery Service
 * 
 * Automatically discovers and categorizes Firebase collections to keep the frontend
 * dataset system in sync with backend collections. This ensures that when new
 * collections are created in other parts of the app, they automatically appear
 * in the dataset management system.
 * 
 * Features:
 * - Real-time collection discovery from Firebase
 * - Intelligent categorization based on collection names and patterns
 * - Caching for performance optimization
 * - Fallback to static collections if discovery fails
 * - Organization-scoped collection filtering
 */

import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from '@/context/AuthContext';

export interface CollectionCategory {
    icon: string;
    description: string;
    collections: string[];
    isSystem?: boolean;
    isDynamic?: boolean;
}

export interface DashboardCollectionsByCategory {
    [categoryName: string]: CollectionCategory;
}

export interface CollectionDiscoveryResult {
    collections: DashboardCollectionsByCategory;
    totalCollections: number;
    lastUpdated: Date;
    source: 'dynamic' | 'static' | 'cached';
}

// Static fallback collections (same as before, but now used as fallback)
const STATIC_COLLECTIONS_BY_CATEGORY: DashboardCollectionsByCategory = {
    'Core System': {
        icon: '👥',
        description: 'User management, organizations, and core system data',
        collections: [
            'users', 'teamMembers', 'organizations', 'roles', 'projects', 
            'projectTeamMembers', 'clients', 'contacts', 'test'
        ],
        isSystem: true
    },
    'Sessions & Workflows': {
        icon: '🎬',
        description: 'Production sessions, workflows, and task management',
        collections: [
            'sessions', 'sessionWorkflows', 'sessionAssignments', 'sessionParticipants',
            'workflowTemplates', 'workflowDiagrams', 'workflowInstances', 'workflowSteps',
            'workflowAssignments', 'sessionPhaseTransitions', 'sessionReviews', 'sessionQc',
            'sessionTasks', 'demoSessions'
        ],
        isSystem: true
    },
    'Inventory & Equipment': {
        icon: '📦',
        description: 'Equipment tracking, network management, and inventory systems',
        collections: [
            'inventoryItems', 'inventory', 'networkIPAssignments', 'networkIPRanges', 
            'networks', 'inventoryHistory', 'setupProfiles', 'schemas', 'schemaFields',
            'mapLayouts', 'mapLocations', 'inventoryMaps', 'mapData'
        ],
        isSystem: true
    },
    'Timecards & Scheduling': {
        icon: '⏰',
        description: 'Time tracking, approvals, and scheduling systems',
        collections: [
            'timecard_entries', 'user_timecards', 'timecard_approvals', 'timecard_templates'
        ],
        isSystem: true
    },
    'Media & Content': {
        icon: '🎥',
        description: 'Media files, production tasks, and content management',
        collections: [
            'mediaFiles', 'postProductionTasks', 'stages', 'notes', 'reports', 'callSheets'
        ],
        isSystem: true
    },
    'AI & Automation': {
        icon: '🤖',
        description: 'AI agents, messaging, and automated systems',
        collections: [
            'aiAgents', 'messages', 'chats', 'messageSessions'
        ],
        isSystem: true
    },
    'Business & Licensing': {
        icon: '💼',
        description: 'Licenses, subscriptions, payments, and business data',
        collections: [
            'licenses', 'subscriptions', 'payments', 'userPreferences'
        ],
        isSystem: true
    },
    'Production Budget Management': {
        icon: '💰',
        description: 'Budget tracking, schedules, and financial management',
        collections: [
            'pbmProjects', 'pbmSchedules', 'pbmPayscales', 'pbmDailyStatus'
        ],
        isSystem: true
    },
    'Network Delivery & Deliverables': {
        icon: '📡',
        description: 'Network delivery bibles, deliverables, and post-production workflows',
        collections: [
            'networkDeliveryBibles', 'deliverables', 'networkDeliveryChats',
            'deliverySpecs', 'deliveryTemplates', 'deliveryTracking'
        ],
        isSystem: true,
        isDynamic: true
    }
};

class DynamicCollectionDiscoveryService {
    private static instance: DynamicCollectionDiscoveryService;
    private cache: Map<string, CollectionDiscoveryResult> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly DISCOVERY_ENDPOINT = 'https://us-central1-backbone-logic.cloudfunctions.net/api/collections/discover';

    public static getInstance(): DynamicCollectionDiscoveryService {
        if (!DynamicCollectionDiscoveryService.instance) {
            DynamicCollectionDiscoveryService.instance = new DynamicCollectionDiscoveryService();
        }
        return DynamicCollectionDiscoveryService.instance;
    }

    /**
     * Discover collections dynamically from Firebase with intelligent caching
     */
    public async discoverCollections(organizationId?: string): Promise<CollectionDiscoveryResult> {
        const cacheKey = `collections_${organizationId || 'global'}`;
        
        // Check cache first
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
            console.log('🎯 [DynamicCollectionDiscovery] Using cached collections');
            return cached;
        }

        try {
            // Try dynamic discovery first
            const dynamicResult = await this.discoverFromFirebase(organizationId);
            if (dynamicResult) {
                this.setCachedResult(cacheKey, dynamicResult);
                return dynamicResult;
            }
        } catch (error) {
            console.warn('⚠️ [DynamicCollectionDiscovery] Dynamic discovery failed, falling back to static:', error);
        }

        // Fallback to static collections
        const staticResult: CollectionDiscoveryResult = {
            collections: STATIC_COLLECTIONS_BY_CATEGORY,
            totalCollections: this.getTotalCollectionCount(STATIC_COLLECTIONS_BY_CATEGORY),
            lastUpdated: new Date(),
            source: 'static'
        };

        this.setCachedResult(cacheKey, staticResult);
        return staticResult;
    }

    /**
     * Discover collections from Firebase backend API
     */
    private async discoverFromFirebase(organizationId?: string): Promise<CollectionDiscoveryResult | null> {
        try {
            console.log('🔍 [DynamicCollectionDiscovery] Discovering collections from Firebase...');
            
            // Get auth token for API call
            const auth = useAuth();
            const user = auth?.user;
            if (!user) {
                console.warn('⚠️ [DynamicCollectionDiscovery] No authenticated user for collection discovery');
                return null;
            }

            const idToken = await user.getIdToken();
            
            // Call backend collection discovery API
            const response = await fetch(this.DISCOVERY_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    organizationId: organizationId || user.uid,
                    includeMetadata: true,
                    categorize: true
                })
            });

            if (!response.ok) {
                throw new Error(`Collection discovery API failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(`Collection discovery failed: ${data.error}`);
            }

            // Process and categorize discovered collections
            const categorizedCollections = this.processDiscoveredCollections(data.collections);
            
            const result: CollectionDiscoveryResult = {
                collections: categorizedCollections,
                totalCollections: this.getTotalCollectionCount(categorizedCollections),
                lastUpdated: new Date(),
                source: 'dynamic'
            };

            console.log(`✅ [DynamicCollectionDiscovery] Discovered ${result.totalCollections} collections across ${Object.keys(categorizedCollections).length} categories`);
            return result;

        } catch (error) {
            console.error('❌ [DynamicCollectionDiscovery] Firebase discovery failed:', error);
            return null;
        }
    }

    /**
     * Process discovered collections and categorize them intelligently
     */
    private processDiscoveredCollections(discoveredCollections: string[]): DashboardCollectionsByCategory {
        const categorized: DashboardCollectionsByCategory = {};
        
        // Start with static categories as base
        for (const [categoryName, category] of Object.entries(STATIC_COLLECTIONS_BY_CATEGORY)) {
            categorized[categoryName] = {
                ...category,
                collections: [...category.collections] // Copy existing collections
            };
        }

        // Add discovered collections that aren't already included
        const allExistingCollections = new Set(
            Object.values(categorized).flatMap(cat => cat.collections)
        );

        const newCollections = discoveredCollections.filter(
            collectionName => !allExistingCollections.has(collectionName) && 
                             this.isValidCollectionName(collectionName)
        );

        // Categorize new collections
        for (const collectionName of newCollections) {
            const category = this.categorizeCollection(collectionName);
            
            if (categorized[category]) {
                categorized[category].collections.push(collectionName);
                categorized[category].isDynamic = true;
            } else {
                // Create new category for uncategorized collections
                categorized['Custom Collections'] = {
                    icon: '🔧',
                    description: 'Custom and dynamically discovered collections',
                    collections: [collectionName],
                    isDynamic: true
                };
            }
        }

        return categorized;
    }

    /**
     * Intelligently categorize a collection based on its name and patterns
     */
    private categorizeCollection(collectionName: string): string {
        const name = collectionName.toLowerCase();

        // Network Delivery patterns
        if (name.includes('delivery') || name.includes('deliverable') || name.includes('bible') ||
            (name.includes('network') && (name.includes('delivery') || name.includes('spec')))) {
            return 'Network Delivery & Deliverables';
        }

        // Session patterns
        if (name.includes('session') || name.includes('workflow') || name.includes('task') ||
            (name.includes('assignment') && name.includes('session'))) {
            return 'Sessions & Workflows';
        }

        // Media patterns
        if (name.includes('media') || name.includes('video') || name.includes('audio') ||
            name.includes('production') || name.includes('stage') || name.includes('call') ||
            (name.includes('post') && name.includes('production'))) {
            return 'Media & Content';
        }

        // Inventory patterns
        if (name.includes('inventory') || name.includes('equipment') || name.includes('network') ||
            name.includes('ip') || name.includes('map') || name.includes('location') ||
            name.includes('setup') || name.includes('schema')) {
            return 'Inventory & Equipment';
        }

        // Team patterns
        if (name.includes('user') || name.includes('team') || name.includes('member') ||
            name.includes('role') || name.includes('organization') || name.includes('client') ||
            name.includes('contact')) {
            return 'Core System';
        }

        // Time patterns
        if (name.includes('timecard') || name.includes('schedule') || name.includes('time') ||
            name.includes('approval') || (name.includes('template') && name.includes('time'))) {
            return 'Timecards & Scheduling';
        }

        // AI patterns
        if (name.includes('ai') || name.includes('agent') || name.includes('message') ||
            name.includes('chat') || name.includes('bot')) {
            return 'AI & Automation';
        }

        // Business patterns
        if (name.includes('license') || name.includes('subscription') || name.includes('payment') ||
            name.includes('billing') || name.includes('invoice')) {
            return 'Business & Licensing';
        }

        // PBM patterns
        if (name.includes('pbm') || name.includes('budget') || name.includes('payscale') ||
            (name.includes('daily') && name.includes('status'))) {
            return 'Production Budget Management';
        }

        // Default to Custom Collections
        return 'Custom Collections';
    }

    /**
     * Validate collection name (filter out system collections)
     */
    private isValidCollectionName(collectionName: string): boolean {
        return !collectionName.startsWith('_') && 
               !collectionName.includes('_backup') && 
               !collectionName.includes('_temp') && 
               !collectionName.includes('_cache') && 
               !collectionName.startsWith('firebase-') &&
               collectionName.length > 0;
    }

    /**
     * Cache management
     */
    private getCachedResult(cacheKey: string): CollectionDiscoveryResult | null {
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.CACHE_TTL) {
            return { ...cached, source: 'cached' };
        }
        return null;
    }

    private setCachedResult(cacheKey: string, result: CollectionDiscoveryResult): void {
        this.cache.set(cacheKey, result);
    }

    /**
     * Clear cache (useful for forcing refresh)
     */
    public clearCache(): void {
        this.cache.clear();
        console.log('🗑️ [DynamicCollectionDiscovery] Cache cleared');
    }

    /**
     * Get total collection count
     */
    private getTotalCollectionCount(collections: DashboardCollectionsByCategory): number {
        return Object.values(collections).reduce((total, category) => total + category.collections.length, 0);
    }

    /**
     * Get static collections as fallback
     */
    public getStaticCollections(): DashboardCollectionsByCategory {
        return STATIC_COLLECTIONS_BY_CATEGORY;
    }
}

// Export singleton instance
export const dynamicCollectionDiscovery = DynamicCollectionDiscoveryService.getInstance();

// Export helper functions
export const getAllCollections = (collections: DashboardCollectionsByCategory): string[] => {
    return Object.values(collections).flatMap(category => category.collections);
};

export const getCollectionsByCategory = (collections: DashboardCollectionsByCategory, categoryName: string): string[] => {
    return collections[categoryName]?.collections || [];
};

export const getCategoryForCollection = (collections: DashboardCollectionsByCategory, collectionName: string): string | null => {
    for (const [categoryName, category] of Object.entries(collections)) {
        if (category.collections.includes(collectionName)) {
            return categoryName;
        }
    }
    return null;
};

export const isValidCollection = (collections: DashboardCollectionsByCategory, collectionName: string): boolean => {
    return getAllCollections(collections).includes(collectionName);
};
