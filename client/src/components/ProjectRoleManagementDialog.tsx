/**
 * ============================================================================
 * PROJECT ROLE MANAGEMENT DIALOG - STREAMLINED VERSION
 * ============================================================================
 * 
 * Simplified, user-friendly role management for project teams.
 * Two main actions: Create Custom Role or Use Role Template
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Autocomplete,
  Stack,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as ViewIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  Search as SearchIcon,
  Dashboard as TemplateIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

// Import the enhanced role template system
import { 
  ENHANCED_INDUSTRY_TEMPLATES, 
  EnhancedIndustryType, 
  EnhancedRoleTemplate,
  getAllEnhancedTemplates,
  getPopularTemplates,
  searchTemplates
} from './EnhancedRoleTemplates';

// Import role types from Dashboard (we'll use the same structure)
interface IFunctionPermissions {
  sessions?: {
    create_sessions?: boolean;
    edit_sessions?: boolean;
    delete_sessions?: boolean;
    manage_workflow_steps?: boolean;
    assign_reviewers?: boolean;
    approve_sessions?: boolean;
    manage_post_tasks?: boolean;
    access_media_library?: boolean;
  };
  postProduction?: {
    manage_tasks?: boolean;
    assign_post_roles?: boolean;
    approve_cuts?: boolean;
    access_post_tools?: boolean;
    export_media?: boolean;
  };
  inventory?: {
    create_assets?: boolean;
    edit_assets?: boolean;
    delete_assets?: boolean;
    manage_checkouts?: boolean;
    bulk_operations?: boolean;
  };
  analytics?: {
    view_reports?: boolean;
    export_data?: boolean;
    manage_dashboards?: boolean;
  };
  teamManagement?: {
    invite_members?: boolean;
    remove_members?: boolean;
    assign_roles?: boolean;
    manage_permissions?: boolean;
  };
  projectSettings?: {
    edit_project?: boolean;
    manage_integrations?: boolean;
    delete_project?: boolean;
  };
}

interface ProjectRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  hierarchy: number;
  baseRole: string;
  permissions: IFunctionPermissions;
  isCustom: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TeamMember {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: string;
  projectRoleId?: string;
  projectRoleName?: string;
  inviteStatus: 'pending' | 'accepted' | 'declined';
  joinedAt?: string;
}

interface ProjectRoleManagementDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  organizationId: string;
}

type ViewMode = 'overview' | 'create-custom' | 'browse-templates' | 'user-created';

const ProjectRoleManagementDialog: React.FC<ProjectRoleManagementDialogProps> = ({
  open,
  onClose,
  projectId,
  projectName,
  organizationId
}) => {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Data state
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userCreatedRoles, setUserCreatedRoles] = useState<ProjectRole[]>([]);
  
  // Template browsing state
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<EnhancedIndustryType | 'all'>('all');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  
  // Custom role creation state
  const [newRole, setNewRole] = useState<Partial<ProjectRole>>({
    name: '',
    displayName: '',
    description: '',
    category: 'PRODUCTION',
    hierarchy: 50,
    permissions: {}
  });

  // Load data on mount
  useEffect(() => {
    if (open) {
      loadProjectRoles();
      loadTeamMembers();
      loadUserCreatedRoles();
    }
  }, [open, projectId]);

  const loadProjectRoles = async () => {
    try {
      setLoading(true);
      console.log('🔍 [RoleManagement] Loading project roles for project:', projectId);
      
      // Get Firebase Auth token properly
      const auth = (window as any).firebase?.auth();
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        console.log('⚠️ [RoleManagement] No authenticated user');
        setError('Please log in to manage roles');
        return;
      }
      
      const token = await currentUser.getIdToken();
      console.log('✅ [RoleManagement] Got auth token for roles');
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [RoleManagement] Loaded project roles:', data.roles?.length || 0);
        setRoles(data.roles || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ [RoleManagement] Failed to load roles:', response.status, errorData);
        setError(`Failed to load project roles: ${errorData.error || 'API Error'}`);
        setRoles([]);
      }
    } catch (err) {
      console.log('❌ [RoleManagement] Error loading roles:', err);
      setError('Failed to load project roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      console.log('🔍 [RoleManagement] Loading team members for project:', projectId);
      
      // Get Firebase Auth token properly
      const auth = (window as any).firebase?.auth();
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        console.log('⚠️ [RoleManagement] No authenticated user');
        setError('Please log in to manage roles');
        return;
      }
      
      const token = await currentUser.getIdToken();
      console.log('✅ [RoleManagement] Got auth token for user:', currentUser.email);
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/team-members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [RoleManagement] Loaded team members:', data.teamMembers?.length || 0);
        setTeamMembers(data.teamMembers || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ [RoleManagement] Failed to load team members:', response.status, errorData);
        setError(`Failed to load team members: ${errorData.error || 'API Error'}`);
        setTeamMembers([]);
      }
    } catch (err) {
      console.log('⚠️ [RoleManagement] Error loading team members:', err);
      setError('Failed to load team members');
      // Fallback to empty array
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserCreatedRoles = async () => {
    try {
      console.log('🔍 [RoleManagement] Loading user created roles');
      
      // Get Firebase Auth token properly
      const auth = (window as any).firebase?.auth();
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        console.log('⚠️ [RoleManagement] No authenticated user for user roles');
        setUserCreatedRoles([]);
        return;
      }
      
      const token = await currentUser.getIdToken();
      
      // Get user's custom roles across all their projects
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/user/custom-roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [RoleManagement] Loaded user created roles:', data.roles?.length || 0);
        setUserCreatedRoles(data.roles || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ [RoleManagement] Failed to load user roles:', response.status, errorData);
        // Don't show error for this, just log it
        setUserCreatedRoles([]);
      }
    } catch (err) {
      console.log('❌ [RoleManagement] Error loading user roles:', err);
      setUserCreatedRoles([]);
    }
  };

  const handleCreateCustomRole = async () => {
    try {
      setLoading(true);
      console.log('🔍 [RoleManagement] Creating custom role:', newRole);
      
      // Get Firebase Auth token properly
      const auth = (window as any).firebase?.auth();
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        setError('Please log in to create roles');
        return;
      }
      
      const token = await currentUser.getIdToken();
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRole)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [RoleManagement] Role created successfully:', data);
        setSuccess('Role created successfully!');
        setViewMode('overview');
        loadProjectRoles();
        loadUserCreatedRoles(); // Reload user created roles
        
        // Reset form
        setNewRole({
          name: '',
          displayName: '',
          description: '',
          category: 'PRODUCTION',
          hierarchy: 50,
          permissions: {}
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ [RoleManagement] Failed to create role:', errorData);
        setError(errorData.error || 'Failed to create role');
      }
    } catch (err) {
      console.log('❌ [RoleManagement] Error creating role:', err);
      setError('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: EnhancedRoleTemplate) => {
    try {
      setLoading(true);
      console.log('🔍 [RoleManagement] Using template:', template.displayName);
      
      // Convert template to project role format
      const roleData = {
        name: template.name,
        displayName: template.displayName,
        description: template.description,
        category: template.category,
        hierarchy: template.hierarchy,
        permissions: template.permissions,
        isCustom: false,
        baseRole: template.baseRole
      };
      
      // Get Firebase Auth token properly
      const auth = (window as any).firebase?.auth();
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        setError('Please log in to add roles');
        return;
      }
      
      const token = await currentUser.getIdToken();
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [RoleManagement] Template role created successfully:', data);
        setSuccess(`Role "${template.displayName}" added to project!`);
        setViewMode('overview');
        loadProjectRoles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ [RoleManagement] Failed to create template role:', errorData);
        setError(errorData.error || 'Failed to add role from template');
      }
    } catch (err) {
      console.log('❌ [RoleManagement] Error using template:', err);
      setError('Failed to add role from template');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (memberId: string, roleId: string) => {
    try {
      setLoading(true);
      console.log('🔍 [RoleManagement] Assigning role:', { memberId, roleId });
      
      // Get Firebase Auth token properly
      const auth = (window as any).firebase?.auth();
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        setError('Please log in to assign roles');
        return;
      }
      
      const token = await currentUser.getIdToken();
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/team-members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleId })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [RoleManagement] Role assigned successfully:', data);
        setSuccess('Role assigned successfully!');
        loadTeamMembers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ [RoleManagement] Failed to assign role:', errorData);
        setError(errorData.error || 'Failed to assign role');
      }
    } catch (err) {
      console.log('❌ [RoleManagement] Error assigning role:', err);
      setError('Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const handleUseUserCreatedRole = async (role: ProjectRole) => {
    try {
      setLoading(true);
      console.log('🔍 [RoleManagement] Using user created role:', role.displayName);
      
      // Get Firebase Auth token properly
      const auth = (window as any).firebase?.auth();
      const currentUser = auth?.currentUser;
      
      if (!currentUser) {
        setError('Please log in to add roles');
        return;
      }
      
      const token = await currentUser.getIdToken();
      
      // Create a copy of the user's role for this project
      const roleData = {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        category: role.category,
        hierarchy: role.hierarchy,
        permissions: role.permissions,
        isCustom: true,
        baseRole: role.baseRole
      };
      
      const response = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [RoleManagement] User role added successfully:', data);
        setSuccess(`Role "${role.displayName}" added to project!`);
        setViewMode('overview');
        loadProjectRoles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ [RoleManagement] Failed to add user role:', errorData);
        setError(errorData.error || 'Failed to add role to project');
      }
    } catch (err) {
      console.log('❌ [RoleManagement] Error using user role:', err);
      setError('Failed to add role to project');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search and filters
  const filteredTemplates = React.useMemo(() => {
    let templates = getAllEnhancedTemplates();
    
    // Debug: Log total templates and industry breakdown
    console.log('🔍 [RoleTemplates] Total templates available:', templates.length);
    console.log('🔍 [RoleTemplates] Selected industry:', selectedIndustry);
    
    if (showPopularOnly) {
      templates = getPopularTemplates();
      console.log('🔍 [RoleTemplates] Popular templates:', templates.length);
    }
    
    if (selectedIndustry !== 'all') {
      const beforeFilter = templates.length;
      templates = templates.filter(t => t.industry === selectedIndustry);
      console.log(`🔍 [RoleTemplates] Filtered by industry ${selectedIndustry}: ${beforeFilter} → ${templates.length}`);
      
      // Debug: Show available industries in templates
      const availableIndustries = getAllEnhancedTemplates().reduce((acc, t) => {
        acc[t.industry] = (acc[t.industry] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('🔍 [RoleTemplates] Available industries:', availableIndustries);
    }
    
    if (templateSearch.trim()) {
      // Apply search to the already filtered templates
      const searchResults = searchTemplates(templateSearch);
      templates = templates.filter(t => 
        searchResults.some(sr => sr.id === t.id)
      );
      console.log('🔍 [RoleTemplates] After search filter:', templates.length);
    }
    
    return templates;
  }, [templateSearch, selectedIndustry, showPopularOnly]);

  const renderOverview = () => (
    <Box>
      {/* Quick Action Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              border: '2px solid transparent',
              '&:hover': { boxShadow: 4, borderColor: 'primary.main' }
            }}
            onClick={() => setViewMode('create-custom')}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <PersonAddIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Create Custom Role
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define a new role with specific permissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              border: '2px solid transparent',
              '&:hover': { boxShadow: 4, borderColor: 'secondary.main' }
            }}
            onClick={() => setViewMode('browse-templates')}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TemplateIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Use Role Template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose from 70+ pre-defined roles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              border: '2px solid transparent',
              '&:hover': { boxShadow: 4, borderColor: 'success.main' },
              opacity: userCreatedRoles.length === 0 ? 0.6 : 1
            }}
            onClick={() => userCreatedRoles.length > 0 && setViewMode('user-created')}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <LightbulbIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Your Created Roles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reuse roles you've created ({userCreatedRoles.length})
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Current Project Roles */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon />
          Current Project Roles ({roles.length})
        </Typography>
        
        {roles.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              No roles defined yet. Create a custom role or use a template to get started.
            </Typography>
          </Paper>
        ) : (
          <List>
            {roles.map((role) => (
              <ListItem key={role.id} divider>
                <ListItemText
                  primary={role.displayName}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          size="small" 
                          label={role.category} 
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={`Level ${role.hierarchy}`} 
                          color="primary"
                          variant="outlined"
                        />
                        {role.isCustom && (
                          <Chip 
                            size="small" 
                            label="Custom" 
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Team Member Role Assignments */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon />
          Team Member Assignments ({teamMembers.length})
        </Typography>
        
        {teamMembers.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              No team members found. Invite members to your project first.
            </Typography>
          </Paper>
        ) : (
          <List>
            {teamMembers.map((member) => (
              <ListItem key={member.id} divider>
                <Avatar sx={{ mr: 2 }}>
                  {member.displayName.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={member.displayName}
                  secondary={member.email}
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={member.projectRoleId || ''}
                      label="Role"
                      onChange={(e) => handleAssignRole(member.id, e.target.value)}
                    >
                      <MenuItem value="">
                        <em>No Role</em>
                      </MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );

  const renderCreateCustom = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button 
          startIcon={<CloseIcon />} 
          onClick={() => setViewMode('overview')}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h6">
          Create Custom Role
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Role Name"
            value={newRole.displayName || ''}
            onChange={(e) => setNewRole(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="e.g., Senior Editor"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newRole.description || ''}
            onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the role's responsibilities..."
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newRole.category || 'PRODUCTION'}
              label="Category"
              onChange={(e) => setNewRole(prev => ({ ...prev, category: e.target.value }))}
            >
              <MenuItem value="PRODUCTION">Production</MenuItem>
              <MenuItem value="POST_PRODUCTION">Post-Production</MenuItem>
              <MenuItem value="ADMINISTRATIVE">Administrative</MenuItem>
              <MenuItem value="CREATIVE">Creative</MenuItem>
              <MenuItem value="TECHNICAL">Technical</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Hierarchy Level: {newRole.hierarchy}
            </Typography>
            <Slider
              value={newRole.hierarchy || 50}
              onChange={(e, value) => setNewRole(prev => ({ ...prev, hierarchy: value as number }))}
              min={1}
              max={100}
              marks={[
                { value: 1, label: 'Basic' },
                { value: 50, label: 'Standard' },
                { value: 100, label: 'Admin' }
              ]}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Permissions
          </Typography>
          <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            {/* Simplified permission toggles */}
            <FormControlLabel
              control={<Switch />}
              label="Create & Edit Sessions"
            />
            <FormControlLabel
              control={<Switch />}
              label="Manage Post-Production"
            />
            <FormControlLabel
              control={<Switch />}
              label="Access Analytics"
            />
            <FormControlLabel
              control={<Switch />}
              label="Manage Team"
            />
            <FormControlLabel
              control={<Switch />}
              label="Project Settings"
            />
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button 
          variant="outlined" 
          onClick={() => setViewMode('overview')}
          sx={{ mr: 2 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleCreateCustomRole}
          disabled={!newRole.displayName || loading}
        >
          Create Role
        </Button>
      </Box>
    </Box>
  );

  const renderBrowseTemplates = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button 
          startIcon={<CloseIcon />} 
          onClick={() => setViewMode('overview')}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h6">
          Browse Role Templates
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search roles..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Industry</InputLabel>
              <Select
                value={selectedIndustry}
                label="Industry"
                onChange={(e) => setSelectedIndustry(e.target.value as EnhancedIndustryType | 'all')}
              >
                <MenuItem value="all">All Industries</MenuItem>
                <MenuItem value="FILM_TV">Film & TV</MenuItem>
                <MenuItem value="CORPORATE_EVENTS">Corporate Events</MenuItem>
                <MenuItem value="LIVE_EVENTS">Live Events</MenuItem>
                <MenuItem value="SPORTS_BROADCAST">Sports Broadcasting</MenuItem>
                <MenuItem value="GAMING_ESPORTS">Gaming & Esports</MenuItem>
                <MenuItem value="HEALTHCARE">Healthcare</MenuItem>
                <MenuItem value="IT_TECHNOLOGY">IT & Technology</MenuItem>
                <MenuItem value="MARKETING_ADVERTISING">Marketing & Advertising</MenuItem>
                <MenuItem value="EDUCATION_TRAINING">Education & Training</MenuItem>
                <MenuItem value="CONSTRUCTION_ENGINEERING">Construction & Engineering</MenuItem>
                <MenuItem value="FINANCE_BANKING">Finance & Banking</MenuItem>
                <MenuItem value="GOVERNMENT_PUBLIC">Government & Public</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPopularOnly}
                  onChange={(e) => setShowPopularOnly(e.target.checked)}
                />
              }
              label="Popular Only"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredTemplates.length} roles
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Template Grid */}
      <Grid container spacing={2}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {template.name}
                  </Typography>
                  {template.isPopular && (
                    <Chip size="small" label="Popular" color="primary" />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip size="small" label={template.industry} variant="outlined" />
                  <Chip size="small" label={`Level ${template.hierarchy}`} variant="outlined" />
                  <Chip size="small" label={template.experienceLevel} variant="outlined" />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Used {template.usageCount || 0} times
                </Typography>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  onClick={() => handleUseTemplate(template)}
                  disabled={loading}
                >
                  Add to Project
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTemplates.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No templates found matching your criteria.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setTemplateSearch('');
              setSelectedIndustry('all');
              setShowPopularOnly(false);
            }}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Paper>
      )}
    </Box>
  );

  const renderUserCreatedRoles = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button 
          startIcon={<CloseIcon />} 
          onClick={() => setViewMode('overview')}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Typography variant="h6">
          Your Created Roles
        </Typography>
      </Box>

      {/* User Created Roles Grid */}
      <Grid container spacing={2}>
        {userCreatedRoles.map((role) => (
          <Grid item xs={12} sm={6} md={4} key={role.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {role.displayName}
                  </Typography>
                  <Chip size="small" label="Custom" color="success" />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {role.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip size="small" label={role.category} variant="outlined" />
                  <Chip size="small" label={`Level ${role.hierarchy}`} variant="outlined" />
                </Box>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  onClick={() => handleUseUserCreatedRole(role)}
                  disabled={loading}
                >
                  Add to Project
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {userCreatedRoles.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            You haven't created any custom roles yet.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => setViewMode('create-custom')}
            sx={{ mt: 2 }}
          >
            Create Your First Role
          </Button>
        </Paper>
      )}
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon />
          Role Management - {projectName}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'create-custom' && renderCreateCustom()}
        {viewMode === 'browse-templates' && renderBrowseTemplates()}
        {viewMode === 'user-created' && renderUserCreatedRoles()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectRoleManagementDialog;
export { ProjectRoleManagementDialog };