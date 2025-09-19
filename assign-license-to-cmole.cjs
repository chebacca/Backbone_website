const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function assignLicenseToCmole() {
  console.log('🎫 ASSIGNING LICENSE TO CHRIS MOLE');
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
    
    // Step 2: Find Chris Mole
    console.log('\n👤 Step 2: Finding Chris Mole...');
    const cmoleSnapshot = await db.collection('teamMembers')
      .where('email', '==', cmoleEmail)
      .get();
    
    if (cmoleSnapshot.empty) {
      throw new Error('Chris Mole not found in teamMembers');
    }
    
    const cmoleDoc = cmoleSnapshot.docs[0];
    const cmoleData = cmoleDoc.data();
    
    console.log(`✅ Found Chris Mole: ${cmoleData.firstName} ${cmoleData.lastName}`);
    console.log(`   Email: ${cmoleData.email}`);
    console.log(`   Status: ${cmoleData.status}`);
    console.log(`   Current License: ${cmoleData.assignedLicenseId || 'None'}`);
    
    // Step 3: Find available licenses for the organization
    console.log('\n🎫 Step 3: Finding available licenses...');
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .where('status', '==', 'ACTIVE')
      .get();
    
    const availableLicenses = licensesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.assignedToUserId || data.assignedToUserId === null;
    });
    
    console.log(`📊 Available licenses: ${availableLicenses.length}`);
    
    if (availableLicenses.length === 0) {
      console.log('❌ No available licenses found. Creating a new license...');
      
      // Create a new license for Chris Mole
      const newLicense = {
        key: `CMOLE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        userId: enterpriseUser.id,
        organizationId: orgId,
        subscriptionId: 'cmole-assignment',
        assignedToUserId: cmoleDoc.id,
        assignedToEmail: cmoleEmail,
        maxActivations: 250,
        activationCount: 0,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        assignedAt: new Date(),
        purchaseMethod: 'cmole-assignment'
      };
      
      const newLicenseRef = await db.collection('licenses').add(newLicense);
      console.log(`✅ Created new license for Chris Mole: ${newLicenseRef.id}`);
      console.log(`   Key: ${newLicense.key}`);
      
      // Update Chris Mole's record
      await cmoleDoc.ref.update({
        assignedLicenseId: newLicenseRef.id,
        assignedLicenseKey: newLicense.key,
        status: 'ACTIVE', // Change from PENDING to ACTIVE
        updatedAt: new Date()
      });
      
      console.log(`✅ Updated Chris Mole's record with new license`);
      
    } else {
      // Use the first available license
      const selectedLicense = availableLicenses[0];
      const selectedLicenseData = selectedLicense.data();
      
      console.log(`🎫 Selected available license: ${selectedLicense.id}`);
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
    }
    
    // Step 4: Verify the assignment
    console.log('\n🔍 Step 4: Verifying assignment...');
    
    const updatedCmoleSnapshot = await db.collection('teamMembers')
      .doc(cmoleDoc.id)
      .get();
    
    const updatedCmoleData = updatedCmoleSnapshot.data();
    
    console.log(`👤 Chris Mole Status:`);
    console.log(`   - Email: ${updatedCmoleData.email}`);
    console.log(`   - Status: ${updatedCmoleData.status}`);
    console.log(`   - Assigned License: ${updatedCmoleData.assignedLicenseKey}`);
    console.log(`   - License ID: ${updatedCmoleData.assignedLicenseId}`);
    
    // Check license status
    const licenseId = updatedCmoleData.assignedLicenseId;
    if (licenseId) {
      const licenseSnapshot = await db.collection('licenses')
        .doc(licenseId)
        .get();
      
      if (licenseSnapshot.exists) {
        const licenseData = licenseSnapshot.data();
        console.log(`🎫 License Status:`);
        console.log(`   - Key: ${licenseData.key}`);
        console.log(`   - Status: ${licenseData.status}`);
        console.log(`   - Assigned To: ${licenseData.assignedToEmail}`);
        console.log(`   - Assigned At: ${licenseData.assignedAt}`);
      }
    }
    
    // Step 5: Check final organization license status
    console.log('\n📊 Step 5: Final organization license status...');
    
    const finalLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    const finalActiveLicenses = finalLicensesSnapshot.docs.filter(doc => 
      doc.data().status === 'ACTIVE'
    );
    const finalUnassignedLicenses = finalActiveLicenses.filter(doc => {
      const data = doc.data();
      return !data.assignedToUserId || data.assignedToUserId === null;
    });
    
    console.log(`📊 Final license status:`);
    console.log(`   - Total licenses: ${finalLicensesSnapshot.size}`);
    console.log(`   - Active licenses: ${finalActiveLicenses.length}`);
    console.log(`   - Unassigned licenses: ${finalUnassignedLicenses.length}`);
    console.log(`   - Assigned licenses: ${finalActiveLicenses.length - finalUnassignedLicenses.length}`);
    
    console.log('\n🎉 LICENSE ASSIGNMENT COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('✅ Chris Mole now has an active license');
    console.log('✅ Status changed from PENDING to ACTIVE');
    console.log('✅ License properly assigned and linked');
    
  } catch (error) {
    console.error('❌ Assignment failed:', error);
    console.log('\n🔧 Debugging steps:');
    console.log('1. Check if Chris Mole exists in teamMembers collection');
    console.log('2. Check if organization has available licenses');
    console.log('3. Check Firebase permissions');
  }
  
  process.exit(0);
}

assignLicenseToCmole().catch(console.error);

