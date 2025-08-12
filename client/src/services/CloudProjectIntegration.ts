/**
 * Cloud Project Integration Service
 * 
 * Bridges the new Simplified Startup System with the existing
 * Firebase/GCS cloud project infrastructure from the licensing website.
 * Handles project creation, storage configuration, and API integration.
 */

import {
    ProjectCreationOptions,
    simplifiedStartupSequencer,
    StorageMode
} from './SimplifiedStartupSequencer';
import { ApplicationMode } from '../types/applicationMode';

// Import the existing API service from the licensing website
interface CloudProject {
    id: string;
    name: string;
    description?: string;
    type: string;
    applicationMode: ApplicationMode;
    visibility: 'private' | 'organization' | 'public';
    storageBackend: 'firestore' | 'gcs';
    gcsBucket?: string;
    gcsPrefix?: string;
    ownerId: string;
    organizationId?: string;
    createdAt: string;
    lastAccessedAt: string;
    isActive: boolean;

    // Network mode settings
    allowCollaboration?: boolean;
    maxCollaborators?: number;
    realTimeEnabled?: boolean;
    enableComments?: boolean;
    enableChat?: boolean;
    enableActivityLog?: boolean;

    // Standalone mode settings
    filePath?: string;
    autoSave?: boolean;
    backupEnabled?: boolean;
    encryptionEnabled?: boolean;
}

interface CloudProjectCreatePayload {
    name: string;
    description?: string;
    type: 'standalone' | 'networked' | 'network' | 'hybrid';
    applicationMode: ApplicationMode;
    visibility: 'private' | 'organization' | 'public';
    storageBackend: 'firestore' | 'gcs';
    gcsBucket?: string;
    gcsPrefix?: string;

    // Network collaboration settings
    allowCollaboration?: boolean;
    maxCollaborators?: number;
    realTimeEnabled?: boolean;
    enableComments?: boolean;
    enableChat?: boolean;
    enableActivityLog?: boolean;
    enablePresenceIndicators?: boolean;
    allowGuestUsers?: boolean;
    inviteUsers?: string[];

    // Standalone settings
    filePath?: string;
    autoSave?: boolean;
    backupEnabled?: boolean;
    encryptionEnabled?: boolean;
    offlineMode?: boolean;

  // Project settings for dev compatibility
  settings?: {
    preferredPorts?: {
      website?: number;
      api?: number;
    };
  };
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface CloudDataset {
    id: string;
    name: string;
    description?: string;
    visibility: 'private' | 'organization' | 'public';
    ownerId: string;
    organizationId?: string | null;
    tags?: string[];
    schema?: any;
    storage?: {
        backend: 'firestore' | 'gcs' | 's3' | 'local';
        gcsBucket?: string;
        gcsPrefix?: string;
        path?: string;
    };
    createdAt: string;
    updatedAt: string;
}

class CloudProjectIntegrationService {
    private static instance: CloudProjectIntegrationService;
    private baseURL: string;
    private authToken: string | null = null;

    private constructor() {
        this.baseURL = this.getBaseURL();
        this.initializeAuth();
    }

    static getInstance(): CloudProjectIntegrationService {
        if (!this.instance) {
            this.instance = new CloudProjectIntegrationService();
        }
        return this.instance;
    }

    /**
     * Initialize authentication token from storage
     */
    private initializeAuth(): void {
        this.authToken = localStorage.getItem('auth_token');
    }

    /**
     * Get the correct base URL for API calls
     */
    private getBaseURL(): string {
        const isProduction = window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1' &&
            !window.location.hostname.includes('localhost');

        if (isProduction) {
            return '/api';
        }

        const envBaseURL = (import.meta.env as any).VITE_API_BASE_URL || '/api';
        return envBaseURL;
    }

    /**
     * Make authenticated API requests
     */
    private async apiRequest<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
        data?: any
    ): Promise<T> {
         const base = this.baseURL.replace(/\/$/, '');
        const path = String(endpoint || '').replace(/^\//, '');
        const url = `${base}/${path}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`;
        }

        const config: RequestInit = {
            method,
            headers,
            ...(data && { body: JSON.stringify(data) })
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, try to refresh or redirect to login
                    await this.handleAuthError();
                    throw new Error('Authentication required');
                }
                // Try to parse JSON error for clearer messaging
                let message = '';
                let details: any = undefined;
                try {
                    const errJson = await response.clone().json();
                    message = errJson?.error || errJson?.message || '';
                    if (errJson?.details) details = errJson.details;
                } catch {
                    try {
                        const text = await response.text();
                        message = text || '';
                    } catch {}
                }
                const statusText = response.statusText || 'Bad Request';
                const detailMsg = message ? ` - ${message}` : '';
                const detailsSuffix = details ? ` | details=${JSON.stringify(details)}` : '';
                throw new Error(`API request failed: ${response.status} ${statusText}${detailMsg}${detailsSuffix}`);
            }

            const result: ApiResponse<T> = await response.json();

            if (!result.success) {
                throw new Error(result.error || result.message || 'API request failed');
            }

            return result.data as T;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Handle authentication errors
     */
    private async handleAuthError(): Promise<void> {
        // Try to refresh token using the existing API logic
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data?.tokens?.accessToken) {
                    const newAccessToken: string = result.data.tokens.accessToken as string;
                    this.authToken = newAccessToken;
                    localStorage.setItem('auth_token', newAccessToken);

                    const nextRefresh: string | undefined = result.data.tokens.refreshToken as string | undefined;
                    if (nextRefresh) {
                        localStorage.setItem('refresh_token', nextRefresh);
                    }
                    return;
                }
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        // Clear tokens and notify startup sequencer
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        this.authToken = null;

        // Reset startup sequencer to authentication step
        await simplifiedStartupSequencer.reset();
    }

    /**
     * Set authentication token
     */
    public setAuthToken(token: string): void {
        this.authToken = token;
        localStorage.setItem('auth_token', token);
    }

    /**
     * Create a cloud project using the existing Firebase/GCS infrastructure
     */
    public async createCloudProject(options: ProjectCreationOptions): Promise<string> {
        try {
            const payload = this.mapToCloudProjectPayload(options);
            const project = await this.apiRequest<CloudProject>('projects', 'POST', payload);

            console.log('Cloud project created:', project);

            // Set up additional project resources if needed
            await this.setupProjectResources(project.id, options);

                // Notify listeners in the app so lists can refresh immediately
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('project:created', { detail: { projectId: project.id, project } }));
                }

            return project.id;
        } catch (error) {
            console.error('Failed to create cloud project:', error);
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create cloud project: ${msg}`);
        }
    }

    /**
     * Map ProjectCreationOptions to the cloud API payload
     */
    private mapToCloudProjectPayload(options: ProjectCreationOptions): CloudProjectCreatePayload {
        const currentState = simplifiedStartupSequencer.getState();
        const selectedMode: ApplicationMode = (currentState.selectedMode || 'shared_network') as ApplicationMode;

        const payload: CloudProjectCreatePayload = {
            name: options.name,
            description: options.description,
            type: this.mapApplicationModeToType(selectedMode),
            applicationMode: selectedMode,
            visibility: 'private', // Default, could be configurable
            storageBackend: this.mapStorageModeToBackend(currentState.storageMode),
        };

        // Add cloud storage configuration
        if (options.cloudConfig) {
            if (options.cloudConfig.provider === 'gcs') {
                payload.storageBackend = 'gcs';
                payload.gcsBucket = options.cloudConfig.bucket;
                payload.gcsPrefix = options.cloudConfig.prefix;
            } else {
                payload.storageBackend = 'firestore';
            }
        }

        // Add collaboration settings for network mode
        if (options.collaborationSettings && selectedMode === 'shared_network') {
            payload.allowCollaboration = true;
            // Ensure integer to satisfy backend validation
            payload.maxCollaborators = Math.max(1, Math.round(options.collaborationSettings.maxCollaborators));
            payload.realTimeEnabled = options.collaborationSettings.enableRealTime;
            payload.enableComments = options.collaborationSettings.enableComments;
            payload.enableActivityLog = true;
            payload.enablePresenceIndicators = true;
        }

        // Add standalone settings
        if (selectedMode === 'standalone') {
            payload.autoSave = true;
            payload.backupEnabled = true;
            payload.offlineMode = currentState.storageMode === 'local';
        }

        // Attach preferred ports in settings if provided
        if (options.preferredPorts && (options.preferredPorts.website || options.preferredPorts.api)) {
            payload.settings = {
                ...(payload.settings || {}),
                preferredPorts: {
                    ...(options.preferredPorts.website ? { website: options.preferredPorts.website } : {}),
                    ...(options.preferredPorts.api ? { api: options.preferredPorts.api } : {}),
                }
            };
        }

        return payload;
    }

    /**
     * Map application mode to project type for the API
     */
    private mapApplicationModeToType(mode: ApplicationMode): 'standalone' | 'networked' | 'network' | 'hybrid' {
        switch (mode) {
            case 'standalone':
                return 'standalone';
            case 'shared_network':
                return 'networked';
            default:
                return 'networked';
        }
    }

    /**
     * Map storage mode to backend type for the API
     */
    private mapStorageModeToBackend(storageMode: StorageMode): 'firestore' | 'gcs' {
        switch (storageMode) {
            case 'cloud':
                return 'firestore'; // Default cloud storage
            case 'hybrid':
                return 'firestore'; // Use Firestore for metadata with local caching
            case 'local':
                return 'firestore'; // Even local projects can have cloud backup
            default:
                return 'firestore';
        }
    }

    /**
     * Set up additional project resources after creation
     */
    private async setupProjectResources(projectId: string, options: ProjectCreationOptions): Promise<void> {
        // Set up local network deployment if configured
        if (options.localNetworkConfig?.enabled) {
            await this.setupLocalNetworkDeployment(projectId, options.localNetworkConfig);
        }

        // Set up GCS signed URLs if using GCS storage
        if (options.cloudConfig?.provider === 'gcs') {
            await this.validateGCSConfiguration(projectId, options.cloudConfig);
        }

        // Initialize project workspace
        await this.initializeProjectWorkspace(projectId, options);
    }

    /**
     * Set up local network deployment configuration
     */
    private async setupLocalNetworkDeployment(
        projectId: string,
        networkConfig: NonNullable<ProjectCreationOptions['localNetworkConfig']>
    ): Promise<void> {
        try {
            // This would integrate with your local deployment service
            console.log('Setting up local network deployment:', {
                projectId,
                port: networkConfig.port,
                address: networkConfig.address,
                maxUsers: networkConfig.maxUsers
            });

            // Store network configuration in project metadata
            await this.apiRequest(`projects/${projectId}`, 'PATCH', {
                metadata: {
                    localNetwork: {
                        enabled: true,
                        port: networkConfig.port,
                        address: networkConfig.address,
                        maxUsers: networkConfig.maxUsers,
                        deployedAt: new Date().toISOString()
                    }
                }
            });
        } catch (error) {
            console.error('Failed to setup local network deployment:', error);
            // Don't fail the entire project creation for this
        }
    }

    /**
     * Validate GCS configuration
     */
    private async validateGCSConfiguration(
        projectId: string,
        gcsConfig: NonNullable<ProjectCreationOptions['cloudConfig']>
    ): Promise<void> {
        try {
            // Test GCS signed URL generation
            await this.apiRequest(`projects/${projectId}/storage/signed-url`, 'POST', {
                filename: 'test-validation.txt',
                operation: 'upload'
            });

            console.log('GCS configuration validated for project:', projectId);
        } catch (error) {
            console.error('GCS configuration validation failed:', error);
            throw new Error('GCS storage configuration is invalid');
        }
    }

    /**
     * Initialize project workspace
     */
    private async initializeProjectWorkspace(
        projectId: string,
        options: ProjectCreationOptions
    ): Promise<void> {
        try {
            // Create default project structure, folders, etc.
            console.log('Initializing project workspace for:', projectId);

            // This could include:
            // - Creating default folders
            // - Setting up templates
            // - Initializing asset management
            // - Setting up collaboration features

        } catch (error) {
            console.error('Failed to initialize project workspace:', error);
            // Don't fail the entire creation for this
        }
    }

    /**
     * Get user's cloud projects
     */
    public async getUserProjects(): Promise<CloudProject[]> {
        try {
      const endpoint = this.authToken ? 'projects' : 'projects/public';
      return await this.apiRequest<CloudProject[]>(endpoint);
        } catch (error) {
            console.error('Failed to fetch user projects:', error);
            return [];
        }
    }

    /**
     * Get a specific project by ID
     */
    public async getProject(projectId: string): Promise<CloudProject | null> {
        try {
            return await this.apiRequest<CloudProject>(`projects/${projectId}`);
        } catch (error) {
            console.error('Failed to fetch project:', error);
            return null;
        }
    }

    /**
     * Check if user has access to a project
     */
    public async validateProjectAccess(projectId: string): Promise<boolean> {
        try {
            const project = await this.getProject(projectId);
            return project !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate GCS signed URL for file upload/download
     */
    public async generateSignedUrl(
        projectId: string,
        filename: string,
        operation: 'upload' | 'download' = 'upload',
        contentType?: string
    ): Promise<{ url: string; method: string; headers?: Record<string, string> }> {
        try {
            const result = await this.apiRequest<{ url: string; method: string; headers?: Record<string, string> }>(`projects/${projectId}/storage/signed-url`, 'POST', {
                filename,
                operation,
                contentType
            });

            return {
                url: result.url,
                method: result.method,
                headers: result.headers
            };
        } catch (error) {
            console.error('Failed to generate signed URL:', error);
            throw error;
        }
    }

    /**
     * Update project settings
     */
    public async updateProject(projectId: string, updates: Partial<CloudProject>): Promise<CloudProject> {
        try {
            return await this.apiRequest<CloudProject>(`projects/${projectId}`, 'PATCH', updates);
        } catch (error) {
            console.error('Failed to update project:', error);
            throw error;
        }
    }

    /**
     * Archive/delete a project
     */
    public async archiveProject(projectId: string): Promise<void> {
        try {
            await this.apiRequest(`projects/${projectId}`, 'DELETE');
        } catch (error) {
            console.error('Failed to archive project:', error);
            throw error;
        }
    }

    /**
     * Restore (unarchive) a project
     */
    public async restoreProject(projectId: string): Promise<void> {
        try {
            await this.apiRequest(`projects/${projectId}/archive`, 'PATCH', { isArchived: false });
        } catch (error) {
            console.error('Failed to restore project:', error);
            throw error;
        }
    }

    // ==========================
    // Datasets
    // ==========================

    public async listDatasets(params?: { organizationId?: string; visibility?: 'private' | 'organization' | 'public'; backend?: 'firestore' | 'gcs' | 's3' | 'local'; query?: string }): Promise<CloudDataset[]> {
        const qs = new URLSearchParams();
        if (params?.organizationId) qs.append('organizationId', params.organizationId);
        if (params?.visibility) qs.append('visibility', params.visibility);
        if (params?.backend) qs.append('backend', params.backend);
        if (params?.query) qs.append('query', params.query);
        return this.apiRequest<CloudDataset[]>(`datasets${qs.toString() ? `?${qs}` : ''}`);
    }

    public async createDataset(input: Omit<CloudDataset, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { organizationId?: string | null }): Promise<CloudDataset> {
        // Sanitize payload to match server schema expectations (zod):
        // - organizationId must be omitted if not a non-empty string
        // - tags/schema/storage are optional
        const payload: any = { ...input };
        if (payload.organizationId == null || payload.organizationId === '') {
            delete payload.organizationId;
        }
        if (Array.isArray(payload.tags) && payload.tags.length === 0) {
            delete payload.tags;
        }
        if (payload.schema && typeof payload.schema === 'object' && Object.keys(payload.schema).length === 0) {
            delete payload.schema;
        }
        if (payload.storage && typeof payload.storage === 'object') {
            // Keep as-is; server will default backend to 'firestore' if not provided
            if (!payload.storage.backend) delete payload.storage.backend;
            // Remove empty GCS fields
            if (!payload.storage.gcsBucket) delete payload.storage.gcsBucket;
            if (!payload.storage.gcsPrefix) delete payload.storage.gcsPrefix;
            if (!payload.storage.path) delete payload.storage.path;
            if (Object.keys(payload.storage).length === 0) delete payload.storage;
        }
        return this.apiRequest<CloudDataset>('datasets', 'POST', payload);
    }

    public async getProjectDatasets(projectId: string): Promise<CloudDataset[]> {
        return this.apiRequest<CloudDataset[]>(`datasets/project/${projectId}`, 'GET');
    }

    public async assignDatasetToProject(projectId: string, datasetId: string): Promise<void> {
        await this.apiRequest(`datasets/project/${projectId}/${datasetId}`, 'POST');
    }

    public async unassignDatasetFromProject(projectId: string, datasetId: string): Promise<void> {
        await this.apiRequest(`datasets/project/${projectId}/${datasetId}`, 'DELETE');
    }
}

// Export singleton instance
export const cloudProjectIntegration = CloudProjectIntegrationService.getInstance();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).cloudProjectIntegration = cloudProjectIntegration;
}

export default CloudProjectIntegrationService;
