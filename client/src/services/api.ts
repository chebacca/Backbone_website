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

// Prefer BASE_URL; fall back to legacy VITE_API_URL; finally default to relative /api (works with Firebase Hosting rewrites)
let rawBase = (import.meta.env as any).VITE_API_BASE_URL || (import.meta.env as any).VITE_API_URL;
if (!rawBase) {
  // Use relative '/api' for both local dev (via Vite proxy) and production (via Hosting rewrites)
  rawBase = '/api';
}

// Normalize to avoid double slashes, and guard against env value '/'
let baseURL = rawBase.replace(/\/$/, '');
if (baseURL === '') {
  baseURL = '/api';
}
// Debug: surface which baseURL is being used (dev only)
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  // eslint-disable-next-line no-console
  console.info('[api] baseURL =', baseURL);
}

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle common errors
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
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
    verifyEmail: (token: string) => `auth/verify-email/${token}`,
    resendVerification: () => 'auth/resend-verification',
    forgotPassword: () => 'auth/forgot-password',
    resetPassword: (token: string) => `auth/reset-password/${token}`,
    validateToken: () => 'auth/validate-token',
    twoFASetupInitiate: () => 'auth/2fa/setup/initiate',
    twoFASetupVerify: () => 'auth/2fa/setup/verify',
    twoFADisable: () => 'auth/2fa/disable',
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
