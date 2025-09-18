/**
 * Check and Create Test License
 * 
 * This script checks for available licenses and creates one if needed for testing
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

async function checkAndCreateTestLicense() {
  console.log('🔍 Checking for available licenses...\n');
  
  try {
    // Check existing licenses
    const licensesRef = db.collection('licenses');
    const snapshot = await licensesRef
      .where('organization.id', '==', 'enterprise-media-org')
      .get();
    
    console.log(`📋 Found ${snapshot.size} licenses for enterprise-media-org`);
    
    const licenses = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      licenses.push({
        id: doc.id,
        tier: data.tier,
        status: data.status,
        assignedTo: data.assignedTo ? data.assignedTo.email : 'Not assigned',
        expiresAt: data.expiresAt?.toDate?.() || data.expiresAt
      });
    });
    
    console.log('\n📝 License details:');
    licenses.forEach((license, index) => {
      console.log(`   ${index + 1}. ${license.id} - ${license.tier} (${license.status}) - ${license.assignedTo}`);
    });
    
    // Check if we have any unassigned licenses
    const unassignedLicenses = licenses.filter(license => !license.assignedTo || license.assignedTo === 'Not assigned');
    
    if (unassignedLicenses.length > 0) {
      console.log(`\n✅ Found ${unassignedLicenses.length} unassigned licenses`);
      return;
    }
    
    // Create a test license if none available
    console.log('\n🎫 No unassigned licenses found. Creating a test license...');
    
    const testLicense = {
      key: `test-license-${Date.now()}`,
      name: 'Test License for Team Member Creation',
      tier: 'PROFESSIONAL',
      status: 'ACTIVE',
      organization: {
        id: 'enterprise-media-org',
        name: 'Enterprise Media Organization',
        tier: 'ENTERPRISE'
      },
      usage: {
        apiCalls: 0,
        dataTransfer: 0,
        deviceCount: 0,
        maxDevices: 5
      },
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('licenses').add(testLicense);
    console.log(`✅ Created test license: ${docRef.id}`);
    console.log(`   Tier: ${testLicense.tier}`);
    console.log(`   Status: ${testLicense.status}`);
    console.log(`   Expires: ${testLicense.expiresAt}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

checkAndCreateTestLicense()
  .then(() => {
    console.log('\n✅ License check/creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
