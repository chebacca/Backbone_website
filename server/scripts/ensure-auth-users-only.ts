#!/usr/bin/env tsx

// Initialize Firebase Admin using ADC or service-account envs directly, without importing Firestore service
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function initAdmin() {
  if (getApps().length) return;
  const isADC = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT);
  if (isADC) {
    initializeApp({ projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic' });
    return;
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error('Missing FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY or ADC. Provide envs or run gcloud auth application-default login.');
  }
  const privateKey = rawKey.replace(/\\n/g, '\n');
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

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
    console.log(`Updated Firebase Auth user: ${u.email}`);
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      const created = await auth.createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
        emailVerified: true,
        disabled: false,
      });
      console.log(`Created Firebase Auth user: ${u.email} (uid=${created.uid})`);
    } else {
      console.error(`Failed ensuring Firebase Auth user ${u.email}:`, err);
      throw err;
    }
  }
}

async function main() {
  try {
    initAdmin();
    for (const u of users) {
      await ensureAuthUser(u);
    }
    console.log('✅ Firebase Auth users ensured.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to ensure Firebase Auth users:', error);
    process.exit(1);
  }
}

main();


