#!/bin/bash

# Quick curl test for team member API endpoints
# Usage: ./curl-test-team-apis.sh [AUTH_TOKEN] [PROJECT_ID]

set -e

# Configuration
BASE_URL="http://localhost:3001"
API_BASE="$BASE_URL/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get auth token from command line or environment
AUTH_TOKEN="${1:-$AUTH_TOKEN}"
PROJECT_ID="${2:-test-project-123}"

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}Error: AUTH_TOKEN not provided${NC}"
    echo "Usage: $0 [AUTH_TOKEN] [PROJECT_ID]"
    echo "Or set AUTH_TOKEN environment variable"
    exit 1
fi

echo -e "${YELLOW}Testing team member API endpoints...${NC}"
echo "Base URL: $BASE_URL"
echo "Project ID: $PROJECT_ID"
echo ""

# Test 1: getProjectTeamMembers
echo -e "${GREEN}1. Testing getProjectTeamMembers...${NC}"
curl -s -w "\nHTTP Status: %{http_code}\n" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_BASE/getProjectTeamMembers?projectId=$PROJECT_ID" | jq '.' 2>/dev/null || echo "Response (not JSON):"
echo ""

# Test 2: getLicensedTeamMembers without exclusion
echo -e "${GREEN}2. Testing getLicensedTeamMembers (no exclusion)...${NC}"
curl -s -w "\nHTTP Status: %{http_code}\n" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_BASE/getLicensedTeamMembers" | jq '.' 2>/dev/null || echo "Response (not JSON):"
echo ""

# Test 3: getLicensedTeamMembers with exclusion
echo -e "${GREEN}3. Testing getLicensedTeamMembers (with exclusion)...${NC}"
curl -s -w "\nHTTP Status: %{http_code}\n" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_BASE/getLicensedTeamMembers?excludeProjectId=$PROJECT_ID" | jq '.' 2>/dev/null || echo "Response (not JSON):"
echo ""

# Test 4: Unauthorized access
echo -e "${GREEN}4. Testing unauthorized access...${NC}"
curl -s -w "\nHTTP Status: %{http_code}\n" \
    -H "Content-Type: application/json" \
    "$API_BASE/getProjectTeamMembers?projectId=$PROJECT_ID"
echo ""

echo -e "${GREEN}All tests completed!${NC}"
