const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);
const auth = getAuth(app);

async function fixBobDernComplete() {
  const email = 'bdern@example.com';
  const password = 'Bob1234!';
  
  try {
    console.log('🔧 Fixing Bob Dern complete setup...\n');
    
    // 1. Get Firebase Auth user
    const userRecord = await auth.getUserByEmail(email);
    console.log('✅ Firebase Auth UID:', userRecord.uid);
    
    // 2. Find team member document
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('email', '==', email)
      .get();
    
    const bobDoc = teamMembersSnapshot.docs[0];
    const bobData = bobDoc.data();
    
    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 4. Update team member document
    console.log('🔧 Updating team member document...');
    await db.collection('teamMembers').doc(bobDoc.id).update({
      role: 'ADMIN', // Change from ENTERPRISE_ADMIN to ADMIN
      password: hashedPassword,
      firebaseUid: userRecord.uid, // Link to Firebase Auth
      name: 'Bob Dern',
      status: 'ACTIVE',
      updatedAt: new Date()
    });
    console.log('✅ Team member updated');
    
    // 5. Set Firebase custom claims
    console.log('🔧 Setting Firebase custom claims...');
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'ADMIN',
      teamMemberRole: 'ADMIN',
      isAdmin: true,
      teamMemberId: bobDoc.id
    });
    console.log('✅ Custom claims set');
    
    // 6. Update Firebase Auth profile
    console.log('🔧 Updating Firebase Auth profile...');
    await auth.updateUser(userRecord.uid, {
      displayName: 'Bob Dern',
      emailVerified: true
    });
    console.log('✅ Firebase Auth profile updated');
    
    // 7. Create organization membership if missing
    console.log('🔧 Creating organization membership...');
    await db.collection('orgMembers').add({
      userId: userRecord.uid,
      email: email,
      organizationId: bobData.organizationId,
      role: 'ADMIN',
      status: 'ACTIVE',
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Organization membership created');
    
    console.log('\n🎉 Bob Dern setup complete!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 Firebase UID: ${userRecord.uid}`);
    console.log(`👤 Team Member ID: ${bobDoc.id}`);
    console.log(`🏢 Organization ID: ${bobData.organizationId}`);
    console.log('\n✅ Bob Dern can now log in to the dashboard with full admin access!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixBobDernComplete().then(() => process.exit(0));
