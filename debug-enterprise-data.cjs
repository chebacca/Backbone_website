const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function verifyData() {
  console.log('🔍 Checking enterprise.user data...');
  
  // Check user document
  const userQuery = await db.collection('users').where('email', '==', 'enterprise.user@example.com').get();
  if (!userQuery.empty) {
    const userData = userQuery.docs[0].data();
    console.log('✅ Enterprise user found:', userData.email, 'UID:', userQuery.docs[0].id);
    console.log('   Organization ID:', userData.organizationId);
    console.log('   Firebase UID:', userData.firebaseUid);
  } else {
    console.log('❌ Enterprise user not found');
  }
  
  // Check team members in default-org
  const teamMembers = await db.collection('teamMembers').where('organizationId', '==', 'default-org').get();
  console.log('\n👥 Team members in default-org:', teamMembers.size);
  teamMembers.forEach(doc => {
    const data = doc.data();
    console.log('   -', data.name, '(', data.email, ') - Role:', data.role, 'Status:', data.status);
  });
  
  // Check projects in default-org
  const projects = await db.collection('projects').where('organizationId', '==', 'default-org').get();
  console.log('\n📁 Projects in default-org:', projects.size);
  projects.forEach(doc => {
    const data = doc.data();
    console.log('   -', data.name, '- Owner:', data.ownerId, 'Created:', data.createdAt?.toDate());
  });
  
  // Check org_members
  const orgMembers = await db.collection('org_members').where('organizationId', '==', 'default-org').get();
  console.log('\n🏢 Org members in default-org:', orgMembers.size);
  orgMembers.forEach(doc => {
    const data = doc.data();
    console.log('   -', data.memberName, '(', data.memberEmail, ') - Role:', data.role);
  });
  
  // Check licenses
  const licenses = await db.collection('licenses').where('organizationId', '==', 'default-org').get();
  console.log('\n📜 Licenses in default-org:', licenses.size);
  licenses.forEach(doc => {
    const data = doc.data();
    console.log('   -', data.licenseType, '- Assigned to:', data.assignedToEmail || 'Unassigned');
  });
  
  process.exit(0);
}

verifyData().catch(console.error);

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function verifyData() {
  console.log('🔍 Checking enterprise.user data...');
  
  // Check user document
  const userQuery = await db.collection('users').where('email', '==', 'enterprise.user@example.com').get();
  if (!userQuery.empty) {
    const userData = userQuery.docs[0].data();
    console.log('✅ Enterprise user found:', userData.email, 'UID:', userQuery.docs[0].id);
    console.log('   Organization ID:', userData.organizationId);
    console.log('   Firebase UID:', userData.firebaseUid);
  } else {
    console.log('❌ Enterprise user not found');
  }
  
  // Check team members in default-org
  const teamMembers = await db.collection('teamMembers').where('organizationId', '==', 'default-org').get();
  console.log('\n👥 Team members in default-org:', teamMembers.size);
  teamMembers.forEach(doc => {
    const data = doc.data();
    console.log('   -', data.name, '(', data.email, ') - Role:', data.role, 'Status:', data.status);
  });
  
  // Check projects in default-org
  const projects = await db.collection('projects').where('organizationId', '==', 'default-org').get();
  console.log('\n📁 Projects in default-org:', projects.size);
  projects.forEach(doc => {
    const data = doc.data();
    console.log('   -', data.name, '- Owner:', data.ownerId, 'Created:', data.createdAt?.toDate());
  });
  
  // Check org_members
  const orgMembers = await db.collection('org_members').where('organizationId', '==', 'default-org').get();
  console.log('\n🏢 Org members in default-org:', orgMembers.size);
  orgMembers.forEach(doc => {
    const data = doc.data();
    console.log('   -', data.memberName, '(', data.memberEmail, ') - Role:', data.role);
  });
  
  // Check licenses
  const licenses = await db.collection('licenses').where('organizationId', '==', 'default-org').get();
  console.log('\n📜 Licenses in default-org:', licenses.size);
  licenses.forEach(doc => {
    const data = doc.data();
    console.log('   -', data.licenseType, '- Assigned to:', data.assignedToEmail || 'Unassigned');
  });
  
  process.exit(0);
}

verifyData().catch(console.error);