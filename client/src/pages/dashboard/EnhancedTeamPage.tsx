/**
 * 👥 Enhanced Team Management Page
 * 
 * Complete team management with advanced features:
 * - CSV Import/Export
 * - Advanced Filtering & Search
 * - Team Analytics & Reports
 * - Audit Trail
 * - Bulk Operations
 * - Team Templates
 * - Advanced Search
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  LinearProgress,
  Fab,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton as MuiIconButton,
  Tabs,
  Tab,
  Autocomplete,
  Checkbox,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert as MuiAlert,
  Snackbar,
  Backdrop,
  Drawer,
  ListItemButton,
  ListItemAvatar,
  ListItemSecondaryAction,
  CardHeader,
  CardActions,
  CardMedia,
  Rating,
  Slider,
  RadioGroup,
  Radio,
  FormLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Skeleton,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Email,
  Block,
  CheckCircle,
  Schedule,
  Group,
  PersonAdd,
  AdminPanelSettings,
  Work,
  Star,
  VisibilityOff,
  Send,
  Warning,
  Security,
  Info,
  People,
  Phone,
  Badge,
  AccessTime,
  Assignment,
  Lock,
  VpnKey,
  Folder,
  Business,
  Download,
  Upload,
  FilterList,
  Search,
  Analytics,
  History,
  Settings,
  PlaylistAdd,
  PlayArrow,
  Stop,
  Edit,
  Delete,
  Visibility,
  Refresh,
  SelectAll,
  Clear,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline as TimelineIcon,
  GroupWork,
  Speed,
  Insights,
  BarChart,
  PieChart,
  TableChart,
  ViewList,
  ViewModule,
  ViewQuilt,
  Sort,
  FilterAlt,
  Tune,
  ManageAccounts,
  SupervisedUserCircle,
  PersonSearch,
  PersonAddAlt1,
  PersonRemove,
  PersonOff,
  PersonAddDisabled,
  PersonPin,
  PersonPinCircle,
  PersonAddAlt,
  PersonRemoveAlt1,
  PersonAddAlt1Outlined,
  PersonRemoveAlt1Outlined,
  PersonAddOutlined,
  PersonRemoveOutlined,
  PersonAddDisabledOutlined,
  PersonOffOutlined,
  PersonPinOutlined,
  PersonPinCircleOutlined,
  PersonSearchOutlined,
  ManageAccountsOutlined,
  SupervisedUserCircleOutlined,
  GroupOutlined,
  GroupWorkOutlined,
  SpeedOutlined,
  InsightsOutlined,
  AssessmentOutlined,
  BarChartOutlined,
  PieChartOutlined,
  TableChartOutlined,
  ViewListOutlined,
  ViewModuleOutlined,
  ViewQuiltOutlined,
  SortOutlined,
  FilterAltOutlined,
  TuneOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterListOutlined,
  SearchOutlined,
  AnalyticsOutlined,
  HistoryOutlined,
  SettingsOutlined,
  PlaceOutlined,
  PlaylistAddOutlined,
  SelectAllOutlined,
  ClearOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  TimelineOutlined,
  GroupOutlined as GroupOutlinedIcon,
  GroupWorkOutlined as GroupWorkOutlinedIcon,
  SpeedOutlined as SpeedOutlinedIcon,
  InsightsOutlined as InsightsOutlinedIcon,
  AssessmentOutlined as AssessmentOutlinedIcon,
  BarChartOutlined as BarChartOutlinedIcon,
  PieChartOutlined as PieChartOutlinedIcon,
  TableChartOutlined as TableChartOutlinedIcon,
  ViewListOutlined as ViewListOutlinedIcon,
  ViewModuleOutlined as ViewModuleOutlinedIcon,
  ViewQuiltOutlined as ViewQuiltOutlinedIcon,
  SortOutlined as SortOutlinedIcon,
  FilterAltOutlined as FilterAltOutlinedIcon,
  TuneOutlined as TuneOutlinedIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  UploadOutlined as UploadOutlinedIcon,
  FilterListOutlined as FilterListOutlinedIcon,
  SearchOutlined as SearchOutlinedIcon,
  AnalyticsOutlined as AnalyticsOutlinedIcon,
  HistoryOutlined as HistoryOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  PlaceOutlined as TemplateOutlinedIcon,
  PlaylistAddOutlined as PlaylistAddOutlinedIcon,
  SelectAllOutlined as SelectAllOutlinedIcon,
  ClearOutlined as ClearOutlinedIcon,
  ExpandMoreOutlined as ExpandMoreOutlinedIcon,
  ExpandLessOutlined as ExpandLessOutlinedIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
  TrendingDownOutlined as TrendingDownOutlinedIcon,
  TimelineOutlined as TimelineOutlinedIcon,
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
import { teamMemberAnalyticsService, TeamAnalytics } from '@/services/TeamMemberAnalyticsService';
import { teamMemberAuditService, AuditLog, AuditQuery } from '@/services/TeamMemberAuditService';
import { teamMemberTemplateService, TeamMemberTemplate, BulkOperation } from '@/services/TeamMemberTemplateService';
import MetricCard from '@/components/common/MetricCard';

// ============================================================================
// TYPES
// ============================================================================

enum TeamMemberRole {
  VIEWER = 'viewer',
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner'
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EnhancedTeamPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState<PaginationOptions>({ page: 1, pageSize: 25 });
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showCSVExport, setShowCSVExport] = useState(false);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [templates, setTemplates] = useState<TeamMemberTemplate[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [csvImportResult, setCsvImportResult] = useState<CSVImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOperationDetails, setShowOperationDetails] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null);
  const [runningOperations, setRunningOperations] = useState<Set<string>>(new Set());
  
  // Menu states for team member actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<StreamlinedTeamMember | null>(null);
  
  // Dialog states for team member actions
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
    if (!teamMembers) return [];
    
    const criteria = {
      ...filterCriteria,
      search: searchQuery || undefined
    };
    
    const result = teamMemberFilterService.filterTeamMembers(
      teamMembers,
      criteria,
      sortOptions,
      pagination
    );
    
    return result.filteredMembers;
  }, [teamMembers, filterCriteria, searchQuery, sortOptions, pagination]);

  // Team statistics
  const teamStats = useMemo((): TeamStats => {
    if (!teamMembers) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        availableLicenses: 0,
        totalLicenses: 0,
        assignedLicenses: 0
      };
    }

    const totalMembers = teamMembers.length;
    const activeMembers = teamMembers.filter(m => m.status === 'active').length;
    const pendingInvites = teamMembers.filter(m => m.status === 'pending').length;
    const assignedLicenses = teamMembers.filter(m => m.licenseType && m.licenseType !== 'BASIC').length;
    const totalLicenses = licenses?.length || 0;
    const availableLicenses = totalLicenses - assignedLicenses;

    return {
      totalMembers,
      activeMembers,
      pendingInvites,
      availableLicenses,
      totalLicenses,
      assignedLicenses
    };
  }, [teamMembers, licenses]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    if (!teamMembers) return;
    
    setIsLoading(true);
    try {
      const analyticsData = teamMemberAnalyticsService.generateAnalytics(teamMembers);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      enqueueSnackbar('Failed to load analytics', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [teamMembers, enqueueSnackbar]);

  // Load audit logs
  const loadAuditLogs = useCallback(async () => {
    if (!orgContext?.organization?.id) return;
    
    setIsLoading(true);
    try {
      const query: AuditQuery = {
        organizationId: orgContext.organization.id,
        limit: 100
      };
      const logs = teamMemberAuditService.queryAuditLogs(query);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      enqueueSnackbar('Failed to load audit logs', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [orgContext?.organization?.id, enqueueSnackbar]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const templateList = teamMemberTemplateService.getTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Failed to load templates:', error);
      enqueueSnackbar('Failed to load templates', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Load bulk operations
  const loadBulkOperations = useCallback(async () => {
    try {
      const operations = teamMemberTemplateService.getBulkOperations();
      setBulkOperations(operations);
    } catch (error) {
      console.error('Failed to load bulk operations:', error);
      enqueueSnackbar('Failed to load bulk operations', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Handle CSV export
  const handleCSVExport = useCallback(async () => {
    if (!teamMembers) return;
    
    try {
      const csvContent = await csvService.exportTeamMembers(teamMembers, {
        includeInactive: true,
        includeAuditInfo: true
      });
      
      csvService.downloadCSV(csvContent, `team-members-${new Date().toISOString().split('T')[0]}.csv`);
      enqueueSnackbar('Team members exported successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to export CSV:', error);
      enqueueSnackbar('Failed to export CSV', { variant: 'error' });
    }
  }, [teamMembers, enqueueSnackbar]);

  // Handle CSV import
  const handleCSVImport = useCallback(async (file: File) => {
    if (!orgContext?.organization?.id) return;
    
    try {
      const csvContent = await file.text();
      const result = await csvService.importTeamMembers(
        csvContent,
        orgContext.organization.id,
        (progress) => {
          // Handle progress
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
    }
  }, [orgContext?.organization?.id, enqueueSnackbar, refetchTeamMembers]);

  // Handle bulk operations
  const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
    if (!teamMembers) return;
    
    // Add to running operations
    setRunningOperations(prev => new Set([...prev, operation.id]));
    
    try {
      const result = await teamMemberTemplateService.executeBulkOperation(
        operation.id,
        teamMembers,
        (progress) => {
          // Update progress in real-time
          setBulkOperations(prev => prev.map(op => 
            op.id === operation.id ? { ...op, progress } : op
          ));
        }
      );
      
      // Update operation status
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id ? { 
          ...op, 
          status: result.failed === 0 ? 'completed' : 'failed',
          progress: 100,
          results: result,
          completedAt: new Date()
        } : op
      ));
      
      enqueueSnackbar(`Bulk operation completed: ${result.successful} successful, ${result.failed} failed`, { 
        variant: result.failed === 0 ? 'success' : 'warning' 
      });
      refetchTeamMembers();
    } catch (error) {
      console.error('Failed to execute bulk operation:', error);
      
      // Update operation status to failed
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id ? { 
          ...op, 
          status: 'failed',
          progress: 0
        } : op
      ));
      
      enqueueSnackbar('Failed to execute bulk operation', { variant: 'error' });
    } finally {
      // Remove from running operations
      setRunningOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operation.id);
        return newSet;
      });
    }
  }, [teamMembers, enqueueSnackbar, refetchTeamMembers]);

  // Handle view operation details
  const handleViewOperationDetails = useCallback((operation: BulkOperation) => {
    setSelectedOperation(operation);
    setShowOperationDetails(true);
  }, []);

  // Handle edit operation
  const handleEditOperation = useCallback((operation: BulkOperation) => {
    // For now, just show a message - in a real app, this would open an edit dialog
    enqueueSnackbar('Edit functionality coming soon', { variant: 'info' });
  }, [enqueueSnackbar]);

  // Handle delete operation
  const handleDeleteOperation = useCallback((operation: BulkOperation) => {
    setBulkOperations(prev => prev.filter(op => op.id !== operation.id));
    enqueueSnackbar('Operation deleted successfully', { variant: 'success' });
  }, [enqueueSnackbar]);

  // Handle retry operation
  const handleRetryOperation = useCallback((operation: BulkOperation) => {
    // Reset operation status and retry
    setBulkOperations(prev => prev.map(op => 
      op.id === operation.id ? { 
        ...op, 
        status: 'pending',
        progress: 0,
        results: {
          totalProcessed: 0,
          successful: 0,
          failed: 0,
          errors: [],
          details: {}
        }
      } : op
    ));
    
    // Execute the operation
    handleBulkOperation(operation);
  }, [handleBulkOperation]);

  // Handle stop operation
  const handleStopOperation = useCallback((operation: BulkOperation) => {
    // Update operation status to failed
    setBulkOperations(prev => prev.map(op => 
      op.id === operation.id ? { 
        ...op, 
        status: 'failed',
        progress: 0
      } : op
    ));
    
    // Remove from running operations
    setRunningOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operation.id);
      return newSet;
    });
    
    enqueueSnackbar('Operation stopped', { variant: 'info' });
  }, [enqueueSnackbar]);

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
    if (!selectedMember) return;
    
    try {
      removeTeamMember.mutate({ memberId: selectedMember.id });
      setDeleteMemberDialogOpen(false);
      enqueueSnackbar('Team member removed successfully', { variant: 'success' });
      refetchTeamMembers();
    } catch (error) {
      console.error('Failed to remove team member:', error);
      enqueueSnackbar('Failed to remove team member', { variant: 'error' });
    }
  }, [selectedMember, removeTeamMember, enqueueSnackbar, refetchTeamMembers]);

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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Load data based on tab
    switch (newValue) {
      case 1: // Analytics
        loadAnalytics();
        break;
      case 2: // Audit Trail
        loadAuditLogs();
        break;
      case 3: // Templates
        loadTemplates();
        break;
      case 4: // Bulk Operations
        loadBulkOperations();
        break;
    }
  };

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
        <Typography variant="h4" component="h1">
          Team Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlined />}
            onClick={handleCSVExport}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadOutlined />}
            onClick={() => setShowCSVImport(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => {/* Handle invite */}}
          >
            Invite Member
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

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="team management tabs">
            <Tab label="Team Members" icon={<People />} />
            <Tab label="Analytics" icon={<Analytics />} />
            <Tab label="Audit Trail" icon={<History />} />
            <Tab label="Templates" icon={<Settings />} />
            <Tab label="Bulk Operations" icon={<PlaylistAdd />} />
          </Tabs>
        </Box>

        {/* Team Members Tab */}
        <TabPanel value={activeTab} index={0}>
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
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="table">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="grid">
                <ViewModule />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewQuilt />
              </ToggleButton>
            </ToggleButtonGroup>
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
                {filteredMembers.map((member) => (
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
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {member.firstName} {member.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.role}
                        color={member.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
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
                ))}
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
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={1}>
          {analytics ? (
            <Box>
              <Typography variant="h5" gutterBottom>Team Analytics</Typography>
              {/* Analytics content would go here */}
              <Typography>Analytics dashboard coming soon...</Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading analytics...
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Audit Trail Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" gutterBottom>Audit Trail</Typography>
          {auditLogs.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Actor</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Changes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={log.action} size="small" />
                      </TableCell>
                      <TableCell>{log.actorEmail}</TableCell>
                      <TableCell>{log.targetMemberEmail}</TableCell>
                      <TableCell>
                        {log.changes.length} changes
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No audit logs found.</Typography>
          )}
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h5" gutterBottom>Team Member Templates</Typography>
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{template.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label={template.role} size="small" />
                      <Chip label={template.category} size="small" sx={{ ml: 1 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Bulk Operations Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Bulk Operations</Typography>
            <Button
              variant="contained"
              startIcon={<PlaylistAdd />}
              onClick={() => setShowBulkOperations(true)}
            >
              Create New Operation
            </Button>
          </Box>
          
          {bulkOperations.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Operation</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bulkOperations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {operation.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {operation.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={operation.operation.replace('_', ' ')} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={operation.status} 
                          color={
                            operation.status === 'completed' ? 'success' : 
                            operation.status === 'running' ? 'warning' :
                            operation.status === 'failed' ? 'error' : 'default'
                          }
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={operation.progress} 
                            sx={{ width: 100 }}
                            color={
                              operation.status === 'completed' ? 'success' :
                              operation.status === 'failed' ? 'error' : 'primary'
                            }
                          />
                          <Typography variant="body2">
                            {operation.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {operation.createdAt.toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {operation.createdAt.toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {/* Execute/Stop Button */}
                          {operation.status === 'pending' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleBulkOperation(operation)}
                              startIcon={<PlayArrow />}
                              disabled={runningOperations.has(operation.id)}
                            >
                              Execute
                            </Button>
                          )}
                          
                          {operation.status === 'running' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleStopOperation(operation)}
                              startIcon={<Stop />}
                            >
                              Stop
                            </Button>
                          )}
                          
                          {operation.status === 'failed' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleRetryOperation(operation)}
                              startIcon={<Refresh />}
                            >
                              Retry
                            </Button>
                          )}
                          
                          {/* View Details Button - Always available */}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewOperationDetails(operation)}
                            startIcon={<Visibility />}
                          >
                            Details
                          </Button>
                          
                          {/* Edit Button - Only for pending operations */}
                          {operation.status === 'pending' && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => handleEditOperation(operation)}
                              startIcon={<Edit />}
                            >
                              Edit
                            </Button>
                          )}
                          
                          {/* Delete Button - Only for completed/failed operations */}
                          {(operation.status === 'completed' || operation.status === 'failed') && (
                            <Button
                              size="small"
                              variant="text"
                              color="error"
                              onClick={() => handleDeleteOperation(operation)}
                              startIcon={<Delete />}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <PlaylistAdd sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Bulk Operations Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first bulk operation to manage multiple team members at once.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PlaylistAdd />}
                  onClick={() => setShowBulkOperations(true)}
                >
                  Create New Operation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabPanel>
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

      {/* Bulk Operations Creation Dialog */}
      <Dialog open={showBulkOperations} onClose={() => setShowBulkOperations(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Bulk Operation</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Operation Name"
              placeholder="e.g., Update Engineering Team Roles"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              placeholder="Describe what this operation will do"
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Operation Type</InputLabel>
              <Select label="Operation Type">
                <MenuItem value="update_role">Update Roles</MenuItem>
                <MenuItem value="assign_license">Assign Licenses</MenuItem>
                <MenuItem value="change_status">Change Status</MenuItem>
                <MenuItem value="bulk_invite">Bulk Invite</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Bulk Operation Preview</AlertTitle>
              This operation will affect {selectedMembers.length} selected team members.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkOperations(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            // Create a sample bulk operation
            const newOperation = teamMemberTemplateService.createBulkOperation(
              'Sample Bulk Operation',
              'This is a sample bulk operation created from the UI',
              'update_role',
              { roles: ['member'] },
              'current-user'
            );
            setBulkOperations(prev => [newOperation, ...prev]);
            setShowBulkOperations(false);
            enqueueSnackbar('Bulk operation created successfully', { variant: 'success' });
          }}>
            Create Operation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Operation Details Dialog */}
      <Dialog open={showOperationDetails} onClose={() => setShowOperationDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>Operation Details</DialogTitle>
        <DialogContent>
          {selectedOperation && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedOperation.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedOperation.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Operation Type</Typography>
                  <Chip 
                    label={selectedOperation.operation.replace('_', ' ')} 
                    color="primary" 
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Status</Typography>
                  <Chip 
                    label={selectedOperation.status} 
                    color={
                      selectedOperation.status === 'completed' ? 'success' : 
                      selectedOperation.status === 'running' ? 'warning' :
                      selectedOperation.status === 'failed' ? 'error' : 'default'
                    }
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Progress</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedOperation.progress} 
                      sx={{ flex: 1 }}
                      color={
                        selectedOperation.status === 'completed' ? 'success' :
                        selectedOperation.status === 'failed' ? 'error' : 'primary'
                      }
                    />
                    <Typography variant="body2">
                      {selectedOperation.progress}%
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Created</Typography>
                  <Typography variant="body2">
                    {selectedOperation.createdAt.toLocaleString()}
                  </Typography>
                </Grid>
                
                {selectedOperation.completedAt && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Completed</Typography>
                    <Typography variant="body2">
                      {selectedOperation.completedAt.toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Created By</Typography>
                  <Typography variant="body2">
                    {selectedOperation.createdBy}
                  </Typography>
                </Grid>
                
                {selectedOperation.results && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Results</Typography>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography variant="h6" color="primary">
                              {selectedOperation.results.totalProcessed}
                            </Typography>
                            <Typography variant="caption">Total Processed</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="h6" color="success.main">
                              {selectedOperation.results.successful}
                            </Typography>
                            <Typography variant="caption">Successful</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="h6" color="error.main">
                              {selectedOperation.results.failed}
                            </Typography>
                            <Typography variant="caption">Failed</Typography>
                          </Grid>
                        </Grid>
                        
                        {selectedOperation.results.errors.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Errors</Typography>
                            <List dense>
                              {selectedOperation.results.errors.map((error, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={error.memberId}
                                    secondary={error.error}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Criteria</Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                        {JSON.stringify(selectedOperation.criteria, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOperationDetails(false)}>Close</Button>
          {selectedOperation && selectedOperation.status === 'pending' && (
            <Button 
              variant="contained" 
              onClick={() => {
                setShowOperationDetails(false);
                handleBulkOperation(selectedOperation);
              }}
              startIcon={<PlayArrow />}
            >
              Execute Now
            </Button>
          )}
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
    </Box>
  );
};

export default EnhancedTeamPage;
