# Licensing Website Build & Deployment

This directory contains the **independent licensing website** for Dashboard v14. It is completely separate from the main Dashboard project and builds/deploys independently.

## 🚀 Quick Start

### Option 1: One-Command Build & Deploy
```bash
./build-and-deploy.sh
```

### Option 2: Separate Build & Deploy
```bash
# Build the licensing website
./build-licensing-website.sh

# Deploy to Firebase
./deploy-licensing-website.sh
```

### Option 3: Using pnpm scripts
```bash
# Build and deploy in one command
pnpm quick:build-deploy

# Or separately
pnpm quick:build
pnpm quick:deploy
```

## 📁 Project Structure

```
dashboard-v14-licensing-website/
├── client/                 # React frontend (Vite)
├── server/                 # Node.js backend (Firebase Functions)
├── shared/                 # Shared TypeScript types
├── deploy/                 # Build output (created by build)
├── firebase.json          # Firebase configuration
├── .firebaserc            # Firebase project settings
└── build-licensing-website.sh    # Build script
```

## 🔧 Build Process

The build process creates a `deploy/` directory containing:

- **React App**: Built from `client/` directory
- **Server**: Built from `server/` directory  
- **Shared Types**: Built from `shared/` directory

## 🚀 Deployment

The licensing website deploys to Firebase with:

- **Hosting**: Serves the React app from `deploy/` directory
- **Functions**: Backend API from `server/dist/`
- **Firestore**: Database rules and indexes
- **Storage**: File storage rules

## ⚠️ Important Notes

1. **This is NOT the main Dashboard project** - it's completely independent
2. **Builds to its own `deploy/` directory** - no shared build artifacts
3. **Uses its own Firebase project** - separate from main Dashboard
4. **No dependency on Dashboard-v14_2** - completely standalone

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
./build-licensing-website.sh --clean-deps
```

### Deployment Fails
```bash
# Check Firebase login
firebase login

# Check project selection
firebase use

# Deploy only hosting first
./deploy-licensing-website.sh --hosting-only
```

### Port Conflicts
The licensing website uses:
- **Frontend**: Port 3002
- **Backend**: Port 3003

Make sure these ports are available.

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- Firebase CLI
- Firebase project configured

## 🔗 Related Files

- `build-licensing-website.sh` - Main build script
- `deploy-licensing-website.sh` - Deployment script  
- `build-and-deploy.sh` - Combined build & deploy
- `firebase.json` - Firebase configuration
- `package.json` - Project dependencies and scripts
