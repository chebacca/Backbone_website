#!/bin/bash

# Kill Ports Script for Dashboard v14 Licensing Website
# This script kills any processes running on ports 3002 and 3003

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=3002
BACKEND_PORT=3003

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

# Function to kill processes on specified ports
kill_processes_on_ports() {
    local ports=("$@")
    local killed_any=false
    
    for port in "${ports[@]}"; do
        if check_port $port; then
            print_warning "Port $port is in use. Killing existing process..."
            local pids=$(lsof -ti:$port 2>/dev/null)
            if [ ! -z "$pids" ]; then
                echo "$pids" | xargs kill -9 2>/dev/null || true
                sleep 1
                killed_any=true
                print_success "Killed process on port $port"
            else
                print_warning "No process found on port $port"
            fi
        else
            print_status "Port $port is already free"
        fi
    done
    
    if [ "$killed_any" = true ]; then
        print_success "Port cleanup completed"
    else
        print_status "No processes were killed - ports were already free"
    fi
}

# Function to show current port status
show_port_status() {
    echo
    print_status "=== Current Port Status ==="
    
    if check_port $FRONTEND_PORT; then
        print_warning "Port $FRONTEND_PORT: IN USE"
        local frontend_pid=$(lsof -ti:$FRONTEND_PORT 2>/dev/null)
        if [ ! -z "$frontend_pid" ]; then
            echo "  Process ID: $frontend_pid"
            echo "  Command: $(ps -p $frontend_pid -o command= 2>/dev/null || echo 'Unknown')"
        fi
    else
        print_success "Port $FRONTEND_PORT: FREE"
    fi
    
    if check_port $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT: IN USE"
        local backend_pid=$(lsof -ti:$BACKEND_PORT 2>/dev/null)
        if [ ! -z "$backend_pid" ]; then
            echo "  Process ID: $backend_pid"
            echo "  Command: $(ps -p $backend_pid -o command= 2>/dev/null || echo 'Unknown')"
        fi
    else
        print_success "Port $BACKEND_PORT: FREE"
    fi
    
    echo
}

# Main execution
main() {
    echo
    print_status "🔫 Killing processes on Dashboard v14 Licensing Website ports..."
    echo
    
    # Show current status
    show_port_status
    
    # Kill processes on the specified ports
    kill_processes_on_ports $FRONTEND_PORT $BACKEND_PORT
    
    # Show final status
    echo
    print_status "=== Final Port Status ==="
    if check_port $FRONTEND_PORT; then
        print_warning "Port $FRONTEND_PORT: Still in use"
    else
        print_success "Port $FRONTEND_PORT: Free"
    fi
    
    if check_port $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT: Still in use"
    else
        print_success "Port $BACKEND_PORT: Free"
    fi
    
    echo
    print_success "✅ Port cleanup completed!"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
