#!/usr/bin/env tsx

// Minimal seed: create only the 6 core users in Firestore, nothing else
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';
import { PasswordUtil } from '../src/utils/password.js';
import { firestoreService as db } from '../src/services/firestoreService.js';

async function ensureUser(email: string, name: string, role: 'USER' | 'ADMIN' | 'SUPERADMIN' | 'ACCOUNTING', customPassword?: string): Promise<string> {
  const existing = await db.getUserByEmail(email).catch(() => null as any);
  const hashed = await PasswordUtil.hash(customPassword || 'ChangeMe123!');
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

async function main() {
  try {
    logger.info('🌱 Seeding users only (6 accounts) ...');

    await ensureUser('chebacca@gmail.com', 'System Administrator', 'SUPERADMIN', 'AdminMaster123!');
    await ensureUser('accounting@example.com', 'Accounting User', 'ACCOUNTING', 'ChangeMe123!');
    await ensureUser('basic.user@example.com', 'Basic User', 'USER', 'ChangeMe123!');
    await ensureUser('pro.user@example.com', 'Pro User', 'USER', 'ChangeMe123!');
    await ensureUser('enterprise.user@example.com', 'Enterprise User', 'USER', 'Admin1234!');
    await ensureUser('demo.user@example.com', 'Demo User', 'USER', 'ChangeMe123!');

    logger.info('✅ Users seeded. No subscriptions/licenses/payments/orgs were created.');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to seed users:', error);
    process.exit(1);
  }
}

main();


