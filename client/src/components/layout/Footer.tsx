import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  GitHub,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', path: '/#features' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Enterprise', path: '/enterprise' },
        { label: 'Documentation', path: '/documentation' },
        { label: 'API Reference', path: '/documentation' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Careers', path: '/careers' },
        { label: 'Blog', path: '/blog' },
        { label: 'Press', path: '/press' },
        { label: 'Partners', path: '/partners' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', path: '/support' },
        { label: 'Contact Us', path: '/support' },
        { label: 'System Status', path: '/status' },
        { label: 'Security', path: '/security' },
        { label: 'Training', path: '/training' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Cookie Policy', path: '/cookies' },
        { label: 'GDPR', path: '/gdpr' },
        { label: 'Compliance', path: '/compliance' },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: <GitHub />,
      label: 'GitHub',
      url: 'https://github.com/backbonelogic',
    },
    {
      icon: <Twitter />,
      label: 'Twitter',
      url: 'https://twitter.com/backbonelogic',
    },
    {
      icon: <LinkedIn />,
      label: 'LinkedIn',
      url: 'https://linkedin.com/company/backbonelogic',
    },
  ];

  return (
    <Box component="footer" sx={{ backgroundColor: 'background.paper', borderTop: '1px solid rgba(255, 255, 255, 0.1)', pt: { xs: 6, md: 8 }, pb: 3, }} >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, cursor: 'pointer', }} onClick={() => navigate('/')}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: 1, background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, }} >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#000',
                      fontSize: '1.2rem',
                    }}
                  >
                    B
                  </Typography>
                </Box>
                
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  BackboneLogic, Inc.
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                The complete professional platform for video production management,
                collaboration, and delivery. Empowering creators worldwide to build
                better content faster.
              </Typography>

              {/* Contact Info */}
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    support@backbonelogic.com
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    San Francisco, CA
                  </Typography>
                </Box>
              </Stack>

              {/* Social Links */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'text.secondary',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        color: 'primary.main',
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                      },
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <Grid item xs={6} md={2} key={section.title}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                {section.title}
              </Typography>
              
              <Stack spacing={1}>
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    component="button"
                    variant="body2"
                    onClick={() => {
                      if (link.path.startsWith('#') || link.path.startsWith('http')) {
                        return;
                      }
                      navigate(link.path);
                    }}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Section */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, }} >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} BackboneLogic, Inc. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 3 }, alignItems: { xs: 'flex-start', sm: 'center' }, }} >
            <Typography variant="body2" color="text.secondary">
              🔒 SOC 2 Type II Certified
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              🌍 GDPR Compliant
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              ⚡ 99.9% Uptime SLA
            </Typography>
          </Box>
        </Box>

        {/* Additional Legal Info */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', lineHeight: 1.5 }}
          >
            BackboneLogic, Inc. is a registered trademark. This website uses cookies to ensure you get
            the best experience. By continuing to use this site, you accept our use of cookies and
            agree to our Privacy Policy and Terms of Service.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
