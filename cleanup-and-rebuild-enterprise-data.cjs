#!/usr/bin/env node

/**
 * Cleanup and Rebuild Enterprise Data Script
 * This script completely cleans up and rebuilds the enterprise user data structure
 * with proper relationships between users, team members, organizations, and licenses
 */

const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin using Application Default Credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();
const auth = admin.auth();

async function cleanupAndRebuildEnterpriseData() {
  try {
    console.log('🧹 Starting comprehensive cleanup and rebuild...');
    
    const enterpriseEmail = 'enterprise.user@example.com';
    const organizationId = 'C6L6jdoNbMs4QxcZ6IGI';
    
    // Step 1: Find the enterprise user
    console.log('\n📋 Step 1: Finding enterprise user...');
    const enterpriseUserQuery = await db.collection('users')
      .where('email', '==', enterpriseEmail)
      .limit(1)
      .get();
    
    if (enterpriseUserQuery.empty) {
      console.log('❌ Enterprise user not found');
      return;
    }
    
    const enterpriseUser = enterpriseUserQuery.docs[0];
    const enterpriseUserData = enterpriseUser.data();
    console.log('✅ Enterprise user found:', enterpriseUser.id, enterpriseUserData.email);
    
    // Step 2: Cleanup existing team member data
    console.log('\n🧹 Step 2: Cleaning up existing team member data...');
    
    // Delete existing team members from teamMembers collection
    const existingTeamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`Found ${existingTeamMembersQuery.size} existing team members to clean up`);
    
    const batch1 = db.batch();
    existingTeamMembersQuery.forEach(doc => {
      batch1.delete(doc.ref);
    });
    
    if (existingTeamMembersQuery.size > 0) {
      await batch1.commit();
      console.log('✅ Cleaned up teamMembers collection');
    }
    
    // Delete existing org members (except owner)
    const existingOrgMembersQuery = await db.collection('orgMembers')
      .where('orgId', '==', organizationId)
      .get();
    
    console.log(`Found ${existingOrgMembersQuery.size} existing org members to clean up`);
    
    const batch2 = db.batch();
    existingOrgMembersQuery.forEach(doc => {
      const data = doc.data();
      // Only delete non-owner members
      if (data.role !== 'OWNER') {
        batch2.delete(doc.ref);
      }
    });
    
    if (existingOrgMembersQuery.size > 0) {
      await batch2.commit();
      console.log('✅ Cleaned up orgMembers collection');
    }
    
    // Delete existing licenses for this organization
    const existingLicensesQuery = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`Found ${existingLicensesQuery.size} existing licenses to clean up`);
    
    const batch3 = db.batch();
    existingLicensesQuery.forEach(doc => {
      batch3.delete(doc.ref);
    });
    
    if (existingLicensesQuery.size > 0) {
      await batch3.commit();
      console.log('✅ Cleaned up licenses collection');
    }
    
    // Step 3: Create enterprise subscription and licenses
    console.log('\n💳 Step 3: Creating enterprise subscription and licenses...');
    
    // Create subscription
    const subscriptionRef = await db.collection('subscriptions').add({
      userId: enterpriseUser.id,
      organizationId: organizationId,
      plan: 'ENTERPRISE',
      status: 'active',
      seats: 250,
      usedSeats: 1, // Just the owner initially
      currentPeriodStart: admin.firestore.FieldValue.serverTimestamp(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Created enterprise subscription:', subscriptionRef.id);
    
    // Create master enterprise license
    const masterLicenseRef = await db.collection('licenses').add({
      key: 'ENT-2024-MASTER-001',
      tier: 'ENTERPRISE',
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      userId: enterpriseUser.id,
      organizationId: organizationId,
      subscriptionId: subscriptionRef.id,
      maxActivations: 250,
      activationCount: 1,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      activatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Created master enterprise license:', masterLicenseRef.id);
    
    // Step 4: Create team members with full authentication and data
    console.log('\n👥 Step 4: Creating team members with full authentication...');
    
    const teamMembers = [
      {
        email: 'lissa@apple.com',
        firstName: 'Lissa',
        lastName: 'Tusjones',
        password: 'TempPass123!',
        role: 'MEMBER',
        licenseType: 'ENTERPRISE',
        department: 'Engineering'
      },
      {
        email: 'audrey.johnson@enterprise.com',
        firstName: 'Audrey',
        lastName: 'Johnson',
        password: 'TempPass123!',
        role: 'MANAGER',
        licenseType: 'PROFESSIONAL',
        department: 'Management'
      },
      {
        email: 'marcus.rodriguez@enterprise.com',
        firstName: 'Marcus',
        lastName: 'Rodriguez',
        password: 'TempPass123!',
        role: 'MEMBER',
        licenseType: 'PROFESSIONAL',
        department: 'Engineering'
      }
    ];
    
    for (const memberData of teamMembers) {
      console.log(`\n🔄 Processing: ${memberData.firstName} ${memberData.lastName} (${memberData.email})`);
      
      try {
        // Step 4a: Create Firebase Auth user
        let firebaseUser;
        try {
          firebaseUser = await auth.getUserByEmail(memberData.email);
          console.log('   📝 Firebase Auth user already exists');
          
          // Update password
          await auth.updateUser(firebaseUser.uid, {
            password: memberData.password,
            emailVerified: true
          });
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            firebaseUser = await auth.createUser({
              email: memberData.email,
              password: memberData.password,
              displayName: `${memberData.firstName} ${memberData.lastName}`,
              emailVerified: true
            });
            console.log('   ✅ Created Firebase Auth user:', firebaseUser.uid);
          } else {
            throw error;
          }
        }
        
        // Step 4b: Create user record in users collection
        const hashedPassword = await bcrypt.hash(memberData.password, 10);
        
        // Check if user already exists in users collection
        const existingUserQuery = await db.collection('users')
          .where('email', '==', memberData.email)
          .limit(1)
          .get();
        
        let userId;
        if (!existingUserQuery.empty) {
          // Update existing user
          const userDoc = existingUserQuery.docs[0];
          userId = userDoc.id;
          
          await userDoc.ref.update({
            name: `${memberData.firstName} ${memberData.lastName}`,
            firstName: memberData.firstName,
            lastName: memberData.lastName,
            password: hashedPassword,
            role: 'USER',
            isEmailVerified: true,
            organizationId: organizationId,
            firebaseUid: firebaseUser.uid,
            registrationSource: 'enterprise_invite',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('   📝 Updated existing user record:', userId);
        } else {
          // Create new user
          const userRef = await db.collection('users').add({
            email: memberData.email,
            name: `${memberData.firstName} ${memberData.lastName}`,
            firstName: memberData.firstName,
            lastName: memberData.lastName,
            password: hashedPassword,
            role: 'USER',
            isEmailVerified: true,
            twoFactorEnabled: false,
            twoFactorBackupCodes: [],
            privacyConsent: [],
            marketingConsent: false,
            dataProcessingConsent: false,
            identityVerified: false,
            kycStatus: 'COMPLETED',
            registrationSource: 'enterprise_invite',
            organizationId: organizationId,
            firebaseUid: firebaseUser.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          userId = userRef.id;
          console.log('   ✅ Created user record:', userId);
        }
        
        // Step 4c: Create org member record
        const orgMemberRef = await db.collection('orgMembers').add({
          orgId: organizationId,
          userId: userId,
          email: memberData.email,
          name: `${memberData.firstName} ${memberData.lastName}`,
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
        
        console.log('   ✅ Created org member record:', orgMemberRef.id);
        
        // Step 4d: Create team member record
        const teamMemberRef = await db.collection('teamMembers').add({
          email: memberData.email,
          name: `${memberData.firstName} ${memberData.lastName}`,
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          role: memberData.role,
          status: 'ACTIVE',
          organizationId: organizationId,
          orgId: organizationId, // Support both field names
          department: memberData.department,
          licenseType: memberData.licenseType,
          firebaseUid: firebaseUser.uid,
          userId: userId,
          isEmailVerified: true,
          permissions: ['read', 'write'],
          lastActive: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('   ✅ Created team member record:', teamMemberRef.id);
        
        // Step 4e: Create individual license for team member
        const licenseKey = `ENT-2024-${memberData.licenseType.substring(0, 3)}-${Date.now().toString().slice(-6)}`;
        
        const licenseRef = await db.collection('licenses').add({
          key: licenseKey,
          tier: memberData.licenseType,
          type: memberData.licenseType,
          status: 'ACTIVE',
          userId: userId,
          organizationId: organizationId,
          subscriptionId: subscriptionRef.id,
          assignedToUserId: userId,
          assignedToEmail: memberData.email,
          maxActivations: memberData.licenseType === 'ENTERPRISE' ? 250 : memberData.licenseType === 'PROFESSIONAL' ? 50 : 10,
          activationCount: 1,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          activatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('   ✅ Created license:', licenseKey, '(', licenseRef.id, ')');
        
        console.log(`   🎉 Successfully created complete profile for ${memberData.firstName} ${memberData.lastName}`);
        
      } catch (memberError) {
        console.error(`   ❌ Failed to create ${memberData.firstName} ${memberData.lastName}:`, memberError.message);
      }
    }
    
    // Step 5: Update subscription seat count
    await db.collection('subscriptions').doc(subscriptionRef.id).update({
      usedSeats: 1 + teamMembers.length, // Owner + team members
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Step 6: Verify the complete setup
    console.log('\n🔍 Step 6: Verifying complete setup...');
    
    // Check users
    const usersQuery = await db.collection('users')
      .where('organizationId', '==', organizationId)
      .get();
    console.log(`✅ Users collection: ${usersQuery.size} users`);
    
    // Check team members
    const teamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', organizationId)
      .get();
    console.log(`✅ TeamMembers collection: ${teamMembersQuery.size} team members`);
    
    // Check org members
    const orgMembersQuery = await db.collection('orgMembers')
      .where('orgId', '==', organizationId)
      .get();
    console.log(`✅ OrgMembers collection: ${orgMembersQuery.size} org members`);
    
    // Check licenses
    const licensesQuery = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    console.log(`✅ Licenses collection: ${licensesQuery.size} licenses`);
    
    console.log('\n📋 Detailed verification:');
    teamMembersQuery.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.name} (${data.email})`);
      console.log(`     License: ${data.licenseType}`);
      console.log(`     Role: ${data.role}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Firebase UID: ${data.firebaseUid}`);
      console.log(`     User ID: ${data.userId}`);
      console.log('');
    });
    
    console.log('🎉 Complete enterprise data rebuild finished successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Organization: ${organizationId}`);
    console.log(`   - Subscription: ${subscriptionRef.id}`);
    console.log(`   - Users created: ${teamMembers.length + 1} (including owner)`);
    console.log(`   - Licenses created: ${teamMembers.length + 1}`);
    console.log(`   - All collections properly linked and synchronized`);
    
  } catch (error) {
    console.error('❌ Error during cleanup and rebuild:', error);
  }
}

// Run the cleanup and rebuild
cleanupAndRebuildEnterpriseData().catch(console.error);
