#!/bin/bash

# 🔐 Firebase CSP Authentication Fix - Deployment Script
# This script deploys the CSP fixes for Firebase authentication iframe loading

set -e  # Exit on any error

echo "🚀 Starting Firebase CSP Authentication Fix Deployment..."

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

print_status "Building project with CSP fixes..."

# Build the project
if pnpm run build; then
    print_success "Project built successfully"
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

print_status "Verifying CSP headers..."

# Wait a moment for deployment to propagate
sleep 10

# Check CSP headers
CSP_HEADER=$(curl -s -I https://backbone-logic.web.app | grep -i "content-security-policy" || echo "No CSP header found")

if [[ $CSP_HEADER == *"frame-src"* ]] && [[ $CSP_HEADER == *"firebaseapp.com"* ]]; then
    print_success "CSP headers verified successfully!"
    print_status "frame-src directive includes Firebase domains"
else
    print_warning "CSP headers may not be updated yet. This can take a few minutes to propagate."
    print_status "Current CSP header: $CSP_HEADER"
fi

echo ""
print_success "🎉 CSP Fix Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open your app: https://backbone-logic.web.app"
echo "2. Try to sign in with Google authentication"
echo "3. Check browser console for any remaining CSP errors"
echo "4. If issues persist, clear browser cache and try again"
echo ""
echo "🔍 Troubleshooting:"
echo "- Check browser console for CSP violations"
echo "- Verify authentication iframes load properly"
echo "- Monitor for any new CSP errors"
echo ""
echo "📚 Documentation: FIREBASE_CSP_AUTHENTICATION_FIX.md"
echo ""
