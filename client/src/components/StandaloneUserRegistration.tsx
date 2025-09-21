import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  ShoppingCart,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface StandaloneUserRegistrationProps {
  onSuccess?: (userData: any) => void;
  onClose?: () => void;
  redirectTo?: string;
}

const StandaloneUserRegistration: React.FC<StandaloneUserRegistrationProps> = ({
  onSuccess,
  onClose,
  redirectTo = '/marketplace'
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Register user with standalone type
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: 'standalone', // Special user type for marketplace purchases
          marketingConsent: false, // Default to false for standalone users
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success
      if (onSuccess) {
        onSuccess(data);
      } else {
        // Navigate to marketplace or specified redirect
        navigate(redirectTo);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Card sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(0, 212, 255, 0.2)'
          : '1px solid rgba(102, 126, 234, 0.3)',
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mx: 'auto', 
              mb: 2 
            }}>
              <ShoppingCart sx={{ fontSize: 30, color: '#000' }} />
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign up to purchase standalone Backbone tools
            </Typography>
          </Box>

          {/* Benefits */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip 
                icon={<CheckCircle />} 
                label="Instant Access" 
                size="small" 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                icon={<CheckCircle />} 
                label="Secure Downloads" 
                size="small" 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                icon={<CheckCircle />} 
                label="Email Support" 
                size="small" 
                color="success" 
                variant="outlined" 
              />
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                helperText="Minimum 8 characters"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  color: '#000',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00b8e6 0%, #5a6fd8 100%)',
                  },
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue Shopping'}
              </Button>

              {onClose && (
                <Button
                  variant="outlined"
                  onClick={onClose}
                  fullWidth
                >
                  Cancel
                </Button>
              )}
            </Stack>
          </Box>

          {/* Terms */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              By creating an account, you agree to our{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/terms')}
                sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
              >
                Terms of Service
              </Button>
              {' '}and{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/privacy')}
                sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
              >
                Privacy Policy
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StandaloneUserRegistration;

