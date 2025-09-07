const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function ensurePerfect1to1Balance() {
  console.log('🔧 ENSURING PERFECT 1:1 BALANCE');
  console.log('================================');
  
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
    
    if (currentAssigned === expectedAssigned) {
      console.log(`\n✅ Perfect! Already have 1:1 balance (${currentAssigned} team members = ${currentAssigned} assigned licenses)`);
      
      // Verify each team member has exactly one license
      console.log(`\n🔍 Verifying each team member has exactly one license...`);
      let allMembersHaveLicenses = true;
      
      for (const doc of teamMembersSnapshot.docs) {
        const member = doc.data();
        const memberId = doc.id;
        
        const memberLicenses = assignedLicenses.filter(licenseDoc => {
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
        console.log(`\n🎉 Perfect 1:1 balance verified! Every team member has exactly one license.`);
        return { success: true, message: 'Perfect 1:1 balance achieved' };
      } else {
        console.log(`\n⚠️  Balance issue detected. Need to fix individual assignments.`);
      }
    }
    
    // If we need to fix the balance
    if (currentAssigned > expectedAssigned) {
      console.log(`\n🔧 Need to unassign ${currentAssigned - expectedAssigned} extra license(s)`);
      
      // Get team members and their license counts
      const memberLicenseCounts = new Map();
      
      for (const doc of teamMembersSnapshot.docs) {
        const member = doc.data();
        const memberId = doc.id;
        
        const memberLicenses = assignedLicenses.filter(licenseDoc => {
          const license = licenseDoc.data();
          return license.assignedTo && 
                 (license.assignedTo.userId === memberId || 
                  license.assignedTo.email === member.email);
        });
        
        memberLicenseCounts.set(memberId, {
          email: member.email,
          name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown',
          licenses: memberLicenses
        });
      }
      
      // Find members with multiple licenses and unassign extras
      let unassignedCount = 0;
      for (const [memberId, data] of memberLicenseCounts) {
        if (data.licenses.length > 1) {
          const extras = data.licenses.slice(1); // Keep first, unassign rest
          console.log(`   ${data.email || memberId} has ${data.licenses.length} licenses, unassigning ${extras.length} extra(s)`);
          
          for (const licenseDoc of extras) {
            try {
              await licenseDoc.ref.update({
                assignedTo: null,
                status: 'PENDING',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              unassignedCount++;
              console.log(`     ✅ Unassigned ${licenseDoc.id}`);
            } catch (error) {
              console.error(`     ❌ Failed to unassign ${licenseDoc.id}:`, error.message);
            }
          }
        }
      }
      
      console.log(`   Unassigned ${unassignedCount} extra licenses`);
      
    } else if (currentAssigned < expectedAssigned) {
      console.log(`\n🔧 Need to assign ${expectedAssigned - currentAssigned} more license(s)`);
      
      // Get unassigned licenses
      const unassignedLicenses = licensesSnapshot.docs.filter(doc => {
        const license = doc.data();
        return !license.assignedTo || (!license.assignedTo.userId && !license.assignedTo.email);
      });
      
      if (unassignedLicenses.length < (expectedAssigned - currentAssigned)) {
        console.log(`❌ Not enough unassigned licenses! Need ${expectedAssigned - currentAssigned}, have ${unassignedLicenses.length}`);
        return { success: false, message: 'Not enough unassigned licenses' };
      }
      
      // Get team members without licenses
      const membersWithoutLicenses = [];
      for (const doc of teamMembersSnapshot.docs) {
        const member = doc.data();
        const memberId = doc.id;
        
        const hasLicense = assignedLicenses.some(licenseDoc => {
          const license = licenseDoc.data();
          return license.assignedTo && 
                 (license.assignedTo.userId === memberId || 
                  license.assignedTo.email === member.email);
        });
        
        if (!hasLicense) {
          membersWithoutLicenses.push({
            id: memberId,
            email: member.email || `placeholder-${memberId}@enterprisemedia.com`,
            name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown',
            firstName: member.firstName,
            lastName: member.lastName
          });
        }
      }
      
      console.log(`   Found ${membersWithoutLicenses.length} members without licenses`);
      
      // Assign licenses to members without licenses
      const neededAssignments = expectedAssigned - currentAssigned;
      for (let i = 0; i < neededAssignments && i < membersWithoutLicenses.length; i++) {
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
    console.error('❌ Error ensuring perfect 1:1 balance:', error);
    throw error;
  }
}

// Run the fix
ensurePerfect1to1Balance()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Perfect 1:1 balance fix completed successfully!');
      console.log('🎯 Every team member now has exactly one license assigned.');
    } else {
      console.log('\n⚠️  Perfect 1:1 balance fix completed with issues.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
