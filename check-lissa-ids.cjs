#!/usr/bin/env node

/**
 * Check Lissa's ID mismatch issue
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

async function checkLissaIDs() {
  console.log('🔍 Checking Lissa IDs...');
  
  // Find all team members with lissa@apple.com
  const lissaQuery = await db.collection('teamMembers').where('email', '==', 'lissa@apple.com').get();
  
  console.log('📋 Team members with lissa@apple.com:');
  lissaQuery.docs.forEach(doc => {
    console.log('  - ID:', doc.id, 'Data:', doc.data());
  });
  
  // Check project assignments for both IDs
  const frontendId = 'VDkIOHtIFbqAE1AdBSQE';
  const databaseId = '2is23RGSIH26JNFlRaxJ';
  
  console.log('\n📋 Project assignments for frontend ID:', frontendId);
  const frontendAssignments = await db.collection('projectTeamMembers').where('teamMemberId', '==', frontendId).get();
  console.log('  - Count:', frontendAssignments.size);
  
  console.log('\n📋 Project assignments for database ID:', databaseId);
  const databaseAssignments = await db.collection('projectTeamMembers').where('teamMemberId', '==', databaseId).get();
  console.log('  - Count:', databaseAssignments.size);
  
  // If assignments exist for database ID but not frontend ID, we need to update them
  if (databaseAssignments.size > 0 && frontendAssignments.size === 0) {
    console.log('\n🔧 ISSUE FOUND: Assignments exist for database ID but not frontend ID');
    console.log('   Frontend expects ID:', frontendId);
    console.log('   Database has assignments for ID:', databaseId);
    console.log('   Need to update project assignments to use frontend ID');
  }
  
  process.exit(0);
}

checkLissaIDs().catch(console.error);
