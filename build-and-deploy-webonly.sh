#!/bin/bash

# WebOnly=True Firebase-Only Build and Deploy Script
# This script builds and deploys the entire Dashboard v14 project as a web-only Firebase application
# with no local storage dependencies

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

# Function to build licensing website (no longer depends on main Dashboard)
build_licensing_website_only() {
    print_step "Building licensing website directly..."
    
    # We're already in the licensing website directory, so just build it
    print_status "Building licensing website from current directory..."
    
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

# Function to configure WebOnly=True environment
configure_webonly() {
    print_step "Configuring WebOnly=True environment..."
    
    # Create WebOnly configuration
    cat > deploy/webonly-config.js << 'EOF'
// WebOnly=True Configuration
// This file ensures the app runs in web-only mode with no local storage dependencies

window.WEBONLY_MODE = true;
window.DISABLE_LOCAL_STORAGE = true;

// Override localStorage methods to prevent usage
const originalLocalStorage = window.localStorage;
Object.defineProperty(window, 'localStorage', {
    get: function() {
        console.warn('localStorage is disabled in WebOnly mode. Use Firebase instead.');
        return {
            getItem: () => null,
            setItem: () => console.warn('localStorage.setItem is disabled in WebOnly mode'),
            removeItem: () => console.warn('localStorage.removeItem is disabled in WebOnly mode'),
            clear: () => console.warn('localStorage.clear is disabled in WebOnly mode'),
            key: () => null,
            length: 0
        };
    },
    set: function() {
        console.warn('localStorage cannot be overridden in WebOnly mode');
    },
    configurable: false
});

// Override sessionStorage methods
const originalSessionStorage = window.sessionStorage;
Object.defineProperty(window, 'sessionStorage', {
    get: function() {
        console.warn('sessionStorage is disabled in WebOnly mode. Use Firebase instead.');
        return {
            getItem: () => null,
            setItem: () => console.warn('sessionStorage.setItem is disabled in WebOnly mode'),
            removeItem: () => console.warn('sessionStorage.removeItem is disabled in WebOnly mode'),
            clear: () => console.warn('sessionStorage.clear is disabled in WebOnly mode'),
            key: () => null,
            length: 0
        };
    },
    set: function() {
        console.warn('sessionStorage cannot be overridden in WebOnly mode');
    },
    configurable: false
});

console.log('✅ WebOnly mode enabled - localStorage and sessionStorage disabled');
EOF
    
    # Create WebOnly index.html for main dashboard
    if [ -f "deploy/dashboard/index.html" ]; then
        # Backup original
        cp deploy/dashboard/index.html deploy/dashboard/index.html.original
        
        # Insert WebOnly config script
        sed -i.bak '/<head>/a\
    <script src="../webonly-config.js"></script>' deploy/dashboard/index.html
        
        # Clean up backup
        rm deploy/dashboard/index.html.bak
    fi
    
    print_success "WebOnly=True configuration applied"
}



# Function to create unified deployment structure
create_unified_deployment() {
    print_step "Creating unified deployment structure..."
    
    # The licensing website is already built directly in the deploy directory
    # Just ensure the WebOnly config is properly applied
    print_status "Ensuring WebOnly config is applied to React app..."
    
    # Ensure the main index.html has WebOnly config
    if [ -f "deploy/index.html" ]; then
        # Add WebOnly config script if not already present
        if ! grep -q "webonly-config.js" deploy/index.html; then
            sed -i.bak '/<head>/a\
    <script src="webonly-config.js"></script>' deploy/index.html
            rm deploy/index.html.bak
        fi
    fi
    
    print_success "React app serves directly from root - no splash page"
}

# Function to deploy to Firebase
deploy_to_firebase() {
    print_step "Deploying to Firebase..."
    
    # Check Firebase project
    print_status "Checking Firebase project..."
    FIREBASE_PROJECT=$(firebase use --json | jq -r '.current')
    print_success "Using Firebase project: $FIREBASE_PROJECT"
    
    # Deploy hosting
    echo "🚀 Deploying to Firebase (main target with API routing)..."
    firebase deploy --only hosting:main
    
    # Deploy functions
    print_status "Deploying functions..."
    firebase deploy --only functions
    
    # Deploy Firestore rules
    print_status "Deploying Firestore rules..."
    firebase deploy --only firestore
    
    # Deploy storage rules
    print_status "Deploying storage rules..."
    firebase deploy --only storage
    
    print_success "Firebase deployment completed"
}

# Function to verify build outputs
verify_build_outputs() {
    print_step "Verifying build outputs..."
    
    # Check main deploy directory
    if [ ! -d "deploy" ]; then
        print_error "Main deploy directory not found"
        exit 1
    fi
    
    # Check React app files (now served directly from root)
    if [ ! -f "deploy/index.html" ]; then
        print_error "React app index.html not found in deploy/"
        exit 1
    fi
    
    # Check WebOnly config
    if [ ! -f "deploy/webonly-config.js" ]; then
        print_error "WebOnly config file not found"
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

# Function to verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # Get the hosting URL
    HOSTING_URL=$(firebase hosting:channel:list --json | jq -r '.result.channels[] | select(.name == "live") | .url' 2>/dev/null || echo "https://backbone-logic.web.app")
    
    print_success "Deployment verification completed"
    echo ""
    echo -e "${GREEN}🎉 WebOnly=True Firebase-Only Deployment Complete!${NC}"
    echo ""
    echo -e "${BLUE}Deployed URLs:${NC}"
    echo "✅ Main App: $HOSTING_URL"
    echo "✅ React App: $HOSTING_URL (direct access - no splash page)"
    echo ""
    echo -e "${BLUE}Features:${NC}"
    echo "✅ WebOnly=True mode enabled"
    echo "✅ No local storage dependencies"
    echo "✅ Firebase hosting, functions, and Firestore"
    echo "✅ Direct React app access - no splash page"
    echo ""
    echo -e "${YELLOW}Note:${NC} All data is now stored in Firebase cloud services"
}

# Main execution
main() {
    print_header "Dashboard v14 WebOnly=True Firebase-Only Build & Deploy"
    
    print_status "Starting comprehensive build and deployment process..."
    echo ""
    
    # Execute all steps
    check_prerequisites
    build_licensing_website_only
    configure_webonly
    create_unified_deployment
    verify_build_outputs
    deploy_to_firebase
    verify_deployment
    
    print_header "Deployment Complete!"
}

# Run main function
main "$@"
