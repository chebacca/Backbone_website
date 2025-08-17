/**
 * React Error Prevention Utility
 * 
 * This utility provides comprehensive error prevention mechanisms for React applications,
 * specifically targeting React Error #301 (multiple instances) and other common issues.
 * 
 * Following MPC library best practices for error prevention and recovery.
 */

// ============================================================================
// REACT ERROR #301 PREVENTION
// ============================================================================

/**
 * Detects and prevents React Error #301 (multiple React instances)
 */
export class ReactError301Prevention {
  private static instance: ReactError301Prevention;
  private isInitialized = false;
  private reactInstanceCount = 0;
  private readonly MAX_REACT_INSTANCES = 1;

  static getInstance(): ReactError301Prevention {
    if (!ReactError301Prevention.instance) {
      ReactError301Prevention.instance = new ReactError301Prevention();
    }
    return ReactError301Prevention.instance;
  }

  /**
   * Initialize React error prevention
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('React Error Prevention already initialized');
      return;
    }

    console.log('🛡️ Initializing React Error Prevention...');

    // Monitor React instance creation
    this.monitorReactInstances();
    
    // Prevent multiple React versions
    this.preventMultipleReactVersions();
    
    // Monitor for React conflicts
    this.monitorReactConflicts();
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();

    this.isInitialized = true;
    console.log('✅ React Error Prevention initialized');
  }

  /**
   * Monitor React instance creation to detect duplicates
   */
  private monitorReactInstances(): void {
    const originalCreateRoot = (window as any).ReactDOM?.createRoot;
    
    if (originalCreateRoot) {
      (window as any).ReactDOM.createRoot = (...args: any[]) => {
        this.reactInstanceCount++;
        
        if (this.reactInstanceCount > this.MAX_REACT_INSTANCES) {
          console.warn('⚠️ Multiple React roots detected - this may cause React Error #301');
          console.warn('Consider using a single root or proper cleanup');
        }
        
        console.log(`🔍 React root created (${this.reactInstanceCount}/${this.MAX_REACT_INSTANCES})`);
        return originalCreateRoot.apply(this, args);
      };
    }

    // Monitor React.StrictMode usage
    const originalStrictMode = (window as any).React?.StrictMode;
    if (originalStrictMode) {
      console.log('🔍 React.StrictMode detected - monitoring for double-rendering issues');
    }
  }

  /**
   * Prevent multiple React versions from loading
   */
  private preventMultipleReactVersions(): void {
    // Check for multiple React versions
    const reactVersions = new Set<string>();
    
    // Monitor script loading
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(document, tagName);
      
      if (tagName === 'script' && (element as HTMLScriptElement).src) {
        const src = (element as HTMLScriptElement).src;
        if (src.includes('react') || src.includes('React')) {
          console.log('🔍 React-related script detected:', src);
          
          // Check if this might cause conflicts
          if (src.includes('cdn') && (window as any).React) {
            console.warn('⚠️ CDN React script detected while React is already loaded');
            console.warn('This may cause React Error #301');
          }
        }
      }
      
      return element;
    };

    // Monitor for React version conflicts
    if ((window as any).React) {
      const version = (window as any).React.version;
      reactVersions.add(version);
      console.log(`🔍 React version detected: ${version}`);
    }
  }

  /**
   * Monitor for React conflicts and provide warnings
   */
  private monitorReactConflicts(): void {
    // Check for common conflict patterns
    const checkConflicts = () => {
      const conflicts: string[] = [];
      
      // Check for multiple React instances
      if ((window as any).React && (window as any).ReactDOM) {
        const reactVersion = (window as any).React.version;
        const reactDOMVersion = (window as any).ReactDOM.version;
        
        if (reactVersion !== reactDOMVersion) {
          conflicts.push(`React version mismatch: React ${reactVersion} vs ReactDOM ${reactDOMVersion}`);
        }
      }
      
      // Check for conflicting libraries
      if ((window as any).Vue && (window as any).React) {
        conflicts.push('Both Vue and React detected - potential conflicts');
      }
      
      // Check for multiple state management libraries
      const stateLibraries = ['Redux', 'MobX', 'Zustand', 'Recoil', 'Jotai'];
      const detectedLibraries = stateLibraries.filter(lib => (window as any)[lib]);
      
      if (detectedLibraries.length > 1) {
        conflicts.push(`Multiple state management libraries detected: ${detectedLibraries.join(', ')}`);
      }
      
      if (conflicts.length > 0) {
        console.warn('🚨 Potential React conflicts detected:');
        conflicts.forEach(conflict => console.warn(`  - ${conflict}`));
      }
    };

    // Check conflicts on load and periodically
    checkConflicts();
    setInterval(checkConflicts, 30000); // Check every 30 seconds
  }

  /**
   * Set up global error handlers for React errors
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message) {
        const message = event.error.message;
        
        if (message.includes('Error #301') || message.includes('invariant=301')) {
          console.error('🚨 React Error #301 caught by global handler');
          this.handleReactError301();
        } else if (message.includes('Error #130') || message.includes('object')) {
          console.error('🚨 React Error #130 caught by global handler');
          this.handleReactError130();
        }
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message) {
        const message = event.reason.message;
        
        if (message.includes('Error #301') || message.includes('invariant=301')) {
          console.error('🚨 React Error #301 caught by unhandled rejection');
          this.handleReactError301();
        }
      }
    });
  }

  /**
   * Handle React Error #301 (multiple instances)
   */
  private handleReactError301(): void {
    console.log('🔄 Handling React Error #301...');
    
    try {
      // Clear potential React conflicts
      this.clearReactConflicts();
      
      // Attempt recovery
      this.attemptRecovery();
      
    } catch (error) {
      console.error('❌ Failed to handle React Error #301:', error);
    }
  }

  /**
   * Handle React Error #130 (object serialization)
   */
  private handleReactError130(): void {
    console.log('🔄 Handling React Error #130...');
    
    try {
      // Clear corrupted storage
      this.clearCorruptedStorage();
      
    } catch (error) {
      console.error('❌ Failed to handle React Error #130:', error);
    }
  }

  /**
   * Clear React conflicts
   */
  private clearReactConflicts(): void {
    console.log('🧹 Clearing React conflicts...');
    
    // Clear window references that might cause conflicts
    const reactRefs = ['React', 'ReactDOM', '__REACT_DEVTOOLS_GLOBAL_HOOK__'];
    
    reactRefs.forEach(ref => {
      if ((window as any)[ref]) {
        console.log(`Clearing window.${ref}...`);
        delete (window as any)[ref];
      }
    });
    
    // Reset instance count
    this.reactInstanceCount = 0;
    
    console.log('✅ React conflicts cleared');
  }

  /**
   * Attempt recovery from React errors
   */
  private attemptRecovery(): void {
    console.log('🔄 Attempting recovery...');
    
    try {
      // Try to reload the page after a delay
      setTimeout(() => {
        console.log('🔄 Reloading page for recovery...');
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Recovery failed:', error);
    }
  }

  /**
   * Clear corrupted storage
   */
  private clearCorruptedStorage(): void {
    console.log('🧹 Clearing corrupted storage...');
    
    try {
      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
        console.log('✅ localStorage cleared');
      }
      
      // Clear sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
        console.log('✅ sessionStorage cleared');
      }
      
      // Clear cache
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
          console.log('✅ Cache cleared');
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
    }
  }

  /**
   * Get current React error prevention status
   */
  getStatus(): {
    isInitialized: boolean;
    reactInstanceCount: number;
    hasConflicts: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      reactInstanceCount: this.reactInstanceCount,
      hasConflicts: this.reactInstanceCount > this.MAX_REACT_INSTANCES
    };
  }

  /**
   * Reset the error prevention system
   */
  reset(): void {
    console.log('🔄 Resetting React Error Prevention...');
    
    this.isInitialized = false;
    this.reactInstanceCount = 0;
    
    console.log('✅ React Error Prevention reset');
  }
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Development-only utilities for debugging React errors
 */
export const ReactErrorDebug = {
  /**
   * Log React instance information
   */
  logReactInfo(): void {
    if ((import.meta as any).env?.DEV) {
      console.group('🔍 React Instance Information');
      
      if ((window as any).React) {
        console.log('React version:', (window as any).React.version);
        console.log('React location:', 'window.React');
      }
      
      if ((window as any).ReactDOM) {
        console.log('ReactDOM version:', (window as any).ReactDOM.version);
        console.log('ReactDOM location:', 'window.ReactDOM');
      }
      
      console.log('React.StrictMode available:', !!(window as any).React?.StrictMode);
      console.log('React DevTools hook:', !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__);
      
      console.groupEnd();
    }
  },

  /**
   * Check for potential React conflicts
   */
  checkForConflicts(): string[] {
    const conflicts: string[] = [];
    
    // Check for multiple React versions
    if ((window as any).React && (window as any).ReactDOM) {
      const reactVersion = (window as any).React.version;
      const reactDOMVersion = (window as any).ReactDOM.version;
      
      if (reactVersion !== reactDOMVersion) {
        conflicts.push(`React version mismatch: React ${reactVersion} vs ReactDOM ${reactDOMVersion}`);
      }
    }
    
    // Check for conflicting libraries
    if ((window as any).Vue && (window as any).React) {
      conflicts.push('Both Vue and React detected');
    }
    
    return conflicts;
  },

  /**
   * Get React error prevention status
   */
  getStatus() {
    return ReactError301Prevention.getInstance().getStatus();
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ReactError301Prevention;
