/**
 * Bulk Operations Panel Component
 * 
 * Handles bulk operations for team members including
 * role updates, license assignments, and mass actions.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlaylistAdd,
  PlayArrow,
  Pause,
  Stop,
  CheckCircle,
  Error,
  Warning,
  Info,
  PersonAdd,
  PersonRemove,
  VpnKey,
  AdminPanelSettings,
  Work,
  Group,
  SelectAll,
  Clear,
  Refresh,
  Download,
  Upload,
} from '@mui/icons-material';
import { StreamlinedTeamMember } from '@/services/UnifiedDataService';
import { teamMemberTemplateService, BulkOperation, BulkCriteria } from '@/services/TeamMemberTemplateService';

interface BulkOperationsPanelProps {
  teamMembers: StreamlinedTeamMember[];
  selectedMembers: string[];
  onOperationComplete?: () => void;
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  teamMembers,
  selectedMembers,
  onOperationComplete
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [operationType, setOperationType] = useState<'update_role' | 'assign_license' | 'change_status' | 'bulk_invite'>('update_role');
  const [operationName, setOperationName] = useState('');
  const [operationDescription, setOperationDescription] = useState('');
  const [criteria, setCriteria] = useState<BulkCriteria>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const handleCreateOperation = () => {
    setActiveStep(0);
    setShowDialog(true);
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setProgress(0);

    try {
      const operation = teamMemberTemplateService.createBulkOperation(
        operationName,
        operationDescription,
        operationType as any,
        criteria,
        'current-user',
        'current-user'
      );

      const result = await teamMemberTemplateService.executeBulkOperation(
        operation.id,
        teamMembers,
        (prog) => setProgress(prog)
      );

      setResults(result);
      onOperationComplete?.();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const steps = [
    'Operation Details',
    'Select Members',
    'Configure Settings',
    'Execute Operation'
  ];

  return (
    <Box>
      <Card>
        <CardHeader 
          title="Bulk Operations"
          action={
            <Button
              variant="contained"
              startIcon={<PlaylistAdd />}
              onClick={handleCreateOperation}
            >
              New Operation
            </Button>
          }
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Perform bulk operations on multiple team members at once.
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AdminPanelSettings color="primary" />
                    <Typography variant="h6">Update Roles</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Change roles for multiple members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VpnKey color="primary" />
                    <Typography variant="h6">Assign Licenses</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Assign licenses to multiple members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Work color="primary" />
                    <Typography variant="h6">Change Status</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Update status for multiple members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonAdd color="primary" />
                    <Typography variant="h6">Bulk Invite</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Invite multiple members at once
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bulk Operation Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Bulk Operation</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Operation Details</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Operation Name"
                    value={operationName}
                    onChange={(e) => setOperationName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={operationDescription}
                    onChange={(e) => setOperationDescription(e.target.value)}
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Operation Type</InputLabel>
                    <Select
                      value={operationType}
                      onChange={(e) => setOperationType(e.target.value as any)}
                    >
                      <MenuItem value="update_role">Update Roles</MenuItem>
                      <MenuItem value="assign_license">Assign Licenses</MenuItem>
                      <MenuItem value="change_status">Change Status</MenuItem>
                      <MenuItem value="bulk_invite">Bulk Invite</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Select Members</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Selected Members ({selectedMembers.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teamMembers
                          .filter(m => selectedMembers.includes(m.id))
                          .map(member => (
                            <TableRow key={member.id}>
                              <TableCell>{member.firstName} {member.lastName}</TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>
                                <Chip label={member.role} size="small" />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={member.status} 
                                  size="small"
                                  color={member.status === 'active' ? 'success' : 'default'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box>
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
                    Back
                  </Button>
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Configure Settings</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {operationType === 'update_role' && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>New Role</InputLabel>
                      <Select
                        value={criteria.roles?.[0] || ''}
                        onChange={(e) => setCriteria({...criteria, roles: [e.target.value]})}
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="member">Member</MenuItem>
                        <MenuItem value="viewer">Viewer</MenuItem>
                        <MenuItem value="owner">Owner</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  {operationType === 'assign_license' && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>License Type</InputLabel>
                      <Select
                        value={criteria.licenseTypes?.[0] || ''}
                        onChange={(e) => setCriteria({...criteria, licenseTypes: [e.target.value]})}
                      >
                        <MenuItem value="BASIC">Basic</MenuItem>
                        <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                        <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  {operationType === 'change_status' && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>New Status</InputLabel>
                      <Select
                        value={criteria.statuses?.[0] || ''}
                        onChange={(e) => setCriteria({...criteria, statuses: [e.target.value]})}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Box>
                <Box>
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
                    Back
                  </Button>
                  <Button onClick={handleNext} variant="contained">
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Execute Operation</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This operation will affect {selectedMembers.length} team members.
                    Please review the settings before proceeding.
                  </Alert>
                  
                  {isExecuting && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Executing operation... {progress}%
                      </Typography>
                      <LinearProgress variant="determinate" value={progress} />
                    </Box>
                  )}
                  
                  {results && (
                    <Alert severity={results.failed === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
                      Operation completed: {results.successful} successful, {results.failed} failed
                    </Alert>
                  )}
                </Box>
                <Box>
                  <Button onClick={handleBack} sx={{ mr: 1 }} disabled={isExecuting}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleExecute} 
                    variant="contained"
                    disabled={isExecuting}
                    startIcon={isExecuting ? <Refresh /> : <PlayArrow />}
                  >
                    {isExecuting ? 'Executing...' : 'Execute Operation'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkOperationsPanel;
