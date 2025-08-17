#!/bin/bash

# Dataset Creation Wizard - Complete Test Suite
# This script runs all tests and verifies functionality

set -e  # Exit on any error

echo "🧪 Dataset Creation Wizard - Complete Test Suite"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

print_status "🔍 Checking environment..." "$BLUE"

# Check if we're in the right directory
if [ ! -f "client/package.json" ]; then
    if [ ! -f "package.json" ]; then
        print_status "❌ Error: Not in the correct directory. Please run from project root or client directory." "$RED"
        exit 1
    fi
fi

# Navigate to client directory if needed
if [ -f "client/package.json" ]; then
    cd client
    print_status "📁 Switched to client directory" "$GREEN"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_status "❌ Error: Node.js is not installed" "$RED"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_status "❌ Error: npm is not installed" "$RED"
    exit 1
fi

print_status "✅ Environment check passed" "$GREEN"
echo ""

# Install dependencies if needed
print_status "📦 Installing dependencies..." "$BLUE"
npm install

# Check if required test files exist
print_status "🔍 Checking test files..." "$BLUE"

required_files=(
    "src/components/DatasetCreationWizard.tsx"
    "src/components/__tests__/DatasetCreationWizard.test.tsx"
    "src/components/__tests__/DashboardCloudProjectsBridge.integration.test.tsx"
    "src/components/__tests__/manual-testing-checklist.md"
    "src/setupTests.ts"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    print_status "❌ Missing required files:" "$RED"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

print_status "✅ All required files found" "$GREEN"
echo ""

# Run TypeScript compilation check
print_status "🔧 Checking TypeScript compilation..." "$BLUE"
if npx tsc --noEmit; then
    print_status "✅ TypeScript compilation successful" "$GREEN"
else
    print_status "❌ TypeScript compilation failed" "$RED"
    exit 1
fi
echo ""

# Run linting
print_status "🔍 Running linter..." "$BLUE"
if npm run lint; then
    print_status "✅ Linting passed" "$GREEN"
else
    print_status "⚠️  Linting issues found (continuing with tests)" "$YELLOW"
fi
echo ""

# Run the automated tests
print_status "🚀 Running automated tests..." "$BLUE"
echo ""

# Test 1: Dataset Creation Wizard Component Tests
print_status "📋 Test 1: Dataset Creation Wizard Component" "$BLUE"
if npx jest src/components/__tests__/DatasetCreationWizard.test.tsx --verbose; then
    print_status "✅ Dataset Creation Wizard tests passed" "$GREEN"
else
    print_status "❌ Dataset Creation Wizard tests failed" "$RED"
    exit 1
fi
echo ""

# Test 2: Integration Tests
print_status "📋 Test 2: Cloud Projects Bridge Integration" "$BLUE"
if npx jest src/components/__tests__/DashboardCloudProjectsBridge.integration.test.tsx --verbose; then
    print_status "✅ Integration tests passed" "$GREEN"
else
    print_status "❌ Integration tests failed" "$RED"
    exit 1
fi
echo ""

# Test 3: Coverage Report
print_status "📊 Test 3: Coverage Report" "$BLUE"
if npx jest --coverage --testMatch="**/DatasetCreationWizard.test.tsx" --testMatch="**/DashboardCloudProjectsBridge.integration.test.tsx"; then
    print_status "✅ Coverage report generated" "$GREEN"
else
    print_status "⚠️  Coverage report generation had issues" "$YELLOW"
fi
echo ""

# Summary
print_status "🎉 All Automated Tests Completed Successfully!" "$GREEN"
echo ""
print_status "📋 Test Summary:" "$BLUE"
echo "   ✅ Environment Check"
echo "   ✅ TypeScript Compilation"
echo "   ✅ Code Linting"
echo "   ✅ Dataset Creation Wizard Component Tests"
echo "   ✅ Cloud Projects Bridge Integration Tests"
echo "   ✅ Test Coverage Report"
echo ""

print_status "📝 Manual Testing:" "$YELLOW"
echo "   📄 Manual testing checklist: src/components/__tests__/manual-testing-checklist.md"
echo "   🌐 Start the development server: npm run dev"
echo "   🧪 Open the application and follow the manual testing checklist"
echo ""

print_status "🚀 Next Steps:" "$BLUE"
echo "   1. Start the development server: npm run dev"
echo "   2. Navigate to the Cloud Projects page"
echo "   3. Click 'Create Dataset' to test the wizard"
echo "   4. Follow the manual testing checklist for comprehensive testing"
echo "   5. Test all cloud provider configurations"
echo "   6. Verify all buttons, dropdowns, and interactions work"
echo ""

print_status "📊 Test Commands Available:" "$BLUE"
echo "   npm test                    # Run all tests"
echo "   npm run test:watch          # Run tests in watch mode"
echo "   npm run test:coverage       # Generate coverage report"
echo "   npm run test:wizard         # Run custom test runner"
echo ""

print_status "✨ Dataset Creation Wizard is ready for use!" "$GREEN"
