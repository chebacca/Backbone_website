/**
 * Dashboard v14 Licensing Website - Main Application
 * 
 * This application integrates the Simplified Startup System with the existing
 * licensing website dashboard. The startup system provides:
 * 
 * - Mode Selection (Standalone vs Network)
 * - Project Creation and Management
 * - Cloud Integration (Firebase/GCS)
 * - Seamless Dashboard Integration
 * 
 * Startup Routes:
 * - /startup - Public startup workflow
 * - /dashboard/startup - Dashboard-integrated startup workflow
 * 
 * The startup system automatically navigates users to the appropriate
 * dashboard sections after completion.
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { createAppTheme } from './theme/theme';
import { ThemeProvider as CustomThemeProvider, useTheme as useCustomTheme } from '@/context/ThemeContext';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const MarketplacePage = React.lazy(() => import('@/pages/MarketplacePage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const BridgeAuthPage = React.lazy(() => import('@/pages/auth/BridgeAuthPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const EmailVerificationPage = React.lazy(() => import('@/pages/auth/EmailVerificationPage'));
const PricingPage = React.lazy(() => import('@/pages/PricingPage'));
const TermsPage = React.lazy(() => import('@/pages/legal/TermsPage'));
const PrivacyPolicyPage = React.lazy(() => import('@/pages/legal/PrivacyPolicyPage'));
const SlaPage = React.lazy(() => import('@/pages/legal/SlaPage'));
const CookiePolicyPage = React.lazy(() => import('@/pages/legal/CookiePolicyPage'));
const CheckoutPage = React.lazy(() => import('@/pages/checkout/CheckoutPage'));
const StandaloneCheckoutPage = React.lazy(() => import('@/pages/checkout/StandaloneCheckoutPage'));
const DownloadPage = React.lazy(() => import('@/pages/DownloadPage'));
const DashboardLayout = React.lazy(() => import('@/components/layout/DashboardLayout'));
const DashboardOverview = React.lazy(() => import('@/pages/dashboard/DashboardOverview'));
const DashboardCloudProjectsBridge = React.lazy(() => import('@/components/DashboardCloudProjectsBridge'));
const LicensesPage = React.lazy(() => import('@/pages/dashboard/LicensesPage'));
const SecurityDashboardPage = React.lazy(() => import('@/pages/security-dashboard'));

const AnalyticsPage = React.lazy(() => import('@/pages/dashboard/AnalyticsPage'));
const BillingPage = React.lazy(() => import('@/pages/dashboard/BillingPage'));
const StreamlinedBillingPage = React.lazy(() => import('@/pages/dashboard/StreamlinedBillingPage'));
const SettingsPage = React.lazy(() => import('@/pages/dashboard/SettingsPage'));
const TeamPage = React.lazy(() => import('@/pages/dashboard/EnhancedTeamPage'));
const TestStreamlinedHooks = React.lazy(() => import('@/components/TestStreamlinedHooks'));
const DownloadsPage = React.lazy(() => import('@/pages/dashboard/DownloadsPage'));
const DocumentationPage = React.lazy(() => import('@/pages/dashboard/DocumentationPage'));
const SupportPage = React.lazy(() => import('@/pages/dashboard/SupportPage'));
const InviteAcceptPage = React.lazy(() => import('@/pages/dashboard/InviteAcceptPage'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AccountingDashboard = React.lazy(() => import('@/pages/admin/AccountingDashboard'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Startup workflow components
const StartupWorkflow = React.lazy(() => import('@/components/StartupWorkflow'));

// Test page for offline functionality
const OfflineTestPage = React.lazy(() => import('@/pages/test/OfflineTestPage'));

// Test page for invite dialog
const TestInviteDialog = React.lazy(() => import('@/pages/TestInviteDialog'));
const TestTeamMemberCreation = React.lazy(() => import('@/pages/TestTeamMemberCreation'));
const TestTeamMemberCreationSimple = React.lazy(() => import('@/pages/TestTeamMemberCreationSimple'));

// Auth bridge for webonly mode - removed to fix context issues
// import CloudProjectAuthBridge from '@/components/CloudProjectAuthBridge';

// Protected route wrapper
import ProtectedRoute from '@/components/ProtectedRoute';

// Utility to clear auth warnings
import '@/utils/clearAuthWarnings';

// Public route wrapper (allows authenticated users to access marketplace and landing page)
interface PublicRouteProps {
  children: React.ReactNode;
  allowAuthenticated?: boolean; // New prop to allow authenticated users
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, allowAuthenticated = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && !allowAuthenticated) {
    // Redirect based on user role and plan
    const roleUpper = String(user?.role || '').toUpperCase();
    if (roleUpper === 'SUPERADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Component that uses the theme context
const AppContent: React.FC = () => {
  const { mode } = useCustomTheme();
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary', }} >
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes - Allow authenticated users to access marketplace and landing page */}
              <Route path="/" element={
                <PublicRoute allowAuthenticated={true}>
                  <LandingPage />
                </PublicRoute>
              } />
              <Route path="/marketplace" element={
                <PublicRoute allowAuthenticated={true}>
                  <MarketplacePage />
                </PublicRoute>
              } />
              <Route path="/pricing" element={<PricingPage />} />
              
              {/* Startup Workflow Route */}
              <Route path="/startup" element={<StartupWorkflow />} />
              
              {/* Test Route for Offline Functionality */}
              <Route path="/test/offline" element={<OfflineTestPage />} />
              
              {/* Test Route for Invite Dialog */}
        <Route path="/test/invite-dialog" element={<TestInviteDialog />} />
        <Route path="/test/team-member-creation" element={<TestTeamMemberCreation />} />
        <Route path="/test/team-member-simple" element={<TestTeamMemberCreationSimple />} />
              
              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/auth/bridge" 
                element={<BridgeAuthPage />} 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/reset-password/:token" 
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                } 
              />
              
              {/* Email Verification (accessible when logged in but not verified) */}
              <Route 
                path="/verify-email" 
                element={<EmailVerificationPage />} 
              />
              <Route 
                path="/verify-email/:token" 
                element={<EmailVerificationPage />} 
              />

              {/* Checkout Routes (require auth but not email verification) */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout/standalone" 
                element={
                  <ProtectedRoute>
                    <StandaloneCheckoutPage />
                  </ProtectedRoute>
                } 
              />

              {/* Invitation acceptance (requires auth to bind user) */}
              <Route
                path="/invite/accept"
                element={
                  <ProtectedRoute>
                    <InviteAcceptPage />
                  </ProtectedRoute>
                }
              />

              {/* Documentation and Support Routes (public access) */}
              <Route 
                path="/documentation" 
                element={<DocumentationPage />}
              />
              <Route 
                path="/support" 
                element={<SupportPage />}
              />
              <Route 
                path="/download/standalone/:productId" 
                element={<DownloadPage />}
              />
              {/* Legal Routes */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/sla" element={<SlaPage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />

              {/* Dashboard Routes (protected) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route
                  path="billing"
                  element={<StreamlinedBillingPage />}
                />
                <Route path="team" element={<TeamPage />} />
                <Route path="downloads" element={<DownloadsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="licenses" element={<LicensesPage />} />
                <Route path="cloud-projects" element={<DashboardCloudProjectsBridge />} />
                <Route path="documentation" element={<DocumentationPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="startup" element={<StartupWorkflow />} />
                <Route path="test-streamlined" element={<TestStreamlinedHooks />} />
              <Route path="organization" element={<div>Organization (Coming Soon)</div>} />
              <Route path="security" element={<SecurityDashboardPage />} />
              <Route path="compliance" element={<div>Compliance (Coming Soon)</div>} />
            </Route>

              {/* Keep public support route for non-dashboard access */}

              {/* Admin Routes (protected, use DashboardLayout for consistent shell) */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
              </Route>

              {/* Accounting Routes (protected, use DashboardLayout for consistent shell) */}
              <Route 
                path="/accounting" 
                element={
                  <ProtectedRoute requireAccounting>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AccountingDashboard />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}

export default App;
