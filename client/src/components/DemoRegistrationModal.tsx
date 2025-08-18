import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';

interface DemoRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface FormErrors {
  email?: string;
  name?: string;
  password?: string;
  acceptTerms?: string;
  acceptPrivacy?: string;
}

const DEMO_FEATURES = [
  'Core Project Management',
  'Basic File Management',
  'Call Sheet Creation',
  'Timecard Submission',
  'Team Chat Features',
  'Basic Reporting',
  'Data Export Tools'
];

export const DemoRegistrationModal: React.FC<DemoRegistrationModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    password: '',
    acceptTerms: false,
    acceptPrivacy: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Terms and privacy validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service';
    }
    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch('/api/demo/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          acceptTerms: formData.acceptTerms,
          acceptPrivacy: formData.acceptPrivacy,
          referralSource: 'landing_page',
          utmSource: 'website',
          utmCampaign: 'demo_trial',
          utmMedium: 'modal'
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.data);
        onClose();
      } else {
        setServerError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Demo registration error:', error);
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        email: '',
        name: '',
        password: '',
        acceptTerms: false,
        acceptPrivacy: false
      });
      setErrors({});
      setServerError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RocketLaunchIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Start Your 14-Day Demo Trial
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Get instant access to Dashboard v14 with all Basic tier features
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              icon={<AccessTimeIcon />}
              label="14 Days Free"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<StarIcon />}
              label="Basic Tier Features"
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<CheckCircleIcon />}
              label="No Credit Card"
              color="success"
              variant="outlined"
            />
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>What's included:</strong> Full access to all Basic tier features for 14 days. 
              You can upgrade to PRO or ENTERPRISE at any time to unlock advanced features.
            </Typography>
          </Alert>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main }}>
              Demo Registration
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                required
                fullWidth
                autoComplete="email"
              />

              <TextField
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
                fullWidth
                autoComplete="name"
              />

              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password || 'Minimum 8 characters'}
                required
                fullWidth
                autoComplete="new-password"
              />

              <Box sx={{ mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acceptTerms}
                      onChange={handleInputChange('acceptTerms')}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the{' '}
                      <Link href="/terms" target="_blank" color="primary">
                        Terms of Service
                      </Link>
                    </Typography>
                  }
                />
                {errors.acceptTerms && (
                  <Typography variant="caption" color="error" display="block">
                    {errors.acceptTerms}
                  </Typography>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acceptPrivacy}
                      onChange={handleInputChange('acceptPrivacy')}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the{' '}
                      <Link href="/privacy" target="_blank" color="primary">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {errors.acceptPrivacy && (
                  <Typography variant="caption" color="error" display="block">
                    {errors.acceptPrivacy}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.success.main }}>
              Demo Features Included
            </Typography>

            <List dense>
              {DEMO_FEATURES.map((feature, index) => (
                <ListItem key={index} sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>

            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>🎯 Pro Tip:</strong> Explore as many features as possible during your trial! 
                You can upgrade anytime to unlock advanced workflows, analytics, and enterprise features.
              </Typography>
            </Alert>
          </Box>
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={isLoading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <RocketLaunchIcon />}
          sx={{
            px: 3,
            background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)',
            }
          }}
        >
          {isLoading ? 'Starting Your Demo...' : 'Start 14-Day Demo Trial'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
