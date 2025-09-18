/**
 * React Hook for Role-Based Access Control
 * Provides easy access to RBAC functionality in React components
 */

import { useAuth } from '@/context/AuthContext';
import { RoleBasedAccessControl, UserRole, Permission, NavigationItem } from '@/services/RoleBasedAccessControl';

export const useRBAC = () => {
  const { user } = useAuth();

  return {
    // User role information
    userRole: RoleBasedAccessControl.getUserRole(user),
    roleInfo: RoleBasedAccessControl.getUserRoleInfo(user),
    
    // Permission checks
    hasPermission: (permission: Permission) => RoleBasedAccessControl.hasPermission(user, permission),
    hasRole: (role: UserRole) => RoleBasedAccessControl.hasRole(user, role),
    hasMinimumRoleLevel: (minLevel: number) => RoleBasedAccessControl.hasMinimumRoleLevel(user, minLevel),
    
    // Role type checks
    isOrganizationOwner: () => RoleBasedAccessControl.isOrganizationOwner(user),
    isAdminOrHigher: () => RoleBasedAccessControl.isAdminOrHigher(user),
    isMemberOrHigher: () => RoleBasedAccessControl.isMemberOrHigher(user),
    
    // Navigation
    getAccessibleNavigationItems: () => RoleBasedAccessControl.getAccessibleNavigationItems(user),
    canAccessPage: (pageId: string) => RoleBasedAccessControl.canAccessPage(user, pageId),
    
    // User info
    user,
    isAuthenticated: !!user
  };
};

export default useRBAC;
