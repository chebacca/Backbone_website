const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixAllUserLinkages() {
  console.log('🔧 FIXING ALL USER DATA LINKAGES');
  console.log('=================================');
  
  try {
    // Get all users
    const usersQuery = await db.collection('users').get();
    console.log(`Found ${usersQuery.size} users to process`);
    
    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();
      const userDocId = userDoc.id;
      const firebaseUid = userData.firebaseUid;
      const email = userData.email;
      
      if (!firebaseUid) {
        console.log(`⚠️ Skipping user ${email} - no Firebase UID`);
        continue;
      }
      
      console.log(`\n👤 Processing user: ${email}`);
      console.log(`   Document ID: ${userDocId}`);
      console.log(`   Firebase UID: ${firebaseUid}`);
      
      // Fix subscriptions
      const subscriptions = await db.collection('subscriptions')
        .where('userId', '==', userDocId)
        .get();
      
      console.log(`   📋 Found ${subscriptions.size} subscriptions to update`);
      for (const subDoc of subscriptions.docs) {
        const subData = subDoc.data();
        await subDoc.ref.update({
          firebaseUid: firebaseUid,
          userEmail: email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   ✅ Updated subscription: ${subData.tier}`);
      }
      
      // Fix payments
      const payments = await db.collection('payments')
        .where('userId', '==', userDocId)
        .get();
      
      console.log(`   💳 Found ${payments.size} payments to update`);
      for (const paymentDoc of payments.docs) {
        await paymentDoc.ref.update({
          firebaseUid: firebaseUid,
          userEmail: email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   ✅ Updated payment: ${paymentDoc.id}`);
      }
      
      // Fix invoices
      const invoices = await db.collection('invoices')
        .where('userId', '==', userDocId)
        .get();
      
      console.log(`   📄 Found ${invoices.size} invoices to update`);
      for (const invoiceDoc of invoices.docs) {
        await invoiceDoc.ref.update({
          firebaseUid: firebaseUid,
          userEmail: email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   ✅ Updated invoice: ${invoiceDoc.id}`);
      }
      
      // Fix billing profiles
      const billingProfiles = await db.collection('billingProfiles')
        .where('userId', '==', userDocId)
        .get();
      
      console.log(`   🏢 Found ${billingProfiles.size} billing profiles to update`);
      for (const billingDoc of billingProfiles.docs) {
        await billingDoc.ref.update({
          firebaseUid: firebaseUid,
          userEmail: email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   ✅ Updated billing profile: ${billingDoc.id}`);
      }
    }
    
    console.log('\n🎉 ALL USER LINKAGES FIXED');
    console.log('==========================');
    console.log('✅ All subscription, payment, invoice, and billing data now properly linked');
    console.log('✅ UserBillingService should now find all data correctly');
    
  } catch (error) {
    console.error('❌ Error fixing user linkages:', error);
  }
  
  process.exit(0);
}

fixAllUserLinkages().catch(console.error);
