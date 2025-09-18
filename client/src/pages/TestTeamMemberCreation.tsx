/**
 * Test Team Member Creation Page
 * 
 * This page provides a comprehensive test interface for team member creation
 * and license consumption verification
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useOrganizationLicenses, useOrganizationTeamMembers, useCurrentUser, useOrganizationContext } from '@/hooks/useStreamlinedData';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
}

const TestTeamMemberCreation: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  // Get data using the streamlined hooks
  const { data: licenses, refetch: refetchLicenses } = useOrganizationLicenses();
  const { data: teamMembers, refetch: refetchTeamMembers } = useOrganizationTeamMembers();
  const { data: currentUser } = useCurrentUser();
  const { data: organization } = useOrganizationContext();

  // Generate test email
  useEffect(() => {
    setTestEmail(`test.team.member.${Date.now()}@example.com`);
  }, []);

  const addTestResult = (step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    const result: TestResult = {
      step,
      status,
      message,
      data,
      timestamp: new Date()
    };
    setTestResults(prev => [...prev, result]);
  };

  const getAuthToken = async (): Promise<string> => {
    try {
      const { auth } = await import('@/services/firebase');
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
    } catch (error) {
      console.warn('Failed to get Firebase Auth token:', error);
    }
    return localStorage.getItem('authToken') || 'placeholder-token';
  };

  const testStep1_InitialState = async () => {
    addTestResult('Initial State', 'pending', 'Checking initial state...');
    
    try {
      await refetchLicenses();
      await refetchTeamMembers();
      
      const availableLicenses = licenses?.filter(l => 
        (l.status === 'ACTIVE' || l.status === 'PENDING') && !l.assignedTo
      ) || [];
      
      const currentTeamMembers = teamMembers || [];
      
      addTestResult('Initial State', 'success', 
        `Found ${availableLicenses.length} available licenses and ${currentTeamMembers.length} team members`,
        { availableLicenses, currentTeamMembers }
      );
      
      return { availableLicenses, currentTeamMembers };
    } catch (error) {
      addTestResult('Initial State', 'error', `Failed to get initial state: ${error}`);
      throw error;
    }
  };

  const testStep2_CreateTeamMember = async (availableLicenses: any[]) => {
    addTestResult('Create Team Member', 'pending', 'Creating team member via API...');
    
    try {
      const apiBaseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5001/backbone-logic/us-central1/api'
        : 'https://us-central1-backbone-logic.cloudfunctions.net/api';

      const response = await fetch(`${apiBaseUrl}/team-members/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          email: testEmail,
          firstName: 'Test',
          lastName: 'TeamMember',
          department: 'Engineering',
          position: 'Developer',
          phone: '+1234567890',
          role: 'MEMBER',
          licenseType: availableLicenses[0]?.tier || 'PROFESSIONAL',
          organizationId: organization?.organization?.id || 'enterprise-media-org',
          temporaryPassword: 'TestPassword123!',
          sendWelcomeEmail: false
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        addTestResult('Create Team Member', 'success', 
          `Team member created successfully: ${result.data.email}`,
          result.data
        );
        return result.data;
      } else {
        addTestResult('Create Team Member', 'error', 
          `API error: ${result.error || 'Unknown error'}`,
          result
        );
        throw new Error(result.error || 'API error');
      }
    } catch (error) {
      addTestResult('Create Team Member', 'error', `Failed to create team member: ${error}`);
      throw error;
    }
  };

  const testStep3_VerifyCreation = async (createdMember: any) => {
    addTestResult('Verify Creation', 'pending', 'Verifying team member was created...');
    
    try {
      await refetchTeamMembers();
      const updatedTeamMembers = teamMembers || [];
      const foundMember = updatedTeamMembers.find(member => member.email === testEmail);
      
      if (foundMember) {
        addTestResult('Verify Creation', 'success', 
          `Team member found in database: ${foundMember.email}`,
          foundMember
        );
        return foundMember;
      } else {
        addTestResult('Verify Creation', 'error', 'Team member not found in database');
        throw new Error('Team member not found');
      }
    } catch (error) {
      addTestResult('Verify Creation', 'error', `Failed to verify creation: ${error}`);
      throw error;
    }
  };

  const testStep4_VerifyLicenseAssignment = async () => {
    addTestResult('Verify License Assignment', 'pending', 'Verifying license was assigned...');
    
    try {
      await refetchLicenses();
      const updatedLicenses = licenses || [];
      const assignedLicense = updatedLicenses.find(license => 
        license.assignedTo && license.assignedTo.email === testEmail
      );
      
      if (assignedLicense) {
        addTestResult('Verify License Assignment', 'success', 
          `License assigned: ${assignedLicense.id} (${assignedLicense.tier})`,
          assignedLicense
        );
        return assignedLicense;
      } else {
        addTestResult('Verify License Assignment', 'error', 'No license assigned to team member');
        throw new Error('License not assigned');
      }
    } catch (error) {
      addTestResult('Verify License Assignment', 'error', `Failed to verify license assignment: ${error}`);
      throw error;
    }
  };

  const testStep5_VerifyCounts = async (initialState: any) => {
    addTestResult('Verify Counts', 'pending', 'Verifying license and team member counts...');
    
    try {
      await refetchLicenses();
      await refetchTeamMembers();
      
      const finalLicenses = licenses || [];
      const finalTeamMembers = teamMembers || [];
      
      const availableLicensesBefore = initialState.availableLicenses.length;
      const availableLicensesAfter = finalLicenses.filter(l => !l.assignedTo).length;
      
      const teamMembersBefore = initialState.currentTeamMembers.length;
      const teamMembersAfter = finalTeamMembers.length;
      
      const licenseCountDecreased = availableLicensesAfter === availableLicensesBefore - 1;
      const teamMemberCountIncreased = teamMembersAfter === teamMembersBefore + 1;
      
      if (licenseCountDecreased && teamMemberCountIncreased) {
        addTestResult('Verify Counts', 'success', 
          `Counts verified: Licenses ${availableLicensesBefore} → ${availableLicensesAfter}, Team Members ${teamMembersBefore} → ${teamMembersAfter}`,
          { availableLicensesBefore, availableLicensesAfter, teamMembersBefore, teamMembersAfter }
        );
      } else {
        addTestResult('Verify Counts', 'error', 
          `Count verification failed: License decrease: ${licenseCountDecreased}, Team member increase: ${teamMemberCountIncreased}`,
          { availableLicensesBefore, availableLicensesAfter, teamMembersBefore, teamMembersAfter }
        );
      }
    } catch (error) {
      addTestResult('Verify Counts', 'error', `Failed to verify counts: ${error}`);
    }
  };

  const runCompleteTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      enqueueSnackbar('Starting comprehensive team member creation test...', { variant: 'info' });
      
      // Step 1: Get initial state
      const initialState = await testStep1_InitialState();
      
      // Step 2: Create team member
      const createdMember = await testStep2_CreateTeamMember(initialState.availableLicenses);
      
      // Step 3: Verify creation
      const verifiedMember = await testStep3_VerifyCreation(createdMember);
      
      // Step 4: Verify license assignment
      const assignedLicense = await testStep4_VerifyLicenseAssignment();
      
      // Step 5: Verify counts
      await testStep5_VerifyCounts(initialState);
      
      enqueueSnackbar('Test completed successfully!', { variant: 'success' });
      
    } catch (error) {
      enqueueSnackbar(`Test failed: ${error}`, { variant: 'error' });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <CircularProgress size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Team Member Creation Test
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This page tests the complete team member creation flow including license consumption.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Configuration
              </Typography>
              
              <TextField
                fullWidth
                label="Test Email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Button
                fullWidth
                variant="contained"
                onClick={runCompleteTest}
                disabled={isRunning}
                startIcon={isRunning ? <CircularProgress size={16} /> : <PersonAddIcon />}
                sx={{ mb: 2 }}
              >
                {isRunning ? 'Running Test...' : 'Run Complete Test'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setTestResults([])}
                startIcon={<RefreshIcon />}
              >
                Clear Results
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current State
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Available Licenses: {licenses?.filter(l => !l.assignedTo).length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Team Members: {teamMembers?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organization: {organization?.organization?.name || 'Unknown'}
                </Typography>
              </Box>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  refetchLicenses();
                  refetchTeamMembers();
                }}
                startIcon={<RefreshIcon />}
              >
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {testResults.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            
            <List>
              {testResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ mr: 2 }}>
                        {getStatusIcon(result.status)}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">
                          {result.step}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.message}
                        </Typography>
                        {result.data && (
                          <Typography variant="caption" component="pre" sx={{ mt: 1, fontSize: '0.75rem' }}>
                            {JSON.stringify(result.data, null, 2)}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={result.status}
                        color={getStatusColor(result.status) as any}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                  {index < testResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TestTeamMemberCreation;
