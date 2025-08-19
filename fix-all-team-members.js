#!/usr/bin/env node

/**
 * Fix All Team Members Script
 * 
 * This script ensures ALL users in the organization are properly represented
 * in the teamMembers collection so the dashboard shows the correct count.
 * 
 * Usage: node fix-all-team-members.js
 */

import admin from 'firebase-admin';

console.log('🔧 Fixing All Team Members in Organization...\n');

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

async function fixAllTeamMembers() {
  const targetOrgId = 'C6L6jdoNbMs4QxcZ6IGI'; // Enterprise User Org
  
  try {
    console.log('2️⃣ Getting all users in the organization...\n');
    
    // Get all users in this organization
    const usersQuery = await db.collection('users')
      .where('organizationId', '==', targetOrgId)
      .get();
    
    if (usersQuery.empty) {
      console.log('   ❌ No users found in this organization');
      return;
    }
    
    console.log(`   📊 Found ${usersQuery.size} users in organization`);
    
    // Get existing team members
    const existingTeamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', targetOrgId)
      .get();
    
    const existingEmails = new Set();
    existingTeamMembersQuery.docs.forEach(doc => {
      const data = doc.data();
      existingEmails.add(data.email);
    });
    
    console.log(`   📋 Existing team members: ${existingEmails.size}`);
    existingEmails.forEach(email => console.log(`      • ${email}`));
    
    // Process each user
    console.log('\n3️⃣ Processing each user...\n');
    
    const results = {
      created: [],
      updated: [],
      skipped: [],
      errors: []
    };
    
    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();
      const userEmail = userData.email;
      
      console.log(`   🔍 Processing: ${userData.name || 'No name'} (${userEmail})`);
      
      if (existingEmails.has(userEmail)) {
        console.log(`      ✅ Already exists in teamMembers collection`);
        results.skipped.push(userEmail);
        continue;
      }
      
      // Create team member document
      try {
        console.log(`      🔧 Creating team member document...`);
        
        const teamMemberData = {
          email: userEmail,
          name: userData.name || userEmail.split('@')[0],
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
          phoneNumber: userData.phoneNumber || '',
          licenseType: userData.licenseType || 'BASIC',
          status: userData.status || 'ACTIVE',
          organizationId: targetOrgId,
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
          isTeamMember: true,
          // Preserve original user data
          originalUserId: userDoc.id,
          originalRole: userData.role
        };
        
        const teamMemberRef = await db.collection('teamMembers').add(teamMemberData);
        console.log(`      ✅ Created team member document (ID: ${teamMemberRef.id})`);
        
        // Update the users collection to link to team member
        await userDoc.ref.update({
          teamMemberId: teamMemberRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`      ✅ Updated users collection with teamMemberId reference`);
        
        results.created.push({
          email: userEmail,
          name: userData.name,
          teamMemberId: teamMemberRef.id,
          userId: userDoc.id
        });
        
      } catch (error) {
        console.error(`      ❌ Failed to create team member: ${error.message}`);
        results.errors.push({
          email: userEmail,
          error: error.message
        });
      }
    }
    
    // Verify the fix
    console.log('\n4️⃣ Verifying the fix...\n');
    
    const finalTeamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', targetOrgId)
      .get();
    
    console.log(`   📊 Final team members count: ${finalTeamMembersQuery.size}`);
    
    finalTeamMembersQuery.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`      ${index + 1}. ${data.name || 'No name'} (${data.email})`);
      console.log(`         Status: ${data.status}`);
      console.log(`         License Type: ${data.licenseType}`);
      console.log(`         Firebase UID: ${data.firebaseUid || 'Not set'}`);
    });
    
    // Summary
    console.log('\n🎉 Fix Applied Successfully!\n');
    
    console.log('📋 Summary:');
    console.log(`   • Users in organization: ${usersQuery.size}`);
    console.log(`   • Team members created: ${results.created.length}`);
    console.log(`   • Team members skipped: ${results.skipped.length}`);
    console.log(`   • Errors: ${results.errors.length}`);
    console.log(`   • Final team members count: ${finalTeamMembersQuery.size}`);
    
    if (results.created.length > 0) {
      console.log('\n✅ New team members created:');
      results.created.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name} (${result.email})`);
        console.log(`      Team Member ID: ${result.teamMemberId}`);
        console.log(`      User ID: ${result.userId}`);
      });
    }
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.email}: ${error.error}`);
      });
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Refresh your Team Management page in the dashboard');
    console.log('   2. The member count should now match the actual users');
    console.log('   3. All users should now appear in the team list');
    console.log('   4. Firebase Auth integration remains intact');
    
    // Check if the count now matches
    if (finalTeamMembersQuery.size === usersQuery.size) {
      console.log('\n🎯 SUCCESS: Team member count now matches user count!');
      console.log('   The dashboard should now display the correct number of members.');
    } else {
      console.log('\n⚠️  WARNING: Count mismatch still exists');
      console.log(`   Users: ${usersQuery.size}, Team Members: ${finalTeamMembersQuery.size}`);
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the fix
fixAllTeamMembers()
  .then(() => {
    console.log('\n✨ Fix process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix process failed:', error.message);
    process.exit(1);
  });
