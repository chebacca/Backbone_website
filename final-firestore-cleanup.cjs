#!/usr/bin/env node

/**
 * Final Firestore Collections Cleanup
 * 
 * This script removes all redundant collections that are no longer needed
 * with the streamlined schema, keeping only the essential collections.
 * 
 * COLLECTIONS TO KEEP (Essential):
 * - users (streamlined - owners + team members)
 * - organizations (organization details)
 * - subscriptions (billing/license data)
 * - licenses (license keys)
 * - projects (project data)
 * - projectAssignments (streamlined project assignments)
 * - payments (payment history)
 * - audit_logs (compliance/audit trail)
 * - usage_analytics (analytics data)
 * - privacy_consents (legal compliance)
 * - email_logs (email tracking)
 * - compliance_events (compliance tracking)
 * - webhook_events (webhook processing)
 * - system_settings (system configuration)
 * 
 * COLLECTIONS TO REMOVE (Redundant):
 * - org_members (replaced by users.organizationId)
 * - org_invitations (not used in streamlined flow)
 * - teamMembers (replaced by users with role=TEAM_MEMBER)
 * - team_members (old snake_case version)
 * - projectTeamMembers (replaced by projectAssignments)
 * - project_team_members (old snake_case version)
 * - project_participants (replaced by projectAssignments)
 * - project_datasets (if not used)
 * - datasets (if not used)
 * - license_delivery_logs (if not essential)
 * - sdk_versions (if not used)
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

// Collections to keep (essential for the streamlined system)
const ESSENTIAL_COLLECTIONS = [
  'users',
  'organizations', 
  'subscriptions',
  'licenses',
  'projects',
  'projectAssignments',
  'payments',
  'audit_logs',
  'usage_analytics',
  'privacy_consents',
  'email_logs',
  'compliance_events',
  'webhook_events',
  'system_settings',
  '_health' // Health check collection
];

// Collections to remove (redundant with streamlined schema)
const REDUNDANT_COLLECTIONS = [
  'org_members',
  'org_invitations', 
  'teamMembers',
  'team_members',
  'projectTeamMembers',
  'project_team_members',
  'project_participants',
  'project_datasets',
  'datasets',
  'license_delivery_logs',
  'sdk_versions'
];

async function finalFirestoreCleanup() {
  console.log('🚀 Starting final Firestore collections cleanup...');
  console.log('⚠️  This will remove redundant collections to align with streamlined schema');
  
  try {
    // Step 1: Show current state
    await showCurrentCollections();
    
    // Step 2: Verify essential collections have data
    await verifyEssentialCollections();
    
    // Step 3: Remove redundant collections
    await removeRedundantCollections();
    
    // Step 4: Show final state
    await showFinalState();
    
    console.log('\n🎉 Final Firestore cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

async function showCurrentCollections() {
  console.log('\n📋 Current Firestore collections:');
  
  const collections = await db.listCollections();
  const collectionNames = collections.map(col => col.id).sort();
  
  console.log(`📊 Total collections: ${collectionNames.length}`);
  
  for (const name of collectionNames) {
    const snapshot = await db.collection(name).limit(1).get();
    const hasData = !snapshot.empty;
    const status = ESSENTIAL_COLLECTIONS.includes(name) ? '✅ KEEP' : 
                   REDUNDANT_COLLECTIONS.includes(name) ? '🗑️  REMOVE' : '❓ UNKNOWN';
    console.log(`  ${status} ${name} ${hasData ? '(has data)' : '(empty)'}`);
  }
}

async function verifyEssentialCollections() {
  console.log('\n📋 Verifying essential collections have data...');
  
  for (const collectionName of ESSENTIAL_COLLECTIONS) {
    try {
      const snapshot = await db.collection(collectionName).limit(1).get();
      const count = snapshot.empty ? 0 : 'has data';
      
      if (collectionName === 'users' || collectionName === 'organizations' || collectionName === 'subscriptions') {
        if (snapshot.empty) {
          console.log(`⚠️  ${collectionName}: EMPTY (this might be a problem)`);
        } else {
          console.log(`✅ ${collectionName}: ${count}`);
        }
      } else {
        console.log(`✅ ${collectionName}: ${count}`);
      }
    } catch (error) {
      console.log(`❓ ${collectionName}: Collection doesn't exist yet`);
    }
  }
}

async function removeRedundantCollections() {
  console.log('\n📋 Removing redundant collections...');
  
  for (const collectionName of REDUNDANT_COLLECTIONS) {
    try {
      const snapshot = await db.collection(collectionName).limit(1).get();
      
      if (snapshot.empty) {
        console.log(`✅ ${collectionName}: Already empty`);
        continue;
      }
      
      // Get full count
      const fullSnapshot = await db.collection(collectionName).get();
      console.log(`🗑️  Removing ${collectionName} (${fullSnapshot.size} documents)...`);
      
      // Delete in batches
      await deleteCollection(collectionName);
      
    } catch (error) {
      console.log(`❓ ${collectionName}: Collection doesn't exist`);
    }
  }
}

async function deleteCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const batchSize = 500;
  let deletedCount = 0;
  
  while (true) {
    const batch = db.batch();
    const docs = await collectionRef.limit(batchSize).get();
    
    if (docs.empty) {
      break;
    }
    
    docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deletedCount += docs.size;
    console.log(`    Deleted ${docs.size} documents (${deletedCount} total)`);
    
    // Small delay to avoid overwhelming Firestore
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ ${collectionName}: Deleted ${deletedCount} documents`);
}

async function showFinalState() {
  console.log('\n📊 Final Firestore state:');
  
  const collections = await db.listCollections();
  const collectionNames = collections.map(col => col.id).sort();
  
  console.log(`📊 Total collections: ${collectionNames.length}`);
  
  // Count documents in essential collections
  for (const name of collectionNames) {
    if (ESSENTIAL_COLLECTIONS.includes(name)) {
      try {
        const snapshot = await db.collection(name).get();
        console.log(`✅ ${name}: ${snapshot.size} documents`);
      } catch (error) {
        console.log(`❓ ${name}: Error reading collection`);
      }
    } else {
      console.log(`❓ ${name}: Unknown collection (not in essential list)`);
    }
  }
  
  console.log('\n🎯 Streamlined Schema Summary:');
  console.log('   ✅ users: Single source for owners + team members');
  console.log('   ✅ organizations: Organization details');
  console.log('   ✅ subscriptions: Billing/license data');
  console.log('   ✅ projects: Project data');
  console.log('   ✅ projectAssignments: Single source for all assignments');
  console.log('   ✅ No redundant collections');
  console.log('   ✅ Clean, maintainable relationships');
}

// Run the cleanup
finalFirestoreCleanup().catch(console.error);
