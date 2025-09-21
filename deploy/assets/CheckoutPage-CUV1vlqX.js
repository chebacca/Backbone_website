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
import { j as jsxRuntimeExports, B as Box, T as Typography, c as Paper, F as FormControlLabel, r as Chip, s as Switch, G as Grid, t as Card, v as Star, w as CardContent, x as List, y as ListItem, z as ListItemIcon, m as CheckIcon, H as ListItemText, a as Button, e as TextField, f as PersonIcon, Z as Business, Y as Group, D as Divider, M as MenuItem, Q as Accordion, U as AccordionSummary, W as ExpandMoreIcon, X as AccordionDetails, k as Link, l as Checkbox, ar as CreditCard, d as Alert, J as Security, S as Stack, b as Container, A as ArrowBack, _ as Stepper, $ as Step, a0 as StepLabel, q as ArrowForward, a1 as ShoppingCart, a2 as PaymentIcon, p as CheckCircleIcon } from "./mui-C-OPHTyf.js";
import { b as React, L as Link$1, r as reactExports, u as useNavigate, e as useLocation } from "./vendor-Cu2L4Rr-.js";
import { c as api, e as endpoints, u as useAuth, a as useLoading } from "./index-BIhewz1i.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { N as Navigation } from "./Navigation-CfhoBjLC.js";
import { u as useForm, C as Controller } from "./index.esm-aV5ahHn5.js";
import { u as useStripe, a as useElements, b as CardNumberElement, c as CardExpiryElement, d as CardCvcElement } from "./stripe-DBN2V-e6.js";
import "./ThemeToggle-Cixmekz6.js";
const paymentService = {
  /**
   * Get pricing tiers
   */
  getPricingTiers() {
    return __async(this, null, function* () {
      const response = yield api.get(endpoints.payments.pricing());
      if (response.data.success) {
        return response.data.data.pricingTiers;
      } else {
        throw new Error(response.data.message || "Failed to get pricing");
      }
    });
  },
  /**
   * Calculate tax for a given amount and address
   */
  calculateTax(request) {
    return __async(this, null, function* () {
      const response = yield api.post(endpoints.payments.calculateTax(), request);
      if (response.data.success) {
        return response.data.data.taxCalculation;
      } else {
        throw new Error(response.data.message || "Failed to calculate tax");
      }
    });
  },
  /**
   * Create a subscription with payment
   */
  createSubscription(request) {
    return __async(this, null, function* () {
      const response = yield api.post(endpoints.payments.createSubscription(), request);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to create subscription");
      }
    });
  },
  /**
   * Get payment history
   */
  getPaymentHistory() {
    return __async(this, arguments, function* (options = {}) {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      const response = yield api.get(`${endpoints.payments.history()}?${params}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to get payment history");
      }
    });
  },
  /**
   * Get user invoices
   */
  getUserInvoices() {
    return __async(this, arguments, function* (options = {}) {
      const params = new URLSearchParams();
      if (options.page) params.append("page", options.page.toString());
      if (options.limit) params.append("limit", options.limit.toString());
      const response = yield api.get(`${endpoints.invoices.list()}?${params}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to get invoices");
      }
    });
  },
  /**
   * Get specific payment details
   */
  getPaymentDetails(paymentId) {
    return __async(this, null, function* () {
      const response = yield api.get(endpoints.payments.details(paymentId));
      if (response.data.success) {
        return response.data.data.payment;
      } else {
        throw new Error(response.data.message || "Failed to get payment details");
      }
    });
  },
  /**
   * Cancel subscription
   */
  cancelSubscription(_0) {
    return __async(this, arguments, function* (subscriptionId, options = {}) {
      const response = yield api.post(endpoints.payments.cancelSubscription(subscriptionId), options);
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to cancel subscription");
      }
    });
  },
  /**
   * Update payment method
   */
  updatePaymentMethod(subscriptionId, paymentMethodId) {
    return __async(this, null, function* () {
      const response = yield api.put(endpoints.payments.updatePaymentMethod(subscriptionId), {
        paymentMethodId
      });
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to update payment method");
      }
    });
  },
  /**
   * Validate billing address
   */
  validateBillingAddress(address) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const errors = [];
    if (!((_a = address.firstName) == null ? void 0 : _a.trim())) errors.push("First name is required");
    if (!((_b = address.lastName) == null ? void 0 : _b.trim())) errors.push("Last name is required");
    if (!((_c = address.addressLine1) == null ? void 0 : _c.trim())) errors.push("Address is required");
    if (!((_d = address.city) == null ? void 0 : _d.trim())) errors.push("City is required");
    if (!((_e = address.postalCode) == null ? void 0 : _e.trim())) errors.push("Postal code is required");
    if (!((_f = address.country) == null ? void 0 : _f.trim()) || address.country.length !== 2) {
      errors.push("Valid country code is required");
    }
    if (address.country === "US" && !((_g = address.state) == null ? void 0 : _g.trim())) {
      errors.push("State is required for US addresses");
    }
    if (address.country === "CA" && !((_h = address.state) == null ? void 0 : _h.trim())) {
      errors.push("Province is required for Canadian addresses");
    }
    return {
      valid: errors.length === 0,
      errors
    };
  },
  /**
   * Format currency amount
   */
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    }).format(amount / 100);
  },
  /**
   * Format tax rate as percentage
   */
  formatTaxRate(rate) {
    return `${(rate * 100).toFixed(2)}%`;
  },
  /**
   * Get payment status display information
   */
  getPaymentStatusInfo(status) {
    switch (status.toLowerCase()) {
      case "succeeded":
        return { color: "success", label: "Successful" };
      case "pending":
        return { color: "warning", label: "Pending" };
      case "failed":
        return { color: "error", label: "Failed" };
      case "canceled":
        return { color: "default", label: "Canceled" };
      case "requires_action":
        return { color: "info", label: "Action Required" };
      default:
        return { color: "default", label: status };
    }
  },
  /**
   * Calculate subscription pricing
   */
  calculateSubscriptionPricing(pricePerSeat, seats, taxRate = 0, isYearly = false) {
    let subtotal = pricePerSeat * seats;
    const discount = isYearly ? Math.round(subtotal * 2 / 12) : 0;
    const discountedSubtotal = subtotal - discount;
    const taxAmount = Math.round(discountedSubtotal * taxRate);
    const total = discountedSubtotal + taxAmount;
    return {
      subtotal,
      discount,
      taxAmount,
      total
    };
  },
  /**
   * Validate payment form data
   */
  validatePaymentForm(data) {
    const errors = {};
    if (!data.tier) {
      errors.tier = "Please select a plan";
    }
    if (!data.seats || data.seats < 1) {
      errors.seats = "At least 1 seat is required";
    }
    if (data.tier === "BASIC" && data.seats > 1) {
      errors.seats = "Basic plan is limited to 1 seat";
    }
    if (data.tier === "PRO" && data.seats > 50) {
      errors.seats = "Pro plan is limited to 50 seats";
    }
    if (data.tier === "ENTERPRISE" && data.seats < 10) {
      errors.seats = "Enterprise plan requires minimum 10 seats";
    }
    const addressValidation = this.validateBillingAddress(data.billingAddress);
    if (!addressValidation.valid) {
      errors.billingAddress = addressValidation.errors.join(", ");
    }
    if (!data.acceptTerms) {
      errors.acceptTerms = "You must accept the Terms of Service";
    }
    if (!data.acceptPrivacy) {
      errors.acceptPrivacy = "You must accept the Privacy Policy";
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
};
const PlanSelectionStep = ({
  pricingTiers,
  selectedTier,
  seats,
  isYearly,
  onUpdate
}) => {
  const handleTierSelect = (tierId) => {
    const tier = pricingTiers.find((t) => t.id === tierId);
    if (!tier) return;
    let newSeats = seats;
    if (tier.id === "BASIC" && seats > 1) {
      newSeats = 1;
    } else if (tier.id === "ENTERPRISE" && seats < 10) {
      newSeats = 10;
    }
    onUpdate({ tier: tierId, seats: newSeats });
  };
  const handleSeatsChange = (newSeats) => {
    const tier = pricingTiers.find((t) => t.id === selectedTier);
    if (!tier) return;
    if (tier.id === "BASIC" && newSeats > 1) return;
    if (tier.id === "PRO" && newSeats > 50) return;
    if (tier.id === "ENTERPRISE" && newSeats < 10) return;
    if (newSeats < 1) return;
    onUpdate({ seats: newSeats });
  };
  const getIcon = (tierId) => {
    switch (tierId) {
      case "BASIC":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {});
      case "PRO":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {});
      case "ENTERPRISE":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {});
    }
  };
  const formatPrice = (tier) => {
    if (!tier.price) return "Custom";
    const price = isYearly ? tier.price * 10 : tier.price;
    return `$${price}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { mb: 1, fontWeight: 600 }, children: "Choose Your Plan" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 4 }, children: "Select the plan that best fits your needs. You can change or cancel anytime." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", mb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        elevation: 2,
        sx: {
          display: "inline-flex",
          p: 0.5,
          backgroundColor: "background.paper",
          borderRadius: 4
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormControlLabel,
          {
            control: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: isYearly,
                onChange: (e) => onUpdate({ isYearly: e.target.checked }),
                color: "primary"
              }
            ),
            label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Annual billing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: "Save 17%",
                  size: "small",
                  color: "primary",
                  variant: "outlined"
                }
              )
            ] }),
            sx: { m: 1 }
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: pricingTiers.map((tier) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        sx: {
          height: "100%",
          position: "relative",
          backgroundColor: tier.id === selectedTier ? "primary.dark" : "background.paper",
          border: tier.id === selectedTier ? "2px solid" : "1px solid rgba(255, 255, 255, 0.1)",
          borderColor: tier.id === selectedTier ? "primary.main" : void 0,
          cursor: "pointer",
          transition: "all 0.3s ease"
        },
        onClick: () => handleTierSelect(tier.id),
        children: [
          tier.popular && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}),
              label: "Most Popular",
              color: "primary",
              sx: { fontWeight: 600, color: "#000" }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 3, height: "100%", display: "flex", flexDirection: "column" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 48, height: 48, borderRadius: 2, backgroundColor: tier.id === selectedTier ? "rgba(0, 212, 255, 0.2)" : "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "primary.main" }, children: getIcon(tier.id) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 1 }, children: tier.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: tier.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: formatPrice(tier) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: tier.price ? isYearly ? "/year" : "/month" : "Contact Sales" })
              ] }),
              tier.maxSeats && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Up to ",
                tier.maxSeats,
                " ",
                tier.maxSeats === 1 ? "user" : "users"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, sx: { p: 0, flexGrow: 1 }, children: tier.features.slice(0, 6).map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0, py: 0.25 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 20 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 14, color: "success.main" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: feature,
                  primaryTypographyProps: {
                    variant: "body2",
                    sx: { fontSize: "0.8rem" }
                  }
                }
              )
            ] }, index)) }),
            tier.id === selectedTier && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                fullWidth: true,
                sx: {
                  mt: 2,
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000"
                },
                children: "Selected"
              }
            )
          ] })
        ]
      }
    ) }) }, tier.id)) }),
    selectedTier && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "Number of Seats" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, alignItems: "center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Number of seats",
            type: "number",
            value: seats,
            onChange: (e) => handleSeatsChange(parseInt(e.target.value) || 1),
            inputProps: {
              min: selectedTier === "ENTERPRISE" ? 10 : 1,
              max: selectedTier === "BASIC" ? 1 : selectedTier === "PRO" ? 50 : 1e3
            },
            helperText: selectedTier === "BASIC" ? "Basic plan includes 1 seat only" : selectedTier === "PRO" ? "Pro plan supports up to 50 seats" : "Enterprise plan minimum 10 seats"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Each seat allows one user to access BackboneLogic, Inc." }) })
      ] })
    ] })
  ] });
};
const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" }
  // Add more countries as needed
];
const usStates = [
  { code: "AL", name: "Alabama" },
  { code: "CA", name: "California" },
  { code: "FL", name: "Florida" },
  { code: "NY", name: "New York" },
  { code: "TX", name: "Texas" }
  // Add more states as needed
];
const BillingDetailsStep = ({
  billingAddress,
  taxInformation,
  businessProfile,
  acceptTerms,
  acceptPrivacy,
  onUpdate
}) => {
  var _a, _b, _c;
  const {
    control,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      billingAddress,
      taxInformation,
      businessProfile,
      acceptTerms,
      acceptPrivacy
    }
  });
  const watchedValues = watch();
  const selectedCountry = (_a = watchedValues.billingAddress) == null ? void 0 : _a.country;
  const fieldErrors = errors;
  React.useEffect(() => {
    onUpdate(watchedValues);
  }, [watchedValues, onUpdate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { mb: 1, fontWeight: 600 }, children: "Billing Information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 4 }, children: "Please provide your billing details for invoicing and compliance." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {}),
        " Contact Information"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.firstName",
          control,
          rules: { required: "First name is required" },
          render: ({ field }) => {
            var _a2, _b2, _c2;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              __spreadProps(__spreadValues({}, field), {
                fullWidth: true,
                label: "First Name",
                error: !!((_a2 = fieldErrors.billingAddress) == null ? void 0 : _a2.firstName),
                helperText: (_c2 = (_b2 = fieldErrors.billingAddress) == null ? void 0 : _b2.firstName) == null ? void 0 : _c2.message
              })
            );
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.lastName",
          control,
          rules: { required: "Last name is required" },
          render: ({ field }) => {
            var _a2, _b2, _c2;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              __spreadProps(__spreadValues({}, field), {
                fullWidth: true,
                label: "Last Name",
                error: !!((_a2 = fieldErrors.billingAddress) == null ? void 0 : _a2.lastName),
                helperText: (_c2 = (_b2 = fieldErrors.billingAddress) == null ? void 0 : _b2.lastName) == null ? void 0 : _c2.message
              })
            );
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.company",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            __spreadProps(__spreadValues({}, field), {
              fullWidth: true,
              label: "Company (Optional)",
              helperText: "If purchasing for a business"
            })
          )
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "Billing Address" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.addressLine1",
          control,
          rules: { required: "Address is required" },
          render: ({ field }) => {
            var _a2, _b2, _c2;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              __spreadProps(__spreadValues({}, field), {
                fullWidth: true,
                label: "Address Line 1",
                error: !!((_a2 = fieldErrors.billingAddress) == null ? void 0 : _a2.addressLine1),
                helperText: (_c2 = (_b2 = fieldErrors.billingAddress) == null ? void 0 : _b2.addressLine1) == null ? void 0 : _c2.message
              })
            );
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.addressLine2",
          control,
          render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            __spreadProps(__spreadValues({}, field), {
              fullWidth: true,
              label: "Address Line 2 (Optional)"
            })
          )
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.city",
          control,
          rules: { required: "City is required" },
          render: ({ field }) => {
            var _a2, _b2, _c2;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              __spreadProps(__spreadValues({}, field), {
                fullWidth: true,
                label: "City",
                error: !!((_a2 = fieldErrors.billingAddress) == null ? void 0 : _a2.city),
                helperText: (_c2 = (_b2 = fieldErrors.billingAddress) == null ? void 0 : _b2.city) == null ? void 0 : _c2.message
              })
            );
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.postalCode",
          control,
          rules: { required: "Postal code is required" },
          render: ({ field }) => {
            var _a2, _b2, _c2;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              __spreadProps(__spreadValues({}, field), {
                fullWidth: true,
                label: "Postal Code",
                error: !!((_a2 = fieldErrors.billingAddress) == null ? void 0 : _a2.postalCode),
                helperText: (_c2 = (_b2 = fieldErrors.billingAddress) == null ? void 0 : _b2.postalCode) == null ? void 0 : _c2.message
              })
            );
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.country",
          control,
          rules: { required: "Country is required" },
          render: ({ field }) => {
            var _a2, _b2, _c2;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              __spreadProps(__spreadValues({}, field), {
                fullWidth: true,
                select: true,
                label: "Country",
                error: !!((_a2 = fieldErrors.billingAddress) == null ? void 0 : _a2.country),
                helperText: (_c2 = (_b2 = fieldErrors.billingAddress) == null ? void 0 : _b2.country) == null ? void 0 : _c2.message,
                children: countries.map((country) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: country.code, children: country.name }, country.code))
              })
            );
          }
        }
      ) }),
      (selectedCountry === "US" || selectedCountry === "CA") && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "billingAddress.state",
          control,
          rules: { required: "State/Province is required" },
          render: ({ field }) => {
            var _a2, _b2, _c2;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              __spreadProps(__spreadValues({}, field), {
                fullWidth: true,
                select: true,
                label: selectedCountry === "US" ? "State" : "Province",
                error: !!((_a2 = fieldErrors.billingAddress) == null ? void 0 : _a2.state),
                helperText: (_c2 = (_b2 = fieldErrors.billingAddress) == null ? void 0 : _b2.state) == null ? void 0 : _c2.message,
                children: usStates.map((state) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: state.code, children: state.name }, state.code))
              })
            );
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Accordion, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionSummary, { expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Business Information (Optional)" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "businessProfile.companyName",
              control,
              render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  fullWidth: true,
                  label: "Company Name",
                  helperText: "Required for business purchases and volume discounts"
                })
              )
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "businessProfile.companyType",
              control,
              render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  fullWidth: true,
                  select: true,
                  label: "Company Type",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "SOLE_PROPRIETORSHIP", children: "Sole Proprietorship" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PARTNERSHIP", children: "Partnership" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "LLC", children: "LLC" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CORPORATION", children: "Corporation" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "NON_PROFIT", children: "Non-Profit" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "GOVERNMENT", children: "Government" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "OTHER", children: "Other" })
                  ]
                })
              )
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "taxInformation.taxId",
              control,
              render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  fullWidth: true,
                  label: "Tax ID / VAT Number",
                  helperText: "For tax exemption and business verification"
                })
              )
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "businessProfile.businessDescription",
              control,
              render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  fullWidth: true,
                  multiline: true,
                  rows: 3,
                  label: "Business Description",
                  helperText: "Brief description of your business (optional)"
                })
              )
            }
          ) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "Legal Agreements" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "acceptTerms",
          control,
          rules: { required: "You must accept the Terms of Service" },
          render: ({ field: { value, onChange } }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: value,
                  onChange,
                  color: "primary",
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, border: "2px solid", borderColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 } }),
                  checkedIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, backgroundColor: "primary.main", color: "#000", borderRadius: 0.5, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 14 } }) })
                }
              ),
              label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                "I agree to the",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    component: Link$1,
                    to: "/terms",
                    target: "_blank",
                    sx: { color: "primary.main" },
                    children: "Terms of Service"
                  }
                ),
                " ",
                "and",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    component: Link$1,
                    to: "/sla",
                    target: "_blank",
                    sx: { color: "primary.main" },
                    children: "Service Level Agreement"
                  }
                )
              ] }),
              sx: __spreadValues({
                alignItems: "flex-start"
              }, errors.acceptTerms && {
                color: "error.main"
              })
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Controller,
        {
          name: "acceptPrivacy",
          control,
          rules: { required: "You must accept the Privacy Policy" },
          render: ({ field: { value, onChange } }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: value,
                  onChange,
                  color: "primary",
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, border: "2px solid", borderColor: "rgba(255,255,255,0.3)", borderRadius: 0.5 } }),
                  checkedIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, backgroundColor: "primary.main", color: "#000", borderRadius: 0.5, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 14 } }) })
                }
              ),
              label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                "I agree to the",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    component: Link$1,
                    to: "/privacy",
                    target: "_blank",
                    sx: { color: "primary.main" },
                    children: "Privacy Policy"
                  }
                ),
                " ",
                "and consent to data processing for billing and service delivery"
              ] }),
              sx: __spreadValues({
                alignItems: "flex-start"
              }, errors.acceptPrivacy && {
                color: "error.main"
              })
            }
          )
        }
      ) }),
      (errors.acceptTerms || errors.acceptPrivacy) && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "error.main", children: ((_b = errors.acceptTerms) == null ? void 0 : _b.message) || ((_c = errors.acceptPrivacy) == null ? void 0 : _c.message) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4, p: 3, backgroundColor: "rgba(255, 255, 255, 0.02)", borderRadius: 2, border: "1px solid rgba(255, 255, 255, 0.1)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Privacy & Compliance Notice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Your information is collected in accordance with GDPR, CCPA, and other applicable privacy laws. We use industry-standard encryption and security measures to protect your data. Tax information is used solely for compliance and billing purposes." })
    ] })
  ] });
};
const PaymentMethodStep = ({
  checkoutData,
  taxCalculation,
  onComplete
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [cardComplete, setCardComplete] = reactExports.useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false
  });
  const selectedTier = React.useMemo(() => {
    const tiers = {
      BASIC: { name: "Basic", price: 2900 },
      PRO: { name: "Pro", price: 9900 },
      ENTERPRISE: { name: "Enterprise", price: null }
    };
    return tiers[checkoutData.tier];
  }, [checkoutData.tier]);
  const calculateTotal = () => {
    if (!(selectedTier == null ? void 0 : selectedTier.price)) return 0;
    const subtotal = selectedTier.price * checkoutData.seats;
    const taxAmount = (taxCalculation == null ? void 0 : taxCalculation.taxAmount) || 0;
    return subtotal + taxAmount;
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount / 100);
  };
  const handleSubmit = (event) => __async(void 0, null, function* () {
    event.preventDefault();
    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      return;
    }
    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setError("Card element not found. Please refresh and try again.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const { error: stripeError, paymentMethod } = yield stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: `${checkoutData.billingAddress.firstName} ${checkoutData.billingAddress.lastName}`,
          email: "user@example.com",
          // This would come from user context
          address: {
            line1: checkoutData.billingAddress.addressLine1,
            line2: checkoutData.billingAddress.addressLine2,
            city: checkoutData.billingAddress.city,
            state: checkoutData.billingAddress.state,
            postal_code: checkoutData.billingAddress.postalCode,
            country: checkoutData.billingAddress.country
          }
        }
      });
      if (stripeError) {
        setError(stripeError.message || "Payment method creation failed");
        return;
      }
      if (!paymentMethod) {
        setError("Failed to create payment method");
        return;
      }
      yield onComplete(paymentMethod.id);
    } catch (err) {
      setError(err.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  });
  const isFormValid = Object.values(cardComplete).every(Boolean) && checkoutData.acceptTerms && checkoutData.acceptPrivacy;
  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        "::placeholder": {
          color: "rgba(255, 255, 255, 0.5)"
        }
      },
      invalid: {
        color: "#f44336",
        iconColor: "#f44336"
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { mb: 1, fontWeight: 600 }, children: "Payment Method" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 4 }, children: "Complete your purchase with secure payment processing by Stripe." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, lg: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          elevation: 2,
          sx: {
            p: 4,
            backgroundColor: "background.paper",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { sx: { color: "primary.main" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Credit Card Information" })
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSubmit, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 1, fontWeight: 500 }, children: "Card Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 1, backgroundColor: "rgba(255, 255, 255, 0.05)", "&:focus-within": { borderColor: "primary.main", boxShadow: "0 0 0 2px rgba(0, 212, 255, 0.2)" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardNumberElement,
                  {
                    options: cardElementOptions,
                    onChange: (event) => {
                      setCardComplete((prev) => __spreadProps(__spreadValues({}, prev), { cardNumber: event.complete }));
                      if (event.error) {
                        setError(event.error.message);
                      } else {
                        setError(null);
                      }
                    }
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, sm: 6, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 1, fontWeight: 500 }, children: "Expiry Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 1, backgroundColor: "rgba(255, 255, 255, 0.05)", "&:focus-within": { borderColor: "primary.main", boxShadow: "0 0 0 2px rgba(0, 212, 255, 0.2)" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardExpiryElement,
                  {
                    options: cardElementOptions,
                    onChange: (event) => {
                      setCardComplete((prev) => __spreadProps(__spreadValues({}, prev), { cardExpiry: event.complete }));
                      if (event.error) {
                        setError(event.error.message);
                      } else if (error && event.complete) {
                        setError(null);
                      }
                    }
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, sm: 6, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 1, fontWeight: 500 }, children: "CVC" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 1, backgroundColor: "rgba(255, 255, 255, 0.05)", "&:focus-within": { borderColor: "primary.main", boxShadow: "0 0 0 2px rgba(0, 212, 255, 0.2)" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardCvcElement,
                  {
                    options: cardElementOptions,
                    onChange: (event) => {
                      setCardComplete((prev) => __spreadProps(__spreadValues({}, prev), { cardCvc: event.complete }));
                      if (event.error) {
                        setError(event.error.message);
                      } else if (error && event.complete) {
                        setError(null);
                      }
                    }
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "submit",
                    variant: "contained",
                    size: "large",
                    fullWidth: true,
                    disabled: !isFormValid || isProcessing || !stripe,
                    sx: {
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                      color: "#000",
                      "&:disabled": {
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.5)"
                      }
                    },
                    children: isProcessing ? "Processing Payment..." : `Complete Purchase - ${formatCurrency(calculateTotal())}`
                  }
                )
              ] })
            ] }) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, lg: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: 2,
            sx: {
              p: 3,
              backgroundColor: "background.paper",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 3 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { sx: { color: "success.main" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Secure Payment" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 18, color: "success.main" } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: "256-bit SSL Encryption",
                      primaryTypographyProps: { variant: "body2" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 18, color: "success.main" } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: "PCI DSS Compliant",
                      primaryTypographyProps: { variant: "body2" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 18, color: "success.main" } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: "SOC 2 Type II Certified",
                      primaryTypographyProps: { variant: "body2" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 18, color: "success.main" } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: "14-Day Money Back Guarantee",
                      primaryTypographyProps: { variant: "body2" }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Powered by Stripe" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", gap: 1, mb: 2 }, children: ["Visa", "Mastercard", "American Express", "Discover"].map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { px: 1, py: 0.5, backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 1, fontSize: "0.75rem" }, children: card }, card)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Your payment information is never stored on our servers" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: 2,
            sx: {
              p: 3,
              mt: 3,
              backgroundColor: "background.paper",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "What Happens Next?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0, alignItems: "flex-start" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32, mt: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, borderRadius: "50%", backgroundColor: "primary.main", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }, children: "1" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: "Instant License Generation",
                      secondary: "Your license keys are generated immediately upon payment",
                      primaryTypographyProps: { variant: "body2", fontWeight: 500 },
                      secondaryTypographyProps: { variant: "caption" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0, alignItems: "flex-start" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32, mt: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, borderRadius: "50%", backgroundColor: "primary.main", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }, children: "2" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: "Email Confirmation",
                      secondary: "Receipt and license details sent to your email",
                      primaryTypographyProps: { variant: "body2", fontWeight: 500 },
                      secondaryTypographyProps: { variant: "caption" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0, alignItems: "flex-start" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32, mt: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, borderRadius: "50%", backgroundColor: "primary.main", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }, children: "3" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: "Dashboard Access",
                      secondary: "Manage your licenses and team from your dashboard",
                      primaryTypographyProps: { variant: "body2", fontWeight: 500 },
                      secondaryTypographyProps: { variant: "caption" }
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      ] }) })
    ] })
  ] });
};
const OrderSummary = ({
  selectedTier,
  seats,
  isYearly = false,
  taxCalculation
}) => {
  if (!selectedTier) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: 3,
        sx: {
          p: 4,
          backgroundColor: "background.paper",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          position: "sticky",
          top: 100
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "Order Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Please select a plan to see pricing details." })
        ]
      }
    );
  }
  const getIcon = () => {
    switch (selectedTier.id) {
      case "BASIC":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {});
      case "PRO":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {});
      case "ENTERPRISE":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {});
    }
  };
  const calculatePricing = () => {
    if (!selectedTier.price) {
      return { subtotal: 0, discount: 0, total: 0 };
    }
    const monthlyPrice = selectedTier.price * seats;
    let subtotal = monthlyPrice;
    let discount = 0;
    if (isYearly) {
      subtotal = monthlyPrice * 12;
      discount = monthlyPrice * 2;
    }
    const discountedSubtotal = subtotal - discount;
    const taxAmount = (taxCalculation == null ? void 0 : taxCalculation.taxAmount) || 0;
    const total = discountedSubtotal + taxAmount;
    return {
      subtotal,
      discount,
      discountedSubtotal,
      taxAmount,
      total
    };
  };
  const pricing = calculatePricing();
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount / 100);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Paper,
    {
      elevation: 3,
      sx: {
        backgroundColor: "background.paper",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 100
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, background: selectedTier.popular ? "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)" : "rgba(255, 255, 255, 0.05)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 48, height: 48, borderRadius: 2, backgroundColor: selectedTier.popular ? "rgba(0, 212, 255, 0.2)" : "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "primary.main" }, children: getIcon() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: selectedTier.name }),
                selectedTier.popular && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}),
                    label: "Popular",
                    color: "primary",
                    sx: { color: "#000" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: selectedTier.description })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              seats,
              " ",
              seats === 1 ? "seat" : "seats"
            ] }),
            isYearly && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                size: "small",
                label: "Annual Billing",
                variant: "outlined",
                color: "success"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "Order Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, sx: { mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                selectedTier.name,
                " × ",
                seats,
                " seat",
                seats !== 1 ? "s" : "",
                isYearly && " (12 months)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: formatCurrency(pricing.subtotal) })
            ] }),
            pricing.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "success.main", children: "Annual discount (2 months free)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "success.main", children: [
                "-",
                formatCurrency(pricing.discount)
              ] })
            ] }),
            taxCalculation && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                "Tax (",
                taxCalculation.taxJurisdiction,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: formatCurrency(taxCalculation.taxAmount) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 2, borderColor: "rgba(255, 255, 255, 0.1)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", children: [
              "Total ",
              isYearly ? "(Annual)" : "(Monthly)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "primary.main", children: formatCurrency(pricing.total) })
          ] }),
          isYearly && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Billed annually. Cancel anytime." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { mb: 2, fontWeight: 600 }, children: "What's included:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, sx: { p: 0 }, children: [
            selectedTier.features.slice(0, 5).map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0, py: 0.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 24 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { fontSize: 16, color: "success.main" } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: feature,
                  primaryTypographyProps: {
                    variant: "body2",
                    sx: { fontSize: "0.875rem" }
                  }
                }
              )
            ] }, index)),
            selectedTier.features.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { sx: { px: 0, py: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: `+ ${selectedTier.features.length - 5} more features`,
                primaryTypographyProps: {
                  variant: "body2",
                  color: "primary.main",
                  sx: { fontSize: "0.875rem", fontWeight: 500 }
                }
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3, backgroundColor: "rgba(255, 255, 255, 0.02)", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", textAlign: "center" }, children: [
          "🔒 Secured by 256-bit SSL encryption",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "💳 PCI DSS compliant payment processing",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "🔄 14-day money-back guarantee"
        ] }) })
      ]
    }
  ) });
};
const steps = [
  { label: "Select Plan", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, {}) },
  { label: "Billing Details", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}) },
  { label: "Payment Method", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}) },
  { label: "Confirmation", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) }
];
const CheckoutPage = () => {
  var _a, _b;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = reactExports.useState(0);
  const [pricingTiers, setPricingTiers] = reactExports.useState([]);
  const [checkoutData, setCheckoutData] = reactExports.useState({
    tier: ((_a = location.state) == null ? void 0 : _a.tier) || "PRO",
    seats: 1,
    isYearly: ((_b = location.state) == null ? void 0 : _b.isYearly) || false,
    billingAddress: {},
    taxInformation: {},
    businessProfile: {},
    acceptTerms: false,
    acceptPrivacy: false
  });
  const [error, setError] = reactExports.useState(null);
  const [taxCalculation, setTaxCalculation] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadPricingTiers();
  }, []);
  const loadPricingTiers = () => __async(void 0, null, function* () {
    try {
      const tiers = yield paymentService.getPricingTiers();
      setPricingTiers(tiers);
    } catch (error2) {
      enqueueSnackbar(error2.message || "Failed to load pricing", { variant: "error" });
    }
  });
  const updateCheckoutData = (updates) => {
    setCheckoutData((prev) => __spreadValues(__spreadValues({}, prev), updates));
  };
  const calculateTax = () => __async(void 0, null, function* () {
    if (!checkoutData.billingAddress.country) return;
    try {
      const selectedTier2 = pricingTiers.find((t) => t.id === checkoutData.tier);
      if (!selectedTier2 || !selectedTier2.price) return;
      const amount = selectedTier2.price * checkoutData.seats;
      const calculation = yield paymentService.calculateTax({
        amount,
        billingAddress: checkoutData.billingAddress,
        userType: checkoutData.businessProfile.companyName ? "business" : "individual"
      });
      setTaxCalculation(calculation);
    } catch (error2) {
      console.warn("Tax calculation failed:", error2.message);
    }
  });
  reactExports.useEffect(() => {
    if (activeStep >= 1) {
      calculateTax();
    }
  }, [checkoutData.billingAddress, checkoutData.tier, checkoutData.seats, activeStep]);
  const handleNext = () => {
    setError(null);
    switch (activeStep) {
      case 0:
        if (!checkoutData.tier) {
          setError("Please select a plan");
          return;
        }
        break;
      case 1:
        const addressValidation = paymentService.validateBillingAddress(checkoutData.billingAddress);
        if (!addressValidation.valid) {
          setError(addressValidation.errors.join(", "));
          return;
        }
        break;
    }
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };
  const handleComplete = (paymentMethodId) => __async(void 0, null, function* () {
    try {
      setLoading(true);
      setError(null);
      const result = yield paymentService.createSubscription({
        tier: checkoutData.tier,
        seats: checkoutData.seats,
        paymentMethodId,
        billingAddress: checkoutData.billingAddress,
        taxInformation: checkoutData.taxInformation,
        businessProfile: checkoutData.businessProfile
      });
      enqueueSnackbar("Subscription created successfully!", { variant: "success" });
      navigate("/dashboard", {
        state: {
          subscriptionCreated: true,
          subscription: result.subscription
        }
      });
    } catch (error2) {
      setError(error2.message || "Payment failed. Please try again.");
      enqueueSnackbar(error2.message || "Payment failed", { variant: "error" });
    } finally {
      setLoading(false);
    }
  });
  const selectedTier = pricingTiers.find((t) => t.id === checkoutData.tier);
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlanSelectionStep,
          {
            pricingTiers,
            selectedTier: checkoutData.tier,
            seats: checkoutData.seats,
            isYearly: checkoutData.isYearly,
            onUpdate: updateCheckoutData
          }
        );
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          BillingDetailsStep,
          {
            billingAddress: checkoutData.billingAddress,
            taxInformation: checkoutData.taxInformation,
            businessProfile: checkoutData.businessProfile,
            acceptTerms: checkoutData.acceptTerms,
            acceptPrivacy: checkoutData.acceptPrivacy,
            onUpdate: updateCheckoutData
          }
        );
      case 2:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          PaymentMethodStep,
          {
            checkoutData,
            taxCalculation,
            onComplete: handleComplete
          }
        );
      default:
        return null;
    }
  };
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", backgroundColor: "background.default" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "md", sx: { pt: 12, pb: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", children: "Please sign in to continue with checkout." }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", backgroundColor: "background.default" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { pt: { xs: 10, md: 12 }, pb: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
          onClick: () => navigate("/pricing"),
          sx: {
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              backgroundColor: "rgba(0, 212, 255, 0.1)"
            }
          },
          children: "Back to Pricing"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h3",
            sx: {
              fontWeight: 600,
              mb: 2,
              background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            },
            children: "Complete Your Purchase"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h6",
            color: "text.secondary",
            sx: { mb: 4, maxWidth: 600, mx: "auto" },
            children: "Join thousands of professionals using BackboneLogic, Inc."
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, lg: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Paper,
          {
            elevation: 3,
            sx: {
              p: 4,
              backgroundColor: "background.paper",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Stepper,
                {
                  activeStep,
                  sx: {
                    mb: 4,
                    "& .MuiStepLabel-root": {
                      color: "text.secondary"
                    },
                    "& .MuiStepLabel-label.Mui-active": {
                      color: "primary.main"
                    },
                    "& .MuiStepLabel-label.Mui-completed": {
                      color: "success.main"
                    }
                  },
                  children: steps.map((step, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    StepLabel,
                    {
                      StepIconComponent: ({ active, completed }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: completed ? "success.main" : active ? "primary.main" : "rgba(255, 255, 255, 0.1)", color: completed || active ? "#000" : "text.secondary" }, children: step.icon }),
                      children: step.label
                    }
                  ) }, step.label))
                }
              ),
              error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 4 }, children: renderStepContent() }),
              activeStep < 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleBack,
                    disabled: activeStep === 0,
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
                    children: "Back"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "contained",
                    onClick: handleNext,
                    endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}),
                    sx: {
                      background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                      color: "#000"
                    },
                    children: activeStep === steps.length - 1 ? "Complete Order" : "Continue"
                  }
                )
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, lg: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          OrderSummary,
          {
            selectedTier,
            seats: checkoutData.seats,
            isYearly: checkoutData.isYearly,
            taxCalculation
          }
        ) })
      ] })
    ] }) })
  ] });
};
export {
  CheckoutPage as default
};
