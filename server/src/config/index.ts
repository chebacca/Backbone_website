import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server (only used for local development)
  port: parseInt(process.env.PORT || '3003'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Firebase (primary database)
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  },

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    basicPriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    proPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    enterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    // Test mode configuration
    testMode: process.env.STRIPE_TEST_MODE === 'true',
    // Disable Stripe completely if needed
    enabled: process.env.STRIPE_ENABLED !== 'false',
  },

  // OAuth Providers
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID || '',
    teamId: process.env.APPLE_TEAM_ID || '',
    keyId: process.env.APPLE_KEY_ID || '',
    privateKey: process.env.APPLE_PRIVATE_KEY || '',
    redirectUri: process.env.APPLE_REDIRECT_URI || '',
  },

  // Email
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
    fromName: process.env.FROM_NAME || 'Dashboard v14 Licensing',
  },

  // Resend (preferred email service)
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@backbone-logic.com',
    fromName: process.env.RESEND_FROM_NAME || process.env.FROM_NAME || 'Backbone Logic',
  },

  // Frontend (Firebase hosting URL)
  frontendUrl: process.env.FRONTEND_URL || 'https://your-project-id.web.app',

  // Cloud Services
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3BucketName: process.env.S3_BUCKET_NAME || 'dashboard-v14-assets',
  },

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  corsOrigin: process.env.CORS_ORIGIN || 'https://your-project-id.web.app',

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'Admin User',
  },

  // Features
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
    enablePasswordReset: process.env.ENABLE_PASSWORD_RESET !== 'false',
    enableUsageAnalytics: process.env.ENABLE_USAGE_ANALYTICS !== 'false',
    enableStripe: process.env.STRIPE_ENABLED !== 'false',
  },

  // Legal versions (used for versioned consent)
  legal: {
    termsVersion: process.env.TERMS_VERSION || '1.0',
    privacyVersion: process.env.PRIVACY_VERSION || '1.0',
  },

  // Pricing
  pricing: {
    basicPricePerSeat: parseInt(process.env.BASIC_PRICE_PER_SEAT || '2900'),
    proPricePerSeat: parseInt(process.env.PRO_PRICE_PER_SEAT || '9900'),
  },

  // Environment helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
