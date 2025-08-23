#!/usr/bin/env tsx

// Restore all collections based on Prisma schema analysis
// This ensures the app has all necessary collections and data structures

process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getFirestore } from 'firebase-admin/firestore';
import '../src/services/firestoreService.js';
import { logger } from '../src/utils/logger.js';
import { PasswordUtil } from '../src/utils/password.js';

const db = getFirestore();

// Collections identified from Prisma schema that are essential for the app:
const ESSENTIAL_COLLECTIONS = [
  // Core User Management
  'users',
  'user_settingss',
  'custom_roles',
  'user_groups',
  'user_group_memberships',
  
  // Production Management
  'production_sessions',
  'production_stages',
  'production_tasks',
  'production_task_assignees',
  'production_crew_members',
  'production_workflow_correlations',
  'production_departments',
  'production_sub_departments',
  'production_roles',
  
  // Session Management
  'session_assignments',
  'session_roles',
  'stages',
  'session_archives',
  'session_files',
  'session_elements',
  'session_element_files',
  'session_element_reviews',
  'session_element_activities',
  'session_element_dependencies',
  'session_messages',
  'session_message_reads',
  'session_message_participants',
  
  // Workflow Management
  'workflow_diagrams',
  'unified_workflow_instances',
  'unified_session_assignments',
  'unified_session_steps',
  'unified_step_events',
  'unified_step_progressions',
  'workflow_assignments',
  
  // Project Management
  'projects',
  'project_participants',
  'project_team_members',
  'project_activities',
  'project_collaboration_settings',
  'collaboration_invitations',
  'realtime_presence',
  'saved_project_paths',
  
  // QC and Review System
  'qc_statuses',
  'qc_sessions',
  'qc_checklist_items',
  'qc_findings',
  'qc_reports',
  'qc_activities',
  'review_sessions',
  'review_assignments',
  'review_approvals',
  'review_notes',
  'review_sections',
  'review_session_reviewers',
  'review_file_paths',
  'cut_approvals',
  'cut_types',
  
  // Call Sheet System
  'call_sheets',
  'call_sheet_locations',
  'call_sheet_personnel',
  'call_sheet_department_call_times',
  'call_sheet_schedules',
  'call_sheet_vendors',
  'call_sheet_walkie_channels',
  'daily_call_sheet_records',
  'daily_call_sheet_locations',
  'daily_call_sheet_personnel',
  'daily_call_sheet_department_call_times',
  'daily_call_sheet_schedules',
  'daily_call_sheet_vendors',
  'daily_call_sheet_walkie_channels',
  
  // PBM System
  'pbm_projects',
  'pbm_schedules',
  'pbm_payscales',
  'pbm_daily_statuses',
  
  // Time Management
  'user_time_cards',
  'timecard_templates',
  'user_timecard_assignments',
  'timecard_configurations',
  'user_direct_reports',
  'timecard_approval_flows',
  'timecard_assistance_dismissals',
  
  // Inventory Management
  'inventory_items',
  'inventory_histories',
  'inventory_assignment_histories',
  'inventory_maps',
  'schemas',
  'schema_fields',
  'asset_setups',
  'setup_profiles',
  'setup_checklists',
  'asset_setup_checklists',
  'network_ip_assignments',
  'servers',
  
  // Media Management
  'media_files',
  'media_indexes',
  'media_index_items',
  'media_file_tags',
  
  // Communication System
  'chats',
  'chat_participants',
  'messages',
  'message_reads',
  'message_sessions',
  'message_participants',
  'session_messages',
  'session_message_reads',
  
  // Financial System
  'portfolios',
  'assets',
  'asset_performances',
  'asset_price_histories',
  'tax_lots',
  'portfolio_allocations',
  'portfolio_performances',
  'portfolio_tax_summaries',
  'budgets',
  'transactions',
  'invoices',
  'invoice_items',
  'invoice_payments',
  'invoice_attachments',
  
  // Contact Management
  'contacts',
  'contact_groups',
  'contact_group_memberships',
  
  // AI and Automation
  'agents',
  'agent_memories',
  'agent_function_logs',
  'automation_alerts',
  'automation_acknowledgments',
  'lifecycle_rules',
  'automation_executions',
  
  // Research and Planning
  'research_sessions',
  'scheduler_events',
  'scheduler_event_assignments',
  'scheduler_tasks',
  
  // Notes and Documentation
  'notes',
  'reports',
  
  // Memory System
  'user_memory_profiles',
  'conversation_patterns',
  'domain_knowledge',
  'relationship_anchors',
  'memory_slots',
  'memory_system_metrics',
  
  // System Assets
  'system_assets',
  'tenant_storage_usages',
  
  // WebSocket Management
  'websocket_servers',
  'websocket_sessions',
  
  // Legacy and Migration
  'org_members',
  'organizations',
  'subscriptions',
  'licenses',
  'payments',
  'privacy_consents',
  'license_delivery_logs',
  'audit_logs',
  'compliance_events',
  'tenant_mappings',
  'tenants',
  'notifications',
  'activities',
  'datasets',
  'sessions',
  'usage_analytics',
  'webhook_events',
  'sdk_versions'
];

async function restoreFromPrismaSchema() {
  try {
    logger.info('🔄 Starting comprehensive restoration from Prisma schema...');
    
    // First, check what collections already exist
    const existingCollections = await getExistingCollections();
    logger.info(`📊 Found ${existingCollections.length} existing collections`);
    
    // Create missing collections with basic structure
    await createMissingCollections(existingCollections);
    
    // Add essential data to key collections
    await addEssentialData();
    
    logger.info('✅ Prisma schema-based restoration completed!');
    
    // Final collection count
    const finalCollections = await getExistingCollections();
    logger.info(`📊 Final collection count: ${finalCollections.length}`);
    
  } catch (error) {
    logger.error('❌ Error in Prisma schema restoration:', error);
    throw error;
  }
}

async function getExistingCollections(): Promise<string[]> {
  const collections: string[] = [];
  try {
    const collectionsSnapshot = await db.listCollections();
    for (const collection of collectionsSnapshot) {
      collections.push(collection.id);
    }
  } catch (error) {
    logger.warn('⚠️ Could not list collections, proceeding with empty list');
  }
  return collections;
}

async function createMissingCollections(existingCollections: string[]) {
  logger.info('🔧 Creating missing collections...');
  
  const missingCollections = ESSENTIAL_COLLECTIONS.filter(
    collection => !existingCollections.includes(collection)
  );
  
  logger.info(`📝 Found ${missingCollections.length} missing collections`);
  
  for (const collectionName of missingCollections) {
    try {
      // Create a permanent document to ensure collection exists and persists
      await db.collection(collectionName).add({
        _system_placeholder: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        note: 'System collection created from Prisma schema analysis',
        status: 'ACTIVE',
        isSystemGenerated: true
      });
      
      logger.info(`✅ Created collection: ${collectionName}`);
    } catch (error) {
      logger.warn(`⚠️ Could not create collection ${collectionName}:`, error);
    }
  }
}

async function addEssentialData() {
  logger.info('📊 Adding essential data to key collections...');
  
  // Ensure we have basic production departments
  await ensureProductionDepartments();
  
  // Ensure we have basic production roles
  await ensureProductionRoles();
  
  // Ensure we have basic stages
  await ensureStages();
  
  // Ensure we have basic session roles
  await ensureSessionRoles();
  
  // Ensure we have basic cut types
  await ensureCutTypes();
  
  // Ensure we have basic timecard templates
  await ensureTimecardTemplates();
  
  logger.info('✅ Essential data added');
}

async function ensureProductionDepartments() {
  const deptRef = db.collection('production_departments');
  const existing = await deptRef.get();
  
  if (existing.empty) {
    const departments = [
      { name: 'PRODUCTION', displayName: 'Production', category: 'PRODUCTION', color: '#FF5722', icon: 'videocam', order: 1 },
      { name: 'POST_PRODUCTION', displayName: 'Post Production', category: 'POST_PRODUCTION', color: '#2196F3', icon: 'edit', order: 2 },
      { name: 'CAMERA', displayName: 'Camera', category: 'PRODUCTION', color: '#4CAF50', icon: 'camera_alt', order: 3 },
      { name: 'GRIP', displayName: 'Grip', category: 'PRODUCTION', color: '#FF9800', icon: 'build', order: 4 },
      { name: 'ELECTRIC', displayName: 'Electric', category: 'PRODUCTION', color: '#FFC107', icon: 'lightbulb', order: 5 },
      { name: 'ART', displayName: 'Art', category: 'PRODUCTION', color: '#9C27B0', icon: 'palette', order: 6 },
      { name: 'SOUND', displayName: 'Sound', category: 'PRODUCTION', color: '#795548', icon: 'mic', order: 7 },
      { name: 'MAKEUP', displayName: 'Makeup', category: 'PRODUCTION', color: '#E91E63', icon: 'face', order: 8 },
      { name: 'WARDROBE', displayName: 'Wardrobe', category: 'PRODUCTION', color: '#607D8B', icon: 'checkroom', order: 9 },
      { name: 'TRANSPORTATION', displayName: 'Transportation', category: 'LOGISTICS', color: '#3F51B5', icon: 'directions_car', order: 10 },
      { name: 'CATERING', displayName: 'Catering', category: 'SUPPORT', color: '#8BC34A', icon: 'restaurant', order: 11 },
      { name: 'SECURITY', displayName: 'Security', category: 'SUPPORT', color: '#F44336', icon: 'security', order: 12 },
      { name: 'MEDICAL', displayName: 'Medical', category: 'SUPPORT', color: '#00BCD4', icon: 'local_hospital', order: 13 },
      { name: 'VFX', displayName: 'VFX', category: 'POST_PRODUCTION', color: '#9E9E9E', icon: 'movie', order: 14 },
      { name: 'STUNTS', displayName: 'Stunts', category: 'PRODUCTION', color: '#FF5722', icon: 'sports_martial_arts', order: 15 },
      { name: 'ANIMALS', displayName: 'Animals', category: 'PRODUCTION', color: '#8D6E63', icon: 'pets', order: 16 },
      { name: 'LOCATIONS', displayName: 'Locations', category: 'LOGISTICS', color: '#4CAF50', icon: 'place', order: 17 },
      { name: 'IT', displayName: 'IT', category: 'TECHNICAL', color: '#2196F3', icon: 'computer', order: 18 },
      { name: 'NETWORKING', displayName: 'Networking', category: 'TECHNICAL', color: '#673AB7', icon: 'router', order: 19 },
      { name: 'DEVELOPMENT', displayName: 'Development', category: 'TECHNICAL', color: '#FF9800', icon: 'code', order: 20 }
    ];
    
    for (const dept of departments) {
      await deptRef.add({
        ...dept,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    logger.info(`✅ Created ${departments.length} production departments`);
  }
}

async function ensureProductionRoles() {
  const roleRef = db.collection('production_roles');
  const existing = await roleRef.get();
  
  if (existing.empty) {
    // Get production departments
    const deptRef = db.collection('production_departments');
    const productionDept = await deptRef.where('name', '==', 'PRODUCTION').get();
    const postDept = await deptRef.where('name', '==', 'POST_PRODUCTION').get();
    const cameraDept = await deptRef.where('name', '==', 'CAMERA').get();
    
    if (!productionDept.empty && !postDept.empty && !cameraDept.empty) {
      const roles = [
        // Production roles
        { departmentId: productionDept.docs[0].id, name: 'PRODUCER', displayName: 'Producer', level: 'DEPARTMENT_HEAD', hourlyRateRange: '75-150', order: 1 },
        { departmentId: productionDept.docs[0].id, name: 'DIRECTOR', displayName: 'Director', level: 'DEPARTMENT_HEAD', hourlyRateRange: '100-200', order: 2 },
        { departmentId: productionDept.docs[0].id, name: 'LINE_PRODUCER', displayName: 'Line Producer', level: 'LEAD', hourlyRateRange: '60-120', order: 3 },
        { departmentId: productionDept.docs[0].id, name: 'PRODUCTION_ASSISTANT', displayName: 'Production Assistant', level: 'ASSISTANT', hourlyRateRange: '25-45', order: 4 },
        
        // Post Production roles
        { departmentId: postDept.docs[0].id, name: 'POST_PRODUCTION_SUPERVISOR', displayName: 'Post Production Supervisor', level: 'DEPARTMENT_HEAD', hourlyRateRange: '80-150', order: 1 },
        { departmentId: postDept.docs[0].id, name: 'EDITOR', displayName: 'Editor', level: 'LEAD', hourlyRateRange: '60-120', order: 2 },
        { departmentId: postDept.docs[0].id, name: 'ASSISTANT_EDITOR', displayName: 'Assistant Editor', level: 'ASSISTANT', hourlyRateRange: '35-65', order: 3 },
        { departmentId: postDept.docs[0].id, name: 'COLORIST', displayName: 'Colorist', level: 'LEAD', hourlyRateRange: '70-130', order: 4 },
        { departmentId: postDept.docs[0].id, name: 'SOUND_ENGINEER', displayName: 'Sound Engineer', level: 'LEAD', hourlyRateRange: '60-110', order: 5 },
        
        // Camera roles
        { departmentId: cameraDept.docs[0].id, name: 'DIRECTOR_OF_PHOTOGRAPHY', displayName: 'Director of Photography', level: 'LEAD', hourlyRateRange: '80-160', order: 1 },
        { departmentId: cameraDept.docs[0].id, name: 'CAMERA_OPERATOR', displayName: 'Camera Operator', level: 'CREW', hourlyRateRange: '45-85', order: 2 },
        { departmentId: cameraDept.docs[0].id, name: 'FIRST_AC', displayName: 'First Assistant Camera', level: 'CREW', hourlyRateRange: '40-75', order: 3 },
        { departmentId: cameraDept.docs[0].id, name: 'SECOND_AC', displayName: 'Second Assistant Camera', level: 'ASSISTANT', hourlyRateRange: '30-55', order: 4 }
      ];
      
      for (const role of roles) {
        await roleRef.add({
          ...role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      logger.info(`✅ Created ${roles.length} production roles`);
    }
  }
}

async function ensureStages() {
  const stageRef = db.collection('stages');
  const existing = await stageRef.get();
  
  if (existing.empty) {
    const stages = [
      { name: 'Pre-Production', order: 1, description: 'Planning and preparation phase' },
      { name: 'Production', order: 2, description: 'Active filming/shooting phase' },
      { name: 'Post-Production', order: 3, description: 'Editing and finishing phase' },
      { name: 'Review', order: 4, description: 'Client review and approval phase' },
      { name: 'Delivery', order: 5, description: 'Final delivery and archiving phase' }
    ];
    
    for (const stage of stages) {
      await stageRef.add({
        ...stage,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    logger.info(`✅ Created ${stages.length} stages`);
  }
}

async function ensureSessionRoles() {
  const roleRef = db.collection('session_roles');
  const existing = await roleRef.get();
  
  if (existing.empty) {
    const roles = [
      { roleName: 'PRODUCER', department: 'Production' },
      { roleName: 'DIRECTOR', department: 'Production' },
      { roleName: 'DP', department: 'Camera' },
      { roleName: 'EDITOR', department: 'Post-Production' },
      { roleName: 'SOUND_MIXER', department: 'Sound' },
      { roleName: 'GAFFER', department: 'Electric' },
      { roleName: 'KEY_GRIP', department: 'Grip' },
      { roleName: 'ART_DIRECTOR', department: 'Art' },
      { roleName: 'WARDROBE_STYLIST', department: 'Wardrobe' },
      { roleName: 'MAKEUP_ARTIST', department: 'Makeup' }
    ];
    
    for (const role of roles) {
      await roleRef.add({
        ...role,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    logger.info(`✅ Created ${roles.length} session roles`);
  }
}

async function ensureCutTypes() {
  const cutTypeRef = db.collection('cut_types');
  const existing = await cutTypeRef.get();
  
  if (existing.empty) {
    const cutTypes = [
      { cutTypeName: 'ROUGH_CUT', description: 'Initial rough assembly of footage' },
      { cutTypeName: 'FINE_CUT', description: 'Refined edit with timing and pacing' },
      { cutTypeName: 'FINAL_CUT', description: 'Final approved version for delivery' },
      { cutTypeName: 'DIRECTOR_CUT', description: 'Director\'s preferred version' },
      { cutTypeName: 'PRODUCER_CUT', description: 'Producer\'s preferred version' },
      { cutTypeName: 'NETWORK_CUT', description: 'Network/broadcaster version' },
      { cutTypeName: 'INTERNATIONAL_CUT', description: 'International distribution version' }
    ];
    
    for (const cutType of cutTypes) {
      await cutTypeRef.add({
        ...cutType,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    logger.info(`✅ Created ${cutTypes.length} cut types`);
  }
}

async function ensureTimecardTemplates() {
  const templateRef = db.collection('timecard_templates');
  const existing = await templateRef.get();
  
  if (existing.empty) {
    // Get a user to assign as creator
    const usersRef = db.collection('users');
    const adminUser = await usersRef.where('role', '==', 'SUPERADMIN').limit(1).get();
    
    if (!adminUser.empty) {
      const creatorId = adminUser.docs[0].id;
      
      const templates = [
        {
          name: 'Standard Production',
          description: 'Standard 8-hour production day template',
          standardHoursPerDay: 8.0,
          overtimeThreshold: 8.0,
          doubleTimeThreshold: 12.0,
          overtimeMultiplier: 1.5,
          doubleTimeMultiplier: 2.0,
          mealBreakRequired: true,
          mealBreakThreshold: 6.0,
          mealPenaltyHours: 1.0,
          minimumTurnaround: 10.0,
          hourlyRate: 0.0,
          enableEscalation: true,
          createdBy: creatorId
        },
        {
          name: 'Post Production',
          description: 'Post-production workflow template',
          standardHoursPerDay: 8.0,
          overtimeThreshold: 8.0,
          doubleTimeThreshold: 12.0,
          overtimeMultiplier: 1.5,
          doubleTimeMultiplier: 2.0,
          mealBreakRequired: true,
          mealBreakThreshold: 6.0,
          mealPenaltyHours: 1.0,
          minimumTurnaround: 8.0,
          hourlyRate: 0.0,
          enableEscalation: true,
          createdBy: creatorId
        },
        {
          name: 'Overtime Heavy',
          description: 'Template for overtime-heavy productions',
          standardHoursPerDay: 10.0,
          overtimeThreshold: 10.0,
          doubleTimeThreshold: 14.0,
          overtimeMultiplier: 1.5,
          doubleTimeMultiplier: 2.0,
          mealBreakRequired: true,
          mealBreakThreshold: 6.0,
          mealPenaltyHours: 1.0,
          minimumTurnaround: 12.0,
          hourlyRate: 0.0,
          enableEscalation: true,
          createdBy: creatorId
        }
      ];
      
      for (const template of templates) {
        await templateRef.add({
          ...template,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      logger.info(`✅ Created ${templates.length} timecard templates`);
    }
  }
}

async function main() {
  try {
    await restoreFromPrismaSchema();
    logger.info('🎉 Prisma schema-based restoration completed successfully!');
    
    // Summary
    const collections = await getExistingCollections();
    logger.info(`📊 Total collections: ${collections.length}`);
    logger.info(`📊 Essential collections covered: ${ESSENTIAL_COLLECTIONS.length}`);
    
    const missingCollections = ESSENTIAL_COLLECTIONS.filter(
      collection => !collections.includes(collection)
    );
    
    if (missingCollections.length > 0) {
      logger.warn(`⚠️ Missing collections: ${missingCollections.join(', ')}`);
    } else {
      logger.info('✅ All essential collections are present!');
    }
    
  } catch (error) {
    logger.error('💥 Prisma schema restoration failed:', error);
    process.exit(1);
  }
}

main();
