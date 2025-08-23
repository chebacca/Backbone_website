#!/usr/bin/env tsx

// Check Firebase Auth users
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getAuth } from 'firebase-admin/auth';
import { logger } from '../src/utils/logger.js';

async function main() {
  try {
    // Dynamically import after env is set so Firestore Admin sees env
    await import('../src/services/firestoreService.js');
    const auth = getAuth();
    
    logger.info('🔍 Checking Firebase Auth users...');
    
    const emails = [
      'chebacca@gmail.com',
      'accounting@example.com', 
      'basic.user@example.com',
      'pro.user@example.com',
      'enterprise.user@example.com',
      'demo.user@example.com'
    ];
    
    for (const email of emails) {
      try {
        const userRecord = await auth.getUserByEmail(email);
        logger.info(`✅ ${email}: UID=${userRecord.uid}, DisplayName=${userRecord.displayName}, EmailVerified=${userRecord.emailVerified}`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          logger.error(`❌ ${email}: User not found in Firebase Auth`);
        } else {
          logger.error(`❌ ${email}: Error - ${error.message}`);
        }
      }
    }
    
    logger.info('✅ Firebase Auth user check complete');
  } catch (error) {
    logger.error('❌ Check failed:', error);
    process.exit(1);
  }
}

main();
