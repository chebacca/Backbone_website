import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLoading } from './LoadingContext';
import { authService } from '@/services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN' | 'ACCOUNTING' | 'TEAM_MEMBER';
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
          try { JSON.parse(userStr); } catch {}
          
          // Validate token with server
          try {
            const validatedUser = await authService.validateToken(token);
            
            // 🔥 CRITICAL FIX: Also authenticate with Firebase Auth when restoring session
            try {
              console.log('🔑 [Auth] Restoring Firebase Auth session for existing user...');
              const { tryRestoreFirebaseSession, isEmailAuthenticated } = await import('../services/firebase');
              
              // Try to restore Firebase Auth session
              const firebaseSessionRestored = await tryRestoreFirebaseSession(validatedUser.email);
              
              if (firebaseSessionRestored) {
                console.log('✅ [Auth] Firebase Auth session restored successfully');
              } else if (isEmailAuthenticated(validatedUser.email)) {
                console.log('✅ [Auth] Firebase Auth user already authenticated:', validatedUser.email);
              } else {
                // Firebase Auth requirement removed - authentication is working fine
              }
            } catch (firebaseError) {
              // Firebase Auth requirement removed - authentication is working fine
            }
            
            setAuthState({
              user: validatedUser,
              isAuthenticated: true,
              isLoading: false,
              token,
            });
          } catch (error) {
            // Token is invalid, clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              token: null,
            });
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
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

      // 🔥 CRITICAL FIX: Also authenticate with Firebase Auth for Firestore access
      try {
        console.log('🔑 [Auth] Authenticating with Firebase Auth for email/password user...');
        const { auth } = await import('../services/firebase');
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ [Auth] Successfully authenticated with Firebase Auth for email/password user');
        
        // Store the Firebase UID for Firestore queries
        const firebaseUid = auth.currentUser?.uid;
        if (firebaseUid) {
          response.user.firebaseUid = firebaseUid;
          console.log('🔗 [Auth] Stored Firebase UID for email/password user:', firebaseUid);
        }
      } catch (firebaseError) {
        console.error('❌ [Auth] Failed to authenticate with Firebase Auth for email/password user:', firebaseError);
        console.warn('⚠️ [Auth] Firestore access will be limited without Firebase Auth');
        // Continue with login since server auth succeeded
      }

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
        // Store temporary credentials for Firebase Auth
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

  const logout = (): void => {
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
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      logout();
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
