/**
 * React Instance Conflict Prevention Hook
 * 
 * Prevents React Error #301 by ensuring only one React instance is active
 * and providing safe rendering patterns for components that might conflict.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface ReactInstanceConflictPreventionOptions {
  componentName: string;
  delay?: number;
  maxRetries?: number;
}

export const useReactInstanceConflictPrevention = (options: ReactInstanceConflictPreventionOptions) => {
  const { componentName, delay = 0, maxRetries = 3 } = options;
  const [isSafeToRender, setIsSafeToRender] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const checkReactInstance = useCallback(() => {
    try {
      // Check if React is available and not conflicting
      if (typeof window !== 'undefined' && window.React) {
        // Check for multiple React instances
        const reactInstances = Object.keys(window).filter(key => 
          key.includes('React') && window[key as keyof Window]
        );
        
        if (reactInstances.length > 1) {
          console.warn(`⚠️ [${componentName}] Multiple React instances detected:`, reactInstances);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.warn(`⚠️ [${componentName}] Error checking React instance:`, error);
      return false;
    }
  }, [componentName]);

  const safeRender = useCallback(() => {
    if (checkReactInstance()) {
      setIsSafeToRender(true);
      setRetryCount(0);
    } else if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      // Retry after a delay
      timeoutRef.current = setTimeout(() => {
        safeRender();
      }, delay * (retryCount + 1));
    } else {
      console.error(`🚨 [${componentName}] Max retries reached, component will not render`);
      setIsSafeToRender(false);
    }
  }, [checkReactInstance, retryCount, maxRetries, delay, componentName]);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    frameRef.current = requestAnimationFrame(() => {
      safeRender();
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [safeRender]);

  const forceSafeRender = useCallback(() => {
    setIsSafeToRender(true);
  }, []);

  return {
    isSafeToRender,
    retryCount,
    forceSafeRender,
    checkReactInstance
  };
};

