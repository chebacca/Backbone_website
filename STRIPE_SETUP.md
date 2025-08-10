# Stripe Configuration Guide

## 🆓 Option 1: Stripe Test Mode (Recommended - FREE)

Stripe provides completely free test API keys for development and testing.

### 1. Create Free Stripe Account
- Go to [stripe.com](https://stripe.com)
- Sign up for free (no credit card required)
- Verify your email

### 2. Get Test API Keys
- Go to Dashboard → Developers → API keys
- Copy your **Publishable key** (starts with `pk_test_`)
- Copy your **Secret key** (starts with `sk_test_`)

### 3. Set Environment Variables
```bash
# Stripe Test Mode (FREE)
export STRIPE_ENABLED=true
export STRIPE_TEST_MODE=true
export STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
export STRIPE_SECRET_KEY=sk_test_your_test_key_here
export STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Test Price IDs (create these in Stripe dashboard)
export STRIPE_BASIC_PRICE_ID=price_your_basic_price_id
export STRIPE_PRO_PRICE_ID=price_your_pro_price_id
export STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id
```

### 4. Test Card Numbers
Use these test card numbers (no real charges):
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🚫 Option 2: Disable Stripe Temporarily

If you want to focus on other features first:

```bash
export STRIPE_ENABLED=false
```

This will:
- Disable payment processing
- Hide payment-related UI elements
- Allow user registration and email verification to work
- Focus on core authentication and licensing features

## 🔧 Update Firebase Configuration

After setting environment variables, update your Firebase Functions:

```bash
firebase functions:config:set stripe.enabled="$STRIPE_ENABLED" stripe.test_mode="$STRIPE_TEST_MODE" stripe.publishable_key="$STRIPE_PUBLISHABLE_KEY" stripe.secret_key="$STRIPE_SECRET_KEY"
```

## 📱 Frontend Configuration

Update your client environment:

```bash
# client/.env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
VITE_STRIPE_ENABLED=true
```

## 🧪 Testing

1. **With Stripe Test Mode**:
   - Register users normally
   - Use test card numbers for payments
   - All features work as expected

2. **With Stripe Disabled**:
   - User registration works
   - Email verification works
   - Payment features are hidden
   - Core licensing features work

## 💡 Recommendation

Start with **Stripe Test Mode** - it's completely free and gives you the full experience without any costs or real payments.
