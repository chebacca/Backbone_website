import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const EmailVerificationPage = React.lazy(() => import('@/pages/auth/EmailVerificationPage'));
const PricingPage = React.lazy(() => import('@/pages/PricingPage'));
const CheckoutPage = React.lazy(() => import('@/pages/checkout/CheckoutPage'));
const DashboardLayout = React.lazy(() => import('@/components/layout/DashboardLayout'));
const DashboardOverview = React.lazy(() => import('@/pages/dashboard/DashboardOverview'));
const LicensesPage = React.lazy(() => import('@/pages/dashboard/LicensesPage'));
const AnalyticsPage = React.lazy(() => import('@/pages/dashboard/AnalyticsPage'));
const BillingPage = React.lazy(() => import('@/pages/dashboard/BillingPage'));
const SettingsPage = React.lazy(() => import('@/pages/dashboard/SettingsPage'));
const TeamPage = React.lazy(() => import('@/pages/dashboard/TeamPage'));
const DownloadsPage = React.lazy(() => import('@/pages/dashboard/DownloadsPage'));
const DocumentationPage = React.lazy(() => import('@/pages/dashboard/DocumentationPage'));
const SupportPage = React.lazy(() => import('@/pages/dashboard/SupportPage'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Protected route wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  // requireEmailVerification is reserved for future use
  requireEmailVerification = false,
  requireAdmin = false 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Email verification check - for now, we'll skip this check since the User type doesn't include emailVerified
  // if (requireEmailVerification && !user?.emailVerified) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  if (requireAdmin) {
    const roleUpper = String(user?.role || '').toUpperCase();
    const isSuperAdmin = roleUpper === 'SUPERADMIN';
    if (!isSuperAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Public route wrapper (redirects authenticated users)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Redirect based on user role
    const roleUpper = String(user?.role || '').toUpperCase();
    if (roleUpper === 'SUPERADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  const { user } = useAuth();
  return (
    <ErrorBoundary>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            
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

            {/* Documentation and Support Routes (public access) */}
            <Route 
              path="/documentation" 
              element={<DocumentationPage />}
            />
            <Route 
              path="/support" 
              element={<SupportPage />}
            />

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
                element={<BillingPage />}
              />
              <Route path="team" element={<TeamPage />} />
              <Route path="downloads" element={<DownloadsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="licenses" element={<LicensesPage />} />
              <Route path="documentation" element={<DocumentationPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="organization" element={<div>Organization (Coming Soon)</div>} />
              <Route path="security" element={<div>Security Center (Coming Soon)</div>} />
              <Route path="compliance" element={<div>Compliance (Coming Soon)</div>} />
            </Route>

            {/* Keep public support route for non-dashboard access */}

            {/* Admin Routes (protected) */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
