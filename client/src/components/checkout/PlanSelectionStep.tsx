import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Check,
  Star,
  Person,
  Group,
  Business,
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { PricingTier } from '@/services/paymentService';

interface PlanSelectionStepProps {
  pricingTiers: PricingTier[];
  selectedTier: string;
  seats: number;
  isYearly: boolean;
  onUpdate: (updates: any) => void;
}

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  pricingTiers,
  selectedTier,
  seats,
  isYearly,
  onUpdate,
}) => {
  const handleTierSelect = (tierId: string) => {
    const tier = pricingTiers.find(t => t.id === tierId);
    if (!tier) return;

    let newSeats = seats;
    
    // Adjust seats based on tier constraints
    if (tier.id === 'BASIC' && seats > 1) {
      newSeats = 1;
    } else if (tier.id === 'ENTERPRISE' && seats < 10) {
      newSeats = 10;
    }

    onUpdate({ tier: tierId, seats: newSeats });
  };

  const handleSeatsChange = (newSeats: number) => {
    const tier = pricingTiers.find(t => t.id === selectedTier);
    if (!tier) return;

    // Validate seat constraints
    if (tier.id === 'BASIC' && newSeats > 1) return;
    if (tier.id === 'PRO' && newSeats > 50) return;
    if (tier.id === 'ENTERPRISE' && newSeats < 10) return;
    if (newSeats < 1) return;

    onUpdate({ seats: newSeats });
  };

  const getIcon = (tierId: string) => {
    switch (tierId) {
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

  const formatPrice = (tier: PricingTier) => {
    if (!tier.price) return 'Custom';
    
    const price = isYearly ? tier.price * 10 : tier.price; // 2 months free for yearly
    return `$${price}`;
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Choose Your Plan
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select the plan that best fits your needs. You can change or cancel anytime.
      </Typography>

      {/* Billing Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Paper
          elevation={2}
          sx={{
            display: 'inline-flex',
            p: 0.5,
            backgroundColor: 'background.paper',
            borderRadius: 4,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isYearly}
                onChange={(e) => onUpdate({ isYearly: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  Annual billing
                </Typography>
                <Chip
                  label="Save 17%"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            }
            sx={{ m: 1 }}
          />
        </Paper>
      </Box>

      {/* Plan Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {pricingTiers.map((tier) => (
          <Grid item xs={12} md={4} key={tier.id}>
            <Box >
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  backgroundColor: tier.id === selectedTier 
                    ? 'primary.dark' 
                    : 'background.paper',
                  border: tier.id === selectedTier 
                    ? '2px solid' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderColor: tier.id === selectedTier ? 'primary.main' : undefined,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => handleTierSelect(tier.id)}
              >
                {tier.popular && (
                  <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', }} >
                    <Chip
                      icon={<Star />}
                      label="Most Popular"
                      color="primary"
                      sx={{ fontWeight: 600, color: '#000' }}
                    />
                  </Box>
                )}

                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: tier.id === selectedTier ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: 'primary.main', }} >
                      {getIcon(tier.id)}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {tier.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tier.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {formatPrice(tier)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tier.price ? (isYearly ? '/year' : '/month') : 'Contact Sales'}
                      </Typography>
                    </Box>

                    {tier.maxSeats && (
                      <Typography variant="body2" color="text.secondary">
                        Up to {tier.maxSeats} {tier.maxSeats === 1 ? 'user' : 'users'}
                      </Typography>
                    )}
                  </Box>

                  <List dense sx={{ p: 0, flexGrow: 1 }}>
                    {tier.features.slice(0, 6).map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Check sx={{ fontSize: 14, color: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontSize: '0.8rem' },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {tier.id === selectedTier && (
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        mt: 2,
                        background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                        color: '#000',
                      }}
                    >
                      Selected
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Seats Selection */}
      {selectedTier && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Number of Seats
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Number of seats"
                type="number"
                value={seats}
                onChange={(e) => handleSeatsChange(parseInt(e.target.value) || 1)}
                inputProps={{
                  min: selectedTier === 'ENTERPRISE' ? 10 : 1,
                  max: selectedTier === 'BASIC' ? 1 : selectedTier === 'PRO' ? 50 : 1000,
                }}
                helperText={
                  selectedTier === 'BASIC' 
                    ? 'Basic plan includes 1 seat only'
                    : selectedTier === 'PRO'
                    ? 'Pro plan supports up to 50 seats'
                    : 'Enterprise plan minimum 10 seats'
                }
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2" color="text.secondary">
                Each seat allows one user to access BackboneLogic, Inc.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};
