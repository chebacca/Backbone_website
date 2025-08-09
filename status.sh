#!/bin/bash

# Dashboard v14 Licensing Website - Status Check Script
# This script checks the status of development servers or Firebase deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Dashboard v14 Licensing Website - Status Check${NC}"
echo

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to check development environment
check_dev_environment() {
    print_status "Checking development environment..."
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed"
        return 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        return 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        return 1
    fi
    
    print_success "Development environment is ready"
    
    # Check if servers are running
    echo
    print_status "Checking server status..."
    
    if check_port 3003; then
        if curl -s http://localhost:3003/health >/dev/null 2>&1; then
            print_success "Backend server is running and healthy"
        else
            print_warning "Backend server is running but not responding"
        fi
    else
        print_error "Backend server is not running"
    fi
    
    if check_port 3002; then
        if curl -s http://localhost:3002 >/dev/null 2>&1; then
            print_success "Frontend server is running"
        else
            print_warning "Frontend server is running but not responding"
        fi
    else
        print_error "Frontend server is not running"
    fi
}

# Function to check Firebase deployment
check_firebase_deployment() {
    print_status "Checking Firebase deployment..."
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed"
        return 1
    fi
    
    # Check if user is logged into Firebase
    if ! firebase projects:list &> /dev/null; then
        print_error "You are not logged into Firebase"
        return 1
    fi
    
    print_success "Firebase CLI is ready"
    
    # Get current project
    local project_id=$(firebase use 2>/dev/null | grep -o '\[.*\]' | tr -d '[]' || echo "No project selected")
    print_status "Current Firebase project: $project_id"
    
    # Check if firebase.json exists
    if [ ! -f "firebase.json" ]; then
        print_error "firebase.json not found. Please run 'firebase init' first"
        return 1
    fi
    
    print_success "Firebase configuration is valid"
}

# Function to show help
show_help() {
    echo "Dashboard v14 Licensing Website - Status Check"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev, development    Check development environment (default)"
    echo "  firebase            Check Firebase deployment"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Check development environment"
    echo "  $0 dev              # Check development environment"
    echo "  $0 firebase         # Check Firebase deployment"
    echo ""
}

# Main script logic
case "${1:-dev}" in
    "dev"|"development")
        check_dev_environment
        ;;
    "firebase")
        check_firebase_deployment
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
