#!/usr/bin/env node

/**
 * 🔥 Create Missing Firebase Indexes for Pages Components
 * 
 * This script analyzes existing Firebase indexes and only creates the missing ones
 * needed for all pages components to work without "requires an index" errors.
 * 
 * It avoids creating duplicate or redundant indexes by checking what already exists.
 */

import { execSync } from 'child_process';

// ============================================================================
// EXISTING INDEXES ANALYSIS (from firebase firestore:indexes output)
// ============================================================================

const EXISTING_INDEXES = [
  // Users collection
  { collection: 'users', fields: ['organizationId', 'createdAt'] },
  { collection: 'users', fields: ['organizationId', 'role'] },
  { collection: 'users', fields: ['organizationId', 'status'] },
  { collection: 'users', fields: ['organizationId', 'role', 'createdAt'] },
  
  // Projects collection  
  { collection: 'projects', fields: ['organizationId', 'createdAt'] }, // ASC and DESC versions exist
  { collection: 'projects', fields: ['organizationId', 'status'] },
  
  // Subscriptions collection
  { collection: 'subscriptions', fields: ['organizationId', 'status', 'createdAt'] },
  { collection: 'subscriptions', fields: ['userId', 'status'] },
  
  // Payments collection
  { collection: 'payments', fields: ['status', 'createdAt'] },
  { collection: 'payments', fields: ['userId', 'createdAt'] },
  
  // Team Members collections (both team_members and teamMembers exist)
  { collection: 'teamMembers', fields: ['organizationId', 'createdAt'] },
  { collection: 'teamMembers', fields: ['organizationId', 'status'] },
  { collection: 'teamMembers', fields: ['organizationId', 'status', 'createdAt'] },
  { collection: 'team_members', fields: ['organizationId', 'role'] },
  
  // Reports collection
  { collection: 'reports', fields: ['organizationId', 'createdAt'] },
];

// ============================================================================
// REQUIRED INDEXES FOR PAGES COMPONENTS
// ============================================================================

const REQUIRED_INDEXES = [
  // ========================================================================
  // UNIFIED DATA SERVICE INDEXES (Dashboard Pages)
  // ========================================================================
  {
    name: 'users-organization-nested-id',
    collection: 'users',
    fields: [
      { fieldPath: 'organization.id', order: 'ASCENDING' }
    ],
    description: 'UnifiedDataService: getUsersForOrganization() - uses nested organization.id',
    priority: 'HIGH'
  },
  
  {
    name: 'projects-organization-nested-id',
    collection: 'projects', 
    fields: [
      { fieldPath: 'organization.id', order: 'ASCENDING' }
    ],
    description: 'UnifiedDataService: getProjectsForOrganization() - uses nested organization.id',
    priority: 'HIGH'
  },
  
  {
    name: 'licenses-org-created-unified',
    collection: 'licenses',
    fields: [
      { fieldPath: 'organization.id', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'UnifiedDataService: getLicensesForOrganization() - LicensesPage',
    priority: 'CRITICAL'
  },
  
  {
    name: 'team-members-org-created-unified',
    collection: 'team_members',
    fields: [
      { fieldPath: 'organization.id', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'UnifiedDataService: getTeamMembersForOrganization() - TeamPage',
    priority: 'CRITICAL'
  },
  
  {
    name: 'datasets-owner-status-updated',
    collection: 'datasets',
    fields: [
      { fieldPath: 'owner.organizationId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' }
    ],
    description: 'UnifiedDataService: getDatasetsForOrganization()',
    priority: 'MEDIUM'
  },

  // ========================================================================
  // ADMIN DASHBOARD SERVICE INDEXES (Admin Pages)
  // ========================================================================
  {
    name: 'invoices-created-desc',
    collection: 'invoices',
    fields: [
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'AdminDashboardService: getDashboardStats() - recent invoices',
    priority: 'MEDIUM'
  },
  
  {
    name: 'licenses-user-id',
    collection: 'licenses',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' }
    ],
    description: 'AdminDashboardService: getUserDetails() - user licenses',
    priority: 'MEDIUM'
  },

  // ========================================================================
  // DASHBOARD OVERVIEW PAGE INDEXES (Direct Firestore Queries)
  // ========================================================================
  {
    name: 'team-members-org-status-dashboard',
    collection: 'team_members',
    fields: [
      { fieldPath: 'organizationId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' }
    ],
    description: 'DashboardOverview: team members query with organizationId + status',
    priority: 'HIGH'
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is available');
    return true;
  } catch (error) {
    console.log('❌ Firebase CLI not found. Please install it first:');
    console.log('npm install -g firebase-tools');
    return false;
  }
}

function checkAuthentication() {
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Firebase CLI authenticated');
    return true;
  } catch (error) {
    console.log('❌ Firebase CLI not authenticated. Please run `firebase login`');
    return false;
  }
}

function isIndexRedundant(requiredIndex) {
  // Check if we already have an equivalent or better index
  return EXISTING_INDEXES.some(existing => {
    if (existing.collection !== requiredIndex.collection) return false;
    
    // For single field indexes, check exact match
    if (requiredIndex.fields.length === 1) {
      const requiredField = requiredIndex.fields[0].fieldPath;
      return existing.fields.includes(requiredField) || 
             existing.fields.includes(requiredField.replace('organization.id', 'organizationId'));
    }
    
    // For composite indexes, check if existing covers the required fields
    const requiredFields = requiredIndex.fields.map(f => f.fieldPath);
    const existingFields = existing.fields;
    
    // Special case: organizationId vs organization.id are different
    const normalizedRequired = requiredFields.map(f => f.replace('organization.id', 'organizationId'));
    const hasEquivalent = normalizedRequired.every(field => existingFields.includes(field));
    
    return hasEquivalent && existingFields.length >= requiredFields.length;
  });
}

function analyzeIndexNeeds() {
  console.log('🔍 Analyzing existing indexes vs required indexes...\n');
  
  const missingIndexes = [];
  const redundantIndexes = [];
  
  REQUIRED_INDEXES.forEach(required => {
    if (isIndexRedundant(required)) {
      redundantIndexes.push(required);
    } else {
      missingIndexes.push(required);
    }
  });
  
  return { missingIndexes, redundantIndexes };
}

function generateFirestoreIndexesJSON(indexes) {
  const indexesConfig = {
    indexes: indexes.map(index => ({
      collectionGroup: index.collection,
      queryScope: "COLLECTION",
      fields: index.fields.map(field => ({
        fieldPath: field.fieldPath,
        order: field.order
      }))
    }))
  };
  
  return JSON.stringify(indexesConfig, null, 2);
}

function createIndexViaConsole(index) {
  const fieldsStr = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(' + ');
  const consoleUrl = `https://console.firebase.google.com/project/backbone-logic/firestore/indexes`;
  
  console.log(`\n📋 ${index.priority} Priority Index:`);
  console.log(`   Name: ${index.name}`);
  console.log(`   Collection: ${index.collection}`);
  console.log(`   Fields: ${fieldsStr}`);
  console.log(`   Description: ${index.description}`);
  console.log(`   Console: ${consoleUrl}`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function createMissingFirebaseIndexes() {
  console.log('🔥 Creating Missing Firebase Indexes for Pages Components');
  console.log('========================================================\n');

  // Check prerequisites
  if (!checkFirebaseCLI() || !checkAuthentication()) {
    process.exit(1);
  }

  // Analyze what's needed
  const { missingIndexes, redundantIndexes } = analyzeIndexNeeds();

  console.log(`📊 Index Analysis Results:`);
  console.log(`==========================`);
  console.log(`✅ Already have: ${redundantIndexes.length} indexes`);
  console.log(`❌ Missing: ${missingIndexes.length} indexes`);
  console.log(`📋 Total required: ${REQUIRED_INDEXES.length} indexes\n`);

  if (redundantIndexes.length > 0) {
    console.log('✅ EXISTING INDEXES (No action needed):');
    console.log('======================================');
    redundantIndexes.forEach(index => {
      const fieldsStr = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(' + ');
      console.log(`✓ ${index.collection}: ${fieldsStr}`);
      console.log(`  └─ ${index.description}`);
    });
    console.log('');
  }

  if (missingIndexes.length === 0) {
    console.log('🎉 ALL REQUIRED INDEXES ALREADY EXIST!');
    console.log('Your pages should work without "requires an index" errors.');
    return;
  }

  console.log('❌ MISSING INDEXES (Need to create):');
  console.log('====================================');

  // Group by priority
  const critical = missingIndexes.filter(i => i.priority === 'CRITICAL');
  const high = missingIndexes.filter(i => i.priority === 'HIGH');
  const medium = missingIndexes.filter(i => i.priority === 'MEDIUM');

  [
    { name: 'CRITICAL (Required for main dashboard pages)', indexes: critical },
    { name: 'HIGH (Required for core functionality)', indexes: high },
    { name: 'MEDIUM (Nice to have)', indexes: medium }
  ].forEach(group => {
    if (group.indexes.length > 0) {
      console.log(`\n🚨 ${group.name}:`);
      console.log('─'.repeat(50));
      group.indexes.forEach(createIndexViaConsole);
    }
  });

  // Generate firestore.indexes.json for missing indexes only
  if (missingIndexes.length > 0) {
    console.log('\n🛠️ DEPLOYMENT OPTIONS:');
    console.log('======================\n');

    console.log('📄 Option 1: Deploy via firestore.indexes.json');
    const indexesJSON = generateFirestoreIndexesJSON(missingIndexes);
    
    try {
      const fs = await import('fs');
      fs.writeFileSync('firestore.missing-indexes.json', indexesJSON);
      console.log('✅ Created firestore.missing-indexes.json');
      console.log('Deploy with: firebase deploy --only firestore:indexes\n');
    } catch (error) {
      console.log('❌ Failed to write firestore.missing-indexes.json');
    }

    console.log('🌐 Option 2: Create manually via Firebase Console');
    console.log('Visit: https://console.firebase.google.com/project/backbone-logic/firestore/indexes\n');

    console.log('🔗 Option 3: Use error links when queries fail');
    console.log('Firestore will provide direct creation links in error messages.\n');
  }

  console.log('⏱️ DEPLOYMENT TIMELINE:');
  console.log('=======================');
  console.log('1. Create missing indexes (5-10 minutes build time)');
  console.log('2. Wait for all indexes to show "Ready" status');
  console.log('3. Test queries in Firebase Console');
  console.log('4. Deploy updated pages');

  console.log('\n🔍 VERIFICATION:');
  console.log('================');
  console.log('Run: node verify-firebase-indexes.js');
  console.log('Or check: https://console.firebase.google.com/project/backbone-logic/firestore/indexes');

  console.log('\n✅ Missing index analysis complete!');
  if (missingIndexes.length > 0) {
    console.log(`Create the ${missingIndexes.length} missing indexes above to ensure all pages work optimally.`);
  }
}

// Run the script
createMissingFirebaseIndexes().catch(console.error);
