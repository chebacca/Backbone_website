import React, { useState, useEffect } from 'react';
import roleManagementService from '../../services/RoleManagementService';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Badge,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  baseRole: 'ADMIN' | 'DO_ER' | 'GUEST';
  productionRoles: string[];
  isActive: boolean;
}

interface RolePreset {
  name: string;
  roles: string[];
  description: string;
  category: string;
}

interface PermissionPreview {
  project: {
    canAccessProject: boolean;
    canModifyProject: boolean;
    canManageTeam: boolean;
    canDeleteProject: boolean;
  };
  production: {
    canEditVideo: boolean;
    canManageQC: boolean;
    canManageAudio: boolean;
    canManageGraphics: boolean;
    canCoordinate: boolean;
  };
}

interface ContextualRoleManagerProps {
  open: boolean;
  onClose: () => void;
  teamMember: TeamMember | null;
  projectId: string;
  onRoleUpdate: (teamMemberId: string, roles: string[]) => void;
}

const ContextualRoleManager: React.FC<ContextualRoleManagerProps> = ({
  open,
  onClose,
  teamMember,
  projectId,
  onRoleUpdate
}) => {
  // State management
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [rolePresets, setRolePresets] = useState<RolePreset[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [permissionPreview, setPermissionPreview] = useState<PermissionPreview | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [customPresets, setCustomPresets] = useState<RolePreset[]>([]);

  // Default role presets (from backend)
  const defaultPresets: RolePreset[] = [
    {
      name: 'Video Editor',
      roles: ['EDITOR', 'ASSISTANT_EDITOR'],
      description: 'Full video editing capabilities',
      category: 'Editorial'
    },
    {
      name: 'Audio Team',
      roles: ['AUDIO_ENGINEER', 'SOUND_ENGINEER'],
      description: 'Audio production and engineering',
      category: 'Audio'
    },
    {
      name: 'Graphics Team',
      roles: ['GRAPHICS_DESIGNER', 'GFX_ARTIST'],
      description: 'Graphics and motion design',
      category: 'Graphics'
    },
    {
      name: 'QC Team',
      roles: ['QC_SPECIALIST'],
      description: 'Quality control and review',
      category: 'Quality Control'
    },
    {
      name: 'Post Supervisor',
      roles: ['POST_COORDINATOR', 'EDITOR', 'QC_SPECIALIST'],
      description: 'Post-production supervision and coordination',
      category: 'Management'
    },
    {
      name: 'Production Team',
      roles: ['PRODUCER', 'ASSOCIATE_PRODUCER', 'PRODUCTION_ASSISTANT'],
      description: 'Production management and coordination',
      category: 'Production'
    }
  ];

  // All available production roles
  const allProductionRoles = [
    'ADMIN', 'SUPERCOORDINATOR', 'MANAGER', 'POST_COORDINATOR', 'PRODUCER',
    'EDITOR', 'ASSISTANT_EDITOR', 'DO_ER', 'QC_SPECIALIST', 'COLORIST',
    'AUDIO_ENGINEER', 'SOUND_ENGINEER', 'GRAPHICS_DESIGNER', 'GFX_ARTIST',
    'MEDIA_MANAGER', 'PRODUCTION_ASSISTANT', 'ASSOCIATE_PRODUCER', 'GUEST'
  ];

  // Initialize component
  useEffect(() => {
    if (teamMember && open) {
      setSelectedRoles(teamMember.productionRoles || []);
      setRolePresets(defaultPresets);
      setAvailableRoles(allProductionRoles);
      loadCustomPresets();
      validateAndPreview(teamMember.baseRole, teamMember.productionRoles || []);
    }
  }, [teamMember, open]);

  // Load custom presets from localStorage or API
  const loadCustomPresets = () => {
    try {
      const saved = localStorage.getItem(`customPresets_${projectId}`);
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load custom presets:', error);
    }
  };

  // Save custom presets
  const saveCustomPresets = (presets: RolePreset[]) => {
    try {
      localStorage.setItem(`customPresets_${projectId}`, JSON.stringify(presets));
      setCustomPresets(presets);
    } catch (error) {
      console.error('Failed to save custom presets:', error);
    }
  };

  // Validate role assignment and generate preview
  const validateAndPreview = async (baseRole: string, productionRoles: string[]) => {
    if (!teamMember) return;

    try {
      setLoading(true);
      
      // Real API calls
      const validationResponse = await validateRoles(baseRole, productionRoles);
      const previewResponse = await generatePreview(baseRole, productionRoles);
      
      setIsValid(validationResponse.isValid);
      setValidationMessage(validationResponse.message);
      setPermissionPreview(previewResponse);
    } catch (error) {
      console.error('Validation failed:', error);
      setIsValid(false);
      setValidationMessage('Failed to validate role assignment');
    } finally {
      setLoading(false);
    }
  };

  // Real API functions
  const validateRoles = async (baseRole: string, productionRoles: string[]) => {
    try {
      const response = await roleManagementService.validateRoleAssignment(baseRole, productionRoles);
      if (response.success && response.data) {
        return { isValid: response.data.isValid, message: response.data.message };
      } else {
        return { isValid: false, message: response.error || 'Validation failed' };
      }
    } catch (error) {
      console.error('Role validation error:', error);
      return { isValid: false, message: 'Failed to validate roles' };
    }
  };

  const generatePreview = async (baseRole: string, productionRoles: string[]) => {
    try {
      const response = await roleManagementService.getPermissionsPreview(baseRole, productionRoles);
      if (response.success && response.data) {
        return response.data.permissions;
      } else {
        // Fallback to basic preview
        return {
          project: {
            canAccessProject: true,
            canModifyProject: baseRole !== 'GUEST',
            canManageTeam: baseRole === 'ADMIN',
            canDeleteProject: baseRole === 'ADMIN'
          },
          production: {
            canEditVideo: productionRoles.some(role => ['EDITOR', 'ASSISTANT_EDITOR'].includes(role)) || baseRole === 'ADMIN',
            canManageQC: productionRoles.includes('QC_SPECIALIST') || baseRole === 'ADMIN',
            canManageAudio: productionRoles.includes('AUDIO_ENGINEER') || baseRole === 'ADMIN',
            canManageGraphics: productionRoles.includes('GRAPHICS_DESIGNER') || baseRole === 'ADMIN',
            canCoordinate: productionRoles.includes('POST_COORDINATOR') || baseRole === 'ADMIN'
          }
        };
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      // Return fallback preview
      return {
        project: {
          canAccessProject: true,
          canModifyProject: baseRole !== 'GUEST',
          canManageTeam: baseRole === 'ADMIN',
          canDeleteProject: baseRole === 'ADMIN'
        },
        production: {
          canEditVideo: productionRoles.some(role => ['EDITOR', 'ASSISTANT_EDITOR'].includes(role)) || baseRole === 'ADMIN',
          canManageQC: productionRoles.includes('QC_SPECIALIST') || baseRole === 'ADMIN',
          canManageAudio: productionRoles.includes('AUDIO_ENGINEER') || baseRole === 'ADMIN',
          canManageGraphics: productionRoles.includes('GRAPHICS_DESIGNER') || baseRole === 'ADMIN',
          canCoordinate: productionRoles.includes('POST_COORDINATOR') || baseRole === 'ADMIN'
        }
      };
    }
  };

  // Handle role selection
  const handleRoleToggle = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    
    setSelectedRoles(newRoles);
    if (teamMember) {
      validateAndPreview(teamMember.baseRole, newRoles);
    }
  };

  // Apply preset
  const applyPreset = (preset: RolePreset) => {
    setSelectedRoles(preset.roles);
    if (teamMember) {
      validateAndPreview(teamMember.baseRole, preset.roles);
    }
  };

  // Create custom preset
  const createCustomPreset = () => {
    if (!newRoleName.trim() || selectedRoles.length === 0) return;
    
    const newPreset: RolePreset = {
      name: newRoleName,
      roles: [...selectedRoles],
      description: newRoleDescription || `Custom preset: ${newRoleName}`,
      category: 'Custom'
    };
    
    const updatedPresets = [...customPresets, newPreset];
    saveCustomPresets(updatedPresets);
    
    setNewRoleName('');
    setNewRoleDescription('');
  };

  // Save changes
  const handleSave = async () => {
    if (!teamMember || !isValid) return;
    
    try {
      setLoading(true);
      
      // Call the real API to assign production roles
      const response = await roleManagementService.assignProductionRoles(
        projectId,
        teamMember.id,
        selectedRoles
      );
      
      if (response.success) {
        onRoleUpdate(teamMember.id, selectedRoles);
        onClose();
      } else {
        setValidationMessage(response.error || 'Failed to save role changes');
        setIsValid(false);
      }
    } catch (error) {
      console.error('Error saving roles:', error);
      setValidationMessage('Failed to save role changes');
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  // Get role category color
  const getRoleCategoryColor = (role: string) => {
    if (['ADMIN', 'SUPERCOORDINATOR', 'MANAGER'].includes(role)) return 'error';
    if (['POST_COORDINATOR', 'PRODUCER'].includes(role)) return 'warning';
    if (['EDITOR', 'ASSISTANT_EDITOR'].includes(role)) return 'primary';
    if (['QC_SPECIALIST'].includes(role)) return 'secondary';
    if (['AUDIO_ENGINEER', 'SOUND_ENGINEER'].includes(role)) return 'info';
    if (['GRAPHICS_DESIGNER', 'GFX_ARTIST'].includes(role)) return 'success';
    return 'default';
  };

  if (!teamMember) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <SecurityIcon color="primary" />
            <Box>
              <Typography variant="h6">
                Production Roles for {teamMember.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Base Access: <Chip 
                  label={teamMember.baseRole} 
                  size="small" 
                  color={teamMember.baseRole === 'ADMIN' ? 'error' : teamMember.baseRole === 'DO_ER' ? 'primary' : 'default'}
                /> (from project assignment)
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left Panel - Role Selection */}
          <Grid item xs={12} md={8}>
            {/* Quick Presets */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <StarIcon color="primary" />
                  <Typography variant="h6">Quick Presets</Typography>
                </Box>
                
                <Grid container spacing={1}>
                  {[...rolePresets, ...customPresets].map((preset) => (
                    <Grid item key={preset.name}>
                      <Tooltip title={preset.description}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={preset.category === 'Custom' ? <SettingsIcon /> : <GroupIcon />}
                          onClick={() => applyPreset(preset)}
                          sx={{ mb: 1 }}
                        >
                          {preset.name}
                        </Button>
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Individual Role Selection */}
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <GroupIcon color="primary" />
                    <Typography variant="h6">Production Roles</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAdvanced}
                        onChange={(e) => setShowAdvanced(e.target.checked)}
                      />
                    }
                    label="Advanced Mode"
                  />
                </Box>

                <Grid container spacing={1}>
                  {availableRoles
                    .filter(role => showAdvanced || !['ADMIN', 'SUPERCOORDINATOR', 'GUEST'].includes(role))
                    .map((role) => (
                    <Grid item key={role}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedRoles.includes(role)}
                            onChange={() => handleRoleToggle(role)}
                            disabled={loading}
                          />
                        }
                        label={
                          <Chip
                            label={role.replace(/_/g, ' ')}
                            size="small"
                            color={getRoleCategoryColor(role)}
                            variant={selectedRoles.includes(role) ? 'filled' : 'outlined'}
                          />
                        }
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Custom Preset Creation */}
                {showAdvanced && (
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Create Custom Preset</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                          label="Preset Name"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          size="small"
                          fullWidth
                        />
                        <TextField
                          label="Description (optional)"
                          value={newRoleDescription}
                          onChange={(e) => setNewRoleDescription(e.target.value)}
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                        />
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={createCustomPreset}
                          disabled={!newRoleName.trim() || selectedRoles.length === 0}
                          size="small"
                        >
                          Create Preset
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel - Permissions Preview */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <PreviewIcon color="primary" />
                  <Typography variant="h6">Permissions Preview</Typography>
                </Box>

                {/* Validation Status */}
                <Alert 
                  severity={isValid ? 'success' : 'error'} 
                  sx={{ mb: 2 }}
                  icon={isValid ? <CheckCircleIcon /> : <WarningIcon />}
                >
                  {validationMessage}
                </Alert>

                {/* Permission Details */}
                {permissionPreview && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Project Permissions
                    </Typography>
                    <Box mb={2}>
                      {Object.entries(permissionPreview.project).map(([key, value]) => (
                        <Box key={key} display="flex" alignItems="center" gap={1} mb={0.5}>
                          <CheckCircleIcon 
                            fontSize="small" 
                            color={value ? 'success' : 'disabled'} 
                          />
                          <Typography variant="body2" color={value ? 'text.primary' : 'text.secondary'}>
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" gutterBottom>
                      Production Permissions
                    </Typography>
                    <Box>
                      {Object.entries(permissionPreview.production).map(([key, value]) => (
                        <Box key={key} display="flex" alignItems="center" gap={1} mb={0.5}>
                          <CheckCircleIcon 
                            fontSize="small" 
                            color={value ? 'success' : 'disabled'} 
                          />
                          <Typography variant="body2" color={value ? 'text.primary' : 'text.secondary'}>
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Selected Roles Summary */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Selected Roles ({selectedRoles.length})
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {selectedRoles.map((role) => (
                    <Chip
                      key={role}
                      label={role.replace(/_/g, ' ')}
                      size="small"
                      color={getRoleCategoryColor(role)}
                      onDelete={() => handleRoleToggle(role)}
                    />
                  ))}
                  {selectedRoles.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No production roles selected
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isValid || loading}
          startIcon={<SaveIcon />}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContextualRoleManager;
