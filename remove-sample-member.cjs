#!/usr/bin/env node

/**
 * Remove Sample Member from Firestore
 * This script removes the sample team member that was created for testing
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function removeSampleMember() {
  try {
    console.log('🗑️ Removing Sample Member from Firestore...\n');
    
    // Step 1: Find and remove Sample Member from teamMembers collection
    console.log('📋 Checking teamMembers collection...');
    const teamMembersQuery = await db.collection('teamMembers')
      .where('email', '==', 'sample.team.member@example.com')
      .get();
    
    if (!teamMembersQuery.empty) {
      for (const doc of teamMembersQuery.docs) {
        console.log(`  - Removing team member: ${doc.id}`);
        await doc.ref.delete();
      }
      console.log(`✅ Removed ${teamMembersQuery.size} team member records`);
    } else {
      console.log('  - No Sample Member found in teamMembers collection');
    }
    
    // Step 2: Find and remove Sample Member from users collection
    console.log('\n📋 Checking users collection...');
    const usersQuery = await db.collection('users')
      .where('email', '==', 'sample.team.member@example.com')
      .get();
    
    if (!usersQuery.empty) {
      for (const doc of usersQuery.docs) {
        console.log(`  - Removing user: ${doc.id}`);
        await doc.ref.delete();
      }
      console.log(`✅ Removed ${usersQuery.size} user records`);
    } else {
      console.log('  - No Sample Member found in users collection');
    }
    
    // Step 3: Find and remove Sample Member from projectAssignments collection
    console.log('\n📋 Checking projectAssignments collection...');
    const projectAssignmentsQuery = await db.collection('projectAssignments')
      .where('userId', '==', 'sample.team.member@example.com')
      .get();
    
    if (!projectAssignmentsQuery.empty) {
      for (const doc of projectAssignmentsQuery.docs) {
        console.log(`  - Removing project assignment: ${doc.id}`);
        await doc.ref.delete();
      }
      console.log(`✅ Removed ${projectAssignmentsQuery.size} project assignment records`);
    } else {
      console.log('  - No Sample Member found in projectAssignments collection');
    }
    
    // Step 4: Find and remove Sample Member from orgMembers collection
    console.log('\n📋 Checking orgMembers collection...');
    const orgMembersQuery = await db.collection('orgMembers')
      .where('email', '==', 'sample.team.member@example.com')
      .get();
    
    if (!orgMembersQuery.empty) {
      for (const doc of orgMembersQuery.docs) {
        console.log(`  - Removing org member: ${doc.id}`);
        await doc.ref.delete();
      }
      console.log(`✅ Removed ${orgMembersQuery.size} org member records`);
    } else {
      console.log('  - No Sample Member found in orgMembers collection');
    }
    
    console.log('\n🎉 Sample Member cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error removing Sample Member:', error);
    process.exit(1);
  }
}

// Run the script
removeSampleMember()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
