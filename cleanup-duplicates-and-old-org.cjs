const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function cleanupDuplicatesAndOldOrg() {
  console.log('🧹 CLEANING UP DUPLICATES AND OLD ORGANIZATION');
  console.log('==============================================');
  
  try {
    const orgId = 'enterprise-media-org';
    const oldOrgId = 'enterprise-org-001';
    
    // Step 1: Remove duplicate Chris Mole records
    console.log('👤 Step 1: Removing duplicate Chris Mole records...');
    
    const cmoleSnapshot = await db.collection('teamMembers')
      .where('email', '==', 'cmole@backbone.com')
      .where('organizationId', '==', orgId)
      .get();
    
    console.log(`Found ${cmoleSnapshot.size} Chris Mole records`);
    
    if (cmoleSnapshot.size > 1) {
      // Keep the one with ACTIVE status and license, delete others
      const activeCmole = cmoleSnapshot.docs.find(doc => 
        doc.data().status === 'ACTIVE' && doc.data().assignedLicenseKey
      );
      
      if (activeCmole) {
        console.log(`✅ Keeping active Chris Mole record: ${activeCmole.id}`);
        
        // Delete the others
        for (const doc of cmoleSnapshot.docs) {
          if (doc.id !== activeCmole.id) {
            await doc.ref.delete();
            console.log(`🗑️ Deleted duplicate Chris Mole record: ${doc.id}`);
          }
        }
      }
    }
    
    // Step 2: Remove duplicate licenses
    console.log('\n🎫 Step 2: Removing duplicate licenses...');
    
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    console.log(`Found ${licensesSnapshot.size} licenses`);
    
    // Group licenses by assigned email
    const licensesByEmail = {};
    licensesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const email = data.assignedToEmail;
      if (email) {
        if (!licensesByEmail[email]) {
          licensesByEmail[email] = [];
        }
        licensesByEmail[email].push({ id: doc.id, data });
      }
    });
    
    // Remove duplicates (keep the one with a proper key)
    for (const [email, licenses] of Object.entries(licensesByEmail)) {
      if (licenses.length > 1) {
        console.log(`Found ${licenses.length} licenses for ${email}`);
        
        // Keep the one with a proper key, delete others
        const validLicense = licenses.find(l => l.data.key && l.data.key !== 'undefined');
        if (validLicense) {
          console.log(`✅ Keeping license with key: ${validLicense.data.key}`);
          
          for (const license of licenses) {
            if (license.id !== validLicense.id) {
              await db.collection('licenses').doc(license.id).delete();
              console.log(`🗑️ Deleted duplicate license: ${license.id}`);
            }
          }
        }
      }
    }
    
    // Step 3: Clean up old organization data
    console.log('\n🗑️ Step 3: Cleaning up old organization data...');
    
    // Delete old licenses
    const oldLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', oldOrgId)
      .get();
    
    console.log(`Found ${oldLicensesSnapshot.size} licenses in old organization`);
    
    for (const doc of oldLicensesSnapshot.docs) {
      await doc.ref.delete();
      console.log(`🗑️ Deleted old license: ${doc.id}`);
    }
    
    // Delete old team members
    const oldTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', oldOrgId)
      .get();
    
    console.log(`Found ${oldTeamMembersSnapshot.size} team members in old organization`);
    
    for (const doc of oldTeamMembersSnapshot.docs) {
      await doc.ref.delete();
      console.log(`🗑️ Deleted old team member: ${doc.id}`);
    }
    
    // Delete old users (except enterprise user)
    const oldUsersSnapshot = await db.collection('users')
      .where('organizationId', '==', oldOrgId)
      .get();
    
    console.log(`Found ${oldUsersSnapshot.size} users in old organization`);
    
    for (const doc of oldUsersSnapshot.docs) {
      const data = doc.data();
      if (data.email !== 'enterprise.user@enterprisemedia.com') {
        await doc.ref.delete();
        console.log(`🗑️ Deleted old user: ${data.email}`);
      } else {
        console.log(`✅ Keeping enterprise user: ${data.email}`);
      }
    }
    
    // Step 4: Final verification
    console.log('\n🔍 Step 4: Final verification...');
    
    const finalLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    const finalTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', orgId)
      .get();
    
    const finalOldLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', oldOrgId)
      .get();
    
    const finalOldTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', oldOrgId)
      .get();
    
    console.log(`📊 Final Status:`);
    console.log(`   - Licenses in ${orgId}: ${finalLicensesSnapshot.size}`);
    console.log(`   - Team Members in ${orgId}: ${finalTeamMembersSnapshot.size}`);
    console.log(`   - Licenses in ${oldOrgId}: ${finalOldLicensesSnapshot.size} (should be 0)`);
    console.log(`   - Team Members in ${oldOrgId}: ${finalOldTeamMembersSnapshot.size} (should be 0)`);
    
    // Show final team members
    console.log(`\n👥 Final Team Members:`);
    finalTeamMembersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.firstName} ${data.lastName} (${data.email})`);
      console.log(`      Status: ${data.status}`);
      console.log(`      License: ${data.assignedLicenseKey || 'None'}`);
    });
    
    // Show final licenses
    console.log(`\n🎫 Final Licenses:`);
    finalLicensesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.key || 'NO KEY'} (${data.tier})`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Assigned To: ${data.assignedToEmail || 'None'}`);
    });
    
    console.log('\n🎉 CLEANUP COMPLETED!');
    console.log('=====================');
    console.log('✅ Duplicates removed');
    console.log('✅ Old organization data cleaned');
    console.log('✅ Data consolidated in enterprise-media-org');
    console.log('✅ Frontend should now show clean, correct data');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
  
  process.exit(0);
}

cleanupDuplicatesAndOldOrg().catch(console.error);

