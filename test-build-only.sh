#!/bin/bash

# Test Build Script for Dashboard v14 WebOnly=True
# This script tests the build process without deploying to verify dist folder copying

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
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
        print_error "This doesn't appear to be the project root directory."
        print_error "Please run this script from the project root (where package.json and firebase.json are located)."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install it first:"
        print_error "npm install -g pnpm"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to build main Dashboard web app
build_main_dashboard() {
    print_step "Building main Dashboard web app..."
    
    DASHBOARD_DIR="../Dashboard-v14_2"
    
    if [ ! -d "$DASHBOARD_DIR" ]; then
        print_error "Main Dashboard directory not found at $DASHBOARD_DIR"
        exit 1
    fi
    
    cd "$DASHBOARD_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing main Dashboard dependencies..."
        pnpm install
    fi
    
    # Build the web app
    print_status "Building main Dashboard web app..."
    pnpm build:web
    
    if [ $? -ne 0 ]; then
        print_error "Main Dashboard web build failed"
        exit 1
    fi
    
    # Verify the dist folder was created
    if [ ! -d "apps/web/dist" ]; then
        print_error "Dist folder not found after build. Expected: apps/web/dist"
        exit 1
    fi
    
    print_status "Dist folder contents:"
    ls -la apps/web/dist/
    
    # Copy the built web app to the licensing website deploy directory
    print_status "Copying main Dashboard build to licensing website..."
    cd "../dashboard-v14-licensing-website 2"
    
    # Clean up existing dashboard directory
    if [ -d "deploy/dashboard" ]; then
        print_status "Cleaning up existing dashboard directory..."
        rm -rf deploy/dashboard
    fi
    
    # Create dashboard directory in deploy
    mkdir -p deploy/dashboard
    
    # Copy the built web app with verbose output and error handling
    print_status "Copying dist folder contents..."
    if ! cp -rv "$DASHBOARD_DIR/apps/web/dist/"* deploy/dashboard/; then
        print_error "Failed to copy dist folder contents"
        exit 1
    fi
    
    # Verify the copy worked
    if [ ! -f "deploy/dashboard/index.html" ]; then
        print_error "Failed to copy dist folder. index.html not found in deploy/dashboard/"
        exit 1
    fi
    
    # Count files to ensure everything was copied
    ORIGINAL_COUNT=$(find "$DASHBOARD_DIR/apps/web/dist" -type f | wc -l)
    COPIED_COUNT=$(find deploy/dashboard -type f | wc -l)
    
    print_status "File count verification:"
    echo "Original dist files: $ORIGINAL_COUNT"
    echo "Copied files: $COPIED_COUNT"
    
    if [ "$COPIED_COUNT" -lt "$ORIGINAL_COUNT" ]; then
        print_warning "Some files may not have been copied completely"
    fi
    
    print_status "Dashboard deploy directory contents:"
    ls -la deploy/dashboard/
    
    print_success "Main Dashboard web app built and copied"
}

# Function to build licensing website
build_licensing_website() {
    print_step "Building licensing website..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing root dependencies..."
        pnpm install
    fi
    
    if [ ! -d "client/node_modules" ]; then
        print_status "Installing client dependencies..."
        cd client && pnpm install && cd ..
    fi
    
    if [ ! -d "server/node_modules" ]; then
        print_status "Installing server dependencies..."
        cd server && pnpm install && cd ..
    fi
    
    if [ ! -d "shared/node_modules" ]; then
        print_status "Installing shared dependencies..."
        cd shared && pnpm build && cd ..
    fi
    
    # Build all components
    print_status "Building shared types..."
    cd shared && pnpm build && cd ..
    
    print_status "Building client..."
    pnpm build:client
    
    # Verify client dist folder was created
    if [ ! -d "deploy" ]; then
        print_error "Client dist folder not found after build. Expected: deploy/"
        exit 1
    fi
    
    print_status "Client deploy folder contents:"
    ls -la deploy/
    
    print_status "Building server..."
    cd server && pnpm build && cd ..
    
    print_success "Licensing website build completed"
}

# Function to verify build outputs
verify_build_outputs() {
    print_step "Verifying build outputs..."
    
    # Check main deploy directory
    if [ ! -d "deploy" ]; then
        print_error "Main deploy directory not found"
        exit 1
    fi
    
    # Check dashboard directory
    if [ ! -d "deploy/dashboard" ]; then
        print_error "Dashboard directory not found in deploy/"
        exit 1
    fi
    
    # Check dashboard files
    if [ ! -f "deploy/dashboard/index.html" ]; then
        print_error "Dashboard index.html not found"
        exit 1
    fi
    
    # Check licensing website files
    if [ ! -f "deploy/index.html" ]; then
        print_error "Main index.html not found"
        exit 1
    fi
    
    print_status "Build output verification:"
    echo "📁 deploy/"
    ls -la deploy/
    echo ""
    echo "📁 deploy/dashboard/"
    ls -la deploy/dashboard/ | head -10
    
    print_success "Build outputs verified successfully"
}

# Main execution
main() {
    print_header "Dashboard v14 WebOnly=True Build Test (No Deploy)"
    
    print_status "Starting build test process..."
    echo ""
    
    # Execute build steps only
    check_prerequisites
    build_main_dashboard
    build_licensing_website
    verify_build_outputs
    
    print_header "Build Test Complete!"
    echo ""
    echo -e "${GREEN}✅ All builds completed successfully!${NC}"
    echo -e "${BLUE}📁 Build outputs are in the deploy/ directory${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "• Run './build-and-deploy-webonly.sh' to build and deploy to Firebase"
    echo "• Check the deploy/ directory for build outputs"
    echo "• Verify all files were copied correctly"
}

# Run main function
main "$@"
