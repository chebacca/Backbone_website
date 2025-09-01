#!/usr/bin/env node

/**
 * 🔧 Fix Enterprise User Custom Claims
 * 
 * This script fixes the Firebase Auth custom claims for enterprise.user@example.com
 * to ensure proper access to Firestore collections.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function fixEnterpriseUserClaims() {
  console.log('🔧 Fixing Enterprise User Custom Claims...\n');

  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    
    console.log('1️⃣ Looking up enterprise user in Firebase Auth...');
    
    // Get the user from Firebase Auth
    let enterpriseUser;
    try {
      enterpriseUser = await auth.getUserByEmail(enterpriseEmail);
      console.log('✅ Found enterprise user in Firebase Auth');
      console.log(`   UID: ${enterpriseUser.uid}`);
      console.log(`   Email: ${enterpriseUser.email}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ Enterprise user not found in Firebase Auth');
        console.log('🔧 Creating new enterprise user...');
        
        // Create new user
        enterpriseUser = await auth.createUser({
          email: enterpriseEmail,
          password: 'Enterprise123!',
          displayName: 'Enterprise User',
          emailVerified: true
        });
        console.log('✅ Enterprise user created in Firebase Auth');
        console.log(`   UID: ${enterpriseUser.uid}`);
      } else {
        throw error;
      }
    }

    console.log('\n2️⃣ Looking up user in Firestore users collection...');
    
    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(enterpriseUser.uid).get();
    let organizationId = 'enterprise-org-001'; // Default organization ID
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ Found user in Firestore users collection');
      console.log(`   Organization ID: ${userData.organizationId}`);
      
      if (userData.organizationId) {
        organizationId = userData.organizationId;
      }
    } else {
      console.log('⚠️ User not found in Firestore users collection');
      console.log('🔧 Creating user document...');
      
      // Create user document
      await db.collection('users').doc(enterpriseUser.uid).set({
        email: enterpriseEmail,
        name: 'Enterprise User',
        role: 'ENTERPRISE_USER',
        organizationId: organizationId,
        firebaseUid: enterpriseUser.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Created user document in Firestore');
    }

    console.log('\n3️⃣ Setting Firebase Auth custom claims...');
    
    // Set comprehensive custom claims
    const customClaims = {
      role: 'ENTERPRISE_USER',
      teamMemberRole: 'admin',
      organizationId: organizationId,
      isAdmin: true,
      isEnterprise: true,
      email: enterpriseEmail
    };
    
    await auth.setCustomUserClaims(enterpriseUser.uid, customClaims);
    console.log('✅ Custom claims set successfully');
    console.log('   Claims:', JSON.stringify(customClaims, null, 2));

    console.log('\n4️⃣ Verifying custom claims...');
    
    // Verify the claims were set
    const updatedUser = await auth.getUser(enterpriseUser.uid);
    console.log('✅ Verified custom claims:');
    console.log('   Claims:', JSON.stringify(updatedUser.customClaims, null, 2));

    console.log('\n5️⃣ Checking organization document...');
    
    // Ensure organization document exists
    const orgDoc = await db.collection('organizations').doc(organizationId).get();
    if (!orgDoc.exists) {
      console.log('⚠️ Organization document not found, creating...');
      
      await db.collection('organizations').doc(organizationId).set({
        id: organizationId,
        name: 'Enterprise Organization',
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        ownerId: enterpriseUser.uid,
        ownerEmail: enterpriseEmail,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Created organization document');
    } else {
      console.log('✅ Organization document exists');
    }

    console.log('\n🎉 Enterprise User Fix Complete!');
    console.log(`📧 Email: ${enterpriseEmail}`);
    console.log(`🆔 UID: ${enterpriseUser.uid}`);
    console.log(`🏢 Organization: ${organizationId}`);
    console.log('\n👉 User should now have proper access to all Firestore collections');
    
  } catch (error) {
    console.error('❌ Error fixing enterprise user:', error);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixEnterpriseUserClaims()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixEnterpriseUserClaims };
