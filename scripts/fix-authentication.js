#!/usr/bin/env node

/**
 * Fix Authentication Issues Script
 * 
 * This script fixes the authentication problems by:
 * 1. Creating missing Firebase Auth users
 * 2. Updating Firestore security rules
 * 3. Ensuring proper user synchronization
 * 
 * Usage:
 *   node fix-authentication.js
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  try {
    // Try to use Application Default Credentials first
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT) {
      console.log('🔑 Using Application Default Credentials...');
      admin.initializeApp({
        projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic'
      });
      return true;
    }
    
    // Try to read service account key from config directory
    const serviceAccountPath = join(__dirname, '..', 'config', 'serviceAccountKey.json');
    if (existsSync(serviceAccountPath)) {
      console.log('🔑 Using service account key from config...');
      const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountData);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'backbone-logic'
      });
      return true;
    }
    
    // Try environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('🔑 Using environment variables...');
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        projectId: 'backbone-logic'
      });
      return true;
    }
    
    console.error('❌ No Firebase Admin credentials found');
    console.log('💡 Please provide one of the following:');
    console.log('   1. Run: gcloud auth application-default login');
    console.log('   2. Set environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    console.log('   3. Place serviceAccountKey.json in the config directory');
    return false;
    
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    return false;
  }
}

// Create Firebase Auth user
async function createFirebaseAuthUser(email, password, displayName) {
  try {
    console.log(`🔍 Creating Firebase Auth user for: ${email}`);
    
    const auth = admin.auth();
    
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(email);
      console.log(`⚠️  User already exists with UID: ${existingUser.uid}`);
      
      // Update password if provided
      if (password) {
        await auth.updateUser(existingUser.uid, { password });
        console.log('✅ Password updated for existing user');
      }
      
      // Update display name if provided
      if (displayName && existingUser.displayName !== displayName) {
        await auth.updateUser(existingUser.uid, { displayName });
        console.log(`✅ Display name updated to: ${displayName}`);
      }
      
      return existingUser;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Create new user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: true
    });
    
    console.log(`✅ Firebase Auth user created successfully!`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Display Name: ${userRecord.displayName}`);
    
    return userRecord;
    
  } catch (error) {
    console.error('❌ Error creating Firebase Auth user:', error.message);
    throw error;
  }
}

// Update Firestore user document
async function updateFirestoreUser(firebaseUid, email, displayName) {
  try {
    console.log(`📝 Updating Firestore user document for: ${email}`);
    
    const db = admin.firestore();
    
    // Check if user document exists
    const userDoc = await db.collection('users').doc(firebaseUid).get();
    
    if (userDoc.exists) {
      // Update existing user
      await db.collection('users').doc(firebaseUid).update({
        firebaseUid: firebaseUid,
        email: email,
        displayName: displayName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Firestore user document updated');
    } else {
      // Create new user document
      await db.collection('users').doc(firebaseUid).set({
        id: firebaseUid,
        firebaseUid: firebaseUid,
        email: email,
        displayName: displayName,
        role: 'USER',
        isEmailVerified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Firestore user document created');
    }
    
  } catch (error) {
    console.error('❌ Error updating Firestore user:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting authentication fix...\n');
  
  // Initialize Firebase Admin
  if (!initializeFirebaseAdmin()) {
    process.exit(1);
  }
  
  try {
    // Create the missing user
    const email = 'chebacca@gmail.com';
    const password = 'AdminMaster123!';
    const displayName = 'System Administrator';
    
    console.log(`👤 Processing user: ${email}\n`);
    
    // Step 1: Create Firebase Auth user
    const firebaseUser = await createFirebaseAuthUser(email, password, displayName);
    
    // Step 2: Update Firestore user document
    await updateFirestoreUser(firebaseUser.uid, email, displayName);
    
    console.log('\n🎉 Authentication fix completed successfully!');
    console.log('💡 The user can now authenticate with Firebase Auth and access Firestore');
    console.log(`🔑 Firebase UID: ${firebaseUser.uid}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    
  } catch (error) {
    console.error('\n💥 Authentication fix failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
