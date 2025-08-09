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
import { PasswordUtil } from './utils/password.js';
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
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"],
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

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start HTTP server only when NOT running in Cloud Functions environment or analyzer
let server: import('http').Server | undefined;
const isCloudFunctionsEnv = Boolean(
  process.env.FUNCTION_TARGET || process.env.K_SERVICE || process.env.FIREBASE_CONFIG
);

if (!isCloudFunctionsEnv) {
  // Graceful shutdown (local/VM only)
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });

  server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port}`);
    logger.info(`📊 Environment: ${config.nodeEnv}`);
    logger.info(`🔗 CORS enabled for: ${config.corsOrigin}`);
  });
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

// Invoke seeding at cold start (both local and Functions)
await ensureSuperAdminSeed();

// Ensure a SUPERADMIN exists if ADMIN_EMAIL and ADMIN_PASSWORD are provided
async function ensureSuperAdminSeed(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) return;

    const existing = await firestoreService.getUserByEmail(adminEmail);
    if (existing) {
      // Ensure role and verification
      const updates: any = {};
      if (existing.role !== 'SUPERADMIN') updates.role = 'SUPERADMIN';
      if (existing.isEmailVerified !== true) updates.isEmailVerified = true;
      if (Object.keys(updates).length > 0) {
        await firestoreService.updateUser(existing.id, updates);
        logger.info('Updated existing superadmin user settings', { email: adminEmail });
      }
      return;
    }

    const hashed = await PasswordUtil.hash(adminPassword);
    await firestoreService.createUser({
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
    logger.info('Seeded SUPERADMIN user', { email: adminEmail });
  } catch (err) {
    logger.error('Failed to ensure SUPERADMIN seed', { error: (err as any)?.message });
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
