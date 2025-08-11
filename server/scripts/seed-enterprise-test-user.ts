#!/usr/bin/env tsx

// Ensure Functions env shape
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { firestoreService as db } from '../src/services/firestoreService.js';
import { LicenseService } from '../src/services/licenseService.js';
import { InvoiceService } from '../src/services/invoiceService.js';
import { PasswordUtil } from '../src/utils/password.js';
import { logger } from '../src/utils/logger.js';

async function main() {
  const email = process.argv[2] || 'enterprise.test+invite@example.com';
  const passwordPlain = process.argv[3] || 'User123!';
  const name = 'Enterprise Test User';
  const role = 'ADMIN';
  const seats = 25;

  logger.info(`Seeding Enterprise TEST user: ${name} (${email}) with ${seats} seats`);

  // 1) Create or update user
  let user = await db.getUserByEmail(email);
  if (!user) {
    user = await db.createUser({
      email,
      name,
      password: await PasswordUtil.hash(passwordPlain),
      role,
      isEmailVerified: true,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      marketingConsent: true,
      dataProcessingConsent: true,
      identityVerified: true,
      kycStatus: 'COMPLETED',
      privacyConsent: ['terms', 'privacy', 'marketing', 'data_processing'],
      registrationSource: 'seed',
      userAgent: 'seed-script',
      ipAddress: '127.0.0.1',
    } as any);
    logger.info(`Created new ADMIN user: ${user.id}`);
  } else {
    await db.updateUser(user.id, {
      name,
      role,
      isEmailVerified: true,
      identityVerified: true,
      kycStatus: 'COMPLETED',
      twoFactorEnabled: false,
      privacyConsent: ['terms', 'privacy', 'marketing', 'data_processing'],
    });
    logger.info(`Updated existing user to ADMIN (2FA disabled): ${user.id}`);
  }

  // 2) Create or ensure ENTERPRISE subscription
  const existingSubs = await db.getSubscriptionsByUserId(user.id);
  let subscription = existingSubs.find((s: any) => s.tier === 'ENTERPRISE');
  if (!subscription) {
    const now = new Date();
    const end = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    subscription = await db.createSubscription({
      userId: user.id,
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      seats,
      pricePerSeat: 19900,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      billingCycle: 'ANNUAL',
      termDays: 365,
    } as any);
    logger.info(`Created ENTERPRISE subscription: ${subscription.id}`);
  } else {
    logger.info(`Subscription already exists: ${subscription.id}`);
  }

  // 3) Ensure org exists and link subscription
  const existingOrgs = await db.getOrganizationsOwnedByUser(user.id).catch(() => [] as any[]);
  let orgId: string;
  if (!existingOrgs || existingOrgs.length === 0) {
    const org = await db.createOrganization({
      name: `${name}'s Organization`,
      ownerUserId: user.id,
      tier: 'ENTERPRISE',
    } as any);
    orgId = org.id;
    await db.createOrgMember({
      orgId,
      email: email,
      userId: user.id,
      role: 'OWNER',
      status: 'ACTIVE',
      seatReserved: true,
      invitedByUserId: user.id,
      invitedAt: new Date(),
      joinedAt: new Date(),
    } as any);
    logger.info(`Created organization ${orgId} and seeded OWNER member for user ${user.id}`);
  } else {
    orgId = existingOrgs[0].id;
    logger.info(`Organization already exists for user ${user.id}: ${orgId}`);
  }

  if ((subscription as any).organizationId !== orgId) {
    await db.updateSubscription(subscription.id, { organizationId: orgId } as any);
    subscription = { ...subscription, organizationId: orgId } as any;
    logger.info(`Linked subscription ${subscription.id} to organization ${orgId}`);
  }

  // 4) Ensure licenses
  const existingLicenses = await db.getLicensesBySubscriptionId(subscription.id);
  if (existingLicenses.length < seats) {
    await LicenseService.generateLicenses(user.id, subscription.id, 'ENTERPRISE', seats - existingLicenses.length, 'ACTIVE', 12);
    logger.info(`Generated ${(seats - existingLicenses.length)} ENTERPRISE licenses`);
  }

  // 5) Ensure invoice
  const paymentsForSub = await db.getPaymentsBySubscriptionId(subscription.id);
  const hasInvoice = paymentsForSub.some((p: any) => p.stripeInvoiceId);
  if (!hasInvoice) {
    const payment = await InvoiceService.createInvoice(subscription.id);
    if (payment?.stripeInvoiceId) {
      await InvoiceService.updateInvoiceStatus(payment.stripeInvoiceId, 'SUCCEEDED');
      logger.info(`Created invoice ${payment.stripeInvoiceId} and marked as SUCCEEDED`);
    }
  }

  logger.info('✅ Enterprise TEST user seeding complete.');
  logger.info(`User ID: ${user.id}`);
  logger.info(`Email: ${email}`);
  logger.info(`Role: ${role}`);
  logger.info(`Organization: ${subscription.organizationId}`);
  logger.info(`Subscription: ${subscription.id}`);
  logger.info(`Licenses: ${Math.max(seats, existingLicenses.length)}`);
  logger.info(`Password: ${passwordPlain}`);
}

main().catch((err) => {
  logger.error('❌ Enterprise TEST seeding failed', err);
  process.exit(1);
});


