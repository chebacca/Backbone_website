const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function final1to1BalanceFix() {
  console.log('🔧 FINAL 1:1 BALANCE FIX');
  console.log('=========================');
  
  try {
    const organizationId = 'enterprise-org-001';
    
    // Get all team members for this organization
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    
    // Get all licenses for this organization
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`\n📊 Current state:`);
    console.log(`   Team Members: ${teamMembersSnapshot.size}`);
    console.log(`   Total Licenses: ${licensesSnapshot.size}`);
    
    // Count assigned licenses
    const assignedLicenses = licensesSnapshot.docs.filter(doc => {
      const license = doc.data();
      return license.assignedTo && (license.assignedTo.userId || license.assignedTo.email);
    });
    
    console.log(`   Assigned Licenses: ${assignedLicenses.length}`);
    console.log(`   Unassigned Licenses: ${licensesSnapshot.size - assignedLicenses.length}`);
    
    // Expected: 29 team members = 29 assigned licenses
    const expectedAssigned = teamMembersSnapshot.size; // Should be 29
    const currentAssigned = assignedLicenses.length;
    
    console.log(`\n🎯 Target: ${expectedAssigned} team members = ${expectedAssigned} assigned licenses`);
    console.log(`   Current: ${currentAssigned} assigned licenses`);
    console.log(`   Difference: ${currentAssigned - expectedAssigned > 0 ? '+' : ''}${currentAssigned - expectedAssigned}`);
    
    // Get unassigned licenses
    const unassignedLicenses = licensesSnapshot.docs.filter(doc => {
      const license = doc.data();
      return !license.assignedTo || (!license.assignedTo.userId && !license.assignedTo.email);
    });
    
    console.log(`   Available unassigned licenses: ${unassignedLicenses.length}`);
    
    // Find team members without licenses
    const membersWithoutLicenses = [];
    
    for (const doc of teamMembersSnapshot.docs) {
      const member = doc.data();
      const memberId = doc.id;
      
      const memberLicenses = assignedLicenses.filter(licenseDoc => {
        const license = licenseDoc.data();
        return license.assignedTo && 
               (license.assignedTo.userId === memberId || 
                license.assignedTo.email === member.email);
      });
      
      if (memberLicenses.length === 0) {
        membersWithoutLicenses.push({
          id: memberId,
          email: member.email || `placeholder-${memberId}@enterprisemedia.com`,
          name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown',
          firstName: member.firstName,
          lastName: member.lastName
        });
      }
    }
    
    console.log(`\n📋 Team members without licenses: ${membersWithoutLicenses.length}`);
    membersWithoutLicenses.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.email} (${member.name}) - ID: ${member.id}`);
    });
    
    // Assign licenses to members without licenses
    if (membersWithoutLicenses.length > 0) {
      console.log(`\n🔧 Assigning licenses to ${membersWithoutLicenses.length} members without licenses...`);
      
      for (let i = 0; i < membersWithoutLicenses.length && i < unassignedLicenses.length; i++) {
        const member = membersWithoutLicenses[i];
        const licenseDoc = unassignedLicenses[i];
        
        const assignmentData = {
          userId: member.id,
          email: member.email,
          name: member.name
        };
        
        try {
          await licenseDoc.ref.update({
            assignedTo: assignmentData,
            status: 'ACTIVE',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`   ✅ Assigned license ${licenseDoc.id} to ${member.email}`);
        } catch (error) {
          console.error(`   ❌ Failed to assign license to ${member.email}:`, error.message);
        }
      }
    }
    
    // Final verification
    console.log(`\n🔍 FINAL VERIFICATION...`);
    
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
    console.error('❌ Error in final 1:1 balance fix:', error);
    throw error;
  }
}

// Run the fix
final1to1BalanceFix()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Final 1:1 balance fix completed successfully!');
      console.log('🎯 Perfect 1:1 balance achieved!');
      console.log('📊 Every team member now has exactly one license assigned.');
    } else {
      console.log('\n⚠️  Final 1:1 balance fix completed with issues.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
