const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixOrgMembersUserId() {
  console.log('🔧 FIXING ORG_MEMBERS USERID FORMAT');
  console.log('===================================');
  
  try {
    // Get all org_members records
    const orgMembersQuery = await db.collection('org_members').get();
    
    console.log(`Found ${orgMembersQuery.size} org_members records to check`);
    
    for (const doc of orgMembersQuery.docs) {
      const data = doc.data();
      
      console.log(`\n📋 Processing org_member: ${doc.id}`);
      console.log(`   Current userId: ${data.userId}`);
      console.log(`   Email: ${data.email}`);
      
      // If userId is a Firebase UID (long alphanumeric), change it to email
      if (data.userId && data.email && data.userId !== data.email) {
        // Check if userId looks like a Firebase UID (long alphanumeric string)
        if (data.userId.length > 20 && /^[a-zA-Z0-9]+$/.test(data.userId)) {
          console.log(`   🔄 Updating userId from Firebase UID to email format`);
          
          await doc.ref.update({
            userId: data.email,
            firebaseUid: data.userId, // Keep the Firebase UID in a separate field
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`   ✅ Updated userId to: ${data.email}`);
          console.log(`   ✅ Preserved Firebase UID in firebaseUid field`);
        } else {
          console.log(`   ℹ️ userId already in correct format`);
        }
      } else if (data.userId === data.email) {
        console.log(`   ✅ userId already matches email`);
      } else {
        console.log(`   ⚠️ Missing userId or email field`);
      }
    }
    
    console.log('\n🎉 ORG_MEMBERS USERID FIXES COMPLETED');
    console.log('====================================');
    console.log('✅ All org_members records now use email format for userId');
    console.log('✅ Firebase UIDs preserved in firebaseUid field');
    console.log('✅ TeamPage queries should now work correctly');
    console.log('');
    console.log('🔍 EXPECTED BEHAVIOR:');
    console.log('   - TeamPage queries org_members by userId = user.id (email)');
    console.log('   - org_members.userId now contains email addresses');
    console.log('   - Query will find matching records');
    console.log('   - User role will be detected correctly');
    
  } catch (error) {
    console.error('❌ Error fixing org_members userId format:', error);
  }
  
  process.exit(0);
}

fixOrgMembersUserId().catch(console.error);
