import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { cloudProjectIntegration } from '../../services/CloudProjectIntegration';
import { offlineStorageManager } from '../../services/OfflineStorageManager';
import { syncService } from '../../services/SyncService';
import { isOnline } from '../../utils/NetworkUtils';

/**
 * Offline Test Page
 * 
 * A simple test page for testing offline project creation and synchronization.
 */
const OfflineTestPage: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<boolean>(isOnline());
  const [projects, setProjects] = useState<any[]>([]);
  const [offlineProjects, setOfflineProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');
  
  // Update network status when it changes
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load projects
  const loadProjects = async () => {
    setLoading(true);
    try {
      // Get all projects
      const allProjects = await cloudProjectIntegration.getUserProjects();
      setProjects(allProjects);
      
      // Get offline projects
      const offlineProjs = await offlineStorageManager.getOfflineProjects();
      setOfflineProjects(offlineProjs);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a test project
  const createTestProject = async () => {
    setLoading(true);
    try {
      const projectName = `Test Project ${new Date().toLocaleTimeString()}`;
      setTestResult(`Creating project: ${projectName}...`);
      
      const projectId = await cloudProjectIntegration.createCloudProject({
        name: projectName,
        description: 'Test project for offline creation',
        storageMode: 'cloud',
        cloudConfig: {
          provider: 'firestore'
        },
        collaborationSettings: {
          maxCollaborators: 5,
          enableRealTime: true,
          enableComments: true,
          enableFileSharing: true
        }
      });
      
      setTestResult(`Project created with ID: ${projectId}`);
      
      // Reload projects
      await loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Force sync
  const forceSync = async () => {
    setLoading(true);
    try {
      setTestResult('Syncing...');
      const result = await syncService.forceSyncNow();
      setTestResult(`Sync ${result ? 'succeeded' : 'failed'}`);
      
      // Reload projects
      await loadProjects();
    } catch (error) {
      console.error('Failed to sync:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);
  
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Offline Project Creation Test
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Network Status
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Chip 
            label={networkStatus ? 'Online' : 'Offline'} 
            color={networkStatus ? 'success' : 'error'} 
            sx={{ mr: 2 }}
          />
          <Typography>
            {networkStatus 
              ? 'You are online. Projects will be created in Firestore.' 
              : 'You are offline. Projects will be created locally.'}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            onClick={createTestProject}
            disabled={loading}
          >
            Create Test Project
          </Button>
          <Button 
            variant="outlined" 
            onClick={forceSync}
            disabled={loading || !networkStatus}
          >
            Force Sync
          </Button>
          <Button 
            variant="outlined" 
            onClick={loadProjects}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>
      
      {testResult && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography>{testResult}</Typography>
        </Paper>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Projects ({projects.length})
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <List>
            {projects.length === 0 ? (
              <ListItem>
                <ListItemText primary="No projects found" />
              </ListItem>
            ) : (
              projects.map((project) => (
                <React.Fragment key={project.id}>
                  <ListItem>
                    <ListItemText 
                      primary={project.name} 
                      secondary={`ID: ${project.id} | Created: ${new Date(project.createdAt).toLocaleString()}`} 
                    />
                    {project.id.startsWith('offline_') && (
                      <Chip 
                        label="Offline" 
                        color="warning" 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                    )}
                    {project.pendingSync && (
                      <Chip 
                        label="Pending Sync" 
                        color="info" 
                        size="small"
                      />
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Offline Projects ({offlineProjects.length})
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <List>
            {offlineProjects.length === 0 ? (
              <ListItem>
                <ListItemText primary="No offline projects found" />
              </ListItem>
            ) : (
              offlineProjects.map((project) => (
                <React.Fragment key={project.id}>
                  <ListItem>
                    <ListItemText 
                      primary={project.name} 
                      secondary={`ID: ${project.id} | Created: ${new Date(project.createdAt).toLocaleString()}`} 
                    />
                    {project.pendingSync && (
                      <Chip 
                        label="Pending Sync" 
                        color="info" 
                        size="small"
                      />
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default OfflineTestPage;
