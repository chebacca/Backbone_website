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
import { j as jsxRuntimeExports, B as Box, T as Typography, G as Grid, c as Paper, af as Avatar, g as IconButton, ay as PhotoCamera, r as Chip, e as TextField, a9 as FormControl, aa as InputLabel, ab as Select, M as MenuItem, a as Button, V as VisibilityOff, h as Visibility, x as List, y as ListItem, z as ListItemIcon, H as ListItemText, az as ListItemSecondaryAction, s as Switch, D as Divider, J as Security, d as Alert, at as Download, aA as DeleteIcon, au as Dialog, av as DialogTitle, aw as DialogContent, $ as WarningIcon, ax as DialogActions, aB as Notifications } from "./mui-Cc0LuBKd.js";
import { e as useLocation, u as useNavigate, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { u as useAuth, c as api, e as endpoints, d as apiUtils, b as authService } from "./index-D9ISUMgg.js";
import "./stripe-CSTr_BWb.js";
const securitySettings = [
  {
    id: "two_factor",
    title: "Two-Factor Authentication",
    description: "Add an extra layer of security to your account",
    enabled: false,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
    type: "security"
  },
  {
    id: "email_notifications",
    title: "Email Notifications",
    description: "Receive email alerts for important account activities",
    enabled: true,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Notifications, {}),
    type: "notifications"
  },
  {
    id: "login_alerts",
    title: "Login Alerts",
    description: "Get notified when someone logs into your account",
    enabled: true,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
    type: "security"
  },
  {
    id: "data_export",
    title: "Data Export Access",
    description: "Allow downloading of your account data",
    enabled: true,
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
    type: "privacy"
  }
];
const SettingsPage = () => {
  var _a, _b, _c;
  const { user, refreshUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = reactExports.useState({
    firstName: (user == null ? void 0 : user.firstName) || "",
    lastName: (user == null ? void 0 : user.lastName) || "",
    email: (user == null ? void 0 : user.email) || "",
    company: "",
    jobTitle: "",
    phone: "",
    timezone: "UTC",
    language: "en"
  });
  const [security, setSecurity] = reactExports.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [settings, setSettings] = reactExports.useState(securitySettings);
  const [twoFA, setTwoFA] = reactExports.useState({});
  const [twoFADialog, setTwoFADialog] = reactExports.useState(false);
  const [twoFAToken, setTwoFAToken] = reactExports.useState("");
  const [showPasswords, setShowPasswords] = reactExports.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = reactExports.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = reactExports.useState("");
  const [deleteConfirmEmail, setDeleteConfirmEmail] = reactExports.useState("");
  const [deleteReason, setDeleteReason] = reactExports.useState("");
  const [activeTab, setActiveTab] = reactExports.useState("profile");
  const [kyc, setKyc] = reactExports.useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    countryOfResidence: "",
    phoneNumber: "",
    governmentIdType: "",
    governmentIdNumber: "",
    governmentIdCountry: "",
    governmentIdExpiry: ""
  });
  const kycStatus = String((user == null ? void 0 : user.kycStatus) || "").toUpperCase();
  reactExports.useEffect(() => {
    const hash = (location.hash || "").replace("#", "").toLowerCase();
    if (hash && ["profile", "security", "notifications", "privacy", "compliance", "danger"].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);
  const selectTab = (id) => {
    setActiveTab(id);
    const url = `${location.pathname}#${id}`;
    navigate(url, { replace: true });
  };
  const handleProfileUpdate = () => __async(void 0, null, function* () {
    try {
      const fullName = `${(profile.firstName || "").trim()} ${(profile.lastName || "").trim()}`.trim();
      if (!fullName) {
        enqueueSnackbar("Please provide your first and last name", { variant: "warning" });
        return;
      }
      yield authService.updateProfile({ name: fullName });
      yield refreshUser();
      enqueueSnackbar("Profile updated successfully", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(e.message || "Failed to update profile", { variant: "error" });
    }
  });
  const handlePasswordChange = () => __async(void 0, null, function* () {
    if (!security.currentPassword || !security.newPassword) {
      enqueueSnackbar("Please fill in all password fields", { variant: "warning" });
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return;
    }
    try {
      yield authService.changePassword(security.currentPassword, security.newPassword);
      enqueueSnackbar("Password changed successfully", { variant: "success" });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      enqueueSnackbar(e.message || "Failed to change password", { variant: "error" });
    }
  });
  const persistNotificationPreferences = (nextSettings) => __async(void 0, null, function* () {
    var _a2, _b2;
    try {
      const emailNotifications = !!((_a2 = nextSettings.find((s) => s.id === "email_notifications")) == null ? void 0 : _a2.enabled);
      const securityAlerts = !!((_b2 = nextSettings.find((s) => s.id === "login_alerts")) == null ? void 0 : _b2.enabled);
      yield apiUtils.withLoading(() => __async(void 0, null, function* () {
        return api.put(endpoints.users.notifications(), {
          emailNotifications,
          securityAlerts
        });
      }));
      enqueueSnackbar("Notification preferences saved", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(e.message || "Failed to save notification preferences", { variant: "error" });
    }
  });
  const handleSettingToggle = (settingId) => {
    setSettings((prev) => {
      const next = prev.map((setting) => setting.id === settingId ? __spreadProps(__spreadValues({}, setting), { enabled: !setting.enabled }) : setting);
      void persistNotificationPreferences(next);
      return next;
    });
  };
  const handleEnable2FA = () => __async(void 0, null, function* () {
    try {
      const init = yield authService.twoFASetupInitiate();
      setTwoFA({ qr: init.qrCodeDataUrl, secret: init.secret, enabled: false });
      setTwoFADialog(true);
    } catch (e) {
      enqueueSnackbar(e.message || "Failed to start 2FA setup", { variant: "error" });
    }
  });
  const handleVerify2FA = () => __async(void 0, null, function* () {
    try {
      const res = yield authService.twoFASetupVerify(twoFAToken.trim());
      setTwoFA((prev) => __spreadProps(__spreadValues({}, prev), { enabled: true, backupCodes: res.backupCodes }));
      enqueueSnackbar("Two-factor authentication enabled", { variant: "success" });
      setTwoFADialog(false);
    } catch (e) {
      enqueueSnackbar(e.message || "Invalid code", { variant: "error" });
    }
  });
  const handleDisable2FA = () => __async(void 0, null, function* () {
    try {
      yield authService.twoFADisable();
      setTwoFA({ enabled: false });
      enqueueSnackbar("Two-factor authentication disabled", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(e.message || "Failed to disable 2FA", { variant: "error" });
    }
  });
  const handleDeleteAccount = () => __async(void 0, null, function* () {
    try {
      yield api.post(endpoints.users.requestDeletion(), { reason: deleteReason, confirmEmail: deleteConfirmEmail });
      enqueueSnackbar("Account deletion request submitted. Please check your email.", { variant: "warning" });
      setDeleteDialogOpen(false);
      setDeleteConfirmText("");
      setDeleteConfirmEmail("");
      setDeleteReason("");
    } catch (e) {
      enqueueSnackbar(e.message || "Failed to request account deletion", { variant: "error" });
    }
  });
  const TabButton = ({ id, label, isActive }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: isActive ? "contained" : "outlined",
      onClick: () => selectTab(id),
      sx: __spreadValues({
        mr: 1,
        mb: 1
      }, isActive && {
        background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
        color: "#000"
      }),
      children: label
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700, mb: 1 }, children: "Account Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "Manage your account preferences and security settings" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { id: "profile", label: "Profile", isActive: activeTab === "profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { id: "security", label: "Security", isActive: activeTab === "security" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { id: "notifications", label: "Notifications", isActive: activeTab === "notifications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { id: "privacy", label: "Privacy", isActive: activeTab === "privacy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { id: "compliance", label: "Compliance", isActive: activeTab === "compliance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { id: "danger", label: "Danger Zone", isActive: activeTab === "danger" })
    ] }) }),
    activeTab === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          sx: {
            p: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { position: "relative", display: "inline-block", mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Avatar,
                {
                  sx: {
                    width: 120,
                    height: 120,
                    fontSize: "3rem",
                    bgcolor: "primary.main"
                  },
                  children: [
                    (_a = user == null ? void 0 : user.firstName) == null ? void 0 : _a[0],
                    (_b = user == null ? void 0 : user.lastName) == null ? void 0 : _b[0]
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  sx: {
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "primary.main",
                    color: "#000",
                    "&:hover": { bgcolor: "primary.dark" }
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhotoCamera, {})
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: [
              profile.firstName,
              " ",
              profile.lastName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: profile.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: ((_c = user == null ? void 0 : user.subscription) == null ? void 0 : _c.tier) || "Pro",
                color: "primary",
                sx: { mt: 1 }
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          sx: {
            p: 4,
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Personal Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "First Name",
                  value: profile.firstName,
                  onChange: (e) => setProfile((prev) => __spreadProps(__spreadValues({}, prev), { firstName: e.target.value }))
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Last Name",
                  value: profile.lastName,
                  onChange: (e) => setProfile((prev) => __spreadProps(__spreadValues({}, prev), { lastName: e.target.value }))
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Email Address",
                  value: profile.email,
                  onChange: (e) => setProfile((prev) => __spreadProps(__spreadValues({}, prev), { email: e.target.value })),
                  disabled: true,
                  helperText: "Contact support to change your email address"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Company",
                  value: profile.company,
                  onChange: (e) => setProfile((prev) => __spreadProps(__spreadValues({}, prev), { company: e.target.value }))
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Job Title",
                  value: profile.jobTitle,
                  onChange: (e) => setProfile((prev) => __spreadProps(__spreadValues({}, prev), { jobTitle: e.target.value }))
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Phone Number",
                  value: profile.phone,
                  onChange: (e) => setProfile((prev) => __spreadProps(__spreadValues({}, prev), { phone: e.target.value }))
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { id: "timezone-select-label", children: "Timezone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    labelId: "timezone-select-label",
                    id: "timezone-select",
                    value: profile.timezone,
                    label: "Timezone",
                    onChange: (e) => setProfile((prev) => __spreadProps(__spreadValues({}, prev), { timezone: e.target.value })),
                    inputProps: {
                      "aria-label": "Select timezone",
                      title: "Select your timezone",
                      name: "timezone"
                    },
                    "aria-labelledby": "timezone-select-label",
                    title: "Select your timezone",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "UTC", children: "UTC" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "America/New_York", children: "Eastern Time" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "America/Chicago", children: "Central Time" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "America/Denver", children: "Mountain Time" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "America/Los_Angeles", children: "Pacific Time" })
                    ]
                  }
                )
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 4, display: "flex", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  onClick: handleProfileUpdate,
                  sx: {
                    background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                    color: "#000"
                  },
                  children: "Save Changes"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", children: "Cancel" })
            ] })
          ]
        }
      ) })
    ] }) }),
    activeTab === "security" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          sx: {
            p: 4,
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Change Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Current Password",
                  type: showPasswords ? "text" : "password",
                  value: security.currentPassword,
                  onChange: (e) => setSecurity((prev) => __spreadProps(__spreadValues({}, prev), { currentPassword: e.target.value })),
                  InputProps: {
                    endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      IconButton,
                      {
                        onClick: () => setShowPasswords(!showPasswords),
                        edge: "end",
                        children: showPasswords ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                      }
                    )
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "New Password",
                  type: showPasswords ? "text" : "password",
                  value: security.newPassword,
                  onChange: (e) => setSecurity((prev) => __spreadProps(__spreadValues({}, prev), { newPassword: e.target.value }))
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  label: "Confirm New Password",
                  type: showPasswords ? "text" : "password",
                  value: security.confirmPassword,
                  onChange: (e) => setSecurity((prev) => __spreadProps(__spreadValues({}, prev), { confirmPassword: e.target.value }))
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: handlePasswordChange,
                sx: {
                  mt: 3,
                  background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
                  color: "#000"
                },
                children: "Update Password"
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          sx: {
            p: 4,
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Security Settings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { children: [
              settings.filter((s) => s.type === "security").map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: setting.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: setting.title,
                    secondary: setting.description
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: setting.enabled,
                    onChange: () => handleSettingToggle(setting.id),
                    color: "primary"
                  }
                ) })
              ] }, setting.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: "Two-Factor Authentication (TOTP)",
                    secondary: twoFA.enabled ? "Enabled" : "Disabled"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: twoFA.enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", color: "error", onClick: handleDisable2FA, children: "Disable" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: handleEnable2FA, sx: { background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)", color: "#000" }, children: "Enable" }) })
              ] })
            ] })
          ]
        }
      ) })
    ] }) }),
    activeTab === "notifications" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        sx: {
          p: 4,
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Notification Preferences" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: settings.filter((s) => s.type === "notifications").map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: setting.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: setting.title,
                secondary: setting.description
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: setting.enabled,
                onChange: () => handleSettingToggle(setting.id),
                color: "primary"
              }
            ) })
          ] }, setting.id)) })
        ]
      }
    ) }),
    activeTab === "privacy" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        sx: {
          p: 4,
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3 }, children: "Privacy & Data Controls" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: settings.filter((s) => s.type === "privacy").map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { px: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: setting.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: setting.title,
                secondary: setting.description
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: setting.enabled,
                onChange: () => handleSettingToggle(setting.id),
                color: "primary"
              }
            ) })
          ] }, setting.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 3 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Data Export:" }),
            " You can download a copy of your data at any time. This includes your profile information, license history, and usage analytics."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
              sx: { mr: 2 },
              onClick: () => __async(void 0, null, function* () {
                var _a2, _b2, _c2, _d;
                try {
                  const res = yield api.post(endpoints.users.exportData());
                  if (!((_a2 = res.data) == null ? void 0 : _a2.success)) throw new Error(((_b2 = res.data) == null ? void 0 : _b2.message) || "Export failed");
                  const userData = (_d = (_c2 = res.data.data) == null ? void 0 : _c2.userData) != null ? _d : res.data.data;
                  const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "user-data.json";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                  enqueueSnackbar("Data export ready", { variant: "success" });
                } catch (e) {
                  enqueueSnackbar(e.message || "Failed to export data", { variant: "error" });
                }
              }),
              children: "Export My Data"
            }
          )
        ]
      }
    ) }),
    activeTab === "compliance" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        sx: {
          p: 4,
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          mb: 3
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 1 }, children: "Identity Verification (KYC)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: kycStatus === "COMPLETED" ? "success" : "warning", sx: { mb: 2 }, children: [
            "Status: ",
            kycStatus || "PENDING"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "First Name", value: kyc.firstName, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { firstName: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "Last Name", value: kyc.lastName, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { lastName: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, type: "date", label: "Date of Birth", InputLabelProps: { shrink: true }, value: kyc.dateOfBirth, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { dateOfBirth: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "Nationality (ISO alpha-2)", placeholder: "US", value: kyc.nationality, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { nationality: e.target.value.toUpperCase() })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "Country of Residence (ISO alpha-2)", placeholder: "US", value: kyc.countryOfResidence, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { countryOfResidence: e.target.value.toUpperCase() })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "Phone Number", value: kyc.phoneNumber, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { phoneNumber: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "Government ID Type (optional)", value: kyc.governmentIdType, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { governmentIdType: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "Government ID Number (optional)", value: kyc.governmentIdNumber, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { governmentIdNumber: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, label: "Government ID Country (ISO alpha-2)", value: kyc.governmentIdCountry, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { governmentIdCountry: e.target.value.toUpperCase() })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, type: "date", label: "Government ID Expiry (optional)", InputLabelProps: { shrink: true }, value: kyc.governmentIdExpiry, onChange: (e) => setKyc(__spreadProps(__spreadValues({}, kyc), { governmentIdExpiry: e.target.value })) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 3, display: "flex", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                onClick: () => __async(void 0, null, function* () {
                  try {
                    yield apiUtils.withLoading(() => __async(void 0, null, function* () {
                      return api.post(endpoints.users.kycVerify(), kyc);
                    }));
                    enqueueSnackbar("KYC submitted successfully", { variant: "success" });
                  } catch (e) {
                    enqueueSnackbar(e.message || "Failed to submit KYC", { variant: "error" });
                  }
                }),
                sx: { background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)", color: "#000" },
                children: "Submit Verification"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", onClick: () => setKyc({
              firstName: "",
              lastName: "",
              dateOfBirth: "",
              nationality: "",
              countryOfResidence: "",
              phoneNumber: "",
              governmentIdType: "",
              governmentIdNumber: "",
              governmentIdCountry: "",
              governmentIdExpiry: ""
            }), children: "Clear" })
          ] })
        ]
      }
    ) }),
    activeTab === "danger" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        sx: {
          p: 4,
          background: "linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(244, 67, 54, 0.2)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 3, color: "error.main" }, children: "Danger Zone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Warning:" }),
            " These actions are irreversible. Please proceed with caution."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, border: "1px solid", borderColor: "error.main", borderRadius: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600, mb: 1 }, children: "Delete Account" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Permanently delete your account and all associated data. This action cannot be undone." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                color: "error",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
                onClick: () => setDeleteDialogOpen(true),
                children: "Delete My Account"
              }
            )
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: deleteDialogOpen,
        onClose: () => setDeleteDialogOpen(false),
        PaperProps: {
          sx: {
            backgroundColor: "background.paper",
            border: "1px solid rgba(244, 67, 54, 0.2)"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: { color: "error.main" }, children: "Delete Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: "This action is permanent and cannot be undone." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { mb: 2 }, children: "Are you sure you want to delete your account? This will:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "error" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Permanently delete all your data" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "error" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Cancel all active subscriptions" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "error" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "Revoke all license keys" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Type 'DELETE' to confirm",
                sx: { mt: 2 },
                placeholder: "DELETE",
                value: deleteConfirmText,
                onChange: (e) => setDeleteConfirmText(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Confirm your email",
                sx: { mt: 2 },
                placeholder: user == null ? void 0 : user.email,
                value: deleteConfirmEmail,
                onChange: (e) => setDeleteConfirmEmail(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Reason (optional)",
                sx: { mt: 2 },
                multiline: true,
                minRows: 2,
                value: deleteReason,
                onChange: (e) => setDeleteReason(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDeleteDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: handleDeleteAccount,
                color: "error",
                variant: "contained",
                disabled: deleteConfirmText !== "DELETE" || (deleteConfirmEmail || "").toLowerCase() !== ((user == null ? void 0 : user.email) || "").toLowerCase(),
                children: "Delete Account"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: twoFADialog,
        onClose: () => setTwoFADialog(false),
        PaperProps: {
          sx: { backgroundColor: "background.paper", border: "1px solid rgba(255, 255, 255, 0.1)" }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Set up Two-Factor Authentication" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Scan the QR code with Google Authenticator, Authy, or another TOTP app. Then enter the 6-digit code to confirm." }),
            twoFA.qr && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: twoFA.qr, alt: "2FA QR Code", width: 200, height: 200 }) }),
            twoFA.secret && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mb: 2 }, children: [
              "Secret: ",
              twoFA.secret
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Authentication code",
                value: twoFAToken,
                onChange: (e) => setTwoFAToken(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setTwoFADialog(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: handleVerify2FA, sx: { background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)", color: "#000" }, children: "Verify & Enable" })
          ] })
        ]
      }
    )
  ] });
};
export {
  SettingsPage as default
};
