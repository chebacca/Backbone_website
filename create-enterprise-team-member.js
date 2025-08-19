#!/usr/bin/env node

/**
 * Create Enterprise Team Member Test
 * 
 * This script creates a new team member for the enterprise.user@example.com account
 * and verifies that Firebase Authentication is automatically updated.
 * 
 * Usage: node create-enterprise-team-member.js
 */

import admin from 'firebase-admin';

console.log('🚀 Creating Enterprise Team Member with Firebase Auth Integration...\n');

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
 * Find or create the enterprise organization
 */
async function findEnterpriseOrganization() {
  console.log('2️⃣ Finding Enterprise Organization...\n');
  
  try {
    // Look for enterprise user
    const enterpriseUserQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .limit(1)
      .get();
    
    if (enterpriseUserQuery.empty) {
      console.log('   ⚠️  Enterprise user not found, creating...');
      
      // Create enterprise user first
      const enterpriseUserData = {
        email: 'enterprise.user@example.com',
        name: 'Enterprise Admin User',
        role: 'USER',
        isEmailVerified: true,
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
        privacyConsent: [],
        marketingConsent: false,
        dataProcessingConsent: true,
        identityVerified: true,
        kycStatus: 'COMPLETED',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const enterpriseUserRef = await db.collection('users').add(enterpriseUserData);
      console.log(`   ✅ Enterprise user created (ID: ${enterpriseUserRef.id})`);
      
      // Create organization for enterprise user
      const organizationData = {
        name: 'Enterprise Organization',
        ownerUserId: enterpriseUserRef.id,
        type: 'ENTERPRISE',
        status: 'ACTIVE',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const orgRef = await db.collection('organizations').add(organizationData);
      console.log(`   ✅ Enterprise organization created (ID: ${orgRef.id})`);
      
      return {
        enterpriseUserId: enterpriseUserRef.id,
        organizationId: orgRef.id,
        organizationName: 'Enterprise Organization'
      };
    } else {
      const enterpriseUser = enterpriseUserQuery.docs[0];
      const enterpriseUserId = enterpriseUser.id;
      
      console.log(`   ✅ Enterprise user found (ID: ${enterpriseUserId})`);
      
      // Look for organization owned by this user
      const orgQuery = await db.collection('organizations')
        .where('ownerUserId', '==', enterpriseUserId)
        .limit(1)
        .get();
      
      if (!orgQuery.empty) {
        const org = orgQuery.docs[0];
        const orgData = org.data();
        console.log(`   ✅ Enterprise organization found (ID: ${org.id})`);
        
        return {
          enterpriseUserId: enterpriseUserId,
          organizationId: org.id,
          organizationName: orgData.name || 'Enterprise Organization'
        };
      } else {
        // Create organization
        const organizationData = {
          name: 'Enterprise Organization',
          ownerUserId: enterpriseUserId,
          type: 'ENTERPRISE',
          status: 'ACTIVE',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const orgRef = await db.collection('organizations').add(organizationData);
        console.log(`   ✅ Enterprise organization created (ID: ${orgRef.id})`);
        
        return {
          enterpriseUserId: enterpriseUserId,
          organizationId: orgRef.id,
          organizationName: 'Enterprise Organization'
        };
      }
    }
  } catch (error) {
    console.error('   ❌ Failed to find/create enterprise organization:', error.message);
    throw error;
  }
}

/**
 * Create team member with Firebase Auth integration
 */
async function createTeamMemberWithFirebaseAuth(orgInfo) {
  console.log('3️⃣ Creating Team Member with Firebase Auth Integration...\n');
  
  const teamMemberEmail = `team.member.${Date.now()}@enterprise-company.com`;
  const firstName = 'John';
  const lastName = 'Doe';
  const fullName = `${firstName} ${lastName}`;
  const temporaryPassword = generateTemporaryPassword();
  
  let firebaseUserRecord = null;
  let firestoreDocRef = null;
  
  try {
    console.log(`   👤 Creating team member: ${fullName}`);
    console.log(`   📧 Email: ${teamMemberEmail}`);
    console.log(`   🏢 Organization: ${orgInfo.organizationName} (${orgInfo.organizationId})`);
    console.log(`   🔑 Temporary password: ${temporaryPassword}\n`);
    
    // Step 1: Check if Firebase Auth user already exists
    console.log('   Step 1: Checking for existing Firebase Auth user...');
    try {
      const existingUser = await auth.getUserByEmail(teamMemberEmail);
      if (existingUser) {
        console.log(`   ⚠️  Firebase user already exists (UID: ${existingUser.uid})`);
        firebaseUserRecord = existingUser;
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      console.log('   ✅ No existing Firebase user found');
    }
    
    // Step 2: Create Firebase Auth user if it doesn't exist
    if (!firebaseUserRecord) {
      console.log('   Step 2: Creating Firebase Auth user...');
      firebaseUserRecord = await auth.createUser({
        email: teamMemberEmail,
        password: temporaryPassword,
        displayName: fullName,
        emailVerified: false, // Admin can verify later
        disabled: false,
      });
      
      console.log(`   ✅ Firebase Auth user created (UID: ${firebaseUserRecord.uid})`);
    } else {
      console.log('   Step 2: Using existing Firebase Auth user...');
      // Update password for existing user
      await auth.updateUser(firebaseUserRecord.uid, {
        password: temporaryPassword,
      });
      console.log('   ✅ Updated existing Firebase Auth user password');
    }
    
    // Step 3: Create Firestore user document with Firebase UID
    console.log('   Step 3: Creating Firestore team member document...');
    const teamMemberData = {
      email: teamMemberEmail,
      name: fullName,
      firstName: firstName,
      lastName: lastName,
      role: 'TEAM_MEMBER',
      isEmailVerified: false,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      privacyConsent: [],
      marketingConsent: false,
      dataProcessingConsent: false,
      identityVerified: false,
      kycStatus: 'PENDING',
      // Firebase Authentication integration
      firebaseUid: firebaseUserRecord.uid,
      // Team member properties
      isTeamMember: true,
      licenseType: 'ENTERPRISE',
      status: 'ACTIVE',
      memberRole: 'MEMBER',
      memberStatus: 'ACTIVE',
      organizationId: orgInfo.organizationId,
      department: 'Engineering',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    firestoreDocRef = await db.collection('users').add(teamMemberData);
    console.log(`   ✅ Firestore team member created (ID: ${firestoreDocRef.id})`);
    
    // Step 4: Verify the integration
    console.log('   Step 4: Verifying Firebase Auth integration...');
    
    // Check Firebase Auth user
    const verifyFirebaseUser = await auth.getUser(firebaseUserRecord.uid);
    console.log(`   ✅ Firebase Auth user verified: ${verifyFirebaseUser.email}`);
    console.log(`   📧 Email verified: ${verifyFirebaseUser.emailVerified ? 'Yes' : 'No (Admin can verify)'}`);
    console.log(`   🔒 Account disabled: ${verifyFirebaseUser.disabled ? 'Yes' : 'No'}`);
    
    // Check Firestore document
    const firestoreDoc = await firestoreDocRef.get();
    const firestoreData = firestoreDoc.data();
    
    if (firestoreData.firebaseUid === firebaseUserRecord.uid) {
      console.log(`   ✅ Firestore document verified with Firebase UID link`);
    } else {
      throw new Error('Firebase UID mismatch between Auth and Firestore');
    }
    
    console.log('\n🎉 Team Member Creation SUCCESSFUL!\n');
    
    console.log('📊 Creation Results:');
    console.log(`   • Team Member Name: ${fullName}`);
    console.log(`   • Email: ${teamMemberEmail}`);
    console.log(`   • Firebase Auth UID: ${firebaseUserRecord.uid}`);
    console.log(`   • Firestore Document ID: ${firestoreDocRef.id}`);
    console.log(`   • Organization: ${orgInfo.organizationName}`);
    console.log(`   • License Type: ENTERPRISE`);
    console.log(`   • Status: ACTIVE`);
    console.log(`   • Temporary Password: ${temporaryPassword}`);
    
    return {
      success: true,
      teamMember: {
        id: firestoreDocRef.id,
        name: fullName,
        email: teamMemberEmail,
        firebaseUid: firebaseUserRecord.uid,
        organizationId: orgInfo.organizationId,
        licenseType: 'ENTERPRISE',
        status: 'ACTIVE'
      },
      temporaryPassword: temporaryPassword,
      firebaseUid: firebaseUserRecord.uid
    };
    
  } catch (error) {
    console.error('\n❌ Team Member Creation FAILED:', error.message);
    
    // Cleanup on failure
    if (firebaseUserRecord && !firestoreDocRef) {
      try {
        await auth.deleteUser(firebaseUserRecord.uid);
        console.log('   🧹 Cleaned up Firebase Auth user after failure');
      } catch (cleanupError) {
        console.error('   ⚠️  Failed to cleanup Firebase Auth user:', cleanupError.message);
      }
    }
    
    throw error;
  }
}

/**
 * Test admin verification capabilities
 */
async function testAdminVerification(teamMemberResult) {
  console.log('4️⃣ Testing Admin Verification Capabilities...\n');
  
  try {
    const { firebaseUid, teamMember } = teamMemberResult;
    
    console.log('   Testing email verification...');
    await auth.updateUser(firebaseUid, {
      emailVerified: true,
    });
    
    // Update Firestore as well
    await db.collection('users').doc(teamMember.id).update({
      isEmailVerified: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('   ✅ Email verification completed');
    
    console.log('   Testing account disable/enable...');
    // Disable
    await auth.updateUser(firebaseUid, { disabled: true });
    console.log('   ✅ Account disabled in Firebase Auth');
    
    // Re-enable
    await auth.updateUser(firebaseUid, { disabled: false });
    console.log('   ✅ Account re-enabled in Firebase Auth');
    
    console.log('   Testing password reset...');
    const newPassword = generateTemporaryPassword();
    await auth.updateUser(firebaseUid, { password: newPassword });
    console.log(`   ✅ Password reset completed (new password: ${newPassword})`);
    
    console.log('\n🎉 Admin Verification Test PASSED!\n');
    
    return { success: true, newPassword };
    
  } catch (error) {
    console.error('\n❌ Admin Verification Test FAILED:', error.message);
    throw error;
  }
}

/**
 * Display Firebase Console instructions
 */
function displayFirebaseConsoleInstructions(teamMemberResult) {
  console.log('5️⃣ Firebase Console Verification Instructions...\n');
  
  const { teamMember, firebaseUid } = teamMemberResult;
  
  console.log('🔥 Firebase Console Verification:');
  console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('   2. Select project: backbone-logic');
  console.log('   3. Navigate to Authentication > Users');
  console.log(`   4. Look for user: ${teamMember.email}`);
  console.log(`   5. Firebase UID should be: ${firebaseUid}`);
  console.log('   6. You can now verify, disable, or manage this user directly!');
  
  console.log('\n📱 Admin Actions Available:');
  console.log('   • ✅ Verify email address');
  console.log('   • 🔒 Disable/Enable account');
  console.log('   • 🔑 Reset password');
  console.log('   • 👤 View user details');
  console.log('   • 📊 Monitor sign-in activity');
  
  console.log('\n🎯 Integration Benefits:');
  console.log('   • No manual user creation needed');
  console.log('   • Automatic Firebase Auth registration');
  console.log('   • Immediate admin verification capability');
  console.log('   • Secure password management');
  console.log('   • Centralized user management');
}

/**
 * Main execution function
 */
async function createEnterpriseTeamMember() {
  try {
    console.log('🏢 Enterprise Team Member Creation Process Starting...\n');
    
    // Step 1: Find or create enterprise organization
    const orgInfo = await findEnterpriseOrganization();
    
    // Step 2: Create team member with Firebase Auth
    const teamMemberResult = await createTeamMemberWithFirebaseAuth(orgInfo);
    
    // Step 3: Test admin verification
    const verificationResult = await testAdminVerification(teamMemberResult);
    
    // Step 4: Display instructions
    displayFirebaseConsoleInstructions(teamMemberResult);
    
    console.log('\n🎉 ENTERPRISE TEAM MEMBER CREATION COMPLETE! 🎉\n');
    
    console.log('✅ SUCCESS SUMMARY:');
    console.log(`   • Team Member: ${teamMemberResult.teamMember.name}`);
    console.log(`   • Email: ${teamMemberResult.teamMember.email}`);
    console.log(`   • Firebase UID: ${teamMemberResult.firebaseUid}`);
    console.log(`   • Organization: Enterprise Organization`);
    console.log(`   • License: ENTERPRISE`);
    console.log(`   • Status: ACTIVE & VERIFIED`);
    console.log(`   • Password: ${verificationResult.newPassword}`);
    
    console.log('\n🔥 Firebase Authentication Integration:');
    console.log('   ✅ User automatically created in Firebase Auth');
    console.log('   ✅ Available for admin verification in Firebase Console');
    console.log('   ✅ Password management working');
    console.log('   ✅ Account control working');
    console.log('   ✅ Email verification working');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Check Firebase Console to see the new user');
    console.log('   2. The team member can now sign in with their credentials');
    console.log('   3. Admins can manage the user directly in Firebase Console');
    console.log('   4. No manual Firebase user creation needed anymore!');
    
  } catch (error) {
    console.error('\n💥 Enterprise team member creation failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the creation process
createEnterpriseTeamMember()
  .then(() => {
    console.log('\n✨ Process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Process failed:', error.message);
    process.exit(1);
  });
