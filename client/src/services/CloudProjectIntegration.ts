/**
 * Cloud Project Integration Service
 * 
 * Bridges the new Simplified Startup System with the existing
 * Firebase/GCS cloud project infrastructure from the licensing website.
 * Handles project creation, storage configuration, and API integration.
 */

import { ApplicationMode } from '../types/applicationMode';
import { 
    TeamMember, 
    ProjectTeamMember, 
    TeamMemberRole, 
    TeamMemberStatus,
    LicenseType,
    TeamMemberAuthResult,
    TeamMemberProjectContext,
    TEAM_MEMBER_ROLE_MAPPINGS
} from '../types/teamMember';
import { api } from './api';

// Define the types that were removed from SimplifiedStartupSequencer
export type StorageMode = 'local' | 'cloud' | 'hybrid';

export interface ProjectCreationOptions {
    name: string;
    description?: string;
    visibility?: 'private' | 'organization' | 'public';
    storageMode: StorageMode;
    preferredPorts?: {
        website?: number;
        api?: number;
    };
    localNetworkConfig?: {
        enabled: boolean;
        port: number;
        address: string;
        maxUsers: number;
    };
    cloudConfig?: {
        provider: 'firestore' | 'gcs' | 's3' | 'azure-blob';
        bucket?: string;
        prefix?: string;
        region?: string;
        storageAccount?: string;
    };
    collaborationSettings?: {
        maxCollaborators: number;
        enableRealTime: boolean;
        enableComments: boolean;
        enableFileSharing: boolean;
    };
}

// Import the existing API service from the licensing website
interface CloudProject {
    id: string;
    name: string;
    description?: string;
    type: string;
    applicationMode: ApplicationMode;
    visibility: 'private' | 'organization' | 'public';
    storageBackend: 'firestore' | 'gcs' | 's3' | 'local' | 'azure-blob';
    gcsBucket?: string;
    gcsPrefix?: string;
    s3Bucket?: string;
    s3Region?: string;
    s3Prefix?: string;
    azureStorageAccount?: string;
    azureContainer?: string;
    azurePrefix?: string;
    ownerId: string;
    organizationId?: string;
    createdAt: string;
    lastAccessedAt: string;
    isActive: boolean;
    isArchived?: boolean;

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
    storageBackend: 'firestore' | 'gcs' | 's3' | 'local' | 'azure-blob';
    gcsBucket?: string;
    gcsPrefix?: string;
    s3Bucket?: string;
    s3Region?: string;
    s3Prefix?: string;
    azureStorageAccount?: string;
    azureContainer?: string;
    azurePrefix?: string;

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
        backend: 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local';
        // Google Cloud Storage
        gcsBucket?: string;
        gcsPrefix?: string;
        // Amazon S3
        s3Bucket?: string;
        s3Region?: string;
        s3Prefix?: string;
        // AWS Services
        awsBucket?: string;
        awsRegion?: string;
        awsPrefix?: string;
        // Azure Blob Storage
        azureStorageAccount?: string;
        azureContainer?: string;
        azurePrefix?: string;
        // Local/Generic
        path?: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Canonical launch context shared by Web and Desktop
export interface ProjectLaunchContext {
    projectId: string;
    mode: ApplicationMode;
    storageBackend: CloudProject['storageBackend'];
    datasetIds: string[];
    organizationId?: string;
    licenseId?: string;
    origin?: 'cloud' | 'edge';
    edgeBaseUrl?: string | null;
    user?: {
        id: string;
        email?: string;
        backboneUserRole?: string;
        teamMemberRole?: string;
        permissions?: string[];
    } | null;
}

class CloudProjectIntegrationService {
    private static instance: CloudProjectIntegrationService;
    private baseURL: string;
    private baseURLOverride: string | null = null;
    private authToken: string | null = null;
    private authTokenCallback: (() => string | null) | null = null;

    private constructor() {
        // Base URL is now managed by the centralized API service
        this.baseURL = '/api';
        this.initializeAuth();
    }

    static getInstance(): CloudProjectIntegrationService {
        if (!this.instance) {
            this.instance = new CloudProjectIntegrationService();
        }
        return this.instance;
    }

    /**
     * Set a callback to get the current auth token (for webonly mode)
     */
    public setAuthTokenCallback(callback: () => string | null): void {
        this.authTokenCallback = callback;
    }

    /**
     * Get the current auth token
     */
    private getAuthToken(): string | null {
        const callbackToken = this.authTokenCallback ? this.authTokenCallback() : null;
        const directToken = this.authToken;
        
        // Debug logging removed for production
        
        return callbackToken || directToken;
    }

    /**
     * Initialize authentication token from storage (fallback for non-webonly mode)
     */
    private initializeAuth(): void {
        try {
            this.authToken = localStorage.getItem('auth_token');
        } catch (error) {
            // localStorage might be disabled in webonly mode
            console.warn('localStorage not available, using auth callback instead');
            this.authToken = null;
        }
    }

    // Note: Base URL handling is now managed by the centralized API service
    // which automatically routes requests through Firebase hosting rewrites

    /**
     * Make authenticated API requests using the centralized API service
     * This ensures proper authentication, error handling, and routing
     */
    private async apiRequest<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
        data?: any
    ): Promise<T> {
        try {
            // Clean up endpoint path
            const cleanEndpoint = String(endpoint || '').replace(/^\//, '');
            
            // Include application mode for mode-aware backend behavior
            const headers: Record<string, string> = {};
            try {
                const selectedMode = (localStorage.getItem('preferredApplicationMode') as any) || 'shared_network';
                if (selectedMode) {
                    headers['X-Application-Mode'] = String(selectedMode);
                }
            } catch {
                // localStorage might be disabled in webonly mode
            }

            console.log(`🔍 [CloudProjectIntegration] Making ${method} request to: ${cleanEndpoint}`);
            if (data) console.log(`🔍 [CloudProjectIntegration] Data:`, data);
            
            let response: any;
            
            switch (method) {
                case 'GET':
                    response = await api.get(cleanEndpoint, { headers });
                    break;
                case 'POST':
                    response = await api.post(cleanEndpoint, data, { headers });
                    break;
                case 'PATCH':
                    response = await api.patch(cleanEndpoint, data, { headers });
                    break;
                case 'DELETE':
                    response = await api.delete(cleanEndpoint, { headers });
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }

            console.log(`✅ [CloudProjectIntegration] API request successful:`, response.data);
            
            // Handle the response format from the API service
            if (response.data && response.data.success) {
                return response.data.data as T;
            } else if (response.data && Array.isArray(response.data)) {
                // Direct array response (for some endpoints)
                return response.data as T;
            } else {
                throw new Error(response.data?.error || response.data?.message || 'API request failed');
            }
        } catch (error: any) {
            console.error(`❌ [CloudProjectIntegration] API request failed:`, error);
            
            // Handle authentication errors
            if (error.response?.status === 401) {
                await this.handleAuthError();
                throw new Error('Authentication required');
            }
            
            throw error;
        }
    }

    /**
     * Handle authentication errors
     */
    private async handleAuthError(): Promise<void> {
        // Try to refresh token using the existing API logic
        try {
            let refreshToken: string | null = null;
            try {
                refreshToken = localStorage.getItem('refresh_token');
            } catch (error) {
                // localStorage might be disabled in webonly mode
                console.warn('localStorage not available for refresh token');
            }

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
                    
                    try {
                        localStorage.setItem('auth_token', newAccessToken);
                        const nextRefresh: string | undefined = result.data.tokens.refreshToken as string | undefined;
                        if (nextRefresh) {
                            localStorage.setItem('refresh_token', nextRefresh);
                        }
                    } catch (error) {
                        // localStorage might be disabled in webonly mode
                        console.warn('localStorage not available for storing tokens');
                    }
                    return;
                }
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        // Clear tokens and notify startup sequencer
        try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
        } catch (error) {
            // localStorage might be disabled in webonly mode
            console.warn('localStorage not available for clearing tokens');
        }
        this.authToken = null;

        // Clear any stored startup state
        try {
            localStorage.removeItem('preferredApplicationMode');
            localStorage.removeItem('preferredStorageMode');
            sessionStorage.removeItem('startup_reset');
        } catch (e) {
            // localStorage might be disabled in webonly mode
        }
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
        // Get application mode from localStorage or infer from options
        let selectedMode: ApplicationMode = 'shared_network';
        try {
            const storedMode = localStorage.getItem('preferredApplicationMode') as ApplicationMode;
            if (storedMode) {
                selectedMode = storedMode;
            } else {
                // Infer mode from options
                if ((options as any)?.localNetworkConfig?.enabled) {
                    selectedMode = 'shared_network';
                } else if (options.storageMode === 'local') {
                    selectedMode = 'standalone';
                }
            }
        } catch (e) {
            // localStorage might be disabled in webonly mode, use default
        }

        const payload: CloudProjectCreatePayload = {
            name: options.name,
            description: options.description,
            type: this.mapApplicationModeToType(selectedMode),
            applicationMode: selectedMode,
            // Allow caller to pass visibility; default to private
            visibility: ((options as any)?.visibility as any) || 'private',
            storageBackend: this.mapStorageModeToBackend(options.storageMode),
        };

        // Add cloud storage configuration
        if (options.cloudConfig) {
            if (options.cloudConfig.provider === 'gcs') {
                payload.storageBackend = 'gcs';
                payload.gcsBucket = options.cloudConfig.bucket;
                payload.gcsPrefix = options.cloudConfig.prefix;
            } else if (options.cloudConfig.provider === 's3') {
                payload.storageBackend = 's3';
                payload.s3Bucket = options.cloudConfig.bucket;
                payload.s3Region = (options.cloudConfig as any).region || 'us-east-1';
                payload.s3Prefix = options.cloudConfig.prefix;
            } else if (options.cloudConfig.provider === 'azure-blob') {
                payload.storageBackend = 'azure-blob';
                payload.azureStorageAccount = (options.cloudConfig as any).storageAccount;
                payload.azureContainer = options.cloudConfig.bucket; // Using bucket field for container
                payload.azurePrefix = options.cloudConfig.prefix;
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
            payload.offlineMode = options.storageMode === 'local';
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
            // Always use the authenticated endpoint - the apiRequest method handles auth
            // Include archived projects so they can be displayed in the UI
            const endpoint = 'projects?includeArchived=true';
            const result = await this.apiRequest<CloudProject[]>(endpoint);
            // Debug logging removed for production
            return result || [];
        } catch (error) {
            console.error('Failed to fetch user projects:', error);
            // Fallback: try public projects for browsing if auth-protected endpoint fails
            try {
                const publicProjects = await this.apiRequest<CloudProject[]>('projects/public');
                return publicProjects || [];
            } catch (e) {
                return [];
            }
        }
    }

    /**
     * Ensure project is initialized for launch in network mode and
     * return a canonical ProjectLaunchContext. This is safe to call
     * repeatedly (idempotent) and will:
     *  - create a default ADMIN assignment if no admin exists
     *  - fetch datasets and core project metadata
     *  - map current team member to Backbone user role if applicable
     */
    public async ensureProjectInitialized(projectId: string): Promise<ProjectLaunchContext> {
        // Fetch basic project data
        const project = await this.getProject(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        // Get datasets
        let datasets: CloudDataset[] = [];
        try {
            datasets = await this.getProjectDatasets(projectId);
        } catch {}

        // Team members and default admin enforcement
        let teamMembers: ProjectTeamMember[] = [];
        try {
            teamMembers = await this.getProjectTeamMembers(projectId);
        } catch {}

        const hasAdmin = teamMembers.some(tm => (tm as any).role === TeamMemberRole.ADMIN || (tm as any).role === 'admin');

        // If no admin assigned yet and current user is a team member, make them admin
        try {
            // Get current user from localStorage or auth service
            let currentUser: any = null;
            try {
                const userStr = localStorage.getItem('currentUser');
                if (userStr) {
                    currentUser = JSON.parse(userStr);
                }
            } catch (e) {
                // localStorage might be disabled in webonly mode
            }
            const currentIsTeamMember = !!currentUser?.isTeamMember && currentUser?.id;
            if (!hasAdmin && currentIsTeamMember) {
                // Only attempt if not already assigned
                const isAlreadyMember = teamMembers.some(tm => tm.teamMemberId === currentUser.id);
                if (!isAlreadyMember) {
                    await this.addTeamMemberToProject(projectId, currentUser.id, TeamMemberRole.ADMIN);
                    // Refresh list (best-effort)
                    try { teamMembers = await this.getProjectTeamMembers(projectId); } catch {}
                } else {
                    // Elevate role if necessary
                    const record = teamMembers.find(tm => tm.teamMemberId === currentUser.id);
                    if (record && (record as any).role !== TeamMemberRole.ADMIN) {
                        await this.updateTeamMemberRole(projectId, record.teamMemberId, TeamMemberRole.ADMIN);
                        try { teamMembers = await this.getProjectTeamMembers(projectId); } catch {}
                    }
                }
            }
        } catch (e) {
            // Non-fatal; proceed with available context
            console.warn('Default admin enforcement skipped:', e);
        }

        // Map current team member to Backbone app role (if applicable)
        let userContext: ProjectLaunchContext['user'] = null;
        try {
            // Get team member project context (simplified version)
            const tmCtx = await this.getTeamMemberProjectContext(projectId);
            if (tmCtx) {
                userContext = {
                    id: tmCtx.teamMember?.id,
                    email: tmCtx.teamMember?.email,
                    backboneUserRole: tmCtx.backboneUserRole,
                    teamMemberRole: tmCtx.project?.role,
                    permissions: tmCtx.permissions,
                };
            }
        } catch {}

        // Build canonical context
        const context: ProjectLaunchContext = {
            projectId: project.id,
            mode: project.applicationMode,
            storageBackend: project.storageBackend,
            datasetIds: datasets.map(d => d.id),
            organizationId: project.organizationId,
            origin: 'cloud', // Web-only production mode
            edgeBaseUrl: null, // Edge mode not supported in web-only production
            user: userContext,
        };

        // Cache minimally for web app to hydrate on initial load (best-effort)
        try {
            sessionStorage.setItem(`launch_context_${projectId}`, JSON.stringify(context));
        } catch {}

        return context;
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
     * Upload a file to project storage via signed URL (GCS)
     */
    public async uploadFileViaSignedUrl(
        projectId: string,
        file: File,
        options?: { targetPath?: string; onProgress?: (pct: number) => void }
    ): Promise<{ key: string; bucket?: string; url: string }> {
        // Build a safe target filename under an optional path
        const baseName = file.name || 'upload.bin';
        const safeName = baseName.replace(/[^a-zA-Z0-9._\-]/g, '_');
        const filename = options?.targetPath
            ? `${String(options.targetPath).replace(/\/$/, '')}/${safeName}`
            : safeName;

        // Request signed URL
        const { url, headers } = await this.generateSignedUrl(
            projectId,
            filename,
            'upload',
            file.type || 'application/octet-stream'
        );

        // Use XHR to support progress callbacks (fetch lacks upload progress)
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url, true);
            // Apply returned headers (e.g., Content-Type)
            if (headers) {
                Object.entries(headers).forEach(([k, v]) => {
                    try { xhr.setRequestHeader(k, v as string); } catch {}
                });
            }
            if (options?.onProgress && xhr.upload) {
                xhr.upload.onprogress = (evt) => {
                    if (evt.lengthComputable) {
                        const pct = Math.round((evt.loaded * 100) / evt.total);
                        options.onProgress!(pct);
                    }
                };
            }
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            };
            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(file);
        });

        // Persist simple metadata for listing/search
        try {
            await this.apiRequest(`projects/${projectId}/storage/record`, 'POST', {
                key: filename,
                name: baseName,
                size: file.size,
                contentType: file.type || 'application/octet-stream',
                url,
            });
        } catch (e) {
            // Non-fatal: upload succeeded even if metadata recording fails
            console.warn('File metadata record failed', e);
        }

        // Return the signed URL and object key
        return { key: filename, url };
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

    public async listDatasets(params?: { organizationId?: string; visibility?: 'private' | 'organization' | 'public'; backend?: 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local'; query?: string }): Promise<CloudDataset[]> {
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

    // ==================== TEAM MEMBER MANAGEMENT ====================

    /**
     * Check if we're in webonly mode (Firebase hosting)
     */
    private isWebOnlyMode(): boolean {
        return window.location.hostname !== 'localhost' &&
               window.location.hostname !== '127.0.0.1' &&
               !window.location.hostname.includes('localhost') &&
               (window.location.hostname.includes('web.app') ||
                window.location.hostname.includes('firebaseapp.com'));
    }

    /**
     * Get team members assigned to a specific project
     */
    public async getProjectTeamMembers(projectId: string): Promise<ProjectTeamMember[]> {
        try {
            console.log('🚀 [CloudProjectIntegration] getProjectTeamMembers called for project:', projectId);
            
            // Use REST API for both local and webonly mode
            const result = await this.apiRequest<{ success: boolean; data: ProjectTeamMember[] }>(`projects/${projectId}/team-members`);
            console.log('✅ [CloudProjectIntegration] Team members API call successful:', result?.data?.length || 0, 'members');
            
            if (result?.data && Array.isArray(result.data)) {
                return result.data;
            } else if (Array.isArray(result)) {
                return result;
            } else {
                console.warn('🔍 [CloudProjectIntegration] Unexpected result format, returning empty array');
                return [];
            }
        } catch (error: any) {
            console.error('❌ [CloudProjectIntegration] Team member API call failed:', error);
            
            // Only use fallback for 404 errors (endpoint not found)
            if (error?.message?.includes('404') || error?.status === 404) {
                console.warn('Using fallback data due to 404 error');
                return this.getFallbackTeamMembers(projectId);
            }
            
            // For other errors, return empty array to prevent UI crashes
            console.warn('Returning empty array due to API error');
            return [];
        }
    }

    /**
     * Fallback team member data until backend endpoints are implemented
     */
    private getFallbackTeamMembers(projectId: string): ProjectTeamMember[] {
        // Check if we have any stored team members for this project
        const storedMembers = localStorage.getItem(`project_team_members_${projectId}`);
        if (storedMembers) {
            try {
                return JSON.parse(storedMembers);
            } catch (e) {
                console.warn('Failed to parse stored team members');
            }
        }

        // Return empty array for now - team members can be added through the UI
        // and will be stored locally until backend is ready
        return [];
    }

    /**
     * Get all licensed team members available to the current user/organization
     * Excludes members already assigned to the specified project
     */
    public async getLicensedTeamMembers(options?: {
        search?: string;
        excludeProjectId?: string;
    }): Promise<TeamMember[]> {
        try {
            console.log('🚀 [CloudProjectIntegration] getLicensedTeamMembers called with options:', options);
            
            // Use REST API for both local and webonly mode
            const params = new URLSearchParams();
            if (options?.search) {
                params.append('search', options.search);
            }
            if (options?.excludeProjectId) {
                params.append('excludeProjectId', options.excludeProjectId);
            }

            const endpoint = `team-members/licensed${params.toString() ? `?${params.toString()}` : ''}`;
            const result = await this.apiRequest<any[]>(endpoint);
            console.log('✅ [CloudProjectIntegration] Licensed team members API call successful:', result?.length || 0, 'members');
            return result || [];
        } catch (error: any) {
            console.error('❌ [CloudProjectIntegration] Licensed team members API call failed:', error);
            
            // Only use fallback for 404 errors (endpoint not found)
            if (error?.message?.includes('404') || error?.status === 404) {
                console.warn('Using fallback data due to 404 error');
                return this.getFallbackLicensedTeamMembers(options);
            }
            
            // For other errors, throw to let the UI handle it
            throw error;
        }
    }

    /**
     * Fallback licensed team member data based on Team Management page
     */
    private getFallbackLicensedTeamMembers(options?: {
        search?: string;
        excludeProjectId?: string;
    }): TeamMember[] {
        // Mock team members based on what's shown in the Team Management page
        const allTeamMembers: TeamMember[] = [
            {
                id: 'audrey_guz_001',
                name: 'Audrey Guz',
                email: 'audrey.guz@apple.com',
                firstName: 'Audrey',
                lastName: 'Guz',
                licenseType: LicenseType.PROFESSIONAL,
                status: TeamMemberStatus.ACTIVE,
                organizationId: 'org_001',
                department: 'Not assigned',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-08-14T00:00:00Z',
                lastActive: '8/14/2025'
            },
            {
                id: 'lissa_001',
                name: 'Lissa',
                email: 'lissa@apple.com',
                firstName: 'Lissa',
                licenseType: LicenseType.PROFESSIONAL,
                status: TeamMemberStatus.ACTIVE,
                organizationId: 'org_001',
                department: 'Not assigned',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-08-13T00:00:00Z',
                lastActive: '8/13/2025'
            },
            {
                id: 'enterprise_user_001',
                name: 'Enterprise User',
                email: 'enterprise.user@example.com',
                firstName: 'Enterprise',
                lastName: 'User',
                licenseType: LicenseType.ENTERPRISE,
                status: TeamMemberStatus.ACTIVE,
                organizationId: 'org_001',
                department: 'Not assigned',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-08-13T00:00:00Z',
                lastActive: '8/13/2025'
            },
            {
                id: 'chebacca_001',
                name: 'Chebacca',
                email: 'chebacca@gmail.com',
                firstName: 'Chebacca',
                licenseType: LicenseType.PROFESSIONAL,
                status: TeamMemberStatus.ACTIVE,
                organizationId: 'org_001',
                department: 'Not assigned',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-08-13T00:00:00Z',
                lastActive: '8/13/2025'
            },
            {
                id: 's_moser_001',
                name: 'S Moser',
                email: 's.moser@apple.com',
                firstName: 'S',
                lastName: 'Moser',
                licenseType: LicenseType.PROFESSIONAL,
                status: TeamMemberStatus.ACTIVE,
                organizationId: 'org_001',
                department: 'Not assigned',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-08-14T00:00:00Z',
                lastActive: '8/14/2025'
            }
        ];

        let filteredMembers = allTeamMembers;

        // Apply search filter
        if (options?.search) {
            const searchLower = options.search.toLowerCase();
            filteredMembers = filteredMembers.filter(member => 
                member.name.toLowerCase().includes(searchLower) ||
                member.email.toLowerCase().includes(searchLower)
            );
        }

        // Exclude members already assigned to the project
        if (options?.excludeProjectId) {
            const assignedMembers = this.getFallbackTeamMembers(options.excludeProjectId);
            const assignedIds = assignedMembers.map(m => m.id);
            filteredMembers = filteredMembers.filter(member => 
                !assignedIds.includes(member.id)
            );
        }

        return filteredMembers;
    }

    /**
     * Add a team member to a project with a specific role
     */
    public async addTeamMemberToProject(projectId: string, teamMemberId: string, role: TeamMemberRole = TeamMemberRole.DO_ER): Promise<void> {
        try {
            // Use REST API for both local and webonly mode
            const result = await this.apiRequest<{ success: boolean; data: any }>(`projects/${projectId}/team-members`, 'POST', {
                teamMemberId,
                role
            });
            console.log('✅ Team member added via API:', result);
        } catch (error: any) {
            console.warn('Add team member API endpoint failed, using local storage:', error?.message);
            
            // Fallback: Store in localStorage until backend is ready
            const allMembers = this.getFallbackLicensedTeamMembers();
            const memberToAdd = allMembers.find(m => m.id === teamMemberId);
            
            if (memberToAdd) {
                // Check if there's already an Admin for this project (only 1 admin allowed)
                const currentMembers = this.getFallbackTeamMembers(projectId);
                const hasAdmin = currentMembers.some(m => m.role === TeamMemberRole.ADMIN);
                
                if (role === TeamMemberRole.ADMIN && hasAdmin) {
                    throw new Error('Only one Admin is allowed per project. Please remove the existing Admin first.');
                }
                
                const projectTeamMember: ProjectTeamMember = {
                    id: `ptm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    projectId,
                    teamMemberId,
                    role,
                    teamMember: memberToAdd,
                    assignedAt: new Date().toISOString(),
                    assignedBy: 'current_user', // Would be actual user ID in real implementation
                    isActive: true
                };
                
                const updatedMembers = [...currentMembers, projectTeamMember];
                localStorage.setItem(`project_team_members_${projectId}`, JSON.stringify(updatedMembers));
            }
        }
    }

    /**
     * Remove a team member from a project
     */
    public async removeTeamMemberFromProject(projectId: string, teamMemberId: string): Promise<void> {
        try {
            // Use REST API for both local and webonly mode
            const result = await this.apiRequest<{ success: boolean }>(`projects/${projectId}/team-members/${teamMemberId}`, 'DELETE');
            console.log('✅ Team member removed via API:', result);
        } catch (error: any) {
            console.warn('Remove team member API endpoint failed, using local storage:', error?.message);
            
            // Fallback: Remove from localStorage until backend is ready
            const currentMembers = this.getFallbackTeamMembers(projectId);
            const updatedMembers = currentMembers.filter(m => m.id !== teamMemberId);
            localStorage.setItem(`project_team_members_${projectId}`, JSON.stringify(updatedMembers));
        }
    }

    /**
     * Update a team member's role in a project
     */
    public async updateTeamMemberRole(projectId: string, teamMemberId: string, role: string): Promise<void> {
        await this.apiRequest(`projects/${projectId}/team-members/${teamMemberId}`, 'PATCH', {
            role
        });
    }

    /**
     * Get team member details by ID (for authentication integration)
     */
    public async getTeamMemberById(teamMemberId: string): Promise<any | null> {
        try {
            const result = await this.apiRequest<any>(`team-members/${teamMemberId}`);
            return result;
        } catch (error) {
            console.error('Failed to fetch team member details:', error);
            return null;
        }
    }

    /**
     * Get team member project context for a specific project
     */
    private async getTeamMemberProjectContext(projectId: string): Promise<any> {
        // Get current user
        let currentUser: any = null;
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                currentUser = JSON.parse(userStr);
            }
        } catch (e) {
            return null;
        }

        if (!currentUser?.isTeamMember) {
            return null;
        }

        try {
            // Get the team member's role in this specific project
            const projectTeamMembers = await this.getProjectTeamMembers(projectId);
            const teamMemberAssignment = projectTeamMembers.find(
                ptm => ptm.teamMemberId === currentUser.id
            );

            if (!teamMemberAssignment) {
                throw new Error('Team member is not assigned to this project');
            }

            // Find the corresponding Backbone app role
            const roleMapping = TEAM_MEMBER_ROLE_MAPPINGS.find(
                mapping => mapping.teamMemberRole === teamMemberAssignment.role
            );

            if (!roleMapping) {
                throw new Error('Invalid team member role mapping');
            }

            return {
                teamMember: currentUser,
                project: {
                    id: projectId,
                    role: teamMemberAssignment.role
                },
                backboneUserRole: roleMapping.backboneUserRole,
                permissions: roleMapping.permissions,
                canManageTeam: teamMemberAssignment.role === 'admin'
            };
        } catch (error) {
            console.error('Failed to get team member project context:', error);
            throw error;
        }
    }

    /**
     * Validate team member credentials (for authentication integration)
     * This method can be used to verify team member login credentials
     */
    public async validateTeamMemberCredentials(email: string, password: string): Promise<TeamMemberAuthResult> {
        try {
            const result = await this.apiRequest<TeamMemberAuthResult>('auth/team-member/validate', 'POST', {
                email,
                password
            });

            return result;
        } catch (error: any) {
            console.warn('Team member credential validation API not yet implemented, using fallback:', error?.message);
            
            // Fallback validation for development
            const allMembers = this.getFallbackLicensedTeamMembers();
            const teamMember = allMembers.find(m => m.email === email);
            
            if (!teamMember) {
                return {
                    isValid: false,
                    error: 'Team member not found'
                };
            }
            
            // In a real implementation, you'd validate the password hash
            // For now, we'll accept any password for development
            if (password.length < 1) {
                return {
                    isValid: false,
                    error: 'Password is required'
                };
            }
            
            // Get all projects this team member has access to
            const projectAccess = this.getTeamMemberProjectAccess(teamMember.id);
            
            return {
                isValid: true,
                teamMember,
                projectAccess
            };
        }
    }

    /**
     * Get project access for a team member (fallback implementation)
     */
    private getTeamMemberProjectAccess(teamMemberId: string): any[] {
        // In a real implementation, this would query the database
        // For now, return empty array - projects will be loaded when needed
        return [];
    }


}

// Export singleton instance
export const cloudProjectIntegration = CloudProjectIntegrationService.getInstance();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).cloudProjectIntegration = cloudProjectIntegration;
}

export default CloudProjectIntegrationService;
