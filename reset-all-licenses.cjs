#!/usr/bin/env node

/**
 * Reset All Licenses Script
 * 
 * This script completely resets license assignments:
 * 1. Unassigns ALL licenses
 * 2. Assigns exactly ONE license to each subscription user (basic, pro, enterprise)
 * 3. Leaves all other licenses unassigned for team members
 * 
 * Usage: node reset-all-licenses.cjs
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with application default credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function resetAllLicenses() {
  try {
    console.log('🔄 Starting complete license reset...');
    
    // Step 1: Find all subscription users
    console.log('\n🔍 Step 1: Finding subscription users...');
    
    const subscriptionUsers = {
      basic: await findUserByEmail('basic.user@example.com'),
      pro: await findUserByEmail('pro.user@example.com'),
      enterprise: await findUserByEmail('enterprise.user@example.com')
    };
    
    // Verify we found all users
    let allUsersFound = true;
    for (const [tier, user] of Object.entries(subscriptionUsers)) {
      if (user) {
        console.log(`✅ ${tier.toUpperCase()} user found: ${user.id} (${user.email})`);
      } else {
        console.log(`❌ ${tier.toUpperCase()} user not found`);
        allUsersFound = false;
      }
    }
    
    if (!allUsersFound) {
      console.log('❌ Not all subscription users were found. Please check user emails.');
      return;
    }
    
    // Step 2: Unassign ALL licenses
    console.log('\n🔧 Step 2: Unassigning ALL licenses...');
    
    const licensesQuery = await db.collection('licenses').get();
    const licenses = licensesQuery.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${licenses.length} total licenses`);
    
    // Group licenses by tier
    const licensesByTier = {
      BASIC: [],
      PRO: [],
      ENTERPRISE: []
    };
    
    licenses.forEach(license => {
      const tier = (license.tier || '').toUpperCase();
      if (licensesByTier[tier]) {
        licensesByTier[tier].push(license);
      }
    });
    
    console.log(`📊 Licenses by tier:`);
    console.log(`   BASIC: ${licensesByTier.BASIC.length}`);
    console.log(`   PRO: ${licensesByTier.PRO.length}`);
    console.log(`   ENTERPRISE: ${licensesByTier.ENTERPRISE.length}`);
    
    // Unassign all licenses in batches (Firestore has a limit of 500 operations per batch)
    const batchSize = 400;
    let unassignedCount = 0;
    
    for (let i = 0; i < licenses.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = licenses.slice(i, i + batchSize);
      
      for (const license of currentBatch) {
        batch.update(license.ref, {
          assignedToUserId: null,
          assignedToEmail: null,
          assignedAt: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        unassignedCount++;
      }
      
      await batch.commit();
      console.log(`✅ Unassigned ${currentBatch.length} licenses (batch ${Math.floor(i / batchSize) + 1})`);
    }
    
    console.log(`\n✅ Successfully unassigned all ${unassignedCount} licenses`);
    
    // Step 3: Assign exactly ONE license to each subscription user
    console.log('\n🔧 Step 3: Assigning ONE license to each subscription user...');
    
    // Sort licenses by expiration date (latest first) for each tier
    for (const tier in licensesByTier) {
      licensesByTier[tier].sort((a, b) => {
        const dateA = a.expiresAt instanceof admin.firestore.Timestamp ? a.expiresAt.toDate() : new Date(a.expiresAt || 0);
        const dateB = b.expiresAt instanceof admin.firestore.Timestamp ? b.expiresAt.toDate() : new Date(b.expiresAt || 0);
        return dateB - dateA;
      });
    }
    
    // Assign one license to each user
    const assignments = [
      { tier: 'BASIC', user: subscriptionUsers.basic },
      { tier: 'PRO', user: subscriptionUsers.pro },
      { tier: 'ENTERPRISE', user: subscriptionUsers.enterprise }
    ];
    
    for (const assignment of assignments) {
      const { tier, user } = assignment;
      const availableLicenses = licensesByTier[tier.toUpperCase()];
      
      if (availableLicenses.length === 0) {
        console.log(`❌ No ${tier} licenses available to assign to ${user.email}`);
        continue;
      }
      
      const licenseToAssign = availableLicenses[0];
      console.log(`🔄 Assigning ${tier} license ${licenseToAssign.id} to ${user.email}...`);
      
      await licenseToAssign.ref.update({
        assignedToUserId: user.id,
        assignedToEmail: user.email,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Successfully assigned ${tier} license to ${user.email}`);
    }
    
    // Step 4: Verify final results
    console.log('\n🔍 Step 4: Verifying final results...');
    
    // Get assigned licenses
    const assignedLicensesQuery = await db.collection('licenses')
      .where('assignedToUserId', '!=', null)
      .get();
    
    const assignedLicenses = assignedLicensesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Group assigned licenses by email
    const licensesByEmail = {};
    assignedLicenses.forEach(license => {
      const email = license.assignedToEmail || 'unknown';
      if (!licensesByEmail[email]) {
        licensesByEmail[email] = [];
      }
      licensesByEmail[email].push(license);
    });
    
    console.log(`\n📊 Final Results:`);
    console.log(`   Total licenses: ${licenses.length}`);
    console.log(`   Assigned licenses: ${assignedLicenses.length}`);
    console.log(`   Unassigned licenses: ${licenses.length - assignedLicenses.length}`);
    console.log(`   Users with licenses: ${Object.keys(licensesByEmail).length}`);
    
    console.log('\n📋 License Assignments:');
    for (const email in licensesByEmail) {
      const userLicenses = licensesByEmail[email];
      console.log(`   ${email}: ${userLicenses.length} license(s)`);
      userLicenses.forEach((license, index) => {
        console.log(`     ${index + 1}. ${license.id} (${license.tier || 'UNKNOWN'})`);
      });
    }
    
    if (assignedLicenses.length === 3 && Object.keys(licensesByEmail).length === 3) {
      console.log('\n🎉 SUCCESS: Each subscription user now has exactly one license!');
      console.log(`   ✅ ${licenses.length - 3} licenses are now available for team members`);
    } else {
      console.log('\n⚠️ WARNING: Expected 3 assigned licenses to 3 users, but found different results');
    }
    
  } catch (error) {
    console.error('❌ Error resetting licenses:', error);
    process.exit(1);
  }
}

async function findUserByEmail(email) {
  try {
    const userQuery = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (userQuery.empty) {
      return null;
    }
    
    const userDoc = userQuery.docs[0];
    return {
      id: userDoc.id,
      email: userDoc.data().email,
      ...userDoc.data()
    };
  } catch (error) {
    console.error(`❌ Error finding user ${email}:`, error);
    return null;
  }
}

// Run the script
console.log('🚀 Starting license reset...\n');
resetAllLicenses()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
