const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function debugLicenseAvailability() {
  console.log('🔍 DEBUGGING LICENSE AVAILABILITY');
  console.log('==================================');
  
  try {
    const enterpriseEmail = 'enterprise.user@enterprisemedia.com';
    
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
    
    // Step 2: Check ALL licenses for this organization
    console.log('\n🎫 Step 2: Checking ALL licenses for organization...');
    const allLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .get();
    
    console.log(`📊 Total licenses found: ${allLicensesSnapshot.size}`);
    
    allLicensesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n   ${index + 1}. License ID: ${doc.id}`);
      console.log(`      Key: ${data.key}`);
      console.log(`      Tier: ${data.tier}`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Assigned To User ID: ${data.assignedToUserId || 'null'}`);
      console.log(`      Assigned To Email: ${data.assignedToEmail || 'null'}`);
      console.log(`      Organization ID: ${data.organizationId}`);
      console.log(`      Created At: ${data.createdAt}`);
      console.log(`      Updated At: ${data.updatedAt}`);
    });
    
    // Step 3: Check ACTIVE licenses specifically
    console.log('\n🎫 Step 3: Checking ACTIVE licenses...');
    const activeLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .where('status', '==', 'ACTIVE')
      .get();
    
    console.log(`📊 Active licenses: ${activeLicensesSnapshot.size}`);
    
    const unassignedActiveLicenses = activeLicensesSnapshot.docs.filter(doc => {
      const data = doc.data();
      const isUnassigned = !data.assignedToUserId || data.assignedToUserId === null;
      console.log(`   - ${doc.id}: assignedToUserId=${data.assignedToUserId}, isUnassigned=${isUnassigned}`);
      return isUnassigned;
    });
    
    console.log(`📊 Unassigned active licenses: ${unassignedActiveLicenses.length}`);
    
    // Step 4: Check if there are licenses from our test
    console.log('\n🎫 Step 4: Checking for test licenses...');
    const testLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .where('purchaseMethod', '==', 'test-purchase')
      .get();
    
    console.log(`📊 Test purchase licenses: ${testLicensesSnapshot.size}`);
    
    // Step 5: Check if there are licenses from our cmole assignment
    console.log('\n🎫 Step 5: Checking for cmole assignment licenses...');
    const cmoleLicensesSnapshot = await db.collection('licenses')
      .where('organizationId', '==', orgId)
      .where('purchaseMethod', '==', 'cmole-assignment')
      .get();
    
    console.log(`📊 Cmole assignment licenses: ${cmoleLicensesSnapshot.size}`);
    
    // Step 6: Create a new license if none are available
    if (unassignedActiveLicenses.length === 0) {
      console.log('\n🎫 Step 6: Creating a new license for testing...');
      
      const newLicense = {
        key: `DEBUG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        userId: enterpriseUser.id,
        organizationId: orgId,
        subscriptionId: 'debug-license',
        assignedToUserId: null,
        assignedToEmail: null,
        maxActivations: 250,
        activationCount: 0,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        purchaseMethod: 'debug-creation'
      };
      
      const newLicenseRef = await db.collection('licenses').add(newLicense);
      console.log(`✅ Created debug license: ${newLicenseRef.id}`);
      console.log(`   Key: ${newLicense.key}`);
      console.log(`   Tier: ${newLicense.tier}`);
      console.log(`   Status: ${newLicense.status}`);
      console.log(`   Assigned To: ${newLicense.assignedToUserId || 'null'}`);
    }
    
    // Step 7: Final count
    console.log('\n📊 Step 7: Final license count...');
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
    
    console.log(`📊 Final counts:`);
    console.log(`   - Total licenses: ${finalLicensesSnapshot.size}`);
    console.log(`   - Active licenses: ${finalActiveLicenses.length}`);
    console.log(`   - Unassigned licenses: ${finalUnassignedLicenses.length}`);
    console.log(`   - Assigned licenses: ${finalActiveLicenses.length - finalUnassignedLicenses.length}`);
    
    console.log('\n🎉 DEBUG COMPLETED!');
    console.log('==================');
    console.log('This should explain why the frontend shows limited licenses.');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
  
  process.exit(0);
}

debugLicenseAvailability().catch(console.error);

