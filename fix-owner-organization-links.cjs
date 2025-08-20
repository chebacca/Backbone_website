#!/usr/bin/env node

/**
 * Fix Owner Organization Links
 * 
 * This script ensures all owner users have the correct organizationId
 * by linking them to organizations they own.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'backbone-logic'
  });
}

const db = admin.firestore();

async function fixOwnerOrganizationLinks() {
  console.log('🚀 Fixing owner organization links...');
  
  try {
    // Get all owner users
    const ownersSnap = await db.collection('users')
      .where('role', '==', 'OWNER')
      .get();
    
    console.log(`📊 Found ${ownersSnap.size} owner users`);
    
    let fixedCount = 0;
    
    for (const ownerDoc of ownersSnap.docs) {
      const ownerData = ownerDoc.data();
      
      console.log(`\n🔍 Processing owner: ${ownerData.email} (${ownerDoc.id})`);
      
      // Check if they already have organizationId
      if (ownerData.organizationId) {
        console.log(`✅ Owner already has organizationId: ${ownerData.organizationId}`);
        continue;
      }
      
      // Find organizations owned by this user
      const orgsSnap = await db.collection('organizations')
        .where('ownerUserId', '==', ownerDoc.id)
        .get();
      
      if (orgsSnap.empty) {
        console.log(`⚠️ No organizations found for owner ${ownerData.email}`);
        continue;
      }
      
      // Use the first organization found
      const orgDoc = orgsSnap.docs[0];
      const orgData = orgDoc.data();
      
      console.log(`🔗 Linking owner to organization: ${orgData.name} (${orgDoc.id})`);
      
      // Update the owner user with organizationId
      await db.collection('users').doc(ownerDoc.id).update({
        organizationId: orgDoc.id,
        updatedAt: new Date()
      });
      
      console.log(`✅ Updated owner ${ownerData.email} with organizationId: ${orgDoc.id}`);
      fixedCount++;
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} owner organization links!`);
    
    // Verify the fixes
    await verifyOwnerLinks();
    
  } catch (error) {
    console.error('❌ Error fixing owner organization links:', error);
    process.exit(1);
  }
}

async function verifyOwnerLinks() {
  console.log('\n📋 Verifying owner organization links...');
  
  const ownersSnap = await db.collection('users')
    .where('role', '==', 'OWNER')
    .get();
  
  let linkedCount = 0;
  let unlinkedCount = 0;
  
  for (const ownerDoc of ownersSnap.docs) {
    const ownerData = ownerDoc.data();
    
    if (ownerData.organizationId) {
      // Verify the organization exists
      const orgSnap = await db.collection('organizations').doc(ownerData.organizationId).get();
      if (orgSnap.exists) {
        const orgData = orgSnap.data();
        console.log(`✅ ${ownerData.email} → ${orgData.name} (${ownerData.organizationId})`);
        linkedCount++;
      } else {
        console.log(`❌ ${ownerData.email} → Invalid organizationId: ${ownerData.organizationId}`);
        unlinkedCount++;
      }
    } else {
      console.log(`⚠️ ${ownerData.email} → No organizationId`);
      unlinkedCount++;
    }
  }
  
  console.log(`\n📊 Summary: ${linkedCount} linked, ${unlinkedCount} unlinked`);
}

// Run the fix
fixOwnerOrganizationLinks().catch(console.error);
