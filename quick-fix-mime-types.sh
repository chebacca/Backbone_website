#!/bin/bash

# Quick Fix for MIME Types - Licensing Website
# This script quickly fixes MIME type issues and redeploys

set -e

echo "🔧 Quick MIME type fix for licensing website..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Create _headers file in deploy directory
echo "📝 Creating _headers file..."
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

# Deploy the fix
echo "🚀 Deploying MIME type fix to Firebase..."
firebase deploy --only hosting:main

echo "✅ Deployment complete!"
echo ""
echo "🔍 MIME type fixes applied:"
echo "   - JavaScript files now served with correct Content-Type"
echo "   - Module loading errors should be resolved"
echo "   - Proper caching headers added"
echo ""
echo "🌐 Test your website now - JavaScript modules should load correctly!"
