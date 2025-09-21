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
import { cq as utils, cr as interopRequireDefaultExports, j as jsxRuntimeExports, u as useTheme, bR as useMediaQuery, aW as DashboardIcon, cs as AdminPanelSettings, a1 as ShoppingCart, K as Support, b0 as Settings, ca as LicenseIcon, N as CloudIcon, Y as Group, a2 as PaymentIcon, bS as AppBar, bT as Toolbar, B as Box, g as IconButton, A as ArrowBack, T as Typography, a as Button, ap as Avatar, bU as MenuIcon, aC as Menu, D as Divider, M as MenuItem, ct as ExitToApp, bp as Article, bX as Drawer, a6 as CloseIcon, x as List, y as ListItem, z as ListItemIcon, H as ListItemText } from "./mui-kQ2X8N0A.js";
import { a as getAugmentedNamespace, u as useNavigate, e as useLocation, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth } from "./index-C4eF6KWV.js";
import { T as ThemeToggle } from "./ThemeToggle-Dfk-xxg9.js";
var ReceiptLong = {};
var createSvgIcon = {};
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(utils);
var hasRequiredCreateSvgIcon;
function requireCreateSvgIcon() {
  if (hasRequiredCreateSvgIcon) return createSvgIcon;
  hasRequiredCreateSvgIcon = 1;
  (function(exports) {
    "use client";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "default", {
      enumerable: true,
      get: function() {
        return _utils.createSvgIcon;
      }
    });
    var _utils = require$$0;
  })(createSvgIcon);
  return createSvgIcon;
}
var _interopRequireDefault = interopRequireDefaultExports;
Object.defineProperty(ReceiptLong, "__esModule", {
  value: true
});
var default_1 = ReceiptLong.default = void 0;
var _createSvgIcon = _interopRequireDefault(requireCreateSvgIcon());
var _jsxRuntime = jsxRuntimeExports;
default_1 = ReceiptLong.default = (0, _createSvgIcon.default)([/* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2zM19 19c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11z"
}, "0"), /* @__PURE__ */ (0, _jsxRuntime.jsx)("path", {
  d: "M9 7h6v2H9zm7 0h2v2h-2zm-7 3h6v2H9zm7 0h2v2h-2z"
}, "1")], "ReceiptLong");
const Navigation = () => {
  var _a;
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const inDashboardMode = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/accounting");
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = reactExports.useState(false);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => __async(void 0, null, function* () {
    try {
      yield logout();
      handleMenuClose();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      handleMenuClose();
      navigate("/");
    }
  });
  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };
  const navigationItems = reactExports.useMemo(() => {
    const items = [
      { label: "Features", path: "/#features" },
      { label: "Market", path: "/marketplace", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, {}) },
      { label: "Pricing", path: "/pricing" },
      { label: "Documentation", path: "/documentation", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Article, {}) },
      { label: "Support", path: "/support", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}) }
    ];
    if (isAuthenticated && String((user == null ? void 0 : user.role) || "").toUpperCase() !== "SUPERADMIN" && String((user == null ? void 0 : user.role) || "").toUpperCase() !== "ACCOUNTING") {
      items.push({ label: "Dashboard", path: "/dashboard", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {}) });
    }
    return items;
  }, [isAuthenticated, user]);
  const authenticatedNavItems = reactExports.useMemo(() => {
    const roleUpper = String((user == null ? void 0 : user.role) || "").toUpperCase();
    const isSuperAdmin = roleUpper === "SUPERADMIN";
    const isAccounting = roleUpper === "ACCOUNTING";
    if (isSuperAdmin) {
      return [
        { label: "Admin", path: "/admin", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanelSettings, {}) },
        { label: "Accounting", path: "/accounting", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(default_1, {}) },
        { label: "Marketplace", path: "/marketplace", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, {}) },
        { label: "Support", path: "/support", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}) },
        { label: "Settings", path: "/dashboard/settings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, {}) }
      ];
    }
    if (isAccounting) {
      return [
        { label: "Accounting", path: "/accounting", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(default_1, {}) },
        { label: "Marketplace", path: "/marketplace", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, {}) },
        { label: "Support", path: "/support", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}) }
      ];
    }
    return [
      { label: "Overview", path: "/dashboard", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {}) },
      { label: "Licenses", path: "/dashboard/licenses", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseIcon, {}) },
      { label: "Cloud Projects", path: "/dashboard/cloud-projects", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}) },
      { label: "Team Management", path: "/dashboard/team", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}) },
      { label: "Billing & Payments", path: "/dashboard/billing", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}) },
      { label: "Marketplace", path: "/marketplace", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, {}) },
      { label: "Support", path: "/support", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}) },
      { label: "Settings", path: "/dashboard/settings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, {}) }
    ];
  }, [user == null ? void 0 : user.role]);
  const renderMobileDrawer = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Drawer,
    {
      anchor: "right",
      open: mobileDrawerOpen,
      onClose: handleDrawerToggle,
      PaperProps: {
        sx: {
          width: 280,
          backgroundColor: "background.paper",
          backgroundImage: "none"
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Menu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: handleDrawerToggle, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { children: [
          isAuthenticated && String((user == null ? void 0 : user.role) || "").toUpperCase() === "SUPERADMIN" && !inDashboardMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ListItem,
            {
              onClick: () => {
                navigate("/admin");
                handleDrawerToggle();
              },
              sx: { cursor: "pointer" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { color: "warning.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanelSettings, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Admin Dashboard", sx: { color: "warning.main" } })
              ]
            }
          ),
          (!inDashboardMode ? isAuthenticated ? String((user == null ? void 0 : user.role) || "").toUpperCase() === "SUPERADMIN" ? navigationItems : authenticatedNavItems : navigationItems : []).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ListItem,
            {
              onClick: () => {
                if (item.path.startsWith("#")) return;
                if (item.path.includes("/admin") && !isAuthenticated) {
                  navigate("/login");
                  handleDrawerToggle();
                  return;
                }
                navigate(item.path);
                handleDrawerToggle();
              },
              sx: { cursor: "pointer" },
              children: [
                item.icon && /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: {
                  color: item.label === "Admin" ? "warning.main" : item.label === "Licenses" ? "primary.main" : item.label === "Dashboard" ? "primary.main" : item.label === "Marketplace" ? "secondary.main" : "text.primary"
                }, children: item.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: item.label,
                    sx: {
                      color: item.label === "Admin" ? "warning.main" : item.label === "Licenses" ? "primary.main" : item.label === "Dashboard" ? "primary.main" : item.label === "Marketplace" ? "secondary.main" : "inherit"
                    }
                  }
                )
              ]
            },
            item.label
          )),
          isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { onClick: handleLogout, sx: { cursor: "pointer" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { color: "error.main" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExitToApp, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Logout" })
            ] })
          ] }),
          !isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItem,
              {
                onClick: () => {
                  navigate("/login");
                  handleDrawerToggle();
                },
                sx: { cursor: "pointer" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Sign In" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItem,
              {
                onClick: () => {
                  navigate("/register");
                  handleDrawerToggle();
                },
                sx: { cursor: "pointer" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Get Started" })
              }
            )
          ] })
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AppBar,
      {
        position: "fixed",
        elevation: 0,
        sx: {
          backgroundColor: theme.palette.mode === "dark" ? "rgba(26, 26, 46, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { sx: { justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
            inDashboardMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                color: "inherit",
                "aria-label": "Back",
                onClick: () => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate("/");
                  }
                },
                sx: { mr: 1 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {})
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: { display: "flex", alignItems: "center", cursor: "pointer" },
                onClick: () => navigate("/"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 40, height: 40, borderRadius: 1, background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)", display: "flex", alignItems: "center", justifyContent: "center", mr: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Typography,
                    {
                      variant: "h6",
                      sx: {
                        fontWeight: 700,
                        color: "#000",
                        fontSize: "1.2rem"
                      },
                      children: "B"
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Typography,
                    {
                      variant: "h6",
                      sx: {
                        fontWeight: 600,
                        background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #00d4ff 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      },
                      children: "BackboneLogic, Inc."
                    }
                  )
                ]
              }
            )
          ] }),
          !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            !inDashboardMode && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: (isAuthenticated && ["SUPERADMIN", "ACCOUNTING"].includes(String((user == null ? void 0 : user.role) || "").toUpperCase()) ? navigationItems : isAuthenticated ? authenticatedNavItems : navigationItems).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                color: "inherit",
                startIcon: item.icon,
                onClick: () => {
                  if (item.path.startsWith("#")) return;
                  if (item.path.includes("/admin") && !isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  navigate(item.path);
                },
                sx: {
                  textTransform: "none",
                  fontWeight: 500,
                  color: item.label === "Admin" ? "warning.main" : item.label === "Licenses" ? "primary.main" : item.label === "Dashboard" ? "primary.main" : "text.secondary",
                  "&:hover": {
                    color: item.label === "Admin" ? "warning.light" : item.label === "Licenses" ? "primary.light" : item.label === "Dashboard" ? "primary.light" : "primary.main",
                    backgroundColor: item.label === "Admin" ? "rgba(255, 152, 0, 0.1)" : item.label === "Licenses" || item.label === "Dashboard" ? "rgba(0, 212, 255, 0.1)" : "rgba(0, 212, 255, 0.1)"
                  }
                },
                children: item.label
              },
              item.label
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, { size: "medium" }),
              isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                String((user == null ? void 0 : user.role) || "").toUpperCase() === "SUPERADMIN" && !inDashboardMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    color: "inherit",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanelSettings, {}),
                    onClick: () => navigate("/admin"),
                    sx: {
                      textTransform: "none",
                      fontWeight: 600,
                      color: "warning.main",
                      borderColor: "rgba(255, 152, 0, 0.4)",
                      "&:hover": {
                        color: "warning.light",
                        backgroundColor: "rgba(255, 152, 0, 0.1)"
                      }
                    },
                    children: "Admin Dashboard"
                  }
                ),
                String((user == null ? void 0 : user.role) || "").toUpperCase() === "ACCOUNTING" && !inDashboardMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    color: "inherit",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(default_1, {}),
                    onClick: () => navigate("/accounting"),
                    sx: {
                      textTransform: "none",
                      fontWeight: 600,
                      color: "info.light",
                      "&:hover": {
                        color: "info.main",
                        backgroundColor: "rgba(0, 212, 255, 0.1)"
                      }
                    },
                    children: "Accounting"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  IconButton,
                  {
                    size: "large",
                    onClick: handleMenuOpen,
                    color: "inherit",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Avatar,
                      {
                        sx: {
                          width: 36,
                          height: 36,
                          backgroundColor: "primary.main",
                          color: "#000"
                        },
                        children: (_a = user == null ? void 0 : user.name) == null ? void 0 : _a.charAt(0).toUpperCase()
                      }
                    )
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    color: "inherit",
                    onClick: () => navigate("/login"),
                    sx: {
                      textTransform: "none",
                      fontWeight: 500
                    },
                    children: "Sign In"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "contained",
                    onClick: () => navigate("/register"),
                    sx: {
                      textTransform: "none",
                      fontWeight: 500,
                      background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                      color: "#000",
                      "&:hover": {
                        background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)"
                      }
                    },
                    children: "Get Started"
                  }
                )
              ] })
            ] })
          ] }),
          isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              color: "inherit",
              onClick: handleDrawerToggle,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuIcon, {})
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        anchorEl,
        open: Boolean(anchorEl),
        onClose: handleMenuClose,
        transformOrigin: { horizontal: "right", vertical: "top" },
        anchorOrigin: { horizontal: "right", vertical: "bottom" },
        PaperProps: {
          sx: {
            mt: 1,
            backgroundColor: "background.elevated",
            border: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
            minWidth: 200
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { px: 2, py: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Signed in as" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: user == null ? void 0 : user.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          authenticatedNavItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuItem,
            {
              onClick: () => {
                navigate(item.path);
                handleMenuClose();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                item.icon,
                item.label
              ] })
            },
            item.label
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { onClick: handleLogout, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, color: "error.main" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExitToApp, {}),
            "Logout"
          ] }) })
        ]
      }
    ),
    renderMobileDrawer()
  ] });
};
export {
  Navigation as N,
  requireCreateSvgIcon as r
};
