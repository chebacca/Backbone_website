import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/paymentService.js';
import { EmailService } from '../services/emailService.js';
import { ComplianceService } from '../services/complianceService.js';
import { logger } from '../utils/logger.js';
import { firestoreService } from '../services/firestoreService.js';
import { 
  asyncHandler, 
  createApiError 
} from '../middleware/errorHandler.js';

const router: Router = Router();

/**
 * Stripe webhook handler
 * This endpoint receives webhooks from Stripe to handle payment events
 */
router.post('/stripe', asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const event = req.body;

  if (!signature) {
    logger.error('Missing Stripe signature header');
    throw createApiError('Missing Stripe signature', 400);
  }

  try {
    const result = await PaymentService.handleWebhook(event, signature);
    
    logger.info('Stripe webhook processed successfully', {
      eventId: event.id,
      eventType: event.type,
    });

    res.json(result);
  } catch (error) {
    logger.error('Stripe webhook processing failed', {
      eventId: event.id,
      eventType: event.type,
      error: (error as Error).message,
    });

    // Create compliance event for webhook failures
    await ComplianceService.createComplianceEvent(
      'REGULATORY_BREACH',
      'MEDIUM',
      `Webhook processing failed: ${(error as Error).message}`,
      undefined,
      undefined,
      {
        eventId: event.id,
        eventType: event.type,
        signature: signature?.substring(0, 20) + '...',
      }
    ).catch(() => {
      // Don't let compliance logging failures break webhook response
    });

    throw error;
  }
}));

/**
 * SendGrid webhook handler
 * This endpoint receives webhooks from SendGrid to track email events
 */
router.post('/sendgrid', asyncHandler(async (req: Request, res: Response) => {
  const events = Array.isArray(req.body) ? req.body : [req.body];

  for (const event of events) {
    try {
      await handleSendGridEvent(event);
    } catch (error) {
      logger.error('SendGrid webhook event processing failed', {
        event,
        error: (error as Error).message,
      });
    }
  }

  res.json({ received: true, processed: events.length });
}));

/**
 * Handle SendGrid email events
 */
async function handleSendGridEvent(event: any) {
  const { event: eventType, email, sg_message_id, timestamp } = event;

  if (!sg_message_id) {
    return; // Skip events without message ID
  }

  // Find the email log entry
  const emailLog = await prisma.emailLog.findFirst({
    where: { sendgridId: sg_message_id },
  });

  if (!emailLog) {
    logger.warn('Email log not found for SendGrid event', {
      messageId: sg_message_id,
      eventType,
    });
    return;
  }

  // Update email log based on event type
  const updateData: any = {
    updatedAt: new Date(timestamp * 1000),
  };

  switch (eventType) {
    case 'delivered':
      updateData.status = 'DELIVERED';
      break;
    case 'open':
      updateData.status = 'OPENED';
      // Update license delivery log if this is a license email
      if (emailLog.template === 'license_delivery') {
        await updateLicenseDeliveryLog(sg_message_id, { emailOpened: true });
      }
      break;
    case 'click':
      updateData.status = 'CLICKED';
      // Update license delivery log if this is a license email
      if (emailLog.template === 'license_delivery') {
        await updateLicenseDeliveryLog(sg_message_id, { linkClicked: true });
      }
      break;
    case 'bounce':
    case 'dropped':
      updateData.status = 'BOUNCED';
      updateData.error = event.reason || 'Email bounced';
      break;
    case 'spamreport':
      updateData.status = 'FAILED';
      updateData.error = 'Marked as spam';
      break;
    case 'unsubscribe':
      // Handle unsubscribe events
      await handleUnsubscribe(email, sg_message_id);
      break;
  }

  await prisma.emailLog.update({
    where: { id: emailLog.id },
    data: updateData,
  });

  logger.info('SendGrid event processed', {
    messageId: sg_message_id,
    eventType,
    email,
    status: updateData.status,
  });
}

/**
 * Update license delivery log based on email events
 */
async function updateLicenseDeliveryLog(messageId: string, updates: any) {
  try {
    const emailLog = await prisma.emailLog.findFirst({
      where: { sendgridId: messageId },
    });

    if (!emailLog) return;

    // Extract payment ID from email data to find license delivery logs
    const emailData = emailLog.data as any;
    if (emailData.paymentId) {
      await prisma.licenseDeliveryLog.updateMany({
        where: { paymentId: emailData.paymentId },
        data: updates,
      });
    }
  } catch (error) {
    logger.error('Failed to update license delivery log', error);
  }
}

/**
 * Handle email unsubscribe events
 */
async function handleUnsubscribe(email: string, messageId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn('User not found for unsubscribe event', { email });
      return;
    }

    // Update marketing consent
    await ComplianceService.recordConsent(
      user.id,
      'MARKETING',
      false,
      '1.0'
    );

    // Update user preferences
    await prisma.user.update({
      where: { id: user.id },
      data: { marketingConsent: false },
    });

    // Create audit log
    await ComplianceService.createAuditLog(
      user.id,
      'CONSENT_WITHDRAW',
      'User unsubscribed from marketing emails',
      { messageId, email }
    );

    logger.info('User unsubscribed from marketing emails', {
      userId: user.id,
      email,
      messageId,
    });
  } catch (error) {
    logger.error('Failed to process unsubscribe event', {
      email,
      messageId,
      error: (error as Error).message,
    });
  }
}

/**
 * Test webhook endpoint for development
 */
router.post('/test', asyncHandler(async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    throw createApiError('Test endpoint not available in production', 404);
  }

  const { type, data } = req.body;

  logger.info('Test webhook received', { type, data });

  // Simulate different webhook events for testing
  switch (type) {
    case 'payment_succeeded':
      // Simulate successful payment
      res.json({ message: 'Payment success webhook simulated' });
      break;

    case 'email_delivered':
      // Simulate email delivery
      res.json({ message: 'Email delivery webhook simulated' });
      break;

    default:
      res.json({ message: 'Unknown webhook type', type });
  }
}));

/**
 * Webhook health check
 */
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const [recentWebhooks, failedWebhooks] = await Promise.all([
    prisma.webhookEvent.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
    prisma.webhookEvent.count({
      where: {
        processed: false,
        retryCount: { gt: 0 },
      },
    }),
  ]);

  const health = {
    status: failedWebhooks > 10 ? 'unhealthy' : 'healthy',
    recentWebhooks,
    failedWebhooks,
    lastCheck: new Date(),
  };

  res.json({
    success: true,
    data: { health },
  });
}));

/**
 * Retry failed webhooks (admin endpoint)
 */
router.post('/retry-failed', asyncHandler(async (req: Request, res: Response) => {
  // This would typically require admin authentication
  // For now, just a simple implementation

  const failedWebhooks = await prisma.webhookEvent.findMany({
    where: {
      processed: false,
      retryCount: { lt: 3 }, // Don't retry more than 3 times
    },
    take: 10,
  });

  let retried = 0;
  
  for (const webhook of failedWebhooks) {
    try {
      // Retry processing the webhook
      await PaymentService.handleWebhook(webhook.data as any, '');
      
      await prisma.webhookEvent.update({
        where: { id: webhook.id },
        data: {
          processed: true,
          error: null,
        },
      });
      
      retried++;
    } catch (error) {
      await prisma.webhookEvent.update({
        where: { id: webhook.id },
        data: {
          retryCount: { increment: 1 },
          error: (error as Error).message,
        },
      });
    }
  }

  res.json({
    success: true,
    message: `Retried ${retried} failed webhooks`,
    data: {
      retriedCount: retried,
      totalFailed: failedWebhooks.length,
    },
  });
}));

export { router as webhooksRouter };
