# Payments & Stripe (MPC)

## Current Status
- **Provider**: Stripe (production)
- **Email**: Resend API for transactional emails
- **Invoices**: Full invoice system with delivery tracking
- **Webhooks**: Stripe webhook processing

## Stripe Configuration
- **SDK Version**: 14.14.0
- **Webhook Secret**: Configured in Firebase Functions
- **Price IDs**: Basic, Pro, Enterprise tiers configured
- **Test Mode**: Configurable via STRIPE_TEST_MODE

## Pricing Tiers
- **Basic**: STRIPE_BASIC_PRICE_ID
- **Pro**: STRIPE_PRO_PRICE_ID  
- **Enterprise**: STRIPE_ENTERPRISE_PRICE_ID

## Payment Flow
1. **Checkout**: User selects plan and enters payment details
2. **Stripe**: Payment processed via Stripe Elements
3. **Webhook**: Stripe webhook updates subscription status
4. **License Generation**: Licenses created based on subscription
5. **Email Delivery**: Invoice and license details sent via Resend
6. **Compliance**: Payment and consent events logged

## Invoice System
- **Model**: Invoice tracking in database
- **Delivery**: Email delivery via Resend
- **Tracking**: Delivery status and retry logic
- **Compliance**: Audit logging for all transactions

## Webhook Processing
- **Endpoint**: `/api/webhooks/stripe`
- **Verification**: Stripe signature verification
- **Events**: Subscription updates, payment confirmations
- **Persistence**: Webhook events stored in database
- **Retry Logic**: Failed webhook processing with retry mechanism

## Compliance & Security
- **PCI Compliance**: Stripe handles card data
- **AML Screening**: Anti-money laundering checks
- **Audit Logging**: All payment events logged
- **Tax Calculation**: Tax rates and jurisdictions supported
- **GDPR**: Consent tracking and data processing logs

## Environment Variables
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_ENABLED=true
STRIPE_TEST_MODE=false
```

## Email Integration
- **Provider**: Resend API
- **Templates**: Invoice delivery, license activation
- **Tracking**: Email delivery status and analytics
- **Fallback**: SendGrid available as backup

## Testing
- **Test Mode**: Configurable via environment
- **Test Cards**: Stripe test card numbers
- **Webhook Testing**: Stripe CLI for local testing
- **Sandbox**: Stripe test environment integration
