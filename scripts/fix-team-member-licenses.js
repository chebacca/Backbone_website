/**
 * Fix Team Member License Inheritance
 * 
 * This script updates the Firestore database to ensure team members inherit
 * their organization's subscription tier (Enterprise, Professional, Basic).
 * 
 * It will:
 * 1. Find all team members in the database
 * 2. Check their organization's subscription tier
 * 3. Update their licenseType field to inherit from the organization
 * 4. Ensure Lissa is set to Enterprise tier
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'backbone-logic',
    // Use service account key if available, otherwise use default credentials
    // credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function fixTeamMemberLicenses() {
  try {
    console.log('🔧 Starting team member license inheritance fix...\n');

    // Step 1: Get all organizations and their subscription tiers
    console.log('📋 Step 1: Fetching organizations and subscription tiers...');
    const orgsSnapshot = await db.collection('organizations').get();
    const organizations = new Map();
    
    orgsSnapshot.forEach(doc => {
      const org = doc.data();
      organizations.set(doc.id, {
        id: doc.id,
        name: org.name,
        tier: org.tier || org.subscriptionTier || 'PROFESSIONAL', // Default to PROFESSIONAL
        subscriptionTier: org.subscriptionTier || org.tier || 'PROFESSIONAL'
      });
    });
    
    console.log(`   Found ${organizations.size} organizations:`);
    organizations.forEach((org, id) => {
      console.log(`     - ${org.name} (${id}): ${org.tier}`);
    });

    // Step 2: Get all team members
    console.log('\n📋 Step 2: Fetching all team members...');
    const teamMembersSnapshot = await db.collection('teamMembers').get();
    const teamMembers = [];
    
    teamMembersSnapshot.forEach(doc => {
      const member = doc.data();
      teamMembers.push({
        id: doc.id,
        ...member
      });
    });
    
    console.log(`   Found ${teamMembers.length} team members`);

    // Step 3: Update team members with proper license inheritance
    console.log('\n📋 Step 3: Updating team member license types...');
    let updatedCount = 0;
    let errors = [];

    for (const member of teamMembers) {
      try {
        let newLicenseType = member.licenseType;
        let needsUpdate = false;
        let updateReason = '';

        // Check if member has an organization
        if (member.organizationId && organizations.has(member.organizationId)) {
          const org = organizations.get(member.organizationId);
          const orgTier = org.tier || org.subscriptionTier;
          
          // Determine what the license type should be
          let expectedLicenseType;
          switch (orgTier.toUpperCase()) {
            case 'ENTERPRISE':
              expectedLicenseType = 'ENTERPRISE';
              break;
            case 'PRO':
            case 'PROFESSIONAL':
              expectedLicenseType = 'PROFESSIONAL';
              break;
            case 'BASIC':
            case 'STARTER':
              expectedLicenseType = 'BASIC';
              break;
            default:
              expectedLicenseType = 'PROFESSIONAL';
          }

          // Special case: Lissa should be Enterprise
          if (member.email === 'lissa@apple.com') {
            expectedLicenseType = 'ENTERPRISE';
            updateReason = 'Lissa should be Enterprise tier';
          }

          // Check if update is needed
          if (member.licenseType !== expectedLicenseType) {
            newLicenseType = expectedLicenseType;
            needsUpdate = true;
            updateReason = updateReason || `Inheriting ${expectedLicenseType} from organization ${org.name}`;
          }
        } else {
          // No organization, set default based on email or other criteria
          let defaultLicenseType = 'PROFESSIONAL';
          
          // Special cases
          if (member.email === 'lissa@apple.com') {
            defaultLicenseType = 'ENTERPRISE';
            updateReason = 'Lissa should be Enterprise tier (no organization)';
          } else if (member.email === 'enterprise.user@example.com') {
            defaultLicenseType = 'ENTERPRISE';
            updateReason = 'Enterprise user should be Enterprise tier (no organization)';
          }

          if (member.licenseType !== defaultLicenseType) {
            newLicenseType = defaultLicenseType;
            needsUpdate = true;
            updateReason = updateReason || `Setting default ${defaultLicenseType} tier`;
          }
        }

        // Update the team member if needed
        if (needsUpdate) {
          console.log(`   🔄 Updating ${member.email || member.name || member.id}:`);
          console.log(`      From: ${member.licenseType || 'not set'}`);
          console.log(`      To: ${newLicenseType}`);
          console.log(`      Reason: ${updateReason}`);

          await db.collection('teamMembers').doc(member.id).update({
            licenseType: newLicenseType,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          updatedCount++;
        } else {
          console.log(`   ✅ ${member.email || member.name || member.id}: ${member.licenseType} (no update needed)`);
        }

      } catch (error) {
        console.error(`   ❌ Error updating ${member.email || member.name || member.id}:`, error.message);
        errors.push({
          memberId: member.id,
          email: member.email,
          error: error.message
        });
      }
    }

    // Step 4: Summary
    console.log('\n📋 Step 4: Summary');
    console.log(`   Total team members processed: ${teamMembers.length}`);
    console.log(`   Successfully updated: ${updatedCount}`);
    console.log(`   Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => {
        console.log(`   - ${error.email || error.memberId}: ${error.error}`);
      });
    }

    // Step 5: Verify the fix
    console.log('\n📋 Step 5: Verifying the fix...');
    const verifySnapshot = await db.collection('teamMembers').get();
    const verifiedMembers = [];
    
    verifySnapshot.forEach(doc => {
      const member = doc.data();
      verifiedMembers.push({
        id: doc.id,
        email: member.email,
        name: member.name,
        licenseType: member.licenseType,
        organizationId: member.organizationId
      });
    });

    console.log('\n   Final team member license types:');
    verifiedMembers.forEach(member => {
      const org = member.organizationId ? organizations.get(member.organizationId) : null;
      const orgTier = org ? org.tier : 'No organization';
      console.log(`     - ${member.email || member.name}: ${member.licenseType} (Org: ${orgTier})`);
    });

    console.log('\n✅ Team member license inheritance fix completed successfully!');
    console.log('\n📝 Key changes made:');
    console.log('   - Team members now inherit license type from their organization');
    console.log('   - Lissa is set to Enterprise tier');
    console.log('   - Enterprise users maintain Enterprise tier');
    console.log('   - Professional users maintain Professional tier');
    console.log('   - Users without explicit license types get appropriate defaults');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
fixTeamMemberLicenses()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
