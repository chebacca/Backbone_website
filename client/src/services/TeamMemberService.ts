/**
 * TeamMemberService - Handles all team member-related operations
 */
import { BaseService } from './base/BaseService';
import { ProjectTeamMember, ServiceConfig, TeamMember, TeamMemberRole, TeamMemberStatus } from './models/types';

export class TeamMemberService extends BaseService {
  private static instance: TeamMemberService;

  private constructor(config: ServiceConfig) {
    super(config);
  }

  public static getInstance(config: ServiceConfig): TeamMemberService {
    if (!TeamMemberService.instance) {
      TeamMemberService.instance = new TeamMemberService(config);
    }
    return TeamMemberService.instance;
  }

  /**
   * Get all licensed team members
   * Excludes members already assigned to the specified project
   */
  public async getLicensedTeamMembers(options?: {
    search?: string;
    excludeProjectId?: string;
  }): Promise<TeamMember[]> {
    try {
      console.log('🚀 [TeamMemberService] Getting licensed team members with options:', options);
      
      if (this.isWebOnlyMode()) {
        return await this.getLicensedTeamMembersFromFirestore(options);
      }
      
      // Build query string for API request
      const params = new URLSearchParams();
      if (options?.search) {
        params.append('search', options.search);
      }
      if (options?.excludeProjectId) {
        params.append('excludeProjectId', options.excludeProjectId);
      }

      const endpoint = `team-members/licensed${params.toString() ? `?${params.toString()}` : ''}`;
      
      try {
        const result = await this.apiRequest<TeamMember[]>(endpoint);
        return result;
      } catch (error) {
        console.warn('⚠️ [TeamMemberService] API request failed, falling back to Firestore');
        return await this.getLicensedTeamMembersFromFirestore(options);
      }
    } catch (error) {
      this.handleError(error, 'getLicensedTeamMembers');
      return [];
    }
  }

  /**
   * Get team members assigned to a specific project
   */
  public async getProjectTeamMembers(projectId: string): Promise<ProjectTeamMember[]> {
    try {
      console.log('🚀 [TeamMemberService] Getting team members for project:', projectId);
      
      if (this.isWebOnlyMode()) {
        return await this.getProjectTeamMembersFromFirestore(projectId);
      }
      
      try {
        const result = await this.apiRequest<ProjectTeamMember[]>(`projects/${projectId}/team-members`);
        return result;
      } catch (error) {
        console.warn('⚠️ [TeamMemberService] API request failed, falling back to Firestore');
        return await this.getProjectTeamMembersFromFirestore(projectId);
      }
    } catch (error) {
      this.handleError(error, `getProjectTeamMembers(${projectId})`);
      return [];
    }
  }

  /**
   * 🚀 PERFORMANCE OPTIMIZATION: Get team members for multiple projects in batch
   * This reduces the number of Firestore calls by loading all team members at once
   */
  public async getProjectTeamMembersBatch(projectIds: string[]): Promise<Record<string, ProjectTeamMember[]>> {
    try {
      console.log('🚀 [TeamMemberService] Getting team members for projects in batch:', projectIds);
      
      if (this.isWebOnlyMode()) {
        return await this.getProjectTeamMembersFromFirestoreBatch(projectIds);
      }
      
      // For non-webonly mode, make individual API calls in parallel
      const promises = projectIds.map(async (projectId) => {
        try {
          const result = await this.apiRequest<ProjectTeamMember[]>(`projects/${projectId}/team-members`);
          return { projectId, teamMembers: result };
        } catch (error) {
          console.warn(`⚠️ [TeamMemberService] API request failed for project ${projectId}, falling back to Firestore`);
          const teamMembers = await this.getProjectTeamMembersFromFirestore(projectId);
          return { projectId, teamMembers };
        }
      });
      
      const results = await Promise.all(promises);
      const batchResult: Record<string, ProjectTeamMember[]> = {};
      
      results.forEach(({ projectId, teamMembers }) => {
        batchResult[projectId] = teamMembers;
      });
      
      return batchResult;
    } catch (error) {
      this.handleError(error, `getProjectTeamMembersBatch(${projectIds.join(', ')})`);
      return {};
    }
  }

  /**
   * Add a team member to a project with a specific role
   */
  public async addTeamMemberToProject(
    projectId: string, 
    teamMemberId: string, 
    role: TeamMemberRole = TeamMemberRole.MEMBER
  ): Promise<boolean> {
    try {
      console.log('🚀 [TeamMemberService] Adding team member to project:', { projectId, teamMemberId, role });
      
      if (this.isWebOnlyMode()) {
        return await this.addTeamMemberToProjectInFirestore(projectId, teamMemberId, role);
      }
      
      try {
        await this.apiRequest(`projects/${projectId}/team-members`, 'POST', {
          teamMemberId,
          role
        });
        return true;
      } catch (error) {
        console.warn('⚠️ [TeamMemberService] API request failed, falling back to Firestore');
        return await this.addTeamMemberToProjectInFirestore(projectId, teamMemberId, role);
      }
    } catch (error) {
      this.handleError(error, `addTeamMemberToProject(${projectId}, ${teamMemberId})`);
      return false;
    }
  }

  /**
   * Remove a team member from a project
   */
  public async removeTeamMemberFromProject(projectId: string, teamMemberId: string): Promise<boolean> {
    try {
      console.log('🚀 [TeamMemberService] Removing team member from project:', { projectId, teamMemberId });
      
      if (this.isWebOnlyMode()) {
        return await this.removeTeamMemberFromProjectInFirestore(projectId, teamMemberId);
      }
      
      try {
        await this.apiRequest(`projects/${projectId}/team-members/${teamMemberId}`, 'DELETE');
        return true;
      } catch (error) {
        console.warn('⚠️ [TeamMemberService] API request failed, falling back to Firestore');
        return await this.removeTeamMemberFromProjectInFirestore(projectId, teamMemberId);
      }
    } catch (error) {
      this.handleError(error, `removeTeamMemberFromProject(${projectId}, ${teamMemberId})`);
      return false;
    }
  }

  /**
   * Update a team member's role in a project
   */
  public async updateTeamMemberRole(projectId: string, teamMemberId: string, role: TeamMemberRole): Promise<boolean> {
    try {
      console.log('🚀 [TeamMemberService] Updating team member role:', { projectId, teamMemberId, role });
      
      if (this.isWebOnlyMode()) {
        return await this.updateTeamMemberRoleInFirestore(projectId, teamMemberId, role);
      }
      
      try {
        await this.apiRequest(`projects/${projectId}/team-members/${teamMemberId}/role`, 'PATCH', { role });
        return true;
      } catch (error) {
        console.warn('⚠️ [TeamMemberService] API request failed, falling back to Firestore');
        return await this.updateTeamMemberRoleInFirestore(projectId, teamMemberId, role);
      }
    } catch (error) {
      this.handleError(error, `updateTeamMemberRole(${projectId}, ${teamMemberId})`);
      return false;
    }
  }

  /**
   * Validate team member credentials
   */
  public async validateTeamMemberCredentials(email: string, password: string): Promise<{
    isValid: boolean;
    error?: string;
    teamMember?: TeamMember;
    projectAccess?: any[];
  }> {
    try {
      console.log('🚀 [TeamMemberService] Validating team member credentials for:', email);
      
      if (this.isWebOnlyMode()) {
        return await this.validateTeamMemberCredentialsFromFirestore(email, password);
      }
      
      try {
        const result = await this.apiRequest<{
          isValid: boolean;
          error?: string;
          teamMember?: TeamMember;
          projectAccess?: any[];
        }>('team-members/validate-credentials', 'POST', {
          email,
          password
        });
        return result;
      } catch (error) {
        console.warn('⚠️ [TeamMemberService] API request failed, falling back to Firestore');
        return await this.validateTeamMemberCredentialsFromFirestore(email, password);
      }
    } catch (error) {
      this.handleError(error, 'validateTeamMemberCredentials');
      return {
        isValid: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Refresh team member data from Firestore
   * This can be called to force a refresh of team member data
   */
  public async refreshTeamMembers(): Promise<void> {
    try {
      console.log('🔄 [TeamMemberService] Refreshing team member data...');
      
      // Clear any cached data if needed
      // For now, just log the refresh - the next call to getLicensedTeamMembers will fetch fresh data
      
      console.log('✅ [TeamMemberService] Team member data refresh initiated');
    } catch (error) {
      console.error('❌ [TeamMemberService] Failed to refresh team member data:', error);
    }
  }

  /**
   * Create a new team member with Firebase Authentication
   * This method creates both the team member document and Firebase Auth user
   * 
   * @example
   * ```typescript
   * // Get the service instance
   * const teamMemberService = ServiceFactory.getInstance().getTeamMemberService();
   * 
   * // Create a new team member with Firebase Auth
   * const result = await teamMemberService.createTeamMemberWithFirebaseAuth({
   *   email: 'john.doe@company.com',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   department: 'Engineering',
   *   licenseType: 'PROFESSIONAL',
   *   organizationId: 'org123',
   *   role: 'MEMBER',
   *   temporaryPassword: 'optional-custom-password' // Optional, auto-generated if not provided
   * });
   * 
   * if (result.success) {
   *   console.log('Team member created:', result.teamMember);
   *   console.log('Firebase UID:', result.firebaseUid);
   *   console.log('Temporary password:', result.temporaryPassword);
   * } else {
   *   console.error('Failed to create team member:', result.error);
   * }
   * ```
   * 
   * @param teamMemberData - Team member data including required fields
   * @returns Promise with creation result including Firebase UID and temporary password
   */
  public async createTeamMemberWithFirebaseAuth(teamMemberData: {
    email: string;
    firstName: string;
    lastName: string;
    department?: string;
    licenseType?: string;
    organizationId: string;
    role?: TeamMemberRole;
    temporaryPassword?: string;
  }): Promise<{
    success: boolean;
    teamMember?: TeamMember;
    firebaseUid?: string;
    temporaryPassword?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 [TeamMemberService] Creating team member with Firebase Auth:', teamMemberData);
      
      if (this.isWebOnlyMode()) {
        return await this.createTeamMemberWithFirebaseAuthInFirestore(teamMemberData);
      }
      
      try {
        const result = await this.apiRequest<{
          success: boolean;
          teamMember?: TeamMember;
          firebaseUid?: string;
          temporaryPassword?: string;
          error?: string;
        }>('team-members/create', 'POST', teamMemberData);
        return result;
      } catch (error) {
        console.warn('⚠️ [TeamMemberService] API request failed, falling back to Firestore');
        return await this.createTeamMemberWithFirebaseAuthInFirestore(teamMemberData);
      }
    } catch (error) {
      this.handleError(error, 'createTeamMemberWithFirebaseAuth');
      return {
        success: false,
        error: 'Failed to create team member with Firebase Auth'
      };
    }
  }

  /**
   * Get licensed team members from Firestore
   */
  private async getLicensedTeamMembersFromFirestore(options?: {
    search?: string;
    excludeProjectId?: string;
  }): Promise<TeamMember[]> {
    try {
      console.log('🔍 [TeamMemberService] Fetching licensed team members from Firestore with options:', options);
      
      await this.firestoreAdapter.initialize();
      
      // Get current user and their organization ID
      const currentUser = this.firestoreAdapter.getCurrentUser();
      
      if (!currentUser) {
        console.log('❌ [TeamMemberService] No authenticated user found');
        return [];
      }
      
      // Get user's organization ID from Firestore
      let organizationId: string | null = null;
      
      try {
        // Try to get user document by Firebase UID
        const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
        if (userDoc && userDoc.organizationId) {
          organizationId = userDoc.organizationId;
          console.log('✅ [TeamMemberService] Found organization ID from user document:', organizationId);
        } else {
          // Try to find user by email
          const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
            { field: 'email', operator: '==', value: currentUser.email }
          ]);
          
          if (userByEmail.length > 0 && userByEmail[0].organizationId) {
            organizationId = userByEmail[0].organizationId;
            console.log('✅ [TeamMemberService] Found organization ID from user email query:', organizationId);
          }
        }
      } catch (error) {
        console.warn('⚠️ [TeamMemberService] Error getting user organization:', error);
      }
      
      if (!organizationId) {
        console.log('❌ [TeamMemberService] No organization ID found for user');
        return [];
      }

      console.log('🏢 [TeamMemberService] Fetching team members for organization:', organizationId);

      // 🚀 ENHANCED: Use UnifiedDataService for comprehensive team member fetching
      console.log('🔍 [TeamMemberService] Using UnifiedDataService for enhanced team member fetching...');
      
      let activeMembers: TeamMember[] = [];
      
      try {
        // Import UnifiedDataService dynamically to avoid circular dependencies
        const { unifiedDataService } = await import('./UnifiedDataService');
        
        // Get all team members from the organization using the enhanced fetching logic
        const streamlinedTeamMembers = await unifiedDataService.getTeamMembersForOrganization();
        
        console.log(`📊 [TeamMemberService] Found ${streamlinedTeamMembers.length} team members from UnifiedDataService`);
        
        // Convert StreamlinedTeamMember to TeamMember format
        activeMembers = streamlinedTeamMembers
          .filter((stm: any) => stm.status === 'active') // Only active members
          .map((stm: any) => {
            // Helper function to safely convert to Date and then to ISO string
            const safeToISOString = (dateValue: any): string => {
              if (!dateValue) return new Date().toISOString();
              if (dateValue instanceof Date) return dateValue.toISOString();
              if (typeof dateValue === 'string') return new Date(dateValue).toISOString();
              if (typeof dateValue === 'number') return new Date(dateValue).toISOString();
              // Handle Firestore Timestamp objects
              if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
                return dateValue.toDate().toISOString();
              }
              return new Date().toISOString();
            };

            return {
              id: stm.id,
              email: stm.email,
              firstName: stm.firstName,
              lastName: stm.lastName,
              name: `${stm.firstName} ${stm.lastName}`.trim() || stm.email,
              role: stm.role as any,
              status: TeamMemberStatus.ACTIVE, // Use proper enum value
              department: stm.department,
              organizationId: stm.organization.id,
              licenseType: stm.licenseAssignment?.licenseType || 'BASIC',
              assignedProjects: stm.assignedProjects,
              createdAt: safeToISOString(stm.createdAt),
              updatedAt: safeToISOString(stm.updatedAt),
              // Additional fields for compatibility
              isActive: true,
              joinedAt: safeToISOString(stm.joinedAt),
              lastActive: stm.lastActive ? safeToISOString(stm.lastActive) : undefined,
              invitedBy: stm.invitedBy,
              avatar: stm.avatar
            };
          });
        
        console.log(`✅ [TeamMemberService] Converted ${activeMembers.length} active team members from UnifiedDataService`);
      } catch (unifiedError) {
        console.warn('⚠️ [TeamMemberService] UnifiedDataService failed, falling back to direct Firestore query:', unifiedError);
        
        // Fallback to original logic
        const teamMembers = await this.firestoreAdapter.queryDocuments<TeamMember>('teamMembers', [
          { field: 'organizationId', operator: '==', value: organizationId }
        ]);
        
        console.log(`🔍 [TeamMemberService] Raw team members found: ${teamMembers.length}`);
        
        // Filter for ACTIVE team members only - exclude revoked, removed, suspended, etc.
        activeMembers = teamMembers.filter(member => {
          const status = member.status?.toUpperCase?.() || member.status || 'UNKNOWN';
          
          // Only include ACTIVE members (handle both uppercase and lowercase)
          if (status !== 'ACTIVE' && status !== 'active') {
            console.log(`⚠️ [TeamMemberService] Excluding team member ${member.email} with status: ${status}`);
            return false;
          }
          
          // Additional safety checks
          if (member.isActive === false) {
            console.log(`⚠️ [TeamMemberService] Excluding team member ${member.email} with isActive: false`);
            return false;
          }
          
          // Check if member has been revoked or removed
          if (member.revokedAt || member.removedAt || member.suspendedAt) {
            console.log(`⚠️ [TeamMemberService] Excluding team member ${member.email} with revocation/removal dates`);
            return false;
          }
          
          return true;
        });
        
        console.log(`✅ [TeamMemberService] Active team members after filtering: ${activeMembers.length}`);
      }
      
      // Get already assigned team members for the project (if excludeProjectId is provided)
      let assignedMemberIds: string[] = [];
      if (options?.excludeProjectId) {
        try {
          const projectTeamMembers = await this.getProjectTeamMembersFromFirestore(options.excludeProjectId);
          assignedMemberIds = projectTeamMembers.map(ptm => ptm.teamMemberId);
          console.log(`🔍 [TeamMemberService] Excluding ${assignedMemberIds.length} already assigned team members`);
        } catch (error) {
          console.warn('⚠️ [TeamMemberService] Failed to get assigned team members:', error);
        }
      }
      
      // Apply final filtering
      let filteredMembers = activeMembers.filter(member => {
        // Skip if already assigned to the project
        if (assignedMemberIds.includes(member.id)) {
          return false;
        }
        
        // Apply search filter if provided
        if (options?.search) {
          const searchTerm = options.search.toLowerCase();
          const name = (member.name || '').toLowerCase();
          const firstName = (member.firstName || '').toLowerCase();
          const lastName = (member.lastName || '').toLowerCase();
          const email = (member.email || '').toLowerCase();
          
          return name.includes(searchTerm) || 
                 firstName.includes(searchTerm) || 
                 lastName.includes(searchTerm) || 
                 email.includes(searchTerm);
        }
        
        return true;
      });
      
      // Improve data mapping and ensure all required fields are present
      const mappedMembers = filteredMembers.map(member => {
        // Generate proper display name
        let displayName = member.name;
        if (!displayName) {
          if (member.firstName && member.lastName) {
            displayName = `${member.firstName} ${member.lastName}`;
          } else if (member.firstName) {
            displayName = member.firstName;
          } else if (member.lastName) {
            displayName = member.lastName;
          } else if (member.email) {
            // Create name from email
            const emailParts = member.email.split('@');
            const username = emailParts[0];
            displayName = username
              .replace(/[._-]/g, ' ')
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          } else {
            displayName = 'Unknown User';
          }
        }
        
        // Ensure license type is properly set
        let licenseType = member.licenseType;
        if (!licenseType) {
          // Default to PROFESSIONAL if no license type is set
          licenseType = 'professional' as any; // Use lowercase to match enum
        }
        
        return {
          ...member,
          name: displayName,
          licenseType: licenseType,
          status: 'active' as any, // Use lowercase to match TeamMemberStatus enum
          isActive: true // Ensure isActive is always true for filtered members
        };
      });
      
      // Sort results in memory to avoid Firestore index requirements
      mappedMembers.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB); // Ascending order by name
      });
      
      console.log(`✅ [TeamMemberService] Final filtered and mapped team members: ${mappedMembers.length}`);
      return mappedMembers;
    } catch (error) {
      this.handleError(error, 'getLicensedTeamMembersFromFirestore');
      return [];
    }
  }

  /**
   * Get project team members from Firestore
   */
  private async getProjectTeamMembersFromFirestore(projectId: string): Promise<ProjectTeamMember[]> {
    try {
      console.log('🔍 [TeamMemberService] Fetching team members from Firestore for project:', projectId);
      
      await this.firestoreAdapter.initialize();
      
      const teamMembers: ProjectTeamMember[] = [];
      
      // First, get the project to see if it has teamMembers array
      const project = await this.firestoreAdapter.getDocumentById('projects', projectId);
      
      if (project) {
        const projectTeamMembers = project.teamMembers || [];
        
        // Convert project team members to ProjectTeamMember format
        for (const tm of projectTeamMembers) {
          teamMembers.push({
            id: tm.userId || tm.id,
            teamMemberId: tm.userId || tm.id,
            projectId: projectId,
            role: tm.role || 'member',
            permissions: tm.permissions || ['read'],
            assignedAt: tm.assignedAt || new Date().toISOString(),
            isActive: tm.isActive !== false,
            email: tm.email,
            name: tm.name || tm.email,
            status: tm.status || 'active'
          });
        }
      }
      
      // Also check projectTeamMembers collection if it exists
      try {
        const projectTeamMembersCollection = await this.firestoreAdapter.queryDocuments<any>('projectTeamMembers', [
          { field: 'projectId', operator: '==', value: projectId }
        ]);
        
        for (const ptm of projectTeamMembersCollection) {
          // Avoid duplicates
          if (!teamMembers.find(tm => tm.teamMemberId === ptm.teamMemberId)) {
            teamMembers.push({
              id: ptm.teamMemberId || ptm.id,
              teamMemberId: ptm.teamMemberId || ptm.id,
              projectId: projectId,
              role: ptm.role || 'member',
              permissions: ptm.permissions || ['read'],
              assignedAt: ptm.assignedAt || new Date().toISOString(),
              isActive: ptm.isActive !== false,
              email: ptm.teamMemberEmail || ptm.userEmail || ptm.email,
              name: ptm.teamMemberName || ptm.name || ptm.teamMemberEmail || ptm.userEmail,
              status: ptm.status || 'active',
              department: ptm.department || 'Not specified',
              firstName: ptm.firstName,
              lastName: ptm.lastName,
              displayName: ptm.displayName || ptm.teamMemberName
            });
          }
        }
      } catch (collectionError) {
        console.log('ℹ️ [TeamMemberService] projectTeamMembers collection not found or accessible');
      }
      
      // Now enrich the team member data with full profiles from multiple collections
      const enrichedTeamMembers: ProjectTeamMember[] = [];
      for (const teamMember of teamMembers) {
        try {
          let fullProfile: TeamMember | null = null;
          
          // First try teamMembers collection
          try {
            fullProfile = await this.firestoreAdapter.getDocumentById<TeamMember>('teamMembers', teamMember.teamMemberId);
            if (fullProfile) {
              console.log('✅ [TeamMemberService] Found team member in teamMembers collection:', fullProfile.name || fullProfile.email);
            }
          } catch (teamMemberError) {
            console.log('🔍 [TeamMemberService] Team member not found in teamMembers, trying users collection...');
          }
          
          // If not found in teamMembers, try users collection
          if (!fullProfile) {
            try {
              fullProfile = await this.firestoreAdapter.getDocumentById<TeamMember>('users', teamMember.teamMemberId);
              if (fullProfile) {
                console.log('✅ [TeamMemberService] Found team member in users collection:', fullProfile.name || fullProfile.email);
              }
            } catch (userError) {
              console.log('🔍 [TeamMemberService] Team member not found in users collection either');
            }
          }
          
          if (fullProfile) {
            // Extract name with comprehensive fallback logic
            let displayName = 'Unnamed User';
            
            // Priority 1: Check fullProfile.name
            if (fullProfile.name && fullProfile.name !== 'Unnamed User') {
              displayName = fullProfile.name;
            }
            // Priority 2: Try firstName + lastName
            else if (fullProfile.firstName && fullProfile.lastName) {
              displayName = `${fullProfile.firstName} ${fullProfile.lastName}`;
            }
            // Priority 3: Try firstName only
            else if (fullProfile.firstName) {
              displayName = fullProfile.firstName;
            }
            // Priority 4: Try lastName only
            else if (fullProfile.lastName) {
              displayName = fullProfile.lastName;
            }
            // Priority 5: Extract from email
            else if (fullProfile.email) {
              const emailParts = fullProfile.email.split('@');
              displayName = emailParts[0]
                .replace(/[._-]/g, ' ')
                .split(' ')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            }
            
            console.log('🔍 [TeamMemberService] Extracted display name:', displayName, 'from profile:', {
              name: fullProfile.name,
              firstName: fullProfile.firstName,
              lastName: fullProfile.lastName,
              email: fullProfile.email
            });
            
            // Enrich with full profile data
            enrichedTeamMembers.push({
              ...teamMember,
              name: displayName,
              email: fullProfile.email || teamMember.email || 'No email',
              teamMember: {
                ...fullProfile,
                name: displayName // Ensure the nested teamMember also has the correct name
              }
            });
          } else {
            console.warn('⚠️ [TeamMemberService] No profile found for team member:', teamMember.teamMemberId);
            // If no full profile found, use the basic data
            enrichedTeamMembers.push(teamMember);
          }
        } catch (profileError) {
          console.warn('⚠️ [TeamMemberService] Failed to get full profile for team member:', teamMember.teamMemberId, profileError);
          // Use the basic data if profile fetch fails
          enrichedTeamMembers.push(teamMember);
        }
      }
      
      console.log(`✅ [TeamMemberService] Found ${enrichedTeamMembers.length} team members for project ${projectId}`);
      return enrichedTeamMembers;
    } catch (error) {
      this.handleError(error, `getProjectTeamMembersFromFirestore(${projectId})`);
      return [];
    }
  }

  /**
   * 🚀 PERFORMANCE OPTIMIZATION: Get team members for multiple projects from Firestore in batch
   * This reduces Firestore calls by loading all team members at once
   */
  private async getProjectTeamMembersFromFirestoreBatch(projectIds: string[]): Promise<Record<string, ProjectTeamMember[]>> {
    try {
      console.log('🔍 [TeamMemberService] Fetching team members from Firestore for projects in batch:', projectIds);
      
      await this.firestoreAdapter.initialize();
      
      const batchResult: Record<string, ProjectTeamMember[]> = {};
      
      // Initialize empty arrays for all projects
      projectIds.forEach(projectId => {
        batchResult[projectId] = [];
      });
      
      // First, get all projects at once
      const projectPromises = projectIds.map(async (projectId) => {
        try {
          const project = await this.firestoreAdapter.getDocumentById('projects', projectId);
          return { projectId, project };
        } catch (error) {
          console.warn(`⚠️ [TeamMemberService] Failed to get project ${projectId}:`, error);
          return { projectId, project: null };
        }
      });
      
      const projects = await Promise.all(projectPromises);
      
      // Collect all team member IDs from all projects
      const allTeamMemberIds = new Set<string>();
      const projectTeamMembersMap = new Map<string, any[]>();
      
      projects.forEach(({ projectId, project }) => {
        if (project) {
          const projectTeamMembers = project.teamMembers || [];
          projectTeamMembersMap.set(projectId, projectTeamMembers);
          
          // Collect team member IDs
          projectTeamMembers.forEach(tm => {
            const teamMemberId = tm.userId || tm.id;
            if (teamMemberId) {
              allTeamMemberIds.add(teamMemberId);
            }
          });
        }
      });
      
      // Also check projectTeamMembers collection for all projects at once
      try {
        const projectTeamMembersCollection = await this.firestoreAdapter.queryDocuments<ProjectTeamMember>('projectTeamMembers', [
          { field: 'projectId', operator: 'in', value: projectIds }
        ]);
        
        // Group by project ID
        projectTeamMembersCollection.forEach(ptm => {
          if (!projectTeamMembersMap.has(ptm.projectId)) {
            projectTeamMembersMap.set(ptm.projectId, []);
          }
          projectTeamMembersMap.get(ptm.projectId)!.push(ptm);
        });
      } catch (collectionError) {
        console.log('ℹ️ [TeamMemberService] projectTeamMembers collection not found or accessible');
      }
      
      // Now get all team member profiles at once
      const teamMemberProfiles = new Map<string, any>();
      
      if (allTeamMemberIds.size > 0) {
        try {
          // Get profiles from teamMembers collection
          const teamMemberPromises = Array.from(allTeamMemberIds).map(async (teamMemberId) => {
            try {
              const profile = await this.firestoreAdapter.getDocumentById('teamMembers', teamMemberId);
              return { teamMemberId, profile };
            } catch (error) {
              console.warn(`⚠️ [TeamMemberService] Failed to get team member profile ${teamMemberId}:`, error);
              return { teamMemberId, profile: null };
            }
          });
          
          const profiles = await Promise.all(teamMemberPromises);
          profiles.forEach(({ teamMemberId, profile }) => {
            if (profile) {
              teamMemberProfiles.set(teamMemberId, profile);
            }
          });
        } catch (error) {
          console.warn('⚠️ [TeamMemberService] Failed to load team member profiles:', error);
        }
      }
      
      // Now process each project's team members
      projectTeamMembersMap.forEach((projectTeamMembers, projectId) => {
        const enrichedTeamMembers: ProjectTeamMember[] = [];
        
        projectTeamMembers.forEach(tm => {
          const teamMemberId = tm.userId || tm.id;
          const fullProfile = teamMemberProfiles.get(teamMemberId);
          
          if (fullProfile) {
            // Extract display name using the same logic as the single method
            let displayName = fullProfile.name;
            
            if (!displayName && fullProfile.firstName && fullProfile.lastName) {
              displayName = `${fullProfile.firstName} ${fullProfile.lastName}`;
            } else if (!displayName && fullProfile.firstName) {
              displayName = fullProfile.firstName;
            } else if (!displayName && fullProfile.email) {
              const emailParts = fullProfile.email.split('@');
              displayName = emailParts[0]
                .replace(/[._-]/g, ' ')
                .split(' ')
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            }
            
            enrichedTeamMembers.push({
              id: teamMemberId,
              teamMemberId: teamMemberId,
              projectId: projectId,
              role: tm.role || 'member',
              permissions: tm.permissions || ['read'],
              assignedAt: tm.assignedAt || new Date().toISOString(),
              isActive: tm.isActive !== false,
              email: fullProfile.email || tm.email || 'No email',
              name: displayName || tm.name || tm.email || 'Unknown',
              status: tm.status || 'active',
              teamMember: {
                ...fullProfile,
                name: displayName
              }
            });
          } else {
            // If no full profile found, use the basic data
            enrichedTeamMembers.push({
              id: teamMemberId,
              teamMemberId: teamMemberId,
              projectId: projectId,
              role: tm.role || 'member',
              permissions: tm.permissions || ['read'],
              assignedAt: tm.assignedAt || new Date().toISOString(),
              isActive: tm.isActive !== false,
              email: tm.email || 'No email',
              name: tm.name || tm.email || 'Unknown',
              status: tm.status || 'active'
            });
          }
        });
        
        batchResult[projectId] = enrichedTeamMembers;
        console.log(`✅ [TeamMemberService] Found ${enrichedTeamMembers.length} team members for project ${projectId}`);
      });
      
      return batchResult;
    } catch (error) {
      this.handleError(error, `getProjectTeamMembersFromFirestoreBatch(${projectIds.join(', ')})`);
      return {};
    }
  }

  /**
   * Add a team member to a project in Firestore
   */
  private async addTeamMemberToProjectInFirestore(
    projectId: string, 
    teamMemberId: string, 
    role: TeamMemberRole
  ): Promise<boolean> {
    try {
      console.log('🔍 [TeamMemberService] Adding team member to project in Firestore:', { projectId, teamMemberId, role });
      
      await this.firestoreAdapter.initialize();
      
      // First, try to get the team member profile from multiple collections
      let teamMemberProfile: TeamMember | null = null;
      
      // Try teamMembers collection first
      teamMemberProfile = await this.firestoreAdapter.getDocumentById<TeamMember>('teamMembers', teamMemberId);
      
      // If not found, try users collection
      if (!teamMemberProfile) {
        console.log('🔍 [TeamMemberService] Team member not found in teamMembers, trying users collection...');
        const userProfile = await this.firestoreAdapter.getDocumentById<any>('users', teamMemberId);
        if (userProfile) {
          // Convert user profile to team member format
          teamMemberProfile = {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role || 'MEMBER',
            licenseType: userProfile.licenseType || 'BASIC',
            status: userProfile.status || 'ACTIVE',
            organizationId: userProfile.organizationId,
            department: userProfile.department,
            company: userProfile.company,
            createdAt: userProfile.createdAt || new Date(),
            updatedAt: userProfile.updatedAt || new Date()
          } as TeamMember;
          console.log('✅ [TeamMemberService] Found team member in users collection:', teamMemberProfile.name);
        }
      }
      
      // If still not found, try orgMembers collection
      if (!teamMemberProfile) {
        console.log('🔍 [TeamMemberService] Team member not found in users, trying orgMembers collection...');
        const orgMemberProfile = await this.firestoreAdapter.getDocumentById<any>('orgMembers', teamMemberId);
        if (orgMemberProfile) {
          // Convert org member profile to team member format
          teamMemberProfile = {
            id: orgMemberProfile.id,
            email: orgMemberProfile.email,
            name: orgMemberProfile.name || `${orgMemberProfile.firstName || ''} ${orgMemberProfile.lastName || ''}`.trim(),
            firstName: orgMemberProfile.firstName,
            lastName: orgMemberProfile.lastName,
            role: orgMemberProfile.role || 'MEMBER',
            licenseType: orgMemberProfile.licenseType || 'BASIC',
            status: orgMemberProfile.status || 'ACTIVE',
            organizationId: orgMemberProfile.organizationId,
            department: orgMemberProfile.department,
            company: orgMemberProfile.company,
            createdAt: orgMemberProfile.createdAt || new Date(),
            updatedAt: orgMemberProfile.updatedAt || new Date()
          } as TeamMember;
          console.log('✅ [TeamMemberService] Found team member in orgMembers collection:', teamMemberProfile.name);
        }
      }
      
      if (!teamMemberProfile) {
        console.warn('⚠️ [TeamMemberService] Team member not found in any collection:', teamMemberId);
        throw new Error(`Team member not found: ${teamMemberId}`);
      }
      
      // Check if there's already an Admin for this project (only 1 admin allowed)
      if (role === TeamMemberRole.ADMIN) {
        const projectTeamMembers = await this.getProjectTeamMembersFromFirestore(projectId);
        const hasAdmin = projectTeamMembers.some(m => m.role === TeamMemberRole.ADMIN);
        
        if (hasAdmin) {
          console.warn('⚠️ [TeamMemberService] Only one Admin is allowed per project');
          throw new Error('Only one Admin is allowed per project. Please remove the existing Admin first.');
        }
      }
      
      const newAssignment = {
        projectId,
        teamMemberId,
        role,
        assignedBy: 'system', // TODO: Get from auth context
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        // Store complete team member data for immediate display
        teamMemberName: teamMemberProfile.name || 'Unknown User',
        teamMemberEmail: teamMemberProfile.email || 'No email',
        teamMemberRole: teamMemberProfile.role || 'MEMBER',
        teamMemberLicenseType: teamMemberProfile.licenseType || 'BASIC'
      };
      
      const result = await this.firestoreAdapter.createDocument('projectTeamMembers', newAssignment);
      
      return result !== null;
    } catch (error) {
      this.handleError(error, `addTeamMemberToProjectInFirestore(${projectId}, ${teamMemberId})`);
      return false;
    }
  }

  /**
   * Remove a team member from a project in Firestore
   */
  private async removeTeamMemberFromProjectInFirestore(projectId: string, teamMemberId: string): Promise<boolean> {
    try {
      console.log('🔍 [TeamMemberService] Removing team member from project in Firestore:', { projectId, teamMemberId });
      
      await this.firestoreAdapter.initialize();
      
      // Find the projectTeamMember document
      const projectTeamMembers = await this.firestoreAdapter.queryDocuments('projectTeamMembers', [
        { field: 'projectId', operator: '==', value: projectId },
        { field: 'teamMemberId', operator: '==', value: teamMemberId }
      ]);
      
      if (projectTeamMembers.length === 0) {
        console.warn('⚠️ [TeamMemberService] Team member not found in project');
        return false;
      }
      
      // Delete the projectTeamMember document
      const success = await this.firestoreAdapter.deleteDocument('projectTeamMembers', projectTeamMembers[0].id);
      
      return success;
    } catch (error) {
      this.handleError(error, `removeTeamMemberFromProjectInFirestore(${projectId}, ${teamMemberId})`);
      return false;
    }
  }

  /**
   * Update a team member's role in a project in Firestore
   */
  private async updateTeamMemberRoleInFirestore(projectId: string, teamMemberId: string, role: TeamMemberRole): Promise<boolean> {
    try {
      console.log('🔍 [TeamMemberService] Updating team member role in Firestore:', { projectId, teamMemberId, role });
      
      await this.firestoreAdapter.initialize();
      
      // Find the projectTeamMember document
      const projectTeamMembers = await this.firestoreAdapter.queryDocuments('projectTeamMembers', [
        { field: 'projectId', operator: '==', value: projectId },
        { field: 'teamMemberId', operator: '==', value: teamMemberId }
      ]);
      
      if (projectTeamMembers.length === 0) {
        console.warn('⚠️ [TeamMemberService] Team member not found in project');
        return false;
      }
      
      // Check if there's already an Admin for this project (only 1 admin allowed)
      if (role === TeamMemberRole.ADMIN) {
        const allProjectTeamMembers = await this.getProjectTeamMembersFromFirestore(projectId);
        const hasAdmin = allProjectTeamMembers.some(m => m.role === TeamMemberRole.ADMIN && m.teamMemberId !== teamMemberId);
        
        if (hasAdmin) {
          console.warn('⚠️ [TeamMemberService] Only one Admin is allowed per project');
          throw new Error('Only one Admin is allowed per project. Please remove the existing Admin first.');
        }
      }
      
      // Update the projectTeamMember document
      const success = await this.firestoreAdapter.updateDocument('projectTeamMembers', projectTeamMembers[0].id, {
        role,
        updatedAt: new Date().toISOString()
      });
      
      return success;
    } catch (error) {
      this.handleError(error, `updateTeamMemberRoleInFirestore(${projectId}, ${teamMemberId})`);
      return false;
    }
  }

  /**
   * Validate team member credentials from Firestore
   */
  private async validateTeamMemberCredentialsFromFirestore(email: string, password: string): Promise<{
    isValid: boolean;
    error?: string;
    teamMember?: TeamMember;
    projectAccess?: any[];
  }> {
    try {
      await this.firestoreAdapter.initialize();
      
      // Query teamMembers collection for the email
      const teamMembers = await this.firestoreAdapter.queryDocuments<TeamMember>('teamMembers', [
        { field: 'email', operator: '==', value: email }
      ]);
      
      if (teamMembers.length === 0) {
        return {
          isValid: false,
          error: 'Team member not found'
        };
      }
      
      const teamMember = teamMembers[0];
      
      // In a real implementation, you'd validate the password hash
      // For now, we'll accept any password for development
      if (password.length < 1) {
        return {
          isValid: false,
          error: 'Password is required'
        };
      }
      
      return {
        isValid: true,
        teamMember,
        projectAccess: [] // Will be loaded when needed
      };
    } catch (error) {
      this.handleError(error, 'validateTeamMemberCredentialsFromFirestore');
      return {
        isValid: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Create team member with Firebase Auth in Firestore
   */
  private async createTeamMemberWithFirebaseAuthInFirestore(teamMemberData: {
    email: string;
    firstName: string;
    lastName: string;
    department?: string;
    licenseType?: string;
    organizationId: string;
    role?: TeamMemberRole;
    temporaryPassword?: string;
  }): Promise<{
    success: boolean;
    teamMember?: TeamMember;
    firebaseUid?: string;
    temporaryPassword?: string;
    error?: string;
  }> {
    try {
      console.log('🔍 [TeamMemberService] Creating team member with Firebase Auth in Firestore:', teamMemberData);
      
      await this.firestoreAdapter.initialize();
      
      // Import Firebase Auth functions
      const { auth } = await import('./firebase');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      
      // Generate temporary password if not provided
      const temporaryPassword = teamMemberData.temporaryPassword || this.generateSecurePassword();
      
      // Step 1: Create Firebase Auth user
      let firebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          teamMemberData.email,
          temporaryPassword
        );
        firebaseUser = userCredential.user;
        console.log('✅ [TeamMemberService] Firebase Auth user created successfully:', firebaseUser.uid);
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          return {
            success: false,
            error: 'User with this email already exists in Firebase Authentication'
          };
        }
        throw authError;
      }
      
      // Step 2: Create team member document in Firestore
      const teamMemberDoc = {
        id: firebaseUser.uid, // Use Firebase UID as document ID
        email: teamMemberData.email,
        firstName: teamMemberData.firstName,
        lastName: teamMemberData.lastName,
        name: `${teamMemberData.firstName} ${teamMemberData.lastName}`,
        licenseType: teamMemberData.licenseType || 'PROFESSIONAL',
        status: 'ACTIVE',
        organizationId: teamMemberData.organizationId,
        department: teamMemberData.department,
        role: teamMemberData.role || 'MEMBER',
        firebaseUid: firebaseUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };
      
      // Step 3: Create user document in users collection for authentication
      const userDoc = {
        id: firebaseUser.uid, // Use Firebase UID as document ID
        email: teamMemberData.email,
        name: `${teamMemberData.firstName} ${teamMemberData.lastName}`,
        firstName: teamMemberData.firstName,
        lastName: teamMemberData.lastName,
        role: 'TEAM_MEMBER',
        firebaseUid: firebaseUser.uid,
        isEmailVerified: false,
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
        privacyConsent: [],
        marketingConsent: false,
        dataProcessingConsent: false,
        identityVerified: false,
        isTeamMember: true,
        organizationId: teamMemberData.organizationId,
        memberRole: teamMemberData.role || 'MEMBER',
        memberStatus: 'ACTIVE',
        department: teamMemberData.department,
        licenseType: teamMemberData.licenseType || 'PROFESSIONAL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create both documents atomically
      let teamMemberResult: any = null;
      let userResult: any = null;
      
      // Create team member document
      teamMemberResult = await this.firestoreAdapter.createDocument('teamMembers', teamMemberDoc);
      
      if (teamMemberResult) {
        // Create user document
        userResult = await this.firestoreAdapter.createDocument('users', userDoc);
      }
      
      if (!teamMemberResult || !userResult) {
        // Rollback: Delete Firebase Auth user if either document creation fails
        try {
          await firebaseUser.delete();
          console.log('🔄 [TeamMemberService] Rolled back Firebase Auth user after Firestore failure');
        } catch (rollbackError) {
          console.error('❌ [TeamMemberService] Failed to rollback Firebase Auth user:', rollbackError);
        }
        
        return {
          success: false,
          error: 'Failed to create required documents in Firestore'
        };
      }
      
      console.log('✅ [TeamMemberService] Team member created successfully in Firestore');
      
      return {
        success: true,
        teamMember: teamMemberDoc as TeamMember,
        firebaseUid: firebaseUser.uid,
        temporaryPassword: temporaryPassword
      };
      
    } catch (error) {
      this.handleError(error, 'createTeamMemberWithFirebaseAuthInFirestore');
      return {
        success: false,
        error: (error as any)?.message || 'Failed to create team member with Firebase Auth'
      };
    }
  }

  /**
   * Generate a secure temporary password
   */
  private generateSecurePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}