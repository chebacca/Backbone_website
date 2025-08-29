import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Sync as SyncIcon,
  SyncProblem as SyncProblemIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import realtimeSyncService from '../../services/RealtimeSyncService';

interface SyncStatus {
  totalEvents: number;
  pendingEvents: number;
  lastSyncTime: Date | null;
}

interface SyncEvent {
  id: string;
  type: 'role_assignment' | 'project_assignment' | 'team_member_update' | 'permission_change';
  projectId: string;
  teamMemberId: string;
  data: any;
  timestamp: Date;
  syncedToDashboard: boolean;
}

interface SyncStatusIndicatorProps {
  organizationId: string;
  projectId?: string;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  organizationId,
  projectId
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    totalEvents: 0,
    pendingEvents: 0,
    lastSyncTime: null
  });
  const [recentEvents, setRecentEvents] = useState<SyncEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sync status
  useEffect(() => {
    loadSyncStatus();
    
    // Set up real-time sync
    realtimeSyncService.startSync(organizationId);
    
    // Listen for sync events
    const unsubscribeEvents = realtimeSyncService.onSyncEvent((event) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
      loadSyncStatus(); // Refresh status
    });
    
    // Listen for role updates
    const unsubscribeRoles = realtimeSyncService.onRoleUpdate((data) => {
      console.log('🔄 [SYNC STATUS] Role update received:', data);
      loadSyncStatus(); // Refresh status
    });
    
    // Cleanup
    return () => {
      unsubscribeEvents();
      unsubscribeRoles();
      realtimeSyncService.stopSync();
    };
  }, [organizationId]);

  const loadSyncStatus = async () => {
    try {
      const status = await realtimeSyncService.getSyncStatus(organizationId);
      setSyncStatus(status);
      setError(null);
    } catch (err) {
      console.error('Failed to load sync status:', err);
      setError('Failed to load sync status');
    }
  };

  const handleManualSync = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await realtimeSyncService.triggerProjectSync(projectId);
      await loadSyncStatus();
      
    } catch (err) {
      console.error('Manual sync failed:', err);
      setError('Manual sync failed');
    } finally {
      setLoading(false);
    }
  };

  const getSyncStatusColor = () => {
    if (syncStatus.pendingEvents > 0) return 'warning';
    if (syncStatus.totalEvents > 0) return 'success';
    return 'default';
  };

  const getSyncStatusIcon = () => {
    if (loading) return <CircularProgress size={16} />;
    if (syncStatus.pendingEvents > 0) return <SyncProblemIcon />;
    if (syncStatus.totalEvents > 0) return <CheckCircleIcon />;
    return <SyncIcon />;
  };

  const getSyncStatusText = () => {
    if (syncStatus.pendingEvents > 0) {
      return `${syncStatus.pendingEvents} pending`;
    }
    if (syncStatus.totalEvents > 0) {
      return 'Synced';
    }
    return 'No sync data';
  };

  const getEventIcon = (type: SyncEvent['type']) => {
    switch (type) {
      case 'role_assignment': return <CheckCircleIcon color="primary" />;
      case 'project_assignment': return <InfoIcon color="info" />;
      case 'team_member_update': return <WarningIcon color="warning" />;
      case 'permission_change': return <ErrorIcon color="error" />;
      default: return <SyncIcon />;
    }
  };

  const getEventDescription = (event: SyncEvent) => {
    switch (event.type) {
      case 'role_assignment':
        return `Role assignment updated for project ${event.projectId}`;
      case 'project_assignment':
        return `Team member assigned to project ${event.projectId}`;
      case 'team_member_update':
        return `Team member ${event.teamMemberId} updated`;
      case 'permission_change':
        return `Permissions changed for project ${event.projectId}`;
      default:
        return `Sync event: ${event.type}`;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Sync Status Indicator */}
      <Box display="flex" alignItems="center" gap={1}>
        <Tooltip title={`Sync Status: ${getSyncStatusText()}`}>
          <Chip
            icon={getSyncStatusIcon()}
            label={getSyncStatusText()}
            color={getSyncStatusColor()}
            size="small"
            onClick={() => setDialogOpen(true)}
            clickable
          />
        </Tooltip>
        
        {projectId && (
          <Tooltip title="Manual Sync">
            <IconButton
              size="small"
              onClick={handleManualSync}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Sync Status Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <SyncIcon color="primary" />
            <Typography variant="h6">
              Real-time Sync Status
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Sync Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {syncStatus.totalEvents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sync Events
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h4" color="warning.main">
                    {syncStatus.pendingEvents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Events
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body1" color="text.primary">
                    {syncStatus.lastSyncTime 
                      ? formatTimestamp(syncStatus.lastSyncTime)
                      : 'Never'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Sync
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Recent Events */}
          <Typography variant="h6" gutterBottom>
            Recent Sync Events
          </Typography>
          
          {recentEvents.length > 0 ? (
            <List>
              {recentEvents.map((event, index) => (
                <ListItem key={`${event.id}-${index}`} divider>
                  <ListItemIcon>
                    {getEventIcon(event.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={getEventDescription(event)}
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <ScheduleIcon fontSize="small" />
                        <Typography variant="caption">
                          {formatTimestamp(event.timestamp)}
                        </Typography>
                        <Chip
                          label={event.syncedToDashboard ? 'Synced' : 'Pending'}
                          size="small"
                          color={event.syncedToDashboard ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                No recent sync events
              </Typography>
            </Box>
          )}

          {/* Sync Information */}
          <Divider sx={{ my: 2 }} />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Real-time Sync:</strong> Changes made in the licensing website are automatically 
              synchronized to the Dashboard project. This ensures team members have consistent 
              access and permissions across both platforms.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          {projectId && (
            <Button
              variant="contained"
              onClick={handleManualSync}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            >
              Manual Sync
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SyncStatusIndicator;
