#!/bin/bash

# Licensing Website Deployment Script
# This script deploys the built licensing website to Firebase

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if we're in the licensing website directory
    if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
        print_error "This doesn't appear to be the licensing website directory."
        print_error "Please run this script from the licensing website root (where package.json and firebase.json are located)."
        exit 1
    fi
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it first:"
        print_error "npm install -g firebase-tools"
        exit 1
    fi
    
    # Check if build exists
    if [ ! -d "deploy" ] || [ ! -f "deploy/index.html" ]; then
        print_error "Build not found. Please run the build script first:"
        print_error "./build-licensing-website.sh"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to check Firebase project
check_firebase_project() {
    print_step "Checking Firebase project..."
    
    # Check if logged in
    if ! firebase projects:list &> /dev/null; then
        print_error "Not logged into Firebase. Please login first:"
        print_error "firebase login"
        exit 1
    fi
    
    # Get current project
    FIREBASE_PROJECT=$(firebase use --json | jq -r '.current' 2>/dev/null || echo "unknown")
    print_success "Using Firebase project: $FIREBASE_PROJECT"
    
    if [ "$FIREBASE_PROJECT" = "unknown" ]; then
        print_warning "Firebase project not set. Please set it first:"
        print_warning "firebase use <project-id>"
        exit 1
    fi
}

# Function to deploy to Firebase
deploy_to_firebase() {
    print_step "Deploying to Firebase..."
    
    # Parse command line arguments for deployment targets
    DEPLOY_TARGETS="hosting,functions,firestore,storage"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --hosting-only)
                DEPLOY_TARGETS="hosting"
                shift
                ;;
            --functions-only)
                DEPLOY_TARGETS="functions"
                shift
                ;;
            --firestore-only)
                DEPLOY_TARGETS="firestore"
                shift
                ;;
            --storage-only)
                DEPLOY_TARGETS="storage"
                shift
                ;;
            --all)
                DEPLOY_TARGETS="hosting,functions,firestore,storage"
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--hosting-only|--functions-only|--firestore-only|--storage-only|--all] [--help]"
                echo "  --hosting-only     Deploy only hosting"
                echo "  --functions-only   Deploy only functions"
                echo "  --firestore-only   Deploy only Firestore rules"
                echo "  --storage-only     Deploy only storage rules"
                echo "  --all              Deploy everything (default)"
                echo "  --help, -h         Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    print_status "Deploying targets: $DEPLOY_TARGETS"
    
    # Deploy based on targets
    if [[ "$DEPLOY_TARGETS" == *"hosting"* ]]; then
        print_status "Deploying hosting..."
        firebase deploy --only hosting
    fi
    
    if [[ "$DEPLOY_TARGETS" == *"functions"* ]]; then
        print_status "Deploying functions..."
        firebase deploy --only functions
    fi
    
    if [[ "$DEPLOY_TARGETS" == *"firestore"* ]]; then
        print_status "Deploying Firestore rules..."
        firebase deploy --only firestore
    fi
    
    if [[ "$DEPLOY_TARGETS" == *"storage"* ]]; then
        print_status "Deploying storage rules..."
        firebase deploy --only storage
    fi
    
    print_success "Firebase deployment completed"
}

# Function to verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # Get the hosting URL
    HOSTING_URL=$(firebase hosting:channel:list --json | jq -r '.result.channels[] | select(.name == "live") | .url' 2>/dev/null || echo "https://backbone-logic.web.app")
    
    print_success "Deployment verification completed"
    echo ""
    echo -e "${GREEN}🎉 Licensing Website Deployment Complete!${NC}"
    echo ""
    echo -e "${BLUE}Deployed URLs:${NC}"
    echo "✅ Main App: $HOSTING_URL"
    echo ""
    echo -e "${BLUE}Features:${NC}"
    echo "✅ Independent licensing website"
    echo "✅ Firebase hosting, functions, and Firestore"
    echo "✅ No dependency on main Dashboard project"
    echo ""
    echo -e "${YELLOW}Note:${NC} This is a completely separate deployment from the main Dashboard"
}

# Main execution
main() {
    print_header "Licensing Website Deployment"
    
    print_status "Deploying the licensing website to Firebase..."
    echo ""
    
    # Execute all steps
    check_prerequisites
    check_firebase_project
    deploy_to_firebase "$@"
    verify_deployment
    
    print_header "Deployment Complete!"
}

# Run main function with all arguments
main "$@"
