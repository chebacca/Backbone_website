import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface SecurityNavigationProps {
  onMenuClick?: () => void;
}

const SecurityNavigation: React.FC<SecurityNavigationProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'DEV_ADMIN' | 'ORG_ADMIN' | 'USER'>('USER');
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [securityAlerts, setSecurityAlerts] = useState(0);
  const [criticalAlerts, setCriticalAlerts] = useState(0);

  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!user) return;

      try {
        // 🔧 CRITICAL FIX: Handle standalone users first
        if (user.email === 'standalone.user@example.com') {
          console.log('SecurityNavigation - Standalone user detected, setting role to USER');
          setUserRole('USER');
          return;
        }
        
        // Check if user has getIdTokenResult method (Firebase Auth user)
        if (typeof user.getIdTokenResult === 'function') {
          const idTokenResult = await user.getIdTokenResult();
          const claims = idTokenResult.claims;
        
          // Check for DEV ADMIN role
          const isDevAdmin = 
            claims?.role === 'DEV_ADMIN' || 
            claims?.role === 'SuperAdmin' ||
            claims?.role === 'SUPERADMIN' ||
            claims?.isDevAdmin === true ||
            claims?.permissions?.includes('security:master_access') ||
            claims?.permissions?.includes('admin:master_security');

          // Check for ORG ADMIN role
          const isOrgAdmin = 
            claims?.role === 'ADMIN' || 
            claims?.role === 'ORG_ADMIN' ||
            claims?.role === 'SuperAdmin' ||
            claims?.role === 'SUPERADMIN' ||
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
        } else {
          // Fallback: Check user object properties directly
          const userRole = user.role || user.userRole || user.user_type;
          const isDevAdmin = 
            userRole === 'DEV_ADMIN' || 
            userRole === 'SuperAdmin' ||
            userRole === 'SUPERADMIN' ||
            user.isDevAdmin === true ||
            user.permissions?.includes('security:master_access') ||
            user.permissions?.includes('admin:master_security');

          const isOrgAdmin = 
            userRole === 'ADMIN' || 
            userRole === 'ORG_ADMIN' ||
            userRole === 'SuperAdmin' ||
            userRole === 'SUPERADMIN' ||
            user.isOrgAdmin === true ||
            user.permissions?.includes('admin:organization') ||
            user.permissions?.includes('admin:team_members');
          
          if (isDevAdmin) {
            setUserRole('DEV_ADMIN');
          } else if (isOrgAdmin) {
            setUserRole('ORG_ADMIN');
            setOrganizationId(user.organizationId);
          } else {
            setUserRole('USER');
          }
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
        // Get Firebase ID token for authentication
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          console.warn('No authenticated user found for security alerts');
          return;
        }

        const token = await user.getIdToken();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        if (userRole === 'DEV_ADMIN') {
          // DEV ADMIN: Get alerts from both platforms
          const [dashboardResponse, licensingResponse] = await Promise.all([
            fetch('/api/security/alerts?source=dashboard_app', { headers }).then(res => res.json()).catch(() => ({ success: false, data: [] })),
            fetch('/api/security/alerts?source=licensing_website', { headers }).then(res => res.json()).catch(() => ({ success: false, data: [] }))
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
          const response = await fetch(`/api/security/alerts?source=licensing_website&organizationId=${organizationId}`, { headers })
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

  const handleSecurityDashboard = () => {
    navigate('/dashboard/security');
  };

  // Don't render anything if user doesn't have security access
  if (userRole !== 'DEV_ADMIN' && userRole !== 'ORG_ADMIN') {
    return null;
  }
  return (
    <Tooltip title={userRole === 'DEV_ADMIN' ? 'Master Security Dashboard' : 'Organization Security Dashboard'}>
      <IconButton
        color="inherit"
        onClick={handleSecurityDashboard}
        sx={{ 
          mr: 1,
          backgroundColor: criticalAlerts > 0 ? 'error.dark' : 'transparent',
          '&:hover': {
            backgroundColor: criticalAlerts > 0 ? 'error.main' : 'rgba(255,255,255,0.1)'
          }
        }}
      >
        <Badge badgeContent={securityAlerts} color="error">
          <SecurityIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default SecurityNavigation;
