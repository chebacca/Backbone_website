# License Team Member Assignment Fix

This document explains the changes made to ensure that only one license can be assigned to one user at a time, and that licenses are properly tied to team members.

## Problem

The current system has the following issues:
1. Multiple licenses can be assigned to the same user
2. Users see all licenses, not just those assigned to users
3. There's no validation to prevent duplicate license assignments
4. Team members and licenses are not properly linked

## Solution

We've implemented several fixes to address these issues:

### 1. Fix Script

The `fix-license-team-member-assignment.cjs` script performs the following operations:
- Identifies users with multiple license assignments
- Keeps only the most recent license assignment for each user
- Unassigns duplicate licenses
- Ensures team members have proper license information
- Updates team member records with license type information

**Usage:**
```bash
cd "dashboard-v14-licensing-website 2"
node fix-license-team-member-assignment.cjs
```

### 2. UI Changes

The `LicensesPage.tsx` file has been updated to:
- Only show licenses that are assigned to users
- Prevent duplicate license assignments to the same user
- Validate license assignments before proceeding
- Provide better error messages for invalid assignments

### 3. Backend Service Changes

The `FirestoreLicenseService.ts` file has been updated with:
- A new `assignLicense` method that prevents duplicate assignments
- Validation to check if a user already has a license before assigning a new one
- Proper error handling and reporting

## How It Works

### License Assignment Logic

When assigning a license to a user:
1. The system checks if the user already has a license assigned
2. If yes, it prevents the assignment and shows an error message
3. If no, it proceeds with the assignment
4. The license is marked with the user's email and ID

### License Display Logic

When displaying licenses:
1. Only licenses with an `assignedTo` property are shown
2. This ensures that only licenses assigned to users are visible
3. The UI filters out unassigned licenses

### Team Member Linkage

The fix script ensures that:
1. Each team member has at most one license assigned
2. Team member records are updated with the correct license information
3. License assignments are consistent across the system

## Testing

To test the changes:
1. Run the fix script to clean up existing data
2. Try to assign a license to a user who already has one - it should fail
3. Verify that only assigned licenses appear in the UI
4. Check that team members have the correct license information

## Future Improvements

For future development:
1. Add a UI to unassign licenses from users
2. Implement license transfer between users
3. Add license usage tracking for team members
4. Improve error handling and validation
