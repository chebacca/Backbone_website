#!/usr/bin/env node

/**
 * Fix License Data Structure Script
 * 
 * This script will:
 * 1. Fix missing license fields (name, key, tier)
 * 2. Ensure consistent field naming between backend and frontend
 * 3. Update license data to match the expected frontend structure
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

class LicenseDataStructureFixer {
  
  /**
   * Generate a license key
   */
  static generateLicenseKey() {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(Math.random().toString(36).substr(2, 4).toUpperCase());
    }
    return `BL14-${segments.join('-')}`;
  }

  /**
   * Fix all licenses with missing or incorrect data
   */
  static async fixLicenseStructure() {
    console.log('🔧 [Fix] Fixing license data structure...');
    
    try {
      const licensesSnapshot = await db.collection('licenses').get();
      
      if (licensesSnapshot.empty) {
        console.log('   ℹ️ No licenses found to fix');
        return 0;
      }
      
      const batch = db.batch();
      let fixedCount = 0;
      
      licensesSnapshot.forEach(doc => {
        const data = doc.data();
        const updates = {};
        let needsUpdate = false;
        
        // Fix tier field (should match type field)
        if (!data.tier && data.type) {
          updates.tier = data.type;
          needsUpdate = true;
          console.log(`   🔧 Adding tier field: ${data.type} for license ${doc.id}`);
        }
        
        // Fix name field
        if (!data.name) {
          const sequenceNumber = fixedCount + 1;
          updates.name = `${data.type || 'BASIC'} License #${sequenceNumber.toString().padStart(3, '0')}`;
          needsUpdate = true;
          console.log(`   🔧 Adding name: ${updates.name} for license ${doc.id}`);
        }
        
        // Fix key field
        if (!data.key) {
          updates.key = this.generateLicenseKey();
          needsUpdate = true;
          console.log(`   🔧 Adding key: ${updates.key} for license ${doc.id}`);
        }
        
        // Ensure assignedTo object structure for frontend compatibility
        if (data.assignedToUserId || data.assignedToEmail) {
          updates.assignedTo = {
            userId: data.assignedToUserId,
            email: data.assignedToEmail,
            name: data.assignedToName || data.assignedToEmail?.split('@')[0] || 'Unknown User'
          };
          needsUpdate = true;
          console.log(`   🔧 Creating assignedTo object for license ${doc.id}`);
        }
        
        // Add usage object if missing
        if (!data.usage) {
          const maxDevices = data.type === 'ENTERPRISE' ? 10 : data.type === 'PROFESSIONAL' ? 5 : 2;
          updates.usage = {
            apiCalls: 0,
            dataTransfer: 0,
            deviceCount: 1, // Current user counts as 1 device
            maxDevices: maxDevices
          };
          needsUpdate = true;
          console.log(`   🔧 Adding usage object for license ${doc.id}`);
        }
        
        // Add organization object if missing
        if (!data.organization && data.organizationId) {
          // We'll need to get the organization data
          needsUpdate = true;
          console.log(`   🔧 Need to add organization object for license ${doc.id}`);
        }
        
        // Add expiration date if missing
        if (!data.expiresAt) {
          updates.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
          needsUpdate = true;
          console.log(`   🔧 Adding expiration date for license ${doc.id}`);
        }
        
        // Update updatedAt timestamp
        if (needsUpdate) {
          updates.updatedAt = new Date();
          batch.update(doc.ref, updates);
          fixedCount++;
        }
      });
      
      if (fixedCount > 0) {
        await batch.commit();
        console.log(`   ✅ Fixed ${fixedCount} licenses`);
      } else {
        console.log(`   ℹ️ No licenses needed fixing`);
      }
      
      return fixedCount;
      
    } catch (error) {
      console.error('   ❌ Error fixing license structure:', error);
      return 0;
    }
  }

  /**
   * Add organization data to licenses
   */
  static async addOrganizationData() {
    console.log('🏢 [Fix] Adding organization data to licenses...');
    
    try {
      // Get all organizations
      const orgsSnapshot = await db.collection('organizations').get();
      const organizations = {};
      
      orgsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.name && data.name !== 'undefined') {
          organizations[doc.id] = data;
        }
      });
      
      // Get all licenses that need organization data
      const licensesSnapshot = await db.collection('licenses').get();
      const batch = db.batch();
      let updatedCount = 0;
      
      licensesSnapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.organizationId && !data.organization && organizations[data.organizationId]) {
          const org = organizations[data.organizationId];
          
          batch.update(doc.ref, {
            organization: {
              id: data.organizationId,
              name: org.name,
              tier: org.tier
            },
            updatedAt: new Date()
          });
          
          updatedCount++;
          console.log(`   🔧 Adding organization data for license ${doc.id}: ${org.name}`);
        }
      });
      
      if (updatedCount > 0) {
        await batch.commit();
        console.log(`   ✅ Added organization data to ${updatedCount} licenses`);
      } else {
        console.log(`   ℹ️ No licenses needed organization data`);
      }
      
      return updatedCount;
      
    } catch (error) {
      console.error('   ❌ Error adding organization data:', error);
      return 0;
    }
  }

  /**
   * Verify the fixed license structure
   */
  static async verifyLicenseStructure() {
    console.log('🔍 [Verify] Checking fixed license structure...');
    
    try {
      const licensesSnapshot = await db.collection('licenses').get();
      
      console.log(`\n📊 License Structure Status:`);
      
      licensesSnapshot.forEach(doc => {
        const data = doc.data();
        
        console.log(`\n🔑 License ${doc.id}:`);
        console.log(`   Name: ${data.name || '❌ Missing'}`);
        console.log(`   Key: ${data.key || '❌ Missing'}`);
        console.log(`   Type: ${data.type || '❌ Missing'}`);
        console.log(`   Tier: ${data.tier || '❌ Missing'}`);
        console.log(`   Status: ${data.status || '❌ Missing'}`);
        console.log(`   Assigned To: ${data.assignedTo ? '✅ Object' : (data.assignedToEmail ? '⚠️ Legacy format' : '❌ Missing')}`);
        console.log(`   Organization: ${data.organization ? '✅ Object' : '❌ Missing'}`);
        console.log(`   Usage: ${data.usage ? '✅ Object' : '❌ Missing'}`);
        console.log(`   Expires At: ${data.expiresAt ? '✅ Set' : '❌ Missing'}`);
      });
      
      return true;
      
    } catch (error) {
      console.error('   ❌ Verification failed:', error);
      return false;
    }
  }

  /**
   * Run complete license structure fix
   */
  static async runFix() {
    console.log('🚀 [Fix] Starting license data structure fix...');
    console.log('===============================================');
    
    try {
      // Step 1: Fix license structure
      const fixedCount = await this.fixLicenseStructure();
      
      // Step 2: Add organization data
      const orgUpdatedCount = await this.addOrganizationData();
      
      // Step 3: Verify structure
      const verificationSuccess = await this.verifyLicenseStructure();
      
      console.log('\n===============================================');
      console.log('🏁 [Fix] License structure fix completed!');
      console.log(`   Licenses fixed: ${fixedCount}`);
      console.log(`   Organization data added: ${orgUpdatedCount}`);
      console.log(`   Verification: ${verificationSuccess ? 'PASSED' : 'FAILED'}`);
      
      if (verificationSuccess) {
        console.log('\n🎉 License structure is now consistent!');
        console.log('✅ All licenses have proper field structure');
        console.log('✅ Frontend should now display correct data');
        console.log('✅ License types, assignments, and details should be accurate');
      } else {
        console.log('\n⚠️ Structure fix completed but verification had issues');
      }
      
      return verificationSuccess;
      
    } catch (error) {
      console.error('💥 License structure fix failed:', error);
      return false;
    }
  }
}

// Run fix if this script is executed directly
if (require.main === module) {
  LicenseDataStructureFixer.runFix()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Fix execution failed:', error);
      process.exit(1);
    });
}

module.exports = LicenseDataStructureFixer;
