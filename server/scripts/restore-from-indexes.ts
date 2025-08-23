#!/usr/bin/env tsx

// Restore all collections based on Firestore composite indexes
// This creates a comprehensive database structure matching the original system

process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getFirestore } from 'firebase-admin/firestore';
import '../src/services/firestoreService.js';
import { logger } from '../src/utils/logger.js';
import { PasswordUtil } from '../src/utils/password.js';

const db = getFirestore();

// Collections identified from composite indexes:
const COLLECTIONS_FROM_INDEXES = [
  'activities',
  'audit_log', 
  'datasets',
  'license_delivery_logs',
  'licenses',
  'notifications',
  'orgMembers',
  'org_members',
  'organizations',
  'payments',
  'privacy_consents',
  'projectTeamMembers',
  'project_participants',
  'projects',
  'sdk_versions',
  'sessions',
  'subscriptions',
  'teamMembers',
  'usage_analytics',
  'user_settingss', // Note: typo in index name
  'user_time_cards',
  'users',
  'webhook_events',
  'workflow_diagrams'
];

async function restoreComprehensiveDatabase() {
  try {
    logger.info('🔄 Starting comprehensive database restoration from indexes...');

    // Core user and auth data
    await restoreUsers();
    await restoreOrganizations();
    await restoreSubscriptions();
    await restoreLicenses();
    await restorePayments();

    // Project management system
    await restoreProjects();
    await restoreDatasets();
    await restoreSessions();
    await restoreActivities();

    // Team management
    await restoreTeamMembers();
    await restoreProjectTeamMembers();
    await restoreProjectParticipants();

    // Notifications and communications
    await restoreNotifications();
    await restoreWorkflowDiagrams();

    // Analytics and monitoring
    await restoreUsageAnalytics();
    await restoreUserTimeCards();
    await restoreAuditLogs();

    // System and configuration
    await restoreSDKVersions();
    await restoreUserSettings();
    await restoreWebhookEvents();

    // Compliance and privacy
    await restorePrivacyConsents();
    await restoreLicenseDeliveryLogs();

    logger.info('✅ Comprehensive database restoration completed!');
  } catch (error) {
    logger.error('❌ Error in comprehensive restoration:', error);
    throw error;
  }
}

async function restoreUsers() {
  logger.info('👥 Restoring users...');
  const users = [
    { email: 'admin@backbonelogic.com', displayName: 'Admin User', role: 'SUPERADMIN', password: 'admin123' },
    { email: 'user1@backbonelogic.com', displayName: 'User One', role: 'USER', password: 'user123' },
    { email: 'user2@backbonelogic.com', displayName: 'User Two', role: 'USER', password: 'user123' },
    { email: 'manager@backbonelogic.com', displayName: 'Manager User', role: 'ADMIN', password: 'manager123' },
    { email: 'accounting@backbonelogic.com', displayName: 'Accounting User', role: 'ACCOUNTING', password: 'accounting123' },
    { email: 'enterprise@backbonelogic.com', displayName: 'Enterprise User', role: 'USER', password: 'enterprise123' }
  ];

  for (const user of users) {
    const hashedPassword = await PasswordUtil.hash(user.password);
    await db.collection('users').add({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isEmailVerified: true,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      privacyConsent: [],
      marketingConsent: false,
      dataProcessingConsent: true,
      identityVerified: false,
      kycStatus: 'PENDING'
    });
  }
  logger.info(`✅ Restored ${users.length} users`);
}

async function restoreOrganizations() {
  logger.info('🏢 Restoring organizations...');
  
  const org1 = await db.collection('organizations').add({
    name: 'Backbone Logic Inc',
    type: 'ENTERPRISE',
    ownerUserId: (await db.collection('users').where('email', '==', 'enterprise@backbonelogic.com').get()).docs[0].id,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  });

  const org2 = await db.collection('organizations').add({
    name: 'Test Organization',
    type: 'BASIC',
    ownerUserId: (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  });

  // Create org_members
  await db.collection('org_members').add({
    orgId: org1.id,
    userId: (await db.collection('users').where('email', '==', 'enterprise@backbonelogic.com').get()).docs[0].id,
    role: 'OWNER',
    status: 'ACTIVE',
    createdAt: new Date()
  });

  await db.collection('org_members').add({
    orgId: org2.id,
    userId: (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id,
    role: 'MEMBER',
    status: 'ACTIVE',
    createdAt: new Date()
  });

  logger.info('✅ Restored 2 organizations and org members');
}

async function restoreSubscriptions() {
  logger.info('📋 Restoring subscriptions...');
  
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
  logger.info('🔑 Restoring licenses...');
  
  const user1Id = (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id;
  const enterpriseUserId = (await db.collection('users').where('email', '==', 'enterprise@backbonelogic.com').get()).docs[0].id;
  const org1Id = (await db.collection('organizations').where('name', '==', 'Backbone Logic Inc').get()).docs[0].id;

  const licenses = [
    {
      userId: user1Id,
      subscriptionId: (await db.collection('subscriptions').where('userId', '==', user1Id).get()).docs[0].id,
      type: 'BASIC',
      status: 'ACTIVE',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    },
    {
      userId: enterpriseUserId,
      organizationId: org1Id,
      subscriptionId: (await db.collection('subscriptions').where('userId', '==', enterpriseUserId).get()).docs[0].id,
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    }
  ];

  for (const license of licenses) {
    await db.collection('licenses').add(license);
  }
  logger.info('✅ Restored 2 licenses');
}

async function restorePayments() {
  logger.info('💳 Restoring payments...');
  
  const user1Id = (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id;
  const subscriptionId = (await db.collection('subscriptions').where('userId', '==', user1Id).get()).docs[0].id;

  await db.collection('payments').add({
    userId: user1Id,
    subscriptionId: subscriptionId,
    amount: 99.99,
    currency: 'USD',
    status: 'COMPLETED',
    paymentMethod: 'CREDIT_CARD',
    invoiceNumber: 'INV-001',
    invoiceData: {
      billingAddress: '123 Main St, City, State 12345',
      items: [{ description: 'Basic Plan - Monthly', quantity: 1, unitPrice: 99.99 }]
    },
    processedAt: new Date(),
    createdAt: new Date()
  });

  logger.info('✅ Restored 1 payment');
}

async function restoreProjects() {
  logger.info('📁 Restoring projects...');
  
  const user1Id = (await db.collection('users').where('email', '==', 'user1@backbonelogic.com').get()).docs[0].id;
  const enterpriseUserId = (await db.collection('users').where('email', '==', 'enterprise@backbonelogic.com').get()).docs[0].id;
  const org1Id = (await db.collection('organizations').where('name', '==', 'Backbone Logic Inc').get()).docs[0].id;

  const projects = [
    {
      name: 'Sample Project 1',
      description: 'A basic project for testing',
      type: 'BASIC',
      ownerId: user1Id,
      ownerName: 'User One',
      status: 'ACTIVE',
      visibility: 'PRIVATE',
      isActive: true,
      isArchived: false,
      applicationMode: 'PRODUCTION',
      maxCollaborators: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessedAt: new Date()
    },
    {
      name: 'Enterprise Project',
      description: 'An enterprise-level project',
      type: 'ENTERPRISE',
      ownerId: enterpriseUserId,
      ownerName: 'Enterprise User',
      organizationId: org1Id,
      status: 'ACTIVE',
      visibility: 'ORGANIZATION',
      isActive: true,
      isArchived: false,
      applicationMode: 'PRODUCTION',
      maxCollaborators: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessedAt: new Date()
    }
  ];

  for (const project of projects) {
    await db.collection('projects').add(project);
  }
  logger.info('✅ Restored 2 projects');
}

async function restoreDatasets() {
  logger.info('📊 Restoring datasets...');
  
  const projects = await db.collection('projects').get();
  
  for (const project of projects.docs) {
    await db.collection('datasets').add({
      projectId: project.id,
      name: `Dataset for ${project.data().name}`,
      description: 'Sample dataset',
      type: 'CSV',
      size: 1024000,
      recordCount: 1000,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  logger.info('✅ Restored datasets');
}

async function restoreSessions() {
  logger.info('🔗 Restoring sessions...');
  
  const users = await db.collection('users').get();
  const projects = await db.collection('projects').get();
  
  for (let i = 0; i < 5; i++) {
    const user = users.docs[i % users.docs.length];
    const project = projects.docs[i % projects.docs.length];
    
    await db.collection('sessions').add({
      userId: user.id,
      projectId: project.id,
      status: i % 2 === 0 ? 'ACTIVE' : 'COMPLETED',
      startTime: new Date(Date.now() - i * 3600000),
      endTime: i % 2 === 0 ? null : new Date(Date.now() - i * 1800000),
      duration: i % 2 === 0 ? null : 1800,
      createdAt: new Date(Date.now() - i * 3600000)
    });
  }
  logger.info('✅ Restored 5 sessions');
}

async function restoreActivities() {
  logger.info('📈 Restoring activities...');
  
  const users = await db.collection('users').get();
  const projects = await db.collection('projects').get();
  
  const activityTypes = ['LOGIN', 'PROJECT_CREATED', 'DATA_UPLOADED', 'REPORT_GENERATED', 'SETTINGS_UPDATED'];
  
  for (let i = 0; i < 10; i++) {
    const user = users.docs[i % users.docs.length];
    const project = projects.docs[i % projects.docs.length];
    
    await db.collection('activities').add({
      userId: user.id,
      projectId: project.id,
      type: activityTypes[i % activityTypes.length],
      description: `User performed ${activityTypes[i % activityTypes.length]}`,
      metadata: { source: 'web', version: '1.0' },
      createdAt: new Date(Date.now() - i * 3600000)
    });
  }
  logger.info('✅ Restored 10 activities');
}

async function restoreTeamMembers() {
  logger.info('👥 Restoring team members...');
  
  const org1Id = (await db.collection('organizations').where('name', '==', 'Backbone Logic Inc').get()).docs[0].id;
  
  const teamMembers = [
    {
      name: 'John Doe',
      email: 'john.doe@backbonelogic.com',
      role: 'DEVELOPER',
      status: 'ACTIVE',
      orgId: org1Id,
      organizationId: org1Id,
      joinedAt: new Date(),
      createdAt: new Date()
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@backbonelogic.com',
      role: 'DESIGNER',
      status: 'ACTIVE',
      orgId: org1Id,
      organizationId: org1Id,
      joinedAt: new Date(),
      createdAt: new Date()
    }
  ];

  for (const member of teamMembers) {
    await db.collection('teamMembers').add(member);
  }
  logger.info('✅ Restored 2 team members');
}

async function restoreProjectTeamMembers() {
  logger.info('🤝 Restoring project team members...');
  
  const projects = await db.collection('projects').get();
  const teamMembers = await db.collection('teamMembers').get();
  
  for (const project of projects.docs) {
    for (const member of teamMembers.docs) {
      await db.collection('projectTeamMembers').add({
        projectId: project.id,
        teamMemberId: member.id,
        role: 'CONTRIBUTOR',
        isActive: true,
        assignedAt: new Date()
      });
    }
  }
  logger.info('✅ Restored project team member assignments');
}

async function restoreProjectParticipants() {
  logger.info('👤 Restoring project participants...');
  
  const projects = await db.collection('projects').get();
  const users = await db.collection('users').get();
  
  for (const project of projects.docs) {
    const user = users.docs[0]; // Assign first user as participant
    await db.collection('project_participants').add({
      projectId: project.id,
      userId: user.id,
      role: 'VIEWER',
      isActive: true,
      joinedAt: new Date()
    });
  }
  logger.info('✅ Restored project participants');
}

async function restoreNotifications() {
  logger.info('🔔 Restoring notifications...');
  
  const users = await db.collection('users').get();
  const notificationTypes = ['INFO', 'WARNING', 'SUCCESS', 'ERROR'];
  
  for (let i = 0; i < 8; i++) {
    const user = users.docs[i % users.docs.length];
    await db.collection('notifications').add({
      userId: user.id,
      type: notificationTypes[i % notificationTypes.length],
      title: `Notification ${i + 1}`,
      message: `This is notification message ${i + 1}`,
      read: i % 3 === 0,
      createdAt: new Date(Date.now() - i * 3600000)
    });
  }
  logger.info('✅ Restored 8 notifications');
}

async function restoreWorkflowDiagrams() {
  logger.info('📋 Restoring workflow diagrams...');
  
  const users = await db.collection('users').get();
  
  for (let i = 0; i < 3; i++) {
    const user = users.docs[i % users.docs.length];
    await db.collection('workflow_diagrams').add({
      userId: user.id,
      name: `Workflow Diagram ${i + 1}`,
      description: `Sample workflow diagram ${i + 1}`,
      diagramData: { nodes: [], edges: [] },
      version: '1.0',
      createdAt: new Date(Date.now() - i * 86400000)
    });
  }
  logger.info('✅ Restored 3 workflow diagrams');
}

async function restoreUsageAnalytics() {
  logger.info('📊 Restoring usage analytics...');
  
  const users = await db.collection('users').get();
  const licenses = await db.collection('licenses').get();
  
  for (let i = 0; i < 20; i++) {
    const user = users.docs[i % users.docs.length];
    const license = licenses.docs[i % licenses.docs.length];
    
    await db.collection('usage_analytics').add({
      userId: user.id,
      licenseId: license.id,
      action: 'API_CALL',
      endpoint: '/api/data/process',
      duration: Math.floor(Math.random() * 1000),
      timestamp: new Date(Date.now() - i * 3600000),
      metadata: { userAgent: 'BackboneApp/1.0' }
    });
  }
  logger.info('✅ Restored 20 usage analytics records');
}

async function restoreUserTimeCards() {
  logger.info('⏰ Restoring user time cards...');
  
  const users = await db.collection('users').get();
  
  for (let i = 0; i < 14; i++) { // 2 weeks of data
    for (const user of users.docs) {
      await db.collection('user_time_cards').add({
        userId: user.id,
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        hoursWorked: 8,
        status: i % 7 < 5 ? 'SUBMITTED' : 'DRAFT', // Weekdays submitted
        tasks: [
          { description: 'Development work', hours: 6 },
          { description: 'Meetings', hours: 2 }
        ],
        createdAt: new Date(Date.now() - i * 86400000)
      });
    }
  }
  logger.info('✅ Restored user time cards');
}

async function restoreAuditLogs() {
  logger.info('📝 Restoring audit logs...');
  
  const users = await db.collection('users').get();
  const projects = await db.collection('projects').get();
  const auditActions = ['USER_LOGIN', 'PROJECT_CREATED', 'DATA_UPLOADED', 'SETTINGS_CHANGED', 'LICENSE_ISSUED'];
  
  for (let i = 0; i < 25; i++) {
    const user = users.docs[i % users.docs.length];
    const project = projects.docs[i % projects.docs.length];
    
    await db.collection('audit_log').add({
      userId: user.id,
      projectId: project.id,
      action: auditActions[i % auditActions.length],
      details: `Audit log entry ${i + 1}`,
      ipAddress: '192.168.1.' + (i % 255),
      userAgent: 'BackboneApp/1.0',
      createdAt: new Date(Date.now() - i * 3600000)
    });
  }
  logger.info('✅ Restored 25 audit log entries');
}

async function restoreSDKVersions() {
  logger.info('🔧 Restoring SDK versions...');
  
  const platforms = ['web', 'ios', 'android', 'desktop'];
  
  for (const platform of platforms) {
    await db.collection('sdk_versions').add({
      platform: platform,
      version: '1.0.0',
      isLatest: true,
      releaseDate: new Date(),
      downloadUrl: `https://releases.backbonelogic.com/${platform}/1.0.0`,
      changelog: 'Initial release',
      createdAt: new Date()
    });
  }
  logger.info('✅ Restored SDK versions');
}

async function restoreUserSettings() {
  logger.info('⚙️ Restoring user settings...');
  
  const users = await db.collection('users').get();
  
  for (const user of users.docs) {
    await db.collection('user_settingss').add({ // Note: keeping typo from index
      userId: user.id,
      theme: 'light',
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      privacy: {
        profileVisible: true,
        activityVisible: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  logger.info('✅ Restored user settings');
}

async function restoreWebhookEvents() {
  logger.info('🔗 Restoring webhook events...');
  
  for (let i = 0; i < 5; i++) {
    await db.collection('webhook_events').add({
      eventType: 'user.created',
      payload: { userId: 'sample-user-id', action: 'created' },
      processed: i % 2 === 0,
      retryCount: i % 3,
      createdAt: new Date(Date.now() - i * 3600000),
      processedAt: i % 2 === 0 ? new Date(Date.now() - i * 3600000 + 60000) : null
    });
  }
  logger.info('✅ Restored 5 webhook events');
}

async function restorePrivacyConsents() {
  logger.info('🔒 Restoring privacy consents...');
  
  const users = await db.collection('users').get();
  const consentTypes = ['GDPR', 'CCPA', 'COOKIES', 'MARKETING'];
  
  for (const user of users.docs) {
    for (const consentType of consentTypes) {
      await db.collection('privacy_consents').add({
        userId: user.id,
        consentType: consentType,
        granted: true,
        consentDate: new Date(),
        version: '1.0',
        ipAddress: '192.168.1.1',
        userAgent: 'BackboneApp/1.0'
      });
    }
  }
  logger.info('✅ Restored privacy consents');
}

async function restoreLicenseDeliveryLogs() {
  logger.info('📦 Restoring license delivery logs...');
  
  const licenses = await db.collection('licenses').get();
  const payments = await db.collection('payments').get();
  
  for (const license of licenses.docs) {
    const payment = payments.docs[0]; // Use first payment
    await db.collection('license_delivery_logs').add({
      licenseId: license.id,
      paymentId: payment.id,
      deliveryMethod: 'EMAIL',
      deliveredAt: new Date(),
      status: 'DELIVERED',
      recipientEmail: 'user@example.com',
      createdAt: new Date()
    });
  }
  logger.info('✅ Restored license delivery logs');
}

async function main() {
  try {
    await restoreComprehensiveDatabase();
    logger.info('🎉 Comprehensive database restoration completed successfully!');
    
    // Summary
    const collections = await Promise.all(
      COLLECTIONS_FROM_INDEXES.map(async (collectionName) => {
        try {
          const snapshot = await db.collection(collectionName).get();
          return { name: collectionName, count: snapshot.size };
        } catch (error) {
          return { name: collectionName, count: 0, error: true };
        }
      })
    );
    
    logger.info('📊 Collection Summary:');
    collections.forEach(({ name, count, error }) => {
      if (error) {
        logger.info(`  ❌ ${name}: Error reading collection`);
      } else {
        logger.info(`  ✅ ${name}: ${count} documents`);
      }
    });
    
  } catch (error) {
    logger.error('💥 Comprehensive restoration failed:', error);
    process.exit(1);
  }
}

main();
