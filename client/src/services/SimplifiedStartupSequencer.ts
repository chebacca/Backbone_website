/**
 * Simplified Application Startup Sequencer
 * 
 * A streamlined startup system that eliminates chaos and provides clear guidance
 * for users navigating between Standalone and Network modes with proper project
 * creation and storage options.
 * 
 * Key Principles:
 * 1. Clear, linear flow: Mode Selection → Authentication (if needed) → Project Selection
 * 2. Consistent storage options across modes
 * 3. Proper validation at each step
 * 4. No complex state management that leads to race conditions
 */

import { ApplicationMode } from '../types/applicationMode';

export type StartupStep = 'mode_selection' | 'authentication' | 'project_selection' | 'complete';

export type StorageMode = 'local' | 'cloud' | 'hybrid';

export interface StartupState {
    currentStep: StartupStep;
    selectedMode: ApplicationMode | null;
    storageMode: StorageMode;
    isAuthenticated: boolean;
    user: any;
    selectedProjectId: string | null;
    error: string | null;
    isLoading: boolean;
}

export interface ProjectCreationOptions {
    name: string;
    description?: string;
    storageMode: StorageMode;
    localNetworkConfig?: {
        enabled: boolean;
        port: number;
        address: string;
        maxUsers: number;
    };
    cloudConfig?: {
        provider: 'firestore' | 'gcs';
        bucket?: string;
        prefix?: string;
    };
    collaborationSettings?: {
        maxCollaborators: number;
        enableRealTime: boolean;
        enableComments: boolean;
        enableFileSharing: boolean;
    };
}

class SimplifiedStartupSequencer {
    private static instance: SimplifiedStartupSequencer;
    private listeners: Array<(state: StartupState) => void> = [];
    private state: StartupState = {
        currentStep: 'mode_selection',
        selectedMode: null,
        storageMode: 'local',
        isAuthenticated: false,
        user: null,
        selectedProjectId: null,
        error: null,
        isLoading: false
    };

    private constructor() {
        this.initialize();
    }

    static getInstance(): SimplifiedStartupSequencer {
        if (!this.instance) {
            this.instance = new SimplifiedStartupSequencer();
        }
        return this.instance;
    }

    /**
     * Initialize the sequencer - check for existing state but keep it simple
     */
    private async initialize(): Promise<void> {
        try {
            // Check for existing authentication
            const existingAuth = this.checkExistingAuthentication();

            // Check for saved mode preference
            const savedMode = localStorage.getItem('preferredApplicationMode') as ApplicationMode;
            const savedStorage = localStorage.getItem('preferredStorageMode') as StorageMode;

            // Check if we're returning from a logout or reset
            const isReset = sessionStorage.getItem('startup_reset') === 'true';

            if (isReset) {
                // Clear reset flag and start fresh
                sessionStorage.removeItem('startup_reset');
                this.updateState({
                    currentStep: 'mode_selection',
                    selectedMode: null,
                    storageMode: savedStorage || 'local',
                    isAuthenticated: false
                });
                return;
            }

            // If we have both auth and mode, try to restore session
            if (existingAuth.isValid && savedMode) {
                this.updateState({
                    isAuthenticated: true,
                    user: existingAuth.user,
                    selectedMode: savedMode,
                    storageMode: savedStorage || 'local'
                });

                // Check if we can skip to project selection or completion
                const lastProjectId = localStorage.getItem('lastProjectId');
                if (lastProjectId && this.validateProjectAccess(lastProjectId, savedMode)) {
                    await this.completeStartup(lastProjectId);
                } else {
                    this.updateState({ currentStep: 'project_selection' });
                }
            } else {
                // Start fresh with mode selection
                this.updateState({
                    currentStep: 'mode_selection',
                    storageMode: savedStorage || 'local'
                });
            }
        } catch (error) {
            console.error('Startup initialization error:', error);
            this.updateState({
                error: 'Failed to initialize application',
                currentStep: 'mode_selection'
            });
        }
    }

    /**
     * Subscribe to state changes
     */
    public subscribe(listener: (state: StartupState) => void): () => void {
        this.listeners.push(listener);
        listener(this.state); // Immediate call with current state

        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    /**
     * Get current state
     */
    public getState(): StartupState {
        return { ...this.state };
    }

    /**
     * Handle mode selection
     */
    public async selectMode(mode: ApplicationMode, storageMode: StorageMode = 'local'): Promise<void> {
        try {
            this.updateState({ isLoading: true, error: null });

            // Store preferences
            localStorage.setItem('preferredApplicationMode', mode);
            localStorage.setItem('preferredStorageMode', storageMode);

            this.updateState({
                selectedMode: mode,
                storageMode: storageMode
            });

            // Check if authentication is required
            if (this.requiresAuthentication(mode, storageMode)) {
                if (this.state.isAuthenticated) {
                    // Already authenticated, proceed to project selection
                    this.updateState({
                        currentStep: 'project_selection',
                        isLoading: false
                    });
                } else {
                    // Need authentication
                    this.updateState({
                        currentStep: 'authentication',
                        isLoading: false
                    });
                }
            } else {
                // No authentication required, proceed to project selection
                this.updateState({
                    currentStep: 'project_selection',
                    isLoading: false
                });
            }
        } catch (error) {
            console.error('Mode selection error:', error);
            this.updateState({
                error: 'Failed to select mode',
                isLoading: false
            });
        }
    }

    /**
     * Handle authentication completion
     */
    public async onAuthenticationSuccess(user: any): Promise<void> {
        try {
            this.updateState({
                isAuthenticated: true,
                user: user,
                currentStep: 'project_selection',
                error: null
            });

            // Store auth state
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('lastAuthTime', Date.now().toString());
        } catch (error) {
            console.error('Authentication success handling error:', error);
            this.updateState({
                error: 'Failed to complete authentication'
            });
        }
    }

    /**
     * Handle project selection/creation
     */
    public async selectProject(projectId: string): Promise<void> {
        try {
            this.updateState({ isLoading: true, error: null });

            // Validate project access
            if (!this.validateProjectAccess(projectId, this.state.selectedMode)) {
                throw new Error('Invalid project access');
            }

            await this.completeStartup(projectId);
        } catch (error) {
            console.error('Project selection error:', error);
            this.updateState({
                error: 'Failed to select project',
                isLoading: false
            });
        }
    }

    /**
     * Create a new project with the unified creation dialog
     */
    public async createProject(options: ProjectCreationOptions): Promise<string> {
        try {
            this.updateState({ isLoading: true, error: null });

            // Validate creation options
            this.validateProjectCreationOptions(options);

            // Create project based on mode and storage settings
            const projectId = await this.executeProjectCreation(options);

            // Complete startup with new project
            await this.completeStartup(projectId);

            return projectId;
        } catch (error) {
            console.error('Project creation error:', error);
            this.updateState({
                error: `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`,
                isLoading: false
            });
            throw error;
        }
    }

    /**
     * Reset the startup sequence (for logout or mode change)
     */
    public async reset(): Promise<void> {
        // Clear stored preferences but keep mode preference for better UX
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastAuthTime');
        localStorage.removeItem('lastProjectId');

        // Set reset flag
        sessionStorage.setItem('startup_reset', 'true');

        this.updateState({
            currentStep: 'mode_selection',
            selectedMode: null,
            isAuthenticated: false,
            user: null,
            selectedProjectId: null,
            error: null,
            isLoading: false
        });
    }

    /**
     * Switch modes (advanced feature)
     */
    public async switchMode(newMode: ApplicationMode, newStorageMode: StorageMode = 'local'): Promise<void> {
        // Store current project if any
        if (this.state.selectedProjectId) {
            localStorage.setItem('lastProjectId', this.state.selectedProjectId);
        }

        // Reset to mode selection with new preferences
        await this.selectMode(newMode, newStorageMode);
    }

    // ==================== PRIVATE METHODS ====================

    private updateState(updates: Partial<StartupState>): void {
        this.state = { ...this.state, ...updates };
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Startup listener error:', error);
            }
        });
    }

    private checkExistingAuthentication(): { isValid: boolean; user: any } {
        try {
            const userStr = localStorage.getItem('currentUser');
            const lastAuthStr = localStorage.getItem('lastAuthTime');

            if (!userStr || !lastAuthStr) {
                return { isValid: false, user: null };
            }

            const lastAuth = parseInt(lastAuthStr);
            const now = Date.now();
            const MAX_AUTH_AGE = 24 * 60 * 60 * 1000; // 24 hours

            if (now - lastAuth > MAX_AUTH_AGE) {
                return { isValid: false, user: null };
            }

            const user = JSON.parse(userStr);
            return { isValid: true, user };
        } catch {
            return { isValid: false, user: null };
        }
    }

    private requiresAuthentication(mode: ApplicationMode, storageMode: StorageMode): boolean {
        // Network mode always requires authentication
        if (mode === 'shared_network') {
            return true;
        }

        // Standalone with cloud storage requires authentication
        if (mode === 'standalone' && storageMode === 'cloud') {
            return true;
        }

        // Hybrid mode requires authentication
        if (storageMode === 'hybrid') {
            return true;
        }

        return false;
    }

    private validateProjectAccess(projectId: string, mode: ApplicationMode | null): boolean {
        if (!projectId || !mode) return false;

        // Add validation logic based on mode and user permissions
        // This would integrate with your existing project service
        return true;
    }

    private validateProjectCreationOptions(options: ProjectCreationOptions): void {
        if (!options.name?.trim()) {
            throw new Error('Project name is required');
        }

        if (options.localNetworkConfig?.enabled) {
            const { port, address, maxUsers } = options.localNetworkConfig;
            if (!port || port < 1024 || port > 65535) {
                throw new Error('Invalid port number (must be between 1024-65535)');
            }
            if (!address?.trim()) {
                throw new Error('Network address is required for local network deployment');
            }
            if (!maxUsers || maxUsers < 1 || maxUsers > 100) {
                throw new Error('Max users must be between 1-100');
            }
        }

        if (options.storageMode === 'cloud' && options.cloudConfig?.provider === 'gcs') {
            if (!options.cloudConfig.bucket?.trim()) {
                throw new Error('GCS bucket is required for cloud storage');
            }
        }
    }

    private async executeProjectCreation(options: ProjectCreationOptions): Promise<string> {
        // Check if we need to use cloud infrastructure
        const requiresCloudIntegration = this.requiresCloudIntegration();

        if (requiresCloudIntegration) {
            // Use the cloud project integration service
            const { cloudProjectIntegration } = await import('./CloudProjectIntegration');

            // Ensure authentication token is set
            const token = localStorage.getItem('auth_token');
            if (token) {
                cloudProjectIntegration.setAuthToken(token);
            }

            return await cloudProjectIntegration.createCloudProject(options);
        } else {
            // For local-only projects, use local project creation
            return await this.createLocalProject(options);
        }
    }

    private requiresCloudIntegration(): boolean {
        // Cloud integration required for:
        // 1. Network mode projects
        // 2. Cloud storage mode
        // 3. Hybrid storage mode
        return this.state.selectedMode === 'shared_network' ||
            this.state.storageMode === 'cloud' ||
            this.state.storageMode === 'hybrid';
    }

    private async createLocalProject(options: ProjectCreationOptions): Promise<string> {
        // For standalone + local storage projects
        const projectData = {
            name: options.name,
            description: options.description,
            mode: this.state.selectedMode,
            storageMode: this.state.storageMode,
            createdBy: this.state.user?.id || 'local-user',
            createdAt: new Date().toISOString(),
            localNetworkConfig: options.localNetworkConfig,
            collaborationSettings: options.collaborationSettings
        };

        // Create local project file or database entry
        const projectId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store in local storage for persistence
        const localProjects = JSON.parse(localStorage.getItem('localProjects') || '[]');
        localProjects.push({ id: projectId, ...projectData });
        localStorage.setItem('localProjects', JSON.stringify(localProjects));

        console.log('Created local project:', projectId, projectData);

        return projectId;
    }

    private async completeStartup(projectId: string): Promise<void> {
        // Store project selection
        localStorage.setItem('lastProjectId', projectId);

        this.updateState({
            currentStep: 'complete',
            selectedProjectId: projectId,
            isLoading: false,
            error: null
        });

        // Emit completion event
        window.dispatchEvent(new CustomEvent('startup:complete', {
            detail: {
                mode: this.state.selectedMode,
                storageMode: this.state.storageMode,
                projectId: projectId,
                user: this.state.user
            }
        }));
    }

    // ==================== PUBLIC GETTERS ====================

    public isComplete(): boolean {
        return this.state.currentStep === 'complete' &&
            this.state.selectedMode !== null &&
            this.state.selectedProjectId !== null;
    }

    public requiresAuthentication(): boolean {
        return this.requiresAuthentication(this.state.selectedMode!, this.state.storageMode);
    }

    public getSelectedMode(): ApplicationMode | null {
        return this.state.selectedMode;
    }

    public getStorageMode(): StorageMode {
        return this.state.storageMode;
    }

    public getCurrentUser(): any {
        return this.state.user;
    }

    public getSelectedProjectId(): string | null {
        return this.state.selectedProjectId;
    }
}

// Export singleton instance
export const simplifiedStartupSequencer = SimplifiedStartupSequencer.getInstance();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).simplifiedStartupSequencer = simplifiedStartupSequencer;
}
