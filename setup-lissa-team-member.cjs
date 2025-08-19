#!/usr/bin/env node

/**
 * Setup Lissa as Team Member
 * 
 * This script creates Lissa as a proper team member in Firestore with:
 * 1. Team member record in team_members collection
 * 2. Firebase Auth account
 * 3. Project assignments to TESTERTEST project
 */

const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

console.log('🚀 Setting up Lissa as Team Member...\n');

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

async function setupLissaTeamMember() {
  const email = 'lissa@apple.com';
  const password = 'Admin1234!';
  const firstName = 'Lissa';
  const lastName = 'Apple';
  const fullName = `${firstName} ${lastName}`;
  
  try {
    console.log('2️⃣ Setting up Lissa as Team Member...');
    
    // Step 1: Check if Firebase Auth user exists
    console.log('   Step 1: Checking Firebase Auth user...');
    let firebaseUserRecord;
    try {
      firebaseUserRecord = await auth.getUserByEmail(email);
      console.log(`   ✅ Found existing Firebase user (UID: ${firebaseUserRecord.uid})`);
    } catch (error) {
      console.log('   ✅ No existing Firebase user found');
    }
    
    // Step 2: Create Firebase Auth user if it doesn't exist
    if (!firebaseUserRecord) {
      console.log('   Step 2: Creating Firebase Auth user...');
      firebaseUserRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: fullName,
        emailVerified: true, // Set to true for admin
        disabled: false,
      });
      
      console.log(`   ✅ Firebase Auth user created (UID: ${firebaseUserRecord.uid})`);
    } else {
      console.log('   Step 2: Updating existing Firebase Auth user...');
      // Update password for existing user
      await auth.updateUser(firebaseUserRecord.uid, {
        password: password,
        emailVerified: true,
      });
      console.log('   ✅ Updated existing Firebase Auth user');
    }
    
    // Step 3: Create team member record in team_members collection
    console.log('   Step 3: Creating team member record...');
    
    // Check if team member already exists
    const existingTeamMemberQuery = await db.collection('team_members')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    let teamMemberRef;
    let teamMemberId;
    
    if (!existingTeamMemberQuery.empty) {
      // Update existing team member
      const existingDoc = existingTeamMemberQuery.docs[0];
      teamMemberId = existingDoc.id;
      teamMemberRef = existingDoc.ref;
      
      await teamMemberRef.update({
        firstName: firstName,
        lastName: lastName,
        name: fullName,
        licenseType: 'ENTERPRISE',
        status: 'ACTIVE',
        firebaseUid: firebaseUserRecord.uid,
        hashedPassword: await bcrypt.hash(password, 10),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`   ✅ Updated existing team member (ID: ${teamMemberId})`);
    } else {
      // Create new team member
      teamMemberRef = db.collection('team_members').doc();
      teamMemberId = teamMemberRef.id;
      
      const teamMemberData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        name: fullName,
        licenseType: 'ENTERPRISE',
        status: 'ACTIVE',
        organizationId: 'apple-enterprise', // Default org for Apple
        department: 'Team Management',
        firebaseUid: firebaseUserRecord.uid,
        hashedPassword: await bcrypt.hash(password, 10),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await teamMemberRef.set(teamMemberData);
      console.log(`   ✅ Created new team member (ID: ${teamMemberId})`);
    }
    
    // Step 4: Find TESTERTEST project
    console.log('   Step 4: Finding TESTERTEST project...');
    const projectsQuery = await db.collection('projects')
      .where('name', '==', 'TESTERTEST')
      .limit(1)
      .get();
    
    let projectId;
    if (!projectsQuery.empty) {
      projectId = projectsQuery.docs[0].id;
      console.log(`   ✅ Found TESTERTEST project (ID: ${projectId})`);
    } else {
      // Create TESTERTEST project if it doesn't exist
      console.log('   Creating TESTERTEST project...');
      const projectRef = db.collection('projects').doc();
      projectId = projectRef.id;
      
      const projectData = {
        name: 'TESTERTEST',
        description: 'Test project for team member assignments',
        status: 'active',
        isActive: true,
        isArchived: false,
        maxCollaborators: 10,
        datasets: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await projectRef.set(projectData);
      console.log(`   ✅ Created TESTERTEST project (ID: ${projectId})`);
    }
    
    // Step 5: Assign Lissa to TESTERTEST project
    console.log('   Step 5: Assigning Lissa to TESTERTEST project...');
    
    // Check if assignment already exists
    const existingAssignmentQuery = await db.collection('projectTeamMembers')
      .where('teamMemberId', '==', teamMemberId)
      .where('projectId', '==', projectId)
      .limit(1)
      .get();
    
    if (!existingAssignmentQuery.empty) {
      console.log('   ✅ Assignment already exists');
    } else {
      // Create new assignment
      const assignmentRef = db.collection('projectTeamMembers').doc();
      const assignmentData = {
        id: assignmentRef.id,
        projectId: projectId,
        teamMemberId: teamMemberId,
        role: 'ADMIN',
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        assignedBy: 'system',
        isActive: true
      };
      
      await assignmentRef.set(assignmentData);
      console.log(`   ✅ Assigned Lissa to TESTERTEST project (Assignment ID: ${assignmentRef.id})`);
    }
    
    console.log('\n🎉 Lissa setup complete!');
    console.log('📧 Email: lissa@apple.com');
    console.log('🔑 Password: Admin1234!');
    console.log(`👤 Team Member ID: ${teamMemberId}`);
    console.log(`🔥 Firebase UID: ${firebaseUserRecord.uid}`);
    console.log(`📁 Assigned to project: TESTERTEST (${projectId})`);
    
    return { teamMemberId, firebaseUid: firebaseUserRecord.uid, projectId };
    
  } catch (error) {
    console.error('❌ Error setting up Lissa:', error);
    throw error;
  }
}

async function main() {
  try {
    await setupLissaTeamMember();
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
