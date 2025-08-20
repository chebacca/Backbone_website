#!/usr/bin/env node

/**
 * Check Lissa's Project Assignments
 * 
 * This script directly queries the projectTeamMembers collection
 * to see what projects Lissa is assigned to and verify the data structure.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkLissaAssignments() {
  console.log('🔍 Checking Lissa\'s project assignments...');
  
  try {
    // 1. Find Lissa in teamMembers collection
    console.log('\n📋 Step 1: Finding Lissa in teamMembers collection...');
    const lissaQuery = await db.collection('teamMembers').where('email', '==', 'lissa@apple.com').get();
    
    if (lissaQuery.empty) {
      console.log('❌ Lissa not found in teamMembers collection');
      return;
    }
    
    const lissaDoc = lissaQuery.docs[0];
    const lissaData = lissaDoc.data();
    const lissaId = lissaDoc.id;
    
    console.log('✅ Found Lissa:', {
      id: lissaId,
      email: lissaData.email,
      firstName: lissaData.firstName,
      lastName: lissaData.lastName,
      status: lissaData.status
    });
    
    // 2. Find her project assignments
    console.log('\n📋 Step 2: Finding Lissa\'s project assignments...');
    const assignmentsQuery = await db.collection('projectTeamMembers')
      .where('teamMemberId', '==', lissaId)
      .get();
    
    console.log(`📊 Found ${assignmentsQuery.size} project assignments for Lissa`);
    
    if (assignmentsQuery.empty) {
      console.log('❌ No project assignments found for Lissa');
      return;
    }
    
    // 3. Get project details for each assignment
    console.log('\n📋 Step 3: Getting project details...');
    const projectDetails = [];
    
    for (const assignmentDoc of assignmentsQuery.docs) {
      const assignment = assignmentDoc.data();
      console.log(`\n🔍 Assignment ${assignmentDoc.id}:`, {
        teamMemberId: assignment.teamMemberId,
        projectId: assignment.projectId,
        role: assignment.role,
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedBy,
        isActive: assignment.isActive
      });
      
      // Get project details
      try {
        const projectDoc = await db.collection('projects').doc(assignment.projectId).get();
        if (projectDoc.exists) {
          const projectData = projectDoc.data();
          projectDetails.push({
            assignmentId: assignmentDoc.id,
            projectId: assignment.projectId,
            projectName: projectData.name,
            projectDescription: projectData.description,
            role: assignment.role,
            isActive: assignment.isActive !== false,
            projectIsActive: projectData.isActive,
            projectIsArchived: projectData.isArchived
          });
          
          console.log(`  ✅ Project: ${projectData.name} (${assignment.projectId})`);
          console.log(`     Role: ${assignment.role}`);
          console.log(`     Project Status: Active=${projectData.isActive}, Archived=${projectData.isArchived}`);
        } else {
          console.log(`  ❌ Project ${assignment.projectId} not found`);
          projectDetails.push({
            assignmentId: assignmentDoc.id,
            projectId: assignment.projectId,
            projectName: 'PROJECT NOT FOUND',
            role: assignment.role,
            isActive: assignment.isActive !== false,
            projectExists: false
          });
        }
      } catch (error) {
        console.log(`  ❌ Error fetching project ${assignment.projectId}:`, error.message);
      }
    }
    
    // 4. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`👤 Lissa ID: ${lissaId}`);
    console.log(`📧 Email: ${lissaData.email}`);
    console.log(`📋 Total Assignments: ${assignmentsQuery.size}`);
    
    const activeAssignments = projectDetails.filter(p => p.isActive && p.projectIsActive && !p.projectIsArchived);
    console.log(`✅ Active Project Assignments: ${activeAssignments.length}`);
    
    if (activeAssignments.length > 0) {
      console.log('\n🎯 ACTIVE PROJECTS:');
      activeAssignments.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.projectName} (${project.projectId})`);
        console.log(`     Role: ${project.role}`);
      });
    }
    
    const inactiveAssignments = projectDetails.filter(p => !p.isActive || !p.projectIsActive || p.projectIsArchived);
    if (inactiveAssignments.length > 0) {
      console.log('\n⏸️  INACTIVE/ARCHIVED PROJECTS:');
      inactiveAssignments.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.projectName} (${project.projectId})`);
        console.log(`     Role: ${project.role}`);
        console.log(`     Status: Assignment Active=${project.isActive}, Project Active=${project.projectIsActive}, Archived=${project.projectIsArchived}`);
      });
    }
    
    // 5. Data structure for frontend
    console.log('\n🔧 DATA FOR FRONTEND:');
    console.log('Lissa should see these projects when logged in:');
    console.log(JSON.stringify(activeAssignments.map(p => ({
      id: p.projectId,
      name: p.projectName,
      description: p.projectDescription,
      teamMemberRole: p.role,
      assignmentId: p.assignmentId
    })), null, 2));
    
  } catch (error) {
    console.error('❌ Error checking Lissa\'s assignments:', error);
  }
}

// Run the check
if (require.main === module) {
  checkLissaAssignments()
    .then(() => {
      console.log('\n🎉 Lissa assignment check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Lissa assignment check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkLissaAssignments };
