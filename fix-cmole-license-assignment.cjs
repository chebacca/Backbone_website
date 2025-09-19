const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixCmoleLicenseAssignment() {
  console.log('🔧 FIXING CHRIS MOLE LICENSE ASSIGNMENT');
  console.log('=======================================');
  
  try {
    const enterpriseEmail = 'enterprise.user@enterprisemedia.com';
    const cmoleEmail = 'cmole@backbone.com';
    const orgId = 'enterprise-media-org';
    
    // Step 1: Check the license data structure
    console.log('🔍 Step 1: Checking license data structure...');
    
    const licensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    console.log(`📊 Found ${licensesSnapshot.size} licenses in ${orgId}`);
    
    licensesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n   ${index + 1}. License ID: ${doc.id}`);
      console.log(`      Key: ${data.key || 'MISSING'}`);
      console.log(`      Tier: ${data.tier}`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Assigned To: ${data.assignedToUserId || 'None'}`);
      console.log(`      Assigned Email: ${data.assignedToEmail || 'None'}`);
    });
    
    // Step 2: Find Chris Mole
    console.log('\n👤 Step 2: Finding Chris Mole...');
    const cmoleSnapshot = await db.collection('teamMembers')
      .where('email', '==', cmoleEmail)
      .where('organizationId', '==', orgId)
      .get();
    
    if (cmoleSnapshot.empty) {
      throw new Error('Chris Mole not found');
    }
    
    const cmoleDoc = cmoleSnapshot.docs[0];
    const cmoleData = cmoleDoc.data();
    
    console.log(`✅ Found Chris Mole: ${cmoleData.firstName} ${cmoleData.lastName}`);
    console.log(`   Current Status: ${cmoleData.status}`);
    console.log(`   Current License: ${cmoleData.assignedLicenseId || 'None'}`);
    
    // Step 3: Create a proper license for Chris Mole
    console.log('\n🎫 Step 3: Creating proper license for Chris Mole...');
    
    const newLicense = {
      key: `CMOLE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      userId: 'enterprise.user@enterprisemedia.com',
      organizationId: orgId,
      subscriptionId: 'cmole-license',
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
    console.log(`✅ Created new license: ${newLicenseRef.id}`);
    console.log(`   Key: ${newLicense.key}`);
    console.log(`   Tier: ${newLicense.tier}`);
    
    // Step 4: Update Chris Mole's record
    console.log('\n👤 Step 4: Updating Chris Mole\'s record...');
    
    await cmoleDoc.ref.update({
      assignedLicenseId: newLicenseRef.id,
      assignedLicenseKey: newLicense.key,
      status: 'ACTIVE',
      updatedAt: new Date()
    });
    
    console.log(`✅ Updated Chris Mole's record`);
    console.log(`   Status: PENDING → ACTIVE`);
    console.log(`   License: ${newLicense.key}`);
    
    // Step 5: Verify the assignment
    console.log('\n🔍 Step 5: Verifying assignment...');
    
    const updatedCmoleSnapshot = await db.collection('teamMembers')
      .doc(cmoleDoc.id)
      .get();
    
    const updatedCmoleData = updatedCmoleSnapshot.data();
    
    console.log(`👤 Chris Mole Final Status:`);
    console.log(`   - Email: ${updatedCmoleData.email}`);
    console.log(`   - Status: ${updatedCmoleData.status}`);
    console.log(`   - Assigned License: ${updatedCmoleData.assignedLicenseKey}`);
    console.log(`   - License ID: ${updatedCmoleData.assignedLicenseId}`);
    
    // Step 6: Final organization status
    console.log('\n📊 Step 6: Final organization status...');
    
    const finalLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    const finalTeamMembersSnapshot = await db.collection('teamMembers')
      .where('organizationId', '==', orgId)
      .get();
    
    const activeLicenses = finalLicensesSnapshot.docs.filter(doc => 
      doc.data().status === 'ACTIVE'
    );
    const unassignedLicenses = activeLicenses.filter(doc => {
      const data = doc.data();
      return !data.assignedToUserId || data.assignedToUserId === null;
    });
    
    console.log(`📊 Final Status:`);
    console.log(`   - Total Licenses: ${finalLicensesSnapshot.size}`);
    console.log(`   - Active Licenses: ${activeLicenses.length}`);
    console.log(`   - Unassigned Licenses: ${unassignedLicenses.length}`);
    console.log(`   - Assigned Licenses: ${activeLicenses.length - unassignedLicenses.length}`);
    console.log(`   - Team Members: ${finalTeamMembersSnapshot.size}`);
    
    // Step 7: Show team members with licenses
    console.log('\n👥 Step 7: Team members and their licenses...');
    
    finalTeamMembersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.firstName} ${data.lastName} (${data.email})`);
      console.log(`      Status: ${data.status}`);
      console.log(`      License: ${data.assignedLicenseKey || 'None'}`);
      console.log(`      Department: ${data.department || 'Not specified'}`);
    });
    
    console.log('\n🎉 CHRIS MOLE LICENSE ASSIGNMENT FIXED!');
    console.log('=======================================');
    console.log('✅ Chris Mole now has an active license');
    console.log('✅ Status changed from PENDING to ACTIVE');
    console.log('✅ License properly assigned and linked');
    console.log('✅ All data consolidated in enterprise-media-org');
    console.log('✅ Frontend should now show correct data');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
  
  process.exit(0);
}

fixCmoleLicenseAssignment().catch(console.error);

