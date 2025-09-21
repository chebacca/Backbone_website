import { j as jsxRuntimeExports, B as Box, b as Container, T as Typography, D as Divider } from "./mui-BbtiZaA3.js";
import { N as Navigation } from "./Navigation-h8q50VLr.js";
import { F as Footer } from "./Footer-05O2RJ_T.js";
import "./vendor-Cu2L4Rr-.js";
import "./index-CEXEfs7Z.js";
import "./stripe-rmDQXWB-.js";
const SLA_VERSION = "1.0";
const SLA_EFFECTIVE_DATE = "2025-08-10";
const SlaPage = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", backgroundColor: "background.default" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { pt: 12, pb: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: 800, gutterBottom: true, children: "Service Level Agreement" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
        "Version ",
        SLA_VERSION,
        " — Effective ",
        SLA_EFFECTIVE_DATE
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 3 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, sx: { mt: 2, mb: 1 }, children: "Uptime Target" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { mb: 2 }, children: "We target 99.9% monthly uptime for production Services, excluding scheduled maintenance and events outside of our reasonable control." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, sx: { mt: 2, mb: 1 }, children: "Support" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { mb: 2 }, children: "Support hours and response targets may vary by plan. Priority and Enterprise plans include accelerated response times." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 700, sx: { mt: 2, mb: 1 }, children: "Remedies" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { mb: 6 }, children: "If uptime falls below target, you may be eligible for service credits as your sole and exclusive remedy, subject to the Terms." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
};
export {
  SlaPage as default
};
