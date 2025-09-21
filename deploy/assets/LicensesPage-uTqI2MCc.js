const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/UnifiedDataService-CInBRYao.js","assets/index-DqrZ2g6Y.js","assets/mui-DJqJu8cJ.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-BZOVZ1Et.js","assets/index-COak77tQ.css","assets/index.esm-CjtNHFZy.js","assets/index.esm-zVCMB3Cx.js","assets/FirestoreCollectionManager-Dv1NBCSS.js","assets/firebase-Dx-EaqTZ.js","assets/index.esm-D5-7iBdy.js"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
import { j as jsxRuntimeExports, a4 as Dialog, a5 as DialogTitle, B as Box, a1 as ShoppingCart, T as Typography, g as IconButton, a6 as CloseIcon, a7 as DialogContent, _ as Stepper, $ as Step, a0 as StepLabel, aD as DialogActions, a as Button, A as ArrowBack, q as ArrowForward, p as CheckCircleIcon, t as Card, w as CardContent, G as Grid, a3 as Download, cf as Key, D as Divider, r as Chip, x as List, y as ListItem, z as ListItemIcon, H as ListItemText, e as TextField, L as Lock, d as Alert, aa as AlertTitle, C as CircularProgress, ar as CreditCard, R as RefreshIcon, cg as StepContent, aj as FormControl, ak as InputLabel, al as Select, M as MenuItem, F as FormControlLabel, l as Checkbox, av as TableContainer, c as Paper, aw as Table, ax as TableHead, ay as TableRow, az as TableCell, aA as TableBody, ap as Avatar, ab as WarningIcon, J as Security, bM as AddIcon, v as Star, ae as CardMembership, b$ as BlockIcon, aB as MoreVertIcon, ch as Fab, bI as PersonAddIcon, aG as DeleteIcon, c2 as EditIcon, I as InputAdornment, a9 as Schedule, b4 as Assignment, ad as PeopleIcon, i as LinearProgress, E as EmailIcon, Z as Business, ci as AccessTime, aC as Menu, aL as ContentCopy } from "./mui-DJqJu8cJ.js";
import { r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { b as useCurrentUser, c as useOrganizationContext, u as useOrganizationLicenses, a as useOrganizationTeamMembers, f as useUpdateLicense, g as useAssignLicense, h as useUnassignLicense } from "./useStreamlinedData-BNTe4wWg.js";
import { _ as __vitePreload } from "./index-DqrZ2g6Y.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { E as Elements, l as loadStripe, u as useStripe, a as useElements, C as CardElement } from "./stripe-BZOVZ1Et.js";
import "./UnifiedDataService-CInBRYao.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./FirestoreCollectionManager-Dv1NBCSS.js";
import "./firebase-Dx-EaqTZ.js";
import "./index.esm-D5-7iBdy.js";
const LICENSE_PLANS = [
  {
    id: "basic",
    name: "Basic",
    tier: "BASIC",
    price: 29,
    maxDevices: 2,
    features: [
      "Basic project management",
      "Up to 2 devices",
      "Email support",
      "Standard templates",
      "5GB storage"
    ]
  },
  {
    id: "professional",
    name: "Professional",
    tier: "PROFESSIONAL",
    price: 99,
    maxDevices: 5,
    popular: true,
    features: [
      "Advanced project management",
      "Up to 5 devices",
      "Priority support",
      "Custom templates",
      "50GB storage",
      "Team collaboration",
      "Advanced analytics"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tier: "ENTERPRISE",
    price: 199,
    maxDevices: 10,
    features: [
      "Enterprise project management",
      "Up to 10 devices",
      "24/7 dedicated support",
      "Unlimited templates",
      "500GB storage",
      "Advanced team management",
      "Custom integrations",
      "White-label options",
      "SLA guarantee"
    ]
  }
];
const PURCHASE_STEPS = [
  {
    id: "plan-selection",
    label: "Select Plan",
    description: "Choose your license plan and quantity",
    completed: false
  },
  {
    id: "payment",
    label: "Payment",
    description: "Complete your payment securely",
    completed: false
  },
  {
    id: "confirmation",
    label: "Confirmation",
    description: "Review and activate your licenses",
    completed: false
  }
];
const stripePromise$1 = loadStripe("pk_test_disabled");
const PaymentForm = ({ purchaseData, onPaymentSuccess, onPaymentError, processing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = reactExports.useState(false);
  const [cardError, setCardError] = reactExports.useState(null);
  const handleSubmit = (event) => __async(void 0, null, function* () {
    event.preventDefault();
    if (!stripe || !elements) {
      onPaymentError("Stripe has not loaded yet. Please try again.");
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError("Card element not found. Please refresh and try again.");
      return;
    }
    try {
      const { error, paymentMethod } = yield stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: `${purchaseData.billingAddress.firstName} ${purchaseData.billingAddress.lastName}`,
          email: purchaseData.billingAddress.email,
          phone: purchaseData.billingAddress.phone,
          address: {
            line1: purchaseData.billingAddress.address,
            city: purchaseData.billingAddress.city,
            state: purchaseData.billingAddress.state,
            postal_code: purchaseData.billingAddress.zipCode,
            country: purchaseData.billingAddress.country
          }
        }
      });
      if (error) {
        onPaymentError(error.message || "Payment method creation failed");
        return;
      }
      onPaymentSuccess(paymentMethod);
    } catch (error) {
      onPaymentError(error.message || "An unexpected error occurred");
    }
  });
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "form", onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3, border: "2px solid", borderColor: "primary.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { color: "primary", sx: { mr: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Secure Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "SSL Encrypted", size: "small", color: "success", sx: { ml: "auto" } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardElement,
        {
          options: {
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4"
                }
              },
              invalid: {
                color: "#9e2146"
              }
            }
          },
          onChange: handleCardChange
        }
      ),
      cardError && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mt: 2 }, children: cardError })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Test Mode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
        "Use test card: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "4242 4242 4242 4242" }),
        " with any future expiry date and any CVC."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "submit",
        variant: "contained",
        fullWidth: true,
        size: "large",
        disabled: !stripe || !cardComplete || processing,
        startIcon: processing ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, {}),
        sx: {
          py: 2,
          background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
          color: "#000",
          fontWeight: 600,
          fontSize: "1.1rem"
        },
        children: processing ? "Processing Payment..." : `Pay ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(purchaseData.total)}`
      }
    )
  ] });
};
const LicensePurchaseFlow = ({
  open,
  onClose,
  initialPlan = "professional",
  initialQuantity = 1,
  onPurchaseComplete
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = reactExports.useState(0);
  const [steps, setSteps] = reactExports.useState(PURCHASE_STEPS);
  const [processing, setProcessing] = reactExports.useState(false);
  const [selectedPlan, setSelectedPlan] = reactExports.useState(
    LICENSE_PLANS.find((p) => p.id === initialPlan) || LICENSE_PLANS[1]
  );
  const [quantity, setQuantity] = reactExports.useState(initialQuantity);
  const subtotal = selectedPlan.price * quantity;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const purchaseData = {
    plan: selectedPlan,
    quantity,
    total,
    tax,
    subtotal,
    billingAddress: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    }
  };
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
      setActiveStep(0);
      setSteps(PURCHASE_STEPS.map((step) => __spreadProps(__spreadValues({}, step), { completed: false })));
    }
  };
  const isStepValid = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return selectedPlan && quantity > 0;
      case 1:
        return true;
      default:
        return true;
    }
  };
  const handlePaymentSuccess = (paymentMethod) => __async(void 0, null, function* () {
    setProcessing(true);
    try {
      console.log("🛒 [LicensePurchaseFlow] Processing payment with method:", paymentMethod.id);
      const { UnifiedDataService } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { UnifiedDataService: UnifiedDataService2 } = yield import("./UnifiedDataService-CInBRYao.js");
        return { UnifiedDataService: UnifiedDataService2 };
      }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]) : void 0);
      const dataService = UnifiedDataService.getInstance();
      const result = yield dataService.purchaseLicenses({
        planId: selectedPlan.id,
        quantity,
        paymentMethodId: paymentMethod.id,
        billingAddress: purchaseData.billingAddress,
        total
      });
      const newSteps = [...steps];
      newSteps[2].completed = true;
      setSteps(newSteps);
      setActiveStep(3);
      enqueueSnackbar("Payment processed successfully!", { variant: "success" });
      setTimeout(() => {
        onPurchaseComplete(result);
        handleClose();
      }, 3e3);
    } catch (error) {
      console.error("❌ [LicensePurchaseFlow] Payment error:", error);
      enqueueSnackbar(error.message || "Payment failed. Please try again.", { variant: "error" });
    } finally {
      setProcessing(false);
    }
  });
  const handlePaymentError = (error) => {
    enqueueSnackbar(error, { variant: "error" });
  };
  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "Choose Your License Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, sx: { mb: 3 }, children: LICENSE_PLANS.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Card,
            {
              sx: {
                cursor: "pointer",
                border: selectedPlan.id === plan.id ? "2px solid" : "1px solid",
                borderColor: selectedPlan.id === plan.id ? "primary.main" : "divider",
                position: "relative",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-2px)"
                },
                transition: "all 0.2s ease-in-out"
              },
              onClick: () => setSelectedPlan(plan),
              children: [
                plan.popular && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: "Most Popular",
                    color: "primary",
                    size: "small",
                    sx: {
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 1
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", p: 3 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 1 }, children: plan.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h3", sx: { fontWeight: 700, mb: 1 }, children: [
                    "$",
                    plan.price,
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { component: "span", variant: "body1", color: "text.secondary", children: "/month" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
                    "Up to ",
                    plan.maxDevices,
                    " devices"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, children: plan.features.map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success", fontSize: "small" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: feature,
                        primaryTypographyProps: { variant: "body2" }
                      }
                    )
                  ] }, index)) })
                ] })
              ]
            }
          ) }, plan.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { p: 3, backgroundColor: "background.paper" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, alignItems: "center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Number of Licenses",
                type: "number",
                value: quantity,
                onChange: (e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1)),
                inputProps: { min: 1, max: 100 },
                helperText: `${quantity} × $${selectedPlan.price} = $${subtotal}/month`
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "right" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: [
                "Monthly Total: $",
                subtotal
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "+ taxes and fees" })
            ] }) })
          ] }) })
        ] });
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "Payment Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Order Summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
                selectedPlan.name,
                " Plan × ",
                quantity
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
                "$",
                subtotal.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Tax" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
                "$",
                tax.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", fontWeight: 600 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", children: [
                "$",
                total.toFixed(2)
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Elements, { stripe: stripePromise$1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            PaymentForm,
            {
              purchaseData,
              onPaymentSuccess: handlePaymentSuccess,
              onPaymentError: handlePaymentError,
              processing
            }
          ) })
        ] });
      case 2:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 80, color: "success.main", mb: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 2 }, children: "Payment Successful!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 4 }, children: "Your licenses have been activated and are ready to use." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3, textAlign: "left" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Purchase Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Plan:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: selectedPlan.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Licenses:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: quantity })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Monthly Cost:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", children: [
                  "$",
                  total.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Next Billing:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toLocaleDateString() })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, justifyContent: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
                onClick: () => enqueueSnackbar("Receipt downloaded", { variant: "success" }),
                children: "Download Receipt"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Key, {}),
                onClick: () => {
                  onPurchaseComplete({
                    licenses: [],
                    // Will be populated by backend
                    invoice: {},
                    subscription: {}
                  });
                  handleClose();
                },
                children: "View Licenses"
              }
            )
          ] })
        ] });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose: handleClose,
      maxWidth: "md",
      fullWidth: true,
      PaperProps: {
        sx: { minHeight: "70vh" }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600 }, children: "Purchase Licenses" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: handleClose, disabled: processing, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { sx: { pb: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { activeStep, orientation: "horizontal", sx: { mb: 4 }, children: steps.map((step, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { completed: step.completed, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepLabel, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: step.label }) }) }, step.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: 400 }, children: renderStepContent(activeStep) })
        ] }),
        activeStep < 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3, pt: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleBack,
              disabled: activeStep === 0 || processing,
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
              children: "Back"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1 } }),
          activeStep < 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleNext,
              variant: "contained",
              disabled: !isStepValid(activeStep),
              endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}),
              children: "Continue"
            }
          )
        ] })
      ]
    }
  );
};
const RENEWAL_PLANS = [
  {
    id: "basic-renewal",
    name: "Basic Renewal",
    tier: "BASIC",
    price: 29,
    duration: 12,
    discount: 10
    // 10% renewal discount
  },
  {
    id: "professional-renewal",
    name: "Professional Renewal",
    tier: "PROFESSIONAL",
    price: 99,
    duration: 12,
    discount: 15
    // 15% renewal discount
  },
  {
    id: "enterprise-renewal",
    name: "Enterprise Renewal",
    tier: "ENTERPRISE",
    price: 199,
    duration: 12,
    discount: 20
    // 20% renewal discount
  }
];
const RENEWAL_STEPS = [
  {
    id: "license-selection",
    label: "Select Licenses",
    description: "Choose which licenses to renew",
    completed: false
  },
  {
    id: "renewal-options",
    label: "Renewal Options",
    description: "Select renewal duration and plan",
    completed: false
  },
  {
    id: "payment",
    label: "Payment",
    description: "Complete your renewal payment",
    completed: false
  },
  {
    id: "confirmation",
    label: "Confirmation",
    description: "Review and activate renewed licenses",
    completed: false
  }
];
const stripePromise = loadStripe("pk_test_disabled");
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
};
const calculateExpirationDate = (currentExpiry, extensionMonths) => {
  const newDate = new Date(currentExpiry);
  newDate.setMonth(newDate.getMonth() + extensionMonths);
  return newDate;
};
const getAuthToken = () => __async(void 0, null, function* () {
  const { getAuth } = yield __vitePreload(() => __async(void 0, null, function* () {
    const { getAuth: getAuth2 } = yield import("./index.esm-D5-7iBdy.js");
    return { getAuth: getAuth2 };
  }), true ? __vite__mapDeps([10,7]) : void 0);
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return yield user.getIdToken();
});
const RenewalPaymentForm = ({ renewalData, onPaymentSuccess, onPaymentError, processing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = reactExports.useState(false);
  const [cardError, setCardError] = reactExports.useState(null);
  const handleSubmit = (event) => __async(void 0, null, function* () {
    event.preventDefault();
    if (!stripe || !elements) {
      onPaymentError("Stripe has not loaded yet. Please try again.");
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError("Card element not found. Please refresh and try again.");
      return;
    }
    try {
      const { error, paymentMethod } = yield stripe.createPaymentMethod({
        type: "card",
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
            country: renewalData.billingAddress.country
          }
        }
      });
      if (error) {
        onPaymentError(error.message || "Payment method creation failed");
        return;
      }
      onPaymentSuccess(paymentMethod);
    } catch (error) {
      onPaymentError(error.message || "An unexpected error occurred");
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "form", onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, {}),
        " Payment Details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardElement,
          {
            options: {
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4"
                  }
                }
              }
            },
            onChange: (event) => {
              var _a;
              setCardComplete(event.complete);
              setCardError(((_a = event.error) == null ? void 0 : _a.message) || null);
            }
          }
        ),
        cardError && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "error", sx: { mt: 1 }, children: cardError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Your payment is secured by Stripe. We never store your card information." }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "submit",
        variant: "contained",
        size: "large",
        fullWidth: true,
        disabled: !stripe || !cardComplete || processing,
        startIcon: processing ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {}),
        sx: {
          py: 1.5,
          background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
          color: "#000",
          fontWeight: 600,
          "&:disabled": {
            background: "#ccc"
          }
        },
        children: processing ? "Processing..." : `Renew Licenses - ${formatCurrency(renewalData.total)}`
      }
    )
  ] });
};
const LicenseRenewalWizard = ({
  open,
  onClose,
  expiringLicenses,
  onRenewalComplete
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = reactExports.useState(0);
  const [steps, setSteps] = reactExports.useState(RENEWAL_STEPS);
  const [processing, setProcessing] = reactExports.useState(false);
  const [selectedLicenses, setSelectedLicenses] = reactExports.useState([]);
  const [renewalDuration, setRenewalDuration] = reactExports.useState(12);
  reactExports.useEffect(() => {
    if (expiringLicenses.length > 0) {
      setSelectedLicenses(expiringLicenses);
    }
  }, [expiringLicenses]);
  const renewalData = reactExports.useMemo(() => {
    if (selectedLicenses.length === 0) {
      return {
        selectedLicenses: [],
        renewalPlan: RENEWAL_PLANS[1],
        // default to professional
        duration: renewalDuration,
        total: 0,
        tax: 0,
        subtotal: 0,
        discount: 0,
        billingAddress: {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: ""
        }
      };
    }
    const licensesByTier = selectedLicenses.reduce((acc, license) => {
      acc[license.tier] = (acc[license.tier] || 0) + 1;
      return acc;
    }, {});
    let subtotal = 0;
    let totalDiscount = 0;
    Object.entries(licensesByTier).forEach(([tier, count]) => {
      const plan = RENEWAL_PLANS.find((p) => p.tier === tier) || RENEWAL_PLANS[1];
      const tierSubtotal = plan.price * count;
      const tierDiscount = tierSubtotal * (plan.discount || 0) / 100;
      subtotal += tierSubtotal;
      totalDiscount += tierDiscount;
    });
    const discountedSubtotal = subtotal - totalDiscount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + tax;
    return {
      selectedLicenses,
      renewalPlan: RENEWAL_PLANS[1],
      // This could be dynamic based on selection
      duration: renewalDuration,
      total,
      tax,
      subtotal,
      discount: totalDiscount,
      billingAddress: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
      }
    };
  }, [selectedLicenses, renewalDuration]);
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
      setActiveStep(0);
      setSelectedLicenses([]);
      setSteps(RENEWAL_STEPS.map((step) => __spreadProps(__spreadValues({}, step), { completed: false })));
    }
  };
  const isStepValid = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return selectedLicenses.length > 0;
      case 1:
        return renewalDuration > 0;
      case 2:
        return true;
      default:
        return true;
    }
  };
  const handlePaymentSuccess = (paymentMethod) => __async(void 0, null, function* () {
    setProcessing(true);
    try {
      console.log("🔄 [LicenseRenewalWizard] Processing renewal payment with method:", paymentMethod.id);
      const response = yield fetch("/api/licenses/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${yield getAuthToken()}`
        },
        body: JSON.stringify({
          licenseIds: selectedLicenses.map((l) => l.id),
          duration: renewalDuration,
          paymentMethodId: paymentMethod.id,
          total: renewalData.total
        })
      });
      if (!response.ok) {
        throw new Error("Renewal processing failed");
      }
      const result = yield response.json();
      if (result.success) {
        const newSteps = [...steps];
        newSteps[3].completed = true;
        setSteps(newSteps);
        setActiveStep(4);
        enqueueSnackbar(
          `Successfully renewed ${selectedLicenses.length} license(s)!`,
          { variant: "success" }
        );
        onRenewalComplete(result.data);
      } else {
        throw new Error(result.error || "Renewal failed");
      }
    } catch (error) {
      console.error("❌ [LicenseRenewalWizard] Renewal error:", error);
      enqueueSnackbar(
        error.message || "Failed to process renewal. Please try again.",
        { variant: "error" }
      );
    } finally {
      setProcessing(false);
    }
  });
  const handlePaymentError = (error) => {
    enqueueSnackbar(error, { variant: "error" });
    setProcessing(false);
  };
  const handleLicenseToggle = (license) => {
    setSelectedLicenses((prev) => {
      const isSelected = prev.some((l) => l.id === license.id);
      if (isSelected) {
        return prev.filter((l) => l.id !== license.id);
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
  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "Select Licenses to Renew" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Expiring Licenses Found" }),
            "We found ",
            expiringLicenses.length,
            " license(s) that will expire within the next 30 days. Select which licenses you'd like to renew."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: selectedLicenses.length === expiringLicenses.length,
                  indeterminate: selectedLicenses.length > 0 && selectedLicenses.length < expiringLicenses.length,
                  onChange: handleSelectAll
                }
              ),
              label: `Select All (${expiringLicenses.length} licenses)`
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { padding: "checkbox", children: "Select" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "License" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Tier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Assigned To" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Expires" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Renewal Price" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: expiringLicenses.map((license) => {
              var _a;
              const isSelected = selectedLicenses.some((l) => l.id === license.id);
              const renewalPlan = RENEWAL_PLANS.find((p) => p.tier === license.tier) || RENEWAL_PLANS[1];
              const discountedPrice = renewalPlan.price * (1 - (renewalPlan.discount || 0) / 100);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { padding: "checkbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: isSelected,
                    onChange: () => handleLicenseToggle(license)
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: license.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: license.key })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: license.tier,
                    color: license.tier === "ENTERPRISE" ? "secondary" : "primary",
                    size: "small"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: license.assignedTo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 24, height: 24 }, children: ((_a = license.assignedTo.name) == null ? void 0 : _a.charAt(0)) || "?" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: license.assignedTo.name || license.assignedTo.email })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Unassigned" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Typography,
                  {
                    variant: "body2",
                    color: "warning.main",
                    sx: { fontWeight: 500 },
                    children: new Date(license.expiresAt).toLocaleDateString()
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: formatCurrency(discountedPrice) }),
                  renewalPlan.discount && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "success.main", children: [
                    renewalPlan.discount,
                    "% renewal discount"
                  ] })
                ] }) })
              ] }, license.id);
            }) })
          ] }) }),
          selectedLicenses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
            selectedLicenses.length,
            " license(s) selected for renewal. Total: ",
            formatCurrency(renewalData.subtotal - renewalData.discount)
          ] }) })
        ] });
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "Renewal Options" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Renewal Duration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Duration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: renewalDuration,
                    label: "Duration",
                    onChange: (e) => setRenewalDuration(Number(e.target.value)),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: 6, children: "6 Months" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: 12, children: "12 Months (Recommended)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: 24, children: "24 Months (Best Value)" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Longer renewals offer better value and fewer interruptions." })
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Renewal Summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: "Licenses to Renew",
                    secondary: `${selectedLicenses.length} licenses`
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: "Renewal Duration",
                    secondary: `${renewalDuration} months`
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: "New Expiration Date",
                    secondary: selectedLicenses.length > 0 ? calculateExpirationDate(new Date(selectedLicenses[0].expiresAt), renewalDuration).toLocaleDateString() : "N/A"
                  }
                ) })
              ] })
            ] }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mt: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Pricing Breakdown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Subtotal:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: formatCurrency(renewalData.subtotal) })
            ] }),
            renewalData.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "success.main", children: "Renewal Discount:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { color: "success.main", children: [
                "-",
                formatCurrency(renewalData.discount)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Tax (8%):" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: formatCurrency(renewalData.tax) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Total:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: formatCurrency(renewalData.total) })
            ] })
          ] }) })
        ] });
      case 2:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Elements, { stripe: stripePromise, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          RenewalPaymentForm,
          {
            renewalData,
            onPaymentSuccess: handlePaymentSuccess,
            onPaymentError: handlePaymentError,
            processing
          }
        ) });
      case 3:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 80, color: "success.main", mb: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { mb: 2 }, children: "Renewal Complete!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", sx: { mb: 3 }, children: [
            "Your ",
            selectedLicenses.length,
            " license(s) have been successfully renewed."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "success", sx: { mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "What happens next?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              "• Your licenses have been extended by ",
              renewalDuration,
              " months",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• A receipt has been sent to your email",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Your team can continue using their licenses without interruption"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              onClick: handleClose,
              sx: {
                background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                color: "#000",
                fontWeight: 600
              },
              children: "Done"
            }
          )
        ] });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose: handleClose,
      maxWidth: "lg",
      fullWidth: true,
      PaperProps: {
        sx: { minHeight: "80vh" }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600 }, children: "License Renewal" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: handleClose, disabled: processing, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { activeStep, orientation: "vertical", children: steps.map((step, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            StepLabel,
            {
              icon: step.completed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: index === activeStep ? "primary.main" : "grey.300",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 600
                  },
                  children: index + 1
                }
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: step.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: step.description })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StepContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { py: 2 }, children: renderStepContent(index) }) })
        ] }, step.id)) }) }),
        activeStep < steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleBack,
              disabled: activeStep === 0 || processing,
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
              children: "Back"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleNext,
              disabled: !isStepValid(activeStep) || processing,
              variant: "contained",
              endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}),
              sx: {
                background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                color: "#000",
                fontWeight: 600
              },
              children: activeStep === steps.length - 2 ? "Proceed to Payment" : "Next"
            }
          )
        ] })
      ]
    }
  );
};
const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PENDING":
      return "warning";
    case "SUSPENDED":
      return "error";
    case "EXPIRED":
      return "default";
    default:
      return "default";
  }
};
const getStatusIcon = (status) => {
  switch (status) {
    case "ACTIVE":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {});
    case "PENDING":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {});
    case "SUSPENDED":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BlockIcon, {});
    case "EXPIRED":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {});
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CardMembership, {});
  }
};
const getTierColor = (tier) => {
  switch (tier) {
    case "BASIC":
      return "default";
    case "PROFESSIONAL":
      return "primary";
    case "ENTERPRISE":
      return "secondary";
    default:
      return "default";
  }
};
const getUserDisplayName = (assignedTo, teamMembers) => {
  if (!assignedTo) return "Unassigned";
  if (teamMembers && assignedTo.email) {
    const teamMember = teamMembers.find((m) => m.email && m.email.toLowerCase() === assignedTo.email.toLowerCase());
    if (teamMember) {
      if (teamMember.firstName && teamMember.lastName) {
        return `${teamMember.firstName} ${teamMember.lastName}`;
      }
      if (teamMember.firstName) return teamMember.firstName;
      if (teamMember.lastName) return teamMember.lastName;
    }
  }
  if (assignedTo.name && assignedTo.name !== "Unknown User") {
    return assignedTo.name;
  }
  if (assignedTo.email) {
    const emailParts = assignedTo.email.split("@");
    const username = emailParts[0];
    return username.replace(/[._-]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
  }
  return "Unknown User";
};
const getUserInitials = (assignedTo, teamMembers) => {
  if (!assignedTo) return "?";
  const displayName = getUserDisplayName(assignedTo, teamMembers);
  if (displayName === "Unassigned" || displayName === "Unknown User") return "?";
  const words = displayName.split(" ");
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return displayName.charAt(0).toUpperCase();
};
const getTeamMemberDisplayName = (member) => {
  if (member.firstName && member.lastName) {
    return `${member.firstName} ${member.lastName}`;
  }
  if (member.firstName) return member.firstName;
  if (member.lastName) return member.lastName;
  return member.email.split("@")[0];
};
const LicensesPage = () => {
  var _a, _b, _c;
  const { enqueueSnackbar } = useSnackbar();
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { data: licenses, loading: licensesLoading, error: licensesError, refetch: refetchLicenses } = useOrganizationLicenses();
  const { data: teamMembers, loading: teamMembersLoading, error: teamMembersError } = useOrganizationTeamMembers();
  const updateLicense = useUpdateLicense();
  const assignLicense = useAssignLicense();
  useUnassignLicense();
  const [purchaseFlowOpen, setPurchaseFlowOpen] = reactExports.useState(false);
  const [renewalWizardOpen, setRenewalWizardOpen] = reactExports.useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = reactExports.useState(false);
  const [editDialogOpen, setEditDialogOpen] = reactExports.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = reactExports.useState(false);
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [selectedLicense, setSelectedLicense] = reactExports.useState(null);
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  const [assignEmail, setAssignEmail] = reactExports.useState("");
  const [assignUserId, setAssignUserId] = reactExports.useState("");
  const [editLicenseName, setEditLicenseName] = reactExports.useState("");
  const [editLicenseTier, setEditLicenseTier] = reactExports.useState("PROFESSIONAL");
  const [editLicenseStatus, setEditLicenseStatus] = reactExports.useState("PENDING");
  const [editLicenseExpiresAt, setEditLicenseExpiresAt] = reactExports.useState("");
  const isLoading = userLoading || orgLoading || licensesLoading || teamMembersLoading;
  const hasError = userError || orgError || licensesError || teamMembersError;
  reactExports.useEffect(() => {
    const handleLicenseRefresh = (event) => __async(void 0, null, function* () {
      var _a2;
      const customEvent = event;
      console.log("🔄 License refresh event received:", customEvent.detail);
      if (((_a2 = customEvent.detail) == null ? void 0 : _a2.action) === "created") {
        yield refetchLicenses();
      }
    });
    window.addEventListener("licenses:refresh", handleLicenseRefresh);
    return () => {
      window.removeEventListener("licenses:refresh", handleLicenseRefresh);
    };
  }, [refetchLicenses]);
  const licenseData = reactExports.useMemo(() => {
    if (!currentUser || !orgContext || !licenses) {
      return {
        licenses: [],
        filteredLicenses: [],
        stats: {
          totalLicenses: 0,
          activeLicenses: 0,
          expiringSoon: 0,
          unassignedLicenses: 0
        }
      };
    }
    const totalLicenses = licenses.length;
    const activeLicenses = licenses.filter((l) => l.status === "ACTIVE").length;
    const expiringSoon = licenses.filter((l) => {
      const expiryDate = new Date(l.expiresAt);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
      return expiryDate <= thirtyDaysFromNow;
    }).length;
    const unassignedLicenses = licenses.filter(
      (l) => l.status === "ACTIVE" && (!l.assignedToUserId || l.assignedToUserId === null)
    ).length;
    const enterpriseTotal = 250;
    const enterpriseAssigned = activeLicenses;
    const enterpriseAvailable = Math.max(0, enterpriseTotal - enterpriseAssigned);
    console.log("🔍 [LicensesPage] Raw data for calculation:", {
      ownerEmail: currentUser == null ? void 0 : currentUser.email,
      teamMembers: (teamMembers == null ? void 0 : teamMembers.map((m) => ({ email: m.email, status: m.status, role: m.role }))) || [],
      licenses: (licenses == null ? void 0 : licenses.map((l) => ({
        id: l.id,
        key: l.key,
        status: l.status,
        assignedToUserId: l.assignedToUserId,
        assignedToEmail: l.assignedToEmail
      }))) || [],
      totalLicenses,
      activeLicenses,
      unassignedLicenses
    });
    console.log("🔢 [LicensesPage] License calculation breakdown:", {
      totalLicenses,
      activeLicenses,
      unassignedLicenses,
      enterpriseTotal,
      enterpriseAssigned,
      enterpriseAvailable,
      calculation: `${activeLicenses} active licenses assigned out of ${enterpriseTotal} total enterprise licenses`
    });
    console.log("📊 [LicensesPage] Enterprise license stats:", {
      enterpriseTotal,
      enterpriseAssigned,
      enterpriseAvailable
    });
    const stats = {
      totalLicenses,
      activeLicenses,
      expiringSoon,
      unassignedLicenses,
      // Enterprise license info - now properly calculated
      enterpriseAvailable,
      enterpriseTotal,
      enterpriseAssigned
    };
    const filteredLicenses = statusFilter === "all" ? licenses : statusFilter === "EXPIRED" ? licenses.filter((l) => {
      const expiryDate = new Date(l.expiresAt);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
      return expiryDate <= thirtyDaysFromNow;
    }) : licenses.filter((l) => l.status === statusFilter);
    const sortedLicenses = [...filteredLicenses].sort((a, b) => {
      var _a2, _b2;
      const statusPriority = { "ACTIVE": 0, "PENDING": 1, "SUSPENDED": 2, "EXPIRED": 3 };
      const aPriority = (_a2 = statusPriority[a.status]) != null ? _a2 : 4;
      const bPriority = (_b2 = statusPriority[b.status]) != null ? _b2 : 4;
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      return a.name.localeCompare(b.name);
    });
    return { licenses, filteredLicenses: sortedLicenses, stats };
  }, [currentUser, orgContext, licenses, statusFilter]);
  const handleMenuClick = (event, license) => {
    console.log("🔧 [LicensesPage] Menu clicked for license:", license);
    setSelectedLicense(license);
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleCopyLicense = (key) => {
    navigator.clipboard.writeText(key);
    enqueueSnackbar("License key copied to clipboard", { variant: "success" });
    handleMenuClose();
  };
  const availableTeamMembers = reactExports.useMemo(() => {
    if (!teamMembers || !licenses) return [];
    const assignedUserIds = licenses.filter((l) => {
      var _a2;
      return (_a2 = l.assignedTo) == null ? void 0 : _a2.userId;
    }).map((l) => l.assignedTo.userId);
    return teamMembers.filter((member) => !assignedUserIds.includes(member.id));
  }, [teamMembers, licenses]);
  const handleAssignLicense = () => __async(void 0, null, function* () {
    if (!selectedLicense || !assignUserId) {
      enqueueSnackbar("Please select a valid team member to assign the license to", { variant: "error" });
      return;
    }
    try {
      yield assignLicense.mutate({ licenseId: selectedLicense.id, userId: assignUserId });
      const assignedMember = teamMembers == null ? void 0 : teamMembers.find((m) => m.id === assignUserId);
      const memberName = assignedMember ? getTeamMemberDisplayName(assignedMember) : "Unknown User";
      enqueueSnackbar(`License assigned to ${memberName}`, { variant: "success" });
      setAssignUserId("");
      setAssignDialogOpen(false);
      handleMenuClose();
      refetchLicenses();
    } catch (error) {
      enqueueSnackbar((error == null ? void 0 : error.message) || "Failed to assign license", { variant: "error" });
    }
  });
  const handleSuspendLicense = () => __async(void 0, null, function* () {
    if (!selectedLicense) return;
    try {
      yield updateLicense.mutate({
        licenseId: selectedLicense.id,
        updates: { status: "SUSPENDED" }
      });
      enqueueSnackbar(`License ${selectedLicense.name} has been suspended`, { variant: "warning" });
      refetchLicenses();
    } catch (error) {
      enqueueSnackbar((error == null ? void 0 : error.message) || "Failed to suspend license", { variant: "error" });
    }
    handleMenuClose();
  });
  const handleActivateLicense = () => __async(void 0, null, function* () {
    if (!selectedLicense) return;
    try {
      yield updateLicense.mutate({
        licenseId: selectedLicense.id,
        updates: { status: "ACTIVE" }
      });
      enqueueSnackbar(`License ${selectedLicense.name} has been activated`, { variant: "success" });
      refetchLicenses();
    } catch (error) {
      enqueueSnackbar((error == null ? void 0 : error.message) || "Failed to activate license", { variant: "error" });
    }
    handleMenuClose();
  });
  const handleDeleteLicense = () => {
    if (!selectedLicense) return;
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  const handleConfirmDelete = () => __async(void 0, null, function* () {
    if (!selectedLicense) return;
    try {
      enqueueSnackbar(`License ${selectedLicense.name} has been deleted`, { variant: "success" });
      setDeleteDialogOpen(false);
      setSelectedLicense(null);
      refetchLicenses();
    } catch (error) {
      enqueueSnackbar((error == null ? void 0 : error.message) || "Failed to delete license", { variant: "error" });
    }
  });
  const handleEditLicense = (license) => {
    const licenseToEdit = license || selectedLicense;
    if (!licenseToEdit) {
      console.error("🔧 [LicensesPage] No license provided for editing");
      enqueueSnackbar("Unable to load license data. Please try again.", { variant: "error" });
      return;
    }
    console.log("🔧 [LicensesPage] Opening edit dialog for license:", licenseToEdit);
    setSelectedLicense(licenseToEdit);
    setEditLicenseName(licenseToEdit.name);
    setEditLicenseTier(licenseToEdit.tier);
    setEditLicenseStatus(licenseToEdit.status);
    setEditLicenseExpiresAt(new Date(licenseToEdit.expiresAt).toISOString().split("T")[0]);
    handleMenuClose();
    setTimeout(() => {
      setEditDialogOpen(true);
    }, 10);
  };
  const handleSaveLicenseEdit = () => __async(void 0, null, function* () {
    if (!selectedLicense) return;
    try {
      yield updateLicense.mutate({
        licenseId: selectedLicense.id,
        updates: {
          name: editLicenseName,
          tier: editLicenseTier,
          status: editLicenseStatus,
          expiresAt: new Date(editLicenseExpiresAt)
        }
      });
      enqueueSnackbar(`License ${selectedLicense.name} updated successfully`, { variant: "success" });
      setEditDialogOpen(false);
      setSelectedLicense(null);
      refetchLicenses();
    } catch (error) {
      enqueueSnackbar((error == null ? void 0 : error.message) || "Failed to update license", { variant: "error" });
    }
  });
  const handlePurchaseComplete = (result) => __async(void 0, null, function* () {
    console.log("🎉 [LicensesPage] Purchase completed:", result);
    enqueueSnackbar(
      `Successfully purchased ${result.licenses.length} license(s)! They are now active and ready to use.`,
      {
        variant: "success",
        autoHideDuration: 6e3
      }
    );
    yield refetchLicenses();
    setPurchaseFlowOpen(false);
  });
  const handleRenewalComplete = (result) => __async(void 0, null, function* () {
    console.log("🔄 [LicensesPage] Renewal completed:", result);
    enqueueSnackbar(
      `Successfully renewed ${result.licenses.length} license(s)! Your licenses have been extended.`,
      {
        variant: "success",
        autoHideDuration: 6e3
      }
    );
    yield refetchLicenses();
    setRenewalWizardOpen(false);
  });
  const expiringLicenses = reactExports.useMemo(() => {
    if (!licenses) return [];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
    return licenses.filter((license) => {
      const expiryDate = new Date(license.expiresAt);
      return expiryDate <= thirtyDaysFromNow;
    });
  }, [licenses]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Loading License Data..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Fetching your licenses and subscription details" })
    ] }) });
  }
  if (hasError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Unable to Load License Data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "We encountered an issue loading your license information. This could be due to:" }),
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
  if (!currentUser || !orgContext) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Setting Up License Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "We're preparing your license management dashboard. This may take a moment for new accounts." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "License Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", color: "text.secondary", children: [
          "Manage your ",
          ((_a = orgContext.organization) == null ? void 0 : _a.name) || "Organization",
          " licenses and assignments",
          licenses && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "span", sx: { marginLeft: "8px", fontWeight: 500, color: "primary.main" }, children: [
            "• ",
            licenses.length,
            " total licenses"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
          onClick: () => setPurchaseFlowOpen(true),
          sx: {
            background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
            color: "#000",
            fontWeight: 600
          },
          children: "Purchase Licenses"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            height: "100%",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
            }
          },
          onClick: () => setStatusFilter("all"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h3", fontWeight: "bold", sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}),
                  " ",
                  licenseData.stats.enterpriseTotal
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { opacity: 0.9, mb: 1 }, children: "Enterprise Licenses" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { opacity: 0.8 }, children: [
                  "Available: ",
                  licenseData.stats.enterpriseAvailable,
                  "/",
                  licenseData.stats.enterpriseTotal
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { opacity: 0.7, fontSize: "0.75rem", display: "block", mt: 0.5 }, children: [
                  "Used: ",
                  licenseData.stats.enterpriseAssigned,
                  " (1 owner + ",
                  teamMembers ? teamMembers.filter((m) => {
                    var _a2;
                    return ((_a2 = m.status) == null ? void 0 : _a2.toLowerCase()) === "active" && m.email !== (currentUser == null ? void 0 : currentUser.email);
                  }).length : 0,
                  " team members + ",
                  Math.max(0, licenseData.stats.activeLicenses - (licenses ? licenses.filter((l) => {
                    var _a2;
                    return l.status === "ACTIVE" && ((_a2 = l.assignedTo) == null ? void 0 : _a2.email) === (currentUser == null ? void 0 : currentUser.email);
                  }).length : 0)),
                  " other active licenses)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardMembership, { sx: { fontSize: 48, opacity: 0.8 } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.7, fontSize: "0.875rem" }, children: "Unlimited projects • Full feature access • Team collaboration" })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            background: statusFilter === "ACTIVE" ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            height: "100%",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(17, 153, 142, 0.3)"
            }
          },
          onClick: () => setStatusFilter("ACTIVE"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: "bold", children: licenseData.stats.activeLicenses }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { opacity: 0.9, mb: 1 }, children: "Active Licenses" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.8 }, children: "Currently in use" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 48, opacity: 0.8 } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { opacity: 0.7, fontSize: "0.875rem" }, children: [
              licenseData.stats.activeLicenses,
              " of ",
              licenseData.stats.totalLicenses,
              " total licenses"
            ] })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
            height: "100%",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(79, 172, 254, 0.3)"
            }
          },
          onClick: () => setStatusFilter("EXPIRED"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: "bold", children: licenseData.stats.expiringSoon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { opacity: 0.9, mb: 1 }, children: "Expiring Soon" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.8 }, children: "Need attention" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { sx: { fontSize: 48, opacity: 0.8 } })
            ] }),
            licenseData.stats.expiringSoon > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                size: "small",
                onClick: (e) => {
                  e.stopPropagation();
                  setRenewalWizardOpen(true);
                },
                sx: {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)"
                  }
                },
                children: "Renew Now"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.7, fontSize: "0.875rem" }, children: "All licenses are up to date" })
          ] })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: [
            statusFilter === "all" ? "All Licenses" : statusFilter === "EXPIRED" ? "Expiring Soon Licenses" : `${statusFilter} Licenses`,
            " (",
            licenseData.filteredLicenses.length,
            ")"
          ] }),
          statusFilter !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: `Filtered by: ${statusFilter === "EXPIRED" ? "Expiring Soon" : statusFilter}`,
              color: "primary",
              onDelete: () => setStatusFilter("all"),
              deleteIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(BlockIcon, {}),
              variant: "outlined"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2 }, children: [
          statusFilter !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              size: "small",
              onClick: () => setStatusFilter("all"),
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(BlockIcon, {}),
              children: "Clear Filter"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
              onClick: () => enqueueSnackbar("License report downloaded", { variant: "success" }),
              children: "Export Report"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "License" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Tier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Assigned To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Department" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Expires" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: licenseData.filteredLicenses.map((license) => {
          var _a2, _b2;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 500 }, children: license.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontFamily: "monospace" }, children: license.key })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: license.tier,
                color: getTierColor(license.tier),
                size: "small",
                icon: license.tier === "ENTERPRISE" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}) : void 0
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                icon: getStatusIcon(license.status),
                label: license.status,
                color: getStatusColor(license.status),
                size: "small"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: license.assignedTo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Avatar,
                {
                  sx: { width: 24, height: 24 },
                  children: getUserInitials(license.assignedTo, teamMembers)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: getUserDisplayName(license.assignedTo, teamMembers) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: license.assignedTo.email })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Unassigned" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: license.assignedTo ? ((_a2 = teamMembers == null ? void 0 : teamMembers.find((m) => {
              var _a3;
              return m.email === ((_a3 = license.assignedTo) == null ? void 0 : _a3.email);
            })) == null ? void 0 : _a2.department) || "Not specified" : "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: license.assignedTo ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: ((_b2 = teamMembers == null ? void 0 : teamMembers.find((m) => {
                  var _a3;
                  return m.email === ((_a3 = license.assignedTo) == null ? void 0 : _a3.email);
                })) == null ? void 0 : _b2.role) || "Member",
                color: "primary",
                size: "small",
                variant: "outlined"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "body2",
                color: new Date(license.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) ? "warning.main" : "text.primary",
                children: new Date(license.expiresAt).toLocaleDateString()
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: (event) => handleMenuClick(event, license),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertIcon, {})
              }
            ) })
          ] }, license.id);
        }) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Fab,
      {
        color: "primary",
        sx: {
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", md: "none" },
          background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)"
        },
        onClick: () => setPurchaseFlowOpen(true),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {})
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: assignDialogOpen,
        onClose: () => setAssignDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Assign License" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: selectedLicense && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 3, mt: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              "Assigning license: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedLicense.name })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Assign To" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Select,
                {
                  value: assignUserId,
                  label: "Assign To",
                  onChange: (e) => setAssignUserId(e.target.value),
                  disabled: availableTeamMembers.length === 0,
                  children: availableTeamMembers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No available team members for assignment" }) }) : availableTeamMembers.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: member.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 24, height: 24 }, children: getTeamMemberDisplayName(member).charAt(0) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: getTeamMemberDisplayName(member) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: member.email })
                    ] })
                  ] }) }, member.id))
                }
              )
            ] }),
            availableTeamMembers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "All team members already have licenses assigned. To assign this license, you'll need to unassign another license first or invite new team members." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "The user will receive an email with instructions to activate their license." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setAssignDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: handleAssignLicense,
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, {}),
                children: "Assign License"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: deleteDialogOpen,
        onClose: () => setDeleteDialogOpen(false),
        maxWidth: "sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete License" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: selectedLicense && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", sx: { mb: 2 }, children: [
              "Are you sure you want to delete ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedLicense.name }),
              "?"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "This action cannot be undone. The license will be permanently removed and any assigned user will lose access." }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDeleteDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: handleConfirmDelete,
                variant: "contained",
                color: "error",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
                children: "Delete License"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: editDialogOpen,
        onClose: () => {
          setEditDialogOpen(false);
          setSelectedLicense(null);
        },
        maxWidth: "md",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}),
            "Edit License: ",
            (selectedLicense == null ? void 0 : selectedLicense.name) || "Loading..."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: selectedLicense ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 3, mt: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Key, {}),
                " Basic Information"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "License Name",
                    value: editLicenseName,
                    onChange: (e) => setEditLicenseName(e.target.value),
                    placeholder: "Development Team License",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "License Key",
                    value: selectedLicense.key,
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Key, {}) })
                    },
                    helperText: "License key is automatically generated and cannot be changed"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "License Tier" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: editLicenseTier,
                      label: "License Tier",
                      onChange: (e) => setEditLicenseTier(e.target.value),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "BASIC", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: "Basic" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Limited features • 2 max devices • Basic support" })
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PROFESSIONAL", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: "Professional" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Full features • 5 max devices • Priority support" })
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ENTERPRISE", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: "Enterprise" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Advanced features • 10 max devices • 24/7 support" })
                        ] }) })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Status" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: editLicenseStatus,
                      label: "Status",
                      onChange: (e) => setEditLicenseStatus(e.target.value),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PENDING", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, { color: "warning" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: "Pending" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Awaiting activation" })
                          ] })
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ACTIVE", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: "Active" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Fully operational" })
                          ] })
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "SUSPENDED", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(BlockIcon, { color: "error" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: "Suspended" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Temporarily disabled" })
                          ] })
                        ] }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "EXPIRED", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: "Expired" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Past expiration date" })
                          ] })
                        ] }) })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Expiration Date",
                  type: "date",
                  value: editLicenseExpiresAt,
                  onChange: (e) => setEditLicenseExpiresAt(e.target.value),
                  InputLabelProps: { shrink: true },
                  required: true,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {}) })
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Assignment, {}),
                " Usage & Limits"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Max Devices",
                    value: selectedLicense.usage.maxDevices,
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}) })
                    },
                    helperText: `${editLicenseTier} tier limit`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Current Devices",
                    value: selectedLicense.usage.deviceCount,
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) })
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "API Calls Used",
                    value: selectedLicense.usage.apiCalls.toLocaleString(),
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Assignment, {}) })
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Data Transfer (GB)",
                    value: selectedLicense.usage.dataTransfer,
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}) })
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { mb: 1 }, children: [
                  "Device Usage: ",
                  selectedLicense.usage.deviceCount,
                  " / ",
                  selectedLicense.usage.maxDevices
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  LinearProgress,
                  {
                    variant: "determinate",
                    value: selectedLicense.usage.deviceCount / selectedLicense.usage.maxDevices * 100,
                    sx: { height: 8, borderRadius: 4 },
                    color: selectedLicense.usage.deviceCount >= selectedLicense.usage.maxDevices ? "error" : "primary"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, {}),
                " Assignment Information"
              ] }),
              selectedLicense.assignedTo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Assigned To",
                    value: getUserDisplayName(selectedLicense.assignedTo, teamMembers),
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 20, height: 20 }, children: getUserInitials(selectedLicense.assignedTo, teamMembers) }) })
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "User Email",
                    value: selectedLicense.assignedTo.email,
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, {}) })
                    }
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: 'This license is currently unassigned. Use the "Assign License" action to assign it to a team member.' }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {}),
                " Organization & Metadata"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Organization",
                    value: ((_b = selectedLicense.organization) == null ? void 0 : _b.name) || "Unknown",
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {}) })
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Organization Tier",
                    value: ((_c = selectedLicense.organization) == null ? void 0 : _c.tier) || "BASIC",
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}) })
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Created Date",
                    value: selectedLicense.createdAt ? new Date(selectedLicense.createdAt).toLocaleDateString() : "Unknown",
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {}) })
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    fullWidth: true,
                    label: "Last Updated",
                    value: selectedLicense.updatedAt ? new Date(selectedLicense.updatedAt).toLocaleDateString() : "Unknown",
                    disabled: true,
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccessTime, {}) })
                    }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "warning", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500, mb: 1 }, children: "⚠️ Important Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                "• Changing the license tier will update device limits and feature access",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "• Status changes will immediately affect the user's access to the system",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "• Expiration date changes should be communicated to the license holder",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "• Some fields are system-managed and cannot be edited here"
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 40, sx: { mb: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Loading license data..." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "If this persists, please try again or refresh the page." })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setEditDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: handleSaveLicenseEdit,
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}),
                sx: {
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000",
                  fontWeight: 600
                },
                children: "Save Changes"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        anchorEl,
        open: Boolean(anchorEl),
        onClose: handleMenuClose,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => selectedLicense && handleCopyLicense(selectedLicense.key), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContentCopy, {}) }),
            "Copy License Key"
          ] }),
          !(selectedLicense == null ? void 0 : selectedLicense.assignedTo) && /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => setAssignDialogOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, {}) }),
            "Assign License"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => selectedLicense && handleEditLicense(selectedLicense), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}) }),
            "Edit License"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          (selectedLicense == null ? void 0 : selectedLicense.status) === "ACTIVE" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: handleSuspendLicense, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BlockIcon, {}) }),
            "Suspend License"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: handleActivateLicense, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) }),
            "Activate License"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: handleDeleteLicense, sx: { color: "error.main" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { sx: { color: "error.main" } }) }),
            "Delete License"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LicensePurchaseFlow,
      {
        open: purchaseFlowOpen,
        onClose: () => setPurchaseFlowOpen(false),
        initialPlan: "professional",
        initialQuantity: 1,
        onPurchaseComplete: handlePurchaseComplete
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LicenseRenewalWizard,
      {
        open: renewalWizardOpen,
        onClose: () => setRenewalWizardOpen(false),
        expiringLicenses,
        onRenewalComplete: handleRenewalComplete
      }
    )
  ] });
};
export {
  LicensesPage as default
};
