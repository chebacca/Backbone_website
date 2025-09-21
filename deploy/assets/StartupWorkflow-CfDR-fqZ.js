const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CloudProjectIntegration-CrqFVuc8.js","assets/index-_6L8xjqS.js","assets/mui-C-OPHTyf.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-DBN2V-e6.js","assets/index-COak77tQ.css"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
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
import { u as useTheme, j as jsxRuntimeExports, b as Container, B as Box, T as Typography, G as Grid, t as Card, w as CardContent, x as List, y as ListItem, z as ListItemIcon, p as CheckCircleIcon, H as ListItemText, r as Chip, bP as CardActions, a as Button, a4 as Dialog, a5 as DialogTitle, a7 as DialogContent, aj as FormControl, c4 as FormLabel, c5 as RadioGroup, F as FormControlLabel, c6 as Radio, aD as DialogActions, aM as ComputerIcon, c1 as NetworkIcon, bK as AddIcon, d as Alert, e as TextField, I as InputAdornment, b5 as SearchIcon, cl as SortIcon, R as RefreshIcon, aQ as Tabs, aR as Tab, bH as Badge, aK as Skeleton, aC as Menu, M as MenuItem, cm as FolderOpenIcon, ca as FolderIcon, g as IconButton, aB as MoreVertIcon, ad as PeopleIcon, ah as StorageIcon, N as CloudIcon, C as CircularProgress, i as LinearProgress, cn as Fade } from "./mui-C-OPHTyf.js";
import { r as reactExports, u as useNavigate } from "./vendor-Cu2L4Rr-.js";
import { s as simplifiedStartupSequencer, U as UnifiedProjectCreationDialog } from "./UnifiedProjectCreationDialog-Drzp158-.js";
import { _ as __vitePreload } from "./index-_6L8xjqS.js";
import LoginPage from "./LoginPage-CrgpxSy2.js";
import "./CloudProjectIntegration-CrqFVuc8.js";
import "./stripe-DBN2V-e6.js";
import "./index.esm-aV5ahHn5.js";
import "./notistack.esm-DLh02w5s.js";
const MODE_OPTIONS = [
  {
    mode: "standalone",
    title: "Standalone Mode",
    description: "Work offline with local projects and data storage",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, { fontSize: "large" }),
    benefits: [
      "No internet connection required",
      "Maximum privacy and data control",
      "Fast local performance",
      "No subscription fees",
      "Complete offline capability"
    ],
    recommendedFor: ["Individual users", "Offline work", "Privacy-focused", "Local development"],
    requirements: [],
    availableStorageModes: ["local"],
    defaultStorageMode: "local"
  },
  {
    mode: "shared_network",
    title: "Network Mode",
    description: "Collaborate with teams and access cloud projects",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIcon, { fontSize: "large" }),
    benefits: [
      "Real-time collaboration",
      "Cloud backup and sync",
      "Team project sharing",
      "Cross-device access",
      "Advanced features and integrations"
    ],
    recommendedFor: ["Teams", "Collaboration", "Cloud-first", "Enterprise"],
    requirements: ["Active subscription", "Internet connection"],
    availableStorageModes: ["cloud", "hybrid"],
    defaultStorageMode: "cloud"
  }
];
const SimplifiedModeSelection = ({
  onModeSelected
}) => {
  var _a;
  const [selectedMode, setSelectedMode] = reactExports.useState(null);
  const [selectedStorageMode, setSelectedStorageMode] = reactExports.useState("local");
  const [showStorageDialog, setShowStorageDialog] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const theme = useTheme();
  const handleModeSelect = (modeOption) => {
    setSelectedMode(modeOption.mode);
    setSelectedStorageMode(modeOption.defaultStorageMode);
    if (modeOption.availableStorageModes.length === 1) {
      handleProceed(modeOption.mode, modeOption.defaultStorageMode);
    } else {
      setShowStorageDialog(true);
    }
  };
  const handleProceed = (mode, storageMode) => __async(void 0, null, function* () {
    setIsLoading(true);
    try {
      yield simplifiedStartupSequencer.selectMode(mode, storageMode);
      onModeSelected == null ? void 0 : onModeSelected(mode, storageMode);
    } catch (error) {
      console.error("Mode selection failed:", error);
    } finally {
      setIsLoading(false);
      setShowStorageDialog(false);
    }
  });
  const getStorageDescription = (storageMode) => {
    switch (storageMode) {
      case "local":
        return "Store all project data on your local machine. No internet required, maximum privacy.";
      case "cloud":
        return "Store project data in the cloud for sharing, backup, and access from multiple devices.";
      case "hybrid":
        return "Combine local and cloud storage for optimal performance and flexibility.";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h3",
          component: "h1",
          gutterBottom: true,
          sx: {
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2
          },
          children: "Choose Your Workspace Mode"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h6",
          color: "text.secondary",
          sx: {
            maxWidth: "600px",
            mx: "auto",
            opacity: 0.8
          },
          children: "Select how you want to work with your projects. You can change this later in settings."
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 4, sx: { mb: 6 }, children: MODE_OPTIONS.map((option, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        sx: {
          height: "100%",
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: selectedMode === option.mode ? 2 : 1,
          borderColor: selectedMode === option.mode ? "primary.main" : "divider",
          backgroundColor: selectedMode === option.mode ? "background.elevated" : "background.paper",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-4px)",
            boxShadow: (theme2) => theme2.shadows[8],
            backgroundColor: "background.elevated"
          }
        },
        onClick: () => handleModeSelect(option),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 3, height: "100%", display: "flex", flexDirection: "column" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { color: "primary.main", mr: 2, p: 1, borderRadius: 2, backgroundColor: "rgba(0, 212, 255, 0.1)" }, children: option.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Typography,
                  {
                    variant: "h5",
                    component: "h2",
                    fontWeight: "bold",
                    color: "text.primary",
                    children: option.title
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Typography,
                  {
                    variant: "body2",
                    color: "text.secondary",
                    sx: { opacity: 0.8 },
                    children: option.description
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3, flexGrow: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Typography,
                {
                  variant: "subtitle2",
                  gutterBottom: true,
                  color: "primary",
                  sx: { fontWeight: 600 },
                  children: "Benefits:"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, sx: { py: 0 }, children: option.benefits.map((benefit, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { py: 0.5, px: 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { sx: { minWidth: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CheckCircleIcon,
                  {
                    color: "success",
                    fontSize: "small",
                    sx: { color: "success.main" }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: benefit,
                    primaryTypographyProps: {
                      variant: "body2",
                      color: "text.primary"
                    }
                  }
                )
              ] }, idx)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Typography,
                {
                  variant: "subtitle2",
                  gutterBottom: true,
                  color: "text.primary",
                  sx: { fontWeight: 600 },
                  children: "Perfect for:"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5 }, children: option.recommendedFor.map((use, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: use,
                  size: "small",
                  variant: "outlined",
                  color: "primary",
                  sx: {
                    borderColor: "primary.main",
                    color: "primary.main",
                    backgroundColor: "rgba(0, 212, 255, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(0, 212, 255, 0.2)"
                    }
                  }
                },
                idx
              )) })
            ] }),
            option.requirements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Typography,
                {
                  variant: "subtitle2",
                  gutterBottom: true,
                  color: "warning.main",
                  sx: { fontWeight: 600 },
                  children: "Requirements:"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "ul", sx: { m: 0, pl: 2 }, children: option.requirements.map((req, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Typography,
                {
                  component: "li",
                  variant: "body2",
                  color: "text.secondary",
                  children: req
                },
                idx
              )) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardActions, { sx: { p: 3, pt: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              fullWidth: true,
              variant: selectedMode === option.mode ? "contained" : "outlined",
              size: "large",
              startIcon: selectedMode === option.mode ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}) : void 0,
              disabled: isLoading,
              sx: __spreadValues({
                height: 48,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2
              }, selectedMode === option.mode ? {
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: "#000000",
                boxShadow: "0 4px 12px rgba(0, 212, 255, 0.3)",
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
                  boxShadow: "0 6px 20px rgba(0, 212, 255, 0.4)",
                  transform: "translateY(-1px)"
                }
              } : {
                borderColor: "primary.main",
                color: "primary.main",
                borderWidth: 2,
                "&:hover": {
                  borderColor: "primary.light",
                  backgroundColor: "rgba(0, 212, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 212, 255, 0.2)",
                  transform: "translateY(-1px)"
                }
              }),
              children: selectedMode === option.mode ? "Selected" : `Choose ${option.title}`
            }
          ) })
        ]
      }
    ) }) }, option.mode)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: showStorageDialog,
        onClose: () => setShowStorageDialog(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: {
          sx: {
            backgroundColor: "background.paper",
            borderRadius: 3,
            border: 1,
            borderColor: "divider"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: {
            pb: 1,
            color: "text.primary",
            fontWeight: 600
          }, children: "Choose Storage Mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: [
              "Select how you want to store your project data for ",
              selectedMode === "standalone" ? "Standalone" : "Network",
              " mode."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { component: "fieldset", fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { component: "legend", sx: { color: "text.primary", mb: 2 }, children: "Storage Options" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RadioGroup,
                {
                  value: selectedStorageMode,
                  onChange: (e) => setSelectedStorageMode(e.target.value),
                  children: (_a = MODE_OPTIONS.find((o) => o.mode === selectedMode)) == null ? void 0 : _a.availableStorageModes.map((storageMode) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FormControlLabel,
                    {
                      value: storageMode,
                      control: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { sx: { color: "primary.main" } }),
                      label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", color: "text.primary", sx: { fontWeight: 500 }, children: [
                          storageMode.charAt(0).toUpperCase() + storageMode.slice(1),
                          " Storage"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: getStorageDescription(storageMode) })
                      ] }),
                      sx: {
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        border: 1,
                        borderColor: selectedStorageMode === storageMode ? "primary.main" : "divider",
                        backgroundColor: selectedStorageMode === storageMode ? "rgba(0, 212, 255, 0.05)" : "transparent",
                        "&:hover": {
                          backgroundColor: "rgba(0, 212, 255, 0.05)"
                        }
                      }
                    },
                    storageMode
                  ))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3, pt: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setShowStorageDialog(false),
                sx: {
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }
                },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => handleProceed(selectedMode, selectedStorageMode),
                variant: "contained",
                disabled: isLoading,
                sx: {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: "#000000",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
                    boxShadow: "0 4px 12px rgba(0, 212, 255, 0.3)"
                  }
                },
                children: isLoading ? "Processing..." : "Continue"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "center", mt: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { opacity: 0.7 }, children: [
      "Need help choosing? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          color: "primary",
          sx: {
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "rgba(0, 212, 255, 0.1)"
            }
          },
          children: "Learn more about modes"
        }
      )
    ] }) })
  ] });
};
const UnifiedProjectSelection = ({
  mode,
  storageMode,
  onProjectSelected,
  onBack
}) => {
  const [projects, setProjects] = reactExports.useState([]);
  const [filteredProjects, setFilteredProjects] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [activeTab, setActiveTab] = reactExports.useState("my_projects");
  const [sortBy, setSortBy] = reactExports.useState("lastAccessed");
  const [showCreateDialog, setShowCreateDialog] = reactExports.useState(false);
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadProjects();
  }, [mode, storageMode, activeTab]);
  reactExports.useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchQuery, sortBy, activeTab]);
  const loadProjects = () => __async(void 0, null, function* () {
    setLoading(true);
    try {
      let allProjects = [];
      if (mode === "shared_network" || storageMode === "cloud" || storageMode === "hybrid") {
        try {
          const { cloudProjectIntegration } = yield __vitePreload(() => __async(void 0, null, function* () {
            const { cloudProjectIntegration: cloudProjectIntegration2 } = yield import("./CloudProjectIntegration-CrqFVuc8.js").then((n) => n.C);
            return { cloudProjectIntegration: cloudProjectIntegration2 };
          }), true ? __vite__mapDeps([0,1,2,3,4,5]) : void 0);
          const cloudProjects = yield cloudProjectIntegration.getUserProjects();
          const convertedCloudProjects = cloudProjects.map((cp) => ({
            id: cp.id,
            name: cp.name,
            description: cp.description,
            mode: cp.applicationMode,
            storageMode: cp.storageBackend === "firestore" ? "cloud" : "cloud",
            lastAccessed: cp.lastAccessedAt,
            collaborators: cp.maxCollaborators || 0,
            status: cp.isActive ? "active" : "archived",
            tags: [],
            // Could be extracted from metadata
            size: "Unknown",
            // Would need to be calculated
            isOwner: true
            // Would need to check ownership
          }));
          allProjects = [...allProjects, ...convertedCloudProjects];
        } catch (error) {
          console.error("Failed to load cloud projects:", error);
        }
      }
      if (mode === "standalone" || storageMode === "local") {
        try {
          const localProjects = JSON.parse(localStorage.getItem("localProjects") || "[]");
          const convertedLocalProjects = localProjects.map((lp) => {
            var _a;
            return {
              id: lp.id,
              name: lp.name,
              description: lp.description,
              mode: lp.mode,
              storageMode: lp.storageMode,
              lastAccessed: lp.createdAt,
              // Use creation time as last accessed
              collaborators: ((_a = lp.localNetworkConfig) == null ? void 0 : _a.maxUsers) || 0,
              status: "active",
              tags: [],
              size: "Unknown",
              isOwner: true
            };
          });
          allProjects = [...allProjects, ...convertedLocalProjects];
        } catch (error) {
          console.error("Failed to load local projects:", error);
        }
      }
      let filtered = allProjects;
      if (activeTab === "my_projects") {
        filtered = filtered.filter((p) => p.isOwner);
      } else if (activeTab === "shared_projects") {
        filtered = filtered.filter((p) => !p.isOwner);
      }
      setProjects(filtered);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  });
  const filterAndSortProjects = () => {
    let filtered = [...projects];
    if (searchQuery) {
      filtered = filtered.filter(
        (project) => {
          var _a, _b;
          return project.name.toLowerCase().includes(searchQuery.toLowerCase()) || ((_a = project.description) == null ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase())) || ((_b = project.tags) == null ? void 0 : _b.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
        }
      );
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "lastAccessed":
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        case "size":
          return (b.size || "").localeCompare(a.size || "");
        case "collaborators":
          return (b.collaborators || 0) - (a.collaborators || 0);
        default:
          return 0;
      }
    });
    setFilteredProjects(filtered);
  };
  const handleProjectSelect = (projectId) => {
    simplifiedStartupSequencer.selectProject(projectId);
    onProjectSelected == null ? void 0 : onProjectSelected(projectId);
  };
  const formatLastAccessed = (dateString) => {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1e3 * 60 * 60 * 24));
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };
  const getStorageIcon = (projectStorageMode) => {
    switch (projectStorageMode) {
      case "local":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, { fontSize: "small" });
      case "cloud":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, { fontSize: "small" });
      case "hybrid":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { fontSize: "small" });
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "shared":
        return "info";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };
  const renderProjectCard = (project) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      sx: {
        height: "100%",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) => theme.shadows[4]
        }
      },
      onClick: () => handleProjectSelect(project.id),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderIcon, { color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", component: "h3", noWrap: true, children: project.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              size: "small",
              onClick: (e) => {
                e.stopPropagation();
                setAnchorEl(e.currentTarget);
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertIcon, {})
            }
          )
        ] }),
        project.description && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typography,
          {
            variant: "body2",
            color: "text.secondary",
            sx: {
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical"
            },
            children: project.description
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: project.status,
              color: getStatusColor(project.status),
              variant: "outlined"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              icon: getStorageIcon(project.storageMode),
              label: project.storageMode,
              variant: "outlined"
            }
          ),
          project.collaborators && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}),
              label: project.collaborators,
              variant: "outlined"
            }
          )
        ] }),
        project.tags && project.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }, children: [
          project.tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: tag,
              variant: "filled",
              color: "primary",
              sx: { fontSize: "0.75rem" }
            },
            tag
          )),
          project.tags.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: `+${project.tags.length - 3}`,
              variant: "outlined",
              sx: { fontSize: "0.75rem" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: formatLastAccessed(project.lastAccessed) }),
          project.size && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: project.size })
        ] })
      ] })
    }
  ) });
  const renderEmptyState = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 8 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpenIcon, { sx: { fontSize: 64, color: "text.secondary", mb: 2 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", gutterBottom: true, children: searchQuery ? "No projects found" : "No projects yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: searchQuery ? "Try adjusting your search criteria" : mode === "standalone" ? "Create your first standalone project to get started" : "Create or join a network project to begin collaborating" }),
    !searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "contained",
        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
        onClick: () => setShowCreateDialog(true),
        size: "large",
        children: "Create Project"
      }
    )
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", component: "h1", fontWeight: "bold", children: "Your Projects" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
          onBack && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onBack, variant: "outlined", children: "Back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
              onClick: () => setShowCreateDialog(true),
              children: "Create Project"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
        "Currently in ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          mode === "standalone" ? "Standalone" : "Network",
          " mode"
        ] }),
        " with",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          storageMode,
          " storage"
        ] }),
        ".",
        mode === "standalone" && storageMode === "local" && " Working offline with local files.",
        mode === "shared_network" && " Ready for team collaboration."
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            placeholder: "Search projects...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            size: "small",
            sx: { flexGrow: 1, minWidth: 200 },
            InputProps: {
              startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) })
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outlined",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, {}),
            onClick: (e) => setAnchorEl(e.currentTarget),
            children: [
              "Sort: ",
              sortBy
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
            onClick: loadProjects,
            disabled: loading,
            children: "Refresh"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        {
          value: activeTab,
          onChange: (_, newValue) => setActiveTab(newValue),
          sx: { borderBottom: 1, borderColor: "divider" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { badgeContent: projects.filter((p) => p.isOwner).length, color: "primary", children: "My Projects" }),
                value: "my_projects"
              }
            ),
            mode === "shared_network" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tab,
              {
                label: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { badgeContent: projects.filter((p) => !p.isOwner).length, color: "secondary", children: "Shared Projects" }),
                value: "shared_projects"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Recent", value: "recent" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 4 }, children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: [...Array(6)].map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rectangular", height: 200, sx: { borderRadius: 1 } }) }, index)) }) : filteredProjects.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: filteredProjects.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: renderProjectCard(project) }, project.id)) }) : renderEmptyState() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Menu,
      {
        anchorEl,
        open: Boolean(anchorEl),
        onClose: () => setAnchorEl(null),
        children: [
          { value: "lastAccessed", label: "Last Accessed" },
          { value: "name", label: "Name" },
          { value: "size", label: "Size" },
          { value: "collaborators", label: "Collaborators" }
        ].map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuItem,
          {
            selected: sortBy === option.value,
            onClick: () => {
              setSortBy(option.value);
              setAnchorEl(null);
            },
            children: option.label
          },
          option.value
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UnifiedProjectCreationDialog,
      {
        open: showCreateDialog,
        onClose: () => setShowCreateDialog(false),
        mode,
        onSuccess: (projectId) => {
          setShowCreateDialog(false);
          handleProjectSelect(projectId);
        }
      }
    )
  ] });
};
const STEP_TITLES = {
  mode_selection: "Choose Your Workspace Mode",
  authentication: "Sign In to Continue",
  project_selection: "Select or Create a Project",
  complete: "Loading Your Workspace"
};
const STEP_DESCRIPTIONS = {
  mode_selection: "Select how you want to work with your projects",
  authentication: "Authentication required for this mode",
  project_selection: "Choose an existing project or create a new one",
  complete: "Setting up your workspace..."
};
const StartupOrchestrator = ({
  onStartupComplete
}) => {
  const [startupState, setStartupState] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const theme = useTheme();
  reactExports.useEffect(() => {
    const unsubscribe = simplifiedStartupSequencer.subscribe((state) => {
      setStartupState(state);
      setIsLoading(false);
      if (state.currentStep === "complete" && state.selectedProjectId) {
        setTimeout(() => {
          onStartupComplete == null ? void 0 : onStartupComplete(state.selectedProjectId);
        }, 1e3);
      }
    });
    return unsubscribe;
  }, [onStartupComplete]);
  const handleAuthenticationSuccess = (user) => {
    simplifiedStartupSequencer.onAuthenticationSuccess(user);
  };
  const handleModeSelected = (mode, storageMode) => {
    console.log("Mode selected:", mode, "Storage:", storageMode);
  };
  const handleProjectSelected = (projectId) => {
    console.log("Project selected:", projectId);
  };
  const handleBack = () => {
    if ((startupState == null ? void 0 : startupState.currentStep) === "authentication" || (startupState == null ? void 0 : startupState.currentStep) === "project_selection") {
      simplifiedStartupSequencer.selectMode(startupState.selectedMode || "standalone", startupState.storageMode);
    }
  };
  const handleRetry = () => {
    simplifiedStartupSequencer.reset();
  };
  if (!startupState) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 3, backgroundColor: "background.default", color: "text.primary" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CircularProgress,
        {
          size: 80,
          sx: {
            color: "primary.main",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round"
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h4",
          component: "h1",
          sx: {
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center"
          },
          children: "Initializing Dashboard v14"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h6",
          color: "text.secondary",
          textAlign: "center",
          sx: { maxWidth: "400px" },
          children: "Setting up your workspace environment..."
        }
      )
    ] });
  }
  const renderStepContent = () => {
    switch (startupState.currentStep) {
      case "mode_selection":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          SimplifiedModeSelection,
          {
            onModeSelected: handleModeSelected
          }
        );
      case "authentication":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { maxWidth: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", mb: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h4",
                component: "h1",
                gutterBottom: true,
                sx: {
                  fontWeight: 600,
                  color: "text.primary"
                },
                children: "Authentication Required"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h6",
                color: "text.secondary",
                paragraph: true,
                sx: { mb: 3 },
                children: startupState.selectedMode === "shared_network" ? "Network mode requires authentication to access shared projects" : "Cloud storage requires authentication to sync your data"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                onClick: handleBack,
                sx: {
                  mt: 2,
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.light",
                    backgroundColor: "rgba(0, 212, 255, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 212, 255, 0.3)"
                  }
                },
                children: "Back to Mode Selection"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            LoginPage,
            {
              onSuccess: handleAuthenticationSuccess,
              mode: startupState.selectedMode,
              redirectTo: "/startup"
            }
          )
        ] });
      case "project_selection":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          UnifiedProjectSelection,
          {
            mode: startupState.selectedMode,
            storageMode: startupState.storageMode,
            onProjectSelected: handleProjectSelected,
            onBack: handleBack
          }
        );
      case "complete":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 3, backgroundColor: "background.default", color: "text.primary" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CircularProgress,
            {
              size: 80,
              sx: {
                color: "primary.main",
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round"
                }
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "h4",
              component: "h1",
              gutterBottom: true,
              sx: {
                fontWeight: 600,
                textAlign: "center"
              },
              children: "Setting Up Your Workspace"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Typography,
            {
              variant: "h6",
              color: "text.secondary",
              textAlign: "center",
              sx: { maxWidth: "500px" },
              children: [
                'Loading project "',
                startupState.selectedProjectId,
                '" in',
                " ",
                startupState.selectedMode === "standalone" ? "Standalone" : "Network",
                " mode"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            LinearProgress,
            {
              sx: {
                width: "300px",
                mt: 2,
                height: 6,
                borderRadius: 3,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                }
              }
            }
          )
        ] });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { minHeight: "100vh", backgroundColor: "background.default", color: "text.primary" }, children: [
    startupState.currentStep !== "complete" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 1e3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        LinearProgress,
        {
          variant: "determinate",
          value: startupState.currentStep === "mode_selection" ? 25 : startupState.currentStep === "authentication" ? 50 : startupState.currentStep === "project_selection" ? 75 : 100,
          sx: {
            height: 4,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            "& .MuiLinearProgress-bar": {
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", p: 3, backgroundColor: "background.paper", borderBottom: 1, borderColor: "divider", backdropFilter: "blur(10px)", boxShadow: "0 2px 20px rgba(0, 0, 0, 0.3)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "h5",
              component: "h1",
              sx: {
                fontWeight: 600,
                color: "text.primary",
                mb: 1
              },
              children: STEP_TITLES[startupState.currentStep]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "body1",
              color: "text.secondary",
              sx: { opacity: 0.8 },
              children: STEP_DESCRIPTIONS[startupState.currentStep]
            }
          )
        ] }),
        startupState.selectedMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, backgroundColor: "background.elevated", px: 2, py: 1, borderRadius: 2, border: 1, borderColor: "divider" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            "Mode: ",
            startupState.selectedMode === "standalone" ? "Standalone" : "Network"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            "Storage: ",
            startupState.storageMode
          ] })
        ] })
      ] })
    ] }),
    startupState.error && /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "sm", sx: { pt: startupState.currentStep !== "complete" ? "140px" : "20px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Alert,
      {
        severity: "error",
        action: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            color: "inherit",
            size: "small",
            onClick: handleRetry,
            sx: {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "error.contrastText",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)"
              }
            },
            children: "Retry"
          }
        ),
        sx: {
          mb: 3,
          backgroundColor: "error.dark",
          color: "error.contrastText",
          "& .MuiAlert-icon": {
            color: "error.contrastText"
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: startupState.error })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { pt: startupState.currentStep !== "complete" ? "140px" : 0 }, children: renderStepContent() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Fade, { in: startupState.isLoading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2e3, backdropFilter: "blur(4px)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, backgroundColor: "background.paper", p: 4, borderRadius: 3, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)", border: 1, borderColor: "divider" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CircularProgress,
        {
          size: 60,
          sx: {
            color: "primary.main",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round"
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.primary", children: "Processing..." })
    ] }) }) })
  ] });
};
const StartupWorkflow = ({
  onStartupComplete,
  onStartupError,
  isDashboardMode = false
}) => {
  const [startupState, setStartupState] = reactExports.useState({
    isInitializing: true,
    currentStep: "initializing"
  });
  const theme = useTheme();
  const navigate = useNavigate();
  const currentIsDashboardMode = isDashboardMode || window.location.pathname.includes("/dashboard/startup");
  reactExports.useEffect(() => {
    const initializeApp = () => __async(void 0, null, function* () {
      try {
        yield new Promise((resolve) => setTimeout(resolve, 2e3));
        setStartupState({
          isInitializing: false,
          currentStep: "startup"
        });
      } catch (error) {
        setStartupState({
          isInitializing: false,
          currentStep: "error",
          error: "Failed to initialize application"
        });
        onStartupError == null ? void 0 : onStartupError("Failed to initialize application");
      }
    });
    initializeApp();
  }, [onStartupError]);
  const handleStartupComplete = (projectId) => {
    setStartupState({
      isInitializing: false,
      currentStep: "complete"
    });
    setTimeout(() => {
      onStartupComplete == null ? void 0 : onStartupComplete(projectId);
      if (currentIsDashboardMode) {
        navigate("/dashboard/cloud-projects");
      } else {
        navigate("/dashboard");
      }
    }, 1e3);
  };
  if (startupState.currentStep === "initializing") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 4, backgroundColor: "background.default", color: "text.primary", position: "relative", overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}15 0%, transparent 70%)`, animation: "pulse 4s ease-in-out infinite" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-logo-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 120, height: 120, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 32px ${theme.palette.primary.main}40`, mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h2",
          sx: {
            fontWeight: 700,
            color: "#000000",
            textAlign: "center"
          },
          children: "D14"
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-title-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h3",
          component: "h1",
          sx: {
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            mb: 2
          },
          children: "Dashboard v14"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-subtitle-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h6",
          color: "text.secondary",
          sx: {
            textAlign: "center",
            maxWidth: "500px",
            opacity: 0.8,
            mb: 4
          },
          children: "Professional project management and collaboration platform"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-loading-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CircularProgress,
        {
          size: 60,
          sx: {
            color: "primary.main",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round"
            }
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-status-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "body1",
          color: "text.secondary",
          sx: {
            textAlign: "center",
            opacity: 0.7
          },
          children: "Initializing application..."
        }
      ) })
    ] });
  }
  if (startupState.currentStep === "startup") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Fade, { in: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      StartupOrchestrator,
      {
        onStartupComplete: handleStartupComplete
      }
    ) }) });
  }
  if (startupState.currentStep === "complete") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Fade, { in: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 3, backgroundColor: "background.default", color: "text.primary" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-success-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px ${theme.palette.success.main}40` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h3",
          sx: {
            color: "success.contrastText",
            fontWeight: 700
          },
          children: "✓"
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-success-title-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h4",
          component: "h1",
          sx: {
            fontWeight: 600,
            textAlign: "center",
            mb: 2
          },
          children: "Ready to Launch!"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-success-subtitle-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h6",
          color: "text.secondary",
          sx: {
            textAlign: "center",
            opacity: 0.8
          },
          children: "Your workspace is ready. Launching application..."
        }
      ) })
    ] }) });
  }
  if (startupState.currentStep === "error") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Fade, { in: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 3, backgroundColor: "background.default", color: "text.primary", p: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-error-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px ${theme.palette.error.main}40` }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h3",
          sx: {
            color: "error.contrastText",
            fontWeight: 700
          },
          children: "✗"
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-error-title-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h4",
          component: "h1",
          sx: {
            fontWeight: 600,
            textAlign: "center",
            mb: 2
          },
          children: "Startup Failed"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-error-subtitle-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "h6",
          color: "text.secondary",
          sx: {
            textAlign: "center",
            opacity: 0.8,
            maxWidth: "600px"
          },
          children: startupState.error || "An unexpected error occurred during startup. Please try again."
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "startup-error-message-animation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Typography,
        {
          variant: "body2",
          color: "text.secondary",
          sx: {
            textAlign: "center",
            opacity: 0.6,
            mt: 2
          },
          children: "Please restart the application or contact support if the problem persists."
        }
      ) })
    ] }) });
  }
  return null;
};
export {
  StartupWorkflow,
  StartupWorkflow as default
};
