#!/bin/bash

# 🚀 Deploy Licensing Website
# Deploys the Licensing Website to backbone-logic project

set -e

echo "🚀 Deploying Licensing Website..."
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Please run this script from the licensing website directory."
    exit 1
fi

# Switch to backbone-logic project
print_status "Switching to Firebase project: backbone-logic"
firebase use backbone-logic

# Build the licensing website
print_status "Building Licensing Website..."
pnpm run build

# Deploy to Firebase
print_status "Deploying to Firebase Hosting..."
firebase deploy --only hosting:backbone-logic

print_success "Licensing Website deployed successfully!"
print_status "URL: https://backbone-logic.web.app"
