import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cloudProjectIntegration } from '@/services/CloudProjectIntegration';

/**
 * CloudProjectAuthBridge Component
 * 
 * This component bridges the AuthContext with the CloudProjectIntegration service
 * to ensure that the service has access to the current authentication token,
 * especially in webonly production mode where localStorage is disabled.
 */
export const CloudProjectAuthBridge: React.FC = () => {
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    // Set up the auth token callback for the CloudProjectIntegration service
    cloudProjectIntegration.setAuthTokenCallback(() => {
      return token;
    });

    // If we have a token, also set it directly (for immediate availability)
    if (token && isAuthenticated) {
      cloudProjectIntegration.setAuthToken(token);
    }
  }, [token, isAuthenticated]);

  // This component doesn't render anything, it just manages the connection
  return null;
};

export default CloudProjectAuthBridge;

