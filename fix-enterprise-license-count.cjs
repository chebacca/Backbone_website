const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixEnterpriseLicenseCount() {
  console.log('🔧 FIXING ENTERPRISE LICENSE COUNT TO 250');
  console.log('==========================================');
  
  try {
    const batch = db.batch();
    let batchCount = 0;
    
    // Enterprise tier should have 250 licenses total
    const ENTERPRISE_LICENSE_LIMIT = 250;
    
    // Check current licenses
    const currentLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log(`📊 Current licenses: ${currentLicensesSnapshot.size}`);
    console.log(`🎯 Target licenses: ${ENTERPRISE_LICENSE_LIMIT}`);
    
    const licensesToCreate = ENTERPRISE_LICENSE_LIMIT - currentLicensesSnapshot.size;
    console.log(`➕ Need to create: ${licensesToCreate} additional licenses`);
    
    if (licensesToCreate <= 0) {
      console.log('✅ Enterprise already has sufficient licenses');
      return;
    }
    
    // Create additional licenses
    for (let i = currentLicensesSnapshot.size + 1; i <= ENTERPRISE_LICENSE_LIMIT; i++) {
      const licenseId = `license-default-org-team-${i}`;
      const licenseRef = db.collection('licenses').doc(licenseId);
      
      const licenseData = {
        id: licenseId,
        key: `ENT-2024-${String(i).padStart(4, '0')}-XXXX-XXXX`,
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        organizationId: 'default-org',
        availableForAssignment: true,
        assignedToEmail: null,
        assignedToUserId: null,
        firebaseUid: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date('2026-12-31T23:59:59Z'),
        features: {
          maxProjects: 100,
          maxTeamMembers: 50,
          maxStorage: '1TB',
          advancedAnalytics: true,
          prioritySupport: true,
          customIntegrations: true
        }
      };
      
      batch.set(licenseRef, licenseData);
      batchCount++;
      
      // Commit batch every 500 operations (Firestore limit)
      if (batchCount >= 500) {
        console.log(`💾 Committing batch of ${batchCount} licenses...`);
        await batch.commit();
        batchCount = 0;
      }
    }
    
    // Commit remaining licenses
    if (batchCount > 0) {
      console.log(`💾 Committing final batch of ${batchCount} licenses...`);
      await batch.commit();
    }
    
    // Verify final count
    const finalLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log('');
    console.log('✅ ENTERPRISE LICENSE ALLOCATION COMPLETED');
    console.log('==========================================');
    console.log(`📊 Total licenses created: ${finalLicensesSnapshot.size}`);
    console.log(`🎯 Target achieved: ${finalLicensesSnapshot.size === ENTERPRISE_LICENSE_LIMIT ? 'YES' : 'NO'}`);
    console.log('');
    console.log('📋 LICENSE BREAKDOWN:');
    console.log('- 1 owner license (enterprise.user@example.com)');
    console.log('- 1 assigned team license (bdern@example.com)');
    console.log(`- ${finalLicensesSnapshot.size - 2} available team licenses`);
    console.log('');
    console.log('🌐 EXPECTED DASHBOARD BEHAVIOR:');
    console.log(`- Total Licenses: ${finalLicensesSnapshot.size}`);
    console.log('- Total Team Members: 1 (Bob Dern)');
    console.log(`- License Utilization: ${Math.round((1 / finalLicensesSnapshot.size) * 100)}% (1 team member / ${finalLicensesSnapshot.size} licenses)`);
    
  } catch (error) {
    console.error('❌ Error fixing enterprise license count:', error);
  }
  
  process.exit(0);
}

fixEnterpriseLicenseCount().catch(console.error);
