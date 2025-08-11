#!/usr/bin/env tsx

// Ensure Functions-like env for Firestore Admin initialization
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'cleanup-licenses';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { firestoreService as db } from '../src/services/firestoreService.js';
import { logger } from '../src/utils/logger.js';

async function normalizeUser(userId: string, email: string): Promise<void> {
  const licenses = await db.getLicensesByUserId(userId);
  if (licenses.length === 0) {
    logger.info('No licenses for user, skipping', { userId, email });
    return;
  }

  // Choose ONE license to keep ACTIVE
  // Preference order: ACTIVE and not expired > PENDING and not expired > most recently updated
  const now = new Date();
  const notExpired = (exp: any) => {
    if (!exp) return true;
    try {
      const d = typeof (exp as any).toDate === 'function' ? (exp as any).toDate() : new Date(exp);
      return !Number.isNaN(d.getTime()) && d > now;
    } catch {
      return true;
    }
  };

  const candidates = [...licenses].sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  const keeper =
    candidates.find((l: any) => l.status === 'ACTIVE' && notExpired(l.expiresAt)) ||
    candidates.find((l: any) => l.status === 'PENDING' && notExpired(l.expiresAt)) ||
    candidates[0];

  // Ensure keeper is ACTIVE and future-dated (extend 1 year from now if expired)
  const updates: any = { status: 'ACTIVE' };
  try {
    const expRaw: any = (keeper as any).expiresAt;
    let expDate: Date | null = null;
    if (expRaw) {
      expDate = typeof expRaw.toDate === 'function' ? expRaw.toDate() : new Date(expRaw);
    }
    if (!expDate || Number.isNaN(expDate.getTime()) || expDate <= now) {
      updates.expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
  } catch {}
  await db.updateLicense(keeper.id, updates);

  // Revoke all other licenses for this user
  for (const lic of candidates) {
    if (lic.id === keeper.id) continue;
    if (lic.status !== 'REVOKED') {
      await db.updateLicense(lic.id, { status: 'REVOKED' } as any);
      logger.info('Revoked extra license', { userId, email, licenseId: lic.id });
    }
  }

  logger.info('User normalized to one ACTIVE license', { userId, email, keptLicenseId: keeper.id });
}

async function main() {
  try {
    logger.info('Starting global license normalization (one license per user)...');
    const users = await db.getAllUsers();
    logger.info(`Users found: ${users.length}`);

    for (const user of users) {
      await normalizeUser((user as any).id, (user as any).email);
    }

    logger.info('✅ Completed license normalization for all users');
    process.exit(0);
  } catch (err: any) {
    logger.error('❌ License normalization failed', { error: err?.message });
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();


