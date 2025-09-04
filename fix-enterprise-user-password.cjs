#!/usr/bin/env node

/**
 * 🔐 Fix Enterprise User Password
 * 
 * Adds the hashed password to the Firestore user document
 * to match the licensing website's authentication expectations.
 */

const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

// Enterprise User Configuration
const ENTERPRISE_USER = {
  uid: '2ysTqv3pwiXyKxOeExAfEKOIh7K2',
  email: 'enterprise.user@enterprisemedia.com',
  password: 'Enterprise123!',
  name: 'Enterprise Admin User'
};

async function hashPassword(plainPassword) {
  const saltRounds = 12;
  return await bcrypt.hash(plainPassword, saltRounds);
}

async function fixEnterpriseUserPassword() {
  console.log('🔐 Fixing Enterprise User Password');
  console.log('==================================');
  console.log(`UID: ${ENTERPRISE_USER.uid}`);
  console.log(`Email: ${ENTERPRISE_USER.email}`);
  
  try {
    // Get current user document
    const userRef = db.collection('users').doc(ENTERPRISE_USER.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    console.log(`Current user data:`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Name: ${userData.name}`);
    console.log(`   Has Password: ${userData.password ? 'Yes' : 'No'}`);
    console.log(`   User Type: ${userData.userType}`);
    console.log(`   Role: ${userData.role}`);
    
    if (userData.password) {
      console.log('✅ User already has a password hash');
      return true;
    }
    
    // Hash the password
    console.log('🔒 Hashing password...');
    const hashedPassword = await hashPassword(ENTERPRISE_USER.password);
    
    // Update user document with hashed password
    console.log('💾 Updating user document...');
    await userRef.update({
      password: hashedPassword,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Password hash added to user document');
    console.log(`   Password hash length: ${hashedPassword.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fix user password');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function testPasswordHash() {
  console.log('\n🧪 Testing Password Hash');
  console.log('=========================');
  
  try {
    // Get updated user document
    const userRef = db.collection('users').doc(ENTERPRISE_USER.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    
    if (!userData.password) {
      console.log('❌ Password hash not found in user document');
      return false;
    }
    
    // Test password verification
    console.log('🔍 Testing password verification...');
    const isValid = await bcrypt.compare(ENTERPRISE_USER.password, userData.password);
    
    if (isValid) {
      console.log('✅ Password hash verification successful');
      console.log(`   Plain password: ${ENTERPRISE_USER.password}`);
      console.log(`   Hash starts with: ${userData.password.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Password hash verification failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Password hash test failed');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 ENTERPRISE USER PASSWORD FIX');
  console.log('================================\n');
  
  try {
    const fixed = await fixEnterpriseUserPassword();
    
    if (fixed) {
      const tested = await testPasswordHash();
      
      if (tested) {
        console.log('\n🎉 PASSWORD FIX COMPLETE!');
        console.log('=========================');
        console.log('✅ Password hash added to Firestore user document');
        console.log('✅ Password verification working correctly');
        console.log('\n🔑 AUTHENTICATION READY:');
        console.log(`   📧 Email: ${ENTERPRISE_USER.email}`);
        console.log(`   🔒 Password: ${ENTERPRISE_USER.password}`);
        console.log(`   🆔 UID: ${ENTERPRISE_USER.uid}`);
        console.log('\n🌐 You can now test the frontend authentication');
      } else {
        console.log('\n⚠️  PASSWORD HASH ADDED BUT VERIFICATION FAILED');
        console.log('===============================================');
        console.log('The password was hashed but verification test failed');
      }
    } else {
      console.log('\n❌ PASSWORD FIX FAILED');
      console.log('======================');
      console.log('Failed to add password hash to user document');
    }
  } catch (error) {
    console.error('\n💥 Password fix crashed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { fixEnterpriseUserPassword, testPasswordHash };
