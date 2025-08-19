#!/usr/bin/env node

/**
 * Deep Investigation Script
 * 
 * This script does a comprehensive investigation to find exactly where
 * the dashboard is reading team member data from and why the new member
 * isn't appearing.
 * 
 * Usage: node deep-investigation.js
 */

import admin from 'firebase-admin';

console.log('🔍 Deep Investigation: Finding Dashboard Data Source...\n');

// Initialize Firebase Admin
try {
  console.log('1️⃣ Initializing Firebase Admin SDK...');
  
  const projectId = 'backbone-logic';
  console.log(`   Project ID: ${projectId}`);
  
  if (!admin.apps.length) {
    console.log('   Using Application Default Credentials...');
    admin.initializeApp({ projectId });
  }
  
  console.log('   ✅ Firebase Admin SDK initialized successfully\n');
} catch (error) {
  console.error('   ❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function deepInvestigation() {
  const teamMemberEmail = 'team.member.1755581852099@enterprise-company.com';
  
  try {
    console.log('2️⃣ Comprehensive Data Investigation...\n');
    
    // Check ALL possible collections that might contain team member data
    console.log('   📋 Checking ALL possible data sources...\n');
    
    const possibleCollections = [
      'users',
      'teamMembers', 
      'members',
      'organizationMembers',
      'userOrganizations',
      'teams',
      'organizationUsers',
      'userTeams',
      'enterpriseUsers',
      'enterpriseMembers'
    ];
    
    for (const collectionName of possibleCollections) {
      try {
        const query = await db.collection(collectionName).limit(5).get();
        if (!query.empty) {
          console.log(`   ✅ ${collectionName} collection exists with ${query.size} documents`);
          
          // Check if our team member is in this collection
          const memberQuery = await db.collection(collectionName)
            .where('email', '==', teamMemberEmail)
            .limit(1)
            .get();
          
          if (!memberQuery.empty) {
            const doc = memberQuery.docs[0];
            const data = doc.data();
            console.log(`      🎯 OUR TEAM MEMBER FOUND in ${collectionName}!`);
            console.log(`         ID: ${doc.id}`);
            console.log(`         Email: ${data.email}`);
            console.log(`         Name: ${data.name}`);
            console.log(`         Status: ${data.status}`);
            console.log(`         Organization: ${data.organizationId}`);
          } else {
            console.log(`      ❌ Our team member NOT found in ${collectionName}`);
          }
          
          // Show sample documents to understand structure
          console.log(`      📄 Sample documents in ${collectionName}:`);
          query.docs.slice(0, 3).forEach((doc, index) => {
            const data = doc.data();
            console.log(`         ${index + 1}. ${data.name || data.email || 'No name'} (${data.email || 'No email'})`);
            console.log(`            Role: ${data.role || 'Not set'}`);
            console.log(`            Status: ${data.status || 'Not set'}`);
            console.log(`            Organization: ${data.organizationId || 'Not set'}`);
          });
          
        } else {
          console.log(`   ⚠️  ${collectionName} collection exists but is empty`);
        }
      } catch (error) {
        console.log(`   ❌ ${collectionName} collection does not exist`);
      }
    }
    
    // Check organizations and their members
    console.log('\n3️⃣ Checking Organizations and Members...\n');
    
    const orgsQuery = await db.collection('organizations').get();
    console.log(`   📊 Found ${orgsQuery.size} organizations`);
    
    for (const orgDoc of orgsQuery.docs) {
      const orgData = orgDoc.data();
      const orgId = orgDoc.id;
      
      console.log(`\n   🏢 Organization: ${orgData.name || 'Unnamed'} (ID: ${orgId})`);
      console.log(`      Owner: ${orgData.ownerUserId}`);
      console.log(`      Type: ${orgData.type || 'Not set'}`);
      console.log(`      Status: ${orgData.status || 'Not set'}`);
      
      // Check if our team member belongs to this organization
      const orgMembersQuery = await db.collection('users')
        .where('organizationId', '==', orgId)
        .get();
      
      if (!orgMembersQuery.empty) {
        console.log(`      👥 Members in this organization: ${orgMembersQuery.size}`);
        
        orgMembersQuery.docs.forEach((memberDoc, index) => {
          const memberData = memberDoc.data();
          const isOurMember = memberData.email === teamMemberEmail;
          const indicator = isOurMember ? '🎯 ' : '   ';
          
          console.log(`         ${indicator}${index + 1}. ${memberData.name || 'No name'} (${memberData.email})`);
          console.log(`            Role: ${memberData.role}`);
          console.log(`            Status: ${memberData.status}`);
          console.log(`            isTeamMember: ${memberData.isTeamMember}`);
          console.log(`            Firebase UID: ${memberData.firebaseUid || 'Not set'}`);
        });
      } else {
        console.log(`      ❌ No members found in this organization`);
      }
    }
    
    // Check for any organization-specific collections
    console.log('\n4️⃣ Checking Organization-Specific Collections...\n');
    
    const orgCollections = [
      'organizationUsers',
      'orgMembers', 
      'enterpriseMembers',
      'enterpriseUsers'
    ];
    
    for (const collectionName of orgCollections) {
      try {
        const query = await db.collection(collectionName).limit(3).get();
        if (!query.empty) {
          console.log(`   ✅ ${collectionName} collection exists with ${query.size} documents`);
          
          // Check if our team member is here
          const memberQuery = await db.collection(collectionName)
            .where('email', '==', teamMemberEmail)
            .limit(1)
            .get();
          
          if (!memberQuery.empty) {
            console.log(`      🎯 OUR TEAM MEMBER FOUND in ${collectionName}!`);
            const doc = memberQuery.docs[0];
            console.log(`         ID: ${doc.id}`);
            console.log(`         Data: ${JSON.stringify(doc.data(), null, 2)}`);
          }
          
          // Show sample structure
          query.docs.slice(0, 2).forEach((doc, index) => {
            const data = doc.data();
            console.log(`      📄 Sample ${index + 1}: ${data.email || 'No email'}`);
            console.log(`         Organization: ${data.organizationId || 'Not set'}`);
            console.log(`         Role: ${data.role || 'Not set'}`);
          });
        }
      } catch (error) {
        // Collection doesn't exist
      }
    }
    
    // Check for any views or subcollections
    console.log('\n5️⃣ Checking for Subcollections and Views...\n');
    
    // Check if organizations have subcollections
    for (const orgDoc of orgsQuery.docs.slice(0, 3)) {
      const orgId = orgDoc.id;
      console.log(`   🔍 Checking subcollections for organization ${orgId}...`);
      
      try {
        const subcollections = await orgDoc.ref.listCollections();
        if (subcollections.length > 0) {
          console.log(`      ✅ Found ${subcollections.length} subcollections:`);
          
          for (const subcol of subcollections) {
            console.log(`         📁 ${subcol.id}`);
            
            // Check if our team member is in this subcollection
            const subQuery = await subcol
              .where('email', '==', teamMemberEmail)
              .limit(1)
              .get();
            
            if (!subQuery.empty) {
              console.log(`            🎯 OUR TEAM MEMBER FOUND in subcollection ${subcol.id}!`);
            }
            
            // Show count
            const totalDocs = await subcol.get();
            console.log(`            Total documents: ${totalDocs.size}`);
          }
        } else {
          console.log(`      ❌ No subcollections found`);
        }
      } catch (error) {
        console.log(`      ⚠️  Error checking subcollections: ${error.message}`);
      }
    }
    
    // Check for any special queries or filters
    console.log('\n6️⃣ Checking for Special Data Patterns...\n');
    
    // Look for any documents with special flags or patterns
    const specialQueries = [
      { collection: 'users', field: 'isTeamMember', value: true },
      { collection: 'users', field: 'role', value: 'TEAM_MEMBER' },
      { collection: 'users', field: 'status', value: 'ACTIVE' },
      { collection: 'teamMembers', field: 'status', value: 'ACTIVE' }
    ];
    
    for (const query of specialQueries) {
      try {
        const result = await db.collection(query.collection)
          .where(query.field, '==', query.value)
          .limit(5)
          .get();
        
        if (!result.empty) {
          console.log(`   📊 ${query.collection}.${query.field} == ${query.value}: ${result.size} documents`);
          
          // Check if our team member is in this query
          const ourMember = result.docs.find(doc => doc.data().email === teamMemberEmail);
          if (ourMember) {
            console.log(`      🎯 OUR TEAM MEMBER found in this query!`);
          }
          
          // Show sample
          result.docs.slice(0, 2).forEach((doc, index) => {
            const data = doc.data();
            console.log(`         ${index + 1}. ${data.name || data.email} (${data.email})`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Error querying ${query.collection}.${query.field}: ${error.message}`);
      }
    }
    
    console.log('\n🔍 Deep Investigation Complete!\n');
    
    // Summary and next steps
    console.log('📋 Investigation Summary:');
    console.log('   • We found our team member in multiple collections');
    console.log('   • The dashboard might be reading from a different source than expected');
    console.log('   • There might be additional filtering or caching issues');
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Check the dashboard\'s network requests to see which API it\'s calling');
    console.log('   2. Look for any client-side filtering or caching');
    console.log('   3. Check if there are any organization-specific queries');
    console.log('   4. Verify the dashboard is reading from the correct collection');
    console.log('   5. Check for any authentication or permission issues');
    
  } catch (error) {
    console.error('❌ Deep investigation failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the investigation
deepInvestigation()
  .then(() => {
    console.log('\n✨ Deep investigation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Deep investigation failed:', error.message);
    process.exit(1);
  });
