const admin = require('firebase-admin');
const serviceAccount = require('./backbone-logic-firebase-adminsdk-nnxhf-7c1b8b4b8c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkLissaData() {
  console.log('🔍 Checking Lissa data in Firestore...');
  
  // Check users collection
  console.log('\n📁 Checking users collection...');
  const usersSnap = await db.collection('users').where('email', '==', 'lissa@apple.com').get();
  if (!usersSnap.empty) {
    usersSnap.docs.forEach(doc => {
      console.log('👤 User found:', { id: doc.id, email: doc.data().email, name: doc.data().name, role: doc.data().role });
    });
  } else {
    console.log('❌ No user found with email lissa@apple.com');
  }
  
  // Check team_members collection
  console.log('\n👥 Checking team_members collection...');
  const teamMembersSnap = await db.collection('team_members').where('email', '==', 'lissa@apple.com').get();
  if (!teamMembersSnap.empty) {
    teamMembersSnap.docs.forEach(doc => {
      console.log('👥 Team member found:', { id: doc.id, email: doc.data().email, name: doc.data().name || `${doc.data().firstName} ${doc.data().lastName}` });
    });
  } else {
    console.log('❌ No team member found with email lissa@apple.com');
  }
  
  // Check projectTeamMembers collection for any assignments
  console.log('\n📋 Checking projectTeamMembers collection...');
  const projectAssignmentsSnap = await db.collection('projectTeamMembers').get();
  console.log(`Total project assignments: ${projectAssignmentsSnap.size}`);
  
  let lissaAssignments = [];
  let allAssignments = [];
  
  projectAssignmentsSnap.docs.forEach(doc => {
    const data = doc.data();
    allAssignments.push({ id: doc.id, teamMemberId: data.teamMemberId, projectId: data.projectId, role: data.role });
    
    if (data.teamMemberId && (
      data.teamMemberId.includes('lissa') || 
      data.teamMemberId.toLowerCase().includes('lissa') ||
      doc.id.includes('lissa')
    )) {
      lissaAssignments.push({ id: doc.id, ...data });
    }
  });
  
  console.log(`\nAll assignments (first 10):`);
  allAssignments.slice(0, 10).forEach(assignment => {
    console.log('📋', assignment);
  });
  
  console.log(`\nLissa assignments found: ${lissaAssignments.length}`);
  lissaAssignments.forEach(assignment => {
    console.log('📋 Lissa Assignment:', assignment);
  });
  
  // Check if there are any team members with similar names
  console.log('\n🔍 Checking for team members with similar names...');
  const allTeamMembersSnap = await db.collection('team_members').get();
  console.log(`Total team members: ${allTeamMembersSnap.size}`);
  
  allTeamMembersSnap.docs.forEach(doc => {
    const data = doc.data();
    if (data.email && data.email.toLowerCase().includes('lissa')) {
      console.log('👥 Similar team member:', { id: doc.id, email: data.email, name: data.name || `${data.firstName} ${data.lastName}` });
    }
  });
  
  process.exit(0);
}

checkLissaData().catch(console.error);
