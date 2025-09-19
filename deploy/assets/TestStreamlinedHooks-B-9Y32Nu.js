import { j as jsxRuntimeExports, B as Box, T as Typography, t as Card, v as CardContent, aD as Skeleton, d as Alert, r as Chip, w as List, x as ListItem, z as ListItemText } from "./mui-BbtiZaA3.js";
import { b as useCurrentUser, c as useOrganizationContext, d as useUserProjects, e as useUserPermissions } from "./useStreamlinedData-1D9yTRdt.js";
import "./vendor-Cu2L4Rr-.js";
import "./UnifiedDataService-D1ZbkwL_.js";
import "./index-B86Cn9FC.js";
import "./stripe-rmDQXWB-.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./FirestoreCollectionManager-BD_cc1Zb.js";
import "./firebase-BVMO7I8u.js";
import "./index.esm-BMygn4u3.js";
const TestStreamlinedHooks = () => {
  var _a, _b, _c;
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { data: projects, loading: projectsLoading, error: projectsError } = useUserProjects();
  const permissions = useUserPermissions();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "🧪 Streamlined Hooks Test Dashboard" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "👤 Current User Hook Test" }),
      userLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 100 }),
      userError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
        "Error: ",
        userError
      ] }),
      currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Name:" }),
          " ",
          currentUser.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Email:" }),
          " ",
          currentUser.email
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "User Type:" }),
          " ",
          currentUser.userType
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Role:" }),
          " ",
          currentUser.role
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: `${currentUser.organization.tier} - ${currentUser.organization.name}`,
            color: "primary",
            sx: { mt: 1 }
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "🔐 User Permissions Hook Test" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: `Can Create Projects: ${permissions.canCreateProjects}`,
            color: permissions.canCreateProjects ? "success" : "default"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: `Can Manage Team: ${permissions.canManageTeam}`,
            color: permissions.canManageTeam ? "success" : "default"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: `Is Account Owner: ${permissions.isAccountOwner}`,
            color: permissions.isAccountOwner ? "primary" : "default"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: `Organization Tier: ${permissions.organizationTier}`,
            color: "info"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "🏢 Organization Context Hook Test" }),
      orgLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 150 }),
      orgError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
        "Error: ",
        orgError
      ] }),
      orgContext && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organization:" }),
          " ",
          orgContext.organization.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tier:" }),
          " ",
          orgContext.organization.tier
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total Members:" }),
          " ",
          orgContext.members.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Subscription Status:" }),
          " ",
          ((_a = orgContext.subscription) == null ? void 0 : _a.status) || "None"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Seats:" }),
          " ",
          ((_c = (_b = orgContext.subscription) == null ? void 0 : _b.plan) == null ? void 0 : _c.seats) || 0
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { mt: 2, mb: 1 }, children: "Team Members:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
          orgContext.members.slice(0, 5).map((member) => /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: member.name,
              secondary: `${member.email} - ${member.userType}`
            }
          ) }, member.id)),
          orgContext.members.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { secondary: `... and ${orgContext.members.length - 5} more` }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "📁 User Projects Hook Test" }),
      projectsLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 100 }),
      projectsError && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
        "Error: ",
        projectsError
      ] }),
      projects && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total Projects:" }),
          " ",
          projects.length
        ] }),
        projects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { mt: 2, mb: 1 }, children: "Recent Projects:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, children: projects.slice(0, 3).map((project) => /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: project.name,
              secondary: `${project.status} - ${project.teamAssignments.length} team members`
            }
          ) }, project.id)) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "⚡ Cache Performance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: "The hooks automatically cache data for 5 minutes to reduce Firebase calls. Try refreshing this page - subsequent loads should be much faster!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { mt: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Performance Tips:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "• First load: Fetches from Firebase",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "• Cached loads: Instant response from memory",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "• Auto-refresh: Cache expires after 5 minutes",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "• Optimistic updates: UI updates immediately, syncs in background"
      ] })
    ] }) })
  ] });
};
export {
  TestStreamlinedHooks,
  TestStreamlinedHooks as default
};
