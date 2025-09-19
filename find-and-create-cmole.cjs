const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function findAndCreateCmole() {
  console.log('🔍 FINDING AND CREATING CHRIS MOLE');
  console.log('===================================');
  
  try {
    const enterpriseEmail = 'enterprise.user@enterprisemedia.com';
    const cmoleEmail = 'cmole@backbone.com';
    
    // Step 1: Find enterprise user and organization
    console.log('👤 Step 1: Finding enterprise user...');
    const usersSnapshot = await db.collection('users')
      .where('email', '==', enterpriseEmail)
      .get();
    
    if (usersSnapshot.empty) {
      throw new Error('Enterprise user not found');
    }
    
    const enterpriseUser = usersSnapshot.docs[0];
    const orgId = enterpriseUser.data().organizationId;
    
    console.log(`✅ Found enterprise user: ${enterpriseUser.data().name}`);
    console.log(`   Organization: ${orgId}`);
    
    // Step 2: Search for Chris Mole in all collections
    console.log('\n🔍 Step 2: Searching for Chris Mole...');
    
    // Check users collection
    const cmoleUsersSnapshot = await db.collection('users')
      .where('email', '==', cmoleEmail)
      .get();
    
    console.log(`📧 Found in users collection: ${cmoleUsersSnapshot.size} records`);
    if (!cmoleUsersSnapshot.empty) {
      cmoleUsersSnapshot.forEach(doc => {
        console.log(`   - ${doc.id}: ${JSON.stringify(doc.data(), null, 2)}`);
      });
    }
    
    // Check teamMembers collection
    const cmoleTeamMembersSnapshot = await db.collection('teamMembers')
      .where('email', '==', cmoleEmail)
      .get();
    
    console.log(`👥 Found in teamMembers collection: ${cmoleTeamMembersSnapshot.size} records`);
    if (!cmoleTeamMembersSnapshot.empty) {
      cmoleTeamMembersSnapshot.forEach(doc => {
        console.log(`   - ${doc.id}: ${JSON.stringify(doc.data(), null, 2)}`);
      });
    }
    
    // Check orgMembers collection
    const cmoleOrgMembersSnapshot = await db.collection('orgMembers')
      .where('email', '==', cmoleEmail)
      .get();
    
    console.log(`🏢 Found in orgMembers collection: ${cmoleOrgMembersSnapshot.size} records`);
    if (!cmoleOrgMembersSnapshot.empty) {
      cmoleOrgMembersSnapshot.forEach(doc => {
        console.log(`   - ${doc.id}: ${JSON.stringify(doc.data(), null, 2)}`);
      });
    }
    
    // Step 3: Create Chris Mole if not found
    if (cmoleTeamMembersSnapshot.empty) {
      console.log('\n👤 Step 3: Creating Chris Mole in teamMembers collection...');
      
      const cmoleData = {
        email: cmoleEmail,
        firstName: 'Chris',
        lastName: 'Mole',
        role: 'MEMBER',
        department: 'POST',
        position: 'Developer',
        phone: '+1234567890',
        organizationId: orgId,
        createdBy: enterpriseUser.id,
        createdByEmail: enterpriseEmail,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        temporaryPassword: 'TempPass123!'
      };
      
      const cmoleRef = await db.collection('teamMembers').add(cmoleData);
      console.log(`✅ Created Chris Mole in teamMembers: ${cmoleRef.id}`);
      console.log(`   Email: ${cmoleData.email}`);
      console.log(`   Name: ${cmoleData.firstName} ${cmoleData.lastName}`);
      console.log(`   Department: ${cmoleData.department}`);
      console.log(`   Status: ${cmoleData.status}`);
      
      // Also create in users collection for consistency
      const cmoleUserData = {
        email: cmoleEmail,
        name: 'Chris Mole',
        firstName: 'Chris',
        lastName: 'Mole',
        role: 'MEMBER',
        organizationId: orgId,
        isTeamMember: true,
        memberRole: 'MEMBER',
        memberStatus: 'PENDING',
        createdBy: enterpriseUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        temporaryPassword: 'TempPass123!',
        firebaseUid: null,
        emailVerified: false
      };
      
      const cmoleUserRef = await db.collection('users').add(cmoleUserData);
      console.log(`✅ Created Chris Mole in users: ${cmoleUserRef.id}`);
      
    } else {
      console.log('\n✅ Chris Mole already exists in teamMembers collection');
    }
    
    // Step 4: Find available licenses
    console.log('\n🎫 Step 4: Finding available licenses...');
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .where('status', '==', 'ACTIVE')
      .get();
    
    const availableLicenses = licensesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.assignedToUserId || data.assignedToUserId === null;
    });
    
    console.log(`📊 Available licenses: ${availableLicenses.length}`);
    
    if (availableLicenses.length > 0) {
      availableLicenses.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${doc.id}: ${data.key} (${data.tier})`);
      });
    }
    
    // Step 5: Assign license to Chris Mole
    if (availableLicenses.length > 0) {
      console.log('\n🎫 Step 5: Assigning license to Chris Mole...');
      
      // Get the most recent Chris Mole record
      const cmoleSnapshot = await db.collection('teamMembers')
        .where('email', '==', cmoleEmail)
        .get();
      
      if (!cmoleSnapshot.empty) {
        const cmoleDoc = cmoleSnapshot.docs[0];
        const selectedLicense = availableLicenses[0];
        const selectedLicenseData = selectedLicense.data();
        
        console.log(`🎫 Assigning license: ${selectedLicense.id}`);
        console.log(`   Key: ${selectedLicenseData.key}`);
        console.log(`   Tier: ${selectedLicenseData.tier}`);
        
        // Update the license to assign it to Chris Mole
        await selectedLicense.ref.update({
          assignedToUserId: cmoleDoc.id,
          assignedToEmail: cmoleEmail,
          assignedAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ License assigned to Chris Mole`);
        
        // Update Chris Mole's record
        await cmoleDoc.ref.update({
          assignedLicenseId: selectedLicense.id,
          assignedLicenseKey: selectedLicenseData.key,
          status: 'ACTIVE', // Change from PENDING to ACTIVE
          updatedAt: new Date()
        });
        
        console.log(`✅ Updated Chris Mole's record with assigned license`);
        console.log(`   Status changed from PENDING to ACTIVE`);
        
      } else {
        console.log('❌ Chris Mole not found after creation');
      }
    } else {
      console.log('❌ No available licenses found for assignment');
    }
    
    console.log('\n🎉 CHRIS MOLE SETUP COMPLETED!');
    console.log('==============================');
    console.log('✅ Chris Mole created in teamMembers collection');
    console.log('✅ Chris Mole created in users collection');
    console.log('✅ License assigned (if available)');
    console.log('✅ Status set to ACTIVE');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
  
  process.exit(0);
}

findAndCreateCmole().catch(console.error);

