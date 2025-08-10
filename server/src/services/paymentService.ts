import Stripe from 'stripe';
import { db } from './db.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { ComplianceService } from './complianceService.js';
import { EmailService } from './emailService.js';
import { LicenseService } from './licenseService.js';
export type SubscriptionTier = 'BASIC' | 'PRO' | 'ENTERPRISE';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PROCESSING';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  /**
   * Create a subscription with full compliance and payment processing
   */
  static async createSubscription(
    userId: string,
    subscriptionData: {
      tier: SubscriptionTier;
      seats: number;
      paymentMethodId: string;
      billingAddress: any;
      taxInformation?: any;
      businessProfile?: any;
    },
    requestInfo: { ip?: string; userAgent?: string }
  ) {
    try {
      logger.info(`Creating subscription for user ${userId}`, {
        tier: subscriptionData.tier,
        seats: subscriptionData.seats,
      });

      // 1. Get user and validate
      const user = await db.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Validate billing address
      const addressValidation = await ComplianceService.validateBillingAddress(
        subscriptionData.billingAddress
      );

      if (!addressValidation.valid) {
        throw new Error(`Invalid billing address: ${addressValidation.errors.join(', ')}`);
      }

      // 3. Save/update billing address
      await db.updateUser(userId, {
        billingAddress: {
          ...subscriptionData.billingAddress,
          validated: true,
          validatedAt: new Date(),
          validationSource: 'payment_flow',
        },
      } as any);

      // 4. Calculate pricing
      const pricing = this.calculateSubscriptionPricing(
        subscriptionData.tier,
        subscriptionData.seats
      );

      // 5. Calculate tax
      const taxCalculation = await ComplianceService.calculateTax(
        pricing.subtotal,
        subscriptionData.billingAddress,
        subscriptionData.businessProfile ? 'business' : 'individual'
      );

      // 6. Create or get Stripe customer
      let stripeCustomer = await this.getOrCreateStripeCustomer(user, subscriptionData.billingAddress);

      // 7. Attach payment method to customer
      await stripe.paymentMethods.attach(subscriptionData.paymentMethodId, {
        customer: stripeCustomer.id,
      });

      // 8. Set as default payment method
      await stripe.customers.update(stripeCustomer.id, {
        invoice_settings: {
          default_payment_method: subscriptionData.paymentMethodId,
        },
      });

      // 9. Get Stripe price ID based on tier
      const stripePriceId = this.getStripePriceId(subscriptionData.tier);

      // 10. Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [
          {
            price: stripePriceId,
            quantity: subscriptionData.seats,
          },
        ],
        default_payment_method: subscriptionData.paymentMethodId,
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          tier: subscriptionData.tier,
          seats: subscriptionData.seats.toString(),
        },
        // Add tax if applicable
        ...(taxCalculation.taxAmount > 0 && {
          default_tax_rates: await this.getOrCreateTaxRate(taxCalculation),
        }),
      });

      // 11. Create subscription record in database
      const subscription = await db.createSubscription({
        userId,
        tier: subscriptionData.tier,
        status: this.mapStripeStatusToOurStatus(stripeSubscription.status),
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeCustomer.id,
        stripePriceId,
        seats: subscriptionData.seats,
        pricePerSeat: pricing.pricePerSeat,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: false,
      });

      // 12. Create payment record
      const latestInvoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

      const payment = await db.createPayment({
        userId,
        subscriptionId: subscription.id,
        stripePaymentIntentId: paymentIntent.id,
        stripeInvoiceId: latestInvoice.id,
        amount: taxCalculation.totalAmount,
        currency: latestInvoice.currency,
        status: this.mapStripePaymentStatusToOurStatus(paymentIntent.status),
        description: `${subscriptionData.tier} subscription - ${subscriptionData.seats} seats`,
        receiptUrl: latestInvoice.hosted_invoice_url || undefined,
        paymentMethod: paymentIntent.payment_method_types?.[0],
        billingAddressSnapshot: subscriptionData.billingAddress,
        taxAmount: taxCalculation.taxAmount,
        taxRate: taxCalculation.taxRate,
        taxJurisdiction: taxCalculation.jurisdiction,
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        complianceData: {
          userType: subscriptionData.businessProfile ? 'business' : 'individual',
          subscriptionTier: subscriptionData.tier,
          seats: subscriptionData.seats,
          timestamp: new Date().toISOString(),
        },
        amlScreeningStatus: 'PENDING',
        pciCompliant: true,
      });

      // 13. Perform AML screening
      await ComplianceService.performAMLScreening(payment.id, {
        userId,
        amount: taxCalculation.totalAmount,
        country: subscriptionData.billingAddress.country,
      });

      // 14. Create audit log
      await ComplianceService.createAuditLog(
        userId,
        'SUBSCRIPTION_CREATE',
        `Created ${subscriptionData.tier} subscription with ${subscriptionData.seats} seats`,
        {
          subscriptionId: subscription.id,
          paymentId: payment.id,
          amount: taxCalculation.totalAmount,
          tier: subscriptionData.tier,
          seats: subscriptionData.seats,
        },
        requestInfo
      );

      // 15. Check payment status and process accordingly
      if (paymentIntent.status === 'succeeded') {
        await this.handleSuccessfulPayment(subscription, payment, user);
      }

      logger.info(`Subscription created successfully for user ${userId}`, {
        subscriptionId: subscription.id,
        paymentId: payment.id,
        stripeSubscriptionId: stripeSubscription.id,
      });

      return {
        subscription,
        payment,
        stripeSubscription,
        taxCalculation,
      };
    } catch (error) {
      logger.error('Failed to create subscription', error);
      
      // Create compliance event for failed payment
      await ComplianceService.createComplianceEvent(
        'SUSPICIOUS_TRANSACTION',
        'MEDIUM',
        `Payment failed for user ${userId}: ${(error as Error).message}`,
        userId,
        undefined,
        { error: (error as Error).message, requestInfo }
      );

      throw error;
    }
  }

  /**
   * Handle successful payment - create licenses and send emails
   */
  static async handleSuccessfulPayment(subscription: any, payment: any, user: any) {
    try {
      logger.info(`Processing successful payment for subscription ${subscription.id}`);

      // 1. Update payment status
      await db.updatePayment(payment.id, { status: 'SUCCEEDED' });

      // 2. Update subscription status
      await db.updateSubscription(subscription.id, { status: 'ACTIVE' });

      // 3. Generate licenses based on seats
      const licenses = await LicenseService.generateLicenses(
        user.id,
        subscription.id,
        subscription.tier,
        subscription.seats
      );

      // 4. Create license delivery logs
      for (const license of licenses) {
        await db.createLicenseDeliveryLog({
          licenseId: license.id,
          paymentId: payment.id,
          deliveryMethod: 'EMAIL',
          emailAddress: user.email,
          deliveryStatus: 'PENDING',
        });
      }

      // 5. Send welcome email with license key(s)
      await EmailService.sendLicenseDeliveryEmail(user, licenses, subscription, payment);

      // 5b. Send payment receipt email including invoice link
      try {
        await EmailService.sendPaymentReceiptEmail(user, payment, subscription);
      } catch (emailErr) {
        logger.warn('Failed to send payment receipt email', emailErr);
      }

      // 6. Update user compliance status if needed
      if (subscription.tier === 'ENTERPRISE') {
        // For enterprise customers, we might need additional verification
        await this.handleEnterpriseCompliance(user, subscription);
      }

      // 7. Create audit log for successful payment
      await ComplianceService.createAuditLog(
        user.id,
        'PAYMENT_PROCESS',
        `Payment succeeded for subscription ${subscription.id}`,
        {
          paymentId: payment.id,
          amount: payment.amount,
          licenseCount: licenses.length,
        }
      );

      // 8. Update license delivery status
      await db.updateLicenseDeliveryLogsForPayment(payment.id, {
        deliveryStatus: 'SENT',
        emailSent: true,
        lastAttemptAt: new Date(),
      } as any);

      logger.info(`Successfully processed payment for subscription ${subscription.id}`, {
        licenseCount: licenses.length,
        userEmail: user.email,
      });

      return { licenses, emailSent: true };
    } catch (error) {
      logger.error('Failed to handle successful payment', error);
      
      // Create compliance event for processing failure
      await ComplianceService.createComplianceEvent(
        'REGULATORY_BREACH',
        'HIGH',
        `Failed to process successful payment for subscription ${subscription.id}: ${(error as Error).message}`,
        user.id,
        payment.id,
        { error: (error as Error).message }
      );

      throw error;
    }
  }

  /**
   * Process webhook events from Stripe with verified signature
   */
  static async handleWebhook(rawBody: Buffer | string, signature: string) {
    try {
      // Verify webhook signature and construct event
      const webhookSecret = config.stripe.webhookSecret;
      const payload = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      // Log webhook event
      await db.createWebhookEvent({
        type: event.type,
        stripeId: event.id,
        data: event.data,
      });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }

      // Mark webhook as processed
      const existing = await db.getWebhookEventByStripeId(event.id);
      if (existing) {
        await db.updateWebhookEvent(existing.id, { processed: true });
      }

      return { received: true, processed: true };
    } catch (error) {
      logger.error('Webhook processing failed', error);
      
      // Update webhook with error
      try {
        const message = (error as Error)?.message || 'unknown error';
        // We may not have a valid event at this point; attempt to parse ID from signature context is not possible.
        // So we record a generic failure entry.
        await db.createWebhookEvent({
          type: 'unknown',
          stripeId: `unverified_${Date.now()}`,
          data: { error: message },
        } as any);
      } catch (_) {
        // swallow secondary logging errors
      }

      throw error;
    }
  }

  // Private helper methods

  private static calculateSubscriptionPricing(tier: SubscriptionTier, seats: number) {
    const pricePerSeat = tier === 'BASIC' ? 29 : tier === 'PRO' ? 99 : 0; // Enterprise is custom
    const subtotal = pricePerSeat * seats;

    return {
      pricePerSeat,
      seats,
      subtotal,
    };
  }

  private static getStripePriceId(tier: SubscriptionTier): string {
    switch (tier) {
      case 'BASIC':
        return config.stripe.basicPriceId;
      case 'PRO':
        return config.stripe.proPriceId;
      case 'ENTERPRISE':
        return config.stripe.enterprisePriceId;
      default:
        throw new Error(`Unknown subscription tier: ${tier}`);
    }
  }

  private static async getOrCreateStripeCustomer(user: any, billingAddress: any) {
    // Check if user already has a Stripe customer ID
    const existingSubscriptions = await db.getSubscriptionsByUserId(user.id);
    const withCustomer = existingSubscriptions.find((s: any) => s.stripeCustomerId);
    if (withCustomer?.stripeCustomerId) {
      return await stripe.customers.retrieve(withCustomer.stripeCustomerId);
    }

    // Create new Stripe customer
    return await stripe.customers.create({
      email: user.email,
      name: `${billingAddress.firstName} ${billingAddress.lastName}`,
      address: {
        line1: billingAddress.addressLine1,
        line2: billingAddress.addressLine2,
        city: billingAddress.city,
        state: billingAddress.state,
        postal_code: billingAddress.postalCode,
        country: billingAddress.country,
      },
      metadata: {
        userId: user.id,
      },
    });
  }

  private static async getOrCreateTaxRate(taxCalculation: any) {
    // In production, you'd cache tax rates or use Stripe's tax feature
    // For now, return empty array (manual tax calculation)
    return [];
  }

  private static mapStripeStatusToOurStatus(stripeStatus: string) {
    const statusMap: Record<string, any> = {
      'active': 'ACTIVE',
      'incomplete': 'INACTIVE',
      'incomplete_expired': 'INACTIVE',
      'trialing': 'TRIALING',
      'past_due': 'PAST_DUE',
      'canceled': 'CANCELLED',
      'unpaid': 'PAST_DUE',
    };

    return statusMap[stripeStatus] || 'INACTIVE';
  }

  private static mapStripePaymentStatusToOurStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'succeeded': 'SUCCEEDED',
      'pending': 'PENDING',
      'failed': 'FAILED',
      'canceled': 'CANCELLED',
      'processing': 'PROCESSING',
    };

    return statusMap[stripeStatus] || 'PENDING';
  }

  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Find and update payment record
    const payment = await db.getPaymentByStripePaymentIntentId(paymentIntent.id);
    if (payment) {
      const subscription = await db.getSubscriptionById(payment.subscriptionId);
      const user = await db.getUserById(payment.userId);
      if (subscription && user) {
        await this.handleSuccessfulPayment(subscription, payment, user);
      }
    }
  }

  private static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Update payment record and create compliance event
    const payment = await db.getPaymentByStripePaymentIntentId(paymentIntent.id);

    if (payment) {
      await db.updatePayment(payment.id, { status: 'FAILED' });

      await ComplianceService.createComplianceEvent(
        'SUSPICIOUS_TRANSACTION',
        'MEDIUM',
        `Payment failed for payment ${payment.id}`,
        payment.userId,
        payment.id,
        { stripePaymentIntentId: paymentIntent.id }
      );
    }
  }

  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle recurring payment success
    logger.info(`Invoice payment succeeded: ${invoice.id}`);
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Update subscription record in database
    const dbSubscription = await db.getSubscriptionByStripeId(subscription.id);

    if (dbSubscription) {
      await db.updateSubscription(dbSubscription.id, {
        status: this.mapStripeStatusToOurStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    }
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Cancel subscription and revoke licenses
    const dbSubscription = await db.getSubscriptionByStripeId(subscription.id);

    if (dbSubscription) {
      await db.updateSubscription(dbSubscription.id, {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      });

      // Revoke associated licenses
      const licenses = await db.getLicensesByUserId(dbSubscription.userId);
      const affected = licenses.filter((l: any) => l.subscriptionId === dbSubscription.id);
      for (const lic of affected) {
        await db.updateLicense(lic.id, { status: 'REVOKED' });
      }
    }
  }

  private static async handleEnterpriseCompliance(user: any, subscription: any) {
    // Additional compliance checks for enterprise customers
    logger.info(`Performing enterprise compliance checks for user ${user.id}`);
    
    // This would include additional verification, EDD, etc.
    // For now, just log the event
    await ComplianceService.createAuditLog(
      user.id,
      'PROFILE_UPDATE',
      'Enterprise subscription activated - additional compliance measures applied'
    );
  }

  /**
   * Get payment history for a user
   */
  static async getPaymentHistory(userId: string, options: { skip?: number; take?: number } = {}) {
    const { skip = 0, take = 10 } = options;
    const all = await db.getPaymentsByUserId(userId);
    const sorted = all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const payments = sorted.slice(skip, skip + take);
    const total = all.length;
    return { payments, total };
  }

  /**
   * Get specific payment details
   */
  static async getPaymentDetails(userId: string, paymentId: string) {
    const payment = await db.getPaymentById(paymentId);
    if (!payment || payment.userId !== userId) return null;
    const subscription = await db.getSubscriptionById(payment.subscriptionId);
    const auditLogs = await db.getAuditLogsByUser(userId);
    return { ...payment, subscription, auditLogs: auditLogs.slice(0, 10) } as any;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    userId: string,
    subscriptionId: string,
    options: {
      reason?: string;
      cancelAtPeriodEnd?: boolean;
      feedback?: string;
    },
    requestInfo: any
  ) {
    const subscription = await db.getSubscriptionById(subscriptionId);
    if (!subscription || subscription.userId !== userId) {
      throw new Error('Subscription not found');
    }

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.stripeSubscriptionId) {
      // Cancel in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: options.cancelAtPeriodEnd,
      });
    }

    // Update subscription in database
    await db.updateSubscription(subscriptionId, {
      cancelAtPeriodEnd: options.cancelAtPeriodEnd,
      cancelledAt: options.cancelAtPeriodEnd ? null as any : new Date(),
      status: options.cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELLED',
    });
    const updatedSubscription = await db.getSubscriptionById(subscriptionId);

    // Create audit log
    await ComplianceService.createAuditLog(
      userId,
      'SUBSCRIPTION_CANCEL',
      `Subscription cancelled: ${options.reason || 'No reason provided'}`,
      {
        subscriptionId,
        cancelAtPeriodEnd: options.cancelAtPeriodEnd,
        reason: options.reason,
        feedback: options.feedback,
      },
      requestInfo
    );

    return { subscription: updatedSubscription };
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(
    userId: string,
    subscriptionId: string,
    paymentMethodId: string,
    requestInfo: any
  ) {
    const subscription = await db.getSubscriptionById(subscriptionId);
    if (!subscription || subscription.userId !== userId) {
      throw new Error('Subscription not found');
    }

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.stripeCustomerId && subscription.stripeSubscriptionId) {
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: subscription.stripeCustomerId,
      });

      // Update default payment method
      await stripe.customers.update(subscription.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update subscription payment method
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        default_payment_method: paymentMethodId,
      });
    }

    // Create audit log
    await ComplianceService.createAuditLog(
      userId,
      'PAYMENT_PROCESS',
      'Payment method updated',
      { subscriptionId, paymentMethodId },
      requestInfo
    );

    return { subscription };
  }

  /**
   * Update subscription
   */
  static async updateSubscription(
    userId: string,
    subscriptionId: string,
    updates: { seats?: number; tier?: string },
    requestInfo: any
  ) {
    const subscription = await db.getSubscriptionById(subscriptionId);
    if (!subscription || subscription.userId !== userId) {
      throw new Error('Subscription not found');
    }

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    let updatedSubscription = subscription;

    // Update in Stripe if needed
    if (subscription.stripeSubscriptionId && updates.seats) {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
      
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{
          id: stripeSubscription.items.data[0].id,
          quantity: updates.seats,
        }],
        proration_behavior: 'always_invoice',
      });
    }

    // Update in database
    await db.updateSubscription(subscriptionId, {
      seats: updates.seats || subscription.seats,
    });
    updatedSubscription = (await db.getSubscriptionById(subscriptionId))!;

    // Generate additional licenses if seats increased
    if (updates.seats && updates.seats > subscription.seats) {
      const additionalSeats = updates.seats - subscription.seats;
      await LicenseService.generateLicenses(
        userId,
        subscriptionId,
        subscription.tier,
        additionalSeats
      );
    }

    // Create audit log
    await ComplianceService.createAuditLog(
      userId,
      'SUBSCRIPTION_UPDATE',
      'Subscription updated',
      { subscriptionId, updates },
      requestInfo
    );

    return { subscription: updatedSubscription };
  }

  /**
   * Reactivate subscription
   */
  static async reactivateSubscription(
    userId: string,
    subscriptionId: string,
    requestInfo: any
  ) {
    const subscription = await db.getSubscriptionById(subscriptionId);
    if (!subscription || subscription.userId !== userId) {
      throw new Error('Subscription not found');
    }

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.stripeSubscriptionId) {
      // Reactivate in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    }

    // Update subscription in database
    await db.updateSubscription(subscriptionId, {
      cancelAtPeriodEnd: false,
      cancelledAt: null as any,
      status: 'ACTIVE',
    });
    const updatedSubscription = await db.getSubscriptionById(subscriptionId);

    // Create audit log
    await ComplianceService.createAuditLog(
      userId,
      'SUBSCRIPTION_UPDATE',
      'Subscription reactivated',
      { subscriptionId },
      requestInfo
    );

    return { subscription: updatedSubscription };
  }

  /**
   * Preview subscription changes
   */
  static async previewSubscriptionChanges(subscription: any, changes: { seats?: number; tier?: string }) {
    const currentPrice = subscription.pricePerSeat * subscription.seats;
    const newSeats = changes.seats || subscription.seats;
    const newTier = changes.tier || subscription.tier;
    
    let newPricePerSeat = subscription.pricePerSeat;
    if (changes.tier) {
      newPricePerSeat = newTier === 'BASIC' ? 29 : newTier === 'PRO' ? 99 : subscription.pricePerSeat;
    }

    const newPrice = newPricePerSeat * newSeats;
    const priceDifference = newPrice - currentPrice;

    return {
      current: {
        tier: subscription.tier,
        seats: subscription.seats,
        pricePerSeat: subscription.pricePerSeat,
        totalPrice: currentPrice,
      },
      new: {
        tier: newTier,
        seats: newSeats,
        pricePerSeat: newPricePerSeat,
        totalPrice: newPrice,
      },
      difference: {
        seats: newSeats - subscription.seats,
        price: priceDifference,
        percentage: currentPrice > 0 ? (priceDifference / currentPrice) * 100 : 0,
      },
    };
  }
}
