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
import { j as jsxRuntimeExports, aB as Tooltip, g as IconButton, bC as Badge, H as Security, bD as useTheme, bE as useMediaQuery, B as Box, bF as AppBar, bG as Toolbar, bH as MenuIcon, A as ArrowBack, a as Button, aA as Notifications, bI as AccountCircle, ar as Menu, M as MenuItem, y as ListItemIcon, aW as Settings, bJ as Logout, bK as Drawer, d as Alert, aQ as DashboardIcon, a4 as PaymentIcon, ac as Analytics, bL as AccountBalance, aI as Description, X as Group, a2 as CardMembership, T as Typography, ae as Avatar, r as Chip, w as List, x as ListItem, bM as ListItemButton, z as ListItemText, D as Divider, as as Download, J as Support, Y as Business, ai as Receipt } from "./mui-DBh4ciAv.js";
import { u as useNavigate, r as reactExports, e as useLocation, b as React, L as Link, O as Outlet } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth, R as RoleBasedAccessControl } from "./index-D2GwMvBK.js";
import "./stripe-iYh_bQi1.js";
const SecurityNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = reactExports.useState("USER");
  const [organizationId, setOrganizationId] = reactExports.useState();
  const [securityAlerts, setSecurityAlerts] = reactExports.useState(0);
  const [criticalAlerts, setCriticalAlerts] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const checkUserPermissions = () => __async(void 0, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (!user) return;
      try {
        console.log("SecurityNavigation - User object:", user);
        console.log("SecurityNavigation - User email:", user.email);
        console.log("SecurityNavigation - User type:", typeof user);
        console.log("SecurityNavigation - User has getIdTokenResult:", typeof user.getIdTokenResult);
        if (typeof user.getIdTokenResult === "function") {
          const idTokenResult = yield user.getIdTokenResult();
          const claims = idTokenResult.claims;
          console.log("SecurityNavigation - User claims:", claims);
          const isDevAdmin = (claims == null ? void 0 : claims.role) === "DEV_ADMIN" || (claims == null ? void 0 : claims.role) === "SuperAdmin" || (claims == null ? void 0 : claims.role) === "SUPERADMIN" || (claims == null ? void 0 : claims.isDevAdmin) === true || ((_a = claims == null ? void 0 : claims.permissions) == null ? void 0 : _a.includes("security:master_access")) || ((_b = claims == null ? void 0 : claims.permissions) == null ? void 0 : _b.includes("admin:master_security"));
          const isOrgAdmin = (claims == null ? void 0 : claims.role) === "ADMIN" || (claims == null ? void 0 : claims.role) === "ORG_ADMIN" || (claims == null ? void 0 : claims.role) === "SuperAdmin" || (claims == null ? void 0 : claims.role) === "SUPERADMIN" || (claims == null ? void 0 : claims.isOrgAdmin) === true || ((_c = claims == null ? void 0 : claims.permissions) == null ? void 0 : _c.includes("admin:organization")) || ((_d = claims == null ? void 0 : claims.permissions) == null ? void 0 : _d.includes("admin:team_members"));
          console.log("SecurityNavigation - isDevAdmin:", isDevAdmin);
          console.log("SecurityNavigation - isOrgAdmin:", isOrgAdmin);
          if (isDevAdmin) {
            console.log("SecurityNavigation - Setting role to DEV_ADMIN");
            setUserRole("DEV_ADMIN");
          } else if (isOrgAdmin) {
            console.log("SecurityNavigation - Setting role to ORG_ADMIN");
            setUserRole("ORG_ADMIN");
            setOrganizationId((claims == null ? void 0 : claims.organizationId) || user.organizationId);
          } else {
            console.log("SecurityNavigation - Setting role to USER");
            setUserRole("USER");
          }
        } else {
          console.log("SecurityNavigation - Using fallback role detection");
          console.log("SecurityNavigation - User properties:", Object.keys(user));
          const userRole2 = user.role || user.userRole || user.user_type;
          const isDevAdmin = userRole2 === "DEV_ADMIN" || userRole2 === "SuperAdmin" || userRole2 === "SUPERADMIN" || user.isDevAdmin === true || ((_e = user.permissions) == null ? void 0 : _e.includes("security:master_access")) || ((_f = user.permissions) == null ? void 0 : _f.includes("admin:master_security"));
          const isOrgAdmin = userRole2 === "ADMIN" || userRole2 === "ORG_ADMIN" || userRole2 === "SuperAdmin" || userRole2 === "SUPERADMIN" || user.isOrgAdmin === true || ((_g = user.permissions) == null ? void 0 : _g.includes("admin:organization")) || ((_h = user.permissions) == null ? void 0 : _h.includes("admin:team_members"));
          console.log("SecurityNavigation - Fallback isDevAdmin:", isDevAdmin);
          console.log("SecurityNavigation - Fallback isOrgAdmin:", isOrgAdmin);
          if (isDevAdmin) {
            console.log("SecurityNavigation - Setting role to DEV_ADMIN (fallback)");
            setUserRole("DEV_ADMIN");
          } else if (isOrgAdmin) {
            console.log("SecurityNavigation - Setting role to ORG_ADMIN (fallback)");
            setUserRole("ORG_ADMIN");
            setOrganizationId(user.organizationId);
          } else {
            console.log("SecurityNavigation - Setting role to USER (fallback)");
            setUserRole("USER");
          }
        }
      } catch (error) {
        console.error("Error checking user permissions:", error);
        setUserRole("USER");
      }
    });
    checkUserPermissions();
  }, [user]);
  reactExports.useEffect(() => {
    const loadSecurityAlerts = () => __async(void 0, null, function* () {
      try {
        if (userRole === "DEV_ADMIN") {
          const [dashboardResponse, licensingResponse] = yield Promise.all([
            fetch("/api/security/alerts?source=dashboard_app").then((res) => res.json()).catch(() => ({ success: false, data: [] })),
            fetch("/api/security/alerts?source=licensing_website").then((res) => res.json()).catch(() => ({ success: false, data: [] }))
          ]);
          const dashboardAlerts = dashboardResponse.success ? dashboardResponse.data : [];
          const licensingAlerts = licensingResponse.success ? licensingResponse.data : [];
          const allAlerts = [...dashboardAlerts, ...licensingAlerts];
          const activeAlerts = allAlerts.filter((alert) => !alert.resolved);
          const critical = activeAlerts.filter((alert) => alert.severity === "critical");
          setSecurityAlerts(activeAlerts.length);
          setCriticalAlerts(critical.length);
        } else if (userRole === "ORG_ADMIN" && organizationId) {
          const response = yield fetch(`/api/security/alerts?source=licensing_website&organizationId=${organizationId}`).then((res) => res.json()).catch(() => ({ success: false, data: [] }));
          const orgAlerts = response.success ? response.data : [];
          const activeAlerts = orgAlerts.filter((alert) => !alert.resolved);
          const critical = activeAlerts.filter((alert) => alert.severity === "critical");
          setSecurityAlerts(activeAlerts.length);
          setCriticalAlerts(critical.length);
        }
      } catch (error) {
        console.error("Error loading security alerts:", error);
      }
    });
    if (userRole === "DEV_ADMIN" || userRole === "ORG_ADMIN") {
      loadSecurityAlerts();
      const interval = setInterval(loadSecurityAlerts, 3e4);
      return () => clearInterval(interval);
    }
  }, [userRole, organizationId]);
  const handleSecurityDashboard = () => {
    navigate("/dashboard/security");
  };
  console.log("SecurityNavigation - Current userRole:", userRole);
  console.log("SecurityNavigation - Should render:", userRole === "DEV_ADMIN" || userRole === "ORG_ADMIN");
  if (userRole !== "DEV_ADMIN" && userRole !== "ORG_ADMIN") {
    console.log("SecurityNavigation - Not rendering, userRole:", userRole);
    return null;
  }
  console.log("SecurityNavigation - Rendering security button");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: userRole === "DEV_ADMIN" ? "Master Security Dashboard" : "Organization Security Dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    IconButton,
    {
      color: "inherit",
      onClick: handleSecurityDashboard,
      sx: {
        mr: 1,
        backgroundColor: criticalAlerts > 0 ? "error.dark" : "transparent",
        "&:hover": {
          backgroundColor: criticalAlerts > 0 ? "error.main" : "rgba(255,255,255,0.1)"
        }
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { badgeContent: securityAlerts, color: "error", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}) })
    }
  ) });
};
const drawerWidth = 280;
const enterpriseItems = [
  { text: "Organization", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {}), path: "/dashboard/organization" },
  { text: "Security Center", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}), path: "/dashboard/security" },
  { text: "Compliance", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}), path: "/dashboard/compliance" }
];
const accountingNavigationItems = [
  { text: "Overview", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {}), path: "/accounting#overview" },
  { text: "Payments", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}), path: "/accounting#payments" },
  { text: "Tax", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, {}), path: "/accounting#tax" },
  { text: "Filings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountBalance, {}), path: "/accounting#filings" },
  { text: "KYC", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}), path: "/accounting#kyc" },
  { text: "Compliance", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}), path: "/accounting#compliance" },
  { text: "Terms", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Description, {}), path: "/accounting#terms" }
];
const adminNavigationItems = [
  { text: "Users", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}), path: "/admin#users" },
  { text: "Licenses", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CardMembership, {}), path: "/admin#licenses" },
  { text: "Invoices", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}), path: "/admin#invoices" },
  { text: "System Health", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}), path: "/admin#system" }
];
const getIconComponent = (iconName) => {
  const iconMap = {
    "Dashboard": /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {}),
    "CardMembership": /* @__PURE__ */ jsxRuntimeExports.jsx(CardMembership, {}),
    "Analytics": /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, {}),
    "Group": /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}),
    "Payment": /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}),
    "Receipt": /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, {}),
    "Download": /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
    "Business": /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {}),
    "Security": /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
    "AccountBalance": /* @__PURE__ */ jsxRuntimeExports.jsx(AccountBalance, {}),
    "AdminPanelSettings": /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
    "Settings": /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, {}),
    "Support": /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}),
    "Notifications": /* @__PURE__ */ jsxRuntimeExports.jsx(Notifications, {})
  };
  return iconMap[iconName] || /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {});
};
const DashboardLayout = () => {
  var _a;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dismissedKycBanner, setDismissedKycBanner] = reactExports.useState(() => {
    try {
      return localStorage.getItem("dismiss_kyc_banner") === "1";
    } catch (e) {
      return false;
    }
  });
  const isAccountingUser = String((user == null ? void 0 : user.role) || "").toUpperCase() === "ACCOUNTING";
  reactExports.useEffect(() => {
    if (isAccountingUser && location.pathname.startsWith("/dashboard")) {
      navigate("/accounting", { replace: true });
    }
  }, [isAccountingUser, location.pathname, navigate]);
  if (isAccountingUser && !location.pathname.startsWith("/accounting")) {
    return null;
  }
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => __async(void 0, null, function* () {
    try {
      yield logout();
      handleProfileMenuClose();
    } catch (error) {
      console.error("Logout failed:", error);
      handleProfileMenuClose();
    }
  });
  const isEnterprise = String(((_a = user == null ? void 0 : user.subscription) == null ? void 0 : _a.plan) || "").toUpperCase() === "ENTERPRISE";
  const roleUpper = String((user == null ? void 0 : user.role) || "").toUpperCase();
  const isEnterpriseAdminRole = roleUpper === "ENTERPRISE_ADMIN";
  const kycStatus = String((user == null ? void 0 : user.kycStatus) || "").toUpperCase();
  const needsKyc = kycStatus !== "COMPLETED";
  const showKycBanner = needsKyc && !dismissedKycBanner;
  const navigationItems = React.useMemo(() => {
    const inAccountingSection = location.pathname.startsWith("/accounting");
    const inAdminSection = location.pathname.startsWith("/admin");
    if (inAccountingSection) return [...accountingNavigationItems];
    if (inAdminSection) return [...adminNavigationItems];
    const accessibleItems = RoleBasedAccessControl.getAccessibleNavigationItems(user);
    console.log("🔍 [DashboardLayout] User role:", user == null ? void 0 : user.role);
    console.log("🔍 [DashboardLayout] Accessible items:", accessibleItems);
    console.log("🔍 [DashboardLayout] Team management item:", accessibleItems.find((item) => item.id === "team-management"));
    return accessibleItems.map((item) => ({
      text: item.text,
      icon: getIconComponent(item.icon),
      path: item.path,
      badge: item.badge,
      chip: item.chip
    }));
  }, [location.pathname, user]);
  const NavigationList = () => {
    var _a2, _b;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: drawerWidth, height: "100%", backgroundColor: "background.paper" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: Link, to: "/", "aria-label": "Go to Landing Page", sx: { p: 3, display: "block", textDecoration: "none", color: "inherit", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", cursor: "pointer", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.04)" } }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h6",
            sx: {
              fontWeight: 600,
              background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            },
            children: "BackboneLogic, Inc."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "License Management" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3, borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { width: 48, height: 48, bgcolor: "primary.main" }, children: ((_a2 = user == null ? void 0 : user.name) == null ? void 0 : _a2[0]) || ((_b = user == null ? void 0 : user.email) == null ? void 0 : _b[0]) || "U" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, noWrap: true, children: (user == null ? void 0 : user.name) || (user == null ? void 0 : user.email) || "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", noWrap: true, children: user == null ? void 0 : user.email }),
          (user == null ? void 0 : user.subscription) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: String(user.subscription.plan).toUpperCase(),
              size: "small",
              color: String(user.subscription.plan).toUpperCase() === "ENTERPRISE" ? "primary" : "default",
              sx: { mt: 0.5, fontSize: "0.7rem" }
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { sx: { px: 2, py: 1 }, children: [
        navigationItems.map((item) => {
          const [itemBasePath, itemHash] = String(item.path || "").split("#");
          const isHashLink = Boolean(itemHash);
          const isActive = isHashLink ? location.pathname === itemBasePath && location.hash === `#${itemHash}` : location.pathname === item.path;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ListItemButton,
            {
              component: Link,
              to: item.path,
              sx: {
                borderRadius: 2,
                py: 1.5,
                backgroundColor: isActive ? "rgba(0, 212, 255, 0.1)" : "transparent",
                color: isActive ? "primary.main" : "text.primary",
                "&:hover": {
                  backgroundColor: isActive ? "rgba(0, 212, 255, 0.15)" : "rgba(255, 255, 255, 0.05)"
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { color: "inherit", minWidth: 40 }, children: item.badge ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { badgeContent: item.badge, color: "primary", children: item.icon }) : item.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: item.text,
                    sx: {
                      "& .MuiListItemText-primary": {
                        fontWeight: isActive ? 600 : 400,
                        fontSize: "0.95rem"
                      }
                    }
                  }
                ),
                item.chip && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: item.chip,
                    size: "small",
                    sx: {
                      fontSize: "0.7rem",
                      height: 20,
                      backgroundColor: "rgba(0, 212, 255, 0.2)",
                      color: "primary.main"
                    }
                  }
                )
              ]
            }
          ) }) }, item.text);
        }),
        isEnterprise && isEnterpriseAdminRole && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2, borderColor: "rgba(255, 255, 255, 0.1)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "caption",
              sx: {
                px: 2,
                py: 1,
                display: "block",
                fontWeight: 600,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 1
              },
              children: "Enterprise"
            }
          ),
          enterpriseItems.map((item) => {
            const isActive = location.pathname === item.path;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              ListItemButton,
              {
                component: Link,
                to: item.path,
                sx: {
                  borderRadius: 2,
                  py: 1.5,
                  backgroundColor: isActive ? "rgba(0, 212, 255, 0.1)" : "transparent",
                  color: isActive ? "primary.main" : "text.primary",
                  "&:hover": {
                    backgroundColor: isActive ? "rgba(0, 212, 255, 0.15)" : "rgba(255, 255, 255, 0.05)"
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { color: "inherit", minWidth: 40 }, children: item.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ListItemText,
                    {
                      primary: item.text,
                      sx: {
                        "& .MuiListItemText-primary": {
                          fontWeight: isActive ? 600 : 400,
                          fontSize: "0.95rem"
                        }
                      }
                    }
                  )
                ]
              }
            ) }) }, item.text);
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: "auto", p: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 2, borderColor: "rgba(255, 255, 255, 0.1)" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "caption",
            sx: {
              px: 2,
              py: 1,
              display: "block",
              fontWeight: 600,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 1
            },
            children: "Quick Access"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ListItemButton,
          {
            component: Link,
            to: "/dashboard/support#analytics",
            sx: {
              borderRadius: 2,
              py: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)"
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { color: "text.secondary", minWidth: 40 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Usage Analytics",
                  sx: {
                    "& .MuiListItemText-primary": {
                      fontSize: "0.85rem",
                      color: "text.secondary"
                    }
                  }
                }
              )
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ListItemButton,
          {
            component: Link,
            to: "/dashboard/support#downloads",
            sx: {
              borderRadius: 2,
              py: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)"
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { color: "text.secondary", minWidth: 40 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Downloads",
                  sx: {
                    "& .MuiListItemText-primary": {
                      fontSize: "0.85rem",
                      color: "text.secondary"
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: "SDK",
                  size: "small",
                  sx: {
                    fontSize: "0.6rem",
                    height: 16,
                    backgroundColor: "rgba(0, 212, 255, 0.2)",
                    color: "primary.main"
                  }
                }
              )
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { disablePadding: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ListItemButton,
          {
            component: Link,
            to: "/dashboard/support#documentation",
            sx: {
              borderRadius: 2,
              py: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)"
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { color: "text.secondary", minWidth: 40 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Description, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Documentation",
                  sx: {
                    "& .MuiListItemText-primary": {
                      fontSize: "0.85rem",
                      color: "text.secondary"
                    }
                  }
                }
              )
            ]
          }
        ) })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AppBar,
      {
        position: "fixed",
        sx: {
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          backgroundColor: "background.paper",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "none"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              color: "inherit",
              "aria-label": "open drawer",
              edge: "start",
              onClick: handleDrawerToggle,
              sx: { mr: 2, display: { lg: "none" } },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuIcon, {})
            }
          ),
          isMobile ? /* @__PURE__ */ jsxRuntimeExports.jsx(
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
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              size: "small",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
              onClick: () => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              },
              sx: {
                mr: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: "text.primary",
                textTransform: "none",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "rgba(0, 212, 255, 0.1)"
                }
              },
              children: "Back"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flexGrow: 1 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityNavigation, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              size: "large",
              color: "inherit",
              sx: { mr: 1 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { badgeContent: needsKyc ? 1 : 0, color: "primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Notifications, {}) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              size: "large",
              edge: "end",
              "aria-label": "account of current user",
              "aria-controls": "profile-menu",
              "aria-haspopup": "true",
              onClick: handleProfileMenuOpen,
              color: "inherit",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountCircle, {})
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Menu,
            {
              id: "profile-menu",
              anchorEl,
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right"
              },
              keepMounted: true,
              transformOrigin: {
                vertical: "top",
                horizontal: "right"
              },
              open: Boolean(anchorEl),
              onClose: handleProfileMenuClose,
              PaperProps: {
                sx: {
                  backgroundColor: "background.paper",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  mt: 1
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { component: Link, to: "/dashboard/settings", onClick: handleProfileMenuClose, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { fontSize: "small" }) }),
                  "Settings"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: handleLogout, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logout, { fontSize: "small" }) }),
                  "Logout"
                ] })
              ]
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "nav", sx: { width: { lg: drawerWidth }, flexShrink: { lg: 0 } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Drawer,
        {
          variant: "temporary",
          open: mobileOpen,
          onClose: handleDrawerToggle,
          ModalProps: {
            keepMounted: true
            // Better open performance on mobile.
          },
          sx: {
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "background.paper",
              border: "none",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)"
            }
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationList, {})
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Drawer,
        {
          variant: "permanent",
          sx: {
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "background.paper",
              border: "none",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)"
            }
          },
          open: true,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationList, {})
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "main", sx: { flexGrow: 1, width: { lg: `calc(100% - ${drawerWidth}px)` }, backgroundColor: "background.default", minHeight: "100vh" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toolbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
        showKycBanner && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Alert,
          {
            severity: "warning",
            sx: { mb: 2 },
            action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  variant: "contained",
                  onClick: () => navigate("/dashboard/settings#compliance"),
                  sx: { color: "#000" },
                  children: "Complete KYC"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  onClick: () => {
                    try {
                      localStorage.setItem("dismiss_kyc_banner", "1");
                    } catch (e) {
                    }
                    setDismissedKycBanner(true);
                  },
                  children: "Dismiss"
                }
              )
            ] }),
            children: "Your account requires identity verification (KYC). Complete it in Settings to unlock all features."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
      ] })
    ] })
  ] });
};
export {
  DashboardLayout,
  DashboardLayout as default
};
