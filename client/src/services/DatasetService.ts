/**
 * DatasetService - Handles all dataset-related operations
 */
import { BaseService } from './base/BaseService';
import { CloudDataset, ServiceConfig } from './models/types';
import { FirestoreAdapter } from './adapters/FirestoreAdapter';

export class DatasetService extends BaseService {
  private static instance: DatasetService;

  private constructor(config: ServiceConfig) {
    super(config);
  }

  public static getInstance(config: ServiceConfig): DatasetService {
    if (!DatasetService.instance) {
      DatasetService.instance = new DatasetService(config);
    }
    return DatasetService.instance;
  }

  /**
   * List datasets with optional filters
   */
  public async listDatasets(params?: {
    organizationId?: string;
    visibility?: string;
    backend?: string;
    query?: string;
  }): Promise<CloudDataset[]> {
    try {
      console.log('🚀 [DatasetService] Listing datasets with params:', params);
      
      if (this.isWebOnlyMode()) {
        // In web-only mode, we want to show available (unassigned) datasets
        return await this.getAvailableDatasetsFromFirestore(params);
      }
      
      // Build query string for API request
      const qs = new URLSearchParams();
      if (params?.organizationId) {
        qs.append('organizationId', params.organizationId);
      }
      if (params?.visibility) {
        qs.append('visibility', params.visibility);
      }
      if (params?.backend && params.backend !== 'all') {
        qs.append('backend', params.backend);
      }
      if (params?.query) {
        qs.append('query', params.query);
      }
      
      try {
        const result = await this.apiRequest<CloudDataset[]>(`datasets${qs.toString() ? `?${qs}` : ''}`);
        return result;
      } catch (error) {
        console.warn('⚠️ [DatasetService] API request failed, falling back to Firestore');
        return await this.getAvailableDatasetsFromFirestore(params);
      }
    } catch (error) {
      this.handleError(error, 'listDatasets');
      return [];
    }
  }

  /**
   * Create a new dataset
   */
  public async createDataset(input: Omit<CloudDataset, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { organizationId?: string | null }): Promise<CloudDataset | null> {
    try {
      console.log('🚀 [DatasetService] Creating dataset');
      
      if (this.isWebOnlyMode()) {
        return await this.createDatasetInFirestore(input);
      }
      
      // Prepare payload for API
      const payload = { ...input };
      
      try {
        const result = await this.apiRequest<CloudDataset>('datasets', 'POST', payload);
        return result;
      } catch (error) {
        console.warn('⚠️ [DatasetService] API request failed, falling back to Firestore');
        return await this.createDatasetInFirestore(input);
      }
    } catch (error) {
      this.handleError(error, 'createDataset');
      return null;
    }
  }

  /**
   * Get datasets for a specific project
   */
  public async getProjectDatasets(projectId: string): Promise<CloudDataset[]> {
    try {
      console.log(`🚀 [DatasetService] Getting datasets for project: ${projectId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.getProjectDatasetsFromFirestore(projectId);
      }
      
      try {
        const result = await this.apiRequest<CloudDataset[]>(`datasets/project/${projectId}`, 'GET');
        return result;
      } catch (error) {
        console.warn('⚠️ [DatasetService] API request failed, falling back to Firestore');
        return await this.getProjectDatasetsFromFirestore(projectId);
      }
    } catch (error) {
      this.handleError(error, `getProjectDatasets(${projectId})`);
      return [];
    }
  }

  /**
   * Assign a dataset to a project
   */
  public async assignDatasetToProject(projectId: string, datasetId: string): Promise<boolean> {
    try {
      console.log(`🚀 [DatasetService] Assigning dataset ${datasetId} to project ${projectId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.assignDatasetToProjectInFirestore(projectId, datasetId);
      }
      
      try {
        await this.apiRequest(`projects/${projectId}/datasets/${datasetId}`, 'POST');
        return true;
      } catch (error) {
        console.warn('⚠️ [DatasetService] API request failed, falling back to Firestore');
        return await this.assignDatasetToProjectInFirestore(projectId, datasetId);
      }
    } catch (error) {
      this.handleError(error, `assignDatasetToProject(${projectId}, ${datasetId})`);
      return false;
    }
  }

  /**
   * Unassign a dataset from a project
   */
  public async unassignDatasetFromProject(projectId: string, datasetId: string): Promise<boolean> {
    try {
      console.log(`🚀 [DatasetService] Unassigning dataset ${datasetId} from project ${projectId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.unassignDatasetFromProjectInFirestore(projectId, datasetId);
      }
      
      try {
        await this.apiRequest(`projects/${projectId}/datasets/${datasetId}`, 'DELETE');
        return true;
      } catch (error) {
        console.warn('⚠️ [DatasetService] API request failed, falling back to Firestore');
        return await this.unassignDatasetFromProjectInFirestore(projectId, datasetId);
      }
    } catch (error) {
      this.handleError(error, `unassignDatasetFromProject(${projectId}, ${datasetId})`);
      return false;
    }
  }

  /**
   * Get available datasets (not assigned to any project) from Firestore
   */
  private async getAvailableDatasetsFromFirestore(params?: {
    organizationId?: string;
    visibility?: string;
    backend?: string;
    query?: string;
  }): Promise<CloudDataset[]> {
    try {
      console.log('🔍 [DatasetService] Fetching available datasets from Firestore');
      
      await this.firestoreAdapter.initialize();
      
      // Get current user and their organization ID
      const currentUser = this.firestoreAdapter.getCurrentUser();
      
      if (!currentUser) {
        console.log('❌ [DatasetService] No authenticated user found');
        return [];
      }
      
      // Get user's organization ID from Firestore
      let organizationId: string | null = null;
      
      try {
        // Try to get user document by Firebase UID
        const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
        if (userDoc && userDoc.organizationId) {
          organizationId = userDoc.organizationId;
          console.log('✅ [DatasetService] Found organization ID from user document:', organizationId);
        } else {
          // Try to find user by email
          const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
            { field: 'email', operator: '==', value: currentUser.email }
          ]);
          
          if (userByEmail.length > 0 && userByEmail[0].organizationId) {
            organizationId = userByEmail[0].organizationId;
            console.log('✅ [DatasetService] Found organization ID from user email query:', organizationId);
          }
        }
      } catch (error) {
        console.warn('⚠️ [DatasetService] Error getting user organization:', error);
      }
      
      if (!organizationId) {
        console.log('❌ [DatasetService] No organization ID found for user');
        return [];
      }

      console.log('🏢 [DatasetService] Fetching available datasets for organization:', organizationId);

      // Get all datasets for the organization
      const allDatasets = await this.firestoreAdapter.queryDocuments<CloudDataset>('datasets', [
        { field: 'organizationId', operator: '==', value: params?.organizationId || organizationId }
      ]);

      // Filter out assigned datasets
      const availableDatasets = allDatasets.filter(dataset => {
        // Check if dataset has any project assignments
        const hasProjectAssignments = dataset.projectIds && dataset.projectIds.length > 0;
        return !hasProjectAssignments;
      });
      
      // Apply in-memory filters
      let filteredDatasets = availableDatasets;
      
      // Apply backend filter if provided
      if (params?.backend && params.backend !== 'all') {
        filteredDatasets = filteredDatasets.filter(dataset => {
          const datasetBackend = dataset.storage?.backend || 'firestore';
          return datasetBackend === params.backend;
        });
      }
      
      // Apply query filter if provided (search by name or description)
      if (params?.query) {
        const searchTerm = params.query.toLowerCase();
        filteredDatasets = filteredDatasets.filter(dataset => {
          const name = (dataset.name || '').toLowerCase();
          const description = (dataset.description || '').toLowerCase();
          return name.includes(searchTerm) || description.includes(searchTerm);
        });
      }
      
      // Apply visibility filter if provided
      if (params?.visibility) {
        filteredDatasets = filteredDatasets.filter(dataset => {
          const datasetVisibility = dataset.visibility || 'private';
          return datasetVisibility === params.visibility;
        });
      }
      
      // Sort results in memory to avoid Firestore index requirements
      filteredDatasets.sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log(`✅ [DatasetService] Found ${filteredDatasets.length} available datasets from Firestore`);
      return filteredDatasets;
    } catch (error) {
      this.handleError(error, 'getAvailableDatasetsFromFirestore');
      return [];
    }
  }

  /**
   * List datasets from Firestore with optional filters
   */
  private async listDatasetsFromFirestore(params?: {
    organizationId?: string;
    visibility?: string;
    backend?: string;
    query?: string;
  }): Promise<CloudDataset[]> {
    try {
      console.log('🔍 [DatasetService] Fetching datasets from Firestore with params:', params);
      
      await this.firestoreAdapter.initialize();
      
      // Get current user and their organization ID
      const currentUser = this.firestoreAdapter.getCurrentUser();
      
      if (!currentUser) {
        console.log('❌ [DatasetService] No authenticated user found');
        return [];
      }
      
      // Get user's organization ID from Firestore
      let organizationId: string | null = null;
      
      try {
        // Try to get user document by Firebase UID
        const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
        if (userDoc && userDoc.organizationId) {
          organizationId = userDoc.organizationId;
          console.log('✅ [DatasetService] Found organization ID from user document:', organizationId);
        } else {
          // Try to find user by email
          const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
            { field: 'email', operator: '==', value: currentUser.email }
          ]);
          
          if (userByEmail.length > 0 && userByEmail[0].organizationId) {
            organizationId = userByEmail[0].organizationId;
            console.log('✅ [DatasetService] Found organization ID from user email query:', organizationId);
          }
        }
      } catch (error) {
        console.warn('⚠️ [DatasetService] Error getting user organization:', error);
      }
      
      if (!organizationId) {
        console.log('❌ [DatasetService] No organization ID found for user');
        return [];
      }

      console.log('🏢 [DatasetService] Fetching datasets for organization:', organizationId);

      // Query datasets for the organization
      const queryConditions: Array<{
        field: string;
        operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'array-contains-any';
        value: any;
      }> = [];
      
      // Add organization filter - SECURITY: Always use current user's organizationId, never allow override
      queryConditions.push({
        field: 'organizationId',
        operator: '==',
        value: organizationId // Only use current user's organizationId for security
      });
      
      const datasets = await this.firestoreAdapter.queryDocuments<CloudDataset>('datasets', queryConditions);
      
      // Apply in-memory filters
      let filteredDatasets = datasets;
      
      // Apply backend filter if provided
      if (params?.backend && params.backend !== 'all') {
        filteredDatasets = filteredDatasets.filter(dataset => {
          const datasetBackend = dataset.storage?.backend || 'firestore';
          return datasetBackend === params.backend;
        });
      }
      
      // Apply query filter if provided (search by name or description)
      if (params?.query) {
        const searchTerm = params.query.toLowerCase();
        filteredDatasets = filteredDatasets.filter(dataset => {
          const name = (dataset.name || '').toLowerCase();
          const description = (dataset.description || '').toLowerCase();
          return name.includes(searchTerm) || description.includes(searchTerm);
        });
      }
      
      // Apply visibility filter if provided
      if (params?.visibility) {
        filteredDatasets = filteredDatasets.filter(dataset => {
          const datasetVisibility = dataset.visibility || 'private';
          return datasetVisibility === params.visibility;
        });
      }
      
      // Sort results in memory to avoid Firestore index requirements
      filteredDatasets.sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log(`✅ [DatasetService] Found ${filteredDatasets.length} datasets from Firestore`);
      return filteredDatasets;
    } catch (error) {
      this.handleError(error, 'listDatasetsFromFirestore');
      return [];
    }
  }

  /**
   * Create a dataset in Firestore
   */
  private async createDatasetInFirestore(input: Omit<CloudDataset, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { organizationId?: string | null }): Promise<CloudDataset | null> {
    try {
      console.log('🔍 [DatasetService] Creating dataset in Firestore');
      
      await this.firestoreAdapter.initialize();
      
      // Get organization ID from input or current user
      let organizationId = input.organizationId;
      if (!organizationId) {
        const currentUser = this.firestoreAdapter.getCurrentUser();
        if (currentUser) {
          try {
            // Try to get user document by Firebase UID
            const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
            if (userDoc && userDoc.organizationId) {
              organizationId = userDoc.organizationId;
            } else {
              // Try to find user by email
              const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
                { field: 'email', operator: '==', value: currentUser.email }
              ]);
              
              if (userByEmail.length > 0 && userByEmail[0].organizationId) {
                organizationId = userByEmail[0].organizationId;
              }
            }
          } catch (error) {
            console.warn('⚠️ [DatasetService] Error getting user organization for dataset creation:', error);
          }
        }
        
        if (!organizationId) {
          console.warn('⚠️ [DatasetService] No organization ID found for dataset creation');
          return null;
        }
        
        console.log('✅ [DatasetService] Using organization ID for dataset creation:', organizationId);
      }
      
      // Prepare dataset data
      const datasetData = {
        ...input,
        ownerId: 'l5YKvrhAD72EV2MnugbS', // enterprise.user ID
        organizationId,
        visibility: input.visibility || 'private',
        storage: input.storage || { backend: 'firestore' },
        status: input.status || 'active',
        projectIds: [], // Initialize empty array for project assignments
        primaryProjectId: null // Initialize primary project as null
      };
      
      return await this.firestoreAdapter.createDocument<CloudDataset>('datasets', datasetData);
    } catch (error) {
      this.handleError(error, 'createDatasetInFirestore');
      return null;
    }
  }

  /**
   * Get project datasets from Firestore
   */
  private async getProjectDatasetsFromFirestore(projectId: string): Promise<CloudDataset[]> {
    try {
      console.log(`🔍 [DatasetService] Fetching datasets from Firestore for project: ${projectId}`);
      
      await this.firestoreAdapter.initialize();
      
      // Get current user to get organization ID for security rules
      const currentUser = this.firestoreAdapter.getCurrentUser();
      if (!currentUser) {
        console.warn('⚠️ [DatasetService] No authenticated user found');
        return [];
      }

      // Get user's organization ID from Firestore
      let organizationId: string | null = null;
      try {
        const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
        if (userDoc && userDoc.organizationId) {
          organizationId = userDoc.organizationId;
        } else {
          // Try to find user by email
          const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
            { field: 'email', operator: '==', value: currentUser.email }
          ]);
          
          if (userByEmail.length > 0 && userByEmail[0].organizationId) {
            organizationId = userByEmail[0].organizationId;
          }
        }
      } catch (error) {
        console.warn('⚠️ [DatasetService] Error getting user organization:', error);
      }

      if (!organizationId) {
        console.warn('⚠️ [DatasetService] No organization ID found for user');
        return [];
      }

      // First, get the project-dataset links from the project_datasets collection
      // Include organizationId to satisfy Firestore security rules
      const projectDatasetLinks = await this.firestoreAdapter.queryDocuments('project_datasets', [
        { field: 'projectId', operator: '==', value: projectId },
        { field: 'organizationId', operator: '==', value: organizationId }
      ]);

      if (projectDatasetLinks.length === 0) {
        console.log(`✅ [DatasetService] No datasets found for project ${projectId}`);
        return [];
      }

      // Extract dataset IDs from the links
      const datasetIds = projectDatasetLinks.map(link => link.datasetId);
      
      // Fetch the actual dataset documents
      const datasets: CloudDataset[] = [];
      for (const datasetId of datasetIds) {
        const dataset = await this.firestoreAdapter.getDocumentById<CloudDataset>('datasets', datasetId);
        if (dataset) {
          datasets.push(dataset);
        }
      }
      
      // Sort results in memory to avoid Firestore index requirements
      datasets.sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log(`✅ [DatasetService] Found ${datasets.length} datasets for project ${projectId}`);
      return datasets;
    } catch (error) {
      this.handleError(error, `getProjectDatasetsFromFirestore(${projectId})`);
      return [];
    }
  }

  /**
   * Assign a dataset to a project in Firestore
   */
  private async assignDatasetToProjectInFirestore(projectId: string, datasetId: string): Promise<boolean> {
    try {
      console.log(`🔍 [DatasetService] Assigning dataset to project in Firestore: ${projectId}, ${datasetId}`);
      
      await this.firestoreAdapter.initialize();
      
      // Get current user's organization ID for validation
      const currentUser = this.firestoreAdapter.getCurrentUser();
      let userOrganizationId: string | null = null;
      
      if (currentUser) {
        try {
          const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
          if (userDoc && userDoc.organizationId) {
            userOrganizationId = userDoc.organizationId;
          } else {
            const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
              { field: 'email', operator: '==', value: currentUser.email }
            ]);
            
            if (userByEmail.length > 0 && userByEmail[0].organizationId) {
              userOrganizationId = userByEmail[0].organizationId;
            }
          }
        } catch (error) {
          console.warn('⚠️ [DatasetService] Error getting user organization for validation:', error);
        }
      }
      
      if (!userOrganizationId) {
        console.warn('⚠️ [DatasetService] No organization ID found for current user');
        return false;
      }

      // Check if the dataset exists and belongs to user's organization
      const dataset = await this.firestoreAdapter.getDocumentById<CloudDataset>('datasets', datasetId);
      
      if (!dataset) {
        console.warn(`⚠️ [DatasetService] Dataset not found: ${datasetId}`);
        
        // Debug: List all available datasets to help identify the issue
        try {
          const allDatasets = await this.firestoreAdapter.queryDocuments<CloudDataset>('datasets', [
            { field: 'organizationId', operator: '==', value: userOrganizationId }
          ]);
          console.log(`🔍 [DatasetService] Available datasets in user's organization (${userOrganizationId}):`, allDatasets);
          console.log(`🔍 [DatasetService] Available dataset IDs:`, allDatasets.map(ds => ds.id));
          console.log(`🔍 [DatasetService] Requested dataset ID: "${datasetId}" (type: ${typeof datasetId})`);
          
          // Check each dataset individually for exact match
          allDatasets.forEach((ds, index) => {
            const matches = ds.id === datasetId;
            console.log(`🔍 [DatasetService] Dataset ${index}: ID="${ds.id}", Name="${ds.name}", Matches=${matches}`);
          });
        } catch (debugError) {
          console.warn('⚠️ [DatasetService] Could not fetch datasets for debugging:', debugError);
        }
        
        return false;
      }
      
      // SECURITY: Verify dataset belongs to user's organization
      if (dataset.organizationId !== userOrganizationId) {
        console.error(`🚨 [DatasetService] SECURITY VIOLATION: User tried to access dataset from different organization. User org: ${userOrganizationId}, Dataset org: ${dataset.organizationId}`);
        return false;
      }

      // Check if the project exists and belongs to user's organization
      const project = await this.firestoreAdapter.getDocumentById<any>('projects', projectId);
      
      if (!project) {
        console.warn(`⚠️ [DatasetService] Project not found: ${projectId}`);
        return false;
      }
      
      // SECURITY: Verify project belongs to user's organization
      if (project.organizationId !== userOrganizationId) {
        console.error(`🚨 [DatasetService] SECURITY VIOLATION: User tried to assign dataset to project from different organization. User org: ${userOrganizationId}, Project org: ${project.organizationId}`);
        return false;
      }
      
      // Update the dataset to assign it to the project
      const datasetUpdateSuccess = await this.firestoreAdapter.updateDocumentWithArrayOps<CloudDataset>('datasets', datasetId, {
        // Support multiple project assignments
        projectIds: FirestoreAdapter.arrayUnion(projectId),
        primaryProjectId: projectId, // Set as primary for backward compatibility
        updatedAt: new Date().toISOString()
      });

      if (!datasetUpdateSuccess) {
        console.warn(`⚠️ [DatasetService] Failed to update dataset: ${datasetId}`);
        return false;
      }

      // Reuse the current user and organizationId from above validation
      let linkOrganizationId = userOrganizationId;

      // Create a link in the project_datasets collection (following server-side pattern)
      const projectDatasetLink = {
        projectId: projectId,
        datasetId: datasetId,
        organizationId: linkOrganizationId, // SECURITY: Always use validated user organization ID
        addedByUserId: currentUser?.uid || 'system',
        addedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const linkSuccess = await this.firestoreAdapter.createDocument('project_datasets', projectDatasetLink);
      
      if (!linkSuccess) {
        console.warn(`⚠️ [DatasetService] Failed to create project-dataset link`);
        // Try to rollback dataset update
        await this.firestoreAdapter.updateDocumentWithArrayOps<CloudDataset>('datasets', datasetId, {
          projectIds: FirestoreAdapter.arrayRemove(projectId),
          primaryProjectId: null,
          updatedAt: new Date().toISOString()
        });
        return false;
      }

      // Update the project document to reflect the dataset assignment
      const projectUpdateSuccess = await this.firestoreAdapter.updateDocument('projects', projectId, {
        updatedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      });

      if (!projectUpdateSuccess) {
        console.warn(`⚠️ [DatasetService] Failed to update project: ${projectId}, but dataset assignment succeeded`);
        // Don't fail the entire operation if project update fails
      }
      
      console.log(`✅ [DatasetService] Dataset successfully assigned to project in Firestore`);
      return true;
    } catch (error) {
      this.handleError(error, `assignDatasetToProjectInFirestore(${projectId}, ${datasetId})`);
      return false;
    }
  }

  /**
   * Unassign a dataset from a project in Firestore
   */
  private async unassignDatasetFromProjectInFirestore(projectId: string, datasetId: string): Promise<boolean> {
    try {
      console.log(`🔍 [DatasetService] Unassigning dataset from project in Firestore: ${projectId}, ${datasetId}`);
      
      await this.firestoreAdapter.initialize();
      
      // Check if the dataset exists
      const dataset = await this.firestoreAdapter.getDocumentById<CloudDataset>('datasets', datasetId);
      
      if (!dataset) {
        console.warn(`⚠️ [DatasetService] Dataset not found: ${datasetId}`);
        return false;
      }
      
      // Check if the dataset is actually assigned to this project
      if (!dataset.projectIds?.includes(projectId)) {
        console.warn(`⚠️ [DatasetService] Dataset is not assigned to this project: ${datasetId}, ${projectId}`);
        return false;
      }
      
      // Update the dataset to remove the project assignment
      const datasetUpdateSuccess = await this.firestoreAdapter.updateDocumentWithArrayOps<CloudDataset>('datasets', datasetId, {
        projectIds: FirestoreAdapter.arrayRemove(projectId),
        updatedAt: new Date().toISOString()
      });

      if (!datasetUpdateSuccess) {
        console.warn(`⚠️ [DatasetService] Failed to update dataset: ${datasetId}`);
        return false;
      }

      // Get current user's organization ID for the query
      const currentUser = this.firestoreAdapter.getCurrentUser();
      let organizationId: string | null = null;
      
      if (currentUser) {
        try {
          const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
          if (userDoc && userDoc.organizationId) {
            organizationId = userDoc.organizationId;
          } else {
            const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
              { field: 'email', operator: '==', value: currentUser.email }
            ]);
            
            if (userByEmail.length > 0 && userByEmail[0].organizationId) {
              organizationId = userByEmail[0].organizationId;
            }
          }
        } catch (error) {
          console.warn('⚠️ [DatasetService] Error getting user organization:', error);
        }
      }

      if (!organizationId) {
        console.warn('⚠️ [DatasetService] No organization ID found for user');
        return false;
      }

      // Remove the link from the project_datasets collection
      // First, find the link document (include organizationId for security rules)
      const links = await this.firestoreAdapter.queryDocuments('project_datasets', [
        { field: 'projectId', operator: '==', value: projectId },
        { field: 'datasetId', operator: '==', value: datasetId },
        { field: 'organizationId', operator: '==', value: organizationId }
      ]);

      if (links.length > 0) {
        // Delete the link document
        const linkDeleteSuccess = await this.firestoreAdapter.deleteDocument('project_datasets', links[0].id);
        
        if (!linkDeleteSuccess) {
          console.warn(`⚠️ [DatasetService] Failed to delete project-dataset link`);
          // Try to rollback dataset update
          await this.firestoreAdapter.updateDocumentWithArrayOps<CloudDataset>('datasets', datasetId, {
            projectIds: FirestoreAdapter.arrayUnion(projectId),
            updatedAt: new Date().toISOString()
          });
          return false;
        }
      }

      // Update the project document to reflect the dataset removal
      const projectUpdateSuccess = await this.firestoreAdapter.updateDocument('projects', projectId, {
        updatedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString()
      });

      if (!projectUpdateSuccess) {
        console.warn(`⚠️ [DatasetService] Failed to update project: ${projectId}, but dataset unassignment succeeded`);
        // Don't fail the entire operation if project update fails
      }
      
      console.log(`✅ [DatasetService] Dataset successfully unassigned from project in Firestore`);
      return true;
    } catch (error) {
      this.handleError(error, `unassignDatasetFromProjectInFirestore(${projectId}, ${datasetId})`);
      return false;
    }
  }

  /**
   * Update a dataset
   */
  public async updateDataset(datasetId: string, updates: Partial<CloudDataset>): Promise<CloudDataset | null> {
    try {
      console.log(`🔄 [DatasetService] Updating dataset: ${datasetId}`, updates);
      
      if (this.isWebOnlyMode()) {
        return await this.updateDatasetInFirestore(datasetId, updates);
      }
      
      try {
        const response = await this.apiRequest(`datasets/${datasetId}`, 'PATCH', updates);
        return response.data;
      } catch (error) {
        console.warn('⚠️ [DatasetService] API request failed, falling back to Firestore');
        return await this.updateDatasetInFirestore(datasetId, updates);
      }
    } catch (error) {
      this.handleError(error, `updateDataset(${datasetId})`);
      return null;
    }
  }

  /**
   * Update a dataset in Firestore
   */
  private async updateDatasetInFirestore(datasetId: string, updates: Partial<CloudDataset>): Promise<CloudDataset | null> {
    try {
      console.log(`🔄 [DatasetService] Updating dataset in Firestore: ${datasetId}`, updates);
      
      await this.firestoreAdapter.initialize();
      
      // Get current user's organization ID for validation
      const currentUser = this.firestoreAdapter.getCurrentUser();
      let userOrganizationId: string | null = null;
      
      if (currentUser) {
        try {
          const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
          if (userDoc && userDoc.organizationId) {
            userOrganizationId = userDoc.organizationId;
          } else {
            const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
              { field: 'email', operator: '==', value: currentUser.email }
            ]);
            
            if (userByEmail.length > 0 && userByEmail[0].organizationId) {
              userOrganizationId = userByEmail[0].organizationId;
            }
          }
        } catch (error) {
          console.warn('⚠️ [DatasetService] Error getting user organization:', error);
        }
      }

      if (!userOrganizationId) {
        console.warn('⚠️ [DatasetService] No organization ID found for user');
        return null;
      }

      // Check if the dataset exists and belongs to user's organization
      const existingDataset = await this.firestoreAdapter.getDocumentById<CloudDataset>('datasets', datasetId);
      
      if (!existingDataset) {
        console.warn(`⚠️ [DatasetService] Dataset not found: ${datasetId}`);
        return null;
      }
      
      // SECURITY: Verify dataset belongs to user's organization
      if (existingDataset.organizationId !== userOrganizationId) {
        console.error(`🚨 [DatasetService] SECURITY VIOLATION: User tried to update dataset from different organization. User org: ${userOrganizationId}, Dataset org: ${existingDataset.organizationId}`);
        return null;
      }

      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
        // Ensure organizationId cannot be changed
        organizationId: existingDataset.organizationId
      };

      // Remove undefined values and id field
      const cleanedUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([key, value]) => value !== undefined && key !== 'id')
      );

      // Update the dataset
      const success = await this.firestoreAdapter.updateDocument<CloudDataset>('datasets', datasetId, cleanedUpdateData);
      
      if (success) {
        // Return the updated dataset
        const updatedDataset = await this.firestoreAdapter.getDocumentById<CloudDataset>('datasets', datasetId);
        console.log(`✅ [DatasetService] Dataset successfully updated in Firestore: ${datasetId}`);
        return updatedDataset;
      }
      
      console.warn(`⚠️ [DatasetService] Failed to update dataset in Firestore: ${datasetId}`);
      return null;
    } catch (error) {
      this.handleError(error, `updateDatasetInFirestore(${datasetId})`);
      return null;
    }
  }

  /**
   * Delete a dataset permanently
   */
  public async deleteDataset(datasetId: string): Promise<boolean> {
    try {
      console.log(`🗑️ [DatasetService] Deleting dataset: ${datasetId}`);
      
      if (this.isWebOnlyMode()) {
        return await this.deleteDatasetFromFirestore(datasetId);
      }
      
      try {
        await this.apiRequest(`datasets/${datasetId}`, 'DELETE');
        return true;
      } catch (error) {
        console.warn('⚠️ [DatasetService] API request failed, falling back to Firestore');
        return await this.deleteDatasetFromFirestore(datasetId);
      }
    } catch (error) {
      this.handleError(error, `deleteDataset(${datasetId})`);
      return false;
    }
  }

  /**
   * Delete a dataset from Firestore
   */
  private async deleteDatasetFromFirestore(datasetId: string): Promise<boolean> {
    try {
      console.log(`🗑️ [DatasetService] Deleting dataset from Firestore: ${datasetId}`);
      
      await this.firestoreAdapter.initialize();
      
      // Get current user's organization ID for validation
      const currentUser = this.firestoreAdapter.getCurrentUser();
      let userOrganizationId: string | null = null;
      
      if (currentUser) {
        try {
          const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
          if (userDoc && userDoc.organizationId) {
            userOrganizationId = userDoc.organizationId;
          } else {
            const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
              { field: 'email', operator: '==', value: currentUser.email }
            ]);
            
            if (userByEmail.length > 0 && userByEmail[0].organizationId) {
              userOrganizationId = userByEmail[0].organizationId;
            }
          }
        } catch (error) {
          console.warn('⚠️ [DatasetService] Error getting user organization:', error);
        }
      }

      if (!userOrganizationId) {
        console.warn('⚠️ [DatasetService] No organization ID found for user');
        return false;
      }

      // Check if the dataset exists and belongs to user's organization
      const dataset = await this.firestoreAdapter.getDocumentById<CloudDataset>('datasets', datasetId);
      
      if (!dataset) {
        console.warn(`⚠️ [DatasetService] Dataset not found: ${datasetId}`);
        return false;
      }
      
      // SECURITY: Verify dataset belongs to user's organization
      if (dataset.organizationId !== userOrganizationId) {
        console.error(`🚨 [DatasetService] SECURITY VIOLATION: User tried to delete dataset from different organization. User org: ${userOrganizationId}, Dataset org: ${dataset.organizationId}`);
        return false;
      }

      // Clean up project-dataset links first
      const projectDatasetLinks = await this.firestoreAdapter.queryDocuments('project_datasets', [
        { field: 'datasetId', operator: '==', value: datasetId },
        { field: 'organizationId', operator: '==', value: userOrganizationId }
      ]);

      // Delete all project-dataset links
      for (const link of projectDatasetLinks) {
        await this.firestoreAdapter.deleteDocument('project_datasets', link.id);
      }

      // Remove dataset from any projects that reference it
      if (dataset.projectIds && dataset.projectIds.length > 0) {
        for (const projectId of dataset.projectIds) {
          try {
            const project = await this.firestoreAdapter.getDocumentById<any>('projects', projectId);
            if (project && project.organizationId === userOrganizationId) {
              // Update project to remove dataset reference
              await this.firestoreAdapter.updateDocumentWithArrayOps<any>('projects', projectId, {
                datasetIds: FirestoreAdapter.arrayRemove(datasetId),
                updatedAt: new Date().toISOString()
              });
            }
          } catch (error) {
            console.warn(`⚠️ [DatasetService] Failed to update project ${projectId} during dataset deletion:`, error);
          }
        }
      }

      // Finally, delete the dataset document
      const success = await this.firestoreAdapter.deleteDocument('datasets', datasetId);
      
      if (success) {
        console.log(`✅ [DatasetService] Dataset successfully deleted from Firestore: ${datasetId}`);
        return true;
      }
      
      console.warn(`⚠️ [DatasetService] Failed to delete dataset from Firestore: ${datasetId}`);
      return false;
    } catch (error) {
      this.handleError(error, `deleteDatasetFromFirestore(${datasetId})`);
      return false;
    }
  }

  /**
   * Clean up corrupted datasets by organization
   */
  public async cleanupCorruptedDatasets(): Promise<{ cleaned: number; errors: string[] }> {
    try {
      console.log('🧹 [DatasetService] Starting cleanup of corrupted datasets');
      
      await this.firestoreAdapter.initialize();
      
      // Get current user's organization ID
      const currentUser = this.firestoreAdapter.getCurrentUser();
      let userOrganizationId: string | null = null;
      
      if (currentUser) {
        try {
          const userDoc = await this.firestoreAdapter.getDocumentById('users', currentUser.uid);
          if (userDoc && userDoc.organizationId) {
            userOrganizationId = userDoc.organizationId;
          } else {
            const userByEmail = await this.firestoreAdapter.queryDocuments('users', [
              { field: 'email', operator: '==', value: currentUser.email }
            ]);
            
            if (userByEmail.length > 0 && userByEmail[0].organizationId) {
              userOrganizationId = userByEmail[0].organizationId;
            }
          }
        } catch (error) {
          console.warn('⚠️ [DatasetService] Error getting user organization:', error);
        }
      }

      if (!userOrganizationId) {
        throw new Error('No organization ID found for user');
      }

      // Get all datasets for the organization
      const allDatasets = await this.firestoreAdapter.queryDocuments<CloudDataset>('datasets', [
        { field: 'organizationId', operator: '==', value: userOrganizationId }
      ]);

      const corruptedDatasets = allDatasets.filter(dataset => {
        // Define criteria for corrupted datasets
        return (
          !dataset.name || 
          !dataset.id || 
          dataset.id === 'dataset-001' || 
          dataset.id === 'dataset-002' ||
          typeof dataset.id !== 'string' ||
          dataset.id.trim() === ''
        );
      });

      console.log(`🔍 [DatasetService] Found ${corruptedDatasets.length} corrupted datasets to clean up`);

      const errors: string[] = [];
      let cleaned = 0;

      for (const dataset of corruptedDatasets) {
        try {
          const success = await this.deleteDatasetFromFirestore(dataset.id);
          if (success) {
            cleaned++;
            console.log(`✅ [DatasetService] Cleaned up corrupted dataset: ${dataset.id}`);
          } else {
            errors.push(`Failed to delete dataset: ${dataset.id}`);
          }
        } catch (error) {
          errors.push(`Error deleting dataset ${dataset.id}: ${error}`);
        }
      }

      console.log(`🧹 [DatasetService] Cleanup completed. Cleaned: ${cleaned}, Errors: ${errors.length}`);
      return { cleaned, errors };
    } catch (error) {
      this.handleError(error, 'cleanupCorruptedDatasets()');
      return { cleaned: 0, errors: [error.toString()] };
    }
  }

}