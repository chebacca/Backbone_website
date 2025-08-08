# Port Configuration

## 🚀 Updated Port Configuration

To avoid conflicts with your existing Dashboard v14 application, the licensing website has been configured to use different ports:

### **Port Mapping**
- **Frontend (React)**: `http://localhost:3002` (was 3000)
- **Backend (API)**: `http://localhost:3003` (was 3001)
- **Database (PostgreSQL)**: `localhost:5432` (internal Docker)

### **Environment Variables**
Make sure to update your environment variables to use the new ports:

**Server (.env)**
```env
PORT=3003
CORS_ORIGIN=http://localhost:3002
FRONTEND_URL=http://localhost:3002
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:3003
```

### **Application URLs**
- **Landing Page**: http://localhost:3002
- **Login Page**: http://localhost:3002/login
- **User Dashboard**: http://localhost:3002/dashboard
- **Pricing Page**: http://localhost:3002/pricing
- **API Health Check**: http://localhost:3003/api/health

### **Development Commands**
```bash
# Start development servers
cd server && PORT=3003 pnpm run dev   # Backend on port 3003
cd client && pnpm run dev              # Frontend on port 3002

# Or use Docker (all services)
./scripts/deploy.sh
```

### **Docker Services**
The Docker Compose configuration maps:
- `web` service: `localhost:3002` → container port 80
- `api` service: `localhost:3003` → container port 3003
- `db` service: `localhost:5432` → container port 5432

### **Coexistence with Dashboard v14**
This configuration allows both applications to run simultaneously:
- **Dashboard v14**: ports 3000 (frontend) and 3001 (backend)
- **Licensing Website**: ports 3002 (frontend) and 3003 (backend)

No port conflicts will occur! 🎉
