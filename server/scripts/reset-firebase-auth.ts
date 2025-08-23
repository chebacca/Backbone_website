#!/usr/bin/env tsx

// Ensure Functions-like env for Firebase Admin when running locally
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getAuth, UserRecord } from 'firebase-admin/auth';
import { logger } from '../src/utils/logger.js';
import { firestoreService } from '../src/services/firestoreService.js';

// Initialize Firebase Admin/Firestore by importing the service (sets up app based on env)
import '../src/services/firestoreService.js';

type SeedAuthUser = { email: string; password: string; displayName: string };

const targetUsers: SeedAuthUser[] = [
  { email: 'chebacca@gmail.com', displayName: 'System Administrator', password: 'AdminMaster123!' },
  { email: 'accounting@example.com', displayName: 'Accounting User', password: 'ChangeMe123!' },
  { email: 'basic.user@example.com', displayName: 'Basic User', password: 'ChangeMe123!' },
  { email: 'pro.user@example.com', displayName: 'Pro User', password: 'ChangeMe123!' },
  { email: 'enterprise.user@example.com', displayName: 'Enterprise User', password: 'Admin1234!' },
  { email: 'demo.user@example.com', displayName: 'Demo User', password: 'ChangeMe123!' },
];

async function deleteAllAuthUsers(): Promise<number> {
  const auth = getAuth();
  let nextPageToken: string | undefined = undefined;
  let totalDeleted = 0;

  logger.info('🧹 Deleting all Firebase Auth users...');

  do {
    const list = await auth.listUsers(1000, nextPageToken);
    const uids = list.users.map((u: UserRecord) => u.uid);
    if (uids.length > 0) {
      const result = await auth.deleteUsers(uids);
      totalDeleted += result.successCount;
      logger.info(`Deleted batch: success=${result.successCount}, failure=${result.failureCount}`);
    }
    nextPageToken = list.pageToken;
  } while (nextPageToken);

  logger.info(`✅ Deleted ${totalDeleted} Firebase Auth users`);
  return totalDeleted;
}

async function createTargetUsersAndLink(): Promise<void> {
  const auth = getAuth();
  logger.info('👥 Creating target Firebase Auth users and linking to Firestore records...');

  for (const u of targetUsers) {
    const record = await auth.createUser({
      email: u.email,
      password: u.password,
      displayName: u.displayName,
      emailVerified: true,
      disabled: false,
    });
    logger.info(`Created: ${u.email} (uid=${record.uid})`);

    // Link Firestore user by email -> set firebaseUid
    try {
      const fsUser = await firestoreService.getUserByEmail(u.email);
      if (fsUser) {
        await firestoreService.updateUser(fsUser.id, { firebaseUid: record.uid } as any);
        logger.info(`Linked Firestore user ${fsUser.id} <- uid ${record.uid}`);
      } else {
        logger.warn(`No Firestore user found for ${u.email} to link firebaseUid`);
      }
    } catch (err) {
      logger.warn(`Failed linking Firestore user for ${u.email}`, err as any);
    }
  }

  logger.info('✅ Target Firebase Auth users created and linked');
}

async function main() {
  try {
    await deleteAllAuthUsers();
    await createTargetUsersAndLink();
    logger.info('✅ Firebase Auth reset complete. You can now sign in with the new credentials.');
  } catch (error) {
    logger.error('❌ Firebase Auth reset failed:', error);
    process.exit(1);
  }
}

main();


