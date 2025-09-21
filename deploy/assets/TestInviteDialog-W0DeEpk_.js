const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/firebase-B_5U3h2Y.js","assets/index-DPkTu3FI.js","assets/mui-DKIosbOx.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-CqWXfGEZ.js","assets/index-COak77tQ.css","assets/index.esm-zVCMB3Cx.js","assets/index.esm-CjtNHFZy.js","assets/index.esm-D5-7iBdy.js"])))=>i.map(i=>d[i]);
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
import { j as jsxRuntimeExports, a4 as Dialog, a5 as DialogTitle, B as Box, bG as PersonAddIcon, T as Typography, g as IconButton, a6 as CloseIcon, a7 as DialogContent, G as Grid, e as TextField, I as InputAdornment, E as EmailIcon, aj as FormControl, ak as InputLabel, al as Select, M as MenuItem, V as VisibilityOff, h as Visibility, a as Button, aD as DialogActions, C as CircularProgress } from "./mui-DKIosbOx.js";
import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { _ as __vitePreload } from "./index-DPkTu3FI.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import "./stripe-CqWXfGEZ.js";
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
      const { auth, db } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { auth: auth2, db: db2 } = yield import("./firebase-B_5U3h2Y.js").then((n) => n.f);
        return { auth: auth2, db: db2 };
      }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
      const { collection, addDoc, getDocs, query, where } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { collection: collection2, addDoc: addDoc2, getDocs: getDocs2, query: query2, where: where2 } = yield import("./index.esm-CjtNHFZy.js");
        return { collection: collection2, addDoc: addDoc2, getDocs: getDocs2, query: query2, where: where2 };
      }), true ? __vite__mapDeps([7,6]) : void 0);
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }
      const currentUser2 = auth.currentUser;
      const organizationId = ((_a = organization == null ? void 0 : organization.organization) == null ? void 0 : _a.id) || (organization == null ? void 0 : organization.id);
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }
      const teamMemberData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        department: formData.department || "",
        position: formData.position || "",
        phone: formData.phone || "",
        organizationId,
        createdBy: currentUser2.uid,
        createdByEmail: currentUser2.email,
        status: "PENDING",
        // New team member starts as pending
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        // Store temporary password (in real app, this would be sent via email)
        temporaryPassword: formData.password,
        // License assignment will be handled separately
        assignedLicenseId: null,
        assignedLicenseKey: null
      };
      const teamMemberRef = yield addDoc(collection(db, "teamMembers"), teamMemberData);
      const userData = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        organizationId,
        isTeamMember: true,
        memberRole: formData.role,
        memberStatus: "PENDING",
        createdBy: currentUser2.uid,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        // Store temporary password
        temporaryPassword: formData.password,
        // Firebase Auth will be created separately
        firebaseUid: null,
        // Will be set when they first log in
        emailVerified: false
      };
      yield addDoc(collection(db, "users"), userData);
      const result = __spreadValues({
        id: teamMemberRef.id
      }, teamMemberData);
      enqueueSnackbar("Team member created successfully!", { variant: "success" });
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Error creating team member:", error);
      enqueueSnackbar(`Failed to create team member: ${(error == null ? void 0 : error.message) || "Unknown error"}`, { variant: "error" });
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: onClose, size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { component: "form", sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "First Name",
              value: formData.firstName,
              onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { firstName: e.target.value })),
              error: !!errors.firstName,
              helperText: errors.firstName,
              required: true,
              inputProps: {
                autoComplete: "given-name"
              }
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
              required: true,
              inputProps: {
                autoComplete: "family-name"
              }
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
              inputProps: {
                autoComplete: "email"
              },
              InputProps: {
                startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailIcon, {}) })
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
              onChange: (e) => setFormData((prev) => __spreadProps(__spreadValues({}, prev), { phone: e.target.value })),
              inputProps: {
                autoComplete: "tel"
              }
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
                inputProps: {
                  autoComplete: "new-password"
                },
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
const TestInviteDialog = () => {
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const mockUser = {
    id: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    role: "ADMIN"
  };
  const mockOrganization = {
    organization: {
      id: "test-org-123",
      name: "Test Organization",
      tier: "PROFESSIONAL"
    }
  };
  const mockLicenses = [
    {
      id: "license-1",
      key: "LIC-001",
      tier: "PROFESSIONAL",
      status: "ACTIVE",
      expiresAt: "2025-12-31T00:00:00.000Z"
    }
  ];
  const handleSuccess = (teamMember) => {
    console.log("✅ Test: Team member created successfully:", teamMember);
    setDialogOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "Test Enhanced Invite Team Member Dialog" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "contained",
        onClick: () => {
          console.log("🔍 Test: Opening dialog");
          setDialogOpen(true);
        },
        sx: { mb: 2 },
        children: "Open Invite Dialog"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SimpleInviteTeamMemberDialog,
      {
        open: dialogOpen,
        onClose: () => {
          console.log("🔍 Test: Closing dialog");
          setDialogOpen(false);
        },
        onSuccess: handleSuccess,
        currentUser: mockUser,
        organization: mockOrganization,
        availableLicenses: mockLicenses
      }
    )
  ] });
};
export {
  TestInviteDialog as default
};
