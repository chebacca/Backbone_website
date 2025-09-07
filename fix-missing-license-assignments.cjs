const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixMissingLicenseAssignments() {
  console.log('🔧 FIXING MISSING LICENSE ASSIGNMENTS');
  console.log('=====================================');
  
  try {
    const organizationId = 'enterprise-org-001';
    
    // Get team members without licenses
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    
    // Get unassigned licenses
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    const unassignedLicenses = licensesSnapshot.docs.filter(licenseDoc => {
      const license = licenseDoc.data();
      return !license.assignedTo || (!license.assignedTo.userId && !license.assignedTo.email);
    });
    
    console.log(`\n📊 Found ${teamMembersSnapshot.size} team members`);
    console.log(`📊 Found ${unassignedLicenses.length} unassigned licenses`);
    
    // Identify members without licenses
    const membersWithoutLicenses = [];
    
    for (const doc of teamMembersSnapshot.docs) {
      const member = doc.data();
      const memberId = doc.id;
      
      // Check if this member has any licenses assigned
      const memberLicenses = licensesSnapshot.docs.filter(licenseDoc => {
        const license = licenseDoc.data();
        return license.assignedTo && 
               (license.assignedTo.userId === memberId || 
                license.assignedTo.email === member.email);
      });
      
      if (memberLicenses.length === 0) {
        membersWithoutLicenses.push({
          id: memberId,
          name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown',
          email: member.email,
          role: member.role,
          firstName: member.firstName,
          lastName: member.lastName
        });
      }
    }
    
    console.log(`\n🎯 Found ${membersWithoutLicenses.length} members without licenses:`);
    membersWithoutLicenses.forEach((member, index) => {
      console.log(`${index + 1}. ${member.email} (${member.name}) - ${member.role}`);
    });
    
    if (membersWithoutLicenses.length === 0) {
      console.log('\n✅ All team members already have licenses assigned!');
      return;
    }
    
    if (unassignedLicenses.length < membersWithoutLicenses.length) {
      console.log(`\n❌ Not enough unassigned licenses! Need ${membersWithoutLicenses.length}, have ${unassignedLicenses.length}`);
      return;
    }
    
    console.log(`\n🔧 Assigning licenses to ${membersWithoutLicenses.length} members...`);
    
    // Assign licenses to members without licenses
    const assignments = [];
    
    for (let i = 0; i < membersWithoutLicenses.length; i++) {
      const member = membersWithoutLicenses[i];
      const licenseDoc = unassignedLicenses[i];
      const license = licenseDoc.data();
      
      const assignmentData = {
        userId: member.id,
        email: member.email,
        name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown User'
      };
      
      try {
        // Update the license with assignment
        await licenseDoc.ref.update({
          assignedTo: assignmentData,
          status: 'ACTIVE', // Activate the license
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        assignments.push({
          member: member.email,
          licenseId: licenseDoc.id,
          licenseName: license.name || `License ${licenseDoc.id}`
        });
        
        console.log(`   ✅ Assigned license ${licenseDoc.id} to ${member.email}`);
        
      } catch (error) {
        console.error(`   ❌ Failed to assign license to ${member.email}:`, error.message);
      }
    }
    
    console.log(`\n📊 ASSIGNMENT SUMMARY:`);
    console.log('=====================');
    console.log(`Successfully assigned: ${assignments.length} licenses`);
    console.log(`Remaining unassigned: ${unassignedLicenses.length - assignments.length} licenses`);
    
    if (assignments.length > 0) {
      console.log(`\n✅ ASSIGNMENTS COMPLETED:`);
      assignments.forEach((assignment, index) => {
        console.log(`${index + 1}. ${assignment.member} → ${assignment.licenseName} (${assignment.licenseId})`);
      });
    }
    
    // Verify the assignments
    console.log(`\n🔍 VERIFYING ASSIGNMENTS...`);
    const verifySnapshot = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    const assignedCount = verifySnapshot.docs.filter(doc => {
      const license = doc.data();
      return license.assignedTo && (license.assignedTo.userId || license.assignedTo.email);
    }).length;
    
    console.log(`✅ Verification: ${assignedCount} licenses are now assigned`);
    console.log(`✅ Verification: ${verifySnapshot.size - assignedCount} licenses remain unassigned`);
    
    return {
      success: true,
      assignments,
      totalAssigned: assignedCount,
      totalUnassigned: verifySnapshot.size - assignedCount
    };
    
  } catch (error) {
    console.error('❌ Error fixing license assignments:', error);
    throw error;
  }
}

// Run the fix
fixMissingLicenseAssignments()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 License assignment fix completed successfully!');
      console.log(`📊 Final stats: ${result.totalAssigned} assigned, ${result.totalUnassigned} unassigned`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
