/**
 * 🎯 Streamlined Team Management Component
 * 
 * Example component showing how to use the new streamlined data architecture.
 * This replaces the complex TeamPage component with a much simpler implementation
 * that uses embedded data and smart caching.
 * 
 * Key improvements:
 * - Single API call gets all needed data
 * - Embedded relationships eliminate complex joins
 * - Smart caching reduces redundant requests
 * - Consistent loading and error states
 * - Optimistic updates for better UX
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Skeleton,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

import { 
  useOrganizationContext,
  useUpdateUser,
  useUserPermissions,
  useOptimisticUpdate
} from '../hooks/useStreamlinedData';
import { StreamlinedUser } from '../services/UnifiedDataService';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getRoleColor = (userType: string, role: string): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
  if (userType === 'ACCOUNT_OWNER') return 'success';
  if (role === 'ADMIN') return 'primary';
  if (role === 'MEMBER') return 'secondary';
  if (role === 'VIEWER') return 'info';
  return 'default';
};

const getLicenseColor = (licenseType: string): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
  if (licenseType === 'ENTERPRISE') return 'success';
  if (licenseType === 'PROFESSIONAL') return 'primary';
  if (licenseType === 'BASIC') return 'secondary';
  return 'default';
};

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface TeamMemberFormData {
  name: string;
  email: string;
  userType: 'ACCOUNT_OWNER' | 'TEAM_MEMBER' | 'ADMIN' | 'ACCOUNTING';
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  department: string;
  licenseType: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
}

interface TeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  member?: StreamlinedUser;
  onSave: (memberData: Partial<StreamlinedUser>) => void;
}

// ============================================================================
// TEAM MEMBER DIALOG
// ============================================================================

const TeamMemberDialog: React.FC<TeamMemberDialogProps> = ({
  open,
  onClose,
  member,
  onSave
}) => {
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: member?.name || '',
    email: member?.email || '',
    userType: (member?.userType as 'ACCOUNT_OWNER' | 'TEAM_MEMBER' | 'ADMIN' | 'ACCOUNTING') || 'TEAM_MEMBER',
    role: (member?.role as 'ADMIN' | 'MEMBER' | 'VIEWER') || 'MEMBER',
    department: member?.teamMemberData?.department || '',
    licenseType: (member?.license?.type as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE') || 'BASIC'
  });

  const handleSave = () => {
    onSave({
      name: formData.name,
      email: formData.email,
      userType: formData.userType,
      role: formData.role,
      teamMemberData: {
        managedBy: member?.teamMemberData?.managedBy || 'UNASSIGNED',
        department: formData.department,
        assignedProjects: member?.teamMemberData?.assignedProjects || []
      },
      license: {
        type: formData.licenseType,
        status: member?.license?.status || 'ACTIVE',
        permissions: member?.license?.permissions || [],
        canCreateProjects: member?.license?.canCreateProjects || false,
        canManageTeam: member?.license?.canManageTeam || false
      }
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {member ? 'Edit Team Member' : 'Add Team Member'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            fullWidth
          />
          <TextField
            label="User Type"
            select
            value={formData.userType}
            onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'ACCOUNT_OWNER' | 'TEAM_MEMBER' | 'ADMIN' | 'ACCOUNTING' })}
            fullWidth
          >
            <MenuItem value="TEAM_MEMBER">Team Member</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>
          <TextField
            label="Role"
            select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER' })}
            fullWidth
          >
            <MenuItem value="MEMBER">Member</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="VIEWER">Viewer</MenuItem>
          </TextField>
          <TextField
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            fullWidth
          />
          <TextField
            label="License Type"
            select
            value={formData.licenseType}
            onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' })}
            fullWidth
          >
            <MenuItem value="BASIC">Basic</MenuItem>
            <MenuItem value="PROFESSIONAL">Professional</MenuItem>
            <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {member ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const StreamlinedTeamManagement: React.FC = () => {
  // ============================================================================
  // HOOKS - Single call gets all data needed
  // ============================================================================
  
  const { data: orgContext, loading, error, refetch } = useOrganizationContext();
  const { mutate: updateUser, loading: updating } = useUpdateUser();
  const permissions = useUserPermissions();
  
  // ============================================================================
  // LOCAL STATE
  // ============================================================================
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StreamlinedUser | undefined>();
  
  // ============================================================================
  // OPTIMISTIC UPDATES
  // ============================================================================
  
  const [optimisticMembers, setOptimisticMembers] = useState<StreamlinedUser[]>([]);
  const revertOptimisticUpdate = useOptimisticUpdate(
    orgContext?.members || [],
    setOptimisticMembers
  );

  // Use optimistic data if available, otherwise use real data
  const displayMembers = optimisticMembers.length > 0 ? optimisticMembers : (orgContext?.members || []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleAddMember = () => {
    setSelectedMember(undefined);
    setDialogOpen(true);
  };

  const handleEditMember = (member: StreamlinedUser) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  const handleSaveMember = async (memberData: Partial<StreamlinedUser>) => {
    if (!selectedMember) {
      // TODO: Implement create new member
      console.log('Create new member:', memberData);
      return;
    }

    // Optimistic update
    const revert = revertOptimisticUpdate((members) =>
      members.map(m => m.id === selectedMember.id ? { ...m, ...memberData } : m)
    );

    try {
      await updateUser({
        userId: selectedMember.id,
        updates: memberData
      });
      
      // Refresh data to get latest from server
      refetch();
    } catch (error) {
      // Revert optimistic update on error
      revert();
      console.error('Failed to update member:', error);
    }
  };

  const handleDeleteMember = async (member: StreamlinedUser) => {
    if (!confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      return;
    }

    // Optimistic update
    const revert = revertOptimisticUpdate((members) =>
      members.filter(m => m.id !== member.id)
    );

    try {
      await updateUser({
        userId: member.id,
        updates: { status: 'INACTIVE' }
      });
      
      refetch();
    } catch (error) {
      revert();
      console.error('Failed to remove member:', error);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getRoleColor = (userType: string, role: string) => {
    if (userType === 'ACCOUNT_OWNER') return 'primary';
    if (role === 'ADMIN') return 'secondary';
    return 'default';
  };

  const getLicenseColor = (licenseType: string) => {
    switch (licenseType) {
      case 'ENTERPRISE': return 'error';
      case 'PROFESSIONAL': return 'warning';
      case 'BASIC': return 'info';
      default: return 'default';
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={refetch} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Organization Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5" component="h1">
              {orgContext?.organization?.name}
            </Typography>
            <Chip 
              label={orgContext?.organization?.tier} 
              color="primary" 
              sx={{ ml: 2 }} 
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Members
              </Typography>
              <Typography variant="h6">
                {orgContext?.organization?.usage?.totalUsers || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Subscription Status
              </Typography>
              <Chip 
                label={orgContext?.subscription?.status || 'Unknown'} 
                color={orgContext?.subscription?.status === 'ACTIVE' ? 'success' : 'warning'}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Seats Used
              </Typography>
              <Typography variant="h6">
                {orgContext?.subscription?.plan?.seats || 0} / {orgContext?.organization?.usage?.totalUsers || 0}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2">
              Team Members
            </Typography>
            {permissions.canManageTeam && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddMember}
                disabled={updating}
              >
                Add Member
              </Button>
            )}
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>License</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  {permissions.canManageTeam && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {member.name}
                      </Box>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={member.userType === 'ACCOUNT_OWNER' ? 'Owner' : member.role}
                        color={getRoleColor(member.userType, member.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.license?.type || 'None'}
                        color={getLicenseColor(member.license?.type || '') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {member.teamMemberData?.department || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
                        color={member.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    {permissions.canManageTeam && (
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditMember(member)}
                          disabled={updating}
                        >
                          <EditIcon />
                        </IconButton>
                        {member.userType !== 'ACCOUNT_OWNER' && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMember(member)}
                            disabled={updating}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Team Member Dialog */}
      <TeamMemberDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        member={selectedMember}
        onSave={handleSaveMember}
      />
    </Box>
  );
};

export default StreamlinedTeamManagement;
