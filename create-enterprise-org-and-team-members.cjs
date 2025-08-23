#!/usr/bin/env node

/**
 * Create Enterprise Organization and Team Members Script
 * This script creates the missing organization for enterprise.user@example.com
 * and properly seeds team members with valid licenses
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin using Application Default Credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function createEnterpriseOrgAndTeamMembers() {
  try {
    console.log('🔍 Creating enterprise organization and team members...');
    
    // Step 1: Find the enterprise user
    const enterpriseUserQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .limit(1)
      .get();
    
    if (enterpriseUserQuery.empty) {
      console.log('❌ Enterprise user not found');
      return;
    }
    
    const enterpriseUser = enterpriseUserQuery.docs[0];
    const enterpriseUserData = enterpriseUser.data();
    console.log('✅ Enterprise user found:', enterpriseUser.id, enterpriseUserData.email);
    
    // Step 2: Create organization if it doesn't exist
    let organizationId = 'C6L6jdoNbMs4QxcZ6IGI'; // Use the org ID from your logs
    
    const orgDoc = await db.collection('organizations').doc(organizationId).get();
    if (!orgDoc.exists) {
      await db.collection('organizations').doc(organizationId).set({
        name: 'Enterprise Organization',
        ownerUserId: enterpriseUser.id,
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        maxSeats: 250,
        usedSeats: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Created organization:', organizationId);
    } else {
      console.log('✅ Organization already exists:', organizationId);
    }
    
    // Step 3: Create owner org member record
    const ownerMemberQuery = await db.collection('orgMembers')
      .where('orgId', '==', organizationId)
      .where('userId', '==', enterpriseUser.id)
      .limit(1)
      .get();
    
    if (ownerMemberQuery.empty) {
      await db.collection('orgMembers').add({
        orgId: organizationId,
        userId: enterpriseUser.id,
        email: enterpriseUserData.email,
        name: enterpriseUserData.name || 'Enterprise Owner',
        role: 'OWNER',
        status: 'ACTIVE',
        seatReserved: true,
        licenseType: 'ENTERPRISE',
        invitedAt: admin.firestore.FieldValue.serverTimestamp(),
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Created owner org member record');
    }
    
    // Step 4: Create sample team members
    const sampleMembers = [
      {
        email: 'lissa@apple.com',
        firstName: 'Lissa',
        lastName: 'Tusjones',
        name: 'Lissa Tusjones',
        role: 'MEMBER',
        licenseType: 'ENTERPRISE',
        department: 'Engineering'
      },
      {
        email: 'audrey.johnson@enterprise.com',
        firstName: 'Audrey',
        lastName: 'Johnson',
        name: 'Audrey Johnson',
        role: 'MANAGER',
        licenseType: 'PROFESSIONAL',
        department: 'Management'
      },
      {
        email: 'marcus.rodriguez@enterprise.com',
        firstName: 'Marcus',
        lastName: 'Rodriguez',
        name: 'Marcus Rodriguez',
        role: 'MEMBER',
        licenseType: 'PROFESSIONAL',
        department: 'Engineering'
      }
    ];
    
    console.log('\n👥 Creating team members...');
    
    for (const memberData of sampleMembers) {
      // Check if org member already exists
      const existingOrgMemberQuery = await db.collection('orgMembers')
        .where('orgId', '==', organizationId)
        .where('email', '==', memberData.email)
        .limit(1)
        .get();
      
      let orgMemberId;
      if (existingOrgMemberQuery.empty) {
        const orgMemberRef = await db.collection('orgMembers').add({
          orgId: organizationId,
          email: memberData.email,
          name: memberData.name,
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          role: memberData.role,
          status: 'ACTIVE',
          seatReserved: true,
          licenseType: memberData.licenseType,
          department: memberData.department,
          invitedByUserId: enterpriseUser.id,
          invitedAt: admin.firestore.FieldValue.serverTimestamp(),
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        orgMemberId = orgMemberRef.id;
        console.log(`   ✅ Created org member: ${memberData.name} (${orgMemberId})`);
      } else {
        orgMemberId = existingOrgMemberQuery.docs[0].id;
        console.log(`   ⏭️  Org member already exists: ${memberData.name}`);
      }
      
      // Create/update team member in teamMembers collection
      const existingTeamMemberQuery = await db.collection('teamMembers')
        .where('email', '==', memberData.email)
        .limit(1)
        .get();
      
      const teamMemberData = {
        email: memberData.email,
        name: memberData.name,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        role: memberData.role,
        status: 'ACTIVE',
        organizationId: organizationId,
        orgId: organizationId, // Support both field names
        department: memberData.department,
        licenseType: memberData.licenseType,
        isEmailVerified: true,
        permissions: ['read', 'write'],
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (existingTeamMemberQuery.empty) {
        teamMemberData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await db.collection('teamMembers').add(teamMemberData);
        console.log(`   ✅ Created team member: ${memberData.name}`);
      } else {
        await existingTeamMemberQuery.docs[0].ref.update(teamMemberData);
        console.log(`   📝 Updated team member: ${memberData.name}`);
      }
    }
    
    // Step 5: Verify the setup
    console.log('\n🔍 Verifying setup...');
    
    const teamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`✅ teamMembers collection now has ${teamMembersQuery.size} members for organization ${organizationId}`);
    
    teamMembersQuery.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.name} (${data.email})`);
      console.log(`     License: ${data.licenseType}`);
      console.log(`     Role: ${data.role}`);
      console.log(`     Status: ${data.status}`);
      console.log('');
    });
    
    console.log('🎉 Enterprise organization and team members setup completed!');
    
  } catch (error) {
    console.error('❌ Error creating enterprise org and team members:', error);
  }
}

// Run the setup
createEnterpriseOrgAndTeamMembers().catch(console.error);
