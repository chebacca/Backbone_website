# Backend (MPC)

## Current Status
- **Deployment**: Firebase Cloud Functions (us-central1)
- **Runtime**: Node.js 20
- **Memory**: 256MB
- **Database**: PostgreSQL via Prisma (production)

## Architecture
- **Framework**: Express.js with TypeScript
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: JWT with Firebase Admin
- **Email**: Resend API (replaced SendGrid)
- **Payments**: Stripe SDK v14
- **Security**: Helmet, CORS, Rate limiting

## Dependencies

### Core
- Express 4.21.2
- TypeScript 5.3.3
- Prisma 6.3.1 (PostgreSQL client)

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
- SendGrid 8.1.0 (legacy, can be removed)

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

## Database
- **Schema**: `server/prisma/schema.prisma`
- **Migrations**: Prisma migration system
- **Seeding**: Available via pnpm seed commands
- **Client**: Generated Prisma client

## Environment Variables
Configured in Firebase Functions:
- Database connection
- Stripe keys and webhooks
- Resend API key
- JWT secrets
- Firebase credentials
- Admin setup tokens

## Development
```bash
pnpm dev:server           # Start with tsx watch
pnpm build:server         # Build TypeScript
pnpm start                # Run compiled server
```

## Deployment
- Functions deployed via `firebase deploy --only functions`
- Environment variables set in Firebase Console
- Database migrations run separately
- Prisma client generated during build
