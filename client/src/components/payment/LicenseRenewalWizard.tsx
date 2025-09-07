/**
 * 🔄 License Renewal Wizard - Complete Renewal Flow
 * 
 * Step-by-step renewal guide that takes users through the entire renewal process
 * with Stripe integration, invoice generation, and license extension.
 * 
 * Features:
 * - Multi-step renewal wizard
 * - Automatic license selection for expiring licenses
 * - Stripe payment processing
 * - Real-time payment validation
 * - Invoice generation and receipt
 * - License extension upon successful payment
 * - Subscription renewal with extended expiration dates
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Refresh,
  CreditCard,
  Receipt,
  CheckCircle,
  Warning,
  Info,
  Security,
  Star,
  People,
  Business,
  Email,
  Phone,
  LocationOn,
  ArrowBack,
  ArrowForward,
  Close,
  Lock,
  Verified,
  Download,
  Key,
  Schedule,
  CalendarToday,
  Assignment,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { StreamlinedLicense } from '@/services/UnifiedDataService';

// ============================================================================
// TYPES
// ============================================================================

interface RenewalStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

interface RenewalPlan {
  id: string;
  name: string;
  tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  price: number;
  duration: number; // months
  discount?: number; // percentage discount for renewals
}

interface RenewalData {
  selectedLicenses: StreamlinedLicense[];
  renewalPlan: RenewalPlan;
  duration: number; // months
  total: number;
  tax: number;
  subtotal: number;
  discount: number;
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface LicenseRenewalWizardProps {
  open: boolean;
  onClose: () => void;
  expiringLicenses: StreamlinedLicense[];
  onRenewalComplete: (result: {
    licenses: any[];
    invoice: any;
    subscription: any;
  }) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RENEWAL_PLANS: RenewalPlan[] = [
  {
    id: 'basic-renewal',
    name: 'Basic Renewal',
    tier: 'BASIC',
    price: 29,
    duration: 12,
    discount: 10, // 10% renewal discount
  },
  {
    id: 'professional-renewal',
    name: 'Professional Renewal',
    tier: 'PROFESSIONAL',
    price: 99,
    duration: 12,
    discount: 15, // 15% renewal discount
  },
  {
    id: 'enterprise-renewal',
    name: 'Enterprise Renewal',
    tier: 'ENTERPRISE',
    price: 199,
    duration: 12,
    discount: 20, // 20% renewal discount
  },
];

const RENEWAL_STEPS: RenewalStep[] = [
  {
    id: 'license-selection',
    label: 'Select Licenses',
    description: 'Choose which licenses to renew',
    completed: false,
  },
  {
    id: 'renewal-options',
    label: 'Renewal Options',
    description: 'Select renewal duration and plan',
    completed: false,
  },
  {
    id: 'payment',
    label: 'Payment',
    description: 'Complete your renewal payment',
    completed: false,
  },
  {
    id: 'confirmation',
    label: 'Confirmation',
    description: 'Review and activate renewed licenses',
    completed: false,
  },
];

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const calculateExpirationDate = (currentExpiry: Date, extensionMonths: number): Date => {
  const newDate = new Date(currentExpiry);
  newDate.setMonth(newDate.getMonth() + extensionMonths);
  return newDate;
};

const getAuthToken = async (): Promise<string> => {
  // Get Firebase auth token
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return await user.getIdToken();
};

// ============================================================================
// PAYMENT FORM COMPONENT
// ============================================================================

const RenewalPaymentForm: React.FC<{
  renewalData: RenewalData;
  onPaymentSuccess: (paymentMethod: any) => void;
  onPaymentError: (error: string) => void;
  processing: boolean;
}> = ({ renewalData, onPaymentSuccess, onPaymentError, processing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onPaymentError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError('Card element not found. Please refresh and try again.');
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${renewalData.billingAddress.firstName} ${renewalData.billingAddress.lastName}`,
          email: renewalData.billingAddress.email,
          phone: renewalData.billingAddress.phone,
          address: {
            line1: renewalData.billingAddress.address,
            city: renewalData.billingAddress.city,
            state: renewalData.billingAddress.state,
            postal_code: renewalData.billingAddress.zipCode,
            country: renewalData.billingAddress.country,
          },
        },
      });

      if (error) {
        onPaymentError(error.message || 'Payment method creation failed');
        return;
      }

      onPaymentSuccess(paymentMethod);
    } catch (error: any) {
      onPaymentError(error.message || 'An unexpected error occurred');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCard /> Payment Details
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
              onChange={(event) => {
                setCardComplete(event.complete);
                setCardError(event.error?.message || null);
              }}
            />
            {cardError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {cardError}
              </Typography>
            )}
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your payment is secured by Stripe. We never store your card information.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={!stripe || !cardComplete || processing}
        startIcon={processing ? <CircularProgress size={20} /> : <Lock />}
        sx={{
          py: 1.5,
          background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
          color: '#000',
          fontWeight: 600,
          '&:disabled': {
            background: '#ccc',
          },
        }}
      >
        {processing ? 'Processing...' : `Renew Licenses - ${formatCurrency(renewalData.total)}`}
      </Button>
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LicenseRenewalWizard: React.FC<LicenseRenewalWizardProps> = ({
  open,
  onClose,
  expiringLicenses,
  onRenewalComplete,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<RenewalStep[]>(RENEWAL_STEPS);
  const [processing, setProcessing] = useState(false);
  
  // Renewal data
  const [selectedLicenses, setSelectedLicenses] = useState<StreamlinedLicense[]>([]);
  const [renewalDuration, setRenewalDuration] = useState(12); // months

  // Initialize with all expiring licenses selected
  useEffect(() => {
    if (expiringLicenses.length > 0) {
      setSelectedLicenses(expiringLicenses);
    }
  }, [expiringLicenses]);

  // Computed values
  const renewalData = useMemo((): RenewalData => {
    if (selectedLicenses.length === 0) {
      return {
        selectedLicenses: [],
        renewalPlan: RENEWAL_PLANS[1], // default to professional
        duration: renewalDuration,
        total: 0,
        tax: 0,
        subtotal: 0,
        discount: 0,
        billingAddress: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      };
    }

    // Group licenses by tier to calculate pricing
    const licensesByTier = selectedLicenses.reduce((acc, license) => {
      acc[license.tier] = (acc[license.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let subtotal = 0;
    let totalDiscount = 0;

    // Calculate pricing for each tier
    Object.entries(licensesByTier).forEach(([tier, count]) => {
      const plan = RENEWAL_PLANS.find(p => p.tier === tier) || RENEWAL_PLANS[1];
      const tierSubtotal = plan.price * count;
      const tierDiscount = tierSubtotal * (plan.discount || 0) / 100;
      
      subtotal += tierSubtotal;
      totalDiscount += tierDiscount;
    });

    const discountedSubtotal = subtotal - totalDiscount;
    const tax = discountedSubtotal * 0.08; // 8% tax
    const total = discountedSubtotal + tax;

    return {
      selectedLicenses,
      renewalPlan: RENEWAL_PLANS[1], // This could be dynamic based on selection
      duration: renewalDuration,
      total,
      tax,
      subtotal,
      discount: totalDiscount,
      billingAddress: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    };
  }, [selectedLicenses, renewalDuration]);

  // Step navigation
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const newSteps = [...steps];
      newSteps[activeStep].completed = true;
      setSteps(newSteps);
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleClose = () => {
    if (!processing) {
      onClose();
      // Reset form
      setActiveStep(0);
      setSelectedLicenses([]);
      setSteps(RENEWAL_STEPS.map(step => ({ ...step, completed: false })));
    }
  };

  // Validation functions
  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // License selection
        return selectedLicenses.length > 0;
      case 1: // Renewal options
        return renewalDuration > 0;
      case 2: // Payment
        return true; // Handled by Stripe validation
      default:
        return true;
    }
  };

  // Payment processing
  const handlePaymentSuccess = async (paymentMethod: any) => {
    setProcessing(true);
    
    try {
      console.log('🔄 [LicenseRenewalWizard] Processing renewal payment with method:', paymentMethod.id);
      
      // Call backend to process the renewal
      const response = await fetch('/api/licenses/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          licenseIds: selectedLicenses.map(l => l.id),
          duration: renewalDuration,
          paymentMethodId: paymentMethod.id,
          total: renewalData.total,
        }),
      });

      if (!response.ok) {
        throw new Error('Renewal processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Mark payment step as completed
        const newSteps = [...steps];
        newSteps[3].completed = true;
        setSteps(newSteps);
        
        // Move to confirmation step
        setActiveStep(4);
        
        enqueueSnackbar(
          `Successfully renewed ${selectedLicenses.length} license(s)!`,
          { variant: 'success' }
        );

        // Call completion handler
        onRenewalComplete(result.data);
      } else {
        throw new Error(result.error || 'Renewal failed');
      }
    } catch (error: any) {
      console.error('❌ [LicenseRenewalWizard] Renewal error:', error);
      enqueueSnackbar(
        error.message || 'Failed to process renewal. Please try again.',
        { variant: 'error' }
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    enqueueSnackbar(error, { variant: 'error' });
    setProcessing(false);
  };

  // License selection handlers
  const handleLicenseToggle = (license: StreamlinedLicense) => {
    setSelectedLicenses(prev => {
      const isSelected = prev.some(l => l.id === license.id);
      if (isSelected) {
        return prev.filter(l => l.id !== license.id);
      } else {
        return [...prev, license];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLicenses.length === expiringLicenses.length) {
      setSelectedLicenses([]);
    } else {
      setSelectedLicenses(expiringLicenses);
    }
  };

  // ============================================================================
  // RENDER STEP CONTENT
  // ============================================================================

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // License Selection
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Select Licenses to Renew
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Expiring Licenses Found</AlertTitle>
              We found {expiringLicenses.length} license(s) that will expire within the next 30 days.
              Select which licenses you'd like to renew.
            </Alert>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedLicenses.length === expiringLicenses.length}
                    indeterminate={selectedLicenses.length > 0 && selectedLicenses.length < expiringLicenses.length}
                    onChange={handleSelectAll}
                  />
                }
                label={`Select All (${expiringLicenses.length} licenses)`}
              />
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Select</TableCell>
                    <TableCell>License</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Renewal Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiringLicenses.map((license) => {
                    const isSelected = selectedLicenses.some(l => l.id === license.id);
                    const renewalPlan = RENEWAL_PLANS.find(p => p.tier === license.tier) || RENEWAL_PLANS[1];
                    const discountedPrice = renewalPlan.price * (1 - (renewalPlan.discount || 0) / 100);
                    
                    return (
                      <TableRow key={license.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleLicenseToggle(license)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {license.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {license.key}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={license.tier}
                            color={license.tier === 'ENTERPRISE' ? 'secondary' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {license.assignedTo ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24 }}>
                                {license.assignedTo.name?.charAt(0) || '?'}
                              </Avatar>
                              <Typography variant="body2">
                                {license.assignedTo.name || license.assignedTo.email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Unassigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="warning.main"
                            sx={{ fontWeight: 500 }}
                          >
                            {new Date(license.expiresAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatCurrency(discountedPrice)}
                            </Typography>
                            {renewalPlan.discount && (
                              <Typography variant="caption" color="success.main">
                                {renewalPlan.discount}% renewal discount
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedLicenses.length > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {selectedLicenses.length} license(s) selected for renewal.
                  Total: {formatCurrency(renewalData.subtotal - renewalData.discount)}
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 1: // Renewal Options
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Renewal Options
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Renewal Duration
                    </Typography>
                    
                    <FormControl fullWidth>
                      <InputLabel>Duration</InputLabel>
                      <Select
                        value={renewalDuration}
                        label="Duration"
                        onChange={(e) => setRenewalDuration(Number(e.target.value))}
                      >
                        <MenuItem value={6}>6 Months</MenuItem>
                        <MenuItem value={12}>12 Months (Recommended)</MenuItem>
                        <MenuItem value={24}>24 Months (Best Value)</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Longer renewals offer better value and fewer interruptions.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Renewal Summary
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Licenses to Renew"
                          secondary={`${selectedLicenses.length} licenses`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Renewal Duration"
                          secondary={`${renewalDuration} months`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="New Expiration Date"
                          secondary={selectedLicenses.length > 0 
                            ? calculateExpirationDate(new Date(selectedLicenses[0].expiresAt), renewalDuration).toLocaleDateString()
                            : 'N/A'
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Pricing Breakdown
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatCurrency(renewalData.subtotal)}</Typography>
                </Box>
                
                {renewalData.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="success.main">Renewal Discount:</Typography>
                    <Typography color="success.main">-{formatCurrency(renewalData.discount)}</Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax (8%):</Typography>
                  <Typography>{formatCurrency(renewalData.tax)}</Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">{formatCurrency(renewalData.total)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 2: // Payment
        return (
          <Elements stripe={stripePromise}>
            <RenewalPaymentForm
              renewalData={renewalData}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              processing={processing}
            />
          </Elements>
        );

      case 3: // Confirmation
        return (
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2 }}>
              Renewal Complete!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your {selectedLicenses.length} license(s) have been successfully renewed.
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>What happens next?</AlertTitle>
              <Typography variant="body2">
                • Your licenses have been extended by {renewalDuration} months<br/>
                • A receipt has been sent to your email<br/>
                • Your team can continue using their licenses without interruption
              </Typography>
            </Alert>

            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                color: '#000',
                fontWeight: 600,
              }}
            >
              Done
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Refresh />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              License Renewal
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={processing}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                icon={
                  step.completed ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: index === activeStep ? 'primary.main' : 'grey.300',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
                    </Box>
                  )
                }
              >
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ py: 2 }}>
                  {renderStepContent(index)}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      {activeStep < steps.length - 1 && (
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || processing}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid(activeStep) || processing}
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            {activeStep === steps.length - 2 ? 'Proceed to Payment' : 'Next'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default LicenseRenewalWizard;
