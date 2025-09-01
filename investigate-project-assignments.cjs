#!/usr/bin/env node

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function investigateProjectAssignments() {
  console.log('🔍 Investigating where enterprise user project assignments are stored...\n');
  
  try {
    const userId = 'g8dkre0woUWYDvj6jeARh1ekeBa2'; // enterprise user ID
    
    // Check all possible collections where assignments might be stored
    await checkCollection('projectAssignments', userId);
    await checkCollection('teamAssignments', userId);
    await checkCollection('teamMembers', userId);
    await checkCollection('orgMembers', userId);
    await checkCollection('org_members', userId);
    await checkCollection('userProjects', userId);
    await checkCollection('projectMembers', userId);
    
    // Check if assignments are embedded in projects
    await checkProjectsForEmbeddedAssignments(userId);
    
    // Check if assignments are embedded in user document
    await checkUserDocumentForAssignments(userId);
    
    // Check licenses collection for project assignments
    await checkLicensesForAssignments(userId);
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

async function checkCollection(collectionName, userId) {
  console.log(`📊 Checking ${collectionName} collection...`);
  
  try {
    // Try different field names that might contain user ID
    const fieldNames = ['userId', 'memberId', 'assignedTo', 'user', 'userEmail'];
    
    for (const fieldName of fieldNames) {
      try {
        const query = await db.collection(collectionName)
          .where(fieldName, '==', userId)
          .get();
        
        if (!query.empty) {
          console.log(`  ✅ Found ${query.size} documents in ${collectionName} with ${fieldName}`);
          
          // Show sample documents
          for (const doc of query.docs.slice(0, 3)) {
            const data = doc.data();
            console.log(`    📄 ${doc.id}:`, {
              projectId: data.projectId || data.project || 'N/A',
              role: data.role || data.memberRole || 'N/A',
              status: data.status || data.isActive || 'N/A'
            });
          }
        }
      } catch (error) {
        // Field might not exist, continue
      }
    }
    
    // Also try email-based queries
    try {
      const emailQuery = await db.collection(collectionName)
        .where('email', '==', 'enterprise.user@example.com')
        .get();
      
      if (!emailQuery.empty) {
        console.log(`  ✅ Found ${emailQuery.size} documents in ${collectionName} by email`);
      }
    } catch (error) {
      // Email field might not exist
    }
    
  } catch (error) {
    console.log(`  ⚠️ Error checking ${collectionName}:`, error.message);
  }
}

async function checkProjectsForEmbeddedAssignments(userId) {
  console.log('\n📁 Checking projects for embedded team assignments...');
  
  try {
    const projects = await db.collection('projects').get();
    
    let foundAssignments = 0;
    
    for (const projectDoc of projects.docs) {
      const projectData = projectDoc.data();
      
      // Check various fields where team members might be stored
      const teamFields = ['teamMembers', 'team', 'members', 'assignedUsers', 'teamAssignments'];
      
      for (const field of teamFields) {
        if (projectData[field]) {
          // Check if it's an array
          if (Array.isArray(projectData[field])) {
            const hasUser = projectData[field].some(member => 
              (typeof member === 'string' && member === userId) ||
              (typeof member === 'object' && (member.userId === userId || member.id === userId || member.email === 'enterprise.user@example.com'))
            );
            
            if (hasUser) {
              console.log(`  ✅ Found user in project ${projectDoc.id} (${projectData.name}) in field ${field}`);
              console.log(`    📋 Team data:`, projectData[field]);
              foundAssignments++;
            }
          }
          // Check if it's an object with user IDs as keys
          else if (typeof projectData[field] === 'object') {
            if (projectData[field][userId]) {
              console.log(`  ✅ Found user in project ${projectDoc.id} (${projectData.name}) in field ${field}`);
              console.log(`    📋 User data:`, projectData[field][userId]);
              foundAssignments++;
            }
          }
        }
      }
    }
    
    if (foundAssignments === 0) {
      console.log('  ❌ No embedded assignments found in projects');
    } else {
      console.log(`  📊 Total embedded assignments found: ${foundAssignments}`);
    }
    
  } catch (error) {
    console.log('  ⚠️ Error checking projects:', error.message);
  }
}

async function checkUserDocumentForAssignments(userId) {
  console.log('\n👤 Checking user document for embedded project assignments...');
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('  ❌ User document not found');
      return;
    }
    
    const userData = userDoc.data();
    
    // Check various fields where projects might be stored
    const projectFields = ['projects', 'assignedProjects', 'memberOf', 'projectMemberships', 'roles'];
    
    for (const field of projectFields) {
      if (userData[field]) {
        console.log(`  ✅ Found ${field} in user document:`, userData[field]);
      }
    }
    
    // Check if there are any fields with project-like data
    for (const [key, value] of Object.entries(userData)) {
      if (key.toLowerCase().includes('project') || key.toLowerCase().includes('assignment')) {
        console.log(`  📋 Found project-related field ${key}:`, value);
      }
    }
    
  } catch (error) {
    console.log('  ⚠️ Error checking user document:', error.message);
  }
}

async function checkLicensesForAssignments(userId) {
  console.log('\n🎫 Checking licenses collection for project assignments...');
  
  try {
    // Check licenses by user ID
    const licensesByUser = await db.collection('licenses')
      .where('userId', '==', userId)
      .get();
    
    if (!licensesByUser.empty) {
      console.log(`  ✅ Found ${licensesByUser.size} licenses for user`);
      
      for (const licenseDoc of licensesByUser.docs) {
        const licenseData = licenseDoc.data();
        console.log(`    📄 License ${licenseDoc.id}:`, {
          projectId: licenseData.projectId || 'N/A',
          status: licenseData.status || 'N/A',
          type: licenseData.type || 'N/A'
        });
      }
    }
    
    // Check licenses by email
    const licensesByEmail = await db.collection('licenses')
      .where('userEmail', '==', 'enterprise.user@example.com')
      .get();
    
    if (!licensesByEmail.empty) {
      console.log(`  ✅ Found ${licensesByEmail.size} licenses by email`);
      
      for (const licenseDoc of licensesByEmail.docs) {
        const licenseData = licenseDoc.data();
        console.log(`    📄 License ${licenseDoc.id}:`, {
          projectId: licenseData.projectId || 'N/A',
          status: licenseData.status || 'N/A',
          type: licenseData.type || 'N/A'
        });
      }
    }
    
    if (licensesByUser.empty && licensesByEmail.empty) {
      console.log('  ❌ No licenses found for user');
    }
    
  } catch (error) {
    console.log('  ⚠️ Error checking licenses:', error.message);
  }
}

investigateProjectAssignments();

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function investigateProjectAssignments() {
  console.log('🔍 Investigating where enterprise user project assignments are stored...\n');
  
  try {
    const userId = 'g8dkre0woUWYDvj6jeARh1ekeBa2'; // enterprise user ID
    
    // Check all possible collections where assignments might be stored
    await checkCollection('projectAssignments', userId);
    await checkCollection('teamAssignments', userId);
    await checkCollection('teamMembers', userId);
    await checkCollection('orgMembers', userId);
    await checkCollection('org_members', userId);
    await checkCollection('userProjects', userId);
    await checkCollection('projectMembers', userId);
    
    // Check if assignments are embedded in projects
    await checkProjectsForEmbeddedAssignments(userId);
    
    // Check if assignments are embedded in user document
    await checkUserDocumentForAssignments(userId);
    
    // Check licenses collection for project assignments
    await checkLicensesForAssignments(userId);
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

async function checkCollection(collectionName, userId) {
  console.log(`📊 Checking ${collectionName} collection...`);
  
  try {
    // Try different field names that might contain user ID
    const fieldNames = ['userId', 'memberId', 'assignedTo', 'user', 'userEmail'];
    
    for (const fieldName of fieldNames) {
      try {
        const query = await db.collection(collectionName)
          .where(fieldName, '==', userId)
          .get();
        
        if (!query.empty) {
          console.log(`  ✅ Found ${query.size} documents in ${collectionName} with ${fieldName}`);
          
          // Show sample documents
          for (const doc of query.docs.slice(0, 3)) {
            const data = doc.data();
            console.log(`    📄 ${doc.id}:`, {
              projectId: data.projectId || data.project || 'N/A',
              role: data.role || data.memberRole || 'N/A',
              status: data.status || data.isActive || 'N/A'
            });
          }
        }
      } catch (error) {
        // Field might not exist, continue
      }
    }
    
    // Also try email-based queries
    try {
      const emailQuery = await db.collection(collectionName)
        .where('email', '==', 'enterprise.user@example.com')
        .get();
      
      if (!emailQuery.empty) {
        console.log(`  ✅ Found ${emailQuery.size} documents in ${collectionName} by email`);
      }
    } catch (error) {
      // Email field might not exist
    }
    
  } catch (error) {
    console.log(`  ⚠️ Error checking ${collectionName}:`, error.message);
  }
}

async function checkProjectsForEmbeddedAssignments(userId) {
  console.log('\n📁 Checking projects for embedded team assignments...');
  
  try {
    const projects = await db.collection('projects').get();
    
    let foundAssignments = 0;
    
    for (const projectDoc of projects.docs) {
      const projectData = projectDoc.data();
      
      // Check various fields where team members might be stored
      const teamFields = ['teamMembers', 'team', 'members', 'assignedUsers', 'teamAssignments'];
      
      for (const field of teamFields) {
        if (projectData[field]) {
          // Check if it's an array
          if (Array.isArray(projectData[field])) {
            const hasUser = projectData[field].some(member => 
              (typeof member === 'string' && member === userId) ||
              (typeof member === 'object' && (member.userId === userId || member.id === userId || member.email === 'enterprise.user@example.com'))
            );
            
            if (hasUser) {
              console.log(`  ✅ Found user in project ${projectDoc.id} (${projectData.name}) in field ${field}`);
              console.log(`    📋 Team data:`, projectData[field]);
              foundAssignments++;
            }
          }
          // Check if it's an object with user IDs as keys
          else if (typeof projectData[field] === 'object') {
            if (projectData[field][userId]) {
              console.log(`  ✅ Found user in project ${projectDoc.id} (${projectData.name}) in field ${field}`);
              console.log(`    📋 User data:`, projectData[field][userId]);
              foundAssignments++;
            }
          }
        }
      }
    }
    
    if (foundAssignments === 0) {
      console.log('  ❌ No embedded assignments found in projects');
    } else {
      console.log(`  📊 Total embedded assignments found: ${foundAssignments}`);
    }
    
  } catch (error) {
    console.log('  ⚠️ Error checking projects:', error.message);
  }
}

async function checkUserDocumentForAssignments(userId) {
  console.log('\n👤 Checking user document for embedded project assignments...');
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('  ❌ User document not found');
      return;
    }
    
    const userData = userDoc.data();
    
    // Check various fields where projects might be stored
    const projectFields = ['projects', 'assignedProjects', 'memberOf', 'projectMemberships', 'roles'];
    
    for (const field of projectFields) {
      if (userData[field]) {
        console.log(`  ✅ Found ${field} in user document:`, userData[field]);
      }
    }
    
    // Check if there are any fields with project-like data
    for (const [key, value] of Object.entries(userData)) {
      if (key.toLowerCase().includes('project') || key.toLowerCase().includes('assignment')) {
        console.log(`  📋 Found project-related field ${key}:`, value);
      }
    }
    
  } catch (error) {
    console.log('  ⚠️ Error checking user document:', error.message);
  }
}

async function checkLicensesForAssignments(userId) {
  console.log('\n🎫 Checking licenses collection for project assignments...');
  
  try {
    // Check licenses by user ID
    const licensesByUser = await db.collection('licenses')
      .where('userId', '==', userId)
      .get();
    
    if (!licensesByUser.empty) {
      console.log(`  ✅ Found ${licensesByUser.size} licenses for user`);
      
      for (const licenseDoc of licensesByUser.docs) {
        const licenseData = licenseDoc.data();
        console.log(`    📄 License ${licenseDoc.id}:`, {
          projectId: licenseData.projectId || 'N/A',
          status: licenseData.status || 'N/A',
          type: licenseData.type || 'N/A'
        });
      }
    }
    
    // Check licenses by email
    const licensesByEmail = await db.collection('licenses')
      .where('userEmail', '==', 'enterprise.user@example.com')
      .get();
    
    if (!licensesByEmail.empty) {
      console.log(`  ✅ Found ${licensesByEmail.size} licenses by email`);
      
      for (const licenseDoc of licensesByEmail.docs) {
        const licenseData = licenseDoc.data();
        console.log(`    📄 License ${licenseDoc.id}:`, {
          projectId: licenseData.projectId || 'N/A',
          status: licenseData.status || 'N/A',
          type: licenseData.type || 'N/A'
        });
      }
    }
    
    if (licensesByUser.empty && licensesByEmail.empty) {
      console.log('  ❌ No licenses found for user');
    }
    
  } catch (error) {
    console.log('  ⚠️ Error checking licenses:', error.message);
  }
}

investigateProjectAssignments();
