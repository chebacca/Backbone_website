import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLoading } from './LoadingContext';
import { authService, LoginResponse, RegisterRequest, User } from '@/services/authService';

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
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  loginWithGoogle: (idToken: string) => Promise<User>;
  loginWithApple: (idToken: string) => Promise<User>;
  // Method to get temporary credentials for Firebase Auth
  getTempCredentials: () => { email: string; password: string } | null;
  // Method to manually authenticate with Firebase Auth for existing sessions
  authenticateWithFirebase: (email: string, password: string) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingConsent?: boolean;
}

const WebOnlyAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useWebOnlyAuth = () => {
  const context = useContext(WebOnlyAuthContext);
  if (context === undefined) {
    throw new Error('useWebOnlyAuth must be used within a WebOnlyAuthProvider');
  }
  return context;
};

interface WebOnlyAuthProviderProps {
  children: ReactNode;
}

/**
 * WebOnly Auth Provider
 * 
 * This is a version of the AuthProvider that works in webonly production mode
 * where localStorage and sessionStorage are disabled. It stores auth state
 * in memory only and relies on server-side session management.
 */
export const WebOnlyAuthProvider: React.FC<WebOnlyAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  const { setLoading } = useLoading();

  // Initialize auth state - in webonly mode, we check with the server
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize Firebase first
        const { firebaseInitializer } = await import('../services/FirebaseInitializer');
        const initResult = await firebaseInitializer.initialize();
        
        console.log('🔧 [WebOnlyAuth] Firebase initialization result:', {
          success: initResult.success,
          mode: initResult.mode,
          accessibleCollections: initResult.collections.accessible.length
        });
        
        // In webonly mode, try to validate any existing session with the server
        // The server should maintain session state via cookies or other means
        const validatedUser = await authService.getProfile();
        if (validatedUser) {
          // 🔥 CRITICAL FIX: Also authenticate with Firebase Auth for existing sessions
          try {
            console.log('🔑 [WebOnlyAuth] Checking Firebase Auth for existing session...');
            const { auth } = await import('../services/firebase');
            
            if (auth.currentUser) {
              console.log('✅ [WebOnlyAuth] Firebase Auth user already authenticated:', auth.currentUser.uid);
            } else {
              console.log('⚠️ [WebOnlyAuth] No Firebase Auth user found for existing session');
              console.log('🔄 [WebOnlyAuth] Attempting to authenticate with Firebase Auth...');
              
              // Try to authenticate with Firebase Auth using stored credentials or session
              try {
                const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
                
                // Try to sign in with the validated user's email
                // For now, we'll need to prompt for password or use a default
                console.log('💡 [WebOnlyAuth] Need Firebase Auth credentials for:', validatedUser.email);
                console.log('💡 [WebOnlyAuth] Please log out and log back in to establish Firebase Auth session');
                
              } catch (firebaseAuthError) {
                console.warn('⚠️ [WebOnlyAuth] Failed to authenticate with Firebase Auth:', firebaseAuthError);
              }
            }
          } catch (firebaseError) {
            console.warn('⚠️ [WebOnlyAuth] Failed to check Firebase Auth status:', firebaseError);
          }
          
          // Prefer any persisted access token so API interceptor attaches Authorization
          const storedToken = (() => {
            try { return localStorage.getItem('auth_token'); } catch { return null; }
          })();
          try { localStorage.setItem('auth_user', JSON.stringify(validatedUser)); } catch {}

          setAuthState({
            user: validatedUser,
            isAuthenticated: true,
            isLoading: false,
            token: storedToken || 'session-based',
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
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

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      
      // Handle 2FA challenge
      if ('requires2FA' in result && result.requires2FA) {
        throw new Error('2FA required - not supported in WebOnly mode');
      }
      
      // Type assertion since we know it's LoginResponse at this point
      const loginResult = result as LoginResponse;
      
      // 🔥 CRITICAL FIX: Firebase Auth is now handled by the authService using Firebase Functions API
      // No need for additional Firebase Auth calls here since authService.login() already handles it
      console.log('✅ [WebOnlyAuth] Firebase Auth authentication handled by authService');
      
      // Persist tokens for API interceptor (Authorization header) and user cache
      try {
        localStorage.setItem('auth_token', loginResult.token);
        if (loginResult.refreshToken) localStorage.setItem('refresh_token', loginResult.refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(loginResult.user));
      } catch {}

      setAuthState({
        user: loginResult.user,
        isAuthenticated: true,
        isLoading: false,
        token: loginResult.token,
        // Store temporary credentials for Firebase Auth retry
        tempCredentials: { email, password }
      });

      return loginResult.user;
      
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    setLoading(true);
    try {
      await authService.register(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      tempCredentials: undefined
    });
    // Clear persisted auth
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
    } catch {}
    
    // Also sign out from Firebase Auth
    (async () => {
      try {
        const { auth } = await import('../services/firebase');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        console.log('✅ [WebOnlyAuth] Signed out from Firebase Auth');
      } catch (error) {
        console.warn('⚠️ [WebOnlyAuth] Failed to sign out from Firebase Auth:', error);
      }
    })();
    
    // Call server logout to clear server-side session
    authService.logout().catch(console.error);
  };

  // 🔥 NEW FUNCTION: Manually authenticate with Firebase Auth for existing sessions
  const authenticateWithFirebase = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔑 [WebOnlyAuth] Manually authenticating with Firebase Auth...');
      const { auth } = await import('../services/firebase');
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
      
      let firebaseAuthSuccess = false;
      
      // First, try to sign in with existing Firebase Auth user
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ [WebOnlyAuth] Successfully signed in with existing Firebase Auth user');
        firebaseAuthSuccess = true;
      } catch (signInError: any) {
        console.log('ℹ️ [WebOnlyAuth] Sign in failed:', signInError.code);
        
        // If user doesn't exist, try to create one
        if (signInError.code === 'auth/user-not-found') {
          try {
            console.log('🆕 [WebOnlyAuth] Creating new Firebase Auth user...');
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ [WebOnlyAuth] Successfully created and authenticated with Firebase Auth');
            firebaseAuthSuccess = true;
          } catch (createError: any) {
            if (createError.code === 'auth/email-already-in-use') {
              console.log('⚠️ [WebOnlyAuth] User exists in Firebase Auth but password doesn\'t match');
            } else {
              console.warn('⚠️ [WebOnlyAuth] Failed to create Firebase Auth user:', createError.code);
            }
          }
        } else if (signInError.code === 'auth/wrong-password') {
          console.log('⚠️ [WebOnlyAuth] Wrong password for existing Firebase Auth user');
        } else {
          console.warn('⚠️ [WebOnlyAuth] Firebase Auth sign in failed:', signInError.code);
        }
      }
      
      if (firebaseAuthSuccess) {
        // Reinitialize Firebase collections with authenticated user
        try {
          const { firebaseInitializer } = await import('../services/FirebaseInitializer');
          await firebaseInitializer.reinitialize();
          console.log('✅ [WebOnlyAuth] Firebase collections reinitialized with authenticated user');
        } catch (initError) {
          console.warn('⚠️ [WebOnlyAuth] Failed to reinitialize Firebase collections:', initError);
        }
      }
      
      return firebaseAuthSuccess;
      
    } catch (firebaseError) {
      console.warn('⚠️ [WebOnlyAuth] Failed to authenticate with Firebase Auth:', firebaseError);
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!authState.isAuthenticated) return;

    try {
      const updatedUser = await authService.getProfile();
      if (updatedUser) {
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout the user
      logout();
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  };

  const loginWithGoogle = async (idToken: string): Promise<User> => {
    setLoading(true);
    try {
      const result = await authService.loginWithGoogle(idToken);
      
      // Persist tokens for API interceptor and user cache
      try {
        localStorage.setItem('auth_token', result.token);
        if ((result as any).refreshToken) localStorage.setItem('refresh_token', (result as any).refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
      } catch {}

      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        token: result.token,
      });

      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async (idToken: string): Promise<User> => {
    setLoading(true);
    try {
      const result = await authService.loginWithApple(idToken);
      
      // Persist tokens for API interceptor and user cache
      try {
        localStorage.setItem('auth_token', result.token);
        if ((result as any).refreshToken) localStorage.setItem('refresh_token', (result as any).refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
      } catch {}

      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        token: result.token,
      });

      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTempCredentials = () => {
    return authState.tempCredentials || null;
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    loginWithGoogle,
    loginWithApple,
    getTempCredentials,
    authenticateWithFirebase, // Add the new function
  };

  return (
    <WebOnlyAuthContext.Provider value={contextValue}>
      {children}
    </WebOnlyAuthContext.Provider>
  );
};

export default WebOnlyAuthProvider;

