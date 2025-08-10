import dotenv from 'dotenv';

dotenv.config();

// Helper function to get config value from Firebase Functions or environment
function getConfigValue(key: string, defaultValue: string = ''): string {
  // Check if we're running in Firebase Functions (multiple indicators)
  const isFirebaseFunctions = 
    typeof process.env.FIREBASE_FUNCTION_TARGET !== 'undefined' ||
    typeof process.env.FUNCTION_TARGET !== 'undefined' ||
    typeof process.env.K_SERVICE !== 'undefined' ||
    typeof process.env.GOOGLE_CLOUD_PROJECT !== 'undefined';
    
  if (isFirebaseFunctions) {
    try {
      // Use Firebase Functions config
      const functions = require('firebase-functions');
      const config = functions.config();
      
      console.log(`🔧 Loading Firebase config for ${key}`);
      console.log(`📋 Available config keys:`, Object.keys(config));
      
      // Map environment variable names to Firebase config paths
      const configMap: Record<string, string> = {
        'FIREBASE_PROJECT_ID': 'firebase.project_id',
        'FIREBASE_CLIENT_EMAIL': 'firebase.client_email', 
        'FIREBASE_PRIVATE_KEY': 'firebase.private_key',
        'JWT_SECRET': 'jwt.secret',
        'JWT_EXPIRES_IN': 'jwt.expires_in',
        'JWT_REFRESH_EXPIRES_IN': 'jwt.refresh_expires_in',
        'STRIPE_SECRET_KEY': 'stripe.secret_key',
        'STRIPE_PUBLISHABLE_KEY': 'stripe.publishable_key',
        'STRIPE_WEBHOOK_SECRET': 'stripe.webhook_secret',
        'STRIPE_BASIC_PRICE_ID': 'stripe.basic_price_id',
        'STRIPE_PRO_PRICE_ID': 'stripe.pro_price_id',
        'STRIPE_ENTERPRISE_PRICE_ID': 'stripe.enterprise_price_id',
        'STRIPE_TEST_MODE': 'stripe.test_mode',
        'STRIPE_ENABLED': 'stripe.enabled',
        'SENDGRID_API_KEY': 'sendgrid.api_key',
        'FROM_EMAIL': 'sendgrid.from_email',
        'FROM_NAME': 'sendgrid.from_name',
        'RESEND_API_KEY': 'resend.api_key',
        'RESEND_FROM_EMAIL': 'resend.from_email',
        'RESEND_FROM_NAME': 'resend.from_name',
        'FRONTEND_URL': 'frontend.url',
        'CORS_ORIGIN': 'cors.origin',
        'ADMIN_EMAIL': 'admin.email',
        'ADMIN_PASSWORD': 'admin.password',
        'ADMIN_NAME': 'admin.name',
      };
      
      const configPath = configMap[key];
      if (configPath) {
        console.log(`🔍 Looking for config path: ${configPath}`);
        const value = configPath.split('.').reduce((obj: any, prop: string) => obj?.[prop], config);
        console.log(`📥 Found value for ${key}:`, value ? '***' : 'undefined');
        if (value) return value;
      } else {
        console.log(`❌ No config mapping found for ${key}`);
      }
    } catch (error) {
      // Fallback to process.env if Firebase config not available
      console.log(`⚠️ Firebase config error for ${key}:`, error);
    }
  } else {
    console.log(`🏠 Local development mode for ${key}`);
  }
  
  // Local development - use process.env
  const envValue = process.env[key] || defaultValue;
  console.log(`🌍 Environment value for ${key}:`, envValue ? '***' : 'undefined');
  return envValue;
}

export const config = {
  // Server (only used for local development)
  port: parseInt(process.env.PORT || '3003'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Firebase (primary database)
  firebase: {
    projectId: getConfigValue('FIREBASE_PROJECT_ID'),
    clientEmail: getConfigValue('FIREBASE_CLIENT_EMAIL'),
    privateKey: getConfigValue('FIREBASE_PRIVATE_KEY'),
  },

  // JWT
  jwtSecret: getConfigValue('JWT_SECRET', 'your-super-secure-jwt-secret'),
  jwtExpiresIn: getConfigValue('JWT_EXPIRES_IN', '7d'),
  jwtRefreshExpiresIn: getConfigValue('JWT_REFRESH_EXPIRES_IN', '30d'),

  // Stripe
  stripe: {
    secretKey: getConfigValue('STRIPE_SECRET_KEY'),
    publishableKey: getConfigValue('STRIPE_PUBLISHABLE_KEY'),
    webhookSecret: getConfigValue('STRIPE_WEBHOOK_SECRET'),
    basicPriceId: getConfigValue('STRIPE_BASIC_PRICE_ID'),
    proPriceId: getConfigValue('STRIPE_PRO_PRICE_ID'),
    enterprisePriceId: getConfigValue('STRIPE_ENTERPRISE_PRICE_ID'),
    // Test mode configuration
    testMode: getConfigValue('STRIPE_TEST_MODE') === 'true',
    // Disable Stripe completely if needed
    enabled: getConfigValue('STRIPE_ENABLED') !== 'false',
  },

  // Email
  sendgrid: {
    apiKey: getConfigValue('SENDGRID_API_KEY'),
    fromEmail: getConfigValue('FROM_EMAIL', 'noreply@example.com'),
    fromName: getConfigValue('FROM_NAME', 'Dashboard v14 Licensing'),
  },

  // Resend (preferred email service)
  resend: {
    apiKey: getConfigValue('RESEND_API_KEY'),
    fromEmail: getConfigValue('RESEND_FROM_EMAIL') || getConfigValue('FROM_EMAIL', 'noreply@backbone-logic.com'),
    fromName: getConfigValue('RESEND_FROM_NAME') || getConfigValue('FROM_NAME', 'Backbone Logic'),
  },

  // Frontend (Firebase hosting URL)
  frontendUrl: getConfigValue('FRONTEND_URL', 'https://your-project-id.web.app'),

  // Cloud Services
  aws: {
    accessKeyId: getConfigValue('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getConfigValue('AWS_SECRET_ACCESS_KEY'),
    region: getConfigValue('AWS_REGION', 'us-east-1'),
    s3BucketName: getConfigValue('S3_BUCKET_NAME', 'dashboard-v14-assets'),
  },

  // Rate Limiting
  rateLimitWindowMs: parseInt(getConfigValue('RATE_LIMIT_WINDOW_MS', '900000')), // 15 minutes
  rateLimitMaxRequests: parseInt(getConfigValue('RATE_LIMIT_MAX_REQUESTS', '100')),

  // Security
  bcryptRounds: parseInt(getConfigValue('BCRYPT_ROUNDS', '12')),
  corsOrigin: getConfigValue('CORS_ORIGIN', 'https://your-project-id.web.app'),

  // Admin
  admin: {
    email: getConfigValue('ADMIN_EMAIL', 'admin@example.com'),
    password: getConfigValue('ADMIN_PASSWORD', 'admin123'),
    name: getConfigValue('ADMIN_NAME', 'Admin User'),
  },

  // Features
  features: {
    enableRegistration: getConfigValue('ENABLE_REGISTRATION') !== 'false',
    enableEmailVerification: getConfigValue('ENABLE_EMAIL_VERIFICATION') !== 'false',
    enablePasswordReset: getConfigValue('ENABLE_PASSWORD_RESET') !== 'false',
    enableUsageAnalytics: getConfigValue('ENABLE_USAGE_ANALYTICS') !== 'false',
    enableStripe: getConfigValue('STRIPE_ENABLED') !== 'false',
  },

  // Pricing
  pricing: {
    basicPricePerSeat: parseInt(getConfigValue('BASIC_PRICE_PER_SEAT', '2900')),
    proPricePerSeat: parseInt(getConfigValue('PRO_PRICE_PER_SEAT', '9900')),
  },

  // Environment helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
