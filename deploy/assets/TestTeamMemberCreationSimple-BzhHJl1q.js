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
import { j as jsxRuntimeExports, B as Box, d as Alert, T as Typography, a as Button, C as CircularProgress, t as Card, w as CardContent, c as Paper } from "./mui-DKIosbOx.js";
import { r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { u as useAuth } from "./index-CDEjieLs.js";
import "./stripe-CqWXfGEZ.js";
const TestTeamMemberCreationSimple = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useAuth();
  const orgContext = currentUser ? {
    id: currentUser.organizationId || "enterprise-media-org",
    name: currentUser.organizationName || "Enterprise Media",
    tier: "ENTERPRISE"
  } : null;
  const [testResults, setTestResults] = reactExports.useState([]);
  const [isRunning, setIsRunning] = reactExports.useState(false);
  const [testEmail, setTestEmail] = reactExports.useState("");
  reactExports.useEffect(() => {
    setTestEmail(`test.team.member.${Date.now()}@example.com`);
  }, []);
  const addTestResult = (step, status, message, data) => {
    setTestResults((prev) => [...prev, { step, status, message, data }]);
  };
  const runTest = () => __async(void 0, null, function* () {
    var _a, _b, _c, _d, _e;
    if (!currentUser || !orgContext) {
      enqueueSnackbar("Please log in as an organization admin to run this test", { variant: "error" });
      return;
    }
    setIsRunning(true);
    setTestResults([]);
    try {
      addTestResult("initial-state", "pending", "Getting initial state...");
      const token = yield currentUser.getIdToken();
      const orgId = orgContext.id;
      const licensesResponse = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/licenses?organizationId=${orgId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!licensesResponse.ok) {
        throw new Error(`Failed to get licenses: ${licensesResponse.status}`);
      }
      const licenses = yield licensesResponse.json();
      const initialLicenseCount = ((_a = licenses.data) == null ? void 0 : _a.length) || 0;
      const teamMembersResponse = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/team-members?organizationId=${orgId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!teamMembersResponse.ok) {
        throw new Error(`Failed to get team members: ${teamMembersResponse.status}`);
      }
      const teamMembers = yield teamMembersResponse.json();
      const initialTeamCount = ((_b = teamMembers.data) == null ? void 0 : _b.length) || 0;
      addTestResult("initial-state", "success", `Found ${initialLicenseCount} licenses and ${initialTeamCount} team members`);
      addTestResult("create-team-member", "pending", "Creating test team member...");
      const createResponse = yield fetch("https://us-central1-backbone-logic.cloudfunctions.net/api/team-members/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: testEmail,
          firstName: "Test",
          lastName: "User",
          phone: "+1234567890",
          department: "Testing",
          position: "Test Engineer",
          role: "MEMBER",
          licenseType: "PROFESSIONAL",
          temporaryPassword: "TestPassword123!",
          activateImmediately: true,
          sendWelcomeEmail: false
        })
      });
      if (!createResponse.ok) {
        const errorText = yield createResponse.text();
        throw new Error(`Failed to create team member: ${createResponse.status} - ${errorText}`);
      }
      const createResult = yield createResponse.json();
      addTestResult("create-team-member", "success", `Team member created: ${(_c = createResult.data) == null ? void 0 : _c.email}`, createResult.data);
      addTestResult("verify-state", "pending", "Verifying final state...");
      const updatedLicensesResponse = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/licenses?organizationId=${orgId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const updatedLicenses = yield updatedLicensesResponse.json();
      const finalLicenseCount = ((_d = updatedLicenses.data) == null ? void 0 : _d.length) || 0;
      const updatedTeamMembersResponse = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/team-members?organizationId=${orgId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const updatedTeamMembers = yield updatedTeamMembersResponse.json();
      const finalTeamCount = ((_e = updatedTeamMembers.data) == null ? void 0 : _e.length) || 0;
      addTestResult("verify-state", "success", `Final state: ${finalLicenseCount} licenses, ${finalTeamCount} team members`);
      const licenseConsumed = finalLicenseCount === initialLicenseCount - 1;
      const teamMemberAdded = finalTeamCount === initialTeamCount + 1;
      if (licenseConsumed && teamMemberAdded) {
        addTestResult("license-consumption", "success", "✅ License consumed and team member added successfully!");
        enqueueSnackbar("Test passed! Team member creation and license consumption working correctly", { variant: "success" });
      } else {
        addTestResult("license-consumption", "error", `❌ License consumption failed. License count: ${initialLicenseCount} → ${finalLicenseCount}, Team count: ${initialTeamCount} → ${finalTeamCount}`);
        enqueueSnackbar("Test failed! License consumption did not work as expected", { variant: "error" });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      addTestResult("error", "error", `❌ Test failed: ${errorMessage}`);
      enqueueSnackbar(`Test failed: ${errorMessage}`, { variant: "error" });
    } finally {
      setIsRunning(false);
    }
  });
  if (!currentUser || !orgContext) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", children: "Please log in as an organization admin to run this test." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "Simple Team Member Creation Test" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { mb: 3 }, children: "This test verifies that the team member creation process works correctly and consumes a license." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          color: "primary",
          onClick: runTest,
          disabled: isRunning,
          startIcon: isRunning ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : null,
          sx: { mr: 2 },
          children: isRunning ? "Running Test..." : "Run Test"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          color: "secondary",
          onClick: () => setTestResults([]),
          disabled: isRunning,
          children: "Clear Results"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Test Results" }),
    testResults.length === 0 && !isRunning && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: 'Click "Run Test" to start the test.' }),
    testResults.map((result, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mr: 2 }, children: result.step }),
        result.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }),
        result.status === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "success.main", children: "✅" }),
        result.status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "error.main", children: "❌" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: result.message }),
      result.data && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", component: "pre", sx: {
        backgroundColor: "grey.100",
        p: 1,
        borderRadius: 1,
        fontSize: "0.75rem",
        overflow: "auto"
      }, children: JSON.stringify(result.data, null, 2) }) })
    ] }) }, index)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { elevation: 2, sx: { mt: 3, p: 2, backgroundColor: "grey.50" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Test Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: testEmail })
    ] })
  ] });
};
export {
  TestTeamMemberCreationSimple as default
};
