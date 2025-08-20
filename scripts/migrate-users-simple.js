#!/usr/bin/env node

/**
 * Simple User Migration Script
 * 
 * This script migrates existing Firestore users to Firebase Authentication
 * using direct Firebase Admin SDK calls.
 * 
 * Usage: node migrate-users-simple.js [--dry-run] [--batch-size=10]
 */

import admin from 'firebase-admin';
import crypto from 'crypto';

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 10;

// Migration statistics
const stats = {
  total: 0,
  alreadySynced: 0,
  migrated: 0,
  linked: 0,
  failed: 0,
  errors: []
};

/**
 * Initialize Firebase Admin SDK
 */
async function initializeFirebase() {
  try {
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
 * Generate a secure temporary password
 */
function generateSecurePassword() {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
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
 * Check if Firebase Auth user exists by email
 */
async function getFirebaseUserByEmail(email) {
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
    const existingFirebaseUser = await getFirebaseUserByEmail(user.email);
    
    if (existingFirebaseUser) {
      // Link existing Firebase user to Firestore user
      if (!isDryRun) {
        const db = admin.firestore();
        await db.collection('users').doc(user.id).update({
          firebaseUid: existingFirebaseUser.uid,
          updatedAt: new Date()
        });
      }
      
      console.log(`🔗 ${isDryRun ? '[DRY RUN] Would link' : 'Linked'} existing Firebase user: ${user.email}`);
      if (!isDryRun) stats.linked++;
      return { success: true, action: 'linked', firebaseUid: existingFirebaseUser.uid };
    }
    
    // Create new Firebase Auth user
    if (!isDryRun) {
      const tempPassword = generateSecurePassword();
      
      const firebaseUserRecord = await admin.auth().createUser({
        email: user.email,
        password: tempPassword,
        displayName: user.name || user.email.split('@')[0],
        emailVerified: user.isEmailVerified || false,
        disabled: false,
      });
      
      // Update Firestore user with Firebase UID
      const db = admin.firestore();
      await db.collection('users').doc(user.id).update({
        firebaseUid: firebaseUserRecord.uid,
        updatedAt: new Date()
      });
      
      console.log(`✅ Created Firebase Auth user for: ${user.email}`);
      stats.migrated++;
      return { 
        success: true, 
        action: 'created', 
        firebaseUid: firebaseUserRecord.uid,
        tempPassword: tempPassword
      };
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
  
  console.log(`\n📦 Processing batch ${Math.floor(startIndex / batchSize) + 1} (${batch.length} users)`);
  
  for (const user of batch) {
    await migrateUser(user);
    
    // Small delay between users to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Delay between batches
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
    console.log(`Successfully linked: ${stats.linked}`);
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
      console.log('   Run the validation script again to verify results.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Firebase Auth User Migration Script

Usage: node migrate-users-simple.js [options]

Options:
  --dry-run              Run in dry-run mode (no changes made)
  --batch-size=N         Process N users per batch (default: 10)
  --help, -h             Show this help message

Examples:
  node migrate-users-simple.js --dry-run
  node migrate-users-simple.js --batch-size=5
  node migrate-users-simple.js
`);
  process.exit(0);
}

// Run the migration
runMigration().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
