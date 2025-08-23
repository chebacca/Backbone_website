# License Display Fix

## Problem

The UI was incorrectly showing all licenses as assigned to users (specifically to the Enterprise User) even though the database had been correctly updated to have only one license assigned to each of the Basic, Pro, and Enterprise users. Additionally, the analytics components were not accurately displaying license metrics.

## Root Cause

1. The issue was caused by licenses having a `userId` field but no `assignedToUserId` or `assignedToEmail` fields. The UI was incorrectly treating these licenses as "assigned" when they should have been considered "unassigned".

2. The analytics components were not properly calculating the number of assigned and available licenses, leading to inaccurate metrics.

## Solution

1. We created a script (`fix-license-display.cjs`) to remove the `userId` field from licenses that don't have `assignedToUserId` or `assignedToEmail` fields.

2. The script found and fixed 358 licenses, leaving only 3 licenses properly assigned (one for each user type - Basic, Pro, and Enterprise).

3. We updated the analytics components to accurately display:
   - Assigned Licenses: Number of licenses with an assignedTo property
   - Available Licenses: Number of active licenses without an assignedTo property
   - Utilization Rate: Percentage of assigned licenses out of total active licenses
   - Total Licenses: Total number of licenses in the system

## Verification

After running the fix script, we verified that:
- Total licenses: 361
- Assigned licenses: 3
- Unassigned licenses: 358
- Licenses with userId but no assignedToUserId: 0 (this was 358 before our fix)

## Usage

If the issue reoccurs, you can run the fix script again:

```bash
node fix-license-display.cjs
```

## UI Logic

The UI now correctly determines if a license is assigned by checking for the presence of `assignedToEmail` or `assignedToUserId` fields:

```typescript
// Only consider a license assigned if it has assignedToEmail or assignedToUserId
const isAssigned = Boolean(l.assignedToEmail || l.assignedToUserId);
```

This ensures that licenses are only shown as assigned when they are actually assigned to a user.

## Analytics Logic

The analytics components now accurately calculate metrics using the following logic:

```typescript
// Count licenses with proper metrics
const activeLicenses = licenses.filter(l => l.status === 'ACTIVE').length;
const assignedLicenses = licenses.filter(l => Boolean(l.assignedTo)).length;
const availableLicenses = licenses.filter(l => l.status === 'ACTIVE' && !l.assignedTo).length;
const totalLicenses = licenses.length;

// Calculate utilization rate based on assigned licenses vs total active licenses
const utilizationRate = activeTotal > 0 ? Math.round((assignedLicenses / activeTotal) * 100) : 0;
```

This provides a clear picture of license usage and availability in the dashboard.
