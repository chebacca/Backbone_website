const admin = require('firebase-admin');
const serviceAccount = require('./server/backbone-client-firebase-adminsdk-3rvzx-3e2b9b4c7c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'backbone-client'
});

const db = admin.firestore();

async function checkFirestoreData() {
  try {
    console.log('🔍 Checking Firestore collections...');
    
    // Check if projectTeamMembers collection exists
    const projectTeamMembersSnap = await db.collection('projectTeamMembers').limit(5).get();
    console.log('📁 projectTeamMembers collection size:', projectTeamMembersSnap.size);
    
    if (!projectTeamMembersSnap.empty) {
      console.log('📋 Sample projectTeamMembers documents:');
      projectTeamMembersSnap.forEach(doc => {
        console.log('  -', doc.id, ':', doc.data());
      });
    }
    
    // Check for Lissa's user ID in various collections
    const lissaEmail = 'lissa@apple.com';
    const lissaId = 'VDkIOHtIFbqAE1AdBSQE';
    
    console.log('\n🔍 Checking for Lissa\'s data...');
    console.log('Email:', lissaEmail);
    console.log('User ID:', lissaId);
    
    // Check users collection
    const usersSnap = await db.collection('users').where('email', '==', lissaEmail).get();
    console.log('👤 Users with email:', usersSnap.size);
    usersSnap.forEach(doc => {
      console.log('  User doc:', doc.id, ':', doc.data());
    });
    
    // Check team members collection
    const teamMembersSnap = await db.collection('teamMembers').where('email', '==', lissaEmail).get();
    console.log('👥 Team members with email:', teamMembersSnap.size);
    teamMembersSnap.forEach(doc => {
      console.log('  Team member doc:', doc.id, ':', doc.data());
    });
    
    // Check project assignments for Lissa's ID
    const assignmentsSnap = await db.collection('projectTeamMembers').where('teamMemberId', '==', lissaId).get();
    console.log('📋 Project assignments for Lissa ID:', assignmentsSnap.size);
    assignmentsSnap.forEach(doc => {
      console.log('  Assignment doc:', doc.id, ':', doc.data());
    });
    
    // Also check with email as teamMemberId
    const assignmentsByEmailSnap = await db.collection('projectTeamMembers').where('teamMemberId', '==', lissaEmail).get();
    console.log('📋 Project assignments for Lissa email:', assignmentsByEmailSnap.size);
    assignmentsByEmailSnap.forEach(doc => {
      console.log('  Assignment doc:', doc.id, ':', doc.data());
    });
    
    // Check if there are any projects at all
    const projectsSnap = await db.collection('projects').limit(5).get();
    console.log('\n📁 Total projects in collection:', projectsSnap.size);
    projectsSnap.forEach(doc => {
      const data = doc.data();
      console.log('  Project:', doc.id, '- Name:', data.name, '- Owner:', data.ownerId || data.createdBy);
    });
    
    // List all collections to see what's available
    console.log('\n📚 Available collections:');
    const collections = await db.listCollections();
    collections.forEach(collection => {
      console.log('  -', collection.id);
    });
    
  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
  }
  
  process.exit(0);
}

checkFirestoreData();
