#!/bin/bash

# Dashboard v14 Licensing Website - Quick Start Script
# This script sets up the development environment or deploys to Firebase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Dashboard v14 Licensing Website - Quick Start${NC}"
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

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed."
        echo "Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
}

# Check if user is logged into Firebase
check_firebase_login() {
    if ! firebase projects:list &> /dev/null; then
        print_error "You are not logged into Firebase."
        echo "Please run: firebase login"
        exit 1
    fi
}

# Function to start development environment
start_development() {
    print_status "Starting development environment..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    pnpm install
    
    # Check if environment files exist
    if [ ! -f "server/.env" ]; then
        print_warning "No .env file found in server directory."
        if [ -f "server/env.example" ]; then
            print_status "Creating .env file from example..."
            cp server/env.example server/.env
            print_success "Created .env file. Please update it with your configuration."
        else
            print_error "No env.example file found. Please create a .env file manually."
            exit 1
        fi
    fi
    
    # Start development servers
    print_status "Starting development servers..."
    pnpm dev &
    DEV_PID=$!
    
    # Wait for servers to start
    sleep 8
    
    print_success "Development environment started!"
    print_status "Frontend: http://localhost:3002"
    print_status "Backend: http://localhost:3003"
    print_status "Press Ctrl+C to stop"
    
    # Wait for user to stop
    wait $DEV_PID
}

# Function to deploy to Firebase
deploy_to_firebase() {
    print_status "Deploying to Firebase..."
    
    check_firebase_cli
    check_firebase_login
    
    # Check if firebase.json exists
    if [ ! -f "firebase.json" ]; then
        print_error "firebase.json not found. Please run 'firebase init' first."
        exit 1
    fi
    
    # Build the project
    print_status "Building project..."
    pnpm build
    
    # Deploy to Firebase
    print_status "Deploying to Firebase..."
    firebase deploy
    
    print_success "Deployment completed!"
    print_status "Your app is now live on Firebase!"
}

# Function to initialize Firebase project
init_firebase() {
    print_status "Initializing Firebase project..."
    
    check_firebase_cli
    check_firebase_login
    
    # Initialize Firebase
    firebase init
    
    print_success "Firebase project initialized!"
    print_status "You can now deploy with: $0 deploy"
}

# Function to show help
show_help() {
    echo "Dashboard v14 Licensing Website - Quick Start"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev, development    Start development environment (default)"
    echo "  deploy              Deploy to Firebase"
    echo "  init                Initialize Firebase project"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Start development environment"
    echo "  $0 dev              # Start development environment"
    echo "  $0 deploy           # Deploy to Firebase"
    echo "  $0 init             # Initialize Firebase project"
    echo ""
}

# Main script logic
case "${1:-dev}" in
    "dev"|"development")
        start_development
        ;;
    "deploy")
        deploy_to_firebase
        ;;
    "init")
        init_firebase
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
