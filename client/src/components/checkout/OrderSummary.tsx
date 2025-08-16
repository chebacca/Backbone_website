import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Check,
  Star,
  Business,
  Person,
  Group,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { PricingTier } from '@/services/paymentService';

interface OrderSummaryProps {
  selectedTier?: PricingTier;
  seats: number;
  isYearly?: boolean;
  taxCalculation?: any;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedTier,
  seats,
  isYearly = false,
  taxCalculation,
}) => {
  if (!selectedTier) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 100,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3 }}>
          Order Summary
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Please select a plan to see pricing details.
        </Typography>
      </Paper>
    );
  }

  const getIcon = () => {
    switch (selectedTier.id) {
      case 'BASIC':
        return <Person />;
      case 'PRO':
        return <Group />;
      case 'ENTERPRISE':
        return <Business />;
      default:
        return <Person />;
    }
  };

  const calculatePricing = () => {
    if (!selectedTier.price) {
      return { subtotal: 0, discount: 0, total: 0 };
    }

    const monthlyPrice = selectedTier.price * seats;
    let subtotal = monthlyPrice;
    let discount = 0;

    if (isYearly) {
      subtotal = monthlyPrice * 12;
      discount = monthlyPrice * 2; // 2 months free
    }

    const discountedSubtotal = subtotal - discount;
    const taxAmount = taxCalculation?.taxAmount || 0;
    const total = discountedSubtotal + taxAmount;

    return {
      subtotal,
      discount,
      discountedSubtotal,
      taxAmount,
      total,
    };
  };

  const pricing = calculatePricing();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 100,
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, background: selectedTier.popular ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)' : 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', }} >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: selectedTier.popular ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', }} >
              {getIcon()}
            </Box>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedTier.name}
                </Typography>
                {selectedTier.popular && (
                  <Chip
                    size="small"
                    icon={<Star />}
                    label="Popular"
                    color="primary"
                    sx={{ color: '#000' }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {selectedTier.description}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {seats} {seats === 1 ? 'seat' : 'seats'}
            </Typography>
            {isYearly && (
              <Chip
                size="small"
                label="Annual Billing"
                variant="outlined"
                color="success"
              />
            )}
          </Box>
        </Box>

        {/* Pricing Breakdown */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Order Summary
          </Typography>

          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {selectedTier.name} × {seats} seat{seats !== 1 ? 's' : ''}
                {isYearly && ' (12 months)'}
              </Typography>
              <Typography variant="body2">
                {formatCurrency(pricing.subtotal)}
              </Typography>
            </Box>

            {pricing.discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="success.main">
                  Annual discount (2 months free)
                </Typography>
                <Typography variant="body2" color="success.main">
                  -{formatCurrency(pricing.discount)}
                </Typography>
              </Box>
            )}

            {taxCalculation && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  Tax ({taxCalculation.taxJurisdiction})
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(taxCalculation.taxAmount)}
                </Typography>
              </Box>
            )}
          </Stack>

          <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              Total {isYearly ? '(Annual)' : '(Monthly)'}
            </Typography>
            <Typography variant="h6" color="primary.main">
              {formatCurrency(pricing.total)}
            </Typography>
          </Box>

          {isYearly && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Billed annually. Cancel anytime.
            </Typography>
          )}

          {/* Features Preview */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            What's included:
          </Typography>
          
          <List dense sx={{ p: 0 }}>
            {selectedTier.features.slice(0, 5).map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <Check sx={{ fontSize: 16, color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={feature}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { fontSize: '0.875rem' },
                  }}
                />
              </ListItem>
            ))}
            {selectedTier.features.length > 5 && (
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={`+ ${selectedTier.features.length - 5} more features`}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'primary.main',
                    sx: { fontSize: '0.875rem', fontWeight: 500 },
                  }}
                />
              </ListItem>
            )}
          </List>
        </Box>

        {/* Security Notice */}
        <Box sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', }} >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            🔒 Secured by 256-bit SSL encryption<br/>
            💳 PCI DSS compliant payment processing<br/>
            🔄 14-day money-back guarantee
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
