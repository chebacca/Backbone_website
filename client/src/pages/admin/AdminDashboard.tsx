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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Popover,
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
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { api, endpoints } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AdminDashboardService, { 
  AdminStats as ServiceAdminStats, 
  AdminUser as ServiceAdminUser, 
  AdminPayment as ServiceAdminPayment, 
  AdminLicense as ServiceAdminLicense, 
  SystemHealth as ServiceSystemHealth 
} from '@/services/AdminDashboardService';

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
  subscriptions?: any[];
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    systemHealth: 'healthy',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [usersFilters, setUsersFilters] = useState<{ role?: string; status?: string; tier?: string }>({});
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(1);
  const [paymentsFilters, setPaymentsFilters] = useState<{ status?: string; email?: string; from?: string; to?: string }>({});
  
  // State for managing expanded/collapsed folders
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<{ payment?: any; licenses?: any[] }>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userSeatDialogOpen, setUserSeatDialogOpen] = useState(false);
  const [userSeatSubscription, setUserSeatSubscription] = useState<{ id: string; tier: 'BASIC' | 'PRO' | 'ENTERPRISE'; seats: number } | null>(null);
  const [userSeatInput, setUserSeatInput] = useState<number>(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ userId: '', subscriptionId: '', tier: 'PRO', seats: 1 });
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  // Search state variables
  const [usersSearch, setUsersSearch] = useState('');
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [licensesSearch, setLicensesSearch] = useState('');
  const [licensesFilters, setLicensesFilters] = useState<{ tier?: string; status?: string }>({});

  // Popover state for per-user licenses view
  const [licensesAnchorEl, setLicensesAnchorEl] = useState<HTMLElement | null>(null);
  const [licensesPopoverUser, setLicensesPopoverUser] = useState<User | null>(null);
  const [userLicenses, setUserLicenses] = useState<License[]>([]);
  const [userLicensesLoading, setUserLicensesLoading] = useState<boolean>(false);
  const MAX_LICENSE_PAGES_TO_SCAN = 5; // fallback scan cap (5 x 100 = 500)

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

  // Filtered licenses - users with subscriptions
  const filteredLicenses = useMemo(() => {
    const searchTerm = licensesSearch.trim().toLowerCase();
    return users
      .filter((user) => user.subscription) // Only users with subscriptions
      .filter((user) => {
        if (!searchTerm) return true;
        return (
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          (user.subscription && user.subscription.toLowerCase().includes(searchTerm))
        );
      })
      .filter((user) => (licensesFilters.tier ? (user.subscription || '').toUpperCase() === licensesFilters.tier : true))
      .filter((user) => (licensesFilters.status ? user.status === licensesFilters.status : true));
  }, [users, licensesSearch, licensesFilters]);

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

  const formatCurrency = (amount: number | undefined | null): string => {
    const dollars = typeof amount === 'number' ? amount : 0;
    return `$${dollars.toFixed(2)}`;
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

  // Group payments by user for better organization
  const groupedPayments = useMemo(() => {
    if (!filteredPayments || filteredPayments.length === 0) return {};
    
    const groups: Record<string, ServiceAdminPayment[]> = {};
    
    filteredPayments.forEach(payment => {
      const userEmail = payment.user?.email || 'Unknown User';
      if (!groups[userEmail]) {
        groups[userEmail] = [];
      }
      groups[userEmail].push(payment);
    });
    
    // Sort each group by date (newest first)
    Object.keys(groups).forEach(userEmail => {
      groups[userEmail].sort((a, b) => {
        const dateA = new Date(a.createdAt?.seconds * 1000 || 0);
        const dateB = new Date(b.createdAt?.seconds * 1000 || 0);
        return dateB.getTime() - dateA.getTime();
      });
    });
    
    return groups;
  }, [filteredPayments]);

  // Group payments by user for folder-style display
  const groupedPaymentsForDisplay = useMemo(() => {
    if (!filteredPayments || filteredPayments.length === 0) return [];
    
    const groups: Array<{
      userEmail: string;
      userName: string;
      payments: ServiceAdminPayment[];
      totalAmount: number;
      paymentCount: number;
    }> = [];
    
    Object.entries(groupedPayments).forEach(([userEmail, userPayments]) => {
      const totalAmount = userPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const userName = userPayments[0]?.user?.name || userEmail;
      
      groups.push({
        userEmail,
        userName,
        payments: userPayments,
        totalAmount,
        paymentCount: userPayments.length
      });
    });
    
    // Sort groups by total amount (highest first)
    groups.sort((a, b) => b.totalAmount - a.totalAmount);
    
    return groups;
  }, [groupedPayments, filteredPayments]);

  // Clear search functions
  const clearUsersSearch = () => setUsersSearch('');
  const clearPaymentsSearch = () => setPaymentsSearch('');
  const clearLicensesSearch = () => setLicensesSearch('');
  
  // Folder expansion/collapse functions
  const toggleFolder = (userEmail: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userEmail)) {
        newSet.delete(userEmail);
      } else {
        newSet.add(userEmail);
      }
      return newSet;
    });
  };
  
  const expandAllFolders = () => {
    const allEmails = groupedPaymentsForDisplay.map(group => group.userEmail);
    setExpandedFolders(new Set(allEmails));
  };
  
  const collapseAllFolders = () => {
    setExpandedFolders(new Set());
  };

  const openUserLicensesPopover = async (event: React.MouseEvent<HTMLElement>, userRow: User) => {
    event.stopPropagation();
    event.preventDefault();
    setLicensesAnchorEl(event.currentTarget);
    setLicensesPopoverUser(userRow);
    setUserLicenses([]);
    setUserLicensesLoading(true);
    try {
      const result = await AdminDashboardService.getUserDetails(userRow.id);
      const allLicenses: License[] = result.licenses.map((l: ServiceAdminLicense) => ({
        id: l.id,
        key: l.key,
        userId: l.userId,
        userEmail: l.userEmail,
        tier: l.tier,
        status: (l.status === 'inactive' ? 'suspended' : l.status) as 'active' | 'suspended' | 'pending' | 'expired' | 'revoked',
        activatedAt: new Date(parseDate(l.activatedAt)).toISOString(),
        expiresAt: new Date(parseDate(l.expiresAt)).toISOString(),
        lastUsed: new Date(parseDate(l.lastUsed)).toISOString(),
      }));

      // Show all licenses (active first)
      const sorted = allLicenses.sort((a, b) => {
        const aActive = a.status === 'active' ? 0 : 1;
        const bActive = b.status === 'active' ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        return new Date(b.activatedAt).getTime() - new Date(a.activatedAt).getTime();
      });
      setUserLicenses(sorted);
    } catch (e: any) {
      console.error('Error loading user licenses:', e);
      enqueueSnackbar(e?.message || 'Failed to load licenses', { variant: 'error' });
      setUserLicenses([]);
    } finally {
      setUserLicensesLoading(false);
    }
  };

  const closeUserLicensesPopover = () => {
    setLicensesAnchorEl(null);
    setLicensesPopoverUser(null);
    setUserLicenses([]);
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Ensure only SUPERADMIN can see this data
        const roleUpper = String(user?.role || '').toUpperCase();
        if (roleUpper !== 'SUPERADMIN') {
          setUsers([]);
          setStats((s) => ({ ...s, systemHealth: 'warning' }));
          return;
        }

        // Use the new AdminDashboardService which handles webonly mode automatically
        const [usersResult, statsResult, healthResult] = await Promise.all([
          AdminDashboardService.getUsers(1, 100),
          AdminDashboardService.getDashboardStats(),
          AdminDashboardService.getSystemHealth(),
        ]);

        if (!isMounted) return;

        // Map service users to component format
        setUsers(usersResult.users.map((u: ServiceAdminUser) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          status: (u.status?.toLowerCase?.() || 'active') as 'active' | 'suspended' | 'pending',
          subscription: u.subscription,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt,
        })));

        // Map service stats to component format
        setStats({
          totalUsers: statsResult.totalUsers,
          activeSubscriptions: statsResult.activeSubscriptions,
          totalRevenue: statsResult.totalRevenue, // Already converted to dollars in service
          pendingApprovals: statsResult.pendingApprovals,
          systemHealth: statsResult.systemHealth === 'healthy' ? 'healthy' : 
                       statsResult.systemHealth === 'warning' ? 'warning' : 'error',
        });

        // Map service health to component format
        setSystemHealth({
          overall: healthResult.overall,
          checkedAt: healthResult.checkedAt,
          database: healthResult.database,
          email: healthResult.email,
          payment: healthResult.payment,
        });

        setRecentPayments(statsResult.recentPayments || []);
      } catch (error) {
        if (!isMounted) return;
        console.error('Admin Dashboard data loading error:', error);
        setUsers([]);
        setStats((s) => ({ ...s, systemHealth: 'error' }));
        setRecentPayments([]);
        setSystemHealth(null);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.role]);

  // Licenses are now shown inside the Users tab via popover

  const refreshHealth = async () => {
    try {
      setHealthLoading(true);
      const healthResult = await AdminDashboardService.getSystemHealth();
      setSystemHealth({
        overall: healthResult.overall,
        checkedAt: healthResult.checkedAt,
        database: healthResult.database,
        email: healthResult.email,
        payment: healthResult.payment,
      });
      setStats((s) => ({ 
        ...s, 
        systemHealth: healthResult.overall === 'healthy' ? 'healthy' : 
                     healthResult.overall === 'degraded' ? 'warning' : 'error' 
      }));
    } catch (error) {
      console.error('Error refreshing health:', error);
      setSystemHealth(null);
      setStats((s) => ({ ...s, systemHealth: 'error' }));
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchPayments = async (page = 1) => {
    try {
      const filters: any = {};
      if (paymentsFilters.status) filters.status = paymentsFilters.status;
      if (paymentsFilters.email) filters.email = paymentsFilters.email;
      if (paymentsFilters.from) filters.from = paymentsFilters.from;
      if (paymentsFilters.to) filters.to = paymentsFilters.to;

      const result = await AdminDashboardService.getPayments(page, 100, filters);
      setPayments(result.payments);
      setPaymentsPage(result.pagination?.page || page);
      setPaymentsTotalPages(result.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
  };

  useEffect(() => {
    const roleUpper = String(user?.role || '').toUpperCase();
    const isSuperAdmin = roleUpper === 'SUPERADMIN';
    if (!isSuperAdmin) return;
    if (activeTab !== 1) return;
    fetchPayments(paymentsPage).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, paymentsPage, paymentsFilters, user?.role]);

  const openPaymentDetails = async (paymentId: string) => {
    try {
      const result = await AdminDashboardService.getPaymentDetails(paymentId);
      setDetailsData({ payment: result.payment, licenses: result.licenses });
      setDetailsOpen(true);
    } catch (e) {
      console.error('Error loading payment details:', e);
      enqueueSnackbar('Failed to load payment details', { variant: 'error' });
    }
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleUserSave = async () => {
    try {
      if (!selectedUser) return;
      // Only role and status are allowed to be updated from this dialog
      await AdminDashboardService.updateUser(selectedUser.id, {
        role: selectedUser.role,
        status: selectedUser.status,
      });
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setUserDialogOpen(false);
      setSelectedUser(null);
      
      // Refresh the users list
      const usersResult = await AdminDashboardService.getUsers(1, 100);
      setUsers(usersResult.users.map((u: ServiceAdminUser) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        status: (u.status?.toLowerCase?.() || 'active') as 'active' | 'suspended' | 'pending',
        subscription: u.subscription,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      })));
    } catch (e: any) {
      console.error('Error updating user:', e);
      enqueueSnackbar(e?.message || 'Failed to update user', { variant: 'error' });
    }
  };

  const openUserSeatDialog = async (user: User) => {
    try {
      const result = await AdminDashboardService.getUserDetails(user.id);
      const subs = result.subscriptions || [];
      const active = subs.find(s => s.status === 'ACTIVE' && (String(s.tier).toUpperCase() === 'PRO' || String(s.tier).toUpperCase() === 'ENTERPRISE'));
      if (!active) {
        enqueueSnackbar('No active PRO/ENTERPRISE subscription for this user', { variant: 'warning' });
        return;
      }
      setUserSeatSubscription({ id: active.id, tier: String(active.tier).toUpperCase() as any, seats: Number(active.seats || 0) });
      setUserSeatInput(Number(active.seats || 0));
      setUserSeatDialogOpen(true);
    } catch (e: any) {
      console.error('Error loading subscription:', e);
      enqueueSnackbar(e?.message || 'Failed to load subscription', { variant: 'error' });
    }
  };

  const saveUserSeatDialog = async () => {
    if (!userSeatSubscription) return;
    try {
      const tier = userSeatSubscription.tier;
      const requested = Number(userSeatInput || 0);
      if (tier === 'BASIC' && requested !== 1) {
        enqueueSnackbar('Basic plan supports exactly 1 seat.', { variant: 'warning' });
        return;
      }
      if (tier === 'PRO' && (requested < 1 || requested > 50)) {
        enqueueSnackbar('Pro plan seats must be between 1 and 50.', { variant: 'warning' });
        return;
      }
      if (tier === 'ENTERPRISE' && requested < 10) {
        enqueueSnackbar('Enterprise requires minimum 10 seats.', { variant: 'warning' });
        return;
      }
      await api.put(endpoints.subscriptions.update(userSeatSubscription.id), { seats: requested });
      setUserSeatSubscription({ ...userSeatSubscription, seats: requested });
      enqueueSnackbar('Seats updated successfully', { variant: 'success' });
      setUserSeatDialogOpen(false);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to update seats', { variant: 'error' });
    }
  };

  // License edit is not part of the consolidated UX

  const openAddDialog = async () => {
    setAddDialogOpen(true);
  };

  const onUserSelect = async (uid: string) => {
    setAddForm(prev => ({ ...prev, userId: uid, subscriptionId: '' }));
    if (uid) {
      try {
        const result = await AdminDashboardService.getUserDetails(uid);
        const subs = result.subscriptions || [];
        setUserSubscriptions(subs.filter((s: any) => s.status === 'ACTIVE'));
      } catch (error) {
        console.error('Error loading user subscriptions:', error);
        setUserSubscriptions([]);
      }
    } else {
      setUserSubscriptions([]);
    }
  };

  const submitAdd = async () => {
    try {
      await api.post(endpoints.admin.createLicense(), addForm);
      enqueueSnackbar('License(s) created', { variant: 'success' });
      setAddDialogOpen(false);
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

  // Sync tabs with URL hash for left nav integration
  useEffect(() => {
    const hash = (location.hash || '').toLowerCase();
    const map: Record<string, number> = {
      '#users': 0,
      '#licenses': 1,
      '#invoices': 2,
      '#system': 3,
      '#system-health': 3,
    };
    if (hash && map[hash] != null && map[hash] !== activeTab) {
      setActiveTab(map[hash]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
    const reverseMap: Record<number, string> = {
      0: 'users',
      1: 'licenses',
      2: 'invoices',
      3: 'system',
    };
    const next = reverseMap[newValue] || 'users';
    if ((location.hash || '').toLowerCase() !== `#${next}`) {
      navigate(`/admin#${next}`, { replace: true });
    }
  };

  return (
    <>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out forwards', '@keyframes fadeInUp': { '0%': { opacity: 0, transform: 'translateY(20px)', }, '100%': { opacity: 1, transform: 'translateY(0)', }, }, }} >
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
            <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out 0.1s forwards', }} >
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
            <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out 0.2s forwards', }} >
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
            <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out 0.3s forwards', }} >
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
            <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out 0.4s forwards', }} >
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
            onChange={handleTabChange}
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
          <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out forwards', }} >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {/* Search and Actions Bar - Full Width */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  placeholder="Search users by name, email, role, status, or subscription..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, maxWidth: 600 }}
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

              {/* Advanced Filters - Full Width Layout */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label="Role"
                  select
                  size="small"
                  value={usersFilters.role || ''}
                  onChange={(e) => setUsersFilters((f) => ({ ...f, role: e.target.value || undefined }))}
                  sx={{ minWidth: 120 }}
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
                  sx={{ minWidth: 120 }}
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
                  sx={{ minWidth: 140 }}
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
                      <IconButton size="small" onClick={(e) => openUserLicensesPopover(e, user)} title="View user licenses">
                        <LicenseIcon />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); openUserSeatDialog(user); }} title="Manage seats">
                            <PaymentIcon />
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
          <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out forwards', }} >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {/* Search and Actions Bar - Full Width */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  placeholder="Search licenses by user, tier, status, or subscription..."
                  value={licensesSearch}
                  onChange={(e) => setLicensesSearch(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, maxWidth: 600 }}
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
                {licensesSearch && (
                  <Chip 
                    label={`${filteredLicenses.length} of ${users.filter(u => u.subscription).length} licenses found`}
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Button variant="contained" onClick={openAddDialog}>Add License</Button>
              </Box>

              {/* Advanced Filters - Full Width Layout */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label="Subscription Tier"
                  select
                  size="small"
                  value={licensesFilters.tier || ''}
                  onChange={(e) => setLicensesFilters((f) => ({ ...f, tier: e.target.value || undefined }))}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="BASIC">BASIC</MenuItem>
                  <MenuItem value="PRO">PRO</MenuItem>
                  <MenuItem value="ENTERPRISE">ENTERPRISE</MenuItem>
                </TextField>
                <TextField
                  label="Status"
                  select
                  size="small"
                  value={licensesFilters.status || ''}
                  onChange={(e) => setLicensesFilters((f) => ({ ...f, status: e.target.value || undefined }))}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">ACTIVE</MenuItem>
                  <MenuItem value="expired">EXPIRED</MenuItem>
                  <MenuItem value="suspended">SUSPENDED</MenuItem>
                  <MenuItem value="pending">PENDING</MenuItem>
                </TextField>
                <Button variant="outlined">Apply Filters</Button>
                <Button onClick={() => setLicensesFilters({})}>Clear</Button>
              </Box>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Subscription Tier</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Seats</TableCell>
                    <TableCell>Activated</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLicenses.length > 0 ? (
                    filteredLicenses.map((user) => (
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
                            label={user.subscription}
                            size="small"
                            color={getTierColor(user.subscription)}
                            variant={getTierVariant(user.subscription)}
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
                          <Typography variant="body2">
                            {/* Placeholder for seats - can be enhanced later */}
                            -
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {/* Placeholder for expiration - can be enhanced later */}
                            -
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleUserEdit(user)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => openUserLicensesPopover(e, user)} title="View user licenses">
                            <LicenseIcon />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); openUserSeatDialog(user); }} title="Manage seats">
                            <PaymentIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {licensesSearch ? 'No licenses found matching your search criteria.' : 'No users with subscriptions found.'}
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

        {/* Licenses tab removed; licenses are accessible from Users tab via popover */}

        {/* Invoices Tab */}
        {activeTab === 2 && (
          <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out forwards', }} >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {/* Search and Actions Bar - Full Width */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  placeholder="Search payments by ID, email, tier, status, amount, or date..."
                  value={paymentsSearch}
                  onChange={(e) => setPaymentsSearch(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, maxWidth: 600 }}
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
              
              {/* Advanced Filters - Full Width Layout */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
            {/* Folder-style grouping with collapsible sections */}
            <Box sx={{ mt: 2 }}>
              {/* Folder Controls */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={expandAllFolders}
                  startIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'medium',
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Expand All
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={collapseAllFolders}
                  startIcon={<ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} />}
                  sx={{
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    fontWeight: 'medium',
                    borderRadius: '8px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      borderColor: 'primary.main',
                      color: 'primary.contrastText',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Collapse All
                </Button>
              </Box>
              
              {/* Folders */}
              {groupedPaymentsForDisplay.length > 0 ? (
                groupedPaymentsForDisplay.map((group) => (
                  <Paper 
                    key={group.userEmail} 
                    sx={{ 
                      mb: 3, 
                      border: '1px solid',
                      borderColor: 'primary.main',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {/* Folder Header - Always Visible */}
                    <Box 
                      sx={{ 
                        p: 2, 
                        background: 'linear-gradient(135deg, primary.main 0%, primary.dark 100%)',
                        color: 'primary.contrastText',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': { 
                          background: 'linear-gradient(135deg, primary.dark 0%, primary.main 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: '8px 8px 0 0'
                      }}
                      onClick={() => toggleFolder(group.userEmail)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FolderIcon 
                          sx={{ 
                            fontSize: '1.8rem', 
                            color: '#ffffff',
                            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))'
                          }} 
                        />
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          sx={{ 
                            color: '#ffffff',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            letterSpacing: '0.02em'
                          }}
                        >
                          {group.userName}
                        </Typography>
                        <Chip 
                          label={`${group.paymentCount} payments`} 
                          color="secondary" 
                          variant="filled"
                          sx={{ 
                            color: '#ffffff', 
                            fontWeight: 'medium',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                        />
                        <Typography 
                          variant="body1" 
                          fontWeight="bold"
                          sx={{ 
                            color: '#ffffff',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: '4px',
                            px: 1.5,
                            py: 0.5
                          }}
                        >
                          Total: {formatCurrency(group.totalAmount)}
                        </Typography>
                      </Box>
                      <ExpandMoreIcon 
                        sx={{ 
                          transform: expandedFolders.has(group.userEmail) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                          color: '#ffffff',
                          fontSize: '1.8rem',
                          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
                          '&:hover': {
                            transform: expandedFolders.has(group.userEmail) 
                              ? 'rotate(180deg) scale(1.1)' 
                              : 'rotate(0deg) scale(1.1)',
                            filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.3))'
                          }
                        }} 
                      />
                    </Box>
                    
                    {/* Collapsible Payment Details */}
                    <Collapse in={expandedFolders.has(group.userEmail)}>
                      <TableContainer 
                        sx={{
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          borderRadius: '0 0 8px 8px',
                          overflow: 'hidden'
                        }}
                      >
                        <Table 
                          size="small"
                          sx={{
                            '& .MuiTableCell-root': {
                              borderColor: 'divider'
                            }
                          }}
                        >
                          <TableHead>
                            <TableRow 
                              sx={{ 
                                backgroundColor: 'primary.light',
                                '& .MuiTableCell-head': {
                                  color: 'primary.contrastText',
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem'
                                }
                              }}
                            >
                              <TableCell>Payment ID</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>User</TableCell>
                              <TableCell>Tier</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Details</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.payments.map((payment) => (
                              <TableRow 
                                key={payment.id} 
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'action.hover',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    transition: 'all 0.2s ease-in-out'
                                  },
                                  transition: 'all 0.2s ease-in-out',
                                  cursor: 'pointer'
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body2" fontFamily="monospace">{payment.id}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    size="small" 
                                    label="Payment" 
                                    color="success" 
                                    variant="outlined"
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{payment.user?.email || '—'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    size="small" 
                                    label={payment.subscription?.tier || '—'} 
                                    color={getTierColor(payment.subscription?.tier)} 
                                    variant={getTierVariant(payment.subscription?.tier)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{formatCurrency(payment.amount)}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip size="small" label={payment.status} color={payment.status === 'succeeded' ? 'success' : payment.status === 'FAILED' ? 'error' : 'default'} />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {payment.createdAt?.seconds ? new Date(payment.createdAt.seconds * 1000).toLocaleDateString() : '—'}
                                  </Typography>
                                </TableCell>

                                                                <TableCell>
                                  <Button 
                                    size="small" 
                                    variant="contained" 
                                    onClick={() => openPaymentDetails(payment.id)}
                                    sx={{
                                      backgroundColor: 'primary.main',
                                      color: 'primary.contrastText',
                                      '&:hover': {
                                        backgroundColor: 'primary.dark',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                      },
                                      '&:active': {
                                        transform: 'translateY(0px)',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                      },
                                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                      fontWeight: 'medium',
                                      textTransform: 'none',
                                      borderRadius: '8px',
                                      px: 2
                                    }}
                                  >
                                    Open
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Collapse>
                  </Paper>
                ))
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No payments available.
                  </Typography>
                </Paper>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button disabled={paymentsPage <= 1} onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Chip label={`Page ${paymentsPage} of ${paymentsTotalPages}`} />
              <Button disabled={paymentsPage >= paymentsTotalPages} onClick={() => setPaymentsPage((p) => Math.min(paymentsTotalPages, p + 1))}>Next</Button>
            </Box>
          </Box>
        )}

        {/* System Health Tab */}
        {activeTab === 3 && (
          <Box sx={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.6s ease-out forwards', }} >
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
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={selectedUser.lastName}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedUser.email}
                  disabled
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
                    onChange={(e) => setSelectedUser(u => (u ? { ...u, role: String(e.target.value) } : u))}
                  >
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    {/* SUPERADMIN not selectable via UI to prevent accidental elevation */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Role is enforced by active subscription tier: BASIC → User; PRO/ENTERPRISE → Admin. Elevation to SuperAdmin is not allowed via UI.
                </Typography>
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
                    onChange={(e) => setSelectedUser(u => (u ? { ...u, status: String(e.target.value) as any } : u))}
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
          {selectedUser && (
            <Button onClick={() => openUserSeatDialog(selectedUser)}>
              Manage Seats
            </Button>
          )}
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

      {/* User Licenses Popover */}
      <Popover
        open={Boolean(licensesAnchorEl)}
        anchorEl={licensesAnchorEl}
        onClose={closeUserLicensesPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { p: 2, maxWidth: 560 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LicenseIcon fontSize="small" color="action" />
          <Typography variant="subtitle1">{licensesPopoverUser?.email || 'Licenses'}</Typography>
        </Box>
        {userLicensesLoading ? (
          <Typography variant="body2" color="text.secondary">Loading...</Typography>
        ) : userLicenses.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>License Key</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expires</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userLicenses.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">{l.key}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={l.tier} color={getTierColor(l.tier)} variant={getTierVariant(l.tier)} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={l.status} color={getStatusColor(l.status)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{new Date(l.expiresAt).toLocaleDateString()}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">No licenses found for this user.</Typography>
        )}
      </Popover>

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

      {/* User Subscription Seats Dialog */}
      <Dialog
        open={userSeatDialogOpen}
        onClose={() => setUserSeatDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Manage Seats</DialogTitle>
        <DialogContent>
          {userSeatSubscription ? (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Alert severity="info">{userSeatSubscription.tier} subscription</Alert>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Seats"
                  value={userSeatInput}
                  onChange={(e) => setUserSeatInput(parseInt(e.target.value || '0', 10))}
                  inputProps={{ min: 1, max: userSeatSubscription.tier === 'PRO' ? 50 : 1000 }}
                />
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">No active subscription found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserSeatDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveUserSeatDialog} variant="contained" disabled={!userSeatSubscription}>Save</Button>
        </DialogActions>
      </Dialog>
      </Box>
    </>
  );
};

export default AdminDashboard;
