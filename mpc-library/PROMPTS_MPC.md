# Prompts & Callouts (MPC)

General
- "Consult `mpc-library/` docs before editing. Keep ports 3002/3003, pnpm, and API JSON contracts intact."

Auth
- "Add email verification enforcement to route X using `requireEmailVerification` and ensure JSON error schema."
- "2FA login flow: handle `{ requires2FA, interimToken }` response and show code input."
- "2FA setup: use `totp.ts` utilities for QR generation and validation."

Payments
- "Integrate new tier price ID: update config, PaymentService.getStripePriceId, and pricing endpoints. Update docs."

Licensing
- "Add activation limit rule: extend LicenseService.activateLicense validation and Prisma schema if needed."

Compliance
- "Record consent for new consentType Y with version, IP, UA; reflect in privacy UI and docs."
- "2FA events: log 2FA_ENABLE/2FA_DISABLE to UserAuditLog with metadata."

Frontend
- "Use api.endpoints + apiUtils.withLoading for request; display field-level errors mapped from server validator."
- "2FA challenge: catch login response, show code input, call verify2FA with interim token."

Prod-Ready
- "Verify build succeeds, run DB migrate deploy, and configure Stripe/SendGrid webhooks for environment."
- "2FA dependencies: ensure speakeasy, qrcode, and types are installed in production."
