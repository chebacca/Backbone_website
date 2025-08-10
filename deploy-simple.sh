#!/bin/bash

# Simple Deployment Script for Dashboard v14 Licensing Website
# This script builds and deploys core services (hosting, functions, firestore, storage)

set -e  # Exit on any error

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Dashboard v14 Quick Deploy${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    print_error "This doesn't appear to be the project root directory."
    print_error "Please run this script from the project root (where package.json and firebase.json are located)."
    exit 1
fi

print_success "Project directory confirmed"

# Build all components
print_status "Building all components..."

print_status "Building shared types..."
cd shared && pnpm build && cd ..
print_success "Shared build completed"

print_status "Building client..."
pnpm build:client
print_success "Client build completed"

print_status "Building server..."
cd server && pnpm build && cd ..
print_success "Server build completed"

print_success "All builds completed successfully"

# Deploy to Firebase (core services only)
print_status "Deploying to Firebase (core services)..."

print_status "Deploying hosting..."
firebase deploy --only hosting
print_success "Hosting deployed"

print_status "Deploying functions..."
firebase deploy --only functions
print_success "Functions deployed"

print_status "Deploying Firestore rules and indexes..."
firebase deploy --only firestore
print_success "Firestore deployed"

print_status "Deploying storage rules..."
firebase deploy --only storage
print_success "Storage deployed"

print_success "🎉 Core deployment completed successfully!"
echo ""
echo -e "${GREEN}Your Dashboard v14 Licensing Website is now live!${NC}"
echo ""
echo -e "${BLUE}Deployed services:${NC}"
echo "✅ Frontend Hosting: https://backbone-logic.web.app"
echo "✅ Cloud Functions: https://api-oup5qxogca-uc.a.run.app"
echo "✅ Firestore Database: Configured with rules"
echo "✅ Storage: Configured with rules"
echo ""
echo -e "${YELLOW}Note:${NC} Data Connect was skipped due to database schema compatibility issues."
echo "If you need Data Connect, run: firebase dataconnect:sql:setup"
