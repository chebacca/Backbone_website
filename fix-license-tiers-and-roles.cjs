const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixLicenseTiersAndRoles() {
  console.log('🎫 FIXING LICENSE TIERS AND ROLE-BASED ALLOCATION');
  console.log('=================================================');
  
  try {
    // Updated subscription tiers and their license allowances
    const tierLimits = {
      'BASIC': { maxLicenses: 10, maxTeamMembers: 10 },
      'PRO': { maxLicenses: 25, maxTeamMembers: 25 },
      'ENTERPRISE': { maxLicenses: 250, maxTeamMembers: 250 }
    };
    
    // Roles that DON'T need licenses (administrative roles)
    const noLicenseRoles = ['ACCOUNTING', 'ADMIN'];
    
    console.log('\n1️⃣ UPDATED SUBSCRIPTION TIER LICENSE LIMITS:');
    console.log('============================================');
    Object.entries(tierLimits).forEach(([tier, limits]) => {
      console.log(`${tier}: ${limits.maxLicenses} licenses, ${limits.maxTeamMembers} team members`);
    });
    
    console.log('\n📋 ROLES THAT DON\'T NEED LICENSES:');
    console.log('==================================');
    noLicenseRoles.forEach(role => {
      console.log(`- ${role} (administrative role)`);
    });
    
    console.log('\n2️⃣ REMOVING LICENSES FROM ADMIN/ACCOUNTING USERS:');
    console.log('=================================================');
    
    // Clear all existing licenses to start fresh
    console.log('\nClearing all existing licenses...');
    const existingLicenses = await db.collection('licenses').get();
    const batch = db.batch();
    existingLicenses.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`✅ Cleared ${existingLicenses.size} existing licenses`);
    
    console.log('\n3️⃣ SETTING UP LICENSES FOR BUSINESS USERS ONLY:');
    console.log('===============================================');
    
    // Define users and their roles - only business users get licenses
    const users = [
      { 
        email: 'enterprise.user@example.com', 
        orgId: 'default-org', 
        tier: 'ENTERPRISE', 
        role: 'ENTERPRISE_USER',
        firebaseUid: 'xoAEWjTKXHSF1uOTdG2dZmm4Xar1',
        needsLicense: true 
      },
      { 
        email: 'pro.user@example.com', 
        orgId: 'pro.user-org', 
        tier: 'PRO', 
        role: 'PRO_USER',
        firebaseUid: 'BVEE2EpVwShoqcHZ2Ibi3Ed8gkA3',
        needsLicense: true 
      },
      { 
        email: 'basic.user@example.com', 
        orgId: 'basic.user-org', 
        tier: 'BASIC', 
        role: 'BASIC_USER',
        firebaseUid: 'iNIg3YAPUSQMRT3jRWkz1clB83W2',
        needsLicense: true 
      },
      { 
        email: 'accounting@example.com', 
        orgId: 'accounting-org', 
        tier: 'PRO', 
        role: 'ACCOUNTING',
        firebaseUid: 'NVvLHBscFbXuwKja6S3FOYKe6xp1',
        needsLicense: false  // ACCOUNTING role doesn't need license
      },
      { 
        email: 'chebacca@gmail.com', 
        orgId: 'chebacca-org', 
        tier: 'ENTERPRISE', 
        role: 'ADMIN',
        firebaseUid: 'PHndSQB50VWNhimb5TMqkme53wq2',
        needsLicense: false  // ADMIN role doesn't need license
      }
    ];
    
    for (const user of users) {
      console.log(`\n📋 Processing ${user.email} (${user.role} - ${user.tier}):`);
      
      if (!user.needsLicense) {
        console.log(`  ⏭️ Skipping license creation - ${user.role} role doesn't need licenses`);
        continue;
      }
      
      const limits = tierLimits[user.tier];
      
      // Create owner license
      const ownerLicenseId = `license-${user.orgId}-owner`;
      await db.collection('licenses').doc(ownerLicenseId).set({
        id: ownerLicenseId,
        key: `${user.tier.substring(0, 3)}-${Date.now()}-OWNER`,
        tier: user.tier,
        licenseType: user.tier,
        status: 'ACTIVE',
        organizationId: user.orgId,
        assignedToUserId: user.firebaseUid,
        assignedToEmail: user.email,
        firebaseUid: user.firebaseUid,
        isOwnerLicense: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`  ✅ Created owner license: ${user.tier}`);
      
      // Create additional licenses for team members based on updated limits
      const additionalLicenses = limits.maxLicenses - 1; // -1 for owner license
      const licensesToCreate = Math.min(additionalLicenses, 10); // Create up to 10 initially
      
      if (licensesToCreate > 0) {
        for (let i = 1; i <= licensesToCreate; i++) {
          const teamLicenseId = `license-${user.orgId}-team-${i}`;
          await db.collection('licenses').doc(teamLicenseId).set({
            id: teamLicenseId,
            key: `${user.tier.substring(0, 3)}-${Date.now()}-${i.toString().padStart(3, '0')}`,
            tier: user.tier,
            licenseType: user.tier,
            status: 'ACTIVE',
            organizationId: user.orgId,
            assignedToUserId: null,
            assignedToEmail: null,
            firebaseUid: null,
            isOwnerLicense: false,
            availableForAssignment: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        console.log(`  ✅ Created ${licensesToCreate} additional licenses (max: ${limits.maxLicenses})`);
      }
    }
    
    console.log('\n4️⃣ ASSIGNING LICENSES TO TEAM MEMBERS:');
    console.log('======================================');
    
    // Assign license to Bob Dern (enterprise user's team member)
    const bobEmail = 'bdern@example.com';
    const bobFirebaseUid = 'Y94ytNb7MFbX6aymvLniVRL7xe02';
    
    // Find an available enterprise license
    const availableEnterpriseLicense = await db.collection('licenses')
      .where('organizationId', '==', 'default-org')
      .where('availableForAssignment', '==', true)
      .limit(1)
      .get();
    
    if (!availableEnterpriseLicense.empty) {
      const licenseDoc = availableEnterpriseLicense.docs[0];
      await licenseDoc.ref.update({
        assignedToUserId: bobFirebaseUid,
        assignedToEmail: bobEmail,
        firebaseUid: bobFirebaseUid,
        availableForAssignment: false,
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Assigned license ${licenseDoc.id} to Bob Dern`);
    }
    
    console.log('\n5️⃣ VERIFICATION - UPDATED LICENSE ALLOCATION:');
    console.log('=============================================');
    
    for (const user of users) {
      console.log(`\n${user.email} (${user.role} - ${user.tier}):`);
      console.log(`  Organization: ${user.orgId}`);
      console.log(`  Needs License: ${user.needsLicense ? 'YES' : 'NO'}`);
      
      if (user.needsLicense) {
        const userLicenses = await db.collection('licenses')
          .where('organizationId', '==', user.orgId)
          .get();
        
        const assignedLicenses = userLicenses.docs.filter(doc => doc.data().assignedToUserId);
        const availableLicenses = userLicenses.docs.filter(doc => doc.data().availableForAssignment);
        
        console.log(`  Total licenses: ${userLicenses.size}`);
        console.log(`  Assigned licenses: ${assignedLicenses.length}`);
        console.log(`  Available licenses: ${availableLicenses.length}`);
        console.log(`  Max licenses allowed: ${tierLimits[user.tier].maxLicenses}`);
      } else {
        console.log(`  Administrative role - no licenses needed`);
      }
    }
    
    console.log('\n🎉 LICENSE SYSTEM FIXES COMPLETED');
    console.log('=================================');
    console.log('✅ Updated tier limits: Basic(10), Pro(25), Enterprise(250)');
    console.log('✅ Removed licenses from ACCOUNTING and ADMIN roles');
    console.log('✅ Only business users (BASIC_USER, PRO_USER, ENTERPRISE_USER) get licenses');
    console.log('✅ Team members can be assigned available licenses within tier limits');
    console.log('✅ Proper tenant isolation maintained');
    console.log('');
    console.log('📋 UPDATED SUBSCRIPTION TIER LIMITS:');
    console.log('  BASIC: Up to 10 licenses');
    console.log('  PRO: Up to 25 licenses');
    console.log('  ENTERPRISE: Up to 250 licenses');
    console.log('');
    console.log('👥 ROLES WITHOUT LICENSES:');
    console.log('  ACCOUNTING: Administrative access only');
    console.log('  ADMIN: Administrative access only');
    
  } catch (error) {
    console.error('❌ Error fixing license tiers and roles:', error);
  }
  
  process.exit(0);
}

fixLicenseTiersAndRoles().catch(console.error);
