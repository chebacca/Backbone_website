import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (!getApps().length) {
  const isCloudFunctionsEnv = Boolean(
    process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.FIREBASE_CONFIG
  );
  
  // Try to use Application Default Credentials first (gcloud auth application-default login)
  const hasApplicationDefaultCreds = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT);
  
  if (isCloudFunctionsEnv || hasApplicationDefaultCreds) {
    // In Cloud Functions/Run or with Application Default Credentials, use those
    const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';
    initializeApp({ projectId });
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !rawKey) {
      throw new Error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY. Run "gcloud auth application-default login" to use Application Default Credentials.');
    }
    const privateKey = rawKey.replace(/\\n/g, '\n');
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
}

const db = getFirestore();
const auth = getAuth();

// Type definitions for Firestore documents
export interface FirestoreUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'SUPERADMIN' | 'USER' | 'ADMIN' | 'ACCOUNTING';
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
  termsVersionAccepted?: string;
  privacyPolicyAcceptedAt?: Date;
  privacyPolicyVersionAccepted?: string;
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

// Organization and team management (for Pro/Enterprise)
export interface FirestoreOrganization {
  id: string;
  name: string;
  ownerUserId: string;
  domain?: string;
  tier?: 'PRO' | 'ENTERPRISE';
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreOrgMember {
  id: string;
  orgId: string;
  email: string;
  userId?: string;
  role: 'OWNER' | 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER';
  status: 'INVITED' | 'ACTIVE' | 'REMOVED';
  seatReserved: boolean;
  invitedByUserId?: string;
  invitedAt?: Date;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreOrgInvitation {
  id: string;
  orgId: string;
  email: string;
  role: 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER';
  invitedByUserId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
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
  /**
   * Health check that ensures the Firestore Admin SDK can perform a read.
   * Creates a short-lived doc read on a lightweight collection.
   */
  async ping(): Promise<{ ok: boolean; error?: string }> {
    try {
      // Read a non-existent doc to validate read permission and connectivity
      const testRef = db.collection('_health').doc('ping');
      await testRef.get();
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Unknown Firestore error' };
    }
  }
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
    return doc.exists ? ({ id: doc.id, ...doc.data() } as FirestoreUser) : null;
  }

  async getUserByEmail(email: string): Promise<FirestoreUser | null> {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as FirestoreUser;
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

  async getSubscriptionsByOrganizationId(organizationId: string): Promise<FirestoreSubscription[]> {
    const snapshot = await db.collection('subscriptions').where('organizationId', '==', organizationId).get();
    return snapshot.docs.map(doc => doc.data() as FirestoreSubscription);
  }

  async updateSubscription(id: string, updates: Partial<FirestoreSubscription>): Promise<void> {
    await db.collection('subscriptions').doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteSubscription(id: string): Promise<void> {
    await db.collection('subscriptions').doc(id).delete();
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

  async deleteLicense(id: string): Promise<void> {
    await db.collection('licenses').doc(id).delete();
  }

  // Organization operations
  async createOrganization(data: Omit<FirestoreOrganization, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreOrganization> {
    const orgRef = db.collection('organizations').doc();
    const now = new Date();
    const org: FirestoreOrganization = { id: orgRef.id, ...data, createdAt: now, updatedAt: now };
    await orgRef.set(org);
    return org;
  }

  async getOrganizationById(id: string): Promise<FirestoreOrganization | null> {
    const doc = await db.collection('organizations').doc(id).get();
    return doc.exists ? (doc.data() as FirestoreOrganization) : null;
  }

  async getOrganizationsOwnedByUser(userId: string): Promise<FirestoreOrganization[]> {
    const snap = await db.collection('organizations').where('ownerUserId', '==', userId).get();
    return snap.docs.map(d => d.data() as FirestoreOrganization);
  }

  async getOrganizationsForMemberUser(userId: string): Promise<FirestoreOrganization[]> {
    const memberSnap = await db.collection('org_members').where('userId', '==', userId).where('status', '==', 'ACTIVE').get();
    const orgIds = memberSnap.docs.map(d => (d.data() as FirestoreOrgMember).orgId);
    if (orgIds.length === 0) return [];
    const results: FirestoreOrganization[] = [];
    for (const orgId of orgIds) {
      const org = await this.getOrganizationById(orgId);
      if (org) results.push(org);
    }
    return results;
  }

  // Member operations
  async createOrgMember(data: Omit<FirestoreOrgMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreOrgMember> {
    const ref = db.collection('org_members').doc();
    const now = new Date();
    const record: FirestoreOrgMember = { id: ref.id, ...data, createdAt: now, updatedAt: now };
    await ref.set(record);
    return record;
  }

  async updateOrgMember(id: string, updates: Partial<FirestoreOrgMember>): Promise<void> {
    await db.collection('org_members').doc(id).update({ ...updates, updatedAt: new Date() });
  }

  async getOrgMembers(orgId: string): Promise<FirestoreOrgMember[]> {
    const snap = await db.collection('org_members').where('orgId', '==', orgId).get();
    return snap.docs.map(d => d.data() as FirestoreOrgMember);
  }

  async getOrgMemberByEmail(orgId: string, email: string): Promise<FirestoreOrgMember | null> {
    const snap = await db.collection('org_members').where('orgId', '==', orgId).where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data() as FirestoreOrgMember;
  }

  // Invitations
  async createInvitation(data: Omit<FirestoreOrgInvitation, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreOrgInvitation> {
    const ref = db.collection('org_invitations').doc();
    const now = new Date();
    const record: FirestoreOrgInvitation = { id: ref.id, ...data, createdAt: now, updatedAt: now };
    await ref.set(record);
    return record;
  }

  async getInvitationByToken(token: string): Promise<FirestoreOrgInvitation | null> {
    const snap = await db.collection('org_invitations').where('token', '==', token).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data() as FirestoreOrgInvitation;
  }

  async updateInvitation(id: string, updates: Partial<FirestoreOrgInvitation>): Promise<void> {
    await db.collection('org_invitations').doc(id).update({ ...updates, updatedAt: new Date() });
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

  async deletePayment(id: string): Promise<void> {
    await db.collection('payments').doc(id).delete();
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

  // System settings (generic key-value)
  async getSystemSetting<T = any>(key: string): Promise<T | null> {
    const doc = await db.collection('system_settings').doc(key).get();
    return doc.exists ? (doc.data() as T) : null;
  }

  async setSystemSetting<T = any>(key: string, data: T): Promise<void> {
    await db.collection('system_settings').doc(key).set({ ...data, updatedAt: new Date() }, { merge: true });
  }

  // ================================
  // Projects (Cloud) - Firestore-backed
  // ================================
  async userHasActiveLicense(userId: string): Promise<boolean> {
    const now = new Date();
    const snap = await db
      .collection('licenses')
      .where('userId', '==', userId)
      .where('status', 'in', ['ACTIVE', 'PENDING'])
      .get();
    if (snap.empty) return false;
    return snap.docs.some(d => {
      const lic = d.data() as any;
      const exp = lic.expiresAt ? new Date(lic.expiresAt) : null;
      return !exp || exp > now;
    });
  }

  async verifyOrgMembership(userId: string, orgId: string, allowedRoles: string[]): Promise<boolean> {
    const snap = await db
      .collection('org_members')
      .where('orgId', '==', orgId)
      .where('userId', '==', userId)
      .where('status', '==', 'ACTIVE')
      .limit(1)
      .get();
    if (snap.empty) return false;
    const role = String((snap.docs[0].data() as any).role || '').toUpperCase();
    return allowedRoles.map(r => r.toUpperCase()).includes(role);
  }

  async createProject(data: any): Promise<any> {
    const ref = db.collection('projects').doc();
    const now = new Date();
    const payload = {
      id: ref.id,
      name: data.name,
      description: data.description || '',
      type: data.type,
      applicationMode: data.applicationMode || (data.type === 'standalone' ? 'standalone' : 'shared_network'),
      visibility: data.visibility || 'private',
      ownerId: data.ownerId,
      organizationId: data.organizationId || null,
      metadata: data.metadata || {},
      settings: data.settings || {},
      isActive: true,
      isArchived: false,
      archivedAt: null,
      archivedBy: null,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      // storage
      storageBackend: data.storageBackend || 'firestore',
      gcsBucket: data.gcsBucket || null,
      gcsPrefix: data.gcsPrefix || null,
      // standalone
      filePath: data.filePath || null,
      fileSize: data.fileSize || null,
      lastSyncedAt: null,
      offlineMode: !!data.offlineMode,
      autoSave: data.autoSave ?? true,
      backupEnabled: !!data.backupEnabled,
      encryptionEnabled: !!data.encryptionEnabled,
      // network
      allowCollaboration: !!data.allowCollaboration,
      maxCollaborators: data.maxCollaborators ?? 10,
      realTimeEnabled: !!data.realTimeEnabled,
      autoSync: !!data.autoSync,
      syncInterval: data.syncInterval ?? 300,
      conflictResolution: data.conflictResolution || 'manual',
      enableOfflineMode: !!data.enableOfflineMode,
      allowRealTimeEditing: !!data.allowRealTimeEditing,
      enableComments: !!data.enableComments,
      enableChat: !!data.enableChat,
      enablePresenceIndicators: !!data.enablePresenceIndicators,
      enableActivityLog: data.enableActivityLog ?? true,
      allowGuestUsers: !!data.allowGuestUsers,
    };
    await ref.set(payload);
    // Owner participant
    await this.addParticipant(ref.id, {
      userId: data.ownerId,
      role: 'owner',
      isActive: true,
    });
    return payload;
  }

  async listPublicProjects(opts: { type?: string; applicationMode?: string; limit?: number; offset?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<any[]> {
    const { type, applicationMode, limit = 50, offset = 0, sortBy = 'lastAccessedAt', sortOrder = 'desc' } = opts || {} as any;
    let query: FirebaseFirestore.Query = db.collection('projects')
      .where('visibility', '==', 'public')
      .where('isActive', '==', true)
      .where('isArchived', '==', false);
    if (type && type !== 'all') {
      // legacy: 'network' should include 'networked'
      if (type === 'network') {
        // Firestore has no IN on strings across two fields; we store a single type, so treat as equality with either at write-time
        query = query.where('type', 'in', ['network', 'networked']);
      } else {
        query = query.where('type', '==', type);
      }
    }
    if (applicationMode && applicationMode !== 'all') {
      query = query.where('applicationMode', '==', applicationMode);
    }
    // order & limit
    query = query.orderBy(sortBy as any, sortOrder).limit(limit);
    const snap = await query.get();
    return snap.docs.slice(offset).map(d => d.data());
  }

  async listUserProjects(userId: string, q: any): Promise<any[]> {
    const { query, type, applicationMode, visibility, organizationId, isArchived, limit = 50, sortBy = 'lastAccessedAt', sortOrder = 'desc' } = q || {};

    // Owner projects
    let baseQuery: FirebaseFirestore.Query = db.collection('projects')
      .where('isActive', '==', true);
    if (typeof isArchived !== 'undefined') {
      baseQuery = baseQuery.where('isArchived', '==', String(isArchived) === 'true');
    }
    // Firestore requires an equality filter before orderBy; ensure sortBy is indexed with the filters
    // We'll fetch multiple slices: owner, participant, and role-based public fallbacks, then merge unique

    const results: Map<string, any> = new Map();

    // Owner
    let ownerQuery = baseQuery.where('ownerId', '==', userId);
    ownerQuery = this.applyProjectFilters(ownerQuery, { type, applicationMode, visibility, organizationId });
    ownerQuery = ownerQuery.orderBy(sortBy as any, sortOrder).limit(Number(limit));
    const ownerSnap = await ownerQuery.get();
    ownerSnap.forEach(d => results.set(d.id, d.data()));

    // Participant
    const partSnap = await db.collection('project_participants').where('userId', '==', userId).where('isActive', '==', true).get();
    const projectIds = partSnap.docs.map(d => (d.data() as any).projectId);
    if (projectIds.length) {
      const chunks: string[][] = [];
      for (let i = 0; i < projectIds.length; i += 10) chunks.push(projectIds.slice(i, i + 10));
      for (const chunk of chunks) {
        let pQuery: FirebaseFirestore.Query = db.collection('projects').where('id', 'in', chunk);
        pQuery = this.applyProjectFilters(pQuery, { type, applicationMode, visibility, organizationId });
        const pSnap = await pQuery.get();
        pSnap.forEach(d => results.set(d.id, d.data()));
      }
    }

    // Role-based: show public network projects as a fallback
    let publicQuery: FirebaseFirestore.Query = db.collection('projects')
      .where('visibility', '==', 'public')
      .where('isActive', '==', true)
      .where('isArchived', '==', false);
    publicQuery = this.applyProjectFilters(publicQuery, { type: type || 'network', applicationMode, organizationId });
    publicQuery = publicQuery.orderBy(sortBy as any, sortOrder).limit(Number(limit));
    const publicSnap = await publicQuery.get();
    publicSnap.forEach(d => results.set(d.id, d.data()));

    // Text search (client-side contains)
    let items = Array.from(results.values());
    if (query) {
      const qstr = String(query).toLowerCase();
      items = items.filter((p: any) => String(p.name || '').toLowerCase().includes(qstr) || String(p.description || '').toLowerCase().includes(qstr));
    }
    // Sort client-side to reflect orderBy
    items.sort((a: any, b: any) => {
      const av = a[sortBy] || a.updatedAt;
      const bv = b[sortBy] || b.updatedAt;
      const an = typeof av === 'string' ? Date.parse(av) : (av?.toMillis?.() ? av.toMillis() : +new Date(av));
      const bn = typeof bv === 'string' ? Date.parse(bv) : (bv?.toMillis?.() ? bv.toMillis() : +new Date(bv));
      return sortOrder === 'asc' ? an - bn : bn - an;
    });
    return items.slice(0, Number(limit));
  }

  private applyProjectFilters(query: FirebaseFirestore.Query, f: { type?: string; applicationMode?: string; visibility?: string; organizationId?: string }): FirebaseFirestore.Query {
    const { type, applicationMode, visibility, organizationId } = f || {};
    let q = query;
    if (type && type !== 'all') {
      if (type === 'network') {
        q = q.where('type', 'in', ['network', 'networked']);
      } else {
        q = q.where('type', '==', type);
      }
    }
    if (applicationMode && applicationMode !== 'all') {
      q = q.where('applicationMode', '==', applicationMode);
    }
    if (visibility && visibility !== 'all') {
      q = q.where('visibility', '==', visibility);
    }
    if (organizationId) {
      q = q.where('organizationId', '==', organizationId);
    }
    return q;
  }

  async getParticipantsForProjects(projectIds: string[]): Promise<Map<string, any[]>> {
    const result = new Map<string, any[]>();
    const chunks: string[][] = [];
    for (let i = 0; i < projectIds.length; i += 10) chunks.push(projectIds.slice(i, i + 10));
    for (const chunk of chunks) {
      const snap = await db.collection('project_participants').where('projectId', 'in', chunk).get();
      snap.forEach(d => {
        const x = d.data() as any;
        const list = result.get(x.projectId) || [];
        list.push(x);
        result.set(x.projectId, list);
      });
    }
    return result;
  }

  async listParticipants(projectId: string): Promise<any[]> {
    const snap = await db.collection('project_participants').where('projectId', '==', projectId).get();
    return snap.docs.map(d => d.data());
  }

  async getProjectByIdAuthorized(projectId: string, userId: string): Promise<any | null> {
    const doc = await db.collection('projects').doc(projectId).get();
    if (!doc.exists) return null;
    const p = doc.data() as any;
    if (p.ownerId === userId) return p;
    // participant check
    const snap = await db.collection('project_participants').where('projectId', '==', projectId).where('userId', '==', userId).limit(1).get();
    if (!snap.empty) return p;
    // public visibility (networked only)
    if (p.visibility === 'public' && p.isActive && !p.isArchived) return p;
    return null;
  }

  async updateProjectAuthorized(projectId: string, userId: string, updates: any): Promise<any> {
    const existing = await this.getProjectByIdAuthorized(projectId, userId);
    if (!existing) {
      const err: any = new Error('Project not found or access denied');
      err.code = 'NOT_FOUND';
      throw err;
    }
    // Only owner or admin participant can update
    let isAdmin = existing.ownerId === userId;
    if (!isAdmin) {
      const snap = await db.collection('project_participants').where('projectId', '==', projectId).where('userId', '==', userId).limit(1).get();
      if (!snap.empty) {
        const role = (snap.docs[0].data() as any).role;
        isAdmin = ['admin', 'owner'].includes(String(role).toLowerCase());
      }
    }
    if (!isAdmin) {
      const err: any = new Error('Insufficient permissions');
      err.code = 'FORBIDDEN';
      throw err;
    }
    const payload = { ...updates, updatedAt: new Date() };
    await db.collection('projects').doc(projectId).update(payload);
    const after = await db.collection('projects').doc(projectId).get();
    return after.data();
  }

  async deleteProjectAuthorized(projectId: string, userId: string, permanent: boolean): Promise<void> {
    const existing = await this.getProjectByIdAuthorized(projectId, userId);
    if (!existing) {
      const err: any = new Error('Project not found or access denied');
      err.code = 'NOT_FOUND';
      throw err;
    }
    // Only owner or admin participant can delete
    let isAdmin = existing.ownerId === userId;
    if (!isAdmin) {
      const snap = await db.collection('project_participants').where('projectId', '==', projectId).where('userId', '==', userId).limit(1).get();
      if (!snap.empty) {
        const role = (snap.docs[0].data() as any).role;
        isAdmin = ['admin', 'owner'].includes(String(role).toLowerCase());
      }
    }
    if (!isAdmin) {
      const err: any = new Error('Insufficient permissions');
      err.code = 'FORBIDDEN';
      throw err;
    }
    if (permanent) {
      // Delete participants then project
      const partSnap = await db.collection('project_participants').where('projectId', '==', projectId).get();
      const batch = db.batch();
      partSnap.docs.forEach(d => batch.delete(d.ref));
      batch.delete(db.collection('projects').doc(projectId));
      await batch.commit();
    } else {
      await db.collection('projects').doc(projectId).update({ isArchived: true, archivedAt: new Date(), archivedBy: userId });
    }
  }

  async addParticipant(projectId: string, data: { userId: string; role?: string; isActive?: boolean }): Promise<any> {
    const user = await this.getUserById(data.userId);
    const ref = db.collection('project_participants').doc();
    const now = new Date();
    const record = {
      id: ref.id,
      projectId,
      userId: data.userId,
      userEmail: user?.email || '',
      userName: user?.name || '',
      role: data.role || 'viewer',
      permissions: [],
      joinedAt: now.toISOString(),
      lastActiveAt: now.toISOString(),
      isActive: data.isActive !== false
    };
    await ref.set(record);
    return record;
  }

  async inviteParticipantsByEmail(projectId: string, emails: string[], role: string): Promise<void> {
    for (const email of emails) {
      const user = await this.getUserByEmail(email);
      if (user) {
        await this.addParticipant(projectId, { userId: user.id, role, isActive: true });
      }
    }
  }

  async addParticipantAuthorized(projectId: string, actingUserId: string, input: { userEmail: string; role: string }): Promise<any> {
    // Only owner/admin can add
    const project = await this.getProjectByIdAuthorized(projectId, actingUserId);
    if (!project) {
      const err: any = new Error('Project not found or access denied');
      err.code = 'NOT_FOUND';
      throw err;
    }
    let isAdmin = project.ownerId === actingUserId;
    if (!isAdmin) {
      const snap = await db.collection('project_participants').where('projectId', '==', projectId).where('userId', '==', actingUserId).limit(1).get();
      if (!snap.empty) {
        const role = (snap.docs[0].data() as any).role;
        isAdmin = ['admin', 'owner'].includes(String(role).toLowerCase());
      }
    }
    if (!isAdmin) {
      const err: any = new Error('Insufficient permissions');
      err.code = 'FORBIDDEN';
      throw err;
    }
    const user = await this.getUserByEmail(input.userEmail);
    if (!user) throw new Error('User not found');
    return this.addParticipant(projectId, { userId: user.id, role: input.role, isActive: true });
  }

  async removeParticipantAuthorized(projectId: string, actingUserId: string, participantId: string): Promise<void> {
    // Only owner/admin can remove
    const project = await this.getProjectByIdAuthorized(projectId, actingUserId);
    if (!project) {
      const err: any = new Error('Project not found or access denied');
      err.code = 'NOT_FOUND';
      throw err;
    }
    let isAdmin = project.ownerId === actingUserId;
    if (!isAdmin) {
      const snap = await db.collection('project_participants').where('projectId', '==', projectId).where('userId', '==', actingUserId).limit(1).get();
      if (!snap.empty) {
        const role = (snap.docs[0].data() as any).role;
        isAdmin = ['admin', 'owner'].includes(String(role).toLowerCase());
      }
    }
    if (!isAdmin) {
      const err: any = new Error('Insufficient permissions');
      err.code = 'FORBIDDEN';
      throw err;
    }
    const snap = await db.collection('project_participants').where('id', '==', participantId).limit(1).get();
    if (snap.empty) return;
    await db.collection('project_participants').doc(snap.docs[0].id).delete();
  }
}

export const firestoreService = new FirestoreService();
