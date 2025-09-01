#!/usr/bin/env node

/**
 * Populate test data for Dashboard role mappings
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function populateTestData() {
  console.log('📊 [TestData] Populating test Dashboard role mappings...');
  
  try {
    // Get some users and projects to create test mappings
    const usersSnapshot = await db.collection('users').limit(3).get();
    const projectsSnapshot = await db.collection('projects').limit(2).get();
    
    if (usersSnapshot.empty || projectsSnapshot.empty) {
      console.log('⚠️ [TestData] No users or projects found to create test mappings');
      return;
    }
    
    const batch = db.batch();
    let updateCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Create test Dashboard role mappings for each project
      const dashboardRoleMappings = {};
      
      for (const projectDoc of projectsSnapshot.docs) {
        const projectId = projectDoc.id;
        
        dashboardRoleMappings[projectId] = {
          dashboardRole: 'PRODUCER',
          hierarchy: 60,
          permissions: {
            canManageTeam: false,
            canManageProjects: true,
            canViewFinancials: false,
            canEditContent: true,
            canApproveContent: true,
            canAccessReports: true,
            canManageSettings: false,
            hierarchyLevel: 60
          },
          licensingRole: 'DO_ER',
          templateRole: 'video-producer-template',
          syncedAt: admin.firestore.Timestamp.now(),
          syncSource: 'test'
        };
      }
      
      // Update user document
      batch.update(userDoc.ref, {
        dashboardRoleMappings,
        roleSystemVersion: '2.0',
        lastRoleSync: admin.firestore.Timestamp.now()
      });
      
      updateCount++;
    }
    
    await batch.commit();
    console.log(`✅ [TestData] Created test Dashboard role mappings for ${updateCount} users`);
    
  } catch (error) {
    console.error('❌ [TestData] Error populating test data:', error);
  }
}

if (require.main === module) {
  populateTestData()
    .then(() => {
      console.log('🎉 [TestData] Test data population completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [TestData] Failed to populate test data:', error);
      process.exit(1);
    });
}

/**
 * Populate test data for Dashboard role mappings
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function populateTestData() {
  console.log('📊 [TestData] Populating test Dashboard role mappings...');
  
  try {
    // Get some users and projects to create test mappings
    const usersSnapshot = await db.collection('users').limit(3).get();
    const projectsSnapshot = await db.collection('projects').limit(2).get();
    
    if (usersSnapshot.empty || projectsSnapshot.empty) {
      console.log('⚠️ [TestData] No users or projects found to create test mappings');
      return;
    }
    
    const batch = db.batch();
    let updateCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Create test Dashboard role mappings for each project
      const dashboardRoleMappings = {};
      
      for (const projectDoc of projectsSnapshot.docs) {
        const projectId = projectDoc.id;
        
        dashboardRoleMappings[projectId] = {
          dashboardRole: 'PRODUCER',
          hierarchy: 60,
          permissions: {
            canManageTeam: false,
            canManageProjects: true,
            canViewFinancials: false,
            canEditContent: true,
            canApproveContent: true,
            canAccessReports: true,
            canManageSettings: false,
            hierarchyLevel: 60
          },
          licensingRole: 'DO_ER',
          templateRole: 'video-producer-template',
          syncedAt: admin.firestore.Timestamp.now(),
          syncSource: 'test'
        };
      }
      
      // Update user document
      batch.update(userDoc.ref, {
        dashboardRoleMappings,
        roleSystemVersion: '2.0',
        lastRoleSync: admin.firestore.Timestamp.now()
      });
      
      updateCount++;
    }
    
    await batch.commit();
    console.log(`✅ [TestData] Created test Dashboard role mappings for ${updateCount} users`);
    
  } catch (error) {
    console.error('❌ [TestData] Error populating test data:', error);
  }
}

if (require.main === module) {
  populateTestData()
    .then(() => {
      console.log('🎉 [TestData] Test data population completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [TestData] Failed to populate test data:', error);
      process.exit(1);
    });
}
