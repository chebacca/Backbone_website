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
import { j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, d as Alert, _ as AlertTitle, x as List, y as ListItem, z as ListItemIcon, $ as WarningIcon, H as ListItemText, J as Security, N as CloudIcon, a as Button, a0 as Info, a1 as PeopleIcon, a2 as Schedule, G as Grid, a3 as CardMembership, a4 as Assessment, t as Card, w as CardContent, q as ArrowForward, D as Divider, a5 as PaymentIcon, r as Chip } from "./mui-Cc0LuBKd.js";
import { u as useNavigate, r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth } from "./index-BeFtug-f.js";
import { d as db } from "./firebase-BpHtCZEP.js";
import { getDoc, doc, query, collection, where, orderBy, limit, getDocs } from "./index.esm-CjtNHFZy.js";
import { M as MetricCard } from "./MetricCard-CbLkGtjQ.js";
import { u as useOrganizationLicenses, a as useOrganizationTeamMembers } from "./useStreamlinedData-CcPjkSJF.js";
import "./stripe-CSTr_BWb.js";
import "./index.esm-zVCMB3Cx.js";
import "./index.esm-D5-7iBdy.js";
import "./UnifiedDataService-BWUSusTA.js";
import "./FirestoreCollectionManager-B-YhbiEj.js";
const convertFirestoreDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && typeof value.toDate === "function") {
    try {
      return value.toDate();
    } catch (error) {
      console.warn("Failed to convert Firestore timestamp:", error);
      return null;
    }
  }
  if (typeof value === "string") {
    try {
      return new Date(value);
    } catch (error) {
      console.warn("Failed to parse date string:", error);
      return null;
    }
  }
  if (typeof value === "number") {
    try {
      return new Date(value);
    } catch (error) {
      console.warn("Failed to convert timestamp number:", error);
      return null;
    }
  }
  return null;
};
const DashboardOverview = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: licenses } = useOrganizationLicenses();
  const { data: teamMembersData } = useOrganizationTeamMembers();
  const [currentUser, setCurrentUser] = reactExports.useState(null);
  const [organization, setOrganization] = reactExports.useState(null);
  const [projects, setProjects] = reactExports.useState([]);
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchDashboardData = () => __async(void 0, null, function* () {
      try {
        setLoading(true);
        setError(null);
        const firebaseUid = user.firebaseUid || user.id;
        const userEmail = user.email;
        let userDoc = yield getDoc(doc(db, "users", firebaseUid));
        if (!userDoc.exists() && userEmail) {
          console.log("🔍 [DashboardOverview] User not found by UID, trying email:", userEmail);
          userDoc = yield getDoc(doc(db, "users", userEmail));
        }
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser(__spreadProps(__spreadValues({
            id: userDoc.id
          }, userData), {
            createdAt: convertFirestoreDate(userData.createdAt) || /* @__PURE__ */ new Date(),
            updatedAt: convertFirestoreDate(userData.updatedAt) || /* @__PURE__ */ new Date()
          }));
          console.log("✅ [DashboardOverview] Found user data:", userData.email);
        } else {
          console.warn("⚠️ [DashboardOverview] User document not found for UID or email:", firebaseUid, userEmail);
        }
        if (user.organizationId) {
          const orgDoc = yield getDoc(doc(db, "organizations", user.organizationId));
          if (orgDoc.exists()) {
            const orgData = orgDoc.data();
            setOrganization(__spreadProps(__spreadValues({
              id: orgDoc.id
            }, orgData), {
              createdAt: convertFirestoreDate(orgData.createdAt) || /* @__PURE__ */ new Date(),
              updatedAt: convertFirestoreDate(orgData.updatedAt) || /* @__PURE__ */ new Date()
            }));
          }
        }
        if (user.organizationId) {
          try {
            const projectsQuery = query(
              collection(db, "projects"),
              where("organizationId", "==", user.organizationId),
              orderBy("createdAt", "desc"),
              limit(10)
            );
            const projectsSnapshot = yield getDocs(projectsQuery);
            console.log("✅ [DashboardOverview] Projects found:", projectsSnapshot.size);
            const projectsData = projectsSnapshot.docs.map((doc2) => __spreadProps(__spreadValues({
              id: doc2.id
            }, doc2.data()), {
              createdAt: convertFirestoreDate(doc2.data().createdAt) || /* @__PURE__ */ new Date(),
              updatedAt: convertFirestoreDate(doc2.data().updatedAt) || /* @__PURE__ */ new Date()
            }));
            setProjects(projectsData);
          } catch (projectsError) {
            console.error("❌ [DashboardOverview] Error fetching projects:", projectsError);
            throw projectsError;
          }
        }
        if (user.organizationId) {
          try {
            const teamQuery = query(
              collection(db, "teamMembers"),
              where("organizationId", "==", user.organizationId),
              where("status", "in", ["ACTIVE", "active"])
            );
            const teamSnapshot = yield getDocs(teamQuery);
            console.log("✅ [DashboardOverview] Team members found:", teamSnapshot.size);
            const teamData = teamSnapshot.docs.map((doc2) => __spreadProps(__spreadValues({
              id: doc2.id
            }, doc2.data()), {
              createdAt: convertFirestoreDate(doc2.data().createdAt) || /* @__PURE__ */ new Date(),
              updatedAt: convertFirestoreDate(doc2.data().updatedAt) || /* @__PURE__ */ new Date()
            }));
            setTeamMembers(teamData);
          } catch (teamError) {
            console.error("❌ [DashboardOverview] Error fetching team members:", teamError);
            throw teamError;
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    });
    fetchDashboardData();
  }, [isAuthenticated, user]);
  const metrics = reactExports.useMemo(() => {
    if (!currentUser || !organization) {
      return {
        activeLicenses: 0,
        totalLicenses: 0,
        monthlyUsage: 0,
        totalDownloads: 0,
        currentPlan: "Unknown",
        daysUntilRenewal: "N/A",
        hasEnterpriseFeatures: false,
        projectCount: 0,
        teamMemberCount: 0
      };
    }
    const totalLicenses = (licenses == null ? void 0 : licenses.length) || 0;
    const activeLicenses = (licenses == null ? void 0 : licenses.filter((l) => l.status === "ACTIVE").length) || 0;
    const monthlyUsage = projects.reduce((sum, project) => {
      return sum + (project.status === "ACTIVE" ? 100 : 0);
    }, 0);
    const totalDownloads = projects.reduce((sum, project) => {
      return sum + (project.status === "ACTIVE" ? 50 : 0);
    }, 0);
    const teamMemberCount = (teamMembersData == null ? void 0 : teamMembersData.length) || teamMembers.length;
    const projectCount = projects.length;
    const currentPlan = organization.tier || "BASIC";
    const hasEnterpriseFeatures = currentPlan === "ENTERPRISE";
    const daysUntilRenewal = "30 days";
    return {
      activeLicenses,
      totalLicenses,
      monthlyUsage,
      totalDownloads,
      currentPlan,
      daysUntilRenewal,
      hasEnterpriseFeatures,
      projectCount,
      teamMemberCount
    };
  }, [currentUser, organization, projects, teamMembers, licenses, teamMembersData]);
  const userRole = reactExports.useMemo(() => {
    var _a;
    if (!currentUser) return "unknown";
    return ((_a = currentUser.role) == null ? void 0 : _a.toLowerCase()) || "member";
  }, [currentUser]);
  const isAdmin = userRole === "admin" || userRole === "owner" || userRole === "superadmin";
  if (authLoading || loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Loading Dashboard Data..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Fetching your organization and project information" })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Unable to Load Dashboard Data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "We encountered an issue loading your dashboard information. This could be due to:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Network connectivity issues" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Authentication token expired" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Firebase service temporarily unavailable" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            onClick: () => window.location.reload(),
            sx: { mr: 2 },
            children: "Retry"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            onClick: () => navigate("/dashboard/support"),
            children: "Contact Support"
          }
        )
      ] })
    ] }) });
  }
  if (!currentUser || !organization) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Setting Up Your Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "We're preparing your dashboard. This usually happens when:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Your account is being set up for the first time" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "You're being added to an organization" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Data synchronization is in progress" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            onClick: () => window.location.reload(),
            sx: { mr: 2 },
            children: "Refresh"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            onClick: () => navigate("/dashboard/team"),
            children: "Check Team Status"
          }
        )
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1, p: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", component: "h1", gutterBottom: true, children: [
        "Welcome back, ",
        currentUser.name || currentUser.email
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", color: "text.secondary", children: [
        organization.name,
        " • ",
        metrics.currentPlan,
        " Plan • ",
        userRole.charAt(0).toUpperCase() + userRole.slice(1)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Account Status",
          value: metrics.currentPlan,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
          color: "primary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Active Licenses",
          value: `${metrics.activeLicenses}/${metrics.totalLicenses}`,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CardMembership, {}),
          color: "primary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Projects",
          value: metrics.projectCount.toString(),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, {}),
          color: "success"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Team Members",
          value: metrics.teamMemberCount.toString(),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}),
          color: "secondary"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Quick Actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { button: true, onClick: () => navigate("/dashboard/cloud-projects"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: "Manage Projects",
                secondary: `${metrics.projectCount} active projects`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {})
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { button: true, onClick: () => navigate("/dashboard/team"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: "Team Management",
                secondary: `${metrics.teamMemberCount} team members`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {})
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { button: true, onClick: () => navigate("/dashboard/licenses"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardMembership, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: "License Management",
                secondary: `${metrics.activeLicenses} active licenses`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {})
          ] }),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { button: true, onClick: () => navigate("/dashboard/billing"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Billing & Subscription",
                  secondary: `${metrics.currentPlan} plan • Renews ${metrics.daysUntilRenewal}`
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {})
            ] })
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: projects && projects.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Recent Projects" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: projects.slice(0, 5).map((project, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { button: true, onClick: () => navigate("/dashboard/cloud-projects"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: project.name,
                secondary: `Created ${new Date(project.createdAt).toLocaleDateString()}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: project.status || "ACTIVE",
                size: "small",
                color: project.status === "ACTIVE" ? "success" : "default"
              }
            )
          ] }),
          index < Math.min(projects.length - 1, 4) && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
        ] }, project.id)) }),
        projects.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2, textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outlined",
            onClick: () => navigate("/dashboard/cloud-projects"),
            children: [
              "View All Projects (",
              projects.length,
              ")"
            ]
          }
        ) })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", py: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, { sx: { fontSize: 64, color: "text.secondary", mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "No Projects Yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Get started by creating your first project" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            onClick: () => navigate("/dashboard/cloud-projects"),
            children: "Create Project"
          }
        )
      ] }) }) })
    ] })
  ] });
};
export {
  DashboardOverview as default
};
