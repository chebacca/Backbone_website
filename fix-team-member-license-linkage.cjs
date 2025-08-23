#!/usr/bin/env node

/**
 * Fix Team Member License Linkage Script
 * This script ensures team members from orgMembers are properly synced to teamMembers collection
 * with valid license information from the enterprise user account
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin using Application Default Credentials
// This will use the Firebase CLI authentication
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixTeamMemberLicenseLinkage() {
  try {
    console.log('🔍 Starting team member license linkage fix...');
    
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
    
    // Step 2: Get enterprise user's organization
    const orgsQuery = await db.collection('orgMembers')
      .where('userId', '==', enterpriseUser.id)
      .where('role', '==', 'OWNER')
      .limit(1)
      .get();
    
    if (orgsQuery.empty) {
      console.log('❌ No organization found for enterprise user');
      return;
    }
    
    const ownerMember = orgsQuery.docs[0].data();
    const organizationId = ownerMember.orgId;
    console.log('🏢 Organization ID:', organizationId);
    
    // Step 3: Get all organization members
    const orgMembersQuery = await db.collection('orgMembers')
      .where('orgId', '==', organizationId)
      .where('status', '==', 'ACTIVE')
      .get();
    
    console.log(`👥 Found ${orgMembersQuery.size} active organization members`);
    
    // Step 4: Get enterprise user's subscription and licenses
    const subscriptionsQuery = await db.collection('subscriptions')
      .where('userId', '==', enterpriseUser.id)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    let availableLicenses = [];
    if (!subscriptionsQuery.empty) {
      const subscription = subscriptionsQuery.docs[0];
      const subscriptionData = subscription.data();
      console.log('💳 Enterprise subscription found:', subscription.id, subscriptionData.plan);
      
      // Get licenses for this subscription
      const licensesQuery = await db.collection('licenses')
        .where('subscriptionId', '==', subscription.id)
        .where('status', '==', 'ACTIVE')
        .get();
      
      availableLicenses = licensesQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`🎫 Found ${availableLicenses.length} available licenses`);
    }
    
    // Step 5: Sync organization members to teamMembers collection
    const batch = db.batch();
    let syncedCount = 0;
    
    for (const orgMemberDoc of orgMembersQuery.docs) {
      const orgMember = orgMemberDoc.data();
      
      console.log(`\n🔄 Processing member: ${orgMember.name || orgMember.email}`);
      
      // Check if team member already exists in teamMembers collection
      const existingTeamMemberQuery = await db.collection('teamMembers')
        .where('email', '==', orgMember.email)
        .limit(1)
        .get();
      
      let teamMemberRef;
      let isUpdate = false;
      
      if (!existingTeamMemberQuery.empty) {
        teamMemberRef = existingTeamMemberQuery.docs[0].ref;
        isUpdate = true;
        console.log('   📝 Updating existing team member record');
      } else {
        teamMemberRef = db.collection('teamMembers').doc();
        console.log('   ➕ Creating new team member record');
      }
      
      // Assign a license if available and not already assigned
      let assignedLicense = null;
      if (availableLicenses.length > 0) {
        // Find an unassigned license
        const unassignedLicense = availableLicenses.find(license => !license.assignedToUserId);
        if (unassignedLicense) {
          assignedLicense = unassignedLicense;
          // Mark license as assigned
          unassignedLicense.assignedToUserId = orgMember.userId || 'pending';
          
          // Update the license in Firestore
          batch.update(db.collection('licenses').doc(unassignedLicense.id), {
            assignedToUserId: orgMember.userId || 'pending',
            assignedToEmail: orgMember.email,
            assignedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`   🎫 Assigned license: ${unassignedLicense.id} (${unassignedLicense.type || 'ENTERPRISE'})`);
        }
      }
      
      // Create/update team member data
      const teamMemberData = {
        email: orgMember.email,
        name: orgMember.name || `${orgMember.firstName || ''} ${orgMember.lastName || ''}`.trim() || orgMember.email,
        firstName: orgMember.firstName,
        lastName: orgMember.lastName,
        role: orgMember.role || 'MEMBER',
        status: 'ACTIVE',
        organizationId: organizationId,
        orgId: organizationId, // Support both field names
        department: orgMember.department || 'Engineering',
        licenseType: orgMember.licenseType || assignedLicense?.type || 'ENTERPRISE',
        licenseId: assignedLicense?.id,
        firebaseUid: orgMember.firebaseUid,
        isEmailVerified: true,
        permissions: ['read', 'write'],
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (!isUpdate) {
        teamMemberData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }
      
      batch.set(teamMemberRef, teamMemberData, { merge: true });
      syncedCount++;
      
      console.log(`   ✅ ${isUpdate ? 'Updated' : 'Created'} team member with license: ${teamMemberData.licenseType}`);
    }
    
    // Step 6: Commit all changes
    if (syncedCount > 0) {
      await batch.commit();
      console.log(`\n🎉 Successfully synced ${syncedCount} team members to teamMembers collection!`);
    } else {
      console.log('\n⏭️  No team members to sync');
    }
    
    // Step 7: Verify the sync
    console.log('\n🔍 Verifying sync...');
    const teamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`✅ teamMembers collection now has ${teamMembersQuery.size} members for organization ${organizationId}`);
    
    teamMembersQuery.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.name} (${data.email})`);
      console.log(`     License: ${data.licenseType} ${data.licenseId ? `(ID: ${data.licenseId})` : ''}`);
      console.log(`     Role: ${data.role}`);
      console.log(`     Status: ${data.status}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error fixing team member license linkage:', error);
  }
}

// Run the fix
fixTeamMemberLicenseLinkage().catch(console.error);
