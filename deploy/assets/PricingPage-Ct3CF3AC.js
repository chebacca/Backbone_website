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
import { j as jsxRuntimeExports, B as Box, b as Container, T as Typography, c as Paper, F as FormControlLabel, r as Chip, s as Switch, G as Grid, t as Card, u as Star, v as CardContent, a as Button, w as List, x as ListItem, y as ListItemIcon, m as CheckIcon, z as ListItemText, H as Security, J as Support, K as CloudIcon, N as Hub, O as Accordion, Q as AccordionSummary, U as ExpandMoreIcon, W as AccordionDetails, f as PersonIcon, X as Group, Y as Business } from "./mui-CLBPY2Ik.js";
import { u as useNavigate, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { N as Navigation } from "./Navigation-Db8sEms6.js";
import { F as Footer } from "./Footer-DrNBa4Wg.js";
import { u as useAuth } from "./index-B_pg_yIa.js";
import "./ThemeToggle-B1Dggj3f.js";
import "./stripe-B5XG1UK0.js";
const fadeInUpAnimation = {
  opacity: 0,
  transform: "translateY(60px)",
  animation: "fadeInUp 0.6s ease-out forwards"
};
const staggerAnimation = {
  animation: "staggerFadeIn 0.6s ease-out forwards"
};
const PricingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const [isYearly, setIsYearly] = reactExports.useState(false);
  const pricingTiers = [
    {
      id: "BASIC",
      name: "Basic",
      description: "Perfect for individual creators and freelancers",
      price: 29,
      yearlyPrice: 290,
      // 2 months free
      features: [
        "Single user license",
        "Core session management",
        "Basic workflow tools",
        "Local file storage (50GB)",
        "Standard support",
        "Desktop application access",
        "Basic reporting",
        "Project templates",
        "Video collaboration tools",
        "Client review system"
      ],
      limitations: [
        "Limited to 1 user",
        "Basic integrations only",
        "Standard support response time"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outlined",
      maxSeats: 1,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {})
    },
    {
      id: "PRO",
      name: "Pro",
      description: "Ideal for growing production teams",
      price: 99,
      yearlyPrice: 990,
      // 2 months free
      popular: true,
      features: [
        "Up to 50 user licenses",
        "Advanced workflow automation",
        "AI Brain system access",
        "Real-time team coordination",
        "Cloud storage (500GB)",
        "Advanced analytics & reporting",
        "Priority support",
        "Custom role assignments",
        "Timecard & approval system",
        "Advanced project management",
        "Client portal access",
        "API access",
        "Third-party integrations",
        "Advanced security features",
        "Backup & recovery"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "contained",
      maxSeats: 50,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {})
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise",
      description: "For large organizations and studios",
      price: null,
      enterprise: true,
      features: [
        "Unlimited seats with bulk licensing",
        "Dedicated account management",
        "Custom integrations & API access",
        "Advanced security & compliance",
        "White-label options",
        "On-premise deployment",
        "24/7 premium support",
        "Custom training & onboarding",
        "Advanced audit logging",
        "SSO integration",
        "Custom workflows",
        "Advanced analytics",
        "Data residency options",
        "Custom SLA agreements",
        "Dedicated infrastructure"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outlined",
      maxSeats: null,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {})
    }
  ];
  const faqs = [
    {
      question: "What is included in the free trial?",
      answer: "The 14-day free trial includes full access to all features of your chosen plan, unlimited projects, and standard support. No credit card required to start."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly."
    },
    {
      question: "How does seat-based pricing work?",
      answer: "Each seat represents one user who can access the platform. You can add or remove seats as your team grows or shrinks, and billing adjusts automatically."
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees for Basic and Pro plans. Enterprise customers may have custom setup fees depending on their requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, ACH transfers (for Enterprise), and can accommodate custom billing arrangements for large organizations."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. Your access continues until the end of your current billing period."
    },
    {
      question: "Do you offer volume discounts?",
      answer: "Yes, we offer volume discounts for teams with 25+ seats. Enterprise customers receive custom pricing based on their specific needs."
    },
    {
      question: "Is data migration included?",
      answer: "We provide migration assistance for Pro and Enterprise customers to help you transition from your existing tools seamlessly."
    }
  ];
  const handleGetStarted = (tier) => {
    if (!isAuthenticated) {
      navigate("/register", { state: { selectedTier: tier.id } });
      return;
    }
    if (tier.enterprise) {
      window.open("mailto:sales@backbonelogic.com?subject=Enterprise%20Inquiry", "_blank");
      return;
    }
    navigate("/checkout", { state: { tier: tier.id, isYearly } });
  };
  const getPrice = (tier) => {
    if (tier.price === null) return null;
    return isYearly && tier.yearlyPrice ? tier.yearlyPrice : tier.price;
  };
  const getSavings = (tier) => {
    if (!tier.yearlyPrice || !tier.price) return 0;
    const monthlyCost = tier.price * 12;
    const savings = monthlyCost - tier.yearlyPrice;
    return Math.round(savings / monthlyCost * 100);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { backgroundColor: "background.default", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
      background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #667eea 100%)",
      pt: { xs: 12, md: 16 },
      pb: { xs: 6, md: 8 },
      position: "relative"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: __spreadProps(__spreadValues({}, staggerAnimation), { "@keyframes fadeInUp": { "0%": { opacity: 0, transform: "translateY(60px)" }, "100%": { opacity: 1, transform: "translateY(0)" } }, "@keyframes staggerFadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } } }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", sx: { mb: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h1",
          sx: {
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            fontWeight: 700,
            mb: 2,
            background: theme.palette.mode === "dark" ? "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #00d4ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          },
          children: "Choose Your Plan"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h5",
          color: "text.secondary",
          sx: { mb: 4, maxWidth: 600, mx: "auto" },
          children: "Start with a 14-day free trial. No credit card required. Upgrade or downgrade at any time."
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Paper,
        {
          elevation: 2,
          sx: {
            display: "inline-flex",
            p: 0.5,
            backgroundColor: "background.paper",
            borderRadius: 4
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: isYearly,
                  onChange: (e) => setIsYearly(e.target.checked),
                  color: "primary"
                }
              ),
              label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Annual billing" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: "Save 17%",
                    size: "small",
                    color: "primary",
                    variant: "outlined"
                  }
                )
              ] }),
              sx: { m: 1 }
            }
          )
        }
      ) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { py: { xs: 6, md: 8 }, mt: -4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: __spreadProps(__spreadValues({}, staggerAnimation), { animationDelay: "0.1s" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 4, justifyContent: "center", children: pricingTiers.map((tier) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        sx: {
          height: "100%",
          position: "relative",
          backgroundColor: tier.popular ? "primary.dark" : "background.paper",
          border: tier.popular ? "2px solid" : "1px solid rgba(255, 255, 255, 0.1)",
          borderColor: tier.popular ? "primary.main" : void 0,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: tier.popular ? "0 20px 40px rgba(0, 212, 255, 0.3)" : "0 20px 40px rgba(0, 0, 0, 0.3)"
          }
        },
        children: [
          tier.popular && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}),
              label: "Most Popular",
              color: "primary",
              sx: {
                fontWeight: 600,
                color: "#000"
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 4, height: "100%", display: "flex", flexDirection: "column" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, backgroundColor: tier.popular ? "rgba(0, 212, 255, 0.2)" : "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2, color: "primary.main" }, children: tier.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 1 }, children: tier.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: tier.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 2 }, children: tier.price === null ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: "Custom" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "baseline", justifyContent: "center", gap: 0.5 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h3", sx: { fontWeight: 700 }, children: [
                    "$",
                    getPrice(tier)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: isYearly ? "/year" : "/month" })
                ] }),
                isYearly && getSavings(tier) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "success.main", sx: { mt: 0.5 }, children: [
                  "Save ",
                  getSavings(tier),
                  "% annually"
                ] })
              ] }) }),
              tier.maxSeats && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Up to ",
                tier.maxSeats,
                " ",
                tier.maxSeats === 1 ? "user" : "users"
              ] }),
              tier.maxSeats === null && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Unlimited users" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: tier.buttonVariant,
                size: "large",
                fullWidth: true,
                onClick: () => handleGetStarted(tier),
                sx: __spreadValues({
                  mb: 4,
                  py: 1.5,
                  fontWeight: 600
                }, tier.buttonVariant === "contained" && {
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000",
                  "&:hover": {
                    background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)"
                  }
                }),
                children: tier.buttonText
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { mb: 2, fontWeight: 600 }, children: "Everything included:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, sx: { p: 0 }, children: tier.features.map((feature, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0, py: 0.5 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CheckIcon,
                  {
                    sx: {
                      fontSize: 16,
                      color: "success.main"
                    }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: feature,
                    primaryTypographyProps: {
                      variant: "body2",
                      sx: { fontSize: "0.875rem" }
                    }
                  }
                )
              ] }, index)) })
            ] })
          ] })
        ]
      }
    ) }) }, tier.id)) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { backgroundColor: "background.paper", py: { xs: 6, md: 8 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: __spreadProps(__spreadValues({}, staggerAnimation), { animationDelay: "0.2s" }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", sx: { mb: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h2",
            sx: {
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 600,
              mb: 2
            },
            children: "Why Choose BackboneLogic, Inc.?"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h6",
            color: "text.secondary",
            sx: { mb: 4, maxWidth: 600, mx: "auto" },
            children: "Join thousands of professionals who trust BackboneLogic, Inc."
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 4, children: [
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
          title: "Enterprise Security",
          description: "SOC 2 Type II certified with advanced encryption, RBAC, and audit trails."
        },
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Support, {}),
          title: "24/7 Expert Support",
          description: "Industry experts available around the clock to help you succeed."
        },
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}),
          title: "Cloud & On-Premise",
          description: "Deploy in the cloud or on your own infrastructure for maximum control."
        },
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Hub, {}),
          title: "Seamless Integrations",
          description: "Connect with your existing tools and workflows effortlessly."
        }
      ].map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 3, p: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, backgroundColor: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "primary.main", flexShrink: 0 }, children: item.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 1 }, children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: item.description })
        ] })
      ] }) }) }, index)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "lg", sx: { py: { xs: 6, md: 8 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: __spreadProps(__spreadValues({}, staggerAnimation), { animationDelay: "0.3s" }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { textAlign: "center", sx: { mb: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: { fontWeight: 600, mb: 2 }, children: "Frequently Asked Questions" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { maxWidth: 800, mx: "auto" }, children: faqs.map((faq, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: fadeInUpAnimation, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Accordion,
        {
          sx: {
            backgroundColor: "background.paper",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            mb: 1,
            "&:before": { display: "none" }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionSummary, { expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: faq.question }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: faq.answer }) })
          ]
        }
      ) }, index)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { backgroundColor: "background.paper", py: { xs: 6, md: 8 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: __spreadProps(__spreadValues({}, fadeInUpAnimation), { animationDelay: "0.4s" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 2 }, children: "Ready to Get Started?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", sx: { mb: 4 }, children: "Join thousands of professionals who trust BackboneLogic, Inc." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          size: "large",
          onClick: () => navigate(isAuthenticated ? "/checkout" : "/register"),
          sx: {
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
            color: "#000"
          },
          children: "Start Your Free Trial"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 2 }, children: "No credit card required • 14-day free trial • Cancel anytime" })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  PricingPage as default
};
