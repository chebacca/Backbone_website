# Resend Email Setup Guide

## Step 1: Create Resend Account (Free)
1. Go to [resend.com](https://resend.com)
2. Click "Start for Free"
3. Sign up with your email
4. Verify your email address

## Step 2: Get API Key
1. After login, go to API Keys
2. Click "Create API Key"
3. Name: `Backbone Logic Production`
4. Copy the API key (starts with `re_`)

## Step 3: Verify Domain (Optional but Recommended)
1. Go to Domains
2. Add your domain: `backbone-logic.com`
3. Add the DNS records (CNAME) to your domain provider
4. Wait for verification (usually 5-10 minutes)

## Step 4: Set Environment Variables
Set these in your Firebase Functions environment:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@backbone-logic.com
RESEND_FROM_NAME=Backbone Logic

# Or use the legacy names (will work as fallback)
FROM_EMAIL=noreply@backbone-logic.com
FROM_NAME=Backbone Logic
```

## Step 5: Deploy
```bash
pnpm deploy
```

## Benefits of Resend
- **Free**: 3,000 emails/month
- **Simple**: Just API key, no complex setup
- **Reliable**: Excellent deliverability
- **Fast**: Emails sent in seconds
- **Professional**: No "sent via" branding

## Alternative: Gmail SMTP (Free but Limited)
If you don't want to set up Resend, you can use Gmail:

```bash
# Gmail SMTP (500 emails/day limit)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

## Testing
After setup, test by:
1. Registering a new user
2. Check if welcome email arrives
3. Click verification link
4. Verify account is marked as verified
