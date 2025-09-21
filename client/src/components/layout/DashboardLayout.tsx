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
  Receipt,
  Store,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SecurityNavigation from '../../pages/components/SecurityNavigation';
import { RoleBasedAccessControl, NAVIGATION_ITEMS, UserRole } from '@/services/RoleBasedAccessControl';
import ThemeToggle from '@/components/common/ThemeToggle';
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
  { text: 'Licenses', icon: <CardMembership />, path: '/dashboard/licenses' },
  { text: 'Cloud Projects', icon: <Analytics />, path: '/dashboard/cloud-projects' },
  { text: 'Team Management', icon: <Group />, path: '/dashboard/team' },
  { text: 'Billing & Payments', icon: <Payment />, path: '/dashboard/billing' },
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

// Standalone-specific navigation items (for standalone users)
const standaloneNavigationItems: NavigationItem[] = [
  { text: 'Overview', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Licenses', icon: <CardMembership />, path: '/dashboard/licenses' },
  { text: 'Downloads', icon: <Download />, path: '/dashboard/downloads' },
  { text: 'Support', icon: <Support />, path: '/dashboard/support' },
  { text: 'Settings', icon: <Settings />, path: '/dashboard/settings' },
];

// Icon mapping function for RBAC navigation items
const getIconComponent = (iconName: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'Dashboard': <Dashboard />,
    'CardMembership': <CardMembership />,
    'Analytics': <Analytics />,
    'Group': <Group />,
    'Payment': <Payment />,
    'Receipt': <Receipt />,
    'Download': <Download />,
    'Business': <Business />,
    'Security': <Security />,
    'AccountBalance': <AccountBalance />,
    'AdminPanelSettings': <Security />,
    'Settings': <Settings />,
    'Support': <Support />,
    'Notifications': <Notifications />,
    'Store': <Store />
  };
  return iconMap[iconName] || <Dashboard />;
};

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is accounting user
  const isAccountingUser = String(user?.role || '').toUpperCase() === 'ACCOUNTING';
  
  // Check if user is standalone user
  const isStandaloneUser = String(user?.role || '').toUpperCase() === 'STANDALONE' || 
                          String(user?.subscription?.plan || '').toUpperCase() === 'STANDALONE' ||
                          user?.email?.includes('standalone');

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

  const handleLogout = async () => {
    try {
      await logout();
      handleProfileMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
      // Still close the menu even if logout fails
      handleProfileMenuClose();
    }
  };

  const isEnterprise = String(user?.subscription?.plan || '').toUpperCase() === 'ENTERPRISE';
  const roleUpper = String(user?.role || '').toUpperCase();
  const isEnterpriseAdminRole = roleUpper === 'ENTERPRISE_ADMIN';

  // Compute navigation items based on user role and permissions
  const navigationItems: NavigationItem[] = React.useMemo(() => {
    const inAccountingSection = location.pathname.startsWith('/accounting');
    const inAdminSection = location.pathname.startsWith('/admin');
    
    // Special sections use their own navigation
    if (inAccountingSection) return [...accountingNavigationItems];
    if (inAdminSection) return [...adminNavigationItems];
    
    // Standalone users get simplified navigation
    if (isStandaloneUser) {
      console.log('🔍 [DashboardLayout] Using standalone navigation for user:', user?.email);
      return [...standaloneNavigationItems];
    }

    // Use RBAC system to determine accessible navigation items
    const accessibleItems = RoleBasedAccessControl.getAccessibleNavigationItems(user);
    
    // Debug logging
    console.log('🔍 [DashboardLayout] User role:', user?.role);
    console.log('🔍 [DashboardLayout] Accessible items:', accessibleItems);
    console.log('🔍 [DashboardLayout] Team management item:', accessibleItems.find(item => item.id === 'team-management'));
    
    // Convert to the expected format
    return accessibleItems.map(item => ({
      text: item.text,
      icon: getIconComponent(item.icon),
      path: item.path,
      badge: undefined, // RBAC NavigationItem doesn't have badge property
      chip: undefined   // RBAC NavigationItem doesn't have chip property
    }));
  }, [location.pathname, user, isStandaloneUser]);

  const NavigationList = () => (
    <Box sx={{ width: drawerWidth, height: '100%', backgroundColor: 'background.paper' }}>
      {/* Logo and Brand (clickable to go to Landing Page) */}
      <Box component={RouterLink} to="/" aria-label="Go to Landing Page" sx={{ p: 3, display: 'block', textDecoration: 'none', color: 'inherit', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.04)', }, }} >
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
            <Box key={item.text} >
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
                <Box key={item.text} >
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

      {/* Support Center Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
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
          Support
        </Typography>
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
              primary="Support Center"
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontSize: '0.85rem',
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

          {/* Theme Toggle */}
          <ThemeToggle size="medium" sx={{ mr: 1 }} />

          {/* Security Navigation */}
          <SecurityNavigation />

          {/* Notification Icon */}
          <IconButton
            size="large"
            color="inherit"
            sx={{ mr: 1 }}
          >
            <Notifications />
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
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }} >
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
      <Box component="main" sx={{ flexGrow: 1, width: { lg: `calc(100% - ${drawerWidth}px)` }, backgroundColor: 'background.default', minHeight: '100vh', }} >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
