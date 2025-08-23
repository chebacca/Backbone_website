#!/usr/bin/env node

/**
 * Create Demo User Test Script
 * 
 * This script creates a demo user and tests the complete flow
 * 
 * Usage: node create-demo-user-test.js [--api-url=http://localhost:3003]
 */

import admin from 'firebase-admin';

// Command line arguments
const args = process.argv.slice(2);
const apiUrlArg = args.find(arg => arg.startsWith('--api-url='));
const apiUrl = apiUrlArg ? apiUrlArg.split('=')[1] : 'http://localhost:3003';

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
 * Create a demo user via API
 */
async function createDemoUser(userData) {
  try {
    console.log('🎯 Creating demo user via API:', userData.email);
    
    const response = await fetch(`${apiUrl}/api/demo/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Demo user created successfully via API!');
      console.log('📧 Email:', result.user.email);
      console.log('🆔 User ID:', result.user.id);
      console.log('📅 Demo expires:', result.demoExpiresAt);
      console.log('🎯 Demo tier:', result.user.demoTier);
      return { success: true, user: result.user, demoExpiresAt: result.demoExpiresAt };
    } else {
      console.error('❌ API returned error:', result.error || result.message);
      return { success: false, error: result.error || result.message };
    }
  } catch (error) {
    console.error('❌ Error calling demo registration API:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Create demo user directly (fallback if API is not available)
 */
async function createDemoUserDirect(userData) {
  try {
    console.log('🎯 Creating demo user directly:', userData.email);
    
    const auth = admin.auth();
    const db = admin.firestore();
    
    // Check if user already exists in Firebase Auth
    let existingUser = null;
    try {
      existingUser = await auth.getUserByEmail(userData.email);
      console.log('⚠️ User already exists in Firebase Auth, deleting first...');
      await auth.deleteUser(existingUser.uid);
    } catch (error) {
      // User doesn't exist, which is fine
    }
    
    // Check if user already exists in Firestore
    const usersRef = db.collection('users');
    const existingQuery = await usersRef.where('email', '==', userData.email).get();
    if (!existingQuery.empty) {
      console.log('⚠️ User already exists in Firestore, deleting first...');
      for (const doc of existingQuery.docs) {
        await doc.ref.delete();
      }
    }
    
    // Create Firebase Auth user
    const firebaseUser = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: `${userData.firstName} ${userData.lastName}`,
      emailVerified: true
    });
    
    console.log('✅ Firebase Auth user created:', firebaseUser.uid);
    
    // Calculate demo expiration (7 days from now)
    const now = new Date();
    const demoExpiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Create Firestore user with demo fields
    const firestoreUserData = {
      id: firebaseUser.uid,
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'USER',
      isEmailVerified: true,
      createdAt: now,
      updatedAt: now,
      
      // Demo-specific fields
      isDemoUser: true,
      demoStartedAt: now,
      demoExpiresAt: demoExpiresAt,
      demoStatus: 'ACTIVE',
      demoTier: userData.demoTier || 'BASIC',
      demoFeatureAccess: {
        maxProjects: 3,
        maxCollaborators: 3,
        maxFileSize: 25, // MB
        maxStorageSize: 100, // MB
        canExport: false,
        canShare: false,
        canAccessAdvancedFeatures: false
      },
      demoSessionCount: 1,
      registrationSource: userData.source || 'manual_test'
    };
    
    await usersRef.doc(firebaseUser.uid).set(firestoreUserData);
    
    console.log('✅ Demo user created successfully!');
    console.log('📧 Email:', userData.email);
    console.log('🆔 Firebase UID:', firebaseUser.uid);
    console.log('📅 Demo expires:', demoExpiresAt.toISOString());
    console.log('🎯 Demo tier:', userData.demoTier);
    console.log('📊 Feature access:', JSON.stringify(firestoreUserData.demoFeatureAccess, null, 2));
    
    return {
      success: true,
      firebaseUid: firebaseUser.uid,
      user: firestoreUserData,
      demoExpiresAt
    };
    
  } catch (error) {
    console.error('❌ Error creating demo user directly:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify demo user in Firestore
 */
async function verifyDemoUser(userId) {
  try {
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('\n✅ Demo user verified in Firestore:');
      console.log('🔍 isDemoUser:', userData.isDemoUser);
      console.log('🔍 demoStatus:', userData.demoStatus);
      console.log('🔍 demoExpiresAt:', userData.demoExpiresAt?.toDate?.()?.toISOString() || userData.demoExpiresAt);
      console.log('🔍 maxProjects:', userData.demoFeatureAccess?.maxProjects);
      console.log('🔍 maxCollaborators:', userData.demoFeatureAccess?.maxCollaborators);
      return userData;
    } else {
      console.error('❌ Demo user not found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('❌ Error verifying demo user:', error.message);
    return null;
  }
}

/**
 * Test demo user login via API
 */
async function testDemoUserLogin(email, password) {
  try {
    console.log('\n🔐 Testing demo user login via API...');
    
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Demo user login successful!');
      console.log('🎫 Token received:', result.token ? 'Yes' : 'No');
      console.log('👤 User ID:', result.user?.id);
      return { success: true, token: result.token, user: result.user };
    } else {
      console.error('❌ Login failed:', result.error || result.message);
      return { success: false, error: result.error || result.message };
    }
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main test function
 */
async function runDemoUserTests() {
  console.log('🧪 Starting Demo User Tests...\n');
  
  // Initialize Firebase
  const firebaseInitialized = await initializeFirebase();
  if (!firebaseInitialized) {
    console.error('❌ Cannot proceed without Firebase initialization');
    process.exit(1);
  }
  
  // Test 1: Create demo user
  console.log('=== Test 1: Create Demo User ===');
  const demoUserData = {
    email: 'demo.user@example.com',
    password: 'DemoPass123!',
    firstName: 'Demo',
    lastName: 'User',
    demoTier: 'BASIC',
    source: 'manual_test'
  };
  
  // Try API first, fallback to direct creation
  let demoResult = await createDemoUser(demoUserData);
  
  if (!demoResult.success) {
    console.log('⚠️ API creation failed, trying direct creation...');
    demoResult = await createDemoUserDirect(demoUserData);
  }
  
  if (!demoResult.success) {
    console.error('❌ Demo user creation failed, stopping tests');
    process.exit(1);
  }
  
  // Test 2: Verify demo user in Firestore
  console.log('\n=== Test 2: Verify Demo User in Firestore ===');
  const userId = demoResult.user?.id || demoResult.firebaseUid;
  const userData = await verifyDemoUser(userId);
  
  if (!userData) {
    console.error('❌ Demo user verification failed');
    process.exit(1);
  }
  
  // Test 3: Test demo user login
  console.log('\n=== Test 3: Test Demo User Login ===');
  const loginResult = await testDemoUserLogin(demoUserData.email, demoUserData.password);
  
  if (loginResult.success) {
    console.log('✅ Demo user can log in successfully');
  } else {
    console.error('❌ Demo user login failed:', loginResult.error);
  }
  
  console.log('\n✅ Demo user tests completed!');
  console.log('\n📋 Demo User Details:');
  console.log('📧 Email: demo.user@example.com');
  console.log('🔑 Password: DemoPass123!');
  console.log('⏰ Trial Duration: 7 days');
  console.log('📊 Project Limit: 3 projects');
  console.log('👥 Collaborator Limit: 3 collaborators');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Test login with demo.user@example.com / DemoPass123!');
  console.log('3. Try creating projects (should be limited to 3)');
  console.log('4. Verify collaboration limits (max 3 collaborators)');
  console.log('5. Test project visibility in Cloud Projects page');
}

// Run the tests
runDemoUserTests().catch(console.error);
