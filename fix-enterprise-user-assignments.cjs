#!/usr/bin/env node

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function fixEnterpriseUserAssignments() {
  console.log('🔧 Fixing enterprise.user project assignments...\n');
  
  try {
    // Get enterprise user
    const userQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .get();
    
    if (userQuery.empty) {
      console.log('❌ Enterprise user not found');
      return;
    }
    
    const userDoc = userQuery.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`👤 Found enterprise user: ${userId}`);
    console.log(`🏢 Organization: ${userData.organizationId}`);
    
    // Get projects for this organization
    const projectsQuery = await db.collection('projects')
      .where('organizationId', '==', userData.organizationId)
      .get();
    
    console.log(`📁 Found ${projectsQuery.size} projects in organization`);
    
    if (projectsQuery.empty) {
      console.log('⚠️ No projects found for this organization');
      return;
    }
    
    // Show current project assignments
    const currentAssignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`🎯 Current assignments: ${currentAssignments.size}`);
    
    // Create assignments for all projects
    const batch = db.batch();
    const dashboardMappings = {};
    let newAssignments = 0;
    
    for (const projectDoc of projectsQuery.docs) {
      const projectId = projectDoc.id;
      const projectData = projectDoc.data();
      
      console.log(`\n📁 Project: ${projectData.name || projectId}`);
      
      // Check if assignment already exists
      const existingAssignment = currentAssignments.docs.find(
        doc => doc.data().projectId === projectId
      );
      
      if (!existingAssignment) {
        // Create new assignment
        const assignmentRef = db.collection('projectAssignments').doc();
        const assignmentData = {
          id: assignmentRef.id,
          projectId,
          userId,
          role: 'ADMIN', // Enterprise user gets admin role
          assignedBy: 'system',
          assignedAt: admin.firestore.Timestamp.now(),
          isActive: true,
          
          // Enhanced unified system fields
          dashboardRole: 'ADMIN',
          hierarchyLevel: 100,
          enhancedPermissions: {
            canManageTeam: true,
            canManageProjects: true,
            canViewFinancials: true,
            canEditContent: true,
            canApproveContent: true,
            canAccessReports: true,
            canManageSettings: true,
            hierarchyLevel: 100
          },
          syncMetadata: {
            lastSyncedAt: admin.firestore.Timestamp.now(),
            syncSource: 'enterprise-user-fix',
            syncVersion: '2.0'
          }
        };
        
        batch.set(assignmentRef, assignmentData);
        newAssignments++;
        console.log(`  ✅ Creating ADMIN assignment`);
      } else {
        console.log(`  ✅ Assignment already exists`);
      }
      
      // Create dashboard mapping
      dashboardMappings[projectId] = {
        dashboardRole: 'ADMIN',
        hierarchy: 100,
        permissions: {
          canManageTeam: true,
          canManageProjects: true,
          canViewFinancials: true,
          canEditContent: true,
          canApproveContent: true,
          canAccessReports: true,
          canManageSettings: true,
          hierarchyLevel: 100
        },
        licensingRole: 'ENTERPRISE_USER',
        templateRole: 'enterprise-admin-template',
        syncedAt: admin.firestore.Timestamp.now(),
        syncSource: 'enterprise-user-fix'
      };
    }
    
    // Update user's dashboard role mappings
    await userDoc.ref.update({
      dashboardRoleMappings: dashboardMappings,
      lastRoleSync: admin.firestore.Timestamp.now()
    });
    
    console.log(`\n📊 Updated dashboard mappings for ${Object.keys(dashboardMappings).length} projects`);
    
    // Commit new assignments
    if (newAssignments > 0) {
      await batch.commit();
      console.log(`✅ Created ${newAssignments} new project assignments`);
    }
    
    // Log sync event
    await db.collection('roleSyncEvents').add({
      type: 'ENTERPRISE_USER_ASSIGNMENTS_FIXED',
      userId,
      sourceApp: 'licensing-website',
      targetApp: 'dashboard',
      timestamp: admin.firestore.Timestamp.now(),
      details: {
        projectsAssigned: Object.keys(dashboardMappings).length,
        newAssignments,
        role: 'ADMIN'
      }
    });
    
    console.log('\n🎉 Enterprise user assignments fixed successfully!');
    
    // Verify the fix
    await verifyFix(userId);
    
  } catch (error) {
    console.error('❌ Error fixing enterprise user assignments:', error);
  }
}

async function verifyFix(userId) {
  console.log('\n🔍 Verifying fix...');
  
  try {
    // Check updated user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    console.log(`📊 Dashboard mappings: ${Object.keys(userData.dashboardRoleMappings || {}).length}`);
    
    // Check project assignments
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`🎯 Project assignments: ${assignments.size}`);
    
    // Show details
    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      console.log(`  📁 ${assignment.projectId}: ${assignment.role} (Dashboard: ${assignment.dashboardRole})`);
    }
    
    console.log('✅ Verification complete');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

fixEnterpriseUserAssignments();

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function fixEnterpriseUserAssignments() {
  console.log('🔧 Fixing enterprise.user project assignments...\n');
  
  try {
    // Get enterprise user
    const userQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .get();
    
    if (userQuery.empty) {
      console.log('❌ Enterprise user not found');
      return;
    }
    
    const userDoc = userQuery.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`👤 Found enterprise user: ${userId}`);
    console.log(`🏢 Organization: ${userData.organizationId}`);
    
    // Get projects for this organization
    const projectsQuery = await db.collection('projects')
      .where('organizationId', '==', userData.organizationId)
      .get();
    
    console.log(`📁 Found ${projectsQuery.size} projects in organization`);
    
    if (projectsQuery.empty) {
      console.log('⚠️ No projects found for this organization');
      return;
    }
    
    // Show current project assignments
    const currentAssignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`🎯 Current assignments: ${currentAssignments.size}`);
    
    // Create assignments for all projects
    const batch = db.batch();
    const dashboardMappings = {};
    let newAssignments = 0;
    
    for (const projectDoc of projectsQuery.docs) {
      const projectId = projectDoc.id;
      const projectData = projectDoc.data();
      
      console.log(`\n📁 Project: ${projectData.name || projectId}`);
      
      // Check if assignment already exists
      const existingAssignment = currentAssignments.docs.find(
        doc => doc.data().projectId === projectId
      );
      
      if (!existingAssignment) {
        // Create new assignment
        const assignmentRef = db.collection('projectAssignments').doc();
        const assignmentData = {
          id: assignmentRef.id,
          projectId,
          userId,
          role: 'ADMIN', // Enterprise user gets admin role
          assignedBy: 'system',
          assignedAt: admin.firestore.Timestamp.now(),
          isActive: true,
          
          // Enhanced unified system fields
          dashboardRole: 'ADMIN',
          hierarchyLevel: 100,
          enhancedPermissions: {
            canManageTeam: true,
            canManageProjects: true,
            canViewFinancials: true,
            canEditContent: true,
            canApproveContent: true,
            canAccessReports: true,
            canManageSettings: true,
            hierarchyLevel: 100
          },
          syncMetadata: {
            lastSyncedAt: admin.firestore.Timestamp.now(),
            syncSource: 'enterprise-user-fix',
            syncVersion: '2.0'
          }
        };
        
        batch.set(assignmentRef, assignmentData);
        newAssignments++;
        console.log(`  ✅ Creating ADMIN assignment`);
      } else {
        console.log(`  ✅ Assignment already exists`);
      }
      
      // Create dashboard mapping
      dashboardMappings[projectId] = {
        dashboardRole: 'ADMIN',
        hierarchy: 100,
        permissions: {
          canManageTeam: true,
          canManageProjects: true,
          canViewFinancials: true,
          canEditContent: true,
          canApproveContent: true,
          canAccessReports: true,
          canManageSettings: true,
          hierarchyLevel: 100
        },
        licensingRole: 'ENTERPRISE_USER',
        templateRole: 'enterprise-admin-template',
        syncedAt: admin.firestore.Timestamp.now(),
        syncSource: 'enterprise-user-fix'
      };
    }
    
    // Update user's dashboard role mappings
    await userDoc.ref.update({
      dashboardRoleMappings: dashboardMappings,
      lastRoleSync: admin.firestore.Timestamp.now()
    });
    
    console.log(`\n📊 Updated dashboard mappings for ${Object.keys(dashboardMappings).length} projects`);
    
    // Commit new assignments
    if (newAssignments > 0) {
      await batch.commit();
      console.log(`✅ Created ${newAssignments} new project assignments`);
    }
    
    // Log sync event
    await db.collection('roleSyncEvents').add({
      type: 'ENTERPRISE_USER_ASSIGNMENTS_FIXED',
      userId,
      sourceApp: 'licensing-website',
      targetApp: 'dashboard',
      timestamp: admin.firestore.Timestamp.now(),
      details: {
        projectsAssigned: Object.keys(dashboardMappings).length,
        newAssignments,
        role: 'ADMIN'
      }
    });
    
    console.log('\n🎉 Enterprise user assignments fixed successfully!');
    
    // Verify the fix
    await verifyFix(userId);
    
  } catch (error) {
    console.error('❌ Error fixing enterprise user assignments:', error);
  }
}

async function verifyFix(userId) {
  console.log('\n🔍 Verifying fix...');
  
  try {
    // Check updated user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    console.log(`📊 Dashboard mappings: ${Object.keys(userData.dashboardRoleMappings || {}).length}`);
    
    // Check project assignments
    const assignments = await db.collection('projectAssignments')
      .where('userId', '==', userId)
      .get();
    
    console.log(`🎯 Project assignments: ${assignments.size}`);
    
    // Show details
    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      console.log(`  📁 ${assignment.projectId}: ${assignment.role} (Dashboard: ${assignment.dashboardRole})`);
    }
    
    console.log('✅ Verification complete');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

fixEnterpriseUserAssignments();
