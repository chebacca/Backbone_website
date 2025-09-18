import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from './common/LoadingSpinner';
import { RoleBasedAccessControl, UserRole, Permission } from '@/services/RoleBasedAccessControl';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  requireAdmin?: boolean;
  requireAccounting?: boolean;
  requirePermission?: Permission;
  requireRole?: UserRole;
  requireMinimumRoleLevel?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  // requireEmailVerification is reserved for future use
  requireEmailVerification = false,
  requireAdmin = false,
  requireAccounting = false,
  requirePermission,
  requireRole,
  requireMinimumRoleLevel,
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

  // Legacy role checks (for backward compatibility)
  if (requireAdmin) {
    if (!RoleBasedAccessControl.isAdminOrHigher(user)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (requireAccounting) {
    if (!RoleBasedAccessControl.hasRole(user, UserRole.ACCOUNTING)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // New RBAC checks
  if (requirePermission && !RoleBasedAccessControl.hasPermission(user, requirePermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireRole && !RoleBasedAccessControl.hasRole(user, requireRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireMinimumRoleLevel && !RoleBasedAccessControl.hasMinimumRoleLevel(user, requireMinimumRoleLevel)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
