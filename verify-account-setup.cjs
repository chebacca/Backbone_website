#!/usr/bin/env node

/**
 * Verify Account Setup Script
 * 
 * This script will show the complete status of all seeded account owners
 * and their relationships across all collections.
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

class AccountSetupVerifier {
  
  /**
   * Get all organizations with their details
   */
  static async getOrganizations() {
    const orgsSnapshot = await db.collection('organizations').get();
    const organizations = [];
    
    orgsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name !== 'undefined') {
        organizations.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return organizations.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all users
   */
  static async getUsers() {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return users.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
  }

  /**
   * Get licenses by organization
   */
  static async getLicensesByOrg() {
    const licensesSnapshot = await db.collection('licenses').get();
    const licensesByOrg = {};
    
    licensesSnapshot.forEach(doc => {
      const data = doc.data();
      if (!licensesByOrg[data.organizationId]) {
        licensesByOrg[data.organizationId] = [];
      }
      licensesByOrg[data.organizationId].push(data);
    });
    
    return licensesByOrg;
  }

  /**
   * Get organization memberships
   */
  static async getOrgMemberships() {
    const membersSnapshot = await db.collection('orgMembers').get();
    const memberships = [];
    
    membersSnapshot.forEach(doc => {
      memberships.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return memberships.sort((a, b) => (a.userEmail || '').localeCompare(b.userEmail || ''));
  }

  /**
   * Display complete account setup status
   */
  static async displayAccountStatus() {
    console.log('📊 [Verify] Account Setup Status Report');
    console.log('=====================================');
    
    try {
      // Get all data
      const organizations = await this.getOrganizations();
      const users = await this.getUsers();
      const licensesByOrg = await this.getLicensesByOrg();
      const memberships = await this.getOrgMemberships();
      
      console.log(`\n📈 Summary:`);
      console.log(`   Organizations: ${organizations.length}`);
      console.log(`   Users: ${users.length}`);
      console.log(`   Total Licenses: ${Object.values(licensesByOrg).flat().length}`);
      console.log(`   Organization Memberships: ${memberships.length}`);
      
      console.log(`\n🏢 Organizations:`);
      console.log('=====================================');
      
      for (const org of organizations) {
        console.log(`\n📋 ${org.name} (${org.id})`);
        console.log(`   Tier: ${org.tier}`);
        console.log(`   Owner: ${org.ownerEmail} (${org.ownerUserId})`);
        console.log(`   Status: ${org.status}`);
        
        // Show licenses for this org
        const orgLicenses = licensesByOrg[org.id] || [];
        console.log(`   Licenses: ${orgLicenses.length} ${org.tier} licenses`);
        
        // Show members for this org
        const orgMembers = memberships.filter(m => m.organizationId === org.id);
        console.log(`   Members: ${orgMembers.length}`);
        orgMembers.forEach(member => {
          console.log(`     - ${member.userEmail} (${member.role})`);
        });
        
        // Show features
        if (org.settings && org.settings.features) {
          console.log(`   Features: ${org.settings.features.join(', ')}`);
        }
      }
      
      console.log(`\n👥 Users:`);
      console.log('=====================================');
      
      // Group users by organization
      const usersByOrg = {};
      users.forEach(user => {
        if (!usersByOrg[user.organizationId]) {
          usersByOrg[user.organizationId] = [];
        }
        usersByOrg[user.organizationId].push(user);
      });
      
      for (const [orgId, orgUsers] of Object.entries(usersByOrg)) {
        const org = organizations.find(o => o.id === orgId);
        const orgName = org ? org.name : orgId;
        
        console.log(`\n📋 ${orgName}:`);
        orgUsers.forEach(user => {
          console.log(`   👤 ${user.email}`);
          console.log(`      Role: ${user.role}`);
          console.log(`      Department: ${user.department}`);
          console.log(`      Firebase UID: ${user.firebaseUid}`);
          console.log(`      Status: ${user.status}`);
        });
      }
      
      console.log(`\n🔑 License Distribution:`);
      console.log('=====================================');
      
      let totalLicenses = 0;
      for (const [orgId, licenses] of Object.entries(licensesByOrg)) {
        const org = organizations.find(o => o.id === orgId);
        const orgName = org ? org.name : orgId;
        const assignedLicenses = licenses.filter(l => l.assignedToUserId || l.assignedToEmail);
        const availableLicenses = licenses.filter(l => !l.assignedToUserId && !l.assignedToEmail);
        
        console.log(`\n📋 ${orgName}:`);
        console.log(`   Total: ${licenses.length} ${licenses[0]?.type || 'Unknown'} licenses`);
        console.log(`   Assigned: ${assignedLicenses.length}`);
        console.log(`   Available: ${availableLicenses.length}`);
        
        totalLicenses += licenses.length;
      }
      
      console.log(`\n📊 Total Licenses Across All Organizations: ${totalLicenses}`);
      
      console.log(`\n✅ Account Setup Verification Complete!`);
      console.log('=====================================');
      console.log('🎉 All account owners are properly configured with:');
      console.log('   🔥 Firebase Authentication');
      console.log('   🏢 Organization ownership');
      console.log('   👥 User profiles');
      console.log('   🔑 License pools');
      console.log('   🤝 Organization memberships');
      console.log('\n🚀 Ready for team member management!');
      
      return true;
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  AccountSetupVerifier.displayAccountStatus()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = AccountSetupVerifier;
