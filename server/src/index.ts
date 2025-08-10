import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { subscriptionsRouter } from './routes/subscriptions.js';
import { licensesRouter } from './routes/licenses.js';
import { paymentsRouter } from './routes/payments.js';
import { adminRouter } from './routes/admin.js';
import { webhooksRouter } from './routes/webhooks.js';
import invoicesRouter from './routes/invoices.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { logger } from './utils/logger.js';
import { firestoreService } from './services/firestoreService.js';
import { db } from './services/db.js';
import { PasswordUtil } from './utils/password.js';
import { LicenseService } from './services/licenseService.js';
// Prisma removed — all persistence is via Firestore (see `services/firestoreService.ts`)

const app: Application = express();

// Trust proxy (required when behind Firebase Hosting/Cloud Run for correct IPs)
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://m.stripe.network", "https://q.stripe.com"],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'",
        "'wasm-unsafe-eval'",
        "https://js.stripe.com",
        "https://m.stripe.network"
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://js.stripe.com",
        "https://m.stripe.network",
        "https://q.stripe.com"
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://m.stripe.network"
      ],
      frameAncestors: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));

// CORS (open in development, strict in production)
app.use(cors({
  origin: config.isDevelopment ? true : config.corsOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check (support both /health and /api/health when behind Hosting rewrite)
app.get(['/health', '/api/health'], async (req, res) => {
  const dbPing = await db.ping();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0',
    database: dbPing.ok ? 'healthy' : 'degraded',
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/licenses', licensesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/webhooks', webhooksRouter);

// Setup endpoint: place BEFORE error handlers so it's reachable
app.post('/api/setup/seed-superadmin', async (req, res) => {
  const token = req.headers['x-setup-token'] as string;
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || token !== expected) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }
  await ensureSuperAdminSeed();
  res.json({ success: true });
});

app.post('/api/setup/seed-test-data', async (req, res) => {
  // Temporarily disabled token check for debugging
  // const token = req.headers['x-setup-token'] as string;
  // const expected = process.env.ADMIN_SETUP_TOKEN;
  // if (!expected || token !== expected) {
  //   res.status(403).json({ success: false, error: 'Forbidden' });
  //   return;
  // }
  try {
    await seedTestData();
    res.json({ success: true, message: 'Database seeded with invoice data successfully!' });
  } catch (error) {
    logger.error('Seeding failed:', error);
    res.status(500).json({ success: false, error: 'Seeding failed', details: (error as any)?.message });
  }
});

app.post('/api/setup/clear-test-data', async (req, res) => {
  const token = req.headers['x-setup-token'] as string;
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || token !== expected) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }
  await clearTestData();
  res.json({ success: true });
});

// Temporary debug endpoint to check database contents (remove after debugging)
app.get('/api/debug/database-stats', async (req, res) => {
  try {
    const [users, subscriptions, payments, licenses] = await Promise.all([
      db.getAllUsers(),
      db.getAllSubscriptions(),
      db.getAllPayments(),
      db.getAllLicenses(),
    ]);
    
    const paymentsWithInvoices = payments.filter((p: any) => p.stripeInvoiceId);
    
    res.json({
      success: true,
      data: {
        counts: {
          users: users.length,
          subscriptions: subscriptions.length,
          payments: payments.length,
          paymentsWithInvoices: paymentsWithInvoices.length,
          licenses: licenses.length,
        },
        samplePayment: payments[0] || null,
        sampleInvoice: paymentsWithInvoices[0] || null,
        adminUsers: users.filter((u: any) => u.role === 'SUPERADMIN' || u.role === 'ADMIN').map((u: any) => ({ id: u.id, email: u.email, role: u.role })),
      }
    });
  } catch (error) {
    logger.error('Debug stats failed:', error);
    res.status(500).json({ success: false, error: 'Debug failed', details: (error as any)?.message });
  }
});

// Temporary endpoint to get all payments for debugging
app.get('/api/debug/all-payments', async (req, res) => {
  try {
    const payments = await db.getAllPayments();
    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    res.json({
      success: true,
      data: {
        count: payments.length,
        totalRevenue: totalRevenue / 100, // Convert cents to dollars
        payments: payments.map((p: any) => ({
          id: p.id,
          userId: p.userId,
          subscriptionId: p.subscriptionId,
          amount: p.amount,
          amountInDollars: (p.amount || 0) / 100,
          status: p.status,
          stripeInvoiceId: p.stripeInvoiceId,
          createdAt: p.createdAt,
          description: p.description
        }))
      }
    });
  } catch (error) {
    logger.error('Failed to get payments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get payments', 
      details: (error as any)?.message 
    });
  }
});

// Temporary endpoint to create payments for all subscriptions with detailed error reporting
app.post('/api/debug/create-all-payments', async (req, res) => {
  try {
    logger.info('Creating payments for all existing subscriptions...');
    
    const allSubscriptions = await db.getAllSubscriptions();
    logger.info(`Found ${allSubscriptions.length} subscriptions to create payments for`);
    
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const subscription of allSubscriptions) {
      try {
        logger.info(`Processing subscription ${subscription.id}:`, {
          userId: subscription.userId,
          tier: subscription.tier,
          seats: subscription.seats,
          pricePerSeat: subscription.pricePerSeat,
          status: subscription.status
        });
        
        const user = await db.getUserById(subscription.userId);
        if (!user) {
          const error = `User not found for subscription ${subscription.id}`;
          logger.warn(error);
          errors.push(error);
          errorCount++;
          continue;
        }
        
        // Check if this subscription already has payments
        const existingPayments = await db.getPaymentsBySubscriptionId(subscription.id);
        if (existingPayments.length > 0) {
          logger.info(`Subscription ${subscription.id} already has ${existingPayments.length} payments, skipping`);
          skippedCount++;
          continue;
        }
        
        logger.info(`Creating payment for subscription ${subscription.id} (${user.email})`);
        
        // Validate subscription data
        if (!subscription.pricePerSeat || !subscription.seats) {
          const error = `Subscription ${subscription.id} missing required fields: pricePerSeat=${subscription.pricePerSeat}, seats=${subscription.seats}`;
          logger.error(error);
          errors.push(error);
          errorCount++;
          continue;
        }
        
        // Calculate payment amounts based on subscription data
        const baseAmount = subscription.pricePerSeat * subscription.seats;
        const discountFactor = subscription.tier === 'ENTERPRISE' ? 0.85 : subscription.tier === 'PRO' ? 0.9 : 0.95;
        const finalAmount = Math.round(baseAmount * discountFactor);

        // Generate invoice data
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const subtotal = finalAmount;
        const taxRate = 0.08; // 8% tax
        const taxAmount = Math.round(subtotal * taxRate);
        const totalWithTax = subtotal + taxAmount;

        logger.info(`Payment calculation for ${subscription.id}:`, {
          baseAmount,
          discountFactor,
          finalAmount,
          taxAmount,
          totalWithTax
        });

        // Create payment record with invoice data
        await db.createPayment({
          userId: user.id,
          subscriptionId: subscription.id,
          stripePaymentIntentId: `pi_mock_${subscription.id}`,
          stripeInvoiceId: invoiceNumber,
          amount: totalWithTax,
          currency: 'usd',
          status: subscription.status === 'CANCELLED' ? 'FAILED' : 'SUCCEEDED',
          description: `${subscription.tier} subscription - ${subscription.seats} seats`,
          receiptUrl: `https://dashboard-v14.com/receipts/${invoiceNumber}`,
          billingAddressSnapshot: {
            firstName: user.email.split('@')[0],
            lastName: 'User',
            company: `${subscription.tier} Corp`,
            addressLine1: '123 Business Street',
            addressLine2: 'Suite 100',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'US',
          },
          taxAmount: taxAmount,
          taxRate: taxRate,
          taxJurisdiction: 'US',
          paymentMethod: 'credit_card',
          complianceData: {
            invoiceNumber: invoiceNumber,
            issuedDate: subscription.currentPeriodStart?.toISOString() || new Date().toISOString(),
            dueDate: new Date((subscription.currentPeriodStart?.getTime() || Date.now()) + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
              description: `Dashboard v14 ${subscription.tier} License`,
              quantity: subscription.seats,
              unitPrice: subscription.pricePerSeat / 100,
              total: subtotal / 100,
              taxRate: taxRate,
              taxAmount: taxAmount / 100,
            }],
            subtotal: subtotal / 100,
            taxTotal: taxAmount / 100,
            total: totalWithTax / 100,
            currency: 'USD',
          },
          amlScreeningStatus: 'PASSED',
          amlScreeningDate: subscription.currentPeriodStart || new Date(),
          amlRiskScore: 0.1,
          pciCompliant: true,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (compatible; Dashboard-v14-Client/1.0)',
          processingLocation: 'US',
        });
        
        createdCount++;
        logger.info(`Payment created successfully for subscription ${subscription.id}`);
      } catch (error) {
        const errorMsg = `Failed to create payment for subscription ${subscription.id}: ${(error as any)?.message}`;
        logger.error(errorMsg);
        errors.push(errorMsg);
        errorCount++;
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Payment creation completed',
      summary: {
        totalSubscriptions: allSubscriptions.length,
        created: createdCount,
        skipped: skippedCount,
        errors: errorCount
      },
      errors: errors
    });
  } catch (error) {
    logger.error('Failed to create payments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payments', 
      details: (error as any)?.message 
    });
  }
});

// Temporary endpoint to create a test payment and force the collection to exist
app.post('/api/debug/create-test-payment', async (req, res) => {
  try {
    logger.info('Creating test payment to initialize payments collection...');
    
    // Get the first user and subscription
    const users = await db.getAllUsers();
    const subscriptions = await db.getAllSubscriptions();
    
    if (users.length === 0 || subscriptions.length === 0) {
      res.status(400).json({ success: false, error: 'No users or subscriptions found' });
      return;
    }
    
    const user = users[0];
    const subscription = subscriptions[0];
    
    // Create a simple test payment
    const testPayment = await db.createPayment({
      userId: user.id,
      subscriptionId: subscription.id,
      stripePaymentIntentId: 'pi_test_123',
      stripeInvoiceId: 'INV-TEST-001',
      amount: 2900, // $29.00 in cents
      currency: 'usd',
      status: 'SUCCEEDED',
      description: 'Test payment for collection creation',
      receiptUrl: 'https://dashboard-v14.com/receipts/test',
      billingAddressSnapshot: {
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Corp',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
      },
      taxAmount: 232, // $2.32 in cents
      taxRate: 0.08,
      taxJurisdiction: 'US',
      paymentMethod: 'credit_card',
      complianceData: {
        invoiceNumber: 'INV-TEST-001',
        issuedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{
          description: 'Dashboard v14 BASIC License',
          quantity: 1,
          unitPrice: 29.00,
          total: 29.00,
          taxRate: 0.08,
          taxAmount: 2.32,
        }],
        subtotal: 29.00,
        taxTotal: 2.32,
        total: 31.32,
        currency: 'USD',
      },
      amlScreeningStatus: 'PASSED',
      amlScreeningDate: new Date(),
      amlRiskScore: 0.1,
      pciCompliant: true,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Test Client)',
      processingLocation: 'US',
    });
    
    logger.info('Test payment created successfully:', testPayment.id);
    
    res.json({ 
      success: true, 
      message: 'Test payment created successfully',
      paymentId: testPayment.id,
      collectionCreated: true
    });
  } catch (error) {
    logger.error('Failed to create test payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create test payment', 
      details: (error as any)?.message 
    });
  }
});

// Temporary test endpoint to create a single payment (remove after debugging)
app.post('/api/debug/create-single-payment', async (req, res) => {
  try {
    logger.info('Creating test payment...');
    
    const testPayment = await db.createPayment({
      userId: '1A86PkN4XmjclkWqzK9X', // user1.basic@example.com
      subscriptionId: 'sub-1A86PkN4XmjclkWqzK9X',
      stripePaymentIntentId: 'pi_test_123',
      stripeInvoiceId: 'INV-TEST-001',
      amount: 2900,
      currency: 'usd',
      status: 'SUCCEEDED',
      description: 'Test payment',
      receiptUrl: 'https://test.com/receipt',
      billingAddressSnapshot: {
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Corp',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
      },
      taxAmount: 232,
      taxRate: 0.08,
      taxJurisdiction: 'US',
      paymentMethod: 'credit_card',
      complianceData: {
        invoiceNumber: 'INV-TEST-001',
        issuedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{
          description: 'Test License',
          quantity: 1,
          unitPrice: 29,
          total: 29,
          taxRate: 0.08,
          taxAmount: 2.32,
        }],
        subtotal: 29,
        taxTotal: 2.32,
        total: 31.32,
        currency: 'USD',
      },
      amlScreeningStatus: 'PASSED',
      amlScreeningDate: new Date(),
      amlRiskScore: 0.1,
      pciCompliant: true,
      ipAddress: '192.168.1.1',
      userAgent: 'Test Agent',
      processingLocation: 'US',
    });
    
    logger.info('Test payment created successfully:', testPayment.id);
    res.json({ success: true, paymentId: testPayment.id });
  } catch (error) {
    logger.error('Test payment creation failed:', error);
    res.status(500).json({ success: false, error: 'Test payment failed', details: (error as any)?.message });
  }
});

// Error handling (keep last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start HTTP server only when NOT running in Cloud Functions environment
let server: import('http').Server | undefined;
const isCloudFunctionsEnv = Boolean(
  process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.FIREBASE_CONFIG
);

if (!isCloudFunctionsEnv) {
  // Graceful shutdown (local development only)
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });

  server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port} (local development)`);
    logger.info(`📊 Environment: ${config.nodeEnv}`);
    logger.info(`🔗 CORS enabled for: ${config.corsOrigin}`);
  });
} else {
  logger.info('🚀 Running in Firebase Cloud Functions environment');
}

// Ensure a SUPERADMIN exists if ADMIN_EMAIL and ADMIN_PASSWORD are provided
async function ensureSuperAdminSeed(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) return;

    const existing = await firestoreService.getUserByEmail(adminEmail);
    if (existing) {
      const updates: any = {};
      if (existing.role !== 'SUPERADMIN') updates.role = 'SUPERADMIN';
      if (existing.isEmailVerified !== true) updates.isEmailVerified = true;
      const shouldReset = (process.env.ADMIN_RESET || '').toLowerCase() === 'true';
      if (shouldReset) {
        const passCheck = PasswordUtil.validate(adminPassword);
        if (passCheck.isValid) {
          const hashed = await PasswordUtil.hash(adminPassword);
          updates.password = hashed;
        } else {
          logger.warn('ADMIN_RESET requested but ADMIN_PASSWORD did not meet policy; skipping password update.', { email: adminEmail });
        }
      }
      if (Object.keys(updates).length > 0) {
        await firestoreService.updateUser(existing.id, updates);
        logger.info('Updated existing superadmin user settings', { email: adminEmail, reset: shouldReset });
      }
      return;
    }

    // If provided password doesn't meet policy, generate a compliant one and log a warning
    const passCheck = PasswordUtil.validate(adminPassword);
    let passwordToUse = adminPassword;
    if (!passCheck.isValid) {
      passwordToUse = PasswordUtil.generateSecurePassword(16);
      logger.warn('Provided ADMIN_PASSWORD did not meet policy; generated a secure password instead. Please reset it after login.', { email: adminEmail });
    }

    const hashed = await PasswordUtil.hash(passwordToUse);
    const admin = await firestoreService.createUser({
      email: adminEmail,
      password: hashed,
      name: 'Super Admin',
      role: 'SUPERADMIN',
      isEmailVerified: true,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      privacyConsent: [],
      marketingConsent: false,
      dataProcessingConsent: false,
      identityVerified: false,
      kycStatus: 'COMPLETED',
      registrationSource: 'seed',
    } as any);
    logger.info('Seeded SUPERADMIN user', { email: adminEmail, userId: admin.id });
  } catch (err) {
    logger.error('Failed to ensure SUPERADMIN seed', { error: (err as any)?.message });
  }
}

/**
 * Normalize legacy roles in the database.
 * We used to have ENTERPRISE_ADMIN; this migrates any such users to ADMIN.
 */
async function normalizeLegacyRoles(): Promise<void> {
  try {
    const users = await firestoreService.getAllUsers();
    const legacyAdmins = users.filter(u => (u as any).role === 'ENTERPRISE_ADMIN');
    for (const u of legacyAdmins) {
      await firestoreService.updateUser(u.id, { role: 'ADMIN' } as any);
      logger.info('Updated legacy ENTERPRISE_ADMIN to ADMIN', { userId: u.id, email: u.email });
    }
  } catch (err) {
    logger.error('Failed to normalize legacy roles', { error: (err as any)?.message });
  }
}

// Seed test data including subscriptions and licenses
async function seedTestData(): Promise<void> {
  try {
    logger.info('Seeding test data...');
    
    // Test users with their tiers, seat counts, and status variety
    const testUsers = [
      { id: '1A86PkN4XmjclkWqzK9X', email: 'user1.basic@example.com', tier: 'BASIC', seats: 1, status: 'ACTIVE', months: 3 },
      { id: '5yBOkbzU2eSVJDaBSNf0', email: 'user2.basic@example.com', tier: 'BASIC', seats: 1, status: 'PENDING', months: 1 },
      { id: '57lVrwua5pMLx3HGyiCw', email: 'user1.pro@example.com', tier: 'PRO', seats: 5, status: 'ACTIVE', months: 6 },
      { id: 'CBZZl8KEVEScjjAkzL0E', email: 'user2.pro@example.com', tier: 'PRO', seats: 10, status: 'EXPIRED', months: -2 },
      { id: 'WGDiSdTiCXKHOSYiF1Ey', email: 'user1.enterprise@example.com', tier: 'ENTERPRISE', seats: 25, status: 'ACTIVE', months: 12 },
      { id: '7dGkcacCa0cUcdqP7Ywn', email: 'user2.enterprise@example.com', tier: 'ENTERPRISE', seats: 50, status: 'PENDING', months: 8 },
      { id: '1rX32QnDsUP49alkpmTC', email: 'chrismole@gmail.com', tier: 'ENTERPRISE', seats: 100, status: 'ACTIVE', months: 24 },
    ];

    const pricePerSeat = { BASIC: 2900, PRO: 9900, ENTERPRISE: 19900 };
    
    // First, get all existing subscriptions and create payments for them
    const allSubscriptions = await firestoreService.getAllSubscriptions();
    logger.info(`Found ${allSubscriptions.length} existing subscriptions to create payments for`);
    
    for (const subscription of allSubscriptions) {
      try {
        const user = await firestoreService.getUserById(subscription.userId);
        if (!user) {
          logger.warn(`User not found for subscription ${subscription.id}, skipping`);
          continue;
        }
        
        // Check if this subscription already has payments
        const existingPayments = await firestoreService.getPaymentsBySubscriptionId(subscription.id);
        if (existingPayments.length > 0) {
          logger.info(`Subscription ${subscription.id} already has ${existingPayments.length} payments, skipping`);
          continue;
        }
        
        logger.info(`Creating payment for subscription ${subscription.id} (${user.email})`);
        
        // Calculate dates for payment (use subscription dates or current date)
        const startDate = subscription.currentPeriodStart || new Date();
        
        // Calculate payment amounts based on subscription data
        const baseAmount = subscription.pricePerSeat * subscription.seats;
        const discountFactor = subscription.tier === 'ENTERPRISE' ? 0.85 : subscription.tier === 'PRO' ? 0.9 : 0.95;
        const finalAmount = Math.round(baseAmount * discountFactor);

        // Generate invoice data
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const subtotal = finalAmount;
        const taxRate = 0.08; // 8% tax
        const taxAmount = Math.round(subtotal * taxRate);
        const totalWithTax = subtotal + taxAmount;

        // Create payment record with invoice data
        try {
          logger.info(`Creating payment for user ${user.email} with subscription ${subscription.id}`);
          await firestoreService.createPayment({
            userId: user.id,
            subscriptionId: subscription.id,
            stripePaymentIntentId: `pi_mock_${subscription.id}`,
            stripeInvoiceId: invoiceNumber, // THIS IS THE KEY FIELD FOR INVOICES
            amount: totalWithTax,
            currency: 'usd',
            status: subscription.status === 'CANCELLED' ? 'FAILED' : 'SUCCEEDED',
            description: `${subscription.tier} subscription - ${subscription.seats} seats`,
            receiptUrl: `https://dashboard-v14.com/receipts/${invoiceNumber}`,
            billingAddressSnapshot: {
              firstName: user.email.split('@')[0],
              lastName: 'User',
              company: `${subscription.tier} Corp`,
              addressLine1: '123 Business Street',
              addressLine2: 'Suite 100',
              city: 'San Francisco',
              state: 'CA',
              postalCode: '94105',
              country: 'US',
            },
            taxAmount: taxAmount,
            taxRate: taxRate,
            taxJurisdiction: 'US',
            paymentMethod: 'credit_card',
            complianceData: {
              invoiceNumber: invoiceNumber,
              issuedDate: startDate.toISOString(),
              dueDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              items: [{
                description: `Dashboard v14 ${subscription.tier} License`,
                quantity: subscription.seats,
                unitPrice: subscription.pricePerSeat / 100,
                total: subtotal / 100,
                taxRate: taxRate,
                taxAmount: taxAmount / 100,
              }],
              subtotal: subtotal / 100,
              taxTotal: taxAmount / 100,
              total: totalWithTax / 100,
              currency: 'USD',
            },
            amlScreeningStatus: 'PASSED',
            amlScreeningDate: startDate,
            amlRiskScore: 0.1,
            pciCompliant: true,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (compatible; Dashboard-v14-Client/1.0)',
            processingLocation: 'US',
          });
          logger.info(`Payment created successfully for user ${user.email}`);
        } catch (paymentError) {
          logger.error(`Failed to create payment for user ${user.email}`, { error: (paymentError as any)?.message });
        }

        logger.info(`Created payment for subscription ${subscription.id} (${user.email})`, { 
          tier: subscription.tier, 
          seats: subscription.seats,
          subscriptionId: subscription.id
        });
      } catch (subscriptionError) {
        logger.error(`Failed to create payment for subscription ${subscription.id}`, { error: (subscriptionError as any)?.message });
      }
    }

    // Now handle any users that don't have subscriptions yet
    for (const user of testUsers) {
      try {
        // Get existing subscriptions or create new ones
        let existingSubs = await firestoreService.getSubscriptionsByUserId(user.id);
        let subscription;
        
        if (existingSubs.length > 0) {
          logger.info(`User ${user.email} already has ${existingSubs.length} subscriptions, skipping new creation`);
          continue; // Skip since we already created payments for existing subscriptions above
        } else {
          // Calculate dates based on months
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - Math.abs(user.months));
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 12); // 1 year subscription

          // Create subscription
          subscription = await firestoreService.createSubscription({
            userId: user.id,
            tier: user.tier as any,
            status: user.status === 'EXPIRED' ? 'CANCELLED' : 'ACTIVE',
            seats: user.seats,
            pricePerSeat: pricePerSeat[user.tier as keyof typeof pricePerSeat],
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
            cancelAtPeriodEnd: false,
          });

          // Generate licenses with varied statuses
          await LicenseService.generateLicenses(
            user.id,
            subscription.id,
            user.tier as any,
            user.seats,
            user.status as any,
            user.months > 0 ? user.months : 1 // Ensure positive expiry
          );
        }

        // Calculate dates for payment (use subscription dates or current date)
        const startDate = subscription.currentPeriodStart || new Date();
        
        // Calculate varied payment amounts (add some randomness for realism)
        const baseAmount = pricePerSeat[user.tier as keyof typeof pricePerSeat] * user.seats;
        const discountFactor = user.tier === 'ENTERPRISE' ? 0.85 : user.tier === 'PRO' ? 0.9 : 0.95;
        const finalAmount = Math.round(baseAmount * discountFactor);

        // Generate invoice data
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const subtotal = finalAmount;
        const taxRate = 0.08; // 8% tax
        const taxAmount = Math.round(subtotal * taxRate);
        const totalWithTax = subtotal + taxAmount;

        // Create payment record with invoice data
        try {
          logger.info(`Creating payment for user ${user.email} with subscription ${subscription.id}`);
          await firestoreService.createPayment({
            userId: user.id,
            subscriptionId: subscription.id,
            stripePaymentIntentId: `pi_mock_${subscription.id}`,
            stripeInvoiceId: invoiceNumber, // THIS IS THE KEY FIELD FOR INVOICES
            amount: totalWithTax,
            currency: 'usd',
            status: user.status === 'EXPIRED' ? 'FAILED' : 'SUCCEEDED',
            description: `${user.tier} subscription - ${user.seats} seats (${user.months} months)`,
            receiptUrl: `https://dashboard-v14.com/receipts/${invoiceNumber}`,
            billingAddressSnapshot: {
              firstName: user.email.split('@')[0],
              lastName: 'User',
              company: `${user.tier} Corp`,
              addressLine1: '123 Business Street',
              addressLine2: 'Suite 100',
              city: 'San Francisco',
              state: 'CA',
              postalCode: '94105',
              country: 'US',
            },
            taxAmount: taxAmount,
            taxRate: taxRate,
            taxJurisdiction: 'US',
            paymentMethod: 'credit_card',
            complianceData: {
              invoiceNumber: invoiceNumber,
              issuedDate: startDate.toISOString(),
              dueDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              items: [{
                description: `Dashboard v14 ${user.tier} License`,
                quantity: user.seats,
                unitPrice: pricePerSeat[user.tier as keyof typeof pricePerSeat] / 100,
                total: subtotal / 100,
                taxRate: taxRate,
                taxAmount: taxAmount / 100,
              }],
              subtotal: subtotal / 100,
              taxTotal: taxAmount / 100,
              total: totalWithTax / 100,
              currency: 'USD',
            },
            amlScreeningStatus: 'PASSED',
            amlScreeningDate: startDate,
            amlRiskScore: 0.1,
            pciCompliant: true,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (compatible; Dashboard-v14-Client/1.0)',
            processingLocation: 'US',
          });
          logger.info(`Payment created successfully for user ${user.email}`);
        } catch (paymentError) {
          logger.error(`Failed to create payment for user ${user.email}`, { error: (paymentError as any)?.message });
        }

        logger.info(`Seeded test data for ${user.email}`, { 
          tier: user.tier, 
          seats: user.seats,
          subscriptionId: subscription.id
        });
      } catch (userError) {
        logger.error(`Failed to seed data for ${user.email}`, { error: (userError as any)?.message });
        // Continue with next user instead of failing the whole process
      }
    }

    logger.info('Test data seeding completed successfully');
  } catch (err) {
    logger.error('Failed to seed test data', { error: (err as any)?.message });
  }
}

// Clear test data 
async function clearTestData(): Promise<void> {
  try {
    logger.info('Clearing test data...');

    // Get all test user IDs (exclude SUPERADMIN accounts)
    const testUserIds = [
      '1A86PkN4XmjclkWqzK9X', // user1.basic@example.com
      '5yBOkbzU2eSVJDaBSNf0', // user2.basic@example.com
      '57lVrwua5pMLx3HGyiCw', // user1.pro@example.com
      'CBZZl8KEVEScjjAkzL0E', // user2.pro@example.com
      'WGDiSdTiCXKHOSYiF1Ey', // user1.enterprise@example.com
      '7dGkcacCa0cUcdqP7Ywn', // user2.enterprise@example.com
      '1rX32QnDsUP49alkpmTC', // chrismole@gmail.com
    ];

    for (const userId of testUserIds) {
      try {
        // Get and delete subscriptions
        const subs = await firestoreService.getSubscriptionsByUserId(userId);
        for (const sub of subs) {
          // Delete licenses for this subscription
          const licenses = await firestoreService.getLicensesBySubscriptionId(sub.id);
          for (const license of licenses) {
            await firestoreService.deleteLicense(license.id);
          }
          
          // Delete payments for this subscription
          const payments = await firestoreService.getPaymentsBySubscriptionId(sub.id);
          for (const payment of payments) {
            await firestoreService.deletePayment(payment.id);
          }
          
          // Delete subscription
          await firestoreService.deleteSubscription(sub.id);
        }
        
        logger.info(`Cleared test data for user ${userId}`);
      } catch (userError) {
        logger.error(`Failed to clear data for user ${userId}`, { error: (userError as any)?.message });
      }
    }

    logger.info('Test data clearing completed');
  } catch (err) {
    logger.error('Failed to clear test data', { error: (err as any)?.message });
  }
}

// Do not perform Firestore writes at module load in Functions. Use setup endpoints below instead.

// One-time setup endpoint to (re)seed SUPERADMIN on demand, guarded by a setup token
app.post('/api/setup/seed-superadmin', async (req, res) => {
  const token = req.headers['x-setup-token'] as string;
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || token !== expected) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }
  await ensureSuperAdminSeed();
  res.json({ success: true });
});

// One-time setup endpoint to normalize legacy roles (ENTERPRISE_ADMIN -> ADMIN)
app.post('/api/setup/normalize-roles', async (req, res) => {
  const token = req.headers['x-setup-token'] as string;
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || token !== expected) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }
  await normalizeLegacyRoles();
  res.json({ success: true });
});

// Export Firebase HTTPS function for production
// Note: Uses Application Default Credentials for Firestore in Functions
// Load ADMIN_SETUP_TOKEN from Firebase Functions secrets, if configured
const ADMIN_SETUP_TOKEN = defineSecret('ADMIN_SETUP_TOKEN');

export const api = onRequest({
  region: 'us-central1',
  cors: config.corsOrigin,
  secrets: [ADMIN_SETUP_TOKEN],
}, app);

export { app, server };
