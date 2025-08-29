#!/usr/bin/env node

/**
 * 🔍 Verify Firebase Indexes for UnifiedDataService
 * 
 * This script checks if all required composite indexes exist for the
 * UnifiedDataService queries used in the licensing website.
 */

import { execSync } from 'child_process';

console.log('🔍 Verifying Firebase Indexes for UnifiedDataService...');
console.log('=======================================================\n');

// Required indexes based on UnifiedDataService queries
const requiredIndexes = [
  {
    collection: 'users',
    fields: [
      { field: 'organization.id', order: 'ASCENDING' }
    ],
    description: 'Query users by organization ID'
  },
  {
    collection: 'projects', 
    fields: [
      { field: 'organization.id', order: 'ASCENDING' }
    ],
    description: 'Query projects by organization ID'
  },
  {
    collection: 'subscriptions',
    fields: [
      { field: 'organizationId', order: 'ASCENDING' },
      { field: 'status', order: 'ASCENDING' }
    ],
    description: 'Query active subscriptions by organization'
  },
  {
    collection: 'licenses',
    fields: [
      { field: 'organization.id', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Query licenses by organization with creation date ordering'
  },
  {
    collection: 'team_members',
    fields: [
      { field: 'organization.id', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Query team members by organization with creation date ordering'
  },
  {
    collection: 'datasets',
    fields: [
      { field: 'owner.organizationId', order: 'ASCENDING' },
      { field: 'status', order: 'ASCENDING' },
      { field: 'updatedAt', order: 'DESCENDING' }
    ],
    description: 'Query active datasets by organization with update date ordering'
  }
];

async function checkFirebaseIndexes() {
  try {
    // Check if Firebase CLI is available
    try {
      execSync('firebase --version', { stdio: 'pipe' });
      console.log('✅ Firebase CLI is available');
    } catch (error) {
      console.log('❌ Firebase CLI not found. Please install it first:');
      console.log('npm install -g firebase-tools');
      return;
    }

    // Check if user is logged in
    try {
      execSync('firebase projects:list', { stdio: 'pipe' });
      console.log('✅ Firebase CLI authenticated');
    } catch (error) {
      console.log('❌ Firebase CLI not authenticated. Please run:');
      console.log('firebase login');
      return;
    }

    console.log('\n📋 Checking existing indexes...\n');

    // Get current indexes
    const result = execSync('firebase firestore:indexes', { encoding: 'utf8' });
    
    console.log('🔍 Current Firestore Indexes:');
    console.log('============================');
    console.log(result);
    
    console.log('\n📝 Required Indexes for UnifiedDataService:');
    console.log('===========================================');
    
    requiredIndexes.forEach((index, i) => {
      console.log(`\n${i + 1}. ${index.collection} Collection`);
      console.log(`   Description: ${index.description}`);
      console.log('   Fields:');
      index.fields.forEach(field => {
        console.log(`   - ${field.field} (${field.order})`);
      });
      
      // Check if this index exists in the current indexes
      const hasIndex = result.includes(`"collectionGroup": "${index.collection}"`) &&
                      index.fields.every(field => 
                        result.includes(`"fieldPath": "${field.field}"`)
                      );
      
      if (hasIndex) {
        console.log('   ✅ Index appears to exist');
      } else {
        console.log('   ❌ Index may be missing - please verify manually');
      }
    });

    console.log('\n🚀 Index Creation Commands:');
    console.log('===========================');
    console.log('If any indexes are missing, you can create them using the Firebase Console:');
    console.log('https://console.firebase.google.com/project/backbone-logic/firestore/indexes');
    
    console.log('\n📊 Summary:');
    console.log('===========');
    console.log(`Total required indexes: ${requiredIndexes.length}`);
    console.log('All queries in UnifiedDataService should work with these indexes.');
    console.log('\nNote: Single-field indexes are created automatically by Firestore.');
    console.log('Only composite indexes (multiple fields) need manual creation.');

  } catch (error) {
    console.error('❌ Error checking Firebase indexes:', error.message);
  }
}

checkFirebaseIndexes();
