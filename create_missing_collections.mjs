import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

async function createMissingCollections() {
  console.log('🔥 Creating missing licensing collections...');
  
  try {
    // Create payments collection
    console.log('Creating payments collection...');
    await db.collection('payments').doc('sample').set({
      id: 'sample-payment',
      userId: 'sample-user',
      subscriptionId: 'sample-subscription',
      amount: 2999,
      currency: 'USD',
      status: 'SUCCEEDED',
      stripePaymentIntentId: 'pi_sample',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Created payments collection');

    // Create orgMembers collection (for organization membership)
    console.log('Creating orgMembers collection...');
    await db.collection('orgMembers').doc('sample').set({
      id: 'sample-org-member',
      orgId: 'sample-org',
      userId: 'sample-user',
      role: 'MEMBER',
      status: 'ACTIVE',
      invitedBy: 'sample-admin',
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Created orgMembers collection');

    // Verify organizations collection has proper structure
    console.log('Updating organizations collection structure...');
    await db.collection('organizations').doc('sample').set({
      id: 'sample-org',
      name: 'Sample Organization',
      ownerUserId: 'sample-user',
      ownerId: 'sample-user', // For compatibility
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      maxMembers: 250,
      currentMembers: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Updated organizations collection');

    // Verify licenses collection has proper relationships
    console.log('Updating licenses collection structure...');
    await db.collection('licenses').doc('sample').set({
      id: 'sample-license',
      userId: 'sample-user',
      organizationId: 'sample-org',
      assignedToUserId: 'sample-user',
      subscriptionId: 'sample-subscription',
      licenseKey: 'SAMPLE-LICENSE-KEY',
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Updated licenses collection');

    // Verify subscriptions collection has proper relationships
    console.log('Updating subscriptions collection structure...');
    await db.collection('subscriptions').doc('sample').set({
      id: 'sample-subscription',
      userId: 'sample-user',
      organizationId: 'sample-org',
      tier: 'ENTERPRISE',
      status: 'ACTIVE',
      plan: 'enterprise-monthly',
      stripeSubscriptionId: 'sub_sample',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Updated subscriptions collection');

    // Create additional licensing collections that might be needed
    const additionalCollections = [
      'usageAnalytics',
      'licenseDeliveryLogs',
      'privacyConsents',
      'webhookEvents',
      'auditLogs'
    ];

    for (const collectionName of additionalCollections) {
      console.log(`Creating ${collectionName} collection...`);
      await db.collection(collectionName).doc('sample').set({
        id: `sample-${collectionName}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Created ${collectionName} collection`);
    }

    console.log('🎉 Successfully created all missing licensing collections!');
    
    // List all collections to verify
    const collections = await db.listCollections();
    const licensingCollections = ['licenses', 'subscriptions', 'payments', 'invoices', 'organizations', 'orgMembers'];
    console.log('\\n🔍 Licensing Collections Status:');
    licensingCollections.forEach(col => {
      const exists = collections.some(c => c.id === col);
      console.log('  ' + (exists ? '✅' : '❌') + ' ' + col);
    });

  } catch (error) {
    console.error('❌ Error creating collections:', error);
    throw error;
  }
}

// Run the creation
createMissingCollections()
  .then(() => {
    console.log('\\n🔥 LICENSING COLLECTIONS SETUP COMPLETE!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 SETUP FAILED:', error);
    process.exit(1);
  });
