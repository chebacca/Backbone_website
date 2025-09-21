/**
 * 📥 Downloads Page - Standalone Version
 * 
 * Allows standalone users to download their licensed applications (DMG, EXE, etc.)
 * Shows available downloads, version information, and download history.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Download,
  GetApp,
  Computer,
  Apple,
  Android,
  CheckCircle,
  Schedule,
  Warning,
  Info,
  Refresh,
  CloudDownload,
  Storage,
  Security,
  Speed,
  Memory,
  Build,
  Code,
  Description,
  History,
  Star,
  NewReleases,
  SystemUpdate,
  InstallMobile,
  LaptopMac,
  DesktopWindows,
  PhoneAndroid,
  Launch,
  Web,
  Movie,
  VideoLibrary,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

interface DownloadItem {
  id: string;
  name: string;
  version: string;
  platform: 'macos' | 'windows' | 'linux' | 'web';
  architecture: 'x64' | 'arm64' | 'universal';
  fileSize: string;
  downloadUrl: string;
  releaseDate: string;
  isLatest: boolean;
  isBeta: boolean;
  isStable: boolean;
  checksum: string;
  description: string;
  requirements: string[];
  changelog: string[];
  downloadCount: number;
  lastDownloaded?: string;
}

interface DownloadStats {
  totalDownloads: number;
  thisMonth: number;
  lastDownload: string;
  favoritePlatform: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockDownloads: DownloadItem[] = [
  {
    id: '1',
    name: 'Backbone Call Sheet Pro',
    version: '1.2.0',
    platform: 'macos',
    architecture: 'universal',
    fileSize: '125.4 MB',
    downloadUrl: '/downloads/backbone-callsheet-pro-1.2.0.dmg',
    releaseDate: '2024-01-15',
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: 'sha256:abc123...',
    description: 'Professional call sheet management for film and TV production',
    requirements: ['macOS 11.0+', '8GB RAM', '500MB free space'],
    changelog: [
      'Added real-time collaboration features',
      'Improved PDF export quality',
      'Fixed timezone handling issues',
      'Enhanced mobile responsiveness'
    ],
    downloadCount: 1247,
    lastDownloaded: '2024-01-20'
  },
  {
    id: '2',
    name: 'Backbone EDL Converter Pro',
    version: '1.0.5',
    platform: 'macos',
    architecture: 'universal',
    fileSize: '98.7 MB',
    downloadUrl: '/downloads/backbone-edl-converter-pro-1.0.5.dmg',
    releaseDate: '2024-01-10',
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: 'sha256:def456...',
    description: 'Professional EDL and XML to CSV converter with advanced parsing',
    requirements: ['macOS 11.0+', '4GB RAM', '200MB free space'],
    changelog: [
      'Added batch processing support',
      'Improved XML parsing accuracy',
      'Enhanced export options',
      'Fixed memory leak issues'
    ],
    downloadCount: 892,
    lastDownloaded: '2024-01-18'
  },
  {
    id: '3',
    name: 'Backbone Call Sheet Pro',
    version: '1.2.0',
    platform: 'windows',
    architecture: 'x64',
    fileSize: '118.2 MB',
    downloadUrl: '/downloads/backbone-callsheet-pro-1.2.0.exe',
    releaseDate: '2024-01-15',
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: 'sha256:ghi789...',
    description: 'Professional call sheet management for film and TV production',
    requirements: ['Windows 10+', '8GB RAM', '500MB free space'],
    changelog: [
      'Added real-time collaboration features',
      'Improved PDF export quality',
      'Fixed timezone handling issues',
      'Enhanced mobile responsiveness'
    ],
    downloadCount: 2156,
    lastDownloaded: '2024-01-19'
  },
  {
    id: '4',
    name: 'Backbone EDL Converter Pro',
    version: '1.0.5',
    platform: 'windows',
    architecture: 'x64',
    fileSize: '95.3 MB',
    downloadUrl: '/downloads/backbone-edl-converter-pro-1.0.5.exe',
    releaseDate: '2024-01-10',
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: 'sha256:jkl012...',
    description: 'Professional EDL and XML to CSV converter with advanced parsing',
    requirements: ['Windows 10+', '4GB RAM', '200MB free space'],
    changelog: [
      'Added batch processing support',
      'Improved XML parsing accuracy',
      'Enhanced export options',
      'Fixed memory leak issues'
    ],
    downloadCount: 1834,
    lastDownloaded: '2024-01-17'
  },
  {
    id: '5',
    name: 'Backbone Call Sheet Pro',
    version: '1.1.9',
    platform: 'macos',
    architecture: 'universal',
    fileSize: '122.1 MB',
    downloadUrl: '/downloads/backbone-callsheet-pro-1.1.9.dmg',
    releaseDate: '2024-01-01',
    isLatest: false,
    isBeta: false,
    isStable: true,
    checksum: 'sha256:mno345...',
    description: 'Professional call sheet management for film and TV production',
    requirements: ['macOS 11.0+', '8GB RAM', '500MB free space'],
    changelog: [
      'Bug fixes and performance improvements',
      'Updated UI components',
      'Enhanced data validation'
    ],
    downloadCount: 456,
    lastDownloaded: '2024-01-05'
  },
  {
    id: '6',
    name: 'Call Sheet Pro Web App',
    version: '1.2.0',
    platform: 'web',
    architecture: 'universal',
    fileSize: '0 MB',
    downloadUrl: 'https://backbone-callsheet-standalone.web.app',
    releaseDate: '2024-01-15',
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: 'N/A',
    description: 'Professional call sheet management - web version',
    requirements: ['Modern web browser', 'Internet connection', 'JavaScript enabled'],
    changelog: [
      'Real-time collaboration features',
      'Cloud sync and storage',
      'Mobile-responsive design',
      'Progressive Web App support'
    ],
    downloadCount: 3421,
    lastDownloaded: '2024-01-20'
  },
  {
    id: '7',
    name: 'EDL Converter Pro Web App',
    version: '1.0.5',
    platform: 'web',
    architecture: 'universal',
    fileSize: '0 MB',
    downloadUrl: 'https://backbone-edl-standalone.web.app',
    releaseDate: '2024-01-10',
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: 'N/A',
    description: 'Professional EDL conversion and analysis - web version',
    requirements: ['Modern web browser', 'Internet connection', 'JavaScript enabled'],
    changelog: [
      'Batch processing support',
      'Cloud-based processing',
      'Real-time analysis',
      'API integration'
    ],
    downloadCount: 2156,
    lastDownloaded: '2024-01-18'
  }
];

const mockStats: DownloadStats = {
  totalDownloads: 6585,
  thisMonth: 1247,
  lastDownload: '2024-01-20',
  favoritePlatform: 'Windows'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPlatformIcon = (platform: DownloadItem['platform']) => {
  switch (platform) {
    case 'macos': return <Apple />;
    case 'windows': return <DesktopWindows />;
    case 'linux': return <Computer />;
    case 'web': return <Computer />;
    default: return <Computer />;
  }
};

const getPlatformColor = (platform: DownloadItem['platform']) => {
  switch (platform) {
    case 'macos': return 'default';
    case 'windows': return 'primary';
    case 'linux': return 'secondary';
    case 'web': return 'success';
    default: return 'default';
  }
};

const getArchitectureLabel = (arch: DownloadItem['architecture']) => {
  switch (arch) {
    case 'x64': return '64-bit';
    case 'arm64': return 'ARM64';
    case 'universal': return 'Universal';
    default: return arch;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DownloadsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  // Check if user is standalone user
  const isStandaloneUser = String(user?.role || '').toUpperCase() === 'STANDALONE' || 
                          String(user?.subscription?.plan || '').toUpperCase() === 'STANDALONE' ||
                          user?.email?.includes('standalone');

  // Load downloads data
  useEffect(() => {
    const loadDownloads = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDownloads(mockDownloads);
        setStats(mockStats);
      } catch (error) {
        enqueueSnackbar('Failed to load downloads', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadDownloads();
  }, [enqueueSnackbar]);

  const handleDownload = async (download: DownloadItem) => {
    try {
      if (download.platform === 'web') {
        // For web apps, add URL parameters and open in new tab
        const appType = download.name.toLowerCase().includes('callsheet') ? 'callsheet' : 'edl';
        const urlWithParams = `${download.downloadUrl}?app=${appType}&standalone=true&source=licensing-website`;
        window.open(urlWithParams, '_blank', 'noopener,noreferrer');
        enqueueSnackbar(`Launching ${download.name}...`, { variant: 'info' });
      } else {
        // For desktop apps, simulate download
        enqueueSnackbar(`Downloading ${download.name} v${download.version}...`, { variant: 'info' });
        
        // In a real app, this would trigger the actual download
        // For now, we'll just show a success message
        setTimeout(() => {
          enqueueSnackbar(`${download.name} downloaded successfully!`, { variant: 'success' });
        }, 2000);
      }
    } catch (error) {
      enqueueSnackbar('Download failed', { variant: 'error' });
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      enqueueSnackbar('Downloads refreshed', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to refresh', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchWebApp = (appType: 'callsheet' | 'edl') => {
    const urls = {
      callsheet: 'https://backbone-callsheet-standalone.web.app',
      edl: 'https://backbone-edl-standalone.web.app'
    };
    
    const appNames = {
      callsheet: 'Call Sheet Pro',
      edl: 'EDL Converter Pro'
    };

    try {
      // Add URL parameters to indicate standalone app type
      const urlWithParams = `${urls[appType]}?app=${appType}&standalone=true&source=licensing-website`;
      
      // Open in new tab
      window.open(urlWithParams, '_blank', 'noopener,noreferrer');
      enqueueSnackbar(`Launching ${appNames[appType]} web app...`, { variant: 'info' });
    } catch (error) {
      enqueueSnackbar(`Failed to launch ${appNames[appType]}`, { variant: 'error' });
    }
  };

  const filteredDownloads = downloads.filter(download => 
    filterPlatform === 'all' || download.platform === filterPlatform
  );

  const paginatedDownloads = filteredDownloads.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Downloads...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching available downloads and version information
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Downloads
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Download your licensed Backbone applications for desktop and web
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.totalDownloads.toLocaleString()}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Total Downloads
                  </Typography>
                </Box>
                <CloudDownload sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.thisMonth.toLocaleString()}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    This Month
                  </Typography>
                </Box>
                <NewReleases sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.favoritePlatform}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Top Platform
                  </Typography>
                </Box>
                <Computer sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {downloads.filter(d => d.isLatest).length}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Latest Versions
                  </Typography>
                </Box>
                <Star sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Web App Launch Section for Standalone Users */}
      {isStandaloneUser && (
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  🚀 Launch Web Apps
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Access your licensed applications directly in your browser
                </Typography>
              </Box>
              <Web sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Movie sx={{ fontSize: 32, mr: 2, color: '#00d4ff' }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Call Sheet Pro
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Professional call sheet creation and management
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                      Create, manage, and collaborate on call sheets with advanced templates and real-time features.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Launch />}
                      onClick={() => handleLaunchWebApp('callsheet')}
                      sx={{
                        background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00b8e6 0%, #5a6fd8 100%)',
                        }
                      }}
                      fullWidth
                    >
                      Launch Call Sheet Pro
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VideoLibrary sx={{ fontSize: 32, mr: 2, color: '#ff6b6b' }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          EDL Converter Pro
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Professional EDL conversion and analysis tools
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                      Convert EDL and XML files with advanced parsing, batch processing, and API access.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Launch />}
                      onClick={() => handleLaunchWebApp('edl')}
                      sx={{
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #ff5252 0%, #e55039 100%)',
                        }
                      }}
                      fullWidth
                    >
                      Launch EDL Converter Pro
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Platform Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filter by Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All Platforms"
            onClick={() => setFilterPlatform('all')}
            color={filterPlatform === 'all' ? 'primary' : 'default'}
            variant={filterPlatform === 'all' ? 'filled' : 'outlined'}
          />
          <Chip
            label="macOS"
            icon={<Apple />}
            onClick={() => setFilterPlatform('macos')}
            color={filterPlatform === 'macos' ? 'primary' : 'default'}
            variant={filterPlatform === 'macos' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Windows"
            icon={<DesktopWindows />}
            onClick={() => setFilterPlatform('windows')}
            color={filterPlatform === 'windows' ? 'primary' : 'default'}
            variant={filterPlatform === 'windows' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Linux"
            icon={<Computer />}
            onClick={() => setFilterPlatform('linux')}
            color={filterPlatform === 'linux' ? 'primary' : 'default'}
            variant={filterPlatform === 'linux' ? 'filled' : 'outlined'}
          />
          <Chip
            label="Web"
            icon={<Web />}
            onClick={() => setFilterPlatform('web')}
            color={filterPlatform === 'web' ? 'primary' : 'default'}
            variant={filterPlatform === 'web' ? 'filled' : 'outlined'}
          />
        </Box>
      </Box>

      {/* Downloads Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Available Downloads ({filteredDownloads.length})
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Application</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Release Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Downloads</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDownloads.map((download) => (
                  <TableRow key={download.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getPlatformIcon(download.platform)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {download.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {download.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {download.isLatest && (
                              <Chip label="Latest" size="small" color="success" />
                            )}
                            {download.isBeta && (
                              <Chip label="Beta" size="small" color="warning" />
                            )}
                            {download.isStable && (
                              <Chip label="Stable" size="small" color="primary" />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        v{download.version}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getArchitectureLabel(download.architecture)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getPlatformIcon(download.platform)}
                        label={download.platform.toUpperCase()}
                        color={getPlatformColor(download.platform) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {download.fileSize}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(download.releaseDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {download.downloadCount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        startIcon={download.platform === 'web' ? <Launch /> : <Download />}
                        onClick={() => handleDownload(download)}
                        sx={{
                          background: download.platform === 'web' 
                            ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                            : 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                          color: download.platform === 'web' ? '#fff' : '#000',
                          fontWeight: 600,
                        }}
                      >
                        {download.platform === 'web' ? 'Launch' : 'Download'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredDownloads.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* Download History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Recent Downloads
          </Typography>
          <List>
            {downloads
              .filter(d => d.lastDownloaded)
              .sort((a, b) => new Date(b.lastDownloaded!).getTime() - new Date(a.lastDownloaded!).getTime())
              .slice(0, 5)
              .map((download, index) => (
                <React.Fragment key={download.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getPlatformIcon(download.platform)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${download.name} v${download.version}`}
                      secondary={`Downloaded on ${new Date(download.lastDownloaded!).toLocaleDateString()} • ${download.platform.toUpperCase()}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={download.fileSize}
                        size="small"
                        variant="outlined"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < 4 && <Divider />}
                </React.Fragment>
              ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DownloadsPage;