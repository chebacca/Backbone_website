import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
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
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'wasm-unsafe-eval'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
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
  const dbPing = await firestoreService.ping();
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
  const token = req.headers['x-setup-token'] as string;
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected || token !== expected) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return;
  }
  await seedTestData();
  res.json({ success: true });
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

// Seed test data including subscriptions and licenses
async function seedTestData(): Promise<void> {
  try {
    logger.info('Seeding test data...');
    
    // Test users with their tiers and seat counts
    const testUsers = [
      { id: '1A86PkN4XmjclkWqzK9X', email: 'user1.basic@example.com', tier: 'BASIC', seats: 1 },
      { id: '5yBOkbzU2eSVJDaBSNf0', email: 'user2.basic@example.com', tier: 'BASIC', seats: 1 },
      { id: '57lVrwua5pMLx3HGyiCw', email: 'user1.pro@example.com', tier: 'PRO', seats: 5 },
      { id: 'CBZZl8KEVEScjjAkzL0E', email: 'user2.pro@example.com', tier: 'PRO', seats: 10 },
      { id: 'WGDiSdTiCXKHOSYiF1Ey', email: 'user1.enterprise@example.com', tier: 'ENTERPRISE', seats: 25 },
      { id: '7dGkcacCa0cUcdqP7Ywn', email: 'user2.enterprise@example.com', tier: 'ENTERPRISE', seats: 50 },
      { id: '1rX32QnDsUP49alkpmTC', email: 'chrismole@gmail.com', tier: 'ENTERPRISE', seats: 100 },
    ];

    const pricePerSeat = { BASIC: 2900, PRO: 9900, ENTERPRISE: 19900 };
    
    for (const user of testUsers) {
      // Create subscription
      const subscription = await firestoreService.createSubscription({
        userId: user.id,
        tier: user.tier as any,
        status: 'ACTIVE',
        seats: user.seats,
        pricePerSeat: pricePerSeat[user.tier as keyof typeof pricePerSeat],
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        cancelAtPeriodEnd: false,
      });

      // Generate licenses
      await LicenseService.generateLicenses(
        user.id,
        subscription.id,
        user.tier as any,
        user.seats
      );

      // Create mock payment record
      await firestoreService.createPayment({
        userId: user.id,
        subscriptionId: subscription.id,
        stripePaymentIntentId: `pi_mock_${subscription.id}`,
        amount: pricePerSeat[user.tier as keyof typeof pricePerSeat] * user.seats,
        currency: 'usd',
        status: 'SUCCEEDED',
        description: `${user.tier} subscription - ${user.seats} seats`,
        receiptUrl: `https://dashboard.stripe.com/receipts/mock_${subscription.id}`,
        billingAddressSnapshot: {
          firstName: user.email.split('@')[0],
          lastName: 'User',
          addressLine1: '123 Main St',
          city: 'Anytown',
          postalCode: '12345',
          country: 'US',
        },
        complianceData: {
          userType: 'individual',
          subscriptionTier: user.tier,
          seats: user.seats,
          timestamp: new Date().toISOString(),
        },
        amlScreeningStatus: 'PASSED',
        pciCompliant: true,
      });

      logger.info(`Seeded test data for ${user.email}`, { 
        tier: user.tier, 
        seats: user.seats,
        subscriptionId: subscription.id
      });
    }

    logger.info('Test data seeding completed successfully');
  } catch (err) {
    logger.error('Failed to seed test data', { error: (err as any)?.message });
  }
}

// Invoke seeding at cold start (both local and Functions)
await ensureSuperAdminSeed();

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

// Export Firebase HTTPS function for production
// Note: Uses Application Default Credentials for Firestore in Functions
export const api = onRequest({
  region: 'us-central1',
  cors: config.corsOrigin,
}, app);

export { app, server };
