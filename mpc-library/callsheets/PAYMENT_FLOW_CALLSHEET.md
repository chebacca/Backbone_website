# Callsheet: Payment Flow

Goal: Diagnose and resolve checkout/subscription issues

Quick Checks
- Env vars: STRIPE_* keys and price IDs present
- Client `VITE_API_BASE_URL` points to API (3003)
- Network: /payments/create-subscription returns JSON, not HTML

Server Logs
- Look for PaymentService.createSubscription and webhook handler logs
- Verify subscription + payment records created and statuses

Stripe
- Confirm customer created, PM attached, subscription created with correct quantity
- Check latest invoice + payment intent status

DB
- `Subscription.status` ACTIVE/TRIALING? `Payment.status` SUCCEEDED?
- Licenses generated for seats

Email
- License delivery email logged in EmailLog; webhook events processed (delivered/opened/clicked)

Common Fixes
- Attach default payment method to customer
- Ensure price IDs configured per tier
- Enable tax rates or skip pending tax integration
- Handle Enterprise min seats (>=10)
