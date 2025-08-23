#!/usr/bin/env tsx

// Ensure Functions-like env for Firebase Admin when running locally
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getAuth } from 'firebase-admin/auth';
import { logger } from '../src/utils/logger.js';

// Initialize Firebase Admin/Firestore by importing the service (sets up app based on env)
import '../src/services/firestoreService.js';

type SeedAuthUser = { email: string; password: string; displayName: string };

const users: SeedAuthUser[] = [
  { email: 'chebacca@gmail.com', displayName: 'System Administrator', password: 'AdminMaster123!' },
  { email: 'accounting@example.com', displayName: 'Accounting User', password: 'ChangeMe123!' },
  { email: 'basic.user@example.com', displayName: 'Basic User', password: 'ChangeMe123!' },
  { email: 'pro.user@example.com', displayName: 'Pro User', password: 'ChangeMe123!' },
  { email: 'enterprise.user@example.com', displayName: 'Enterprise User', password: 'Admin1234!' },
  { email: 'demo.user@example.com', displayName: 'Demo User', password: 'ChangeMe123!' },
];

async function ensureAuthUser(u: SeedAuthUser) {
  const auth = getAuth();
  try {
    const existing = await auth.getUserByEmail(u.email);
    await auth.updateUser(existing.uid, {
      password: u.password,
      displayName: u.displayName,
      emailVerified: true,
      disabled: false,
    });
    logger.info(`Updated Firebase Auth user: ${u.email}`);
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      const created = await auth.createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
        emailVerified: true,
        disabled: false,
      });
      logger.info(`Created Firebase Auth user: ${u.email} (uid=${created.uid})`);
    } else {
      logger.error(`Failed ensuring Firebase Auth user ${u.email}:`, err);
      throw err;
    }
  }
}

async function main() {
  try {
    logger.info('🔐 Ensuring Firebase Auth users exist for seeded accounts...');
    for (const u of users) {
      await ensureAuthUser(u);
    }
    logger.info('✅ Firebase Auth users ensured. You can now sign in with email/password.');
  } catch (error) {
    logger.error('❌ Failed to ensure Firebase Auth users:', error);
    process.exit(1);
  }
}

main();


