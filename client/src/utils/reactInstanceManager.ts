/**
 * React Instance Manager
 * 
 * Manages React instances to prevent conflicts and React Error #301
 */

interface ReactInstanceInfo {
  version: string;
  source: string;
  timestamp: number;
}

class ReactInstanceManager {
  private instances: Map<string, ReactInstanceInfo> = new Map();
  private conflictDetected = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Monitor for React instances
    this.monitorReactInstances();
    
    // Set up global error handler for React Error #301
    this.setupGlobalErrorHandler();
  }

  private monitorReactInstances() {
    if (typeof window === 'undefined') return;

    // Check for React instances every 100ms
    setInterval(() => {
      this.checkForConflicts();
    }, 100);
  }

  private checkForConflicts() {
    if (typeof window === 'undefined') return;

    const reactKeys = Object.keys(window).filter(key => 
      key.includes('React') && window[key as keyof Window]
    );

    if (reactKeys.length > 1) {
      if (!this.conflictDetected) {
        console.warn('🚨 React Instance Conflict Detected:', reactKeys);
        this.conflictDetected = true;
        this.notifyListeners();
      }
    } else {
      this.conflictDetected = false;
    }
  }

  private setupGlobalErrorHandler() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('Error #301') || 
           event.error.message.includes('invariant=301'))) {
        console.warn('🚨 React Error #301 caught by global handler');
        this.conflictDetected = true;
        this.notifyListeners();
        event.preventDefault();
        return false;
      }
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in React instance conflict listener:', error);
      }
    });
  }

  public addConflictListener(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public hasConflict(): boolean {
    return this.conflictDetected;
  }

  public clearConflict() {
    this.conflictDetected = false;
  }

  public getInstanceInfo(): ReactInstanceInfo[] {
    return Array.from(this.instances.values());
  }
}

// Create singleton instance
export const reactInstanceManager = new ReactInstanceManager();

// Export utility functions
export const getReactInstanceManager = () => reactInstanceManager;
