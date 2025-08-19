#!/usr/bin/env node

/**
 * Debug Team Member Creation API
 * This script helps identify why the team member creation is failing with 400 errors
 */

import https from 'https';
import http from 'http';

const API_BASE = 'https://backbone-logic.web.app/api';

// Test data
const testPayload = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  department: 'Engineering',
  licenseType: 'PROFESSIONAL',
  organizationId: 'test-org-123', // This should match the regex pattern
  sendWelcomeEmail: true,
};

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testTeamMemberCreation() {
  console.log('🔍 Testing Team Member Creation API...');
  console.log('📡 API Base:', API_BASE);
  console.log('📦 Request Payload:', JSON.stringify(testPayload, null, 2));
  
  try {
    // Test 1: Check if endpoint exists
    console.log('\n🧪 Test 1: Checking endpoint availability...');
    const healthCheck = await makeRequest(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Debug-Script/1.0',
      }
    });
    console.log('Health check status:', healthCheck.status);
    
    // Test 2: Try to create team member (this will likely fail due to auth)
    console.log('\n🧪 Test 2: Testing team member creation (will fail due to auth)...');
    const response = await makeRequest(`${API_BASE}/team-members/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Script/1.0',
      },
      body: JSON.stringify(testPayload),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response body:', response.body);
    
    if (response.status === 400) {
      console.log('\n❌ 400 Bad Request - Validation Error');
      console.log('This suggests the request payload is invalid or missing required fields');
      console.log('\n🔍 Possible issues:');
      console.log('1. Missing authentication token');
      console.log('2. Invalid organizationId format (must match /^[a-zA-Z0-9]+$/)');
      console.log('3. Missing required fields');
      console.log('4. Server-side validation errors');
    } else if (response.status === 401) {
      console.log('\n🔐 401 Unauthorized - Authentication Required');
      console.log('This is expected without a valid auth token');
    } else if (response.status === 404) {
      console.log('\n🚫 404 Not Found - Endpoint not available');
      console.log('The team-members endpoint might not be deployed');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 Network Error: Cannot resolve hostname');
      console.log('This suggests the API endpoint is not accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🚫 Connection Refused: Server not running');
      console.log('This suggests the server is not accessible');
    }
  }
}

async function testOrganizationIdValidation() {
  console.log('\n🔍 Testing Organization ID Validation...');
  
  const testIds = [
    'test123',
    'test-123',
    'test_123',
    'test.123',
    'test@123',
    'test#123',
    'test$123',
    'test%123',
    'test^123',
    'test&123',
    'test*123',
    'test(123)',
    'test[123]',
    'test{123}',
    'test<123>',
    'test|123',
    'test\\123',
    'test/123',
    'test:123',
    'test;123',
    'test=123',
    'test+123',
    'test~123',
    'test`123',
    'test\'123',
    'test"123',
  ];
  
  const regex = /^[a-zA-Z0-9]+$/;
  
  console.log('Regex pattern: /^[a-zA-Z0-9]+$/');
  console.log('\nTesting various organization ID formats:');
  
  testIds.forEach(id => {
    const isValid = regex.test(id);
    const status = isValid ? '✅ VALID' : '❌ INVALID';
    console.log(`${status} "${id}"`);
  });
  
  console.log('\n💡 Only alphanumeric characters (a-z, A-Z, 0-9) are allowed');
  console.log('💡 No hyphens, underscores, dots, or special characters');
}

async function main() {
  console.log('🚀 Team Member Creation API Debug Script');
  console.log('=====================================\n');
  
  await testTeamMemberCreation();
  await testOrganizationIdValidation();
  
  console.log('\n📋 Summary of Findings:');
  console.log('1. Check if the API endpoint is accessible');
  console.log('2. Verify the organizationId format matches /^[a-zA-Z0-9]+$/');
  console.log('3. Ensure all required fields are present');
  console.log('4. Check server logs for detailed validation errors');
  console.log('5. Verify Firebase Functions are deployed and running');
}

main().catch(console.error);
