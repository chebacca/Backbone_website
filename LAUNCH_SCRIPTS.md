# Dashboard v14 Licensing Website - Launch Scripts

This directory contains several scripts to help you launch and manage the Dashboard v14 Licensing Website.

## Available Scripts

### 1. `quick-start.sh` - Simple Launch Script
**Recommended for most users**

This is the simplest way to start both the backend and frontend servers.

```bash
./quick-start.sh
```

**What it does:**
- Checks if pnpm is installed
- Installs dependencies if needed
- Sets up the database (Prisma generate and push)
- Starts both backend and frontend servers using the existing `pnpm dev` command
- Shows the URLs where the servers are accessible

**Access URLs:**
- Frontend: http://localhost:3002
- Backend API: http://localhost:3003
- Health Check: http://localhost:3003/health

### 2. `launch.sh` - Comprehensive Launch Script
**Advanced users who want more control**

This script provides more detailed error handling, dependency checking, and process management.

```bash
./launch.sh
```

**Features:**
- Comprehensive dependency checking (Node.js version, pnpm installation)
- Automatic environment setup (.env file creation)
- Port conflict detection and resolution
- Health monitoring and status reporting
- Graceful shutdown handling
- Colored output for better readability
- Background process management

### 3. `status.sh` - Status Check Script
**Check if servers are running**

Quickly check the status of both servers.

```bash
./status.sh
```

**Output:**
- Shows if backend and frontend are running
- Displays health check status
- Lists access URLs

### 4. `kill-ports.sh` - Port Cleanup Script
**Kill processes on ports 3002 and 3003**

Useful for cleaning up stuck processes or resolving port conflicts.

```bash
./kill-ports.sh
```

**What it does:**
- Shows current status of ports 3002 and 3003
- Kills any processes using these ports
- Displays process information before killing
- Shows final status after cleanup
- Provides detailed feedback with colored output

## Manual Launch (Alternative)

If the scripts don't work, you can launch the servers manually:

### Backend Server
```bash
cd server
npx tsx src/index.ts
```

### Frontend Server
```bash
cd client
npx vite --port 3002 --host
```

## Prerequisites

1. **Node.js** (version 18 or higher)
   ```bash
   node --version
   ```

2. **pnpm** package manager
   ```bash
   npm install -g pnpm
   ```

3. **PostgreSQL** database running on port 5434
   - Database name: `licensing_db`
   - The script will automatically set up the database schema

## Environment Configuration

The backend requires a `.env` file in the `server/` directory. If it doesn't exist, the scripts will try to create one from `server/env.example`.

Key environment variables:
- Firebase Admin credentials are required in environment:
  - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `JWT_SECRET`: Secret for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe API key (for payments)
- `SENDGRID_API_KEY`: SendGrid API key (for emails)

## Troubleshooting

### Port Conflicts
If ports 3002 or 3003 are already in use, the scripts will automatically kill existing processes.

**Manual port cleanup:**
```bash
./kill-ports.sh
```

### Database Issues
If you encounter database connection issues:
```bash
cd server
pnpm db:reset
```

### Dependency Issues
If dependencies aren't found:
```bash
pnpm install
cd server && pnpm install
cd client && pnpm install
```

### Manual Server Start
If the scripts fail, start servers manually:
```bash
# Terminal 1 - Backend
cd server && npx tsx src/index.ts

# Terminal 2 - Frontend  
cd client && npx vite --port 3002 --host
```

## Stopping the Servers

- **With scripts**: Press `Ctrl+C` in the terminal running the script
- **Manual processes**: Use `pkill` or find and kill the processes:
  ```bash
  pkill -f "tsx src/index.ts"
  pkill -f "vite"
  ```

## Development vs Production

- **Development**: Use the scripts as described above
- **Production**: Use the build and start commands:
  ```bash
  pnpm build
  pnpm start
  ```

## File Structure

```
dashboard-v14-licensing-website/
├── launch.sh          # Comprehensive launch script
├── quick-start.sh     # Simple launch script
├── status.sh          # Status check script
├── kill-ports.sh      # Port cleanup script
├── client/            # Frontend (React + Vite)
├── server/            # Backend (Node.js + Express)
└── shared/            # Shared types and utilities
```

## Support

If you encounter issues:
1. Check the prerequisites are met
2. Ensure PostgreSQL is running
3. Verify all dependencies are installed
4. Check the server logs for error messages
5. Use the status script to verify server health
