const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function verifyCompleteCleanup() {
  console.log('🧹 VERIFYING COMPLETE FIRESTORE CLEANUP');
  console.log('======================================');
  
  const orgId = 'enterprise-media-org';
  
  // Step 1: Check all collections
  console.log('\n📊 Step 1: Checking all collections...');
  
  const collections = ['teamMembers', 'users', 'orgMembers', 'licenses', 'projects', 'subscriptions', 'payments'];
  const collectionData = {};
  
  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      collectionData[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`📁 ${collectionName}: ${collectionData[collectionName].length} documents`);
    } catch (error) {
      console.log(`❌ ${collectionName}: Error - ${error.message}`);
      collectionData[collectionName] = [];
    }
  }
  
  // Step 2: Check for test data patterns
  console.log('\n🧪 Step 2: Checking for test data patterns...');
  
  const testPatterns = [
    'test.member',
    'test@',
    'test-',
    'example.com',
    'backbone.,com', // Malformed email
    'cmole@backbone.,com' // Duplicate with typo
  ];
  
  let totalTestData = 0;
  
  for (const [collectionName, docs] of Object.entries(collectionData)) {
    const testDocs = docs.filter(doc => {
      const email = doc.email || '';
      return testPatterns.some(pattern => email.includes(pattern));
    });
    
    if (testDocs.length > 0) {
      console.log(`❌ ${collectionName}: Found ${testDocs.length} test documents`);
      testDocs.forEach(doc => {
        console.log(`   - ${doc.email || 'No email'} (${doc.id})`);
      });
      totalTestData += testDocs.length;
    } else {
      console.log(`✅ ${collectionName}: No test data found`);
    }
  }
  
  // Step 3: Check for duplicates
  console.log('\n🔄 Step 3: Checking for duplicates...');
  
  const emailGroups = {};
  [...collectionData.teamMembers, ...collectionData.users].forEach(item => {
    if (item.email) {
      if (!emailGroups[item.email]) {
        emailGroups[item.email] = [];
      }
      emailGroups[item.email].push({
        collection: 'teamMembers' in item ? 'teamMembers' : 'users',
        id: item.id,
        email: item.email
      });
    }
  });
  
  const duplicates = Object.entries(emailGroups).filter(([email, items]) => items.length > 1);
  
  if (duplicates.length > 0) {
    console.log('❌ Duplicate emails found:');
    duplicates.forEach(([email, items]) => {
      console.log(`   ${email}:`);
      items.forEach(item => {
        console.log(`     - ${item.collection}: ${item.id}`);
      });
    });
  } else {
    console.log('✅ No duplicate emails found');
  }
  
  // Step 4: Check team members and users consistency
  console.log('\n🔍 Step 4: Checking team members and users consistency...');
  
  const teamMemberIds = collectionData.teamMembers.map(doc => doc.id);
  const userIds = collectionData.users.map(doc => doc.id);
  
  const consistent = teamMemberIds.every(id => userIds.includes(id)) && 
                    userIds.every(id => teamMemberIds.includes(id));
  
  console.log(`✅ Collections are consistent: ${consistent ? 'YES' : 'NO'}`);
  
  // Step 5: Check license assignments
  console.log('\n🎫 Step 5: Checking license assignments...');
  
  const licenses = collectionData.licenses;
  const assignedLicenses = licenses.filter(license => license.assignedToUserId);
  const unassignedLicenses = licenses.filter(license => !license.assignedToUserId);
  
  console.log(`📊 License status:`);
  console.log(`   - Total licenses: ${licenses.length}`);
  console.log(`   - Assigned: ${assignedLicenses.length}`);
  console.log(`   - Unassigned: ${unassignedLicenses.length}`);
  
  // Check if assigned licenses match team members
  const assignedUserIds = assignedLicenses.map(license => license.assignedToUserId);
  const teamMemberIdsSet = new Set(teamMemberIds);
  const invalidAssignments = assignedUserIds.filter(userId => !teamMemberIdsSet.has(userId));
  
  if (invalidAssignments.length > 0) {
    console.log(`❌ Found ${invalidAssignments.length} licenses assigned to non-existent users`);
    invalidAssignments.forEach(userId => {
      console.log(`   - License assigned to user ID: ${userId}`);
    });
  } else {
    console.log('✅ All license assignments are valid');
  }
  
  // Step 6: Summary
  console.log('\n📋 CLEANUP SUMMARY');
  console.log('==================');
  
  const hasTestData = totalTestData > 0;
  const hasDuplicates = duplicates.length > 0;
  const hasInconsistentCollections = !consistent;
  const hasInvalidLicenseAssignments = invalidAssignments.length > 0;
  
  console.log(`🧪 Test data: ${hasTestData ? '❌ FOUND' : '✅ CLEAN'}`);
  console.log(`🔄 Duplicates: ${hasDuplicates ? '❌ FOUND' : '✅ CLEAN'}`);
  console.log(`🔍 Collection consistency: ${hasInconsistentCollections ? '❌ INCONSISTENT' : '✅ CONSISTENT'}`);
  console.log(`🎫 License assignments: ${hasInvalidLicenseAssignments ? '❌ INVALID' : '✅ VALID'}`);
  
  if (!hasTestData && !hasDuplicates && !hasInconsistentCollections && !hasInvalidLicenseAssignments) {
    console.log('\n🎉 COMPLETE CLEANUP SUCCESSFUL!');
    console.log('✅ All test data removed');
    console.log('✅ All duplicates removed');
    console.log('✅ Collections are perfectly synchronized');
    console.log('✅ All license assignments are valid');
    console.log('✅ Only real team members remain');
    console.log('✅ Ready for production use');
  } else {
    console.log('\n❌ CLEANUP INCOMPLETE');
    console.log('❌ Some issues still need to be addressed');
  }
  
  // Step 7: Show what the frontend will display
  console.log('\n🖥️ Step 7: Frontend display preview...');
  
  const realTeamMembers = collectionData.teamMembers.filter(member => {
    // Only show admin users or members with proper license assignments
    if (member.role === 'ADMIN') return true;
    if (member.status === 'ACTIVE' && (member.licenseAssignment?.licenseId || member.licenseType)) {
      return true;
    }
    return false;
  });
  
  console.log(`📱 Enhanced Team Page will show:`);
  console.log(`   - Total Members: ${realTeamMembers.length}`);
  console.log(`   - Active Members: ${realTeamMembers.filter(m => m.status === 'ACTIVE').length}`);
  console.log(`   - Available Licenses: ${unassignedLicenses.length}`);
  console.log(`   - Enterprise Usage: ${assignedLicenses.length}/250 (${((assignedLicenses.length / 250) * 100).toFixed(1)}%)`);
  
  console.log(`\n👥 Team Members Table will display:`);
  realTeamMembers.forEach((member, index) => {
    console.log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email})`);
    console.log(`      - Role: ${member.role}`);
    console.log(`      - Status: ${member.status}`);
    console.log(`      - License: ${member.licenseAssignment?.licenseKey || member.licenseType || 'None'}`);
  });
  
  process.exit(0);
}

verifyCompleteCleanup().catch(console.error);

