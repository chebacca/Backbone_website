import { j as jsxRuntimeExports, B as Box, b as Container, G as Grid, T as Typography, S as Stack, E as EmailIcon, bk as Phone, af as LocationOn, g as IconButton, k as Link, D as Divider, bo as GitHub, bp as Twitter, bq as LinkedIn } from "./mui-BoeRORKC.js";
import { u as useNavigate } from "./vendor-Cu2L4Rr-.js";
const Footer = () => {
  const navigate = useNavigate();
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", path: "/#features" },
        { label: "Pricing", path: "/pricing" },
        { label: "Enterprise", path: "/enterprise" },
        { label: "Documentation", path: "/documentation" },
        { label: "API Reference", path: "/documentation" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/about" },
        { label: "Careers", path: "/careers" },
        { label: "Blog", path: "/blog" },
        { label: "Press", path: "/press" },
        { label: "Partners", path: "/partners" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", path: "/support" },
        { label: "Contact Us", path: "/support" },
        { label: "System Status", path: "/status" },
        { label: "Security", path: "/security" },
        { label: "Training", path: "/training" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Terms of Service", path: "/terms" },
        { label: "Cookie Policy", path: "/cookies" },
        { label: "GDPR", path: "/gdpr" },
        { label: "Compliance", path: "/compliance" }
      ]
    }
  ];
  const socialLinks = [
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GitHub, {}),
      label: "GitHub",
      url: "https://github.com/backbonelogic"
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, {}),
      label: "Twitter",
      url: "https://twitter.com/backbonelogic"
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkedIn, {}),
      label: "LinkedIn",
      url: "https://linkedin.com/company/backbonelogic"
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "footer", sx: { backgroundColor: "background.paper", borderTop: "1px solid rgba(255, 255, 255, 0.1)", pt: { xs: 6, md: 8 }, pb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Box,
          {
            sx: { display: "flex", alignItems: "center", mb: 3, cursor: "pointer" },
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
                    background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  },
                  children: "BackboneLogic, Inc."
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "body2",
            color: "text.secondary",
            sx: { mb: 3, lineHeight: 1.6 },
            children: "The complete professional platform for video production management, collaboration, and delivery. Empowering creators worldwide to build better content faster."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 1, sx: { mb: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, { sx: { fontSize: 16, color: "text.secondary" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "support@backbonelogic.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { sx: { fontSize: 16, color: "text.secondary" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "+1 (555) 123-4567" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LocationOn, { sx: { fontSize: 16, color: "text.secondary" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "San Francisco, CA" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 1 }, children: socialLinks.map((social) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          IconButton,
          {
            component: "a",
            href: social.url,
            target: "_blank",
            rel: "noopener noreferrer",
            sx: {
              color: "text.secondary",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              "&:hover": {
                color: "primary.main",
                borderColor: "primary.main",
                backgroundColor: "rgba(0, 212, 255, 0.1)"
              }
            },
            "aria-label": social.label,
            children: social.icon
          },
          social.label
        )) })
      ] }) }),
      footerSections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, md: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h6",
            sx: {
              fontSize: "1rem",
              fontWeight: 600,
              mb: 2,
              color: "text.primary"
            },
            children: section.title
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { spacing: 1, children: section.links.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            component: "button",
            variant: "body2",
            onClick: () => {
              if (link.path.startsWith("#") || link.path.startsWith("http")) {
                return;
              }
              navigate(link.path);
            },
            sx: {
              color: "text.secondary",
              textDecoration: "none",
              textAlign: "left",
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 0,
              "&:hover": {
                color: "primary.main"
              }
            },
            children: link.label
          },
          link.label
        )) })
      ] }, section.title))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 4, borderColor: "rgba(255, 255, 255, 0.1)" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
        "© ",
        currentYear,
        " BackboneLogic, Inc. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 3 }, alignItems: { xs: "flex-start", sm: "center" } }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "🔒 SOC 2 Type II Certified" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "🌍 GDPR Compliant" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "⚡ 99.9% Uptime SLA" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 3, pt: 2, borderTop: "1px solid rgba(255, 255, 255, 0.05)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Typography,
      {
        variant: "caption",
        color: "text.secondary",
        sx: { display: "block", textAlign: "center", lineHeight: 1.5 },
        children: "BackboneLogic, Inc. is a registered trademark. This website uses cookies to ensure you get the best experience. By continuing to use this site, you accept our use of cookies and agree to our Privacy Policy and Terms of Service."
      }
    ) })
  ] }) });
};
export {
  Footer as F
};
