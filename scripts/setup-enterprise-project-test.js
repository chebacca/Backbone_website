#!/usr/bin/env node

/**
 * Setup Enterprise Project Test Script
 * 
 * This script creates an enterprise user, creates a project for them,
 * and assigns lissa@apple.com as a team member to test the complete flow
 * 
 * Usage: node setup-enterprise-project-test.js [--api-url=http://localhost:3003]
 */

import admin from 'firebase-admin';

// Command line arguments
const args = process.argv.slice(2);
const apiUrlArg = args.find(arg => arg.startsWith('--api-url='));
const apiUrl = apiUrlArg ? apiUrlArg.split('=')[1] : 'http://localhost:3003';

/**
 * Initialize Firebase Admin SDK
 */
async function initializeFirebase() {
  try {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'backbone-logic'
      });
    }
    
    console.log('✅ Firebase Admin SDK initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    return false;
  }
}

/**
 * Create or verify enterprise user exists
 */
async function createEnterpriseUser(userData) {
  try {
    console.log('🏢 Creating/verifying enterprise user:', userData.email);
    
    const auth = admin.auth();
    const db = admin.firestore();
    
    // Check if user already exists in Firebase Auth
    let firebaseUser = null;
    try {
      firebaseUser = await auth.getUserByEmail(userData.email);
      console.log('✅ Enterprise user already exists in Firebase Auth:', firebaseUser.uid);
    } catch (error) {
      // User doesn't exist, create them
      firebaseUser = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: `${userData.firstName} ${userData.lastName}`,
        emailVerified: true
      });
      console.log('✅ Enterprise user created in Firebase Auth:', firebaseUser.uid);
    }
    
    // Check if user exists in Firestore
    const usersRef = db.collection('users');
    let userDoc = await usersRef.doc(firebaseUser.uid).get();
    
    if (!userDoc.exists) {
      // Create Firestore user
      const now = new Date();
      const firestoreUserData = {
        id: firebaseUser.uid,
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'USER',
        isEmailVerified: true,
        createdAt: now,
        updatedAt: now,
        
        // Enterprise user - not a demo user
        isDemoUser: false,
        subscriptionTier: 'ENTERPRISE',
        licenseType: 'ENTERPRISE'
      };
      
      await usersRef.doc(firebaseUser.uid).set(firestoreUserData);
      console.log('✅ Enterprise user created in Firestore');
    } else {
      console.log('✅ Enterprise user already exists in Firestore');
    }
    
    return {
      success: true,
      firebaseUid: firebaseUser.uid,
      email: userData.email
    };
    
  } catch (error) {
    console.error('❌ Error creating enterprise user:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a project directly in Firestore
 */
async function createProjectDirect(projectData, ownerUid) {
  try {
    console.log('📁 Creating project directly:', projectData.name);
    
    const db = admin.firestore();
    const projectsRef = db.collection('projects');
    
    // Generate project ID
    const projectDoc = projectsRef.doc();
    const projectId = projectDoc.id;
    
    const now = new Date();
    const firestoreProjectData = {
      id: projectId,
      name: projectData.name,
      description: projectData.description,
      type: projectData.type || 'shared_network',
      applicationMode: projectData.applicationMode || 'shared_network',
      visibility: projectData.visibility || 'private',
      storageBackend: projectData.storageBackend || 'firestore',
      
      // Owner information
      ownerId: ownerUid,
      createdBy: ownerUid,
      
      // Collaboration settings
      maxCollaborators: projectData.maxCollaborators || 250, // Enterprise limit
      
      // Status and timestamps
      status: 'active',
      createdAt: now,
      updatedAt: now,
      
      // Team members (will be added separately)
      teamMembers: [],
      
      // Project settings
      settings: {
        allowTeamMemberInvites: true,
        requireApprovalForJoining: false,
        isPubliclyVisible: false
      }
    };
    
    await projectDoc.set(firestoreProjectData);
    
    console.log('✅ Project created successfully:', projectId);
    return {
      success: true,
      projectId: projectId,
      project: firestoreProjectData
    };
    
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Add team member to project
 */
async function addTeamMemberToProject(projectId, memberEmail, role = 'MEMBER') {
  try {
    console.log('👥 Adding team member to project:', memberEmail);
    
    const auth = admin.auth();
    const db = admin.firestore();
    
    // Get team member's Firebase UID
    let memberUser = null;
    try {
      memberUser = await auth.getUserByEmail(memberEmail);
    } catch (error) {
      console.error('❌ Team member not found in Firebase Auth:', memberEmail);
      return { success: false, error: 'Team member not found in Firebase Auth' };
    }
    
    // Check if team member exists in Firestore
    const userDoc = await db.collection('users').doc(memberUser.uid).get();
    if (!userDoc.exists) {
      console.error('❌ Team member not found in Firestore:', memberEmail);
      return { success: false, error: 'Team member not found in Firestore' };
    }
    
    const userData = userDoc.data();
    
    // Add to project's team members
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      console.error('❌ Project not found:', projectId);
      return { success: false, error: 'Project not found' };
    }
    
    const projectData = projectDoc.data();
    const teamMembers = projectData.teamMembers || [];
    
    // Check if member is already added
    const existingMember = teamMembers.find(tm => tm.userId === memberUser.uid);
    if (existingMember) {
      console.log('ℹ️ Team member already exists in project');
      return { success: true, message: 'Team member already exists' };
    }
    
    // Add team member
    const teamMemberData = {
      userId: memberUser.uid,
      email: memberEmail,
      name: userData.name,
      role: role,
      status: 'ACTIVE',
      addedAt: new Date(),
      permissions: {
        canRead: true,
        canWrite: true,
        canDelete: false,
        canManageMembers: false
      }
    };
    
    teamMembers.push(teamMemberData);
    
    await projectRef.update({
      teamMembers: teamMembers,
      updatedAt: new Date()
    });
    
    console.log('✅ Team member added to project successfully');
    return {
      success: true,
      teamMember: teamMemberData
    };
    
  } catch (error) {
    console.error('❌ Error adding team member to project:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify project visibility for users
 */
async function verifyProjectVisibility(projectId, userEmails) {
  try {
    console.log('🔍 Verifying project visibility for users...');
    
    const auth = admin.auth();
    const db = admin.firestore();
    
    for (const email of userEmails) {
      try {
        const user = await auth.getUserByEmail(email);
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          console.log(`✅ User ${email} exists:`, {
            uid: user.uid,
            role: userData.role,
            isDemoUser: userData.isDemoUser,
            subscriptionTier: userData.subscriptionTier
          });
        } else {
          console.log(`⚠️ User ${email} exists in Auth but not in Firestore`);
        }
      } catch (error) {
        console.log(`❌ User ${email} not found:`, error.message);
      }
    }
    
    // Check project
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (projectDoc.exists) {
      const projectData = projectDoc.data();
      console.log('✅ Project exists:', {
        id: projectId,
        name: projectData.name,
        ownerId: projectData.ownerId,
        teamMembersCount: projectData.teamMembers?.length || 0
      });
      
      if (projectData.teamMembers && projectData.teamMembers.length > 0) {
        console.log('👥 Team members:');
        projectData.teamMembers.forEach(tm => {
          console.log(`  - ${tm.email} (${tm.role})`);
        });
      }
    } else {
      console.log('❌ Project not found:', projectId);
    }
    
  } catch (error) {
    console.error('❌ Error verifying project visibility:', error.message);
  }
}

/**
 * Main test function
 */
async function runEnterpriseProjectTests() {
  console.log('🧪 Starting Enterprise Project Tests...\n');
  
  // Initialize Firebase
  const firebaseInitialized = await initializeFirebase();
  if (!firebaseInitialized) {
    console.error('❌ Cannot proceed without Firebase initialization');
    process.exit(1);
  }
  
  // Test 1: Create enterprise user
  console.log('=== Test 1: Create Enterprise User ===');
  const enterpriseUserData = {
    email: 'enterprise.user@example.com',
    password: 'EnterprisePass123!',
    firstName: 'Enterprise',
    lastName: 'User'
  };
  
  const enterpriseResult = await createEnterpriseUser(enterpriseUserData);
  
  if (!enterpriseResult.success) {
    console.error('❌ Enterprise user creation failed, stopping tests');
    process.exit(1);
  }
  
  // Test 2: Create project for enterprise user
  console.log('\n=== Test 2: Create Project for Enterprise User ===');
  const projectData = {
    name: 'Enterprise Test Project',
    description: 'Test project for enterprise user with team member assignment',
    type: 'shared_network',
    applicationMode: 'shared_network',
    visibility: 'private',
    storageBackend: 'firestore',
    maxCollaborators: 250 // Enterprise limit
  };
  
  const projectResult = await createProjectDirect(projectData, enterpriseResult.firebaseUid);
  
  if (!projectResult.success) {
    console.error('❌ Project creation failed, stopping tests');
    process.exit(1);
  }
  
  // Test 3: Add lissa@apple.com as team member
  console.log('\n=== Test 3: Add lissa@apple.com as Team Member ===');
  const teamMemberResult = await addTeamMemberToProject(
    projectResult.projectId,
    'lissa@apple.com',
    'MEMBER'
  );
  
  if (!teamMemberResult.success) {
    console.error('❌ Team member addition failed:', teamMemberResult.error);
    console.log('ℹ️ This might be expected if lissa@apple.com doesn\'t exist yet');
  } else {
    console.log('✅ Team member added successfully');
  }
  
  // Test 4: Verify project visibility
  console.log('\n=== Test 4: Verify Project Visibility ===');
  await verifyProjectVisibility(projectResult.projectId, [
    'enterprise.user@example.com',
    'lissa@apple.com'
  ]);
  
  console.log('\n✅ Enterprise project tests completed!');
  console.log('\n📋 Test Results:');
  console.log('🏢 Enterprise User: enterprise.user@example.com / EnterprisePass123!');
  console.log('📁 Project ID:', projectResult.projectId);
  console.log('📁 Project Name:', projectData.name);
  console.log('👥 Team Member: lissa@apple.com (if exists)');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Test login with enterprise.user@example.com / EnterprisePass123!');
  console.log('3. Check Cloud Projects page - should see the project');
  console.log('4. Test login with lissa@apple.com (if exists)');
  console.log('5. Check if lissa can see the project in her Cloud Projects page');
  console.log('6. Test WebOnlyStartupFlow project fetching for both users');
}

// Run the tests
runEnterpriseProjectTests().catch(console.error);
