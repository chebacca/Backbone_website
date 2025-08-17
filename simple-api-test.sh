#!/bin/bash

# Simple API Test for Project Creation System
echo "🧪 Simple API Test"
echo "=================="

# Test the main endpoints that should be accessible
echo "Testing API endpoints..."

echo ""
echo "1. Testing projects endpoint (expect 401 without auth):"
curl -s -w "Status: %{http_code}\n" "https://backbone-logic-web.app/api/projects" | head -3

echo ""
echo "2. Testing auth endpoint (expect 401 without token):"
curl -s -w "Status: %{http_code}\n" "https://backbone-logic-web.app/api/auth/me" | head -3

echo ""
echo "3. Testing project creation (expect 401 without auth):"
curl -s -w "Status: %{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","maxCollaborators":250}' \
  "https://backbone-logic-web.app/api/projects" | head -3

echo ""
echo "✅ All endpoints should return 401 (Unauthorized) - this is expected!"
echo "🎯 Now test the frontend dialog manually using the guide in manual-test-guide.md"
