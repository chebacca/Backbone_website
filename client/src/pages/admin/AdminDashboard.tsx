import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  ChipProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  InputAdornment,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  VpnKey as LicenseIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { useSnackbar } from 'notistack';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingApprovals: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'disabled';
interface SubsystemHealth {
  status: HealthStatus;
  responseTimeMs?: number;
  error?: string;
  message?: string;
  metrics?: Record<string, number>;
}
interface SystemHealth {
  overall: HealthStatus;
  checkedAt?: string;
  database: SubsystemHealth;
  email: SubsystemHealth;
  payment: SubsystemHealth;
  webhooks?: SubsystemHealth;
}

const SubsystemCard: React.FC<{ title: string; data?: SubsystemHealth | null }> = ({ title, data }) => {
  const color: ChipProps['color'] = data?.status === 'healthy'
    ? 'success'
    : data?.status === 'degraded'
    ? 'warning'
    : data?.status === 'unhealthy'
    ? 'error'
    : 'default';
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1">{title}</Typography>
          <Chip size="small" label={(data?.status || 'unknown').toUpperCase()} color={color} />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Response time: {data?.responseTimeMs != null ? `${data.responseTimeMs} ms` : '—'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              {data?.message || ''}
            </Typography>
          </Grid>
          {data?.error && (
            <Grid item xs={12}>
              <Alert severity="warning">{data.error}</Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  subscription?: string;
  lastLogin: string;
  createdAt: string;
}

interface License {
  id: string;
  key: string;
  userId: string;
  userEmail: string;
  tier: string;
  status: 'active' | 'expired' | 'suspended' | 'pending' | 'revoked';
  activatedAt: string;
  expiresAt: string;
  lastUsed: string;
}

const AdminDashboard: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    systemHealth: 'healthy',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [usersFilters, setUsersFilters] = useState<{ role?: string; status?: string; tier?: string }>({});
  const [licensesFilters, setLicensesFilters] = useState<{ tier?: string; status?: string }>({});
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(1);
  const [paymentsFilters, setPaymentsFilters] = useState<{ status?: string; email?: string; from?: string; to?: string }>({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<{ payment?: any; licenses?: any[] }>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ userId: '', subscriptionId: '', tier: 'PRO', seats: 1 });
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  // Search state variables
  const [usersSearch, setUsersSearch] = useState('');
  const [licensesSearch, setLicensesSearch] = useState('');
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [showUsersWithNoLicenses, setShowUsersWithNoLicenses] = useState<boolean>(false);

  // Filtered data using useMemo for performance
  const filteredUsers = useMemo(() => {
    const searchTerm = usersSearch.trim().toLowerCase();
    return users
      .filter((user) => {
        if (!searchTerm) return true;
        return (
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.role.toLowerCase().includes(searchTerm) ||
          user.status.toLowerCase().includes(searchTerm) ||
          (user.subscription && user.subscription.toLowerCase().includes(searchTerm))
        );
      })
      .filter((user) => (usersFilters.role ? user.role === usersFilters.role : true))
      .filter((user) => (usersFilters.status ? user.status === usersFilters.status.toLowerCase() : true))
      .filter((user) => (usersFilters.tier ? (user.subscription || '').toUpperCase() === usersFilters.tier : true));
  }, [users, usersSearch, usersFilters]);

  const filteredLicenses = useMemo(() => {
    if (!licensesSearch.trim()) return licenses;
    
    const searchTerm = licensesSearch.toLowerCase();
    return licenses.filter(license => 
      license.key.toLowerCase().includes(searchTerm) ||
      license.userEmail.toLowerCase().includes(searchTerm) ||
      license.tier.toLowerCase().includes(searchTerm) ||
      license.status.toLowerCase().includes(searchTerm) ||
      new Date(license.expiresAt).toLocaleDateString().includes(searchTerm) ||
      new Date(license.activatedAt).toLocaleDateString().includes(searchTerm)
    );
  }, [licenses, licensesSearch]);

  // Group by ALL users to ensure everyone is visible (licenses may be zero)
  const groupedLicenses = useMemo(() => {
    const licensesByUserId = new Map<string, License[]>();
    filteredLicenses.forEach((l) => {
      const list = licensesByUserId.get(l.userId) || [];
      list.push(l);
      licensesByUserId.set(l.userId, list);
    });

    const groups = users.map((u) => {
      const userLicenses = licensesByUserId.get(u.id) || [];
      const activeCount = userLicenses.filter((l) => l.status === 'active').length;
      return {
        userId: u.id,
        userEmail: u.email,
        licenses: userLicenses,
        totalLicenses: userLicenses.length,
        activeLicenses: activeCount,
      };
    });

    const maybeFiltered = showUsersWithNoLicenses ? groups : groups.filter((g) => g.totalLicenses > 0);
    return maybeFiltered.sort((a, b) => a.userEmail.localeCompare(b.userEmail));
  }, [users, filteredLicenses, showUsersWithNoLicenses]);

  const parseDate = (value: any): Date => {
    if (!value) return new Date(NaN);
    if (typeof value === 'string') return new Date(value);
    if (value instanceof Date) return value;
    if (typeof value === 'object' && value !== null) {
      if (typeof (value as any)._seconds === 'number') {
        return new Date((value as any)._seconds * 1000);
      }
      if (typeof (value as any).seconds === 'number') {
        return new Date((value as any).seconds * 1000);
      }
      if (typeof (value as any).toDate === 'function') {
        try { return (value as any).toDate(); } catch { /* ignore */ }
      }
    }
    return new Date(value);
  };

  const formatCurrency = (amountCents: number | undefined | null): string => {
    const cents = typeof amountCents === 'number' ? amountCents : 0;
    return `$${(cents / 100).toFixed(2)}`;
  };

  const filteredPayments = useMemo(() => {
    if (!paymentsSearch.trim()) return payments;
    
    const searchTerm = paymentsSearch.toLowerCase();
    return payments.filter(payment => 
      payment.id.toLowerCase().includes(searchTerm) ||
      (payment.user?.email && payment.user.email.toLowerCase().includes(searchTerm)) ||
      (payment.subscription?.tier && payment.subscription.tier.toLowerCase().includes(searchTerm)) ||
      payment.status.toLowerCase().includes(searchTerm) ||
      parseDate(payment.createdAt).toLocaleDateString().toLowerCase().includes(searchTerm) ||
      formatCurrency(payment.amount).toLowerCase().includes(searchTerm)
    );
  }, [payments, paymentsSearch]);

  // Clear search functions
  const clearUsersSearch = () => setUsersSearch('');
  const clearLicensesSearch = () => setLicensesSearch('');
  const clearPaymentsSearch = () => setPaymentsSearch('');

  const toggleUserExpansion = (userEmail: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userEmail)) {
        newSet.delete(userEmail);
      } else {
        newSet.add(userEmail);
      }
      return newSet;
    });
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Ensure only SUPERADMIN can see this data
        const roleUpper = String(user?.role || '').toUpperCase();
        if (roleUpper !== 'SUPERADMIN') {
          setUsers([]);
          setLicenses([]);
          setStats((s) => ({ ...s, systemHealth: 'warning' }));
          return;
        }

        const [usersRes, licensesRes, paymentsRes, systemHealthRes, statsRes] = await Promise.all([
          api.get(`${endpoints.admin.users()}?page=1&limit=100`),
          // Initial licenses fetch kept lightweight; full pagination handled by tab effect
          api.get(`${endpoints.admin.licenses()}?page=1&limit=100`),
          api.get(endpoints.admin.paymentAnalytics()),
          api.get(endpoints.admin.systemHealth()),
          api.get(endpoints.admin.dashboardStats()),
        ]);

        const usersData = usersRes.data?.data?.users ?? [];
        const licensesData = licensesRes.data?.data?.licenses ?? [];
        // Use dashboard-stats as the source of truth for revenue/subscriptions
        const dashboardStats = statsRes.data?.data?.stats ?? { totalRevenue: 0, activeSubscriptions: 0 };
        const recent = dashboardStats?.recentPayments ?? [];
        const healthObj = systemHealthRes.data?.data?.health || systemHealthRes.data?.data;
        const health = healthObj?.overall || healthObj?.status || 'healthy';

        if (!isMounted) return;
        setUsers(usersData.map((u: any) => ({
          id: u.id,
          email: u.email,
          firstName: u.name?.split(' ')[0] ?? '',
          lastName: u.name?.split(' ').slice(1).join(' ') ?? '',
          role: u.role,
          status: u.status?.toLowerCase?.() || 'active',
          subscription: (u.subscriptions?.[0]?.tier) ?? undefined,
          lastLogin: u.lastLoginAt || new Date().toISOString(),
          createdAt: u.createdAt || new Date().toISOString(),
        })));

        // Do not set licenses here to avoid showing only the first page.
        // The Licenses tab effect will load all pages and populate `licenses`.
        setLicenses([]);

        setStats({
          totalUsers: Number(dashboardStats.totalUsers || usersData.length) || 0,
          activeSubscriptions: dashboardStats.activeSubscriptions ?? 0,
          // Convert cents to dollars for display
          totalRevenue: Math.round((dashboardStats.totalRevenue ?? 0)) / 100,
          pendingApprovals: 0,
          systemHealth: health === 'healthy' ? 'healthy' : health === 'degraded' ? 'warning' : 'error',
        });
        setSystemHealth(healthObj || null);
        setRecentPayments(recent);
      } catch (error) {
        if (!isMounted) return;
        setUsers([]);
        setLicenses([]);
        setStats((s) => ({ ...s, systemHealth: 'error' }));
        setRecentPayments([]);
        setSystemHealth(null);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.role]);

  // Fetch ALL licenses across pages (server caps 100 per page). Applies current filters.
  const fetchLicenses = async () => {
    const buildParams = (page: number) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '100');
      if (licensesFilters.tier) params.set('tier', String(licensesFilters.tier));
      if (licensesFilters.status) params.set('status', String(licensesFilters.status));
      return params.toString();
    };

    // First page to discover total pages
    const firstRes = await api.get(`${endpoints.admin.licenses()}?${buildParams(1)}`);
    const firstList = firstRes.data?.data?.licenses ?? [];
    const pagination = firstRes.data?.data?.pagination ?? { pages: 1, page: 1 };
    const totalPages: number = Math.max(1, Number(pagination.pages) || 1);

    let allLicenses: any[] = [...firstList];

    if (totalPages > 1) {
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const batchSize = 5;
      for (let i = 0; i < remainingPages.length; i += batchSize) {
        const batch = remainingPages.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map((p) => api.get(`${endpoints.admin.licenses()}?${buildParams(p)}`))
        );
        results.forEach((res) => {
          const list = res.data?.data?.licenses ?? [];
          allLicenses = allLicenses.concat(list);
        });
      }
    }

    setLicenses(
      allLicenses.map((l: any) => ({
        id: l.id,
        key: l.key,
        userId: l.userId,
        userEmail: l.user?.email ?? '',
        tier: l.tier,
        status: String(l.status || '').toLowerCase() as License['status'],
        activatedAt: new Date(parseDate(l.activatedAt || l.createdAt)).toISOString(),
        expiresAt: new Date(parseDate(l.expiresAt || l.createdAt)).toISOString(),
        lastUsed: new Date(parseDate(l.updatedAt || l.createdAt)).toISOString(),
      }))
    );
  };

  useEffect(() => {
    const roleUpper = String(user?.role || '').toUpperCase();
    const isSuperAdmin = roleUpper === 'SUPERADMIN';
    if (!isSuperAdmin) return;
    if (activeTab !== 1) return;
    fetchLicenses().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, licensesFilters, user?.role]);

  const refreshHealth = async () => {
    try {
      setHealthLoading(true);
      const res = await api.get(endpoints.admin.systemHealth());
      const healthObj = res.data?.data?.health || res.data?.data;
      setSystemHealth(healthObj || null);
      const overall = healthObj?.overall || 'healthy';
      setStats((s) => ({ ...s, systemHealth: overall === 'healthy' ? 'healthy' : overall === 'degraded' ? 'warning' : 'error' }));
    } catch {
      setSystemHealth(null);
      setStats((s) => ({ ...s, systemHealth: 'error' }));
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchPayments = async (page = 1) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '100');
    if (paymentsFilters.status) params.set('status', paymentsFilters.status);
    if (paymentsFilters.email) params.set('email', paymentsFilters.email);
    if (paymentsFilters.from) params.set('from', paymentsFilters.from);
    if (paymentsFilters.to) params.set('to', paymentsFilters.to);
    const res = await api.get(`${endpoints.admin.payments()}?${params.toString()}`);
    const list = res.data?.data?.payments ?? [];
    const pag = res.data?.data?.pagination ?? { pages: 1, page: 1 };
    setPayments(list);
    setPaymentsPage(pag.page || page);
    setPaymentsTotalPages(pag.pages || 1);
  };

  useEffect(() => {
    const roleUpper = String(user?.role || '').toUpperCase();
    const isSuperAdmin = roleUpper === 'SUPERADMIN';
    if (!isSuperAdmin) return;
    if (activeTab !== 2) return;
    fetchPayments(paymentsPage).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, paymentsPage, paymentsFilters, user?.role]);

  const openPaymentDetails = async (paymentId: string) => {
    try {
      const res = await api.get(endpoints.admin.paymentDetails(paymentId));
      const data = res.data?.data || {};
      setDetailsData({ payment: data.payment, licenses: data.licenses || [] });
      setDetailsOpen(true);
    } catch (e) {
      enqueueSnackbar('Failed to load payment details', { variant: 'error' });
    }
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleUserSave = () => {
    enqueueSnackbar('User updated successfully', { variant: 'success' });
    setUserDialogOpen(false);
    setSelectedUser(null);
  };

  const handleLicenseEdit = () => {
    setLicenseDialogOpen(true);
  };

  const openAddDialog = async () => {
    setAddDialogOpen(true);
  };

  const onUserSelect = async (uid: string) => {
    setAddForm(prev => ({ ...prev, userId: uid, subscriptionId: '' }));
    if (uid) {
      const detailsRes = await api.get(endpoints.admin.userDetails(uid));
      const subs = detailsRes.data?.data?.user?.subscriptions || [];
      setUserSubscriptions(subs.filter((s: any) => s.status === 'ACTIVE'));
    } else {
      setUserSubscriptions([]);
    }
  };

  const submitAdd = async () => {
    try {
      await api.post(endpoints.admin.createLicense(), addForm);
      enqueueSnackbar('License(s) created', { variant: 'success' });
      setAddDialogOpen(false);
      const licensesRes = await api.get(endpoints.admin.licenses());
      const licensesData = licensesRes.data?.data?.licenses ?? [];
      setLicenses(licensesData.map((l: any) => ({
        id: l.id,
        key: l.key,
        userId: l.userId,
        userEmail: l.user?.email ?? '',
        tier: l.tier,
        status: (l.status || '').toLowerCase(),
        activatedAt: l.activatedAt || l.createdAt,
        expiresAt: l.expiresAt || l.createdAt,
        lastUsed: l.updatedAt || l.createdAt,
      })));
    } catch (e: any) {
      enqueueSnackbar(e?.message || 'Failed to create license', { variant: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  type ChipColor = ChipProps['color'];

  const getRoleColor = (role: string): ChipColor => {
    switch (String(role || '').toUpperCase()) {
      case 'SUPERADMIN':
        return 'secondary';
      case 'ADMIN':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getTierColor = (tier?: string): ChipColor => {
    switch (String(tier || '').toUpperCase()) {
      case 'ENTERPRISE':
        return 'secondary';
      case 'PRO':
        return 'success';
      case 'BASIC':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTierVariant = (tier?: string): 'filled' | 'outlined' => {
    return String(tier || '').toUpperCase() === 'BASIC' ? 'outlined' : 'filled';
  };

  const getHealthColor = (health: AdminStats['systemHealth']) => {
    switch (health) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getHealthIcon = (health: AdminStats['systemHealth']) => {
    switch (health) {
      case 'healthy': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <WarningIcon />;
    }
  };

  return (
    <>
      <Navigation />
      <Box sx={{ pt: 8, pb: 4 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fadeInUp 0.6s ease-out forwards',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Admin Dashboard
              </Typography>
              <Chip
                icon={getHealthIcon(stats.systemHealth)}
                label={`System ${stats.systemHealth}`}
                color={getHealthColor(stats.systemHealth)}
                size="small"
              />
            </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Box
              sx={{
                opacity: 0,
                transform: 'translateY(20px)',
                animation: 'fadeInUp 0.6s ease-out 0.1s forwards',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PeopleIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.totalUsers.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Box
              sx={{
                opacity: 0,
                transform: 'translateY(20px)',
                animation: 'fadeInUp 0.6s ease-out 0.2s forwards',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <LicenseIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="h6" color="text.secondary">
                      Active Subscriptions
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stats.activeSubscriptions.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Box
              sx={{
                opacity: 0,
                transform: 'translateY(20px)',
                animation: 'fadeInUp 0.6s ease-out 0.3s forwards',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PaymentIcon sx={{ color: 'success.main' }} />
                    <Typography variant="h6" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Box
              sx={{
                opacity: 0,
                transform: 'translateY(20px)',
                animation: 'fadeInUp 0.6s ease-out 0.4s forwards',
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                  border: '1px solid rgba(255, 152, 0, 0.2)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <WarningIcon sx={{ color: 'warning.main' }} />
                    <Typography variant="h6" color="text.secondary">
                      Pending Approvals
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {stats.pendingApprovals}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Users" />
            <Tab label="Licenses" />
            <Tab label="Invoices" />
            <Tab label="System Health" />
          </Tabs>
        </Paper>

        {/* Users Tab */}
        {activeTab === 0 && (
          <Box
            sx={{
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fadeInUp 0.6s ease-out forwards',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {/* Global Search */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  placeholder="Search users by name, email, role, status, or subscription..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  size="small"
                  sx={{ minWidth: 400 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: usersSearch && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={clearUsersSearch}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {usersSearch && (
                  <Chip 
                    label={`${filteredUsers.length} of ${users.length} users found`}
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Button variant="contained" onClick={openAddDialog}>Add License</Button>
              </Box>

              {/* Advanced Filters - match Invoices layout */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Role"
                  select
                  size="small"
                  value={usersFilters.role || ''}
                  onChange={(e) => setUsersFilters((f) => ({ ...f, role: e.target.value || undefined }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="USER">USER</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="SUPERADMIN">SUPERADMIN</MenuItem>
                </TextField>
                <TextField
                  label="Status"
                  select
                  size="small"
                  value={usersFilters.status || ''}
                  onChange={(e) => setUsersFilters((f) => ({ ...f, status: e.target.value || undefined }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">ACTIVE</MenuItem>
                  <MenuItem value="suspended">SUSPENDED</MenuItem>
                </TextField>
                <TextField
                  label="Subscription Tier"
                  select
                  size="small"
                  value={usersFilters.tier || ''}
                  onChange={(e) => setUsersFilters((f) => ({ ...f, tier: (e.target.value || undefined) as any }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="BASIC">BASIC</MenuItem>
                  <MenuItem value="PRO">PRO</MenuItem>
                  <MenuItem value="ENTERPRISE">ENTERPRISE</MenuItem>
                </TextField>
                <Button variant="outlined">Apply Filters</Button>
                <Button onClick={() => setUsersFilters({})}>Clear</Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Subscription</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={getRoleColor(user.role)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            size="small"
                            color={getStatusColor(user.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {user.subscription && (
                            <Chip
                              label={user.subscription}
                              size="small"
                              color={getTierColor(user.subscription)}
                              variant={getTierVariant(user.subscription)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleUserEdit(user)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {usersSearch ? 'No users found matching your search criteria.' : 'No users available.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Licenses Tab */}
        {activeTab === 1 && (
          <Box
            sx={{
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fadeInUp 0.6s ease-out forwards',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <TextField
                placeholder="Search licenses by key, user email, tier, status, or dates..."
                value={licensesSearch}
                onChange={(e) => setLicensesSearch(e.target.value)}
                size="small"
                sx={{ minWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: licensesSearch && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={clearLicensesSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="Tier"
                  sx={{ minWidth: 140 }}
                  value={licensesFilters.tier || ''}
                  onChange={(e) => setLicensesFilters((f) => ({ ...f, tier: (e.target.value || undefined) as any }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="BASIC">BASIC</MenuItem>
                  <MenuItem value="PRO">PRO</MenuItem>
                  <MenuItem value="ENTERPRISE">ENTERPRISE</MenuItem>
                </TextField>
                <Chip
                  size="small"
                  label={showUsersWithNoLicenses ? 'Showing users with 0 licenses' : 'Hiding users with 0 licenses'}
                  onClick={() => setShowUsersWithNoLicenses((v) => !v)}
                  variant="outlined"
                />
                <TextField
                  select
                  size="small"
                  label="Status"
                  sx={{ minWidth: 160 }}
                  value={licensesFilters.status || ''}
                  onChange={(e) => setLicensesFilters((f) => ({ ...f, status: e.target.value || undefined }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                  <MenuItem value="EXPIRED">EXPIRED</MenuItem>
                  <MenuItem value="REVOKED">REVOKED</MenuItem>
                </TextField>
                <Button variant="outlined" onClick={() => fetchLicenses()}>Apply</Button>
                <Button
                  onClick={() => { setLicensesFilters({}); fetchLicenses().catch(() => {}); }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
            {/* Licenses Summary */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`${groupedLicenses.length} Users with Licenses`}
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={`${filteredLicenses.length} Total Licenses`}
                color="secondary"
                variant="outlined"
              />
              {licensesSearch && (
                <Chip 
                  label={`Search: ${licensesSearch}`}
                  color="info"
                  variant="outlined"
                  onDelete={clearLicensesSearch}
                />
              )}
            </Box>
            {/* Grouped Licenses View */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {groupedLicenses.length > 0 ? (
                groupedLicenses.map((group) => (
                  <Card key={group.userEmail} variant="outlined">
                    <CardContent sx={{ p: 0 }}>
                      {/* User Group Header */}
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: 'background.default',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onClick={() => toggleUserExpansion(group.userEmail)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PersonIcon color="primary" />
                            <Box>
                              <Typography variant="h6" component="div">
                                {group.userEmail}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip 
                                  size="small" 
                                  label={`${group.totalLicenses} Total Licenses`}
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip 
                                  size="small" 
                                  label={`${group.activeLicenses} Active`}
                                  color="success"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ExpandMoreIcon 
                              sx={{ 
                                transform: expandedUsers.has(group.userEmail) ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                              }} 
                            />
                          </Box>
                        </Box>
                      </Box>

                      {/* Collapsible Licenses Table */}
                      <Collapse in={expandedUsers.has(group.userEmail)}>
                        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>License Key</TableCell>
                                <TableCell>Tier</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Expires</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {group.licenses.map((license) => (
                                <TableRow key={license.id}>
                                  <TableCell>
                                    <Typography variant="body2" fontFamily="monospace">
                                      {license.key}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={license.tier}
                                      size="small"
                                      color={getTierColor(license.tier)}
                                      variant={getTierVariant(license.tier)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={license.status}
                                      size="small"
                                      color={getStatusColor(String(license.status).toLowerCase())}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {new Date(license.expiresAt).toLocaleDateString()}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleLicenseEdit()}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton size="small">
                                      <VisibilityIcon />
                                    </IconButton>
                                    <IconButton size="small">
                                      <DownloadIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Collapse>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    {licensesSearch ? 'No licenses found matching your search criteria.' : 'No licenses available.'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Invoices Tab */}
        {activeTab === 2 && (
          <Box
            sx={{
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fadeInUp 0.6s ease-out forwards',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {/* Global Search */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  placeholder="Search payments by ID, email, tier, status, amount, or date..."
                  value={paymentsSearch}
                  onChange={(e) => setPaymentsSearch(e.target.value)}
                  size="small"
                  sx={{ minWidth: 400 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: paymentsSearch && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={clearPaymentsSearch}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {paymentsSearch && (
                  <Chip 
                    label={`${filteredPayments.length} of ${payments.length} payments found`}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
              
              {/* Advanced Filters */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Filter by Email"
                  size="small"
                  value={paymentsFilters.email || ''}
                  onChange={(e) => setPaymentsFilters((f) => ({ ...f, email: e.target.value }))}
                />
                <TextField
                  label="From"
                  size="small"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={paymentsFilters.from || ''}
                  onChange={(e) => setPaymentsFilters((f) => ({ ...f, from: e.target.value }))}
                />
                <TextField
                  label="To"
                  size="small"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={paymentsFilters.to || ''}
                  onChange={(e) => setPaymentsFilters((f) => ({ ...f, to: e.target.value }))}
                />
                <TextField
                  label="Status"
                  select
                  size="small"
                  value={paymentsFilters.status || ''}
                  onChange={(e) => setPaymentsFilters((f) => ({ ...f, status: e.target.value || undefined }))}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="SUCCEEDED">SUCCEEDED</MenuItem>
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="FAILED">FAILED</MenuItem>
                  <MenuItem value="REFUNDED">REFUNDED</MenuItem>
                </TextField>
                <Button variant="outlined" onClick={() => fetchPayments(1)}>Apply Filters</Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Payment ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">{p.id}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{p.user?.email || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={p.subscription?.tier || '—'} 
                            color={getTierColor(p.subscription?.tier)} 
                            variant={getTierVariant(p.subscription?.tier)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatCurrency(p.amount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={p.status} color={p.status === 'SUCCEEDED' ? 'success' : p.status === 'FAILED' ? 'error' : 'default'} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{parseDate(p.createdAt).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell>
                          {p.stripeInvoiceId ? (
                            <Button size="small" variant="outlined" onClick={() => {
                              const token = localStorage.getItem('auth_token');
                              const url = `/api/invoices/${p.stripeInvoiceId}/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                              window.open(url, '_blank');
                            }}>View</Button>
                          ) : p.receiptUrl ? (
                            <Button size="small" variant="outlined" onClick={() => window.open(p.receiptUrl, '_blank')}>View</Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">N/A</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => openPaymentDetails(p.id)}>Open</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Box sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {paymentsSearch ? 'No payments found matching your search criteria.' : 'No payments available.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button disabled={paymentsPage <= 1} onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Chip label={`Page ${paymentsPage} of ${paymentsTotalPages}`} />
              <Button disabled={paymentsPage >= paymentsTotalPages} onClick={() => setPaymentsPage((p) => Math.min(paymentsTotalPages, p + 1))}>Next</Button>
            </Box>
          </Box>
        )}

        {/* System Health Tab */}
        {activeTab === 3 && (
          <Box
            sx={{
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'fadeInUp 0.6s ease-out forwards',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    System Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip
                      label={`Overall: ${(systemHealth?.overall || 'unknown').toUpperCase()}`}
                      color={(systemHealth?.overall === 'healthy' ? 'success' : systemHealth?.overall === 'degraded' ? 'warning' : systemHealth?.overall === 'unhealthy' ? 'error' : 'default') as any}
                    />
                    <Button size="small" onClick={refreshHealth} disabled={healthLoading}>
                      {healthLoading ? 'Refreshing…' : 'Refresh'}
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <SubsystemCard title="Database" data={systemHealth?.database} />
                    </Grid>
                    <Grid item xs={12}>
                      <SubsystemCard title="Email (SendGrid)" data={systemHealth?.email} />
                    </Grid>
                    <Grid item xs={12}>
                      <SubsystemCard title="Payments (Stripe)" data={systemHealth?.payment} />
                    </Grid>
                    <Grid item xs={12}>
                      <SubsystemCard title="Webhooks" data={systemHealth?.webhooks} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Activity
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Checked at: {systemHealth?.checkedAt ? new Date(systemHealth.checkedAt).toLocaleString() : '—'}
                    </Typography>
                    {systemHealth?.webhooks?.metrics ? (
                      <>
                        <Typography variant="body2">Recent webhooks (24h): {systemHealth.webhooks.metrics.recentWebhooks}</Typography>
                        <Typography variant="body2">Failed webhooks: {systemHealth.webhooks.metrics.failedWebhooks}</Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No metrics available</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* User Edit Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={selectedUser.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={selectedUser.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedUser.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedUser.role}
                    label="Role"
                    inputProps={{
                      'aria-label': 'Select user role',
                      title: 'Choose the user role'
                    }}
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedUser.status}
                    label="Status"
                    inputProps={{
                      'aria-label': 'Select user status',
                      title: 'Choose the user status'
                    }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUserSave} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {detailsData.payment ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`ID: ${detailsData.payment.id}`} />
                <Chip label={`User: ${detailsData.payment.user?.email || '—'}`} />
                <Chip label={`Amount: $${(detailsData.payment.amount / 100).toFixed(2)}`} />
                <Chip label={`Status: ${detailsData.payment.status}`} />
                <Chip label={`Date: ${new Date(detailsData.payment.createdAt).toLocaleString()}`} />
                {detailsData.payment.receiptUrl && (
                  <Button size="small" variant="outlined" onClick={() => window.open(detailsData.payment.receiptUrl, '_blank')}>View Invoice</Button>
                )}
              </Box>
              <Typography variant="subtitle2">Related Licenses</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>License Key</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Activated</TableCell>
                      <TableCell>Expires</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(detailsData.licenses || []).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">{l.key}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={l.status} color={getStatusColor(String(l.status).toLowerCase()) as any} />
                        </TableCell>
                        <TableCell>{l.activatedAt ? new Date(l.activatedAt).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No details.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* License Edit Dialog */}
      <Dialog
        open={licenseDialogOpen}
        onClose={() => setLicenseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit License</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            License management options will be available here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLicenseDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add License Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add License</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="User"
                value={addForm.userId}
                onChange={(e) => onUserSelect(e.target.value)}
              >
                {users.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.email}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select fullWidth label="Subscription"
                value={addForm.subscriptionId}
                onChange={(e) => setAddForm(prev => ({ ...prev, subscriptionId: e.target.value }))}
                disabled={!userSubscriptions.length}
              >
                {userSubscriptions.map((s: any) => (
                  <MenuItem key={s.id} value={s.id}>{s.tier} — seats {s.seats}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select fullWidth label="Tier"
                value={addForm.tier}
                onChange={(e) => setAddForm(prev => ({ ...prev, tier: e.target.value }))}
              >
                <MenuItem value="BASIC">BASIC</MenuItem>
                <MenuItem value="PRO">PRO</MenuItem>
                <MenuItem value="ENTERPRISE">ENTERPRISE</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth type="number" label="Seats" inputProps={{ min: 1, max: 1000 }}
                value={addForm.seats}
                onChange={(e) => setAddForm(prev => ({ ...prev, seats: Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)) }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitAdd} disabled={!addForm.userId || !addForm.subscriptionId}>Create</Button>
        </DialogActions>
      </Dialog>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default AdminDashboard;
