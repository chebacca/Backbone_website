# Licensing Amount Fix Scripts

This directory contains scripts to fix the licensing amounts for Pro and Enterprise users in the Firestore database to meet the minimum requirements.

## Problem

The current seeded data has insufficient license amounts:
- **Pro users** are getting only 5 seats instead of the required **minimum 10 seats**
- **Enterprise users** are getting only 25 seats instead of the required **minimum 50 seats**

## Requirements

- Pro users should have **at least 10 licenses** (up to 50)
- Enterprise users should have **at least 50 licenses**

## Scripts

### 1. `fix-licensing-amounts.cjs` - Fix Core Users Only

This script fixes the licensing amounts for the main seeded users:
- `pro.user@example.com` (Pro tier)
- `enterprise.user@example.com` (Enterprise tier)

**Usage:**
```bash
cd "dashboard-v14-licensing-website 2"
node fix-licensing-amounts.cjs
```

**What it does:**
1. Finds Pro and Enterprise users
2. Updates their subscription seat counts to meet minimums
3. Generates additional licenses as needed
4. Verifies the results

### 2. `fix-all-licensing-amounts.cjs` - Fix ALL Users

This script fixes ALL existing users in the Firestore database to meet the minimum licensing requirements.

**Usage:**
```bash
cd "dashboard-v14-licensing-website 2"
node fix-all-licensing-amounts.cjs
```

**What it does:**
1. Finds ALL existing subscriptions
2. Updates seat counts to meet minimums for each tier
3. Generates additional licenses as needed
4. Provides comprehensive database summary
5. Verifies all minimums are met

## Files Updated

The following files have been updated to prevent this issue from happening again in future seeding:

### Main Seed Files
- `server/src/seeds/index.ts` - Updated Pro (10 seats) and Enterprise (50 seats)
- `server/scripts/clear-and-seed-users.ts` - Updated Pro (10 seats) and Enterprise (50 seats)
- `server/scripts/comprehensive-admin-dashboard-seed.ts` - Updated Pro (10 seats) and Enterprise (50 seats)

### Test Data Files
- `server/src/index.ts` - Updated test user seat counts
- `server/scripts/seed-prisma.ts` - Updated random seat generation logic

## Before Running

1. **Ensure you're logged in with Firebase CLI:**
   ```bash
   # Check if you're logged in
   firebase login:list
   
   # If not logged in, run:
   firebase login
   ```

2. **Verify you're in the correct directory:**
   ```bash
   pwd
   # Should be: /path/to/dashboard-v14-licensing-website 2
   ```

3. **Check current licensing status:**
   ```bash
   # You can check the current state in the Firebase console
   # Or run the script to see the current status
   ```

## Running the Scripts

### Option 1: Fix Core Users Only (Recommended for testing)
```bash
node fix-licensing-amounts.cjs
```

### Option 2: Fix ALL Users (Recommended for production)
```bash
node fix-all-licensing-amounts.cjs
```

## Expected Output

The scripts will show:
- Current subscription and license counts
- Updates being made
- Additional licenses being generated
- Final verification results
- Summary of changes

## Verification

After running the scripts, verify in the Firebase console:

1. **Subscriptions collection:**
   - Pro users should have `seats >= 10`
   - Enterprise users should have `seats >= 50`

2. **Licenses collection:**
   - Pro users should have `>= 10` licenses
   - Enterprise users should have `>= 50` licenses

3. **License details:**
   - Pro licenses: `maxActivations: 3`
   - Enterprise licenses: `maxActivations: 5`

## Troubleshooting

### Common Issues

1. **Service account key not found:**
   ```
   ❌ Error: Cannot find module './server/config/serviceAccountKey.json'
   ```
   **Solution:** Ensure the service account key exists in the correct location

2. **Firebase connection issues:**
   ```
   ❌ Error: Failed to get document
   ```
   **Solution:** Check Firebase project configuration and permissions

3. **Permission denied:**
   ```
   ❌ Error: Permission denied
   ```
   **Solution:** Ensure the service account has proper Firestore read/write permissions

### Debug Mode

To see more detailed output, you can modify the scripts to add more logging:

```javascript
// Add this line for more verbose logging
console.log('🔍 Debug: Processing subscription:', JSON.stringify(sub, null, 2));
```

## Rollback

If something goes wrong, you can:

1. **Check the Firebase console** to see what was changed
2. **Manually adjust** subscription seat counts
3. **Delete excess licenses** if too many were generated
4. **Restore from backup** if you have database backups

## Future Prevention

To prevent this issue in the future:

1. **Always use the updated seed files** when creating new environments
2. **Verify minimum seat requirements** in all seeding scripts
3. **Test with the minimum amounts** before deploying to production
4. **Document the minimum requirements** in team documentation

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify Firebase configuration and permissions
3. Check the service account key validity
4. Ensure you're running from the correct directory

## License

This script is part of the BackboneLogic Dashboard v14 project and follows the same licensing terms.
