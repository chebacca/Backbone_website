import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import {
  Home,
  ArrowBack,
  Search,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 
            'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.5,
        }}
      />

      <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 Illustration */}
          <Box sx={{ mb: 4 }}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '8rem', md: '12rem' },
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 0.8,
                  mb: 2,
                }}
              >
                404
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Search sx={{ fontSize: 50, color: 'primary.main' }} />
              </Box>
            </motion.div>
          </Box>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 600,
                mb: 2,
                color: 'text.primary',
              }}
            >
              Page Not Found
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Oops! The page you're looking for seems to have wandered off into the digital void.
              Don't worry, even the best explorers sometimes take a wrong turn.
            </Typography>

            <Box
              sx={{
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 4,
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>What might have happened?</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                • The page may have been moved or deleted<br/>
                • You might have typed the URL incorrectly<br/>
                • The link you followed may be broken<br/>
                • You may not have permission to access this page
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Home />}
                onClick={() => navigate('/')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  color: '#000',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Go Home
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                onClick={() => window.history.back()}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  },
                }}
              >
                Go Back
              </Button>
            </Stack>

            {/* Quick Links */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Or try these popular pages:
              </Typography>
              
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="text"
                  onClick={() => navigate('/pricing')}
                  sx={{ color: 'primary.main' }}
                >
                  Pricing
                </Button>
                
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{ color: 'primary.main' }}
                >
                  Sign In
                </Button>
                
                <Button
                  variant="text"
                  onClick={() => navigate('/register')}
                  sx={{ color: 'primary.main' }}
                >
                  Get Started
                </Button>
              </Stack>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
