const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function restoreEnterpriseLicenses() {
  console.log('Restoring Enterprise User license associations...');
  
  const enterpriseUserId = 'l5YKvrhAD72EV2MnugbS';
  
  // Get all ENTERPRISE tier licenses
  const enterpriseLicensesSnapshot = await db.collection('licenses').where('tier', '==', 'ENTERPRISE').get();
  console.log(`Found ${enterpriseLicensesSnapshot.size} ENTERPRISE licenses`);
  
  // Filter licenses that don't have assignedToUserId or assignedToEmail (unassigned licenses)
  const unassignedLicenses = enterpriseLicensesSnapshot.docs.filter(doc => {
    const data = doc.data();
    return !data.assignedToUserId && !data.assignedToEmail;
  });
  
  console.log(`Found ${unassignedLicenses.length} unassigned ENTERPRISE licenses to restore`);
  
  // Update these licenses to have the Enterprise User's userId
  const batch = db.batch();
  let batchCount = 0;
  let batchNumber = 1;
  
  for (const doc of unassignedLicenses) {
    const licenseRef = db.collection('licenses').doc(doc.id);
    
    // Restore the userId field but keep them unassigned
    batch.update(licenseRef, {
      userId: enterpriseUserId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    batchCount++;
    
    // Firestore batches are limited to 500 operations
    if (batchCount === 400) {
      console.log(`Committing batch ${batchNumber}...`);
      await batch.commit();
      console.log(`Batch ${batchNumber} committed`);
      
      // Reset for next batch
      batchCount = 0;
      batchNumber++;
      batch = db.batch();
    }
  }
  
  // Commit any remaining operations
  if (batchCount > 0) {
    console.log(`Committing final batch...`);
    await batch.commit();
    console.log(`Final batch committed`);
  }
  
  console.log(`Successfully restored ${unassignedLicenses.length} Enterprise User licenses`);
  console.log('Enterprise User should now see all 300 licenses in their dashboard');
}

restoreEnterpriseLicenses().catch(console.error);
