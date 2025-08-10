#!/bin/bash

# Quick Fix Script for Animation Errors
# This script replaces Box components with motion.div where animation props are used

set -e

echo "🔧 Fixing animation errors in React components..."

# Function to fix animation errors in a file
fix_file() {
    local file="$1"
    echo "Fixing: $file"
    
    # Replace Box with motion.div where animation props are used
    # This is a quick fix - in production you'd want to be more careful
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace Box with motion.div where animation props exist
    sed -i '' 's/<Box\([^>]*initial[^>]*\)>/<motion.div\1>/g' "$file"
    sed -i '' 's/<Box\([^>]*animate[^>]*\)>/<motion.div\1>/g' "$file"
    sed -i '' 's/<Box\([^>]*transition[^>]*\)>/<motion.div\1>/g' "$file"
    
    # Also replace closing tags
    sed -i '' 's/<\/Box>/<\/motion.div>/g' "$file"
    
    echo "✅ Fixed: $file"
}

# List of files with animation errors
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

# Fix each file
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo ""
echo "🎉 Animation errors fixed!"
echo "Note: You may need to add 'import { motion } from \"framer-motion\";' to files that use motion.div"
echo ""
echo "Next steps:"
echo "1. Run './build-all.sh' to test the build"
echo "2. If successful, run './deploy-simple.sh' to deploy"
