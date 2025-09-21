import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ShoppingCart,
  Payment,
  Email,
  CheckCircle,
  ArrowBack,
  Close,
  Security,
  Download,
  Support,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface CartItem {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    fileSize: string;
    version: string;
  };
  quantity: number;
}

interface CheckoutData {
  items: CartItem[];
  type: 'standalone';
}

const steps = ['Review Order', 'Payment', 'Download'];

const StandaloneCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  
  const [activeStep, setActiveStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    if (location.state?.items && location.state?.type === 'standalone') {
      setCheckoutData(location.state as CheckoutData);
    } else {
      navigate('/marketplace');
    }
  }, [location.state, navigate]);

  if (!checkoutData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalAmount = checkoutData.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalItems = checkoutData.items.reduce((total, item) => total + item.quantity, 0);

  const handleNext = () => {
    if (activeStep === 0) {
      // Proceed to payment
      setActiveStep(1);
      handlePayment();
    } else if (activeStep === 1) {
      // Payment completed, proceed to download
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/marketplace');
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create payment intent with Stripe
      const response = await fetch('/api/payments/create-standalone-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          items: checkoutData.items,
          amount: totalAmount,
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setPaymentIntent(data.paymentIntent);
      setShowPaymentDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setSuccess(true);
    setActiveStep(2);
  };

  const handleDownload = (productId: string) => {
    // In a real implementation, this would generate a secure download link
    // For now, we'll simulate the download
    const product = checkoutData.items.find(item => item.product.id === productId);
    if (product) {
      // Simulate download link generation
      const downloadUrl = `https://downloads.backbone-logic.com/standalone/${productId}?token=${Date.now()}`;
      window.open(downloadUrl, '_blank');
    }
  };

  const OrderSummary: React.FC = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCart />
        Order Summary
      </Typography>
      
      <Stack spacing={2}>
        {checkoutData.items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                '& img': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                },
              }}
            >
              <img
                src={item.product.image}
                alt={item.product.name}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {item.product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.product.category} • v{item.product.version}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.product.fileSize}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${item.product.price} × {item.quantity}
              </Typography>
            </Box>
          </Box>
        ))}
        
        <Divider />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Total ({totalItems} items)</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ${totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );

  const PaymentStep: React.FC = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Payment />
        Payment Information
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Secure Payment:</strong> Your payment is processed securely through Stripe. 
              We accept all major credit cards and PayPal.
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            <Security sx={{ color: 'success.main' }} />
            <Typography variant="body2" color="text.secondary">
              SSL encrypted • PCI compliant • 256-bit security
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePayment}
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            Pay ${totalAmount.toFixed(2)} with Stripe
          </Button>
        </Box>
      )}
    </Paper>
  );

  const DownloadStep: React.FC = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Download />
        Download Your Products
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Payment Successful!</strong> Your products are ready for download. 
          You'll also receive an email with download links.
        </Typography>
      </Alert>
      
      <Stack spacing={2}>
        {checkoutData.items.map((item, index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {item.product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    v{item.product.version} • {item.product.fileSize}
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => handleDownload(item.product.id)}
                >
                  Download
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
      
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Important:</strong> Download links are valid for 30 days. 
          Keep your purchase receipt for future downloads.
        </Typography>
      </Box>
    </Paper>
  );

  const PaymentDialog: React.FC = () => (
    <Dialog
      open={showPaymentDialog}
      onClose={() => setShowPaymentDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Complete Payment</Typography>
          <IconButton onClick={() => setShowPaymentDialog(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Redirecting to Stripe Checkout...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You'll be redirected to Stripe's secure payment page to complete your purchase.
          </Typography>
          <CircularProgress />
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pt: 8 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/marketplace')}
            sx={{ mb: 2 }}
          >
            Back to Marketplace
          </Button>
          
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Checkout
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete your purchase of standalone Backbone tools
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Payment Successful!</strong> Your products are ready for download.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {activeStep === 0 && <OrderSummary />}
            {activeStep === 1 && <PaymentStep />}
            {activeStep === 2 && <DownloadStep />}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Order Details
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">${totalAmount.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tax</Typography>
                  <Typography variant="body2">$0.00</Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip icon={<Security />} label="Secure" size="small" color="success" />
                <Chip icon={<Support />} label="Support" size="small" color="primary" />
                <Chip icon={<Email />} label="Email Delivery" size="small" color="info" />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          {activeStep < 2 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || activeStep === 1}
            >
              {activeStep === 0 ? 'Proceed to Payment' : 'Complete Payment'}
            </Button>
          )}
          
          {activeStep === 2 && (
            <Button
              variant="contained"
              onClick={() => navigate('/marketplace')}
              startIcon={<CheckCircle />}
            >
              Continue Shopping
            </Button>
          )}
        </Box>

        {/* Payment Dialog */}
        <PaymentDialog />
      </Container>
    </Box>
  );
};

export default StandaloneCheckoutPage;
