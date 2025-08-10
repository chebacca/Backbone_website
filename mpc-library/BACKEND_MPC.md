# Backend (MPC)

## Current Status
- **Deployment**: Firebase Cloud Functions (us-central1)
- **Runtime**: Node.js 20
- **Memory**: 256MB
- **Database**: Firestore via Firebase Admin (authoritative)

## Architecture
- **Framework**: Express.js with TypeScript
- **Database**: Firestore (admin SDK) via `services/firestoreService.ts` (centralized access)
- **DB Facade**: `services/db.ts` maps legacy Prisma-shaped calls to Firestore implementations
- **Authentication**: JWT with Firebase Admin
- **Email**: Resend API (SendGrid as fallback for events)
- **Payments**: Stripe SDK v14
- **Security**: Helmet (with HSTS in prod), CORS, Rate limiting

## Dependencies

### Core
- Express 4.21.2
- TypeScript 5.3.3
- Firebase Admin 13.x (Firestore/Auth)

### Security & Middleware
- Helmet 7.1.0
- CORS 2.8.5
- Express Rate Limit 7.5.0
- Express Validator 7.2.1

### Authentication & JWT
- Firebase Admin 13.4.0
- JWT 9.0.2
- Speakeasy 2.0.0 (2FA)
- QRCode 1.5.4

### External Services
- Stripe 14.14.0
- Resend 6.0.1 (email)
- SendGrid 8.1.0 (fallback/event webhooks)

### Utilities
- Zod 3.22.4 (validation)
- UUID 9.0.1
- GraphQL 16.9.0 (Data Connect)

## Project Structure
```
server/src/
├── config/           # Configuration files
├── middleware/       # Express middleware
├── routes/           # API route handlers
├── services/         # Business logic services
├── utils/            # Utility functions
├── scripts/          # Database scripts
└── seeds/            # Database seeding
```

## API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/payments/*` - Stripe payment processing
- `/api/subscriptions/*` - Subscription management
- `/api/licenses/*` - License operations
- `/api/users/*` - User management
- `/api/admin/*` - Admin operations
- `/api/webhooks/*` - External webhooks
- `/api/invoices/*` - Invoice system
 - `/api/accounting/*` - Accounting & compliance review (payments, tax summary, KYC, consent snapshots)

## Database
- **Authoritative**: Firestore collections (see `services/firestoreService.ts` types)
- **Seeding**: Setup endpoints guarded by `x-setup-token` (disabled in production)
- **Note**: Legacy Prisma references have been removed from runtime paths

## Environment Variables
Configured in Firebase Functions:
- Database connection
- Stripe keys and webhooks
- Resend API key
- JWT secrets
- Firebase credentials
- Admin setup tokens
 - TERMS_VERSION (default `1.0`) — ToS version for consent
 - PRIVACY_VERSION (default `1.0`) — Privacy Policy version for consent

## Development
```bash
pnpm dev:server           # Start with tsx watch
pnpm build:server         # Build TypeScript
pnpm start                # Run compiled server
```

## Deployment
- Functions deployed via `pnpm deploy` (Firebase Hosting + Functions)
- Environment variables set via Functions secrets / env
- No SQL migrations; Firestore used for persistence
