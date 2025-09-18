/**
 * Test page for EnhancedInviteTeamMemberDialog
 * Simple test to verify the dialog works without React Error #301
 */

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import SimpleInviteTeamMemberDialog from '@/components/SimpleInviteTeamMemberDialog';

const TestInviteDialog: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'ADMIN'
  };

  const mockOrganization = {
    organization: {
      id: 'test-org-123',
      name: 'Test Organization',
      tier: 'PROFESSIONAL'
    }
  };

  const mockLicenses = [
    {
      id: 'license-1',
      key: 'LIC-001',
      tier: 'PROFESSIONAL',
      status: 'ACTIVE',
      expiresAt: '2025-12-31T00:00:00.000Z'
    }
  ];

  const handleSuccess = (teamMember: any) => {
    console.log('✅ Test: Team member created successfully:', teamMember);
    setDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test Enhanced Invite Team Member Dialog
      </Typography>
      
      <Button
        variant="contained"
        onClick={() => {
          console.log('🔍 Test: Opening dialog');
          setDialogOpen(true);
        }}
        sx={{ mb: 2 }}
      >
        Open Invite Dialog
      </Button>

      <SimpleInviteTeamMemberDialog
        open={dialogOpen}
        onClose={() => {
          console.log('🔍 Test: Closing dialog');
          setDialogOpen(false);
        }}
        onSuccess={handleSuccess}
        currentUser={mockUser}
        organization={mockOrganization}
        availableLicenses={mockLicenses}
      />
    </Box>
  );
};

export default TestInviteDialog;