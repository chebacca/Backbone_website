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
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  ArrowBack,
  Check,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/context/LoadingContext';
import { useSnackbar } from 'notistack';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingConsent: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { setLoading } = useLoading();
  const { enqueueSnackbar } = useSnackbar();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected tier from navigation state
  const selectedTier = location.state?.selectedTier;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptPrivacy: false,
      marketingConsent: false,
    },
  });

  const password = watch('password');

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: 'error' };
    
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    
    if (score <= 25) return { score, label: 'Weak', color: 'error' };
    if (score <= 50) return { score, label: 'Fair', color: 'warning' };
    if (score <= 75) return { score, label: 'Good', color: 'info' };
    return { score: Math.min(score, 100), label: 'Strong', color: 'success' };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      setLoading(true);
      
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        acceptTerms: data.acceptTerms,
        acceptPrivacy: data.acceptPrivacy,
        marketingConsent: data.marketingConsent,
      });
      
      enqueueSnackbar('Account created successfully! Please check your email to verify your account.', { 
        variant: 'success',
        autoHideDuration: 7000,
      });
      
      // Navigate to verification page or checkout if tier selected
      if (selectedTier) {
        navigate('/verify-email', { state: { selectedTier } });
      } else {
        navigate('/verify-email');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
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
        <motion.div
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
                  mb: 1,
                  background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Create Account
              </Typography>
              
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
              >
                Join thousands of professionals using BackboneLogic, Inc.
              </Typography>

              {selectedTier && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="primary.main">
                    Selected Plan: <strong>{selectedTier}</strong>
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Register Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Name must be less than 50 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: 'text.secondary' }} />
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
                    validate: {
                      hasLowerCase: (value) =>
                        /[a-z]/.test(value) || 'Password must contain a lowercase letter',
                      hasUpperCase: (value) =>
                        /[A-Z]/.test(value) || 'Password must contain an uppercase letter',
                      hasNumber: (value) =>
                        /\d/.test(value) || 'Password must contain a number',
                    },
                  }}
                  render={({ field }) => (
                    <Box>
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
                                onClick={() => setShowPassword(!showPassword)}
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
                      
                      {password && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Password strength:
                            </Typography>
                            <Typography
                              variant="caption"
                              color={`${passwordStrength.color}.main`}
                              sx={{ fontWeight: 600 }}
                            >
                              {passwordStrength.label}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength.score}
                            color={passwordStrength.color as any}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ color: 'text.secondary' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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

                {/* Terms and Privacy */}
                <Box>
                  <Controller
                    name="acceptTerms"
                    control={control}
                    rules={{
                      required: 'You must accept the Terms of Service',
                    }}
                    render={({ field: { value, onChange } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={onChange}
                            color="primary"
                            icon={<Box sx={{ width: 20, height: 20, border: '2px solid', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 0.5 }} />}
                            checkedIcon={<Box sx={{ width: 20, height: 20, backgroundColor: 'primary.main', color: '#000', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check sx={{ fontSize: 14 }} /></Box>}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            I agree to the{' '}
                            <Link
                              component={RouterLink}
                              to="/terms"
                              target="_blank"
                              sx={{ color: 'primary.main' }}
                            >
                              Terms of Service
                            </Link>
                          </Typography>
                        }
                        sx={{
                          alignItems: 'flex-start',
                          ...(errors.acceptTerms && {
                            color: 'error.main',
                          }),
                        }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="acceptPrivacy"
                    control={control}
                    rules={{
                      required: 'You must accept the Privacy Policy',
                    }}
                    render={({ field: { value, onChange } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={onChange}
                            color="primary"
                            icon={<Box sx={{ width: 20, height: 20, border: '2px solid', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 0.5 }} />}
                            checkedIcon={<Box sx={{ width: 20, height: 20, backgroundColor: 'primary.main', color: '#000', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check sx={{ fontSize: 14 }} /></Box>}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            I agree to the{' '}
                            <Link
                              component={RouterLink}
                              to="/privacy"
                              target="_blank"
                              sx={{ color: 'primary.main' }}
                            >
                              Privacy Policy
                            </Link>
                          </Typography>
                        }
                        sx={{
                          alignItems: 'flex-start',
                          ...(errors.acceptPrivacy && {
                            color: 'error.main',
                          }),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="marketingConsent"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={onChange}
                            color="primary"
                            icon={<Box sx={{ width: 20, height: 20, border: '2px solid', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 0.5 }} />}
                            checkedIcon={<Box sx={{ width: 20, height: 20, backgroundColor: 'primary.main', color: '#000', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check sx={{ fontSize: 14 }} /></Box>}
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            I would like to receive product updates and marketing communications (optional)
                          </Typography>
                        }
                      />
                    )}
                  />

                  {(errors.acceptTerms || errors.acceptPrivacy) && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                      {errors.acceptTerms?.message || errors.acceptPrivacy?.message}
                    </Typography>
                  )}
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
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                🔒 Your data is secure and protected by industry-leading encryption
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterPage;
