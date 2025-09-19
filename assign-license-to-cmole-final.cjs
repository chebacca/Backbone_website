const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function assignLicenseToCmoleFinal() {
  console.log('🎫 ASSIGNING LICENSE TO CHRIS MOLE (FINAL)');
  console.log('==========================================');
  
  try {
    const enterpriseEmail = 'enterprise.user@enterprisemedia.com';
    const cmoleEmail = 'cmole@backbone.com';
    const orgId = 'enterprise-media-org'; // Use the correct organization
    
    // Step 1: Find Chris Mole in the correct organization
    console.log('👤 Step 1: Finding Chris Mole...');
    const cmoleSnapshot = await db.collection('teamMembers')
      .where('email', '==', cmoleEmail)
      .where('organizationId', '==', orgId)
      .get();
    
    if (cmoleSnapshot.empty) {
      throw new Error('Chris Mole not found in teamMembers for enterprise-media-org');
    }
    
    const cmoleDoc = cmoleSnapshot.docs[0];
    const cmoleData = cmoleDoc.data();
    
    console.log(`✅ Found Chris Mole: ${cmoleData.firstName} ${cmoleData.lastName}`);
    console.log(`   Email: ${cmoleData.email}`);
    console.log(`   Status: ${cmoleData.status}`);
    console.log(`   Current License: ${cmoleData.assignedLicenseId || 'None'}`);
    
    // Step 2: Find available licenses in the correct organization
    console.log('\n🎫 Step 2: Finding available licenses...');
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
        key: `CMOLE-FINAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        userId: 'enterprise.user@enterprisemedia.com',
        organizationId: orgId,
        subscriptionId: 'cmole-final-assignment',
        assignedToUserId: cmoleDoc.id,
        assignedToEmail: cmoleEmail,
        maxActivations: 250,
        activationCount: 0,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        assignedAt: new Date(),
        purchaseMethod: 'cmole-final-assignment'
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
    
    // Step 3: Verify the assignment
    console.log('\n🔍 Step 3: Verifying assignment...');
    
    const updatedCmoleSnapshot = await db.collection('teamMembers')
      .doc(cmoleDoc.id)
      .get();
    
    const updatedCmoleData = updatedCmoleSnapshot.data();
    
    console.log(`👤 Chris Mole Status:`);
    console.log(`   - Email: ${updatedCmoleData.email}`);
    console.log(`   - Status: ${updatedCmoleData.status}`);
    console.log(`   - Assigned License: ${updatedCmoleData.assignedLicenseKey}`);
    console.log(`   - License ID: ${updatedCmoleData.assignedLicenseId}`);
    
    // Step 4: Final organization license status
    console.log('\n📊 Step 4: Final organization license status...');
    
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
    
    // Step 5: Show team members with their licenses
    console.log('\n👥 Step 5: Team members and their licenses...');
    
    const teamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', orgId)
      .get();
    
    console.log(`📊 Team members (${teamMembersSnapshot.size}):`);
    teamMembersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.firstName} ${data.lastName} (${data.email})`);
      console.log(`      Status: ${data.status}`);
      console.log(`      License: ${data.assignedLicenseKey || 'None'}`);
    });
    
    console.log('\n🎉 CHRIS MOLE LICENSE ASSIGNMENT COMPLETED!');
    console.log('===========================================');
    console.log('✅ Chris Mole now has an active license');
    console.log('✅ Status changed from PENDING to ACTIVE');
    console.log('✅ License properly assigned and linked');
    console.log('✅ All data now in enterprise-media-org');
    console.log('✅ Frontend should show correct data');
    
  } catch (error) {
    console.error('❌ Assignment failed:', error);
  }
  
  process.exit(0);
}

assignLicenseToCmoleFinal().catch(console.error);

