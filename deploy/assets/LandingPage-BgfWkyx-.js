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
import { cp as interopRequireDefaultExports, j as jsxRuntimeExports, u as useTheme, a4 as Dialog, a5 as DialogTitle, B as Box, T as Typography, a7 as DialogContent, r as Chip, d as Alert, e as TextField, F as FormControlLabel, k as Link, l as Checkbox, D as Divider, x as List, y as ListItem, z as ListItemIcon, H as ListItemText, aD as DialogActions, a as Button, C as CircularProgress, b as Container, G as Grid, S as Stack, p as CheckCircleIcon, cs as RocketLaunch$1, c as Paper, g as IconButton, a$ as PlayArrow, t as Card, w as CardContent, v as Star$1, bL as Snackbar, b1 as VideoLibrary, Y as Group, J as Security, ao as Speed, K as Support } from "./mui-gCwp_wLb.js";
import { r as reactExports, u as useNavigate } from "./vendor-Cu2L4Rr-.js";
import { r as requireCreateSvgIcon, N as Navigation } from "./Navigation-KxjjAKN4.js";
import { F as Footer } from "./Footer-DWVrBUuZ.js";
import { u as useAuth } from "./index-Dx2eHdQc.js";
import "./ThemeToggle-vWyYprMy.js";
import "./stripe-Dk1a53Oq.js";
var CheckCircle = {};
var _interopRequireDefault$3 = interopRequireDefaultExports;
Object.defineProperty(CheckCircle, "__esModule", {
  value: true
});
var default_1$3 = CheckCircle.default = void 0;
var _createSvgIcon$3 = _interopRequireDefault$3(requireCreateSvgIcon());
var _jsxRuntime$3 = jsxRuntimeExports;
default_1$3 = CheckCircle.default = (0, _createSvgIcon$3.default)(/* @__PURE__ */ (0, _jsxRuntime$3.jsx)("path", {
  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"
}), "CheckCircle");
var RocketLaunch = {};
var _interopRequireDefault$2 = interopRequireDefaultExports;
Object.defineProperty(RocketLaunch, "__esModule", {
  value: true
});
var default_1$2 = RocketLaunch.default = void 0;
var _createSvgIcon$2 = _interopRequireDefault$2(requireCreateSvgIcon());
var _jsxRuntime$2 = jsxRuntimeExports;
default_1$2 = RocketLaunch.default = (0, _createSvgIcon$2.default)(/* @__PURE__ */ (0, _jsxRuntime$2.jsx)("path", {
  d: "M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12C4.42 15.34 5.17 15 6 15c1.66 0 3 1.34 3 3m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2"
}), "RocketLaunch");
var AccessTime = {};
var _interopRequireDefault$1 = interopRequireDefaultExports;
Object.defineProperty(AccessTime, "__esModule", {
  value: true
});
var default_1$1 = AccessTime.default = void 0;
var _createSvgIcon$1 = _interopRequireDefault$1(requireCreateSvgIcon());
var _jsxRuntime$1 = jsxRuntimeExports;
default_1$1 = AccessTime.default = (0, _createSvgIcon$1.default)([/* @__PURE__ */ (0, _jsxRuntime$1.jsx)("path", {
  d: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"
}, "0"), /* @__PURE__ */ (0, _jsxRuntime$1.jsx)("path", {
  d: "M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
}, "1")], "AccessTime");
var Star = {};
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(Star, "__esModule", {
  value: true
});
var default_1 = Star.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
default_1 = Star.default = (0, _createSvgIcon.default)(/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
}), "Star");
const DEMO_FEATURES = [
  "Core Project Management",
  "Basic File Management",
  "Call Sheet Creation",
  "Timecard Submission",
  "Team Chat Features",
  "Basic Reporting",
  "Data Export Tools"
];
const DemoRegistrationModal = ({
  open,
  onClose,
  onSuccess
}) => {
  const theme = useTheme();
  const [formData, setFormData] = reactExports.useState({
    email: "",
    name: "",
    password: "",
    acceptTerms: false,
    acceptPrivacy: false
  });
  const [errors, setErrors] = reactExports.useState({});
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [serverError, setServerError] = reactExports.useState(null);
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms of Service";
    }
    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = "You must accept the Privacy Policy";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFormData((prev) => __spreadProps(__spreadValues({}, prev), { [field]: value }));
    if (errors[field]) {
      setErrors((prev) => __spreadProps(__spreadValues({}, prev), { [field]: void 0 }));
    }
    setServerError(null);
  };
  const handleSubmit = () => __async(void 0, null, function* () {
    if (!validateForm()) return;
    setIsLoading(true);
    setServerError(null);
    try {
      const response = yield fetch("/api/demo/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          acceptTerms: formData.acceptTerms,
          acceptPrivacy: formData.acceptPrivacy,
          referralSource: "landing_page",
          utmSource: "website",
          utmCampaign: "demo_trial",
          utmMedium: "modal"
        })
      });
      const result = yield response.json();
      if (result.success) {
        onSuccess(result.data);
        onClose();
      } else {
        setServerError(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Demo registration error:", error);
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  });
  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        email: "",
        name: "",
        password: "",
        acceptTerms: false,
        acceptPrivacy: false
      });
      setErrors({});
      setServerError(null);
      onClose();
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
        sx: {
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: { pb: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(default_1$2, { sx: { color: theme.palette.primary.main, fontSize: 28 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", component: "div", sx: { fontWeight: 600 }, children: "Start Your 14-Day Demo Trial" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Get instant access to Dashboard v14 with all Basic tier features" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(default_1$1, {}),
                  label: "14 Days Free",
                  color: "primary",
                  variant: "outlined"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(default_1, {}),
                  label: "Basic Tier Features",
                  color: "secondary",
                  variant: "outlined"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(default_1$3, {}),
                  label: "No Credit Card",
                  color: "success",
                  variant: "outlined"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "What's included:" }),
              " Full access to all Basic tier features for 14 days. You can upgrade to PRO or ENTERPRISE at any time to unlock advanced features."
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 3, mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 1, color: theme.palette.primary.main }, children: "Demo Registration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    label: "Email Address",
                    type: "email",
                    value: formData.email,
                    onChange: handleInputChange("email"),
                    error: !!errors.email,
                    helperText: errors.email,
                    required: true,
                    fullWidth: true,
                    autoComplete: "email"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    label: "Full Name",
                    value: formData.name,
                    onChange: handleInputChange("name"),
                    error: !!errors.name,
                    helperText: errors.name,
                    required: true,
                    fullWidth: true,
                    autoComplete: "name"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  {
                    label: "Password",
                    type: "password",
                    value: formData.password,
                    onChange: handleInputChange("password"),
                    error: !!errors.password,
                    helperText: errors.password || "Minimum 8 characters",
                    required: true,
                    fullWidth: true,
                    autoComplete: "new-password"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FormControlLabel,
                    {
                      control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Checkbox,
                        {
                          checked: formData.acceptTerms,
                          onChange: handleInputChange("acceptTerms"),
                          color: "primary"
                        }
                      ),
                      label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                        "I accept the",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/terms", target: "_blank", color: "primary", children: "Terms of Service" })
                      ] })
                    }
                  ),
                  errors.acceptTerms && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "error", display: "block", children: errors.acceptTerms }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FormControlLabel,
                    {
                      control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Checkbox,
                        {
                          checked: formData.acceptPrivacy,
                          onChange: handleInputChange("acceptPrivacy"),
                          color: "primary"
                        }
                      ),
                      label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                        "I accept the",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/privacy", target: "_blank", color: "primary", children: "Privacy Policy" })
                      ] })
                    }
                  ),
                  errors.acceptPrivacy && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "error", display: "block", children: errors.acceptPrivacy })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { orientation: "vertical", flexItem: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 1, color: theme.palette.success.main }, children: "Demo Features Included" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, children: DEMO_FEATURES.map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { py: 0.25 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(default_1$3, { sx: { fontSize: 16, color: theme.palette.success.main } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: feature,
                    primaryTypographyProps: { variant: "body2" }
                  }
                )
              ] }, index)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🎯 Pro Tip:" }),
                " Explore as many features as possible during your trial! You can upgrade anytime to unlock advanced workflows, analytics, and enterprise features."
              ] }) })
            ] })
          ] }),
          serverError && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: serverError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3, pt: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleClose,
              disabled: isLoading,
              color: "inherit",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleSubmit,
              variant: "contained",
              disabled: isLoading,
              startIcon: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(default_1$2, {}),
              sx: {
                px: 3,
                background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)"
                }
              },
              children: isLoading ? "Starting Your Demo..." : "Start 14-Day Demo Trial"
            }
          )
        ] })
      ]
    }
  );
};
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, hasActiveLicense, hasActiveSubscription } = useAuth();
  const theme = useTheme();
  const isSuperAdmin = isAuthenticated && String((user == null ? void 0 : user.role) || "").toUpperCase() === "SUPERADMIN";
  const hasActiveAccess = hasActiveLicense() || hasActiveSubscription();
  const [demoModalOpen, setDemoModalOpen] = reactExports.useState(false);
  const [successMessage, setSuccessMessage] = reactExports.useState(null);
  const handleDemoSuccess = (userData) => {
    setSuccessMessage(`🎉 Welcome to your 14-day demo trial, ${userData.user.name || userData.user.email}! Check your email for next steps.`);
    setTimeout(() => {
      window.open("https://dashboard-1c3a5.web.app/login", "_blank");
    }, 2e3);
  };
  const features = [
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VideoLibrary, {}),
      title: "Complete Production Management",
      description: "Streamline your entire video production workflow from pre-production to delivery."
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}),
      title: "Team Collaboration",
      description: "Real-time collaboration tools that keep your entire team synchronized and productive."
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
      title: "Enterprise Security",
      description: "Bank-grade security with role-based access control and comprehensive audit trails."
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Speed, {}),
      title: "AI-Powered Workflows",
      description: "Intelligent automation and AI assistance to accelerate your production timeline."
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}),
      title: "24/7 Premium Support",
      description: "Dedicated support team with industry expertise to help you succeed."
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star$1, {}),
      title: "White-Label Ready",
      description: "Customize and brand the platform to match your studio's identity."
    }
  ];
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Production Director",
      company: "Horizon Studios",
      content: "BackboneLogic, Inc. transformed our workflow. We've reduced production time by 40% and improved client satisfaction dramatically.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Creative Director",
      company: "NextGen Media",
      content: "The AI features are game-changing. Our team can focus on creativity while the platform handles the technical workflow.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Studio Manager",
      company: "Apex Productions",
      content: "The enterprise features give us complete control and visibility. Best investment we've made for our studio.",
      rating: 5
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { backgroundColor: "background.default", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #667eea 100%)",
      position: "relative",
      overflow: "hidden",
      pt: { xs: 12, md: 16 },
      pb: { xs: 8, md: 12 }
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: theme.palette.mode === "dark" ? "linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)" : "linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
        opacity: 0.5
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { position: "relative", zIndex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, alignItems: "center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: "✨ New v14 Release Available",
              sx: {
                mb: 3,
                backgroundColor: "rgba(0, 212, 255, 0.2)",
                color: "primary.main",
                border: "1px solid rgba(0, 212, 255, 0.3)"
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Typography,
            {
              variant: "h1",
              sx: {
                fontSize: { xs: "2.5rem", md: "4rem", lg: "4.5rem" },
                fontWeight: 700,
                lineHeight: 1.1,
                mb: 3,
                background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #00d4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              },
              children: [
                "Transform Your",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "Production Workflow"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "h5",
              sx: {
                color: "text.secondary",
                mb: 4,
                fontWeight: 400,
                lineHeight: 1.6
              },
              children: "The complete professional platform for video production management, collaboration, and delivery. Trusted by industry leaders worldwide."
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: isSuperAdmin ? (
            // SUPERADMIN: no CTA buttons here; access Admin from toolbar menu
            /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {})
          ) : hasActiveAccess ? (
            // User has active license/subscription - show dashboard access
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, sx: { mb: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  size: "large",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
                  onClick: () => navigate("/dashboard"),
                  sx: {
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(76, 175, 80, 0.4)"
                    }
                  },
                  children: "Access Dashboard"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  size: "large",
                  onClick: () => navigate("/dashboard/settings"),
                  sx: {
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 2,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "white",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "rgba(0, 212, 255, 0.1)",
                      transform: "translateY(-2px)"
                    }
                  },
                  children: "Account Settings"
                }
              )
            ] })
          ) : (
            // New user - show demo and pricing options
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, sx: { mb: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  size: "large",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RocketLaunch$1, {}),
                  onClick: () => setDemoModalOpen(true),
                  sx: {
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                    color: "#000",
                    "&:hover": {
                      background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0, 212, 255, 0.4)"
                    }
                  },
                  children: "Start 14-Day Demo Trial"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  size: "large",
                  onClick: () => navigate("/pricing"),
                  sx: {
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    borderRadius: 2,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "white",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "rgba(0, 212, 255, 0.1)",
                      transform: "translateY(-2px)"
                    }
                  },
                  children: "View Pricing"
                }
              )
            ] })
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "🔒 SOC 2 Compliant • GDPR Ready • 99.9% Uptime SLA" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { transition: "all 0.3s ease", "&:hover": { transform: "scale(1.02)" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Paper,
          {
            elevation: 20,
            sx: {
              p: 1,
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 3
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: "100%", height: 400, backgroundColor: "#000", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  sx: {
                    width: 80,
                    height: 80,
                    backgroundColor: "primary.main",
                    color: "#000",
                    "&:hover": {
                      backgroundColor: "primary.light",
                      transform: "scale(1.1)"
                    }
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, { sx: { fontSize: 40 } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Typography,
                {
                  variant: "caption",
                  sx: {
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1
                  },
                  children: "2:45 - Platform Demo"
                }
              )
            ] })
          }
        ) }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { py: { xs: 8, md: 12 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", sx: { mb: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h2",
            sx: {
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 600,
              mb: 2
            },
            children: "Everything You Need to Succeed"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h6",
            color: "text.secondary",
            sx: { maxWidth: 600, mx: "auto" },
            children: "Powerful features designed for modern production workflows"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 4, children: features.map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, lg: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { transition: "all 0.3s ease", "&:hover": { transform: "translateY(-8px)" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            height: "100%",
            backgroundColor: "background.paper",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 20px 40px rgba(0, 212, 255, 0.2)",
              borderColor: "rgba(0, 212, 255, 0.3)"
            }
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, backgroundColor: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mb: 3, color: "primary.main" }, children: feature.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: feature.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: feature.description })
          ] })
        }
      ) }) }, index)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { backgroundColor: "background.paper", py: { xs: 8, md: 12 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { textAlign: "center", sx: { mb: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h2",
          sx: {
            fontSize: { xs: "2rem", md: "3rem" },
            fontWeight: 600,
            mb: 2
          },
          children: "Trusted by Industry Leaders"
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 4, children: testimonials.map((testimonial, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            height: "100%",
            backgroundColor: "background.default",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 0.5, sx: { mb: 2 }, children: [...Array(testimonial.rating)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Star$1,
              {
                sx: { color: "#ffd700", fontSize: 20 }
              },
              i
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Typography,
              {
                variant: "body1",
                sx: { mb: 3, fontStyle: "italic" },
                children: [
                  '"',
                  testimonial.content,
                  '"'
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: testimonial.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                testimonial.role,
                ", ",
                testimonial.company
              ] })
            ] })
          ] })
        }
      ) }) }, index)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { py: { xs: 8, md: 12 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { transition: "all 0.3s ease", "&:hover": { transform: "scale(1.01)" } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: 3,
        sx: {
          p: { xs: 4, md: 8 },
          textAlign: "center",
          background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: theme.palette.mode === "dark" ? "1px solid rgba(0, 212, 255, 0.2)" : "1px solid rgba(102, 126, 234, 0.3)",
          color: theme.palette.mode === "dark" ? "white" : "white"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "h3",
              sx: {
                fontSize: { xs: "1.8rem", md: "2.5rem" },
                fontWeight: 600,
                mb: 2,
                color: "white"
              },
              children: hasActiveAccess ? "Welcome Back!" : "Ready to Transform Your Workflow?"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "h6",
              sx: {
                mb: 4,
                maxWidth: 600,
                mx: "auto",
                color: "rgba(255, 255, 255, 0.9)"
              },
              children: hasActiveAccess ? "Continue building amazing projects with your active subscription. Access all features and collaborate with your team." : "Join thousands of professionals who have revolutionized their production process with BackboneLogic, Inc."
            }
          ),
          isSuperAdmin ? (
            // SUPERADMIN: no CTA button here
            /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {})
          ) : hasActiveAccess ? (
            // User has active license/subscription - show dashboard access
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Stack,
              {
                direction: { xs: "column", sm: "row" },
                spacing: 2,
                justifyContent: "center",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "contained",
                      size: "large",
                      endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
                      onClick: () => navigate("/dashboard"),
                      sx: {
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                        color: "white",
                        "&:hover": {
                          background: "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)"
                        }
                      },
                      children: "Access Dashboard"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outlined",
                      size: "large",
                      onClick: () => navigate("/dashboard/settings"),
                      sx: {
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          backgroundColor: "rgba(255, 255, 255, 0.1)"
                        }
                      },
                      children: "Account Settings"
                    }
                  )
                ]
              }
            )
          ) : (
            // New user - show demo and pricing options
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Stack,
              {
                direction: { xs: "column", sm: "row" },
                spacing: 2,
                justifyContent: "center",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "contained",
                      size: "large",
                      endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RocketLaunch$1, {}),
                      onClick: () => setDemoModalOpen(true),
                      sx: {
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: theme.palette.mode === "dark" ? "#000" : "white",
                        "&:hover": {
                          background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #00b8e6 0%, #5a6fd8 100%)" : "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)"
                        }
                      },
                      children: "Start Your 14-Day Demo"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outlined",
                      size: "large",
                      onClick: () => navigate("/pricing"),
                      sx: {
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                          backgroundColor: "rgba(255, 255, 255, 0.1)"
                        }
                      },
                      children: "View Pricing Plans"
                    }
                  )
                ]
              }
            )
          ),
          !hasActiveAccess && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { color: "rgba(255, 255, 255, 0.8)", fontSize: 20 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)" }, children: "No credit card required • 14-day free trial • Cancel anytime" })
          ] }),
          hasActiveAccess && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { color: "rgba(255, 255, 255, 0.8)", fontSize: 20 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)" }, children: "Active subscription • Full access • Premium support" })
          ] })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DemoRegistrationModal,
      {
        open: demoModalOpen,
        onClose: () => setDemoModalOpen(false),
        onSuccess: handleDemoSuccess
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Snackbar,
      {
        open: !!successMessage,
        autoHideDuration: 6e3,
        onClose: () => setSuccessMessage(null),
        anchorOrigin: { vertical: "top", horizontal: "center" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Alert,
          {
            onClose: () => setSuccessMessage(null),
            severity: "success",
            variant: "filled",
            sx: { width: "100%" },
            children: successMessage
          }
        )
      }
    )
  ] });
};
export {
  LandingPage as default
};
