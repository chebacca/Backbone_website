import React from 'react';
import { Box, Container, Typography, Divider, Link } from '@mui/material';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

const POLICY_VERSION = '1.0';
const POLICY_EFFECTIVE_DATE = '2025-08-10';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Version {POLICY_VERSION} — Effective {POLICY_EFFECTIVE_DATE}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" sx={{ mb: 2 }}>
          This Privacy Policy explains how Backbone Logic, Inc. ("Backbone Logic", "we", "us") collects, uses,
          and protects personal information in connection with our Services. By using our Services, you agree to this
          Policy.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Information We Collect</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We collect account information, billing details, device and usage data, and customer support
          communications. Some data is collected via cookies or similar technologies. See our Cookie Policy for
          details.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>How We Use Information</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We use personal data to provide and improve the Services, process payments, ensure security, comply with
          legal obligations, and communicate with you. We may use aggregated or de-identified data for analytics.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Sharing</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We share data with service providers (e.g., hosting, payments, email) under contracts requiring appropriate
          safeguards. We may also share as required by law or to protect rights and safety.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Security</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We implement reasonable technical and organizational measures to protect personal data. However, no system
          is completely secure.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Your Rights</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Depending on your location, you may have rights to access, correct, delete, or restrict processing of your
          personal data. Contact us at <Link href="mailto:privacy@backbone-logic.com">privacy@backbone-logic.com</Link>.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>International Transfers</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Where applicable, we rely on appropriate safeguards for cross-border transfers, such as standard contractual
          clauses.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Changes</Typography>
        <Typography variant="body1" sx={{ mb: 6 }}>
          We may update this Policy. Material changes will be notified in-app or via email. Continued use after
          changes become effective constitutes acceptance.
        </Typography>
      </Container>
      <Footer />
    </Box>
  );
};

export default PrivacyPolicyPage;


