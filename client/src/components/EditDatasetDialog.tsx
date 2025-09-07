/**
 * Edit Dataset Dialog Component
 * 
 * Provides comprehensive dataset editing capabilities including:
 * - Basic information updates (name, description, visibility, tags)
 * - Collection assignment management (add/remove collections)
 * - Real-time conflict analysis during editing
 * - Smart suggestions for optimization
 * 
 * Follows MPC library patterns for dataset management and conflict resolution.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    Typography,
    Grid,
    Alert,
    Paper,
    CircularProgress,
    FormControlLabel,
    Switch,
    Autocomplete,
    Divider,
    Card,
    CardContent
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Dataset as DatasetIcon,
    Storage as StorageIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

import { CloudDataset, cloudProjectIntegration } from '../services/CloudProjectIntegration';
import { datasetConflictAnalyzer, DatasetCreationConflictCheck } from '../services/DatasetConflictAnalyzer';
import { useDynamicCollections } from '../hooks/useDynamicCollections';
import { 
    DASHBOARD_COLLECTIONS_BY_CATEGORY as STATIC_COLLECTIONS, 
    ALL_DASHBOARD_COLLECTIONS as STATIC_ALL_COLLECTIONS
} from '../constants/dashboardCollections';

// Collections are now imported from shared constants to ensure sync with DatasetCreationWizard

export interface EditDatasetDialogProps {
    open: boolean;
    onClose: () => void;
    dataset: CloudDataset | null;
    onDatasetUpdated?: (updatedDataset: CloudDataset) => void;
    existingDatasets?: CloudDataset[];
}

export const EditDatasetDialog: React.FC<EditDatasetDialogProps> = ({
    open,
    onClose,
    dataset,
    onDatasetUpdated,
    existingDatasets = []
}) => {
    // Form state
    const [formData, setFormData] = useState<Partial<CloudDataset>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    // Conflict analysis state
    const [conflictCheck, setConflictCheck] = useState<DatasetCreationConflictCheck | null>(null);
    const [loadingConflictCheck, setLoadingConflictCheck] = useState(false);
    
    // 🔥 DYNAMIC COLLECTIONS: Real-time collection discovery
    const { 
        collections: DASHBOARD_COLLECTIONS_BY_CATEGORY, 
        allCollections: ALL_DASHBOARD_COLLECTIONS,
        loading: collectionsLoading,
        error: collectionsError,
        source: collectionsSource,
        refresh: refreshCollections,
        isValidCollection,
        getCategoryForCollection 
    } = useDynamicCollections();
    
    // Available collections for selection (fallback to static if dynamic loading)
    const availableCollections = collectionsLoading ? STATIC_ALL_COLLECTIONS : ALL_DASHBOARD_COLLECTIONS;

    // Initialize form data when dataset changes
    useEffect(() => {
        if (dataset && open) {
            setFormData({
                name: dataset.name,
                description: dataset.description,
                visibility: dataset.visibility,
                tags: dataset.tags || [],
                collectionAssignment: dataset.collectionAssignment || {
                    selectedCollections: [],
                    includeSubcollections: false,
                    dataFilters: [],
                    organizationScope: true
                }
            });
            setError(null);
            setValidationErrors({});
            setConflictCheck(null);
        }
    }, [dataset, open]);

    // Update form data helper
    const updateFormData = useCallback((updates: Partial<CloudDataset>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    // Check for conflicts when collection assignment changes
    const checkConflicts = useCallback(async () => {
        if (!dataset || !formData.collectionAssignment?.selectedCollections?.length) {
            setConflictCheck(null);
            return;
        }

        setLoadingConflictCheck(true);
        try {
            // Filter out the current dataset from conflict analysis
            const otherDatasets = existingDatasets.filter(ds => ds.id !== dataset.id);
            
            const conflicts = await datasetConflictAnalyzer.checkDatasetCreationConflicts(
                {
                    name: formData.name || dataset.name,
                    collectionAssignment: formData.collectionAssignment
                },
                otherDatasets
            );
            setConflictCheck(conflicts);
            console.log('✅ [EditDatasetDialog] Conflict check complete:', conflicts);
        } catch (error) {
            console.error('❌ [EditDatasetDialog] Failed to check conflicts:', error);
            setConflictCheck(null);
        } finally {
            setLoadingConflictCheck(false);
        }
    }, [dataset, formData.name, formData.collectionAssignment, existingDatasets]);

    // Debounced conflict checking
    useEffect(() => {
        if (open && formData.collectionAssignment?.selectedCollections?.length) {
            const timeoutId = setTimeout(() => {
                checkConflicts();
            }, 500);
            
            return () => clearTimeout(timeoutId);
        }
    }, [open, formData.collectionAssignment?.selectedCollections, checkConflicts]);

    // Validate form
    const validateForm = useCallback(() => {
        const errors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            errors.name = 'Dataset name is required';
        }

        if (dataset?.storage?.backend === 'firestore' && !formData.collectionAssignment?.selectedCollections?.length) {
            errors.collections = 'At least one collection must be selected for Firestore datasets';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData, dataset]);

    // Handle save
    const handleSave = useCallback(async () => {
        if (!dataset || !validateForm()) {
            return;
        }

        // Check for high-priority conflicts
        if (conflictCheck?.hasConflicts) {
            setError('Please resolve high-priority conflicts before saving');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('💾 [EditDatasetDialog] Saving dataset updates:', formData);

            const updatedDataset = await cloudProjectIntegration.updateDataset(dataset.id, {
                name: formData.name,
                description: formData.description,
                visibility: formData.visibility,
                tags: formData.tags,
                collectionAssignment: formData.collectionAssignment
            });

            if (updatedDataset) {
                console.log('✅ [EditDatasetDialog] Dataset updated successfully');
                onDatasetUpdated?.(updatedDataset);
                onClose();
            } else {
                setError('Failed to update dataset: No response from server');
            }
        } catch (error) {
            console.error('❌ [EditDatasetDialog] Failed to update dataset:', error);
            setError(`Failed to update dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [dataset, formData, validateForm, conflictCheck, onDatasetUpdated, onClose]);

    // Handle collection selection change
    const handleCollectionChange = useCallback((selectedCollections: string[]) => {
        updateFormData({
            collectionAssignment: {
                ...formData.collectionAssignment,
                selectedCollections,
                includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                dataFilters: formData.collectionAssignment?.dataFilters || [],
                organizationScope: formData.collectionAssignment?.organizationScope !== false
            }
        });
    }, [formData.collectionAssignment, updateFormData]);

    if (!dataset) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <EditIcon sx={{ color: '#8b5cf6' }} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Edit Dataset
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Update dataset information and collection assignments
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, overflow: 'auto' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon color="primary" />
                            Basic Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Dataset Name"
                            value={formData.name || ''}
                            onChange={(e) => updateFormData({ name: e.target.value })}
                            error={!!validationErrors.name}
                            helperText={validationErrors.name}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Visibility</InputLabel>
                            <Select
                                value={formData.visibility || 'private'}
                                onChange={(e) => updateFormData({ visibility: e.target.value as 'public' | 'private' | 'organization' })}
                                sx={{
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' }
                                }}
                            >
                                <MenuItem value="private">Private</MenuItem>
                                <MenuItem value="organization">Organization</MenuItem>
                                <MenuItem value="public">Public</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={formData.description || ''}
                            onChange={(e) => updateFormData({ description: e.target.value })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={[]}
                            value={formData.tags || []}
                            onChange={(_, newValue) => updateFormData({ tags: newValue })}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option}
                                        {...getTagProps({ index })}
                                        sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tags"
                                    placeholder="Add tags..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: 'white',
                                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                            '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    {/* Collection Assignment (only for Firestore datasets) */}
                    {dataset.storage?.backend === 'firestore' && (
                        <>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <StorageIcon color="primary" />
                                    Collection Assignment
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
                                        Select Collections by Category
                                    </Typography>
                                    
                                    {validationErrors.collections && (
                                        <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                                            {validationErrors.collections}
                                        </Alert>
                                    )}
                                    
                                    {Object.entries(DASHBOARD_COLLECTIONS_BY_CATEGORY).map(([categoryName, category]) => (
                                        <Box key={categoryName} sx={{ mb: 3 }}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 1, 
                                                mb: 1,
                                                p: 1,
                                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: 1,
                                                border: '1px solid rgba(255, 255, 255, 0.1)'
                                            }}>
                                                <Typography sx={{ fontSize: '1.2rem' }}>{category.icon}</Typography>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                                                        {categoryName}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                        {category.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                                                gap: 1,
                                                pl: 2
                                            }}>
                                                {category.collections.map((collection) => {
                                                    const isSelected = formData.collectionAssignment?.selectedCollections?.includes(collection) || false;
                                                    return (
                                                        <Box
                                                            key={collection}
                                                            onClick={() => {
                                                                const currentSelections = formData.collectionAssignment?.selectedCollections || [];
                                                                const newSelections = isSelected
                                                                    ? currentSelections.filter((c: string) => c !== collection)
                                                                    : [...currentSelections, collection];
                                                                handleCollectionChange(newSelections);
                                                            }}
                                                            sx={{
                                                                p: 1.5,
                                                                border: isSelected 
                                                                    ? '2px solid #8b5cf6' 
                                                                    : '1px solid rgba(255, 255, 255, 0.2)',
                                                                borderRadius: 1,
                                                                bgcolor: isSelected 
                                                                    ? 'rgba(139, 92, 246, 0.1)' 
                                                                    : 'rgba(255, 255, 255, 0.02)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    bgcolor: isSelected 
                                                                        ? 'rgba(139, 92, 246, 0.2)' 
                                                                        : 'rgba(255, 255, 255, 0.05)',
                                                                    borderColor: isSelected 
                                                                        ? '#8b5cf6' 
                                                                        : 'rgba(255, 255, 255, 0.4)',
                                                                    transform: 'translateY(-1px)'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <StorageIcon 
                                                                    fontSize="small" 
                                                                    sx={{ 
                                                                        color: isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.7)' 
                                                                    }} 
                                                                />
                                                                <Typography 
                                                                    variant="body2" 
                                                                    sx={{ 
                                                                        color: isSelected ? '#8b5cf6' : 'white',
                                                                        fontWeight: isSelected ? 600 : 400,
                                                                        fontSize: '0.85rem'
                                                                    }}
                                                                >
                                                                    {collection}
                                                                </Typography>
                                                                {isSelected && (
                                                                    <CheckCircleIcon 
                                                                        fontSize="small" 
                                                                        sx={{ color: '#8b5cf6', ml: 'auto' }} 
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.collectionAssignment?.organizationScope !== false}
                                            onChange={(e) => updateFormData({
                                                collectionAssignment: {
                                                    ...formData.collectionAssignment,
                                                    organizationScope: e.target.checked,
                                                    selectedCollections: formData.collectionAssignment?.selectedCollections || [],
                                                    includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                                                    dataFilters: formData.collectionAssignment?.dataFilters || []
                                                }
                                            })}
                                            sx={{ color: '#8b5cf6' }}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" sx={{ color: 'white' }}>
                                                Organization Scoped Data
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                Automatically filter data to current organization for multi-tenant isolation
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Grid>

                            {/* Selected Collections Preview */}
                            {formData.collectionAssignment?.selectedCollections?.length > 0 && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                                            Selected Collections ({formData.collectionAssignment.selectedCollections.length})
                                        </Typography>
                                        {formData.collectionAssignment.selectedCollections.map((collection: string) => (
                                            <Box key={collection} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <DatasetIcon fontSize="small" color="primary" />
                                                <Typography variant="body2" sx={{ color: 'white' }}>
                                                    {collection}
                                                    {formData.collectionAssignment?.organizationScope && (
                                                        <Chip 
                                                            label="Org Scoped" 
                                                            size="small" 
                                                            color="primary" 
                                                            sx={{ ml: 1, height: 20 }}
                                                        />
                                                    )}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Paper>
                                </Grid>
                            )}

                            {/* Conflict Analysis */}
                            {loadingConflictCheck && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                                        <CircularProgress size={20} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                            Analyzing collection conflicts...
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            {conflictCheck && (conflictCheck.warnings.length > 0 || conflictCheck.suggestions.length > 0) && (
                                <Grid item xs={12}>
                                    <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <WarningIcon fontSize="small" color="warning" />
                                                Smart Analysis Results
                                            </Typography>
                                            
                                            {/* Warnings */}
                                            {conflictCheck.warnings.map((warning, index) => (
                                                <Alert 
                                                    key={index}
                                                    severity={warning.severity}
                                                    sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.05)' }}
                                                >
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {warning.message}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                                        💡 {warning.recommendation}
                                                    </Typography>
                                                </Alert>
                                            ))}
                                            
                                            {/* Suggestions */}
                                            {conflictCheck.suggestions.map((suggestion, index) => (
                                                <Alert key={index} severity="info" sx={{ mb: 1, bgcolor: 'rgba(79, 70, 229, 0.1)' }}>
                                                    <Typography variant="body2">
                                                        <strong>{suggestion.type.toUpperCase()}:</strong> {suggestion.message}
                                                    </Typography>
                                                </Alert>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ 
                p: 3, 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                justifyContent: 'space-between'
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
                    }}
                >
                    Cancel
                </Button>
                
                <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={isLoading || conflictCheck?.hasConflicts}
                    sx={{
                        bgcolor: '#8b5cf6',
                        '&:hover': { bgcolor: '#7c3aed' },
                        '&:disabled': { 
                            bgcolor: 'rgba(139, 92, 246, 0.3)',
                            color: 'rgba(255, 255, 255, 0.5)'
                        }
                    }}
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDatasetDialog;
