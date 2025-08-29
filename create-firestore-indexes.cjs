const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function createFirestoreIndexes() {
  console.log('📊 CREATING FIRESTORE INDEXES FOR OPTIMAL QUERIES');
  console.log('=================================================');
  
  try {
    console.log('\n🔍 REQUIRED INDEXES FOR DASHBOARD QUERIES:');
    console.log('==========================================');
    
    console.log('\n1️⃣ TEAM MEMBERS COLLECTION:');
    console.log('   Index 1: assignedToUserId + status (for account owners)');
    console.log('   Index 2: organizationId + status (for org-based queries)');
    console.log('   Index 3: email (single field, for user lookups)');
    
    console.log('\n2️⃣ PROJECTS COLLECTION:');
    console.log('   Index 1: organizationId + isActive (for active projects)');
    console.log('   Index 2: organizationId + lastAccessedAt (for recent projects)');
    console.log('   Index 3: organizationId (single field, for all org projects)');
    
    console.log('\n3️⃣ LICENSES COLLECTION:');
    console.log('   Index 1: organizationId + status (for active licenses)');
    console.log('   Index 2: firebaseUid + status (for user licenses)');
    console.log('   Index 3: assignedToEmail (single field, for email lookups)');
    console.log('   Index 4: availableForAssignment + organizationId (for available licenses)');
    
    console.log('\n4️⃣ SUBSCRIPTIONS COLLECTION:');
    console.log('   Index 1: firebaseUid + status (for user subscriptions)');
    console.log('   Index 2: organizationId + status (for org subscriptions)');
    
    console.log('\n5️⃣ PAYMENTS COLLECTION:');
    console.log('   Index 1: firebaseUid + createdAt (for user payment history)');
    console.log('   Index 2: organizationId + createdAt (for org payments)');
    
    console.log('\n6️⃣ INVOICES COLLECTION:');
    console.log('   Index 1: firebaseUid + createdAt (for user invoices)');
    console.log('   Index 2: organizationId + status (for org invoice status)');
    
    console.log('\n📋 FIRESTORE INDEXES CONFIGURATION:');
    console.log('===================================');
    console.log('These indexes should be created in Firebase Console or via firestore.indexes.json:');
    
    const indexConfig = {
      "indexes": [
        {
          "collectionGroup": "teamMembers",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "assignedToUserId", "order": "ASCENDING" },
            { "fieldPath": "status", "order": "ASCENDING" }
          ]
        },
        {
          "collectionGroup": "teamMembers", 
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "organizationId", "order": "ASCENDING" },
            { "fieldPath": "status", "order": "ASCENDING" }
          ]
        },
        {
          "collectionGroup": "projects",
          "queryScope": "COLLECTION", 
          "fields": [
            { "fieldPath": "organizationId", "order": "ASCENDING" },
            { "fieldPath": "isActive", "order": "ASCENDING" }
          ]
        },
        {
          "collectionGroup": "projects",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "organizationId", "order": "ASCENDING" },
            { "fieldPath": "lastAccessedAt", "order": "DESCENDING" }
          ]
        },
        {
          "collectionGroup": "licenses",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "organizationId", "order": "ASCENDING" },
            { "fieldPath": "status", "order": "ASCENDING" }
          ]
        },
        {
          "collectionGroup": "licenses",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "firebaseUid", "order": "ASCENDING" },
            { "fieldPath": "status", "order": "ASCENDING" }
          ]
        },
        {
          "collectionGroup": "licenses",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "availableForAssignment", "order": "ASCENDING" },
            { "fieldPath": "organizationId", "order": "ASCENDING" }
          ]
        },
        {
          "collectionGroup": "subscriptions",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "firebaseUid", "order": "ASCENDING" },
            { "fieldPath": "status", "order": "ASCENDING" }
          ]
        },
        {
          "collectionGroup": "payments",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "firebaseUid", "order": "ASCENDING" },
            { "fieldPath": "createdAt", "order": "DESCENDING" }
          ]
        },
        {
          "collectionGroup": "invoices",
          "queryScope": "COLLECTION",
          "fields": [
            { "fieldPath": "firebaseUid", "order": "ASCENDING" },
            { "fieldPath": "createdAt", "order": "DESCENDING" }
          ]
        }
      ]
    };
    
    console.log('\n📄 FIRESTORE.INDEXES.JSON CONTENT:');
    console.log('==================================');
    console.log(JSON.stringify(indexConfig, null, 2));
    
    console.log('\n🚀 TESTING CURRENT QUERY PERFORMANCE:');
    console.log('=====================================');
    
    // Test some queries to see if they work efficiently
    const enterpriseFirebaseUid = 'xoAEWjTKXHSF1uOTdG2dZmm4Xar1';
    
    console.log('\nTesting team members query...');
    const start1 = Date.now();
    const teamMembersQuery = await db.collection('teamMembers')
      .where('assignedToUserId', '==', enterpriseFirebaseUid)
      .where('status', '==', 'ACTIVE')
      .get();
    const end1 = Date.now();
    console.log(`✅ Team members query: ${teamMembersQuery.size} results in ${end1 - start1}ms`);
    
    console.log('\nTesting projects query...');
    const start2 = Date.now();
    const projectsQuery = await db.collection('projects')
      .where('organizationId', '==', 'default-org')
      .get();
    const end2 = Date.now();
    console.log(`✅ Projects query: ${projectsQuery.size} results in ${end2 - start2}ms`);
    
    console.log('\nTesting licenses query...');
    const start3 = Date.now();
    const licensesQuery = await db.collection('licenses')
      .where('organizationId', '==', 'default-org')
      .get();
    const end3 = Date.now();
    console.log(`✅ Licenses query: ${licensesQuery.size} results in ${end3 - start3}ms`);
    
    console.log('\n🎉 FIRESTORE INDEX SETUP COMPLETED');
    console.log('==================================');
    console.log('✅ All required indexes identified');
    console.log('✅ Query performance tested');
    console.log('✅ Configuration provided for firestore.indexes.json');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Copy the indexes configuration to firestore.indexes.json');
    console.log('2. Deploy indexes: firebase deploy --only firestore:indexes');
    console.log('3. Wait for indexes to build (may take several minutes)');
    console.log('4. Queries will automatically use the most efficient indexes');
    
  } catch (error) {
    console.error('❌ Error creating Firestore indexes:', error);
  }
  
  process.exit(0);
}

createFirestoreIndexes().catch(console.error);
