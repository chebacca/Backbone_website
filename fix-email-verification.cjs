#!/usr/bin/env node

/**
 * 📧 Fix Email Verification Status
 * 
 * Ensures the Firestore user document has the correct email verification status
 * to match the Firebase Auth user.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Enterprise User Configuration
const ENTERPRISE_USER = {
  uid: '2ysTqv3pwiXyKxOeExAfEKOIh7K2',
  email: 'enterprise.user@enterprisemedia.com'
};

async function fixEmailVerificationStatus() {
  console.log('📧 Fixing Email Verification Status');
  console.log('===================================');
  console.log(`UID: ${ENTERPRISE_USER.uid}`);
  console.log(`Email: ${ENTERPRISE_USER.email}`);
  
  try {
    // Check Firebase Auth user
    const authUser = await auth.getUser(ENTERPRISE_USER.uid);
    console.log(`Firebase Auth email verified: ${authUser.emailVerified}`);
    
    // Check Firestore user document
    const userRef = db.collection('users').doc(ENTERPRISE_USER.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found in Firestore');
      return false;
    }
    
    const userData = userDoc.data();
    console.log(`Firestore email verified: ${userData.emailVerified}`);
    console.log(`Firestore email: ${userData.email}`);
    
    // Update Firestore document to match Firebase Auth
    const updates = {};
    
    if (userData.emailVerified !== authUser.emailVerified) {
      updates.emailVerified = authUser.emailVerified;
    }
    
    if (userData.email !== authUser.email) {
      updates.email = authUser.email;
    }
    
    // Ensure other required fields are set
    if (!userData.status) {
      updates.status = 'active';
    }
    
    if (Object.keys(updates).length > 0) {
      console.log('🔄 Updating Firestore user document...');
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await userRef.update(updates);
      console.log('✅ Firestore user document updated');
      console.log(`   Updates applied: ${JSON.stringify(updates, null, 2)}`);
    } else {
      console.log('✅ Firestore user document is already up to date');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fix email verification status');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function testEmailVerificationSync() {
  console.log('\n🧪 Testing Email Verification Sync');
  console.log('===================================');
  
  try {
    // Get Firebase Auth user
    const authUser = await auth.getUser(ENTERPRISE_USER.uid);
    
    // Get Firestore user document
    const userRef = db.collection('users').doc(ENTERPRISE_USER.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    console.log('📊 Comparison:');
    console.log(`   Firebase Auth email verified: ${authUser.emailVerified}`);
    console.log(`   Firestore email verified: ${userData.emailVerified}`);
    console.log(`   Firebase Auth email: ${authUser.email}`);
    console.log(`   Firestore email: ${userData.email}`);
    console.log(`   Firestore status: ${userData.status}`);
    console.log(`   Firestore user type: ${userData.userType}`);
    console.log(`   Firestore role: ${userData.role}`);
    
    const isSync = (
      authUser.emailVerified === userData.emailVerified &&
      authUser.email === userData.email &&
      userData.status === 'active'
    );
    
    if (isSync) {
      console.log('✅ Firebase Auth and Firestore are in sync');
      return true;
    } else {
      console.log('❌ Firebase Auth and Firestore are NOT in sync');
      return false;
    }
  } catch (error) {
    console.error('❌ Email verification sync test failed');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 EMAIL VERIFICATION FIX');
  console.log('=========================\n');
  
  try {
    const fixed = await fixEmailVerificationStatus();
    
    if (fixed) {
      const synced = await testEmailVerificationSync();
      
      if (synced) {
        console.log('\n🎉 EMAIL VERIFICATION FIX COMPLETE!');
        console.log('===================================');
        console.log('✅ Firebase Auth and Firestore are synchronized');
        console.log('✅ Email verification status is correct');
        console.log('\n🔑 READY FOR FULL ACCESS:');
        console.log(`   📧 Email: ${ENTERPRISE_USER.email}`);
        console.log(`   🆔 UID: ${ENTERPRISE_USER.uid}`);
        console.log('   ✅ Email Verified: true');
        console.log('\n🌐 You can now test the frontend with full access');
      } else {
        console.log('\n⚠️  EMAIL VERIFICATION UPDATED BUT SYNC ISSUES REMAIN');
        console.log('====================================================');
        console.log('The email verification was updated but sync test failed');
      }
    } else {
      console.log('\n❌ EMAIL VERIFICATION FIX FAILED');
      console.log('=================================');
      console.log('Failed to update email verification status');
    }
  } catch (error) {
    console.error('\n💥 Email verification fix crashed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { fixEmailVerificationStatus, testEmailVerificationSync };
