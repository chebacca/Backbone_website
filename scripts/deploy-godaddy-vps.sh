#!/usr/bin/env bash
set -euo pipefail

# Deploy Dashboard v14 Licensing Website to GoDaddy VPS (Ubuntu)
# Usage: ./scripts/deploy-godaddy-vps.sh /opt/dashboard-v14-licensing-website licensing.yourdomain.com api.licensing.yourdomain.com

APP_DIR=${1:-/opt/dashboard-v14-licensing-website}
WEB_DOMAIN=${2:-licensing.example.com}
API_DOMAIN=${3:-api.licensing.example.com}

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt -y install nodejs
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Enabling corepack and pnpm..."
  corepack enable || true
  corepack prepare pnpm@latest --activate
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "Installing Nginx..."
  sudo apt update
  sudo apt -y install nginx
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing PM2..."
  sudo npm i -g pm2
fi

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing Certbot..."
  sudo apt -y install certbot python3-certbot-nginx
fi

# Build application
cd "$APP_DIR"
pnpm install
pnpm setup:db || true
pnpm build

# PM2 start API
cd server
mkdir -p logs
pm2 start ecosystem.config.cjs --env production || pm2 restart licensing-api
pm2 save
cd ..

# Nginx config
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo cp config/nginx/godaddy.conf /etc/nginx/sites-available/licensing
# Replace example domains with provided
sudo sed -i "s/licensing.yourdomain.com/${WEB_DOMAIN}/g" /etc/nginx/sites-available/licensing
sudo sed -i "s/api.licensing.yourdomain.com/${API_DOMAIN}/g" /etc/nginx/sites-available/licensing

if [ ! -f /etc/nginx/sites-enabled/licensing ]; then
  sudo ln -s /etc/nginx/sites-available/licensing /etc/nginx/sites-enabled/licensing
fi

sudo nginx -t
sudo systemctl reload nginx

# Obtain/renew certificates (requires DNS A records pointing to this VPS)
sudo certbot --nginx -d "$WEB_DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos -m admin@"${WEB_DOMAIN#*.}" --redirect || true

echo "Deployment complete."
echo "Web:   https://${WEB_DOMAIN}"
echo "API:   https://${API_DOMAIN}/health"
echo "PM2:   pm2 status"
