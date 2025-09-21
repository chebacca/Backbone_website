import { j as jsxRuntimeExports, B as Box, t as Card, w as CardContent, r as Chip, T as Typography, aC as Tooltip, aD as InfoOutlined, q as ArrowForward } from "./mui-Cc0LuBKd.js";
import { b as React } from "./vendor-Cu2L4Rr-.js";
const MetricCard = ({
  title,
  value,
  icon,
  trend,
  color = "primary",
  onClick,
  showArrow = true,
  tooltip
}) => {
  const getGradientBackground = (colorProp) => {
    switch (colorProp) {
      case "success":
        return "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)";
      case "warning":
        return "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)";
      case "secondary":
        return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
      case "error":
        return "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)";
      case "primary":
      default:
        return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  };
  const getHoverShadow = (colorProp) => {
    switch (colorProp) {
      case "success":
        return "0 8px 25px rgba(17, 153, 142, 0.3)";
      case "warning":
        return "0 8px 25px rgba(252, 74, 26, 0.3)";
      case "secondary":
        return "0 8px 25px rgba(79, 172, 254, 0.3)";
      case "error":
        return "0 8px 25px rgba(255, 65, 108, 0.3)";
      case "primary":
      default:
        return "0 8px 25px rgba(102, 126, 234, 0.3)";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      onClick,
      sx: {
        background: getGradientBackground(color),
        color: "white",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: onClick ? "translateY(-4px)" : "translateY(-2px)",
          boxShadow: onClick ? getHoverShadow(color) : "0 8px 32px rgba(0,0,0,0.3)"
        }
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: React.cloneElement(icon, {
            sx: { fontSize: 24, color: "white" }
          }) }),
          trend && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: `${trend.direction === "up" ? "+" : "-"}${trend.value}%`,
              size: "small",
              sx: {
                fontWeight: 600,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                "& .MuiChip-label": {
                  color: "white"
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1, color: "white" }, children: value }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.9, color: "white" }, children: title }),
            tooltip && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: tooltip, arrow: true, placement: "top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoOutlined, { sx: { fontSize: 16, ml: 0.5, opacity: 0.7, color: "white" } }) })
          ] }),
          onClick && showArrow && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ArrowForward,
            {
              sx: {
                fontSize: 16,
                opacity: 0.6,
                color: "white",
                transition: "all 0.2s ease",
                "&:hover": { opacity: 1, transform: "translateX(2px)" }
              }
            }
          )
        ] })
      ] })
    }
  ) });
};
export {
  MetricCard as M
};
