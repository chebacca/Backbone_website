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
  Menu
} from '@mui/material';
import {
    Add as AddIcon,
    Cloud as CloudIcon,
    Computer as ComputerIcon,
    NetworkWifi as NetworkIcon,
    Storage as StorageIcon,
    Launch as LaunchIcon,
    Settings as SettingsIcon,
    Info as InfoIcon
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

  // Auto-fetch datasets when opening project details or when filters change
  useEffect(() => {
    if (selectedProject) {
      void loadDatasetsForProject(selectedProject);
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
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon />
                        Project Details
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedProject && (
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    {getModeIcon(selectedProject.applicationMode)}
                                </ListItemIcon>
                                <ListItemText
                                    primary="Mode"
                                    secondary={selectedProject.applicationMode === 'standalone' ? 'Standalone' : 'Network'}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    {getStorageIcon(selectedProject.storageBackend)}
                                </ListItemIcon>
                                <ListItemText
                                    primary="Storage Backend"
                                    secondary={selectedProject.storageBackend}
                                />
                            </ListItem>
                            {selectedProject.gcsBucket && (
                                <ListItem>
                                    <ListItemIcon>
                                        <StorageIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="GCS Bucket"
                                        secondary={selectedProject.gcsBucket}
                                    />
                                </ListItem>
                            )}
                            {selectedProject.allowCollaboration && (
                                <ListItem>
                                    <ListItemIcon>
                                        <NetworkIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Collaboration"
                                        secondary={`Up to ${selectedProject.maxCollaborators} users`}
                                    />
                                </ListItem>
                            )}
                        </List>
                    )}

                    {selectedProject && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Assigned Datasets</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <input
                            id="project-file-upload"
                            type="file"
                            className={styles.hiddenFileInput}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !selectedProject) return;
                              setUploadError(null);
                              setUploading(true);
                              setUploadProgress(0);
                              try {
                                await cloudProjectIntegration.uploadFileViaSignedUrl(selectedProject.id, file, {
                                  targetPath: selectedProject.gcsPrefix || `projects/${selectedProject.id}`,
                                  onProgress: (pct) => setUploadProgress(pct),
                                });
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : 'Upload failed';
                                setUploadError(msg);
                              } finally {
                                setUploading(false);
                                setTimeout(() => setUploadProgress(0), 800);
                              }
                            }}
                          />
                          <label htmlFor="project-file-upload">
                            <Button component="span" size="small" variant="outlined" disabled={uploading}>
                              {uploading ? `Uploading… ${uploadProgress}%` : 'Upload File'}
                            </Button>
                          </label>
                          {uploadError && <Typography variant="caption" color="error">{uploadError}</Typography>}
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={async () => {
                            if (!selectedProject) return;
                            try {
                              setDatasetsLoading(true);
                              const items = await cloudProjectIntegration.getProjectDatasets(selectedProject.id);
                              setProjectDatasets(items);
                              // Fetch available datasets with optional filters
                              const all = await cloudProjectIntegration.listDatasets({
                                backend: datasetBackendFilter === 'all' ? undefined : datasetBackendFilter,
                                query: datasetSearch || undefined,
                              });
                              // Label with backend for clarity (GCS vs Firestore)
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
                          sx={{ mb: 1 }}
                        >
                          {datasetsLoading ? 'Loading...' : 'Refresh'}
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            setCreateDatasetError(null);
                            setShowCreateDatasetDialog(true);
                          }}
                          sx={{ mb: 1, ml: 1 }}
                        >
                          New Dataset
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                          <label htmlFor="dataset-backend" className="visually-hidden">Backend</label>
                          <select
                            id="dataset-backend"
                            aria-label="Backend filter"
                            value={datasetBackendFilter}
                            onChange={(e) => setDatasetBackendFilter(e.target.value as any)}
                          >
                            <option value="all">All backends</option>
                            <option value="firestore">Firestore</option>
                            <option value="gcs">GCS</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Search datasets…"
                            value={datasetSearch}
                            onChange={(e) => setDatasetSearch(e.target.value)}
                            aria-label="Search datasets"
                            className="dataset-search-input"
                          />
                          <label htmlFor="dataset-select" className="visually-hidden">Select dataset</label>
                          <select
                            id="dataset-select"
                            aria-label="Select dataset"
                            value={selectedDatasetId}
                            onChange={(e) => setSelectedDatasetId(e.target.value)}
                            className="dataset-select-input"
                          >
                            <option value="">Select dataset…</option>
                            {availableDatasets.map((ds: any) => (
                              <option key={ds.id} value={ds.id}>{ds.__label || ds.name}</option>
                            ))}
                          </select>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!selectedDatasetId}
                            onClick={async () => {
                              if (!selectedProject || !selectedDatasetId) return;
                              try {
                                await cloudProjectIntegration.assignDatasetToProject(selectedProject.id, selectedDatasetId);
                                const items = await cloudProjectIntegration.getProjectDatasets(selectedProject.id);
                                setProjectDatasets(items);
                                setSelectedDatasetId('');
                              } catch (e) {
                                console.error('Failed to assign dataset', e);
                              }
                            }}
                          >Assign</Button>
                          <Button
                            size="small"
                            variant="outlined"
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
                          >Apply Filters</Button>
                        </Box>
                        {projectDatasets.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">No datasets assigned</Typography>
                        ) : (
                          <List>
                            {projectDatasets.map((ds: any) => (
                              <ListItem key={ds.id} secondaryAction={
                                <Button size="small" color="error" onClick={async () => {
                                  try {
                                    await cloudProjectIntegration.unassignDatasetFromProject(selectedProject!.id, ds.id);
                                    setProjectDatasets(prev => prev.filter(x => x.id !== ds.id));
                                       setProjectDatasetCounts(prev => ({ ...prev, [selectedProject!.id]: Math.max(0, (prev[selectedProject!.id] || 1) - 1) }));
                                  } catch (e) {
                                    console.error('Failed to unassign dataset', e);
                                  }
                                }}>Remove</Button>
                              }>
                                <ListItemText primary={ds.name} secondary={ds.description} />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedProject(null)}>
                        Close
                    </Button>
                    {selectedProject && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleLaunchProject(selectedProject);
                                setSelectedProject(null);
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
