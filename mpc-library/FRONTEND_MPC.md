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
- **Admin Panel**: User management, compliance, system health
- **Checkout**: Stripe payment integration
- **Licensing**: License management and activation
- **Responsive**: Mobile-first design with MUI

## Development
```bash
pnpm dev:client           # Start Vite dev server
pnpm build:client         # Build for production
pnpm preview              # Preview production build
```

## Environment
- `VITE_API_BASE_URL`: Set to `/api` for Firebase hosting
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe public key

## Build Output
- Production files built to `deploy/` directory
- SPA routing with Firebase hosting rewrites
- Static asset optimization and caching
