import { j as jsxRuntimeExports, B as Box, b as Container, T as Typography, G as Grid, t as Card, v as CardContent, a as Button, c as Paper, aG as Tabs, aH as Tab, ac as Analytics, as as Download, aI as Description, O as Accordion, Q as AccordionSummary, U as ExpandMoreIcon, W as AccordionDetails, r as Chip, aj as TrendingUp, bi as BarChart, a3 as Assessment, aK as GetApp, a5 as Code, bj as Article, aT as School, aZ as PlayArrow, X as Group, b0 as Message, w as List, x as ListItem, y as ListItemIcon, E as Email, z as ListItemText, bk as Phone, a1 as Schedule, aX as Work, bl as VideoCall, at as Dialog, au as DialogTitle, ae as Avatar, J as Support, g as IconButton, bm as Close, av as DialogContent, aw as DialogActions, bn as Chat } from "./mui-DBh4ciAv.js";
import { e as useLocation, r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { N as Navigation } from "./Navigation-CHsPesl1.js";
import { F as Footer } from "./Footer-omqA04WB.js";
import "./index-B-JKpoL2.js";
import "./stripe-iYh_bQi1.js";
const SupportPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const [expandedFAQ, setExpandedFAQ] = reactExports.useState(false);
  const [chatDialogOpen, setChatDialogOpen] = reactExports.useState(false);
  const getInitialTab = () => {
    const hash = location.hash.replace("#", "");
    switch (hash) {
      case "analytics":
        return 1;
      case "downloads":
        return 2;
      case "documentation":
        return 3;
      default:
        return 0;
    }
  };
  const [selectedTab, setSelectedTab] = reactExports.useState(getInitialTab);
  React.useEffect(() => {
    setSelectedTab(getInitialTab());
  }, [location.hash]);
  const handleTabChange = (_event, newValue) => {
    setSelectedTab(newValue);
    const hashes = ["", "analytics", "downloads", "documentation", "contact"];
    if (hashes[newValue]) {
      window.history.replaceState(null, "", `${location.pathname}#${hashes[newValue]}`);
    } else {
      window.history.replaceState(null, "", location.pathname);
    }
  };
  const handleFAQChange = (faqId) => (_event, isExpanded) => {
    setExpandedFAQ(isExpanded ? faqId : false);
  };
  const handleChatStart = () => {
    setChatDialogOpen(true);
    enqueueSnackbar("Live chat session started", { variant: "info" });
  };
  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Chat, {}),
      action: "Start Chat",
      onClick: handleChatStart,
      color: "primary",
      available: true
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Email, {}),
      action: "Send Email",
      onClick: () => window.open("mailto:support@backbonelogic.com"),
      color: "secondary",
      available: true
    },
    {
      title: "Phone Support",
      description: "Call us for urgent issues",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, {}),
      action: "Call Now",
      onClick: () => window.open("tel:+1-555-0123"),
      color: "success",
      available: true
    },
    {
      title: "Video Call",
      description: "Schedule a screen sharing session",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(VideoCall, {}),
      action: "Schedule",
      onClick: () => window.open("https://calendly.com/backbonelogic/support"),
      color: "info",
      available: true
    }
  ];
  const faqData = [
    {
      id: "faq-1",
      question: "How do I activate my license key?",
      answer: 'To activate your license key, go to the Licenses page in your dashboard and click "Activate License". Enter your license key and the system will automatically validate and activate it for your account.',
      category: "general",
      tags: ["license", "activation", "setup"]
    },
    {
      id: "faq-2",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe.",
      category: "billing",
      tags: ["payment", "billing", "security"]
    },
    {
      id: "faq-3",
      question: "How do I upgrade my subscription?",
      answer: "You can upgrade your subscription at any time from the Billing page in your dashboard. Select your new plan and the changes will be applied immediately with prorated billing.",
      category: "billing",
      tags: ["subscription", "upgrade", "billing"]
    },
    {
      id: "faq-4",
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade security measures including end-to-end encryption, SOC 2 compliance, and regular security audits. Your data is stored in secure, redundant data centers.",
      category: "security",
      tags: ["security", "privacy", "compliance"]
    },
    {
      id: "faq-5",
      question: "How do I integrate the SDK?",
      answer: "Download the SDK from the Downloads page and follow the integration guide in our documentation. We provide SDKs for JavaScript, Python, Java, and C# with comprehensive examples.",
      category: "technical",
      tags: ["sdk", "integration", "development"]
    },
    {
      id: "faq-6",
      question: "What is the uptime guarantee?",
      answer: "We guarantee 99.9% uptime for all paid plans. If we fall below this threshold, you'll receive service credits according to our SLA.",
      category: "general",
      tags: ["uptime", "sla", "reliability"]
    }
  ];
  const TabPanel = ({ children, value, index }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { role: "tabpanel", hidden: value !== index, sx: { paddingTop: 3 }, children: value === index && children });
  const inDashboard = location.pathname.startsWith("/dashboard");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", backgroundColor: "background.default" }, children: [
    !inDashboard && /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { pt: inDashboard ? { xs: 2, md: 4 } : { xs: 12, md: 16 }, pb: inDashboard ? { xs: 2, md: 4 } : { xs: 4, md: 8 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)", borderRadius: 2, p: { xs: 2, md: 4 } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Support Center" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Get help with your BackboneLogic, Inc. platform" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: supportChannels.map((channel, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            height: "100%",
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px rgba(0, 212, 255, 0.2)"
            }
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", p: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, backgroundColor: `${channel.color}.main`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "#000" }, children: channel.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 1, fontWeight: 600 }, children: channel.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: channel.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                fullWidth: true,
                onClick: channel.onClick,
                disabled: !channel.available,
                sx: {
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000"
                },
                children: channel.action
              }
            )
          ] })
        }
      ) }, index)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          sx: {
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Tabs,
              {
                value: selectedTab,
                onChange: handleTabChange,
                variant: "scrollable",
                scrollButtons: "auto",
                sx: {
                  borderBottom: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  "& .MuiTab-root": {
                    color: "text.secondary",
                    "&.Mui-selected": {
                      color: "primary.main"
                    }
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "FAQ" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Usage Analytics", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, {}), iconPosition: "start" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Downloads", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}), iconPosition: "start" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Documentation", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Description, {}), iconPosition: "start" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Contact Info" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3, fontWeight: 600 }, children: "Frequently Asked Questions" }),
              faqData.map((faq) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Accordion,
                {
                  expanded: expandedFAQ === faq.id,
                  onChange: handleFAQChange(faq.id),
                  sx: {
                    mb: 2,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:before": { display: "none" }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionSummary, { expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 500 }, children: faq.question }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionDetails, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: faq.answer }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 1, flexWrap: "wrap" }, children: faq.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          label: tag,
                          size: "small",
                          sx: {
                            backgroundColor: "rgba(0, 212, 255, 0.1)",
                            color: "primary.main"
                          }
                        },
                        tag
                      )) })
                    ] })
                  ]
                },
                faq.id
              ))
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3, fontWeight: 600 }, children: "Usage Analytics & Insights" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      textAlign: "center",
                      p: 2
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, backgroundColor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "#000" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 1 }, children: "License Usage" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Track your license utilization and performance metrics" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", fullWidth: true, children: "View Usage Stats" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      textAlign: "center",
                      p: 2
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, backgroundColor: "secondary.main", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "#000" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 1 }, children: "Performance Reports" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Detailed analytics and performance insights" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", fullWidth: true, children: "Generate Report" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      textAlign: "center",
                      p: 2
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, backgroundColor: "success.main", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "#000" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 1 }, children: "Usage Trends" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Historical usage patterns and forecasting" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", fullWidth: true, children: "View Trends" })
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "Quick Analytics Overview" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      p: 3
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { textAlign: "center" }, children: "Analytics dashboard integration coming soon. Monitor your license usage, API calls, and performance metrics all in one place." })
                  }
                )
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3, fontWeight: 600 }, children: "Downloads & SDK Resources" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(GetApp, { sx: { mr: 2, color: "primary.main" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "JavaScript SDK" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Latest", size: "small", color: "primary", sx: { ml: "auto" } })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Complete JavaScript SDK with TypeScript support and comprehensive examples" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "v2.1.0", size: "small" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "TypeScript", size: "small" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Examples", size: "small" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "contained",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
                          fullWidth: true,
                          sx: {
                            background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                            color: "#000"
                          },
                          children: "Download SDK"
                        }
                      )
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(GetApp, { sx: { mr: 2, color: "secondary.main" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Python SDK" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Beta", size: "small", color: "secondary", sx: { ml: "auto" } })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Python SDK with async support and comprehensive documentation" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "v1.8.2", size: "small" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Async", size: "small" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Docs", size: "small" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
                          fullWidth: true,
                          children: "Download SDK"
                        }
                      )
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { sx: { mr: 2, color: "success.main" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Code Examples" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Ready-to-use code examples and integration templates" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
                          fullWidth: true,
                          children: "View Examples"
                        }
                      )
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Article, { sx: { mr: 2, color: "info.main" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Integration Guides" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Step-by-step integration guides for popular frameworks" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
                          fullWidth: true,
                          children: "Download Guides"
                        }
                      )
                    ] })
                  }
                ) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3, fontWeight: 600 }, children: "Documentation & Resources" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Article, { sx: { mr: 2, color: "primary.main" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "User Guide" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Complete guide to using the BackboneLogic, Inc. platform" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
                          onClick: () => window.open("/documentation"),
                          children: "View Guide"
                        }
                      )
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { sx: { mr: 2, color: "primary.main" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "API Documentation" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Technical documentation for API integration" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
                          onClick: () => window.open("/documentation/api"),
                          children: "View API Docs"
                        }
                      )
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(School, { sx: { mr: 2, color: "primary.main" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Video Tutorials" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Step-by-step video tutorials for common tasks" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, {}),
                          onClick: () => window.open("/tutorials"),
                          children: "Watch Tutorials"
                        }
                      )
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Group, { sx: { mr: 2, color: "primary.main" } }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Community Forum" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Connect with other users and share best practices" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Message, {}),
                          onClick: () => window.open("/community"),
                          children: "Join Forum"
                        }
                      )
                    ] })
                  }
                ) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: selectedTab, index: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 3, fontWeight: 600 }, children: "Contact Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "General Support" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Email, { color: "primary" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ListItemText,
                            {
                              primary: "Email",
                              secondary: "support@backbonelogic.com"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { color: "primary" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ListItemText,
                            {
                              primary: "Phone",
                              secondary: "+1 (555) 012-3456"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, { color: "primary" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ListItemText,
                            {
                              primary: "Hours",
                              secondary: "24/7 Support Available"
                            }
                          )
                        ] })
                      ] })
                    ] })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  {
                    sx: {
                      background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Enterprise Support" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Work, { color: "primary" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ListItemText,
                            {
                              primary: "Dedicated Support",
                              secondary: "Priority support for enterprise customers"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(VideoCall, { color: "primary" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ListItemText,
                            {
                              primary: "Video Sessions",
                              secondary: "Screen sharing and remote assistance"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, { color: "primary" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            ListItemText,
                            {
                              primary: "Account Manager",
                              secondary: "Direct contact with your dedicated manager"
                            }
                          )
                        ] })
                      ] })
                    ] })
                  }
                ) })
              ] })
            ] }) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Dialog,
        {
          open: chatDialogOpen,
          onClose: () => setChatDialogOpen(false),
          maxWidth: "sm",
          fullWidth: true,
          PaperProps: {
            sx: {
              backgroundColor: "background.paper",
              border: "1px solid rgba(0, 212, 255, 0.2)"
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: "primary.main", color: "#000" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Live Chat Support" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Connected to support agent" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setChatDialogOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Close, {}) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { height: 400, p: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, height: "100%", display: "flex", flexDirection: "column" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Chat interface would be integrated here" }) }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { sx: { p: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setChatDialogOpen(false), children: "End Chat" }) })
          ]
        }
      )
    ] }) }),
    !inDashboard && /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  SupportPage as default
};
