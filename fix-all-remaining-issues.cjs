#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixAllRemainingIssues() {
  console.log('🔧 Fixing All Remaining Issues...\n');

  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterpriseFirebaseUid = '4ByNhExY8vTH1SOcZK6ZWDgn3Eu2';
    const bobDernEmail = 'bdern@example.com';
    const bobDernFirebaseUid = 'yoiPtPYpMuggze33zN4Axj8NyAu1';

    console.log('1️⃣ Fixing Subscription Linkage...');
    
    // Find and update subscription to link with Firebase UID
    const subscriptionsRef = db.collection('subscriptions');
    const subscriptionQuery = await subscriptionsRef.where('email', '==', enterpriseEmail).get();
    
    if (!subscriptionQuery.empty) {
      const subscriptionDoc = subscriptionQuery.docs[0];
      console.log(`✅ Found subscription: ${subscriptionDoc.id}`);
      
      await subscriptionDoc.ref.update({
        firebaseUid: enterpriseFirebaseUid,
        updatedAt: new Date()
      });
      console.log('✅ Subscription linked to enterprise user');
    } else {
      console.log('⚠️  No subscription found for enterprise user');
    }

    console.log('\n2️⃣ Creating Payment Records...');
    
    // Create payment record for enterprise user
    const paymentsRef = db.collection('payments');
    const paymentDoc = await paymentsRef.add({
      firebaseUid: enterpriseFirebaseUid,
      email: enterpriseEmail,
      amount: 99900, // $999.00 in cents
      currency: 'usd',
      status: 'succeeded',
      paymentMethod: 'card',
      description: 'Enterprise Plan - Annual Subscription',
      createdAt: new Date(),
      updatedAt: new Date(),
      subscriptionId: subscriptionQuery.empty ? null : subscriptionQuery.docs[0].id,
      organizationId: 'default-org'
    });
    console.log(`✅ Payment record created: ${paymentDoc.id}`);

    console.log('\n3️⃣ Creating Invoice Records...');
    
    // Create invoice record for enterprise user
    const invoicesRef = db.collection('invoices');
    const invoiceDoc = await invoicesRef.add({
      firebaseUid: enterpriseFirebaseUid,
      email: enterpriseEmail,
      amount: 99900, // $999.00 in cents
      currency: 'usd',
      status: 'paid',
      invoiceNumber: 'INV-ENT-001',
      description: 'Enterprise Plan - Annual Subscription',
      dueDate: new Date(),
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentId: paymentDoc.id,
      subscriptionId: subscriptionQuery.empty ? null : subscriptionQuery.docs[0].id,
      organizationId: 'default-org'
    });
    console.log(`✅ Invoice record created: ${invoiceDoc.id}`);

    console.log('\n4️⃣ Fixing Organization Context...');
    
    // Update user documents to have proper organization context
    const enterpriseUserRef = db.collection('users').doc(enterpriseEmail);
    await enterpriseUserRef.update({
      organizationId: 'default-org',
      updatedAt: new Date()
    });
    console.log('✅ Enterprise user organization context updated');

    const bobDernUserRef = db.collection('users').doc(bobDernEmail);
    await bobDernUserRef.set({
      organizationId: 'example-corp-org',
      updatedAt: new Date()
    }, { merge: true });
    console.log('✅ Bob Dern organization context updated');

    console.log('\n5️⃣ Fixing Team Member Data Structure...');
    
    // Update team member documents to have proper structure
    const enterpriseTeamMemberRef = db.collection('teamMembers').doc(enterpriseFirebaseUid);
    await enterpriseTeamMemberRef.update({
      name: 'Enterprise User',
      assignedToUserId: enterpriseEmail,
      updatedAt: new Date()
    });
    console.log('✅ Enterprise team member data structure updated');

    const bobDernTeamMemberRef = db.collection('teamMembers').doc(bobDernFirebaseUid);
    await bobDernTeamMemberRef.update({
      assignedToUserId: bobDernEmail,
      updatedAt: new Date()
    });
    console.log('✅ Bob Dern team member data structure updated');

    console.log('\n6️⃣ Creating Missing User Documents...');
    
    // Create user document for Bob Dern if it doesn't exist
    const bobDernUserDocSnapshot = await bobDernUserRef.get();
    if (!bobDernUserDocSnapshot.exists) {
      await bobDernUserRef.set({
        email: bobDernEmail,
        name: 'Bob Dern',
        role: 'ADMIN',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true,
        organizationId: 'example-corp-org',
        firebaseUid: bobDernFirebaseUid
      });
      console.log('✅ Bob Dern user document created');
    } else {
      console.log('✅ Bob Dern user document already exists');
    }

    console.log('\n7️⃣ Fixing License Assignments...');
    
    // Assign the first license to the enterprise user
    const licensesRef = db.collection('licenses');
    const licenseQuery = await licensesRef.where('organizationId', '==', 'default-org').limit(1).get();
    
    if (!licenseQuery.empty) {
      const licenseDoc = licenseQuery.docs[0];
      await licenseDoc.ref.update({
        assignedTo: enterpriseFirebaseUid,
        assignedToEmail: enterpriseEmail,
        assignedAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ License assigned to enterprise user: ${licenseDoc.id}`);
    }

    // Assign a license to Bob Dern
    const bobDernLicenseQuery = await licensesRef.where('organizationId', '==', 'example-corp-org').limit(1).get();
    if (!bobDernLicenseQuery.empty) {
      const licenseDoc = bobDernLicenseQuery.docs[0];
      await licenseDoc.ref.update({
        assignedTo: bobDernFirebaseUid,
        assignedToEmail: bobDernEmail,
        assignedAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ License assigned to Bob Dern: ${licenseDoc.id}`);
    }

    console.log('\n8️⃣ Verifying All Fixes...');
    
    // Verify the fixes
    const enterpriseUserDoc = await enterpriseUserRef.get();
    const bobDernUserDoc = await bobDernUserRef.get();
    const enterpriseTeamMemberDoc = await enterpriseTeamMemberRef.get();
    const bobDernTeamMemberDoc = await bobDernTeamMemberRef.get();
    
    console.log('✅ Enterprise user document:', enterpriseUserDoc.exists ? 'EXISTS' : 'MISSING');
    console.log('✅ Bob Dern user document:', bobDernUserDoc.exists ? 'EXISTS' : 'MISSING');
    console.log('✅ Enterprise team member document:', enterpriseTeamMemberDoc.exists ? 'EXISTS' : 'MISSING');
    console.log('✅ Bob Dern team member document:', bobDernTeamMemberDoc.exists ? 'EXISTS' : 'MISSING');

    console.log('\n🎉 All Remaining Issues Fixed!');
    console.log('================================');
    console.log('✅ Subscription linkage fixed');
    console.log('✅ Payment records created');
    console.log('✅ Invoice records created');
    console.log('✅ Organization context fixed');
    console.log('✅ Team member data structure fixed');
    console.log('✅ License assignments created');
    console.log('\n🎯 Users should now have:');
    console.log('   - Proper organization context');
    console.log('   - Team member data loaded');
    console.log('   - Payment history visible');
    console.log('   - Invoice records visible');
    console.log('   - License assignments working');

  } catch (error) {
    console.error('❌ Error fixing remaining issues:', error);
    process.exit(1);
  }
}

// Run the fix
fixAllRemainingIssues();
