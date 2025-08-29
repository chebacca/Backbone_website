import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
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
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import ContextualRoleManager from '../RoleManager/ContextualRoleManager';
import SyncStatusIndicator from '../Sync/SyncStatusIndicator';
import roleManagementService from '../../services/RoleManagementService';
import realtimeSyncService from '../../services/RealtimeSyncService';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  baseRole: 'ADMIN' | 'DO_ER' | 'GUEST';
  productionRoles: string[];
  isActive: boolean;
  assignedAt: string;
  assignmentId: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  status: string;
}

interface ProjectRoleManagementProps {
  project: Project;
  onTeamMemberUpdate?: (teamMembers: TeamMember[]) => void;
}

const ProjectRoleManagement: React.FC<ProjectRoleManagementProps> = ({
  project,
  onTeamMemberUpdate
}) => {
  // State management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [roleManagerOpen, setRoleManagerOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'ADMIN' | 'DO_ER' | 'GUEST'>('DO_ER');

  // Load team members and setup sync
  useEffect(() => {
    loadTeamMembers();
    
    // Setup real-time sync for role updates
    const unsubscribe = realtimeSyncService.onRoleUpdate((data) => {
      if (data.projectId === project.id) {
        console.log('🔄 [PROJECT ROLES] Real-time role update:', data);
        // Update local team member data
        setTeamMembers(prev => 
          prev.map(member => 
            member.id === data.teamMemberId 
              ? { ...member, baseRole: data.baseRole, productionRoles: data.productionRoles }
              : member
          )
        );
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [project.id]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call
      const mockTeamMembers: TeamMember[] = [
        {
          id: 'tm1',
          name: 'John Doe',
          email: 'john@example.com',
          baseRole: 'ADMIN',
          productionRoles: ['POST_COORDINATOR', 'EDITOR'],
          isActive: true,
          assignedAt: '2024-01-15',
          assignmentId: 'assign1'
        },
        {
          id: 'tm2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          baseRole: 'DO_ER',
          productionRoles: ['EDITOR', 'ASSISTANT_EDITOR'],
          isActive: true,
          assignedAt: '2024-01-20',
          assignmentId: 'assign2'
        },
        {
          id: 'tm3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          baseRole: 'GUEST',
          productionRoles: [],
          isActive: true,
          assignedAt: '2024-01-25',
          assignmentId: 'assign3'
        }
      ];
      
      setTeamMembers(mockTeamMembers);
      onTeamMemberUpdate?.(mockTeamMembers);
    } catch (err) {
      console.error('Error loading team members:', err);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  // Handle role management
  const handleManageRoles = (member: TeamMember) => {
    setSelectedMember(member);
    setRoleManagerOpen(true);
  };

  const handleRoleUpdate = async (teamMemberId: string, newRoles: string[]) => {
    try {
      // Update local state
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === teamMemberId 
            ? { ...member, productionRoles: newRoles }
            : member
        )
      );
      
      // Notify parent component
      const updatedMembers = teamMembers.map(member => 
        member.id === teamMemberId 
          ? { ...member, productionRoles: newRoles }
          : member
      );
      onTeamMemberUpdate?.(updatedMembers);
      
    } catch (error) {
      console.error('Error updating roles:', error);
      setError('Failed to update roles');
    }
  };

  // Handle adding new team member
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    
    try {
      setLoading(true);
      
      // Create project assignment via API
      const response = await roleManagementService.createProjectAssignment(
        project.id,
        newMemberEmail, // This would typically be a team member ID
        newMemberRole,
        []
      );
      
      if (response.success) {
        // Reload team members
        await loadTeamMembers();
        setAddMemberOpen(false);
        setNewMemberEmail('');
        setNewMemberRole('DO_ER');
      } else {
        setError(response.error || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      setError('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  // Handle removing team member
  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.name} from this project?`)) return;
    
    try {
      setLoading(true);
      
      const response = await roleManagementService.removeProjectAssignment(member.assignmentId);
      
      if (response.success) {
        await loadTeamMembers();
      } else {
        setError(response.error || 'Failed to remove team member');
      }
    } catch (error) {
      console.error('Error removing team member:', error);
      setError('Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  // Get role display color
  const getRoleColor = (role: 'ADMIN' | 'DO_ER' | 'GUEST') => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'DO_ER': return 'primary';
      case 'GUEST': return 'default';
      default: return 'default';
    }
  };

  // Get production role chips
  const getProductionRoleChips = (roles: string[]) => {
    if (roles.length === 0) {
      return <Chip label="No production roles" size="small" variant="outlined" />;
    }
    
    return (
      <Box display="flex" flexWrap="wrap" gap={0.5}>
        {roles.slice(0, 3).map((role) => (
          <Chip
            key={role}
            label={role.replace(/_/g, ' ')}
            size="small"
            color="secondary"
            variant="outlined"
          />
        ))}
        {roles.length > 3 && (
          <Chip
            label={`+${roles.length - 3} more`}
            size="small"
            color="info"
            variant="outlined"
          />
        )}
      </Box>
    );
  };

  if (loading && teamMembers.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <GroupIcon color="primary" />
              <Box>
                <Typography variant="h6">
                  Team & Role Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage team member access and production roles for {project.name}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <SyncStatusIndicator 
                organizationId={project.organizationId} 
                projectId={project.id}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddMemberOpen(true)}
                disabled={loading}
              >
                Add Team Member
              </Button>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Team Members Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team Member</TableCell>
                  <TableCell>Base Role</TableCell>
                  <TableCell>Production Roles</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon color="action" fontSize="small" />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.baseRole}
                        size="small"
                        color={getRoleColor(member.baseRole)}
                      />
                    </TableCell>
                    <TableCell>
                      {getProductionRoleChips(member.productionRoles)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={member.isActive ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(member.assignedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1}>
                        <Tooltip title="Manage Roles">
                          <IconButton
                            size="small"
                            onClick={() => handleManageRoles(member)}
                            disabled={loading}
                          >
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Permissions">
                          <IconButton size="small" disabled={loading}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove from Project">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveMember(member)}
                            disabled={loading || member.baseRole === 'ADMIN'}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {teamMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        No team members assigned to this project
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Project Stats */}
          <Box mt={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {teamMembers.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Team Members
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {teamMembers.filter(m => m.baseRole === 'ADMIN').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Project Admins
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {teamMembers.filter(m => m.isActive).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Members
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Role Manager Dialog */}
      <ContextualRoleManager
        open={roleManagerOpen}
        onClose={() => {
          setRoleManagerOpen(false);
          setSelectedMember(null);
        }}
        teamMember={selectedMember}
        projectId={project.id}
        onRoleUpdate={handleRoleUpdate}
      />

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Team Member to Project</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Team Member Email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              fullWidth
              placeholder="Enter team member email"
            />
            <FormControl fullWidth>
              <InputLabel>Base Role</InputLabel>
              <Select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as 'ADMIN' | 'DO_ER' | 'GUEST')}
                label="Base Role"
              >
                <MenuItem value="ADMIN">Admin - Full project control</MenuItem>
                <MenuItem value="DO_ER">Do-er - Standard project user</MenuItem>
                <MenuItem value="GUEST">Guest - Limited access</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">
              Production roles can be assigned after adding the team member to the project.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={!newMemberEmail.trim() || loading}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectRoleManagement;
