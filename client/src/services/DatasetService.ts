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
   * List all datasets with optional filters
   */
  public async listDatasets(params?: {
    organizationId?: string;
    visibility?: 'private' | 'organization' | 'public';
    backend?: 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local' | 'all';
    query?: string;
  }): Promise<CloudDataset[]> {
    try {
      console.log('🚀 [DatasetService] Listing datasets with params:', params);
      
      if (this.isWebOnlyMode()) {
        return await this.listDatasetsFromFirestore(params);
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
        return await this.listDatasetsFromFirestore(params);
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
      
      // Query datasets assigned to this project
      const datasets = await this.firestoreAdapter.queryDocuments<CloudDataset>('datasets', [
        { field: 'projectId', operator: '==', value: projectId }
      ]);
      
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
      
      // Update the dataset to assign it to the project
      const success = await this.firestoreAdapter.updateDocument<CloudDataset>('datasets', datasetId, {
        projectId: projectId
      });
      
      console.log(`✅ [DatasetService] Dataset ${success ? 'assigned' : 'failed to assign'} to project in Firestore`);
      return success;
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
      const success = await this.firestoreAdapter.updateDocument<CloudDataset>('datasets', datasetId, {
        projectId: null
      });
      
      console.log(`✅ [DatasetService] Dataset ${success ? 'unassigned' : 'failed to unassign'} from project in Firestore`);
      return success;
    } catch (error) {
      this.handleError(error, `unassignDatasetFromProjectInFirestore(${projectId}, ${datasetId})`);
      return false;
    }
  }
}
