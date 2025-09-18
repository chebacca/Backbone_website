import { j as jsxRuntimeExports, B as Box, b as Container, T as Typography, b3 as SearchIcon, S as Stack, a as Button, bA as Home, A as ArrowBack } from "./mui-DBh4ciAv.js";
import { u as useNavigate } from "./vendor-Cu2L4Rr-.js";
const NotFoundPage = () => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)", backgroundSize: "50px 50px", opacity: 0.5 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "md", sx: { textAlign: "center", position: "relative", zIndex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h1",
            sx: {
              fontSize: { xs: "8rem", md: "12rem" },
              fontWeight: 900,
              background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 0.8,
              mb: 2
            },
            children: "404"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 100, height: 100, borderRadius: "50%", backgroundColor: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, { sx: { fontSize: 50, color: "primary.main" } }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h3",
            sx: {
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 600,
              mb: 2,
              color: "text.primary"
            },
            children: "Page Not Found"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "h6",
            color: "text.secondary",
            sx: {
              mb: 4,
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6
            },
            children: "Oops! The page you're looking for seems to have wandered off into the digital void. Don't worry, even the best explorers sometimes take a wrong turn."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 3, border: "1px solid rgba(255, 255, 255, 0.1)", mb: 4, maxWidth: 500, mx: "auto" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "What might have happened?" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { textAlign: "left" }, children: [
            "• The page may have been moved or deleted",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "• You might have typed the URL incorrectly",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "• The link you followed may be broken",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "• You may not have permission to access this page"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Stack,
          {
            direction: { xs: "column", sm: "row" },
            spacing: 2,
            justifyContent: "center",
            sx: { mb: 4 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  size: "large",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Home, {}),
                  onClick: () => navigate("/"),
                  sx: {
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                    color: "#000",
                    "&:hover": {
                      background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)",
                      transform: "translateY(-2px)"
                    }
                  },
                  children: "Go Home"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  size: "large",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
                  onClick: () => window.history.back(),
                  sx: {
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "white",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "rgba(0, 212, 255, 0.1)"
                    }
                  },
                  children: "Go Back"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Or try these popular pages:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Stack,
            {
              direction: { xs: "column", sm: "row" },
              spacing: 2,
              justifyContent: "center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "text",
                    onClick: () => navigate("/pricing"),
                    sx: { color: "primary.main" },
                    children: "Pricing"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "text",
                    onClick: () => navigate("/login"),
                    sx: { color: "primary.main" },
                    children: "Sign In"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "text",
                    onClick: () => navigate("/register"),
                    sx: { color: "primary.main" },
                    children: "Get Started"
                  }
                )
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
export {
  NotFoundPage as default
};
