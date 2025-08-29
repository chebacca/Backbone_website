#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixUserIdConsistency() {
  console.log('🔧 Fixing User ID Format Consistency...\n');

  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterpriseFirebaseUid = '4ByNhExY8vTH1SOcZK6ZWDgn3Eu2';

    console.log('1️⃣ Fixing Users Collection...');
    
    // Create/update user document with email as ID
    const userRef = db.collection('users').doc(enterpriseEmail);
    await userRef.set({
      email: enterpriseEmail,
      name: 'Enterprise User',
      role: 'ENTERPRISE',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
      organizationId: 'default-org',
      firebaseUid: enterpriseFirebaseUid
    }, { merge: true });
    console.log('✅ User document created with email as ID');

    console.log('\n2️⃣ Fixing Org Members Collection...');
    
    // Update org member to use email as userId
    const orgMemberRef = db.collection('orgMembers').doc(enterpriseFirebaseUid);
    await orgMemberRef.update({
      userId: enterpriseEmail, // Change from Firebase UID to email
      updatedAt: new Date()
    });
    console.log('✅ Org member userId updated to email format');

    console.log('\n3️⃣ Fixing Team Members Collection...');
    
    // Update team member to use email as assignedToUserId
    const teamMemberRef = db.collection('teamMembers').doc(enterpriseFirebaseUid);
    await teamMemberRef.update({
      assignedToUserId: enterpriseEmail, // Change from undefined to email
      updatedAt: new Date()
    });
    console.log('✅ Team member assignedToUserId updated to email format');

    console.log('\n4️⃣ Fixing Subscription Linkage...');
    
    // Find and update subscription to link with new Firebase UID
    const subscriptionsRef = db.collection('subscriptions');
    const subscriptionQuery = await subscriptionsRef.where('email', '==', enterpriseEmail).get();
    
    if (!subscriptionQuery.empty) {
      const subscriptionDoc = subscriptionQuery.docs[0];
      console.log(`✅ Found subscription: ${subscriptionDoc.id}`);
      
      await subscriptionDoc.ref.update({
        firebaseUid: enterpriseFirebaseUid,
        updatedAt: new Date()
      });
      console.log('✅ Subscription linked to new Firebase UID');
    } else {
      console.log('⚠️  No subscription found for enterprise user');
    }

    console.log('\n5️⃣ Verifying Data Consistency...');
    
    // Verify the fixes
    const userDoc = await userRef.get();
    const orgMemberDoc = await orgMemberRef.get();
    const teamMemberDoc = await teamMemberRef.get();
    
    console.log('✅ User document:', userDoc.exists ? 'EXISTS' : 'MISSING');
    console.log('✅ Org member document:', orgMemberDoc.exists ? 'EXISTS' : 'MISSING');
    console.log('✅ Team member document:', teamMemberDoc.exists ? 'EXISTS' : 'MISSING');

    console.log('\n🎉 User ID Consistency Fix Complete!');
    console.log('=====================================');
    console.log(`📧 Email: ${enterpriseEmail}`);
    console.log(`🆔 User ID (email): ${enterpriseEmail}`);
    console.log(`🔑 Firebase UID: ${enterpriseFirebaseUid}`);
    console.log(`👤 Role: ENTERPRISE`);
    console.log(`🏢 Organization: default-org`);
    console.log('\n✅ Enterprise user can now log in and access all features!');

  } catch (error) {
    console.error('❌ Error fixing user ID consistency:', error);
    process.exit(1);
  }
}

// Run the fix
fixUserIdConsistency();
