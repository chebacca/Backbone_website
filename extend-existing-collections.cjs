#!/usr/bin/env node

/**
 * ============================================================================
 * EXTEND EXISTING COLLECTIONS FOR UNIFIED ROLE SYSTEM
 * ============================================================================
 * 
 * This script extends the existing Firestore collections to support the
 * unified role system without creating chaos or duplicate data.
 * 
 * Strategy: Add Dashboard-compatible fields to existing collections
 * instead of creating new collections that could conflict.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

/**
 * Extend existing collections with Dashboard-compatible fields
 */
async function extendExistingCollections() {
  console.log('🚀 [CollectionExtender] Starting collection extension for unified role system...');

  try {
    // 1. Extend users collection with Dashboard role mappings
    await extendUsersCollection();
    
    // 2. Extend projectAssignments with Dashboard role data
    await extendProjectAssignmentsCollection();
    
    // 3. Create role mapping metadata collection
    await createRoleMappingCollection();
    
    // 4. Create sync events collection for cross-app communication
    await createSyncEventsCollection();
    
    console.log('✅ [CollectionExtender] All collections extended successfully!');
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error extending collections:', error);
    process.exit(1);
  }
}

/**
 * Extend users collection with Dashboard role mappings
 */
async function extendUsersCollection() {
  console.log('📄 [CollectionExtender] Extending users collection...');
  
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    let updateCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Add Dashboard role mapping fields if they don't exist
      const updates = {};
      let needsUpdate = false;
      
      // Add dashboardRoleMappings field for cross-app role sync
      if (!userData.dashboardRoleMappings) {
        updates.dashboardRoleMappings = {};
        needsUpdate = true;
      }
      
      // Add unified role system metadata
      if (!userData.roleSystemVersion) {
        updates.roleSystemVersion = '2.0'; // Unified system version
        updates.lastRoleSync = admin.firestore.Timestamp.now();
        needsUpdate = true;
      }
      
      // Add hierarchy level based on current role
      if (!userData.hierarchyLevel) {
        updates.hierarchyLevel = getHierarchyForRole(userData.role);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.update(userDoc.ref, updates);
        updateCount++;
      }
    }
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ [CollectionExtender] Updated ${updateCount} user documents`);
    } else {
      console.log('ℹ️ [CollectionExtender] All user documents already up to date');
    }
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error extending users collection:', error);
    throw error;
  }
}

/**
 * Extend projectAssignments collection with Dashboard role data
 */
async function extendProjectAssignmentsCollection() {
  console.log('📋 [CollectionExtender] Extending projectAssignments collection...');
  
  try {
    // Get all project assignments
    const assignmentsSnapshot = await db.collection('projectAssignments').get();
    const batch = db.batch();
    let updateCount = 0;
    
    for (const assignmentDoc of assignmentsSnapshot.docs) {
      const assignmentData = assignmentDoc.data();
      
      // Add Dashboard role mapping fields if they don't exist
      const updates = {};
      let needsUpdate = false;
      
      // Map licensing role to Dashboard role
      if (!assignmentData.dashboardRole) {
        updates.dashboardRole = mapLicensingRoleToDashboard(assignmentData.role);
        needsUpdate = true;
      }
      
      // Add hierarchy level
      if (!assignmentData.hierarchyLevel) {
        updates.hierarchyLevel = getHierarchyForRole(assignmentData.role);
        needsUpdate = true;
      }
      
      // Add enhanced permissions
      if (!assignmentData.enhancedPermissions) {
        updates.enhancedPermissions = generatePermissions(assignmentData.role, updates.hierarchyLevel || getHierarchyForRole(assignmentData.role));
        needsUpdate = true;
      }
      
      // Add sync metadata
      if (!assignmentData.syncMetadata) {
        updates.syncMetadata = {
          lastSyncedAt: admin.firestore.Timestamp.now(),
          syncSource: 'licensing',
          syncVersion: '2.0'
        };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.update(assignmentDoc.ref, updates);
        updateCount++;
      }
    }
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ [CollectionExtender] Updated ${updateCount} project assignment documents`);
    } else {
      console.log('ℹ️ [CollectionExtender] All project assignment documents already up to date');
    }
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error extending projectAssignments collection:', error);
    throw error;
  }
}

/**
 * Create role mapping metadata collection
 */
async function createRoleMappingCollection() {
  console.log('🎭 [CollectionExtender] Creating role mapping metadata collection...');
  
  try {
    const roleMappingsRef = db.collection('roleMappings');
    
    // Create comprehensive role mapping document
    const roleMappingData = {
      version: '2.0',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      
      // Licensing to Dashboard role mappings
      licensingToDashboard: {
        'ADMIN': 'ADMIN',
        'MANAGER': 'MANAGER', 
        'DO_ER': 'PRODUCER',
        'VIEWER': 'GUEST'
      },
      
      // Hierarchy mappings
      hierarchyLevels: {
        'ADMIN': 100,
        'MANAGER': 80,
        'DO_ER': 60,
        'VIEWER': 10
      },
      
      // Template role mappings (extensible)
      templateMappings: {
        // Will be populated by the EnhancedRoleBridgeService
      },
      
      // Tier restrictions
      tierRestrictions: {
        'BASIC': { maxHierarchy: 40 },
        'PRO': { maxHierarchy: 80 },
        'ENTERPRISE': { maxHierarchy: 100 }
      }
    };
    
    await roleMappingsRef.doc('unified-system').set(roleMappingData);
    console.log('✅ [CollectionExtender] Role mapping metadata created');
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error creating role mapping collection:', error);
    throw error;
  }
}

/**
 * Create sync events collection for cross-app communication
 */
async function createSyncEventsCollection() {
  console.log('🔄 [CollectionExtender] Creating sync events collection...');
  
  try {
    const syncEventsRef = db.collection('roleSyncEvents');
    
    // Create initial sync event document (placeholder)
    const initialSyncEvent = {
      type: 'SYSTEM_INITIALIZED',
      sourceApp: 'licensing',
      targetApp: 'dashboard',
      timestamp: admin.firestore.Timestamp.now(),
      userId: 'system',
      projectId: 'system',
      organizationId: 'system',
      data: {
        message: 'Unified role system initialized',
        version: '2.0'
      },
      status: 'completed'
    };
    
    await syncEventsRef.add(initialSyncEvent);
    console.log('✅ [CollectionExtender] Sync events collection created');
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error creating sync events collection:', error);
    throw error;
  }
}

/**
 * Map licensing role to Dashboard role
 */
function mapLicensingRoleToDashboard(licensingRole) {
  const mappings = {
    'ADMIN': 'ADMIN',
    'MANAGER': 'MANAGER',
    'DO_ER': 'PRODUCER',
    'VIEWER': 'GUEST'
  };
  
  return mappings[licensingRole] || 'GUEST';
}

/**
 * Get hierarchy level for role
 */
function getHierarchyForRole(role) {
  const hierarchies = {
    'ADMIN': 100,
    'MANAGER': 80,
    'DO_ER': 60,
    'VIEWER': 10,
    // Dashboard roles
    'PRODUCER': 60,
    'GUEST': 10
  };
  
  return hierarchies[role] || 10;
}

/**
 * Generate permissions based on role and hierarchy
 */
function generatePermissions(role, hierarchy) {
  return {
    canManageTeam: hierarchy >= 80,
    canManageProjects: hierarchy >= 60,
    canViewFinancials: hierarchy >= 70,
    canEditContent: hierarchy >= 25,
    canApproveContent: hierarchy >= 40,
    canAccessReports: hierarchy >= 30,
    canManageSettings: hierarchy >= 90,
    hierarchyLevel: hierarchy
  };
}

/**
 * Main execution
 */
if (require.main === module) {
  extendExistingCollections()
    .then(() => {
      console.log('🎉 [CollectionExtender] Collection extension completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [CollectionExtender] Collection extension failed:', error);
      process.exit(1);
    });
}

module.exports = {
  extendExistingCollections,
  mapLicensingRoleToDashboard,
  getHierarchyForRole,
  generatePermissions
};

/**
 * ============================================================================
 * EXTEND EXISTING COLLECTIONS FOR UNIFIED ROLE SYSTEM
 * ============================================================================
 * 
 * This script extends the existing Firestore collections to support the
 * unified role system without creating chaos or duplicate data.
 * 
 * Strategy: Add Dashboard-compatible fields to existing collections
 * instead of creating new collections that could conflict.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

/**
 * Extend existing collections with Dashboard-compatible fields
 */
async function extendExistingCollections() {
  console.log('🚀 [CollectionExtender] Starting collection extension for unified role system...');

  try {
    // 1. Extend users collection with Dashboard role mappings
    await extendUsersCollection();
    
    // 2. Extend projectAssignments with Dashboard role data
    await extendProjectAssignmentsCollection();
    
    // 3. Create role mapping metadata collection
    await createRoleMappingCollection();
    
    // 4. Create sync events collection for cross-app communication
    await createSyncEventsCollection();
    
    console.log('✅ [CollectionExtender] All collections extended successfully!');
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error extending collections:', error);
    process.exit(1);
  }
}

/**
 * Extend users collection with Dashboard role mappings
 */
async function extendUsersCollection() {
  console.log('📄 [CollectionExtender] Extending users collection...');
  
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    let updateCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Add Dashboard role mapping fields if they don't exist
      const updates = {};
      let needsUpdate = false;
      
      // Add dashboardRoleMappings field for cross-app role sync
      if (!userData.dashboardRoleMappings) {
        updates.dashboardRoleMappings = {};
        needsUpdate = true;
      }
      
      // Add unified role system metadata
      if (!userData.roleSystemVersion) {
        updates.roleSystemVersion = '2.0'; // Unified system version
        updates.lastRoleSync = admin.firestore.Timestamp.now();
        needsUpdate = true;
      }
      
      // Add hierarchy level based on current role
      if (!userData.hierarchyLevel) {
        updates.hierarchyLevel = getHierarchyForRole(userData.role);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.update(userDoc.ref, updates);
        updateCount++;
      }
    }
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ [CollectionExtender] Updated ${updateCount} user documents`);
    } else {
      console.log('ℹ️ [CollectionExtender] All user documents already up to date');
    }
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error extending users collection:', error);
    throw error;
  }
}

/**
 * Extend projectAssignments collection with Dashboard role data
 */
async function extendProjectAssignmentsCollection() {
  console.log('📋 [CollectionExtender] Extending projectAssignments collection...');
  
  try {
    // Get all project assignments
    const assignmentsSnapshot = await db.collection('projectAssignments').get();
    const batch = db.batch();
    let updateCount = 0;
    
    for (const assignmentDoc of assignmentsSnapshot.docs) {
      const assignmentData = assignmentDoc.data();
      
      // Add Dashboard role mapping fields if they don't exist
      const updates = {};
      let needsUpdate = false;
      
      // Map licensing role to Dashboard role
      if (!assignmentData.dashboardRole) {
        updates.dashboardRole = mapLicensingRoleToDashboard(assignmentData.role);
        needsUpdate = true;
      }
      
      // Add hierarchy level
      if (!assignmentData.hierarchyLevel) {
        updates.hierarchyLevel = getHierarchyForRole(assignmentData.role);
        needsUpdate = true;
      }
      
      // Add enhanced permissions
      if (!assignmentData.enhancedPermissions) {
        updates.enhancedPermissions = generatePermissions(assignmentData.role, updates.hierarchyLevel || getHierarchyForRole(assignmentData.role));
        needsUpdate = true;
      }
      
      // Add sync metadata
      if (!assignmentData.syncMetadata) {
        updates.syncMetadata = {
          lastSyncedAt: admin.firestore.Timestamp.now(),
          syncSource: 'licensing',
          syncVersion: '2.0'
        };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.update(assignmentDoc.ref, updates);
        updateCount++;
      }
    }
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ [CollectionExtender] Updated ${updateCount} project assignment documents`);
    } else {
      console.log('ℹ️ [CollectionExtender] All project assignment documents already up to date');
    }
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error extending projectAssignments collection:', error);
    throw error;
  }
}

/**
 * Create role mapping metadata collection
 */
async function createRoleMappingCollection() {
  console.log('🎭 [CollectionExtender] Creating role mapping metadata collection...');
  
  try {
    const roleMappingsRef = db.collection('roleMappings');
    
    // Create comprehensive role mapping document
    const roleMappingData = {
      version: '2.0',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      
      // Licensing to Dashboard role mappings
      licensingToDashboard: {
        'ADMIN': 'ADMIN',
        'MANAGER': 'MANAGER', 
        'DO_ER': 'PRODUCER',
        'VIEWER': 'GUEST'
      },
      
      // Hierarchy mappings
      hierarchyLevels: {
        'ADMIN': 100,
        'MANAGER': 80,
        'DO_ER': 60,
        'VIEWER': 10
      },
      
      // Template role mappings (extensible)
      templateMappings: {
        // Will be populated by the EnhancedRoleBridgeService
      },
      
      // Tier restrictions
      tierRestrictions: {
        'BASIC': { maxHierarchy: 40 },
        'PRO': { maxHierarchy: 80 },
        'ENTERPRISE': { maxHierarchy: 100 }
      }
    };
    
    await roleMappingsRef.doc('unified-system').set(roleMappingData);
    console.log('✅ [CollectionExtender] Role mapping metadata created');
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error creating role mapping collection:', error);
    throw error;
  }
}

/**
 * Create sync events collection for cross-app communication
 */
async function createSyncEventsCollection() {
  console.log('🔄 [CollectionExtender] Creating sync events collection...');
  
  try {
    const syncEventsRef = db.collection('roleSyncEvents');
    
    // Create initial sync event document (placeholder)
    const initialSyncEvent = {
      type: 'SYSTEM_INITIALIZED',
      sourceApp: 'licensing',
      targetApp: 'dashboard',
      timestamp: admin.firestore.Timestamp.now(),
      userId: 'system',
      projectId: 'system',
      organizationId: 'system',
      data: {
        message: 'Unified role system initialized',
        version: '2.0'
      },
      status: 'completed'
    };
    
    await syncEventsRef.add(initialSyncEvent);
    console.log('✅ [CollectionExtender] Sync events collection created');
    
  } catch (error) {
    console.error('❌ [CollectionExtender] Error creating sync events collection:', error);
    throw error;
  }
}

/**
 * Map licensing role to Dashboard role
 */
function mapLicensingRoleToDashboard(licensingRole) {
  const mappings = {
    'ADMIN': 'ADMIN',
    'MANAGER': 'MANAGER',
    'DO_ER': 'PRODUCER',
    'VIEWER': 'GUEST'
  };
  
  return mappings[licensingRole] || 'GUEST';
}

/**
 * Get hierarchy level for role
 */
function getHierarchyForRole(role) {
  const hierarchies = {
    'ADMIN': 100,
    'MANAGER': 80,
    'DO_ER': 60,
    'VIEWER': 10,
    // Dashboard roles
    'PRODUCER': 60,
    'GUEST': 10
  };
  
  return hierarchies[role] || 10;
}

/**
 * Generate permissions based on role and hierarchy
 */
function generatePermissions(role, hierarchy) {
  return {
    canManageTeam: hierarchy >= 80,
    canManageProjects: hierarchy >= 60,
    canViewFinancials: hierarchy >= 70,
    canEditContent: hierarchy >= 25,
    canApproveContent: hierarchy >= 40,
    canAccessReports: hierarchy >= 30,
    canManageSettings: hierarchy >= 90,
    hierarchyLevel: hierarchy
  };
}

/**
 * Main execution
 */
if (require.main === module) {
  extendExistingCollections()
    .then(() => {
      console.log('🎉 [CollectionExtender] Collection extension completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [CollectionExtender] Collection extension failed:', error);
      process.exit(1);
    });
}

module.exports = {
  extendExistingCollections,
  mapLicensingRoleToDashboard,
  getHierarchyForRole,
  generatePermissions
};
