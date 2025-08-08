# Testing Strategy (MPC)

Levels
- Unit: utils and service pure functions
- Integration: services with Prisma test DB; route handlers with supertest
- E2E (optional): key flows (register → verify → checkout → licenses)

Priorities
- PaymentService: createSubscription, webhook handlers, updates, cancellations
- LicenseService: generate, activate, validate, analytics
- Auth flows: register/login/refresh/reset/verify

Fixtures
- Seed minimal data via `server/src/seeds` (add as needed)

Commands (to be added)
- client: `pnpm -C client test`
- server: `pnpm -C server test`

CI Suggestions
- Typecheck client/server; lint client; build; run focused integration suite
