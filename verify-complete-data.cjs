const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function verifyCompleteData() {
  console.log('🔍 COMPREHENSIVE DATA VERIFICATION');
  console.log('==================================');
  
  // 1. Check enterprise user
  console.log('\n1️⃣ ENTERPRISE USER:');
  const userQuery = await db.collection('users').where('email', '==', 'enterprise.user@example.com').get();
  if (!userQuery.empty) {
    const userData = userQuery.docs[0].data();
    console.log('✅ Enterprise user found:', userData.email);
    console.log('   Document ID:', userQuery.docs[0].id);
    console.log('   Organization ID:', userData.organizationId);
    console.log('   Firebase UID:', userData.firebaseUid);
    console.log('   Role:', userData.role);
    console.log('   Member Role:', userData.memberRole);
    console.log('   Is Team Member:', userData.isTeamMember);
  } else {
    console.log('❌ Enterprise user not found');
    return;
  }
  
  // 2. Check team members
  console.log('\n2️⃣ TEAM MEMBERS:');
  const teamMembers = await db.collection('teamMembers').where('organizationId', '==', 'default-org').get();
  console.log('Total team members in default-org:', teamMembers.size);
  teamMembers.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.name || data.memberName} (${data.email}) - Role: ${data.role}, Status: ${data.status}`);
  });
  
  // 3. Check org_members
  console.log('\n3️⃣ ORG MEMBERS:');
  const orgMembers = await db.collection('org_members').where('organizationId', '==', 'default-org').get();
  console.log('Total org members in default-org:', orgMembers.size);
  orgMembers.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.memberName} (${data.memberEmail}) - Role: ${data.role}`);
  });
  
  // 4. Check projects
  console.log('\n4️⃣ PROJECTS:');
  const projects = await db.collection('projects').where('organizationId', '==', 'default-org').get();
  console.log('Total projects in default-org:', projects.size);
  projects.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.name} - Owner: ${data.ownerId || data.ownerName}, Created: ${data.createdAt?.toDate()}`);
  });
  
  // 5. Check licenses
  console.log('\n5️⃣ LICENSES:');
  const licenses = await db.collection('licenses').where('organizationId', '==', 'default-org').get();
  console.log('Total licenses in default-org:', licenses.size);
  licenses.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.licenseType || data.tier} - Assigned to: ${data.assignedToEmail || 'Unassigned'}, Status: ${data.status}`);
  });
  
  // 6. Check subscriptions
  console.log('\n6️⃣ SUBSCRIPTIONS:');
  const subscriptions = await db.collection('subscriptions').where('organizationId', '==', 'default-org').get();
  console.log('Total subscriptions in default-org:', subscriptions.size);
  subscriptions.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.tier} - User: ${data.userEmail || data.userId}, Status: ${data.status}, Amount: ${data.amount}`);
  });
  
  // Also check by Firebase UID
  const enterpriseUid = userQuery.docs[0].data().firebaseUid;
  if (enterpriseUid) {
    const subsByUid = await db.collection('subscriptions').where('firebaseUid', '==', enterpriseUid).get();
    console.log(`   - Subscriptions by Firebase UID (${enterpriseUid}):`, subsByUid.size);
  }
  
  // 7. Check payments
  console.log('\n7️⃣ PAYMENTS:');
  const payments = await db.collection('payments').where('organizationId', '==', 'default-org').get();
  console.log('Total payments in default-org:', payments.size);
  payments.forEach(doc => {
    const data = doc.data();
    console.log(`   - Amount: ${data.amount}, Status: ${data.status}, User: ${data.userEmail || data.userId}`);
  });
  
  // 8. Check invoices
  console.log('\n8️⃣ INVOICES:');
  const invoices = await db.collection('invoices').where('organizationId', '==', 'default-org').get();
  console.log('Total invoices in default-org:', invoices.size);
  invoices.forEach(doc => {
    const data = doc.data();
    console.log(`   - Amount: ${data.amount}, Status: ${data.status}, User: ${data.userEmail || data.userId}`);
  });
  
  // 9. Check billing profiles
  console.log('\n9️⃣ BILLING PROFILES:');
  const billingProfiles = await db.collection('billingProfiles').where('organizationId', '==', 'default-org').get();
  console.log('Total billing profiles in default-org:', billingProfiles.size);
  billingProfiles.forEach(doc => {
    const data = doc.data();
    console.log(`   - User: ${data.userEmail || data.userId}, Company: ${data.companyName || 'N/A'}`);
  });
  
  console.log('\n🎯 SUMMARY:');
  console.log('==========');
  console.log(`Users: ${userQuery.size}`);
  console.log(`Team Members: ${teamMembers.size}`);
  console.log(`Org Members: ${orgMembers.size}`);
  console.log(`Projects: ${projects.size}`);
  console.log(`Licenses: ${licenses.size}`);
  console.log(`Subscriptions: ${subscriptions.size}`);
  console.log(`Payments: ${payments.size}`);
  console.log(`Invoices: ${invoices.size}`);
  console.log(`Billing Profiles: ${billingProfiles.size}`);
  
  process.exit(0);
}

verifyCompleteData().catch(console.error);
