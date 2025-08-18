#!/bin/bash

# Team Member Authentication Test Script
# This script tests the team member login functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="http://localhost:8080"
TEST_EMAIL="enterprise.user@example.com"
TEST_PASSWORD="ChangeMe123!"

echo -e "${BLUE}🔍 Team Member Authentication Test${NC}"
echo "====================================="
echo ""

# Function to check if service is running
check_service() {
    echo -n "Checking licensing website service... "
    if curl -s --connect-timeout 5 "$API_BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        return 1
    fi
}

# Function to test team member login
test_team_member_login() {
    echo -e "\n${BLUE}🧪 Testing Team Member Login${NC}"
    echo "--------------------------------"
    
    echo "Testing login with email: $TEST_EMAIL"
    
    # Test the login endpoint
    response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Login request successful${NC}"
        
        # Check if response contains success
        if echo "$response" | grep -q '"success":true'; then
            echo -e "${GREEN}✅ Login successful${NC}"
            
            # Extract and display key information
            echo -e "\n${BLUE}📋 Login Response Details:${NC}"
            echo "User ID: $(echo "$response" | jq -r '.data.user.id // "N/A"')"
            echo "Email: $(echo "$response" | jq -r '.data.user.email // "N/A"')"
            echo "Name: $(echo "$response" | jq -r '.data.user.name // "N/A"')"
            echo "Role: $(echo "$response" | jq -r '.data.user.role // "N/A"')"
            echo "Is Team Member: $(echo "$response" | jq -r '.data.user.isTeamMember // "N/A"')"
            echo "Organization ID: $(echo "$response" | jq -r '.data.user.organizationId // "N/A"')"
            echo "License Type: $(echo "$response" | jq -r '.data.user.licenseType // "N/A"')"
            
            # Check for team member data
            if echo "$response" | grep -q '"teamMemberData"'; then
                echo -e "\n${GREEN}✅ Team Member Data Found:${NC}"
                echo "Project Access Count: $(echo "$response" | jq -r '.data.teamMemberData.projectAccess | length // 0')"
                echo "Licenses Count: $(echo "$response" | jq -r '.data.teamMemberData.licenses | length // 0')"
                
                # Display project access details
                project_count=$(echo "$response" | jq -r '.data.teamMemberData.projectAccess | length // 0')
                if [ "$project_count" -gt 0 ]; then
                    echo -e "\n${BLUE}📁 Project Access:${NC}"
                    echo "$response" | jq -r '.data.teamMemberData.projectAccess[] | "  - \(.projectName) (\(.role))"'
                fi
                
                # Display license details
                license_count=$(echo "$response" | jq -r '.data.teamMemberData.licenses | length // 0')
                if [ "$license_count" -gt 0 ]; then
                    echo -e "\n${BLUE}🔑 Licenses:${NC}"
                    echo "$response" | jq -r '.data.teamMemberData.licenses[] | "  - \(.type // .licenseType) (\(.status // "Unknown"))"'
                fi
            else
                echo -e "\n${YELLOW}⚠️ No Team Member Data in response${NC}"
            fi
            
            # Check for tokens
            if echo "$response" | grep -q '"tokens"'; then
                echo -e "\n${GREEN}✅ Authentication Tokens Generated${NC}"
                access_token=$(echo "$response" | jq -r '.data.tokens.accessToken // "N/A"')
                if [ "$access_token" != "N/A" ] && [ "$access_token" != "null" ]; then
                    echo "Access Token: ${access_token:0:20}..."
                else
                    echo -e "${RED}❌ No access token found${NC}"
                fi
            else
                echo -e "\n${RED}❌ No authentication tokens found${NC}"
            fi
            
        else
            echo -e "${RED}❌ Login failed${NC}"
            echo "Response: $response"
        fi
    else
        echo -e "${RED}❌ Login request failed${NC}"
        echo "Error: $response"
    fi
}

# Function to test with different team member credentials
test_multiple_credentials() {
    echo -e "\n${BLUE}🧪 Testing Multiple Team Member Credentials${NC}"
    echo "-----------------------------------------------"
    
    # Test credentials array
    declare -a test_credentials=(
        '{"email": "enterprise.user@example.com", "password": "ChangeMe123!"}'
        '{"email": "lissa@apple.com", "password": "admin1234!"}'
        '{"email": "team.member@example.com", "password": "password123"}'
    )
    
    for cred in "${test_credentials[@]}"; do
        email=$(echo "$cred" | jq -r '.email')
        echo -n "Testing $email... "
        
        response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d "$cred")
        
        if echo "$response" | grep -q '"success":true'; then
            echo -e "${GREEN}✅ Success${NC}"
            is_team_member=$(echo "$response" | jq -r '.data.user.isTeamMember // false')
            if [ "$is_team_member" = "true" ]; then
                echo "  - Team Member: Yes"
            else
                echo "  - Team Member: No"
            fi
        else
            echo -e "${RED}❌ Failed${NC}"
            error=$(echo "$response" | jq -r '.error // .message // "Unknown error"')
            echo "  - Error: $error"
        fi
    done
}

# Main execution
main() {
    echo "Starting team member authentication tests..."
    echo "API Base URL: $API_BASE_URL"
    echo "Test Email: $TEST_EMAIL"
    echo ""
    
    # Check if service is running
    if ! check_service; then
        echo -e "\n${RED}❌ Service is not running. Please start the licensing website service first.${NC}"
        echo "Run: cd dashboard-v14-licensing-website\\ 2 && npm run dev"
        exit 1
    fi
    
    # Test team member login
    test_team_member_login
    
    # Test multiple credentials
    test_multiple_credentials
    
    echo -e "\n${GREEN}✅ Team Member Authentication Tests Complete${NC}"
}

# Run main function
main "$@"
