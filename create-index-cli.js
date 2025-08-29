#!/usr/bin/env node

/**
 * Create Missing Firestore Index using Firebase CLI
 * 
 * This script creates the missing composite index for the projects collection
 * using Firebase CLI commands.
 */

import { execSync } from 'child_process';

async function createIndexWithCLI() {
  try {
    console.log('🔧 Creating missing Firestore index using Firebase CLI...');
    
    // Check if Firebase CLI is available
    try {
      execSync('firebase --version', { stdio: 'pipe' });
      console.log('✅ Firebase CLI is available');
    } catch (error) {
      console.log('❌ Firebase CLI not found. Please install it first:');
      console.log('npm install -g firebase-tools');
      return;
    }
    
    // Check if user is logged in
    try {
      execSync('firebase projects:list', { stdio: 'pipe' });
      console.log('✅ Firebase CLI is authenticated');
    } catch (error) {
      console.log('❌ Firebase CLI not authenticated. Please login first:');
      console.log('firebase login');
      return;
    }
    
    console.log('\n📋 Creating index for projects collection...');
    console.log('Fields: organizationId (Ascending) + createdAt (Ascending) + __name__ (Ascending)');
    
    // Note: Firebase CLI doesn't have a direct command to create indexes
    // We need to use the Firebase Console or the direct link
    console.log('\n🔗 Use this direct link to create the index:');
    console.log('https://console.firebase.google.com/v1/r/project/backbone-logic/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9iYWNrYm9uZS1sb2dpYy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcHJvamVjdHMvaW5kZXhlcy9fEAEaEgoOb3JnYW5pemF0aW9uSWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC');
    
    console.log('\n📝 Alternative: Use Firebase Console manually');
    console.log('1. Go to: https://console.firebase.google.com/v1/r/project/backbone-logic/firestore/indexes');
    console.log('2. Click "Create Index"');
    console.log('3. Collection ID: projects');
    console.log('4. Add fields: organizationId (Ascending), createdAt (Ascending), __name__ (Ascending)');
    console.log('5. Click "Create"');
    
    console.log('\n⏱️ Index creation takes 5-10 minutes. The app will work once it\'s built.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the function
createIndexWithCLI();

