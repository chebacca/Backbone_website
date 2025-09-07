const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function assignFinalLicense() {
  console.log('🔧 ASSIGNING FINAL LICENSE FOR 1:1 BALANCE');
  console.log('==========================================');
  
  try {
    const organizationId = 'enterprise-org-001';
    
    // Get the specific team member without a license
    const teamMemberId = 'user-1756877374588-2vz55tz0y';
    const teamMemberDoc = await db.collection('teamMembers').doc(teamMemberId).get();
    
    if (!teamMemberDoc.exists) {
      console.log('❌ Team member not found');
      return;
    }
    
    const member = teamMemberDoc.data();
    console.log(`\n📋 Team member to assign license:`);
    console.log(`   ID: ${teamMemberId}`);
    console.log(`   Email: ${member.email || 'undefined'}`);
    console.log(`   Name: ${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown');
    console.log(`   Role: ${member.role}`);
    
    // Get an available license
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    const unassignedLicense = licensesSnapshot.docs.find(doc => {
      const license = doc.data();
      return !license.assignedTo || (!license.assignedTo.userId && !license.assignedTo.email);
    });
    
    if (!unassignedLicense) {
      console.log('❌ No unassigned licenses available');
      return;
    }
    
    const license = unassignedLicense.data();
    console.log(`\n📋 License to assign:`);
    console.log(`   ID: ${unassignedLicense.id}`);
    console.log(`   Name: ${license.name || 'undefined'}`);
    console.log(`   Tier: ${license.tier}`);
    console.log(`   Status: ${license.status}`);
    
    // Create assignment data
    const assignmentData = {
      userId: teamMemberId,
      email: member.email || `placeholder-${teamMemberId}@enterprisemedia.com`,
      name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || `User ${teamMemberId}`
    };
    
    console.log(`\n🔧 Assigning license...`);
    
    try {
      await unassignedLicense.ref.update({
        assignedTo: assignmentData,
        status: 'ACTIVE',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Successfully assigned license ${unassignedLicense.id} to team member ${teamMemberId}`);
      
    } catch (error) {
      console.error(`❌ Failed to assign license:`, error.message);
      return;
    }
    
    // Verify the final state
    console.log(`\n🔍 VERIFYING FINAL 1:1 BALANCE...`);
    
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
    
    if (finalAssigned === finalTeamMembersSnapshot.size) {
      console.log(`\n🎉 Perfect 1:1 balance achieved!`);
      console.log(`   Every team member now has exactly one license assigned.`);
    } else {
      console.log(`\n⚠️  Still not balanced. Manual intervention may be needed.`);
    }
    
    return {
      success: finalAssigned === finalTeamMembersSnapshot.size,
      teamMembers: finalTeamMembersSnapshot.size,
      assignedLicenses: finalAssigned,
      unassignedLicenses: finalLicensesSnapshot.size - finalAssigned
    };
    
  } catch (error) {
    console.error('❌ Error assigning final license:', error);
    throw error;
  }
}

// Run the assignment
assignFinalLicense()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Final license assignment completed successfully!');
      console.log('🎯 Perfect 1:1 balance achieved!');
    } else {
      console.log('\n⚠️  Final license assignment completed with issues.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Assignment failed:', error);
    process.exit(1);
  });
