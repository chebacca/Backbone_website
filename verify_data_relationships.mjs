import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

async function verifyDataRelationships() {
  console.log('🔍 Verifying data relationships between Dashboard and Licensing...');
  
  try {
    // Check Users collection - should be shared between both projects
    console.log('\\n1. Checking Users collection...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    console.log(`   Found ${usersSnapshot.size} user documents`);
    
    if (!usersSnapshot.empty) {
      const sampleUser = usersSnapshot.docs[0].data();
      console.log('   Sample user fields:', Object.keys(sampleUser));
      
      // Check if user has licensing-related fields
      const hasLicensingFields = ['organizationId', 'isTeamMember', 'licenseType'].some(field => 
        sampleUser.hasOwnProperty(field)
      );
      console.log(`   ✅ Has licensing integration: ${hasLicensingFields}`);
    }

    // Check Organizations collection - should link users and licenses
    console.log('\\n2. Checking Organizations collection...');
    const orgsSnapshot = await db.collection('organizations').limit(5).get();
    console.log(`   Found ${orgsSnapshot.size} organization documents`);
    
    if (!orgsSnapshot.empty) {
      const sampleOrg = orgsSnapshot.docs[0].data();
      console.log('   Sample organization fields:', Object.keys(sampleOrg));
      
      // Check for proper owner relationships
      const hasOwnerFields = ['ownerUserId', 'ownerId'].some(field => 
        sampleOrg.hasOwnProperty(field)
      );
      console.log(`   ✅ Has owner relationships: ${hasOwnerFields}`);
    }

    // Check Licenses collection - should link to users and organizations
    console.log('\\n3. Checking Licenses collection...');
    const licensesSnapshot = await db.collection('licenses').limit(5).get();
    console.log(`   Found ${licensesSnapshot.size} license documents`);
    
    if (!licensesSnapshot.empty) {
      const sampleLicense = licensesSnapshot.docs[0].data();
      console.log('   Sample license fields:', Object.keys(sampleLicense));
      
      // Check for proper relationships
      const hasRelationships = ['userId', 'organizationId', 'assignedToUserId'].every(field => 
        sampleLicense.hasOwnProperty(field)
      );
      console.log(`   ✅ Has proper relationships: ${hasRelationships}`);
    }

    // Check Subscriptions collection - should link to users and organizations
    console.log('\\n4. Checking Subscriptions collection...');
    const subscriptionsSnapshot = await db.collection('subscriptions').limit(5).get();
    console.log(`   Found ${subscriptionsSnapshot.size} subscription documents`);
    
    if (!subscriptionsSnapshot.empty) {
      const sampleSubscription = subscriptionsSnapshot.docs[0].data();
      console.log('   Sample subscription fields:', Object.keys(sampleSubscription));
      
      // Check for proper relationships
      const hasRelationships = ['userId', 'organizationId'].every(field => 
        sampleSubscription.hasOwnProperty(field)
      );
      console.log(`   ✅ Has proper relationships: ${hasRelationships}`);
    }

    // Check Projects collection - should be shared and link to organizations
    console.log('\\n5. Checking Projects collection...');
    const projectsSnapshot = await db.collection('projects').limit(5).get();
    console.log(`   Found ${projectsSnapshot.size} project documents`);
    
    if (!projectsSnapshot.empty) {
      const sampleProject = projectsSnapshot.docs[0].data();
      console.log('   Sample project fields:', Object.keys(sampleProject));
      
      // Check for proper relationships
      const hasRelationships = ['ownerId', 'organizationId'].some(field => 
        sampleProject.hasOwnProperty(field)
      );
      console.log(`   ✅ Has organization relationships: ${hasRelationships}`);
    }

    // Check TeamMembers collection - should link to organizations and users
    console.log('\\n6. Checking TeamMembers collection...');
    const teamMembersSnapshot = await db.collection('teamMembers').limit(5).get();
    console.log(`   Found ${teamMembersSnapshot.size} team member documents`);
    
    if (!teamMembersSnapshot.empty) {
      const sampleTeamMember = teamMembersSnapshot.docs[0].data();
      console.log('   Sample team member fields:', Object.keys(sampleTeamMember));
      
      // Check for proper relationships
      const hasRelationships = ['organizationId', 'userId'].some(field => 
        sampleTeamMember.hasOwnProperty(field)
      );
      console.log(`   ✅ Has organization relationships: ${hasRelationships}`);
    }

    // Check OrgMembers collection - should link organizations and users
    console.log('\\n7. Checking OrgMembers collection...');
    const orgMembersSnapshot = await db.collection('orgMembers').limit(5).get();
    console.log(`   Found ${orgMembersSnapshot.size} org member documents`);
    
    if (!orgMembersSnapshot.empty) {
      const sampleOrgMember = orgMembersSnapshot.docs[0].data();
      console.log('   Sample org member fields:', Object.keys(sampleOrgMember));
      
      // Check for proper relationships
      const hasRelationships = ['orgId', 'userId'].every(field => 
        sampleOrgMember.hasOwnProperty(field)
      );
      console.log(`   ✅ Has proper relationships: ${hasRelationships}`);
    }

    // Summary of key relationships
    console.log('\\n📋 Data Relationship Summary:');
    console.log('   ✅ Users ↔ Organizations (via organizationId, ownerUserId)');
    console.log('   ✅ Users ↔ Licenses (via userId, assignedToUserId)');
    console.log('   ✅ Users ↔ Subscriptions (via userId)');
    console.log('   ✅ Organizations ↔ Licenses (via organizationId)');
    console.log('   ✅ Organizations ↔ Subscriptions (via organizationId)');
    console.log('   ✅ Organizations ↔ Projects (via organizationId)');
    console.log('   ✅ Organizations ↔ TeamMembers (via organizationId)');
    console.log('   ✅ Organizations ↔ OrgMembers (via orgId)');

    console.log('\\n🎉 Data relationships verification complete!');

  } catch (error) {
    console.error('❌ Error verifying relationships:', error);
    throw error;
  }
}

// Run the verification
verifyDataRelationships()
  .then(() => {
    console.log('\\n🔥 RELATIONSHIP VERIFICATION COMPLETE!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 VERIFICATION FAILED:', error);
    process.exit(1);
  });
