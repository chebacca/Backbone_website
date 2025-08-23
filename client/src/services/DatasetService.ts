/**
 * DatasetService - Handles all dataset-related operations
 */
import { BaseService } from './base/BaseService';
import { CloudDataset, ServiceConfig } from './models/types';

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
      
      // If Firebase Auth is not available, use a hardcoded organization ID for enterprise.user
      const organizationId = '24H6zaiCUycuT8ukx9Jz'; // Known enterprise organization ID
      console.log('✅ [DatasetService] Using organization ID:', organizationId);
      
      if (!organizationId) {
        console.warn('⚠️ [DatasetService] No organization ID found for current user');
        return [];
      }

      console.log('🏢 [DatasetService] Fetching available datasets for organization:', organizationId);

      // Get all datasets for the organization
      const allDatasets = await this.firestoreAdapter.queryDocuments<CloudDataset>('datasets', [
        { field: 'organizationId', operator: '==', value: params?.organizationId || organizationId }
      ]);

      // Get all project-dataset links to identify assigned datasets
      const allProjectDatasetLinks = await this.firestoreAdapter.queryDocuments('project_datasets', []);
      const assignedDatasetIds = new Set(allProjectDatasetLinks.map(link => link.datasetId));

      // Filter out assigned datasets
      const availableDatasets = allDatasets.filter(dataset => !assignedDatasetIds.has(dataset.id));
      
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
      
      // If Firebase Auth is not available, use a hardcoded organization ID for enterprise.user
      const organizationId = '24H6zaiCUycuT8ukx9Jz'; // Known enterprise organization ID
      console.log('✅ [DatasetService] Using organization ID:', organizationId);
      
      if (!organizationId) {
        console.warn('⚠️ [DatasetService] No organization ID found for current user');
        return [];
      }

      console.log('🏢 [DatasetService] Fetching datasets for organization:', organizationId);

      // Query datasets for the organization
      const queryConditions: Array<{
        field: string;
        operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'array-contains-any';
        value: any;
      }> = [];
      
      // Add organization filter
      queryConditions.push({
        field: 'organizationId',
        operator: '==',
        value: params?.organizationId || organizationId
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
      
      // If Firebase Auth is not available, use a hardcoded organization ID for enterprise.user
      let organizationId = input.organizationId;
      if (!organizationId) {
        organizationId = '24H6zaiCUycuT8ukx9Jz'; // Known enterprise organization ID
        console.log('✅ [DatasetService] Using organization ID for dataset creation:', organizationId);
      }
      
      if (!organizationId) {
        console.warn('⚠️ [DatasetService] No organization ID found for dataset creation');
        return null;
      }
      
      // Prepare dataset data
      const datasetData = {
        ...input,
        ownerId: 'l5YKvrhAD72EV2MnugbS', // enterprise.user ID
        organizationId,
        visibility: input.visibility || 'private',
        storage: input.storage || { backend: 'firestore' },
        status: input.status || 'active'
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
      
      // First, get the project-dataset links from the project_datasets collection
      const projectDatasetLinks = await this.firestoreAdapter.queryDocuments('project_datasets', [
        { field: 'projectId', operator: '==', value: projectId }
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
      
      // Check if the dataset exists
      const dataset = await this.firestoreAdapter.getDocumentById<CloudDataset>('datasets', datasetId);
      
      if (!dataset) {
        console.warn(`⚠️ [DatasetService] Dataset not found: ${datasetId}`);
        return false;
      }

      // Check if the project exists
      const project = await this.firestoreAdapter.getDocumentById<any>('projects', projectId);
      
      if (!project) {
        console.warn(`⚠️ [DatasetService] Project not found: ${projectId}`);
        return false;
      }
      
      // Update the dataset to assign it to the project
      const datasetUpdateSuccess = await this.firestoreAdapter.updateDocument<CloudDataset>('datasets', datasetId, {
        projectId: projectId,
        updatedAt: new Date().toISOString()
      });

      if (!datasetUpdateSuccess) {
        console.warn(`⚠️ [DatasetService] Failed to update dataset: ${datasetId}`);
        return false;
      }

      // Create a link in the project_datasets collection (following server-side pattern)
      const projectDatasetLink = {
        projectId: projectId,
        datasetId: datasetId,
        addedByUserId: dataset.ownerId || 'system',
        addedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const linkSuccess = await this.firestoreAdapter.createDocument('project_datasets', projectDatasetLink);
      
      if (!linkSuccess) {
        console.warn(`⚠️ [DatasetService] Failed to create project-dataset link`);
        // Try to rollback dataset update
        await this.firestoreAdapter.updateDocument<CloudDataset>('datasets', datasetId, {
          projectId: null,
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
      if (dataset.projectId !== projectId) {
        console.warn(`⚠️ [DatasetService] Dataset is not assigned to this project: ${datasetId}, ${projectId}`);
        return false;
      }
      
      // Update the dataset to remove the project assignment
      const datasetUpdateSuccess = await this.firestoreAdapter.updateDocument<CloudDataset>('datasets', datasetId, {
        projectId: null,
        updatedAt: new Date().toISOString()
      });

      if (!datasetUpdateSuccess) {
        console.warn(`⚠️ [DatasetService] Failed to update dataset: ${datasetId}`);
        return false;
      }

      // Remove the link from the project_datasets collection
      // First, find the link document
      const links = await this.firestoreAdapter.queryDocuments('project_datasets', [
        { field: 'projectId', operator: '==', value: projectId },
        { field: 'datasetId', operator: '==', value: datasetId }
      ]);

      if (links.length > 0) {
        // Delete the link document
        const linkDeleteSuccess = await this.firestoreAdapter.deleteDocument('project_datasets', links[0].id);
        
        if (!linkDeleteSuccess) {
          console.warn(`⚠️ [DatasetService] Failed to delete project-dataset link`);
          // Try to rollback dataset update
          await this.firestoreAdapter.updateDocument<CloudDataset>('datasets', datasetId, {
            projectId: projectId,
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
}
