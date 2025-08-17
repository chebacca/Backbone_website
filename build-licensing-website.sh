#!/bin/bash

# Licensing Website Build Script
# This script builds ONLY the licensing website for deployment

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

# Function to clean previous builds
clean_previous_builds() {
    print_step "Cleaning previous builds..."
    
    # Remove previous deploy directory
    if [ -d "deploy" ]; then
        print_status "Removing previous deploy directory..."
        rm -rf deploy
    fi
    
    # Clean node_modules if they exist (optional)
    if [ "$1" = "--clean-deps" ]; then
        print_status "Cleaning dependencies..."
        rm -rf node_modules client/node_modules server/node_modules shared/node_modules
    fi
    
    print_success "Cleanup completed"
}

# Function to install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Install root dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing root dependencies..."
        pnpm install
    fi
    
    # Install client dependencies
    if [ ! -d "client/node_modules" ]; then
        print_status "Installing client dependencies..."
        cd client && pnpm install && cd ..
    fi
    
    # Install server dependencies
    if [ ! -d "server/node_modules" ]; then
        print_status "Installing server dependencies..."
        cd server && pnpm install && cd ..
    fi
    
    # Install shared dependencies
    if [ ! -d "shared/node_modules" ]; then
        print_status "Installing shared dependencies..."
        cd shared && pnpm install && cd ..
    fi
    
    print_success "Dependencies installed"
}

# Function to build licensing website
build_licensing_website() {
    print_step "Building licensing website..."
    
    # Build shared types first
    print_status "Building shared types..."
    cd shared && pnpm build && cd ..
    
    # Build client (React app)
    print_status "Building client (React app)..."
    pnpm build:client
    
    # Verify client build output
    if [ ! -d "deploy" ]; then
        print_error "Client build failed - deploy directory not found"
        exit 1
    fi
    
    # Build server
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
    
    # Check React app files
    if [ ! -f "deploy/index.html" ]; then
        print_error "React app index.html not found in deploy/"
        exit 1
    fi
    
    # Check for essential React app assets
    if [ ! -d "deploy/assets" ]; then
        print_error "React app assets directory not found"
        exit 1
    fi
    
    print_status "Build output verification:"
    echo "📁 deploy/"
    ls -la deploy/
    echo ""
    echo "📁 deploy/assets/"
    ls -la deploy/assets/ | head -10
    
    print_success "Build outputs verified successfully"
}

# Function to show deployment instructions
show_deployment_instructions() {
    print_header "Build Complete - Ready for Deployment!"
    
    print_success "Licensing website has been built successfully"
    echo ""
    echo -e "${BLUE}Build Output:${NC}"
    echo "✅ React app built to: deploy/"
    echo "✅ Server built to: server/dist/"
    echo "✅ Shared types built to: shared/dist/"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Deploy to Firebase: firebase deploy"
    echo "2. Deploy hosting only: firebase deploy --only hosting"
    echo "3. Deploy functions only: firebase deploy --only functions"
    echo "4. Deploy everything: firebase deploy --only hosting,functions,firestore,storage"
    echo ""
    echo -e "${BLUE}Or use the deployment script:${NC}"
    echo "   ./deploy-simple.sh"
    echo ""
    echo -e "${YELLOW}Note:${NC} The licensing website is completely independent of the main Dashboard project"
}

# Main execution
main() {
    print_header "Licensing Website Build"
    
    print_status "Building the licensing website independently..."
    echo ""
    
    # Parse command line arguments
    CLEAN_DEPS=false
    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean-deps)
                CLEAN_DEPS=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--clean-deps] [--help]"
                echo "  --clean-deps    Clean and reinstall all dependencies"
                echo "  --help, -h      Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Execute all steps
    check_prerequisites
    clean_previous_builds $CLEAN_DEPS
    install_dependencies
    build_licensing_website
    verify_build_outputs
    show_deployment_instructions
    
    print_header "Build Complete!"
}

# Run main function
main "$@"
