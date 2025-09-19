/**
 * 👥 Enhanced Team Management Page - Licensing Website Version
 * 
 * Streamlined team management for licensing website:
 * - Team Member Management
 * - License Assignment
 * - Basic Filtering & Search
 * - CSV Import/Export
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Avatar,
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
  CircularProgress,
  InputAdornment,
  Checkbox,
  Divider,
  Pagination,
  Skeleton,
} from '@mui/material';
import {
  MoreVert,
  Email,
  CheckCircle,
  Schedule,
  PersonAdd,
  Star,
  People,
  Download,
  Upload,
  FilterList,
  Search,
  Edit,
  Delete,
  Refresh,
  Lock,
  VpnKey,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  useCurrentUser, 
  useOrganizationContext, 
  useOrganizationTeamMembers,
  useOrganizationLicenses,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useAssignLicense,
  useUnassignLicense,
  useUserProjects,
  useChangeTeamMemberPassword
} from '@/hooks/useStreamlinedData';
import { StreamlinedTeamMember } from '@/services/UnifiedDataService';
import { csvService, CSVImportResult } from '@/services/CSVService';
import { teamMemberFilterService, FilterCriteria, SortOptions, PaginationOptions } from '@/services/TeamMemberFilterService';
import MetricCard from '@/components/common/MetricCard';
import FirebaseOnlyInviteTeamMemberDialog from '@/components/FirebaseOnlyInviteTeamMemberDialog';

// ============================================================================
// TYPES
// ============================================================================

enum TeamMemberRole {
  VIEWER = 'VIEWER',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

enum TeamMemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  REMOVED = 'REMOVED'
}

type TeamMember = StreamlinedTeamMember;

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  availableLicenses: number;
  totalLicenses: number;
  assignedLicenses: number;
}

// ============================================================================
// COMPONENTS
// ============================================================================

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EnhancedTeamPage: React.FC = React.memo(() => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State management
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState<PaginationOptions>({ page: 1, pageSize: 25 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showCSVExport, setShowCSVExport] = useState(false);
  const [csvImportResult, setCsvImportResult] = useState<CSVImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Menu states for team member actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<StreamlinedTeamMember | null>(null);
  
  // Dialog states for team member actions
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [assignLicenseDialogOpen, setAssignLicenseDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false);
  
  // Form states for editing member
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer' | 'owner',
    status: 'active' as 'active' | 'pending' | 'suspended' | 'removed',
    department: '',
    position: '',
    phone: ''
  });
  
  // Form states for password change
  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form states for license assignment
  const [selectedLicenseId, setSelectedLicenseId] = useState('');

  // Hooks
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { data: teamMembers, loading: teamLoading, error: teamError, refetch: refetchTeamMembers } = useOrganizationTeamMembers();
  const { data: licenses, loading: licensesLoading, error: licensesError, refetch: refetchLicenses } = useOrganizationLicenses();
  const { data: userProjects, loading: projectsLoading, error: projectsError } = useUserProjects();
  
  // Mutation hooks
  const inviteTeamMember = useInviteTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const removeTeamMember = useRemoveTeamMember();
  const assignLicense = useAssignLicense();
  const unassignLicense = useUnassignLicense();
  const changeTeamMemberPassword = useChangeTeamMemberPassword();

  // Filtered and sorted team members
  const filteredMembers = useMemo(() => {
    if (!teamMembers || !Array.isArray(teamMembers)) return [];
    
    try {
      // First filter to only show team members with proper license assignments or admin users
      const realTeamMembers = teamMembers.filter(member => {
        // Always show admin users
        if (member.role === TeamMemberRole.ADMIN) return true;
        
        // Only show members with active status and proper license assignments
        if (member.status === TeamMemberStatus.ACTIVE && (member.licenseAssignment?.licenseId || member.licenseType)) {
          return true;
        }
        
        return false;
      });

      const criteria = {
        ...filterCriteria,
        search: searchQuery || undefined
      };
      
      const result = teamMemberFilterService.filterTeamMembers(
        realTeamMembers,
        criteria,
        sortOptions,
        pagination
      );
      
      return result.filteredMembers || [];
    } catch (error) {
      console.error('Error filtering team members:', error);
      return teamMembers || [];
    }
  }, [teamMembers, filterCriteria, searchQuery, sortOptions, pagination]);

  // Team statistics - only count real team members with proper license assignments
  const teamStats = useMemo((): TeamStats => {
    if (!teamMembers || !Array.isArray(teamMembers)) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        availableLicenses: 0,
        totalLicenses: 0,
        assignedLicenses: 0
      };
    }

    try {
      // Filter to only real team members with proper license assignments or admin users
      const realTeamMembers = teamMembers.filter(member => {
        // Always count admin users
        if (member.role === TeamMemberRole.ADMIN) return true;
        
        // Only count members with active status and proper license assignments
        if (member.status === TeamMemberStatus.ACTIVE && (member.licenseAssignment?.licenseId || member.licenseType)) {
          return true;
        }
        
        return false;
      });

      const totalMembers = realTeamMembers.length;
      const activeMembers = realTeamMembers.filter(m => m?.status === TeamMemberStatus.ACTIVE).length;
      const pendingInvites = realTeamMembers.filter(m => m?.status === TeamMemberStatus.PENDING).length;
      const assignedLicenses = realTeamMembers.filter(m => m?.licenseAssignment?.licenseId || m?.licenseType).length;
      const totalLicenses = licenses?.length || 0;
      const availableLicenses = Math.max(0, totalLicenses - assignedLicenses);

      return {
        totalMembers,
        activeMembers,
        pendingInvites,
        availableLicenses,
        totalLicenses,
        assignedLicenses
      };
    } catch (error) {
      console.error('Error calculating team statistics:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        availableLicenses: 0,
        totalLicenses: 0,
        assignedLicenses: 0
      };
    }
  }, [teamMembers, licenses]);


  // Handle CSV export
  const handleCSVExport = useCallback(async () => {
    if (!teamMembers || teamMembers.length === 0) {
      enqueueSnackbar('No team members to export', { variant: 'warning' });
      return;
    }
    
    try {
      setIsLoading(true);
      const csvContent = await csvService.exportTeamMembers(teamMembers, {
        includeInactive: true,
        includeAuditInfo: true
      });
      
      csvService.downloadCSV(csvContent, `team-members-${new Date().toISOString().split('T')[0]}.csv`);
      enqueueSnackbar('Team members exported successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to export CSV:', error);
      enqueueSnackbar('Failed to export CSV', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [teamMembers, enqueueSnackbar]);

  // Handle CSV import
  const handleCSVImport = useCallback(async (file: File) => {
    if (!orgContext?.organization?.id) {
      enqueueSnackbar('Organization not found', { variant: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      const csvContent = await file.text();
      const result = await csvService.importTeamMembers(
        csvContent,
        orgContext.organization.id,
        (progress) => {
          // Handle progress
          console.log('CSV Import Progress:', progress);
        }
      );
      
      setCsvImportResult(result);
      
      if (result.success) {
        enqueueSnackbar(`Successfully imported ${result.successfulImports} team members`, { variant: 'success' });
        refetchTeamMembers();
      } else {
        enqueueSnackbar(`Import completed with ${result.failedImports} errors`, { variant: 'warning' });
      }
    } catch (error) {
      console.error('Failed to import CSV:', error);
      enqueueSnackbar('Failed to import CSV', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [orgContext?.organization?.id, enqueueSnackbar, refetchTeamMembers]);


  // Handle team member menu actions
  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, member: StreamlinedTeamMember) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedMember(null);
  }, []);

  const handleEditMember = useCallback((member: StreamlinedTeamMember) => {
    setSelectedMember(member);
    setEditFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      role: member.role || 'member',
      status: member.status || 'active',
      department: member.department || '',
      position: member.position || '',
      phone: member.phone || ''
    });
    handleMenuClose();
    setEditMemberDialogOpen(true);
  }, []);

  const handleDeleteMember = useCallback((member: StreamlinedTeamMember) => {
    setSelectedMember(member);
    handleMenuClose();
    setDeleteMemberDialogOpen(true);
  }, []);

  const handleAssignLicense = useCallback((member: StreamlinedTeamMember) => {
    setSelectedMember(member);
    setSelectedLicenseId('');
    handleMenuClose();
    setAssignLicenseDialogOpen(true);
  }, []);

  const handleChangePassword = useCallback((member: StreamlinedTeamMember) => {
    setSelectedMember(member);
    setPasswordFormData({
      newPassword: '',
      confirmPassword: ''
    });
    handleMenuClose();
    setChangePasswordDialogOpen(true);
  }, []);

  const handleResendInvite = useCallback(async (member: StreamlinedTeamMember) => {
    try {
      // Use the invite mutation to resend
      inviteTeamMember.mutate({
        email: member.email,
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        role: member.role || 'member',
        status: member.status || 'pending',
        department: member.department || '',
        position: member.position || '',
        phone: member.phone || '',
        organization: member.organization || {
          id: orgContext?.organization?.id || '',
          name: orgContext?.organization?.name || '',
          tier: 'professional'
        },
        assignedProjects: member.assignedProjects || []
      });
      handleMenuClose();
      enqueueSnackbar('Invitation resent successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to resend invite:', error);
      enqueueSnackbar('Failed to resend invitation', { variant: 'error' });
    }
  }, [inviteTeamMember, enqueueSnackbar, orgContext]);

  // Dialog handlers
  const handleSaveEditMember = useCallback(async () => {
    if (!selectedMember) return;
    
    try {
      updateTeamMember.mutate({
        memberId: selectedMember.id,
        updates: editFormData
      });
      setEditMemberDialogOpen(false);
      enqueueSnackbar('Team member updated successfully', { variant: 'success' });
      refetchTeamMembers();
    } catch (error) {
      console.error('Failed to update team member:', error);
      enqueueSnackbar('Failed to update team member', { variant: 'error' });
    }
  }, [selectedMember, editFormData, updateTeamMember, enqueueSnackbar, refetchTeamMembers]);

  const handleConfirmDeleteMember = useCallback(async () => {
    if (!selectedMember) {
      console.error('❌ [EnhancedTeamPage] No selected member for deletion');
      return;
    }
    
    console.log('🗑️ [EnhancedTeamPage] Remove Member button clicked!');
    console.log('🗑️ [EnhancedTeamPage] Selected member:', selectedMember);
    console.log('🗑️ [EnhancedTeamPage] Remove team member hook:', removeTeamMember);
    
    // Check if team member has an assigned license
    const hasAssignedLicense = selectedMember.licenseAssignment?.licenseId || selectedMember.licenseType;
    console.log('🎫 [EnhancedTeamPage] Has assigned license:', hasAssignedLicense);
    
    try {
      // Use the mutation hook and wait for it to complete
      console.log('🔄 [EnhancedTeamPage] Calling removeTeamMember.mutate...');
      await removeTeamMember.mutate({ memberId: selectedMember.id });
      console.log('✅ [EnhancedTeamPage] removeTeamMember.mutate completed successfully');
      
      setDeleteMemberDialogOpen(false);
      
      // Show appropriate success message based on license status
      if (hasAssignedLicense) {
        enqueueSnackbar('Team member removed successfully! Their license has been released back to the available pool.', { 
          variant: 'success',
          autoHideDuration: 6000 
        });
      } else {
        enqueueSnackbar('Team member removed successfully', { variant: 'success' });
      }
      
      // Refresh both team members and licenses to show updated counts
      console.log('🔄 [EnhancedTeamPage] Refreshing data after removal...');
      await Promise.all([
        refetchTeamMembers(),
        refetchLicenses()
      ]);
      console.log('✅ [EnhancedTeamPage] Data refresh completed');
      
    } catch (error) {
      console.error('❌ [EnhancedTeamPage] Error in handleConfirmDeleteMember:', error);
      enqueueSnackbar(`Failed to remove team member: ${error instanceof Error ? error.message : 'Unknown error'}`, { variant: 'error' });
    }
  }, [selectedMember, removeTeamMember, enqueueSnackbar, refetchTeamMembers, refetchLicenses]);

  const handleAssignLicenseToMember = useCallback(async () => {
    if (!selectedMember || !selectedLicenseId) return;
    
    try {
      assignLicense.mutate({
        licenseId: selectedLicenseId,
        userId: selectedMember.id
      });
      setAssignLicenseDialogOpen(false);
      enqueueSnackbar('License assigned successfully', { variant: 'success' });
      refetchTeamMembers();
    } catch (error) {
      console.error('Failed to assign license:', error);
      enqueueSnackbar('Failed to assign license', { variant: 'error' });
    }
  }, [selectedMember, selectedLicenseId, assignLicense, enqueueSnackbar, refetchTeamMembers]);

  const handleChangeMemberPassword = useCallback(async () => {
    if (!selectedMember || !passwordFormData.newPassword) return;
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    
    if (passwordFormData.newPassword.length < 8) {
      enqueueSnackbar('Password must be at least 8 characters long', { variant: 'error' });
      return;
    }
    
    try {
      changeTeamMemberPassword.mutate({
        memberId: selectedMember.id,
        newPassword: passwordFormData.newPassword
      });
      setChangePasswordDialogOpen(false);
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to change password:', error);
      enqueueSnackbar('Failed to change password', { variant: 'error' });
    }
  }, [selectedMember, passwordFormData, changeTeamMemberPassword, enqueueSnackbar]);


  // Handle member selection
  const handleMemberSelection = (memberId: string, selected: boolean) => {
    if (selected) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedMembers(filteredMembers.map(m => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  // Handle filter change
  const handleFilterChange = (newCriteria: FilterCriteria) => {
    setFilterCriteria(newCriteria);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle sort change
  const handleSortChange = (newSortOptions: SortOptions) => {
    setSortOptions(newSortOptions);
  };

  // Handle pagination change
  const handlePaginationChange = (newPagination: PaginationOptions) => {
    setPagination(newPagination);
  };

  // Add error boundary for React Error #301
  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Team Management</Typography>
        <Alert severity="info">
          Please log in to access team management features.
        </Alert>
      </Box>
    );
  }

  // Render loading state
  if (userLoading || orgLoading || teamLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Team Management</Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Render error state
  if (userError || orgError || teamError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Team Data</AlertTitle>
          {userError || orgError || teamError || 'Unknown error occurred'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Team Management
          </Typography>
          {licenses && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {licenses.filter(l => l.status === 'ACTIVE' && (!l.assignedTo?.userId || l.assignedTo?.userId === null)).length} available licenses for team members
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => {
              console.log('🔍 [EnhancedTeamPage] Invite Member button clicked');
              setInviteDialogOpen(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #00b8e6 0%, #5a6fd8 100%)',
              }
            }}
          >
            Invite Member
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={async () => {
              console.log('🔄 [EnhancedTeamPage] Manual refresh triggered');
              enqueueSnackbar('Refreshing team data...', { variant: 'info' });
              try {
                await refetchTeamMembers();
                await refetchLicenses();
                enqueueSnackbar('Team data refreshed!', { variant: 'success' });
              } catch (error) {
                console.error('❌ [EnhancedTeamPage] Manual refresh failed:', error);
                enqueueSnackbar('Failed to refresh data', { variant: 'error' });
              }
            }}
            disabled={isLoading}
            title="Refresh team members list"
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={isLoading ? <CircularProgress size={16} /> : <Download />}
            onClick={handleCSVExport}
            disabled={isLoading || !teamMembers || teamMembers.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setShowCSVImport(true)}
            disabled={isLoading}
          >
            Import CSV
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Members"
            value={teamStats.totalMembers}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Members"
            value={teamStats.activeMembers}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Invites"
            value={teamStats.pendingInvites}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Available Licenses"
            value={teamStats.availableLicenses}
            icon={<VpnKey />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Box>

          {/* Advanced Filters */}
          {showFilters && (
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Advanced Filters" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        multiple
                        value={filterCriteria.role || []}
                        onChange={(e) => handleFilterChange({
                          ...filterCriteria,
                          role: e.target.value as string[]
                        })}
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="member">Member</MenuItem>
                        <MenuItem value="viewer">Viewer</MenuItem>
                        <MenuItem value="owner">Owner</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        multiple
                        value={filterCriteria.status || []}
                        onChange={(e) => handleFilterChange({
                          ...filterCriteria,
                          status: e.target.value as string[]
                        })}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Department</InputLabel>
                      <Select
                        multiple
                        value={filterCriteria.department || []}
                        onChange={(e) => handleFilterChange({
                          ...filterCriteria,
                          department: e.target.value as string[]
                        })}
                      >
                        {/* Populate from team members */}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>License Type</InputLabel>
                      <Select
                        multiple
                        value={filterCriteria.licenseType || []}
                        onChange={(e) => handleFilterChange({
                          ...filterCriteria,
                          licenseType: e.target.value as string[]
                        })}
                      >
                        <MenuItem value="BASIC">Basic</MenuItem>
                        <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                        <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Team Members List */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedMembers.length > 0 && selectedMembers.length < filteredMembers.length}
                      checked={filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>License</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No team members found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => {
                    if (!member || !member.id) return null;
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedMembers.includes(member.id)}
                            onChange={(e) => handleMemberSelection(member.id, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar>
                              {member.firstName?.[0] || '?'}{member.lastName?.[0] || '?'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {member.firstName || 'Unknown'} {member.lastName || 'User'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {member.email || 'No email'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.role || 'member'}
                            color={member.role === 'admin' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.status || 'unknown'}
                            color={member.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{member.department || '-'}</TableCell>
                        <TableCell>
                          {member.licenseType ? (
                            <Chip
                              label={member.licenseType}
                              color="info"
                              size="small"
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {member.lastActive ? (
                            new Date(member.lastActive).toLocaleDateString()
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small"
                            onClick={(event) => handleMenuClick(event, member)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(filteredMembers.length / pagination.pageSize)}
              page={pagination.page}
              onChange={(e, page) => handlePaginationChange({ ...pagination, page })}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* CSV Import Dialog */}
      <Dialog open={showCSVImport} onClose={() => setShowCSVImport(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Team Members from CSV</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
            >
              Choose CSV File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCSVImport(file);
                }}
              />
            </Button>
          </Box>
          
          {csvImportResult && (
            <Alert severity={csvImportResult.success ? 'success' : 'warning'}>
              <AlertTitle>
                Import {csvImportResult.success ? 'Successful' : 'Completed with Errors'}
              </AlertTitle>
              <Typography>
                Processed: {csvImportResult.totalRows} rows
              </Typography>
              <Typography>
                Successful: {csvImportResult.successfulImports}
              </Typography>
              <Typography>
                Failed: {csvImportResult.failedImports}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCSVImport(false)}>Close</Button>
        </DialogActions>
      </Dialog>


      {/* Team Member Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedMember && handleEditMember(selectedMember)}>
          <ListItemIcon><Edit /></ListItemIcon>
          Edit Member
        </MenuItem>
        
        {selectedMember?.status?.toLowerCase() === 'pending' && (
          <MenuItem onClick={() => selectedMember && handleResendInvite(selectedMember)}>
            <ListItemIcon><Email /></ListItemIcon>
            Resend Invite
          </MenuItem>
        )}
        
        <MenuItem onClick={() => selectedMember && handleAssignLicense(selectedMember)}>
          <ListItemIcon><Star /></ListItemIcon>
          Assign License
        </MenuItem>
        
        <MenuItem onClick={() => selectedMember && handleChangePassword(selectedMember)}>
          <ListItemIcon><Lock /></ListItemIcon>
          Change Password
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => selectedMember && handleDeleteMember(selectedMember)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete sx={{ color: 'error.main' }} /></ListItemIcon>
          Remove Member
        </MenuItem>
      </Menu>

      {/* Edit Member Dialog */}
      <Dialog open={editMemberDialogOpen} onClose={() => setEditMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Team Member</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editFormData.role}
                onChange={(e) => setEditFormData({...editFormData, role: e.target.value as 'admin' | 'member' | 'viewer' | 'owner'})}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editFormData.status}
                onChange={(e) => setEditFormData({...editFormData, status: e.target.value as 'active' | 'pending' | 'suspended' | 'removed'})}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="removed">Removed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Department"
              value={editFormData.department}
              onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
              fullWidth
            />
            <TextField
              label="Position"
              value={editFormData.position}
              onChange={(e) => setEditFormData({...editFormData, position: e.target.value})}
              fullWidth
            />
            <TextField
              label="Phone"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMemberDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEditMember} 
            variant="contained"
            disabled={updateTeamMember.loading}
          >
            {updateTeamMember.loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign License Dialog */}
      <Dialog open={assignLicenseDialogOpen} onClose={() => setAssignLicenseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign License</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Assign a license to {selectedMember?.firstName} {selectedMember?.lastName}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select License</InputLabel>
              <Select
                value={selectedLicenseId}
                onChange={(e) => setSelectedLicenseId(e.target.value)}
              >
                {licenses?.filter(license => !license.assignedTo).map((license) => (
                  <MenuItem key={license.id} value={license.id}>
                    {license.tier} - {license.key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignLicenseDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignLicenseToMember} 
            variant="contained"
            disabled={!selectedLicenseId || assignLicense.loading}
          >
            {assignLicense.loading ? 'Assigning...' : 'Assign License'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onClose={() => setChangePasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Change password for {selectedMember?.firstName} {selectedMember?.lastName}
            </Typography>
            <TextField
              label="New Password"
              type="password"
              value={passwordFormData.newPassword}
              onChange={(e) => setPasswordFormData({...passwordFormData, newPassword: e.target.value})}
              fullWidth
              helperText="Password must be at least 8 characters long"
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={passwordFormData.confirmPassword}
              onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleChangeMemberPassword} 
            variant="contained"
            disabled={!passwordFormData.newPassword || !passwordFormData.confirmPassword || changeTeamMemberPassword.loading}
          >
            {changeTeamMemberPassword.loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Member Dialog */}
      <Dialog open={deleteMemberDialogOpen} onClose={() => setDeleteMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Remove Team Member</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Warning</AlertTitle>
              This action cannot be undone. The team member will be permanently removed from your organization.
            </Alert>
            
            {/* Show license release information */}
            {selectedMember && (selectedMember.licenseAssignment?.licenseId || selectedMember.licenseType) && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>License Release</AlertTitle>
                This team member has an assigned license. When removed, their license will be released back to the available pool and can be assigned to another team member.
              </Alert>
            )}
            
            <Typography variant="body2">
              Are you sure you want to remove <strong>{selectedMember?.firstName} {selectedMember?.lastName}</strong> from the team?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteMemberDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDeleteMember} 
            variant="contained"
            color="error"
            disabled={removeTeamMember.loading}
          >
            {removeTeamMember.loading ? 'Removing...' : 'Remove Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Simple Invite Team Member Dialog */}
        <FirebaseOnlyInviteTeamMemberDialog
          open={inviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
          onSuccess={async (teamMember) => {
            console.log('✅ [EnhancedTeamPage] Team member created successfully via Firebase:', teamMember);
            
            // Close dialog first
            setInviteDialogOpen(false);
            
            // Show success message
            enqueueSnackbar('Team member created successfully! Refreshing data...', { variant: 'success' });
            
            // Refresh team members list with delay to ensure Firebase has processed
            setTimeout(async () => {
              try {
                console.log('🔄 [EnhancedTeamPage] Refreshing team members data...');
                await refetchTeamMembers();
                await refetchLicenses();
                console.log('✅ [EnhancedTeamPage] Data refresh completed');
                enqueueSnackbar('Team member added to the list!', { variant: 'success' });
              } catch (error) {
                console.error('❌ [EnhancedTeamPage] Error refreshing data:', error);
                enqueueSnackbar('Team member created but data refresh failed. Please refresh the page.', { variant: 'warning' });
              }
            }, 1000); // 1 second delay to ensure Firebase has processed the write
          }}
          currentUser={currentUser}
          organization={orgContext}
          availableLicenses={licenses?.filter(l => 
            l.status === 'ACTIVE' && (!l.assignedTo?.userId || l.assignedTo?.userId === null)
          ) || []}
        />
    </Box>
  );
});

export default EnhancedTeamPage;
