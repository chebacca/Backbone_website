#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const auth = admin.auth();
const db = admin.firestore();
const storage = admin.storage();

async function fixEnterpriseUserLogin() {
  console.log('🔧 Fixing Enterprise User Login Issue...\n');

  try {
    // Enterprise user details
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterprisePassword = 'Enterprise123!';
    const enterpriseName = 'Enterprise User';

    console.log('1️⃣ Checking if enterprise user exists in Firebase Auth...');
    
    // Check if user exists in Firebase Auth
    let enterpriseUser;
    try {
      enterpriseUser = await auth.getUserByEmail(enterpriseEmail);
      console.log('✅ Enterprise user exists in Firebase Auth');
      console.log(`   UID: ${enterpriseUser.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ Enterprise user not found in Firebase Auth');
        console.log('🔧 Creating new enterprise user...');
        
        // Create new user
        enterpriseUser = await auth.createUser({
          email: enterpriseEmail,
          password: enterprisePassword,
          displayName: enterpriseName,
          emailVerified: true
        });
        console.log('✅ Enterprise user created in Firebase Auth');
        console.log(`   UID: ${enterpriseUser.uid}`);
      } else {
        throw error;
      }
    }

    console.log('\n2️⃣ Setting up Firebase custom claims...');
    
    // Set custom claims for enterprise user
    await auth.setCustomUserClaims(enterpriseUser.uid, {
      role: 'ENTERPRISE',
      teamMemberRole: 'ENTERPRISE',
      isAdmin: false,
      isEnterprise: true,
      organizationId: 'default-org'
    });
    console.log('✅ Custom claims set for enterprise user');

    console.log('\n3️⃣ Creating/updating user document in Firestore...');
    
    // Create or update user document
    const userRef = db.collection('users').doc(enterpriseUser.uid);
    await userRef.set({
      email: enterpriseEmail,
      name: enterpriseName,
      role: 'ENTERPRISE',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
      organizationId: 'default-org',
      firebaseUid: enterpriseUser.uid
    }, { merge: true });
    console.log('✅ User document created/updated in Firestore');

    console.log('\n4️⃣ Creating/updating team member document...');
    
    // Create or update team member document
    const teamMemberRef = db.collection('teamMembers').doc(enterpriseUser.uid);
    await teamMemberRef.set({
      email: enterpriseEmail,
      name: enterpriseName,
      role: 'ENTERPRISE',
      status: 'ACTIVE',
      organizationId: 'default-org',
      firebaseUid: enterpriseUser.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }, { merge: true });
    console.log('✅ Team member document created/updated');

    console.log('\n5️⃣ Creating/updating organization membership...');
    
    // Create or update organization membership
    const orgMemberRef = db.collection('orgMembers').doc(enterpriseUser.uid);
    await orgMemberRef.set({
      email: enterpriseEmail,
      name: enterpriseName,
      role: 'OWNER',
      organizationId: 'default-org',
      firebaseUid: enterpriseUser.uid,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    console.log('✅ Organization membership created/updated');

    console.log('\n6️⃣ Verifying subscription linkage...');
    
    // Check if subscription exists and link it to the user
    const subscriptionsRef = db.collection('subscriptions');
    const subscriptionQuery = await subscriptionsRef.where('email', '==', enterpriseEmail).get();
    
    if (!subscriptionQuery.empty) {
      const subscriptionDoc = subscriptionQuery.docs[0];
      console.log(`✅ Found existing subscription: ${subscriptionDoc.id}`);
      
      // Update subscription with Firebase UID
      await subscriptionDoc.ref.update({
        firebaseUid: enterpriseUser.uid,
        updatedAt: new Date()
      });
      console.log('✅ Subscription linked to enterprise user');
    } else {
      console.log('⚠️  No subscription found for enterprise user');
    }

    console.log('\n🎉 Enterprise User Login Fix Complete!');
    console.log('=====================================');
    console.log(`📧 Email: ${enterpriseEmail}`);
    console.log(`🔑 Password: ${enterprisePassword}`);
    console.log(`🆔 Firebase UID: ${enterpriseUser.uid}`);
    console.log(`👤 Role: ENTERPRISE`);
    console.log(`🏢 Organization: default-org`);
    console.log('\n✅ Enterprise user can now log in to the dashboard!');

  } catch (error) {
    console.error('❌ Error fixing enterprise user login:', error);
    process.exit(1);
  }
}

// Run the fix
fixEnterpriseUserLogin();
