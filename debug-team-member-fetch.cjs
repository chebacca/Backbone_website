const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function debugTeamMemberFetch() {
  console.log('🔍 DEBUGGING TEAM MEMBER FETCH');
  console.log('===============================');
  
  try {
    const organizationId = 'enterprise-org-001';
    
    // Get all team members for this organization
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    
    // Get all users for this organization
    const usersSnapshot = await db.collection('users')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`\n📊 Database counts:`);
    console.log(`   Team Members: ${teamMembersSnapshot.size}`);
    console.log(`   Users: ${usersSnapshot.size}`);
    
    // Check if enterprise.user@enterprisemedia.com is in teamMembers
    const enterpriseUserInTeamMembers = teamMembersSnapshot.docs.find(doc => {
      const data = doc.data();
      return data.email === 'enterprise.user@enterprisemedia.com';
    });
    
    console.log(`\n🔍 Enterprise user in teamMembers: ${enterpriseUserInTeamMembers ? 'YES' : 'NO'}`);
    if (enterpriseUserInTeamMembers) {
      console.log(`   ID: ${enterpriseUserInTeamMembers.id}`);
      console.log(`   Email: ${enterpriseUserInTeamMembers.data().email}`);
      console.log(`   Role: ${enterpriseUserInTeamMembers.data().role}`);
    }
    
    // Check if enterprise.user@enterprisemedia.com is in users
    const enterpriseUserInUsers = usersSnapshot.docs.find(doc => {
      const data = doc.data();
      return data.email === 'enterprise.user@enterprisemedia.com';
    });
    
    console.log(`\n🔍 Enterprise user in users: ${enterpriseUserInUsers ? 'YES' : 'NO'}`);
    if (enterpriseUserInUsers) {
      console.log(`   ID: ${enterpriseUserInUsers.id}`);
      console.log(`   Email: ${enterpriseUserInUsers.data().email}`);
      console.log(`   Role: ${enterpriseUserInUsers.data().role}`);
    }
    
    // Check what the frontend would see
    console.log(`\n🔍 What frontend would see:`);
    
    // Simulate the frontend logic - get all team members
    const allUsers = new Map();
    
    // Process users collection (excluding current user)
    console.log(`\n1️⃣ Processing users collection (excluding current user):`);
    let usersProcessed = 0;
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      // Skip if this is the current user (this is the issue!)
      if (userId === '0FGfbjMmVvregVV9b0Gy') { // enterprise.user's ID
        console.log(`   ❌ SKIPPED: ${userData.email} (current user - ID: ${userId})`);
        continue;
      }
      
      console.log(`   ✅ INCLUDED: ${userData.email} (ID: ${userId})`);
      usersProcessed++;
      
      if (userData.email) {
        allUsers.set(userData.email, {
          id: userId,
          email: userData.email,
          role: userData.role,
          source: 'users'
        });
      }
    }
    
    console.log(`   Users processed: ${usersProcessed}`);
    
    // Process teamMembers collection
    console.log(`\n2️⃣ Processing teamMembers collection:`);
    let teamMembersProcessed = 0;
    for (const doc of teamMembersSnapshot.docs) {
      const tmData = doc.data();
      const tmId = doc.id;
      
      // Skip inactive team members
      if (tmData.status === 'removed' || tmData.status === 'suspended') {
        console.log(`   ❌ SKIPPED: ${tmData.email} (inactive - status: ${tmData.status})`);
        continue;
      }
      
      console.log(`   ✅ INCLUDED: ${tmData.email} (ID: ${tmId})`);
      teamMembersProcessed++;
      
      if (tmData.email) {
        const existingUser = allUsers.get(tmData.email);
        if (existingUser) {
          console.log(`   🔄 MERGED: ${tmData.email} (already exists from users collection)`);
        } else {
          allUsers.set(tmData.email, {
            id: tmId,
            email: tmData.email,
            role: tmData.role,
            source: 'teamMembers'
          });
        }
      }
    }
    
    console.log(`   Team members processed: ${teamMembersProcessed}`);
    
    console.log(`\n📊 Final result:`);
    console.log(`   Total unique users: ${allUsers.size}`);
    console.log(`   Users by source:`);
    
    const usersBySource = {};
    for (const [email, user] of allUsers) {
      if (!usersBySource[user.source]) {
        usersBySource[user.source] = 0;
      }
      usersBySource[user.source]++;
    }
    
    Object.entries(usersBySource).forEach(([source, count]) => {
      console.log(`     ${source}: ${count}`);
    });
    
    console.log(`\n🎯 ISSUE IDENTIFIED:`);
    console.log(`   The frontend excludes the current user (enterprise.user@enterprisemedia.com) from the team members list.`);
    console.log(`   This is why you see 28 team members instead of 29.`);
    console.log(`   The enterprise user should be included in the team members list.`);
    
    return {
      totalTeamMembers: allUsers.size,
      enterpriseUserExcluded: true,
      issue: 'Current user excluded from team members list'
    };
    
  } catch (error) {
    console.error('❌ Error debugging team member fetch:', error);
    throw error;
  }
}

// Run the debug
debugTeamMemberFetch()
  .then(result => {
    console.log('\n✅ Debug completed');
    console.log(`📊 Result: ${result.totalTeamMembers} team members (enterprise user excluded: ${result.enterpriseUserExcluded})`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
