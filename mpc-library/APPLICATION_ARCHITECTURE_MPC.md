# Application Architecture (MPC)

Scope: Dashboard v14 Licensing Website — full-stack SaaS (payments, licensing, compliance)

Layers
- Frontend (client/): React 18 + TypeScript, Vite, MUI, React Query, Stripe.js, Framer Motion, Notistack
- Backend (server/): Express, Prisma (PostgreSQL), Stripe SDK, Resend (email), Helmet, CORS, Rate limiting
- Shared (shared/): Type-safe cross-package types

Deployment
- Production: Firebase Hosting (https://backbone-logic.web.app)
- Backend API: Firebase Cloud Functions (https://us-central1-backbone-logic.cloudfunctions.net/api)
- Database: PostgreSQL via Prisma (production database)
- Development: Local development with pnpm dev

Key Services (server/src/services)
- PaymentService: Stripe subscriptions, payments, invoices, webhooks, pricing, updates
- LicenseService: license generation, activation, validation, analytics, bulk ops, SDK downloads
- ComplianceService: consent, KYC/AML hooks, audit logs, compliance events
- EmailService: transactional emails via Resend (welcome, license delivery, reset)
- DataConnectService: Google Cloud Data Connect integration (optional)

API Routes (server/src/routes)
- auth, payments, subscriptions, licenses, users, admin, webhooks, invoices

Security
- JWT via `JwtUtil` (access/refresh)
- Middleware: `authenticateToken`, `requireEmailVerification`, `requireRole`
- Helmet+CORS+rate limiting under `/api/`
- Webhook persistence in `webhook_events`

Database (server/prisma/schema.prisma)
- Core: User, Subscription, License, Payment, Organization
- Compliance: UserAuditLog, PrivacyConsent, ComplianceEvent, RegulatoryReport
- Email/Webhooks: EmailLog, WebhookEvent
- SDK: SDKVersion
- Invoices: Invoice system with delivery tracking

Data Flow Highlights
- Checkout → PaymentService.createSubscription → Stripe create → DB Subscription+Payment → LicenseService.generateLicenses → Email delivery → Compliance logs
- Activation → LicenseService.activateLicense(device) → validations → update license + analytics → cloud config
- Webhooks → PaymentService.handleWebhook → update Payment/Subscription → audit/compliance

Client Integration
- `client/src/services/api.ts` provides `api` instance, `endpoints`, `apiUtils`
- Set `VITE_API_BASE_URL` to `/api` for Firebase hosting (default)

Desktop Application Integration
- Simplified startup system replacing complex ApplicationStartupSequencer (1,517 lines → 400 lines)
- Direct authentication bridge with licensing website API
- Unified project creation dialog reused from web interface
- Seamless mode switching between Standalone and Network modes
- Full integration with Firestore/GCS project metadata
- Development port coordination:
  - Website serves `client/public/health.json` for auto-discovery
  - API exposes `/health` and `/api/health`
  - Desktop app auto-detects local ports, with per-user overrides stored in localStorage
  - Optional project hint: `project.settings.preferredPorts.website|api` (non-authoritative)
- JWT token synchronization and license validation

Package Management
- pnpm workspace with client, server, shared packages
- Node >= 18, pnpm >= 8.15.3
- TypeScript 5.3.3, Vite 5.0.8

See also: API_ENDPOINTS_MPC.md, PAYMENTS_STRIPE_MPC.md, LICENSE_MANAGEMENT_MPC.md, COMPLIANCE_SECURITY_MPC.md, DESKTOP_INTEGRATION_MPC.md

## Enterprise Architecture

- Organizations: `organizations`, `org_members`, `org_invitations`
- Seats tracked on `subscriptions.seats`
- Licenses tied to subscriptions and `organizationId` for enterprise flows
- Seat-to-license policy: one seat equals one license per user per subscription (no duplicates)
- Issuance policy: PRO/ENTERPRISE licenses are issued JIT on invite acceptance; not mass-issued on purchase or seat increases
 - Team context endpoint: `GET /organizations/my/context` returns `{ organization, members, primaryRole, activeSubscription }` used by Team UI for accurate seat counts
