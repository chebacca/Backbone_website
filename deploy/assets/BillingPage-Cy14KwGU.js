var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, d as Alert, _ as AlertTitle, x as List, y as ListItem, z as ListItemIcon, $ as WarningIcon, H as ListItemText, J as Security, a as Button, v as Star, G as Grid, ai as MonetizationOn, bN as AccountBalance, a2 as Schedule, bR as ReceiptLong, t as Card, w as CardContent, r as Chip, c as Paper, bS as AddIcon, af as Avatar, ah as CreditCard, g as IconButton, ar as MoreVertIcon, bT as EditIcon, at as Download, al as TableContainer, am as Table, an as TableHead, ao as TableRow, ap as TableCell, aq as TableBody, au as Dialog, av as DialogTitle, aw as DialogContent, e as TextField, ax as DialogActions, a9 as FormControl, aa as InputLabel, ab as Select, M as MenuItem, D as Divider, as as Menu, a5 as PaymentIcon, aj as Receipt, p as CheckCircleIcon } from "./mui-Cc0LuBKd.js";
import { r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { b as useCurrentUser, c as useOrganizationContext, d as useUserProjects } from "./useStreamlinedData-CcPjkSJF.js";
import { unifiedDataService } from "./UnifiedDataService-BWUSusTA.js";
import { M as MetricCard } from "./MetricCard-CbLkGtjQ.js";
import "./index-BeFtug-f.js";
import "./stripe-CSTr_BWb.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./FirestoreCollectionManager-B-YhbiEj.js";
import "./firebase-BpHtCZEP.js";
import "./index.esm-D5-7iBdy.js";
const useOrganizationSubscription = () => {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const fetchData = () => __async(void 0, null, function* () {
    try {
      setLoading(true);
      setError(null);
      const subscription = yield unifiedDataService.getSubscriptionForOrganization();
      setData(subscription);
    } catch (err) {
      console.error("❌ [useOrganizationSubscription] Error:", err);
      setError(err.message || "Failed to fetch subscription");
      setData(null);
    } finally {
      setLoading(false);
    }
  });
  reactExports.useEffect(() => {
    fetchData();
  }, []);
  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
const useOrganizationInvoices = () => {
  const [data, setData] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const fetchData = () => __async(void 0, null, function* () {
    try {
      setLoading(true);
      setError(null);
      const invoices = yield unifiedDataService.getInvoicesForOrganization();
      setData(invoices);
    } catch (err) {
      console.error("❌ [useOrganizationInvoices] Error:", err);
      setError(err.message || "Failed to fetch invoices");
      setData([]);
    } finally {
      setLoading(false);
    }
  });
  reactExports.useEffect(() => {
    fetchData();
  }, []);
  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
const useOrganizationPayments = () => {
  const [data, setData] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const fetchData = () => __async(void 0, null, function* () {
    try {
      setLoading(true);
      setError(null);
      const payments = yield unifiedDataService.getPaymentsForOrganization();
      setData(payments);
    } catch (err) {
      console.error("❌ [useOrganizationPayments] Error:", err);
      setError(err.message || "Failed to fetch payments");
      setData([]);
    } finally {
      setLoading(false);
    }
  });
  reactExports.useEffect(() => {
    fetchData();
  }, []);
  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
const useBillingSummary = () => {
  var _a, _b, _c, _d, _e, _f;
  const subscription = useOrganizationSubscription();
  const invoices = useOrganizationInvoices();
  const payments = useOrganizationPayments();
  const loading = subscription.loading || invoices.loading || payments.loading;
  const error = subscription.error || invoices.error || payments.error;
  const billingMetrics = {
    monthlyTotal: ((_a = subscription.data) == null ? void 0 : _a.totalAmount) || 0,
    totalSeats: ((_b = subscription.data) == null ? void 0 : _b.seats) || 0,
    daysUntilRenewal: ((_c = subscription.data) == null ? void 0 : _c.currentPeriodEnd) ? Math.max(0, Math.ceil((new Date(subscription.data.currentPeriodEnd).getTime() - Date.now()) / (1e3 * 60 * 60 * 24))) : 0,
    activeInvoices: ((_d = invoices.data) == null ? void 0 : _d.filter((inv) => inv.status === "paid" || inv.status === "pending").length) || 0,
    totalPaid: ((_e = payments.data) == null ? void 0 : _e.filter((payment) => payment.status === "succeeded").reduce((sum, payment) => sum + (payment.amount || 0), 0)) || 0,
    lastPayment: ((_f = payments.data) == null ? void 0 : _f.filter((payment) => payment.status === "succeeded").sort((a, b) => new Date(b.processedAt || b.createdAt).getTime() - new Date(a.processedAt || a.createdAt).getTime())[0]) || null
  };
  const refetch = () => __async(void 0, null, function* () {
    yield Promise.all([
      subscription.refetch(),
      invoices.refetch(),
      payments.refetch()
    ]);
  });
  return {
    subscription: subscription.data,
    invoices: invoices.data,
    payments: payments.data,
    metrics: billingMetrics,
    loading,
    error,
    refetch
  };
};
const mockPaymentMethods = [
  {
    id: "1",
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: "2",
    type: "card",
    last4: "5555",
    brand: "Mastercard",
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false
  }
];
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
};
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "succeeded":
    case "paid":
    case "active":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "failed":
    case "cancelled":
    case "canceled":
      return "error";
    case "refunded":
      return "info";
    default:
      return "default";
  }
};
const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case "succeeded":
    case "paid":
    case "active":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {});
    case "pending":
    case "processing":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {});
    case "failed":
    case "cancelled":
    case "canceled":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {});
    case "refunded":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, {});
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {});
  }
};
const BillingPage = () => {
  var _a, _b, _c, _d, _e, _f, _g;
  const { enqueueSnackbar } = useSnackbar();
  const { loading: userLoading, error: userError } = useCurrentUser();
  const { loading: orgLoading, error: orgError } = useOrganizationContext();
  const { loading: projectsLoading, error: projectsError } = useUserProjects();
  const {
    subscription,
    invoices,
    metrics,
    loading: billingLoading,
    error: billingError
  } = useBillingSummary();
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = reactExports.useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = reactExports.useState(false);
  const [selectedPlan, setSelectedPlan] = reactExports.useState("PRO");
  const [seats, setSeats] = reactExports.useState(1);
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  const isLoading = userLoading || orgLoading || projectsLoading || billingLoading;
  const hasError = userError || orgError || projectsError || billingError;
  const billingData = reactExports.useMemo(() => {
    return {
      subscription,
      invoices: invoices || [],
      paymentMethods: mockPaymentMethods,
      // TODO: Replace with real payment methods
      nextPaymentAmount: metrics.monthlyTotal,
      daysUntilRenewal: metrics.daysUntilRenewal
    };
  }, [subscription, invoices, metrics]);
  const handleAddPaymentMethod = () => {
    enqueueSnackbar("Payment method added successfully", { variant: "success" });
    setAddPaymentDialogOpen(false);
  };
  const handleUpgradeSubscription = () => {
    enqueueSnackbar("Subscription updated successfully", { variant: "success" });
    setUpgradeDialogOpen(false);
  };
  const handleOpenUpgradeDialog = () => {
    var _a2;
    if (billingData.subscription) {
      setSeats(billingData.subscription.plan.seats || 1);
      setSelectedPlan(((_a2 = billingData.subscription.plan) == null ? void 0 : _a2.tier) || "PRO");
    }
    setUpgradeDialogOpen(true);
  };
  const handleDownloadInvoice = (invoice) => {
    enqueueSnackbar(`Downloading invoice ${invoice.number}...`, { variant: "info" });
  };
  const calculateUpgradePrice = () => {
    const planPrices = { BASIC: 29, PRO: 99, ENTERPRISE: 199 };
    return planPrices[selectedPlan] * seats;
  };
  const handleSeatsChange = (newSeats) => {
    setSeats(newSeats);
    if (newSeats <= 50) {
      setSelectedPlan("PRO");
    } else {
      setSelectedPlan("ENTERPRISE");
    }
  };
  const getPlanDescription = (plan) => {
    const planPrices = { BASIC: 29, PRO: 99, ENTERPRISE: 199 };
    const price = planPrices[plan];
    return `${plan} - $${price}/seat/month`;
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Loading Billing Information..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Fetching your subscription and payment details" })
    ] }) });
  }
  if (hasError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Unable to Load Billing Data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "We encountered an issue loading your billing information. This could be due to:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Network connectivity issues" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Authentication token expired" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: () => window.location.reload(), children: "Retry" }) })
    ] }) });
  }
  if (!billingData.subscription) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "No Active Subscription" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "You don't have an active subscription yet. Get started with one of our plans:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: handleOpenUpgradeDialog, children: "Choose Plan" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Billing & Payments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Manage your subscription, payment methods, and billing history" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}),
          onClick: handleOpenUpgradeDialog,
          sx: {
            background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
            color: "#000",
            fontWeight: 600
          },
          children: "Upgrade Plan"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Monthly Cost",
          value: formatCurrency(billingData.nextPaymentAmount),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MonetizationOn, {}),
          color: "primary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Total Seats",
          value: metrics.totalSeats,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountBalance, {}),
          color: "secondary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Days to Renewal",
          value: billingData.daysUntilRenewal,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {}),
          color: "warning",
          trend: { value: Math.max(0, 30 - billingData.daysUntilRenewal), direction: "down" }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Active Invoices",
          value: metrics.activeInvoices,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptLong, {}),
          color: "success"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        sx: {
          mb: 4,
          background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)",
          border: "1px solid rgba(0, 212, 255, 0.2)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, alignItems: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 8, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: ((_a = billingData.subscription) == null ? void 0 : _a.tier) || "PRO",
                  color: "primary",
                  sx: { fontWeight: 600, fontSize: "1rem", px: 2, py: 1 }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  icon: getStatusIcon(((_b = billingData.subscription) == null ? void 0 : _b.status) || "active"),
                  label: (((_c = billingData.subscription) == null ? void 0 : _c.status) || "ACTIVE").toUpperCase(),
                  color: getStatusColor(((_d = billingData.subscription) == null ? void 0 : _d.status) || "active"),
                  sx: { fontWeight: 500 }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 1 }, children: [
              formatCurrency(billingData.nextPaymentAmount),
              " / month"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 2 }, children: [
              metrics.totalSeats,
              " seats • Next payment in ",
              billingData.daysUntilRenewal,
              " days"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "Current period: ",
              ((_e = billingData.subscription) == null ? void 0 : _e.currentPeriodStart) ? new Date(billingData.subscription.currentPeriodStart).toLocaleDateString() : "N/A",
              " - ",
              ((_f = billingData.subscription) == null ? void 0 : _f.currentPeriodEnd) ? new Date(billingData.subscription.currentPeriodEnd).toLocaleDateString() : "N/A"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "right" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", sx: { mb: 1 }, children: "Next Payment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: formatCurrency(billingData.nextPaymentAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "on ",
              ((_g = billingData.subscription) == null ? void 0 : _g.currentPeriodEnd) ? new Date(billingData.subscription.currentPeriodEnd).toLocaleDateString() : "N/A"
            ] })
          ] }) })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Payment Methods" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
              onClick: () => setAddPaymentDialogOpen(true),
              children: "Add Method"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: billingData.paymentMethods.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { border: "1px solid rgba(255,255,255,0.1)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", sx: { fontWeight: 500 }, children: [
                method.brand,
                " •••• ",
                method.last4
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Expires ",
                method.expiryMonth.toString().padStart(2, "0"),
                "/",
                method.expiryYear
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            method.isDefault && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Default", size: "small", color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: (event) => setAnchorEl(event.currentTarget),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertIcon, {})
              }
            )
          ] })
        ] }) }) }, method.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Quick Actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}),
              fullWidth: true,
              sx: { justifyContent: "flex-start", py: 1.5 },
              onClick: () => setUpgradeDialogOpen(true),
              children: "Upgrade Plan"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}),
              fullWidth: true,
              sx: { justifyContent: "flex-start", py: 1.5 },
              children: "Update Billing Info"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
              fullWidth: true,
              sx: { justifyContent: "flex-start", py: 1.5 },
              children: "Download All Invoices"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
              fullWidth: true,
              sx: { justifyContent: "flex-start", py: 1.5 },
              children: "Billing Security Settings"
            }
          ) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Billing History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: billingData.invoices.map((invoice) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500, fontFamily: "monospace" }, children: invoice.number }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: new Date(invoice.date).toLocaleDateString() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: invoice.description }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: formatCurrency(invoice.amount) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                icon: getStatusIcon(invoice.status),
                label: invoice.status.toUpperCase(),
                color: getStatusColor(invoice.status),
                size: "small"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                size: "small",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
                onClick: () => handleDownloadInvoice(invoice),
                children: "Receipt"
              }
            ) })
          ] }, invoice.id)) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: addPaymentDialogOpen,
        onClose: () => setAddPaymentDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Payment Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: "Your payment information is securely processed by Stripe and never stored on our servers." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Card Number",
                  placeholder: "1234 5678 9012 3456",
                  sx: { mt: 1 }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Expiry Date",
                  placeholder: "MM/YY"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "CVC",
                  placeholder: "123"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Cardholder Name",
                  placeholder: "John Doe"
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setAddPaymentDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAddPaymentMethod, variant: "contained", children: "Add Payment Method" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: upgradeDialogOpen,
        onClose: () => setUpgradeDialogOpen(false),
        maxWidth: "md",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Upgrade Your Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Select Plan" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selectedPlan,
                  label: "Select Plan",
                  onChange: (e) => setSelectedPlan(e.target.value),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "BASIC", children: getPlanDescription("BASIC") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PRO", children: getPlanDescription("PRO") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ENTERPRISE", children: getPlanDescription("ENTERPRISE") })
                  ]
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Number of Seats",
                type: "number",
                value: seats,
                onChange: (e) => handleSeatsChange(parseInt(e.target.value)),
                inputProps: { min: 1, max: 100 },
                helperText: "Up to 50 seats: Pro plan. 51+ seats: Enterprise plan."
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", children: [
                "Total: ",
                formatCurrency(calculateUpgradePrice()),
                " / month"
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setUpgradeDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleUpgradeSubscription, variant: "contained", children: "Upgrade Now" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        anchorEl,
        open: Boolean(anchorEl),
        onClose: () => setAnchorEl(null),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { onClick: () => setAnchorEl(null), children: "Set as Default" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { onClick: () => setAnchorEl(null), children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { onClick: () => setAnchorEl(null), sx: { color: "error.main" }, children: "Remove" })
        ]
      }
    )
  ] });
};
export {
  BillingPage as default
};
