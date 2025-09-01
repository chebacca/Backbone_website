# Licensing Structure Implementation

## Overview

This document describes the implementation of the licensing structure for Dashboard v14.2 based on the MPC library recommendations. The system now properly implements tier-based licensing with appropriate seat limits and subscription seeding.

## 🏗️ Architecture

### Tier Structure

The licensing system implements three distinct tiers with specific limits and features:

| Tier | Max Seats | Initial Seats | Use Case | Features |
|------|-----------|---------------|----------|----------|
| **BASIC** | 10 | 3 | Small teams, individual users | Core workflows, basic collaboration |
| **PRO** | 50 | 15 | Growing teams, organizations | Advanced features, analytics, integrations |
| **ENTERPRISE** | 250 | 50 | Large organizations | SSO, audit logs, custom integrations |

### License Allocation Strategy

- **Initial Seeding**: New accounts start with a subset of their tier's maximum capacity
- **Growth Path**: Accounts can expand within their tier limits as they grow
- **Automatic Assignment**: Licenses are automatically assigned when team members join projects
- **Validation**: System enforces tier limits at all levels

## 🔧 Implementation Components

### 1. LicenseService

**File**: `server/src/services/licenseService.ts`

Core service for license management with tier-based limits:

```typescript
// Get maximum license count for tier
static getLicenseCountForTier(tier: SubscriptionTier): number

// Get initial license count for new subscriptions
static getInitialLicenseCountForTier(tier: SubscriptionTier): number

// Generate licenses with tier validation
static async generateLicenses(...)
```

### 2. SubscriptionSeedingService

**File**: `server/src/services/subscriptionSeedingService.ts`

Handles subscription initialization and license seeding:

```typescript
// Seed new subscription with appropriate licenses
static async seedNewSubscription(userId, subscriptionId, tier, organizationId?)

// Expand subscription within tier limits
static async expandSubscriptionLicenses(userId, subscriptionId, tier, additionalSeats, organizationId?)

// Get subscription summary with usage information
static async getSubscriptionSummary(subscriptionId)
```

### 3. PaymentService Integration

**File**: `server/src/services/paymentService.ts`

Updated to use the new seeding service:

- Validates seat counts against tier limits
- Automatically seeds new subscriptions with appropriate licenses
- Enforces Enterprise minimum seat requirements (10 seats)

### 4. API Endpoints

**File**: `server/src/routes/subscriptions.ts`

New endpoints for subscription management:

- `GET /api/subscriptions/tiers` - View tier information and limits
- `GET /api/subscriptions/:id/summary` - Get subscription summary
- `POST /api/subscriptions/:id/expand` - Expand subscription within limits

## 🚀 Usage

### Seeding the Licensing Structure

Run the seeding script to create example users and subscriptions:

```bash
# Seed the licensing structure
pnpm run seed:licensing-structure seed

# Clean up seeded data (for testing)
pnpm run seed:licensing-structure cleanup
```

### Creating New Subscriptions

The system automatically handles license seeding when creating subscriptions:

```typescript
// Basic tier: Gets licenses up to requested seat count
const basicSubscription = await PaymentService.createSubscription(userId, {
  tier: 'BASIC',
  seats: 5, // Will get 5 licenses
  // ... other fields
});

// Pro/Enterprise: Gets initial seeded licenses automatically
const proSubscription = await PaymentService.createSubscription(userId, {
  tier: 'PRO',
  seats: 20, // Will get 15 initial licenses, can expand to 50
  // ... other fields
});
```

### Expanding Subscriptions

Expand subscriptions within tier limits:

```typescript
const expansionResult = await SubscriptionSeedingService.expandSubscriptionLicenses(
  userId,
  subscriptionId,
  'PRO',
  10, // Add 10 more seats
  organizationId
);
```

## 📊 Validation & Enforcement

### Tier Limits Enforcement

- **Subscription Creation**: Validates seat count against tier maximum
- **License Generation**: Prevents exceeding tier limits
- **Project Assignment**: Ensures available licenses before team member addition
- **API Endpoints**: Return appropriate errors when limits are exceeded

### Error Messages

```typescript
// Seat count exceeds tier limit
"Seat count 60 exceeds maximum allowed for PRO tier (50 seats)"

// Enterprise minimum requirement
"Enterprise tier requires minimum 10 seats"

// Cannot expand beyond tier limit
"Cannot expand to 60 seats: exceeds PRO tier limit of 50"
```

## 🔍 Monitoring & Analytics

### Audit Logging

All license operations are logged for compliance:

- `SUBSCRIPTION_SEEDING` - Initial license allocation
- `SUBSCRIPTION_EXPANSION` - License expansion operations
- `LICENSE_ACTIVATE` - License generation and activation

### Usage Tracking

Track license utilization:

```typescript
const summary = await SubscriptionSeedingService.getSubscriptionSummary(subscriptionId);
// Returns:
{
  licenses: {
    total: 15,
    active: 15,
    assigned: 8,
    available: 7
  },
  limits: {
    max: 50,
    initial: 15,
    canExpand: true,
    expansionAvailable: 35
  }
}
```

## 🧪 Testing

### Unit Tests

Test the licensing logic:

```typescript
describe('LicenseService', () => {
  it('should enforce tier limits', () => {
    expect(LicenseService.getLicenseCountForTier('BASIC')).toBe(10);
    expect(LicenseService.getLicenseCountForTier('PRO')).toBe(50);
    expect(LicenseService.getLicenseCountForTier('ENTERPRISE')).toBe(250);
  });
});
```

### Integration Tests

Test end-to-end subscription flows:

```typescript
describe('Subscription Seeding', () => {
  it('should seed PRO subscription with 15 initial licenses', async () => {
    const result = await SubscriptionSeedingService.seedNewSubscription(
      userId, subscriptionId, 'PRO'
    );
    expect(result.licenses).toHaveLength(15);
  });
});
```

## 🔄 Migration

### Existing Subscriptions

For existing subscriptions, the system will:

1. **Maintain Current State**: Existing licenses remain unchanged
2. **Apply New Limits**: Future operations respect new tier limits
3. **Gradual Migration**: Can be migrated to new structure over time

### Database Schema

No schema changes required - the new logic works with existing data structures.

## 📈 Future Enhancements

### Planned Features

- **License Pooling**: Advanced license management for Enterprise
- **Usage Analytics**: Detailed license utilization reporting
- **Auto-scaling**: Automatic license expansion based on usage patterns
- **Tier Upgrades**: Seamless tier migration with license preservation

### Configuration Options

- **Custom Tier Limits**: Override default limits for specific customers
- **Flexible Seating**: Dynamic seat allocation based on usage
- **Bulk Operations**: Batch license management for large organizations

## 🆘 Troubleshooting

### Common Issues

1. **"Seat count exceeds tier limit"**
   - Check current tier and requested seat count
   - Verify tier limits in `LicenseService.getLicenseCountForTier()`

2. **"No available licenses"**
   - Check license status and assignment
   - Verify subscription is active
   - Consider expanding subscription if within limits

3. **Seeding failures**
   - Check database connectivity
   - Verify user and subscription existence
   - Check audit logs for detailed error information

### Debug Commands

```bash
# Check tier information
curl /api/subscriptions/tiers

# View subscription summary
curl /api/subscriptions/{id}/summary

# Check logs for seeding operations
grep "SUBSCRIPTION_SEEDING" logs/
```

## 📚 References

- **MPC Library**: `shared-mpc-library/implementation/PLAN_TIER_GATING_MPC.md`
- **API Documentation**: `shared-mpc-library/API_INTEGRATION_COMPLETE_LOGIC_FLOW_MPC.md`
- **Database Schema**: `shared-mpc-library/database/COMPLETE_LOGIC_FLOW_DATABASE_SCHEMA_MPC.md`

---

*This implementation follows the MPC library recommendations and provides a robust foundation for tier-based licensing in Dashboard v14.2.*
