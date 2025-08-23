#!/usr/bin/env node

/**
 * Delete Firebase Auth User Script
 * 
 * This script deletes a Firebase Auth user by email and also releases any licenses assigned to them.
 * Must be run with Firebase Admin SDK privileges.
 * 
 * Usage:
 * node delete-firebase-auth-user.js <email>
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function deleteFirebaseAuthUser(email) {
  try {
    console.log(`🔍 Looking up Firebase Auth user with email: ${email}`);
    
    // Step 1: Find the user by email
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`✅ Found Firebase Auth user: ${user.uid} (${user.email})`);
    } catch (error) {
      console.error(`❌ User with email ${email} not found in Firebase Auth:`, error);
      return;
    }
    
    // Step 2: Find and release any licenses assigned to this user
    console.log(`🔍 Finding licenses assigned to ${email}...`);
    
    const licensesQuery = await db.collection('licenses')
      .where('assignedToEmail', '==', email)
      .get();
    
    if (!licensesQuery.empty) {
      console.log(`📊 Found ${licensesQuery.size} licenses assigned to ${email}`);
      
      // Unassign each license
      const batch = db.batch();
      
      licensesQuery.docs.forEach(licenseDoc => {
        console.log(`🔄 Unassigning license ${licenseDoc.id}`);
        
        batch.update(licenseDoc.ref, {
          assignedToUserId: null,
          assignedToEmail: null,
          assignedAt: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log(`✅ Successfully released all licenses for ${email}`);
    } else {
      console.log(`ℹ️ No licenses found assigned to ${email}`);
    }
    
    // Step 3: Update team member status to REMOVED
    console.log(`🔍 Finding team member records for ${email}...`);
    
    const teamMembersQuery = await db.collection('teamMembers')
      .where('email', '==', email)
      .get();
    
    if (!teamMembersQuery.empty) {
      console.log(`📊 Found ${teamMembersQuery.size} team member records for ${email}`);
      
      // Mark each team member as REMOVED
      const batch = db.batch();
      
      teamMembersQuery.docs.forEach(memberDoc => {
        console.log(`🔄 Marking team member ${memberDoc.id} as REMOVED`);
        
        batch.update(memberDoc.ref, {
          status: 'REMOVED',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log(`✅ Successfully updated team member records for ${email}`);
    } else {
      console.log(`ℹ️ No team member records found for ${email}`);
    }
    
    // Step 4: Delete the Firebase Auth user
    console.log(`🗑️ Deleting Firebase Auth user ${user.uid}...`);
    
    await auth.deleteUser(user.uid);
    console.log(`✅ Successfully deleted Firebase Auth user ${user.uid} (${email})`);
    
    console.log(`\n🎉 All operations completed successfully for ${email}`);
    
  } catch (error) {
    console.error('❌ Error deleting Firebase Auth user:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address as an argument');
  console.log('Usage: node delete-firebase-auth-user.js <email>');
  process.exit(1);
}

// Run the deletion
deleteFirebaseAuthUser(email).then(() => {
  console.log('\n🏁 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Script failed:', error);
  process.exit(1);
});
