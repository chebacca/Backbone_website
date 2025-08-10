#!/bin/bash

# Add Framer Motion Imports Script
# This script adds the framer-motion import to files that use motion.div

set -e

echo "📦 Adding framer-motion imports to fixed files..."

# Function to add framer-motion import to a file
add_import() {
    local file="$1"
    echo "Adding import to: $file"
    
    # Check if import already exists
    if grep -q "import.*motion.*from.*framer-motion" "$file"; then
        echo "✅ Import already exists in: $file"
        return
    fi
    
    # Add import after the React import
    sed -i '' '/^import React,/a\
import { motion } from "framer-motion";' "$file"
    
    echo "✅ Added import to: $file"
}

# List of files that were fixed
FILES=(
    "client/src/pages/dashboard/DashboardOverview.tsx"
    "client/src/pages/dashboard/DownloadsPage.tsx"
    "client/src/pages/dashboard/LicensesPage.tsx"
    "client/src/pages/dashboard/SettingsPage.tsx"
    "client/src/pages/dashboard/SupportPage.tsx"
    "client/src/pages/dashboard/TeamPage.tsx"
    "client/src/pages/NotFoundPage.tsx"
    "client/src/components/checkout/OrderSummary.tsx"
    "client/src/components/checkout/PaymentMethodStep.tsx"
    "client/src/components/checkout/PlanSelectionStep.tsx"
    "client/src/components/layout/DashboardLayout.tsx"
    "client/src/pages/auth/EmailVerificationPage.tsx"
    "client/src/pages/auth/ForgotPasswordPage.tsx"
    "client/src/pages/auth/LoginPage.tsx"
    "client/src/pages/auth/RegisterPage.tsx"
    "client/src/pages/auth/ResetPasswordPage.tsx"
    "client/src/pages/checkout/CheckoutPage.tsx"
    "client/src/pages/dashboard/BillingPage.tsx"
)

# Add import to each file
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        add_import "$file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo ""
echo "🎉 Framer-motion imports added!"
echo ""
echo "Next steps:"
echo "1. Run './build-all.sh' to test the build"
echo "2. If successful, run './deploy-simple.sh' to deploy"
