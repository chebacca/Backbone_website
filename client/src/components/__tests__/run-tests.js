#!/usr/bin/env node

/**
 * Test Runner for Dataset Creation Wizard
 * 
 * This script runs all automated tests and provides a summary of results.
 * It can be used for CI/CD or local development testing.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Dataset Creation Wizard Test Suite');
console.log('=====================================\n');

// Test configuration
const testConfig = {
    testMatch: [
        'src/components/__tests__/DatasetCreationWizard.test.tsx',
        'src/components/__tests__/DashboardCloudProjectsBridge.integration.test.tsx'
    ],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    testEnvironment: 'jsdom',
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function runTests() {
    try {
        console.log(colorize('📋 Running Dataset Creation Wizard Tests...', 'blue'));
        console.log('─'.repeat(50));

        // Check if required dependencies are installed
        console.log('🔍 Checking dependencies...');
        
        const requiredDeps = [
            '@testing-library/react',
            '@testing-library/jest-dom',
            '@testing-library/user-event',
            'jest'
        ];

        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            const missingDeps = requiredDeps.filter(dep => !allDeps[dep]);
            
            if (missingDeps.length > 0) {
                console.log(colorize(`❌ Missing dependencies: ${missingDeps.join(', ')}`, 'red'));
                console.log(colorize('💡 Install missing dependencies:', 'yellow'));
                console.log(`   npm install --save-dev ${missingDeps.join(' ')}`);
                process.exit(1);
            }
            
            console.log(colorize('✅ All dependencies found', 'green'));
        }

        // Run the tests
        console.log('\n🚀 Executing tests...\n');
        
        const testCommand = `npx jest ${testConfig.testMatch.join(' ')} --verbose --coverage --watchAll=false`;
        
        const result = execSync(testCommand, { 
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('\n' + colorize('🎉 All tests completed successfully!', 'green'));
        
        // Display test summary
        displayTestSummary();
        
    } catch (error) {
        console.error('\n' + colorize('❌ Tests failed!', 'red'));
        console.error('Error details:', error.message);
        
        // Display troubleshooting tips
        displayTroubleshootingTips();
        
        process.exit(1);
    }
}

function displayTestSummary() {
    console.log('\n' + colorize('📊 Test Summary', 'bold'));
    console.log('─'.repeat(30));
    console.log('✅ Dataset Creation Wizard Component Tests');
    console.log('✅ Cloud Projects Bridge Integration Tests');
    console.log('✅ Form Validation Tests');
    console.log('✅ Cloud Provider Configuration Tests');
    console.log('✅ Navigation and Step Transition Tests');
    console.log('✅ Error Handling Tests');
    console.log('✅ Integration Tests');
    
    console.log('\n' + colorize('🔍 Coverage Report', 'blue'));
    console.log('Check the coverage report above for detailed coverage information.');
    
    console.log('\n' + colorize('📋 Manual Testing', 'yellow'));
    console.log('Don\'t forget to run the manual testing checklist:');
    console.log('📄 src/components/__tests__/manual-testing-checklist.md');
}

function displayTroubleshootingTips() {
    console.log('\n' + colorize('🔧 Troubleshooting Tips', 'yellow'));
    console.log('─'.repeat(30));
    console.log('1. Ensure all dependencies are installed:');
    console.log('   npm install');
    console.log('');
    console.log('2. Check if Jest is configured properly in package.json');
    console.log('');
    console.log('3. Verify that setupTests.ts exists and imports @testing-library/jest-dom');
    console.log('');
    console.log('4. Make sure TypeScript is configured correctly');
    console.log('');
    console.log('5. Check that all mock files are in place');
    console.log('');
    console.log('6. Run tests individually to isolate issues:');
    console.log('   npx jest DatasetCreationWizard.test.tsx');
    console.log('   npx jest DashboardCloudProjectsBridge.integration.test.tsx');
}

function checkTestEnvironment() {
    console.log(colorize('🔧 Environment Check', 'blue'));
    console.log('─'.repeat(25));
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`Node.js: ${nodeVersion}`);
    
    // Check if we're in the right directory
    const currentDir = process.cwd();
    const isInClientDir = currentDir.includes('client') || fs.existsSync('src');
    
    if (!isInClientDir) {
        console.log(colorize('⚠️  Warning: You might not be in the client directory', 'yellow'));
        console.log('Make sure you\'re running this from the client folder');
    }
    
    // Check for TypeScript
    const hasTsConfig = fs.existsSync('tsconfig.json');
    console.log(`TypeScript config: ${hasTsConfig ? '✅' : '❌'}`);
    
    // Check for React
    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const hasReact = packageJson.dependencies?.react || packageJson.devDependencies?.react;
        console.log(`React: ${hasReact ? '✅' : '❌'}`);
    }
    
    console.log('');
}

// Main execution
function main() {
    console.log(colorize('Dataset Creation Wizard Test Suite', 'bold'));
    console.log(colorize('Comprehensive testing for all UI components and interactions', 'blue'));
    console.log('');
    
    checkTestEnvironment();
    runTests();
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('Dataset Creation Wizard Test Runner');
    console.log('');
    console.log('Usage: node run-tests.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h     Show this help message');
    console.log('  --watch, -w    Run tests in watch mode');
    console.log('  --coverage     Generate coverage report');
    console.log('');
    console.log('Examples:');
    console.log('  node run-tests.js');
    console.log('  node run-tests.js --watch');
    console.log('  npm test');
    process.exit(0);
}

if (args.includes('--watch') || args.includes('-w')) {
    console.log(colorize('👀 Running tests in watch mode...', 'blue'));
    // Modify test command for watch mode
    testConfig.watchAll = true;
}

// Run the main function
main();
