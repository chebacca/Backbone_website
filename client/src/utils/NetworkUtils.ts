/**
 * Network Utilities
 * 
 * Provides utilities for checking network connectivity and managing offline operations.
 */

/**
 * Check if the device is currently online
 */
export const isOnline = (): boolean => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Default to online if navigator is not available
};

/**
 * Register callbacks for online/offline events
 */
export const registerNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return a function to unregister the listeners
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

/**
 * Perform a network connectivity test
 * This is more reliable than just checking navigator.onLine
 */
export const testNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Try to fetch a small resource with cache busting
    const testUrl = `https://backbone-logic.web.app/ping?_=${Date.now()}`;
    const response = await fetch(testUrl, { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' },
      redirect: 'error'
    });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Wait for network connectivity with timeout
 */
export const waitForNetwork = async (timeoutMs = 30000): Promise<boolean> => {
  if (isOnline()) return true;
  
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(false), timeoutMs);
    
    const onOnline = () => {
      clearTimeout(timeout);
      window.removeEventListener('online', onOnline);
      resolve(true);
    };
    
    window.addEventListener('online', onOnline);
  });
};
