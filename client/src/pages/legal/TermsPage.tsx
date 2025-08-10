import React from 'react';
import { Box, Container, Typography, Link, List, ListItem, Divider } from '@mui/material';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';

const TERMS_VERSION = '1.0';
const TERMS_EFFECTIVE_DATE = '2025-08-10';

const TermsPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Version {TERMS_VERSION} — Effective {TERMS_EFFECTIVE_DATE}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" sx={{ mb: 2 }}>
          These Terms of Service ("Terms") govern your access to and use of the products and services
          provided by Backbone Logic, Inc. ("Backbone Logic", "we", "us", or "our"). By creating an account,
          accessing, or using our SaaS platform, you agree to be bound by these Terms.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>1. Accounts and Eligibility</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You must be at least 18 years old to use the Services. You are responsible for maintaining the
          confidentiality of your account credentials and for all activities that occur under your account. You agree
          to provide accurate information and to promptly update it as needed.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>2. Subscriptions and Billing</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Access to paid features is provided on a subscription basis. Plan details, pricing, and seat limits are
          shown at checkout and on our pricing page. By subscribing, you authorize us (and our payment processors)
          to charge your payment method according to your selected plan and billing cycle until you cancel.
        </Typography>
        <List dense sx={{ listStyle: 'disc', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>Taxes may be added where required by law.</ListItem>
          <ListItem sx={{ display: 'list-item' }}>You can cancel at any time; access continues until the end of the current billing period unless otherwise stated.</ListItem>
          <ListItem sx={{ display: 'list-item' }}>Seat counts and usage-based fees may adjust charges in the next invoice.</ListItem>
          <ListItem sx={{ display: 'list-item' }}>Failed payments may result in suspension or termination.</ListItem>
        </List>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>3. License and Acceptable Use</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Subject to these Terms, we grant you a limited, non-exclusive, non-transferable license to access and use
          the Services for your internal business purposes. You agree not to:
        </Typography>
        <List dense sx={{ listStyle: 'disc', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>reverse engineer, decompile, or attempt to derive source code;</ListItem>
          <ListItem sx={{ display: 'list-item' }}>bypass security controls or access data without authorization;</ListItem>
          <ListItem sx={{ display: 'list-item' }}>use the Services to transmit malware, spam, or illegal content;</ListItem>
          <ListItem sx={{ display: 'list-item' }}>resell, sublicense, or provide the Services to third parties except as expressly permitted.</ListItem>
        </List>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>4. Customer Data and Privacy</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You retain ownership of your content and data. We process personal data in accordance with our
          <Link href="/privacy" sx={{ ml: 0.5 }}>Privacy Policy</Link>. You are responsible for obtaining all necessary
          consents from your end users and for complying with applicable laws.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>5. Intellectual Property</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          The Services, including software, documentation, and all related IP, are owned by Backbone Logic or its
          licensors. Feedback you provide may be used by us without restriction.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>6. Service Levels and Support</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Service level targets for uptime and support response may be described in our
          <Link href="/sla" sx={{ ml: 0.5 }}>Service Level Agreement</Link>. Remedies are limited to the credits or
          measures described therein.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>7. Term, Suspension, and Termination</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          These Terms remain in effect while you use the Services. We may suspend or terminate access for breach,
          suspected fraud, security risk, failure to pay, or as required by law. Upon termination, you must cease
          all use and, if applicable, uninstall software components.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>8. Warranties and Disclaimers</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE". TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM
          ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>9. Limitation of Liability</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL BACKBONE LOGIC BE LIABLE FOR INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, GOODWILL, OR DATA. OUR AGGREGATE
          LIABILITY SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO US FOR THE SERVICES IN THE 12 MONTHS PRECEDING THE CLAIM.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>10. Indemnification</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You will defend, indemnify, and hold harmless Backbone Logic and its affiliates from and against any
          claims, damages, liabilities, costs, and expenses arising from your use of the Services or your breach of
          these Terms.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>11. Changes to the Services or Terms</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We may modify the Services or these Terms. For material changes, we will provide notice (e.g., via the app
          or email). Continued use after changes become effective constitutes acceptance of the updated Terms.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>12. Governing Law; Dispute Resolution</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          These Terms are governed by the laws of the State of Delaware, without regard to conflicts of law rules.
          Any dispute will be resolved in the state or federal courts located in Delaware, and you consent to the
          jurisdiction of such courts.
        </Typography>

        <Typography variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1 }}>13. Contact</Typography>
        <Typography variant="body1" sx={{ mb: 6 }}>
          Questions? Contact us at <Link href="mailto:legal@backbone-logic.com">legal@backbone-logic.com</Link>.
        </Typography>
      </Container>
      <Footer />
    </Box>
  );
};

export default TermsPage;


