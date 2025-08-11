#!/bin/bash

# Functions-Only Deployment Script for Dashboard v14 Licensing Website
# This script specifically handles Cloud Functions deployment with retry logic

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v firebase >/dev/null 2>&1; then
        print_error "Firebase CLI is not installed. Please install Firebase CLI first."
        exit 1
    fi
    
    if ! command -v pnpm >/dev/null 2>&1; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Function to check project directory
check_directory() {
    print_status "Checking project directory..."
    
    if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
        print_error "This doesn't appear to be the project root directory."
        print_error "Please run this script from the project root (where package.json and firebase.json are located)."
        exit 1
    fi
    
    print_success "Project directory confirmed"
}

# Function to build server
build_server() {
    print_status "Building server..."
    
    cd server
    pnpm build
    if [ $? -ne 0 ]; then
        print_error "Server build failed"
        exit 1
    fi
    cd ..
    
    print_success "Server build completed"
}

# Function to deploy functions with enhanced retry logic
deploy_functions_with_retry() {
    local max_attempts=5
    local attempt=1
    local wait_time=15
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Deploying functions (attempt $attempt/$max_attempts)..."
        
        # Try to deploy functions
        if firebase deploy --only functions; then
            print_success "Functions deployed successfully"
            return 0
        else
            if [ $attempt -eq $max_attempts ]; then
                print_error "Functions deployment failed after $max_attempts attempts"
                print_error "This may be due to a temporary Google Cloud issue."
                print_error "Please try again later or contact support if the issue persists."
                return 1
            fi
            
            print_warning "Functions deployment failed (attempt $attempt/$max_attempts)"
            print_warning "This may be due to Eventarc service identity generation issues."
            print_warning "Waiting $wait_time seconds before retry..."
            
            sleep $wait_time
            
            # Increase wait time for subsequent attempts
            wait_time=$((wait_time + 10))
            attempt=$((attempt + 1))
        fi
    done
}

# Function to show troubleshooting tips
show_troubleshooting() {
    echo ""
    echo -e "${YELLOW}=== Troubleshooting Tips ===${NC}"
    echo "If functions deployment continues to fail:"
    echo "1. Check your Firebase project permissions"
    echo "2. Ensure you're logged in: firebase login"
    echo "3. Verify project selection: firebase use"
    echo "4. Check Google Cloud Console for any service issues"
    echo "5. Try deploying individual services: firebase deploy --only hosting"
    echo "6. Consider updating Firebase CLI: npm install -g firebase-tools"
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Functions-Only Deployment${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    check_prerequisites
    check_directory
    build_server
    
    print_status "Starting functions deployment..."
    deploy_functions_with_retry
    
    if [ $? -eq 0 ]; then
        print_success "🎉 Functions deployment completed successfully!"
        echo ""
        echo -e "${GREEN}Your Cloud Functions are now live!${NC}"
        echo "Function URL: https://api-oup5qxogca-uc.a.run.app"
        echo ""
    else
        print_error "❌ Functions deployment failed"
        show_troubleshooting
        exit 1
    fi
}

# Run main function
main "$@"

