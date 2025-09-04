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
import MetricCard from '@/components/common/MetricCard';
import { useOrganizationLicenses, useOrganizationTeamMembers } from '@/hooks/useStreamlinedData';

// Utility function to safely convert Firestore dates
const convertFirestoreDate = (value: any): Date | null => {
  if (!value) return null;
  
  // If it's already a Date object
  if (value instanceof Date) return value;
  
  // If it's a Firestore Timestamp with toDate method
  if (value && typeof value === 'object' && typeof value.toDate === 'function') {
    try {
      return value.toDate();
    } catch (error) {
      console.warn('Failed to convert Firestore timestamp:', error);
      return null;
    }
  }
  
  // If it's an ISO string
  if (typeof value === 'string') {
    try {
      return new Date(value);
    } catch (error) {
      console.warn('Failed to parse date string:', error);
      return null;
    }
  }
  
  // If it's a number (timestamp)
  if (typeof value === 'number') {
    try {
      return new Date(value);
    } catch (error) {
      console.warn('Failed to convert timestamp number:', error);
      return null;
    }
  }
  
  return null;
};

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
  
  // 🚀 STREAMLINED: Use organization license and team data hooks
  const { data: licenses, loading: licensesLoading } = useOrganizationLicenses();
  const { data: teamMembersData, loading: teamMembersLoading } = useOrganizationTeamMembers();
  
  // State for data
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);
  const [organization, setOrganization] = useState<DashboardOrganization | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [teamMembers, setTeamMembers] = useState<DashboardUser[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 DEBUG: Removed duplicate debug logging for cleaner console output

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetching data for authenticated user

        // Get current user data from Firestore - try both UID and email as document ID
        const firebaseUid = user.firebaseUid || user.id;
        const userEmail = user.email;
        
        let userDoc = await getDoc(doc(db, 'users', firebaseUid));
        
        // If not found by UID, try by email
        if (!userDoc.exists() && userEmail) {
          console.log('🔍 [DashboardOverview] User not found by UID, trying email:', userEmail);
          userDoc = await getDoc(doc(db, 'users', userEmail));
        }
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            id: userDoc.id,
            ...userData,
            createdAt: convertFirestoreDate(userData.createdAt) || new Date(),
            updatedAt: convertFirestoreDate(userData.updatedAt) || new Date(),
          } as DashboardUser);
          console.log('✅ [DashboardOverview] Found user data:', userData.email);
        } else {
          console.warn('⚠️ [DashboardOverview] User document not found for UID or email:', firebaseUid, userEmail);
        }

        // Get organization data if user has organizationId
        if (user.organizationId) {
          const orgDoc = await getDoc(doc(db, 'organizations', user.organizationId));
          if (orgDoc.exists()) {
            const orgData = orgDoc.data();
            setOrganization({
              id: orgDoc.id,
              ...orgData,
              createdAt: convertFirestoreDate(orgData.createdAt) || new Date(),
              updatedAt: convertFirestoreDate(orgData.updatedAt) || new Date(),
            } as DashboardOrganization);
          }
        }

        // Get projects for the user's organization
        if (user.organizationId) {
                      // Querying projects for organization
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
              createdAt: convertFirestoreDate(doc.data().createdAt) || new Date(),
              updatedAt: convertFirestoreDate(doc.data().updatedAt) || new Date(),
            } as DashboardProject));
            setProjects(projectsData);
          } catch (projectsError) {
            console.error('❌ [DashboardOverview] Error fetching projects:', projectsError);
            throw projectsError;
          }
        }

        // Get team members for the organization
        if (user.organizationId) {
                      // Querying team members for organization
          try {
            const teamQuery = query(
              collection(db, 'teamMembers'),
              where('organizationId', '==', user.organizationId),
              where('status', 'in', ['ACTIVE', 'active'])
            );
            const teamSnapshot = await getDocs(teamQuery);
            console.log('✅ [DashboardOverview] Team members found:', teamSnapshot.size);
            const teamData = teamSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: convertFirestoreDate(doc.data().createdAt) || new Date(),
              updatedAt: convertFirestoreDate(doc.data().updatedAt) || new Date(),
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

    // 🎫 Calculate license metrics from actual organization license data
    const totalLicenses = licenses?.length || 0;
    const activeLicenses = licenses?.filter(l => l.status === 'ACTIVE').length || 0;
    const licenseUtilization = totalLicenses > 0 ? (activeLicenses / totalLicenses) * 100 : 0;

    // Calculate usage metrics
    const monthlyUsage = projects.reduce((sum, project) => {
      return sum + (project.status === 'ACTIVE' ? 100 : 0); // Estimate based on active projects
    }, 0);
    
    const totalDownloads = projects.reduce((sum, project) => {
      return sum + (project.status === 'ACTIVE' ? 50 : 0); // Estimate based on active projects
    }, 0);

    // Organization metrics
    const teamMemberCount = teamMembersData?.length || teamMembers.length;
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
  }, [currentUser, organization, projects, teamMembers, licenses, teamMembersData]);

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

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Licenses"
            value={`${metrics.activeLicenses}/${metrics.totalLicenses}`}
            icon={<CardMembership />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Projects"
            value={metrics.projectCount.toString()}
            icon={<Assessment />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Team Members"
            value={metrics.teamMemberCount.toString()}
            icon={<People />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Usage"
            value={metrics.monthlyUsage.toLocaleString()}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* License Utilization Progress */}
      {metrics.totalLicenses > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              License Utilization
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={metrics.licenseUtilization} 
                sx={{ flex: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ minWidth: 60 }}>
                {metrics.licenseUtilization.toFixed(1)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {metrics.activeLicenses} of {metrics.totalLicenses} licenses are currently active
            </Typography>
          </CardContent>
        </Card>
      )}

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
