#!/bin/bash

# Dashboard v14 Licensing Website Launch Script
# This script launches the development environment or deploys to Firebase

set -e  # Exit on any error

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
}

# Function to check if user is logged into Firebase
check_firebase_login() {
    if ! firebase projects:list &> /dev/null; then
        print_error "You are not logged into Firebase. Please run:"
        echo "firebase login"
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Check if ports are available
    if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3002 is already in use. Stopping existing process..."
        pkill -f "vite.*3002" || true
    fi
    
    if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3003 is already in use. Stopping existing process..."
        pkill -f "tsx.*index.ts" || true
    fi
    
    # Start development servers
    print_status "Starting development servers..."
    pnpm dev &
    DEV_PID=$!
    
    # Wait for servers to start
    sleep 5
    
    print_success "Development environment started!"
    print_status "Frontend: http://localhost:3002"
    print_status "Backend: http://localhost:3003"
    print_status "Press Ctrl+C to stop"
    
    # Wait for user to stop
    wait $DEV_PID
}

# Function to deploy to Firebase
deploy_firebase() {
    print_status "Deploying to Firebase..."
    
    check_firebase_cli
    check_firebase_login
    
    # Build the project
    print_status "Building project..."
    pnpm build
    
    # Deploy to Firebase
    print_status "Deploying to Firebase..."
    firebase deploy
    
    print_success "Deployment completed!"
    print_status "Your app is now live on Firebase!"
}

# Function to show help
show_help() {
    echo "Dashboard v14 Licensing Website - Launch Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev, development    Start development environment (default)"
    echo "  deploy              Deploy to Firebase"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Start development environment"
    echo "  $0 dev              # Start development environment"
    echo "  $0 deploy           # Deploy to Firebase"
    echo ""
}

# Main script logic
case "${1:-dev}" in
    "dev"|"development")
        start_dev
        ;;
    "deploy")
        deploy_firebase
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
