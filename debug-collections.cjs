#!/usr/bin/env node

/**
 * Debug Collections for Bob Dern
 * 
 * This script checks what collections exist and what data is in each one
 * to understand why the API isn't finding Bob's project.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function debugCollections() {
  try {
    console.log('🔍 Debugging collections for Bob Dern...\n');
    
    // Step 1: Get Bob Dern's user document
    const bobUserQuery = await db.collection('users')
      .where('email', '==', 'bdern@example.com')
      .limit(1)
      .get();
    
    if (bobUserQuery.empty) {
      throw new Error('Bob Dern user document not found');
    }
    
    const bobUser = bobUserQuery.docs[0];
    const bobUserId = bobUser.id;
    console.log('✅ Found Bob Dern user:', bobUserId);
    
    // Step 2: Check projectTeamMembers collection
    console.log('\n📋 Checking projectTeamMembers collection...');
    const projectTeamMembersQuery = await db.collection('projectTeamMembers')
      .where('teamMemberId', '==', bobUserId)
      .get();
    
    console.log(`Found ${projectTeamMembersQuery.size} entries in projectTeamMembers`);
    projectTeamMembersQuery.docs.forEach(doc => {
      console.log('  -', doc.data());
    });
    
    // Step 3: Check projectAssignments collection (what the API is using)
    console.log('\n📋 Checking projectAssignments collection...');
    const projectAssignmentsQuery = await db.collection('projectAssignments')
      .where('userId', '==', bobUserId)
      .get();
    
    console.log(`Found ${projectAssignmentsQuery.size} entries in projectAssignments`);
    projectAssignmentsQuery.docs.forEach(doc => {
      console.log('  -', doc.data());
    });
    
    // Step 4: Check if we need to create the missing assignment
    if (projectAssignmentsQuery.empty && !projectTeamMembersQuery.empty) {
      console.log('\n🔧 Creating missing projectAssignment entry...');
      
      const teamMemberData = projectTeamMembersQuery.docs[0].data();
      const projectAssignment = {
        userId: bobUserId,
        projectId: teamMemberData.projectId,
        role: teamMemberData.role,
        isActive: true,
        assignedAt: teamMemberData.assignedAt || new Date().toISOString(),
        accessLevel: 'read'
      };
      
      await db.collection('projectAssignments').add(projectAssignment);
      console.log('✅ Created projectAssignment entry');
    }
    
    console.log('\n🎉 Collection debugging completed!');
    
  } catch (error) {
    console.error('❌ Error debugging collections:', error);
  }
}

// Run the debug
debugCollections()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
