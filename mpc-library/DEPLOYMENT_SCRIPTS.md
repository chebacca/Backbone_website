# Deployment Scripts for Dashboard v14 Licensing Website

This project includes several deployment scripts to help you build and deploy your application to Firebase.

## Available Scripts

### 1. `build-all.sh` - Build Only
**Purpose**: Builds all components without deploying
**Use case**: When you want to test builds locally or prepare for deployment

```bash
./build-all.sh
```

**What it does**:
- ✅ Checks project directory
- ✅ Installs dependencies if needed
- ✅ Builds shared types
- ✅ Builds client (React app)
- ✅ Builds server (Express functions)
- ✅ Shows build outputs and next steps

### 2. `deploy-simple.sh` - Quick Deploy
**Purpose**: Builds and deploys core services to Firebase
**Use case**: Standard deployment without Data Connect (recommended for most deployments)

```bash
./deploy-simple.sh
```

**What it does**:
- ✅ All build steps from `build-all.sh`
- ✅ Deploys hosting (frontend)
- ✅ Deploys functions (backend API)
- ✅ Deploys Firestore rules and indexes
- ✅ Deploys storage rules
- ⚠️ Skips Data Connect (avoids database schema issues)

### 3. `deploy-full.sh` - Full Deployment
**Purpose**: Complete deployment with all services including Data Connect
**Use case**: When you need the full stack including database management

```bash
./deploy-full.sh
```

**What it does**:
- ✅ All build steps
- ✅ Dependency installation
- ✅ Firebase project verification
- ✅ User confirmation before deployment
- ✅ All Firebase services including Data Connect
- ⚠️ May encounter database schema issues

## Quick Start

### For Most Deployments (Recommended)
```bash
./deploy-simple.sh
```

### For Development/Testing
```bash
./build-all.sh
```

### For Full Stack Deployment
```bash
./deploy-full.sh
```

## Prerequisites

Before running any script, ensure you have:

1. **Node.js 18+** installed
2. **pnpm 8+** installed
3. **Firebase CLI** installed and logged in
4. **Firebase project** selected

### Check Prerequisites
```bash
# Check Node version
node --version

# Check pnpm version
pnpm --version

# Check Firebase CLI
firebase --version

# Check Firebase login
firebase projects:list
```

## Troubleshooting

### Build Errors
- Ensure you're in the project root directory
- Check that all dependencies are installed
- Verify Node.js version compatibility

### Deployment Errors
- Ensure Firebase CLI is logged in
- Check that the correct project is selected
- Verify Firebase project permissions

### Data Connect Issues
If you encounter database schema issues:
```bash
# Set up Data Connect to manage your database
firebase dataconnect:sql:setup

# Or check what changes are needed
firebase dataconnect:sql:diff
```

## Manual Commands

If you prefer to run commands manually:

```bash
# Build all components
pnpm build

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
firebase deploy --only storage

# Deploy everything
firebase deploy
```

## Environment Variables

The scripts will use environment variables from your `.env` files. Ensure these are properly configured for production deployment.

## Support

If you encounter issues:
1. Check the Firebase Console for deployment status
2. Review Firebase CLI output for error messages
3. Check the project's `mpc-library/` documentation
4. Verify your Firebase project configuration
