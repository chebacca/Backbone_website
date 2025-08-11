import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Alert } from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  CardMembership,
  Analytics,
  Payment,
  Settings,
  AccountCircle,
  Logout,
  Notifications,
  Support,
  Download,
  Group,
  Business,
  Security,
  Description,
  Home,
  ArrowBack,
  AccountBalance,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility

const drawerWidth = 280;

interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  chip?: string;
}

const baseNavigationItems: NavigationItem[] = [
  { text: 'Overview', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Cloud Projects', icon: <Analytics />, path: '/dashboard/cloud-projects' },
  { text: 'Licenses', icon: <CardMembership />, path: '/dashboard/licenses', badge: 3 },
  { text: 'Usage Analytics', icon: <Analytics />, path: '/dashboard/analytics' },
  { text: 'Billing & Payments', icon: <Payment />, path: '/dashboard/billing' },
  { text: 'Team Management', icon: <Group />, path: '/dashboard/team' },
  { text: 'Downloads', icon: <Download />, path: '/dashboard/downloads', chip: 'SDK' },
  { text: 'Documentation', icon: <Description />, path: '/dashboard/documentation' },
  { text: 'Support', icon: <Support />, path: '/dashboard/support' },
  { text: 'Settings', icon: <Settings />, path: '/dashboard/settings' },
];

const enterpriseItems: NavigationItem[] = [
  { text: 'Organization', icon: <Business />, path: '/dashboard/organization' },
  { text: 'Security Center', icon: <Security />, path: '/dashboard/security' },
  { text: 'Compliance', icon: <Security />, path: '/dashboard/compliance' },
];

// Accounting-specific navigation items (mirror Accounting tabs via hashes)
const accountingNavigationItems: NavigationItem[] = [
  { text: 'Overview', icon: <Dashboard />, path: '/accounting#overview' },
  { text: 'Payments', icon: <Payment />, path: '/accounting#payments' },
  { text: 'Tax', icon: <Analytics />, path: '/accounting#tax' },
  { text: 'Filings', icon: <AccountBalance />, path: '/accounting#filings' },
  { text: 'KYC', icon: <Security />, path: '/accounting#kyc' },
  { text: 'Compliance', icon: <Security />, path: '/accounting#compliance' },
  { text: 'Terms', icon: <Description />, path: '/accounting#terms' },
];

// Admin-specific navigation items (mirror Admin tabs via hashes)
const adminNavigationItems: NavigationItem[] = [
  { text: 'Users', icon: <Group />, path: '/admin#users' },
  { text: 'Licenses', icon: <CardMembership />, path: '/admin#licenses' },
  { text: 'Invoices', icon: <Payment />, path: '/admin#invoices' },
  { text: 'System Health', icon: <Security />, path: '/admin#system' },
];

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dismissedKycBanner, setDismissedKycBanner] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dismiss_kyc_banner') === '1';
    } catch {
      return false;
    }
  });

  // Check if user is accounting user
  const isAccountingUser = String(user?.role || '').toUpperCase() === 'ACCOUNTING';

  // Redirect accounting users to accounting dashboard
  useEffect(() => {
    if (isAccountingUser && location.pathname.startsWith('/dashboard')) {
      navigate('/accounting', { replace: true });
    }
  }, [isAccountingUser, location.pathname, navigate]);

  // Allow accounting users to render the layout when on /accounting routes.
  // We still redirect them away from /dashboard to /accounting above.
  if (isAccountingUser && !location.pathname.startsWith('/accounting')) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const isEnterprise = String(user?.subscription?.plan || '').toUpperCase() === 'ENTERPRISE';
  const roleUpper = String(user?.role || '').toUpperCase();
  const isEnterpriseAdminRole = roleUpper === 'ENTERPRISE_ADMIN';
  const kycStatus = String((user as any)?.kycStatus || '').toUpperCase();
  const needsKyc = kycStatus !== 'COMPLETED';
  const showKycBanner = needsKyc && !dismissedKycBanner;

  // Compute navigation items based on current section (dashboard vs accounting)
  // and hide Billing for SUPERADMIN only on the user dashboard.
  const navigationItems: NavigationItem[] = React.useMemo(() => {
    const inAccountingSection = location.pathname.startsWith('/accounting');
    const inAdminSection = location.pathname.startsWith('/admin');
    if (inAccountingSection) return [...accountingNavigationItems];
    if (inAdminSection) return [...adminNavigationItems];

    const items = [...baseNavigationItems];
    const roleUpper = String(user?.role || '').toUpperCase();
    const isSuperAdmin = roleUpper === 'SUPERADMIN';
    if (isSuperAdmin) {
      return items.filter((item) => item.path !== '/dashboard/billing');
    }
    return items;
  }, [location.pathname, user?.role]);

  const NavigationList = () => (
    <Box sx={{ width: drawerWidth, height: '100%', backgroundColor: 'background.paper' }}>
      {/* Logo and Brand (clickable to go to Landing Page) */}
      <Box
        component={RouterLink}
        to="/"
        aria-label="Go to Landing Page"
        sx={{
          p: 3,
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          BackboneLogic, Inc.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          License Management
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
              {user?.name || user?.email || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
            {user?.subscription && (
              <Chip
                label={String(user.subscription.plan).toUpperCase()}
                size="small"
                color={String(user.subscription.plan).toUpperCase() === 'ENTERPRISE' ? 'primary' : 'default'}
                sx={{ mt: 0.5, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 1 }}>
        {navigationItems.map((item) => {
          const [itemBasePath, itemHash] = String(item.path || '').split('#');
          const isHashLink = Boolean(itemHash);
          const isActive = isHashLink
            ? (location.pathname === itemBasePath && location.hash === `#${itemHash}`)
            : (location.pathname === item.path);
          return (
            <Box
              key={item.text}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    backgroundColor: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isActive 
                        ? 'rgba(0, 212, 255, 0.15)' 
                        : 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="primary">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.95rem',
                      } 
                    }}
                  />
                  {item.chip && (
                    <Chip
                      label={item.chip}
                      size="small"
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 20,
                        backgroundColor: 'rgba(0, 212, 255, 0.2)',
                        color: 'primary.main',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Box>
          );
        })}

        {/* Enterprise Section (only for Enterprise plan + Enterprise Admin role) */}
        {isEnterprise && isEnterpriseAdminRole && (
          <>
            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                px: 2, 
                py: 1, 
                display: 'block', 
                fontWeight: 600, 
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Enterprise
            </Typography>
            {enterpriseItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Box
                  key={item.text}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={RouterLink}
                      to={item.path}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        backgroundColor: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                        color: isActive ? 'primary.main' : 'text.primary',
                        '&:hover': {
                          backgroundColor: isActive 
                            ? 'rgba(0, 212, 255, 0.15)' 
                            : 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontWeight: isActive ? 600 : 400,
                            fontSize: '0.95rem',
                          } 
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Box>
              );
            })}
          </>
        )}
      </List>

      {/* Support Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <ListItem disablePadding>
          <ListItemButton
            component={RouterLink}
            to="/dashboard/support"
            sx={{
              borderRadius: 2,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
              <Support />
            </ListItemIcon>
            <ListItemText 
              primary="Help & Support"
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontSize: '0.95rem',
                  color: 'text.secondary',
                } 
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Contextual Back */}
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="Back"
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBack />}
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              sx={{
                mr: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'text.primary',
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                },
              }}
            >
              Back
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Notification Icon */}
          <IconButton
            size="large"
            color="inherit"
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={needsKyc ? 1 : 0} color="primary">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mt: 1,
              },
            }}
          >
            <MenuItem component={RouterLink} to="/dashboard/settings" onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
              border: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <NavigationList />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
              border: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
          open
        >
          <NavigationList />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {showKycBanner && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate('/dashboard/settings#compliance')}
                    sx={{ color: '#000' }}
                  >
                    Complete KYC
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      try { localStorage.setItem('dismiss_kyc_banner', '1'); } catch {}
                      setDismissedKycBanner(true);
                    }}
                  >
                    Dismiss
                  </Button>
                </Box>
              }
            >
              Your account requires identity verification (KYC). Complete it in Settings to unlock all features.
            </Alert>
          )}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
