/**
 * 🎣 Streamlined Data Hooks
 * 
 * React hooks that provide easy access to the UnifiedDataService
 * with automatic caching, loading states, and error handling.
 * 
 * These hooks replace all existing data fetching patterns and provide:
 * - Consistent loading and error states
 * - Automatic caching and invalidation
 * - Real-time updates where needed
 * - Optimistic updates for better UX
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  unifiedDataService, 
  StreamlinedUser, 
  StreamlinedProject, 
  StreamlinedOrganization,
  StreamlinedDataset,
  StreamlinedLicense,
  StreamlinedTeamMember,
  OrganizationContext 
} from '../services/UnifiedDataService';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// COMMON HOOK TYPES
// ============================================================================

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseDataListResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// USER HOOKS
// ============================================================================

/**
 * Get the current authenticated user with all embedded data
 */
export function useCurrentUser(): UseDataResult<StreamlinedUser> {
  const [data, setData] = useState<StreamlinedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();

  const fetchUser = useCallback(async () => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await unifiedDataService.getCurrentUser();
      setData(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    // Only fetch when auth is ready and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchUser();
    } else if (!authLoading && !isAuthenticated) {
      // Auth is ready but user is not authenticated, set loading to false
      setLoading(false);
      setData(null);
    }
  }, [authLoading, isAuthenticated, fetchUser]);

  // Reset loading state when auth state changes
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
    }
  }, [authLoading]);

  return {
    data,
    loading: loading || authLoading,
    error,
    refetch: fetchUser
  };
}

/**
 * Get all users in the current user's organization
 */
export function useOrganizationUsers(): UseDataListResult<StreamlinedUser> {
  const [data, setData] = useState<StreamlinedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: currentUser, loading: userLoading } = useCurrentUser();

  const fetchUsers = useCallback(async () => {
    if (!currentUser?.organization?.id) {
      console.log('⚠️ [useOrganizationUsers] No organization ID available:', currentUser?.organization);
      return;
    }

    try {
      console.log('🔍 [useOrganizationUsers] Fetching users for organization:', currentUser.organization.id);
      setLoading(true);
      setError(null);
      const users = await unifiedDataService.getUsersByOrganization(currentUser.organization.id);
      setData(users);
    } catch (err) {
      console.error('❌ [useOrganizationUsers] Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.organization?.id]);

  useEffect(() => {
    // Only fetch when currentUser is loaded and has organization
    if (currentUser?.organization?.id && !userLoading) {
      fetchUsers();
    } else if (!userLoading && !currentUser?.organization?.id) {
      // User loaded but no organization, set loading to false
      setLoading(false);
      setData([]);
    }
  }, [currentUser?.organization?.id, userLoading, fetchUsers]);

  // Reset loading state when user loading changes
  useEffect(() => {
    if (userLoading) {
      setLoading(true);
    }
  }, [userLoading]);

  return {
    data,
    loading: loading || userLoading,
    error,
    refetch: fetchUsers
  };
}

/**
 * Update user data with optimistic updates
 */
export function useUpdateUser(): UseMutationResult<void, { userId: string; updates: Partial<StreamlinedUser> }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ userId, updates }: { userId: string; updates: Partial<StreamlinedUser> }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.updateUser(userId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

// ============================================================================
// PROJECT HOOKS
// ============================================================================

/**
 * Get all projects accessible to the current user
 */
export function useUserProjects(): UseDataListResult<StreamlinedProject> {
  const [data, setData] = useState<StreamlinedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await unifiedDataService.getProjectsForUser();
      setData(projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    data,
    loading,
    error,
    refetch: fetchProjects
  };
}

/**
 * Create a new project
 */
export function useCreateProject(): UseMutationResult<string, Omit<StreamlinedProject, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessedAt'>> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (projectData: Omit<StreamlinedProject, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const projectId = await unifiedDataService.createProject(projectData);
      return projectId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Update project data
 */
export function useUpdateProject(): UseMutationResult<void, { projectId: string; updates: Partial<StreamlinedProject> }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ projectId, updates }: { projectId: string; updates: Partial<StreamlinedProject> }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.updateProject(projectId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

// ============================================================================
// TEAM MEMBER HOOKS
// ============================================================================

/**
 * Add a team member to a project
 */
export function useAddTeamMemberToProject(): UseMutationResult<void, { projectId: string; userId: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ projectId, userId, role }: { projectId: string; userId: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.addTeamMemberToProject(projectId, userId, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Remove a team member from a project
 */
export function useRemoveTeamMemberFromProject(): UseMutationResult<void, { projectId: string; userId: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ projectId, userId }: { projectId: string; userId: string }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.removeTeamMemberFromProject(projectId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

// ============================================================================
// ORGANIZATION HOOKS
// ============================================================================

/**
 * Get complete organization context (org + subscription + members)
 */
export function useOrganizationContext(): UseDataResult<OrganizationContext> {
  const [data, setData] = useState<OrganizationContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: currentUser, loading: userLoading } = useCurrentUser();

  const fetchContext = useCallback(async () => {
    // Don't fetch if user is still loading or not authenticated
    if (userLoading || !currentUser) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const context = await unifiedDataService.getOrganizationContext();
      setData(context);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organization context');
    } finally {
      setLoading(false);
    }
  }, [userLoading, currentUser]);

  useEffect(() => {
    // Only fetch when currentUser is loaded
    if (!userLoading && currentUser) {
      fetchContext();
    } else if (!userLoading && !currentUser) {
      // User loaded but not authenticated, set loading to false
      setLoading(false);
      setData(null);
    }
  }, [userLoading, currentUser, fetchContext]);

  // Reset loading state when user loading changes
  useEffect(() => {
    if (userLoading) {
      setLoading(true);
    }
  }, [userLoading]);

  return {
    data,
    loading: loading || userLoading,
    error,
    refetch: fetchContext
  };
}

// ============================================================================
// LICENSE HOOKS
// ============================================================================

/**
 * Get all licenses for the current user's organization
 */
export function useOrganizationLicenses(): UseDataListResult<StreamlinedLicense> {
  const [data, setData] = useState<StreamlinedLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: currentUser, loading: userLoading } = useCurrentUser();

  const fetchLicenses = useCallback(async () => {
    // Don't fetch if user is still loading or not authenticated
    if (userLoading || !currentUser) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const licenses = await unifiedDataService.getLicensesForOrganization();
      setData(licenses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  }, [userLoading, currentUser]);

  useEffect(() => {
    // Only fetch when currentUser is loaded
    if (!userLoading && currentUser) {
      fetchLicenses();
    } else if (!userLoading && !currentUser) {
      // User loaded but not authenticated, set loading to false
      setLoading(false);
      setData([]);
    }
  }, [userLoading, currentUser, fetchLicenses]);

  // Reset loading state when user loading changes
  useEffect(() => {
    if (userLoading) {
      setLoading(true);
    }
  }, [userLoading]);

  return {
    data,
    loading: loading || userLoading,
    error,
    refetch: fetchLicenses
  };
}

/**
 * Create a new license
 */
export function useCreateLicense(): UseMutationResult<string, Omit<StreamlinedLicense, 'id' | 'createdAt' | 'updatedAt'>> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (licenseData: Omit<StreamlinedLicense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const licenseId = await unifiedDataService.createLicense(licenseData);
      return licenseId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create license');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Update license data
 */
export function useUpdateLicense(): UseMutationResult<void, { licenseId: string; updates: Partial<StreamlinedLicense> }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ licenseId, updates }: { licenseId: string; updates: Partial<StreamlinedLicense> }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.updateLicense(licenseId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update license');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Assign a license to a user
 */
export function useAssignLicense(): UseMutationResult<void, { licenseId: string; userId: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ licenseId, userId }: { licenseId: string; userId: string }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.assignLicense(licenseId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign license');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Unassign a license from a user
 */
export function useUnassignLicense(): UseMutationResult<void, { licenseId: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ licenseId }: { licenseId: string }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.unassignLicense(licenseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unassign license');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

// ============================================================================
// TEAM MEMBER HOOKS
// ============================================================================

/**
 * Get all team members for the current user's organization
 */
export function useOrganizationTeamMembers(): UseDataListResult<StreamlinedTeamMember> {
  const [data, setData] = useState<StreamlinedTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const teamMembers = await unifiedDataService.getTeamMembersForOrganization();
      setData(teamMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return {
    data,
    loading,
    error,
    refetch: fetchTeamMembers
  };
}

/**
 * Invite a new team member
 */
export function useInviteTeamMember(): UseMutationResult<string, Omit<StreamlinedTeamMember, 'id' | 'createdAt' | 'updatedAt' | 'joinedAt'>> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (memberData: Omit<StreamlinedTeamMember, 'id' | 'createdAt' | 'updatedAt' | 'joinedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const memberId = await unifiedDataService.inviteTeamMember(memberData);
      return memberId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Update team member data
 */
export function useUpdateTeamMember(): UseMutationResult<void, { memberId: string; updates: Partial<StreamlinedTeamMember> }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ memberId, updates }: { memberId: string; updates: Partial<StreamlinedTeamMember> }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.updateTeamMember(memberId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Change team member password
 */
export function useChangeTeamMemberPassword(): UseMutationResult<void, { memberId: string; newPassword: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ memberId, newPassword }: { memberId: string; newPassword: string }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.changeTeamMemberPassword(memberId, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Remove a team member
 */
export function useRemoveTeamMember(): UseMutationResult<void, { memberId: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ memberId }: { memberId: string }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.removeTeamMember(memberId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

/**
 * Assign a license to a team member
 */
export function useAssignLicenseToTeamMember(): UseMutationResult<void, { memberId: string; licenseId: string; licenseKey: string; licenseType: string }> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ memberId, licenseId, licenseKey, licenseType }: { memberId: string; licenseId: string; licenseKey: string; licenseType: string }) => {
    try {
      setLoading(true);
      setError(null);
      await unifiedDataService.assignLicenseToTeamMember(memberId, licenseId, licenseKey, licenseType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign license to team member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mutate,
    loading,
    error
  };
}

// ============================================================================
// DATASET HOOKS
// ============================================================================

/**
 * Get all datasets accessible to the current user
 */
export function useUserDatasets(): UseDataListResult<StreamlinedDataset> {
  const [data, setData] = useState<StreamlinedDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const datasets = await unifiedDataService.getDatasetsForUser();
      setData(datasets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch datasets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  return {
    data,
    loading,
    error,
    refetch: fetchDatasets
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Clear all cached data (useful for logout or data refresh)
 */
export function useClearCache() {
  return useCallback(() => {
    unifiedDataService.clearAllCache();
  }, []);
}

/**
 * Check if current user can perform certain actions
 */
export function useUserPermissions() {
  const { data: user } = useCurrentUser();

  return {
    canCreateProjects: user?.license?.canCreateProjects || false,
    canManageTeam: user?.license?.canManageTeam || false,
    isAccountOwner: user?.userType === 'ACCOUNT_OWNER',
    isTeamMember: user?.userType === 'TEAM_MEMBER',
    isAdmin: user?.userType === 'ADMIN',
    organizationTier: user?.organization?.tier || 'BASIC'
  };
}

/**
 * Optimistic updates helper
 */
export function useOptimisticUpdate<T>(
  data: T[],
  setData: (data: T[]) => void
) {
  const optimisticUpdate = useCallback((
    updateFn: (items: T[]) => T[],
    revertFn?: (items: T[]) => T[]
  ) => {
    const originalData = [...data];
    
    // Apply optimistic update
    setData(updateFn(data));
    
    // Return revert function
    return () => {
      if (revertFn) {
        setData(revertFn(originalData));
      } else {
        setData(originalData);
      }
    };
  }, [data, setData]);

  return optimisticUpdate;
}
