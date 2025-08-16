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
  Alert,
  Paper,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import {
  Code,
  ExpandMore,
  Download,
  PlayArrow,
  Settings,
  Group,
  Work,
  Inventory,
  Message,
  Assessment,
  Cloud,
  Api,
  IntegrationInstructions,
  Architecture,
  Psychology,
  Timeline,
  Assignment,
  Search,
  Notifications,
  Dashboard,
  Build,
  BugReport,
  School,
  VideoLibrary,
  Mode,
  NetworkCheck,
  DesktopMac,
  Web,
  StorageOutlined,
  CloudQueue,
  SecurityOutlined,
  GroupWork,
  Analytics,
  Speed,
  AutoAwesome,
  CodeOff,
  CodeRounded,
  CodeSharp,
  CodeTwoTone,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useLocation } from 'react-router-dom';

interface DocumentationSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'features' | 'integration' | 'development';
  content: React.ReactNode;
}

const DocumentationPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | false>(false);

  const handleSectionChange = (section: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };

  const handleDownload = (title: string) => {
    // Simulate download process
    enqueueSnackbar(`Starting download: ${title}`, { variant: 'info' });
    
    // Simulate download delay
    setTimeout(() => {
      // Create a dummy download link
      const link = document.createElement('a');
      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`# ${title}\n\nThis is a sample ${title.toLowerCase()} for Dashboard v14.\n\n## Features\n- Comprehensive documentation\n- Step-by-step guides\n- Code examples\n- Best practices\n\n## Getting Started\nFollow the instructions in this guide to get started with Dashboard v14.\n\n## Support\nFor additional support, contact our team at support@dashboardv14.com`)}`;
      link.download = `${title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      enqueueSnackbar(`${title} downloaded successfully!`, { variant: 'success' });
    }, 1000);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    // Reset expanded section when changing tabs
    setExpandedSection(false);
  };

  const coreFeatures: DocumentationSection[] = [
    {
      id: 'sessions',
      title: 'Session Management',
      description: 'Comprehensive workflow and session tracking system',
      icon: <Work />,
      category: 'core',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Session Management System</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Dashboard v14 provides a complete session management system for video production workflows, 
            including pre-production planning, active session tracking, and post-production coordination.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Workflow Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Multi-stage workflow tracking<br/>
                    • Real-time status updates<br/>
                    • Assignment management<br/>
                    • Progress monitoring
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Timeline Tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Visual timeline interface<br/>
                    • Milestone tracking<br/>
                    • Deadline management<br/>
                    • Schedule optimization
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Pro Tip:</strong> Use the unified workflow system to create custom workflows 
              tailored to your production needs. Each workflow can have multiple stages with specific 
              assignments and requirements.
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={() => handleDownload('Session Management Guide')}
            >
              Download Guide
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayArrow />}
              onClick={() => enqueueSnackbar('Opening Session Management Tutorial...', { variant: 'info' })}
            >
              Watch Tutorial
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      id: 'post-production',
      title: 'Post-Production Workflows',
      description: 'Advanced post-production task management and coordination',
      icon: <Assessment />,
      category: 'core',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Post-Production System</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Comprehensive post-production management with task assignment, progress tracking, 
            and team coordination for video editing, color grading, and final delivery.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Task Assignment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Role-based assignments<br/>
                    • Skill matching<br/>
                    • Workload balancing<br/>
                    • Priority management
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <VideoLibrary sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Media Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • File organization<br/>
                    • Version control<br/>
                    • Asset tracking<br/>
                    • Metadata management
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Quality Control
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Review workflows<br/>
                    • Approval processes<br/>
                    • Feedback integration<br/>
                    • Final delivery
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      description: 'Real-time messaging, notifications, and team coordination',
      icon: <Group />,
      category: 'core',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Team Collaboration Features</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Built-in communication tools for seamless team coordination, including real-time messaging, 
            notifications, and role-based access control.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Message sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Real-time Messaging
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Instant messaging<br/>
                    • File sharing<br/>
                    • Message history<br/>
                    • Read receipts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Smart Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Custom notification rules<br/>
                    • Priority-based alerts<br/>
                    • Email integration<br/>
                    • Mobile notifications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
  ];

  const advancedFeatures: DocumentationSection[] = [
    {
      id: 'ai-agents',
      title: 'AI Agent Integration',
      description: 'Intelligent AI agents for automated workflows and assistance',
      icon: <Psychology />,
      category: 'features',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>AI Agent System</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Advanced AI integration with Google Gemini for intelligent workflow automation, 
            content generation, and decision support.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Smart Automation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Workflow automation<br/>
                    • Content generation<br/>
                    • Decision support<br/>
                    • Pattern recognition
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <IntegrationInstructions sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Seamless Integration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • API integration<br/>
                    • Custom prompts<br/>
                    • Context awareness<br/>
                    • Performance optimization
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={() => handleDownload('AI Agent Integration Guide')}
            >
              Download Guide
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayArrow />}
              onClick={() => enqueueSnackbar('Opening AI Agent Demo...', { variant: 'info' })}
            >
              View Demo
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Code />}
              onClick={() => enqueueSnackbar('Opening AI Agent API Documentation...', { variant: 'info' })}
            >
              API Docs
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      id: 'inventory-management',
      title: 'Inventory Management',
      description: 'Comprehensive asset and equipment tracking system',
      icon: <Inventory />,
      category: 'features',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Inventory Management System</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Complete asset tracking with barcode scanning, equipment management, and 
            resource allocation for production workflows.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Asset Tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Barcode scanning<br/>
                    • Location tracking<br/>
                    • Maintenance schedules<br/>
                    • Usage history
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Resource Allocation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Equipment assignment<br/>
                    • Availability tracking<br/>
                    • Conflict resolution<br/>
                    • Cost tracking
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Usage Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Utilization reports<br/>
                    • Performance metrics<br/>
                    • Cost analysis<br/>
                    • Optimization insights
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      id: 'mode-awareness',
      title: 'Mode Awareness System',
      description: 'Dual-mode operation for standalone and network environments',
      icon: <Mode />,
      category: 'features',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Mode Awareness System</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Intelligent dual-mode architecture supporting both standalone desktop operation 
            and collaborative network environments from a single codebase.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <DesktopMac sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Standalone Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Desktop-like experience<br/>
                    • Local project storage<br/>
                    • Offline capability<br/>
                    • File system integration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <NetworkCheck sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Network Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Collaborative workspaces<br/>
                    • Real-time synchronization<br/>
                    • Team coordination<br/>
                    • Shared resources
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Smart Switching:</strong> The system automatically detects your environment 
              and recommends the optimal mode, with seamless switching between modes.
            </Typography>
          </Alert>
        </Box>
      ),
    },
  ];

  const integrationDocs: DocumentationSection[] = [
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Complete REST API documentation with examples',
      icon: <Api />,
      category: 'integration',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>REST API Documentation</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Comprehensive API reference for integrating Dashboard v14 with external systems 
            and building custom applications.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <SecurityOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Authentication
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • JWT token authentication<br/>
                    • Role-based access control<br/>
                    • API key management<br/>
                    • Rate limiting
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <CodeRounded sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Endpoints
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Sessions management<br/>
                    • User operations<br/>
                    • Inventory control<br/>
                    • Workflow operations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => handleDownload('API Reference')}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
            }}
          >
            Download API Reference
          </Button>
        </Box>
      ),
    },
    {
      id: 'sdk-integration',
      title: 'SDK Integration',
      description: 'Software development kit for custom integrations',
      icon: <IntegrationInstructions />,
      category: 'integration',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>SDK Integration Guide</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Complete SDK documentation for building custom integrations, plugins, 
            and extending Dashboard v14 functionality.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <CodeSharp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    JavaScript SDK
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Node.js integration<br/>
                    • Browser support<br/>
                    • TypeScript definitions<br/>
                    • Error handling
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <CodeTwoTone sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Python SDK
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Python 3.7+ support<br/>
                    • Async operations<br/>
                    • Data processing<br/>
                    • Automation scripts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <CodeOff sx={{ mr: 1, verticalAlign: 'middle' }} />
                    REST API
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • HTTP/HTTPS support<br/>
                    • JSON data format<br/>
                    • Webhook integration<br/>
                    • Custom headers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
  ];

  const developmentDocs: DocumentationSection[] = [
    {
      id: 'architecture',
      title: 'System Architecture',
      description: 'Technical architecture and system design documentation',
      icon: <Architecture />,
      category: 'development',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>System Architecture</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Comprehensive technical documentation covering the system architecture, 
            data flow, and component relationships.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Web sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Frontend Architecture
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • React 18 with TypeScript<br/>
                    • Material-UI components<br/>
                    • State management (Context + Redux)<br/>
                    • Real-time WebSocket integration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <StorageOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Backend Architecture
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Node.js with Express<br/>
                    • PostgreSQL database<br/>
                    • Prisma ORM<br/>
                    • JWT authentication
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      id: 'deployment',
      title: 'Deployment Guide',
      description: 'Production deployment and configuration instructions',
      icon: <Cloud />,
      category: 'development',
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Deployment Guide</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Complete deployment instructions for production environments, including 
            Docker containers, environment configuration, and monitoring setup.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Build sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Docker Deployment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Multi-container setup<br/>
                    • Environment variables<br/>
                    • Volume management<br/>
                    • Health checks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <CloudQueue sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Cloud Deployment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • AWS/Azure/GCP support<br/>
                    • Load balancing<br/>
                    • Auto-scaling<br/>
                    • SSL/TLS configuration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Database optimization<br/>
                    • Caching strategies<br/>
                    • CDN integration<br/>
                    • Monitoring setup
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ),
    },
  ];



  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ paddingTop: 2.5 }}>
      {value === index && children}
    </Box>
  );

  const location = useLocation();
  const inDashboard = location.pathname.startsWith('/dashboard');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {!inDashboard && <Navigation />}
      
      <Container maxWidth="lg" sx={{ pt: inDashboard ? { xs: 2, md: 4 } : { xs: 12, md: 16 }, pb: inDashboard ? { xs: 2, md: 4 } : { xs: 4, md: 8 } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', borderRadius: 2, p: { xs: 2, md: 4 }, }} >
          {/* Header */}
          <div >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Documentation Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive guides and resources for Dashboard v14
          </Typography>
        </Box>
      </div>

      {/* Quick Start Alert */}
      <div >
        <Alert 
          severity="info" 
          sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            cursor: 'pointer',
          }}
          onClick={() => {
            setSelectedTab(0);
            setExpandedSection('sessions');
            enqueueSnackbar('Navigated to Session Management guide', { variant: 'info' });
          }}
        >
          <Typography variant="body2">
            <strong>Getting Started?</strong> Start with the Core Features section to understand 
            the fundamental capabilities of Dashboard v14, then explore Advanced Features for 
            specialized workflows and integrations. <strong>Click here to jump to Session Management!</strong>
          </Typography>
        </Alert>
      </div>

      {/* Tab Navigation */}
      <div >
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 3,
              },
            }}
          >
            <Tab label="Core Features" icon={<Dashboard />} />
            <Tab label="Advanced Features" icon={<AutoAwesome />} />
            <Tab label="Integration" icon={<Api />} />
            <Tab label="Development" icon={<Code />} />
          </Tabs>
        </Paper>
      </div>

      {/* Core Features Tab */}
      <TabPanel value={selectedTab} index={0}>
        <div >
          <Grid container spacing={3}>
            {coreFeatures.map((section) => (
              <Grid item xs={12} key={section.id}>
                <Accordion
                  expanded={expandedSection === section.id}
                  onChange={handleSectionChange(section.id)}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMore />}
                    onClick={() => {
                      if (expandedSection === section.id) {
                        enqueueSnackbar(`Collapsed ${section.title}`, { variant: 'info' });
                      } else {
                        enqueueSnackbar(`Expanded ${section.title}`, { variant: 'info' });
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ mr: 2, color: 'primary.main' }}>
                        {section.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label="Core" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {section.content}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </div>
      </TabPanel>

      {/* Advanced Features Tab */}
      <TabPanel value={selectedTab} index={1}>
        <div >
          <Grid container spacing={3}>
            {advancedFeatures.map((section) => (
              <Grid item xs={12} key={section.id}>
                <Accordion
                  expanded={expandedSection === section.id}
                  onChange={handleSectionChange(section.id)}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ mr: 2, color: 'secondary.main' }}>
                        {section.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label="Advanced" 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {section.content}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </div>
      </TabPanel>

      {/* Integration Tab */}
      <TabPanel value={selectedTab} index={2}>
        <div >
          <Grid container spacing={3}>
            {integrationDocs.map((section) => (
              <Grid item xs={12} key={section.id}>
                <Accordion
                  expanded={expandedSection === section.id}
                  onChange={handleSectionChange(section.id)}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ mr: 2, color: 'info.main' }}>
                        {section.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label="Integration" 
                        size="small" 
                        color="info" 
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {section.content}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </div>
      </TabPanel>

      {/* Development Tab */}
      <TabPanel value={selectedTab} index={3}>
        <div >
          <Grid container spacing={3}>
            {developmentDocs.map((section) => (
              <Grid item xs={12} key={section.id}>
                <Accordion
                  expanded={expandedSection === section.id}
                  onChange={handleSectionChange(section.id)}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ mr: 2, color: 'warning.main' }}>
                        {section.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label="Development" 
                        size="small" 
                        color="warning" 
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {section.content}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </div>
      </TabPanel>

      {/* Quick Actions */}
      <div >
        <Paper
          sx={{
            p: 3,
            mt: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<School />}
                onClick={() => handleDownload('Getting Started Guide')}
              >
                Getting Started
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BugReport />}
                onClick={() => handleDownload('Troubleshooting Guide')}
              >
                Troubleshooting
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GroupWork />}
                onClick={() => handleDownload('Team Collaboration Guide')}
              >
                Team Guide
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => handleDownload('Configuration Guide')}
              >
                Configuration
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
        </Box>
      </Container>
      
      {!inDashboard && <Footer />}
    </Box>
  );
};

export default DocumentationPage;
