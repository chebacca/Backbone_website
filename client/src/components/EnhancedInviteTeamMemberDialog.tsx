/**
 * 🔥 Enhanced Invite Team Member Dialog
 * 
 * Complete end-to-end team member creation with proper Firebase integration:
 * - Firebase Auth user creation
 * - Firestore collections population (users, teamMembers, orgMembers)
 * - License assignment
 * - Role-based access control
 * - Real-time validation and error handling
 */

import React, { useState, useEffect } from 'react';
import { useReactInstanceConflictPrevention } from '@/hooks/useReactInstanceConflictPrevention';
import ReactInstanceConflictGuard from './ReactInstanceConflictGuard';
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
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  FormControlLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Types
interface TeamMemberData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department: string;
  position: string;
  role: 'MEMBER' | 'ADMIN' | 'MANAGER' | 'VIEWER';
  licenseType: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  temporaryPassword: string;
  activateImmediately: boolean;
  sendWelcomeEmail: boolean;
}

interface License {
  id: string;
  tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED';
  assignedTo?: string;
  expiresAt: string;
  key: string;
}

interface EnhancedInviteTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (teamMember: any) => void;
  currentUser?: any;
  organization?: any;
  availableLicenses?: License[];
}

const EnhancedInviteTeamMemberDialog: React.FC<EnhancedInviteTeamMemberDialogProps> = React.memo(({
  open,
  onClose,
  onSuccess,
  currentUser,
  organization,
  availableLicenses = []
}) => {
  // Early return to prevent React Error #301
  if (!open) {
    return null;
  }

  // Additional safety check
  if (!onClose || !onSuccess) {
    console.warn('⚠️ [EnhancedInviteTeamMemberDialog] Missing required props');
    return null;
  }

  // React instance conflict prevention
  const { isSafeToRender, forceSafeRender } = useReactInstanceConflictPrevention({
    componentName: 'EnhancedInviteTeamMemberDialog',
    delay: 100,
    maxRetries: 3
  });

  const { enqueueSnackbar } = useSnackbar();
  
  // Form state
  const [formData, setFormData] = useState<TeamMemberData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    position: '',
    role: 'MEMBER',
    licenseType: 'PROFESSIONAL',
    temporaryPassword: '',
    activateImmediately: true,
    sendWelcomeEmail: true
  });

  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    emailAvailable: boolean | null;
    licenseAvailable: boolean | null;
    passwordStrength: 'weak' | 'medium' | 'strong' | null;
  }>({
    emailAvailable: null,
    licenseAvailable: null,
    passwordStrength: null
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      try {
        // Force safe render if needed
        if (!isSafeToRender) {
          forceSafeRender();
        }
        
        // Use requestAnimationFrame to prevent React Error #301
        const frameId = requestAnimationFrame(() => {
          setFormData({
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            department: '',
            position: '',
            role: 'MEMBER',
            licenseType: 'PROFESSIONAL',
            temporaryPassword: '',
            activateImmediately: true,
            sendWelcomeEmail: true
          });
          setActiveStep(0);
          setErrors({});
          setValidationResults({
            emailAvailable: null,
            licenseAvailable: null,
            passwordStrength: null
          });
        });

        return () => {
          cancelAnimationFrame(frameId);
        };
      } catch (error) {
        console.warn('⚠️ [EnhancedInviteTeamMemberDialog] Error in useEffect:', error);
      }
    }
  }, [open, isSafeToRender, forceSafeRender]);

  // Generate secure password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, temporaryPassword: password }));
    validatePassword(password);
  };

  // Validate password strength
  const validatePassword = (password: string) => {
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    
    if (password.length >= 8) {
      if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
        strength = 'strong';
      } else if (password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
        strength = 'medium';
      }
    }
    
    setValidationResults(prev => ({ ...prev, passwordStrength: strength }));
  };

  // Validate email availability
  const validateEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      setValidationResults(prev => ({ ...prev, emailAvailable: null }));
      return;
    }

    try {
      // Check if email is already in use
      const apiBaseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/backbone-logic/us-central1/api'
        : 'https://us-central1-backbone-logic.cloudfunctions.net/api';
      
      const response = await fetch(`${apiBaseUrl}/team-members/validate-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ 
          email,
          organizationId: organization?.id 
        })
      });
      
      const result = await response.json();
      setValidationResults(prev => ({ 
        ...prev, 
        emailAvailable: result.data?.canProceed || false
      }));
    } catch (error) {
      console.error('Error validating email:', error);
      setValidationResults(prev => ({ ...prev, emailAvailable: null }));
    }
  };

  // Check license availability
  const checkLicenseAvailability = () => {
    const availableCount = availableLicenses.filter(
      license => license.status === 'PENDING' || (license.status === 'ACTIVE' && !license.assignedTo)
    ).length;
    
    setValidationResults(prev => ({ 
      ...prev, 
      licenseAvailable: availableCount > 0 
    }));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.temporaryPassword.trim()) {
      newErrors.temporaryPassword = 'Temporary password is required';
    } else if (formData.temporaryPassword.length < 8) {
      newErrors.temporaryPassword = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      enqueueSnackbar('Please fix the form errors', { variant: 'error' });
      return;
    }

    if (validationResults.emailAvailable === false) {
      enqueueSnackbar('Email is already in use', { variant: 'error' });
      return;
    }

    if (validationResults.licenseAvailable === false) {
      enqueueSnackbar('No available licenses', { variant: 'error' });
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 [EnhancedInviteTeamMemberDialog] Creating team member:', formData);

      // Create team member via API
      const apiBaseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/backbone-logic/us-central1/api'
        : 'https://us-central1-backbone-logic.cloudfunctions.net/api';
      
      const response = await fetch(`${apiBaseUrl}/team-members/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          ...formData,
          organizationId: organization?.id,
          createdBy: currentUser?.id
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create team member');
      }

      console.log('✅ [EnhancedInviteTeamMemberDialog] Team member created successfully:', result.data);

      enqueueSnackbar(
        `Team member ${formData.firstName} ${formData.lastName} created successfully!`,
        { variant: 'success' }
      );

      if (onSuccess) {
        onSuccess(result.data);
      }

      onClose();

    } catch (error) {
      console.error('❌ [EnhancedInviteTeamMemberDialog] Error creating team member:', error);
      enqueueSnackbar(
        `Failed to create team member: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Get auth token
  const getAuthToken = async (): Promise<string> => {
    try {
      // Try to get Firebase Auth token
      const { auth } = await import('@/services/firebase');
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
    } catch (error) {
      console.warn('Failed to get Firebase Auth token:', error);
    }
    
    // Fallback to localStorage token or placeholder
    return localStorage.getItem('authToken') || 'placeholder-token';
  };

  // Steps configuration
  const steps = [
    {
      label: 'Personal Information',
      description: 'Basic contact details'
    },
    {
      label: 'Role & Department',
      description: 'Position and access level'
    },
    {
      label: 'Security & Access',
      description: 'Password and permissions'
    },
    {
      label: 'Review & Create',
      description: 'Final review and creation'
    }
  ];

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  validateEmail(e.target.value);
                }}
                error={!!errors.email || validationResults.emailAvailable === false}
                helperText={
                  errors.email || 
                  (validationResults.emailAvailable === false ? 'Email is already in use' : '')
                }
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                required
              />
              {validationResults.emailAvailable === true && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Email available"
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number (Optional)"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                error={!!errors.department}
                helperText={errors.department}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                error={!!errors.position}
                helperText={errors.position}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                >
                  <MenuItem value="MEMBER">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Member</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Can view and edit assigned projects
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="MANAGER">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Manager</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Can manage team members and projects
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="ADMIN">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Admin</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Full administrative access
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="VIEWER">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Viewer</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Read-only access to assigned projects
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>License Type</InputLabel>
                <Select
                  value={formData.licenseType}
                  label="License Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, licenseType: e.target.value as any }))}
                >
                  <MenuItem value="BASIC">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Basic</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Essential features and 1 project
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="PROFESSIONAL">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Professional</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Advanced features and unlimited projects
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="ENTERPRISE">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">Enterprise</Typography>
                      <Typography variant="caption" color="text.secondary">
                        All features with priority support
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Temporary Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.temporaryPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, temporaryPassword: e.target.value }));
                  validatePassword(e.target.value);
                }}
                error={!!errors.temporaryPassword}
                helperText={errors.temporaryPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                required
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  size="small"
                  onClick={generateSecurePassword}
                  startIcon={<SecurityIcon />}
                >
                  Generate Secure Password
                </Button>
                {validationResults.passwordStrength && (
                  <Chip
                    label={`Password: ${validationResults.passwordStrength}`}
                    color={
                      validationResults.passwordStrength === 'strong' ? 'success' :
                      validationResults.passwordStrength === 'medium' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    checked={formData.activateImmediately}
                    onChange={(e) => setFormData(prev => ({ ...prev, activateImmediately: e.target.checked }))}
                    aria-label="Activate account immediately"
                  />
                }
                label="Activate account immediately (user can login right away)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    checked={formData.sendWelcomeEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                    aria-label="Send welcome email with login credentials"
                  />
                }
                label="Send welcome email with login credentials"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Team Member Details
            </Typography>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {formData.firstName} {formData.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{formData.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1">{formData.department}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Position
                    </Typography>
                    <Typography variant="body1">{formData.position}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1">{formData.role}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      License Type
                    </Typography>
                    <Typography variant="body1">{formData.licenseType}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {availableLicenses.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No available licenses found. The team member will be created but won't have access to the system until a license is assigned.
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  // Prevent rendering during React instance conflicts
  if (!isSafeToRender) {
    return null;
  }

  return (
    <ReactInstanceConflictGuard 
      componentName="EnhancedInviteTeamMemberDialog"
      fallback={<div>Loading...</div>}
    >
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6">
              Invite Team Member
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        {organization && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Organization: {organization.name}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="subtitle1" fontWeight="medium">
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(index + 1)}
                    disabled={index === steps.length - 1}
                    sx={{ mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Create Team Member' : 'Next'}
                  </Button>
                  {index > 0 && (
                    <Button onClick={() => setActiveStep(index - 1)}>
                      Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !validateForm()}
          startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
        >
          {loading ? 'Creating...' : 'Create Team Member'}
        </Button>
      </DialogActions>
      </Dialog>
    </ReactInstanceConflictGuard>
  );
});

EnhancedInviteTeamMemberDialog.displayName = 'EnhancedInviteTeamMemberDialog';

export default EnhancedInviteTeamMemberDialog;
