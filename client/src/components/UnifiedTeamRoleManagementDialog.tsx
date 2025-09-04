/**
 * Unified Team & Role Management Dialog
 * 
 * This component combines team member management and role management into a single,
 * user-friendly wizard-style interface. It replaces the separate "Add Team Member"
 * and "Manage Roles" buttons with a unified experience.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Paper
} from '@mui/material';

import {
  Close as CloseIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Dashboard as RoleIcon,
  Search as SearchIcon,
  Check as CheckIcon
} from '@mui/icons-material';

import { projectRoleService, ProjectRole } from '../services/ProjectRoleService';
import { getAllEnhancedTemplates, searchTemplates, EnhancedIndustryType } from './EnhancedRoleTemplates';

interface TeamMember {
  id: string;
  teamMemberId: string;
  name: string;
  email: string;
  tier: string;
  assignedAt: Date;
  currentRole?: ProjectRole;
}

interface UnifiedTeamRoleManagementDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  organizationId: string;
}

type TabValue = 'team' | 'roles';
type TeamAction = 'add' | 'assign' | 'manage';

const UnifiedTeamRoleManagementDialog: React.FC<UnifiedTeamRoleManagementDialogProps> = ({
  open,
  onClose,
  projectId,
  projectName,
  organizationId
}) => {
  // Helper function to get Firebase auth token
  const getFirebaseToken = async () => {
    try {
      // Method 1: Try to get Firebase ID token from localStorage first
      const firebaseIdToken = localStorage.getItem('firebase_id_token');
      if (firebaseIdToken && firebaseIdToken.length > 10) {
        console.log('🔑 [UnifiedTeamRole] Using stored Firebase ID token');
        return firebaseIdToken;
      }

      // Method 2: Try to get from Firebase Auth service
      if (typeof window !== 'undefined' && (window as any).firebaseAuthService) {
        try {
          const token = await (window as any).firebaseAuthService.getIdToken();
          if (token) {
            console.log('🔑 [UnifiedTeamRole] Using Firebase Auth service token');
            return token;
          }
        } catch (error) {
          console.warn('⚠️ [UnifiedTeamRole] Firebase Auth service failed:', error);
        }
      }

      // Method 3: Try to get from team member auth service
      if (typeof window !== 'undefined' && (window as any).teamMemberAuthService) {
        try {
          const token = await (window as any).teamMemberAuthService.getCurrentIdToken();
          if (token) {
            console.log('🔑 [UnifiedTeamRole] Using team member auth token');
            return token;
          }
        } catch (error) {
          console.warn('⚠️ [UnifiedTeamRole] Team member auth service failed:', error);
        }
      }

      // Method 4: Check other token sources in localStorage
      const tokenSources = [
        'team_member_token',
        'auth_token',
        'jwt_token',
        'token'
      ];
      
      for (const source of tokenSources) {
        const token = localStorage.getItem(source);
        if (token && token !== 'direct-launch-token' && token.length > 10) {
          console.log(`🔑 [UnifiedTeamRole] Using ${source} token`);
          return token;
        }
      }

      // Method 5: Try to access Firebase directly (fallback)
      let retries = 0;
      const maxRetries = 5;
      
      while (retries < maxRetries) {
        try {
          // Try different ways to access Firebase
          const auth = (window as any).firebase?.auth?.() || 
                      (window as any).firebaseAuth?.() ||
                      (window as any).auth?.();
          
          if (auth?.currentUser) {
            const token = await auth.currentUser.getIdToken();
            if (token) {
              console.log('🔑 [UnifiedTeamRole] Using direct Firebase auth token');
              return token;
            }
          }
        } catch (error) {
          console.warn(`⚠️ [UnifiedTeamRole] Firebase direct access attempt ${retries + 1} failed:`, error);
        }
        
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 200));
        retries++;
      }
      
      throw new Error('No authentication token available');
    } catch (error) {
      console.error('❌ [UnifiedTeamRole] Error getting Firebase token:', error);
      throw error;
    }
  };

  // Main state
  const [activeTab, setActiveTab] = useState<TabValue>('team');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableTeamMembers, setAvailableTeamMembers] = useState<any[]>([]);
  const [teamAction, setTeamAction] = useState<TeamAction>('add');
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [teamMemberSearch, setTeamMemberSearch] = useState('');

  // Role management state
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<ProjectRole[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<any[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [userCreatedRoles, setUserCreatedRoles] = useState<ProjectRole[]>([]);

  // Custom role creation state
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDisplayName, setNewRoleDisplayName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleCategory, setNewRoleCategory] = useState('PRODUCTION');
  const [newRoleHierarchy, setNewRoleHierarchy] = useState(50);

  // Load data when dialog opens
  useEffect(() => {
    if (open && projectId) {
      // Add a small delay to ensure Firebase is ready
      const timer = setTimeout(() => {
        loadAllData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [open, projectId]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadTeamMembers(),
        loadAvailableTeamMembers(),
        loadProjectRoles(),
        loadAvailableRoles(),
        loadUserCreatedRoles()
      ]);
      
      // 🔧 ENHANCEMENT: Load comprehensive template library (800+ templates) from unified API
      try {
        const auth = (window as any).firebase?.auth();
        const currentUser = auth?.currentUser;
        
        if (currentUser) {
          const token = await currentUser.getIdToken();
          const response = await fetch('https://us-central1-backbone-logic.cloudfunctions.net/api/templates?limit=800', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const templatesData = await response.json();
            const templates = templatesData.data || [];
            setRoleTemplates(templates);
            console.log(`🎭 [UnifiedTeamRole] Loaded ${templates.length} comprehensive role templates from unified API`);
          } else {
            throw new Error('API request failed');
          }
        } else {
          throw new Error('No authenticated user');
        }
      } catch (error) {
        console.warn('⚠️ [UnifiedTeamRole] Failed to load templates from API, falling back to basic templates:', error);
        const templates = getAllEnhancedTemplates();
        setRoleTemplates(templates);
      }
      
    } catch (err) {
      console.error('❌ [UnifiedTeamRole] Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      console.log('🔍 [UnifiedTeamRole] Loading team members for project:', projectId);
      
      const token = await getFirebaseToken();
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/team-members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [UnifiedTeamRole] Loaded team members:', data.data);
        setTeamMembers(data.data || []);
      } else {
        throw new Error('Failed to load team members');
      }
    } catch (err) {
      console.error('❌ [UnifiedTeamRole] Error loading team members:', err);
      setTeamMembers([]);
    }
  };

  const loadAvailableTeamMembers = async () => {
    try {
      console.log('🔍 [UnifiedTeamRole] Loading available team members for project:', projectId);
      
      const token = await getFirebaseToken();
      
      // Use the getLicensedTeamMembers API endpoint
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/team-members/licensed?excludeProjectId=${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [UnifiedTeamRole] Loaded available team members:', data.data);
        setAvailableTeamMembers(data.data || []);
      } else {
        throw new Error('Failed to load available team members');
      }
    } catch (err) {
      console.error('❌ [UnifiedTeamRole] Error loading available team members:', err);
      setAvailableTeamMembers([]);
    }
  };

  const loadProjectRoles = async () => {
    try {
      console.log('🎭 [UnifiedTeamRole] Loading project roles for:', projectId);
      
      const token = await getFirebaseToken();
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [UnifiedTeamRole] Loaded project roles:', data.data);
        setProjectRoles(data.data || []);
      } else {
        throw new Error('Failed to load project roles');
      }
    } catch (err) {
      console.error('❌ [UnifiedTeamRole] Error loading project roles:', err);
      setProjectRoles([]);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      const roles = await projectRoleService.getAvailableRoles(projectId);
      
      // Add admin role if current user can assign admins
      const canAssignAdmin = await checkCanAssignAdmin();
      if (canAssignAdmin) {
        const adminRole = {
          id: 'admin-role',
          name: 'ADMIN',
          displayName: 'Project Administrator',
          description: 'Full administrative access to the project',
          category: 'ADMINISTRATIVE',
          hierarchy: 100,
          baseRole: 'ADMIN',
          isDefault: true,
          permissions: ['*'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        roles.unshift(adminRole); // Add admin role at the beginning
      }
      
      setAvailableRoles(roles);
      
      // Set default role selection
      if (roles.length > 0 && !selectedRole) {
        const defaultRole = roles.find(role => role.name === 'DO_ER') || roles[0];
        setSelectedRole(defaultRole.id);
      }
    } catch (err) {
      console.error('❌ [UnifiedTeamRole] Error loading available roles:', err);
      setAvailableRoles([]);
    }
  };

  // Check if current user can assign admin roles
  const checkCanAssignAdmin = async () => {
    try {
      const token = await getFirebaseToken();
      
      // Method 1: Check Firebase Auth user email directly
      if (typeof window !== 'undefined' && (window as any).firebase?.auth) {
        const auth = (window as any).firebase.auth();
        const currentUser = auth?.currentUser;
        if (currentUser?.email) {
          const userEmail = currentUser.email;
          console.log('🔍 [UnifiedTeamRole] Checking admin permissions for:', userEmail);
          
          // Allow admin assignment for enterprise.user and Steve Martin
          if (userEmail === 'enterprise.user@enterprisemedia.com' || 
              userEmail === 'smartin@example.com') {
            console.log('✅ [UnifiedTeamRole] User has admin assignment permissions');
            return true;
          }
        }
      }
      
      // Method 2: Check via team member data
      try {
        const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/team-members/licensed`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const teamMembers = data.data || [];
          
          // Find current user in team members and check their role
          const currentUserEmail = (window as any).firebase?.auth?.()?.currentUser?.email;
          const currentTeamMember = teamMembers.find((member: any) => 
            member.email === currentUserEmail
          );
          
          if (currentTeamMember && (currentTeamMember.role === 'ADMIN' || currentTeamMember.role === 'admin')) {
            console.log('✅ [UnifiedTeamRole] User is admin team member');
            return true;
          }
        }
      } catch (error) {
        console.warn('⚠️ [UnifiedTeamRole] Could not check team member role:', error);
      }
      
      console.log('❌ [UnifiedTeamRole] User does not have admin assignment permissions');
      return false;
    } catch (error) {
      console.warn('⚠️ [UnifiedTeamRole] Could not check admin permissions:', error);
      return false; // Default to no admin permissions
    }
  };

  const loadUserCreatedRoles = async () => {
    try {
      const token = await getFirebaseToken();
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/user/custom-roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserCreatedRoles(data.data || []);
      }
    } catch (err) {
      console.error('❌ [UnifiedTeamRole] Error loading user created roles:', err);
      // Don't throw error for user created roles, just set empty array
      setUserCreatedRoles([]);
    }
  };

  const handleAddTeamMember = async () => {
    if (!selectedTeamMember || !selectedRole) {
      setError('Please select both a team member and a role');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedRoleObj = availableRoles.find(role => role.id === selectedRole);
      const isAdminRole = selectedRoleObj?.name === 'ADMIN';
      
      if (isAdminRole) {
        // Special handling for admin role assignment
        const canAssignAdmin = await checkCanAssignAdmin();
        if (!canAssignAdmin) {
          throw new Error('You do not have permission to assign admin roles');
        }
        
        // Check if project already has an admin
        const currentAdmin = teamMembers.find(member => member.currentRole?.name === 'ADMIN');
        if (currentAdmin) {
          const confirmReplace = window.confirm(
            `This project already has an admin (${currentAdmin.name}). Do you want to replace them with the new admin? The current admin will be reassigned as a Manager.`
          );
          if (!confirmReplace) {
            setLoading(false);
            return;
          }
        }
      }
      
      await projectRoleService.addTeamMemberToProject(projectId, selectedTeamMember, selectedRole);
      setSuccess(`Team member added successfully${isAdminRole ? ' as Project Administrator' : ''}!`);
      
      // Reload data
      await loadTeamMembers();
      
      // Reset form
      setSelectedTeamMember('');
      setSelectedRole('');
      setTeamAction('add');
      
    } catch (err: any) {
      console.error('❌ [UnifiedTeamRole] Error adding team member:', err);
      setError(err.message || 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomRole = async () => {
    if (!newRoleName || !newRoleDisplayName) {
      setError('Please provide both role name and display name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getFirebaseToken();
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newRoleName.toUpperCase().replace(/\s+/g, '_'),
          displayName: newRoleDisplayName,
          description: newRoleDescription,
          category: newRoleCategory,
          hierarchy: newRoleHierarchy,
          baseRole: 'DO_ER',
          permissions: {}
        })
      });
      
      if (response.ok) {
        setSuccess('Custom role created successfully!');
        
        // Reload data
        await Promise.all([
          loadProjectRoles(),
          loadAvailableRoles(),
          loadUserCreatedRoles()
        ]);
        
        // Reset form
        setNewRoleName('');
        setNewRoleDisplayName('');
        setNewRoleDescription('');
        setNewRoleCategory('PRODUCTION');
        setNewRoleHierarchy(50);
        setShowCreateRole(false);
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create role');
      }
    } catch (err: any) {
      console.error('❌ [UnifiedTeamRole] Error creating role:', err);
      setError(err.message || 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: any) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getFirebaseToken();
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: template.name,
          displayName: template.displayName,
          description: template.description,
          category: template.category,
          hierarchy: template.hierarchy,
          baseRole: template.baseRole || 'DO_ER',
          permissions: template.permissions || {}
        })
      });
      
      if (response.ok) {
        setSuccess(`Role "${template.displayName}" added to project!`);
        
        // Reload data
        await Promise.all([
          loadProjectRoles(),
          loadAvailableRoles()
        ]);
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add role from template');
      }
    } catch (err: any) {
      console.error('❌ [UnifiedTeamRole] Error using template:', err);
      setError(err.message || 'Failed to add role from template');
    } finally {
      setLoading(false);
    }
  };

  // Filter role templates
  const filteredTemplates = useMemo(() => {
    let templates = roleTemplates;

    if (selectedIndustry !== 'all') {
      templates = templates.filter(t => t.industry === selectedIndustry);
    }

    if (templateSearch.trim()) {
      const searchResults = searchTemplates(templateSearch);
      templates = templates.filter(t =>
        searchResults.some(sr => sr.id === t.id)
      );
    }

    return templates;
  }, [roleTemplates, selectedIndustry, templateSearch]);

  const renderTeamTab = () => (
    <Box>
      {/* Team Action Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Team Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant={teamAction === 'add' ? 'contained' : 'outlined'}
            startIcon={<AddIcon />}
            onClick={() => setTeamAction('add')}
            size="small"
          >
            Add Member
          </Button>
          <Button
            variant={teamAction === 'assign' ? 'contained' : 'outlined'}
            startIcon={<AssignmentIcon />}
            onClick={() => setTeamAction('assign')}
            size="small"
          >
            Assign Roles
          </Button>
          <Button
            variant={teamAction === 'manage' ? 'contained' : 'outlined'}
            startIcon={<GroupIcon />}
            onClick={() => setTeamAction('manage')}
            size="small"
          >
            Manage Team
          </Button>
        </Box>
      </Box>

      {/* Add Team Member */}
      {teamAction === 'add' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Add New Team Member
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select Team Member</InputLabel>
                <Select
                  value={selectedTeamMember}
                  onChange={(e) => setSelectedTeamMember(e.target.value)}
                  label="Select Team Member"
                >
                  {availableTeamMembers.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {member.name?.charAt(0) || member.email?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{member.name || member.email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Assign Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="Assign Role"
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {role.displayName}
                          </Typography>
                          <Chip 
                            label={role.category} 
                            size="small" 
                            sx={{ 
                              height: 16, 
                              fontSize: '0.65rem',
                              backgroundColor: projectRoleService.getRoleDisplayColor(role.category),
                              color: 'white'
                            }} 
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleAddTeamMember}
                disabled={loading || !selectedTeamMember || !selectedRole}
                startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
              >
                Add Team Member
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Current Team Members */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Current Team Members ({teamMembers.length})
          </Typography>
          
          {teamMembers.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No team members assigned to this project yet.
            </Typography>
          ) : (
            <List>
              {teamMembers.map((member, index) => (
                <React.Fragment key={member.id}>
                  <ListItem>
                    <Avatar sx={{ mr: 2 }}>
                      {member.name?.charAt(0) || member.email?.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={member.name || member.email}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {member.email}
                          </Typography>
                          {member.currentRole && (
                            <Chip
                              label={member.currentRole.displayName}
                              size="small"
                              sx={{ 
                                mt: 0.5,
                                backgroundColor: projectRoleService.getRoleDisplayColor(member.currentRole.category),
                                color: 'white'
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < teamMembers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderRolesTab = () => (
    <Box>
      {/* Role Management Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Role Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant={showCreateRole ? 'contained' : 'outlined'}
            startIcon={<AddIcon />}
            onClick={() => setShowCreateRole(!showCreateRole)}
            size="small"
          >
            Create Custom Role
          </Button>
        </Box>
      </Box>

      {/* Create Custom Role */}
      {showCreateRole && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Create Custom Role
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role Name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., SENIOR_EDITOR"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={newRoleDisplayName}
                  onChange={(e) => setNewRoleDisplayName(e.target.value)}
                  placeholder="e.g., Senior Editor"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Describe the role responsibilities..."
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newRoleCategory}
                    onChange={(e) => setNewRoleCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="ADMINISTRATIVE">Administrative</MenuItem>
                    <MenuItem value="PRODUCTION">Production</MenuItem>
                    <MenuItem value="EDITORIAL">Editorial</MenuItem>
                    <MenuItem value="TECHNICAL">Technical</MenuItem>
                    <MenuItem value="CREATIVE">Creative</MenuItem>
                    <MenuItem value="MANAGEMENT">Management</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hierarchy Level"
                  type="number"
                  value={newRoleHierarchy}
                  onChange={(e) => setNewRoleHierarchy(Number(e.target.value))}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleCreateCustomRole}
                    disabled={loading || !newRoleName || !newRoleDisplayName}
                    startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
                  >
                    Create Role
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowCreateRole(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Current Project Roles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Current Project Roles ({projectRoles.length})
          </Typography>
          
          {projectRoles.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No custom roles created for this project yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {projectRoles.map((role) => (
                <Grid item xs={12} sm={6} md={4} key={role.id}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <RoleIcon />
                      <Typography variant="subtitle2">{role.displayName}</Typography>
                      <Chip
                        label={role.category}
                        size="small"
                        sx={{
                          backgroundColor: projectRoleService.getRoleDisplayColor(role.category),
                          color: 'white'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {role.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hierarchy: {role.hierarchy}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Role Templates */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Role Templates ({filteredTemplates.length})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Industry</InputLabel>
              <Select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                label="Industry"
              >
                <MenuItem value="all">All Industries</MenuItem>
                <MenuItem value="FILM_TV">Film & TV</MenuItem>
                <MenuItem value="CORPORATE">Corporate</MenuItem>
                <MenuItem value="EVENTS">Events</MenuItem>
                <MenuItem value="MUSIC">Music</MenuItem>
                <MenuItem value="ADVERTISING">Advertising</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              size="small"
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          <Grid container spacing={2}>
            {filteredTemplates.slice(0, 12).map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <RoleIcon />
                    <Typography variant="subtitle2">{template.displayName}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexGrow: 1 }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={template.category}
                      size="small"
                      sx={{
                        backgroundColor: projectRoleService.getRoleDisplayColor(template.category),
                        color: 'white'
                      }}
                    />
                    <Button
                      size="small"
                      onClick={() => handleUseTemplate(template)}
                      disabled={loading}
                    >
                      Add Role
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            <Typography variant="h6">
              Team & Role Management
            </Typography>
            <Chip label={projectName} size="small" />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Main Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab
              label="Team Management"
              value="team"
              icon={<GroupIcon />}
              iconPosition="start"
            />
            <Tab
              label="Role Management"
              value="roles"
              icon={<SecurityIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 2, height: 'calc(90vh - 200px)', overflow: 'auto' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {!loading && activeTab === 'team' && renderTeamTab()}
          {!loading && activeTab === 'roles' && renderRolesTab()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnifiedTeamRoleManagementDialog;
