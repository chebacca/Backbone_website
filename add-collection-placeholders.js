#!/usr/bin/env node

/**
 * Add placeholder documents to Firestore collections
 * This makes collections visible in the Firebase console
 */

const { execSync } = require('child_process');

// Collections that should exist based on the indexes
const collectionsToProcess = [
  'sessions',
  'session_elements', 
  'session_files',
  'session_messages',
  'session_message_participants',
  'session_message_reads',
  'session_element_activities',
  'session_element_dependencies',
  'session_element_files',
  'session_element_reviews',
  'session_archives',
  'teamMembers',
  'projectTeamMembers',
  'workflow_diagrams',
  'workflow_assignments',
  'workflow_instances',
  'unified_workflow_instances',
  'unified_session_assignments',
  'unified_session_steps',
  'unified_step_events',
  'unified_step_progressions',
  'timecard_templates',
  'timecard_configurations',
  'timecard_approval_flows',
  'timecard_assistance_dismissals',
  'user_time_cards',
  'user_timecard_assignments',
  'organizations',
  'org_members',
  'orgMembers',
  'projects',
  'project_participants',
  'project_activities',
  'project_team_members',
  'payments',
  'system_health',
  'analytics',
  'usage_analytics',
  'settings',
  'notifications',
  'audit_log',
  'audit_logs',
  'webhook_events',
  'websocket_servers',
  'websocket_sessions',
  'user_settingss',
  'user_memory_profiles',
  'user_direct_reports',
  'sdk_versions',
  'servers',
  'setup_checklists',
  'setup_profiles',
  'scheduler_events',
  'scheduler_tasks',
  'scheduler_event_assignments',
  'saved_project_paths',
  'review_approvals',
  'review_assignments',
  'review_file_paths',
  'review_notes',
  'review_sections',
  'review_session_reviewers',
  'qc_activities',
  'qc_checklist_items',
  'qc_findings',
  'qc_reports',
  'qc_sessions',
  'qc_statuses',
  'research_sessions',
  'reports',
  'relationship_anchors',
  'realtime_presence',
  'portfolio_allocations',
  'portfolio_performances',
  'portfolio_tax_summaries',
  'portfolios',
  'pbm_daily_statuses',
  'pbm_payscales',
  'pbm_projects',
  'pbm_schedules',
  'privacy_consents',
  'production_crew_members',
  'production_roles',
  'production_sessions',
  'production_stages',
  'production_task_assignees',
  'notes',
  'network_ip_assignments',
  'message_participants',
  'message_reads',
  'message_sessions',
  'messages',
  'memory_slots',
  'memory_system_metrics',
  'media_file_tags',
  'media_files',
  'media_index_items',
  'media_indexes',
  'lifecycle_rules',
  'license_delivery_logs',
  'invoice_attachments',
  'invoice_payments',
  'inventory_assignment_histories',
  'inventory_histories',
  'inventory_items',
  'inventory_maps',
  'inventory_items',
  'domain_knowledge',
  'datasets',
  'daily_call_sheet_department_call_times',
  'daily_call_sheet_locations',
  'daily_call_sheet_personnel',
  'daily_call_sheet_records',
  'daily_call_sheet_schedules',
  'daily_call_sheet_vendors',
  'daily_call_sheet_walkie_channels',
  'cut_approvals',
  'cut_types',
  'custom_roles',
  'conversation_patterns',
  'contacts',
  'contact_groups',
  'contact_group_memberships',
  'chats',
  'chat_participants',
  'call_sheets',
  'call_sheet_department_call_times',
  'call_sheet_locations',
  'call_sheet_personnel',
  'call_sheet_schedules',
  'call_sheet_vendors',
  'call_sheet_walkie_channels',
  'budgets',
  'automation_executions',
  'automation_alerts',
  'assets',
  'asset_setups',
  'asset_setup_checklists',
  'asset_price_histories',
  'asset_performances',
  'agents',
  'agent_memories',
  'agent_function_logs',
  'activities',
  'schema_fields',
  'schemas'
];

console.log('🔍 Adding placeholder documents to make collections visible...\n');
console.log('📋 Collections to process:', collectionsToProcess.length);
console.log('⏳ This will take several minutes...\n');

async function addPlaceholderToCollection(collectionName) {
  try {
    // Create a minimal placeholder document
    const placeholderData = {
      _placeholder: true,
      createdAt: new Date().toISOString(),
      note: 'Placeholder document to make collection visible in console'
    };

    // Use Firebase CLI to add document (if available) or create a simple script
    console.log(`📝 Adding placeholder to: ${collectionName}`);
    
    // For now, just log what we would do
    // In a real implementation, we'd use the Firebase Admin SDK
    console.log(`   Would add document with data:`, JSON.stringify(placeholderData, null, 2));
    
    return true;
  } catch (error) {
    console.log(`❌ Failed to add placeholder to ${collectionName}: ${error.message}`);
    return false;
  }
}

async function main() {
  let successCount = 0;
  let failCount = 0;
  
  for (const collection of collectionsToProcess) {
    try {
      const success = await addPlaceholderToCollection(collection);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ Error processing ${collection}: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n🎯 Summary:');
  console.log(`✅ Successfully processed: ${successCount}`);
  console.log(`❌ Failed to process: ${failCount}`);
  console.log(`📊 Total collections: ${collectionsToProcess.length}`);
  console.log('\n💡 Note: This script shows what would be added.');
  console.log('   To actually add documents, we need Firebase Admin SDK access.');
}

main().catch(console.error);
