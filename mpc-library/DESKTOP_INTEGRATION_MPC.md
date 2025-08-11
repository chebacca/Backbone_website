# Desktop Application Integration (MPC)

Scope: Bridge between Dashboard v14 Licensing Website and Desktop Application — unified authentication and project management

## Overview

The Desktop Application Integration provides a seamless bridge between the licensing website and the main desktop application. This integration eliminates the complex and redundant authentication flows while providing a unified project creation and management experience.

## Architecture Changes (2025-01-20)

### ❌ **Removed: Complex Legacy System**
- **ApplicationStartupSequencer.ts** (1,517 lines) - Monolithic startup management
- **AppStartupWrapper.tsx** - Complex wrapper component
- **useStartupSequencer.ts** - Legacy hook for startup state
- **Complex authentication flows** - Multiple redundant auth paths
- **Fragmented project creation** - Separate desktop/web project flows

### ✅ **New: Simplified Startup System**
- **SimplifiedAppSequencer.ts** (400 lines) - Clean, focused startup logic
- **AppSequenceOrchestrator.tsx** - UI orchestrator for startup steps
- **WebsiteLoginBridge.tsx** - Integration with licensing website auth
- **UnifiedProjectCreationDialog.tsx** - Reused from licensing website
- **AppLaunchManager.tsx** - Manages transition from startup to main app

## Integration Components

### Core System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Application                      │
├─────────────────────────────────────────────────────────────┤
│  AppLaunchManager.tsx                                       │
│  ├── StartupSystemSelector.tsx (startup phase)             │
│  │   └── AppSequenceOrchestrator.tsx                       │
│  │       ├── WebsiteLoginBridge.tsx                        │
│  │       ├── ModeSelectionStep.tsx                         │
│  │       └── ProjectSelectionStep.tsx                      │
│  │           └── UnifiedProjectCreationDialog.tsx (reused) │
│  └── MainAppContent (post-startup)                         │
│      └── NewLayout + AppRoutes                             │
└─────────────────────────────────────────────────────────────┘
           │
           │ Authentication & Project Data
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Licensing Website                              │
│  ├── Authentication System (JWT + 2FA)                     │
│  ├── License Validation & Management                       │
│  ├── Cloud Projects Dashboard                              │
│  └── UnifiedProjectCreationDialog.tsx (source)            │
└─────────────────────────────────────────────────────────────┘
```

### Startup Flow Sequence

1. **🚀 Application Launch**
   - `AppLaunchManager` renders
   - Checks if app is already launched

2. **🔐 Authentication Step**
   - `WebsiteLoginBridge` handles login
   - Integrates with licensing website auth API
   - Validates JWT tokens and license status

3. **⚙️ Mode Selection Step**
   - `ModeSelectionStep` presents options:
     - **Standalone Mode**: Local projects only
     - **Shared Network Mode**: Cloud/network projects

4. **📁 Project Selection Step**
   - `ProjectSelectionStep` loads appropriate interface
   - **Standalone**: Local project browser
   - **Network**: Reuses `UnifiedProjectCreationDialog` from website
   - Full integration with Firestore/GCS project metadata

5. **🎯 Application Launch**
   - `AppLaunchManager` transitions to main app
   - `NewLayout` + `AppRoutes` render main application

## Key Integration Points

### Authentication Bridge

**File**: `WebsiteLoginBridge.tsx`
```typescript
interface WebsiteLoginBridgeProps {
    onSuccess: (user: any, token: string) => void;
    onError: (error: string) => void;
}
```

**Features**:
- Direct integration with licensing website API (`/api/auth/login`)
- JWT token management and storage
- License validation during login
- Error handling and user feedback

### Project Creation Integration

**File**: `ProjectSelectionStep.tsx` (reuses `UnifiedProjectCreationDialog.tsx`)

**Capabilities**:
- **Storage Options**: Local, Firestore, Google Cloud Storage
- **Project Types**: Creative, Technical, Hybrid
- **Mode Support**: Standalone and Network modes
- **Metadata Management**: Full cloud project metadata
- **Collaboration**: Team project creation and sharing

### State Management

**Simplified Hook**: `useCurrentMode.ts`
```typescript
export type ApplicationMode = 'standalone' | 'shared_network' | 'network';

export function useCurrentMode(): ApplicationMode;
export function useStartupSequencer(): {
    isStartupComplete: boolean;
    selectedMode: ApplicationMode;
    switchMode: (newMode: ApplicationMode) => void;
    onProjectSelected: (project: any) => void;
    resetToModeSelection: () => void;
};
```

## Configuration & Environment

### Desktop Application Setup

**Required Environment Variables**:
```bash
# Licensing Website Integration
LICENSING_API_BASE_URL=https://us-central1-backbone-logic.cloudfunctions.net/api
LICENSING_WEBSITE_URL=https://backbone-logic.web.app

# Authentication
JWT_SECRET=<shared_with_website>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### Storage Integration

**Local Storage Keys**:
- `auth_token` - JWT authentication token
- `selected_mode` - Current application mode
- `user_profile` - User profile data from website
- `license_status` - Current license validation status

**Session Storage Keys**:
- `startup_step` - Current startup step
- `project_selection_context` - Project selection state

## Security Considerations

### Authentication Security

1. **JWT Token Validation**
   - Tokens validated against licensing website
   - Automatic refresh handling
   - Secure token storage

2. **License Verification**
   - Real-time license status checking
   - Integration with Firestore licenses collection
   - Graceful handling of expired/invalid licenses

3. **Cross-Origin Security**
   - Proper CORS configuration
   - API endpoint validation
   - Secure credential transmission

### Data Protection

1. **Sensitive Data Handling**
   - No raw tokens in logs
   - Encrypted local storage where possible
   - Secure API communication (HTTPS only)

2. **Project Data Security**
   - Cloud projects: Full encryption in transit/rest
   - Local projects: Local encryption support
   - Hybrid projects: Secure metadata synchronization

## Development Workflow

### Local Development

```bash
# Start licensing website (for auth API)
cd dashboard-v14-licensing-website-2
pnpm dev

# Start desktop application
cd Dashboard-v14_2
pnpm web:dev
```

### Testing Integration

1. **Authentication Testing**
   - Test login flow with licensing website
   - Verify token synchronization
   - Test license validation

2. **Project Creation Testing**
   - Test local project creation
   - Test cloud project creation via dialog
   - Verify metadata synchronization

3. **Mode Switching Testing**
   - Test standalone to network mode switch
   - Verify state persistence
   - Test project loading in different modes

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check licensing website API availability
   - Verify JWT secret synchronization
   - Check network connectivity

2. **Project Creation Issues**
   - Verify Firestore permissions
   - Check GCS configuration
   - Validate project metadata schema

3. **Mode Switch Problems**
   - Check local storage state
   - Verify mode selection persistence
   - Restart application if state corrupted

### Debug Tools

1. **Startup State Debugging**
   ```typescript
   // Enable debug logging
   localStorage.setItem('debug_startup', 'true');
   ```

2. **Network Request Monitoring**
   - Monitor API calls to licensing website
   - Check authentication headers
   - Verify response handling

3. **State Inspection**
   - Use browser dev tools to inspect localStorage
   - Check Redux/context state in components
   - Monitor startup step progression

## Migration Notes

### From Legacy System

**Removed Components**:
- All legacy startup sequencer files (1,700+ lines)
- Complex authentication wrapper components
- Redundant project creation dialogs
- Fragmented mode management

**Migration Benefits**:
- 60% reduction in startup-related code
- Unified project creation experience
- Simplified authentication flow
- Better integration with licensing system
- Improved maintainability and testing

### Future Enhancements

1. **Enhanced Integration**
   - Real-time project synchronization
   - Advanced collaboration features
   - Enhanced cloud project management

2. **Performance Optimizations**
   - Faster startup times
   - Improved caching strategies
   - Background sync capabilities

3. **User Experience**
   - More intuitive mode selection
   - Better error handling and recovery
   - Enhanced project organization

## API Integration

### Licensing Website Endpoints Used

```typescript
// Authentication
POST /api/auth/login
POST /api/auth/refresh
GET /api/auth/me

// License Management
GET /api/licenses/my-licenses
POST /api/licenses/validate
GET /api/licenses/details/:id

// Project Management (Network Mode)
GET /api/projects/list
POST /api/projects/create
GET /api/projects/:id
PUT /api/projects/:id
```

### Request/Response Formats

**Authentication Response**:
```typescript
interface AuthResponse {
    user: {
        id: string;
        email: string;
        role: string;
        emailVerified: boolean;
    };
    token: string;
    refreshToken: string;
    expiresIn: number;
}
```

**License Validation Response**:
```typescript
interface LicenseValidation {
    isValid: boolean;
    license: {
        id: string;
        key: string;
        status: 'active' | 'expired' | 'suspended';
        expiresAt: string;
        deviceId?: string;
    };
    user: {
        subscription: {
            status: string;
            plan: string;
        };
    };
}
```

## Compliance & Audit

### Audit Logging

All authentication and project creation activities are logged for compliance:

1. **Authentication Events**
   - Login attempts and success/failure
   - Token refresh events
   - License validation results

2. **Project Operations**
   - Project creation and modification
   - Mode switches
   - File access and modifications

3. **Integration Events**
   - API calls to licensing website
   - Data synchronization events
   - Error conditions and recoveries

### Data Retention

- Authentication logs: 90 days
- Project operation logs: 1 year
- Error logs: 30 days
- Performance metrics: 6 months

---

**Last Updated**: 2025-01-20
**Version**: 1.0.0
**Status**: Production Ready
