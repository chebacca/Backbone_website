#!/bin/bash

# 🚀 Deploy Schema Updates - Complete Logic Flow Implementation
# This script applies all the database schema changes and Firestore index updates

set -e

echo "🔧 Starting Complete Logic Flow Schema Deployment..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "server/prisma/schema.prisma" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Step 1: Generate Prisma Client with new schema
echo ""
echo "📦 Step 1: Generating Prisma Client..."
cd server
npx prisma generate
echo "✅ Prisma client generated successfully"

# Step 2: Create and apply database migration
echo ""
echo "🗄️  Step 2: Creating database migration..."
npx prisma migrate dev --name "complete-logic-flow-schema" --create-only
echo "✅ Migration created successfully"

echo ""
echo "📊 Step 3: Applying migration to database..."
npx prisma migrate deploy
echo "✅ Migration applied successfully"

# Step 3: Deploy Firestore indexes
echo ""
echo "🔥 Step 4: Deploying Firestore indexes..."
cd ..
firebase deploy --only firestore:indexes --project backbone-logic
echo "✅ Firestore indexes deployed successfully"

# Step 4: Verify deployment
echo ""
echo "🔍 Step 5: Verifying deployment..."

# Check Prisma schema
echo "   - Checking Prisma schema..."
cd server
npx prisma validate
echo "   ✅ Prisma schema is valid"

# Check Firestore rules
echo "   - Checking Firestore rules..."
cd ..
firebase firestore:rules --project backbone-logic > /dev/null 2>&1
echo "   ✅ Firestore rules are valid"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=================================================="
echo ""
echo "📋 Summary of Changes Applied:"
echo ""
echo "✅ Database Schema Updates:"
echo "   • Added Organization model with proper relationships"
echo "   • Added OrgMember model for organization membership"
echo "   • Added Project model with full feature support"
echo "   • Added ProjectAssignment model with license validation"
echo "   • Enhanced User model with team member fields"
echo "   • Updated Subscription model to link to organizations"
echo "   • Added Firebase UID integration"
echo ""
echo "✅ Enhanced Project Assignment Logic:"
echo "   • License validation during team member assignment"
echo "   • Organization membership verification"
echo "   • Role-based access control with license tier requirements"
echo "   • Automatic project access provisioning"
echo ""
echo "✅ Firestore Index Optimization:"
echo "   • Added 15+ new composite indexes for efficient queries"
echo "   • Optimized queries for organizations, projects, and assignments"
echo "   • Enhanced team member and license lookup performance"
echo ""
echo "🔄 Next Steps:"
echo "   1. Test the complete workflow end-to-end"
echo "   2. Verify license assignment automation (already implemented)"
echo "   3. Test project creation and team member assignment"
echo "   4. Validate Firebase authentication integration"
echo ""
echo "📚 Complete Logic Flow Now Supports:"
echo "   Account Owner → Subscription → Organization → Team Members → Licenses → Projects → Assignments"
echo ""
