/**
 * ============================================================================
 * TEAM & ROLE MANAGEMENT WIZARD
 * ============================================================================
 * 
 * Simple, step-by-step wizard for managing team members and roles.
 * Designed for ease of use with clear guidance at each step.
 * 
 * Steps:
 * 1. Select Action (Add Members or Manage Roles)
 * 2. Choose Team Members
 * 3. Assign Roles (from templates or custom)
 * 4. Review & Confirm
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Star as StarIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Movie as MovieIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  School as SchoolIcon,
  SportsEsports as SportsIcon,
  MusicNote as MusicIcon,
  Campaign as CampaignIcon,
  Tv as TvIcon
} from '@mui/icons-material';

// Import the enhanced role template system
import { getAllEnhancedTemplates, getPopularTemplates, EnhancedIndustryType } from './EnhancedRoleTemplates';

// Import licensing website services
import { TeamMemberService } from '../services/TeamMemberService';
import { unifiedDataService } from '../services/UnifiedDataService';
import { TeamMemberRole } from '../services/models/types';
import { EnhancedRoleBridgeService, DashboardUserRole } from '../services/EnhancedRoleBridgeService';
import { CrossAppRoleSyncService } from '../services/CrossAppRoleSyncService';

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: string;
  isSelected?: boolean;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  hierarchy: number;
  isTemplate?: boolean;
  isPopular?: boolean;
  industry?: EnhancedIndustryType;
  tags?: string[];
  usageCount?: number;
  icon?: string;
  color?: string;
}

interface Assignment {
  memberId: string;
  roleId: string;
}

interface TeamRoleWizardProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  organizationId: string;
  onTeamMembersUpdated?: () => void; // Callback to notify parent when team members are updated
  existingProjectTeamMembers?: any[]; // Optional: existing team members from parent component
}

const STEPS = [
  'Choose Action',
  'Select Members', 
  'Assign Roles',
  'Review & Confirm'
];

const TeamRoleWizard: React.FC<TeamRoleWizardProps> = ({
  open,
  onClose,
  projectId,
  projectName,
  organizationId,
  onTeamMembersUpdated,
  existingProjectTeamMembers
}) => {
  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Action selection
  const [selectedAction, setSelectedAction] = useState<'add-members' | 'manage-roles' | null>(null);

  // Data state
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [existingTeamMembers, setExistingTeamMembers] = useState<any[]>([]);
  const [projectHasAdmin, setProjectHasAdmin] = useState(false);
  
  // Enhanced role bridge service
  const roleBridgeService = EnhancedRoleBridgeService.getInstance();
  const crossAppSyncService = CrossAppRoleSyncService.getInstance();

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'templates' | 'custom' | 'popular'>('popular');
  const [selectedIndustry, setSelectedIndustry] = useState<EnhancedIndustryType | 'all'>('all');

  // Helper function to get Firebase auth token
  const getFirebaseToken = async () => {
    try {
      const firebaseIdToken = localStorage.getItem('firebase_id_token');
      if (firebaseIdToken && firebaseIdToken.length > 10) {
        return firebaseIdToken;
      }

      if (typeof window !== 'undefined' && (window as any).firebaseAuthService) {
        const token = await (window as any).firebaseAuthService.getIdToken();
        if (token) return token;
      }

      const tokenSources = ['team_member_token', 'auth_token', 'jwt_token', 'token'];
      for (const source of tokenSources) {
        const token = localStorage.getItem(source);
        if (token && token !== 'direct-launch-token' && token.length > 10) {
          return token;
        }
      }

      throw new Error('No authentication token available');
    } catch (error) {
      console.error('❌ [TeamRoleWizard] Error getting Firebase token:', error);
      throw error;
    }
  };

  // Load data when wizard opens
  useEffect(() => {
    if (open && projectId) {
      loadWizardData();
    }
  }, [open, projectId]);

  const loadWizardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load existing team members first, then available members (which depends on existing members)
      await loadExistingTeamMembers();
      await Promise.all([
        loadAvailableMembers(),
        loadAvailableRoles()
      ]);
    } catch (err) {
      console.error('❌ [TeamRoleWizard] Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingTeamMembers = async () => {
    try {
      console.log(`🔍 [TeamRoleWizard] Loading existing team members for project: ${projectId}`);
      
      // First, try to use existing team members passed from parent component
      if (existingProjectTeamMembers && existingProjectTeamMembers.length > 0) {
        console.log(`✅ [TeamRoleWizard] Using ${existingProjectTeamMembers.length} existing team members from parent component`);
        console.log(`🔍 [TeamRoleWizard] Parent team members data:`, existingProjectTeamMembers);
        
        setExistingTeamMembers(existingProjectTeamMembers);
        
        // Check if project has an admin
        const hasAdmin = existingProjectTeamMembers.some((member: any) => 
          member.role === 'ADMIN' || member.role === TeamMemberRole.ADMIN || member.role === 'ENTERPRISE'
        );
        setProjectHasAdmin(hasAdmin);
        
        console.log(`🛡️ [TeamRoleWizard] Project has admin: ${hasAdmin}`);
        return;
      }
      
      // Fallback: Use TeamMemberService to get existing project team members
      const teamMemberService = TeamMemberService.getInstance({
        isWebOnlyMode: true,
        apiBaseUrl: '/api'
      });
      
      try {
        const existingMembers = await teamMemberService.getProjectTeamMembers(projectId);
        console.log(`✅ [TeamRoleWizard] Found ${existingMembers.length} existing team members from TeamMemberService`);
        console.log(`🔍 [TeamRoleWizard] Service team members data:`, existingMembers);
        
        setExistingTeamMembers(existingMembers);
        
        // Check if project has an admin
        const hasAdmin = existingMembers.some((member: any) => 
          member.role === 'ADMIN' || member.role === TeamMemberRole.ADMIN || member.role === 'ENTERPRISE'
        );
        setProjectHasAdmin(hasAdmin);
        
        console.log(`🛡️ [TeamRoleWizard] Project has admin: ${hasAdmin}`);
      } catch (serviceError) {
        console.warn('⚠️ [TeamRoleWizard] TeamMemberService failed:', serviceError);
        setExistingTeamMembers([]);
        setProjectHasAdmin(false);
        console.log('⚠️ [TeamRoleWizard] Using empty team member list - filtering may not work correctly');
      }
    } catch (err: any) {
      console.error('❌ [TeamRoleWizard] Error loading existing team members:', err);
      setExistingTeamMembers([]);
      setProjectHasAdmin(false);
    }
  };

  const loadAvailableMembers = async () => {
    try {
      console.log(`🔍 [TeamRoleWizard] Loading team members for project: ${projectId}`);
      
      // Use the licensing website's UnifiedDataService to get team members
      // unifiedDataService is already imported as a singleton
      const allMembers = await unifiedDataService.getTeamMembersForOrganization()
      
      // Get list of already assigned member IDs from existing team members
      // Try multiple possible ID fields and email matching
      const assignedMemberIds = existingTeamMembers.map((member: any) => member.id || member.userId || member.memberId || member.firebaseUid);
      const assignedEmails = existingTeamMembers.map((member: any) => member.email).filter(Boolean);
      
      console.log(`🔍 [TeamRoleWizard] Found ${assignedMemberIds.length} already assigned member IDs:`, assignedMemberIds);
      console.log(`🔍 [TeamRoleWizard] Found ${assignedEmails.length} already assigned member emails:`, assignedEmails);
      console.log(`🔍 [TeamRoleWizard] Existing team members structure:`, existingTeamMembers);
      
      // Filter out members already assigned to this project (match by ID or email)
      const availableMembers = allMembers.filter((member: any) => {
        const isAssignedById = assignedMemberIds.includes(member.id);
        const isAssignedByEmail = assignedEmails.includes(member.email);
        const isAssigned = isAssignedById || isAssignedByEmail;
        
        if (isAssigned) {
          console.log(`🚫 [TeamRoleWizard] Filtering out already assigned member: ${member.name || member.email} (ID: ${member.id}, Email: ${member.email})`);
        }
        
        return !isAssigned;
      });
      
      const members = availableMembers.map((member: any) => ({
        id: member.id,
        name: member.name || `${member.firstName} ${member.lastName}`,
        email: member.email,
        tier: member.role || member.licenseType || 'MEMBER', // Show role first, fallback to license type
        isSelected: false
      }));
      
      setAvailableMembers(members);
      console.log(`✅ [TeamRoleWizard] Loaded ${members.length} available team members (filtered out ${allMembers.length - availableMembers.length} already assigned)`);
    } catch (err: any) {
      console.error('❌ [TeamRoleWizard] Error loading members:', err);
      setError(`Failed to load team members: ${err.message}`);
      setAvailableMembers([]);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      console.log(`🔍 [TeamRoleWizard] Loading roles for project: ${projectId}`);
      
      // Start with basic project roles (these would be existing roles in the project)
      let roles: Role[] = [
        {
          id: 'basic-admin',
          name: 'ADMIN',
          displayName: 'Project Admin',
          description: 'Full administrative access to the project',
          category: 'MANAGEMENT',
          hierarchy: 100,
          isTemplate: false,
          isPopular: true
        },
        {
          id: 'basic-manager',
          name: 'MANAGER',
          displayName: 'Project Manager',
          description: 'Manage project tasks and team members',
          category: 'MANAGEMENT',
          hierarchy: 80,
          isTemplate: false,
          isPopular: true
        },
        {
          id: 'basic-doer',
          name: 'MEMBER',
          displayName: 'Team Member',
          description: 'Standard team member with task execution access',
          category: 'EXECUTION',
          hierarchy: 60,
          isTemplate: false,
          isPopular: true
        },
        {
          id: 'basic-viewer',
          name: 'VIEWER',
          displayName: 'Viewer',
          description: 'Read-only access to project information',
          category: 'ACCESS',
          hierarchy: 20,
          isTemplate: false,
          isPopular: false
        }
      ];

      // Load all enhanced role templates
      const allTemplates = getAllEnhancedTemplates();
      const enhancedTemplates: Role[] = allTemplates.map(template => ({
        id: `template-${template.id}`,
        name: template.name,
        displayName: template.displayName,
        description: template.description,
        category: template.category,
        hierarchy: template.hierarchy,
        isTemplate: true,
        isPopular: template.isPopular,
        industry: template.industry,
        tags: template.tags,
        usageCount: template.usageCount,
        icon: template.icon,
        color: template.color
      }));

      console.log(`🎭 [TeamRoleWizard] Loaded ${enhancedTemplates.length} enhanced role templates`);
      setAvailableRoles([...roles, ...enhancedTemplates]);
      
    } catch (err) {
      console.error('❌ [TeamRoleWizard] Error loading roles:', err);
      setAvailableRoles([]);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (activeStep === 0 && !selectedAction) {
      setError('Please choose an action to continue');
      return;
    }
    
    if (activeStep === 1 && selectedMembers.length === 0) {
      setError('Please select at least one team member');
      return;
    }
    
    if (activeStep === 2) {
      const missingAssignments = selectedMembers.filter(member => 
        !assignments.find(a => a.memberId === member.id)
      );
      if (missingAssignments.length > 0) {
        setError(`Please assign roles to: ${missingAssignments.map(m => m.name).join(', ')}`);
        return;
      }
      
      // Check if project needs an admin and none is assigned
      if (!projectHasAdmin) {
        const adminAssigned = assignments.some(assignment => {
          const assignedRole = availableRoles.find(r => r.id === assignment.roleId);
          return assignedRole?.name === 'ADMIN';
        });
        
        if (!adminAssigned) {
          setError('⚠️ This project needs an ADMIN! Please assign the ADMIN role to at least one team member before proceeding.');
          return;
        }
      }
    }

    setError(null);
    setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedAction(null);
    setSelectedMembers([]);
    setAssignments([]);
    setError(null);
    setSuccess(null);
  };

  // Member selection handlers
  const handleMemberToggle = (member: TeamMember) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        // Remove member and their assignment
        setAssignments(prevAssignments => 
          prevAssignments.filter(a => a.memberId !== member.id)
        );
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  // Role assignment handlers
  const handleRoleAssignment = (memberId: string, roleId: string) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.memberId === memberId);
      let newAssignments;
      
      if (existing) {
        newAssignments = prev.map(a => a.memberId === memberId ? { ...a, roleId } : a);
      } else {
        newAssignments = [...prev, { memberId, roleId }];
      }
      
      // Check if an admin role was just assigned
      const assignedRole = availableRoles.find(r => r.id === roleId);
      if (assignedRole?.name === 'ADMIN') {
        console.log('🛡️ [TeamRoleWizard] ADMIN role assigned - updating project admin status');
        // Note: We don't set projectHasAdmin to true here because we want to keep the restriction
        // until the assignment is actually saved. The filtering logic will handle hiding the admin role.
      }
      
      return newAssignments;
    });
  };

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🚀 [TeamRoleWizard] Starting assignment process for ${assignments.length} assignments`);

      const teamMemberService = TeamMemberService.getInstance({
        isWebOnlyMode: true,
        apiBaseUrl: '/api'
      });

      // Process each assignment
      for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const role = availableRoles.find(r => r.id === assignment.roleId);
        const member = selectedMembers.find(m => m.id === assignment.memberId);
        
        console.log(`📋 [TeamRoleWizard] Processing assignment ${i + 1}/${assignments.length}: ${member?.name} -> ${role?.displayName}`);
        
        // Enhanced role mapping using the role bridge service
        let roleName: TeamMemberRole = TeamMemberRole.MEMBER;
        let dashboardRole: DashboardUserRole | null = null;
        
        // Determine licensing role using unified TeamMemberRole (only ADMIN and MEMBER)
        let licensingRole: TeamMemberRole = TeamMemberRole.MEMBER;
        if (role?.name === 'ADMIN') {
          licensingRole = TeamMemberRole.ADMIN;
          roleName = TeamMemberRole.ADMIN;
        } else {
          // All other roles (MANAGER, VIEWER, DO_ER, etc.) map to MEMBER
          licensingRole = TeamMemberRole.MEMBER;
          roleName = TeamMemberRole.MEMBER;
        }
        
        // Enhanced mapping for template roles
        if (role?.isTemplate && member) {
          console.log(`🎭 [TeamRoleWizard] Mapping template role: ${role.displayName}`);
          
          // Convert Role to EnhancedRoleTemplate format for the bridge service
          const templateRole = {
            id: role.id,
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            industry: 'FILM_TV' as any, // Default industry
            eventTypes: [],
            category: role.category,
            hierarchy: role.hierarchy,
            baseRole: 'PRODUCER' as any, // Default base role
            permissions: {},
            raciLevel: 'RESPONSIBLE' as any,
            keyResponsibilities: [],
            requiredSkills: [],
            reportingStructure: {},
            tags: role.tags || [],
            isPopular: role.isPopular || false,
            usageCount: role.usageCount || 0,
            icon: role.icon || 'Person',
            color: role.color || '#1976d2',
            experienceLevel: 'Mid' as any
          };
          
          // Use the enhanced role bridge to map template to Dashboard role
          const enhancedMapping = roleBridgeService.mapLicensingRoleToDashboard(
            licensingRole,
            templateRole,
            'PRO' // Default to PRO tier, could be dynamic based on organization
          );
          
          dashboardRole = enhancedMapping.dashboardRole;
          console.log(`✅ [TeamRoleWizard] Template mapped to Dashboard role: ${dashboardRole} (hierarchy: ${enhancedMapping.effectiveHierarchy})`);
          
          // Sync role assignment to Dashboard application
          try {
            await crossAppSyncService.syncRoleToLicensing(
              member.id,
              projectId,
              organizationId,
              licensingRole,
              templateRole,
              'licensing-wizard' // Assigned by
            );
            console.log(`🔄 [TeamRoleWizard] Role synced to Dashboard for: ${member.name}`);
          } catch (syncError) {
            console.warn('⚠️ [TeamRoleWizard] Failed to sync role to Dashboard:', syncError);
            // Continue with assignment even if sync fails
          }
        }

        // Add team member to project using the licensing website's service
        console.log(`👥 [TeamRoleWizard] Adding team member to project: ${member?.name} with role: ${roleName}`);
        
        try {
          // Use the TeamMemberService to add the member to the project
          const success = await teamMemberService.addTeamMemberToProject(
            projectId,
            assignment.memberId,
            roleName
          );
          
          if (!success) {
            throw new Error(`Failed to add ${member?.name || 'team member'} to project`);
          }
          
          console.log(`✅ [TeamRoleWizard] Successfully added ${member?.name} to project`);
        } catch (memberError: any) {
          // If the service method fails, try using UnifiedDataService as fallback
          console.warn(`⚠️ [TeamRoleWizard] TeamMemberService failed, trying UnifiedDataService:`, memberError);
          
          try {
            await unifiedDataService.addTeamMemberToProject(projectId, assignment.memberId, roleName as 'ADMIN' | 'MEMBER' | 'VIEWER');
            
            console.log(`✅ [TeamRoleWizard] Successfully added ${member?.name} via UnifiedDataService`);
          } catch (fallbackError: any) {
            throw new Error(`Failed to add ${member?.name || 'team member'}: ${fallbackError.message}`);
          }
        }
      }

      console.log(`🎉 [TeamRoleWizard] All assignments completed successfully!`);
      setSuccess(`Successfully added ${selectedMembers.length} team member${selectedMembers.length !== 1 ? 's' : ''} to the project!`);
      
      // Notify parent component to refresh team member data
      if (onTeamMembersUpdated) {
        console.log('🔄 [TeamRoleWizard] Notifying parent component to refresh team members');
        onTeamMembersUpdated();
      }
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        handleReset();
      }, 2000);

    } catch (err: any) {
      console.error('❌ [TeamRoleWizard] Error submitting:', err);
      setError(err.message || 'Failed to add team members');
    } finally {
      setLoading(false);
    }
  };

  // Filter roles based on current filter
  const filteredRoles = availableRoles.filter(role => {
    // Remove ADMIN role if project already has an admin OR if someone in current selection is already assigned ADMIN
    if (role.name === 'ADMIN') {
      const adminAlreadyAssigned = assignments.some(assignment => {
        const assignedRole = availableRoles.find(r => r.id === assignment.roleId);
        return assignedRole?.name === 'ADMIN';
      });
      
      if (projectHasAdmin || adminAlreadyAssigned) {
        return false;
      }
    }
    
    // Filter by role type
    if (roleFilter === 'templates') {
      if (!role.isTemplate) return false;
    } else if (roleFilter === 'custom') {
      if (role.isTemplate) return false;
    } else if (roleFilter === 'popular') {
      if (!role.isTemplate || !role.isPopular) return false;
    }

    // Filter by industry
    if (selectedIndustry !== 'all' && role.industry && role.industry !== selectedIndustry) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = role.displayName.toLowerCase().includes(query);
      const matchesDescription = role.description.toLowerCase().includes(query);
      const matchesTags = role.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
      
      if (!matchesName && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    return true;
  });

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              What would you like to do?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Choose an action to get started with team management
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedAction === 'add-members' ? 2 : 1,
                    borderColor: selectedAction === 'add-members' ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setSelectedAction('add-members')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Add Team Members
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add new team members to this project and assign them roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedAction === 'manage-roles' ? 2 : 1,
                    borderColor: selectedAction === 'manage-roles' ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setSelectedAction('manage-roles')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Manage Roles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create custom roles or use templates for your project
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Team Members
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose team members to add to "{projectName}"
            </Typography>
            
            {/* Show existing team members info */}
            {existingTeamMembers.length > 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Current Team:</strong> This project already has {existingTeamMembers.length} team member{existingTeamMembers.length !== 1 ? 's' : ''} assigned.
                  {projectHasAdmin && <> ✅ Project has an admin.</>}
                  {!projectHasAdmin && <> ⚠️ Project needs an admin to be assigned.</>}
                </Typography>
              </Alert>
            )}

            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ mb: 3 }}
            />

            {/* Available Members */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Available Team Members ({availableMembers.length})
                </Typography>
                
                {availableMembers.length === 0 ? (
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>No available team members found.</strong>
                      {existingTeamMembers.length > 0 ? (
                        <> All organization members are already assigned to this project. 
                        To reassign a member, please remove them from the project first using the Project Details panel.</>
                      ) : (
                        <> No team members are available in your organization. 
                        Please add team members to your organization first.</>
                      )}
                    </Typography>
                  </Alert>
                ) : (
                  <List>
                    {availableMembers
                      .filter(member => 
                        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((member) => (
                        <ListItem key={member.id} divider>
                          <ListItemAvatar>
                            <Avatar src={member.avatar}>
                              {member.name?.charAt(0) || member.email?.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={member.name || member.email}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {member.email}
                                </Typography>
                                <Chip label={member.tier} size="small" sx={{ mt: 0.5 }} />
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Checkbox
                              checked={selectedMembers.some(m => m.id === member.id)}
                              onChange={() => handleMemberToggle(member)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Selected Members Summary */}
            {selectedMembers.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Members ({selectedMembers.length})
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedMembers.map((member) => (
                      <Chip
                        key={member.id}
                        label={member.name || member.email}
                        onDelete={() => handleMemberToggle(member)}
                        avatar={<Avatar src={member.avatar}>{member.name?.charAt(0) || member.email?.charAt(0)}</Avatar>}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Assign Roles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Assign roles to the selected team members from our comprehensive template library
            </Typography>
            
            {/* Admin Requirement Alert */}
            {!projectHasAdmin && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>⚠️ ADMIN Required!</strong> This project doesn't have an administrator yet. 
                  You must assign the ADMIN role to at least one team member to proceed.
                </Typography>
              </Alert>
            )}
            
            {/* Template Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>50+ Professional Role Templates Available!</strong> Choose from industry-specific roles 
                including Film & TV, Corporate, Live Events, Education, Sports, Streaming, Music, and Marketing.
                Popular templates are shown by default.
                {projectHasAdmin && (
                  <><br /><strong>Note:</strong> ADMIN role is not available as this project already has an administrator.</>
                )}
              </Typography>
            </Alert>

            {/* Role Filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role Type</InputLabel>
                    <Select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as any)}
                      label="Role Type"
                    >
                      <MenuItem value="popular">Popular Templates</MenuItem>
                      <MenuItem value="templates">All Templates</MenuItem>
                      <MenuItem value="custom">Custom Roles</MenuItem>
                      <MenuItem value="all">All Roles</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value as any)}
                      label="Industry"
                    >
                      <MenuItem value="all">All Industries</MenuItem>
                      <MenuItem value="FILM_TV">
                        <Box display="flex" alignItems="center" gap={1}>
                          <MovieIcon fontSize="small" />
                          Film & TV
                        </Box>
                      </MenuItem>
                      <MenuItem value="CORPORATE">
                        <Box display="flex" alignItems="center" gap={1}>
                          <BusinessIcon fontSize="small" />
                          Corporate
                        </Box>
                      </MenuItem>
                      <MenuItem value="LIVE_EVENTS">
                        <Box display="flex" alignItems="center" gap={1}>
                          <EventIcon fontSize="small" />
                          Live Events
                        </Box>
                      </MenuItem>
                      <MenuItem value="EDUCATION">
                        <Box display="flex" alignItems="center" gap={1}>
                          <SchoolIcon fontSize="small" />
                          Education
                        </Box>
                      </MenuItem>
                      <MenuItem value="SPORTS">
                        <Box display="flex" alignItems="center" gap={1}>
                          <SportsIcon fontSize="small" />
                          Sports
                        </Box>
                      </MenuItem>
                      <MenuItem value="STREAMING">
                        <Box display="flex" alignItems="center" gap={1}>
                          <TvIcon fontSize="small" />
                          Streaming
                        </Box>
                      </MenuItem>
                      <MenuItem value="MUSIC">
                        <Box display="flex" alignItems="center" gap={1}>
                          <MusicIcon fontSize="small" />
                          Music
                        </Box>
                      </MenuItem>
                      <MenuItem value="MARKETING">
                        <Box display="flex" alignItems="center" gap={1}>
                          <CampaignIcon fontSize="small" />
                          Marketing
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
              
              {/* Filter Summary */}
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Showing {filteredRoles.length} roles
                </Typography>
                {roleFilter === 'popular' && (
                  <Chip label="Popular" size="small" color="primary" />
                )}
                {selectedIndustry !== 'all' && (
                  <Chip 
                    label={selectedIndustry.replace('_', ' ')} 
                    size="small" 
                    variant="outlined"
                    onDelete={() => setSelectedIndustry('all')}
                  />
                )}
                {searchQuery && (
                  <Chip 
                    label={`"${searchQuery}"`} 
                    size="small" 
                    variant="outlined"
                    onDelete={() => setSearchQuery('')}
                  />
                )}
              </Box>
            </Box>

            {/* Member Role Assignments */}
            {selectedMembers.map((member) => {
              const currentAssignment = assignments.find(a => a.memberId === member.id);
              const assignedRole = currentAssignment ? filteredRoles.find(r => r.id === currentAssignment.roleId) : null;

              return (
                <Card key={member.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar src={member.avatar}>
                        {member.name?.charAt(0) || member.email?.charAt(0)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1">{member.name || member.email}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>

                    <FormControl fullWidth>
                      <InputLabel>Assign Role</InputLabel>
                      <Select
                        value={currentAssignment?.roleId || ''}
                        onChange={(e) => handleRoleAssignment(member.id, e.target.value)}
                        label="Assign Role"
                      >
                        {filteredRoles.map((role) => (
                          <MenuItem 
                            key={role.id} 
                            value={role.id}
                            sx={{
                              // Highlight ADMIN role if project needs admin
                              ...(role.name === 'ADMIN' && !projectHasAdmin && {
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                border: '1px solid rgba(255, 152, 0, 0.3)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                }
                              })
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1} width="100%">
                              {/* Role Icon */}
                              <Box sx={{ minWidth: 24 }}>
                                {role.name === 'ADMIN' ? (
                                  <SecurityIcon fontSize="small" color="warning" />
                                ) : role.icon ? (
                                  <Typography sx={{ fontSize: '1.2em' }}>{role.icon}</Typography>
                                ) : (
                                  <SecurityIcon fontSize="small" color="action" />
                                )}
                              </Box>
                              
                              <Box flex={1}>
                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      fontWeight: role.name === 'ADMIN' ? 600 : 500,
                                      color: role.name === 'ADMIN' && !projectHasAdmin ? 'warning.main' : 'inherit'
                                    }}
                                  >
                                    {role.displayName}
                                    {role.name === 'ADMIN' && !projectHasAdmin && ' ⚠️ REQUIRED'}
                                  </Typography>
                                  {role.isPopular && <StarIcon sx={{ fontSize: 16, color: 'orange' }} />}
                                  {role.isTemplate && (
                                    <Chip 
                                      label="Template" 
                                      size="small" 
                                      sx={{ height: 16, fontSize: '0.65rem' }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {role.description}
                                </Typography>
                                {role.industry && (
                                  <Typography variant="caption" color="primary.main">
                                    {role.industry.replace('_', ' ')} • Level {role.hierarchy}
                                  </Typography>
                                )}
                                {role.tags && role.tags.length > 0 && (
                                  <Box sx={{ mt: 0.5 }}>
                                    {role.tags.slice(0, 3).map((tag) => (
                                      <Chip 
                                        key={tag}
                                        label={tag} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ 
                                          height: 16, 
                                          fontSize: '0.6rem', 
                                          mr: 0.5,
                                          mb: 0.5
                                        }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                              
                              <Box textAlign="right">
                                <Chip 
                                  label={role.category} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mb: 0.5 }}
                                />
                                {role.usageCount && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {role.usageCount} uses
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {assignedRole && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>{assignedRole.displayName}</strong> - Level {assignedRole.hierarchy}
                        </Typography>
                        <Typography variant="caption">
                          {assignedRole.description}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Confirm
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review the team member assignments before confirming
            </Typography>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Project: {projectName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Adding {selectedMembers.length} team member{selectedMembers.length !== 1 ? 's' : ''}
                </Typography>

                {selectedMembers.map((member) => {
                  const assignment = assignments.find(a => a.memberId === member.id);
                  const assignedRole = assignment ? availableRoles.find(r => r.id === assignment.roleId) : null;

                  return (
                    <Box key={member.id} display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar src={member.avatar}>
                        {member.name?.charAt(0) || member.email?.charAt(0)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body1">{member.name || member.email}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end" mb={0.5}>
                          {assignedRole?.icon && (
                            <Typography sx={{ fontSize: '1em' }}>{assignedRole.icon}</Typography>
                          )}
                          <Chip 
                            label={assignedRole?.displayName || 'No Role'} 
                            color={assignedRole ? 'primary' : 'default'}
                            size="small"
                          />
                          {assignedRole?.isPopular && <StarIcon sx={{ fontSize: 14, color: 'orange' }} />}
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {assignedRole?.isTemplate ? 'Template Role' : 'Custom Role'} • Level {assignedRole?.hierarchy || 0}
                        </Typography>
                        {assignedRole?.industry && (
                          <Typography variant="caption" display="block" color="primary.main">
                            {assignedRole.industry.replace('_', ' ')}
                          </Typography>
                        )}
                        {assignedRole?.tags && assignedRole.tags.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            {assignedRole.tags.slice(0, 2).map((tag) => (
                              <Chip 
                                key={tag}
                                label={tag} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  height: 14, 
                                  fontSize: '0.6rem', 
                                  mr: 0.5
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <GroupIcon color="primary" />
            <Box>
              <Typography variant="h6">Team & Role Management</Typography>
              <Typography variant="body2" color="text.secondary">
                {projectName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Progress Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Step Content */}
        {!loading && renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        <Box flex={1} />
        
        {activeStep > 0 && (
          <Button 
            onClick={handleBack} 
            disabled={loading}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        )}
        
        {activeStep < STEPS.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={loading}
            endIcon={<ArrowForwardIcon />}
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading || selectedMembers.length === 0}
            startIcon={<CheckIcon />}
          >
            {loading ? 'Adding...' : 'Add Team Members'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TeamRoleWizard;
