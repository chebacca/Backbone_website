#!/bin/zsh

# Convert <motion.div ...> to <Box component={motion.div} ...> and </motion.div> to </Box>
# Ensures framer-motion import exists

set -e

echo "🔄 Converting motion.div to MUI Box with component={motion.div}..."

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

ensure_import() {
  local file="$1"
  if ! grep -q "from 'framer-motion'" "$file" && ! grep -q 'from "framer-motion"' "$file"; then
    # Insert after first React import
    gsed -i "/^import React/ a import { motion } from 'framer-motion';" "$file" 2>/dev/null || \
    sed -i '' "/^import React/ a\
import { motion } from 'framer-motion';" "$file"
  fi
}

for file in ${FILES[@]}; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    # macOS sed in-place
    sed -i '' 's#<motion\.div#<Box component={motion.div}#g' "$file"
    sed -i '' 's#</motion\.div>#</Box>#g' "$file"
    ensure_import "$file"
  else
    echo "⚠️  Skipping missing file: $file"
  fi
done

echo "✅ Conversion complete. Try building the client again."
