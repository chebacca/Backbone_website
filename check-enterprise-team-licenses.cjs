const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function checkEnterpriseTeamLicenses() {
  console.log('🔍 CHECKING ENTERPRISE TEAM LICENSES');
  console.log('=====================================');
  
  try {
    const organizationId = 'enterprise-org-001';
    
    console.log(`\n1️⃣ ORGANIZATION: ${organizationId}`);
    
    // Get all team members for this organization
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`\n📊 Found ${teamMembersSnapshot.size} team members in organization`);
    
    // Get all licenses for this organization
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`📊 Found ${licensesSnapshot.size} licenses in organization`);
    
    // Check each team member's license status
    const teamMembers = [];
    const assignedLicenses = new Set();
    
    console.log(`\n2️⃣ TEAM MEMBER LICENSE STATUS:`);
    console.log('================================');
    
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
      
      const hasLicense = memberLicenses.length > 0;
      const licenseCount = memberLicenses.length;
      
      if (hasLicense) {
        memberLicenses.forEach(licenseDoc => {
          assignedLicenses.add(licenseDoc.id);
        });
      }
      
      teamMembers.push({
        id: memberId,
        name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown',
        email: member.email,
        role: member.role,
        hasLicense,
        licenseCount,
        licenseIds: memberLicenses.map(l => l.id)
      });
      
      console.log(`   ${hasLicense ? '✅' : '❌'} ${member.email}`);
      console.log(`      Name: ${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown');
      console.log(`      Role: ${member.role}`);
      console.log(`      Licenses: ${licenseCount}`);
      if (hasLicense) {
        console.log(`      License IDs: ${memberLicenses.map(l => l.id).join(', ')}`);
      }
      console.log('');
    }
    
    // Check unassigned licenses
    const unassignedLicenses = licensesSnapshot.docs.filter(licenseDoc => {
      const license = licenseDoc.data();
      return !license.assignedTo || (!license.assignedTo.userId && !license.assignedTo.email);
    });
    
    console.log(`\n3️⃣ LICENSE SUMMARY:`);
    console.log('==================');
    console.log(`Total Team Members: ${teamMembers.length}`);
    console.log(`Members with Licenses: ${teamMembers.filter(m => m.hasLicense).length}`);
    console.log(`Members without Licenses: ${teamMembers.filter(m => !m.hasLicense).length}`);
    console.log(`Total Licenses: ${licensesSnapshot.size}`);
    console.log(`Assigned Licenses: ${assignedLicenses.size}`);
    console.log(`Unassigned Licenses: ${unassignedLicenses.length}`);
    
    // Identify the 3 members without licenses
    const membersWithoutLicenses = teamMembers.filter(m => !m.hasLicense);
    
    console.log(`\n4️⃣ MEMBERS WITHOUT LICENSES:`);
    console.log('=============================');
    membersWithoutLicenses.forEach((member, index) => {
      console.log(`${index + 1}. ${member.email}`);
      console.log(`   Name: ${member.name}`);
      console.log(`   Role: ${member.role}`);
      console.log(`   ID: ${member.id}`);
      console.log('');
    });
    
    // Show some unassigned licenses that could be assigned
    console.log(`\n5️⃣ AVAILABLE LICENSES FOR ASSIGNMENT:`);
    console.log('=====================================');
    const availableLicenses = unassignedLicenses.slice(0, 5); // Show first 5
    availableLicenses.forEach((licenseDoc, index) => {
      const license = licenseDoc.data();
      console.log(`${index + 1}. License ID: ${licenseDoc.id}`);
      console.log(`   Name: ${license.name}`);
      console.log(`   Tier: ${license.tier}`);
      console.log(`   Status: ${license.status}`);
      console.log(`   Expires: ${license.expiresAt ? new Date(license.expiresAt.seconds * 1000).toLocaleDateString() : 'Unknown'}`);
      console.log('');
    });
    
    console.log(`\n🎯 RECOMMENDATIONS:`);
    console.log('===================');
    console.log(`1. Assign licenses to the ${membersWithoutLicenses.length} members without licenses`);
    console.log(`2. There are ${unassignedLicenses.length} available licenses to assign`);
    console.log(`3. Focus on the enterprise.user@enterprisemedia.com (owner) first`);
    
    return {
      teamMembers,
      membersWithoutLicenses,
      unassignedLicenses: unassignedLicenses.map(doc => ({ id: doc.id, ...doc.data() })),
      totalLicenses: licensesSnapshot.size,
      assignedLicenses: assignedLicenses.size
    };
    
  } catch (error) {
    console.error('❌ Error checking enterprise team licenses:', error);
    throw error;
  }
}

// Run the check
checkEnterpriseTeamLicenses()
  .then(result => {
    console.log('\n✅ Check completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
