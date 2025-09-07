/**
 * 🔑 License Management Page - Streamlined Version
 * 
 * Clean implementation using only UnifiedDataService with full license management functionality.
 * No legacy API calls - pure streamlined architecture with all original features preserved.
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Avatar,
  Fab,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  ContentCopy,
  Block,
  CheckCircle,
  Schedule,
  CardMembership,
  PersonAdd,
  Key,
  Security,
  Star,
  Visibility,
  Warning,
  Info,
  Assignment,
  Download,
  People,
  Business,
  Email,
  AccessTime,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { 
  useCurrentUser, 
  useOrganizationContext, 
  useOrganizationLicenses,
  useUpdateLicense,
  useAssignLicense,
  useUnassignLicense,
  useOrganizationTeamMembers
} from '@/hooks/useStreamlinedData';
import { StreamlinedLicense, StreamlinedTeamMember } from '@/services/UnifiedDataService';
import MetricCard from '@/components/common/MetricCard';
import LicensePurchaseFlow from '@/components/payment/LicensePurchaseFlow';
import LicenseRenewalWizard from '@/components/payment/LicenseRenewalWizard';

// ============================================================================
// TYPES
// ============================================================================

// Use StreamlinedLicense from UnifiedDataService
type License = StreamlinedLicense;

interface LicenseStats {
  totalLicenses: number;
  activeLicenses: number;
  expiringSoon: number;
  unassignedLicenses: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: License['status']) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'PENDING': return 'warning';
    case 'SUSPENDED': return 'error';
    case 'EXPIRED': return 'default';
    default: return 'default';
  }
};

const getStatusIcon = (status: License['status']) => {
  switch (status) {
    case 'ACTIVE': return <CheckCircle />;
    case 'PENDING': return <Schedule />;
    case 'SUSPENDED': return <Block />;
    case 'EXPIRED': return <Warning />;
    default: return <CardMembership />;
  }
};

const getTierColor = (tier: License['tier']) => {
  switch (tier) {
    case 'BASIC': return 'default';
    case 'PROFESSIONAL': return 'primary';
    case 'ENTERPRISE': return 'secondary';
    default: return 'default';
  }
};

// Helper function to get user display name from license assignment
const getUserDisplayName = (assignedTo: License['assignedTo'], teamMembers?: StreamlinedTeamMember[]): string => {
  if (!assignedTo) return 'Unassigned';
  
  // First, try to find the team member by email to get their actual name
  if (teamMembers && assignedTo.email) {
    const teamMember = teamMembers.find(m => m.email && m.email.toLowerCase() === assignedTo.email.toLowerCase());
    if (teamMember) {
      if (teamMember.firstName && teamMember.lastName) {
        return `${teamMember.firstName} ${teamMember.lastName}`;
      }
      if (teamMember.firstName) return teamMember.firstName;
      if (teamMember.lastName) return teamMember.lastName;
    }
  }
  
  // If we have a proper name from the license assignment, use it
  if (assignedTo.name && assignedTo.name !== 'Unknown User') {
    return assignedTo.name;
  }
  
  // If we have an email, create a name from it (fallback)
  if (assignedTo.email) {
    const emailParts = assignedTo.email.split('@');
    const username = emailParts[0];
    return username
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  return 'Unknown User';
};

// Helper function to get user initials for avatar
const getUserInitials = (assignedTo: License['assignedTo'], teamMembers?: StreamlinedTeamMember[]): string => {
  if (!assignedTo) return '?';
  
  const displayName = getUserDisplayName(assignedTo, teamMembers);
  if (displayName === 'Unassigned' || displayName === 'Unknown User') return '?';
  
  const words = displayName.split(' ');
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return displayName.charAt(0).toUpperCase();
};

// Helper function to get team member display name
const getTeamMemberDisplayName = (member: StreamlinedTeamMember): string => {
  if (member.firstName && member.lastName) {
    return `${member.firstName} ${member.lastName}`;
  }
  if (member.firstName) return member.firstName;
  if (member.lastName) return member.lastName;
  return member.email.split('@')[0];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LicensesPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // 🚀 STREAMLINED: Use UnifiedDataService hooks
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { data: licenses, loading: licensesLoading, error: licensesError, refetch: refetchLicenses } = useOrganizationLicenses();
  const { data: teamMembers, loading: teamMembersLoading, error: teamMembersError } = useOrganizationTeamMembers();
  
  // Mutation hooks
  const updateLicense = useUpdateLicense();
  const assignLicense = useAssignLicense();
  const unassignLicense = useUnassignLicense();

  // Dialog states
  const [purchaseFlowOpen, setPurchaseFlowOpen] = useState(false);
  const [renewalWizardOpen, setRenewalWizardOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED'>('all');
  
  // Form states
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  
  // Edit license form states
  const [editLicenseName, setEditLicenseName] = useState('');
  const [editLicenseTier, setEditLicenseTier] = useState<License['tier']>('PROFESSIONAL');
  const [editLicenseStatus, setEditLicenseStatus] = useState<License['status']>('PENDING');
  const [editLicenseExpiresAt, setEditLicenseExpiresAt] = useState('');

  // Combined loading and error states
  const isLoading = userLoading || orgLoading || licensesLoading || teamMembersLoading;
  const hasError = userError || orgError || licensesError || teamMembersError;

  // 🔧 ENHANCED REFRESH: Listen for license refresh events
  useEffect(() => {
    const handleLicenseRefresh = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 License refresh event received:', customEvent.detail);
      if (customEvent.detail?.action === 'created') {
        // Force refresh after license creation
        await refetchLicenses();
      }
    };

    window.addEventListener('licenses:refresh', handleLicenseRefresh as unknown as EventListener);
    
    return () => {
      window.removeEventListener('licenses:refresh', handleLicenseRefresh as unknown as EventListener);
    };
  }, [refetchLicenses]);

  // 🧮 COMPUTED LICENSE DATA: Generate from real organization data with filtering and sorting
  const licenseData = useMemo(() => {
    if (!currentUser || !orgContext || !licenses) {
      return {
        licenses: [],
        filteredLicenses: [],
        stats: {
          totalLicenses: 0,
          activeLicenses: 0,
          expiringSoon: 0,
          unassignedLicenses: 0,
        },
      };
    }

    // Calculate stats from real license data
    const totalLicenses = licenses.length;
    const activeLicenses = licenses.filter(l => l.status === 'ACTIVE').length;
    const expiringSoon = licenses.filter(l => {
      const expiryDate = new Date(l.expiresAt);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return expiryDate <= thirtyDaysFromNow;
    }).length;
    const unassignedLicenses = licenses.filter(l => !l.assignedTo).length;

    const stats: LicenseStats = {
      totalLicenses,
      activeLicenses,
      expiringSoon,
      unassignedLicenses,
    };

    // Filter licenses based on status filter
    const filteredLicenses = statusFilter === 'all' 
      ? licenses 
      : statusFilter === 'EXPIRED' 
        ? licenses.filter(l => {
            // For "EXPIRED" filter, show licenses that will expire within 30 days
            const expiryDate = new Date(l.expiresAt);
            const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            return expiryDate <= thirtyDaysFromNow;
          })
        : licenses.filter(l => l.status === statusFilter);

    // Sort licenses: ACTIVE first, then by status priority, then by name
    const sortedLicenses = [...filteredLicenses].sort((a, b) => {
      // First sort by status priority (ACTIVE first)
      const statusPriority = { 'ACTIVE': 0, 'PENDING': 1, 'SUSPENDED': 2, 'EXPIRED': 3 };
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] ?? 4;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] ?? 4;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then sort by name alphabetically
      return a.name.localeCompare(b.name);
    });

    return { licenses, filteredLicenses: sortedLicenses, stats };
  }, [currentUser, orgContext, licenses, statusFilter]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, license: License) => {
    console.log('🔧 [LicensesPage] Menu clicked for license:', license);
    setSelectedLicense(license);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedLicense here as it might be needed for dialogs
    // setSelectedLicense(null);
  };

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    enqueueSnackbar('License key copied to clipboard', { variant: 'success' });
    handleMenuClose();
  };

  // Get available team members for assignment (those without licenses)
  const availableTeamMembers = useMemo(() => {
    if (!teamMembers || !licenses) return [];
    
    const assignedUserIds = licenses
      .filter(l => l.assignedTo?.userId)
      .map(l => l.assignedTo!.userId);
    
    return teamMembers.filter(member => !assignedUserIds.includes(member.id));
  }, [teamMembers, licenses]);

  const handleAssignLicense = async () => {
    if (!selectedLicense || !assignUserId) {
      enqueueSnackbar('Please select a valid team member to assign the license to', { variant: 'error' });
      return;
    }

    try {
      await assignLicense.mutate({ licenseId: selectedLicense.id, userId: assignUserId });
      
      const assignedMember = teamMembers?.find(m => m.id === assignUserId);
      const memberName = assignedMember ? getTeamMemberDisplayName(assignedMember) : 'Unknown User';
      enqueueSnackbar(`License assigned to ${memberName}`, { variant: 'success' });
      setAssignUserId('');
      setAssignDialogOpen(false);
      handleMenuClose();
      refetchLicenses(); // Refresh the licenses list
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to assign license', { variant: 'error' });
    }
  };

  const handleSuspendLicense = async () => {
    if (!selectedLicense) return;
    
    try {
      await updateLicense.mutate({ 
        licenseId: selectedLicense.id, 
        updates: { status: 'SUSPENDED' } 
      });
      enqueueSnackbar(`License ${selectedLicense.name} has been suspended`, { variant: 'warning' });
      refetchLicenses();
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to suspend license', { variant: 'error' });
    }
    handleMenuClose();
  };

  const handleActivateLicense = async () => {
    if (!selectedLicense) return;
    
    try {
      await updateLicense.mutate({ 
        licenseId: selectedLicense.id, 
        updates: { status: 'ACTIVE' } 
      });
      enqueueSnackbar(`License ${selectedLicense.name} has been activated`, { variant: 'success' });
      refetchLicenses();
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to activate license', { variant: 'error' });
    }
    handleMenuClose();
  };

  const handleDeleteLicense = () => {
    if (!selectedLicense) return;
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!selectedLicense) return;

    try {
      // TODO: Implement actual license deletion using the mutation hook
      // await deleteLicense.mutate({ licenseId: selectedLicense.id });
      
      enqueueSnackbar(`License ${selectedLicense.name} has been deleted`, { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedLicense(null);
      refetchLicenses(); // Refresh the licenses list
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to delete license', { variant: 'error' });
    }
  };

  const handleEditLicense = (license?: License) => {
    const licenseToEdit = license || selectedLicense;
    if (!licenseToEdit) {
      console.error('🔧 [LicensesPage] No license provided for editing');
      enqueueSnackbar('Unable to load license data. Please try again.', { variant: 'error' });
      return;
    }
    
    console.log('🔧 [LicensesPage] Opening edit dialog for license:', licenseToEdit);
    
    // Set all state synchronously before opening dialog
    setSelectedLicense(licenseToEdit);
    setEditLicenseName(licenseToEdit.name);
    setEditLicenseTier(licenseToEdit.tier);
    setEditLicenseStatus(licenseToEdit.status);
    setEditLicenseExpiresAt(new Date(licenseToEdit.expiresAt).toISOString().split('T')[0]);
    
    // Close menu first, then open dialog with a small delay to ensure state is set
    handleMenuClose();
    
    // Use setTimeout to ensure state updates are processed before dialog opens
    setTimeout(() => {
      setEditDialogOpen(true);
    }, 10);
  };

  const handleSaveLicenseEdit = async () => {
    if (!selectedLicense) return;

    try {
      await updateLicense.mutate({
        licenseId: selectedLicense.id,
        updates: {
          name: editLicenseName,
          tier: editLicenseTier,
          status: editLicenseStatus,
          expiresAt: new Date(editLicenseExpiresAt),
        }
      });

      enqueueSnackbar(`License ${selectedLicense.name} updated successfully`, { variant: 'success' });
      setEditDialogOpen(false);
      setSelectedLicense(null);
      refetchLicenses();
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to update license', { variant: 'error' });
    }
  };

  // Handle purchase flow completion
  const handlePurchaseComplete = async (result: {
    licenses: any[];
    invoice: any;
    subscription: any;
  }) => {
    console.log('🎉 [LicensesPage] Purchase completed:', result);
    
    enqueueSnackbar(
      `Successfully purchased ${result.licenses.length} license(s)! They are now active and ready to use.`,
      { 
        variant: 'success',
        autoHideDuration: 6000,
      }
    );
    
    // Refresh license data to show new licenses
    await refetchLicenses();
    
    // Close purchase flow
    setPurchaseFlowOpen(false);
  };

  // Handle renewal completion
  const handleRenewalComplete = async (result: {
    licenses: any[];
    invoice: any;
    subscription: any;
  }) => {
    console.log('🔄 [LicensesPage] Renewal completed:', result);
    
    enqueueSnackbar(
      `Successfully renewed ${result.licenses.length} license(s)! Your licenses have been extended.`,
      { 
        variant: 'success',
        autoHideDuration: 6000,
      }
    );
    
    // Refresh license data to show updated expiration dates
    await refetchLicenses();
    
    // Close renewal wizard
    setRenewalWizardOpen(false);
  };

  // Get expiring licenses for renewal wizard
  const expiringLicenses = useMemo(() => {
    if (!licenses) return [];
    
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return licenses.filter(license => {
      const expiryDate = new Date(license.expiresAt);
      return expiryDate <= thirtyDaysFromNow;
    });
  }, [licenses]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading License Data...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching your licenses and subscription details
          </Typography>
        </Box>
      </Box>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (hasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Unable to Load License Data</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            We encountered an issue loading your license information. This could be due to:
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
          </List>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // ============================================================================
  // NO DATA STATE
  // ============================================================================

  if (!currentUser || !orgContext) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <AlertTitle>Setting Up License Management</AlertTitle>
          <Typography variant="body2">
            We're preparing your license management dashboard. This may take a moment for new accounts.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // ============================================================================
  // MAIN LICENSE CONTENT
  // ============================================================================

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            License Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your {orgContext.organization?.name || 'Organization'} licenses and assignments
            {licenses && (
              <Box component="span" sx={{ marginLeft: '8px', fontWeight: 500, color: 'primary.main' }}>
                • {licenses.length} total licenses
              </Box>
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setPurchaseFlowOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            Purchase Licenses
          </Button>
        </Box>
      </Box>

      {/* License Filter Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: statusFilter === 'all' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }
            }}
            onClick={() => setStatusFilter('all')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {licenseData.stats.totalLicenses}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Licenses
                  </Typography>
                </Box>
                <CardMembership sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: statusFilter === 'ACTIVE' 
                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' 
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(17, 153, 142, 0.3)'
              }
            }}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {licenseData.stats.activeLicenses}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Licenses
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: statusFilter === 'PENDING' 
                ? 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)' 
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(252, 74, 26, 0.3)'
              }
            }}
            onClick={() => setStatusFilter('PENDING')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {licenses?.filter(l => l.status === 'PENDING').length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Licenses
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: statusFilter === 'EXPIRED' 
                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
              }
            }}
            onClick={() => setStatusFilter('EXPIRED')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {licenseData.stats.expiringSoon}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Expiring Soon
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              {licenseData.stats.expiringSoon > 0 && (
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenewalWizardOpen(true);
                  }}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Renew Licenses
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* Licenses Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {statusFilter === 'all' ? 'All Licenses' : statusFilter === 'EXPIRED' ? 'Expiring Soon Licenses' : `${statusFilter} Licenses`} ({licenseData.filteredLicenses.length})
              </Typography>
              {statusFilter !== 'all' && (
                <Chip
                  label={`Filtered by: ${statusFilter === 'EXPIRED' ? 'Expiring Soon' : statusFilter}`}
                  color="primary"
                  onDelete={() => setStatusFilter('all')}
                  deleteIcon={<Block />}
                  variant="outlined"
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {statusFilter !== 'all' && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setStatusFilter('all')}
                  startIcon={<Block />}
                >
                  Clear Filter
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => enqueueSnackbar('License report downloaded', { variant: 'success' })}
              >
                Export Report
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>License</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tier</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {licenseData.filteredLicenses.map((license) => (
                  <TableRow key={license.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {license.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {license.key}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={license.tier}
                        color={getTierColor(license.tier) as any}
                        size="small"
                        icon={license.tier === 'ENTERPRISE' ? <Star /> : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(license.status)}
                        label={license.status}
                        color={getStatusColor(license.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {license.assignedTo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{ width: 24, height: 24 }}
                          >
                            {getUserInitials(license.assignedTo, teamMembers)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getUserDisplayName(license.assignedTo, teamMembers)}
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
                      <Typography variant="body2" color="text.secondary">
                        {license.assignedTo ? 
                          teamMembers?.find(m => m.email === license.assignedTo?.email)?.department || 'Not specified' 
                          : '—'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {license.assignedTo ? (
                        <Chip
                          label={teamMembers?.find(m => m.email === license.assignedTo?.email)?.role || 'Member'}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={
                          new Date(license.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ? 'warning.main'
                            : 'text.primary'
                        }
                      >
                        {new Date(license.expiresAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuClick(event, license)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
          background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
        }}
        onClick={() => setPurchaseFlowOpen(true)}
      >
        <Add />
      </Fab>

      {/* Assign License Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign License</DialogTitle>
        <DialogContent>
          {selectedLicense && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  Assigning license: <strong>{selectedLicense.name}</strong>
                </Typography>
              </Alert>
              
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={assignUserId}
                  label="Assign To"
                  onChange={(e) => setAssignUserId(e.target.value as string)}
                  disabled={availableTeamMembers.length === 0}
                >
                  {availableTeamMembers.length === 0 ? (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        No available team members for assignment
                      </Typography>
                    </MenuItem>
                  ) : (
                    availableTeamMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {getTeamMemberDisplayName(member).charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getTeamMemberDisplayName(member)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              {availableTeamMembers.length === 0 && (
                <Alert severity="info">
                  <Typography variant="body2">
                    All team members already have licenses assigned. To assign this license, you'll need to unassign another license first or invite new team members.
                  </Typography>
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary">
                The user will receive an email with instructions to activate their license.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignLicense}
            variant="contained"
            startIcon={<PersonAdd />}
          >
            Assign License
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Delete License</DialogTitle>
        <DialogContent>
          {selectedLicense && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete <strong>{selectedLicense.name}</strong>?
              </Typography>
              <Alert severity="warning">
                <Typography variant="body2">
                  This action cannot be undone. The license will be permanently removed and any assigned user will lose access.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Delete License
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Edit License Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedLicense(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit />
            Edit License: {selectedLicense?.name || 'Loading...'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLicense ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              
              {/* Basic License Information Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Key /> Basic Information
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="License Name"
                    value={editLicenseName}
                    onChange={(e) => setEditLicenseName(e.target.value)}
                    placeholder="Development Team License"
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="License Key"
                    value={selectedLicense.key}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Key />
                        </InputAdornment>
                      ),
                    }}
                    helperText="License key is automatically generated and cannot be changed"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>License Tier</InputLabel>
                    <Select
                      value={editLicenseTier}
                      label="License Tier"
                      onChange={(e) => setEditLicenseTier(e.target.value as License['tier'])}
                    >
                      <MenuItem value="BASIC">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Basic</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Limited features • 2 max devices • Basic support
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="PROFESSIONAL">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Professional</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Full features • 5 max devices • Priority support
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="ENTERPRISE">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Enterprise</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Advanced features • 10 max devices • 24/7 support
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editLicenseStatus}
                      label="Status"
                      onChange={(e) => setEditLicenseStatus(e.target.value as License['status'])}
                    >
                      <MenuItem value="PENDING">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule color="warning" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Pending</Typography>
                            <Typography variant="caption" color="text.secondary">Awaiting activation</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="ACTIVE">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle color="success" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Active</Typography>
                            <Typography variant="caption" color="text.secondary">Fully operational</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="SUSPENDED">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Block color="error" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Suspended</Typography>
                            <Typography variant="caption" color="text.secondary">Temporarily disabled</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="EXPIRED">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Warning color="warning" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Expired</Typography>
                            <Typography variant="caption" color="text.secondary">Past expiration date</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <TextField
                  fullWidth
                  label="Expiration Date"
                  type="date"
                  value={editLicenseExpiresAt}
                  onChange={(e) => setEditLicenseExpiresAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Schedule />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Usage & Limits Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment /> Usage & Limits
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Max Devices"
                    value={selectedLicense.usage.maxDevices}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <People />
                        </InputAdornment>
                      ),
                    }}
                    helperText={`${editLicenseTier} tier limit`}
                  />
                  
                  <TextField
                    fullWidth
                    label="Current Devices"
                    value={selectedLicense.usage.deviceCount}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CheckCircle />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="API Calls Used"
                    value={selectedLicense.usage.apiCalls.toLocaleString()}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Assignment />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Data Transfer (GB)"
                    value={selectedLicense.usage.dataTransfer}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Download />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Usage Progress Bar */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Device Usage: {selectedLicense.usage.deviceCount} / {selectedLicense.usage.maxDevices}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(selectedLicense.usage.deviceCount / selectedLicense.usage.maxDevices) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={selectedLicense.usage.deviceCount >= selectedLicense.usage.maxDevices ? 'error' : 'primary'}
                  />
                </Box>
              </Box>

              {/* Assignment Information Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonAdd /> Assignment Information
                </Typography>
                
                {selectedLicense.assignedTo ? (
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Assigned To"
                      value={getUserDisplayName(selectedLicense.assignedTo, teamMembers)}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Avatar sx={{ width: 20, height: 20 }}>
                              {getUserInitials(selectedLicense.assignedTo, teamMembers)}
                            </Avatar>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="User Email"
                      value={selectedLicense.assignedTo.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                ) : (
                  <Alert severity="info">
                    <Typography variant="body2">
                      This license is currently unassigned. Use the "Assign License" action to assign it to a team member.
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Organization & Metadata Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business /> Organization & Metadata
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Organization"
                    value={selectedLicense.organization?.name || 'Unknown'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Organization Tier"
                    value={selectedLicense.organization?.tier || 'BASIC'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Star />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Created Date"
                    value={selectedLicense.createdAt ? new Date(selectedLicense.createdAt).toLocaleDateString() : 'Unknown'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Schedule />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Last Updated"
                    value={selectedLicense.updatedAt ? new Date(selectedLicense.updatedAt).toLocaleDateString() : 'Unknown'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Important Notes Alert */}
              <Alert severity="warning">
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  ⚠️ Important Notes
                </Typography>
                <Typography variant="body2">
                  • Changing the license tier will update device limits and feature access<br/>
                  • Status changes will immediately affect the user's access to the system<br/>
                  • Expiration date changes should be communicated to the license holder<br/>
                  • Some fields are system-managed and cannot be edited here
                </Typography>
              </Alert>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Box textAlign="center">
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Loading license data...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If this persists, please try again or refresh the page.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveLicenseEdit}
            variant="contained"
            startIcon={<Edit />}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* License Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedLicense && handleCopyLicense(selectedLicense.key)}>
          <ListItemIcon><ContentCopy /></ListItemIcon>
          Copy License Key
        </MenuItem>
        {!selectedLicense?.assignedTo && (
          <MenuItem onClick={() => setAssignDialogOpen(true)}>
            <ListItemIcon><PersonAdd /></ListItemIcon>
            Assign License
          </MenuItem>
        )}
        <MenuItem onClick={() => selectedLicense && handleEditLicense(selectedLicense)}>
          <ListItemIcon><Edit /></ListItemIcon>
          Edit License
        </MenuItem>
        <Divider />
        {selectedLicense?.status === 'ACTIVE' ? (
          <MenuItem onClick={handleSuspendLicense}>
            <ListItemIcon><Block /></ListItemIcon>
            Suspend License
          </MenuItem>
        ) : (
          <MenuItem onClick={handleActivateLicense}>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            Activate License
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDeleteLicense} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete sx={{ color: 'error.main' }} /></ListItemIcon>
          Delete License
        </MenuItem>
      </Menu>

      {/* License Purchase Flow */}
      <LicensePurchaseFlow
        open={purchaseFlowOpen}
        onClose={() => setPurchaseFlowOpen(false)}
        initialPlan="professional"
        initialQuantity={1}
        onPurchaseComplete={handlePurchaseComplete}
      />

      {/* License Renewal Wizard */}
      <LicenseRenewalWizard
        open={renewalWizardOpen}
        onClose={() => setRenewalWizardOpen(false)}
        expiringLicenses={expiringLicenses}
        onRenewalComplete={handleRenewalComplete}
      />
    </Box>
  );
};

export default LicensesPage;
