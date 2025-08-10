# Deployment (MPC)

## Current Status
- **Production**: Fully deployed on Firebase (backbone-logic.web.app)
- **Backend**: Firebase Cloud Functions (api function)
- **Database**: Firestore via Firebase Admin (authoritative)
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
- Stripe keys and webhooks (Functions secret `STRIPE_WEBHOOK_SECRET`)
- Resend/SendGrid API keys for emails
- JWT secrets
- Firebase Admin credentials
- Admin setup token (`ADMIN_SETUP_TOKEN`) for guarded setup endpoints (non-prod)

## Database
- **Production**: Firestore collections (see `server/src/services/firestoreService.ts` types)
- **Schema**: Modeled via TypeScript interfaces, no SQL schema
- **Migrations**: Not applicable (NoSQL); evolve collections via services
- **Seeding**: Guarded setup endpoints; disabled in production

## Monitoring
- Firebase Console for functions and hosting
- Stripe Dashboard for payments
- Resend Dashboard for email delivery

## Post-Deploy Checklist
- [ ] Visit `/api/health` → returns `ok`
- [ ] Stripe webhook test via Stripe CLI → event stored in `webhook_events` and processed
- [ ] HSTS header present in production responses (`Strict-Transport-Security`)
- [ ] Setup/debug endpoints return 403/404 in production
