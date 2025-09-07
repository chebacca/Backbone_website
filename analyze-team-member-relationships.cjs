const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function analyzeTeamMemberRelationships() {
  console.log('🔍 ANALYZING TEAM MEMBER RELATIONSHIPS');
  console.log('======================================');
  
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
    
    // Create maps for analysis
    const teamMembersByEmail = new Map();
    const usersByEmail = new Map();
    const teamMembersById = new Map();
    const usersById = new Map();
    
    // Process team members
    console.log(`\n🔍 TEAM MEMBERS COLLECTION:`);
    for (const doc of teamMembersSnapshot.docs) {
      const data = doc.data();
      const id = doc.id;
      const email = data.email;
      
      teamMembersById.set(id, { id, email, role: data.role, name: data.name });
      
      if (email) {
        teamMembersByEmail.set(email, { id, email, role: data.role, name: data.name });
        console.log(`   ${email} (ID: ${id}) - Role: ${data.role}`);
      } else {
        console.log(`   No email (ID: ${id}) - Role: ${data.role}`);
      }
    }
    
    // Process users
    console.log(`\n🔍 USERS COLLECTION:`);
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const id = doc.id;
      const email = data.email;
      
      usersById.set(id, { id, email, role: data.role, name: data.name });
      
      if (email) {
        usersByEmail.set(email, { id, email, role: data.role, name: data.name });
        console.log(`   ${email} (ID: ${id}) - Role: ${data.role}`);
      } else {
        console.log(`   No email (ID: ${id}) - Role: ${data.role}`);
      }
    }
    
    // Find relationships
    console.log(`\n🔗 RELATIONSHIP ANALYSIS:`);
    
    // Find team members that have matching users by email
    const emailMatches = [];
    for (const [email, teamMember] of teamMembersByEmail) {
      if (usersByEmail.has(email)) {
        const user = usersByEmail.get(email);
        emailMatches.push({
          email,
          teamMemberId: teamMember.id,
          userId: user.id,
          teamMemberRole: teamMember.role,
          userRole: user.role
        });
      }
    }
    
    console.log(`   Email matches: ${emailMatches.length}`);
    emailMatches.forEach(match => {
      console.log(`     ${match.email}: TM(${match.teamMemberId}) <-> User(${match.userId})`);
      console.log(`       TM Role: ${match.teamMemberRole}, User Role: ${match.userRole}`);
    });
    
    // Find team members without email matches
    const teamMembersWithoutEmailMatches = [];
    for (const [email, teamMember] of teamMembersByEmail) {
      if (!usersByEmail.has(email)) {
        teamMembersWithoutEmailMatches.push(teamMember);
      }
    }
    
    console.log(`\n   Team members without email matches: ${teamMembersWithoutEmailMatches.length}`);
    teamMembersWithoutEmailMatches.forEach(tm => {
      console.log(`     ${tm.email} (ID: ${tm.id}) - Role: ${tm.role}`);
    });
    
    // Find team members with undefined emails
    const teamMembersWithUndefinedEmail = [];
    for (const [id, teamMember] of teamMembersById) {
      if (!teamMember.email) {
        teamMembersWithUndefinedEmail.push(teamMember);
      }
    }
    
    console.log(`\n   Team members with undefined email: ${teamMembersWithUndefinedEmail.length}`);
    teamMembersWithUndefinedEmail.forEach(tm => {
      console.log(`     No email (ID: ${tm.id}) - Role: ${tm.role}`);
    });
    
    // Calculate what the frontend should show
    console.log(`\n📊 FRONTEND CALCULATION:`);
    
    // Start with users collection (including current user)
    const frontendUsers = new Map();
    
    // Add all users
    for (const [email, user] of usersByEmail) {
      frontendUsers.set(email, {
        id: user.id,
        email: user.email,
        role: user.role,
        source: 'users'
      });
    }
    
    // Add team members that don't have email matches
    for (const tm of teamMembersWithoutEmailMatches) {
      const key = `tm-${tm.id}`;
      frontendUsers.set(key, {
        id: tm.id,
        email: tm.email,
        role: tm.role,
        source: 'teamMembers'
      });
    }
    
    // Add team members with undefined emails
    for (const tm of teamMembersWithUndefinedEmail) {
      const key = `tm-${tm.id}`;
      frontendUsers.set(key, {
        id: tm.id,
        email: 'No email',
        role: tm.role,
        source: 'teamMembers'
      });
    }
    
    console.log(`   Total frontend users: ${frontendUsers.size}`);
    console.log(`   Users by source:`);
    
    const usersBySource = {};
    for (const [key, user] of frontendUsers) {
      if (!usersBySource[user.source]) {
        usersBySource[user.source] = 0;
      }
      usersBySource[user.source]++;
    }
    
    Object.entries(usersBySource).forEach(([source, count]) => {
      console.log(`     ${source}: ${count}`);
    });
    
    // Check if enterprise user is included
    const enterpriseUser = frontendUsers.get('enterprise.user@enterprisemedia.com');
    console.log(`\n🎯 ENTERPRISE USER CHECK:`);
    console.log(`   Enterprise user included: ${enterpriseUser ? 'YES' : 'NO'}`);
    if (enterpriseUser) {
      console.log(`   ID: ${enterpriseUser.id}`);
      console.log(`   Email: ${enterpriseUser.email}`);
      console.log(`   Role: ${enterpriseUser.role}`);
      console.log(`   Source: ${enterpriseUser.source}`);
    }
    
    return {
      totalTeamMembers: frontendUsers.size,
      enterpriseUserIncluded: !!enterpriseUser,
      emailMatches: emailMatches.length,
      teamMembersWithoutEmailMatches: teamMembersWithoutEmailMatches.length,
      teamMembersWithUndefinedEmail: teamMembersWithUndefinedEmail.length
    };
    
  } catch (error) {
    console.error('❌ Error analyzing team member relationships:', error);
    throw error;
  }
}

// Run the analysis
analyzeTeamMemberRelationships()
  .then(result => {
    console.log('\n✅ Analysis completed');
    console.log(`📊 Result: ${result.totalTeamMembers} team members (enterprise user included: ${result.enterpriseUserIncluded})`);
    console.log(`   Email matches: ${result.emailMatches}`);
    console.log(`   Team members without email matches: ${result.teamMembersWithoutEmailMatches}`);
    console.log(`   Team members with undefined email: ${result.teamMembersWithUndefinedEmail}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
