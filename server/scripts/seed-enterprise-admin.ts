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
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const email = args[0] || 'chrismole@gmail.com';
  const passwordPlain = args[1] || 'Temp12341!';
  const seats = Number(args[2] || 100);

  logger.info(`Seeding enterprise admin: ${email} with ${seats} seats`);

  // 1) Create or update user
  let user = await db.getUserByEmail(email);
  if (!user) {
    user = await db.createUser({
      email,
      name: 'System Administrator',
      password: await PasswordUtil.hash(passwordPlain),
      role: 'ADMIN', // Enterprise admin mapped to ADMIN
      isEmailVerified: true,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      marketingConsent: true,
      dataProcessingConsent: true,
      identityVerified: false,
      kycStatus: 'PENDING',
      privacyConsent: [],
    } as any);
  } else {
    await db.updateUser(user.id, {
      role: 'ADMIN',
      isEmailVerified: true,
    });
  }

  // 2) Create subscription if none
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
      pricePerSeat: 99,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
    } as any);
    logger.info(`Created subscription ${subscription.id}`);
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
      12
    );
    logger.info(`Generated ${toCreate} licenses (total should be ${seats})`);
  } else {
    logger.info(`Subscription already has ${existingLicenses.length} licenses`);
  }

  // 4) Create a real invoice payment for the subscription, mark it succeeded
  // Avoid duplicate invoice if exists
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

  logger.info('✅ Enterprise admin seeding complete.');
}

main().catch((err) => {
  logger.error('❌ Seeding failed', err);
  process.exit(1);
});


