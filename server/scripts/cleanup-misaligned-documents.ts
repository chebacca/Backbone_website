#!/usr/bin/env tsx

// Clean up misaligned documents and ensure proper structure
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';
import { getFirestore } from 'firebase-admin/firestore';

let db: ReturnType<typeof getFirestore>;

async function cleanupInvoicePayments(): Promise<void> {
  logger.info('🧹 Cleaning up misaligned invoice_payments...');
  
  const paymentsSnap = await db.collection('invoice_payments').get();
  
  for (const doc of paymentsSnap.docs) {
    const payment = doc.data();
    
    // Check if payment has proper userId
    if (!payment.userId) {
      logger.warn(`❌ Removing invoice payment ${doc.id}: missing userId`);
      await doc.ref.delete();
      continue;
    }
    
    // Check if referenced user exists
    const userDoc = await db.collection('users').doc(payment.userId).get();
    if (!userDoc.exists) {
      logger.warn(`❌ Removing invoice payment ${doc.id}: user ${payment.userId} not found`);
      await doc.ref.delete();
      continue;
    }
    
    // Check if referenced invoice exists (if invoiceId is specified)
    if (payment.invoiceId) {
      const invoiceDoc = await db.collection('invoices').doc(payment.invoiceId).get();
      if (!invoiceDoc.exists) {
        logger.warn(`❌ Removing invoice payment ${doc.id}: invoice ${payment.invoiceId} not found`);
        await doc.ref.delete();
        continue;
      }
    }
    
    logger.info(`✅ Invoice payment ${doc.id} is properly aligned`);
  }
}

async function cleanupInvoiceAttachments(): Promise<void> {
  logger.info('🧹 Cleaning up misaligned invoice_attachments...');
  
  const attachmentsSnap = await db.collection('invoice_attachments').get();
  
  for (const doc of attachmentsSnap.docs) {
    const attachment = doc.data();
    
    // Check if attachment has proper invoiceId
    if (!attachment.invoiceId) {
      logger.warn(`❌ Removing invoice attachment ${doc.id}: missing invoiceId`);
      await doc.ref.delete();
      continue;
    }
    
    // Check if referenced invoice exists
    const invoiceDoc = await db.collection('invoices').doc(attachment.invoiceId).get();
    if (!invoiceDoc.exists) {
      logger.warn(`❌ Removing invoice attachment ${doc.id}: invoice ${attachment.invoiceId} not found`);
      await doc.ref.delete();
      continue;
    }
    
    logger.info(`✅ Invoice attachment ${doc.id} is properly aligned`);
  }
}

async function validateSubscriptionLicenseChain(): Promise<void> {
  logger.info('🔗 Validating subscription-license chain integrity...');
  
  const subscriptionsSnap = await db.collection('subscriptions').get();
  
  for (const subDoc of subscriptionsSnap.docs) {
    const subscription = subDoc.data();
    
    // Ensure user exists
    const userDoc = await db.collection('users').doc(subscription.userId).get();
    if (!userDoc.exists) {
      logger.warn(`❌ Removing orphaned subscription ${subDoc.id}: user ${subscription.userId} not found`);
      await subDoc.ref.delete();
      continue;
    }
    
    const userData = userDoc.data();
    
    // Check for corresponding license
    const licenseSnap = await db.collection('licenses')
      .where('userId', '==', subscription.userId)
      .where('subscriptionId', '==', subDoc.id)
      .get();
    
    if (licenseSnap.empty) {
      logger.warn(`⚠️ Subscription ${subDoc.id} for ${userData?.email} has no corresponding license`);
    } else {
      logger.info(`✅ Subscription ${subDoc.id} for ${userData?.email} has proper license chain`);
    }
    
    // Check for corresponding invoice
    const invoiceSnap = await db.collection('invoices')
      .where('userId', '==', subscription.userId)
      .where('subscriptionId', '==', subDoc.id)
      .get();
    
    if (invoiceSnap.empty) {
      logger.warn(`⚠️ Subscription ${subDoc.id} for ${userData?.email} has no corresponding invoice`);
    } else {
      logger.info(`✅ Subscription ${subDoc.id} for ${userData?.email} has proper invoice chain`);
    }
    
    // Check for corresponding payment
    const paymentSnap = await db.collection('payments')
      .where('userId', '==', subscription.userId)
      .where('subscriptionId', '==', subDoc.id)
      .get();
    
    if (paymentSnap.empty) {
      logger.warn(`⚠️ Subscription ${subDoc.id} for ${userData?.email} has no corresponding payment`);
    } else {
      logger.info(`✅ Subscription ${subDoc.id} for ${userData?.email} has proper payment chain`);
    }
  }
}

async function validateLicenseIntegrity(): Promise<void> {
  logger.info('🔑 Validating license integrity...');
  
  const licensesSnap = await db.collection('licenses').get();
  
  for (const licenseDoc of licensesSnap.docs) {
    const license = licenseDoc.data();
    
    // Ensure user exists
    const userDoc = await db.collection('users').doc(license.userId).get();
    if (!userDoc.exists) {
      logger.warn(`❌ Removing orphaned license ${licenseDoc.id}: user ${license.userId} not found`);
      await licenseDoc.ref.delete();
      continue;
    }
    
    const userData = userDoc.data();
    
    // Ensure subscription exists (if subscriptionId is specified)
    if (license.subscriptionId) {
      const subDoc = await db.collection('subscriptions').doc(license.subscriptionId).get();
      if (!subDoc.exists) {
        logger.warn(`❌ License ${licenseDoc.id} for ${userData?.email}: subscription ${license.subscriptionId} not found`);
        // Don't delete the license, just log the issue
      } else {
        logger.info(`✅ License ${licenseDoc.id} for ${userData?.email} has valid subscription reference`);
      }
    }
    
    // Validate license key format
    if (!license.key || !license.key.startsWith('LIC-')) {
      logger.warn(`⚠️ License ${licenseDoc.id} for ${userData?.email} has invalid key format: ${license.key}`);
    }
    
    // Validate tier
    if (!['BASIC', 'PRO', 'ENTERPRISE'].includes(license.tier)) {
      logger.warn(`⚠️ License ${licenseDoc.id} for ${userData?.email} has invalid tier: ${license.tier}`);
    }
  }
}

async function ensurePaymentUserEmbedding(): Promise<void> {
  logger.info('👤 Ensuring payment documents have embedded user info...');
  
  const paymentsSnap = await db.collection('payments').get();
  
  for (const paymentDoc of paymentsSnap.docs) {
    const payment = paymentDoc.data();
    
    if (!payment.userId) continue;
    
    const userDoc = await db.collection('users').doc(payment.userId).get();
    if (!userDoc.exists) continue;
    
    const userData = userDoc.data();
    const expectedUserInfo = {
      email: userData?.email,
      name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || userData?.email?.split('@')[0]
    };
    
    // Check if user info is missing or incorrect
    if (!payment.user || 
        payment.user.email !== expectedUserInfo.email || 
        payment.user.name !== expectedUserInfo.name) {
      
      logger.info(`🔄 Updating user info for payment ${paymentDoc.id}: ${expectedUserInfo.email}`);
      await paymentDoc.ref.update({
        user: expectedUserInfo,
        updatedAt: new Date()
      });
    } else {
      logger.info(`✅ Payment ${paymentDoc.id} has correct user embedding`);
    }
  }
}

async function generateSummaryReport(): Promise<void> {
  logger.info('📊 Generating collection summary report...');
  
  const collections = ['users', 'subscriptions', 'licenses', 'invoices', 'payments', 'invoice_payments', 'invoice_attachments'];
  
  for (const collectionName of collections) {
    const snap = await db.collection(collectionName).get();
    logger.info(`📋 ${collectionName}: ${snap.size} documents`);
    
    if (collectionName === 'users') {
      const roles: Record<string, number> = {};
      snap.forEach(doc => {
        const role = doc.data().role || 'UNKNOWN';
        roles[role] = (roles[role] || 0) + 1;
      });
      logger.info(`   Roles: ${Object.entries(roles).map(([role, count]) => `${role}(${count})`).join(', ')}`);
    }
    
    if (collectionName === 'subscriptions') {
      const tiers: Record<string, number> = {};
      const statuses: Record<string, number> = {};
      snap.forEach(doc => {
        const data = doc.data();
        const tier = data.tier || 'UNKNOWN';
        const status = data.status || 'UNKNOWN';
        tiers[tier] = (tiers[tier] || 0) + 1;
        statuses[status] = (statuses[status] || 0) + 1;
      });
      logger.info(`   Tiers: ${Object.entries(tiers).map(([tier, count]) => `${tier}(${count})`).join(', ')}`);
      logger.info(`   Statuses: ${Object.entries(statuses).map(([status, count]) => `${status}(${count})`).join(', ')}`);
    }
    
    if (collectionName === 'payments') {
      const statuses: Record<string, number> = {};
      let totalRevenue = 0;
      snap.forEach(doc => {
        const data = doc.data();
        const status = data.status || 'UNKNOWN';
        statuses[status] = (statuses[status] || 0) + 1;
        if (status === 'succeeded' && typeof data.amount === 'number') {
          totalRevenue += data.amount;
        }
      });
      logger.info(`   Statuses: ${Object.entries(statuses).map(([status, count]) => `${status}(${count})`).join(', ')}`);
      logger.info(`   Total Revenue: $${totalRevenue}`);
    }
  }
}

async function main() {
  try {
    const isDryRun = process.argv.includes('--dry-run');
    
    // Initialize Firestore
    await import('../src/services/firestoreService.js');
    db = getFirestore();
    
    if (isDryRun) {
      logger.info('🔍 DRY RUN: Analyzing document cleanup (no changes will be made)...');
    } else {
      logger.info('🧹 Starting comprehensive document cleanup...');
    }
    
    if (!isDryRun) {
      // Clean up misaligned documents
      await cleanupInvoicePayments();
      await cleanupInvoiceAttachments();
      
      // Ensure proper user embedding
      await ensurePaymentUserEmbedding();
    }
    
    // Validate integrity (read-only operations)
    await validateSubscriptionLicenseChain();
    await validateLicenseIntegrity();
    
    // Generate summary report
    await generateSummaryReport();
    
    logger.info('✅ Document cleanup and validation complete!');
    
    if (isDryRun) {
      logger.info('💡 Run without --dry-run to apply cleanup operations');
    } else {
      logger.info('🎯 All collections are now properly cleaned and aligned');
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Document cleanup failed:', error);
    process.exit(1);
  }
}

main();
