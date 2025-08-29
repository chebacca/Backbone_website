/**
 * ProjectService - Handles all project-related operations
 */
import { BaseService } from './base/BaseService';
import { CloudProject, ProjectStatus, ServiceConfig } from './models/types';

export class ProjectService extends BaseService {
  private static instance: ProjectService;

  private constructor(config: ServiceConfig) {
    super(config);
  }

  public static getInstance(config: ServiceConfig): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService(config);
    }
    return ProjectService.instance;
  }

  /**
   * Get all projects
   */
  public async getProjects(): Promise<CloudProject[]> {
    try {
      console.log('🚀 [ProjectService] Getting all projects');
      
      if (this.isWebOnlyMode()) {
        return await this.getProjectsFromFirestore();
      }
      
      try {
        const result = await this.apiRequest<CloudProject[]>('projects');
        return result;
      } catch (error) {
        console.warn('⚠️ [ProjectService] API request failed, falling back to Firestore');
        return await this.getProjectsFromFirestore();
      }
    } catch (error) {
      this.handleError(error, 'getProjects');
      return [];
    }
  }

  /**
   * Get a project by ID
   */
  public async getProject(projectId: string): Promise<CloudProject | null> {
    try {
      console.log(`🚀 [ProjectService] Getting project: ${projectId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.getProjectFromFirestore(projectId);
      }
      
      try {
        const result = await this.apiRequest<CloudProject>(`projects/${projectId}`);
        return result;
      } catch (error) {
        console.warn('⚠️ [ProjectService] API request failed, falling back to Firestore');
        return await this.getProjectFromFirestore(projectId);
      }
    } catch (error) {
      this.handleError(error, `getProject(${projectId})`);
      return null;
    }
  }

  /**
   * Create a new project
   */
  public async createProject(project: Omit<CloudProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<CloudProject | null> {
    try {
      console.log('🚀 [ProjectService] Creating new project');
      
      if (this.isWebOnlyMode()) {
        return await this.createProjectInFirestore(project);
      }
      
      try {
        const result = await this.apiRequest<CloudProject>('projects', 'POST', project);
        return result;
      } catch (error) {
        console.warn('⚠️ [ProjectService] API request failed, falling back to Firestore');
        return await this.createProjectInFirestore(project);
      }
    } catch (error) {
      this.handleError(error, 'createProject');
      return null;
    }
  }

  /**
   * Update a project
   */
  public async updateProject(projectId: string, updates: Partial<CloudProject>): Promise<CloudProject | null> {
    try {
      console.log(`🚀 [ProjectService] Updating project: ${projectId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.updateProjectInFirestore(projectId, updates);
      }
      
      try {
        const result = await this.apiRequest<CloudProject>(`projects/${projectId}`, 'PATCH', updates);
        return result;
      } catch (error) {
        console.warn('⚠️ [ProjectService] API request failed, falling back to Firestore');
        return await this.updateProjectInFirestore(projectId, updates);
      }
    } catch (error) {
      this.handleError(error, `updateProject(${projectId})`);
      return null;
    }
  }

  /**
   * Archive a project
   */
  public async archiveProject(projectId: string): Promise<boolean> {
    try {
      console.log(`🚀 [ProjectService] Archiving project: ${projectId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.updateProjectInFirestore(projectId, { status: ProjectStatus.ARCHIVED }) !== null;
      }
      
      try {
        await this.apiRequest(`projects/${projectId}/archive`, 'POST');
        return true;
      } catch (error) {
        console.warn('⚠️ [ProjectService] API request failed, falling back to Firestore');
        return await this.updateProjectInFirestore(projectId, { status: ProjectStatus.ARCHIVED }) !== null;
      }
    } catch (error) {
      this.handleError(error, `archiveProject(${projectId})`);
      return false;
    }
  }

  /**
   * Restore a project from archive
   */
  public async restoreProject(projectId: string): Promise<boolean> {
    try {
      console.log(`🚀 [ProjectService] Restoring project: ${projectId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.updateProjectInFirestore(projectId, { status: ProjectStatus.ACTIVE }) !== null;
      }
      
      try {
        await this.apiRequest(`projects/${projectId}/restore`, 'POST');
        return true;
      } catch (error) {
        console.warn('⚠️ [ProjectService] API request failed, falling back to Firestore');
        return await this.updateProjectInFirestore(projectId, { status: ProjectStatus.ACTIVE }) !== null;
      }
    } catch (error) {
      this.handleError(error, `restoreProject(${projectId})`);
      return false;
    }
  }

  /**
   * Permanently delete a project
   */
  public async deleteProject(projectId: string): Promise<boolean> {
    try {
      console.log(`🗑️ [ProjectService] Deleting project: ${projectId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.deleteProjectFromFirestore(projectId);
      }
      
      try {
        await this.apiRequest(`projects/${projectId}`, 'DELETE');
        return true;
      } catch (error) {
        console.warn('⚠️ [ProjectService] API request failed, falling back to Firestore');
        return await this.deleteProjectFromFirestore(projectId);
      }
    } catch (error) {
      this.handleError(error, `deleteProject(${projectId})`);
      return false;
    }
  }

  /**
   * Get projects from Firestore
   */
  private async getProjectsFromFirestore(): Promise<CloudProject[]> {
    try {
      console.log('🔍 [ProjectService] Getting projects from Firestore');
      
      await this.firestoreAdapter.initialize();
      
      // Get current user and their organization ID
      const currentUser = this.firestoreAdapter.getCurrentUser();
      
      if (!currentUser) {
        console.log('❌ [ProjectService] No authenticated user found');
        return [];
      }
      
      // Get user's organization ID from Firestore
      let organizationId: string | null = null;
      
      try {
        // Try to get user document by Firebase UID
        const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
        if (userDoc && userDoc.organizationId) {
          organizationId = userDoc.organizationId;
          console.log('✅ [ProjectService] Found organization ID from user document:', organizationId);
        } else {
          // Try to find user by email
          const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
            { field: 'email', operator: '==', value: currentUser.email }
          ]);
          
          if (userByEmail.length > 0 && userByEmail[0].organizationId) {
            organizationId = userByEmail[0].organizationId;
            console.log('✅ [ProjectService] Found organization ID from user email query:', organizationId);
          }
        }
      } catch (error) {
        console.warn('⚠️ [ProjectService] Error getting user organization:', error);
      }
      
      if (!organizationId) {
        console.log('❌ [ProjectService] No organization ID found for user');
        return [];
      }
      
      // Get projects for this organization
      try {
        const projects = await this.firestoreAdapter.queryDocuments<CloudProject>('projects', [
          { field: 'organizationId', operator: '==', value: organizationId }
        ]);
        
        console.log(`✅ [ProjectService] Found ${projects.length} projects for organization: ${organizationId}`);
        console.log('🔍 [ProjectService] Raw projects from Firestore:', projects);
        
        // Sort by lastAccessedAt in memory to avoid Firestore index requirements
        const sortedProjects = projects.sort((a, b) => {
          const dateA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
          const dateB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
          return dateB - dateA; // Descending order (newest first)
        });
        
        console.log('🔍 [ProjectService] Sorted projects:', sortedProjects);
        return sortedProjects;
      } catch (queryError: any) {
        // Handle missing index error gracefully
        if (queryError.message && queryError.message.includes('requires an index')) {
          console.warn('⚠️ [ProjectService] Missing Firestore index detected. Projects query requires composite index.');
          console.warn('📋 Required index: organizationId (Ascending) + createdAt (Ascending) + __name__ (Ascending)');
          console.warn('🔗 Create index at: https://console.firebase.google.com/v1/r/project/backbone-logic/firestore/indexes');
          console.warn('📝 Note: Index creation can take several minutes. Returning empty array for now.');
          
          // Return empty array while index is being built
          return [];
        }
        
        // Re-throw other errors
        throw queryError;
      }
    } catch (error) {
      this.handleError(error, 'getProjectsFromFirestore');
      return [];
    }
  }

  /**
   * Get a project from Firestore
   */
  private async getProjectFromFirestore(projectId: string): Promise<CloudProject | null> {
    try {
      console.log(`🔍 [ProjectService] Getting project from Firestore: ${projectId}`);
      
      await this.firestoreAdapter.initialize();
      return await this.firestoreAdapter.getDocumentById<CloudProject>('projects', projectId);
    } catch (error) {
      this.handleError(error, `getProjectFromFirestore(${projectId})`);
      return null;
    }
  }

  /**
   * Create a project in Firestore
   */
  private async createProjectInFirestore(project: Omit<CloudProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<CloudProject | null> {
    try {
      console.log('🔍 [ProjectService] Creating project in Firestore');
      
      await this.firestoreAdapter.initialize();
      const currentUser = this.firestoreAdapter.getCurrentUser();
      
      if (!currentUser) {
        console.warn('⚠️ [ProjectService] No authenticated user for project creation');
        return null;
      }
      
      // Ensure required fields
      const newProject = {
        ...project,
        ownerId: project.ownerId || currentUser.uid,
        status: project.status || ProjectStatus.ACTIVE,
        teamMembers: project.teamMembers || []
      };
      
      return await this.firestoreAdapter.createDocument<CloudProject>('projects', newProject);
    } catch (error) {
      this.handleError(error, 'createProjectInFirestore');
      return null;
    }
  }

  /**
   * Update a project in Firestore
   */
  private async updateProjectInFirestore(projectId: string, updates: Partial<CloudProject>): Promise<CloudProject | null> {
    try {
      console.log(`🔍 [ProjectService] Updating project in Firestore: ${projectId}`);
      
      await this.firestoreAdapter.initialize();
      
      // Get current project data
      const existingProject = await this.firestoreAdapter.getDocumentById<CloudProject>('projects', projectId);
      
      if (!existingProject) {
        console.warn(`⚠️ [ProjectService] Project not found: ${projectId}`);
        return null;
      }
      
      // Apply updates
      const success = await this.firestoreAdapter.updateDocument<CloudProject>('projects', projectId, updates);
      
      if (success) {
        // Return updated project
        return {
          ...existingProject,
          ...updates,
          id: projectId
        };
      }
      
      return null;
    } catch (error) {
      this.handleError(error, `updateProjectInFirestore(${projectId})`);
      return null;
    }
  }

  /**
   * Permanently delete a project from Firestore
   */
  private async deleteProjectFromFirestore(projectId: string): Promise<boolean> {
    try {
      console.log(`🗑️ [ProjectService] Deleting project from Firestore: ${projectId}`);
      
      await this.firestoreAdapter.initialize();
      
      // Get current project data to check if it exists
      const existingProject = await this.firestoreAdapter.getDocumentById<CloudProject>('projects', projectId);
      
      if (!existingProject) {
        console.warn(`⚠️ [ProjectService] Project not found for deletion: ${projectId}`);
        return false;
      }
      
      // Delete the project document
      const success = await this.firestoreAdapter.deleteDocument('projects', projectId);
      
      if (success) {
        console.log(`✅ [ProjectService] Project successfully deleted from Firestore: ${projectId}`);
        
        // TODO: Clean up related data (datasets, team members, etc.)
        // This could be enhanced to also remove:
        // - Project-dataset links
        // - Project-team member assignments
        // - Any other project-related documents
        
        return true;
      }
      
      console.warn(`⚠️ [ProjectService] Failed to delete project from Firestore: ${projectId}`);
      return false;
    } catch (error) {
      this.handleError(error, `deleteProjectFromFirestore(${projectId})`);
      return false;
    }
  }
}