import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Check,
  Star,
  Business,
  Person,
  Group,
  ExpandMore,
  Security,
  Support,
  Cloud,
  Hub,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

// CSS animations for Firebase compatibility
const fadeInUpAnimation = {
  opacity: 0,
  transform: 'translateY(60px)',
  animation: 'fadeInUp 0.6s ease-out forwards',
};

const staggerAnimation = {
  animation: 'staggerFadeIn 0.6s ease-out forwards',
};

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number | null;
  yearlyPrice?: number | null;
  popular?: boolean;
  enterprise?: boolean;
  features: string[];
  limitations?: string[];
  buttonText: string;
  buttonVariant: 'contained' | 'outlined';
  maxSeats: number | null;
  icon: React.ReactNode;
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      id: 'BASIC',
      name: 'Basic',
      description: 'Perfect for individual creators and freelancers',
      price: 29,
      yearlyPrice: 290, // 2 months free
      features: [
        'Single user license',
        'Core session management',
        'Basic workflow tools',
        'Local file storage (50GB)',
        'Standard support',
        'Desktop application access',
        'Basic reporting',
        'Project templates',
        'Video collaboration tools',
        'Client review system',
      ],
      limitations: [
        'Limited to 1 user',
        'Basic integrations only',
        'Standard support response time',
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'outlined',
      maxSeats: 1,
      icon: <Person />,
    },
    {
      id: 'PRO',
      name: 'Pro',
      description: 'Ideal for growing production teams',
      price: 99,
      yearlyPrice: 990, // 2 months free
      popular: true,
      features: [
        'Up to 50 user licenses',
        'Advanced workflow automation',
        'AI Brain system access',
        'Real-time team coordination',
        'Cloud storage (500GB)',
        'Advanced analytics & reporting',
        'Priority support',
        'Custom role assignments',
        'Timecard & approval system',
        'Advanced project management',
        'Client portal access',
        'API access',
        'Third-party integrations',
        'Advanced security features',
        'Backup & recovery',
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'contained',
      maxSeats: 50,
      icon: <Group />,
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      description: 'For large organizations and studios',
      price: null,
      enterprise: true,
      features: [
        'Unlimited seats with bulk licensing',
        'Dedicated account management',
        'Custom integrations & API access',
        'Advanced security & compliance',
        'White-label options',
        'On-premise deployment',
        '24/7 premium support',
        'Custom training & onboarding',
        'Advanced audit logging',
        'SSO integration',
        'Custom workflows',
        'Advanced analytics',
        'Data residency options',
        'Custom SLA agreements',
        'Dedicated infrastructure',
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outlined',
      maxSeats: null,
      icon: <Business />,
    },
  ];

  const faqs = [
    {
      question: 'What is included in the free trial?',
      answer: 'The 14-day free trial includes full access to all features of your chosen plan, unlimited projects, and standard support. No credit card required to start.',
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the billing accordingly.',
    },
    {
      question: 'How does seat-based pricing work?',
      answer: 'Each seat represents one user who can access the platform. You can add or remove seats as your team grows or shrinks, and billing adjusts automatically.',
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees for Basic and Pro plans. Enterprise customers may have custom setup fees depending on their requirements.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, ACH transfers (for Enterprise), and can accommodate custom billing arrangements for large organizations.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your access continues until the end of your current billing period.',
    },
    {
      question: 'Do you offer volume discounts?',
      answer: 'Yes, we offer volume discounts for teams with 25+ seats. Enterprise customers receive custom pricing based on their specific needs.',
    },
    {
      question: 'Is data migration included?',
      answer: 'We provide migration assistance for Pro and Enterprise customers to help you transition from your existing tools seamlessly.',
    },
  ];

  const handleGetStarted = (tier: PricingTier) => {
    if (!isAuthenticated) {
      navigate('/register', { state: { selectedTier: tier.id } });
      return;
    }

    if (tier.enterprise) {
      // Open contact form or external link
      window.open('mailto:sales@backbonelogic.com?subject=Enterprise%20Inquiry', '_blank');
      return;
    }

    navigate('/checkout', { state: { tier: tier.id, isYearly } });
  };

  const getPrice = (tier: PricingTier) => {
    if (tier.price === null) return null;
    return isYearly && tier.yearlyPrice ? tier.yearlyPrice : tier.price;
  };

  const getSavings = (tier: PricingTier) => {
    if (!tier.yearlyPrice || !tier.price) return 0;
    const monthlyCost = tier.price * 12;
    const savings = monthlyCost - tier.yearlyPrice;
    return Math.round((savings / monthlyCost) * 100);
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Navigation />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          pt: { xs: 12, md: 16 },
          pb: { xs: 6, md: 8 },
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              ...staggerAnimation,
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(60px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
              '@keyframes staggerFadeIn': {
                '0%': {
                  opacity: 0,
                },
                '100%': {
                  opacity: 1,
                },
              },
            }}
          >
            <Box textAlign="center" sx={{ mb: 6 }}>
              <Box sx={fadeInUpAnimation}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    mb: 2,
                    background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Choose Your Plan
                </Typography>
              </Box>
              
              <Box sx={fadeInUpAnimation}>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
                >
                  Start with a 14-day free trial. No credit card required.
                  Upgrade or downgrade at any time.
                </Typography>
              </Box>

              <Box sx={fadeInUpAnimation}>
                <Paper
                  elevation={2}
                  sx={{
                    display: 'inline-flex',
                    p: 0.5,
                    backgroundColor: 'background.paper',
                    borderRadius: 4,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isYearly}
                        onChange={(e) => setIsYearly(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          Annual billing
                        </Typography>
                        <Chip
                          label="Save 17%"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    sx={{ m: 1 }}
                  />
                </Paper>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, mt: -4 }}>
        <Box
          sx={{
            ...staggerAnimation,
            animationDelay: '0.1s',
          }}
        >
          <Grid container spacing={4} justifyContent="center">
            {pricingTiers.map((tier) => (
              <Grid item xs={12} md={4} key={tier.id}>
                <Box sx={fadeInUpAnimation}>
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      backgroundColor: tier.popular ? 'primary.dark' : 'background.paper',
                      border: tier.popular 
                        ? '2px solid' 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderColor: tier.popular ? 'primary.main' : undefined,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: tier.popular 
                          ? '0 20px 40px rgba(0, 212, 255, 0.3)'
                          : '0 20px 40px rgba(0, 0, 0, 0.3)',
                      },
                    }}
                  >
                    {tier.popular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <Chip
                          icon={<Star />}
                          label="Most Popular"
                          color="primary"
                          sx={{
                            fontWeight: 600,
                            color: '#000',
                          }}
                        />
                      </Box>
                    )}

                    <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            backgroundColor: tier.popular 
                              ? 'rgba(0, 212, 255, 0.2)' 
                              : 'rgba(0, 212, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            color: 'primary.main',
                          }}
                        >
                          {tier.icon}
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          {tier.name}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {tier.description}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          {tier.price === null ? (
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                              Custom
                            </Typography>
                          ) : (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                  ${getPrice(tier)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {isYearly ? '/year' : '/month'}
                                </Typography>
                              </Box>
                              
                              {isYearly && getSavings(tier) > 0 && (
                                <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                                  Save {getSavings(tier)}% annually
                                </Typography>
                              )}
                            </>
                          )}
                        </Box>

                        {tier.maxSeats && (
                          <Typography variant="body2" color="text.secondary">
                            Up to {tier.maxSeats} {tier.maxSeats === 1 ? 'user' : 'users'}
                          </Typography>
                        )}
                        
                        {tier.maxSeats === null && (
                          <Typography variant="body2" color="text.secondary">
                            Unlimited users
                          </Typography>
                        )}
                      </Box>

                      <Button
                        variant={tier.buttonVariant}
                        size="large"
                        fullWidth
                        onClick={() => handleGetStarted(tier)}
                        sx={{
                          mb: 4,
                          py: 1.5,
                          fontWeight: 600,
                          ...(tier.buttonVariant === 'contained' && {
                            background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                            color: '#000',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)',
                            },
                          }),
                        }}
                      >
                        {tier.buttonText}
                      </Button>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                          Everything included:
                        </Typography>
                        
                        <List dense sx={{ p: 0 }}>
                          {tier.features.map((feature, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <Check
                                  sx={{
                                    fontSize: 16,
                                    color: 'success.main',
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={feature}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  sx: { fontSize: '0.875rem' },
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Feature Comparison */}
      <Box sx={{ backgroundColor: 'background.paper', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              ...staggerAnimation,
              animationDelay: '0.2s',
            }}
          >
            <Box textAlign="center" sx={{ mb: 6 }}>
              <Box sx={fadeInUpAnimation}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '3rem' },
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Why Choose BackboneLogic, Inc.?
                </Typography>
              </Box>
              
              <Box sx={fadeInUpAnimation}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
                >
                  Join thousands of professionals who trust BackboneLogic, Inc.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  icon: <Security />,
                  title: 'Enterprise Security',
                  description: 'SOC 2 Type II certified with advanced encryption, RBAC, and audit trails.',
                },
                {
                  icon: <Support />,
                  title: '24/7 Expert Support',
                  description: 'Industry experts available around the clock to help you succeed.',
                },
                {
                  icon: <Cloud />,
                  title: 'Cloud & On-Premise',
                  description: 'Deploy in the cloud or on your own infrastructure for maximum control.',
                },
                {
                  icon: <Hub />,
                  title: 'Seamless Integrations',
                  description: 'Connect with your existing tools and workflows effortlessly.',
                },
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={fadeInUpAnimation}>
                    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          backgroundColor: 'rgba(0, 212, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            ...staggerAnimation,
            animationDelay: '0.3s',
          }}
        >
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Box sx={fadeInUpAnimation}>
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
                Frequently Asked Questions
              </Typography>
            </Box>
          </Box>

          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Box key={index} sx={fadeInUpAnimation}>
                <Accordion
                  sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    mb: 1,
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Final CTA */}
      <Box sx={{ backgroundColor: 'background.paper', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box
            sx={{
              ...fadeInUpAnimation,
              animationDelay: '0.4s',
            }}
          >
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                Ready to Get Started?
              </Typography>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Join thousands of professionals who trust BackboneLogic, Inc.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(isAuthenticated ? '/checkout' : '/register')}
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
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No credit card required • 14-day free trial • Cancel anytime
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default PricingPage;
