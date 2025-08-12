# Frontend (MPC)

## Current Status
- **Deployment**: Firebase Hosting (https://backbone-logic.web.app)
- **Build**: Vite 5.0.8 with TypeScript 5.2.2
- **Framework**: React 18.2.0 with React Router 6.20.1

## Dependencies

### Core
- React 18.2.0 + React DOM
- TypeScript 5.2.2
- Vite 5.0.8

### UI & Styling
- Material-UI (MUI) 5.14.20
- Emotion (styled components)
- Framer Motion 12.23.12 (animations)
- Notistack 3.0.2 (notifications)

### State & Data
- React Query (TanStack Query)
- React Hook Form 7.48.2
- Axios 1.6.2

### Payments
- Stripe React components
- Stripe.js 2.4.0

## Project Structure
```
client/src/
├── components/          # Reusable UI components
│   ├── checkout/        # Checkout flow components
│   ├── common/          # Shared components
│   └── layout/          # Layout components
├── context/             # React contexts
├── pages/               # Route components
│   ├── admin/           # Admin dashboard
│   ├── auth/            # Authentication pages
│   ├── checkout/        # Payment flow
│   └── dashboard/       # User dashboard
├── services/            # API services
├── theme/               # MUI theme configuration
└── types.ts             # TypeScript types
```

## Key Features
- **Authentication**: Login, register, 2FA, email verification
- **Dashboard**: User management, billing, analytics
- **Admin Panel**: Users/Licenses consolidated tab, Invoices, System Health
- **Checkout**: Stripe payment integration
- **Licensing**: License management and activation
- **Responsive**: Mobile-first design with MUI
- **Legal Pages**: `/terms`, `/privacy`, `/sla`, `/cookies` with versioned ToS labels in register/checkout

## Development
```bash
pnpm dev:client           # Start Vite dev server
pnpm build:client         # Build for production
pnpm preview              # Preview production build
```

## Environment
- `VITE_API_BASE_URL`: Set to `/api` for Firebase hosting
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe public key
 - `VITE_TERMS_VERSION`: Optional; surface version label in UI. If omitted, defaults to `1.0` while server remains authoritative via `TERMS_VERSION`.

## Dev Port Auto-Discovery
- The website publishes `health.json` at the app root during development (see `client/public/health.json`).
- Desktop app detects the website and API ports automatically by probing `health.json` and `/health`.
- Users can override detected ports locally; overrides are stored in `localStorage` and only affect their machine.
- Projects may include optional hints under `settings.preferredPorts.website|api`, used only as fallback hints.

## Build Output
- Production files built to `deploy/` directory
- SPA routing with Firebase hosting rewrites
- Static asset optimization and caching

## Admin Panel UI

Tabs
- **Users/Licenses**: Consolidated user management with per-user license access.
  - Each user row includes a license icon action that opens a popover listing that user’s active licenses (key, tier, expiry).
  - The standalone Licenses tab has been removed to reduce tab count and avoid grouping complexity.
  - Backward compatibility: URL hash `#licenses` routes to this tab.
- **Invoices**: Payments and invoice history with filters and details dialog.
- **System Health**: Subsystem health overview and recent activity.

Notes
- Per-user licenses are fetched on demand via `GET /admin/users/:userId` and displayed in the popover; only active licenses are shown by default.
