#!/bin/bash

# Build and Deploy Script for Dashboard-v14-licensing-website
# This script builds and deploys the website with license management fixes

# Exit on any error
set -e

# Print colored messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   Dashboard License Management Deploy   ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Check if running in the correct directory
if [ ! -f "package.json" ] || [ ! -d "client" ]; then
  echo -e "${RED}Error: Please run this script from the dashboard-v14-licensing-website root directory${NC}"
  exit 1
fi

# Check for Firebase CLI
if ! command -v firebase &> /dev/null; then
  echo -e "${RED}Error: Firebase CLI not found. Please install it with 'npm install -g firebase-tools'${NC}"
  exit 1
fi

# Check for Firebase login
echo -e "${YELLOW}Checking Firebase authentication...${NC}"
FIREBASE_AUTH_STATUS=$(firebase login:list 2>&1)
if [[ $FIREBASE_AUTH_STATUS == *"No users"* ]]; then
  echo -e "${YELLOW}Not logged in to Firebase. Please log in:${NC}"
  firebase login
else
  echo -e "${GREEN}Firebase authentication verified.${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install
cd client
pnpm install
cd ..

# Build the client
echo -e "${YELLOW}Building client application...${NC}"
cd client
echo -e "${BLUE}Running build script...${NC}"

# Clean the deploy directory first
rm -rf ../deploy/assets
mkdir -p ../deploy

# Run the build
pnpm run build
cd ..

# Check if build was successful
if [ ! -d "deploy/assets" ]; then
  echo -e "${RED}Error: Build failed. Check for errors above.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Deploy to Firebase
echo -e "${YELLOW}Deploying to Firebase...${NC}"
echo -e "${BLUE}Target: backbone-client.web${NC}"

# Set environment variables for web-only mode
export WEBONLY=true
export USE_FIRESTORE=true

# Deploy to Firebase hosting
firebase deploy --only hosting:main

# Print success message
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   Deployment completed successfully!    ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "The application has been deployed with the following fixes:"
echo -e "1. ${GREEN}✓${NC} Added license release functionality when removing team members"
echo -e "2. ${GREEN}✓${NC} Added Firebase Auth user deletion script"
echo -e "3. ${GREEN}✓${NC} Fixed analytics component calculations in the licensing page"
echo -e "4. ${GREEN}✓${NC} Added tooltips to metrics for better understanding"
echo ""
echo -e "Visit: ${BLUE}https://backbone-client.web.app${NC}"
