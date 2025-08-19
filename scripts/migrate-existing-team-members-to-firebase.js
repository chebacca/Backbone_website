#!/usr/bin/env node

/**
 * Migrate Existing Team Members to Firebase Auth
 * 
 * This script creates Firebase Authentication users for existing team members
 * who don't have Firebase UIDs yet. It's useful for migrating existing data
 * to the new integrated system.
 * 
 * Usage: node migrate-existing-team-members-to-firebase.js [--dry-run] [--limit=N]
 * 
 * Options:
 *   --dry-run    Show what would be done without actually doing it
 *   --limit=N    Only process N team members (default: all)
 */

import admin from 'firebase-admin';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made\n');
}

if (limit) {
  console.log(`📊 Processing limit: ${limit} team members\n`);
}

// Initialize Firebase Admin
try {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
} catch (error) {
  console.log('Firebase Admin already initialized or error:', error.message);
}

const auth = admin.auth();
const db = admin.firestore();

/**
 * Generate a secure temporary password
 */
function generateTemporaryPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if Firebase Auth user already exists
 */
async function checkFirebaseUserExists(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * Create Firebase Auth user for team member
 */
async function createFirebaseUser(teamMember) {
  const temporaryPassword = generateTemporaryPassword();
  
  try {
    const userRecord = await auth.createUser({
      email: teamMember.email,
      password: temporaryPassword,
      displayName: teamMember.name || `${teamMember.firstName || ''} ${teamMember.lastName || ''}`.trim(),
      emailVerified: false,
      disabled: false,
    });
    
    return {
      success: true,
      firebaseUid: userRecord.uid,
      temporaryPassword: temporaryPassword
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Update Firestore user with Firebase UID
 */
async function updateFirestoreUser(userId, firebaseUid) {
  try {
    await db.collection('users').doc(userId).update({
      firebaseUid: firebaseUid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main migration function
 */
async function migrateTeamMembersToFirebase() {
  console.log('🚀 Starting Team Member to Firebase Auth Migration...\n');

  try {
    // Get all team members without Firebase UIDs
    console.log('1️⃣ Finding team members without Firebase UIDs...');
    let teamMembersQuery = db.collection('users')
      .where('isTeamMember', '==', true)
      .where('firebaseUid', '==', null);
    
    if (limit) {
      teamMembersQuery = teamMembersQuery.limit(limit);
    }
    
    const teamMembersSnapshot = await teamMembersQuery.get();
    
    if (teamMembersSnapshot.empty) {
      console.log('✅ No team members found without Firebase UIDs. Migration not needed.');
      return;
    }
    
    console.log(`📊 Found ${teamMembersSnapshot.size} team members to migrate.\n`);
    
    // Process each team member
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };
    
    let processedCount = 0;
    
    for (const doc of teamMembersSnapshot.docs) {
      const teamMember = doc.data();
      processedCount++;
      
      console.log(`🔄 Processing ${processedCount}/${teamMembersSnapshot.size}: ${teamMember.email}`);
      
      // Check if Firebase user already exists
      const existingFirebaseUser = await checkFirebaseUserExists(teamMember.email);
      
      if (existingFirebaseUser) {
        console.log(`   ⚠️  Firebase user already exists (UID: ${existingFirebaseUser.uid})`);
        
        if (!isDryRun) {
          // Update Firestore with existing Firebase UID
          const updateResult = await updateFirestoreUser(doc.id, existingFirebaseUser.uid);
          if (updateResult.success) {
            console.log(`   ✅ Updated Firestore with existing Firebase UID`);
            results.successful.push({
              email: teamMember.email,
              firebaseUid: existingFirebaseUser.uid,
              action: 'linked_existing'
            });
          } else {
            console.log(`   ❌ Failed to update Firestore: ${updateResult.error}`);
            results.failed.push({
              email: teamMember.email,
              error: `Failed to update Firestore: ${updateResult.error}`
            });
          }
        } else {
          results.skipped.push({
            email: teamMember.email,
            reason: 'Firebase user already exists'
          });
        }
        
        continue;
      }
      
      // Create new Firebase user
      if (isDryRun) {
        console.log(`   🔍 Would create Firebase user with temporary password`);
        results.skipped.push({
          email: teamMember.email,
          reason: 'Dry run mode'
        });
      } else {
        const createResult = await createFirebaseUser(teamMember);
        
        if (createResult.success) {
          console.log(`   ✅ Created Firebase user (UID: ${createResult.firebaseUid})`);
          
          // Update Firestore with Firebase UID
          const updateResult = await updateFirestoreUser(doc.id, createResult.firebaseUid);
          
          if (updateResult.success) {
            console.log(`   ✅ Updated Firestore with Firebase UID`);
            results.successful.push({
              email: teamMember.email,
              firebaseUid: createResult.firebaseUid,
              temporaryPassword: createResult.temporaryPassword,
              action: 'created_new'
            });
          } else {
            console.log(`   ❌ Failed to update Firestore: ${updateResult.error}`);
            
            // Cleanup Firebase user if Firestore update fails
            try {
              await auth.deleteUser(createResult.firebaseUid);
              console.log(`   🧹 Cleaned up Firebase user after Firestore failure`);
            } catch (cleanupError) {
              console.log(`   ⚠️  Failed to cleanup Firebase user: ${cleanupError.message}`);
            }
            
            results.failed.push({
              email: teamMember.email,
              error: `Failed to update Firestore: ${updateResult.error}`
            });
          }
        } else {
          console.log(`   ❌ Failed to create Firebase user: ${createResult.error}`);
          results.failed.push({
            email: teamMember.email,
            error: `Failed to create Firebase user: ${createResult.error}`
          });
        }
      }
      
      // Add small delay to avoid rate limits
      if (!isDryRun) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Summary
    console.log('\n📋 Migration Summary:');
    console.log(`   ✅ Successful: ${results.successful.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);
    console.log(`   ⏭️  Skipped: ${results.skipped.length}`);
    console.log(`   📊 Total Processed: ${processedCount}\n`);
    
    if (results.successful.length > 0) {
      console.log('🎉 Successfully migrated team members:');
      results.successful.forEach(result => {
        if (result.action === 'created_new') {
          console.log(`   • ${result.email} - Created new Firebase user (UID: ${result.firebaseUid})`);
          console.log(`     Temporary password: ${result.temporaryPassword}`);
        } else {
          console.log(`   • ${result.email} - Linked existing Firebase user (UID: ${result.firebaseUid})`);
        }
      });
      console.log('');
    }
    
    if (results.failed.length > 0) {
      console.log('❌ Failed migrations:');
      results.failed.forEach(result => {
        console.log(`   • ${result.email} - ${result.error}`);
      });
      console.log('');
    }
    
    if (results.skipped.length > 0) {
      console.log('⏭️  Skipped migrations:');
      results.skipped.forEach(result => {
        console.log(`   • ${result.email} - ${result.reason}`);
      });
      console.log('');
    }
    
    if (isDryRun) {
      console.log('💡 This was a dry run. No changes were made.');
      console.log('   Run without --dry-run to perform the actual migration.');
    } else {
      console.log('🎯 Migration completed!');
      console.log('   Team members can now be verified in Firebase Console.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateTeamMembersToFirebase()
    .then(() => {
      console.log('\n✨ Migration process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error.message);
      process.exit(1);
    });
}

export { migrateTeamMembersToFirebase };
