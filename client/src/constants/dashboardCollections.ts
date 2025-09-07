/**
 * Dashboard Collections Constants
 * 
 * DEPRECATED: This file is now a compatibility layer for the dynamic collection system.
 * New code should use the useDynamicCollections hook or DynamicCollectionDiscovery service
 * for real-time collection discovery from Firebase.
 * 
 * This file provides static fallback collections and maintains backward compatibility.
 */

export interface CollectionCategory {
    icon: string;
    description: string;
    collections: string[];
}

export interface DashboardCollectionsByCategory {
    [categoryName: string]: CollectionCategory;
}

// Static fallback collections - used when dynamic discovery is not available
// For real-time collections, use useDynamicCollections hook
export const DASHBOARD_COLLECTIONS_BY_CATEGORY: DashboardCollectionsByCategory = {
    'Core System': {
        icon: '👥',
        description: 'User management, organizations, and core system data',
        collections: [
            'users', 'teamMembers', 'organizations', 'roles', 'projects', 
            'projectTeamMembers', 'clients', 'contacts', 'test'
        ]
    },
    'Sessions & Workflows': {
        icon: '🎬',
        description: 'Production sessions, workflows, and task management',
        collections: [
            'sessions', 'sessionWorkflows', 'sessionAssignments', 'sessionParticipants',
            'workflowTemplates', 'workflowDiagrams', 'workflowInstances', 'workflowSteps',
            'workflowAssignments', 'sessionPhaseTransitions', 'sessionReviews', 'sessionQc',
            'sessionTasks', 'demoSessions'
        ]
    },
    'Inventory & Equipment': {
        icon: '📦',
        description: 'Equipment tracking, network management, and inventory systems',
        collections: [
            'inventoryItems', 'inventory', 'networkIPAssignments', 'networkIPRanges', 
            'networks', 'inventoryHistory', 'setupProfiles', 'schemas', 'schemaFields',
            'mapLayouts', 'mapLocations', 'inventoryMaps', 'mapData'
        ]
    },
    'Timecards & Scheduling': {
        icon: '⏰',
        description: 'Time tracking, approvals, and scheduling systems',
        collections: [
            'timecard_entries', 'user_timecards', 'timecard_approvals', 'timecard_templates'
        ]
    },
    'Media & Content': {
        icon: '🎥',
        description: 'Media files, production tasks, and content management',
        collections: [
            'mediaFiles', 'postProductionTasks', 'stages', 'notes', 'reports', 'callSheets'
        ]
    },
    'AI & Automation': {
        icon: '🤖',
        description: 'AI agents, messaging, and automated systems',
        collections: [
            'aiAgents', 'messages', 'chats', 'messageSessions'
        ]
    },
    'Business & Licensing': {
        icon: '💼',
        description: 'Licenses, subscriptions, payments, and business data',
        collections: [
            'licenses', 'subscriptions', 'payments', 'userPreferences'
        ]
    },
    'Production Budget Management': {
        icon: '💰',
        description: 'Budget tracking, schedules, and financial management',
        collections: [
            'pbmProjects', 'pbmSchedules', 'pbmPayscales', 'pbmDailyStatus'
        ]
    },
    'Network Delivery & Deliverables': {
        icon: '📡',
        description: 'Network delivery bibles, deliverables, and post-production workflows',
        collections: [
            'networkDeliveryBibles', 'deliverables', 'networkDeliveryChats',
            'deliverySpecs', 'deliveryTemplates', 'deliveryTracking'
        ]
    }
};

// Flatten all collections for easy access and validation
export const ALL_DASHBOARD_COLLECTIONS = Object.values(DASHBOARD_COLLECTIONS_BY_CATEGORY)
    .flatMap(category => category.collections);

// Helper function to get collections by category
export const getCollectionsByCategory = (categoryName: string): string[] => {
    return DASHBOARD_COLLECTIONS_BY_CATEGORY[categoryName]?.collections || [];
};

// Helper function to get category for a collection
export const getCategoryForCollection = (collectionName: string): string | null => {
    for (const [categoryName, category] of Object.entries(DASHBOARD_COLLECTIONS_BY_CATEGORY)) {
        if (category.collections.includes(collectionName)) {
            return categoryName;
        }
    }
    return null;
};

// Helper function to validate if a collection exists
export const isValidCollection = (collectionName: string): boolean => {
    return ALL_DASHBOARD_COLLECTIONS.includes(collectionName);
};

// Get total collection count
export const getTotalCollectionCount = (): number => {
    return ALL_DASHBOARD_COLLECTIONS.length;
};

// Get collections count by category
export const getCollectionCountByCategory = (): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const [categoryName, category] of Object.entries(DASHBOARD_COLLECTIONS_BY_CATEGORY)) {
        counts[categoryName] = category.collections.length;
    }
    return counts;
};
