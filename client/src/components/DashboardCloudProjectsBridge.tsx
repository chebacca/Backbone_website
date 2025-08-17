/**
 * Dashboard Cloud Projects Bridge
 * 
 * This component bridges the new Simplified Startup System with the existing
 * CloudProjectsPage from the licensing website dashboard. It ensures seamless
 * integration between the startup flow and the dashboard project management.
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Alert,
    Chip,
    Card,
    CardContent,
    Grid,
    IconButton,
    Tab,
    Tabs,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Dialog,
    DialogTitle,
    DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Menu,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
} from '@mui/material';
import {
    Add as AddIcon,
    Cloud as CloudIcon,
    Computer as ComputerIcon,
    NetworkWifi as NetworkIcon,
    Storage as StorageIcon,
    Launch as LaunchIcon,
    Settings as SettingsIcon,
    Info as InfoIcon,
    Upload as UploadIcon,
    Refresh as RefreshIcon,
    Dataset as DatasetIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { cloudProjectIntegration } from '../services/CloudProjectIntegration';
import { simplifiedStartupSequencer } from '../services/SimplifiedStartupSequencer';
import UnifiedProjectCreationDialog from './UnifiedProjectCreationDialog';
import styles from './DashboardCloudProjectsBridge.module.css';

interface CloudProject {
    id: string;
    name: string;
    description?: string;
    applicationMode: 'standalone' | 'shared_network';
    storageBackend: 'firestore' | 'gcs';
    gcsBucket?: string;
    gcsPrefix?: string;
    lastAccessedAt: string;
    isActive: boolean;
    allowCollaboration?: boolean;
    maxCollaborators?: number;
    realTimeEnabled?: boolean;
    settings?: {
      preferredPorts?: {
        website?: number;
        api?: number;
      };
    };
}

interface DashboardCloudProjectsBridgeProps {
    onProjectLaunch?: (projectId: string) => void;
}

export const DashboardCloudProjectsBridge: React.FC<DashboardCloudProjectsBridgeProps> = ({
    onProjectLaunch
}) => {
    const [projects, setProjects] = useState<CloudProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState(0); // 0 = Active, 1 = Archived
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showLaunchDialog, setShowLaunchDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState<CloudProject | null>(null);
  const [projectDatasets, setProjectDatasets] = useState<any[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [datasetBackendFilter, setDatasetBackendFilter] = useState<'all' | 'firestore' | 'gcs'>('all');
  const [datasetSearch, setDatasetSearch] = useState<string>('');
  const [launchMenuAnchorEl, setLaunchMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [launchMenuProject, setLaunchMenuProject] = useState<CloudProject | null>(null);
  const [projectDatasetCounts, setProjectDatasetCounts] = useState<Record<string, number>>({});
  const [launchPrefs, setLaunchPrefs] = useState<Record<string, 'web' | 'desktop'>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showCreateDatasetDialog, setShowCreateDatasetDialog] = useState(false);
  const [createDatasetLoading, setCreateDatasetLoading] = useState(false);
  const [createDatasetError, setCreateDatasetError] = useState<string | null>(null);
  const [createDatasetAssignToProject, setCreateDatasetAssignToProject] = useState(true);
  const [createDatasetForm, setCreateDatasetForm] = useState<{
    name: string;
    description: string;
    backend: 'firestore' | 'gcs';
    gcsBucket: string;
    gcsPrefix: string;
  }>({ name: '', description: '', backend: 'firestore', gcsBucket: '', gcsPrefix: '' });

  // Team Member Management State
  const [projectTeamMembers, setProjectTeamMembers] = useState<any[]>([]);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>('');
  const [selectedTeamMemberRole, setSelectedTeamMemberRole] = useState<'admin' | 'do_er'>('do_er');
  const [teamMemberSearch, setTeamMemberSearch] = useState<string>('');
  const [showAddTeamMemberDialog, setShowAddTeamMemberDialog] = useState(false);
  const [addTeamMemberLoading, setAddTeamMemberLoading] = useState(false);
  const [addTeamMemberError, setAddTeamMemberError] = useState<string | null>(null);

  // Helper to load available + assigned datasets for selected project
  const loadDatasetsForProject = async (project: CloudProject) => {
    try {
      setDatasetsLoading(true);
      const items = await cloudProjectIntegration.getProjectDatasets(project.id);
      setProjectDatasets(items);
      setProjectDatasetCounts(prev => ({ ...prev, [project.id]: items.length }));
      // Default backend filter to the project's backend if 'all'
      const backend = datasetBackendFilter === 'all' ? (project.storageBackend as 'firestore' | 'gcs') : datasetBackendFilter;
      if (datasetBackendFilter === 'all') setDatasetBackendFilter(backend);
      const all = await cloudProjectIntegration.listDatasets({
        backend,
        query: datasetSearch || undefined,
      });
      const labeled = all.map((ds: any) => ({
        ...ds,
        __label: `${ds.name} ${ds.storage?.backend === 'gcs' ? '(GCS)' : '(Firestore)'}`,
      }));
      setAvailableDatasets(labeled);
    } catch (e) {
      console.error('Failed to load datasets for project', e);
    } finally {
      setDatasetsLoading(false);
    }
  };

  // Helper to load team members for selected project
  const loadTeamMembersForProject = async (project: CloudProject) => {
    try {
      setTeamMembersLoading(true);
      
      // Load assigned team members for this project
      const assignedMembers = await cloudProjectIntegration.getProjectTeamMembers(project.id);
      setProjectTeamMembers(assignedMembers);
      
      // Load all available licensed team members from owner's organization
      const allLicensedMembers = await cloudProjectIntegration.getLicensedTeamMembers({
        search: teamMemberSearch || undefined,
        excludeProjectId: project.id // Exclude already assigned members
      });
      
      setAvailableTeamMembers(allLicensedMembers);
    } catch (e) {
      console.error('Failed to load team members for project', e);
    } finally {
      setTeamMembersLoading(false);
    }
  };

  // Auto-fetch datasets and team members when opening project details or when filters change
  useEffect(() => {
    if (selectedProject) {
      void loadDatasetsForProject(selectedProject);
      void loadTeamMembersForProject(selectedProject);
      // Prefill dataset create dialog defaults based on selected project
      setCreateDatasetForm(prev => ({
        ...prev,
        backend: (selectedProject.storageBackend as 'firestore' | 'gcs') || 'firestore',
        gcsBucket: selectedProject.gcsBucket || '',
        gcsPrefix: selectedProject.gcsPrefix || ''
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

    useEffect(() => {
        loadProjects();
        // Listen for project creation events to refresh without full page reload
        const onCreated = (e: any) => {
            loadProjects();
        };
        window.addEventListener('project:created' as any, onCreated);
        return () => window.removeEventListener('project:created' as any, onCreated);
    }, []);

    const loadProjects = async () => {
        try {
            setError(null);
            setLoading(true);
            
            const cloudProjects = await cloudProjectIntegration.getUserProjects();
            setProjects(cloudProjects);
        // Initialize launch preferences from localStorage
        const prefs: Record<string, 'web' | 'desktop'> = {};
        for (const p of cloudProjects) {
          const key = `launch_pref_${p.id}`;
          const val = (localStorage.getItem(key) as 'web' | 'desktop' | null) || 'web';
          prefs[p.id] = val;
        }
        setLaunchPrefs(prefs);
        } catch (err: any) {
            setError(err?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchProject = async (project: CloudProject) => {
        try {
            // Ensure the startup sequencer has a mode set before selecting a project
            await simplifiedStartupSequencer.selectMode(project.applicationMode as any, 'cloud');
            // Use the simplified startup sequencer to launch the project
            // This ensures consistency with the startup flow
            await simplifiedStartupSequencer.selectProject(project.id);
            
            onProjectLaunch?.(project.id);
        } catch (error) {
            console.error('Failed to launch project:', error);
            setError('Failed to launch project');
        }
    };

    const openLaunchMenu = (evt: React.MouseEvent<HTMLElement>, project: CloudProject) => {
      setLaunchMenuAnchorEl(evt.currentTarget);
      setLaunchMenuProject(project);
    };

    const closeLaunchMenu = () => {
      setLaunchMenuAnchorEl(null);
      setLaunchMenuProject(null);
    };

    const handleLaunchWeb = async () => {
      if (!launchMenuProject) return;
      try {
        localStorage.setItem(`launch_pref_${launchMenuProject.id}`, 'web');
        setLaunchPrefs(prev => ({ ...prev, [launchMenuProject.id]: 'web' }));
        // Compute Backbone Web App base URL with project-preferred/local dev preference
        let base = '';
        try {
          const projectPort = launchMenuProject.settings?.preferredPorts?.website;
          const portPrefStr = localStorage.getItem('preferred_website_port');
          const portPref = portPrefStr ? Number(portPrefStr) : 0;
          const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
          if (projectPort && projectPort >= 1024 && projectPort <= 65535) {
            base = `http://localhost:${projectPort}`;
          } else if (portPref && portPref >= 1024 && portPref <= 65535) {
            base = `http://localhost:${portPref}`;
          } else if (isLocal) {
            base = 'http://localhost:3002';
          } else {
            base = ((import.meta.env as any).VITE_WEB_APP_URL || window.location.origin) as string;
          }
        } catch {
          base = ((import.meta.env as any).VITE_WEB_APP_URL || window.location.origin) as string;
        }
        base = String(base).replace(/\/$/, '');
        // For localhost, use hash route to avoid history 404s; hosted uses root
        const isLocalHost = /^http:\/\/localhost:\d+$/i.test(base);
        const url = isLocalHost
          ? `${base}/#/?projectId=${encodeURIComponent(launchMenuProject.id)}&mode=${encodeURIComponent(launchMenuProject.applicationMode)}`
          : `${base}/?projectId=${encodeURIComponent(launchMenuProject.id)}&mode=${encodeURIComponent(launchMenuProject.applicationMode)}`;
        // Open via anchor click (more reliable than window.open in some blockers)
        let opened = false;
        try {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          opened = true;
        } catch {}
        if (!opened) {
          // Fallback: same-tab navigation
          window.location.href = url;
        }
        // Fire-and-forget: update startup sequencer for internal state
        void (async () => {
          try {
            await simplifiedStartupSequencer.selectMode(launchMenuProject.applicationMode as any, 'cloud');
            await simplifiedStartupSequencer.selectProject(launchMenuProject.id);
          } catch {}
        })();
      } catch {}
      closeLaunchMenu();
    };

    const handleLaunchDesktop = () => {
      if (!launchMenuProject) return;
      try {
        localStorage.setItem(`launch_pref_${launchMenuProject.id}`, 'desktop');
        setLaunchPrefs(prev => ({ ...prev, [launchMenuProject.id]: 'desktop' }));
        const scheme = (import.meta.env as any).VITE_DESKTOP_DEEP_LINK_SCHEME || 'dashboardv14';
        const action = (import.meta.env as any).VITE_DESKTOP_DEEP_LINK_ACTION || 'open-project';
        const url = `${scheme}://${action}?id=${encodeURIComponent(launchMenuProject.id)}`;
        // Attempt deep link
        window.location.href = url;
      } catch (e) {
        console.error('Failed to open desktop deep link', e);
        setError('Unable to open Desktop app. Please ensure it is installed.');
      } finally {
        closeLaunchMenu();
      }
    };

    const handleCreateProject = () => {
        setShowCreateDialog(true);
    };

    const handleProjectCreated = async (projectId: string) => {
        setShowCreateDialog(false);
        await loadProjects(); // Refresh the list
        // Launch the newly created project once the list is refreshed
        // Find from the latest state after refresh
        setTimeout(() => {
            const latest = (tab === 0 ? activeProjects : archivedProjects).find(p => p.id === projectId) || projects.find(p => p.id === projectId);
            if (latest) handleLaunchProject(latest);
        }, 0);
    };

    const getStorageIcon = (storageBackend: string) => {
        switch (storageBackend) {
            case 'firestore':
                return <CloudIcon />;
            case 'gcs':
                return <StorageIcon />;
            default:
                return <ComputerIcon />;
        }
    };

    const getModeIcon = (mode: string) => {
        return mode === 'standalone' ? <ComputerIcon /> : <NetworkIcon />;
    };

    const formatLastAccessed = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return date.toLocaleDateString();
    };

    const activeProjects = projects.filter(p => p.isActive);
    const archivedProjects = projects.filter(p => !p.isActive);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        Cloud Projects
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your projects with Firebase and Google Cloud Storage integration
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateProject}
                    size="large"
                >
                    Create Project
                </Button>
            </Box>

            {/* Integration Status */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>Integrated Startup System:</strong> Projects created here will automatically 
                    integrate with the unified startup flow and support both standalone and network modes 
                    with Firebase/GCS storage options.
                </Typography>
            </Alert>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(_, newValue) => setTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
                <Tab label={`Active Projects (${activeProjects.length})`} />
                <Tab label={`Archived (${archivedProjects.length})`} />
            </Tabs>

            {/* Project List */}
            <Box>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>Loading projects...</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {(tab === 0 ? activeProjects : archivedProjects).map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: (theme) => theme.shadows[4]
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            {getModeIcon(project.applicationMode)}
                                            <Typography variant="h6" component="h3" sx={{ ml: 1, flexGrow: 1 }}>
                                                {project.name}
                                            </Typography>
                                            <IconButton size="small" onClick={() => setSelectedProject(project)}>
                                                <SettingsIcon />
                                            </IconButton>
                                        </Box>

                                        {project.description && (
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {project.description}
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                            <Chip
                                                size="small"
                                                icon={getModeIcon(project.applicationMode)}
                                                label={project.applicationMode === 'standalone' ? 'Standalone' : 'Network'}
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Chip
                                                size="small"
                                                icon={getStorageIcon(project.storageBackend)}
                                                label={project.storageBackend}
                                                variant="outlined"
                                            />
                                           {typeof projectDatasetCounts[project.id] === 'number' && (
                                             <Chip
                                               size="small"
                                               label={`Datasets: ${projectDatasetCounts[project.id]}`}
                                               variant="outlined"
                                             />
                                           )}
                                           <Chip
                                             size="small"
                                             label={`Launch: ${(launchPrefs[project.id] || 'web') === 'desktop' ? 'Desktop' : 'Web'}`}
                                             variant="outlined"
                                           />
                                            {project.allowCollaboration && (
                                                <Chip
                                                    size="small"
                                                    label={`${project.maxCollaborators} users`}
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>

                                        <Typography variant="caption" color="text.secondary">
                                            Last accessed: {formatLastAccessed(project.lastAccessedAt)}
                                        </Typography>
                                    </CardContent>

                                    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<LaunchIcon />}
                                            onClick={(e) => openLaunchMenu(e, project)}
                                            disabled={!project.isActive}
                                        >
                                            {project.isActive ? 'Launch' : 'Archived'}
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color={project.isActive ? 'warning' : 'success'}
                                            onClick={async () => {
                                                try {
                                                    if (project.isActive) {
                                                        await cloudProjectIntegration.archiveProject(project.id);
                                                    } else {
                                                        await cloudProjectIntegration.restoreProject(project.id);
                                                    }
                                                    await loadProjects();
                                                } catch (e) {
                                                    console.error('Failed to toggle archive', e);
                                                    setError('Failed to update project');
                                                }
                                            }}
                                        >
                                            {project.isActive ? 'Archive' : 'Restore'}
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Empty State */}
                {!loading && (tab === 0 ? activeProjects : archivedProjects).length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CloudIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {tab === 0 ? 'No active projects yet' : 'No archived projects'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {tab === 0 
                                ? 'Create your first cloud project to get started with Firebase and GCS integration'
                                : 'Archived projects will appear here'
                            }
                        </Typography>
                        {tab === 0 && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateProject}
                                size="large"
                            >
                                Create Your First Project
                            </Button>
                        )}
                    </Box>
                )}
            </Box>

            {/* Project Creation Dialog */}
            <UnifiedProjectCreationDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                mode="shared_network" // Cloud projects are typically network mode
                onSuccess={handleProjectCreated}
                onCreate={async (options) => {
                    // Use the cloud integration directly to ensure correct API path and auth
                    // Ensure auth token is set from localStorage if available
                    try {
                        const token = localStorage.getItem('auth_token');
                        if (token) {
                            (window as any).cloudProjectIntegration?.setAuthToken?.(token);
                        }
                    } catch {}
                    const id = await cloudProjectIntegration.createCloudProject(options);
                    return id;
                }}
            />

            {/* Project Details Dialog */}
            <Dialog
                open={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        p: 3,
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, #4f46e5, #06b6d4, #3b82f6)',
                            borderRadius: '1px'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            <SettingsIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ 
                                color: 'white', 
                                fontWeight: 700,
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}>
                                Project Details
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {selectedProject?.name || 'Project Configuration'}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0, background: 'transparent' }}>
                    {selectedProject && (
                        <Box sx={{ p: 3 }}>
                            {/* Project Information Cards */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ 
                                    color: 'white', 
                                    mb: 3, 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                                        }}
                                    />
                                    Project Information
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={4}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                                                    borderColor: 'rgba(79, 70, 229, 0.3)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {getModeIcon(selectedProject.applicationMode)}
                                                </Box>
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                    Mode
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                {selectedProject.applicationMode === 'standalone' ? 'Standalone' : 'Network'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={4}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                                                    borderColor: 'rgba(6, 182, 212, 0.3)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {getStorageIcon(selectedProject.storageBackend)}
                                                </Box>
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                    Storage Backend
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                {selectedProject.storageBackend}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={4}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                                                    borderColor: 'rgba(16, 185, 129, 0.3)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <NetworkIcon sx={{ color: 'white' }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                    Collaboration
                                                </Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                Up to {selectedProject.maxCollaborators || 10} users
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Assigned Datasets Section */}
                            <Box>
                                <Typography variant="h6" sx={{ 
                                    color: 'white', 
                                    mb: 3, 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                            boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)'
                                        }}
                                    />
                                    Assigned Datasets
                                </Typography>
                                
                                <Box
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {/* Action Buttons */}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<UploadIcon />}
                                            sx={{
                                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                color: 'white',
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                                                    boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            Upload File
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<RefreshIcon />}
                                            sx={{
                                                borderColor: 'rgba(79, 70, 229, 0.5)',
                                                color: '#4f46e5',
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    borderColor: '#4f46e5',
                                                    backgroundColor: 'rgba(79, 70, 229, 0.1)'
                                                }
                                            }}
                                        >
                                            Refresh
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<DatasetIcon />}
                                            sx={{
                                                borderColor: 'rgba(6, 182, 212, 0.5)',
                                                color: '#06b6d4',
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    borderColor: '#06b6d4',
                                                    backgroundColor: 'rgba(6, 182, 212, 0.1)'
                                                }
                                            }}
                                        >
                                            New Dataset
                                        </Button>
                                    </Box>

                                    {/* Dataset Selection Controls */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={3}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Backend</InputLabel>
                                                <Select
                                                    value={datasetBackendFilter === 'all' ? 'firestore' : datasetBackendFilter}
                                                    onChange={(e) => setDatasetBackendFilter(e.target.value as any)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(255, 255, 255, 0.2)'
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(79, 70, 229, 0.5)'
                                                        },
                                                        '& .MuiSelect-icon': {
                                                            color: 'rgba(255, 255, 255, 0.7)'
                                                        },
                                                        color: 'white',
                                                        '& .MuiMenuItem-root': {
                                                            color: 'black'
                                                        }
                                                    }}
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
                                                placeholder="Search datasets..."
                                                value={datasetSearch}
                                                onChange={(e) => setDatasetSearch(e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        color: 'white',
                                                        '& fieldset': {
                                                            borderColor: 'rgba(255, 255, 255, 0.2)'
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: 'rgba(79, 70, 229, 0.5)'
                                                        },
                                                        '& input::placeholder': {
                                                            color: 'rgba(255, 255, 255, 0.5)',
                                                            opacity: 1
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        
                                        <Grid item xs={12} sm={3}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select dataset</InputLabel>
                                                <Select
                                                    value={selectedDatasetId}
                                                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(255, 255, 255, 0.2)'
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'rgba(79, 70, 229, 0.5)'
                                                        },
                                                        '& .MuiSelect-icon': {
                                                            color: 'rgba(255, 255, 255, 0.7)'
                                                        },
                                                        color: 'white',
                                                        '& .MuiMenuItem-root': {
                                                            color: 'black'
                                                        }
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
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled={!selectedDatasetId}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        color: 'white',
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #059669, #047857)',
                                                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
                                                        },
                                                        '&:disabled': {
                                                            background: 'rgba(255, 255, 255, 0.1)',
                                                            color: 'rgba(255, 255, 255, 0.3)'
                                                        }
                                                    }}
                                                >
                                                    Assign
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={async () => {
                                                        if (!selectedProject) return;
                                                        try {
                                                            setDatasetsLoading(true);
                                                            const items = await cloudProjectIntegration.getProjectDatasets(selectedProject.id);
                                                            setProjectDatasets(items);
                                                            const all = await cloudProjectIntegration.listDatasets({
                                                                backend: datasetBackendFilter === 'all' ? undefined : datasetBackendFilter,
                                                                query: datasetSearch || undefined,
                                                            });
                                                            const labeled = all.map((ds: any) => ({
                                                                ...ds,
                                                                __label: `${ds.name} ${ds.storage?.backend === 'gcs' ? '(GCS)' : '(Firestore)'}`,
                                                            }));
                                                            setAvailableDatasets(labeled);
                                                        } catch (e) {
                                                            console.error('Failed to load datasets', e);
                                                        } finally {
                                                            setDatasetsLoading(false);
                                                        }
                                                    }}
                                                    sx={{
                                                        borderColor: 'rgba(79, 70, 229, 0.5)',
                                                        color: '#4f46e5',
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        '&:hover': {
                                                            borderColor: '#4f46e5',
                                                            backgroundColor: 'rgba(79, 70, 229, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    Apply Filters
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    {/* Currently Assigned Datasets */}
                                    <Box>
                                        <Typography variant="body2" sx={{ 
                                            color: 'rgba(255, 255, 255, 0.7)', 
                                            mb: 2,
                                            fontWeight: 500
                                        }}>
                                            Currently Assigned Datasets
                                        </Typography>
                                        
                                        {projectDatasets.length === 0 ? (
                                            <Box
                                                sx={{
                                                    p: 4,
                                                    textAlign: 'center',
                                                    borderRadius: 2,
                                                    background: 'rgba(255, 255, 255, 0.02)',
                                                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <DatasetIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                    No datasets assigned to this project
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                {projectDatasets.map((ds: any, index: number) => (
                                                    <Box
                                                        key={ds.id}
                                                        sx={{
                                                            p: 2,
                                                            background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                                                            borderBottom: index < projectDatasets.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                background: 'rgba(79, 70, 229, 0.1)',
                                                                transform: 'translateX(4px)'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <DatasetIcon sx={{ color: 'white', fontSize: 16 }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                                                    {ds.name}
                                                                </Typography>
                                                                {ds.description && (
                                                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                                        {ds.description}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={async () => {
                                                                try {
                                                                    await cloudProjectIntegration.unassignDatasetFromProject(selectedProject!.id, ds.id);
                                                                    setProjectDatasets(prev => prev.filter(x => x.id !== ds.id));
                                                                    setProjectDatasetCounts(prev => ({ ...prev, [selectedProject!.id]: Math.max(0, (prev[selectedProject!.id] || 1) - 1) }));
                                                                } catch (e) {
                                                                    console.error('Failed to unassign dataset', e);
                                                                }
                                                            }}
                                                            sx={{
                                                                borderColor: 'rgba(239, 68, 68, 0.5)',
                                                                color: '#ef4444',
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                '&:hover': {
                                                                    borderColor: '#ef4444',
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                    transform: 'scale(1.05)'
                                                                }
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Team Members Section */}
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" sx={{ 
                                    color: 'white', 
                                    mb: 3, 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                            boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
                                        }}
                                    />
                                    Team Members
                                </Typography>
                                
                                <Box
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    {/* Team Member Action Buttons */}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={() => setShowAddTeamMemberDialog(true)}
                                            sx={{
                                                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                                color: 'white',
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            Add Team Member
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<RefreshIcon />}
                                            onClick={() => selectedProject && loadTeamMembersForProject(selectedProject)}
                                            disabled={teamMembersLoading}
                                            sx={{
                                                borderColor: 'rgba(139, 92, 246, 0.5)',
                                                color: '#8b5cf6',
                                                borderRadius: 2,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    borderColor: '#8b5cf6',
                                                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                                                }
                                            }}
                                        >
                                            {teamMembersLoading ? 'Loading...' : 'Refresh'}
                                        </Button>
                                    </Box>

                                    {/* Currently Assigned Team Members */}
                                    <Box>
                                        <Typography variant="body2" sx={{ 
                                            color: 'rgba(255, 255, 255, 0.8)', 
                                            mb: 2,
                                            fontWeight: 500
                                        }}>
                                            Project Team Members ({projectTeamMembers.length})
                                        </Typography>
                                        
                                        {projectTeamMembers.length === 0 ? (
                                            <Box
                                                sx={{
                                                    p: 4,
                                                    textAlign: 'center',
                                                    borderRadius: 2,
                                                    background: 'rgba(255, 255, 255, 0.02)',
                                                    border: '1px dashed rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <NetworkIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                    No team members assigned to this project
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1 }}>
                                                    Add licensed team members to collaborate on this project
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                {projectTeamMembers.map((member: any, index: number) => (
                                                    <Box
                                                        key={member.id}
                                                        sx={{
                                                            p: 3,
                                                            background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                                                            borderBottom: index < projectTeamMembers.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                background: 'rgba(139, 92, 246, 0.1)',
                                                                transform: 'translateX(4px)'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: '50%',
                                                                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '18px',
                                                                    fontWeight: 600,
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || 'U'}
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                                                    {member.name || 'Unnamed User'}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                                    {member.email}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                                    <Chip
                                                                        size="small"
                                                                        label={member.role || 'Member'}
                                                                        sx={{
                                                                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                                                            color: '#c4b5fd',
                                                                            fontSize: '11px'
                                                                        }}
                                                                    />
                                                                    {member.licenseType && (
                                                                        <Chip
                                                                            size="small"
                                                                            label={member.licenseType}
                                                                            sx={{
                                                                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                                                                color: '#6ee7b7',
                                                                                fontSize: '11px'
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={async () => {
                                                                try {
                                                                    await cloudProjectIntegration.removeTeamMemberFromProject(selectedProject!.id, member.id);
                                                                    setProjectTeamMembers(prev => prev.filter(m => m.id !== member.id));
                                                                } catch (e) {
                                                                    console.error('Failed to remove team member', e);
                                                                }
                                                            }}
                                                            sx={{
                                                                borderColor: 'rgba(239, 68, 68, 0.5)',
                                                                color: '#ef4444',
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                '&:hover': {
                                                                    borderColor: '#ef4444',
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                    transform: 'scale(1.05)'
                                                                }
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Button
                        onClick={() => setSelectedProject(null)}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Close
                    </Button>
                    
                    {selectedProject && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleLaunchProject(selectedProject);
                                setSelectedProject(null);
                            }}
                            startIcon={<LaunchIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                color: 'white',
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                                    boxShadow: '0 8px 25px rgba(79, 70, 229, 0.5)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Launch Project
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Create Dataset Dialog */}
            <Dialog open={showCreateDatasetDialog} onClose={() => setShowCreateDatasetDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Create Dataset</DialogTitle>
              <DialogContent>
                {createDatasetError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{createDatasetError}</Alert>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="Name"
                    value={createDatasetForm.name}
                    onChange={(e) => setCreateDatasetForm({ ...createDatasetForm, name: e.target.value })}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={createDatasetForm.description}
                    onChange={(e) => setCreateDatasetForm({ ...createDatasetForm, description: e.target.value })}
                    multiline
                    minRows={2}
                    fullWidth
                  />
                  <TextField
                    select
                    label="Storage Backend"
                    value={createDatasetForm.backend}
                    onChange={(e) => setCreateDatasetForm({ ...createDatasetForm, backend: e.target.value as 'firestore' | 'gcs' })}
                    fullWidth
                  >
                    <MenuItem value="firestore">Firestore</MenuItem>
                    <MenuItem value="gcs">Google Cloud Storage (GCS)</MenuItem>
                  </TextField>
                  {createDatasetForm.backend === 'gcs' && (
                    <>
                      <TextField
                        label="GCS Bucket"
                        placeholder="my-bucket"
                        value={createDatasetForm.gcsBucket}
                        onChange={(e) => setCreateDatasetForm({ ...createDatasetForm, gcsBucket: e.target.value })}
                        fullWidth
                      />
                      <TextField
                        label="GCS Prefix (optional)"
                        placeholder="datasets/project-123/"
                        value={createDatasetForm.gcsPrefix}
                        onChange={(e) => setCreateDatasetForm({ ...createDatasetForm, gcsPrefix: e.target.value })}
                        fullWidth
                      />
                    </>
                  )}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={createDatasetAssignToProject}
                        onChange={(_, checked) => setCreateDatasetAssignToProject(checked)}
                      />
                    }
                    label="Assign to this project after creation"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowCreateDatasetDialog(false)} disabled={createDatasetLoading}>Cancel</Button>
                <Button
                  variant="contained"
                  disabled={createDatasetLoading || !createDatasetForm.name.trim()}
                  onClick={async () => {
                    if (!selectedProject) { setShowCreateDatasetDialog(false); return; }
                    setCreateDatasetError(null);
                    setCreateDatasetLoading(true);
                    try {
                      const storage: any = { backend: createDatasetForm.backend };
                      if (createDatasetForm.backend === 'gcs') {
                        if (createDatasetForm.gcsBucket) storage.gcsBucket = createDatasetForm.gcsBucket;
                        if (createDatasetForm.gcsPrefix) storage.gcsPrefix = createDatasetForm.gcsPrefix;
                      }
                      const created = await cloudProjectIntegration.createDataset({
                        name: createDatasetForm.name.trim(),
                        description: createDatasetForm.description.trim() || undefined,
                        visibility: 'private',
                        organizationId: null,
                        tags: [],
                        schema: {},
                        storage
                      } as any);
                      if (createDatasetAssignToProject) {
                        await cloudProjectIntegration.assignDatasetToProject(selectedProject.id, created.id);
                      }
                      // Refresh datasets lists
                      const items = await cloudProjectIntegration.getProjectDatasets(selectedProject.id);
                      setProjectDatasets(items);
                      setProjectDatasetCounts(prev => ({ ...prev, [selectedProject.id]: items.length }));
                      const backend = datasetBackendFilter === 'all' ? (selectedProject.storageBackend as 'firestore' | 'gcs') : datasetBackendFilter;
                      const all = await cloudProjectIntegration.listDatasets({ backend });
                      const labeled = all.map((ds: any) => ({ ...ds, __label: `${ds.name} ${ds.storage?.backend === 'gcs' ? '(GCS)' : '(Firestore)'}` }));
                      setAvailableDatasets(labeled);
                      setShowCreateDatasetDialog(false);
                      setCreateDatasetForm(f => ({ ...f, name: '', description: '' }));
                    } catch (e: any) {
                      setCreateDatasetError(e?.message || 'Failed to create dataset');
                    } finally {
                      setCreateDatasetLoading(false);
                    }
                  }}
                >
                  {createDatasetLoading ? 'Creating…' : 'Create Dataset'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Add Team Member Dialog */}
            <Dialog 
                open={showAddTeamMemberDialog} 
                onClose={() => setShowAddTeamMemberDialog(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                        color: 'white',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        p: 3
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <AddIcon sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Add Team Member
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Add licensed team members to this project
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3, background: 'transparent' }}>
                    {addTeamMemberError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {addTeamMemberError}
                        </Alert>
                    )}
                    
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            Search and select from your licensed team members:
                        </Typography>
                        
                        <TextField
                            fullWidth
                            placeholder="Search team members by name or email..."
                            value={teamMemberSearch}
                            onChange={(e) => setTeamMemberSearch(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(139, 92, 246, 0.5)'
                                    },
                                    '& input::placeholder': {
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        opacity: 1
                                    }
                                }
                            }}
                        />
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select Team Member</InputLabel>
                            <Select
                                value={selectedTeamMemberId}
                                onChange={(e) => setSelectedTeamMemberId(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(139, 92, 246, 0.5)'
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    },
                                    color: 'white'
                                }}
                            >
                                <MenuItem value="">
                                    <em>Select a team member...</em>
                                </MenuItem>
                                {availableTeamMembers.map((member: any) => (
                                    <MenuItem key={member.id} value={member.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: 'white'
                                                }}
                                            >
                                                {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || 'U'}
                                            </Box>
                                                                                    <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'white' }}>
                                                {member.name || 'Unnamed User'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                {member.email} • {member.licenseType || 'Licensed'}
                                            </Typography>
                                        </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Project Role</InputLabel>
                            <Select
                                value={selectedTeamMemberRole}
                                onChange={(e) => setSelectedTeamMemberRole(e.target.value as 'admin' | 'do_er')}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(139, 92, 246, 0.5)'
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgba(255, 255, 255, 0.7)'
                                    },
                                    color: 'white'
                                }}
                            >
                                <MenuItem value="do_er">
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'black' }}>
                                            Do_Er
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                            Can create, edit, and delete data but no admin privileges
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="admin">
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'black' }}>
                                            Admin
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                            Full administrative access (only 1 admin per project)
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {availableTeamMembers.length === 0 && !teamMembersLoading && (
                        <Box
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                borderRadius: 2,
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px dashed rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <NetworkIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                No available team members found
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1 }}>
                                Make sure team members have valid licenses and aren't already assigned to this project
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions
                    sx={{
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Button
                        onClick={() => {
                            setShowAddTeamMemberDialog(false);
                            setSelectedTeamMemberId('');
                            setSelectedTeamMemberRole('do_er');
                            setTeamMemberSearch('');
                            setAddTeamMemberError(null);
                        }}
                        variant="outlined"
                        disabled={addTeamMemberLoading}
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        variant="contained"
                        disabled={addTeamMemberLoading || !selectedTeamMemberId}
                        onClick={async () => {
                            if (!selectedProject || !selectedTeamMemberId) return;
                            
                            setAddTeamMemberError(null);
                            setAddTeamMemberLoading(true);
                            
                            try {
                                await cloudProjectIntegration.addTeamMemberToProject(
                                    selectedProject.id, 
                                    selectedTeamMemberId, 
                                    selectedTeamMemberRole as any
                                );
                                
                                // Refresh team members list
                                await loadTeamMembersForProject(selectedProject);
                                
                                // Close dialog and reset
                                setShowAddTeamMemberDialog(false);
                                setSelectedTeamMemberId('');
                                setSelectedTeamMemberRole('do_er');
                                setTeamMemberSearch('');
                            } catch (e: any) {
                                setAddTeamMemberError(e?.message || 'Failed to add team member');
                            } finally {
                                setAddTeamMemberLoading(false);
                            }
                        }}
                        sx={{
                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            color: 'white',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.5)',
                                transform: 'translateY(-2px)'
                            },
                            '&:disabled': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.3)',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {addTeamMemberLoading ? 'Adding...' : 'Add Team Member'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Launch Options Menu */}
            <Menu
              anchorEl={launchMenuAnchorEl}
              open={Boolean(launchMenuAnchorEl)}
              onClose={closeLaunchMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleLaunchWeb}>Launch (Web)</MenuItem>
              <MenuItem onClick={handleLaunchDesktop}>Launch (Desktop)</MenuItem>
            </Menu>
        </Container>
    );
};

export default DashboardCloudProjectsBridge;
