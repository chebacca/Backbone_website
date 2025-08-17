#!/bin/bash

# Licensing Website Build and Deploy Script
# This script builds and deploys the licensing website in one command

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  Licensing Website Build & Deploy${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Main execution
main() {
    print_header
    
    print_status "Building and deploying the licensing website..."
    echo ""
    
    # Build the licensing website
    print_status "Step 1: Building the licensing website..."
    if ./build-licensing-website.sh; then
        print_success "Build completed successfully"
    else
        print_error "Build failed. Please check the build script output."
        exit 1
    fi
    
    echo ""
    
    # Deploy to Firebase
    print_status "Step 2: Deploying to Firebase..."
    if ./deploy-licensing-website.sh "$@"; then
        print_success "Deployment completed successfully"
    else
        print_error "Deployment failed. Please check the deployment script output."
        exit 1
    fi
    
    echo ""
    print_success "🎉 Licensing website build and deployment completed!"
    print_status "The licensing website is now live and completely independent of the main Dashboard project."
}

# Run main function with all arguments
main "$@"
