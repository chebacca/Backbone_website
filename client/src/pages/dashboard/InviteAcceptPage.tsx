import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { api, endpoints } from '@/services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const InviteAcceptPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    (async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setStatus('error');
          enqueueSnackbar('Missing invitation token', { variant: 'error' });
          return;
        }
        await api.post(endpoints.organizations.acceptInvitation(), { token });
        setStatus('success');
        enqueueSnackbar('Invitation accepted. License assigned.', { variant: 'success' });
      } catch (err: any) {
        setStatus('error');
        enqueueSnackbar(err?.message || 'Failed to accept invitation', { variant: 'error' });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      {status === 'pending' && (
        <>
          <CircularProgress />
          <Typography variant="body1">Accepting your invitation…</Typography>
        </>
      )}
      {status === 'success' && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>You’re all set!</Typography>
          <Typography variant="body2" color="text.secondary">Your organization access is active.</Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard/team')}>Go to Team</Button>
        </>
      )}
      {status === 'error' && (
        <>
          <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>Unable to accept invitation</Typography>
          <Typography variant="body2" color="text.secondary">Your token may be invalid or expired.</Typography>
          <Button variant="outlined" onClick={() => navigate('/dashboard/team')}>Back to Team</Button>
        </>
      )}
    </Box>
  );
};

export default InviteAcceptPage;


