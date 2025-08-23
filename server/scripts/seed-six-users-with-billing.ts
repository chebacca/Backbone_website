#!/usr/bin/env tsx

// Seed exactly 6 users and, for BASIC/PRO/ENTERPRISE users only, create:
// - 1 subscription (seats=1)
// - 1 active license mapped to the user and subscription
// - 1 payment with invoice metadata
// No organizations, no extra data.

process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';
import { firestoreService as db } from '../src/services/firestoreService.js';
import { PasswordUtil } from '../src/utils/password.js';
import { LicenseKeyUtil } from '../src/utils/licenseKey.js';

type Tier = 'BASIC' | 'PRO' | 'ENTERPRISE';

function pricingFor(tier: Tier) {
  switch (tier) {
    case 'BASIC': return { cents: 2900, desc: 'Basic subscription' };
    case 'PRO': return { cents: 9900, desc: 'Pro subscription' };
    case 'ENTERPRISE': return { cents: 19900, desc: 'Enterprise subscription' };
  }
}

function genInvoiceId(): string {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function genBilling(email: string) {
  const [user] = email.split('@');
  const [first, last = 'User'] = (user || 'seed.user').split('.');
  return {
    firstName: first?.charAt(0).toUpperCase() + first?.slice(1) || 'Seed',
    lastName: last?.charAt(0).toUpperCase() + last?.slice(1) || 'User',
    company: 'Seed Co',
    addressLine1: '100 Seed Street',
    city: 'Austin',
    state: 'TX',
    postalCode: '73301',
    country: 'US',
    validated: true,
    validatedAt: new Date(),
    validationSource: 'seed'
  } as any;
}

async function ensureUser(email: string, name: string, role: 'USER' | 'ADMIN' | 'SUPERADMIN' | 'ACCOUNTING', password: string) {
  const existing = await db.getUserByEmail(email).catch(() => null as any);
  const hashed = await PasswordUtil.hash(password);
  if (existing) {
    await db.updateUser(existing.id, { name, role, isEmailVerified: true, password: hashed } as any);
    return existing.id;
  }
  const created = await db.createUser({
    email,
    name,
    role,
    password: hashed,
    isEmailVerified: true,
    twoFactorEnabled: false,
    twoFactorBackupCodes: [],
    marketingConsent: false,
    dataProcessingConsent: false,
    identityVerified: false,
    kycStatus: 'PENDING' as any,
    privacyConsent: [],
    registrationSource: 'seed'
  } as any);
  return created.id;
}

async function seedTieredUser(userId: string, email: string, tier: Tier) {
  const price = pricingFor(tier);
  const now = new Date();
  const sub = await db.createSubscription({
    userId,
    tier,
    status: 'ACTIVE' as any,
    seats: 1,
    pricePerSeat: price.cents,
    cancelAtPeriodEnd: false,
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  } as any);

  const licenseKey = LicenseKeyUtil.generateLicenseKey();
  await db.createLicense({
    id: undefined as any,
    key: licenseKey,
    userId,
    subscriptionId: sub.id,
    status: 'ACTIVE' as any,
    tier,
    activatedAt: now,
    expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
    activationCount: 0,
    maxActivations: 1,
    features: {}
  } as any);

  const invoiceId = genInvoiceId();
  const billing = genBilling(email);
  await db.createPayment({
    userId,
    subscriptionId: sub.id,
    stripePaymentIntentId: `pi_${sub.id}`,
    stripeInvoiceId: invoiceId,
    amount: price.cents,
    currency: 'usd',
    status: 'SUCCEEDED' as any,
    description: `${price.desc} - 1 seat`,
    receiptUrl: 'https://example.com/receipt',
    billingAddressSnapshot: billing,
    taxAmount: Math.round(price.cents * 0.08),
    taxRate: 0.08,
    taxJurisdiction: 'TX, US',
    paymentMethod: 'credit_card',
    complianceData: { invoiceNumber: invoiceId, subscriptionTier: tier, seats: 1 },
    amlScreeningStatus: 'PASSED' as any,
    amlScreeningDate: now,
    amlRiskScore: 0,
    pciCompliant: true,
    ipAddress: '127.0.0.1',
    userAgent: 'Seeder/1.0',
    processingLocation: 'US'
  } as any);
}

async function main() {
  try {
    logger.info('🌱 Seeding: 6 users with 1 license + 1 subscription + 1 invoice for BASIC/PRO/ENTERPRISE');

    const superadminId = await ensureUser('chebacca@gmail.com', 'System Administrator', 'SUPERADMIN', 'AdminMaster123!');
    const accountingId = await ensureUser('accounting@example.com', 'Accounting User', 'ACCOUNTING', 'ChangeMe123!');
    const basicId = await ensureUser('basic.user@example.com', 'Basic User', 'USER', 'ChangeMe123!');
    const proId = await ensureUser('pro.user@example.com', 'Pro User', 'USER', 'ChangeMe123!');
    const enterpriseId = await ensureUser('enterprise.user@example.com', 'Enterprise User', 'USER', 'Admin1234!');
    const demoId = await ensureUser('demo.user@example.com', 'Demo User', 'USER', 'ChangeMe123!');

    await seedTieredUser(basicId, 'basic.user@example.com', 'BASIC');
    await seedTieredUser(proId, 'pro.user@example.com', 'PRO');
    await seedTieredUser(enterpriseId, 'enterprise.user@example.com', 'ENTERPRISE');

    logger.info('✅ Done. Only users/subscriptions/payments/licenses written.');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();


