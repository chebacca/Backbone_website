#!/usr/bin/env node

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkEnterpriseUser() {
  console.log('🔍 Checking enterprise.user data...\n');
  
  try {
    // Find enterprise user
    const userQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .get();
    
    if (userQuery.empty) {
      console.log('❌ Enterprise user not found by email, trying by role...');
      
      const roleQuery = await db.collection('users')
        .where('role', '==', 'ENTERPRISE_USER')
        .get();
      
      if (roleQuery.empty) {
        console.log('❌ No enterprise users found');
        return;
      }
      
      // Use first enterprise user found
      const userDoc = roleQuery.docs[0];
      await analyzeUser(userDoc.id, userDoc.data());
    } else {
      const userDoc = userQuery.docs[0];
      await analyzeUser(userDoc.id, userDoc.data());
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function analyzeUser(userId, userData) {
  console.log(`👤 Enterprise User: ${userId}`);
  console.log(`📧 Email: ${userData.email}`);
  console.log(`🎭 Role: ${userData.role}`);
  console.log(`🏢 Organization: ${userData.organizationId}`);
  
  // Check unified system fields
  console.log('\n🔧 Unified System Status:');
  console.log(`📊 Dashboard Mappings: ${userData.dashboardRoleMappings ? 'YES' : 'NO'}`);
  console.log(`🔄 Last Sync: ${userData.lastRoleSync ? userData.lastRoleSync.toDate() : 'NEVER'}`);
  console.log(`📋 System Version: ${userData.roleSystemVersion || 'NOT SET'}`);
  
  if (userData.dashboardRoleMappings) {
    console.log(`📈 Project Mappings: ${Object.keys(userData.dashboardRoleMappings).length}`);
  }
  
  // Check project assignments
  const assignments = await db.collection('projectAssignments')
    .where('userId', '==', userId)
    .get();
  
  console.log(`\n🎯 Project Assignments: ${assignments.size}`);
  
  // Check if updates are needed
  const needsUpdate = !userData.dashboardRoleMappings || 
                     !userData.roleSystemVersion || 
                     !userData.lastRoleSync;
  
  if (needsUpdate) {
    console.log('\n⚠️ User needs updates for unified role system');
    await updateUser(userId, userData);
  } else {
    console.log('\n✅ User is properly configured');
  }
}

async function updateUser(userId, userData) {
  console.log('🔧 Updating enterprise user...');
  
  const updates = {};
  
  if (!userData.roleSystemVersion) {
    updates.roleSystemVersion = '2.0';
  }
  
  if (!userData.lastRoleSync) {
    updates.lastRoleSync = admin.firestore.Timestamp.now();
  }
  
  if (!userData.dashboardRoleMappings) {
    // Get user's projects
    const projects = await db.collection('projects')
      .where('organizationId', '==', userData.organizationId)
      .limit(3)
      .get();
    
    const mappings = {};
    projects.docs.forEach(projectDoc => {
      mappings[projectDoc.id] = {
        dashboardRole: 'MANAGER',
        hierarchy: 80,
        permissions: {
          canManageTeam: true,
          canManageProjects: true,
          canViewFinancials: true,
          canEditContent: true,
          canApproveContent: true,
          canAccessReports: true,
          canManageSettings: false,
          hierarchyLevel: 80
        },
        licensingRole: userData.role,
        syncedAt: admin.firestore.Timestamp.now(),
        syncSource: 'system-update'
      };
    });
    
    updates.dashboardRoleMappings = mappings;
    console.log(`📊 Created mappings for ${projects.size} projects`);
  }
  
  if (Object.keys(updates).length > 0) {
    await db.collection('users').doc(userId).update(updates);
    console.log('✅ User updated successfully');
  }
}

checkEnterpriseUser();

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function checkEnterpriseUser() {
  console.log('🔍 Checking enterprise.user data...\n');
  
  try {
    // Find enterprise user
    const userQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .get();
    
    if (userQuery.empty) {
      console.log('❌ Enterprise user not found by email, trying by role...');
      
      const roleQuery = await db.collection('users')
        .where('role', '==', 'ENTERPRISE_USER')
        .get();
      
      if (roleQuery.empty) {
        console.log('❌ No enterprise users found');
        return;
      }
      
      // Use first enterprise user found
      const userDoc = roleQuery.docs[0];
      await analyzeUser(userDoc.id, userDoc.data());
    } else {
      const userDoc = userQuery.docs[0];
      await analyzeUser(userDoc.id, userDoc.data());
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function analyzeUser(userId, userData) {
  console.log(`👤 Enterprise User: ${userId}`);
  console.log(`📧 Email: ${userData.email}`);
  console.log(`🎭 Role: ${userData.role}`);
  console.log(`🏢 Organization: ${userData.organizationId}`);
  
  // Check unified system fields
  console.log('\n🔧 Unified System Status:');
  console.log(`📊 Dashboard Mappings: ${userData.dashboardRoleMappings ? 'YES' : 'NO'}`);
  console.log(`🔄 Last Sync: ${userData.lastRoleSync ? userData.lastRoleSync.toDate() : 'NEVER'}`);
  console.log(`📋 System Version: ${userData.roleSystemVersion || 'NOT SET'}`);
  
  if (userData.dashboardRoleMappings) {
    console.log(`📈 Project Mappings: ${Object.keys(userData.dashboardRoleMappings).length}`);
  }
  
  // Check project assignments
  const assignments = await db.collection('projectAssignments')
    .where('userId', '==', userId)
    .get();
  
  console.log(`\n🎯 Project Assignments: ${assignments.size}`);
  
  // Check if updates are needed
  const needsUpdate = !userData.dashboardRoleMappings || 
                     !userData.roleSystemVersion || 
                     !userData.lastRoleSync;
  
  if (needsUpdate) {
    console.log('\n⚠️ User needs updates for unified role system');
    await updateUser(userId, userData);
  } else {
    console.log('\n✅ User is properly configured');
  }
}

async function updateUser(userId, userData) {
  console.log('🔧 Updating enterprise user...');
  
  const updates = {};
  
  if (!userData.roleSystemVersion) {
    updates.roleSystemVersion = '2.0';
  }
  
  if (!userData.lastRoleSync) {
    updates.lastRoleSync = admin.firestore.Timestamp.now();
  }
  
  if (!userData.dashboardRoleMappings) {
    // Get user's projects
    const projects = await db.collection('projects')
      .where('organizationId', '==', userData.organizationId)
      .limit(3)
      .get();
    
    const mappings = {};
    projects.docs.forEach(projectDoc => {
      mappings[projectDoc.id] = {
        dashboardRole: 'MANAGER',
        hierarchy: 80,
        permissions: {
          canManageTeam: true,
          canManageProjects: true,
          canViewFinancials: true,
          canEditContent: true,
          canApproveContent: true,
          canAccessReports: true,
          canManageSettings: false,
          hierarchyLevel: 80
        },
        licensingRole: userData.role,
        syncedAt: admin.firestore.Timestamp.now(),
        syncSource: 'system-update'
      };
    });
    
    updates.dashboardRoleMappings = mappings;
    console.log(`📊 Created mappings for ${projects.size} projects`);
  }
  
  if (Object.keys(updates).length > 0) {
    await db.collection('users').doc(userId).update(updates);
    console.log('✅ User updated successfully');
  }
}

checkEnterpriseUser();
