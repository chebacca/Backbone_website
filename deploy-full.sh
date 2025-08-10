#!/bin/bash

# Full Deployment Script for Dashboard v14 Licensing Website
# This script builds all components and deploys to Firebase

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for user confirmation
wait_for_confirmation() {
    echo -e "${YELLOW}Press Enter to continue or Ctrl+C to abort...${NC}"
    read -r
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists pnpm; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    if ! command_exists firebase; then
        print_error "Firebase CLI is not installed. Please install Firebase CLI first."
        exit 1
    fi
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check Node version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Check if we're in the right directory
check_directory() {
    print_status "Checking project directory..."
    
    if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
        print_error "This doesn't appear to be the project root directory."
        print_error "Please run this script from the project root (where package.json and firebase.json are located)."
        exit 1
    fi
    
    print_success "Project directory confirmed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    print_status "Installing root dependencies..."
    pnpm install
    
    print_status "Installing client dependencies..."
    cd client && pnpm install && cd ..
    
    print_status "Installing server dependencies..."
    cd server && pnpm install && cd ..
    
    print_status "Installing shared dependencies..."
    cd shared && pnpm install && cd ..
    
    print_success "All dependencies installed"
}

# Build all components
build_all() {
    print_status "Building all components..."
    
    print_status "Building shared types..."
    cd shared
    pnpm build
    if [ $? -ne 0 ]; then
        print_error "Shared build failed"
        exit 1
    fi
    cd ..
    print_success "Shared build completed"
    
    print_status "Building client..."
    cd ..
    pnpm build:client
    if [ $? -ne 0 ]; then
        print_error "Client build failed"
        exit 1
    fi
    cd - >/dev/null
    print_success "Client build completed"
    
    print_status "Building server..."
    cd server
    pnpm build
    if [ $? -ne 0 ]; then
        print_error "Server build failed"
        exit 1
    fi
    cd ..
    print_success "Server build completed"
    
    print_success "All builds completed successfully"
}

# Check Firebase project
check_firebase() {
    print_status "Checking Firebase configuration..."
    
    # Check if user is logged in
    if ! firebase projects:list >/dev/null 2>&1; then
        print_error "Not logged into Firebase. Please run 'firebase login' first."
        exit 1
    fi
    
    # Check current project
    CURRENT_PROJECT=$(firebase use --only | grep "Active Project:" | awk '{print $3}')
    if [ -z "$CURRENT_PROJECT" ]; then
        print_error "No Firebase project selected. Please run 'firebase use [project-id]' first."
        exit 1
    fi
    
    print_success "Firebase project: $CURRENT_PROJECT"
    
    # Confirm deployment
    echo -e "${YELLOW}About to deploy to Firebase project: $CURRENT_PROJECT${NC}"
    wait_for_confirmation
}

# Deploy to Firebase
deploy_to_firebase() {
    print_status "Deploying to Firebase..."
    
    print_status "Deploying hosting..."
    firebase deploy --only hosting
    if [ $? -ne 0 ]; then
        print_error "Hosting deployment failed"
        exit 1
    fi
    print_success "Hosting deployed"
    
    print_status "Deploying functions..."
    firebase deploy --only functions
    if [ $? -ne 0 ]; then
        print_error "Functions deployment failed"
        exit 1
    fi
    print_success "Functions deployed"
    
    print_status "Deploying Firestore rules and indexes..."
    firebase deploy --only firestore
    if [ $? -ne 0 ]; then
        print_error "Firestore deployment failed"
        exit 1
    fi
    print_success "Firestore deployed"
    
    print_status "Deploying storage rules..."
    firebase deploy --only storage
    if [ $? -ne 0 ]; then
        print_error "Storage deployment failed"
        exit 1
    fi
    print_success "Storage deployed"
    
    print_success "All Firebase services deployed successfully"
}

# Show deployment summary
show_summary() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo -e "${GREEN}Your Dashboard v14 Licensing Website is now live!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Visit your hosted site: https://backbone-logic.web.app"
    echo "2. Test your API endpoints: https://api-oup5qxogca-uc.a.run.app"
    echo "3. Check Firebase Console: https://console.firebase.google.com/project/backbone-logic"
    echo ""
    echo -e "${YELLOW}Note:${NC} Some environment variables may need to be configured in Firebase Functions for full functionality."
}

# Main execution
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Dashboard v14 Deployment${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    check_prerequisites
    check_directory
    install_dependencies
    build_all
    check_firebase
    deploy_to_firebase
    show_summary
}

# Run main function
main "$@"
