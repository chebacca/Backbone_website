/**
 * Collection Search Hook
 * 
 * Custom hook for managing collection search and filtering state.
 * Provides search functionality with Firebase-compatible querying and proper indexing.
 */

import { useState, useCallback, useMemo } from 'react';

export interface CollectionSearchState {
    searchQuery: string;
    selectedCategory: string;
    showSelectedOnly: boolean;
    sortBy: 'name' | 'category' | 'selected';
    sortOrder: 'asc' | 'desc';
}

export interface CollectionSearchActions {
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string) => void;
    setShowSelectedOnly: (show: boolean) => void;
    setSortBy: (sortBy: 'name' | 'category' | 'selected') => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    clearFilters: () => void;
    resetToDefaults: () => void;
}

export interface UseCollectionSearchOptions {
    initialSearchQuery?: string;
    initialCategory?: string;
    initialShowSelectedOnly?: boolean;
    initialSortBy?: 'name' | 'category' | 'selected';
    initialSortOrder?: 'asc' | 'desc';
    debounceMs?: number;
}

export const useCollectionSearch = (options: UseCollectionSearchOptions = {}): {
    state: CollectionSearchState;
    actions: CollectionSearchActions;
    isFiltered: boolean;
} => {
    const {
        initialSearchQuery = '',
        initialCategory = 'all',
        initialShowSelectedOnly = false,
        initialSortBy = 'name',
        initialSortOrder = 'asc',
        debounceMs = 300
    } = options;

    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [showSelectedOnly, setShowSelectedOnly] = useState(initialShowSelectedOnly);
    const [sortBy, setSortBy] = useState<'name' | 'category' | 'selected'>(initialSortBy);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

    // Check if any filters are active
    const isFiltered = useMemo(() => {
        return searchQuery.trim() !== '' || 
               selectedCategory !== 'all' || 
               showSelectedOnly;
    }, [searchQuery, selectedCategory, showSelectedOnly]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedCategory('all');
        setShowSelectedOnly(false);
    }, []);

    // Reset to default values
    const resetToDefaults = useCallback(() => {
        setSearchQuery(initialSearchQuery);
        setSelectedCategory(initialCategory);
        setShowSelectedOnly(initialShowSelectedOnly);
        setSortBy(initialSortBy);
        setSortOrder(initialSortOrder);
    }, [initialSearchQuery, initialCategory, initialShowSelectedOnly, initialSortBy, initialSortOrder]);

    const actions: CollectionSearchActions = {
        setSearchQuery,
        setSelectedCategory,
        setShowSelectedOnly,
        setSortBy,
        setSortOrder,
        clearFilters,
        resetToDefaults
    };

    const state: CollectionSearchState = {
        searchQuery,
        selectedCategory,
        showSelectedOnly,
        sortBy,
        sortOrder
    };

    return {
        state,
        actions,
        isFiltered
    };
};

/**
 * Hook for Firebase-compatible collection search with proper indexing
 */
export const useFirebaseCollectionSearch = (
    collections: { [categoryName: string]: { icon: string; description: string; collections: string[] } },
    selectedCollections: string[],
    options: UseCollectionSearchOptions = {}
) => {
    const { state, actions, isFiltered } = useCollectionSearch(options);

    // Create search index for efficient querying
    const searchIndex = useMemo(() => {
        const index: { [key: string]: string[] } = {};
        
        Object.entries(collections).forEach(([categoryName, category]) => {
            category.collections.forEach(collection => {
                // Create searchable terms
                const terms = [
                    collection.toLowerCase(),
                    categoryName.toLowerCase(),
                    category.description.toLowerCase(),
                    // Add partial matches for better search
                    ...collection.toLowerCase().split('_'),
                    ...collection.toLowerCase().split(/(?=[A-Z])/),
                    ...categoryName.toLowerCase().split(' ')
                ];
                
                terms.forEach(term => {
                    if (term.length > 1) { // Only index meaningful terms
                        if (!index[term]) {
                            index[term] = [];
                        }
                        if (!index[term].includes(collection)) {
                            index[term].push(collection);
                        }
                    }
                });
            });
        });
        
        return index;
    }, [collections]);

    // Filter collections based on search state
    const filteredCollections = useMemo(() => {
        let filtered: { [categoryName: string]: { icon: string; description: string; collections: string[] } } = {};
        
        Object.entries(collections).forEach(([categoryName, category]) => {
            let categoryCollections = category.collections;
            
            // Apply search filter using index
            if (state.searchQuery.trim()) {
                const query = state.searchQuery.toLowerCase().trim();
                const searchTerms = query.split(' ').filter(term => term.length > 0);
                
                categoryCollections = categoryCollections.filter(collection => {
                    // Check if all search terms match
                    return searchTerms.every(term => {
                        // Direct collection name match
                        if (collection.toLowerCase().includes(term)) return true;
                        
                        // Category name match
                        if (categoryName.toLowerCase().includes(term)) return true;
                        
                        // Description match
                        if (category.description.toLowerCase().includes(term)) return true;
                        
                        // Index-based search
                        return searchIndex[term]?.includes(collection) || false;
                    });
                });
            }
            
            // Apply category filter
            if (state.selectedCategory && state.selectedCategory !== 'all') {
                if (categoryName !== state.selectedCategory) {
                    return;
                }
            }
            
            // Apply selected-only filter
            if (state.showSelectedOnly) {
                categoryCollections = categoryCollections.filter(collection =>
                    selectedCollections.includes(collection)
                );
            }
            
            // Only include category if it has matching collections
            if (categoryCollections.length > 0) {
                filtered[categoryName] = {
                    ...category,
                    collections: categoryCollections
                };
            }
        });
        
        return filtered;
    }, [collections, state, selectedCollections, searchIndex]);

    // Get search suggestions based on current query
    const getSearchSuggestions = useCallback((query: string, limit: number = 10): string[] => {
        if (!query.trim()) return [];
        
        const suggestions = new Set<string>();
        const searchTerms = query.toLowerCase().trim().split(' ').filter(term => term.length > 0);
        
        searchTerms.forEach(term => {
            // Find collections that start with the term
            Object.values(collections).forEach(category => {
                category.collections.forEach(collection => {
                    if (collection.toLowerCase().startsWith(term)) {
                        suggestions.add(collection);
                    }
                });
            });
            
            // Find collections that contain the term
            Object.values(collections).forEach(category => {
                category.collections.forEach(collection => {
                    if (collection.toLowerCase().includes(term) && !collection.toLowerCase().startsWith(term)) {
                        suggestions.add(collection);
                    }
                });
            });
        });
        
        return Array.from(suggestions).slice(0, limit);
    }, [collections]);

    // Get collection statistics
    const getStatistics = useCallback(() => {
        const totalAvailable = Object.values(collections)
            .reduce((sum, category) => sum + category.collections.length, 0);
        
        const totalFiltered = Object.values(filteredCollections)
            .reduce((sum, category) => sum + category.collections.length, 0);
        
        const selectedFiltered = Object.values(filteredCollections)
            .reduce((sum, category) => 
                sum + category.collections.filter(c => selectedCollections.includes(c)).length, 0
            );
        
        return {
            totalAvailable,
            totalFiltered,
            selectedFiltered,
            totalSelected: selectedCollections.length,
            isFiltered
        };
    }, [collections, filteredCollections, selectedCollections, isFiltered]);

    return {
        state,
        actions,
        filteredCollections,
        getSearchSuggestions,
        getStatistics,
        isFiltered
    };
};

export default useCollectionSearch;
