import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert,
  ContentCopy,
  Edit,
  Delete,
  Pause,
  PlayArrow,
  Download,
  Share,
  Security,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Add,
  FilterList,
  Search,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface License {
  id: string;
  key: string;
  name: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  assignedTo?: {
    name: string;
    email: string;
    avatar?: string;
  };
  activatedAt?: string;
  expiresAt: string;
  lastUsed?: string;
  deviceCount: number;
  maxDevices: number;
  usage: {
    apiCalls: number;
    dataTransfer: number; // GB
  };
}

const mockLicenses: License[] = [
  {
    id: '1',
    key: 'DV14-PRO-2024-XXXX-XXXX-XXXX',
    name: 'Development Team License',
    tier: 'PRO',
    status: 'ACTIVE',
    assignedTo: {
      name: 'John Doe',
      email: 'john.doe@company.com',
      avatar: undefined,
    },
    activatedAt: '2024-01-15T10:30:00Z',
    expiresAt: '2024-12-15T10:30:00Z',
    lastUsed: '2024-01-20T14:22:00Z',
    deviceCount: 3,
    maxDevices: 5,
    usage: {
      apiCalls: 12456,
      dataTransfer: 2.3,
    },
  },
  {
    id: '2',
    key: 'DV14-ENT-2024-YYYY-YYYY-YYYY',
    name: 'Enterprise Main License',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    assignedTo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@enterprise.com',
    },
    activatedAt: '2024-01-01T00:00:00Z',
    expiresAt: '2025-01-01T00:00:00Z',
    lastUsed: '2024-01-20T16:45:00Z',
    deviceCount: 15,
    maxDevices: 50,
    usage: {
      apiCalls: 89234,
      dataTransfer: 15.7,
    },
  },
  {
    id: '3',
    key: 'DV14-BAS-2024-ZZZZ-ZZZZ-ZZZZ',
    name: 'Testing License',
    tier: 'BASIC',
    status: 'SUSPENDED',
    activatedAt: '2024-01-10T08:15:00Z',
    expiresAt: '2024-07-10T08:15:00Z',
    lastUsed: '2024-01-18T11:30:00Z',
    deviceCount: 1,
    maxDevices: 1,
    usage: {
      apiCalls: 1456,
      dataTransfer: 0.5,
    },
  },
];

const getStatusColor = (status: License['status']) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'SUSPENDED': return 'warning';
    case 'EXPIRED': return 'error';
    case 'PENDING': return 'info';
    default: return 'default';
  }
};

const getStatusIcon = (status: License['status']) => {
  switch (status) {
    case 'ACTIVE': return <CheckCircle />;
    case 'SUSPENDED': return <Warning />;
    case 'EXPIRED': return <ErrorIcon />;
    case 'PENDING': return <Warning />;
    default: return <CheckCircle />;
  }
};

const getTierColor = (tier: License['tier']) => {
  switch (tier) {
    case 'BASIC': return 'default';
    case 'PRO': return 'primary';
    case 'ENTERPRISE': return 'secondary';
    default: return 'default';
  }
};

const LicensesPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignEmail, setAssignEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load licenses: admins see all, users see their own
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const isAdmin = ['admin', 'enterprise']
                      .includes(String(user?.role || '').toLowerCase());

        const response = isAdmin
          ? await api.get(`${endpoints.admin.licenses()}?limit=200`)
          : await api.get(endpoints.licenses.myLicenses());

        const list: any[] = isAdmin
          ? (response.data?.data?.licenses ?? [])
          : (response.data?.data?.licenses ?? []);

        const mapped: License[] = list.map((l: any, idx: number) => ({
          id: l.id,
          key: l.key,
          name: l.user?.name ? `${l.user.name}'s License` : `License ${idx + 1}`,
          tier: l.tier,
          status: l.status,
          assignedTo: l.user ? { name: l.user.name || 'User', email: l.user.email || '' } : undefined,
          activatedAt: l.activatedAt || undefined,
          expiresAt: l.expiresAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          lastUsed: l.updatedAt || undefined,
          deviceCount: l.activationCount ?? 0,
          maxDevices: l.maxActivations ?? 1,
          usage: { apiCalls: 0, dataTransfer: 0 },
        }));

        if (!isMounted) return;
        setLicenses(mapped);
      } catch (err: any) {
        if (!isMounted) return;
        enqueueSnackbar(err?.message || 'Failed to load licenses', { variant: 'error' });
        setLicenses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.role, enqueueSnackbar]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, license: License) => {
    setAnchorEl(event.currentTarget);
    setSelectedLicense(license);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLicense(null);
  };

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    enqueueSnackbar('License key copied to clipboard', { variant: 'success' });
    handleMenuClose();
  };

  const handleAssignLicense = () => {
    if (selectedLicense && assignEmail) {
      enqueueSnackbar(`License assigned to ${assignEmail}`, { variant: 'success' });
      setAssignDialogOpen(false);
      setAssignEmail('');
      handleMenuClose();
    }
  };

  const handleSuspendLicense = () => {
    if (selectedLicense) {
      enqueueSnackbar('License suspended', { variant: 'warning' });
      handleMenuClose();
    }
  };

  const handleActivateLicense = () => {
    if (selectedLicense) {
      enqueueSnackbar('License activated', { variant: 'success' });
      handleMenuClose();
    }
  };

  const filteredLicenses = licenses.filter(license =>
    license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (license.assignedTo?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeLicenses = useMemo(() => licenses.filter(l => l.status === 'ACTIVE').length, [licenses]);
  const totalLicenses = useMemo(() => licenses.length, [licenses]);
  const utilizationRate = useMemo(() => {
    if (totalLicenses <= 0) return 0;
    return Math.round((activeLicenses / totalLicenses) * 100);
  }, [activeLicenses, totalLicenses]);

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              License Management
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Manage and monitor your BackboneLogic, Inc. licenses
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            Add License
          </Button>
        </Box>
      </motion.div>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}
            >
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {activeLicenses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Licenses
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {totalLicenses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Licenses
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {utilizationRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Utilization Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={utilizationRate}
                  sx={{
                    mt: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #00d4ff 0%, #667eea 100%)',
                    },
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  15
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days to Renewal
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Filters
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Licenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <TableContainer
          component={Paper}
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>License</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tier</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Devices</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow key={license.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {license.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {license.key}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    {license.assignedTo ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {license.assignedTo.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {license.assignedTo.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {license.assignedTo.email}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={getStatusIcon(license.status)}
                      label={license.status}
                      color={getStatusColor(license.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={license.tier}
                      color={getTierColor(license.tier)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {license.deviceCount}/{license.maxDevices}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(license.deviceCount / license.maxDevices) * 100}
                        sx={{
                          width: 80,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {license.usage.apiCalls.toLocaleString()} calls
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {license.usage.dataTransfer} GB
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {new Date(license.expiresAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, license)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <MenuItem onClick={() => selectedLicense && handleCopyLicense(selectedLicense.key)}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          Copy License Key
        </MenuItem>
        <MenuItem onClick={() => setAssignDialogOpen(true)}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          Assign License
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit License
        </MenuItem>
        {selectedLicense?.status === 'ACTIVE' ? (
          <MenuItem onClick={handleSuspendLicense}>
            <ListItemIcon>
              <Pause fontSize="small" />
            </ListItemIcon>
            Suspend License
          </MenuItem>
        ) : (
          <MenuItem onClick={handleActivateLicense}>
            <ListItemIcon>
              <PlayArrow fontSize="small" />
            </ListItemIcon>
            Activate License
          </MenuItem>
        )}
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          Download Details
        </MenuItem>
      </Menu>

      {/* Assign License Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle>Assign License</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignLicense}
            variant="contained"
            disabled={!assignEmail}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LicensesPage;
