#!/usr/bin/env node

/**
 * Fix Organization Owners Script
 * 
 * This script will set the proper ownerUserId for organizations
 * based on remaining admin users.
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

async function fixOrganizationOwners() {
  console.log('🔧 [Fix] Setting organization owners...');
  
  try {
    // Get all organizations
    const orgsSnapshot = await db.collection('organizations').get();
    
    // Get remaining users (should be owners/admins)
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`📋 Found ${orgsSnapshot.docs.length} organizations and ${users.length} users`);
    
    const batch = db.batch();
    let updatedCount = 0;
    
    orgsSnapshot.forEach(orgDoc => {
      const orgData = orgDoc.data();
      const orgId = orgDoc.id;
      
      console.log(`\n🏢 Processing organization: ${orgData.name || orgId}`);
      
      // Find a suitable owner for this organization
      let owner = null;
      
      // First, try to find a user with matching organization context
      if (orgId === 'enterprise-org-001') {
        owner = users.find(u => u.email && u.email.includes('enterprise') && u.email.includes('admin'));
      } else if (orgId === 'pro-org-001') {
        owner = users.find(u => u.email && u.email.includes('pro') && u.email.includes('admin'));
      } else if (orgId === 'basic-org-001') {
        owner = users.find(u => u.email && u.email.includes('basic') && u.email.includes('admin'));
      }
      
      // If no specific match, use the first admin user
      if (!owner) {
        owner = users.find(u => u.role === 'ADMIN' || u.role === 'OWNER' || u.role === 'SUPERADMIN');
      }
      
      // If still no owner, use the first remaining user
      if (!owner && users.length > 0) {
        owner = users[0];
      }
      
      if (owner) {
        console.log(`   ✅ Setting owner: ${owner.email} (${owner.id})`);
        batch.update(orgDoc.ref, {
          ownerUserId: owner.id,
          updatedAt: new Date()
        });
        updatedCount++;
      } else {
        console.log(`   ⚠️ No suitable owner found for organization: ${orgData.name || orgId}`);
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      console.log(`\n✅ Updated ${updatedCount} organizations with proper owners`);
    }
    
    // Show final status
    console.log('\n📊 Final organization status:');
    const finalOrgsSnapshot = await db.collection('organizations').get();
    finalOrgsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   🏢 ${data.name || doc.id}: Owner = ${data.ownerUserId || 'NOT SET'}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing organization owners:', error);
    throw error;
  }
}

// Run the fix
fixOrganizationOwners()
  .then(() => {
    console.log('\n🎉 Organization owners fixed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to fix organization owners:', error);
    process.exit(1);
  });
