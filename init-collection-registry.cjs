#!/usr/bin/env node

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function initializeRegistry() {
  try {
    console.log('📝 Initializing collection registry...');
    
    // Create system registry entry
    await db.collection('collectionRegistry').doc('_system').set({
      collectionName: '_system',
      displayName: 'System Registry',
      description: 'System collection registry initialization',
      organizationId: 'system',
      createdBy: 'system',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: false,
      isSystem: true,
      version: '1.0.0'
    });
    
    console.log('✅ Created collection registry');
    
    // Initialize required collections
    const collections = ['collectionActivityLogs', 'firestoreIndexes', 'securityRules'];
    
    for (const collectionName of collections) {
      await db.collection(collectionName).doc('_init').set({
        initialized: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Initialized ${collectionName} collection`);
    }
    
    console.log('🎉 Collection registry initialized successfully');
    console.log('');
    console.log('🚀 Collection Creation Wizard is ready!');
    console.log('📋 Access it at: https://backbone-logic.web.app');
    console.log('🎯 Navigate to Dashboard Cloud Projects → Actions → Create Collection');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize registry:', error);
    process.exit(1);
  }
}

initializeRegistry();

