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
// Prisma removed — all persistence is via Firestore (see `services/firestoreService.ts`)

const app: Application = express();

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
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0'
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

// Export Firebase HTTPS function for production
export const api = onRequest({
  region: 'us-central1',
  cors: config.corsOrigin,
}, app);

export { app, server };
