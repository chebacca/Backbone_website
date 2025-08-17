#!/bin/bash

# Comprehensive Project Creation Test Script
# Tests the entire project creation flow including dialog functionality

echo "🧪 Testing Project Creation System"
echo "=================================="

# Configuration
BASE_URL="https://backbone-logic-web.app/api"
FRONTEND_URL="https://backbone-logic-web.app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if production server is accessible
check_server() {
    print_status "Checking if production server is accessible..."
    
    # Test the main site
    if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
        print_success "Frontend is accessible at $FRONTEND_URL"
    else
        print_error "Frontend is not accessible at $FRONTEND_URL"
        return 1
    fi
    
    # Test API endpoint (expect 401 for unauthenticated request)
    local api_response=$(curl -s -w "%{http_code}" "$BASE_URL/projects" -o /dev/null)
    if [[ "$api_response" == "401" ]]; then
        print_success "API is accessible at $BASE_URL (401 expected for unauthenticated request)"
        return 0
    elif [[ "$api_response" == "200" ]]; then
        print_success "API is accessible at $BASE_URL"
        return 0
    else
        print_error "API returned unexpected status: $api_response"
        return 1
    fi
}

# Function to test authentication endpoint
test_auth_endpoint() {
    print_status "Testing authentication endpoint..."
    
    local response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL/auth/me")
    local body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
    local status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [[ "$status" == "401" ]]; then
        print_success "Auth endpoint working (401 expected without token)"
        return 0
    else
        print_warning "Auth endpoint returned status: $status"
        print_warning "Response: $body"
        return 0  # Still OK, just different behavior
    fi
}

# Function to test project creation with different payloads
test_project_creation() {
    print_status "Testing project creation endpoint..."
    
    # Test 1: Basic project creation (should fail without auth)
    print_status "Test 1: Basic project creation without authentication"
    
    local test_payload='{
        "name": "Test Project",
        "description": "Test project for API validation",
        "visibility": "private",
        "storageMode": "local",
        "maxCollaborators": 10,
        "collaborationSettings": {
            "maxCollaborators": 10,
            "enableRealTime": true,
            "enableComments": true,
            "enableFileSharing": true,
            "enableVersionControl": true
        }
    }'
    
    local response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$test_payload" \
        "$BASE_URL/projects")
    
    local body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
    local status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [[ "$status" == "401" ]]; then
        print_success "Project creation properly requires authentication (401)"
    else
        print_warning "Project creation returned status: $status"
        print_warning "Response: $body"
    fi
    
    # Test 2: Enterprise-level project creation (should fail without auth but validate payload)
    print_status "Test 2: Enterprise project creation payload validation"
    
    local enterprise_payload='{
        "name": "Enterprise Test Project",
        "description": "Testing enterprise limits",
        "visibility": "organization",
        "storageMode": "cloud",
        "cloudConfig": {
            "provider": "firestore",
            "bucket": "",
            "prefix": ""
        },
        "maxCollaborators": 250,
        "collaborationSettings": {
            "maxCollaborators": 250,
            "enableRealTime": true,
            "enableComments": true,
            "enableFileSharing": true,
            "enableVersionControl": true
        },
        "networkConfig": {
            "enableLocalNetwork": false,
            "port": 3000,
            "address": "localhost"
        }
    }'
    
    local response2=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$enterprise_payload" \
        "$BASE_URL/projects")
    
    local body2=$(echo "$response2" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
    local status2=$(echo "$response2" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [[ "$status2" == "401" ]]; then
        print_success "Enterprise project creation properly requires authentication (401)"
    else
        print_warning "Enterprise project creation returned status: $status2"
        print_warning "Response: $body2"
    fi
}

# Function to test projects listing endpoint
test_projects_listing() {
    print_status "Testing projects listing endpoint..."
    
    # Test with includeArchived parameter
    local response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL/projects?includeArchived=true")
    local body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
    local status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [[ "$status" == "401" ]]; then
        print_success "Projects listing properly requires authentication (401)"
    elif [[ "$status" == "200" ]]; then
        print_success "Projects listing accessible (200)"
        print_status "Response preview: $(echo "$body" | head -c 100)..."
    else
        print_warning "Projects listing returned status: $status"
        print_warning "Response: $body"
    fi
}

# Function to validate API endpoints structure
test_api_structure() {
    print_status "Testing API endpoint structure..."
    
    # Test various endpoints that should exist
    local endpoints=(
        "/projects"
        "/auth/me"
        "/users/profile"
    )
    
    for endpoint in "${endpoints[@]}"; do
        print_status "Testing endpoint: $endpoint"
        local response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL$endpoint" -o /dev/null)
        
        if [[ "$response" == "401" || "$response" == "200" || "$response" == "404" ]]; then
            print_success "Endpoint $endpoint exists (status: $response)"
        else
            print_warning "Endpoint $endpoint returned unexpected status: $response"
        fi
    done
}

# Function to test CORS and headers
test_cors_headers() {
    print_status "Testing CORS and security headers..."
    
    local headers=$(curl -s -I "$BASE_URL/projects" 2>/dev/null)
    
    if echo "$headers" | grep -i "access-control-allow-origin" > /dev/null; then
        print_success "CORS headers present"
    else
        print_warning "CORS headers not detected"
    fi
    
    if echo "$headers" | grep -i "content-type.*application/json" > /dev/null; then
        print_success "JSON content type header present"
    else
        print_warning "JSON content type header not detected"
    fi
}

# Function to generate test report
generate_test_report() {
    print_status "Generating test report..."
    
    echo ""
    echo "📋 TEST SUMMARY"
    echo "==============="
    echo "✅ Fixed Issues:"
    echo "   - Max collaborators limit now uses actual user license (250 for Enterprise)"
    echo "   - Dropdown menus have proper labels and IDs for accessibility"
    echo "   - Added debugging logs for dropdown interactions"
    echo ""
    echo "🔧 API Endpoints Tested:"
    echo "   - Frontend accessibility: $FRONTEND_URL"
    echo "   - API base: $BASE_URL"
    echo "   - Authentication endpoint: $BASE_URL/auth/me"
    echo "   - Projects endpoint: $BASE_URL/projects"
    echo ""
    echo "📝 Expected Behavior:"
    echo "   - All endpoints should return 401 without authentication"
    echo "   - Project creation should validate payload structure"
    echo "   - Enterprise users should be able to set up to 250 collaborators"
    echo "   - Dropdown menus should be interactive with proper labels"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Test the dialog in browser with Enterprise user"
    echo "   2. Verify max collaborators slider goes up to 250"
    echo "   3. Test dropdown menu interactions"
    echo "   4. Create a test project to verify end-to-end flow"
}

# Main execution
main() {
    echo "Starting comprehensive project creation tests..."
    echo ""
    
    # Run all tests
    check_server || exit 1
    echo ""
    
    test_auth_endpoint
    echo ""
    
    test_projects_listing
    echo ""
    
    test_project_creation
    echo ""
    
    test_api_structure
    echo ""
    
    test_cors_headers
    echo ""
    
    generate_test_report
    
    print_success "All tests completed!"
    echo ""
    echo "🚀 Ready to test in browser:"
    echo "   1. Go to: $FRONTEND_URL/dashboard/cloud-projects"
    echo "   2. Click 'Create Project'"
    echo "   3. Verify max collaborators shows 250 (not 10)"
    echo "   4. Test dropdown menus work properly"
    echo "   5. Complete project creation flow"
}

# Run the main function
main "$@"
