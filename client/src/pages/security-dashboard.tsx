import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterSecurityDashboard from '../services/security/MasterSecurityDashboard';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { getAuth } from 'firebase/auth';

const SecurityDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authLoading = user?.loading || false;
  const [userRole, setUserRole] = useState<'DEV_ADMIN' | 'ORG_ADMIN' | 'USER'>('USER');
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [permissionLoading, setPermissionLoading] = useState(true);

  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!user) {
        setPermissionLoading(false);
        return;
      }

      try {
        // Get the actual Firebase Auth user
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        
        console.log('SecurityDashboard - Firebase Auth user:', firebaseUser);
        console.log('SecurityDashboard - Firebase Auth user email:', firebaseUser?.email);
        
        if (firebaseUser) {
          // Get custom claims from Firebase Auth
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const claims = idTokenResult.claims;
          
          console.log('SecurityDashboard - Firebase Auth claims:', claims);
          
          // Check for DEV ADMIN role
          const claimsData = claims as any;
          const isDevAdmin = 
            claimsData?.role === 'DEV_ADMIN' || 
            claimsData?.role === 'SuperAdmin' ||
            claimsData?.role === 'SUPERADMIN' ||
            claimsData?.isDevAdmin === true ||
            claimsData?.permissions?.includes('security:master_access') ||
            claimsData?.permissions?.includes('admin:master_security');

          // Check for ORG ADMIN role
          const isOrgAdmin = 
            claimsData?.role === 'ADMIN' || 
            claimsData?.role === 'ORG_ADMIN' ||
            claimsData?.role === 'SuperAdmin' ||
            claimsData?.role === 'SUPERADMIN' ||
            claimsData?.isOrgAdmin === true ||
            claimsData?.permissions?.includes('admin:organization') ||
            claimsData?.permissions?.includes('admin:team_members');

          console.log('SecurityDashboard - Firebase Auth isDevAdmin:', isDevAdmin);
          console.log('SecurityDashboard - Firebase Auth isOrgAdmin:', isOrgAdmin);
          
          if (isDevAdmin) {
            console.log('SecurityDashboard - Setting role to DEV_ADMIN (Firebase Auth)');
            setUserRole('DEV_ADMIN');
          } else if (isOrgAdmin) {
            console.log('SecurityDashboard - Setting role to ORG_ADMIN (Firebase Auth)');
            setUserRole('ORG_ADMIN');
            setOrganizationId(claimsData?.organizationId || user?.organizationId);
          } else {
            console.log('SecurityDashboard - Setting role to USER (Firebase Auth)');
            setUserRole('USER');
          }
        } else {
          // Fallback: Check user object properties directly
          console.log('SecurityDashboard - No Firebase Auth user, using fallback role detection');
          console.log('SecurityDashboard - User object:', user);
          console.log('SecurityDashboard - User properties:', Object.keys(user || {}));
          
          // Check if user has role property directly
          const userRole = user?.role || user?.userRole || user?.user_type;
          const isDevAdmin = 
            userRole === 'DEV_ADMIN' || 
            userRole === 'SuperAdmin' ||
            userRole === 'SUPERADMIN' ||
            user?.isDevAdmin === true ||
            user?.permissions?.includes('security:master_access') ||
            user?.permissions?.includes('admin:master_security');

          const isOrgAdmin = 
            userRole === 'ADMIN' || 
            userRole === 'ORG_ADMIN' ||
            userRole === 'SuperAdmin' ||
            userRole === 'SUPERADMIN' ||
            user?.isOrgAdmin === true ||
            user?.permissions?.includes('admin:organization') ||
            user?.permissions?.includes('admin:team_members');

          console.log('SecurityDashboard - Fallback isDevAdmin:', isDevAdmin);
          console.log('SecurityDashboard - Fallback isOrgAdmin:', isOrgAdmin);
          
          if (isDevAdmin) {
            console.log('SecurityDashboard - Setting role to DEV_ADMIN (fallback)');
            setUserRole('DEV_ADMIN');
          } else if (isOrgAdmin) {
            console.log('SecurityDashboard - Setting role to ORG_ADMIN (fallback)');
            setUserRole('ORG_ADMIN');
            setOrganizationId(user?.organizationId);
          } else {
            console.log('SecurityDashboard - Setting role to USER (fallback)');
            setUserRole('USER');
          }
        }

        // Don't redirect here - let the component render and handle the redirect
      } catch (error) {
        console.error('Error checking user permissions:', error);
        setUserRole('USER');
      } finally {
        setPermissionLoading(false);
      }
    };

    checkUserPermissions();
  }, [user]);

  // Redirect non-admin users after role is determined
  useEffect(() => {
    if (!permissionLoading && userRole === 'USER') {
      console.log('SecurityDashboard - Redirecting non-admin user to dashboard');
      navigate('/dashboard');
    }
  }, [userRole, permissionLoading, navigate]);

  if (authLoading || permissionLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading Security Dashboard...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Authentication Required</Typography>
          <Typography>
            You must be logged in to access the Security Dashboard.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <MasterSecurityDashboard userRole={userRole} organizationId={organizationId} />
  );
};

export default SecurityDashboardPage;
