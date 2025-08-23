#!/usr/bin/env tsx

// Check Firestore user documents
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../src/utils/logger.js';

async function main() {
  try {
    // Dynamically import after env is set so Firestore Admin sees env
    await import('../src/services/firestoreService.js');
    const db = getFirestore();
    
    logger.info('🔍 Checking Firestore user documents...');
    
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      logger.error('❌ No users found in Firestore');
      return;
    }
    
    logger.info(`📊 Found ${usersSnapshot.docs.length} users in Firestore`);
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      logger.info(`👤 User: ${userData.email}`);
      logger.info(`   - ID: ${userDoc.id}`);
      logger.info(`   - Name: ${userData.name}`);
      logger.info(`   - Role: ${userData.role}`);
      logger.info(`   - Firebase UID: ${userData.firebaseUid || 'MISSING!'}`);
      logger.info(`   - Email Verified: ${userData.isEmailVerified}`);
      logger.info('   ---');
    }
    
    logger.info('✅ Firestore user check complete');
  } catch (error) {
    logger.error('❌ Check failed:', error);
    process.exit(1);
  }
}

main();
