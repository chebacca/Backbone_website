#!/usr/bin/env node

/**
 * Check Team Member Data Script
 * 
 * This script investigates why the new team member isn't appearing
 * on the Team Management page despite being in Firebase Auth.
 * 
 * Usage: node check-team-member-data.js
 */

import admin from 'firebase-admin';

console.log('🔍 Investigating Team Member Data Issue...\n');

// Initialize Firebase Admin
try {
  console.log('1️⃣ Initializing Firebase Admin SDK...');
  
  const projectId = 'backbone-logic';
  console.log(`   Project ID: ${projectId}`);
  
  if (!admin.apps.length) {
    console.log('   Using Application Default Credentials...');
    admin.initializeApp({ projectId });
  }
  
  console.log('   ✅ Firebase Admin SDK initialized successfully\n');
} catch (error) {
  console.error('   ❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function investigateTeamMember() {
  const teamMemberEmail = 'team.member.1755581852099@enterprise-company.com';
  
  try {
    console.log('2️⃣ Checking Team Member Data in Firestore...\n');
    
    // Check users collection
    console.log('   📋 Checking users collection...');
    const usersQuery = await db.collection('users')
      .where('email', '==', teamMemberEmail)
      .limit(1)
      .get();
    
    if (usersQuery.empty) {
      console.log('   ❌ Team member NOT found in users collection');
    } else {
      const userDoc = usersQuery.docs[0];
      const userData = userDoc.data();
      
      console.log('   ✅ Team member found in users collection:');
      console.log(`      ID: ${userDoc.id}`);
      console.log(`      Email: ${userData.email}`);
      console.log(`      Name: ${userData.name}`);
      console.log(`      Role: ${userData.role}`);
      console.log(`      isTeamMember: ${userData.isTeamMember}`);
      console.log(`      organizationId: ${userData.organizationId}`);
      console.log(`      firebaseUid: ${userData.firebaseUid}`);
      console.log(`      Status: ${userData.status}`);
      console.log(`      License Type: ${userData.licenseType}`);
      console.log(`      Created At: ${userData.createdAt?.toDate?.() || userData.createdAt}`);
      console.log(`      Updated At: ${userData.updatedAt?.toDate?.() || userData.updatedAt}`);
    }
    
    // Check teamMembers collection (if it exists)
    console.log('\n   📋 Checking teamMembers collection...');
    try {
      const teamMembersQuery = await db.collection('teamMembers')
        .where('email', '==', teamMemberEmail)
        .limit(1)
        .get();
      
      if (teamMembersQuery.empty) {
        console.log('   ❌ Team member NOT found in teamMembers collection');
      } else {
        const tmDoc = teamMembersQuery.docs[0];
        const tmData = tmDoc.data();
        
        console.log('   ✅ Team member found in teamMembers collection:');
        console.log(`      ID: ${tmDoc.id}`);
        console.log(`      Email: ${tmData.email}`);
        console.log(`      Name: ${tmData.name}`);
        console.log(`      Organization ID: ${tmData.organizationId}`);
        console.log(`      Status: ${tmData.status}`);
        console.log(`      License Type: ${tmData.licenseType}`);
      }
    } catch (error) {
      console.log('   ⚠️  teamMembers collection does not exist or error:', error.message);
    }
    
    // Check organizations collection
    console.log('\n   🏢 Checking organizations collection...');
    const orgsQuery = await db.collection('organizations').get();
    
    if (orgsQuery.empty) {
      console.log('   ❌ No organizations found');
    } else {
      console.log(`   📊 Found ${orgsQuery.size} organizations:`);
      
      orgsQuery.docs.forEach((orgDoc, index) => {
        const orgData = orgDoc.data();
        console.log(`      ${index + 1}. ${orgData.name || 'Unnamed'} (ID: ${orgDoc.id})`);
        console.log(`         Owner: ${orgData.ownerUserId}`);
        console.log(`         Type: ${orgData.type}`);
        console.log(`         Status: ${orgData.status}`);
      });
    }
    
    // Check if there are any team members in the system
    console.log('\n   👥 Checking for existing team members in users collection...');
    const allUsersQuery = await db.collection('users')
      .where('isTeamMember', '==', true)
      .limit(10)
      .get();
    
    if (allUsersQuery.empty) {
      console.log('   ❌ No team members found in users collection');
    } else {
      console.log(`   📊 Found ${allUsersQuery.size} team members:`);
      
      allUsersQuery.docs.forEach((userDoc, index) => {
        const userData = userDoc.data();
        console.log(`      ${index + 1}. ${userData.name || 'No name'} (${userData.email})`);
        console.log(`         Role: ${userData.role}`);
        console.log(`         Status: ${userData.status}`);
        console.log(`         Organization: ${userData.organizationId || 'Not set'}`);
        console.log(`         Firebase UID: ${userData.firebaseUid || 'Not set'}`);
      });
    }
    
    // Check Firebase Auth
    console.log('\n   🔥 Checking Firebase Authentication...');
    try {
      const authUsers = await admin.auth().listUsers(10);
      const teamMemberAuth = authUsers.users.find(u => u.email === teamMemberEmail);
      
      if (teamMemberAuth) {
        console.log('   ✅ Team member found in Firebase Auth:');
        console.log(`      UID: ${teamMemberAuth.uid}`);
        console.log(`      Email: ${teamMemberAuth.email}`);
        console.log(`      Display Name: ${teamMemberAuth.displayName}`);
        console.log(`      Email Verified: ${teamMemberAuth.emailVerified}`);
        console.log(`      Disabled: ${teamMemberAuth.disabled}`);
        console.log(`      Created: ${new Date(teamMemberAuth.metadata.creationTime)}`);
      } else {
        console.log('   ❌ Team member NOT found in Firebase Auth');
      }
    } catch (error) {
      console.log('   ❌ Error checking Firebase Auth:', error.message);
    }
    
    // Check what the dashboard might be reading from
    console.log('\n   📊 Checking dashboard data sources...');
    
    // Look for any collections that might contain team member data
    const collections = ['teamMembers', 'members', 'organizationMembers', 'userOrganizations'];
    
    for (const collectionName of collections) {
      try {
        const collectionQuery = await db.collection(collectionName).limit(1).get();
        if (!collectionQuery.empty) {
          console.log(`   ✅ ${collectionName} collection exists with ${collectionQuery.size} documents`);
        } else {
          console.log(`   ⚠️  ${collectionName} collection exists but is empty`);
        }
      } catch (error) {
        console.log(`   ❌ ${collectionName} collection does not exist`);
      }
    }
    
    console.log('\n🔍 Investigation Complete!\n');
    
    // Summary and recommendations
    console.log('📋 Summary:');
    if (usersQuery.empty) {
      console.log('   ❌ Team member is missing from users collection');
      console.log('   💡 This explains why it\'s not showing on Team Management page');
    } else {
      console.log('   ✅ Team member exists in users collection');
      console.log('   💡 Check if the dashboard is reading from the correct collection');
    }
    
    console.log('\n🔧 Recommendations:');
    console.log('   1. Verify the dashboard is reading from the correct Firestore collection');
    console.log('   2. Check if there are any filters or queries excluding the new team member');
    console.log('   3. Ensure the team member has the correct organizationId and isTeamMember flags');
    console.log('   4. Check if the dashboard needs to be refreshed or if there are caching issues');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the investigation
investigateTeamMember()
  .then(() => {
    console.log('\n✨ Investigation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Investigation failed:', error.message);
    process.exit(1);
  });
