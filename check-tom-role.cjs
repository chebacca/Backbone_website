const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function checkTomRole() {
  console.log('🔍 Checking Tom Toms user data...');
  
  try {
    // Check the user document by ID
    const userDoc = await db.collection('users').doc('mbNGs80Iz3VdAKitnz6i').get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('User data:', {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        userType: userData.userType,
        isTeamMember: userData.isTeamMember,
        status: userData.status
      });
    } else {
      console.log('❌ User document not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTomRole();
