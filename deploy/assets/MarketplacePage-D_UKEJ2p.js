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
import { u as useTheme, j as jsxRuntimeExports, B as Box, t as Card, w as CardContent, a1 as ShoppingCart, T as Typography, S as Stack, r as Chip, p as CheckCircleIcon, D as Divider, d as Alert, e as TextField, f as PersonIcon, E as EmailIcon, L as Lock, a as Button, b as Container, bJ as Badge, bK as ShoppingBag, G as Grid, a4 as Dialog, a5 as DialogTitle, g as IconButton, a6 as CloseIcon, a7 as DialogContent, c as Paper, bL as Remove, bM as AddIcon, aD as DialogActions, a2 as PaymentIcon, bN as Snackbar, bO as Zoom, bP as CardMedia, v as Star, bQ as Rating, a3 as Download, bR as CardActions, ac as Info } from "./mui-DJqJu8cJ.js";
import { u as useNavigate, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth } from "./index-DgsWjXkM.js";
import "./stripe-BZOVZ1Et.js";
const StandaloneUserRegistration = ({
  onSuccess,
  onClose,
  redirectTo = "/marketplace"
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = reactExports.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const handleInputChange = (field) => (event) => {
    setFormData((prev) => __spreadProps(__spreadValues({}, prev), {
      [field]: event.target.value
    }));
  };
  const handleSubmit = (event) => __async(void 0, null, function* () {
    event.preventDefault();
    setLoading(true);
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }
    try {
      const response = yield fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: "standalone",
          // Special user type for marketplace purchases
          marketingConsent: false
          // Default to false for standalone users
        })
      });
      const data = yield response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      if (onSuccess) {
        onSuccess(data);
      } else {
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { maxWidth: 500, mx: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
    background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    border: theme.palette.mode === "dark" ? "1px solid rgba(0, 212, 255, 0.2)" : "1px solid rgba(102, 126, 234, 0.3)"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
        width: 60,
        height: 60,
        borderRadius: 2,
        background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { sx: { fontSize: 30, color: "#000" } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 700, mb: 1 }, children: "Create Account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Sign up to purchase standalone Backbone tools" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, sx: { flexWrap: "wrap", gap: 1, mb: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
          label: "Instant Access",
          size: "small",
          color: "success",
          variant: "outlined"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
          label: "Secure Downloads",
          size: "small",
          color: "success",
          variant: "outlined"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
          label: "Email Support",
          size: "small",
          color: "success",
          variant: "outlined"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 3 } }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, onClose: () => setError(null), children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSubmit, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          label: "Full Name",
          value: formData.name,
          onChange: handleInputChange("name"),
          required: true,
          InputProps: {
            startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, { sx: { mr: 1, color: "text.secondary" } })
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          label: "Email Address",
          type: "email",
          value: formData.email,
          onChange: handleInputChange("email"),
          required: true,
          InputProps: {
            startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, { sx: { mr: 1, color: "text.secondary" } })
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          label: "Password",
          type: "password",
          value: formData.password,
          onChange: handleInputChange("password"),
          required: true,
          helperText: "Minimum 8 characters",
          InputProps: {
            startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { sx: { mr: 1, color: "text.secondary" } })
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          label: "Confirm Password",
          type: "password",
          value: formData.confirmPassword,
          onChange: handleInputChange("confirmPassword"),
          required: true,
          InputProps: {
            startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { sx: { mr: 1, color: "text.secondary" } })
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          variant: "contained",
          size: "large",
          fullWidth: true,
          disabled: loading,
          sx: {
            py: 1.5,
            background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
            color: "#000",
            "&:hover": {
              background: "linear-gradient(135deg, #00b8e6 0%, #5a6fd8 100%)"
            }
          },
          children: loading ? "Creating Account..." : "Create Account & Continue Shopping"
        }
      ),
      onClose && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          onClick: onClose,
          fullWidth: true,
          children: "Cancel"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 3, textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
      "By creating an account, you agree to our",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "text",
          size: "small",
          onClick: () => navigate("/terms"),
          sx: { p: 0, minWidth: "auto", textTransform: "none" },
          children: "Terms of Service"
        }
      ),
      " ",
      "and",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "text",
          size: "small",
          onClick: () => navigate("/privacy"),
          sx: { p: 0, minWidth: "auto", textTransform: "none" },
          children: "Privacy Policy"
        }
      )
    ] }) })
  ] }) }) });
};
const products = [
  {
    id: "backbone-callsheet-pro",
    name: "Backbone Call Sheet Pro",
    description: "Professional call sheet management system with advanced scheduling, personnel management, and production workflow integration. Perfect for film, TV, and commercial production teams.",
    shortDescription: "Professional call sheet management with production workflow integration",
    price: 199.99,
    originalPrice: 299.99,
    category: "Production Management",
    image: "/images/callsheet-dashboard-thumbnail.png",
    features: [
      "Advanced call sheet creation and editing",
      "Personnel and crew management",
      "Location and schedule management",
      "Real-time collaboration",
      "Template system with 20+ templates",
      "Daily call sheet records",
      "Integration with timecard systems",
      "Export to PDF and other formats",
      "Mobile-responsive design",
      "Offline capability",
      "Weather integration",
      "Hospital and emergency info",
      "Walkie-talkie channel management",
      "Vendor and equipment tracking",
      "Analytics and reporting"
    ],
    requirements: [
      "Modern web browser (Chrome, Firefox, Safari, Edge)",
      "Internet connection for cloud sync",
      "2GB RAM minimum (4GB recommended)",
      "50MB free disk space for offline data",
      "JavaScript enabled"
    ],
    rating: 4.9,
    reviewCount: 156,
    downloads: 2340,
    tags: ["call-sheets", "production", "scheduling", "collaboration", "film", "tv"],
    isPopular: false,
    fileSize: "50 MB",
    version: "1.0.0",
    lastUpdated: "2024-01-20",
    developer: "BackboneLogic, Inc.",
    compatibility: ["Web", "Desktop (Electron)", "Mobile"],
    support: {
      email: true,
      documentation: true,
      updates: true,
      community: true
    }
  }
];
const MarketplacePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const [selectedProduct, setSelectedProduct] = reactExports.useState(null);
  const [cart, setCart] = reactExports.useState({});
  const [showCart, setShowCart] = reactExports.useState(false);
  const [successMessage, setSuccessMessage] = reactExports.useState(null);
  const [filter, setFilter] = reactExports.useState("all");
  const [showRegistration, setShowRegistration] = reactExports.useState(false);
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = filter === "all" ? products : products.filter((p) => p.category === filter);
  const cartItems = Object.keys(cart).length;
  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = products.find((p) => p.id === productId);
    return total + (product ? product.price * quantity : 0);
  }, 0);
  const handleAddToCart = (productId) => {
    var _a;
    setCart((prev) => __spreadProps(__spreadValues({}, prev), {
      [productId]: (prev[productId] || 0) + 1
    }));
    setSuccessMessage(`${(_a = products.find((p) => p.id === productId)) == null ? void 0 : _a.name} added to cart!`);
  };
  const handleRemoveFromCart = (productId) => {
    setCart((prev) => {
      const newCart = __spreadValues({}, prev);
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };
  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowRegistration(true);
      return;
    }
    const cartData = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return { product, quantity };
    }).filter((item) => item.product);
    navigate("/checkout/standalone", {
      state: {
        items: cartData,
        type: "standalone"
      }
    });
  };
  const handleRegistrationSuccess = (userData) => {
    setShowRegistration(false);
    setSuccessMessage(`Welcome! Account created successfully. You can now proceed to checkout.`);
    const cartData = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return { product, quantity };
    }).filter((item) => item.product);
    setTimeout(() => {
      navigate("/checkout/standalone", {
        state: {
          items: cartData,
          type: "standalone"
        }
      });
    }, 2e3);
  };
  const ProductCard = ({ product }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Zoom, { in: true, timeout: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      sx: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: theme.palette.mode === "dark" ? "0 20px 40px rgba(0, 212, 255, 0.2)" : "0 20px 40px rgba(0, 0, 0, 0.15)"
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "relative" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CardMedia,
            {
              component: "img",
              height: "200",
              image: product.image,
              alt: product.name,
              sx: { objectFit: "cover" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Box,
            {
              sx: {
                position: "absolute",
                top: 16,
                left: 16,
                display: "flex",
                gap: 1
              },
              children: [
                product.isPopular && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: "Popular",
                    color: "warning",
                    size: "small",
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {})
                  }
                ),
                product.isNew && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: "New",
                    color: "success",
                    size: "small"
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { flexGrow: 1, p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 1 }, children: product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: product.shortDescription })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Rating, { value: product.rating, precision: 0.1, size: "small", readOnly: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              product.rating,
              " (",
              product.reviewCount,
              " reviews)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", sx: { fontWeight: 700, color: "primary.main" }, children: [
              "$",
              product.price
            ] }),
            product.originalPrice && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Typography,
              {
                variant: "body2",
                sx: {
                  textDecoration: "line-through",
                  color: "text.secondary"
                },
                children: [
                  "$",
                  product.originalPrice
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 1, flexWrap: "wrap" }, children: product.tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: tag,
              size: "small",
              variant: "outlined",
              sx: { fontSize: "0.75rem" }
            },
            tag
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, color: "text.secondary" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { sx: { fontSize: 14, mr: 0.5 } }),
              product.downloads.toLocaleString(),
              " downloads"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", children: [
              "v",
              product.version
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardActions, { sx: { p: 2, pt: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1.5, sx: { width: "100%" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {}),
              onClick: () => setSelectedProduct(product),
              size: "small",
              sx: {
                flex: 1,
                minHeight: "36px",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "primary.50"
                }
              },
              children: "Details"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
              onClick: () => handleAddToCart(product.id),
              size: "small",
              sx: {
                flex: 1,
                minHeight: "36px",
                fontSize: "0.875rem",
                fontWeight: 500,
                textTransform: "none",
                borderRadius: "8px",
                backgroundColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.dark"
                }
              },
              children: "Add to Cart"
            }
          )
        ] }) })
      ]
    }
  ) });
  const ProductDetailsDialog = ({
    product,
    onClose
  }) => {
    if (!product) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: !!product,
        onClose,
        maxWidth: "md",
        fullWidth: true,
        PaperProps: {
          sx: {
            borderRadius: 2,
            background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { pb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600 }, children: product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: onClose, size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CardMedia,
                {
                  component: "img",
                  height: "300",
                  image: product.image,
                  alt: product.name,
                  sx: { borderRadius: 2, mb: 2 }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Rating, { value: product.rating, precision: 0.1, readOnly: true }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                  product.rating,
                  " (",
                  product.reviewCount,
                  " reviews)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 3 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", sx: { fontWeight: 700, color: "primary.main" }, children: [
                  "$",
                  product.price
                ] }),
                product.originalPrice && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Typography,
                  {
                    variant: "h6",
                    sx: {
                      textDecoration: "line-through",
                      color: "text.secondary"
                    },
                    children: [
                      "$",
                      product.originalPrice
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "contained",
                  size: "large",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                  onClick: () => {
                    handleAddToCart(product.id);
                    onClose();
                  },
                  sx: { width: "100%", mb: 2 },
                  children: [
                    "Add to Cart - $",
                    product.price
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { mb: 3, lineHeight: 1.6 }, children: product.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "Key Features" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1, sx: { mb: 3 }, children: product.features.map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 16, color: "success.main" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: feature })
              ] }, index)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "System Requirements" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1, sx: { mb: 3 }, children: product.requirements.map((req, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "• ",
                req
              ] }, index)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }, children: product.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: tag,
                  size: "small",
                  variant: "outlined"
                },
                tag
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "File Size" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: product.fileSize })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Version" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: product.version })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Developer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: product.developer })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Last Updated" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: product.lastUpdated })
                ] })
              ] })
            ] })
          ] }) })
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { backgroundColor: "background.default", minHeight: "100vh", pt: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h2",
          sx: {
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            fontWeight: 700,
            mb: 2,
            background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #00d4ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          },
          children: "Backbone Marketplace"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h6",
          color: "text.secondary",
          sx: { maxWidth: 600, mx: "auto", mb: 4 },
          children: "Discover and purchase standalone Backbone tools. Professional-grade software for every creative workflow."
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", gap: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outlined",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, {}),
          onClick: () => setShowCart(true),
          sx: { position: "relative" },
          children: [
            "Cart",
            cartItems > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                badgeContent: cartItems,
                color: "primary",
                sx: {
                  position: "absolute",
                  top: -8,
                  right: -8
                }
              }
            )
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1, sx: { flexWrap: "wrap", gap: 1 }, children: categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Chip,
      {
        label: category === "all" ? "All Products" : category,
        onClick: () => setFilter(category),
        variant: filter === category ? "filled" : "outlined",
        color: filter === category ? "primary" : "default",
        sx: { textTransform: "capitalize" }
      },
      category
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 4, children: filteredProducts.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product }) }, product.id)) }),
    filteredProducts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "center", py: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "No products found in this category." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProductDetailsDialog,
      {
        product: selectedProduct,
        onClose: () => setSelectedProduct(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: showCart,
        onClose: () => setShowCart(false),
        maxWidth: "sm",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Shopping Cart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setShowCart(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: cartItems === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { sx: { fontSize: 64, color: "text.secondary", mb: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "Your cart is empty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Add some products to get started" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
            Object.entries(cart).map(([productId, quantity]) => {
              const product = products.find((p) => p.id === productId);
              if (!product) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                    "$",
                    product.price,
                    " each"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      size: "small",
                      onClick: () => handleRemoveFromCart(productId),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Remove, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { minWidth: 24, textAlign: "center" }, children: quantity }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      size: "small",
                      onClick: () => handleAddToCart(productId),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {})
                    }
                  )
                ] })
              ] }) }, productId);
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 700, color: "primary.main" }, children: [
                "$",
                cartTotal.toFixed(2)
              ] })
            ] })
          ] }) }),
          cartItems > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setShowCart(false), children: "Continue Shopping" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}),
                onClick: handleCheckout,
                sx: { minWidth: 120 },
                children: "Checkout"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: showRegistration,
        onClose: () => setShowRegistration(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: {
          sx: {
            borderRadius: 2,
            background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { p: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          StandaloneUserRegistration,
          {
            onSuccess: handleRegistrationSuccess,
            onClose: () => setShowRegistration(false)
          }
        ) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Snackbar,
      {
        open: !!successMessage,
        autoHideDuration: 3e3,
        onClose: () => setSuccessMessage(null),
        anchorOrigin: { vertical: "top", horizontal: "center" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Alert,
          {
            onClose: () => setSuccessMessage(null),
            severity: "success",
            variant: "filled",
            children: successMessage
          }
        )
      }
    )
  ] }) });
};
export {
  MarketplacePage as default
};
