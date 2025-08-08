# Payments & Subscriptions with Stripe (MPC)

Stripe Setup
- Env: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- Price IDs per tier: STRIPE_BASIC_PRICE_ID, STRIPE_PRO_PRICE_ID, STRIPE_ENTERPRISE_PRICE_ID

Create Subscription Flow
1) Validate billing address and seats/tier
2) Upsert `BillingAddress` (validated)
3) Calculate pricing (per-seat) and tax via ComplianceService
4) Get/create Stripe Customer; attach default payment method
5) Create Stripe Subscription with quantity=seats and priceId
6) Persist `Subscription` and `Payment` (latest invoice + intent)
7) If succeeded → handleSuccessfulPayment: mark payment/sub active, generate licenses, delivery email, audit logs
8) AML screening and compliance events

Updates
- Update payment method: attach to customer, set defaults, update subscription
- Update seats/tier: adjust Stripe subscription items (proration), update DB, generate additional licenses
- Cancel/reactivate: set `cancel_at_period_end` or revert, update DB status

Webhooks
- Persist webhook events to `webhook_events`
- Handle: `payment_intent.succeeded/failed`, `invoice.payment_succeeded`, `customer.subscription.updated/deleted`
- Update payment/subscription status; generate audit/compliance records

Admin Analytics
- Aggregate revenue, daily revenue, AOV, tier breakdown

Client Integration
- Use `@stripe/react-stripe-js` and `@stripe/stripe-js` on the client
- Server handles secret operations; client submits paymentMethodId

Security
- Verify webhook signature; never trust client-submitted monetary values
- Do not store raw PAN; use tokenized methods only
