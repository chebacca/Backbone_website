# Deployment (MPC)

## Current Status
- **Production**: Fully deployed on Firebase (backbone-logic.web.app)
- **Backend**: Firebase Cloud Functions (api function)
- **Database**: PostgreSQL production database via Prisma
- **Hosting**: Firebase Hosting with SPA routing

## Deployment Commands

### Full Deployment
```bash
pnpm deploy                    # Build and deploy to Firebase
pnpm deploy:all               # Build and deploy everything
pnpm deploy:hosting           # Deploy only frontend
pnpm deploy:functions         # Deploy only backend
pnpm deploy:firestore         # Deploy database rules/indexes
```

### Development
```bash
pnpm dev                      # Run both client and server locally
pnpm dev:client              # Run only frontend
pnpm dev:server              # Run only backend
```

### Build
```bash
pnpm build                    # Build all packages
pnpm build:shared            # Build shared types
pnpm build:client            # Build frontend
pnpm build:server            # Build backend
```

## Firebase Configuration
- **Project**: backbone-logic
- **Region**: us-central1
- **Runtime**: Node.js 20
- **Memory**: 256MB (functions)

## Environment Variables
All environment variables are configured in Firebase Functions:
- Stripe keys and webhooks
- Resend API for emails
- JWT secrets
- Database connection
- Admin credentials

## Database
- **Production**: PostgreSQL via Prisma
- **Schema**: server/prisma/schema.prisma
- **Migrations**: Prisma migrations
- **Seeding**: Available via pnpm seed commands

## Monitoring
- Firebase Console for functions and hosting
- Stripe Dashboard for payments
- Resend Dashboard for email delivery
