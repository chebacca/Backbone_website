#!/bin/bash

# Create remaining Firestore indexes for complete app coverage
# This script covers indexes not included in the critical indexes script

set -e

PROJECT_ID=${FIREBASE_PROJECT_ID:-"backbone-logic"}
echo "🔧 Creating remaining Firestore indexes for project: $PROJECT_ID"

# Function to create an index
create_index() {
    local collection=$1
    local fields=$2
    local order=$3
    
    echo "📝 Creating index for $collection: [$fields] $order"
    
    # Build the gcloud command with proper field-config syntax
    local cmd="gcloud firestore indexes composite create"
    cmd="$cmd --collection-group=\"$collection\""
    cmd="$cmd --query-scope=COLLECTION"
    
    # Convert fields to gcloud field-config format
    IFS=',' read -ra FIELD_ARRAY <<< "$fields"
    
    # First field with specified order
    if [ "$order" = "DESC" ]; then
        cmd="$cmd --field-config=field-path=${FIELD_ARRAY[0]},order=descending"
    else
        cmd="$cmd --field-config=field-path=${FIELD_ARRAY[0]},order=ascending"
    fi
    
    # Additional fields (always ascending for composite indexes)
    for ((i=1; i<${#FIELD_ARRAY[@]}; i++)); do
        cmd="$cmd --field-config=field-path=${FIELD_ARRAY[i]},order=ascending"
    done
    
    cmd="$cmd --project=\"$PROJECT_ID\" --async --quiet"
    
    # Execute the command
    eval $cmd || echo "⚠️  Index creation failed for $collection (may already exist)"
}

echo "🚀 Starting remaining index creation (ASYNC mode - much faster!)..."
echo "📝 Indexes will be created in background - check status later"

# Custom Roles and User Management
create_index "custom_roles" "name" "ASC"
create_index "custom_roles" "category,hierarchy" "ASC"
create_index "user_groups" "name" "ASC"
create_index "user_group_memberships" "userId" "ASC"
create_index "user_group_memberships" "userGroupId" "ASC"

# Production Management - Additional indexes
create_index "production_sessions" "isArchived,createdAt" "DESC"
create_index "production_stages" "sessionId,stageOrder" "ASC"
create_index "production_task_assignees" "taskId,userId" "ASC"
create_index "production_crew_members" "userId,status" "ASC"

# Session Management - Additional indexes
create_index "session_archives" "sessionId,archivedAt" "DESC"
create_index "session_files" "sessionId,uploadDate" "DESC"
create_index "session_element_files" "elementId,fileType" "ASC"
create_index "session_element_reviews" "elementId,reviewerUserId" "ASC"
create_index "session_element_activities" "elementId,activityType" "ASC"
create_index "session_element_dependencies" "elementId,dependencyType" "ASC"
create_index "session_message_reads" "messageId,userId" "ASC"
create_index "session_message_participants" "messageSessionId,userId" "ASC"

# Workflow Management
create_index "workflow_diagrams" "userId,createdAt" "DESC"
create_index "workflow_diagrams" "isTemplate,category" "ASC"
create_index "unified_workflow_instances" "sessionId,workflowPhase" "ASC"
create_index "unified_workflow_instances" "status,isActive" "ASC"
create_index "unified_session_assignments" "sessionId,userId" "ASC"
create_index "unified_session_assignments" "assignmentType,isLead" "ASC"
create_index "unified_session_steps" "workflowInstanceId,order" "ASC"
create_index "unified_session_steps" "status,priority" "ASC"
create_index "unified_session_steps" "assignedUserId,status" "ASC"
create_index "unified_step_events" "stepId,timestamp" "DESC"
create_index "unified_step_progressions" "stepId,currentStatus" "ASC"
create_index "unified_step_progressions" "sessionId,lastActivityAt" "DESC"
create_index "workflow_assignments" "sessionId,workflowPhase" "ASC"
create_index "workflow_assignments" "status,assignedAt" "DESC"

# Project Management - Additional indexes
create_index "project_team_members" "projectId,teamMemberId" "ASC"
create_index "project_team_members" "isActive,assignedAt" "ASC"
create_index "project_activities" "projectId,createdAt" "DESC"
create_index "project_collaboration_settings" "projectId" "ASC"
create_index "collaboration_invitations" "projectId,status" "ASC"
create_index "collaboration_invitations" "inviteeEmail,expiresAt" "ASC"
create_index "realtime_presence" "projectId,userId" "ASC"
create_index "realtime_presence" "status,lastActivity" "DESC"
create_index "saved_project_paths" "userId,lastAccessed" "DESC"
create_index "saved_project_paths" "isFavorite,accessCount" "DESC"

# QC and Review - Additional indexes
create_index "qc_checklist_items" "qcSessionId,category" "ASC"
create_index "qc_checklist_items" "status,order" "ASC"
create_index "qc_findings" "qcSessionId,severity" "ASC"
create_index "qc_findings" "status,category" "ASC"
create_index "qc_reports" "sessionId,reportType" "ASC"
create_index "qc_reports" "overallResult,generatedAt" "DESC"
create_index "qc_activities" "qcSessionId,activityType" "ASC"
create_index "qc_activities" "performedAt,performedByUserId" "DESC"
create_index "review_sections" "reviewSessionId,assignedToUserId" "ASC"
create_index "review_sections" "status,createdAt" "ASC"
create_index "review_session_reviewers" "reviewSessionId,userId" "ASC"
create_index "review_file_paths" "reviewSessionId,uploadedAt" "DESC"
create_index "review_approvals" "reviewSessionId,approverUserId" "ASC"
create_index "review_notes" "reviewSessionId,priority" "ASC"
create_index "review_notes" "status,createdAt" "ASC"

# Call Sheets
create_index "call_sheets" "projectName,date" "DESC"
create_index "call_sheets" "status,isArchived" "ASC"
create_index "call_sheets" "sessionId,nextDaySessionId" "ASC"
create_index "call_sheet_locations" "callSheetId,order" "ASC"
create_index "call_sheet_personnel" "callSheetId,assignmentType" "ASC"
create_index "call_sheet_personnel" "userId,departmentId" "ASC"
create_index "call_sheet_department_call_times" "callSheetId,departmentId" "ASC"
create_index "call_sheet_schedules" "callSheetId,order" "ASC"
create_index "call_sheet_vendors" "callSheetId,type" "ASC"
create_index "call_sheet_walkie_channels" "callSheetId,order" "ASC"

# Daily Call Sheets
create_index "daily_call_sheet_records" "templateCallSheetId,recordDate" "DESC"
create_index "daily_call_sheet_records" "status,publishedAt" "ASC"
create_index "daily_call_sheet_locations" "dailyCallSheetId,order" "ASC"
create_index "daily_call_sheet_personnel" "dailyCallSheetId,assignmentType" "ASC"
create_index "daily_call_sheet_department_call_times" "dailyCallSheetId,departmentId" "ASC"
create_index "daily_call_sheet_schedules" "dailyCallSheetId,order" "ASC"
create_index "daily_call_sheet_vendors" "dailyCallSheetId,type" "ASC"
create_index "daily_call_sheet_walkie_channels" "dailyCallSheetId,order" "ASC"

# PBM (Production Business Management)
create_index "pbm_projects" "createdBy,status" "ASC"
create_index "pbm_projects" "startDate,endDate" "ASC"
create_index "pbm_schedules" "pbmProjectId,date" "ASC"
create_index "pbm_schedules" "status,order" "ASC"
create_index "pbm_payscales" "pbmProjectId,department" "ASC"
create_index "pbm_payscales" "isActive,order" "ASC"
create_index "pbm_daily_statuses" "pbmProjectId,payscaleId" "ASC"
create_index "pbm_daily_statuses" "date,status" "ASC"

# Time Management - Additional indexes
create_index "user_time_cards" "sessionId,taskId" "ASC"
create_index "timecard_templates" "role,createdBy" "ASC"
create_index "user_timecard_assignments" "userId,templateId" "ASC"
create_index "user_timecard_assignments" "isActive,effectiveDate" "ASC"
create_index "timecard_configurations" "userId,templateId" "ASC"
create_index "timecard_configurations" "isActive,configurationType" "ASC"
create_index "user_direct_reports" "employeeId,managerId" "ASC"
create_index "user_direct_reports" "isActive,effectiveDate" "ASC"
create_index "timecard_assistance_dismissals" "userId,alertId" "ASC"
create_index "timecard_assistance_dismissals" "dismissedAt" "DESC"

# Inventory Management - Additional indexes
create_index "inventory_items" "type,subDepartment" "ASC"
create_index "inventory_assignment_histories" "inventoryId,assignedAt" "DESC"
create_index "inventory_assignment_histories" "assignedTo,returnedAt" "ASC"
create_index "inventory_maps" "id" "ASC"

# Schema Management
create_index "schemas" "isActive,isDefault" "ASC"
create_index "schema_fields" "schemaId,order" "ASC"

# Asset Setup
create_index "asset_setups" "assetId,setupProfileId" "ASC"
create_index "setup_profiles" "type,isActive" "ASC"
create_index "setup_checklists" "setupProfileId,order" "ASC"
create_index "asset_setup_checklists" "assetSetupId,checklistId" "ASC"

# Network Management
create_index "network_ip_assignments" "assetId,ipAddress" "ASC"
create_index "network_ip_assignments" "status,assignedAt" "ASC"
create_index "servers" "inventoryItemId,status" "ASC"
create_index "servers" "type,userId" "ASC"

# Media Management - Additional indexes
create_index "media_files" "sessionId,source" "ASC"
create_index "media_indexes" "userId,path" "ASC"
create_index "media_indexes" "isActive,lastIndexed" "ASC"
create_index "media_index_items" "mediaIndexId,category" "ASC"
create_index "media_index_items" "type,parentPath" "ASC"
create_index "media_index_items" "name,checksum" "ASC"
create_index "media_file_tags" "name,category" "ASC"

# Communication - Additional indexes
create_index "chat_participants" "isAdmin,joinedAt" "ASC"
create_index "messages" "userId,status" "ASC"
create_index "message_reads" "messageId,userId" "ASC"
create_index "message_sessions" "type,isArchived" "ASC"
create_index "message_participants" "messageSessionId,userId" "ASC"
create_index "session_messages" "senderId,isRead" "ASC"

# Portfolio Management
create_index "portfolios" "userId,isDeleted" "ASC"
create_index "assets" "portfolioId,type" "ASC"
create_index "asset_performances" "assetId,date" "DESC"
create_index "asset_price_histories" "assetId,timestamp" "DESC"
create_index "tax_lots" "assetId,purchaseDate" "ASC"
create_index "portfolio_allocations" "portfolioId,date" "DESC"
create_index "portfolio_performances" "portfolioId,date" "DESC"
create_index "portfolio_tax_summaries" "portfolioId,year" "DESC"

# Financial Management - Additional indexes
create_index "budgets" "userId,startDate" "ASC"
create_index "transactions" "budgetId,date" "DESC"
create_index "invoice_items" "invoiceId" "ASC"
create_index "invoice_payments" "invoiceId,date" "DESC"
create_index "invoice_attachments" "invoiceId,uploadDate" "DESC"

# Contact Management
create_index "contacts" "email,department" "ASC"
create_index "contact_groups" "userId,name" "ASC"
create_index "contact_group_memberships" "contactId,contactGroupId" "ASC"

# Agent Management
create_index "agents" "type,isActive" "ASC"
create_index "agent_memories" "agentId,type" "ASC"
create_index "agent_function_logs" "agentId,functionName" "ASC"
create_index "agent_function_logs" "status,startTime" "ASC"

# Automation and Alerts
create_index "automation_alerts" "alertId,sessionId" "ASC"
create_index "automation_alerts" "acknowledgedByUserId,acknowledgedAt" "ASC"
create_index "automation_alerts" "alertType,urgencyLevel" "ASC"
create_index "automation_acknowledgments" "alertId" "ASC"
create_index "lifecycle_rules" "isActive,priority" "ASC"
create_index "lifecycle_rules" "triggerType,triggerEvent" "ASC"
create_index "automation_executions" "ruleId,sessionId" "ASC"
create_index "automation_executions" "status,triggeredAt" "ASC"

# Research and Scheduling
create_index "research_sessions" "userId,createdAt" "DESC"
create_index "scheduler_events" "userId,date" "ASC"
create_index "scheduler_events" "eventType,isReminder" "ASC"
create_index "scheduler_event_assignments" "eventId,userId" "ASC"
create_index "scheduler_event_assignments" "status,assignedAt" "ASC"
create_index "scheduler_tasks" "userId,dueDate" "ASC"
create_index "scheduler_tasks" "status,isRecurring" "ASC"

# Notes and Reports
create_index "notes" "category,isArchived" "ASC"
create_index "notes" "isFavorite,lastEdited" "DESC"
create_index "reports" "userId,type" "ASC"
create_index "reports" "status,createdAt" "ASC"

# Memory and AI Features
create_index "user_memory_profiles" "memoryEnabled,lastMemoryOptimization" "ASC"
create_index "conversation_patterns" "userId,patternType" "ASC"
create_index "conversation_patterns" "category,lastObserved" "DESC"
create_index "domain_knowledge" "userId,domain" "ASC"
create_index "domain_knowledge" "importance,lastAccessed" "DESC"
create_index "relationship_anchors" "userId,anchorType" "ASC"
create_index "relationship_anchors" "strength,lastInteraction" "DESC"
create_index "memory_slots" "userId,slotType" "ASC"
create_index "memory_slots" "importance,isProtected" "ASC"
create_index "memory_system_metrics" "userId,metricDate" "DESC"
create_index "memory_system_metrics" "metricType,metricValue" "ASC"

# System and Infrastructure
create_index "system_assets" "tenantId,type" "ASC"
create_index "tenant_storage_usages" "tenantId" "ASC"
create_index "websocket_servers" "host,port" "ASC"
create_index "websocket_sessions" "server_id,user_id" "ASC"
create_index "websocket_sessions" "user_id,created_at" "DESC"

# Cut Approvals
create_index "cut_approvals" "sessionId,cutTypeId" "ASC"
create_index "cut_approvals" "status,approvedAt" "ASC"
create_index "cut_types" "cutTypeName" "ASC"

# Usage Analytics
create_index "usage_analytics" "userId,feature" "ASC"
create_index "usage_analytics" "timestamp,action" "DESC"

# SDK and Version Management
create_index "sdk_versions" "version,platform" "ASC"

# Privacy and Compliance
create_index "privacy_consents" "userId,consentType" "ASC"

# Organization Management
create_index "organizations" "name,status" "ASC"
create_index "orgMembers" "organizationId,role" "ASC"
create_index "org_members" "organizationId,userId" "ASC"

# Team Management
create_index "teamMembers" "teamId,role" "ASC"
create_index "projectTeamMembers" "projectId,teamMemberId" "ASC"

# License Management
create_index "license_delivery_logs" "licenseId,deliveryDate" "DESC"

# Webhook Management
create_index "webhook_events" "webhookId,status" "ASC"

echo "✅ Remaining index creation completed!"
echo ""
echo "📊 Next steps:"
echo "1. Check total index count: gcloud firestore indexes composite list --project=$PROJECT_ID | wc -l"
echo "2. Monitor index building progress in Firebase Console"
echo "3. All indexes are now queued for creation - they will build in parallel!"
echo ""
echo "🚀 Using --async mode means all indexes are queued and building in background."
echo "🎯 Your app should now have comprehensive query coverage!"
