/**
 * Utility to clear Firebase Auth requirement warnings from localStorage
 * This prevents the "Enhanced Data Access Available" popup from appearing
 */

export const clearAuthWarnings = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Check if warnings exist
    const hadWarning = localStorage.getItem('firebase_auth_required') === 'true';
    const hadEmail = localStorage.getItem('firebase_auth_email');
    
    // Remove the flags that trigger the warning
    localStorage.removeItem('firebase_auth_required');
    localStorage.removeItem('firebase_auth_email');
    
    if (hadWarning || hadEmail) {
      console.log('✅ Auth warnings cleared from localStorage:', { hadWarning, hadEmail });
    } else {
      console.log('ℹ️ No auth warnings found in localStorage');
    }
  } catch (error) {
    console.warn('Failed to clear auth warnings:', error);
  }
};

// Manual clear function for debugging
export const manualClearAuthWarnings = (): void => {
  clearAuthWarnings();
  console.log('🧹 Manual auth warning clear completed');
};

// Auto-clear on import to ensure warnings are removed
clearAuthWarnings();
