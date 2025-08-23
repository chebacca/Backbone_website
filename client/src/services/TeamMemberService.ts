/**
 * TeamMemberService - Handles all team member-related operations
 */
import { BaseService } from './base/BaseService';
import { ProjectTeamMember, ServiceConfig, TeamMember, TeamMemberRole } from './models/types';

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
   * Add a team member to a project with a specific role
   */
  public async addTeamMemberToProject(
    projectId: string, 
    teamMemberId: string, 
    role: TeamMemberRole = TeamMemberRole.DO_ER
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
   * Get licensed team members from Firestore
   */
  private async getLicensedTeamMembersFromFirestore(options?: {
    search?: string;
    excludeProjectId?: string;
  }): Promise<TeamMember[]> {
    try {
      console.log('🔍 [TeamMemberService] Fetching licensed team members from Firestore with options:', options);
      
      await this.firestoreAdapter.initialize();
      const currentUser = this.firestoreAdapter.getCurrentUser();
      
      if (!currentUser) {
        console.warn('⚠️ [TeamMemberService] No authenticated user for team members fetch');
        return [];
      }

      // Get current user's organization ID
      const users = await this.firestoreAdapter.queryDocuments('users', [
        { field: 'uid', operator: '==', value: currentUser.uid }
      ]);
      
      const organizationId = users[0]?.organizationId || this.config.organizationId;
      
      if (!organizationId) {
        console.warn('⚠️ [TeamMemberService] No organization ID found for current user');
        return [];
      }

      console.log('🏢 [TeamMemberService] Fetching team members for organization:', organizationId);

      // Query team members for the organization
      const teamMembers = await this.firestoreAdapter.queryDocuments<TeamMember>('teamMembers', [
        { field: 'organizationId', operator: '==', value: organizationId }
      ]);
      
      // Get already assigned team members for the project (if excludeProjectId is provided)
      let assignedMemberIds: string[] = [];
      if (options?.excludeProjectId) {
        try {
          const projectTeamMembers = await this.getProjectTeamMembersFromFirestore(options.excludeProjectId);
          assignedMemberIds = projectTeamMembers.map(ptm => ptm.teamMemberId);
        } catch (error) {
          console.warn('Failed to get assigned team members:', error);
        }
      }
      
      // Filter team members
      let filteredMembers = teamMembers.filter(member => {
        // Skip if already assigned to the project
        if (assignedMemberIds.includes(member.id)) {
          return false;
        }
        
        // Apply search filter if provided
        if (options?.search) {
          const searchTerm = options.search.toLowerCase();
          const name = (member.name || '').toLowerCase();
          const email = (member.email || '').toLowerCase();
          
          return name.includes(searchTerm) || email.includes(searchTerm);
        }
        
        return true;
      });
      
      // Sort results in memory to avoid Firestore index requirements
      filteredMembers.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB); // Ascending order by name
      });
      
      console.log(`✅ [TeamMemberService] Found ${filteredMembers.length} licensed team members`);
      return filteredMembers;
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
        const projectTeamMembersCollection = await this.firestoreAdapter.queryDocuments<ProjectTeamMember>('projectTeamMembers', [
          { field: 'projectId', operator: '==', value: projectId }
        ]);
        
        for (const ptm of projectTeamMembersCollection) {
          // Avoid duplicates
          if (!teamMembers.find(tm => tm.teamMemberId === ptm.teamMemberId)) {
            teamMembers.push(ptm);
          }
        }
      } catch (collectionError) {
        console.log('ℹ️ [TeamMemberService] projectTeamMembers collection not found or accessible');
      }
      
      // Now enrich the team member data with full profiles from the teamMembers collection
      const enrichedTeamMembers: ProjectTeamMember[] = [];
      for (const teamMember of teamMembers) {
        try {
          // Get the full team member profile from Firestore
          const fullProfile = await this.firestoreAdapter.getDocumentById<TeamMember>('teamMembers', teamMember.teamMemberId);
          
          if (fullProfile) {
            // Enrich with full profile data
            enrichedTeamMembers.push({
              ...teamMember,
              name: fullProfile.name || fullProfile.email || teamMember.name || 'Unnamed User',
              email: fullProfile.email || teamMember.email || 'No email',
              teamMember: fullProfile
            });
          } else {
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
      
      // First, get the full team member profile to store complete data
      const teamMemberProfile = await this.firestoreAdapter.getDocumentById<TeamMember>('teamMembers', teamMemberId);
      
      if (!teamMemberProfile) {
        console.warn('⚠️ [TeamMemberService] Team member not found:', teamMemberId);
        return false;
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
}
