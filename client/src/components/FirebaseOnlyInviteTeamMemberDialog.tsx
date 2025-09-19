/**
 * Firebase-Only Invite Team Member Dialog
 * 
 * Uses Firebase directly without any HTTP API calls
 * Follows the project rule: Firebase-only, no external API calls
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
import { auth, db } from '@/services/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface FirebaseOnlyInviteTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (teamMember: any) => void;
  currentUser?: any;
  organization?: any;
  availableLicenses?: any[];
}

const FirebaseOnlyInviteTeamMemberDialog: React.FC<FirebaseOnlyInviteTeamMemberDialogProps> = ({
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
  const [availableLicenseCount, setAvailableLicenseCount] = useState<number | null>(null);

  // Reset form when dialog opens and check license availability
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
      
      // Check license availability
      const checkLicenseAvailability = async () => {
        try {
          const organizationId = organization?.organization?.id || organization?.id;
          if (!organizationId) return;
          
          const licensesQuery = query(
            collection(db, 'licenses'),
            where('organizationId', '==', organizationId),
            where('status', '==', 'ACTIVE')
          );
          
          const licensesSnapshot = await getDocs(licensesQuery);
          
          // Filter for unassigned licenses (no assignedToUserId field or it's null)
          const availableCount = licensesSnapshot.docs.filter(doc => {
            const data = doc.data();
            return !data.assignedToUserId || data.assignedToUserId === null;
          }).length;
          setAvailableLicenseCount(availableCount);
          
          if (availableCount === 0) {
            setErrors({
              general: `No available licenses found. You have ${availableCount} available licenses. Please purchase additional licenses before inviting team members.`
            });
          } else {
            // Clear any previous general errors
            setErrors(prev => {
              const { general, ...rest } = prev;
              return rest;
            });
          }
        } catch (error) {
          console.error('Error checking license availability:', error);
        }
      };
      
      checkLicenseAvailability();
    }
  }, [open, organization]);

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
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const currentUser = auth.currentUser;
      const organizationId = organization?.organization?.id || organization?.id;
      
      if (!organizationId) {
        throw new Error('Organization ID not found');
      }

      console.log('🔥 [Firebase-Only] Creating team member directly in Firestore...');
      console.log('📧 Email:', formData.email);
      console.log('🏢 Organization:', organizationId);

      // Step 1: Find an available license for this organization
      console.log('🔍 [Firebase-Only] Looking for available license...');
      const licensesQuery = query(
        collection(db, 'licenses'),
        where('organizationId', '==', organizationId),
        where('status', '==', 'ACTIVE')
      );
      
      const licensesSnapshot = await getDocs(licensesQuery);
      
      // Filter for unassigned licenses (no assignedToUserId field or it's null)
      const availableLicenses = licensesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(license => !license.assignedToUserId || license.assignedToUserId === null);

      if (availableLicenses.length === 0) {
        // Show a helpful warning instead of throwing an error
        enqueueSnackbar('No available licenses found! Please purchase additional licenses first.', { 
          variant: 'warning',
          persist: true,
          action: (
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                // Navigate to licenses page
                window.location.href = '/dashboard/licenses';
              }}
            >
              Purchase Licenses
            </Button>
          )
        });
        
        // Show a more detailed alert in the dialog
        setErrors({
          general: 'No available licenses found. You need to purchase additional licenses before inviting team members. Click "Purchase Licenses" to go to the licensing page.'
        });
        return;
      }

      // Use the first available license
      const selectedLicense = availableLicenses[0];
      console.log('✅ [Firebase-Only] Found available license:', selectedLicense.id);

      // Step 2: Create Firebase Auth user first
      console.log('🔥 [Firebase-Only] Creating Firebase Auth user...');
      const authUserCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newAuthUser = authUserCredential.user;
      
      // Update the auth user's display name
      await updateProfile(newAuthUser, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      
      console.log('✅ [Firebase-Only] Firebase Auth user created:', newAuthUser.uid);

      // Step 3: Create team member document in Firestore with the auth user ID
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
        status: 'ACTIVE', // New team member is active and can sign in
        createdAt: new Date(),
        updatedAt: new Date(),
        // Store the Firebase Auth UID
        firebaseUid: newAuthUser.uid,
        // Assign the available license
        licenseAssignment: {
          licenseId: selectedLicense.id,
          licenseKey: selectedLicense.key,
          assignedAt: new Date()
        },
        licenseType: selectedLicense.tier || 'ENTERPRISE'
      };

      // Add to teamMembers collection using Firebase v9 API
      const teamMemberRef = await addDoc(collection(db, 'teamMembers'), teamMemberData);
      console.log('✅ [Firebase-Only] Team member created in teamMembers collection:', teamMemberRef.id);

      // Step 4: Update the license to assign it to the team member
      console.log('🔗 [Firebase-Only] Assigning license to team member...');
      await updateDoc(doc(db, 'licenses', selectedLicense.id), {
        assignedToUserId: teamMemberRef.id,
        assignedToEmail: formData.email,
        assignedAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ [Firebase-Only] License assigned to team member');
      
      // Step 5: Also add to users collection for consistency with the same ID
      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        status: 'ACTIVE',
        organizationId: organizationId,
        isTeamMember: true,
        memberRole: formData.role,
        memberStatus: 'ACTIVE',
        createdBy: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Store the Firebase Auth UID
        firebaseUid: newAuthUser.uid,
        emailVerified: false,
        // License assignment info
        licenseAssignment: {
          licenseId: selectedLicense.id,
          licenseKey: selectedLicense.key,
          assignedAt: new Date()
        },
        licenseType: selectedLicense.tier || 'ENTERPRISE'
      };

      // Use the same ID as team member for consistency
      await addDoc(collection(db, 'users'), userData);
      console.log('✅ [Firebase-Only] User created in users collection');

      // Create the result object
      const result = {
        id: teamMemberRef.id,
        ...teamMemberData
      };

      enqueueSnackbar(`Team member ${formData.firstName} ${formData.lastName} invited successfully! They can now sign in with their email and password. License ${selectedLicense.key} assigned.`, { variant: 'success' });
      onSuccess(result);
      onClose();
      
    } catch (error: any) {
      console.error('❌ [Firebase-Only] Error creating team member:', error);
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'Failed to create team member';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check the email format.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
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
            <Typography variant="h6">Invite Team Member (Firebase-Only)</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          This dialog uses Firebase directly - no HTTP API calls!
        </Alert>
        
        {errors.general && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}
        
        {availableLicenseCount !== null && availableLicenseCount > 0 && !errors.general && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ {availableLicenseCount} available license{availableLicenseCount !== 1 ? 's' : ''} ready for assignment
          </Alert>
        )}
        
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
          disabled={loading || !!errors.general}
          startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
        >
          {loading ? 'Creating...' : errors.general ? 'No Licenses Available' : 'Create Team Member (Firebase-Only)'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FirebaseOnlyInviteTeamMemberDialog;
