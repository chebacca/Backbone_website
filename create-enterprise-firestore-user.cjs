#!/usr/bin/env node

/**
 * 🔥 Create Enterprise Firestore User Document
 * 
 * Creates the Firestore user document to match the Firebase Auth user
 * for the enterprise account.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

// Enterprise User Configuration
const ENTERPRISE_USER = {
  uid: '2ysTqv3pwiXyKxOeExAfEKOIh7K2',
  email: 'enterprise.user@enterprisemedia.com',
  name: 'Enterprise Admin User',
  organizationId: 'enterprise-org-001',
  organizationName: 'Enterprise Media Solutions'
};

async function createFirestoreUserDocument() {
  console.log('🔥 Creating Enterprise Firestore User Document');
  console.log('===============================================');
  console.log(`UID: ${ENTERPRISE_USER.uid}`);
  console.log(`Email: ${ENTERPRISE_USER.email}`);
  console.log(`Organization: ${ENTERPRISE_USER.organizationName}`);
  
  try {
    // Check if user document already exists
    const userRef = db.collection('users').doc(ENTERPRISE_USER.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      console.log('⚠️  User document already exists');
      const userData = userDoc.data();
      console.log(`   Email: ${userData.email}`);
      console.log(`   Name: ${userData.name}`);
      console.log(`   Organization ID: ${userData.organizationId}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   User Type: ${userData.userType}`);
      
      // Update if needed
      const updates = {};
      if (userData.email !== ENTERPRISE_USER.email) updates.email = ENTERPRISE_USER.email;
      if (userData.name !== ENTERPRISE_USER.name) updates.name = ENTERPRISE_USER.name;
      if (userData.organizationId !== ENTERPRISE_USER.organizationId) updates.organizationId = ENTERPRISE_USER.organizationId;
      if (!userData.userType) updates.userType = 'ACCOUNT_OWNER';
      if (!userData.role) updates.role = 'OWNER';
      
      if (Object.keys(updates).length > 0) {
        console.log('🔄 Updating user document...');
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        await userRef.update(updates);
        console.log('✅ User document updated');
      } else {
        console.log('✅ User document is up to date');
      }
      
      return true;
    }
    
    // Create new user document
    console.log('👤 Creating new Firestore user document...');
    
    const userData = {
      id: ENTERPRISE_USER.uid,
      email: ENTERPRISE_USER.email,
      name: ENTERPRISE_USER.name,
      
      // User Type & Role
      userType: 'ACCOUNT_OWNER',
      role: 'OWNER',
      
      // Organization Context
      organizationId: ENTERPRISE_USER.organizationId,
      organization: {
        id: ENTERPRISE_USER.organizationId,
        name: ENTERPRISE_USER.organizationName,
        tier: 'ENTERPRISE'
      },
      
      // Profile Information
      profile: {
        firstName: 'Enterprise',
        lastName: 'Admin',
        displayName: ENTERPRISE_USER.name,
        avatar: null,
        timezone: 'America/New_York',
        language: 'en'
      },
      
      // Permissions
      permissions: ['all'],
      
      // Status
      status: 'active',
      emailVerified: true,
      
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null
    };
    
    await userRef.set(userData);
    
    console.log('✅ Firestore user document created successfully');
    console.log(`   Document ID: ${ENTERPRISE_USER.uid}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   User Type: ${userData.userType}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Organization: ${userData.organization.name}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create/update Firestore user document');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function createOrganizationDocument() {
  console.log('\n🏢 Creating Enterprise Organization Document');
  console.log('============================================');
  
  try {
    const orgRef = db.collection('organizations').doc(ENTERPRISE_USER.organizationId);
    const orgDoc = await orgRef.get();
    
    if (orgDoc.exists) {
      console.log('✅ Organization document already exists');
      const orgData = orgDoc.data();
      console.log(`   Name: ${orgData.name}`);
      console.log(`   Tier: ${orgData.tier}`);
      console.log(`   Owner: ${orgData.ownerId}`);
      return true;
    }
    
    console.log('🏢 Creating organization document...');
    
    const orgData = {
      id: ENTERPRISE_USER.organizationId,
      name: ENTERPRISE_USER.organizationName,
      tier: 'ENTERPRISE',
      ownerId: ENTERPRISE_USER.uid,
      
      // Organization Details
      domain: 'enterprisemedia.com',
      industry: 'Media Production',
      size: 'Enterprise',
      country: 'United States',
      timezone: 'America/New_York',
      
      // Settings
      settings: {
        allowTeamMemberCreation: true,
        requireEmailVerification: false,
        enforce2FA: false,
        allowProjectCreation: true
      },
      
      // Counts
      membersCount: 1,
      projectsCount: 0,
      licensesCount: 0,
      
      // Status
      status: 'active',
      
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await orgRef.set(orgData);
    
    console.log('✅ Organization document created successfully');
    console.log(`   Organization ID: ${orgData.id}`);
    console.log(`   Name: ${orgData.name}`);
    console.log(`   Tier: ${orgData.tier}`);
    console.log(`   Owner: ${orgData.ownerId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to create organization document');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function testFirestoreDocuments() {
  console.log('\n🧪 Testing Firestore Documents');
  console.log('===============================');
  
  try {
    // Test user document
    const userRef = db.collection('users').doc(ENTERPRISE_USER.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      console.log('✅ User document exists and is accessible');
      const userData = userDoc.data();
      console.log(`   Email: ${userData.email}`);
      console.log(`   Organization ID: ${userData.organizationId}`);
      console.log(`   User Type: ${userData.userType}`);
      console.log(`   Role: ${userData.role}`);
    } else {
      console.log('❌ User document not found');
      return false;
    }
    
    // Test organization document
    const orgRef = db.collection('organizations').doc(ENTERPRISE_USER.organizationId);
    const orgDoc = await orgRef.get();
    
    if (orgDoc.exists) {
      console.log('✅ Organization document exists and is accessible');
      const orgData = orgDoc.data();
      console.log(`   Name: ${orgData.name}`);
      console.log(`   Tier: ${orgData.tier}`);
      console.log(`   Owner: ${orgData.ownerId}`);
    } else {
      console.log('❌ Organization document not found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firestore document test failed');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 ENTERPRISE FIRESTORE USER SETUP');
  console.log('===================================\n');
  
  try {
    const userCreated = await createFirestoreUserDocument();
    const orgCreated = await createOrganizationDocument();
    
    if (userCreated && orgCreated) {
      const tested = await testFirestoreDocuments();
      
      if (tested) {
        console.log('\n🎉 FIRESTORE SETUP COMPLETE!');
        console.log('=============================');
        console.log('✅ User document created/updated');
        console.log('✅ Organization document created/updated');
        console.log('✅ All documents are accessible');
        console.log('\n🔑 READY FOR AUTHENTICATION:');
        console.log(`   📧 Email: ${ENTERPRISE_USER.email}`);
        console.log(`   🆔 UID: ${ENTERPRISE_USER.uid}`);
        console.log(`   🏢 Organization: ${ENTERPRISE_USER.organizationName}`);
        console.log('\n🌐 You can now test the frontend authentication');
      } else {
        console.log('\n⚠️  SETUP COMPLETED WITH ISSUES');
        console.log('================================');
        console.log('Documents were created but verification failed');
      }
    } else {
      console.log('\n❌ SETUP FAILED');
      console.log('================');
      console.log('Failed to create required documents');
    }
  } catch (error) {
    console.error('\n💥 Setup crashed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { createFirestoreUserDocument, createOrganizationDocument, testFirestoreDocuments };
