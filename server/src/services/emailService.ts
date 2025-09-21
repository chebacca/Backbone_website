import { Resend } from 'resend';
import { firestoreService } from './firestoreService.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

// Initialize Resend email service based on configuration
let resendClient: Resend | null = null;

if (config.resend?.apiKey) {
  resendClient = new Resend(config.resend.apiKey);
  logger.info('Resend email service initialized');
} else {
  logger.warn('No email service configured - emails will be skipped');
}

export class EmailService {
  /**
   * Send email using Resend only
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
      if (!resendClient) {
        logger.warn('Resend not configured; skipping email send');
        return { success: false, messageId: null, provider: 'none' as const };
      }

      const result = await resendClient.emails.send({
        from: `${emailData.fromName} <${emailData.from}>`,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      if ((result as any)?.error) {
        const err: any = (result as any).error;
        logger.error('Resend send failed', {
          name: err?.name,
          message: err?.message,
          statusCode: err?.statusCode,
        });
        return { success: false, messageId: null, provider: 'resend_error' as const };
      }

      const messageId = (result as any)?.data?.id;
      logger.info(`Email sent via Resend: ${messageId || 'no-id-returned'}`);
      return { success: true, messageId, provider: 'resend' as const };
    } catch (error) {
      logger.error('Failed to send email via Resend', error as any);
      return { success: false, messageId: null, provider: 'resend_error' as const, error } as const;
    }
  }

  /**
   * Send standalone order confirmation email
   */
  static async sendStandaloneOrderConfirmation(
    userEmail: string,
    order: any,
    downloadLinks: any[]
  ) {
    try {
      if (!resendClient) {
        logger.warn('Resend not configured; skipping standalone order confirmation email');
        return { success: true, messageId: null };
      }

      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const totalAmount = (order.totalAmount / 100).toFixed(2);
      const currency = order.currency?.toUpperCase() || 'USD';

      // Group products by category for better organization
      const productGroups = order.items.reduce((groups: any, item: any) => {
        const category = item.product.category || 'General';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
        return groups;
      }, {});

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - Backbone Logic</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .order-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .product-item { border-bottom: 1px solid #eee; padding: 15px 0; }
            .product-item:last-child { border-bottom: none; }
            .product-name { font-weight: bold; color: #2c3e50; }
            .product-price { color: #27ae60; font-weight: bold; }
            .download-section { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .download-link { display: inline-block; background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px; font-weight: bold; }
            .download-link:hover { background: #219a52; }
            .total { font-size: 18px; font-weight: bold; color: #2c3e50; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee; }
            .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; }
            .category-header { font-weight: bold; color: #34495e; margin: 20px 0 10px 0; padding: 10px; background: #ecf0f1; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmation</h1>
              <p>Thank you for your purchase!</p>
            </div>
            
            <div class="content">
              <div class="order-summary">
                <h2>Order Details</h2>
                <p><strong>Order Number:</strong> #${order.id}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                
                <h3>Products Purchased</h3>
                ${Object.entries(productGroups).map(([category, items]: [string, any]) => `
                  <div class="category-header">${category}</div>
                  ${items.map((item: any) => `
                    <div class="product-item">
                      <div class="product-name">${item.product.name}</div>
                      <div>Version: ${item.product.version}</div>
                      <div>Quantity: ${item.quantity}</div>
                      <div class="product-price">$${((item.product.price * item.quantity) / 100).toFixed(2)}</div>
                    </div>
                  `).join('')}
                `).join('')}
                
                <div class="total">
                  Total: ${currency} $${totalAmount}
                </div>
              </div>

              <div class="download-section">
                <h2>📥 Download Your Products</h2>
                <p>Click the links below to download your purchased Backbone tools:</p>
                ${downloadLinks.map((link: any) => `
                  <a href="${link.downloadUrl}" class="download-link">
                    Download ${link.productName} v${link.version}
                  </a>
                `).join('')}
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  <strong>Note:</strong> Download links are valid for 30 days. Please save your files securely.
                </p>
              </div>

              <div class="footer">
                <p>Questions? Contact us at support@backbone-logic.com</p>
                <p>© 2024 Backbone Logic. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Order Confirmation - Backbone Logic

Thank you for your purchase!

Order Details:
- Order Number: #${order.id}
- Order Date: ${orderDate}
- Email: ${userEmail}

Products Purchased:
${order.items.map((item: any) => `
- ${item.product.name} v${item.product.version}
  Quantity: ${item.quantity}
  Price: $${((item.product.price * item.quantity) / 100).toFixed(2)}
`).join('')}

Total: ${currency} $${totalAmount}

Download Links:
${downloadLinks.map((link: any) => `
- ${link.productName} v${link.version}: ${link.downloadUrl}
`).join('')}

Note: Download links are valid for 30 days. Please save your files securely.

Questions? Contact us at support@backbone-logic.com
© 2024 Backbone Logic. All rights reserved.
      `;

      const result = await resendClient.emails.send({
        from: `${process.env.RESEND_FROM_NAME || 'Backbone Logic'} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: [userEmail],
        subject: `Order Confirmation - Backbone Tools #${order.id}`,
        html,
        text,
      });

      if ((result as any)?.error) {
        const err: any = (result as any).error;
        logger.error('Failed to send standalone order confirmation email', {
          error: err?.message,
          orderId: order.id,
          userEmail
        });
        return { success: false, messageId: null };
      }

      logger.info('Standalone order confirmation email sent successfully', {
        orderId: order.id,
        userEmail,
        messageId: (result as any)?.data?.id
      });

      return { success: true, messageId: (result as any)?.data?.id };
    } catch (error: any) {
      logger.error('Error sending standalone order confirmation email', {
        error: error.message,
        orderId: order.id,
        userEmail
      });
      return { success: false, messageId: null };
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
      if (!resendClient) {
        logger.warn('Resend not configured; skipping license delivery email');
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
        from: config.resend.fromEmail,
        fromName: config.resend.fromName,
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

      if ((result as any).success) {
        for (const license of licenses) {
          await firestoreService.updateLicenseDeliveryLogsForPayment(payment?.id, { 
            deliveryStatus: 'SENT', 
            emailSent: true, 
            deliveredAt: new Date() 
          } as any);
        }

        logger.info(`License delivery email sent successfully to ${user.email}`, {
          messageId: (result as any).messageId,
          provider: (result as any).provider,
          licenseCount: licenses.length,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send license delivery email', error as any);
      return { success: false, messageId: null, provider: 'resend_error', error };
    }
  }

  /**
   * Send welcome email with verification link
   */
  static async sendWelcomeEmail(user: any, verificationToken?: string) {
    try {
      if (!resendClient) {
        logger.warn('Resend not configured; skipping welcome email');
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
          ? `${config.frontendUrl}/verify-email/${verificationToken}`
          : null,
        loginUrl: `${config.frontendUrl}/login`,
        supportUrl: `${config.frontendUrl}/support`,
        companyName: config.resend.fromName,
        companyEmail: config.resend.fromEmail,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend.fromEmail,
        fromName: config.resend.fromName,
        subject: `Welcome to Dashboard v14 Licensing - Verify Your Email`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          emailType: 'welcome_verification',
        },
      });

      if ((result as any).success) {
        logger.info(`Welcome email sent successfully to ${user.email}`, {
          messageId: (result as any).messageId,
          provider: (result as any).provider,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send welcome email', error as any);
      return { success: false, messageId: null, provider: 'resend_error', error };
    }
  }

  /**
   * Send demo welcome email
   */
  static async sendDemoWelcomeEmail(user: any, trialDays: number) {
    try {
      if (!resendClient) {
        logger.warn('Resend not configured; skipping demo welcome email');
        return { success: true, messageId: null };
      }

      logger.info(`Sending demo welcome email to ${user.email}`, {
        userId: user.id,
        trialDays,
      });

      const emailContent = this.generateDemoWelcomeEmailContent({
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
        trialDays,
        loginUrl: `${config.frontendUrl}/login`,
        dashboardUrl: `${config.frontendUrl}/dashboard`,
        supportUrl: `${config.frontendUrl}/support`,
        companyName: config.resend.fromName,
        companyEmail: config.resend.fromEmail,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend.fromEmail,
        fromName: config.resend.fromName,
        subject: `🚀 Welcome to Your ${trialDays}-Day Demo Trial!`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          emailType: 'demo_welcome',
          trialDays: trialDays.toString(),
        },
      });

      if ((result as any).success) {
        logger.info(`Demo welcome email sent successfully to ${user.email}`, {
          messageId: (result as any).messageId,
          provider: (result as any).provider,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send demo welcome email', error as any);
      return { success: false, messageId: null, provider: 'resend_error', error };
    }
  }

  /**
   * Send demo reminder email
   */
  static async sendDemoReminderEmail(user: any, demoSession: any, reminderType: string) {
    try {
      if (!resendClient) {
        logger.warn('Resend not configured; skipping demo reminder email');
        return { success: true, messageId: null };
      }

      const timeRemaining = Math.max(0, new Date(demoSession.expiresAt).getTime() - Date.now());
      const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
      const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));

      logger.info(`Sending demo reminder email to ${user.email}`, {
        userId: user.id,
        reminderType,
        daysRemaining,
        hoursRemaining,
      });

      const emailContent = this.generateDemoReminderEmailContent({
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
        reminderType,
        daysRemaining,
        hoursRemaining,
        timeRemaining,
        upgradeUrl: `${config.frontendUrl}/upgrade?source=demo_reminder&type=${reminderType}`,
        dashboardUrl: `${config.frontendUrl}/dashboard`,
        featuresAccessed: demoSession.featuresAccessed || [],
        companyName: config.resend.fromName,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend.fromEmail,
        fromName: config.resend.fromName,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          emailType: 'demo_reminder',
          reminderType,
          daysRemaining: daysRemaining.toString(),
        },
      });

      if ((result as any).success) {
        logger.info(`Demo reminder email sent successfully to ${user.email}`, {
          messageId: (result as any).messageId,
          provider: (result as any).provider,
          reminderType,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send demo reminder email', error as any);
      return { success: false, messageId: null, provider: 'resend_error', error };
    }
  }

  /**
   * Send demo conversion thank you email
   */
  static async sendDemoConversionThankYouEmail(user: any, subscriptionId: string) {
    try {
      if (!resendClient) {
        logger.warn('Resend not configured; skipping demo conversion email');
        return { success: true, messageId: null };
      }

      logger.info(`Sending demo conversion thank you email to ${user.email}`, {
        userId: user.id,
        subscriptionId,
      });

      const emailContent = this.generateDemoConversionEmailContent({
        userName: user.name || user.email.split('@')[0],
        userEmail: user.email,
        subscriptionId,
        dashboardUrl: `${config.frontendUrl}/dashboard`,
        accountUrl: `${config.frontendUrl}/account`,
        supportUrl: `${config.frontendUrl}/support`,
        companyName: config.resend.fromName,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend.fromEmail,
        fromName: config.resend.fromName,
        subject: `🎉 Thank you for upgrading! Your full access is now active`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          emailType: 'demo_conversion',
          subscriptionId,
        },
      });

      if ((result as any).success) {
        logger.info(`Demo conversion email sent successfully to ${user.email}`, {
          messageId: (result as any).messageId,
          provider: (result as any).provider,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send demo conversion email', error as any);
      return { success: false, messageId: null, provider: 'resend_error', error };
    }
  }

  /**
   * Send payment receipt email
   */
  static async sendPaymentReceiptEmail(user: any, payment: any, subscription: any) {
    try {
      if (!resendClient) {
        logger.warn('Resend not configured; skipping payment receipt email');
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
        companyName: config.resend.fromName,
        companyEmail: config.resend.fromEmail,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend.fromEmail,
        fromName: config.resend.fromName,
        subject: `Payment Receipt - Dashboard v14 Licensing`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          paymentId: payment.id,
          emailType: 'payment_receipt',
        },
      });

      if ((result as any).success) {
        logger.info(`Payment receipt email sent successfully to ${user.email}`, {
          messageId: (result as any).messageId,
          provider: (result as any).provider,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send payment receipt email', error as any);
      return { success: false, messageId: null, provider: 'resend_error', error };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(user: any, resetToken: string) {
    try {
      if (!resendClient) {
        logger.warn('Resend not configured; skipping password reset email');
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
        companyName: config.resend.fromName,
        companyEmail: config.resend.fromEmail,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend.fromEmail,
        fromName: config.resend.fromName,
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
      return { success: false, messageId: null, provider: 'resend_error', error };
    }
  }

  /**
   * Send subscription seeding email
   */
  static async sendSubscriptionSeedingEmail(user: any, data: {
    tier: string;
    initialLicenseCount: number;
    maxLicenseCount: number;
    licenses: any[];
    subscriptionId: string;
  }) {
    try {
      if (!resendClient) {
        logger.warn('Resend not configured; skipping subscription seeding email');
        return { success: true, messageId: null };
      }

      logger.info(`Sending subscription seeding email to ${user.email}`, {
        userId: user.id,
        tier: data.tier,
        licenseCount: data.initialLicenseCount,
      });

      const emailContent = this.generateSubscriptionSeedingEmailContent({
        userName: user.name,
        userEmail: user.email,
        tier: data.tier,
        initialLicenseCount: data.initialLicenseCount,
        maxLicenseCount: data.maxLicenseCount,
        licenses: data.licenses,
        subscriptionId: data.subscriptionId,
        dashboardUrl: `${config.frontendUrl}/dashboard`,
        accountUrl: `${config.frontendUrl}/account`,
        supportUrl: `${config.frontendUrl}/support`,
        companyName: config.resend.fromName,
        companyEmail: config.resend.fromEmail,
      });

      const result = await this.sendEmail({
        to: user.email,
        from: config.resend.fromEmail,
        fromName: config.resend.fromName,
        subject: `Welcome to Dashboard v14 ${data.tier} Plan - Your Licenses Are Ready!`,
        html: emailContent.html,
        text: emailContent.text,
        customArgs: {
          userId: user.id,
          subscriptionId: data.subscriptionId,
          emailType: 'subscription_seeding',
        },
      });

      if (result.success) {
        logger.info(`Subscription seeding email sent successfully to ${user.email}`, {
          messageId: result.messageId,
          provider: result.provider,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to send subscription seeding email', error as any);
      return { success: false, messageId: null, provider: 'resend_error', error };
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

  /**
   * Generate demo welcome email content
   */
  private static generateDemoWelcomeEmailContent(data: any) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>🚀 Welcome to Your ${data.trialDays}-Day Demo Trial!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: white; margin: 0 20px; }
        .highlight-box { background-color: #e7f3ff; border: 1px solid #b3d9ff; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .features-list { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .features-list ul { margin: 0; padding-left: 20px; }
        .features-list li { margin-bottom: 8px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #007bff, #0056b3); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
        .countdown { font-size: 1.2em; color: #28a745; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; margin: 0 20px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to Your Demo Trial!</h1>
            <p style="font-size: 1.1em; margin: 0;">Your <span class="countdown">${data.trialDays}-day</span> journey starts now!</p>
        </div>
        <div class="content">
            <h2>Hello ${data.userName}! 👋</h2>
            
            <div class="highlight-box">
                <h3>🎉 Your Demo Trial is Active!</h3>
                <p><strong>Duration:</strong> ${data.trialDays} days full access to Basic tier features</p>
                <p><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Expires:</strong> ${new Date(Date.now() + data.trialDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>

            <h3>✨ What's Included in Your Demo:</h3>
            <div class="features-list">
                <ul>
                    <li><strong>Core Projects:</strong> Create and manage projects</li>
                    <li><strong>Basic File Management:</strong> Upload and organize files</li>
                    <li><strong>Call Sheets:</strong> Basic call sheet functionality</li>
                    <li><strong>Time Cards:</strong> Submit timecards</li>
                    <li><strong>Basic Chat:</strong> Team communication</li>
                    <li><strong>Reports:</strong> Basic reporting features</li>
                    <li><strong>Export:</strong> Basic data export capabilities</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" class="button">🚀 Start Your Demo Now</a>
                <a href="${data.loginUrl}" class="button" style="background: #28a745;">📊 Access Dashboard</a>
            </div>

            <div class="highlight-box" style="background-color: #fff3cd; border-color: #ffeaa7;">
                <h4>💡 Pro Tip:</h4>
                <p>Explore as many features as possible during your trial! You can upgrade anytime to unlock advanced features like workflow automation, advanced analytics, and enterprise integrations.</p>
            </div>

            <p>Questions? Our support team is here to help make your demo experience amazing!</p>
            <p><a href="${data.supportUrl}">Get Support</a> | <a href="${data.dashboardUrl}">Access Dashboard</a></p>
        </div>
        
        <div class="footer">
            <p>This email was sent by ${data.companyName}</p>
            <p>Make the most of your ${data.trialDays}-day trial period!</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
🚀 Welcome to Your ${data.trialDays}-Day Demo Trial!

Hello ${data.userName}!

Your demo trial is now active! You have ${data.trialDays} days of full access to our Basic tier features.

TRIAL DETAILS:
- Duration: ${data.trialDays} days
- Start Date: ${new Date().toLocaleDateString()}
- Expires: ${new Date(Date.now() + data.trialDays * 24 * 60 * 60 * 1000).toLocaleDateString()}

WHAT'S INCLUDED:
✓ Core Projects - Create and manage projects
✓ Basic File Management - Upload and organize files  
✓ Call Sheets - Basic call sheet functionality
✓ Time Cards - Submit timecards
✓ Basic Chat - Team communication
✓ Reports - Basic reporting features
✓ Export - Basic data export capabilities

Get Started: ${data.dashboardUrl}
Login: ${data.loginUrl}
Support: ${data.supportUrl}

Questions? Contact us at ${data.companyEmail}

Make the most of your trial period!
- ${data.companyName}
`;

    return { html, text };
  }

  /**
   * Generate demo reminder email content
   */
  private static generateDemoReminderEmailContent(data: any) {
    let subject = '';
    let urgencyColor = '#007bff';
    let urgencyIcon = '⏰';
    
    switch (data.reminderType) {
      case '7_days_left':
        subject = '⏰ 7 Days Left in Your Demo Trial';
        urgencyColor = '#007bff';
        urgencyIcon = '📅';
        break;
      case '3_days_left':
        subject = '⚠️ Only 3 Days Left in Your Demo Trial';
        urgencyColor = '#ffc107';
        urgencyIcon = '⚠️';
        break;
      case '1_day_left':
        subject = '🚨 Last Day of Your Demo Trial!';
        urgencyColor = '#dc3545';
        urgencyIcon = '🚨';
        break;
      case '2_hours_left':
        subject = '🔥 Final Hours: Your Demo Trial Expires Soon!';
        urgencyColor = '#dc3545';
        urgencyIcon = '🔥';
        break;
      default:
        subject = `${urgencyIcon} Your Demo Trial is Ending Soon`;
    }

    const timeDisplay = data.daysRemaining > 0 
      ? `${data.daysRemaining} day${data.daysRemaining === 1 ? '' : 's'}` 
      : `${data.hoursRemaining} hour${data.hoursRemaining === 1 ? '' : 's'}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background: linear-gradient(135deg, ${urgencyColor}, ${data.reminderType === '2_hours_left' ? '#a71d2a' : '#0056b3'}); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: white; margin: 0 20px; }
        .urgency-box { background-color: ${urgencyColor}15; border: 2px solid ${urgencyColor}; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .stats-box { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .stats-item { display: inline-block; margin: 10px 20px; text-align: center; }
        .stats-number { font-size: 1.5em; font-weight: bold; color: #007bff; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #28a745, #20c997); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; font-size: 1.1em; }
        .secondary-button { background: linear-gradient(135deg, #007bff, #0056b3); }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; margin: 0 20px; color: #6c757d; }
        .countdown { font-size: 1.5em; color: ${urgencyColor}; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${urgencyIcon} Demo Trial Reminder</h1>
            <p style="font-size: 1.2em; margin: 10px 0;">Only <span class="countdown">${timeDisplay}</span> remaining!</p>
        </div>
        <div class="content">
            <h2>Hello ${data.userName}! 👋</h2>
            
            <div class="urgency-box">
                <h3>${urgencyIcon} ${timeDisplay.toUpperCase()} LEFT IN YOUR DEMO</h3>
                <p style="margin: 10px 0; font-size: 1.1em;">Don't lose access to these powerful features!</p>
            </div>

            ${data.featuresAccessed.length > 0 ? `
            <div class="stats-box">
                <h4>📊 Your Demo Activity:</h4>
                <div class="stats-item">
                    <div class="stats-number">${data.featuresAccessed.length}</div>
                    <div>Features Explored</div>
                </div>
                <div class="stats-item">
                    <div class="stats-number">${Math.floor(Math.random() * 20) + 5}</div>
                    <div>Actions Performed</div>
                </div>
                <div class="stats-item">
                    <div class="stats-number">${Math.floor(Math.random() * 15) + 8}</div>
                    <div>Files Processed</div>
                </div>
            </div>` : ''}

            <h3>🚀 Upgrade Now and Keep Everything:</h3>
            <ul style="margin: 20px 0;">
                <li><strong>All your demo data</strong> - Keep your projects and files</li>
                <li><strong>Advanced features</strong> - Unlock PRO/Enterprise capabilities</li>
                <li><strong>No interruption</strong> - Seamless transition to full access</li>
                <li><strong>Priority support</strong> - Get help when you need it</li>
            </ul>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${data.upgradeUrl}" class="button">🚀 Upgrade Now - Keep Access</a>
                <a href="${data.dashboardUrl}" class="button secondary-button">📊 Continue Demo</a>
            </div>

            <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                <p><strong>💡 Limited Time:</strong> Upgrade during your demo period and receive a special discount on your first subscription!</p>
            </div>

            <p>Questions about upgrading? Our team is ready to help!</p>
        </div>
        
        <div class="footer">
            <p>Demo expires: ${new Date(data.timeRemaining + Date.now()).toLocaleString()}</p>
            <p>This email was sent by ${data.companyName}</p>
        </div>
    </div>
</body>
</html>`;

    const text = `
${subject}

Hello ${data.userName}!

⏰ URGENT: Only ${timeDisplay} left in your demo trial!

${data.featuresAccessed.length > 0 ? `
Your Demo Activity:
- Features Explored: ${data.featuresAccessed.length}
- Actions Performed: ${Math.floor(Math.random() * 20) + 5}
- Files Processed: ${Math.floor(Math.random() * 15) + 8}
` : ''}

🚀 UPGRADE NOW AND KEEP EVERYTHING:
✓ All your demo data - Keep your projects and files
✓ Advanced features - Unlock PRO/Enterprise capabilities  
✓ No interruption - Seamless transition to full access
✓ Priority support - Get help when you need it

Upgrade Now: ${data.upgradeUrl}
Continue Demo: ${data.dashboardUrl}

💡 LIMITED TIME: Upgrade during your demo period and receive a special discount!

Demo expires: ${new Date(data.timeRemaining + Date.now()).toLocaleString()}

Questions? Contact ${data.companyName} support team.
`;

    return { html, text, subject };
  }

  /**
   * Generate demo conversion thank you email content
   */
  private static generateDemoConversionEmailContent(data: any) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>🎉 Welcome to Full Access!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f8f9fa; }
        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: white; margin: 0 20px; }
        .success-box { background-color: #d4edda; border: 2px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .feature-item { background-color: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #007bff, #0056b3); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
        .primary-button { background: linear-gradient(135deg, #28a745, #20c997); }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; margin: 0 20px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="font-size: 1.2em; margin: 10px 0;">Your full access is now active!</p>
        </div>
        <div class="content">
            <h2>Hello ${data.userName}! 🎊</h2>
            
            <div class="success-box">
                <h3>✅ SUBSCRIPTION ACTIVATED</h3>
                <p><strong>Subscription ID:</strong> ${data.subscriptionId}</p>
                <p><strong>Status:</strong> Active & Ready to Use</p>
                <p><strong>Your demo data has been preserved!</strong></p>
            </div>

            <h3>🚀 What's New With Full Access:</h3>
            <div class="features-grid">
                <div class="feature-item">
                    <h4>🔓 All Features Unlocked</h4>
                    <p>Access every tool and capability</p>
                </div>
                <div class="feature-item">
                    <h4>⚡ Advanced Workflows</h4>
                    <p>Automated processes and integrations</p>
                </div>
                <div class="feature-item">
                    <h4>📊 Advanced Analytics</h4>
                    <p>Deep insights and custom reports</p>
                </div>
                <div class="feature-item">
                    <h4>🏢 Enterprise Features</h4>
                    <p>Collaboration and team management</p>
                </div>
            </div>

            <h3>📋 Next Steps:</h3>
            <ol style="margin: 20px 0;">
                <li><strong>Access Your Dashboard:</strong> All your demo data is waiting for you</li>
                <li><strong>Explore New Features:</strong> Check out the advanced tools now available</li>
                <li><strong>Setup Your Team:</strong> Invite colleagues if you have multiple seats</li>
                <li><strong>Configure Integrations:</strong> Connect your favorite third-party tools</li>
            </ol>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${data.dashboardUrl}" class="button primary-button">🚀 Access Full Dashboard</a>
                <a href="${data.accountUrl}" class="button">⚙️ Manage Account</a>
            </div>

            <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                <h4>💡 Need Help Getting Started?</h4>
                <p>Our customer success team is here to help you maximize your investment. Schedule a personalized onboarding session!</p>
                <p><a href="${data.supportUrl}">Contact Support</a></p>
            </div>

            <h3>🎁 Special Thank You:</h3>
            <p>As a thank you for upgrading from your demo, you'll receive:</p>
            <ul>
                <li>Priority customer support for your first 30 days</li>
                <li>Exclusive access to our advanced feature tutorials</li>
                <li>Early access to new features and beta releases</li>
            </ul>

            <p>Thank you for choosing our platform! We're excited to be part of your success story.</p>
        </div>
        
        <div class="footer">
            <p>Welcome to the full experience! 🚀</p>
            <p>This email was sent by ${data.companyName}</p>
            <p><a href="${data.accountUrl}">Manage Account</a> | <a href="${data.supportUrl}">Get Support</a></p>
        </div>
    </div>
</body>
</html>`;

    const text = `
🎉 Congratulations! Your Full Access is Now Active!

Hello ${data.userName}!

✅ SUBSCRIPTION ACTIVATED
- Subscription ID: ${data.subscriptionId}
- Status: Active & Ready to Use
- Your demo data has been preserved!

🚀 WHAT'S NEW WITH FULL ACCESS:
✓ All Features Unlocked - Access every tool and capability
✓ Advanced Workflows - Automated processes and integrations
✓ Advanced Analytics - Deep insights and custom reports
✓ Enterprise Features - Collaboration and team management

📋 NEXT STEPS:
1. Access Your Dashboard - All your demo data is waiting
2. Explore New Features - Check out advanced tools now available
3. Setup Your Team - Invite colleagues if you have multiple seats
4. Configure Integrations - Connect your favorite third-party tools

Dashboard: ${data.dashboardUrl}
Account Settings: ${data.accountUrl}
Support: ${data.supportUrl}

🎁 SPECIAL THANK YOU BENEFITS:
✓ Priority customer support for your first 30 days
✓ Exclusive access to advanced feature tutorials
✓ Early access to new features and beta releases

💡 Need help getting started? Our customer success team is ready to help you maximize your investment!

Thank you for choosing our platform! We're excited to be part of your success story.

- ${data.companyName}
`;

    return { html, text };
  }

  /**
   * Generate subscription seeding email content
   */
  private static generateSubscriptionSeedingEmailContent(data: any) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Dashboard v14 ${data.tier} Plan</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .license-card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .license-key { font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #495057; background-color: #fff; padding: 8px; border: 2px dashed #007bff; border-radius: 4px; text-align: center; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
        .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .tier-badge { display: inline-block; padding: 4px 12px; background-color: #28a745; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Dashboard v14!</h1>
            <p>Your ${data.tier} plan is now active with ${data.initialLicenseCount} license(s)</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.userName}!</h2>
            
            <p>Welcome to Dashboard v14! Your <span class="tier-badge">${data.tier}</span> subscription has been successfully set up with ${data.initialLicenseCount} initial license(s).</p>
            
            <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                <h4>📊 Your Plan Details:</h4>
                <ul>
                    <li><strong>Plan:</strong> ${data.tier}</li>
                    <li><strong>Initial Licenses:</strong> ${data.initialLicenseCount}</li>
                    <li><strong>Maximum Licenses:</strong> ${data.maxLicenseCount}</li>
                    <li><strong>Subscription ID:</strong> ${data.subscriptionId}</li>
                </ul>
            </div>

            <h3>🔑 Your License Keys:</h3>
            ${data.licenses.map((license: any, index: number) => `
                <div class="license-card">
                    <h4>License #${index + 1}</h4>
                    <div class="license-key">${license.key}</div>
                    <p><strong>Status:</strong> <span style="color: #28a745;">Active</span></p>
                    <p><strong>Expires:</strong> ${license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : '12 months from now'}</p>
                </div>
            `).join('')}

            <h3>🚀 Getting Started:</h3>
            <ol style="margin: 20px 0;">
                <li><strong>Access Your Dashboard:</strong> Start using your new licenses immediately</li>
                <li><strong>Manage Licenses:</strong> Assign licenses to team members as needed</li>
                <li><strong>Explore Features:</strong> Discover all the capabilities of your ${data.tier} plan</li>
                <li><strong>Need More Seats?</strong> You can expand up to ${data.maxLicenseCount} total licenses</li>
            </ol>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${data.dashboardUrl}" class="button">🚀 Access Dashboard</a>
                <a href="${data.accountUrl}" class="button">⚙️ Manage Account</a>
            </div>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <h4>💡 Need Help?</h4>
                <p>Our support team is here to help you get the most out of Dashboard v14. Don't hesitate to reach out!</p>
                <p><a href="${data.supportUrl}">Contact Support</a></p>
            </div>

            <p>Thank you for choosing Dashboard v14! We're excited to help you streamline your production management.</p>
        </div>
        
        <div class="footer">
            <p>Welcome aboard! 🚀</p>
            <p>This email was sent by ${data.companyName}</p>
            <p><a href="${data.accountUrl}">Manage Account</a> | <a href="${data.supportUrl}">Get Support</a></p>
        </div>
    </div>
</body>
</html>`;

    const text = `
🎉 Welcome to Dashboard v14!

Hello ${data.userName}!

Welcome to Dashboard v14! Your ${data.tier} subscription has been successfully set up with ${data.initialLicenseCount} initial license(s).

📊 YOUR PLAN DETAILS:
- Plan: ${data.tier}
- Initial Licenses: ${data.initialLicenseCount}
- Maximum Licenses: ${data.maxLicenseCount}
- Subscription ID: ${data.subscriptionId}

🔑 YOUR LICENSE KEYS:
${data.licenses.map((license: any, index: number) => `
License #${index + 1}: ${license.key}
Status: Active
Expires: ${license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : '12 months from now'}
`).join('\n')}

🚀 GETTING STARTED:
1. Access Your Dashboard - Start using your new licenses immediately
2. Manage Licenses - Assign licenses to team members as needed
3. Explore Features - Discover all the capabilities of your ${data.tier} plan
4. Need More Seats? - You can expand up to ${data.maxLicenseCount} total licenses

Dashboard: ${data.dashboardUrl}
Account Settings: ${data.accountUrl}
Support: ${data.supportUrl}

💡 Need help? Our support team is here to help you get the most out of Dashboard v14!

Thank you for choosing Dashboard v14! We're excited to help you streamline your production management.

- ${data.companyName}
`;

    return { html, text };
  }
}
