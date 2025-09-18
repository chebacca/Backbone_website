import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Badge,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

interface SecurityNavigationProps {
  onMenuClick?: () => void;
}

const SecurityNavigation: React.FC<SecurityNavigationProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userRole, setUserRole] = useState<'DEV_ADMIN' | 'ORG_ADMIN' | 'USER'>('USER');
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [securityAlerts, setSecurityAlerts] = useState(0);
  const [criticalAlerts, setCriticalAlerts] = useState(0);

  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!user) return;

      try {
        const idTokenResult = await user.getIdTokenResult();
        const claims = idTokenResult.claims;
        
        // Check for DEV ADMIN role
        const isDevAdmin = 
          claims?.role === 'DEV_ADMIN' || 
          claims?.role === 'SuperAdmin' ||
          claims?.isDevAdmin === true ||
          claims?.permissions?.includes('security:master_access') ||
          claims?.permissions?.includes('admin:master_security');

        // Check for ORG ADMIN role
        const isOrgAdmin = 
          claims?.role === 'ADMIN' || 
          claims?.role === 'ORG_ADMIN' ||
          claims?.isOrgAdmin === true ||
          claims?.permissions?.includes('admin:organization') ||
          claims?.permissions?.includes('admin:team_members');

        if (isDevAdmin) {
          setUserRole('DEV_ADMIN');
        } else if (isOrgAdmin) {
          setUserRole('ORG_ADMIN');
          setOrganizationId(claims?.organizationId || user.organizationId);
        } else {
          setUserRole('USER');
        }
      } catch (error) {
        console.error('Error checking user permissions:', error);
        setUserRole('USER');
      }
    };

    checkUserPermissions();
  }, [user]);

  useEffect(() => {
    // Load security alerts count based on user role
    const loadSecurityAlerts = async () => {
      try {
        if (userRole === 'DEV_ADMIN') {
          // DEV ADMIN: Get alerts from both platforms
          const [dashboardResponse, licensingResponse] = await Promise.all([
            fetch('/api/security/alerts?source=dashboard_app').then(res => res.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/security/alerts?source=licensing_website').then(res => res.json()).catch(() => ({ success: false, data: [] }))
          ]);

          const dashboardAlerts = dashboardResponse.success ? dashboardResponse.data : [];
          const licensingAlerts = licensingResponse.success ? licensingResponse.data : [];

          const allAlerts = [...dashboardAlerts, ...licensingAlerts];
          const activeAlerts = allAlerts.filter(alert => !alert.resolved);
          const critical = activeAlerts.filter(alert => alert.severity === 'critical');

          setSecurityAlerts(activeAlerts.length);
          setCriticalAlerts(critical.length);
        } else if (userRole === 'ORG_ADMIN' && organizationId) {
          // ORG ADMIN: Get alerts only for their organization
          const response = await fetch(`/api/security/alerts?source=licensing_website&organizationId=${organizationId}`)
            .then(res => res.json())
            .catch(() => ({ success: false, data: [] }));

          const orgAlerts = response.success ? response.data : [];
          const activeAlerts = orgAlerts.filter(alert => !alert.resolved);
          const critical = activeAlerts.filter(alert => alert.severity === 'critical');

          setSecurityAlerts(activeAlerts.length);
          setCriticalAlerts(critical.length);
        }
      } catch (error) {
        console.error('Error loading security alerts:', error);
      }
    };

    if (userRole === 'DEV_ADMIN' || userRole === 'ORG_ADMIN') {
      loadSecurityAlerts();
      
      // Refresh alerts every 30 seconds
      const interval = setInterval(loadSecurityAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole, organizationId]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleMenuClose();
  };

  const handleSecurityDashboard = () => {
    router.push('/security-dashboard');
    handleMenuClose();
  };

  const handleDashboard = () => {
    router.push('/dashboard');
    handleMenuClose();
  };

  const handleUsers = () => {
    router.push('/users');
    handleMenuClose();
  };

  const handleSettings = () => {
    router.push('/settings');
    handleMenuClose();
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Backbone Logic - Licensing Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Security Dashboard Button - For DEV ADMIN and ORG ADMIN */}
          {(userRole === 'DEV_ADMIN' || userRole === 'ORG_ADMIN') && (
            <Tooltip title={userRole === 'DEV_ADMIN' ? 'Master Security Dashboard' : 'Organization Security Dashboard'}>
              <Button
                color="inherit"
                startIcon={
                  <Badge badgeContent={securityAlerts} color="error">
                    <SecurityIcon />
                  </Badge>
                }
                onClick={handleSecurityDashboard}
                sx={{ 
                  mr: 1,
                  backgroundColor: criticalAlerts > 0 ? 'error.dark' : 'transparent',
                  '&:hover': {
                    backgroundColor: criticalAlerts > 0 ? 'error.main' : 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Security
                {criticalAlerts > 0 && (
                  <Chip
                    label={`${criticalAlerts} Critical`}
                    color="error"
                    size="small"
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </Button>
            </Tooltip>
          )}

          {/* Regular Navigation Buttons */}
          <Button color="inherit" startIcon={<DashboardIcon />} onClick={handleDashboard}>
            Dashboard
          </Button>

          <Button color="inherit" startIcon={<PeopleIcon />} onClick={handleUsers}>
            Users
          </Button>

          <Button color="inherit" startIcon={<SettingsIcon />} onClick={handleSettings}>
            Settings
          </Button>

          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <AccountCircleIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <SettingsIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SecurityNavigation;
