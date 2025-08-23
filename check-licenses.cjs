const admin = require('firebase-admin');
admin.initializeApp({projectId: 'backbone-logic'});
const db = admin.firestore();

async function checkLicenseAssignments() {
  console.log('Checking license assignments in Firestore...');
  
  // Get all licenses
  const licensesSnapshot = await db.collection('licenses').get();
  const licenses = licensesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Count assigned licenses
  const assignedLicenses = licenses.filter(l => l.assignedToUserId || l.assignedToEmail);
  
  console.log(`Total licenses: ${licenses.length}`);
  console.log(`Assigned licenses: ${assignedLicenses.length}`);
  console.log(`Unassigned licenses: ${licenses.length - assignedLicenses.length}`);
  
  // Show assigned licenses
  console.log('\nAssigned licenses:');
  assignedLicenses.forEach(license => {
    console.log(`${license.id}: assigned to ${license.assignedToEmail || 'unknown'} (${license.tier || 'unknown tier'})`);
  });
  
  // Check for userId field that might be causing confusion
  const licensesWithUserId = licenses.filter(l => l.userId && !l.assignedToUserId);
  console.log(`\nLicenses with userId but no assignedToUserId: ${licensesWithUserId.length}`);
  
  if (licensesWithUserId.length > 0) {
    console.log('Sample licenses with userId:');
    licensesWithUserId.slice(0, 5).forEach(license => {
      console.log(`${license.id}: userId=${license.userId}, tier=${license.tier}`);
    });
  }
}

checkLicenseAssignments().catch(console.error);
