#!/usr/bin/env node

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function migrateExistingAssignments() {
  console.log('🔄 Migrating existing project assignments to unified system...\n');
  
  const userId = 'g8dkre0woUWYDvj6jeARh1ekeBa2';
  const userEmail = 'enterprise.user@example.com';
  
  try {
    // Step 1: Get detailed data from existing collections
    const existingData = await gatherExistingData(userId, userEmail);
    
    // Step 2: Create unified project assignments
    await createUnifiedAssignments(userId, existingData);
    
    // Step 3: Update user's dashboard role mappings
    await updateUserDashboardMappings(userId, existingData);
    
    // Step 4: Verify the migration
    await verifyMigration(userId);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function gatherExistingData(userId, userEmail) {
  console.log('📊 Gathering existing assignment data...');
  
  const existingData = {
    teamMembers: [],
    orgMembers: [],
    org_members: [],
    projects: new Set(),
    roles: new Set()
  };
  
  try {
    // Get teamMembers data
    const teamMembersQuery = await db.collection('teamMembers')
      .where('email', '==', userEmail)
      .get();
    
    for (const doc of teamMembersQuery.docs) {
      const data = doc.data();
      existingData.teamMembers.push({ id: doc.id, ...data });
      if (data.projectId) existingData.projects.add(data.projectId);
      if (data.role) existingData.roles.add(data.role);
      console.log(`  📋 TeamMember: ${doc.id} - Project: ${data.projectId || 'N/A'} - Role: ${data.role || 'N/A'}`);
    }
    
    // Get orgMembers data
    const orgMembersQuery = await db.collection('orgMembers')
      .where('userId', '==', userId)
      .get();
    
    for (const doc of orgMembersQuery.docs) {
      const data = doc.data();
      existingData.orgMembers.push({ id: doc.id, ...data });
      if (data.projectId) existingData.projects.add(data.projectId);
      if (data.role) existingData.roles.add(data.role);
      console.log(`  📋 OrgMember: ${doc.id} - Project: ${data.projectId || 'N/A'} - Role: ${data.role || 'N/A'}`);
    }
    
    // Get org_members data
    const org_membersQuery = await db.collection('org_members')
      .where('userId', '==', userId)
      .get();
    
    for (const doc of org_membersQuery.docs) {
      const data = doc.data();
      existingData.org_members.push({ id: doc.id, ...data });
      if (data.projectId) existingData.projects.add(data.projectId);
      if (data.role) existingData.roles.add(data.role);
      console.log(`  📋 Org_Member: ${doc.id} - Project: ${data.projectId || 'N/A'} - Role: ${data.role || 'N/A'}`);
    }
    
    // If no specific projects found, get all projects for the organization
    if (existingData.projects.size === 0) {
      console.log('  🔍 No specific projects found, getting all org projects...');
      
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData.organizationId) {
        const orgProjectsQuery = await db.collection('projects')
          .where('organizationId', '==', userData.organizationId)
          .get();
        
        for (const projectDoc of orgProjectsQuery.docs) {
          existingData.projects.add(projectDoc.id);
          console.log(`  📁 Org Project: ${projectDoc.id} - ${projectDoc.data().name || 'Unnamed'}`);
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  📁 Projects found: ${existingData.projects.size}`);
    console.log(`  🎭 Roles found: ${Array.from(existingData.roles).join(', ')}`);
    console.log(`  📋 TeamMembers: ${existingData.teamMembers.length}`);
    console.log(`  👥 OrgMembers: ${existingData.orgMembers.length}`);
    console.log(`  🏢 Org_Members: ${existingData.org_members.length}`);
    
    return existingData;
    
  } catch (error) {
    console.error('❌ Error gathering existing data:', error);
    return existingData;
  }
}

async function createUnifiedAssignments(userId, existingData) {
  console.log('\n🔧 Creating unified project assignments...');
  
  if (existingData.projects.size === 0) {
    console.log('  ⚠️ No projects to create assignments for');
    return;
  }
  
  const batch = db.batch();
  let assignmentsCreated = 0;
  
  // Determine the user's role (OWNER becomes ADMIN in our system)
  const userRole = existingData.roles.has('OWNER') || existingData.roles.has('owner') ? 'ADMIN' : 'MANAGER';
  
  for (const projectId of existingData.projects) {
    // Check if assignment already exists
    const existingAssignment = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .where('projectId', '==', projectId)
      .get();
    
    if (existingAssignment.empty) {
      const assignmentRef = db.collection('projectAssignments').doc();
      
      const assignmentData = {
        id: assignmentRef.id,
        projectId,
        userId,
        role: userRole,
        assignedBy: 'system-migration',
        assignedAt: admin.firestore.Timestamp.now(),
        isActive: true,
        
        // Enhanced unified system fields
        dashboardRole: userRole,
        hierarchyLevel: userRole === 'ADMIN' ? 100 : 80,
        enhancedPermissions: {
          canManageTeam: true,
          canManageProjects: true,
          canViewFinancials: userRole === 'ADMIN',
          canEditContent: true,
          canApproveContent: true,
          canAccessReports: true,
          canManageSettings: userRole === 'ADMIN',
          hierarchyLevel: userRole === 'ADMIN' ? 100 : 80
        },
        syncMetadata: {
          lastSyncedAt: admin.firestore.Timestamp.now(),
          syncSource: 'existing-data-migration',
          syncVersion: '2.0',
          migratedFrom: {
            teamMembers: existingData.teamMembers.length > 0,
            orgMembers: existingData.orgMembers.length > 0,
            org_members: existingData.org_members.length > 0
          }
        }
      };
      
      batch.set(assignmentRef, assignmentData);
      assignmentsCreated++;
      console.log(`  ✅ Creating ${userRole} assignment for project ${projectId}`);
    } else {
      console.log(`  ✅ Assignment already exists for project ${projectId}`);
    }
  }
  
  if (assignmentsCreated > 0) {
    await batch.commit();
    console.log(`  🎉 Created ${assignmentsCreated} new unified assignments`);
  } else {
    console.log(`  ✅ All assignments already exist`);
  }
}

async function updateUserDashboardMappings(userId, existingData) {
  console.log('\n🎛️ Updating user dashboard role mappings...');
  
  if (existingData.projects.size === 0) {
    console.log('  ⚠️ No projects to create mappings for');
    return;
  }
  
  const userRole = existingData.roles.has('OWNER') || existingData.roles.has('owner') ? 'ADMIN' : 'MANAGER';
  const dashboardMappings = {};
  
  for (const projectId of existingData.projects) {
    dashboardMappings[projectId] = {
      dashboardRole: userRole,
      hierarchy: userRole === 'ADMIN' ? 100 : 80,
      permissions: {
        canManageTeam: true,
        canManageProjects: true,
        canViewFinancials: userRole === 'ADMIN',
        canEditContent: true,
        canApproveContent: true,
        canAccessReports: true,
        canManageSettings: userRole === 'ADMIN',
        hierarchyLevel: userRole === 'ADMIN' ? 100 : 80
      },
      licensingRole: 'ENTERPRISE_USER',
      templateRole: userRole === 'ADMIN' ? 'enterprise-admin-template' : 'enterprise-manager-template',
      syncedAt: admin.firestore.Timestamp.now(),
      syncSource: 'existing-data-migration',
      migratedFrom: 'legacy-collections'
    };
  }
  
  await db.collection('users').doc(userId).update({
    dashboardRoleMappings: dashboardMappings,
    lastRoleSync: admin.firestore.Timestamp.now(),
    roleSystemVersion: '2.0'
  });
  
  console.log(`  ✅ Updated dashboard mappings for ${Object.keys(dashboardMappings).length} projects`);
  
  // Log migration event
  await db.collection('roleSyncEvents').add({
    type: 'LEGACY_DATA_MIGRATION',
    userId,
    sourceApp: 'licensing-website',
    targetApp: 'dashboard',
    timestamp: admin.firestore.Timestamp.now(),
    details: {
      projectsMigrated: existingData.projects.size,
      role: userRole,
      sourceCollections: ['teamMembers', 'orgMembers', 'org_members'],
      migratedMappings: Object.keys(dashboardMappings).length
    }
  });
}

async function verifyMigration(userId) {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Check project assignments
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`  📊 Project assignments: ${assignments.size}`);
    
    // Check user dashboard mappings
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    const mappingCount = userData.dashboardRoleMappings ? Object.keys(userData.dashboardRoleMappings).length : 0;
    console.log(`  🎛️ Dashboard mappings: ${mappingCount}`);
    
    // Show details
    if (assignments.size > 0) {
      console.log('\n  📋 Assignment Details:');
      for (const assignmentDoc of assignments.docs) {
        const assignment = assignmentDoc.data();
        console.log(`    📁 ${assignment.projectId}: ${assignment.role} → ${assignment.dashboardRole} (Hierarchy: ${assignment.hierarchyLevel})`);
      }
    }
    
    console.log('\n  ✅ Migration verification complete');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

migrateExistingAssignments();

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function migrateExistingAssignments() {
  console.log('🔄 Migrating existing project assignments to unified system...\n');
  
  const userId = 'g8dkre0woUWYDvj6jeARh1ekeBa2';
  const userEmail = 'enterprise.user@example.com';
  
  try {
    // Step 1: Get detailed data from existing collections
    const existingData = await gatherExistingData(userId, userEmail);
    
    // Step 2: Create unified project assignments
    await createUnifiedAssignments(userId, existingData);
    
    // Step 3: Update user's dashboard role mappings
    await updateUserDashboardMappings(userId, existingData);
    
    // Step 4: Verify the migration
    await verifyMigration(userId);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function gatherExistingData(userId, userEmail) {
  console.log('📊 Gathering existing assignment data...');
  
  const existingData = {
    teamMembers: [],
    orgMembers: [],
    org_members: [],
    projects: new Set(),
    roles: new Set()
  };
  
  try {
    // Get teamMembers data
    const teamMembersQuery = await db.collection('teamMembers')
      .where('email', '==', userEmail)
      .get();
    
    for (const doc of teamMembersQuery.docs) {
      const data = doc.data();
      existingData.teamMembers.push({ id: doc.id, ...data });
      if (data.projectId) existingData.projects.add(data.projectId);
      if (data.role) existingData.roles.add(data.role);
      console.log(`  📋 TeamMember: ${doc.id} - Project: ${data.projectId || 'N/A'} - Role: ${data.role || 'N/A'}`);
    }
    
    // Get orgMembers data
    const orgMembersQuery = await db.collection('orgMembers')
      .where('userId', '==', userId)
      .get();
    
    for (const doc of orgMembersQuery.docs) {
      const data = doc.data();
      existingData.orgMembers.push({ id: doc.id, ...data });
      if (data.projectId) existingData.projects.add(data.projectId);
      if (data.role) existingData.roles.add(data.role);
      console.log(`  📋 OrgMember: ${doc.id} - Project: ${data.projectId || 'N/A'} - Role: ${data.role || 'N/A'}`);
    }
    
    // Get org_members data
    const org_membersQuery = await db.collection('org_members')
      .where('userId', '==', userId)
      .get();
    
    for (const doc of org_membersQuery.docs) {
      const data = doc.data();
      existingData.org_members.push({ id: doc.id, ...data });
      if (data.projectId) existingData.projects.add(data.projectId);
      if (data.role) existingData.roles.add(data.role);
      console.log(`  📋 Org_Member: ${doc.id} - Project: ${data.projectId || 'N/A'} - Role: ${data.role || 'N/A'}`);
    }
    
    // If no specific projects found, get all projects for the organization
    if (existingData.projects.size === 0) {
      console.log('  🔍 No specific projects found, getting all org projects...');
      
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData.organizationId) {
        const orgProjectsQuery = await db.collection('projects')
          .where('organizationId', '==', userData.organizationId)
          .get();
        
        for (const projectDoc of orgProjectsQuery.docs) {
          existingData.projects.add(projectDoc.id);
          console.log(`  📁 Org Project: ${projectDoc.id} - ${projectDoc.data().name || 'Unnamed'}`);
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  📁 Projects found: ${existingData.projects.size}`);
    console.log(`  🎭 Roles found: ${Array.from(existingData.roles).join(', ')}`);
    console.log(`  📋 TeamMembers: ${existingData.teamMembers.length}`);
    console.log(`  👥 OrgMembers: ${existingData.orgMembers.length}`);
    console.log(`  🏢 Org_Members: ${existingData.org_members.length}`);
    
    return existingData;
    
  } catch (error) {
    console.error('❌ Error gathering existing data:', error);
    return existingData;
  }
}

async function createUnifiedAssignments(userId, existingData) {
  console.log('\n🔧 Creating unified project assignments...');
  
  if (existingData.projects.size === 0) {
    console.log('  ⚠️ No projects to create assignments for');
    return;
  }
  
  const batch = db.batch();
  let assignmentsCreated = 0;
  
  // Determine the user's role (OWNER becomes ADMIN in our system)
  const userRole = existingData.roles.has('OWNER') || existingData.roles.has('owner') ? 'ADMIN' : 'MANAGER';
  
  for (const projectId of existingData.projects) {
    // Check if assignment already exists
    const existingAssignment = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .where('projectId', '==', projectId)
      .get();
    
    if (existingAssignment.empty) {
      const assignmentRef = db.collection('projectAssignments').doc();
      
      const assignmentData = {
        id: assignmentRef.id,
        projectId,
        userId,
        role: userRole,
        assignedBy: 'system-migration',
        assignedAt: admin.firestore.Timestamp.now(),
        isActive: true,
        
        // Enhanced unified system fields
        dashboardRole: userRole,
        hierarchyLevel: userRole === 'ADMIN' ? 100 : 80,
        enhancedPermissions: {
          canManageTeam: true,
          canManageProjects: true,
          canViewFinancials: userRole === 'ADMIN',
          canEditContent: true,
          canApproveContent: true,
          canAccessReports: true,
          canManageSettings: userRole === 'ADMIN',
          hierarchyLevel: userRole === 'ADMIN' ? 100 : 80
        },
        syncMetadata: {
          lastSyncedAt: admin.firestore.Timestamp.now(),
          syncSource: 'existing-data-migration',
          syncVersion: '2.0',
          migratedFrom: {
            teamMembers: existingData.teamMembers.length > 0,
            orgMembers: existingData.orgMembers.length > 0,
            org_members: existingData.org_members.length > 0
          }
        }
      };
      
      batch.set(assignmentRef, assignmentData);
      assignmentsCreated++;
      console.log(`  ✅ Creating ${userRole} assignment for project ${projectId}`);
    } else {
      console.log(`  ✅ Assignment already exists for project ${projectId}`);
    }
  }
  
  if (assignmentsCreated > 0) {
    await batch.commit();
    console.log(`  🎉 Created ${assignmentsCreated} new unified assignments`);
  } else {
    console.log(`  ✅ All assignments already exist`);
  }
}

async function updateUserDashboardMappings(userId, existingData) {
  console.log('\n🎛️ Updating user dashboard role mappings...');
  
  if (existingData.projects.size === 0) {
    console.log('  ⚠️ No projects to create mappings for');
    return;
  }
  
  const userRole = existingData.roles.has('OWNER') || existingData.roles.has('owner') ? 'ADMIN' : 'MANAGER';
  const dashboardMappings = {};
  
  for (const projectId of existingData.projects) {
    dashboardMappings[projectId] = {
      dashboardRole: userRole,
      hierarchy: userRole === 'ADMIN' ? 100 : 80,
      permissions: {
        canManageTeam: true,
        canManageProjects: true,
        canViewFinancials: userRole === 'ADMIN',
        canEditContent: true,
        canApproveContent: true,
        canAccessReports: true,
        canManageSettings: userRole === 'ADMIN',
        hierarchyLevel: userRole === 'ADMIN' ? 100 : 80
      },
      licensingRole: 'ENTERPRISE_USER',
      templateRole: userRole === 'ADMIN' ? 'enterprise-admin-template' : 'enterprise-manager-template',
      syncedAt: admin.firestore.Timestamp.now(),
      syncSource: 'existing-data-migration',
      migratedFrom: 'legacy-collections'
    };
  }
  
  await db.collection('users').doc(userId).update({
    dashboardRoleMappings: dashboardMappings,
    lastRoleSync: admin.firestore.Timestamp.now(),
    roleSystemVersion: '2.0'
  });
  
  console.log(`  ✅ Updated dashboard mappings for ${Object.keys(dashboardMappings).length} projects`);
  
  // Log migration event
  await db.collection('roleSyncEvents').add({
    type: 'LEGACY_DATA_MIGRATION',
    userId,
    sourceApp: 'licensing-website',
    targetApp: 'dashboard',
    timestamp: admin.firestore.Timestamp.now(),
    details: {
      projectsMigrated: existingData.projects.size,
      role: userRole,
      sourceCollections: ['teamMembers', 'orgMembers', 'org_members'],
      migratedMappings: Object.keys(dashboardMappings).length
    }
  });
}

async function verifyMigration(userId) {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Check project assignments
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`  📊 Project assignments: ${assignments.size}`);
    
    // Check user dashboard mappings
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    const mappingCount = userData.dashboardRoleMappings ? Object.keys(userData.dashboardRoleMappings).length : 0;
    console.log(`  🎛️ Dashboard mappings: ${mappingCount}`);
    
    // Show details
    if (assignments.size > 0) {
      console.log('\n  📋 Assignment Details:');
      for (const assignmentDoc of assignments.docs) {
        const assignment = assignmentDoc.data();
        console.log(`    📁 ${assignment.projectId}: ${assignment.role} → ${assignment.dashboardRole} (Hierarchy: ${assignment.hierarchyLevel})`);
      }
    }
    
    console.log('\n  ✅ Migration verification complete');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

migrateExistingAssignments();
