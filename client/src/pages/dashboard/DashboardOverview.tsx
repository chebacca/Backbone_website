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
import { useCurrentUser } from '@/hooks/useStreamlinedData';

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
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // 🚀 STREAMLINED: Use UnifiedDataService hooks for consistent data
  const { data: currentUser, loading: userLoading } = useCurrentUser();
  const { data: licenses, loading: licensesLoading } = useOrganizationLicenses();
  const { data: teamMembersData, loading: teamMembersLoading } = useOrganizationTeamMembers();
  
  // State for additional data
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
    if (!isAuthenticated || !user || !currentUser) return;

    const fetchAdditionalData = async () => {
      try {
        setLoading(true);
        setError(null);

        // For standalone users, we don't fetch projects or team members
        // as they don't have cloud projects or team management
        if (currentUser.userType === 'STANDALONE' || currentUser.user_type === 'STANDALONE' || currentUser.role === 'STANDALONE') {
          console.log('🔧 [DashboardOverview] Standalone user detected - skipping projects and team members');
          setProjects([]);
          setTeamMembers([]);
          setLoading(false);
          return;
        }

        // Get projects for the user's organization (only for non-standalone users)
        if (currentUser.organization?.id) {
          try {
            const projectsQuery = query(
              collection(db, 'projects'),
              where('organizationId', '==', currentUser.organization.id),
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
            // Don't throw error for projects, just log it
          }
        }

        // Team members are already loaded via useOrganizationTeamMembers hook
        // Convert to DashboardUser format for compatibility
        if (teamMembersData) {
          const teamData = teamMembersData.map(member => ({
            id: member.id,
            email: member.email,
            name: member.firstName + ' ' + member.lastName,
            role: member.role,
            userType: 'TEAM_MEMBER',
            organizationId: member.organizationId,
            status: member.status,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
          } as DashboardUser));
          setTeamMembers(teamData);
        }

      } catch (err) {
        console.error('Error fetching additional dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch additional data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalData();
  }, [isAuthenticated, user, currentUser, teamMembersData]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const metrics = useMemo((): DashboardMetrics => {
    if (!currentUser) {
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
      };
    }

    // 🎫 Calculate license metrics from actual organization license data
    const totalLicenses = licenses?.length || 0;
    const activeLicenses = licenses?.filter(l => l.status === 'ACTIVE').length || 0;

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

    // Plan information from currentUser organization data
    const currentPlan = currentUser.organization?.tier || 'BASIC';
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
    };
  }, [currentUser, projects, teamMembers, licenses, teamMembersData]);

  // User role detection
  const userRole = useMemo(() => {
    if (!currentUser) return 'unknown';
    return currentUser.role?.toLowerCase() || 'member';
  }, [currentUser]);

  const isAdmin = userRole === 'admin' || userRole === 'owner' || userRole === 'superadmin';

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (authLoading || userLoading || loading) {
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

  if (!currentUser) {
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
          {currentUser.organization?.name || 'Standalone User'} • {metrics.currentPlan} Plan • {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </Typography>
      </Box>

      {/* Analytics Cards and Account Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Account Status"
            value={metrics.currentPlan}
            icon={<Security />}
            color="primary"
          />
        </Grid>
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
      </Grid>


      {/* Quick Actions and Recent Projects Side by Side */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                {/* Show different actions for standalone vs subscription users */}
                {currentUser.userType === 'STANDALONE' || currentUser.user_type === 'STANDALONE' || currentUser.role === 'STANDALONE' ? (
                  // Standalone user actions
                  <>
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
                    <Divider />
                    <ListItem button onClick={() => navigate('/dashboard/downloads')}>
                      <ListItemIcon>
                        <Download />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Downloads" 
                        secondary="Download your licensed applications"
                      />
                      <ArrowForward />
                    </ListItem>
                    <Divider />
                    <ListItem button onClick={() => navigate('/dashboard/support')}>
                      <ListItemIcon>
                        <Security />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Support" 
                        secondary="Get help with your standalone license"
                      />
                      <ArrowForward />
                    </ListItem>
                  </>
                ) : (
                  // Subscription user actions
                  <>
                    <ListItem button onClick={() => navigate('/dashboard/cloud-projects')}>
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
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Projects or Standalone Info */}
        <Grid item xs={12} md={6}>
          {currentUser.userType === 'STANDALONE' || currentUser.user_type === 'STANDALONE' || currentUser.role === 'STANDALONE' ? (
            // Standalone user info card
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Standalone License Info
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CardMembership />
                    </ListItemIcon>
                    <ListItemText 
                      primary="License Type" 
                      secondary={metrics.currentPlan}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Status" 
                      secondary="Active"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Download />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Downloads Available" 
                      secondary="Call Sheet Pro, EDL Converter Pro"
                    />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/dashboard/downloads')}
                  >
                    View Downloads
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : projects && projects.length > 0 ? (
            // Subscription user projects
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Projects
                </Typography>
                <List>
                  {projects.slice(0, 5).map((project, index) => (
                    <React.Fragment key={project.id}>
                      <ListItem button onClick={() => navigate('/dashboard/cloud-projects')}>
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
                      onClick={() => navigate('/dashboard/cloud-projects')}
                    >
                      View All Projects ({projects.length})
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
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
                  onClick={() => navigate('/dashboard/cloud-projects')}
                >
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

    </Box>
  );
};

export default DashboardOverview;
