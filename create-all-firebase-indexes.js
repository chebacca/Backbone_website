#!/usr/bin/env node

/**
 * 🔥 Create All Firebase Indexes for Pages Components
 * 
 * This script creates all required Firebase composite indexes for:
 * - UnifiedDataService queries (used by dashboard pages)
 * - AdminDashboardService queries (used by admin pages) 
 * - Direct Firestore queries (used by specific pages)
 * 
 * Run this script to ensure all pages work optimally without "requires an index" errors.
 */

import { execSync } from 'child_process';

// ============================================================================
// REQUIRED INDEXES CONFIGURATION
// ============================================================================

const REQUIRED_INDEXES = [
  // ========================================================================
  // UNIFIED DATA SERVICE INDEXES (Dashboard Pages)
  // ========================================================================
  {
    name: 'users-organization-id',
    collection: 'users',
    fields: [
      { fieldPath: 'organization.id', order: 'ASCENDING' }
    ],
    description: 'UnifiedDataService: getUsersForOrganization()'
  },
  
  {
    name: 'projects-organization-id',
    collection: 'projects', 
    fields: [
      { fieldPath: 'organization.id', order: 'ASCENDING' }
    ],
    description: 'UnifiedDataService: getProjectsForOrganization()'
  },
  
  {
    name: 'subscriptions-org-status',
    collection: 'subscriptions',
    fields: [
      { fieldPath: 'organizationId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' }
    ],
    description: 'UnifiedDataService: getActiveSubscription()'
  },
  
  {
    name: 'licenses-org-created',
    collection: 'licenses',
    fields: [
      { fieldPath: 'organization.id', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'UnifiedDataService: getLicensesForOrganization() - LicensesPage'
  },
  
  {
    name: 'team-members-org-created',
    collection: 'team_members',
    fields: [
      { fieldPath: 'organization.id', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'UnifiedDataService: getTeamMembersForOrganization() - TeamPage'
  },
  
  {
    name: 'datasets-owner-status-updated',
    collection: 'datasets',
    fields: [
      { fieldPath: 'owner.organizationId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'updatedAt', order: 'DESCENDING' }
    ],
    description: 'UnifiedDataService: getDatasetsForOrganization()'
  },

  // ========================================================================
  // ADMIN DASHBOARD SERVICE INDEXES (Admin Pages)
  // ========================================================================
  {
    name: 'subscriptions-status-active',
    collection: 'subscriptions',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' }
    ],
    description: 'AdminDashboardService: getDashboardStats() - active subscriptions'
  },
  
  {
    name: 'payments-status-created',
    collection: 'payments',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'AdminDashboardService: getDashboardStats() - recent payments'
  },
  
  {
    name: 'invoices-created-desc',
    collection: 'invoices',
    fields: [
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'AdminDashboardService: getDashboardStats() - recent invoices'
  },
  
  {
    name: 'users-created-desc',
    collection: 'users',
    fields: [
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'AdminDashboardService: getUsers() - AdminDashboard users tab'
  },
  
  {
    name: 'subscriptions-user-status',
    collection: 'subscriptions',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' }
    ],
    description: 'AdminDashboardService: getUsers() - user subscription lookup'
  },
  
  {
    name: 'licenses-user-id',
    collection: 'licenses',
    fields: [
      { fieldPath: 'userId', order: 'ASCENDING' }
    ],
    description: 'AdminDashboardService: getUserDetails() - user licenses'
  },

  // ========================================================================
  // DASHBOARD OVERVIEW PAGE INDEXES (Direct Firestore Queries)
  // ========================================================================
  {
    name: 'projects-org-created-dashboard',
    collection: 'projects',
    fields: [
      { fieldPath: 'organizationId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'DashboardOverview: projects query with organizationId + createdAt'
  },
  
  {
    name: 'team-members-org-status',
    collection: 'team_members',
    fields: [
      { fieldPath: 'organizationId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' }
    ],
    description: 'DashboardOverview: team members query with organizationId + status'
  },

  // ========================================================================
  // ACCOUNTING DASHBOARD INDEXES (Admin Accounting)
  // ========================================================================
  {
    name: 'payments-created-limit',
    collection: 'payments',
    fields: [
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'AccountingDashboard: payments with date ordering'
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

function createIndexViaConsole(index) {
  const fieldsStr = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(' + ');
  const consoleUrl = `https://console.firebase.google.com/project/backbone-logic/firestore/indexes`;
  
  console.log(`\n📋 Manual Index Creation Required:`);
  console.log(`   Name: ${index.name}`);
  console.log(`   Collection: ${index.collection}`);
  console.log(`   Fields: ${fieldsStr}`);
  console.log(`   Description: ${index.description}`);
  console.log(`   Console: ${consoleUrl}`);
}

function generateFirestoreIndexesJSON() {
  const indexesConfig = {
    indexes: REQUIRED_INDEXES.map(index => ({
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

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function createAllFirebaseIndexes() {
  console.log('🔥 Creating All Firebase Indexes for Pages Components');
  console.log('=====================================================\n');

  // Check prerequisites
  if (!checkFirebaseCLI() || !checkAuthentication()) {
    process.exit(1);
  }

  console.log(`\n📊 Total Indexes Required: ${REQUIRED_INDEXES.length}`);
  console.log('=====================================\n');

  // Group indexes by category
  const categories = {
    'UnifiedDataService (Dashboard Pages)': REQUIRED_INDEXES.filter(i => i.description.includes('UnifiedDataService')),
    'AdminDashboardService (Admin Pages)': REQUIRED_INDEXES.filter(i => i.description.includes('AdminDashboardService')),
    'Direct Queries (Specific Pages)': REQUIRED_INDEXES.filter(i => !i.description.includes('UnifiedDataService') && !i.description.includes('AdminDashboardService'))
  };

  // Display all required indexes by category
  Object.entries(categories).forEach(([category, indexes]) => {
    if (indexes.length > 0) {
      console.log(`\n🎯 ${category}:`);
      console.log('─'.repeat(50));
      indexes.forEach((index, i) => {
        const fieldsStr = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(' + ');
        console.log(`${i + 1}. ${index.collection}: ${fieldsStr}`);
        console.log(`   └─ ${index.description}`);
      });
    }
  });

  console.log('\n🛠️ Index Creation Options:');
  console.log('==========================\n');

  // Option 1: Generate firestore.indexes.json
  console.log('📄 Option 1: Generate firestore.indexes.json file');
  console.log('This creates a configuration file you can deploy with Firebase CLI.\n');
  
  const indexesJSON = generateFirestoreIndexesJSON();
  
  try {
    const fs = await import('fs');
    fs.writeFileSync('firestore.indexes.json', indexesJSON);
    console.log('✅ Created firestore.indexes.json');
    console.log('Deploy with: firebase deploy --only firestore:indexes\n');
  } catch (error) {
    console.log('❌ Failed to write firestore.indexes.json');
  }

  // Option 2: Manual creation via console
  console.log('🌐 Option 2: Create manually via Firebase Console');
  console.log('Visit: https://console.firebase.google.com/project/backbone-logic/firestore/indexes\n');

  // Option 3: Use error links when they appear
  console.log('🔗 Option 3: Use error links when queries fail');
  console.log('Firestore will provide direct creation links in error messages.\n');

  // Show critical indexes first
  console.log('🚨 CRITICAL INDEXES (Required for main dashboard pages):');
  console.log('======================================================');
  
  const criticalIndexes = [
    'licenses-org-created',
    'team-members-org-created', 
    'projects-org-created-dashboard',
    'users-created-desc'
  ];

  REQUIRED_INDEXES
    .filter(index => criticalIndexes.includes(index.name))
    .forEach(createIndexViaConsole);

  console.log('\n📋 COMPLETE INDEX LIST:');
  console.log('=======================');
  console.log('All indexes have been documented in firestore.indexes.json');
  console.log('Deploy all at once with: firebase deploy --only firestore:indexes');

  console.log('\n⏱️ DEPLOYMENT TIMELINE:');
  console.log('=======================');
  console.log('1. Create indexes (5-10 minutes build time)');
  console.log('2. Wait for all indexes to show "Ready" status');
  console.log('3. Test queries in Firebase Console');
  console.log('4. Deploy updated pages');

  console.log('\n🔍 VERIFICATION:');
  console.log('================');
  console.log('Run: node verify-firebase-indexes.js');
  console.log('Or check: https://console.firebase.google.com/project/backbone-logic/firestore/indexes');

  console.log('\n✅ Index creation guide complete!');
  console.log('All pages should work without "requires an index" errors once indexes are built.');
}

// Run the script
createAllFirebaseIndexes().catch(console.error);
