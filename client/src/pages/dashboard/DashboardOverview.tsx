/**
 * 🏠 Dashboard Overview - Firebase WebOnly Mode
 * 
 * Fixed implementation using proper Firebase webonly mode data fetching
 * with FirestoreCollectionManager and Firebase Auth integration.
 */

import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Security,
  Download,
  CardMembership,
  Payment,
  CheckCircle,
  Schedule,
  Update,
  Star,
  Assessment,
  Cloud,
  ArrowForward,
  Warning,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardUser {
  id: string;
  email: string;
  name: string;
  role: string;
  userType: string;
  organizationId?: string;
  organizationName?: string;
  tier?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardOrganization {
  id: string;
  name: string;
  tier: string;
  ownerUserId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  organizationId: string;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardMetrics {
  activeLicenses: number;
  totalLicenses: number;
  monthlyUsage: number;
  totalDownloads: number;
  currentPlan: string;
  daysUntilRenewal: string;
  hasEnterpriseFeatures: boolean;
  projectCount: number;
  teamMemberCount: number;
  licenseUtilization: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // State for data
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);
  const [organization, setOrganization] = useState<DashboardOrganization | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [teamMembers, setTeamMembers] = useState<DashboardUser[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 DEBUG: Add this logging to see what's happening
  useEffect(() => {
    console.log('🔍 [DashboardOverview] State Debug:', {
      authLoading,
      loading,
      user,
      isAuthenticated,
      currentUser,
      organization,
      projects,
      teamMembers
    });
  }, [authLoading, loading, user, isAuthenticated, currentUser, organization, projects, teamMembers]);

  // 🔍 DEBUG: Add this logging to see what's happening
  useEffect(() => {
    console.log('🔍 [DashboardOverview] State Debug:', {
      authLoading,
      loading,
      user,
      isAuthenticated,
      currentUser,
      organization,
      projects,
      teamMembers
    });
  }, [authLoading, loading, user, isAuthenticated, currentUser, organization, projects, teamMembers]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 [DashboardOverview] Fetching data for user:', {
          userId: user.id,
          firebaseUid: user.firebaseUid,
          organizationId: user.organizationId,
          email: user.email
        });

        // Get current user data from Firestore using Firebase UID
        const firebaseUid = user.firebaseUid || user.id;
        const userDoc = await getDoc(doc(db, 'users', firebaseUid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            id: userDoc.id,
            ...userData,
            createdAt: userData.createdAt?.toDate() || new Date(),
            updatedAt: userData.updatedAt?.toDate() || new Date(),
          } as DashboardUser);
        }

        // Get organization data if user has organizationId
        if (user.organizationId) {
          const orgDoc = await getDoc(doc(db, 'organizations', user.organizationId));
          if (orgDoc.exists()) {
            const orgData = orgDoc.data();
            setOrganization({
              id: orgDoc.id,
              ...orgData,
              createdAt: orgData.createdAt?.toDate() || new Date(),
              updatedAt: orgData.updatedAt?.toDate() || new Date(),
            } as DashboardOrganization);
          }
        }

        // Get projects for the user's organization
        if (user.organizationId) {
          console.log('🔍 [DashboardOverview] Querying projects for organizationId:', user.organizationId);
          try {
            const projectsQuery = query(
              collection(db, 'projects'),
              where('organizationId', '==', user.organizationId),
              orderBy('createdAt', 'desc'),
              limit(10)
            );
            const projectsSnapshot = await getDocs(projectsQuery);
            console.log('✅ [DashboardOverview] Projects found:', projectsSnapshot.size);
            const projectsData = projectsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            } as DashboardProject));
            setProjects(projectsData);
          } catch (projectsError) {
            console.error('❌ [DashboardOverview] Error fetching projects:', projectsError);
            throw projectsError;
          }
        }

        // Get team members for the organization
        if (user.organizationId) {
          console.log('🔍 [DashboardOverview] Querying team members for organizationId:', user.organizationId);
          try {
            const teamQuery = query(
              collection(db, 'teamMembers'),
              where('organizationId', '==', user.organizationId),
              where('status', '==', 'ACTIVE')
            );
            const teamSnapshot = await getDocs(teamQuery);
            console.log('✅ [DashboardOverview] Team members found:', teamSnapshot.size);
            const teamData = teamSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            } as DashboardUser));
            setTeamMembers(teamData);
          } catch (teamError) {
            console.error('❌ [DashboardOverview] Error fetching team members:', teamError);
            throw teamError;
          }
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const metrics = useMemo((): DashboardMetrics => {
    if (!currentUser || !organization) {
      return {
        activeLicenses: 0,
        totalLicenses: 0,
        monthlyUsage: 0,
        totalDownloads: 0,
        currentPlan: 'Unknown',
        daysUntilRenewal: 'N/A',
        hasEnterpriseFeatures: false,
        projectCount: 0,
        teamMemberCount: 0,
        licenseUtilization: 0,
      };
    }

    // Calculate license metrics
    const activeLicenses = currentUser.status === 'ACTIVE' ? 1 : 0;
    const totalLicenses = 1; // Each user has one license
    const licenseUtilization = totalLicenses > 0 ? (activeLicenses / totalLicenses) * 100 : 0;

    // Calculate usage metrics
    const monthlyUsage = projects.reduce((sum, project) => {
      return sum + (project.status === 'ACTIVE' ? 100 : 0); // Estimate based on active projects
    }, 0);
    
    const totalDownloads = projects.reduce((sum, project) => {
      return sum + (project.status === 'ACTIVE' ? 50 : 0); // Estimate based on active projects
    }, 0);

    // Organization metrics
    const teamMemberCount = teamMembers.length;
    const projectCount = projects.length;

    // Plan information
    const currentPlan = organization.tier || 'BASIC';
    const hasEnterpriseFeatures = currentPlan === 'ENTERPRISE';
    
    // Calculate renewal date (placeholder - would come from subscription data)
    const daysUntilRenewal = '30 days'; // Placeholder

    return {
      activeLicenses,
      totalLicenses,
      monthlyUsage,
      totalDownloads,
      currentPlan,
      daysUntilRenewal,
      hasEnterpriseFeatures,
      projectCount,
      teamMemberCount,
      licenseUtilization,
    };
  }, [currentUser, organization, projects, teamMembers]);

  // User role detection
  const userRole = useMemo(() => {
    if (!currentUser) return 'unknown';
    return currentUser.role?.toLowerCase() || 'member';
  }, [currentUser]);

  const isAdmin = userRole === 'admin' || userRole === 'owner' || userRole === 'superadmin';

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Dashboard Data...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching your organization and project information
          </Typography>
        </Box>
      </Box>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Unable to Load Dashboard Data</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            We encountered an issue loading your dashboard information. This could be due to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><Warning fontSize="small" /></ListItemIcon>
              <ListItemText primary="Network connectivity issues" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Security fontSize="small" /></ListItemIcon>
              <ListItemText primary="Authentication token expired" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
              <ListItemText primary="Firebase service temporarily unavailable" />
            </ListItem>
          </List>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Retry
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard/support')}
            >
              Contact Support
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // ============================================================================
  // NO DATA STATE
  // ============================================================================

  if (!currentUser || !organization) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <AlertTitle>Setting Up Your Dashboard</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            We're preparing your dashboard. This usually happens when:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><Info fontSize="small" /></ListItemIcon>
              <ListItemText primary="Your account is being set up for the first time" />
            </ListItem>
            <ListItem>
              <ListItemIcon><People fontSize="small" /></ListItemIcon>
              <ListItemText primary="You're being added to an organization" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Schedule fontSize="small" /></ListItemIcon>
              <ListItemText primary="Data synchronization is in progress" />
            </ListItem>
          </List>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Refresh
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard/team')}
            >
              Check Team Status
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // ============================================================================
  // MAIN DASHBOARD CONTENT
  // ============================================================================

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {currentUser.name || currentUser.email}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {organization.name} • {metrics.currentPlan} Plan • {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </Typography>
      </Box>

      {/* Quick Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Active Licenses */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active Licenses
                  </Typography>
                  <Typography variant="h4">
                    {metrics.activeLicenses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {metrics.totalLicenses} total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <CardMembership />
                </Avatar>
              </Box>
              {metrics.totalLicenses > 0 && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.licenseUtilization} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {metrics.licenseUtilization.toFixed(1)}% utilization
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Projects */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Projects
                  </Typography>
                  <Typography variant="h4">
                    {metrics.projectCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    active projects
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Assessment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Members */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Team Members
                  </Typography>
                  <Typography variant="h4">
                    {metrics.teamMemberCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    in organization
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Usage */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Monthly Usage
                  </Typography>
                  <Typography variant="h4">
                    {metrics.monthlyUsage.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    API calls
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                <ListItem button onClick={() => navigate('/dashboard/projects')}>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Manage Projects" 
                    secondary={`${metrics.projectCount} active projects`}
                  />
                  <ArrowForward />
                </ListItem>
                <Divider />
                <ListItem button onClick={() => navigate('/dashboard/team')}>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Team Management" 
                    secondary={`${metrics.teamMemberCount} team members`}
                  />
                  <ArrowForward />
                </ListItem>
                <Divider />
                <ListItem button onClick={() => navigate('/dashboard/licenses')}>
                  <ListItemIcon>
                    <CardMembership />
                  </ListItemIcon>
                  <ListItemText 
                    primary="License Management" 
                    secondary={`${metrics.activeLicenses} active licenses`}
                  />
                  <ArrowForward />
                </ListItem>
                {isAdmin && (
                  <>
                    <Divider />
                    <ListItem button onClick={() => navigate('/dashboard/billing')}>
                      <ListItemIcon>
                        <Payment />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Billing & Subscription" 
                        secondary={`${metrics.currentPlan} plan • Renews ${metrics.daysUntilRenewal}`}
                      />
                      <ArrowForward />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={<CheckCircle />} 
                  label={`${metrics.currentPlan} Plan`} 
                  color="primary" 
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<Security />} 
                  label={userRole.charAt(0).toUpperCase() + userRole.slice(1)} 
                  color="secondary" 
                  sx={{ mr: 1, mb: 1 }}
                />
                {metrics.hasEnterpriseFeatures && (
                  <Chip 
                    icon={<Star />} 
                    label="Enterprise" 
                    color="warning" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Organization: {organization.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Next renewal: {metrics.daysUntilRenewal}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => navigate('/dashboard/settings')}
                  sx={{ mr: 1 }}
                >
                  Account Settings
                </Button>
                {isAdmin && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => navigate('/dashboard/billing')}
                  >
                    Manage Billing
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Projects */}
      {projects && projects.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Projects
            </Typography>
            <List>
              {projects.slice(0, 5).map((project, index) => (
                <React.Fragment key={project.id}>
                  <ListItem button onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                    <ListItemIcon>
                      <Assessment />
                    </ListItemIcon>
                    <ListItemText 
                      primary={project.name} 
                      secondary={`Created ${new Date(project.createdAt).toLocaleDateString()}`}
                    />
                    <Chip 
                      label={project.status || 'ACTIVE'} 
                      size="small" 
                      color={project.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </ListItem>
                  {index < Math.min(projects.length - 1, 4) && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {projects.length > 5 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/dashboard/projects')}
                >
                  View All Projects ({projects.length})
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Projects State */}
      {projects && projects.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Projects Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started by creating your first project
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/dashboard/projects')}
            >
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DashboardOverview;
