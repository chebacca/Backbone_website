import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MasterSecurityDashboard from '../services/security/MasterSecurityDashboard';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const SecurityDashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
      } finally {
        setPermissionLoading(false);
      }
    };

    checkUserPermissions();
  }, [user]);

  if (authLoading || permissionLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
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
    <>
      <Head>
        <title>Master Security Dashboard - Backbone Logic</title>
        <meta name="description" content="Cross-platform security monitoring and threat detection" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <MasterSecurityDashboard userRole={userRole} organizationId={organizationId} />
    </>
  );
};

export default SecurityDashboardPage;
