import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowBack,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/context/LoadingContext';
import { useSnackbar } from 'notistack';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setLoading } = useLoading();
  const { enqueueSnackbar } = useSnackbar();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimToken, setInterimToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setLoading(true);
      
      const user = await login(data.email, data.password);
      
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      
      // Redirect based on user role
      const roleUpper = String(user?.role || '').toUpperCase();
      if (roleUpper === 'SUPERADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // If backend returned 2FA challenge, our auth context currently throws. Use authService directly for 2FA branch.
      if (err?.details?.requires2FA || err?.requires2FA) {
        setInterimToken(err?.details?.interimToken || err?.interimToken || null);
      } else {
        const errorMessage = err.message || 'Login failed. Please try again.';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 0 },
      }}
    >
      <Container maxWidth="sm">
        <Box
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                },
              }}
            >
              Back to Home
            </Button>
          </Box>

          <Paper
            elevation={10}
            sx={{
              p: { xs: 4, md: 6 },
              backgroundColor: 'background.paper',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#000',
                  }}
                >
                  D
                </Typography>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Sign in to your BackboneLogic, Inc. account
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                Welcome back! Please sign in to continue.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form or 2FA prompt */}
            {!interimToken ? (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                              sx={{ color: 'text.secondary' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    />
                  )}
                />

                <Box sx={{ textAlign: 'right' }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot your password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                    color: '#000',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </Stack>
            </Box>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Enter the 6-digit code from your authenticator app. You can also use a backup code.
                </Alert>
                <TextField
                  fullWidth
                  label="Authentication code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const { verify2FA } = (await import('@/services/authService')).authService;
                      if (!interimToken) return;
                      const result = await verify2FA(interimToken, twoFactorCode.trim());
                      // Store auth data
                      localStorage.setItem('auth_token', result.token);
                      localStorage.setItem('auth_user', JSON.stringify(result.user));
                      enqueueSnackbar('2FA verified. Welcome back!', { variant: 'success' });
                      
                      // Redirect based on user role
                      const roleUpper = String(result.user?.role || '').toUpperCase();
                      if (roleUpper === 'SUPERADMIN') {
                        navigate('/admin');
                      } else {
                        navigate('/dashboard');
                      }
                    } catch (e: any) {
                      enqueueSnackbar(e.message || 'Invalid code', { variant: 'error' });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                    color: '#000',
                  }}
                >
                  Verify Code
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create one now
                </Link>
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                🔒 Your data is secure and protected by industry-leading encryption
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
