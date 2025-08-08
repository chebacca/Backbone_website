# Backend Guide (MPC)

Server
- Express app with Helmet, CORS, rate limiting on `/api/`
- JSON body and urlencoded with 10mb limit
- Health: GET /health returns status/env/version

Config
- `server/src/config/index.ts` reads envs and exposes typed `config`

Middleware
- Auth (authenticateToken, requireEmailVerification, requireRole)
- Error handling: `errorHandler`, `notFoundHandler`; return JSON only

Prisma
- `schema.prisma` defines core (User, Subscription, License, Payment) and compliance models
- Use explicit selects; avoid unbounded queries

Services
- PaymentService (Stripe), LicenseService, ComplianceService, EmailService
- Keep business logic in services; routes thin

Utils
- JWT utilities: `JwtUtil` for token generation/validation with 2FA support
- TOTP utilities: `totp.ts` using speakeasy for 2FA generation/validation
- QR code generation for 2FA setup using qrcode library

Dependencies
- Core: express, prisma, stripe, sendgrid, helmet, cors
- 2FA: speakeasy, qrcode, @types/speakeasy, @types/qrcode

Logging
- Use `logger`; never log secrets or tokens; mask identifiers

Graceful Shutdown
- Disconnect Prisma on SIGTERM/SIGINT

Testing
- Prefer service-level tests and contract tests for routes (to be added)
