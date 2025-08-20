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
  hasActiveLicense: () => boolean;
  hasActiveSubscription: () => boolean;
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
    throw new Error('useAuth must be used within an AuthProvider');
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

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
      });

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
      setAuthState({ user: response.user, isAuthenticated: true, isLoading: false, token: response.token });
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
      setAuthState({ user: response.user, isAuthenticated: true, isLoading: false, token: response.token });
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

    // Reset auth state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
    });

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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
