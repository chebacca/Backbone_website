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
import { isOnline } from '../utils/NetworkUtils';
import { offlineStorageManager } from './OfflineStorageManager';
import { syncService } from './SyncService';
import { v4 as uuidv4 } from 'uuid';

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
    projectId: string; // Add missing projectId property
    type?: string;
    status?: string;
    size?: number;
    recordCount?: number;
    isPublic?: boolean;
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
        this.initializeOfflineSupport();
    }
    
    /**
     * Initialize offline support
     */
    private async initializeOfflineSupport(): Promise<void> {
        try {
            // Initialize offline storage manager
            console.log('🔄 [CloudProjectIntegration] Initializing offline support...');
            
            // Start sync service
            syncService.startSync(false);
            
            console.log('✅ [CloudProjectIntegration] Offline support initialized');
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Failed to initialize offline support:', error);
        }
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
     * Supports offline project creation with automatic sync when online
     */
    public async createCloudProject(options: ProjectCreationOptions): Promise<string> {
        try {
            // Check network connectivity
            const online = isOnline();
            
            // Licensing website is ALWAYS in web-only mode
            const isWebOnly = true;

            if (isWebOnly && online) {
                // Online mode - create directly in Firestore
                try {
                    return await this.createCloudProjectInFirestore(options);
                } catch (error) {
                    console.error('Failed to create cloud project in Firestore:', error);
                    // If Firebase Auth fails but we're online, try offline creation with sync
                    return await this.createProjectOfflineWithSync(options);
                }
            } else if (!online) {
                // Offline mode - create locally and sync later
                console.log('📴 Device is offline - creating project locally for later sync');
                return await this.createProjectOffline(options);
            }

            // This code path should never be reached in the licensing website
            // but keeping it for completeness
            const payload = this.mapToCloudProjectPayload(options);
            const project = await this.apiRequest<CloudProject>('projects', 'POST', payload);

            console.log('Cloud project created:', project);

            await this.setupProjectResources(project.id, options);

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('project:created', { detail: { projectId: project.id, project } }));
            }

            return project.id;
        } catch (error) {
            console.error('Failed to create cloud project:', error);
            
            // If all else fails, try offline creation as a last resort
            try {
                console.log('⚠️ Falling back to offline project creation');
                return await this.createProjectOffline(options);
            } catch (fallbackError) {
                console.error('Failed to create offline project as fallback:', fallbackError);
                const msg = error instanceof Error ? error.message : String(error);
                throw new Error(`Failed to create cloud project: ${msg}`);
            }
        }
    }
    
    /**
     * Create a project offline and queue it for sync when online
     */
    private async createProjectOffline(options: ProjectCreationOptions): Promise<string> {
        try {
            console.log('🔄 Creating project offline:', options.name);
            
            // Generate a temporary ID for the project
            const tempId = `offline_${uuidv4()}`;
            
            // Determine application mode and storage backend
            const selectedMode = ((): 'standalone' | 'shared_network' => {
                if ((options as any)?.localNetworkConfig?.enabled) return 'shared_network';
                if (options.storageMode === 'local') return 'standalone';
                return 'shared_network';
            })();
            
            let storageBackend: 'firestore' | 'gcs' | 's3' | 'local' | 'azure-blob' = 'local';
            if (options.storageMode === 'cloud') {
                switch (options.cloudConfig?.provider) {
                    case 'gcs': storageBackend = 'gcs'; break;
                    case 's3': storageBackend = 's3'; break;
                    case 'azure-blob': storageBackend = 'azure-blob'; break;
                    case 'firestore':
                    default: storageBackend = 'firestore';
                }
            } else if (options.storageMode === 'hybrid') {
                storageBackend = 'firestore';
            } else {
                storageBackend = 'local';
            }
            
            // Get organization ID if available
            const organizationId = (() => {
                try {
                    const raw = localStorage.getItem('auth_user');
                    if (!raw) return null;
                    const parsed = JSON.parse(raw);
                    return parsed?.organizationId || null;
                } catch { return null; }
            })();
            
            // Get current user ID
            const userId = (() => {
                try {
                    const raw = localStorage.getItem('auth_user');
                    if (!raw) return 'unknown_user';
                    const parsed = JSON.parse(raw);
                    return parsed?.id || 'unknown_user';
                } catch { return 'unknown_user'; }
            })();
            
            // Create offline project object
            const offlineProject = {
                id: tempId,
                name: options.name?.trim(),
                description: options.description || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                storageMode: options.storageMode,
                applicationMode: selectedMode,
                pendingSync: true,
                syncAttempts: 0,
                originalOptions: options
            };
            
            // Store in offline storage
            await offlineStorageManager.storeOfflineProject(offlineProject);
            
            // Add to sync queue
            await offlineStorageManager.addToSyncQueue({
                type: 'project_create',
                data: options
            });
            
            // Try to sync immediately if we might be online
            if (isOnline()) {
                console.log('🔄 Device appears to be online - attempting immediate sync');
                syncService.forceSyncNow().catch(e => {
                    console.warn('Failed to sync immediately:', e);
                });
            }
            
            // Dispatch event for UI updates
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('project:created', { 
                    detail: { 
                        projectId: tempId,
                        project: {
                            id: tempId,
                            name: options.name?.trim(),
                            description: options.description || '',
                            type: selectedMode === 'standalone' ? 'standalone' : 'networked',
                            applicationMode: selectedMode,
                            visibility: (options as any)?.visibility || 'private',
                            storageBackend,
                            ownerId: userId,
                            organizationId,
                            createdAt: new Date().toISOString(),
                            lastAccessedAt: new Date().toISOString(),
                            isActive: true,
                            isArchived: false,
                            allowCollaboration: !!options.collaborationSettings?.maxCollaborators,
                            maxCollaborators: options.collaborationSettings?.maxCollaborators || 10,
                            realTimeEnabled: options.collaborationSettings?.enableRealTime ?? (selectedMode === 'shared_network'),
                            enableComments: options.collaborationSettings?.enableComments ?? true,
                            enableActivityLog: true,
                            offlineCreated: true,
                            pendingSync: true
                        }
                    }
                }));
            }
            
            console.log('✅ Project created offline successfully:', tempId);
            return tempId;
        } catch (error) {
            console.error('❌ Failed to create project offline:', error);
            throw error;
        }
    }
    
    /**
     * Create a project offline but immediately try to sync it
     * This is used when we're online but Firebase Auth fails
     */
    private async createProjectOfflineWithSync(options: ProjectCreationOptions): Promise<string> {
        // Create project offline first
        const offlineId = await this.createProjectOffline(options);
        
        // Try to sync immediately
        try {
            await syncService.forceSyncNow();
        } catch (error) {
            console.warn('Failed to sync after offline creation:', error);
        }
        
        return offlineId;
    }

    /** Create a cloud project directly in Firestore (webonly production mode) */
    public async createCloudProjectInFirestore(options: ProjectCreationOptions): Promise<string> {
        const { auth, db } = await import('./firebase');
        const { addDoc, collection, serverTimestamp, updateDoc, doc } = await import('firebase/firestore');

        if (!auth.currentUser) {
            throw new Error('Firebase authentication required. Please log out and log back in.');
        }

        const ownerUid = auth.currentUser.uid;

        // Determine application mode and storage backend
        const selectedMode = ((): 'standalone' | 'shared_network' => {
            if ((options as any)?.localNetworkConfig?.enabled) return 'shared_network';
            if (options.storageMode === 'local') return 'standalone';
            return 'shared_network';
        })();

        let storageBackend: 'firestore' | 'gcs' | 's3' | 'local' | 'azure-blob' = 'local';
        if (options.storageMode === 'cloud') {
            switch (options.cloudConfig?.provider) {
                case 'gcs': storageBackend = 'gcs'; break;
                case 's3': storageBackend = 's3'; break;
                case 'azure-blob': storageBackend = 'azure-blob'; break;
                case 'firestore':
                default: storageBackend = 'firestore';
            }
        } else if (options.storageMode === 'hybrid') {
            storageBackend = 'firestore';
        } else {
            storageBackend = 'local';
        }

        const nowTs = serverTimestamp();
        // Attempt to read organizationId from stored profile if present
        const organizationId = (() => {
            try {
                const raw = localStorage.getItem('auth_user');
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                return parsed?.organizationId || null;
            } catch { return null; }
        })();

        const docData: any = Object.fromEntries(Object.entries({
            name: options.name?.trim(),
            description: options.description || '',
            type: selectedMode === 'standalone' ? 'standalone' : 'networked',
            applicationMode: selectedMode,
            visibility: (options as any)?.visibility || 'private',
            storageBackend,
            gcsBucket: options.cloudConfig?.provider === 'gcs' ? options.cloudConfig?.bucket : undefined,
            gcsPrefix: options.cloudConfig?.provider === 'gcs' ? options.cloudConfig?.prefix : undefined,
            s3Bucket: options.cloudConfig?.provider === 's3' ? (options as any).cloudConfig?.bucket : undefined,
            s3Region: options.cloudConfig?.provider === 's3' ? (options as any).cloudConfig?.region : undefined,
            s3Prefix: options.cloudConfig?.provider === 's3' ? options.cloudConfig?.prefix : undefined,
            azureStorageAccount: options.cloudConfig?.provider === 'azure-blob' ? (options as any).cloudConfig?.storageAccount : undefined,
            azureContainer: options.cloudConfig?.provider === 'azure-blob' ? options.cloudConfig?.bucket : undefined,
            azurePrefix: options.cloudConfig?.provider === 'azure-blob' ? options.cloudConfig?.prefix : undefined,
            ownerId: ownerUid,
            organizationId,
            createdAt: nowTs,
            updatedAt: nowTs,
            lastAccessedAt: nowTs,
            isActive: true,
            isArchived: false,
            allowCollaboration: !!options.collaborationSettings?.maxCollaborators,
            maxCollaborators: options.collaborationSettings?.maxCollaborators || 10,
            realTimeEnabled: options.collaborationSettings?.enableRealTime ?? (selectedMode === 'shared_network'),
            enableComments: options.collaborationSettings?.enableComments ?? true,
            enableActivityLog: true,
            settings: {
                preferredPorts: options.preferredPorts || undefined,
            },
        }).filter(([, v]) => v !== undefined));

        const projectRef = await addDoc(collection(db, 'projects'), docData);
        try { await updateDoc(doc(db, 'projects', projectRef.id), { id: projectRef.id }); } catch {}

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('project:created', { detail: { projectId: projectRef.id, project: { id: projectRef.id, ...docData } } }));
        }
        return projectRef.id;
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
     * Includes both online (Firestore) and offline (pending sync) projects
     */
    public async getUserProjects(): Promise<CloudProject[]> {
        try {
            let onlineProjects: CloudProject[] = [];
            let offlineProjects: CloudProject[] = [];
            
            // Get offline projects first (these are always available)
            try {
                offlineProjects = await this.getOfflineProjects();
                console.log(`📱 [CloudProjectIntegration] Found ${offlineProjects.length} offline projects`);
            } catch (offlineError) {
                console.error('❌ [CloudProjectIntegration] Failed to get offline projects:', offlineError);
            }
            
            // Try to get online projects if we're online
            if (isOnline()) {
                try {
                    // 🔧 CRITICAL FIX: In webonly Firebase-only mode, use direct Firestore access
                    if (this.isWebOnlyMode()) {
                        console.log('🔍 [CloudProjectIntegration] WebOnly mode - using direct Firestore access');
                        onlineProjects = await this.getUserProjectsFromFirestore();
                    } else {
                        // For non-webonly mode, use API endpoints (this path is never taken in licensing website)
                        console.log('🔍 [CloudProjectIntegration] Making GET request to: projects?includeArchived=true');
                        const endpoint = 'projects?includeArchived=true';
                        onlineProjects = await this.apiRequest<CloudProject[]>(endpoint);
                    }
                    console.log(`🌐 [CloudProjectIntegration] Found ${onlineProjects.length} online projects`);
                } catch (onlineError) {
                    console.error('❌ [CloudProjectIntegration] Failed to get online projects:', onlineError);
                    
                    // Try fallbacks for online projects
                    try {
                        if (this.isWebOnlyMode()) {
                            console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access');
                            onlineProjects = await this.getUserProjectsFromFirestore();
                        } else {
                            // For non-webonly mode, try public projects fallback
                            console.log('🔍 [CloudProjectIntegration] Making GET request to: projects/public');
                            onlineProjects = await this.apiRequest<CloudProject[]>('projects/public');
                        }
                    } catch (fallbackError) {
                        console.error('❌ [CloudProjectIntegration] Fallback for online projects failed:', fallbackError);
                    }
                }
            } else {
                console.log('📴 [CloudProjectIntegration] Device is offline - using only offline projects');
            }
            
            // Combine online and offline projects
            // Offline projects with the same ID as an online project are ignored
            // (this happens when a project was created offline and later synced)
            const onlineIds = new Set(onlineProjects.map(p => p.id));
            const combinedProjects = [
                ...onlineProjects,
                ...offlineProjects.filter(p => !onlineIds.has(p.id))
            ];
            
            console.log(`✅ [CloudProjectIntegration] Returning ${combinedProjects.length} total projects (${onlineProjects.length} online, ${offlineProjects.length} offline)`);
            
            return combinedProjects;
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Failed to get projects:', error);
            
            // Last resort: try to at least return offline projects
            try {
                const offlineProjects = await this.getOfflineProjects();
                console.log(`📱 [CloudProjectIntegration] Returning ${offlineProjects.length} offline projects as fallback`);
                return offlineProjects;
            } catch {
                return [];
            }
        }
    }
    
    /**
     * Get offline projects from offline storage
     */
    private async getOfflineProjects(): Promise<CloudProject[]> {
        try {
            // Get offline projects from storage
            const offlineProjects = await offlineStorageManager.getOfflineProjects();
            
            // Map to CloudProject format
            return offlineProjects.map(offlineProject => {
                // Determine application mode and storage backend
                const selectedMode = offlineProject.applicationMode || 'shared_network';
                let storageBackend: 'firestore' | 'gcs' | 's3' | 'local' | 'azure-blob' = 'local';
                
                if (offlineProject.storageMode === 'cloud') {
                    storageBackend = 'firestore';
                } else if (offlineProject.storageMode === 'hybrid') {
                    storageBackend = 'firestore';
                } else {
                    storageBackend = 'local';
                }
                
                // Get current user ID
                const userId = (() => {
                    try {
                        const raw = localStorage.getItem('auth_user');
                        if (!raw) return 'unknown_user';
                        const parsed = JSON.parse(raw);
                        return parsed?.id || 'unknown_user';
                    } catch { return 'unknown_user'; }
                })();
                
                // Get organization ID if available
                const organizationId = (() => {
                    try {
                        const raw = localStorage.getItem('auth_user');
                        if (!raw) return null;
                        const parsed = JSON.parse(raw);
                        return parsed?.organizationId || null;
                    } catch { return null; }
                })();
                
                return {
                    id: offlineProject.id,
                    name: offlineProject.name,
                    description: offlineProject.description || '',
                    type: selectedMode === 'standalone' ? 'standalone' : 'networked',
                    applicationMode: selectedMode,
                    visibility: 'private',
                    storageBackend,
                    ownerId: userId,
                    organizationId,
                    createdAt: offlineProject.createdAt,
                    lastAccessedAt: offlineProject.updatedAt,
                    isActive: true,
                    isArchived: false,
                    allowCollaboration: true,
                    maxCollaborators: 10,
                    realTimeEnabled: true,
                    enableComments: true,
                    enableChat: false,
                    enableActivityLog: true,
                    offlineCreated: true,
                    pendingSync: offlineProject.pendingSync
                };
            });
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Failed to get offline projects:', error);
            return [];
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
     * Supports both online and offline projects
     */
    public async getProject(projectId: string): Promise<CloudProject | null> {
        try {
            // Check if this is an offline project first
            if (projectId.startsWith('offline_')) {
                console.log('🔍 [CloudProjectIntegration] Getting offline project:', projectId);
                const offlineProjects = await this.getOfflineProjects();
                const offlineProject = offlineProjects.find(p => p.id === projectId);
                return offlineProject || null;
            }
            
            // Try to get from Firestore if online
            if (isOnline()) {
                try {
                    // In webonly mode, use direct Firestore access
                    if (this.isWebOnlyMode()) {
                        console.log('🔍 [CloudProjectIntegration] Getting project from Firestore:', projectId);
                        return await this.getProjectFromFirestore(projectId);
                    }
                    
                    // Use API for non-webonly mode (never reached in licensing website)
                    return await this.apiRequest<CloudProject>(`projects/${projectId}`);
                } catch (error) {
                    console.error('Failed to fetch project from online source:', error);
                    
                    // If we're in webonly mode, try direct Firestore access as fallback
                    if (this.isWebOnlyMode()) {
                        try {
                            return await this.getProjectFromFirestore(projectId);
                        } catch (firestoreError) {
                            console.error('Failed to fetch project from Firestore:', firestoreError);
                        }
                    }
                }
            } else {
                console.log('📴 [CloudProjectIntegration] Device is offline - cannot fetch online project');
            }
            
            // If we get here, we couldn't get the project from online sources
            // Check if we have a cached version in offline storage
            const offlineProjects = await this.getOfflineProjects();
            const cachedProject = offlineProjects.find(p => p.id === projectId);
            if (cachedProject) {
                console.log('📱 [CloudProjectIntegration] Found cached version of project:', projectId);
                return cachedProject;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to fetch project:', error);
            return null;
        }
    }
    
    /**
     * Get project directly from Firestore
     */
    private async getProjectFromFirestore(projectId: string): Promise<CloudProject | null> {
        try {
            console.log('🔍 [CloudProjectIntegration] Getting project from Firestore:', projectId);
            
            const { db } = await import('./firebase');
            const { doc, getDoc } = await import('firebase/firestore');
            
            const projectRef = doc(db, 'projects', projectId);
            const projectSnapshot = await getDoc(projectRef);
            
            if (!projectSnapshot.exists()) {
                console.warn('⚠️ [CloudProjectIntegration] Project not found in Firestore:', projectId);
                return null;
            }
            
            const projectData = projectSnapshot.data();
            const project = this.mapFirestoreProjectToCloudProject(projectId, projectData);
            
            console.log('✅ [CloudProjectIntegration] Project retrieved from Firestore:', project.name);
            return project;
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error getting project from Firestore:', error);
            throw error;
        }
    }

    /**
     * Check if user has access to a project
     * Supports both online and offline projects
     */
    public async validateProjectAccess(projectId: string): Promise<boolean> {
        try {
            // For offline projects, always grant access to the current user
            if (projectId.startsWith('offline_')) {
                const offlineProjects = await this.getOfflineProjects();
                return offlineProjects.some(p => p.id === projectId);
            }
            
            // For online projects, check if the project exists and is accessible
            const project = await this.getProject(projectId);
            return project !== null;
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error validating project access:', error);
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
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - updating project in Firestore');
                return await this.updateProjectInFirestore(projectId, updates);
            }
            
            return await this.apiRequest<CloudProject>(`projects/${projectId}`, 'PATCH', updates);
        } catch (error) {
            console.error('Failed to update project:', error);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for project update');
                try {
                    return await this.updateProjectInFirestore(projectId, updates);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    throw firestoreError;
                }
            }
            
            throw error;
        }
    }

    /**
     * Archive/delete a project
     */
    public async archiveProject(projectId: string): Promise<void> {
        try {
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - archiving project in Firestore');
                return await this.archiveProjectInFirestore(projectId);
            }
            
            await this.apiRequest(`projects/${projectId}`, 'DELETE');
        } catch (error) {
            console.error('Failed to archive project:', error);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for project archive');
                try {
                    return await this.archiveProjectInFirestore(projectId);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    throw firestoreError;
                }
            }
            
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

    public async listDatasets(params?: { organizationId?: string; visibility?: 'private' | 'organization' | 'public'; backend?: 'firestore' | 'gcs' | 's3' | 'aws' | 'azure' | 'local' | 'all'; query?: string }): Promise<CloudDataset[]> {
        try {
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - listing datasets from Firestore');
                return await this.listDatasetsFromFirestore(params);
            }
            
            // Use REST API for non-webonly mode
            const qs = new URLSearchParams();
            if (params?.organizationId) qs.append('organizationId', params.organizationId);
            if (params?.visibility) qs.append('visibility', params.visibility);
            if (params?.backend) qs.append('backend', params.backend);
            if (params?.query) qs.append('query', params.query);
            return this.apiRequest<CloudDataset[]>(`datasets${qs.toString() ? `?${qs}` : ''}`);
        } catch (error: any) {
            console.error('❌ [CloudProjectIntegration] Failed to list datasets:', error);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for listing datasets');
                try {
                    return await this.listDatasetsFromFirestore(params);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    return [];
                }
            }
            
            throw error;
        }
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
        try {
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log(`🔍 [CloudProjectIntegration] WebOnly mode - fetching datasets from Firestore for project: ${projectId}`);
                return await this.getProjectDatasetsFromFirestore(projectId);
            }

            return this.apiRequest<CloudDataset[]>(`datasets/project/${projectId}`, 'GET');
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] API request failed:', error);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for datasets');
                try {
                    return await this.getProjectDatasetsFromFirestore(projectId);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    return [];
                }
            }
            
            return [];
        }
    }

    public async assignDatasetToProject(projectId: string, datasetId: string): Promise<void> {
        try {
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - assigning dataset to project in Firestore');
                return await this.assignDatasetToProjectInFirestore(projectId, datasetId);
            }
            
            // Use REST API for non-webonly mode
            await this.apiRequest(`datasets/project/${projectId}/${datasetId}`, 'POST');
        } catch (error: any) {
            console.error('❌ [CloudProjectIntegration] Failed to assign dataset to project:', error);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for dataset assignment');
                try {
                    return await this.assignDatasetToProjectInFirestore(projectId, datasetId);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    throw firestoreError;
                }
            }
            
            throw error;
        }
    }

    public async unassignDatasetFromProject(projectId: string, datasetId: string): Promise<void> {
        try {
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - unassigning dataset from project in Firestore');
                return await this.unassignDatasetFromProjectInFirestore(projectId, datasetId);
            }
            
            // Use REST API for non-webonly mode
            await this.apiRequest(`datasets/project/${projectId}/${datasetId}`, 'DELETE');
        } catch (error: any) {
            console.error('❌ [CloudProjectIntegration] Failed to unassign dataset from project:', error);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for dataset unassignment');
                try {
                    return await this.unassignDatasetFromProjectInFirestore(projectId, datasetId);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    throw firestoreError;
                }
            }
            
            throw error;
        }
    }

    // ==================== TEAM MEMBER MANAGEMENT ====================

    /**
     * Check if we're in webonly mode
     * Licensing website is ALWAYS in web-only mode
     */
    private isWebOnlyMode(): boolean {
        // Licensing website is always in web-only mode
        // This ensures consistent behavior across all environments
        return true;
    }

    /**
     * Archive a project directly in Firestore (webonly mode)
     */
    public async archiveProjectInFirestore(projectId: string): Promise<void> {
        try {
            console.log('🔍 [CloudProjectIntegration] Archiving project in Firestore:', projectId);
            
            const { db } = await import('./firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            
            // Update the project to set isArchived = true
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                isArchived: true,
                updatedAt: new Date()
            });
            
            console.log('✅ [CloudProjectIntegration] Project archived successfully in Firestore');
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error archiving project in Firestore:', error);
            throw error;
        }
    }

    /**
     * Update a project directly in Firestore (webonly mode)
     */
    public async updateProjectInFirestore(projectId: string, updates: Partial<CloudProject>): Promise<CloudProject> {
        try {
            console.log('🔍 [CloudProjectIntegration] Updating project in Firestore:', projectId, updates);
            
            const { db } = await import('./firebase');
            const { doc, updateDoc, getDoc } = await import('firebase/firestore');
            
            // Update the project
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                ...updates,
                updatedAt: new Date()
            });
            
            // Get the updated project
            const updatedDoc = await getDoc(projectRef);
            if (!updatedDoc.exists()) {
                throw new Error('Project not found after update');
            }
            
            const updatedProject = this.mapFirestoreProjectToCloudProject(updatedDoc.id, updatedDoc.data());
            console.log('✅ [CloudProjectIntegration] Project updated successfully in Firestore');
            
            return updatedProject;
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error updating project in Firestore:', error);
            throw error;
        }
    }

    /**
     * Add team member to project directly in Firestore (webonly mode)
     */
    private async addTeamMemberToProjectInFirestore(projectId: string, teamMemberId: string, role: string): Promise<void> {
        try {
            console.log('🔍 [CloudProjectIntegration] Adding team member to project in Firestore:', { projectId, teamMemberId, role });
            
            const { db } = await import('./firebase');
            const { collection, addDoc, doc, getDoc } = await import('firebase/firestore');
            
            // First, get the full team member profile to store complete data
            let teamMemberProfile = null;
            try {
                const teamMemberDoc = await getDoc(doc(db, 'teamMembers', teamMemberId));
                if (teamMemberDoc.exists()) {
                    teamMemberProfile = teamMemberDoc.data();
                    console.log('✅ [CloudProjectIntegration] Found team member profile:', teamMemberProfile.name);
                }
            } catch (profileError) {
                console.warn('⚠️ [CloudProjectIntegration] Failed to get team member profile:', profileError);
            }
            
            const newAssignment = {
                projectId,
                teamMemberId,
                role,
                assignedBy: 'system', // TODO: Get from auth context
                assignedAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                // Store complete team member data for immediate display
                teamMemberName: teamMemberProfile?.name || 'Unknown User',
                teamMemberEmail: teamMemberProfile?.email || 'No email',
                teamMemberRole: teamMemberProfile?.role || 'MEMBER',
                teamMemberLicenseType: teamMemberProfile?.licenseType || 'BASIC'
            };
            
            // Clean the data to remove undefined values that could cause Firestore errors
            const cleanedData = this.cleanDocumentData(newAssignment);
            
            await addDoc(collection(db, 'projectTeamMembers'), cleanedData);
            console.log('✅ [CloudProjectIntegration] Team member added to project successfully in Firestore');
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error adding team member to project in Firestore:', error);
            throw error;
        }
    }
    
    /**
     * Clean document data by removing undefined and null values
     * This prevents Firestore errors when creating/updating documents
     */
    private cleanDocumentData<T>(data: T): T {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.cleanDocumentData(item)) as T;
        }
        
        const cleaned: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                cleaned[key] = this.cleanDocumentData(value);
            }
        }
        
        return cleaned as T;
    }

    /**
     * Remove team member from project directly in Firestore (webonly mode)
     */
    private async removeTeamMemberFromProjectInFirestore(projectId: string, teamMemberId: string): Promise<void> {
        try {
            console.log('🔍 [CloudProjectIntegration] Removing team member from project in Firestore:', { projectId, teamMemberId });
            
            const { db } = await import('./firebase');
            const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
            
            // Find the assignment
            const assignmentQuery = query(
                collection(db, 'projectTeamMembers'),
                where('projectId', '==', projectId),
                where('teamMemberId', '==', teamMemberId)
            );
            
            const assignmentSnapshot = await getDocs(assignmentQuery);
            if (assignmentSnapshot.empty) {
                throw new Error('Team member is not assigned to this project');
            }
            
            // Delete the assignment
            await deleteDoc(assignmentSnapshot.docs[0].ref);
            console.log('✅ [CloudProjectIntegration] Team member removed from project successfully in Firestore');
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error removing team member from project in Firestore:', error);
            throw error;
        }
    }

    /**
     * Get user's projects directly from Firestore (webonly mode)
     */
    private async getUserProjectsFromFirestore(): Promise<CloudProject[]> {
        try {
            console.log('🔍 [CloudProjectIntegration] Fetching projects from Firestore...');
            
            // Use the existing Firebase instance from firebase.ts
            const { db, auth } = await import('./firebase');
            const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            
            // Check if user is already authenticated in Firebase
            let currentUser = auth.currentUser;
            
            if (!currentUser) {
                console.warn('⚠️ [CloudProjectIntegration] No Firebase Auth user found');
                console.log('ℹ️ [CloudProjectIntegration] In webonly mode, Firebase Auth is required for Firestore access');
                console.log('ℹ️ [CloudProjectIntegration] The user needs to be authenticated with Firebase Auth during login');
                
                // Try to get user info from localStorage for debugging
                const authUser = localStorage.getItem('auth_user');
                if (authUser) {
                    const userData = JSON.parse(authUser);
                    console.log('🔍 [CloudProjectIntegration] Found server auth user:', {
                        id: userData.id,
                        email: userData.email,
                        name: userData.name
                    });
                    console.log('❌ [CloudProjectIntegration] But this user is not authenticated with Firebase Auth');
                    console.log('💡 [CloudProjectIntegration] Solution: Modify login flow to also authenticate with Firebase Auth');
                }
                
                return [];
            }
            
            console.log('✅ [CloudProjectIntegration] Authenticated Firebase user:', currentUser.uid);
            
            // Use the helper method to fetch projects
            return await this.getUserProjectsByUserId(currentUser.uid, db);
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error fetching projects from Firestore:', error);
            return [];
        }
    }

    /**
     * Get user's projects by user ID (fallback method when Firebase Auth is not available)
     */
    private async getUserProjectsByUserId(userId: string, db: any): Promise<CloudProject[]> {
        try {
            console.log('🔍 [CloudProjectIntegration] Fetching projects by user ID:', userId);
            
            const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            const projects: CloudProject[] = [];
            
            // Method 1: Get projects where user is owner
            console.log('📁 [CloudProjectIntegration] Fetching owned projects by user ID...');
            const ownedProjectsQuery = query(
                collection(db, 'projects'),
                where('ownerId', '==', userId)
            );
            
            const ownedSnapshot = await getDocs(ownedProjectsQuery);
            ownedSnapshot.forEach(doc => {
                const data = doc.data();
                projects.push(this.mapFirestoreProjectToCloudProject(doc.id, data));
            });
            
            console.log(`✅ [CloudProjectIntegration] Found ${ownedSnapshot.size} owned projects`);
            
            // Method 2: Get projects where user is a team member
            console.log('👥 [CloudProjectIntegration] Fetching team member projects by user ID...');
            const allProjectsQuery = query(
                collection(db, 'projects')
            );
            
            const allSnapshot = await getDocs(allProjectsQuery);
            allSnapshot.forEach(doc => {
                const data = doc.data();
                const teamMembers = data.teamMembers || [];
                
                // Check if current user is in team members
                const memberEntry = teamMembers.find((tm: any) => tm.userId === userId);
                
                if (memberEntry && !projects.find(p => p.id === doc.id)) {
                    projects.push(this.mapFirestoreProjectToCloudProject(doc.id, data));
                }
            });
            
            console.log(`✅ [CloudProjectIntegration] Total accessible projects: ${projects.length}`);
            
            // Sort results in memory to avoid Firestore index requirements
            projects.sort((a, b) => {
                const dateA = new Date(a.lastAccessedAt).getTime();
                const dateB = new Date(b.lastAccessedAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
            
            // Log project details for debugging
            projects.forEach((project, index) => {
                console.log(`📁 [CloudProjectIntegration] Project ${index + 1}:`, {
                    id: project.id,
                    name: project.name,
                    ownerId: project.ownerId,
                    isOwner: project.ownerId === userId,
                    storageBackend: project.storageBackend
                });
            });
            
            return projects;
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error fetching projects by user ID:', error);
            return [];
        }
    }

    /**
     * Map Firestore project data to CloudProject interface
     */
    private mapFirestoreProjectToCloudProject(id: string, data: any): CloudProject {
        return {
            id,
            name: data.name || 'Untitled Project',
            description: data.description || '',
            type: data.type || 'network',
            applicationMode: data.applicationMode || 'shared_network',
            visibility: data.visibility || 'private',
            storageBackend: data.storageBackend || 'firestore',
            ownerId: data.ownerId,
            organizationId: data.organizationId,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
            lastAccessedAt: data.lastAccessedAt?.toDate?.()?.toISOString() || data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            isActive: data.isActive !== false,
            isArchived: data.isArchived || false,
            allowCollaboration: data.allowCollaboration || false,
            maxCollaborators: data.maxCollaborators || 10,
            realTimeEnabled: data.realTimeEnabled || false,
            enableComments: data.enableComments || false,
            enableChat: data.enableChat || false,
            enableActivityLog: data.enableActivityLog || false,
            gcsBucket: data.gcsBucket,
            gcsPrefix: data.gcsPrefix,
            s3Bucket: data.s3Bucket,
            s3Region: data.s3Region,
            s3Prefix: data.s3Prefix,
            azureStorageAccount: data.azureStorageAccount,
            azureContainer: data.azureContainer,
            azurePrefix: data.azurePrefix,
            filePath: data.filePath,
            autoSave: data.autoSave,
            backupEnabled: data.backupEnabled,
            encryptionEnabled: data.encryptionEnabled
        };
    }

    /**
     * Get project datasets directly from Firestore (webonly mode)
     */
    private async getProjectDatasetsFromFirestore(projectId: string): Promise<CloudDataset[]> {
        try {
            console.log('🔍 [CloudProjectIntegration] Fetching datasets from Firestore for project:', projectId);
            
            const { db } = await import('./firebase');
            const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
            
            const datasets: CloudDataset[] = [];
            
            // First, get the project-dataset links from the project_datasets collection
            const projectDatasetQuery = query(
                collection(db, 'project_datasets'),
                where('projectId', '==', projectId)
            );
            
            const projectDatasetSnapshot = await getDocs(projectDatasetQuery);
            
            if (projectDatasetSnapshot.empty) {
                console.log(`✅ [CloudProjectIntegration] No datasets found for project ${projectId}`);
                return [];
            }

            // Extract dataset IDs from the links and fetch the actual dataset documents
            for (const linkDoc of projectDatasetSnapshot.docs) {
                const linkData = linkDoc.data();
                const datasetId = linkData.datasetId;
                
                // Fetch the dataset document
                const datasetDoc = await getDoc(doc(db, 'datasets', datasetId));
                
                if (datasetDoc.exists()) {
                    const data = datasetDoc.data();
                    datasets.push({
                        id: datasetDoc.id,
                        name: data.name || 'Untitled Dataset',
                        description: data.description || '',
                        projectId: data.projectId || null,
                        type: data.type || 'general',
                        status: data.status || 'active',
                        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                        size: data.size || 0,
                        recordCount: data.recordCount || 0,
                        schema: data.schema || {},
                        tags: data.tags || [],
                        isPublic: data.isPublic || false,
                        ownerId: data.ownerId,
                        storage: data.storage || { backend: 'firestore' },
                        visibility: data.visibility || 'private'
                    });
                }
            }
            
            // Sort results in memory to avoid Firestore index requirements
            datasets.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
            
            console.log(`✅ [CloudProjectIntegration] Found ${datasets.length} datasets for project ${projectId}`);
            return datasets;
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error fetching datasets from Firestore:', error);
            return [];
        }
    }

    /**
     * Get project team members directly from Firestore (webonly mode)
     */
    private async getProjectTeamMembersFromFirestore(projectId: string): Promise<ProjectTeamMember[]> {
        try {
            console.log('🔍 [CloudProjectIntegration] Fetching team members from Firestore for project:', projectId);
            
            const { db } = await import('./firebase');
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            
            const teamMembers: ProjectTeamMember[] = [];
            
            // First, get the project to see if it has teamMembers array
            const projectDoc = await import('firebase/firestore').then(({ doc, getDoc }) => 
                getDoc(doc(db, 'projects', projectId))
            );
            
            if (projectDoc.exists()) {
                const projectData = projectDoc.data();
                const projectTeamMembers = projectData.teamMembers || [];
                
                // Convert project team members to ProjectTeamMember format
                for (const tm of projectTeamMembers) {
                    teamMembers.push({
                        id: tm.userId || tm.id,
                        teamMemberId: tm.userId || tm.id,
                        projectId: projectId,
                        role: tm.role || 'member',
                        permissions: tm.permissions || ['read'],
                        assignedAt: tm.assignedAt || new Date().toISOString(),
                        isActive: tm.isActive !== false,
                        email: tm.email,
                        name: tm.name || tm.email,
                        status: tm.status || 'active'
                    });
                }
            }
            
            // Also check projectTeamMembers collection if it exists
            try {
                const teamMembersQuery = query(
                    collection(db, 'projectTeamMembers'),
                    where('projectId', '==', projectId)
                );
                
                const snapshot = await getDocs(teamMembersQuery);
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Avoid duplicates
                    if (!teamMembers.find(tm => tm.teamMemberId === data.teamMemberId)) {
                        teamMembers.push({
                            id: doc.id,
                            teamMemberId: data.teamMemberId,
                            projectId: data.projectId,
                            role: data.role || 'member',
                            permissions: data.permissions || ['read'],
                            assignedAt: data.assignedAt?.toDate?.()?.toISOString() || data.assignedAt || new Date().toISOString(),
                            isActive: data.isActive !== false,
                            email: data.teamMemberEmail || data.email,
                            name: data.teamMemberName || data.name || data.email,
                            status: data.status || 'active'
                        });
                    }
                });
            } catch (collectionError) {
                console.log('ℹ️ [CloudProjectIntegration] projectTeamMembers collection not found or accessible');
            }
            
            // Now enrich the team member data with full profiles from the teamMembers collection
            const enrichedTeamMembers: ProjectTeamMember[] = [];
            for (const teamMember of teamMembers) {
                try {
                    // Get the full team member profile from Firestore
                    const teamMemberDoc = await getDocs(query(
                        collection(db, 'teamMembers'),
                        where('__name__', '==', teamMember.teamMemberId)
                    ));
                    
                    if (!teamMemberDoc.empty) {
                        const fullProfile = teamMemberDoc.docs[0].data();
                        // Enrich with full profile data
                        enrichedTeamMembers.push({
                            ...teamMember,
                            name: fullProfile.name || fullProfile.email || teamMember.name || 'Unnamed User',
                            email: fullProfile.email || teamMember.email || 'No email',
                            teamMember: {
                                id: teamMember.teamMemberId,
                                name: fullProfile.name || fullProfile.email || 'Unnamed User',
                                email: fullProfile.email || 'No email',
                                role: fullProfile.role || 'MEMBER',
                                status: fullProfile.status || 'ACTIVE',
                                licenseType: fullProfile.licenseType || 'BASIC',
                                organizationId: fullProfile.organizationId,
                                firebaseUid: fullProfile.firebaseUid,
                                isEmailVerified: fullProfile.isEmailVerified || false,
                                createdAt: fullProfile.createdAt?.toDate?.()?.toISOString() || fullProfile.createdAt || new Date().toISOString(),
                                updatedAt: fullProfile.updatedAt?.toDate?.()?.toISOString() || fullProfile.updatedAt || new Date().toISOString(),
                                lastActive: fullProfile.lastActive?.toDate?.()?.toISOString() || fullProfile.lastActive,
                                permissions: fullProfile.permissions || [],
                                department: fullProfile.department,
                                position: fullProfile.position,
                                avatar: fullProfile.avatar
                            }
                        });
                    } else {
                        // If no full profile found, use the basic data
                        enrichedTeamMembers.push(teamMember);
                    }
                } catch (profileError) {
                    console.warn('⚠️ [CloudProjectIntegration] Failed to get full profile for team member:', teamMember.teamMemberId, profileError);
                    // Use the basic data if profile fetch fails
                    enrichedTeamMembers.push(teamMember);
                }
            }
            
            console.log(`✅ [CloudProjectIntegration] Found ${enrichedTeamMembers.length} team members for project ${projectId}`);
            return enrichedTeamMembers;
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error fetching team members from Firestore:', error);
            return [];
        }
    }

    /**
     * Get licensed team members directly from Firestore (webonly mode)
     */
    private async getLicensedTeamMembersFromFirestore(options?: {
        search?: string;
        excludeProjectId?: string;
    }): Promise<TeamMember[]> {
        try {
            console.log('🔍 [CloudProjectIntegration] Fetching licensed team members from Firestore with options:', options);
            
            const { db, auth } = await import('./firebase');
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.warn('⚠️ [CloudProjectIntegration] No authenticated user for team members fetch');
                return [];
            }

            // Get current user's organization ID from Firestore
            let organizationId = null;
            try {
                // Get the current user's document from Firestore to extract organization ID
                const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));
                if (!userDoc.empty) {
                    const userData = userDoc.docs[0].data();
                    organizationId = userData.organizationId || userData.orgId;
                    console.log('🏢 [CloudProjectIntegration] Found organization ID from Firestore user document:', organizationId);
                }
            } catch (userError) {
                console.warn('⚠️ [CloudProjectIntegration] Failed to get user document from Firestore:', userError);
            }

            if (!organizationId) {
                console.warn('⚠️ [CloudProjectIntegration] No organization ID found for current user');
                return [];
            }

            console.log('🏢 [CloudProjectIntegration] Fetching team members for organization:', organizationId);

            const teamMembers: TeamMember[] = [];
            
            // Query teamMembers collection for the current organization
            // Try both organizationId and orgId field names for compatibility
            let snapshot;
            try {
                const teamMembersQuery = query(
                    collection(db, 'teamMembers'),
                    where('organizationId', '==', organizationId)
                );
                snapshot = await getDocs(teamMembersQuery);
                
                // If no results with organizationId, try orgId
                if (snapshot.empty) {
                    console.log('🔄 [CloudProjectIntegration] No results with organizationId, trying orgId field...');
                    const teamMembersQueryAlt = query(
                        collection(db, 'teamMembers'),
                        where('orgId', '==', organizationId)
                    );
                    snapshot = await getDocs(teamMembersQueryAlt);
                }
            } catch (error) {
                console.warn('⚠️ [CloudProjectIntegration] Error querying teamMembers:', error);
                return [];
            }
            
            // Get already assigned team members for the project (if excludeProjectId is provided)
            let assignedMemberIds: string[] = [];
            if (options?.excludeProjectId) {
                try {
                    const projectTeamMembers = await this.getProjectTeamMembersFromFirestore(options.excludeProjectId);
                    assignedMemberIds = projectTeamMembers.map(ptm => ptm.teamMemberId);
                } catch (error) {
                    console.warn('Failed to get assigned team members:', error);
                }
            }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                
                // Skip if already assigned to the project
                if (assignedMemberIds.includes(doc.id)) {
                    return;
                }
                
                // Apply search filter if provided
                if (options?.search) {
                    const searchTerm = options.search.toLowerCase();
                    const name = (data.name || '').toLowerCase();
                    const email = (data.email || '').toLowerCase();
                    
                    if (!name.includes(searchTerm) && !email.includes(searchTerm)) {
                        return;
                    }
                }
                
                teamMembers.push({
                    id: doc.id,
                    name: data.name || data.email,
                    email: data.email,
                    role: data.role || 'MEMBER',
                    status: data.status || 'ACTIVE',
                    organizationId: data.organizationId,
                    firebaseUid: data.firebaseUid,
                    isEmailVerified: data.isEmailVerified || false,
                    licenseType: data.licenseType || 'BASIC',
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                    lastActive: data.lastActive?.toDate?.()?.toISOString() || data.lastActive,
                    permissions: data.permissions || [],
                    department: data.department,
                    position: data.position,
                    avatar: data.avatar
                });
            });
            
            console.log(`✅ [CloudProjectIntegration] Found ${teamMembers.length} licensed team members`);
            
            // Sort results in memory to avoid Firestore index requirements
            teamMembers.sort((a, b) => {
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                return nameA.localeCompare(nameB); // Ascending order by name
            });
            
            // Log team members for debugging
            teamMembers.forEach((member, index) => {
                console.log(`👤 [CloudProjectIntegration] Team Member ${index + 1}:`, {
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    role: member.role,
                    status: member.status
                });
            });
            
            return teamMembers;
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error fetching licensed team members from Firestore:', error);
            return [];
        }
    }

    /**
     * Get team members assigned to a specific project
     */
    public async getProjectTeamMembers(projectId: string): Promise<ProjectTeamMember[]> {
        try {
            console.log('🚀 [CloudProjectIntegration] getProjectTeamMembers called for project:', projectId);
            
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log(`🔍 [CloudProjectIntegration] WebOnly mode - fetching team members from Firestore for project: ${projectId}`);
                return await this.getProjectTeamMembersFromFirestore(projectId);
            }
            
            // Use REST API for non-webonly mode
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
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for team members');
                try {
                    return await this.getProjectTeamMembersFromFirestore(projectId);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    return [];
                }
            }
            
            // Return empty array for other errors
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
            
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - fetching team members from Firestore');
                return await this.getLicensedTeamMembersFromFirestore(options);
            }
            
            // Use REST API for non-webonly mode
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
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for team members');
                try {
                    return await this.getLicensedTeamMembersFromFirestore(options);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    return [];
                }
            }
            
            // For other errors, throw to let the UI handle it
            throw error;
        }
    }

    /**
     * Add a team member to a project with a specific role
     */
    public async addTeamMemberToProject(projectId: string, teamMemberId: string, role: TeamMemberRole = TeamMemberRole.MEMBER): Promise<void> {
        try {
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - adding team member to project in Firestore');
                return await this.addTeamMemberToProjectInFirestore(projectId, teamMemberId, role);
            }
            
            // Use REST API for non-webonly mode
            const result = await this.apiRequest<{ success: boolean; data: any }>(`projects/${projectId}/team-members`, 'POST', {
                teamMemberId,
                role
            });
            console.log('✅ Team member added via API:', result);
        } catch (error: any) {
            console.warn('Add team member API endpoint failed:', error?.message);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for adding team member');
                try {
                    return await this.addTeamMemberToProjectInFirestore(projectId, teamMemberId, role);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    throw firestoreError;
                }
            }
            
            // For non-webonly mode, throw error if API fails
            throw error;
        }
    }

    /**
     * Remove a team member from a project
     */
    public async removeTeamMemberFromProject(projectId: string, teamMemberId: string): Promise<void> {
        try {
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - removing team member from project in Firestore');
                return await this.removeTeamMemberFromProjectInFirestore(projectId, teamMemberId);
            }
            
            // Use REST API for non-webonly mode
            const result = await this.apiRequest<{ success: boolean }>(`projects/${projectId}/team-members/${teamMemberId}`, 'DELETE');
            console.log('✅ Team member removed via API:', result);
        } catch (error: any) {
            console.warn('Remove team member API endpoint failed:', error?.message);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for removing team member');
                try {
                    return await this.removeTeamMemberFromProjectInFirestore(projectId, teamMemberId);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    throw firestoreError;
                }
            }
            
            // For non-webonly mode, throw error if API fails
            throw error;
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
     * Validate team member credentials
     */
    public async validateTeamMemberCredentials(email: string, password: string): Promise<{
        isValid: boolean;
        error?: string;
        teamMember?: TeamMember;
        projectAccess?: any[];
    }> {
        try {
            console.log('🚀 [CloudProjectIntegration] validateTeamMemberCredentials called for:', email);
            
            // 🔧 CRITICAL FIX: In webonly mode, use direct Firestore access
            if (this.isWebOnlyMode()) {
                console.log('🔍 [CloudProjectIntegration] WebOnly mode - validating team member credentials from Firestore');
                return await this.validateTeamMemberCredentialsFromFirestore(email, password);
            }
            
            // Use REST API for non-webonly mode
            const result = await this.apiRequest<{
                isValid: boolean;
                error?: string;
                teamMember?: TeamMember;
                projectAccess?: any[];
            }>('team-members/validate-credentials', 'POST', {
                email,
                password
            });
            
            console.log('✅ [CloudProjectIntegration] Team member credentials validated successfully via API');
            return result;
        } catch (error: any) {
            console.error('❌ [CloudProjectIntegration] Team member credential validation failed:', error);
            
            // In webonly mode, try direct Firestore as fallback
            if (this.isWebOnlyMode()) {
                console.log('🔄 [CloudProjectIntegration] Falling back to direct Firestore access for credential validation');
                try {
                    return await this.validateTeamMemberCredentialsFromFirestore(email, password);
                } catch (firestoreError) {
                    console.error('❌ [CloudProjectIntegration] Firestore fallback failed:', firestoreError);
                    return {
                        isValid: false,
                        error: 'Authentication failed'
                    };
                }
            }
            
            // For non-webonly mode, return error
            return {
                isValid: false,
                error: 'Authentication service unavailable'
            };
        }
    }

    /**
     * Validate team member credentials from Firestore (webonly mode)
     */
    private async validateTeamMemberCredentialsFromFirestore(email: string, password: string): Promise<{
        isValid: boolean;
        error?: string;
        teamMember?: TeamMember;
        projectAccess?: any[];
    }> {
        try {
            const { db } = await import('./firebase');
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            
            // Query teamMembers collection for the email
            const teamMembersQuery = query(collection(db, 'teamMembers'), where('email', '==', email));
            const snapshot = await getDocs(teamMembersQuery);
            
            if (snapshot.empty) {
                return {
                    isValid: false,
                    error: 'Team member not found'
                };
            }
            
            const teamMemberData = snapshot.docs[0].data();
            
            // In a real implementation, you'd validate the password hash
            // For now, we'll accept any password for development
            if (password.length < 1) {
                return {
                    isValid: false,
                    error: 'Password is required'
                };
            }
            
            const teamMember: TeamMember = {
                id: snapshot.docs[0].id,
                name: teamMemberData.name || teamMemberData.email,
                email: teamMemberData.email,
                role: teamMemberData.role || 'MEMBER',
                status: teamMemberData.status || 'ACTIVE',
                organizationId: teamMemberData.organizationId,
                firebaseUid: teamMemberData.firebaseUid,
                isEmailVerified: teamMemberData.isEmailVerified || false,
                licenseType: teamMemberData.licenseType || 'BASIC',
                createdAt: teamMemberData.createdAt?.toDate?.()?.toISOString() || teamMemberData.createdAt || new Date().toISOString(),
                updatedAt: teamMemberData.updatedAt?.toDate?.()?.toISOString() || teamMemberData.updatedAt || new Date().toISOString(),
                lastActive: teamMemberData.lastActive?.toDate?.()?.toISOString() || teamMemberData.lastActive,
                permissions: teamMemberData.permissions || [],
                department: teamMemberData.department,
                position: teamMemberData.position,
                avatar: teamMemberData.avatar
            };
            
            return {
                isValid: true,
                teamMember,
                projectAccess: [] // Will be loaded when needed
            };
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error validating team member credentials from Firestore:', error);
            return {
                isValid: false,
                error: 'Authentication failed'
            };
        }
    }

    /**
     * Assign a dataset to a project directly in Firestore (webonly mode)
     */
    private async assignDatasetToProjectInFirestore(projectId: string, datasetId: string): Promise<void> {
        try {
            console.log('🔍 [CloudProjectIntegration] Assigning dataset to project in Firestore:', { projectId, datasetId });
            
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
                updatedAt: new Date()
            });

            // Create a link in the project_datasets collection (following server-side pattern)
            const projectDatasetLink = {
                projectId: projectId,
                datasetId: datasetId,
                addedByUserId: datasetDoc.data().ownerId || 'system',
                addedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await addDoc(collection(db, 'project_datasets'), projectDatasetLink);

            // Update the project document to reflect the dataset assignment
            await updateDoc(projectRef, {
                updatedAt: new Date(),
                lastAccessedAt: new Date()
            });
            
            console.log('✅ [CloudProjectIntegration] Dataset assigned to project successfully in Firestore');
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error assigning dataset to project in Firestore:', error);
            throw error;
        }
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
                throw new Error('Dataset is not assigned to this project');
            }
            
            // Remove the project assignment
            await updateDoc(datasetRef, {
                projectId: null,
                updatedAt: new Date()
            });

            // Remove the link from the project_datasets collection
            const projectDatasetQuery = query(
                collection(db, 'project_datasets'),
                where('projectId', '==', projectId),
                where('datasetId', '==', datasetId)
            );
            
            const projectDatasetDocs = await getDocs(projectDatasetQuery);
            if (!projectDatasetDocs.empty) {
                await deleteDoc(projectDatasetDocs.docs[0].ref);
            }

            // Update the project document to reflect the dataset removal
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                updatedAt: new Date(),
                lastAccessedAt: new Date()
            });
            
            console.log('✅ [CloudProjectIntegration] Dataset unassigned from project successfully in Firestore');
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error unassigning dataset from project in Firestore:', error);
            throw error;
        }
    }

    /**
     * List datasets directly from Firestore (webonly mode)
     */
    private async listDatasetsFromFirestore(params?: {
        organizationId?: string;
        visibility?: string;
        backend?: string;
        query?: string;
    }): Promise<CloudDataset[]> {
        try {
            console.log('🔍 [CloudProjectIntegration] Fetching datasets from Firestore with params:', params);
            
            const { db, auth } = await import('./firebase');
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.warn('⚠️ [CloudProjectIntegration] No authenticated user for datasets fetch');
                return [];
            }

            // Get current user's organization ID from Firestore
            let organizationId = null;
            try {
                const userQuery = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
                const userDoc = await getDocs(userQuery);
                if (!userDoc.empty) {
                    const userData = userDoc.docs[0].data();
                    organizationId = userData.organizationId || userData.orgId;
                    console.log('🏢 [CloudProjectIntegration] Found organization ID from Firestore user document:', organizationId);
                }
            } catch (userError) {
                console.warn('⚠️ [CloudProjectIntegration] Failed to get user document from Firestore:', userError);
            }

            if (!organizationId) {
                console.warn('⚠️ [CloudProjectIntegration] No organization ID found for current user');
                return [];
            }

            console.log('🏢 [CloudProjectIntegration] Fetching datasets for organization:', organizationId);

            const datasets: CloudDataset[] = [];
            
            // Query datasets collection for the current organization
            let datasetsQuery = query(collection(db, 'datasets'));
            if (params?.organizationId || organizationId) {
                const orgId = params?.organizationId || organizationId;
                datasetsQuery = query(datasetsQuery, where('organizationId', '==', orgId));
            }
            
            const snapshot = await getDocs(datasetsQuery);
            
            snapshot.forEach(doc => {
                const data = doc.data();
                
                // Apply backend filter if provided
                if (params?.backend && params.backend !== 'all') {
                    const datasetBackend = data.backend || data.storage?.backend || 'firestore';
                    if (datasetBackend !== params.backend) {
                        return;
                    }
                }
                
                // Apply query filter if provided (search by name or description)
                if (params?.query) {
                    const searchTerm = params.query.toLowerCase();
                    const name = (data.name || '').toLowerCase();
                    const description = (data.description || '').toLowerCase();
                    
                    if (!name.includes(searchTerm) && !description.includes(searchTerm)) {
                        return;
                    }
                }
                
                // Apply visibility filter if provided
                if (params?.visibility) {
                    const datasetVisibility = data.visibility || 'private';
                    if (datasetVisibility !== params.visibility) {
                        return;
                    }
                }
                
                datasets.push({
                    id: doc.id,
                    name: data.name || 'Untitled Dataset',
                    description: data.description || '',
                    projectId: data.projectId || null,
                    type: data.type || 'general',
                    status: data.status || 'active',
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                    size: data.size || 0,
                    recordCount: data.recordCount || 0,
                    schema: data.schema || {},
                    tags: data.tags || [],
                    isPublic: data.isPublic || false,
                    ownerId: data.ownerId,
                    storage: data.storage || { backend: 'firestore' },
                    visibility: data.visibility || 'private'
                });
            });
            
            // Sort results in memory to avoid Firestore index requirements
            datasets.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
            
            console.log(`✅ [CloudProjectIntegration] Found ${datasets.length} datasets from Firestore`);
            return datasets;
            
        } catch (error) {
            console.error('❌ [CloudProjectIntegration] Error listing datasets from Firestore:', error);
            return [];
        }
    }

}

// Export singleton instance
export const cloudProjectIntegration = CloudProjectIntegrationService.getInstance();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).cloudProjectIntegration = cloudProjectIntegration;
}

export default CloudProjectIntegrationService;
