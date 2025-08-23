/**
 * Fix License Display Issue
 * 
 * This script fixes the issue where licenses with a userId field but no assignedToUserId or assignedToEmail
 * are incorrectly displayed as "assigned" in the UI.
 * 
 * The solution is to remove the userId field from licenses that don't have assignedToUserId or assignedToEmail.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with application default credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixLicenseDisplay() {
  console.log('Starting license display fix...');
  
  try {
    // Get all licenses
    const licensesSnapshot = await db.collection('licenses').get();
    const licenses = licensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${licenses.length} total licenses`);
    
    // Find licenses with userId but no assignedToUserId or assignedToEmail
    const licensesToFix = licenses.filter(l => 
      l.userId && 
      !l.assignedToUserId && 
      !l.assignedToEmail
    );
    
    console.log(`Found ${licensesToFix.length} licenses to fix`);
    
    // Fix each license
    const batch = db.batch();
    let batchCount = 0;
    let batchNumber = 1;
    
    for (const license of licensesToFix) {
      const licenseRef = db.collection('licenses').doc(license.id);
      
      // Remove the userId field
      batch.update(licenseRef, {
        userId: admin.firestore.FieldValue.delete(),
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
    
    console.log(`Successfully fixed ${licensesToFix.length} licenses`);
    console.log('License display fix completed!');
    
  } catch (error) {
    console.error('Error fixing license display:', error);
  }
}

fixLicenseDisplay().catch(console.error);
