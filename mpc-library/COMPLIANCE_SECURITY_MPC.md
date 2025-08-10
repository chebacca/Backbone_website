# Compliance, Security, and Privacy (MPC)

Controls
- Helmet CSP + CORS + rate limiting on `/api/` + HSTS in production
- JWT auth; email verification gates for protected actions
- Input validation and sanitization via `express-validator`/Zod
- Optional TOTP-based 2FA with interim tokens and backup codes

Audit & Consent
- `UserAuditLog` — actions (REGISTER, LOGIN, PAYMENT_PROCESS, LICENSE_*, 2FA_ENABLE, 2FA_DISABLE) with metadata, IP, UA
- `PrivacyConsent` — consentType (TERMS_OF_SERVICE, PRIVACY_POLICY, MARKETING, DATA_PROCESSING, COOKIES, ANALYTICS)
- `ComplianceEvent` — record violations, suspicious activity, AML alerts; severity; resolution trail
- `RegulatoryReport` — generated reports (AML, KYC, GDPR, etc.)

KYC/AML
- User KYC status tracked; verify via `/users/kyc/verify`
- Payments AML screening and risk scoring in PaymentService

GDPR & Data Subject Rights
- `/users/export-data` export with sensitive fields stripped
- `/users/request-deletion` gated by active subscriptions; logs GDPR event
- Data retention via `DataRetentionPolicy` and `DataProcessingRecord`

Webhooks
- Stripe signatures verified using raw request body (`express.raw`) and `stripe.webhooks.constructEvent`
- All webhook events persisted to `webhook_events`; failures retried with capped attempts
- Mount `/api/webhooks` before global JSON body parser to preserve raw body

2FA Security
- Interim tokens expire in 5 minutes with `twofaPending` flag
- TOTP window set to 1 step skew for time tolerance
- 8 single-use backup codes generated; removed upon use
- QR codes include app name and user email for proper labeling

Security Notes
- Never leak secrets; never echo tokens; mask license keys and PII in logs
- Enforce JSON responses for APIs; consistent `{ success, data|message|error }`
- Use least-privilege role checks in admin endpoints
- Interim tokens block access until 2FA verification completes
- Protect setup/debug endpoints with `x-setup-token` and disable them in production

## Versioned Legal Consent (ToS/Privacy)
- Versioning
  - Terms of Service: `config.legal.termsVersion` (env `TERMS_VERSION`, default `1.0`)
  - Privacy Policy: `config.legal.privacyVersion` (env `PRIVACY_VERSION`, default `1.0`)
- Storage
  - Event-level: `privacy_consents` collection with fields: `userId`, `consentType`, `consentGranted`, `consentVersion`, `ipAddress`, `userAgent`, `consentDate`
  - User snapshot fields (fast checks): `termsVersionAccepted`, `termsAcceptedAt`, `privacyPolicyVersionAccepted`, `privacyPolicyAcceptedAt`
- Capture points
  - Registration: records `TERMS_OF_SERVICE` and `PRIVACY_POLICY` consent with current versions
  - Payments: records `DATA_PROCESSING` consent
  - Manual: `POST /users/consent` for all supported consent types
- Enforcement
  - Login response includes `requiresLegalAcceptance` if user snapshot versions do not match current configured versions
  - Client blocks flows until acceptance and calls `POST /users/consent` with current versions
- Accounting/Legal Review
  - `GET /accounting/consents/latest` → per-user ToS/Privacy snapshot
  - `GET /accounting/users/:userId/consent-history?includePII=false|true` → full event history

Security notes
- Do not log raw tokens, full license keys, or PII; IP and UA are stored in consent events (exported with `includePII` when authorized)
- All API responses are JSON-only with consistent schema
