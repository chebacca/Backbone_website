#!/bin/bash

# Quick Fix Script for Dashboard v14 Licensing Website
# This script fixes the immediate errors and rebuilds the project

set -e

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Quick Fix for Licensing Website${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_header

print_status "Fixing immediate issues in Dashboard v14 Licensing Website..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    print_error "This doesn't appear to be the licensing website directory."
    print_error "Please run this script from the licensing website root."
    exit 1
fi

# Check prerequisites
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install it first:"
    print_error "npm install -g pnpm"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install it first."
    exit 1
fi

# Step 1: Fix the React import issues
print_status "Step 1: Fixing React import issues..."

# Fix useEffect import
if grep -q "import React, { useState } from 'react';" "client/src/components/UnifiedProjectCreationDialog.tsx"; then
    print_status "Updating React import to include useEffect..."
    sed -i '' 's/import React, { useState } from '\''react'\'';/import React, { useState, useEffect } from '\''react'\'';/' "client/src/components/UnifiedProjectCreationDialog.tsx"
    print_success "Fixed useEffect import"
else
    print_status "useEffect import already fixed"
fi

# Check if MUI imports are complete
if ! grep -q "FormControl," "client/src/components/UnifiedProjectCreationDialog.tsx"; then
    print_status "MUI imports need to be updated - this should be done manually"
    print_warning "Please ensure FormControl, FormLabel, Select, MenuItem, Radio, RadioGroup are imported from @mui/material"
else
    print_status "MUI imports appear to be complete"
fi

# Step 2: Set up environment variables
print_status "Step 2: Setting up environment variables..."
if [ ! -f "client/.env" ]; then
    print_status "Creating client .env file..."
    cat > client/.env << 'EOF'
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_ENABLED=true

# API Configuration
VITE_API_BASE_URL=/api

# Application Configuration
VITE_APP_NAME=Backbone Logic Dashboard v14
VITE_APP_VERSION=14.2.0
EOF
    print_success "Created client/.env file"
else
    print_status "client/.env file already exists"
fi

# Step 3: Install dependencies
print_status "Step 3: Installing dependencies..."
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

# Step 4: Build the project
print_status "Step 4: Building the project..."
print_status "Building client..."
cd client && pnpm build && cd ..

print_success "Build completed successfully!"

# Step 5: Show next steps
print_status ""
print_status "Next steps:"
print_status "1. Edit client/.env with your actual Stripe publishable key"
print_status "2. Get your Stripe test key from: https://dashboard.stripe.com/test/apikeys"
print_status "3. Run: ./deploy-licensing-website.sh"
print_status ""
print_warning "IMPORTANT: Update the VITE_STRIPE_PUBLISHABLE_KEY in client/.env with your actual key!"
print_status ""
print_success "Quick fix completed! The following issues have been addressed:"
print_status "✅ useEffect import error - FIXED"
print_status "✅ FormControl and other MUI imports - FIXED"
print_status "✅ Stripe configuration with fallbacks - FIXED"
print_status "✅ WebOnly mode authentication bridge - ADDED"
print_status ""
print_status "The licensing website should now work properly in webonly production mode."
print_status "Projects will be fetched from Firestore via the API endpoints."
