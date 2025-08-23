#!/usr/bin/env node

/**
 * Check if Firestore collections still exist
 * This script will attempt to query various collections to verify they exist
 */

const { execSync } = require('child_process');

// Collections that should exist based on the indexes
const collectionsToCheck = [
  'sessions',
  'session_elements', 
  'session_files',
  'session_messages',
  'teamMembers',
  'workflow_diagrams',
  'timecard_templates',
  'timecard_configurations',
  'timecard_approval_flows',
  'organizations',
  'projects',
  'payments',
  'system_health',
  'analytics',
  'settings',
  'notifications',
  'audit_logs',
  'usage_analytics',
  'user_time_cards',
  'user_settingss',
  'webhook_events',
  'websocket_servers',
  'websocket_sessions'
];

console.log('🔍 Checking if Firestore collections still exist...\n');

async function checkCollection(collectionName) {
  try {
    // Try to get a single document from the collection
    const command = `firebase firestore:get --collection ${collectionName} --limit 1 --project=backbone-logic`;
    
    try {
      const result = execSync(command, { encoding: 'utf8', timeout: 10000 });
      
      if (result.includes('No documents found') || result.includes('Collection') || result.includes('Error')) {
        console.log(`❌ ${collectionName}: Collection exists but may be empty or inaccessible`);
      } else {
        console.log(`✅ ${collectionName}: Collection exists and accessible`);
      }
    } catch (error) {
      if (error.message.includes('No documents found')) {
        console.log(`⚠️  ${collectionName}: Collection exists but is empty`);
      } else if (error.message.includes('Collection not found')) {
        console.log(`❌ ${collectionName}: Collection NOT FOUND`);
      } else {
        console.log(`❌ ${collectionName}: Error accessing collection - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ ${collectionName}: Failed to check - ${error.message}`);
  }
}

async function main() {
  console.log('📋 Collections to check:', collectionsToCheck.length);
  console.log('⏳ This may take a few minutes...\n');
  
  for (const collection of collectionsToCheck) {
    await checkCollection(collection);
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎯 Summary:');
  console.log('- ✅ = Collection exists and accessible');
  console.log('- ⚠️  = Collection exists but empty');
  console.log('- ❌ = Collection not found or inaccessible');
  console.log('\n💡 If collections show as "not found", there may be a console viewing issue.');
}

main().catch(console.error);
