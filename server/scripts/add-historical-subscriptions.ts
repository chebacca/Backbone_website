#!/usr/bin/env tsx

// Add multiple months of subscription history for testing
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

let db: ReturnType<typeof getFirestore>;

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  firebaseUid: string;
}

// Generate historical dates going back N months
function generateHistoricalDates(monthsBack: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = monthsBack; i >= 1; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    // Set to the 1st of the month for consistency
    date.setDate(1);
    date.setHours(10, 0, 0, 0); // 10 AM for consistency
    dates.push(date);
  }
  
  return dates;
}

// Calculate subscription end date (30 days from start)
function calculateEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);
  return endDate;
}

async function createHistoricalInvoice(
  userId: string,
  subscriptionId: string,
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE',
  amount: number,
  date: Date,
  userEmail: string
): Promise<string> {
  const invoiceId = uuidv4();
  const invoice = {
    id: invoiceId,
    userId,
    subscriptionId,
    amount,
    currency: 'USD',
    status: 'succeeded',
    description: `${tier} subscription - Monthly billing`,
    paymentMethod: 'card',
    stripeInvoiceId: `in_${uuidv4().substring(0, 16)}`,
    receiptUrl: `https://pay.stripe.com/receipts/${uuidv4()}`,
    taxAmount: Math.round(amount * 0.08), // 8% tax
    taxRate: 0.08,
    taxJurisdiction: 'US-CA',
    billingAddressSnapshot: {
      line1: '123 Business St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105',
      country: 'US'
    },
    complianceData: {
      pciCompliant: true,
      amlScreeningStatus: 'CLEARED',
      amlScreeningDate: date,
      amlRiskScore: 'LOW'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    processingLocation: 'US',
    createdAt: date,
    updatedAt: date
  };
  
  await db.collection('invoices').doc(invoiceId).set(invoice);
  logger.info(`📄 Created historical invoice: ${userEmail} - $${amount} (${date.toISOString().split('T')[0]})`);
  return invoiceId;
}

async function createHistoricalPayment(
  userId: string,
  subscriptionId: string,
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE',
  amount: number,
  date: Date,
  userEmail: string,
  displayName: string
): Promise<string> {
  const paymentId = uuidv4();
  const payment = {
    id: paymentId,
    userId,
    subscriptionId,
    amount,
    currency: 'USD',
    status: 'succeeded',
    description: `${tier} subscription payment`,
    paymentMethod: 'card',
    stripePaymentIntentId: `pi_${uuidv4().substring(0, 16)}`,
    receiptUrl: `https://pay.stripe.com/receipts/${uuidv4()}`,
    user: {
      email: userEmail,
      name: displayName
    },
    subscription: {
      tier: tier
    },
    createdAt: date,
    updatedAt: date
  };
  
  await db.collection('payments').doc(paymentId).set(payment);
  logger.info(`💳 Created historical payment: ${userEmail} - $${amount} (${date.toISOString().split('T')[0]})`);
  return paymentId;
}

async function createHistoricalInvoicePayment(
  userId: string,
  invoiceId: string,
  amount: number,
  date: Date,
  userEmail: string
): Promise<string> {
  const paymentId = uuidv4();
  const payment = {
    id: paymentId,
    invoiceId,
    userId,
    amount,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: 'card',
    stripePaymentIntentId: `pi_${uuidv4().substring(0, 16)}`,
    createdAt: date,
    updatedAt: date
  };
  
  await db.collection('invoice_payments').doc(paymentId).set(payment);
  logger.info(`💰 Created historical invoice payment: ${userEmail} - $${amount} (${date.toISOString().split('T')[0]})`);
  return paymentId;
}

async function createHistoricalSubscription(
  userId: string,
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE',
  startDate: Date,
  endDate: Date,
  userEmail: string,
  isActive: boolean = false
): Promise<string> {
  const subscriptionId = uuidv4();
  const pricePerSeat = tier === 'BASIC' ? 29 : tier === 'PRO' ? 79 : 199;
  
  const subscription = {
    id: subscriptionId,
    userId,
    tier,
    status: isActive ? 'ACTIVE' : 'CANCELLED',
    seats: 1,
    pricePerSeat,
    billingCycle: 'MONTHLY',
    termDays: 30,
    currentPeriodStart: startDate,
    currentPeriodEnd: endDate,
    cancelAtPeriodEnd: !isActive,
    createdAt: startDate,
    updatedAt: isActive ? new Date() : endDate
  };
  
  await db.collection('subscriptions').doc(subscriptionId).set(subscription);
  logger.info(`📋 Created historical subscription: ${userEmail} - ${tier} (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}) - ${isActive ? 'ACTIVE' : 'CANCELLED'}`);
  return subscriptionId;
}

async function addHistoricalDataForUser(
  user: UserData,
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE',
  monthsOfHistory: number
): Promise<void> {
  logger.info(`\n🕒 Adding ${monthsOfHistory} months of history for ${user.email} (${tier})...`);
  
  const historicalDates = generateHistoricalDates(monthsOfHistory);
  const amount = tier === 'BASIC' ? 29 : tier === 'PRO' ? 79 : 199;
  const displayName = `${user.firstName} ${user.lastName}`;
  
  for (let i = 0; i < historicalDates.length; i++) {
    const startDate = historicalDates[i];
    const endDate = calculateEndDate(startDate);
    const isCurrentMonth = i === historicalDates.length - 1; // Last iteration is current active subscription
    
    // Create historical subscription (inactive for past months, active for current)
    const subscriptionId = await createHistoricalSubscription(
      user.id,
      tier,
      startDate,
      endDate,
      user.email,
      isCurrentMonth
    );
    
    // Create invoice for this period
    const invoiceId = await createHistoricalInvoice(
      user.id,
      subscriptionId,
      tier,
      amount,
      startDate,
      user.email
    );
    
    // Create payment for this period
    await createHistoricalPayment(
      user.id,
      subscriptionId,
      tier,
      amount,
      startDate,
      user.email,
      displayName
    );
    
    // Create invoice payment for this period
    await createHistoricalInvoicePayment(
      user.id,
      invoiceId,
      amount,
      startDate,
      user.email
    );
    
    // Create license for current active subscription only
    if (isCurrentMonth) {
      const licenseId = uuidv4();
      const license = {
        id: licenseId,
        userId: user.id,
        subscriptionId,
        key: `LIC-${tier}-${uuidv4().substring(0, 8).toUpperCase()}`,
        tier,
        status: 'ACTIVE',
        activatedAt: startDate,
        expiresAt: new Date(endDate.getTime() + (365 * 24 * 60 * 60 * 1000)), // 1 year from end
        createdAt: startDate,
        updatedAt: new Date()
      };
      
      await db.collection('licenses').doc(licenseId).set(license);
      logger.info(`🔑 Created license for current subscription: ${license.key}`);
    }
  }
}

async function removeExistingSubscriptions(userId: string, userEmail: string): Promise<void> {
  logger.info(`🧹 Removing existing subscriptions for ${userEmail}...`);
  
  // Remove existing subscriptions
  const existingSubs = await db.collection('subscriptions').where('userId', '==', userId).get();
  for (const doc of existingSubs.docs) {
    await doc.ref.delete();
  }
  
  // Remove existing licenses
  const existingLicenses = await db.collection('licenses').where('userId', '==', userId).get();
  for (const doc of existingLicenses.docs) {
    await doc.ref.delete();
  }
  
  // Remove existing invoices
  const existingInvoices = await db.collection('invoices').where('userId', '==', userId).get();
  for (const doc of existingInvoices.docs) {
    await doc.ref.delete();
  }
  
  // Remove existing payments
  const existingPayments = await db.collection('payments').where('userId', '==', userId).get();
  for (const doc of existingPayments.docs) {
    await doc.ref.delete();
  }
  
  // Remove existing invoice payments
  const existingInvoicePayments = await db.collection('invoice_payments').where('userId', '==', userId).get();
  for (const doc of existingInvoicePayments.docs) {
    await doc.ref.delete();
  }
  
  logger.info(`✅ Cleaned up existing data for ${userEmail}`);
}

async function generateSummaryReport(): Promise<void> {
  logger.info('\n📊 HISTORICAL DATA SUMMARY REPORT');
  logger.info('==================================');
  
  // Get all users with subscriptions
  const usersWithSubs = await db.collection('users').get();
  
  for (const userDoc of usersWithSubs.docs) {
    const user = userDoc.data();
    const subscriptions = await db.collection('subscriptions').where('userId', '==', userDoc.id).get();
    
    if (!subscriptions.empty) {
      logger.info(`\n👤 ${user.email}:`);
      
      const invoices = await db.collection('invoices').where('userId', '==', userDoc.id).get();
      const payments = await db.collection('payments').where('userId', '==', userDoc.id).get();
      
      let totalRevenue = 0;
      payments.forEach(doc => {
        const payment = doc.data();
        if (payment.status === 'succeeded' && typeof payment.amount === 'number') {
          totalRevenue += payment.amount;
        }
      });
      
      logger.info(`   📋 Subscriptions: ${subscriptions.size} (${subscriptions.docs.filter(d => d.data().status === 'ACTIVE').length} active)`);
      logger.info(`   🧾 Invoices: ${invoices.size}`);
      logger.info(`   💰 Payments: ${payments.size} (Total: $${totalRevenue})`);
      
      // Show date range
      if (invoices.size > 0) {
        const dates = invoices.docs.map(d => new Date(d.data().createdAt.seconds * 1000)).sort();
        const firstDate = dates[0].toISOString().split('T')[0];
        const lastDate = dates[dates.length - 1].toISOString().split('T')[0];
        logger.info(`   📅 Date Range: ${firstDate} to ${lastDate}`);
      }
    }
  }
  
  // Overall totals
  const allPayments = await db.collection('payments').where('status', '==', 'succeeded').get();
  let grandTotal = 0;
  allPayments.forEach(doc => {
    const payment = doc.data();
    if (typeof payment.amount === 'number') {
      grandTotal += payment.amount;
    }
  });
  
  logger.info(`\n💰 GRAND TOTAL REVENUE: $${grandTotal}`);
  logger.info(`📊 Total Successful Payments: ${allPayments.size}`);
}

async function main() {
  try {
    const monthsOfHistory = parseInt(process.argv[2]) || 6; // Default to 6 months
    const isDryRun = process.argv.includes('--dry-run');
    
    // Initialize Firestore
    await import('../src/services/firestoreService.js');
    db = getFirestore();
    
    if (isDryRun) {
      logger.info(`🔍 DRY RUN: Would add ${monthsOfHistory} months of subscription history`);
      return;
    }
    
    logger.info(`🕒 Adding ${monthsOfHistory} months of subscription history...`);
    
    // Get the Pro and Enterprise users for historical data
    const proUserSnap = await db.collection('users').where('email', '==', 'pro.user@example.com').get();
    const enterpriseUserSnap = await db.collection('users').where('email', '==', 'enterprise.user@example.com').get();
    
    if (proUserSnap.empty || enterpriseUserSnap.empty) {
      logger.error('❌ Could not find pro.user@example.com or enterprise.user@example.com');
      process.exit(1);
    }
    
    const proUser: UserData = {
      id: proUserSnap.docs[0].id,
      email: proUserSnap.docs[0].data().email,
      firstName: proUserSnap.docs[0].data().firstName,
      lastName: proUserSnap.docs[0].data().lastName,
      firebaseUid: proUserSnap.docs[0].data().firebaseUid
    };
    
    const enterpriseUser: UserData = {
      id: enterpriseUserSnap.docs[0].id,
      email: enterpriseUserSnap.docs[0].data().email,
      firstName: enterpriseUserSnap.docs[0].data().firstName,
      lastName: enterpriseUserSnap.docs[0].data().lastName,
      firebaseUid: enterpriseUserSnap.docs[0].data().firebaseUid
    };
    
    // Clean up existing data first
    await removeExistingSubscriptions(proUser.id, proUser.email);
    await removeExistingSubscriptions(enterpriseUser.id, enterpriseUser.email);
    
    // Add historical data
    await addHistoricalDataForUser(proUser, 'PRO', monthsOfHistory);
    await addHistoricalDataForUser(enterpriseUser, 'ENTERPRISE', monthsOfHistory);
    
    // Generate summary report
    await generateSummaryReport();
    
    logger.info('\n✅ Historical subscription data added successfully!');
    logger.info('🎯 AdminDashboard will now show rich historical data with multiple months of invoices and payments.');
    logger.info(`💡 Total months added: ${monthsOfHistory} months per user`);
    logger.info('📊 You can now test invoice filtering, payment history, and revenue trends!');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to add historical data:', error);
    process.exit(1);
  }
}

main();
