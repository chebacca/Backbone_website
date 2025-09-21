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
  Dashboard,
  Movie,
  VideoLibrary,
  CheckCircle,
  Download,
  Settings,
  Support,
  CloudSync,
  Speed,
  Storage,
  Api,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const StandaloneOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [licenseInfo, setLicenseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading license info
    const loadLicenseInfo = async () => {
      try {
        // In a real implementation, this would fetch from the API
        if (user?.licenses) {
          setLicenseInfo(user.licenses);
        }
      } catch (error) {
        console.error('Error loading license info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLicenseInfo();
  }, [user]);

  const productCards = [
    {
      title: 'Call Sheet Pro',
      description: 'Professional call sheet creation and management',
      icon: <Movie sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/standalone/callsheet-pro',
      license: user?.licenses?.callsheetPro,
      features: ['Unlimited Call Sheets', 'Advanced Templates', 'Real-time Collaboration', 'Cloud Sync'],
      color: 'primary'
    },
    {
      title: 'EDL Converter Pro',
      description: 'Professional EDL conversion and analysis tools',
      icon: <VideoLibrary sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/standalone/edl-converter-pro',
      license: user?.licenses?.edlConverterPro,
      features: ['Unlimited Conversions', 'Batch Processing', 'Advanced Formats', 'API Access'],
      color: 'secondary'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Dashboard sx={{ fontSize: 40, color: 'primary.main' }} />
          Standalone License Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Welcome to your standalone license dashboard. Manage your Call Sheet Pro and EDL Converter Pro licenses.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label="STANDALONE USER" 
            color="primary" 
            size="small"
          />
          <Chip 
            label={`${user?.name || 'User'}`}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      {/* License Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Movie color="primary" />
                Call Sheet Pro
              </Typography>
              {user?.licenses?.callsheetPro ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={user.licenses.callsheetPro.status} 
                      color="success" 
                      size="small"
                    />
                    <Chip 
                      label={`Expires: ${new Date(user.licenses.callsheetPro.expiresAt._seconds * 1000).toLocaleDateString()}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    License Key: {user.licenses.callsheetPro.key}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/standalone/callsheet-pro')}
                  >
                    Open Call Sheet Pro
                  </Button>
                </Box>
              ) : (
                <Alert severity="error">
                  Call Sheet Pro license not found
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideoLibrary color="secondary" />
                EDL Converter Pro
              </Typography>
              {user?.licenses?.edlConverterPro ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={user.licenses.edlConverterPro.status} 
                      color="success" 
                      size="small"
                    />
                    <Chip 
                      label={`Expires: ${new Date(user.licenses.edlConverterPro.expiresAt._seconds * 1000).toLocaleDateString()}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    License Key: {user.licenses.edlConverterPro.key}
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={() => navigate('/standalone/edl-converter-pro')}
                  >
                    Open EDL Converter Pro
                  </Button>
                </Box>
              ) : (
                <Alert severity="error">
                  EDL Converter Pro license not found
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Product Features */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Your Products
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {productCards.map((product, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {product.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">
                      {product.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                  </Box>
                </Box>
                
                {product.license && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={product.license.status} 
                        color="success" 
                        size="small"
                      />
                      <Chip 
                        label={`Uses: ${product.license.usageCount}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Last used: {product.license.lastUsed ? 
                        new Date(product.license.lastUsed._seconds * 1000).toLocaleDateString() : 
                        'Never'
                      }
                    </Typography>
                  </Box>
                )}

                <List dense>
                  {product.features.map((feature, featureIndex) => (
                    <ListItem key={featureIndex} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Settings />}
              onClick={() => navigate('/standalone/settings')}
            >
              Settings
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Download />}
              onClick={() => navigate('/standalone/licenses')}
            >
              My Licenses
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Support />}
              onClick={() => navigate('/standalone/support')}
            >
              Support
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloudSync />}
              onClick={() => window.location.reload()}
            >
              Sync Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* System Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">Online</Typography>
                <Typography variant="body2" color="text.secondary">
                  All systems operational
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Speed sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">Fast</Typography>
                <Typography variant="body2" color="text.secondary">
                  Processing speed optimal
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Security sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">Secure</Typography>
                <Typography variant="body2" color="text.secondary">
                  Data encrypted and secure
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Api sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">API Ready</Typography>
                <Typography variant="body2" color="text.secondary">
                  All endpoints available
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StandaloneOverviewPage;
