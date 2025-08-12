import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BridgeAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isBridge = params.get('bridge') === '1';

    const accessToken = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('auth_user');

    if (!accessToken || !userStr) {
      if (isBridge) {
        navigate('/login?bridge=1', { replace: true });
        return;
      }
    }

    try {
      const user = userStr ? JSON.parse(userStr) : null;
      if (window.opener && isBridge) {
        window.opener.postMessage(
          { type: 'BACKBONE_AUTH', payload: { user, tokens: { accessToken, refreshToken } } },
          '*'
        );
        setPosted(true);
        window.close();
      }
    } catch {
      // ignore
    }
  }, [navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        {posted ? 'Sent credentials to the application. You can close this window.' : 'Preparing authentication bridge...'}
      </Typography>
      <Button onClick={() => navigate('/login?bridge=1')} variant="outlined">Go to Login</Button>
    </Box>
  );
};

export default BridgeAuthPage;


