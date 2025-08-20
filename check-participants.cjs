#!/usr/bin/env node

/**
 * Check if Lissa exists in project_participants collection
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkParticipants() {
  console.log('🔍 Checking project_participants collection...');
  
  const teamMemberId = 'VDkIOHtIFbqAE1AdBSQE';
  
  // Check if Lissa exists in project_participants
  console.log('📋 Checking for Lissa in project_participants...');
  const participantsQuery = await db.collection('project_participants')
    .where('userId', '==', teamMemberId)
    .get();
  
  console.log(`📊 Found ${participantsQuery.size} entries in project_participants for Lissa`);
  
  if (participantsQuery.empty) {
    console.log('❌ Lissa has NO entries in project_participants collection');
    console.log('🔧 This explains why getProjectByIdAuthorized() fails');
    console.log('');
    console.log('💡 SOLUTION: We need to either:');
    console.log('   1. Create project_participants entries for team member assignments');
    console.log('   2. Modify getProjectByIdAuthorized() to also check projectTeamMembers');
  } else {
    console.log('✅ Lissa has entries in project_participants:');
    participantsQuery.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - Project: ${data.projectId}, Role: ${data.role}`);
    });
  }
  
  // Also check a sample project to see what participants exist
  console.log('\\n📋 Checking sample project participants...');
  const sampleProjectId = '0RdvftVkd5ItJeUdXs1d'; // TESTING project
  const sampleParticipants = await db.collection('project_participants')
    .where('projectId', '==', sampleProjectId)
    .get();
  
  console.log(`📊 Project ${sampleProjectId} has ${sampleParticipants.size} participants:`);
  sampleParticipants.docs.forEach(doc => {
    const data = doc.data();
    console.log(`  - User: ${data.userId}, Role: ${data.role}`);
  });
  
  process.exit(0);
}

checkParticipants().catch(console.error);
