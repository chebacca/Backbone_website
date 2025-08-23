#!/bin/bash

# Create Firestore indexes in efficient batches
# This script creates indexes much faster by batching operations

set -e

PROJECT_ID=${FIREBASE_PROJECT_ID:-"backbone-logic"}
echo "🚀 Creating Firestore indexes in efficient batches for project: $PROJECT_ID"

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

echo "🚀 Starting efficient batch index creation..."

# Batch 1: Core User & Authentication (10 indexes)
echo "📦 Creating Batch 1: Core User & Authentication..."
create_batch_indexes "Core User & Authentication" \
    "custom_roles|name|ASC" \
    "custom_roles|category,hierarchy|ASC" \
    "user_groups|name|ASC" \
    "user_group_memberships|userId|ASC" \
    "user_group_memberships|userGroupId|ASC" \
    "production_sessions|isArchived,createdAt|DESC" \
    "production_stages|sessionId,stageOrder|ASC" \
    "production_task_assignees|taskId,userId|ASC" \
    "production_crew_members|userId,status|ASC" \
    "session_archives|sessionId,archivedAt|DESC"

# Batch 2: Session Management (10 indexes)
echo "📦 Creating Batch 2: Session Management..."
create_batch_indexes "Session Management" \
    "session_files|sessionId,uploadDate|DESC" \
    "session_element_files|elementId,fileType|ASC" \
    "session_element_reviews|elementId,reviewerUserId|ASC" \
    "session_element_activities|elementId,activityType|ASC" \
    "session_element_dependencies|elementId,dependencyType|ASC" \
    "session_message_reads|messageId,userId|ASC" \
    "session_message_participants|messageSessionId,userId|ASC" \
    "workflow_diagrams|userId,createdAt|DESC" \
    "workflow_diagrams|isTemplate,category|ASC" \
    "unified_workflow_instances|sessionId,workflowPhase|ASC"

# Batch 3: Workflow & Projects (10 indexes)
echo "📦 Creating Batch 3: Workflow & Projects..."
create_batch_indexes "Workflow & Projects" \
    "unified_workflow_instances|status,isActive|ASC" \
    "unified_session_assignments|sessionId,userId|ASC" \
    "unified_session_assignments|assignmentType,isLead|ASC" \
    "unified_session_steps|workflowInstanceId,order|ASC" \
    "unified_session_steps|status,priority|ASC" \
    "unified_session_steps|assignedUserId,status|ASC" \
    "unified_step_events|stepId,timestamp|DESC" \
    "unified_step_progressions|stepId,currentStatus|ASC" \
    "unified_step_progressions|sessionId,lastActivityAt|DESC" \
    "workflow_assignments|sessionId,workflowPhase|ASC"

# Batch 4: Project Management (10 indexes)
echo "📦 Creating Batch 4: Project Management..."
create_batch_indexes "Project Management" \
    "workflow_assignments|status,assignedAt|DESC" \
    "project_team_members|projectId,teamMemberId|ASC" \
    "project_team_members|isActive,assignedAt|ASC" \
    "project_activities|projectId,createdAt|DESC" \
    "collaboration_invitations|projectId,status|ASC" \
    "collaboration_invitations|inviteeEmail,expiresAt|ASC" \
    "realtime_presence|projectId,userId|ASC" \
    "realtime_presence|status,lastActivity|DESC" \
    "saved_project_paths|userId,lastAccessed|DESC" \
    "saved_project_paths|isFavorite,accessCount|DESC"

# Batch 5: QC & Review (10 indexes)
echo "📦 Creating Batch 5: QC & Review..."
create_batch_indexes "QC & Review" \
    "qc_checklist_items|qcSessionId,category|ASC" \
    "qc_checklist_items|status,order|ASC" \
    "qc_findings|qcSessionId,severity|ASC" \
    "qc_findings|status,category|ASC" \
    "qc_reports|sessionId,reportType|ASC" \
    "qc_reports|overallResult,generatedAt|DESC" \
    "qc_activities|qcSessionId,activityType|ASC" \
    "qc_activities|performedAt,performedByUserId|DESC" \
    "review_sections|reviewSessionId,assignedToUserId|ASC" \
    "review_sections|status,createdAt|ASC"

echo "✅ All batches completed!"
echo ""
echo "📊 Next steps:"
echo "1. Check total index count: gcloud firestore indexes composite list --project=$PROJECT_ID | wc -l"
echo "2. Monitor index building progress in Firebase Console"
echo "3. All indexes are now queued for creation in parallel!"
echo ""
echo "🚀 Using batch processing and --async mode for maximum efficiency!"
