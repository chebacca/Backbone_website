#!/usr/bin/env node

/**
 * Debug why project details lookup is failing
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

async function debugProjectLookup() {
  console.log('🔍 Debugging project lookup issue...');
  
  const teamMemberId = 'VDkIOHtIFbqAE1AdBSQE';
  
  // Get the project assignments
  console.log('📋 Step 1: Getting project assignments...');
  const assignmentsQuery = await db.collection('projectTeamMembers')
    .where('teamMemberId', '==', teamMemberId)
    .get();
  
  console.log(`📊 Found ${assignmentsQuery.size} project assignments`);
  
  if (assignmentsQuery.empty) {
    console.log('❌ No assignments found');
    return;
  }
  
  // Check each project assignment
  console.log('\\n📋 Step 2: Checking each project...');
  let foundProjects = 0;
  let missingProjects = 0;
  
  for (const doc of assignmentsQuery.docs) {
    const assignment = doc.data();
    const projectId = assignment.projectId;
    
    console.log(`\\n🔍 Assignment ${doc.id}:`);
    console.log(`  - Project ID: ${projectId}`);
    console.log(`  - Role: ${assignment.role}`);
    console.log(`  - Active: ${assignment.isActive}`);
    
    // Try to get the project details
    try {
      const projectDoc = await db.collection('projects').doc(projectId).get();
      
      if (projectDoc.exists) {
        const projectData = projectDoc.data();
        console.log(`  ✅ Project found: ${projectData.name}`);
        console.log(`     - Active: ${projectData.isActive}`);
        console.log(`     - Archived: ${projectData.isArchived}`);
        
        if (projectData.isActive && !projectData.isArchived) {
          foundProjects++;
          console.log(`     ✅ Project should be included in results`);
        } else {
          console.log(`     ⚠️  Project excluded (inactive or archived)`);
        }
      } else {
        console.log(`  ❌ Project NOT found in projects collection`);
        missingProjects++;
      }
    } catch (error) {
      console.log(`  ❌ Error fetching project: ${error.message}`);
      missingProjects++;
    }
  }
  
  console.log(`\\n📊 Summary:`);
  console.log(`  - Total assignments: ${assignmentsQuery.size}`);
  console.log(`  - Projects found: ${foundProjects}`);
  console.log(`  - Projects missing: ${missingProjects}`);
  
  if (foundProjects === 0) {
    console.log('\\n🔧 ISSUE: No active projects found - this explains why API returns 0 projects');
    console.log('   Either:');
    console.log('   1. Projects do not exist in the projects collection');
    console.log('   2. Projects are inactive or archived');
    console.log('   3. There is an issue with the getProjectByIdAuthorized function');
  }
  
  process.exit(0);
}

debugProjectLookup().catch(console.error);
