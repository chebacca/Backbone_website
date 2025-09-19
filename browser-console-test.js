/**
 * 🧪 Browser Console Test for Team Member Creation
 * 
 * Run this in the browser console while logged into the licensing website
 * to test the complete team member creation flow.
 */

async function testTeamMemberCreationInBrowser() {
  console.log('🧪 Starting Team Member Creation Test in Browser...');
  
  try {
    // Step 1: Get current user and token
    console.log('📊 Step 1: Getting current user and token...');
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }
    
    const token = await user.getIdToken();
    console.log('✅ User:', user.email);
    console.log('✅ Token obtained');
    
    // Step 2: Get initial state
    console.log('📊 Step 2: Getting initial state...');
    const orgId = 'enterprise-media-org';
    
    // Get licenses
    const licensesResponse = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/licenses?organizationId=${orgId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!licensesResponse.ok) {
      throw new Error(`Failed to get licenses: ${licensesResponse.status}`);
    }
    
    const licenses = await licensesResponse.json();
    console.log('📋 Initial licenses:', licenses.data?.length || 0);
    
    // Get team members
    const teamMembersResponse = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/team-members?organizationId=${orgId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!teamMembersResponse.ok) {
      throw new Error(`Failed to get team members: ${teamMembersResponse.status}`);
    }
    
    const teamMembers = await teamMembersResponse.json();
    console.log('👥 Initial team members:', teamMembers.data?.length || 0);
    
    // Step 3: Create test team member
    console.log('📊 Step 3: Creating test team member...');
    const testEmail = `test.team.member.${Date.now()}@example.com`;
    
    const createResponse = await fetch('https://us-central1-backbone-logic.cloudfunctions.net/api/team-members/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        department: 'Testing',
        position: 'Test Engineer',
        role: 'MEMBER',
        licenseType: 'PROFESSIONAL',
        temporaryPassword: 'TestPassword123!',
        activateImmediately: true,
        sendWelcomeEmail: false
      })
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create team member: ${createResponse.status} - ${errorText}`);
    }
    
    const createResult = await createResponse.json();
    console.log('✅ Team member created:', createResult.data);
    
    // Step 4: Verify final state
    console.log('📊 Step 4: Verifying final state...');
    
    // Get updated licenses
    const updatedLicensesResponse = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/licenses?organizationId=${orgId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const updatedLicenses = await updatedLicensesResponse.json();
    console.log('📋 Final licenses:', updatedLicenses.data?.length || 0);
    
    // Get updated team members
    const updatedTeamMembersResponse = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/team-members?organizationId=${orgId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const updatedTeamMembers = await updatedTeamMembersResponse.json();
    console.log('👥 Final team members:', updatedTeamMembers.data?.length || 0);
    
    // Step 5: Verify license consumption
    const initialLicenseCount = licenses.data?.length || 0;
    const finalLicenseCount = updatedLicenses.data?.length || 0;
    const initialTeamCount = teamMembers.data?.length || 0;
    const finalTeamCount = updatedTeamMembers.data?.length || 0;
    
    console.log('📊 Step 5: Verifying license consumption...');
    console.log(`   License count: ${initialLicenseCount} → ${finalLicenseCount} (${finalLicenseCount - initialLicenseCount})`);
    console.log(`   Team count: ${initialTeamCount} → ${finalTeamCount} (${finalTeamCount - initialTeamCount})`);
    
    if (finalLicenseCount === initialLicenseCount - 1 && finalTeamCount === initialTeamCount + 1) {
      console.log('✅ TEST PASSED: License consumed and team member created successfully!');
      return {
        success: true,
        message: 'Team member creation and license consumption working correctly',
        data: {
          initialLicenses: initialLicenseCount,
          finalLicenses: finalLicenseCount,
          initialTeamMembers: initialTeamCount,
          finalTeamMembers: finalTeamCount,
          createdTeamMember: createResult.data
        }
      };
    } else {
      console.log('❌ TEST FAILED: License count or team member count did not update as expected');
      return {
        success: false,
        message: 'License consumption or team member creation did not work as expected',
        data: {
          initialLicenses: initialLicenseCount,
          finalLicenses: finalLicenseCount,
          initialTeamMembers: initialTeamCount,
          finalTeamMembers: finalTeamCount
        }
      };
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}

// Auto-run the test
console.log('🚀 Running Team Member Creation Test...');
testTeamMemberCreationInBrowser().then(result => {
  console.log('🏁 Test completed:', result);
}).catch(error => {
  console.error('💥 Test failed with error:', error);
});

// Export function for manual testing
window.testTeamMemberCreationInBrowser = testTeamMemberCreationInBrowser;

