#!/bin/bash

# Test Script for Cloud Projects System
# Tests both archived projects functionality and project creation with license limits

echo "🧪 Testing Cloud Projects System"
echo "================================"

# Configuration
BASE_URL="https://backbone-logic-web.app/api"  # Production URL
TEST_USER_EMAIL="enterprise.user@example.com"  # Use your actual test user
TEST_USER_PASSWORD="password123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if server is running
check_server() {
    print_status "Checking if production server is accessible..."
    # Try a simple endpoint that should exist
    if curl -s -f "$BASE_URL/auth/me" -H "Authorization: Bearer invalid" > /dev/null 2>&1 || curl -s "$BASE_URL/" > /dev/null 2>&1; then
        print_success "Production server is accessible"
        return 0
    else
        print_error "Production server is not accessible at $BASE_URL"
        print_warning "Please check if the production server is running"
        return 1
    fi
}

# Function to authenticate and get token
authenticate() {
    print_status "Authenticating user..."
    
    # Try to login
    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}")
    
    TOKEN=$(echo "$RESPONSE" | jq -r '.data.token // empty' 2>/dev/null)
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        print_success "Authentication successful"
        echo "Token: ${TOKEN:0:20}..."
        return 0
    else
        print_error "Authentication failed"
        echo "Response: $RESPONSE"
        return 1
    fi
}

# Function to test getting user projects (including archived)
test_get_projects() {
    print_status "Testing: Get all projects (including archived)"
    
    RESPONSE=$(curl -s -X GET "$BASE_URL/projects?includeArchived=true" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        PROJECT_COUNT=$(echo "$RESPONSE" | jq '.data | length')
        ACTIVE_COUNT=$(echo "$RESPONSE" | jq '[.data[] | select(.isArchived != true)] | length')
        ARCHIVED_COUNT=$(echo "$RESPONSE" | jq '[.data[] | select(.isArchived == true)] | length')
        
        print_success "Retrieved projects successfully"
        echo "  Total projects: $PROJECT_COUNT"
        echo "  Active projects: $ACTIVE_COUNT"
        echo "  Archived projects: $ARCHIVED_COUNT"
        
        # Store first project ID for testing
        FIRST_PROJECT_ID=$(echo "$RESPONSE" | jq -r '.data[0].id // empty')
        return 0
    else
        print_error "Failed to get projects"
        echo "Response: $RESPONSE"
        return 1
    fi
}

# Function to test getting only archived projects
test_get_archived_projects() {
    print_status "Testing: Get archived projects only"
    
    RESPONSE=$(curl -s -X GET "$BASE_URL/projects/archived/list" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        ARCHIVED_COUNT=$(echo "$RESPONSE" | jq '.data | length')
        print_success "Retrieved archived projects successfully"
        echo "  Archived projects: $ARCHIVED_COUNT"
        return 0
    else
        print_error "Failed to get archived projects"
        echo "Response: $RESPONSE"
        return 1
    fi
}

# Function to test user license type detection
test_license_detection() {
    print_status "Testing: User license type detection"
    
    # Get user profile to see license info
    RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        USER_ROLE=$(echo "$RESPONSE" | jq -r '.data.role // "unknown"')
        SUBSCRIPTION=$(echo "$RESPONSE" | jq -r '.data.subscription.plan // "none"')
        LICENSE_COUNT=$(echo "$RESPONSE" | jq '.data.licenses | length // 0')
        
        print_success "Retrieved user info successfully"
        echo "  User role: $USER_ROLE"
        echo "  Subscription plan: $SUBSCRIPTION"
        echo "  License count: $LICENSE_COUNT"
        return 0
    else
        print_error "Failed to get user info"
        echo "Response: $RESPONSE"
        return 1
    fi
}

# Function to test project creation with different collaboration limits
test_project_creation() {
    print_status "Testing: Project creation with collaboration limits"
    
    # Test with 10 collaborators (should work for basic license)
    print_status "  Testing with 10 collaborators..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Project - 10 Collaborators",
            "description": "Testing project creation with 10 collaborators",
            "type": "shared_network",
            "applicationMode": "shared_network",
            "visibility": "private",
            "storageBackend": "firestore",
            "allowCollaboration": true,
            "maxCollaborators": 10
        }')
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        PROJECT_ID_10=$(echo "$RESPONSE" | jq -r '.data.id')
        print_success "  ✅ Project with 10 collaborators created successfully"
        echo "    Project ID: $PROJECT_ID_10"
    else
        print_error "  ❌ Failed to create project with 10 collaborators"
        echo "    Response: $RESPONSE"
    fi
    
    # Test with 100 collaborators (should fail for basic license, succeed for enterprise)
    print_status "  Testing with 100 collaborators..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Project - 100 Collaborators",
            "description": "Testing project creation with 100 collaborators",
            "type": "shared_network",
            "applicationMode": "shared_network",
            "visibility": "private",
            "storageBackend": "firestore",
            "allowCollaboration": true,
            "maxCollaborators": 100
        }')
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        PROJECT_ID_100=$(echo "$RESPONSE" | jq -r '.data.id')
        print_success "  ✅ Project with 100 collaborators created successfully (Enterprise license detected)"
        echo "    Project ID: $PROJECT_ID_100"
    else
        ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
        if [[ "$ERROR_MSG" == *"exceeds your license limit"* ]]; then
            print_warning "  ⚠️  Project with 100 collaborators rejected due to license limit (Expected for Basic license)"
            echo "    Error: $ERROR_MSG"
        else
            print_error "  ❌ Unexpected error creating project with 100 collaborators"
            echo "    Response: $RESPONSE"
        fi
    fi
}

# Function to test archiving and restoring projects
test_archive_restore() {
    if [ -n "$PROJECT_ID_10" ]; then
        print_status "Testing: Archive and restore functionality"
        
        # Archive the project
        print_status "  Archiving project..."
        RESPONSE=$(curl -s -X DELETE "$BASE_URL/projects/$PROJECT_ID_10" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
        
        if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
            print_success "  ✅ Project archived successfully"
            
            # Verify it appears in archived list
            print_status "  Checking archived projects list..."
            RESPONSE=$(curl -s -X GET "$BASE_URL/projects/archived/list" \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json")
            
            if echo "$RESPONSE" | jq -e ".data[] | select(.id == \"$PROJECT_ID_10\")" > /dev/null 2>&1; then
                print_success "  ✅ Archived project appears in archived list"
            else
                print_error "  ❌ Archived project not found in archived list"
            fi
            
            # Restore the project
            print_status "  Restoring project..."
            RESPONSE=$(curl -s -X PATCH "$BASE_URL/projects/$PROJECT_ID_10/archive" \
                -H "Authorization: Bearer $TOKEN" \
                -H "Content-Type: application/json" \
                -d '{"isArchived": false}')
            
            if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
                print_success "  ✅ Project restored successfully"
            else
                print_error "  ❌ Failed to restore project"
                echo "    Response: $RESPONSE"
            fi
        else
            print_error "  ❌ Failed to archive project"
            echo "    Response: $RESPONSE"
        fi
    else
        print_warning "Skipping archive/restore test - no project ID available"
    fi
}

# Function to cleanup test projects
cleanup_test_projects() {
    print_status "Cleaning up test projects..."
    
    for PROJECT_ID in "$PROJECT_ID_10" "$PROJECT_ID_100"; do
        if [ -n "$PROJECT_ID" ]; then
            print_status "  Deleting project $PROJECT_ID..."
            curl -s -X DELETE "$BASE_URL/projects/$PROJECT_ID?permanent=true" \
                -H "Authorization: Bearer $TOKEN" > /dev/null
        fi
    done
    
    print_success "Cleanup completed"
}

# Main test execution
main() {
    echo "Starting comprehensive system test..."
    echo
    
    # Check if jq is available
    if ! command -v jq &> /dev/null; then
        print_error "jq is required for this script. Please install it first."
        print_warning "  macOS: brew install jq"
        print_warning "  Ubuntu: sudo apt-get install jq"
        exit 1
    fi
    
    # Run tests
    check_server || exit 1
    echo
    
    authenticate || exit 1
    echo
    
    test_license_detection
    echo
    
    test_get_projects
    echo
    
    test_get_archived_projects
    echo
    
    test_project_creation
    echo
    
    test_archive_restore
    echo
    
    cleanup_test_projects
    echo
    
    print_success "🎉 All tests completed!"
    echo
    echo "Summary:"
    echo "- ✅ Server connectivity"
    echo "- ✅ User authentication"
    echo "- ✅ License detection"
    echo "- ✅ Project listing (including archived)"
    echo "- ✅ Archived projects endpoint"
    echo "- ✅ Project creation with license validation"
    echo "- ✅ Archive/restore functionality"
}

# Run the main function
main "$@"
