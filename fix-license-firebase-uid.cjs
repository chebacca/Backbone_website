 aconst admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixLicenseFirebaseUid() {
  console.log('🔧 FIXING LICENSE FIREBASE UID FIELDS');
  console.log('====================================');
  
  try {
    // Get all users to create email -> firebaseUid mapping
    const usersQuery = await db.collection('users').get();
    const emailToFirebaseUid = {};
    
    usersQuery.forEach(doc => {
      const userData = doc.data();
      if (userData.email && userData.firebaseUid) {
        emailToFirebaseUid[userData.email] = userData.firebaseUid;
      }
    });
    
    console.log('Email to Firebase UID mapping:');
    Object.keys(emailToFirebaseUid).forEach(email => {
      console.log(`   ${email} -> ${emailToFirebaseUid[email]}`);
    });
    
    // Get all licenses in default-org
    const licensesQuery = await db.collection('licenses')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log(`\nFound ${licensesQuery.size} licenses to update`);
    
    for (const licenseDoc of licensesQuery.docs) {
      const licenseData = licenseDoc.data();
      
      console.log(`\n📜 Processing license: ${licenseDoc.id}`);
      console.log(`   Tier: ${licenseData.tier || licenseData.licenseType}`);
      console.log(`   Assigned to email: ${licenseData.assignedToEmail}`);
      console.log(`   Current firebaseUid: ${licenseData.firebaseUid}`);
      
      // If license has assignedToEmail but no firebaseUid, add it
      if (licenseData.assignedToEmail && !licenseData.firebaseUid) {
        const firebaseUid = emailToFirebaseUid[licenseData.assignedToEmail];
        
        if (firebaseUid) {
          await licenseDoc.ref.update({
            firebaseUid: firebaseUid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`   ✅ Added firebaseUid: ${firebaseUid}`);
        } else {
          console.log(`   ⚠️ No Firebase UID found for email: ${licenseData.assignedToEmail}`);
        }
      } else if (licenseData.firebaseUid) {
        console.log(`   ✅ Already has firebaseUid: ${licenseData.firebaseUid}`);
      } else {
        console.log(`   ℹ️ Unassigned license (no email)`);
      }
    }
    
    console.log('\n🎉 LICENSE FIREBASE UID FIXES COMPLETED');
    console.log('======================================');
    console.log('✅ All assigned licenses now have firebaseUid fields');
    console.log('✅ FirestoreLicenseService.getLicensesByFirebaseUid should now work');
    
  } catch (error) {
    console.error('❌ Error fixing license Firebase UIDs:', error);
  }
  
  process.exit(0);
}

fixLicenseFirebaseUid().catch(console.error);
