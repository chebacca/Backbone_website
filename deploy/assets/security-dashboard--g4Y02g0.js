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
import { j as jsxRuntimeExports, B as Box, d as Alert, T as Typography, bN as BlockIcon, H as Security, aB as Tooltip, g as IconButton, R as RefreshIcon, C as CircularProgress, aG as Tabs, aH as Tab, ac as Analytics, _ as WarningIcon, a0 as PeopleIcon, G as Grid, t as Card, v as CardContent, aM as ComputerIcon, o as ErrorIcon, r as Chip, i as LinearProgress, bO as CardHeader, p as CheckCircleIcon, w as List, x as ListItem, y as ListItemIcon, z as ListItemText, D as Divider } from "./mui-BbtiZaA3.js";
import { r as reactExports, b as React, u as useNavigate } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth } from "./index-CkGwUwt-.js";
import { getAuth } from "./index.esm-BMygn4u3.js";
import "./index.esm-zVCMB3Cx.js";
import "./stripe-rmDQXWB-.js";
const MasterSecurityDashboard = ({
  userRole,
  organizationId
}) => {
  const [activeTab, setActiveTab] = reactExports.useState(0);
  const [securityMetrics, setSecurityMetrics] = reactExports.useState(null);
  const [securityAlerts, setSecurityAlerts] = reactExports.useState([]);
  const [userOverviews, setUserOverviews] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [lastRefresh, setLastRefresh] = reactExports.useState(/* @__PURE__ */ new Date());
  const hasSecurityAccess = reactExports.useCallback(() => {
    return userRole === "DEV_ADMIN" || userRole === "ORG_ADMIN";
  }, [userRole]);
  const isDevAdmin = userRole === "DEV_ADMIN";
  const isOrgAdmin = userRole === "ORG_ADMIN";
  const loadSecurityMetrics = reactExports.useCallback(() => __async(void 0, null, function* () {
    try {
      setLoading(true);
      if (isDevAdmin) {
        const [dashboardMetrics, licensingMetrics] = yield Promise.all([
          fetch("/api/security/metrics?source=dashboard_app").then((res) => res.json()).catch(() => null),
          fetch("/api/security/metrics?source=licensing_website").then((res) => res.json()).catch(() => null)
        ]);
        const combinedMetrics = {
          totalUsers: ((dashboardMetrics == null ? void 0 : dashboardMetrics.totalUsers) || 0) + ((licensingMetrics == null ? void 0 : licensingMetrics.totalUsers) || 0),
          activeUsers: ((dashboardMetrics == null ? void 0 : dashboardMetrics.activeUsers) || 0) + ((licensingMetrics == null ? void 0 : licensingMetrics.activeUsers) || 0),
          securityAlerts: ((dashboardMetrics == null ? void 0 : dashboardMetrics.securityAlerts) || 0) + ((licensingMetrics == null ? void 0 : licensingMetrics.securityAlerts) || 0),
          criticalAlerts: ((dashboardMetrics == null ? void 0 : dashboardMetrics.criticalAlerts) || 0) + ((licensingMetrics == null ? void 0 : licensingMetrics.criticalAlerts) || 0),
          resolvedAlerts: ((dashboardMetrics == null ? void 0 : dashboardMetrics.resolvedAlerts) || 0) + ((licensingMetrics == null ? void 0 : licensingMetrics.resolvedAlerts) || 0),
          threatLevel: "medium",
          lastUpdated: /* @__PURE__ */ new Date()
        };
        setSecurityMetrics(combinedMetrics);
      } else if (isOrgAdmin && organizationId) {
        const orgMetrics = yield fetch(`/api/security/metrics?source=licensing_website&organizationId=${organizationId}`).then((res) => res.json()).catch(() => null);
        setSecurityMetrics(orgMetrics || {
          totalUsers: 0,
          activeUsers: 0,
          securityAlerts: 0,
          criticalAlerts: 0,
          resolvedAlerts: 0,
          threatLevel: "low",
          lastUpdated: /* @__PURE__ */ new Date()
        });
      }
    } catch (error) {
      console.error("Error loading security metrics:", error);
    } finally {
      setLoading(false);
    }
  }), [isDevAdmin, isOrgAdmin, organizationId]);
  const loadSecurityAlerts = reactExports.useCallback(() => __async(void 0, null, function* () {
    try {
      if (isDevAdmin) {
        const [dashboardResponse, licensingResponse] = yield Promise.all([
          fetch("/api/security/alerts?source=dashboard_app").then((res) => res.json()).catch(() => ({ success: false, data: [] })),
          fetch("/api/security/alerts?source=licensing_website").then((res) => res.json()).catch(() => ({ success: false, data: [] }))
        ]);
        const dashboardAlerts = dashboardResponse.success ? dashboardResponse.data : [];
        const licensingAlerts = licensingResponse.success ? licensingResponse.data : [];
        const allAlerts = [...dashboardAlerts, ...licensingAlerts].map((alert) => __spreadProps(__spreadValues({}, alert), {
          timestamp: new Date(alert.timestamp)
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setSecurityAlerts(allAlerts);
      } else if (isOrgAdmin && organizationId) {
        const response = yield fetch(`/api/security/alerts?source=licensing_website&organizationId=${organizationId}`).then((res) => res.json()).catch(() => ({ success: false, data: [] }));
        const orgAlerts = response.success ? response.data : [];
        const filteredAlerts = orgAlerts.map((alert) => __spreadProps(__spreadValues({}, alert), {
          timestamp: new Date(alert.timestamp)
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setSecurityAlerts(filteredAlerts);
      }
    } catch (error) {
      console.error("Error loading security alerts:", error);
    }
  }), [isDevAdmin, isOrgAdmin, organizationId]);
  const loadUserOverviews = reactExports.useCallback(() => __async(void 0, null, function* () {
    try {
      if (isDevAdmin) {
        const [dashboardUsers, licensingUsers] = yield Promise.all([
          fetch("/api/security/users?source=dashboard_app").then((res) => res.json()).catch(() => []),
          fetch("/api/security/users?source=licensing_website").then((res) => res.json()).catch(() => [])
        ]);
        const allUsers = [...dashboardUsers, ...licensingUsers].map((user) => __spreadProps(__spreadValues({}, user), {
          userId: `user_${user.userId.slice(-4)}`,
          // Anonymize user ID
          lastActivity: new Date(user.lastActivity),
          lastLogin: new Date(user.lastLogin)
        })).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
        setUserOverviews(allUsers);
      } else if (isOrgAdmin && organizationId) {
        const orgUsers = yield fetch(`/api/security/users?source=licensing_website&organizationId=${organizationId}`).then((res) => res.json()).catch(() => []);
        const filteredUsers = orgUsers.map((user) => __spreadProps(__spreadValues({}, user), {
          lastActivity: new Date(user.lastActivity),
          lastLogin: new Date(user.lastLogin)
        })).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
        setUserOverviews(filteredUsers);
      }
    } catch (error) {
      console.error("Error loading user overviews:", error);
    }
  }), [isDevAdmin, isOrgAdmin, organizationId]);
  const refreshData = reactExports.useCallback(() => __async(void 0, null, function* () {
    setLastRefresh(/* @__PURE__ */ new Date());
    yield Promise.all([
      loadSecurityMetrics(),
      loadSecurityAlerts(),
      loadUserOverviews()
    ]);
  }), [loadSecurityMetrics, loadSecurityAlerts, loadUserOverviews]);
  reactExports.useEffect(() => {
    if (hasSecurityAccess()) {
      refreshData();
    }
  }, [hasSecurityAccess, refreshData]);
  reactExports.useEffect(() => {
    if (!hasSecurityAccess()) return;
    const interval = setInterval(refreshData, 3e4);
    return () => clearInterval(interval);
  }, [hasSecurityAccess, refreshData]);
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };
  const getThreatLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "#d32f2f";
      case "high":
        return "#f57c00";
      case "medium":
        return "#fbc02d";
      case "low":
        return "#388e3c";
      default:
        return "#757575";
    }
  };
  const renderMetricsOverview = () => {
    var _a;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "Total Users" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", children: (securityMetrics == null ? void 0 : securityMetrics.totalUsers) || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { color: "primary", sx: { fontSize: 40 } })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "Active Users" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "success.main", children: (securityMetrics == null ? void 0 : securityMetrics.activeUsers) || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, { color: "success", sx: { fontSize: 40 } })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "Security Alerts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "warning.main", children: (securityMetrics == null ? void 0 : securityMetrics.securityAlerts) || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning", sx: { fontSize: 40 } })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "textSecondary", gutterBottom: true, children: "Critical Alerts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "error.main", children: (securityMetrics == null ? void 0 : securityMetrics.criticalAlerts) || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { color: "error", sx: { fontSize: 40 } })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Overall Threat Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: ((_a = securityMetrics == null ? void 0 : securityMetrics.threatLevel) == null ? void 0 : _a.toUpperCase()) || "UNKNOWN",
              color: getSeverityColor((securityMetrics == null ? void 0 : securityMetrics.threatLevel) || "low"),
              size: "large"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          LinearProgress,
          {
            variant: "determinate",
            value: (securityMetrics == null ? void 0 : securityMetrics.threatLevel) === "critical" ? 100 : (securityMetrics == null ? void 0 : securityMetrics.threatLevel) === "high" ? 75 : (securityMetrics == null ? void 0 : securityMetrics.threatLevel) === "medium" ? 50 : 25,
            sx: {
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(0,0,0,0.1)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: getThreatLevelColor((securityMetrics == null ? void 0 : securityMetrics.threatLevel) || "low")
              }
            }
          }
        )
      ] }) }) })
    ] });
  };
  const renderSecurityAlerts = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CardHeader,
      {
        title: "Security Alerts",
        action: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Refresh Alerts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: refreshData, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}) }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: securityAlerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}), children: "No security alerts at this time" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: securityAlerts.slice(0, 20).map((alert, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: alert.severity === "critical" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { color: "error" }) : alert.severity === "high" ? /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { color: "info" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ListItemText,
          {
            primary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", children: alert.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: alert.severity.toUpperCase(),
                  color: getSeverityColor(alert.severity),
                  size: "small"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: alert.source.replace("_", " ").toUpperCase(),
                  variant: "outlined",
                  size: "small"
                }
              )
            ] }),
            secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: alert.timestamp.toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "textSecondary", children: [
                "User: ",
                alert.userContext.isAnonymized ? "***" : alert.userContext.userId,
                " | Role: ",
                alert.userContext.userRole,
                " | Org: ",
                alert.userContext.organizationId
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: alert.resolved ? /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Resolved", color: "success", size: "small" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Active", color: "warning", size: "small" }) })
      ] }),
      index < securityAlerts.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
    ] }, alert.id)) }) })
  ] });
  const renderUserOverview = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CardHeader,
      {
        title: "User Security Overview",
        subheader: "Anonymized user security status across all platforms"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: userOverviews.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: "No user data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: userOverviews.slice(0, 50).map((user, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: user.threatLevel === "critical" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { color: "error" }) : user.threatLevel === "high" ? /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" }) : user.threatLevel === "medium" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { color: "info" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ListItemText,
          {
            primary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", children: [
                "User ",
                user.userId
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: user.threatLevel.toUpperCase(),
                  color: getSeverityColor(user.threatLevel),
                  size: "small"
                }
              ),
              user.isOnline && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Online", color: "success", size: "small" }),
              user.suspiciousActivity && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Suspicious", color: "warning", size: "small" })
            ] }),
            secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "textSecondary", children: [
                "Role: ",
                user.userRole,
                " | Org: ",
                user.organizationId,
                " | Devices: ",
                user.deviceCount,
                " | Alerts: ",
                user.activeAlerts
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "textSecondary", children: [
                "Last Activity: ",
                user.lastActivity.toLocaleString(),
                " | Last Login: ",
                user.lastLogin.toLocaleString()
              ] })
            ] })
          }
        )
      ] }),
      index < userOverviews.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
    ] }, user.userId)) }) })
  ] });
  if (!hasSecurityAccess()) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { p: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BlockIcon, {}), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Access Denied" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "You do not have the required permissions to access the Security Dashboard. This dashboard is restricted to DEV ADMIN and Organization Admin users only." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { p: 3, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { color: "primary", sx: { fontSize: 40 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", component: "h1", children: isDevAdmin ? "Master Security Dashboard" : "Organization Security Dashboard" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", color: "textSecondary", children: isDevAdmin ? "Cross-Platform Security Monitoring & Threat Detection" : "Organization Security Monitoring & Team Member Management" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "textSecondary", children: [
          "Last updated: ",
          lastRefresh.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Refresh All Data", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: refreshData, disabled: loading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}) }) })
      ] })
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", mb: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { mb: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onChange: (e, newValue) => setActiveTab(newValue), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Overview", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Security Alerts", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "User Overview", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}) })
    ] }) }),
    activeTab === 0 && renderMetricsOverview(),
    activeTab === 1 && renderSecurityAlerts(),
    activeTab === 2 && renderUserOverview()
  ] });
};
const SecurityDashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = reactExports.useState("USER");
  const [organizationId, setOrganizationId] = reactExports.useState();
  const [permissionLoading, setPermissionLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const checkUserPermissions = () => __async(void 0, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (!user) {
        setPermissionLoading(false);
        return;
      }
      try {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        console.log("SecurityDashboard - Firebase Auth user:", firebaseUser);
        console.log("SecurityDashboard - Firebase Auth user email:", firebaseUser == null ? void 0 : firebaseUser.email);
        if (firebaseUser) {
          const idTokenResult = yield firebaseUser.getIdTokenResult();
          const claims = idTokenResult.claims;
          console.log("SecurityDashboard - Firebase Auth claims:", claims);
          const isDevAdmin = (claims == null ? void 0 : claims.role) === "DEV_ADMIN" || (claims == null ? void 0 : claims.role) === "SuperAdmin" || (claims == null ? void 0 : claims.role) === "SUPERADMIN" || (claims == null ? void 0 : claims.isDevAdmin) === true || ((_a = claims == null ? void 0 : claims.permissions) == null ? void 0 : _a.includes("security:master_access")) || ((_b = claims == null ? void 0 : claims.permissions) == null ? void 0 : _b.includes("admin:master_security"));
          const isOrgAdmin = (claims == null ? void 0 : claims.role) === "ADMIN" || (claims == null ? void 0 : claims.role) === "ORG_ADMIN" || (claims == null ? void 0 : claims.role) === "SuperAdmin" || (claims == null ? void 0 : claims.role) === "SUPERADMIN" || (claims == null ? void 0 : claims.isOrgAdmin) === true || ((_c = claims == null ? void 0 : claims.permissions) == null ? void 0 : _c.includes("admin:organization")) || ((_d = claims == null ? void 0 : claims.permissions) == null ? void 0 : _d.includes("admin:team_members"));
          console.log("SecurityDashboard - Firebase Auth isDevAdmin:", isDevAdmin);
          console.log("SecurityDashboard - Firebase Auth isOrgAdmin:", isOrgAdmin);
          if (isDevAdmin) {
            console.log("SecurityDashboard - Setting role to DEV_ADMIN (Firebase Auth)");
            setUserRole("DEV_ADMIN");
          } else if (isOrgAdmin) {
            console.log("SecurityDashboard - Setting role to ORG_ADMIN (Firebase Auth)");
            setUserRole("ORG_ADMIN");
            setOrganizationId((claims == null ? void 0 : claims.organizationId) || (user == null ? void 0 : user.organizationId));
          } else {
            console.log("SecurityDashboard - Setting role to USER (Firebase Auth)");
            setUserRole("USER");
          }
        } else {
          console.log("SecurityDashboard - No Firebase Auth user, using fallback role detection");
          console.log("SecurityDashboard - User object:", user);
          console.log("SecurityDashboard - User properties:", Object.keys(user || {}));
          const userRole2 = (user == null ? void 0 : user.role) || (user == null ? void 0 : user.userRole) || (user == null ? void 0 : user.user_type);
          const isDevAdmin = userRole2 === "DEV_ADMIN" || userRole2 === "SuperAdmin" || userRole2 === "SUPERADMIN" || (user == null ? void 0 : user.isDevAdmin) === true || ((_e = user == null ? void 0 : user.permissions) == null ? void 0 : _e.includes("security:master_access")) || ((_f = user == null ? void 0 : user.permissions) == null ? void 0 : _f.includes("admin:master_security"));
          const isOrgAdmin = userRole2 === "ADMIN" || userRole2 === "ORG_ADMIN" || userRole2 === "SuperAdmin" || userRole2 === "SUPERADMIN" || (user == null ? void 0 : user.isOrgAdmin) === true || ((_g = user == null ? void 0 : user.permissions) == null ? void 0 : _g.includes("admin:organization")) || ((_h = user == null ? void 0 : user.permissions) == null ? void 0 : _h.includes("admin:team_members"));
          console.log("SecurityDashboard - Fallback isDevAdmin:", isDevAdmin);
          console.log("SecurityDashboard - Fallback isOrgAdmin:", isOrgAdmin);
          if (isDevAdmin) {
            console.log("SecurityDashboard - Setting role to DEV_ADMIN (fallback)");
            setUserRole("DEV_ADMIN");
          } else if (isOrgAdmin) {
            console.log("SecurityDashboard - Setting role to ORG_ADMIN (fallback)");
            setUserRole("ORG_ADMIN");
            setOrganizationId(user == null ? void 0 : user.organizationId);
          } else {
            console.log("SecurityDashboard - Setting role to USER (fallback)");
            setUserRole("USER");
          }
        }
      } catch (error) {
        console.error("Error checking user permissions:", error);
        setUserRole("USER");
      } finally {
        setPermissionLoading(false);
      }
    });
    checkUserPermissions();
  }, [user]);
  reactExports.useEffect(() => {
    if (!permissionLoading && userRole === "USER") {
      console.log("SecurityDashboard - Redirecting non-admin user to dashboard");
      navigate("/dashboard");
    }
  }, [userRole, permissionLoading, navigate]);
  if (authLoading || permissionLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        flexDirection: "column",
        gap: 2,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "textSecondary", children: "Loading Security Dashboard..." })
        ]
      }
    );
  }
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { p: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Authentication Required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "You must be logged in to access the Security Dashboard." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MasterSecurityDashboard, { userRole, organizationId });
};
export {
  SecurityDashboardPage as default
};
