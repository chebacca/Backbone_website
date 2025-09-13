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
    await this.unassignDatasetFromProjectInFirestore(projectId, datasetId);
  }

  /**
   * Unassign a dataset from a project directly in Firestore (webonly mode)
   */
  private async unassignDatasetFromProjectInFirestore(projectId: string, datasetId: string): Promise<void> {
    try {
      console.log('🔍 [CloudProjectIntegration] Unassigning dataset from project in Firestore:', { projectId, datasetId });
      
      const { db } = await import('./firebase');
      const { doc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
      
      // First, check if the dataset exists
      const datasetRef = doc(db, 'datasets', datasetId);
      const datasetDoc = await getDoc(datasetRef);
      
      if (!datasetDoc.exists()) {
        throw new Error('Dataset not found');
      }
      
      // Check if the dataset is actually assigned to this project
      const datasetData = datasetDoc.data();
      if (datasetData.projectId !== projectId) {
        console.log('⚠️ [CloudProjectIntegration] Dataset is not assigned to this project, but continuing cleanup...');
      }
      
      // 🚨 CRITICAL FIX: Remove the project assignment from dataset
      await updateDoc(datasetRef, {
        projectId: null,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ [CloudProjectIntegration] Cleared projectId from dataset');

      // 🚨 CRITICAL FIX: Remove ALL links from the project_datasets collection
      const projectDatasetQuery = query(
        collection(db, 'project_datasets'),
        where('projectId', '==', projectId),
        where('datasetId', '==', datasetId)
      );
      
      const projectDatasetDocs = await getDocs(projectDatasetQuery);
      console.log(`🔍 [CloudProjectIntegration] Found ${projectDatasetDocs.size} project_datasets links to remove`);
      
      const deletePromises: Promise<void>[] = [];
      projectDatasetDocs.forEach((docSnapshot) => {
        console.log(`🗑️ [CloudProjectIntegration] Removing project_datasets link: ${docSnapshot.id}`);
        deletePromises.push(deleteDoc(docSnapshot.ref));
      });
      
      await Promise.all(deletePromises);
      console.log(`✅ [CloudProjectIntegration] Removed ${deletePromises.length} project_datasets links`);

      // Update the project document to reflect the dataset removal
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        updatedAt: new Date().toISOString()
      });
      console.log('✅ [CloudProjectIntegration] Updated project timestamp');

      console.log('🎉 [CloudProjectIntegration] Successfully unassigned dataset from project');
      
    } catch (error) {
      console.error('❌ [CloudProjectIntegration] Error unassigning dataset from project:', error);
      throw error;
    }
  }


  /**
   * Delete a dataset permanently
   */
  public async deleteDataset(datasetId: string): Promise<boolean> {
    try {
      console.log('🗑️ [CloudProjectIntegration] Deleting dataset:', datasetId);
      
      const { db } = await import('./firebase');
      const { doc, getDoc, collection, query, where, getDocs, deleteDoc, writeBatch } = await import('firebase/firestore');
      
      // First, check if the dataset exists
      const datasetRef = doc(db, 'datasets', datasetId);
      const datasetDoc = await getDoc(datasetRef);
      
      if (!datasetDoc.exists()) {
        throw new Error('Dataset not found');
      }
      
      const datasetData = datasetDoc.data();
      console.log('🔍 [CloudProjectIntegration] Dataset found:', datasetData.name);
      
      // Create a batch to delete all related data
      const batch = writeBatch(db);
      
      // 1. Delete all project_datasets links for this dataset
      const projectDatasetQuery = query(
        collection(db, 'project_datasets'),
        where('datasetId', '==', datasetId)
      );
      
      const projectDatasetDocs = await getDocs(projectDatasetQuery);
      console.log(`🔍 [CloudProjectIntegration] Found ${projectDatasetDocs.size} project_datasets links to remove`);
      
      projectDatasetDocs.forEach((docSnapshot) => {
        console.log('🗑️ [CloudProjectIntegration] Deleting project_datasets link:', docSnapshot.id);
        batch.delete(docSnapshot.ref);
      });
      
      // 2. Delete the dataset document itself
      batch.delete(datasetRef);
      
      // 3. Commit the batch
      await batch.commit();
      
      console.log('✅ [CloudProjectIntegration] Dataset deleted successfully');
      return true;
      
    } catch (error) {
      console.error('❌ [CloudProjectIntegration] Failed to delete dataset:', error);
      throw error;
    }
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
      
      // Get user's organization ID from multiple sources
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      let organizationId = userData?.organizationId || input.organizationId;
      
      // If not found in Firestore user doc, try to get from auth context
      if (!organizationId) {
        try {
          // Try to get from localStorage (licensing website stores user data there)
          const storedUser = localStorage.getItem('auth_user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            organizationId = parsedUser?.organizationId || parsedUser?.teamMemberData?.organizationId;
          }
        } catch (error) {
          console.warn('⚠️ [CloudProjectIntegration] Could not get organization ID from localStorage during creation:', error);
        }
      }
      
      // If still not found, use the current user's UID as fallback (for personal datasets)
      if (!organizationId) {
        organizationId = currentUser.uid;
      }
      
      console.log('🔍 [CloudProjectIntegration] Creating dataset with organization ID:', {
        userId: currentUser.uid,
        organizationId: organizationId,
        inputOrganizationId: input.organizationId,
        userDataOrganizationId: userData?.organizationId
      });
      
      // Create dataset document reference
      const datasetRef = doc(collection(db, 'datasets'));
      const now = new Date();
      
      // Prepare dataset data
      const collectionAssignment = (input as any).collectionAssignment;
      const selectedCollections = collectionAssignment?.selectedCollections || [];
      
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
        // 🚨 CRITICAL FIX: Save collections in BOTH formats for compatibility
        collections: selectedCollections, // Dashboard expects this format
        collectionAssignment: collectionAssignment || null // Licensing website uses this format
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
      
      // Try multiple sources for organization ID
      let userOrganizationId = userData?.organizationId;
      
      // If not found in Firestore user doc, try to get from auth context
      if (!userOrganizationId) {
        try {
          // Try to get from localStorage (licensing website stores user data there)
          const storedUser = localStorage.getItem('auth_user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            userOrganizationId = parsedUser?.organizationId || parsedUser?.teamMemberData?.organizationId;
          }
        } catch (error) {
          console.warn('⚠️ [CloudProjectIntegration] Could not get organization ID from localStorage:', error);
        }
      }
      
      // If still not found, use the current user's UID as fallback (for personal datasets)
      if (!userOrganizationId) {
        userOrganizationId = currentUser.uid;
      }
      
      console.log('🔍 [CloudProjectIntegration] Authorization check:', {
        datasetId,
        currentUserId: currentUser.uid,
        datasetOrganizationId: currentDataset.organizationId,
        userOrganizationId: userOrganizationId,
        userData: userData
      });
      
      // Check if user has permission to update this dataset
      // Allow if:
      // 1. Dataset belongs to user's organization
      // 2. User is the owner of the dataset
      // 3. Dataset has no organization (legacy datasets)
      const hasPermission = 
        currentDataset.organizationId === userOrganizationId ||
        currentDataset.ownerId === currentUser.uid ||
        !currentDataset.organizationId;
      
      if (!hasPermission) {
        console.error('❌ [CloudProjectIntegration] Authorization failed:', {
          reason: 'Organization mismatch',
          datasetOrganizationId: currentDataset.organizationId,
          userOrganizationId: userOrganizationId,
          datasetOwnerId: currentDataset.ownerId,
          currentUserId: currentUser.uid
        });
        throw new Error('Unauthorized: Dataset belongs to different organization');
      }
      
      // Prepare update data
      const updateData: any = {
        ...updates,
        updatedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      };
      
      // 🚨 CRITICAL FIX: Handle collection assignment compatibility
      if (updateData.collectionAssignment?.selectedCollections) {
        updateData.collections = updateData.collectionAssignment.selectedCollections;
      }
      
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
   * 🚨 CRITICAL FIX: Use project_datasets collection for proper linking
   */
  private async getProjectDatasetsFromFirestore(projectId: string): Promise<CloudDataset[]> {
    try {
      console.log('🔍 [CloudProjectIntegration] Getting datasets from Firestore for project:', projectId);
      
      // Import Firebase modules
      const { db, auth } = await import('./firebase');
      const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
      
      // 🔧 CRITICAL FIX: Wait for Firebase authentication to be ready
      const currentUser = await this.waitForFirebaseAuth();
      if (!currentUser) {
        console.warn('⚠️ [CloudProjectIntegration] Cannot get project datasets - returning empty list');
        return [];
      }
      
      const datasets: CloudDataset[] = [];
      
      // 🚨 CRITICAL FIX: First, get the project-dataset links from the project_datasets collection
      // This is the SAME approach used by ProjectDatasetFilterService in the Dashboard
      const projectDatasetQuery = query(
        collection(db, 'project_datasets'),
        where('projectId', '==', projectId)
      );
      
      const projectDatasetSnapshot = await getDocs(projectDatasetQuery);
      
      if (projectDatasetSnapshot.empty) {
        console.log(`✅ [CloudProjectIntegration] No dataset assignments found for project ${projectId}`);
        return [];
      }
      
      console.log(`🔍 [CloudProjectIntegration] Found ${projectDatasetSnapshot.size} dataset assignments for project ${projectId}`);
      
      // Extract dataset IDs from the links and fetch the actual dataset documents
      for (const linkDoc of projectDatasetSnapshot.docs) {
        const linkData = linkDoc.data();
        const datasetId = linkData.datasetId;
        
        if (!datasetId) {
          console.warn('⚠️ [CloudProjectIntegration] Project dataset link missing datasetId:', linkDoc.id);
          continue;
        }
        
        try {
          // Get the actual dataset document
          const datasetDoc = await getDoc(doc(db, 'datasets', datasetId));
          
          if (datasetDoc.exists()) {
            const datasetData = datasetDoc.data();
            
            // Map Firestore data to CloudDataset interface
            const dataset: CloudDataset = {
              id: datasetDoc.id,
              name: datasetData.name || 'Untitled Dataset',
              description: datasetData.description || '',
              projectId: projectId, // Set the project ID from the link
              type: datasetData.type || 'general',
              status: datasetData.status || 'active',
              createdAt: datasetData.createdAt?.toDate?.()?.toISOString() || datasetData.createdAt || new Date().toISOString(),
              updatedAt: datasetData.updatedAt?.toDate?.()?.toISOString() || datasetData.updatedAt || new Date().toISOString(),
              size: datasetData.size || 0,
              recordCount: datasetData.recordCount || 0,
              schema: datasetData.schema || {},
              tags: datasetData.tags || [],
              isPublic: datasetData.isPublic || false,
              ownerId: datasetData.ownerId,
              storage: datasetData.storage || { backend: 'firestore' },
              visibility: datasetData.visibility || 'private',
              // Include collection assignment data for compatibility
              collections: datasetData.collections || [],
              collectionAssignment: datasetData.collectionAssignment || null
            };
            
            datasets.push(dataset);
            console.log(`✅ [CloudProjectIntegration] Added dataset "${dataset.name}" (${dataset.id}) for project ${projectId}`);
          } else {
            console.warn(`⚠️ [CloudProjectIntegration] Dataset ${datasetId} referenced in project_datasets but not found in datasets collection`);
          }
        } catch (datasetError) {
          console.error(`❌ [CloudProjectIntegration] Failed to fetch dataset ${datasetId}:`, datasetError);
        }
      }
      
      // Sort by creation date (newest first)
      datasets.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
      
      console.log(`✅ [CloudProjectIntegration] Successfully loaded ${datasets.length} datasets for project ${projectId}`);
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
   * 🚨 CRITICAL FIX: Include collection assignment data for Dashboard compatibility
   */
  private async assignDatasetToProjectInFirestore(projectId: string, datasetId: string): Promise<void> {
    try {
      console.log('🔍 [CloudProjectIntegration] Assigning dataset to project in Firestore:', { projectId, datasetId });
      
      // Import Firebase modules
      const { db } = await import('./firebase');
      const { doc, updateDoc, getDoc, collection, addDoc, query, where, getDocs } = await import('firebase/firestore');
      
      // First, check if the dataset exists
      const datasetRef = doc(db, 'datasets', datasetId);
      const datasetDoc = await getDoc(datasetRef);
      
      if (!datasetDoc.exists()) {
        throw new Error('Dataset not found');
      }

      const datasetData = datasetDoc.data();
      console.log('🔍 [CloudProjectIntegration] Dataset data:', {
        id: datasetId,
        name: datasetData?.name,
        collections: datasetData?.collections,
        collectionAssignment: datasetData?.collectionAssignment
      });

      // Check if the project exists
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const projectData = projectDoc.data();
      const organizationId = projectData?.organizationId || projectData?.organization_id;
      
      console.log('🔍 [CloudProjectIntegration] Project data:', {
        id: projectId,
        name: projectData?.name,
        organizationId: organizationId
      });
      
      // Update the dataset to assign it to the project
      await updateDoc(datasetRef, {
        projectId: projectId,
        updatedAt: new Date().toISOString()
      });

      // 🚨 CRITICAL FIX: Check if assignment already exists to avoid duplicates
      const existingAssignmentQuery = query(
        collection(db, 'project_datasets'),
        where('projectId', '==', projectId),
        where('datasetId', '==', datasetId)
      );
      
      const existingAssignmentSnapshot = await getDocs(existingAssignmentQuery);
      
      if (!existingAssignmentSnapshot.empty) {
        console.log('⚠️ [CloudProjectIntegration] Dataset already assigned to project, updating existing assignment');
        
        // Update existing assignment with latest collection data
        const existingDoc = existingAssignmentSnapshot.docs[0];
        const existingData = existingDoc.data();
        
        // 🚨 CRITICAL FIX: Extract collection assignments from dataset
        const collections = datasetData?.collections || 
                          datasetData?.collectionAssignment?.selectedCollections || 
                          [];
        
        await updateDoc(existingDoc.ref, {
          assignedCollections: collections,
          collectionAssignment: {
            selectedCollections: collections,
            assignmentMode: 'EXCLUSIVE',
            priority: 1,
            routingEnabled: true
          },
          organizationId: organizationId,
          tenantId: organizationId,
          isActive: true,
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ [CloudProjectIntegration] Updated existing dataset assignment with collection data');
      } else {
        // Create new assignment with full collection data
        console.log('🔍 [CloudProjectIntegration] Creating new dataset assignment with collection data');
        
        // 🚨 CRITICAL FIX: Extract collection assignments from dataset
        const collections = datasetData?.collections || 
                          datasetData?.collectionAssignment?.selectedCollections || 
                          [];
        
        console.log('🔍 [CloudProjectIntegration] Extracted collections for assignment:', collections);
        
        const projectDatasetLink = {
          projectId: projectId,
          datasetId: datasetId,
          addedByUserId: datasetData?.ownerId || 'system',
          addedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // 🚨 CRITICAL FIX: Include collection assignment data for Dashboard compatibility
          assignedCollections: collections,
          collectionAssignment: {
            selectedCollections: collections,
            assignmentMode: 'EXCLUSIVE',
            priority: 1,
            routingEnabled: true
          },
          organizationId: organizationId,
          tenantId: organizationId,
          isActive: true
        };

        await addDoc(collection(db, 'project_datasets'), projectDatasetLink);
        console.log('✅ [CloudProjectIntegration] Created new dataset assignment with collection data');
      }

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
