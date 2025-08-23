#!/usr/bin/env node

/**
 * Create Enterprise Licenses Script
 * This script creates sample licenses for the enterprise user and organization
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin using Application Default Credentials
admin.initializeApp({
  projectId: 'backbone-logic'
});

const db = admin.firestore();

async function createEnterpriseLicenses() {
  try {
    console.log('🔍 Creating enterprise licenses...');
    
    // Step 1: Find the enterprise user
    const enterpriseUserQuery = await db.collection('users')
      .where('email', '==', 'enterprise.user@example.com')
      .limit(1)
      .get();
    
    if (enterpriseUserQuery.empty) {
      console.log('❌ Enterprise user not found');
      return;
    }
    
    const enterpriseUser = enterpriseUserQuery.docs[0];
    const enterpriseUserData = enterpriseUser.data();
    console.log('✅ Enterprise user found:', enterpriseUser.id, enterpriseUserData.email);
    
    const organizationId = 'C6L6jdoNbMs4QxcZ6IGI'; // Use the org ID from previous setup
    
    // Step 2: Create sample licenses
    const sampleLicenses = [
      {
        key: 'ENT-2024-001-MASTER',
        tier: 'ENTERPRISE',
        type: 'ENTERPRISE',
        status: 'ACTIVE',
        userId: enterpriseUser.id,
        organizationId: organizationId,
        maxActivations: 250,
        activationCount: 3,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        key: 'ENT-2024-002-TEAM-A',
        tier: 'PROFESSIONAL',
        type: 'PROFESSIONAL',
        status: 'ACTIVE',
        organizationId: organizationId,
        assignedToEmail: 'lissa@apple.com',
        maxActivations: 50,
        activationCount: 1,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        key: 'ENT-2024-003-TEAM-B',
        tier: 'PROFESSIONAL',
        type: 'PROFESSIONAL',
        status: 'ACTIVE',
        organizationId: organizationId,
        assignedToEmail: 'audrey.johnson@enterprise.com',
        maxActivations: 50,
        activationCount: 2,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        key: 'ENT-2024-004-BASIC',
        tier: 'BASIC',
        type: 'BASIC',
        status: 'ACTIVE',
        organizationId: organizationId,
        assignedToEmail: 'marcus.rodriguez@enterprise.com',
        maxActivations: 10,
        activationCount: 1,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        key: 'ENT-2024-005-SUSPENDED',
        tier: 'PROFESSIONAL',
        type: 'PROFESSIONAL',
        status: 'SUSPENDED',
        organizationId: organizationId,
        maxActivations: 50,
        activationCount: 0,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    ];
    
    console.log('\n🎫 Creating licenses...');
    
    for (const licenseData of sampleLicenses) {
      // Check if license already exists
      const existingLicenseQuery = await db.collection('licenses')
        .where('key', '==', licenseData.key)
        .limit(1)
        .get();
      
      if (existingLicenseQuery.empty) {
        const licenseRef = await db.collection('licenses').add({
          ...licenseData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          activatedAt: licenseData.status === 'ACTIVE' ? admin.firestore.FieldValue.serverTimestamp() : null
        });
        
        console.log(`   ✅ Created license: ${licenseData.key} (${licenseData.tier}) - ${licenseRef.id}`);
      } else {
        console.log(`   ⏭️  License already exists: ${licenseData.key}`);
      }
    }
    
    // Step 3: Verify the licenses
    console.log('\n🔍 Verifying licenses...');
    
    const licensesQuery = await db.collection('licenses')
      .where('organizationId', '==', organizationId)
      .get();
    
    console.log(`✅ licenses collection now has ${licensesQuery.size} licenses for organization ${organizationId}`);
    
    licensesQuery.forEach((doc, index) => {
      const data = doc.data();
      console.log(`  ${index + 1}. ${data.key} (${data.tier})`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Assigned to: ${data.assignedToEmail || data.userId || 'Unassigned'}`);
      console.log(`     Activations: ${data.activationCount}/${data.maxActivations}`);
      console.log('');
    });
    
    console.log('🎉 Enterprise licenses setup completed!');
    
  } catch (error) {
    console.error('❌ Error creating enterprise licenses:', error);
  }
}

// Run the setup
createEnterpriseLicenses().catch(console.error);
