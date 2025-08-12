# API Endpoints (MPC)

Base URL: `${VITE_API_BASE_URL || /api}` (Firebase hosting)

## Auth
- POST /auth/register
- POST /auth/login
- POST /auth/verify-2fa
- POST /auth/refresh
- POST /auth/verify-email
- POST /auth/forgot-password
- POST /auth/reset-password
- GET  /auth/me
- PUT  /auth/me
- POST /auth/logout
- POST /auth/2fa/setup/initiate
- POST /auth/2fa/setup/verify
- POST /auth/2fa/disable

## Payments
- GET  /payments/pricing
- POST /payments/create-subscription
- GET  /payments/history?page&limit
- GET  /payments/:paymentId
- POST /payments/cancel-subscription/:subscriptionId
- PUT  /payments/payment-method/:subscriptionId
- POST /payments/calculate-tax
- POST /payments/webhook (Stripe events)

## Subscriptions
- GET  /subscriptions/my-subscriptions
- GET  /subscriptions/:subscriptionId
- PUT  /subscriptions/:subscriptionId
- POST /subscriptions/:subscriptionId/cancel
- POST /subscriptions/:subscriptionId/reactivate
- GET  /subscriptions/:subscriptionId/invoices?page&limit
- GET  /subscriptions/:subscriptionId/usage?period=7d|30d|90d
- PUT  /subscriptions/:subscriptionId/payment-method
- GET  /subscriptions/:subscriptionId/billing-history
- POST /subscriptions/:subscriptionId/preview-changes
- GET  /subscriptions/:subscriptionId/renewal
- POST /subscriptions/:subscriptionId/add-seats
  - Note: For PRO/ENTERPRISE, seat increases do not auto-issue licenses; issuance occurs on org invite acceptance or explicit seat assignment.

Plan rules:
- BASIC: exactly 1 seat
- PRO: 1–50 seats
- ENTERPRISE: >= 10 seats

## Organizations (Team Management)

- GET  /organizations/my
- GET  /organizations/my/context
- POST /organizations/:orgId/invitations
- POST /organizations/invitations/accept
- POST /organizations/:orgId/members/:memberId/remove
- PATCH /organizations/:orgId/members/:memberId
- PUT  /organizations/:orgId/members/:memberId/password

Seat accounting:
- activeSeats = count(m.status == ACTIVE) + count(m.seatReserved == true)
- Invites fail with 400 if no active subscription or no seats available

## Licenses
- GET  /licenses/my-licenses
- POST /licenses/activate
- POST /licenses/deactivate
- POST /licenses/validate
- GET  /licenses/:licenseId
- GET  /licenses/download-sdk/:licenseKey
- GET  /licenses/download-sdk/:sdkId/:licenseKey
- GET  /licenses/analytics/:licenseId?
- POST /licenses/transfer
- POST /licenses/bulk/create
  - Enterprise: Bulk create respects one-seat-one-license per user+subscription and will not create duplicates.
- GET  /licenses/sdk/versions?platform=win|mac|linux
- POST /licenses/report-issue
- GET  /licenses/usage/:licenseKey

## Users
- PUT  /users/billing-address
- PUT  /users/tax-information
- PUT  /users/business-profile
- POST /users/kyc/verify
- POST /users/consent
- GET  /users/consent-history
- GET  /users/audit-log
- POST /users/export-data
- POST /users/request-deletion
- GET  /users/statistics
- PUT  /users/notifications

## Admin
- GET  /admin/dashboard-stats
- GET  /admin/users?search&role&status&page&limit
- GET  /admin/users/:userId
- PUT  /admin/users/:userId
- GET  /admin/subscriptions?tier&status&page&limit
- GET  /admin/licenses?tier&status&page&limit
- POST /admin/licenses/:licenseId/revoke
- GET  /admin/compliance-events?severity&eventType&resolved&page&limit
- POST /admin/compliance-events/:eventId/resolve
- GET  /admin/analytics/payments?period=7d|30d|90d
- GET  /admin/analytics/licenses?period=7d|30d|90d
- POST /admin/reports/compliance
- POST /admin/enterprise/customers
- GET  /admin/system/health

## Invoices
- GET  /invoices/my-invoices?page&limit
- GET  /invoices/:invoiceId
- POST /invoices/:invoiceId/resend
- GET  /invoices/:invoiceId/download
- GET  /invoices/delivery-status/:invoiceId

## Webhooks
- POST /webhooks/stripe
- POST /webhooks/resend
- POST /webhooks/test (non-prod only)
- GET  /webhooks/health
- POST /webhooks/retry-failed

## Deployment
## Accounting
- GET  /accounting/overview
- GET  /accounting/payments?status&from&to&page&limit
- POST /accounting/payments/export
- GET  /accounting/tax/summary?from&to
- GET  /accounting/kyc
- GET  /accounting/compliance-events
- GET  /accounting/consents/latest
- GET  /accounting/users/:userId/consent-history?includePII=false|true

## Auth — Legal Acceptance Flags
- POST /auth/login → returns `requiresLegalAcceptance` and `requiredVersions` when user’s accepted versions are behind `config.legal`
- **Production**: Firebase Cloud Functions (us-central1)
- **Base URL**: https://us-central1-backbone-logic.cloudfunctions.net/api
- **Hosting**: https://backbone-logic.web.app
- **CORS**: Configured for Firebase hosting domain
- **Dev Discovery**: API exposes `/health` and `/api/health` for local auto-detection by the desktop app.
