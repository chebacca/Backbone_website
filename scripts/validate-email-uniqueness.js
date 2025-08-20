#!/usr/bin/env node

/**
 * Email Uniqueness Validation Script
 * 
 * This script validates email uniqueness across Firebase Auth and Firestore
 * using the deployed API endpoints.
 * 
 * Usage: node validate-email-uniqueness.js [--api-url=http://localhost:3003]
 */

import admin from 'firebase-admin';

// Command line arguments
const args = process.argv.slice(2);
const apiUrlArg = args.find(arg => arg.startsWith('--api-url='));
const apiUrl = apiUrlArg ? apiUrlArg.split('=')[1] : 'http://localhost:3003';

// Statistics
const stats = {
  totalFirestoreUsers: 0,
  totalFirebaseUsers: 0,
  duplicateEmails: 0,
  orphanedFirebaseUsers: 0,
  unsyncedFirestoreUsers: 0,
  duplicateEmailsList: [],
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
    stats.totalFirestoreUsers = users.length;
    return users;
  } catch (error) {
    console.error('❌ Failed to fetch Firestore users:', error.message);
    throw error;
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
    stats.totalFirebaseUsers = firebaseUsers.length;
    return firebaseUsers;
  } catch (error) {
    console.error('❌ Failed to fetch Firebase Auth users:', error.message);
    throw error;
  }
}

/**
 * Validate email uniqueness in Firestore
 */
function validateFirestoreEmailUniqueness(users) {
  const emailCounts = {};
  const duplicates = [];
  
  users.forEach(user => {
    if (!user.email) return;
    
    if (emailCounts[user.email]) {
      emailCounts[user.email]++;
      if (emailCounts[user.email] === 2) {
        duplicates.push(user.email);
      }
    } else {
      emailCounts[user.email] = 1;
    }
  });
  
  stats.duplicateEmails = duplicates.length;
  stats.duplicateEmailsList = duplicates;
  
  return duplicates;
}

/**
 * Find orphaned and unsynced users
 */
function findSyncIssues(firestoreUsers, firebaseUsers) {
  // Create email sets for quick lookup
  const firestoreEmails = new Set(firestoreUsers.map(u => u.email).filter(Boolean));
  const firebaseEmails = new Set(firebaseUsers.map(u => u.email).filter(Boolean));
  
  // Find Firebase users without Firestore records
  const orphanedFirebaseUsers = firebaseUsers.filter(fbUser => 
    fbUser.email && !firestoreEmails.has(fbUser.email)
  );
  
  // Find Firestore users without Firebase UIDs
  const unsyncedFirestoreUsers = firestoreUsers.filter(user => !user.firebaseUid);
  
  stats.orphanedFirebaseUsers = orphanedFirebaseUsers.length;
  stats.unsyncedFirestoreUsers = unsyncedFirestoreUsers.length;
  
  return {
    orphanedFirebaseUsers,
    unsyncedFirestoreUsers
  };
}

/**
 * Test API endpoint availability
 */
async function testApiEndpoint() {
  try {
    const response = await fetch(`${apiUrl}/api/validation/system-email-check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ API endpoint is available');
      const data = await response.json();
      return data;
    } else {
      console.log('⚠️  API endpoint returned error:', response.status);
      return null;
    }
  } catch (error) {
    console.log('⚠️  API endpoint not available:', error.message);
    return null;
  }
}

/**
 * Main validation function
 */
async function runValidation() {
  console.log('🔍 Starting Email Uniqueness Validation');
  console.log(`🌐 API URL: ${apiUrl}`);
  console.log('─'.repeat(50));
  
  try {
    // Initialize Firebase
    const initialized = await initializeFirebase();
    if (!initialized) {
      process.exit(1);
    }
    
    // Test API endpoint first
    console.log('\n📡 Testing API endpoint...');
    const apiResult = await testApiEndpoint();
    
    if (apiResult && apiResult.success) {
      console.log('✅ Using deployed API for validation');
      console.log('\n📊 SYSTEM HEALTH SUMMARY (from API)');
      console.log('='.repeat(50));
      
      const summary = apiResult.data.summary;
      console.log(`Total Firestore users: ${summary.totalFirestoreUsers}`);
      console.log(`Total Firebase users: ${summary.totalFirebaseUsers}`);
      console.log(`Duplicate emails: ${summary.duplicateEmails}`);
      console.log(`Orphaned Firebase users: ${summary.orphanedFirebaseUsers}`);
      console.log(`Unsynced Firestore users: ${summary.unsyncedFirestoreUsers}`);
      console.log(`System healthy: ${summary.systemHealthy ? '✅' : '❌'}`);
      
      if (apiResult.data.issues.duplicateEmails.length > 0) {
        console.log('\n❌ DUPLICATE EMAILS FOUND:');
        apiResult.data.issues.duplicateEmails.forEach(email => {
          console.log(`   ${email}`);
        });
      }
      
      if (apiResult.data.issues.orphanedFirebaseUsers.length > 0) {
        console.log('\n⚠️  ORPHANED FIREBASE USERS:');
        apiResult.data.issues.orphanedFirebaseUsers.forEach(user => {
          console.log(`   ${user.email} (UID: ${user.uid})`);
        });
      }
      
      if (apiResult.data.issues.unsyncedFirestoreUsers.length > 0) {
        console.log('\n⚠️  UNSYNCED FIRESTORE USERS:');
        apiResult.data.issues.unsyncedFirestoreUsers.forEach(user => {
          console.log(`   ${user.email} (ID: ${user.id})`);
        });
      }
      
      return summary.systemHealthy;
    }
    
    // Fallback to direct Firebase validation
    console.log('📊 Using direct Firebase validation...');
    
    // Get all users from both systems
    const [firestoreUsers, firebaseUsers] = await Promise.all([
      getAllFirestoreUsers(),
      getAllFirebaseUsers()
    ]);
    
    // Validate email uniqueness in Firestore
    console.log('\n🔍 Checking for duplicate emails in Firestore...');
    const duplicateEmails = validateFirestoreEmailUniqueness(firestoreUsers);
    
    if (duplicateEmails.length > 0) {
      console.log('❌ DUPLICATE EMAILS FOUND IN FIRESTORE:');
      duplicateEmails.forEach(email => {
        console.log(`   ${email}`);
      });
    } else {
      console.log('✅ No duplicate emails found in Firestore');
    }
    
    // Find synchronization issues
    console.log('\n🔍 Checking for synchronization issues...');
    const { orphanedFirebaseUsers, unsyncedFirestoreUsers } = findSyncIssues(firestoreUsers, firebaseUsers);
    
    if (orphanedFirebaseUsers.length > 0) {
      console.log(`⚠️  Found ${orphanedFirebaseUsers.length} orphaned Firebase users`);
    }
    
    if (unsyncedFirestoreUsers.length > 0) {
      console.log(`⚠️  Found ${unsyncedFirestoreUsers.length} unsynced Firestore users`);
    }
    
    // Print final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Firestore users: ${stats.totalFirestoreUsers}`);
    console.log(`Total Firebase users: ${stats.totalFirebaseUsers}`);
    console.log(`Duplicate emails: ${stats.duplicateEmails}`);
    console.log(`Orphaned Firebase users: ${stats.orphanedFirebaseUsers}`);
    console.log(`Unsynced Firestore users: ${stats.unsyncedFirestoreUsers}`);
    
    const isHealthy = stats.duplicateEmails === 0 && stats.orphanedFirebaseUsers === 0 && stats.unsyncedFirestoreUsers === 0;
    console.log(`System healthy: ${isHealthy ? '✅' : '❌'}`);
    
    if (!isHealthy) {
      console.log('\n⚠️  Issues found that should be resolved before migration:');
      if (stats.duplicateEmails > 0) {
        console.log('   - Duplicate emails in Firestore need to be resolved');
      }
      if (stats.orphanedFirebaseUsers > 0) {
        console.log('   - Orphaned Firebase users should be cleaned up or linked');
      }
      if (stats.unsyncedFirestoreUsers > 0) {
        console.log('   - Unsynced Firestore users need Firebase Auth accounts');
      }
    }
    
    return isHealthy;
    
  } catch (error) {
    console.error('💥 Validation failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Email Uniqueness Validation Script

Usage: node validate-email-uniqueness.js [options]

Options:
  --api-url=URL          API base URL (default: http://localhost:3003)
  --help, -h             Show this help message

Examples:
  node validate-email-uniqueness.js
  node validate-email-uniqueness.js --api-url=https://your-firebase-function-url
`);
  process.exit(0);
}

// Run the validation
runValidation().then(isHealthy => {
  process.exit(isHealthy ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
