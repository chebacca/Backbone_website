/**
 * Comprehensive Test Suite for Dataset Creation Wizard
 * 
 * Tests all buttons, dropdowns, onClick handlers, form validation,
 * step navigation, and cloud provider configurations.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DatasetCreationWizard from '../DatasetCreationWizard';
import { cloudProjectIntegration } from '../../services/CloudProjectIntegration';

// Mock the cloud project integration service
jest.mock('../../services/CloudProjectIntegration', () => ({
    cloudProjectIntegration: {
        createDataset: jest.fn(),
        assignDatasetToProject: jest.fn(),
    }
}));

const mockCloudProjectIntegration = cloudProjectIntegration as jest.Mocked<typeof cloudProjectIntegration>;

// Create a theme for testing
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
);

// Default props for the wizard
const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
};

describe('DatasetCreationWizard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initial Render and Basic Navigation', () => {
        test('renders wizard dialog when open', () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByText('Create Dataset')).toBeInTheDocument();
            expect(screen.getByText('Basic Information')).toBeInTheDocument();
            expect(screen.getByText('Dataset Information')).toBeInTheDocument();
        });

        test('does not render when closed', () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} open={false} />
                </TestWrapper>
            );

            expect(screen.queryByText('Create Dataset')).not.toBeInTheDocument();
        });

        test('close button works', async () => {
            const onClose = jest.fn();
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} onClose={onClose} />
                </TestWrapper>
            );

            const closeButton = screen.getByRole('button', { name: /close/i });
            await userEvent.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        test('cancel button works', async () => {
            const onClose = jest.fn();
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} onClose={onClose} />
                </TestWrapper>
            );

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await userEvent.click(cancelButton);

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Step 1: Basic Information', () => {
        test('renders all basic information fields', () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            expect(screen.getByLabelText(/dataset name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
        });

        test('dataset name input works', async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            const nameInput = screen.getByLabelText(/dataset name/i);
            await userEvent.type(nameInput, 'Test Dataset');

            expect(nameInput).toHaveValue('Test Dataset');
        });

        test('description input works', async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            const descriptionInput = screen.getByLabelText(/description/i);
            await userEvent.type(descriptionInput, 'Test description');

            expect(descriptionInput).toHaveValue('Test description');
        });

        test('visibility dropdown works', async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            const visibilitySelect = screen.getByLabelText(/visibility/i);
            await userEvent.click(visibilitySelect);

            // Check dropdown options
            expect(screen.getByText('Private')).toBeInTheDocument();
            expect(screen.getByText('Organization')).toBeInTheDocument();
            expect(screen.getByText('Public')).toBeInTheDocument();

            // Select organization
            await userEvent.click(screen.getByText('Organization'));
            expect(visibilitySelect).toHaveTextContent('Organization');
        });

        test('tags input works', async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            const tagsInput = screen.getByLabelText(/tags/i);
            await userEvent.type(tagsInput, 'tag1, tag2, tag3');

            expect(tagsInput).toHaveValue('tag1, tag2, tag3');
        });

        test('validation prevents next step without required fields', async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            const nextButton = screen.getByRole('button', { name: /next/i });
            await userEvent.click(nextButton);

            // Should show validation error and stay on step 1
            expect(screen.getByText(/dataset name is required/i)).toBeInTheDocument();
            expect(screen.getByText('Basic Information')).toBeInTheDocument();
        });

        test('can proceed to next step with valid data', async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            // Fill required field
            const nameInput = screen.getByLabelText(/dataset name/i);
            await userEvent.type(nameInput, 'Test Dataset');

            const nextButton = screen.getByRole('button', { name: /next/i });
            await userEvent.click(nextButton);

            // Should proceed to step 2
            expect(screen.getByText('Cloud Provider Selection')).toBeInTheDocument();
        });
    });

    describe('Step 2: Cloud Provider Selection', () => {
        beforeEach(async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            // Navigate to step 2
            const nameInput = screen.getByLabelText(/dataset name/i);
            await userEvent.type(nameInput, 'Test Dataset');
            const nextButton = screen.getByRole('button', { name: /next/i });
            await userEvent.click(nextButton);
        });

        test('renders all cloud provider options', () => {
            expect(screen.getByText('Google Firestore')).toBeInTheDocument();
            expect(screen.getByText('Google Cloud Storage')).toBeInTheDocument();
            expect(screen.getByText('Amazon S3')).toBeInTheDocument();
            expect(screen.getByText('AWS Services')).toBeInTheDocument();
            expect(screen.getByText('Microsoft Azure Blob Storage')).toBeInTheDocument();
        });

        test('firestore is selected by default', () => {
            const firestoreRadio = screen.getByRole('radio', { name: /google firestore/i });
            expect(firestoreRadio).toBeChecked();
        });

        test('can select different cloud providers', async () => {
            // Select GCS
            const gcsCard = screen.getByText('Google Cloud Storage').closest('.MuiCard-root');
            await userEvent.click(gcsCard!);

            const gcsRadio = screen.getByRole('radio', { name: /google cloud storage/i });
            expect(gcsRadio).toBeChecked();

            // Select AWS
            const awsCard = screen.getByText('AWS Services').closest('.MuiCard-root');
            await userEvent.click(awsCard!);

            const awsRadio = screen.getByRole('radio', { name: /aws services/i });
            expect(awsRadio).toBeChecked();
        });

        test('back button works', async () => {
            const backButton = screen.getByRole('button', { name: /back/i });
            await userEvent.click(backButton);

            expect(screen.getByText('Dataset Information')).toBeInTheDocument();
        });

        test('can proceed to authentication step', async () => {
            const nextButton = screen.getByRole('button', { name: /next/i });
            await userEvent.click(nextButton);

            expect(screen.getByText('Authentication Setup')).toBeInTheDocument();
        });
    });

    describe('Step 3: Authentication Setup', () => {
        describe('Google Cloud Authentication', () => {
            beforeEach(async () => {
                render(
                    <TestWrapper>
                        <DatasetCreationWizard {...defaultProps} />
                    </TestWrapper>
                );

                // Navigate to step 3 with Firestore selected
                await navigateToStep3('firestore');
            });

            test('renders Google Cloud authentication fields', () => {
                expect(screen.getByText('Google Cloud Authentication')).toBeInTheDocument();
                expect(screen.getByLabelText(/project id/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/service account key/i)).toBeInTheDocument();
            });

            test('project ID input works', async () => {
                const projectIdInput = screen.getByLabelText(/project id/i);
                await userEvent.type(projectIdInput, 'my-test-project');

                expect(projectIdInput).toHaveValue('my-test-project');
            });

            test('service account key input works', async () => {
                const keyInput = screen.getByLabelText(/service account key/i);
                await userEvent.type(keyInput, '{"type": "service_account"}');

                expect(keyInput).toHaveValue('{"type": "service_account"}');
            });

            test('credential visibility toggle works', async () => {
                const keyInput = screen.getByLabelText(/service account key/i);
                const visibilityButton = screen.getByRole('button', { name: /toggle password visibility/i });

                // Initially should be password type
                expect(keyInput).toHaveAttribute('type', 'password');

                await userEvent.click(visibilityButton);
                expect(keyInput).toHaveAttribute('type', 'text');

                await userEvent.click(visibilityButton);
                expect(keyInput).toHaveAttribute('type', 'password');
            });

            test('validation prevents next step without required fields', async () => {
                const nextButton = screen.getByRole('button', { name: /next/i });
                await userEvent.click(nextButton);

                expect(screen.getByText(/project id is required/i)).toBeInTheDocument();
                expect(screen.getByText(/service account key is required/i)).toBeInTheDocument();
            });
        });

        describe('AWS Authentication', () => {
            beforeEach(async () => {
                render(
                    <TestWrapper>
                        <DatasetCreationWizard {...defaultProps} />
                    </TestWrapper>
                );

                await navigateToStep3('aws');
            });

            test('renders AWS authentication fields', () => {
                expect(screen.getByText('AWS Authentication')).toBeInTheDocument();
                expect(screen.getByLabelText(/access key id/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/secret access key/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
            });

            test('AWS credential inputs work', async () => {
                const accessKeyInput = screen.getByLabelText(/access key id/i);
                const secretKeyInput = screen.getByLabelText(/secret access key/i);
                const regionInput = screen.getByLabelText(/region/i);

                await userEvent.type(accessKeyInput, 'AKIATEST');
                await userEvent.type(secretKeyInput, 'secretkey123');
                await userEvent.type(regionInput, 'us-east-1');

                expect(accessKeyInput).toHaveValue('AKIATEST');
                expect(secretKeyInput).toHaveValue('secretkey123');
                expect(regionInput).toHaveValue('us-east-1');
            });
        });

        describe('Azure Authentication', () => {
            beforeEach(async () => {
                render(
                    <TestWrapper>
                        <DatasetCreationWizard {...defaultProps} />
                    </TestWrapper>
                );

                await navigateToStep3('azure');
            });

            test('renders Azure authentication fields', () => {
                expect(screen.getByText('Azure Authentication')).toBeInTheDocument();
                expect(screen.getByLabelText(/storage account name/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/storage account key/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/connection string/i)).toBeInTheDocument();
            });

            test('Azure credential inputs work', async () => {
                const accountNameInput = screen.getByLabelText(/storage account name/i);
                const accountKeyInput = screen.getByLabelText(/storage account key/i);

                await userEvent.type(accountNameInput, 'teststorageaccount');
                await userEvent.type(accountKeyInput, 'accountkey123');

                expect(accountNameInput).toHaveValue('teststorageaccount');
                expect(accountKeyInput).toHaveValue('accountkey123');
            });
        });

        test('connection test button works', async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            await navigateToStep3('firestore');

            // Fill required fields
            await userEvent.type(screen.getByLabelText(/project id/i), 'test-project');
            await userEvent.type(screen.getByLabelText(/service account key/i), '{"test": "key"}');

            const testButton = screen.getByRole('button', { name: /test connection/i });
            await userEvent.click(testButton);

            expect(screen.getByText(/testing connection/i)).toBeInTheDocument();
        });
    });

    describe('Step 4: Storage Configuration', () => {
        describe('GCS Storage Configuration', () => {
            beforeEach(async () => {
                render(
                    <TestWrapper>
                        <DatasetCreationWizard {...defaultProps} />
                    </TestWrapper>
                );

                await navigateToStep4('gcs');
            });

            test('renders GCS storage fields', () => {
                expect(screen.getByLabelText(/gcs bucket name/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/prefix/i)).toBeInTheDocument();
            });

            test('GCS storage inputs work', async () => {
                const bucketInput = screen.getByLabelText(/gcs bucket name/i);
                const prefixInput = screen.getByLabelText(/prefix/i);

                await userEvent.type(bucketInput, 'my-test-bucket');
                await userEvent.type(prefixInput, 'datasets/');

                expect(bucketInput).toHaveValue('my-test-bucket');
                expect(prefixInput).toHaveValue('datasets/');
            });
        });

        describe('S3 Storage Configuration', () => {
            beforeEach(async () => {
                render(
                    <TestWrapper>
                        <DatasetCreationWizard {...defaultProps} />
                    </TestWrapper>
                );

                await navigateToStep4('s3');
            });

            test('renders S3 storage fields', () => {
                expect(screen.getByLabelText(/s3 bucket name/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/prefix/i)).toBeInTheDocument();
            });

            test('S3 storage inputs work', async () => {
                const bucketInput = screen.getByLabelText(/s3 bucket name/i);
                const regionInput = screen.getByLabelText(/region/i);

                await userEvent.type(bucketInput, 'my-s3-bucket');
                await userEvent.type(regionInput, 'us-west-2');

                expect(bucketInput).toHaveValue('my-s3-bucket');
                expect(regionInput).toHaveValue('us-west-2');
            });
        });
    });

    describe('Step 5: Schema Template Selection', () => {
        beforeEach(async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            await navigateToStep5();
        });

        test('renders all schema template options', () => {
            expect(screen.getByText('Custom Schema')).toBeInTheDocument();
            expect(screen.getByText('Inventory Management')).toBeInTheDocument();
            expect(screen.getByText('Session Management')).toBeInTheDocument();
            expect(screen.getByText('Media Files')).toBeInTheDocument();
            expect(screen.getByText('User Management')).toBeInTheDocument();
            expect(screen.getByText('Analytics & Metrics')).toBeInTheDocument();
        });

        test('can select different schema templates', async () => {
            const inventoryCard = screen.getByText('Inventory Management').closest('.MuiCard-root');
            await userEvent.click(inventoryCard!);

            const inventoryRadio = screen.getByRole('radio', { name: /inventory management/i });
            expect(inventoryRadio).toBeChecked();
        });

        test('custom schema shows field editor', async () => {
            const customCard = screen.getByText('Custom Schema').closest('.MuiCard-root');
            await userEvent.click(customCard!);

            expect(screen.getByText('Custom Fields')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add field/i })).toBeInTheDocument();
        });

        test('can add custom fields', async () => {
            const customCard = screen.getByText('Custom Schema').closest('.MuiCard-root');
            await userEvent.click(customCard!);

            const addFieldButton = screen.getByRole('button', { name: /add field/i });
            await userEvent.click(addFieldButton);

            expect(screen.getByLabelText(/field name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
        });
    });

    describe('Step 6: Advanced Options', () => {
        beforeEach(async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            await navigateToStep6();
        });

        test('renders all advanced option switches', () => {
            expect(screen.getByLabelText(/enable encryption/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/access logging/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/enable compression/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/version control/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/automatic backups/i)).toBeInTheDocument();
        });

        test('advanced option switches work', async () => {
            const encryptionSwitch = screen.getByLabelText(/enable encryption/i);
            const compressionSwitch = screen.getByLabelText(/enable compression/i);

            expect(encryptionSwitch).not.toBeChecked();
            expect(compressionSwitch).not.toBeChecked();

            await userEvent.click(encryptionSwitch);
            await userEvent.click(compressionSwitch);

            expect(encryptionSwitch).toBeChecked();
            expect(compressionSwitch).toBeChecked();
        });
    });

    describe('Step 7: Review & Create', () => {
        beforeEach(async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            await navigateToFinalStep();
        });

        test('renders review information', () => {
            expect(screen.getByText('Review & Create Dataset')).toBeInTheDocument();
            expect(screen.getByText('Test Dataset')).toBeInTheDocument();
            expect(screen.getByText('FIRESTORE')).toBeInTheDocument();
        });

        test('create dataset button works', async () => {
            mockCloudProjectIntegration.createDataset.mockResolvedValue({
                id: 'test-dataset-id',
                name: 'Test Dataset',
                description: '',
                visibility: 'private',
                ownerId: 'test-user',
                organizationId: null,
                tags: [],
                schema: {},
                storage: { backend: 'firestore' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            const createButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createButton);

            expect(mockCloudProjectIntegration.createDataset).toHaveBeenCalledTimes(1);
        });

        test('shows loading state during creation', async () => {
            mockCloudProjectIntegration.createDataset.mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 1000))
            );

            const createButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createButton);

            expect(screen.getByText(/creating dataset/i)).toBeInTheDocument();
            expect(createButton).toBeDisabled();
        });
    });

    describe('Integration Features', () => {
        test('auto-assignment to project works', async () => {
            const assignToProject = 'test-project-id';
            mockCloudProjectIntegration.createDataset.mockResolvedValue({
                id: 'test-dataset-id',
                name: 'Test Dataset',
                description: '',
                visibility: 'private',
                ownerId: 'test-user',
                organizationId: null,
                tags: [],
                schema: {},
                storage: { backend: 'firestore' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            render(
                <TestWrapper>
                    <DatasetCreationWizard 
                        {...defaultProps} 
                        assignToProject={assignToProject}
                    />
                </TestWrapper>
            );

            await navigateToFinalStep();

            const createButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createButton);

            await waitFor(() => {
                expect(mockCloudProjectIntegration.assignDatasetToProject).toHaveBeenCalledWith(
                    assignToProject,
                    'test-dataset-id'
                );
            });
        });

        test('calls onSuccess callback after creation', async () => {
            const onSuccess = jest.fn();
            const mockDataset = {
                id: 'test-dataset-id',
                name: 'Test Dataset',
                description: '',
                visibility: 'private' as const,
                ownerId: 'test-user',
                organizationId: null,
                tags: [],
                schema: {},
                storage: { backend: 'firestore' as const },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            mockCloudProjectIntegration.createDataset.mockResolvedValue(mockDataset);

            render(
                <TestWrapper>
                    <DatasetCreationWizard 
                        {...defaultProps} 
                        onSuccess={onSuccess}
                    />
                </TestWrapper>
            );

            await navigateToFinalStep();

            const createButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createButton);

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledWith(mockDataset);
            });
        });
    });

    describe('Error Handling', () => {
        test('shows error message on creation failure', async () => {
            mockCloudProjectIntegration.createDataset.mockRejectedValue(
                new Error('Failed to create dataset')
            );

            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            await navigateToFinalStep();

            const createButton = screen.getByRole('button', { name: /create dataset/i });
            await userEvent.click(createButton);

            await waitFor(() => {
                expect(screen.getByText(/failed to create dataset/i)).toBeInTheDocument();
            });
        });

        test('handles validation errors properly', async () => {
            render(
                <TestWrapper>
                    <DatasetCreationWizard {...defaultProps} />
                </TestWrapper>
            );

            // Try to proceed without filling required fields
            const nextButton = screen.getByRole('button', { name: /next/i });
            await userEvent.click(nextButton);

            expect(screen.getByText(/dataset name is required/i)).toBeInTheDocument();
        });
    });

    // Helper functions for navigation
    async function navigateToStep3(provider: string) {
        // Step 1: Basic Information
        const nameInput = screen.getByLabelText(/dataset name/i);
        await userEvent.type(nameInput, 'Test Dataset');
        await userEvent.click(screen.getByRole('button', { name: /next/i }));

        // Step 2: Cloud Provider Selection
        if (provider !== 'firestore') {
            const providerCard = screen.getByText(getProviderDisplayName(provider)).closest('.MuiCard-root');
            await userEvent.click(providerCard!);
        }
        await userEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    async function navigateToStep4(provider: string) {
        await navigateToStep3(provider);

        // Fill authentication fields based on provider
        if (provider === 'gcs' || provider === 'firestore') {
            await userEvent.type(screen.getByLabelText(/project id/i), 'test-project');
            await userEvent.type(screen.getByLabelText(/service account key/i), '{"test": "key"}');
        } else if (provider === 'aws' || provider === 's3') {
            await userEvent.type(screen.getByLabelText(/access key id/i), 'AKIATEST');
            await userEvent.type(screen.getByLabelText(/secret access key/i), 'secretkey');
            await userEvent.type(screen.getByLabelText(/region/i), 'us-east-1');
        } else if (provider === 'azure') {
            await userEvent.type(screen.getByLabelText(/storage account name/i), 'testaccount');
            await userEvent.type(screen.getByLabelText(/storage account key/i), 'testkey');
        }

        await userEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    async function navigateToStep5() {
        await navigateToStep4('firestore');
        await userEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    async function navigateToStep6() {
        await navigateToStep5();
        await userEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    async function navigateToFinalStep() {
        await navigateToStep6();
        await userEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    function getProviderDisplayName(provider: string): string {
        const names: Record<string, string> = {
            'firestore': 'Google Firestore',
            'gcs': 'Google Cloud Storage',
            's3': 'Amazon S3',
            'aws': 'AWS Services',
            'azure': 'Microsoft Azure Blob Storage'
        };
        return names[provider] || provider;
    }
});
