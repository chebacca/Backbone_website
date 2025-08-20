#!/usr/bin/env node

/**
 * Organization Members Cleanup Script
 * 
 * This script removes team member entries from the org_members collection
 * while preserving organization owners.
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

async function cleanupOrgMembers() {
  console.log('🚀 Starting org_members cleanup...');
  
  try {
    // Get all org_members
    const orgMembersSnap = await db.collection('org_members').get();
    console.log(`📊 Found ${orgMembersSnap.size} total org_members`);
    
    const teamMemberEntries = [];
    const ownerEntries = [];
    
    // Categorize org members
    orgMembersSnap.forEach(doc => {
      const data = doc.data();
      if (data.role === 'OWNER') {
        ownerEntries.push({ 
          id: doc.id, 
          userId: data.userId, 
          email: data.email, 
          role: data.role,
          orgId: data.orgId 
        });
      } else {
        teamMemberEntries.push({ 
          id: doc.id, 
          userId: data.userId, 
          email: data.email, 
          role: data.role,
          orgId: data.orgId 
        });
      }
    });
    
    console.log(`\n👥 Team member entries to remove: ${teamMemberEntries.length}`);
    teamMemberEntries.forEach(entry => {
      console.log(`  - ${entry.email} (${entry.role}) in org ${entry.orgId}`);
    });
    
    console.log(`\n✅ Owner entries to preserve: ${ownerEntries.length}`);
    ownerEntries.forEach(entry => {
      console.log(`  - ${entry.email} (${entry.role}) in org ${entry.orgId}`);
    });
    
    if (teamMemberEntries.length === 0) {
      console.log('\n✅ No team member org entries found to remove');
      return;
    }
    
    // Delete team member org entries in batches
    console.log(`\n🗑️  Removing ${teamMemberEntries.length} team member org entries...`);
    
    const batchSize = 500;
    let deletedCount = 0;
    
    for (let i = 0; i < teamMemberEntries.length; i += batchSize) {
      const batch = db.batch();
      const batchEntries = teamMemberEntries.slice(i, i + batchSize);
      
      batchEntries.forEach(entry => {
        batch.delete(db.collection('org_members').doc(entry.id));
      });
      
      await batch.commit();
      deletedCount += batchEntries.length;
      console.log(`🗑️  Deleted ${batchEntries.length} org entries (${deletedCount} total)`);
    }
    
    console.log(`\n🎉 Successfully removed all ${deletedCount} team member org entries!`);
    
    // Verify final state
    const finalOrgMembersSnap = await db.collection('org_members').get();
    console.log(`\n📊 Final org_members count: ${finalOrgMembersSnap.size}`);
    
    console.log('\n✅ Remaining org_members:');
    finalOrgMembersSnap.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.email} (${data.role}) in org ${data.orgId}`);
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupOrgMembers().catch(console.error);
