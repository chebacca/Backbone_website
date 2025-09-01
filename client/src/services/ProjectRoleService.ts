/**
 * Service for managing project-specific roles
 */

export interface ProjectRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  hierarchy: number;
  baseRole: string;
  isDefault: boolean;
}

export class ProjectRoleService {
  private static instance: ProjectRoleService;
  private baseUrl = 'https://us-central1-backbone-logic.cloudfunctions.net/api';

  public static getInstance(): ProjectRoleService {
    if (!ProjectRoleService.instance) {
      ProjectRoleService.instance = new ProjectRoleService();
    }
    return ProjectRoleService.instance;
  }

  /**
   * Get available roles for team member assignment
   */
  public async getAvailableRoles(projectId: string): Promise<ProjectRole[]> {
    try {
      console.log(`🎭 [ProjectRoleService] Fetching available roles for project: ${projectId}`);
      
      // Wait for Firebase to be ready with retry logic
      let retries = 0;
      const maxRetries = 10;
      let token: string | undefined;
      
      while (retries < maxRetries) {
        const auth = (window as any).firebase?.auth();
        const currentUser = auth?.currentUser;
        
        if (currentUser) {
          token = await currentUser.getIdToken();
          break;
        }
        
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (!token) {
        throw new Error('User not authenticated - Firebase not ready');
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/available-roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch available roles');
      }
      
      const data = await response.json();
      console.log(`✅ [ProjectRoleService] Fetched ${data.data?.length || 0} available roles`);
      
      return data.data || [];
    } catch (error) {
      console.error('❌ [ProjectRoleService] Error fetching available roles:', error);
      throw error;
    }
  }

  /**
   * Add team member to project with role
   */
  public async addTeamMemberToProject(
    projectId: string, 
    teamMemberId: string, 
    roleId?: string
  ): Promise<void> {
    try {
      console.log(`🎭 [ProjectRoleService] Adding team member ${teamMemberId} to project ${projectId} with role ${roleId}`);
      
      // Wait for Firebase to be ready with retry logic
      let retries = 0;
      const maxRetries = 10;
      let token: string | undefined;
      
      while (retries < maxRetries) {
        const auth = (window as any).firebase?.auth();
        const currentUser = auth?.currentUser;
        
        if (currentUser) {
          token = await currentUser.getIdToken();
          break;
        }
        
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (!token) {
        throw new Error('User not authenticated - Firebase not ready');
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/team-members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamMemberId,
          roleId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add team member to project');
      }
      
      const data = await response.json();
      console.log(`✅ [ProjectRoleService] Successfully added team member to project:`, data);
    } catch (error) {
      console.error('❌ [ProjectRoleService] Error adding team member to project:', error);
      throw error;
    }
  }

  /**
   * Get role display color based on category
   */
  public getRoleDisplayColor(category: string): string {
    const colorMap: Record<string, string> = {
      'ADMINISTRATIVE': '#ef4444', // red
      'PRODUCTION': '#3b82f6', // blue
      'EDITORIAL': '#10b981', // emerald
      'TECHNICAL': '#f59e0b', // amber
      'CREATIVE': '#8b5cf6', // violet
      'MANAGEMENT': '#f97316', // orange
      'default': '#6b7280' // gray
    };
    
    return colorMap[category] || colorMap.default;
  }

  /**
   * Format role description with hierarchy info
   */
  public formatRoleDescription(role: ProjectRole): string {
    const hierarchyText = role.hierarchy >= 80 ? 'High-level' : 
                         role.hierarchy >= 50 ? 'Mid-level' : 'Entry-level';
    
    return `${role.description} (${hierarchyText} - ${role.hierarchy})`;
  }
}

export const projectRoleService = ProjectRoleService.getInstance();
