/**
 * Debug Configuration
 * 
 * Controls debug logging and console output throughout the application
 */

// Environment-based debug settings
// Licensing website is ALWAYS in production mode (web-only)
const isDevelopment = false; // Licensing website never runs in development mode
const isProduction = true;   // Licensing website is always in production mode

// Debug configuration
export const DEBUG_CONFIG = {
  // Enable debug logging in development only
  enableDebugLogs: isDevelopment,
  
  // Enable Firebase debug logs (only in development)
  enableFirebaseLogs: isDevelopment,
  
  // Enable authentication debug logs (only in development)
  enableAuthLogs: isDevelopment,
  
  // Enable admin service debug logs (only in development)
  enableAdminLogs: isDevelopment,
  
  // Show Firebase Auth requirement popups (only in production webonly mode)
  showFirebaseAuthPopups: isProduction,
  
  // Log level for production
  productionLogLevel: 'error' as 'debug' | 'info' | 'warn' | 'error',
  
  // Log level for development
  developmentLogLevel: 'debug' as 'debug' | 'info' | 'warn' | 'error'
};

// Debug logging utility
export const debugLog = {
  debug: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableDebugLogs) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableDebugLogs) {
      console.log(`ℹ️ [INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableDebugLogs) {
      console.log(`⚠️ [WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors
    console.error(`❌ [ERROR] ${message}`, ...args);
  },
  
  firebase: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableFirebaseLogs) {
      console.log(`🔥 [Firebase] ${message}`, ...args);
    }
  },
  
  auth: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableAuthLogs) {
      console.log(`🔐 [Auth] ${message}`, ...args);
    }
  },
  
  admin: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableAdminLogs) {
      console.log(`👑 [Admin] ${message}`, ...args);
    }
  }
};

export default DEBUG_CONFIG;
