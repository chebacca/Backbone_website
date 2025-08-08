#!/bin/bash

# Quick Start Script for Dashboard v14 Licensing Website
# Simple script that uses the existing pnpm dev command

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Dashboard v14 Licensing Website...${NC}"
echo

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
    
    for port in "${ports[@]}"; do
        if check_port $port; then
            echo -e "${YELLOW}⚠️  Port $port is in use. Killing existing process...${NC}"
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
    done
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start Docker database container
echo "🐳 Starting database container..."
if ! docker ps | grep -q "dashboard-v14-licensing-website-db-1"; then
    echo "Starting database container..."
    docker-compose up -d db
    echo "Waiting for database to be ready..."
    sleep 10
else
    echo "Database container is already running"
fi

# Setup database
echo "🗄️  Setting up database..."
cd server
pnpm db:generate
pnpm db:push
cd ..

# Kill any existing processes on our ports first
echo -e "${YELLOW}🧹 Cleaning up any existing processes on ports 3002 and 3003...${NC}"
kill_processes_on_ports 3002 3003
echo

# Start both servers using the existing dev script
echo -e "${GREEN}🎯 Starting backend and frontend servers...${NC}"
echo "Frontend will be available at: http://localhost:3002"
echo "Backend API will be available at: http://localhost:3003"
echo
echo "Press Ctrl+C to stop all servers"
echo

# Use npx to run the commands directly
echo "Starting servers..."

# Start backend
echo "Starting backend server..."
cd server
npx tsx src/index.ts &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend server..."
cd client
npx vite --port 3002 --host &
FRONTEND_PID=$!
cd ..

# Wait for both servers to start
sleep 5

# Check if servers are running
echo "Checking server status..."
if curl -s http://localhost:3003/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server started successfully${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
fi

if curl -s http://localhost:3002 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend server started successfully${NC}"
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
fi

echo
echo -e "${GREEN}🎉 Servers are running!${NC}"
echo "Frontend: http://localhost:3002"
echo "Backend: http://localhost:3003"

# Keep script running and handle cleanup
trap 'echo "Shutting down servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT TERM
wait
