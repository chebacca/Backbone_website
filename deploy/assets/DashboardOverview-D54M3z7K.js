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
import { j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, d as Alert, aa as AlertTitle, x as List, y as ListItem, z as ListItemIcon, ab as WarningIcon, H as ListItemText, J as Security, N as CloudIcon, a as Button, ac as InfoIcon, ad as PeopleIcon, a9 as Schedule, G as Grid, ae as CardMembership, af as Assessment, t as Card, w as CardContent, q as ArrowForward, D as Divider, a3 as Download, a2 as PaymentIcon, r as Chip } from "./mui-kQ2X8N0A.js";
import { u as useNavigate, r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth } from "./index-C4eF6KWV.js";
import { d as db } from "./firebase-CxbSQ7r3.js";
import { query, collection, where, orderBy, limit, getDocs } from "./index.esm-CORWL332.js";
import { M as MetricCard } from "./MetricCard-CBO42J1_.js";
import { u as useCurrentUser, a as useOrganizationLicenses, b as useOrganizationTeamMembers } from "./useStreamlinedData-CqNnYqGA.js";
import "./stripe-TEyM19uV.js";
import "./index.esm-6tSZEpI2.js";
import "./index.esm-Bwx4LHm0.js";
import "./UnifiedDataService-CmxnkHtJ.js";
import "./FirestoreCollectionManager-C0cVebWr.js";
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
  var _a;
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: currentUser, loading: userLoading } = useCurrentUser();
  const { data: licenses } = useOrganizationLicenses();
  const { data: teamMembersData } = useOrganizationTeamMembers();
  const [projects, setProjects] = reactExports.useState([]);
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!isAuthenticated || !user || !currentUser) return;
    const fetchAdditionalData = () => __async(void 0, null, function* () {
      var _a2;
      try {
        setLoading(true);
        setError(null);
        if (currentUser.userType === "STANDALONE" || currentUser.role === "STANDALONE_USER") {
          console.log("🔧 [DashboardOverview] Standalone user detected - skipping projects and team members");
          setProjects([]);
          setTeamMembers([]);
          setLoading(false);
          return;
        }
        if ((_a2 = currentUser.organization) == null ? void 0 : _a2.id) {
          try {
            const projectsQuery = query(
              collection(db, "projects"),
              where("organizationId", "==", currentUser.organization.id),
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
          }
        }
        if (teamMembersData) {
          const teamData = teamMembersData.map((member) => ({
            id: member.id,
            email: member.email,
            name: member.firstName + " " + member.lastName,
            role: member.role,
            userType: "TEAM_MEMBER",
            organizationId: member.organizationId,
            status: member.status,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt
          }));
          setTeamMembers(teamData);
        }
      } catch (err) {
        console.error("Error fetching additional dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch additional data");
      } finally {
        setLoading(false);
      }
    });
    fetchAdditionalData();
  }, [isAuthenticated, user, currentUser, teamMembersData]);
  const metrics = reactExports.useMemo(() => {
    var _a2;
    if (!currentUser) {
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
    const currentPlan = ((_a2 = currentUser.organization) == null ? void 0 : _a2.tier) || "BASIC";
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
  }, [currentUser, projects, teamMembers, licenses, teamMembersData]);
  const userRole = reactExports.useMemo(() => {
    var _a2;
    if (!currentUser) return "unknown";
    return ((_a2 = currentUser.role) == null ? void 0 : _a2.toLowerCase()) || "member";
  }, [currentUser]);
  const isAdmin = userRole === "admin" || userRole === "owner" || userRole === "superadmin";
  if (authLoading || userLoading || loading) {
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
  if (!currentUser) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Setting Up Your Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "We're preparing your dashboard. This usually happens when:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { fontSize: "small" }) }),
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
            onClick: () => navigate("/dashboard/support"),
            children: "Contact Support"
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
        ((_a = currentUser.organization) == null ? void 0 : _a.name) || "Standalone User",
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: currentUser.userType === "STANDALONE" || currentUser.role === "STANDALONE_USER" ? (
          // Standalone user actions
          /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { button: true, onClick: () => navigate("/dashboard/downloads"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Downloads",
                  secondary: "Download your licensed applications"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {})
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { button: true, onClick: () => navigate("/dashboard/support"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Support",
                  secondary: "Get help with your standalone license"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {})
            ] })
          ] })
        ) : (
          // Subscription user actions
          /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
        ) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: currentUser.userType === "STANDALONE" || currentUser.role === "STANDALONE_USER" ? (
        // Standalone user info card
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Standalone License Info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardMembership, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "License Type",
                  secondary: metrics.currentPlan
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Status",
                  secondary: "Active"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Downloads Available",
                  secondary: "Call Sheet Pro, EDL Converter Pro"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2, textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              onClick: () => navigate("/dashboard/downloads"),
              children: "View Downloads"
            }
          ) })
        ] }) })
      ) : projects && projects.length > 0 ? (
        // Subscription user projects
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
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
        ] }) })
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", py: 4 }, children: [
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
