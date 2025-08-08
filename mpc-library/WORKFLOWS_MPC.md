# Workflows (MPC)

User Checkout
1) Register/Login → verified email
2) Select plan/seats → collect billing details
3) Create payment method → call POST /payments/create-subscription
4) On success → licenses issued, email sent, dashboard shows licenses/payments

Authentication Flow
1) Login with email/password
2) If 2FA enabled → receive `{ requires2FA, interimToken }`
3) Enter TOTP code or backup code → POST /auth/verify-2fa
4) On success → receive full access/refresh tokens

2FA Setup Flow
1) User enables 2FA in Settings → POST /auth/2fa/setup/initiate
2) Scan QR code with authenticator app
3) Enter 6-digit code → POST /auth/2fa/setup/verify
4) Receive backup codes for safekeeping
5) 2FA now enabled for future logins

License Activation
1) User retrieves license key
2) Client app calls POST /licenses/activate with device info
3) On success → returns cloud config and updates analytics

Manage Subscription
- Update seats/tier → PUT /subscriptions/:id
- Cancel/reactivate → POST /subscriptions/:id/(cancel|reactivate)
- Update payment method → PUT /subscriptions/:id/payment-method

Compliance & Privacy
- Consent management → POST /users/consent; GET history
- Data export/deletion → POST /users/(export-data|request-deletion)
- 2FA management → enable/disable via Settings with audit logging

Admin Oversight
- Dashboard stats; user search; revoke licenses; resolve compliance events
- Reports: POST /admin/reports/compliance
