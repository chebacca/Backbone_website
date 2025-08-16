#!/bin/bash

# Firebase Extensions Monitor Script
# This script provides easy monitoring for your Phase 1 Firebase extensions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Firebase Extensions Monitor - Phase 1${NC}"
echo "=================================================="
echo ""

# Function to check if Firebase CLI is available
check_firebase() {
    if ! command -v firebase &> /dev/null; then
        echo -e "${RED}❌ Firebase CLI not found. Please install it first:${NC}"
        echo "npm install -g firebase-tools"
        exit 1
    fi
}

# Function to check extension status
check_extensions() {
    echo -e "${BLUE}📊 Checking Extension Status...${NC}"
    echo ""
    
    firebase ext:list
    
    echo ""
    echo -e "${GREEN}✅ Extension status check complete${NC}"
}

# Function to check function metrics
check_functions() {
    echo -e "${BLUE}⚡ Checking Function Metrics...${NC}"
    echo ""
    
    # Get function logs for the last hour
    echo "Recent function logs (last hour):"
    firebase functions:log --only api --limit 10
    
    echo ""
    echo -e "${GREEN}✅ Function metrics check complete${NC}"
}

# Function to deploy extensions
deploy_extensions() {
    echo -e "${BLUE}🚀 Deploying Extensions...${NC}"
    echo ""
    
    firebase deploy --only extensions
    
    echo ""
    echo -e "${GREEN}✅ Extensions deployment complete${NC}"
}

# Function to show extension configuration
show_config() {
    echo -e "${BLUE}⚙️  Extension Configuration${NC}"
    echo ""
    
    echo "Current extensions in firebase.json:"
    cat firebase.json | grep -A 10 '"extensions"'
    
    echo ""
    echo -e "${GREEN}✅ Configuration check complete${NC}"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status     - Check extension status"
    echo "  functions  - Check function metrics"
    echo "  deploy     - Deploy all extensions"
    echo "  config     - Show extension configuration"
    echo "  all        - Run all checks"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 all"
}

# Main script logic
main() {
    check_firebase
    
    case "${1:-help}" in
        "status")
            check_extensions
            ;;
        "functions")
            check_functions
            ;;
        "deploy")
            deploy_extensions
            ;;
        "config")
            show_config
            ;;
        "all")
            check_extensions
            echo ""
            check_functions
            echo ""
            show_config
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"
