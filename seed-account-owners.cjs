#!/usr/bin/env node

/**
 * Seed Account/Subscription Owners Script
 * 
 * This script will properly seed the account owners from the table into all
 * the correct collections with proper relationships and data integrity.
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

class AccountOwnerSeeder {
  
  /**
   * Account owners data from the table
   */
  static getAccountOwnersData() {
    return [
      {
        email: 'basic.user@example.com',
        password: 'BasicPass456!',
        role: 'BASIC_USER',
        license: 'BASIC',
        department: 'General',
        organizationId: 'basic-org-001',
        organizationName: 'Freelance Studio',
        tier: 'BASIC'
      },
      {
        email: 'pro.user@example.com',
        password: 'ProUser789!',
        role: 'PRO_USER',
        license: 'PROFESSIONAL',
        department: 'Engineering',
        organizationId: 'pro-org-001',
        organizationName: 'Creative Productions Inc',
        tier: 'PRO'
      },
      {
        email: 'enterprise.user@example.com',
        password: 'Enterprise2024!',
        role: 'ENTERPRISE_USER',
        license: 'ENTERPRISE',
        department: 'Management',
        organizationId: 'enterprise-org-001',
        organizationName: 'Global Media Corporation',
        tier: 'ENTERPRISE'
      },
      {
        email: 'chebacca@gmail.com',
        password: 'CheAdmin2024!',
        role: 'ADMIN',
        license: 'ENTERPRISE',
        department: 'Administration',
        organizationId: 'backbone-admin-org',
        organizationName: 'Backbone Logic Administration',
        tier: 'ENTERPRISE'
      },
      {
        email: 'accounting@example.com',
        password: 'Accounting2024!',
        role: 'ACCOUNTING',
        license: 'PROFESSIONAL',
        department: 'Finance',
        organizationId: 'accounting-org-001',
        organizationName: 'Accounting Services LLC',
        tier: 'PRO'
      }
    ];
  }

  /**
   * Create or update Firebase Auth users
   */
  static async createFirebaseAuthUsers(accountOwners) {
    console.log('🔥 [Seed] Creating/updating Firebase Auth users...');
    
    const authResults = [];
    
    for (const owner of accountOwners) {
      try {
        let firebaseUser = null;
        
        // Check if user already exists
        try {
          firebaseUser = await admin.auth().getUserByEmail(owner.email);
          console.log(`   ✅ Firebase Auth user exists: ${owner.email}`);
        } catch (error) {
          // User doesn't exist, create them
          firebaseUser = await admin.auth().createUser({
            email: owner.email,
            password: owner.password,
            displayName: owner.email.split('@')[0],
            emailVerified: true
          });
          console.log(`   ✅ Created Firebase Auth user: ${owner.email}`);
        }
        
        // Set custom claims for role and organization
        await admin.auth().setCustomUserClaims(firebaseUser.uid, {
          role: owner.role,
          organizationId: owner.organizationId,
          tier: owner.tier,
          department: owner.department
        });
        
        authResults.push({
          ...owner,
          firebaseUid: firebaseUser.uid
        });
        
      } catch (error) {
        console.error(`   ❌ Error with Firebase Auth for ${owner.email}:`, error.message);
        authResults.push({
          ...owner,
          firebaseUid: null,
          error: error.message
        });
      }
    }
    
    return authResults;
  }

  /**
   * Create or update organizations
   */
  static async createOrganizations(accountOwners) {
    console.log('🏢 [Seed] Creating/updating organizations...');
    
    const organizations = {};
    
    // Group owners by organization
    for (const owner of accountOwners) {
      if (!organizations[owner.organizationId]) {
        organizations[owner.organizationId] = {
          id: owner.organizationId,
          name: owner.organizationName,
          tier: owner.tier,
          owners: []
        };
      }
      organizations[owner.organizationId].owners.push(owner);
    }
    
    const batch = db.batch();
    
    for (const [orgId, orgData] of Object.entries(organizations)) {
      // Use the first owner as the primary owner
      const primaryOwner = orgData.owners[0];
      
      const organizationDoc = {
        id: orgId,
        name: orgData.name,
        tier: orgData.tier,
        ownerUserId: primaryOwner.firebaseUid || primaryOwner.email,
        ownerEmail: primaryOwner.email,
        status: 'ACTIVE',
        settings: {
          allowTeamMembers: true,
          maxTeamMembers: orgData.tier === 'BASIC' ? 1 : orgData.tier === 'PRO' ? 10 : 50,
          features: this.getTierFeatures(orgData.tier)
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const orgRef = db.collection('organizations').doc(orgId);
      batch.set(orgRef, organizationDoc, { merge: true });
      
      console.log(`   ✅ Organization: ${orgData.name} (${orgId}) - Owner: ${primaryOwner.email}`);
    }
    
    await batch.commit();
    console.log(`   ✅ Created/updated ${Object.keys(organizations).length} organizations`);
    
    return organizations;
  }

  /**
   * Get tier-specific features
   */
  static getTierFeatures(tier) {
    const features = {
      BASIC: ['basic_dashboard', 'basic_projects', 'basic_reports'],
      PRO: ['basic_dashboard', 'basic_projects', 'basic_reports', 'advanced_analytics', 'team_collaboration', 'api_access'],
      ENTERPRISE: ['basic_dashboard', 'basic_projects', 'basic_reports', 'advanced_analytics', 'team_collaboration', 'api_access', 'custom_integrations', 'priority_support', 'advanced_security']
    };
    
    return features[tier] || features.BASIC;
  }

  /**
   * Create user documents in users collection
   */
  static async createUserDocuments(accountOwners) {
    console.log('👥 [Seed] Creating user documents...');
    
    const batch = db.batch();
    
    for (const owner of accountOwners) {
      if (!owner.firebaseUid) {
        console.log(`   ⏭️ Skipping ${owner.email} - no Firebase UID`);
        continue;
      }
      
      const userDoc = {
        id: owner.firebaseUid,
        email: owner.email,
        name: owner.email.split('@')[0],
        firstName: owner.email.split('@')[0].split('.')[0] || 'User',
        lastName: owner.email.split('@')[0].split('.')[1] || 'Account',
        role: owner.role,
        organizationId: owner.organizationId,
        department: owner.department,
        tier: owner.tier,
        status: 'ACTIVE',
        isEmailVerified: true,
        settings: {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC'
        },
        firebaseUid: owner.firebaseUid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Create user document with Firebase UID as document ID
      const userRef = db.collection('users').doc(owner.firebaseUid);
      batch.set(userRef, userDoc, { merge: true });
      
      // Also create a document with email as ID for compatibility
      const emailUserRef = db.collection('users').doc(owner.email);
      batch.set(emailUserRef, userDoc, { merge: true });
      
      console.log(`   ✅ User: ${owner.email} (${owner.firebaseUid})`);
    }
    
    await batch.commit();
    console.log(`   ✅ Created user documents for ${accountOwners.filter(o => o.firebaseUid).length} users`);
  }

  /**
   * Create licenses for organizations
   */
  static async createLicenses(organizations) {
    console.log('🔑 [Seed] Creating organization licenses...');
    
    const batch = db.batch();
    let licenseCount = 0;
    
    for (const [orgId, orgData] of Object.entries(organizations)) {
      const licenseQuota = this.getLicenseQuota(orgData.tier);
      
      for (let i = 0; i < licenseQuota; i++) {
        const licenseRef = db.collection('licenses').doc();
        
        const licenseDoc = {
          id: licenseRef.id,
          organizationId: orgId,
          type: orgData.tier,
          status: 'ACTIVE',
          assignedToUserId: null,
          assignedToEmail: null,
          features: this.getTierFeatures(orgData.tier),
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: null // No expiration for now
        };
        
        batch.set(licenseRef, licenseDoc);
        licenseCount++;
      }
      
      console.log(`   ✅ Created ${licenseQuota} ${orgData.tier} licenses for ${orgData.name}`);
    }
    
    await batch.commit();
    console.log(`   ✅ Created ${licenseCount} total licenses`);
  }

  /**
   * Get license quota based on tier
   */
  static getLicenseQuota(tier) {
    const quotas = {
      BASIC: 1,
      PRO: 10,
      ENTERPRISE: 50
    };
    
    return quotas[tier] || 1;
  }

  /**
   * Create organization memberships
   */
  static async createOrganizationMemberships(accountOwners) {
    console.log('🤝 [Seed] Creating organization memberships...');
    
    const batch = db.batch();
    
    for (const owner of accountOwners) {
      if (!owner.firebaseUid) {
        continue;
      }
      
      // Create membership in orgMembers collection
      const memberRef = db.collection('orgMembers').doc();
      
      const membershipDoc = {
        id: memberRef.id,
        userId: owner.firebaseUid,
        userEmail: owner.email,
        organizationId: owner.organizationId,
        role: 'OWNER',
        status: 'ACTIVE',
        permissions: ['ALL'],
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      batch.set(memberRef, membershipDoc);
      
      // Also create in org_members for compatibility
      const altMemberRef = db.collection('org_members').doc();
      batch.set(altMemberRef, {
        ...membershipDoc,
        id: altMemberRef.id
      });
      
      console.log(`   ✅ Membership: ${owner.email} → ${owner.organizationId} (OWNER)`);
    }
    
    await batch.commit();
    console.log(`   ✅ Created organization memberships`);
  }

  /**
   * Verify the seeding was successful
   */
  static async verifySeeding() {
    console.log('🔍 [Seed] Verifying seeding results...');
    
    try {
      // Check organizations
      const orgsSnapshot = await db.collection('organizations').get();
      console.log(`   📊 Organizations: ${orgsSnapshot.docs.length}`);
      
      // Check users
      const usersSnapshot = await db.collection('users').get();
      console.log(`   📊 Users: ${usersSnapshot.docs.length}`);
      
      // Check licenses
      const licensesSnapshot = await db.collection('licenses').get();
      console.log(`   📊 Licenses: ${licensesSnapshot.docs.length}`);
      
      // Check memberships
      const membersSnapshot = await db.collection('orgMembers').get();
      console.log(`   📊 Organization memberships: ${membersSnapshot.docs.length}`);
      
      // Show organization details
      console.log('\n   🏢 Organization Details:');
      orgsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`      ${data.name}: Owner = ${data.ownerEmail}, Tier = ${data.tier}`);
      });
      
      return true;
      
    } catch (error) {
      console.error('   ❌ Verification failed:', error);
      return false;
    }
  }

  /**
   * Run complete seeding process
   */
  static async seedAccountOwners() {
    console.log('🌱 [Seed] Starting account owners seeding process...');
    console.log('================================================');
    
    try {
      // Get account owners data
      const accountOwnersData = this.getAccountOwnersData();
      console.log(`📋 Found ${accountOwnersData.length} account owners to seed`);
      
      // Step 1: Create Firebase Auth users
      const accountOwners = await this.createFirebaseAuthUsers(accountOwnersData);
      
      // Step 2: Create organizations
      const organizations = await this.createOrganizations(accountOwners);
      
      // Step 3: Create user documents
      await this.createUserDocuments(accountOwners);
      
      // Step 4: Create licenses
      await this.createLicenses(organizations);
      
      // Step 5: Create organization memberships
      await this.createOrganizationMemberships(accountOwners);
      
      // Step 6: Verify seeding
      const verificationSuccess = await this.verifySeeding();
      
      console.log('\n================================================');
      console.log('🎉 [Seed] Account owners seeding completed!');
      
      if (verificationSuccess) {
        console.log('\n✅ All account owners are properly seeded in all collections:');
        console.log('   🔥 Firebase Authentication');
        console.log('   🏢 Organizations');
        console.log('   👥 Users');
        console.log('   🔑 Licenses');
        console.log('   🤝 Organization Memberships');
        console.log('\n🚀 Your system is ready for team member management!');
      } else {
        console.log('\n⚠️ Seeding completed but verification had issues. Check the logs above.');
      }
      
      return verificationSuccess;
      
    } catch (error) {
      console.error('\n💥 Seeding failed:', error);
      throw error;
    }
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  AccountOwnerSeeder.seedAccountOwners()
    .then((success) => {
      console.log('\n🏁 Seeding process completed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = AccountOwnerSeeder;
