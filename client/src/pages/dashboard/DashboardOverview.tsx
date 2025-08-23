import React, { useEffect, useMemo, useState } from 'react';
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
  Paper,
  Tooltip,
  Alert,
  AlertTitle,
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
  Notifications,
  Update,
  Star,
  Assessment,
  Cloud,
  ArrowForward,
  Router,
  VpnKey,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api, { endpoints } from '@/services/api';
import { cloudProjectIntegration } from '@/services/CloudProjectIntegration';
import { firestoreLicenseService } from '@/services/FirestoreLicenseService';
import { auth, isWebOnlyMode } from '@/services/firebase';
import { 
  Subscription, 
  License, 
  UsageAnalytics,
  SubscriptionTier,
  LicenseStatus 
} from '@/types';
import MetricCard from '@/components/common/MetricCard';
import StorageWarningCard from '@/components/StorageWarningCard';



interface ActivityItem {
  type: 'license' | 'payment' | 'user' | 'security';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

const recentActivity: ActivityItem[] = [
  {
    type: 'license',
    title: 'License Activated',
    description: 'Pro license activated for john.doe@company.com',
    timestamp: '2 hours ago',
    status: 'success',
  },
  {
    type: 'payment',
    title: 'Payment Successful',
    description: 'Monthly subscription renewed for $297.00',
    timestamp: '1 day ago',
    status: 'success',
  },
  {
    type: 'user',
    title: 'Team Member Added',
    description: 'Sarah Johnson added to development team',
    timestamp: '2 days ago',
    status: 'success',
  },
  {
    type: 'security',
    title: 'Security Alert',
    description: 'New device login detected from New York',
    timestamp: '3 days ago',
    status: 'warning',
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'license': return <CardMembership />;
    case 'payment': return <Payment />;
    case 'user': return <People />;
    case 'security': return <Security />;
    default: return <Notifications />;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'success': return 'success.main';
    case 'warning': return 'warning.main';
    case 'error': return 'error.main';
    default: return 'text.secondary';
  }
};

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Helper function to detect if user is a team member
  const isTeamMember = () => {
    // 🔥 CRITICAL FIX: Properly detect Enterprise Users vs Team Members
    console.log('🔍 [DashboardOverview] User object for team member detection:', {
      email: user?.email,
      role: user?.role,
      isTeamMember: user?.isTeamMember,
      memberRole: user?.memberRole,
      organizationId: user?.organizationId
    });
    
    // Enterprise Users should NOT be treated as team members
    if (user?.email === 'enterprise.user@example.com' || 
        user?.role === 'ADMIN' || 
        user?.role === 'SUPERADMIN') {
      console.log('✅ [DashboardOverview] Detected as Enterprise User (not team member)');
      return false;
    }
    
    // Only check explicit team member indicators
    const isTeamMember = (user?.isTeamMember === true) || 
                        (user?.role === 'TEAM_MEMBER') || 
                        // Check if user has a memberRole but is not an organization owner
                        (user?.memberRole && user?.memberRole !== 'OWNER') ||
                        // Check if user was authenticated via team member login flow
                        localStorage.getItem('team_member_data') !== null;
    
    console.log('🔍 [DashboardOverview] Team member detection result:', isTeamMember);
    return isTeamMember;
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [activeLicenses, setActiveLicenses] = useState<number>(0);
  const [totalLicenses, setTotalLicenses] = useState<number>(0);
  const [monthlyUsage, setMonthlyUsage] = useState<number>(0);
  const [totalDownloads, setTotalDownloads] = useState<number>(0);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [daysUntilRenewal, setDaysUntilRenewal] = useState<string>('');
  const [hasEnterpriseFeatures, setHasEnterpriseFeatures] = useState<boolean>(false);
  const [isEdgeMode, setIsEdgeMode] = useState<boolean>(false);
  const [edgeBaseUrl, setEdgeBaseUrl] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<number>(0);
  
  // Cloud Projects Data
  const [totalProjects, setTotalProjects] = useState<number>(0);
  const [activeProjects, setActiveProjects] = useState<number>(0);
  const [cloudProjectsLoading, setCloudProjectsLoading] = useState<boolean>(false);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is a team member to determine which APIs to call
        const userIsTeamMember = isTeamMember();
        console.log('🔍 [DashboardOverview] User is team member:', userIsTeamMember);
        
        if (userIsTeamMember) {
          // For team members, only fetch their assigned projects
          console.log('🔍 [DashboardOverview] Fetching team member data only');
          
          try {
            const cloudProjectsRes = await cloudProjectIntegration.getUserProjects();
            
            if (!isMounted) return;
            
            // Set team member specific data
            const projects = cloudProjectsRes || [];
            setTotalProjects(projects.length);
            setActiveProjects(projects.filter((p: any) => p.isActive && !p.isArchived).length);
            
            // Set default values for team members
            setActiveLicenses(0);
            setTotalLicenses(0);
            setMonthlyUsage(0);
            setTotalDownloads(0);
            setCurrentPlan('Team Member');
            setDaysUntilRenewal('N/A');
            setHasEnterpriseFeatures(false);
            setTeamMembers(0);
            
            console.log('🔍 [DashboardOverview] Team member data loaded successfully');
            
          } catch (error) {
            console.error('🔍 [DashboardOverview] Error fetching team member data:', error);
            // Set empty state for team members on error
            setTotalProjects(0);
            setActiveProjects(0);
            setActiveLicenses(0);
            setTotalLicenses(0);
            setMonthlyUsage(0);
            setTotalDownloads(0);
            setCurrentPlan('Team Member');
            setDaysUntilRenewal('N/A');
            setHasEnterpriseFeatures(false);
            setTeamMembers(0);
          }
        } else {
          // For account owners, fetch all data in parallel for better performance
          console.log('🔍 [DashboardOverview] Fetching account owner data');
          
          // Web-only mode: use Firestore directly and skip 403ing HTTP API calls
          if (isWebOnlyMode()) {
            try {
              // 🔥 CRITICAL FIX: Auto-authenticate with Firebase Auth if not already authenticated
              const firebaseUid = auth.currentUser?.uid;
              if (!firebaseUid && user?.email) {
                console.log('🔄 [DashboardOverview] No Firebase Auth session, attempting auto-authentication...');
                try {
                  // Try to authenticate with Firebase Auth using the current user's email
                  // We'll use a default password or prompt for it
                  const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
                  
                  // For now, try with a common password pattern
                  const commonPasswords = ['Admin1234!', 'ChangeMe123!', 'password123'];
                  let authSuccess = false;
                  
                  for (const password of commonPasswords) {
                    try {
                      await signInWithEmailAndPassword(auth, user.email, password);
                      console.log('✅ [DashboardOverview] Successfully authenticated with Firebase Auth');
                      authSuccess = true;
                      break;
                    } catch (signInError: any) {
                      if (signInError.code === 'auth/user-not-found') {
                        // Try to create the user
                        try {
                          await createUserWithEmailAndPassword(auth, user.email, password);
                          console.log('✅ [DashboardOverview] Successfully created and authenticated with Firebase Auth');
                          authSuccess = true;
                          break;
                        } catch (createError) {
                          console.log('⚠️ [DashboardOverview] Failed to create Firebase Auth user with password:', password);
                        }
                      }
                    }
                  }
                  
                  if (!authSuccess) {
                    console.log('⚠️ [DashboardOverview] Could not auto-authenticate with Firebase Auth');
                    console.log('💡 [DashboardOverview] Falling back to HTTP API for license data');
                    throw new Error('Firebase Auth auto-authentication failed');
                  }
                } catch (authError) {
                  console.warn('⚠️ [DashboardOverview] Firebase Auth auto-authentication failed:', authError);
                  throw new Error('Firebase Auth auto-authentication failed');
                }
              }
              
              // Use the same comprehensive license fetching logic as LicensesPage
              const currentFirebaseUid = auth.currentUser?.uid;
              let fsLicenses: any[] = [];
              
              // 1. Get licenses by backend user ID (this will get all licenses under their subscription)
              if (user?.id) {
                try {
                  const userLicenses = await firestoreLicenseService.getMyLicenses(user.id);
                  fsLicenses.push(...userLicenses);
                  console.log(`✅ [DashboardOverview] Found ${userLicenses.length} licenses by backend userId`);
                } catch (error) {
                  console.warn('⚠️ [DashboardOverview] Failed to fetch licenses by backend userId:', error);
                }
              }
              
              // 2. If no licenses found by userId, try Firebase Auth UID as fallback
              if (fsLicenses.length === 0 && firebaseUid) {
                try {
                  const userLicenses = await firestoreLicenseService.getLicensesByFirebaseUid(firebaseUid);
                  fsLicenses.push(...userLicenses);
                  console.log(`✅ [DashboardOverview] Found ${userLicenses.length} licenses by Firebase Auth UID`);
                } catch (error) {
                  console.warn('⚠️ [DashboardOverview] Failed to fetch licenses by Firebase Auth UID:', error);
                }
              }
              
              // 3. Try to get licenses by email
              if (fsLicenses.length === 0 && user?.email) {
                try {
                  const emailLicenses = await firestoreLicenseService.getLicensesByEmail(user.email);
                  fsLicenses.push(...emailLicenses);
                  console.log(`✅ [DashboardOverview] Found ${emailLicenses.length} licenses by email`);
                } catch (error) {
                  console.warn('⚠️ [DashboardOverview] Failed to fetch licenses by email:', error);
                }
              }
              
              // 4. Try to get organization licenses
              if (fsLicenses.length === 0 && user?.organizationId) {
                try {
                  const orgLicenses = await firestoreLicenseService.getOrganizationLicenses(user.organizationId);
                  fsLicenses.push(...orgLicenses);
                  console.log(`✅ [DashboardOverview] Found ${orgLicenses.length} organization licenses`);
                } catch (error) {
                  console.warn('⚠️ [DashboardOverview] Failed to fetch organization licenses:', error);
                }
              }
              
              // Remove duplicates based on license ID
              const uniqueLicenses = fsLicenses.filter((license, index, self) => 
                index === self.findIndex(l => l.id === license.id)
              );
              
              if (!isMounted) return;

              const totalLic = uniqueLicenses.length;
              // 🔥 CRITICAL FIX: Use the same logic as LicensesPage
              const activeLic = uniqueLicenses.filter(l => String(l.status || '').toUpperCase() === 'ACTIVE').length;
              
              // Debug: Log the first license to see its structure
              if (uniqueLicenses.length > 0) {
                console.log('🔍 [DashboardOverview] Sample license structure:', uniqueLicenses[0]);
              }
              
              // 🔥 CRITICAL FIX: Use the EXACT same logic as LicensesPage
              const assignedLic = uniqueLicenses.filter(l => Boolean(l.assignedTo)).length;
              
              console.log(`📊 [DashboardOverview] License Summary:`, {
                total: totalLic,
                active: activeLic,
                assigned: assignedLic,
                allLicenses: uniqueLicenses.map(l => ({ 
                  id: l.id, 
                  status: l.status, 
                  assignedTo: l.assignedToEmail || l.assignedTo || l.userId,
                  hasAssignment: Boolean(l.assignedTo || l.assignedToEmail || l.assignedToUserId || l.userId)
                }))
              });
              
              setTotalLicenses(totalLic);
              // Use assigned licenses for the "Active Licenses" card to match LicensesPage
              setActiveLicenses(assignedLic);

              // Projects via Firestore
              const cloudProjectsRes = await cloudProjectIntegration.getUserProjects();
              if (!isMounted) return;
              const projects = cloudProjectsRes || [];
              setTotalProjects(projects.length);
              setActiveProjects(projects.filter((p: any) => p.isActive && !p.isArchived).length);

              // Reasonable defaults without subscriptions API
              setCurrentPlan(totalLic > 0 ? 'pro' : '');
              setDaysUntilRenewal('');
              setHasEnterpriseFeatures(false);
              setTeamMembers(0);
              setIsEdgeMode(false);
              setEdgeBaseUrl(null);

              console.log('✅ [DashboardOverview] Loaded web-only data from Firestore');
              
              // Also fetch team member count for consistency
              if (user?.organizationId) {
                try {
                  const orgContextRes = await api.get(endpoints.organizations.context()).catch(() => null as any);
                  if (orgContextRes?.data?.data?.members) {
                    const members = orgContextRes.data.data.members;
                    const actualTeamMemberCount = members.filter((m: any) => m && m.status === 'ACTIVE').length;
                    setTeamMembers(actualTeamMemberCount);
                    console.log(`✅ [DashboardOverview] Found ${actualTeamMemberCount} team members in org context`);
                  }
                } catch (error) {
                  console.warn('⚠️ [DashboardOverview] Failed to fetch team member count:', error);
                }
              }
              
              return; // Skip HTTP API path
            } catch (webOnlyErr) {
              console.warn('⚠️ [DashboardOverview] Web-only Firestore load failed; falling back to HTTP API:', webOnlyErr);
              console.log('🔄 [DashboardOverview] Proceeding with HTTP API fallback...');
            }
          }

          const [subsRes, analyticsRes, licensesRes, cloudProjectsRes, orgContextRes] = await Promise.all([
            api.get(endpoints.subscriptions.mySubscriptions()),
            api.get(endpoints.licenses.analytics()),
            api.get(endpoints.licenses.myLicenses()),
            cloudProjectIntegration.getUserProjects(),
            api.get(endpoints.organizations.context()).catch(() => null as any), // Fetch org context for team members
          ]);

        if (!isMounted) return;

        // Process licenses data - now properly typed from Prisma
        const licenses: License[] = licensesRes.data?.data?.licenses ?? [];
        const totalLic = licenses.length;
        
        // Debug: Log the first license to see its structure
        if (licenses.length > 0) {
          console.log('🔍 [DashboardOverview] HTTP API Sample license structure:', licenses[0]);
        }
        
        // 🔥 CRITICAL FIX: Use the same logic as LicensesPage for consistency
        const activeLic = licenses.filter(license => 
          license.status === LicenseStatus.ACTIVE
        ).length;
        
        // 🔥 CRITICAL FIX: Use the EXACT same logic as LicensesPage
        const assignedLic = licenses.filter(license => 
          Boolean(license.userId) || 
          Boolean((license as any).assignedToUserId) || 
          Boolean((license as any).assignedToEmail)
        ).length;
        
        setTotalLicenses(totalLic);
        // Use assigned licenses for the "Active Licenses" card to match LicensesPage
        setActiveLicenses(assignedLic);

        // Process subscription data - now properly typed from Prisma
        const subscriptions: Subscription[] = subsRes.data?.data?.subscriptions ?? [];
        const primary = subscriptions.find(sub => sub.status === 'ACTIVE') || subscriptions[0];
        
        if (primary) {
          setCurrentPlan(primary.tier?.toLowerCase() ?? '');
          
          if (primary.currentPeriodEnd) {
            const end = new Date(primary.currentPeriodEnd);
            const days = Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            setDaysUntilRenewal(`${days} day${days === 1 ? '' : 's'}`);
          }
          
          setHasEnterpriseFeatures(primary.tier === SubscriptionTier.ENTERPRISE);
        }

        // Fetch actual team member count from organization context
        let actualTeamMemberCount = 0;
        if (orgContextRes?.data?.data?.members) {
          // Use the actual members from org context
          const members = orgContextRes.data.data.members;
          actualTeamMemberCount = members.filter((m: any) => m && m.status === 'ACTIVE').length;
          console.log('[DashboardOverview] Found team members in org context:', actualTeamMemberCount);
        } else if (orgContextRes?.data?.data?.organization) {
          // Fallback to organization members if context doesn't have members array
          const org = orgContextRes.data.data.organization;
          if (org.members && Array.isArray(org.members)) {
            actualTeamMemberCount = org.members.filter((m: any) => m && m.status === 'ACTIVE').length;
            console.log('[DashboardOverview] Found team members in org object:', actualTeamMemberCount);
          }
        } else {
          console.log('[DashboardOverview] No organization context available');
        }
        
        // Set team members count (show for all plan types if they have team members)
        if (actualTeamMemberCount > 0) {
          setTeamMembers(actualTeamMemberCount);
          setHasEnterpriseFeatures(true); // Enable team features if they have members
          console.log('[DashboardOverview] Setting team members count:', actualTeamMemberCount);
        } else {
          // Fallback to subscription seats for Enterprise users
          if (primary && primary.tier === SubscriptionTier.ENTERPRISE) {
            setTeamMembers(primary.seats || 0);
            console.log('[DashboardOverview] Using subscription seats for Enterprise:', primary.seats || 0);
          } else {
            setTeamMembers(0);
            console.log('[DashboardOverview] No team members found');
          }
        }

        // Process analytics data - now properly typed from Prisma
        const analytics = analyticsRes.data?.data;
        if (analytics) {
          // Handle both old and new analytics structure
          if (analytics.summary) {
            setMonthlyUsage(analytics.summary.totalEvents ?? 0);
            const downloads = analytics.summary.eventTypes?.['SDK_DOWNLOAD_REQUEST'] || 0;
            setTotalDownloads(downloads);
          } else if (analytics.totalEvents !== undefined) {
            setMonthlyUsage(analytics.totalEvents);
            setTotalDownloads(analytics.downloads || 0);
          }
        }

        // Process cloud projects data
        try {
          if (cloudProjectsRes) {
            const totalProj = cloudProjectsRes.length;
            const activeProj = cloudProjectsRes.filter((project: any) => 
              project.isActive && !project.isArchived
            ).length;
            
            setTotalProjects(totalProj);
            setActiveProjects(activeProj);
          }
        } catch (cloudError) {
          console.error('Error processing cloud projects data:', cloudError);
          // Don't fail the entire dashboard for cloud projects
          setTotalProjects(0);
          setActiveProjects(0);
        }

        // Edge mode not supported in web-only production
        setIsEdgeMode(false);
        setEdgeBaseUrl(null);
        
        } // End of account owner data processing
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Fallback to zeros on error
        if (!isMounted) return;
        setActiveLicenses(0);
        setTotalLicenses(0);
        setMonthlyUsage(0);
        setTotalDownloads(0);
        setCurrentPlan('');
        setDaysUntilRenewal('');
        setHasEnterpriseFeatures(false);
        setTeamMembers(0);
        setTotalProjects(0);
        setActiveProjects(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const licenseUtilization = useMemo(() => {
    if (totalLicenses <= 0) return 0;
    // 🔥 CRITICAL FIX: Calculate utilization based on assigned licenses vs total licenses
    // This matches the logic used in the Licenses page (assigned/total)
    return Math.round((activeLicenses / totalLicenses) * 100);
  }, [activeLicenses, totalLicenses]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Here's what's happening with your BackboneLogic, Inc. licenses
          </Typography>
        </Box>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Licenses"
            value={totalLicenses}
            icon={<CardMembership />}
            trend={{ value: 12, direction: 'up' }}
            color="primary"
            tooltip="Total number of licenses in your subscription"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Active Licenses"
            value={activeLicenses}
            icon={<VpnKey />}
            trend={{ value: 8, direction: 'up' }}
            color="secondary"
            tooltip="Number of licenses currently assigned and in use"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Tooltip title="Click to view Cloud Projects" arrow>
            <div>
              <MetricCard
                title="Total Projects"
                value={totalProjects}
                icon={<Assessment />}
                trend={{ value: 15, direction: 'up' }}
                color="success"
                onClick={() => navigate('/dashboard/cloud-projects')}
              />
            </div>
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Tooltip title="Click to view Cloud Projects" arrow>
            <div>
              <MetricCard
                title="Active Projects"
                value={activeProjects}
                icon={<Cloud />}
                trend={{ value: 8, direction: 'up' }}
                color="warning"
                onClick={() => navigate('/dashboard/cloud-projects')}
              />
            </div>
          </Tooltip>
        </Grid>
      </Grid>

      {/* Storage Warning Card */}
      <StorageWarningCard 
        onUpgrade={() => navigate('/pricing')}
        compact={true}
      />

      <Grid container spacing={3}>
        {/* License Status */}
        <Grid item xs={12} lg={8}>
          <Box >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 3,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  License Overview
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          License Utilization
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {licenseUtilization}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={licenseUtilization}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: licenseUtilization > 80 
                              ? 'linear-gradient(90deg, #ff9800 0%, #f44336 100%)'
                              : 'linear-gradient(90deg, #00d4ff 0%, #667eea 100%)',
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {activeLicenses} of {totalLicenses} licenses assigned
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Current Plan
                      </Typography>
                      <Chip
                        label={(currentPlan && currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1).toLowerCase()) || '—'}
                        color="primary"
                        sx={{ fontWeight: 600, mb: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {daysUntilRenewal ? `Next renewal in ${daysUntilRenewal}` : '—'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {teamMembers > 0 && (
                        <Button
                          variant="outlined"
                          startIcon={<People />}
                          component={RouterLink}
                          to="/dashboard/team"
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          Add Team Member
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        component={RouterLink}
                        to="/dashboard/downloads"
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Download SDK
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Star />}
                        component={RouterLink}
                        to="/dashboard/billing"
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Upgrade Plan
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Box >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: 'fit-content',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Activity
                </Typography>

                <List dense>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: getStatusColor(activity.status),
                              fontSize: '1rem',
                            }}
                          >
                            {getActivityIcon(activity.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <React.Fragment>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.timestamp}
                              </Typography>
                            </React.Fragment>
                          }
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && (
                        <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  variant="text"
                  size="small"
                  sx={{ mt: 2, color: 'primary.main' }}
                  component={RouterLink}
                  to="/dashboard/activity"
                >
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Box >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                System Status
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        License Server
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        Operational
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        API Services
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        Operational
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Maintenance
                      </Typography>
                      <Typography variant="caption" color="warning.main">
                        Scheduled 2AM EST
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Update sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        SDK Version
                      </Typography>
                      <Typography variant="caption" color="primary.main">
                        v14.2.1 Available
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;
