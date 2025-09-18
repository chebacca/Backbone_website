/**
 * Project Details Dialog - Enhanced Tabbed Interface
 * 
 * This component provides a comprehensive project management interface with:
 * - Tabbed navigation (Details, Datasets, Team Members)
 * - Enhanced theme integration
 * - Improved UX with no scrolling needed
 * - All existing functionality preserved
 * 
 * @see mpc-library/APPLICATION_ARCHITECTURE_MPC.md
 * @see mpc-library/CODING_STANDARDS_MPC.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Typography,
    Button,
    Chip,
    Card,
    Grid,
    IconButton,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Menu,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Checkbox
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Info as InfoIcon,
    Dataset as DatasetIcon,
    Group as GroupIcon,
    Delete as DeleteIcon,
    GroupAdd as GroupAddIcon,
    Refresh as RefreshIcon,
    Computer as ComputerIcon,
    NetworkWifi as NetworkIcon,
    Storage as StorageIcon,
    Cloud as CloudIcon,
    Edit as EditIcon,
    MoreVert as MoreVertIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Check as CheckIcon
} from '@mui/icons-material';

// Import services and utilities
import { cloudProjectIntegration } from '../services/CloudProjectIntegration';
import { calculateEnhancedStatus, getStatusColor, getStatusDisplayText } from '../utils/status-utils';

interface CloudProject {
    id: string;
    name: string;
    description?: string;
    applicationMode: 'standalone' | 'shared_network';
    storageBackend: 'firestore' | 'gcs' | 's3' | 'local' | 'azure-blob';
    lastAccessedAt: string;
    isActive: boolean;
    isArchived?: boolean;
    status: any;
    teamMemberCount?: number;
}

interface ProjectDetailsDialogProps {
    open: boolean;
    project: CloudProject | null;
    onClose: () => void;
    onProjectUpdated?: () => void;
    // Dataset management props
    projectDatasets: any[];
    availableDatasets: any[];
    datasetsLoading: boolean;
    datasetSearch: string;
    datasetBackendFilter: string;
    selectedDatasetId: string;
    uploading: boolean;
    onLoadDatasetsForProject: (project: CloudProject) => Promise<void>;
    onSetDatasetSearch: (search: string) => void;
    onSetDatasetBackendFilter: (filter: any) => void;
    onSetSelectedDatasetId: (id: string) => void;
    onSetError: (error: string | null) => void;
    // Team management props
    projectTeamMembers: any[];
    teamMembersLoading: boolean;
    projectTeamMemberCounts: Record<string, number>;
    onLoadTeamMembersForProject: (project: CloudProject) => Promise<void>;
    onShowTeamRoleWizard: () => void;
    // Additional dialog/wizard props
    onShowCreateDatasetWizard: () => void;
    onShowDatasetManagementDialog: () => void;
    onShowDatasetInsightsDialog: () => void;
}

export const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({
    open,
    project,
    onClose,
    onProjectUpdated,
    projectDatasets,
    availableDatasets,
    datasetsLoading,
    datasetSearch,
    datasetBackendFilter,
    selectedDatasetId,
    uploading,
    onLoadDatasetsForProject,
    onSetDatasetSearch,
    onSetDatasetBackendFilter,
    onSetSelectedDatasetId,
    onSetError,
    projectTeamMembers,
    teamMembersLoading,
    projectTeamMemberCounts,
    onLoadTeamMembersForProject,
    onShowTeamRoleWizard,
    onShowCreateDatasetWizard,
    onShowDatasetManagementDialog,
    onShowDatasetInsightsDialog
}) => {
    const theme = useTheme();
    const [currentTab, setCurrentTab] = useState(0);
    
    // Team member management state
    const [teamMemberMenuAnchor, setTeamMemberMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedTeamMember, setSelectedTeamMember] = useState<any>(null);
    const [editTeamMemberDialog, setEditTeamMemberDialog] = useState(false);
    const [removeTeamMemberDialog, setRemoveTeamMemberDialog] = useState(false);
    const [teamMemberRole, setTeamMemberRole] = useState('');
    const [teamMemberLoading, setTeamMemberLoading] = useState(false);
    const [teamMemberError, setTeamMemberError] = useState<string | null>(null);
    
    // Inline editing state
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editingRole, setEditingRole] = useState('');
    const [editingDepartment, setEditingDepartment] = useState('');
    const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
    const [savingMember, setSavingMember] = useState<string | null>(null);
    
    // Debug logging
    console.log('🔍 ProjectDetailsDialog rendered:', { open, project: project?.name, currentTab });

    // Reset tab when dialog opens/closes
    useEffect(() => {
        if (open) {
            setCurrentTab(0);
        }
    }, [open]);

    const handleClose = useCallback(() => {
        setCurrentTab(0);
        onClose();
    }, [onClose]);

    // Team member management handlers
    const handleTeamMemberMenuOpen = (event: React.MouseEvent<HTMLElement>, member: any) => {
        event.stopPropagation();
        setTeamMemberMenuAnchor(event.currentTarget);
        setSelectedTeamMember(member);
    };

    const handleTeamMemberMenuClose = () => {
        setTeamMemberMenuAnchor(null);
        setSelectedTeamMember(null);
    };

    const handleEditTeamMember = () => {
        if (selectedTeamMember) {
            setTeamMemberRole(selectedTeamMember.role || 'MEMBER');
            setEditTeamMemberDialog(true);
        }
        handleTeamMemberMenuClose();
    };

    const handleRemoveTeamMember = () => {
        setRemoveTeamMemberDialog(true);
        handleTeamMemberMenuClose();
    };

    const handleUpdateTeamMemberRole = async () => {
        if (!selectedTeamMember || !project) return;
        
        setTeamMemberLoading(true);
        setTeamMemberError(null);
        
        try {
            // Update team member role via API
            await cloudProjectIntegration.updateTeamMemberRole(
                project.id,
                selectedTeamMember.id,
                teamMemberRole
            );
            
            // Refresh team members list
            await onLoadTeamMembersForProject(project);
            
            setEditTeamMemberDialog(false);
            setSelectedTeamMember(null);
            setTeamMemberRole('');
        } catch (error: any) {
            console.error('Failed to update team member role:', error);
            setTeamMemberError(error.message || 'Failed to update team member role');
        } finally {
            setTeamMemberLoading(false);
        }
    };

    const handleConfirmRemoveTeamMember = async () => {
        if (!selectedTeamMember || !project) return;
        
        setTeamMemberLoading(true);
        setTeamMemberError(null);
        
        try {
            console.log('🔍 [ProjectDetailsDialog] Removing team member:', {
                projectId: project.id,
                teamMemberId: selectedTeamMember.id,
                teamMemberIdAlt: selectedTeamMember.teamMemberId,
                teamMemberName: selectedTeamMember.name || selectedTeamMember.email,
                fullMemberData: selectedTeamMember
            });
            
            // Use teamMemberId if available, otherwise fall back to id
            const memberIdToRemove = selectedTeamMember.teamMemberId || selectedTeamMember.id;
            
            // Remove team member via API
            const success = await cloudProjectIntegration.removeTeamMemberFromProject(
                project.id,
                memberIdToRemove
            );
            
            if (success) {
                console.log('✅ [ProjectDetailsDialog] Team member removed successfully');
                
                // Refresh team members list
                await onLoadTeamMembersForProject(project);
                
                setRemoveTeamMemberDialog(false);
                setSelectedTeamMember(null);
            } else {
                throw new Error('Failed to remove team member - operation returned false');
            }
        } catch (error: any) {
            console.error('❌ [ProjectDetailsDialog] Failed to remove team member:', error);
            setTeamMemberError(error.message || 'Failed to remove team member');
        } finally {
            setTeamMemberLoading(false);
        }
    };

    // Inline editing handlers
    const handleStartEdit = (member: any) => {
        setEditingMemberId(member.id);
        setEditingRole(member.role || 'MEMBER');
        setEditingDepartment(member.department || '');
        setEditingPermissions(member.permissions || []);
    };

    const handleCancelEdit = () => {
        setEditingMemberId(null);
        setEditingRole('');
        setEditingDepartment('');
        setEditingPermissions([]);
    };

    const handleSaveEdit = async (member: any) => {
        if (!project) return;
        
        setSavingMember(member.id);
        setTeamMemberError(null);
        
        try {
            // Update team member role and department
            await cloudProjectIntegration.updateTeamMemberRole(
                project.id,
                member.id,
                editingRole
            );
            
            // Refresh team members list
            await onLoadTeamMembersForProject(project);
            
            // Exit edit mode
            handleCancelEdit();
        } catch (error: any) {
            console.error('Failed to update team member:', error);
            setTeamMemberError(error.message || 'Failed to update team member');
        } finally {
            setSavingMember(null);
        }
    };

    const handlePermissionToggle = (permission: string) => {
        setEditingPermissions(prev => 
            prev.includes(permission) 
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return <InfoIcon />;
            case 'active': return <StorageIcon />;
            case 'in-progress': return <CircularProgress size={16} />;
            case 'completed': return <InfoIcon />;
            case 'archived': return <InfoIcon />;
            case 'paused': return <InfoIcon />;
            default: return <InfoIcon />;
        }
    };

    const getApplicationModeIcon = (mode: string) => {
        return mode === 'standalone' ? <ComputerIcon /> : <NetworkIcon />;
    };

    const getStorageBackendIcon = (backend: string) => {
        switch (backend) {
            case 'gcs':
                return <CloudIcon />;
            case 's3':
                return <StorageIcon />;
            case 'local':
                return <ComputerIcon />;
            default:
                return <StorageIcon />;
        }
    };

    const handleAssignDataset = async () => {
        if (!project || !selectedDatasetId) return;
        
        try {
            await cloudProjectIntegration.assignDatasetToProject(project.id, selectedDatasetId);
            await onLoadDatasetsForProject(project);
            onSetSelectedDatasetId('');
            onProjectUpdated?.();
        } catch (error) {
            console.error('Failed to assign dataset:', error);
            onSetError('Failed to assign dataset to project');
        }
    };

    const handleRemoveDataset = async (datasetId: string) => {
        if (!project) return;
        
        try {
            await cloudProjectIntegration.unassignDatasetFromProject(project.id, datasetId);
            await onLoadDatasetsForProject(project);
            onProjectUpdated?.();
        } catch (error) {
            console.error('Failed to remove dataset:', error);
            onSetError('Failed to remove dataset from project');
        }
    };

    if (!project) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: theme.shape.borderRadius,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[24],
                    overflow: 'hidden',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    p: 3,
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.info.main})`,
                        borderRadius: '1px'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: theme.shape.borderRadius,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: theme.shadows[8]
                            }}
                        >
                            <SettingsIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ 
                                color: theme.palette.text.primary, 
                                fontWeight: theme.typography.fontWeightBold,
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}>
                                Project Management
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                {project.name}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Tab Navigation */}
                    <Tabs
                        value={currentTab}
                        onChange={(_, newValue) => setCurrentTab(newValue)}
                        sx={{
                            '& .MuiTab-root': {
                                color: theme.palette.text.secondary,
                                fontWeight: theme.typography.fontWeightMedium,
                                textTransform: 'none',
                                minWidth: 'auto',
                                px: 2,
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main,
                                    fontWeight: theme.typography.fontWeightBold
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: theme.palette.primary.main,
                                height: 3,
                                borderRadius: theme.shape.borderRadius
                            }
                        }}
                    >
                        <Tab 
                            icon={<InfoIcon />} 
                            label="Details" 
                            iconPosition="start"
                            sx={{ minHeight: 48 }}
                        />
                        <Tab 
                            icon={<DatasetIcon />} 
                            label="Datasets" 
                            iconPosition="start"
                            sx={{ minHeight: 48 }}
                        />
                        <Tab 
                            icon={<GroupIcon />} 
                            label="Team" 
                            iconPosition="start"
                            sx={{ minHeight: 48 }}
                        />
                    </Tabs>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ 
                p: 0, 
                background: theme.palette.background.default,
                minHeight: '60vh',
                maxHeight: '70vh',
                overflow: 'hidden'
            }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Tab Panel 0: Project Details */}
                    {currentTab === 0 && (
                        <Box sx={{ 
                            p: theme.spacing(3), 
                            overflow: 'auto',
                            flex: 1
                        }}>
                            <Typography variant="h6" sx={{ 
                                color: theme.palette.text.primary, 
                                mb: 3, 
                                fontWeight: theme.typography.fontWeightBold,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: theme.shape.borderRadius,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        boxShadow: `0 0 8px ${theme.palette.primary.main}40`
                                    }}
                                />
                                Project Information
                            </Typography>
                            
                            <Card
                                sx={{
                                    p: 3,
                                    borderRadius: theme.shape.borderRadius,
                                    background: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    boxShadow: theme.shadows[4],
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.shadows[8],
                                        borderColor: theme.palette.primary.main + '40'
                                    }
                                }}
                            >
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{ 
                                            color: theme.palette.text.secondary, 
                                            mb: 1,
                                            fontWeight: theme.typography.fontWeightMedium
                                        }}>
                                            Project Name
                                        </Typography>
                                        <Typography variant="h6" sx={{ 
                                            color: theme.palette.text.primary,
                                            fontWeight: theme.typography.fontWeightBold,
                                            mb: 2
                                        }}>
                                            {project.name}
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{ 
                                            color: theme.palette.text.secondary, 
                                            mb: 1,
                                            fontWeight: theme.typography.fontWeightMedium
                                        }}>
                                            Status
                                        </Typography>
                                        <Chip
                                            icon={getStatusIcon(project.status)}
                                            label={getStatusDisplayText(project.status)}
                                            sx={{
                                                backgroundColor: getStatusColor(project.status) + '20',
                                                color: getStatusColor(project.status),
                                                border: `1px solid ${getStatusColor(project.status)}40`,
                                                fontWeight: theme.typography.fontWeightMedium
                                            }}
                                        />
                                    </Grid>
                                    
                                    {project.description && (
                                        <Grid item xs={12}>
                                            <Typography variant="body2" sx={{ 
                                                color: theme.palette.text.secondary, 
                                                mb: 1,
                                                fontWeight: theme.typography.fontWeightMedium
                                            }}>
                                                Description
                                            </Typography>
                                            <Typography variant="body1" sx={{ 
                                                color: theme.palette.text.primary,
                                                lineHeight: 1.6,
                                                p: 2,
                                                backgroundColor: theme.palette.action.hover,
                                                borderRadius: theme.shape.borderRadius,
                                                border: `1px solid ${theme.palette.divider}`
                                            }}>
                                                {project.description}
                                            </Typography>
                                        </Grid>
                                    )}
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{ 
                                            color: theme.palette.text.secondary, 
                                            mb: 1,
                                            fontWeight: theme.typography.fontWeightMedium
                                        }}>
                                            Application Mode
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getApplicationModeIcon(project.applicationMode)}
                                            <Typography variant="body1" sx={{ 
                                                color: theme.palette.text.primary,
                                                textTransform: 'capitalize'
                                            }}>
                                                {project.applicationMode?.replace('_', ' ')}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{ 
                                            color: theme.palette.text.secondary, 
                                            mb: 1,
                                            fontWeight: theme.typography.fontWeightMedium
                                        }}>
                                            Storage Backend
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getStorageBackendIcon(project.storageBackend)}
                                            <Typography variant="body1" sx={{ 
                                                color: theme.palette.text.primary,
                                                textTransform: 'uppercase'
                                            }}>
                                                {project.storageBackend}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{ 
                                            color: theme.palette.text.secondary, 
                                            mb: 1,
                                            fontWeight: theme.typography.fontWeightMedium
                                        }}>
                                            Last Accessed
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                            color: theme.palette.text.primary
                                        }}>
                                            {project.lastAccessedAt ? 
                                                new Date(project.lastAccessedAt).toLocaleDateString() : 
                                                'Never'
                                            }
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{ 
                                            color: theme.palette.text.secondary, 
                                            mb: 1,
                                            fontWeight: theme.typography.fontWeightMedium
                                        }}>
                                            Team Members
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <GroupIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                            <Typography variant="body1" sx={{ 
                                                color: theme.palette.text.primary
                                            }}>
                                                {projectTeamMemberCounts[project.id] || 0} members
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Box>
                    )}
                    
                    {/* Tab Panel 1: Assigned Datasets */}
                    {currentTab === 1 && (
                        <Box sx={{ 
                            p: theme.spacing(3), 
                            overflow: 'auto',
                            flex: 1
                        }}>
                            <Typography variant="h6" sx={{ 
                                color: theme.palette.text.primary, 
                                mb: 3, 
                                fontWeight: theme.typography.fontWeightBold,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: theme.shape.borderRadius,
                                        background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                                        boxShadow: `0 0 8px ${theme.palette.warning.main}40`
                                    }}
                                />
                                Dataset Management
                            </Typography>
                            
                            <Card
                                sx={{
                                    p: 3,
                                    borderRadius: theme.shape.borderRadius,
                                    background: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    boxShadow: theme.shadows[4]
                                }}
                            >
                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<DatasetIcon />}
                                        onClick={onShowCreateDatasetWizard}
                                        sx={{
                                            backgroundColor: theme.palette.success.main,
                                            color: 'white',
                                            borderRadius: theme.shape.borderRadius,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontWeight: theme.typography.fontWeightMedium,
                                            '&:hover': {
                                                backgroundColor: theme.palette.success.dark
                                            }
                                        }}
                                    >
                                        Create Dataset
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        startIcon={<StorageIcon />}
                                        onClick={onShowDatasetManagementDialog}
                                        sx={{
                                            borderColor: theme.palette.info.main + '80',
                                            color: theme.palette.info.main,
                                            borderRadius: theme.shape.borderRadius,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontWeight: theme.typography.fontWeightMedium,
                                            '&:hover': {
                                                borderColor: theme.palette.info.main,
                                                backgroundColor: theme.palette.info.main + '10'
                                            }
                                        }}
                                    >
                                        Manage Datasets
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        startIcon={<InfoIcon />}
                                        onClick={onShowDatasetInsightsDialog}
                                        sx={{
                                            borderColor: theme.palette.warning.main + '80',
                                            color: theme.palette.warning.main,
                                            borderRadius: theme.shape.borderRadius,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontWeight: theme.typography.fontWeightMedium,
                                            '&:hover': {
                                                borderColor: theme.palette.warning.main,
                                                backgroundColor: theme.palette.warning.main + '10'
                                            }
                                        }}
                                    >
                                        Dataset Insights
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => onLoadDatasetsForProject(project)}
                                        disabled={datasetsLoading}
                                        sx={{
                                            borderColor: theme.palette.primary.main + '80',
                                            color: theme.palette.primary.main,
                                            borderRadius: theme.shape.borderRadius,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontWeight: theme.typography.fontWeightMedium,
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                backgroundColor: theme.palette.primary.main + '10'
                                            },
                                            '&:disabled': {
                                                borderColor: theme.palette.action.disabled,
                                                color: theme.palette.text.disabled
                                            }
                                        }}
                                    >
                                        {datasetsLoading ? 'Refreshing...' : 'Refresh'}
                                    </Button>
                                </Box>

                                {/* Dataset Selection Controls */}
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: theme.palette.text.secondary }}>Backend</InputLabel>
                                            <Select
                                                value={datasetBackendFilter === 'all' ? 'firestore' : datasetBackendFilter}
                                                onChange={(e) => onSetDatasetBackendFilter(e.target.value as any)}
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: theme.palette.divider
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: theme.palette.primary.main + '80'
                                                    },
                                                    '& .MuiSelect-icon': {
                                                        color: theme.palette.text.secondary
                                                    },
                                                    color: theme.palette.text.primary
                                                }}
                                            >
                                                <MenuItem value="firestore">Firestore</MenuItem>
                                                <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                                                <MenuItem value="s3">Amazon S3</MenuItem>
                                                <MenuItem value="aws">AWS Services</MenuItem>
                                                <MenuItem value="azure">Microsoft Azure</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Search datasets..."
                                            value={datasetSearch}
                                            onChange={(e) => onSetDatasetSearch(e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    color: theme.palette.text.primary,
                                                    '& fieldset': {
                                                        borderColor: theme.palette.divider
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: theme.palette.primary.main + '80'
                                                    },
                                                    '& input::placeholder': {
                                                        color: theme.palette.text.secondary,
                                                        opacity: 1
                                                    }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: theme.palette.text.secondary }}>Select dataset</InputLabel>
                                            <Select
                                                value={selectedDatasetId}
                                                onChange={(e) => onSetSelectedDatasetId(e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: theme.palette.divider
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: theme.palette.primary.main + '80'
                                                    },
                                                    '& .MuiSelect-icon': {
                                                        color: theme.palette.text.secondary
                                                    },
                                                    color: theme.palette.text.primary
                                                }}
                                            >
                                                <MenuItem value="">Select dataset...</MenuItem>
                                                {availableDatasets.map((ds: any) => (
                                                    <MenuItem key={ds.id} value={ds.id}>{ds.__label || ds.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={2}>
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleAssignDataset}
                                                disabled={!selectedDatasetId || uploading}
                                                sx={{
                                                    backgroundColor: theme.palette.primary.main,
                                                    color: 'white',
                                                    borderRadius: theme.shape.borderRadius,
                                                    px: 3,
                                                    py: 1,
                                                    textTransform: 'none',
                                                    fontWeight: theme.typography.fontWeightMedium,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.primary.dark
                                                    },
                                                    '&:disabled': {
                                                        backgroundColor: theme.palette.action.disabled,
                                                        color: theme.palette.text.disabled
                                                    }
                                                }}
                                            >
                                                {uploading ? 'Assigning...' : 'Assign'}
                                            </Button>
                                            
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={async () => {
                                                    if (!project) return;
                                                    try {
                                                        onSetDatasetSearch('');
                                                        onSetDatasetBackendFilter('all');
                                                        await onLoadDatasetsForProject(project);
                                                    } catch (error) {
                                                        console.error('Failed to apply filters:', error);
                                                        onSetError('Failed to apply dataset filters');
                                                    }
                                                }}
                                                sx={{
                                                    borderColor: theme.palette.secondary.main + '80',
                                                    color: theme.palette.secondary.main,
                                                    borderRadius: theme.shape.borderRadius,
                                                    textTransform: 'none',
                                                    fontWeight: theme.typography.fontWeightMedium,
                                                    '&:hover': {
                                                        borderColor: theme.palette.secondary.main,
                                                        backgroundColor: theme.palette.secondary.main + '10'
                                                    }
                                                }}
                                            >
                                                Apply Filters
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                                
                                {/* Current Datasets List */}
                                {projectDatasets.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="body2" sx={{ 
                                            color: theme.palette.text.secondary, 
                                            mb: 2,
                                            fontWeight: theme.typography.fontWeightMedium
                                        }}>
                                            Currently Assigned ({projectDatasets.length})
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {projectDatasets.map((dataset: any) => (
                                                <Grid item xs={12} sm={6} md={4} key={dataset.id}>
                                                    <Card sx={{
                                                        p: 2,
                                                        borderRadius: theme.shape.borderRadius,
                                                        background: theme.palette.background.paper,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        boxShadow: theme.shadows[2],
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            boxShadow: theme.shadows[4],
                                                            borderColor: theme.palette.primary.main + '40'
                                                        }
                                                    }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="body2" sx={{ 
                                                                color: theme.palette.text.primary,
                                                                fontWeight: theme.typography.fontWeightMedium
                                                            }}>
                                                                {dataset.__label || dataset.name}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRemoveDataset(dataset.id)}
                                                                sx={{ color: theme.palette.error.main }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}
                                
                                {projectDatasets.length === 0 && (
                                    <Box sx={{ 
                                        textAlign: 'center', 
                                        py: 4,
                                        color: theme.palette.text.secondary
                                    }}>
                                        <DatasetIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                        <Typography variant="body1">
                                            No datasets assigned to this project
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Use the controls above to assign datasets
                                        </Typography>
                                    </Box>
                                )}
                            </Card>
                        </Box>
                    )}
                    
                    {/* Tab Panel 2: Team Members */}
                    {currentTab === 2 && (
                        <Box sx={{ 
                            p: theme.spacing(3), 
                            overflow: 'auto',
                            flex: 1
                        }}>
                            <Typography variant="h6" sx={{ 
                                color: theme.palette.text.primary, 
                                mb: 3, 
                                fontWeight: theme.typography.fontWeightBold,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: theme.shape.borderRadius,
                                        background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                                        boxShadow: `0 0 8px ${theme.palette.success.main}40`
                                    }}
                                />
                                Team Management
                            </Typography>
                            
                            <Card
                                sx={{
                                    p: 3,
                                    borderRadius: theme.shape.borderRadius,
                                    background: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    boxShadow: theme.shadows[4]
                                }}
                            >
                                {/* Team Actions */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<GroupAddIcon />}
                                        onClick={onShowTeamRoleWizard}
                                        sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            color: 'white',
                                            borderRadius: theme.shape.borderRadius,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontWeight: theme.typography.fontWeightMedium,
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.dark
                                            }
                                        }}
                                    >
                                        Manage Team & Roles
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => onLoadTeamMembersForProject(project)}
                                        disabled={teamMembersLoading}
                                        sx={{
                                            borderColor: theme.palette.primary.main + '80',
                                            color: theme.palette.primary.main,
                                            borderRadius: theme.shape.borderRadius,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontWeight: theme.typography.fontWeightMedium,
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                backgroundColor: theme.palette.primary.main + '10'
                                            }
                                        }}
                                    >
                                        {teamMembersLoading ? 'Refreshing...' : 'Refresh'}
                                    </Button>
                                </Box>
                                
                                {/* Team Members Table */}
                                {projectTeamMembers.length > 0 ? (
                                    <TableContainer component={Paper} sx={{
                                        borderRadius: theme.shape.borderRadius,
                                        background: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.divider}`,
                                        boxShadow: theme.shadows[2]
                                    }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: theme.palette.primary.main + '10' }}>
                                                    <TableCell sx={{ 
                                                        fontWeight: theme.typography.fontWeightBold,
                                                        color: theme.palette.text.primary,
                                                        borderBottom: `2px solid ${theme.palette.primary.main}`
                                                    }}>
                                                        Team Member
                                                    </TableCell>
                                                    <TableCell sx={{ 
                                                        fontWeight: theme.typography.fontWeightBold,
                                                        color: theme.palette.text.primary,
                                                        borderBottom: `2px solid ${theme.palette.primary.main}`
                                                    }}>
                                                        Email
                                                    </TableCell>
                                                    <TableCell sx={{ 
                                                        fontWeight: theme.typography.fontWeightBold,
                                                        color: theme.palette.text.primary,
                                                        borderBottom: `2px solid ${theme.palette.primary.main}`
                                                    }}>
                                                        Role
                                                    </TableCell>
                                                    <TableCell sx={{ 
                                                        fontWeight: theme.typography.fontWeightBold,
                                                        color: theme.palette.text.primary,
                                                        borderBottom: `2px solid ${theme.palette.primary.main}`
                                                    }}>
                                                        Department
                                                    </TableCell>
                                                    <TableCell sx={{ 
                                                        fontWeight: theme.typography.fontWeightBold,
                                                        color: theme.palette.text.primary,
                                                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                        textAlign: 'center'
                                                    }}>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {projectTeamMembers.map((member: any) => (
                                                    <TableRow 
                                                        key={member.id}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: theme.palette.action.hover
                                                            }
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: theme.typography.fontWeightBold
                                                                }}>
                                                                    {(member.name || member.email || 'U').charAt(0).toUpperCase()}
                                                                </Avatar>
                                                                <Typography variant="body2" sx={{ 
                                                                    color: theme.palette.text.primary,
                                                                    fontWeight: theme.typography.fontWeightMedium
                                                                }}>
                                                                    {member.name || 'Unknown User'}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ 
                                                                color: theme.palette.text.secondary
                                                            }}>
                                                                {member.email || 'No email'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            {editingMemberId === member.id ? (
                                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                                    <Select
                                                                        value={editingRole}
                                                                        onChange={(e) => setEditingRole(e.target.value)}
                                                                        displayEmpty
                                                                        sx={{ fontSize: '0.875rem' }}
                                                                    >
                                                                        <MenuItem value="MEMBER">Member</MenuItem>
                                                                        <MenuItem value="ADMIN">Admin</MenuItem>
                                                                        <MenuItem value="VIEWER">Viewer</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            ) : (
                                                                <Chip 
                                                                    label={member.role || 'Member'}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: member.role === 'ADMIN' 
                                                                            ? theme.palette.error.main + '20'
                                                                            : theme.palette.primary.main + '20',
                                                                        color: member.role === 'ADMIN' 
                                                                            ? theme.palette.error.main
                                                                            : theme.palette.primary.main,
                                                                        fontWeight: theme.typography.fontWeightMedium
                                                                    }}
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {editingMemberId === member.id ? (
                                                                <TextField
                                                                    size="small"
                                                                    value={editingDepartment}
                                                                    onChange={(e) => setEditingDepartment(e.target.value)}
                                                                    placeholder="Department"
                                                                    sx={{ minWidth: 120 }}
                                                                />
                                                            ) : (
                                                                <Typography variant="body2" sx={{ 
                                                                    color: theme.palette.text.secondary
                                                                }}>
                                                                    {member.department || 'Not specified'}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: 'center' }}>
                                                            {editingMemberId === member.id ? (
                                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                                    <Tooltip title="Save changes">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleSaveEdit(member)}
                                                                            disabled={savingMember === member.id}
                                                                            sx={{
                                                                                color: theme.palette.success.main,
                                                                                '&:hover': {
                                                                                    backgroundColor: theme.palette.success.main + '10'
                                                                                }
                                                                            }}
                                                                        >
                                                                            {savingMember === member.id ? (
                                                                                <CircularProgress size={16} />
                                                                            ) : (
                                                                                <CheckIcon />
                                                                            )}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Cancel">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={handleCancelEdit}
                                                                            disabled={savingMember === member.id}
                                                                            sx={{
                                                                                color: theme.palette.text.secondary,
                                                                                '&:hover': {
                                                                                    backgroundColor: theme.palette.error.main + '10',
                                                                                    color: theme.palette.error.main
                                                                                }
                                                                            }}
                                                                        >
                                                                            <CancelIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                                    <Tooltip title="Edit team member">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleStartEdit(member)}
                                                                            sx={{
                                                                                color: theme.palette.primary.main,
                                                                                '&:hover': {
                                                                                    backgroundColor: theme.palette.primary.main + '10'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <EditIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Team member options">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => handleTeamMemberMenuOpen(e, member)}
                                                                            sx={{
                                                                                color: theme.palette.text.secondary,
                                                                                '&:hover': {
                                                                                    color: theme.palette.primary.main,
                                                                                    backgroundColor: theme.palette.primary.main + '10'
                                                                                }
                                                                            }}
                                                                        >
                                                                            <MoreVertIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{ 
                                        textAlign: 'center', 
                                        py: 4,
                                        color: theme.palette.text.secondary
                                    }}>
                                        <GroupIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                        <Typography variant="body1">
                                            No team members assigned to this project
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Use the "Manage Team & Roles" button to add members
                                        </Typography>
                                    </Box>
                                )}
                            </Card>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 3,
                    background: theme.palette.background.paper,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.secondary,
                                    borderRadius: theme.shape.borderRadius,
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: theme.typography.fontWeightMedium,
                        '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: theme.palette.primary.main + '10',
                            color: theme.palette.primary.main
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>

            {/* Team Member Actions Menu */}
            <Menu
                anchorEl={teamMemberMenuAnchor}
                open={Boolean(teamMemberMenuAnchor)}
                onClose={handleTeamMemberMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[8],
                        minWidth: 160
                    }
                }}
            >
                <MenuItem onClick={handleEditTeamMember}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Role</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleRemoveTeamMember} sx={{ color: theme.palette.error.main }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText>Remove Member</ListItemText>
                </MenuItem>
            </Menu>

            {/* Edit Team Member Role Dialog */}
            <Dialog
                open={editTeamMemberDialog}
                onClose={() => setEditTeamMemberDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[8]
                    }
                }}
            >
                <DialogTitle sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    fontWeight: theme.typography.fontWeightBold
                }}>
                    Edit Team Member Role
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {teamMemberError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {teamMemberError}
                        </Alert>
                    )}
                    
                    <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                        Editing role for: <strong>{selectedTeamMember?.name || selectedTeamMember?.email}</strong>
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={teamMemberRole}
                            onChange={(e) => setTeamMemberRole(e.target.value)}
                            label="Role"
                        >
                            <MenuItem value="MEMBER">Member</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="VIEWER">Viewer</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setEditTeamMemberDialog(false)}
                        variant="outlined"
                        disabled={teamMemberLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateTeamMemberRole}
                        variant="contained"
                        disabled={teamMemberLoading || !teamMemberRole}
                        startIcon={teamMemberLoading ? <CircularProgress size={16} /> : null}
                    >
                        {teamMemberLoading ? 'Updating...' : 'Update Role'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Remove Team Member Confirmation Dialog */}
            <Dialog
                open={removeTeamMemberDialog}
                onClose={() => setRemoveTeamMemberDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[8]
                    }
                }}
            >
                <DialogTitle sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`,
                    color: 'white',
                    fontWeight: theme.typography.fontWeightBold
                }}>
                    Remove Team Member
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {teamMemberError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {teamMemberError}
                        </Alert>
                    )}
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to remove <strong>{selectedTeamMember?.name || selectedTeamMember?.email}</strong> from this project?
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        This action cannot be undone. The team member will lose access to this project and all its data.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setRemoveTeamMemberDialog(false)}
                        variant="outlined"
                        disabled={teamMemberLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmRemoveTeamMember}
                        variant="contained"
                        color="error"
                        disabled={teamMemberLoading}
                        startIcon={teamMemberLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
                    >
                        {teamMemberLoading ? 'Removing...' : 'Remove Member'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default ProjectDetailsDialog;
