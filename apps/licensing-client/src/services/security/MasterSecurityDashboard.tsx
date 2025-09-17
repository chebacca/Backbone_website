import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Computer as ComputerIcon,
  Cloud as CloudIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Types for security monitoring
interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'breach' | 'threat' | 'unauthorized_access' | 'suspicious_activity' | 'data_exfiltration';
  source: 'dashboard_app' | 'licensing_website' | 'firebase_auth' | 'firestore' | 'api';
  description: string;
  userContext: {
    userId: string;
    userRole: string;
    organizationId: string;
    isAnonymized: boolean;
  };
  resolved: boolean;
  autoResolved: boolean;
}

interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  securityAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

interface UserSecurityOverview {
  userId: string;
  userRole: string;
  organizationId: string;
  lastActivity: Date;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeAlerts: number;
  totalAlerts: number;
  isOnline: boolean;
  lastLogin: Date;
  deviceCount: number;
  suspiciousActivity: boolean;
}

interface MasterSecurityDashboardProps {
  userRole: 'DEV_ADMIN' | 'ORG_ADMIN' | 'USER';
  organizationId?: string;
}

const MasterSecurityDashboard: React.FC<MasterSecurityDashboardProps> = ({ 
  userRole,
  organizationId
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [userOverviews, setUserOverviews] = useState<UserSecurityOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Determine if user has appropriate permissions
  const hasSecurityAccess = useCallback(() => {
    return userRole === 'DEV_ADMIN' || userRole === 'ORG_ADMIN';
  }, [userRole]);

  const isDevAdmin = userRole === 'DEV_ADMIN';
  const isOrgAdmin = userRole === 'ORG_ADMIN';

  // Load security metrics based on user role
  const loadSecurityMetrics = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isDevAdmin) {
        // DEV ADMIN: Get metrics from both platforms
        const [dashboardMetrics, licensingMetrics] = await Promise.all([
          fetch('/api/security/metrics?source=dashboard_app').then(res => res.json()).catch(() => null),
          fetch('/api/security/metrics?source=licensing_website').then(res => res.json()).catch(() => null)
        ]);

        const combinedMetrics: SecurityMetrics = {
          totalUsers: (dashboardMetrics?.totalUsers || 0) + (licensingMetrics?.totalUsers || 0),
          activeUsers: (dashboardMetrics?.activeUsers || 0) + (licensingMetrics?.activeUsers || 0),
          securityAlerts: (dashboardMetrics?.securityAlerts || 0) + (licensingMetrics?.securityAlerts || 0),
          criticalAlerts: (dashboardMetrics?.criticalAlerts || 0) + (licensingMetrics?.criticalAlerts || 0),
          resolvedAlerts: (dashboardMetrics?.resolvedAlerts || 0) + (licensingMetrics?.resolvedAlerts || 0),
          threatLevel: 'medium',
          lastUpdated: new Date()
        };

        setSecurityMetrics(combinedMetrics);
      } else if (isOrgAdmin && organizationId) {
        // ORG ADMIN: Get metrics only for their organization
        const orgMetrics = await fetch(`/api/security/metrics?source=licensing_website&organizationId=${organizationId}`)
          .then(res => res.json())
          .catch(() => null);

        setSecurityMetrics(orgMetrics || {
          totalUsers: 0,
          activeUsers: 0,
          securityAlerts: 0,
          criticalAlerts: 0,
          resolvedAlerts: 0,
          threatLevel: 'low',
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error loading security metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [isDevAdmin, isOrgAdmin, organizationId]);

  // Load security alerts based on user role
  const loadSecurityAlerts = useCallback(async () => {
    try {
      if (isDevAdmin) {
        // DEV ADMIN: Get alerts from both platforms
        const [dashboardAlerts, licensingAlerts] = await Promise.all([
          fetch('/api/security/alerts?source=dashboard_app').then(res => res.json()).catch(() => []),
          fetch('/api/security/alerts?source=licensing_website').then(res => res.json()).catch(() => [])
        ]);

        const allAlerts = [...dashboardAlerts, ...licensingAlerts]
          .map(alert => ({
            ...alert,
            timestamp: new Date(alert.timestamp)
          }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setSecurityAlerts(allAlerts);
      } else if (isOrgAdmin && organizationId) {
        // ORG ADMIN: Get alerts only for their organization
        const orgAlerts = await fetch(`/api/security/alerts?source=licensing_website&organizationId=${organizationId}`)
          .then(res => res.json())
          .catch(() => []);

        const filteredAlerts = orgAlerts
          .map(alert => ({
            ...alert,
            timestamp: new Date(alert.timestamp)
          }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setSecurityAlerts(filteredAlerts);
      }
    } catch (error) {
      console.error('Error loading security alerts:', error);
    }
  }, [isDevAdmin, isOrgAdmin, organizationId]);

  // Load user security overviews based on user role
  const loadUserOverviews = useCallback(async () => {
    try {
      if (isDevAdmin) {
        // DEV ADMIN: Get user data from both platforms (anonymized)
        const [dashboardUsers, licensingUsers] = await Promise.all([
          fetch('/api/security/users?source=dashboard_app').then(res => res.json()).catch(() => []),
          fetch('/api/security/users?source=licensing_website').then(res => res.json()).catch(() => [])
        ]);

        const allUsers = [...dashboardUsers, ...licensingUsers]
          .map(user => ({
            ...user,
            userId: `user_${user.userId.slice(-4)}`, // Anonymize user ID
            lastActivity: new Date(user.lastActivity),
            lastLogin: new Date(user.lastLogin)
          }))
          .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

        setUserOverviews(allUsers);
      } else if (isOrgAdmin && organizationId) {
        // ORG ADMIN: Get user data only for their organization (not anonymized)
        const orgUsers = await fetch(`/api/security/users?source=licensing_website&organizationId=${organizationId}`)
          .then(res => res.json())
          .catch(() => []);

        const filteredUsers = orgUsers
          .map(user => ({
            ...user,
            lastActivity: new Date(user.lastActivity),
            lastLogin: new Date(user.lastLogin)
          }))
          .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

        setUserOverviews(filteredUsers);
      }
    } catch (error) {
      console.error('Error loading user overviews:', error);
    }
  }, [isDevAdmin, isOrgAdmin, organizationId]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLastRefresh(new Date());
    await Promise.all([
      loadSecurityMetrics(),
      loadSecurityAlerts(),
      loadUserOverviews()
    ]);
  }, [loadSecurityMetrics, loadSecurityAlerts, loadUserOverviews]);

  // Load data on component mount
  useEffect(() => {
    if (hasSecurityAccess()) {
      refreshData();
    }
  }, [hasSecurityAccess, refreshData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!hasSecurityAccess()) return;

    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [hasSecurityAccess, refreshData]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get threat level color
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  // Render security metrics overview
  const renderMetricsOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {securityMetrics?.totalUsers || 0}
                </Typography>
              </Box>
              <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h4" color="success.main">
                  {securityMetrics?.activeUsers || 0}
                </Typography>
              </Box>
              <ComputerIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Security Alerts
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {securityMetrics?.securityAlerts || 0}
                </Typography>
              </Box>
              <WarningIcon color="warning" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Critical Alerts
                </Typography>
                <Typography variant="h4" color="error.main">
                  {securityMetrics?.criticalAlerts || 0}
                </Typography>
              </Box>
              <ErrorIcon color="error" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Overall Threat Level</Typography>
              <Chip
                label={securityMetrics?.threatLevel?.toUpperCase() || 'UNKNOWN'}
                color={getSeverityColor(securityMetrics?.threatLevel || 'low') as any}
                size="large"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={securityMetrics?.threatLevel === 'critical' ? 100 : 
                     securityMetrics?.threatLevel === 'high' ? 75 :
                     securityMetrics?.threatLevel === 'medium' ? 50 : 25}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getThreatLevelColor(securityMetrics?.threatLevel || 'low')
                }
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render security alerts
  const renderSecurityAlerts = () => (
    <Card>
      <CardHeader
        title="Security Alerts"
        action={
          <Tooltip title="Refresh Alerts">
            <IconButton onClick={refreshData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        {securityAlerts.length === 0 ? (
          <Alert severity="success" icon={<CheckCircleIcon />}>
            No security alerts at this time
          </Alert>
        ) : (
          <List>
            {securityAlerts.slice(0, 20).map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem>
                  <ListItemIcon>
                    {alert.severity === 'critical' ? <ErrorIcon color="error" /> :
                     alert.severity === 'high' ? <WarningIcon color="warning" /> :
                     <SecurityIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {alert.description}
                        </Typography>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          color={getSeverityColor(alert.severity) as any}
                          size="small"
                        />
                        <Chip
                          label={alert.source.replace('_', ' ').toUpperCase()}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {alert.timestamp.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          User: {alert.userContext.isAnonymized ? '***' : alert.userContext.userId} | 
                          Role: {alert.userContext.userRole} | 
                          Org: {alert.userContext.organizationId}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box>
                    {alert.resolved ? (
                      <Chip label="Resolved" color="success" size="small" />
                    ) : (
                      <Chip label="Active" color="warning" size="small" />
                    )}
                  </Box>
                </ListItem>
                {index < securityAlerts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  // Render user security overview
  const renderUserOverview = () => (
    <Card>
      <CardHeader
        title="User Security Overview"
        subheader="Anonymized user security status across all platforms"
      />
      <CardContent>
        {userOverviews.length === 0 ? (
          <Alert severity="info">
            No user data available
          </Alert>
        ) : (
          <List>
            {userOverviews.slice(0, 50).map((user, index) => (
              <React.Fragment key={user.userId}>
                <ListItem>
                  <ListItemIcon>
                    {user.threatLevel === 'critical' ? <ErrorIcon color="error" /> :
                     user.threatLevel === 'high' ? <WarningIcon color="warning" /> :
                     user.threatLevel === 'medium' ? <SecurityIcon color="info" /> :
                     <CheckCircleIcon color="success" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          User {user.userId}
                        </Typography>
                        <Chip
                          label={user.threatLevel.toUpperCase()}
                          color={getSeverityColor(user.threatLevel) as any}
                          size="small"
                        />
                        {user.isOnline && (
                          <Chip label="Online" color="success" size="small" />
                        )}
                        {user.suspiciousActivity && (
                          <Chip label="Suspicious" color="warning" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Role: {user.userRole} | Org: {user.organizationId} | 
                          Devices: {user.deviceCount} | Alerts: {user.activeAlerts}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Last Activity: {user.lastActivity.toLocaleString()} | 
                          Last Login: {user.lastLogin.toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < userOverviews.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  // Check if user has appropriate permissions
  if (!hasSecurityAccess()) {
    return (
      <Box p={3}>
        <Alert severity="error" icon={<BlockIcon />}>
          <Typography variant="h6">Access Denied</Typography>
          <Typography>
            You do not have the required permissions to access the Security Dashboard.
            This dashboard is restricted to DEV ADMIN and Organization Admin users only.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1">
              {isDevAdmin ? 'Master Security Dashboard' : 'Organization Security Dashboard'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {isDevAdmin 
                ? 'Cross-Platform Security Monitoring & Threat Detection' 
                : 'Organization Security Monitoring & Team Member Management'
              }
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="textSecondary">
            Last updated: {lastRefresh.toLocaleString()}
          </Typography>
          <Tooltip title="Refresh All Data">
            <IconButton onClick={refreshData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mb={3}>
          <CircularProgress />
        </Box>
      )}

      <Box mb={3}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" icon={<AnalyticsIcon />} />
          <Tab label="Security Alerts" icon={<WarningIcon />} />
          <Tab label="User Overview" icon={<PeopleIcon />} />
        </Tabs>
      </Box>

      {activeTab === 0 && renderMetricsOverview()}
      {activeTab === 1 && renderSecurityAlerts()}
      {activeTab === 2 && renderUserOverview()}
    </Box>
  );
};

export default MasterSecurityDashboard;
