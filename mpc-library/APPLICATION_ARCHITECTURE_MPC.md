# Application Architecture (MPC)

Scope: Dashboard v14 Licensing Website — full-stack SaaS (payments, licensing, compliance)

Layers
- Frontend (client/): React 18 + TypeScript, Vite, MUI, React Query, Stripe.js
- Backend (server/): Express, Prisma (PostgreSQL), Stripe SDK, SendGrid, Helmet, CORS, Rate limiting
- Shared (shared/): Type-safe cross-package types

Ports
- Web: http://localhost:3002
- API: http://localhost:3003

Key Services (server/src/services)
- PaymentService: Stripe subscriptions, payments, invoices, webhooks, pricing, updates
- LicenseService: license generation, activation, validation, analytics, bulk ops, SDK downloads
- ComplianceService: consent, KYC/AML hooks, audit logs, compliance events
- EmailService: transactional emails (welcome, license delivery, reset)

API Routes (server/src/routes)
- auth, payments, subscriptions, licenses, users, admin, webhooks

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

Data Flow Highlights
- Checkout → PaymentService.createSubscription → Stripe create → DB Subscription+Payment → LicenseService.generateLicenses → Email delivery → Compliance logs
- Activation → LicenseService.activateLicense(device) → validations → update license + analytics → cloud config
- Webhooks → PaymentService.handleWebhook → update Payment/Subscription → audit/compliance

Client Integration
- `client/src/services/api.ts` provides `api` instance, `endpoints`, `apiUtils`
- Set `VITE_API_BASE_URL` to API origin (3003)

See also: API_ENDPOINTS_MPC.md, PAYMENTS_STRIPE_MPC.md, LICENSE_MANAGEMENT_MPC.md, COMPLIANCE_SECURITY_MPC.md
