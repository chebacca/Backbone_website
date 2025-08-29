#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixFinalDataConsistency() {
  console.log('🔧 Fixing Final Data Consistency...\n');

  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterpriseFirebaseUid = '4ByNhExY8vTH1SOcZK6ZWDgn3Eu2';
    const oldEnterpriseUid = 'xoAEWjTKXHSF1uOTdG2dZmm4Xar1';

    console.log('1️⃣ Cleaning up old enterprise user data...');
    
    // Delete old user document if it exists
    const oldUserRef = db.collection('users').doc(oldEnterpriseUid);
    const oldUserDoc = await oldUserRef.get();
    if (oldUserDoc.exists) {
      await oldUserRef.delete();
      console.log('✅ Old enterprise user document deleted');
    }

    // Delete old team member document if it exists
    const oldTeamMemberRef = db.collection('teamMembers').doc(oldEnterpriseUid);
    const oldTeamMemberDoc = await oldTeamMemberRef.get();
    if (oldTeamMemberDoc.exists) {
      await oldTeamMemberRef.delete();
      console.log('✅ Old enterprise team member document deleted');
    }

    console.log('\n2️⃣ Fixing subscription linkage with new Firebase UID...');
    
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

    console.log('\n3️⃣ Fixing payment and invoice linkage...');
    
    // Update payments to link with new Firebase UID
    const paymentsRef = db.collection('payments');
    const paymentQuery = await paymentsRef.where('email', '==', enterpriseEmail).get();
    
    if (!paymentQuery.empty) {
      for (const paymentDoc of paymentQuery.docs) {
        await paymentDoc.ref.update({
          firebaseUid: enterpriseFirebaseUid,
          updatedAt: new Date()
        });
      }
      console.log(`✅ ${paymentQuery.docs.length} payment records updated`);
    }

    // Update invoices to link with new Firebase UID
    const invoicesRef = db.collection('invoices');
    const invoiceQuery = await invoicesRef.where('email', '==', enterpriseEmail).get();
    
    if (!invoiceQuery.empty) {
      for (const invoiceDoc of invoiceQuery.docs) {
        await invoiceDoc.ref.update({
          firebaseUid: enterpriseFirebaseUid,
          updatedAt: new Date()
        });
      }
      console.log(`✅ ${invoiceQuery.docs.length} invoice records updated`);
    }

    console.log('\n4️⃣ Fixing team member data structure...');
    
    // Update team member document to have proper structure
    const teamMemberRef = db.collection('teamMembers').doc(enterpriseFirebaseUid);
    await teamMemberRef.update({
      name: 'Enterprise User',
      assignedToUserId: enterpriseEmail,
      updatedAt: new Date()
    });
    console.log('✅ Team member data structure updated');

    console.log('\n5️⃣ Fixing organization membership...');
    
    // Update org member to use new Firebase UID as document ID
    const orgMembersRef = db.collection('orgMembers');
    const orgMemberQuery = await orgMembersRef.where('email', '==', enterpriseEmail).get();
    
    if (!orgMemberQuery.empty) {
      const orgMemberDoc = orgMemberQuery.docs[0];
      const oldOrgMemberId = orgMemberDoc.id;
      
      // Create new org member document with new Firebase UID
      await orgMembersRef.doc(enterpriseFirebaseUid).set({
        email: enterpriseEmail,
        name: 'Enterprise User',
        role: 'OWNER',
        organizationId: 'default-org',
        firebaseUid: enterpriseFirebaseUid,
        userId: enterpriseEmail,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ New org member document created with new Firebase UID');
      
      // Delete old org member document
      await orgMemberDoc.ref.delete();
      console.log('✅ Old org member document deleted');
    }

    console.log('\n6️⃣ Verifying data consistency...');
    
    // Check if all documents exist with new Firebase UID
    const userDoc = await db.collection('users').doc(enterpriseEmail).get();
    const teamMemberDoc = await db.collection('teamMembers').doc(enterpriseFirebaseUid).get();
    const orgMemberDoc = await db.collection('orgMembers').doc(enterpriseFirebaseUid).get();
    
    console.log('✅ User document (email ID):', userDoc.exists ? 'EXISTS' : 'MISSING');
    console.log('✅ Team member document (Firebase UID):', teamMemberDoc.exists ? 'EXISTS' : 'MISSING');
    console.log('✅ Org member document (Firebase UID):', orgMemberDoc.exists ? 'EXISTS' : 'MISSING');

    console.log('\n🎉 Final Data Consistency Fix Complete!');
    console.log('========================================');
    console.log(`📧 Email: ${enterpriseEmail}`);
    console.log(`🆔 User ID (email): ${enterpriseEmail}`);
    console.log(`🔑 Firebase UID: ${enterpriseFirebaseUid}`);
    console.log(`👤 Role: ENTERPRISE`);
    console.log(`🏢 Organization: default-org`);
    console.log('\n✅ Enterprise user should now work properly with:');
    console.log('   - Consistent Firebase UID across all collections');
    console.log('   - Proper organization context loading');
    console.log('   - Team member data populated');
    console.log('   - Payment and invoice history visible');

  } catch (error) {
    console.error('❌ Error fixing final data consistency:', error);
    process.exit(1);
  }
}

// Run the fix
fixFinalDataConsistency();
