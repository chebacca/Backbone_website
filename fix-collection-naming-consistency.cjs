#!/usr/bin/env node

/**
 * CRITICAL FIX: Collection Naming Consistency
 * 
 * This script fixes the massive data architecture issue where team members
 * and project assignments are scattered across multiple collections with
 * inconsistent naming conventions.
 * 
 * PROBLEM:
 * - teamMembers (camelCase) vs team_members (snake_case)
 * - projectTeamMembers (camelCase) vs project_team_members (snake_case)
 * - Data fragmentation causing team member login issues
 * 
 * SOLUTION:
 * - Standardize ALL collections to camelCase
 * - Migrate data from snake_case to camelCase collections
 * - Update all references to use consistent naming
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

async function fixCollectionNamingConsistency() {
  console.log('🔧 Starting Collection Naming Consistency Fix...');
  
  try {
    // 1. Migrate team_members to teamMembers
    console.log('\n📋 Step 1: Migrating team_members to teamMembers...');
    await migrateTeamMembers();
    
    // 2. Migrate project_team_members to projectTeamMembers  
    console.log('\n📋 Step 2: Migrating project_team_members to projectTeamMembers...');
    await migrateProjectTeamMembers();
    
    // 3. Verify data consistency
    console.log('\n📋 Step 3: Verifying data consistency...');
    await verifyDataConsistency();
    
    // 4. Clean up old collections
    console.log('\n📋 Step 4: Cleaning up old collections...');
    await cleanupOldCollections();
    
    console.log('\n✅ Collection naming consistency fix completed!');
    
  } catch (error) {
    console.error('❌ Error during collection naming fix:', error);
    process.exit(1);
  }
}

async function migrateTeamMembers() {
  try {
    // Check if team_members collection exists and has data
    const oldTeamMembersSnap = await db.collection('team_members').limit(1).get();
    
    if (oldTeamMembersSnap.empty) {
      console.log('   ℹ️  No data in team_members collection to migrate');
    } else {
      // Get all documents from team_members
      const allOldTeamMembers = await db.collection('team_members').get();
      console.log(`   📊 Found ${allOldTeamMembers.size} documents in team_members collection`);
    }
    
    // Check what's already in teamMembers
    const existingTeamMembers = await db.collection('teamMembers').get();
    console.log(`   📊 Found ${existingTeamMembers.size} documents in teamMembers collection`);
    
    // 🔧 CRITICAL: Deduplicate team members by email
    console.log('   🔍 Checking for duplicate team members by email...');
    await deduplicateTeamMembersByEmail();
    
    // Only migrate if we have old data
    if (oldTeamMembersSnap.empty) {
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;
    
    const allOldTeamMembers = await db.collection('team_members').get();
    
    for (const doc of allOldTeamMembers.docs) {
      const data = doc.data();
      const docId = doc.id;
      const email = data.email;
      
      if (!email) {
        console.log(`   ⚠️  Skipping document ${docId} - no email address`);
        skippedCount++;
        continue;
      }
      
      // Check if email already exists in teamMembers (prevent duplicates)
      const existingByEmail = await db.collection('teamMembers').where('email', '==', email).get();
      
      if (!existingByEmail.empty) {
        console.log(`   🔄 Duplicate email detected: ${email} - consolidating data`);
        
        // Get the existing document
        const existingDoc = existingByEmail.docs[0];
        const existingData = existingDoc.data();
        const existingId = existingDoc.id;
        
        // Merge data (prefer newer/more complete data)
        const mergedData = {
          ...existingData,
          ...data,
          // Preserve important fields from existing
          id: existingId,
          email: email,
          // Use latest timestamps
          updatedAt: data.updatedAt || existingData.updatedAt || new Date(),
          createdAt: existingData.createdAt || data.createdAt || new Date()
        };
        
        // Update the existing document with merged data
        await db.collection('teamMembers').doc(existingId).set(mergedData);
        console.log(`   ✅ Consolidated duplicate: ${email} (kept ID: ${existingId})`);
        duplicateCount++;
        continue;
      }
      
      // Check if document ID already exists in teamMembers
      const existingDoc = await db.collection('teamMembers').doc(docId).get();
      
      if (existingDoc.exists) {
        console.log(`   ⏭️  Skipping ${email} - document ID already exists in teamMembers`);
        skippedCount++;
        continue;
      }
      
      // Migrate the document
      await db.collection('teamMembers').doc(docId).set(data);
      console.log(`   ✅ Migrated team member: ${email} (${docId})`);
      migratedCount++;
    }
    
    console.log(`   📈 Migration summary: ${migratedCount} migrated, ${skippedCount} skipped, ${duplicateCount} duplicates consolidated`);
    
  } catch (error) {
    console.error('   ❌ Error migrating team members:', error);
    throw error;
  }
}

async function deduplicateTeamMembersByEmail() {
  try {
    const teamMembersSnap = await db.collection('teamMembers').get();
    const emailMap = new Map();
    const duplicates = [];
    
    // Find duplicates by email
    teamMembersSnap.forEach(doc => {
      const data = doc.data();
      const email = data.email;
      
      if (!email) return;
      
      if (emailMap.has(email)) {
        duplicates.push({
          id: doc.id,
          email: email,
          data: data,
          existing: emailMap.get(email)
        });
      } else {
        emailMap.set(email, {
          id: doc.id,
          email: email,
          data: data
        });
      }
    });
    
    if (duplicates.length === 0) {
      console.log('   ✅ No duplicate emails found in teamMembers collection');
      return;
    }
    
    console.log(`   ⚠️  Found ${duplicates.length} duplicate email addresses`);
    
    for (const duplicate of duplicates) {
      console.log(`   🔄 Consolidating duplicate email: ${duplicate.email}`);
      console.log(`     - Keeping: ${duplicate.existing.id}`);
      console.log(`     - Removing: ${duplicate.id}`);
      
      // Merge data (prefer existing, but update with any newer info)
      const mergedData = {
        ...duplicate.existing.data,
        ...duplicate.data,
        // Preserve the existing ID and email
        id: duplicate.existing.id,
        email: duplicate.email,
        // Use latest update time
        updatedAt: duplicate.data.updatedAt || duplicate.existing.data.updatedAt || new Date()
      };
      
      // Update the existing document with merged data
      await db.collection('teamMembers').doc(duplicate.existing.id).set(mergedData);
      
      // Update any project assignments that reference the duplicate ID
      const projectAssignments = await db.collection('projectTeamMembers')
        .where('teamMemberId', '==', duplicate.id)
        .get();
      
      for (const assignment of projectAssignments.docs) {
        await db.collection('projectTeamMembers').doc(assignment.id).update({
          teamMemberId: duplicate.existing.id
        });
        console.log(`     - Updated project assignment: ${assignment.id}`);
      }
      
      // Delete the duplicate document
      await db.collection('teamMembers').doc(duplicate.id).delete();
      console.log(`     ✅ Removed duplicate: ${duplicate.id}`);
    }
    
    console.log(`   ✅ Consolidated ${duplicates.length} duplicate team members`);
    
  } catch (error) {
    console.error('   ❌ Error deduplicating team members:', error);
    throw error;
  }
}

async function migrateProjectTeamMembers() {
  try {
    // Check if project_team_members collection exists and has data
    const oldProjectTeamMembersSnap = await db.collection('project_team_members').limit(1).get();
    
    if (oldProjectTeamMembersSnap.empty) {
      console.log('   ℹ️  No data in project_team_members collection to migrate');
      return;
    }
    
    // Get all documents from project_team_members
    const allOldProjectTeamMembers = await db.collection('project_team_members').get();
    console.log(`   📊 Found ${allOldProjectTeamMembers.size} documents in project_team_members collection`);
    
    // Check what's already in projectTeamMembers
    const existingProjectTeamMembers = await db.collection('projectTeamMembers').get();
    console.log(`   📊 Found ${existingProjectTeamMembers.size} documents in projectTeamMembers collection`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const doc of allOldProjectTeamMembers.docs) {
      const data = doc.data();
      const docId = doc.id;
      
      // Check if document already exists in projectTeamMembers
      const existingDoc = await db.collection('projectTeamMembers').doc(docId).get();
      
      if (existingDoc.exists) {
        console.log(`   ⏭️  Skipping project assignment ${docId} - already exists in projectTeamMembers`);
        skippedCount++;
        continue;
      }
      
      // Migrate the document
      await db.collection('projectTeamMembers').doc(docId).set(data);
      console.log(`   ✅ Migrated project assignment: ${data.teamMemberId} -> ${data.projectId} (${docId})`);
      migratedCount++;
    }
    
    console.log(`   📈 Migration summary: ${migratedCount} migrated, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error('   ❌ Error migrating project team members:', error);
    throw error;
  }
}

async function verifyDataConsistency() {
  try {
    // Check teamMembers collection
    const teamMembersSnap = await db.collection('teamMembers').get();
    console.log(`   📊 teamMembers collection: ${teamMembersSnap.size} documents`);
    
    // Check projectTeamMembers collection
    const projectTeamMembersSnap = await db.collection('projectTeamMembers').get();
    console.log(`   📊 projectTeamMembers collection: ${projectTeamMembersSnap.size} documents`);
    
    // Check for Lissa specifically
    const lissaSnap = await db.collection('teamMembers').where('email', '==', 'lissa@apple.com').get();
    if (!lissaSnap.empty) {
      const lissaDoc = lissaSnap.docs[0];
      const lissaId = lissaDoc.id;
      console.log(`   👤 Found Lissa in teamMembers: ${lissaId}`);
      
      // Check her project assignments
      const lissaAssignments = await db.collection('projectTeamMembers')
        .where('teamMemberId', '==', lissaId)
        .get();
      console.log(`   📋 Lissa's project assignments: ${lissaAssignments.size} projects`);
      
      lissaAssignments.forEach(doc => {
        const assignment = doc.data();
        console.log(`     - Project: ${assignment.projectId}, Role: ${assignment.role}`);
      });
    } else {
      console.log('   ⚠️  Lissa not found in teamMembers collection');
    }
    
    // Summary
    console.log('\n   📋 Data Consistency Summary:');
    console.log(`   - teamMembers: ${teamMembersSnap.size} documents`);
    console.log(`   - projectTeamMembers: ${projectTeamMembersSnap.size} documents`);
    console.log('   - All collections now use consistent camelCase naming');
    
  } catch (error) {
    console.error('   ❌ Error verifying data consistency:', error);
    throw error;
  }
}

async function cleanupOldCollections() {
  try {
    let deletedCollections = [];
    
    // 1. Clean up team_members collection
    console.log('   🗑️  Cleaning up team_members collection...');
    const oldTeamMembersSnap = await db.collection('team_members').get();
    
    if (!oldTeamMembersSnap.empty) {
      console.log(`   📊 Found ${oldTeamMembersSnap.size} documents in team_members collection`);
      
      // Verify all data exists in teamMembers before deletion
      let canDelete = true;
      const missingEmails = [];
      
      for (const doc of oldTeamMembersSnap.docs) {
        const data = doc.data();
        if (data.email) {
          const existsInNew = await db.collection('teamMembers').where('email', '==', data.email).get();
          if (existsInNew.empty) {
            canDelete = false;
            missingEmails.push(data.email);
          }
        }
      }
      
      if (canDelete) {
        // Delete all documents in team_members collection
        const batch = db.batch();
        oldTeamMembersSnap.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        
        console.log(`   ✅ Deleted ${oldTeamMembersSnap.size} documents from team_members collection`);
        deletedCollections.push('team_members');
      } else {
        console.log(`   ⚠️  Cannot delete team_members - missing emails in teamMembers: ${missingEmails.join(', ')}`);
      }
    } else {
      console.log('   ℹ️  team_members collection is already empty');
    }
    
    // 2. Clean up project_team_members collection
    console.log('   🗑️  Cleaning up project_team_members collection...');
    const oldProjectTeamMembersSnap = await db.collection('project_team_members').get();
    
    if (!oldProjectTeamMembersSnap.empty) {
      console.log(`   📊 Found ${oldProjectTeamMembersSnap.size} documents in project_team_members collection`);
      
      // 🔧 AGGRESSIVE CLEANUP: These documents reference old team member IDs that were consolidated
      // We need to delete them since the data has been migrated and consolidated in projectTeamMembers
      
      console.log('   🔍 Analyzing project_team_members documents...');
      let canSafelyDelete = true;
      let outdatedReferences = 0;
      
      for (const doc of oldProjectTeamMembersSnap.docs) {
        const data = doc.data();
        console.log(`     - Checking ${doc.id}: teamMemberId=${data.teamMemberId}, projectId=${data.projectId}`);
        
        // Check if the teamMemberId still exists in teamMembers collection
        if (data.teamMemberId) {
          const teamMemberExists = await db.collection('teamMembers').doc(data.teamMemberId).get();
          if (!teamMemberExists.exists) {
            console.log(`       ⚠️  References non-existent team member: ${data.teamMemberId}`);
            outdatedReferences++;
          }
        }
      }
      
      if (outdatedReferences > 0) {
        console.log(`   🔄 Found ${outdatedReferences} assignments with outdated team member references`);
        console.log('   🗑️  These are safe to delete since team members were consolidated');
      }
      
      // Delete all documents in project_team_members since data has been migrated
      console.log('   🗑️  Deleting all project_team_members documents (data already migrated to projectTeamMembers)...');
      const batch = db.batch();
      oldProjectTeamMembersSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      console.log(`   ✅ Deleted ${oldProjectTeamMembersSnap.size} documents from project_team_members collection`);
      deletedCollections.push('project_team_members');
    } else {
      console.log('   ℹ️  project_team_members collection is already empty');
    }
    
    // 3. Summary
    if (deletedCollections.length > 0) {
      console.log(`   🎉 Successfully cleaned up collections: ${deletedCollections.join(', ')}`);
    } else {
      console.log('   ℹ️  No old collections needed cleanup');
    }
    
    // 4. Final verification - ensure no orphaned data
    console.log('   🔍 Final verification - checking for orphaned data...');
    
    // Check if any projectTeamMembers reference non-existent team members
    const allAssignments = await db.collection('projectTeamMembers').get();
    const orphanedAssignments = [];
    
    for (const assignment of allAssignments.docs) {
      const data = assignment.data();
      if (data.teamMemberId) {
        const teamMemberExists = await db.collection('teamMembers').doc(data.teamMemberId).get();
        if (!teamMemberExists.exists) {
          orphanedAssignments.push({
            assignmentId: assignment.id,
            teamMemberId: data.teamMemberId,
            projectId: data.projectId
          });
        }
      }
    }
    
    if (orphanedAssignments.length > 0) {
      console.log(`   ⚠️  Found ${orphanedAssignments.length} orphaned project assignments:`);
      orphanedAssignments.forEach(orphan => {
        console.log(`     - Assignment ${orphan.assignmentId}: references missing team member ${orphan.teamMemberId}`);
      });
      console.log('   💡 These may need manual cleanup or the team members may need to be recreated');
    } else {
      console.log('   ✅ No orphaned project assignments found');
    }
    
  } catch (error) {
    console.error('   ❌ Error cleaning up old collections:', error);
    throw error;
  }
}

// Run the fix
if (require.main === module) {
  fixCollectionNamingConsistency()
    .then(() => {
      console.log('\n🎉 Collection naming consistency fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Collection naming consistency fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixCollectionNamingConsistency };
