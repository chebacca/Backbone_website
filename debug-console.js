/**
 * Debug script to run in browser console
 * Copy and paste this into the browser console on the Team Management page
 */

// Debug team member creation in console
async function debugTeamMemberCreation() {
  console.log('🔍 Starting team member creation debug...');
  
  try {
    // Import Firebase services
    const { auth, db } = await import('./src/services/firebase.js');
    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Check Firebase Auth state
    const currentUser = auth.currentUser;
    
    console.log('👤 Current Firebase user:', currentUser);
    console.log('📧 User email:', currentUser?.email);
    console.log('🆔 User UID:', currentUser?.uid);
    console.log('✅ User verified:', currentUser?.emailVerified);
    
    if (!currentUser) {
      console.error('❌ No Firebase user authenticated - this is the problem!');
      console.log('💡 Solution: User needs to log in with Firebase Auth');
      
      // Try to sign in if there's a stored session
      console.log('🔄 Checking for stored auth session...');
      
      // Wait for auth state to resolve
      return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          if (user) {
            console.log('✅ Found authenticated user:', user.email);
            resolve(user);
          } else {
            console.log('❌ No authenticated user found');
            console.log('🔧 Please log out and log back in to authenticate with Firebase Auth');
            resolve(null);
          }
        });
      });
    }
    
    // Get user's ID token for debugging
    const idToken = await currentUser.getIdToken();
    console.log('🔑 Firebase ID Token (first 50 chars):', idToken.substring(0, 50) + '...');
    
    // Test creating a team member document
    const testTeamMemberData = {
      email: 'debug-test@example.com',
      firstName: 'Debug',
      lastName: 'Test',
      licenseType: 'PROFESSIONAL',
      organizationId: '8E1GLGmM0iWdLVbBWQly', // From the logs
      role: 'MEMBER',
      status: 'ACTIVE',
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('🧪 Testing team member creation with data:', testTeamMemberData);
    
    // Try to create the document
    try {
      const docRef = await addDoc(collection(db, 'teamMembers'), testTeamMemberData);
      console.log('✅ SUCCESS! Team member created with ID:', docRef.id);
      
      // Clean up - delete the test document
      const { deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      await deleteDoc(docRef);
      console.log('🧹 Test document cleaned up');
      
      return true;
      
    } catch (createError) {
      console.error('❌ FAILED to create team member:', createError);
      console.error('Error code:', createError.code);
      console.error('Error message:', createError.message);
      
      if (createError.code === 'permission-denied') {
        console.log('🔒 This is a Firestore security rules issue');
        console.log('💡 The updated rules should allow this - try refreshing the page');
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
    return false;
  }
}

// Check authentication status
async function checkAuthStatus() {
  console.log('🔐 Checking authentication status...');
  
  try {
    const { auth } = await import('./src/services/firebase.js');
    
    console.log('🔥 Firebase Auth instance:', auth);
    console.log('👤 Current user:', auth.currentUser);
    
    // Check localStorage for auth tokens
    console.log('💾 Auth tokens in localStorage:');
    console.log('  - auth_token:', localStorage.getItem('auth_token')?.substring(0, 50) + '...');
    console.log('  - jwt_token:', localStorage.getItem('jwt_token')?.substring(0, 50) + '...');
    console.log('  - firebase_user:', localStorage.getItem('firebase_user'));
    console.log('  - WEB_ONLY:', localStorage.getItem('WEB_ONLY'));
    
    // Wait for auth state
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        console.log('🔄 Auth state changed:', user ? user.email : 'No user');
        resolve(user);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to check auth status:', error);
  }
}

// Make functions available globally
window.debugTeamMemberCreation = debugTeamMemberCreation;
window.checkAuthStatus = checkAuthStatus;

console.log('🛠️ Debug functions loaded! Run:');
console.log('  checkAuthStatus() - Check Firebase Auth status');
console.log('  debugTeamMemberCreation() - Test team member creation');
