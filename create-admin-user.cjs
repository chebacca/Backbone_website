const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (it will use Application Default Credentials)
const app = initializeApp();
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  const email = 'bdern@example.com';
  const password = 'AdminPass123!';
  
  try {
    console.log('🔍 Checking if user exists...');
    
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('✅ User exists in Firebase Auth:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('👤 Creating new Firebase Auth user...');
        userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: 'Bob Dern',
          emailVerified: true
        });
        console.log('✅ Firebase Auth user created:', userRecord.uid);
      } else {
        throw error;
      }
    }
    
    // Check if team member document exists
    console.log('🔍 Checking team member document...');
    const teamMemberDoc = await db.collection('teamMembers').doc(userRecord.uid).get();
    
    if (!teamMemberDoc.exists) {
      console.log('📝 Creating team member document...');
      await db.collection('teamMembers').doc(userRecord.uid).set({
        id: userRecord.uid,
        email: email,
        name: 'Bob Dern',
        role: 'ADMIN',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          canAccessDashboard: true,
          canManageUsers: true,
          canManageProjects: true
        }
      });
      console.log('✅ Team member document created');
    } else {
      console.log('📝 Updating existing team member document...');
      await db.collection('teamMembers').doc(userRecord.uid).update({
        role: 'ADMIN',
        status: 'active',
        updatedAt: new Date(),
        permissions: {
          canAccessDashboard: true,
          canManageUsers: true,
          canManageProjects: true
        }
      });
      console.log('✅ Team member document updated');
    }
    
    // Set custom claims for admin access
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'ADMIN',
      teamMemberRole: 'ADMIN',
      isAdmin: true
    });
    console.log('✅ Custom claims set');
    
    console.log('\n🎉 Admin user setup complete!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log('\n👉 User can now log in to the dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAdminUser().then(() => process.exit(0));
