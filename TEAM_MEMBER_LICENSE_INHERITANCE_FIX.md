# Team Member License Inheritance Fix

## Issue Description

Team members in enterprise organizations were displaying "professional" license types instead of inheriting the "enterprise" license from their organization. This caused inconsistency in the UI where the enterprise owner showed "enterprise" but team members showed "professional".

## Root Cause

The issue was in two key locations:

1. **Team Members API Route** (`/server/src/routes/team-members.ts` line 223):
   - Was defaulting to `'PROFESSIONAL'` without checking organization tier
   - Did not inherit license type from organization subscription

2. **Project Team Members Service** (`/server/src/services/firestoreService.ts` line 1648):
   - Was directly using `teamMember.licenseType` without inheritance logic
   - Did not check organization tier for license type determination

## Solution Implemented

### 1. Updated Team Members Route (`team-members.ts`)

Added logic to inherit license type from organization tier:

```typescript
// Get organization details to determine license inheritance
const organization = await firestoreService.getOrganizationById(orgId);
const orgTier = organization?.tier;

// Determine license type - inherit from organization tier if not explicitly set
let licenseType = member.licenseType;
if (!licenseType && orgTier) {
  switch (orgTier) {
    case 'ENTERPRISE':
      licenseType = 'ENTERPRISE';
      break;
    case 'PRO':
      licenseType = 'PROFESSIONAL';
      break;
    default:
      licenseType = 'BASIC';
  }
} else if (!licenseType) {
  licenseType = 'PROFESSIONAL'; // Final fallback
}
```

### 2. Updated Project Team Members Service (`firestoreService.ts`)

Added similar inheritance logic in the `getProjectTeamMembers` method:

```typescript
// Ensure license type inheritance from organization if not set
let licenseType = teamMember.licenseType;
if (!licenseType && teamMember.organizationId) {
  try {
    const org = await this.getOrganizationById(teamMember.organizationId);
    if (org?.tier) {
      switch (org.tier) {
        case 'ENTERPRISE':
          licenseType = 'ENTERPRISE';
          break;
        case 'PRO':
          licenseType = 'PROFESSIONAL';
          break;
        default:
          licenseType = 'BASIC';
      }
    }
  } catch (error) {
    console.warn(`Failed to get organization details: ${error}`);
  }
}

// Final fallback
if (!licenseType) {
  licenseType = 'PROFESSIONAL';
}
```

## Expected Behavior After Fix

1. **Enterprise Organizations**: All team members will display "ENTERPRISE" license type
2. **Professional Organizations**: All team members will display "PROFESSIONAL" license type  
3. **Basic Organizations**: All team members will display "BASIC" license type
4. **Fallback**: If organization tier cannot be determined, defaults to "PROFESSIONAL"

## Files Modified

- `dashboard-v14-licensing-website 2/server/src/routes/team-members.ts`
- `dashboard-v14-licensing-website 2/server/src/services/firestoreService.ts`

## Testing

A test script has been created at `test-team-member-license-fix.js` to verify the fix works correctly.

## Impact

- ✅ Team members in enterprise organizations now correctly show "ENTERPRISE" license type
- ✅ Consistent license display across all team members in the same organization
- ✅ Proper inheritance from organization subscription tier
- ✅ Backward compatible with existing explicit license type assignments
- ✅ No breaking changes to existing API contracts

## Deployment Notes

This fix requires redeploying the server-side code. No database migrations are needed as this is a display/logic fix that doesn't change the underlying data structure.
