# Firebase Deployment Guide

This project is configured for Firebase hosting and Firestore database.

## Prerequisites

1. **Firebase CLI**: Install the Firebase CLI
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account**: Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

3. **Login to Firebase**:
   ```bash
   firebase login
   ```

## Initial Setup

1. **Initialize Firebase Project**:
   ```bash
   firebase init
   ```
   
   Select the following options:
   - Hosting: Configure files for Firebase Hosting
   - Functions: Configure a Cloud Functions directory and its files
   - Firestore: Configure security rules and indexes for Firestore
   - Use an existing project
   - Select your Firebase project

2. **Configure Environment Variables**:
   
   Create a `.env` file in the `server/` directory:
   ```env
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENTS\n-----END PRIVATE KEY-----"
   
   # JWT Configuration
   JWT_SECRET=your-super-secure-jwt-secret
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Email Configuration
   SENDGRID_API_KEY=SG.your_sendgrid_api_key
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Dashboard v14 Licensing
   
   # Frontend URLs (use your Firebase hosting URL)
   FRONTEND_URL=https://your-project-id.web.app
   CORS_ORIGIN=https://your-project-id.web.app
   ```

3. **Set Firebase Functions Environment Variables**:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_test_your_stripe_secret_key"
   firebase functions:config:set stripe.publishable_key="pk_test_your_stripe_publishable_key"
   firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
   firebase functions:config:set sendgrid.api_key="SG.your_sendgrid_api_key"
   firebase functions:config:set jwt.secret="your-super-secure-jwt-secret"
   firebase functions:config:set admin.email="admin@yourdomain.com"
   firebase functions:config:set admin.password="admin123"
   ```

## Development

1. **Start Development Environment**:
   ```bash
   pnpm dev
   ```
   
   This will start:
   - Frontend: http://localhost:3002
   - Backend: http://localhost:3003

2. **Build for Production**:
   ```bash
   pnpm build
   ```

## Deployment

1. **Deploy Everything**:
   ```bash
   pnpm deploy
   ```

2. **Deploy Specific Services**:
   ```bash
   # Deploy only hosting
   pnpm deploy:hosting
   
   # Deploy only functions
   pnpm deploy:functions
   
   # Deploy only Firestore rules
   pnpm deploy:firestore
   ```

## Production URLs

After deployment, your app will be available at:
- **Frontend**: https://your-project-id.web.app
- **API**: https://your-project-id.web.app/api/* (routed to Cloud Functions)

## Environment Configuration

### Development
- Frontend: http://localhost:3002
- Backend: http://localhost:3003
- Database: Local development

### Production
- Frontend: Firebase Hosting
- Backend: Firebase Cloud Functions
- Database: Firestore

## Troubleshooting

1. **Functions Not Deploying**:
   ```bash
   firebase functions:log
   ```

2. **Hosting Issues**:
   ```bash
   firebase hosting:channel:list
   ```

3. **Firestore Rules**:
   ```bash
   firebase firestore:rules:get
   ```

## Security

1. **Firestore Rules**: Update `firestore.rules` for your security requirements
2. **CORS**: Configure CORS in `firebase.json` for your domain
3. **Environment Variables**: Never commit sensitive environment variables

## Monitoring

1. **Firebase Console**: Monitor your app at [console.firebase.google.com](https://console.firebase.google.com)
2. **Functions Logs**: View function logs in the Firebase console
3. **Analytics**: Enable Firebase Analytics for user insights

## Local Development with Firebase Emulators

1. **Start Emulators**:
   ```bash
   firebase emulators:start
   ```

2. **Configure for Emulators**:
   ```bash
   firebase use --add your-project-id
   firebase use your-project-id
   ```

## API Endpoints

All API endpoints are available at `/api/*` and are routed to Firebase Cloud Functions:

- Authentication: `/api/auth/*`
- Payments: `/api/payments/*`
- Subscriptions: `/api/subscriptions/*`
- Licenses: `/api/licenses/*`
- Users: `/api/users/*`
- Admin: `/api/admin/*`
- Webhooks: `/api/webhooks/*`

## Database Schema

The project uses Firestore with the following collections:
- `users` - User accounts and profiles
- `licenses` - License keys and metadata
- `subscriptions` - Subscription data
- `payments` - Payment records
- `auditLogs` - System audit logs
- `webhookEvents` - Webhook event logs
