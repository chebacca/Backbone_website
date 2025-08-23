#!/usr/bin/env node

/**
 * Assign Single License Script
 * 
 * This script assigns a single license to the Enterprise User and leaves the rest unassigned.
 * This ensures that each subscription-based user with team member options has exactly one
 * license assigned to them, with the rest available for team members.
 * 
 * Usage: node assign-single-license.cjs
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with application default credentials
// This uses your Firebase CLI login credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function assignSingleLicense() {
  try {
    console.log('🔧 Assigning single license to Enterprise User...');
    
    // Step 1: Find Enterprise User
    console.log('\n🔍 Step 1: Finding Enterprise User...');
    
    const enterpriseUserQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .limit(1)
      .get();
    
    if (enterpriseUserQuery.empty) {
      console.log('❌ Enterprise User not found');
      return;
    }
    
    const enterpriseUser = enterpriseUserQuery.docs[0];
    console.log(`✅ Enterprise User found: ${enterpriseUser.id} (${enterpriseUser.data().email})`);
    
    // Step 2: Unassign all licenses
    console.log('\n🔧 Step 2: Unassigning all licenses...');
    
    const licensesQuery = await db.collection('licenses').get();
    const licenses = licensesQuery.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${licenses.length} total licenses`);
    
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
    
    console.log(`\n✅ Successfully unassigned ${unassignedCount} licenses`);
    
    // Step 3: Find the best license to assign to Enterprise User
    console.log('\n🔍 Step 3: Finding best license for Enterprise User...');
    
    // Get Enterprise licenses
    const enterpriseLicensesQuery = await db.collection('licenses')
      .where('tier', '==', 'ENTERPRISE')
      .limit(10)
      .get();
    
    if (enterpriseLicensesQuery.empty) {
      console.log('❌ No Enterprise licenses found');
      return;
    }
    
    const enterpriseLicenses = enterpriseLicensesQuery.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${enterpriseLicenses.length} Enterprise licenses`);
    
    // Sort licenses by expiration date (latest first)
    enterpriseLicenses.sort((a, b) => {
      const dateA = a.expiresAt instanceof admin.firestore.Timestamp ? a.expiresAt.toDate() : new Date(a.expiresAt || 0);
      const dateB = b.expiresAt instanceof admin.firestore.Timestamp ? b.expiresAt.toDate() : new Date(b.expiresAt || 0);
      return dateB - dateA;
    });
    
    // Assign the best license to Enterprise User
    const licenseToAssign = enterpriseLicenses[0];
    
    console.log(`🔄 Assigning license ${licenseToAssign.id} to Enterprise User...`);
    
    await licenseToAssign.ref.update({
      assignedToUserId: enterpriseUser.id,
      assignedToEmail: enterpriseUser.data().email,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Successfully assigned license ${licenseToAssign.id} to Enterprise User`);
    
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
    
    console.log(`\n📊 Final Results:`);
    console.log(`   Total licenses: ${licenses.length}`);
    console.log(`   Assigned licenses: ${assignedLicenses.length}`);
    console.log(`   Unassigned licenses: ${licenses.length - assignedLicenses.length}`);
    
    if (assignedLicenses.length === 1) {
      console.log('\n🎉 SUCCESS: Enterprise User now has exactly one license!');
      console.log(`   ✅ ${licenses.length - 1} licenses are now available for team members`);
    } else {
      console.log('\n⚠️ WARNING: Expected 1 assigned license, but found ${assignedLicenses.length}');
    }
    
  } catch (error) {
    console.error('❌ Error assigning single license:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting single license assignment...\n');
assignSingleLicense()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
