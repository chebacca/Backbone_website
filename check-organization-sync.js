#!/usr/bin/env node

/**
 * Check Organization Synchronization
 * 
 * This script checks why the team member count doesn't match
 * what the dashboard is displaying.
 * 
 * Usage: node check-organization-sync.js
 */

import admin from 'firebase-admin';

console.log('🔍 Checking Organization Synchronization...\n');

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

async function checkOrganizationSync() {
  const targetOrgId = 'C6L6jdoNbMs4QxcZ6IGI'; // Enterprise User Org
  
  try {
    console.log('2️⃣ Checking Organization Data...\n');
    
    // Get the organization
    const orgDoc = await db.collection('organizations').doc(targetOrgId).get();
    if (!orgDoc.exists) {
      console.log('   ❌ Organization not found');
      return;
    }
    
    const orgData = orgDoc.data();
    console.log('   🏢 Organization Details:');
    console.log(`      ID: ${targetOrgId}`);
    console.log(`      Name: ${orgData.name || 'Unnamed'}`);
    console.log(`      Owner: ${orgData.ownerUserId}`);
    console.log(`      Type: ${orgData.type || 'Not set'}`);
    console.log(`      Status: ${orgData.status || 'Not set'}`);
    
    // Check users collection for this organization
    console.log('\n3️⃣ Checking Users Collection...\n');
    const usersQuery = await db.collection('users')
      .where('organizationId', '==', targetOrgId)
      .get();
    
    console.log(`   📊 Users collection: Found ${usersQuery.size} users`);
    
    usersQuery.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`      ${index + 1}. ${data.name || 'No name'} (${data.email})`);
      console.log(`         Role: ${data.role}`);
      console.log(`         Status: ${data.status || 'Not set'}`);
      console.log(`         isTeamMember: ${data.isTeamMember}`);
      console.log(`         Firebase UID: ${data.firebaseUid || 'Not set'}`);
      console.log(`         Created: ${data.createdAt?.toDate?.() || data.createdAt || 'Not set'}`);
    });
    
    // Check teamMembers collection for this organization
    console.log('\n4️⃣ Checking TeamMembers Collection...\n');
    const teamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', targetOrgId)
      .get();
    
    console.log(`   📊 TeamMembers collection: Found ${teamMembersQuery.size} team members`);
    
    teamMembersQuery.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`      ${index + 1}. ${data.name || 'No name'} (${data.email})`);
      console.log(`         Status: ${data.status}`);
      console.log(`         License Type: ${data.licenseType}`);
      console.log(`         Firebase UID: ${data.firebaseUid || 'Not set'}`);
      console.log(`         Created: ${data.createdAt?.toDate?.() || data.createdAt || 'Not set'}`);
    });
    
    // Check for any organization-specific collections
    console.log('\n5️⃣ Checking Organization-Specific Collections...\n');
    
    // Look for any subcollections or organization-specific data
    try {
      const subcollections = await orgDoc.ref.listCollections();
      if (subcollections.length > 0) {
        console.log(`   📁 Found ${subcollections.length} subcollections:`);
        
        for (const subcol of subcollections) {
          const subQuery = await subcol.get();
          console.log(`      📂 ${subcol.id}: ${subQuery.size} documents`);
          
          if (subQuery.size > 0) {
            subQuery.docs.slice(0, 3).forEach((doc, index) => {
              const data = doc.data();
              console.log(`         ${index + 1}. ${data.name || data.email || 'No name'}`);
            });
          }
        }
      } else {
        console.log('   ❌ No subcollections found');
      }
    } catch (error) {
      console.log('   ⚠️  Error checking subcollections:', error.message);
    }
    
    // Check for any cached or computed data
    console.log('\n6️⃣ Checking for Cached/Computed Data...\n');
    
    // Look for any collections that might store computed member counts
    const computedCollections = [
      'organizationStats',
      'orgStats', 
      'memberCounts',
      'organizationMetrics',
      'orgMetrics'
    ];
    
    for (const collectionName of computedCollections) {
      try {
        const query = await db.collection(collectionName)
          .where('organizationId', '==', targetOrgId)
          .limit(1)
          .get();
        
        if (!query.empty) {
          console.log(`   ✅ Found computed data in ${collectionName}:`);
          const doc = query.docs[0];
          const data = doc.data();
          console.log(`      Document ID: ${doc.id}`);
          console.log(`      Data: ${JSON.stringify(data, null, 2)}`);
        }
      } catch (error) {
        // Collection doesn't exist
      }
    }
    
    // Check if there are any other users that might be counted
    console.log('\n7️⃣ Checking for Hidden/Inactive Members...\n');
    
    // Look for users that might have different statuses
    const allUsersQuery = await db.collection('users').get();
    const orgUsers = allUsersQuery.docs.filter(doc => {
      const data = doc.data();
      return data.organizationId === targetOrgId;
    });
    
    console.log(`   📊 Total users with this organizationId: ${orgUsers.length}`);
    
    // Check for any users that might be counted but not visible
    const visibleUsers = orgUsers.filter(doc => {
      const data = doc.data();
      return data.status === 'ACTIVE' || !data.status;
    });
    
    console.log(`   👁️  Visible users (ACTIVE or no status): ${visibleUsers.length}`);
    
    const hiddenUsers = orgUsers.filter(doc => {
      const data = doc.data();
      return data.status === 'INACTIVE' || data.status === 'SUSPENDED' || data.status === 'DELETED';
    });
    
    if (hiddenUsers.length > 0) {
      console.log(`   🚫 Hidden users: ${hiddenUsers.length}`);
      hiddenUsers.forEach((doc, index) => {
        const data = doc.data();
        console.log(`      ${index + 1}. ${data.name || 'No name'} (${data.email}) - Status: ${data.status}`);
      });
    }
    
    // Summary
    console.log('\n🔍 Investigation Summary:\n');
    console.log(`   • Users collection: ${usersQuery.size} members`);
    console.log(`   • TeamMembers collection: ${teamMembersQuery.size} members`);
    console.log(`   • Total with organizationId: ${orgUsers.length}`);
    console.log(`   • Visible users: ${visibleUsers.length}`);
    console.log(`   • Hidden users: ${hiddenUsers.length}`);
    
    console.log('\n🔧 Possible Issues:');
    if (usersQuery.size !== teamMembersQuery.size) {
      console.log('   ❌ Collection count mismatch - users vs teamMembers');
    }
    
    if (orgUsers.length !== usersQuery.size) {
      console.log('   ❌ OrganizationId filter mismatch');
    }
    
    if (visibleUsers.length !== 6) {
      console.log(`   ❌ Visible count (${visibleUsers.length}) doesn't match dashboard (6)`);
    }
    
    console.log('\n💡 Recommendations:');
    console.log('   1. Check if dashboard is reading from a different collection');
    console.log('   2. Look for any client-side filtering or caching');
    console.log('   3. Check if there are any computed/cached member counts');
    console.log('   4. Verify the dashboard API endpoint being called');
    console.log('   5. Check browser network tab for the actual API call');
    
  } catch (error) {
    console.error('❌ Organization sync check failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
checkOrganizationSync()
  .then(() => {
    console.log('\n✨ Organization sync check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Organization sync check failed:', error.message);
    process.exit(1);
  });
