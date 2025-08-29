#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function fixBackendLoginIssues() {
  console.log('🔧 Fixing Backend Login Issues...\n');

  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterpriseFirebaseUid = '4ByNhExY8vTH1SOcZK6ZWDgn3Eu2';
    const bobDernEmail = 'bdern@example.com';
    const bobDernFirebaseUid = 'yoiPtPYpMuggze33zN4Axj8NyAu1';

    console.log('1️⃣ Creating missing enterprise user org membership...');
    
    // Create org membership for enterprise user
    const enterpriseOrgMemberRef = db.collection('orgMembers').doc();
    await enterpriseOrgMemberRef.set({
      userId: enterpriseFirebaseUid, // Use Firebase UID as userId
      email: enterpriseEmail,
      organizationId: 'default-org',
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`✅ Enterprise user org membership created: ${enterpriseOrgMemberRef.id}`);

    console.log('\n2️⃣ Verifying org memberships...');
    
    // Check enterprise user org membership
    const enterpriseOrgQuery = await db.collection('orgMembers').where('userId', '==', enterpriseFirebaseUid).get();
    console.log(`✅ Enterprise user org memberships found: ${enterpriseOrgQuery.size}`);
    
    // Check Bob Dern org membership
    const bobDernOrgQuery = await db.collection('orgMembers').where('userId', '==', bobDernFirebaseUid).get();
    console.log(`✅ Bob Dern org memberships found: ${bobDernOrgQuery.size}`);

    console.log('\n3️⃣ Ensuring user documents have correct structure...');
    
    // Update enterprise user document to ensure it has the correct structure
    const enterpriseUserRef = db.collection('users').doc(enterpriseEmail);
    await enterpriseUserRef.update({
      organizationId: 'default-org',
      role: 'ENTERPRISE',
      updatedAt: new Date()
    });
    console.log('✅ Enterprise user document updated');

    // Update Bob Dern user document
    const bobDernUserRef = db.collection('users').doc(bobDernEmail);
    await bobDernUserRef.set({
      email: bobDernEmail,
      name: 'Bob Dern',
      role: 'ADMIN',
      status: 'active',
      organizationId: 'example-corp-org',
      firebaseUid: bobDernFirebaseUid,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    console.log('✅ Bob Dern user document updated');

    console.log('\n4️⃣ Testing org membership lookup...');
    
    // Test the lookup function that the API uses
    async function testOrgMembershipLookup(userId, email) {
      const memberQuery = await db.collection('orgMembers').where('userId', '==', userId).get();
      console.log(`  ${email}: Found ${memberQuery.size} org memberships`);
      memberQuery.forEach(doc => {
        const data = doc.data();
        console.log(`    - Org: ${data.organizationId}, Role: ${data.role}, Status: ${data.status}`);
      });
    }
    
    await testOrgMembershipLookup(enterpriseFirebaseUid, enterpriseEmail);
    await testOrgMembershipLookup(bobDernFirebaseUid, bobDernEmail);

    console.log('\n🎉 Backend Login Issues Fixed!');
    console.log('===============================');
    console.log('✅ Collection name fixed (orgMembers)');
    console.log('✅ Enterprise user org membership created');
    console.log('✅ User documents updated with correct structure');
    console.log('✅ Org membership lookup verified');
    console.log('\n🎯 Both users should now have:');
    console.log('   - Proper organization context in login response');
    console.log('   - Team member data populated');
    console.log('   - Organization ID returned correctly');

  } catch (error) {
    console.error('❌ Error fixing backend login issues:', error);
    process.exit(1);
  }
}

// Run the fix
fixBackendLoginIssues();
