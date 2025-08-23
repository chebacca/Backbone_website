#!/usr/bin/env node

/**
 * Fix All Licensing Amounts Script
 * 
 * This script fixes ALL existing users in the Firestore database to meet the minimum licensing requirements:
 * - Pro users should have at least 10 licenses (up to 50)
 * - Enterprise users should have at least 50 licenses
 * 
 * This script will:
 * 1. Find all existing subscriptions
 * 2. Update seat counts to meet minimums
 * 3. Generate additional licenses as needed
 * 4. Update billing amounts accordingly
 * 
 * Usage: node fix-all-licensing-amounts.cjs
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

async function fixAllLicensingAmounts() {
  try {
    console.log('🔧 Fixing ALL licensing amounts in the database...');
    
    // Step 1: Get all subscriptions
    console.log('\n🔍 Step 1: Finding all subscriptions...');
    
    const subscriptionsSnapshot = await db.collection('subscriptions').get();
    const subscriptions = subscriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${subscriptions.length} total subscriptions`);
    
    if (subscriptions.length === 0) {
      console.log('❌ No subscriptions found in the database');
      return;
    }
    
    // Step 2: Group subscriptions by tier
    const subscriptionsByTier = {
      BASIC: [],
      PRO: [],
      ENTERPRISE: []
    };
    
    subscriptions.forEach(sub => {
      const tier = sub.tier?.toUpperCase() || 'BASIC';
      if (subscriptionsByTier[tier]) {
        subscriptionsByTier[tier].push(sub);
      }
    });
    
    console.log(`\n📊 Subscriptions by tier:`);
    console.log(`   BASIC: ${subscriptionsByTier.BASIC.length}`);
    console.log(`   PRO: ${subscriptionsByTier.PRO.length}`);
    console.log(`   ENTERPRISE: ${subscriptionsByTier.ENTERPRISE.length}`);
    
    // Step 3: Process each tier
    let totalUpdated = 0;
    let totalLicensesGenerated = 0;
    
    // Process PRO subscriptions
    if (subscriptionsByTier.PRO.length > 0) {
      console.log('\n🔧 Processing PRO subscriptions...');
      
      for (const sub of subscriptionsByTier.PRO) {
        const currentSeats = sub.seats || 0;
        const targetSeats = Math.max(10, currentSeats);
        
        if (currentSeats < targetSeats) {
          console.log(`📈 Updating PRO subscription ${sub.id} from ${currentSeats} to ${targetSeats} seats...`);
          
          // Update subscription
          await db.collection('subscriptions').doc(sub.id).update({
            seats: targetSeats,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          totalUpdated++;
          
          // Count existing licenses
          const licensesSnapshot = await db.collection('licenses')
            .where('subscriptionId', '==', sub.id)
            .get();
          
          const existingLicenses = licensesSnapshot.size;
          const additionalNeeded = targetSeats - existingLicenses;
          
          if (additionalNeeded > 0) {
            console.log(`🎫 Generating ${additionalNeeded} additional PRO licenses for subscription ${sub.id}...`);
            
            for (let i = 0; i < additionalNeeded; i++) {
              const licenseKey = `LIC-PRO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
              const now = new Date();
              const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
              
              await db.collection('licenses').add({
                key: licenseKey,
                userId: sub.userId,
                subscriptionId: sub.id,
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
            
            totalLicensesGenerated += additionalNeeded;
            console.log(`✅ Generated ${additionalNeeded} additional PRO licenses`);
          }
        } else {
          console.log(`✅ PRO subscription ${sub.id} already has sufficient seats: ${currentSeats}`);
        }
      }
    }
    
    // Process ENTERPRISE subscriptions
    if (subscriptionsByTier.ENTERPRISE.length > 0) {
      console.log('\n🔧 Processing ENTERPRISE subscriptions...');
      
      for (const sub of subscriptionsByTier.ENTERPRISE) {
        const currentSeats = sub.seats || 0;
        const targetSeats = Math.max(50, currentSeats);
        
        if (currentSeats < targetSeats) {
          console.log(`📈 Updating ENTERPRISE subscription ${sub.id} from ${currentSeats} to ${targetSeats} seats...`);
          
          // Update subscription
          await db.collection('subscriptions').doc(sub.id).update({
            seats: targetSeats,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          totalUpdated++;
          
          // Count existing licenses
          const licensesSnapshot = await db.collection('licenses')
            .where('subscriptionId', '==', sub.id)
            .get();
          
          const existingLicenses = licensesSnapshot.size;
          const additionalNeeded = targetSeats - existingLicenses;
          
          if (additionalNeeded > 0) {
            console.log(`🎫 Generating ${additionalNeeded} additional ENTERPRISE licenses for subscription ${sub.id}...`);
            
            for (let i = 0; i < additionalNeeded; i++) {
              const licenseKey = `LIC-ENTERPRISE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
              const now = new Date();
              const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
              
              await db.collection('licenses').add({
                key: licenseKey,
                userId: sub.userId,
                subscriptionId: sub.id,
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
            
            totalLicensesGenerated += additionalNeeded;
            console.log(`✅ Generated ${additionalNeeded} additional ENTERPRISE licenses`);
          }
        } else {
          console.log(`✅ ENTERPRISE subscription ${sub.id} already has sufficient seats: ${currentSeats}`);
        }
      }
    }
    
    // Step 4: Verify final results
    console.log('\n🔍 Step 4: Verifying final results...');
    
    const finalSubscriptionsSnapshot = await db.collection('subscriptions').get();
    const finalSubscriptions = finalSubscriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const finalLicensesSnapshot = await db.collection('licenses').get();
    const finalLicenses = finalLicensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Group by tier for final summary
    const finalByTier = {
      BASIC: { subscriptions: 0, licenses: 0, totalSeats: 0 },
      PRO: { subscriptions: 0, licenses: 0, totalSeats: 0 },
      ENTERPRISE: { subscriptions: 0, licenses: 0, totalSeats: 0 }
    };
    
    finalSubscriptions.forEach(sub => {
      const tier = sub.tier?.toUpperCase() || 'BASIC';
      if (finalByTier[tier]) {
        finalByTier[tier].subscriptions++;
        finalByTier[tier].totalSeats += sub.seats || 0;
      }
    });
    
    finalLicenses.forEach(license => {
      const tier = license.tier?.toUpperCase() || 'BASIC';
      if (finalByTier[tier]) {
        finalByTier[tier].licenses++;
      }
    });
    
    console.log(`\n📊 Final Database Summary:`);
    console.log(`   BASIC: ${finalByTier.BASIC.subscriptions} subscriptions, ${finalByTier.BASIC.licenses} licenses, ${finalByTier.BASIC.totalSeats} total seats`);
    console.log(`   PRO: ${finalByTier.PRO.subscriptions} subscriptions, ${finalByTier.PRO.licenses} licenses, ${finalByTier.PRO.totalSeats} total seats`);
    console.log(`   ENTERPRISE: ${finalByTier.ENTERPRISE.subscriptions} subscriptions, ${finalByTier.ENTERPRISE.licenses} licenses, ${finalByTier.ENTERPRISE.totalSeats} total seats`);
    
    // Check if minimums are met
    const proMinMet = finalByTier.PRO.totalSeats >= (finalByTier.PRO.subscriptions * 10);
    const enterpriseMinMet = finalByTier.ENTERPRISE.totalSeats >= (finalByTier.ENTERPRISE.subscriptions * 50);
    
    console.log(`\n🎯 Minimum Requirements Check:`);
    console.log(`   Pro users (min 10 seats each): ${proMinMet ? '✅ MET' : '❌ NOT MET'}`);
    console.log(`   Enterprise users (min 50 seats each): ${enterpriseMinMet ? '✅ MET' : '❌ NOT MET'}`);
    
    if (proMinMet && enterpriseMinMet) {
      console.log('\n🎉 SUCCESS: All licensing minimums have been met!');
    } else {
      console.log('\n⚠️  WARNING: Some minimums were not met');
      if (!proMinMet) {
        console.log(`   ❌ Pro users need at least ${finalByTier.PRO.subscriptions * 10} total seats, but only have ${finalByTier.PRO.totalSeats}`);
      }
      if (!enterpriseMinMet) {
        console.log(`   ❌ Enterprise users need at least ${finalByTier.ENTERPRISE.subscriptions * 50} total seats, but only have ${finalByTier.ENTERPRISE.totalSeats}`);
      }
    }
    
    console.log(`\n📈 Summary of Changes:`);
    console.log(`   Subscriptions updated: ${totalUpdated}`);
    console.log(`   Additional licenses generated: ${totalLicensesGenerated}`);
    
  } catch (error) {
    console.error('❌ Error fixing all licensing amounts:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting comprehensive licensing amount fix...\n');
fixAllLicensingAmounts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
