# Role-Based Access Control (RBAC) System Documentation

## Overview

The RBAC system provides granular access control for the licensing website dashboard, ensuring users only see and can access features appropriate to their role and permissions.

## Role Hierarchy

### 1. ORGANIZATION_OWNER (Level 100)
- **Full access** to all features including billing and licensing management
- **Can manage** organization settings, team members, licenses, and billing
- **Has access to** all navigation items including billing, organization, and admin panel
- **Typical users**: Company owners, C-level executives

### 2. ADMIN (Level 90)
- **Administrative access** to manage team and licenses
- **Cannot access** billing or organization settings
- **Can manage** team members, licenses, and user roles
- **Has access to** most navigation items except billing and organization
- **Typical users**: IT administrators, project managers

### 3. ACCOUNTING (Level 80)
- **Financial access only** to accounting and billing data
- **Cannot access** team management or licensing features
- **Has access to** accounting dashboard, billing, and settings only
- **Typical users**: Accountants, financial managers

### 4. MEMBER (Level 50)
- **Basic access** to cloud projects and team management only
- **Cannot access** billing, licensing, or administrative features
- **Has access to** minimal navigation: cloud projects, team management, settings
- **Typical users**: Regular team members, contractors

## Permission System

### Dashboard Access Permissions
- `view:overview` - Access to dashboard overview
- `view:licenses` - Access to license management
- `view:cloud_projects` - Access to cloud project management
- `view:team_management` - Access to team member management
- `view:billing` - Access to billing and payments (Owner only)
- `view:analytics` - Access to usage analytics
- `view:downloads` - Access to SDK downloads
- `view:settings` - Access to user settings

### Management Permissions
- `manage:organization` - Manage organization settings (Owner only)
- `manage:team_members` - Manage team members
- `manage:licenses` - Manage licenses
- `manage:billing` - Manage billing (Owner only)

### User Management Permissions
- `create:users` - Create new users
- `edit:users` - Edit existing users
- `delete:users` - Delete users
- `manage:user_roles` - Manage user roles

### Financial Permissions
- `view:financial_data` - View financial data
- `manage:payments` - Manage payments
- `view:accounting` - Access accounting dashboard

### System Permissions
- `access:admin_panel` - Access admin panel (Owner only)
- `access:security_center` - Access security center
- `access:compliance` - Access compliance features

## Navigation Access by Role

### ORGANIZATION_OWNER
- ✅ Overview
- ✅ Licenses
- ✅ Cloud Projects
- ✅ Team Management
- ✅ Billing & Payments
- ✅ Usage Analytics
- ✅ Downloads
- ✅ Organization
- ✅ Security Center
- ✅ Compliance
- ✅ Settings

### ADMIN
- ✅ Overview
- ✅ Licenses
- ✅ Cloud Projects
- ✅ Team Management
- ❌ Billing & Payments
- ✅ Usage Analytics
- ✅ Downloads
- ❌ Organization
- ✅ Security Center
- ✅ Compliance
- ✅ Settings

### ACCOUNTING
- ❌ Overview
- ❌ Licenses
- ❌ Cloud Projects
- ❌ Team Management
- ✅ Billing & Payments
- ❌ Usage Analytics
- ❌ Downloads
- ❌ Organization
- ❌ Security Center
- ❌ Compliance
- ✅ Settings

### MEMBER
- ❌ Overview
- ❌ Licenses
- ✅ Cloud Projects
- ✅ Team Management
- ❌ Billing & Payments
- ❌ Usage Analytics
- ❌ Downloads
- ❌ Organization
- ❌ Security Center
- ❌ Compliance
- ✅ Settings

## Implementation

### 1. Using the RBAC Hook

```typescript
import { useRBAC } from '@/hooks/useRBAC';

const MyComponent = () => {
  const {
    userRole,
    hasPermission,
    hasRole,
    isOrganizationOwner,
    getAccessibleNavigationItems
  } = useRBAC();

  // Check permissions
  if (hasPermission(Permission.VIEW_BILLING)) {
    // Show billing content
  }

  // Check roles
  if (isOrganizationOwner()) {
    // Show owner-only content
  }

  // Get accessible navigation
  const navItems = getAccessibleNavigationItems();
};
```

### 2. Using Protected Routes

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';
import { Permission, UserRole } from '@/services/RoleBasedAccessControl';

// Protect by permission
<ProtectedRoute requirePermission={Permission.VIEW_BILLING}>
  <BillingPage />
</ProtectedRoute>

// Protect by role
<ProtectedRoute requireRole={UserRole.ORGANIZATION_OWNER}>
  <OrganizationPage />
</ProtectedRoute>

// Protect by minimum role level
<ProtectedRoute requireMinimumRoleLevel={90}>
  <AdminPage />
</ProtectedRoute>
```

### 3. Using Role-Based Navigation

```typescript
import RoleBasedNavigation from '@/components/RoleBasedNavigation';

<RoleBasedNavigation 
  onItemClick={() => setMobileOpen(false)}
  showRoleInfo={true}
/>
```

## User Role Mapping

The system automatically maps legacy roles to the new RBAC system:

- `OWNER` → `ORGANIZATION_OWNER`
- `ADMIN` → `ADMIN`
- `ENTERPRISE_ADMIN` → `ADMIN`
- `ACCOUNTING` → `ACCOUNTING`
- `MEMBER` → `MEMBER`
- `USER` → `MEMBER`
- `SUPERADMIN` → `ORGANIZATION_OWNER`

## Testing

Use the `RBACTestComponent` to test the system:

```typescript
import RBACTestComponent from '@/components/RBACTestComponent';

// Add to any page for testing
<RBACTestComponent />
```

## Security Considerations

1. **Client-side checks** are for UX only - always validate permissions on the server
2. **Role hierarchy** ensures higher-level roles inherit lower-level permissions
3. **Permission granularity** allows fine-grained access control
4. **Navigation filtering** prevents users from seeing inaccessible features
5. **Route protection** prevents unauthorized page access

## Migration Guide

### For Existing Components

1. Replace hardcoded role checks with `useRBAC` hook
2. Use `ProtectedRoute` with permission/role requirements
3. Replace navigation arrays with `RoleBasedNavigation` component
4. Update role checks to use the new `UserRole` enum

### For New Components

1. Always use `useRBAC` hook for permission checks
2. Use `ProtectedRoute` for page-level protection
3. Use permission constants instead of hardcoded strings
4. Test with different user roles

## Best Practices

1. **Principle of Least Privilege**: Give users minimum required access
2. **Role-based Design**: Design features around roles, not individual users
3. **Permission Granularity**: Use specific permissions for fine control
4. **Consistent Checks**: Use the same permission checks in UI and API
5. **Clear Documentation**: Document role requirements for each feature
6. **Regular Audits**: Review and update role assignments regularly

## Troubleshooting

### Common Issues

1. **User sees wrong navigation**: Check role mapping and permission assignments
2. **Permission denied errors**: Verify user has required permission
3. **Navigation not updating**: Ensure `useRBAC` hook is used correctly
4. **Route protection not working**: Check `ProtectedRoute` configuration

### Debug Tools

1. Use `RBACTestComponent` to see current user permissions
2. Check browser console for RBAC-related logs
3. Verify user role in Firebase Auth and Firestore
4. Test with different user accounts

## Future Enhancements

1. **Dynamic Roles**: Allow custom role creation
2. **Permission Groups**: Group related permissions
3. **Temporary Access**: Time-limited permission grants
4. **Audit Logging**: Track permission usage
5. **Role Templates**: Predefined role configurations
