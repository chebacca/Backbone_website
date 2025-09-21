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
import { j as jsxRuntimeExports, B as Box, b as Container, c as Paper, n as Send, T as Typography, a as Button, A as ArrowBack, E as EmailIcon, d as Alert, e as TextField, I as InputAdornment, k as Link } from "./mui-DKIosbOx.js";
import { u as useNavigate, r as reactExports, L as Link$1 } from "./vendor-Cu2L4Rr-.js";
import { u as useForm, C as Controller } from "./index.esm-aV5ahHn5.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { b as authService } from "./index-D0VWCs-W.js";
import "./stripe-CqWXfGEZ.js";
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitted, setIsSubmitted] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: ""
    }
  });
  const email = watch("email");
  const onSubmit = (data) => __async(void 0, null, function* () {
    try {
      setError(null);
      yield authService.forgotPassword(data.email);
      setIsSubmitted(true);
      enqueueSnackbar("Password reset email sent!", { variant: "success" });
    } catch (err) {
      const errorMessage = err.message || "Failed to send reset email. Please try again.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  });
  if (isSubmitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", py: { xs: 4, md: 0 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: 10,
        sx: {
          p: { xs: 4, md: 6 },
          backgroundColor: "background.paper",
          borderRadius: 3,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 80, height: 80, borderRadius: 2, backgroundColor: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { sx: { fontSize: 40, color: "primary.main" } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 2 }, children: "Check Your Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 2 }, children: "We've sent a password reset link to:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 600, mb: 4, color: "primary.main" }, children: email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 4 }, children: "Click the link in your email to reset your password. The link will expire in 1 hour for security." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: () => navigate("/login"),
                sx: {
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000"
                },
                children: "Back to Login"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "text",
                onClick: () => setIsSubmitted(false),
                sx: { color: "text.secondary" },
                children: "Try a different email"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4, p: 2, backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Didn't receive the email?" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
              "• Check your spam/junk folder",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Make sure the email address is correct",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Wait a few minutes and try again"
            ] })
          ] })
        ]
      }
    ) }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", py: { xs: 4, md: 0 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
        onClick: () => navigate("/login"),
        sx: {
          color: "rgba(255, 255, 255, 0.7)",
          "&:hover": {
            color: "primary.main",
            backgroundColor: "rgba(0, 212, 255, 0.1)"
          }
        },
        children: "Back to Login"
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 80, height: 80, borderRadius: 2, backgroundColor: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, { sx: { fontSize: 40, color: "primary.main" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h4",
                sx: {
                  fontWeight: 600,
                  mb: 1,
                  background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                },
                children: "Forgot Password?"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "No worries! Enter your email and we'll send you a reset link." })
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "form", onSubmit: handleSubmit(onSubmit), children: [
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
                      error: !!errors.email,
                      helperText: (_a = errors.email) == null ? void 0 : _a.message,
                      sx: {
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }
                      },
                      InputProps: {
                        startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, { sx: { color: "text.secondary" } }) })
                      }
                    })
                  );
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                fullWidth: true,
                variant: "contained",
                size: "large",
                disabled: isSubmitting,
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, {}),
                sx: {
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000",
                  mb: 3,
                  "&:hover": {
                    background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)"
                  },
                  "&:disabled": {
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.5)"
                  }
                },
                children: isSubmitting ? "Sending Reset Link..." : "Send Reset Link"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "Remember your password?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  component: Link$1,
                  to: "/login",
                  sx: {
                    color: "primary.main",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline"
                    }
                  },
                  children: "Sign in here"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 2, display: "block" }, children: "🔒 Reset links expire after 1 hour for your security" })
          ] })
        ]
      }
    )
  ] }) }) });
};
export {
  ForgotPasswordPage as default
};
