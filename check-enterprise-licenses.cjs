const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function checkEnterpriseLicenses() {
  console.log('🔍 CHECKING ENTERPRISE LICENSE ALLOCATION');
  console.log('=========================================');
  
  try {
    // Check current license count for default-org (enterprise user)
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', 'default-org')
      .get();
    
    console.log(`📊 Current licenses for default-org: ${licensesSnapshot.size}`);
    
    // List all licenses
    licensesSnapshot.forEach(doc => {
      const license = doc.data();
      console.log(`  - ${doc.id}: ${license.tier} | ${license.status} | assigned to: ${license.assignedToEmail || 'unassigned'}`);
    });
    
    // Check enterprise user's subscription
    const enterpriseUid = 'xoAEWjTKXHSF1uOTdG2dZmm4Xar1';
    const subscriptionSnapshot = await db.collection('subscriptions')
      .where('firebaseUid', '==', enterpriseUid)
      .get();
    
    if (!subscriptionSnapshot.empty) {
      const subscription = subscriptionSnapshot.docs[0].data();
      console.log(`\n📋 Enterprise subscription tier: ${subscription.tier}`);
      console.log(`📋 Subscription status: ${subscription.status}`);
    }
    
    console.log('');
    console.log('🎯 ENTERPRISE TIER SHOULD HAVE:');
    console.log('- Up to 250 licenses total');
    console.log('- 1 owner license (enterprise user)');
    console.log('- 249 available for team members');
    console.log('');
    console.log(`❌ CURRENT: Only ${licensesSnapshot.size} licenses (should be 250)`);
    
  } catch (error) {
    console.error('❌ Error checking licenses:', error);
  }
  
  process.exit(0);
}

checkEnterpriseLicenses().catch(console.error);
