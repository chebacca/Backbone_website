import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Type declarations for Vite environment variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Determine the base URL for API calls
const getBaseURL = (): string => {
  // Check if we're in production (Firebase hosting)
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1' &&
                      !window.location.hostname.includes('localhost');
  
  if (isProduction) {
    // In production (Firebase hosting), use the same domain with /api path
    // This works with Firebase hosting rewrites that route /api/* to Cloud Functions
    return '/api';
  }
  
  // In development, use environment variable or default to relative /api
  // This works with Vite's proxy configuration
  const envBaseURL = (import.meta.env as any).VITE_API_BASE_URL || (import.meta.env as any).VITE_API_URL;
  return envBaseURL || '/api';
};

const baseURL = getBaseURL();

// Simple token storage helpers to avoid circular deps with authService
const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem('auth_token');
  },
  setAccessToken(token: string | null): void {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  },
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },
  setRefreshToken(token: string | null): void {
    if (token) localStorage.setItem('refresh_token', token);
    else localStorage.removeItem('refresh_token');
  },
  clearAll(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },
};

// Debug: surface which baseURL is being used (dev only)
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  // eslint-disable-next-line no-console
  console.info('[api] baseURL =', baseURL, 'hostname =', window.location.hostname);
}

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000, // Increased timeout for Firebase Functions
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor with refresh flow on 401
  let isRefreshing = false;
  let pendingRequests: Array<(token: string | null) => void> = [];

  const processQueue = (newToken: string | null): void => {
    pendingRequests.forEach((cb) => cb(newToken));
    pendingRequests = [];
  };

  const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken?: string } | null> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      // Use a bare axios instance to avoid interceptor recursion
      const res = await axios.post(
        `${baseURL.replace(/\/$/, '')}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );
      if (res.data?.success && res.data?.data?.tokens?.accessToken) {
        const accessToken: string = res.data.data.tokens.accessToken;
        const nextRefresh: string | undefined = res.data.data.tokens.refreshToken;
        tokenStorage.setAccessToken(accessToken);
        if (nextRefresh) tokenStorage.setRefreshToken(nextRefresh);
        return { accessToken, refreshToken: nextRefresh };
      }
      return null;
    } catch {
      return null;
    }
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // If not a 401, or there is no response, just reject
      if (!error.response || error.response.status !== 401) {
        return Promise.reject(error);
      }

      // Do not try to refresh on auth endpoints
      const url = (originalRequest.url || '').toString();
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/verify-2fa') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/register');

      if (isAuthEndpoint) {
        tokenStorage.clearAll();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        // Already retried once, force logout
        tokenStorage.clearAll();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          pendingRequests.push((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            try {
              originalRequest.headers = originalRequest.headers || {};
              (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
              originalRequest._retry = true;
              resolve(instance(originalRequest));
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      isRefreshing = true;
      const newTokens = await refreshAccessToken();
      isRefreshing = false;

      if (!newTokens?.accessToken) {
        processQueue(null);
        tokenStorage.clearAll();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      processQueue(newTokens.accessToken);

      // Retry the original request with the new token
      originalRequest.headers = originalRequest.headers || {};
      (originalRequest.headers as any).Authorization = `Bearer ${newTokens.accessToken}`;
      originalRequest._retry = true;
      return instance(originalRequest);
    }
  );

  return instance;
};

export const api = createApiInstance();

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic API error type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// API utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error: any): ApiError => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.response.data?.error || 'Server error occurred',
        status: error.response.status,
        code: error.response.data?.code,
        details: error.response.data?.details,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  },

  // Create request with loading state
  withLoading: async <T>(
    request: () => Promise<AxiosResponse<ApiResponse<T>>>,
    setLoading?: (loading: boolean) => void
  ): Promise<T> => {
    try {
      setLoading?.(true);
      const response = await request();
      
      if (response.data.success) {
        return (response.data.data as T);
      } else {
        throw new Error(response.data.message || response.data.error || 'Request failed');
      }
    } catch (error) {
      throw apiUtils.handleError(error);
    } finally {
      setLoading?.(false);
    }
  },

  // Upload file with progress
  uploadFile: async (
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.post(endpoint, formData, config);
    return response.data;
  },

  // Download file
  downloadFile: async (url: string, filename?: string): Promise<void> => {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Specific API endpoint builders
export const endpoints = {
  // Auth endpoints
  auth: {
    login: () => 'auth/login',
    verify2FA: () => 'auth/verify-2fa',
    register: () => 'auth/register',
    logout: () => 'auth/logout',
    profile: () => 'auth/me',
    refresh: () => 'auth/refresh',
    verifyEmail: (token: string) => `auth/verify-email/${token}`,
    resendVerification: () => 'auth/resend-verification',
    forgotPassword: () => 'auth/forgot-password',
    resetPassword: (token: string) => `auth/reset-password/${token}`,
    validateToken: () => 'auth/validate-token',
    twoFASetupInitiate: () => 'auth/2fa/setup/initiate',
    twoFASetupVerify: () => 'auth/2fa/setup/verify',
    twoFADisable: () => 'auth/2fa/disable',
    oauthGoogle: () => 'auth/oauth/google',
    oauthApple: () => 'auth/oauth/apple',
  },

  // Payment endpoints
  payments: {
    pricing: () => 'payments/pricing',
    createSubscription: () => 'payments/create-subscription',
    history: () => 'payments/history',
    details: (paymentId: string) => `payments/${paymentId}`,
    cancelSubscription: (subscriptionId: string) => `payments/cancel-subscription/${subscriptionId}`,
    updatePaymentMethod: (subscriptionId: string) => `payments/payment-method/${subscriptionId}`,
    calculateTax: () => 'payments/calculate-tax',
    webhook: () => 'payments/webhook',
  },

  // Invoice endpoints
  invoices: {
    list: () => 'invoices',
    details: (invoiceId: string) => `invoices/${invoiceId}`,
    create: () => 'invoices',
    updateStatus: (invoiceId: string) => `invoices/${invoiceId}/status`,
    delete: (invoiceId: string) => `invoices/${invoiceId}`,
  },

  // License endpoints
  licenses: {
    myLicenses: () => 'licenses/my-licenses',
    activate: () => 'licenses/activate',
    deactivate: () => 'licenses/deactivate',
    validate: () => 'licenses/validate',
    details: (licenseId: string) => `licenses/${licenseId}`,
    downloadSDK: (licenseKey: string) => `licenses/download-sdk/${licenseKey}`,
    downloadSpecificSDK: (sdkId: string, licenseKey: string) => `licenses/download-sdk/${sdkId}/${licenseKey}`,
    analytics: (licenseId?: string) => `licenses/analytics${licenseId ? `/${licenseId}` : ''}`,
    transfer: () => 'licenses/transfer',
    bulkCreate: () => 'licenses/bulk/create',
    sdkVersions: () => 'licenses/sdk/versions',
    reportIssue: () => 'licenses/report-issue',
    usage: (licenseKey: string) => `licenses/usage/${licenseKey}`,
  },

  // Subscription endpoints
  subscriptions: {
    mySubscriptions: () => 'subscriptions/my-subscriptions',
    details: (subscriptionId: string) => `subscriptions/${subscriptionId}`,
    update: (subscriptionId: string) => `subscriptions/${subscriptionId}`,
    cancel: (subscriptionId: string) => `subscriptions/${subscriptionId}/cancel`,
    reactivate: (subscriptionId: string) => `subscriptions/${subscriptionId}/reactivate`,
    invoices: (subscriptionId: string) => `subscriptions/${subscriptionId}/invoices`,
    usage: (subscriptionId: string) => `subscriptions/${subscriptionId}/usage`,
    updatePaymentMethod: (subscriptionId: string) => `subscriptions/${subscriptionId}/payment-method`,
    billingHistory: (subscriptionId: string) => `subscriptions/${subscriptionId}/billing-history`,
    previewChanges: (subscriptionId: string) => `subscriptions/${subscriptionId}/preview-changes`,
    renewal: (subscriptionId: string) => `subscriptions/${subscriptionId}/renewal`,
    addSeats: (subscriptionId: string) => `subscriptions/${subscriptionId}/add-seats`,
  },

  // User endpoints
  users: {
    updateBillingAddress: () => 'users/billing-address',
    updateTaxInformation: () => 'users/tax-information',
    updateBusinessProfile: () => 'users/business-profile',
    kycVerify: () => 'users/kyc/verify',
    consent: () => 'users/consent',
    consentHistory: () => 'users/consent-history',
    auditLog: () => 'users/audit-log',
    exportData: () => 'users/export-data',
    requestDeletion: () => 'users/request-deletion',
    statistics: () => 'users/statistics',
    notifications: () => 'users/notifications',
  },

  // Admin endpoints
  admin: {
    dashboardStats: () => 'admin/dashboard-stats',
    users: () => 'admin/users',
    userDetails: (userId: string) => `admin/users/${userId}`,
    updateUser: (userId: string) => `admin/users/${userId}`,
    subscriptions: () => 'admin/subscriptions',
    licenses: () => 'admin/licenses',
    revokeLicense: (licenseId: string) => `admin/licenses/${licenseId}/revoke`,
    createLicense: () => 'admin/licenses/create',
    complianceEvents: () => 'admin/compliance-events',
    resolveComplianceEvent: (eventId: string) => `admin/compliance-events/${eventId}/resolve`,
    paymentAnalytics: () => 'admin/analytics/payments',
    licenseAnalytics: () => 'admin/analytics/licenses',
    generateReport: () => 'admin/reports/compliance',
    createEnterpriseCustomer: () => 'admin/enterprise/customers',
    systemHealth: () => 'admin/system/health',
    payments: () => 'admin/payments',
    paymentDetails: (paymentId: string) => `admin/payments/${paymentId}`,
    companyFilingGet: () => 'admin/settings/company-filing',
    companyFilingSave: () => 'admin/settings/company-filing',
  },

  // Accounting endpoints
  accounting: {
    payments: () => 'accounting/payments',
    exportPayments: () => 'accounting/payments/export',
    kyc: () => 'accounting/kyc',
    consentsLatest: () => 'accounting/consents/latest',
    userConsentHistory: (userId: string) => `accounting/users/${userId}/consent-history`,
  },

  // Webhook endpoints
  webhooks: {
    stripe: () => '/webhooks/stripe',
    sendgrid: () => '/webhooks/sendgrid',
    test: () => '/webhooks/test',
    health: () => '/webhooks/health',
    retryFailed: () => '/webhooks/retry-failed',
  },
};

export default api;
