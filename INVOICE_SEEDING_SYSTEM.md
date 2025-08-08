# Invoice Seeding System

## Overview

The Invoice Seeding System provides comprehensive invoice generation and management for the Dashboard v14 Licensing Website. It creates detailed invoices for existing license purchases with proper billing details, tax calculations, and compliance information.

## Features

### ✅ Core Functionality
- **Automatic Invoice Generation**: Creates invoices for all existing subscriptions
- **Tax Calculation**: Includes 8% tax rate with proper calculations
- **Billing Address Management**: Generates realistic billing addresses
- **Payment Method Tracking**: Records payment methods used
- **Compliance Data**: Stores comprehensive compliance information
- **Invoice Numbering**: Unique invoice numbers with timestamp-based generation

### ✅ Database Integration
- **Payment Model Enhancement**: Uses existing Payment model with invoice data
- **Subscription Linking**: Links invoices to specific subscriptions
- **User Association**: Associates invoices with user accounts
- **Audit Trail**: Maintains complete audit trail for compliance

### ✅ API Endpoints
- **User Invoice Management**: Get user's invoices, create new invoices
- **Admin Functions**: View all invoices, update status, delete invoices
- **PDF Generation**: Generate PDF versions of invoices
- **Email Integration**: Send invoice emails to customers
- **Statistics**: Get invoice summary and analytics

## File Structure

```
server/
├── src/
│   ├── seeds/
│   │   ├── invoiceSeeder.ts          # Main invoice seeder
│   │   └── index.ts                  # Updated main seeder
│   ├── services/
│   │   └── invoiceService.ts         # Invoice service layer
│   └── routes/
│       └── invoices.ts               # Invoice API routes
├── scripts/
│   └── seed-invoices.js              # Standalone invoice seeder script
└── prisma/
    └── schema.prisma                 # Database schema (Payment model)
```

## Usage

### 1. Run Invoice Seeder

```bash
# Run the standalone invoice seeder
cd server
node scripts/seed-invoices.js

# Or run the main seeder (includes invoice seeding)
npm run seed
```

### 2. API Endpoints

#### User Endpoints
```bash
# Get user's invoices
GET /api/invoices

# Get specific invoice
GET /api/invoices/:id

# Create new invoice
POST /api/invoices
{
  "subscriptionId": "subscription-uuid"
}

# Generate PDF
GET /api/invoices/:id/pdf

# Send invoice email
POST /api/invoices/:id/send
```

#### Admin Endpoints
```bash
# Get all invoices (paginated)
GET /api/invoices/admin/all?page=1&limit=20

# Get invoice summary statistics
GET /api/invoices/admin/summary

# Update invoice status
PUT /api/invoices/:id/status
{
  "status": "SUCCEEDED"
}

# Delete invoice
DELETE /api/invoices/admin/:id
```

## Invoice Data Structure

### Payment Model Fields Used
```typescript
{
  id: string;
  userId: string;
  subscriptionId: string;
  stripeInvoiceId: string;        // Invoice number
  amount: number;                 // Total amount including tax
  currency: string;               // USD
  status: PaymentStatus;          // PENDING, SUCCEEDED, etc.
  description: string;            // Invoice description
  receiptUrl: string;            // Receipt URL
  billingAddressSnapshot: Json;   // Billing address data
  taxAmount: number;             // Tax amount
  taxRate: number;               // Tax rate (0.08)
  taxJurisdiction: string;       // US
  paymentMethod: string;         // credit_card, debit_card, etc.
  complianceData: Json;          // Complete invoice data
  amlScreeningStatus: AMLStatus; // PENDING, PASSED, etc.
  pciCompliant: boolean;         // PCI compliance flag
  ipAddress: string;             // Processing IP
  userAgent: string;             // User agent
  processingLocation: string;     // US
}
```

### Compliance Data Structure
```typescript
{
  invoiceNumber: string;
  issuedDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
}
```

### Invoice Item Structure
```typescript
{
  description: string;    // "Dashboard v14 Pro License"
  quantity: number;       // Number of seats
  unitPrice: number;      // Price per seat
  total: number;          // Subtotal
  taxRate: number;        // 0.08 (8%)
  taxAmount: number;      // Tax amount
}
```

## Pricing Tiers

| Tier | Unit Price | Description |
|------|------------|-------------|
| BASIC | $15 | Dashboard v14 Basic License |
| PRO | $29 | Dashboard v14 Pro License |
| ENTERPRISE | $99 | Dashboard v14 Enterprise License |

## Tax Calculation

- **Tax Rate**: 8% (0.08)
- **Calculation**: `taxAmount = subtotal * taxRate`
- **Total**: `total = subtotal + taxAmount`
- **Jurisdiction**: US

## Sample Invoice Data

### Basic Plan (1 seat)
```json
{
  "invoiceNumber": "INV-1703123456789-123",
  "subtotal": 15.00,
  "taxAmount": 1.20,
  "total": 16.20,
  "items": [
    {
      "description": "Dashboard v14 Basic License",
      "quantity": 1,
      "unitPrice": 15,
      "total": 15,
      "taxRate": 0.08,
      "taxAmount": 1.20
    }
  ]
}
```

### Pro Plan (3 seats)
```json
{
  "invoiceNumber": "INV-1703123456789-456",
  "subtotal": 87.00,
  "taxAmount": 6.96,
  "total": 93.96,
  "items": [
    {
      "description": "Dashboard v14 Pro License",
      "quantity": 3,
      "unitPrice": 29,
      "total": 87,
      "taxRate": 0.08,
      "taxAmount": 6.96
    }
  ]
}
```

### Enterprise Plan (5 seats)
```json
{
  "invoiceNumber": "INV-1703123456789-789",
  "subtotal": 495.00,
  "taxAmount": 39.60,
  "total": 534.60,
  "items": [
    {
      "description": "Dashboard v14 Enterprise License",
      "quantity": 5,
      "unitPrice": 99,
      "total": 495,
      "taxRate": 0.08,
      "taxAmount": 39.60
    }
  ]
}
```

## Billing Addresses

The system generates realistic billing addresses for demonstration:

```typescript
{
  firstName: 'John',
  lastName: 'Doe',
  company: 'Tech Solutions Inc.',
  addressLine1: '123 Main Street',
  addressLine2: 'Suite 100',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'US'
}
```

## Payment Methods

Supported payment methods:
- `credit_card`
- `debit_card`
- `bank_transfer`
- `paypal`

## Compliance Features

### AML Screening
- **Status**: PENDING, PASSED, FAILED, REQUIRES_REVIEW
- **Risk Score**: 0.1 (low risk for seeded data)
- **Screening Date**: Current timestamp

### PCI Compliance
- **Status**: true (PCI compliant)
- **Tokenization**: Secure payment tokenization

### Audit Trail
- **IP Address**: 192.168.1.1
- **User Agent**: Standard browser user agent
- **Processing Location**: US
- **Timestamp**: Creation timestamp

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const invoice = await InvoiceService.createInvoice(subscriptionId);
  // Success
} catch (error) {
  // Handle specific errors
  if (error.message === 'Subscription not found') {
    // Handle missing subscription
  } else if (error.message === 'Invoice already exists') {
    // Handle duplicate invoice
  }
}
```

## Testing

### Manual Testing
```bash
# Test invoice creation
curl -X POST http://localhost:3001/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subscriptionId": "subscription-uuid"}'

# Test getting user invoices
curl -X GET http://localhost:3001/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Verification
```sql
-- Check seeded invoices
SELECT 
  p.stripeInvoiceId,
  p.amount,
  p.status,
  s.tier,
  s.seats,
  u.email
FROM payments p
JOIN subscriptions s ON p.subscriptionId = s.id
JOIN users u ON p.userId = u.id
WHERE p.stripeInvoiceId IS NOT NULL
ORDER BY p.createdAt DESC;
```

## Future Enhancements

### Planned Features
- [ ] PDF Generation Integration (wkhtmltopdf, Puppeteer)
- [ ] Email Service Integration (SendGrid, AWS SES)
- [ ] Stripe Invoice Sync
- [ ] Multi-currency Support
- [ ] Advanced Tax Calculations
- [ ] Invoice Templates
- [ ] Bulk Invoice Operations
- [ ] Invoice Analytics Dashboard

### Integration Points
- **PDF Generation**: Integrate with PDF generation service
- **Email Service**: Connect with email service for invoice delivery
- **Stripe Webhooks**: Sync with Stripe invoice events
- **Accounting Software**: Export to QuickBooks, Xero, etc.

## Security Considerations

### Data Protection
- **PCI Compliance**: All payment data is PCI compliant
- **Encryption**: Sensitive data is encrypted at rest
- **Access Control**: Invoice access is restricted to owners and admins
- **Audit Logging**: All invoice operations are logged

### Compliance
- **Tax Compliance**: Proper tax calculation and reporting
- **AML Compliance**: Anti-money laundering screening
- **GDPR Compliance**: Data processing records maintained
- **Audit Trail**: Complete audit trail for regulatory compliance

## Troubleshooting

### Common Issues

1. **Invoice Already Exists**
   ```
   Error: Invoice already exists for this subscription
   ```
   - Check if payment already exists for subscription
   - Use update instead of create

2. **Subscription Not Found**
   ```
   Error: Subscription not found
   ```
   - Verify subscription ID exists
   - Check database connection

3. **Permission Denied**
   ```
   Error: Admin access required
   ```
   - Ensure user has ADMIN role
   - Check authentication token

### Debug Commands
```bash
# Check database connection
npm run db:status

# Reset database and reseed
npm run db:reset
npm run seed

# View logs
npm run dev
```

## Support

For issues or questions about the invoice seeding system:

1. Check the logs for detailed error messages
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Review the API documentation
5. Check the troubleshooting section above

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Compatibility**: Dashboard v14 Licensing Website
