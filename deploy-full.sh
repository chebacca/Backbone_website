#!/bin/bash

# Dashboard v14 Licensing Website - Full Stack Firebase Deployment
# This script deploys both frontend (hosting) and backend (functions)

set -e

echo "🚀 Starting full stack Firebase deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf deploy
rm -rf client/dist
rm -rf server/dist

# Build the client
echo "🔨 Building client application (VITE_API_BASE_URL=/api)..."
VITE_API_BASE_URL=/api pnpm build:client

# Build the server
echo "🔨 Building server application..."
pnpm build:server

# Create deployment directory and copy built assets
echo "📁 Preparing deployment assets..."
mkdir -p deploy
cp -r client/dist/* deploy/

# Verify deployment assets
echo "✅ Deployment assets prepared:"
ls -la deploy/

# Deploy to Firebase (both hosting and functions)
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Full stack deployment completed successfully!"
echo "🌐 Frontend: https://backbone-logic.web.app"
echo "🔗 Backend API: https://us-central1-backbone-logic.cloudfunctions.net/api"
echo "📊 Firebase Console: https://console.firebase.google.com/project/backbone-logic/overview"
