import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CreditCard,
  Security,
  Check,
} from '@mui/icons-material';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
// import { paymentService } from '@/services/paymentService';

interface PaymentMethodStepProps {
  checkoutData: any;
  taxCalculation: any;
  onComplete: (paymentMethodId: string) => void;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  checkoutData,
  taxCalculation,
  onComplete,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });

  const selectedTier = React.useMemo(() => {
    // This would normally come from props or a service
    const tiers = {
      BASIC: { name: 'Basic', price: 2900 },
      PRO: { name: 'Pro', price: 9900 },
      ENTERPRISE: { name: 'Enterprise', price: null },
    };
    return tiers[checkoutData.tier as keyof typeof tiers];
  }, [checkoutData.tier]);

  const calculateTotal = () => {
    if (!selectedTier?.price) return 0;
    
    const subtotal = selectedTier.price * checkoutData.seats;
    const taxAmount = taxCalculation?.taxAmount || 0;
    return subtotal + taxAmount;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setError('Card element not found. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${checkoutData.billingAddress.firstName} ${checkoutData.billingAddress.lastName}`,
          email: 'user@example.com', // This would come from user context
          address: {
            line1: checkoutData.billingAddress.addressLine1,
            line2: checkoutData.billingAddress.addressLine2,
            city: checkoutData.billingAddress.city,
            state: checkoutData.billingAddress.state,
            postal_code: checkoutData.billingAddress.postalCode,
            country: checkoutData.billingAddress.country,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment method creation failed');
        return;
      }

      if (!paymentMethod) {
        setError('Failed to create payment method');
        return;
      }

      // Complete the checkout process
      await onComplete(paymentMethod.id);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = Object.values(cardComplete).every(Boolean) && 
                     checkoutData.acceptTerms && 
                     checkoutData.acceptPrivacy;

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      invalid: {
        color: '#f44336',
        iconColor: '#f44336',
      },
    },
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Payment Method
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete your purchase with secure payment processing by Stripe.
      </Typography>

      <Grid container spacing={4}>
        {/* Payment Form */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CreditCard sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Credit Card Information
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Card Number
                  </Typography>
                  <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.2)', }, }} >
                    <CardNumberElement
                      options={cardElementOptions}
                      onChange={(event) => {
                        setCardComplete(prev => ({ ...prev, cardNumber: event.complete }));
                        if (event.error) {
                          setError(event.error.message);
                        } else {
                          setError(null);
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Expiry Date
                  </Typography>
                  <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.2)', }, }} >
                    <CardExpiryElement
                      options={cardElementOptions}
                      onChange={(event) => {
                        setCardComplete(prev => ({ ...prev, cardExpiry: event.complete }));
                        if (event.error) {
                          setError(event.error.message);
                        } else if (error && event.complete) {
                          setError(null);
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    CVC
                  </Typography>
                  <Box sx={{ p: 2, border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.2)', }, }} >
                    <CardCvcElement
                      options={cardElementOptions}
                      onChange={(event) => {
                        setCardComplete(prev => ({ ...prev, cardCvc: event.complete }));
                        if (event.error) {
                          setError(event.error.message);
                        } else if (error && event.complete) {
                          setError(null);
                        }
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={!isFormValid || isProcessing || !stripe}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                      color: '#000',
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  >
                    {isProcessing 
                      ? 'Processing Payment...' 
                      : `Complete Purchase - ${formatCurrency(calculateTotal())}`
                    }
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Security & Trust Indicators */}
        <Grid item xs={12} lg={4}>
          <Box>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Security sx={{ color: 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Secure Payment
                </Typography>
              </Box>

              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check sx={{ fontSize: 18, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="256-bit SSL Encryption"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check sx={{ fontSize: 18, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="PCI DSS Compliant"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check sx={{ fontSize: 18, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="SOC 2 Type II Certified"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check sx={{ fontSize: 18, color: 'success.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="14-Day Money Back Guarantee"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Powered by Stripe
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  {['Visa', 'Mastercard', 'American Express', 'Discover'].map((card) => (
                    <Box key={card} sx={{ px: 1, py: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1, fontSize: '0.75rem', }} >
                      {card}
                    </Box>
                  ))}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Your payment information is never stored on our servers
                </Typography>
              </Box>
            </Paper>

            {/* What Happens Next */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mt: 3,
                backgroundColor: 'background.paper',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                What Happens Next?
              </Typography>

              <List dense>
                <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'primary.main', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, }} >
                      1
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary="Instant License Generation"
                    secondary="Your license keys are generated immediately upon payment"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'primary.main', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, }} >
                      2
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Confirmation"
                    secondary="Receipt and license details sent to your email"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'primary.main', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, }} >
                      3
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary="Dashboard Access"
                    secondary="Manage your licenses and team from your dashboard"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
