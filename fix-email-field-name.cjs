#!/usr/bin/env node

/**
 * 🔧 Fix Email Field Name
 * 
 * Updates the Firestore user document to use 'isEmailVerified' 
 * instead of 'emailVerified' to match the server middleware expectations.
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

// Enterprise User Configuration
const ENTERPRISE_USER = {
  uid: '2ysTqv3pwiXyKxOeExAfEKOIh7K2',
  email: 'enterprise.user@enterprisemedia.com'
};

async function fixEmailFieldName() {
  console.log('🔧 Fixing Email Field Name');
  console.log('===========================');
  console.log(`UID: ${ENTERPRISE_USER.uid}`);
  console.log(`Email: ${ENTERPRISE_USER.email}`);
  
  try {
    // Get current user document
    const userRef = db.collection('users').doc(ENTERPRISE_USER.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found in Firestore');
      return false;
    }
    
    const userData = userDoc.data();
    console.log(`Current emailVerified: ${userData.emailVerified}`);
    console.log(`Current isEmailVerified: ${userData.isEmailVerified}`);
    
    // Update the field name
    const updates = {
      isEmailVerified: userData.emailVerified || true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Remove the old field if it exists
    if (userData.emailVerified !== undefined) {
      updates.emailVerified = admin.firestore.FieldValue.delete();
    }
    
    console.log('🔄 Updating Firestore user document...');
    await userRef.update(updates);
    
    console.log('✅ Email field name updated');
    console.log(`   isEmailVerified: ${updates.isEmailVerified}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fix email field name');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function testEmailFieldName() {
  console.log('\n🧪 Testing Email Field Name');
  console.log('============================');
  
  try {
    // Get updated user document
    const userRef = db.collection('users').doc(ENTERPRISE_USER.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    console.log('📊 Current fields:');
    console.log(`   isEmailVerified: ${userData.isEmailVerified}`);
    console.log(`   emailVerified: ${userData.emailVerified}`);
    console.log(`   status: ${userData.status}`);
    console.log(`   userType: ${userData.userType}`);
    console.log(`   role: ${userData.role}`);
    
    if (userData.isEmailVerified === true && userData.emailVerified === undefined) {
      console.log('✅ Email field name is correct');
      return true;
    } else {
      console.log('❌ Email field name needs further adjustment');
      return false;
    }
  } catch (error) {
    console.error('❌ Email field name test failed');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 EMAIL FIELD NAME FIX');
  console.log('========================\n');
  
  try {
    const fixed = await fixEmailFieldName();
    
    if (fixed) {
      const tested = await testEmailFieldName();
      
      if (tested) {
        console.log('\n🎉 EMAIL FIELD NAME FIX COMPLETE!');
        console.log('=================================');
        console.log('✅ Firestore user document updated');
        console.log('✅ Using correct field name: isEmailVerified');
        console.log('\n🔑 READY FOR FULL ACCESS:');
        console.log(`   📧 Email: ${ENTERPRISE_USER.email}`);
        console.log(`   🆔 UID: ${ENTERPRISE_USER.uid}`);
        console.log('   ✅ isEmailVerified: true');
        console.log('\n🌐 You can now test the frontend with full access');
      } else {
        console.log('\n⚠️  EMAIL FIELD UPDATED BUT TEST FAILED');
        console.log('=======================================');
        console.log('The field was updated but verification test failed');
      }
    } else {
      console.log('\n❌ EMAIL FIELD NAME FIX FAILED');
      console.log('==============================');
      console.log('Failed to update email field name');
    }
  } catch (error) {
    console.error('\n💥 Email field name fix crashed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { fixEmailFieldName, testEmailFieldName };
