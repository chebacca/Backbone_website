import Stripe from 'stripe';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { firestoreService } from './firestoreService.js';
import { getFirestore } from 'firebase-admin/firestore';
import { EmailService } from './emailService.js';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export interface StandaloneProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  fileSize: string;
  version: string;
  downloadUrl?: string;
}

export interface StandaloneOrder {
  id: string;
  userId: string;
  userEmail: string;
  items: Array<{
    product: StandaloneProduct;
    quantity: number;
  }>;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  downloadLinks: Array<{
    productId: string;
    downloadUrl: string;
    expiresAt: Date;
  }>;
  createdAt: Date;
  completedAt?: Date;
}

export class StandalonePaymentService {
  /**
   * Create a payment intent for standalone products
   */
  static async createPaymentIntent(
    userId: string,
    items: Array<{ product: StandaloneProduct; quantity: number }>,
    currency: string = 'usd'
  ) {
    try {
      logger.info(`Creating standalone payment intent for user ${userId}`, {
        itemCount: items.length,
        totalAmount: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      });

      // Get user information
      const user = await firestoreService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const amountInCents = Math.round(totalAmount * 100);

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency,
        metadata: {
          userId: userId,
          userEmail: user.email,
          orderType: 'standalone',
          itemCount: items.length.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: user.email,
      });

      // Create order record in Firestore
      const orderId = `standalone_${Date.now()}_${userId}`;
      const order: StandaloneOrder = {
        id: orderId,
        userId: userId,
        userEmail: user.email,
        items: items,
        totalAmount: totalAmount,
        currency: currency,
        status: 'pending',
        paymentIntentId: paymentIntent.id,
        downloadLinks: [],
        createdAt: new Date(),
      };

      // Create order document in Firestore
      const db = getFirestore();
      const orderRef = db.collection('standaloneOrders').doc(orderId);
      await orderRef.set(order);

      logger.info(`Created standalone payment intent`, {
        orderId,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        orderId: orderId,
        amount: totalAmount,
        currency: currency,
      };
    } catch (error) {
      logger.error('Failed to create standalone payment intent', error);
      throw error;
    }
  }

  /**
   * Handle successful payment for standalone products
   */
  static async handlePaymentSuccess(paymentIntentId: string) {
    try {
      logger.info(`Processing standalone payment success for ${paymentIntentId}`);

      // Get payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment intent ${paymentIntentId} is not succeeded`);
      }

      // Find the order
      const db = getFirestore();
      const ordersSnapshot = await db.collection('standaloneOrders')
        .where('paymentIntentId', '==', paymentIntentId)
        .get();
      
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (orders.length === 0) {
        throw new Error(`No order found for payment intent ${paymentIntentId}`);
      }

      const order = orders[0] as StandaloneOrder;

      // Generate download links for each product
      const downloadLinks = await this.generateDownloadLinks(order.items, order.id);

      // Update order status
      const updatedOrder: Partial<StandaloneOrder> = {
        status: 'completed',
        completedAt: new Date(),
        downloadLinks: downloadLinks,
      };

      await db.collection('standaloneOrders').doc(order.id).update(updatedOrder);

      // Send confirmation email with download links
      await this.sendOrderConfirmationEmail(order, downloadLinks);

      // Create user purchase record for standalone products
      await this.createUserPurchaseRecord(order);

      logger.info(`Successfully processed standalone payment`, {
        orderId: order.id,
        userId: order.userId,
        downloadLinksCount: downloadLinks.length
      });

      return {
        success: true,
        orderId: order.id,
        downloadLinks: downloadLinks,
      };
    } catch (error) {
      logger.error('Failed to handle standalone payment success', error);
      throw error;
    }
  }

  /**
   * Generate secure download links for products
   */
  private static async generateDownloadLinks(
    items: Array<{ product: StandaloneProduct; quantity: number }>,
    orderId: string
  ) {
    const downloadLinks = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const downloadToken = this.generateDownloadToken(item.product.id, orderId, i);
        const downloadUrl = `${config.frontendUrl}/download/standalone/${item.product.id}?token=${downloadToken}`;
        
        downloadLinks.push({
          productId: item.product.id,
          downloadUrl: downloadUrl,
          expiresAt: expiresAt,
        });
      }
    }

    return downloadLinks;
  }

  /**
   * Generate a secure download token
   */
  private static generateDownloadToken(productId: string, orderId: string, index: number): string {
    const payload = {
      productId,
      orderId,
      index,
      timestamp: Date.now(),
    };
    
    // In production, use a proper JWT or signed token
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Send order confirmation email with download links
   */
  private static async sendOrderConfirmationEmail(
    order: StandaloneOrder,
    downloadLinks: Array<{ productId: string; downloadUrl: string; expiresAt: Date }>
  ) {
    try {
      const productGroups = downloadLinks.reduce((groups, link) => {
        const product = order.items.find(item => item.product.id === link.productId);
        if (product) {
          if (!groups[product.product.id]) {
            groups[product.product.id] = {
              product: product.product,
              links: []
            };
          }
          groups[product.product.id].links.push(link);
        }
        return groups;
      }, {} as Record<string, { product: StandaloneProduct; links: typeof downloadLinks }>);

      const emailContent = this.generateOrderConfirmationEmail(order, productGroups);

      // Send order confirmation email with download links
      await EmailService.sendStandaloneOrderConfirmation(
        order.userEmail,
        order,
        downloadLinks
      );

      logger.info(`Sent order confirmation email`, {
        orderId: order.id,
        userEmail: order.userEmail
      });
    } catch (error) {
      logger.error('Failed to send order confirmation email', error);
      // Don't throw - email failure shouldn't break the payment flow
    }
  }

  /**
   * Generate HTML email content for order confirmation
   */
  private static generateOrderConfirmationEmail(
    order: StandaloneOrder,
    productGroups: Record<string, { product: StandaloneProduct; links: Array<{ downloadUrl: string; expiresAt: Date }> }>
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Backbone Tools</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00d4ff 0%, #667eea 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .product { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #00d4ff; }
          .download-btn { background: #00d4ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase of Backbone Tools</p>
          </div>
          
          <div class="content">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
            <p><strong>Purchase Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
            
            <h3>Your Downloads</h3>
            ${Object.values(productGroups).map(({ product, links }) => `
              <div class="product">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p><strong>Version:</strong> ${product.version} | <strong>Size:</strong> ${product.fileSize}</p>
                <p><strong>Downloads (${links.length}):</strong></p>
                ${links.map((link, index) => `
                  <a href="${link.downloadUrl}" class="download-btn">Download #${index + 1}</a>
                `).join('')}
                <p><small>Download links expire on ${links[0]?.expiresAt.toLocaleDateString()}</small></p>
              </div>
            `).join('')}
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4>📋 Important Information</h4>
              <ul>
                <li>Download links are valid for 30 days from purchase</li>
                <li>Keep this email for future reference</li>
                <li>Contact support if you need assistance</li>
                <li>All products include 1 year of updates and support</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>BackboneLogic, Inc. | Professional Tools for Creative Professionals</p>
            <p>Need help? Contact us at support@backbone-logic.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email content for order confirmation
   */
  private static generateOrderConfirmationText(
    order: StandaloneOrder,
    productGroups: Record<string, { product: StandaloneProduct; links: Array<{ downloadUrl: string; expiresAt: Date }> }>
  ): string {
    let text = `Order Confirmation - Backbone Tools\n\n`;
    text += `Order ID: ${order.id}\n`;
    text += `Total Amount: $${order.totalAmount.toFixed(2)}\n`;
    text += `Purchase Date: ${order.createdAt.toLocaleDateString()}\n\n`;
    
    text += `Your Downloads:\n\n`;
    Object.values(productGroups).forEach(({ product, links }) => {
      text += `${product.name} (v${product.version})\n`;
      text += `${product.description}\n`;
      text += `File Size: ${product.fileSize}\n`;
      text += `Downloads (${links.length}):\n`;
      links.forEach((link, index) => {
        text += `  ${index + 1}. ${link.downloadUrl}\n`;
      });
      text += `  Expires: ${links[0]?.expiresAt.toLocaleDateString()}\n\n`;
    });
    
    text += `Important Information:\n`;
    text += `- Download links are valid for 30 days from purchase\n`;
    text += `- Keep this email for future reference\n`;
    text += `- Contact support if you need assistance\n`;
    text += `- All products include 1 year of updates and support\n\n`;
    
    text += `BackboneLogic, Inc. | Professional Tools for Creative Professionals\n`;
    text += `Need help? Contact us at support@backbone-logic.com\n`;
    
    return text;
  }

  /**
   * Create user purchase record for standalone products
   */
  private static async createUserPurchaseRecord(order: StandaloneOrder) {
    try {
      const purchaseRecord = {
        userId: order.userId,
        orderId: order.id,
        type: 'standalone',
        products: order.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: order.totalAmount,
        currency: order.currency,
        purchaseDate: order.createdAt,
        status: 'completed',
      };

      const db = getFirestore();
      await db.collection('userPurchases').doc(order.id).set(purchaseRecord);
      
      logger.info(`Created user purchase record`, {
        orderId: order.id,
        userId: order.userId
      });
    } catch (error) {
      logger.error('Failed to create user purchase record', error);
      // Don't throw - this is not critical for the payment flow
    }
  }

  /**
   * Get user's standalone purchases
   */
  static async getUserPurchases(userId: string) {
    try {
      const db = getFirestore();
      const purchasesSnapshot = await db.collection('userPurchases')
        .where('userId', '==', userId)
        .where('type', '==', 'standalone')
        .get();
      
      const purchases = purchasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return purchases.sort((a: any, b: any) => 
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      );
    } catch (error) {
      logger.error('Failed to get user purchases', error);
      throw error;
    }
  }

  /**
   * Validate download token and get download URL
   */
  static async validateDownloadToken(token: string, productId: string) {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is expired (30 days)
      const tokenAge = Date.now() - payload.timestamp;
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      if (tokenAge > thirtyDays) {
        throw new Error('Download token has expired');
      }

      // Verify the order exists and is completed
      const db = getFirestore();
      const orderDoc = await db.collection('standaloneOrders').doc(payload.orderId).get();
      const order = orderDoc.exists ? { id: orderDoc.id, ...orderDoc.data() } as any : null;
      if (!order || order.status !== 'completed') {
        throw new Error('Invalid download token');
      }

      // Find the download link
      const downloadLink = order.downloadLinks?.find(
        (link: any) => link.productId === productId && link.downloadUrl.includes(token)
      );

      if (!downloadLink) {
        throw new Error('Download link not found');
      }

      return {
        valid: true,
        downloadUrl: downloadLink.downloadUrl,
        productId: productId,
        orderId: payload.orderId,
      };
    } catch (error) {
      logger.error('Failed to validate download token', error);
      throw error;
    }
  }
}
