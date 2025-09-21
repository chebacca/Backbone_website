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
  LinearProgress,
} from '@mui/material';
import {
  VideoLibrary,
  CheckCircle,
  Download,
  Upload,
  Settings,
  CloudSync,
  Api,
  Support,
  Speed,
  Storage,
  Batch,
  Analytics,
  Webhook,
  Cloud,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

const EDLConverterProPage: React.FC = () => {
  const { user } = useAuth();
  const [licenseInfo, setLicenseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading license info
    const loadLicenseInfo = async () => {
      try {
        // In a real implementation, this would fetch from the API
        if (user?.licenses?.edlConverterPro) {
          setLicenseInfo(user.licenses.edlConverterPro);
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
      icon: <VideoLibrary />,
      title: 'Unlimited Conversions',
      description: 'Convert unlimited EDL files with no restrictions'
    },
    {
      icon: <Batch />,
      title: 'Batch Processing',
      description: 'Process up to 100 files simultaneously'
    },
    {
      icon: <Download />,
      title: 'Advanced Formats',
      description: 'Support for CSV, Excel, PDF, JSON, and XML exports'
    },
    {
      icon: <Settings />,
      title: 'Custom Export Templates',
      description: 'Create custom export templates for your workflow'
    },
    {
      icon: <Analytics />,
      title: 'Real-time Analysis',
      description: 'Get instant analysis and insights from your EDL data'
    },
    {
      icon: <Cloud />,
      title: 'Cloud Processing',
      description: 'Leverage cloud computing for faster processing'
    },
    {
      icon: <Api />,
      title: 'API Access',
      description: 'Integrate with your existing post-production pipeline'
    },
    {
      icon: <Webhook />,
      title: 'Webhook Integrations',
      description: 'Set up automated workflows with webhook notifications'
    },
    {
      icon: <Support />,
      title: 'Dedicated Support',
      description: 'Get dedicated support for all your EDL conversion needs'
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
          EDL Converter Pro license not found. Please contact support.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VideoLibrary sx={{ fontSize: 40, color: 'primary.main' }} />
          EDL Converter Pro
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Professional EDL conversion and analysis tools for post-production workflows
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
                  {licenseInfo.limits.maxFiles}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max Files
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxFileSizeMB}MB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max File Size
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxEvents.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max Events
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
            startIcon={<Upload />}
            size="large"
          >
            Upload EDL File
          </Button>
          <Button
            variant="outlined"
            startIcon={<Batch />}
            size="large"
          >
            Batch Convert
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
      <Card sx={{ mb: 4 }}>
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
                  Total Conversions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxAPIRequestsPerMonth.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  API Requests/Month
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {licenseInfo.limits.maxBatchSize}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max Batch Size
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

      {/* Processing Limits */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Processing Limits
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">File Upload Limit</Typography>
                  <Typography variant="body2">{licenseInfo.limits.maxFileSizeMB}MB</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Batch Processing</Typography>
                  <Typography variant="body2">{licenseInfo.limits.maxBatchSize} files</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Storage Usage</Typography>
                  <Typography variant="body2">0 / {licenseInfo.limits.maxStorageGB}GB</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={0} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">API Requests</Typography>
                  <Typography variant="body2">0 / {licenseInfo.limits.maxAPIRequestsPerMonth.toLocaleString()}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={0} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EDLConverterProPage;
