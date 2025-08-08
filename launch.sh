#!/bin/bash

# Dashboard v14 Licensing Website Launch Script
# This script launches both the backend and frontend servers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=3003
FRONTEND_PORT=3002
BACKEND_URL="http://localhost:${BACKEND_PORT}"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
HEALTH_CHECK_ENDPOINT="${BACKEND_URL}/health"

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

# Function to wait for server to be ready
wait_for_server() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for server to be ready at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "Server is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Server failed to start within expected time"
    return 1
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm first:"
        echo "npm install -g pnpm"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Check if .env file exists in server directory
    if [ ! -f "server/.env" ]; then
        print_warning "No .env file found in server directory. Creating from example..."
        if [ -f "server/env.example" ]; then
            cp server/env.example server/.env
            print_success "Created .env file from example"
        else
            print_warning "No env.example file found. You may need to configure environment variables manually."
        fi
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        pnpm install
        print_success "Dependencies installed"
    fi
    
    # Setup database
    print_status "Setting up database..."
    cd server
    pnpm db:generate
    pnpm db:push
    cd ..
    print_success "Database setup complete"
}

# Function to kill processes on specified ports
kill_processes_on_ports() {
    local ports=("$@")
    
    for port in "${ports[@]}"; do
        if check_port $port; then
            print_warning "Port $port is in use. Killing existing process..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
    done
}

# Function to start backend
start_backend() {
    print_status "Starting backend server on port $BACKEND_PORT..."
    
    # Kill any existing process on the port
    kill_processes_on_ports $BACKEND_PORT
    
    # Start backend in background
    cd server
    pnpm dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to be ready
    if wait_for_server "$HEALTH_CHECK_ENDPOINT"; then
        print_success "Backend server started successfully"
        return 0
    else
        print_error "Backend server failed to start"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend server on port $FRONTEND_PORT..."
    
    # Kill any existing process on the port
    kill_processes_on_ports $FRONTEND_PORT
    
    # Start frontend in background
    cd client
    pnpm dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to be ready
    if wait_for_server "$FRONTEND_URL"; then
        print_success "Frontend server started successfully"
        return 0
    else
        print_error "Frontend server failed to start"
        return 1
    fi
}

# Function to display status
show_status() {
    echo
    print_status "=== Dashboard v14 Licensing Website Status ==="
    echo
    
    # Check backend
    if check_port $BACKEND_PORT; then
        print_success "Backend: Running on $BACKEND_URL"
        if curl -s "$HEALTH_CHECK_ENDPOINT" >/dev/null 2>&1; then
            print_success "Backend Health: OK"
        else
            print_warning "Backend Health: Unresponsive"
        fi
    else
        print_error "Backend: Not running"
    fi
    
    # Check frontend
    if check_port $FRONTEND_PORT; then
        print_success "Frontend: Running on $FRONTEND_URL"
    else
        print_error "Frontend: Not running"
    fi
    
    echo
    print_status "=== Access URLs ==="
    echo "Frontend: $FRONTEND_URL"
    echo "Backend API: $BACKEND_URL"
    echo "Health Check: $HEALTH_CHECK_ENDPOINT"
    echo
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on our ports
    kill_processes_on_ports $BACKEND_PORT $FRONTEND_PORT
    
    print_success "Cleanup complete"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Main execution
main() {
    echo
    print_status "🚀 Starting Dashboard v14 Licensing Website..."
    echo
    
    # Kill any existing processes on our ports first
    print_status "Cleaning up any existing processes on ports $FRONTEND_PORT and $BACKEND_PORT..."
    kill_processes_on_ports $FRONTEND_PORT $BACKEND_PORT
    echo
    
    # Check dependencies
    check_dependencies
    
    # Setup environment
    setup_environment
    
    # Start backend
    if start_backend; then
        # Start frontend
        if start_frontend; then
            print_success "🎉 All servers started successfully!"
            show_status
            
            print_status "Press Ctrl+C to stop all servers"
            
            # Keep script running
            while true; do
                sleep 10
                # Optional: periodic status check
                if ! check_port $BACKEND_PORT || ! check_port $FRONTEND_PORT; then
                    print_warning "One or more servers stopped unexpectedly"
                    break
                fi
            done
        else
            print_error "Failed to start frontend"
            exit 1
        fi
    else
        print_error "Failed to start backend"
        exit 1
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
