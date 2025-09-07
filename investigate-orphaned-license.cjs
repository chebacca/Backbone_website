const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function investigateOrphanedLicense() {
  console.log('🔍 INVESTIGATING ORPHANED LICENSE');
  console.log('=================================');
  
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
    
    // Get assigned licenses
    const assignedLicenses = licensesSnapshot.docs.filter(doc => {
      const license = doc.data();
      return license.assignedTo && (license.assignedTo.userId || license.assignedTo.email);
    });
    
    console.log(`   Assigned Licenses: ${assignedLicenses.length}`);
    
    // Create a map of team member IDs and emails for quick lookup
    const teamMemberMap = new Map();
    const teamMemberEmails = new Set();
    
    for (const doc of teamMembersSnapshot.docs) {
      const member = doc.data();
      teamMemberMap.set(doc.id, member);
      if (member.email) {
        teamMemberEmails.add(member.email.toLowerCase());
      }
    }
    
    console.log(`\n🔍 Checking each assigned license for valid team member...`);
    
    const orphanedLicenses = [];
    const validLicenses = [];
    
    for (const licenseDoc of assignedLicenses) {
      const license = licenseDoc.data();
      const assignedTo = license.assignedTo;
      
      let isValid = false;
      let reason = '';
      
      // Check by userId
      if (assignedTo.userId && teamMemberMap.has(assignedTo.userId)) {
        isValid = true;
        reason = `Valid team member by ID: ${assignedTo.userId}`;
      }
      // Check by email
      else if (assignedTo.email && teamMemberEmails.has(assignedTo.email.toLowerCase())) {
        isValid = true;
        reason = `Valid team member by email: ${assignedTo.email}`;
      }
      // Check if it's a placeholder email
      else if (assignedTo.email && assignedTo.email.includes('placeholder-')) {
        // This is a placeholder email we created, check if the userId exists
        if (assignedTo.userId && teamMemberMap.has(assignedTo.userId)) {
          isValid = true;
          reason = `Valid team member with placeholder email: ${assignedTo.userId}`;
        } else {
          isValid = false;
          reason = `Placeholder email but invalid userId: ${assignedTo.userId}`;
        }
      }
      else {
        isValid = false;
        reason = `No matching team member found for userId: ${assignedTo.userId}, email: ${assignedTo.email}`;
      }
      
      if (isValid) {
        validLicenses.push({
          licenseId: licenseDoc.id,
          assignedTo: assignedTo,
          reason: reason
        });
      } else {
        orphanedLicenses.push({
          licenseId: licenseDoc.id,
          assignedTo: assignedTo,
          reason: reason
        });
      }
    }
    
    console.log(`\n📊 ANALYSIS RESULTS:`);
    console.log(`   Valid Licenses: ${validLicenses.length}`);
    console.log(`   Orphaned Licenses: ${orphanedLicenses.length}`);
    
    if (orphanedLicenses.length > 0) {
      console.log(`\n❌ ORPHANED LICENSES (assigned to non-existent team members):`);
      orphanedLicenses.forEach((license, index) => {
        console.log(`   ${index + 1}. License ID: ${license.licenseId}`);
        console.log(`      Assigned to: ${license.assignedTo.email || 'No email'} (ID: ${license.assignedTo.userId || 'No ID'})`);
        console.log(`      Reason: ${license.reason}`);
        console.log('');
      });
    }
    
    if (validLicenses.length > 0) {
      console.log(`\n✅ VALID LICENSES (assigned to existing team members):`);
      validLicenses.forEach((license, index) => {
        console.log(`   ${index + 1}. License ID: ${license.licenseId}`);
        console.log(`      Assigned to: ${license.assignedTo.email || 'No email'} (ID: ${license.assignedTo.userId || 'No ID'})`);
        console.log(`      Reason: ${license.reason}`);
        console.log('');
      });
    }
    
    // Check if we have the right balance
    const expectedAssigned = teamMembersSnapshot.size; // Should be 28
    const currentAssigned = assignedLicenses.length; // Currently 29
    
    console.log(`\n🎯 BALANCE CHECK:`);
    console.log(`   Expected assigned licenses: ${expectedAssigned} (1 per team member)`);
    console.log(`   Current assigned licenses: ${currentAssigned}`);
    console.log(`   Difference: ${currentAssigned - expectedAssigned} extra license(s)`);
    
    if (orphanedLicenses.length > 0) {
      console.log(`\n🔧 RECOMMENDATION:`);
      console.log(`   Unassign ${orphanedLicenses.length} orphaned license(s) to achieve perfect 1:1 balance`);
      
      return {
        success: false,
        orphanedLicenses,
        validLicenses,
        teamMembers: teamMembersSnapshot.size,
        assignedLicenses: assignedLicenses.length,
        needsFix: true
      };
    } else {
      console.log(`\n✅ All assigned licenses are valid!`);
      return {
        success: true,
        orphanedLicenses: [],
        validLicenses,
        teamMembers: teamMembersSnapshot.size,
        assignedLicenses: assignedLicenses.length,
        needsFix: false
      };
    }
    
  } catch (error) {
    console.error('❌ Error investigating orphaned license:', error);
    throw error;
  }
}

// Run the investigation
investigateOrphanedLicense()
  .then(result => {
    if (result.needsFix) {
      console.log('\n⚠️  Investigation completed - orphaned licenses found that need to be fixed');
    } else {
      console.log('\n✅ Investigation completed - all licenses are valid');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Investigation failed:', error);
    process.exit(1);
  });
