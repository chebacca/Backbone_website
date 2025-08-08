# Frontend Guide (MPC)

Stack
- React 18 + TypeScript + Vite, MUI, React Router, React Query, Framer Motion, Notistack

API Layer
- Use `client/src/services/api.ts` → `api`, `endpoints`, `apiUtils`
- Set `VITE_API_BASE_URL` to API origin (default http://localhost:3003)
- Interceptors attach `Authorization` and handle 401 by redirecting to /login

Authentication Flow
- Login: handle normal auth or catch `{ requires2FA, interimToken }` for 2FA challenge
- 2FA verification: `authService.verify2FA(interimToken, code)` returns full tokens
- Settings: 2FA enable/disable with QR code setup and backup codes

UX
- Dark theme with glassmorphism; responsive; motion where appropriate
- Use `LoadingSpinner` and `ErrorBoundary`
- Prefer optimistic updates with invalidation via React Query
- 2FA setup: QR code display, code input validation, backup codes presentation

Components
- Layout: `Navigation`, `Footer`, `DashboardLayout`
- Checkout: `PlanSelectionStep`, `PaymentMethodStep`, `BillingDetailsStep`, `OrderSummary`
- Auth: Login form with 2FA challenge handling, Settings 2FA section

State
- Minimal local state; server state via React Query
- Store `auth_token` in localStorage; provide `AuthContext`
- Handle 2FA interim tokens and challenge states

Validation
- Client-side validations mirror server rules (tiers, seats, address); display helpful messages
- 2FA code validation: 6-digit TOTP or backup code format

Accessibility
- Use semantic elements, aria roles, focus management, and contrast-aware colors
- 2FA QR codes include alt text and keyboard navigation
