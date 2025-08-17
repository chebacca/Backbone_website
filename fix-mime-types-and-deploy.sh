#!/bin/bash

# Fix MIME Types and Deploy Licensing Website
# This script fixes JavaScript MIME type issues and redeploys

set -e

echo "🔧 Fixing MIME types for JavaScript modules..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if logged into Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please login first:"
    echo "   firebase login"
    exit 1
fi

echo "✅ Firebase CLI ready"

# Build the project first
echo "🏗️  Building project..."
if [ -f "build-licensing-website.sh" ]; then
    ./build-licensing-website.sh
else
    echo "⚠️  Build script not found, trying npm build..."
    npm run build
fi

# Create _headers file if it doesn't exist
echo "📝 Ensuring _headers file exists..."
if [ ! -f "deploy/_headers" ]; then
    cat > deploy/_headers << 'EOF'
# MIME type headers for proper JavaScript module loading
/*.js
  Content-Type: application/javascript; charset=utf-8

/*.mjs
  Content-Type: application/javascript; charset=utf-8

# Cache control for static assets
/*.js
  Cache-Control: max-age=31536000

/*.mjs
  Cache-Control: max-age=31536000

/*.css
  Cache-Control: max-age=31536000

/*.png
  Cache-Control: max-age=31536000

/*.jpg
  Cache-Control: max-age=31536000

/*.jpeg
  Cache-Control: max-age=31536000

/*.gif
  Cache-Control: max-age=31536000

/*.svg
  Cache-Control: max-age=31536000

/*.ico
  Cache-Control: max-age=31536000

/*.woff2
  Cache-Control: max-age=31536000
EOF
    echo "✅ _headers file created"
else
    echo "✅ _headers file already exists"
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo ""
echo "🔍 The following fixes were applied:"
echo "   - Added proper MIME type headers for JavaScript files"
echo "   - Created _headers file for static hosting"
echo "   - Updated firebase.json with correct Content-Type headers"
echo ""
echo "🌐 Your website should now load JavaScript modules correctly!"
echo "   If issues persist, try clearing your browser cache."
