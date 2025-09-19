/**
 * Simple Invite Team Member Dialog
 * 
 * A clean, simple implementation without complex React instance management
 * that actually works without React Error #301
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface SimpleInviteTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (teamMember: any) => void;
  currentUser?: any;
  organization?: any;
  availableLicenses?: any[];
}

const SimpleInviteTeamMemberDialog: React.FC<SimpleInviteTeamMemberDialogProps> = ({
  open,
  onClose,
  onSuccess,
  currentUser,
  organization,
  availableLicenses = []
}) => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Simple form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'MEMBER',
    department: '',
    position: '',
    phone: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'MEMBER',
        department: '',
        position: '',
        phone: '',
        password: ''
      });
      setErrors({});
      setLoading(false);
    }
  }, [open]);

  // Generate secure password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission using Firebase directly
  const handleSubmit = async () => {
    if (!validateForm()) {
      enqueueSnackbar('Please fix the form errors', { variant: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      // Import Firebase v9 services
      const { auth, db } = await import('@/services/firebase');
      const { collection, addDoc, getDocs, query, where } = await import('firebase/firestore');
      
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUser = auth.currentUser;
      const organizationId = organization?.organization?.id || organization?.id;
      
      if (!organizationId) {
        throw new Error('Organization ID not found');
      }

      // Create team member document in Firestore
      const teamMemberData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        department: formData.department || '',
        position: formData.position || '',
        phone: formData.phone || '',
        organizationId: organizationId,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        status: 'PENDING', // New team member starts as pending
        createdAt: new Date(),
        updatedAt: new Date(),
        // Store temporary password (in real app, this would be sent via email)
        temporaryPassword: formData.password,
        // License assignment will be handled separately
        assignedLicenseId: null,
        assignedLicenseKey: null
      };

      // Add to teamMembers collection using v9 API
      const teamMemberRef = await addDoc(collection(db, 'teamMembers'), teamMemberData);
      
      // Also add to users collection for consistency
      const userData = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        organizationId: organizationId,
        isTeamMember: true,
        memberRole: formData.role,
        memberStatus: 'PENDING',
        createdBy: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Store temporary password
        temporaryPassword: formData.password,
        // Firebase Auth will be created separately
        firebaseUid: null, // Will be set when they first log in
        emailVerified: false
      };

      await addDoc(collection(db, 'users'), userData);

      // Create the result object
      const result = {
        id: teamMemberRef.id,
        ...teamMemberData
      };

      enqueueSnackbar('Team member created successfully!', { variant: 'success' });
      onSuccess(result);
      onClose();
      
    } catch (error: any) {
      console.error('Error creating team member:', error);
      enqueueSnackbar(`Failed to create team member: ${error?.message || 'Unknown error'}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6">Invite Team Member</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                inputProps={{
                  autoComplete: 'given-name'
                }}
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
                inputProps={{
                  autoComplete: 'family-name'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={!!errors.email}
                helperText={errors.email}
                required
                inputProps={{
                  autoComplete: 'email'
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                >
                  <MenuItem value="MEMBER">Member</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="VIEWER">Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                inputProps={{
                  autoComplete: 'tel'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Temporary Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                error={!!errors.password}
                helperText={errors.password || 'Minimum 8 characters'}
                required
                inputProps={{
                  autoComplete: 'new-password'
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                size="small"
                onClick={generatePassword}
                sx={{ mt: 1 }}
              >
                Generate Secure Password
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
        >
          {loading ? 'Creating...' : 'Create Team Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleInviteTeamMemberDialog;
