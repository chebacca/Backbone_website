/**
 * Role-Based Access Control (RBAC) System
 * Defines user roles, permissions, and navigation access for the licensing website
 */

export enum UserRole {
  // Organization Management
  ORGANIZATION_OWNER = 'ORGANIZATION_OWNER',
  ADMIN = 'ADMIN',
  ORG_ADMIN = 'ORG_ADMIN', // Alias for ADMIN
  MEMBER = 'MEMBER',
  ACCOUNTING = 'ACCOUNTING',
  
  // Legacy roles for backward compatibility
  SUPERADMIN = 'SUPERADMIN',
  USER = 'USER',
  ENTERPRISE_ADMIN = 'ENTERPRISE_ADMIN'
}

export enum Permission {
  // Dashboard Access
  VIEW_OVERVIEW = 'view:overview',
  VIEW_LICENSES = 'view:licenses',
  VIEW_CLOUD_PROJECTS = 'view:cloud_projects',
  VIEW_TEAM_MANAGEMENT = 'view:team_management',
  VIEW_BILLING = 'view:billing',
  VIEW_ANALYTICS = 'view:analytics',
  VIEW_DOWNLOADS = 'view:downloads',
  VIEW_SETTINGS = 'view:settings',
  
  // Organization Management
  MANAGE_ORGANIZATION = 'manage:organization',
  MANAGE_TEAM_MEMBERS = 'manage:team_members',
  MANAGE_LICENSES = 'manage:licenses',
  MANAGE_BILLING = 'manage:billing',
  
  // User Management
  CREATE_USERS = 'create:users',
  EDIT_USERS = 'edit:users',
  DELETE_USERS = 'delete:users',
  MANAGE_USER_ROLES = 'manage:user_roles',
  
  // Financial Access
  VIEW_FINANCIAL_DATA = 'view:financial_data',
  MANAGE_PAYMENTS = 'manage:payments',
  VIEW_ACCOUNTING = 'view:accounting',
  
  // System Access
  ACCESS_ADMIN_PANEL = 'access:admin_panel',
  ACCESS_SECURITY_CENTER = 'access:security_center',
  ACCESS_COMPLIANCE = 'access:compliance'
}

export interface RolePermissions {
  role: UserRole;
  level: number;
  permissions: Permission[];
  navigationItems: string[];
  description: string;
}

/**
 * Role hierarchy and permissions configuration
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.ORGANIZATION_OWNER]: {
    role: UserRole.ORGANIZATION_OWNER,
    level: 100,
    permissions: [
      // Full dashboard access
      Permission.VIEW_OVERVIEW,
      Permission.VIEW_LICENSES,
      Permission.VIEW_CLOUD_PROJECTS,
      Permission.VIEW_TEAM_MANAGEMENT,
      Permission.VIEW_BILLING,
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_DOWNLOADS,
      Permission.VIEW_SETTINGS,
      
      // Full management access
      Permission.MANAGE_ORGANIZATION,
      Permission.MANAGE_TEAM_MEMBERS,
      Permission.MANAGE_LICENSES,
      Permission.MANAGE_BILLING,
      Permission.CREATE_USERS,
      Permission.EDIT_USERS,
      Permission.DELETE_USERS,
      Permission.MANAGE_USER_ROLES,
      
      // Financial access
      Permission.VIEW_FINANCIAL_DATA,
      Permission.MANAGE_PAYMENTS,
      Permission.VIEW_ACCOUNTING,
      
      // System access
      Permission.ACCESS_ADMIN_PANEL,
      Permission.ACCESS_SECURITY_CENTER,
      Permission.ACCESS_COMPLIANCE
    ],
    navigationItems: [
      'overview',
      'licenses',
      'cloud-projects',
      'team-management',
      'billing',
      'analytics',
      'downloads',
      'organization',
      'security',
      'compliance',
      'settings'
    ],
    description: 'Full access to all features including billing and licensing management'
  },

  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    level: 90,
    permissions: [
      // Dashboard access (no billing)
      Permission.VIEW_OVERVIEW,
      Permission.VIEW_LICENSES,
      Permission.VIEW_CLOUD_PROJECTS,
      Permission.VIEW_TEAM_MANAGEMENT,
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_DOWNLOADS,
      Permission.VIEW_SETTINGS,
      
      // Management access (no billing)
      Permission.MANAGE_TEAM_MEMBERS,
      Permission.MANAGE_LICENSES,
      Permission.CREATE_USERS,
      Permission.EDIT_USERS,
      Permission.MANAGE_USER_ROLES,
      
      // System access
      Permission.ACCESS_SECURITY_CENTER,
      Permission.ACCESS_COMPLIANCE
    ],
    navigationItems: [
      'overview',
      'licenses',
      'cloud-projects',
      'team-management',
      'analytics',
      'downloads',
      'security',
      'compliance',
      'settings'
    ],
    description: 'Administrative access to manage team and licenses, but no billing access'
  },

  [UserRole.ORG_ADMIN]: {
    role: UserRole.ORG_ADMIN,
    level: 90,
    permissions: [
      // Dashboard access (no billing)
      Permission.VIEW_OVERVIEW,
      Permission.VIEW_LICENSES,
      Permission.VIEW_CLOUD_PROJECTS,
      Permission.VIEW_TEAM_MANAGEMENT,
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_DOWNLOADS,
      Permission.VIEW_SETTINGS,
      
      // Management access (no billing)
      Permission.MANAGE_TEAM_MEMBERS,
      Permission.MANAGE_LICENSES,
      Permission.CREATE_USERS,
      Permission.EDIT_USERS,
      Permission.MANAGE_USER_ROLES,
      
      // System access
      Permission.ACCESS_SECURITY_CENTER,
      Permission.ACCESS_COMPLIANCE
    ],
    navigationItems: [
      'overview',
      'licenses',
      'cloud-projects',
      'team-management',
      'analytics',
      'downloads',
      'security',
      'compliance',
      'settings'
    ],
    description: 'Organization administrative access to manage team and licenses, but no billing access'
  },

  [UserRole.MEMBER]: {
    role: UserRole.MEMBER,
    level: 50,
    permissions: [
      // Limited dashboard access
      Permission.VIEW_CLOUD_PROJECTS,
      Permission.VIEW_TEAM_MANAGEMENT,
      Permission.VIEW_SETTINGS
    ],
    navigationItems: [
      'cloud-projects',
      'team-management',
      'settings'
    ],
    description: 'Basic access to cloud projects and team management only'
  },

  [UserRole.ACCOUNTING]: {
    role: UserRole.ACCOUNTING,
    level: 80,
    permissions: [
      // Financial access only
      Permission.VIEW_FINANCIAL_DATA,
      Permission.MANAGE_PAYMENTS,
      Permission.VIEW_ACCOUNTING,
      Permission.VIEW_BILLING,
      Permission.VIEW_SETTINGS
    ],
    navigationItems: [
      'accounting',
      'billing',
      'settings'
    ],
    description: 'Access to accounting and financial data only'
  },

  // Legacy role mappings
  [UserRole.SUPERADMIN]: {
    role: UserRole.SUPERADMIN,
    level: 100,
    permissions: [
      Permission.VIEW_OVERVIEW,
      Permission.VIEW_LICENSES,
      Permission.VIEW_CLOUD_PROJECTS,
      Permission.VIEW_TEAM_MANAGEMENT,
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_DOWNLOADS,
      Permission.VIEW_SETTINGS,
      Permission.ACCESS_ADMIN_PANEL,
      Permission.VIEW_ACCOUNTING
    ],
    navigationItems: [
      'overview',
      'licenses',
      'cloud-projects',
      'team-management',
      'analytics',
      'downloads',
      'admin',
      'accounting',
      'settings'
    ],
    description: 'Legacy super admin role - maps to ORGANIZATION_OWNER'
  },

  [UserRole.USER]: {
    role: UserRole.USER,
    level: 50,
    permissions: [
      Permission.VIEW_CLOUD_PROJECTS,
      Permission.VIEW_TEAM_MANAGEMENT,
      Permission.VIEW_SETTINGS
    ],
    navigationItems: [
      'cloud-projects',
      'team-management',
      'settings'
    ],
    description: 'Legacy user role - maps to MEMBER'
  },

  [UserRole.ENTERPRISE_ADMIN]: {
    role: UserRole.ENTERPRISE_ADMIN,
    level: 90,
    permissions: [
      Permission.VIEW_OVERVIEW,
      Permission.VIEW_LICENSES,
      Permission.VIEW_CLOUD_PROJECTS,
      Permission.VIEW_TEAM_MANAGEMENT,
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_DOWNLOADS,
      Permission.VIEW_SETTINGS,
      Permission.MANAGE_TEAM_MEMBERS,
      Permission.MANAGE_LICENSES,
      Permission.CREATE_USERS,
      Permission.EDIT_USERS,
      Permission.MANAGE_USER_ROLES
    ],
    navigationItems: [
      'overview',
      'licenses',
      'cloud-projects',
      'team-management',
      'analytics',
      'downloads',
      'settings'
    ],
    description: 'Legacy enterprise admin role - maps to ADMIN'
  }
};

/**
 * Navigation item definitions
 */
export interface NavigationItem {
  id: string;
  text: string;
  icon: string;
  path: string;
  requiredPermission: Permission;
  requiredRole?: UserRole;
  description: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'overview',
    text: 'Overview',
    icon: 'Dashboard',
    path: '/dashboard',
    requiredPermission: Permission.VIEW_OVERVIEW,
    description: 'Dashboard overview and statistics'
  },
  {
    id: 'licenses',
    text: 'Licenses',
    icon: 'CardMembership',
    path: '/dashboard/licenses',
    requiredPermission: Permission.VIEW_LICENSES,
    description: 'License management and tracking'
  },
  {
    id: 'cloud-projects',
    text: 'Cloud Projects',
    icon: 'Analytics',
    path: '/dashboard/cloud-projects',
    requiredPermission: Permission.VIEW_CLOUD_PROJECTS,
    description: 'Cloud project management'
  },
  {
    id: 'team-management',
    text: 'Team Management',
    icon: 'Group',
    path: '/dashboard/team',
    requiredPermission: Permission.VIEW_TEAM_MANAGEMENT,
    description: 'Team member management'
  },
  {
    id: 'billing',
    text: 'Billing & Payments',
    icon: 'Payment',
    path: '/dashboard/billing',
    requiredPermission: Permission.VIEW_BILLING,
    requiredRole: UserRole.ORGANIZATION_OWNER,
    description: 'Billing and payment management (Owner only)'
  },
  {
    id: 'organization',
    text: 'Organization',
    icon: 'Business',
    path: '/dashboard/organization',
    requiredPermission: Permission.MANAGE_ORGANIZATION,
    requiredRole: UserRole.ORGANIZATION_OWNER,
    description: 'Organization settings (Owner only)'
  },
  {
    id: 'security',
    text: 'Security Center',
    icon: 'Security',
    path: '/dashboard/security',
    requiredPermission: Permission.ACCESS_SECURITY_CENTER,
    description: 'Security and compliance management'
  },
  {
    id: 'compliance',
    text: 'Compliance',
    icon: 'Security',
    path: '/dashboard/compliance',
    requiredPermission: Permission.ACCESS_COMPLIANCE,
    description: 'Compliance and audit management'
  },
  {
    id: 'accounting',
    text: 'Accounting',
    icon: 'AccountBalance',
    path: '/accounting',
    requiredPermission: Permission.VIEW_ACCOUNTING,
    requiredRole: UserRole.ACCOUNTING,
    description: 'Accounting and financial management'
  },
  {
    id: 'admin',
    text: 'Admin Panel',
    icon: 'AdminPanelSettings',
    path: '/admin',
    requiredPermission: Permission.ACCESS_ADMIN_PANEL,
    requiredRole: UserRole.ORGANIZATION_OWNER,
    description: 'System administration (Owner only)'
  },
  {
    id: 'settings',
    text: 'Settings',
    icon: 'Settings',
    path: '/dashboard/settings',
    requiredPermission: Permission.VIEW_SETTINGS,
    description: 'User and account settings'
  }
];

/**
 * RBAC Service Class
 */
export class RoleBasedAccessControl {
  /**
   * Get user role with fallback mapping
   */
  static getUserRole(user: any): UserRole {
    if (!user) return UserRole.MEMBER;
    
    // Check multiple possible role properties
    const role = String(user.role || user.memberRole || '').toUpperCase();
    
    // Direct mapping
    if (Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }
    
    // Legacy role mapping
    switch (role) {
      case 'OWNER':
      case 'ORGANIZATION_OWNER':
        return UserRole.ORGANIZATION_OWNER;
      case 'ADMIN':
      case 'ENTERPRISE_ADMIN':
        return UserRole.ADMIN;
      case 'ORG_ADMIN':
        return UserRole.ORG_ADMIN;
      case 'ACCOUNTING':
        return UserRole.ACCOUNTING;
      case 'MEMBER':
      case 'USER':
      default:
        return UserRole.MEMBER;
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(user: any, permission: Permission): boolean {
    const userRole = this.getUserRole(user);
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.permissions.includes(permission);
  }

  /**
   * Check if user has specific role
   */
  static hasRole(user: any, role: UserRole): boolean {
    return this.getUserRole(user) === role;
  }

  /**
   * Check if user has minimum role level
   */
  static hasMinimumRoleLevel(user: any, minLevel: number): boolean {
    const userRole = this.getUserRole(user);
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.level >= minLevel;
  }

  /**
   * Get user's accessible navigation items
   */
  static getAccessibleNavigationItems(user: any): NavigationItem[] {
    const userRole = this.getUserRole(user);
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    
    console.log('🔍 [RBAC] getUserRole result:', userRole);
    console.log('🔍 [RBAC] Role permissions:', rolePermissions);
    console.log('🔍 [RBAC] Available navigation items:', NAVIGATION_ITEMS.length);
    
    const accessibleItems = NAVIGATION_ITEMS.filter(item => {
      const hasPermission = this.hasPermission(user, item.requiredPermission);
      const hasRole = !item.requiredRole || this.hasRole(user, item.requiredRole);
      
      console.log(`🔍 [RBAC] Item ${item.id}: hasPermission=${hasPermission}, hasRole=${hasRole}, requiredPermission=${item.requiredPermission}, requiredRole=${item.requiredRole}`);
      
      return hasPermission && hasRole;
    });
    
    console.log('🔍 [RBAC] Final accessible items:', accessibleItems.map(item => item.id));
    
    return accessibleItems;
  }

  /**
   * Check if user can access specific page
   */
  static canAccessPage(user: any, pageId: string): boolean {
    const accessibleItems = this.getAccessibleNavigationItems(user);
    return accessibleItems.some(item => item.id === pageId);
  }

  /**
   * Get user's role information
   */
  static getUserRoleInfo(user: any): RolePermissions {
    const userRole = this.getUserRole(user);
    return ROLE_PERMISSIONS[userRole];
  }

  /**
   * Check if user is organization owner
   */
  static isOrganizationOwner(user: any): boolean {
    return this.hasRole(user, UserRole.ORGANIZATION_OWNER);
  }

  /**
   * Check if user is admin or higher
   */
  static isAdminOrHigher(user: any): boolean {
    return this.hasMinimumRoleLevel(user, 90);
  }

  /**
   * Check if user is member or higher
   */
  static isMemberOrHigher(user: any): boolean {
    return this.hasMinimumRoleLevel(user, 50);
  }
}

export default RoleBasedAccessControl;
