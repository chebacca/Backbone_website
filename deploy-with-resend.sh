#!/bin/bash

# Deploy with Resend email configuration and Stripe setup
# This script sets the environment variables and deploys to Firebase

echo "🚀 Deploying Dashboard v14 with Resend email service..."

# Set environment variables for deployment
export FRONTEND_URL="https://backbone-logic.web.app"
export CORS_ORIGIN="https://backbone-logic.web.app"

# Check if Resend API key is set
if [ -z "$RESEND_API_KEY" ]; then
    echo "⚠️  RESEND_API_KEY not set. Please set it first:"
    echo "export RESEND_API_KEY=re_your_api_key_here"
    echo ""
    echo "Or set these environment variables:"
    echo "export RESEND_FROM_EMAIL=noreply@backbone-logic.com"
    echo "export RESEND_FROM_NAME='Backbone Logic'"
    echo ""
    echo "Then run: ./deploy-with-resend.sh"
    exit 1
fi

# Set default values if not provided
export RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL:-"noreply@backbone-logic.com"}
export RESEND_FROM_NAME=${RESEND_FROM_NAME:-"Backbone Logic"}

# Check Stripe configuration
echo "📧 Email Configuration:"
echo "   Provider: Resend"
echo "   From Email: $RESEND_FROM_EMAIL"
echo "   From Name: $RESEND_FROM_NAME"
echo "   Frontend URL: $FRONTEND_URL"
echo ""

echo "💳 Stripe Configuration:"
if [ "$STRIPE_ENABLED" = "false" ]; then
    echo "   Status: DISABLED"
    echo "   Payment features will be hidden"
elif [ -n "$STRIPE_SECRET_KEY" ] && [ -n "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo "   Status: ENABLED"
    echo "   Test Mode: ${STRIPE_TEST_MODE:-false}"
    echo "   Keys: Configured"
else
    echo "   Status: NOT CONFIGURED"
    echo "   Run './setup-stripe.sh' to configure Stripe or disable it"
    echo ""
    echo "   For now, disabling Stripe to allow deployment..."
    export STRIPE_ENABLED=false
fi
echo ""

# Build the project
echo "🔨 Building project..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting,functions,firestore,storage

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📧 Test your email system:"
    echo "1. Go to: https://backbone-logic.web.app/register"
    echo "2. Register with: Chebacca2012@gmail.com"
    echo "3. Check if welcome email arrives"
    echo "4. Click verification link"
    echo "5. Verify account is marked as verified"
    echo ""
    if [ "$STRIPE_ENABLED" = "false" ]; then
        echo "💳 Stripe is currently disabled."
        echo "   Run './setup-stripe.sh' to enable payment features"
    else
        echo "💳 Stripe is enabled. Test payments with test card: 4242 4242 4242 4242"
    fi
    echo ""
    echo "🔍 Check logs: firebase functions:log --only api"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
