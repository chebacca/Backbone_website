import { auth } from './firebase';

interface RolePreset {
  name: string;
  roles: string[];
  description: string;
  category: string;
}

interface ValidationResponse {
  success: boolean;
  data?: {
    isValid: boolean;
    baseRole: string;
    productionRoles: string[];
    message: string;
  };
  error?: string;
}

interface PermissionPreview {
  success: boolean;
  data?: {
    baseRole: string;
    productionRoles: string[];
    permissions: {
      project: {
        canAccessProject: boolean;
        canModifyProject: boolean;
        canManageTeam: boolean;
        canDeleteProject: boolean;
      };
      production: {
        canEditVideo: boolean;
        canManageQC: boolean;
        canManageAudio: boolean;
        canManageGraphics: boolean;
        canCoordinate: boolean;
      };
    };
    effectiveLevel: number;
  };
  error?: string;
}

interface RoleAssignmentResponse {
  success: boolean;
  data?: {
    projectId: string;
    teamMemberId: string;
    baseRole: string;
    productionRoles: string[];
    message: string;
  };
  error?: string;
}

class RoleManagementService {
  private baseUrl = 'https://us-central1-backbone-logic.cloudfunctions.net';

  /**
   * Get authentication headers for API requests
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get available role presets and role lists
   */
  async getRolePresets(): Promise<{
    presets: Record<string, string[]>;
    projectRoles: string[];
    productionRoles: string[];
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/role-presets`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch role presets');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching role presets:', error);
      throw error;
    }
  }

  /**
   * Validate role assignment compatibility
   */
  async validateRoleAssignment(
    baseRole: string, 
    productionRoles: string[]
  ): Promise<ValidationResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/validate-role-assignment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          baseRole,
          productionRoles
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error validating role assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }

  /**
   * Generate permissions preview for role combination
   */
  async getPermissionsPreview(
    baseRole: string,
    productionRoles: string[]
  ): Promise<PermissionPreview> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/permissions-preview`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          baseRole,
          productionRoles
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating permissions preview:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Preview generation failed'
      };
    }
  }

  /**
   * Assign production roles to a team member
   */
  async assignProductionRoles(
    projectId: string,
    teamMemberId: string,
    productionRoles: string[]
  ): Promise<RoleAssignmentResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/assign-production-roles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId,
          teamMemberId,
          productionRoles
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error assigning production roles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Role assignment failed'
      };
    }
  }

  /**
   * Get project assignments for a team member
   */
  async getProjectAssignments(teamMemberId: string): Promise<any[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/project-assignments?teamMemberId=${teamMemberId}`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch project assignments');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      return [];
    }
  }

  /**
   * Create a new project assignment
   */
  async createProjectAssignment(
    projectId: string,
    teamMemberId: string,
    baseRole: 'ADMIN' | 'DO_ER' | 'GUEST',
    productionRoles: string[] = []
  ): Promise<RoleAssignmentResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/project-assignments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId,
          teamMemberId,
          baseRole,
          productionRoles,
          isActive: true
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating project assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment creation failed'
      };
    }
  }

  /**
   * Update project assignment roles
   */
  async updateProjectAssignment(
    assignmentId: string,
    updates: {
      baseRole?: 'ADMIN' | 'DO_ER' | 'GUEST';
      productionRoles?: string[];
      isActive?: boolean;
    }
  ): Promise<RoleAssignmentResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/project-assignments/${assignmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating project assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment update failed'
      };
    }
  }

  /**
   * Remove project assignment
   */
  async removeProjectAssignment(assignmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/api/project-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error removing project assignment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment removal failed'
      };
    }
  }

  /**
   * Get role hierarchy information
   */
  getRoleHierarchy(): {
    projectRoles: Record<string, number>;
    productionRoles: Record<string, number>;
  } {
    return {
      projectRoles: {
        'ADMIN': 100,
        'DO_ER': 50,
        'GUEST': 10
      },
      productionRoles: {
        'ADMIN': 100,
        'SUPERCOORDINATOR': 90,
        'MANAGER': 80,
        'POST_COORDINATOR': 70,
        'PRODUCER': 65,
        'EDITOR': 60,
        'ASSISTANT_EDITOR': 55,
        'DO_ER': 50,
        'QC_SPECIALIST': 45,
        'COLORIST': 40,
        'AUDIO_ENGINEER': 35,
        'GRAPHICS_DESIGNER': 30,
        'MEDIA_MANAGER': 25,
        'GUEST': 10
      }
    };
  }

  /**
   * Check if a user has required role level
   */
  hasRequiredRole(userRole: string, requiredRole: string, isProjectRole: boolean = false): boolean {
    const hierarchy = isProjectRole ? this.getRoleHierarchy().projectRoles : this.getRoleHierarchy().productionRoles;
    const userLevel = hierarchy[userRole] || 0;
    const requiredLevel = hierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }

  /**
   * Get role display information
   */
  getRoleDisplayInfo(role: string): {
    displayName: string;
    category: string;
    color: 'error' | 'warning' | 'primary' | 'secondary' | 'info' | 'success' | 'default';
    description: string;
  } {
    const roleInfo: Record<string, any> = {
      'ADMIN': { displayName: 'Admin', category: 'Management', color: 'error', description: 'Full project control' },
      'DO_ER': { displayName: 'Do-er', category: 'Standard', color: 'primary', description: 'Standard project user' },
      'GUEST': { displayName: 'Guest', category: 'Limited', color: 'default', description: 'Limited access' },
      'EDITOR': { displayName: 'Editor', category: 'Editorial', color: 'primary', description: 'Video editing' },
      'ASSISTANT_EDITOR': { displayName: 'Assistant Editor', category: 'Editorial', color: 'primary', description: 'Assistant video editing' },
      'QC_SPECIALIST': { displayName: 'QC Specialist', category: 'Quality Control', color: 'secondary', description: 'Quality control and review' },
      'AUDIO_ENGINEER': { displayName: 'Audio Engineer', category: 'Audio', color: 'info', description: 'Audio production' },
      'GRAPHICS_DESIGNER': { displayName: 'Graphics Designer', category: 'Graphics', color: 'success', description: 'Graphics and design' },
      'POST_COORDINATOR': { displayName: 'Post Coordinator', category: 'Management', color: 'warning', description: 'Post-production coordination' },
      'PRODUCER': { displayName: 'Producer', category: 'Production', color: 'warning', description: 'Production management' }
    };

    return roleInfo[role] || {
      displayName: role.replace(/_/g, ' '),
      category: 'Other',
      color: 'default' as const,
      description: 'Production role'
    };
  }
}

export const roleManagementService = new RoleManagementService();
export default roleManagementService;
