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
  const email = 'chrismole@gmail.com';
  const passwordPlain = 'Temp12345!';
  const name = 'Chris Mole';
  const role = 'ADMIN';
  const seats = 100; // Enterprise-level seats for Enterprise Admin

  logger.info(`Seeding Enterprise ADMIN user: ${name} (${email}) with ${seats} seats`);

  // 1) Create or update user with ADMIN role
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
      identityVerified: true, // Admin test user should be verified
      kycStatus: 'COMPLETED', // Admin test user should have completed KYC
      privacyConsent: ['terms', 'privacy', 'marketing', 'data_processing'],
      registrationSource: 'seed',
      userAgent: 'seed-script',
      ipAddress: '127.0.0.1',
    } as any);
    logger.info(`Created new ADMIN user: ${user.id}`);
  } else {
    // Update existing user to ensure ADMIN role and privileges
    await db.updateUser(user.id, {
      name,
      role,
      isEmailVerified: true,
      identityVerified: true,
      kycStatus: 'COMPLETED',
      privacyConsent: ['terms', 'privacy', 'marketing', 'data_processing'],
    });
    logger.info(`Updated existing user to ADMIN: ${user.id}`);
  }

  // 2) Create enterprise subscription if none exists
  const existingSubs = await db.getSubscriptionsByUserId(user.id);
  let subscription = existingSubs.find((s: any) => s.tier === 'ENTERPRISE');
  if (!subscription) {
    const now = new Date();
    const end = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
    subscription = await db.createSubscription({
      userId: user.id,
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      seats,
      pricePerSeat: 19900, // $199.00 per seat (matches the pricing in the system)
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

  // 2b) Ensure an organization exists and that Chris is the OWNER member (for team licensing)
  let ensuredOrgId: string | null = null;
  try {
    const existingOrgs = await db.getOrganizationsOwnedByUser(user.id).catch(() => [] as any[]);
    if (!existingOrgs || existingOrgs.length === 0) {
      const org = await db.createOrganization({
        name: `${name || email}'s Organization`,
        ownerUserId: user.id,
        tier: 'ENTERPRISE',
      } as any);
      ensuredOrgId = org.id;
      await db.createOrgMember({
        orgId: ensuredOrgId,
        email: email,
        userId: user.id,
        role: 'OWNER',
        status: 'ACTIVE',
        seatReserved: true,
        invitedByUserId: user.id,
        invitedAt: new Date(),
        joinedAt: new Date(),
      } as any);
      logger.info(`Created organization ${ensuredOrgId} and seeded OWNER member for user ${user.id}`);
    } else {
      ensuredOrgId = existingOrgs[0].id;
      logger.info(`Organization already exists for user ${user.id}: ${ensuredOrgId}`);
    }
  } catch (orgErr) {
    logger.warn?.(`Organization seeding step encountered an issue: ${(orgErr as any)?.message || orgErr}`);
  }

  // 2c) Ensure the ENTERPRISE subscription is linked to the organization (required for inviting members)
  try {
    if (ensuredOrgId && subscription && (subscription as any).organizationId !== ensuredOrgId) {
      await db.updateSubscription(subscription.id, { organizationId: ensuredOrgId } as any);
      logger.info(`Linked subscription ${subscription.id} to organization ${ensuredOrgId}`);
      // Refresh local copy
      subscription = { ...subscription, organizationId: ensuredOrgId } as any;
    }
  } catch (linkErr) {
    logger.warn?.(`Subscription-org link step encountered an issue: ${(linkErr as any)?.message || linkErr}`);
  }

  // 3) Generate licenses up to the seat count if needed
  const existingLicenses = await db.getLicensesBySubscriptionId(subscription.id);
  if (existingLicenses.length < seats) {
    const toCreate = seats - existingLicenses.length;
    await LicenseService.generateLicenses(
      user.id,
      subscription.id,
      'ENTERPRISE',
      toCreate,
      'ACTIVE',
      12 // 12 months validity
    );
    logger.info(`Generated ${toCreate} ENTERPRISE licenses (total should be ${seats})`);
  } else {
    logger.info(`Subscription already has ${existingLicenses.length} licenses`);
  }

  // 4) Create a real invoice payment for the subscription, mark it succeeded
  const paymentsForSub = await db.getPaymentsBySubscriptionId(subscription.id);
  const hasInvoice = paymentsForSub.some((p: any) => p.stripeInvoiceId);
  if (!hasInvoice) {
    const payment = await InvoiceService.createInvoice(subscription.id);
    if (payment?.stripeInvoiceId) {
      await InvoiceService.updateInvoiceStatus(payment.stripeInvoiceId, 'SUCCEEDED');
      logger.info(`Created invoice ${payment.stripeInvoiceId} and marked as SUCCEEDED`);
    }
  } else {
    logger.info('Invoice already exists for this subscription — skipping invoice creation');
  }

  // 5) Log the complete user setup
  logger.info('✅ Enterprise ADMIN seeding complete.');
  logger.info(`User ID: ${user.id}`);
  logger.info(`Email: ${email}`);
  logger.info(`Role: ${role}`);
  logger.info(`Subscription: ${subscription.id}`);
  logger.info(`Licenses: ${existingLicenses.length + (seats - existingLicenses.length)}`);
  logger.info(`Password: ${passwordPlain} (please change after first login)`);
}

main().catch((err) => {
  logger.error('❌ Enterprise ADMIN seeding failed', err);
  process.exit(1);
});
