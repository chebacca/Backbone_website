#!/usr/bin/env node

/**
 * Fix License-User Linkage Script
 * 
 * This script will:
 * 1. Find all assigned licenses
 * 2. Update the corresponding user documents to include licenseId
 * 3. Ensure bidirectional relationship between users and licenses
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

class LicenseUserLinkageFixer {
  
  /**
   * Get all assigned licenses
   */
  static async getAssignedLicenses() {
    console.log('🔍 [Fix] Getting all assigned licenses...');
    
    try {
      const licensesSnapshot = await db.collection('licenses')
        .where('status', '==', 'ACTIVE')
        .get();
        
      const assignedLicenses = [];
      
      licensesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.assignedToUserId || data.assignedToEmail) {
          assignedLicenses.push({
            licenseId: doc.id,
            type: data.type,
            organizationId: data.organizationId,
            assignedToUserId: data.assignedToUserId,
            assignedToEmail: data.assignedToEmail,
            assignedToName: data.assignedToName,
            status: data.status
          });
        }
      });
      
      console.log(`   ✅ Found ${assignedLicenses.length} assigned licenses`);
      assignedLicenses.forEach(license => {
        console.log(`      ${license.type} license → ${license.assignedToEmail} (${license.assignedToUserId})`);
      });
      
      return assignedLicenses;
      
    } catch (error) {
      console.error('   ❌ Error getting assigned licenses:', error);
      return [];
    }
  }

  /**
   * Update user documents with license IDs
   */
  static async updateUserLicenseLinks(assignedLicenses) {
    console.log('🔗 [Fix] Updating user documents with license IDs...');
    
    try {
      const batch = db.batch();
      let updatedCount = 0;
      
      for (const license of assignedLicenses) {
        if (!license.assignedToUserId) {
          console.log(`   ⏭️ Skipping license ${license.licenseId} - no user ID`);
          continue;
        }
        
        // Find the user document
        const userDoc = await db.collection('users').doc(license.assignedToUserId).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          
          // Update user with license information
          batch.update(userDoc.ref, {
            licenseId: license.licenseId,
            licenseType: license.type,
            licenseStatus: license.status,
            updatedAt: new Date()
          });
          
          console.log(`   ✅ Linking ${userData.email} → License ${license.licenseId} (${license.type})`);
          updatedCount++;
        } else {
          console.log(`   ⚠️ User document not found for ID: ${license.assignedToUserId}`);
          
          // Try to find user by email
          const userByEmailQuery = await db.collection('users')
            .where('email', '==', license.assignedToEmail)
            .limit(1)
            .get();
            
          if (!userByEmailQuery.empty) {
            const userDocByEmail = userByEmailQuery.docs[0];
            const userData = userDocByEmail.data();
            
            batch.update(userDocByEmail.ref, {
              licenseId: license.licenseId,
              licenseType: license.type,
              licenseStatus: license.status,
              updatedAt: new Date()
            });
            
            console.log(`   ✅ Found by email: ${userData.email} → License ${license.licenseId} (${license.type})`);
            updatedCount++;
          } else {
            console.log(`   ❌ Could not find user for license ${license.licenseId}`);
          }
        }
      }
      
      if (updatedCount > 0) {
        await batch.commit();
        console.log(`   ✅ Updated ${updatedCount} user documents with license links`);
      } else {
        console.log(`   ℹ️ No user documents needed updating`);
      }
      
      return updatedCount;
      
    } catch (error) {
      console.error('   ❌ Error updating user license links:', error);
      return 0;
    }
  }

  /**
   * Verify the linkage is working
   */
  static async verifyLinkage() {
    console.log('🔍 [Verify] Checking license-user linkage...');
    
    try {
      // Get all users with licenses
      const usersSnapshot = await db.collection('users').get();
      const licensesSnapshot = await db.collection('licenses').get();
      
      console.log(`\n📊 Linkage Status:`);
      
      let usersWithLicenses = 0;
      let licensesAssigned = 0;
      
      // Check users → licenses
      console.log(`\n👥 Users and their licenses:`);
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          const hasLicense = data.licenseId ? '✅' : '❌';
          console.log(`   ${hasLicense} ${data.email}: ${data.licenseId || 'No license'} (${data.licenseType || 'N/A'})`);
          if (data.licenseId) usersWithLicenses++;
        }
      });
      
      // Check licenses → users
      console.log(`\n🔑 Licenses and their assignments:`);
      licensesSnapshot.forEach(doc => {
        const data = doc.data();
        const isAssigned = data.assignedToUserId || data.assignedToEmail;
        const status = isAssigned ? '✅ Assigned' : '❌ Unassigned';
        console.log(`   ${status}: ${data.type} license → ${data.assignedToEmail || 'Unassigned'}`);
        if (isAssigned) licensesAssigned++;
      });
      
      console.log(`\n📈 Summary:`);
      console.log(`   Users with licenses: ${usersWithLicenses}`);
      console.log(`   Licenses assigned: ${licensesAssigned}`);
      console.log(`   Bidirectional linkage: ${usersWithLicenses === licensesAssigned ? '✅ Working' : '❌ Broken'}`);
      
      return usersWithLicenses === licensesAssigned;
      
    } catch (error) {
      console.error('   ❌ Verification failed:', error);
      return false;
    }
  }

  /**
   * Run complete linkage fix
   */
  static async runFix() {
    console.log('🚀 [Fix] Starting license-user linkage fix...');
    console.log('=============================================');
    
    try {
      // Step 1: Get assigned licenses
      const assignedLicenses = await this.getAssignedLicenses();
      
      if (assignedLicenses.length === 0) {
        console.log('ℹ️ No assigned licenses found. Nothing to fix.');
        return true;
      }
      
      // Step 2: Update user documents
      const updatedCount = await this.updateUserLicenseLinks(assignedLicenses);
      
      // Step 3: Verify linkage
      const verificationSuccess = await this.verifyLinkage();
      
      console.log('\n=============================================');
      console.log('🏁 [Fix] License-user linkage fix completed!');
      console.log(`   Assigned licenses found: ${assignedLicenses.length}`);
      console.log(`   User documents updated: ${updatedCount}`);
      console.log(`   Verification: ${verificationSuccess ? 'PASSED' : 'FAILED'}`);
      
      if (verificationSuccess) {
        console.log('\n🎉 License-user linkage is now working!');
        console.log('✅ Users know which license they have');
        console.log('✅ Licenses know which user they\'re assigned to');
        console.log('✅ Team management and license pages should now show correct data');
      } else {
        console.log('\n⚠️ Linkage fix completed but verification had issues');
      }
      
      return verificationSuccess;
      
    } catch (error) {
      console.error('💥 License-user linkage fix failed:', error);
      return false;
    }
  }
}

// Run fix if this script is executed directly
if (require.main === module) {
  LicenseUserLinkageFixer.runFix()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Fix execution failed:', error);
      process.exit(1);
    });
}

module.exports = LicenseUserLinkageFixer;
