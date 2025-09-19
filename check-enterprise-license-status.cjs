const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function checkEnterpriseLicenseStatus() {
  console.log('🔍 CHECKING ENTERPRISE USER LICENSE STATUS');
  console.log('==========================================');
  
  try {
    const enterpriseEmail = 'enterprise.user@enterprisemedia.com';
    
    // Step 1: Find the enterprise user
    console.log(`\n👤 Looking for user: ${enterpriseEmail}`);
    const usersSnapshot = await db.collection('users')
      .where('email', '==', enterpriseEmail)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Enterprise user not found in users collection');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    console.log(`✅ Found user: ${userData.name} (ID: ${userDoc.id})`);
    console.log(`   Organization: ${userData.organizationId || 'N/A'}`);
    console.log(`   Role: ${userData.role || 'N/A'}`);
    
    // Step 2: Check subscriptions
    console.log(`\n📋 Checking subscriptions...`);
    const subscriptionsSnapshot = await db.collection('subscriptions')
      .where('userId', '==', userDoc.id)
      .get();
    
    if (subscriptionsSnapshot.empty) {
      console.log('❌ No subscriptions found for enterprise user');
    } else {
      subscriptionsSnapshot.forEach((doc, index) => {
        const sub = doc.data();
        console.log(`   ${index + 1}. ${sub.tier} - ${sub.status} - ${sub.seats} seats`);
        console.log(`      Created: ${sub.createdAt?.toDate?.() || sub.createdAt}`);
        console.log(`      Expires: ${sub.currentPeriodEnd?.toDate?.() || sub.currentPeriodEnd}`);
      });
    }
    
    // Step 3: Check licenses
    console.log(`\n🎫 Checking licenses...`);
    const licensesSnapshot = await db.collection('licenses')
      .where('userId', '==', userDoc.id)
      .get();
    
    if (licensesSnapshot.empty) {
      console.log('❌ No licenses found for enterprise user');
    } else {
      console.log(`✅ Found ${licensesSnapshot.size} licenses:`);
      licensesSnapshot.forEach((doc, index) => {
        const license = doc.data();
        console.log(`   ${index + 1}. ${license.tier} - ${license.status}`);
        console.log(`      Key: ${license.key?.substring(0, 20)}...`);
        console.log(`      Expires: ${license.expiresAt?.toDate?.() || license.expiresAt}`);
        console.log(`      Assigned: ${license.assignedToEmail || 'unassigned'}`);
      });
    }
    
    // Step 4: Check organization licenses
    const orgId = userData.organizationId;
    if (orgId) {
      console.log(`\n🏢 Checking organization licenses (${orgId})...`);
      const orgLicensesSnapshot = await db.collection('licenses')
        .where('organizationId', '==', orgId)
        .get();
      
      console.log(`📊 Organization has ${orgLicensesSnapshot.size} total licenses:`);
      
      const activeLicenses = orgLicensesSnapshot.docs.filter(doc => 
        doc.data().status === 'ACTIVE'
      );
      const unassignedLicenses = activeLicenses.filter(doc => 
        !doc.data().assignedToUserId
      );
      
      console.log(`   - Active: ${activeLicenses.length}`);
      console.log(`   - Unassigned: ${unassignedLicenses.length}`);
      console.log(`   - Assigned: ${activeLicenses.length - unassignedLicenses.length}`);
      
      if (unassignedLicenses.length > 0) {
        console.log(`\n✅ Available licenses for team members:`);
        unassignedLicenses.forEach((doc, index) => {
          const license = doc.data();
          console.log(`   ${index + 1}. ${license.tier} - Key: ${license.key?.substring(0, 20)}...`);
        });
      } else {
        console.log(`\n⚠️ No available licenses for team members`);
      }
    }
    
    // Step 5: Check recent purchases
    console.log(`\n💳 Checking recent purchases...`);
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', userDoc.id)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    if (paymentsSnapshot.empty) {
      console.log('❌ No payment records found');
    } else {
      console.log(`✅ Found ${paymentsSnapshot.size} recent payments:`);
      paymentsSnapshot.forEach((doc, index) => {
        const payment = doc.data();
        console.log(`   ${index + 1}. $${payment.amount} - ${payment.status}`);
        console.log(`      Created: ${payment.createdAt?.toDate?.() || payment.createdAt}`);
        console.log(`      Description: ${payment.description || 'N/A'}`);
      });
    }
    
    // Summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`   User: ${enterpriseEmail}`);
    console.log(`   Subscriptions: ${subscriptionsSnapshot.size}`);
    console.log(`   Personal Licenses: ${licensesSnapshot.size}`);
    console.log(`   Organization Licenses: ${orgId ? (orgLicensesSnapshot ? orgLicensesSnapshot.size : 0) : 'N/A'}`);
    console.log(`   Available for Team: ${orgId ? (unassignedLicenses ? unassignedLicenses.length : 0) : 'N/A'}`);
    console.log(`   Recent Payments: ${paymentsSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error checking enterprise license status:', error);
  }
  
  process.exit(0);
}

checkEnterpriseLicenseStatus().catch(console.error);
