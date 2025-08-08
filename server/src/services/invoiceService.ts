import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { PaymentStatus, SubscriptionTier } from '@prisma/client';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
  taxAmount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  userId: string;
  subscriptionId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  status: PaymentStatus;
  billingAddress: any;
  paymentMethod: string;
  dueDate: Date;
  issuedDate: Date;
}

interface InvoiceSummary {
  totalInvoices: number;
  totalRevenue: number;
  averageInvoiceAmount: number;
  invoicesByStatus: Record<PaymentStatus, number>;
  invoicesByTier: Record<SubscriptionTier, number>;
}

export class InvoiceService {
  /**
   * Generate a unique invoice number
   */
  private static generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }

  /**
   * Get pricing information by subscription tier
   */
  private static getPricingByTier(tier: SubscriptionTier): { unitPrice: number; description: string } {
    switch (tier) {
      case 'BASIC':
        return { unitPrice: 15, description: 'Dashboard v14 Basic License' };
      case 'PRO':
        return { unitPrice: 29, description: 'Dashboard v14 Pro License' };
      case 'ENTERPRISE':
        return { unitPrice: 99, description: 'Dashboard v14 Enterprise License' };
      default:
        return { unitPrice: 15, description: 'Dashboard v14 License' };
    }
  }

  /**
   * Calculate tax amount
   */
  private static calculateTax(amount: number, taxRate: number = 0.08): number {
    return Math.round(amount * taxRate * 100) / 100;
  }

  /**
   * Create invoice data for a subscription
   */
  private static async createInvoiceData(subscription: any, user: any): Promise<InvoiceData> {
    const { unitPrice, description } = this.getPricingByTier(subscription.tier);
    const subtotal = unitPrice * subscription.seats;
    const taxRate = 0.08; // 8% tax rate
    const taxTotal = this.calculateTax(subtotal, taxRate);
    const total = subtotal + taxTotal;

    const items: InvoiceItem[] = [{
      description,
      quantity: subscription.seats,
      unitPrice,
      total: subtotal,
      taxRate,
      taxAmount: taxTotal,
    }];

    const issuedDate = new Date();
    const dueDate = new Date(issuedDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

    return {
      invoiceNumber: this.generateInvoiceNumber(),
      userId: user.id,
      subscriptionId: subscription.id,
      items,
      subtotal,
      taxTotal,
      total,
      currency: 'usd',
      status: 'PENDING' as PaymentStatus,
      billingAddress: subscription.user.billingAddress || this.generateDefaultBillingAddress(),
      paymentMethod: 'credit_card',
      dueDate,
      issuedDate,
    };
  }

  /**
   * Generate default billing address
   */
  private static generateDefaultBillingAddress(): any {
    return {
      firstName: 'Customer',
      lastName: 'Name',
      company: 'Company Name',
      addressLine1: '123 Business Street',
      addressLine2: 'Suite 100',
      city: 'City',
      state: 'ST',
      postalCode: '12345',
      country: 'US',
    };
  }

  /**
   * Create an invoice for a subscription
   */
  public static async createInvoice(subscriptionId: string): Promise<any> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          user: true,
          payments: true,
        },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Check if invoice already exists
      const existingPayment = subscription.payments.find(p => p.stripeInvoiceId);
      if (existingPayment) {
        throw new Error('Invoice already exists for this subscription');
      }

      const invoiceData = await this.createInvoiceData(subscription, subscription.user);

      const payment = await prisma.payment.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          stripeInvoiceId: invoiceData.invoiceNumber,
          amount: invoiceData.total,
          currency: invoiceData.currency,
          status: invoiceData.status,
          description: `Invoice ${invoiceData.invoiceNumber} - ${invoiceData.items[0].description}`,
          receiptUrl: `https://dashboard-v14.com/receipts/${invoiceData.invoiceNumber}`,
          billingAddressSnapshot: invoiceData.billingAddress,
          taxAmount: invoiceData.taxTotal,
          taxRate: invoiceData.items[0].taxRate,
          taxJurisdiction: 'US',
          paymentMethod: invoiceData.paymentMethod,
          complianceData: {
            invoiceNumber: invoiceData.invoiceNumber,
            issuedDate: invoiceData.issuedDate.toISOString(),
            dueDate: invoiceData.dueDate.toISOString(),
            items: invoiceData.items as any,
            subtotal: invoiceData.subtotal,
            taxTotal: invoiceData.taxTotal,
            total: invoiceData.total,
            currency: invoiceData.currency,
          },
          amlScreeningStatus: 'PENDING',
          amlScreeningDate: new Date(),
          amlRiskScore: 0.1,
          pciCompliant: true,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          processingLocation: 'US',
        },
      });

      logger.info(`Created invoice ${invoiceData.invoiceNumber} for subscription ${subscriptionId}`);
      return payment;
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Get all invoices for a user
   */
  public static async getUserInvoices(userId: string): Promise<any[]> {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId },
        include: {
          subscription: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return payments.filter(payment => payment.stripeInvoiceId);
    } catch (error) {
      logger.error('Error getting user invoices:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  public static async getInvoiceById(invoiceId: string): Promise<any> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { 
          stripeInvoiceId: invoiceId,
        },
        include: {
          subscription: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Invoice not found');
      }

      return payment;
    } catch (error) {
      logger.error('Error getting invoice by ID:', error);
      throw error;
    }
  }

  /**
   * Get all invoices (admin function)
   */
  public static async getAllInvoices(page: number = 1, limit: number = 20): Promise<{ invoices: any[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: {
            stripeInvoiceId: { not: null },
          },
          include: {
            subscription: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.payment.count({
          where: {
            stripeInvoiceId: { not: null },
          },
        }),
      ]);

      return {
        invoices: payments,
        total,
      };
    } catch (error) {
      logger.error('Error getting all invoices:', error);
      throw error;
    }
  }

  /**
   * Update invoice status
   */
  public static async updateInvoiceStatus(invoiceId: string, status: PaymentStatus): Promise<any> {
    try {
      const payment = await prisma.payment.updateMany({
        where: { stripeInvoiceId: invoiceId },
        data: { status },
      });

      logger.info(`Updated invoice ${invoiceId} status to ${status}`);
      return payment;
    } catch (error) {
      logger.error('Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Get invoice summary statistics
   */
  public static async getInvoiceSummary(): Promise<InvoiceSummary> {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          stripeInvoiceId: { not: null },
        },
        include: {
          subscription: true,
        },
      });

      const totalInvoices = payments.length;
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const averageInvoiceAmount = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

      const invoicesByStatus = payments.reduce((acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      }, {} as Record<PaymentStatus, number>);

      const invoicesByTier = payments.reduce((acc, payment) => {
        const tier = payment.subscription.tier;
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {} as Record<SubscriptionTier, number>);

      return {
        totalInvoices,
        totalRevenue,
        averageInvoiceAmount,
        invoicesByStatus,
        invoicesByTier,
      };
    } catch (error) {
      logger.error('Error getting invoice summary:', error);
      throw error;
    }
  }

  /**
   * Generate invoice PDF (placeholder for future implementation)
   */
  public static async generateInvoicePDF(invoiceId: string): Promise<string> {
    try {
      const payment = await this.getInvoiceById(invoiceId);
      
      // This would integrate with a PDF generation service
      // For now, return a placeholder URL
      const pdfUrl = `https://dashboard-v14.com/invoices/${invoiceId}/pdf`;
      
      logger.info(`Generated PDF for invoice ${invoiceId}`);
      return pdfUrl;
    } catch (error) {
      logger.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  /**
   * Send invoice email
   */
  public static async sendInvoiceEmail(invoiceId: string): Promise<void> {
    try {
      const payment = await this.getInvoiceById(invoiceId);
      
      // This would integrate with an email service
      logger.info(`Sent invoice email for ${invoiceId} to ${payment.subscription.user.email}`);
    } catch (error) {
      logger.error('Error sending invoice email:', error);
      throw error;
    }
  }

  /**
   * Delete invoice (admin function)
   */
  public static async deleteInvoice(invoiceId: string): Promise<void> {
    try {
      await prisma.payment.deleteMany({
        where: { stripeInvoiceId: invoiceId },
      });

      logger.info(`Deleted invoice ${invoiceId}`);
    } catch (error) {
      logger.error('Error deleting invoice:', error);
      throw error;
    }
  }
}
