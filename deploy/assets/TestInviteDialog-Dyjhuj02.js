import { j as jsxRuntimeExports, B as Box, T as Typography, a as Button } from "./mui-DBh4ciAv.js";
import { r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { S as SimpleInviteTeamMemberDialog } from "./SimpleInviteTeamMemberDialog-cY7m4T3G.js";
import "./index-DXvUaEvN.js";
import "./stripe-iYh_bQi1.js";
import "./notistack.esm-DLh02w5s.js";
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
