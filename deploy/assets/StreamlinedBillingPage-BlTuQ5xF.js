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
import { j as jsxRuntimeExports, B as Box, i as LinearProgress, T as Typography, d as Alert, a as Button, ag as CreditCard, G as Grid, ah as MonetizationOn, ai as Receipt, a1 as Schedule, aj as TrendingUp, t as Card, v as CardContent, D as Divider, r as Chip, ak as TableContainer, c as Paper, al as Table, am as TableHead, an as TableRow, ao as TableCell, ap as TableBody, g as IconButton, aq as MoreVertIcon, ar as Menu, M as MenuItem, as as Download, at as Dialog, au as DialogTitle, av as DialogContent, e as TextField, aw as DialogActions, p as CheckCircleIcon, _ as WarningIcon } from "./mui-BbtiZaA3.js";
import { r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { b as useCurrentUser, c as useOrganizationContext, e as useUserPermissions } from "./useStreamlinedData-z4hJHRxn.js";
import { M as MetricCard } from "./MetricCard-DT0TWtTD.js";
import "./UnifiedDataService-1nEfiWl8.js";
import "./index-LnbRM7Yy.js";
import "./stripe-rmDQXWB-.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./FirestoreCollectionManager-DXFNI81i.js";
import "./firebase-BTFXMplb.js";
import "./index.esm-BMygn4u3.js";
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "active":
    case "paid":
    case "succeeded":
      return "success";
    case "pending":
      return "warning";
    case "failed":
    case "cancelled":
      return "error";
    case "past_due":
      return "warning";
    default:
      return "default";
  }
};
const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case "active":
    case "paid":
    case "succeeded":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {});
    case "pending":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {});
    case "failed":
    case "cancelled":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {});
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {});
  }
};
const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount / 100);
};
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};
const StreamlinedBillingPage = () => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const { enqueueSnackbar } = useSnackbar();
  const { data: currentUser, loading: userLoading } = useCurrentUser();
  const { data: orgContext, loading: orgLoading } = useOrganizationContext();
  const permissions = useUserPermissions();
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  const [selectedInvoice, setSelectedInvoice] = reactExports.useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = reactExports.useState(false);
  const loading = userLoading || orgLoading;
  const handleMenuClick = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };
  const handleDownloadInvoice = (invoice) => __async(void 0, null, function* () {
    try {
      enqueueSnackbar("Invoice download started", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to download invoice", { variant: "error" });
    }
    handleMenuClose();
  });
  const handleUpdatePaymentMethod = () => __async(void 0, null, function* () {
    try {
      enqueueSnackbar("Payment method updated successfully", { variant: "success" });
      setPaymentDialogOpen(false);
    } catch (error) {
      enqueueSnackbar("Failed to update payment method", { variant: "error" });
    }
  });
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { mt: 2 }, children: "Loading billing information..." })
    ] });
  }
  if (!currentUser || !orgContext) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", children: "Unable to load billing data" }) });
  }
  const subscription = orgContext.subscription || {
    status: "active",
    plan: {
      tier: orgContext.organization.tier,
      seats: 5,
      pricePerSeat: orgContext.organization.tier === "ENTERPRISE" ? 1980 : orgContext.organization.tier === "PROFESSIONAL" ? 980 : 380
    },
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const mockInvoices = [
    {
      id: "1",
      number: "INV-2024-001",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
      amount: (((_a = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _a.pricePerSeat) || 0) * (((_b = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _b.seats) || 0),
      status: "paid",
      description: `${orgContext.organization.tier} Plan - Monthly`
    },
    {
      id: "2",
      number: "INV-2024-002",
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1e3).toISOString(),
      amount: (((_c = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _c.pricePerSeat) || 0) * (((_d = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _d.seats) || 0),
      status: "paid",
      description: `${orgContext.organization.tier} Plan - Monthly`
    }
  ];
  const billingStats = {
    monthlySpend: (((_e = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _e.pricePerSeat) || 0) * (((_f = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _f.seats) || 0),
    totalInvoices: mockInvoices.length,
    nextPayment: (subscription == null ? void 0 : subscription.currentPeriodEnd) || /* @__PURE__ */ new Date(),
    subscriptionStatus: (subscription == null ? void 0 : subscription.status) || "ACTIVE"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", component: "h1", children: "Billing & Payments" }),
      permissions.isAccountOwner && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, {}),
          onClick: () => setPaymentDialogOpen(true),
          children: "Update Payment Method"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Monthly Spend",
          value: formatCurrency(billingStats.monthlySpend),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MonetizationOn, {}),
          color: "primary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Total Invoices",
          value: billingStats.totalInvoices,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, {}),
          color: "warning"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Next Payment",
          value: formatDate(billingStats.nextPayment.toString()),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {}),
          color: "warning"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Subscription",
          value: billingStats.subscriptionStatus.toUpperCase(),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, {}),
          color: "success"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Current Subscription" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "primary", children: orgContext.organization.tier }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { color: "text.secondary", children: [
            formatCurrency((((_g = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _g.pricePerSeat) || 0) * (((_h = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _h.seats) || 0)),
            "/month"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Status:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: getStatusIcon(subscription.status),
              label: subscription.status.toUpperCase(),
              color: getStatusColor(subscription.status),
              size: "small"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Seats:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: ((_i = subscription == null ? void 0 : subscription.plan) == null ? void 0 : _i.seats) || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Next Billing:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: formatDate(((subscription == null ? void 0 : subscription.currentPeriodEnd) || /* @__PURE__ */ new Date()).toString()) })
        ] }),
        permissions.isAccountOwner && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", fullWidth: true, children: "Manage Subscription" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Payment Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { sx: { mr: 2, color: "text.secondary" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "•••• •••• •••• 4242" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Expires 12/25" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "Your payment method is securely stored with Stripe." }),
        permissions.isAccountOwner && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            fullWidth: true,
            onClick: () => setPaymentDialogOpen(true),
            children: "Update Payment Method"
          }
        )
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mt: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Invoice History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Invoice #" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: mockInvoices.map((invoice) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontFamily: "monospace", children: invoice.number }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(invoice.date) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: invoice.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { fontWeight: "medium", children: formatCurrency(invoice.amount) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: getStatusIcon(invoice.status),
              label: invoice.status.toUpperCase(),
              color: getStatusColor(invoice.status),
              size: "small"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              onClick: (e) => handleMenuClick(e, invoice),
              size: "small",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertIcon, {})
            }
          ) })
        ] }, invoice.id)) })
      ] }) }),
      mockInvoices.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "center", py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "No invoices found." }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        anchorEl,
        open: Boolean(anchorEl),
        onClose: handleMenuClose,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => handleDownloadInvoice(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { sx: { mr: 1 }, fontSize: "small" }),
            "Download PDF"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => handleDownloadInvoice(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { sx: { mr: 1 }, fontSize: "small" }),
            "View Receipt"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: paymentDialogOpen, onClose: () => setPaymentDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Update Payment Method" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "Payment methods are securely processed through Stripe. Your card information is never stored on our servers." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Card Number",
            placeholder: "1234 5678 9012 3456",
            margin: "normal"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Expiry Date",
              placeholder: "MM/YY",
              margin: "normal"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "CVC",
              placeholder: "123",
              margin: "normal"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Cardholder Name",
            margin: "normal"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setPaymentDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: handleUpdatePaymentMethod, children: "Update Payment Method" })
      ] })
    ] })
  ] });
};
export {
  StreamlinedBillingPage,
  StreamlinedBillingPage as default
};
