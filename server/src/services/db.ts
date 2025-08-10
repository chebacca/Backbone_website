import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Export a consistent database interface that matches the Prisma schema
export const db = {
  // User operations
  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: true,
        licenses: true,
        payments: true,
      },
    });
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: true,
        licenses: true,
        payments: true,
      },
    });
  },

  async createUser(data: any) {
    return await prisma.user.create({
      data,
    });
  },

  async updateUser(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  // Subscription operations
  async getSubscriptionById(id: string) {
    return await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: true,
        licenses: true,
        payments: true,
      },
    });
  },

  async getSubscriptionsByUserId(userId: string) {
    return await prisma.subscription.findMany({
      where: { userId },
      include: {
        licenses: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createSubscription(data: any) {
    return await prisma.subscription.create({
      data,
      include: {
        user: true,
      },
    });
  },

  async updateSubscription(id: string, data: any) {
    return await prisma.subscription.update({
      where: { id },
      data,
    });
  },

  async deleteSubscription(id: string) {
    return await prisma.subscription.delete({
      where: { id },
    });
  },

  // License operations
  async getLicenseById(id: string) {
    return await prisma.license.findUnique({
      where: { id },
      include: {
        user: true,
        subscription: true,
      },
    });
  },

  async getLicenseByKey(key: string) {
    return await prisma.license.findUnique({
      where: { key },
      include: {
        user: true,
        subscription: true,
      },
    });
  },

  async getLicensesByUserId(userId: string) {
    return await prisma.license.findMany({
      where: { userId },
      include: {
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getLicensesBySubscriptionId(subscriptionId: string) {
    return await prisma.license.findMany({
      where: { subscriptionId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createLicense(data: any) {
    return await prisma.license.create({
      data,
      include: {
        user: true,
        subscription: true,
      },
    });
  },

  async updateLicense(id: string, data: any) {
    return await prisma.license.update({
      where: { id },
      data,
    });
  },

  async deleteLicense(id: string) {
    return await prisma.license.delete({
      where: { id },
    });
  },

  // Payment operations
  async createPayment(data: any) {
    return await prisma.payment.create({
      data,
      include: {
        user: true,
        subscription: true,
      },
    });
  },

  async getPaymentsBySubscriptionId(subscriptionId: string) {
    return await prisma.payment.findMany({
      where: { subscriptionId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getPaymentById(id: string) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        user: true,
        subscription: true,
      },
    });
  },

  async updatePayment(id: string, data: any) {
    return await prisma.payment.update({
      where: { id },
      data,
    });
  },

  // Helper finders for Stripe IDs and users
  async getSubscriptionByStripeId(stripeSubscriptionId: string) {
    return await prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
  },

  async getPaymentByStripePaymentIntentId(stripePaymentIntentId: string) {
    return await prisma.payment.findUnique({ where: { stripePaymentIntentId } });
  },

  async getPaymentByStripeInvoiceId(stripeInvoiceId: string) {
    return await prisma.payment.findUnique({ where: { stripeInvoiceId } });
  },

  async getPaymentsByUserId(userId: string) {
    return await prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  // Analytics operations
  async createUsageAnalytics(data: any) {
    return await prisma.usageAnalytics.create({ data });
  },

  async getUsageAnalyticsByLicense(licenseId: string, since?: Date) {
    const where: any = { licenseId };
    if (since) {
      where.timestamp = { gte: since };
    }
    
    return await prisma.usageAnalytics.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });
  },

  async getUsageAnalyticsByUser(userId: string) {
    return await prisma.usageAnalytics.findMany({
      where: { userId },
      include: {
        license: true,
      },
      orderBy: { timestamp: 'desc' },
    });
  },

  // SDK versions operations
  async getSDKVersionById(id: string) {
    return await prisma.sDKVersion.findUnique({ where: { id } });
  },

  async getLatestSDKVersions(platform?: string) {
    const where: any = { isLatest: true };
    if (platform) where.platform = platform;
    return await prisma.sDKVersion.findMany({ where, orderBy: { platform: 'asc' } });
  },

  // License delivery logs operations
  async createLicenseDeliveryLog(data: any) {
    return await prisma.licenseDeliveryLog.create({ data });
  },

  async updateLicenseDeliveryLogsForPayment(paymentId: string, updates: any) {
    return await prisma.licenseDeliveryLog.updateMany({ where: { paymentId }, data: updates });
  },

  // Privacy consent operations
  async createPrivacyConsent(consent: any) {
    return await prisma.privacyConsent.create({ data: consent });
  },

  async getPrivacyConsentsByUser(userId: string) {
    return await prisma.privacyConsent.findMany({ where: { userId }, orderBy: { consentDate: 'desc' } });
  },

  // Admin operations
  async getAllUsers() {
    return await prisma.user.findMany({
      include: {
        subscriptions: true,
        licenses: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAllSubscriptions() {
    return await prisma.subscription.findMany({
      include: {
        user: true,
        licenses: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAllPayments() {
    return await prisma.payment.findMany({
      include: {
        user: true,
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAllLicenses() {
    return await prisma.license.findMany({
      include: {
        user: true,
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Audit operations
  async createAuditLog(auditData: any) {
    return await prisma.auditLog.create({ data: auditData });
  },

  async getAuditLogsByUser(userId: string) {
    return await prisma.auditLog.findMany({ where: { userId }, orderBy: { timestamp: 'desc' } });
  },

  // Compliance operations
  async getComplianceEvents(filter: any = {}) {
    const where: any = {};
    if (filter.severity) where.severity = filter.severity;
    if (filter.eventType) where.eventType = filter.eventType;
    if (typeof filter.resolved === 'boolean') where.resolved = filter.resolved;
    return await prisma.complianceEvent.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async updateComplianceEvent(id: string, updates: any) {
    // Filter out unknown fields to avoid runtime errors
    const allowed: any = {};
    if (typeof updates.resolved === 'boolean') allowed.resolved = updates.resolved;
    if (updates.metadata !== undefined) allowed.metadata = updates.metadata;
    if (updates.description !== undefined) allowed.description = updates.description;
    if (updates.eventType !== undefined) allowed.eventType = updates.eventType;
    if (updates.severity !== undefined) allowed.severity = updates.severity;
    return await prisma.complianceEvent.update({ where: { id }, data: allowed });
  },

  // Email log helpers
  async getEmailLogBySendgridId(sendgridId: string) {
    return await prisma.emailLog.findUnique({ where: { sendgridId } });
  },

  async updateEmailLog(id: string, updates: any) {
    return await prisma.emailLog.update({ where: { id }, data: updates });
  },

  // Webhook operations
  async createWebhookEvent(eventData: any) {
    return await prisma.webhookEvent.create({ data: eventData });
  },

  async getWebhookEventByStripeId(stripeId: string) {
    return await prisma.webhookEvent.findUnique({ where: { stripeId } });
  },

  async updateWebhookEvent(id: string, updates: any) {
    return await prisma.webhookEvent.update({ where: { id }, data: updates });
  },

  // Health check
  async ping() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  },
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});


