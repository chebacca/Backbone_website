#!/usr/bin/env node

/**
 * Fix Licensing Amounts Script
 * 
 * This script fixes the seeded license amounts for Pro and Enterprise users:
 * - Pro users should have at least 10 licenses (up to 50)
 * - Enterprise users should have at least 50 licenses
 * 
 * Usage: node fix-licensing-amounts.cjs
 * 
 * Note: This script uses Firebase CLI authentication.
 * Make sure you're logged in with 'firebase login' before running.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with application default credentials
// This uses your Firebase CLI login credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixLicensingAmounts() {
  try {
    console.log('🔧 Fixing licensing amounts for Pro and Enterprise users...');
    
    // Step 1: Find Pro and Enterprise users
    console.log('\n🔍 Step 1: Finding Pro and Enterprise users...');
    
    const proUserQuery = await db.collection('users')
      .where('email', '==', 'pro.user@example.com')
      .limit(1)
      .get();
    
    const enterpriseUserQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .limit(1)
      .get();
    
    if (proUserQuery.empty) {
      console.log('❌ Pro user not found');
      return;
    }
    
    if (enterpriseUserQuery.empty) {
      console.log('❌ Enterprise user not found');
      return;
    }
    
    const proUser = proUserQuery.docs[0];
    const enterpriseUser = enterpriseUserQuery.docs[0];
    
    console.log(`✅ Pro user found: ${proUser.id} (${proUser.data().email})`);
    console.log(`✅ Enterprise user found: ${enterpriseUser.id} (${enterpriseUser.data().email})`);
    
    // Step 2: Find their subscriptions
    console.log('\n🔍 Step 2: Finding subscriptions...');
    
    const proSubQuery = await db.collection('subscriptions')
      .where('userId', '==', proUser.id)
      .where('tier', '==', 'PRO')
      .limit(1)
      .get();
    
    const enterpriseSubQuery = await db.collection('subscriptions')
      .where('userId', '==', enterpriseUser.id)
      .where('tier', '==', 'ENTERPRISE')
      .limit(1)
      .get();
    
    if (proSubQuery.empty) {
      console.log('❌ Pro subscription not found');
      return;
    }
    
    if (enterpriseSubQuery.empty) {
      console.log('❌ Enterprise subscription not found');
      return;
    }
    
    const proSub = proSubQuery.docs[0];
    const enterpriseSub = enterpriseSubQuery.docs[0];
    
    console.log(`✅ Pro subscription found: ${proSub.id} (${proSub.data().seats} seats)`);
    console.log(`✅ Enterprise subscription found: ${enterpriseSub.id} (${enterpriseSub.data().seats} seats)`);
    
    // Step 3: Update subscription seat counts to meet minimums
    console.log('\n🔧 Step 3: Updating subscription seat counts...');
    
    const proCurrentSeats = proSub.data().seats || 0;
    const enterpriseCurrentSeats = enterpriseSub.data().seats || 0;
    
    // Pro: minimum 10 seats, Enterprise: minimum 50 seats
    const proTargetSeats = Math.max(10, proCurrentSeats);
    const enterpriseTargetSeats = Math.max(50, enterpriseCurrentSeats);
    
    if (proCurrentSeats < proTargetSeats) {
      console.log(`📈 Updating Pro subscription from ${proCurrentSeats} to ${proTargetSeats} seats...`);
      await proSub.ref.update({
        seats: proTargetSeats,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Pro subscription updated to ${proTargetSeats} seats`);
    } else {
      console.log(`✅ Pro subscription already has sufficient seats: ${proCurrentSeats}`);
    }
    
    if (enterpriseCurrentSeats < enterpriseTargetSeats) {
      console.log(`📈 Updating Enterprise subscription from ${enterpriseCurrentSeats} to ${enterpriseTargetSeats} seats...`);
      await enterpriseSub.ref.update({
        seats: enterpriseTargetSeats,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Enterprise subscription updated to ${enterpriseTargetSeats} seats`);
    } else {
      console.log(`✅ Enterprise subscription already has sufficient seats: ${enterpriseCurrentSeats}`);
    }
    
    // Step 4: Generate additional licenses to match the new seat counts
    console.log('\n🎫 Step 4: Generating additional licenses...');
    
    // Count existing licenses for each subscription
    const proLicensesQuery = await db.collection('licenses')
      .where('subscriptionId', '==', proSub.id)
      .get();
    
    const enterpriseLicensesQuery = await db.collection('licenses')
      .where('subscriptionId', '==', enterpriseSub.id)
      .get();
    
    const proExistingLicenses = proLicensesQuery.size;
    const enterpriseExistingLicenses = enterpriseLicensesQuery.size;
    
    console.log(`📊 Pro: ${proExistingLicenses} existing licenses, need ${proTargetSeats} total`);
    console.log(`📊 Enterprise: ${enterpriseExistingLicenses} existing licenses, need ${enterpriseTargetSeats} total`);
    
    // Generate additional Pro licenses if needed
    if (proExistingLicenses < proTargetSeats) {
      const proAdditionalNeeded = proTargetSeats - proExistingLicenses;
      console.log(`🎫 Generating ${proAdditionalNeeded} additional Pro licenses...`);
      
      for (let i = 0; i < proAdditionalNeeded; i++) {
        const licenseKey = `LIC-PRO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
        
        await db.collection('licenses').add({
          key: licenseKey,
          userId: proUser.id,
          subscriptionId: proSub.id,
          status: 'ACTIVE',
          tier: 'PRO',
          activatedAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: expiresAt,
          activationCount: 0,
          maxActivations: 3, // Pro tier allows 3 activations per license
          features: { tier: 'PRO', features: ['core', 'pro'] },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      console.log(`✅ Generated ${proAdditionalNeeded} additional Pro licenses`);
    }
    
    // Generate additional Enterprise licenses if needed
    if (enterpriseExistingLicenses < enterpriseTargetSeats) {
      const enterpriseAdditionalNeeded = enterpriseTargetSeats - enterpriseExistingLicenses;
      console.log(`🎫 Generating ${enterpriseAdditionalNeeded} additional Enterprise licenses...`);
      
      for (let i = 0; i < enterpriseAdditionalNeeded; i++) {
        const licenseKey = `LIC-ENTERPRISE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
        
        await db.collection('licenses').add({
          key: licenseKey,
          userId: enterpriseUser.id,
          subscriptionId: enterpriseSub.id,
          status: 'ACTIVE',
          tier: 'ENTERPRISE',
          activatedAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: expiresAt,
          activationCount: 0,
          maxActivations: 5, // Enterprise tier allows 5 activations per license
          features: { tier: 'ENTERPRISE', features: ['core', 'pro', 'enterprise'] },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      console.log(`✅ Generated ${enterpriseAdditionalNeeded} additional Enterprise licenses`);
    }
    
    // Step 5: Verify the results
    console.log('\n🔍 Step 5: Verifying results...');
    
    const finalProLicensesQuery = await db.collection('licenses')
      .where('subscriptionId', '==', proSub.id)
      .get();
    
    const finalEnterpriseLicensesQuery = await db.collection('licenses')
      .where('subscriptionId', '==', enterpriseSub.id)
      .get();
    
    const finalProLicenses = finalProLicensesQuery.size;
    const finalEnterpriseLicenses = finalEnterpriseLicensesQuery.size;
    
    console.log(`\n📊 Final Results:`);
    console.log(`   Pro User: ${finalProLicenses} licenses (target: ${proTargetSeats})`);
    console.log(`   Enterprise User: ${finalEnterpriseLicenses} licenses (target: ${enterpriseTargetSeats})`);
    
    if (finalProLicenses >= 10 && finalEnterpriseLicenses >= 50) {
      console.log('\n🎉 SUCCESS: Licensing amounts have been fixed!');
      console.log('   ✅ Pro users now have at least 10 licenses');
      console.log('   ✅ Enterprise users now have at least 50 licenses');
    } else {
      console.log('\n⚠️  WARNING: Some targets were not met');
      if (finalProLicenses < 10) {
        console.log(`   ❌ Pro users still need ${10 - finalProLicenses} more licenses`);
      }
      if (finalEnterpriseLicenses < 50) {
        console.log(`   ❌ Enterprise users still need ${50 - finalEnterpriseLicenses} more licenses`);
      }
    }
    
    // Step 6: Show license details
    console.log('\n📋 License Details:');
    
    console.log('\n   Pro Licenses:');
    finalProLicensesQuery.forEach((doc, index) => {
      const data = doc.data();
      console.log(`     ${index + 1}. ${data.key} - Status: ${data.status} - Activations: ${data.activationCount}/${data.maxActivations}`);
    });
    
    console.log('\n   Enterprise Licenses:');
    finalEnterpriseLicensesQuery.forEach((doc, index) => {
      const data = doc.data();
      console.log(`     ${index + 1}. ${data.key} - Status: ${data.status} - Activations: ${data.activationCount}/${data.maxActivations}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing licensing amounts:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting licensing amount fix...\n');
fixLicensingAmounts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
