import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Paper,
  Alert,
  Snackbar,
  useTheme
} from '@mui/material';
import {
  PlayArrow,
  VideoLibrary,
  Group,
  Security,
  Speed,
  Support,
  ArrowForward,
  CheckCircle,
  Star,
  AdminPanelSettings,
  RocketLaunch,
  ShoppingCart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { DemoRegistrationModal } from '@/components/DemoRegistrationModal';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, hasActiveLicense, hasActiveSubscription } = useAuth();
  const theme = useTheme();
  const isSuperAdmin = isAuthenticated && String(user?.role || '').toUpperCase() === 'SUPERADMIN';
  
  // Check if user has active license or subscription
  const hasActiveAccess = hasActiveLicense() || hasActiveSubscription();
  
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDemoSuccess = (userData: any) => {
    setSuccessMessage(`🎉 Welcome to your 14-day demo trial, ${userData.user.name || userData.user.email}! Check your email for next steps.`);
    // Optionally redirect to dashboard
    setTimeout(() => {
      window.open('https://dashboard-1c3a5.web.app/login', '_blank');
    }, 2000);
  };

  const features = [
    {
      icon: <VideoLibrary />,
      title: 'Complete Production Management',
      description: 'Streamline your entire video production workflow from pre-production to delivery.',
    },
    {
      icon: <Group />,
      title: 'Team Collaboration',
      description: 'Real-time collaboration tools that keep your entire team synchronized and productive.',
    },
    {
      icon: <Security />,
      title: 'Enterprise Security',
      description: 'Bank-grade security with role-based access control and comprehensive audit trails.',
    },
    {
      icon: <Speed />,
      title: 'AI-Powered Workflows',
      description: 'Intelligent automation and AI assistance to accelerate your production timeline.',
    },
    {
      icon: <Support />,
      title: '24/7 Premium Support',
      description: 'Dedicated support team with industry expertise to help you succeed.',
    },
    {
      icon: <Star />,
      title: 'White-Label Ready',
      description: 'Customize and brand the platform to match your studio\'s identity.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Production Director',
      company: 'Horizon Studios',
      content: 'BackboneLogic, Inc. transformed our workflow. We\'ve reduced production time by 40% and improved client satisfaction dramatically.',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Creative Director',
      company: 'NextGen Media',
      content: 'The AI features are game-changing. Our team can focus on creativity while the platform handles the technical workflow.',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'Studio Manager',
      company: 'Apex Productions',
      content: 'The enterprise features give us complete control and visibility. Best investment we\'ve made for our studio.',
      rating: 5,
    },
  ];

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Navigation />
      
      {/* Hero Section */}
      <Box sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' 
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #667eea 100%)', 
        position: 'relative', 
        overflow: 'hidden', 
        pt: { xs: 12, md: 16 }, 
        pb: { xs: 8, md: 12 } 
      }} >
        {/* Background Pattern */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)',
          backgroundSize: '50px 50px', 
          opacity: 0.5 
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box>
                  <Chip
                    label="✨ New v14 Release Available"
                    sx={{
                      mb: 3,
                      backgroundColor: 'rgba(0, 212, 255, 0.2)',
                      color: 'primary.main',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
                      fontWeight: 700,
                      lineHeight: 1.1,
                      mb: 3,
                      background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)'
                        : 'linear-gradient(135deg, #1a1a2e 0%, #00d4ff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Transform Your
                    <br />
                    Production Workflow
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'text.secondary',
                      mb: 4,
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    The complete professional platform for video production management,
                    collaboration, and delivery. Trusted by industry leaders worldwide.
                  </Typography>
                </Box>
                
                 <Box>
                   {isSuperAdmin ? (
                     // SUPERADMIN: no CTA buttons here; access Admin from toolbar menu
                     <></>
                   ) : hasActiveAccess ? (
                     // User has active license/subscription - show dashboard access
                     <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                       <Button
                         variant="contained"
                         size="large"
                         startIcon={<CheckCircle />}
                         onClick={() => navigate('/dashboard')}
                         sx={{
                           px: 4,
                           py: 1.5,
                           fontSize: '1.1rem',
                           borderRadius: 2,
                           background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                           color: 'white',
                           '&:hover': {
                             background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                             transform: 'translateY(-2px)',
                             boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                           },
                         }}
                       >
                         Access Dashboard
                       </Button>
                       
                       <Button
                         variant="outlined"
                         size="large"
                         onClick={() => navigate('/dashboard/settings')}
                         sx={{
                           px: 4,
                           py: 1.5,
                           fontSize: '1.1rem',
                           borderRadius: 2,
                           borderColor: 'rgba(255, 255, 255, 0.3)',
                           color: 'white',
                           '&:hover': {
                             borderColor: 'primary.main',
                             backgroundColor: 'rgba(0, 212, 255, 0.1)',
                             transform: 'translateY(-2px)',
                           },
                         }}
                       >
                         Account Settings
                       </Button>
                     </Stack>
                   ) : (
                     // New user - show demo and pricing options
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<RocketLaunch />}
                        onClick={() => setDemoModalOpen(true)}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                          color: '#000',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
                          },
                        }}
                      >
                        Start 14-Day Demo Trial
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/pricing')}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          borderRadius: 2,
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        View Pricing
                      </Button>
                    </Stack>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    🔒 SOC 2 Compliant • GDPR Ready • 99.9% Uptime SLA
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.02)', }, }} >
                  <Paper
                    elevation={20}
                    sx={{
                      p: 1,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 3,
                    }}
                  >
                    <Box sx={{ width: '100%', height: 400, backgroundColor: '#000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', }} >
                      {/* Video placeholder or actual demo video */}
                      <IconButton
                        sx={{
                          width: 80,
                          height: 80,
                          backgroundColor: 'primary.main',
                          color: '#000',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <PlayArrow sx={{ fontSize: 40 }} />
                      </IconButton>
                      
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: 16,
                          color: 'white',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        2:45 - Platform Demo
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box>
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Everything You Need to Succeed
              </Typography>
            </Box>
            
            <Box>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: 'auto' }}
              >
                Powerful features designed for modern production workflows
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Box sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-8px)', }, }} >
                  <Card
                    sx={{
                      height: '100%',
                      backgroundColor: 'background.paper',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(0, 212, 255, 0.2)',
                        borderColor: 'rgba(0, 212, 255, 0.3)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ width: 60, height: 60, borderRadius: 2, backgroundColor: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, color: 'primary.main', }} >
                        {feature.icon}
                      </Box>
                      
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ backgroundColor: 'background.paper', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box>
            <Box textAlign="center" sx={{ mb: 8 }}>
              <Box>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '3rem' },
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Trusted by Industry Leaders
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', }, }} >
                    <Card
                      sx={{
                        height: '100%',
                        backgroundColor: 'background.default',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              sx={{ color: '#ffd700', fontSize: 20 }}
                            />
                          ))}
                        </Stack>
                        
                        <Typography
                          variant="body1"
                          sx={{ mb: 3, fontStyle: 'italic' }}
                        >
                          "{testimonial.content}"
                        </Typography>
                        
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}, {testimonial.company}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Marketplace Section - Show for authenticated users */}
      {isAuthenticated && (
        <Box sx={{ backgroundColor: 'background.paper', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box textAlign="center" sx={{ mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Discover New Tools
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
              >
                Explore our marketplace of professional tools and add-ons to enhance your workflow
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={() => navigate('/marketplace')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  color: '#000',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
                  },
                }}
              >
                Browse Marketplace
              </Button>
            </Box>
          </Container>
        </Box>
      )}

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.01)', }, }} >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(0, 212, 255, 0.2)'
                : '1px solid rgba(102, 126, 234, 0.3)',
              color: theme.palette.mode === 'dark' ? 'white' : 'white',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 2,
                color: 'white',
              }}
            >
              {hasActiveAccess ? 'Welcome Back!' : 'Ready to Transform Your Workflow?'}
            </Typography>
            
            <Typography
              variant="h6"
              sx={{ 
                mb: 4, 
                maxWidth: 600, 
                mx: 'auto',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {hasActiveAccess 
                ? 'Continue building amazing projects with your active subscription. Access all features and collaborate with your team.'
                : 'Join thousands of professionals who have revolutionized their production process with BackboneLogic, Inc.'
              }
            </Typography>
            
            {isSuperAdmin ? (
              // SUPERADMIN: no CTA button here
              <></>
            ) : hasActiveAccess ? (
              // User has active license/subscription - show dashboard access
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<CheckCircle />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                    },
                  }}
                >
                  Access Dashboard
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/dashboard/settings')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Account Settings
                </Button>
              </Stack>
            ) : (
              // New user - show demo and pricing options
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<RocketLaunch />}
                  onClick={() => setDemoModalOpen(true)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: theme.palette.mode === 'dark' ? '#000' : 'white',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #00b8e6 0%, #5a6fd8 100%)'
                        : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                  }}
                >
                  Start Your 14-Day Demo
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/pricing')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  View Pricing Plans
                </Button>
              </Stack>
            )}
            
            {!hasActiveAccess && (
              <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  No credit card required • 14-day free trial • Cancel anytime
                </Typography>
              </Box>
            )}
            
            {hasActiveAccess && (
              <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Active subscription • Full access • Premium support
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>

      <Footer />

      {/* Demo Registration Modal */}
      <DemoRegistrationModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSuccess={handleDemoSuccess}
      />

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LandingPage;
