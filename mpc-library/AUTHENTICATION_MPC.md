# Authentication & Authorization (MPC)

Tokens
- Access and Refresh tokens via `JwtUtil.generateTokens`
- Claims: `{ userId, email, role }`
- Env-driven expirations: `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- Interim tokens for 2FA: `JwtUtil.generateInterimToken` with `twofaPending` flag

Middleware
- `authenticateToken` — validates Bearer token, loads user, attaches `req.user`
- `requireEmailVerification` — enforces verified email for protected routes
- `requireRole([roles])`, `requireAdmin`, `requireEnterpriseAdmin`
- `optionalAuth` — attaches user if token valid, not required
- `addRequestInfo` — sets `requestInfo` (ip, userAgent, timestamp)

Two-Factor Authentication (TOTP)
- Optional TOTP-based 2FA using speakeasy and qrcode
- Database fields: `twoFactorEnabled`, `twoFactorSecret`, `twoFactorTempSecret`, `twoFactorBackupCodes`
- Login flow: if 2FA enabled, returns `{ requires2FA: true, interimToken }` instead of full tokens
- Verify endpoint: `POST /api/auth/verify-2fa` with interim token and TOTP/backup code
- Setup flow: initiate → QR code → verify → enable + backup codes
- Security: 1-step TOTP window, 5-minute interim token expiry, 8 single-use backup codes

RBAC Roles
- USER, ADMIN, ENTERPRISE_ADMIN
- Admin routes require `requireAdmin`

Auth Routes
- Register → email verification token stored in DB and sent via EmailService
- Login → returns tokens + basic user + active subscription summary (or 2FA challenge)
- POST /auth/verify-2fa → validates TOTP/backup code, returns full tokens
- POST /auth/2fa/setup/initiate → returns QR code and temp secret
- POST /auth/2fa/setup/verify → enables 2FA, returns backup codes
- POST /auth/2fa/disable → disables 2FA, clears secrets
- Refresh → verifies refresh, returns new tokens
- Verify Email → sets `isEmailVerified=true`, clears verify token
- Forgot/Reset Password → password reset token and expiry, secure update
- Me/Update → profile fetch and updates (email change re-verifies)
- Logout → server-side audit log only; client clears local storage

Client Practices
- Store `auth_token` in localStorage (short term). Consider rotation/refresh.
- Set `Authorization: Bearer <token>` in requests.
- On 401 intercept, clear token and redirect to `/login`.
- Handle 2FA challenge: catch `{ requires2FA, interimToken }` from login, show code input.

Audit & Compliance
- Log REGISTER, LOGIN, LOGOUT, PROFILE_UPDATE, PASSWORD_CHANGE, 2FA_ENABLE, 2FA_DISABLE to `UserAuditLog`
- Record consent for ToS/Privacy/Marketing/Data Processing

Security Notes
- Never return HTML on API; always JSON with `success`, `message|error`, `data`.
- Never include full token in logs; only token type or short hashes when needed.
- Interim tokens contain `twofaPending` flag; `authenticateToken` blocks access.
- Backup codes are single-use and removed upon verification.
