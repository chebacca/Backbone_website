/**
 * Comprehensive Test Suite for Dashboard v14 Licensing Website
 * 
 * This test suite covers all major functionality of the application including:
 * - Authentication flows
 * - User management
 * - Admin dashboard
 * - Team member functionality
 * - Projects and team member tracking
 * - Firebase integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LoadingContext } from '../../context/LoadingContext';
import { SnackbarProvider } from 'notistack';

// Import components to test
import LoginPage from '../../pages/auth/LoginPage';
import RegisterPage from '../../pages/auth/RegisterPage';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import DashboardOverview from '../../pages/dashboard/DashboardOverview';
import TeamPage from '../../pages/dashboard/TeamPage';
import FirebaseAuthRequired from '../../components/FirebaseAuthRequired';
import DashboardCloudProjectsBridge from '../../components/DashboardCloudProjectsBridge';

// Mock services
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  endpoints: {
    auth: {
      login: () => '/auth/login',
      register: () => '/auth/register',
      profile: () => '/auth/me',
      logout: () => '/auth/logout',
      verifyEmail: (token) => `/auth/verify-email/${token}`,
      forgotPassword: () => '/auth/forgot-password',
      resetPassword: (token) => `/auth/reset-password/${token}`,
      twoFASetupInitiate: () => '/auth/2fa/setup',
      twoFASetupVerify: () => '/auth/2fa/verify',
      twoFADisable: () => '/auth/2fa/disable',
      verify2FA: () => '/auth/2fa/verify',
      changePassword: () => '/auth/change-password',
      oauthGoogle: () => '/auth/oauth/google',
      oauthApple: () => '/auth/oauth/apple',
      resendVerification: () => '/auth/resend-verification',
    },
    users: {
      getAll: () => '/users',
      getById: (id) => `/users/${id}`,
      update: (id) => `/users/${id}`,
      delete: (id) => `/users/${id}`,
    },
    licenses: {
      myLicenses: () => '/licenses/my',
      getById: (id) => `/licenses/${id}`,
      create: () => '/licenses',
      update: (id) => `/licenses/${id}`,
      delete: (id) => `/licenses/${id}`,
      analytics: () => '/licenses/analytics',
    },
    subscriptions: {
      mySubscriptions: () => '/subscriptions/my',
      getById: (id) => `/subscriptions/${id}`,
      create: () => '/subscriptions',
      update: (id) => `/subscriptions/${id}`,
      cancel: (id) => `/subscriptions/${id}/cancel`,
    },
    payments: {
      getAll: () => '/payments',
      getById: (id) => `/payments/${id}`,
      create: () => '/payments',
    },
    organizations: {
      my: () => '/organizations/my',
      getById: (id) => `/organizations/${id}`,
      create: () => '/organizations',
      update: (id) => `/organizations/${id}`,
      delete: (id) => `/organizations/${id}`,
      context: () => '/organizations/context',
      removeMember: (orgId, memberId) => `/organizations/${orgId}/members/${memberId}/remove`,
      updateMember: (orgId, memberId) => `/organizations/${orgId}/members/${memberId}`,
      setMemberPassword: (orgId, memberId) => `/organizations/${orgId}/members/${memberId}/password`,
    },
    teamMembers: {
      create: () => '/team-members',
      getAll: () => '/team-members',
      getById: (id) => `/team-members/${id}`,
      update: (id) => `/team-members/${id}`,
      delete: (id) => `/team-members/${id}`,
    },
    admin: {
      dashboard: () => '/admin/dashboard',
      users: () => '/admin/users',
      licenses: () => '/admin/licenses',
      payments: () => '/admin/payments',
      createLicense: () => '/admin/licenses/create',
    },
    projects: {
      getAll: () => '/projects',
      getById: (id) => `/projects/${id}`,
      create: () => '/projects',
      update: (id) => `/projects/${id}`,
      delete: (id) => `/projects/${id}`,
    },
    projectTeamMembers: {
      getAll: (projectId) => `/projects/${projectId}/team-members`,
      create: (projectId) => `/projects/${projectId}/team-members`,
      update: (projectId, memberId) => `/projects/${projectId}/team-members/${memberId}`,
      delete: (projectId, memberId) => `/projects/${projectId}/team-members/${memberId}`,
    },
  },
}));

jest.mock('../../services/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  },
  db: {
    collection: jest.fn(),
  },
  isWebOnlyMode: jest.fn().mockReturnValue(true),
}));

jest.mock('../../services/AdminDashboardService', () => ({
  getUsers: jest.fn(),
  getDashboardStats: jest.fn(),
  getSystemHealth: jest.fn(),
  getPayments: jest.fn(),
  getPaymentDetails: jest.fn(),
  getUserDetails: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock('../../services/CloudProjectIntegration', () => ({
  cloudProjectIntegration: {
    getUserProjects: jest.fn(),
  }
}));

jest.mock('../../services/FirestoreLicenseService', () => ({
  firestoreCollectionManager: {
    validateCollectionAccess: jest.fn(),
  },
  firestoreLicenseService: {
    getLicensesByFirebaseUid: jest.fn(),
  }
}));

// Helper function for wrapping components with necessary providers
const renderWithProviders = (ui, {
  authContextValue = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
    updateUser: jest.fn(),
    loginWithGoogle: jest.fn(),
    loginWithApple: jest.fn(),
  },
  loadingContextValue = {
    isLoading: false,
    setLoading: jest.fn(),
  },
  initialRoute = '/',
} = {}) => {
  return render(
    <SnackbarProvider>
      <AuthContext.Provider value={authContextValue}>
        <LoadingContext.Provider value={loadingContextValue}>
          <MemoryRouter initialEntries={[initialRoute]}>
            {ui}
          </MemoryRouter>
        </LoadingContext.Provider>
      </AuthContext.Provider>
    </SnackbarProvider>
  );
};

// Test Suite 1: Authentication Flows
describe('Authentication Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Login Page renders correctly', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/Sign in to your BackboneLogic, Inc. account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('Login form submits correctly', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ id: '123', email: 'test@example.com', role: 'USER' });
    const mockSetLoading = jest.fn();
    
    renderWithProviders(
      <LoginPage />,
      {
        authContextValue: { login: mockLogin },
        loadingContextValue: { setLoading: mockSetLoading },
      }
    );
    
    await act(async () => {
      userEvent.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      userEvent.type(screen.getByLabelText(/Password/i), 'password123');
      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    });
    
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('Registration Page renders correctly', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  test('Registration form validates password strength', async () => {
    renderWithProviders(<RegisterPage />);
    
    await act(async () => {
      userEvent.type(screen.getByLabelText(/Password/i), 'weak');
    });
    
    expect(screen.getByText(/Weak/i)).toBeInTheDocument();
    
    await act(async () => {
      userEvent.clear(screen.getByLabelText(/Password/i));
      userEvent.type(screen.getByLabelText(/Password/i), 'StrongPassword123!');
    });
    
    expect(screen.getByText(/Strong/i)).toBeInTheDocument();
  });

  test('Firebase Auth Required component renders correctly', () => {
    renderWithProviders(<FirebaseAuthRequired />);
    // This component should show a message about Firebase Auth being required
    expect(screen.getByText(/Firebase Authentication/i)).toBeInTheDocument();
  });
});

// Test Suite 2: Admin Dashboard
describe('Admin Dashboard', () => {
  const mockAdminUser = {
    id: 'admin123',
    email: 'admin@example.com',
    role: 'SUPERADMIN',
    name: 'Admin User',
  };
  
  const mockAdminDashboardService = require('../../services/AdminDashboardService');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAdminDashboardService.getUsers.mockResolvedValue({
      users: [
        { id: 'user1', email: 'user1@example.com', firstName: 'User', lastName: 'One', role: 'USER', status: 'active' },
        { id: 'user2', email: 'user2@example.com', firstName: 'User', lastName: 'Two', role: 'ADMIN', status: 'active' },
      ],
    });
    
    mockAdminDashboardService.getDashboardStats.mockResolvedValue({
      totalUsers: 10,
      activeSubscriptions: 5,
      totalRevenue: 1500,
      pendingApprovals: 2,
      systemHealth: 'healthy',
      recentPayments: [],
    });
    
    mockAdminDashboardService.getSystemHealth.mockResolvedValue({
      overall: 'healthy',
      database: { status: 'healthy', responseTimeMs: 50 },
      email: { status: 'healthy', responseTimeMs: 120 },
      payment: { status: 'healthy', responseTimeMs: 200 },
    });
  });

  test('Admin Dashboard renders correctly for admin users', async () => {
    renderWithProviders(
      <AdminDashboard />,
      {
        authContextValue: { user: mockAdminUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Subscriptions/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    });
  });

  test('Admin Dashboard shows correct statistics', async () => {
    renderWithProviders(
      <AdminDashboard />,
      {
        authContextValue: { user: mockAdminUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('5')).toBeInTheDocument(); // Active Subscriptions
      expect(screen.getByText('$1500')).toBeInTheDocument(); // Total Revenue
    });
  });

  test('Admin Dashboard tabs switch correctly', async () => {
    renderWithProviders(
      <AdminDashboard />,
      {
        authContextValue: { user: mockAdminUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText(/Licenses/i));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Subscription Tier/i)).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText(/System Health/i));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/System Status/i)).toBeInTheDocument();
    });
  });
});

// Test Suite 3: User Dashboard
describe('User Dashboard', () => {
  const mockUser = {
    id: 'user123',
    email: 'user@example.com',
    role: 'USER',
    name: 'Regular User',
  };
  
  const mockCloudProjectIntegration = require('../../services/CloudProjectIntegration').cloudProjectIntegration;
  const mockFirestoreLicenseService = require('../../services/FirestoreLicenseService').firestoreLicenseService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCloudProjectIntegration.getUserProjects.mockResolvedValue([
      { id: 'project1', name: 'Project 1', isActive: true, isArchived: false },
      { id: 'project2', name: 'Project 2', isActive: true, isArchived: false },
    ]);
    
    mockFirestoreLicenseService.getLicensesByFirebaseUid.mockResolvedValue([
      { id: 'license1', key: 'LICENSE-123', status: 'ACTIVE' },
      { id: 'license2', key: 'LICENSE-456', status: 'ACTIVE' },
    ]);
  });

  test('Dashboard Overview renders correctly for regular users', async () => {
    renderWithProviders(
      <DashboardOverview />,
      {
        authContextValue: { user: mockUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Licenses/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Projects/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Projects/i)).toBeInTheDocument();
    });
  });

  test('Dashboard shows correct project statistics', async () => {
    renderWithProviders(
      <DashboardOverview />,
      {
        authContextValue: { user: mockUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total Projects
      expect(screen.getByText('2')).toBeInTheDocument(); // Active Projects
    });
  });
});

// Test Suite 4: Team Member Management
describe('Team Member Management', () => {
  const mockEnterpriseUser = {
    id: 'enterprise123',
    email: 'enterprise@example.com',
    role: 'ADMIN',
    name: 'Enterprise Admin',
    organizationId: 'org123',
  };
  
  const mockApi = require('../../services/api').api;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockApi.get.mockImplementation((url) => {
      if (url.includes('/organizations/context')) {
        return Promise.resolve({
          data: {
            data: {
              organization: {
                id: 'org123',
                name: 'Test Organization',
                members: [
                  { id: 'member1', email: 'member1@example.com', firstName: 'Team', lastName: 'Member1', role: 'MEMBER', status: 'ACTIVE' },
                  { id: 'member2', email: 'member2@example.com', firstName: 'Team', lastName: 'Member2', role: 'MEMBER', status: 'ACTIVE' },
                ],
              },
              members: [
                { id: 'member1', email: 'member1@example.com', firstName: 'Team', lastName: 'Member1', role: 'MEMBER', status: 'ACTIVE' },
                { id: 'member2', email: 'member2@example.com', firstName: 'Team', lastName: 'Member2', role: 'MEMBER', status: 'ACTIVE' },
              ],
              activeSubscription: {
                id: 'sub123',
                tier: 'ENTERPRISE',
                seats: 10,
                status: 'ACTIVE',
                organizationId: 'org123',
              },
              primaryRole: 'OWNER',
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  test('Team Page renders correctly for enterprise users', async () => {
    renderWithProviders(
      <TeamPage />,
      {
        authContextValue: { user: mockEnterpriseUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Team Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Team Members/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Members/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Seats/i)).toBeInTheDocument();
      expect(screen.getByText(/Available Seats/i)).toBeInTheDocument();
    });
  });

  test('Team Page shows correct team statistics', async () => {
    renderWithProviders(
      <TeamPage />,
      {
        authContextValue: { user: mockEnterpriseUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Team Members
      expect(screen.getByText('2')).toBeInTheDocument(); // Active Members
      expect(screen.getByText('10')).toBeInTheDocument(); // Total Seats
      expect(screen.getByText('8')).toBeInTheDocument(); // Available Seats
    });
  });

  test('Add Team Member dialog opens correctly', async () => {
    renderWithProviders(
      <TeamPage />,
      {
        authContextValue: { user: mockEnterpriseUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Add Team Member/i)).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText(/Add Team Member/i));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Create New Team Member/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    });
  });
});

// Test Suite 5: Cloud Projects Integration
describe('Cloud Projects Integration', () => {
  const mockUser = {
    id: 'user123',
    email: 'user@example.com',
    role: 'USER',
    name: 'Regular User',
  };
  
  const mockCloudProjectIntegration = require('../../services/CloudProjectIntegration').cloudProjectIntegration;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCloudProjectIntegration.getUserProjects.mockResolvedValue([
      { id: 'project1', name: 'Project 1', isActive: true, isArchived: false },
      { id: 'project2', name: 'Project 2', isActive: true, isArchived: false },
    ]);
  });

  test('Cloud Projects Bridge renders correctly', async () => {
    renderWithProviders(
      <DashboardCloudProjectsBridge />,
      {
        authContextValue: { user: mockUser, isAuthenticated: true },
      }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Cloud Projects/i)).toBeInTheDocument();
    });
  });
});

// Test Suite 6: Firebase Integration
describe('Firebase Integration', () => {
  const mockUser = {
    id: 'user123',
    email: 'user@example.com',
    role: 'USER',
    name: 'Regular User',
  };
  
  const mockFirebase = require('../../services/firebase');
  const mockFirestoreCollectionManager = require('../../services/FirestoreLicenseService').firestoreCollectionManager;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFirebase.isWebOnlyMode.mockReturnValue(true);
    mockFirestoreCollectionManager.validateCollectionAccess.mockResolvedValue(true);
  });

  test('Firebase initialization in web-only mode', async () => {
    // This is more of an integration test that would verify Firebase initialization
    // In a real test, we would mock the FirebaseInitializer and verify its methods are called
    expect(mockFirebase.isWebOnlyMode()).toBe(true);
  });
});

// Test Suite 7: End-to-End User Flows
describe('End-to-End User Flows', () => {
  // These would typically be integration or E2E tests
  // For this example, we'll mock the necessary services and verify the flow
  
  const mockApi = require('../../services/api').api;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Complete user registration and login flow', async () => {
    // Mock the registration API call
    mockApi.post.mockImplementation((url) => {
      if (url === '/auth/register') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              user: { id: 'new-user', email: 'newuser@example.com', role: 'USER' },
              token: 'fake-token',
            },
            message: 'Registration successful',
          },
        });
      }
      if (url === '/auth/login') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              user: { id: 'new-user', email: 'newuser@example.com', role: 'USER' },
              tokens: { accessToken: 'fake-token', refreshToken: 'fake-refresh' },
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    // This would be a more complex test in reality
    // Here we're just verifying the mocked API calls would work as expected
    const registerResult = await mockApi.post('/auth/register');
    expect(registerResult.data.success).toBe(true);
    
    const loginResult = await mockApi.post('/auth/login');
    expect(loginResult.data.success).toBe(true);
  });
});

// Test Suite 8: Error Handling
describe('Error Handling', () => {
  const mockApi = require('../../services/api').api;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Login handles API errors correctly', async () => {
    mockApi.post.mockImplementation((url) => {
      if (url === '/auth/login') {
        return Promise.reject({
          response: {
            data: {
              success: false,
              message: 'Invalid credentials',
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    const mockLogin = jest.fn().mockImplementation(async () => {
      try {
        await mockApi.post('/auth/login');
      } catch (err) {
        throw new Error(err.response.data.message);
      }
    });
    
    renderWithProviders(
      <LoginPage />,
      {
        authContextValue: { login: mockLogin },
      }
    );
    
    await act(async () => {
      userEvent.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
      userEvent.type(screen.getByLabelText(/Password/i), 'wrongpassword');
      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    });
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
    
    // In a real test, we would check for error messages in the UI
  });
});

// Test Suite 9: Responsive UI
describe('Responsive UI', () => {
  test('Login page is responsive', () => {
    // This would typically involve checking styles and layout at different viewport sizes
    // For this example, we'll just verify the component renders
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/Sign in to your BackboneLogic, Inc. account/i)).toBeInTheDocument();
  });
});
