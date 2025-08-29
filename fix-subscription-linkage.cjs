const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixSubscriptionLinkage() {
  console.log('🔧 FIXING SUBSCRIPTION LINKAGE');
  console.log('===============================');
  
  try {
    // Get the enterprise user
    const userQuery = await db.collection('users').where('email', '==', 'enterprise.user@example.com').get();
    if (userQuery.empty) {
      console.log('❌ Enterprise user not found');
      return;
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    const userDocId = userDoc.id;
    const firebaseUid = userData.firebaseUid;
    
    console.log('✅ Enterprise user found:');
    console.log('   Document ID:', userDocId);
    console.log('   Firebase UID:', firebaseUid);
    console.log('   Email:', userData.email);
    
    // Find subscription by userId (document ID)
    const subscriptionQuery = await db.collection('subscriptions')
      .where('userId', '==', userDocId)
      .where('organizationId', '==', 'default-org')
      .get();
    
    if (!subscriptionQuery.empty) {
      console.log('\n📋 Found subscription by userId, updating with Firebase UID...');
      
      for (const subDoc of subscriptionQuery.docs) {
        const subData = subDoc.data();
        console.log('   Updating subscription:', subDoc.id, '- Tier:', subData.tier);
        
        // Update subscription with Firebase UID and email
        await subDoc.ref.update({
          firebaseUid: firebaseUid,
          userEmail: userData.email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('   ✅ Updated subscription with Firebase UID');
      }
    } else {
      console.log('\n❌ No subscription found by userId:', userDocId);
      
      // Check if there's already a subscription by Firebase UID
      const subByUidQuery = await db.collection('subscriptions')
        .where('firebaseUid', '==', firebaseUid)
        .where('organizationId', '==', 'default-org')
        .get();
      
      if (subByUidQuery.empty) {
        console.log('   Creating new subscription for enterprise user...');
        
        // Create a new subscription
        const newSubscription = {
          userId: userDocId,
          firebaseUid: firebaseUid,
          userEmail: userData.email,
          organizationId: 'default-org',
          tier: 'ENTERPRISE',
          status: 'ACTIVE',
          seats: 10,
          amount: 4999.5,
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('subscriptions').add(newSubscription);
        console.log('   ✅ Created new subscription for enterprise user');
      }
    }
    
    // Also fix payments and invoices
    console.log('\n💳 Fixing payments linkage...');
    const paymentsQuery = await db.collection('payments')
      .where('userId', '==', userDocId)
      .where('organizationId', '==', 'default-org')
      .get();
    
    for (const paymentDoc of paymentsQuery.docs) {
      await paymentDoc.ref.update({
        firebaseUid: firebaseUid,
        userEmail: userData.email,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('   ✅ Updated payment:', paymentDoc.id);
    }
    
    console.log('\n📄 Fixing invoices linkage...');
    const invoicesQuery = await db.collection('invoices')
      .where('userId', '==', userDocId)
      .where('organizationId', '==', 'default-org')
      .get();
    
    for (const invoiceDoc of invoicesQuery.docs) {
      await invoiceDoc.ref.update({
        firebaseUid: firebaseUid,
        userEmail: userData.email,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('   ✅ Updated invoice:', invoiceDoc.id);
    }
    
    console.log('\n🏢 Fixing billing profiles linkage...');
    const billingQuery = await db.collection('billingProfiles')
      .where('userId', '==', userDocId)
      .where('organizationId', '==', 'default-org')
      .get();
    
    for (const billingDoc of billingQuery.docs) {
      await billingDoc.ref.update({
        firebaseUid: firebaseUid,
        userEmail: userData.email,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('   ✅ Updated billing profile:', billingDoc.id);
    }
    
    console.log('\n🎉 LINKAGE FIXES COMPLETED');
    console.log('==========================');
    console.log('✅ All subscription, payment, invoice, and billing data now linked to Firebase UID');
    console.log('✅ UserBillingService should now find the data correctly');
    
  } catch (error) {
    console.error('❌ Error fixing subscription linkage:', error);
  }
  
  process.exit(0);
}

fixSubscriptionLinkage().catch(console.error);
