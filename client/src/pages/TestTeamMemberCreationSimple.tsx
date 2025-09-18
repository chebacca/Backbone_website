import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/context/AuthContext';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const TestTeamMemberCreationSimple: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useAuth();
  
  // Get organization context from user data
  const orgContext = currentUser ? {
    id: currentUser.organizationId || 'enterprise-media-org',
    name: currentUser.organizationName || 'Enterprise Media',
    tier: 'ENTERPRISE' as const
  } : null;
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Generate test email
  useEffect(() => {
    setTestEmail(`test.team.member.${Date.now()}@example.com`);
  }, []);

  const addTestResult = (step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [...prev, { step, status, message, data }]);
  };

  const runTest = async () => {
    if (!currentUser || !orgContext) {
      enqueueSnackbar('Please log in as an organization admin to run this test', { variant: 'error' });
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      // Step 1: Get initial state
      addTestResult('initial-state', 'pending', 'Getting initial state...');
      
      const token = await currentUser.getIdToken();
      const orgId = orgContext.id;

      // Get licenses
      const licensesResponse = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/licenses?organizationId=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!licensesResponse.ok) {
        throw new Error(`Failed to get licenses: ${licensesResponse.status}`);
      }

      const licenses = await licensesResponse.json();
      const initialLicenseCount = licenses.data?.length || 0;

      // Get team members
      const teamMembersResponse = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/team-members?organizationId=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!teamMembersResponse.ok) {
        throw new Error(`Failed to get team members: ${teamMembersResponse.status}`);
      }

      const teamMembers = await teamMembersResponse.json();
      const initialTeamCount = teamMembers.data?.length || 0;

      addTestResult('initial-state', 'success', `Found ${initialLicenseCount} licenses and ${initialTeamCount} team members`);

      // Step 2: Create team member
      addTestResult('create-team-member', 'pending', 'Creating test team member...');

      const createResponse = await fetch('https://us-central1-backbone-logic.cloudfunctions.net/api/team-members/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
          department: 'Testing',
          position: 'Test Engineer',
          role: 'MEMBER',
          licenseType: 'PROFESSIONAL',
          temporaryPassword: 'TestPassword123!',
          activateImmediately: true,
          sendWelcomeEmail: false
        })
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Failed to create team member: ${createResponse.status} - ${errorText}`);
      }

      const createResult = await createResponse.json();
      addTestResult('create-team-member', 'success', `Team member created: ${createResult.data?.email}`, createResult.data);

      // Step 3: Verify final state
      addTestResult('verify-state', 'pending', 'Verifying final state...');

      // Get updated licenses
      const updatedLicensesResponse = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/licenses?organizationId=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const updatedLicenses = await updatedLicensesResponse.json();
      const finalLicenseCount = updatedLicenses.data?.length || 0;

      // Get updated team members
      const updatedTeamMembersResponse = await fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/team-members?organizationId=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const updatedTeamMembers = await updatedTeamMembersResponse.json();
      const finalTeamCount = updatedTeamMembers.data?.length || 0;

      addTestResult('verify-state', 'success', `Final state: ${finalLicenseCount} licenses, ${finalTeamCount} team members`);

      // Step 4: Verify license consumption
      const licenseConsumed = finalLicenseCount === initialLicenseCount - 1;
      const teamMemberAdded = finalTeamCount === initialTeamCount + 1;

      if (licenseConsumed && teamMemberAdded) {
        addTestResult('license-consumption', 'success', '✅ License consumed and team member added successfully!');
        enqueueSnackbar('Test passed! Team member creation and license consumption working correctly', { variant: 'success' });
      } else {
        addTestResult('license-consumption', 'error', `❌ License consumption failed. License count: ${initialLicenseCount} → ${finalLicenseCount}, Team count: ${initialTeamCount} → ${finalTeamCount}`);
        enqueueSnackbar('Test failed! License consumption did not work as expected', { variant: 'error' });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addTestResult('error', 'error', `❌ Test failed: ${errorMessage}`);
      enqueueSnackbar(`Test failed: ${errorMessage}`, { variant: 'error' });
    } finally {
      setIsRunning(false);
    }
  };

  if (!currentUser || !orgContext) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Please log in as an organization admin to run this test.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Simple Team Member Creation Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        This test verifies that the team member creation process works correctly and consumes a license.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={runTest}
          disabled={isRunning}
          startIcon={isRunning ? <CircularProgress size={20} /> : null}
          sx={{ mr: 2 }}
        >
          {isRunning ? 'Running Test...' : 'Run Test'}
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setTestResults([])}
          disabled={isRunning}
        >
          Clear Results
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Test Results
      </Typography>

      {testResults.length === 0 && !isRunning && (
        <Alert severity="info">Click "Run Test" to start the test.</Alert>
      )}

      {testResults.map((result, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                {result.step}
              </Typography>
              {result.status === 'pending' && <CircularProgress size={20} />}
              {result.status === 'success' && <Typography color="success.main">✅</Typography>}
              {result.status === 'error' && <Typography color="error.main">❌</Typography>}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {result.message}
            </Typography>
            {result.data && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" component="pre" sx={{ 
                  backgroundColor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      <Paper elevation={2} sx={{ mt: 3, p: 2, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Test Email
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {testEmail}
        </Typography>
      </Paper>
    </Box>
  );
};

export default TestTeamMemberCreationSimple;
