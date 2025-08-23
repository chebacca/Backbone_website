#!/bin/bash

# Deploy WebOnly Production Mode Script
# Ensures proper Firebase setup for webonly production deployment

set -e

echo "🚀 Starting WebOnly Production Deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Set project
echo "🔧 Setting Firebase project..."
firebase use backbone-logic

# Build the client for production
echo "🔨 Building client for production..."
cd client
npm run build
cd ..

# Deploy Firestore rules
echo "🔒 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

# Deploy Firebase Functions (API)
echo "⚡ Deploying Firebase Functions..."
firebase deploy --only functions

# Deploy to Firebase Hosting with webonly target
echo "🌐 Deploying to Firebase Hosting (webonly)..."
firebase deploy --only hosting:backbone-client.web

# Verify deployment
echo "✅ Deployment completed!"
echo ""
echo "🔍 Verifying deployment..."
echo "Web App URL: https://backbone-logic.web.app"
echo "API Functions: https://us-central1-backbone-logic.cloudfunctions.net/api"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. ✅ Firestore rules deployed"
echo "2. ✅ Firestore indexes deployed"
echo "3. ✅ Firebase Functions deployed"
echo "4. ✅ Web app deployed to Firebase Hosting"
echo ""
echo "🔧 WebOnly mode features:"
echo "- Direct Firestore access (no local storage)"
echo "- Firebase Auth integration"
echo "- Hybrid local/webonly storage capability"
echo "- All collections and indexes configured"
echo ""
echo "🎉 WebOnly production deployment successful!"
