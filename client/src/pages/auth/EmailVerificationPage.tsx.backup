import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Email,
  CheckCircle,
  Error,
  Refresh,
  ArrowForward,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/context/LoadingContext';
import { useSnackbar } from 'notistack';
import { authService } from '@/services/authService';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const { setLoading } = useLoading();
  const { enqueueSnackbar } = useSnackbar();
  
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const selectedTier = location.state?.selectedTier;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = urlParams.get('token');
    const effectiveToken = token || tokenFromQuery || '';
    if (effectiveToken) {
      verifyEmailToken(effectiveToken);
    }
  }, [token]);

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      setVerificationStatus('verifying');
      setError(null);
      
      await authService.verifyEmail(verificationToken);
      
      // Refresh user data to get updated verification status
      await refreshUser();
      
      setVerificationStatus('success');
      enqueueSnackbar('Email verified successfully!', { variant: 'success' });
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        if (selectedTier) {
          navigate('/checkout', { state: { tier: selectedTier } });
        } else {
          navigate('/dashboard');
        }
      }, 3000);
    } catch (err: any) {
      setVerificationStatus('error');
      setError(err.message || 'Email verification failed');
      enqueueSnackbar(err.message || 'Email verification failed', { variant: 'error' });
    }
  };

  const resendVerification = async () => {
    try {
      setIsResending(true);
      setError(null);
      
      await authService.resendVerification();
      
      enqueueSnackbar('Verification email sent! Please check your inbox.', { variant: 'success' });
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
      enqueueSnackbar(err.message || 'Failed to resend verification email', { variant: 'error' });
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = () => {
    if (selectedTier) {
      navigate('/checkout', { state: { tier: selectedTier } });
    } else {
      navigate('/dashboard');
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Verifying Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your email address...
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle
              sx={{
                fontSize: 80,
                color: 'success.main',
                mb: 3,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Email Verified Successfully!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, textAlign: 'center' }}
            >
              Your email has been verified. You can now access all features of BackboneLogic, Inc.
            </Typography>
            
            {selectedTier && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Redirecting to checkout for your selected {selectedTier} plan...
              </Alert>
            )}
            
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleContinue}
              sx={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                color: '#000',
              }}
            >
              {selectedTier ? 'Continue to Checkout' : 'Go to Dashboard'}
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Error
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 3,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Verification Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {error || 'The verification link is invalid or has expired.'}
            </Typography>
            
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={resendVerification}
                disabled={isResending}
                sx={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  color: '#000',
                }}
              >
                {isResending ? 'Sending...' : 'Resend Verification'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Stack>
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Email
              sx={{
                fontSize: 80,
                color: 'primary.main',
                mb: 3,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Check Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              We've sent a verification link to:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
              {user?.email}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Click the link in your email to verify your account. 
              The link will expire in 24 hours.
            </Typography>

            {selectedTier && (
              <Alert severity="info" sx={{ mb: 4 }}>
                After verifying your email, you'll be redirected to checkout for your selected {selectedTier} plan.
              </Alert>
            )}
            
            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Refresh />}
                onClick={resendVerification}
                disabled={isResending}
                sx={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  color: '#000',
                }}
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: 'text.secondary' }}
              >
                Use a different email address
              </Button>
            </Stack>

            <Box sx={{ mt: 4, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Didn't receive the email?</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Check your spam/junk folder<br/>
                • Make sure {user?.email} is correct<br/>
                • Try resending the verification email
              </Typography>
            </Box>
          </Box>
        );
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
        <Box
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
                Email Verification
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && verificationStatus !== 'error' && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Content */}
            {renderContent()}

            {/* Footer */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                🔒 Your account security is our top priority
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default EmailVerificationPage;
