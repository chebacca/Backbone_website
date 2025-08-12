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
    DialogActions
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
        } catch (err: any) {
            setError(err?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchProject = async (project: CloudProject) => {
        try {
            // Use the simplified startup sequencer to launch the project
            // This ensures consistency with the startup flow
            await simplifiedStartupSequencer.selectProject(project.id);
            
            onProjectLaunch?.(project.id);
        } catch (error) {
            console.error('Failed to launch project:', error);
            setError('Failed to launch project');
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

                                    <Box sx={{ p: 2, pt: 0 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<LaunchIcon />}
                                            onClick={() => handleLaunchProject(project)}
                                            disabled={!project.isActive}
                                        >
                                            {project.isActive ? 'Launch Project' : 'Archived'}
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
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={async () => {
                            if (!selectedProject) return;
                            try {
                              setDatasetsLoading(true);
                              const items = await cloudProjectIntegration.getProjectDatasets(selectedProject.id);
                              setProjectDatasets(items);
                              const all = await cloudProjectIntegration.listDatasets();
                              setAvailableDatasets(all);
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
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
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
                              <option key={ds.id} value={ds.id}>{ds.name}</option>
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
        </Container>
    );
};

export default DashboardCloudProjectsBridge;
