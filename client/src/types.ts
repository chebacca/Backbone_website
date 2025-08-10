// Shared types for Dashboard v14 Licensing Website

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  organizationId?: string;
  lastLoginAt?: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ENTERPRISE_ADMIN = 'ENTERPRISE_ADMIN',
  ACCOUNTING = 'ACCOUNTING'
}

export enum SubscriptionTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING'
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  seats: number;
  pricePerSeat: number;
}

export enum LicenseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

export interface License {
  id: string;
  key: string;
  userId: string;
  subscriptionId: string;
  status: LicenseStatus;
  tier: SubscriptionTier;
  activatedAt?: Date;
  expiresAt?: Date;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  adminUserId: string;
  subscriptionId: string;
  maxSeats: number;
  usedSeats: number;
  createdAt: Date;
  updatedAt: Date;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  allowSelfRegistration: boolean;
  requireDomainEmail: boolean;
  autoAssignLicenses: boolean;
  notificationEmails: string[];
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface PricingTier {
  id: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  priceId: string; // Stripe price ID
  features: string[];
  maxSeats?: number;
  popular?: boolean;
  enterprise?: boolean;
}

export interface ActivationRequest {
  licenseKey: string;
  deviceInfo: {
    platform: string;
    version: string;
    deviceId: string;
  };
}

export interface ActivationResponse {
  success: boolean;
  message: string;
  license?: License;
  cloudConfig?: CloudConfig;
}

export interface CloudConfig {
  apiEndpoint: string;
  websocketEndpoint: string;
  storageConfig: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  features: {
    realTimeCollaboration: boolean;
    cloudStorage: boolean;
    aiFeatures: boolean;
    analytics: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  subscription?: Subscription;
  licenses?: License[];
}

export interface CreateSubscriptionRequest {
  tier: SubscriptionTier;
  seats: number;
  paymentMethodId: string;
  organizationName?: string;
}

export interface BulkLicenseRequest {
  subscriptionId: string;
  seats: number;
  userEmails?: string[];
  autoActivate?: boolean;
}

export interface SDKDownload {
  platform: 'windows' | 'macos' | 'linux';
  version: string;
  downloadUrl: string;
  size: string;
  checksum: string;
}

export interface UsageAnalytics {
  userId: string;
  licenseId: string;
  event: string;
  metadata: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  activeLicenses: number;
  tierBreakdown: {
    tier: SubscriptionTier;
    count: number;
    revenue: number;
  }[];
  recentSignups: User[];
  recentPayments: Payment[];
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: ValidationError[];
  success?: string;
}

// Email templates
export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface WelcomeEmailData {
  userName: string;
  activationLink: string;
  licenseKey: string;
  tier: SubscriptionTier;
}

export interface InvoiceEmailData {
  userName: string;
  amount: number;
  currency: string;
  invoiceUrl: string;
  period: {
    start: Date;
    end: Date;
  };
}

// Webhook types
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface WebhookResponse {
  received: boolean;
  processed: boolean;
  error?: string;
}
