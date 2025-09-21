import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Container,
} from '@mui/material';
import {
  ExpandMore,
  Download,
  PlayArrow,
  Group,
  Work,
  Message,
  School,
  Chat,
  Email,
  Phone,
  VideoCall,
  Article,
  Code,
  Schedule,
  Support,
  Close,
  Analytics,
  Description,
  GetApp,
  TrendingUp,
  Assessment,
  BarChart,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useLocation } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'billing' | 'security';
  tags: string[];
}



const SupportPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  // Handle URL hash navigation for consolidated sections
  const getInitialTab = () => {
    const hash = location.hash.replace('#', '');
    switch (hash) {
      case 'analytics': return 1;
      case 'downloads': return 2;
      case 'documentation': return 3;
      default: return 0; // FAQ tab
    }
  };

  const [selectedTab, setSelectedTab] = useState(getInitialTab);

  // Update tab when hash changes
  React.useEffect(() => {
    setSelectedTab(getInitialTab());
  }, [location.hash]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    // Update URL hash when tab changes
    const hashes = ['', 'analytics', 'downloads', 'documentation', 'contact'];
    if (hashes[newValue]) {
      window.history.replaceState(null, '', `${location.pathname}#${hashes[newValue]}`);
    } else {
      window.history.replaceState(null, '', location.pathname);
    }
  };

  const handleFAQChange = (faqId: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFAQ(isExpanded ? faqId : false);
  };



  const handleChatStart = () => {
    setChatDialogOpen(true);
    enqueueSnackbar('Live chat session started', { variant: 'info' });
  };

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <Chat />,
      action: 'Start Chat',
      onClick: handleChatStart,
      color: 'primary',
      available: true,
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Email />,
      action: 'Send Email',
      onClick: () => window.open('mailto:support@backbonelogic.com'),
      color: 'secondary',
      available: true,
    },
    {
      title: 'Phone Support',
      description: 'Call us for urgent issues',
      icon: <Phone />,
      action: 'Call Now',
      onClick: () => window.open('tel:+1-555-0123'),
      color: 'success',
      available: true,
    },
    {
      title: 'Video Call',
      description: 'Schedule a screen sharing session',
      icon: <VideoCall />,
      action: 'Schedule',
      onClick: () => window.open('https://calendly.com/backbonelogic/support'),
      color: 'info',
      available: true,
    },
  ];

  const faqData: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'How do I activate my license key?',
      answer: 'To activate your license key, go to the Licenses page in your dashboard and click "Activate License". Enter your license key and the system will automatically validate and activate it for your account.',
      category: 'general',
      tags: ['license', 'activation', 'setup'],
    },
    {
      id: 'faq-2',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe.',
      category: 'billing',
      tags: ['payment', 'billing', 'security'],
    },
    {
      id: 'faq-3',
      question: 'How do I upgrade my subscription?',
      answer: 'You can upgrade your subscription at any time from the Billing page in your dashboard. Select your new plan and the changes will be applied immediately with prorated billing.',
      category: 'billing',
      tags: ['subscription', 'upgrade', 'billing'],
    },
    {
      id: 'faq-4',
      question: 'Is my data secure?',
      answer: 'Yes, we use enterprise-grade security measures including end-to-end encryption, SOC 2 compliance, and regular security audits. Your data is stored in secure, redundant data centers.',
      category: 'security',
      tags: ['security', 'privacy', 'compliance'],
    },
    {
      id: 'faq-5',
      question: 'How do I integrate the SDK?',
      answer: 'Download the SDK from the Downloads page and follow the integration guide in our documentation. We provide SDKs for JavaScript, Python, Java, and C# with comprehensive examples.',
      category: 'technical',
      tags: ['sdk', 'integration', 'development'],
    },
    {
      id: 'faq-6',
      question: 'What is the uptime guarantee?',
      answer: 'We guarantee 99.9% uptime for all paid plans. If we fall below this threshold, you\'ll receive service credits according to our SLA.',
      category: 'general',
      tags: ['uptime', 'sla', 'reliability'],
    },
  ];



  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ paddingTop: 3 }}>
      {value === index && children}
    </Box>
  );

  const inDashboard = location.pathname.startsWith('/dashboard');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {!inDashboard && <Navigation />}
      
      <Box sx={{ 
        width: '100%', 
        pt: inDashboard ? { xs: 1, sm: 2, md: 4 } : { xs: 8, sm: 12, md: 16 }, 
        pb: inDashboard ? { xs: 1, sm: 2, md: 4 } : { xs: 4, sm: 6, md: 8 },
        px: { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }
      }}>
        <Box sx={{ 
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
          borderRadius: 2, 
          p: { xs: 1.5, sm: 2, md: 3, lg: 4 },
          border: (theme) => theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }} >
          {/* Header */}
          <Box >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
          }}>
            Support Center
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Get help with your BackboneLogic, Inc. platform
          </Typography>
        </Box>
      </Box>

      {/* Support Channels */}
      <Box >
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
          {supportChannels.map((channel, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 12px 24px rgba(0, 212, 255, 0.2)'
                      : '0 12px 24px rgba(0, 212, 255, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: 2, backgroundColor: `${channel.color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: '#000', }} >
                    {channel.icon}
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {channel.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {channel.description}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={channel.onClick}
                    disabled={!channel.available}
                    sx={{
                      background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                      color: '#000',
                    }}
                  >
                    {channel.action}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tabs */}
      <Box >
        <Paper
          sx={{
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
              : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
            backdropFilter: 'blur(20px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.1)',
              '& .MuiTab-root': {
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Tab label="FAQ" />
            <Tab label="Usage Analytics" icon={<Analytics />} iconPosition="start" />
            <Tab label="Downloads" icon={<Download />} iconPosition="start" />
            <Tab label="Documentation" icon={<Description />} iconPosition="start" />
            <Tab label="Contact Info" />
          </Tabs>

          {/* FAQ Tab */}
          <TabPanel value={selectedTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Frequently Asked Questions
              </Typography>
              
              {faqData.map((faq) => (
                <Accordion
                  key={faq.id}
                  expanded={expandedFAQ === faq.id}
                  onChange={handleFAQChange(faq.id)}
                  sx={{
                    mb: 2,
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                    border: (theme) => theme.palette.mode === 'dark'
                      ? '1px solid rgba(255,255,255,0.1)'
                      : '1px solid rgba(0,0,0,0.1)',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {faq.answer}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {faq.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                            color: 'primary.main',
                          }}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </TabPanel>

          {/* Usage Analytics Tab */}
          <TabPanel value={selectedTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Usage Analytics & Insights
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                      textAlign: 'center',
                      p: 2,
                    }}
                  >
                    <Box sx={{ width: 60, height: 60, borderRadius: 2, backgroundColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: '#000' }}>
                      <TrendingUp />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>License Usage</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Track your license utilization and performance metrics
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      View Usage Stats
                    </Button>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                      textAlign: 'center',
                      p: 2,
                    }}
                  >
                    <Box sx={{ width: 60, height: 60, borderRadius: 2, backgroundColor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: '#000' }}>
                      <BarChart />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>Performance Reports</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Detailed analytics and performance insights
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      Generate Report
                    </Button>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                      textAlign: 'center',
                      p: 2,
                    }}
                  >
                    <Box sx={{ width: 60, height: 60, borderRadius: 2, backgroundColor: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: '#000' }}>
                      <Assessment />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>Usage Trends</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Historical usage patterns and forecasting
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      View Trends
                    </Button>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Quick Analytics Overview
                </Typography>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    p: 3,
                  }}
                >
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Analytics dashboard integration coming soon. Monitor your license usage, API calls, and performance metrics all in one place.
                  </Typography>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Downloads Tab */}
          <TabPanel value={selectedTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Downloads & SDK Resources
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <GetApp sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6">JavaScript SDK</Typography>
                        <Chip label="Latest" size="small" color="primary" sx={{ ml: 'auto' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Complete JavaScript SDK with TypeScript support and comprehensive examples
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label="v2.1.0" size="small" />
                        <Chip label="TypeScript" size="small" />
                        <Chip label="Examples" size="small" />
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                          color: '#000',
                        }}
                      >
                        Download SDK
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <GetApp sx={{ mr: 2, color: 'secondary.main' }} />
                        <Typography variant="h6">Python SDK</Typography>
                        <Chip label="Beta" size="small" color="secondary" sx={{ ml: 'auto' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Python SDK with async support and comprehensive documentation
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label="v1.8.2" size="small" />
                        <Chip label="Async" size="small" />
                        <Chip label="Docs" size="small" />
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        fullWidth
                      >
                        Download SDK
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Code sx={{ mr: 2, color: 'success.main' }} />
                        <Typography variant="h6">Code Examples</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Ready-to-use code examples and integration templates
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        fullWidth
                      >
                        View Examples
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Article sx={{ mr: 2, color: 'info.main' }} />
                        <Typography variant="h6">Integration Guides</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Step-by-step integration guides for popular frameworks
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        fullWidth
                      >
                        Download Guides
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Documentation Tab */}
          <TabPanel value={selectedTab} index={3}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Documentation & Resources
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Article sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6">User Guide</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Complete guide to using the BackboneLogic, Inc. platform
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => window.open('/documentation')}
                      >
                        View Guide
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Code sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6">API Documentation</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Technical documentation for API integration
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => window.open('/documentation/api')}
                      >
                        View API Docs
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <School sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6">Video Tutorials</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Step-by-step video tutorials for common tasks
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<PlayArrow />}
                        onClick={() => window.open('/tutorials')}
                      >
                        Watch Tutorials
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Group sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h6">Community Forum</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Connect with other users and share best practices
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Message />}
                        onClick={() => window.open('/community')}
                      >
                        Join Forum
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Contact Info Tab */}
          <TabPanel value={selectedTab} index={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Contact Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        General Support
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Email color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email"
                            secondary="support@backbonelogic.com"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Phone color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone"
                            secondary="+1 (555) 012-3456"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Schedule color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Hours"
                            secondary="24/7 Support Available"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Enterprise Support
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Work color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Dedicated Support"
                            secondary="Priority support for enterprise customers"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <VideoCall color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Video Sessions"
                            secondary="Screen sharing and remote assistance"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Group color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Account Manager"
                            secondary="Direct contact with your dedicated manager"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Live Chat Dialog */}
      <Dialog
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(0, 212, 255, 0.2)'
              : '1px solid rgba(0, 212, 255, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', color: '#000' }}>
              <Support />
            </Avatar>
            <Box>
              <Typography variant="h6">Live Chat Support</Typography>
              <Typography variant="body2" color="text.secondary">
                Connected to support agent
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setChatDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ height: 400, p: 0 }}>
          <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Chat interface would be integrated here
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setChatDialogOpen(false)}>
            End Chat
          </Button>
        </DialogActions>
      </Dialog>
        </Box>
      </Box>
      
      {!inDashboard && <Footer />}
    </Box>
  );
};

export default SupportPage;
