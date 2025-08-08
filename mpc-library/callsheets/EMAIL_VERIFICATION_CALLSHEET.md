# Callsheet: Email Verification & Password Reset

Verification
- Register → EmailService sends verification with token in DB (emailVerifyToken)
- POST /auth/verify-email with token; sets isEmailVerified=true

Reset
- POST /auth/forgot-password → reset token + expiry saved
- POST /auth/reset-password with token + new password → clears token

Checks
- SENDGRID_API_KEY present
- FROM_EMAIL/NAME set
- EmailLog entries created; SendGrid webhooks updating delivery state

Common Issues
- Token expired/invalid → reissue token via resend endpoint (if implemented)
- Email deliverability → domain setup, spam, bounces; check SendGrid event logs
