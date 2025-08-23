/**
 * Firebase Initializer Service
 * 
 * Ensures proper Firebase setup for webonly production mode with hybrid
 * local/webonly storage capability. Handles authentication, collection
 * initialization, and environment detection.
 */

import { auth, db, isWebOnlyMode, initializeFirebaseCollections } from './firebase';
import { firestoreCollectionManager, COLLECTIONS } from './FirestoreCollectionManager';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';

interface InitializationResult {
  success: boolean;
  mode: 'webonly' | 'local' | 'hybrid';
  collections: {
    accessible: string[];
    inaccessible: string[];
  };
  auth: {
    initialized: boolean;
    user: FirebaseUser | null;
  };
  errors: string[];
}

export class FirebaseInitializer {
  private static instance: FirebaseInitializer;
  private initialized = false;
  private initializationPromise: Promise<InitializationResult> | null = null;
  
  public static getInstance(): FirebaseInitializer {
    if (!FirebaseInitializer.instance) {
      FirebaseInitializer.instance = new FirebaseInitializer();
    }
    return FirebaseInitializer.instance;
  }
  
  /**
   * Initialize Firebase for the current environment
   */
  public async initialize(): Promise<InitializationResult> {
    if (this.initialized && this.initializationPromise) {
      return this.initializationPromise;
    }
    
    console.log('🚀 [FirebaseInitializer] Starting Firebase initialization...');
    
    this.initializationPromise = this.performInitialization();
    const result = await this.initializationPromise;
    this.initialized = result.success;
    
    return result;
  }
  
  private async performInitialization(): Promise<InitializationResult> {
    const result: InitializationResult = {
      success: false,
      mode: this.detectMode(),
      collections: {
        accessible: [],
        inaccessible: []
      },
      auth: {
        initialized: false,
        user: null
      },
      errors: []
    };
    
    try {
      console.log(`🔧 [FirebaseInitializer] Detected mode: ${result.mode}`);
      
      // Step 1: Initialize Firebase collections
      await this.initializeCollections(result);
      
      // Step 2: Set up authentication monitoring
      await this.initializeAuth(result);
      
      // Step 3: Validate collection access
      await this.validateCollections(result);
      
      // Step 4: Perform environment-specific setup
      await this.performEnvironmentSetup(result);
      
      result.success = result.errors.length === 0 || result.collections.accessible.length > 0;
      
      if (result.success) {
        console.log('✅ [FirebaseInitializer] Firebase initialization completed successfully');
        console.log(`📊 [FirebaseInitializer] Accessible collections: ${result.collections.accessible.length}`);
        console.log(`⚠️ [FirebaseInitializer] Inaccessible collections: ${result.collections.inaccessible.length}`);
      } else {
        console.error('❌ [FirebaseInitializer] Firebase initialization failed');
        console.error('Errors:', result.errors);
      }
      
    } catch (error) {
      console.error('❌ [FirebaseInitializer] Critical initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Critical error: ${errorMessage}`);
    }
    
    return result;
  }
  
  private detectMode(): 'webonly' | 'local' | 'hybrid' {
    const webOnly = isWebOnlyMode();
    const hasLocalStorage = this.checkLocalStorageAccess();
    
    if (webOnly && !hasLocalStorage) {
      return 'webonly';
    } else if (!webOnly && hasLocalStorage) {
      return 'local';
    } else {
      return 'hybrid';
    }
  }
  
  private checkLocalStorageAccess(): boolean {
    try {
      const testKey = '__firebase_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
  
  private async initializeCollections(result: InitializationResult): Promise<void> {
    try {
      console.log('🔧 [FirebaseInitializer] Initializing Firestore collections...');
      await initializeFirebaseCollections();
    } catch (error) {
      console.error('❌ [FirebaseInitializer] Failed to initialize collections:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Collection initialization failed: ${errorMessage}`);
    }
  }
  
  private async initializeAuth(result: InitializationResult): Promise<void> {
    try {
      console.log('🔧 [FirebaseInitializer] Setting up authentication monitoring...');
      
      // Set up auth state listener
      onAuthStateChanged(auth, (user) => {
        result.auth.user = user;
        if (user) {
          console.log('✅ [FirebaseInitializer] User authenticated:', user.uid);
          // Re-validate collections when user authenticates
          this.validateCollections(result).catch(console.error);
        } else {
          console.log('ℹ️ [FirebaseInitializer] No authenticated user');
        }
      });
      
      result.auth.initialized = true;
      result.auth.user = auth.currentUser;
      
    } catch (error) {
      console.error('❌ [FirebaseInitializer] Failed to initialize auth:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Auth initialization failed: ${errorMessage}`);
    }
  }
  
  private async validateCollections(result: InitializationResult): Promise<void> {
    console.log('🔧 [FirebaseInitializer] Validating collection access...');
    
    const coreCollections = [
      COLLECTIONS.USERS,
      COLLECTIONS.ORGANIZATIONS,
      COLLECTIONS.ORG_MEMBERS,
      COLLECTIONS.TEAM_MEMBERS,
      COLLECTIONS.PROJECTS,
      COLLECTIONS.PROJECT_TEAM_MEMBERS,
      COLLECTIONS.LICENSES,
      COLLECTIONS.SUBSCRIPTIONS,
      COLLECTIONS.PAYMENTS
    ];
    
    result.collections.accessible = [];
    result.collections.inaccessible = [];
    
    for (const collectionName of coreCollections) {
      try {
        const accessible = await firestoreCollectionManager.validateCollectionAccess(collectionName);
        if (accessible) {
          result.collections.accessible.push(collectionName);
        } else {
          result.collections.inaccessible.push(collectionName);
        }
      } catch (error) {
        console.warn(`⚠️ [FirebaseInitializer] Error validating collection '${collectionName}':`, error);
        result.collections.inaccessible.push(collectionName);
      }
    }
  }
  
  private async performEnvironmentSetup(result: InitializationResult): Promise<void> {
    console.log(`🔧 [FirebaseInitializer] Performing ${result.mode} mode setup...`);
    
    // Configure Firestore settings globally
    await this.configureFirestoreSettings();
    
    switch (result.mode) {
      case 'webonly':
        await this.setupWebOnlyMode(result);
        break;
      case 'local':
        await this.setupLocalMode(result);
        break;
      case 'hybrid':
        await this.setupHybridMode(result);
        break;
    }
  }
  
  private async configureFirestoreSettings(): Promise<void> {
    try {
      console.log('🔧 [FirebaseInitializer] Configuring Firestore settings...');
      
      // Set global Firestore configuration to ignore undefined properties
      // This prevents errors when creating documents with undefined fields
      if (typeof window !== 'undefined') {
        (window as any).FIREBASE_IGNORE_UNDEFINED_PROPERTIES = true;
        console.log('✅ [FirebaseInitializer] Firestore ignoreUndefinedProperties enabled');
      }
      
      // Additional Firestore configuration can be added here
      // Note: The actual ignoreUndefinedProperties setting is configured at the app level
      // in the firebase.ts file
      
    } catch (error) {
      console.error('❌ [FirebaseInitializer] Failed to configure Firestore settings:', error);
    }
  }
  
  private async setupWebOnlyMode(result: InitializationResult): Promise<void> {
    try {
      console.log('🌐 [FirebaseInitializer] Setting up WebOnly mode...');
      
              // Ensure Firebase Auth is properly configured for webonly
        if (!auth.currentUser) {
          // Silently handle - no need to spam console
        }
      
      // Validate critical collections for webonly operation
      const criticalCollections = [COLLECTIONS.USERS, COLLECTIONS.LICENSES, COLLECTIONS.PROJECTS];
      const accessibleCritical = criticalCollections.filter(col => 
        result.collections.accessible.includes(col)
      );
      
      if (accessibleCritical.length === 0) {
        result.errors.push('No critical collections accessible in webonly mode');
      }
      
      // Set webonly flag for other services
      if (typeof window !== 'undefined') {
        (window as any).FIREBASE_WEBONLY_MODE = true;
      }
      
    } catch (error) {
      console.error('❌ [FirebaseInitializer] WebOnly setup failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`WebOnly setup failed: ${errorMessage}`);
    }
  }
  
  private async setupLocalMode(result: InitializationResult): Promise<void> {
    try {
      console.log('🏠 [FirebaseInitializer] Setting up Local mode...');
      
      // Configure for local development with emulators
      console.log('ℹ️ [FirebaseInitializer] Local mode - Firebase emulators should be running');
      
      // Set local flag for other services
      if (typeof window !== 'undefined') {
        (window as any).FIREBASE_LOCAL_MODE = true;
      }
      
    } catch (error: unknown) {
      console.error('❌ [FirebaseInitializer] Local setup failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Local setup failed: ${errorMessage}`);
    }
  }
  
  private async setupHybridMode(result: InitializationResult): Promise<void> {
    try {
      console.log('🔄 [FirebaseInitializer] Setting up Hybrid mode...');
      
      // Configure for hybrid local/webonly operation
      console.log('ℹ️ [FirebaseInitializer] Hybrid mode - supporting both local and webonly operations');
      
      // Set hybrid flag for other services
      if (typeof window !== 'undefined') {
        (window as any).FIREBASE_HYBRID_MODE = true;
      }
      
    } catch (error: unknown) {
      console.error('❌ [FirebaseInitializer] Hybrid setup failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Hybrid setup failed: ${errorMessage}`);
    }
  }
  
  /**
   * Get current initialization status
   */
  public getStatus(): {
    initialized: boolean;
    mode: string;
    collectionsAccessible: number;
    authUser: FirebaseUser | null;
  } {
    return {
      initialized: this.initialized,
      mode: this.detectMode(),
      collectionsAccessible: 0, // Will be updated after initialization
      authUser: auth.currentUser
    };
  }
  
  /**
   * Force re-initialization (useful after auth state changes)
   */
  public async reinitialize(): Promise<InitializationResult> {
    console.log('🔄 [FirebaseInitializer] Forcing re-initialization...');
    this.initialized = false;
    this.initializationPromise = null;
    return this.initialize();
  }
  
  /**
   * Check if a specific collection is accessible
   */
  public async isCollectionAccessible(collectionName: string): Promise<boolean> {
    return firestoreCollectionManager.validateCollectionAccess(collectionName);
  }
  
  /**
   * Get detailed collection statistics
   */
  public async getCollectionStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
      try {
        stats[key] = await firestoreCollectionManager.getCollectionStats(collectionName);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        stats[key] = { accessible: false, error: errorMessage };
      }
    }
    
    return stats;
  }
}

// Export singleton instance
export const firebaseInitializer = FirebaseInitializer.getInstance();

// Auto-initialize on import (but don't block)
if (typeof window !== 'undefined') {
  // Initialize after a short delay to allow other modules to load
  setTimeout(() => {
    firebaseInitializer.initialize().catch(error => {
      console.error('❌ [FirebaseInitializer] Auto-initialization failed:', error);
    });
  }, 100);
}

export default FirebaseInitializer;
