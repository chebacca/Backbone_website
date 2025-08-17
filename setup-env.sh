#!/bin/bash

# Environment Setup Script for Dashboard v14 Licensing Website
# This script helps set up the required environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Environment Setup${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_header

print_status "Setting up environment variables for Dashboard v14 Licensing Website..."

# Check if .env file exists
if [ -f "client/.env" ]; then
    print_warning "client/.env file already exists. Backing up..."
    cp client/.env client/.env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create client .env file
cat > client/.env << 'EOF'
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_ENABLED=true

# API Configuration
VITE_API_BASE_URL=/api

# Google OAuth (if needed)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Apple Sign In (if needed)
VITE_APPLE_CLIENT_ID=your_apple_client_id_here
VITE_APPLE_REDIRECT_URI=https://backbone-logic.web.app

# Application Configuration
VITE_APP_NAME=Backbone Logic Dashboard v14
VITE_APP_VERSION=14.2.0
EOF

print_success "Created client/.env file"

# Check if server .env file exists
if [ -f "server/.env" ]; then
    print_warning "server/.env file already exists. Backing up..."
    cp server/.env server/.env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create server .env file
cat > server/.env << 'EOF'
# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENTS\n-----END PRIVATE KEY-----"

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_BASIC_PRICE_ID=price_your_basic_price_id
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id
STRIPE_ENABLED=true
STRIPE_TEST_MODE=true

# Email Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Dashboard v14 Licensing

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=admin123
ADMIN_SETUP_TOKEN=your_admin_setup_token

# Frontend URLs
FRONTEND_URL=https://backbone-logic.web.app
CORS_ORIGIN=https://backbone-logic.web.app
EOF

print_success "Created server/.env file"

print_status ""
print_status "Next steps:"
print_status "1. Edit client/.env and server/.env with your actual values"
print_status "2. Get your Stripe test keys from https://dashboard.stripe.com/test/apikeys"
print_status "3. Set up Firebase project and get service account credentials"
print_status "4. Run: ./build-licensing-website.sh"
print_status "5. Run: ./deploy-licensing-website.sh"
print_status ""
print_warning "IMPORTANT: Never commit .env files to version control!"
print_warning "They are already in .gitignore for security."
print_status ""
print_success "Environment setup completed!"
