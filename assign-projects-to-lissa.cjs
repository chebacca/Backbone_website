const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const isCloudFunctionsEnv = Boolean(
    process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.FIREBASE_CONFIG
  );
  
  if (isCloudFunctionsEnv) {
    // In Cloud Functions, use default credentials
    admin.initializeApp();
  } else {
    // For local development, use environment variables or default credentials
    const projectId = process.env.FIREBASE_PROJECT_ID || 'backbone-logic';
    admin.initializeApp({ projectId });
  }
}

const db = admin.firestore();

async function assignProjectsToLissa() {
  try {
    console.log('🔍 Starting project assignment for Lissa...');
    
    // Lissa's details
    const lissaEmail = 'lissa@apple.com';
    const lissaId = 'VDkIOHtIFbqAE1AdBSQE';
    
    console.log('👤 Lissa details:');
    console.log('  Email:', lissaEmail);
    console.log('  User ID:', lissaId);
    
    // First, let's check if Lissa exists in the users collection
    const usersSnap = await db.collection('users').where('email', '==', lissaEmail).get();
    console.log('\n👤 Users with Lissa\'s email:', usersSnap.size);
    
    let lissaUserId = lissaId;
    if (!usersSnap.empty) {
      const userData = usersSnap.docs[0].data();
      lissaUserId = usersSnap.docs[0].id;
      console.log('  Found user doc:', lissaUserId, ':', userData);
    } else {
      console.log('  No user found with email, using provided ID:', lissaId);
    }
    
    // Check if Lissa exists in team members collection
    const teamMembersSnap = await db.collection('teamMembers').where('email', '==', lissaEmail).get();
    console.log('\n👥 Team members with Lissa\'s email:', teamMembersSnap.size);
    
    let teamMemberId = lissaUserId;
    if (!teamMembersSnap.empty) {
      const teamMemberData = teamMembersSnap.docs[0].data();
      teamMemberId = teamMembersSnap.docs[0].id;
      console.log('  Found team member doc:', teamMemberId, ':', teamMemberData);
    } else {
      console.log('  No team member found, using user ID:', lissaUserId);
    }
    
    // Get available projects
    const projectsSnap = await db.collection('projects').where('isActive', '==', true).limit(5).get();
    console.log('\n📁 Available active projects:', projectsSnap.size);
    
    if (projectsSnap.empty) {
      console.log('❌ No active projects found. Creating a test project...');
      
      // Create a test project
      const projectRef = db.collection('projects').doc();
      const testProject = {
        id: projectRef.id,
        name: 'Lissa Test Project',
        description: 'Test project for Lissa team member access',
        type: 'enterprise',
        applicationMode: 'shared_network',
        storageBackend: 'firestore',
        visibility: 'private',
        isActive: true,
        isArchived: false,
        allowCollaboration: true,
        maxCollaborators: 10,
        ownerId: 'system',
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await projectRef.set(testProject);
      console.log('✅ Created test project:', testProject.name, '(ID:', testProject.id, ')');
      
      // Add this project to our list
      projectsSnap.docs.push({
        id: testProject.id,
        data: () => testProject
      });
    }
    
    // Show available projects
    const projects = [];
    projectsSnap.forEach(doc => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        ownerId: data.ownerId || data.createdBy
      });
      console.log('  Project:', doc.id, '- Name:', data.name, '- Owner:', data.ownerId || data.createdBy);
    });
    
    // Check existing assignments for Lissa
    console.log('\n📋 Checking existing assignments for Lissa...');
    const existingAssignmentsSnap = await db.collection('projectTeamMembers')
      .where('teamMemberId', '==', teamMemberId)
      .get();
    
    console.log('  Existing assignments:', existingAssignmentsSnap.size);
    existingAssignmentsSnap.forEach(doc => {
      const data = doc.data();
      console.log('    -', doc.id, ':', data);
    });
    
    // Assign Lissa to projects (if not already assigned)
    let assignmentCount = 0;
    
    for (const project of projects.slice(0, 3)) { // Assign to first 3 projects
      try {
        // Check if already assigned
        const existingAssignment = await db.collection('projectTeamMembers')
          .where('projectId', '==', project.id)
          .where('teamMemberId', '==', teamMemberId)
          .limit(1)
          .get();
        
        if (!existingAssignment.empty) {
          console.log(`  ⏭️  Lissa already assigned to ${project.name}`);
          continue;
        }
        
        // Create assignment
        const assignmentRef = db.collection('projectTeamMembers').doc();
        const assignmentData = {
          id: assignmentRef.id,
          projectId: project.id,
          teamMemberId: teamMemberId,
          role: assignmentCount === 0 ? 'ADMIN' : 'DO_ER', // First project as admin, others as do-er
          assignedAt: new Date(),
          assignedBy: 'system',
          isActive: true,
          accessLevel: 'full'
        };
        
        await assignmentRef.set(assignmentData);
        
        console.log(`  ✅ Assigned Lissa to ${project.name} as ${assignmentData.role}`);
        assignmentCount++;
        
      } catch (error) {
        console.log(`  ❌ Failed to assign Lissa to ${project.name}:`, error.message);
      }
    }
    
    console.log('\n📊 Assignment Summary:');
    console.log(`  Total assignments created: ${assignmentCount}`);
    
    // Verify assignments
    console.log('\n🔍 Verifying assignments...');
    const finalAssignmentsSnap = await db.collection('projectTeamMembers')
      .where('teamMemberId', '==', teamMemberId)
      .get();
    
    console.log('  Final assignment count:', finalAssignmentsSnap.size);
    finalAssignmentsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`    - Project: ${data.projectId}, Role: ${data.role}, Active: ${data.isActive}`);
    });
    
    console.log('\n✅ Project assignment completed!');
    console.log('🔄 Please refresh the web app to see Lissa\'s assigned projects.');
    
  } catch (error) {
    console.error('❌ Error assigning projects to Lissa:', error);
  }
  
  process.exit(0);
}

assignProjectsToLissa();
