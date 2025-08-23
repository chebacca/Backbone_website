/**
 * Debug script for team member creation in webonly mode
 * This script helps diagnose Firestore permissions and authentication issues
 */

// Debug function to test team member creation
async function debugTeamMemberCreation() {
  console.log('🔍 Starting team member creation debug...');
  
  try {
    // Check if we're in webonly mode
    const isWebOnly = typeof window !== 'undefined' && (
      (window as any).WEBONLY_MODE === true ||
      localStorage.getItem('WEB_ONLY') === 'true' ||
      localStorage.getItem('USE_FIRESTORE') === 'true' ||
      window.location.hostname.includes('backbone-client.web.app') ||
      window.location.hostname.includes('web.app') ||
      window.location.hostname.includes('firebaseapp.com')
    );
    
    console.log('🌐 WebOnly mode detected:', isWebOnly);
    console.log('🏠 Hostname:', window.location.hostname);
    console.log('💾 WEB_ONLY localStorage:', localStorage.getItem('WEB_ONLY'));
    console.log('🔥 WEBONLY_MODE window:', (window as any).WEBONLY_MODE);
    
    // Check Firebase Auth state
    const { auth } = await import('./client/src/services/firebase');
    const currentUser = auth.currentUser;
    
    console.log('👤 Current Firebase user:', currentUser);
    console.log('📧 User email:', currentUser?.email);
    console.log('🆔 User UID:', currentUser?.uid);
    console.log('✅ User verified:', currentUser?.emailVerified);
    
    if (!currentUser) {
      console.error('❌ No Firebase user authenticated - this is the problem!');
      console.log('💡 Solution: User needs to log in with Firebase Auth');
      return;
    }
    
    // Get user's ID token for debugging
    const idToken = await currentUser.getIdToken();
    console.log('🔑 Firebase ID Token (first 50 chars):', idToken.substring(0, 50) + '...');
    
    // Test Firestore access
    const { db } = await import('./client/src/services/firebase');
    const { collection, doc, getDoc, getDocs, query, where } = await import('firebase/firestore');
    
    console.log('🔥 Testing Firestore access...');
    
    // Test reading from teamMembers collection
    try {
      const teamMembersRef = collection(db, 'teamMembers');
      const snapshot = await getDocs(teamMembersRef);
      console.log('✅ Can read teamMembers collection. Documents found:', snapshot.size);
    } catch (readError) {
      console.error('❌ Cannot read teamMembers collection:', readError);
    }
    
    // Test reading from organizations collection
    try {
      const orgsRef = collection(db, 'organizations');
      const orgQuery = query(orgsRef, where('ownerUserId', '==', currentUser.uid));
      const orgSnapshot = await getDocs(orgQuery);
      console.log('✅ Can read organizations. User owns:', orgSnapshot.size, 'organizations');
      
      orgSnapshot.forEach(doc => {
        console.log('🏢 Organization:', doc.id, doc.data());
      });
    } catch (orgError) {
      console.error('❌ Cannot read organizations:', orgError);
    }
    
    // Test creating a team member document (dry run)
    const testTeamMemberData = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      licenseType: 'PROFESSIONAL',
      organizationId: '8E1GLGmM0iWdLVbBWQly', // From the logs
      role: 'MEMBER',
      status: 'ACTIVE',
      createdBy: currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🧪 Testing team member creation with data:', testTeamMemberData);
    
    // Try to create the document
    const { addDoc } = await import('firebase/firestore');
    try {
      const docRef = await addDoc(collection(db, 'teamMembers'), testTeamMemberData);
      console.log('✅ SUCCESS! Team member created with ID:', docRef.id);
      
      // Clean up - delete the test document
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(docRef);
      console.log('🧹 Test document cleaned up');
      
    } catch (createError) {
      console.error('❌ FAILED to create team member:', createError);
      console.error('Error code:', createError.code);
      console.error('Error message:', createError.message);
      
      if (createError.code === 'permission-denied') {
        console.log('🔒 This is a Firestore security rules issue');
        console.log('💡 Check firestore.rules for teamMembers collection permissions');
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

// Check Firestore rules
async function checkFirestoreRules() {
  console.log('📋 Checking Firestore security rules...');
  
  // This would need to be run from Firebase CLI or console
  console.log('🔧 To check Firestore rules, run:');
  console.log('   firebase firestore:rules:get');
  console.log('');
  console.log('🔧 Expected rules for teamMembers collection:');
  console.log(`
    match /teamMembers/{document} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || 
         request.auth.uid in get(/databases/$(database)/documents/organizations/$(resource.data.organizationId)).data.ownerUserId);
    }
  `);
}

// Export functions for console use
if (typeof window !== 'undefined') {
  window.debugTeamMemberCreation = debugTeamMemberCreation;
  window.checkFirestoreRules = checkFirestoreRules;
  
  console.log('🛠️ Debug functions available:');
  console.log('   debugTeamMemberCreation() - Test team member creation');
  console.log('   checkFirestoreRules() - Show expected Firestore rules');
}

export { debugTeamMemberCreation, checkFirestoreRules };