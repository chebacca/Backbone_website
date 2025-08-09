# Deployment & Environments (MPC)

Environments
- Development (default): ports 3002/3003
- Production: build client, compile server, migrate, start API

Commands
- Build: `pnpm build`
- Start: `pnpm start` (server on 3003)
- Client preview: `pnpm -C client preview` (optional)

Database
- Prisma migrations: `pnpm -C server prisma migrate deploy`
- Generate client: `pnpm -C server prisma generate`

Env Vars (prod)
- FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, JWT_SECRET/EXPIRES, FRONTEND_URL, CORS_ORIGIN, STRIPE_*, SENDGRID_*
- STRIPE_* keys and price IDs; SENDGRID API key; AWS (if used)

Webhooks
- Expose `/api/webhooks/stripe` and `/api/webhooks/sendgrid` with correct public URLs
- Configure Stripe webhook endpoints per environment

Observability
- Log tails for errors; monitor webhook failure rates
- Consider health checks for k8s/containers via `/health` and `/api/webhooks/health`
