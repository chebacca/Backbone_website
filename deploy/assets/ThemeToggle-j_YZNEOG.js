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
import { j as jsxRuntimeExports, aI as Tooltip, g as IconButton, bw as Brightness4, bx as Brightness7 } from "./mui-DHh4JGm2.js";
import { f as useTheme } from "./index-CwCxFwse.js";
const ThemeToggle = ({
  size = "medium",
  sx = {}
}) => {
  const { mode, toggleTheme } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `Switch to ${mode === "light" ? "dark" : "light"} mode`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    IconButton,
    {
      onClick: toggleTheme,
      color: "inherit",
      size,
      sx: __spreadProps(__spreadValues({}, sx), {
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          transform: "scale(1.05)"
        }
      }),
      "aria-label": `Switch to ${mode === "light" ? "dark" : "light"} mode`,
      children: mode === "light" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Brightness4, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Brightness7, {})
    }
  ) });
};
export {
  ThemeToggle as T
};
