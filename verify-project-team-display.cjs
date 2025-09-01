#!/usr/bin/env node

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function verifyProjectTeamDisplay() {
  console.log('🔍 Verifying project team member display...\n');
  
  const userId = 'g8dkre0woUWYDvj6jeARh1ekeBa2';
  
  try {
    // Get all projects for the enterprise user
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .limit(3) // Just check first 3 projects
      .get();
    
    console.log(`📊 Checking ${assignments.size} project assignments for display data:`);
    
    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      const projectId = assignment.projectId;
      
      console.log(`\n📁 Project: ${projectId}`);
      
      // Get the project document
      const projectDoc = await db.collection('projects').doc(projectId).get();
      
      if (projectDoc.exists) {
        const projectData = projectDoc.data();
        
        console.log(`  📋 Name: ${projectData.name}`);
        console.log(`  👥 Team Assignments: ${(projectData.teamAssignments || []).length}`);
        console.log(`  👤 Team Members: ${(projectData.teamMembers || []).length}`);
        
        // Check if enterprise user is in teamMembers
        const teamMembers = projectData.teamMembers || [];
        const userInTeam = teamMembers.find(member => 
          member.userId === userId || member.id === userId
        );
        
        if (userInTeam) {
          console.log(`  ✅ Enterprise user found in teamMembers:`);
          console.log(`    🎭 Role: ${userInTeam.role}`);
          console.log(`    📧 Email: ${userInTeam.email}`);
          console.log(`    👤 Name: ${userInTeam.name || 'Not set'}`);
        } else {
          console.log(`  ❌ Enterprise user NOT found in teamMembers`);
        }
        
        // Check teamAssignments too
        const teamAssignments = projectData.teamAssignments || [];
        const userInAssignments = teamAssignments.find(member => 
          member.userId === userId || member.id === userId
        );
        
        if (userInAssignments) {
          console.log(`  ✅ Enterprise user found in teamAssignments:`);
          console.log(`    🎭 Role: ${userInAssignments.role}`);
          console.log(`    🎛️ Dashboard Role: ${userInAssignments.dashboardRole}`);
          console.log(`    📊 Hierarchy: ${userInAssignments.hierarchyLevel}`);
        } else {
          console.log(`  ❌ Enterprise user NOT found in teamAssignments`);
        }
        
        // Show what the frontend would see
        console.log(`  🖥️ Frontend Display Data:`);
        if (teamMembers.length > 0) {
          teamMembers.forEach((member, index) => {
            const displayName = member.name || member.email?.split('@')[0] || 'Unnamed User';
            console.log(`    ${index + 1}. ${displayName} (${member.role}) - ${member.email}`);
          });
        } else {
          console.log(`    ⚠️ No team members to display`);
        }
      } else {
        console.log(`  ❌ Project document not found`);
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log('The enterprise user should now be visible in the project details');
    console.log('Team Members section of the licensing website.');
    console.log('\n💡 If not visible, try:');
    console.log('1. Refresh the browser page');
    console.log('2. Click the "Refresh Team Members" button');
    console.log('3. Close and reopen the project details');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyProjectTeamDisplay();

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function verifyProjectTeamDisplay() {
  console.log('🔍 Verifying project team member display...\n');
  
  const userId = 'g8dkre0woUWYDvj6jeARh1ekeBa2';
  
  try {
    // Get all projects for the enterprise user
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .limit(3) // Just check first 3 projects
      .get();
    
    console.log(`📊 Checking ${assignments.size} project assignments for display data:`);
    
    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      const projectId = assignment.projectId;
      
      console.log(`\n📁 Project: ${projectId}`);
      
      // Get the project document
      const projectDoc = await db.collection('projects').doc(projectId).get();
      
      if (projectDoc.exists) {
        const projectData = projectDoc.data();
        
        console.log(`  📋 Name: ${projectData.name}`);
        console.log(`  👥 Team Assignments: ${(projectData.teamAssignments || []).length}`);
        console.log(`  👤 Team Members: ${(projectData.teamMembers || []).length}`);
        
        // Check if enterprise user is in teamMembers
        const teamMembers = projectData.teamMembers || [];
        const userInTeam = teamMembers.find(member => 
          member.userId === userId || member.id === userId
        );
        
        if (userInTeam) {
          console.log(`  ✅ Enterprise user found in teamMembers:`);
          console.log(`    🎭 Role: ${userInTeam.role}`);
          console.log(`    📧 Email: ${userInTeam.email}`);
          console.log(`    👤 Name: ${userInTeam.name || 'Not set'}`);
        } else {
          console.log(`  ❌ Enterprise user NOT found in teamMembers`);
        }
        
        // Check teamAssignments too
        const teamAssignments = projectData.teamAssignments || [];
        const userInAssignments = teamAssignments.find(member => 
          member.userId === userId || member.id === userId
        );
        
        if (userInAssignments) {
          console.log(`  ✅ Enterprise user found in teamAssignments:`);
          console.log(`    🎭 Role: ${userInAssignments.role}`);
          console.log(`    🎛️ Dashboard Role: ${userInAssignments.dashboardRole}`);
          console.log(`    📊 Hierarchy: ${userInAssignments.hierarchyLevel}`);
        } else {
          console.log(`  ❌ Enterprise user NOT found in teamAssignments`);
        }
        
        // Show what the frontend would see
        console.log(`  🖥️ Frontend Display Data:`);
        if (teamMembers.length > 0) {
          teamMembers.forEach((member, index) => {
            const displayName = member.name || member.email?.split('@')[0] || 'Unnamed User';
            console.log(`    ${index + 1}. ${displayName} (${member.role}) - ${member.email}`);
          });
        } else {
          console.log(`    ⚠️ No team members to display`);
        }
      } else {
        console.log(`  ❌ Project document not found`);
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log('The enterprise user should now be visible in the project details');
    console.log('Team Members section of the licensing website.');
    console.log('\n💡 If not visible, try:');
    console.log('1. Refresh the browser page');
    console.log('2. Click the "Refresh Team Members" button');
    console.log('3. Close and reopen the project details');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyProjectTeamDisplay();
