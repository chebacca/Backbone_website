import { j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, d as Alert, Z as AlertTitle, w as List, x as ListItem, y as ListItemIcon, _ as WarningIcon, z as ListItemText, H as Security, a as Button, aB as Tooltip, g as IconButton, aE as ContentCopy, aF as LinkIcon, aG as Tabs, aH as Tab, as as Download, aI as Description, aJ as History, G as Grid, t as Card, v as CardContent, r as Chip, aK as GetApp, c as Paper, aL as CloudDownload, D as Divider, at as Dialog, au as DialogTitle, av as DialogContent, p as CheckCircleIcon, aw as DialogActions, aM as ComputerIcon, aN as Apple, aO as Android, $ as Info, aP as Language, a5 as Code } from "./mui-DBh4ciAv.js";
import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { b as useCurrentUser, c as useOrganizationContext, d as useUserProjects } from "./useStreamlinedData-D1oAjH9d.js";
import "./UnifiedDataService-Dej6ZRn4.js";
import "./index-D2GwMvBK.js";
import "./stripe-iYh_bQi1.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./FirestoreCollectionManager-D6DfX4S5.js";
import "./firebase-BKD6RvFa.js";
import "./index.esm-BMygn4u3.js";
const mockSDKVersions = [
  {
    id: "1",
    version: "v14.2.1",
    releaseDate: "2024-01-15",
    size: "45.2 MB",
    changelog: "Bug fixes and performance improvements",
    platforms: ["windows", "macos", "linux"],
    isLatest: true,
    isLTS: false
  },
  {
    id: "2",
    version: "v14.2.0",
    releaseDate: "2024-01-01",
    size: "44.8 MB",
    changelog: "New authentication features and API enhancements",
    platforms: ["windows", "macos", "linux", "android", "ios"],
    isLatest: false,
    isLTS: true
  }
];
const mockDocumentation = [
  {
    id: "1",
    title: "SDK Installation Guide",
    description: "Step-by-step SDK installation and setup instructions",
    type: "guide",
    format: "pdf",
    size: "1.8 MB",
    lastUpdated: "2024-01-15"
  },
  {
    id: "2",
    title: "API Reference",
    description: "Complete API documentation with code examples",
    type: "api",
    format: "html",
    size: "750 KB",
    lastUpdated: "2024-01-10"
  }
];
const getPlatformIcon = (platform) => {
  switch (platform) {
    case "windows":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {});
    case "macos":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, {});
    case "linux":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {});
    case "android":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Android, {});
    case "ios":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, {});
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {});
  }
};
const getTypeIcon = (type) => {
  switch (type) {
    case "guide":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, {});
    case "api":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Code, {});
    case "tutorial":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Language, {});
    case "reference":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {});
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, {});
  }
};
const DownloadsPage = () => {
  var _a;
  const { enqueueSnackbar } = useSnackbar();
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { loading: projectsLoading, error: projectsError } = useUserProjects();
  const [selectedTab, setSelectedTab] = reactExports.useState(0);
  const [downloadDialogOpen, setDownloadDialogOpen] = reactExports.useState(false);
  const [selectedDownload, setSelectedDownload] = reactExports.useState(null);
  const isLoading = userLoading || orgLoading || projectsLoading;
  const hasError = userError || orgError || projectsError;
  const licenseKey = ((_a = currentUser == null ? void 0 : currentUser.license) == null ? void 0 : _a.type) || "DV14-PRO-2024-XXXX-XXXX-XXXX";
  const downloadHistory = [
    {
      id: "1",
      item: "BackboneLogic SDK",
      version: "v14.2.1",
      downloadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
      platform: "Windows x64",
      size: "45.2 MB"
    },
    {
      id: "2",
      item: "API Reference",
      version: "v14.2.0",
      downloadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(),
      platform: "Web",
      size: "750 KB"
    }
  ];
  const handleDownload = (item, platform) => {
    if ("platforms" in item) {
      setSelectedDownload(item);
      setDownloadDialogOpen(true);
    } else {
      enqueueSnackbar(`Downloading ${item.title}...`, { variant: "info" });
    }
  };
  const confirmDownload = () => {
    if (selectedDownload) {
      enqueueSnackbar(`Downloading ${selectedDownload.version}...`, { variant: "success" });
    }
    setDownloadDialogOpen(false);
    setSelectedDownload(null);
  };
  const copyLicenseKey = () => {
    navigator.clipboard.writeText(licenseKey);
    enqueueSnackbar("License key copied to clipboard", { variant: "success" });
  };
  const generateDownloadLink = () => {
    const link = `https://downloads.backbonelogic.com/sdk/v14.2.1/?key=${licenseKey}`;
    navigator.clipboard.writeText(link);
    enqueueSnackbar("Download link copied to clipboard", { variant: "success" });
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Loading Downloads..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Preparing your SDK packages and documentation" })
    ] }) });
  }
  if (hasError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Unable to Load Downloads" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "We encountered an issue loading your download resources. This could be due to:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Network connectivity issues" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { fontSize: "small" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "License validation required" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: () => window.location.reload(), children: "Retry" }) })
    ] }) });
  }
  if (!currentUser || !orgContext) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Setting Up Downloads" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "We're preparing your download access. This may take a moment for new accounts." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Downloads & Resources" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Access SDK packages, documentation, and development resources" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Alert,
      {
        severity: "info",
        sx: {
          mb: 4,
          background: "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
          border: "1px solid rgba(33, 150, 243, 0.2)"
        },
        action: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Copy License Key", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              size: "small",
              onClick: copyLicenseKey,
              sx: { color: "info.main" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContentCopy, {})
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Generate Download Link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              size: "small",
              onClick: generateDownloadLink,
              sx: { color: "info.main" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkIcon, {})
            }
          ) })
        ] }),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: [
            "Your License Key: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "code", sx: { fontFamily: "monospace", backgroundColor: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }, children: licenseKey })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Use this key to authenticate SDK downloads and activate your licenses" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { borderBottom: 1, borderColor: "rgba(255,255,255,0.1)", mb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Tabs,
      {
        value: selectedTab,
        onChange: (_, newValue) => setSelectedTab(newValue),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "SDK Downloads", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Documentation", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Description, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Download History", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(History, {}) })
        ]
      }
    ) }),
    selectedTab === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: mockSDKVersions.map((sdk) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { p: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, alignItems: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h5", sx: { fontWeight: 600 }, children: [
            "BackboneLogic SDK ",
            sdk.version
          ] }),
          sdk.isLatest && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Latest", color: "primary", size: "small" }),
          sdk.isLTS && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "LTS", color: "success", size: "small" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: sdk.changelog }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 1, mb: 2 }, children: sdk.platforms.map((platform) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            icon: getPlatformIcon(platform),
            label: platform.charAt(0).toUpperCase() + platform.slice(1),
            size: "small",
            variant: "outlined"
          },
          platform
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          "Released: ",
          new Date(sdk.releaseDate).toLocaleDateString(),
          " • Size: ",
          sdk.size
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
            onClick: () => handleDownload(sdk),
            sx: {
              background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
              color: "#000",
              fontWeight: 600
            },
            children: "Download SDK"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", size: "small", children: "View Changelog" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", size: "small", children: "Release Notes" })
        ] })
      ] }) })
    ] }) }) }) }, sdk.id)) }),
    selectedTab === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: mockDocumentation.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, lg: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 3, height: "100%", display: "flex", flexDirection: "column" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
        getTypeIcon(doc.type),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: doc.type.toUpperCase(),
            size: "small",
            color: doc.type === "api" ? "primary" : "default"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 1 }, children: doc.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2, flex: 1 }, children: doc.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          doc.size,
          " • ",
          doc.format.toUpperCase()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          "Updated: ",
          new Date(doc.lastUpdated).toLocaleDateString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(GetApp, {}),
          onClick: () => handleDownload(doc),
          fullWidth: true,
          children: "Download"
        }
      )
    ] }) }) }, doc.id)) }),
    selectedTab === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: downloadHistory.map((download, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { py: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { sx: { color: "primary.main" } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ListItemText,
          {
            primary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 500 }, children: download.item }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: download.version, size: "small", variant: "outlined" })
            ] }),
            secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mt: 0.5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: new Date(download.downloadedAt).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: download.platform }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: download.size })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", size: "small", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}), children: "Re-download" })
      ] }),
      index < downloadHistory.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
    ] }, download.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: downloadDialogOpen,
        onClose: () => setDownloadDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            "Download SDK ",
            selectedDownload == null ? void 0 : selectedDownload.version
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 3 }, children: "Select your platform to download the BackboneLogic SDK:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: selectedDownload == null ? void 0 : selectedDownload.platforms.map((platform) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                fullWidth: true,
                startIcon: getPlatformIcon(platform),
                sx: { py: 1.5, justifyContent: "flex-start" },
                onClick: confirmDownload,
                children: platform.charAt(0).toUpperCase() + platform.slice(1)
              }
            ) }, platform)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 3, p: 2, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 16, mr: 1, verticalAlign: "middle" } }),
              "Your license key will be validated automatically during download"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDownloadDialogOpen(false), children: "Cancel" }) })
        ]
      }
    )
  ] });
};
export {
  DownloadsPage as default
};
