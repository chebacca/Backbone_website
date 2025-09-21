var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, a as Button } from "./mui-DJqJu8cJ.js";
import { h as useSearchParams, u as useNavigate, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { c as api, e as endpoints } from "./index-DTMyJ3rt.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import "./stripe-BZOVZ1Et.js";
const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = reactExports.useState("pending");
  reactExports.useEffect(() => {
    (() => __async(void 0, null, function* () {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setStatus("error");
          enqueueSnackbar("Missing invitation token", { variant: "error" });
          return;
        }
        yield api.post(endpoints.organizations.acceptInvitation(), { token });
        setStatus("success");
        enqueueSnackbar("Invitation accepted. License assigned.", { variant: "success" });
      } catch (err) {
        setStatus("error");
        enqueueSnackbar((err == null ? void 0 : err.message) || "Failed to accept invitation", { variant: "error" });
      }
    }))();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", minHeight: "60vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }, children: [
    status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Accepting your invitation…" })
    ] }),
    status === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "You’re all set!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Your organization access is active." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: () => navigate("/dashboard/team"), children: "Go to Team" })
    ] }),
    status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "error", sx: { fontWeight: 700 }, children: "Unable to accept invitation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Your token may be invalid or expired." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", onClick: () => navigate("/dashboard/team"), children: "Back to Team" })
    ] })
  ] });
};
export {
  InviteAcceptPage as default
};
