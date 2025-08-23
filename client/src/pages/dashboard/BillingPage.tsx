import React, { useState, useEffect } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Menu,
} from '@mui/material';
import {
  CreditCard,
  Receipt,
  TrendingUp,
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
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { paymentService } from '@/services/paymentService';
import { api, endpoints } from '@/services/api';
import UserBillingService from '@/services/UserBillingService';
import MetricCard from '@/components/common/MetricCard';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

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
  stripeInvoiceId?: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'succeeded' | 'cancelled' | 'refunded';
  description: string;
  downloadUrl?: string;
  receiptUrl?: string;
  currency?: string;
  createdAt?: string;
}

interface Subscription {
  id: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  seats: number;
  amount: number;
  nextPaymentDate: string;
  tier?: string;
}

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

const BillingPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [paymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('PRO');
  const [seats, setSeats] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAddPaymentMethod = () => {
    enqueueSnackbar('Payment method added successfully', { variant: 'success' });
    setAddPaymentDialogOpen(false);
  };

  const handleUpgradeSubscription = () => {
    enqueueSnackbar('Subscription updated successfully', { variant: 'success' });
    setUpgradeDialogOpen(false);
  };

  // Initialize upgrade dialog with current subscription data
  const handleOpenUpgradeDialog = () => {
    if (subscription) {
      setSeats(subscription.seats);
      // Auto-select plan based on current seats
      if (subscription.seats <= 50) {
        setSelectedPlan('PRO');
      } else {
        setSelectedPlan('ENTERPRISE');
      }
    }
    setUpgradeDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (invoice.receiptUrl) {
      window.open(invoice.receiptUrl, '_blank');
    } else {
      enqueueSnackbar('No receipt available for this payment', { variant: 'info' });
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔍 [BillingPage] Auth state changed:', { 
        hasUser: !!user, 
        uid: user?.uid, 
        email: user?.email 
      });
      setCurrentUser(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Fetch subscription data
  useEffect(() => {
    if (!authReady || !currentUser) {
      console.log('⏳ [BillingPage] Waiting for auth to be ready...');
      return;
    }

    console.log('✅ [BillingPage] Auth ready, fetching subscription for user:', currentUser.uid);
    (async () => {
      try {
        setSubscriptionLoading(true);
        
        // Try new Firestore-based service first
        let subscriptionData;
        try {
          subscriptionData = await UserBillingService.getCurrentUserSubscription();
          if (subscriptionData) {
            setSubscription(subscriptionData);
            console.log('✅ [BillingPage] Subscription loaded via UserBillingService');
            return;
          }
        } catch (firestoreError) {
          console.warn('⚠️ [BillingPage] UserBillingService failed, falling back to API:', firestoreError);
        }

        // Fallback to API
        const response = await api.get(endpoints.subscriptions.mySubscriptions());
        const subscriptions = response.data?.data?.subscriptions || [];
        
        if (subscriptions.length > 0) {
          const primarySubscription = subscriptions[0];
          setSubscription({
            id: primarySubscription.id,
            plan: primarySubscription.tier?.toUpperCase() as any || 'PRO',
            status: primarySubscription.status?.toLowerCase() as any || 'active',
            currentPeriodStart: primarySubscription.currentPeriodStart,
            currentPeriodEnd: primarySubscription.currentPeriodEnd,
            seats: primarySubscription.seats || 1,
            amount: primarySubscription.amount || 0,
            nextPaymentDate: primarySubscription.currentPeriodEnd,
            tier: primarySubscription.tier,
          });
          console.log('✅ [BillingPage] Subscription loaded via API fallback');
        }
      } catch (e: any) {
        console.error('❌ [BillingPage] Failed to load subscription:', e);
        enqueueSnackbar(e?.message || 'Failed to load subscription', { variant: 'error' });
      } finally {
        setSubscriptionLoading(false);
      }
    })();
``  }, [enqueueSnackbar, authReady, currentUser]);

  // Fetch billing history
  useEffect(() => {
    if (!authReady || !currentUser) {
      console.log('⏳ [BillingPage] Waiting for auth to be ready for billing history...');
      return;
    }

    console.log('✅ [BillingPage] Auth ready, fetching billing history for user:', currentUser.uid);
    (async () => {
      try {
        setLoading(true);
        
        // Try new Firestore-based service first
        let invoiceData;
        try {
          console.log('🔍 [BillingPage] Attempting to fetch billing history via UserBillingService...');
          invoiceData = await UserBillingService.getCurrentUserBillingHistory({ limit: 25 });
          console.log('📊 [BillingPage] UserBillingService returned:', invoiceData);
          
          if (invoiceData && invoiceData.length > 0) {
            setInvoices(invoiceData);
            console.log('✅ [BillingPage] Billing history loaded via UserBillingService:', invoiceData.length, 'items');
            return;
          } else {
            console.log('ℹ️ [BillingPage] UserBillingService returned empty array or null');
          }
        } catch (firestoreError) {
          console.error('❌ [BillingPage] UserBillingService failed:', firestoreError);
        }

        // Fallback to API endpoints
        try {
          invoiceData = await paymentService.getUserInvoices({ limit: 25 });
        } catch (invoiceError) {
          console.log('ℹ️ [BillingPage] Invoice endpoint not available, falling back to payment history');
          const history = await paymentService.getPaymentHistory({ limit: 25 });
          invoiceData = history.payments || [];
        }
        
        const formattedInvoices = invoiceData.map((payment: any) => ({
          id: payment.id,
          stripeInvoiceId: payment.stripeInvoiceId,
          number: payment.stripeInvoiceId || `PAY-${payment.id.substring(0, 8).toUpperCase()}`,
          date: payment.createdAt,
          amount: payment.amount,
          status: payment.status?.toLowerCase(),
          description: payment.description || `${payment.subscription?.tier || 'Subscription'} Plan - ${payment.subscription?.seats || 1} seat(s)`,
          downloadUrl: payment.receiptUrl,
          receiptUrl: payment.receiptUrl,
          currency: payment.currency,
          createdAt: payment.createdAt,
        }));
        setInvoices(formattedInvoices);
        console.log('✅ [BillingPage] Billing history loaded via API fallback:', formattedInvoices.length, 'items');
      } catch (e: any) {
        console.error('❌ [BillingPage] Failed to load billing history:', e);
        enqueueSnackbar(e?.message || 'Failed to load billing history', { variant: 'error' });
        setInvoices([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    })();
  }, [enqueueSnackbar, authReady, currentUser]);

  const calculateUpgradePrice = () => {
    // Plan prices in dollars (not cents)
    const planPrices = { BASIC: 29, PRO: 99, ENTERPRISE: 199 };
    return planPrices[selectedPlan as keyof typeof planPrices] * seats;
  };

  // Auto-select plan based on seat count
  const handleSeatsChange = (newSeats: number) => {
    setSeats(newSeats);
    
    // Business rule: up to 50 seats for Pro, more than 50 for Enterprise
    if (newSeats <= 50) {
      setSelectedPlan('PRO');
    } else {
      setSelectedPlan('ENTERPRISE');
    }
  };

  // Get plan description with pricing
  const getPlanDescription = (plan: string) => {
    const planPrices = { BASIC: 29, PRO: 99, ENTERPRISE: 199 };
    const price = planPrices[plan as keyof typeof planPrices];
    return `${plan} - $${price}/seat/month`;
  };

  if (subscriptionLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6" color="text.secondary">
          Loading billing information...
        </Typography>
      </Box>
    );
  }

  if (!subscription) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6" color="text.secondary">
          No subscription found. Please contact support.
        </Typography>
      </Box>
    );
  }

  const nextPaymentAmount = formatCurrency(subscription.amount);
  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.nextPaymentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Box>
      {/* Header */}
      <Box >
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
      </Box>

      {/* Billing Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Cost"
            value={formatCurrency(subscription.amount)}
            icon={<MonetizationOn />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Seats"
            value={subscription.seats}
            icon={<AccountBalance />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Days to Renewal"
            value={daysUntilRenewal}
            icon={<Schedule />}
            color="warning"
            trend={{ value: Math.max(0, 30 - daysUntilRenewal), direction: 'down' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Invoices"
            value={invoices.filter(inv => inv.status === 'paid' || inv.status === 'pending').length}
            icon={<ReceiptLong />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Subscription Overview */}
      <Box >
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
                    label={subscription.plan}
                    color="primary"
                    sx={{ fontWeight: 600, fontSize: '1rem', px: 2, py: 1 }}
                  />
                  <Chip
                    icon={getStatusIcon(subscription.status)}
                    label={subscription.status.toUpperCase()}
                    color={getStatusColor(subscription.status) as any}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {formatCurrency(subscription.amount)} / month
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {subscription.seats} seats • Next payment in {daysUntilRenewal} days
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Next Payment
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {nextPaymentAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    on {new Date(subscription.nextPaymentDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={4}>
        {/* Payment Methods */}
        <Grid item xs={12} md={8}>
          <Box >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Payment Methods
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setAddPaymentDialogOpen(true)}
                >
                  + Add Method
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
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
          </Box>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Box >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
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
          </Box>
        </Grid>

        {/* Billing History */}
        <Grid item xs={12}>
          <Box >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Box sx={{ py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              Loading billing history...
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                              {invoice.number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(invoice.createdAt || invoice.date).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {invoice.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                          {new Intl.NumberFormat('en-US', { 
                              style: 'currency', 
                              currency: (invoice.currency || 'USD').toUpperCase() 
                            }).format(invoice.amount || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(String(invoice.status).toLowerCase())}
                              label={String(invoice.status).toUpperCase()}
                              color={getStatusColor(String(invoice.status).toLowerCase()) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Download />}
                                onClick={() => handleDownloadInvoice(invoice)}
                                sx={{
                                  backgroundColor: 'primary.main',
                                  color: 'primary.contrastText',
                                  '&:hover': {
                                    backgroundColor: 'primary.dark',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                  },
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                              >
                                Receipt
                              </Button>
                              {invoice.stripeInvoiceId && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Receipt />}
                                  onClick={() => window.open(`https://dashboard.stripe.com/invoices/${invoice.stripeInvoiceId}`, '_blank')}
                                  sx={{
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                      borderColor: 'primary.dark',
                                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                  }}
                                >
                                  Stripe
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Box sx={{ py: 4 }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                              No billing history found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Your payment history will appear here once you have completed transactions.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={addPaymentDialogOpen}
        onClose={() => setAddPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
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
          <Button
            onClick={handleAddPaymentMethod}
            variant="contained"
          >
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
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
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
                  inputProps={{
                    'aria-label': 'Select subscription plan',
                    title: 'Choose your subscription plan'
                  }}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Total: {formatCurrency(calculateUpgradePrice())} / month
                  </Typography>
                </Box>
                
                {/* Plan Selection Summary */}
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.default', 
                  borderRadius: 1, 
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Plan Selection Logic:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {seats <= 50 ? '✅' : '❌'} Up to 50 seats: <strong>Pro Plan</strong> ($99/seat/month)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {seats > 50 ? '✅' : '❌'} 51+ seats: <strong>Enterprise Plan</strong> ($199/seat/month)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Current selection: <strong>{selectedPlan}</strong> plan with <strong>{seats}</strong> seat{seats !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpgradeSubscription}
            variant="contained"
          >
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Method Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
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
