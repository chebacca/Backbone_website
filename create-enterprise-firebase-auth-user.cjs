#!/usr/bin/env node

/**
 * 🔑 Create Enterprise Firebase Auth User
 * 
 * Creates the Firebase Auth user for the enterprise account
 * with the correct UID and credentials.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const auth = admin.auth();

// Enterprise User Configuration
const ENTERPRISE_USER = {
  uid: '2ysTqv3pwiXyKxOeExAfEKOIh7K2',
  email: 'enterprise.user@enterprisemedia.com',
  password: 'Enterprise123!',
  displayName: 'Enterprise Admin User',
  emailVerified: true,
  disabled: false
};

async function createEnterpriseAuthUser() {
  console.log('🔑 Creating Enterprise Firebase Auth User');
  console.log('==========================================');
  console.log(`Email: ${ENTERPRISE_USER.email}`);
  console.log(`UID: ${ENTERPRISE_USER.uid}`);
  
  try {
    // Check if user already exists
    try {
      const existingUser = await auth.getUser(ENTERPRISE_USER.uid);
      console.log('⚠️  User already exists with this UID');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   UID: ${existingUser.uid}`);
      console.log(`   Email Verified: ${existingUser.emailVerified}`);
      console.log(`   Disabled: ${existingUser.disabled}`);
      
      // Update the existing user if needed
      if (existingUser.email !== ENTERPRISE_USER.email || !existingUser.emailVerified) {
        console.log('🔄 Updating existing user...');
        await auth.updateUser(ENTERPRISE_USER.uid, {
          email: ENTERPRISE_USER.email,
          displayName: ENTERPRISE_USER.displayName,
          emailVerified: true,
          disabled: false
        });
        console.log('✅ User updated successfully');
      } else {
        console.log('✅ User already configured correctly');
      }
      
      return true;
    } catch (userNotFoundError) {
      // User doesn't exist, create it
      console.log('👤 Creating new Firebase Auth user...');
      
      const userRecord = await auth.createUser({
        uid: ENTERPRISE_USER.uid,
        email: ENTERPRISE_USER.email,
        password: ENTERPRISE_USER.password,
        displayName: ENTERPRISE_USER.displayName,
        emailVerified: true,
        disabled: false
      });
      
      console.log('✅ Firebase Auth user created successfully');
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Display Name: ${userRecord.displayName}`);
      console.log(`   Email Verified: ${userRecord.emailVerified}`);
      
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to create/update Firebase Auth user');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n🔍 Email already exists with different UID. Checking...');
      try {
        const existingUser = await auth.getUserByEmail(ENTERPRISE_USER.email);
        console.log(`   Existing UID: ${existingUser.uid}`);
        console.log(`   Required UID: ${ENTERPRISE_USER.uid}`);
        
        if (existingUser.uid !== ENTERPRISE_USER.uid) {
          console.log('\n⚠️  SOLUTION REQUIRED:');
          console.log('   1. Delete the existing user in Firebase Console');
          console.log('   2. Or update your script to use the existing UID');
          console.log(`   3. Existing UID: ${existingUser.uid}`);
        }
      } catch (lookupError) {
        console.error(`   Lookup error: ${lookupError.message}`);
      }
    }
    
    return false;
  }
}

async function testAuthUser() {
  console.log('\n🧪 Testing Created Auth User');
  console.log('=============================');
  
  try {
    const user = await auth.getUser(ENTERPRISE_USER.uid);
    console.log('✅ User verification successful');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    console.log(`   Disabled: ${user.disabled}`);
    console.log(`   Created: ${user.metadata.creationTime}`);
    console.log(`   Last Sign In: ${user.metadata.lastSignInTime || 'Never'}`);
    
    return true;
  } catch (error) {
    console.error('❌ User verification failed');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 ENTERPRISE FIREBASE AUTH USER SETUP');
  console.log('=======================================\n');
  
  try {
    const created = await createEnterpriseAuthUser();
    
    if (created) {
      await testAuthUser();
      
      console.log('\n🎉 SETUP COMPLETE!');
      console.log('==================');
      console.log('✅ Firebase Auth user is ready');
      console.log('\n🔑 LOGIN CREDENTIALS:');
      console.log(`   📧 Email: ${ENTERPRISE_USER.email}`);
      console.log(`   🔒 Password: ${ENTERPRISE_USER.password}`);
      console.log(`   🆔 UID: ${ENTERPRISE_USER.uid}`);
      console.log('\n🌐 You can now test the frontend with these credentials');
    } else {
      console.log('\n❌ SETUP FAILED');
      console.log('================');
      console.log('Please resolve the issues above and try again');
    }
  } catch (error) {
    console.error('\n💥 Setup crashed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { createEnterpriseAuthUser, testAuthUser };
