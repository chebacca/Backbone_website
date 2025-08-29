const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function checkUserIdFormat() {
  console.log('🔍 CHECKING USER ID FORMAT IN COLLECTIONS');
  console.log('==========================================');
  
  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterpriseFirebaseUid = 'xoAEWjTKXHSF1uOTdG2dZmm4Xar1';
    
    console.log('\n1️⃣ USERS COLLECTION:');
    console.log('====================');
    
    // Check users collection - document ID format
    const userDoc = await db.collection('users').doc(enterpriseEmail).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log(`✅ User document ID: ${userDoc.id} (email format)`);
      console.log(`   Firebase UID in data: ${userData.firebaseUid}`);
      console.log(`   Email in data: ${userData.email}`);
    }
    
    // Also check if there's a document with Firebase UID as ID
    const userByUidDoc = await db.collection('users').doc(enterpriseFirebaseUid).get();
    if (userByUidDoc.exists) {
      console.log(`✅ User document also exists with Firebase UID as ID: ${userByUidDoc.id}`);
    } else {
      console.log(`❌ No user document with Firebase UID as ID`);
    }
    
    console.log('\n2️⃣ ORG_MEMBERS COLLECTION:');
    console.log('==========================');
    
    // Check org_members collection - what userId format is used
    const orgMembersQuery = await db.collection('org_members')
      .where('email', '==', enterpriseEmail)
      .get();
    
    console.log(`Found ${orgMembersQuery.size} org_members records for enterprise user`);
    orgMembersQuery.forEach(doc => {
      const data = doc.data();
      console.log(`- Document ID: ${doc.id}`);
      console.log(`  userId field: ${data.userId}`);
      console.log(`  email field: ${data.email}`);
      console.log(`  userId format: ${data.userId === enterpriseEmail ? 'EMAIL' : data.userId === enterpriseFirebaseUid ? 'FIREBASE_UID' : 'OTHER'}`);
    });
    
    console.log('\n3️⃣ TEAM_MEMBERS COLLECTION:');
    console.log('===========================');
    
    // Check teamMembers collection
    const teamMembersQuery = await db.collection('teamMembers')
      .where('email', '==', enterpriseEmail)
      .get();
    
    console.log(`Found ${teamMembersQuery.size} teamMembers records for enterprise user`);
    teamMembersQuery.forEach(doc => {
      const data = doc.data();
      console.log(`- Document ID: ${doc.id}`);
      console.log(`  assignedToUserId: ${data.assignedToUserId}`);
      console.log(`  email: ${data.email}`);
      console.log(`  firebaseUid: ${data.firebaseUid}`);
    });
    
    console.log('\n4️⃣ FRONTEND USER CONTEXT:');
    console.log('=========================');
    console.log('Based on AuthContext.tsx analysis:');
    console.log('- user.id should be the document ID from users collection');
    console.log('- For enterprise user, user.id = "enterprise.user@example.com"');
    console.log('- user.firebaseUid = "xoAEWjTKXHSF1uOTdG2dZmm4Xar1"');
    
    console.log('\n🎯 ISSUE IDENTIFIED:');
    console.log('====================');
    console.log('TeamPage queries org_members by userId = user.id (email)');
    console.log('But org_members.userId contains Firebase UID');
    console.log('This mismatch causes the query to fail');
    
    console.log('\n🔧 SOLUTION:');
    console.log('============');
    console.log('Option 1: Update org_members.userId to use email format');
    console.log('Option 2: Update TeamPage to query by Firebase UID');
    console.log('Option 3: Query org_members by email field instead');
    
  } catch (error) {
    console.error('❌ Error checking user ID format:', error);
  }
  
  process.exit(0);
}

checkUserIdFormat().catch(console.error);
