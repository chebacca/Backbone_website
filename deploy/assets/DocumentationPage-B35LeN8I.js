import { j as jsxRuntimeExports, B as Box, b as Container, T as Typography, d as Alert, c as Paper, aG as Tabs, aH as Tab, aQ as DashboardIcon, aR as AutoAwesome, aS as Api, a5 as Code, G as Grid, O as Accordion, Q as AccordionSummary, r as Chip, U as ExpandMoreIcon, W as AccordionDetails, a as Button, aT as School, aU as BugReport, aV as GroupWork, aW as Settings, t as Card, v as CardContent, aX as Work, aY as Timeline, as as Download, aZ as PlayArrow, a_ as Assignment, a$ as VideoLibrary, a3 as Assessment, b0 as Message, aA as Notifications, X as Group, b1 as IntegrationInstructions, b2 as Psychology, b3 as SearchIcon, ac as Analytics, b4 as Inventory, b5 as DesktopMac, b6 as NetworkCheck, b7 as Mode, b8 as SecurityOutlined, b9 as CodeRounded, ba as CodeSharp, bb as CodeTwoTone, bc as CodeOff, bd as Web, be as StorageOutlined, bf as Architecture, bg as Build, bh as CloudQueue, ad as Speed, K as CloudIcon } from "./mui-BbtiZaA3.js";
import { r as reactExports, e as useLocation } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { N as Navigation } from "./Navigation-apdPEi2v.js";
import { F as Footer } from "./Footer-05O2RJ_T.js";
import "./index-DgWccpnT.js";
import "./stripe-rmDQXWB-.js";
const DocumentationPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedTab, setSelectedTab] = reactExports.useState(0);
  const [expandedSection, setExpandedSection] = reactExports.useState(false);
  const handleSectionChange = (section) => (_event, isExpanded) => {
    setExpandedSection(isExpanded ? section : false);
  };
  const handleDownload = (title) => {
    enqueueSnackbar(`Starting download: ${title}`, { variant: "info" });
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`# ${title}

This is a sample ${title.toLowerCase()} for Dashboard v14.

## Features
- Comprehensive documentation
- Step-by-step guides
- Code examples
- Best practices

## Getting Started
Follow the instructions in this guide to get started with Dashboard v14.

## Support
For additional support, contact our team at support@dashboardv14.com`)}`;
      link.download = `${title.replace(/\s+/g, "_")}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      enqueueSnackbar(`${title} downloaded successfully!`, { variant: "success" });
    }, 1e3);
  };
  const handleTabChange = (_event, newValue) => {
    setSelectedTab(newValue);
    setExpandedSection(false);
  };
  const coreFeatures = [
    {
      id: "sessions",
      title: "Session Management",
      description: "Comprehensive workflow and session tracking system",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Work, {}),
      category: "core",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Session Management System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Dashboard v14 provides a complete session management system for video production workflows, including pre-production planning, active session tracking, and post-production coordination." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Work, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Workflow Management"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Multi-stage workflow tracking",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Real-time status updates",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Assignment management",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Progress monitoring"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Timeline, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Timeline Tracking"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Visual timeline interface",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Milestone tracking",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Deadline management",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Schedule optimization"
            ] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pro Tip:" }),
          " Use the unified workflow system to create custom workflows tailored to your production needs. Each workflow can have multiple stages with specific assignments and requirements."
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mt: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              size: "small",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
              onClick: () => handleDownload("Session Management Guide"),
              children: "Download Guide"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              size: "small",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, {}),
              onClick: () => enqueueSnackbar("Opening Session Management Tutorial...", { variant: "info" }),
              children: "Watch Tutorial"
            }
          )
        ] })
      ] })
    },
    {
      id: "post-production",
      title: "Post-Production Workflows",
      description: "Advanced post-production task management and coordination",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, {}),
      category: "core",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Post-Production System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Comprehensive post-production management with task assignment, progress tracking, and team coordination for video editing, color grading, and final delivery." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Assignment, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Task Assignment"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Role-based assignments",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Skill matching",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Workload balancing",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Priority management"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(VideoLibrary, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Media Management"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• File organization",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Version control",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Asset tracking",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Metadata management"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Quality Control"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Review workflows",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Approval processes",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Feedback integration",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Final delivery"
            ] })
          ] }) }) })
        ] })
      ] })
    },
    {
      id: "team-collaboration",
      title: "Team Collaboration",
      description: "Real-time messaging, notifications, and team coordination",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}),
      category: "core",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Team Collaboration Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Built-in communication tools for seamless team coordination, including real-time messaging, notifications, and role-based access control." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Message, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Real-time Messaging"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Instant messaging",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• File sharing",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Message history",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Read receipts"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Notifications, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Smart Notifications"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Custom notification rules",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Priority-based alerts",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Email integration",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Mobile notifications"
            ] })
          ] }) }) })
        ] })
      ] })
    }
  ];
  const advancedFeatures = [
    {
      id: "ai-agents",
      title: "AI Agent Integration",
      description: "Intelligent AI agents for automated workflows and assistance",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Psychology, {}),
      category: "features",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "AI Agent System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Advanced AI integration with Google Gemini for intelligent workflow automation, content generation, and decision support." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AutoAwesome, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Smart Automation"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Workflow automation",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Content generation",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Decision support",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Pattern recognition"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationInstructions, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Seamless Integration"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• API integration",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Custom prompts",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Context awareness",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Performance optimization"
            ] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mt: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              size: "small",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
              onClick: () => handleDownload("AI Agent Integration Guide"),
              children: "Download Guide"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              size: "small",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, {}),
              onClick: () => enqueueSnackbar("Opening AI Agent Demo...", { variant: "info" }),
              children: "View Demo"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              size: "small",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, {}),
              onClick: () => enqueueSnackbar("Opening AI Agent API Documentation...", { variant: "info" }),
              children: "API Docs"
            }
          )
        ] })
      ] })
    },
    {
      id: "inventory-management",
      title: "Inventory Management",
      description: "Comprehensive asset and equipment tracking system",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Inventory, {}),
      category: "features",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Inventory Management System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Complete asset tracking with barcode scanning, equipment management, and resource allocation for production workflows." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Asset Tracking"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Barcode scanning",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Location tracking",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Maintenance schedules",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Usage history"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Assignment, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Resource Allocation"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Equipment assignment",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Availability tracking",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Conflict resolution",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Cost tracking"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Usage Analytics"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Utilization reports",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Performance metrics",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Cost analysis",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Optimization insights"
            ] })
          ] }) }) })
        ] })
      ] })
    },
    {
      id: "mode-awareness",
      title: "Mode Awareness System",
      description: "Dual-mode operation for standalone and network environments",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mode, {}),
      category: "features",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Mode Awareness System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Intelligent dual-mode architecture supporting both standalone desktop operation and collaborative network environments from a single codebase." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopMac, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Standalone Mode"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Desktop-like experience",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Local project storage",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Offline capability",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• File system integration"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkCheck, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Network Mode"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Collaborative workspaces",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Real-time synchronization",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Team coordination",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Shared resources"
            ] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Smart Switching:" }),
          " The system automatically detects your environment and recommends the optimal mode, with seamless switching between modes."
        ] }) })
      ] })
    }
  ];
  const integrationDocs = [
    {
      id: "api-reference",
      title: "API Reference",
      description: "Complete REST API documentation with examples",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Api, {}),
      category: "integration",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "REST API Documentation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Comprehensive API reference for integrating Dashboard v14 with external systems and building custom applications." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityOutlined, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Authentication"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• JWT token authentication",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Role-based access control",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• API key management",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Rate limiting"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CodeRounded, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Endpoints"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Sessions management",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• User operations",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Inventory control",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Workflow operations"
            ] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
            onClick: () => handleDownload("API Reference"),
            sx: {
              background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
              color: "#000"
            },
            children: "Download API Reference"
          }
        )
      ] })
    },
    {
      id: "sdk-integration",
      title: "SDK Integration",
      description: "Software development kit for custom integrations",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(IntegrationInstructions, {}),
      category: "integration",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "SDK Integration Guide" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Complete SDK documentation for building custom integrations, plugins, and extending Dashboard v14 functionality." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CodeSharp, { sx: { mr: 1, verticalAlign: "middle" } }),
              "JavaScript SDK"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Node.js integration",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Browser support",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• TypeScript definitions",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Error handling"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CodeTwoTone, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Python SDK"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Python 3.7+ support",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Async operations",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Data processing",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Automation scripts"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CodeOff, { sx: { mr: 1, verticalAlign: "middle" } }),
              "REST API"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• HTTP/HTTPS support",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• JSON data format",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Webhook integration",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Custom headers"
            ] })
          ] }) }) })
        ] })
      ] })
    }
  ];
  const developmentDocs = [
    {
      id: "architecture",
      title: "System Architecture",
      description: "Technical architecture and system design documentation",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Architecture, {}),
      category: "development",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "System Architecture" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Comprehensive technical documentation covering the system architecture, data flow, and component relationships." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Web, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Frontend Architecture"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• React 18 with TypeScript",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Material-UI components",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• State management (Context + Redux)",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Real-time WebSocket integration"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StorageOutlined, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Backend Architecture"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Node.js with Express",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• PostgreSQL database",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Prisma ORM",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• JWT authentication"
            ] })
          ] }) }) })
        ] })
      ] })
    },
    {
      id: "deployment",
      title: "Deployment Guide",
      description: "Production deployment and configuration instructions",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}),
      category: "development",
      content: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Deployment Guide" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Complete deployment instructions for production environments, including Docker containers, environment configuration, and monitoring setup." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Build, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Docker Deployment"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Multi-container setup",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Environment variables",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Volume management",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Health checks"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CloudQueue, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Cloud Deployment"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• AWS/Azure/GCP support",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Load balancing",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Auto-scaling",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• SSL/TLS configuration"
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Speed, { sx: { mr: 1, verticalAlign: "middle" } }),
              "Performance"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "• Database optimization",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Caching strategies",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• CDN integration",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Monitoring setup"
            ] })
          ] }) }) })
        ] })
      ] })
    }
  ];
  const TabPanel = ({ children, value, index }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { role: "tabpanel", hidden: value !== index, sx: { paddingTop: 2.5 }, children: value === index && children });
  const location = useLocation();
  const inDashboard = location.pathname.startsWith("/dashboard");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", backgroundColor: "background.default" }, children: [
    !inDashboard && /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { pt: inDashboard ? { xs: 2, md: 4 } : { xs: 12, md: 16 }, pb: inDashboard ? { xs: 2, md: 4 } : { xs: 4, md: 8 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)", borderRadius: 2, p: { xs: 2, md: 4 } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Documentation Center" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Comprehensive guides and resources for Dashboard v14" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Alert,
        {
          severity: "info",
          sx: {
            mb: 4,
            background: "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
            border: "1px solid rgba(33, 150, 243, 0.2)",
            cursor: "pointer"
          },
          onClick: () => {
            setSelectedTab(0);
            setExpandedSection("sessions");
            enqueueSnackbar("Navigated to Session Management guide", { variant: "info" });
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Getting Started?" }),
            " Start with the Core Features section to understand the fundamental capabilities of Dashboard v14, then explore Advanced Features for specialized workflows and integrations. ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Click here to jump to Session Management!" })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { mb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        {
          value: selectedTab,
          onChange: handleTabChange,
          variant: "scrollable",
          scrollButtons: "auto",
          sx: {
            "& .MuiTab-root": {
              minWidth: "auto",
              px: 3
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Core Features", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Advanced Features", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoAwesome, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Integration", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Api, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Development", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, {}) })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: coreFeatures.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Accordion,
        {
          expanded: expandedSection === section.id,
          onChange: handleSectionChange(section.id),
          sx: {
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AccordionSummary,
              {
                expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}),
                onClick: () => {
                  if (expandedSection === section.id) {
                    enqueueSnackbar(`Collapsed ${section.title}`, { variant: "info" });
                  } else {
                    enqueueSnackbar(`Expanded ${section.title}`, { variant: "info" });
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", width: "100%" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mr: 2, color: "primary.main" }, children: section.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: section.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: section.description })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: "Core",
                      size: "small",
                      color: "primary",
                      variant: "outlined"
                    }
                  )
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { children: section.content })
          ]
        }
      ) }, section.id)) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: advancedFeatures.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Accordion,
        {
          expanded: expandedSection === section.id,
          onChange: handleSectionChange(section.id),
          sx: {
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionSummary, { expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", width: "100%" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mr: 2, color: "secondary.main" }, children: section.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: section.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: section.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: "Advanced",
                  size: "small",
                  color: "secondary",
                  variant: "outlined"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { children: section.content })
          ]
        }
      ) }, section.id)) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: integrationDocs.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Accordion,
        {
          expanded: expandedSection === section.id,
          onChange: handleSectionChange(section.id),
          sx: {
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionSummary, { expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", width: "100%" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mr: 2, color: "info.main" }, children: section.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: section.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: section.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: "Integration",
                  size: "small",
                  color: "info",
                  variant: "outlined"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { children: section.content })
          ]
        }
      ) }, section.id)) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: developmentDocs.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Accordion,
        {
          expanded: expandedSection === section.id,
          onChange: handleSectionChange(section.id),
          sx: {
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionSummary, { expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", width: "100%" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mr: 2, color: "warning.main" }, children: section.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: section.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: section.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: "Development",
                  size: "small",
                  color: "warning",
                  variant: "outlined"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { children: section.content })
          ]
        }
      ) }, section.id)) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          sx: {
            p: 3,
            mt: 4,
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 2 }, children: "Quick Actions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  fullWidth: true,
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(School, {}),
                  onClick: () => handleDownload("Getting Started Guide"),
                  children: "Getting Started"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  fullWidth: true,
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(BugReport, {}),
                  onClick: () => handleDownload("Troubleshooting Guide"),
                  children: "Troubleshooting"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  fullWidth: true,
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(GroupWork, {}),
                  onClick: () => handleDownload("Team Collaboration Guide"),
                  children: "Team Guide"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  fullWidth: true,
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, {}),
                  onClick: () => handleDownload("Configuration Guide"),
                  children: "Configuration"
                }
              ) })
            ] })
          ]
        }
      ) })
    ] }) }),
    !inDashboard && /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  DocumentationPage as default
};
