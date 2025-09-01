/**
 * ServiceFactory - Creates and manages service instances
 */
import { ServiceConfig } from './models/types';
import { ProjectService } from './ProjectService';
// import { DatasetService } from './DatasetService';
import { TeamMemberService } from './TeamMemberService';
import { FirestoreAdapter } from './adapters/FirestoreAdapter';

/**
 * ServiceFactory creates and manages service instances
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private config: ServiceConfig;
  private projectService: ProjectService | null = null;
  // private datasetService: DatasetService | null = null;
  private teamMemberService: TeamMemberService | null = null;

  private constructor() {
    // Default configuration
    this.config = {
      isWebOnlyMode: this.detectWebOnlyMode(),
      apiBaseUrl: '/api'
    };
    
    // Initialize Firestore adapter
    this.initializeFirestoreAdapter();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Initialize the ServiceFactory with configuration
   */
  public initialize(config: Partial<ServiceConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
    
    console.log('🔧 [ServiceFactory] Initialized with config:', this.config);
    
    // Reset services to ensure they're recreated with new config
    this.projectService = null;
    // this.datasetService = null;
    this.teamMemberService = null;
  }

  /**
   * Get ProjectService instance
   */
  public getProjectService(): ProjectService {
    if (!this.projectService) {
      this.projectService = ProjectService.getInstance(this.config);
    }
    return this.projectService;
  }

  /**
   * Get DatasetService instance
   */
  // public getDatasetService(): DatasetService {
  //   if (!this.datasetService) {
  //     this.datasetService = DatasetService.getInstance(this.config);
  //   }
  //   return this.datasetService;
  // }

  /**
   * Get TeamMemberService instance
   */
  public getTeamMemberService(): TeamMemberService {
    if (!this.teamMemberService) {
      this.teamMemberService = TeamMemberService.getInstance(this.config);
    }
    return this.teamMemberService;
  }

  /**
   * Check if running in webonly mode
   */
  private detectWebOnlyMode(): boolean {
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
   * Initialize Firestore adapter
   */
  private async initializeFirestoreAdapter(): Promise<void> {
    try {
      const firestoreAdapter = FirestoreAdapter.getInstance();
      await firestoreAdapter.initialize();
    } catch (error) {
      console.error('❌ [ServiceFactory] Failed to initialize Firestore adapter:', error);
    }
  }
}
