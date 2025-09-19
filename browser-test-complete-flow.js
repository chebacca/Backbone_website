// Browser Console Test: Complete License Flow
// Run this in the browser console at https://backbone-logic.web.app/dashboard/team

(async () => {
  console.log('🧪 BROWSER TEST: COMPLETE LICENSE FLOW');
  console.log('=====================================');
  console.log('Testing: License Purchase → Team Member Invitation → Project Assignment');
  console.log('');

  try {
    // Step 1: Check current user and organization
    console.log('👤 Step 1: Checking current user...');
    
    // Get current user from localStorage or auth context
    const authData = localStorage.getItem('firebase:authUser:backbone-logic:[DEFAULT]');
    if (!authData) {
      throw new Error('No authenticated user found. Please log in first.');
    }
    
    const user = JSON.parse(authData);
    console.log(`✅ Current user: ${user.email}`);
    console.log(`   UID: ${user.uid}`);
    
    // Step 2: Check available licenses
    console.log('\n🎫 Step 2: Checking available licenses...');
    
    // Import Firebase functions
    const { getFirestore, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    
    // Get Firebase app instance
    const firebaseApp = window.firebaseApp;
    if (!firebaseApp) {
      throw new Error('Firebase app not found. Please refresh the page.');
    }
    
    const db = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    
    // Get organization ID (you might need to adjust this based on your app structure)
    const orgId = 'enterprise-org-001'; // This should be dynamic in real app
    
    // Check available licenses
    const licensesQuery = query(
      collection(db, 'licenses'),
      where('organizationId', '==', orgId),
      where('status', '==', 'ACTIVE')
    );
    
    const licensesSnapshot = await getDocs(licensesQuery);
    const availableLicenses = licensesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(license => !license.assignedToUserId || license.assignedToUserId === null);
    
    console.log(`📊 Available licenses: ${availableLicenses.length}`);
    
    if (availableLicenses.length === 0) {
      console.log('⚠️ No available licenses found. You need to purchase licenses first.');
      console.log('   Go to: https://backbone-logic.web.app/dashboard/licenses');
      return;
    }
    
    availableLicenses.forEach((license, index) => {
      console.log(`   ${index + 1}. ${license.tier} - ${license.key?.substring(0, 20)}...`);
    });
    
    // Step 3: Test team member creation dialog
    console.log('\n👥 Step 3: Testing team member creation...');
    
    // Look for the "Invite Team Member" button
    const inviteButton = document.querySelector('button:contains("Invite Member")') || 
                       document.querySelector('button[aria-label*="Invite"]') ||
                       document.querySelector('button:contains("Invite Team Member")');
    
    if (!inviteButton) {
      console.log('❌ Invite Team Member button not found. Make sure you are on the team page.');
      console.log('   Current URL:', window.location.href);
      return;
    }
    
    console.log('✅ Found Invite Team Member button');
    console.log('   Clicking button to open dialog...');
    
    // Click the button
    inviteButton.click();
    
    // Wait for dialog to open
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if dialog opened
    const dialog = document.querySelector('[role="dialog"]') || 
                  document.querySelector('.MuiDialog-root') ||
                  document.querySelector('h6:contains("Invite Team Member")');
    
    if (!dialog) {
      console.log('❌ Dialog did not open. There might be an issue with the dialog component.');
      return;
    }
    
    console.log('✅ Dialog opened successfully');
    
    // Check for license availability warning
    const warningAlert = dialog.querySelector('[role="alert"]') || 
                        dialog.querySelector('.MuiAlert-root');
    
    if (warningAlert) {
      const warningText = warningAlert.textContent;
      if (warningText.includes('No available licenses')) {
        console.log('⚠️ License warning detected:', warningText);
        console.log('   This means the license query is working correctly!');
      } else if (warningText.includes('available license')) {
        console.log('✅ License availability detected:', warningText);
      }
    }
    
    // Check for form fields
    const emailField = dialog.querySelector('input[type="email"]') || 
                      dialog.querySelector('input[name="email"]');
    const firstNameField = dialog.querySelector('input[name="firstName"]');
    const lastNameField = dialog.querySelector('input[name="lastName"]');
    
    if (emailField && firstNameField && lastNameField) {
      console.log('✅ Form fields found - dialog is ready for input');
      
      // Fill out the form with test data
      const testEmail = `test.member.${Date.now()}@example.com`;
      
      console.log(`   Filling form with test data: ${testEmail}`);
      
      // Fill form fields
      emailField.value = testEmail;
      emailField.dispatchEvent(new Event('input', { bubbles: true }));
      emailField.dispatchEvent(new Event('change', { bubbles: true }));
      
      if (firstNameField) {
        firstNameField.value = 'Test';
        firstNameField.dispatchEvent(new Event('input', { bubbles: true }));
        firstNameField.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (lastNameField) {
        lastNameField.value = 'Member';
        lastNameField.dispatchEvent(new Event('input', { bubbles: true }));
        lastNameField.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Look for password field
      const passwordField = dialog.querySelector('input[type="password"]');
      if (passwordField) {
        passwordField.value = 'TempPass123!';
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        passwordField.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      console.log('✅ Form filled with test data');
      
      // Look for submit button
      const submitButton = dialog.querySelector('button:contains("Create Team Member")') ||
                          dialog.querySelector('button[type="submit"]') ||
                          dialog.querySelector('button:contains("Create")');
      
      if (submitButton) {
        console.log('✅ Submit button found');
        
        // Check if button is disabled
        if (submitButton.disabled) {
          console.log('⚠️ Submit button is disabled - this might be due to license availability');
          const buttonText = submitButton.textContent;
          console.log(`   Button text: "${buttonText}"`);
        } else {
          console.log('✅ Submit button is enabled - ready to create team member');
          console.log('   You can click the button to test the complete flow');
        }
      } else {
        console.log('❌ Submit button not found');
      }
      
    } else {
      console.log('❌ Form fields not found in dialog');
    }
    
    // Step 4: Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    console.log(`✅ User authenticated: ${user.email}`);
    console.log(`✅ Available licenses: ${availableLicenses.length}`);
    console.log(`✅ Dialog opens: ${!!dialog}`);
    console.log(`✅ Form ready: ${!!(emailField && firstNameField && lastNameField)}`);
    console.log(`✅ License query working: ${availableLicenses.length > 0 ? 'Yes' : 'No (need to purchase)'}`);
    
    if (availableLicenses.length > 0) {
      console.log('\n🎉 READY FOR COMPLETE FLOW TEST!');
      console.log('You can now:');
      console.log('1. Fill out the form in the dialog');
      console.log('2. Click "Create Team Member"');
      console.log('3. Watch the console for Firebase operations');
      console.log('4. Check that the team member appears in the table');
      console.log('5. Verify the license was assigned');
    } else {
      console.log('\n⚠️ PURCHASE LICENSES FIRST');
      console.log('Go to: https://backbone-logic.web.app/dashboard/licenses');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Debugging steps:');
    console.log('1. Make sure you are logged in');
    console.log('2. Make sure you are on the team page');
    console.log('3. Check browser console for errors');
    console.log('4. Try refreshing the page');
  }
  
  console.log('\n🏁 Browser test completed');
})();

