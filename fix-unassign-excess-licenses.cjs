#!/usr/bin/env node

/**
 * Fix Unassign Excess Licenses Script
 * 
 * This script unassigns all licenses except one from each user:
 * 1. Keeps only one license assigned to each user
 * 2. Unassigns all other licenses to make them available for team members
 * 
 * Usage: node fix-unassign-excess-licenses.cjs
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with application default credentials
// This uses your Firebase CLI login credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixUnassignExcessLicenses() {
  try {
    console.log('🔧 Unassigning excess licenses...');
    
    // Step 1: Get all licenses
    console.log('\n🔍 Step 1: Finding all licenses...');
    
    const licensesQuery = await db.collection('licenses').get();
    const licenses = licensesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${licenses.length} licenses`);
    
    // Step 2: Group licenses by user email
    console.log('\n🔍 Step 2: Grouping licenses by user...');
    
    const licensesByEmail = {};
    let assignedLicenseCount = 0;
    
    licenses.forEach(license => {
      const email = license.assignedToEmail || 'unassigned';
      if (email !== 'unassigned') {
        assignedLicenseCount++;
        if (!licensesByEmail[email]) {
          licensesByEmail[email] = [];
        }
        licensesByEmail[email].push(license);
      }
    });
    
    const userCount = Object.keys(licensesByEmail).length;
    console.log(`📊 Found ${userCount} users with assigned licenses`);
    console.log(`📊 Found ${assignedLicenseCount} assigned licenses`);
    
    // Step 3: Keep only one license per user, unassign the rest
    console.log('\n🔧 Step 3: Unassigning excess licenses...');
    
    const batch = db.batch();
    let unassignedCount = 0;
    let keptCount = 0;
    
    for (const email in licensesByEmail) {
      const userLicenses = licensesByEmail[email];
      console.log(`\n👤 User ${email} has ${userLicenses.length} licenses assigned`);
      
      // Sort licenses by tier (ENTERPRISE > PRO > BASIC) and then by expiration date (latest first)
      userLicenses.sort((a, b) => {
        const tierOrder = { ENTERPRISE: 3, PRO: 2, BASIC: 1 };
        const tierA = tierOrder[a.tier] || 0;
        const tierB = tierOrder[b.tier] || 0;
        
        if (tierA !== tierB) {
          return tierB - tierA; // Higher tier first
        }
        
        // If same tier, sort by expiration date (latest first)
        const dateA = a.expiresAt instanceof admin.firestore.Timestamp ? a.expiresAt.toDate() : new Date(a.expiresAt || 0);
        const dateB = b.expiresAt instanceof admin.firestore.Timestamp ? b.expiresAt.toDate() : new Date(b.expiresAt || 0);
        return dateB - dateA;
      });
      
      // Keep the best license (highest tier, latest expiration)
      const licenseToKeep = userLicenses[0];
      console.log(`✅ Keeping license: ${licenseToKeep.id} (${licenseToKeep.tier || 'UNKNOWN'})`);
      keptCount++;
      
      // Unassign all other licenses
      for (let i = 1; i < userLicenses.length; i++) {
        const licenseToUnassign = userLicenses[i];
        console.log(`🔄 Unassigning license: ${licenseToUnassign.id} (${licenseToUnassign.tier || 'UNKNOWN'})`);
        
        batch.update(db.collection('licenses').doc(licenseToUnassign.id), {
          assignedToUserId: null,
          assignedToEmail: null,
          assignedAt: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        unassignedCount++;
      }
    }
    
    // Commit the batch
    if (unassignedCount > 0) {
      await batch.commit();
      console.log(`\n✅ Successfully unassigned ${unassignedCount} excess licenses`);
    } else {
      console.log('\n✅ No excess licenses to unassign');
    }
    
    // Step 4: Verify final results
    console.log('\n🔍 Step 4: Verifying final results...');
    
    // Get final licenses after all operations
    const finalLicensesQuery = await db.collection('licenses').get();
    const finalLicenses = finalLicensesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Group final licenses by assignedToEmail
    const finalLicensesByEmail = {};
    let finalAssignedCount = 0;
    
    finalLicenses.forEach(license => {
      const email = license.assignedToEmail || 'unassigned';
      if (email !== 'unassigned') {
        finalAssignedCount++;
        if (!finalLicensesByEmail[email]) {
          finalLicensesByEmail[email] = [];
        }
        finalLicensesByEmail[email].push(license);
      }
    });
    
    const finalUserCount = Object.keys(finalLicensesByEmail).length;
    
    console.log(`\n📊 Final Results:`);
    console.log(`   Total licenses: ${finalLicenses.length}`);
    console.log(`   Assigned licenses: ${finalAssignedCount}`);
    console.log(`   Unassigned licenses: ${finalLicenses.length - finalAssignedCount}`);
    console.log(`   Users with assigned licenses: ${finalUserCount}`);
    
    // Check if any users still have multiple licenses
    const usersWithMultipleLicenses = Object.keys(finalLicensesByEmail).filter(
      email => finalLicensesByEmail[email].length > 1
    );
    
    if (usersWithMultipleLicenses.length === 0) {
      console.log('\n🎉 SUCCESS: Each user now has exactly one license!');
      console.log(`   ✅ ${keptCount} users have one license each`);
      console.log(`   ✅ ${finalLicenses.length - finalAssignedCount} licenses are now available for assignment`);
    } else {
      console.log('\n⚠️ WARNING: Some users still have multiple licenses:');
      usersWithMultipleLicenses.forEach(email => {
        console.log(`   ❌ ${email}: ${finalLicensesByEmail[email].length} licenses`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing license assignments:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting excess license unassignment...\n');
fixUnassignExcessLicenses()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
