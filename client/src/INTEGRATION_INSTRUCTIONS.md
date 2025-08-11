# Integration Instructions

## 🔗 Quick Integration Steps

### 1. Update App.tsx
Replace your current App.tsx with the pattern from App.example.tsx:
- Import StartupOrchestrator and SimplifiedStartupSequencer
- Handle project launch from dashboard
- Manage startup flow state

### 2. Update Dashboard Route
In your routing configuration, replace CloudProjectsPage with:
```typescript
import DashboardCloudProjectsBridge from './components/DashboardCloudProjectsBridge';

<Route path="projects" element={<DashboardCloudProjectsBridge />} />
```

### 3. Install Dependencies
Make sure you have these dependencies:
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install framer-motion
npm install @tanstack/react-query
```

### 4. Test Integration
1. Start your development server
2. Navigate to /dashboard/projects
3. Create a new project using the unified dialog
4. Launch the project to test the startup flow

## 🔧 Customization Options

### Authentication
The system automatically uses your existing auth token from localStorage.
No changes needed to your authentication system.

### API Integration
The CloudProjectIntegration service uses your existing /api/projects endpoints.
All Firebase and GCS integration works out of the box.

### Styling
All components use Material-UI and will inherit your existing theme.
Customize colors and styling through your MUI theme provider.

## 🐛 Troubleshooting

### Token Issues
- Ensure 'auth_token' is stored in localStorage
- Check that your API endpoints are accessible

### Import Errors
- Verify all dependencies are installed
- Check that file paths match your project structure

### API Errors
- Ensure Firebase Functions are deployed
- Check CORS configuration for API calls

For more details, see CLOUD_DASHBOARD_INTEGRATION_EXAMPLE.md
