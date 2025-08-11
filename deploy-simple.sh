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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check Firebase CLI version
check_firebase_version() {
    print_status "Checking Firebase CLI version..."
    FIREBASE_VERSION=$(firebase --version)
    print_success "Firebase CLI version: $FIREBASE_VERSION"
    
    # Check if version is recent enough
    if [[ "$FIREBASE_VERSION" == *"13."* ]] || [[ "$FIREBASE_VERSION" == *"14."* ]] || [[ "$FIREBASE_VERSION" == *"15."* ]]; then
        print_success "Firebase CLI version is compatible"
    else
        print_warning "Consider updating Firebase CLI to version 13+ for better compatibility"
    fi
}

# Function to deploy functions with retry logic
deploy_functions_with_retry() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Deploying functions (attempt $attempt/$max_attempts)..."
        
        if firebase deploy --only functions; then
            print_success "Functions deployed successfully"
            return 0
        else
            if [ $attempt -eq $max_attempts ]; then
                print_error "Functions deployment failed after $max_attempts attempts"
                return 1
            fi
            
            print_warning "Functions deployment failed, retrying in 10 seconds..."
            sleep 10
            attempt=$((attempt + 1))
        fi
    done
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

# Check Firebase CLI version
check_firebase_version

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
deploy_functions_with_retry
if [ $? -ne 0 ]; then
    print_error "Functions deployment failed. Please check the error and try again."
    exit 1
fi

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
