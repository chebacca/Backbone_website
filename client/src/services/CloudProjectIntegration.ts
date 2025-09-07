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
  private isInitialized = false;

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
    try {
      console.log('🔍 [CloudProjectIntegration] Listing all datasets with params:', params);
      
      // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
      if (this.isWebOnlyMode()) {
        console.log('🔍 [CloudProjectIntegration] WebOnly mode - fetching all datasets from Firestore');
        return await this.getAllDatasetsFromFirestore(params);
      }

      // For non-webonly mode, we would use REST API, but since this is web-only, fall back to Firestore
      console.log('🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore');
      return await this.getAllDatasetsFromFirestore(params);
      
    } catch (error: any) {
      console.error('❌ [CloudProjectIntegration] Failed to list datasets:', error);
      return [];
    }
  }

  /**
   * Create a new dataset
   */
  public async createDataset(input: Omit<CloudDataset, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { organizationId?: string | null; projectId?: string }): Promise<CloudDataset | null> {
    try {
      console.log('🔍 [CloudProjectIntegration] Creating dataset with input:', input);
      
      // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
      if (this.isWebOnlyMode()) {
        console.log('🔍 [CloudProjectIntegration] WebOnly mode - creating dataset in Firestore');
        return await this.createDatasetInFirestore(input);
      }

      // For non-webonly mode, we would use REST API, but since this is web-only, fall back to Firestore
      console.log('🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore');
      return await this.createDatasetInFirestore(input);
      
    } catch (error: any) {
      console.error('❌ [CloudProjectIntegration] Failed to create dataset:', error);
      throw error;
    }
  }

  /**
   * Update an existing dataset with new collection assignments and other properties
   */
  public async updateDataset(datasetId: string, updates: Partial<Omit<CloudDataset, 'id' | 'ownerId' | 'createdAt'>>): Promise<CloudDataset | null> {
    try {
      console.log('🔍 [CloudProjectIntegration] Updating dataset:', datasetId, 'with updates:', updates);
      
      // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
      if (this.isWebOnlyMode()) {
        console.log('🔍 [CloudProjectIntegration] WebOnly mode - updating dataset in Firestore');
        return await this.updateDatasetInFirestore(datasetId, updates);
      }

      // For non-webonly mode, we would use REST API, but since this is web-only, fall back to Firestore
      console.log('🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore');
      return await this.updateDatasetInFirestore(datasetId, updates);
      
    } catch (error: any) {
      console.error('❌ [CloudProjectIntegration] Failed to update dataset:', error);
      throw error;
    }
  }

  /**
   * Get datasets for a specific project
   */
  public async getProjectDatasets(projectId: string): Promise<CloudDataset[]> {
    try {
      console.log('🔍 [CloudProjectIntegration] Getting datasets for project:', projectId);
      
      // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
      if (this.isWebOnlyMode()) {
        console.log('🔍 [CloudProjectIntegration] WebOnly mode - fetching datasets from Firestore for project:', projectId);
        return await this.getProjectDatasetsFromFirestore(projectId);
      }

      // For non-webonly mode, we would use REST API, but since this is web-only, fall back to Firestore
      console.log('🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore');
      return await this.getProjectDatasetsFromFirestore(projectId);
      
    } catch (error: any) {
      console.error('❌ [CloudProjectIntegration] Failed to get project datasets:', error);
      return [];
    }
  }

  /**
   * Assign a dataset to a project
   */
  public async assignDatasetToProject(projectId: string, datasetId: string): Promise<void> {
    try {
      console.log('🔍 [CloudProjectIntegration] Assigning dataset to project:', { projectId, datasetId });
      
      // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
      if (this.isWebOnlyMode()) {
        console.log('🔍 [CloudProjectIntegration] WebOnly mode - assigning dataset to project in Firestore');
        return await this.assignDatasetToProjectInFirestore(projectId, datasetId);
      }
      
      // For non-webonly mode, we would use REST API, but since this is web-only, fall back to Firestore
      console.log('🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore');
      return await this.assignDatasetToProjectInFirestore(projectId, datasetId);
      
    } catch (error: any) {
      console.error('❌ [CloudProjectIntegration] Failed to assign dataset to project:', error);
      throw error;
    }
  }

  /**
   * Unassign a dataset from a project
   */
  public async unassignDatasetFromProject(projectId: string, datasetId: string): Promise<void> {
    // await this.serviceFactory.getDatasetService().unassignDatasetFromProject(projectId, datasetId);
  }


  /**
   * Delete a dataset permanently
   */
  public async deleteDataset(datasetId: string): Promise<boolean> {
    // return await this.serviceFactory.getDatasetService().deleteDataset(datasetId);
    return false;
  }

  /**
   * Clean up corrupted datasets
   */
  public async cleanupCorruptedDatasets(): Promise<{ cleaned: number; errors: string[] }> {
    // return await this.serviceFactory.getDatasetService().cleanupCorruptedDatasets();
    return { cleaned: 0, errors: [] };
  }

  /**
   * Create a dataset directly in Firestore (webonly mode)
   */
  private async createDatasetInFirestore(input: Omit<CloudDataset, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { organizationId?: string | null; projectId?: string }): Promise<CloudDataset | null> {
    try {
      console.log('🔍 [CloudProjectIntegration] Creating dataset in Firestore:', input);
      
      // Import Firebase modules
      const { db, auth } = await import('./firebase');
      const { doc, setDoc, collection, getDoc } = await import('firebase/firestore');
      
      // 🔧 CRITICAL FIX: Wait for Firebase authentication to be ready
      const currentUser = await this.waitForFirebaseAuth();
      if (!currentUser) {
        console.warn('⚠️ [CloudProjectIntegration] Cannot create dataset - authentication required');
        throw new Error('Authentication required to create dataset');
      }
      
      // Get user's organization ID
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const organizationId = userData?.organizationId || input.organizationId;
      
      // Create dataset document reference
      const datasetRef = doc(collection(db, 'datasets'));
      const now = new Date();
      
      // Prepare dataset data
      const datasetData = {
        id: datasetRef.id,
        name: input.name,
        description: input.description || '',
        visibility: input.visibility || 'private',
        tags: input.tags || [],
        schema: input.schema || {},
        storage: input.storage || { backend: 'firestore' },
        ownerId: currentUser.uid,
        organizationId: organizationId,
        projectId: input.projectId || null, // 🔧 CRITICAL FIX: Include projectId
        status: 'ACTIVE',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        lastAccessedAt: now.toISOString(),
        size: 0,
        fileCount: 0,
        // 🆕 NEW: Collection assignment for Firestore datasets
        collectionAssignment: (input as any).collectionAssignment || null
      };
      
      // Save to Firestore
      await setDoc(datasetRef, datasetData);
      
      console.log('✅ [CloudProjectIntegration] Dataset created successfully in Firestore:', datasetRef.id);
      
      return datasetData as CloudDataset;
      
    } catch (error) {
      console.error('❌ [CloudProjectIntegration] Failed to create dataset in Firestore:', error);
      throw error;
    }
  }

  /**
   * Update an existing dataset in Firestore (webonly mode)
   */
  private async updateDatasetInFirestore(datasetId: string, updates: Partial<Omit<CloudDataset, 'id' | 'ownerId' | 'createdAt'>>): Promise<CloudDataset | null> {
    try {
      console.log('🔍 [CloudProjectIntegration] Updating dataset in Firestore:', datasetId);
      
      // Import Firebase modules
      const { db, auth } = await import('./firebase');
      const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      
      // 🔧 CRITICAL FIX: Wait for Firebase authentication to be ready
      const currentUser = await this.waitForFirebaseAuth();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get reference to the dataset document
      const datasetRef = doc(db, 'datasets', datasetId);
      
      // First, get the current dataset to verify ownership and organization
      const currentDatasetDoc = await getDoc(datasetRef);
      if (!currentDatasetDoc.exists()) {
        throw new Error('Dataset not found');
      }
      
      const currentDataset = currentDatasetDoc.data() as CloudDataset;
      
      // Verify user has permission to update this dataset
      const { doc: docFn } = await import('firebase/firestore');
      const userDoc = await getDoc(docFn(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const userOrganizationId = userData?.organizationId;
      
      if (currentDataset.organizationId !== userOrganizationId) {
        throw new Error('Unauthorized: Dataset belongs to different organization');
      }
      
      // Prepare update data
      const updateData: any = {
        ...updates,
        updatedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      };
      
      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.ownerId;
      delete updateData.createdAt;
      
      console.log('🔄 [CloudProjectIntegration] Updating dataset with data:', updateData);
      
      // Update the document
      await updateDoc(datasetRef, updateData);
      
      // Get the updated dataset
      const updatedDatasetDoc = await getDoc(datasetRef);
      const updatedDataset = updatedDatasetDoc.data() as CloudDataset;
      
      console.log('✅ [CloudProjectIntegration] Dataset updated successfully in Firestore:', datasetId);
      
      return updatedDataset;
      
    } catch (error) {
      console.error('❌ [CloudProjectIntegration] Failed to update dataset in Firestore:', error);
      throw error;
    }
  }

  /**
   * Get datasets for a project from Firestore (webonly mode)
   */
  private async getProjectDatasetsFromFirestore(projectId: string): Promise<CloudDataset[]> {
    try {
      console.log('🔍 [CloudProjectIntegration] Getting datasets from Firestore for project:', projectId);
      
      // Import Firebase modules
      const { db, auth } = await import('./firebase');
      const { collection, query, where, getDocs, orderBy, getDoc } = await import('firebase/firestore');
      
      // 🔧 CRITICAL FIX: Wait for Firebase authentication to be ready
      const currentUser = await this.waitForFirebaseAuth();
      if (!currentUser) {
        console.warn('⚠️ [CloudProjectIntegration] Cannot get project datasets - returning empty list');
        return [];
      }
      
      // Get user's organization ID
      const { doc: docFn } = await import('firebase/firestore');
      const userDoc = await getDoc(docFn(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const organizationId = userData?.organizationId;
      
      // 🔧 CRITICAL FIX: Use simpler queries to avoid index issues
      let datasetsQuery;
      if (projectId && projectId !== 'all') {
        // Query datasets specifically assigned to this project
        try {
          datasetsQuery = query(
            collection(db, 'datasets'),
            where('projectId', '==', projectId),
            where('status', '==', 'ACTIVE'),
            orderBy('updatedAt', 'desc')
          );
        } catch (indexError) {
          console.log('⚠️ [CloudProjectIntegration] Composite index query failed, falling back to simple query');
          // Fallback: query without orderBy to avoid index issues
          datasetsQuery = query(
            collection(db, 'datasets'),
            where('projectId', '==', projectId),
            where('status', '==', 'ACTIVE')
          );
        }
      } else {
        // Query all datasets for the organization
        try {
          datasetsQuery = query(
            collection(db, 'datasets'),
            where('organizationId', '==', organizationId),
            where('status', '==', 'ACTIVE'),
            orderBy('updatedAt', 'desc')
          );
        } catch (indexError) {
          console.log('⚠️ [CloudProjectIntegration] Composite index query failed, falling back to simple query');
          // Fallback: query without orderBy to avoid index issues
          datasetsQuery = query(
            collection(db, 'datasets'),
            where('organizationId', '==', organizationId),
            where('status', '==', 'ACTIVE')
          );
        }
      }
      
      const snapshot = await getDocs(datasetsQuery);
      const datasets = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        } as CloudDataset;
      });
      
      // Sort manually if we used fallback query (when orderBy is not available)
      // Note: We'll always sort manually for now to ensure consistent ordering
      datasets.sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      });
      
      console.log(`✅ [CloudProjectIntegration] Found ${datasets.length} datasets for project ${projectId}`);
      return datasets;
      
    } catch (error) {
      console.error('❌ [CloudProjectIntegration] Failed to get datasets from Firestore:', error);
      return [];
    }
  }

  /**
   * Get all datasets from Firestore (webonly mode)
   */
  private async getAllDatasetsFromFirestore(params?: {
    organizationId?: string;
    visibility?: 'private' | 'organization' | 'public';
    backend?: 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local' | 'all';
    query?: string;
  }): Promise<CloudDataset[]> {
    try {
      console.log('🔍 [CloudProjectIntegration] Getting all datasets from Firestore with params:', params);
      
      // Import Firebase modules
      const { db, auth } = await import('./firebase');
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      
      // 🔧 CRITICAL FIX: Wait for Firebase authentication to be ready
      const currentUser = await this.waitForFirebaseAuth();
      if (!currentUser) {
        console.warn('⚠️ [CloudProjectIntegration] Cannot get all datasets - returning empty list');
        return [];
      }
      
      // Get user's organization ID
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      const organizationId = userData?.organizationId || params?.organizationId;
      
      // Build query - start simple to avoid index issues
      let datasetsQuery = query(
        collection(db, 'datasets'),
        where('status', '==', 'ACTIVE'),
        orderBy('updatedAt', 'desc')
      );
      
      // Add organization filter if available
      if (organizationId) {
        datasetsQuery = query(
          collection(db, 'datasets'),
          where('organizationId', '==', organizationId),
          where('status', '==', 'ACTIVE'),
          orderBy('updatedAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(datasetsQuery);
      let datasets = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        } as CloudDataset;
      });
      
      // Apply client-side filters if needed
      if (params?.visibility) {
        datasets = datasets.filter(dataset => dataset.visibility === params.visibility);
      }
      
      if (params?.query) {
        const searchQuery = params.query.toLowerCase();
        datasets = datasets.filter(dataset => 
          dataset.name.toLowerCase().includes(searchQuery) ||
          (dataset.description && dataset.description.toLowerCase().includes(searchQuery))
        );
      }
      
      console.log(`✅ [CloudProjectIntegration] Found ${datasets.length} datasets`);
      return datasets;
      
    } catch (error) {
      console.error('❌ [CloudProjectIntegration] Failed to get all datasets from Firestore:', error);
      return [];
    }
  }

  /**
   * Get all datasets for the current organization (useful for dataset management dialog)
   */
  public async getAllOrganizationDatasets(): Promise<CloudDataset[]> {
    try {
      console.log('🔍 [CloudProjectIntegration] Getting all datasets for organization');
      
      if (this.isWebOnlyMode()) {
        console.log('🔍 [CloudProjectIntegration] WebOnly mode - fetching all organization datasets from Firestore');
        return await this.getAllDatasetsFromFirestore();
      }
      
      console.log('🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore');
      return await this.getAllDatasetsFromFirestore();
      
    } catch (error: any) {
      console.error('❌ [CloudProjectIntegration] Failed to get organization datasets:', error);
      return [];
    }
  }

  /**
   * Assign a dataset to a project directly in Firestore (webonly mode)
   */
  private async assignDatasetToProjectInFirestore(projectId: string, datasetId: string): Promise<void> {
    try {
      console.log('🔍 [CloudProjectIntegration] Assigning dataset to project in Firestore:', { projectId, datasetId });
      
      // Import Firebase modules
      const { db } = await import('./firebase');
      const { doc, updateDoc, getDoc, collection, addDoc } = await import('firebase/firestore');
      
      // First, check if the dataset exists
      const datasetRef = doc(db, 'datasets', datasetId);
      const datasetDoc = await getDoc(datasetRef);
      
      if (!datasetDoc.exists()) {
        throw new Error('Dataset not found');
      }

      // Check if the project exists
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      // Update the dataset to assign it to the project
      await updateDoc(datasetRef, {
        projectId: projectId,
        updatedAt: new Date().toISOString()
      });

      // Create a link in the project_datasets collection (following server-side pattern)
      const projectDatasetLink = {
        projectId: projectId,
        datasetId: datasetId,
        addedByUserId: datasetDoc.data()?.ownerId || 'system',
        addedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'project_datasets'), projectDatasetLink);

      // Update the project document to reflect the dataset assignment
      await updateDoc(projectRef, {
        updatedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      });
      
      console.log('✅ [CloudProjectIntegration] Dataset assigned to project successfully in Firestore');
      
    } catch (error) {
      console.error('❌ [CloudProjectIntegration] Failed to assign dataset to project in Firestore:', error);
      throw error;
    }
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
    role: TeamMemberRole = TeamMemberRole.MEMBER
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

  /**
   * 🔧 CRITICAL FIX: Wait for Firebase Auth to be ready using event-driven approach
   * This prevents "No authenticated user" errors when Firebase Auth is still initializing
   */
  private async waitForFirebaseAuth(maxWaitTime: number = 5000): Promise<any> {
    const { auth } = await import('./firebase');
    const { onAuthStateChanged } = await import('firebase/auth');
    
    // If there's already a current user, return immediately
    if (auth.currentUser) {
      return auth.currentUser;
    }
    
    console.log('⏳ [CloudProjectIntegration] Waiting for Firebase Auth initialization...');
    
    // Wait for auth state to change (event-driven approach)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('⚠️ [CloudProjectIntegration] Firebase Auth timeout after waiting');
        resolve(null);
      }, maxWaitTime);

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        clearTimeout(timeout);
        unsubscribe();
        
        if (user) {
          console.log('✅ [CloudProjectIntegration] Firebase Auth ready, user authenticated:', user.email);
        } else {
          console.log('ℹ️ [CloudProjectIntegration] Firebase Auth ready, but no user authenticated');
        }
        
        resolve(user);
      });
    });
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
