#!/usr/bin/env node

/**
 * Fix Lissa's ID mismatch by updating project assignments to use the correct team member ID
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

async function fixLissaIdMismatch() {
  console.log('🔧 Fixing Lissa ID mismatch...');
  
  const oldId = '2is23RGSIH26JNFlRaxJ';  // Database team member ID
  const newId = 'VDkIOHtIFbqAE1AdBSQE';  // Frontend JWT token ID
  
  console.log('📋 Updating project assignments...');
  console.log('  - From ID:', oldId);
  console.log('  - To ID:', newId);
  
  // Get all project assignments for the old ID
  const assignmentsQuery = await db.collection('projectTeamMembers')
    .where('teamMemberId', '==', oldId)
    .get();
  
  console.log(`📊 Found ${assignmentsQuery.size} project assignments to update`);
  
  if (assignmentsQuery.empty) {
    console.log('ℹ️  No assignments found to update');
    return;
  }
  
  // Update each assignment in batches
  const batch = db.batch();
  let updateCount = 0;
  
  assignmentsQuery.docs.forEach(doc => {
    const assignmentRef = db.collection('projectTeamMembers').doc(doc.id);
    batch.update(assignmentRef, { teamMemberId: newId });
    updateCount++;
    
    const data = doc.data();
    console.log(`  ✅ Updating assignment ${doc.id}: Project ${data.projectId}, Role ${data.role}`);
  });
  
  // Commit the batch update
  console.log(`\\n🔄 Committing ${updateCount} updates...`);
  await batch.commit();
  
  console.log('✅ Successfully updated all project assignments!');
  
  // Verify the update
  console.log('\\n🔍 Verifying update...');
  const newAssignmentsQuery = await db.collection('projectTeamMembers')
    .where('teamMemberId', '==', newId)
    .get();
  
  console.log(`📊 New ID now has ${newAssignmentsQuery.size} project assignments`);
  
  // Check if old ID still has any assignments
  const oldAssignmentsQuery = await db.collection('projectTeamMembers')
    .where('teamMemberId', '==', oldId)
    .get();
  
  console.log(`📊 Old ID now has ${oldAssignmentsQuery.size} project assignments`);
  
  if (newAssignmentsQuery.size === 19 && oldAssignmentsQuery.size === 0) {
    console.log('🎉 ID mismatch fixed successfully!');
    console.log('   Lissa should now see her 19 assigned projects in the frontend');
  } else {
    console.log('⚠️  Something might be wrong with the update');
  }
  
  process.exit(0);
}

fixLissaIdMismatch().catch(console.error);
