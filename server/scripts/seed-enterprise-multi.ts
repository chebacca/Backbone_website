#!/usr/bin/env tsx

// Functions-style env
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { firestoreService as db } from '../src/services/firestoreService.js';
import { LicenseService } from '../src/services/licenseService.js';
import { InvoiceService } from '../src/services/invoiceService.js';
import { PasswordUtil } from '../src/utils/password.js';
import { logger } from '../src/utils/logger.js';

async function ensureUser(email: string, passwordPlain: string) {
  let user = await db.getUserByEmail(email);
  if (!user) {
    user = await db.createUser({
      email,
      name: 'Enterprise Admin',
      password: await PasswordUtil.hash(passwordPlain),
      role: 'ADMIN',
      isEmailVerified: true,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      marketingConsent: true,
      dataProcessingConsent: true,
      identityVerified: false,
      kycStatus: 'PENDING',
      privacyConsent: [],
    } as any);
  }
  return user;
}

async function ensureSubscription(userId: string, seats: number) {
  const subs = await db.getSubscriptionsByUserId(userId);
  let sub = subs.find((s: any) => s.tier === 'ENTERPRISE' && s.seats === seats);
  if (!sub) {
    const now = new Date();
    const end = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    sub = await db.createSubscription({
      userId,
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      seats,
      pricePerSeat: 99,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
    } as any);
    logger.info(`Created subscription ${sub.id} with ${seats} seats`);
  }
  return sub;
}

async function ensureLicenses(userId: string, subscriptionId: string, seats: number) {
  const licenses = await db.getLicensesBySubscriptionId(subscriptionId);
  if (licenses.length < seats) {
    const toCreate = seats - licenses.length;
    await LicenseService.generateLicenses(userId, subscriptionId, 'ENTERPRISE', toCreate, 'ACTIVE', 12);
    logger.info(`Generated ${toCreate} licenses for ${subscriptionId}`);
  }
}

async function ensureInvoice(subscriptionId: string) {
  const payments = await db.getPaymentsBySubscriptionId(subscriptionId);
  const exists = payments.some((p: any) => p.stripeInvoiceId);
  if (!exists) {
    const payment = await InvoiceService.createInvoice(subscriptionId);
    if (payment?.stripeInvoiceId) {
      await InvoiceService.updateInvoiceStatus(payment.stripeInvoiceId, 'SUCCEEDED');
      logger.info(`Created and marked SUCCEEDED invoice ${payment.stripeInvoiceId} for ${subscriptionId}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const email = args[0] || 'chrismole@gmail.com';
  const password = args[1] || 'Temp12341!';
  const seatArgs = args.slice(2);
  const seatsList = (seatArgs.length ? seatArgs : ['20','50','100']).map((s) => Number(s));

  logger.info(`Seeding enterprise subscriptions for ${email}: ${seatsList.join(', ')}`);

  const user = await ensureUser(email, password);

  for (const seats of seatsList) {
    const sub = await ensureSubscription(user.id, seats);
    await ensureLicenses(user.id, sub.id, seats);
    await ensureInvoice(sub.id);
  }

  logger.info('✅ Multi-subscription seeding complete.');
}

main().catch((err) => {
  logger.error('❌ Seeding failed', err);
  process.exit(1);
});


