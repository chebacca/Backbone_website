#!/usr/bin/env node

/**
 * Create Test Dataset for Enterprise User
 * 
 * This script creates a test dataset in Firestore for the enterprise user
 * to verify the UI is working properly.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with Application Default Credentials
admin.initializeApp({
  projectId: 'backbone-logic',
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function createTestDataset() {
  try {
    console.log('📊 Creating test dataset for enterprise user...\n');
    
    const userId = 'l5YKvrhAD72EV2MnugbS';
    const organizationId = '24H6zaiCUycuT8ukx9Jz';
    
    // Create a test dataset
    const datasetData = {
      name: 'Enterprise Test Dataset 2025',
      description: 'A test dataset to verify the Cloud Projects UI is working properly',
      provider: 'firestore',
      visibility: 'private',
      schema: 'Backbone Logic Unified Schema',
      organizationId: organizationId,
      ownerId: userId,
      status: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
      storage: {
        type: 'firestore',
        collection: 'enterprise_test_data',
        compression: 'none',
        encryption: 'standard'
      },
      metadata: {
        createdBy: userId,
        source: 'test-script',
        version: '1.0.0',
        tags: ['test', 'enterprise', 'verification']
      },
      statistics: {
        recordCount: 0,
        sizeBytes: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }
    };
    
    console.log('📋 Dataset data:', JSON.stringify(datasetData, null, 2));
    
    // Add the dataset to Firestore
    const datasetRef = await db.collection('datasets').add(datasetData);
    
    console.log('✅ Dataset created successfully!');
    console.log('   Dataset ID:', datasetRef.id);
    console.log('   Name:', datasetData.name);
    console.log('   Organization ID:', datasetData.organizationId);
    
    return datasetRef.id;
    
  } catch (error) {
    console.error('❌ Failed to create dataset:', error.message);
    throw error;
  }
}

// Run the creation
createTestDataset().then((datasetId) => {
  console.log('\n🎯 Test dataset creation completed!');
  console.log('   Dataset ID:', datasetId);
  console.log('   The dataset should now appear in the Cloud Projects UI');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Dataset creation failed:', error);
  process.exit(1);
});
