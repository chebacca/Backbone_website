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
} from '@mui/icons-material';
// import { motion } from 'framer-motion'; // Removed for Firebase compatibility
import { useSnackbar } from 'notistack';
import { paymentService } from '@/services/paymentService';

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
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl?: string;
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

const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    date: '2024-01-15',
    amount: 29700,
    status: 'paid',
    description: 'Pro Plan - 3 seats (Monthly)',
    downloadUrl: '#',
  },
  {
    id: '2',
    number: 'INV-2023-052',
    date: '2023-12-15',
    amount: 29700,
    status: 'paid',
    description: 'Pro Plan - 3 seats (Monthly)',
    downloadUrl: '#',
  },
  {
    id: '3',
    number: 'INV-2023-051',
    date: '2023-11-15',
    amount: 29700,
    status: 'paid',
    description: 'Pro Plan - 3 seats (Monthly)',
    downloadUrl: '#',
  },
];

const mockSubscription: Subscription = {
  id: '1',
  plan: 'PRO',
  status: 'active',
  currentPeriodStart: '2024-01-15',
  currentPeriodEnd: '2024-02-15',
  seats: 3,
  amount: 29700,
  nextPaymentDate: '2024-02-15',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'past_due':
      return 'error';
    case 'canceled':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
    case 'active':
      return <CheckCircle />;
    case 'pending':
      return <Schedule />;
    case 'failed':
    case 'past_due':
      return <Warning />;
    default:
      return <CheckCircle />;
  }
};

const BillingPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [paymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [subscription] = useState<Subscription>(mockSubscription);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('PRO');
  const [seats, setSeats] = useState(3);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAddPaymentMethod = () => {
    enqueueSnackbar('Payment method added successfully', { variant: 'success' });
    setAddPaymentDialogOpen(false);
  };

  const handleUpgradeSubscription = () => {
    enqueueSnackbar('Subscription updated successfully', { variant: 'success' });
    setUpgradeDialogOpen(false);
  };

  const handleDownloadInvoice = (invoice: any) => {
    if (invoice.receiptUrl) {
      window.open(invoice.receiptUrl, '_blank');
    } else {
      enqueueSnackbar('No receipt available for this payment', { variant: 'info' });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const history = await paymentService.getPaymentHistory({ limit: 25 });
        setInvoices(history.payments || []);
      } catch (e: any) {
        enqueueSnackbar(e?.message || 'Failed to load billing history', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calculateUpgradePrice = () => {
    const planPrices = { BASIC: 2900, PRO: 9900, ENTERPRISE: 19900 };
    return planPrices[selectedPlan as keyof typeof planPrices] * seats;
  };

  const nextPaymentAmount = formatCurrency(subscription.amount);
  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.nextPaymentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Box>
      {/* Header */}
      <Box
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
            onClick={() => setUpgradeDialogOpen(true)}
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

      {/* Subscription Overview */}
      <Box
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
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
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Next Payment
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
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
        <Grid item xs={12} lg={6}>
          <Box
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 3,
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
                  size="small"
                >
                  Add Method
                </Button>
              </Box>

              <List>
                {paymentMethods.map((method, index) => (
                  <React.Fragment key={method.id}>
                    <ListItem
                      sx={{
                        px: 0,
                        border: method.isDefault ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: method.isDefault ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <ListItemIcon sx={{ ml: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <CreditCard />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {method.brand} •••• {method.last4}
                            </Typography>
                            {method.isDefault && (
                              <Chip label="Default" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={`Expires ${method.expiryMonth}/${method.expiryYear}`}
                        sx={{ ml: 1 }}
                      />
                      <IconButton
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ mr: 2 }}
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={6}>
          <Box
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Paper
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                mb: 3,
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
                    onClick={() => setUpgradeDialogOpen(true)}
                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
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
                    startIcon={<Receipt />}
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
          <Box
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
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
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                            {invoice.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {invoice.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: (invoice.currency || 'USD').toUpperCase() }).format((invoice.amount || 0) / 100)}
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
                          <Button
                            variant="outlined"
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
                  <MenuItem value="BASIC">Basic - $29/month</MenuItem>
                  <MenuItem value="PRO">Pro - $99/month</MenuItem>
                  <MenuItem value="ENTERPRISE">Enterprise - $199/month</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Seats"
                type="number"
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Total: {formatCurrency(calculateUpgradePrice())} / month
                </Typography>
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
