/**
 * 👥 Team Management Page - Streamlined Version
 * 
 * Clean implementation using only UnifiedDataService with full team management functionality.
 * No legacy API calls - pure streamlined architecture with all original features preserved.
 */

import React, { useMemo, useState } from 'react';
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
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Email,
  Block,
  CheckCircle,
  Schedule,
  Group,
  PersonAdd,
  AdminPanelSettings,
  Work,
  Star,
  Visibility,
  VisibilityOff,
  Send,
  Warning,
  Security,
  Info,
  People,
  Refresh,
  Phone,
  Badge,
  AccessTime,
  Assignment,
  Lock,
  VpnKey,
  Folder,
  Business,
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
import MetricCard from '@/components/common/MetricCard';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Team Member Roles - Organizational Level (from unified role system)
 * These roles determine access to the licensing system and basic permissions
 */
enum TeamMemberRole {
  VIEWER = 'viewer',    // Can view team and project info, limited access
  MEMBER = 'member',    // Standard team member with project access
  ADMIN = 'admin'       // Full administrative access to team management
}

// Use StreamlinedTeamMember from UnifiedDataService
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
// HELPER FUNCTIONS
// ============================================================================

// Safe display name with fallbacks - Using the same successful pattern as LicensesPage
const getDisplayName = (member: TeamMember): string => {
  if (!member) return 'Unknown User';
  
  // First, check if we have proper first and last names
  if (member.firstName && member.lastName) {
    return `${member.firstName} ${member.lastName}`;
  }
  
  // If we only have first name
  if (member.firstName) return member.firstName;
  
  // If we only have last name
  if (member.lastName) return member.lastName;
  
  // If we have an email, create a name from it (same logic as LicensesPage)
  if (member.email) {
    const emailParts = member.email.split('@');
    const username = emailParts[0];
    return username
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  return 'Unknown User';
};

// Safe initials with fallbacks - Using the same successful pattern as LicensesPage
const getUserInitials = (member: TeamMember): string => {
  if (!member) return '?';
  
  const displayName = getDisplayName(member);
  if (displayName === 'Unknown User') return '?';
  
  const words = displayName.split(' ');
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return displayName.charAt(0).toUpperCase();
};

// Helper function to get team member display name - same as LicensesPage
const getTeamMemberDisplayName = (member: TeamMember): string => {
  if (member.firstName && member.lastName) {
    return `${member.firstName} ${member.lastName}`;
  }
  if (member.firstName) return member.firstName;
  if (member.lastName) return member.lastName;
  return member.email.split('@')[0];
};

const getRoleColor = (role: TeamMember['role']) => {
  if (!role) return 'default';
  const roleLower = role.toLowerCase();
  switch (roleLower) {
    case 'owner': return 'error';
    case 'admin': return 'primary';
    case 'member': return 'info';
    case 'viewer': return 'default';
    default: return 'default';
  }
};

const getStatusColor = (status: TeamMember['status']) => {
  if (!status) return 'default';
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'active': return 'success';
    case 'pending': return 'warning';
    case 'suspended': return 'error';
    case 'removed': return 'default';
    default: return 'default';
  }
};

const getStatusIcon = (status: TeamMember['status']) => {
  if (!status) return <Group />;
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'active': return <CheckCircle />;
    case 'pending': return <Schedule />;
    case 'suspended': return <Block />;
    case 'removed': return <Delete />;
    default: return <Group />;
  }
};

const generateSecurePassword = (): string => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Helper function to check if current user can manage passwords for a team member
const canManagePassword = (currentUser: any, targetMember: TeamMember): boolean => {
  if (!currentUser || !targetMember) return false;
  
  const currentRole = currentUser.role?.toUpperCase();
  const targetRole = targetMember.role?.toUpperCase();
  
  // Enterprise users (account owners) can manage all passwords
  if (currentRole === 'ENTERPRISE_USER' || currentRole === 'OWNER') {
    return true;
  }
  
  // Admin can manage all passwords except enterprise users/owners
  if (currentRole === 'ADMIN' && targetRole !== 'ENTERPRISE_USER' && targetRole !== 'OWNER') {
    return true;
  }
  
  // Users can manage their own passwords
  return currentUser.id === targetMember.id;
};

// Helper function to get user's assigned projects
const getUserAssignedProjects = (member: TeamMember, allProjects: any[]): any[] => {
  if (!member.assignedProjects || !allProjects) return [];
  
  return allProjects.filter(project => 
    member.assignedProjects.includes(project.id)
  );
};



// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TeamPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // 🚀 STREAMLINED: Use UnifiedDataService hooks
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

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignLicenseDialogOpen, setAssignLicenseDialogOpen] = useState(false);

  
  // Form states - Enhanced for full user creation
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMemberRole>(TeamMemberRole.MEMBER);
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [invitePosition, setInvitePosition] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteTemporaryPassword, setInviteTemporaryPassword] = useState('');
  const [generatePassword, setGeneratePassword] = useState(true);
  const [activateImmediately, setActivateImmediately] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>(undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // License assignment states for invite dialog
  const [selectedInviteLicenseId, setSelectedInviteLicenseId] = useState('');
  
  // License assignment states
  const [selectedLicenseId, setSelectedLicenseId] = useState('');
  
  // Edit member form states
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRole, setEditRole] = useState<TeamMemberRole>(TeamMemberRole.MEMBER);
  const [editDepartment, setEditDepartment] = useState('');
  const [editSelectedLicenseId, setEditSelectedLicenseId] = useState('');
  const [editStatus, setEditStatus] = useState<TeamMember['status']>('pending');
  
  // Password management states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generateNewPassword, setGenerateNewPassword] = useState(true);

  // Combined loading and error states
  const isLoading = userLoading || orgLoading || teamLoading || licensesLoading || projectsLoading;
  const hasError = userError || orgError || teamError || licensesError || projectsError;

  // 🔐 PASSWORD GENERATION: Generate secure password on component mount
  React.useEffect(() => {
    if (generatePassword) {
      setInviteTemporaryPassword(generateSecurePassword());
    }
  }, [generatePassword]);

  // 🧮 COMPUTED TEAM DATA: Generate from real organization and license data
  // License and team refresh listeners
  React.useEffect(() => {
    const handleLicenseRefresh = async () => {
      await Promise.all([refetchLicenses(), refetchTeamMembers()]);
    };

    const handleTeamRefresh = async () => {
      await Promise.all([refetchTeamMembers(), refetchLicenses()]);
    };

    window.addEventListener('licenses:refresh', handleLicenseRefresh as EventListener);
    window.addEventListener('team:refresh', handleTeamRefresh as EventListener);
    
    return () => {
      window.removeEventListener('licenses:refresh', handleLicenseRefresh as EventListener);
      window.removeEventListener('team:refresh', handleTeamRefresh as EventListener);
    };
  }, [refetchLicenses, refetchTeamMembers]);

  const teamData = useMemo(() => {
    if (!currentUser || !orgContext || !teamMembers || !licenses) {
      return {
        members: [],
        stats: {
          totalMembers: 0,
          activeMembers: 0,
          pendingInvites: 0,
          availableLicenses: 0,
          totalLicenses: 0,
          assignedLicenses: 0,
        },
      };
    }

    // Debug: Log team member data summary
    console.log(`🔍 [TeamPage] Processing ${teamMembers.length} team members`);
    const sampleMember = teamMembers[0];
    if (sampleMember) {
      console.log('🔍 [TeamPage] Sample member:', {
        email: sampleMember.email,
        displayName: getDisplayName(sampleMember),
        firstName: sampleMember.firstName,
        lastName: sampleMember.lastName
      });
    }

    // Calculate stats from real team member and license data
    const activeMembers = teamMembers.filter(m => m.status?.toLowerCase() === 'active').length;
    const pendingInvites = teamMembers.filter(m => m.status?.toLowerCase() === 'pending').length;
    
    // License calculations
    const totalLicenses = licenses.length;
    const assignedLicenses = licenses.filter(l => l.assignedTo).length;
    const availableLicenses = licenses.filter(l => l.status === 'PENDING' && !l.assignedTo).length;



    const stats: TeamStats = {
      totalMembers: teamMembers.length,
      activeMembers,
      pendingInvites,
      availableLicenses,
      totalLicenses,
      assignedLicenses,
    };

    return { members: teamMembers, stats };
  }, [currentUser, orgContext, teamMembers, licenses]);

  // Note: License column removed - team members are licensed by default
  // But we still need this function for other parts of the code
  const getMemberLicenseAssignment = (member: TeamMember): { licenseId: string; licenseType: string; licenseKey: string; status: string } | null => {
    if (!member.licenseAssignment) return null;
    
    // Find the corresponding license to get the current status
    const assignedLicense = licenses?.find(license => license.id === member.licenseAssignment?.licenseId);
    
    return {
      licenseId: member.licenseAssignment.licenseId,
      licenseType: member.licenseAssignment.licenseType,
      licenseKey: member.licenseAssignment.licenseKey,
      status: assignedLicense?.status || 'UNKNOWN'
    };
  };

  // Helper function to get available licenses for assignment
  const getAvailableLicenses = () => {
    if (!licenses) return [];
    
    // Return licenses that are PENDING status and not assigned to anyone
    return licenses.filter(license => 
      license.status === 'PENDING' && !license.assignedTo
    );
  };

  // Helper function to get available licenses for reassignment (includes current license)
  const getAvailableLicensesForEdit = (currentMember?: TeamMember) => {
    if (!licenses) return [];
    
    const currentLicense = currentMember ? getMemberLicenseAssignment(currentMember) : null;
    
    return licenses.filter(license => {
      // Include PENDING licenses that are not assigned
      if (license.status === 'PENDING' && !license.assignedTo) {
        return true;
      }
      
      // Include the currently assigned license (so user can keep it)
      if (currentLicense && license.id === currentLicense.licenseId) {
        return true;
      }
      
      return false;
    });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    setSelectedMember(member);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedMember here as it might be needed for dialogs
    // setSelectedMember(undefined);
  };

  const handleInviteMember = async () => {
    // Enhanced validation
    if (!inviteEmail.trim()) {
      enqueueSnackbar('Please enter an email address', { variant: 'error' });
      return;
    }
    if (!inviteFirstName.trim()) {
      enqueueSnackbar('Please enter a first name', { variant: 'error' });
      return;
    }
    if (!inviteLastName.trim()) {
      enqueueSnackbar('Please enter a last name', { variant: 'error' });
      return;
    }
    if (!inviteTemporaryPassword.trim()) {
      enqueueSnackbar('Please provide a temporary password', { variant: 'error' });
      return;
    }

    if (getAvailableLicenses().length <= 0) {
      enqueueSnackbar('No available licenses. Please generate more licenses first.', { variant: 'error' });
      return;
    }

    if (!selectedInviteLicenseId) {
      enqueueSnackbar('Please select a license to assign to this team member', { variant: 'error' });
      return;
    }

    try {
      
      // 🔥 ENHANCED: Create full user with complete profile data
      const memberData: Omit<StreamlinedTeamMember, 'id' | 'createdAt' | 'updatedAt' | 'joinedAt'> = {
        firstName: inviteFirstName.trim(),
        lastName: inviteLastName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        status: activateImmediately ? 'active' : 'pending', // Activate immediately if requested
        organization: {
          id: currentUser?.organization?.id || '',
          name: currentUser?.organization?.name || '',
          tier: currentUser?.organization?.tier || 'BASIC',
        },
        department: inviteDepartment.trim() || '',
        assignedProjects: [],
        // Additional fields for full user creation
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(inviteFirstName + ' ' + inviteLastName)}&background=667eea&color=fff`,
      };



      // 🚀 CREATE FULL USER: This creates comprehensive team member records across all collections
      const memberId = await inviteTeamMember.mutate({
        ...memberData,
        // Pass additional data needed for Firebase user creation
        temporaryPassword: inviteTemporaryPassword,
        position: invitePosition.trim() || '',
        phone: invitePhone.trim() || '',
      } as any);
      
      console.log('✅ [TeamPage] Team member created with ID:', memberId);

      // 🔧 ENSURE PROJECT READINESS: Verify all collections are properly set up
      try {
        const { unifiedDataService } = await import('@/services/UnifiedDataService');
        const readinessCheck = await unifiedDataService.ensureTeamMemberProjectReadiness(memberId);
        
        if (readinessCheck.success) {
          console.log('✅ [TeamPage] Team member project readiness verified:', readinessCheck);
          if (readinessCheck.collectionsCreated.length > 0) {
            console.log('📝 [TeamPage] Created missing collections:', readinessCheck.collectionsCreated);
          }
        } else {
          console.warn('⚠️ [TeamPage] Team member project readiness issues:', readinessCheck.errors);
        }
      } catch (readinessError) {
        console.warn('⚠️ [TeamPage] Failed to verify project readiness:', readinessError);
        // Don't fail the invitation if readiness check fails
      }
      
      // 🎫 ASSIGN SELECTED LICENSE: Use the specifically selected license
      if (selectedInviteLicenseId && memberId) {
        try {
          await assignLicense.mutate({
            licenseId: selectedInviteLicenseId,
            userId: memberId
          });
          
          const selectedLicense = licenses?.find(l => l.id === selectedInviteLicenseId);
          console.log(`✅ [TeamPage] Assigned ${selectedLicense?.tier} license to new member:`, memberId);
        } catch (licenseError) {
          console.warn('Failed to assign selected license:', licenseError);
          // Don't fail the invitation if license assignment fails
        }
      }
      
      enqueueSnackbar(
        `Team member ${inviteFirstName} ${inviteLastName} created successfully with license assigned. Status: ${activateImmediately ? 'Active - ready to login' : 'Pending - requires activation'}.`, 
        { variant: 'success' }
      );
      
      // 🔧 ENHANCED REFRESH: Multiple refresh strategies to ensure data appears
      console.log('🔄 Refreshing team data after member creation...');
      
      // 1. Immediate refetch
      await Promise.all([refetchTeamMembers(), refetchLicenses()]);
      
      // 2. Force refresh using UnifiedDataService
      try {
        const { unifiedDataService } = await import('@/services/UnifiedDataService');
        await unifiedDataService.forceRefreshLicenses();
        console.log('🔄 Force refreshed team data via UnifiedDataService');
      } catch (error) {
        console.warn('⚠️ Failed to force refresh via UnifiedDataService:', error);
      }
      
      // 3. Force a small delay and refetch again (handles Firestore eventual consistency)
      setTimeout(async () => {
        console.log('🔄 Secondary refresh for eventual consistency...');
        await Promise.all([refetchTeamMembers(), refetchLicenses()]);
      }, 1000);
      
      // 4. Additional refresh after 3 seconds for extra safety
      setTimeout(async () => {
        console.log('🔄 Final refresh for safety...');
        await Promise.all([refetchTeamMembers(), refetchLicenses()]);
      }, 3000);
      
      // 5. Dispatch custom event for other components that might need to refresh
      window.dispatchEvent(new CustomEvent('team:refresh', { 
        detail: { action: 'member_created', memberId, licenseId: selectedInviteLicenseId } 
      }));
      
      // Reset form
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
      setInviteRole(TeamMemberRole.MEMBER);
      setInviteDepartment('');
      setInvitePosition('');
      setInvitePhone('');
      setInviteTemporaryPassword(generateSecurePassword()); // Generate new password for next invite
      setSelectedInviteLicenseId(''); // Reset license selection
      setActivateImmediately(false); // Reset activation setting
      setInviteDialogOpen(false);
    } catch (error: any) {
      console.error('❌ [TeamPage] Failed to create team member:', error);
      enqueueSnackbar(error?.message || 'Failed to create team member', { variant: 'error' });
    }
  };

  const handleEditMember = (member?: TeamMember) => {
    const memberToEdit = member || selectedMember;
    if (!memberToEdit) {

      enqueueSnackbar('Unable to load member data. Please try again.', { variant: 'error' });
      return;
    }
    

    
    // Close menu first to hide it
    handleMenuClose();
    
    // Set all state synchronously - ensure selectedMember is set properly
    setSelectedMember(memberToEdit);
    setEditFirstName(memberToEdit.firstName || '');
    setEditLastName(memberToEdit.lastName || '');
    setEditRole((memberToEdit.role as TeamMemberRole) || TeamMemberRole.MEMBER);
    setEditDepartment(memberToEdit.department || '');
    setEditStatus(memberToEdit.status || 'pending');
    
    // Set current license assignment
    const currentLicense = getMemberLicenseAssignment(memberToEdit);
    setEditSelectedLicenseId(currentLicense?.licenseId || '');
    
    // Reset password management states
    setShowPasswordSection(false);
    setNewPassword('');
    setConfirmPassword('');
    setGenerateNewPassword(true);
    
    // Open dialog immediately - no need for timeout since we're not clearing selectedMember in handleMenuClose
    setEditDialogOpen(true);
  };

  const handlePasswordChange = async () => {
    if (!selectedMember) {
      enqueueSnackbar('No team member selected', { variant: 'error' });
      return;
    }

    if (!canManagePassword(currentUser, selectedMember)) {
      enqueueSnackbar('You do not have permission to change this password', { variant: 'error' });
      return;
    }

    const passwordToUse = generateNewPassword ? generateSecurePassword() : newPassword;

    if (!generateNewPassword) {
      if (!passwordToUse.trim()) {
        enqueueSnackbar('Please enter a new password', { variant: 'error' });
        return;
      }
      if (passwordToUse !== confirmPassword) {
        enqueueSnackbar('Passwords do not match', { variant: 'error' });
        return;
      }
      if (passwordToUse.length < 8) {
        enqueueSnackbar('Password must be at least 8 characters long', { variant: 'error' });
        return;
      }
    }

    try {
      // Call the password change API
      await changeTeamMemberPassword.mutate({ 
        memberId: selectedMember.id, 
        newPassword: passwordToUse 
      });
      

      enqueueSnackbar(
        `Password ${generateNewPassword ? 'generated and ' : ''}updated successfully for ${getDisplayName(selectedMember)}`, 
        { variant: 'success' }
      );
      
      // Reset password form
      setShowPasswordSection(false);
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      console.error('❌ [TeamPage] Failed to update password:', error);
      enqueueSnackbar(error?.message || 'Failed to update password', { variant: 'error' });
    }
  };

  const handleDeleteMember = () => {
    if (!selectedMember) return;
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;

    try {
      // Check if member has a license that will be released
      const hasLicense = getMemberLicenseAssignment(selectedMember);
      
      // Remove the team member (this will automatically release their license)
      await removeTeamMember.mutate({ memberId: selectedMember.id });
      
      // Show appropriate success message
      if (hasLicense) {
        enqueueSnackbar(
          `${getDisplayName(selectedMember)} has been removed from the team. Their license has been released back to the available pool.`, 
          { variant: 'success' }
        );
      } else {
        enqueueSnackbar(
          `${getDisplayName(selectedMember)} has been removed from the team`, 
          { variant: 'success' }
        );
      }
      
      setDeleteDialogOpen(false);
      setSelectedMember(undefined);
      
      // Refresh data to show updated license availability
      await Promise.all([
        refetchTeamMembers(),
        refetchLicenses()
      ]);
    } catch (error: any) {
      console.error('❌ [TeamPage] Failed to remove team member:', error);
      enqueueSnackbar(error?.message || 'Failed to remove team member', { variant: 'error' });
    }
  };

  const handleResendInvite = () => {
    if (!selectedMember) return;
    enqueueSnackbar(`Invitation resent to ${selectedMember.email}`, { variant: 'success' });
    handleMenuClose();
  };

  const handleAssignLicenseToMember = async () => {
    if (!selectedMember || !selectedLicenseId) {
      enqueueSnackbar('Please select a valid license to assign', { variant: 'error' });
      return;
    }

    try {

      
      await assignLicense.mutate({
        licenseId: selectedLicenseId,
        userId: selectedMember.id
      });
      
              enqueueSnackbar(`License assigned to ${getDisplayName(selectedMember)}`, { variant: 'success' });
      setSelectedLicenseId('');
      setAssignLicenseDialogOpen(false);
      handleMenuClose();
      
      // Refresh data to show updated license assignment
      await Promise.all([
        refetchLicenses(),
        refetchTeamMembers()
      ]);
    } catch (error: any) {
      console.error('❌ [TeamPage] Failed to assign license:', error);
      enqueueSnackbar(error?.message || 'Failed to assign license', { variant: 'error' });
    }
  };

  const handleReleaseLicenseFromMember = async () => {
    if (!selectedMember) return;

    try {
      const licenseAssignment = getMemberLicenseAssignment(selectedMember);
      if (!licenseAssignment) {
        enqueueSnackbar('This team member has no license to release', { variant: 'warning' });
        return;
      }


      
      // Use the unassignLicense function to release the license
      await unassignLicense.mutate({ licenseId: licenseAssignment.licenseId });
      
      enqueueSnackbar(
        `${licenseAssignment.licenseType} license has been released from ${getDisplayName(selectedMember)} and is now available for reassignment.`, 
        { variant: 'success' }
      );
      
      handleMenuClose();
      
      // Refresh data to show updated license availability
      await Promise.all([
        refetchLicenses(),
        refetchTeamMembers()
      ]);
    } catch (error: any) {
      console.error('❌ [TeamPage] Failed to release license:', error);
      enqueueSnackbar(error?.message || 'Failed to release license', { variant: 'error' });
    }
  };

  const handleSaveMemberEdit = async () => {
    if (!selectedMember) return;

    try {
      // Update basic member information including status
      await updateTeamMember.mutate({
        memberId: selectedMember.id,
        updates: {
          firstName: editFirstName,
          lastName: editLastName,
          role: editRole,
          department: editDepartment || '',
          status: editStatus,
        }
      });

      // Handle license changes
      const currentLicense = getMemberLicenseAssignment(selectedMember);
      const currentLicenseId = currentLicense?.licenseId || '';
      
      if (editSelectedLicenseId !== currentLicenseId) {
        // License is being changed
        
        // First, unassign the current license if there is one
        if (currentLicenseId) {
          try {
            await unassignLicense.mutate({ licenseId: currentLicenseId });
            console.log('✅ [TeamPage] Released current license:', currentLicenseId);
          } catch (error) {
            console.warn('⚠️ [TeamPage] Failed to release current license:', error);
          }
        }
        
        // Then, assign the new license if one is selected
        if (editSelectedLicenseId) {
          try {
            await assignLicense.mutate({
              licenseId: editSelectedLicenseId,
              userId: selectedMember.id
            });
            
            const newLicense = licenses?.find(l => l.id === editSelectedLicenseId);
            console.log('✅ [TeamPage] Assigned new license:', editSelectedLicenseId, newLicense?.tier);
            
            enqueueSnackbar(
              `Team member ${editFirstName} ${editLastName} updated successfully with ${newLicense?.tier || 'new'} license assigned`, 
              { variant: 'success' }
            );
          } catch (error) {
            console.error('❌ [TeamPage] Failed to assign new license:', error);
            enqueueSnackbar('Member updated but license assignment failed', { variant: 'warning' });
          }
        } else {
          enqueueSnackbar(`Team member ${editFirstName} ${editLastName} updated successfully. License removed.`, { variant: 'success' });
        }
      } else {
        enqueueSnackbar(`Team member ${editFirstName} ${editLastName} updated successfully`, { variant: 'success' });
      }

      setEditDialogOpen(false);
      setSelectedMember(undefined);
      
      // Refresh both team members and licenses to show updated assignments
      await Promise.all([refetchTeamMembers(), refetchLicenses()]);
      
    } catch (error: any) {
      enqueueSnackbar(error?.message || 'Failed to update team member', { variant: 'error' });
    }
  };



  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Team Data...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching your team members and organization details
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
          <AlertTitle>Unable to Load Team Data</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            We encountered an issue loading your team information. This could be due to:
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
          <AlertTitle>Setting Up Team Management</AlertTitle>
          <Typography variant="body2">
            We're preparing your team management dashboard. This may take a moment for new accounts.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // ============================================================================
  // MAIN TEAM CONTENT
  // ============================================================================

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Team Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your {orgContext.organization?.name || 'Organization'} team members and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setInviteDialogOpen(true)}
          disabled={getAvailableLicenses().length <= 0}
          sx={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
            color: '#000',
            fontWeight: 600,
          }}
        >
          Invite Member
        </Button>
      </Box>

      {/* Team Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Members"
            value={teamData.stats.totalMembers}
            icon={<Group />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Members"
            value={teamData.stats.activeMembers}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Invites"
            value={teamData.stats.pendingInvites}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Available Licenses"
            value={`${teamData.stats.availableLicenses}/${teamData.stats.totalLicenses}`}
            icon={<Star />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* License Availability Alert */}
      {teamData.stats.availableLicenses <= 0 && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <AlertTitle>No Available Licenses</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You need to generate more licenses to invite new team members. Go to the Licenses page to create additional licenses.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" size="small" onClick={() => window.open('/dashboard/licenses', '_blank')}>
              Generate Licenses
            </Button>
            <Button variant="outlined" size="small" onClick={() => window.open('/dashboard/billing', '_blank')}>
              Upgrade Plan
            </Button>
          </Box>
        </Alert>
      )}

      {/* Team Members Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Team Members ({teamData.members.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Star />}
              onClick={() => window.open('/dashboard/licenses', '_blank')}
            >
              Manage Licenses
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Active</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.members.filter(member => member && member.id && member.email).map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={member.avatar}
                          sx={{ width: 40, height: 40 }}
                        >
                          {getUserInitials(member)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {getDisplayName(member)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.role?.toUpperCase() || 'UNKNOWN'}
                        color={getRoleColor(member.role) as any}
                        size="small"
                        icon={member.role?.toLowerCase() === 'admin' ? <AdminPanelSettings /> : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(member.status)}
                        label={member.status?.toUpperCase() || 'UNKNOWN'}
                        color={getStatusColor(member.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.department && member.department.trim() !== '' ? member.department : 'Unassigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {member.lastActive ? (() => {
                          try {
                            const lastActiveDate = member.lastActive instanceof Date ? member.lastActive : new Date(member.lastActive);
                            // Check if the date is valid
                            if (isNaN(lastActiveDate.getTime())) {
                              return 'Never';
                            }
                            return lastActiveDate.toLocaleDateString();
                          } catch (error) {
                            console.warn('Invalid lastActive date for member:', member.email, member.lastActive);
                            return 'Never';
                          }
                        })() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuClick(event, member)}
                        disabled={member.role?.toLowerCase() === 'owner' && member.id === currentUser?.id}
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
        }}
        onClick={() => setInviteDialogOpen(true)}
        disabled={getAvailableLicenses().length <= 0}
      >
        <Add />
      </Fab>

      {/* Enhanced Invite Member Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonAdd />
            Create New Team Member
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            
            {/* Personal Information Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge /> Personal Information
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="john.doe@company.com"
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Phone Number (Optional)"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Role & Department Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work /> Role & Department
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={inviteRole}
                    label="Role"
                    onChange={(e) => setInviteRole(e.target.value as TeamMemberRole)}
                  >
                    <MenuItem value={TeamMemberRole.VIEWER}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Viewer</Typography>
                        <Typography variant="caption" color="text.secondary">Read-only access to projects</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value={TeamMemberRole.MEMBER}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Member</Typography>
                        <Typography variant="caption" color="text.secondary">Standard project access</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value={TeamMemberRole.ADMIN}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Admin</Typography>
                        <Typography variant="caption" color="text.secondary">Full organizational access</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Department"
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  placeholder="Engineering, Design, Marketing..."
                />
              </Box>

              <TextField
                fullWidth
                label="Position/Title (Optional)"
                value={invitePosition}
                onChange={(e) => setInvitePosition(e.target.value)}
                placeholder="Senior Developer, Product Manager..."
              />
            </Box>

            {/* Authentication Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security /> Authentication
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={generatePassword}
                    onChange={(e) => setGeneratePassword(e.target.checked)}
                  />
                }
                label="Auto-generate secure password"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Temporary Password"
                type="password"
                value={inviteTemporaryPassword}
                onChange={(e) => setInviteTemporaryPassword(e.target.value)}
                disabled={generatePassword}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <MuiIconButton
                        onClick={() => setInviteTemporaryPassword(generateSecurePassword())}
                        disabled={!generatePassword}
                      >
                        <Refresh />
                      </MuiIconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={generatePassword ? "Password will be auto-generated" : "User will need this password to login initially"}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={activateImmediately}
                    onChange={(e) => setActivateImmediately(e.target.checked)}
                  />
                }
                label="Activate team member immediately"
                sx={{ mb: 1 }}
              />
              
              <Alert severity={activateImmediately ? "success" : "info"} sx={{ mt: 1 }}>
                <Typography variant="body2">
                  {activateImmediately ? (
                    <>
                      <strong>✅ Active Status:</strong> Team member will be created with "active" status and can login immediately with their credentials.
                    </>
                  ) : (
                    <>
                      <strong>⏳ Pending Status:</strong> Team member will be created with "pending" status and will need to be activated later through the edit dialog.
                    </>
                  )}
                </Typography>
              </Alert>
            </Box>

            {/* License Assignment Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star /> License Assignment
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select License to Assign</InputLabel>
                <Select
                  value={selectedInviteLicenseId}
                  label="Select License to Assign"
                  onChange={(e) => setSelectedInviteLicenseId(e.target.value as string)}
                  required
                >
                  {getAvailableLicenses().length === 0 ? (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        No available licenses found
                      </Typography>
                    </MenuItem>
                  ) : (
                    getAvailableLicenses().map((license) => (
                      <MenuItem key={license.id} value={license.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Star color="primary" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {license.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {license.tier} • {license.key} • Expires {new Date(license.expiresAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Only unassigned PENDING licenses are available for assignment
                </Typography>
              </FormControl>

              <Alert severity="info">
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  🎫 License Assignment Details
                </Typography>
                <Typography variant="body2">
                  This team member will be created as a full Firebase authenticated user and assigned the selected license.
                  They can login immediately with their email and temporary password.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                  Available licenses: {teamData.stats.availableLicenses} of {teamData.stats.totalLicenses}
                </Typography>
              </Alert>
            </Box>

            {getAvailableLicenses().length <= 0 && (
              <Alert severity="warning">
                <Typography variant="body2">
                  No licenses available! Please generate more licenses before creating team members.
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInviteMember}
            variant="contained"
            startIcon={<PersonAdd />}
            disabled={getAvailableLicenses().length <= 0 || !selectedInviteLicenseId}
          >
            Create Team Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Edit Member Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMember(undefined);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Edit />
            🚀 ENHANCED Edit Team Member: {selectedMember?.firstName || 'Loading...'} {selectedMember?.lastName || ''}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMember ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              
              {/* Personal Information Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge /> Personal Information
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                    placeholder="John"
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                    placeholder="Doe"
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={selectedMember.email}
                  disabled
                  sx={{ mb: 2 }}
                  helperText="Email cannot be changed after account creation"
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  value=""
                  disabled
                  placeholder="+1 (555) 123-4567"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Phone number not available in current data model"
                />
              </Box>

              {/* Role & Department Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work /> Role & Department
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={editRole}
                      label="Role"
                      onChange={(e) => setEditRole(e.target.value as TeamMemberRole)}
                    >
                      <MenuItem value={TeamMemberRole.VIEWER}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Viewer</Typography>
                          <Typography variant="caption" color="text.secondary">Read-only access to projects</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={TeamMemberRole.MEMBER}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Member</Typography>
                          <Typography variant="caption" color="text.secondary">Standard project access</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={TeamMemberRole.ADMIN}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>Admin</Typography>
                          <Typography variant="caption" color="text.secondary">Full organizational access</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Department"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="Engineering, Design, Marketing..."
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Position/Title"
                  value=""
                  disabled
                  placeholder="Senior Developer, Product Manager..."
                  helperText="Position not available in current data model"
                />
              </Box>

              {/* License & Access Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star /> License & Access
                </Typography>
                
                {/* License Assignment Selector */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Assign License</InputLabel>
                  <Select
                    value={editSelectedLicenseId}
                    label="Assign License"
                    onChange={(e) => setEditSelectedLicenseId(e.target.value as string)}
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule color="disabled" />
                        <Typography variant="body2" color="text.secondary">
                          No License (Remove current license)
                        </Typography>
                      </Box>
                    </MenuItem>
                    {getAvailableLicensesForEdit(selectedMember).map((license) => {
                      const isCurrentLicense = getMemberLicenseAssignment(selectedMember)?.licenseId === license.id;
                      return (
                        <MenuItem key={license.id} value={license.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Star color={isCurrentLicense ? "primary" : "action"} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: isCurrentLicense ? 600 : 400 }}>
                                {license.name} {isCurrentLicense && '(Current)'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {license.tier} • {license.key} • Expires {new Date(license.expiresAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    You can reassign licenses between team members. Released licenses return to the available pool.
                  </Typography>
                </FormControl>

                {/* Current License Status Display */}
                {(() => {
                   const licenseAssignment = getMemberLicenseAssignment(selectedMember);
                   const selectedLicense = licenses?.find(l => l.id === editSelectedLicenseId);
                   const isChanging = editSelectedLicenseId !== (licenseAssignment?.licenseId || '');
                   
                   return (
                     <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                       <TextField
                         fullWidth
                         label="Current License"
                         value={licenseAssignment?.licenseType || 'None'}
                         disabled
                         InputProps={{
                           startAdornment: (
                             <InputAdornment position="start">
                               <Star />
                             </InputAdornment>
                           ),
                         }}
                       />
                       
                       <TextField
                         fullWidth
                         label="License Status"
                         value={licenseAssignment ? licenseAssignment.status : 'Unassigned'}
                         disabled
                         InputProps={{
                           startAdornment: (
                             <InputAdornment position="start">
                               {licenseAssignment ? <CheckCircle /> : <Schedule />}
                             </InputAdornment>
                           ),
                         }}
                       />
                     </Box>
                   );
                 })()}

                {/* License Change Preview */}
                {(() => {
                  const currentLicense = getMemberLicenseAssignment(selectedMember);
                  const selectedLicense = licenses?.find(l => l.id === editSelectedLicenseId);
                  const isChanging = editSelectedLicenseId !== (currentLicense?.licenseId || '');
                  
                  if (isChanging) {
                    return (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          🔄 License Change Preview
                        </Typography>
                        <Typography variant="body2">
                          {currentLicense ? (
                            <>
                              <strong>Current:</strong> {currentLicense.licenseType} ({currentLicense.licenseKey})
                              <br/>
                            </>
                          ) : (
                            <>
                              <strong>Current:</strong> No license assigned
                              <br/>
                            </>
                          )}
                          <strong>New:</strong> {selectedLicense ? `${selectedLicense.tier} (${selectedLicense.key})` : 'No license (will be removed)'}
                        </Typography>
                        {currentLicense && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            The current license will be released back to the available pool.
                          </Typography>
                        )}
                      </Alert>
                    );
                  }
                  return null;
                })()}

                <TextField
                  fullWidth
                  label="Last Active"
                  value={selectedMember.lastActive ? new Date(selectedMember.lastActive).toLocaleString() : 'Never'}
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

              {/* Project Assignments Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Folder /> Project Assignments
                </Typography>
                
                {(() => {
                  const assignedProjects = getUserAssignedProjects(selectedMember, userProjects || []);
                  return assignedProjects.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {assignedProjects.map((project) => (
                          <Chip
                            key={project.id}
                            label={project.name}
                            color="primary"
                            variant="outlined"
                            size="small"
                            icon={<Folder />}
                            sx={{ maxWidth: 200 }}
                          />
                        ))}
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Project Details:</strong>
                        </Typography>
                        {assignedProjects.map((project) => (
                          <Box key={project.id} sx={{ mb: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {project.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Mode: {project.mode} • Storage: {project.storageBackend} • Status: {project.status}
                            </Typography>
                            {project.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {project.description}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      <Typography variant="body2">
                        No projects assigned yet. This team member can be assigned to projects from the Cloud Projects page.
                      </Typography>
                    </Alert>
                  );
                })()}
              </Box>

              {/* Account Status Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security /> Account Status
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Account Status</InputLabel>
                    <Select
                      value={editStatus}
                      label="Account Status"
                      onChange={(e) => setEditStatus(e.target.value as TeamMember['status'])}
                      startAdornment={
                        <InputAdornment position="start">
                          {getStatusIcon(editStatus)}
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="active">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle color="success" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Active</Typography>
                            <Typography variant="caption" color="text.secondary">Can login and access all assigned resources</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="pending">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule color="warning" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Pending</Typography>
                            <Typography variant="caption" color="text.secondary">Awaiting activation or first login</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="suspended">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Block color="error" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Suspended</Typography>
                            <Typography variant="caption" color="text.secondary">Temporarily blocked from access</Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Member Since"
                    value={selectedMember.joinedAt ? new Date(selectedMember.joinedAt).toLocaleDateString() : 'Unknown'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Group />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {/* Status Change Alert */}
                {editStatus !== selectedMember.status && (
                  <Alert severity={editStatus?.toLowerCase() === 'active' ? 'success' : editStatus?.toLowerCase() === 'suspended' ? 'warning' : 'info'} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      🔄 Status Change Preview
                    </Typography>
                    <Typography variant="body2">
                      <strong>Current:</strong> {selectedMember.status?.toUpperCase()}<br/>
                      <strong>New:</strong> {editStatus?.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      {editStatus?.toLowerCase() === 'active' && 'Team member will be able to login and access all assigned resources.'}
                      {editStatus?.toLowerCase() === 'pending' && 'Team member will need to be activated before they can access resources.'}
                      {editStatus?.toLowerCase() === 'suspended' && 'Team member will be blocked from accessing any resources.'}
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Password Management Section */}
              {canManagePassword(currentUser, selectedMember) && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lock /> Password Management
                  </Typography>
                  
                  {!showPasswordSection ? (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>🔐 Password Access</strong>
                        </Typography>
                        <Typography variant="body2">
                          {currentUser?.id === selectedMember.id 
                            ? "You can change your own password here."
                            : (currentUser?.role === 'ENTERPRISE_USER' || currentUser?.role?.toLowerCase() === 'owner')
                              ? "As the account owner, you can change this team member's password."
                              : "As an admin, you can change this team member's password."
                          }
                        </Typography>
                      </Alert>
                      <Button
                        variant="outlined"
                        startIcon={<VpnKey />}
                        onClick={() => setShowPasswordSection(true)}
                        sx={{ mb: 2 }}
                      >
                        Change Password
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Alert severity="warning">
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          🔐 Password Change
                        </Typography>
                        <Typography variant="body2">
                          {generateNewPassword 
                            ? "A secure password will be automatically generated."
                            : "Please enter a new password with at least 8 characters."
                          }
                        </Typography>
                      </Alert>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generateNewPassword}
                            onChange={(e) => setGenerateNewPassword(e.target.checked)}
                          />
                        }
                        label="Auto-generate secure password"
                      />

                      {!generateNewPassword && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 8 characters)"
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            error={confirmPassword !== '' && newPassword !== confirmPassword}
                            helperText={confirmPassword !== '' && newPassword !== confirmPassword ? "Passwords do not match" : ""}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<VpnKey />}
                          onClick={handlePasswordChange}
                          disabled={changeTeamMemberPassword.loading}
                          sx={{
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        >
                          {changeTeamMemberPassword.loading 
                            ? 'Updating...' 
                            : generateNewPassword 
                              ? 'Generate & Update Password' 
                              : 'Update Password'
                          }
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setShowPasswordSection(false);
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Information Alert */}
              <Alert severity="info">
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  ⚠️ Important Notes
                </Typography>
                <Typography variant="body2">
                  • Role changes will immediately affect the member's permissions and access levels<br/>
                  • Department information helps with organization and project assignments<br/>
                  • Project assignments are managed from the Cloud Projects page<br/>
                  • License assignments are managed through the Licenses page<br/>
                  {canManagePassword(currentUser, selectedMember) && "• Password changes take effect immediately"}
                </Typography>
              </Alert>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Box textAlign="center">
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Loading member data...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If this persists, please close and try again.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveMemberEdit}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Remove Team Member</DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to remove <strong>{getDisplayName(selectedMember)}</strong> from your team?
              </Typography>
              
              {(() => {
                const hasLicense = getMemberLicenseAssignment(selectedMember);
                return hasLicense ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      🎫 License Management
                    </Typography>
                    <Typography variant="body2">
                      This team member currently has a <strong>{hasLicense.licenseType}</strong> license assigned. 
                      When removed, their license will be automatically released back to your available license pool 
                      and can be reassigned to another team member.
                    </Typography>
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      This team member has no license assigned, so no license will be affected.
                    </Typography>
                  </Alert>
                );
              })()}
              
              <Alert severity="warning">
                <Typography variant="body2">
                  This action cannot be undone. The member will lose access to all projects and resources.
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
            Remove Member
          </Button>
        </DialogActions>
      </Dialog>



      {/* Member Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditMember(selectedMember)}>
          <ListItemIcon><Edit /></ListItemIcon>
          Edit Member
        </MenuItem>
        {(() => {
          if (!selectedMember) return null;
          const hasLicense = getMemberLicenseAssignment(selectedMember);
          return !hasLicense ? (
            <MenuItem onClick={() => setAssignLicenseDialogOpen(true)}>
              <ListItemIcon><Star /></ListItemIcon>
              Assign License
            </MenuItem>
          ) : (
            <MenuItem onClick={handleReleaseLicenseFromMember}>
              <ListItemIcon><VpnKey /></ListItemIcon>
              Release License
            </MenuItem>
          );
        })()}
        {selectedMember?.status?.toLowerCase() === 'pending' && (
          <MenuItem onClick={handleResendInvite}>
            <ListItemIcon><Email /></ListItemIcon>
            Resend Invite
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDeleteMember} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete sx={{ color: 'error.main' }} /></ListItemIcon>
          Remove Member
        </MenuItem>
      </Menu>

      {/* Manual License Assignment Dialog */}
      <Dialog
        open={assignLicenseDialogOpen}
        onClose={() => setAssignLicenseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Star />
            Assign License to {selectedMember ? getDisplayName(selectedMember) : 'Team Member'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            
            <Alert severity="info">
              <Typography variant="body2">
                Assigning a license to <strong>{selectedMember ? getDisplayName(selectedMember) : 'Team Member'}</strong> ({selectedMember?.email})
              </Typography>
            </Alert>
            
            <FormControl fullWidth>
              <InputLabel>Select License</InputLabel>
                             <Select
                 value={selectedLicenseId}
                 label="Select License"
                 onChange={(e) => setSelectedLicenseId(e.target.value as string)}
               >
                {licenses?.filter(l => l.status === 'PENDING' && !l.assignedTo).map((license) => (
                  <MenuItem key={license.id} value={license.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star color="primary" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {license.tier} License
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {license.key} • Expires {new Date(license.expiresAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Only unassigned PENDING licenses are available for assignment
              </Typography>
            </FormControl>

            {licenses?.filter(l => l.status === 'PENDING' && !l.assignedTo).length === 0 && (
              <Alert severity="warning">
                <Typography variant="body2">
                  No available licenses found. All licenses are either assigned or not in PENDING status.
                </Typography>
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              The selected license will be assigned to this team member and they will have immediate access to the system.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignLicenseDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignLicenseToMember}
            variant="contained"
            startIcon={<Star />}
            disabled={!selectedLicenseId || licenses?.filter(l => l.status === 'PENDING' && !l.assignedTo).length === 0}
          >
            Assign License
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamPage;
