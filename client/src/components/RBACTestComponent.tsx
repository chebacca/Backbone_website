/**
 * RBAC Test Component
 * Demonstrates the role-based access control system
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Grid
} from '@mui/material';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole, Permission } from '@/services/RoleBasedAccessControl';

const RBACTestComponent: React.FC = () => {
  const {
    userRole,
    roleInfo,
    hasPermission,
    hasRole,
    isOrganizationOwner,
    isAdminOrHigher,
    isMemberOrHigher,
    getAccessibleNavigationItems,
    user
  } = useRBAC();

  const accessibleItems = getAccessibleNavigationItems();

  const testPermissions = [
    Permission.VIEW_OVERVIEW,
    Permission.VIEW_LICENSES,
    Permission.VIEW_CLOUD_PROJECTS,
    Permission.VIEW_TEAM_MANAGEMENT,
    Permission.VIEW_BILLING,
    Permission.MANAGE_ORGANIZATION,
    Permission.ACCESS_ADMIN_PANEL,
    Permission.VIEW_ACCOUNTING
  ];

  const testRoles = [
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMIN,
    UserRole.MEMBER,
    UserRole.ACCOUNTING
  ];

  const getRoleColor = (role: UserRole): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (role) {
      case UserRole.ORGANIZATION_OWNER:
        return 'primary';
      case UserRole.ADMIN:
        return 'secondary';
      case UserRole.ACCOUNTING:
        return 'warning';
      case UserRole.MEMBER:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Role-Based Access Control Test
      </Typography>
      
      <Grid container spacing={3}>
        {/* Current User Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current User Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Email: {user?.email || 'Not logged in'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {userRole}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Level: {roleInfo.level}/100
                </Typography>
              </Box>
              
              <Chip 
                label={userRole} 
                color={getRoleColor(userRole)}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                {roleInfo.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Role Checks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role Checks
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Is Organization Owner" 
                    secondary={isOrganizationOwner() ? 'Yes' : 'No'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Is Admin or Higher" 
                    secondary={isAdminOrHigher() ? 'Yes' : 'No'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Is Member or Higher" 
                    secondary={isMemberOrHigher() ? 'Yes' : 'No'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Permission Tests */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Permission Tests
              </Typography>
              <List dense>
                {testPermissions.map((permission) => (
                  <ListItem key={permission}>
                    <ListItemText 
                      primary={permission.replace('_', ' ').toLowerCase()}
                      secondary={hasPermission(permission) ? 'Granted' : 'Denied'}
                    />
                    <Chip 
                      label={hasPermission(permission) ? 'Yes' : 'No'}
                      color={hasPermission(permission) ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Accessible Navigation */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Accessible Navigation Items
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {accessibleItems.length} items accessible
              </Typography>
              <List dense>
                {accessibleItems.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText 
                      primary={item.text}
                      secondary={item.path}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Role Comparison */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role Comparison
              </Typography>
              <Grid container spacing={2}>
                {testRoles.map((role) => (
                  <Grid item xs={6} sm={3} key={role}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={role.replace('_', ' ')}
                        color={getRoleColor(role)}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" display="block">
                        {hasRole(role) ? 'Current Role' : 'Not Current'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Access Level Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Access Level:</strong> {roleInfo.level}/100 - {roleInfo.permissions.length} permissions granted
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Navigation Items:</strong> {accessibleItems.length} accessible out of {testPermissions.length} total
        </Typography>
      </Alert>
    </Box>
  );
};

export default RBACTestComponent;
