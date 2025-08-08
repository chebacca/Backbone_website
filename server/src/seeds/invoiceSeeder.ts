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

class InvoiceSeeder {
  private static generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }

  private static getPricingByTier(tier: SubscriptionTier, seats: number): { unitPrice: number; description: string } {
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

  private static calculateTax(amount: number, taxRate: number = 0.08): number {
    return Math.round(amount * taxRate * 100) / 100;
  }

  private static generateBillingAddress(): any {
    const addresses = [
      {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Tech Solutions Inc.',
        addressLine1: '123 Main Street',
        addressLine2: 'Suite 100',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'Digital Innovations LLC',
        addressLine1: '456 Business Ave',
        addressLine2: 'Floor 3',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        company: 'Global Systems Corp',
        addressLine1: '789 Corporate Blvd',
        addressLine2: 'Building A',
        city: 'Austin',
        state: 'TX',
        postalCode: '73301',
        country: 'US',
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        company: 'Innovation Labs',
        addressLine1: '321 Tech Drive',
        addressLine2: 'Unit 200',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'US',
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        company: 'Future Solutions',
        addressLine1: '654 Innovation Way',
        addressLine2: 'Office 150',
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'US',
      },
    ];

    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  private static generatePaymentMethod(): string {
    const methods = ['credit_card', 'debit_card', 'bank_transfer', 'paypal'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  private static async createInvoiceData(subscription: any, user: any): Promise<InvoiceData> {
    const { unitPrice, description } = this.getPricingByTier(subscription.tier, subscription.seats);
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

    const issuedDate = new Date(subscription.createdAt);
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
      status: 'SUCCEEDED' as PaymentStatus,
      billingAddress: this.generateBillingAddress(),
      paymentMethod: this.generatePaymentMethod(),
      dueDate,
      issuedDate,
    };
  }

  private static async seedInvoicesForExistingSubscriptions(): Promise<void> {
    logger.info('Starting invoice seeding for existing subscriptions...');

    // Get all subscriptions with their users
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    logger.info(`Found ${subscriptions.length} subscriptions to process`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const subscription of subscriptions) {
      try {
        // Check if payment already exists for this subscription
        const existingPayment = subscription.payments[0];

        if (existingPayment) {
          // Update existing payment with invoice data
          const invoiceData = await this.createInvoiceData(subscription, subscription.user);
          
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              stripeInvoiceId: invoiceData.invoiceNumber,
              description: `Invoice ${invoiceData.invoiceNumber} - ${invoiceData.items[0].description}`,
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
            },
          });

          updatedCount++;
          logger.info(`Updated payment with invoice data for subscription ${subscription.id}`);
        } else {
          // Create new payment with invoice data
          const invoiceData = await this.createInvoiceData(subscription, subscription.user);
          
          await prisma.payment.create({
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
              amlScreeningStatus: 'PASSED',
              amlScreeningDate: new Date(),
              amlRiskScore: 0.1,
              pciCompliant: true,
              ipAddress: '192.168.1.1',
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              processingLocation: 'US',
            },
          });

          createdCount++;
          logger.info(`Created payment with invoice data for subscription ${subscription.id}`);
        }
      } catch (error) {
        logger.error(`Error processing subscription ${subscription.id}:`, error);
      }
    }

    logger.info(`Invoice seeding completed: ${createdCount} created, ${updatedCount} updated`);
  }

  private static async createSampleInvoices(): Promise<void> {
    logger.info('Creating sample invoices for demonstration...');

    // Create additional sample invoices for different scenarios
    const sampleInvoices = [
      {
        userId: (await prisma.user.findFirst({ where: { email: 'alice.client@example.com' } }))?.id,
        subscriptionId: (await prisma.subscription.findFirst({ 
          where: { 
            user: { email: 'alice.client@example.com' } 
          } 
        }))?.id,
        description: 'Monthly Basic Plan - January 2024',
        amount: 16.20, // $15 + tax
        items: [{
          description: 'Dashboard v14 Basic License',
          quantity: 1,
          unitPrice: 15,
          total: 15,
          taxRate: 0.08,
          taxAmount: 1.20,
        }],
      },
      {
        userId: (await prisma.user.findFirst({ where: { email: 'bob.client@example.com' } }))?.id,
        subscriptionId: (await prisma.subscription.findFirst({ 
          where: { 
            user: { email: 'bob.client@example.com' } 
          } 
        }))?.id,
        description: 'Monthly Pro Plan - January 2024',
        amount: 93.96, // $87 + tax (3 seats)
        items: [{
          description: 'Dashboard v14 Pro License',
          quantity: 3,
          unitPrice: 29,
          total: 87,
          taxRate: 0.08,
          taxAmount: 6.96,
        }],
      },
      {
        userId: (await prisma.user.findFirst({ where: { email: 'carol.client@example.com' } }))?.id,
        subscriptionId: (await prisma.subscription.findFirst({ 
          where: { 
            user: { email: 'carol.client@example.com' } 
          } 
        }))?.id,
        description: 'Monthly Enterprise Plan - January 2024',
        amount: 534.60, // $495 + tax (5 seats)
        items: [{
          description: 'Dashboard v14 Enterprise License',
          quantity: 5,
          unitPrice: 99,
          total: 495,
          taxRate: 0.08,
          taxAmount: 39.60,
        }],
      },
      {
        userId: (await prisma.user.findFirst({ where: { email: 'chrismole@gmail.com' } }))?.id,
        subscriptionId: (await prisma.subscription.findFirst({ 
          where: { 
            user: { email: 'chrismole@gmail.com' } 
          } 
        }))?.id,
        description: 'Monthly Pro Plan - January 2024 (2 Individual + 1 Bulk License)',
        amount: 93.96, // $87 + tax (3 seats)
        items: [{
          description: 'Dashboard v14 Pro License',
          quantity: 3,
          unitPrice: 29,
          total: 87,
          taxRate: 0.08,
          taxAmount: 6.96,
        }],
      },
    ];

    for (const invoice of sampleInvoices) {
      if (invoice.userId && invoice.subscriptionId) {
        const invoiceNumber = this.generateInvoiceNumber();
        const billingAddress = this.generateBillingAddress();

        await prisma.payment.create({
          data: {
            userId: invoice.userId,
            subscriptionId: invoice.subscriptionId,
            stripeInvoiceId: invoiceNumber,
            amount: invoice.amount,
            currency: 'usd',
            status: 'SUCCEEDED',
            description: invoice.description,
            receiptUrl: `https://dashboard-v14.com/receipts/${invoiceNumber}`,
            billingAddressSnapshot: billingAddress,
            taxAmount: invoice.items[0].taxAmount,
            taxRate: invoice.items[0].taxRate,
            taxJurisdiction: 'US',
            paymentMethod: this.generatePaymentMethod(),
            complianceData: {
              invoiceNumber,
              issuedDate: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              items: invoice.items,
              subtotal: invoice.items[0].total,
              taxTotal: invoice.items[0].taxAmount,
              total: invoice.amount,
              currency: 'usd',
            },
            amlScreeningStatus: 'PASSED',
            amlScreeningDate: new Date(),
            amlRiskScore: 0.1,
            pciCompliant: true,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            processingLocation: 'US',
          },
        });

        logger.info(`Created sample invoice: ${invoiceNumber}`);
      }
    }
  }

  public static async run(): Promise<void> {
    try {
      logger.info('Starting invoice seeding process...');

      // Seed invoices for existing subscriptions
      await this.seedInvoicesForExistingSubscriptions();

      // Create additional sample invoices
      await this.createSampleInvoices();

      logger.info('Invoice seeding completed successfully');
    } catch (error) {
      logger.error('Invoice seeding failed:', error);
      throw error;
    }
  }
}

// Run the seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  InvoiceSeeder.run()
    .catch((err) => {
      logger.error('Invoice seeder failed', err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { InvoiceSeeder };
