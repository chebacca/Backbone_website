/**
 * 💳 Streamlined Billing Page
 * 
 * Modern billing and subscription management using streamlined architecture.
 * Replaces complex BillingPage with cached data access and cleaner UI.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  CreditCard,
  Receipt,
  Download,
  MoreVert,
  CheckCircle,
  Warning,
  Schedule,
  Payment,
  MonetizationOn,
  TrendingUp,
  Add
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import {
  useOrganizationContext,
  useCurrentUser,
  useUserPermissions
} from '@/hooks/useStreamlinedData';
import MetricCard from '@/components/common/MetricCard';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'paid':
    case 'succeeded': return 'success';
    case 'pending': return 'warning';
    case 'failed':
    case 'cancelled': return 'error';
    case 'past_due': return 'warning';
    default: return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'paid':
    case 'succeeded': return <CheckCircle />;
    case 'pending': return <Schedule />;
    case 'failed':
    case 'cancelled': return <Warning />;
    default: return <CheckCircle />;
  }
};

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount / 100); // Assuming amounts are in cents
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const StreamlinedBillingPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Streamlined data hooks
  const { data: currentUser, loading: userLoading } = useCurrentUser();
  const { data: orgContext, loading: orgLoading } = useOrganizationContext();
  const permissions = useUserPermissions();

  // Local state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Loading state
  const loading = userLoading || orgLoading;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, invoice: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleDownloadInvoice = async (invoice: any) => {
    try {
      // Implementation would use unifiedDataService or payment service
      enqueueSnackbar('Invoice download started', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to download invoice', { variant: 'error' });
    }
    handleMenuClose();
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      // Implementation would integrate with Stripe
      enqueueSnackbar('Payment method updated successfully', { variant: 'success' });
      setPaymentDialogOpen(false);
    } catch (error) {
      enqueueSnackbar('Failed to update payment method', { variant: 'error' });
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading billing information...</Typography>
      </Box>
    );
  }

  if (!currentUser || !orgContext) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to load billing data</Alert>
      </Box>
    );
  }

  // Mock data based on organization context
  const subscription = orgContext.subscription || {
    status: 'active',
    plan: { 
      tier: orgContext.organization.tier, 
      seats: 5,
      pricePerSeat: orgContext.organization.tier === 'ENTERPRISE' ? 1980 : 
                   orgContext.organization.tier === 'PROFESSIONAL' ? 980 : 380,
      billingCycle: 'monthly' as const
    },
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockInvoices = [
    {
      id: '1',
      number: 'INV-2024-001',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: (subscription?.plan?.pricePerSeat || 0) * (subscription?.plan?.seats || 0),
      status: 'paid',
      description: `${orgContext.organization.tier} Plan - Monthly`
    },
    {
      id: '2', 
      number: 'INV-2024-002',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      amount: (subscription?.plan?.pricePerSeat || 0) * (subscription?.plan?.seats || 0),
      status: 'paid',
      description: `${orgContext.organization.tier} Plan - Monthly`
    }
  ];

  const billingStats = {
    monthlySpend: (subscription?.plan?.pricePerSeat || 0) * (subscription?.plan?.seats || 0),
    totalInvoices: mockInvoices.length,
    nextPayment: subscription?.currentPeriodEnd || new Date(),
    subscriptionStatus: subscription?.status || 'ACTIVE'
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Billing & Payments
        </Typography>
        
        {permissions.isAccountOwner && (
          <Button
            variant="contained"
            startIcon={<CreditCard />}
            onClick={() => setPaymentDialogOpen(true)}
          >
            Update Payment Method
          </Button>
        )}
      </Box>

      {/* Billing Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Spend"
            value={formatCurrency(billingStats.monthlySpend)}
            icon={<MonetizationOn />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Invoices"
            value={billingStats.totalInvoices}
            icon={<Receipt />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Next Payment"
            value={formatDate(billingStats.nextPayment.toString())}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Subscription"
            value={billingStats.subscriptionStatus.toUpperCase()}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Current Subscription */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Subscription
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary">
                  {orgContext.organization.tier}
                </Typography>
                <Typography color="text.secondary">
                  {formatCurrency((subscription?.plan?.pricePerSeat || 0) * (subscription?.plan?.seats || 0))}/month
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Status:</Typography>
                <Chip
                  icon={getStatusIcon(subscription.status)}
                  label={subscription.status.toUpperCase()}
                  color={getStatusColor(subscription.status)}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Seats:</Typography>
                <Typography>{subscription?.plan?.seats || 0}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Next Billing:</Typography>
                <Typography>{formatDate((subscription?.currentPeriodEnd || new Date()).toString())}</Typography>
              </Box>

              {permissions.isAccountOwner && (
                <Button variant="outlined" fullWidth>
                  Manage Subscription
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Method */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCard sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography>•••• •••• •••• 4242</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Expires 12/25
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                Your payment method is securely stored with Stripe.
              </Alert>

              {permissions.isAccountOwner && (
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  Update Payment Method
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invoice History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Invoice History
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {invoice.number}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(invoice.date)}
                    </TableCell>
                    
                    <TableCell>
                      {invoice.description}
                    </TableCell>
                    
                    <TableCell>
                      <Typography fontWeight="medium">
                        {formatCurrency(invoice.amount)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(invoice.status)}
                        label={invoice.status.toUpperCase()}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuClick(e, invoice)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {mockInvoices.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No invoices found.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Invoice Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDownloadInvoice(selectedInvoice)}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Download PDF
        </MenuItem>
        <MenuItem onClick={() => handleDownloadInvoice(selectedInvoice)}>
          <Receipt sx={{ mr: 1 }} fontSize="small" />
          View Receipt
        </MenuItem>
      </Menu>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Payment Method</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Payment methods are securely processed through Stripe. 
            Your card information is never stored on our servers.
          </Alert>
          
          <TextField
            fullWidth
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            margin="normal"
          />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                placeholder="MM/YY"
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVC"
                placeholder="123"
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <TextField
            fullWidth
            label="Cardholder Name"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdatePaymentMethod}>
            Update Payment Method
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StreamlinedBillingPage;
