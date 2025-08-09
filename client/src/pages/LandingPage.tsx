import React from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
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
                      background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
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
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate('/pricing')}
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
                      Start Free Trial
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
                        },
                      }}
                    >
                      View Pricing
                    </Button>
                  </Stack>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    🔒 SOC 2 Compliant • GDPR Ready • 99.9% Uptime SLA
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
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
                    <Box
                      sx={{
                        width: '100%',
                        height: 400,
                        backgroundColor: '#000',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
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
                <Box
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
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
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          backgroundColor: 'rgba(0, 212, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          color: 'primary.main',
                        }}
                      >
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
                  <Box
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
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

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.01)',
            },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 2,
              }}
            >
              Ready to Transform Your Workflow?
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Join thousands of professionals who have revolutionized their
              production process with BackboneLogic, Inc.
            </Typography>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  color: '#000',
                }}
              >
                Start Your Free Trial
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
                }}
              >
                View Pricing Plans
              </Button>
            </Stack>
            
            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                No credit card required • 14-day free trial • Cancel anytime
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default LandingPage;
