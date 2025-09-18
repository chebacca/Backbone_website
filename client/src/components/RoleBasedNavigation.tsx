/**
 * Role-Based Navigation Component
 * Displays navigation items based on user's role and permissions
 */

import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  Chip
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useRBAC } from '@/hooks/useRBAC';
import { UserRole } from '@/services/RoleBasedAccessControl';

interface RoleBasedNavigationProps {
  onItemClick?: () => void;
  showRoleInfo?: boolean;
}

const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({ 
  onItemClick,
  showRoleInfo = false 
}) => {
  const { getAccessibleNavigationItems, userRole, roleInfo, user } = useRBAC();
  const location = useLocation();
  const accessibleItems = getAccessibleNavigationItems();

  const getRoleColor = (role: UserRole): string => {
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

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case UserRole.ORGANIZATION_OWNER:
        return 'Owner';
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.ACCOUNTING:
        return 'Accounting';
      case UserRole.MEMBER:
        return 'Member';
      default:
        return 'User';
    }
  };

  return (
    <Box>
      {/* Role Information */}
      {showRoleInfo && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            User Role
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={getRoleLabel(userRole)} 
              color={getRoleColor(userRole) as any}
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              Level {roleInfo.level}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {roleInfo.description}
          </Typography>
        </Box>
      )}

      {/* Navigation Items */}
      <List>
        {accessibleItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={onItemClick}
                selected={isActive}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.contrastText',
                      fontWeight: 600,
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  {/* Icon will be rendered by parent component */}
                  <Box sx={{ width: 24, height: 24 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  secondary={item.description}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
                {item.chip && (
                  <Chip 
                    label={item.chip} 
                    size="small" 
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Access Level Information */}
      {showRoleInfo && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Access Level: {roleInfo.level}/100
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Permissions: {roleInfo.permissions.length} granted
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default RoleBasedNavigation;
