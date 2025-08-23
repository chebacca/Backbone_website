#!/usr/bin/env node

/**
 * Create Firebase Auth User Script
 * 
 * This script creates Firebase Authentication users for existing team members
 * who need access to Firestore in web-only mode.
 * 
 * Usage:
 *   node create-firebase-auth-user.js <email> <password> [displayName]
 * 
 * Example:
 *   node create-firebase-auth-user.js user@example.com password123 "John Doe"
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = join(__dirname, '..', 'config', 'serviceAccountKey.json');
let serviceAccount;

try {
  const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountData);
} catch (error) {
  console.error('❌ Error reading service account key:', error.message);
  console.log('💡 Make sure you have a valid serviceAccountKey.json file in the config directory');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'backbone-logic'
});

const auth = admin.auth();

async function createFirebaseAuthUser(email, password, displayName = null) {
  try {
    console.log(`🔍 Creating Firebase Auth user for: ${email}`);
    
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
    
    if (error.code === 'auth/email-already-exists') {
      console.log('💡 User with this email already exists in Firebase Auth');
    } else if (error.code === 'auth/invalid-password') {
      console.log('💡 Password must be at least 6 characters long');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Invalid email format');
    }
    
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Usage: node create-firebase-auth-user.js <email> <password> [displayName]');
    console.log('');
    console.log('Examples:');
    console.log('  node create-firebase-auth-user.js user@example.com password123');
    console.log('  node create-firebase-auth-user.js user@example.com password123 "John Doe"');
    process.exit(1);
  }
  
  const [email, password, displayName] = args;
  
  try {
    await createFirebaseAuthUser(email, password, displayName);
    console.log('');
    console.log('🎉 Firebase Auth user creation completed successfully!');
    console.log('💡 The user can now authenticate with Firebase Auth and access Firestore');
    
  } catch (error) {
    console.error('');
    console.error('💥 Failed to create Firebase Auth user');
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
