#!/bin/bash

# Dashboard v14 Licensing Website Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting Dashboard v14 Licensing Website Deployment..."

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

# Load environment variables
load_environment() {
    info "Loading environment variables..."
    
    if [ ! -f .env ]; then
        error ".env file not found. Please create one based on .env.example"
    fi
    
    source .env
    
    # Check required environment variables
    required_vars=(
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "STRIPE_PUBLISHABLE_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "SMTP_HOST"
        "SMTP_USER"
        "SMTP_PASS"
        "FROM_EMAIL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Environment variables loaded"
}

# Build the application
build_application() {
    info "Building application..."
    
    # Install dependencies
    info "Installing dependencies..."
    pnpm install
    
    # Build shared types
    info "Building shared types..."
    cd shared && pnpm run build && cd ..
    
    # Build client
    info "Building client application..."
    cd client && pnpm run build && cd ..
    
    # Prepare server
    info "Preparing server..."
    cd server && pnpm run build && cd ..
    
    success "Application built successfully"
}

# Database operations
setup_database() {
    info "Setting up database..."
    
    # Start database container
    docker-compose up -d db
    
    # Wait for database to be ready
    info "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    info "Running database migrations..."
    cd server
    pnpm prisma migrate deploy
    pnpm prisma generate
    cd ..
    
    success "Database setup completed"
}

# Deploy with Docker
deploy_containers() {
    info "Deploying containers..."
    
    # Build and start all services
    docker-compose build
    docker-compose up -d
    
    # Wait for services to be ready
    info "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        error "Some services failed to start. Check logs with 'docker-compose logs'"
    fi
    
    success "All containers deployed successfully"
}

# Health check
health_check() {
    info "Performing health checks..."
    
    # Check API health
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3003/api/health > /dev/null; then
            success "API is healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "API health check failed after $max_attempts attempts"
        fi
        
        info "Attempt $attempt/$max_attempts: API not ready, waiting..."
        sleep 5
        ((attempt++))
    done
    
    # Check web application
    if curl -f -s http://localhost:3002 > /dev/null; then
        success "Web application is healthy"
    else
        error "Web application health check failed"
    fi
}

# Cleanup old containers and images
cleanup() {
    info "Cleaning up old containers and images..."
    
    # Remove old containers
    docker-compose down --remove-orphans
    
    # Remove unused images
    docker image prune -f
    
    success "Cleanup completed"
}

# Display deployment information
show_deployment_info() {
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Deployment Information:"
    echo "------------------------"
    echo "🌐 Web Application: http://localhost:3002"
    echo "🔧 API Server: http://localhost:3003"
    echo "📊 Database: PostgreSQL on localhost:5432"
    echo ""
    echo "📱 Management Commands:"
    echo "• View logs: docker-compose logs -f"
    echo "• Stop services: docker-compose down"
    echo "• Restart services: docker-compose restart"
    echo "• Database console: docker-compose exec db psql -U licensing_user -d licensing_db"
    echo ""
    echo "🔗 Important URLs:"
    echo "• Landing Page: http://localhost:3002"
    echo "• Login: http://localhost:3002/login"
    echo "• Dashboard: http://localhost:3002/dashboard"
    echo "• API Health: http://localhost:3003/api/health"
    echo ""
}

# Main deployment process
main() {
    echo "========================================"
    echo "Dashboard v14 Licensing Website Deploy"
    echo "========================================"
    echo ""
    
    check_dependencies
    load_environment
    cleanup
    build_application
    setup_database
    deploy_containers
    health_check
    show_deployment_info
    
    success "🚀 Deployment completed successfully!"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
