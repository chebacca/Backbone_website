import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  Payment,
  CheckCircle,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/context/LoadingContext';
import { useSnackbar } from 'notistack';
import { paymentService, PricingTier } from '@/services/paymentService';
import { Navigation } from '@/components/layout/Navigation';
import { PlanSelectionStep } from '@/components/checkout/PlanSelectionStep';
import { BillingDetailsStep } from '@/components/checkout/BillingDetailsStep';
import { PaymentMethodStep } from '@/components/checkout/PaymentMethodStep';
import { OrderSummary } from '@/components/checkout/OrderSummary';

const steps = [
  { label: 'Select Plan', icon: <ShoppingCart /> },
  { label: 'Billing Details', icon: <Payment /> },
  { label: 'Payment Method', icon: <Payment /> },
  { label: 'Confirmation', icon: <CheckCircle /> },
];

interface CheckoutData {
  tier: string;
  seats: number;
  isYearly: boolean;
  billingAddress: any;
  taxInformation: any;
  businessProfile: any;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  paymentMethodId?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { enqueueSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    tier: location.state?.tier || 'PRO',
    seats: 1,
    isYearly: location.state?.isYearly || false,
    billingAddress: {},
    taxInformation: {},
    businessProfile: {},
    acceptTerms: false,
    acceptPrivacy: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [taxCalculation, setTaxCalculation] = useState<any>(null);

  useEffect(() => {
    loadPricingTiers();
  }, []);

  const loadPricingTiers = async () => {
    try {
      const tiers = await paymentService.getPricingTiers();
      setPricingTiers(tiers);
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to load pricing', { variant: 'error' });
    }
  };

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...updates }));
  };

  const calculateTax = async () => {
    if (!checkoutData.billingAddress.country) return;

    try {
      const selectedTier = pricingTiers.find(t => t.id === checkoutData.tier);
      if (!selectedTier || !selectedTier.price) return;

      const amount = selectedTier.price * checkoutData.seats;
      
      const calculation = await paymentService.calculateTax({
        amount,
        billingAddress: checkoutData.billingAddress,
        userType: checkoutData.businessProfile.companyName ? 'business' : 'individual',
      });

      setTaxCalculation(calculation);
    } catch (error: any) {
      console.warn('Tax calculation failed:', error.message);
    }
  };

  useEffect(() => {
    if (activeStep >= 1) {
      calculateTax();
    }
  }, [checkoutData.billingAddress, checkoutData.tier, checkoutData.seats, activeStep]);

  const handleNext = () => {
    setError(null);
    
    // Validate current step
    switch (activeStep) {
      case 0:
        if (!checkoutData.tier) {
          setError('Please select a plan');
          return;
        }
        break;
      case 1:
        const addressValidation = paymentService.validateBillingAddress(checkoutData.billingAddress);
        if (!addressValidation.valid) {
          setError(addressValidation.errors.join(', '));
          return;
        }
        break;
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep(prev => prev - 1);
  };

  const handleComplete = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await paymentService.createSubscription({
        tier: checkoutData.tier,
        seats: checkoutData.seats,
        paymentMethodId,
        billingAddress: checkoutData.billingAddress,
        taxInformation: checkoutData.taxInformation,
        businessProfile: checkoutData.businessProfile,
      });

      enqueueSnackbar('Subscription created successfully!', { variant: 'success' });
      navigate('/dashboard', { 
        state: { 
          subscriptionCreated: true,
          subscription: result.subscription 
        } 
      });
    } catch (error: any) {
      setError(error.message || 'Payment failed. Please try again.');
      enqueueSnackbar(error.message || 'Payment failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selectedTier = pricingTiers.find(t => t.id === checkoutData.tier);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <PlanSelectionStep
            pricingTiers={pricingTiers}
            selectedTier={checkoutData.tier}
            seats={checkoutData.seats}
            isYearly={checkoutData.isYearly}
            onUpdate={updateCheckoutData}
          />
        );
      case 1:
        return (
          <BillingDetailsStep
            billingAddress={checkoutData.billingAddress}
            taxInformation={checkoutData.taxInformation}
            businessProfile={checkoutData.businessProfile}
            acceptTerms={checkoutData.acceptTerms}
            acceptPrivacy={checkoutData.acceptPrivacy}
            onUpdate={updateCheckoutData}
          />
        );
      case 2:
        return (
          <PaymentMethodStep
            checkoutData={checkoutData}
            taxCalculation={taxCalculation}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Navigation />
        <Container maxWidth="md" sx={{ pt: 12, pb: 8 }}>
          <Alert severity="warning">
            Please sign in to continue with checkout.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      
      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: 8 }}>
        <Box>
          {/* Back Button */}
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/pricing')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                },
              }}
            >
              Back to Pricing
            </Button>
          </Box>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                mb: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Complete Your Purchase
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Join thousands of professionals using BackboneLogic, Inc.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid item xs={12} lg={8}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  backgroundColor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Stepper */}
                <Stepper
                  activeStep={activeStep}
                  sx={{
                    mb: 4,
                    '& .MuiStepLabel-root': {
                      color: 'text.secondary',
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: 'primary.main',
                    },
                    '& .MuiStepLabel-label.Mui-completed': {
                      color: 'success.main',
                    },
                  }}
                >
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        StepIconComponent={({ active, completed }) => (
                          <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: completed ? 'success.main' : active ? 'primary.main' : 'rgba(255, 255, 255, 0.1)', color: completed || active ? '#000' : 'text.secondary', }} >
                            {step.icon}
                          </Box>
                        )}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Step Content */}
                <Box sx={{ mb: 4 }}>
                  {renderStepContent()}
                </Box>

                {/* Navigation Buttons */}
                {activeStep < 2 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ArrowBack />}
                    >
                      Back
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForward />}
                      sx={{
                        background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                        color: '#000',
                      }}
                    >
                      {activeStep === steps.length - 1 ? 'Complete Order' : 'Continue'}
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} lg={4}>
              <OrderSummary
                selectedTier={selectedTier}
                seats={checkoutData.seats}
                isYearly={checkoutData.isYearly}
                taxCalculation={taxCalculation}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default CheckoutPage;
