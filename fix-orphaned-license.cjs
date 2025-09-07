const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixOrphanedLicense() {
  console.log('🔧 FIXING ORPHANED LICENSE');
  console.log('==========================');
  
  try {
    const organizationId = 'enterprise-org-001';
    const orphanedLicenseId = 'license-1756877522890-k5kkyy96g';
    
    console.log(`\n🎯 Target orphaned license: ${orphanedLicenseId}`);
    console.log(`   Assigned to: Lucienne67@hotmail.com (ID: 2ysTqv3pwiXyKxOeExAfEKOIh7K2)`);
    console.log(`   Reason: User does not exist in team members collection`);
    
    // Get the license document
    const licenseDoc = await db.collection('licenses').doc(orphanedLicenseId).get();
    
    if (!licenseDoc.exists) {
      console.log('❌ License document not found');
      return;
    }
    
    const license = licenseDoc.data();
    console.log(`\n📋 License details:`);
    console.log(`   Name: ${license.name || 'undefined'}`);
    console.log(`   Tier: ${license.tier}`);
    console.log(`   Status: ${license.status}`);
    console.log(`   Assigned to: ${license.assignedTo?.email || 'No email'} (ID: ${license.assignedTo?.userId || 'No ID'})`);
    
    // Unassign the license
    console.log(`\n🔧 Unassigning orphaned license...`);
    
    try {
      await licenseDoc.ref.update({
        assignedTo: null,
        status: 'PENDING', // Reset to pending since it's unassigned
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Successfully unassigned license ${orphanedLicenseId}`);
      
    } catch (error) {
      console.error(`❌ Failed to unassign license:`, error.message);
      return;
    }
    
    // Verify the final state
    console.log(`\n🔍 VERIFYING FINAL STATE...`);
    
    const finalTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    
    const finalLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    const finalAssigned = finalLicensesSnapshot.docs.filter(doc => {
      const license = doc.data();
      return license.assignedTo && (license.assignedTo.userId || license.assignedTo.email);
    }).length;
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`   Team Members: ${finalTeamMembersSnapshot.size}`);
    console.log(`   Assigned Licenses: ${finalAssigned}`);
    console.log(`   Unassigned Licenses: ${finalLicensesSnapshot.size - finalAssigned}`);
    console.log(`   Balance: ${finalAssigned === finalTeamMembersSnapshot.size ? '✅ PERFECT 1:1' : '❌ UNBALANCED'}`);
    
    // Verify each team member has exactly one license
    if (finalAssigned === finalTeamMembersSnapshot.size) {
      console.log(`\n🔍 Verifying each team member has exactly one license...`);
      let allMembersHaveLicenses = true;
      
      for (const doc of finalTeamMembersSnapshot.docs) {
        const member = doc.data();
        const memberId = doc.id;
        
        const memberLicenses = finalLicensesSnapshot.docs.filter(licenseDoc => {
          const license = licenseDoc.data();
          return license.assignedTo && 
                 (license.assignedTo.userId === memberId || 
                  license.assignedTo.email === member.email);
        });
        
        const hasLicense = memberLicenses.length > 0;
        const licenseCount = memberLicenses.length;
        
        if (!hasLicense) {
          console.log(`   ❌ ${member.email || memberId} - NO LICENSE`);
          allMembersHaveLicenses = false;
        } else if (licenseCount > 1) {
          console.log(`   ⚠️  ${member.email || memberId} - ${licenseCount} LICENSES (should be 1)`);
          allMembersHaveLicenses = false;
        } else {
          console.log(`   ✅ ${member.email || memberId} - 1 license`);
        }
      }
      
      if (allMembersHaveLicenses) {
        console.log(`\n🎉 Perfect 1:1 balance achieved! Every team member has exactly one license.`);
        console.log(`   Including enterprise.user@enterprisemedia.com as a team member.`);
        return { success: true, message: 'Perfect 1:1 balance achieved' };
      }
    }
    
    return {
      success: finalAssigned === finalTeamMembersSnapshot.size,
      teamMembers: finalTeamMembersSnapshot.size,
      assignedLicenses: finalAssigned,
      unassignedLicenses: finalLicensesSnapshot.size - finalAssigned
    };
    
  } catch (error) {
    console.error('❌ Error fixing orphaned license:', error);
    throw error;
  }
}

// Run the fix
fixOrphanedLicense()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Orphaned license fix completed successfully!');
      console.log('🎯 Perfect 1:1 balance achieved!');
      console.log('📊 Every team member now has exactly one license assigned.');
    } else {
      console.log('\n⚠️  Orphaned license fix completed with issues.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
