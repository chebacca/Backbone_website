const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/firebase-ddg95FKg.js","assets/index-CapzkfpX.js","assets/mui-BoeRORKC.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-Luo-7hoF.js","assets/index-COak77tQ.css","assets/index.esm-zVCMB3Cx.js","assets/index.esm-CjtNHFZy.js","assets/index.esm-D5-7iBdy.js"])))=>i.map(i=>d[i]);
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
import { _ as __vitePreload } from "./index-CapzkfpX.js";
import { j as jsxRuntimeExports, B as Box, T as Typography, G as Grid, t as Card, v as CardContent, e as TextField, a as Button, C as CircularProgress, bB as PersonAddIcon, R as RefreshIcon, w as List, x as ListItem, r as Chip, D as Divider, o as ErrorIcon, p as CheckCircleIcon } from "./mui-BoeRORKC.js";
import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { u as useOrganizationLicenses, a as useOrganizationTeamMembers, b as useCurrentUser, c as useOrganizationContext } from "./useStreamlinedData-BnsEoiA1.js";
import "./stripe-Luo-7hoF.js";
import "./UnifiedDataService-CpI3FjvA.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./FirestoreCollectionManager-BmICfP04.js";
import "./firebase-ddg95FKg.js";
import "./index.esm-D5-7iBdy.js";
const TestTeamMemberCreation = () => {
  var _a;
  const { enqueueSnackbar } = useSnackbar();
  const [testResults, setTestResults] = reactExports.useState([]);
  const [isRunning, setIsRunning] = reactExports.useState(false);
  const [testEmail, setTestEmail] = reactExports.useState("");
  const { data: licenses, refetch: refetchLicenses } = useOrganizationLicenses();
  const { data: teamMembers, refetch: refetchTeamMembers } = useOrganizationTeamMembers();
  useCurrentUser();
  const { data: organization } = useOrganizationContext();
  reactExports.useEffect(() => {
    setTestEmail(`test.team.member.${Date.now()}@example.com`);
  }, []);
  const addTestResult = (step, status, message, data) => {
    const result = {
      step,
      status,
      message,
      data,
      timestamp: /* @__PURE__ */ new Date()
    };
    setTestResults((prev) => [...prev, result]);
  };
  const getAuthToken = () => __async(void 0, null, function* () {
    try {
      const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { auth: auth2 } = yield import("./firebase-ddg95FKg.js").then((n) => n.f);
        return { auth: auth2 };
      }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
      const user = auth.currentUser;
      if (user) {
        return yield user.getIdToken();
      }
    } catch (error) {
      console.warn("Failed to get Firebase Auth token:", error);
    }
    return localStorage.getItem("authToken") || "placeholder-token";
  });
  const testStep1_InitialState = () => __async(void 0, null, function* () {
    addTestResult("Initial State", "pending", "Checking initial state...");
    try {
      yield refetchLicenses();
      yield refetchTeamMembers();
      const availableLicenses = (licenses == null ? void 0 : licenses.filter(
        (l) => (l.status === "ACTIVE" || l.status === "PENDING") && !l.assignedTo
      )) || [];
      const currentTeamMembers = teamMembers || [];
      addTestResult(
        "Initial State",
        "success",
        `Found ${availableLicenses.length} available licenses and ${currentTeamMembers.length} team members`,
        { availableLicenses, currentTeamMembers }
      );
      return { availableLicenses, currentTeamMembers };
    } catch (error) {
      addTestResult("Initial State", "error", `Failed to get initial state: ${error}`);
      throw error;
    }
  });
  const testStep2_CreateTeamMember = (availableLicenses) => __async(void 0, null, function* () {
    var _a2, _b;
    addTestResult("Create Team Member", "pending", "Creating team member via API...");
    try {
      const apiBaseUrl = window.location.hostname === "localhost" ? "http://localhost:5001/backbone-logic/us-central1/api" : "https://us-central1-backbone-logic.cloudfunctions.net/api";
      const response = yield fetch(`${apiBaseUrl}/team-members/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${yield getAuthToken()}`
        },
        body: JSON.stringify({
          email: testEmail,
          firstName: "Test",
          lastName: "TeamMember",
          department: "Engineering",
          position: "Developer",
          phone: "+1234567890",
          role: "MEMBER",
          licenseType: ((_a2 = availableLicenses[0]) == null ? void 0 : _a2.tier) || "PROFESSIONAL",
          organizationId: ((_b = organization == null ? void 0 : organization.organization) == null ? void 0 : _b.id) || "enterprise-media-org",
          temporaryPassword: "TestPassword123!",
          sendWelcomeEmail: false
        })
      });
      const result = yield response.json();
      if (response.ok && result.success) {
        addTestResult(
          "Create Team Member",
          "success",
          `Team member created successfully: ${result.data.email}`,
          result.data
        );
        return result.data;
      } else {
        addTestResult(
          "Create Team Member",
          "error",
          `API error: ${result.error || "Unknown error"}`,
          result
        );
        throw new Error(result.error || "API error");
      }
    } catch (error) {
      addTestResult("Create Team Member", "error", `Failed to create team member: ${error}`);
      throw error;
    }
  });
  const testStep3_VerifyCreation = (createdMember) => __async(void 0, null, function* () {
    addTestResult("Verify Creation", "pending", "Verifying team member was created...");
    try {
      yield refetchTeamMembers();
      const updatedTeamMembers = teamMembers || [];
      const foundMember = updatedTeamMembers.find((member) => member.email === testEmail);
      if (foundMember) {
        addTestResult(
          "Verify Creation",
          "success",
          `Team member found in database: ${foundMember.email}`,
          foundMember
        );
        return foundMember;
      } else {
        addTestResult("Verify Creation", "error", "Team member not found in database");
        throw new Error("Team member not found");
      }
    } catch (error) {
      addTestResult("Verify Creation", "error", `Failed to verify creation: ${error}`);
      throw error;
    }
  });
  const testStep4_VerifyLicenseAssignment = () => __async(void 0, null, function* () {
    addTestResult("Verify License Assignment", "pending", "Verifying license was assigned...");
    try {
      yield refetchLicenses();
      const updatedLicenses = licenses || [];
      const assignedLicense = updatedLicenses.find(
        (license) => license.assignedTo && license.assignedTo.email === testEmail
      );
      if (assignedLicense) {
        addTestResult(
          "Verify License Assignment",
          "success",
          `License assigned: ${assignedLicense.id} (${assignedLicense.tier})`,
          assignedLicense
        );
        return assignedLicense;
      } else {
        addTestResult("Verify License Assignment", "error", "No license assigned to team member");
        throw new Error("License not assigned");
      }
    } catch (error) {
      addTestResult("Verify License Assignment", "error", `Failed to verify license assignment: ${error}`);
      throw error;
    }
  });
  const testStep5_VerifyCounts = (initialState) => __async(void 0, null, function* () {
    addTestResult("Verify Counts", "pending", "Verifying license and team member counts...");
    try {
      yield refetchLicenses();
      yield refetchTeamMembers();
      const finalLicenses = licenses || [];
      const finalTeamMembers = teamMembers || [];
      const availableLicensesBefore = initialState.availableLicenses.length;
      const availableLicensesAfter = finalLicenses.filter((l) => !l.assignedTo).length;
      const teamMembersBefore = initialState.currentTeamMembers.length;
      const teamMembersAfter = finalTeamMembers.length;
      const licenseCountDecreased = availableLicensesAfter === availableLicensesBefore - 1;
      const teamMemberCountIncreased = teamMembersAfter === teamMembersBefore + 1;
      if (licenseCountDecreased && teamMemberCountIncreased) {
        addTestResult(
          "Verify Counts",
          "success",
          `Counts verified: Licenses ${availableLicensesBefore} → ${availableLicensesAfter}, Team Members ${teamMembersBefore} → ${teamMembersAfter}`,
          { availableLicensesBefore, availableLicensesAfter, teamMembersBefore, teamMembersAfter }
        );
      } else {
        addTestResult(
          "Verify Counts",
          "error",
          `Count verification failed: License decrease: ${licenseCountDecreased}, Team member increase: ${teamMemberCountIncreased}`,
          { availableLicensesBefore, availableLicensesAfter, teamMembersBefore, teamMembersAfter }
        );
      }
    } catch (error) {
      addTestResult("Verify Counts", "error", `Failed to verify counts: ${error}`);
    }
  });
  const runCompleteTest = () => __async(void 0, null, function* () {
    setIsRunning(true);
    setTestResults([]);
    try {
      enqueueSnackbar("Starting comprehensive team member creation test...", { variant: "info" });
      const initialState = yield testStep1_InitialState();
      const createdMember = yield testStep2_CreateTeamMember(initialState.availableLicenses);
      const verifiedMember = yield testStep3_VerifyCreation(createdMember);
      const assignedLicense = yield testStep4_VerifyLicenseAssignment();
      yield testStep5_VerifyCounts(initialState);
      enqueueSnackbar("Test completed successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(`Test failed: ${error}`, { variant: "error" });
    } finally {
      setIsRunning(false);
    }
  });
  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" });
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, { color: "error" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 });
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "error";
      default:
        return "default";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, maxWidth: 1200, mx: "auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "🧪 Team Member Creation Test" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 3 }, children: "This page tests the complete team member creation flow including license consumption." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Test Configuration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Test Email",
            value: testEmail,
            onChange: (e) => setTestEmail(e.target.value),
            sx: { mb: 2 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            fullWidth: true,
            variant: "contained",
            onClick: runCompleteTest,
            disabled: isRunning,
            startIcon: isRunning ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, {}),
            sx: { mb: 2 },
            children: isRunning ? "Running Test..." : "Run Complete Test"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            fullWidth: true,
            variant: "outlined",
            onClick: () => setTestResults([]),
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
            children: "Clear Results"
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Current State" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            "Available Licenses: ",
            (licenses == null ? void 0 : licenses.filter((l) => !l.assignedTo).length) || 0
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            "Team Members: ",
            (teamMembers == null ? void 0 : teamMembers.length) || 0
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            "Organization: ",
            ((_a = organization == null ? void 0 : organization.organization) == null ? void 0 : _a.name) || "Unknown"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            fullWidth: true,
            variant: "outlined",
            onClick: () => {
              refetchLicenses();
              refetchTeamMembers();
            },
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
            children: "Refresh Data"
          }
        )
      ] }) }) })
    ] }),
    testResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mt: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Test Results" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: testResults.map((result, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", width: "100%" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mr: 2 }, children: getStatusIcon(result.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: result.step }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: result.message }),
            result.data && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", component: "pre", sx: { mt: 1, fontSize: "0.75rem" }, children: JSON.stringify(result.data, null, 2) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: result.status,
              color: getStatusColor(result.status),
              size: "small"
            }
          )
        ] }) }),
        index < testResults.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
      ] }, index)) })
    ] }) })
  ] });
};
export {
  TestTeamMemberCreation as default
};
