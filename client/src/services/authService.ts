interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
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

import { api, endpoints } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface Login2FAChallengeResponse {
  requires2FA: boolean;
  interimToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingConsent?: boolean;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse | Login2FAChallengeResponse> {
    const response = await api.post(endpoints.auth.login(), { email, password });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    const data = response.data.data;
    // 2FA challenge passthrough
    if (data?.requires2FA && data?.interimToken) {
      return { requires2FA: true, interimToken: data.interimToken };
    }

    // Normalize tokens → token (accessToken) + refreshToken
    return {
      user: data.user,
      token: data.tokens?.accessToken,
      refreshToken: data.tokens?.refreshToken,
    } as LoginResponse;
  },

  async verify2FA(interimToken: string, code: string): Promise<LoginResponse> {
    const response = await api.post(
      endpoints.auth.verify2FA(),
      { token: code },
      { headers: { Authorization: `Bearer ${interimToken}` } }
    );

    if (response.data.success) {
      const data = response.data.data;
      return {
        user: data.user,
        token: data.tokens?.accessToken,
        refreshToken: data.tokens?.refreshToken,
      } as LoginResponse;
    } else {
      throw new Error(response.data.message || '2FA verification failed');
    }
  },

  async twoFASetupInitiate(): Promise<{ otpauthUrl: string; qrCodeDataUrl: string; secret: string }> {
    const response = await api.post(endpoints.auth.twoFASetupInitiate());
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to initiate 2FA');
  },

  async twoFASetupVerify(code: string): Promise<{ backupCodes: string[] }> {
    const response = await api.post(endpoints.auth.twoFASetupVerify(), { token: code });
    if (response.data.success) return response.data.data;
    throw new Error(response.data.message || 'Failed to enable 2FA');
  },

  async twoFADisable(): Promise<void> {
    const response = await api.post(endpoints.auth.twoFADisable());
    if (!response.data.success) throw new Error(response.data.message || 'Failed to disable 2FA');
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post(endpoints.auth.register(), userData);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post(endpoints.auth.logout());
    } catch (error) {
      // Logout should always succeed locally even if server call fails
      console.warn('Logout server call failed:', error);
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get(endpoints.auth.profile());

    if (response.data.success) {
      return response.data.data.user;
    } else {
      throw new Error(response.data.message || 'Failed to get profile');
    }
  },

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<User> {
    // Server does not expose validate-token; use /auth/me to validate
    const response = await api.get(endpoints.auth.profile(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      return response.data.data.user;
    } else {
      throw new Error(response.data.message || 'Token validation failed');
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.get(endpoints.auth.verifyEmail(token));

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Email verification failed');
    }
  },

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<{ message: string }> {
    const response = await api.post(endpoints.auth.resendVerification());

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to resend verification');
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post(endpoints.auth.forgotPassword(), {
      email,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to send reset email');
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post(endpoints.auth.resetPassword(token), {
      password,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Password reset failed');
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await api.put(endpoints.auth.profile(), updates);

    if (response.data.success) {
      return response.data.data.user;
    } else {
      throw new Error(response.data.message || 'Profile update failed');
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    return !!(token && user);
  },

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      return null;
    }
  },

  /**
   * Get stored token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Clear stored auth data
   */
  clearStoredAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
  },
};
