/**
 * 💳 Billing Page - Streamlined Version
 * 
 * Clean implementation using only UnifiedDataService with real subscription data.
 * No legacy API calls - pure streamlined architecture with computed billing metrics.
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Menu,
  CircularProgress,
} from '@mui/material';
import {
  CreditCard,
  Receipt,
  Download,
  Edit,
  Add,
  MoreVert,
  CheckCircle,
  Warning,
  Schedule,
  Payment,
  Star,
  Security,
  AccountBalance,
  MonetizationOn,
  ReceiptLong,
  Info,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { 
  useCurrentUser, 
  useOrganizationContext, 
  useUserProjects 
} from '@/hooks/useStreamlinedData';
import { useBillingSummary } from '@/hooks/usePaymentData';
import MetricCard from '@/components/common/MetricCard';

// ============================================================================
// TYPES
// ============================================================================

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'succeeded' | 'cancelled' | 'refunded';
  description: string;
  currency: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    last4: '5555',
    brand: 'Mastercard',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'succeeded':
    case 'paid':
    case 'active':
      return 'success';
    case 'pending':
    case 'processing':
      return 'warning';
    case 'failed':
    case 'cancelled':
    case 'canceled':
      return 'error';
    case 'refunded':
      return 'info';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'succeeded':
    case 'paid':
    case 'active':
      return <CheckCircle />;
    case 'pending':
    case 'processing':
      return <Schedule />;
    case 'failed':
    case 'cancelled':
    case 'canceled':
      return <Warning />;
    case 'refunded':
      return <Receipt />;
    default:
      return <Payment />;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BillingPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // 🚀 STREAMLINED: Use UnifiedDataService with payment data
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { data: projects, loading: projectsLoading, error: projectsError } = useUserProjects();
  
  // 💰 BILLING DATA: Use comprehensive billing summary
  const {
    subscription,
    invoices,
    payments,
    metrics,
    loading: billingLoading,
    error: billingError,
    refetch: refetchBilling
  } = useBillingSummary();

  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('PRO');
  const [seats, setSeats] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Combined loading and error states
  const isLoading = userLoading || orgLoading || projectsLoading || billingLoading;
  const hasError = userError || orgError || projectsError || billingError;

  // 🧮 COMPUTED BILLING DATA: Use real billing data from hooks
  const billingData = useMemo(() => {
    return {
      subscription,
      invoices: invoices || [],
      paymentMethods: mockPaymentMethods, // TODO: Replace with real payment methods
      nextPaymentAmount: metrics.monthlyTotal,
      daysUntilRenewal: metrics.daysUntilRenewal,
    };
  }, [subscription, invoices, metrics]);

  const handleAddPaymentMethod = () => {
    enqueueSnackbar('Payment method added successfully', { variant: 'success' });
    setAddPaymentDialogOpen(false);
  };

  const handleUpgradeSubscription = () => {
    enqueueSnackbar('Subscription updated successfully', { variant: 'success' });
    setUpgradeDialogOpen(false);
  };

  const handleOpenUpgradeDialog = () => {
    if (billingData.subscription) {
      setSeats(billingData.subscription.plan.seats || 1);
      setSelectedPlan(billingData.subscription.plan?.tier || 'PRO');
    }
    setUpgradeDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    enqueueSnackbar(`Downloading invoice ${invoice.number}...`, { variant: 'info' });
  };

  const calculateUpgradePrice = () => {
    const planPrices = { BASIC: 29, PRO: 99, ENTERPRISE: 199 };
    return planPrices[selectedPlan as keyof typeof planPrices] * seats;
  };

  const handleSeatsChange = (newSeats: number) => {
    setSeats(newSeats);
    if (newSeats <= 50) {
      setSelectedPlan('PRO');
    } else {
      setSelectedPlan('ENTERPRISE');
    }
  };

  const getPlanDescription = (plan: string) => {
    const planPrices = { BASIC: 29, PRO: 99, ENTERPRISE: 199 };
    const price = planPrices[plan as keyof typeof planPrices];
    return `${plan} - $${price}/seat/month`;
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Billing Information...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching your subscription and payment details
          </Typography>
        </Box>
      </Box>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (hasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Unable to Load Billing Data</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            We encountered an issue loading your billing information. This could be due to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><Warning fontSize="small" /></ListItemIcon>
              <ListItemText primary="Network connectivity issues" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Security fontSize="small" /></ListItemIcon>
              <ListItemText primary="Authentication token expired" />
            </ListItem>
          </List>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // ============================================================================
  // NO SUBSCRIPTION STATE
  // ============================================================================

  if (!billingData.subscription) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <AlertTitle>No Active Subscription</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You don't have an active subscription yet. Get started with one of our plans:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleOpenUpgradeDialog}>
              Choose Plan
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // ============================================================================
  // MAIN BILLING CONTENT
  // ============================================================================

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Billing & Payments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your subscription, payment methods, and billing history
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Star />}
          onClick={handleOpenUpgradeDialog}
          sx={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
            color: '#000',
            fontWeight: 600,
          }}
        >
          Upgrade Plan
        </Button>
      </Box>

      {/* Billing Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Cost"
            value={formatCurrency(billingData.nextPaymentAmount)}
            icon={<MonetizationOn />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Seats"
            value={metrics.totalSeats}
            icon={<AccountBalance />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Days to Renewal"
            value={billingData.daysUntilRenewal}
            icon={<Schedule />}
            color="warning"
            trend={{ value: Math.max(0, 30 - billingData.daysUntilRenewal), direction: 'down' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Invoices"
            value={metrics.activeInvoices}
            icon={<ReceiptLong />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Subscription Overview */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  label={billingData.subscription?.tier || 'PRO'}
                  color="primary"
                  sx={{ fontWeight: 600, fontSize: '1rem', px: 2, py: 1 }}
                />
                <Chip
                  icon={getStatusIcon(billingData.subscription?.status || 'active')}
                  label={(billingData.subscription?.status || 'ACTIVE').toUpperCase()}
                  color={getStatusColor(billingData.subscription?.status || 'active') as any}
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {formatCurrency(billingData.nextPaymentAmount)} / month
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {metrics.totalSeats} seats • Next payment in {billingData.daysUntilRenewal} days
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Current period: {billingData.subscription?.currentPeriodStart ? new Date(billingData.subscription.currentPeriodStart).toLocaleDateString() : 'N/A'} - {billingData.subscription?.currentPeriodEnd ? new Date(billingData.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Next Payment
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatCurrency(billingData.nextPaymentAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  on {billingData.subscription?.currentPeriodEnd ? new Date(billingData.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Payment Methods */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Payment Methods
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setAddPaymentDialogOpen(true)}
              >
                Add Method
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {billingData.paymentMethods.map((method) => (
                <Card key={method.id} sx={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <CreditCard />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {method.brand} •••• {method.last4}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {method.isDefault && (
                          <Chip label="Default" size="small" color="primary" />
                        )}
                        <IconButton
                          size="small"
                          onClick={(event) => setAnchorEl(event.currentTarget)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Quick Actions
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<Star />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                  onClick={() => setUpgradeDialogOpen(true)}
                >
                  Upgrade Plan
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  Update Billing Info
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  Download All Invoices
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  Billing Security Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Billing History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Billing History
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billingData.invoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                          {invoice.number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(invoice.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {invoice.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(invoice.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(invoice.status)}
                          label={invoice.status.toUpperCase()}
                          color={getStatusColor(invoice.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Download />}
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={addPaymentDialogOpen}
        onClose={() => setAddPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Your payment information is securely processed by Stripe and never stored on our servers.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                placeholder="MM/YY"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVC"
                placeholder="123"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                placeholder="John Doe"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPaymentMethod} variant="contained">
            Add Payment Method
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upgrade Your Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Select Plan</InputLabel>
                <Select
                  value={selectedPlan}
                  label="Select Plan"
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  <MenuItem value="BASIC">{getPlanDescription('BASIC')}</MenuItem>
                  <MenuItem value="PRO">{getPlanDescription('PRO')}</MenuItem>
                  <MenuItem value="ENTERPRISE">{getPlanDescription('ENTERPRISE')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Seats"
                type="number"
                value={seats}
                onChange={(e) => handleSeatsChange(parseInt(e.target.value))}
                inputProps={{ min: 1, max: 100 }}
                helperText="Up to 50 seats: Pro plan. 51+ seats: Enterprise plan."
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">
                Total: {formatCurrency(calculateUpgradePrice())} / month
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpgradeSubscription} variant="contained">
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Method Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          Set as Default
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          Remove
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BillingPage;
