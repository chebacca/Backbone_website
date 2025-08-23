# Firebase Auth Setup for Licensing Page

## Overview

The licensing page in the BackboneLogic dashboard requires Firebase Authentication to access Firestore data. This document explains the setup process and troubleshooting steps.

## Problem

Users were experiencing "Missing or insufficient permissions" errors when trying to access the licensing page in web-only mode. This happens because:

1. Users are authenticated with the backend API but not with Firebase Auth
2. Firestore security rules require `request.auth != null` for access
3. The licensing page tries to fetch data directly from Firestore

## Solution

We've implemented a dual authentication system:

1. **Backend API Authentication**: Handles user login, session management, and business logic
2. **Firebase Auth Authentication**: Required for Firestore access in web-only mode

### How It Works

1. When a user logs in, their credentials are temporarily stored in the auth context
2. The Firestore service automatically authenticates with Firebase Auth using these credentials
3. Once authenticated, the user can access Firestore data including licenses

## Setup Instructions

### 1. Create Firebase Auth Users

For existing team members who need access to the licensing page, create Firebase Auth users:

```bash
# Navigate to the scripts directory
cd scripts

# Create a Firebase Auth user
node create-firebase-auth-user.js user@example.com password123 "User Name"
```

**Note**: You'll need the Firebase Admin SDK service account key in `config/serviceAccountKey.json`

### 2. Verify Firestore Security Rules

Ensure your Firestore security rules allow authenticated users to access the licenses collection:

```javascript
// Licenses collection
match /licenses/{licenseId} {
  allow read, write: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
}
```

### 3. Test the Setup

1. Log in to the dashboard with a user who has a Firebase Auth account
2. Navigate to the Licenses page
3. Check the browser console for authentication messages
4. Verify that licenses are displayed correctly

## Troubleshooting

### Common Issues

#### 1. "User not found in Firebase Auth"

**Symptoms**: Console shows "User not found in Firebase Auth" error

**Solution**: Create a Firebase Auth user for the email address

```bash
node create-firebase-auth-user.js user@example.com password123
```

#### 2. "Wrong password for Firebase Auth"

**Symptoms**: Console shows "Wrong password for Firebase Auth" error

**Solution**: Update the Firebase Auth user's password

```bash
node create-firebase-auth-user.js user@example.com newpassword123
```

#### 3. "Too many authentication attempts"

**Symptoms**: Console shows "Too many authentication attempts" error

**Solution**: Wait a few minutes before trying again, or contact Firebase support

### Debug Information

The system provides detailed logging in the browser console:

- ✅ Success messages show when Firebase Auth authentication succeeds
- ⚠️ Warning messages indicate potential issues
- ❌ Error messages show what went wrong
- 💡 User guidance provides actionable solutions

### Console Log Examples

```
🔍 [LicensesPage] WebOnly mode - fetching licenses from Firestore
🔑 [FirestoreLicenseService] Authenticating with Firebase Auth...
✅ [FirestoreLicenseService] Successfully authenticated with Firebase Auth
✅ [FirestoreLicenseService] Found 5 licenses for user
```

## Security Considerations

1. **Temporary Credentials**: User passwords are temporarily stored in memory during the session
2. **Automatic Cleanup**: Credentials are cleared when users log out
3. **Firebase Auth**: Only authenticated users can access Firestore data
4. **Security Rules**: Firestore rules enforce additional access controls

## Future Improvements

1. **Automatic User Creation**: Automatically create Firebase Auth users when team members are added
2. **Password Sync**: Keep Firebase Auth passwords in sync with backend passwords
3. **Token Refresh**: Implement automatic token refresh for long sessions
4. **Error Recovery**: Add retry mechanisms for temporary authentication failures

## Support

If you encounter issues:

1. Check the browser console for error messages and guidance
2. Verify that Firebase Auth users exist for affected email addresses
3. Ensure Firestore security rules are properly configured
4. Contact the development team with specific error messages and user details

## Related Files

- `client/src/services/FirestoreLicenseService.ts` - Main service for license operations
- `client/src/context/AuthContext.tsx` - Authentication context with temporary credentials
- `scripts/create-firebase-auth-user.js` - Utility for creating Firebase Auth users
- `firestore.rules` - Firestore security rules
