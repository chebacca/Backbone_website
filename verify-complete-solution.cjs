const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function verifyCompleteSolution() {
  console.log('🎯 VERIFYING COMPLETE SOLUTION');
  console.log('===============================');
  console.log('Checking: Enterprise User Dual Organization Fix');
  console.log('');
  
  try {
    const enterpriseEmail = 'enterprise.user@enterprisemedia.com';
    const orgId = 'enterprise-media-org';
    
    // Step 1: Verify enterprise user organization
    console.log('👤 Step 1: Verifying enterprise user organization...');
    
    const enterpriseUserSnapshot = await db.collection('users')
      .where('email', '==', enterpriseEmail)
      .get();
    
    if (!enterpriseUserSnapshot.empty) {
      const enterpriseUser = enterpriseUserSnapshot.docs[0].data();
      console.log(`✅ Enterprise User Organization: ${enterpriseUser.organizationId}`);
      console.log(`   Expected: ${orgId}`);
      console.log(`   Match: ${enterpriseUser.organizationId === orgId ? '✅' : '❌'}`);
    } else {
      console.log('❌ Enterprise user not found in users collection');
    }
    
    // Step 2: Verify licenses in correct organization
    console.log('\n🎫 Step 2: Verifying licenses in correct organization...');
    
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    const activeLicenses = licensesSnapshot.docs.filter(doc => 
      doc.data().status === 'ACTIVE'
    );
    const unassignedLicenses = activeLicenses.filter(doc => {
      const data = doc.data();
      return !data.assignedToUserId || data.assignedToUserId === null;
    });
    
    console.log(`📊 License Status:`);
    console.log(`   - Total Licenses: ${licensesSnapshot.size}`);
    console.log(`   - Active Licenses: ${activeLicenses.length}`);
    console.log(`   - Unassigned Licenses: ${unassignedLicenses.length}`);
    console.log(`   - Assigned Licenses: ${activeLicenses.length - unassignedLicenses.length}`);
    
    // Show license details
    console.log(`\n🎫 License Details:`);
    licensesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.key || 'NO KEY'} (${data.tier})`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Assigned To: ${data.assignedToEmail || 'None'}`);
    });
    
    // Step 3: Verify team members in correct organization
    console.log('\n👥 Step 3: Verifying team members in correct organization...');
    
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', orgId)
      .get();
    
    const activeTeamMembers = teamMembersSnapshot.docs.filter(doc => 
      doc.data().status === 'ACTIVE'
    );
    const pendingTeamMembers = teamMembersSnapshot.docs.filter(doc => 
      doc.data().status === 'PENDING'
    );
    
    console.log(`📊 Team Member Status:`);
    console.log(`   - Total Team Members: ${teamMembersSnapshot.size}`);
    console.log(`   - Active Team Members: ${activeTeamMembers.length}`);
    console.log(`   - Pending Team Members: ${pendingTeamMembers.length}`);
    
    // Show team member details
    console.log(`\n👥 Team Member Details:`);
    teamMembersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.firstName} ${data.lastName} (${data.email})`);
      console.log(`      Status: ${data.status}`);
      console.log(`      License: ${data.assignedLicenseKey || 'None'}`);
      console.log(`      Department: ${data.department || 'Not specified'}`);
    });
    
    // Step 4: Verify Chris Mole specifically
    console.log('\n🎯 Step 4: Verifying Chris Mole specifically...');
    
    const cmoleSnapshot = await db.collection('teamMembers')
      .where('email', '==', 'cmole@backbone.com')
      .where('organizationId', '==', orgId)
      .get();
    
    if (!cmoleSnapshot.empty) {
      const cmoleData = cmoleSnapshot.docs[0].data();
      console.log(`✅ Chris Mole Status:`);
      console.log(`   - Name: ${cmoleData.firstName} ${cmoleData.lastName}`);
      console.log(`   - Email: ${cmoleData.email}`);
      console.log(`   - Status: ${cmoleData.status}`);
      console.log(`   - License: ${cmoleData.assignedLicenseKey || 'None'}`);
      console.log(`   - Department: ${cmoleData.department}`);
      
      if (cmoleData.status === 'ACTIVE' && cmoleData.assignedLicenseKey) {
        console.log(`   ✅ Chris Mole is properly set up with license`);
      } else {
        console.log(`   ❌ Chris Mole needs attention`);
      }
    } else {
      console.log('❌ Chris Mole not found');
    }
    
    // Step 5: Check for data in old organization (should be empty)
    console.log('\n🔍 Step 5: Checking old organization (should be empty)...');
    
    const oldOrgLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', 'enterprise-org-001')
      .get();
    
    const oldOrgTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', 'enterprise-org-001')
      .get();
    
    console.log(`📊 Old Organization (enterprise-org-001):`);
    console.log(`   - Licenses: ${oldOrgLicensesSnapshot.size} (should be 0)`);
    console.log(`   - Team Members: ${oldOrgTeamMembersSnapshot.size} (should be 0)`);
    
    // Step 6: Summary
    console.log('\n📋 SOLUTION VERIFICATION SUMMARY');
    console.log('==================================');
    
    const issues = [];
    
    if (enterpriseUserSnapshot.empty || enterpriseUserSnapshot.docs[0].data().organizationId !== orgId) {
      issues.push('Enterprise user organization not updated');
    }
    
    if (licensesSnapshot.size === 0) {
      issues.push('No licenses found in correct organization');
    }
    
    if (teamMembersSnapshot.size === 0) {
      issues.push('No team members found in correct organization');
    }
    
    if (cmoleSnapshot.empty || cmoleSnapshot.docs[0].data().status !== 'ACTIVE') {
      issues.push('Chris Mole not properly set up');
    }
    
    if (oldOrgLicensesSnapshot.size > 0 || oldOrgTeamMembersSnapshot.size > 0) {
      issues.push('Old organization still has data (migration incomplete)');
    }
    
    if (issues.length === 0) {
      console.log('🎉 ALL CHECKS PASSED!');
      console.log('✅ Enterprise user organization: CORRECT');
      console.log('✅ Licenses in correct organization: YES');
      console.log('✅ Team members in correct organization: YES');
      console.log('✅ Chris Mole properly set up: YES');
      console.log('✅ Old organization cleaned: YES');
      console.log('');
      console.log('🚀 FRONTEND SHOULD NOW SHOW CORRECT DATA!');
      console.log('   - License page will show all licenses');
      console.log('   - Team page will show all team members');
      console.log('   - License purchase will work correctly');
      console.log('   - Team member creation will consume licenses');
    } else {
      console.log('❌ ISSUES FOUND:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
  
  process.exit(0);
}

verifyCompleteSolution().catch(console.error);

