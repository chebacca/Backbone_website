import { j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, a as Button } from "./mui-C-OPHTyf.js";
import { u as useNavigate, r as reactExports } from "./vendor-Cu2L4Rr-.js";
const BridgeAuthPage = () => {
  const navigate = useNavigate();
  const [posted, setPosted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isBridge = params.get("bridge") === "1";
    const accessToken = localStorage.getItem("auth_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const userStr = localStorage.getItem("auth_user");
    if (!accessToken || !userStr) {
      if (isBridge) {
        navigate("/login?bridge=1", { replace: true });
        return;
      }
    }
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      if (window.opener && isBridge) {
        window.opener.postMessage(
          { type: "BACKBONE_AUTH", payload: { user, tokens: { accessToken, refreshToken } } },
          "*"
        );
        setPosted(true);
        window.close();
      }
    } catch (e) {
    }
  }, [navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: posted ? "Sent credentials to the application. You can close this window." : "Preparing authentication bridge..." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate("/login?bridge=1"), variant: "outlined", children: "Go to Login" })
  ] });
};
export {
  BridgeAuthPage as default
};
