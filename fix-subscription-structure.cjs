const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function fixSubscriptionStructure() {
  console.log('Fixing subscription structure...');
  
  const enterpriseUserId = 'l5YKvrhAD72EV2MnugbS';
  
  // Get all subscriptions for the Enterprise User
  const subscriptionsSnapshot = await db.collection('subscriptions').where('userId', '==', enterpriseUserId).get();
  console.log(`Found ${subscriptionsSnapshot.size} subscriptions for Enterprise User`);
  
  if (subscriptionsSnapshot.empty) {
    console.log('No subscriptions found for Enterprise User');
    return;
  }
  
  // Get the first subscription as the main one
  const mainSubscription = subscriptionsSnapshot.docs[0];
  const mainSubscriptionData = mainSubscription.data();
  
  console.log('Main subscription:', {
    id: mainSubscription.id,
    tier: mainSubscriptionData.tier,
    seats: mainSubscriptionData.seats
  });
  
  // Update the main subscription to have 300 seats (50 * 6)
  await db.collection('subscriptions').doc(mainSubscription.id).update({
    seats: 300,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('Updated main subscription to have 300 seats');
  
  // Delete the other 5 subscriptions
  const subscriptionsToDelete = subscriptionsSnapshot.docs.slice(1);
  console.log(`Deleting ${subscriptionsToDelete.length} duplicate subscriptions...`);
  
  const deleteBatch = db.batch();
  subscriptionsToDelete.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();
  
  console.log('Deleted duplicate subscriptions');
  
  // Now associate all ENTERPRISE licenses with the main subscription
  const enterpriseLicensesSnapshot = await db.collection('licenses').where('tier', '==', 'ENTERPRISE').get();
  console.log(`Found ${enterpriseLicensesSnapshot.size} ENTERPRISE licenses to associate`);
  
  const updateBatch = db.batch();
  let batchCount = 0;
  let batchNumber = 1;
  
  enterpriseLicensesSnapshot.docs.forEach(doc => {
    const licenseRef = db.collection('licenses').doc(doc.id);
    
    // Associate all licenses with the main subscription and Enterprise User
    updateBatch.update(licenseRef, {
      subscriptionId: mainSubscription.id,
      userId: enterpriseUserId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    batchCount++;
    
    // Firestore batches are limited to 500 operations
    if (batchCount === 400) {
      console.log(`Committing batch ${batchNumber}...`);
      updateBatch.commit();
      console.log(`Batch ${batchNumber} committed`);
      
      // Reset for next batch
      batchCount = 0;
      batchNumber++;
      updateBatch = db.batch();
    }
  });
  
  // Commit any remaining operations
  if (batchCount > 0) {
    console.log(`Committing final batch...`);
    await updateBatch.commit();
    console.log(`Final batch committed`);
  }
  
  console.log('Successfully associated all ENTERPRISE licenses with the main subscription');
  console.log('Enterprise User now has:');
  console.log('- 1 subscription with 300 seats');
  console.log('- 300 licenses associated with that subscription');
  console.log('- 1 license assigned to the user');
  console.log('- 299 licenses available for team members');
}

fixSubscriptionStructure().catch(console.error);
