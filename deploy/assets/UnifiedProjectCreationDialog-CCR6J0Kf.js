const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CloudProjectIntegration-Ceg3mHeu.js","assets/index-_czX3gCs.js","assets/mui-Cc0LuBKd.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-CSTr_BWb.js","assets/index-COak77tQ.css"])))=>i.map(i=>d[i]);
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
import { j as jsxRuntimeExports, au as Dialog, av as DialogTitle, B as Box, bS as AddIcon, T as Typography, g as IconButton, bn as CloseIcon, aw as DialogContent, d as Alert, bZ as Stepper, b_ as Step, b$ as StepLabel, i as LinearProgress, ax as DialogActions, a as Button, G as Grid, t as Card, w as CardContent, r as Chip, aN as ComputerIcon, c0 as NetworkIcon, a7 as StorageIcon, D as Divider, F as FormControlLabel, s as Switch, c1 as Slider, c2 as FormGroup, e as TextField, a9 as FormControl, c3 as FormLabel, c4 as RadioGroup, c5 as Radio, N as CloudIcon, aa as InputLabel, ab as Select, M as MenuItem, L as Lock, Z as Business, bC as Public, c6 as FormHelperText } from "./mui-Cc0LuBKd.js";
import { r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { _ as __vitePreload } from "./index-_czX3gCs.js";
import { c as cloudProjectIntegration } from "./CloudProjectIntegration-Ceg3mHeu.js";
const _SimplifiedStartupSequencer = class _SimplifiedStartupSequencer {
  constructor() {
    __publicField(this, "listeners", []);
    __publicField(this, "state", {
      currentStep: "mode_selection",
      selectedMode: null,
      storageMode: "local",
      isAuthenticated: false,
      user: null,
      selectedProjectId: null,
      error: null,
      isLoading: false
    });
    this.initialize();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new _SimplifiedStartupSequencer();
    }
    return this.instance;
  }
  /**
   * Initialize the sequencer - check for existing state but keep it simple
   */
  initialize() {
    return __async(this, null, function* () {
      try {
        const existingAuth = this.checkExistingAuthentication();
        const savedMode = localStorage.getItem("preferredApplicationMode");
        const savedStorage = localStorage.getItem("preferredStorageMode");
        const isReset = sessionStorage.getItem("startup_reset") === "true";
        if (isReset) {
          sessionStorage.removeItem("startup_reset");
          this.updateState({
            currentStep: "mode_selection",
            selectedMode: null,
            storageMode: savedStorage || "local",
            isAuthenticated: false
          });
          return;
        }
        if (existingAuth.isValid && savedMode) {
          this.updateState({
            isAuthenticated: true,
            user: existingAuth.user,
            selectedMode: savedMode,
            storageMode: savedStorage || "local"
          });
          const lastProjectId = localStorage.getItem("lastProjectId");
          if (lastProjectId && this.validateProjectAccess(lastProjectId, savedMode)) {
            yield this.completeStartup(lastProjectId);
          } else {
            this.updateState({ currentStep: "project_selection" });
          }
        } else {
          this.updateState({
            currentStep: "mode_selection",
            storageMode: savedStorage || "local"
          });
        }
      } catch (error) {
        console.error("Startup initialization error:", error);
        this.updateState({
          error: "Failed to initialize application",
          currentStep: "mode_selection"
        });
      }
    });
  }
  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }
  /**
   * Get current state
   */
  getState() {
    return __spreadValues({}, this.state);
  }
  /**
   * Handle mode selection
   */
  selectMode(mode, storageMode = "local") {
    return __async(this, null, function* () {
      try {
        this.updateState({ isLoading: true, error: null });
        localStorage.setItem("preferredApplicationMode", mode);
        localStorage.setItem("preferredStorageMode", storageMode);
        this.updateState({
          selectedMode: mode,
          storageMode
        });
        if (mode === "shared_network") {
          try {
            const { cloudProjectIntegration: cloudProjectIntegration2 } = yield __vitePreload(() => __async(this, null, function* () {
              const { cloudProjectIntegration: cloudProjectIntegration3 } = yield import("./CloudProjectIntegration-Ceg3mHeu.js").then((n) => n.C);
              return { cloudProjectIntegration: cloudProjectIntegration3 };
            }), true ? __vite__mapDeps([0,1,2,3,4,5]) : void 0);
            const cloudHealthy = yield this.checkCloudHealth().catch(() => false);
            if (!cloudHealthy) {
              console.log("Cloud unreachable, but Edge mode not supported in web-only production");
            }
          } catch (edgeError) {
            console.warn("Edge discovery failed:", edgeError);
          }
        }
        if (this.isAuthRequired(mode, this.state.storageMode)) {
          if (this.state.isAuthenticated) {
            this.updateState({
              currentStep: "project_selection",
              isLoading: false
            });
          } else {
            this.updateState({
              currentStep: "authentication",
              isLoading: false
            });
          }
        } else {
          this.updateState({
            currentStep: "project_selection",
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Mode selection error:", error);
        this.updateState({
          error: "Failed to select mode",
          isLoading: false
        });
      }
    });
  }
  checkCloudHealth() {
    return __async(this, null, function* () {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort("timeout"), 1500);
        const cloudUrl = "/api";
        const response = yield fetch(`${cloudUrl}/health`, {
          signal: controller.signal,
          method: "GET"
        });
        clearTimeout(timeout);
        return response.ok;
      } catch (e) {
        return false;
      }
    });
  }
  /**
   * Handle authentication completion
   */
  onAuthenticationSuccess(user) {
    return __async(this, null, function* () {
      try {
        this.updateState({
          isAuthenticated: true,
          user,
          currentStep: "project_selection",
          error: null
        });
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("lastAuthTime", Date.now().toString());
      } catch (error) {
        console.error("Authentication success handling error:", error);
        this.updateState({
          error: "Failed to complete authentication"
        });
      }
    });
  }
  /**
   * Authenticate team member with email/password
   * This integrates with the CloudProjectIntegration service for team member validation
   */
  authenticateTeamMember(email, password) {
    return __async(this, null, function* () {
      try {
        this.updateState({ isLoading: true, error: null });
        const { cloudProjectIntegration: cloudProjectIntegration2 } = yield __vitePreload(() => __async(this, null, function* () {
          const { cloudProjectIntegration: cloudProjectIntegration3 } = yield import("./CloudProjectIntegration-Ceg3mHeu.js").then((n) => n.C);
          return { cloudProjectIntegration: cloudProjectIntegration3 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5]) : void 0);
        const validation = yield cloudProjectIntegration2.validateTeamMemberCredentials(email, password);
        if (!validation.isValid) {
          throw new Error(validation.error || "Invalid team member credentials");
        }
        const teamMemberUser = __spreadProps(__spreadValues({}, validation.teamMember), {
          isTeamMember: true,
          authenticationType: "team_member",
          projectAccess: validation.projectAccess || []
        });
        yield this.onAuthenticationSuccess(teamMemberUser);
      } catch (error) {
        console.error("Team member authentication error:", error);
        this.updateState({
          error: error instanceof Error ? error.message : "Team member authentication failed",
          isLoading: false
        });
        throw error;
      }
    });
  }
  /**
   * Get team member project context when selecting a project
   * This determines the user's role in the Backbone app based on their team member role
   */
  getTeamMemberProjectContext(projectId) {
    return __async(this, null, function* () {
      var _a;
      if (!((_a = this.state.user) == null ? void 0 : _a.isTeamMember)) {
        return null;
      }
      try {
        const { cloudProjectIntegration: cloudProjectIntegration2 } = yield __vitePreload(() => __async(this, null, function* () {
          const { cloudProjectIntegration: cloudProjectIntegration3 } = yield import("./CloudProjectIntegration-Ceg3mHeu.js").then((n) => n.C);
          return { cloudProjectIntegration: cloudProjectIntegration3 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5]) : void 0);
        const projectTeamMembers = yield cloudProjectIntegration2.getProjectTeamMembers(projectId);
        const teamMemberAssignment = projectTeamMembers.find(
          (ptm) => ptm.teamMemberId === this.state.user.id
        );
        if (!teamMemberAssignment) {
          throw new Error("Team member is not assigned to this project");
        }
        const { TEAM_MEMBER_ROLE_MAPPINGS } = yield __vitePreload(() => __async(this, null, function* () {
          const { TEAM_MEMBER_ROLE_MAPPINGS: TEAM_MEMBER_ROLE_MAPPINGS2 } = yield import("./teamMember-BP-Q9VkP.js");
          return { TEAM_MEMBER_ROLE_MAPPINGS: TEAM_MEMBER_ROLE_MAPPINGS2 };
        }), true ? [] : void 0);
        const roleMapping = TEAM_MEMBER_ROLE_MAPPINGS.find(
          (mapping) => mapping.teamMemberRole === teamMemberAssignment.role
        );
        if (!roleMapping) {
          throw new Error("Invalid team member role mapping");
        }
        return {
          teamMember: this.state.user,
          project: {
            id: projectId,
            role: teamMemberAssignment.role
          },
          backboneUserRole: roleMapping.backboneUserRole,
          permissions: roleMapping.permissions,
          canManageTeam: teamMemberAssignment.role === "admin"
        };
      } catch (error) {
        console.error("Failed to get team member project context:", error);
        throw error;
      }
    });
  }
  /**
   * Handle project selection/creation
   */
  selectProject(projectId) {
    return __async(this, null, function* () {
      try {
        this.updateState({ isLoading: true, error: null });
        if (!this.validateProjectAccess(projectId, this.state.selectedMode)) {
          throw new Error("Invalid project access");
        }
        yield this.completeStartup(projectId);
      } catch (error) {
        console.error("Project selection error:", error);
        this.updateState({
          error: "Failed to select project",
          isLoading: false
        });
      }
    });
  }
  /**
   * Create a new project with the unified creation dialog
   */
  createProject(options) {
    return __async(this, null, function* () {
      try {
        this.updateState({ isLoading: true, error: null });
        this.validateProjectCreationOptions(options);
        const projectId = yield this.executeProjectCreation(options);
        yield this.completeStartup(projectId);
        return projectId;
      } catch (error) {
        console.error("Project creation error:", error);
        this.updateState({
          error: `Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`,
          isLoading: false
        });
        throw error;
      }
    });
  }
  /**
   * Reset the startup sequence (for logout or mode change)
   */
  reset() {
    return __async(this, null, function* () {
      sessionStorage.clear();
      localStorage.removeItem("currentUser");
      localStorage.removeItem("lastAuthTime");
      localStorage.removeItem("lastProjectId");
      sessionStorage.setItem("startup_reset", "true");
      this.updateState({
        currentStep: "mode_selection",
        selectedMode: null,
        isAuthenticated: false,
        user: null,
        selectedProjectId: null,
        error: null,
        isLoading: false
      });
    });
  }
  /**
   * Switch modes (advanced feature)
   */
  switchMode(newMode, newStorageMode = "local") {
    return __async(this, null, function* () {
      if (this.state.selectedProjectId) {
        localStorage.setItem("lastProjectId", this.state.selectedProjectId);
      }
      yield this.selectMode(newMode, newStorageMode);
    });
  }
  // ==================== PRIVATE METHODS ====================
  updateState(updates) {
    this.state = __spreadValues(__spreadValues({}, this.state), updates);
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        console.error("Startup listener error:", error);
      }
    });
  }
  checkExistingAuthentication() {
    try {
      const userStr = localStorage.getItem("currentUser");
      const lastAuthStr = localStorage.getItem("lastAuthTime");
      if (!userStr || !lastAuthStr) {
        return { isValid: false, user: null };
      }
      const lastAuth = parseInt(lastAuthStr);
      const now = Date.now();
      const MAX_AUTH_AGE = 24 * 60 * 60 * 1e3;
      if (now - lastAuth > MAX_AUTH_AGE) {
        return { isValid: false, user: null };
      }
      const user = JSON.parse(userStr);
      return { isValid: true, user };
    } catch (e) {
      return { isValid: false, user: null };
    }
  }
  isAuthRequired(mode, storageMode) {
    if (mode === "shared_network") {
      return true;
    }
    if (mode === "standalone" && storageMode === "cloud") {
      return true;
    }
    if (storageMode === "hybrid") {
      return true;
    }
    return false;
  }
  validateProjectAccess(projectId, mode) {
    if (!projectId || !mode) return false;
    return true;
  }
  validateProjectCreationOptions(options) {
    var _a, _b, _c, _d;
    if (!((_a = options.name) == null ? void 0 : _a.trim())) {
      throw new Error("Project name is required");
    }
    if (options.preferredPorts) {
      const { website, api } = options.preferredPorts;
      if (typeof website === "number" && (website < 1024 || website > 65535)) {
        throw new Error("Website port must be between 1024-65535");
      }
      if (typeof api === "number" && (api < 1024 || api > 65535)) {
        throw new Error("API port must be between 1024-65535");
      }
    }
    if ((_b = options.localNetworkConfig) == null ? void 0 : _b.enabled) {
      const { port, address, maxUsers } = options.localNetworkConfig;
      if (!port || port < 1024 || port > 65535) {
        throw new Error("Invalid port number (must be between 1024-65535)");
      }
      if (!(address == null ? void 0 : address.trim())) {
        throw new Error("Network address is required for local network deployment");
      }
      if (!maxUsers || maxUsers < 1 || maxUsers > 250) {
        throw new Error("Max users must be between 1-250");
      }
    }
    if (options.storageMode === "cloud" && ((_c = options.cloudConfig) == null ? void 0 : _c.provider) === "gcs") {
      if (!((_d = options.cloudConfig.bucket) == null ? void 0 : _d.trim())) {
        throw new Error("GCS bucket is required for cloud storage");
      }
    }
  }
  executeProjectCreation(options) {
    return __async(this, null, function* () {
      const requiresCloudIntegration = this.requiresCloudIntegration();
      if (requiresCloudIntegration) {
        const { cloudProjectIntegration: cloudProjectIntegration2 } = yield __vitePreload(() => __async(this, null, function* () {
          const { cloudProjectIntegration: cloudProjectIntegration3 } = yield import("./CloudProjectIntegration-Ceg3mHeu.js").then((n) => n.C);
          return { cloudProjectIntegration: cloudProjectIntegration3 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5]) : void 0);
        const token = localStorage.getItem("auth_token");
        if (token) {
          cloudProjectIntegration2.setAuthToken(token);
        }
        const cloudProject = yield cloudProjectIntegration2.createCloudProject(options);
        if (cloudProject && cloudProject.id) {
          return cloudProject.id;
        } else {
          return yield this.createLocalProject(options);
        }
      } else {
        return yield this.createLocalProject(options);
      }
    });
  }
  requiresCloudIntegration() {
    return this.state.selectedMode === "shared_network" || this.state.storageMode === "cloud" || this.state.storageMode === "hybrid";
  }
  createLocalProject(options) {
    return __async(this, null, function* () {
      var _a;
      const projectData = {
        name: options.name,
        description: options.description,
        mode: this.state.selectedMode,
        storageMode: this.state.storageMode,
        createdBy: ((_a = this.state.user) == null ? void 0 : _a.id) || "local-user",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        localNetworkConfig: options.localNetworkConfig,
        collaborationSettings: options.collaborationSettings
      };
      const projectId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const localProjects = JSON.parse(localStorage.getItem("localProjects") || "[]");
      localProjects.push(__spreadValues({ id: projectId }, projectData));
      localStorage.setItem("localProjects", JSON.stringify(localProjects));
      console.log("Created local project:", projectId, projectData);
      return projectId;
    });
  }
  completeStartup(projectId) {
    return __async(this, null, function* () {
      localStorage.setItem("lastProjectId", projectId);
      this.updateState({
        currentStep: "complete",
        selectedProjectId: projectId,
        isLoading: false,
        error: null
      });
      window.dispatchEvent(new CustomEvent("startup:complete", {
        detail: {
          mode: this.state.selectedMode,
          storageMode: this.state.storageMode,
          projectId,
          user: this.state.user
        }
      }));
    });
  }
  // ==================== PUBLIC GETTERS ====================
  isComplete() {
    return this.state.currentStep === "complete" && this.state.selectedMode !== null && this.state.selectedProjectId !== null;
  }
  requiresAuthentication() {
    return this.isAuthRequired(this.state.selectedMode, this.state.storageMode);
  }
  getSelectedMode() {
    return this.state.selectedMode;
  }
  getStorageMode() {
    return this.state.storageMode;
  }
  getCurrentUser() {
    return this.state.user;
  }
  getSelectedProjectId() {
    return this.state.selectedProjectId;
  }
};
__publicField(_SimplifiedStartupSequencer, "instance");
let SimplifiedStartupSequencer = _SimplifiedStartupSequencer;
const simplifiedStartupSequencer = SimplifiedStartupSequencer.getInstance();
if (typeof window !== "undefined") {
  window.simplifiedStartupSequencer = simplifiedStartupSequencer;
}
const DEFAULT_FORM_DATA = {
  name: "",
  description: "",
  visibility: "private",
  storageMode: "local",
  cloudProvider: "firestore",
  gcsBucket: "",
  gcsPrefix: "",
  s3Bucket: "",
  s3Region: "us-east-1",
  s3Prefix: "",
  awsBucket: "",
  awsRegion: "us-east-1",
  awsPrefix: "",
  azureContainer: "",
  azureAccount: "",
  azurePrefix: "",
  enableLocalNetwork: false,
  networkPort: 3e3,
  networkAddress: "localhost",
  maxNetworkUsers: 250,
  networkPassword: "",
  preferredWebsitePort: 3002,
  preferredApiPort: 3003,
  maxCollaborators: 10,
  // Will be overridden by user's license limit
  enableRealTime: true,
  enableComments: true,
  enableFileSharing: true,
  enableVersionControl: true,
  enableEncryption: false,
  autoBackup: true,
  backupInterval: 30,
  enableAuditLog: false,
  selectedDatasets: []
};
const STEPS = [
  "Basic Information",
  "Storage Configuration",
  "Network Settings",
  "Collaboration Options",
  "Dataset Assignment",
  "Review & Create"
];
const UnifiedProjectCreationDialog = ({
  open,
  onClose,
  mode,
  onSuccess,
  onCreate,
  maxCollaborators = 10
  // Default to basic limit if not provided
}) => {
  const [activeStep, setActiveStep] = reactExports.useState(0);
  const [formData, setFormData] = reactExports.useState(DEFAULT_FORM_DATA);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [validationErrors, setValidationErrors] = reactExports.useState({});
  const [availableDatasets, setAvailableDatasets] = reactExports.useState([]);
  const [datasetsLoading, setDatasetsLoading] = reactExports.useState(false);
  const loadAvailableDatasets = () => __async(void 0, null, function* () {
    try {
      setDatasetsLoading(true);
      const datasets = yield cloudProjectIntegration.listDatasets({});
      const labeled = datasets.map((ds) => {
        var _a;
        const getBackendLabel = (backend) => {
          switch (backend) {
            case "gcs":
              return "(GCS)";
            case "s3":
              return "(S3)";
            case "aws":
              return "(AWS)";
            case "azure":
              return "(Azure)";
            case "firestore":
            default:
              return "(Firestore)";
          }
        };
        return __spreadProps(__spreadValues({}, ds), {
          __label: `${ds.name} ${getBackendLabel((_a = ds.storage) == null ? void 0 : _a.backend)}`
        });
      });
      setAvailableDatasets(labeled);
    } catch (e) {
      console.error("Failed to load datasets:", e);
    } finally {
      setDatasetsLoading(false);
    }
  });
  reactExports.useEffect(() => {
    if (open) {
      setFormData(__spreadProps(__spreadValues({}, DEFAULT_FORM_DATA), {
        // Set defaults based on mode and user's license limit
        enableLocalNetwork: mode === "standalone",
        maxCollaborators,
        // Use the actual user's license limit
        enableRealTime: mode === "shared_network"
      }));
      setActiveStep(0);
      setError(null);
      setValidationErrors({});
      loadAvailableDatasets();
    }
  }, [open, mode, maxCollaborators]);
  const updateFormData = (updates) => {
    setFormData((prev) => __spreadValues(__spreadValues({}, prev), updates));
    const newErrors = __spreadValues({}, validationErrors);
    Object.keys(updates).forEach((key) => {
      delete newErrors[key];
    });
    setValidationErrors(newErrors);
  };
  const validateStep = (step) => {
    const errors = {};
    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          errors.name = "Project name is required";
        }
        if (formData.name.length > 100) {
          errors.name = "Project name must be less than 100 characters";
        }
        break;
      case 1:
        if (formData.storageMode === "cloud" && formData.cloudProvider === "gcs") {
          if (!formData.gcsBucket.trim()) {
            errors.gcsBucket = "GCS bucket name is required";
          }
        }
        break;
      case 2:
        if (formData.enableLocalNetwork) {
          if (formData.networkPort < 1024 || formData.networkPort > 65535) {
            errors.networkPort = "Port must be between 1024 and 65535";
          }
          if (!formData.networkAddress.trim()) {
            errors.networkAddress = "Network address is required";
          }
          if (formData.maxNetworkUsers < 1 || formData.maxNetworkUsers > 250) {
            errors.maxNetworkUsers = "Max users must be between 1 and 250";
          }
        }
        if (typeof formData.preferredWebsitePort === "number" && (formData.preferredWebsitePort < 1024 || formData.preferredWebsitePort > 65535)) {
          errors.preferredWebsitePort = "Website port must be 1024-65535";
        }
        if (typeof formData.preferredApiPort === "number" && (formData.preferredApiPort < 1024 || formData.preferredApiPort > 65535)) {
          errors.preferredApiPort = "API port must be 1024-65535";
        }
        break;
      case 3:
        if (formData.maxCollaborators < 1 || formData.maxCollaborators > maxCollaborators) {
          errors.maxCollaborators = `Max collaborators must be between 1 and ${maxCollaborators}`;
        }
        break;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  const handleCreate = () => __async(void 0, null, function* () {
    if (!validateStep(activeStep)) return;
    setIsLoading(true);
    setError(null);
    try {
      const options = {
        name: formData.name,
        description: formData.description,
        storageMode: formData.storageMode,
        preferredPorts: {
          website: formData.preferredWebsitePort,
          api: formData.preferredApiPort
        },
        localNetworkConfig: formData.enableLocalNetwork ? {
          enabled: true,
          port: formData.networkPort,
          address: formData.networkAddress,
          maxUsers: formData.maxNetworkUsers
        } : void 0,
        cloudConfig: formData.storageMode === "cloud" ? {
          provider: formData.cloudProvider,
          bucket: formData.gcsBucket,
          prefix: formData.gcsPrefix
        } : void 0,
        collaborationSettings: {
          maxCollaborators: formData.maxCollaborators,
          enableRealTime: formData.enableRealTime,
          enableComments: formData.enableComments,
          enableFileSharing: formData.enableFileSharing
        }
      };
      console.log("🔍 Project creation options:", options);
      console.log("🔍 User maxCollaborators limit:", maxCollaborators);
      console.log("🔍 Form maxCollaborators value:", formData.maxCollaborators);
      const projectId = onCreate ? yield onCreate(options) : yield simplifiedStartupSequencer.createProject(options);
      if (formData.selectedDatasets.length > 0) {
        console.log("🔍 Assigning datasets to project:", formData.selectedDatasets);
        for (const datasetId of formData.selectedDatasets) {
          try {
            yield cloudProjectIntegration.assignDatasetToProject(projectId, datasetId);
            console.log("✅ Assigned dataset", datasetId, "to project", projectId);
          } catch (e) {
            console.error("❌ Failed to assign dataset", datasetId, "to project", projectId, ":", e);
          }
        }
      }
      onSuccess == null ? void 0 : onSuccess(projectId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  });
  const renderBasicInformation = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 2 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Project Information" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: "Provide basic information about your project. This can be changed later." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          label: "Project Name",
          value: formData.name,
          onChange: (e) => updateFormData({ name: e.target.value }),
          error: !!validationErrors.name,
          helperText: validationErrors.name,
          required: true,
          placeholder: "My Awesome Project"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          label: "Description",
          value: formData.description,
          onChange: (e) => updateFormData({ description: e.target.value }),
          multiline: true,
          rows: 3,
          placeholder: "Describe what this project is about..."
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { id: "visibility-label", children: "Visibility" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            labelId: "visibility-label",
            id: "visibility-select",
            value: formData.visibility,
            onChange: (e) => {
              console.log("🔍 Visibility changed:", e.target.value);
              updateFormData({ visibility: e.target.value });
            },
            label: "Visibility",
            MenuProps: {
              PaperProps: {
                style: {
                  maxHeight: 300
                }
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "private", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { fontSize: "small" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Private" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Only you and invited team members" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "organization", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Business, { fontSize: "small" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Organization" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "All organization members" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "public", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Public, { fontSize: "small" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Public" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Anyone can access (read-only)" })
                ] })
              ] }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: "Choose who can access this project and its data" })
      ] }) })
    ] })
  ] });
  const renderStorageConfiguration = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 2 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Storage Configuration" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: "Choose how your project data will be stored and accessed." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { component: "fieldset", fullWidth: true, sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { component: "legend", children: "Storage Mode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        RadioGroup,
        {
          value: formData.storageMode,
          onChange: (e) => updateFormData({ storageMode: e.target.value }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                value: "local",
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, {}),
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Local Storage" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Store project files on your local machine" })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                value: "cloud",
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, {}),
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Cloud Storage" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Store project data in the cloud for sharing and backup" })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                value: "hybrid",
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, {}),
                label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Hybrid Storage" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Combine local and cloud storage for optimal performance" })
                  ] })
                ] })
              }
            )
          ]
        }
      )
    ] }),
    formData.storageMode === "cloud" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Cloud Provider Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { id: "cloud-provider-label", children: "Cloud Provider" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              labelId: "cloud-provider-label",
              id: "cloud-provider-select",
              value: formData.cloudProvider,
              onChange: (e) => {
                console.log("🔍 Cloud provider changed:", e.target.value);
                updateFormData({ cloudProvider: e.target.value });
              },
              label: "Cloud Provider",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "firestore", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Firestore" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Real-time NoSQL database" })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "gcs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Google Cloud Storage" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Object storage with metadata" })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "s3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Amazon S3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Scalable object storage" })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "aws", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "AWS Services" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Amazon Web Services" })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "azure", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Microsoft Azure" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Azure Blob Storage" })
                  ] })
                ] }) })
              ]
            }
          )
        ] }) }),
        formData.cloudProvider === "gcs" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "GCS Bucket",
              value: formData.gcsBucket,
              onChange: (e) => updateFormData({ gcsBucket: e.target.value }),
              error: !!validationErrors.gcsBucket,
              helperText: validationErrors.gcsBucket,
              placeholder: "my-project-bucket"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Prefix (Optional)",
              value: formData.gcsPrefix,
              onChange: (e) => updateFormData({ gcsPrefix: e.target.value }),
              placeholder: "projects/"
            }
          ) })
        ] }),
        formData.cloudProvider === "s3" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "S3 Bucket",
              value: formData.s3Bucket,
              onChange: (e) => updateFormData({ s3Bucket: e.target.value }),
              placeholder: "my-s3-bucket"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "AWS Region",
              value: formData.s3Region,
              onChange: (e) => updateFormData({ s3Region: e.target.value }),
              placeholder: "us-east-1"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "S3 Prefix (Optional)",
              value: formData.s3Prefix,
              onChange: (e) => updateFormData({ s3Prefix: e.target.value }),
              placeholder: "datasets/"
            }
          ) })
        ] }),
        formData.cloudProvider === "aws" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "AWS Bucket",
              value: formData.awsBucket,
              onChange: (e) => updateFormData({ awsBucket: e.target.value }),
              placeholder: "my-aws-bucket"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "AWS Region",
              value: formData.awsRegion,
              onChange: (e) => updateFormData({ awsRegion: e.target.value }),
              placeholder: "us-east-1"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "AWS Prefix (Optional)",
              value: formData.awsPrefix,
              onChange: (e) => updateFormData({ awsPrefix: e.target.value }),
              placeholder: "datasets/"
            }
          ) })
        ] }),
        formData.cloudProvider === "azure" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Azure Storage Account",
              value: formData.azureAccount,
              onChange: (e) => updateFormData({ azureAccount: e.target.value }),
              placeholder: "mystorageaccount"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Azure Container",
              value: formData.azureContainer,
              onChange: (e) => updateFormData({ azureContainer: e.target.value }),
              placeholder: "mycontainer"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Azure Prefix (Optional)",
              value: formData.azurePrefix,
              onChange: (e) => updateFormData({ azurePrefix: e.target.value }),
              placeholder: "datasets/"
            }
          ) })
        ] })
      ] })
    ] }) })
  ] });
  const renderNetworkSettings = () => {
    var _a, _b;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Network Configuration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: "Configure local network deployment for team collaboration." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormGroup, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormControlLabel,
        {
          control: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: formData.enableLocalNetwork,
              onChange: (e) => updateFormData({ enableLocalNetwork: e.target.checked })
            }
          ),
          label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIcon, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Enable Local Network Deployment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Allow team members to connect to your local instance" })
            ] })
          ] })
        }
      ) }),
      formData.enableLocalNetwork && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Network Deployment Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Network Address",
              value: formData.networkAddress,
              onChange: (e) => updateFormData({ networkAddress: e.target.value }),
              error: !!validationErrors.networkAddress,
              helperText: validationErrors.networkAddress || "IP address or hostname",
              placeholder: "192.168.1.100"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Port",
              type: "number",
              value: formData.networkPort,
              onChange: (e) => updateFormData({ networkPort: parseInt(e.target.value) || 3e3 }),
              error: !!validationErrors.networkPort,
              helperText: validationErrors.networkPort || "Port 1024-65535",
              InputProps: {
                inputProps: { min: 1024, max: 65535 }
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Desktop/Web Preferred Development Ports" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Preferred Website Port (Dev)",
              type: "number",
              value: (_a = formData.preferredWebsitePort) != null ? _a : "",
              onChange: (e) => updateFormData({ preferredWebsitePort: parseInt(e.target.value) || void 0 }),
              error: !!validationErrors.preferredWebsitePort,
              helperText: validationErrors.preferredWebsitePort || "Optional. Default 3002",
              InputProps: { inputProps: { min: 1024, max: 65535 } }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Preferred API Port (Dev)",
              type: "number",
              value: (_b = formData.preferredApiPort) != null ? _b : "",
              onChange: (e) => updateFormData({ preferredApiPort: parseInt(e.target.value) || void 0 }),
              error: !!validationErrors.preferredApiPort,
              helperText: validationErrors.preferredApiPort || "Optional. Default 3003",
              InputProps: { inputProps: { min: 1024, max: 65535 } }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Max Network Users",
              type: "number",
              value: formData.maxNetworkUsers,
              onChange: (e) => updateFormData({ maxNetworkUsers: parseInt(e.target.value) || 10 }),
              error: !!validationErrors.maxNetworkUsers,
              helperText: validationErrors.maxNetworkUsers,
              InputProps: {
                inputProps: { min: 1, max: 100 }
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Network Password (Optional)",
              type: "password",
              value: formData.networkPassword,
              onChange: (e) => updateFormData({ networkPassword: e.target.value }),
              helperText: "Leave empty for no password protection"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
          "Your local instance will be accessible at",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            "http://",
            formData.networkAddress,
            ":",
            formData.networkPort
          ] })
        ] }) })
      ] }) }) })
    ] });
  };
  const renderCollaborationOptions = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 2 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Collaboration Settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: "Configure how team members can collaborate on this project." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { gutterBottom: true, children: [
          "Max Collaborators: ",
          formData.maxCollaborators
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            value: formData.maxCollaborators,
            onChange: (_, value) => updateFormData({ maxCollaborators: value }),
            min: 1,
            max: maxCollaborators,
            marks: [
              { value: 1, label: "1" },
              { value: Math.min(25, maxCollaborators), label: Math.min(25, maxCollaborators).toString() },
              { value: Math.min(50, maxCollaborators), label: Math.min(50, maxCollaborators).toString() },
              { value: maxCollaborators, label: maxCollaborators.toString() }
            ],
            valueLabelDisplay: "auto"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Collaboration Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormGroup, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: formData.enableRealTime,
                  onChange: (e) => updateFormData({ enableRealTime: e.target.checked })
                }
              ),
              label: "Real-time Editing"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: formData.enableComments,
                  onChange: (e) => updateFormData({ enableComments: e.target.checked })
                }
              ),
              label: "Comments & Annotations"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: formData.enableFileSharing,
                  onChange: (e) => updateFormData({ enableFileSharing: e.target.checked })
                }
              ),
              label: "File Sharing"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: formData.enableVersionControl,
                  onChange: (e) => updateFormData({ enableVersionControl: e.target.checked })
                }
              ),
              label: "Version Control"
            }
          )
        ] })
      ] })
    ] })
  ] });
  const renderDatasetAssignment = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 2 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Dataset Assignment (Optional)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: "Select existing datasets to assign to this project. You can also assign datasets later from the project details page." }),
    datasetsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, { sx: { width: "100%" } }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      availableDatasets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No datasets available." }),
        " Create datasets from the main Cloud Projects page using the comprehensive Dataset Creation Wizard, then assign them to projects as needed."
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", gutterBottom: true, children: [
          "Available Datasets (",
          availableDatasets.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { maxHeight: 300, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1 }, children: availableDatasets.map((dataset) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormControlLabel,
          {
            control: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: formData.selectedDatasets.includes(dataset.id),
                onChange: (e) => {
                  const isChecked = e.target.checked;
                  const newSelectedDatasets = isChecked ? [...formData.selectedDatasets, dataset.id] : formData.selectedDatasets.filter((id) => id !== dataset.id);
                  updateFormData({ selectedDatasets: newSelectedDatasets });
                }
              }
            ),
            label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: 500, children: dataset.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                dataset.description || "No description",
                " • ",
                (() => {
                  var _a;
                  switch ((_a = dataset.storage) == null ? void 0 : _a.backend) {
                    case "gcs":
                      return "Google Cloud Storage";
                    case "s3":
                      return "Amazon S3";
                    case "aws":
                      return "AWS Services";
                    case "azure":
                      return "Microsoft Azure";
                    case "firestore":
                    default:
                      return "Firestore";
                  }
                })()
              ] })
            ] }),
            sx: {
              display: "flex",
              width: "100%",
              m: 0,
              p: 1,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "action.hover"
              }
            }
          },
          dataset.id
        )) }),
        formData.selectedDatasets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
          formData.selectedDatasets.length,
          " dataset",
          formData.selectedDatasets.length > 1 ? "s" : "",
          " selected for assignment."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2, p: 2, backgroundColor: "action.hover", borderRadius: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Need to create a dataset?" }),
        " Use the comprehensive Dataset Creation Wizard from the main Cloud Projects page. It guides you through cloud provider setup, authentication, storage configuration, and schema templates for full compatibility with your projects."
      ] }) })
    ] })
  ] });
  const renderReview = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 2 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Review & Create" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: "Review your project configuration before creating." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: formData.name }),
      formData.description && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: formData.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            icon: mode === "standalone" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIcon, {}),
            label: mode === "standalone" ? "Standalone Mode" : "Network Mode",
            color: "primary"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
            label: `${formData.storageMode} storage`,
            variant: "outlined"
          }
        ),
        formData.enableLocalNetwork && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIcon, {}),
            label: `Network: ${formData.networkAddress}:${formData.networkPort}`,
            variant: "outlined"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Configuration Summary:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { component: "ul", sx: { pl: 2, m: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { component: "li", variant: "body2", children: [
          "Storage: ",
          formData.storageMode,
          formData.storageMode === "cloud" && ` (${formData.cloudProvider})`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { component: "li", variant: "body2", children: [
          "Max Collaborators: ",
          formData.maxCollaborators
        ] }),
        formData.enableLocalNetwork && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { component: "li", variant: "body2", children: [
          "Local Network: ",
          formData.networkAddress,
          ":",
          formData.networkPort,
          "(max ",
          formData.maxNetworkUsers,
          " users)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { component: "li", variant: "body2", children: [
          "Features: ",
          [
            formData.enableRealTime && "Real-time",
            formData.enableComments && "Comments",
            formData.enableFileSharing && "File Sharing",
            formData.enableVersionControl && "Version Control"
          ].filter(Boolean).join(", ")
        ] }),
        formData.selectedDatasets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { component: "li", variant: "body2", children: [
          "Datasets: ",
          formData.selectedDatasets.length,
          " dataset",
          formData.selectedDatasets.length > 1 ? "s" : "",
          " selected"
        ] })
      ] })
    ] }) }) }) })
  ] });
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderStorageConfiguration();
      case 2:
        return renderNetworkSettings();
      case 3:
        return renderCollaborationOptions();
      case 4:
        return renderDatasetAssignment();
      case 5:
        return renderReview();
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      sx: { zIndex: 1400 },
      PaperProps: {
        sx: {
          minHeight: "70vh",
          backgroundColor: "background.default",
          "& .MuiDialogContent-root": {
            backgroundColor: "background.default"
          }
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogTitle,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 2
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, { color: "primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Create New Project" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: onClose, size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { sx: { p: 3 }, children: [
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { activeStep, orientation: "horizontal", sx: { mb: 3 }, children: STEPS.map((label, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepLabel, { children: label }) }, label)) }),
          renderStepContent(activeStep),
          isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, { sx: { mt: 2 } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogActions,
          {
            sx: {
              px: 3,
              pb: 3,
              pt: 2,
              backgroundColor: "background.paper",
              borderTop: "1px solid",
              borderColor: "divider",
              justifyContent: "space-between"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: onClose,
                  variant: "outlined",
                  disabled: isLoading,
                  sx: { borderColor: "primary.main", color: "primary.main" },
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleBack,
                    disabled: activeStep === 0 || isLoading,
                    variant: "outlined",
                    children: "Back"
                  }
                ),
                activeStep === STEPS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleCreate,
                    variant: "contained",
                    disabled: isLoading || !formData.name.trim(),
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                    sx: {
                      backgroundColor: "primary.main",
                      "&:hover": { backgroundColor: "primary.dark" }
                    },
                    children: isLoading ? "Creating..." : "Create Project"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleNext,
                    variant: "contained",
                    disabled: isLoading,
                    children: "Next"
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
};
export {
  UnifiedProjectCreationDialog as U,
  simplifiedStartupSequencer as s
};
