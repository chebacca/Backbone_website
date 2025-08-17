import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLoading } from './LoadingContext';
import { authService, LoginResponse, RegisterRequest } from '@/services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN' | 'ACCOUNTING';
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
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  loginWithGoogle: (idToken: string) => Promise<User>;
  loginWithApple: (idToken: string) => Promise<User>;
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
        // In webonly mode, try to validate any existing session with the server
        // The server should maintain session state via cookies or other means
        const validatedUser = await authService.getProfile();
        if (validatedUser) {
          setAuthState({
            user: validatedUser,
            isAuthenticated: true,
            isLoading: false,
            token: 'session-based', // Placeholder token for webonly mode
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
      
      setAuthState({
        user: loginResult.user,
        isAuthenticated: true,
        isLoading: false,
        token: loginResult.token,
      });

      return loginResult.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
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
    });
    
    // Call server logout to clear server-side session
    authService.logout().catch(console.error);
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
      
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        token: result.token,
      });

      return result.user;
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
      const result = await authService.loginWithApple(idToken);
      
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        token: result.token,
      });

      return result.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
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
  };

  return (
    <WebOnlyAuthContext.Provider value={contextValue}>
      {children}
    </WebOnlyAuthContext.Provider>
  );
};

export default WebOnlyAuthProvider;

