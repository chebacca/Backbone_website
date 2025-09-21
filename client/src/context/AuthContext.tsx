import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLoading } from './LoadingContext';
import { authService } from '@/services/authService';
import { 
  restoreValidatedUserData, 
  cleanupInvalidUserData, 
  validateUserObject 
} from '@/utils/authValidationUtils';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN' | 'ACCOUNTING' | 'TEAM_MEMBER' | 'ENTERPRISE_ADMIN' | 'OWNER';
  subscription?: {
    plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
    status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';
    currentPeriodEnd: string;
  };
  licenses?: Array<{
    id: string;
    key: string;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'PENDING';
    createdAt: string;
    expiresAt: string;
  }>;
  // Team member specific properties
  isTeamMember?: boolean;
  organizationId?: string;
  memberRole?: string;
  memberStatus?: string;
  // Demo user properties
  isDemoUser?: boolean;
  demoExpiresAt?: string;
  demoStatus?: string;
  teamMemberData?: {
    projectAccess: Array<{
      projectId: string;
      projectName: string;
      description?: string;
      role: string;
      assignedAt: string;
      lastAccessed?: string;
    }>;
    licenses: Array<any>;
    organizationId: string;
    memberRole: string;
    memberStatus: string;
  };
  firebaseUid?: string; // Added for Firebase Auth UID
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  // Temporary credentials for Firebase Auth
  tempCredentials?: {
    email: string;
    password: string;
  };
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  loginWithGoogle: (idToken: string) => Promise<User>;
  loginWithApple: (idToken: string) => Promise<User>;
  hasActiveLicense: () => boolean;
  hasActiveSubscription: () => boolean;
  // Method to get temporary credentials for Firebase Auth
  getTempCredentials: () => { email: string; password: string } | null;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingConsent?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return safe default values instead of throwing an error
    console.warn('useAuth called outside of AuthProvider, returning default values');
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      token: null,
      login: async () => { throw new Error('Auth not initialized'); },
      register: async () => { throw new Error('Auth not initialized'); },
      logout: () => {},
      refreshUser: async () => {},
      updateUser: () => {},
      loginWithGoogle: async () => { throw new Error('Auth not initialized'); },
      loginWithApple: async () => { throw new Error('Auth not initialized'); },
      hasActiveLicense: () => false,
      hasActiveSubscription: () => false,
      getTempCredentials: () => null,
    } as AuthContextType;
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  const { setLoading } = useLoading();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');

        if (token && userStr) {
          // Parse to ensure JSON validity; actual user state is fetched from server
          let userData;
          try { 
            userData = JSON.parse(userStr); 
          } catch (parseError) {
            console.warn('Failed to parse stored user data, clearing invalid data');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return;
          }
          
          // 🔧 ENHANCED: Validate user data before using it
          if (!validateUserObject(userData)) {
            console.warn('⚠️ [Auth] Invalid stored user data - missing email property:', userData?.email);
            console.log('🔧 [Auth] Clearing invalid user data from localStorage');
            cleanupInvalidUserData();
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return;
          }
          
          // Set initial state immediately to prevent loading flicker
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            token,
          });

          // Validate token with server in background
          try {
            console.log('🔑 [Auth] Validating stored token with server...');
            const validatedUser = await authService.validateToken(token);
            
            // Update state with validated user data
            setAuthState({
              user: validatedUser,
              isAuthenticated: true,
              isLoading: false,
              token,
            });
            
            // Update localStorage with validated data
            localStorage.setItem('auth_user', JSON.stringify(validatedUser));
            
            // 🔥 CRITICAL FIX: Also authenticate with Firebase Auth when restoring session
            try {
              console.log('🔑 [Auth] Restoring Firebase Auth session for existing user...');
              
              // 🔧 ENHANCED: Use comprehensive validation for user data
              if (!validateUserObject(validatedUser)) {
                console.warn('⚠️ [Auth] Invalid validatedUser object - missing email property:', validatedUser?.email);
                console.log('🔧 [Auth] Clearing invalid user data from localStorage');
                cleanupInvalidUserData();
                return;
              }
              
              const { tryRestoreFirebaseSession, isEmailAuthenticated } = await import('../services/firebase');
              
              // Try to restore Firebase Auth session
              const firebaseSessionRestored = await tryRestoreFirebaseSession(validatedUser.email);
              
              if (firebaseSessionRestored) {
                console.log('✅ [Auth] Firebase Auth session restored successfully');
              } else if (isEmailAuthenticated(validatedUser.email)) {
                console.log('✅ [Auth] Firebase Auth user already authenticated:', validatedUser.email);
              } else {
                // Try to authenticate with stored credentials if available
                const tempCredentials = localStorage.getItem('temp_credentials');
                if (tempCredentials) {
                  try {
                    const { email, password } = JSON.parse(tempCredentials);
                    const { auth } = await import('../services/firebase');
                    const { signInWithEmailAndPassword } = await import('firebase/auth');
                    
                    await signInWithEmailAndPassword(auth, email, password);
                    console.log('✅ [Auth] Firebase Auth restored with stored credentials');
                  } catch (firebaseError) {
                    console.warn('⚠️ [Auth] Failed to restore Firebase Auth with stored credentials:', firebaseError);
                  }
                }
              }
            } catch (firebaseError) {
              console.warn('⚠️ [Auth] Firebase Auth restoration failed:', firebaseError);
              // Continue with authentication since server auth succeeded
            }
            
          } catch (error) {
            console.error('❌ [Auth] Token validation failed:', error);
            // Token is invalid, clear localStorage and reset state
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('temp_credentials');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              token: null,
            });
          }
        } else {
          // No stored auth data, set loading to false immediately
          console.log('🔑 [Auth] No stored auth data, setting loading to false');
          setAuthState(prev => ({ ...prev, isLoading: false }));
          
          // Optionally check if Firebase Auth has a user (but don't block on it)
          try {
            const { auth } = await import('../services/firebase');
            const { onAuthStateChanged } = await import('firebase/auth');
            
            // Listen for Firebase Auth state changes (non-blocking)
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
              if (firebaseUser) {
                console.log('🔑 [Auth] Firebase Auth user detected during initialization:', firebaseUser.email);
                
                // Load user profile directly from Firestore using helper function
                try {
                  const { loadUserFromFirestore } = await import('../services/firebase');
                  const userProfile = await loadUserFromFirestore(firebaseUser);
                  
                  setAuthState({
                    user: userProfile,
                    isAuthenticated: true,
                    isLoading: false,
                    token: null, // No API token needed in web-only mode
                  });
                  
                  // Also update localStorage to persist the user data
                  localStorage.setItem('auth_user', JSON.stringify(userProfile));
                  
                  console.log('✅ [Auth] Updated auth state with Firestore user data during init:', userProfile.email);
                } catch (profileError) {
                  console.warn('⚠️ [Auth] Failed to get user profile from Firestore during init:', profileError);
                  // Create fallback user
                  const fallbackUser = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    role: 'USER' as const,
                    firebaseUid: firebaseUser.uid
                  };
                  
                  setAuthState({
                    user: fallbackUser,
                    isAuthenticated: true,
                    isLoading: false,
                    token: null,
                  });
                }
              }
            });
            
            // Cleanup listener
            return () => unsubscribe();
          } catch (firebaseError) {
            console.warn('⚠️ [Auth] Firebase Auth check failed:', firebaseError);
            // Already set loading to false above, so no need to do it again
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null,
        });
      }
    };

    initializeAuth();
  }, []);

  // Listen for Firebase Auth state changes to keep local state in sync
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupFirebaseAuthListener = async () => {
      try {
        const { auth } = await import('../services/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log('🔑 [Auth] Firebase Auth user detected, updating local state:', firebaseUser.email);
            
            // Clear UnifiedDataService cache when user changes
            try {
              const { unifiedDataService } = await import('../services/UnifiedDataService');
              unifiedDataService.clearUserCache(firebaseUser.uid);
              console.log('🧹 [Auth] Cleared UnifiedDataService cache for new user');
            } catch (cacheError) {
              console.warn('⚠️ [Auth] Failed to clear UnifiedDataService cache:', cacheError);
            }
            
            // If we don't have a user in local state, try to load from Firestore
            if (!authState.user || !authState.isAuthenticated) {
              try {
                console.log('🔍 [Auth] Loading user data from Firestore for:', firebaseUser.email);
                const { loadUserFromFirestore } = await import('../services/firebase');
                const userProfile = await loadUserFromFirestore(firebaseUser);
                
                // Update auth state with complete user data
                setAuthState(prev => ({
                  ...prev,
                  user: userProfile,
                  isAuthenticated: true,
                  isLoading: false,
                }));
                
                // Also update localStorage to persist the user data
                localStorage.setItem('auth_user', JSON.stringify(userProfile));
                
                console.log('✅ [Auth] Updated auth state with complete Firestore user data:', userProfile.email);
              } catch (firestoreError) {
                console.warn('⚠️ [Auth] Failed to load user data from Firestore:', firestoreError);
                // Create fallback user
                const fallbackUser = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  role: 'USER' as const,
                  firebaseUid: firebaseUser.uid
                };
                
                setAuthState(prev => ({
                  ...prev,
                  user: fallbackUser,
                  isAuthenticated: true,
                  isLoading: false,
                }));
              }
            } else {
              // Just update the Firebase UID if we already have user data
              setAuthState(prev => ({
                ...prev,
                user: prev.user ? { ...prev.user, firebaseUid: firebaseUser.uid } : prev.user,
                isAuthenticated: true,
              }));
            }
          } else if (!firebaseUser && authState.isAuthenticated) {
            console.log('🔑 [Auth] Firebase Auth user signed out, updating local state');
            // Update local state if Firebase Auth user is gone but local state still shows authenticated
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: false,
              user: null,
            }));
            
            // Clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('temp_credentials');
            
            // Clear UnifiedDataService cache when user signs out
            try {
              const { unifiedDataService } = await import('../services/UnifiedDataService');
              unifiedDataService.clearAllCache();
              console.log('🧹 [Auth] Cleared all UnifiedDataService cache on sign out');
            } catch (cacheError) {
              console.warn('⚠️ [Auth] Failed to clear UnifiedDataService cache on sign out:', cacheError);
            }
          }
        });
      } catch (error) {
        console.warn('⚠️ [Auth] Failed to setup Firebase Auth listener:', error);
      }
    };
    
    setupFirebaseAuthListener();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authState.isAuthenticated]);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password) as any;
      // 2FA challenge branch
      if (response?.requires2FA && response?.interimToken) {
        throw { requires2FA: true, interimToken: response.interimToken };
      }
      // Normal login branch
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      // 🔥 CRITICAL FIX: Firebase Auth is now handled by the authService using Firebase Functions API
      // No need for additional Firebase Auth calls here since authService.login() already handles it
      console.log('✅ [Auth] Firebase Auth authentication handled by authService');
      
      // Store the Firebase UID if available
      if (response.user?.firebaseUid) {
        console.log('🔗 [Auth] Firebase UID available from authService:', response.user.firebaseUid);
      }

      // Clear UnifiedDataService cache for new login
      try {
        const { unifiedDataService } = await import('../services/UnifiedDataService');
        unifiedDataService.clearAllCache();
        console.log('🧹 [Auth] Cleared UnifiedDataService cache for new login');
      } catch (cacheError) {
        console.warn('⚠️ [Auth] Failed to clear UnifiedDataService cache for new login:', cacheError);
      }

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
        // Store temporary credentials for Firebase Auth restoration
        tempCredentials: { email, password }
      });

      // Store credentials in localStorage for Firebase Auth restoration
      localStorage.setItem('temp_credentials', JSON.stringify({ email, password }));

      // If backend indicates updated legal acceptance is required, redirect user to Terms page
      if ((response as any)?.requiresLegalAcceptance) {
        // Rely on UI to present modal or direct users to the Terms page
        // We store a flag so pages can block critical flows until accepted
        localStorage.setItem('legal_acceptance_required', 'true');
      } else {
        localStorage.removeItem('legal_acceptance_required');
      }
      
      return response.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await authService.loginWithGoogle(idToken);
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      // 🔥 CRITICAL FIX: Also authenticate with Firebase Auth for Firestore access
      try {
        console.log('🔑 [Auth] Authenticating with Firebase Auth for Google user...');
        const { auth } = await import('../services/firebase');
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        
        // For Google users, we need to create a Firebase Auth user or use their email
        // Since we don't have a password, we'll need to handle this differently
        // For now, we'll try to sign in with their email and a default password
        // In production, you might want to create Firebase Auth users for Google users
        if (response.user.email) {
          // Try to sign in with email (this will fail if no Firebase Auth user exists)
          try {
            await signInWithEmailAndPassword(auth, response.user.email, 'google-user-temp-password');
            console.log('✅ [Auth] Successfully authenticated with Firebase Auth for Google user');
            
            // Store the Firebase UID for Firestore queries
            const firebaseUid = auth.currentUser?.uid;
            if (firebaseUid) {
              response.user.firebaseUid = firebaseUid;
              console.log('🔗 [Auth] Stored Firebase UID for Google user:', firebaseUid);
            }
          } catch (firebaseError) {
            console.warn('⚠️ [Auth] Failed to authenticate with Firebase Auth for Google user:', firebaseError);
            console.log('ℹ️ [Auth] Firestore access may be limited without Firebase Auth');
          }
        }
      } catch (firebaseError) {
        console.warn('⚠️ [Auth] Failed to authenticate with Firebase Auth for Google user:', firebaseError);
        console.log('ℹ️ [Auth] Firestore access may be limited without Firebase Auth');
      }
      
      setAuthState({ 
        user: response.user, 
        isAuthenticated: true, 
        isLoading: false, 
        token: response.token,
        // Store temporary credentials for Firebase Auth (if available)
        tempCredentials: response.user.email ? { email: response.user.email, password: 'google-user-temp-password' } : undefined
      });
      localStorage.removeItem('legal_acceptance_required');
      return response.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async (idToken: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await authService.loginWithApple(idToken);
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      // 🔥 CRITICAL FIX: Also authenticate with Firebase Auth for Firestore access
      try {
        console.log('🔑 [Auth] Authenticating with Firebase Auth for Apple user...');
        const { auth } = await import('../services/firebase');
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        
        // For Apple users, similar to Google users
        if (response.user.email) {
          try {
            await signInWithEmailAndPassword(auth, response.user.email, 'apple-user-temp-password');
            console.log('✅ [Auth] Successfully authenticated with Firebase Auth for Apple user');
            
            // Store the Firebase UID for Firestore queries
            const firebaseUid = auth.currentUser?.uid;
            if (firebaseUid) {
              response.user.firebaseUid = firebaseUid;
              console.log('🔗 [Auth] Stored Firebase UID for Apple user:', firebaseUid);
            }
          } catch (firebaseError) {
            console.warn('⚠️ [Auth] Failed to authenticate with Firebase Auth for Apple user:', firebaseError);
            console.log('ℹ️ [Auth] Firestore access may be limited without Firebase Auth');
          }
        }
      } catch (firebaseError) {
        console.warn('⚠️ [Auth] Failed to authenticate with Firebase Auth for Apple user:', firebaseError);
        console.log('ℹ️ [Auth] Firestore access may be limited without Firebase Auth');
      }
      
      setAuthState({ 
        user: response.user, 
        isAuthenticated: true, 
        isLoading: false, 
        token: response.token,
        // Store temporary credentials for Firebase Auth (if available)
        tempCredentials: response.user.email ? { email: response.user.email, password: 'apple-user-temp-password' } : undefined
      });
      localStorage.removeItem('legal_acceptance_required');
      return response.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      
      // Store auth data (user might need email verification)
      localStorage.setItem('auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
      }
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
      });
      localStorage.removeItem('legal_acceptance_required');
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    // Clear UnifiedDataService cache on logout
    try {
      const { unifiedDataService } = await import('../services/UnifiedDataService');
      unifiedDataService.clearAllCache();
      console.log('🧹 [Auth] Cleared UnifiedDataService cache on logout');
    } catch (cacheError) {
      console.warn('⚠️ [Auth] Failed to clear UnifiedDataService cache on logout:', cacheError);
    }

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('temp_credentials');

    // Reset auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      tempCredentials: undefined
    });

    // Also sign out from Firebase Auth
    (async () => {
      try {
        const { auth } = await import('../services/firebase');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        console.log('✅ [Auth] Signed out from Firebase Auth');
      } catch (error) {
        console.warn('⚠️ [Auth] Failed to sign out from Firebase Auth:', error);
      }
    })();

    // Call logout on server (fire and forget)
    if (authState.token) {
      authService.logout().catch(console.error);
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!authState.token) return;

    try {
      const user = await authService.getProfile();
      
      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      setAuthState(prev => ({
        ...prev,
        user,
      }));

      // Clear UnifiedDataService cache when user data is refreshed
      try {
        const { unifiedDataService } = await import('../services/UnifiedDataService');
        unifiedDataService.clearUserCache(user.id);
        console.log('🧹 [Auth] Cleared UnifiedDataService cache for refreshed user');
      } catch (cacheError) {
        console.warn('⚠️ [Auth] Failed to clear UnifiedDataService cache for refreshed user:', cacheError);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      await logout();
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...userData };
    
    // Update localStorage
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };

  // Helper function to check if user has an active license
  const hasActiveLicense = (): boolean => {
    if (!authState.user) return false;
    
    // Check if user has any active licenses
    if (authState.user.licenses && authState.user.licenses.length > 0) {
      return authState.user.licenses.some(license => 
        license.status === 'ACTIVE' && 
        new Date(license.expiresAt) > new Date()
      );
    }
    
    return false;
  };

  // Helper function to check if user has an active subscription
  const hasActiveSubscription = (): boolean => {
    if (!authState.user) return false;
    
    // Check if user has an active subscription
    if (authState.user.subscription) {
      return authState.user.subscription.status === 'ACTIVE' || 
             authState.user.subscription.status === 'TRIALING';
    }
    
    return false;
  };

  // Method to get temporary credentials for Firebase Auth
  const getTempCredentials = (): { email: string; password: string } | null => {
    if (authState.tempCredentials) {
      return authState.tempCredentials;
    }
    return null;
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    logout,
    refreshUser,
    updateUser,
    hasActiveLicense,
    hasActiveSubscription,
    getTempCredentials,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
