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
import { j as jsxRuntimeExports, B as Box, b as Container, c as Paper, o as ErrorIcon, T as Typography, a as Button, p as CheckCircleIcon, d as Alert, L as Lock, e as TextField, I as InputAdornment, g as IconButton, V as VisibilityOff, h as Visibility, i as LinearProgress, k as Link } from "./mui-DHh4JGm2.js";
import { u as useNavigate, f as useParams, r as reactExports, L as Link$1 } from "./vendor-Cu2L4Rr-.js";
import { u as useForm, C as Controller } from "./index.esm-aV5ahHn5.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { b as authService } from "./index-CwCxFwse.js";
import "./stripe-DrlueFI9.js";
const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [isSuccess, setIsSuccess] = reactExports.useState(false);
  const [isValidToken, setIsValidToken] = reactExports.useState(null);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });
  const password = watch("password");
  reactExports.useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError("Invalid reset link");
      return;
    }
    setIsValidToken(true);
  }, [token]);
  const getPasswordStrength = (password2) => {
    if (!password2) return { score: 0, label: "", color: "error" };
    let score = 0;
    if (password2.length >= 8) score += 25;
    if (/[a-z]/.test(password2)) score += 25;
    if (/[A-Z]/.test(password2)) score += 25;
    if (/[0-9]/.test(password2)) score += 25;
    if (/[^A-Za-z0-9]/.test(password2)) score += 25;
    if (score <= 25) return { score, label: "Weak", color: "error" };
    if (score <= 50) return { score, label: "Fair", color: "warning" };
    if (score <= 75) return { score, label: "Good", color: "info" };
    return { score: Math.min(score, 100), label: "Strong", color: "success" };
  };
  const passwordStrength = getPasswordStrength(password);
  const onSubmit = (data) => __async(void 0, null, function* () {
    if (!token) {
      setError("Invalid reset token");
      return;
    }
    try {
      setError(null);
      yield authService.resetPassword(token, data.password);
      setIsSuccess(true);
      enqueueSnackbar("Password reset successful!", { variant: "success" });
      setTimeout(() => {
        navigate("/login");
      }, 3e3);
    } catch (err) {
      const errorMessage = err.message || "Failed to reset password. Please try again.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  });
  if (isValidToken === false) {
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { sx: { fontSize: 80, color: "error.main", mb: 3 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 2 }, children: "Invalid Reset Link" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 4 }, children: "This password reset link is invalid or has expired. Please request a new one." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: () => navigate("/forgot-password"),
                sx: {
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000"
                },
                children: "Request New Reset Link"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                onClick: () => navigate("/login"),
                children: "Back to Login"
              }
            )
          ] })
        ]
      }
    ) }) }) });
  }
  if (isSuccess) {
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 80, color: "success.main", mb: 3 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 600, mb: 2 }, children: "Password Reset Successful!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 4 }, children: "Your password has been successfully reset. You can now sign in with your new password." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: "Redirecting to login page in 3 seconds..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              onClick: () => navigate("/login"),
              sx: {
                background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                color: "#000"
              },
              children: "Continue to Login"
            }
          )
        ]
      }
    ) }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", py: { xs: 4, md: 0 } }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 80, height: 80, borderRadius: 2, backgroundColor: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { sx: { fontSize: 40, color: "primary.main" } }) }),
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
              children: "Reset Password"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Enter your new password below" })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "form", onSubmit: handleSubmit(onSubmit), children: [
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
                },
                validate: {
                  hasLowerCase: (value) => /[a-z]/.test(value) || "Password must contain a lowercase letter",
                  hasUpperCase: (value) => /[A-Z]/.test(value) || "Password must contain an uppercase letter",
                  hasNumber: (value) => /\d/.test(value) || "Password must contain a number"
                }
              },
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextField,
                    __spreadProps(__spreadValues({}, field), {
                      fullWidth: true,
                      label: "New Password",
                      type: showPassword ? "text" : "password",
                      error: !!errors.password,
                      helperText: (_a = errors.password) == null ? void 0 : _a.message,
                      InputProps: {
                        startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { sx: { color: "text.secondary" } }) }),
                        endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          IconButton,
                          {
                            onClick: () => setShowPassword(!showPassword),
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
                  ),
                  password && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Password strength:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Typography,
                        {
                          variant: "caption",
                          color: `${passwordStrength.color}.main`,
                          sx: { fontWeight: 600 },
                          children: passwordStrength.label
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      LinearProgress,
                      {
                        variant: "determinate",
                        value: passwordStrength.score,
                        color: passwordStrength.color,
                        sx: {
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.1)"
                        }
                      }
                    )
                  ] })
                ] });
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "confirmPassword",
              control,
              rules: {
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match"
              },
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    fullWidth: true,
                    label: "Confirm New Password",
                    type: showConfirmPassword ? "text" : "password",
                    error: !!errors.confirmPassword,
                    helperText: (_a = errors.confirmPassword) == null ? void 0 : _a.message,
                    sx: {
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)"
                      }
                    },
                    InputProps: {
                      startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { sx: { color: "text.secondary" } }) }),
                      endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          onClick: () => setShowConfirmPassword(!showConfirmPassword),
                          edge: "end",
                          sx: { color: "text.secondary" },
                          children: showConfirmPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                        }
                      ) })
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
              children: isSubmitting ? "Resetting Password..." : "Reset Password"
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 2, display: "block" }, children: "🔒 Your new password will be securely encrypted" })
        ] })
      ]
    }
  ) }) }) });
};
export {
  ResetPasswordPage as default
};
