// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Badge,
    Alert,
    Skeleton,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    Sort as SortIcon,
    Refresh as RefreshIcon,
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    People as PeopleIcon,
    Cloud as CloudIcon,
    Computer as ComputerIcon,
    Storage as StorageIcon,
} from '@mui/icons-material';
/**
 * Unified Project Selection Component
 * 
 * A comprehensive project selection interface that handles both existing
 * project browsing and new project creation with proper validation and
 * guidance based on the selected mode and storage configuration.
 */

import { ApplicationMode } from '../types/applicationMode';
import { StorageMode, simplifiedStartupSequencer } from '../services/SimplifiedStartupSequencer';
import UnifiedProjectCreationDialog from './UnifiedProjectCreationDialog';

interface Project {
    id: string;
    name: string;
    description?: string;
    mode: ApplicationMode;
    storageMode: StorageMode;
    lastAccessed: string;
    collaborators?: number;
    status: 'active' | 'archived' | 'shared';
    tags?: string[];
    size?: string;
    isOwner?: boolean;
}

interface UnifiedProjectSelectionProps {
    mode: ApplicationMode;
    storageMode: StorageMode;
    onProjectSelected?: (projectId: string) => void;
    onBack?: () => void;
}

// Mock projects will be replaced by actual data loading

type TabValue = 'my_projects' | 'shared_projects' | 'recent';
type SortBy = 'name' | 'lastAccessed' | 'size' | 'collaborators';

export const UnifiedProjectSelection: React.FC<UnifiedProjectSelectionProps> = ({
    mode,
    storageMode,
    onProjectSelected,
    onBack
}) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabValue>('my_projects');
    const [sortBy, setSortBy] = useState<SortBy>('lastAccessed');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        loadProjects();
    }, [mode, storageMode, activeTab]);

    useEffect(() => {
        filterAndSortProjects();
    }, [projects, searchQuery, sortBy, activeTab]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            let allProjects: Project[] = [];

            // Load cloud projects if mode supports it
            if (mode === 'shared_network' || storageMode === 'cloud' || storageMode === 'hybrid') {
                try {
                    const { cloudProjectIntegration } = await import('../services/CloudProjectIntegration');
                    const cloudProjects = await cloudProjectIntegration.getUserProjects();
                    
                    // Convert cloud projects to our Project interface
                    const convertedCloudProjects = cloudProjects.map(cp => ({
                        id: cp.id,
                        name: cp.name,
                        description: cp.description,
                        mode: cp.applicationMode,
                        storageMode: cp.storageBackend === 'firestore' ? 'cloud' as StorageMode : 'cloud' as StorageMode,
                        lastAccessed: cp.lastAccessedAt,
                        collaborators: cp.maxCollaborators || 0,
                        status: cp.isActive ? 'active' as const : 'archived' as const,
                        tags: [], // Could be extracted from metadata
                        size: 'Unknown', // Would need to be calculated
                        isOwner: true // Would need to check ownership
                    }));
                    
                    allProjects = [...allProjects, ...convertedCloudProjects];
                } catch (error) {
                    console.error('Failed to load cloud projects:', error);
                }
            }

            // Load local projects if mode supports it
            if (mode === 'standalone' || storageMode === 'local') {
                try {
                    const localProjects = JSON.parse(localStorage.getItem('localProjects') || '[]');
                    const convertedLocalProjects = localProjects.map((lp: any) => ({
                        id: lp.id,
                        name: lp.name,
                        description: lp.description,
                        mode: lp.mode,
                        storageMode: lp.storageMode,
                        lastAccessed: lp.createdAt, // Use creation time as last accessed
                        collaborators: lp.localNetworkConfig?.maxUsers || 0,
                        status: 'active' as const,
                        tags: [],
                        size: 'Unknown',
                        isOwner: true
                    }));
                    
                    allProjects = [...allProjects, ...convertedLocalProjects];
                } catch (error) {
                    console.error('Failed to load local projects:', error);
                }
            }
            
            // Filter projects based on current tab
            let filtered = allProjects;
            
            if (activeTab === 'my_projects') {
                filtered = filtered.filter(p => p.isOwner);
            } else if (activeTab === 'shared_projects') {
                filtered = filtered.filter(p => !p.isOwner);
            }
            
            setProjects(filtered);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProjects = () => {
        let filtered = [...projects];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'lastAccessed':
                    return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
                case 'size':
                    // Simple size comparison (would need proper implementation)
                    return (b.size || '').localeCompare(a.size || '');
                case 'collaborators':
                    return (b.collaborators || 0) - (a.collaborators || 0);
                default:
                    return 0;
            }
        });

        setFilteredProjects(filtered);
    };

    const handleProjectSelect = (projectId: string) => {
        simplifiedStartupSequencer.selectProject(projectId);
        onProjectSelected?.(projectId);
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

    const getStorageIcon = (projectStorageMode: StorageMode) => {
        switch (projectStorageMode) {
            case 'local': return <ComputerIcon fontSize="small" />;
            case 'cloud': return <CloudIcon fontSize="small" />;
            case 'hybrid': return <StorageIcon fontSize="small" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'shared': return 'info';
            case 'archived': return 'default';
            default: return 'default';
        }
    };

    const renderProjectCard = (project: Project) => (
        <div>
            <Card
                sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) => theme.shadows[4]
                    }
                }}
                onClick={() => handleProjectSelect(project.id)}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FolderIcon color="primary" />
                            <Typography variant="h6" component="h3" noWrap>
                                {project.name}
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setAnchorEl(e.currentTarget);
                            }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Box>

                    {project.description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {project.description}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        <Chip
                            size="small"
                            label={project.status}
                            color={getStatusColor(project.status) as any}
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            icon={getStorageIcon(project.storageMode)}
                            label={project.storageMode}
                            variant="outlined"
                        />
                        {project.collaborators && (
                            <Chip
                                size="small"
                                icon={<PeopleIcon />}
                                label={project.collaborators}
                                variant="outlined"
                            />
                        )}
                    </Box>

                    {project.tags && project.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {project.tags.slice(0, 3).map((tag) => (
                                <Chip
                                    key={tag}
                                    size="small"
                                    label={tag}
                                    variant="filled"
                                    color="primary"
                                    sx={{ fontSize: '0.75rem' }}
                                />
                            ))}
                            {project.tags.length > 3 && (
                                <Chip
                                    size="small"
                                    label={`+${project.tags.length - 3}`}
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                />
                            )}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Typography variant="caption" color="text.secondary">
                            {formatLastAccessed(project.lastAccessed)}
                        </Typography>
                        {project.size && (
                            <Typography variant="caption" color="text.secondary">
                                {project.size}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </div>
    );

    const renderEmptyState = () => (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <FolderOpenIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'No projects found' : 'No projects yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                {searchQuery
                    ? 'Try adjusting your search criteria'
                    : mode === 'standalone'
                    ? 'Create your first standalone project to get started'
                    : 'Create or join a network project to begin collaborating'
                }
            </Typography>
            {!searchQuery && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateDialog(true)}
                    size="large"
                >
                    Create Project
                </Button>
            )}
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Your Projects
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {onBack && (
                            <Button onClick={onBack} variant="outlined">
                                Back
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setShowCreateDialog(true)}
                        >
                            Create Project
                        </Button>
                    </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        Currently in <strong>{mode === 'standalone' ? 'Standalone' : 'Network'} mode</strong> with{' '}
                        <strong>{storageMode} storage</strong>. 
                        {mode === 'standalone' && storageMode === 'local' && ' Working offline with local files.'}
                        {mode === 'shared_network' && ' Ready for team collaboration.'}
                    </Typography>
                </Alert>

                {/* Search and Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1, minWidth: 200 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<SortIcon />}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        Sort: {sortBy}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadProjects}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab
                        label={
                            <Badge badgeContent={projects.filter(p => p.isOwner).length} color="primary">
                                My Projects
                            </Badge>
                        }
                        value="my_projects"
                    />
                    {mode === 'shared_network' && (
                        <Tab
                            label={
                                <Badge badgeContent={projects.filter(p => !p.isOwner).length} color="secondary">
                                    Shared Projects
                                </Badge>
                            }
                            value="shared_projects"
                        />
                    )}
                    <Tab label="Recent" value="recent" />
                </Tabs>
            </Box>

            {/* Project Grid */}
            <Box sx={{ mb: 4 }}>
                {loading ? (
                    <Grid container spacing={3}>
                        {[...Array(6)].map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : filteredProjects.length > 0 ? (
                    <Grid container spacing={3}>
                        
                            {filteredProjects.map((project) => (
                                <Grid item xs={12} sm={6} md={4} key={project.id}>
                                    {renderProjectCard(project)}
                                </Grid>
                            ))}
                        
                    </Grid>
                ) : (
                    renderEmptyState()
                )}
            </Box>

            {/* Sort Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {[
                    { value: 'lastAccessed', label: 'Last Accessed' },
                    { value: 'name', label: 'Name' },
                    { value: 'size', label: 'Size' },
                    { value: 'collaborators', label: 'Collaborators' }
                ].map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={sortBy === option.value}
                        onClick={() => {
                            setSortBy(option.value as SortBy);
                            setAnchorEl(null);
                        }}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>

            {/* Create Project Dialog */}
            <UnifiedProjectCreationDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                mode={mode}
                onSuccess={(projectId) => {
                    setShowCreateDialog(false);
                    handleProjectSelect(projectId);
                }}
            />
        </Container>
    );
};

export default UnifiedProjectSelection;
