import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Movie,
  CheckCircle,
  Download,
  Share,
  Settings,
  CloudSync,
  Mobile,
  Api,
  Support,
  Template,
  Edit,
  Group,
  Storage,
  Speed,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

const CallSheetProPage: React.FC = () => {
  const { user } = useAuth();
  const [licenseInfo, setLicenseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading license info
    const loadLicenseInfo = async () => {
      try {
        // In a real implementation, this would fetch from the API
        if (user?.licenses?.callsheetPro) {
          setLicenseInfo(user.licenses.callsheetPro);
        }
      } catch (error) {
        console.error('Error loading license info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLicenseInfo();
  }, [user]);

  const features = [
    {
      icon: <Movie />,
      title: 'Unlimited Call Sheets',
      description: 'Create unlimited professional call sheets for your productions'
    },
    {
      icon: <Template />,
      title: 'Advanced Templates',
      description: 'Access to 50+ professional call sheet templates'
    },
    {
      icon: <Edit />,
      title: 'Custom Fields',
      description: 'Add custom fields to match your production needs'
    },
    {
      icon: <Download />,
      title: 'Export Options',
      description: 'Export to PDF and Excel formats'
    },
    {
      icon: <Group />,
      title: 'Real-time Collaboration',
      description: 'Work with up to 10 team members simultaneously'
    },
    {
      icon: <CloudSync />,
      title: 'Cloud Sync',
      description: 'Automatic cloud synchronization across devices'
    },
    {
      icon: <Mobile />,
      title: 'Mobile App',
      description: 'Access your call sheets on mobile devices'
    },
    {
      icon: <Api />,
      title: 'API Access',
      description: 'Integrate with your existing production tools'
    },
    {
      icon: <Support />,
      title: 'Priority Support',
      description: 'Get priority support for all your questions'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!licenseInfo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Call Sheet Pro license not found. Please contact support.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Movie sx={{ fontSize: 40, color: 'primary.main' }} />
          Call Sheet Pro
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Professional call sheet creation and management for film and television productions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label="ACTIVE" 
            color="success" 
            size="small"
          />
          <Chip 
            label={`License: ${licenseInfo.key}`}
            variant="outlined"
            size="small"
          />
          <Chip 
            label={`Expires: ${new Date(licenseInfo.expiresAt._seconds * 1000).toLocaleDateString()}`}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      {/* License Status Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            License Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxCallSheets === -1 ? '∞' : licenseInfo.limits.maxCallSheets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Call Sheets
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxTemplates}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Templates
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxCollaborators}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Collaborators
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxStorageGB}GB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Storage
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Included Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: 'primary.main', mr: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6">
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            size="large"
          >
            Create New Call Sheet
          </Button>
          <Button
            variant="outlined"
            startIcon={<Template />}
            size="large"
          >
            Browse Templates
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            size="large"
          >
            Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<Support />}
            size="large"
          >
            Get Support
          </Button>
        </Box>
      </Paper>

      {/* Usage Statistics */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Usage Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.usageCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Uses
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxExportsPerMonth}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Exports
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxAPIRequestsPerMonth}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  API Requests/Month
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.lastUsed ? new Date(licenseInfo.lastUsed._seconds * 1000).toLocaleDateString() : 'Never'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Used
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CallSheetProPage;
