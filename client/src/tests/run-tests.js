#!/usr/bin/env node

/**
 * 🧪 TEST RUNNER FOR DASHBOARD CLOUD PROJECTS BRIDGE
 * 
 * Runs comprehensive tests for the DashboardCloudProjectsBridge component
 * and all its Firebase integration features.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Starting comprehensive test suite for DashboardCloudProjectsBridge...\n');

// Test configuration
const testConfig = {
  testPathPattern: 'DashboardCloudProjectsBridge.test.tsx',
  verbose: true,
  coverage: true,
  coverageReporters: ['text', 'html', 'lcov'],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
};

try {
  // Run the tests
  console.log('📋 Running DashboardCloudProjectsBridge tests...');
  
  const testCommand = `npx jest ${testConfig.testPathPattern} --verbose --coverage --coverageReporters=text,html,lcov --coverageDirectory=coverage --setupFilesAfterEnv=<rootDir>/src/tests/setup.ts --testEnvironment=jsdom --moduleNameMapping='^@/(.*)$':<rootDir>/src/$1 --transform='^.+\\.(ts|tsx)$':ts-jest`;
  
  execSync(testCommand, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('\n✅ All tests completed successfully!');
  console.log('📊 Coverage report generated in ./coverage/');
  
} catch (error) {
  console.error('\n❌ Test execution failed:', error.message);
  process.exit(1);
}
