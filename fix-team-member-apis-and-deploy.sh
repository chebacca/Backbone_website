#!/bin/bash

# Fix Team Member APIs and Deploy Script
# This script builds and deploys the fix for the missing team member API endpoints

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
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it first:"
        print_error "npm install -g firebase-tools"
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

# Function to build the project
build_project() {
    print_step "Building the project..."
    
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
    
    # Build the client
    print_status "Building client..."
    cd client
    pnpm run build
    cd ..
    
    # Build the server
    print_status "Building server..."
    cd server
    pnpm run build
    cd ..
    
    print_success "Build completed successfully"
}

# Function to test the API endpoints locally
test_apis_locally() {
    print_step "Testing API endpoints locally..."
    
    # Check if server is running
    if curl -s "http://localhost:3001/health" > /dev/null 2>&1; then
        print_status "Server is running locally, testing endpoints..."
        
        # Test unauthorized access (should return 401)
        print_status "Testing unauthorized access..."
        local unauthorized_response=$(curl -s -w "%{http_code}" \
            -H "Content-Type: application/json" \
            "http://localhost:3001/api/getProjectTeamMembers?projectId=test")
        
        local http_code="${unauthorized_response: -3}"
        if [ "$http_code" = "401" ]; then
            print_success "Unauthorized access correctly returns 401"
        else
            print_warning "Unauthorized access returned $http_code instead of 401"
        fi
        
        # Test missing project ID (should return 400)
        print_status "Testing missing project ID..."
        local missing_id_response=$(curl -s -w "%{http_code}" \
            -H "Authorization: Bearer test-token" \
            -H "Content-Type: application/json" \
            "http://localhost:3001/api/getProjectTeamMembers")
        
        local http_code="${missing_id_response: -3}"
        if [ "$http_code" = "400" ]; then
            print_success "Missing project ID correctly returns 400"
        else
            print_warning "Missing project ID returned $http_code instead of 400"
        fi
        
    else
        print_warning "Server not running locally, skipping local tests"
        print_status "To test locally, start the server with: cd server && pnpm run dev"
    fi
}

# Function to deploy to Firebase
deploy_to_firebase() {
    print_step "Deploying to Firebase..."
    
    # Set Firebase project if not already set
    local current_project=$(firebase use --json | jq -r '.current')
    if [ "$current_project" = "null" ] || [ -z "$current_project" ]; then
        print_status "Setting Firebase project to backbone-logic..."
        firebase use backbone-logic
        current_project="backbone-logic"
    fi
    print_status "Current Firebase project: $current_project"
    
    # Deploy hosting
    print_status "Deploying hosting..."
    firebase deploy --only hosting:main
    
    # Deploy functions
    print_status "Deploying functions..."
    firebase deploy --only functions
    
    print_success "Firebase deployment completed"
}

# Function to verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # Get the deployed URL
    local deployed_url=$(firebase hosting:channel:list --json | jq -r '.result.channels[] | select(.name == "live") | .url' 2>/dev/null || echo "https://backbone-logic.web.app")
    
    print_status "Deployed URL: $deployed_url"
    
    # Test the health endpoint
    print_status "Testing deployed health endpoint..."
    if curl -s "$deployed_url/health" > /dev/null 2>&1; then
        print_success "Deployed health endpoint is accessible"
    else
        print_warning "Deployed health endpoint may not be accessible yet"
    fi
    
    print_success "Verification completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help           Show this help message"
    echo "  -b, --build-only     Only build, don't deploy"
    echo "  -d, --deploy-only    Only deploy, don't build"
    echo "  -t, --test-local     Test APIs locally before deployment"
    echo "  -v, --verify         Verify deployment after completion"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full build and deploy"
    echo "  $0 -b                 # Build only"
    echo "  $0 -d                 # Deploy only"
    echo "  $0 -t -v             # Build, test locally, deploy, and verify"
}

# Parse command line arguments
BUILD_ONLY=false
DEPLOY_ONLY=false
TEST_LOCAL=false
VERIFY_DEPLOY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -d|--deploy-only)
            DEPLOY_ONLY=true
            shift
            ;;
        -t|--test-local)
            TEST_LOCAL=true
            shift
            ;;
        -v|--verify)
            VERIFY_DEPLOY=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header "Team Member API Fix - Build and Deploy"
    
    # Check prerequisites
    check_prerequisites
    
    # Build if requested
    if [ "$DEPLOY_ONLY" = false ]; then
        build_project
    fi
    
    # Test locally if requested
    if [ "$TEST_LOCAL" = true ]; then
        test_apis_locally
    fi
    
    # Deploy if requested
    if [ "$BUILD_ONLY" = false ]; then
        deploy_to_firebase
        
        # Verify if requested
        if [ "$VERIFY_DEPLOY" = true ]; then
            verify_deployment
        fi
    fi
    
    print_header "Operation completed successfully!"
    
    if [ "$BUILD_ONLY" = true ]; then
        print_status "Project built successfully. To deploy, run: $0 -d"
    elif [ "$DEPLOY_ONLY" = true ]; then
        print_status "Project deployed successfully."
    else
        print_status "Project built and deployed successfully."
    fi
    
    print_status "Team member API endpoints should now be available at:"
    print_status "  - /api/getProjectTeamMembers"
    print_status "  - /api/getLicensedTeamMembers"
}

# Run main function
main
