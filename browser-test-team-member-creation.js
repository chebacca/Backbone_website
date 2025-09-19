/**
 * Browser Console Test for Team Member Creation
 * 
 * Run this in the browser console at https://backbone-logic.web.app
 * while logged in as enterprise.user@enterprisemedia.com
 */

async function testTeamMemberCreationInBrowser() {
  console.log('🧪 Starting Browser Team Member Creation Test...\n');
  
  try {
    // Get Firebase ID token
    console.log('🔐 Step 1: Getting Firebase ID token...');
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user logged in. Please log in first.');
    }
    
    const token = await user.getIdToken();
    console.log('   ✅ Firebase ID token obtained');
    
    // Get initial state
    console.log('\n📊 Step 2: Getting initial state...');
    
    // Check licenses via API
    const licensesResponse = await fetch('/api/licenses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (licensesResponse.ok) {
      const licensesData = await licensesResponse.json();
      const availableLicenses = licensesData.data?.filter(license => 
        (license.status === 'ACTIVE' || license.status === 'PENDING') && !license.assignedTo
      ) || [];
      console.log(`   📋 Available licenses: ${availableLicenses.length}`);
      
      if (availableLicenses.length === 0) {
        console.log('   ⚠️  No available licenses found. Creating one...');
        // This would require a separate API call to create a license
        console.log('   ⚠️  Please create a license first or use an existing one');
        return;
      }
      
      const testLicense = availableLicenses[0];
      console.log(`   🎫 Using license: ${testLicense.id} (${testLicense.tier})`);
    }
    
    // Check team members via API
    const teamMembersResponse = await fetch('/api/team-members', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (teamMembersResponse.ok) {
      const teamMembersData = await teamMembersResponse.json();
      const teamMembers = teamMembersData.data || [];
      console.log(`   👥 Current team members: ${teamMembers.length}`);
    }
    
    // Test team member creation
    console.log('\n👤 Step 3: Creating team member...');
    const testEmail = `test.team.member.${Date.now()}@example.com`;
    
    const createResponse = await fetch('/api/team-members/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: testEmail,
        firstName: 'Test',
        lastName: 'TeamMember',
        department: 'Engineering',
        position: 'Developer',
        phone: '+1234567890',
        role: 'MEMBER',
        licenseType: 'PROFESSIONAL',
        organizationId: 'enterprise-media-org',
        temporaryPassword: 'TestPassword123!',
        sendWelcomeEmail: false
      })
    });
    
    console.log(`   Status: ${createResponse.status}`);
    const createResult = await createResponse.json();
    console.log('   Response:', createResult);
    
    if (createResponse.ok && createResult.success) {
      console.log('   ✅ Team member created successfully!');
      console.log(`   📧 Email: ${createResult.data.email}`);
      console.log(`   🆔 ID: ${createResult.data.id}`);
      
      // Verify the team member appears in the list
      console.log('\n🔍 Step 4: Verifying team member in list...');
      const verifyResponse = await fetch('/api/team-members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const createdMember = verifyData.data?.find(member => member.email === testEmail);
        
        if (createdMember) {
          console.log('   ✅ Team member found in list');
          console.log('   📝 Member details:', createdMember);
        } else {
          console.log('   ❌ Team member not found in list');
        }
      }
      
      // Test email validation
      console.log('\n📧 Step 5: Testing email validation...');
      const validateResponse = await fetch('/api/team-members/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: testEmail,
          organizationId: 'enterprise-media-org'
        })
      });
      
      const validateResult = await validateResponse.json();
      console.log(`   Status: ${validateResponse.status}`);
      console.log('   Response:', validateResult);
      
      if (validateResponse.status === 400 || validateResponse.status === 409) {
        console.log('   ✅ Duplicate email correctly rejected');
      } else {
        console.log('   ⚠️  Duplicate email validation unexpected result');
      }
      
      // Test with a new email
      console.log('\n📧 Step 6: Testing with new email...');
      const newEmailResponse = await fetch('/api/team-members/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: `new.test.${Date.now()}@example.com`,
          organizationId: 'enterprise-media-org'
        })
      });
      
      const newEmailResult = await newEmailResponse.json();
      console.log(`   Status: ${newEmailResponse.status}`);
      console.log('   Response:', newEmailResult);
      
      if (newEmailResponse.ok && newEmailResult.available) {
        console.log('   ✅ New email correctly validated as available');
      } else {
        console.log('   ⚠️  New email validation unexpected result');
      }
      
    } else {
      console.log('   ❌ Team member creation failed');
      console.log('   Error:', createResult);
    }
    
    console.log('\n🎯 Browser Test Completed!');
    console.log('   Check the results above to verify the team member creation flow.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Instructions for running the test
console.log('📋 Instructions for running the test:');
console.log('1. Make sure you are logged in at https://backbone-logic.web.app');
console.log('2. Open browser console (F12)');
console.log('3. Copy and paste this entire script');
console.log('4. Run: testTeamMemberCreationInBrowser()');
console.log('5. Check the results in the console');

// Export the function for easy access
window.testTeamMemberCreationInBrowser = testTeamMemberCreationInBrowser;

