#!/usr/bin/env node

/**
 * Streamlined Schema Migration Script
 * 
 * This script migrates the current complex schema to a streamlined version with:
 * 1. Single `users` collection for both owners and team members
 * 2. Single `projectAssignments` collection for all project assignments
 * 3. Removal of redundant collections
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

async function migrateToStreamlinedSchema() {
  console.log('🚀 Starting migration to streamlined schema...');
  
  try {
    // Step 1: Ensure users collection has proper structure
    await consolidateUsersCollection();
    
    // Step 2: Create projectAssignments collection from existing data
    await createProjectAssignmentsCollection();
    
    // Step 3: Clean up redundant collections (we already did this, but verify)
    await verifyCleanup();
    
    console.log('\n🎉 Migration to streamlined schema completed successfully!');
    await showFinalState();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function consolidateUsersCollection() {
  console.log('\n📋 Step 1: Consolidating users collection...');
  
  // Get all current users
  const usersSnap = await db.collection('users').get();
  console.log(`📊 Found ${usersSnap.size} users to process`);
  
  let updatedCount = 0;
  
  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    
    // Ensure proper role structure
    let role = userData.role;
    if (!role || !['OWNER', 'TEAM_MEMBER', 'SUPERADMIN', 'ACCOUNTING'].includes(role)) {
      // Determine role based on existing data
      if (userData.isTeamMember) {
        role = 'TEAM_MEMBER';
      } else {
        role = 'USER'; // Will be converted to OWNER if they own an organization
      }
    }
    
    // Check if this user owns any organizations
    const ownedOrgsSnap = await db.collection('organizations')
      .where('ownerUserId', '==', userDoc.id)
      .get();
    
    if (!ownedOrgsSnap.empty && role === 'USER') {
      role = 'OWNER';
    }
    
    // Prepare update data
    const updateData = {
      role: role,
      updatedAt: new Date()
    };
    
    // Add team member data if this is a team member
    if (role === 'TEAM_MEMBER') {
      updateData.teamMemberData = {
        licenseType: userData.licenseType || 'PROFESSIONAL',
        department: userData.department || null,
        status: userData.status || 'ACTIVE',
        createdBy: userData.createdBy || null,
        joinedAt: userData.createdAt || new Date()
      };
    }
    
    // Update the user document
    await db.collection('users').doc(userDoc.id).update(updateData);
    updatedCount++;
    
    console.log(`✅ Updated user: ${userData.email} (${role})`);
  }
  
  console.log(`📊 Updated ${updatedCount} users with proper structure`);
}

async function createProjectAssignmentsCollection() {
  console.log('\n📋 Step 2: Creating projectAssignments collection...');
  
  // Check if projectTeamMembers collection exists (it should be empty after cleanup)
  const projectTeamMembersSnap = await db.collection('projectTeamMembers').get();
  
  if (projectTeamMembersSnap.empty) {
    console.log('✅ projectTeamMembers collection is empty (already cleaned up)');
    console.log('✅ projectAssignments collection ready for new assignments');
    return;
  }
  
  console.log(`📊 Found ${projectTeamMembersSnap.size} project assignments to migrate`);
  
  let migratedCount = 0;
  
  for (const assignmentDoc of projectTeamMembersSnap.docs) {
    const assignmentData = assignmentDoc.data();
    
    // Create new assignment in projectAssignments collection
    const newAssignment = {
      projectId: assignmentData.projectId,
      userId: assignmentData.teamMemberId, // Now references users.id directly
      role: assignmentData.role || 'DO_ER',
      assignedBy: assignmentData.assignedBy || 'system',
      assignedAt: assignmentData.assignedAt || new Date(),
      isActive: assignmentData.isActive !== false
    };
    
    // Create the new assignment
    await db.collection('projectAssignments').add(newAssignment);
    migratedCount++;
    
    console.log(`✅ Migrated assignment: Project ${assignmentData.projectId} → User ${assignmentData.teamMemberId} (${assignmentData.role})`);
  }
  
  console.log(`📊 Migrated ${migratedCount} project assignments`);
  
  // Now clean up the old projectTeamMembers collection
  console.log('🗑️ Cleaning up old projectTeamMembers collection...');
  await deleteCollection('projectTeamMembers');
}

async function deleteCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`✅ ${collectionName} collection is already empty`);
    return;
  }
  
  console.log(`🗑️ Deleting ${snapshot.size} documents from ${collectionName}...`);
  
  const batchSize = 500;
  let deletedCount = 0;
  
  while (true) {
    const batch = db.batch();
    const docs = await collectionRef.limit(batchSize).get();
    
    if (docs.empty) {
      break;
    }
    
    docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deletedCount += docs.size;
    console.log(`🗑️ Deleted ${docs.size} documents (${deletedCount} total)`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Successfully deleted all ${deletedCount} documents from ${collectionName}`);
}

async function verifyCleanup() {
  console.log('\n📋 Step 3: Verifying cleanup of redundant collections...');
  
  const redundantCollections = [
    'teamMembers',
    'team_members', 
    'projectTeamMembers',
    'project_team_members',
    'project_participants'
  ];
  
  for (const collectionName of redundantCollections) {
    const snapshot = await db.collection(collectionName).limit(1).get();
    if (snapshot.empty) {
      console.log(`✅ ${collectionName} collection is empty`);
    } else {
      console.log(`⚠️ ${collectionName} collection still has ${snapshot.size} documents - cleaning up...`);
      await deleteCollection(collectionName);
    }
  }
}

async function showFinalState() {
  console.log('\n📊 Final Schema State:');
  
  // Count users by role
  const usersSnap = await db.collection('users').get();
  const usersByRole = {};
  
  usersSnap.forEach(doc => {
    const role = doc.data().role || 'UNKNOWN';
    usersByRole[role] = (usersByRole[role] || 0) + 1;
  });
  
  console.log('\n👥 Users by role:');
  Object.entries(usersByRole).forEach(([role, count]) => {
    console.log(`  - ${role}: ${count}`);
  });
  
  // Count organizations
  const orgsSnap = await db.collection('organizations').get();
  console.log(`\n🏢 Organizations: ${orgsSnap.size}`);
  
  // Count subscriptions
  const subsSnap = await db.collection('subscriptions').get();
  console.log(`💳 Subscriptions: ${subsSnap.size}`);
  
  // Count projects
  const projectsSnap = await db.collection('projects').get();
  console.log(`📁 Projects: ${projectsSnap.size}`);
  
  // Count project assignments
  const assignmentsSnap = await db.collection('projectAssignments').get();
  console.log(`🔗 Project Assignments: ${assignmentsSnap.size}`);
  
  console.log('\n✅ Streamlined Schema Summary:');
  console.log('   - Single users collection for owners and team members');
  console.log('   - Single projectAssignments collection for all assignments');
  console.log('   - No redundant collections');
  console.log('   - Clear, maintainable relationships');
  console.log('\n🚀 Ready for streamlined workflows!');
}

// Run the migration
migrateToStreamlinedSchema().catch(console.error);
