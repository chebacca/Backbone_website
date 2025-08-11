import { firestoreService } from './firestoreService.js';

// Firestore-backed DB facade matching prior Prisma interface
export const db = {
  // User operations
  async getUserById(id: string) {
    return await firestoreService.getUserById(id);
  },

  async getUserByEmail(email: string) {
    return await firestoreService.getUserByEmail(email);
  },

  async createUser(data: any) {
    return await firestoreService.createUser(data);
  },

  async updateUser(id: string, data: any) {
    await firestoreService.updateUser(id, data);
    return await firestoreService.getUserById(id);
  },

  // Subscription operations
  async getSubscriptionById(id: string) {
    return await firestoreService.getSubscriptionById(id);
  },

  async getSubscriptionsByUserId(userId: string) {
    return await firestoreService.getSubscriptionsByUserId(userId);
  },

  async createSubscription(data: any) {
    return await firestoreService.createSubscription(data);
  },

  async updateSubscription(id: string, data: any) {
    await firestoreService.updateSubscription(id, data);
    return await firestoreService.getSubscriptionById(id);
  },

  async deleteSubscription(id: string) {
    return await firestoreService.deleteSubscription(id);
  },

  // License operations
  async getLicenseById(id: string) {
    return await firestoreService.getLicenseById(id);
  },

  async getLicenseByKey(key: string) {
    return await firestoreService.getLicenseByKey(key);
  },

  async getLicensesByUserId(userId: string) {
    return await firestoreService.getLicensesByUserId(userId);
  },

  async getLicensesBySubscriptionId(subscriptionId: string) {
    return await firestoreService.getLicensesBySubscriptionId(subscriptionId);
  },

  async createLicense(data: any) {
    return await firestoreService.createLicense(data);
  },

  async updateLicense(id: string, data: any) {
    await firestoreService.updateLicense(id, data);
    return await firestoreService.getLicenseById(id);
  },

  async deleteLicense(id: string) {
    return await firestoreService.deleteLicense(id);
  },

  // Payment operations
  async createPayment(data: any) {
    return await firestoreService.createPayment(data);
  },

  async getPaymentsBySubscriptionId(subscriptionId: string) {
    return await firestoreService.getPaymentsBySubscriptionId(subscriptionId);
  },

  async getPaymentById(id: string) {
    return await firestoreService.getPaymentById(id);
  },

  async updatePayment(id: string, data: any) {
    return await firestoreService.updatePayment(id, data);
  },

  // Helper finders for Stripe IDs and users
  async getSubscriptionByStripeId(stripeSubscriptionId: string) {
    return await firestoreService.getSubscriptionByStripeId(stripeSubscriptionId);
  },

  async getPaymentByStripePaymentIntentId(stripePaymentIntentId: string) {
    return await firestoreService.getPaymentByStripePaymentIntentId(stripePaymentIntentId);
  },

  async getPaymentByStripeInvoiceId(stripeInvoiceId: string) {
    return await firestoreService.getPaymentByStripeInvoiceId(stripeInvoiceId);
  },

  async getPaymentsByUserId(userId: string) {
    return await firestoreService.getPaymentsByUserId(userId);
  },

  // Analytics operations
  async createUsageAnalytics(data: any) {
    return await firestoreService.createUsageAnalytics(data);
  },

  async getUsageAnalyticsByLicense(licenseId: string, since?: Date) {
    return await firestoreService.getUsageAnalyticsByLicense(licenseId, since);
  },

  async getUsageAnalyticsByUser(userId: string) {
    return await firestoreService.getUsageAnalyticsByUser(userId);
  },

  // SDK versions operations
  async getSDKVersionById(id: string) {
    return await firestoreService.getSDKVersionById(id);
  },

  async getLatestSDKVersions(platform?: string) {
    return await firestoreService.getLatestSDKVersions(platform);
  },

  // License delivery logs operations
  async createLicenseDeliveryLog(data: any) {
    return await firestoreService.createLicenseDeliveryLog(data);
  },

  async updateLicenseDeliveryLogsForPayment(paymentId: string, updates: any) {
    return await firestoreService.updateLicenseDeliveryLogsForPayment(paymentId, updates);
  },

  // Privacy consent operations
  async createPrivacyConsent(consent: any) {
    return await firestoreService.createPrivacyConsent(consent);
  },

  async getPrivacyConsentsByUser(userId: string) {
    return await firestoreService.getPrivacyConsentsByUser(userId);
  },

  // Admin operations
  async getAllUsers() {
    return await firestoreService.getAllUsers();
  },

  async getAllSubscriptions() {
    return await firestoreService.getAllSubscriptions();
  },

  async getAllPayments() {
    return await firestoreService.getAllPayments();
  },

  async getAllLicenses() {
    return await firestoreService.getAllLicenses();
  },

  // Audit operations
  async createAuditLog(auditData: any) {
    return await firestoreService.createAuditLog(auditData);
  },

  async getAuditLogsByUser(userId: string) {
    return await firestoreService.getAuditLogsByUser(userId);
  },

  // Compliance operations
  async getComplianceEvents(filter: any = {}) {
    return await firestoreService.getComplianceEvents(filter);
  },

  async updateComplianceEvent(id: string, updates: any) {
    return await firestoreService.updateComplianceEvent(id, updates);
  },

  // Email log helpers
  async getEmailLogBySendgridId(sendgridId: string) {
    return await firestoreService.getEmailLogBySendgridId(sendgridId);
  },

  async updateEmailLog(id: string, updates: any) {
    return await firestoreService.updateEmailLog(id, updates);
  },

  // Webhook operations
  async createWebhookEvent(eventData: any) {
    return await firestoreService.createWebhookEvent(eventData);
  },

  async getWebhookEventByStripeId(stripeId: string) {
    return await firestoreService.getWebhookEventByStripeId(stripeId);
  },

  async updateWebhookEvent(id: string, updates: any) {
    return await firestoreService.updateWebhookEvent(id, updates);
  },

  // Health check
  async ping() {
    return await firestoreService.ping();
  },

  // Organization operations
  async createOrganization(data: any) {
    return await firestoreService.createOrganization(data);
  },

  async getOrganizationsOwnedByUser(userId: string) {
    return await firestoreService.getOrganizationsOwnedByUser(userId);
  },

  async createOrgMember(data: any) {
    return await firestoreService.createOrgMember(data);
  },
};

