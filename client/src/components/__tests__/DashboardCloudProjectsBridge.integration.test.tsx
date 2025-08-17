/**
 * Integration Tests for DashboardCloudProjectsBridge with Dataset Creation Wizard
 * 
 * Tests the integration between the main Cloud Projects page and the Dataset Creation Wizard,
 * ensuring all buttons, dialogs, and interactions work correctly.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DashboardCloudProjectsBridge } from '../DashboardCloudProjectsBridge';
import { cloudProjectIntegration } from '../../services/CloudProjectIntegration';
import { simplifiedStartupSequencer } from '../../services/SimplifiedStartupSequencer';

// Mock the services
jest.mock('../../services/CloudProjectIntegration', () => ({
    cloudProjectIntegration: {
        getUserProjects: jest.fn(),
        getProjectDatasets: jest.fn(),
        getLicensedTeamMembers: jest.fn(),
        getProjectTeamMembers: jest.fn(),
        listDatasets: jest.fn(),
        createDataset: jest.fn(),
        assignDatasetToProject: jest.fn(),
        unassignDatasetFromProject: jest.fn(),
        addTeamMemberToProject: jest.fn(),
        removeTeamMemberFromProject: jest.fn(),
        archiveProject: jest.fn(),
        restoreProject: jest.fn(),
    }
}));

jest.mock('../../services/SimplifiedStartupSequencer', () => ({
    simplifiedStartupSequencer: {
        selectMode: jest.fn(),
        selectProject: jest.fn(),
    }
}));

// Mock the auth context
const mockUser = {
    id: 'test-user',
    email: 'test@example.com',
    subscription: { plan: 'PRO' }
};

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true,
    })
}));

jest.mock('../../context/LoadingContext', () => ({
    useLoading: () => ({
        setLoading: jest.fn(),
    })
}));

const mockCloudProjectIntegration = cloudProjectIntegration as jest.Mocked<typeof cloudProjectIntegration>;
const mockSimplifiedStartupSequencer = simplifiedStartupSequencer as jest.Mocked<typeof simplifiedStartupSequencer>;

// Create a theme for testing
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

// Mock data
const mockProjects = [
    {
        id: 'project-1',
        name: 'Test Project 1',
        description: 'Test project description',
        applicationMode: 'shared_network' as const,
        storageBackend: 'firestore' as const,
        lastAccessedAt: new Date().toISOString(),
        isActive: true,
        isArchived: false,
        allowCollaboration: true,
        maxCollaborators: 50,
        realTimeEnabled: true,
    },
    {
        id: 'project-2',
        name: 'Test Project 2',
        description: 'Another test project',
        applicationMode: 'standalone' as const,
        storageBackend: 'gcs' as const,
        gcsBucket: 'test-bucket',
        lastAccessedAt: new Date().toISOString(),
        isActive: true,
        isArchived: false,
    }
];

const mockDatasets = [
    {
        id: 'dataset-1',
        name: 'Test Dataset 1',
        description: 'Test dataset',
        visibility: 'private' as const,
        ownerId: 'test-user',
        organizationId: null,
        tags: ['test'],
        schema: {},
        storage: { backend: 'firestore' as const },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

describe('DashboardCloudProjectsBridge Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup default mock responses
        mockCloudProjectIntegration.getUserProjects.mockResolvedValue(mockProjects);
        mockCloudProjectIntegration.getProjectDatasets.mockResolvedValue([]);
        mockCloudProjectIntegration.getLicensedTeamMembers.mockResolvedValue([]);
        mockCloudProjectIntegration.getProjectTeamMembers.mockResolvedValue([]);
        mockCloudProjectIntegration.listDatasets.mockResolvedValue(mockDatasets);
    });

    describe('Initial Render and Layout', () => {
        test('renders main page with create dataset button', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Cloud Projects')).toBeInTheDocument();
            });

            expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /create dataset/i })).toBeInTheDocument();
        });

        test('loads and displays projects', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
                expect(screen.getByText('Test Project 2')).toBeInTheDocument();
            });

            expect(mockCloudProjectIntegration.getUserProjects).toHaveBeenCalledTimes(1);
        });
    });

    describe('Dataset Creation Wizard Integration', () => {
        test('create dataset button opens wizard', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /create dataset/i })).toBeInTheDocument();
            });

            const createDatasetButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createDatasetButton);

            // Should open the Dataset Creation Wizard
            expect(screen.getByText('Create Dataset')).toBeInTheDocument();
            expect(screen.getByText('Basic Information')).toBeInTheDocument();
        });

        test('wizard closes when cancel is clicked', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /create dataset/i })).toBeInTheDocument();
            });

            // Open wizard
            const createDatasetButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createDatasetButton);

            expect(screen.getByText('Create Dataset')).toBeInTheDocument();

            // Close wizard
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await userEvent.click(cancelButton);

            expect(screen.queryByText('Create Dataset')).not.toBeInTheDocument();
        });

        test('successful dataset creation refreshes project list', async () => {
            const mockCreatedDataset = {
                id: 'new-dataset-id',
                name: 'New Test Dataset',
                description: 'Created via wizard',
                visibility: 'private' as const,
                ownerId: 'test-user',
                organizationId: null,
                tags: [],
                schema: {},
                storage: { backend: 'firestore' as const },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            mockCloudProjectIntegration.createDataset.mockResolvedValue(mockCreatedDataset);

            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /create dataset/i })).toBeInTheDocument();
            });

            // Open wizard and complete dataset creation
            const createDatasetButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createDatasetButton);

            // Fill out the wizard (simplified for test)
            const nameInput = screen.getByLabelText(/dataset name/i);
            await userEvent.type(nameInput, 'New Test Dataset');

            // Navigate through steps quickly
            for (let i = 0; i < 6; i++) {
                const nextButton = screen.getByRole('button', { name: /next/i });
                await userEvent.click(nextButton);
            }

            // Create the dataset
            const createButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createButton);

            await waitFor(() => {
                expect(mockCloudProjectIntegration.createDataset).toHaveBeenCalledTimes(1);
                expect(mockCloudProjectIntegration.getUserProjects).toHaveBeenCalledTimes(2); // Initial load + refresh
            });
        });
    });

    describe('Project Details Integration', () => {
        test('project settings button opens project details dialog', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            // Find and click the settings button for the first project
            const projectCards = screen.getAllByText(/Test Project/);
            const firstProjectCard = projectCards[0].closest('.MuiCard-root');
            const settingsButton = within(firstProjectCard!).getByRole('button');
            
            await userEvent.click(settingsButton);

            expect(screen.getByText('Project Details')).toBeInTheDocument();
            expect(screen.getByText('Test Project 1')).toBeInTheDocument();
        });

        test('project details dialog shows dataset assignment section', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            // Open project details
            const projectCards = screen.getAllByText(/Test Project/);
            const firstProjectCard = projectCards[0].closest('.MuiCard-root');
            const settingsButton = within(firstProjectCard!).getByRole('button');
            
            await userEvent.click(settingsButton);

            expect(screen.getByText('Assigned Datasets')).toBeInTheDocument();
            expect(screen.getByText('Currently Assigned Datasets')).toBeInTheDocument();
        });

        test('dataset assignment dropdown works in project details', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            // Open project details
            const projectCards = screen.getAllByText(/Test Project/);
            const firstProjectCard = projectCards[0].closest('.MuiCard-root');
            const settingsButton = within(firstProjectCard!).getByRole('button');
            
            await userEvent.click(settingsButton);

            // Wait for datasets to load
            await waitFor(() => {
                expect(mockCloudProjectIntegration.listDatasets).toHaveBeenCalled();
            });

            // Find and interact with dataset selection dropdown
            const datasetSelect = screen.getByLabelText(/select dataset/i);
            await userEvent.click(datasetSelect);

            // Should show available datasets
            expect(screen.getByText('Test Dataset 1 (Firestore)')).toBeInTheDocument();
        });

        test('assign dataset button works', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            // Open project details
            const projectCards = screen.getAllByText(/Test Project/);
            const firstProjectCard = projectCards[0].closest('.MuiCard-root');
            const settingsButton = within(firstProjectCard!).getByRole('button');
            
            await userEvent.click(settingsButton);

            await waitFor(() => {
                expect(mockCloudProjectIntegration.listDatasets).toHaveBeenCalled();
            });

            // Select a dataset
            const datasetSelect = screen.getByLabelText(/select dataset/i);
            await userEvent.click(datasetSelect);
            await userEvent.click(screen.getByText('Test Dataset 1 (Firestore)'));

            // Click assign button
            const assignButton = screen.getByRole('button', { name: /assign/i });
            await userEvent.click(assignButton);

            expect(mockCloudProjectIntegration.assignDatasetToProject).toHaveBeenCalledWith(
                'project-1',
                'dataset-1'
            );
        });
    });

    describe('Project Launch Integration', () => {
        test('launch button opens launch menu', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            // Find and click launch button
            const launchButtons = screen.getAllByRole('button', { name: /launch/i });
            await userEvent.click(launchButtons[0]);

            expect(screen.getByText('Launch (Web)')).toBeInTheDocument();
            expect(screen.getByText('Launch (Desktop)')).toBeInTheDocument();
        });

        test('launch web option works', async () => {
            // Mock window.location
            delete (window as any).location;
            window.location = { href: '' } as any;

            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            // Open launch menu
            const launchButtons = screen.getAllByRole('button', { name: /launch/i });
            await userEvent.click(launchButtons[0]);

            // Click launch web
            const launchWebButton = screen.getByText('Launch (Web)');
            await userEvent.click(launchWebButton);

            expect(mockSimplifiedStartupSequencer.selectMode).toHaveBeenCalledWith('shared_network', 'cloud');
            expect(mockSimplifiedStartupSequencer.selectProject).toHaveBeenCalledWith('project-1');
        });
    });

    describe('Project Management Features', () => {
        test('archive project button works', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            // Find and click archive button
            const archiveButtons = screen.getAllByRole('button', { name: /archive/i });
            await userEvent.click(archiveButtons[0]);

            expect(mockCloudProjectIntegration.archiveProject).toHaveBeenCalledWith('project-1');
        });

        test('project tabs work correctly', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Active Projects (2)')).toBeInTheDocument();
            });

            // Click archived tab
            const archivedTab = screen.getByText(/archived/i);
            await userEvent.click(archivedTab);

            expect(screen.getByText('Archived (0)')).toBeInTheDocument();
        });
    });

    describe('Team Member Management', () => {
        test('add team member button opens dialog', async () => {
            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            });

            // Open project details
            const projectCards = screen.getAllByText(/Test Project/);
            const firstProjectCard = projectCards[0].closest('.MuiCard-root');
            const settingsButton = within(firstProjectCard!).getByRole('button');
            
            await userEvent.click(settingsButton);

            // Find and click add team member button
            const addTeamMemberButton = screen.getByRole('button', { name: /add team member/i });
            await userEvent.click(addTeamMemberButton);

            expect(screen.getByText('Add Team Member')).toBeInTheDocument();
            expect(screen.getByText('Add licensed team members to this project')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        test('handles project loading errors gracefully', async () => {
            mockCloudProjectIntegration.getUserProjects.mockRejectedValue(
                new Error('Failed to load projects')
            );

            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText(/failed to load projects/i)).toBeInTheDocument();
            });
        });

        test('handles dataset creation errors', async () => {
            mockCloudProjectIntegration.createDataset.mockRejectedValue(
                new Error('Failed to create dataset')
            );

            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /create dataset/i })).toBeInTheDocument();
            });

            // Open wizard and try to create dataset
            const createDatasetButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createDatasetButton);

            // Fill minimum required fields and navigate to end
            const nameInput = screen.getByLabelText(/dataset name/i);
            await userEvent.type(nameInput, 'Test Dataset');

            // Navigate through steps
            for (let i = 0; i < 6; i++) {
                const nextButton = screen.getByRole('button', { name: /next/i });
                await userEvent.click(nextButton);
            }

            // Try to create
            const createButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createButton);

            await waitFor(() => {
                expect(screen.getByText(/failed to create dataset/i)).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Design', () => {
        test('renders correctly on mobile viewport', async () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(
                <TestWrapper>
                    <DashboardCloudProjectsBridge />
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Cloud Projects')).toBeInTheDocument();
            });

            // Should still show main functionality
            expect(screen.getByRole('button', { name: /create dataset/i })).toBeInTheDocument();
        });
    });
});
