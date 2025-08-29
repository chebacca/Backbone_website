const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixRemainingSubscriptions() {
  console.log('🔧 FIXING REMAINING SUBSCRIPTION DATA');
  console.log('====================================');
  
  try {
    // Get all subscriptions in default-org
    const subscriptions = await db.collection('subscriptions')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log(`Found ${subscriptions.size} subscriptions to check`);
    
    for (const subDoc of subscriptions.docs) {
      const subData = subDoc.data();
      const userId = subData.userId;
      
      console.log(`\n📋 Checking subscription: ${subDoc.id}`);
      console.log(`   Tier: ${subData.tier}`);
      console.log(`   Current userId: ${userId}`);
      console.log(`   Current firebaseUid: ${subData.firebaseUid}`);
      console.log(`   Current userEmail: ${subData.userEmail}`);
      
      // If no firebaseUid, try to find the user and link it
      if (!subData.firebaseUid && userId) {
        console.log(`   🔍 Looking for user with ID: ${userId}`);
        
        // Try to find user by document ID
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            console.log(`   ✅ Found user: ${userData.email}`);
            
            await subDoc.ref.update({
              firebaseUid: userData.firebaseUid,
              userEmail: userData.email,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`   ✅ Updated subscription with Firebase UID: ${userData.firebaseUid}`);
          } else {
            console.log(`   ❌ User document not found: ${userId}`);
          }
        } catch (error) {
          console.log(`   ❌ Error finding user: ${error.message}`);
        }
      } else if (subData.firebaseUid) {
        console.log(`   ✅ Already has Firebase UID: ${subData.firebaseUid}`);
      }
    }
    
    // Also check and fix payments and invoices with missing firebaseUid
    console.log('\n💳 FIXING PAYMENTS...');
    const payments = await db.collection('payments')
      .where('organizationId', '==', 'default-org')
      .get();
    
    for (const paymentDoc of payments.docs) {
      const paymentData = paymentDoc.data();
      const userId = paymentData.userId;
      
      if (!paymentData.firebaseUid && userId) {
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            
            await paymentDoc.ref.update({
              firebaseUid: userData.firebaseUid,
              userEmail: userData.email,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`   ✅ Updated payment for user: ${userData.email}`);
          }
        } catch (error) {
          console.log(`   ❌ Error updating payment: ${error.message}`);
        }
      }
    }
    
    console.log('\n📄 FIXING INVOICES...');
    const invoices = await db.collection('invoices')
      .where('organizationId', '==', 'default-org')
      .get();
    
    for (const invoiceDoc of invoices.docs) {
      const invoiceData = invoiceDoc.data();
      const userId = invoiceData.userId;
      
      if (!invoiceData.firebaseUid && userId) {
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            
            await invoiceDoc.ref.update({
              firebaseUid: userData.firebaseUid,
              userEmail: userData.email,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`   ✅ Updated invoice for user: ${userData.email}`);
          }
        } catch (error) {
          console.log(`   ❌ Error updating invoice: ${error.message}`);
        }
      }
    }
    
    console.log('\n🏢 FIXING BILLING PROFILES...');
    const billingProfiles = await db.collection('billingProfiles')
      .where('organizationId', '==', 'default-org')
      .get();
    
    for (const billingDoc of billingProfiles.docs) {
      const billingData = billingDoc.data();
      const userId = billingData.userId;
      
      if (!billingData.firebaseUid && userId) {
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            
            await billingDoc.ref.update({
              firebaseUid: userData.firebaseUid,
              userEmail: userData.email,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`   ✅ Updated billing profile for user: ${userData.email}`);
          }
        } catch (error) {
          console.log(`   ❌ Error updating billing profile: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 REMAINING DATA FIXES COMPLETED');
    console.log('=================================');
    
  } catch (error) {
    console.error('❌ Error fixing remaining data:', error);
  }
  
  process.exit(0);
}

fixRemainingSubscriptions().catch(console.error);
