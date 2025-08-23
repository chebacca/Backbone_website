#!/usr/bin/env node

// Test script to verify login role preservation
// This simulates the login process to ensure SUPERADMIN roles are preserved

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001'; // Adjust if your server runs on different port

async function testLoginRolePreservation() {
  console.log('🧪 Testing Login Role Preservation...\n');

  try {
    // Test login with chebacca@gmail.com
    console.log('🔑 Testing login for chebacca@gmail.com...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chebacca@gmail.com',
        password: 'admin1234'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Login failed:', loginResponse.status, errorText);
      return;
    }

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login response indicates failure:', loginData.message);
      return;
    }

    const user = loginData.data.user;
    console.log('✅ Login successful!');
    console.log('👤 User details:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Is Team Member: ${user.isTeamMember}`);
    console.log(`   - Organization ID: ${user.organizationId || 'None'}`);
    console.log(`   - Member Role: ${user.memberRole || 'None'}`);

    // Check if role preservation worked
    if (user.role === 'SUPERADMIN') {
      console.log('\n🎯 ROLE PRESERVATION TEST: PASSED ✅');
      console.log('   - User role is correctly preserved as SUPERADMIN');
      console.log('   - User should be redirected to /admin dashboard');
    } else {
      console.log('\n❌ ROLE PRESERVATION TEST: FAILED');
      console.log(`   - Expected role: SUPERADMIN`);
      console.log(`   - Actual role: ${user.role}`);
      console.log('   - User will be redirected to regular dashboard');
    }

    // Check team member status
    if (user.isTeamMember === false) {
      console.log('\n✅ TEAM MEMBER STATUS: CORRECT');
      console.log('   - SUPERADMIN is correctly NOT marked as team member');
    } else {
      console.log('\n⚠️ TEAM MEMBER STATUS: INCORRECT');
      console.log(`   - SUPERADMIN should not be team member, but isTeamMember=${user.isTeamMember}`);
    }

    console.log('\n🔍 Next steps:');
    if (user.role === 'SUPERADMIN') {
      console.log('   1. Deploy the server changes');
      console.log('   2. Log out and log back in');
      console.log('   3. You should be redirected to /admin dashboard');
    } else {
      console.log('   1. Check the server logs for role assignment');
      console.log('   2. Verify the user document in Firestore');
      console.log('   3. Ensure the server changes are deployed');
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testLoginRolePreservation();
