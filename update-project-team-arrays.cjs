#!/usr/bin/env node

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function updateProjectTeamArrays() {
  console.log('🔧 Updating project team arrays to show admin assignments...\n');
  
  const userId = 'g8dkre0woUWYDvj6jeARh1ekeBa2';
  const userEmail = 'enterprise.user@example.com';
  
  try {
    // Step 1: Get all project assignments for the enterprise user
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`📊 Found ${assignments.size} project assignments to process`);
    
    // Step 2: For each assignment, update the corresponding project
    const batch = db.batch();
    let projectsUpdated = 0;
    
    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      const projectId = assignment.projectId;
      
      console.log(`\n📁 Processing project: ${projectId}`);
      
      // Get the project document
      const projectRef = db.collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();
      
      if (!projectDoc.exists) {
        console.log(`  ⚠️ Project ${projectId} not found`);
        continue;
      }
      
      const projectData = projectDoc.data();
      console.log(`  📋 Project name: ${projectData.name || 'Unnamed'}`);
      
      // Check current team assignments
      const currentTeamAssignments = projectData.teamAssignments || [];
      const currentTeamMembers = projectData.teamMembers || [];
      
      console.log(`  👥 Current team assignments: ${currentTeamAssignments.length}`);
      console.log(`  👤 Current team members: ${currentTeamMembers.length}`);
      
      // Check if user is already in team assignments
      const userInAssignments = currentTeamAssignments.some(member => 
        member.userId === userId || member.id === userId || member.email === userEmail
      );
      
      const userInMembers = currentTeamMembers.some(member => 
        (typeof member === 'string' && member === userId) ||
        (typeof member === 'object' && (member.userId === userId || member.id === userId || member.email === userEmail))
      );
      
      let needsUpdate = false;
      const updates = {};
      
      // Update teamAssignments array
      if (!userInAssignments) {
        const newTeamAssignment = {
          id: userId,
          userId: userId,
          email: userEmail,
          name: 'Enterprise User',
          role: assignment.role,
          dashboardRole: assignment.dashboardRole,
          hierarchyLevel: assignment.hierarchyLevel,
          assignedAt: assignment.assignedAt,
          assignedBy: assignment.assignedBy,
          isActive: assignment.isActive,
          permissions: assignment.enhancedPermissions
        };
        
        updates.teamAssignments = [...currentTeamAssignments, newTeamAssignment];
        needsUpdate = true;
        console.log(`  ✅ Adding user to teamAssignments as ${assignment.role}`);
      } else {
        console.log(`  ✅ User already in teamAssignments`);
      }
      
      // Update teamMembers array (simpler format)
      if (!userInMembers) {
        const newTeamMember = {
          userId: userId,
          email: userEmail,
          role: assignment.role,
          addedAt: assignment.assignedAt
        };
        
        updates.teamMembers = [...currentTeamMembers, newTeamMember];
        needsUpdate = true;
        console.log(`  ✅ Adding user to teamMembers`);
      } else {
        console.log(`  ✅ User already in teamMembers`);
      }
      
      // Update project metadata
      if (needsUpdate) {
        updates.lastUpdated = admin.firestore.Timestamp.now();
        updates.updatedBy = 'system-team-sync';
        
        batch.update(projectRef, updates);
        projectsUpdated++;
      }
    }
    
    // Step 3: Commit all updates
    if (projectsUpdated > 0) {
      await batch.commit();
      console.log(`\n🎉 Updated ${projectsUpdated} projects with team assignments`);
    } else {
      console.log(`\n✅ All projects already have correct team assignments`);
    }
    
    // Step 4: Verify the updates
    await verifyProjectUpdates(userId);
    
  } catch (error) {
    console.error('❌ Error updating project team arrays:', error);
  }
}

async function verifyProjectUpdates(userId) {
  console.log('\n🔍 Verifying project updates...');
  
  try {
    // Get all assignments again
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`📊 Checking ${assignments.size} project assignments:`);
    
    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      const projectId = assignment.projectId;
      
      // Check the project document
      const projectDoc = await db.collection('projects').doc(projectId).get();
      
      if (projectDoc.exists) {
        const projectData = projectDoc.data();
        const teamAssignments = projectData.teamAssignments || [];
        const teamMembers = projectData.teamMembers || [];
        
        const userInAssignments = teamAssignments.some(member => 
          member.userId === userId || member.id === userId
        );
        
        const userInMembers = teamMembers.some(member => 
          (typeof member === 'string' && member === userId) ||
          (typeof member === 'object' && (member.userId === userId || member.id === userId))
        );
        
        console.log(`  📁 ${projectData.name || projectId}:`);
        console.log(`    👥 In teamAssignments: ${userInAssignments ? '✅' : '❌'}`);
        console.log(`    👤 In teamMembers: ${userInMembers ? '✅' : '❌'}`);
        console.log(`    🎭 Role: ${assignment.role} → ${assignment.dashboardRole}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

updateProjectTeamArrays();

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function updateProjectTeamArrays() {
  console.log('🔧 Updating project team arrays to show admin assignments...\n');
  
  const userId = 'g8dkre0woUWYDvj6jeARh1ekeBa2';
  const userEmail = 'enterprise.user@example.com';
  
  try {
    // Step 1: Get all project assignments for the enterprise user
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`📊 Found ${assignments.size} project assignments to process`);
    
    // Step 2: For each assignment, update the corresponding project
    const batch = db.batch();
    let projectsUpdated = 0;
    
    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      const projectId = assignment.projectId;
      
      console.log(`\n📁 Processing project: ${projectId}`);
      
      // Get the project document
      const projectRef = db.collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();
      
      if (!projectDoc.exists) {
        console.log(`  ⚠️ Project ${projectId} not found`);
        continue;
      }
      
      const projectData = projectDoc.data();
      console.log(`  📋 Project name: ${projectData.name || 'Unnamed'}`);
      
      // Check current team assignments
      const currentTeamAssignments = projectData.teamAssignments || [];
      const currentTeamMembers = projectData.teamMembers || [];
      
      console.log(`  👥 Current team assignments: ${currentTeamAssignments.length}`);
      console.log(`  👤 Current team members: ${currentTeamMembers.length}`);
      
      // Check if user is already in team assignments
      const userInAssignments = currentTeamAssignments.some(member => 
        member.userId === userId || member.id === userId || member.email === userEmail
      );
      
      const userInMembers = currentTeamMembers.some(member => 
        (typeof member === 'string' && member === userId) ||
        (typeof member === 'object' && (member.userId === userId || member.id === userId || member.email === userEmail))
      );
      
      let needsUpdate = false;
      const updates = {};
      
      // Update teamAssignments array
      if (!userInAssignments) {
        const newTeamAssignment = {
          id: userId,
          userId: userId,
          email: userEmail,
          name: 'Enterprise User',
          role: assignment.role,
          dashboardRole: assignment.dashboardRole,
          hierarchyLevel: assignment.hierarchyLevel,
          assignedAt: assignment.assignedAt,
          assignedBy: assignment.assignedBy,
          isActive: assignment.isActive,
          permissions: assignment.enhancedPermissions
        };
        
        updates.teamAssignments = [...currentTeamAssignments, newTeamAssignment];
        needsUpdate = true;
        console.log(`  ✅ Adding user to teamAssignments as ${assignment.role}`);
      } else {
        console.log(`  ✅ User already in teamAssignments`);
      }
      
      // Update teamMembers array (simpler format)
      if (!userInMembers) {
        const newTeamMember = {
          userId: userId,
          email: userEmail,
          role: assignment.role,
          addedAt: assignment.assignedAt
        };
        
        updates.teamMembers = [...currentTeamMembers, newTeamMember];
        needsUpdate = true;
        console.log(`  ✅ Adding user to teamMembers`);
      } else {
        console.log(`  ✅ User already in teamMembers`);
      }
      
      // Update project metadata
      if (needsUpdate) {
        updates.lastUpdated = admin.firestore.Timestamp.now();
        updates.updatedBy = 'system-team-sync';
        
        batch.update(projectRef, updates);
        projectsUpdated++;
      }
    }
    
    // Step 3: Commit all updates
    if (projectsUpdated > 0) {
      await batch.commit();
      console.log(`\n🎉 Updated ${projectsUpdated} projects with team assignments`);
    } else {
      console.log(`\n✅ All projects already have correct team assignments`);
    }
    
    // Step 4: Verify the updates
    await verifyProjectUpdates(userId);
    
  } catch (error) {
    console.error('❌ Error updating project team arrays:', error);
  }
}

async function verifyProjectUpdates(userId) {
  console.log('\n🔍 Verifying project updates...');
  
  try {
    // Get all assignments again
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`📊 Checking ${assignments.size} project assignments:`);
    
    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      const projectId = assignment.projectId;
      
      // Check the project document
      const projectDoc = await db.collection('projects').doc(projectId).get();
      
      if (projectDoc.exists) {
        const projectData = projectDoc.data();
        const teamAssignments = projectData.teamAssignments || [];
        const teamMembers = projectData.teamMembers || [];
        
        const userInAssignments = teamAssignments.some(member => 
          member.userId === userId || member.id === userId
        );
        
        const userInMembers = teamMembers.some(member => 
          (typeof member === 'string' && member === userId) ||
          (typeof member === 'object' && (member.userId === userId || member.id === userId))
        );
        
        console.log(`  📁 ${projectData.name || projectId}:`);
        console.log(`    👥 In teamAssignments: ${userInAssignments ? '✅' : '❌'}`);
        console.log(`    👤 In teamMembers: ${userInMembers ? '✅' : '❌'}`);
        console.log(`    🎭 Role: ${assignment.role} → ${assignment.dashboardRole}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

updateProjectTeamArrays();
