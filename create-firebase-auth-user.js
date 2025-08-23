const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createFirebaseAuthUser() {
  try {
    // Create the enterprise.user@example.com user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: 'enterprise.user@example.com',
      password: 'enterprise123', // Use the actual password here
      displayName: 'Enterprise User',
      emailVerified: true
    });
    
    console.log('✅ Successfully created Firebase Auth user:', userRecord.uid);
    console.log('Email:', userRecord.email);
    console.log('DisplayName:', userRecord.displayName);
    
    // You can also set custom claims if needed
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      organizationId: '24H6zaiCUycuT8ukx9Jz',
      role: 'ENTERPRISE_ADMIN'
    });
    
    console.log('✅ Successfully set custom claims for user');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️ User already exists, updating password...');
      
      // Get the user by email
      const userRecord = await admin.auth().getUserByEmail('enterprise.user@example.com');
      
      // Update the user's password
      await admin.auth().updateUser(userRecord.uid, {
        password: 'enterprise123', // Use the actual password here
        emailVerified: true
      });
      
      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        organizationId: '24H6zaiCUycuT8ukx9Jz',
        role: 'ENTERPRISE_ADMIN'
      });
      
      console.log('✅ Successfully updated Firebase Auth user:', userRecord.uid);
    } else {
      console.error('❌ Error creating Firebase Auth user:', error);
    }
  }
}

createFirebaseAuthUser();
