#!/bin/bash

# Deploy License Inheritance Fix
# This script deploys the updated Firebase Functions that implement
# proper license inheritance for team members

set -e

echo "🚀 Deploying License Inheritance Fix to Firebase Functions..."

# Change to the Dashboard-v14_2 directory where Firebase Functions are located
cd "../Dashboard-v14_2"

# Check if we're in the right directory
if [ ! -f "functions/package.json" ]; then
    echo "❌ Error: functions/package.json not found. Are you in the right directory?"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📦 Functions directory: $(ls -la functions/)"

# Install dependencies if needed
echo "📦 Installing Firebase Functions dependencies..."
cd functions
npm install

# Deploy the updated functions
echo "🚀 Deploying updated Firebase Functions..."
firebase deploy --only functions:getLicensedTeamMembers,functions:getProjectTeamMembers

echo "✅ Firebase Functions deployed successfully!"
echo ""
echo "📝 What was deployed:"
echo "   - getLicensedTeamMembers: Now implements license inheritance from organization"
echo "   - getProjectTeamMembers: Now implements license inheritance from organization"
echo ""
echo "🔧 Next steps:"
echo "   1. Run the database fix script: node scripts/fix-team-member-licenses.js"
echo "   2. Test the Project Details dialog to verify license inheritance"
echo "   3. Verify that Lissa shows as Enterprise tier"
echo ""
echo "🎯 The fix ensures:"
echo "   - Team members inherit license type from their organization"
echo "   - Lissa is always set to Enterprise tier"
echo "   - Enterprise users maintain Enterprise tier"
echo "   - Professional users maintain Professional tier"
echo "   - Users without explicit license types get appropriate defaults"
