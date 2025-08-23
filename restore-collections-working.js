#!/usr/bin/env node

/**
 * Working Collections Restore Script
 * 
 * This script uses Firebase Admin SDK to create placeholder documents
 * in all collections that have indexes, making them visible in console.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Collections that have indexes (from firebase firestore:indexes)
const collectionsWithIndexes = [
  'activities',
  'agent_function_logs',
  'agent_memories',
  'agents',
  'asset_performances',
  'asset_price_histories',
  'asset_setup_checklists',
  'asset_setups',
  'assets',
  'audit_log',
  'automation_alerts',
  'automation_executions',
  'budgets',
  'call_sheet_department_call_times',
  'call_sheet_locations',
  'call_sheet_personnel',
  'call_sheet_schedules',
  'call_sheet_vendors',
  'call_sheet_walkie_channels',
  'call_sheets',
  'chat_participants',
  'chats',
  'collaboration_invitations',
  'contact_group_memberships',
  'contact_groups',
  'contacts',
  'conversation_patterns',
  'custom_roles',
  'cut_approvals',
  'cut_types',
  'daily_call_sheet_department_call_times',
  'daily_call_sheet_locations',
  'daily_call_sheet_personnel',
  'daily_call_sheet_records',
  'daily_call_sheet_schedules',
  'daily_call_sheet_vendors',
  'daily_call_sheet_walkie_channels',
  'datasets',
  'domain_knowledge',
  'inventory_assignment_histories',
  'inventory_histories',
  'inventory_items',
  'inventory_maps',
  'invoice_attachments',
  'invoice_payments',
  'invoices',
  'license_delivery_logs',
  'licenses',
  'lifecycle_rules',
  'media_file_tags',
  'media_files',
  'media_index_items',
  'media_indexes',
  'memory_slots',
  'memory_system_metrics',
  'message_participants',
  'message_reads',
  'message_sessions',
  'messages',
  'network_ip_assignments',
  'notes',
  'notifications',
  'org_members',
  'organizations',
  'orgMembers',
  'pbm_daily_statuses',
  'pbm_payscales',
  'pbm_projects',
  'pbm_schedules',
  'portfolio_allocations',
  'portfolio_performances',
  'portfolio_tax_summaries',
  'portfolios',
  'privacy_consents',
  'production_crew_members',
  'production_roles',
  'production_sessions',
  'production_stages',
  'production_task_assignees',
  'project_activities',
  'project_participants',
  'project_team_members',
  'projects',
  'projectTeamMembers',
  'qc_activities',
  'qc_checklist_items',
  'qc_findings',
  'qc_reports',
  'qc_sessions',
  'qc_statuses',
  'realtime_presence',
  'relationship_anchors',
  'reports',
  'research_sessions',
  'review_approvals',
  'review_assignments',
  'review_file_paths',
  'review_notes',
  'review_sections',
  'review_session_reviewers',
  'saved_project_paths',
  'scheduler_event_assignments',
  'scheduler_events',
  'scheduler_tasks',
  'schema_fields',
  'schemas',
  'sdk_versions',
  'servers',
  'session_archives',
  'session_element_activities',
  'session_element_dependencies',
  'session_element_files',
  'session_element_reviews',
  'session_elements',
  'session_files',
  'session_message_participants',
  'session_message_reads',
  'session_messages',
  'sessions',
  'setup_checklists',
  'setup_profiles',
  'subscriptions',
  'system_assets',
  'tax_lots',
  'teamMembers',
  'timecard_approval_flows',
  'timecard_assistance_dismissals',
  'timecard_configurations',
  'timecard_templates',
  'transactions',
  'unified_session_assignments',
  'unified_session_steps',
  'unified_step_events',
  'unified_step_progressions',
  'unified_workflow_instances',
  'usage_analytics',
  'user_direct_reports',
  'user_memory_profiles',
  'user_settingss',
  'user_time_cards',
  'user_timecard_assignments',
  'users',
  'webhook_events',
  'websocket_servers',
  'websocket_sessions',
  'workflow_assignments',
  'workflow_diagrams'
];

// Initialize Firebase Admin SDK
function initializeFirebase() {
  try {
    // Try to find service account key in common locations
    const possiblePaths = [
      './config/serviceAccountKey.json',
      '../config/serviceAccountKey.json',
      '../../config/serviceAccountKey.json',
      './serviceAccountKey.json'
    ];

    let serviceAccountPath = null;
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        serviceAccountPath = path;
        break;
      }
    }

    if (!serviceAccountPath) {
      throw new Error('Service account key not found. Please place serviceAccountKey.json in the config/ directory.');
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    initializeApp({
      credential: cert(serviceAccount),
      projectId: 'backbone-logic'
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return getFirestore();
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    console.log('\n💡 To fix this:');
    console.log('   1. Download service account key from Firebase console');
    console.log('   2. Place it in config/serviceAccountKey.json');
    console.log('   3. Run this script again');
    process.exit(1);
  }
}

// Create placeholder document for a collection
async function createPlaceholderDocument(db, collectionName) {
  try {
    // Check if collection already has documents
    const snapshot = await db.collection(collectionName).limit(1).get();
    
    if (!snapshot.empty) {
      console.log(`   ⚠️  ${collectionName}: Already has documents, skipping`);
      return { status: 'skipped', reason: 'already_has_documents' };
    }

    // Create placeholder document
    const placeholderData = {
      _placeholder: true,
      createdAt: new Date(),
      note: 'Placeholder document to make collection visible in console',
      collection: collectionName,
      restoredAt: new Date(),
      restoredBy: 'restore-collections-script'
    };

    await db.collection(collectionName).add(placeholderData);
    console.log(`   ✅ ${collectionName}: Placeholder document created`);
    return { status: 'created', documentId: 'placeholder' };
  } catch (error) {
    console.log(`   ❌ ${collectionName}: Failed - ${error.message}`);
    return { status: 'failed', error: error.message };
  }
}

// Main restore function
async function restoreCollections() {
  console.log('🔍 Starting collections restoration...');
  console.log('📋 Total collections to process:', collectionsWithIndexes.length);
  console.log('⏳ This will take several minutes...\n');

  const db = initializeFirebase();
  
  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const results = [];

  for (const collection of collectionsWithIndexes) {
    console.log(`📝 Processing: ${collection}`);
    
    const result = await createPlaceholderDocument(db, collection);
    results.push({ collection, ...result });
    
    if (result.status === 'created') successCount++;
    else if (result.status === 'skipped') skippedCount++;
    else failedCount++;
    
    // Small delay to avoid overwhelming Firestore
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Summary
  console.log('\n🎯 Restoration Complete!');
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${successCount}`);
  console.log(`   ⚠️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log(`   📋 Total: ${collectionsWithIndexes.length}`);
  
  if (failedCount > 0) {
    console.log('\n❌ Failed collections:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   - ${r.collection}: ${r.error}`);
    });
  }

  console.log('\n🚀 Next steps:');
  console.log('   1. Refresh Firebase console');
  console.log('   2. Collections should now be visible');
  console.log('   3. Admin dashboard should work properly');
}

// Run the restoration
restoreCollections().catch(console.error);
