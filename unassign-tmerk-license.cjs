#!/usr/bin/env node

/**
 * Unassign Tmerk's License
 * 
 * This script finds and unassigns the license assigned to tmerk@example.com
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function unassignTmerkLicense() {
  try {
    console.log('🔧 Unassigning Tmerk\'s License...\n');
    
    // Step 1: Find Tmerk's license
    console.log('🔍 Step 1: Finding license assigned to tmerk@example.com...');
    
    const licensesQuery = await db.collection('licenses')
      .where('assignedToEmail', '==', 'tmerk@example.com')
      .limit(1)
      .get();
    
    if (licensesQuery.empty) {
      console.log('❌ No license found assigned to tmerk@example.com');
      return;
    }
    
    const licenseDoc = licensesQuery.docs[0];
    const licenseData = licenseDoc.data();
    console.log(`✅ Found license: ${licenseDoc.id} (${licenseData.tier || licenseData.type || 'ENTERPRISE'})`);
    
    // Step 2: Unassign the license
    console.log('\n🔧 Step 2: Unassigning license...');
    
    await licenseDoc.ref.update({
      assignedToUserId: null,
      assignedToEmail: null,
      assignedAt: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Successfully unassigned license ${licenseDoc.id} from tmerk@example.com`);
    
    // Step 3: Verify the unassignment
    console.log('\n🔍 Step 3: Verifying license unassignment...');
    
    const verifyQuery = await db.collection('licenses')
      .where('assignedToEmail', '==', 'tmerk@example.com')
      .limit(1)
      .get();
    
    if (verifyQuery.empty) {
      console.log('✅ Verification successful: No licenses assigned to tmerk@example.com');
    } else {
      console.log('❌ Verification failed: License is still assigned to tmerk@example.com');
    }
    
    console.log('\n🎉 Tmerk\'s license unassignment completed successfully!');
    
  } catch (error) {
    console.error('❌ Error unassigning Tmerk\'s license:', error);
  }
}

// Run the unassignment
unassignTmerkLicense().then(() => {
  console.log('\n🏁 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Script failed:', error);
  process.exit(1);
});
