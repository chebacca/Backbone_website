/**
 * React Instance Conflict Guard
 * 
 * Wraps components to prevent React Error #301 by ensuring
 * only one React instance is active at a time.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getReactInstanceManager } from '@/utils/reactInstanceManager';

interface ReactInstanceConflictGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

const ReactInstanceConflictGuard: React.FC<ReactInstanceConflictGuardProps> = ({
  children,
  fallback = null,
  componentName = 'Unknown'
}) => {
  const [isSafeToRender, setIsSafeToRender] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const checkReactInstance = useCallback(() => {
    try {
      const manager = getReactInstanceManager();
      const hasConflict = manager.hasConflict();
      
      if (hasConflict) {
        console.warn(`⚠️ [${componentName}] React instance conflict detected, preventing render`);
        setIsSafeToRender(false);
        return false;
      }
      
      setIsSafeToRender(true);
      setRetryCount(0);
      return true;
    } catch (error) {
      console.error(`🚨 [${componentName}] Error checking React instance:`, error);
      setIsSafeToRender(false);
      return false;
    }
  }, [componentName]);

  const retryRender = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        checkReactInstance();
      }, 100 * (retryCount + 1));
    } else {
      console.error(`🚨 [${componentName}] Max retries reached, component will not render`);
    }
  }, [retryCount, maxRetries, checkReactInstance]);

  useEffect(() => {
    // Initial check
    if (!checkReactInstance()) {
      retryRender();
    }

    // Set up conflict listener
    const manager = getReactInstanceManager();
    const unsubscribe = manager.addConflictListener(() => {
      if (!checkReactInstance()) {
        retryRender();
      }
    });

    return unsubscribe;
  }, [checkReactInstance, retryRender]);

  // If not safe to render, show fallback or nothing
  if (!isSafeToRender) {
    return <>{fallback}</>;
  }

  // Wrap children in error boundary
  return (
    <React.ErrorBoundary
      fallback={<>{fallback}</>}
      onError={(error) => {
        if (error.message.includes('Error #301') || error.message.includes('invariant=301')) {
          console.warn(`🚨 [${componentName}] React Error #301 caught by error boundary`);
          setIsSafeToRender(false);
          retryRender();
        }
      }}
    >
      {children}
    </React.ErrorBoundary>
  );
};

export default ReactInstanceConflictGuard;
