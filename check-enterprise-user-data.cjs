const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function checkEnterpriseUserData() {
  console.log('🔍 CHECKING ENTERPRISE USER DATA & ASSOCIATIONS');
  console.log('===============================================');
  
  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterpriseFirebaseUid = 'xoAEWjTKXHSF1uOTdG2dZmm4Xar1';
    
    console.log(`\n1️⃣ ENTERPRISE USER PROFILE:`);
    console.log(`   Email: ${enterpriseEmail}`);
    console.log(`   Firebase UID: ${enterpriseFirebaseUid}`);
    
    // Check user document
    const userDoc = await db.collection('users').doc(enterpriseEmail).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log(`   ✅ User document exists`);
      console.log(`   Organization ID: ${userData.organizationId}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Member Role: ${userData.memberRole}`);
      console.log(`   Is Team Member: ${userData.isTeamMember}`);
    } else {
      console.log(`   ❌ User document not found`);
    }
    
    console.log(`\n2️⃣ TEAM MEMBER ASSOCIATIONS:`);
    
    // Check if enterprise user is in teamMembers collection
    const teamMemberQuery = await db.collection('teamMembers')
      .where('email', '==', enterpriseEmail)
      .get();
    
    console.log(`   Team Members with this email: ${teamMemberQuery.size}`);
    teamMemberQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Name: ${data.firstName} ${data.lastName}`);
      console.log(`     Role: ${data.role}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Organization: ${data.organizationId}`);
    });
    
    // Check org_members collection
    const orgMemberQuery = await db.collection('org_members')
      .where('email', '==', enterpriseEmail)
      .get();
    
    console.log(`   Org Members with this email: ${orgMemberQuery.size}`);
    orgMemberQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Name: ${data.name}`);
      console.log(`     Role: ${data.role}`);
      console.log(`     Organization: ${data.organizationId}`);
    });
    
    console.log(`\n3️⃣ BOB DERN ASSOCIATION CHECK:`);
    
    // Check Bob Dern's data
    const bobEmail = 'bdern@example.com';
    const bobTeamMemberQuery = await db.collection('teamMembers')
      .where('email', '==', bobEmail)
      .get();
    
    console.log(`   Bob Dern team member records: ${bobTeamMemberQuery.size}`);
    bobTeamMemberQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Name: ${data.firstName} ${data.lastName}`);
      console.log(`     Role: ${data.role}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Organization: ${data.organizationId}`);
      console.log(`     Assigned To User: ${data.assignedToUserId}`);
    });
    
    console.log(`\n4️⃣ SUBSCRIPTION DATA:`);
    
    // Check subscriptions for enterprise user
    const subscriptionQuery = await db.collection('subscriptions')
      .where('firebaseUid', '==', enterpriseFirebaseUid)
      .get();
    
    console.log(`   Subscriptions by Firebase UID: ${subscriptionQuery.size}`);
    subscriptionQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Tier: ${data.tier}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Amount: ${data.amount}`);
      console.log(`     User Email: ${data.userEmail}`);
      console.log(`     Organization: ${data.organizationId}`);
    });
    
    // Also check by email
    const subscriptionByEmailQuery = await db.collection('subscriptions')
      .where('userEmail', '==', enterpriseEmail)
      .get();
    
    console.log(`   Subscriptions by email: ${subscriptionByEmailQuery.size}`);
    subscriptionByEmailQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Tier: ${data.tier}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Amount: ${data.amount}`);
      console.log(`     Firebase UID: ${data.firebaseUid}`);
    });
    
    console.log(`\n5️⃣ PAYMENT DATA:`);
    
    // Check payments for enterprise user
    const paymentQuery = await db.collection('payments')
      .where('firebaseUid', '==', enterpriseFirebaseUid)
      .get();
    
    console.log(`   Payments by Firebase UID: ${paymentQuery.size}`);
    paymentQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Amount: ${data.amount}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     User Email: ${data.userEmail}`);
      console.log(`     Date: ${data.createdAt}`);
    });
    
    console.log(`\n6️⃣ INVOICE DATA:`);
    
    // Check invoices for enterprise user
    const invoiceQuery = await db.collection('invoices')
      .where('firebaseUid', '==', enterpriseFirebaseUid)
      .get();
    
    console.log(`   Invoices by Firebase UID: ${invoiceQuery.size}`);
    invoiceQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ID: ${doc.id}`);
      console.log(`     Amount: ${data.amount}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     User Email: ${data.userEmail}`);
      console.log(`     Due Date: ${data.dueDate}`);
    });
    
    console.log(`\n7️⃣ ALL TEAM MEMBERS IN DEFAULT-ORG:`);
    
    // Get all team members in default-org
    const allTeamMembersQuery = await db.collection('teamMembers')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log(`   Total team members in default-org: ${allTeamMembersQuery.size}`);
    allTeamMembersQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.firstName} ${data.lastName} (${data.email})`);
      console.log(`     Role: ${data.role}, Status: ${data.status}`);
    });
    
    console.log(`\n🎯 SUMMARY & RECOMMENDATIONS:`);
    console.log(`===============================`);
    
    if (teamMemberQuery.size === 0) {
      console.log(`❌ Enterprise user is NOT in teamMembers collection`);
      console.log(`   → This might be why Team Management page is empty`);
    }
    
    if (subscriptionQuery.size === 0 && subscriptionByEmailQuery.size === 0) {
      console.log(`❌ No subscriptions found for enterprise user`);
      console.log(`   → This is why Billing page shows no subscription`);
    }
    
    if (paymentQuery.size === 0) {
      console.log(`❌ No payments found for enterprise user`);
      console.log(`   → This is why Billing page shows no payment history`);
    }
    
    if (invoiceQuery.size === 0) {
      console.log(`❌ No invoices found for enterprise user`);
      console.log(`   → This is why Billing page shows no invoices`);
    }
    
  } catch (error) {
    console.error('❌ Error checking enterprise user data:', error);
  }
  
  process.exit(0);
}

checkEnterpriseUserData().catch(console.error);
