#!/bin/bash

# 🔧 Overview Page License Count Fix - Deployment Script
# This script deploys the fix for the Overview page license count discrepancy

set -e  # Exit on any error

echo "🚀 Starting Overview Page License Count Fix Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Please run this script from the dashboard-v14-licensing-website 2 directory."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI not found. Please install it first: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged into Firebase
if ! firebase projects:list &> /dev/null; then
    print_warning "Not logged into Firebase. Please run 'firebase login' first."
    firebase login
fi

print_status "Building project with license count fix..."

# Build the project
if pnpm run build; then
    print_success "Project built successfully with license count fix"
else
    print_error "Build failed. Please check for errors and try again."
    exit 1
fi

print_status "Deploying to Firebase hosting..."

# Deploy to Firebase hosting
if firebase deploy --only hosting:main; then
    print_success "Deployment completed successfully!"
else
    print_error "Deployment failed. Please check Firebase console for errors."
    exit 1
fi

print_status "Waiting for deployment to propagate..."

# Wait a moment for deployment to propagate
sleep 15

echo ""
print_success "🎉 License Count Fix Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open your app: https://backbone-logic.web.app"
echo "2. Navigate to the Overview page"
echo "3. Check that 'Active Licenses' now shows the correct count (should be 2)"
echo "4. Compare with the Licenses page to verify consistency"
echo "5. Check browser console for license fetching logs"
echo ""
echo "🔍 Verification Steps:"
echo "1. Overview page should show '2 Active Licenses' instead of '0'"
echo "2. License counts should match between Overview and Licenses pages"
echo "3. Browser console should show detailed license fetching logs"
echo "4. License utilization percentage should be accurate"
echo ""
echo "🐛 Troubleshooting:"
echo "- If still showing 0 licenses, check browser console for errors"
echo "- Verify user has proper permissions and licenses are assigned"
echo "- Clear browser cache and refresh the page"
echo "- Check if all license fetching methods are working"
echo ""
echo "📚 Documentation: OVERVIEW_LICENSE_COUNT_FIX.md"
echo ""
echo "✅ Expected Results:"
echo "- Active Licenses: 2 (instead of 0)"
echo "- Total Licenses: Should match Licenses page"
echo "- License Utilization: Accurate percentage based on assigned licenses"
echo "- Real-time Updates: License changes should reflect immediately"
echo ""
