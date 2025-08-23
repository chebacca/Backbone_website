#!/bin/bash

# Clean up duplicate Firestore indexes and recreate them properly
# This script removes all existing indexes and recreates clean, non-duplicate ones

set -e

PROJECT_ID=${FIREBASE_PROJECT_ID:-"backbone-logic"}
echo "🧹 Cleaning up duplicate Firestore indexes for project: $PROJECT_ID"

echo "📊 Current index count:"
gcloud firestore indexes composite list --project=$PROJECT_ID | wc -l

echo ""
echo "⚠️  WARNING: This will delete ALL existing composite indexes!"
echo "   This is necessary to remove duplicates and create clean indexes."
echo ""

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo "🚀 Starting cleanup..."

# Get all index names and delete them
echo "🗑️  Deleting all existing composite indexes..."
gcloud firestore indexes composite list --project=$PROJECT_ID --format="value(name)" | while read index_name; do
    if [ ! -z "$index_name" ]; then
        echo "   Deleting: $index_name"
        gcloud firestore indexes composite delete "$index_name" --project=$PROJECT_ID --quiet || echo "   Failed to delete: $index_name"
    fi
done

echo ""
echo "✅ Cleanup completed!"
echo "📊 New index count:"
gcloud firestore indexes composite list --project=$PROJECT_ID | wc -l

echo ""
echo "🎯 Next steps:"
echo "1. Run the critical indexes script: ./scripts/create-critical-indexes.sh"
echo "2. Run the remaining indexes script: ./scripts/create-remaining-indexes.sh"
echo "3. Verify no duplicates exist"
echo ""
echo "💡 This will give you clean, non-redundant indexes!"
