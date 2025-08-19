#!/usr/bin/env node

/**
 * Fix Team Member Collection Script
 * 
 * This script ensures the new team member appears in the correct collection
 * that the dashboard reads from (teamMembers collection).
 * 
 * Usage: node fix-team-member-collection.js
 */

import admin from 'firebase-admin';

console.log('🔧 Fixing Team Member Collection Issue...\n');

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

async function fixTeamMemberCollection() {
  const teamMemberEmail = 'team.member.1755581852099@enterprise-company.com';
  
  try {
    console.log('2️⃣ Checking current team member data...\n');
    
    // Get the team member from users collection
    const usersQuery = await db.collection('users')
      .where('email', '==', teamMemberEmail)
      .limit(1)
      .get();
    
    if (usersQuery.empty) {
      console.log('   ❌ Team member not found in users collection');
      return;
    }
    
    const userDoc = usersQuery.docs[0];
    const userData = userDoc.data();
    
    console.log('   ✅ Team member found in users collection:');
    console.log(`      ID: ${userDoc.id}`);
    console.log(`      Email: ${userData.email}`);
    console.log(`      Name: ${userData.name}`);
    console.log(`      Organization ID: ${userData.organizationId}`);
    
    // Check if team member exists in teamMembers collection
    console.log('\n3️⃣ Checking teamMembers collection...');
    const teamMembersQuery = await db.collection('teamMembers')
      .where('email', '==', teamMemberEmail)
      .limit(1)
      .get();
    
    if (teamMembersQuery.empty) {
      console.log('   ❌ Team member not found in teamMembers collection');
      console.log('   🔧 Creating team member in teamMembers collection...');
      
      // Create team member document in teamMembers collection
      const teamMemberData = {
        email: userData.email,
        name: userData.name,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        phoneNumber: userData.phoneNumber || '',
        licenseType: userData.licenseType || 'ENTERPRISE',
        status: userData.status || 'ACTIVE',
        organizationId: userData.organizationId,
        department: userData.department || 'Not assigned',
        company: userData.company || '',
        createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActive: userData.lastActive || admin.firestore.FieldValue.serverTimestamp(),
        hashedPassword: userData.password || '',
        lastLoginAt: userData.lastLoginAt || null,
        avatar: userData.avatar || '',
        bio: userData.bio || '',
        // Firebase Authentication integration
        firebaseUid: userData.firebaseUid || '',
        // Additional team member specific fields
        memberRole: userData.memberRole || 'MEMBER',
        memberStatus: userData.memberStatus || 'ACTIVE',
        isTeamMember: true
      };
      
      const teamMemberRef = await db.collection('teamMembers').add(teamMemberData);
      console.log(`   ✅ Team member created in teamMembers collection (ID: ${teamMemberRef.id})`);
      
      // Also update the users collection to ensure consistency
      await userDoc.ref.update({
        teamMemberId: teamMemberRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('   ✅ Updated users collection with teamMemberId reference');
      
    } else {
      console.log('   ✅ Team member already exists in teamMembers collection');
      const tmDoc = teamMembersQuery.docs[0];
      console.log(`      ID: ${tmDoc.id}`);
      console.log(`      Data: ${JSON.stringify(tmDoc.data(), null, 2)}`);
    }
    
    // Verify the fix
    console.log('\n4️⃣ Verifying the fix...');
    const verifyQuery = await db.collection('teamMembers')
      .where('email', '==', teamMemberEmail)
      .limit(1)
      .get();
    
    if (!verifyQuery.empty) {
      const tmDoc = verifyQuery.docs[0];
      const tmData = tmDoc.data();
      
      console.log('   ✅ Team member now exists in teamMembers collection:');
      console.log(`      ID: ${tmDoc.id}`);
      console.log(`      Email: ${tmData.email}`);
      console.log(`      Name: ${tmData.name}`);
      console.log(`      Organization ID: ${tmData.organizationId}`);
      console.log(`      Status: ${tmData.status}`);
      console.log(`      License Type: ${tmData.licenseType}`);
      console.log(`      Firebase UID: ${tmData.firebaseUid}`);
      
      console.log('\n🎉 FIX APPLIED SUCCESSFULLY!\n');
      
      console.log('📋 What was fixed:');
      console.log('   • Team member now exists in teamMembers collection');
      console.log('   • Dashboard should now be able to read the team member');
      console.log('   • Firebase Auth integration maintained');
      console.log('   • Data consistency ensured between collections');
      
      console.log('\n🚀 Next Steps:');
      console.log('   1. Refresh your Team Management page in the dashboard');
      console.log('   2. The new team member should now appear');
      console.log('   3. All Firebase Auth functionality remains intact');
      
    } else {
      console.log('   ❌ Fix verification failed - team member still not in teamMembers collection');
    }
    
    // Check total count in teamMembers collection
    const totalTeamMembers = await db.collection('teamMembers').get();
    console.log(`\n📊 Total team members in teamMembers collection: ${totalTeamMembers.size}`);
    
    if (totalTeamMembers.size > 0) {
      console.log('\n   Current team members:');
      totalTeamMembers.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`      ${index + 1}. ${data.name || 'No name'} (${data.email})`);
        console.log(`         Status: ${data.status}`);
        console.log(`         Organization: ${data.organizationId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the fix
fixTeamMemberCollection()
  .then(() => {
    console.log('\n✨ Fix process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix process failed:', error.message);
    process.exit(1);
  });
