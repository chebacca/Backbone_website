#!/usr/bin/env node

/**
 * Fix the missing team member record by creating one with the JWT ID
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

async function fixMissingTeamMember() {
  console.log('🔧 Fixing missing team member record...');
  
  const jwtId = 'VDkIOHtIFbqAE1AdBSQE';  // ID from JWT token
  const actualId = '2is23RGSIH26JNFlRaxJ';  // Actual team member ID
  
  // Get the existing team member data
  console.log('📋 Getting existing team member data...');
  const existingDoc = await db.collection('teamMembers').doc(actualId).get();
  
  if (!existingDoc.exists) {
    console.log('❌ Existing team member not found');
    return;
  }
  
  const existingData = existingDoc.data();
  console.log('✅ Found existing team member:', existingData);
  
  // Check if JWT ID record already exists
  const jwtDoc = await db.collection('teamMembers').doc(jwtId).get();
  
  if (jwtDoc.exists) {
    console.log('✅ JWT ID team member already exists');
    return;
  }
  
  // Create new team member record with JWT ID
  console.log('🔄 Creating team member record with JWT ID...');
  
  const newTeamMemberData = {
    ...existingData,
    id: jwtId,  // Use the JWT ID
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };
  
  await db.collection('teamMembers').doc(jwtId).set(newTeamMemberData);
  
  console.log('✅ Created team member record with ID:', jwtId);
  
  // Verify the creation
  const verifyDoc = await db.collection('teamMembers').doc(jwtId).get();
  if (verifyDoc.exists) {
    console.log('✅ Verification successful - new team member record exists');
    console.log('📊 Data:', verifyDoc.data());
  }
  
  console.log('\\n🎉 Fix completed! API should now work correctly.');
  
  process.exit(0);
}

fixMissingTeamMember().catch(console.error);
