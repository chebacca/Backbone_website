#!/bin/bash

# Dashboard v14 Licensing Website - Firebase Deployment Script
# This script builds the project locally and deploys only the built assets

set -e

echo "🚀 Starting Firebase deployment for Dashboard v14 Licensing Website..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf deploy
rm -rf client/dist

# Build the client
echo "🔨 Building client application..."
pnpm build:client

# Create deployment directory and copy built assets
echo "📁 Preparing deployment assets..."
mkdir -p deploy
cp -r client/dist/* deploy/

# Verify deployment assets
echo "✅ Deployment assets prepared:"
ls -la deploy/

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should now be live at your Firebase hosting URL."
