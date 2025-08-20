#!/usr/bin/env node

/**
 * User Migration Script - Firebase Auth Synchronization
 * 
 * This script migrates existing Firestore users to Firebase Authentication
 * to ensure proper synchronization between both systems.
 * 
 * Usage: node migrate-users-to-firebase-auth.js [--dry-run] [--batch-size=50]
 * 
 * @see mpc-library/authentication/USER_MIGRATION_PATTERNS.md
 */

import admin from 'firebase-admin';
import { UserSynchronizationService } from '../server/src/services/UserSynchronizationService.js';
import { firestoreService } from '../server/src/services/firestoreService.js';
import { logger } from '../server/src/utils/logger.js';

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 50;

// Migration statistics
const stats = {
  total: 0,
  alreadySynced: 0,
  migrated: 0,
  failed: 0,
  errors: []
};

/**
 * Initialize Firebase Admin SDK
 */
async function initializeFirebase() {
  try {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'backbone-logic'
      });
    }
    
    console.log('✅ Firebase Admin SDK initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return false;
  }
}

/**
 * Get all users from Firestore users collection
 */
async function getAllFirestoreUsers() {
  try {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Found ${users.length} users in Firestore`);
    return users;
  } catch (error) {
    console.error('❌ Failed to fetch Firestore users:', error.message);
    throw error;
  }
}

/**
 * Check if user already has Firebase Auth account
 */
async function checkFirebaseAuthUser(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * Migrate a single user to Firebase Auth
 */
async function migrateUser(user) {
  try {
    console.log(`🔄 Processing user: ${user.email}`);
    
    // Check if user already has Firebase UID in Firestore
    if (user.firebaseUid) {
      try {
        await admin.auth().getUser(user.firebaseUid);
        console.log(`✅ User ${user.email} already synchronized`);
        stats.alreadySynced++;
        return { success: true, action: 'already_synced' };
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log(`⚠️  User ${user.email} has firebaseUid but Firebase user not found, re-syncing`);
        } else {
          throw error;
        }
      }
    }
    
    // Check if Firebase Auth user exists
    const existingFirebaseUser = await checkFirebaseAuthUser(user.email);
    
    if (existingFirebaseUser) {
      // Link existing Firebase user to Firestore user
      if (!isDryRun) {
        await firestoreService.updateUser(user.id, {
          firebaseUid: existingFirebaseUser.uid
        });
      }
      
      console.log(`🔗 Linked existing Firebase user to Firestore user: ${user.email}`);
      stats.migrated++;
      return { success: true, action: 'linked', firebaseUid: existingFirebaseUser.uid };
    }
    
    // Create new Firebase Auth user
    if (!isDryRun) {
      const syncResult = await UserSynchronizationService.synchronizeExistingUser(user.id);
      
      if (syncResult.success) {
        console.log(`✅ Created Firebase Auth user for: ${user.email}`);
        stats.migrated++;
        return { success: true, action: 'created', firebaseUid: syncResult.firebaseUid };
      } else {
        console.error(`❌ Failed to sync user ${user.email}:`, syncResult.error);
        stats.failed++;
        stats.errors.push(`${user.email}: ${syncResult.error}`);
        return { success: false, error: syncResult.error };
      }
    } else {
      console.log(`🔍 [DRY RUN] Would create Firebase Auth user for: ${user.email}`);
      return { success: true, action: 'dry_run' };
    }
    
  } catch (error) {
    console.error(`❌ Error migrating user ${user.email}:`, error.message);
    stats.failed++;
    stats.errors.push(`${user.email}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Process users in batches
 */
async function processUsersBatch(users, startIndex, batchSize) {
  const batch = users.slice(startIndex, startIndex + batchSize);
  const promises = batch.map(user => migrateUser(user));
  
  console.log(`\n📦 Processing batch ${Math.floor(startIndex / batchSize) + 1} (${batch.length} users)`);
  
  const results = await Promise.allSettled(promises);
  
  // Log batch results
  results.forEach((result, index) => {
    const user = batch[index];
    if (result.status === 'rejected') {
      console.error(`❌ Batch error for ${user.email}:`, result.reason);
      stats.failed++;
      stats.errors.push(`${user.email}: ${result.reason}`);
    }
  });
  
  // Small delay between batches to avoid rate limiting
  if (startIndex + batchSize < users.length) {
    console.log('⏳ Waiting 2 seconds before next batch...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting Firebase Auth User Migration');
  console.log(`📋 Mode: ${isDryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
  console.log(`📦 Batch size: ${batchSize}`);
  console.log('─'.repeat(50));
  
  try {
    // Initialize Firebase
    const initialized = await initializeFirebase();
    if (!initialized) {
      process.exit(1);
    }
    
    // Get all Firestore users
    const users = await getAllFirestoreUsers();
    stats.total = users.length;
    
    if (users.length === 0) {
      console.log('ℹ️  No users found to migrate');
      return;
    }
    
    // Process users in batches
    for (let i = 0; i < users.length; i += batchSize) {
      await processUsersBatch(users, i, batchSize);
    }
    
    // Print final statistics
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total users processed: ${stats.total}`);
    console.log(`Already synchronized: ${stats.alreadySynced}`);
    console.log(`Successfully migrated: ${stats.migrated}`);
    console.log(`Failed migrations: ${stats.failed}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      stats.errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (isDryRun) {
      console.log('\n🔍 This was a dry run. No changes were made.');
      console.log('   Run without --dry-run to perform actual migration.');
    } else {
      console.log('\n✅ Migration completed!');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Validate email uniqueness across the system
 */
async function validateEmailUniqueness() {
  console.log('🔍 Validating email uniqueness across Firebase Auth and Firestore...');
  
  try {
    const users = await getAllFirestoreUsers();
    const emailCounts = {};
    const duplicates = [];
    
    // Count email occurrences in Firestore
    users.forEach(user => {
      if (emailCounts[user.email]) {
        emailCounts[user.email]++;
        if (emailCounts[user.email] === 2) {
          duplicates.push(user.email);
        }
      } else {
        emailCounts[user.email] = 1;
      }
    });
    
    if (duplicates.length > 0) {
      console.log('❌ DUPLICATE EMAILS FOUND IN FIRESTORE:');
      duplicates.forEach(email => {
        console.log(`   ${email} (appears ${emailCounts[email]} times)`);
      });
      console.log('\n⚠️  Please resolve duplicate emails before running migration.');
      return false;
    }
    
    console.log('✅ No duplicate emails found in Firestore');
    return true;
    
  } catch (error) {
    console.error('❌ Email validation failed:', error.message);
    return false;
  }
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Firebase Auth User Migration Script

Usage: node migrate-users-to-firebase-auth.js [options]

Options:
  --dry-run              Run in dry-run mode (no changes made)
  --batch-size=N         Process N users per batch (default: 50)
  --validate-emails      Only validate email uniqueness
  --help, -h             Show this help message

Examples:
  node migrate-users-to-firebase-auth.js --dry-run
  node migrate-users-to-firebase-auth.js --batch-size=25
  node migrate-users-to-firebase-auth.js --validate-emails
`);
  process.exit(0);
}

if (args.includes('--validate-emails')) {
  initializeFirebase().then(initialized => {
    if (initialized) {
      validateEmailUniqueness().then(isValid => {
        process.exit(isValid ? 0 : 1);
      });
    } else {
      process.exit(1);
    }
  });
} else {
  // Run the migration
  runMigration().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}
