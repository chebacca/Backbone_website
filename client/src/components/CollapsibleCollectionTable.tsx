/**
 * Collapsible Collection Table Component
 * 
 * A compact table-based layout for displaying collection categories and their collections.
 * Features:
 * - Collapsible category rows to reduce vertical space
 * - Compact table layout instead of bulky cards
 * - Select all/deselect all functionality per category
 * - Search and filter integration
 * - Responsive design with Material-UI components
 */

import React, { useState, useMemo } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    Checkbox,
    Chip,
    Tooltip,
    Collapse,
    TableSortLabel,
    FormControlLabel,
    Switch,
    Divider,
    Button
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    SelectAll as SelectAllIcon,
    ClearAll as DeselectAllIcon,
    Category as CategoryIcon,
    Collections as CollectionsIcon
} from '@mui/icons-material';

export interface CollapsibleCollectionTableProps {
    // Collection data
    collections: { [categoryName: string]: { icon: string; description: string; collections: string[] } };
    selectedCollections: string[];
    
    // Event handlers
    onCollectionToggle: (collection: string) => void;
    onSelectAllInCategory?: (categoryName: string, collections: string[]) => void;
    onDeselectAllInCategory?: (categoryName: string, collections: string[]) => void;
    
    // UI state
    loading?: boolean;
    compact?: boolean;
    
    // Expand/collapse state
    expandedCategories?: string[];
    onExpandedCategoriesChange?: (categories: string[]) => void;
}

interface CategoryRowProps {
    categoryName: string;
    category: { icon: string; description: string; collections: string[] };
    selectedCollections: string[];
    onCollectionToggle: (collection: string) => void;
    onSelectAllInCategory?: (categoryName: string, collections: string[]) => void;
    onDeselectAllInCategory?: (categoryName: string, collections: string[]) => void;
    loading?: boolean;
    expanded?: boolean;
    onToggleExpanded?: (categoryName: string) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
    categoryName,
    category,
    selectedCollections,
    onCollectionToggle,
    onSelectAllInCategory,
    onDeselectAllInCategory,
    loading = false,
    expanded = true,
    onToggleExpanded
}) => {
    
    const selectedInCategory = category.collections.filter(c => 
        selectedCollections.includes(c)
    );
    const allSelected = selectedInCategory.length === category.collections.length;
    const someSelected = selectedInCategory.length > 0 && selectedInCategory.length < category.collections.length;

    const handleToggleExpanded = () => {
        if (onToggleExpanded) {
            onToggleExpanded(categoryName);
        }
    };

    const handleSelectAll = () => {
        if (onSelectAllInCategory) {
            onSelectAllInCategory(categoryName, category.collections);
        }
    };

    const handleDeselectAll = () => {
        if (onDeselectAllInCategory) {
            onDeselectAllInCategory(categoryName, category.collections);
        }
    };

    return (
        <>
            {/* Category Header Row */}
            <TableRow 
                sx={{ 
                    backgroundColor: 'action.hover',
                    '&:hover': { backgroundColor: 'action.selected' },
                    cursor: 'pointer'
                }}
                onClick={handleToggleExpanded}
            >
                <TableCell padding="checkbox">
                    <IconButton
                        size="small"
                        onClick={handleToggleExpanded}
                        disabled={loading}
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </TableCell>
                
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {categoryName}
                        </Typography>
                        <Chip 
                            label={`${selectedInCategory.length}/${category.collections.length}`}
                            size="small"
                            color={allSelected ? 'success' : someSelected ? 'warning' : 'default'}
                            variant="outlined"
                        />
                    </Box>
                </TableCell>
                
                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {category.description}
                    </Typography>
                </TableCell>
                
                <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={`Select all ${categoryName} collections`}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectAll();
                                }}
                                disabled={allSelected || loading}
                                color="primary"
                                sx={{ 
                                    opacity: allSelected ? 0.5 : 1,
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                        color: 'primary.contrastText'
                                    }
                                }}
                            >
                                <SelectAllIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={`Deselect all ${categoryName} collections`}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeselectAll();
                                }}
                                disabled={selectedInCategory.length === 0 || loading}
                                color="secondary"
                                sx={{ 
                                    opacity: selectedInCategory.length === 0 ? 0.5 : 1,
                                    '&:hover': {
                                        backgroundColor: 'secondary.main',
                                        color: 'secondary.contrastText'
                                    }
                                }}
                            >
                                <DeselectAllIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </TableCell>
            </TableRow>
            
            {/* Collections Rows (Collapsible) */}
            <TableRow>
                <TableCell colSpan={4} sx={{ py: 0, border: 0 }}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={someSelected}
                                                checked={allSelected}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleSelectAll();
                                                    } else {
                                                        handleDeselectAll();
                                                    }
                                                }}
                                                disabled={loading}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                Collection Name
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                Status
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                Actions
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {category.collections.map((collection) => {
                                        const isSelected = selectedCollections.includes(collection);
                                        
                                        return (
                                            <TableRow 
                                                key={collection}
                                                hover
                                                sx={{ 
                                                    '&:hover': { backgroundColor: 'action.hover' },
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => onCollectionToggle(collection)}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => onCollectionToggle(collection)}
                                                        disabled={loading}
                                                        color="primary"
                                                    />
                                                </TableCell>
                                                
                                                <TableCell>
                                                    <Typography 
                                                        variant="body2"
                                                        sx={{ 
                                                            fontWeight: isSelected ? 600 : 400,
                                                            color: isSelected ? 'primary.main' : 'text.primary'
                                                        }}
                                                    >
                                                        {collection}
                                                    </Typography>
                                                </TableCell>
                                                
                                                <TableCell>
                                                    <Chip
                                                        label={isSelected ? 'Selected' : 'Available'}
                                                        size="small"
                                                        color={isSelected ? 'success' : 'default'}
                                                        variant={isSelected ? 'filled' : 'outlined'}
                                                    />
                                                </TableCell>
                                                
                                                <TableCell align="right">
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={isSelected}
                                                                onChange={() => onCollectionToggle(collection)}
                                                                disabled={loading}
                                                                size="small"
                                                            />
                                                        }
                                                        label=""
                                                        sx={{ m: 0 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export const CollapsibleCollectionTable: React.FC<CollapsibleCollectionTableProps> = ({
    collections,
    selectedCollections,
    onCollectionToggle,
    onSelectAllInCategory,
    onDeselectAllInCategory,
    loading = false,
    compact = false,
    expandedCategories = [],
    onExpandedCategoriesChange
}) => {
    // Calculate selection statistics
    const selectionStats = useMemo(() => {
        const totalCollections = Object.values(collections)
            .reduce((sum, category) => sum + category.collections.length, 0);
        
        const selectedCount = Object.values(collections)
            .reduce((sum, category) => 
                sum + category.collections.filter(c => selectedCollections.includes(c)).length, 0
            );
        
        return {
            totalCollections,
            selectedCollections: selectedCount
        };
    }, [collections, selectedCollections]);

    // Initialize expanded categories if not provided
    const [internalExpandedCategories, setInternalExpandedCategories] = useState<string[]>([]);
    const currentExpandedCategories = expandedCategories.length > 0 ? expandedCategories : internalExpandedCategories;
    const setExpandedCategories = onExpandedCategoriesChange || setInternalExpandedCategories;

    // Initialize with all categories expanded if none are set
    React.useEffect(() => {
        if (currentExpandedCategories.length === 0 && Object.keys(collections).length > 0) {
            setExpandedCategories(Object.keys(collections));
        }
    }, [collections, currentExpandedCategories.length, setExpandedCategories]);

    // Handle individual category toggle
    const handleToggleCategory = (categoryName: string) => {
        const newExpanded = currentExpandedCategories.includes(categoryName)
            ? currentExpandedCategories.filter(cat => cat !== categoryName)
            : [...currentExpandedCategories, categoryName];
        setExpandedCategories(newExpanded);
    };

    // Handle expand all
    const handleExpandAll = () => {
        setExpandedCategories(Object.keys(collections));
    };

    // Handle collapse all
    const handleCollapseAll = () => {
        setExpandedCategories([]);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Selection Statistics Header */}
            <Paper 
                elevation={1}
                sx={{ 
                    p: compact ? 1.5 : 2, 
                    mb: 2,
                    backgroundColor: 'background.paper',
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CollectionsIcon color="primary" />
                        <Typography variant="h6">
                            Collection Selection
                        </Typography>
                    </Box>
                    
                    <Divider orientation="vertical" flexItem />
                    
                    <Chip
                        icon={<CategoryIcon />}
                        label={`${selectionStats.selectedCollections} of ${selectionStats.totalCollections} selected`}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                        Click category rows to expand/collapse collections
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                        <Button
                            size="small"
                            startIcon={<ExpandMoreIcon />}
                            onClick={handleExpandAll}
                            disabled={loading || currentExpandedCategories.length === Object.keys(collections).length}
                            variant="outlined"
                        >
                            Expand All
                        </Button>
                        <Button
                            size="small"
                            startIcon={<ExpandLessIcon />}
                            onClick={handleCollapseAll}
                            disabled={loading || currentExpandedCategories.length === 0}
                            variant="outlined"
                        >
                            Collapse All
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Collections Table */}
            <TableContainer component={Paper} elevation={1}>
                <Table size={compact ? 'small' : 'medium'}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell padding="checkbox">
                                <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', fontWeight: 600 }}>
                                    Expand
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', fontWeight: 600 }}>
                                    Category
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', fontWeight: 600 }}>
                                    Description
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="subtitle2" sx={{ color: 'primary.contrastText', fontWeight: 600 }}>
                                    Actions
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(collections).map(([categoryName, category]) => (
                            <CategoryRow
                                key={categoryName}
                                categoryName={categoryName}
                                category={category}
                                selectedCollections={selectedCollections}
                                onCollectionToggle={onCollectionToggle}
                                onSelectAllInCategory={onSelectAllInCategory}
                                onDeselectAllInCategory={onDeselectAllInCategory}
                                loading={loading}
                                expanded={currentExpandedCategories.includes(categoryName)}
                                onToggleExpanded={handleToggleCategory}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CollapsibleCollectionTable;
