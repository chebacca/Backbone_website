import { j as jsxRuntimeExports, a5 as Code, a6 as StorageIcon, a7 as Devices, H as Security, B as Box, C as CircularProgress, T as Typography, d as Alert, Z as AlertTitle, w as List, x as ListItem, y as ListItemIcon, _ as WarningIcon, z as ListItemText, a as Button, R as RefreshIcon, a8 as FormControl, a9 as InputLabel, aa as Select, M as MenuItem, ab as ButtonGroup, G as Grid, ac as Analytics, ad as Speed, t as Card, v as CardContent, ae as Avatar, i as LinearProgress, D as Divider, af as LocationOn } from "./mui-BbtiZaA3.js";
import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { b as useCurrentUser, c as useOrganizationContext, d as useUserProjects } from "./useStreamlinedData-z4hJHRxn.js";
import { M as MetricCard } from "./MetricCard-DT0TWtTD.js";
import "./UnifiedDataService-1nEfiWl8.js";
import "./index-LnbRM7Yy.js";
import "./stripe-rmDQXWB-.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./FirestoreCollectionManager-DXFNI81i.js";
import "./firebase-BTFXMplb.js";
import "./index.esm-BMygn4u3.js";
const AnalyticsPage = () => {
  var _a;
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { data: projects, loading: projectsLoading, error: projectsError } = useUserProjects();
  const [timeRange, setTimeRange] = reactExports.useState("7d");
  const [selectedMetric, setSelectedMetric] = reactExports.useState("api_calls");
  const isLoading = userLoading || orgLoading || projectsLoading;
  const hasError = userError || orgError || projectsError;
  const analyticsData = reactExports.useMemo(() => {
    var _a2, _b, _c;
    if (!currentUser || !orgContext || !projects) {
      return {
        totalApiCalls: 0,
        responseTime: 0,
        activeDevices: 0,
        dataTransfer: 0,
        uptime: 99.8,
        dailyUsage: [],
        topEndpoints: [],
        geographicData: [],
        usageMetrics: []
      };
    }
    const projectCount = projects.length;
    const teamMemberCount = ((_b = (_a2 = orgContext.organization) == null ? void 0 : _a2.usage) == null ? void 0 : _b.totalUsers) || 1;
    const totalApiCalls = projectCount * teamMemberCount * 150;
    const activeDevices = teamMemberCount;
    const dataTransfer = projectCount * teamMemberCount * 2.5;
    const dailyUsage = Array.from({ length: 7 }, (_, i) => {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - (6 - i));
      const baseValue = totalApiCalls / 7;
      const variation = 0.8 + Math.random() * 0.4;
      return {
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        value: Math.floor(baseValue * variation),
        change: Math.floor((Math.random() - 0.5) * 20)
      };
    });
    const userRole = ((_c = currentUser.role) == null ? void 0 : _c.toLowerCase()) || "member";
    const isAdmin = userRole === "admin" || userRole === "superadmin";
    return {
      totalApiCalls,
      responseTime: 98.7,
      // Default good response time
      activeDevices,
      dataTransfer,
      uptime: 99.8,
      // Default high uptime
      dailyUsage,
      topEndpoints: [
        { name: "/api/projects", calls: Math.floor(totalApiCalls * 0.3), percentage: 30 },
        { name: "/api/team-members", calls: Math.floor(totalApiCalls * 0.25), percentage: 25 },
        { name: "/api/licenses", calls: Math.floor(totalApiCalls * 0.2), percentage: 20 },
        { name: "/api/analytics", calls: Math.floor(totalApiCalls * 0.15), percentage: 15 },
        { name: "/api/auth", calls: Math.floor(totalApiCalls * 0.1), percentage: 10 }
      ],
      geographicData: [
        { region: "North America", users: Math.floor(teamMemberCount * 0.6) || 1, percentage: 60 },
        { region: "Europe", users: Math.floor(teamMemberCount * 0.25) || 1, percentage: 25 },
        { region: "Asia Pacific", users: Math.floor(teamMemberCount * 0.15) || 1, percentage: 15 }
      ],
      usageMetrics: [
        {
          name: "API Calls",
          value: totalApiCalls,
          limit: isAdmin ? 1e6 : 1e5,
          unit: "calls",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, {}),
          color: "#00d4ff"
        },
        {
          name: "Data Transfer",
          value: dataTransfer,
          limit: isAdmin ? 1e3 : 100,
          unit: "GB",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
          color: "#667eea"
        },
        {
          name: "Active Devices",
          value: activeDevices,
          limit: isAdmin ? 500 : 50,
          unit: "devices",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Devices, {}),
          color: "#f093fb"
        },
        {
          name: "Uptime",
          value: 99.8,
          limit: 100,
          unit: "%",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
          color: "#4facfe"
        }
      ]
    };
  }, [currentUser, orgContext, projects, timeRange]);
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
  };
  const handleRefresh = () => {
    window.location.reload();
  };
  const avgGrowth = reactExports.useMemo(() => {
    if (!analyticsData.dailyUsage.length) return 0;
    return analyticsData.dailyUsage.reduce((s, d) => s + (d.change || 0), 0) / analyticsData.dailyUsage.length;
  }, [analyticsData.dailyUsage]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Loading Analytics Data..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Calculating usage metrics and performance data" })
    ] }) });
  }
  if (hasError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Unable to Load Analytics Data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "We encountered an issue loading your analytics information. This could be due to:" }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: handleRefresh, startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}), children: "Retry" }) })
    ] }) });
  }
  if (!currentUser || !orgContext) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Setting Up Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "We're preparing your analytics dashboard. This may take a moment for new accounts." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Usage Analytics" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", color: "text.secondary", sx: { mb: 4 }, children: [
          "Monitor your ",
          ((_a = orgContext.organization) == null ? void 0 : _a.name) || "Organization",
          " usage patterns and performance"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Time Range" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: timeRange,
              label: "Time Range",
              onChange: handleTimeRangeChange,
              disabled: isLoading,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "7d", children: "Last 7 days" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "30d", children: "Last 30 days" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "90d", children: "Last 90 days" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonGroup, { variant: "outlined", size: "small", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: selectedMetric === "api_calls" ? "contained" : "outlined",
              onClick: () => handleMetricChange("api_calls"),
              children: "API Calls"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: selectedMetric === "data_transfer" ? "contained" : "outlined",
              onClick: () => handleMetricChange("data_transfer"),
              children: "Data Transfer"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: selectedMetric === "devices" ? "contained" : "outlined",
              onClick: () => handleMetricChange("devices"),
              children: "Devices"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            onClick: handleRefresh,
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
            children: "Refresh"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Total API Calls",
          value: analyticsData.totalApiCalls.toLocaleString(),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, {}),
          trend: { value: avgGrowth, direction: avgGrowth >= 0 ? "up" : "down" },
          color: "primary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Response Time",
          value: `${analyticsData.responseTime}%`,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Speed, {}),
          trend: { value: 2.3, direction: "up" },
          color: "secondary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Active Devices",
          value: analyticsData.activeDevices.toString(),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Devices, {}),
          trend: { value: 12, direction: "up" },
          color: "warning"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Data Transfer",
          value: `${analyticsData.dataTransfer.toFixed(1)} GB`,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
          trend: { value: 0.2, direction: "down" },
          color: "error"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Uptime",
          value: `${analyticsData.uptime}%`,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
          trend: { value: 0.1, direction: "up" },
          color: "success"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, lg: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: [
          "Usage Trends - ",
          timeRange.replace("d", " Days")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { height: 200, display: "flex", alignItems: "end", gap: 1, px: 2 }, children: analyticsData.dailyUsage.map((item, index) => {
          const maxValue = Math.max(...analyticsData.dailyUsage.map((d) => d.value));
          const height = maxValue > 0 ? item.value / maxValue * 160 : 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                sx: {
                  width: "100%",
                  height: `${height}px`,
                  backgroundColor: "primary.main",
                  borderRadius: "4px 4px 0 0",
                  mb: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    transform: "translateY(-2px)"
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: item.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600 }, children: item.value.toLocaleString() })
          ] }, index);
        }) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Top API Endpoints" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, children: analyticsData.topEndpoints.map((endpoint, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 40 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Avatar,
              {
                sx: {
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: "0.875rem",
                  fontWeight: 600
                },
                children: index + 1
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: endpoint.name,
                secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mt: 0.5 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    LinearProgress,
                    {
                      variant: "determinate",
                      value: endpoint.percentage,
                      sx: {
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 2,
                          background: "linear-gradient(90deg, #00d4ff 0%, #667eea 100%)"
                        }
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { minWidth: 60 }, children: [
                    endpoint.calls.toLocaleString(),
                    " calls"
                  ] })
                ] }),
                primaryTypographyProps: {
                  variant: "body2",
                  fontWeight: 500,
                  sx: { fontFamily: "monospace" }
                }
              }
            )
          ] }),
          index < analyticsData.topEndpoints.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
        ] }, endpoint.name)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Geographic Distribution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, children: analyticsData.geographicData.map((region, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 40 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LocationOn, { sx: { color: "primary.main" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: region.region,
                secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mt: 0.5 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    LinearProgress,
                    {
                      variant: "determinate",
                      value: region.percentage,
                      sx: {
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 2,
                          background: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)"
                        }
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { minWidth: 60 }, children: [
                    region.users,
                    " users"
                  ] })
                ] }),
                primaryTypographyProps: {
                  variant: "body2",
                  fontWeight: 500
                }
              }
            )
          ] }),
          index < analyticsData.geographicData.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
        ] }, region.region)) })
      ] }) }) })
    ] })
  ] });
};
export {
  AnalyticsPage as default
};
