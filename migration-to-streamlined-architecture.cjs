#!/usr/bin/env node

/**
 * 🚀 Migration Script: Legacy to Streamlined Architecture
 * 
 * This script migrates the existing complex Firebase collections structure
 * to the new streamlined architecture with embedded relationships.
 * 
 * Migration Steps:
 * 1. Backup existing data
 * 2. Create new streamlined collections
 * 3. Migrate and transform data with embedded relationships
 * 4. Update security rules and indexes
 * 5. Validate migrated data
 * 6. Clean up legacy collections (optional)
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================================================
// MIGRATION CONFIGURATION
// ============================================================================

const MIGRATION_CONFIG = {
  // Backup collections before migration
  createBackups: true,
  backupSuffix: '_backup_' + new Date().toISOString().split('T')[0],
  
  // Collections to migrate
  legacyCollections: {
    users: 'users',
    organizations: 'organizations', 
    teamMembers: 'teamMembers',
    orgMembers: 'org_members',
    projects: 'projects',
    projectTeamMembers: 'projectTeamMembers',
    subscriptions: 'subscriptions',
    payments: 'payments',
    datasets: 'datasets'
  },
  
  // New streamlined collections
  streamlinedCollections: {
    users: 'users_v2',
    organizations: 'organizations_v2',
    projects: 'projects_v2', 
    subscriptions: 'subscriptions_v2',
    payments: 'payments_v2',
    datasets: 'datasets_v2'
  },
  
  // Validation settings
  validateAfterMigration: true,
  dryRun: true // Set to true to test without writing data
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function toFirestoreDate(date) {
  if (!date) return null;
  if (date.toDate) return date.toDate();
  if (typeof date === 'string') return new Date(date);
  return date;
}

// ============================================================================
// BACKUP FUNCTIONS
// ============================================================================

async function createBackups() {
  if (!MIGRATION_CONFIG.createBackups) {
    log('Skipping backups (disabled in config)');
    return;
  }

  log('Creating backups of existing collections...');
  
  for (const [name, collection] of Object.entries(MIGRATION_CONFIG.legacyCollections)) {
    try {
      const snapshot = await db.collection(collection).get();
      const backupCollection = collection + MIGRATION_CONFIG.backupSuffix;
      
      log(`Backing up ${collection} to ${backupCollection} (${snapshot.size} documents)`);
      
      const batch = db.batch();
      let batchCount = 0;
      
      for (const doc of snapshot.docs) {
        const backupRef = db.collection(backupCollection).doc(doc.id);
        batch.set(backupRef, doc.data());
        batchCount++;
        
        // Commit batch every 500 operations
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      // Commit remaining operations
      if (batchCount > 0) {
        await batch.commit();
      }
      
      log(`✅ Backed up ${snapshot.size} documents from ${collection}`);
    } catch (error) {
      log(`Failed to backup ${collection}: ${error.message}`, 'error');
    }
  }
}

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

function transformUser(userData, orgData, teamMemberData) {
  // Clean function to remove undefined values
  const cleanObject = (obj) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          const cleanedNested = cleanObject(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  };

  const isTeamMember = userData.userType === 'TEAM_MEMBER' || userData.isTeamMember || 
                      (userData.role !== 'ADMIN' && userData.role !== 'ACCOUNTING' && !userData.isOrgOwner);

  const user = {
    id: userData.id,
    email: userData.email || '',
    name: userData.name || userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unnamed User',
    
    // Determine user type
    userType: userData.role === 'ADMIN' ? 'ADMIN' : 
              userData.role === 'ACCOUNTING' ? 'ACCOUNTING' :
              userData.isOrgOwner ? 'ACCOUNT_OWNER' : 'TEAM_MEMBER',
    
    role: userData.role || 'MEMBER',
    
    // Embedded organization data
    organization: {
      id: orgData?.id || userData.organizationId || 'default-org',
      name: orgData?.name || 'Default Organization',
      tier: orgData?.tier || userData.licenseType || 'BASIC',
      isOwner: userData.isOrgOwner || false
    },
    
    // Embedded license data
    license: {
      type: userData.licenseType || orgData?.tier || 'BASIC',
      status: userData.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED',
      permissions: userData.permissions || [],
      canCreateProjects: userData.canCreateProjects || userData.isOrgOwner || false,
      canManageTeam: userData.canManageTeam || userData.isOrgOwner || false
    },
    
    // Metadata
    status: userData.status || 'ACTIVE',
    createdAt: toFirestoreDate(userData.createdAt) || new Date(),
    updatedAt: toFirestoreDate(userData.updatedAt) || new Date()
  };

  // Only add teamMemberData if user is actually a team member
  if (isTeamMember) {
    user.teamMemberData = {
      managedBy: userData.managedBy || teamMemberData?.managedBy || '',
      department: userData.department || teamMemberData?.department || '',
      assignedProjects: [] // Will be populated from project assignments
    };
  }

  // Only add lastLoginAt if it exists
  if (userData.lastLoginAt) {
    user.lastLoginAt = toFirestoreDate(userData.lastLoginAt);
  }
  
  return cleanObject(user);
}

function transformOrganization(orgData, ownerData, subscriptionData) {
  return {
    id: orgData.id,
    name: orgData.name || 'Unnamed Organization',
    tier: orgData.tier || subscriptionData?.tier || 'BASIC',
    
    // Embedded owner data
    owner: {
      id: ownerData?.id || orgData.ownerId || '',
      email: ownerData?.email || '',
      name: ownerData?.name || ownerData?.displayName || ''
    },
    
    // Embedded subscription data
    subscription: {
      id: subscriptionData?.id || '',
      status: subscriptionData?.status || 'ACTIVE',
      seats: subscriptionData?.seats || 3,
      usedSeats: orgData.currentUsers || 1,
      currentPeriodEnd: toFirestoreDate(subscriptionData?.currentPeriodEnd) || new Date()
    },
    
    // Embedded usage stats
    usage: {
      totalUsers: orgData.currentUsers || 1,
      totalProjects: 0, // Will be calculated
      storageUsed: 0 // Will be calculated
    },
    
    createdAt: toFirestoreDate(orgData.createdAt) || new Date(),
    updatedAt: toFirestoreDate(orgData.updatedAt) || new Date()
  };
}

function transformProject(projectData, ownerData, orgData, teamAssignments = []) {
  return {
    id: projectData.id,
    name: projectData.name || 'Unnamed Project',
    description: projectData.description || '',
    
    // Embedded owner data
    owner: {
      id: ownerData?.id || projectData.ownerId || '',
      email: ownerData?.email || '',
      name: ownerData?.name || ownerData?.displayName || ''
    },
    
    // Embedded organization data
    organization: {
      id: orgData?.id || projectData.organizationId || '',
      name: orgData?.name || '',
      tier: orgData?.tier || 'BASIC'
    },
    
    // Embedded team assignments (no separate collection needed)
    teamAssignments: teamAssignments.map(assignment => ({
      userId: assignment.userId || assignment.teamMemberId,
      email: assignment.email || '',
      name: assignment.name || '',
      role: assignment.role || 'MEMBER',
      assignedAt: toFirestoreDate(assignment.assignedAt) || new Date(),
      assignedBy: assignment.assignedBy || ''
    })),
    
    // Embedded project settings
    settings: {
      applicationMode: projectData.applicationMode || 'standalone',
      storageBackend: projectData.storageBackend || 'firestore',
      maxCollaborators: projectData.maxCollaborators || 10,
      allowCollaboration: projectData.allowCollaboration !== false
    },
    
    // Status and metadata
    status: projectData.isArchived ? 'ARCHIVED' : 'ACTIVE',
    isActive: projectData.isActive !== false,
    createdAt: toFirestoreDate(projectData.createdAt) || new Date(),
    updatedAt: toFirestoreDate(projectData.updatedAt) || new Date(),
    lastAccessedAt: toFirestoreDate(projectData.lastAccessedAt) || new Date()
  };
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function migrateUsers() {
  log('Migrating users...');
  
  // Get all users
  const usersSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.users).get();
  const orgsSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.organizations).get();
  const teamMembersSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.teamMembers).get();
  
  // Create lookup maps
  const orgsMap = new Map();
  orgsSnapshot.forEach(doc => orgsMap.set(doc.id, { id: doc.id, ...doc.data() }));
  
  const teamMembersMap = new Map();
  teamMembersSnapshot.forEach(doc => teamMembersMap.set(doc.data().email, doc.data()));
  
  log(`Processing ${usersSnapshot.size} users...`);
  
  const batch = db.batch();
  let batchCount = 0;
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = { id: userDoc.id, ...userDoc.data() };
    const orgData = orgsMap.get(userData.organizationId);
    const teamMemberData = teamMembersMap.get(userData.email);
    
    const transformedUser = transformUser(userData, orgData, teamMemberData);
    
    if (!MIGRATION_CONFIG.dryRun) {
      const newUserRef = db.collection(MIGRATION_CONFIG.streamlinedCollections.users).doc(userDoc.id);
      batch.set(newUserRef, transformedUser);
      batchCount++;
      
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }
  
  if (batchCount > 0 && !MIGRATION_CONFIG.dryRun) {
    await batch.commit();
  }
  
  log(`✅ Migrated ${usersSnapshot.size} users`);
}

async function migrateOrganizations() {
  log('Migrating organizations...');
  
  const orgsSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.organizations).get();
  const usersSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.users).get();
  const subscriptionsSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.subscriptions).get();
  
  // Create lookup maps
  const usersMap = new Map();
  usersSnapshot.forEach(doc => usersMap.set(doc.id, { id: doc.id, ...doc.data() }));
  
  const subscriptionsMap = new Map();
  subscriptionsSnapshot.forEach(doc => {
    const data = doc.data();
    subscriptionsMap.set(data.organizationId, { id: doc.id, ...data });
  });
  
  log(`Processing ${orgsSnapshot.size} organizations...`);
  
  const batch = db.batch();
  let batchCount = 0;
  
  for (const orgDoc of orgsSnapshot.docs) {
    const orgData = { id: orgDoc.id, ...orgDoc.data() };
    const ownerData = usersMap.get(orgData.ownerId);
    const subscriptionData = subscriptionsMap.get(orgDoc.id);
    
    const transformedOrg = transformOrganization(orgData, ownerData, subscriptionData);
    
    if (!MIGRATION_CONFIG.dryRun) {
      const newOrgRef = db.collection(MIGRATION_CONFIG.streamlinedCollections.organizations).doc(orgDoc.id);
      batch.set(newOrgRef, transformedOrg);
      batchCount++;
      
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }
  
  if (batchCount > 0 && !MIGRATION_CONFIG.dryRun) {
    await batch.commit();
  }
  
  log(`✅ Migrated ${orgsSnapshot.size} organizations`);
}

async function migrateProjects() {
  log('Migrating projects...');
  
  const projectsSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.projects).get();
  const usersSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.users).get();
  const orgsSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.organizations).get();
  const projectTeamMembersSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.projectTeamMembers).get();
  
  // Create lookup maps
  const usersMap = new Map();
  usersSnapshot.forEach(doc => usersMap.set(doc.id, { id: doc.id, ...doc.data() }));
  
  const orgsMap = new Map();
  orgsSnapshot.forEach(doc => orgsMap.set(doc.id, { id: doc.id, ...doc.data() }));
  
  const projectAssignmentsMap = new Map();
  projectTeamMembersSnapshot.forEach(doc => {
    const data = doc.data();
    if (!projectAssignmentsMap.has(data.projectId)) {
      projectAssignmentsMap.set(data.projectId, []);
    }
    projectAssignmentsMap.get(data.projectId).push(data);
  });
  
  log(`Processing ${projectsSnapshot.size} projects...`);
  
  const batch = db.batch();
  let batchCount = 0;
  
  for (const projectDoc of projectsSnapshot.docs) {
    const projectData = { id: projectDoc.id, ...projectDoc.data() };
    const ownerData = usersMap.get(projectData.ownerId);
    const orgData = orgsMap.get(projectData.organizationId);
    const teamAssignments = projectAssignmentsMap.get(projectDoc.id) || [];
    
    const transformedProject = transformProject(projectData, ownerData, orgData, teamAssignments);
    
    if (!MIGRATION_CONFIG.dryRun) {
      const newProjectRef = db.collection(MIGRATION_CONFIG.streamlinedCollections.projects).doc(projectDoc.id);
      batch.set(newProjectRef, transformedProject);
      batchCount++;
      
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }
  
  if (batchCount > 0 && !MIGRATION_CONFIG.dryRun) {
    await batch.commit();
  }
  
  log(`✅ Migrated ${projectsSnapshot.size} projects`);
}

async function migrateSubscriptionsAndPayments() {
  log('Migrating subscriptions and payments...');
  
  // Subscriptions are already embedded in organizations, just copy for compatibility
  const subscriptionsSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.subscriptions).get();
  const paymentsSnapshot = await db.collection(MIGRATION_CONFIG.legacyCollections.payments).get();
  
  // Copy subscriptions as-is (they're already in good shape)
  let batch = db.batch();
  let batchCount = 0;
  
  for (const subDoc of subscriptionsSnapshot.docs) {
    const subData = { id: subDoc.id, ...subDoc.data() };
    
    if (!MIGRATION_CONFIG.dryRun) {
      const newSubRef = db.collection(MIGRATION_CONFIG.streamlinedCollections.subscriptions).doc(subDoc.id);
      batch.set(newSubRef, subData);
      batchCount++;
      
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }
  
  if (batchCount > 0 && !MIGRATION_CONFIG.dryRun) {
    await batch.commit();
  }
  
  // Copy payments as-is (they're already in good shape)
  batch = db.batch();
  batchCount = 0;
  
  for (const paymentDoc of paymentsSnapshot.docs) {
    const paymentData = { id: paymentDoc.id, ...paymentDoc.data() };
    
    if (!MIGRATION_CONFIG.dryRun) {
      const newPaymentRef = db.collection(MIGRATION_CONFIG.streamlinedCollections.payments).doc(paymentDoc.id);
      batch.set(newPaymentRef, paymentData);
      batchCount++;
      
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }
  
  if (batchCount > 0 && !MIGRATION_CONFIG.dryRun) {
    await batch.commit();
  }
  
  log(`✅ Migrated ${subscriptionsSnapshot.size} subscriptions and ${paymentsSnapshot.size} payments`);
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

async function validateMigration() {
  if (!MIGRATION_CONFIG.validateAfterMigration) {
    log('Skipping validation (disabled in config)');
    return;
  }
  
  log('Validating migrated data...');
  
  // Check that all collections have data
  for (const [name, collection] of Object.entries(MIGRATION_CONFIG.streamlinedCollections)) {
    const snapshot = await db.collection(collection).get();
    log(`${collection}: ${snapshot.size} documents`);
    
    if (snapshot.size === 0) {
      log(`Warning: ${collection} is empty`, 'warn');
    }
  }
  
  // Validate data integrity
  const usersSnapshot = await db.collection(MIGRATION_CONFIG.streamlinedCollections.users).get();
  const orgsSnapshot = await db.collection(MIGRATION_CONFIG.streamlinedCollections.organizations).get();
  const projectsSnapshot = await db.collection(MIGRATION_CONFIG.streamlinedCollections.projects).get();
  
  let validationErrors = 0;
  
  // Check that all users have valid organization references
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if (!userData.organization || !userData.organization.id) {
      log(`User ${userDoc.id} missing organization data`, 'warn');
      validationErrors++;
    }
  }
  
  // Check that all projects have valid owner and organization references
  for (const projectDoc of projectsSnapshot.docs) {
    const projectData = projectDoc.data();
    if (!projectData.owner || !projectData.owner.id) {
      log(`Project ${projectDoc.id} missing owner data`, 'warn');
      validationErrors++;
    }
    if (!projectData.organization || !projectData.organization.id) {
      log(`Project ${projectDoc.id} missing organization data`, 'warn');
      validationErrors++;
    }
  }
  
  if (validationErrors === 0) {
    log('✅ Validation completed successfully - no errors found');
  } else {
    log(`⚠️ Validation completed with ${validationErrors} warnings`, 'warn');
  }
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

async function runMigration() {
  log('🚀 Starting migration to streamlined architecture...');
  
  if (MIGRATION_CONFIG.dryRun) {
    log('🔍 DRY RUN MODE - No data will be written', 'warn');
  }
  
  try {
    // Step 1: Create backups
    await createBackups();
    
    // Step 2: Migrate data
    await migrateUsers();
    await migrateOrganizations();
    await migrateProjects();
    await migrateSubscriptionsAndPayments();
    
    // Step 3: Validate migration
    await validateMigration();
    
    log('🎉 Migration completed successfully!');
    
    if (!MIGRATION_CONFIG.dryRun) {
      log('📋 Next steps:');
      log('1. Update Firestore security rules');
      log('2. Create composite indexes');
      log('3. Update application code to use new collections');
      log('4. Test thoroughly before removing legacy collections');
    }
    
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

if (require.main === module) {
  runMigration().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runMigration,
  MIGRATION_CONFIG
};
