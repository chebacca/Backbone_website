const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

const SOURCE_ORG_ID = 'enterprise-org-001';
const TARGET_ORG_ID = 'enterprise-media-org';
const ENTERPRISE_USER_EMAIL = 'enterprise.user@enterprisemedia.com';

async function migrateEnterpriseData() {
  console.log('🔄 MIGRATING ENTERPRISE DATA TO CORRECT ORGANIZATION');
  console.log('====================================================');
  console.log(`Source Organization: ${SOURCE_ORG_ID}`);
  console.log(`Target Organization: ${TARGET_ORG_ID}`);
  console.log('');
  
  try {
    // Step 1: Check what data exists in source organization
    console.log('🔍 Step 1: Checking source organization data...');
    
    const sourceLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', SOURCE_ORG_ID)
      .get();
    
    const sourceTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', SOURCE_ORG_ID)
      .get();
    
    const sourceUsersSnapshot = await db.collection('users')
      .where('organizationId', '==', SOURCE_ORG_ID)
      .get();
    
    console.log(`📊 Source organization data:`);
    console.log(`   - Licenses: ${sourceLicensesSnapshot.size}`);
    console.log(`   - Team Members: ${sourceTeamMembersSnapshot.size}`);
    console.log(`   - Users: ${sourceUsersSnapshot.size}`);
    
    // Step 2: Check what data exists in target organization
    console.log('\n🔍 Step 2: Checking target organization data...');
    
    const targetLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', TARGET_ORG_ID)
      .get();
    
    const targetTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', TARGET_ORG_ID)
      .get();
    
    const targetUsersSnapshot = await db.collection('users')
      .where('organizationId', '==', TARGET_ORG_ID)
      .get();
    
    console.log(`📊 Target organization data:`);
    console.log(`   - Licenses: ${targetLicensesSnapshot.size}`);
    console.log(`   - Team Members: ${targetTeamMembersSnapshot.size}`);
    console.log(`   - Users: ${targetUsersSnapshot.size}`);
    
    // Step 3: Migrate licenses
    if (sourceLicensesSnapshot.size > 0) {
      console.log('\n🎫 Step 3: Migrating licenses...');
      
      const batch = db.batch();
      let migratedLicenses = 0;
      
      sourceLicensesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const newData = {
          ...data,
          organizationId: TARGET_ORG_ID,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Create new document in target organization
        const newDocRef = db.collection('licenses').doc();
        batch.set(newDocRef, newData);
        
        console.log(`   - Migrating license: ${data.key} (${data.tier})`);
        migratedLicenses++;
      });
      
      await batch.commit();
      console.log(`✅ Migrated ${migratedLicenses} licenses`);
    }
    
    // Step 4: Migrate team members
    if (sourceTeamMembersSnapshot.size > 0) {
      console.log('\n👥 Step 4: Migrating team members...');
      
      const batch = db.batch();
      let migratedTeamMembers = 0;
      
      sourceTeamMembersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const newData = {
          ...data,
          organizationId: TARGET_ORG_ID,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Create new document in target organization
        const newDocRef = db.collection('teamMembers').doc();
        batch.set(newDocRef, newData);
        
        console.log(`   - Migrating team member: ${data.email} (${data.firstName} ${data.lastName})`);
        migratedTeamMembers++;
      });
      
      await batch.commit();
      console.log(`✅ Migrated ${migratedTeamMembers} team members`);
    }
    
    // Step 5: Migrate users (excluding enterprise user)
    if (sourceUsersSnapshot.size > 0) {
      console.log('\n👤 Step 5: Migrating users...');
      
      const batch = db.batch();
      let migratedUsers = 0;
      
      sourceUsersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Skip enterprise user - they should already exist in target org
        if (data.email === ENTERPRISE_USER_EMAIL) {
          console.log(`   - Skipping enterprise user: ${data.email}`);
          return;
        }
        
        const newData = {
          ...data,
          organizationId: TARGET_ORG_ID,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Create new document in target organization
        const newDocRef = db.collection('users').doc();
        batch.set(newDocRef, newData);
        
        console.log(`   - Migrating user: ${data.email}`);
        migratedUsers++;
      });
      
      await batch.commit();
      console.log(`✅ Migrated ${migratedUsers} users`);
    }
    
    // Step 6: Update enterprise user's organization ID
    console.log('\n👤 Step 6: Updating enterprise user organization...');
    
    const enterpriseUserSnapshot = await db.collection('users')
      .where('email', '==', ENTERPRISE_USER_EMAIL)
      .get();
    
    if (!enterpriseUserSnapshot.empty) {
      const enterpriseUserDoc = enterpriseUserSnapshot.docs[0];
      await enterpriseUserDoc.ref.update({
        organizationId: TARGET_ORG_ID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Updated enterprise user organization to ${TARGET_ORG_ID}`);
    } else {
      console.log(`⚠️ Enterprise user not found in users collection`);
    }
    
    // Step 7: Verify migration
    console.log('\n🔍 Step 7: Verifying migration...');
    
    const finalTargetLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', TARGET_ORG_ID)
      .get();
    
    const finalTargetTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', TARGET_ORG_ID)
      .get();
    
    const finalTargetUsersSnapshot = await db.collection('users')
      .where('organizationId', '==', TARGET_ORG_ID)
      .get();
    
    console.log(`📊 Final target organization data:`);
    console.log(`   - Licenses: ${finalTargetLicensesSnapshot.size}`);
    console.log(`   - Team Members: ${finalTargetTeamMembersSnapshot.size}`);
    console.log(`   - Users: ${finalTargetUsersSnapshot.size}`);
    
    // Step 8: Show available licenses
    const availableLicenses = finalTargetLicensesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.status === 'ACTIVE' && (!data.assignedToUserId || data.assignedToUserId === null);
    });
    
    console.log(`\n🎫 Available licenses for team members: ${availableLicenses.length}`);
    availableLicenses.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.key} (${data.tier})`);
    });
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('====================================');
    console.log('✅ All data migrated to enterprise-media-org');
    console.log('✅ Enterprise user organization updated');
    console.log('✅ Frontend should now show correct data');
    console.log(`✅ ${availableLicenses.length} available licenses for team members`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n🔧 Debugging steps:');
    console.log('1. Check Firebase permissions');
    console.log('2. Check if organizations exist');
    console.log('3. Check if user has admin access');
  }
  
  process.exit(0);
}

migrateEnterpriseData().catch(console.error);

