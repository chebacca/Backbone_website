import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import { firestoreService } from './firestoreService.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

// Initialize email services based on configuration
let resendClient: Resend | null = null;
let sendgridConfigured = false;

if (config.resend?.apiKey) {
  resendClient = new Resend(config.resend.apiKey);
  logger.info('Resend email service initialized');
} else if (config.sendgrid.apiKey) {
  sgMail.setApiKey(config.sendgrid.apiKey);
  sendgridConfigured = true;
  logger.info('SendGrid email service initialized');
} else {
  logger.warn('No email service configured - emails will be skipped');
}

export class EmailService {
  /**
   * Send email using available email service
   */
  private static async sendEmail(emailData: {
    to: string;
    from: string;
    fromName: string;
    subject: string;
    html: string;
    text: string;
    customArgs?: Record<string, string>;
  }) {
    try {
      // Try Resend first (preferred)
      if (resendClient) {
        const result = await resendClient.emails.send({
          from: `${emailData.fromName} <${emailData.from}>`,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        });
        
        logger.info(`Email sent via Resend: ${result.data?.id}`);
        return { success: true, messageId: result.data?.id, provider: 'resend' };
      }
      
      // Fallback to SendGrid
      if (sendgridConfigured) {
        const msg = {
          to: emailData.to,
          from: {
            email: emailData.from,
            name: emailData.fromName,
          },
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          customArgs: emailData.customArgs,
        } as any;

        const result = await sgMail.send(msg);
        logger.info(`Email sent via SendGrid: ${result[0]?.headers?.['x-message-id']}`);
        return { 
          success: true, 
          messageId: result[0]?.headers?.['x-message-id'], 
          provider: 'sendgrid' 
        };
      }

      // No email service configured
      logger.warn('No email service configured; skipping email send');
      return { success: false, messageId: null, provider: 'none' };
    } catch (error) {
      logger.error('Failed to send email', error as any);
      return { success: false, messageId: null, provider: 'error', error };
    }
  }

  /**
   * Send license delivery email with license keys
   */
  static async sendLicenseDeliveryEmail(
    user: any,
    licenses: any[],
    subscription: any,
    payment: any
  ) {
    try {
      // Skip if no email service configured
      if (!resendClient && !sendgridConfigured) {
        logger.warn('No email service configured; skipping license delivery email');
        return { success: true, messageId: null };
      }

      logger.info(`Sending license delivery email to ${user.email}`, {
        userId: user.id,
        licenseCount: licenses.length,
        subscriptionTier: subscription.tier,
      });

      const emailData = {
        userName: user.name,
        userEmail: user.email,
        subscriptionTier: subscription.tier,
        seatCount: subscription.seats,
        amount: payment?.amount,
        currency: payment?.currency?.toUpperCase?.(),
        licenses: licenses.map(license => ({
          key: license.key,
          tier: license.tier,
          expiresAt: license.expiresAt,
          features: license.features,
        })),
        activationUrl: `${config.frontendUrl}/activate`,
        downloadUrl: `${config.frontendUrl}/download`,
        supportUrl: `${config.frontendUrl}/support`,
        accountUrl: `${config.frontendUrl}/account`,
        invoiceUrl: payment?.receiptUrl || null,
      };

      const emailContent = this.generateLicenseDeliveryEmailContent(emailData);

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend?.fromEmail || config.sendgrid.fromEmail,
        fromName: config.resend?.fromName || config.sendgrid.fromName,
        subject: `Your Dashboard v14 License Keys - ${subscription.tier} Plan`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          subscriptionId: subscription.id,
          paymentId: payment?.id,
          emailType: 'license_delivery',
        },
      });

      if (result.success) {
        // Update delivery logs
        for (const license of licenses) {
          await firestoreService.updateLicenseDeliveryLogsForPayment(payment?.id, { 
            deliveryStatus: 'SENT', 
            emailSent: true, 
            deliveredAt: new Date() 
          } as any);
        }

        logger.info(`License delivery email sent successfully to ${user.email}`, {
          messageId: result.messageId,
          provider: result.provider,
          licenseCount: licenses.length,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send license delivery email', error as any);
      return { success: false, messageId: null, provider: 'error', error };
    }
  }

  /**
   * Send welcome email with verification link
   */
  static async sendWelcomeEmail(user: any, verificationToken?: string) {
    try {
      // Skip if no email service configured
      if (!resendClient && !sendgridConfigured) {
        logger.warn('No email service configured; skipping welcome email');
        return { success: true, messageId: null };
      }

      logger.info(`Sending welcome email to ${user.email}`, {
        userId: user.id,
        hasVerificationToken: !!verificationToken,
      });

      const emailContent = this.generateWelcomeEmailContent({
        userName: user.name,
        userEmail: user.email,
        verificationUrl: verificationToken 
          ? `${config.frontendUrl}/verify-email/${verificationToken}` // Changed from ?token= to /token
          : null,
        loginUrl: `${config.frontendUrl}/login`,
        supportUrl: `${config.frontendUrl}/support`,
        companyName: config.resend?.fromName || config.sendgrid.fromName,
        companyEmail: config.resend?.fromEmail || config.sendgrid.fromEmail,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend?.fromEmail || config.sendgrid.fromEmail,
        fromName: config.resend?.fromName || config.sendgrid.fromName,
        subject: `Welcome to Dashboard v14 Licensing - Verify Your Email`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          emailType: 'welcome_verification',
        },
      });

      if (result.success) {
        logger.info(`Welcome email sent successfully to ${user.email}`, {
          messageId: result.messageId,
          provider: result.provider,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send welcome email', error as any);
      return { success: false, messageId: null, provider: 'error', error };
    }
  }

  /**
   * Send payment receipt email
   */
  static async sendPaymentReceiptEmail(user: any, payment: any, subscription: any) {
    try {
      // Skip if no email service configured
      if (!resendClient && !sendgridConfigured) {
        logger.warn('No email service configured; skipping payment receipt email');
        return { success: true, messageId: null };
      }

      logger.info(`Sending payment receipt email to ${user.email}`, {
        userId: user.id,
        paymentId: payment.id,
        amount: payment.amount,
      });

      const emailContent = this.generatePaymentReceiptEmailContent({
        userName: user.name,
        userEmail: user.email,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          createdAt: payment.createdAt,
          receiptUrl: payment.receiptUrl,
        },
        subscription: {
          id: subscription.id,
          tier: subscription.tier,
          seats: subscription.seats,
          status: subscription.status,
        },
        accountUrl: `${config.frontendUrl}/account`,
        supportUrl: `${config.frontendUrl}/support`,
        companyName: config.resend?.fromName || config.sendgrid.fromName,
        companyEmail: config.resend?.fromEmail || config.sendgrid.fromEmail,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend?.fromEmail || config.sendgrid.fromEmail,
        fromName: config.resend?.fromName || config.sendgrid.fromName,
        subject: `Payment Receipt - Dashboard v14 Licensing`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          paymentId: payment.id,
          emailType: 'payment_receipt',
        },
      });

      if (result.success) {
        logger.info(`Payment receipt email sent successfully to ${user.email}`, {
          messageId: result.messageId,
          provider: result.provider,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send payment receipt email', error as any);
      return { success: false, messageId: null, provider: 'error', error };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(user: any, resetToken: string) {
    try {
      // Skip if no email service configured
      if (!resendClient && !sendgridConfigured) {
        logger.warn('No email service configured; skipping password reset email');
        return { success: true, messageId: null };
      }

      logger.info(`Sending password reset email to ${user.email}`, {
        userId: user.id,
        hasResetToken: !!resetToken,
      });

      const emailContent = this.generatePasswordResetEmailContent({
        userName: user.name,
        userEmail: user.email,
        resetUrl: `${config.frontendUrl}/reset-password?token=${resetToken}`,
        loginUrl: `${config.frontendUrl}/login`,
        supportUrl: `${config.frontendUrl}/support`,
        companyName: config.resend?.fromName || config.sendgrid.fromName,
        companyEmail: config.resend?.fromEmail || config.sendgrid.fromEmail,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend?.fromEmail || config.sendgrid.fromEmail,
        fromName: config.resend?.fromName || config.sendgrid.fromName,
        subject: `Reset Your Password - Dashboard v14 Licensing`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          emailType: 'password_reset',
        },
      });

      if (result.success) {
        logger.info(`Password reset email sent successfully to ${user.email}`, {
          messageId: result.messageId,
          provider: result.provider,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send password reset email', error as any);
      return { success: false, messageId: null, provider: 'error', error };
    }
  }

  // Email content generators

  private static generateLicenseDeliveryEmailContent(data: any) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Dashboard v14 License Keys</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .license-card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .license-key { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #495057; background-color: #fff; padding: 10px; border: 2px dashed #007bff; border-radius: 4px; text-align: center; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
        .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 5px 0; }
        .feature-list li:before { content: "✓ "; color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your Dashboard v14 License Keys</h1>
            <p>Welcome to the future of production management!</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.userName}!</h2>
            
            <p>Thank you for your purchase of Dashboard v14 ${data.subscriptionTier} plan with ${data.seatCount} seat(s). Your payment of ${data.currency} ${(data.amount / 100).toFixed(2)} has been successfully processed.</p>
            
            <p><strong>Here are your license keys:</strong></p>
            
            ${data.licenses.map((license: any) => `
                <div class="license-card">
                    <h3>License Key #${data.licenses.indexOf(license) + 1}</h3>
                    <div class="license-key">${license.key}</div>
                    <p><strong>Tier:</strong> ${license.tier}</p>
                    <p><strong>Expires:</strong> ${new Date(license.expiresAt).toLocaleDateString()}</p>
                    
                    <h4>Included Features:</h4>
                    <ul class="feature-list">
                        ${Object.entries(license.features).filter(([key, value]) => value === true).map(([key]) => 
                            `<li>${(key as string).replace(/([A-Z])/g, ' $1').replace(/^./, str => (str as string).toUpperCase())}</li>`
                        ).join('')}
                    </ul>
                </div>
            `).join('')}
            
            <h3>Next Steps:</h3>
            <ol>
                <li><strong>Download the Software:</strong> Visit our download page to get the latest version</li>
                <li><strong>Activate Your License:</strong> Use the license key(s) above to activate your software</li>
                <li><strong>Access Cloud Features:</strong> Your cloud services will be automatically configured upon activation</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.activationUrl}" class="button">Activate License</a>
                <a href="${data.downloadUrl}" class="button">Download Software</a>
                <a href="${data.accountUrl}" class="button">Manage Account</a>
                ${data.invoiceUrl ? `<a href="${data.invoiceUrl}" class="button">View Invoice</a>` : ''}
            </div>
            
            <h3>Important Information:</h3>
            <ul>
                <li>Keep your license keys secure and do not share them</li>
                <li>Each license can be activated on a limited number of devices</li>
                <li>Your subscription will automatically renew unless cancelled</li>
                <li>Cloud features require an internet connection</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Welcome to Dashboard v14!</p>
            <p>The Dashboard v14 Team</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Dashboard v14. All rights reserved.</p>
            <p>
                <a href="${data.supportUrl}" style="color: #ffc107;">Support</a> | 
                <a href="${data.accountUrl}" style="color: #ffc107;">Account</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Your Dashboard v14 License Keys

Hello ${data.userName}!

Thank you for your purchase of Dashboard v14 ${data.subscriptionTier} plan with ${data.seatCount} seat(s). 
${data.amount ? `Your payment of ${data.currency} ${(data.amount / 100).toFixed(2)} has been successfully processed.` : ''}

License Keys:
 ${data.licenses.map((license: any, index: number) => `
License #${index + 1}: ${license.key}
Tier: ${license.tier}
Expires: ${new Date(license.expiresAt).toLocaleDateString()}
`).join('\n')}

Next Steps:
1. Download the software: ${data.downloadUrl}
2. Activate your license: ${data.activationUrl}
3. Manage your account: ${data.accountUrl}

Invoice: ${data.invoiceUrl ? data.invoiceUrl : 'N/A'}

For support, visit: ${data.supportUrl}

Welcome to Dashboard v14!
The Dashboard v14 Team
`;

    return { html, text };
  }

  private static generateWelcomeEmailContent(data: any) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Dashboard v14</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Dashboard v14!</h1>
        </div>
        <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>Thank you for joining Dashboard v14. To get started, please verify your email address.</p>
            ${data.verificationUrl ? `
                <p><a href="${data.verificationUrl}" class="button">Verify Email Address</a></p>
            ` : ''}
            <p>Once verified, you can log in and explore our features.</p>
            <p><a href="${data.loginUrl}">Log in to your account</a></p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Welcome to Dashboard v14!

Hello ${data.userName}!

Thank you for joining Dashboard v14. To get started, please verify your email address.

${data.verificationUrl ? `Verify your email: ${data.verificationUrl}` : ''}

Log in: ${data.loginUrl}
`;

    return { html, text };
  }

  private static generatePaymentReceiptEmailContent(data: any) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt - Dashboard v14</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .receipt { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Received</h1>
        </div>
        <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>Your payment has been successfully processed.</p>
            
            <div class="receipt">
                <h3>Payment Details</h3>
                <p><strong>Amount:</strong> ${data.currency} ${(data.amount / 100).toFixed(2)}</p>
                <p><strong>Plan:</strong> ${data.subscriptionTier} (${data.seatCount} seats)</p>
                <p><strong>Date:</strong> ${new Date(data.paymentDate).toLocaleDateString()}</p>
                <p><strong>Next Billing:</strong> ${new Date(data.nextBillingDate).toLocaleDateString()}</p>
            </div>
            
            ${data.invoiceUrl ? `<p><a href="${data.invoiceUrl}">View Invoice</a></p>` : ''}
            <p><a href="${data.accountUrl}">Manage Account</a></p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Payment Receipt - Dashboard v14

Hello ${data.userName}!

Your payment has been successfully processed.

Payment Details:
Amount: ${data.currency} ${(data.amount / 100).toFixed(2)}
Plan: ${data.subscriptionTier} (${data.seatCount} seats)
Date: ${new Date(data.paymentDate).toLocaleDateString()}
Next Billing: ${new Date(data.nextBillingDate).toLocaleDateString()}

${data.invoiceUrl ? `View Invoice: ${data.invoiceUrl}` : ''}
Manage Account: ${data.accountUrl}
`;

    return { html, text };
  }

  private static generatePasswordResetEmailContent(data: any) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password - Dashboard v14</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>You requested a password reset for your Dashboard v14 account.</p>
            <p><a href="${data.resetUrl}" class="button">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Reset Your Password - Dashboard v14

Hello ${data.userName}!

You requested a password reset for your Dashboard v14 account.

Reset your password: ${data.resetUrl}

If you didn't request this, please ignore this email.
This link will expire in 1 hour for security reasons.
`;

    return { html, text };
  }
}
