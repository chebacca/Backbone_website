import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

const SLA_VERSION = '1.0';
const SLA_EFFECTIVE_DATE = '2025-08-10';

const SlaPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Service Level Agreement
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Version {SLA_VERSION} — Effective {SLA_EFFECTIVE_DATE}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Uptime Target</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We target 99.9% monthly uptime for production Services, excluding scheduled maintenance and events outside
          of our reasonable control.
        </Typography>

        <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Support</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Support hours and response targets may vary by plan. Priority and Enterprise plans include accelerated
          response times.
        </Typography>

        <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Remedies</Typography>
        <Typography variant="body1" sx={{ mb: 6 }}>
          If uptime falls below target, you may be eligible for service credits as your sole and exclusive remedy,
          subject to the Terms.
        </Typography>
      </Container>
      <Footer />
    </Box>
  );
};

export default SlaPage;


