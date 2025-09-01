#!/usr/bin/env node

/**
 * Final Cleanup and Verification Script
 * 
 * This script will:
 * 1. Remove duplicate user entries
 * 2. Clean up old/invalid data
 * 3. Ensure clean account owner setup
 * 4. Provide final verification
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

class FinalCleanupVerifier {
  
  /**
   * Remove duplicate and invalid user entries
   */
  static async cleanupUsers() {
    console.log('🧹 [Cleanup] Removing duplicate and invalid users...');
    
    try {
      const usersSnapshot = await db.collection('users').get();
      const validUsers = new Map();
      const toDelete = [];
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Skip invalid users
        if (!data.email || !data.firebaseUid || data.email === 'undefined') {
          toDelete.push(doc.id);
          console.log(`   🗑️ Marking invalid user for deletion: ${doc.id}`);
          return;
        }
        
        // Keep only one user per email (prefer the one with Firebase UID as doc ID)
        const existingUser = validUsers.get(data.email);
        if (existingUser) {
          // If current doc ID is the Firebase UID, keep this one
          if (doc.id === data.firebaseUid) {
            toDelete.push(existingUser.docId);
            validUsers.set(data.email, { docId: doc.id, data });
            console.log(`   ✅ Keeping user with Firebase UID as doc ID: ${data.email}`);
          } else {
            // Keep the existing one, delete this duplicate
            toDelete.push(doc.id);
            console.log(`   🗑️ Marking duplicate user for deletion: ${doc.id} (${data.email})`);
          }
        } else {
          validUsers.set(data.email, { docId: doc.id, data });
        }
      });
      
      // Delete invalid and duplicate users
      const batch = db.batch();
      toDelete.forEach(docId => {
        batch.delete(db.collection('users').doc(docId));
      });
      
      if (toDelete.length > 0) {
        await batch.commit();
        console.log(`   ✅ Deleted ${toDelete.length} invalid/duplicate users`);
      } else {
        console.log(`   ℹ️ No users needed cleanup`);
      }
      
      return validUsers.size;
      
    } catch (error) {
      console.error('   ❌ Error cleaning up users:', error);
      return 0;
    }
  }

  /**
   * Clean up invalid licenses
   */
  static async cleanupLicenses() {
    console.log('🔑 [Cleanup] Cleaning up invalid licenses...');
    
    try {
      const licensesSnapshot = await db.collection('licenses').get();
      const toDelete = [];
      
      licensesSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Remove licenses without organization ID or with undefined org
        if (!data.organizationId || data.organizationId === 'undefined') {
          toDelete.push(doc.id);
        }
      });
      
      if (toDelete.length > 0) {
        const batch = db.batch();
        toDelete.forEach(docId => {
          batch.delete(db.collection('licenses').doc(docId));
        });
        
        await batch.commit();
        console.log(`   ✅ Deleted ${toDelete.length} invalid licenses`);
      } else {
        console.log(`   ℹ️ No licenses needed cleanup`);
      }
      
      return toDelete.length;
      
    } catch (error) {
      console.error('   ❌ Error cleaning up licenses:', error);
      return 0;
    }
  }

  /**
   * Verify final setup
   */
  static async verifyFinalSetup() {
    console.log('🔍 [Verify] Final setup verification...');
    
    try {
      // Get all data
      const orgsSnapshot = await db.collection('organizations').get();
      const usersSnapshot = await db.collection('users').get();
      const licensesSnapshot = await db.collection('licenses').get();
      const membersSnapshot = await db.collection('orgMembers').get();
      
      const organizations = [];
      const users = [];
      const licenses = [];
      const memberships = [];
      
      orgsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && data.name !== 'undefined') {
          organizations.push({ id: doc.id, ...data });
        }
      });
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email && data.email !== 'undefined') {
          users.push({ id: doc.id, ...data });
        }
      });
      
      licensesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.organizationId && data.organizationId !== 'undefined') {
          licenses.push({ id: doc.id, ...data });
        }
      });
      
      membersSnapshot.forEach(doc => {
        memberships.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('\n📊 Final Setup Summary:');
      console.log('=======================');
      console.log(`   Organizations: ${organizations.length}`);
      console.log(`   Users: ${users.length}`);
      console.log(`   Licenses: ${licenses.length}`);
      console.log(`   Memberships: ${memberships.length}`);
      
      console.log('\n🏢 Account Owners by Organization:');
      console.log('==================================');
      
      organizations.forEach(org => {
        const orgUsers = users.filter(u => u.organizationId === org.id);
        const orgLicenses = licenses.filter(l => l.organizationId === org.id);
        const orgMembers = memberships.filter(m => m.organizationId === org.id);
        
        console.log(`\n📋 ${org.name}`);
        console.log(`   ID: ${org.id}`);
        console.log(`   Tier: ${org.tier}`);
        console.log(`   Owner: ${org.ownerEmail}`);
        console.log(`   Users: ${orgUsers.length}`);
        console.log(`   Licenses: ${orgLicenses.length} (${orgLicenses[0]?.type || 'Unknown'} tier)`);
        console.log(`   Memberships: ${orgMembers.length}`);
        
        // List users
        orgUsers.forEach(user => {
          console.log(`     👤 ${user.email} (${user.role})`);
        });
      });
      
      // Check for any issues
      const issues = [];
      
      // Check for organizations without owners
      organizations.forEach(org => {
        if (!org.ownerEmail || !org.ownerUserId) {
          issues.push(`Organization ${org.name} missing owner information`);
        }
      });
      
      // Check for users without Firebase UIDs
      users.forEach(user => {
        if (!user.firebaseUid) {
          issues.push(`User ${user.email} missing Firebase UID`);
        }
      });
      
      // Check for organizations without licenses
      organizations.forEach(org => {
        const orgLicenses = licenses.filter(l => l.organizationId === org.id);
        if (orgLicenses.length === 0) {
          issues.push(`Organization ${org.name} has no licenses`);
        }
      });
      
      if (issues.length > 0) {
        console.log('\n⚠️ Issues Found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        return false;
      } else {
        console.log('\n✅ All account owners are properly configured!');
        console.log('\n🎉 Setup is complete and ready for team member management!');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  }

  /**
   * Run complete final cleanup and verification
   */
  static async runFinalCleanup() {
    console.log('🚀 [Final] Starting final cleanup and verification...');
    console.log('===================================================');
    
    try {
      // Step 1: Clean up users
      const validUserCount = await this.cleanupUsers();
      
      // Step 2: Clean up licenses
      const deletedLicenseCount = await this.cleanupLicenses();
      
      // Step 3: Final verification
      const verificationSuccess = await this.verifyFinalSetup();
      
      console.log('\n===================================================');
      console.log('🏁 [Final] Cleanup and verification completed!');
      console.log(`   Valid users: ${validUserCount}`);
      console.log(`   Cleaned up licenses: ${deletedLicenseCount}`);
      console.log(`   Verification: ${verificationSuccess ? 'PASSED' : 'FAILED'}`);
      
      if (verificationSuccess) {
        console.log('\n🎉 Your account owners are perfectly set up!');
        console.log('✅ Ready to test team member management functionality!');
      }
      
      return verificationSuccess;
      
    } catch (error) {
      console.error('💥 Final cleanup failed:', error);
      return false;
    }
  }
}

// Run final cleanup if this script is executed directly
if (require.main === module) {
  FinalCleanupVerifier.runFinalCleanup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Final cleanup execution failed:', error);
      process.exit(1);
    });
}

module.exports = FinalCleanupVerifier;
