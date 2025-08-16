#!/bin/bash

# Quick fix script to replace Box components with motion props to motion.div
# This fixes the TypeScript errors preventing the build

echo "🔧 Fixing Box components with motion props..."

# Find and replace Box components with motion props
find client/src -name "*.tsx" -exec sed -i '' 's/<Box[^>]*initial={[^}]*}[^>]*>/<motion.div/g' {} \;
find client/src -name "*.tsx" -exec sed -i '' 's/<\/Box>/<\/motion.div>/g' {} \;

# Also fix any remaining Box components that might have been missed
find client/src -name "*.tsx" -exec sed -i '' 's/<Box[^>]*animate={[^}]*}[^>]*>/<motion.div/g' {} \;

echo "✅ Fixed Box components with motion props"
echo "Now try building again: cd client && pnpm build"
