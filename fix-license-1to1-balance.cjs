const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixLicense1to1Balance() {
  console.log('🔧 FIXING LICENSE 1:1 BALANCE');
  console.log('==============================');
  
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
    
    // Check if we have the correct 1:1 balance
    const expectedAssigned = teamMembersSnapshot.size; // Should be 29
    const currentAssigned = assignedLicenses.length;
    
    if (currentAssigned === expectedAssigned) {
      console.log(`\n✅ Perfect! Already have 1:1 balance (${currentAssigned} team members = ${currentAssigned} assigned licenses)`);
      return;
    }
    
    if (currentAssigned > expectedAssigned) {
      console.log(`\n🔧 Need to unassign ${currentAssigned - expectedAssigned} extra license(s)`);
      
      // Get the extra assigned licenses (beyond what we need)
      const extraLicenses = assignedLicenses.slice(expectedAssigned);
      
      console.log(`\n📋 Extra licenses to unassign:`);
      extraLicenses.forEach((licenseDoc, index) => {
        const license = licenseDoc.data();
        console.log(`${index + 1}. ${licenseDoc.id} - assigned to ${license.assignedTo?.email || license.assignedTo?.name || 'Unknown'}`);
      });
      
      // Unassign the extra licenses
      for (const licenseDoc of extraLicenses) {
        try {
          await licenseDoc.ref.update({
            assignedTo: null,
            status: 'PENDING', // Reset to pending since it's unassigned
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`   ✅ Unassigned license ${licenseDoc.id}`);
        } catch (error) {
          console.error(`   ❌ Failed to unassign license ${licenseDoc.id}:`, error.message);
        }
      }
      
    } else if (currentAssigned < expectedAssigned) {
      console.log(`\n🔧 Need to assign ${expectedAssigned - currentAssigned} more license(s)`);
      
      // Get unassigned licenses
      const unassignedLicenses = licensesSnapshot.docs.filter(doc => {
        const license = doc.data();
        return !license.assignedTo || (!license.assignedTo.userId && !license.assignedTo.email);
      });
      
      if (unassignedLicenses.length < (expectedAssigned - currentAssigned)) {
        console.log(`❌ Not enough unassigned licenses! Need ${expectedAssigned - currentAssigned}, have ${unassignedLicenses.length}`);
        return;
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
      
      console.log(`\n📋 Team members needing licenses:`);
      membersWithoutLicenses.forEach((member, index) => {
        console.log(`${index + 1}. ${member.email} (${member.name})`);
      });
      
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
    
    // Verify the final state
    console.log(`\n🔍 VERIFYING FINAL STATE...`);
    const finalSnapshot = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    const finalAssigned = finalSnapshot.docs.filter(doc => {
      const license = doc.data();
      return license.assignedTo && (license.assignedTo.userId || license.assignedTo.email);
    }).length;
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`   Team Members: ${teamMembersSnapshot.size}`);
    console.log(`   Assigned Licenses: ${finalAssigned}`);
    console.log(`   Unassigned Licenses: ${finalSnapshot.size - finalAssigned}`);
    console.log(`   Balance: ${finalAssigned === teamMembersSnapshot.size ? '✅ PERFECT 1:1' : '❌ UNBALANCED'}`);
    
    if (finalAssigned === teamMembersSnapshot.size) {
      console.log(`\n🎉 Successfully achieved 1:1 balance!`);
    } else {
      console.log(`\n⚠️  Still not balanced. Manual intervention may be needed.`);
    }
    
    return {
      success: finalAssigned === teamMembersSnapshot.size,
      teamMembers: teamMembersSnapshot.size,
      assignedLicenses: finalAssigned,
      unassignedLicenses: finalSnapshot.size - finalAssigned
    };
    
  } catch (error) {
    console.error('❌ Error fixing license 1:1 balance:', error);
    throw error;
  }
}

// Run the fix
fixLicense1to1Balance()
  .then(result => {
    if (result.success) {
      console.log('\n✅ License 1:1 balance fix completed successfully!');
    } else {
      console.log('\n⚠️  License 1:1 balance fix completed with issues.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
