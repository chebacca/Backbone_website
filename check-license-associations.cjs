const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function checkLicenseAssociations() {
  console.log('Checking how licenses are associated with Enterprise User...');
  
  const userId = 'l5YKvrhAD72EV2MnugbS';
  
  // Check licenses by userId
  const licensesByUserId = await db.collection('licenses').where('userId', '==', userId).get();
  console.log(`Licenses with userId ${userId}: ${licensesByUserId.size}`);
  
  // Check licenses by assignedToUserId
  const licensesByAssignedTo = await db.collection('licenses').where('assignedToUserId', '==', userId).get();
  console.log(`Licenses assigned to ${userId}: ${licensesByAssignedTo.size}`);
  
  // Check licenses by assignedToEmail
  const licensesByEmail = await db.collection('licenses').where('assignedToEmail', '==', 'enterprise.user@example.com').get();
  console.log(`Licenses assigned to enterprise.user@example.com: ${licensesByEmail.size}`);
  
  // Check all ENTERPRISE tier licenses
  const enterpriseLicenses = await db.collection('licenses').where('tier', '==', 'ENTERPRISE').get();
  console.log(`Total ENTERPRISE licenses: ${enterpriseLicenses.size}`);
  
  // Show a few sample enterprise licenses
  console.log('Sample ENTERPRISE licenses:');
  enterpriseLicenses.docs.slice(0, 3).forEach(doc => {
    const data = doc.data();
    console.log(`- ${doc.id}: userId=${data.userId}, assignedToUserId=${data.assignedToUserId}, assignedToEmail=${data.assignedToEmail}`);
  });
}

checkLicenseAssociations().catch(console.error);
