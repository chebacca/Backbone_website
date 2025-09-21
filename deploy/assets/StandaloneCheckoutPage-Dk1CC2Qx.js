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
import { u as useTheme, j as jsxRuntimeExports, B as Box, C as CircularProgress, b as Container, a as Button, A as ArrowBack, T as Typography, c as Paper, _ as Stepper, $ as Step, a0 as StepLabel, d as Alert, G as Grid, S as Stack, D as Divider, r as Chip, J as Security, K as Support, E as EmailIcon, p as CheckCircleIcon, a1 as ShoppingCart, a2 as PaymentIcon, a3 as Download, t as Card, w as CardContent, a4 as Dialog, a5 as DialogTitle, g as IconButton, a6 as CloseIcon, a7 as DialogContent } from "./mui-DJqJu8cJ.js";
import { u as useNavigate, e as useLocation, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth } from "./index-DB7RolcD.js";
import "./stripe-BZOVZ1Et.js";
const steps = ["Review Order", "Payment", "Download"];
const StandaloneCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  useTheme();
  const [activeStep, setActiveStep] = reactExports.useState(0);
  const [checkoutData, setCheckoutData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [success, setSuccess] = reactExports.useState(false);
  const [paymentIntent, setPaymentIntent] = reactExports.useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = reactExports.useState(false);
  reactExports.useEffect(() => {
    var _a, _b;
    if (((_a = location.state) == null ? void 0 : _a.items) && ((_b = location.state) == null ? void 0 : _b.type) === "standalone") {
      setCheckoutData(location.state);
    } else {
      navigate("/marketplace");
    }
  }, [location.state, navigate]);
  if (!checkoutData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) });
  }
  const totalAmount = checkoutData.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const totalItems = checkoutData.items.reduce((total, item) => total + item.quantity, 0);
  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
      handlePayment();
    } else if (activeStep === 1) {
      setActiveStep(2);
    }
  };
  const handleBack = () => {
    if (activeStep === 0) {
      navigate("/marketplace");
    } else {
      setActiveStep(activeStep - 1);
    }
  };
  const handlePayment = () => __async(void 0, null, function* () {
    setLoading(true);
    setError(null);
    try {
      const response = yield fetch("/api/payments/create-standalone-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${yield user == null ? void 0 : user.getIdToken()}`
        },
        body: JSON.stringify({
          items: checkoutData.items,
          amount: totalAmount,
          currency: "usd"
        })
      });
      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }
      const data = yield response.json();
      setPaymentIntent(data.paymentIntent);
      setShowPaymentDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  });
  const handleDownload = (productId) => {
    const product = checkoutData.items.find((item) => item.product.id === productId);
    if (product) {
      const downloadUrl = `https://downloads.backbone-logic.com/standalone/${productId}?token=${Date.now()}`;
      window.open(downloadUrl, "_blank");
    }
  };
  const OrderSummary = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3, mb: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, {}),
      "Order Summary"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
      checkoutData.items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Box,
          {
            sx: {
              width: 60,
              height: 60,
              borderRadius: 1,
              backgroundColor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              "& img": {
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: item.product.image,
                alt: item.product.name
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: item.product.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            item.product.category,
            " • v",
            item.product.version
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: item.product.fileSize })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "right" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", sx: { fontWeight: 600 }, children: [
            "$",
            (item.product.price * item.quantity).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            "$",
            item.product.price,
            " × ",
            item.quantity
          ] })
        ] })
      ] }, index)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", children: [
          "Total (",
          totalItems,
          " items)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 700, color: "primary.main" }, children: [
          "$",
          totalAmount.toFixed(2)
        ] })
      ] })
    ] })
  ] });
  const PaymentStep = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3, mb: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}),
      "Payment Information"
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Secure Payment:" }),
        " Your payment is processed securely through Stripe. We accept all major credit cards and PayPal."
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "center", mb: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { sx: { color: "success.main" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "SSL encrypted • PCI compliant • 256-bit security" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "contained",
          size: "large",
          fullWidth: true,
          onClick: handlePayment,
          disabled: loading,
          sx: { py: 1.5 },
          children: [
            "Pay $",
            totalAmount.toFixed(2),
            " with Stripe"
          ]
        }
      )
    ] })
  ] });
  const DownloadStep = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3, mb: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
      "Download Your Products"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Payment Successful!" }),
      " Your products are ready for download. You'll also receive an email with download links."
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 2, children: checkoutData.items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: item.product.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
          "v",
          item.product.version,
          " • ",
          item.product.fileSize
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
          onClick: () => handleDownload(item.product.id),
          children: "Download"
        }
      )
    ] }) }) }, index)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Important:" }),
      " Download links are valid for 30 days. Keep your purchase receipt for future downloads."
    ] }) })
  ] });
  const PaymentDialog = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open: showPaymentDialog,
      onClose: () => setShowPaymentDialog(false),
      maxWidth: "sm",
      fullWidth: true,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Complete Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setShowPaymentDialog(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Redirecting to Stripe Checkout..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "You'll be redirected to Stripe's secure payment page to complete your purchase." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {})
        ] }) })
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { backgroundColor: "background.default", minHeight: "100vh", pt: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { py: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
          onClick: () => navigate("/marketplace"),
          sx: { mb: 2 },
          children: "Back to Marketplace"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Checkout" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Complete your purchase of standalone Backbone tools" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 3, mb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { activeStep, alternativeLabel: true, children: steps.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepLabel, { children: label }) }, label)) }) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, onClose: () => setError(null), children: error }),
    success && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Payment Successful!" }),
      " Your products are ready for download."
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 8, children: [
        activeStep === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(OrderSummary, {}),
        activeStep === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentStep, {}),
        activeStep === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadStep, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3, position: "sticky", top: 100 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Order Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              "$",
              totalAmount.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Tax" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "$0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: [
              "$",
              totalAmount.toFixed(2)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}), label: "Secure", size: "small", color: "success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}), label: "Support", size: "small", color: "primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, {}), label: "Email Delivery", size: "small", color: "info" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mt: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleBack,
          disabled: activeStep === 0,
          children: activeStep === 0 ? "Cancel" : "Back"
        }
      ),
      activeStep < 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          onClick: handleNext,
          disabled: loading || activeStep === 1,
          children: activeStep === 0 ? "Proceed to Payment" : "Complete Payment"
        }
      ),
      activeStep === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          onClick: () => navigate("/marketplace"),
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
          children: "Continue Shopping"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentDialog, {})
  ] }) });
};
export {
  StandaloneCheckoutPage as default
};
