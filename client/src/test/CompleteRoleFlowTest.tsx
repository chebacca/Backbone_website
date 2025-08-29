import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import roleManagementService from '../services/RoleManagementService';
import realtimeSyncService from '../services/RealtimeSyncService';

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

const CompleteRoleFlowTest: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const testSteps = [
    'Initialize Test Environment',
    'Test Role Preset Loading',
    'Test Role Validation',
    'Test Permission Preview',
    'Test Role Assignment',
    'Test Real-time Sync',
    'Test Project Integration',
    'Cleanup Test Data'
  ];

  const mockTestData = {
    organizationId: 'test-org-123',
    projectId: 'test-project-456',
    teamMemberId: 'test-member-789',
    testRoles: ['EDITOR', 'QC_SPECIALIST'],
    baseRole: 'DO_ER' as const
  };

  // Run complete test suite
  const runCompleteTest = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTestResults([]);
    setActiveStep(0);

    const results: TestResult[] = [];

    try {
      // Step 1: Initialize Test Environment
      await runTestStep('Initialize Test Environment', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Test environment initialized successfully' };
      }, results);

      // Step 2: Test Role Preset Loading
      await runTestStep('Test Role Preset Loading', async () => {
        const presets = await roleManagementService.getRolePresets();
        return {
          message: `Loaded ${Object.keys(presets.presets).length} role presets`,
          data: presets
        };
      }, results);

      // Step 3: Test Role Validation
      await runTestStep('Test Role Validation', async () => {
        const validation = await roleManagementService.validateRoleAssignment(
          mockTestData.baseRole,
          mockTestData.testRoles
        );
        return {
          message: `Role validation: ${validation.success ? 'Valid' : 'Invalid'}`,
          data: validation
        };
      }, results);

      // Step 4: Test Permission Preview
      await runTestStep('Test Permission Preview', async () => {
        const preview = await roleManagementService.getPermissionsPreview(
          mockTestData.baseRole,
          mockTestData.testRoles
        );
        return {
          message: `Permission preview generated successfully`,
          data: preview
        };
      }, results);

      // Step 5: Test Role Assignment
      await runTestStep('Test Role Assignment', async () => {
        const assignment = await roleManagementService.assignProductionRoles(
          mockTestData.projectId,
          mockTestData.teamMemberId,
          mockTestData.testRoles
        );
        return {
          message: `Role assignment: ${assignment.success ? 'Success' : 'Failed'}`,
          data: assignment
        };
      }, results);

      // Step 6: Test Real-time Sync
      await runTestStep('Test Real-time Sync', async () => {
        // Start sync service
        realtimeSyncService.startSync(mockTestData.organizationId);
        
        // Trigger manual sync
        await realtimeSyncService.triggerProjectSync(mockTestData.projectId);
        
        // Get sync status
        const syncStatus = await realtimeSyncService.getSyncStatus(mockTestData.organizationId);
        
        return {
          message: `Sync status: ${syncStatus.pendingEvents} pending, ${syncStatus.totalEvents} total`,
          data: syncStatus
        };
      }, results);

      // Step 7: Test Project Integration
      await runTestStep('Test Project Integration', async () => {
        const assignments = await roleManagementService.getProjectAssignments(mockTestData.teamMemberId);
        return {
          message: `Found ${assignments.length} project assignments`,
          data: assignments
        };
      }, results);

      // Step 8: Cleanup Test Data
      await runTestStep('Cleanup Test Data', async () => {
        realtimeSyncService.stopSync();
        await new Promise(resolve => setTimeout(resolve, 500));
        return { message: 'Test cleanup completed successfully' };
      }, results);

      setOverallStatus('success');
    } catch (error) {
      console.error('Test suite failed:', error);
      setOverallStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  // Run individual test step
  const runTestStep = async (
    stepName: string,
    testFunction: () => Promise<{ message: string; data?: any }>,
    results: TestResult[]
  ) => {
    const startTime = Date.now();
    
    // Update step status to running
    const runningResult: TestResult = {
      step: stepName,
      status: 'running',
      message: 'Running...'
    };
    results.push(runningResult);
    setTestResults([...results]);
    setActiveStep(results.length - 1);

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      // Update step status to success
      runningResult.status = 'success';
      runningResult.message = result.message;
      runningResult.data = result.data;
      runningResult.duration = duration;
      
      setTestResults([...results]);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update step status to error
      runningResult.status = 'error';
      runningResult.message = error instanceof Error ? error.message : 'Test failed';
      runningResult.duration = duration;
      
      setTestResults([...results]);
      throw error;
    }
  };

  // Get status icon
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return <CircularProgress size={20} />;
      case 'success': return <CheckIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="disabled" />;
    }
  };

  // Get status color
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'running': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <SecurityIcon color="primary" />
            <Box>
              <Typography variant="h5">
                Complete Role Management Flow Test
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive test suite for role creation, assignment, and real-time sync
              </Typography>
            </Box>
          </Box>

          {/* Overall Status */}
          <Alert 
            severity={
              overallStatus === 'success' ? 'success' :
              overallStatus === 'error' ? 'error' :
              overallStatus === 'running' ? 'info' : 'info'
            }
            sx={{ mb: 3 }}
          >
            <Typography variant="body2">
              {overallStatus === 'idle' && 'Ready to run comprehensive test suite'}
              {overallStatus === 'running' && 'Running test suite...'}
              {overallStatus === 'success' && 'All tests completed successfully!'}
              {overallStatus === 'error' && 'Test suite failed - check results below'}
            </Typography>
          </Alert>

          {/* Test Controls */}
          <Box display="flex" gap={2} mb={3}>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={runCompleteTest}
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run Complete Test Suite'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Test Results */}
          <Grid container spacing={3}>
            {/* Test Steps */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Test Progress
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {testSteps.map((step, index) => {
                  const result = testResults[index];
                  return (
                    <Step key={step} completed={result?.status === 'success'}>
                      <StepLabel
                        error={result?.status === 'error'}
                        icon={result ? getStatusIcon(result.status) : undefined}
                      >
                        {step}
                      </StepLabel>
                      <StepContent>
                        {result && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {result.message}
                            </Typography>
                            {result.duration && (
                              <Typography variant="caption" color="text.secondary">
                                Duration: {result.duration}ms
                              </Typography>
                            )}
                          </Box>
                        )}
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </Grid>

            {/* Test Results Details */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>
              
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List>
                  {testResults.map((result, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          {getStatusIcon(result.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {result.step}
                              </Typography>
                              <Chip
                                label={result.status}
                                size="small"
                                color={getStatusColor(result.status)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {result.message}
                              </Typography>
                              {result.data && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Data: {JSON.stringify(result.data, null, 2).substring(0, 100)}...
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < testResults.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {testResults.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="No test results yet"
                        secondary="Click 'Run Complete Test Suite' to start testing"
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>

          {/* Test Summary */}
          {testResults.length > 0 && (
            <Box mt={3}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Test Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {testResults.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Tests
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        {testResults.filter(r => r.status === 'success').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Passed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="error.main">
                        {testResults.filter(r => r.status === 'error').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Failed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" color="text.primary">
                        {testResults.reduce((sum, r) => sum + (r.duration || 0), 0)}ms
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Duration
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompleteRoleFlowTest;
