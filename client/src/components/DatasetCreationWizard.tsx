/**
 * Dataset Creation Wizard
 * 
 * A comprehensive wizard for creating datasets with cloud provider-specific configurations.
 * Follows MPC library patterns for cloud provider abstraction and authentication.
 * 
 * Features:
 * - Multi-step wizard interface
 * - Cloud provider-specific forms (AWS, GCS, Azure, S3, Firestore)
 * - Authentication credential collection
 * - Schema template selection
 * - Validation and error handling
 * - Integration with existing cloud project system
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    FormControl,
    FormControlLabel,
    FormLabel,
    Switch,
    TextField,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    LinearProgress,
    Chip,
    Alert,
    IconButton,
    Select,
    MenuItem,
    Radio,
    RadioGroup,
    Paper,
    Stack,
    InputLabel,
    OutlinedInput,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
    Tooltip,
    Link,
    CircularProgress,
} from '@mui/material';
import {
    Close as CloseIcon,
    Storage as StorageIcon,
    Cloud as CloudIcon,
    Computer as ComputerIcon,
    Add as AddIcon,
    Check as CheckIcon,
    Settings as SettingsIcon,
    Security as SecurityIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    ExpandMore as ExpandMoreIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Launch as LaunchIcon,
    Dataset as DatasetIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';

import { cloudProjectIntegration, CloudDataset } from '../services/CloudProjectIntegration';
import { useAuth } from '@/context/AuthContext';
import { datasetConflictAnalyzer, DatasetCreationConflictCheck } from '../services/DatasetConflictAnalyzer';
import { useDynamicCollections } from '../hooks/useDynamicCollections';
import { useFirebaseCollectionSearch } from '../hooks/useCollectionSearch';
import CollectionSearchFilter from './CollectionSearchFilter';
import { 
    DASHBOARD_COLLECTIONS_BY_CATEGORY as STATIC_COLLECTIONS, 
    ALL_DASHBOARD_COLLECTIONS as STATIC_ALL_COLLECTIONS
} from '../constants/dashboardCollections';

// Collections are now imported from shared constants to ensure sync with EditDatasetDialog

// Cloud Provider Types (following MPC library patterns)
export type CloudProvider = 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'azure-blob' | 'local';

export interface DatasetCreationOptions {
    // Basic Information
    name: string;
    description?: string;
    visibility: 'private' | 'organization' | 'public';
    tags?: string[];
    
    // Cloud Provider Configuration
    cloudProvider: CloudProvider;
    
    // Authentication & Connection
    authentication: {
        // Google Cloud (Firestore/GCS)
        serviceAccountKey?: string;
        projectId?: string;
        
        // AWS (S3/Services)
        accessKeyId?: string;
        secretAccessKey?: string;
        region?: string;
        
        // Azure
        storageAccountName?: string;
        storageAccountKey?: string;
        connectionString?: string;
        
        // Generic
        endpoint?: string;
    };
    
    // Storage Configuration
    storage: {
        backend: 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local';
        // Google Cloud Storage
        gcsBucket?: string;
        gcsPrefix?: string;
        
        // Amazon S3
        s3Bucket?: string;
        s3Region?: string;
        s3Prefix?: string;
        
        // AWS Services
        awsBucket?: string;
        awsRegion?: string;
        awsPrefix?: string;
        
        // Azure Blob Storage
        azureContainer?: string;
        azurePrefix?: string;
    };
    
    // Schema Configuration
    schema?: {
        template?: 'custom' | 'inventory' | 'sessions' | 'media' | 'users' | 'analytics';
        customFields?: Array<{
            name: string;
            type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
            required?: boolean;
            description?: string;
        }>;
    };
    
    // Collection Assignment (for Firestore datasets)
    collectionAssignment?: {
        selectedCollections: string[];
        includeSubcollections?: boolean;
        dataFilters?: Array<{
            collection: string;
            field: string;
            operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains';
            value: any;
        }>;
        organizationScope?: boolean; // Whether to scope data to current organization
    };
    
    // Advanced Options
    advanced?: {
        encryption?: boolean;
        compression?: boolean;
        backup?: boolean;
        versioning?: boolean;
        accessLogging?: boolean;
    };
}

interface DatasetCreationWizardProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: (dataset: CloudDataset) => void;
    preselectedProvider?: CloudProvider;
    assignToProject?: string; // Project ID to auto-assign the dataset to
}

const STEPS = [
    'Basic Information',
    'Cloud Provider Selection',
    'Authentication Setup',
    'Storage Configuration',
    'Collection Assignment', // New step for Firestore collection assignment
    'Advanced Options',
    'Review & Create'
];

const SCHEMA_TEMPLATES = {
    custom: {
        name: 'Custom Schema',
        description: 'Define your own fields and structure',
        icon: <SettingsIcon />,
        fields: []
    },
    inventory: {
        name: 'Inventory Management',
        description: 'Pre-configured for inventory tracking and management',
        icon: <StorageIcon />,
        fields: [
            { name: 'itemId', type: 'string', required: true, description: 'Unique item identifier' },
            { name: 'name', type: 'string', required: true, description: 'Item name' },
            { name: 'category', type: 'string', required: false, description: 'Item category' },
            { name: 'quantity', type: 'number', required: true, description: 'Current quantity' },
            { name: 'location', type: 'string', required: false, description: 'Storage location' },
            { name: 'lastUpdated', type: 'date', required: true, description: 'Last update timestamp' }
        ]
    },
    sessions: {
        name: 'Session Management',
        description: 'Optimized for production sessions and workflows',
        icon: <DatasetIcon />,
        fields: [
            { name: 'sessionId', type: 'string', required: true, description: 'Session identifier' },
            { name: 'title', type: 'string', required: true, description: 'Session title' },
            { name: 'status', type: 'string', required: true, description: 'Session status' },
            { name: 'startTime', type: 'date', required: true, description: 'Session start time' },
            { name: 'endTime', type: 'date', required: false, description: 'Session end time' },
            { name: 'participants', type: 'array', required: false, description: 'Session participants' }
        ]
    },
    media: {
        name: 'Media Files',
        description: 'Designed for media file management and metadata',
        icon: <CloudIcon />,
        fields: [
            { name: 'fileId', type: 'string', required: true, description: 'File identifier' },
            { name: 'filename', type: 'string', required: true, description: 'Original filename' },
            { name: 'mimeType', type: 'string', required: true, description: 'File MIME type' },
            { name: 'size', type: 'number', required: true, description: 'File size in bytes' },
            { name: 'duration', type: 'number', required: false, description: 'Media duration (if applicable)' },
            { name: 'metadata', type: 'object', required: false, description: 'Additional metadata' }
        ]
    },
    users: {
        name: 'User Management',
        description: 'User profiles and authentication data',
        icon: <SecurityIcon />,
        fields: [
            { name: 'userId', type: 'string', required: true, description: 'User identifier' },
            { name: 'email', type: 'string', required: true, description: 'User email address' },
            { name: 'name', type: 'string', required: true, description: 'User display name' },
            { name: 'role', type: 'string', required: true, description: 'User role' },
            { name: 'lastLogin', type: 'date', required: false, description: 'Last login timestamp' },
            { name: 'preferences', type: 'object', required: false, description: 'User preferences' }
        ]
    },
    analytics: {
        name: 'Analytics & Metrics',
        description: 'Event tracking and analytics data',
        icon: <InfoIcon />,
        fields: [
            { name: 'eventId', type: 'string', required: true, description: 'Event identifier' },
            { name: 'eventType', type: 'string', required: true, description: 'Type of event' },
            { name: 'timestamp', type: 'date', required: true, description: 'Event timestamp' },
            { name: 'userId', type: 'string', required: false, description: 'Associated user ID' },
            { name: 'properties', type: 'object', required: false, description: 'Event properties' },
            { name: 'value', type: 'number', required: false, description: 'Numeric value (if applicable)' }
        ]
    }
};

const DEFAULT_FORM_DATA: DatasetCreationOptions = {
    name: '',
    description: '',
    visibility: 'private',
    tags: [],
    cloudProvider: 'firestore',
    authentication: {},
    storage: {
        backend: 'firestore'
    },
    schema: {
        // Use the unified Backbone Logic schema automatically
        template: 'custom',
        customFields: []
    },
    collectionAssignment: {
        selectedCollections: [],
        includeSubcollections: false,
        dataFilters: [],
        organizationScope: true // Default to organization-scoped data for multi-tenancy
    },
    advanced: {
        encryption: false,
        compression: false,
        backup: true,
        versioning: false,
        accessLogging: false
    }
};

export const DatasetCreationWizard: React.FC<DatasetCreationWizardProps> = React.memo(({
    open,
    onClose,
    onSuccess,
    preselectedProvider,
    assignToProject
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<DatasetCreationOptions>(DEFAULT_FORM_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionTestResult, setConnectionTestResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    
    // 🆕 NEW: Conflict detection state
    const [conflictCheck, setConflictCheck] = useState<DatasetCreationConflictCheck | null>(null);
    const [existingDatasets, setExistingDatasets] = useState<CloudDataset[]>([]);
    const [loadingConflictCheck, setLoadingConflictCheck] = useState(false);
    
    // Expand/collapse state for collection categories
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // 🔥 DYNAMIC COLLECTIONS: Real-time collection discovery with auto-monitoring
    const { 
        collections: DASHBOARD_COLLECTIONS_BY_CATEGORY, 
        allCollections: ALL_DASHBOARD_COLLECTIONS,
        loading: collectionsLoading,
        error: collectionsError,
        source: collectionsSource,
        refresh: refreshCollections,
        startRealTimeMonitoring,
        stopRealTimeMonitoring,
        isValidCollection,
        getCategoryForCollection 
    } = useDynamicCollections();

    // 🔍 COLLECTION SEARCH: Advanced search and filtering for collections
    const {
        state: searchState,
        actions: searchActions,
        filteredCollections,
        getStatistics
    } = useFirebaseCollectionSearch(
        DASHBOARD_COLLECTIONS_BY_CATEGORY,
        formData.collectionAssignment?.selectedCollections || [],
        {
            initialSearchQuery: '',
            initialCategory: 'all',
            initialShowSelectedOnly: false
        }
    );

    // Reset form when dialog opens - use useCallback to prevent unnecessary re-renders
    const resetForm = useCallback(() => {
        const selectedProvider = preselectedProvider || 'firestore';
        // Map azure-blob to azure for the storage backend
        const storageBackend = selectedProvider === 'azure-blob' ? 'azure' : selectedProvider;
        setFormData({
            ...DEFAULT_FORM_DATA,
            cloudProvider: selectedProvider,
            storage: {
                ...DEFAULT_FORM_DATA.storage,
                backend: storageBackend as 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local'
            }
        });
        setActiveStep(0);
        setError(null);
        setValidationErrors({});
        setShowCredentials({});
        setConnectionTestResult(null);
    }, [preselectedProvider]);

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, resetForm]);

    // 🔄 REAL-TIME COLLECTION MONITORING: Start monitoring when dialog opens
    useEffect(() => {
        if (open) {
            console.log('🔄 [DatasetCreationWizard] Starting real-time collection monitoring...');
            startRealTimeMonitoring();
            
            return () => {
                console.log('🛑 [DatasetCreationWizard] Stopping real-time collection monitoring...');
                stopRealTimeMonitoring();
            };
        }
    }, [open, startRealTimeMonitoring, stopRealTimeMonitoring]);

    // Memoize form data updates to prevent unnecessary re-renders
    const updateFormData = useCallback((updates: Partial<DatasetCreationOptions>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        // Clear related validation errors
        const newErrors = { ...validationErrors };
        Object.keys(updates).forEach(key => {
            delete newErrors[key];
        });
        setValidationErrors(newErrors);
    }, [validationErrors]);

    // Memoize validation function
    const validateStep = useCallback((step: number): boolean => {
        const errors: Record<string, string> = {};

        switch (step) {
            case 0: // Basic Information
                if (!formData.name.trim()) {
                    errors.name = 'Dataset name is required';
                }
                if (formData.name.length > 100) {
                    errors.name = 'Dataset name must be 100 characters or less';
                }
                break;
            case 1: // Cloud Provider Selection
                if (!formData.cloudProvider) {
                    errors.cloudProvider = 'Please select a cloud provider';
                }
                break;
            case 2: // Authentication Setup
                if (formData.cloudProvider === 'firestore' || formData.cloudProvider === 'gcs') {
                    if (!formData.authentication.projectId?.trim()) {
                        errors.projectId = 'Project ID is required for Google Cloud services';
                    }
                }
                if (formData.cloudProvider === 's3' || formData.cloudProvider === 'aws') {
                    if (!formData.authentication.accessKeyId?.trim()) {
                        errors.accessKeyId = 'Access Key ID is required for AWS services';
                    }
                    if (!formData.authentication.secretAccessKey?.trim()) {
                        errors.secretAccessKey = 'Secret Access Key is required for AWS services';
                    }
                }
                if (formData.cloudProvider === 'azure-blob') {
                    if (!formData.authentication.connectionString?.trim()) {
                        errors.connectionString = 'Connection string is required for Azure services';
                    }
                }
                break;
            case 3: // Storage Configuration
                if (formData.cloudProvider === 'gcs' && !formData.storage.gcsBucket?.trim()) {
                    errors.gcsBucket = 'GCS bucket name is required';
                }
                if (formData.cloudProvider === 's3' && !formData.storage.s3Bucket?.trim()) {
                    errors.s3Bucket = 'S3 bucket name is required';
                }
                if (formData.cloudProvider === 'azure-blob' && !formData.storage.azureContainer?.trim()) {
                    errors.azureContainer = 'Azure container name is required';
                }
                break;
            case 4: // Collection Assignment
                if (formData.cloudProvider === 'firestore') {
                    if (!formData.collectionAssignment?.selectedCollections?.length) {
                        errors.collections = 'Please select at least one Firestore collection for this dataset';
                    }
                }
                // For non-Firestore providers, collection assignment is optional/not applicable
                break;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Memoize step navigation handlers
    const handleNext = useCallback(() => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }
    }, [activeStep, validateStep]);

    const handleBack = useCallback(() => {
        setActiveStep(prev => Math.max(prev - 1, 0));
    }, []);

    const handleStepClick = useCallback((step: number) => {
        if (step < activeStep) {
            setActiveStep(step);
        }
    }, [activeStep]);

    // Memoize credential visibility handlers
    const toggleCredentialVisibility = useCallback((field: string) => {
        setShowCredentials(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    }, []);

    // Memoize connection test handler
    const testConnection = useCallback(async () => {
        if (!formData.cloudProvider) return;

        setTestingConnection(true);
        setConnectionTestResult(null);

        try {
            // Simulate connection test - replace with actual implementation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setConnectionTestResult({
                success: true,
                message: 'Connection test successful!'
            });
        } catch (error) {
            setConnectionTestResult({
                success: false,
                message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        } finally {
            setTestingConnection(false);
        }
    }, [formData.cloudProvider]);

    // Memoize form submission handler
    const handleSubmit = useCallback(async () => {
        if (!validateStep(activeStep)) return;

        setIsLoading(true);
        setError(null);

        try {
            // Use the actual service to create the dataset
            const newDataset = await cloudProjectIntegration.createDataset({
                name: formData.name,
                description: formData.description,
                visibility: formData.visibility,
                tags: formData.tags,
                storage: formData.storage,
                schema: formData.schema,
                projectId: assignToProject || 'default-project',
                // Include collection assignment for Firestore datasets
                collectionAssignment: formData.cloudProvider === 'firestore' ? formData.collectionAssignment : undefined
            });

            if (newDataset) {
                onSuccess?.(newDataset);
                onClose?.();
            } else {
                setError('Failed to create dataset: No dataset returned');
            }
        } catch (error) {
            setError(`Failed to create dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [activeStep, validateStep, formData, onSuccess, onClose]);

    // 🆕 NEW: Load existing datasets for conflict analysis
    const loadExistingDatasets = useCallback(async () => {
        try {
            const datasets = await cloudProjectIntegration.listDatasets();
            setExistingDatasets(datasets);
            console.log('✅ [DatasetCreationWizard] Loaded existing datasets for conflict analysis:', datasets.length);
        } catch (error) {
            console.warn('⚠️ [DatasetCreationWizard] Failed to load existing datasets:', error);
            setExistingDatasets([]);
        }
    }, []);

    // 🆕 NEW: Check for conflicts when collection assignment changes
    const checkConflicts = useCallback(async () => {
        if (formData.cloudProvider !== 'firestore' || !formData.collectionAssignment?.selectedCollections?.length) {
            setConflictCheck(null);
            return;
        }

        setLoadingConflictCheck(true);
        try {
            const conflicts = await datasetConflictAnalyzer.checkDatasetCreationConflicts(
                {
                    name: formData.name,
                    collectionAssignment: formData.collectionAssignment
                },
                existingDatasets
            );
            setConflictCheck(conflicts);
            console.log('✅ [DatasetCreationWizard] Conflict check complete:', conflicts);
        } catch (error) {
            console.error('❌ [DatasetCreationWizard] Failed to check conflicts:', error);
            setConflictCheck(null);
        } finally {
            setLoadingConflictCheck(false);
        }
    }, [formData.cloudProvider, formData.name, formData.collectionAssignment, existingDatasets]);

    // Handle collection toggle for search filter
    const handleCollectionToggle = useCallback((collection: string) => {
        const currentSelections = formData.collectionAssignment?.selectedCollections || [];
        const newSelections = currentSelections.includes(collection)
            ? currentSelections.filter(c => c !== collection)
            : [...currentSelections, collection];
        
        updateFormData({
            collectionAssignment: {
                ...formData.collectionAssignment,
                selectedCollections: newSelections,
                includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                dataFilters: formData.collectionAssignment?.dataFilters || [],
                organizationScope: formData.collectionAssignment?.organizationScope !== false
            }
        });
    }, [formData.collectionAssignment, updateFormData]);

    // Handle select all collections
    const handleSelectAll = useCallback(async () => {
        try {
            // Use validator to get all available collections (including dynamic ones)
            const { datasetCollectionValidator } = await import('../services/DatasetCollectionValidator');
            const allCollections = await datasetCollectionValidator.getCollectionRecommendations('ALL_DATA');
            
            updateFormData({
                collectionAssignment: {
                    ...formData.collectionAssignment,
                    selectedCollections: allCollections,
                    includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                    dataFilters: formData.collectionAssignment?.dataFilters || [],
                    organizationScope: formData.collectionAssignment?.organizationScope !== false
                }
            });
            
            console.log('✅ [DatasetCreationWizard] Selected all collections:', allCollections.length);
        } catch (error) {
            console.warn('⚠️ [DatasetCreationWizard] Failed to get dynamic collections, using static fallback:', error);
            // Fallback to static collections
            updateFormData({
                collectionAssignment: {
                    ...formData.collectionAssignment,
                    selectedCollections: ALL_DASHBOARD_COLLECTIONS,
                    includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                    dataFilters: formData.collectionAssignment?.dataFilters || [],
                    organizationScope: formData.collectionAssignment?.organizationScope !== false
                }
            });
        }
    }, [formData.collectionAssignment, updateFormData]);

    // Handle deselect all collections
    const handleDeselectAll = useCallback(() => {
        updateFormData({
            collectionAssignment: {
                ...formData.collectionAssignment,
                selectedCollections: [],
                includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                dataFilters: formData.collectionAssignment?.dataFilters || [],
                organizationScope: formData.collectionAssignment?.organizationScope !== false
            }
        });
    }, [formData.collectionAssignment, updateFormData]);

    // Handle select all collections in a specific category
    const handleSelectAllInCategory = useCallback((categoryName: string, categoryCollections: string[]) => {
        const currentSelections = formData.collectionAssignment?.selectedCollections || [];
        const newSelections = [...new Set([...currentSelections, ...categoryCollections])];
        
        updateFormData({
            collectionAssignment: {
                ...formData.collectionAssignment,
                selectedCollections: newSelections,
                includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                dataFilters: formData.collectionAssignment?.dataFilters || [],
                organizationScope: formData.collectionAssignment?.organizationScope !== false
            }
        });
    }, [formData.collectionAssignment, updateFormData]);

    // Handle deselect all collections in a specific category
    const handleDeselectAllInCategory = useCallback((categoryName: string, categoryCollections: string[]) => {
        const currentSelections = formData.collectionAssignment?.selectedCollections || [];
        const newSelections = currentSelections.filter(collection => !categoryCollections.includes(collection));
        
        updateFormData({
            collectionAssignment: {
                ...formData.collectionAssignment,
                selectedCollections: newSelections,
                includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                dataFilters: formData.collectionAssignment?.dataFilters || [],
                organizationScope: formData.collectionAssignment?.organizationScope !== false
            }
        });
    }, [formData.collectionAssignment, updateFormData]);

    // Load existing datasets when dialog opens
    useEffect(() => {
        if (open) {
            loadExistingDatasets();
        }
    }, [open, loadExistingDatasets]);

    // Check conflicts when collection assignment changes
    useEffect(() => {
        if (activeStep === 4 && formData.collectionAssignment?.selectedCollections?.length) {
            const timeoutId = setTimeout(() => {
                checkConflicts();
            }, 500); // Debounce conflict checking
            
            return () => clearTimeout(timeoutId);
        }
    }, [activeStep, formData.collectionAssignment?.selectedCollections, checkConflicts]);

    // Memoize step content rendering function
    const renderStepContent = useCallback((step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Dataset Name"
                                    value={formData.name}
                                    onChange={(e) => updateFormData({ name: e.target.value })}
                                    error={!!validationErrors.name}
                                    helperText={validationErrors.name}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description (Optional)"
                                    value={formData.description || ''}
                                    onChange={(e) => updateFormData({ description: e.target.value })}
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <FormLabel>Visibility</FormLabel>
                                    <RadioGroup
                                        value={formData.visibility}
                                        onChange={(e) => updateFormData({ visibility: e.target.value as any })}
                                        row
                                    >
                                        <FormControlLabel value="private" control={<Radio />} label="Private" />
                                        <FormControlLabel value="organization" control={<Radio />} label="Organization" />
                                        <FormControlLabel value="public" control={<Radio />} label="Public" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Tags (Optional)"
                                    value={formData.tags?.join(', ') || ''}
                                    onChange={(e) => updateFormData({ 
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                                    })}
                                    placeholder="tag1, tag2, tag3"
                                    helperText="Comma-separated tags for organization"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Cloud Provider Selection
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { value: 'firestore', label: 'Firestore', icon: <CloudIcon />, description: 'Google Cloud Firestore' },
                                { value: 'gcs', label: 'Google Cloud Storage', icon: <StorageIcon />, description: 'Google Cloud Storage' },
                                { value: 's3', label: 'Amazon S3', icon: <CloudIcon />, description: 'Amazon S3' },
                                { value: 'aws', label: 'AWS Services', icon: <CloudIcon />, description: 'AWS Services' },
                                { value: 'azure-blob', label: 'Azure Blob Storage', icon: <StorageIcon />, description: 'Microsoft Azure' },
                                { value: 'local', label: 'Local Storage', icon: <ComputerIcon />, description: 'Local file system' }
                            ].map((provider) => (
                                <Grid item xs={12} sm={6} md={4} key={provider.value}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            border: formData.cloudProvider === provider.value ? '2px solid' : '1px solid',
                                            borderColor: formData.cloudProvider === provider.value ? 'primary.main' : 'divider',
                                            '&:hover': { borderColor: 'primary.main' }
                                        }}
                                        onClick={() => {
                                            const selectedProvider = provider.value as CloudProvider;
                                            // Map azure-blob to azure for the storage backend
                                            const storageBackend = selectedProvider === 'azure-blob' ? 'azure' : selectedProvider;
                                            updateFormData({ 
                                                cloudProvider: selectedProvider,
                                                storage: { ...formData.storage, backend: storageBackend as 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local' }
                                            });
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                            <Box sx={{ mb: 1 }}>
                                                {provider.icon}
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {provider.label}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {provider.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Authentication Setup
                        </Typography>
                        {formData.cloudProvider === 'firestore' || formData.cloudProvider === 'gcs' ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Project ID"
                                        value={formData.authentication.projectId || ''}
                                        onChange={(e) => updateFormData({ 
                                            authentication: { ...formData.authentication, projectId: e.target.value }
                                        })}
                                        error={!!validationErrors.projectId}
                                        helperText={validationErrors.projectId}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Service Account Key (Optional)"
                                        value={formData.authentication.serviceAccountKey || ''}
                                        onChange={(e) => updateFormData({ 
                                            authentication: { ...formData.authentication, serviceAccountKey: e.target.value }
                                        })}
                                        multiline
                                        rows={4}
                                        placeholder="Paste your service account JSON key here..."
                                    />
                                </Grid>
                            </Grid>
                        ) : formData.cloudProvider === 's3' || formData.cloudProvider === 'aws' ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Access Key ID"
                                        value={formData.authentication.accessKeyId || ''}
                                        onChange={(e) => updateFormData({ 
                                            authentication: { ...formData.authentication, accessKeyId: e.target.value }
                                        })}
                                        error={!!validationErrors.accessKeyId}
                                        helperText={validationErrors.accessKeyId}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Secret Access Key"
                                        value={formData.authentication.secretAccessKey || ''}
                                        onChange={(e) => updateFormData({ 
                                            authentication: { ...formData.authentication, secretAccessKey: e.target.value }
                                        })}
                                        error={!!validationErrors.secretAccessKey}
                                        helperText={validationErrors.secretAccessKey}
                                        required
                                        type={showCredentials.secretAccessKey ? 'text' : 'password'}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => toggleCredentialVisibility('secretAccessKey')}
                                                        edge="end"
                                                    >
                                                        {showCredentials.secretAccessKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Region"
                                        value={formData.authentication.region || ''}
                                        onChange={(e) => updateFormData({ 
                                            authentication: { ...formData.authentication, region: e.target.value }
                                        })}
                                        placeholder="us-east-1"
                                    />
                                </Grid>
                            </Grid>
                        ) : formData.cloudProvider === 'azure-blob' ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Connection String"
                                        value={formData.authentication.connectionString || ''}
                                        onChange={(e) => updateFormData({ 
                                            authentication: { ...formData.authentication, connectionString: e.target.value }
                                        })}
                                        error={!!validationErrors.connectionString}
                                        helperText={validationErrors.connectionString}
                                        required
                                        multiline
                                        rows={3}
                                        placeholder="DefaultEndpointsProtocol=https;AccountName=..."
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Typography color="text.secondary">
                                No authentication required for local storage.
                            </Typography>
                        )}
                        
                        {formData.cloudProvider !== 'local' && (
                            <Box sx={{ mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    onClick={testConnection}
                                    disabled={testingConnection}
                                    startIcon={testingConnection ? <CircularProgress size={16} /> : <CheckIcon />}
                                >
                                    {testingConnection ? 'Testing Connection...' : 'Test Connection'}
                                </Button>
                                
                                {connectionTestResult && (
                                    <Alert 
                                        severity={connectionTestResult.success ? 'success' : 'error'} 
                                        sx={{ mt: 2 }}
                                    >
                                        {connectionTestResult.message}
                                    </Alert>
                                )}
                            </Box>
                        )}
                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Storage Configuration
                        </Typography>
                        {formData.cloudProvider === 'gcs' && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="GCS Bucket Name"
                                        value={formData.storage.gcsBucket || ''}
                                        onChange={(e) => updateFormData({ 
                                            storage: { ...formData.storage, gcsBucket: e.target.value }
                                        })}
                                        error={!!validationErrors.gcsBucket}
                                        helperText={validationErrors.gcsBucket}
                                        required
                                        placeholder="my-dataset-bucket"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Prefix (Optional)"
                                        value={formData.storage.gcsPrefix || ''}
                                        onChange={(e) => updateFormData({ 
                                            storage: { ...formData.storage, gcsPrefix: e.target.value }
                                        })}
                                        placeholder="datasets/"
                                        helperText="Optional folder prefix for organizing datasets"
                                    />
                                </Grid>
                            </Grid>
                        )}
                        {formData.cloudProvider === 's3' && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="S3 Bucket Name"
                                        value={formData.storage.s3Bucket || ''}
                                        onChange={(e) => updateFormData({ 
                                            storage: { ...formData.storage, s3Bucket: e.target.value }
                                        })}
                                        error={!!validationErrors.s3Bucket}
                                        helperText={validationErrors.s3Bucket}
                                        required
                                        placeholder="my-dataset-bucket"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Region"
                                        value={formData.storage.s3Region || ''}
                                        onChange={(e) => updateFormData({ 
                                            storage: { ...formData.storage, s3Region: e.target.value }
                                        })}
                                        placeholder="us-east-1"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Prefix (Optional)"
                                        value={formData.storage.s3Prefix || ''}
                                        onChange={(e) => updateFormData({ 
                                            storage: { ...formData.storage, s3Prefix: e.target.value }
                                        })}
                                        placeholder="datasets/"
                                        helperText="Optional folder prefix for organizing datasets"
                                    />
                                </Grid>
                            </Grid>
                        )}
                        {formData.cloudProvider === 'azure-blob' && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Container Name"
                                        value={formData.storage.azureContainer || ''}
                                        onChange={(e) => updateFormData({ 
                                            storage: { ...formData.storage, azureContainer: e.target.value }
                                        })}
                                        error={!!validationErrors.azureContainer}
                                        helperText={validationErrors.azureContainer}
                                        required
                                        placeholder="datasets"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Prefix (Optional)"
                                        value={formData.storage.azurePrefix || ''}
                                        onChange={(e) => updateFormData({ 
                                            storage: { ...formData.storage, azurePrefix: e.target.value }
                                        })}
                                        placeholder="datasets/"
                                        helperText="Optional folder prefix for organizing datasets"
                                    />
                                </Grid>
                            </Grid>
                        )}
                        {formData.cloudProvider === 'local' && (
                            <Typography color="text.secondary">
                                Local storage will be configured automatically based on your system settings.
                            </Typography>
                        )}
                        
                        {/* Notification about automatic schema selection */}
                        <Alert severity="info" sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Using Backbone Logic Unified Schema
                            </Typography>
                            <Typography variant="body2">
                                The standard Backbone Logic schema will be automatically applied to this dataset.
                                This ensures full compatibility with all application features and provides a consistent data structure.
                            </Typography>
                        </Alert>
                    </Box>
                );
            // Case 4 is now Advanced Options (previously case 5)
            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Collection Assignment
                        </Typography>
                        {formData.cloudProvider === 'firestore' ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        <Typography variant="body2">
                                            Select which Firestore collections this dataset should include. 
                                            Data will be automatically scoped to your organization for security.
                                        </Typography>
                                    </Alert>
                                </Grid>
                                <Grid item xs={12}>
                                    <CollectionSearchFilter
                                        collections={DASHBOARD_COLLECTIONS_BY_CATEGORY}
                                        allCollections={ALL_DASHBOARD_COLLECTIONS}
                                        selectedCollections={formData.collectionAssignment?.selectedCollections || []}
                                        searchQuery={searchState.searchQuery}
                                        selectedCategory={searchState.selectedCategory}
                                        showSelectedOnly={searchState.showSelectedOnly}
                                        onSearchChange={searchActions.setSearchQuery}
                                        onCategoryChange={searchActions.setSelectedCategory}
                                        onShowSelectedOnlyChange={searchActions.setShowSelectedOnly}
                                        onCollectionToggle={handleCollectionToggle}
                                        onSelectAll={handleSelectAll}
                                        onDeselectAll={handleDeselectAll}
                                        onSelectAllInCategory={handleSelectAllInCategory}
                                        onDeselectAllInCategory={handleDeselectAllInCategory}
                                        onRefresh={refreshCollections}
                                        loading={collectionsLoading}
                                        error={collectionsError}
                                        totalCount={ALL_DASHBOARD_COLLECTIONS.length}
                                        selectedCount={formData.collectionAssignment?.selectedCollections?.length || 0}
                                        variant="wizard"
                                        compact={false}
                                        layout="table"
                                        expandedCategories={expandedCategories}
                                        onExpandedCategoriesChange={setExpandedCategories}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.collectionAssignment?.includeSubcollections || false}
                                                onChange={(e) => updateFormData({
                                                    collectionAssignment: {
                                                        selectedCollections: formData.collectionAssignment?.selectedCollections || [],
                                                        includeSubcollections: e.target.checked,
                                                        dataFilters: formData.collectionAssignment?.dataFilters || [],
                                                        organizationScope: formData.collectionAssignment?.organizationScope || false
                                                    }
                                                })}
                                            />
                                        }
                                        label="Include Subcollections"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.collectionAssignment?.organizationScope !== false}
                                                onChange={(e) => updateFormData({
                                                    collectionAssignment: {
                                                        selectedCollections: formData.collectionAssignment?.selectedCollections || [],
                                                        includeSubcollections: formData.collectionAssignment?.includeSubcollections || false,
                                                        dataFilters: formData.collectionAssignment?.dataFilters || [],
                                                        organizationScope: e.target.checked
                                                    }
                                                })}
                                            />
                                        }
                                        label="Organization Scoped Data (Recommended for Multi-Tenancy)"
                                    />
                                </Grid>
                                {(formData.collectionAssignment?.selectedCollections?.length || 0) > 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Selected Collections Preview 
                                            <Chip 
                                                label={`${formData.collectionAssignment?.selectedCollections?.length || 0} selected`}
                                                size="small" 
                                                color="primary" 
                                                variant="outlined"
                                            />
                                        </Typography>
                                        <Paper sx={{ 
                                            p: 2, 
                                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                                            border: '1px solid rgba(25, 118, 210, 0.12)',
                                            borderRadius: 2
                                        }}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: 1,
                                                alignItems: 'center'
                                            }}>
                                                {formData.collectionAssignment?.selectedCollections?.map((collection) => (
                                                    <Chip
                                                        key={collection}
                                                        icon={<DatasetIcon fontSize="small" />}
                                                        label={collection}
                                                        variant="filled"
                                                        color="primary"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                            color: '#ffffff',
                                                            border: '1px solid rgba(25, 118, 210, 0.2)',
                                                            '& .MuiChip-icon': {
                                                                color: '#ffffff'
                                                            },
                                                            '&:hover': {
                                                                bgcolor: 'rgba(25, 118, 210, 0.12)'
                                                            }
                                                        }}
                                                    />
                                                ))}
                                                {formData.collectionAssignment?.organizationScope && (
                                                    <Chip 
                                                        label="Organization Scoped" 
                                                        size="small" 
                                                        color="success"
                                                        variant="outlined"
                                                        sx={{ 
                                                            ml: 1,
                                                            fontWeight: 600,
                                                            bgcolor: 'rgba(46, 125, 50, 0.04)'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Paper>
                                    </Grid>
                                )}
                                
                                {/* 🆕 NEW: Conflict Analysis and Warnings */}
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
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <WarningIcon fontSize="small" color="warning" />
                                                Smart Analysis Results
                                            </Typography>
                                            
                                            {/* Conflict Warnings */}
                                            {conflictCheck.warnings.map((warning, index) => (
                                                <Alert 
                                                    key={index}
                                                    severity={warning.severity}
                                                    sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.05)' }}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                            {warning.message}
                                                        </Typography>
                                                        {warning.affectedDatasets.length > 0 && (
                                                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                                                Affected datasets: {warning.affectedDatasets.join(', ')}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                                            💡 {warning.recommendation}
                                                        </Typography>
                                                    </Box>
                                                </Alert>
                                            ))}
                                            
                                            {/* Smart Suggestions */}
                                            {conflictCheck.suggestions.length > 0 && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mb: 1 }}>
                                                        💡 Smart Suggestions:
                                                    </Typography>
                                                    {conflictCheck.suggestions.map((suggestion, index) => (
                                                        <Paper key={index} sx={{ p: 2, mb: 1, bgcolor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Chip 
                                                                    label={suggestion.type.toUpperCase()} 
                                                                    size="small" 
                                                                    sx={{ 
                                                                        bgcolor: 'rgba(79, 70, 229, 0.2)', 
                                                                        color: '#8b5cf6',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.65rem'
                                                                    }} 
                                                                />
                                                                <Typography variant="body2" sx={{ color: 'white' }}>
                                                                    {suggestion.message}
                                                                </Typography>
                                                            </Box>
                                                        </Paper>
                                                    ))}
                                                </Box>
                                            )}
                                            
                                            {/* Conflict Summary */}
                                            {conflictCheck.hasConflicts && (
                                                <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        ⚠️ High-priority conflicts detected. Please review and resolve before proceeding.
                                                    </Typography>
                                                </Alert>
                                            )}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        ) : (
                            <Alert severity="warning">
                                Collection assignment is only available for Firestore datasets. 
                                Please select Firestore as your cloud provider to configure collection assignment.
                            </Alert>
                        )}
                    </Box>
                );
            case 5:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Advanced Options
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.advanced?.encryption || false}
                                            onChange={(e) => updateFormData({ 
                                                advanced: { ...formData.advanced, encryption: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Enable Encryption"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.advanced?.compression || false}
                                            onChange={(e) => updateFormData({ 
                                                advanced: { ...formData.advanced, compression: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Enable Compression"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.advanced?.backup || false}
                                            onChange={(e) => updateFormData({ 
                                                advanced: { ...formData.advanced, backup: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Enable Backup"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.advanced?.versioning || false}
                                            onChange={(e) => updateFormData({ 
                                                advanced: { ...formData.advanced, versioning: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Enable Versioning"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.advanced?.accessLogging || false}
                                            onChange={(e) => updateFormData({ 
                                                advanced: { ...formData.advanced, accessLogging: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Enable Access Logging"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 6:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review & Create
                        </Typography>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Dataset Configuration Summary
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Name: <strong>{formData.name}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Provider: <strong>{formData.cloudProvider}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Visibility: <strong>{formData.visibility}</strong>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Schema: <strong>Backbone Logic Unified Schema</strong>
                                    </Typography>
                                </Grid>
                                {formData.cloudProvider === 'firestore' && formData.collectionAssignment?.selectedCollections?.length && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            <strong>Assigned Collections:</strong>
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                            {formData.collectionAssignment.selectedCollections.map((collection) => (
                                                <Chip 
                                                    key={collection} 
                                                    label={collection} 
                                                    size="small" 
                                                    color="primary"
                                                    icon={<DatasetIcon />}
                                                />
                                            ))}
                                        </Box>
                                        {formData.collectionAssignment.organizationScope && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                ✓ Data will be automatically scoped to your organization for security
                                            </Typography>
                                        )}
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                        
                        <Alert severity="info">
                            Please review your configuration before creating the dataset. 
                            You can go back to any step to make changes.
                        </Alert>
                    </Box>
                );
            default:
                return null;
        }
    }, [formData, validationErrors, showCredentials, updateFormData, toggleCredentialVisibility, testConnection]);

    // Memoize the entire component render to prevent unnecessary re-renders
    const componentContent = useMemo(() => {
        if (!open) return null;

        return (
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        backgroundColor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        pb: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DatasetIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Create Dataset
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 3 }}>
                        {STEPS.map((label, index) => (
                            <Step key={label}>
                                <StepLabel onClick={() => handleStepClick(index)} sx={{ cursor: 'pointer' }}>
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {renderStepContent(activeStep)}

                    {isLoading && <LinearProgress sx={{ mt: 2 }} />}
                </DialogContent>

                <DialogActions 
                    sx={{ 
                        px: 3, 
                        pb: 3, 
                        pt: 2,
                        backgroundColor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        justifyContent: 'space-between'
                    }}
                >
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        disabled={isLoading}
                        sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                    >
                        Cancel
                    </Button>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={handleBack}
                            disabled={activeStep === 0 || isLoading}
                            variant="outlined"
                        >
                            Back
                        </Button>
                        
                        {activeStep === STEPS.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={isLoading || !formData.name.trim()}
                                startIcon={<AddIcon />}
                                sx={{ 
                                    backgroundColor: 'primary.main',
                                    '&:hover': { backgroundColor: 'primary.dark' }
                                }}
                            >
                                {isLoading ? 'Creating Dataset...' : 'Create Dataset'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                variant="contained"
                                disabled={isLoading}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>
        );
    }, [open, onClose, formData, activeStep, isLoading, error, validationErrors, showCredentials, testingConnection, connectionTestResult, handleBack, handleNext, handleStepClick, handleSubmit, renderStepContent]);

    // Return memoized component content
    return componentContent;
});

export default DatasetCreationWizard;
