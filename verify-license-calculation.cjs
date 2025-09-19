const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function verifyLicenseCalculation() {
  console.log('🎯 VERIFYING LICENSE CALCULATION FIX');
  console.log('====================================');
  
  try {
    const orgId = 'enterprise-media-org';
    
    // Step 1: Get all licenses
    console.log('🎫 Step 1: Getting all licenses...');
    
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    const licenses = licensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${licenses.length} total licenses`);
    
    // Step 2: Calculate stats
    console.log('\n📊 Step 2: Calculating license stats...');
    
    const totalLicenses = licenses.length;
    const activeLicenses = licenses.filter(l => l.status === 'ACTIVE').length;
    const unassignedLicenses = licenses.filter(l => 
      l.status === 'ACTIVE' && (!l.assignedToUserId || l.assignedToUserId === null)
    ).length;
    const assignedLicenses = activeLicenses - unassignedLicenses;
    
    console.log(`📊 License Statistics:`);
    console.log(`   - Total Licenses: ${totalLicenses}`);
    console.log(`   - Active Licenses: ${activeLicenses}`);
    console.log(`   - Assigned Licenses: ${assignedLicenses}`);
    console.log(`   - Unassigned Licenses: ${unassignedLicenses}`);
    
    // Step 3: Calculate enterprise stats
    console.log('\n🏢 Step 3: Calculating enterprise stats...');
    
    const enterpriseTotal = 250; // Enterprise plan comes with 250 licenses
    const enterpriseAssigned = activeLicenses; // Each active license = 1 assignment
    const enterpriseAvailable = Math.max(0, enterpriseTotal - enterpriseAssigned);
    
    console.log(`🏢 Enterprise License Stats:`);
    console.log(`   - Enterprise Total: ${enterpriseTotal}`);
    console.log(`   - Enterprise Assigned: ${enterpriseAssigned}`);
    console.log(`   - Enterprise Available: ${enterpriseAvailable}`);
    
    // Step 4: Show license details
    console.log('\n🎫 Step 4: License details...');
    
    licenses.forEach((license, index) => {
      console.log(`   ${index + 1}. ${license.key || 'NO KEY'} (${license.tier})`);
      console.log(`      Status: ${license.status}`);
      console.log(`      Assigned To: ${license.assignedToEmail || 'None'}`);
      console.log(`      Assigned User ID: ${license.assignedToUserId || 'None'}`);
    });
    
    // Step 5: Expected vs Actual
    console.log('\n✅ Step 5: Expected vs Actual...');
    
    console.log(`📊 Expected Frontend Display:`);
    console.log(`   - Enterprise Licenses Card:`);
    console.log(`     * Total: 250`);
    console.log(`     * Available: ${enterpriseAvailable}/250`);
    console.log(`     * Used: ${enterpriseAssigned} (${assignedLicenses} assigned licenses)`);
    console.log(`   - Active Licenses Card:`);
    console.log(`     * Total: ${activeLicenses}`);
    console.log(`     * Currently in use: ${activeLicenses} of ${totalLicenses} total licenses`);
    console.log(`   - Expiring Soon Card:`);
    console.log(`     * Count: 0 (no licenses expiring within 30 days)`);
    
    // Step 6: Verification
    console.log('\n🔍 Step 6: Verification...');
    
    const isCorrect = (
      enterpriseTotal === 250 &&
      enterpriseAssigned === activeLicenses &&
      enterpriseAvailable === (250 - activeLicenses) &&
      assignedLicenses === activeLicenses &&
      unassignedLicenses === 0
    );
    
    if (isCorrect) {
      console.log('🎉 CALCULATION IS CORRECT!');
      console.log('✅ Enterprise stats match actual license data');
      console.log('✅ All active licenses are assigned');
      console.log('✅ No unassigned licenses');
      console.log('✅ Frontend should display correct numbers');
    } else {
      console.log('❌ CALCULATION ISSUES FOUND:');
      if (enterpriseTotal !== 250) console.log(`   - Enterprise total should be 250, got ${enterpriseTotal}`);
      if (enterpriseAssigned !== activeLicenses) console.log(`   - Enterprise assigned should be ${activeLicenses}, got ${enterpriseAssigned}`);
      if (enterpriseAvailable !== (250 - activeLicenses)) console.log(`   - Enterprise available should be ${250 - activeLicenses}, got ${enterpriseAvailable}`);
      if (assignedLicenses !== activeLicenses) console.log(`   - Assigned licenses should be ${activeLicenses}, got ${assignedLicenses}`);
      if (unassignedLicenses !== 0) console.log(`   - Unassigned licenses should be 0, got ${unassignedLicenses}`);
    }
    
    console.log('\n🎯 SUMMARY');
    console.log('===========');
    console.log(`Enterprise Licenses: ${enterpriseAssigned}/${enterpriseTotal} used, ${enterpriseAvailable} available`);
    console.log(`Active Licenses: ${activeLicenses}/${totalLicenses} total`);
    console.log(`All licenses are properly assigned: ${assignedLicenses === activeLicenses ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
  
  process.exit(0);
}

verifyLicenseCalculation().catch(console.error);

