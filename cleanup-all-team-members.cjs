#!/usr/bin/env node

/**
 * Complete Team Member and Organization Member Cleanup Script
 * 
 * This script will:
 * 1. Remove all team members from all collections
 * 2. Remove all organization members
 * 3. Restore all licenses to organization pools
 * 4. Clean up project assignments
 * 5. Reset organization to clean state
 * 
 * Usage: node cleanup-all-team-members.cjs
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

class TeamMemberCleanup {
  
  /**
   * Get all collections that might contain team member data
   */
  static getTeamMemberCollections() {
    return [
      'teamMembers',
      'team_members', 
      'orgMembers',
      'org_members',
      'projectTeamMembers',
      'project_team_members',
      'projectParticipants',
      'project_participants',
      'projectAssignments',
      'project_assignments',
      'userProjects',
      'user_projects'
    ];
  }

  /**
   * Get all organizations
   */
  static async getAllOrganizations() {
    console.log('📋 [Cleanup] Getting all organizations...');
    
    const orgsSnapshot = await db.collection('organizations').get();
    const organizations = [];
    
    orgsSnapshot.forEach(doc => {
      organizations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ [Cleanup] Found ${organizations.length} organizations`);
    return organizations;
  }

  /**
   * Remove all documents from a collection
   */
  static async clearCollection(collectionName) {
    console.log(`🗑️ [Cleanup] Clearing collection: ${collectionName}`);
    
    try {
      const snapshot = await db.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`   ℹ️ Collection '${collectionName}' is already empty`);
        return 0;
      }
      
      const batch = db.batch();
      let count = 0;
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });
      
      await batch.commit();
      console.log(`   ✅ Removed ${count} documents from '${collectionName}'`);
      return count;
      
    } catch (error) {
      console.log(`   ⚠️ Collection '${collectionName}' may not exist or is not accessible:`, error.message);
      return 0;
    }
  }

  /**
   * Restore all licenses to organization pools
   */
  static async restoreAllLicenses() {
    console.log('🔑 [Cleanup] Restoring all licenses to organization pools...');
    
    try {
      const licensesSnapshot = await db.collection('licenses').get();
      const batch = db.batch();
      let restoredCount = 0;
      
      licensesSnapshot.forEach(doc => {
        const licenseData = doc.data();
        
        // If license is assigned to someone, restore it
        if (licenseData.assignedToUserId || licenseData.assignedToEmail || licenseData.assignedTo) {
          batch.update(doc.ref, {
            assignedToUserId: admin.firestore.FieldValue.delete(),
            assignedToEmail: admin.firestore.FieldValue.delete(),
            assignedTo: admin.firestore.FieldValue.delete(),
            status: 'ACTIVE',
            updatedAt: new Date()
          });
          restoredCount++;
        }
      });
      
      if (restoredCount > 0) {
        await batch.commit();
        console.log(`   ✅ Restored ${restoredCount} licenses to organization pools`);
      } else {
        console.log(`   ℹ️ No licenses needed restoration`);
      }
      
      return restoredCount;
      
    } catch (error) {
      console.error('   ❌ Error restoring licenses:', error);
      return 0;
    }
  }

  /**
   * Clean up Firebase Auth users (team members only, not organization owners)
   */
  static async cleanupFirebaseAuthUsers() {
    console.log('🔥 [Cleanup] Cleaning up Firebase Auth users...');
    
    try {
      // Get all users from Firebase Auth
      const listUsersResult = await admin.auth().listUsers();
      let deletedCount = 0;
      
      for (const userRecord of listUsersResult.users) {
        const email = userRecord.email;
        
        // Skip if no email or if it looks like an organization owner
        if (!email || email.includes('owner') || email.includes('admin')) {
          console.log(`   ⏭️ Skipping user: ${email} (appears to be owner/admin)`);
          continue;
        }
        
        // Check if this user exists in the users collection
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        const userByEmail = await db.collection('users').where('email', '==', email).limit(1).get();
        
        let shouldDelete = false;
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          // Delete if user role suggests they're a team member
          if (userData.role && (userData.role.includes('TEAM') || userData.role.includes('USER'))) {
            shouldDelete = true;
          }
        } else if (!userByEmail.empty) {
          const userData = userByEmail.docs[0].data();
          if (userData.role && (userData.role.includes('TEAM') || userData.role.includes('USER'))) {
            shouldDelete = true;
          }
        } else {
          // User exists in Auth but not in Firestore - likely a team member
          shouldDelete = true;
        }
        
        if (shouldDelete) {
          try {
            await admin.auth().deleteUser(userRecord.uid);
            console.log(`   ✅ Deleted Firebase Auth user: ${email}`);
            deletedCount++;
          } catch (deleteError) {
            console.log(`   ⚠️ Failed to delete Firebase Auth user ${email}:`, deleteError.message);
          }
        } else {
          console.log(`   ⏭️ Keeping user: ${email} (appears to be organization owner)`);
        }
      }
      
      console.log(`   ✅ Deleted ${deletedCount} Firebase Auth users`);
      return deletedCount;
      
    } catch (error) {
      console.error('   ❌ Error cleaning up Firebase Auth users:', error);
      return 0;
    }
  }

  /**
   * Clean up user documents that are team members
   */
  static async cleanupUserDocuments() {
    console.log('👥 [Cleanup] Cleaning up user documents (team members only)...');
    
    try {
      const usersSnapshot = await db.collection('users').get();
      const batch = db.batch();
      let deletedCount = 0;
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const email = userData.email || '';
        
        // Skip organization owners/admins
        if (email.includes('owner') || email.includes('admin') || 
            userData.role === 'ADMIN' || userData.role === 'OWNER' || userData.role === 'SUPERADMIN') {
          console.log(`   ⏭️ Keeping user: ${email} (owner/admin)`);
          return;
        }
        
        // Delete team members and regular users
        if (userData.role && (userData.role.includes('TEAM') || userData.role.includes('USER') || userData.role.includes('ENTERPRISE'))) {
          batch.delete(doc.ref);
          deletedCount++;
          console.log(`   🗑️ Marking for deletion: ${email} (${userData.role})`);
        }
      });
      
      if (deletedCount > 0) {
        await batch.commit();
        console.log(`   ✅ Deleted ${deletedCount} user documents`);
      } else {
        console.log(`   ℹ️ No user documents needed deletion`);
      }
      
      return deletedCount;
      
    } catch (error) {
      console.error('   ❌ Error cleaning up user documents:', error);
      return 0;
    }
  }

  /**
   * Perform complete cleanup
   */
  static async performCompleteCleanup() {
    console.log('🚀 [Cleanup] Starting complete team member cleanup...');
    console.log('=====================================');
    
    const results = {
      collectionsCleared: 0,
      documentsRemoved: 0,
      licensesRestored: 0,
      authUsersDeleted: 0,
      userDocsDeleted: 0
    };
    
    try {
      // 1. Clear all team member collections
      console.log('\n📂 Step 1: Clearing team member collections...');
      const collections = this.getTeamMemberCollections();
      
      for (const collectionName of collections) {
        const count = await this.clearCollection(collectionName);
        if (count > 0) {
          results.collectionsCleared++;
          results.documentsRemoved += count;
        }
      }
      
      // 2. Restore all licenses
      console.log('\n🔑 Step 2: Restoring licenses...');
      results.licensesRestored = await this.restoreAllLicenses();
      
      // 3. Clean up user documents
      console.log('\n👥 Step 3: Cleaning up user documents...');
      results.userDocsDeleted = await this.cleanupUserDocuments();
      
      // 4. Clean up Firebase Auth users
      console.log('\n🔥 Step 4: Cleaning up Firebase Auth users...');
      results.authUsersDeleted = await this.cleanupFirebaseAuthUsers();
      
      // 5. Show organizations status
      console.log('\n🏢 Step 5: Organization status...');
      const organizations = await this.getAllOrganizations();
      
      organizations.forEach(org => {
        console.log(`   📋 Organization: ${org.name} (${org.id})`);
        console.log(`      Owner: ${org.ownerUserId}`);
        console.log(`      Tier: ${org.tier || 'Not set'}`);
      });
      
      console.log('\n=====================================');
      console.log('🎉 [Cleanup] Complete cleanup finished!');
      console.log('\n📊 Summary:');
      console.log(`   Collections cleared: ${results.collectionsCleared}`);
      console.log(`   Documents removed: ${results.documentsRemoved}`);
      console.log(`   Licenses restored: ${results.licensesRestored}`);
      console.log(`   User docs deleted: ${results.userDocsDeleted}`);
      console.log(`   Auth users deleted: ${results.authUsersDeleted}`);
      console.log(`   Organizations remaining: ${organizations.length}`);
      
      console.log('\n✅ Your organization is now clean and ready for fresh team member setup!');
      console.log('💡 You can now add team members without any authorization conflicts.');
      
      return results;
      
    } catch (error) {
      console.error('❌ [Cleanup] Fatal error during cleanup:', error);
      throw error;
    }
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  TeamMemberCleanup.performCompleteCleanup()
    .then((results) => {
      console.log('\n🏁 Cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = TeamMemberCleanup;
