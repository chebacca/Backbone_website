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
  Movie,
  VideoLibrary,
  Edit,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SecurityNavigation from '../../pages/components/SecurityNavigation';
import ThemeToggle from '@/components/common/ThemeToggle';

const drawerWidth = 280;

interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  chip?: string;
}

// Standalone-specific navigation items for Call Sheet Pro and EDL Converter Pro
const standaloneNavigationItems: NavigationItem[] = [
  { text: 'Overview', icon: <Dashboard />, path: '/standalone' },
  { text: 'Call Sheet Pro', icon: <Movie />, path: '/standalone/callsheet-pro' },
  { text: 'EDL Converter Pro', icon: <VideoLibrary />, path: '/standalone/edl-converter-pro' },
  { text: 'My Licenses', icon: <CardMembership />, path: '/standalone/licenses' },
  { text: 'Settings', icon: <Settings />, path: '/standalone/settings' },
  { text: 'Support', icon: <Support />, path: '/standalone/support' },
];

export const StandaloneDashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is standalone user
  const isStandaloneUser = String(user?.userType || '').toUpperCase() === 'STANDALONE';

  // Redirect non-standalone users away from standalone routes
  useEffect(() => {
    if (!isStandaloneUser && location.pathname.startsWith('/standalone')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isStandaloneUser, location.pathname, navigate]);

  // Don't render layout for non-standalone users on standalone routes
  if (!isStandaloneUser && location.pathname.startsWith('/standalone')) {
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
      handleProfileMenuClose();
    }
  };

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
          Standalone License
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
            <Chip
              label="STANDALONE"
              size="small"
              color="primary"
              sx={{ mt: 0.5, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 1 }}>
        {standaloneNavigationItems.map((item) => {
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
      </List>

      {/* License Status Section */}
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
          License Status
        </Typography>
        <ListItem disablePadding>
          <ListItemButton
            component={RouterLink}
            to="/standalone/licenses"
            sx={{
              borderRadius: 2,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
              <CardMembership />
            </ListItemIcon>
            <ListItemText 
              primary="Call Sheet Pro & EDL Converter Pro"
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
            <Badge badgeContent={0} color="primary">
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
            <MenuItem component={RouterLink} to="/standalone/settings" onClick={handleProfileMenuClose}>
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

export default StandaloneDashboardLayout;
