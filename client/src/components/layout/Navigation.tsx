import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard,
  ExitToApp,
  AdminPanelSettings,
  Settings,
  Receipt,
  VpnKey,
  Article,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navigationItems: NavigationItem[] = useMemo(() => {
    const items: NavigationItem[] = [
      { label: 'Features', path: '/#features' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Documentation', path: '/documentation', icon: <Article /> },
      { label: 'Support', path: '/support', icon: <Support /> },
    ];

    // Show Dashboard only when authenticated and NOT SUPERADMIN
    if (isAuthenticated && String(user?.role || '').toUpperCase() !== 'SUPERADMIN') {
      items.push({ label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> });
    }

    // Add Admin Dashboard to main navigation for SUPERADMIN users
    if (isAuthenticated && String(user?.role || '').toUpperCase() === 'SUPERADMIN') {
      items.push({ label: 'Admin', path: '/admin', icon: <AdminPanelSettings /> });
    }

    return items;
  }, [isAuthenticated, user]);

  const authenticatedNavItems = useMemo(() => {
    const roleUpper = String(user?.role || '').toUpperCase();
    const isSuperAdmin = roleUpper === 'SUPERADMIN';
    const items: NavigationItem[] = [
      { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
      { label: 'Licenses', path: '/dashboard/licenses', icon: <VpnKey /> },
      { label: 'Analytics', path: '/dashboard/analytics', icon: <Receipt /> },
      { label: 'Billing', path: '/dashboard/billing', icon: <Receipt /> },
      { label: 'Team', path: '/dashboard/team', icon: <Receipt /> },
      { label: 'Downloads', path: '/dashboard/downloads', icon: <Receipt /> },
      { label: 'Documentation', path: '/documentation', icon: <Article /> },
      { label: 'Support', path: '/support', icon: <Support /> },
      { label: 'Settings', path: '/dashboard/settings', icon: <Settings /> },
    ];

    // Hide Dashboard and Billing for SUPERADMIN
    if (isSuperAdmin) {
      return items.filter((item) => 
        item.path !== '/dashboard/billing' && 
        item.path !== '/dashboard'
      );
    }
    return items;
  }, [user?.role]);

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileDrawerOpen}
      onClose={handleDrawerToggle}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Menu</Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem 
            key={item.label}
            onClick={() => {
              if (item.path.startsWith('#')) return;
              // Check if route requires authentication (only admin routes, not dashboard or licenses)
              if (item.path.includes('/admin') && !isAuthenticated) {
                navigate('/login');
                handleDrawerToggle();
                return;
              }
              navigate(item.path);
              handleDrawerToggle();
            }}
            sx={{ cursor: 'pointer' }}
          >
            {item.icon && (
              <ListItemIcon sx={{ 
                color: item.label === 'Admin' ? 'warning.main' : 
                       item.label === 'Licenses' ? 'primary.main' : 
                       item.label === 'Dashboard' ? 'primary.main' : 'text.primary' 
              }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText 
              primary={item.label} 
              sx={{ 
                color: item.label === 'Admin' ? 'warning.main' : 
                       item.label === 'Licenses' ? 'primary.main' : 
                       item.label === 'Dashboard' ? 'primary.main' : 'inherit' 
              }}
            />
          </ListItem>
        ))}
        
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            {authenticatedNavItems.map((item) => (
              <ListItem
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  handleDrawerToggle();
                }}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon sx={{ color: 'text.primary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
        
        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem
              onClick={() => {
                navigate('/login');
                handleDrawerToggle();
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemText primary="Sign In" />
            </ListItem>
            
            <ListItem
              onClick={() => {
                navigate('/register');
                handleDrawerToggle();
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemText primary="Get Started" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#000',
                    fontSize: '1.2rem',
                  }}
                >
                  B
                </Typography>
              </Box>
              
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
            </Box>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => {
                      if (item.path.startsWith('#')) return;
                      // Check if route requires authentication (only admin routes, not dashboard or licenses)
                      if (item.path.includes('/admin') && !isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      navigate(item.path);
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      color: item.label === 'Admin' ? 'warning.main' : 
                             item.label === 'Licenses' ? 'primary.main' : 
                             item.label === 'Dashboard' ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        color: item.label === 'Admin' ? 'warning.light' : 
                               item.label === 'Licenses' ? 'primary.light' : 
                               item.label === 'Dashboard' ? 'primary.light' : 'primary.main',
                        backgroundColor: item.label === 'Admin' 
                          ? 'rgba(255, 152, 0, 0.1)' 
                          : item.label === 'Licenses' || item.label === 'Dashboard'
                          ? 'rgba(0, 212, 255, 0.1)'
                          : 'rgba(0, 212, 255, 0.1)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isAuthenticated ? (
                  <>
                    <IconButton
                      size="large"
                      onClick={handleMenuOpen}
                      color="inherit"
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: 'primary.main',
                          color: '#000',
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => navigate('/login')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Sign In
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={() => navigate('/register')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                        color: '#000',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            backgroundColor: 'background.elevated',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Signed in as
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />
        
        {authenticatedNavItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              navigate(item.path);
              handleMenuClose();
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {item.icon}
              {item.label}
            </Box>
          </MenuItem>
        ))}
        

        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'error.main' }}>
            <ExitToApp />
            Logout
          </Box>
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      {renderMobileDrawer()}
    </>
  );
};
