#!/usr/bin/env node

/**
 * License Cleanup Script - Keep One Per Account Owner
 * 
 * This script will:
 * 1. Remove ALL existing licenses
 * 2. Create exactly 1 license per account owner based on their tier
 * 3. Assign that license to the account owner
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

class LicenseCleanupService {
  
  /**
   * Get account owners with their organization details
   */
  static async getAccountOwners() {
    console.log('👥 [Cleanup] Getting account owners...');
    
    try {
      const usersSnapshot = await db.collection('users').get();
      const orgsSnapshot = await db.collection('organizations').get();
      
      const organizations = {};
      orgsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && data.name !== 'undefined') {
          organizations[doc.id] = data;
        }
      });
      
      const accountOwners = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const org = organizations[userData.organizationId];
        
        if (userData.email && org) {
          accountOwners.push({
            userId: doc.id,
            email: userData.email,
            name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            role: userData.role,
            organizationId: userData.organizationId,
            organizationName: org.name,
            tier: org.tier,
            firebaseUid: userData.firebaseUid
          });
        }
      });
      
      console.log(`   ✅ Found ${accountOwners.length} account owners`);
      accountOwners.forEach(owner => {
        console.log(`      ${owner.email} (${owner.tier}) - ${owner.organizationName}`);
      });
      
      return accountOwners;
      
    } catch (error) {
      console.error('   ❌ Error getting account owners:', error);
      return [];
    }
  }

  /**
   * Remove all existing licenses
   */
  static async removeAllLicenses() {
    console.log('🗑️ [Cleanup] Removing all existing licenses...');
    
    try {
      const licensesSnapshot = await db.collection('licenses').get();
      
      if (licensesSnapshot.empty) {
        console.log('   ℹ️ No licenses to remove');
        return 0;
      }
      
      console.log(`   🔍 Found ${licensesSnapshot.docs.length} licenses to remove`);
      
      // Delete in batches of 500 (Firestore limit)
      const batchSize = 500;
      let deletedCount = 0;
      
      for (let i = 0; i < licensesSnapshot.docs.length; i += batchSize) {
        const batch = db.batch();
        const batchDocs = licensesSnapshot.docs.slice(i, i + batchSize);
        
        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        deletedCount += batchDocs.length;
        console.log(`   🗑️ Deleted batch: ${deletedCount}/${licensesSnapshot.docs.length} licenses`);
      }
      
      console.log(`   ✅ Removed ${deletedCount} licenses`);
      return deletedCount;
      
    } catch (error) {
      console.error('   ❌ Error removing licenses:', error);
      return 0;
    }
  }

  /**
   * Create one license per account owner
   */
  static async createOwnerLicenses(accountOwners) {
    console.log('🔑 [Cleanup] Creating one license per account owner...');
    
    try {
      const batch = db.batch();
      let createdCount = 0;
      
      for (const owner of accountOwners) {
        const licenseRef = db.collection('licenses').doc();
        
        const licenseDoc = {
          id: licenseRef.id,
          organizationId: owner.organizationId,
          type: owner.tier,
          status: 'ACTIVE',
          assignedToUserId: owner.firebaseUid || owner.userId,
          assignedToEmail: owner.email,
          assignedToName: owner.name,
          features: this.getTierFeatures(owner.tier),
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedAt: new Date(),
          expiresAt: null, // No expiration
          notes: `Account owner license for ${owner.organizationName}`
        };
        
        batch.set(licenseRef, licenseDoc);
        createdCount++;
        
        console.log(`   ✅ Creating ${owner.tier} license for ${owner.email}`);
      }
      
      await batch.commit();
      console.log(`   ✅ Created ${createdCount} owner licenses`);
      
      return createdCount;
      
    } catch (error) {
      console.error('   ❌ Error creating owner licenses:', error);
      return 0;
    }
  }

  /**
   * Get tier-specific features based on MPC library specifications
   */
  static getTierFeatures(tier) {
    const features = {
      BASIC: [
        'basic',
        'projects.create',
        'files.basic',
        'basic_dashboard',
        'basic_projects',
        'basic_reports'
      ],
      PRO: [
        'basic',
        'pro',
        'projects.create',
        'projects.collaborate',
        'files.advanced',
        'reports.basic',
        'basic_dashboard',
        'basic_projects',
        'basic_reports',
        'advanced_analytics',
        'team_collaboration',
        'api_access'
      ],
      ENTERPRISE: [
        'basic',
        'pro',
        'enterprise',
        'projects.create',
        'projects.collaborate',
        'files.advanced',
        'reports.advanced',
        'integrations.custom',
        'security.enhanced',
        'basic_dashboard',
        'basic_projects',
        'basic_reports',
        'advanced_analytics',
        'team_collaboration',
        'api_access',
        'custom_integrations',
        'priority_support',
        'advanced_security'
      ]
    };
    
    return features[tier] || features.BASIC;
  }

  /**
   * Verify the cleanup results
   */
  static async verifyCleanup() {
    console.log('🔍 [Verify] Checking cleanup results...');
    
    try {
      const licensesSnapshot = await db.collection('licenses').get();
      const accountOwners = await this.getAccountOwners();
      
      console.log(`\n📊 Final License Status:`);
      console.log(`   Total licenses: ${licensesSnapshot.docs.length}`);
      console.log(`   Account owners: ${accountOwners.length}`);
      
      if (licensesSnapshot.docs.length !== accountOwners.length) {
        console.log(`   ⚠️ Mismatch: Expected ${accountOwners.length} licenses, found ${licensesSnapshot.docs.length}`);
      } else {
        console.log(`   ✅ Perfect match: 1 license per account owner`);
      }
      
      console.log(`\n🔑 License Details:`);
      licensesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   ${data.type} license: ${data.assignedToEmail} (${data.status})`);
      });
      
      // Check for any unassigned licenses
      const unassignedLicenses = licensesSnapshot.docs.filter(doc => {
        const data = doc.data();
        return !data.assignedToEmail && !data.assignedToUserId;
      });
      
      if (unassignedLicenses.length > 0) {
        console.log(`   ⚠️ Found ${unassignedLicenses.length} unassigned licenses`);
      } else {
        console.log(`   ✅ All licenses are properly assigned to account owners`);
      }
      
      return licensesSnapshot.docs.length === accountOwners.length && unassignedLicenses.length === 0;
      
    } catch (error) {
      console.error('   ❌ Verification failed:', error);
      return false;
    }
  }

  /**
   * Run complete license cleanup
   */
  static async runCleanup() {
    console.log('🚀 [Cleanup] Starting license cleanup - keep one per owner...');
    console.log('==========================================================');
    
    try {
      // Step 1: Get account owners
      const accountOwners = await this.getAccountOwners();
      
      if (accountOwners.length === 0) {
        console.log('❌ No account owners found. Cannot proceed.');
        return false;
      }
      
      // Step 2: Remove all existing licenses
      const deletedCount = await this.removeAllLicenses();
      
      // Step 3: Create one license per account owner
      const createdCount = await this.createOwnerLicenses(accountOwners);
      
      // Step 4: Verify results
      const verificationSuccess = await this.verifyCleanup();
      
      console.log('\n==========================================================');
      console.log('🏁 [Cleanup] License cleanup completed!');
      console.log(`   Licenses deleted: ${deletedCount}`);
      console.log(`   Owner licenses created: ${createdCount}`);
      console.log(`   Verification: ${verificationSuccess ? 'PASSED' : 'FAILED'}`);
      
      if (verificationSuccess) {
        console.log('\n🎉 License cleanup successful!');
        console.log('✅ Each account owner now has exactly 1 license');
        console.log('✅ All licenses are properly assigned');
        console.log('✅ Ready for you to allocate additional licenses as needed');
      } else {
        console.log('\n⚠️ Cleanup completed but verification had issues');
      }
      
      return verificationSuccess;
      
    } catch (error) {
      console.error('💥 License cleanup failed:', error);
      return false;
    }
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  LicenseCleanupService.runCleanup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Cleanup execution failed:', error);
      process.exit(1);
    });
}

module.exports = LicenseCleanupService;
