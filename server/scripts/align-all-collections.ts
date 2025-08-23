#!/usr/bin/env tsx

// Comprehensive script to align all invoice, payment, subscription, and license collections with users
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

let db: ReturnType<typeof getFirestore>;

interface UserData {
  id: string;
  email: string;
  firebaseUid: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

async function getAllUsers(): Promise<UserData[]> {
  const usersSnap = await db.collection('users').get();
  const users: UserData[] = [];
  
  usersSnap.forEach(doc => {
    const data = doc.data();
    users.push({
      id: doc.id,
      email: data.email,
      firebaseUid: data.firebaseUid,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName
    });
  });
  
  return users;
}

async function checkInvoicesAlignment(users: UserData[]): Promise<void> {
  logger.info('🧾 Checking invoices collection alignment...');
  
  const invoicesSnap = await db.collection('invoices').get();
  logger.info(`Found ${invoicesSnap.size} invoices`);
  
  let alignedCount = 0;
  let misalignedCount = 0;
  
  for (const doc of invoicesSnap.docs) {
    const invoice = doc.data();
    const user = users.find(u => u.id === invoice.userId);
    
    if (user) {
      alignedCount++;
      logger.info(`✅ Invoice ${doc.id}: ${user.email} (${invoice.amount} ${invoice.currency || 'USD'}) - Status: ${invoice.status}`);
    } else {
      misalignedCount++;
      logger.warn(`❌ Invoice ${doc.id}: userId ${invoice.userId} not found in users collection`);
      
      // Try to find user by email if available
      if (invoice.userEmail) {
        const userByEmail = users.find(u => u.email === invoice.userEmail);
        if (userByEmail) {
          logger.info(`🔄 Found user by email, updating invoice userId: ${invoice.userEmail} -> ${userByEmail.id}`);
          await db.collection('invoices').doc(doc.id).update({
            userId: userByEmail.id,
            updatedAt: new Date()
          });
          alignedCount++;
          misalignedCount--;
        }
      }
    }
  }
  
  logger.info(`📊 Invoices: ${alignedCount} aligned, ${misalignedCount} misaligned`);
}

async function checkInvoicePaymentsAlignment(users: UserData[]): Promise<void> {
  logger.info('💳 Checking invoice_payments collection alignment...');
  
  const paymentsSnap = await db.collection('invoice_payments').get();
  logger.info(`Found ${paymentsSnap.size} invoice payments`);
  
  let alignedCount = 0;
  let misalignedCount = 0;
  
  for (const doc of paymentsSnap.docs) {
    const payment = doc.data();
    const user = users.find(u => u.id === payment.userId);
    
    if (user) {
      alignedCount++;
      logger.info(`✅ Invoice Payment ${doc.id}: ${user.email} (${payment.amount} ${payment.currency || 'USD'})`);
    } else {
      misalignedCount++;
      logger.warn(`❌ Invoice Payment ${doc.id}: userId ${payment.userId} not found`);
    }
  }
  
  logger.info(`📊 Invoice Payments: ${alignedCount} aligned, ${misalignedCount} misaligned`);
}

async function checkSubscriptionsAlignment(users: UserData[]): Promise<void> {
  logger.info('📋 Checking subscriptions collection alignment...');
  
  const subscriptionsSnap = await db.collection('subscriptions').get();
  logger.info(`Found ${subscriptionsSnap.size} subscriptions`);
  
  let alignedCount = 0;
  let misalignedCount = 0;
  
  for (const doc of subscriptionsSnap.docs) {
    const subscription = doc.data();
    const user = users.find(u => u.id === subscription.userId);
    
    if (user) {
      alignedCount++;
      logger.info(`✅ Subscription ${doc.id}: ${user.email} (${subscription.tier}) - Status: ${subscription.status}, Seats: ${subscription.seats}`);
    } else {
      misalignedCount++;
      logger.warn(`❌ Subscription ${doc.id}: userId ${subscription.userId} not found`);
    }
  }
  
  logger.info(`📊 Subscriptions: ${alignedCount} aligned, ${misalignedCount} misaligned`);
}

async function checkLicensesAlignment(users: UserData[]): Promise<void> {
  logger.info('🔑 Checking licenses collection alignment...');
  
  const licensesSnap = await db.collection('licenses').get();
  logger.info(`Found ${licensesSnap.size} licenses`);
  
  let alignedCount = 0;
  let misalignedCount = 0;
  
  for (const doc of licensesSnap.docs) {
    const license = doc.data();
    const user = users.find(u => u.id === license.userId);
    
    if (user) {
      alignedCount++;
      logger.info(`✅ License ${doc.id}: ${user.email} (${license.tier}) - Status: ${license.status}, Key: ${license.key}`);
    } else {
      misalignedCount++;
      logger.warn(`❌ License ${doc.id}: userId ${license.userId} not found`);
    }
  }
  
  logger.info(`📊 Licenses: ${alignedCount} aligned, ${misalignedCount} misaligned`);
}

async function checkPaymentsAlignment(users: UserData[]): Promise<void> {
  logger.info('💰 Checking payments collection alignment...');
  
  const paymentsSnap = await db.collection('payments').get();
  logger.info(`Found ${paymentsSnap.size} payments`);
  
  let alignedCount = 0;
  let misalignedCount = 0;
  
  for (const doc of paymentsSnap.docs) {
    const payment = doc.data();
    const user = users.find(u => u.id === payment.userId);
    
    if (user) {
      alignedCount++;
      logger.info(`✅ Payment ${doc.id}: ${user.email} (${payment.amount} ${payment.currency || 'USD'}) - Status: ${payment.status}`);
      
      // Check if user info is embedded correctly
      if (!payment.user || payment.user.email !== user.email) {
        logger.info(`🔄 Updating embedded user info for payment ${doc.id}`);
        await db.collection('payments').doc(doc.id).update({
          user: {
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0]
          },
          updatedAt: new Date()
        });
      }
    } else {
      misalignedCount++;
      logger.warn(`❌ Payment ${doc.id}: userId ${payment.userId} not found`);
    }
  }
  
  logger.info(`📊 Payments: ${alignedCount} aligned, ${misalignedCount} misaligned`);
}

async function checkInvoiceAttachmentsAlignment(): Promise<void> {
  logger.info('📎 Checking invoice_attachments collection alignment...');
  
  const attachmentsSnap = await db.collection('invoice_attachments').get();
  logger.info(`Found ${attachmentsSnap.size} invoice attachments`);
  
  if (attachmentsSnap.empty) {
    logger.info('No invoice attachments found - collection is empty');
    return;
  }
  
  let alignedCount = 0;
  let misalignedCount = 0;
  
  for (const doc of attachmentsSnap.docs) {
    const attachment = doc.data();
    
    // Check if referenced invoice exists
    if (attachment.invoiceId) {
      const invoiceDoc = await db.collection('invoices').doc(attachment.invoiceId).get();
      if (invoiceDoc.exists) {
        alignedCount++;
        logger.info(`✅ Attachment ${doc.id}: linked to invoice ${attachment.invoiceId}`);
      } else {
        misalignedCount++;
        logger.warn(`❌ Attachment ${doc.id}: invoice ${attachment.invoiceId} not found`);
      }
    } else {
      misalignedCount++;
      logger.warn(`❌ Attachment ${doc.id}: no invoiceId specified`);
    }
  }
  
  logger.info(`📊 Invoice Attachments: ${alignedCount} aligned, ${misalignedCount} misaligned`);
}

async function createMissingInvoicePayments(users: UserData[]): Promise<void> {
  logger.info('🔄 Creating missing invoice payments for succeeded invoices...');
  
  // Get all succeeded invoices
  const invoicesSnap = await db.collection('invoices').where('status', '==', 'succeeded').get();
  
  for (const invoiceDoc of invoicesSnap.docs) {
    const invoice = invoiceDoc.data();
    
    // Check if there's already a payment for this invoice
    const existingPayment = await db.collection('invoice_payments')
      .where('invoiceId', '==', invoiceDoc.id)
      .get();
    
    if (existingPayment.empty) {
      const user = users.find(u => u.id === invoice.userId);
      if (user) {
        const paymentId = uuidv4();
        const payment = {
          id: paymentId,
          invoiceId: invoiceDoc.id,
          userId: invoice.userId,
          amount: invoice.amount,
          currency: invoice.currency || 'USD',
          status: 'succeeded',
          paymentMethod: 'card',
          stripePaymentIntentId: `pi_${uuidv4().substring(0, 16)}`,
          createdAt: invoice.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        await db.collection('invoice_payments').doc(paymentId).set(payment);
        logger.info(`✅ Created invoice payment for ${user.email}: $${invoice.amount}`);
      }
    }
  }
}

async function ensureSubscriptionLicenseAlignment(users: UserData[]): Promise<void> {
  logger.info('🔗 Ensuring subscription-license alignment...');
  
  const subscriptionsSnap = await db.collection('subscriptions').get();
  
  for (const subDoc of subscriptionsSnap.docs) {
    const subscription = subDoc.data();
    const user = users.find(u => u.id === subscription.userId);
    
    if (!user) continue;
    
    // Check if there's a corresponding license
    const licenseSnap = await db.collection('licenses')
      .where('userId', '==', subscription.userId)
      .where('subscriptionId', '==', subDoc.id)
      .get();
    
    if (licenseSnap.empty) {
      // Create missing license
      const licenseId = uuidv4();
      const license = {
        id: licenseId,
        userId: subscription.userId,
        subscriptionId: subDoc.id,
        key: `LIC-${subscription.tier}-${uuidv4().substring(0, 8).toUpperCase()}`,
        tier: subscription.tier,
        status: subscription.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        activatedAt: subscription.createdAt || new Date(),
        expiresAt: subscription.currentPeriodEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        createdAt: subscription.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('licenses').doc(licenseId).set(license);
      logger.info(`✅ Created missing license for ${user.email}: ${subscription.tier}`);
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
      logger.info('🔍 DRY RUN: Analyzing collection alignment (no changes will be made)...');
    } else {
      logger.info('🔄 Starting comprehensive collection alignment...');
    }
    
    // Get all users first
    const users = await getAllUsers();
    logger.info(`Found ${users.length} users in the system`);
    
    // Check alignment of all collections
    await checkInvoicesAlignment(users);
    await checkInvoicePaymentsAlignment(users);
    await checkSubscriptionsAlignment(users);
    await checkLicensesAlignment(users);
    await checkPaymentsAlignment(users);
    await checkInvoiceAttachmentsAlignment();
    
    if (!isDryRun) {
      // Fix missing relationships
      await createMissingInvoicePayments(users);
      await ensureSubscriptionLicenseAlignment(users);
    }
    
    logger.info('✅ Collection alignment check complete!');
    
    if (isDryRun) {
      logger.info('💡 Run without --dry-run to apply fixes');
    } else {
      logger.info('🎯 All collections should now be properly aligned with users');
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Collection alignment failed:', error);
    process.exit(1);
  }
}

main();
