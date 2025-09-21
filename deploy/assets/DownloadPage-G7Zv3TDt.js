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
import { u as useTheme, o as ErrorIcon, j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, b as Container, S as Stack, a as Button, R as RefreshIcon, A as ArrowBack, d as Alert, p as CheckCircleIcon, c as Paper, a8 as CloudDownload, D as Divider, a3 as Download, t as Card, w as CardContent, J as Security, a9 as Schedule, r as Chip } from "./mui-DHh4JGm2.js";
import { f as useParams, h as useSearchParams, u as useNavigate, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useAuth } from "./index-CwCxFwse.js";
import "./stripe-DrlueFI9.js";
const DownloadPage = () => {
  var _a, _b, _c, _d;
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useTheme();
  const [downloadData, setDownloadData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [downloading, setDownloading] = reactExports.useState(false);
  const token = searchParams.get("token");
  reactExports.useEffect(() => {
    if (!productId || !token) {
      setError("Invalid download link");
      setLoading(false);
      return;
    }
    validateDownloadToken();
  }, [productId, token]);
  const validateDownloadToken = () => __async(void 0, null, function* () {
    try {
      setLoading(true);
      setError(null);
      const response = yield fetch("/api/standalone-payments/validate-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          productId
        })
      });
      const data = yield response.json();
      if (!response.ok) {
        throw new ErrorIcon(data.message || "Failed to validate download token");
      }
      setDownloadData(data.data);
    } catch (err) {
      setError(err instanceof ErrorIcon ? err.message : "Failed to validate download");
    } finally {
      setLoading(false);
    }
  });
  const handleDownload = () => __async(void 0, null, function* () {
    if (!downloadData) return;
    try {
      setDownloading(true);
      yield new Promise((resolve) => setTimeout(resolve, 2e3));
      window.open(downloadData.downloadUrl, "_blank");
    } catch (err) {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  });
  const handleRetry = () => {
    validateDownloadToken();
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      flexDirection: "column",
      gap: 2
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "Validating download link..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { backgroundColor: "background.default", minHeight: "100vh", pt: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "md", sx: { py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { sx: { fontSize: 80, color: "error.main", mb: 2 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { mb: 2, fontWeight: 600 }, children: "Download Error" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", sx: { mb: 4 }, children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, justifyContent: "center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
            onClick: handleRetry,
            children: "Try Again"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
            onClick: () => navigate("/marketplace"),
            children: "Back to Marketplace"
          }
        )
      ] })
    ] }) }) });
  }
  if (!(downloadData == null ? void 0 : downloadData.valid)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { backgroundColor: "background.default", minHeight: "100vh", pt: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "md", sx: { py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { sx: { fontSize: 80, color: "error.main", mb: 2 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { mb: 2, fontWeight: 600 }, children: "Invalid Download Link" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", sx: { mb: 4 }, children: "This download link is invalid or has expired." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
          onClick: () => navigate("/marketplace"),
          children: "Back to Marketplace"
        }
      )
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { backgroundColor: "background.default", minHeight: "100vh", pt: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "md", sx: { py: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
          onClick: () => navigate("/marketplace"),
          sx: { mb: 2 },
          children: "Back to Marketplace"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Download Ready" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Your Backbone tool is ready for download" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Alert,
      {
        severity: "success",
        sx: { mb: 4 },
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 600 }, children: "Download link validated successfully!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Your product is ready for download. Click the button below to start downloading." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 4, mb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { sx: { fontSize: 80, color: "primary.main", mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 600, mb: 1 }, children: ((_a = downloadData.product) == null ? void 0 : _a.name) || "Backbone Tool" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 2 }, children: ((_b = downloadData.product) == null ? void 0 : _b.description) || "Professional Backbone tool" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Version" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: ((_c = downloadData.product) == null ? void 0 : _c.version) || "Latest" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "File Size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: ((_d = downloadData.product) == null ? void 0 : _d.fileSize) || "N/A" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Order ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, fontFamily: "monospace" }, children: downloadData.orderId })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          size: "large",
          startIcon: downloading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
          onClick: handleDownload,
          disabled: downloading,
          sx: {
            py: 2,
            px: 4,
            fontSize: "1.1rem",
            minWidth: 200
          },
          children: downloading ? "Preparing Download..." : "Download Now"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { sx: { color: "success.main" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Secure Download" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Your download is protected by SSL encryption and secure authentication. The file is verified and safe to download." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, { sx: { color: "info.main" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Download Expires" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "This download link is valid for 30 days from your purchase date. Keep your purchase receipt for future downloads." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3, mt: 4, backgroundColor: "grey.50" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "Need Help?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "If you're experiencing issues with your download or need assistance, our support team is here to help." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, flexWrap: "wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: "support@backbone-logic.com",
            variant: "outlined",
            clickable: true,
            onClick: () => window.open("mailto:support@backbone-logic.com")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: "Documentation",
            variant: "outlined",
            clickable: true,
            onClick: () => navigate("/documentation")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: "Contact Support",
            variant: "outlined",
            clickable: true,
            onClick: () => navigate("/support")
          }
        )
      ] })
    ] })
  ] }) });
};
export {
  DownloadPage as default
};
