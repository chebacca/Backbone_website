import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY');
  }
  const privateKey = rawKey.replace(/\\n/g, '\n');
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();
const auth = getAuth();

// Type definitions for Firestore documents
export interface FirestoreUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'SUPERADMIN' | 'USER' | 'ENTERPRISE_ADMIN';
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
  privacyConsent: any[];
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  termsAcceptedAt?: Date;
  privacyPolicyAcceptedAt?: Date;
  identityVerified: boolean;
  identityVerificationData?: any;
  kycStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  kycCompletedAt?: Date;
  businessProfile?: any;
  ipAddress?: string;
  userAgent?: string;
  registrationSource?: string;
  organizationId?: string;
}

export interface FirestoreSubscription {
  id: string;
  userId: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'UNPAID';
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
}

export interface FirestoreLicense {
  id: string;
  key: string;
  userId: string;
  subscriptionId: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
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
}

export interface FirestorePayment {
  id: string;
  userId: string;
  subscriptionId: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PROCESSING';
  description?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: string;
  billingAddressSnapshot: any;
  taxAmount?: number;
  taxRate?: number;
  taxJurisdiction?: string;
  complianceData: any;
  ipAddress?: string;
  userAgent?: string;
  processingLocation?: string;
  amlScreeningStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'REQUIRES_REVIEW';
  amlScreeningDate?: Date;
  amlRiskScore?: number;
  pciCompliant: boolean;
  tokenizationId?: string;
}

export interface FirestoreUsageAnalytics {
  id: string;
  userId: string;
  licenseId: string;
  event: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface FirestoreSDKVersion {
  id: string;
  platform: string;
  version: string;
  isLatest: boolean;
  size?: number;
  checksum?: string;
  releaseNotes?: string;
  downloadUrl?: string;
  createdAt: Date;
}

export interface FirestoreLicenseDeliveryLog {
  id: string;
  licenseId: string;
  paymentId: string;
  deliveryMethod: 'EMAIL' | 'MANUAL' | 'OTHER';
  emailAddress?: string;
  deliveryStatus: 'PENDING' | 'SENT' | 'FAILED';
  emailSent?: boolean;
  lastAttemptAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Optional email log modeling for SendGrid events
export interface FirestoreEmailLog {
  id: string;
  sendgridId: string;
  template?: string;
  email?: string;
  status?: string;
  error?: string;
  data?: any;
  updatedAt?: Date;
}

export interface FirestorePrivacyConsent {
  id: string;
  userId: string;
  consentType: string;
  consentGranted: boolean;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
  legalBasis?: string;
  consentDate: Date;
}

export class FirestoreService {
  // User operations
  async createUser(userData: Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreUser> {
    const userRef = db.collection('users').doc();
    const now = new Date();
    
    const user: FirestoreUser = {
      id: userRef.id,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(user);
    return user;
  }

  async getUserById(id: string): Promise<FirestoreUser | null> {
    const doc = await db.collection('users').doc(id).get();
    return doc.exists ? (doc.data() as FirestoreUser) : null;
  }

  async getUserByEmail(email: string): Promise<FirestoreUser | null> {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as FirestoreUser;
  }

  async updateUser(id: string, updates: Partial<FirestoreUser>): Promise<void> {
    await db.collection('users').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await db.collection('users').doc(id).delete();
  }

  // Subscription operations
  async createSubscription(subscriptionData: Omit<FirestoreSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreSubscription> {
    const subscriptionRef = db.collection('subscriptions').doc();
    const now = new Date();
    
    const subscription: FirestoreSubscription = {
      id: subscriptionRef.id,
      ...subscriptionData,
      createdAt: now,
      updatedAt: now,
    };

    await subscriptionRef.set(subscription);
    return subscription;
  }

  async getSubscriptionById(id: string): Promise<FirestoreSubscription | null> {
    const doc = await db.collection('subscriptions').doc(id).get();
    return doc.exists ? (doc.data() as FirestoreSubscription) : null;
  }

  async getSubscriptionsByUserId(userId: string): Promise<FirestoreSubscription[]> {
    const snapshot = await db.collection('subscriptions').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => doc.data() as FirestoreSubscription);
  }

  async updateSubscription(id: string, updates: Partial<FirestoreSubscription>): Promise<void> {
    await db.collection('subscriptions').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  // License operations
  async createLicense(licenseData: Omit<FirestoreLicense, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreLicense> {
    const licenseRef = db.collection('licenses').doc();
    const now = new Date();
    
    const license: FirestoreLicense = {
      id: licenseRef.id,
      ...licenseData,
      createdAt: now,
      updatedAt: now,
    };

    await licenseRef.set(license);
    return license;
  }

  async getLicenseById(id: string): Promise<FirestoreLicense | null> {
    const doc = await db.collection('licenses').doc(id).get();
    return doc.exists ? (doc.data() as FirestoreLicense) : null;
  }

  async getLicenseByKey(key: string): Promise<FirestoreLicense | null> {
    const snapshot = await db.collection('licenses').where('key', '==', key).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as FirestoreLicense;
  }

  async getLicensesByUserId(userId: string): Promise<FirestoreLicense[]> {
    const snapshot = await db.collection('licenses').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => doc.data() as FirestoreLicense);
  }

  async getLicensesBySubscriptionId(subscriptionId: string): Promise<FirestoreLicense[]> {
    const snapshot = await db.collection('licenses').where('subscriptionId', '==', subscriptionId).get();
    return snapshot.docs.map(doc => doc.data() as FirestoreLicense);
  }

  async updateLicense(id: string, updates: Partial<FirestoreLicense>): Promise<void> {
    await db.collection('licenses').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Payment operations
  async createPayment(paymentData: Omit<FirestorePayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestorePayment> {
    const paymentRef = db.collection('payments').doc();
    const now = new Date();
    
    const payment: FirestorePayment = {
      id: paymentRef.id,
      ...paymentData,
      createdAt: now,
      updatedAt: now,
    };

    await paymentRef.set(payment);
    return payment;
  }

  async getPaymentsBySubscriptionId(subscriptionId: string): Promise<FirestorePayment[]> {
    const snapshot = await db.collection('payments').where('subscriptionId', '==', subscriptionId).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => doc.data() as FirestorePayment);
  }

  async getPaymentsPageBySubscriptionId(subscriptionId: string, page: number, limit: number): Promise<{ payments: FirestorePayment[]; total: number }> {
    const all = await this.getPaymentsBySubscriptionId(subscriptionId);
    const total = all.length;
    const start = (page - 1) * limit;
    const payments = all.slice(start, start + limit);
    return { payments, total };
  }

  // Usage analytics operations
  async createUsageAnalytics(data: Omit<FirestoreUsageAnalytics, 'id' | 'timestamp'>): Promise<FirestoreUsageAnalytics> {
    const ref = db.collection('usage_analytics').doc();
    const record: FirestoreUsageAnalytics = {
      id: ref.id,
      ...data,
      timestamp: new Date(),
    };
    await ref.set(record);
    return record;
  }

  async getUsageAnalyticsByLicense(licenseId: string, since?: Date): Promise<FirestoreUsageAnalytics[]> {
    let query = db.collection('usage_analytics').where('licenseId', '==', licenseId) as FirebaseFirestore.Query;
    if (since) {
      query = query.where('timestamp', '>=', since);
    }
    const snapshot = await query.orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(d => d.data() as FirestoreUsageAnalytics);
  }

  async getUsageAnalyticsByUser(userId: string, since?: Date): Promise<FirestoreUsageAnalytics[]> {
    let query = db.collection('usage_analytics').where('userId', '==', userId) as FirebaseFirestore.Query;
    if (since) {
      query = query.where('timestamp', '>=', since);
    }
    const snapshot = await query.orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(d => d.data() as FirestoreUsageAnalytics);
  }

  // SDK versions operations
  async getSDKVersionById(id: string): Promise<FirestoreSDKVersion | null> {
    const doc = await db.collection('sdk_versions').doc(id).get();
    return doc.exists ? (doc.data() as FirestoreSDKVersion) : null;
  }

  async getLatestSDKVersions(platform?: string): Promise<FirestoreSDKVersion[]> {
    let query = db.collection('sdk_versions').where('isLatest', '==', true) as FirebaseFirestore.Query;
    if (platform) {
      query = query.where('platform', '==', platform);
    }
    const snapshot = await query.orderBy('platform', 'asc').get();
    return snapshot.docs.map(d => d.data() as FirestoreSDKVersion);
  }

  // License delivery logs operations
  async createLicenseDeliveryLog(data: Omit<FirestoreLicenseDeliveryLog, 'id' | 'createdAt'>): Promise<FirestoreLicenseDeliveryLog> {
    const ref = db.collection('license_delivery_logs').doc();
    const record: FirestoreLicenseDeliveryLog = {
      id: ref.id,
      ...data,
      createdAt: new Date(),
    };
    await ref.set(record);
    return record;
  }

  async updateLicenseDeliveryLogsForPayment(paymentId: string, updates: Partial<FirestoreLicenseDeliveryLog>): Promise<void> {
    const snapshot = await db.collection('license_delivery_logs').where('paymentId', '==', paymentId).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, updates);
    });
    await batch.commit();
  }

  // Privacy consent operations
  async createPrivacyConsent(consent: Omit<FirestorePrivacyConsent, 'id' | 'consentDate'>): Promise<FirestorePrivacyConsent> {
    const ref = db.collection('privacy_consents').doc();
    const record: FirestorePrivacyConsent = {
      id: ref.id,
      ...consent,
      consentDate: new Date(),
    };
    await ref.set(record);
    return record;
  }

  async getPrivacyConsentsByUser(userId: string): Promise<FirestorePrivacyConsent[]> {
    const snapshot = await db.collection('privacy_consents').where('userId', '==', userId).orderBy('consentDate', 'desc').get();
    return snapshot.docs.map(d => d.data() as FirestorePrivacyConsent);
  }

  // Helper finders for Stripe IDs
  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<FirestoreSubscription | null> {
    const snapshot = await db.collection('subscriptions').where('stripeSubscriptionId', '==', stripeSubscriptionId).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as FirestoreSubscription;
  }

  async getPaymentByStripePaymentIntentId(paymentIntentId: string): Promise<FirestorePayment | null> {
    const snapshot = await db.collection('payments').where('stripePaymentIntentId', '==', paymentIntentId).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as FirestorePayment;
  }

  async getPaymentByStripeInvoiceId(invoiceId: string): Promise<FirestorePayment | null> {
    const snapshot = await db.collection('payments').where('stripeInvoiceId', '==', invoiceId).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as FirestorePayment;
  }

  async getPaymentById(id: string): Promise<FirestorePayment | null> {
    const doc = await db.collection('payments').doc(id).get();
    return doc.exists ? (doc.data() as FirestorePayment) : null;
  }

  async getPaymentsByUserId(userId: string): Promise<FirestorePayment[]> {
    const snapshot = await db.collection('payments').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => doc.data() as FirestorePayment);
  }

  // Admin helpers (broad scans — consider adding indexed filters as needed)
  async getAllPayments(): Promise<FirestorePayment[]> {
    const snapshot = await db.collection('payments').get();
    return snapshot.docs.map(doc => doc.data() as FirestorePayment);
  }

  async updatePayment(id: string, updates: Partial<FirestorePayment>): Promise<void> {
    await db.collection('payments').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Audit and compliance operations
  async createAuditLog(auditData: {
    userId: string;
    action: string;
    description: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const auditRef = db.collection('audit_logs').doc();
    await auditRef.set({
      id: auditRef.id,
      ...auditData,
      timestamp: new Date(),
    });
  }

  async getAllUsers(): Promise<FirestoreUser[]> {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(d => d.data() as FirestoreUser);
  }

  async getAllSubscriptions(): Promise<FirestoreSubscription[]> {
    const snapshot = await db.collection('subscriptions').get();
    return snapshot.docs.map(d => d.data() as FirestoreSubscription);
  }

  async getAllLicenses(): Promise<FirestoreLicense[]> {
    const snapshot = await db.collection('licenses').get();
    return snapshot.docs.map(d => d.data() as FirestoreLicense);
  }

  async getComplianceEvents(filter: { severity?: string; eventType?: string; resolved?: boolean } = {}): Promise<any[]> {
    let query: FirebaseFirestore.Query = db.collection('compliance_events');
    if (filter.severity) query = query.where('severity', '==', filter.severity);
    if (filter.eventType) query = query.where('eventType', '==', filter.eventType);
    if (typeof filter.resolved === 'boolean') query = query.where('resolved', '==', filter.resolved);
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(d => d.data());
  }

  async updateComplianceEvent(id: string, updates: Partial<any>): Promise<void> {
    await db.collection('compliance_events').doc(id).update({ ...updates, updatedAt: new Date() });
  }

  // Email logs
  async getEmailLogBySendgridId(sendgridId: string): Promise<FirestoreEmailLog | null> {
    const snapshot = await db.collection('email_logs').where('sendgridId', '==', sendgridId).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as any) } as FirestoreEmailLog;
  }

  async updateEmailLog(id: string, updates: Partial<FirestoreEmailLog>): Promise<void> {
    await db.collection('email_logs').doc(id).update({ ...updates, updatedAt: new Date() });
  }

  async getAuditLogsByUser(userId: string): Promise<any[]> {
    const snapshot = await db.collection('audit_logs').where('userId', '==', userId).orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(d => d.data());
  }

  async createComplianceEvent(eventData: {
    userId?: string;
    paymentId?: string;
    eventType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    metadata?: any;
  }): Promise<void> {
    const eventRef = db.collection('compliance_events').doc();
    await eventRef.set({
      id: eventRef.id,
      ...eventData,
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Webhook operations
  async createWebhookEvent(eventData: {
    type: string;
    stripeId: string;
    data: any;
  }): Promise<void> {
    const eventRef = db.collection('webhook_events').doc();
    await eventRef.set({
      id: eventRef.id,
      ...eventData,
      processed: false,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getWebhookEventByStripeId(stripeId: string): Promise<{ id: string } | null> {
    const snapshot = await db.collection('webhook_events').where('stripeId', '==', stripeId).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id };
  }

  async countRecentWebhookEvents(sinceMs: number): Promise<number> {
    const sinceDate = new Date(Date.now() - sinceMs);
    const snapshot = await db.collection('webhook_events').where('createdAt', '>=', sinceDate).get();
    return snapshot.size;
  }

  async countFailedWebhookEvents(): Promise<number> {
    const snapshot = await db.collection('webhook_events').where('processed', '==', false).where('retryCount', '>', 0).get();
    return snapshot.size;
  }

  async getFailedWebhookEvents(limit: number = 10): Promise<any[]> {
    const snapshot = await db.collection('webhook_events').where('processed', '==', false).where('retryCount', '<', 3).limit(limit).get();
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }

  async updateWebhookEvent(id: string, updates: Partial<{
    processed: boolean;
    error?: string;
    retryCount: number;
  }>): Promise<void> {
    await db.collection('webhook_events').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Utility methods
  async generateId(): Promise<string> {
    return db.collection('_').doc().id;
  }

  async transaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
    return db.runTransaction(updateFunction);
  }
}

export const firestoreService = new FirestoreService();
