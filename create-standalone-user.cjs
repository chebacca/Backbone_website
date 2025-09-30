const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'backbone-logic'
});

async function createStandaloneUser() {
  try {
    console.log('🔐 Creating standalone user in Firebase Auth...');
    
    const email = 'standalone.user@example.com';
    const password = 'password123';
    const displayName = 'Standalone User';
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true,
      disabled: false
    });
    
    console.log('✅ User created successfully!');
    console.log('UID:', userRecord.uid);
    console.log('Email:', userRecord.email);
    console.log('Display Name:', userRecord.displayName);
    
    // Create user data in Firestore
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      organizationId: 'standalone',
      role: 'user',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ User data created in Firestore');
    
    // Create license
    const licenseKey = `STANDALONE-LICENSE-${userRecord.uid}`;
    await db.collection('licenses').doc(licenseKey).set({
      key: licenseKey,
      type: 'standalone',
      status: 'active',
      expiresAt: null,
      features: [
        'file_upload',
        'edl_parsing',
        'xml_parsing',
        'csv_export',
        'excel_export',
        'pdf_export',
        'html_report',
        'basic_analytics',
        'file_management',
        'full_access'
      ],
      maxUsers: 1,
      maxFiles: -1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastVerified: admin.firestore.FieldValue.serverTimestamp(),
      userId: userRecord.uid,
      organizationId: 'standalone'
    });
    
    console.log('✅ License created');
    console.log('\n🎉 Standalone user setup complete!');
    console.log('Email:', email);
    console.log('Password:', password);
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️ User already exists, updating...');
      
      // Get existing user
      const userRecord = await admin.auth().getUserByEmail('standalone.user@example.com');
      console.log('✅ User found:', userRecord.uid);
      
      // Update password
      await admin.auth().updateUser(userRecord.uid, {
        password: 'password123',
        emailVerified: true
      });
      
      console.log('✅ Password updated');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createStandaloneUser().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
