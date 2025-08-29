#!/bin/bash

echo "🔒 Deploying Enhanced Firestore Security Rules for Tenant Isolation..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Get current project
CURRENT_PROJECT=$(firebase use --project)
echo "📍 Current Firebase project: $CURRENT_PROJECT"

# Backup existing rules
echo "📦 Backing up existing Firestore rules..."
firebase firestore:rules:get > firestore.rules.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No existing rules to backup"

# Deploy new security rules
echo "🚀 Deploying new Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore security rules deployed successfully!"
    echo ""
    echo "🔒 Enhanced Security Features:"
    echo "  • Dataset isolation by organization"
    echo "  • Project isolation by organization"
    echo "  • Team member access control"
    echo "  • Cross-tenant access prevention"
    echo "  • Audit logging protection"
    echo ""
    echo "🛡️  Security Validation:"
    echo "  • Users can only see datasets from their organization"
    echo "  • Dataset assignment requires same organization"
    echo "  • Project access is organization-scoped"
    echo "  • All operations are logged for audit"
    echo ""
    echo "⚠️  IMPORTANT: Test the application to ensure all functionality works correctly"
    echo "   with the new security rules before deploying to production."
else
    echo "❌ Failed to deploy Firestore security rules!"
    echo "Please check the rules syntax and try again."
    exit 1
fi
