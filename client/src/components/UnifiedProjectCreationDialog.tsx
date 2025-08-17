// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormGroup,
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
  Slider,
  Paper,
  Stack,
  InputLabel,
  OutlinedInput,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Close as CloseIcon,
  NetworkWifi as NetworkIcon,
  Storage as StorageIcon,
  Computer as ComputerIcon,
  Add as AddIcon,
  Cloud as CloudIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Dataset as DatasetIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
/**
 * Unified Project Creation Dialog
 * 
 * A comprehensive project creation dialog that handles:
 * - Standalone vs Network mode projects
 * - Local, Cloud, and Hybrid storage options
 * - Local network deployment configuration
 * - CGSC and Firestore metadata options
 * - Proper validation and user guidance
 */

import { ApplicationMode } from '../types/applicationMode';
import { simplifiedStartupSequencer, StorageMode, ProjectCreationOptions } from '../services/SimplifiedStartupSequencer';

interface UnifiedProjectCreationDialogProps {
    open: boolean;
    onClose: () => void;
    mode: ApplicationMode;
    onSuccess?: (projectId: string) => void;
  onCreate?: (options: ProjectCreationOptions) => Promise<string>;
}

interface FormData {
    // Basic Information
    name: string;
    description: string;
    
    // Storage Configuration
    storageMode: StorageMode;
    
    // Cloud Storage Settings
    cloudProvider: 'firestore' | 'gcs';
    gcsBucket: string;
    gcsPrefix: string;
    
    // Local Network Deployment
    enableLocalNetwork: boolean;
    networkPort: number;
    networkAddress: string;
    maxNetworkUsers: number;
    networkPassword: string;

    // Preferred Dev Ports (for Desktop/Web compatibility)
    preferredWebsitePort?: number;
    preferredApiPort?: number;
    
    // Collaboration Settings
    maxCollaborators: number;
    enableRealTime: boolean;
    enableComments: boolean;
    enableFileSharing: boolean;
    enableVersionControl: boolean;
    
    // Advanced Settings
    enableEncryption: boolean;
    autoBackup: boolean;
    backupInterval: number;
    enableAuditLog: boolean;
}

const DEFAULT_FORM_DATA: FormData = {
    name: '',
    description: '',
    storageMode: 'local',
    cloudProvider: 'firestore',
    gcsBucket: '',
    gcsPrefix: '',
    enableLocalNetwork: false,
    networkPort: 3000,
    networkAddress: 'localhost',
    maxNetworkUsers: 250,
    networkPassword: '',
    preferredWebsitePort: 3002,
    preferredApiPort: 3003,
    maxCollaborators: 250,
    enableRealTime: true,
    enableComments: true,
    enableFileSharing: true,
    enableVersionControl: true,
    enableEncryption: false,
    autoBackup: true,
    backupInterval: 30,
    enableAuditLog: false
};

const STEPS = [
    'Basic Information',
    'Storage Configuration',
    'Network Settings',
    'Collaboration Options',
    'Review & Create'
];

export const UnifiedProjectCreationDialog: React.FC<UnifiedProjectCreationDialogProps> = ({
    open,
    onClose,
    mode,
  onSuccess,
  onCreate
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setFormData({
                ...DEFAULT_FORM_DATA,
                // Set defaults based on mode
                enableLocalNetwork: mode === 'standalone',
                maxCollaborators: mode === 'shared_network' ? 25 : 5,
                enableRealTime: mode === 'shared_network'
            });
            setActiveStep(0);
            setError(null);
            setValidationErrors({});
        }
    }, [open, mode]);

    const updateFormData = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        // Clear related validation errors
        const newErrors = { ...validationErrors };
        Object.keys(updates).forEach(key => {
            delete newErrors[key];
        });
        setValidationErrors(newErrors);
    };

    const validateStep = (step: number): boolean => {
        const errors: Record<string, string> = {};

        switch (step) {
            case 0: // Basic Information
                if (!formData.name.trim()) {
                    errors.name = 'Project name is required';
                }
                if (formData.name.length > 100) {
                    errors.name = 'Project name must be less than 100 characters';
                }
                break;

            case 1: // Storage Configuration
                if (formData.storageMode === 'cloud' && formData.cloudProvider === 'gcs') {
                    if (!formData.gcsBucket.trim()) {
                        errors.gcsBucket = 'GCS bucket name is required';
                    }
                }
                break;

            case 2: // Network Settings
                if (formData.enableLocalNetwork) {
                    if (formData.networkPort < 1024 || formData.networkPort > 65535) {
                        errors.networkPort = 'Port must be between 1024 and 65535';
                    }
                    if (!formData.networkAddress.trim()) {
                        errors.networkAddress = 'Network address is required';
                    }
                    if (formData.maxNetworkUsers < 1 || formData.maxNetworkUsers > 250) {
                        errors.maxNetworkUsers = 'Max users must be between 1 and 250';
                    }
                }
                if (typeof formData.preferredWebsitePort === 'number' && (formData.preferredWebsitePort < 1024 || formData.preferredWebsitePort > 65535)) {
                    errors.preferredWebsitePort = 'Website port must be 1024-65535';
                }
                if (typeof formData.preferredApiPort === 'number' && (formData.preferredApiPort < 1024 || formData.preferredApiPort > 65535)) {
                    errors.preferredApiPort = 'API port must be 1024-65535';
                }
                break;

            case 3: // Collaboration Options
                if (formData.maxCollaborators < 1 || formData.maxCollaborators > 250) {
                    errors.maxCollaborators = 'Max collaborators must be between 1 and 250';
                }
                break;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    const handleCreate = async () => {
        if (!validateStep(activeStep)) return;

        setIsLoading(true);
        setError(null);

        try {
            const options: ProjectCreationOptions = {
                name: formData.name,
                description: formData.description,
                storageMode: formData.storageMode,
                preferredPorts: {
                    website: formData.preferredWebsitePort,
                    api: formData.preferredApiPort,
                },
                localNetworkConfig: formData.enableLocalNetwork ? {
                    enabled: true,
                    port: formData.networkPort,
                    address: formData.networkAddress,
                    maxUsers: formData.maxNetworkUsers
                } : undefined,
                cloudConfig: formData.storageMode === 'cloud' ? {
                    provider: formData.cloudProvider,
                    bucket: formData.gcsBucket,
                    prefix: formData.gcsPrefix
                } : undefined,
                collaborationSettings: {
                    maxCollaborators: formData.maxCollaborators,
                    enableRealTime: formData.enableRealTime,
                    enableComments: formData.enableComments,
                    enableFileSharing: formData.enableFileSharing
                }
            };

      const projectId = onCreate
        ? await onCreate(options)
        : await simplifiedStartupSequencer.createProject(options);
            
            onSuccess?.(projectId);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setIsLoading(false);
        }
    };

    const renderProjectDetails = () => (
  <Box sx={{ py: 2 }}>
    <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.primary', fontWeight: 600 }}>
      Project Configuration
    </Typography>
    
    {/* Project Information Section */}
    <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Project Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mode
            </Typography>
            <Chip 
              icon={<NetworkIcon />} 
              label="Network" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Storage Backend
            </Typography>
            <Chip 
              icon={<StorageIcon />} 
              label="firestore" 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Collaboration
            </Typography>
            <Chip 
              label="Up to 10 users" 
              size="small" 
              color="success" 
              variant="outlined"
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>

    {/* Assigned Datasets Section */}
    <Paper elevation={0} sx={{ p: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Assigned Datasets
      </Typography>
      
      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          size="small"
          sx={{ 
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          Upload File
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          size="small"
          sx={{ borderColor: 'primary.main', color: 'primary.main' }}
        >
          Refresh
        </Button>
        <Button
          variant="outlined"
          startIcon={<DatasetIcon />}
          size="small"
          sx={{ borderColor: 'primary.main', color: 'primary.main' }}
        >
          New Dataset
        </Button>
      </Stack>

      {/* Dataset Selection Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Backend</InputLabel>
            <Select
              value="firestore"
              label="Backend"
              input={<OutlinedInput label="Backend" />}
            >
              <MenuItem value="firestore">Firestore</MenuItem>
              <MenuItem value="gcs">Google Cloud Storage</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            label="Search datasets..."
            placeholder="Enter dataset name..."
            inputProps={{ style: { fontSize: '14px' } }}
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Select dataset</InputLabel>
            <Select
              value=""
              label="Select dataset"
              input={<OutlinedInput label="Select dataset" />}
            >
              <MenuItem value="show-2024">The Show 2024</MenuItem>
              <MenuItem value="show-2025">The Show 2025</MenuItem>
              <MenuItem value="show-2026">The Show 2026</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              sx={{ 
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              Assign
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{ borderColor: 'primary.main', color: 'primary.main' }}
            >
              Apply Filters
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Currently Assigned Datasets */}
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
          Currently Assigned Datasets
        </Typography>
        
        <List sx={{ backgroundColor: 'background.default', borderRadius: 1, p: 0 }}>
          <ListItem sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <ListItemText 
              primary="The Show 2024"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                sx={{ 
                  borderColor: 'error.main', 
                  color: 'error.main',
                  '&:hover': { 
                    borderColor: 'error.dark', 
                    backgroundColor: 'error.main',
                    color: 'white'
                  }
                }}
              >
                Remove
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
          
          <ListItem>
            <ListItemText 
              primary="The Show 2025"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                sx={{ 
                  borderColor: 'error.main', 
                  color: 'error.main',
                  '&:hover': { 
                    borderColor: 'error.dark', 
                    backgroundColor: 'error.main',
                    color: 'white'
                  }
                }}
              >
                Remove
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Box>
    </Paper>
  </Box>
);

    const renderBasicInformation = () => (
        <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
                Project Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Provide basic information about your project. This can be changed later.
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Project Name"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        error={!!validationErrors.name}
                        helperText={validationErrors.name}
                        required
                        placeholder="My Awesome Project"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        multiline
                        rows={3}
                        placeholder="Describe what this project is about..."
                    />
                </Grid>
            </Grid>
        </Box>
    );

    const renderStorageConfiguration = () => (
        <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
                Storage Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Choose how your project data will be stored and accessed.
            </Typography>

            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel component="legend">Storage Mode</FormLabel>
                <RadioGroup
                    value={formData.storageMode}
                    onChange={(e) => updateFormData({ storageMode: e.target.value as StorageMode })}
                >
                    <FormControlLabel
                        value="local"
                        control={<Radio />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ComputerIcon />
                                <Box>
                                    <Typography variant="body1">Local Storage</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Store project files on your local machine
                                    </Typography>
                                </Box>
                            </Box>
                        }
                    />
                    <FormControlLabel
                        value="cloud"
                        control={<Radio />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CloudIcon />
                                <Box>
                                    <Typography variant="body1">Cloud Storage</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Store project data in the cloud for sharing and backup
                                    </Typography>
                                </Box>
                            </Box>
                        }
                    />
                    <FormControlLabel
                        value="hybrid"
                        control={<Radio />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StorageIcon />
                                <Box>
                                    <Typography variant="body1">Hybrid Storage</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Combine local and cloud storage for optimal performance
                                    </Typography>
                                </Box>
                            </Box>
                        }
                    />
                </RadioGroup>
            </FormControl>

            {formData.storageMode === 'cloud' && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                            Cloud Provider Settings
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <Select
                                        value={formData.cloudProvider}
                                        onChange={(e) => updateFormData({ cloudProvider: e.target.value as 'firestore' | 'gcs' })}
                                    >
                                        <MenuItem value="firestore">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CloudIcon />
                                                <Box>
                                                    <Typography>Firestore</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Real-time NoSQL database
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="gcs">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <StorageIcon />
                                                <Box>
                                                    <Typography>Google Cloud Storage</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Object storage with metadata
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            {formData.cloudProvider === 'gcs' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="GCS Bucket"
                                            value={formData.gcsBucket}
                                            onChange={(e) => updateFormData({ gcsBucket: e.target.value })}
                                            error={!!validationErrors.gcsBucket}
                                            helperText={validationErrors.gcsBucket}
                                            placeholder="my-project-bucket"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Prefix (Optional)"
                                            value={formData.gcsPrefix}
                                            onChange={(e) => updateFormData({ gcsPrefix: e.target.value })}
                                            placeholder="projects/"
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </Box>
    );

    const renderNetworkSettings = () => (
        <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
                Network Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Configure local network deployment for team collaboration.
            </Typography>

            <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.enableLocalNetwork}
                            onChange={(e) => updateFormData({ enableLocalNetwork: e.target.checked })}
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <NetworkIcon />
                            <Box>
                                <Typography>Enable Local Network Deployment</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Allow team members to connect to your local instance
                                </Typography>
                            </Box>
                        </Box>
                    }
                />
            </FormGroup>

            {formData.enableLocalNetwork && (
                <div>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                                Network Deployment Settings
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Network Address"
                                        value={formData.networkAddress}
                                        onChange={(e) => updateFormData({ networkAddress: e.target.value })}
                                        error={!!validationErrors.networkAddress}
                                        helperText={validationErrors.networkAddress || 'IP address or hostname'}
                                        placeholder="192.168.1.100"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Port"
                                        type="number"
                                        value={formData.networkPort}
                                        onChange={(e) => updateFormData({ networkPort: parseInt(e.target.value) || 3000 })}
                                        error={!!validationErrors.networkPort}
                                        helperText={validationErrors.networkPort || 'Port 1024-65535'}
                                        InputProps={{
                                            inputProps: { min: 1024, max: 65535 }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle2" gutterBottom>
                                        Desktop/Web Preferred Development Ports
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Preferred Website Port (Dev)"
                                        type="number"
                                        value={formData.preferredWebsitePort ?? ''}
                                        onChange={(e) => updateFormData({ preferredWebsitePort: parseInt(e.target.value) || undefined })}
                                        error={!!validationErrors.preferredWebsitePort}
                                        helperText={validationErrors.preferredWebsitePort || 'Optional. Default 3002'}
                                        InputProps={{ inputProps: { min: 1024, max: 65535 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Preferred API Port (Dev)"
                                        type="number"
                                        value={formData.preferredApiPort ?? ''}
                                        onChange={(e) => updateFormData({ preferredApiPort: parseInt(e.target.value) || undefined })}
                                        error={!!validationErrors.preferredApiPort}
                                        helperText={validationErrors.preferredApiPort || 'Optional. Default 3003'}
                                        InputProps={{ inputProps: { min: 1024, max: 65535 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Max Network Users"
                                        type="number"
                                        value={formData.maxNetworkUsers}
                                        onChange={(e) => updateFormData({ maxNetworkUsers: parseInt(e.target.value) || 10 })}
                                        error={!!validationErrors.maxNetworkUsers}
                                        helperText={validationErrors.maxNetworkUsers}
                                        InputProps={{
                                            inputProps: { min: 1, max: 100 }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Network Password (Optional)"
                                        type="password"
                                        value={formData.networkPassword}
                                        onChange={(e) => updateFormData({ networkPassword: e.target.value })}
                                        helperText="Leave empty for no password protection"
                                    />
                                </Grid>
                            </Grid>

                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    Your local instance will be accessible at{' '}
                                    <strong>http://{formData.networkAddress}:{formData.networkPort}</strong>
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Box>
    );

    const renderCollaborationOptions = () => (
        <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
                Collaboration Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Configure how team members can collaborate on this project.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography gutterBottom>Max Collaborators: {formData.maxCollaborators}</Typography>
                    <Slider
                        value={formData.maxCollaborators}
                        onChange={(_, value) => updateFormData({ maxCollaborators: value as number })}
                        min={1}
                        max={100}
                        marks={[
                            { value: 1, label: '1' },
                            { value: 25, label: '25' },
                            { value: 50, label: '50' },
                            { value: 100, label: '100' }
                        ]}
                        valueLabelDisplay="auto"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Collaboration Features
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.enableRealTime}
                                    onChange={(e) => updateFormData({ enableRealTime: e.target.checked })}
                                />
                            }
                            label="Real-time Editing"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.enableComments}
                                    onChange={(e) => updateFormData({ enableComments: e.target.checked })}
                                />
                            }
                            label="Comments & Annotations"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.enableFileSharing}
                                    onChange={(e) => updateFormData({ enableFileSharing: e.target.checked })}
                                />
                            }
                            label="File Sharing"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.enableVersionControl}
                                    onChange={(e) => updateFormData({ enableVersionControl: e.target.checked })}
                                />
                            }
                            label="Version Control"
                        />
                    </FormGroup>
                </Grid>
            </Grid>
        </Box>
    );

    const renderReview = () => (
        <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
                Review & Create
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Review your project configuration before creating.
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {formData.name}
                            </Typography>
                            {formData.description && (
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {formData.description}
                                </Typography>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                <Chip
                                    icon={mode === 'standalone' ? <ComputerIcon /> : <NetworkIcon />}
                                    label={mode === 'standalone' ? 'Standalone Mode' : 'Network Mode'}
                                    color="primary"
                                />
                                <Chip
                                    icon={<StorageIcon />}
                                    label={`${formData.storageMode} storage`}
                                    variant="outlined"
                                />
                                {formData.enableLocalNetwork && (
                                    <Chip
                                        icon={<NetworkIcon />}
                                        label={`Network: ${formData.networkAddress}:${formData.networkPort}`}
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom>
                                Configuration Summary:
                            </Typography>
                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                <Typography component="li" variant="body2">
                                    Storage: {formData.storageMode}
                                    {formData.storageMode === 'cloud' && ` (${formData.cloudProvider})`}
                                </Typography>
                                <Typography component="li" variant="body2">
                                    Max Collaborators: {formData.maxCollaborators}
                                </Typography>
                                {formData.enableLocalNetwork && (
                                    <Typography component="li" variant="body2">
                                        Local Network: {formData.networkAddress}:{formData.networkPort} 
                                        (max {formData.maxNetworkUsers} users)
                                    </Typography>
                                )}
                                <Typography component="li" variant="body2">
                                    Features: {[
                                        formData.enableRealTime && 'Real-time',
                                        formData.enableComments && 'Comments',
                                        formData.enableFileSharing && 'File Sharing',
                                        formData.enableVersionControl && 'Version Control'
                                    ].filter(Boolean).join(', ')}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return renderBasicInformation();
            case 1:
                return renderStorageConfiguration();
            case 2:
                return renderNetworkSettings();
            case 3:
                return renderCollaborationOptions();
            case 4:
                return renderReview();
            default:
                return null;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { 
                    minHeight: '70vh',
                    backgroundColor: 'background.default',
                    '& .MuiDialogContent-root': {
                        backgroundColor: 'background.default'
                    }
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
                    <SettingsIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Project Details
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

                {renderProjectDetails()}

                {isLoading && <LinearProgress sx={{ mt: 2 }} />}
            </DialogContent>

            <DialogActions 
                sx={{ 
                    px: 3, 
                    pb: 3, 
                    pt: 2,
                    backgroundColor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                >
                    Close
                </Button>
                
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    disabled={isLoading}
                    startIcon={<LaunchIcon />}
                    sx={{ 
                        backgroundColor: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.dark' }
                    }}
                >
                    {isLoading ? 'Processing...' : 'Launch Project'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UnifiedProjectCreationDialog;
