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
import { j as jsxRuntimeExports, B as Box, b as Container, c as Paper, T as Typography, d as Alert, E as EmailIcon, S as Stack, a as Button, R as RefreshIcon, o as ErrorIcon, p as CheckCircleIcon, q as ArrowForward, C as CircularProgress } from "./mui-BbtiZaA3.js";
import { u as useNavigate, f as useParams, e as useLocation, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth, a as useLoading, b as authService } from "./index-Dd1DWJhm.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import "./stripe-rmDQXWB-.js";
const EmailVerificationPage = () => {
  var _a;
  const navigate = useNavigate();
  const { token } = useParams();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const { setLoading } = useLoading();
  const { enqueueSnackbar } = useSnackbar();
  const [verificationStatus, setVerificationStatus] = reactExports.useState("pending");
  const [error, setError] = reactExports.useState(null);
  const [isResending, setIsResending] = reactExports.useState(false);
  const selectedTier = (_a = location.state) == null ? void 0 : _a.selectedTier;
  reactExports.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = urlParams.get("token");
    const effectiveToken = token || tokenFromQuery || "";
    if (effectiveToken) {
      verifyEmailToken(effectiveToken);
    }
  }, [token]);
  const verifyEmailToken = (verificationToken) => __async(void 0, null, function* () {
    try {
      setVerificationStatus("verifying");
      setError(null);
      yield authService.verifyEmail(verificationToken);
      yield refreshUser();
      setVerificationStatus("success");
      enqueueSnackbar("Email verified successfully!", { variant: "success" });
      setTimeout(() => {
        if (selectedTier) {
          navigate("/checkout", { state: { tier: selectedTier } });
        } else {
          navigate("/dashboard");
        }
      }, 3e3);
    } catch (err) {
      setVerificationStatus("error");
      setError(err.message || "Email verification failed");
      enqueueSnackbar(err.message || "Email verification failed", { variant: "error" });
    }
  });
  const resendVerification = () => __async(void 0, null, function* () {
    try {
      setIsResending(true);
      setError(null);
      yield authService.resendVerification();
      enqueueSnackbar("Verification email sent! Please check your inbox.", { variant: "success" });
    } catch (err) {
      setError(err.message || "Failed to resend verification email");
      enqueueSnackbar(err.message || "Failed to resend verification email", { variant: "error" });
    } finally {
      setIsResending(false);
    }
  });
  const handleContinue = () => {
    if (selectedTier) {
      navigate("/checkout", { state: { tier: selectedTier } });
    } else {
      navigate("/dashboard");
    }
  };
  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60, sx: { mb: 3, color: "primary.main" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 2 }, children: "Verifying Your Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Please wait while we verify your email address..." })
        ] });
      case "success":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckCircleIcon,
            {
              sx: {
                fontSize: 80,
                color: "success.main",
                mb: 3
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 2 }, children: "Email Verified Successfully!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "body1",
              color: "text.secondary",
              sx: { mb: 4, textAlign: "center" },
              children: "Your email has been verified. You can now access all features of BackboneLogic, Inc."
            }
          ),
          selectedTier && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mb: 3 }, children: [
            "Redirecting to checkout for your selected ",
            selectedTier,
            " plan..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              size: "large",
              endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}),
              onClick: handleContinue,
              sx: {
                background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                color: "#000"
              },
              children: selectedTier ? "Continue to Checkout" : "Go to Dashboard"
            }
          )
        ] });
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ErrorIcon,
            {
              sx: {
                fontSize: 80,
                color: "error.main",
                mb: 3
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 2 }, children: "Verification Failed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 4 }, children: error || "The verification link is invalid or has expired." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, direction: { xs: "column", sm: "row" }, justifyContent: "center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                onClick: resendVerification,
                disabled: isResending,
                sx: {
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000"
                },
                children: isResending ? "Sending..." : "Resend Verification"
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
        ] });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            EmailIcon,
            {
              sx: {
                fontSize: 80,
                color: "primary.main",
                mb: 3
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 2 }, children: "Check Your Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 2 }, children: "We've sent a verification link to:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 600, mb: 4, color: "primary.main" }, children: user == null ? void 0 : user.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 4 }, children: "Click the link in your email to verify your account. The link will expire in 24 hours." }),
          selectedTier && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mb: 4 }, children: [
            "After verifying your email, you'll be redirected to checkout for your selected ",
            selectedTier,
            " plan."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                size: "large",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                onClick: resendVerification,
                disabled: isResending,
                sx: {
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000"
                },
                children: isResending ? "Sending..." : "Resend Verification Email"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "text",
                onClick: () => navigate("/login"),
                sx: { color: "text.secondary" },
                children: "Use a different email address"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4, p: 2, backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Didn't receive the email?" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
              "• Check your spam/junk folder",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Make sure ",
              user == null ? void 0 : user.email,
              " is correct",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "• Try resending the verification email"
            ] })
          ] })
        ] });
    }
  };
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
                mb: 1,
                background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              },
              children: "Email Verification"
            }
          )
        ] }),
        error && verificationStatus !== "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
        renderContent(),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 4, pt: 3, borderTop: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "🔒 Your account security is our top priority" }) })
      ]
    }
  ) }) }) });
};
export {
  EmailVerificationPage as default
};
