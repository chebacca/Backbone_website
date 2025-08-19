#!/usr/bin/env node

/**
 * Create Team Members in WebOnly Firebase Mode
 * This script creates team members by calling the deployed Firebase Functions API
 */

const https = require('https');

const API_BASE_URL = 'https://backbone-logic.web.app/api';

// Sample team members to create
const sampleTeamMembers = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    department: 'Engineering',
    licenseType: 'PROFESSIONAL'
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@example.com', 
    department: 'Design',
    licenseType: 'PROFESSIONAL'
  },
  {
    firstName: 'Carol',
    lastName: 'Williams',
    email: 'carol.williams@example.com',
    department: 'Marketing',
    licenseType: 'ENTERPRISE'
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    department: 'Sales',
    licenseType: 'PROFESSIONAL'
  },
  {
    firstName: 'Eva',
    lastName: 'Davis',
    email: 'eva.davis@example.com',
    department: 'Engineering',
    licenseType: 'ENTERPRISE'
  }
];

// First, we need to login and get an auth token
async function loginAndGetToken() {
  console.log('🔐 Logging in as enterprise user...');
  
  const loginData = JSON.stringify({
    email: 'enterprise.user@example.com',
    password: 'Admin1234!'
  });

  const options = {
    hostname: 'backbone-logic.web.app',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data && response.data.token) {
            console.log('✅ Login successful');
            resolve({
              token: response.data.token,
              user: response.data.user
            });
          } else {
            console.error('❌ Login failed:', response);
            reject(new Error('Login failed'));
          }
        } catch (error) {
          console.error('❌ Error parsing login response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Login request error:', error);
      reject(error);
    });

    req.write(loginData);
    req.end();
  });
}

// Get user's organization
async function getUserOrganization(token, userId) {
  console.log('🏢 Getting user organization...');
  
  const options = {
    hostname: 'backbone-logic.web.app',
    port: 443,
    path: `/api/organizations/user/${userId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data && response.data.length > 0) {
            console.log('✅ Found organization:', response.data[0].name);
            resolve(response.data[0]);
          } else {
            console.error('❌ No organization found:', response);
            reject(new Error('No organization found'));
          }
        } catch (error) {
          console.error('❌ Error parsing organization response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Organization request error:', error);
      reject(error);
    });

    req.end();
  });
}

// Create team members
async function createTeamMembers(token, organizationId) {
  console.log('👥 Creating team members...');
  
  const createData = JSON.stringify({
    organizationId: organizationId,
    teamMembers: sampleTeamMembers,
    sendWelcomeEmails: false
  });

  const options = {
    hostname: 'backbone-logic.web.app',
    port: 443,
    path: '/api/team-members/bulk-create',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(createData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📝 Team member creation response:', response);
          resolve(response);
        } catch (error) {
          console.error('❌ Error parsing team member response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Team member creation request error:', error);
      reject(error);
    });

    req.write(createData);
    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 Starting team member creation in webonly Firebase mode...');
    
    // Step 1: Login and get auth token
    const auth = await loginAndGetToken();
    
    // Step 2: Get user's organization
    const organization = await getUserOrganization(auth.token, auth.user.id);
    
    // Step 3: Create team members
    const result = await createTeamMembers(auth.token, organization.id);
    
    console.log('🎉 Team member creation completed!');
    console.log('📊 Result:', result);
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

main();
