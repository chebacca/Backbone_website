#!/usr/bin/env node

/**
 * Create Real Projects
 * 
 * This script creates proper real projects and assigns team members to them
 * instead of having everyone assigned to test projects.
 */

const admin = require('firebase-admin');

console.log('🏗️ Creating Real Projects and Assigning Team Members...\n');

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

const db = admin.firestore();

// Real project templates
const realProjects = [
  {
    name: 'Apple Enterprise Dashboard',
    description: 'Main enterprise dashboard for Apple team collaboration and project management',
    type: 'networked',
    applicationMode: 'shared_network',
    visibility: 'organization',
    storageBackend: 'firestore',
    allowCollaboration: true,
    maxCollaborators: 20,
    realTimeEnabled: true
  },
  {
    name: 'Content Production Pipeline',
    description: 'Video and content production workflow management system',
    type: 'networked', 
    applicationMode: 'shared_network',
    visibility: 'organization',
    storageBackend: 'firestore',
    allowCollaboration: true,
    maxCollaborators: 15,
    realTimeEnabled: true
  },
  {
    name: 'Marketing Campaign Manager',
    description: 'Campaign planning, execution, and analytics platform',
    type: 'networked',
    applicationMode: 'shared_network', 
    visibility: 'organization',
    storageBackend: 'firestore',
    allowCollaboration: true,
    maxCollaborators: 10,
    realTimeEnabled: true
  },
  {
    name: 'Financial Reporting System',
    description: 'Enterprise financial reporting and analytics dashboard',
    type: 'networked',
    applicationMode: 'shared_network',
    visibility: 'private',
    storageBackend: 'firestore',
    allowCollaboration: true,
    maxCollaborators: 8,
    realTimeEnabled: false
  },
  {
    name: 'Team Collaboration Hub',
    description: 'Central hub for team communication, file sharing, and project coordination',
    type: 'networked',
    applicationMode: 'shared_network',
    visibility: 'organization', 
    storageBackend: 'firestore',
    allowCollaboration: true,
    maxCollaborators: 25,
    realTimeEnabled: true
  }
];

async function createRealProjects() {
  try {
    console.log('2️⃣ Getting team members...\n');
    
    // Get all team members
    const teamMembersSnap = await db.collection('team_members').get();
    const teamMembers = [];
    
    teamMembersSnap.docs.forEach(doc => {
      const data = doc.data();
      teamMembers.push({
        id: doc.id,
        email: data.email,
        name: data.name,
        licenseType: data.licenseType,
        status: data.status
      });
    });
    
    console.log(`👥 Found ${teamMembers.size} team members`);
    teamMembers.forEach(member => {
      console.log(`   • ${member.name} (${member.email}) - ${member.licenseType}`);
    });
    console.log('');
    
    if (teamMembers.length === 0) {
      console.log('❌ No team members found - cannot create project assignments');
      return;
    }
    
    console.log('3️⃣ Creating real projects...\n');
    
    const createdProjects = [];
    
    for (const [index, projectTemplate] of realProjects.entries()) {
      console.log(`🏗️ Creating project ${index + 1}: ${projectTemplate.name}`);
      
      try {
        // Create project
        const projectRef = db.collection('projects').doc();
        const projectData = {
          ...projectTemplate,
          id: projectRef.id,
          ownerId: 'system', // System-created project
          isActive: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        };
        
        await projectRef.set(projectData);
        
        console.log(`   ✅ Created project: ${projectData.name} (${projectRef.id})`);
        
        createdProjects.push({
          id: projectRef.id,
          name: projectData.name,
          ...projectData
        });
        
      } catch (error) {
        console.log(`   ❌ Failed to create project ${projectTemplate.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Created ${createdProjects.length} real projects\n`);
    
    if (createdProjects.length === 0) {
      console.log('❌ No projects were created - cannot assign team members');
      return;
    }
    
    console.log('4️⃣ Assigning team members to real projects...\n');
    
    // Assign team members to projects
    let totalAssignments = 0;
    
    for (const project of createdProjects) {
      console.log(`👥 Assigning team members to: ${project.name}`);
      
      // Determine how many team members to assign to this project
      let assignmentCount;
      if (project.name.includes('Enterprise Dashboard')) {
        assignmentCount = Math.min(teamMembers.length, 6); // Main project gets most people
      } else if (project.name.includes('Financial')) {
        assignmentCount = Math.min(teamMembers.length, 3); // Financial is more restricted
      } else {
        assignmentCount = Math.min(teamMembers.length, 4); // Others get moderate assignment
      }
      
      // Shuffle team members and assign
      const shuffledMembers = [...teamMembers].sort(() => Math.random() - 0.5);
      const assignedMembers = shuffledMembers.slice(0, assignmentCount);
      
      for (const [memberIndex, member] of assignedMembers.entries()) {
        try {
          // Determine role based on project and member
          let role = 'DO_ER';
          if (memberIndex === 0) {
            role = 'ADMIN'; // First assigned member becomes admin
          } else if (member.licenseType === 'ENTERPRISE') {
            role = 'MANAGER'; // Enterprise users get manager role
          }
          
          // Create assignment
          const assignmentRef = db.collection('projectTeamMembers').doc();
          const assignmentData = {
            id: assignmentRef.id,
            projectId: project.id,
            teamMemberId: member.id,
            role: role,
            assignedAt: new Date(),
            assignedBy: 'system',
            isActive: true
          };
          
          await assignmentRef.set(assignmentData);
          
          console.log(`     ✅ ${member.name} assigned as ${role}`);
          totalAssignments++;
          
        } catch (error) {
          console.log(`     ❌ Failed to assign ${member.name}:`, error.message);
        }
      }
      
      console.log('');
    }
    
    console.log('📊 Assignment Summary:');
    console.log(`   🏗️ Real projects created: ${createdProjects.length}`);
    console.log(`   👥 Team member assignments: ${totalAssignments}`);
    console.log(`   📋 Average assignments per project: ${(totalAssignments / createdProjects.length).toFixed(1)}`);
    
    console.log('\n📋 Created Projects:');
    createdProjects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} (${project.id})`);
      console.log(`      Description: ${project.description}`);
      console.log(`      Max Collaborators: ${project.maxCollaborators}`);
      console.log(`      Real-time: ${project.realTimeEnabled ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    console.log('🎉 Real projects created and team members assigned successfully!');
    console.log('💡 Team members should now see these real projects in the Dashboard app.');
    
  } catch (error) {
    console.error('❌ Project creation failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await createRealProjects();
    process.exit(0);
  } catch (error) {
    console.error('❌ Project creation failed:', error.message);
    process.exit(1);
  }
}

main();
