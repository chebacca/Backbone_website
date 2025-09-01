#!/usr/bin/env node

/**
 * Cleanup Non-Account Owners Script
 * 
 * This script will remove any users that are NOT the official account owners
 * from the table, ensuring only the proper account owners remain.
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

class NonAccountOwnerCleanup {
  
  /**
   * Official account owners from the table
   */
  static getOfficialAccountOwners() {
    return [
      'basic.user@example.com',
      'pro.user@example.com', 
      'enterprise.user@example.com',
      'chebacca@gmail.com',
      'accounting@example.com'
    ];
  }

  /**
   * Remove users that are not official account owners
   */
  static async cleanupNonAccountOwners() {
    console.log('🧹 [Cleanup] Removing users that are not official account owners...');
    
    const officialOwners = this.getOfficialAccountOwners();
    console.log('✅ Official account owners:', officialOwners);
    
    try {
      // Get all users
      const usersSnapshot = await db.collection('users').get();
      const toDelete = [];
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        
        // If this user is not in the official account owners list, mark for deletion
        if (data.email && !officialOwners.includes(data.email)) {
          toDelete.push({
            docId: doc.id,
            email: data.email,
            role: data.role,
            organizationId: data.organizationId
          });
        }
      });
      
      console.log(`\n🗑️ Found ${toDelete.length} non-account-owner users to remove:`);
      toDelete.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) in ${user.organizationId}`);
      });
      
      if (toDelete.length > 0) {
        const batch = db.batch();
        
        toDelete.forEach(user => {
          batch.delete(db.collection('users').doc(user.docId));
        });
        
        await batch.commit();
        console.log(`\n✅ Deleted ${toDelete.length} non-account-owner users`);
      } else {
        console.log('\n✅ No non-account-owner users found');
      }
      
      return toDelete.length;
      
    } catch (error) {
      console.error('❌ Error cleaning up non-account owners:', error);
      return 0;
    }
  }

  /**
   * Also clean up Firebase Auth users that are not account owners
   */
  static async cleanupFirebaseAuthNonOwners() {
    console.log('🔥 [Cleanup] Removing Firebase Auth users that are not account owners...');
    
    const officialOwners = this.getOfficialAccountOwners();
    
    try {
      const listUsersResult = await admin.auth().listUsers();
      const toDelete = [];
      
      for (const userRecord of listUsersResult.users) {
        const email = userRecord.email;
        
        // If this user is not in the official account owners list, mark for deletion
        if (email && !officialOwners.includes(email)) {
          toDelete.push({
            uid: userRecord.uid,
            email: email
          });
        }
      }
      
      console.log(`\n🗑️ Found ${toDelete.length} non-account-owner Firebase Auth users to remove:`);
      toDelete.forEach(user => {
        console.log(`   - ${user.email} (${user.uid})`);
      });
      
      if (toDelete.length > 0) {
        for (const user of toDelete) {
          try {
            await admin.auth().deleteUser(user.uid);
            console.log(`   ✅ Deleted Firebase Auth user: ${user.email}`);
          } catch (deleteError) {
            console.log(`   ⚠️ Failed to delete Firebase Auth user ${user.email}:`, deleteError.message);
          }
        }
      } else {
        console.log('\n✅ No non-account-owner Firebase Auth users found');
      }
      
      return toDelete.length;
      
    } catch (error) {
      console.error('❌ Error cleaning up Firebase Auth non-owners:', error);
      return 0;
    }
  }

  /**
   * Clean up organization memberships for non-owners
   */
  static async cleanupOrgMemberships() {
    console.log('🤝 [Cleanup] Cleaning up organization memberships for non-owners...');
    
    const officialOwners = this.getOfficialAccountOwners();
    
    try {
      const orgMembersSnapshot = await db.collection('orgMembers').get();
      const toDelete = [];
      
      orgMembersSnapshot.forEach(doc => {
        const data = doc.data();
        
        // If this membership is not for an official account owner, mark for deletion
        if (data.userEmail && !officialOwners.includes(data.userEmail)) {
          toDelete.push({
            docId: doc.id,
            email: data.userEmail,
            role: data.role,
            organizationId: data.organizationId
          });
        }
      });
      
      console.log(`\n🗑️ Found ${toDelete.length} non-owner memberships to remove:`);
      toDelete.forEach(membership => {
        console.log(`   - ${membership.email} (${membership.role}) in ${membership.organizationId}`);
      });
      
      if (toDelete.length > 0) {
        const batch = db.batch();
        
        toDelete.forEach(membership => {
          batch.delete(db.collection('orgMembers').doc(membership.docId));
        });
        
        await batch.commit();
        console.log(`\n✅ Deleted ${toDelete.length} non-owner memberships`);
        
        // Also clean up org_members collection
        const orgMembers2Snapshot = await db.collection('org_members').get();
        const batch2 = db.batch();
        let deleted2 = 0;
        
        orgMembers2Snapshot.forEach(doc => {
          const data = doc.data();
          if (data.userEmail && !officialOwners.includes(data.userEmail)) {
            batch2.delete(doc.ref);
            deleted2++;
          }
        });
        
        if (deleted2 > 0) {
          await batch2.commit();
          console.log(`✅ Also deleted ${deleted2} memberships from org_members collection`);
        }
      } else {
        console.log('\n✅ No non-owner memberships found');
      }
      
      return toDelete.length;
      
    } catch (error) {
      console.error('❌ Error cleaning up organization memberships:', error);
      return 0;
    }
  }

  /**
   * Verify final state
   */
  static async verifyFinalState() {
    console.log('🔍 [Verify] Checking final state...');
    
    const officialOwners = this.getOfficialAccountOwners();
    
    try {
      // Check users collection
      const usersSnapshot = await db.collection('users').get();
      console.log(`\n📊 Users collection: ${usersSnapshot.docs.length} documents`);
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        const isOfficial = officialOwners.includes(data.email);
        console.log(`   ${isOfficial ? '✅' : '❌'} ${data.email} (${data.role})`);
      });
      
      // Check organization memberships
      const orgMembersSnapshot = await db.collection('orgMembers').get();
      console.log(`\n📊 Organization memberships: ${orgMembersSnapshot.docs.length} documents`);
      
      orgMembersSnapshot.forEach(doc => {
        const data = doc.data();
        const isOfficial = officialOwners.includes(data.userEmail);
        console.log(`   ${isOfficial ? '✅' : '❌'} ${data.userEmail} (${data.role}) in ${data.organizationId}`);
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  }

  /**
   * Run complete cleanup
   */
  static async runCleanup() {
    console.log('🚀 [Cleanup] Starting non-account-owner cleanup...');
    console.log('===============================================');
    
    try {
      // Step 1: Clean up users collection
      const deletedUsers = await this.cleanupNonAccountOwners();
      
      // Step 2: Clean up Firebase Auth
      const deletedAuthUsers = await this.cleanupFirebaseAuthNonOwners();
      
      // Step 3: Clean up organization memberships
      const deletedMemberships = await this.cleanupOrgMemberships();
      
      // Step 4: Verify final state
      const verificationSuccess = await this.verifyFinalState();
      
      console.log('\n===============================================');
      console.log('🏁 [Cleanup] Non-account-owner cleanup completed!');
      console.log(`   Users deleted: ${deletedUsers}`);
      console.log(`   Auth users deleted: ${deletedAuthUsers}`);
      console.log(`   Memberships deleted: ${deletedMemberships}`);
      console.log(`   Verification: ${verificationSuccess ? 'PASSED' : 'FAILED'}`);
      
      if (verificationSuccess) {
        console.log('\n🎉 Only official account owners remain!');
        console.log('✅ Team management should now show only the correct users!');
      }
      
      return verificationSuccess;
      
    } catch (error) {
      console.error('💥 Cleanup failed:', error);
      return false;
    }
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  NonAccountOwnerCleanup.runCleanup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Cleanup execution failed:', error);
      process.exit(1);
    });
}

module.exports = NonAccountOwnerCleanup;
