const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);
const auth = getAuth(app);

async function checkBobDern() {
  const email = 'bdern@example.com';
  
  try {
    console.log('🔍 Checking Bob Dern setup...\n');
    
    // 1. Check Firebase Auth
    console.log('1️⃣ Firebase Auth Check:');
    try {
      const userRecord = await auth.getUserByEmail(email);
      console.log('✅ Firebase Auth user exists:', {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        customClaims: userRecord.customClaims
      });
    } catch (error) {
      console.log('❌ Firebase Auth user not found:', error.code);
    }
    
    console.log('\n2️⃣ Team Member Document Check:');
    // 2. Check team member document
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('email', '==', email)
      .get();
    
    if (teamMembersSnapshot.empty) {
      console.log('❌ Team member document not found');
    } else {
      const bobDoc = teamMembersSnapshot.docs[0];
      const bobData = bobDoc.data();
      
      console.log('✅ Team member document exists:', {
        id: bobDoc.id,
        email: bobData.email,
        name: bobData.name,
        role: bobData.role,
        status: bobData.status,
        hasPassword: !!bobData.password,
        hasHashedPassword: !!bobData.hashedPassword,
        organizationId: bobData.organizationId,
        firebaseUid: bobData.firebaseUid,
        lastLoginAt: bobData.lastLoginAt?.toDate?.() || bobData.lastLoginAt
      });
    }
    
    console.log('\n3️⃣ Organization Membership Check:');
    // 3. Check organization membership
    const orgMembersSnapshot = await db.collection('orgMembers')
      .where('email', '==', email)
      .get();
    
    if (orgMembersSnapshot.empty) {
      console.log('❌ No organization membership found');
    } else {
      orgMembersSnapshot.docs.forEach((doc, index) => {
        const memberData = doc.data();
        console.log(`✅ Organization membership ${index + 1}:`, {
          id: doc.id,
          email: memberData.email,
          role: memberData.role,
          status: memberData.status,
          organizationId: memberData.organizationId
        });
      });
    }
    
    console.log('\n🎯 Summary:');
    console.log('Bob Dern should be able to login if:');
    console.log('- ✅ Firebase Auth user exists');
    console.log('- ✅ Team member document exists with role ADMIN');
    console.log('- ✅ Team member has a password set');
    console.log('- ✅ Status is "active"');
    
  } catch (error) {
    console.error('❌ Error checking Bob Dern:', error);
  }
}

checkBobDern().then(() => process.exit(0));
