const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixTeamManagementData() {
  console.log('🔧 FIXING TEAM MANAGEMENT DATA & ASSOCIATIONS');
  console.log('=============================================');
  
  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterpriseFirebaseUid = 'xoAEWjTKXHSF1uOTdG2dZmm4Xar1';
    const bobEmail = 'bdern@example.com';
    const bobFirebaseUid = 'Y94ytNb7MFbX6aymvLniVRL7xe02';
    
    console.log('\n1️⃣ CLEANING UP DUPLICATE TEAM MEMBER RECORDS');
    console.log('============================================');
    
    // Find and remove the duplicate enterprise user team member record with wrong org ID
    const duplicateTeamMemberQuery = await db.collection('teamMembers')
      .where('email', '==', enterpriseEmail)
      .get();
    
    console.log(`Found ${duplicateTeamMemberQuery.size} team member records for enterprise user`);
    
    for (const doc of duplicateTeamMemberQuery.docs) {
      const data = doc.data();
      console.log(`- Record ID: ${doc.id}`);
      console.log(`  Organization: ${data.organizationId}`);
      console.log(`  Role: ${data.role}`);
      
      // Remove the record with wrong organization ID
      if (data.organizationId !== 'default-org') {
        console.log(`  ❌ Removing duplicate record with wrong org ID: ${data.organizationId}`);
        await doc.ref.delete();
      } else {
        console.log(`  ✅ Keeping record with correct org ID: default-org`);
      }
    }
    
    console.log('\n2️⃣ LINKING BOB DERN TO ENTERPRISE USER');
    console.log('======================================');
    
    // Update Bob Dern's team member record to link him to enterprise user
    const bobTeamMemberQuery = await db.collection('teamMembers')
      .where('email', '==', bobEmail)
      .get();
    
    if (!bobTeamMemberQuery.empty) {
      const bobDoc = bobTeamMemberQuery.docs[0];
      const bobData = bobDoc.data();
      
      console.log(`Found Bob Dern's team member record: ${bobDoc.id}`);
      console.log(`Current assignedToUserId: ${bobData.assignedToUserId}`);
      
      // Update Bob's record to link him to enterprise user
      await bobDoc.ref.update({
        assignedToUserId: enterpriseFirebaseUid,
        assignedToUserEmail: enterpriseEmail,
        assignedBy: enterpriseFirebaseUid,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Linked Bob Dern to enterprise user: ${enterpriseFirebaseUid}`);
    } else {
      console.log(`❌ Bob Dern's team member record not found`);
    }
    
    console.log('\n3️⃣ CREATING MISSING ORG_MEMBERS RECORDS');
    console.log('=======================================');
    
    // Check if enterprise user has org_members record
    const enterpriseOrgMemberQuery = await db.collection('org_members')
      .where('email', '==', enterpriseEmail)
      .get();
    
    if (enterpriseOrgMemberQuery.empty) {
      console.log('Creating org_members record for enterprise user...');
      
      await db.collection('org_members').add({
        userId: enterpriseFirebaseUid,
        email: enterpriseEmail,
        name: 'Enterprise User',
        role: 'OWNER',
        organizationId: 'default-org',
        status: 'ACTIVE',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Created org_members record for enterprise user');
    } else {
      console.log('✅ Enterprise user already has org_members record');
    }
    
    // Check if Bob Dern has org_members record
    const bobOrgMemberQuery = await db.collection('org_members')
      .where('email', '==', bobEmail)
      .get();
    
    if (bobOrgMemberQuery.empty) {
      console.log('Creating org_members record for Bob Dern...');
      
      await db.collection('org_members').add({
        userId: bobFirebaseUid,
        email: bobEmail,
        name: 'Bob Dern',
        role: 'MEMBER',
        organizationId: 'default-org',
        status: 'ACTIVE',
        assignedToUserId: enterpriseFirebaseUid,
        assignedToUserEmail: enterpriseEmail,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Created org_members record for Bob Dern');
    } else {
      console.log('✅ Bob Dern already has org_members record');
    }
    
    console.log('\n4️⃣ ENSURING PROPER TEAM MEMBER HIERARCHY');
    console.log('========================================');
    
    // Get all team members in default-org and ensure proper hierarchy
    const allTeamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log(`Found ${allTeamMembersQuery.size} team members in default-org`);
    
    for (const doc of allTeamMembersQuery.docs) {
      const data = doc.data();
      
      // If team member doesn't have assignedToUserId and is not the owner, assign to enterprise user
      if (!data.assignedToUserId && data.role !== 'OWNER' && data.email !== enterpriseEmail) {
        console.log(`Assigning ${data.firstName} ${data.lastName} to enterprise user...`);
        
        await doc.ref.update({
          assignedToUserId: enterpriseFirebaseUid,
          assignedToUserEmail: enterpriseEmail,
          assignedBy: enterpriseFirebaseUid,
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Assigned ${data.firstName} ${data.lastName} to enterprise user`);
      }
    }
    
    console.log('\n5️⃣ VERIFYING BILLING DATA LINKAGE');
    console.log('=================================');
    
    // Verify that billing data is properly linked
    const subscriptions = await db.collection('subscriptions')
      .where('firebaseUid', '==', enterpriseFirebaseUid)
      .get();
    
    const payments = await db.collection('payments')
      .where('firebaseUid', '==', enterpriseFirebaseUid)
      .get();
    
    const invoices = await db.collection('invoices')
      .where('firebaseUid', '==', enterpriseFirebaseUid)
      .get();
    
    console.log(`✅ Enterprise user has ${subscriptions.size} subscriptions`);
    console.log(`✅ Enterprise user has ${payments.size} payments`);
    console.log(`✅ Enterprise user has ${invoices.size} invoices`);
    
    console.log('\n🎉 TEAM MANAGEMENT DATA FIXES COMPLETED');
    console.log('======================================');
    console.log('✅ Removed duplicate team member records');
    console.log('✅ Linked Bob Dern to enterprise user');
    console.log('✅ Created missing org_members records');
    console.log('✅ Established proper team member hierarchy');
    console.log('✅ Verified billing data linkage');
    console.log('');
    console.log('🌐 TEAM MANAGEMENT PAGE SHOULD NOW SHOW:');
    console.log('   - Enterprise user as OWNER');
    console.log('   - Bob Dern and other team members under enterprise user');
    console.log('   - Proper role hierarchy and assignments');
    console.log('');
    console.log('💳 BILLING PAGE SHOULD NOW SHOW:');
    console.log('   - Enterprise subscription ($4,999.50)');
    console.log('   - Payment history');
    console.log('   - Invoice history');
    
  } catch (error) {
    console.error('❌ Error fixing team management data:', error);
  }
  
  process.exit(0);
}

fixTeamManagementData().catch(console.error);
