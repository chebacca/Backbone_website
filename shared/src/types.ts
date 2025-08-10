// Shared types for Dashboard v14 Licensing Website
// These types exactly match the Prisma schema structure

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
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

export enum LicenseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PROCESSING = 'PROCESSING'
}

export enum AMLStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Core User model matching Prisma schema
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerifyToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorTempSecret?: string;
  twoFactorBackupCodes: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  complianceProfile?: any;
  billingAddress?: any;
  taxInformation?: any;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  termsAcceptedAt?: Date;
  privacyPolicyAcceptedAt?: Date;
  identityVerified: boolean;
  identityVerificationData?: any;
  kycStatus?: string;
  kycCompletedAt?: Date;
  businessProfile?: any;
  ipAddress?: string;
  userAgent?: string;
  registrationSource?: string;
  organizationId?: string;
  
  // Relations
  subscriptions?: Subscription[];
  licenses?: License[];
  payments?: Payment[];
  auditLogs?: AuditLog[];
  consents?: PrivacyConsent[];
  analytics?: UsageAnalytics[];
  compliance?: ComplianceEvent[];
}

// Subscription model matching Prisma schema
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  seats: number;
  pricePerSeat: number;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  
  // Relations
  user?: User;
  licenses?: License[];
  payments?: Payment[];
}

// License model matching Prisma schema
export interface License {
  id: string;
  key: string;
  userId: string;
  subscriptionId: string;
  status: LicenseStatus;
  tier: SubscriptionTier;
  activatedAt?: Date;
  expiresAt?: Date;
  deviceInfo?: any;
  ipAddress?: string;
  activationCount: number;
  maxActivations: number;
  features: any;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  
  // Relations
  user?: User;
  subscription?: Subscription;
}

// Payment model matching Prisma schema
export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  receiptUrl?: string;
  paymentMethod?: string;
  billingAddressSnapshot: any;
  taxAmount?: number;
  taxRate?: number;
  taxJurisdiction?: string;
  complianceData?: any;
  ipAddress?: string;
  userAgent?: string;
  processingLocation?: string;
  amlScreeningStatus: AMLStatus;
  amlScreeningDate?: Date;
  amlRiskScore?: number;
  pciCompliant: boolean;
  tokenizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  subscription?: Subscription;
}

// UsageAnalytics model matching Prisma schema
export interface UsageAnalytics {
  id: string;
  userId: string;
  licenseId: string;
  event: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  
  // Relations
  user?: User;
  license?: License;
}

// SDKVersion model matching Prisma schema
export interface SDKVersion {
  id: string;
  platform: string;
  version: string;
  isLatest: boolean;
  size?: number;
  checksum?: string;
  releaseNotes?: string;
  downloadUrl: string;
  createdAt: Date;
}

// LicenseDeliveryLog model matching Prisma schema
export interface LicenseDeliveryLog {
  id: string;
  licenseId: string;
  paymentId: string;
  deliveryMethod: string;
  emailAddress?: string;
  deliveryStatus: string;
  emailSent?: boolean;
  lastAttemptAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// EmailLog model matching Prisma schema
export interface EmailLog {
  id: string;
  sendgridId: string;
  template?: string;
  email?: string;
  status?: string;
  error?: string;
  data?: any;
  updatedAt: Date;
  createdAt: Date;
}

// PrivacyConsent model matching Prisma schema
export interface PrivacyConsent {
  id: string;
  userId: string;
  consentType: string;
  consentGranted: boolean;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
  legalBasis?: string;
  consentDate: Date;
  
  // Relations
  user?: User;
}

// AuditLog model matching Prisma schema
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  
  // Relations
  user?: User;
}

// ComplianceEvent model matching Prisma schema
export interface ComplianceEvent {
  id: string;
  userId?: string;
  paymentId?: string;
  eventType: string;
  severity: Severity;
  description: string;
  metadata?: any;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  payment?: Payment;
}

// WebhookEvent model matching Prisma schema
export interface WebhookEvent {
  id: string;
  type: string;
  stripeId: string;
  data: any;
  processed: boolean;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Request/Response types for API calls
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

export interface ActivationRequest {
  licenseKey: string;
  deviceInfo: {
    platform: string;
    version: string;
    deviceId: string;
    deviceName?: string;
    architecture?: string;
    osVersion?: string;
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

// Dashboard specific types
export interface DashboardStats {
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

export interface LicenseAnalytics {
  summary: {
    totalEvents: number;
    eventTypes: Record<string, number>;
    activeLicenses: number;
    totalLicenses: number;
  };
  events: UsageAnalytics[];
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
