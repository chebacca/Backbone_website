#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function debugOrgMembership() {
  console.log('🔍 Debugging Organization Membership Lookup...\n');

  try {
    const enterpriseEmail = 'enterprise.user@example.com';
    const enterpriseFirebaseUid = '4ByNhExY8vTH1SOcZK6ZWDgn3Eu2';

    console.log('1️⃣ Simulating getUserByEmail...');
    const userQuery = await db.collection('users').where('email', '==', enterpriseEmail).limit(1).get();
    if (!userQuery.empty) {
      const doc = userQuery.docs[0];
      const user = { id: doc.id, ...doc.data() };
      console.log('✅ Found user:');
      console.log('  - Document ID (user.id):', user.id);
      console.log('  - Email:', user.email);
      console.log('  - Role:', user.role);
      console.log('  - Firebase UID:', user.firebaseUid);

      console.log('\n2️⃣ Simulating getOrgMembershipsByUserId...');
      console.log('Looking for org memberships with userId =', user.id);
      
      const memberQuery = await db.collection('orgMembers').where('userId', '==', user.id).get();
      console.log('✅ Found org memberships:', memberQuery.size);
      
      if (memberQuery.size > 0) {
        memberQuery.forEach(doc => {
          const data = doc.data();
          console.log('  - Membership:', {
            id: doc.id,
            userId: data.userId,
            organizationId: data.organizationId,
            role: data.role,
            status: data.status
          });
        });
        
        const primaryMembership = memberQuery.docs[0].data();
        console.log('\n3️⃣ Primary membership data:');
        console.log('  - Organization ID:', primaryMembership.organizationId);
        console.log('  - Role:', primaryMembership.role);
        console.log('  - Status:', primaryMembership.status);
        
        // Check if user is enterprise owner
        const isOwner = primaryMembership.role === 'OWNER';
        console.log('  - Is Owner:', isOwner);
        console.log('  - Should be team member:', !isOwner);
        
      } else {
        console.log('❌ No org memberships found!');
        
        console.log('\n🔍 Let\'s check what org memberships exist...');
        const allOrgMembers = await db.collection('orgMembers').get();
        console.log('Total org members in collection:', allOrgMembers.size);
        
        allOrgMembers.forEach(doc => {
          const data = doc.data();
          console.log('  - Doc ID:', doc.id);
          console.log('    userId:', data.userId);
          console.log('    email:', data.email);
          console.log('    organizationId:', data.organizationId);
          console.log('    role:', data.role);
          console.log('    ---');
        });
      }
    } else {
      console.log('❌ No user found with email:', enterpriseEmail);
    }

  } catch (error) {
    console.error('❌ Error debugging org membership:', error);
  }
}

// Run the debug
debugOrgMembership();
