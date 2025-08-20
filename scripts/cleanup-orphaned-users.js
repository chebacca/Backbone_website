#!/usr/bin/env node

/**
 * Cleanup Orphaned Firebase Users Script
 * 
 * This script identifies and optionally removes Firebase Auth users
 * that don't have corresponding Firestore records.
 * 
 * Usage: node cleanup-orphaned-users.js [--dry-run] [--remove-orphans]
 */

import admin from 'firebase-admin';

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const removeOrphans = args.includes('--remove-orphans');

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
 * Get all Firebase Auth users
 */
async function getAllFirebaseUsers() {
  try {
    const firebaseUsers = [];
    
    const listAllUsers = async (nextPageToken) => {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      firebaseUsers.push(...listUsersResult.users);
      
      if (listUsersResult.pageToken) {
        await listAllUsers(listUsersResult.pageToken);
      }
    };
    
    await listAllUsers();
    
    console.log(`📊 Found ${firebaseUsers.length} users in Firebase Auth`);
    return firebaseUsers;
  } catch (error) {
    console.error('❌ Failed to fetch Firebase Auth users:', error.message);
    throw error;
  }
}

/**
 * Get all Firestore users
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
 * Find orphaned Firebase users
 */
function findOrphanedUsers(firebaseUsers, firestoreUsers) {
  const firestoreEmails = new Set(firestoreUsers.map(u => u.email).filter(Boolean));
  const firestoreUids = new Set(firestoreUsers.map(u => u.firebaseUid).filter(Boolean));
  
  const orphanedUsers = firebaseUsers.filter(fbUser => {
    // User is orphaned if:
    // 1. Their email is not in Firestore users collection, AND
    // 2. Their UID is not referenced by any Firestore user
    return fbUser.email && 
           !firestoreEmails.has(fbUser.email) && 
           !firestoreUids.has(fbUser.uid);
  });
  
  return orphanedUsers;
}

/**
 * Main cleanup function
 */
async function runCleanup() {
  console.log('🧹 Starting Orphaned Firebase Users Cleanup');
  console.log(`📋 Mode: ${isDryRun ? 'DRY RUN' : removeOrphans ? 'REMOVE ORPHANS' : 'IDENTIFY ONLY'}`);
  console.log('─'.repeat(50));
  
  try {
    // Initialize Firebase
    const initialized = await initializeFirebase();
    if (!initialized) {
      process.exit(1);
    }
    
    // Get all users from both systems
    const [firebaseUsers, firestoreUsers] = await Promise.all([
      getAllFirebaseUsers(),
      getAllFirestoreUsers()
    ]);
    
    // Find orphaned users
    const orphanedUsers = findOrphanedUsers(firebaseUsers, firestoreUsers);
    
    console.log(`\n🔍 Found ${orphanedUsers.length} orphaned Firebase users:`);
    
    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned Firebase users found!');
      return;
    }
    
    // Display orphaned users
    orphanedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'No email'} (UID: ${user.uid})`);
      console.log(`   Created: ${user.metadata.creationTime}`);
      console.log(`   Last Sign In: ${user.metadata.lastSignInTime || 'Never'}`);
      console.log(`   Verified: ${user.emailVerified}`);
      console.log('');
    });
    
    if (removeOrphans && !isDryRun) {
      console.log('🗑️  Removing orphaned Firebase users...');
      
      let removed = 0;
      let failed = 0;
      
      for (const user of orphanedUsers) {
        try {
          await admin.auth().deleteUser(user.uid);
          console.log(`✅ Removed: ${user.email || user.uid}`);
          removed++;
        } catch (error) {
          console.error(`❌ Failed to remove ${user.email || user.uid}:`, error.message);
          failed++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`\n📊 Cleanup Summary:`);
      console.log(`   Removed: ${removed}`);
      console.log(`   Failed: ${failed}`);
      
    } else if (removeOrphans && isDryRun) {
      console.log('🔍 [DRY RUN] Would remove all orphaned Firebase users listed above.');
      
    } else {
      console.log('ℹ️  To remove these orphaned users, run with --remove-orphans flag.');
      console.log('   To see what would be removed first, add --dry-run flag.');
    }
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Cleanup Orphaned Firebase Users Script

Usage: node cleanup-orphaned-users.js [options]

Options:
  --dry-run              Show what would be removed without making changes
  --remove-orphans       Actually remove orphaned Firebase users
  --help, -h             Show this help message

Examples:
  node cleanup-orphaned-users.js                    # Just identify orphans
  node cleanup-orphaned-users.js --dry-run --remove-orphans  # See what would be removed
  node cleanup-orphaned-users.js --remove-orphans   # Actually remove orphans
`);
  process.exit(0);
}

// Run the cleanup
runCleanup().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
