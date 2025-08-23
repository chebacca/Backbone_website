import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  ChipProps,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert,
  ContentCopy,
  Edit,
  Delete,
  Pause,
  PlayArrow,
  Download,
  Share,
  Security,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Add,
  FilterList,
  Search,
  VpnKey,
  CardMembership,
  Schedule,
  Key,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import MetricCard from '@/components/common/MetricCard';
import { firestoreLicenseService } from '@/services/FirestoreLicenseService';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface License {
  id: string;
  key: string;
  name: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  assignedTo?: {
    name: string;
    email: string;
    avatar?: string;
  };
  activatedAt?: string;
  expiresAt: string;
  lastUsed?: string;
  deviceCount: number;
  maxDevices: number;
  usage: {
    apiCalls: number;
    dataTransfer: number; // GB
  };
}

const mockLicenses: License[] = [
  {
    id: '1',
    key: 'DV14-PRO-2024-XXXX-XXXX-XXXX',
    name: 'Development Team License',
    tier: 'PRO',
    status: 'ACTIVE',
    assignedTo: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      avatar: undefined,
    },
    activatedAt: '2024-01-15T10:30:00Z',
    expiresAt: '2024-12-15T10:30:00Z',
    lastUsed: '2024-01-20T14:22:00Z',
    deviceCount: 3,
    maxDevices: 5,
    usage: {
      apiCalls: 12456,
      dataTransfer: 2.3,
    },
  },
  {
    id: '2',
    key: 'DV14-ENT-2024-YYYY-YYYY-YYYY',
    name: 'Enterprise Main License',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    assignedTo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@enterprise.com',
    },
    activatedAt: '2024-01-01T00:00:00Z',
    expiresAt: '2025-01-01T00:00:00Z',
    lastUsed: '2024-01-20T16:45:00Z',
    deviceCount: 15,
    maxDevices: 50,
    usage: {
      apiCalls: 89234,
      dataTransfer: 15.7,
    },
  },
  {
    id: '3',
    key: 'DV14-BAS-2024-ZZZZ-ZZZZ-ZZZZ',
    name: 'Testing License',
    tier: 'BASIC',
    status: 'SUSPENDED',
    activatedAt: '2024-01-10T08:15:00Z',
    expiresAt: '2024-07-10T08:15:00Z',
    lastUsed: '2024-01-18T11:30:00Z',
    deviceCount: 1,
    maxDevices: 1,
    usage: {
      apiCalls: 1456,
      dataTransfer: 0.5,
    },
  },
];

const getStatusColor = (status: License['status']) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'SUSPENDED': return 'warning';
    case 'EXPIRED': return 'error';
    case 'PENDING': return 'info';
    default: return 'default';
  }
};

const getStatusIcon = (status: License['status']) => {
  switch (status) {
    case 'ACTIVE': return <CheckCircle />;
    case 'SUSPENDED': return <Warning />;
    case 'EXPIRED': return <ErrorIcon />;
    case 'PENDING': return <Warning />;
    default: return <CheckCircle />;
  }
};

type ChipColor = ChipProps['color'];

const getTierColor = (tier: License['tier']): ChipColor => {
  switch (tier) {
    case 'BASIC': return 'default';
    case 'PRO': return 'success';
    case 'ENTERPRISE': return 'secondary';
    default: return 'default';
  }
};

const getTierVariant = (tier: License['tier']): 'filled' | 'outlined' => {
  return tier === 'BASIC' ? 'outlined' : 'filled';
};

const LicensesPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, getTempCredentials } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Default to hiding unassigned licenses
  const [showUnassigned, setShowUnassigned] = useState(false);

  // Helper function to check if we're in web-only mode
  // Licensing website is ALWAYS in web-only mode
  const isWebOnlyMode = () => {
    return true;
  };

  // Load licenses: SUPERADMIN sees all via admin endpoint; others see their own
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const roleUpper = String(user?.role || '').toUpperCase();
        const isSuperAdmin = roleUpper === 'SUPERADMIN';

        let list: any[] = [];
        
        // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
        if (isWebOnlyMode()) {
          console.log('🔍 [LicensesPage] WebOnly mode - fetching licenses from Firestore');
          
          // Check Firebase Auth status first
          const isFirebaseAuth = await firestoreLicenseService.isFirebaseAuthAuthenticated();
          const firebaseUser = await firestoreLicenseService.getCurrentFirebaseUser();
          
          console.log(`🔍 [LicensesPage] Firebase Auth status: ${isFirebaseAuth ? 'Authenticated' : 'Not authenticated'}`);
          if (firebaseUser) {
            console.log(`🔍 [LicensesPage] Firebase Auth user: ${firebaseUser.uid} (${firebaseUser.email})`);
          }
          
          // Get temporary credentials for Firebase Auth
          const tempCredentials = getTempCredentials();
          
          // If not authenticated with Firebase Auth, try to create/sign in user
          if (!isFirebaseAuth && user?.email) {
            console.log('🔄 [LicensesPage] Not authenticated with Firebase Auth, attempting to create/sign in user...');
            try {
              // Try to create a Firebase Auth user with a temporary password
              const tempPassword = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const authSuccess = await firestoreLicenseService.createFirebaseAuthUser(user.email, tempPassword);
              
              if (authSuccess) {
                console.log('✅ [LicensesPage] Successfully authenticated with Firebase Auth');
                // Update temp credentials for subsequent calls
                if (tempCredentials) {
                  tempCredentials.password = tempPassword;
                }
              } else {
                console.warn('⚠️ [LicensesPage] Failed to authenticate with Firebase Auth');
              }
            } catch (authError) {
              console.warn('⚠️ [LicensesPage] Error during Firebase Auth setup:', authError);
            }
          }
          
          if (isSuperAdmin) {
            // Admin can see all licenses
            list = await firestoreLicenseService.getAllLicenses(200, 
              tempCredentials?.email, tempCredentials?.password);
          } else {
            // Regular users - get all licenses that belong to their subscription
            const allLicenses: any[] = [];
            
            // 1. Get licenses by backend user ID (this will get all licenses under their subscription)
            if (user?.id) {
              try {
                const userLicenses = await firestoreLicenseService.getMyLicenses(user.id, 
                  tempCredentials?.email, tempCredentials?.password);
                allLicenses.push(...userLicenses);
                console.log(`✅ [LicensesPage] Found ${userLicenses.length} licenses by backend userId`);
              } catch (error) {
                console.warn('⚠️ [LicensesPage] Failed to fetch licenses by backend userId:', error);
              }
            }
            
            // 2. If no licenses found by userId, try Firebase Auth UID as fallback
            if (allLicenses.length === 0 && firebaseUser?.uid) {
              try {
                const userLicenses = await firestoreLicenseService.getLicensesByFirebaseUid(firebaseUser.uid);
                allLicenses.push(...userLicenses);
                console.log(`✅ [LicensesPage] Found ${userLicenses.length} licenses by Firebase Auth UID`);
              } catch (error) {
                console.warn('⚠️ [LicensesPage] Failed to fetch licenses by Firebase Auth UID:', error);
              }
            }
            
            // 3. Try to get licenses by email
            if (user?.email) {
              try {
                const emailLicenses = await firestoreLicenseService.getLicensesByEmail(user.email);
                allLicenses.push(...emailLicenses);
                console.log(`✅ [LicensesPage] Found ${emailLicenses.length} licenses by email`);
              } catch (error) {
                console.warn('⚠️ [LicensesPage] Failed to fetch licenses by email:', error);
              }
            }
            
            // 4. Try to get organization licenses
            if (user?.organizationId) {
              try {
                const orgLicenses = await firestoreLicenseService.getOrganizationLicenses(
                  user.organizationId, tempCredentials?.email, tempCredentials?.password);
                allLicenses.push(...orgLicenses);
                console.log(`✅ [LicensesPage] Found ${orgLicenses.length} organization licenses`);
              } catch (error) {
                console.warn('⚠️ [LicensesPage] Failed to fetch organization licenses:', error);
              }
            }
            
            // Remove duplicates based on license ID
            const uniqueLicenses = allLicenses.filter((license, index, self) => 
              index === self.findIndex(l => l.id === license.id)
            );
            
            list = uniqueLicenses;
            console.log(`✅ [LicensesPage] Total unique licenses found: ${list.length}`);
            
            // If no licenses found with individual queries, try fallback method
            if (list.length === 0) {
              try {
                console.log('🔄 [LicensesPage] No licenses found with individual queries, trying fallback method...');
                const fallbackLicenses = await firestoreLicenseService.getAllAccessibleLicenses(
                  tempCredentials?.email, tempCredentials?.password);
                list = fallbackLicenses;
                console.log(`✅ [LicensesPage] Fallback method found ${fallbackLicenses.length} licenses`);
              } catch (fallbackError) {
                console.warn('⚠️ [LicensesPage] Fallback method also failed:', fallbackError);
              }
            }
          }
        } else {
          // Use API calls for non-webonly mode
          if (isSuperAdmin) {
            try {
              const response = await api.get(`${endpoints.admin.licenses()}?limit=200`);
              list = response.data?.data?.licenses ?? [];
            } catch (e) {
              const my = await api.get(endpoints.licenses.myLicenses());
              list = my.data?.data?.licenses ?? [];
            }
          } else {
            const my = await api.get(endpoints.licenses.myLicenses());
            list = my.data?.data?.licenses ?? [];
          }
        }

        const mapped: License[] = await Promise.all(list.map(async (l: any, idx: number) => {
          // Get user info for license assignment (in Firestore mode)
          let assignedUser = null;
          if (isWebOnlyMode() && (l.assignedToUserId || l.userId)) {
            const userId = l.assignedToUserId || l.userId;
            
            // Try to get user info by backend user ID (fallback)
            if (userId) {
              assignedUser = await firestoreLicenseService.getUserInfo(userId);
            }
          }
          
          // Only consider a license assigned if it has assignedToEmail or assignedToUserId
          const isAssigned = Boolean(l.assignedToEmail || l.assignedToUserId);
          
          // Try to get team member info from teamMembers collection if no user info found
          let teamMemberName = '';
          if (isAssigned && (!assignedUser?.name || assignedUser?.name === 'Unknown User') && l.assignedToEmail) {
            try {
              // Get team member from teamMembers collection by email
              const { db } = await import('../../services/firebase');
              const teamMembersQuery = query(
                collection(db, 'teamMembers'),
                where('email', '==', l.assignedToEmail),
                limit(1)
              );
              const teamMembersSnapshot = await getDocs(teamMembersQuery);
              if (!teamMembersSnapshot.empty) {
                const teamMemberData = teamMembersSnapshot.docs[0].data();
                if (teamMemberData.name) {
                  teamMemberName = teamMemberData.name;
                } else if (teamMemberData.firstName || teamMemberData.lastName) {
                  teamMemberName = `${teamMemberData.firstName || ''} ${teamMemberData.lastName || ''}`.trim();
                }
              }
            } catch (error) {
              console.warn('⚠️ [LicensesPage] Failed to fetch team member info:', error);
            }
          }
          
          // Get the best available name for the user
          const userName = teamMemberName || assignedUser?.name || l.user?.name || 'Unknown User';
          
          return {
            id: l.id,
            key: l.key || l.id,
            name: isAssigned && userName !== 'Unknown User' ? 
                  `${userName}'s License` : 
                  `License ${idx + 1}`,
            tier: String(l.tier || l.type || 'BASIC').toUpperCase() as License['tier'],
            status: String(l.status || 'ACTIVE').toUpperCase() as License['status'],
            assignedTo: isAssigned ? { 
              name: userName, 
              email: assignedUser?.email || l.user?.email || l.assignedToEmail || ''
            } : undefined,
            activatedAt: l.activatedAt || l.createdAt || undefined,
            expiresAt: l.expiresAt || l.currentPeriodEnd || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
            lastUsed: l.updatedAt || l.activatedAt || l.createdAt || undefined,
            deviceCount: l.activationCount ?? 0,
            maxDevices: l.maxActivations ?? 5,
            usage: { apiCalls: 0, dataTransfer: 0 },
          };
        }));

        if (!isMounted) return;
        setLicenses(mapped);
      } catch (err: any) {
        if (!isMounted) return;
        enqueueSnackbar(err?.message || 'Failed to load licenses', { variant: 'error' });
        setLicenses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.role, enqueueSnackbar]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, license: License) => {
    setAnchorEl(event.currentTarget);
    setSelectedLicense(license);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLicense(null);
  };

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    enqueueSnackbar('License key copied to clipboard', { variant: 'success' });
    handleMenuClose();
  };

  const handleAssignLicense = async () => {
    if (selectedLicense && assignEmail) {
      try {
        // Check if user already has a license assigned
        const existingLicense = licenses.find(license => 
          license.assignedTo?.email === assignEmail && 
          license.id !== selectedLicense.id
        );

        if (existingLicense) {
          enqueueSnackbar(`User ${assignEmail} already has a license assigned. Please unassign it first.`, { variant: 'error' });
          return;
        }

        // In web-only mode, use Firestore service
        if (isWebOnlyMode() && firestoreLicenseService) {
          await firestoreLicenseService.assignLicense(selectedLicense.id, assignEmail);
        } else {
          // In regular mode, use API
          await api.post(`${endpoints.licenses.assign(selectedLicense.id)}`, { email: assignEmail });
        }

        enqueueSnackbar(`License assigned to ${assignEmail}`, { variant: 'success' });
        setAssignDialogOpen(false);
        setAssignEmail('');
        handleMenuClose();

        // Refresh licenses after assignment
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error: any) {
        enqueueSnackbar(error.message || 'Failed to assign license', { variant: 'error' });
      }
    }
  };

  const handleSuspendLicense = () => {
    if (selectedLicense) {
      enqueueSnackbar('License suspended', { variant: 'warning' });
      handleMenuClose();
    }
  };

  const handleActivateLicense = () => {
    if (selectedLicense) {
      enqueueSnackbar('License activated', { variant: 'success' });
      handleMenuClose();
    }
  };
  
  const handleUnassignLicense = async () => {
    if (selectedLicense && selectedLicense.assignedTo) {
      try {
        // In web-only mode, use Firestore service
        if (isWebOnlyMode() && firestoreLicenseService) {
          await firestoreLicenseService.unassignLicense(selectedLicense.id);
          enqueueSnackbar(`License unassigned from ${selectedLicense.assignedTo.email}`, { variant: 'success' });
          handleMenuClose();
          
          // Refresh licenses after unassignment
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error: any) {
        enqueueSnackbar(error.message || 'Failed to unassign license', { variant: 'error' });
      }
    }
  };

  // Filter licenses based on search term and assignment status
  const filteredLicenses = licenses
    .filter(license => showUnassigned ? true : license.assignedTo) // Show all if toggle is on, otherwise only assigned
    .filter(license =>
      license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (license.assignedTo?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Count licenses with proper metrics - based on current filter state
  const activeLicenses = useMemo(() => licenses.filter(l => l.status === 'ACTIVE').length, [licenses]);
  const assignedLicenses = useMemo(() => licenses.filter(l => Boolean(l.assignedTo)).length, [licenses]);
  const availableLicenses = useMemo(() => licenses.filter(l => l.status === 'ACTIVE' && !l.assignedTo).length, [licenses]);
  const totalLicenses = useMemo(() => showUnassigned ? licenses.length : licenses.filter(l => Boolean(l.assignedTo)).length, [licenses, showUnassigned]);
  
  // Calculate utilization rate based on assigned licenses vs total active licenses
  const utilizationRate = useMemo(() => {
    const activeTotal = licenses.filter(l => l.status === 'ACTIVE').length;
    if (activeTotal <= 0) return 0;
    return Math.round((assignedLicenses / activeTotal) * 100);
  }, [licenses, assignedLicenses]);
  
  // Ensure metrics are updated when filtered licenses change
  useEffect(() => {
    // This effect ensures the UI updates when license assignments change
    console.log(`[LicensesPage] Metrics updated: Total=${totalLicenses}, Assigned=${assignedLicenses}, Available=${availableLicenses}, Active=${activeLicenses}`);
  }, [totalLicenses, assignedLicenses, availableLicenses, activeLicenses]);

  return (
    <Box>
      {/* Header */}
      <Box >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              License Management
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Manage and monitor your BackboneLogic, Inc. licenses
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            Add License
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Assigned Licenses"
            value={assignedLicenses}
            icon={<VpnKey />}
            color="primary"
            tooltip="Number of licenses assigned to team members"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Available Licenses"
            value={availableLicenses}
            icon={<CardMembership />}
            color="success"
            tooltip="Number of active licenses that are not assigned to anyone"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Utilization Rate"
            value={`${utilizationRate}%`}
            icon={<Key />}
            color="secondary"
            tooltip="Percentage of active licenses that are assigned"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={showUnassigned ? "Total Licenses" : "Total Assigned"}
            value={totalLicenses}
            icon={<Schedule />}
            color="warning"
            tooltip={showUnassigned ? "Total number of licenses" : "Total number of assigned licenses"}
          />
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box >
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant={showUnassigned ? "contained" : "outlined"}
              onClick={() => setShowUnassigned(!showUnassigned)}
              size="small"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {showUnassigned ? 'Hide Unassigned' : 'Show Unassigned'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Filters
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Licenses Table */}
      <Box >
        <TableContainer
          component={Paper}
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>License</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tier</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Devices</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow key={license.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {license.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {license.key}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    {license.assignedTo ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {license.assignedTo.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {license.assignedTo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {license.assignedTo.email}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={getStatusIcon(license.status)}
                      label={license.status}
                      color={getStatusColor(license.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={license.tier}
                      color={getTierColor(license.tier)}
                      size="small"
                      variant={getTierVariant(license.tier)}
                    />
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {license.deviceCount}/{license.maxDevices}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(license.deviceCount / license.maxDevices) * 100}
                        sx={{
                          width: 80,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {license.usage.apiCalls.toLocaleString()} calls
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {license.usage.dataTransfer} GB
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {new Date(license.expiresAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, license)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <MenuItem onClick={() => selectedLicense && handleCopyLicense(selectedLicense.key)}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          Copy License Key
        </MenuItem>
        {selectedLicense?.assignedTo ? (
          <MenuItem onClick={handleUnassignLicense}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            Unassign License
          </MenuItem>
        ) : (
          <MenuItem onClick={() => setAssignDialogOpen(true)}>
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            Assign License
          </MenuItem>
        )}
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit License
        </MenuItem>
        {selectedLicense?.status === 'ACTIVE' ? (
          <MenuItem onClick={handleSuspendLicense}>
            <ListItemIcon>
              <Pause fontSize="small" />
            </ListItemIcon>
            Suspend License
          </MenuItem>
        ) : (
          <MenuItem onClick={handleActivateLicense}>
            <ListItemIcon>
              <PlayArrow fontSize="small" />
            </ListItemIcon>
            Activate License
          </MenuItem>
        )}
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          Download Details
        </MenuItem>
      </Menu>

      {/* Assign License Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>Assign License</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignLicense}
            variant="contained"
            disabled={!assignEmail}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LicensesPage;
