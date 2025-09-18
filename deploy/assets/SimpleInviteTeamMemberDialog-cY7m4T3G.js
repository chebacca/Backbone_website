const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/firebase-CrF5P1Ck.js","assets/index-DXvUaEvN.js","assets/mui-DBh4ciAv.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-iYh_bQi1.js","assets/index-COak77tQ.css","assets/index.esm-zVCMB3Cx.js","assets/index.esm-CjtNHFZy.js","assets/index.esm-BMygn4u3.js"])))=>i.map(i=>d[i]);
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
import { _ as __vitePreload } from "./index-DXvUaEvN.js";
import { j as jsxRuntimeExports, at as Dialog, au as DialogTitle, B as Box, bB as PersonAddIcon, T as Typography, g as IconButton, bm as Close, av as DialogContent, G as Grid, e as TextField, I as InputAdornment, E as Email, a8 as FormControl, a9 as InputLabel, aa as Select, M as MenuItem, V as VisibilityOff, h as Visibility, a as Button, aw as DialogActions, C as CircularProgress } from "./mui-DBh4ciAv.js";
import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
const SimpleInviteTeamMemberDialog = ({
  open,
  onClose,
  onSuccess,
  currentUser,
  organization,
  availableLicenses = []
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = reactExports.useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "MEMBER",
    department: "",
    position: "",
    phone: "",
    password: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  React.useEffect(() => {
    if (open) {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        role: "MEMBER",
        department: "",
        position: "",
        phone: "",
        password: ""
      });
      setErrors({});
      setLoading(false);
    }
  }, [open]);
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => __spreadProps(__spreadValues({}, prev), { password }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => __async(void 0, null, function* () {
    var _a;
    if (!validateForm()) {
      enqueueSnackbar("Please fix the form errors", { variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const getAuthToken = () => __async(void 0, null, function* () {
        try {
          const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
            const { auth: auth2 } = yield import("./firebase-CrF5P1Ck.js").then((n) => n.f);
            return { auth: auth2 };
          }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
          const user = auth.currentUser;
          if (user) {
            return yield user.getIdToken();
          }
        } catch (error) {
          console.warn("Failed to get Firebase Auth token:", error);
        }
        return localStorage.getItem("authToken") || "placeholder-token";
      });
      const apiBaseUrl = window.location.hostname === "localhost" ? "http://localhost:5001/backbone-logic/us-central1/api" : "https://us-central1-backbone-logic.cloudfunctions.net/api";
      const response = yield fetch(`${apiBaseUrl}/team-members/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${yield getAuthToken()}`
        },
        body: JSON.stringify(__spreadProps(__spreadValues({}, formData), {
          organizationId: (_a = organization == null ? void 0 : organization.organization) == null ? void 0 : _a.id,
          createdBy: currentUser == null ? void 0 : currentUser.id
        }))
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = yield response.json();
      if (result.success) {
        enqueueSnackbar("Team member created successfully!", { variant: "success" });
        onSuccess(result.data);
        onClose();
      } else {
        throw new Error(result.error || "Failed to create team member");
      }
    } catch (error) {
      console.error("Error creating team member:", error);
      enqueueSnackbar("Failed to create team member", { variant: "error" });
    } finally {
      setLoading(false);
    }
  });
  if (!open) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose,
      maxWidth: "sm",
      fullWidth: true,
      PaperProps: {
        sx: { minHeight: "60vh" }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, { color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Invite Team Member" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: onClose, size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Close, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "First Name",
              value: formData.firstName,
              onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { firstName: e.target.value })),
              error: !!errors.firstName,
              helperText: errors.firstName,
              required: true
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Last Name",
              value: formData.lastName,
              onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { lastName: e.target.value })),
              error: !!errors.lastName,
              helperText: errors.lastName,
              required: true
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Email",
              type: "email",
              value: formData.email,
              onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { email: e.target.value })),
              error: !!errors.email,
              helperText: errors.email,
              required: true,
              InputProps: {
                startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Email, {}) })
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: formData.role,
                onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { role: e.target.value })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "MEMBER", children: "Member" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ADMIN", children: "Admin" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "VIEWER", children: "Viewer" })
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Department",
              value: formData.department,
              onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { department: e.target.value }))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Position",
              value: formData.position,
              onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { position: e.target.value }))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Phone",
              value: formData.phone,
              onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { phone: e.target.value }))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Temporary Password",
                type: showPassword ? "text" : "password",
                value: formData.password,
                onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { password: e.target.value })),
                error: !!errors.password,
                helperText: errors.password || "Minimum 8 characters",
                required: true,
                InputProps: {
                  endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      onClick: () => setShowPassword(!showPassword),
                      edge: "end",
                      children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                    }
                  ) })
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                onClick: generatePassword,
                sx: { mt: 1 },
                children: "Generate Secure Password"
              }
            )
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, disabled: loading, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleSubmit,
              variant: "contained",
              disabled: loading,
              startIcon: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, {}),
              children: loading ? "Creating..." : "Create Team Member"
            }
          )
        ] })
      ]
    }
  );
};
export {
  SimpleInviteTeamMemberDialog as S
};
