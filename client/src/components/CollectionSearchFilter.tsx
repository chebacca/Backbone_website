/**
 * Collection Search Filter Component
 * 
 * Provides search and filtering functionality for collection selection in dataset wizards.
 * Features:
 * - Real-time search across collection names and categories
 * - Category-based filtering
 * - Selection state management
 * - Firebase-compatible search with proper indexing
 * - Responsive design with Material-UI components
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Button,
    Grid,
    Paper,
    Checkbox,
    FormControlLabel,
    Divider,
    IconButton,
    Tooltip,
    Badge,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    SelectAll as SelectAllIcon,
    ClearAll as DeselectAllIcon,
    Category as CategoryIcon,
    Collections as CollectionsIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

export interface CollectionSearchFilterProps {
    // Collection data
    collections: { [categoryName: string]: { icon: string; description: string; collections: string[] } };
    allCollections: string[];
    selectedCollections: string[];
    
    // Search and filter state
    searchQuery: string;
    selectedCategory: string;
    showSelectedOnly: boolean;
    
    // Event handlers
    onSearchChange: (query: string) => void;
    onCategoryChange: (category: string) => void;
    onShowSelectedOnlyChange: (show: boolean) => void;
    onCollectionToggle: (collection: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onRefresh: () => void;
    
    // UI state
    loading?: boolean;
    error?: string | null;
    totalCount?: number;
    selectedCount?: number;
    
    // Styling
    variant?: 'wizard' | 'dialog';
    compact?: boolean;
}

export const CollectionSearchFilter: React.FC<CollectionSearchFilterProps> = ({
    collections,
    allCollections,
    selectedCollections,
    searchQuery,
    selectedCategory,
    showSelectedOnly,
    onSearchChange,
    onCategoryChange,
    onShowSelectedOnlyChange,
    onCollectionToggle,
    onSelectAll,
    onDeselectAll,
    onRefresh,
    loading = false,
    error = null,
    totalCount = 0,
    selectedCount = 0,
    variant = 'wizard',
    compact = false
}) => {
    // Filtered collections based on search and category filters
    const filteredCollections = useMemo(() => {
        let filtered: { [categoryName: string]: { icon: string; description: string; collections: string[] } } = {};
        
        Object.entries(collections).forEach(([categoryName, category]) => {
            let categoryCollections = category.collections;
            
            // Apply search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                categoryCollections = categoryCollections.filter(collection =>
                    collection.toLowerCase().includes(query) ||
                    categoryName.toLowerCase().includes(query) ||
                    category.description.toLowerCase().includes(query)
                );
            }
            
            // Apply category filter
            if (selectedCategory && selectedCategory !== 'all') {
                if (categoryName !== selectedCategory) {
                    return;
                }
            }
            
            // Apply selected-only filter
            if (showSelectedOnly) {
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
    }, [collections, searchQuery, selectedCategory, showSelectedOnly, selectedCollections]);

    // Get available categories for filter dropdown
    const availableCategories = useMemo(() => {
        return Object.keys(collections).map(categoryName => ({
            value: categoryName,
            label: categoryName,
            count: collections[categoryName].collections.length
        }));
    }, [collections]);

    // Calculate selection statistics
    const selectionStats = useMemo(() => {
        const totalFiltered = Object.values(filteredCollections)
            .reduce((sum, category) => sum + category.collections.length, 0);
        
        const selectedFiltered = Object.values(filteredCollections)
            .reduce((sum, category) => 
                sum + category.collections.filter(c => selectedCollections.includes(c)).length, 0
            );
        
        return {
            totalFiltered,
            selectedFiltered,
            totalAvailable: allCollections.length,
            totalSelected: selectedCollections.length
        };
    }, [filteredCollections, selectedCollections, allCollections]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        onSearchChange('');
        onCategoryChange('all');
        onShowSelectedOnlyChange(false);
    }, [onSearchChange, onCategoryChange, onShowSelectedOnlyChange]);

    // Select all visible collections
    const handleSelectAllVisible = useCallback(() => {
        const visibleCollections = Object.values(filteredCollections)
            .flatMap(category => category.collections);
        
        visibleCollections.forEach(collection => {
            if (!selectedCollections.includes(collection)) {
                onCollectionToggle(collection);
            }
        });
    }, [filteredCollections, selectedCollections, onCollectionToggle]);

    // Deselect all visible collections
    const handleDeselectAllVisible = useCallback(() => {
        const visibleCollections = Object.values(filteredCollections)
            .flatMap(category => category.collections);
        
        visibleCollections.forEach(collection => {
            if (selectedCollections.includes(collection)) {
                onCollectionToggle(collection);
            }
        });
    }, [filteredCollections, selectedCollections, onCollectionToggle]);

    return (
        <Box sx={{ width: '100%' }}>
            {/* Search and Filter Controls */}
            <Paper 
                elevation={variant === 'dialog' ? 2 : 0}
                sx={{ 
                    p: compact ? 2 : 3, 
                    mb: 2,
                    backgroundColor: variant === 'dialog' ? 'background.paper' : 'transparent',
                    borderRadius: variant === 'dialog' ? 2 : 0
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    {/* Search Input */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search collections by name, category, or description..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => onSearchChange('')}
                                            edge="end"
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            size={compact ? 'small' : 'medium'}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Category Filter */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size={compact ? 'small' : 'medium'}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={selectedCategory}
                                onChange={(e) => onCategoryChange(e.target.value)}
                                disabled={loading}
                            >
                                <MenuItem value="all">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CategoryIcon fontSize="small" />
                                        All Categories ({totalCount})
                                    </Box>
                                </MenuItem>
                                {availableCategories.map(category => (
                                    <MenuItem key={category.value} value={category.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {category.label}
                                            </Typography>
                                            <Chip 
                                                label={category.count} 
                                                size="small" 
                                                sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                                            />
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Tooltip title="Refresh collections">
                                <IconButton 
                                    onClick={onRefresh} 
                                    disabled={loading}
                                    size={compact ? 'small' : 'medium'}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Clear all filters">
                                <IconButton 
                                    onClick={handleClearFilters}
                                    disabled={!searchQuery && selectedCategory === 'all' && !showSelectedOnly}
                                    size={compact ? 'small' : 'medium'}
                                >
                                    <ClearIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid>
                </Grid>

                {/* Additional Filters */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showSelectedOnly}
                                onChange={(e) => onShowSelectedOnlyChange(e.target.checked)}
                                size="small"
                            />
                        }
                        label="Show selected only"
                    />
                    
                    <Divider orientation="vertical" flexItem />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            size="small"
                            startIcon={<SelectAllIcon />}
                            onClick={handleSelectAllVisible}
                            disabled={loading || selectionStats.selectedFiltered === selectionStats.totalFiltered}
                        >
                            Select All Visible
                        </Button>
                        
                        <Button
                            size="small"
                            startIcon={<DeselectAllIcon />}
                            onClick={handleDeselectAllVisible}
                            disabled={loading || selectionStats.selectedFiltered === 0}
                        >
                            Deselect All Visible
                        </Button>
                    </Box>
                </Box>

                {/* Selection Statistics */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<CollectionsIcon />}
                        label={`${selectionStats.totalSelected} of ${selectionStats.totalAvailable} selected`}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                    
                    {searchQuery || selectedCategory !== 'all' || showSelectedOnly ? (
                        <Chip
                            icon={<FilterIcon />}
                            label={`${selectionStats.selectedFiltered} of ${selectionStats.totalFiltered} visible`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                        />
                    ) : null}
                </Box>
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Collection Categories */}
            {Object.keys(filteredCollections).length === 0 ? (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: 'text.secondary'
                }}>
                    <CollectionsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                        No collections found
                    </Typography>
                    <Typography variant="body2">
                        {searchQuery || selectedCategory !== 'all' || showSelectedOnly
                            ? 'Try adjusting your search or filter criteria'
                            : 'No collections are available for selection'
                        }
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(filteredCollections).map(([categoryName, category]) => {
                        const selectedInCategory = category.collections.filter(c => 
                            selectedCollections.includes(c)
                        );
                        const allSelected = selectedInCategory.length === category.collections.length;
                        const someSelected = selectedInCategory.length > 0 && selectedInCategory.length < category.collections.length;

                        return (
                            <Paper 
                                key={categoryName}
                                elevation={1}
                                sx={{ 
                                    p: 2,
                                    backgroundColor: 'background.paper',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                {/* Category Header */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    mb: 2
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                                            {category.icon} {categoryName}
                                        </Typography>
                                        <Chip 
                                            label={`${selectedInCategory.length}/${category.collections.length}`}
                                            size="small"
                                            color={allSelected ? 'success' : someSelected ? 'warning' : 'default'}
                                            variant="outlined"
                                        />
                                    </Box>
                                    
                                    <Typography variant="caption" sx={{ 
                                        color: 'text.secondary',
                                        maxWidth: '300px',
                                        textAlign: 'right'
                                    }}>
                                        {category.description}
                                    </Typography>
                                </Box>

                                {/* Collection Grid */}
                                <Grid container spacing={1}>
                                    {category.collections.map((collection) => {
                                        const isSelected = selectedCollections.includes(collection);
                                        
                                        return (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={collection}>
                                                <Box
                                                    onClick={() => onCollectionToggle(collection)}
                                                    sx={{
                                                        p: 1.5,
                                                        border: '2px solid',
                                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                                        borderRadius: 1,
                                                        backgroundColor: isSelected 
                                                            ? 'primary.main' 
                                                            : 'background.default',
                                                        color: isSelected ? 'primary.contrastText' : 'text.primary',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease-in-out',
                                                        '&:hover': {
                                                            borderColor: isSelected ? 'primary.dark' : 'primary.light',
                                                            backgroundColor: isSelected 
                                                                ? 'primary.dark' 
                                                                : 'action.hover',
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: 2
                                                        },
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        size="small"
                                                        sx={{ 
                                                            color: isSelected ? 'inherit' : 'text.secondary',
                                                            '&.Mui-checked': {
                                                                color: 'inherit'
                                                            }
                                                        }}
                                                    />
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            fontWeight: isSelected ? 600 : 400,
                                                            flex: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {collection}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Paper>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default CollectionSearchFilter;
