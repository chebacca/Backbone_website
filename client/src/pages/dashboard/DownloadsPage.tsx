import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tab,
  Tabs,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download,
  Code,
  Description,
  GetApp,
  Android,
  Apple,
  Computer,
  Language,
  CloudDownload,
  History,
  Info,
  CheckCircle,
  ContentCopy,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface SDKVersion {
  id: string;
  version: string;
  releaseDate: string;
  size: string;
  changelog: string;
  platforms: Array<'windows' | 'macos' | 'linux' | 'android' | 'ios'>;
  isLatest: boolean;
  isLTS: boolean;
}

interface Documentation {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'api' | 'tutorial' | 'reference';
  format: 'pdf' | 'html' | 'markdown';
  size: string;
  lastUpdated: string;
}

interface DownloadHistory {
  id: string;
  item: string;
  version: string;
  downloadedAt: string;
  platform: string;
  size: string;
}

const mockSDKVersions: SDKVersion[] = [
  {
    id: '1',
    version: 'v14.2.1',
    releaseDate: '2024-01-15',
    size: '45.2 MB',
    changelog: 'Bug fixes and performance improvements',
    platforms: ['windows', 'macos', 'linux'],
    isLatest: true,
    isLTS: false,
  },
  {
    id: '2',
    version: 'v14.2.0',
    releaseDate: '2024-01-01',
    size: '44.8 MB',
    changelog: 'New authentication features and API enhancements',
    platforms: ['windows', 'macos', 'linux', 'android', 'ios'],
    isLatest: false,
    isLTS: true,
  },
  {
    id: '3',
    version: 'v14.1.5',
    releaseDate: '2023-12-15',
    size: '43.9 MB',
    changelog: 'Security updates and stability improvements',
    platforms: ['windows', 'macos', 'linux'],
    isLatest: false,
    isLTS: false,
  },
];

const mockSDKDocumentation: Documentation[] = [
  {
    id: '1',
    title: 'SDK Installation Guide',
    description: 'Step-by-step SDK installation and setup instructions',
    type: 'guide',
    format: 'pdf',
    size: '1.8 MB',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    title: 'SDK API Reference',
    description: 'Complete SDK API documentation with code examples',
    type: 'api',
    format: 'html',
    size: '750 KB',
    lastUpdated: '2024-01-10',
  },
  {
    id: '3',
    title: 'SDK Integration Tutorial',
    description: 'Quick start tutorial for SDK integration',
    type: 'tutorial',
    format: 'markdown',
    size: '120 KB',
    lastUpdated: '2024-01-08',
  },
];

const mockDownloadHistory: DownloadHistory[] = [
  {
    id: '1',
    item: 'BackboneLogic, Inc. SDK',
    version: 'v14.2.1',
    downloadedAt: '2024-01-20T10:30:00Z',
    platform: 'Windows x64',
    size: '45.2 MB',
  },
  {
    id: '2',
    item: 'API Reference',
    version: 'v14.2.0',
    downloadedAt: '2024-01-18T14:22:00Z',
    platform: 'Web',
    size: '850 KB',
  },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'windows': return <Computer />;
    case 'macos': return <Apple />;
    case 'linux': return <Computer />;
    case 'android': return <Android />;
    case 'ios': return <Apple />;
    default: return <Computer />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'guide': return <Description />;
    case 'api': return <Code />;
    case 'tutorial': return <Language />;
    case 'reference': return <Info />;
    default: return <Description />;
  }
};

const DownloadsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedTab, setSelectedTab] = useState(0);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState<SDKVersion | null>(null);
  const [licenseKey, setLicenseKey] = useState('DV14-PRO-2024-XXXX-XXXX-XXXX');

  const handleDownload = (item: SDKVersion | Documentation, platform?: string) => {
    if ('platforms' in item) {
      setSelectedDownload(item);
      setDownloadDialogOpen(true);
    } else {
      enqueueSnackbar(`Downloading ${item.title}...`, { variant: 'info' });
    }
  };

  const confirmDownload = () => {
    if (selectedDownload) {
      enqueueSnackbar(`Downloading ${selectedDownload.version}...`, { variant: 'success' });
    }
    setDownloadDialogOpen(false);
    setSelectedDownload(null);
  };

  const copyLicenseKey = () => {
    navigator.clipboard.writeText(licenseKey);
    enqueueSnackbar('License key copied to clipboard', { variant: 'success' });
  };

  const generateDownloadLink = () => {
    const link = `https://downloads.backbonelogic.com/sdk/v14.2.1/?key=${licenseKey}`;
    navigator.clipboard.writeText(link);
    enqueueSnackbar('Download link copied to clipboard', { variant: 'success' });
  };

  return (
    <Box>
      {/* Header */}
      <Box >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Downloads & Resources
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access SDK packages, SDK documentation, and development resources
          </Typography>
        </Box>
      </Box>

      {/* License Key Card */}
      <Box >
        <Alert
          severity="info"
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
            border: '1px solid rgba(33, 150, 243, 0.2)',
          }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Copy License Key">
                <IconButton
                  size="small"
                  onClick={copyLicenseKey}
                  sx={{ color: 'info.main' }}
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
              <Tooltip title="Generate Download Link">
                <IconButton
                  size="small"
                  onClick={generateDownloadLink}
                  sx={{ color: 'info.main' }}
                >
                  <LinkIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Your License Key: <Box component="code" sx={{ fontFamily: 'monospace', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{licenseKey}</Box>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Use this key to authenticate SDK downloads and activate your licenses
          </Typography>
        </Alert>
      </Box>

      {/* Tabs */}
      <Box >
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Tab label="SDK Downloads" icon={<Download />} />
            <Tab label="SDK Docs" icon={<Description />} />
            <Tab label="Download History" icon={<History />} />
          </Tabs>
        </Box>
      </Box>

      {/* SDK Downloads Tab */}
      {selectedTab === 0 && (
        <Box >
          <Grid container spacing={3}>
            {mockSDKVersions.map((sdk, index) => (
              <Grid item xs={12} key={sdk.id}>
                <Box >
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                              BackboneLogic, Inc. SDK {sdk.version}
                            </Typography>
                            {sdk.isLatest && (
                              <Chip label="Latest" color="primary" size="small" />
                            )}
                            {sdk.isLTS && (
                              <Chip label="LTS" color="success" size="small" />
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {sdk.changelog}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            {sdk.platforms.map((platform) => (
                              <Chip
                                key={platform}
                                icon={getPlatformIcon(platform)}
                                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary">
                            Released: {new Date(sdk.releaseDate).toLocaleDateString()} • Size: {sdk.size}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                              variant="contained"
                              startIcon={<Download />}
                              onClick={() => handleDownload(sdk)}
                              sx={{
                                background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                                color: '#000',
                                fontWeight: 600,
                              }}
                            >
                              Download SDK
                            </Button>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button variant="outlined" size="small">
                                View Changelog
                              </Button>
                              <Button variant="outlined" size="small">
                                Release Notes
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Documentation Tab */}
      {selectedTab === 1 && (
        <Box >
          <Grid container spacing={3}>
                          {mockSDKDocumentation.map((doc, index) => (
              <Grid item xs={12} md={6} lg={4} key={doc.id}>
                <Box >
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {getTypeIcon(doc.type)}
                        <Chip
                          label={doc.type.toUpperCase()}
                          size="small"
                          color={doc.type === 'api' ? 'primary' : 'default'}
                        />
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {doc.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                        {doc.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {doc.size} • {doc.format.toUpperCase()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="outlined"
                        startIcon={<GetApp />}
                        onClick={() => handleDownload(doc)}
                        fullWidth
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Download History Tab */}
      {selectedTab === 2 && (
        <Box >
          <Paper
            sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <List>
              {mockDownloadHistory.map((download, index) => (
                <React.Fragment key={download.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      <CloudDownload sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {download.item}
                          </Typography>
                          <Chip label={download.version} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(download.downloadedAt).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {download.platform}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {download.size}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button variant="outlined" size="small" startIcon={<Download />}>
                      Re-download
                    </Button>
                  </ListItem>
                  {index < mockDownloadHistory.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* Download Confirmation Dialog */}
      <Dialog
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: 400,
          },
        }}
      >
        <DialogTitle>
          Download SDK {selectedDownload?.version}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Select your platform to download the BackboneLogic, Inc. SDK:
          </Typography>
          
          <Grid container spacing={2}>
            {selectedDownload?.platforms.map((platform) => (
              <Grid item xs={6} key={platform}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={getPlatformIcon(platform)}
                  sx={{ py: 1.5, justifyContent: 'flex-start' }}
                  onClick={confirmDownload}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Button>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <CheckCircle sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              Your license key will be validated automatically during download
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DownloadsPage;
