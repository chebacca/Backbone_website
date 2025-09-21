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
import { j as jsxRuntimeExports, B as Box, C as CircularProgress, T as Typography, a as Button, R as RefreshIcon, G as Grid, t as Card, w as CardContent, a8 as CloudDownload, aL as NewReleases, aM as ComputerIcon, v as Star, r as Chip, aN as Apple, aO as DesktopWindows, av as TableContainer, aw as Table, ax as TableHead, ay as TableRow, az as TableCell, aA as TableBody, ap as Avatar, a3 as Download, aP as TablePagination, x as List, y as ListItem, z as ListItemIcon, H as ListItemText, aF as ListItemSecondaryAction, D as Divider } from "./mui-DKIosbOx.js";
import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
const mockDownloads = [
  {
    id: "1",
    name: "Backbone Call Sheet Pro",
    version: "1.2.0",
    platform: "macos",
    architecture: "universal",
    fileSize: "125.4 MB",
    downloadUrl: "/downloads/backbone-callsheet-pro-1.2.0.dmg",
    releaseDate: "2024-01-15",
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: "sha256:abc123...",
    description: "Professional call sheet management for film and TV production",
    requirements: ["macOS 11.0+", "8GB RAM", "500MB free space"],
    changelog: [
      "Added real-time collaboration features",
      "Improved PDF export quality",
      "Fixed timezone handling issues",
      "Enhanced mobile responsiveness"
    ],
    downloadCount: 1247,
    lastDownloaded: "2024-01-20"
  },
  {
    id: "2",
    name: "Backbone EDL Converter Pro",
    version: "1.0.5",
    platform: "macos",
    architecture: "universal",
    fileSize: "98.7 MB",
    downloadUrl: "/downloads/backbone-edl-converter-pro-1.0.5.dmg",
    releaseDate: "2024-01-10",
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: "sha256:def456...",
    description: "Professional EDL and XML to CSV converter with advanced parsing",
    requirements: ["macOS 11.0+", "4GB RAM", "200MB free space"],
    changelog: [
      "Added batch processing support",
      "Improved XML parsing accuracy",
      "Enhanced export options",
      "Fixed memory leak issues"
    ],
    downloadCount: 892,
    lastDownloaded: "2024-01-18"
  },
  {
    id: "3",
    name: "Backbone Call Sheet Pro",
    version: "1.2.0",
    platform: "windows",
    architecture: "x64",
    fileSize: "118.2 MB",
    downloadUrl: "/downloads/backbone-callsheet-pro-1.2.0.exe",
    releaseDate: "2024-01-15",
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: "sha256:ghi789...",
    description: "Professional call sheet management for film and TV production",
    requirements: ["Windows 10+", "8GB RAM", "500MB free space"],
    changelog: [
      "Added real-time collaboration features",
      "Improved PDF export quality",
      "Fixed timezone handling issues",
      "Enhanced mobile responsiveness"
    ],
    downloadCount: 2156,
    lastDownloaded: "2024-01-19"
  },
  {
    id: "4",
    name: "Backbone EDL Converter Pro",
    version: "1.0.5",
    platform: "windows",
    architecture: "x64",
    fileSize: "95.3 MB",
    downloadUrl: "/downloads/backbone-edl-converter-pro-1.0.5.exe",
    releaseDate: "2024-01-10",
    isLatest: true,
    isBeta: false,
    isStable: true,
    checksum: "sha256:jkl012...",
    description: "Professional EDL and XML to CSV converter with advanced parsing",
    requirements: ["Windows 10+", "4GB RAM", "200MB free space"],
    changelog: [
      "Added batch processing support",
      "Improved XML parsing accuracy",
      "Enhanced export options",
      "Fixed memory leak issues"
    ],
    downloadCount: 1834,
    lastDownloaded: "2024-01-17"
  },
  {
    id: "5",
    name: "Backbone Call Sheet Pro",
    version: "1.1.9",
    platform: "macos",
    architecture: "universal",
    fileSize: "122.1 MB",
    downloadUrl: "/downloads/backbone-callsheet-pro-1.1.9.dmg",
    releaseDate: "2024-01-01",
    isLatest: false,
    isBeta: false,
    isStable: true,
    checksum: "sha256:mno345...",
    description: "Professional call sheet management for film and TV production",
    requirements: ["macOS 11.0+", "8GB RAM", "500MB free space"],
    changelog: [
      "Bug fixes and performance improvements",
      "Updated UI components",
      "Enhanced data validation"
    ],
    downloadCount: 456,
    lastDownloaded: "2024-01-05"
  }
];
const mockStats = {
  totalDownloads: 6585,
  thisMonth: 1247,
  lastDownload: "2024-01-20",
  favoritePlatform: "Windows"
};
const getPlatformIcon = (platform) => {
  switch (platform) {
    case "macos":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, {});
    case "windows":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopWindows, {});
    case "linux":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {});
    case "web":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {});
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {});
  }
};
const getPlatformColor = (platform) => {
  switch (platform) {
    case "macos":
      return "default";
    case "windows":
      return "primary";
    case "linux":
      return "secondary";
    case "web":
      return "success";
    default:
      return "default";
  }
};
const getArchitectureLabel = (arch) => {
  switch (arch) {
    case "x64":
      return "64-bit";
    case "arm64":
      return "ARM64";
    case "universal":
      return "Universal";
    default:
      return arch;
  }
};
const DownloadsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [downloads, setDownloads] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [page, setPage] = reactExports.useState(0);
  const [rowsPerPage, setRowsPerPage] = reactExports.useState(10);
  const [filterPlatform, setFilterPlatform] = reactExports.useState("all");
  reactExports.useEffect(() => {
    const loadDownloads = () => __async(void 0, null, function* () {
      setLoading(true);
      try {
        yield new Promise((resolve) => setTimeout(resolve, 1e3));
        setDownloads(mockDownloads);
        setStats(mockStats);
      } catch (error) {
        enqueueSnackbar("Failed to load downloads", { variant: "error" });
      } finally {
        setLoading(false);
      }
    });
    loadDownloads();
  }, [enqueueSnackbar]);
  const handleDownload = (download) => __async(void 0, null, function* () {
    try {
      enqueueSnackbar(`Downloading ${download.name} v${download.version}...`, { variant: "info" });
      setTimeout(() => {
        enqueueSnackbar(`${download.name} downloaded successfully!`, { variant: "success" });
      }, 2e3);
    } catch (error) {
      enqueueSnackbar("Download failed", { variant: "error" });
    }
  });
  const handleRefresh = () => __async(void 0, null, function* () {
    setLoading(true);
    try {
      yield new Promise((resolve) => setTimeout(resolve, 1e3));
      enqueueSnackbar("Downloads refreshed", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to refresh", { variant: "error" });
    } finally {
      setLoading(false);
    }
  });
  const filteredDownloads = downloads.filter(
    (download) => filterPlatform === "all" || download.platform === filterPlatform
  );
  const paginatedDownloads = filteredDownloads.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Loading Downloads..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Fetching available downloads and version information" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Downloads" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Download your licensed Backbone applications for desktop and web" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
          onClick: handleRefresh,
          disabled: loading,
          children: "Refresh"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: "bold", children: stats == null ? void 0 : stats.totalDownloads.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { opacity: 0.9 }, children: "Total Downloads" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { sx: { fontSize: 48, opacity: 0.8 } })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", color: "white" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: "bold", children: stats == null ? void 0 : stats.thisMonth.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { opacity: 0.9 }, children: "This Month" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NewReleases, { sx: { fontSize: 48, opacity: 0.8 } })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: "bold", children: stats == null ? void 0 : stats.favoritePlatform }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { opacity: 0.9 }, children: "Top Platform" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, { sx: { fontSize: 48, opacity: 0.8 } })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", fontWeight: "bold", children: downloads.filter((d) => d.isLatest).length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { opacity: 0.9 }, children: "Latest Versions" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { sx: { fontSize: 48, opacity: 0.8 } })
      ] }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Filter by Platform" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: "All Platforms",
            onClick: () => setFilterPlatform("all"),
            color: filterPlatform === "all" ? "primary" : "default",
            variant: filterPlatform === "all" ? "filled" : "outlined"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: "macOS",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, {}),
            onClick: () => setFilterPlatform("macos"),
            color: filterPlatform === "macos" ? "primary" : "default",
            variant: filterPlatform === "macos" ? "filled" : "outlined"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: "Windows",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopWindows, {}),
            onClick: () => setFilterPlatform("windows"),
            color: filterPlatform === "windows" ? "primary" : "default",
            variant: filterPlatform === "windows" ? "filled" : "outlined"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: "Linux",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {}),
            onClick: () => setFilterPlatform("linux"),
            color: filterPlatform === "linux" ? "primary" : "default",
            variant: filterPlatform === "linux" ? "filled" : "outlined"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: [
        "Available Downloads (",
        filteredDownloads.length,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Application" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Version" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Platform" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Size" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Release Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Downloads" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { fontWeight: 600 }, children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedDownloads.map((download) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: "primary.main" }, children: getPlatformIcon(download.platform) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 500 }, children: download.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: download.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mt: 0.5 }, children: [
                download.isLatest && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Latest", size: "small", color: "success" }),
                download.isBeta && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Beta", size: "small", color: "warning" }),
                download.isStable && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Stable", size: "small", color: "primary" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: [
              "v",
              download.version
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: getArchitectureLabel(download.architecture) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: getPlatformIcon(download.platform),
              label: download.platform.toUpperCase(),
              color: getPlatformColor(download.platform),
              size: "small"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: download.fileSize }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: new Date(download.releaseDate).toLocaleDateString() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: download.downloadCount.toLocaleString() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
              onClick: () => handleDownload(download),
              sx: {
                background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                color: "#000",
                fontWeight: 600
              },
              children: "Download"
            }
          ) })
        ] }, download.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TablePagination,
        {
          component: "div",
          count: filteredDownloads.length,
          page,
          onPageChange: (_, newPage) => setPage(newPage),
          rowsPerPage,
          onRowsPerPageChange: (e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          },
          rowsPerPageOptions: [5, 10, 25]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mt: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Recent Downloads" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: downloads.filter((d) => d.lastDownloaded).sort((a, b) => new Date(b.lastDownloaded).getTime() - new Date(a.lastDownloaded).getTime()).slice(0, 5).map((download, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { bgcolor: "primary.main" }, children: getPlatformIcon(download.platform) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: `${download.name} v${download.version}`,
              secondary: `Downloaded on ${new Date(download.lastDownloaded).toLocaleDateString()} • ${download.platform.toUpperCase()}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: download.fileSize,
              size: "small",
              variant: "outlined"
            }
          ) })
        ] }),
        index < 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
      ] }, download.id)) })
    ] }) })
  ] });
};
export {
  DownloadsPage as default
};
