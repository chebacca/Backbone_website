#!/bin/bash

# Create critical Firestore indexes for the app
# This script creates the most essential indexes needed for basic functionality

set -e

PROJECT_ID=${FIREBASE_PROJECT_ID:-"backbone-logic"}
echo "🔧 Creating critical Firestore indexes for project: $PROJECT_ID"

# Function to create an index with proper field ordering
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

echo "🚀 Starting index creation (ASYNC mode - much faster!)..."
echo "📝 Indexes will be created in background - check status later"

# User Management - Critical for authentication and user queries
create_index "users" "status,lastActive" "DESC"
create_index "users" "role,createdAt" "ASC"
create_index "user_settingss" "userId,createdAt" "DESC"

# Production Management - Core business logic
create_index "production_sessions" "status,createdAt" "DESC"
create_index "production_sessions" "phase,createdAt" "DESC"
create_index "production_tasks" "sessionId,status" "ASC"
create_index "production_tasks" "assignedUserId,status" "ASC"
create_index "production_departments" "category,isActive" "ASC"
create_index "production_roles" "departmentId,isActive" "ASC"

# Session Management - Essential for workflow
create_index "session_assignments" "sessionId,userId" "ASC"
create_index "session_assignments" "roleId,createdAt" "ASC"
create_index "stages" "order" "ASC"
create_index "session_elements" "sessionId,elementType" "ASC"
create_index "session_elements" "createdByUserId,createdAt" "DESC"

# Project Management - Collaboration features
create_index "projects" "ownerId,isActive" "ASC"
create_index "projects" "visibility,isArchived" "ASC"
create_index "project_participants" "projectId,userId" "ASC"
create_index "project_participants" "role,isActive" "ASC"

# QC and Review - Quality control system
create_index "qc_statuses" "sessionId,qcType" "ASC"
create_index "qc_sessions" "qcStatusId,status" "ASC"
create_index "qc_sessions" "assignedToUserId,status" "ASC"
create_index "review_sessions" "sessionId,reviewStage" "ASC"
create_index "review_assignments" "reviewSessionId,assignedUserId" "ASC"

# Time Management - Critical for production
create_index "user_time_cards" "userId,date" "DESC"
create_index "user_time_cards" "status,approvedBy" "ASC"
create_index "timecard_templates" "isActive,department" "ASC"
create_index "timecard_approval_flows" "timecardId,currentStep" "ASC"

# Inventory Management - Asset tracking
create_index "inventory_items" "department,status" "ASC"
create_index "inventory_items" "assignedTo,createdById" "ASC"
create_index "inventory_histories" "inventoryId,timestamp" "DESC"

# Media Management - File handling
create_index "media_files" "uploadedBy,fileType" "ASC"
create_index "media_files" "fileName,uploadedAt" "DESC"
create_index "media_files" "status,category" "ASC"

# Communication - Messaging system
create_index "chats" "type,isArchived" "ASC"
create_index "chat_participants" "chatId,userId" "ASC"
create_index "messages" "chatId,createdAt" "DESC"
create_index "session_messages" "messageSessionId,timestamp" "DESC"

# Financial - Billing and invoicing
create_index "invoices" "userId,status" "ASC"
create_index "invoices" "issueDate,dueDate" "ASC"
create_index "payments" "userId,createdAt" "DESC"

# Legacy collections that already have some indexes
create_index "activities" "userId,createdAt" "DESC"
create_index "activities" "projectId,createdAt" "DESC"
create_index "audit_log" "projectId,createdAt" "DESC"
create_index "audit_log" "userId,createdAt" "DESC"
create_index "notifications" "userId,read" "ASC"
create_index "notifications" "type,createdAt" "DESC"

echo "✅ Critical index creation completed!"
echo ""
echo "📊 Next steps:"
echo "1. Check index status: gcloud firestore indexes composite list --project=$PROJECT_ID"
echo "2. Monitor index building progress in Firebase Console"
echo "3. Create additional indexes as needed based on app usage patterns"
echo ""
echo "⚠️  Note: Indexes take time to build. Some queries may fail until indexes are ready."
echo "🚀 Using --async mode means indexes are queued for creation but not yet built."
