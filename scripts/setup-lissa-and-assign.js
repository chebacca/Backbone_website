#!/usr/bin/env node

/**
 * Setup Lissa and Assign to Project Script
 * 
 * This script creates lissa@apple.com in Firestore and assigns her to the enterprise project
 */

import admin from 'firebase-admin';

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
 * Create Lissa's Firestore record
 */
async function createLissaFirestoreRecord() {
  try {
    console.log('👤 Creating Lissa\'s Firestore record...');
    
    const auth = admin.auth();
    const db = admin.firestore();
    
    // Get Lissa's Firebase Auth record
    const lissaAuth = await auth.getUserByEmail('lissa@apple.com');
    console.log('✅ Found Lissa in Firebase Auth:', lissaAuth.uid);
    
    // Check if she already exists in Firestore
    const userDoc = await db.collection('users').doc(lissaAuth.uid).get();
    
    if (userDoc.exists) {
      console.log('✅ Lissa already exists in Firestore');
      return { success: true, uid: lissaAuth.uid, existing: true };
    }
    
    // Create Firestore record for Lissa
    const now = new Date();
    const lissaData = {
      id: lissaAuth.uid,
      email: 'lissa@apple.com',
      name: 'Lissa Tuejenez',
      firstName: 'Lissa',
      lastName: 'Tuejenez',
      role: 'TEAM_MEMBER',
      isEmailVerified: true,
      createdAt: now,
      updatedAt: now,
      
      // Team member specific fields
      isTeamMember: true,
      organizationId: 'C6L6jdoNbMs4QxcZ6IGI', // From the console logs
      memberRole: 'MEMBER',
      memberStatus: 'ACTIVE',
      
      // Not a demo user
      isDemoUser: false
    };
    
    await db.collection('users').doc(lissaAuth.uid).set(lissaData);
    console.log('✅ Lissa\'s Firestore record created successfully');
    
    return { success: true, uid: lissaAuth.uid, existing: false };
    
  } catch (error) {
    console.error('❌ Error creating Lissa\'s Firestore record:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Add Lissa to the enterprise project
 */
async function addLissaToProject(projectId, lissaUid) {
  try {
    console.log('👥 Adding Lissa to enterprise project...');
    
    const db = admin.firestore();
    
    // Get project
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      console.error('❌ Project not found:', projectId);
      return { success: false, error: 'Project not found' };
    }
    
    const projectData = projectDoc.data();
    const teamMembers = projectData.teamMembers || [];
    
    // Check if Lissa is already added
    const existingMember = teamMembers.find(tm => tm.userId === lissaUid);
    if (existingMember) {
      console.log('ℹ️ Lissa is already a team member of this project');
      return { success: true, message: 'Already a team member' };
    }
    
    // Add Lissa as team member
    const teamMemberData = {
      userId: lissaUid,
      email: 'lissa@apple.com',
      name: 'Lissa Tuejenez',
      role: 'MEMBER',
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
    
    console.log('✅ Lissa added to project successfully');
    return { success: true, teamMember: teamMemberData };
    
  } catch (error) {
    console.error('❌ Error adding Lissa to project:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Find the enterprise project
 */
async function findEnterpriseProject() {
  try {
    const db = admin.firestore();
    
    // Look for projects with name "Enterprise Test Project"
    const projectsQuery = await db.collection('projects')
      .where('name', '==', 'Enterprise Test Project')
      .limit(1)
      .get();
    
    if (projectsQuery.empty) {
      console.error('❌ Enterprise Test Project not found');
      return null;
    }
    
    const projectDoc = projectsQuery.docs[0];
    const projectData = projectDoc.data();
    
    console.log('✅ Found Enterprise Test Project:', projectDoc.id);
    return { id: projectDoc.id, data: projectData };
    
  } catch (error) {
    console.error('❌ Error finding enterprise project:', error.message);
    return null;
  }
}

/**
 * Main function
 */
async function setupLissaAndAssign() {
  console.log('🧪 Setting up Lissa and assigning to project...\n');
  
  // Initialize Firebase
  const firebaseInitialized = await initializeFirebase();
  if (!firebaseInitialized) {
    console.error('❌ Cannot proceed without Firebase initialization');
    process.exit(1);
  }
  
  // Step 1: Create Lissa's Firestore record
  console.log('=== Step 1: Create Lissa\'s Firestore Record ===');
  const lissaResult = await createLissaFirestoreRecord();
  
  if (!lissaResult.success) {
    console.error('❌ Failed to create Lissa\'s Firestore record:', lissaResult.error);
    process.exit(1);
  }
  
  // Step 2: Find the enterprise project
  console.log('\n=== Step 2: Find Enterprise Project ===');
  const project = await findEnterpriseProject();
  
  if (!project) {
    console.error('❌ Could not find enterprise project');
    process.exit(1);
  }
  
  // Step 3: Add Lissa to the project
  console.log('\n=== Step 3: Add Lissa to Project ===');
  const assignResult = await addLissaToProject(project.id, lissaResult.uid);
  
  if (!assignResult.success) {
    console.error('❌ Failed to add Lissa to project:', assignResult.error);
    process.exit(1);
  }
  
  console.log('\n✅ Setup completed successfully!');
  console.log('\n📋 Results:');
  console.log('👤 Lissa Firestore Record:', lissaResult.existing ? 'Already existed' : 'Created');
  console.log('📁 Project ID:', project.id);
  console.log('👥 Team Member Assignment:', assignResult.message || 'Added successfully');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Test login with enterprise.user@example.com / EnterprisePass123!');
  console.log('3. Check Cloud Projects page - should see "Enterprise Test Project"');
  console.log('4. Test login with lissa@apple.com');
  console.log('5. Check if lissa can see the project in her Cloud Projects page');
  console.log('6. Test WebOnlyStartupFlow project fetching for both users');
}

// Run the setup
setupLissaAndAssign().catch(console.error);
