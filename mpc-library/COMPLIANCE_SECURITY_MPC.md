# Compliance, Security, and Privacy (MPC)

Controls
- Helmet CSP + CORS + rate limiting on `/api/`
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
- All webhook events persisted; failures retried with capped attempts

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
