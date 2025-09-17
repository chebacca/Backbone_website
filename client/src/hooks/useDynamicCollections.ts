/**
 * Dynamic Collections Hook
 * 
 * React hook for accessing dynamically discovered Firebase collections.
 * Provides real-time collection discovery with caching and error handling.
 * 
 * Usage:
 * const { collections, loading, error, refresh } = useDynamicCollections();
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { 
    dynamicCollectionDiscovery, 
    CollectionDiscoveryResult, 
    DashboardCollectionsByCategory,
    getAllCollections,
    getCollectionsByCategory,
    getCategoryForCollection,
    isValidCollection
} from '../services/DynamicCollectionDiscovery';

export interface UseDynamicCollectionsResult {
    // Collection data
    collections: DashboardCollectionsByCategory;
    allCollections: string[];
    totalCount: number;
    
    // State management
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    source: 'dynamic' | 'static' | 'cached';
    
    // Actions
    refresh: () => Promise<void>;
    clearCache: () => void;
    startRealTimeMonitoring: () => void;
    stopRealTimeMonitoring: () => void;
    triggerSync: () => Promise<void>;
    
    // Helper functions
    getCollectionsByCategory: (categoryName: string) => string[];
    getCategoryForCollection: (collectionName: string) => string | null;
    isValidCollection: (collectionName: string) => boolean;
}

export const useDynamicCollections = (organizationId?: string): UseDynamicCollectionsResult => {
    const { user } = useAuth();
    const [discoveryResult, setDiscoveryResult] = useState<CollectionDiscoveryResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [realTimeCleanup, setRealTimeCleanup] = useState<(() => void) | null>(null);

    // Discover collections
    const discoverCollections = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 [useDynamicCollections] Discovering collections...');
            
            // 🔧 CRITICAL FIX: Handle missing auth service gracefully
            let authToken: string | undefined;
            try {
                authToken = authService.getStoredToken() || undefined;
            } catch (error) {
                console.warn('⚠️ [useDynamicCollections] Auth service not available, proceeding without token:', error);
                authToken = undefined;
            }
            
            // If no auth token, try to get one from localStorage as fallback
            if (!authToken) {
                const fallbackToken = localStorage.getItem('firebase_id_token') || 
                                     localStorage.getItem('auth_token') || 
                                     localStorage.getItem('jwt_token');
                if (fallbackToken) {
                    authToken = fallbackToken;
                    console.log('🔑 [useDynamicCollections] Using fallback token from localStorage');
                } else {
                    console.log('ℹ️ [useDynamicCollections] No auth token available, will use static collections');
                }
            }
            
            const result = await dynamicCollectionDiscovery.discoverCollections(
                organizationId || user.organizationId || user.id,
                authToken
            );
            
            setDiscoveryResult(result);
            console.log(`✅ [useDynamicCollections] Loaded ${result.totalCollections} collections from ${result.source} source`);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to discover collections';
            console.error('❌ [useDynamicCollections] Discovery failed:', err);
            setError(errorMessage);
            
            // Fallback to static collections on error
            const staticCollections = dynamicCollectionDiscovery.getStaticCollections();
            setDiscoveryResult({
                collections: staticCollections,
                totalCollections: getAllCollections(staticCollections).length,
                lastUpdated: new Date(),
                source: 'static'
            });
            
        } finally {
            setLoading(false);
        }
    }, [user, organizationId]);

    // Auto-discover on mount and user change
    useEffect(() => {
        discoverCollections();
    }, [discoverCollections]);

    // Refresh function
    const refresh = useCallback(async () => {
        dynamicCollectionDiscovery.clearCache();
        await discoverCollections();
    }, [discoverCollections]);

    // Clear cache function
    const clearCache = useCallback(() => {
        dynamicCollectionDiscovery.clearCache();
    }, []);

    // Real-time monitoring functions
    const startRealTimeMonitoring = useCallback(() => {
        if (realTimeCleanup) {
            console.log('🔄 [useDynamicCollections] Real-time monitoring already active');
            return;
        }

        console.log('🔄 [useDynamicCollections] Starting real-time collection monitoring...');
        
        // 🔧 CRITICAL FIX: Handle missing auth service gracefully
        let authToken: string | undefined;
        try {
            authToken = authService.getStoredToken() || undefined;
        } catch (error) {
            console.warn('⚠️ [useDynamicCollections] Auth service not available, proceeding without token:', error);
            authToken = undefined;
        }
        
        // If no auth token, try to get one from localStorage as fallback
        if (!authToken) {
            const fallbackToken = localStorage.getItem('firebase_id_token') || 
                                 localStorage.getItem('auth_token') || 
                                 localStorage.getItem('jwt_token');
            if (fallbackToken) {
                authToken = fallbackToken;
                console.log('🔑 [useDynamicCollections] Using fallback token from localStorage');
            } else {
                console.log('ℹ️ [useDynamicCollections] No auth token available, real-time monitoring will use static collections');
            }
        }
        
        const cleanup = dynamicCollectionDiscovery.setupRealTimeMonitoring(
            organizationId || user?.organizationId || user?.id,
            authToken,
            (newResult) => {
                console.log('🔄 [useDynamicCollections] Collections updated via real-time monitoring');
                setDiscoveryResult(newResult);
                setError(null);
            }
        );
        
        setRealTimeCleanup(() => cleanup);
    }, [realTimeCleanup, organizationId, user]);

    const stopRealTimeMonitoring = useCallback(() => {
        if (realTimeCleanup) {
            console.log('🛑 [useDynamicCollections] Stopping real-time collection monitoring...');
            realTimeCleanup();
            setRealTimeCleanup(null);
        }
    }, [realTimeCleanup]);

    // Trigger sync function
    const triggerSync = useCallback(async () => {
        console.log('🔄 [useDynamicCollections] Manually triggering collection sync...');
        
        // 🔧 CRITICAL FIX: Handle missing auth service gracefully
        let authToken: string | undefined;
        try {
            authToken = authService.getStoredToken() || undefined;
        } catch (error) {
            console.warn('⚠️ [useDynamicCollections] Auth service not available, proceeding without token:', error);
            authToken = undefined;
        }
        
        // If no auth token, try to get one from localStorage as fallback
        if (!authToken) {
            const fallbackToken = localStorage.getItem('firebase_id_token') || 
                                 localStorage.getItem('auth_token') || 
                                 localStorage.getItem('jwt_token');
            if (fallbackToken) {
                authToken = fallbackToken;
                console.log('🔑 [useDynamicCollections] Using fallback token from localStorage');
            } else {
                console.log('ℹ️ [useDynamicCollections] No auth token available, sync will use static collections');
            }
        }
        
        await dynamicCollectionDiscovery.triggerSync(authToken);
    }, []);

    // Helper functions bound to current collections
    const getCollectionsByCategoryBound = useCallback((categoryName: string): string[] => {
        if (!discoveryResult) return [];
        return getCollectionsByCategory(discoveryResult.collections, categoryName);
    }, [discoveryResult]);

    const getCategoryForCollectionBound = useCallback((collectionName: string): string | null => {
        if (!discoveryResult) return null;
        return getCategoryForCollection(discoveryResult.collections, collectionName);
    }, [discoveryResult]);

    const isValidCollectionBound = useCallback((collectionName: string): boolean => {
        if (!discoveryResult) return false;
        return isValidCollection(discoveryResult.collections, collectionName);
    }, [discoveryResult]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (realTimeCleanup) {
                realTimeCleanup();
            }
        };
    }, [realTimeCleanup]);

    // Return hook result
    return {
        // Collection data
        collections: discoveryResult?.collections || {},
        allCollections: discoveryResult ? getAllCollections(discoveryResult.collections) : [],
        totalCount: discoveryResult?.totalCollections || 0,
        
        // State management
        loading,
        error,
        lastUpdated: discoveryResult?.lastUpdated || null,
        source: discoveryResult?.source || 'static',
        
        // Actions
        refresh,
        clearCache,
        startRealTimeMonitoring,
        stopRealTimeMonitoring,
        triggerSync,
        
        // Helper functions
        getCollectionsByCategory: getCollectionsByCategoryBound,
        getCategoryForCollection: getCategoryForCollectionBound,
        isValidCollection: isValidCollectionBound,
    };
};

// Hook for getting collections with automatic refresh
export const useDynamicCollectionsWithRefresh = (
    organizationId?: string, 
    refreshInterval: number = 5 * 60 * 1000 // 5 minutes
): UseDynamicCollectionsResult => {
    const result = useDynamicCollections(organizationId);

    // Auto-refresh at intervals
    useEffect(() => {
        if (refreshInterval <= 0) return;

        const interval = setInterval(() => {
            console.log('🔄 [useDynamicCollectionsWithRefresh] Auto-refreshing collections...');
            result.refresh();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [result.refresh, refreshInterval]);

    return result;
};

// Hook for specific category collections
export const useCategoryCollections = (
    categoryName: string, 
    organizationId?: string
): {
    collections: string[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
} => {
    const { collections, loading, error, refresh } = useDynamicCollections(organizationId);
    
    return {
        collections: getCollectionsByCategory(collections, categoryName),
        loading,
        error,
        refresh
    };
};
