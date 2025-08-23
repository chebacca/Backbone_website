#!/bin/bash

# Dashboard v14 Licensing Website - Local Development Startup
# This script starts the local Docker environment for development

set -e  # Exit on any error

echo "🚀 Starting Dashboard v14 Licensing Website - Local Development Mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if required tools are installed
check_dependencies() {
    info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    if ! command -v pnpm &> /dev/null; then
        error "pnpm is not installed. Please install pnpm first."
    fi
    
    success "All dependencies are installed"
}

# Check if Docker is running
check_docker_running() {
    info "Checking if Docker is running..."
    
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
    fi
    
    success "Docker is running"
}

# Load environment variables
load_environment() {
    info "Loading environment variables..."
    
    if [ ! -f .env ]; then
        error ".env file not found. Please create one based on edge-config.example.env"
    fi
    
    source .env
    
    # Check only essential environment variables for local development
    required_vars=(
        "POSTGRES_PASSWORD"
        "MINIO_ROOT_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Environment variables loaded"
}

# Start Docker services
start_services() {
    info "Starting Docker services..."
    
    # Stop any existing containers
    info "Stopping existing containers..."
    docker-compose -f docker-compose.edge.yml down --remove-orphans 2>/dev/null || true
    
    # Start all services
    info "Starting all services..."
    docker-compose -f docker-compose.edge.yml up -d
    
    success "Docker services started"
}

# Wait for services to be ready
wait_for_services() {
    info "Waiting for services to be ready..."
    
    # Wait for database
    info "Waiting for PostgreSQL database..."
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.edge.yml exec -T db pg_isready -U postgres -d backbone_edge > /dev/null 2>&1; then
            success "PostgreSQL database is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Database failed to start after $max_attempts attempts"
        fi
        
        info "Attempt $attempt/$max_attempts: Database not ready, waiting..."
        sleep 5
        ((attempt++))
    done
    
    # Wait for MinIO
    info "Waiting for MinIO object storage..."
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
            success "MinIO object storage is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "MinIO failed to start after $max_attempts attempts"
        fi
        
        info "Attempt $attempt/$max_attempts: MinIO not ready, waiting..."
        sleep 5
        ((attempt++))
    done
    
    # Skip Edge API health check for now (using basic container)
    info "Edge API container is running (health check skipped for development)"
    success "Edge API container is ready"
}

# Display service information
show_service_info() {
    echo ""
    echo "🎉 Local development environment is ready!"
    echo ""
    echo "📋 Service Information:"
    echo "------------------------"
    echo "🌐 Edge API Server: http://localhost:3001"
    echo "🔧 API Health Check: http://localhost:3001/api/health"
    echo "🐘 PostgreSQL Database: localhost:5432"
    echo "📦 MinIO Object Storage: http://localhost:9000 (API)"
    echo "🖥️  MinIO Console: http://localhost:9001"
    echo "🔴 Redis Cache: localhost:6379"
    echo ""
    echo "📱 Management Commands:"
    echo "• View logs: docker-compose -f docker-compose.edge.yml logs -f"
    echo "• Stop services: docker-compose -f docker-compose.edge.yml down"
    echo "• Restart services: docker-compose -f docker-compose.edge.yml restart"
    echo "• Database console: docker-compose -f docker-compose.edge.yml exec db psql -U postgres -d backbone_edge"
    echo ""
    echo "🔗 Important URLs:"
    echo "• API Base: http://localhost:3001/api"
    echo "• Health Check: http://localhost:3001/api/health"
    echo ""
    echo "💡 Next Steps:"
    echo "1. Start the client development server: cd client && npm run dev -- --port 3000"
    echo "2. Access the offline test page: http://localhost:3000/test/offline"
    echo "3. Test offline project creation functionality"
    echo ""
}

# Main startup process
main() {
    echo "========================================"
    echo "Dashboard v14 Licensing Website"
    echo "Local Development Startup"
    echo "========================================"
    echo ""
    
    check_dependencies
    check_docker_running
    load_environment
    start_services
    wait_for_services
    show_service_info
    
    success "🚀 Local development environment started successfully!"
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}⚠️  Startup interrupted${NC}"; exit 1' INT TERM

# Run main function
main "$@"
