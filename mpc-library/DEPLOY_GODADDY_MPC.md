# Deploying to GoDaddy (MPC)

This app is a full-stack Node + PostgreSQL + Stripe system. Recommended: GoDaddy VPS (Ubuntu) or host the API elsewhere and use GoDaddy only for static frontend. Shared/cPanel hosting is not ideal for Prisma/PostgreSQL and long-running Node services.

## Option A — GoDaddy VPS (Recommended)

### 1) Domain & DNS
- Create subdomains:
  - `licensing.yourdomain.com` → SPA
  - `api.licensing.yourdomain.com` → API
- Point both to the VPS public IP (A records).

### 2) Server setup (Ubuntu)
SSH to the VPS and run (adjust as needed):

```bash
# Update system
sudo apt update && sudo apt -y upgrade

# Install Node 18, pnpm, git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt -y install nodejs git
corepack enable
corepack prepare pnpm@latest --activate

# Install Nginx and Certbot
sudo apt -y install nginx
sudo apt -y install certbot python3-certbot-nginx

# Install PM2
sudo npm i -g pm2
```

### 3) App deployment
```bash
# Clone project (or copy via SCP)
cd /opt
sudo git clone <your_repo_url> dashboard-v14-licensing-website
sudo chown -R $USER:$USER dashboard-v14-licensing-website
cd dashboard-v14-licensing-website

# Install deps and set up DB
pnpm install
pnpm setup:db  # prisma generate + db push

# Build client and server
pnpm build
```

### 4) Environment
Create `server/.env` (values from GoDaddy/Stripe/SendGrid):

```env
PORT=3003
NODE_ENV=production
FRONTEND_URL=https://licensing.yourdomain.com
CORS_ORIGIN=https://licensing.yourdomain.com
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/licensing_db

JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

SENDGRID_API_KEY=...
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Dashboard v14 Licensing
```

Use a managed Postgres (Neon/Supabase/Railway) or provision Postgres on VPS.

### 5) PM2 process manager
A ready config is included: `server/ecosystem.config.cjs`.

```bash
cd server
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup systemd -u $USER --hp $HOME
```

### 6) Nginx reverse proxy
An example config is included: `config/nginx/godaddy.conf`. Edit domain names and place it:

```bash
sudo cp config/nginx/godaddy.conf /etc/nginx/sites-available/licensing
sudo ln -s /etc/nginx/sites-available/licensing /etc/nginx/sites-enabled/licensing
sudo nginx -t && sudo systemctl reload nginx
```

Issue SSL certs:
```bash
sudo certbot --nginx -d licensing.yourdomain.com -d api.licensing.yourdomain.com --redirect
```

### 7) Stripe webhooks
Set Stripe endpoint to:
- `https://api.licensing.yourdomain.com/api/webhooks/stripe`

### 8) Client env
If using SSRless SPA only, ensure `client` uses API URL at build time:

```env
# client/.env.production
VITE_API_BASE_URL=https://api.licensing.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Rebuild client if changed: `pnpm -C client build`.

---

## Option B — GoDaddy Shared/cPanel (Static SPA + External API)
- Build SPA: `pnpm -C client build` → upload `client/dist` contents to `public_html` (or a subdomain root) via cPanel/File Manager/FTP.
- API and Postgres: host on a provider that supports Node + PostgreSQL (e.g., GoDaddy VPS, Render, Railway, Fly.io, AWS). Configure CORS to the SPA origin.
- Set `VITE_API_BASE_URL` to your API domain before building the SPA.
- Stripe webhooks must target the API host. Shared hosting rarely suits Node + Prisma + Postgres.

cPanel Node app (not recommended for Prisma): If you must, use external Postgres, build Prisma on host, and configure an App in cPanel → Application Manager, but expect limitations.

---

## Files included in repo
- `config/nginx/godaddy.conf`: Nginx example (SPA + /api reverse proxy)
- `server/ecosystem.config.cjs`: PM2 app definition for API

## Health checks
- API: `https://api.licensing.yourdomain.com/health` should return JSON
- Webhooks health: `GET /api/webhooks/health`

## Rollback
- `pm2 reload all` for zero-downtime reloads
- Keep previous build artifacts; use `pm2 deploy` or a simple symlink-based release strategy for robustness
