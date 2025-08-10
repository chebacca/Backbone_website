import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

const CookiePolicyPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Cookie Policy
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" sx={{ mb: 2 }}>
          We use cookies and similar technologies to provide, secure, and improve our Services. Cookies help us
          remember your preferences, maintain session security, and analyze usage.
        </Typography>

        <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Types of Cookies</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          - Strictly necessary cookies for core functionality (e.g., authentication).<br />
          - Performance and analytics cookies to measure usage and improve features.<br />
          - Preference cookies to remember settings.
        </Typography>

        <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Your Choices</Typography>
        <Typography variant="body1" sx={{ mb: 6 }}>
          You can control cookies through your browser settings. Disabling certain cookies may impact functionality.
        </Typography>
      </Container>
      <Footer />
    </Box>
  );
};

export default CookiePolicyPage;


