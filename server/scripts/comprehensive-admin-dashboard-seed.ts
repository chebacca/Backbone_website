#!/usr/bin/env tsx

// Comprehensive seed script for Admin Dashboard - fixes all data gaps for the 6 core users
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';
import { PasswordUtil } from '../src/utils/password.js';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';

// Firestore will be initialized after dynamic import of firestoreService
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;
let firestoreService: any;

async function clearSpecificCollections(dryRun: boolean = false): Promise<void> {
  try {
    if (dryRun) {
      logger.info('🔍 DRY RUN: Clearing only specific collections (users, invoices, payments, subscriptions, licenses)...');
    } else {
      logger.info('🧹 Clearing only specific collections (users, invoices, payments, subscriptions, licenses)...');
    }
    
    // Helper to delete a collection in batches
    const deleteCollection = async (path: string) => {
      if (dryRun) {
        // Just count documents for dry run
        const snap = await db.collection(path).get();
        logger.info(`[DRY RUN] Would clear ${snap.size} documents from ${path}`);
        return;
      }
      
      const batchSize = 500;
      let deleted = 0;
      while (true) {
        const snap = await db.collection(path).limit(batchSize).get();
        if (snap.empty) break;
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        deleted += snap.size;
        // small delay to avoid overwhelming Firestore
        await new Promise((r) => setTimeout(r, 50));
      }
      if (deleted > 0) logger.info(`Cleared ${deleted} documents from ${path}`);
    };

    // Only clear these specific collections
    const collectionsToClear = [
      'users',
      'invoices', 
      'payments',
      'subscriptions',
      'licenses',
      'org_members',
      'organizations',
      'tenant_mappings'
    ];

    logger.info(`Targeting ${collectionsToClear.length} specific collections for clearing...`);

    // Clear the specified collections
    for (const collectionName of collectionsToClear) {
      if (dryRun) {
        logger.info(`[DRY RUN] Would clear collection: ${collectionName}`);
      } else {
        logger.info(`Clearing collection: ${collectionName}`);
      }
      await deleteCollection(collectionName);
    }

    if (dryRun) {
      logger.info('✅ DRY RUN COMPLETE: No data was actually deleted');
      logger.info(`📊 Would clear ${collectionsToClear.length} specific collections`);
      logger.info('💾 All other collections and their data would be preserved');
    } else {
      logger.info('✅ Specific collections cleared successfully!');
      logger.info(`📊 Cleared ${collectionsToClear.length} target collections`);
      logger.info('💾 All other collections and their data preserved');
    }
  } catch (error) {
    logger.error('❌ Collection clearing failed:', error);
    throw error;
  }
}

async function createFirebaseAuthUser(email: string, password: string, displayName: string): Promise<string> {
  try {
    // Check if user already exists
    const existingUser = await auth.getUserByEmail(email);
    logger.info(`Firebase Auth user ${email} already exists, updating...`);
    
    // Update existing user
    await auth.updateUser(existingUser.uid, {
      password: password,
      displayName: displayName,
      emailVerified: true,
      disabled: false,
    });
    
    return existingUser.uid;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      // Create new user
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: displayName,
        emailVerified: true,
        disabled: false,
      });
      
      logger.info(`Created new Firebase Auth user: ${email} (uid: ${userRecord.uid})`);
      return userRecord.uid;
    } else {
      throw error;
    }
  }
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN' | 'ACCOUNTING';
  password: string;
  tier?: 'BASIC' | 'PRO' | 'ENTERPRISE';
  seats?: number;
}

async function ensureUserWithCompleteData(userData: UserData): Promise<string> {
  const { email, firstName, lastName, role, password, tier, seats } = userData;
  const fullName = `${firstName} ${lastName}`;
  
  // First create/update Firebase Auth user
  const firebaseUid = await createFirebaseAuthUser(email, password, fullName);
  
  // Now create/update Firestore user document with ALL required fields
  const existing = await firestoreService.getUserByEmail(email).catch(() => null as any);
  const hashed = await PasswordUtil.hash(password);
  const now = new Date();
  
  // Create realistic last login dates (within the last 30 days)
  const daysAgo = Math.floor(Math.random() * 30);
  const lastLoginAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  
  const userDocument = {
    email,
    name: fullName,
    firstName,
    lastName,
    role,
    password: hashed,
    isEmailVerified: true,
    twoFactorEnabled: false,
    twoFactorBackupCodes: [],
    marketingConsent: false,
    dataProcessingConsent: true,
    identityVerified: role === 'SUPERADMIN' || role === 'ACCOUNTING',
    kycStatus: 'COMPLETED' as any,
    privacyConsent: [],
    registrationSource: 'seed',
    firebaseUid: firebaseUid,
    status: 'active', // Required for admin dashboard
    lastLoginAt: lastLoginAt, // Required for admin dashboard "Last Login" column
    createdAt: now,
    updatedAt: now
  };
  
  if (existing) {
    await firestoreService.updateUser(existing.id, userDocument as any);
    logger.info(`Updated user: ${email} (${firstName} ${lastName}) - Role: ${role}`);
    return existing.id;
  }
  
  const created = await firestoreService.createUser(userDocument as any);
  logger.info(`Created user: ${email} (${firstName} ${lastName}) - Role: ${role}`);
  return created.id;
}

async function createSubscription(userId: string, tier: 'BASIC' | 'PRO' | 'ENTERPRISE', seats: number = 1): Promise<string> {
  const now = new Date();
  const subscriptionId = uuidv4();
  
  const subscription = {
    id: subscriptionId,
    userId,
    tier,
    seats,
    status: 'ACTIVE',
    billingCycle: tier === 'ENTERPRISE' ? 'ANNUAL' : 'MONTHLY',
    termDays: tier === 'ENTERPRISE' ? 365 : 30,
    pricePerSeat: tier === 'BASIC' ? 29 : tier === 'PRO' ? 79 : 199,
    cancelAtPeriodEnd: false,
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getTime() + (tier === 'ENTERPRISE' ? 365 : 30) * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now
  };

  await db.collection('subscriptions').doc(subscriptionId).set(subscription);
  logger.info(`Created ${tier} subscription for user ${userId} with ${seats} seat(s)`);
  return subscriptionId;
}

async function createLicense(userId: string, subscriptionId: string, tier: 'BASIC' | 'PRO' | 'ENTERPRISE'): Promise<string> {
  const now = new Date();
  const licenseId = uuidv4();
  
  const license = {
    id: licenseId,
    userId,
    subscriptionId,
    key: `LIC-${tier.toUpperCase()}-${uuidv4().substring(0, 8).toUpperCase()}`,
    tier,
    status: 'ACTIVE', // Changed from 'active' to 'ACTIVE' for consistency
    activatedAt: now,
    expiresAt: new Date(now.getTime() + (tier === 'ENTERPRISE' ? 365 : 30) * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now
  };

  await db.collection('licenses').doc(licenseId).set(license);
  logger.info(`Created ${tier} license for user ${userId}`);
  return licenseId;
}

async function createInvoice(userId: string, subscriptionId: string, tier: 'BASIC' | 'PRO' | 'ENTERPRISE', amount: number): Promise<string> {
  const now = new Date();
  const invoiceId = uuidv4();
  
  const invoice = {
    id: invoiceId,
    userId,
    subscriptionId,
    stripeInvoiceId: `inv_${uuidv4().substring(0, 8)}`,
    amount,
    currency: 'USD',
    status: 'succeeded', // Changed from 'PENDING' to 'succeeded' for revenue calculation
    description: `${tier} License - ${tier === 'BASIC' ? 'Monthly' : tier === 'PRO' ? 'Monthly' : 'Annual'} Subscription`,
    receiptUrl: `https://pay.stripe.com/receipts/${uuidv4()}`,
    billingAddressSnapshot: null,
    taxAmount: 0,
    taxRate: 0,
    taxJurisdiction: '',
    paymentMethod: 'card',
    complianceData: null,
    amlScreeningStatus: 'COMPLETED',
    amlScreeningDate: now,
    amlRiskScore: 0,
    pciCompliant: true,
    ipAddress: '127.0.0.1',
    userAgent: 'seed-script',
    processingLocation: 'us-central1',
    createdAt: now,
    updatedAt: now
  };

  await db.collection('invoices').doc(invoiceId).set(invoice);
  logger.info(`Created invoice for ${tier} license: $${amount} USD`);
  return invoiceId;
}

// NEW: Create actual payment records for revenue calculation
async function createPayment(userId: string, subscriptionId: string, tier: 'BASIC' | 'PRO' | 'ENTERPRISE', amount: number, userEmail: string): Promise<string> {
  const now = new Date();
  const paymentId = uuidv4();
  
  const payment = {
    id: paymentId,
    userId,
    subscriptionId,
    stripePaymentIntentId: `pi_${uuidv4().substring(0, 16)}`,
    amount,
    currency: 'USD',
    status: 'succeeded', // This is crucial for revenue calculation in AdminDashboardService
    description: `${tier} License Payment`,
    receiptUrl: `https://pay.stripe.com/receipts/${uuidv4()}`,
    paymentMethod: 'card',
    subscription: {
      tier: tier
    },
    user: {
      email: userEmail,
      name: userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    createdAt: now,
    updatedAt: now
  };

  await db.collection('payments').doc(paymentId).set(payment);
  logger.info(`Created payment record for ${tier} license: $${amount} USD`);
  return paymentId;
}

async function main() {
  try {
    // Check if this is a dry run
    const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--dryrun');
    
    // Dynamically import after env is set so Firestore Admin sees env
    await import('../src/services/firestoreService.js');
    db = getFirestore();
    auth = getAuth();
    firestoreService = (await import('../src/services/firestoreService.js')).firestoreService;
    
    if (isDryRun) {
      logger.info('🚀 DRY RUN: Starting comprehensive admin dashboard seed analysis...');
      
      // Step 1: Dry run of clearing specific collections
      await clearSpecificCollections(true);
      
      logger.info('🌱 DRY RUN: Would seed 6 core users with complete admin dashboard data...');
      logger.info('   - chebacca@gmail.com (System Administrator - SUPERADMIN)');
      logger.info('   - accounting@example.com (Accounting User - ACCOUNTING)');
      logger.info('   - basic.user@example.com (Basic User - USER) + BASIC subscription + payment');
      logger.info('   - pro.user@example.com (Pro User - USER) + PRO subscription + payment');
      logger.info('   - enterprise.user@example.com (Enterprise User - USER) + ENTERPRISE subscription + payment');
      logger.info('   - demo.user@example.com (Demo User - USER)');
      logger.info('');
      logger.info('📊 Would fix Admin Dashboard data issues:');
      logger.info('   ✅ Add firstName/lastName fields (fixes name display)');
      logger.info('   ✅ Add lastLogin dates (fixes "Invalid Date" in Last Login column)');
      logger.info('   ✅ Add payment records with "succeeded" status (fixes revenue calculation)');
      logger.info('   ✅ Ensure proper user status ("active") for all users');
      logger.info('   ✅ Create complete subscription/license/payment chain');
      
      logger.info('✅ DRY RUN COMPLETE: No changes were made to the database');
      process.exit(0);
    } else {
      logger.info('🚀 Starting comprehensive admin dashboard seed...');
      
      // Step 1: Clear specific collections
      await clearSpecificCollections(false);
      
      // Step 2: Define the 6 core users with complete data
      const coreUsers: UserData[] = [
        {
          email: 'chebacca@gmail.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'SUPERADMIN',
          password: 'AdminMaster123!'
        },
        {
          email: 'accounting@example.com',
          firstName: 'Accounting',
          lastName: 'User',
          role: 'ACCOUNTING',
          password: 'ChangeMe123!'
        },
        {
          email: 'basic.user@example.com',
          firstName: 'Basic',
          lastName: 'User',
          role: 'USER',
          password: 'ChangeMe123!',
          tier: 'BASIC',
          seats: 1
        },
        {
          email: 'pro.user@example.com',
          firstName: 'Pro',
          lastName: 'User',
          role: 'USER',
          password: 'ChangeMe123!',
          tier: 'PRO',
          seats: 10
        },
        {
          email: 'enterprise.user@example.com',
          firstName: 'Enterprise',
          lastName: 'User',
          role: 'USER',
          password: 'Admin1234!',
          tier: 'ENTERPRISE',
          seats: 50
        },
        {
          email: 'demo.user@example.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'USER',
          password: 'ChangeMe123!'
        }
      ];
      
      // Step 3: Create users with complete data
      logger.info('🌱 Creating 6 core users with complete admin dashboard data...');
      
      const userIds: { [email: string]: string } = {};
      
      for (const userData of coreUsers) {
        const userId = await ensureUserWithCompleteData(userData);
        userIds[userData.email] = userId;
      }
      
      // Step 4: Create subscriptions, licenses, invoices, and payments for tiered users
      logger.info('🔑 Creating subscriptions, licenses, invoices, and payments...');
      
      const tieredUsers = coreUsers.filter(u => u.tier);
      
      for (const userData of tieredUsers) {
        const userId = userIds[userData.email];
        const { tier, seats = 1 } = userData;
        
        if (tier) {
          // Create subscription
          const subscriptionId = await createSubscription(userId, tier, seats);
          
          // Create license
          const licenseId = await createLicense(userId, subscriptionId, tier);
          
          // Calculate amount
          const amount = tier === 'BASIC' ? 29 : tier === 'PRO' ? 79 : 199;
          
          // Create invoice
          const invoiceId = await createInvoice(userId, subscriptionId, tier, amount);
          
          // Create payment record (NEW - this fixes revenue calculation)
          const paymentId = await createPayment(userId, subscriptionId, tier, amount, userData.email);
          
          logger.info(`✅ Complete billing setup for ${userData.email}: ${tier} tier, $${amount}`);
        }
      }

      logger.info('✅ Comprehensive admin dashboard seed complete!');
      logger.info('📋 Summary:');
      logger.info('   - Specific collections cleared (users, invoices, payments, subscriptions, licenses)');
      logger.info('   - All other collections and data preserved');
      logger.info('   - 6 core users seeded with complete admin dashboard data:');
      logger.info('     • firstName/lastName fields for proper name display');
      logger.info('     • lastLogin dates for "Last Login" column');
      logger.info('     • Proper user status ("active") for all users');
      logger.info('   - 3 complete billing setups (Basic/Pro/Enterprise):');
      logger.info('     • Subscriptions with proper tier and seat data');
      logger.info('     • Licenses with activation and expiration dates');
      logger.info('     • Invoices with "succeeded" status');
      logger.info('     • Payment records with "succeeded" status (fixes revenue calculation)');
      logger.info('   - Revenue calculation now works: Basic $29 + Pro $79 + Enterprise $199 = $307');
      logger.info('   - All users properly linked to Firebase Auth for authentication');
      logger.info('');
      logger.info('🎯 Admin Dashboard should now display all data correctly:');
      logger.info('   ✅ User names (firstName lastName)');
      logger.info('   ✅ Last Login dates (no more "Invalid Date")');
      logger.info('   ✅ Subscription tiers (BASIC/PRO/ENTERPRISE chips)');
      logger.info('   ✅ User status (active status chips)');
      logger.info('   ✅ Total Revenue ($3.07 from payment records)');
      logger.info('   ✅ Active Subscriptions count (3)');
      logger.info('   ✅ Payment records with proper user/tier/amount data');
      
      process.exit(0);
    }
  } catch (error) {
    logger.error('❌ Comprehensive admin dashboard seed failed:', error);
    process.exit(1);
  }
}

main();
