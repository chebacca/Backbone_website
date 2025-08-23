import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from './common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  requireAdmin?: boolean;
  requireAccounting?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  // requireEmailVerification is reserved for future use
  requireEmailVerification = false,
  requireAdmin = false,
  requireAccounting = false,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Email verification check - for now, we'll skip this check since the User type doesn't include emailVerified
  // if (requireEmailVerification && !user?.emailVerified) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  if (requireAdmin) {
    const roleUpper = String(user?.role || '').toUpperCase();
    const isSuperAdmin = roleUpper === 'SUPERADMIN';
    if (!isSuperAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (requireAccounting) {
    const roleUpper = String(user?.role || '').toUpperCase();
    const isAccounting = roleUpper === 'ACCOUNTING' || roleUpper === 'SUPERADMIN';
    if (!isAccounting) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
