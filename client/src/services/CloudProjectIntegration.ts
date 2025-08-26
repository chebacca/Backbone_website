/**
 * CloudProjectIntegration - Facade for project-related services
 * 
 * This is a facade that provides backward compatibility with the original CloudProjectIntegration
 * while delegating to the new service architecture.
 */
import { ServiceFactory } from './ServiceFactory';
import { CloudDataset, CloudProject, ProjectStatus, ProjectTeamMember, ServiceConfig, TeamMember, TeamMemberRole } from './models/types';

/**
 * CloudProjectIntegrationService - Facade for project-related services
 */
class CloudProjectIntegrationService {
  private static instance: CloudProjectIntegrationService;
  private serviceFactory: ServiceFactory;
  private authTokenCallback: (() => void) | null = null;
  
  private constructor() {
    this.serviceFactory = ServiceFactory.getInstance();
    
    // Initialize with default configuration
    this.serviceFactory.initialize({
      isWebOnlyMode: this.isWebOnlyMode()
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CloudProjectIntegrationService {
    if (!CloudProjectIntegrationService.instance) {
      CloudProjectIntegrationService.instance = new CloudProjectIntegrationService();
    }
    return CloudProjectIntegrationService.instance;
  }

  /**
   * Check if running in webonly mode
   */
  public isWebOnlyMode(): boolean {
    // Check for webonly mode based on environment or URL parameters
    if (typeof window !== 'undefined') {
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('webonly')) {
        return urlParams.get('webonly') === 'true';
      }
      
      // Check localStorage
      const storedMode = localStorage.getItem('webonly_mode');
      if (storedMode) {
        return storedMode === 'true';
      }
      
      // Check for environment variables
      if ((window as any).ENV && (window as any).ENV.WEBONLY) {
        return (window as any).ENV.WEBONLY === true;
      }
    }
    
    // Default to true for safety (prefer direct Firestore access)
    return true;
  }

  /**
   * Set configuration for services
   */
  public setConfig(config: Partial<ServiceConfig>): void {
    this.serviceFactory.initialize(config);
  }

  // PROJECT METHODS

  /**
   * Get all projects
   */
  public async getProjects(): Promise<CloudProject[]> {
    return await this.serviceFactory.getProjectService().getProjects();
  }
  
  /**
   * Get projects for the current user
   * (Alias for getProjects for backward compatibility)
   */
  public async getUserProjects(): Promise<CloudProject[]> {
    return await this.serviceFactory.getProjectService().getProjects();
  }

  /**
   * Get a project by ID
   */
  public async getProject(projectId: string): Promise<CloudProject | null> {
    return await this.serviceFactory.getProjectService().getProject(projectId);
  }

  /**
   * Create a new project
   */
  public async createProject(project: Omit<CloudProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<CloudProject | null> {
    return await this.serviceFactory.getProjectService().createProject(project);
  }
  
  /**
   * Create a new cloud project (alias for createProject for backward compatibility)
   */
  public async createCloudProject(project: Omit<CloudProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<CloudProject | null> {
    return await this.serviceFactory.getProjectService().createProject(project);
  }
  
  /**
   * Create a project directly in Firestore (for backward compatibility)
   */
  public async createCloudProjectInFirestore(project: Omit<CloudProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<CloudProject | null> {
    return await this.serviceFactory.getProjectService().createProject(project);
  }

  /**
   * Update a project
   */
  public async updateProject(projectId: string, updates: Partial<CloudProject>): Promise<CloudProject | null> {
    return await this.serviceFactory.getProjectService().updateProject(projectId, updates);
  }
  
  /**
   * Update a project directly in Firestore (for backward compatibility)
   */
  public async updateProjectInFirestore(projectId: string, updates: Partial<CloudProject>): Promise<CloudProject | null> {
    return await this.serviceFactory.getProjectService().updateProject(projectId, updates);
  }

  /**
   * Archive a project
   */
  public async archiveProject(projectId: string): Promise<boolean> {
    return await this.serviceFactory.getProjectService().archiveProject(projectId);
  }
  
  /**
   * Archive a project directly in Firestore (for backward compatibility)
   */
  public async archiveProjectInFirestore(projectId: string): Promise<boolean> {
    return await this.serviceFactory.getProjectService().archiveProject(projectId);
  }

  /**
   * Restore a project from archive
   */
  public async restoreProject(projectId: string): Promise<boolean> {
    return await this.serviceFactory.getProjectService().restoreProject(projectId);
  }

  /**
   * Permanently delete a project
   */
  public async deleteProject(projectId: string): Promise<boolean> {
    return await this.serviceFactory.getProjectService().deleteProject(projectId);
  }

  // DATASET METHODS

  /**
   * List all datasets with optional filters
   */
  public async listDatasets(params?: {
    organizationId?: string;
    visibility?: 'private' | 'organization' | 'public';
    backend?: 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local' | 'all';
    query?: string;
  }): Promise<CloudDataset[]> {
    return await this.serviceFactory.getDatasetService().listDatasets(params);
  }

  /**
   * Create a new dataset
   */
  public async createDataset(input: Omit<CloudDataset, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { organizationId?: string | null }): Promise<CloudDataset | null> {
    return await this.serviceFactory.getDatasetService().createDataset(input);
  }

  /**
   * Get datasets for a specific project
   */
  public async getProjectDatasets(projectId: string): Promise<CloudDataset[]> {
    return await this.serviceFactory.getDatasetService().getProjectDatasets(projectId);
  }

  /**
   * Assign a dataset to a project
   */
  public async assignDatasetToProject(projectId: string, datasetId: string): Promise<void> {
    await this.serviceFactory.getDatasetService().assignDatasetToProject(projectId, datasetId);
  }

  /**
   * Unassign a dataset from a project
   */
  public async unassignDatasetFromProject(projectId: string, datasetId: string): Promise<void> {
    await this.serviceFactory.getDatasetService().unassignDatasetFromProject(projectId, datasetId);
  }

  // TEAM MEMBER METHODS

  /**
   * Get all licensed team members
   * Excludes members already assigned to the specified project
   */
  public async getLicensedTeamMembers(options?: {
    search?: string;
    excludeProjectId?: string;
  }): Promise<TeamMember[]> {
    return await this.serviceFactory.getTeamMemberService().getLicensedTeamMembers(options);
  }

  /**
   * Get team members assigned to a specific project
   */
  public async getProjectTeamMembers(projectId: string): Promise<ProjectTeamMember[]> {
    return await this.serviceFactory.getTeamMemberService().getProjectTeamMembers(projectId);
  }

  /**
   * Add a team member to a project with a specific role
   */
  public async addTeamMemberToProject(
    projectId: string, 
    teamMemberId: string, 
    role: TeamMemberRole = TeamMemberRole.DO_ER
  ): Promise<void> {
    await this.serviceFactory.getTeamMemberService().addTeamMemberToProject(projectId, teamMemberId, role);
  }

  /**
   * Remove a team member from a project
   */
  public async removeTeamMemberFromProject(projectId: string, teamMemberId: string): Promise<void> {
    await this.serviceFactory.getTeamMemberService().removeTeamMemberFromProject(projectId, teamMemberId);
  }

  /**
   * Update a team member's role in a project
   */
  public async updateTeamMemberRole(projectId: string, teamMemberId: string, role: string): Promise<void> {
    await this.serviceFactory.getTeamMemberService().updateTeamMemberRole(projectId, teamMemberId, role as TeamMemberRole);
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
    return await this.serviceFactory.getTeamMemberService().validateTeamMemberCredentials(email, password);
  }

  // AUTHENTICATION METHODS
  
  /**
   * Set auth token callback
   */
  public setAuthTokenCallback(callback: () => void): void {
    this.authTokenCallback = callback;
  }
  
  /**
   * Set auth token
   */
  public setAuthToken(token: string): void {
    console.log('Setting auth token:', token);
    // Store token in localStorage or similar
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
    
    // Call callback if set
    if (this.authTokenCallback) {
      this.authTokenCallback();
    }
  }
  
  // UTILITY METHODS

  /**
   * Clean document data for Firestore (remove undefined values)
   */
  public cleanDocumentData(data: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip undefined values
      if (value === undefined) continue;
      
      // Handle null values
      if (value === null) {
        cleaned[key] = null;
        continue;
      }
      
      // Handle nested objects
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = this.cleanDocumentData(value);
        continue;
      }
      
      // Handle all other values
      cleaned[key] = value;
    }
    
    return cleaned;
  }
}

// Export singleton instance
export const cloudProjectIntegration = CloudProjectIntegrationService.getInstance();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).cloudProjectIntegration = cloudProjectIntegration;
}

// Export types
export type {
  CloudProject,
  CloudDataset,
  TeamMember,
  ProjectTeamMember,
  TeamMemberRole,
  ProjectStatus
} from './models/types';

export default CloudProjectIntegrationService;
