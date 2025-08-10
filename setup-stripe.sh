#!/bin/bash

# Stripe Setup Script for Dashboard v14
# This script helps you configure Stripe test mode or disable it

echo "🎯 Stripe Configuration for Dashboard v14"
echo "=========================================="
echo ""

echo "Choose an option:"
echo "1) 🆓 Setup Stripe Test Mode (FREE - recommended)"
echo "2) 🚫 Disable Stripe temporarily"
echo "3) 📋 Show current configuration"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "🆓 Setting up Stripe Test Mode..."
    echo ""
    echo "Please provide your Stripe test API keys:"
    echo "(Get these from https://dashboard.stripe.com/apikeys)"
    echo ""
    
    read -p "Stripe Publishable Key (pk_test_...): " publishable_key
    read -p "Stripe Secret Key (sk_test_...): " secret_key
    read -p "Stripe Webhook Secret (whsec_...): " webhook_secret
    
    echo ""
    echo "Setting environment variables..."
    
    export STRIPE_ENABLED=true
    export STRIPE_TEST_MODE=true
    export STRIPE_PUBLISHABLE_KEY="$publishable_key"
    export STRIPE_SECRET_KEY="$secret_key"
    export STRIPE_WEBHOOK_SECRET="$webhook_secret"
    
    echo "✅ Stripe test mode configured!"
    echo ""
    echo "Next steps:"
    echo "1. Create test price IDs in Stripe dashboard"
    echo "2. Set STRIPE_BASIC_PRICE_ID, STRIPE_PRO_PRICE_ID, etc."
    echo "3. Run: ./deploy-with-resend.sh"
    ;;
    
  2)
    echo ""
    echo "🚫 Disabling Stripe..."
    
    export STRIPE_ENABLED=false
    export STRIPE_TEST_MODE=false
    export STRIPE_PUBLISHABLE_KEY=""
    export STRIPE_SECRET_KEY=""
    export STRIPE_WEBHOOK_SECRET=""
    
    echo "✅ Stripe disabled!"
    echo ""
    echo "Payment features will be hidden."
    echo "User registration and email verification will still work."
    echo ""
    echo "To re-enable later, run this script again and choose option 1."
    ;;
    
  3)
    echo ""
    echo "📋 Current Stripe Configuration:"
    echo "================================="
    echo "STRIPE_ENABLED: ${STRIPE_ENABLED:-not set}"
    echo "STRIPE_TEST_MODE: ${STRIPE_TEST_MODE:-not set}"
    echo "STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY:0:20}..."
    echo "STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:20}..."
    echo "STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET:0:20}..."
    echo ""
    echo "To set these permanently, add them to your shell profile:"
    echo "~/.bashrc, ~/.zshrc, or ~/.bash_profile"
    ;;
    
  *)
    echo "❌ Invalid choice. Please run the script again."
    exit 1
    ;;
esac

echo ""
echo "🔧 To deploy with these settings:"
echo "   ./deploy-with-resend.sh"
echo ""
echo "📚 For more details, see: STRIPE_SETUP.md"
