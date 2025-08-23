#!/bin/bash

# Create precisely the composite indexes required by app query patterns
# Derived from client code in licensing website and dashboard adapters/bridge

set -e

PROJECT_ID=${FIREBASE_PROJECT_ID:-"backbone-logic"}
echo "🔧 Creating app-required Firestore indexes for project: $PROJECT_ID"

create_index() {
	local collection=$1
	local fields=$2
	local order=$3
	
	echo "📝 Creating index for $collection: [$fields] $order"
	local cmd="gcloud firestore indexes composite create"
	cmd="$cmd --collection-group=\"$collection\""
	cmd="$cmd --query-scope=COLLECTION"
	IFS=',' read -ra FIELD_ARRAY <<< "$fields"
	if [ "$order" = "DESC" ]; then
		cmd="$cmd --field-config=field-path=${FIELD_ARRAY[0]},order=descending"
	else
		cmd="$cmd --field-config=field-path=${FIELD_ARRAY[0]},order=ascending"
	fi
	for ((i=1; i<${#FIELD_ARRAY[@]}; i++)); do
		cmd="$cmd --field-config=field-path=${FIELD_ARRAY[i]},order=ascending"
	done
	cmd="$cmd --project=\"$PROJECT_ID\" --async --quiet"
	eval $cmd || echo "⚠️  Index creation failed (may already exist)"
}

echo "🚀 Queueing indexes (async)..."

# Licensing website: org members listing with ordering
# org_members: orgId ==, status ==, orderBy createdAt desc
create_index "org_members" "orgId,status,createdAt" "DESC"

# Licensing website: projects by owner with active+not archived
# projects: ownerId ==, isActive ==, isArchived ==
create_index "projects" "ownerId,isActive,isArchived" "ASC"

# Dashboard bridge: projects by id IN with active filters
# projects: id in [...], isActive ==, isArchived ==
create_index "projects" "id,isActive,isArchived" "ASC"

# Dashboard bridge: participant lookup by userId + active
create_index "project_participants" "userId,isActive" "ASC"

# Dashboard bridge: team members by project + active
create_index "projectTeamMembers" "projectId,isActive" "ASC"

# Licensing website: org_members by user for organizations list
create_index "org_members" "userId,status" "ASC"

# Licensing website: projectTeamMembers by project+teamMember (already exists in many envs)
create_index "projectTeamMembers" "projectId,teamMemberId" "ASC"

# Safety: messages by chatId + createdAt desc (common UI list)
create_index "messages" "chatId,createdAt" "DESC"

# Safety: invoices queries by userId + status (billing screens)
create_index "invoices" "userId,status" "ASC"

# Safety: org_members sort by createdAt alone often combined with equality
create_index "org_members" "orgId,createdAt" "DESC"

echo "✅ App-required index creation queued."

echo "📊 Check status: gcloud firestore indexes composite list --project=$PROJECT_ID | wc -l"
