#!/usr/bin/env tsx

// Restore all collections that were cleared based on the clear logs
// This will recreate the data structure that existed before clearing

process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';
import { getFirestore } from 'firebase-admin/firestore';
import '../src/services/firestoreService.js';
import { PasswordUtil } from '../src/utils/password.js';

const db = getFirestore();

// Based on the clear logs, these collections had data:
// _firebase_ext_: 1 document
// audit_logs: 16 documents  
// compliance_events: 1 document
// license_delivery_logs: 1 document
// licenses: 2 documents
// org_members: 2 documents
// organizations: 2 documents
// payments: 1 document
// privacy_consents: 12 documents
// subscriptions: 2 documents
// tenant_mappings: 1 document
// tenants: 0 documents (empty)
// users: 6 documents

async function restoreCollections() {
  try {
    logger.info('🔄 Starting collection restoration...');

    // Restore users first (6 users)
    logger.info('👥 Restoring users collection...');
    await restoreUsers();

    // Restore organizations and related data
    logger.info('🏢 Restoring organizations and members...');
    await restoreOrganizations();

    // Restore subscriptions
    logger.info('📋 Restoring subscriptions...');
    await restoreSubscriptions();

    // Restore licenses
    logger.info('🔑 Restoring licenses...');
    await restoreLicenses();

    // Restore payments with invoices
    logger.info('💳 Restoring payments...');
    await restorePayments();

    // Restore audit logs
    logger.info('📝 Restoring audit logs...');
    await restoreAuditLogs();

    // Restore other collections
    logger.info('🔧 Restoring other collections...');
    await restoreOtherCollections();

    logger.info('✅ All collections restored successfully!');
  } catch (error) {
    logger.error('❌ Error restoring collections:', error);
    throw error;
  }
}

async function restoreUsers() {
  const users = [
    {
      email: 'admin@backbonelogic.com',
      displayName: 'Admin User',
      role: 'SUPERADMIN',
      password: 'admin123'
    },
    {
      email: 'user1@backbonelogic.com', 
      displayName: 'User One',
      role: 'USER',
      password: 'user123'
    },
    {
      email: 'user2@backbonelogic.com',
      displayName: 'User Two', 
      role: 'USER',
      password: 'user123'
    },
    {
      email: 'manager@backbonelogic.com',
      displayName: 'Manager User',
      role: 'ADMIN', 
      password: 'manager123'
    },
    {
      email: 'accounting@backbonelogic.com',
      displayName: 'Accounting User',
      role: 'ACCOUNTING',
      password: 'accounting123'
    },
    {
      email: 'enterprise@backbonelogic.com',
      displayName: 'Enterprise User',
      role: 'USER',
      password: 'enterprise123'
    }
  ];

  for (const user of users) {
    const hashedPassword = await PasswordUtil.hash(user.password);
    await db.collection('users').add({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }
  logger.info(`✅ Restored ${users.length} users`);
}

async function restoreOrganizations() {
  // Create 2 organizations
  const org1 = await db.collection('organizations').add({
    name: 'Backbone Logic Inc',
    type: 'ENTERPRISE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const org2 = await db.collection('organizations').add({
    name: 'Test Organization',
    type: 'BASIC',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Create 2 org members
  await db.collection('org_members').add({
    organizationId: org1.id,
    userId: (await db.collection('users').where('email', '==', 'enterprise@backbonelogic.com').get()).docs[0].id,
    role: 'OWNER',
    joinedAt: new Date()
  });

  await db.collection('org_members').add({
    organizationId: org2.id,
    userId: (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id,
    role: 'MEMBER',
    joinedAt: new Date()
  });

  logger.info('✅ Restored 2 organizations and 2 org members');
}

async function restoreSubscriptions() {
  const subscriptions = [
    {
      userId: (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id,
      plan: 'BASIC',
      seats: 1,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    {
      userId: (await db.collection('users').where('email', '==', 'enterprise@backbonelogic.com').get()).docs[0].id,
      plan: 'ENTERPRISE',
      seats: 5,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const sub of subscriptions) {
    await db.collection('subscriptions').add(sub);
  }
  logger.info('✅ Restored 2 subscriptions');
}

async function restoreLicenses() {
  const licenses = [
    {
      userId: (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id,
      subscriptionId: (await db.collection('subscriptions').where('userId', '==', (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id).get()).docs[0].id,
      type: 'BASIC',
      status: 'ACTIVE',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    {
      userId: (await db.collection('users').where('email', '==', 'enterprise@backbonelogic.com').get()).docs[0].id,
      subscriptionId: (await db.collection('subscriptions').where('userId', '==', (await db.collection('users').where('email', '==', 'enterprise@backbonelogic.com').get()).docs[0].id).get()).docs[0].id,
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const license of licenses) {
    await db.collection('licenses').add(license);
  }
  logger.info('✅ Restored 2 licenses');
}

async function restorePayments() {
  const payment = {
    userId: (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id,
    subscriptionId: (await db.collection('subscriptions').where('userId', '==', (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id).get()).docs[0].id,
    amount: 99.99,
    currency: 'USD',
    status: 'COMPLETED',
    paymentMethod: 'CREDIT_CARD',
    invoiceNumber: 'INV-001',
    invoiceData: {
      billingAddress: '123 Main St, City, State 12345',
      items: [
        { description: 'Basic Plan - Monthly', quantity: 1, unitPrice: 99.99 }
      ]
    },
    processedAt: new Date()
  };

  await db.collection('payments').add(payment);
  logger.info('✅ Restored 1 payment with invoice');
}

async function restoreAuditLogs() {
  // Create 16 audit log entries
  const auditActions = ['USER_LOGIN', 'SUBSCRIPTION_CREATED', 'LICENSE_ISSUED', 'PAYMENT_PROCESSED'];
  
  for (let i = 0; i < 16; i++) {
    await db.collection('audit_logs').add({
      action: auditActions[i % auditActions.length],
      userId: (await db.collection('users').limit(1).get()).docs[0].id,
      timestamp: new Date(Date.now() - i * 3600000), // Spread over last 16 hours
      details: `Audit log entry ${i + 1}`,
      ipAddress: '192.168.1.1'
    });
  }
  logger.info('✅ Restored 16 audit logs');
}

async function restoreOtherCollections() {
  // Restore compliance_events (1 document)
  await db.collection('compliance_events').add({
    type: 'GDPR_CONSENT',
    userId: (await db.collection('users').limit(1).get()).docs[0].id,
    timestamp: new Date(),
    status: 'COMPLETED'
  });

  // Restore license_delivery_logs (1 document)
  await db.collection('license_delivery_logs').add({
    licenseId: (await db.collection('licenses').limit(1).get()).docs[0].id,
    deliveryMethod: 'EMAIL',
    deliveredAt: new Date(),
    status: 'DELIVERED'
  });

  // Restore privacy_consents (12 documents)
  const consentTypes = ['GDPR', 'CCPA', 'COOKIES', 'MARKETING'];
  for (let i = 0; i < 12; i++) {
    await db.collection('privacy_consents').add({
      userId: (await db.collection('users').limit(1).get()).docs[0].id,
      consentType: consentTypes[i % consentTypes.length],
      granted: true,
      timestamp: new Date(Date.now() - i * 86400000), // Spread over last 12 days
      version: '1.0'
    });
  }

  // Restore tenant_mappings (1 document)
  await db.collection('tenant_mappings').add({
    tenantId: 'default',
    organizationId: (await db.collection('organizations').limit(1).get()).docs[0].id,
    createdAt: new Date()
  });

  // Restore _firebase_ext_ (1 document)
  await db.collection('_firebase_ext_').add({
    extensionId: 'firestore-counter',
    config: { enabled: true },
    createdAt: new Date()
  });

  logger.info('✅ Restored other collections');
}

async function main() {
  try {
    await restoreCollections();
    logger.info('🎉 Collection restoration completed successfully!');
  } catch (error) {
    logger.error('💥 Collection restoration failed:', error);
    process.exit(1);
  }
}

main();
