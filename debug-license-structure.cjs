const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function debugLicenseStructure() {
  console.log('🔍 DEBUGGING LICENSE STRUCTURE');
  console.log('==============================');
  
  try {
    const orgId = 'enterprise-org-001';
    
    // Get all licenses for the organization
    console.log(`\n📊 All licenses for organization ${orgId}:`);
    const allLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    console.log(`Total licenses: ${allLicensesSnapshot.size}`);
    
    allLicensesSnapshot.forEach((doc, index) => {
      const license = doc.data();
      console.log(`\n${index + 1}. License ${doc.id}:`);
      console.log(`   - Key: ${license.key}`);
      console.log(`   - Tier: ${license.tier}`);
      console.log(`   - Status: ${license.status}`);
      console.log(`   - Organization ID: ${license.organizationId}`);
      console.log(`   - Assigned To User ID: ${license.assignedToUserId || 'null'}`);
      console.log(`   - Assigned To Email: ${license.assignedToEmail || 'null'}`);
      console.log(`   - User ID: ${license.userId || 'null'}`);
    });
    
    // Test different query combinations
    console.log(`\n🔍 Testing query combinations:`);
    
    // Query 1: Active licenses
    const activeLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .where('status', '==', 'ACTIVE')
      .get();
    console.log(`   - Active licenses: ${activeLicensesSnapshot.size}`);
    
    // Query 2: Unassigned licenses (assignedToUserId == null)
    const unassignedLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .where('assignedToUserId', '==', null)
      .get();
    console.log(`   - Unassigned licenses: ${unassignedLicensesSnapshot.size}`);
    
    // Query 3: Combined query (this is what the app uses)
    const combinedQuerySnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .where('status', '==', 'ACTIVE')
      .where('assignedToUserId', '==', null)
      .get();
    console.log(`   - Combined query (active + unassigned): ${combinedQuerySnapshot.size}`);
    
    // Query 4: Check if assignedToUserId field exists
    const licensesWithAssignedField = allLicensesSnapshot.docs.filter(doc => 
      doc.data().hasOwnProperty('assignedToUserId')
    );
    console.log(`   - Licenses with assignedToUserId field: ${licensesWithAssignedField.length}`);
    
    // Query 5: Check for different field names
    const licensesWithAssignedTo = allLicensesSnapshot.docs.filter(doc => 
      doc.data().hasOwnProperty('assignedTo') || 
      doc.data().hasOwnProperty('assignedToUser') ||
      doc.data().hasOwnProperty('assignedUser')
    );
    console.log(`   - Licenses with other assignment fields: ${licensesWithAssignedTo.length}`);
    
    // Show field names for first license
    if (allLicensesSnapshot.size > 0) {
      const firstLicense = allLicensesSnapshot.docs[0].data();
      console.log(`\n📋 Field names in first license:`);
      Object.keys(firstLicense).forEach(key => {
        console.log(`   - ${key}: ${typeof firstLicense[key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging license structure:', error);
  }
  
  process.exit(0);
}

debugLicenseStructure().catch(console.error);

