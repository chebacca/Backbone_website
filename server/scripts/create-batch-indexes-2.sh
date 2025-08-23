#!/bin/bash

# Create remaining Firestore indexes in efficient batches - Part 2
# This script continues from the first batch script for complete coverage

set -e

PROJECT_ID=${FIREBASE_PROJECT_ID:-"backbone-logic"}
echo "🚀 Creating remaining Firestore indexes in efficient batches - Part 2 for project: $PROJECT_ID"

# Function to create indexes in parallel batches
create_batch_indexes() {
    local batch_name=$1
    local indexes=("${@:2}")
    
    echo "📦 Creating batch: $batch_name (${#indexes[@]} indexes)"
    
    # Create all indexes in this batch concurrently
    for index_spec in "${indexes[@]}"; do
        IFS='|' read -r collection fields order <<< "$index_spec"
        
        # Build the gcloud command
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
        
        # Execute in background for parallel processing
        eval $cmd &
    done
    
    # Wait for all background jobs to complete
    wait
    echo "✅ Batch $batch_name completed!"
}

echo "🚀 Starting remaining batch index creation..."

# Batch 6: Call Sheets & Production (10 indexes)
echo "📦 Creating Batch 6: Call Sheets & Production..."
create_batch_indexes "Call Sheets & Production" \
    "call_sheets|projectName,date|DESC" \
    "call_sheets|status,isArchived|ASC" \
    "call_sheets|sessionId,nextDaySessionId|ASC" \
    "call_sheet_locations|callSheetId,order|ASC" \
    "call_sheet_personnel|callSheetId,assignmentType|ASC" \
    "call_sheet_personnel|userId,departmentId|ASC" \
    "call_sheet_department_call_times|callSheetId,departmentId|ASC" \
    "call_sheet_schedules|callSheetId,order|ASC" \
    "call_sheet_vendors|callSheetId,type|ASC" \
    "call_sheet_walkie_channels|callSheetId,order|ASC"

# Batch 7: Daily Call Sheets (10 indexes)
echo "📦 Creating Batch 7: Daily Call Sheets..."
create_batch_indexes "Daily Call Sheets" \
    "daily_call_sheet_records|templateCallSheetId,recordDate|DESC" \
    "daily_call_sheet_records|status,publishedAt|ASC" \
    "daily_call_sheet_locations|dailyCallSheetId,order|ASC" \
    "daily_call_sheet_personnel|dailyCallSheetId,assignmentType|ASC" \
    "daily_call_sheet_department_call_times|dailyCallSheetId,departmentId|ASC" \
    "daily_call_sheet_schedules|dailyCallSheetId,order|ASC" \
    "daily_call_sheet_vendors|dailyCallSheetId,type|ASC" \
    "daily_call_sheet_walkie_channels|dailyCallSheetId,order|ASC" \
    "pbm_projects|createdBy,status|ASC" \
    "pbm_projects|startDate,endDate|ASC"

# Batch 8: PBM & Time Management (10 indexes)
echo "📦 Creating Batch 8: PBM & Time Management..."
create_batch_indexes "PBM & Time Management" \
    "pbm_schedules|pbmProjectId,date|ASC" \
    "pbm_schedules|status,order|ASC" \
    "pbm_payscales|pbmProjectId,department|ASC" \
    "pbm_payscales|isActive,order|ASC" \
    "pbm_daily_statuses|pbmProjectId,payscaleId|ASC" \
    "pbm_daily_statuses|date,status|ASC" \
    "user_time_cards|sessionId,taskId|ASC" \
    "timecard_templates|role,createdBy|ASC" \
    "user_timecard_assignments|userId,templateId|ASC" \
    "user_timecard_assignments|isActive,effectiveDate|ASC"

# Batch 9: Time Management & Inventory (10 indexes)
echo "📦 Creating Batch 9: Time Management & Inventory..."
create_batch_indexes "Time Management & Inventory" \
    "timecard_configurations|userId,templateId|ASC" \
    "timecard_configurations|isActive,configurationType|ASC" \
    "user_direct_reports|employeeId,managerId|ASC" \
    "user_direct_reports|isActive,effectiveDate|ASC" \
    "timecard_assistance_dismissals|userId,alertId|ASC" \
    "inventory_items|type,subDepartment|ASC" \
    "inventory_assignment_histories|inventoryId,assignedAt|DESC" \
    "inventory_assignment_histories|assignedTo,returnedAt|ASC" \
    "schemas|isActive,isDefault|ASC" \
    "schema_fields|schemaId,order|ASC"

# Batch 10: Asset Setup & Network (10 indexes)
echo "📦 Creating Batch 10: Asset Setup & Network..."
create_batch_indexes "Asset Setup & Network" \
    "asset_setups|assetId,setupProfileId|ASC" \
    "setup_profiles|type,isActive|ASC" \
    "setup_checklists|setupProfileId,order|ASC" \
    "asset_setup_checklists|assetSetupId,checklistId|ASC" \
    "network_ip_assignments|assetId,ipAddress|ASC" \
    "network_ip_assignments|status,assignedAt|ASC" \
    "servers|inventoryItemId,status|ASC" \
    "servers|type,userId|ASC" \
    "media_files|sessionId,source|ASC" \
    "media_indexes|userId,path|ASC"

# Batch 11: Media Management (10 indexes)
echo "📦 Creating Batch 11: Media Management..."
create_batch_indexes "Media Management" \
    "media_indexes|isActive,lastIndexed|ASC" \
    "media_index_items|mediaIndexId,category|ASC" \
    "media_index_items|type,parentPath|ASC" \
    "media_index_items|name,checksum|ASC" \
    "media_file_tags|name,category|ASC" \
    "chat_participants|isAdmin,joinedAt|ASC" \
    "messages|userId,status|ASC" \
    "message_reads|messageId,userId|ASC" \
    "message_sessions|type,isArchived|ASC" \
    "message_participants|messageSessionId,userId|ASC"

# Batch 12: Communication & Portfolio (10 indexes)
echo "📦 Creating Batch 12: Communication & Portfolio..."
create_batch_indexes "Communication & Portfolio" \
    "session_messages|senderId,isRead|ASC" \
    "portfolios|userId,isDeleted|ASC" \
    "assets|portfolioId,type|ASC" \
    "asset_performances|assetId,date|DESC" \
    "asset_price_histories|assetId,timestamp|DESC" \
    "tax_lots|assetId,purchaseDate|ASC" \
    "portfolio_allocations|portfolioId,date|DESC" \
    "portfolio_performances|portfolioId,date|DESC" \
    "portfolio_tax_summaries|portfolioId,year|DESC" \
    "budgets|userId,startDate|ASC"

# Batch 13: Financial & Contact Management (10 indexes)
echo "📦 Creating Batch 13: Financial & Contact Management..."
create_batch_indexes "Financial & Contact Management" \
    "transactions|budgetId,date|DESC" \
    "invoice_payments|invoiceId,date|DESC" \
    "invoice_attachments|invoiceId,uploadDate|DESC" \
    "contacts|email,department|ASC" \
    "contact_groups|userId,name|ASC" \
    "contact_group_memberships|contactId,contactGroupId|ASC" \
    "agents|type,isActive|ASC" \
    "agent_memories|agentId,type|ASC" \
    "agent_function_logs|agentId,functionName|ASC" \
    "agent_function_logs|status,startTime|ASC"

# Batch 14: Automation & Research (10 indexes)
echo "📦 Creating Batch 14: Automation & Research..."
create_batch_indexes "Automation & Research" \
    "automation_alerts|alertId,sessionId|ASC" \
    "automation_alerts|acknowledgedByUserId,acknowledgedAt|ASC" \
    "automation_alerts|alertType,urgencyLevel|ASC" \
    "lifecycle_rules|isActive,priority|ASC" \
    "lifecycle_rules|triggerType,triggerEvent|ASC" \
    "automation_executions|ruleId,sessionId|ASC" \
    "automation_executions|status,triggeredAt|ASC" \
    "research_sessions|userId,createdAt|DESC" \
    "scheduler_events|userId,date|ASC" \
    "scheduler_events|eventType,isReminder|ASC"

# Batch 15: Scheduling & Notes (10 indexes)
echo "📦 Creating Batch 15: Scheduling & Notes..."
create_batch_indexes "Scheduling & Notes" \
    "scheduler_event_assignments|eventId,userId|ASC" \
    "scheduler_event_assignments|status,assignedAt|ASC" \
    "scheduler_tasks|userId,dueDate|ASC" \
    "scheduler_tasks|status,isRecurring|ASC" \
    "notes|category,isArchived|ASC" \
    "notes|isFavorite,lastEdited|DESC" \
    "reports|userId,type|ASC" \
    "reports|status,createdAt|ASC" \
    "user_memory_profiles|memoryEnabled,lastMemoryOptimization|ASC" \
    "conversation_patterns|userId,patternType|ASC"

# Batch 16: AI & Memory Features (10 indexes)
echo "📦 Creating Batch 16: AI & Memory Features..."
create_batch_indexes "AI & Memory Features" \
    "conversation_patterns|category,lastObserved|DESC" \
    "domain_knowledge|userId,domain|ASC" \
    "domain_knowledge|importance,lastAccessed|DESC" \
    "relationship_anchors|userId,anchorType|ASC" \
    "relationship_anchors|strength,lastInteraction|DESC" \
    "memory_slots|userId,slotType|ASC" \
    "memory_slots|importance,isProtected|ASC" \
    "memory_system_metrics|userId,metricDate|DESC" \
    "memory_system_metrics|metricType,metricValue|ASC" \
    "system_assets|tenantId,type|ASC"

# Batch 17: System & Infrastructure (10 indexes)
echo "📦 Creating Batch 17: System & Infrastructure..."
create_batch_indexes "System & Infrastructure" \
    "websocket_servers|host,port|ASC" \
    "websocket_sessions|server_id,user_id|ASC" \
    "websocket_sessions|user_id,created_at|DESC" \
    "cut_approvals|sessionId,cutTypeId|ASC" \
    "cut_approvals|status,approvedAt|ASC" \
    "usage_analytics|userId,feature|ASC" \
    "usage_analytics|timestamp,action|DESC" \
    "sdk_versions|version,platform|ASC" \
    "privacy_consents|userId,consentType|ASC" \
    "organizations|name,status|ASC"

# Batch 18: Organization & Team Management (10 indexes)
echo "📦 Creating Batch 18: Organization & Team Management..."
create_batch_indexes "Organization & Team Management" \
    "orgMembers|organizationId,role|ASC" \
    "org_members|organizationId,userId|ASC" \
    "teamMembers|teamId,role|ASC" \
    "projectTeamMembers|projectId,teamMemberId|ASC" \
    "license_delivery_logs|licenseId,deliveryDate|DESC" \
    "webhook_events|webhookId,status|ASC" \
    "review_session_reviewers|reviewSessionId,userId|ASC" \
    "review_file_paths|reviewSessionId,uploadedAt|DESC" \
    "review_approvals|reviewSessionId,approverUserId|ASC" \
    "review_notes|reviewSessionId,priority|ASC"

echo "✅ All remaining batches completed!"
echo ""
echo "📊 Final status:"
echo "1. Check total index count: gcloud firestore indexes composite list --project=$PROJECT_ID | wc -l"
echo "2. Monitor index building progress in Firebase Console"
echo "3. All indexes are now queued for creation in parallel!"
echo ""
echo "🎯 Your database should now have COMPLETE query coverage!"
echo "🚀 Using batch processing and --async mode for maximum efficiency!"
