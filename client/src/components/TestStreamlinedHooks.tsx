/**
 * 🧪 Test Streamlined Hooks Component
 * 
 * Simple test component to verify the streamlined hooks are working correctly.
 * This can be temporarily added to your app for testing purposes.
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Skeleton,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

import {
  useCurrentUser,
  useOrganizationContext,
  useUserProjects,
  useUserPermissions
} from '../hooks/useStreamlinedData';

export const TestStreamlinedHooks: React.FC = () => {
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { data: projects, loading: projectsLoading, error: projectsError } = useUserProjects();
  const permissions = useUserPermissions();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Streamlined Hooks Test Dashboard
      </Typography>
      
      {/* Current User Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            👤 Current User Hook Test
          </Typography>
          
          {userLoading && <Skeleton height={100} />}
          {userError && <Alert severity="error">Error: {userError}</Alert>}
          {currentUser && (
            <Box>
              <Typography><strong>Name:</strong> {currentUser.name}</Typography>
              <Typography><strong>Email:</strong> {currentUser.email}</Typography>
              <Typography><strong>User Type:</strong> {currentUser.userType}</Typography>
              <Typography><strong>Role:</strong> {currentUser.role}</Typography>
              <Chip 
                label={`${currentUser.organization.tier} - ${currentUser.organization.name}`}
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Permissions Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔐 User Permissions Hook Test
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Can Create Projects: ${permissions.canCreateProjects}`}
              color={permissions.canCreateProjects ? 'success' : 'default'}
            />
            <Chip 
              label={`Can Manage Team: ${permissions.canManageTeam}`}
              color={permissions.canManageTeam ? 'success' : 'default'}
            />
            <Chip 
              label={`Is Account Owner: ${permissions.isAccountOwner}`}
              color={permissions.isAccountOwner ? 'primary' : 'default'}
            />
            <Chip 
              label={`Organization Tier: ${permissions.organizationTier}`}
              color="info"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Organization Context Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🏢 Organization Context Hook Test
          </Typography>
          
          {orgLoading && <Skeleton height={150} />}
          {orgError && <Alert severity="error">Error: {orgError}</Alert>}
          {orgContext && (
            <Box>
              <Typography><strong>Organization:</strong> {orgContext.organization.name}</Typography>
              <Typography><strong>Tier:</strong> {orgContext.organization.tier}</Typography>
              <Typography><strong>Total Members:</strong> {orgContext.members.length}</Typography>
              <Typography><strong>Subscription Status:</strong> {orgContext.subscription?.status || 'None'}</Typography>
              <Typography><strong>Seats:</strong> {orgContext.subscription?.plan?.seats || 0}</Typography>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Team Members:</Typography>
              <List dense>
                {orgContext.members.slice(0, 5).map((member) => (
                  <ListItem key={member.id}>
                    <ListItemText 
                      primary={member.name}
                      secondary={`${member.email} - ${member.userType}`}
                    />
                  </ListItem>
                ))}
                {orgContext.members.length > 5 && (
                  <ListItem>
                    <ListItemText secondary={`... and ${orgContext.members.length - 5} more`} />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Projects Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📁 User Projects Hook Test
          </Typography>
          
          {projectsLoading && <Skeleton height={100} />}
          {projectsError && <Alert severity="error">Error: {projectsError}</Alert>}
          {projects && (
            <Box>
              <Typography><strong>Total Projects:</strong> {projects.length}</Typography>
              
              {projects.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Recent Projects:</Typography>
                  <List dense>
                    {projects.slice(0, 3).map((project) => (
                      <ListItem key={project.id}>
                        <ListItemText 
                          primary={project.name}
                          secondary={`${project.status} - ${project.teamAssignments.length} team members`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Cache Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ⚡ Cache Performance
          </Typography>
          
          <Alert severity="info">
            The hooks automatically cache data for 5 minutes to reduce Firebase calls.
            Try refreshing this page - subsequent loads should be much faster!
          </Alert>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Performance Tips:</strong>
            <br />• First load: Fetches from Firebase
            <br />• Cached loads: Instant response from memory
            <br />• Auto-refresh: Cache expires after 5 minutes
            <br />• Optimistic updates: UI updates immediately, syncs in background
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestStreamlinedHooks;
