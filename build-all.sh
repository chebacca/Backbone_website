#!/bin/bash

# Build Script for Dashboard v14 Licensing Website
# This script builds all components in the correct order

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
echo -e "${BLUE}  Dashboard v14 Build Only${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    print_error "This doesn't appear to be the project root directory."
    print_error "Please run this script from the project root (where package.json and firebase.json are located)."
    exit 1
fi

print_success "Project directory confirmed"

# Install dependencies if needed
print_status "Checking dependencies..."
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
    cd shared && pnpm install && cd ..
fi

# Build all components
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
pnpm build:client
if [ $? -ne 0 ]; then
    print_error "Client build failed"
    exit 1
fi
    # stay in project root
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

print_success "🎉 All builds completed successfully!"
echo ""
echo -e "${BLUE}Build outputs:${NC}"
echo "✅ Shared types: shared/dist/"
echo "✅ Client build: deploy/"
echo "✅ Server build: server/dist/"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "• Run './deploy-simple.sh' to deploy to Firebase"
echo "• Run './deploy-full.sh' for full deployment with dependencies"
echo "• Run 'pnpm dev' to start development mode"
