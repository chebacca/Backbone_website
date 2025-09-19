const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-B-JKpoL2.js","assets/mui-DBh4ciAv.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-iYh_bQi1.js","assets/index-COak77tQ.css"])))=>i.map(i=>d[i]);
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
import { u as useAuth, a as useLoading, _ as __vitePreload } from "./index-B-JKpoL2.js";
import { j as jsxRuntimeExports, B as Box, b as Container, a as Button, A as ArrowBack, c as Paper, T as Typography, d as Alert, S as Stack, e as TextField, I as InputAdornment, E as Email, g as IconButton, V as VisibilityOff, h as Visibility, L as Lock, k as Link, D as Divider } from "./mui-DBh4ciAv.js";
import { u as useNavigate, r as reactExports, b as React, L as Link$1 } from "./vendor-Cu2L4Rr-.js";
import { u as useForm, C as Controller } from "./index.esm-aV5ahHn5.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import "./stripe-iYh_bQi1.js";
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const { setLoading } = useLoading();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [interimToken, setInterimToken] = reactExports.useState(null);
  const [twoFactorCode, setTwoFactorCode] = reactExports.useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const isBridgeMode = React.useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("bridge") === "1";
    } catch (e) {
      return false;
    }
  }, []);
  const postAuthToOpenerAndClose = React.useCallback((user) => {
    if (!isBridgeMode) return;
    try {
      const accessToken = localStorage.getItem("auth_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const payload = { user, tokens: { accessToken, refreshToken } };
      if (window.opener) {
        window.opener.postMessage({ type: "BACKBONE_AUTH", payload }, "*");
      }
      window.close();
    } catch (e) {
    }
  }, [isBridgeMode]);
  const onSubmit = (data) => __async(void 0, null, function* () {
    var _a, _b;
    try {
      setError(null);
      setLoading(true);
      const user = yield login(data.email, data.password);
      enqueueSnackbar("Welcome back!", { variant: "success" });
      if (isBridgeMode) {
        postAuthToOpenerAndClose(user);
        return;
      }
      const roleUpper = String((user == null ? void 0 : user.role) || "").toUpperCase();
      if (roleUpper === "SUPERADMIN") {
        navigate("/admin");
      } else if (roleUpper === "ACCOUNTING") {
        navigate("/accounting");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (((_a = err == null ? void 0 : err.details) == null ? void 0 : _a.requires2FA) || (err == null ? void 0 : err.requires2FA)) {
        setInterimToken(((_b = err == null ? void 0 : err.details) == null ? void 0 : _b.interimToken) || (err == null ? void 0 : err.interimToken) || null);
      } else {
        const errorMessage = err.message || "Login failed. Please try again.";
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  });
  const handleGoogleCredential = (credential) => __async(void 0, null, function* () {
    try {
      setError(null);
      setLoading(true);
      const user = yield loginWithGoogle(credential);
      enqueueSnackbar("Signed in with Google", { variant: "success" });
      if (isBridgeMode) {
        postAuthToOpenerAndClose(user);
        return;
      }
      const roleUpper = String((user == null ? void 0 : user.role) || "").toUpperCase();
      if (roleUpper === "SUPERADMIN") navigate("/admin");
      else if (roleUpper === "ACCOUNTING") navigate("/accounting");
      else navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.message || "Google sign-in failed.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  });
  const handleAppleIdToken = (idToken) => __async(void 0, null, function* () {
    try {
      setError(null);
      setLoading(true);
      const user = yield loginWithApple(idToken);
      enqueueSnackbar("Signed in with Apple", { variant: "success" });
      if (isBridgeMode) {
        postAuthToOpenerAndClose(user);
        return;
      }
      const roleUpper = String((user == null ? void 0 : user.role) || "").toUpperCase();
      if (roleUpper === "SUPERADMIN") navigate("/admin");
      else if (roleUpper === "ACCOUNTING") navigate("/accounting");
      else navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.message || "Apple sign-in failed.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  });
  reactExports.useEffect(() => {
    const handler = (e) => {
      const detail = e.detail;
      if (detail == null ? void 0 : detail.credential) {
        handleGoogleCredential(detail.credential);
      }
    };
    window.addEventListener("google-credential", handler);
    return () => window.removeEventListener("google-credential", handler);
  }, []);
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", py: { xs: 4, md: 0 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
        onClick: () => navigate("/"),
        sx: {
          color: "rgba(255, 255, 255, 0.7)",
          "&:hover": {
            color: "primary.main",
            backgroundColor: "rgba(0, 212, 255, 0.1)"
          }
        },
        children: "Back to Home"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: 10,
        sx: {
          p: { xs: 4, md: 6 },
          backgroundColor: "background.paper",
          borderRadius: 3,
          border: "1px solid rgba(255, 255, 255, 0.1)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 60, borderRadius: 2, background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h4",
                sx: {
                  fontWeight: 700,
                  color: "#000"
                },
                children: "D"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h4",
                sx: {
                  fontWeight: 600,
                  mb: 2,
                  textAlign: "center"
                },
                children: "Sign in to your BackboneLogic, Inc. account"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Welcome back! Please sign in to continue." })
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
          !interimToken ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", onSubmit: handleSubmit(onSubmit), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "email",
                control,
                rules: {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address"
                  }
                },
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "Email Address",
                      type: "email",
                      autoComplete: "email",
                      error: !!errors.email,
                      helperText: (_a = errors.email) == null ? void 0 : _a.message,
                      InputProps: {
                        startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Email, { sx: { color: "text.secondary" } }) })
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "password",
                control,
                rules: {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                },
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "Password",
                      type: showPassword ? "text" : "password",
                      autoComplete: "current-password",
                      error: !!errors.password,
                      helperText: (_a = errors.password) == null ? void 0 : _a.message,
                      InputProps: {
                        startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { sx: { color: "text.secondary" } }) }),
                        endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          IconButton,
                          {
                            onClick: handleTogglePasswordVisibility,
                            edge: "end",
                            sx: { color: "text.secondary" },
                            children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                          }
                        ) })
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "right" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                component: Link$1,
                to: "/forgot-password",
                variant: "body2",
                sx: {
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline"
                  }
                },
                children: "Forgot your password?"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                fullWidth: true,
                variant: "contained",
                size: "large",
                disabled: isSubmitting,
                sx: {
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000",
                  "&:hover": {
                    background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)"
                  },
                  "&:disabled": {
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.5)"
                  }
                },
                children: isSubmitting ? "Signing In..." : "Sign In"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { flex: 1 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mx: 2, color: "text.secondary" }, children: "or" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { flex: 1 } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, direction: { xs: "column", sm: "row" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  fullWidth: true,
                  variant: "outlined",
                  onClick: () => __async(void 0, null, function* () {
                    var _a, _b;
                    const anyWindow = window;
                    if ((_b = (_a = anyWindow.google) == null ? void 0 : _a.accounts) == null ? void 0 : _b.id) {
                      anyWindow.google.accounts.id.prompt();
                    } else {
                      enqueueSnackbar("Google Sign-In not initialized. Please refresh.", { variant: "warning" });
                    }
                  }),
                  sx: {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "white",
                    borderWidth: 2,
                    fontWeight: 600,
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "rgba(0, 212, 255, 0.1)",
                      boxShadow: "0 4px 12px rgba(0, 212, 255, 0.2)",
                      transform: "translateY(-1px)"
                    }
                  },
                  children: "Continue with Google"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  fullWidth: true,
                  variant: "outlined",
                  onClick: () => __async(void 0, null, function* () {
                    var _a, _b, _c;
                    const anyWindow = window;
                    if ((_b = (_a = anyWindow.AppleID) == null ? void 0 : _a.auth) == null ? void 0 : _b.signIn) {
                      try {
                        const result = yield anyWindow.AppleID.auth.signIn();
                        const idToken = (_c = result == null ? void 0 : result.authorization) == null ? void 0 : _c.id_token;
                        if (idToken) {
                          yield handleAppleIdToken(idToken);
                        } else {
                          enqueueSnackbar("Apple did not return an id_token.", { variant: "warning" });
                        }
                      } catch (e) {
                        enqueueSnackbar((e == null ? void 0 : e.message) || "Apple Sign-In was cancelled or failed.", { variant: "error" });
                      }
                    } else {
                      enqueueSnackbar("Apple Sign-In not initialized. Please refresh.", { variant: "warning" });
                    }
                  }),
                  sx: {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "white",
                    borderWidth: 2,
                    fontWeight: 600,
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "rgba(0, 212, 255, 0.1)",
                      boxShadow: "0 4px 12px rgba(0, 212, 255, 0.2)",
                      transform: "translateY(-1px)"
                    }
                  },
                  children: "Continue with Apple"
                }
              )
            ] })
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: "Enter the 6-digit code from your authenticator app. You can also use a backup code." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Authentication code",
                value: twoFactorCode,
                onChange: (e) => setTwoFactorCode(e.target.value),
                sx: { mb: 2 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: () => __async(void 0, null, function* () {
                  var _a;
                  try {
                    setLoading(true);
                    const { verify2FA } = (yield __vitePreload(() => __async(void 0, null, function* () {
                      const { authService } = yield import("./index-B-JKpoL2.js").then((n) => n.f);
                      return { authService };
                    }), true ? __vite__mapDeps([0,1,2,3,4]) : void 0)).authService;
                    if (!interimToken) return;
                    const result = yield verify2FA(interimToken, twoFactorCode.trim());
                    localStorage.setItem("auth_token", result.token);
                    localStorage.setItem("auth_user", JSON.stringify(result.user));
                    enqueueSnackbar("2FA verified. Welcome back!", { variant: "success" });
                    if (isBridgeMode) {
                      postAuthToOpenerAndClose(result.user);
                      return;
                    }
                    const roleUpper = String(((_a = result.user) == null ? void 0 : _a.role) || "").toUpperCase();
                    if (roleUpper === "SUPERADMIN") {
                      navigate("/admin");
                    } else if (roleUpper === "ACCOUNTING") {
                      navigate("/accounting");
                    } else {
                      navigate("/dashboard");
                    }
                  } catch (e) {
                    enqueueSnackbar(e.message || "Invalid code", { variant: "error" });
                  } finally {
                    setLoading(false);
                  }
                }),
                sx: {
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000",
                  fontWeight: 600,
                  py: 1.5,
                  fontSize: "1rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)",
                    boxShadow: "0 4px 12px rgba(0, 212, 255, 0.3)",
                    transform: "translateY(-1px)"
                  }
                },
                children: "Verify Code"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "OR" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "Don't have an account?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  component: Link$1,
                  to: "/register",
                  sx: {
                    color: "primary.main",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline"
                    }
                  },
                  children: "Create one now"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 2, display: "block" }, children: "🔒 Your data is secure and protected by industry-leading encryption" })
          ] })
        ]
      }
    )
  ] }) }) });
};
export {
  LoginPage as default
};
