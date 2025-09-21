const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/DatasetCollectionValidator-COtDSV9l.js","assets/index-DyMiOceZ.js","assets/mui-DJqJu8cJ.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-BZOVZ1Et.js","assets/index-COak77tQ.css","assets/index.esm-CjtNHFZy.js","assets/index.esm-zVCMB3Cx.js","assets/firebase-CshsU33q.js","assets/index.esm-D5-7iBdy.js","assets/CloudProjectIntegration-7ZYSQow_.js","assets/UnifiedProjectCreationDialog-I6dUqgdR.js","assets/UnifiedDataService-Cv3oLL_k.js","assets/FirestoreCollectionManager-DKHhr-Lx.js"])))=>i.map(i=>d[i]);
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
import { u as useAuth, b as authService, _ as __vitePreload, a as useLoading, E as ErrorBoundary } from "./index-DyMiOceZ.js";
import { j as jsxRuntimeExports, a4 as Dialog, a5 as DialogTitle, B as Box, cu as ExtensionIcon, a7 as DialogContent, _ as Stepper, $ as Step, a0 as StepLabel, d as Alert, T as Typography, aD as DialogActions, a as Button, C as CircularProgress, t as Card, w as CardContent, G as Grid, x as List, y as ListItem, z as ListItemIcon, ah as StorageIcon, H as ListItemText, ao as Speed, J as Security, e as TextField, bM as AddIcon, aj as FormControl, ak as InputLabel, al as Select, M as MenuItem, g as IconButton, aG as DeleteIcon, Q as Accordion, U as AccordionSummary, W as ExpandMoreIcon, X as AccordionDetails, p as CheckCircleIcon, ac as Info, r as Chip, Z as Business, Y as Group, ba as Inventory, cv as MovieIcon, u as useTheme, b0 as Settings, aN as Tabs, aO as Tab, cw as DatasetIcon, R as RefreshIcon, cx as GroupAddIcon, aw as Table, ax as TableHead, ay as TableRow, az as TableCell, aA as TableBody, ap as Avatar, aI as Tooltip, m as CheckIcon, cy as CancelIcon, c2 as EditIcon, aB as MoreVertIcon, aC as Menu, aS as ComputerIcon, c3 as NetworkIcon, N as CloudIcon, c as Paper, cz as CollectionsIcon, D as Divider, cA as CategoryIcon, cB as ExpandLessIcon, av as TableContainer, cC as SelectAllIcon, cD as DeselectAllIcon, cd as Collapse, l as Checkbox, F as FormControlLabel, s as Switch, I as InputAdornment, cb as ClearIcon, b9 as SearchIcon, ck as FilterList, ab as WarningIcon, V as VisibilityOff, h as Visibility, c6 as FormLabel, c7 as RadioGroup, c8 as Radio, a6 as CloseIcon, i as LinearProgress, bB as Save, bI as PersonAddIcon, aW as DashboardIcon, cE as LightbulbIcon, aF as ListItemSecondaryAction, c4 as Slider, A as ArrowBack, q as ArrowForward, v as Star, cF as EventIcon, aZ as School, cG as SportsIcon, cH as TvIcon, cI as MusicIcon, cJ as CampaignIcon, cK as ListItemAvatar, f as PersonIcon, cL as HelpIcon, af as Assessment, au as TrendingUp, cM as ArchiveIcon, bF as Launch, cN as TableSortLabel, b3 as PlayArrow, cO as StopIcon, cP as TablePagination, ce as Popover, cg as StepContent, cQ as CheckCircleOutlineIcon, aM as LinkIcon, ad as PeopleIcon, b4 as Assignment, a9 as Schedule } from "./mui-DJqJu8cJ.js";
import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { collection, query, where, limit, getDocs, Timestamp, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc } from "./index.esm-CjtNHFZy.js";
import { g as getFunctions, h as httpsCallable, d as db } from "./firebase-CshsU33q.js";
import { c as cloudProjectIntegration, T as TeamMemberRole, a as TeamMemberService } from "./CloudProjectIntegration-7ZYSQow_.js";
import { U as UnifiedProjectCreationDialog, s as simplifiedStartupSequencer } from "./UnifiedProjectCreationDialog-I6dUqgdR.js";
import { unifiedDataService } from "./UnifiedDataService-Cv3oLL_k.js";
class CollectionSchemaService {
  constructor() {
    __publicField(this, "templates", /* @__PURE__ */ new Map());
    this.initializeTemplates();
  }
  initializeTemplates() {
    this.templates.set("sessions", {
      name: "sessions",
      category: "sessions",
      displayName: "Sessions",
      description: "Production sessions with scheduling and status tracking",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true, description: "Unique session identifier" },
        { name: "organizationId", type: "string", required: true, indexed: true, description: "Organization ID for access control" },
        { name: "projectId", type: "string", required: false, indexed: true, description: "Associated project ID" },
        { name: "sessionName", type: "string", required: true, indexed: false, description: "Display name for the session" },
        { name: "description", type: "string", required: false, indexed: false, description: "Session description" },
        { name: "status", type: "string", required: true, indexed: true, description: "Session status", validation: { enum: ["PLANNING", "SCHEDULED", "IN_PRODUCTION", "POST_PRODUCTION", "COMPLETED", "CANCELLED"] } },
        { name: "sessionDate", type: "string", required: false, indexed: true, description: "Session date (YYYY-MM-DD)" },
        { name: "callTime", type: "timestamp", required: false, indexed: true, description: "Call time" },
        { name: "wrapTime", type: "timestamp", required: false, indexed: true, description: "Wrap time" },
        { name: "location", type: "string", required: false, indexed: false, description: "Session location" },
        { name: "assignedTo", type: "array", required: false, indexed: true, description: "Array of assigned user IDs" },
        { name: "createdBy", type: "string", required: true, indexed: true, description: "User ID who created the session" },
        { name: "createdAt", type: "timestamp", required: true, indexed: true, description: "Creation timestamp" },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true, description: "Last update timestamp" }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "createdAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "projectId", order: "asc" },
            { field: "createdAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "assignedTo", order: "array-contains" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "PRODUCER", "DIRECTOR"],
        admin: ["ADMIN", "OWNER"]
      },
      relationships: [
        { collection: "projects", type: "many-to-many", field: "projectId" },
        { collection: "sessionTasks", type: "one-to-many", field: "sessionId" }
      ]
    });
    this.templates.set("sessionTasks", {
      name: "sessionTasks",
      category: "sessions",
      displayName: "Session Tasks",
      description: "Tasks associated with production sessions",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "sessionId", type: "string", required: true, indexed: true },
        { name: "taskName", type: "string", required: true, indexed: false },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"] } },
        { name: "priority", type: "string", required: false, indexed: true, validation: { enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] } },
        { name: "assignedTo", type: "string", required: false, indexed: true },
        { name: "dueDate", type: "timestamp", required: false, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "sessionId", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "assignedTo", order: "asc" },
            { field: "dueDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "PRODUCER", "COORDINATOR"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("mediaFiles", {
      name: "mediaFiles",
      category: "media",
      displayName: "Media Files",
      description: "Media file tracking and management",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "sessionId", type: "string", required: false, indexed: true },
        { name: "fileName", type: "string", required: true, indexed: true },
        { name: "fileType", type: "string", required: true, indexed: true },
        { name: "fileSize", type: "number", required: false, indexed: false },
        { name: "duration", type: "number", required: false, indexed: false },
        { name: "resolution", type: "string", required: false, indexed: false },
        { name: "codec", type: "string", required: false, indexed: false },
        { name: "storageUrl", type: "string", required: true, indexed: false },
        { name: "thumbnailUrl", type: "string", required: false, indexed: false },
        { name: "tags", type: "array", required: false, indexed: true },
        { name: "uploadedBy", type: "string", required: true, indexed: true },
        { name: "uploadedAt", type: "timestamp", required: true, indexed: true },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["UPLOADING", "PROCESSING", "READY", "ARCHIVED", "ERROR"] } }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "sessionId", order: "asc" },
            { field: "fileType", order: "asc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "uploadedAt", order: "desc" },
            { field: "fileType", order: "asc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "tags", order: "array-contains" },
            { field: "uploadedAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "MEDIA_MANAGER", "EDITOR"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("projects", {
      name: "projects",
      category: "business",
      displayName: "Projects",
      description: "Project management and tracking",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "name", type: "string", required: true, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"] } },
        { name: "priority", type: "string", required: false, indexed: true, validation: { enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] } },
        { name: "startDate", type: "timestamp", required: false, indexed: true },
        { name: "endDate", type: "timestamp", required: false, indexed: true },
        { name: "budget", type: "number", required: false, indexed: false },
        { name: "clientId", type: "string", required: false, indexed: true },
        { name: "projectManager", type: "string", required: false, indexed: true },
        { name: "teamMembers", type: "array", required: false, indexed: true },
        { name: "tags", type: "array", required: false, indexed: true },
        { name: "isActive", type: "boolean", required: true, indexed: true, defaultValue: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "isActive", order: "asc" },
            { field: "status", order: "asc" },
            { field: "createdAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "projectManager", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "PROJECT_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("teamMembers", {
      name: "teamMembers",
      category: "team",
      displayName: "Team Members",
      description: "Team member management and roles",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "userId", type: "string", required: true, indexed: true },
        { name: "email", type: "string", required: true, indexed: true },
        { name: "firstName", type: "string", required: true, indexed: false },
        { name: "lastName", type: "string", required: true, indexed: false },
        { name: "role", type: "string", required: true, indexed: true },
        { name: "department", type: "string", required: false, indexed: true },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"] } },
        { name: "permissions", type: "array", required: false, indexed: false },
        { name: "joinedAt", type: "timestamp", required: true, indexed: true },
        { name: "lastActiveAt", type: "timestamp", required: false, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "email", order: "asc" },
            { field: "role", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "department", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "HR_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("inventoryItems", {
      name: "inventoryItems",
      category: "inventory",
      displayName: "Inventory Items",
      description: "Equipment and inventory tracking",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "itemName", type: "string", required: true, indexed: true },
        { name: "category", type: "string", required: true, indexed: true },
        { name: "subcategory", type: "string", required: false, indexed: true },
        { name: "serialNumber", type: "string", required: false, indexed: true },
        { name: "barcode", type: "string", required: false, indexed: true },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED", "LOST"] } },
        { name: "condition", type: "string", required: false, indexed: true, validation: { enum: ["EXCELLENT", "GOOD", "FAIR", "POOR"] } },
        { name: "location", type: "string", required: false, indexed: true },
        { name: "assignedTo", type: "string", required: false, indexed: true },
        { name: "purchaseDate", type: "timestamp", required: false, indexed: true },
        { name: "purchasePrice", type: "number", required: false, indexed: false },
        { name: "warrantyExpiry", type: "timestamp", required: false, indexed: true },
        { name: "notes", type: "string", required: false, indexed: false },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "category", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "assignedTo", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "INVENTORY_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("reviews", {
      name: "reviews",
      category: "media",
      displayName: "Reviews",
      description: "Content review and approval system",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "sessionId", type: "string", required: false, indexed: true },
        { name: "mediaFileId", type: "string", required: false, indexed: true },
        { name: "reviewTitle", type: "string", required: true, indexed: false },
        { name: "reviewType", type: "string", required: true, indexed: true, validation: { enum: ["CONTENT", "TECHNICAL", "CREATIVE", "FINAL"] } },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "REVISION_NEEDED"] } },
        { name: "reviewerId", type: "string", required: true, indexed: true },
        { name: "reviewerName", type: "string", required: false, indexed: false },
        { name: "reviewNotes", type: "string", required: false, indexed: false },
        { name: "dueDate", type: "timestamp", required: false, indexed: true },
        { name: "completedAt", type: "timestamp", required: false, indexed: true },
        { name: "priority", type: "string", required: false, indexed: true, validation: { enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] } },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "dueDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "reviewerId", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "PRODUCER", "DIRECTOR", "POST_SUPERVISOR"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("reports", {
      name: "reports",
      category: "media",
      displayName: "Reports",
      description: "Analytics and reporting system",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "reportTitle", type: "string", required: true, indexed: true },
        { name: "reportType", type: "string", required: true, indexed: true, validation: { enum: ["ANALYTICS", "PERFORMANCE", "USAGE", "FINANCIAL", "OPERATIONAL"] } },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["DRAFT", "GENERATING", "COMPLETED", "FAILED", "ARCHIVED"] } },
        { name: "generatedBy", type: "string", required: true, indexed: true },
        { name: "reportData", type: "object", required: false, indexed: false },
        { name: "parameters", type: "object", required: false, indexed: false },
        { name: "dateRange", type: "object", required: false, indexed: false },
        { name: "fileUrl", type: "string", required: false, indexed: false },
        { name: "tags", type: "array", required: false, indexed: true },
        { name: "isPublic", type: "boolean", required: false, indexed: true, defaultValue: false },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "reportType", order: "asc" },
            { field: "createdAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "generatedBy", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("notes", {
      name: "notes",
      category: "media",
      displayName: "Notes",
      description: "General notes and comments",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "title", type: "string", required: true, indexed: true },
        { name: "content", type: "string", required: true, indexed: false },
        { name: "noteType", type: "string", required: false, indexed: true, validation: { enum: ["GENERAL", "PRODUCTION", "TECHNICAL", "CREATIVE", "MEETING"] } },
        { name: "authorId", type: "string", required: true, indexed: true },
        { name: "authorName", type: "string", required: false, indexed: false },
        { name: "sessionId", type: "string", required: false, indexed: true },
        { name: "projectId", type: "string", required: false, indexed: true },
        { name: "tags", type: "array", required: false, indexed: true },
        { name: "isPrivate", type: "boolean", required: false, indexed: true, defaultValue: false },
        { name: "attachments", type: "array", required: false, indexed: false },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "authorId", order: "asc" },
            { field: "createdAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "noteType", order: "asc" },
            { field: "createdAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["MEMBER", "ADMIN", "OWNER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("callSheets", {
      name: "callSheets",
      category: "media",
      displayName: "Call Sheets",
      description: "Production call sheets",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "sessionId", type: "string", required: true, indexed: true },
        { name: "callSheetNumber", type: "string", required: true, indexed: true },
        { name: "productionDate", type: "timestamp", required: true, indexed: true },
        { name: "location", type: "string", required: false, indexed: true },
        { name: "callTime", type: "timestamp", required: false, indexed: true },
        { name: "wrapTime", type: "timestamp", required: false, indexed: true },
        { name: "weather", type: "string", required: false, indexed: false },
        { name: "sunrise", type: "string", required: false, indexed: false },
        { name: "sunset", type: "string", required: false, indexed: false },
        { name: "crewList", type: "array", required: false, indexed: false },
        { name: "equipmentList", type: "array", required: false, indexed: false },
        { name: "specialNotes", type: "string", required: false, indexed: false },
        { name: "emergencyContacts", type: "array", required: false, indexed: false },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["DRAFT", "PUBLISHED", "REVISED", "CANCELLED"] } },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "sessionId", order: "asc" },
            { field: "productionDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "productionDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "PRODUCER", "COORDINATOR"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("stages", {
      name: "stages",
      category: "media",
      displayName: "Stages",
      description: "Production stages and milestones",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "projectId", type: "string", required: false, indexed: true },
        { name: "stageName", type: "string", required: true, indexed: true },
        { name: "stageType", type: "string", required: true, indexed: true, validation: { enum: ["PRE_PRODUCTION", "PRODUCTION", "POST_PRODUCTION", "DELIVERY", "ARCHIVE"] } },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED"] } },
        { name: "startDate", type: "timestamp", required: false, indexed: true },
        { name: "endDate", type: "timestamp", required: false, indexed: true },
        { name: "estimatedDuration", type: "number", required: false, indexed: false },
        { name: "actualDuration", type: "number", required: false, indexed: false },
        { name: "assignedTo", type: "array", required: false, indexed: true },
        { name: "dependencies", type: "array", required: false, indexed: false },
        { name: "deliverables", type: "array", required: false, indexed: false },
        { name: "completionPercentage", type: "number", required: false, indexed: true, defaultValue: 0 },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "projectId", order: "asc" },
            { field: "stageType", order: "asc" }
          ],
          queryScope: "COLLECTION"
        },
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "startDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "PRODUCER", "PROJECT_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("inventory", {
      name: "inventory",
      category: "inventory",
      displayName: "Inventory",
      description: "General inventory management",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "inventoryName", type: "string", required: true, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "location", type: "string", required: false, indexed: true },
        { name: "managedBy", type: "string", required: false, indexed: true },
        { name: "totalItems", type: "number", required: false, indexed: false, defaultValue: 0 },
        { name: "totalValue", type: "number", required: false, indexed: false, defaultValue: 0 },
        { name: "lastAuditDate", type: "timestamp", required: false, indexed: true },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["ACTIVE", "INACTIVE", "MAINTENANCE", "ARCHIVED"] } },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "createdAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "INVENTORY_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("networks", {
      name: "networks",
      category: "inventory",
      displayName: "Networks",
      description: "Network configuration and management",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "networkName", type: "string", required: true, indexed: true },
        { name: "networkType", type: "string", required: true, indexed: true, validation: { enum: ["LAN", "WAN", "WIFI", "VPN", "CELLULAR"] } },
        { name: "ipRange", type: "string", required: false, indexed: true },
        { name: "subnet", type: "string", required: false, indexed: false },
        { name: "gateway", type: "string", required: false, indexed: false },
        { name: "dns", type: "array", required: false, indexed: false },
        { name: "vlan", type: "number", required: false, indexed: true },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["ACTIVE", "INACTIVE", "MAINTENANCE", "ERROR"] } },
        { name: "location", type: "string", required: false, indexed: true },
        { name: "managedBy", type: "string", required: false, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "networkType", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "NETWORK_ADMIN"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("networkIPAssignments", {
      name: "networkIPAssignments",
      category: "inventory",
      displayName: "Network IP Assignments",
      description: "IP address management and assignments",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "ipAddress", type: "string", required: true, indexed: true },
        { name: "networkId", type: "string", required: true, indexed: true },
        { name: "deviceName", type: "string", required: false, indexed: true },
        { name: "deviceType", type: "string", required: false, indexed: true },
        { name: "macAddress", type: "string", required: false, indexed: true },
        { name: "assignedTo", type: "string", required: false, indexed: true },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["ASSIGNED", "AVAILABLE", "RESERVED", "BLOCKED"] } },
        { name: "assignedDate", type: "timestamp", required: false, indexed: true },
        { name: "notes", type: "string", required: false, indexed: false },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "networkId", order: "asc" },
            { field: "status", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "NETWORK_ADMIN"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("roles", {
      name: "roles",
      category: "team",
      displayName: "Roles",
      description: "Role definitions and permissions",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "roleName", type: "string", required: true, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "hierarchy", type: "number", required: true, indexed: true },
        { name: "permissions", type: "array", required: false, indexed: false },
        { name: "isActive", type: "boolean", required: true, indexed: true, defaultValue: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "hierarchy", order: "asc" },
            { field: "isActive", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("permissions", {
      name: "permissions",
      category: "team",
      displayName: "Permissions",
      description: "Granular permission management",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "roleId", type: "string", required: true, indexed: true },
        { name: "resource", type: "string", required: true, indexed: true },
        { name: "action", type: "string", required: true, indexed: true },
        { name: "granted", type: "boolean", required: true, indexed: true },
        { name: "conditions", type: "object", required: false, indexed: false },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "roleId", order: "asc" },
            { field: "resource", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("contacts", {
      name: "contacts",
      category: "team",
      displayName: "Contacts",
      description: "Contact management",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "firstName", type: "string", required: true, indexed: true },
        { name: "lastName", type: "string", required: true, indexed: true },
        { name: "email", type: "string", required: false, indexed: true },
        { name: "phone", type: "string", required: false, indexed: true },
        { name: "company", type: "string", required: false, indexed: true },
        { name: "title", type: "string", required: false, indexed: false },
        { name: "contactType", type: "string", required: false, indexed: true, validation: { enum: ["CLIENT", "VENDOR", "CONTRACTOR", "PARTNER", "OTHER"] } },
        { name: "address", type: "object", required: false, indexed: false },
        { name: "notes", type: "string", required: false, indexed: false },
        { name: "tags", type: "array", required: false, indexed: true },
        { name: "isActive", type: "boolean", required: true, indexed: true, defaultValue: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "contactType", order: "asc" },
            { field: "lastName", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "BUSINESS_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("clients", {
      name: "clients",
      category: "business",
      displayName: "Clients",
      description: "Client relationship management",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "clientName", type: "string", required: true, indexed: true },
        { name: "companyName", type: "string", required: false, indexed: true },
        { name: "email", type: "string", required: false, indexed: true },
        { name: "phone", type: "string", required: false, indexed: true },
        { name: "address", type: "object", required: false, indexed: false },
        { name: "clientType", type: "string", required: false, indexed: true, validation: { enum: ["INDIVIDUAL", "BUSINESS", "ENTERPRISE", "GOVERNMENT"] } },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["ACTIVE", "INACTIVE", "PROSPECT", "FORMER"] } },
        { name: "accountManager", type: "string", required: false, indexed: true },
        { name: "contractValue", type: "number", required: false, indexed: false },
        { name: "notes", type: "string", required: false, indexed: false },
        { name: "tags", type: "array", required: false, indexed: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "clientName", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "BUSINESS_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("mapLayouts", {
      name: "mapLayouts",
      category: "inventory",
      displayName: "Map Layouts",
      description: "Facility and equipment layouts",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "layoutName", type: "string", required: true, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "layoutType", type: "string", required: true, indexed: true, validation: { enum: ["FLOOR_PLAN", "SITE_MAP", "NETWORK_DIAGRAM", "EQUIPMENT_LAYOUT"] } },
        { name: "imageUrl", type: "string", required: false, indexed: false },
        { name: "coordinates", type: "object", required: false, indexed: false },
        { name: "scale", type: "number", required: false, indexed: false },
        { name: "isActive", type: "boolean", required: true, indexed: true, defaultValue: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "layoutType", order: "asc" },
            { field: "isActive", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "FACILITY_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("mapLocations", {
      name: "mapLocations",
      category: "inventory",
      displayName: "Map Locations",
      description: "Location markers and points of interest",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "mapLayoutId", type: "string", required: true, indexed: true },
        { name: "locationName", type: "string", required: true, indexed: true },
        { name: "locationType", type: "string", required: true, indexed: true, validation: { enum: ["EQUIPMENT", "ROOM", "EXIT", "UTILITY", "STORAGE", "OFFICE"] } },
        { name: "coordinates", type: "object", required: true, indexed: false },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "capacity", type: "number", required: false, indexed: false },
        { name: "isAccessible", type: "boolean", required: false, indexed: true, defaultValue: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "mapLayoutId", order: "asc" },
            { field: "locationType", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "FACILITY_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("setupProfiles", {
      name: "setupProfiles",
      category: "inventory",
      displayName: "Setup Profiles",
      description: "Equipment setup configurations",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "profileName", type: "string", required: true, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "equipmentType", type: "string", required: true, indexed: true },
        { name: "configuration", type: "object", required: true, indexed: false },
        { name: "settings", type: "object", required: false, indexed: false },
        { name: "isDefault", type: "boolean", required: false, indexed: true, defaultValue: false },
        { name: "isActive", type: "boolean", required: true, indexed: true, defaultValue: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "equipmentType", order: "asc" },
            { field: "isActive", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "TECHNICAL_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("schemas", {
      name: "schemas",
      category: "inventory",
      displayName: "Schemas",
      description: "Data schema definitions",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "schemaName", type: "string", required: true, indexed: true },
        { name: "version", type: "string", required: true, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "schemaType", type: "string", required: true, indexed: true, validation: { enum: ["DATABASE", "API", "FILE", "MESSAGE"] } },
        { name: "definition", type: "object", required: true, indexed: false },
        { name: "isActive", type: "boolean", required: true, indexed: true, defaultValue: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "schemaType", order: "asc" },
            { field: "version", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "DEVELOPER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("organizations", {
      name: "organizations",
      category: "team",
      displayName: "Organizations",
      description: "Organization metadata",
      organizationScoped: false,
      // Organizations are global
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "name", type: "string", required: true, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "type", type: "string", required: false, indexed: true, validation: { enum: ["BUSINESS", "NON_PROFIT", "GOVERNMENT", "EDUCATIONAL"] } },
        { name: "industry", type: "string", required: false, indexed: true },
        { name: "size", type: "string", required: false, indexed: true, validation: { enum: ["STARTUP", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"] } },
        { name: "address", type: "object", required: false, indexed: false },
        { name: "website", type: "string", required: false, indexed: false },
        { name: "phone", type: "string", required: false, indexed: false },
        { name: "email", type: "string", required: false, indexed: true },
        { name: "settings", type: "object", required: false, indexed: false },
        { name: "isActive", type: "boolean", required: true, indexed: true, defaultValue: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "name", order: "asc" },
            { field: "isActive", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("pbmProjects", {
      name: "pbmProjects",
      category: "business",
      displayName: "PBM Projects",
      description: "Project budget management projects",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "projectName", type: "string", required: true, indexed: true },
        { name: "projectCode", type: "string", required: false, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "budget", type: "number", required: false, indexed: false },
        { name: "actualCost", type: "number", required: false, indexed: false, defaultValue: 0 },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"] } },
        { name: "startDate", type: "timestamp", required: false, indexed: true },
        { name: "endDate", type: "timestamp", required: false, indexed: true },
        { name: "projectManager", type: "string", required: false, indexed: true },
        { name: "clientId", type: "string", required: false, indexed: true },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "startDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "PROJECT_MANAGER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("pbmSchedules", {
      name: "pbmSchedules",
      category: "business",
      displayName: "PBM Schedules",
      description: "Scheduling and resource allocation",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "projectId", type: "string", required: true, indexed: true },
        { name: "scheduleName", type: "string", required: true, indexed: true },
        { name: "description", type: "string", required: false, indexed: false },
        { name: "startDate", type: "timestamp", required: true, indexed: true },
        { name: "endDate", type: "timestamp", required: true, indexed: true },
        { name: "resources", type: "array", required: false, indexed: false },
        { name: "milestones", type: "array", required: false, indexed: false },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["DRAFT", "ACTIVE", "COMPLETED", "DELAYED", "CANCELLED"] } },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "projectId", order: "asc" },
            { field: "startDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER", "PROJECT_MANAGER", "SCHEDULER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("licenses", {
      name: "licenses",
      category: "business",
      displayName: "Licenses",
      description: "License management",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "licenseKey", type: "string", required: true, indexed: true },
        { name: "licenseName", type: "string", required: true, indexed: true },
        { name: "licenseType", type: "string", required: true, indexed: true, validation: { enum: ["BASIC", "PRO", "ENTERPRISE", "TRIAL"] } },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["ACTIVE", "INACTIVE", "EXPIRED", "SUSPENDED", "REVOKED"] } },
        { name: "assignedTo", type: "string", required: false, indexed: true },
        { name: "issuedDate", type: "timestamp", required: true, indexed: true },
        { name: "expiryDate", type: "timestamp", required: false, indexed: true },
        { name: "maxUsers", type: "number", required: false, indexed: false },
        { name: "features", type: "array", required: false, indexed: false },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "expiryDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("subscriptions", {
      name: "subscriptions",
      category: "business",
      displayName: "Subscriptions",
      description: "Subscription tracking",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true },
        { name: "organizationId", type: "string", required: true, indexed: true },
        { name: "subscriptionName", type: "string", required: true, indexed: true },
        { name: "plan", type: "string", required: true, indexed: true, validation: { enum: ["BASIC", "PRO", "ENTERPRISE"] } },
        { name: "status", type: "string", required: true, indexed: true, validation: { enum: ["ACTIVE", "INACTIVE", "CANCELLED", "PAST_DUE", "TRIALING"] } },
        { name: "billingCycle", type: "string", required: false, indexed: true, validation: { enum: ["MONTHLY", "YEARLY", "QUARTERLY"] } },
        { name: "amount", type: "number", required: false, indexed: false },
        { name: "currency", type: "string", required: false, indexed: false, defaultValue: "USD" },
        { name: "startDate", type: "timestamp", required: true, indexed: true },
        { name: "endDate", type: "timestamp", required: false, indexed: true },
        { name: "nextBillingDate", type: "timestamp", required: false, indexed: true },
        { name: "paymentMethod", type: "string", required: false, indexed: false },
        { name: "createdBy", type: "string", required: true, indexed: true },
        { name: "createdAt", type: "timestamp", required: true, indexed: true },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "status", order: "asc" },
            { field: "nextBillingDate", order: "asc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
    this.templates.set("custom", {
      name: "custom",
      category: "custom",
      displayName: "Custom Collection",
      description: "Create a custom collection with your own fields",
      organizationScoped: true,
      fields: [
        { name: "id", type: "string", required: true, indexed: true, description: "Unique document identifier" },
        { name: "organizationId", type: "string", required: true, indexed: true, description: "Organization ID for access control" },
        { name: "createdAt", type: "timestamp", required: true, indexed: true, description: "Creation timestamp" },
        { name: "updatedAt", type: "timestamp", required: true, indexed: true, description: "Last update timestamp" }
      ],
      indexes: [
        {
          fields: [
            { field: "organizationId", order: "asc" },
            { field: "createdAt", order: "desc" }
          ],
          queryScope: "COLLECTION"
        }
      ],
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER"],
        admin: ["ADMIN", "OWNER"]
      }
    });
  }
  /**
   * Get a collection template by name
   */
  getCollectionTemplate(templateName) {
    return __async(this, null, function* () {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template '${templateName}' not found`);
      }
      return __spreadValues({}, template);
    });
  }
  /**
   * Get all available templates for a category
   */
  getTemplatesByCategory(category) {
    return Array.from(this.templates.values()).filter((template) => template.category === category);
  }
  /**
   * Get all available templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }
  /**
   * Validate a custom field configuration
   */
  validateField(field) {
    const errors = [];
    if (!field.name || !field.name.trim()) {
      errors.push("Field name is required");
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
      errors.push("Field name must start with a letter and contain only letters, numbers, and underscores");
    }
    const reservedNames = ["id", "organizationId", "createdAt", "updatedAt"];
    if (reservedNames.includes(field.name)) {
      errors.push(`'${field.name}' is a reserved field name`);
    }
    const validTypes = ["string", "number", "boolean", "timestamp", "array", "object", "reference"];
    if (!validTypes.includes(field.type)) {
      errors.push("Invalid field type");
    }
    if (field.validation) {
      if (field.type === "number") {
        if (field.validation.min !== void 0 && field.validation.max !== void 0) {
          if (field.validation.min >= field.validation.max) {
            errors.push("Minimum value must be less than maximum value");
          }
        }
      }
      if (field.type === "string" && field.validation.pattern) {
        try {
          new RegExp(field.validation.pattern);
        } catch (e) {
          errors.push("Invalid regex pattern");
        }
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * Generate Firestore indexes for a template
   */
  generateFirestoreIndexes(template) {
    return {
      indexes: template.indexes.map((index) => ({
        collectionGroup: template.name,
        queryScope: index.queryScope,
        fields: index.fields.map((field) => ({
          fieldPath: field.field,
          order: field.order === "array-contains" ? void 0 : field.order.toUpperCase(),
          arrayConfig: field.order === "array-contains" ? "CONTAINS" : void 0
        })).filter((field) => field.order || field.arrayConfig)
      }))
    };
  }
  /**
   * Generate Firebase security rules for a template
   */
  generateSecurityRules(template) {
    const collectionName = template.name;
    const readRoles = template.securityRules.read.map((role) => `'${role}'`).join(", ");
    const writeRoles = template.securityRules.write.map((role) => `'${role}'`).join(", ");
    return `
    // ${template.displayName} Collection
    match /${collectionName}/{docId} {
      allow read: if isAuthenticated() && 
        belongsToOrganization(resource.data.organizationId) &&
        hasAnyRole([${readRoles}]);
      
      allow write: if isAuthenticated() && 
        belongsToOrganization(request.resource.data.organizationId) &&
        hasAnyRole([${writeRoles}]) &&
        request.resource.data.organizationId == getOrganizationId();
      
      allow create: if isAuthenticated() && 
        hasAnyRole([${writeRoles}]) &&
        request.resource.data.organizationId == getOrganizationId();
    }`;
  }
  /**
   * Create a custom template from user-defined fields
   */
  createCustomTemplate(name, customFields, organizationScoped = true) {
    const baseFields = [
      { name: "id", type: "string", required: true, indexed: true, description: "Unique document identifier" },
      { name: "createdAt", type: "timestamp", required: true, indexed: true, description: "Creation timestamp" },
      { name: "updatedAt", type: "timestamp", required: true, indexed: true, description: "Last update timestamp" }
    ];
    if (organizationScoped) {
      baseFields.splice(1, 0, {
        name: "organizationId",
        type: "string",
        required: true,
        indexed: true,
        description: "Organization ID for access control"
      });
    }
    const allFields = [...baseFields, ...customFields];
    const indexes = [
      {
        fields: organizationScoped ? [{ field: "organizationId", order: "asc" }, { field: "createdAt", order: "desc" }] : [{ field: "createdAt", order: "desc" }],
        queryScope: "COLLECTION"
      }
    ];
    customFields.forEach((field) => {
      if (field.indexed && organizationScoped) {
        indexes.push({
          fields: [
            { field: "organizationId", order: "asc" },
            { field: field.name, order: "asc" }
          ],
          queryScope: "COLLECTION"
        });
      }
    });
    return {
      name,
      category: "custom",
      displayName: name,
      description: `Custom collection: ${name}`,
      organizationScoped,
      fields: allFields,
      indexes,
      securityRules: {
        read: ["MEMBER", "ADMIN", "OWNER"],
        write: ["ADMIN", "OWNER"],
        admin: ["ADMIN", "OWNER"]
      }
    };
  }
}
class FirebaseCollectionCreator {
  constructor() {
    __publicField(this, "functions", getFunctions());
    __publicField(this, "createCollectionFunction", httpsCallable(this.functions, "createCollection"));
    __publicField(this, "updateSecurityRulesFunction", httpsCallable(this.functions, "updateSecurityRules"));
    __publicField(this, "createFirestoreIndexesFunction", httpsCallable(this.functions, "createFirestoreIndexes"));
  }
  /**
   * Check if a collection already exists
   */
  checkCollectionExists(collectionName, organizationId) {
    return __async(this, null, function* () {
      try {
        const collectionRef = collection(db, collectionName);
        let testQuery;
        if (organizationId) {
          testQuery = query(
            collectionRef,
            where("organizationId", "==", organizationId),
            limit(1)
          );
        } else {
          testQuery = query(collectionRef, limit(1));
        }
        const snapshot = yield getDocs(testQuery);
        return !snapshot.empty;
      } catch (error) {
        console.warn("Error checking collection existence:", error);
        return false;
      }
    });
  }
  /**
   * Create a new collection with all necessary components
   */
  createCollection(request) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 Creating collection:", request.name);
        const validation = this.validateCreationRequest(request);
        if (!validation.valid) {
          return {
            success: false,
            error: validation.errors.join(", ")
          };
        }
        const exists = yield this.checkCollectionExists(request.name, request.organizationId);
        if (exists) {
          return {
            success: false,
            error: "Collection already exists"
          };
        }
        const collectionResult = yield this.createCollectionStructure(request);
        if (!collectionResult.success) {
          return collectionResult;
        }
        const indexResult = yield this.createFirestoreIndexes(request);
        const securityResult = yield this.updateSecurityRules(request);
        const docResult = yield this.createInitialDocument(request);
        return {
          success: true,
          collectionName: request.name,
          details: {
            collectionCreated: collectionResult.success,
            indexesCreated: indexResult.success,
            securityRulesUpdated: securityResult.success,
            initialDocumentCreated: docResult.success
          }
        };
      } catch (error) {
        console.error("Collection creation failed:", error);
        return {
          success: false,
          error: error.message || "Unknown error occurred"
        };
      }
    });
  }
  /**
   * Validate the collection creation request
   */
  validateCreationRequest(request) {
    const errors = [];
    if (!request.name || !request.name.trim()) {
      errors.push("Collection name is required");
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(request.name)) {
      errors.push("Collection name must start with a letter and contain only letters, numbers, and underscores");
    }
    if (!request.template) {
      errors.push("Collection template is required");
    }
    if (!request.organizationId) {
      errors.push("Organization ID is required");
    }
    if (!request.createdBy) {
      errors.push("Creator user ID is required");
    }
    if (request.customFields) {
      request.customFields.forEach((field, index) => {
        if (!field.name || !field.name.trim()) {
          errors.push(`Custom field ${index + 1}: name is required`);
        }
        if (!field.type) {
          errors.push(`Custom field ${index + 1}: type is required`);
        }
      });
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * Create the collection structure using Firebase Functions
   */
  createCollectionStructure(request) {
    return __async(this, null, function* () {
      try {
        const result = yield this.createCollectionFunction({
          collectionName: request.name,
          template: request.template,
          organizationId: request.organizationId,
          createdBy: request.createdBy,
          customFields: request.customFields
        });
        const data = result.data;
        if (data.success) {
          console.log("✅ Collection structure created successfully");
          return { success: true };
        } else {
          console.error("❌ Collection structure creation failed:", data.error);
          return {
            success: false,
            error: data.error || "Failed to create collection structure"
          };
        }
      } catch (error) {
        console.error("❌ Collection structure creation error:", error);
        console.log("🔄 Attempting local collection creation as fallback...");
        return yield this.createCollectionLocally(request);
      }
    });
  }
  /**
   * Fallback method to create collection locally
   */
  createCollectionLocally(request) {
    return __async(this, null, function* () {
      try {
        const metadataDoc = {
          collectionName: request.name,
          template: request.template.name,
          organizationId: request.organizationId,
          createdBy: request.createdBy,
          createdAt: Timestamp.now(),
          schema: {
            fields: request.template.fields,
            indexes: request.template.indexes,
            securityRules: request.template.securityRules
          },
          customFields: request.customFields || [],
          isActive: true
        };
        const metadataRef = doc(db, "collectionRegistry", request.name);
        yield setDoc(metadataRef, metadataDoc);
        console.log("✅ Collection metadata created locally");
        return { success: true };
      } catch (error) {
        console.error("❌ Local collection creation failed:", error);
        return {
          success: false,
          error: error.message || "Failed to create collection locally"
        };
      }
    });
  }
  /**
   * Create Firestore indexes for the collection
   */
  createFirestoreIndexes(request) {
    return __async(this, null, function* () {
      try {
        const indexConfig = {
          indexes: request.template.indexes.map((index) => ({
            collectionGroup: request.name,
            queryScope: index.queryScope,
            fields: index.fields.map((field) => ({
              fieldPath: field.field,
              order: field.order === "array-contains" ? void 0 : field.order.toUpperCase(),
              arrayConfig: field.order === "array-contains" ? "CONTAINS" : void 0
            })).filter((field) => field.order || field.arrayConfig)
          }))
        };
        const result = yield this.createFirestoreIndexesFunction({
          collectionName: request.name,
          indexConfig,
          organizationId: request.organizationId
        });
        const data = result.data;
        if (data.success) {
          console.log("✅ Firestore indexes created successfully");
          return { success: true };
        } else {
          console.warn("⚠️ Firestore indexes creation failed:", data.error);
          return {
            success: false,
            error: data.error || "Failed to create Firestore indexes"
          };
        }
      } catch (error) {
        console.warn("⚠️ Firestore indexes creation error:", error);
        return {
          success: false,
          error: error.message || "Failed to create Firestore indexes"
        };
      }
    });
  }
  /**
   * Update Firebase security rules for the collection
   */
  updateSecurityRules(request) {
    return __async(this, null, function* () {
      try {
        const securityRules = this.generateSecurityRules(request.name, request.template);
        const result = yield this.updateSecurityRulesFunction({
          collectionName: request.name,
          securityRules,
          organizationId: request.organizationId
        });
        const data = result.data;
        if (data.success) {
          console.log("✅ Security rules updated successfully");
          return { success: true };
        } else {
          console.warn("⚠️ Security rules update failed:", data.error);
          return {
            success: false,
            error: data.error || "Failed to update security rules"
          };
        }
      } catch (error) {
        console.warn("⚠️ Security rules update error:", error);
        return {
          success: false,
          error: error.message || "Failed to update security rules"
        };
      }
    });
  }
  /**
   * Create an initial document to establish the collection
   */
  createInitialDocument(request) {
    return __async(this, null, function* () {
      try {
        const initialData = {
          id: "initial-doc",
          organizationId: request.organizationId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: request.createdBy,
          isInitialDocument: true,
          collectionTemplate: request.template.name
        };
        request.template.fields.forEach((field) => {
          if (field.required && field.defaultValue !== void 0) {
            initialData[field.name] = field.defaultValue;
          }
        });
        if (request.customFields) {
          request.customFields.forEach((field) => {
            if (field.required && field.defaultValue !== void 0) {
              initialData[field.name] = field.defaultValue;
            }
          });
        }
        const docRef = doc(db, request.name, "initial-doc");
        yield setDoc(docRef, initialData);
        console.log("✅ Initial document created successfully");
        return { success: true };
      } catch (error) {
        console.error("❌ Initial document creation failed:", error);
        return {
          success: false,
          error: error.message || "Failed to create initial document"
        };
      }
    });
  }
  /**
   * Generate security rules for a collection
   */
  generateSecurityRules(collectionName, template) {
    const readRoles = template.securityRules.read.map((role) => `'${role}'`).join(", ");
    const writeRoles = template.securityRules.write.map((role) => `'${role}'`).join(", ");
    return `
    // ${template.displayName} Collection - Auto-generated
    match /${collectionName}/{docId} {
      allow read: if isAuthenticated() && 
        belongsToOrganization(resource.data.organizationId) &&
        hasAnyRole([${readRoles}]);
      
      allow write: if isAuthenticated() && 
        belongsToOrganization(request.resource.data.organizationId) &&
        hasAnyRole([${writeRoles}]) &&
        request.resource.data.organizationId == getOrganizationId();
      
      allow create: if isAuthenticated() && 
        hasAnyRole([${writeRoles}]) &&
        request.resource.data.organizationId == getOrganizationId();
    }`;
  }
  /**
   * Get collection creation status
   */
  getCollectionStatus(collectionName, organizationId) {
    return __async(this, null, function* () {
      try {
        const collectionRef = collection(db, collectionName);
        const docsQuery = query(
          collectionRef,
          where("organizationId", "==", organizationId),
          limit(10)
        );
        const docsSnapshot = yield getDocs(docsQuery);
        const metadataRef = doc(db, "collectionRegistry", collectionName);
        const metadataDoc = yield getDoc(metadataRef);
        return {
          exists: !docsSnapshot.empty || metadataDoc.exists(),
          hasDocuments: !docsSnapshot.empty,
          hasMetadata: metadataDoc.exists(),
          documentCount: docsSnapshot.size
        };
      } catch (error) {
        console.error("Error checking collection status:", error);
        return {
          exists: false,
          hasDocuments: false,
          hasMetadata: false
        };
      }
    });
  }
  /**
   * Delete a collection (admin only)
   */
  deleteCollection(collectionName, organizationId) {
    return __async(this, null, function* () {
      try {
        console.warn("Collection deletion should be handled by Firebase Functions with admin permissions");
        return {
          success: false,
          error: "Collection deletion must be performed by an administrator through Firebase Functions"
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || "Failed to delete collection"
        };
      }
    });
  }
}
const COLLECTION_CATEGORIES = {
  "sessions": {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MovieIcon, {}),
    name: "Sessions & Workflows",
    description: "Production sessions, workflows, and task management",
    templates: [
      "sessions",
      "sessionWorkflows",
      "sessionTasks",
      "sessionAssignments",
      "sessionReviews",
      "postProductionTasks",
      "workflowTemplates",
      "workflowInstances"
    ]
  },
  "media": {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
    name: "Media & Content",
    description: "Media files, reviews, and content management",
    templates: [
      "mediaFiles",
      "reviews",
      "notes",
      "reports",
      "callSheets",
      "stages"
    ]
  },
  "inventory": {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Inventory, {}),
    name: "Inventory & Equipment",
    description: "Equipment tracking, network management, and inventory systems",
    templates: [
      "inventoryItems",
      "inventory",
      "networks",
      "networkIPAssignments",
      "mapLayouts",
      "mapLocations",
      "setupProfiles",
      "schemas"
    ]
  },
  "team": {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}),
    name: "Team & Organization",
    description: "Team members, roles, and organizational data",
    templates: [
      "teamMembers",
      "roles",
      "permissions",
      "organizations",
      "contacts"
    ]
  },
  "business": {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Business, {}),
    name: "Business & Projects",
    description: "Projects, clients, and business management",
    templates: [
      "projects",
      "clients",
      "pbmProjects",
      "pbmSchedules",
      "licenses",
      "subscriptions"
    ]
  },
  "custom": {
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExtensionIcon, {}),
    name: "Custom Collection",
    description: "Create a custom collection with guided schema builder",
    templates: ["custom"]
  }
};
const steps = [
  "Select Category",
  "Choose Template",
  "Configure Collection",
  "Review & Create"
];
const CollectionCreationWizard = ({
  open,
  onClose,
  onCollectionCreated
}) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = reactExports.useState(0);
  const [selectedCategory, setSelectedCategory] = reactExports.useState("");
  const [selectedTemplate, setSelectedTemplate] = reactExports.useState("");
  const [collectionName, setCollectionName] = reactExports.useState("");
  const [customFields, setCustomFields] = reactExports.useState([]);
  const [template, setTemplate] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [validationErrors, setValidationErrors] = reactExports.useState([]);
  const [schemaService] = reactExports.useState(() => new CollectionSchemaService());
  const [creatorService] = reactExports.useState(() => new FirebaseCollectionCreator());
  reactExports.useEffect(() => {
    if (selectedTemplate && selectedTemplate !== "custom") {
      loadTemplate();
    }
  }, [selectedTemplate]);
  const loadTemplate = () => __async(void 0, null, function* () {
    try {
      const templateData = yield schemaService.getCollectionTemplate(selectedTemplate);
      setTemplate(templateData);
      setCollectionName(selectedTemplate);
    } catch (error2) {
      console.error("Failed to load template:", error2);
      setError("Failed to load collection template");
    }
  });
  const handleNext = () => __async(void 0, null, function* () {
    if (activeStep === steps.length - 1) {
      yield handleCreateCollection();
    } else {
      const isValid = yield validateStep(activeStep);
      if (isValid) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  });
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const validateStep = (step) => __async(void 0, null, function* () {
    const errors = [];
    switch (step) {
      case 0:
        if (!selectedCategory) {
          errors.push("Please select a collection category");
        }
        break;
      case 1:
        if (!selectedTemplate) {
          errors.push("Please select a collection template");
        }
        break;
      case 2:
        if (!collectionName.trim()) {
          errors.push("Collection name is required");
        } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(collectionName)) {
          errors.push("Collection name must start with a letter and contain only letters, numbers, and underscores");
        }
        if (selectedTemplate === "custom" && customFields.length === 0) {
          errors.push("Custom collections must have at least one field");
        }
        const exists = yield creatorService.checkCollectionExists(collectionName, user == null ? void 0 : user.organizationId);
        if (exists) {
          errors.push("A collection with this name already exists");
        }
        break;
    }
    setValidationErrors(errors);
    return errors.length === 0;
  });
  const handleCreateCollection = () => __async(void 0, null, function* () {
    setLoading(true);
    setError("");
    try {
      if (!template || !(user == null ? void 0 : user.organizationId)) {
        throw new Error("Missing required data for collection creation");
      }
      const result = yield creatorService.createCollection({
        name: collectionName,
        template,
        organizationId: user.organizationId,
        createdBy: user.firebaseUid || user.id,
        customFields: selectedTemplate === "custom" ? customFields : void 0
      });
      if (result.success) {
        onCollectionCreated(collectionName, template);
        onClose();
        resetWizard();
      } else {
        setError(result.error || "Failed to create collection");
      }
    } catch (error2) {
      console.error("Collection creation failed:", error2);
      setError(error2.message || "Failed to create collection");
    } finally {
      setLoading(false);
    }
  });
  const resetWizard = () => {
    setActiveStep(0);
    setSelectedCategory("");
    setSelectedTemplate("");
    setCollectionName("");
    setCustomFields([]);
    setTemplate(null);
    setError("");
    setValidationErrors([]);
  };
  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      {
        name: "",
        type: "string",
        required: false,
        indexed: false
      }
    ]);
  };
  const updateCustomField = (index, field) => {
    const updatedFields = [...customFields];
    updatedFields[index] = __spreadValues(__spreadValues({}, updatedFields[index]), field);
    setCustomFields(updatedFields);
  };
  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderCategorySelection();
      case 1:
        return renderTemplateSelection();
      case 2:
        return renderConfiguration();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };
  const renderCategorySelection = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Select Collection Category" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: "Choose the type of collection you want to create. Each category provides templates that follow the Dashboard app's schema patterns." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: Object.entries(COLLECTION_CATEGORIES).map(([key, category]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        sx: {
          cursor: "pointer",
          border: selectedCategory === key ? 2 : 1,
          borderColor: selectedCategory === key ? "primary.main" : "divider",
          "&:hover": { borderColor: "primary.main" }
        },
        onClick: () => setSelectedCategory(key),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", mb: 1, children: [
            category.icon,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", ml: 1, children: category.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: category.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { mt: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              size: "small",
              label: `${category.templates.length} templates`,
              color: selectedCategory === key ? "primary" : "default"
            }
          ) })
        ] })
      }
    ) }, key)) })
  ] });
  const renderTemplateSelection = () => {
    const category = COLLECTION_CATEGORIES[selectedCategory];
    if (!category) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Choose Collection Template" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: [
        "Select a template from the ",
        category.name,
        " category. Templates include pre-configured fields, indexes, and security rules."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Template" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Select,
          {
            value: selectedTemplate,
            onChange: (e) => setSelectedTemplate(e.target.value),
            label: "Template",
            children: category.templates.map((templateName) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: templateName, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", width: "100%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: templateName }),
              templateName === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Custom", color: "secondary", sx: { ml: 1 } })
            ] }) }, templateName))
          }
        )
      ] }),
      selectedTemplate && selectedTemplate !== "custom" && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { mt: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {}), children: "This template includes pre-configured fields, indexes, and security rules based on the Dashboard app's schema patterns." }) })
    ] });
  };
  const renderConfiguration = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Configure Collection" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TextField,
      {
        fullWidth: true,
        label: "Collection Name",
        value: collectionName,
        onChange: (e) => setCollectionName(e.target.value),
        margin: "normal",
        helperText: "Must start with a letter and contain only letters, numbers, and underscores",
        error: validationErrors.some((error2) => error2.includes("Collection name"))
      }
    ),
    selectedTemplate === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { mt: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", children: "Custom Fields" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
            onClick: addCustomField,
            variant: "outlined",
            size: "small",
            children: "Add Field"
          }
        )
      ] }),
      customFields.map((field, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 2, p: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, alignItems: "center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            size: "small",
            label: "Field Name",
            value: field.name,
            onChange: (e) => updateCustomField(index, { name: e.target.value })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: field.type,
              onChange: (e) => updateCustomField(index, { type: e.target.value }),
              label: "Type",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "string", children: "String" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "number", children: "Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "boolean", children: "Boolean" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "timestamp", children: "Timestamp" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "array", children: "Array" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "object", children: "Object" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "reference", children: "Reference" })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: field.required ? "true" : "false",
              onChange: (e) => updateCustomField(index, { required: e.target.value === "true" }),
              label: "Required",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "false", children: "No" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "true", children: "Yes" })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Indexed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: field.indexed ? "true" : "false",
              onChange: (e) => updateCustomField(index, { indexed: e.target.value === "true" }),
              label: "Indexed",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "false", children: "No" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "true", children: "Yes" })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            size: "small",
            label: "Description",
            value: field.description || "",
            onChange: (e) => updateCustomField(index, { description: e.target.value })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          IconButton,
          {
            onClick: () => removeCustomField(index),
            color: "error",
            size: "small",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {})
          }
        ) })
      ] }) }, index)),
      customFields.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", children: 'Custom collections require at least one field. Click "Add Field" to get started.' })
    ] }),
    template && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { mt: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Accordion, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionSummary, { expandIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Template Preview" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionDetails, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Fields:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, children: template.fields.map((field, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: field.required ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { color: "info" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: field.name,
              secondary: `${field.type}${field.required ? " (required)" : ""}${field.indexed ? " (indexed)" : ""}`
            }
          )
        ] }, index)) })
      ] }) })
    ] }) })
  ] });
  const renderReview = () => {
    var _a;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Review & Create Collection" }),
      template && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Collection Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Name:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: collectionName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Category:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: (_a = COLLECTION_CATEGORIES[selectedCategory]) == null ? void 0 : _a.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Template:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: selectedTemplate })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 6, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Organization Scoped:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: template.organizationScoped ? "Yes" : "No" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "What will be created:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { color: "primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Firestore Collection",
                  secondary: `Collection '${collectionName}' with ${template.fields.length} fields`
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Speed, { color: "primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Firestore Indexes",
                  secondary: `${template.indexes.length} optimized indexes for queries`
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { color: "primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Security Rules",
                  secondary: "Organization-scoped access control rules"
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", children: "Ready to Create" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "This collection will be created in your organization's Firebase project with all necessary indexes and security rules. The collection will follow the Dashboard app's schema patterns for consistency." })
        ] })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose,
      maxWidth: "md",
      fullWidth: true,
      PaperProps: { sx: { minHeight: "600px" } },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExtensionIcon, { sx: { mr: 1 } }),
          "Create New Collection"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { activeStep, sx: { mb: 4 }, children: steps.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepLabel, { children: label }) }, label)) }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }),
          validationErrors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "warning", sx: { mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", children: "Please fix the following issues:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: validationErrors.map((error2, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: error2 }, index)) })
          ] }),
          renderStepContent(activeStep)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, disabled: loading, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              disabled: activeStep === 0 || loading,
              onClick: handleBack,
              children: "Back"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              onClick: handleNext,
              disabled: loading,
              startIcon: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : null,
              children: activeStep === steps.length - 1 ? "Create Collection" : "Next"
            }
          )
        ] })
      ]
    }
  );
};
const mapDatabaseStatusToComponent = (dbStatus) => {
  if (!dbStatus) return "draft";
  const normalized = dbStatus.toUpperCase();
  switch (normalized) {
    case "ACTIVE":
      return "active";
    case "INACTIVE":
      return "draft";
    case "DRAFT":
      return "draft";
    case "COMPLETED":
      return "completed";
    case "ARCHIVED":
      return "archived";
    case "PAUSED":
      return "paused";
    default:
      return "draft";
  }
};
const calculateEnhancedStatus = (project, teamMemberCount = 0, datasetCount = 0) => {
  var _a;
  if ((_a = project.metadata) == null ? void 0 : _a.extendedStatus) {
    const extendedStatus = project.metadata.extendedStatus;
    if (["draft", "active", "in-progress", "completed", "archived", "paused"].includes(extendedStatus)) {
      return extendedStatus;
    }
  }
  const dbStatus = mapDatabaseStatusToComponent(project.status);
  if (dbStatus === "archived" || project.isArchived) {
    return "archived";
  }
  if (dbStatus === "paused") {
    return "paused";
  }
  if (dbStatus === "completed") {
    return "completed";
  }
  if (dbStatus === "active") {
    const hasTeamMembers = teamMemberCount > 0;
    const hasDatasets = datasetCount > 0;
    const hasRecentActivity = project.lastAccessedAt && (/* @__PURE__ */ new Date()).getTime() - new Date(project.lastAccessedAt).getTime() < 7 * 24 * 60 * 60 * 1e3;
    if (hasTeamMembers && hasDatasets && hasRecentActivity) {
      return "in-progress";
    }
    if ((hasTeamMembers || hasDatasets) && !hasRecentActivity) {
      return "active";
    }
    if (hasRecentActivity) {
      return "active";
    }
    return "active";
  }
  return "draft";
};
const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "in-progress":
      return "info";
    case "completed":
      return "success";
    case "draft":
      return "warning";
    case "archived":
      return "default";
    case "paused":
      return "warning";
    default:
      return "default";
  }
};
const getStatusDisplayText = (status) => {
  switch (status) {
    case "active":
      return "Active";
    case "in-progress":
      return "In progress";
    case "completed":
      return "Completed";
    case "draft":
      return "Draft";
    case "archived":
      return "Archived";
    case "paused":
      return "Paused";
    default:
      return "Unknown";
  }
};
const countProjectsByStatus = (projects, teamMemberCounts = {}, datasetCounts = {}) => {
  const counts = {
    draft: 0,
    active: 0,
    "in-progress": 0,
    completed: 0,
    archived: 0,
    paused: 0
  };
  projects.forEach((project) => {
    const teamMemberCount = teamMemberCounts[project.id] || 0;
    const datasetCount = datasetCounts[project.id] || 0;
    const status = calculateEnhancedStatus(project, teamMemberCount, datasetCount);
    counts[status]++;
  });
  return counts;
};
const ProjectDetailsDialog = ({
  open,
  project,
  onClose,
  onProjectUpdated,
  projectDatasets,
  availableDatasets,
  datasetsLoading,
  datasetSearch,
  datasetBackendFilter,
  selectedDatasetId,
  uploading,
  onLoadDatasetsForProject,
  onSetDatasetSearch,
  onSetDatasetBackendFilter,
  onSetSelectedDatasetId,
  onSetError,
  projectTeamMembers,
  teamMembersLoading,
  projectTeamMemberCounts,
  onLoadTeamMembersForProject,
  onShowTeamRoleWizard,
  onShowCreateDatasetWizard,
  onShowDatasetManagementDialog,
  onShowDatasetInsightsDialog
}) => {
  var _a;
  const theme = useTheme();
  const [currentTab, setCurrentTab] = reactExports.useState(0);
  if (!theme || !theme.palette) {
    console.warn("⚠️ [ProjectDetailsDialog] Theme not available, skipping render");
    return null;
  }
  const [teamMemberMenuAnchor, setTeamMemberMenuAnchor] = reactExports.useState(null);
  const [selectedTeamMember, setSelectedTeamMember] = reactExports.useState(null);
  const [editTeamMemberDialog, setEditTeamMemberDialog] = reactExports.useState(false);
  const [removeTeamMemberDialog, setRemoveTeamMemberDialog] = reactExports.useState(false);
  const [teamMemberRole, setTeamMemberRole] = reactExports.useState("");
  const [teamMemberLoading, setTeamMemberLoading] = reactExports.useState(false);
  const [teamMemberError, setTeamMemberError] = reactExports.useState(null);
  const [editingMemberId, setEditingMemberId] = reactExports.useState(null);
  const [editingRole, setEditingRole] = reactExports.useState("");
  const [editingDepartment, setEditingDepartment] = reactExports.useState("");
  const [editingPermissions, setEditingPermissions] = reactExports.useState([]);
  const [savingMember, setSavingMember] = reactExports.useState(null);
  console.log("🔍 ProjectDetailsDialog rendered:", { open, project: project == null ? void 0 : project.name, currentTab });
  reactExports.useEffect(() => {
    if (open) {
      setCurrentTab(0);
    }
  }, [open]);
  const handleClose = reactExports.useCallback(() => {
    setCurrentTab(0);
    onClose();
  }, [onClose]);
  const handleTeamMemberMenuOpen = (event, member) => {
    event.stopPropagation();
    setTeamMemberMenuAnchor(event.currentTarget);
    setSelectedTeamMember(member);
  };
  const handleTeamMemberMenuClose = () => {
    setTeamMemberMenuAnchor(null);
    setSelectedTeamMember(null);
  };
  const handleEditTeamMember = () => {
    if (selectedTeamMember) {
      setTeamMemberRole(selectedTeamMember.role || "MEMBER");
      setEditTeamMemberDialog(true);
    }
    handleTeamMemberMenuClose();
  };
  const handleRemoveTeamMember = () => {
    setRemoveTeamMemberDialog(true);
    handleTeamMemberMenuClose();
  };
  const handleUpdateTeamMemberRole = () => __async(void 0, null, function* () {
    if (!selectedTeamMember || !project) return;
    setTeamMemberLoading(true);
    setTeamMemberError(null);
    try {
      yield cloudProjectIntegration.updateTeamMemberRole(
        project.id,
        selectedTeamMember.id,
        teamMemberRole
      );
      yield onLoadTeamMembersForProject(project);
      setEditTeamMemberDialog(false);
      setSelectedTeamMember(null);
      setTeamMemberRole("");
    } catch (error) {
      console.error("Failed to update team member role:", error);
      setTeamMemberError(error.message || "Failed to update team member role");
    } finally {
      setTeamMemberLoading(false);
    }
  });
  const handleConfirmRemoveTeamMember = () => __async(void 0, null, function* () {
    if (!selectedTeamMember || !project) return;
    setTeamMemberLoading(true);
    setTeamMemberError(null);
    try {
      console.log("🔍 [ProjectDetailsDialog] Removing team member:", {
        projectId: project.id,
        teamMemberId: selectedTeamMember.id,
        teamMemberIdAlt: selectedTeamMember.teamMemberId,
        teamMemberName: selectedTeamMember.name || selectedTeamMember.email,
        fullMemberData: selectedTeamMember
      });
      const memberIdToRemove = selectedTeamMember.teamMemberId || selectedTeamMember.id;
      const success = yield cloudProjectIntegration.removeTeamMemberFromProject(
        project.id,
        memberIdToRemove
      );
      if (success) {
        console.log("✅ [ProjectDetailsDialog] Team member removed successfully");
        yield onLoadTeamMembersForProject(project);
        setRemoveTeamMemberDialog(false);
        setSelectedTeamMember(null);
      } else {
        throw new Error("Failed to remove team member - operation returned false");
      }
    } catch (error) {
      console.error("❌ [ProjectDetailsDialog] Failed to remove team member:", error);
      setTeamMemberError(error.message || "Failed to remove team member");
    } finally {
      setTeamMemberLoading(false);
    }
  });
  const handleStartEdit = (member) => {
    setEditingMemberId(member.id);
    setEditingRole(member.role || "MEMBER");
    setEditingDepartment(member.department || "");
    setEditingPermissions(member.permissions || []);
  };
  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditingRole("");
    setEditingDepartment("");
    setEditingPermissions([]);
  };
  const handleSaveEdit = (member) => __async(void 0, null, function* () {
    if (!project) return;
    setSavingMember(member.id);
    setTeamMemberError(null);
    try {
      yield cloudProjectIntegration.updateTeamMemberRole(
        project.id,
        member.id,
        editingRole
      );
      yield onLoadTeamMembersForProject(project);
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update team member:", error);
      setTeamMemberError(error.message || "Failed to update team member");
    } finally {
      setSavingMember(null);
    }
  });
  const getStatusIcon2 = (status) => {
    switch (status) {
      case "draft":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {});
      case "active":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {});
      case "in-progress":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 });
      case "completed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {});
      case "archived":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {});
      case "paused":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {});
    }
  };
  const getApplicationModeIcon = (mode) => {
    return mode === "standalone" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIcon, {});
  };
  const getStorageBackendIcon = (backend) => {
    switch (backend) {
      case "gcs":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {});
      case "s3":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {});
      case "local":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {});
    }
  };
  const handleAssignDataset = () => __async(void 0, null, function* () {
    if (!project || !selectedDatasetId) return;
    try {
      yield cloudProjectIntegration.assignDatasetToProject(project.id, selectedDatasetId);
      yield onLoadDatasetsForProject(project);
      onSetSelectedDatasetId("");
      onProjectUpdated == null ? void 0 : onProjectUpdated();
    } catch (error) {
      console.error("Failed to assign dataset:", error);
      onSetError("Failed to assign dataset to project");
    }
  });
  const handleRemoveDataset = (datasetId) => __async(void 0, null, function* () {
    if (!project) return;
    try {
      yield cloudProjectIntegration.unassignDatasetFromProject(project.id, datasetId);
      yield onLoadDatasetsForProject(project);
      onProjectUpdated == null ? void 0 : onProjectUpdated();
    } catch (error) {
      console.error("Failed to remove dataset:", error);
      onSetError("Failed to remove dataset from project");
    }
  });
  if (!project) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose: handleClose,
      maxWidth: "lg",
      fullWidth: true,
      PaperProps: {
        sx: {
          borderRadius: theme.shape.borderRadius,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[24],
          overflow: "hidden",
          maxHeight: "90vh"
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DialogTitle,
          {
            sx: {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`,
              borderBottom: `1px solid ${theme.palette.divider}`,
              p: 3,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.info.main})`,
                borderRadius: "1px"
              }
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Box,
                  {
                    sx: {
                      width: 48,
                      height: 48,
                      borderRadius: theme.shape.borderRadius,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: theme.shadows[8]
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { sx: { color: "white", fontSize: 24 } })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: {
                    color: theme.palette.text.primary,
                    fontWeight: theme.typography.fontWeightBold,
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)"
                  }, children: "Project Management" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: theme.palette.text.secondary }, children: project.name })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Tabs,
                {
                  value: currentTab,
                  onChange: (_, newValue) => setCurrentTab(newValue),
                  sx: {
                    "& .MuiTab-root": {
                      color: theme.palette.text.secondary,
                      fontWeight: theme.typography.fontWeightMedium,
                      textTransform: "none",
                      minWidth: "auto",
                      px: 2,
                      "&.Mui-selected": {
                        color: theme.palette.primary.main,
                        fontWeight: theme.typography.fontWeightBold
                      }
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: theme.palette.primary.main,
                      height: 3,
                      borderRadius: theme.shape.borderRadius
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Tab,
                      {
                        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {}),
                        label: "Details",
                        iconPosition: "start",
                        sx: { minHeight: 48 }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Tab,
                      {
                        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, {}),
                        label: "Datasets",
                        iconPosition: "start",
                        sx: { minHeight: 48 }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Tab,
                      {
                        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}),
                        label: "Team",
                        iconPosition: "start",
                        sx: { minHeight: 48 }
                      }
                    )
                  ]
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: {
          p: 0,
          background: theme.palette.background.default,
          minHeight: "60vh",
          maxHeight: "70vh",
          overflow: "hidden"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { height: "100%", display: "flex", flexDirection: "column" }, children: [
          currentTab === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
            p: theme.spacing(3),
            overflow: "auto",
            flex: 1
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: {
              color: theme.palette.text.primary,
              mb: 3,
              fontWeight: theme.typography.fontWeightBold,
              display: "flex",
              alignItems: "center",
              gap: 1
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    width: 8,
                    height: 8,
                    borderRadius: theme.shape.borderRadius,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 0 8px ${theme.palette.primary.main}40`
                  }
                }
              ),
              "Project Information"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                sx: {
                  p: 3,
                  borderRadius: theme.shape.borderRadius,
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[4],
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[8],
                    borderColor: theme.palette.primary.main + "40"
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary,
                      mb: 1,
                      fontWeight: theme.typography.fontWeightMedium
                    }, children: "Project Name" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: {
                      color: theme.palette.text.primary,
                      fontWeight: theme.typography.fontWeightBold,
                      mb: 2
                    }, children: project.name })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary,
                      mb: 1,
                      fontWeight: theme.typography.fontWeightMedium
                    }, children: "Status" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        icon: getStatusIcon2(project.status),
                        label: getStatusDisplayText(project.status),
                        sx: {
                          backgroundColor: getStatusColor(project.status) + "20",
                          color: getStatusColor(project.status),
                          border: `1px solid ${getStatusColor(project.status)}40`,
                          fontWeight: theme.typography.fontWeightMedium
                        }
                      }
                    )
                  ] }),
                  project.description && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary,
                      mb: 1,
                      fontWeight: theme.typography.fontWeightMedium
                    }, children: "Description" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: {
                      color: theme.palette.text.primary,
                      lineHeight: 1.6,
                      p: 2,
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: theme.shape.borderRadius,
                      border: `1px solid ${theme.palette.divider}`
                    }, children: project.description })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary,
                      mb: 1,
                      fontWeight: theme.typography.fontWeightMedium
                    }, children: "Application Mode" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                      getApplicationModeIcon(project.applicationMode),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: {
                        color: theme.palette.text.primary,
                        textTransform: "capitalize"
                      }, children: (_a = project.applicationMode) == null ? void 0 : _a.replace("_", " ") })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary,
                      mb: 1,
                      fontWeight: theme.typography.fontWeightMedium
                    }, children: "Storage Backend" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                      getStorageBackendIcon(project.storageBackend),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: {
                        color: theme.palette.text.primary,
                        textTransform: "uppercase"
                      }, children: project.storageBackend })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary,
                      mb: 1,
                      fontWeight: theme.typography.fontWeightMedium
                    }, children: "Last Accessed" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: {
                      color: theme.palette.text.primary
                    }, children: project.lastAccessedAt ? new Date(project.lastAccessedAt).toLocaleDateString() : "Never" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary,
                      mb: 1,
                      fontWeight: theme.typography.fontWeightMedium
                    }, children: "Team Members" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Group, { sx: { color: theme.palette.text.secondary, fontSize: 20 } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", sx: {
                        color: theme.palette.text.primary
                      }, children: [
                        projectTeamMemberCounts[project.id] || 0,
                        " members"
                      ] })
                    ] })
                  ] })
                ] })
              }
            )
          ] }),
          currentTab === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
            p: theme.spacing(3),
            overflow: "auto",
            flex: 1
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: {
              color: theme.palette.text.primary,
              mb: 3,
              fontWeight: theme.typography.fontWeightBold,
              display: "flex",
              alignItems: "center",
              gap: 1
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Box,
                {
                  sx: {
                    width: 8,
                    height: 8,
                    borderRadius: theme.shape.borderRadius,
                    background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                    boxShadow: `0 0 8px ${theme.palette.warning.main}40`
                  }
                }
              ),
              "Dataset Management"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              {
                sx: {
                  p: 3,
                  borderRadius: theme.shape.borderRadius,
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[4]
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "contained",
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, {}),
                        onClick: onShowCreateDatasetWizard,
                        sx: {
                          backgroundColor: theme.palette.success.main,
                          color: "white",
                          borderRadius: theme.shape.borderRadius,
                          px: 3,
                          py: 1,
                          textTransform: "none",
                          fontWeight: theme.typography.fontWeightMedium,
                          "&:hover": {
                            backgroundColor: theme.palette.success.dark
                          }
                        },
                        children: "Create Dataset"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "outlined",
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
                        onClick: onShowDatasetManagementDialog,
                        sx: {
                          borderColor: theme.palette.info.main + "80",
                          color: theme.palette.info.main,
                          borderRadius: theme.shape.borderRadius,
                          px: 3,
                          py: 1,
                          textTransform: "none",
                          fontWeight: theme.typography.fontWeightMedium,
                          "&:hover": {
                            borderColor: theme.palette.info.main,
                            backgroundColor: theme.palette.info.main + "10"
                          }
                        },
                        children: "Manage Datasets"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "outlined",
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {}),
                        onClick: onShowDatasetInsightsDialog,
                        sx: {
                          borderColor: theme.palette.warning.main + "80",
                          color: theme.palette.warning.main,
                          borderRadius: theme.shape.borderRadius,
                          px: 3,
                          py: 1,
                          textTransform: "none",
                          fontWeight: theme.typography.fontWeightMedium,
                          "&:hover": {
                            borderColor: theme.palette.warning.main,
                            backgroundColor: theme.palette.warning.main + "10"
                          }
                        },
                        children: "Dataset Insights"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "outlined",
                        startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                        onClick: () => onLoadDatasetsForProject(project),
                        disabled: datasetsLoading,
                        sx: {
                          borderColor: theme.palette.primary.main + "80",
                          color: theme.palette.primary.main,
                          borderRadius: theme.shape.borderRadius,
                          px: 3,
                          py: 1,
                          textTransform: "none",
                          fontWeight: theme.typography.fontWeightMedium,
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: theme.palette.primary.main + "10"
                          },
                          "&:disabled": {
                            borderColor: theme.palette.action.disabled,
                            color: theme.palette.text.disabled
                          }
                        },
                        children: datasetsLoading ? "Refreshing..." : "Refresh"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { sx: { color: theme.palette.text.secondary }, children: "Backend" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: datasetBackendFilter === "all" ? "firestore" : datasetBackendFilter,
                          onChange: (e) => onSetDatasetBackendFilter(e.target.value),
                          sx: {
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.divider
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.primary.main + "80"
                            },
                            "& .MuiSelect-icon": {
                              color: theme.palette.text.secondary
                            },
                            color: theme.palette.text.primary
                          },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "firestore", children: "Firestore" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "gcs", children: "Google Cloud Storage" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "s3", children: "Amazon S3" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "aws", children: "AWS Services" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "azure", children: "Microsoft Azure" })
                          ]
                        }
                      )
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TextField,
                      {
                        fullWidth: true,
                        size: "small",
                        placeholder: "Search datasets...",
                        value: datasetSearch,
                        onChange: (e) => onSetDatasetSearch(e.target.value),
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            color: theme.palette.text.primary,
                            "& fieldset": {
                              borderColor: theme.palette.divider
                            },
                            "&:hover fieldset": {
                              borderColor: theme.palette.primary.main + "80"
                            },
                            "& input::placeholder": {
                              color: theme.palette.text.secondary,
                              opacity: 1
                            }
                          }
                        }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { sx: { color: theme.palette.text.secondary }, children: "Select dataset" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: selectedDatasetId,
                          onChange: (e) => onSetSelectedDatasetId(e.target.value),
                          sx: {
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.divider
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.primary.main + "80"
                            },
                            "& .MuiSelect-icon": {
                              color: theme.palette.text.secondary
                            },
                            color: theme.palette.text.primary
                          },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "Select dataset..." }),
                            availableDatasets.map((ds) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: ds.id, children: ds.__label || ds.name }, ds.id))
                          ]
                        }
                      )
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, flexDirection: "column" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "contained",
                          onClick: handleAssignDataset,
                          disabled: !selectedDatasetId || uploading,
                          sx: {
                            backgroundColor: theme.palette.primary.main,
                            color: "white",
                            borderRadius: theme.shape.borderRadius,
                            px: 3,
                            py: 1,
                            textTransform: "none",
                            fontWeight: theme.typography.fontWeightMedium,
                            "&:hover": {
                              backgroundColor: theme.palette.primary.dark
                            },
                            "&:disabled": {
                              backgroundColor: theme.palette.action.disabled,
                              color: theme.palette.text.disabled
                            }
                          },
                          children: uploading ? "Assigning..." : "Assign"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          size: "small",
                          onClick: () => __async(void 0, null, function* () {
                            if (!project) return;
                            try {
                              onSetDatasetSearch("");
                              onSetDatasetBackendFilter("all");
                              yield onLoadDatasetsForProject(project);
                            } catch (error) {
                              console.error("Failed to apply filters:", error);
                              onSetError("Failed to apply dataset filters");
                            }
                          }),
                          sx: {
                            borderColor: theme.palette.secondary.main + "80",
                            color: theme.palette.secondary.main,
                            borderRadius: theme.shape.borderRadius,
                            textTransform: "none",
                            fontWeight: theme.typography.fontWeightMedium,
                            "&:hover": {
                              borderColor: theme.palette.secondary.main,
                              backgroundColor: theme.palette.secondary.main + "10"
                            }
                          },
                          children: "Apply Filters"
                        }
                      )
                    ] }) })
                  ] }),
                  projectDatasets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 3 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary,
                      mb: 2,
                      fontWeight: theme.typography.fontWeightMedium
                    }, children: [
                      "Currently Assigned (",
                      projectDatasets.length,
                      ")"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: projectDatasets.map((dataset) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
                      p: 2,
                      borderRadius: theme.shape.borderRadius,
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: theme.shadows[2],
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: theme.shadows[4],
                        borderColor: theme.palette.primary.main + "40"
                      }
                    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                        color: theme.palette.text.primary,
                        fontWeight: theme.typography.fontWeightMedium
                      }, children: dataset.__label || dataset.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          onClick: () => handleRemoveDataset(dataset.id),
                          sx: { color: theme.palette.error.main },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" })
                        }
                      )
                    ] }) }) }, dataset.id)) })
                  ] }),
                  projectDatasets.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
                    textAlign: "center",
                    py: 4,
                    color: theme.palette.text.secondary
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, { sx: { fontSize: 48, mb: 2, opacity: 0.5 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "No datasets assigned to this project" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mt: 1 }, children: "Use the controls above to assign datasets" })
                  ] })
                ]
              }
            )
          ] }),
          currentTab === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
            p: 0,
            overflow: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: theme.spacing(3), pb: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: {
                color: theme.palette.text.primary,
                mb: 3,
                fontWeight: theme.typography.fontWeightBold,
                display: "flex",
                alignItems: "center",
                gap: 1
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Box,
                  {
                    sx: {
                      width: 8,
                      height: 8,
                      borderRadius: theme.shape.borderRadius,
                      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                      boxShadow: `0 0 8px ${theme.palette.success.main}40`
                    }
                  }
                ),
                "Team Management"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "contained",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(GroupAddIcon, {}),
                    onClick: onShowTeamRoleWizard,
                    sx: {
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      borderRadius: theme.shape.borderRadius,
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      fontWeight: theme.typography.fontWeightMedium,
                      "&:hover": {
                        backgroundColor: theme.palette.primary.dark
                      }
                    },
                    children: "Manage Team & Roles"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outlined",
                    startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                    onClick: () => onLoadTeamMembersForProject(project),
                    disabled: teamMembersLoading,
                    sx: {
                      borderColor: theme.palette.primary.main + "80",
                      color: theme.palette.primary.main,
                      borderRadius: theme.shape.borderRadius,
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      fontWeight: theme.typography.fontWeightMedium,
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: theme.palette.primary.main + "10"
                      }
                    },
                    children: teamMembersLoading ? "Refreshing..." : "Refresh"
                  }
                )
              ] })
            ] }),
            projectTeamMembers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
              maxHeight: "400px",
              overflow: "auto",
              width: "100%",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              flex: 1
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { stickyHeader: true, sx: { width: "100%", minWidth: "100%" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { backgroundColor: theme.palette.primary.main + "10" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: {
                  fontWeight: theme.typography.fontWeightBold,
                  color: theme.palette.text.primary,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  width: "25%"
                }, children: "Team Member" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: {
                  fontWeight: theme.typography.fontWeightBold,
                  color: theme.palette.text.primary,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  width: "30%"
                }, children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: {
                  fontWeight: theme.typography.fontWeightBold,
                  color: theme.palette.text.primary,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  width: "15%"
                }, children: "Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: {
                  fontWeight: theme.typography.fontWeightBold,
                  color: theme.palette.text.primary,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  width: "20%"
                }, children: "Department" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: {
                  fontWeight: theme.typography.fontWeightBold,
                  color: theme.palette.text.primary,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  textAlign: "center",
                  width: "10%"
                }, children: "Actions" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: projectTeamMembers.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TableRow,
                {
                  sx: {
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { width: "25%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: {
                        width: 32,
                        height: 32,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        fontSize: "0.875rem",
                        fontWeight: theme.typography.fontWeightBold
                      }, children: (member.name || member.email || "U").charAt(0).toUpperCase() }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                        color: theme.palette.text.primary,
                        fontWeight: theme.typography.fontWeightMedium
                      }, children: member.name || "Unknown User" })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { width: "30%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary
                    }, children: member.email || "No email" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { width: "15%" }, children: editingMemberId === member.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, { size: "small", sx: { minWidth: 120 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      {
                        value: editingRole,
                        onChange: (e) => setEditingRole(e.target.value),
                        displayEmpty: true,
                        sx: { fontSize: "0.875rem" },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "MEMBER", children: "Member" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ADMIN", children: "Admin" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "VIEWER", children: "Viewer" })
                        ]
                      }
                    ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        label: member.role || "Member",
                        size: "small",
                        sx: {
                          backgroundColor: member.role === "ADMIN" ? theme.palette.error.main + "20" : theme.palette.primary.main + "20",
                          color: member.role === "ADMIN" ? theme.palette.error.main : theme.palette.primary.main,
                          fontWeight: theme.typography.fontWeightMedium
                        }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { width: "20%" }, children: editingMemberId === member.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TextField,
                      {
                        size: "small",
                        value: editingDepartment,
                        onChange: (e) => setEditingDepartment(e.target.value),
                        placeholder: "Department",
                        sx: { minWidth: 120 }
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: theme.palette.text.secondary
                    }, children: member.department || "Not specified" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { textAlign: "center", width: "10%" }, children: editingMemberId === member.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, justifyContent: "center" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Save changes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          onClick: () => handleSaveEdit(member),
                          disabled: savingMember === member.id,
                          sx: {
                            color: theme.palette.success.main,
                            "&:hover": {
                              backgroundColor: theme.palette.success.main + "10"
                            }
                          },
                          children: savingMember === member.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {})
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Cancel", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          onClick: handleCancelEdit,
                          disabled: savingMember === member.id,
                          sx: {
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              backgroundColor: theme.palette.error.main + "10",
                              color: theme.palette.error.main
                            }
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, {})
                        }
                      ) })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, justifyContent: "center" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Edit team member", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          onClick: () => handleStartEdit(member),
                          sx: {
                            color: theme.palette.primary.main,
                            "&:hover": {
                              backgroundColor: theme.palette.primary.main + "10"
                            }
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {})
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Team member options", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          onClick: (e) => handleTeamMemberMenuOpen(e, member),
                          sx: {
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              color: theme.palette.primary.main,
                              backgroundColor: theme.palette.primary.main + "10"
                            }
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertIcon, {})
                        }
                      ) })
                    ] }) })
                  ]
                },
                member.id
              )) })
            ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
              textAlign: "center",
              py: 4,
              color: theme.palette.text.secondary
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Group, { sx: { fontSize: 48, mb: 2, opacity: 0.5 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "No team members assigned to this project" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { mt: 1 }, children: 'Use the "Manage Team & Roles" button to add members' })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DialogActions,
          {
            sx: {
              p: 3,
              background: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: "flex",
              justifyContent: "space-between"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: handleClose,
                variant: "outlined",
                sx: {
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  borderRadius: theme.shape.borderRadius,
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: theme.typography.fontWeightMedium,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.main + "10",
                    color: theme.palette.primary.main
                  }
                },
                children: "Close"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Menu,
          {
            anchorEl: teamMemberMenuAnchor,
            open: Boolean(teamMemberMenuAnchor),
            onClose: handleTeamMemberMenuClose,
            PaperProps: {
              sx: {
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[8],
                minWidth: 160
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: handleEditTeamMember, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { children: "Edit Role" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: handleRemoveTeamMember, sx: { color: theme.palette.error.main }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small", sx: { color: theme.palette.error.main } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { children: "Remove Member" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Dialog,
          {
            open: editTeamMemberDialog,
            onClose: () => setEditTeamMemberDialog(false),
            maxWidth: "sm",
            fullWidth: true,
            PaperProps: {
              sx: {
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[8]
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: "white",
                fontWeight: theme.typography.fontWeightBold
              }, children: "Edit Team Member Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { sx: { p: 3 }, children: [
                teamMemberError && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: teamMemberError }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { mb: 2, color: theme.palette.text.secondary }, children: [
                  "Editing role for: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: (selectedTeamMember == null ? void 0 : selectedTeamMember.name) || (selectedTeamMember == null ? void 0 : selectedTeamMember.email) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, sx: { mt: 2 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: teamMemberRole,
                      onChange: (e) => setTeamMemberRole(e.target.value),
                      label: "Role",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "MEMBER", children: "Member" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ADMIN", children: "Admin" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "VIEWER", children: "Viewer" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: () => setEditTeamMemberDialog(false),
                    variant: "outlined",
                    disabled: teamMemberLoading,
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleUpdateTeamMemberRole,
                    variant: "contained",
                    disabled: teamMemberLoading || !teamMemberRole,
                    startIcon: teamMemberLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : null,
                    children: teamMemberLoading ? "Updating..." : "Update Role"
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Dialog,
          {
            open: removeTeamMemberDialog,
            onClose: () => setRemoveTeamMemberDialog(false),
            maxWidth: "sm",
            fullWidth: true,
            PaperProps: {
              sx: {
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[8]
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { sx: {
                background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`,
                color: "white",
                fontWeight: theme.typography.fontWeightBold
              }, children: "Remove Team Member" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { sx: { p: 3 }, children: [
                teamMemberError && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: teamMemberError }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body1", sx: { mb: 2 }, children: [
                  "Are you sure you want to remove ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: (selectedTeamMember == null ? void 0 : selectedTeamMember.name) || (selectedTeamMember == null ? void 0 : selectedTeamMember.email) }),
                  " from this project?"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: theme.palette.text.secondary }, children: "This action cannot be undone. The team member will lose access to this project and all its data." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: () => setRemoveTeamMemberDialog(false),
                    variant: "outlined",
                    disabled: teamMemberLoading,
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: handleConfirmRemoveTeamMember,
                    variant: "contained",
                    color: "error",
                    disabled: teamMemberLoading,
                    startIcon: teamMemberLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
                    children: teamMemberLoading ? "Removing..." : "Remove Member"
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
const _DatasetConflictAnalyzer = class _DatasetConflictAnalyzer {
  static getInstance() {
    if (!_DatasetConflictAnalyzer.instance) {
      _DatasetConflictAnalyzer.instance = new _DatasetConflictAnalyzer();
    }
    return _DatasetConflictAnalyzer.instance;
  }
  /**
   * Analyze all datasets in an organization for conflicts and overlaps
   */
  analyzeOrganizationDatasets(organizationId, datasets) {
    return __async(this, null, function* () {
      console.log("🔍 [DatasetConflictAnalyzer] Analyzing datasets for organization:", organizationId);
      const datasetsWithCollections = datasets.filter(
        (ds) => {
          var _a, _b, _c;
          return ((_a = ds.storage) == null ? void 0 : _a.backend) === "firestore" && ((_c = (_b = ds.collectionAssignment) == null ? void 0 : _b.selectedCollections) == null ? void 0 : _c.length) > 0;
        }
      );
      const collectionUsage = this.buildCollectionUsageMap(datasetsWithCollections);
      const overlaps = this.detectCollectionOverlaps(collectionUsage, datasetsWithCollections);
      const globalInsights = this.generateGlobalInsights(collectionUsage, datasetsWithCollections);
      const healthScore = this.calculateHealthScore(overlaps, globalInsights);
      const analysis = {
        organizationId,
        totalDatasets: datasetsWithCollections.length,
        totalCollections: Object.keys(collectionUsage).length,
        overlaps,
        globalInsights,
        healthScore
      };
      console.log("✅ [DatasetConflictAnalyzer] Analysis complete:", {
        datasets: analysis.totalDatasets,
        overlaps: analysis.overlaps.length,
        healthScore: analysis.healthScore
      });
      return analysis;
    });
  }
  /**
   * Check for conflicts when creating a new dataset
   */
  checkDatasetCreationConflicts(newDatasetConfig, existingDatasets) {
    return __async(this, null, function* () {
      var _a, _b;
      console.log("🔍 [DatasetConflictAnalyzer] Checking conflicts for new dataset:", newDatasetConfig.name);
      const warnings = [];
      const suggestions = [];
      if (!((_b = (_a = newDatasetConfig.collectionAssignment) == null ? void 0 : _a.selectedCollections) == null ? void 0 : _b.length)) {
        return { hasConflicts: false, warnings: [], suggestions: [] };
      }
      const newCollections = newDatasetConfig.collectionAssignment.selectedCollections;
      for (const collection2 of newCollections) {
        const existingUsage = existingDatasets.filter(
          (ds) => {
            var _a2, _b2;
            return (_b2 = (_a2 = ds.collectionAssignment) == null ? void 0 : _a2.selectedCollections) == null ? void 0 : _b2.includes(collection2);
          }
        );
        if (existingUsage.length > 0) {
          const conflictLevel = this.assessConflictLevel(collection2, existingUsage, newDatasetConfig);
          if (conflictLevel !== "none") {
            warnings.push({
              type: "overlap",
              severity: conflictLevel === "high" ? "error" : conflictLevel === "medium" ? "warning" : "info",
              message: `Collection "${collection2}" is already used by ${existingUsage.length} other dataset(s)`,
              affectedCollections: [collection2],
              affectedDatasets: existingUsage.map((ds) => ds.name),
              recommendation: this.getConflictRecommendation(collection2, existingUsage, newDatasetConfig)
            });
          }
          if (conflictLevel === "high") {
            suggestions.push({
              type: "filter",
              message: `Consider adding data filters to differentiate from existing datasets`,
              collections: [collection2]
            });
          } else if (existingUsage.length >= 3) {
            suggestions.push({
              type: "merge",
              message: `Collection "${collection2}" is heavily used. Consider merging with existing dataset "${existingUsage[0].name}"`,
              collections: [collection2]
            });
          }
        }
      }
      const redundancyCheck = this.checkRedundancyPatterns(newCollections, existingDatasets);
      warnings.push(...redundancyCheck.warnings);
      suggestions.push(...redundancyCheck.suggestions);
      const performanceCheck = this.checkPerformanceImplications(newCollections, existingDatasets);
      warnings.push(...performanceCheck);
      return {
        hasConflicts: warnings.some((w) => w.severity === "error"),
        warnings,
        suggestions
      };
    });
  }
  /**
   * Get recommendations for resolving dataset conflicts
   */
  getConflictResolutionRecommendations(analysis) {
    const recommendations = [];
    const highConflictOverlaps = analysis.overlaps.filter((o) => o.conflictLevel === "high");
    for (const overlap of highConflictOverlaps) {
      recommendations.push({
        type: "merge",
        priority: "high",
        title: `Merge datasets using "${overlap.collection}"`,
        description: `Collection "${overlap.collection}" is used by ${overlap.datasets.length} datasets with high conflict potential`,
        affectedDatasets: overlap.datasets.map((d) => d.name),
        estimatedImpact: "Reduces data redundancy and improves query performance",
        steps: [
          "Review data usage patterns for each dataset",
          "Identify common use cases and data access patterns",
          "Create a unified dataset with appropriate data filters",
          "Migrate existing queries to use the new unified dataset"
        ]
      });
    }
    for (const redundant of analysis.globalInsights.redundantAssignments) {
      recommendations.push({
        type: "filter",
        priority: "medium",
        title: `Add data filters for "${redundant.collection}"`,
        description: redundant.reason,
        affectedDatasets: redundant.affectedDatasets,
        estimatedImpact: "Improves data organization and reduces confusion",
        steps: [
          "Analyze data access patterns for each dataset",
          "Define specific filter criteria for each use case",
          "Update dataset configurations with appropriate filters",
          "Test data access to ensure proper isolation"
        ]
      });
    }
    if (analysis.globalInsights.mostUsedCollections.length > 0) {
      const topCollection = analysis.globalInsights.mostUsedCollections[0];
      if (topCollection.count > 3) {
        recommendations.push({
          type: "reorganize",
          priority: "low",
          title: `Optimize "${topCollection.collection}" usage`,
          description: `This collection is used by ${topCollection.count} datasets, consider optimization`,
          affectedDatasets: topCollection.datasets,
          estimatedImpact: "Improves query performance and reduces resource usage",
          steps: [
            "Review query patterns for this collection",
            "Consider creating specialized views or indexes",
            "Implement caching strategies for frequently accessed data",
            "Monitor performance improvements"
          ]
        });
      }
    }
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  /**
   * Build a map of collection usage across datasets
   */
  buildCollectionUsageMap(datasets) {
    var _a;
    const usage = {};
    for (const dataset of datasets) {
      if ((_a = dataset.collectionAssignment) == null ? void 0 : _a.selectedCollections) {
        for (const collection2 of dataset.collectionAssignment.selectedCollections) {
          if (!usage[collection2]) {
            usage[collection2] = [];
          }
          usage[collection2].push(dataset);
        }
      }
    }
    return usage;
  }
  /**
   * Detect overlaps between datasets for each collection
   */
  detectCollectionOverlaps(collectionUsage, datasets) {
    const overlaps = [];
    for (const [collection2, usageDatasets] of Object.entries(collectionUsage)) {
      if (usageDatasets.length > 1) {
        const conflictLevel = this.assessOverlapConflictLevel(collection2, usageDatasets);
        const conflictReasons = this.getConflictReasons(collection2, usageDatasets);
        const recommendations = this.getOverlapRecommendations(collection2, usageDatasets);
        overlaps.push({
          collection: collection2,
          datasets: usageDatasets.map((ds) => {
            var _a, _b, _c;
            return {
              id: ds.id,
              name: ds.name,
              visibility: ds.visibility || "private",
              organizationScope: ((_a = ds.collectionAssignment) == null ? void 0 : _a.organizationScope) !== false,
              filters: (_c = (_b = ds.collectionAssignment) == null ? void 0 : _b.dataFilters) == null ? void 0 : _c.filter((f) => f.collection === collection2)
            };
          }),
          conflictLevel,
          conflictReasons,
          recommendations
        });
      }
    }
    return overlaps.sort((a, b) => {
      const levelOrder = { high: 4, medium: 3, low: 2, none: 1 };
      return levelOrder[b.conflictLevel] - levelOrder[a.conflictLevel];
    });
  }
  /**
   * Generate global insights about dataset organization
   */
  generateGlobalInsights(collectionUsage, datasets) {
    var _a;
    const mostUsedCollections = Object.entries(collectionUsage).map(([collection2, datasets2]) => ({
      collection: collection2,
      count: datasets2.length,
      datasets: datasets2.map((ds) => ds.name)
    })).sort((a, b) => b.count - a.count).slice(0, 10);
    const redundantAssignments = Object.entries(collectionUsage).filter(([_, datasets2]) => datasets2.length > 1).map(([collection2, datasets2]) => {
      const hasFilters = datasets2.some(
        (ds) => {
          var _a2, _b;
          return (_b = (_a2 = ds.collectionAssignment) == null ? void 0 : _a2.dataFilters) == null ? void 0 : _b.some((f) => f.collection === collection2);
        }
      );
      if (!hasFilters) {
        return {
          collection: collection2,
          reason: `Used by ${datasets2.length} datasets without data filters - potential redundancy`,
          affectedDatasets: datasets2.map((ds) => ds.name)
        };
      }
      return null;
    }).filter(Boolean);
    const schemaConflicts = [];
    const recommendations = [];
    if (redundantAssignments.length > 0) {
      recommendations.push("Consider adding data filters to datasets with overlapping collections");
    }
    if (((_a = mostUsedCollections[0]) == null ? void 0 : _a.count) > 3) {
      recommendations.push(`Collection "${mostUsedCollections[0].collection}" is heavily used - consider optimization`);
    }
    if (datasets.length > 10) {
      recommendations.push("Large number of datasets detected - consider consolidation opportunities");
    }
    return {
      mostUsedCollections,
      redundantAssignments,
      schemaConflicts,
      recommendations
    };
  }
  /**
   * Calculate overall health score for dataset organization
   */
  calculateHealthScore(overlaps, globalInsights) {
    let score = 100;
    for (const overlap of overlaps) {
      switch (overlap.conflictLevel) {
        case "high":
          score -= 15;
          break;
        case "medium":
          score -= 8;
          break;
        case "low":
          score -= 3;
          break;
      }
    }
    score -= globalInsights.redundantAssignments.length * 5;
    score -= globalInsights.schemaConflicts.length * 10;
    return Math.max(0, Math.min(100, score));
  }
  /**
   * Assess conflict level for a specific collection overlap
   */
  assessOverlapConflictLevel(collection2, datasets) {
    const visibilities = new Set(datasets.map((ds) => ds.visibility));
    if (visibilities.size > 1) {
      return "high";
    }
    const hasFilters = datasets.some(
      (ds) => {
        var _a, _b;
        return (_b = (_a = ds.collectionAssignment) == null ? void 0 : _a.dataFilters) == null ? void 0 : _b.some((f) => f.collection === collection2);
      }
    );
    if (!hasFilters && datasets.length > 2) {
      return "medium";
    }
    if (!hasFilters && datasets.length === 2) {
      return "low";
    }
    return "none";
  }
  /**
   * Assess conflict level for dataset creation
   */
  assessConflictLevel(collection2, existingDatasets, newConfig) {
    var _a, _b;
    const existingVisibilities = new Set(existingDatasets.map((ds) => ds.visibility));
    if (existingVisibilities.has("public") && newConfig.visibility !== "public") {
      return "high";
    }
    const hasExistingFilters = existingDatasets.some(
      (ds) => {
        var _a2, _b2;
        return (_b2 = (_a2 = ds.collectionAssignment) == null ? void 0 : _a2.dataFilters) == null ? void 0 : _b2.some((f) => f.collection === collection2);
      }
    );
    const hasNewFilters = (_b = (_a = newConfig.collectionAssignment) == null ? void 0 : _a.dataFilters) == null ? void 0 : _b.some((f) => f.collection === collection2);
    if (!hasExistingFilters && !hasNewFilters) {
      return existingDatasets.length > 1 ? "high" : "medium";
    }
    return "low";
  }
  /**
   * Get reasons for conflicts
   */
  getConflictReasons(collection2, datasets) {
    const reasons = [];
    const visibilities = new Set(datasets.map((ds) => ds.visibility));
    if (visibilities.size > 1) {
      reasons.push("Datasets have different visibility levels");
    }
    const hasFilters = datasets.some(
      (ds) => {
        var _a, _b;
        return (_b = (_a = ds.collectionAssignment) == null ? void 0 : _a.dataFilters) == null ? void 0 : _b.some((f) => f.collection === collection2);
      }
    );
    if (!hasFilters) {
      reasons.push("No data filters defined - potential data redundancy");
    }
    if (datasets.length > 3) {
      reasons.push("Collection used by many datasets - consider consolidation");
    }
    return reasons;
  }
  /**
   * Get recommendations for overlap resolution
   */
  getOverlapRecommendations(collection2, datasets) {
    const recommendations = [];
    const hasFilters = datasets.some(
      (ds) => {
        var _a, _b;
        return (_b = (_a = ds.collectionAssignment) == null ? void 0 : _a.dataFilters) == null ? void 0 : _b.some((f) => f.collection === collection2);
      }
    );
    if (!hasFilters) {
      recommendations.push("Add data filters to differentiate dataset purposes");
    }
    if (datasets.length > 2) {
      recommendations.push("Consider merging similar datasets to reduce redundancy");
    }
    const visibilities = new Set(datasets.map((ds) => ds.visibility));
    if (visibilities.size > 1) {
      recommendations.push("Standardize visibility levels across related datasets");
    }
    return recommendations;
  }
  /**
   * Get conflict recommendation for dataset creation
   */
  getConflictRecommendation(collection2, existingDatasets, newConfig) {
    const hasFilters = existingDatasets.some(
      (ds) => {
        var _a, _b;
        return (_b = (_a = ds.collectionAssignment) == null ? void 0 : _a.dataFilters) == null ? void 0 : _b.some((f) => f.collection === collection2);
      }
    );
    if (!hasFilters) {
      return "Add data filters to differentiate from existing datasets";
    }
    if (existingDatasets.length > 2) {
      return `Consider merging with existing dataset "${existingDatasets[0].name}"`;
    }
    return "Review existing usage to avoid data redundancy";
  }
  /**
   * Check for redundancy patterns
   */
  checkRedundancyPatterns(newCollections, existingDatasets) {
    var _a;
    const warnings = [];
    const suggestions = [];
    for (const existing of existingDatasets) {
      if ((_a = existing.collectionAssignment) == null ? void 0 : _a.selectedCollections) {
        const overlap = newCollections.filter(
          (c) => existing.collectionAssignment.selectedCollections.includes(c)
        ).length;
        const overlapPercentage = overlap / newCollections.length;
        if (overlapPercentage > 0.7) {
          warnings.push({
            type: "redundancy",
            severity: "warning",
            message: `${Math.round(overlapPercentage * 100)}% overlap with existing dataset "${existing.name}"`,
            affectedCollections: newCollections,
            affectedDatasets: [existing.name],
            recommendation: "Consider extending the existing dataset instead of creating a new one"
          });
          suggestions.push({
            type: "merge",
            message: `Merge with "${existing.name}" to avoid redundancy`,
            collections: newCollections
          });
        }
      }
    }
    return { warnings, suggestions };
  }
  /**
   * Check for performance implications
   */
  checkPerformanceImplications(newCollections, existingDatasets) {
    const warnings = [];
    const largeCollections = ["users", "activities", "sessions", "audit_log"];
    const hasLargeCollections = newCollections.some((c) => largeCollections.includes(c));
    if (hasLargeCollections && newCollections.length > 5) {
      warnings.push({
        type: "performance",
        severity: "info",
        message: "Dataset includes large collections - consider performance implications",
        affectedCollections: newCollections.filter((c) => largeCollections.includes(c)),
        affectedDatasets: [],
        recommendation: "Add data filters or consider splitting into smaller datasets"
      });
    }
    return warnings;
  }
};
__publicField(_DatasetConflictAnalyzer, "instance");
let DatasetConflictAnalyzer = _DatasetConflictAnalyzer;
const datasetConflictAnalyzer = DatasetConflictAnalyzer.getInstance();
const STATIC_COLLECTIONS_BY_CATEGORY = {
  "Core System": {
    icon: "👥",
    description: "User management, organizations, and core system data",
    collections: [
      "users",
      "teamMembers",
      "organizations",
      "roles",
      "projects",
      "projectTeamMembers",
      "clients",
      "contacts",
      "test"
    ],
    isSystem: true
  },
  "Sessions & Workflows": {
    icon: "🎬",
    description: "Production sessions, workflows, and task management",
    collections: [
      "sessions",
      "sessionWorkflows",
      "sessionAssignments",
      "sessionParticipants",
      "workflowTemplates",
      "workflowDiagrams",
      "workflowInstances",
      "workflowSteps",
      "workflowAssignments",
      "sessionPhaseTransitions",
      "sessionReviews",
      "sessionQc",
      "sessionTasks",
      "demoSessions"
    ],
    isSystem: true
  },
  "Inventory & Equipment": {
    icon: "📦",
    description: "Equipment tracking, network management, and inventory systems",
    collections: [
      "inventoryItems",
      "inventory",
      "networkIPAssignments",
      "networkIPRanges",
      "networks",
      "inventoryHistory",
      "setupProfiles",
      "schemas",
      "schemaFields",
      "mapLayouts",
      "mapLocations",
      "inventoryMaps",
      "mapData"
    ],
    isSystem: true
  },
  "Timecards & Scheduling": {
    icon: "⏰",
    description: "Time tracking, approvals, and scheduling systems",
    collections: [
      "timecard_entries",
      "user_timecards",
      "timecard_approvals",
      "timecard_templates"
    ],
    isSystem: true
  },
  "Media & Content": {
    icon: "🎥",
    description: "Media files, production tasks, and content management",
    collections: [
      "mediaFiles",
      "postProductionTasks",
      "stages",
      "notes",
      "reports",
      "callSheets"
    ],
    isSystem: true
  },
  "AI & Automation": {
    icon: "🤖",
    description: "AI agents, messaging, and automated systems",
    collections: [
      "aiAgents",
      "messages",
      "chats",
      "messageSessions"
    ],
    isSystem: true
  },
  "Business & Licensing": {
    icon: "💼",
    description: "Licenses, subscriptions, payments, and business data",
    collections: [
      "licenses",
      "subscriptions",
      "payments",
      "userPreferences"
    ],
    isSystem: true
  },
  "Production Budget Management": {
    icon: "💰",
    description: "Budget tracking, schedules, and financial management",
    collections: [
      "pbmProjects",
      "pbmSchedules",
      "pbmPayscales",
      "pbmDailyStatus"
    ],
    isSystem: true
  },
  "Network Delivery & Deliverables": {
    icon: "📡",
    description: "Network delivery bibles, deliverables, and post-production workflows",
    collections: [
      "networkDeliveryBibles",
      "deliverables",
      "networkDeliveryChats",
      "deliverySpecs",
      "deliveryTemplates",
      "deliveryTracking"
    ],
    isSystem: true,
    isDynamic: true
  }
};
const _DynamicCollectionDiscoveryService = class _DynamicCollectionDiscoveryService {
  constructor() {
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    __publicField(this, "CACHE_TTL", 5 * 60 * 1e3);
    // 5 minutes
    __publicField(this, "DISCOVERY_ENDPOINT", "https://api-oup5qxogca-uc.a.run.app/collections/discover");
    __publicField(this, "SYNC_ENDPOINT", "https://api-oup5qxogca-uc.a.run.app/collections/sync-metadata");
    __publicField(this, "listeners", /* @__PURE__ */ new Map());
    __publicField(this, "callbacks", /* @__PURE__ */ new Map());
  }
  static getInstance() {
    if (!_DynamicCollectionDiscoveryService.instance) {
      _DynamicCollectionDiscoveryService.instance = new _DynamicCollectionDiscoveryService();
    }
    return _DynamicCollectionDiscoveryService.instance;
  }
  /**
   * Discover collections dynamically from Firebase with intelligent caching
   */
  discoverCollections(organizationId, authToken) {
    return __async(this, null, function* () {
      const cacheKey = `collections_${organizationId || "global"}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        console.log("🎯 [DynamicCollectionDiscovery] Using cached collections");
        return cached;
      }
      try {
        if (authToken) {
          const dynamicResult = yield this.discoverFromFirebase(organizationId, authToken);
          if (dynamicResult) {
            this.setCachedResult(cacheKey, dynamicResult);
            return dynamicResult;
          }
        }
      } catch (error) {
        console.warn("⚠️ [DynamicCollectionDiscovery] Dynamic discovery failed, falling back to static:", error);
      }
      const staticResult = {
        collections: STATIC_COLLECTIONS_BY_CATEGORY,
        totalCollections: this.getTotalCollectionCount(STATIC_COLLECTIONS_BY_CATEGORY),
        lastUpdated: /* @__PURE__ */ new Date(),
        source: "static"
      };
      this.setCachedResult(cacheKey, staticResult);
      return staticResult;
    });
  }
  /**
   * Discover collections from Firebase backend API using Admin SDK
   */
  discoverFromFirebase(organizationId, authToken) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [DynamicCollectionDiscovery] Discovering collections from Firebase Admin SDK...");
        if (!authToken) {
          console.warn("⚠️ [DynamicCollectionDiscovery] No auth token provided for collection discovery");
          return null;
        }
        const response = yield fetch(this.DISCOVERY_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            organizationId,
            includeMetadata: true,
            categorize: true
          })
        });
        if (!response.ok) {
          throw new Error(`Collection discovery API failed: ${response.status} ${response.statusText}`);
        }
        const data = yield response.json();
        if (!data.success) {
          throw new Error(`Collection discovery failed: ${data.error}`);
        }
        const result = {
          collections: data.collections,
          totalCollections: data.totalCollections,
          lastUpdated: new Date(data.lastUpdated),
          source: "dynamic"
        };
        console.log(`✅ [DynamicCollectionDiscovery] Discovered ${result.totalCollections} collections across ${Object.keys(data.collections).length} categories from Admin SDK`);
        return result;
      } catch (error) {
        console.error("❌ [DynamicCollectionDiscovery] Firebase Admin SDK discovery failed:", error);
        return null;
      }
    });
  }
  /**
   * Process discovered collections and categorize them intelligently
   */
  processDiscoveredCollections(discoveredCollections) {
    const categorized = {};
    for (const [categoryName, category] of Object.entries(STATIC_COLLECTIONS_BY_CATEGORY)) {
      categorized[categoryName] = __spreadProps(__spreadValues({}, category), {
        collections: [...category.collections]
        // Copy existing collections
      });
    }
    const allExistingCollections = new Set(
      Object.values(categorized).flatMap((cat) => cat.collections)
    );
    const newCollections = discoveredCollections.filter(
      (collectionName) => !allExistingCollections.has(collectionName) && this.isValidCollectionName(collectionName)
    );
    for (const collectionName of newCollections) {
      const category = this.categorizeCollection(collectionName);
      if (categorized[category]) {
        categorized[category].collections.push(collectionName);
        categorized[category].isDynamic = true;
      } else {
        categorized["Custom Collections"] = {
          icon: "🔧",
          description: "Custom and dynamically discovered collections",
          collections: [collectionName],
          isDynamic: true
        };
      }
    }
    return categorized;
  }
  /**
   * Intelligently categorize a collection based on its name and patterns
   */
  categorizeCollection(collectionName) {
    const name = collectionName.toLowerCase();
    if (name.includes("delivery") || name.includes("deliverable") || name.includes("bible") || name.includes("network") && (name.includes("delivery") || name.includes("spec"))) {
      return "Network Delivery & Deliverables";
    }
    if (name.includes("session") || name.includes("workflow") || name.includes("task") || name.includes("assignment") && name.includes("session")) {
      return "Sessions & Workflows";
    }
    if (name.includes("media") || name.includes("video") || name.includes("audio") || name.includes("production") || name.includes("stage") || name.includes("call") || name.includes("post") && name.includes("production")) {
      return "Media & Content";
    }
    if (name.includes("inventory") || name.includes("equipment") || name.includes("network") || name.includes("ip") || name.includes("map") || name.includes("location") || name.includes("setup") || name.includes("schema")) {
      return "Inventory & Equipment";
    }
    if (name.includes("user") || name.includes("team") || name.includes("member") || name.includes("role") || name.includes("organization") || name.includes("client") || name.includes("contact")) {
      return "Core System";
    }
    if (name.includes("timecard") || name.includes("schedule") || name.includes("time") || name.includes("approval") || name.includes("template") && name.includes("time")) {
      return "Timecards & Scheduling";
    }
    if (name.includes("ai") || name.includes("agent") || name.includes("message") || name.includes("chat") || name.includes("bot")) {
      return "AI & Automation";
    }
    if (name.includes("license") || name.includes("subscription") || name.includes("payment") || name.includes("billing") || name.includes("invoice")) {
      return "Business & Licensing";
    }
    if (name.includes("pbm") || name.includes("budget") || name.includes("payscale") || name.includes("daily") && name.includes("status")) {
      return "Production Budget Management";
    }
    return "Custom Collections";
  }
  /**
   * Validate collection name (filter out system collections)
   */
  isValidCollectionName(collectionName) {
    return !collectionName.startsWith("_") && !collectionName.includes("_backup") && !collectionName.includes("_temp") && !collectionName.includes("_cache") && !collectionName.startsWith("firebase-") && collectionName.length > 0;
  }
  /**
   * Cache management
   */
  getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.lastUpdated.getTime() < this.CACHE_TTL) {
      return __spreadProps(__spreadValues({}, cached), { source: "cached" });
    }
    return null;
  }
  setCachedResult(cacheKey, result) {
    this.cache.set(cacheKey, result);
  }
  /**
   * Clear cache (useful for forcing refresh)
   */
  clearCache() {
    this.cache.clear();
    console.log("🗑️ [DynamicCollectionDiscovery] Cache cleared");
  }
  /**
   * Set up real-time collection monitoring using Firestore listeners
   * This will automatically update collections when changes are detected
   */
  setupRealTimeMonitoring(organizationId, authToken, onCollectionsChanged) {
    const listenerId = `${organizationId || "global"}_${Date.now()}`;
    console.log(`🔄 [DynamicCollectionDiscovery] Setting up real-time listener: ${listenerId}`);
    this.syncCollectionsMetadata(authToken).catch((error) => {
      console.warn("⚠️ [DynamicCollectionDiscovery] Initial metadata sync failed:", error);
    });
    const metadataRef = doc(db, "_collections_metadata", "current");
    const unsubscribe = onSnapshot(metadataRef, (docSnapshot) => __async(this, null, function* () {
      var _a;
      try {
        console.log("🔄 [DynamicCollectionDiscovery] Collections metadata changed, updating...");
        if (docSnapshot.exists()) {
          const metadata = docSnapshot.data();
          const collections = metadata.collections || [];
          const categorizedCollections = this.processDiscoveredCollections(collections);
          const result = {
            collections: categorizedCollections,
            totalCollections: this.getTotalCollectionCount(categorizedCollections),
            lastUpdated: ((_a = metadata.lastUpdated) == null ? void 0 : _a.toDate()) || /* @__PURE__ */ new Date(),
            source: "dynamic"
          };
          const cacheKey = `collections_${organizationId || "global"}`;
          this.setCachedResult(cacheKey, result);
          if (onCollectionsChanged) {
            onCollectionsChanged(result);
          }
          console.log(`✅ [DynamicCollectionDiscovery] Updated ${result.totalCollections} collections via listener`);
        } else {
          console.log("📋 [DynamicCollectionDiscovery] Collections metadata document does not exist, creating...");
          yield this.syncCollectionsMetadata(authToken);
        }
      } catch (error) {
        console.error("❌ [DynamicCollectionDiscovery] Error processing collections update:", error);
      }
    }), (error) => {
      console.error("❌ [DynamicCollectionDiscovery] Firestore listener error:", error);
    });
    this.listeners.set(listenerId, unsubscribe);
    if (onCollectionsChanged) {
      this.callbacks.set(listenerId, onCollectionsChanged);
    }
    return () => {
      console.log(`🛑 [DynamicCollectionDiscovery] Stopping real-time listener: ${listenerId}`);
      const listener = this.listeners.get(listenerId);
      if (listener) {
        listener();
        this.listeners.delete(listenerId);
      }
      this.callbacks.delete(listenerId);
    };
  }
  /**
   * Sync collections metadata to trigger listener updates
   */
  syncCollectionsMetadata(authToken) {
    return __async(this, null, function* () {
      if (!authToken) {
        console.log("ℹ️ [DynamicCollectionDiscovery] No auth token for metadata sync - using static collections");
        return;
      }
      try {
        const response = yield fetch(this.SYNC_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        });
        if (response.ok) {
          console.log("✅ [DynamicCollectionDiscovery] Collections metadata synced");
        } else {
          console.warn("⚠️ [DynamicCollectionDiscovery] Metadata sync failed:", response.status);
        }
      } catch (error) {
        console.error("❌ [DynamicCollectionDiscovery] Error syncing metadata:", error);
      }
    });
  }
  /**
   * Get total collection count
   */
  getTotalCollectionCount(collections) {
    return Object.values(collections).reduce((total, category) => total + category.collections.length, 0);
  }
  /**
   * Get static collections as fallback
   */
  getStaticCollections() {
    return STATIC_COLLECTIONS_BY_CATEGORY;
  }
  /**
   * Manually trigger collection sync (call this when you know collections have changed)
   */
  triggerSync(authToken) {
    return __async(this, null, function* () {
      console.log("🔄 [DynamicCollectionDiscovery] Manually triggering collection sync...");
      yield this.syncCollectionsMetadata(authToken);
    });
  }
  /**
   * Clean up all listeners (useful for app shutdown)
   */
  cleanup() {
    console.log("🧹 [DynamicCollectionDiscovery] Cleaning up all listeners...");
    this.listeners.forEach((unsubscribe, listenerId) => {
      console.log(`🛑 [DynamicCollectionDiscovery] Cleaning up listener: ${listenerId}`);
      unsubscribe();
    });
    this.listeners.clear();
    this.callbacks.clear();
  }
};
__publicField(_DynamicCollectionDiscoveryService, "instance");
let DynamicCollectionDiscoveryService = _DynamicCollectionDiscoveryService;
const dynamicCollectionDiscovery = DynamicCollectionDiscoveryService.getInstance();
const getAllCollections = (collections) => {
  return Object.values(collections).flatMap((category) => category.collections);
};
const getCollectionsByCategory = (collections, categoryName) => {
  var _a;
  return ((_a = collections[categoryName]) == null ? void 0 : _a.collections) || [];
};
const getCategoryForCollection = (collections, collectionName) => {
  for (const [categoryName, category] of Object.entries(collections)) {
    if (category.collections.includes(collectionName)) {
      return categoryName;
    }
  }
  return null;
};
const isValidCollection = (collections, collectionName) => {
  return getAllCollections(collections).includes(collectionName);
};
const useDynamicCollections = (organizationId) => {
  const { user } = useAuth();
  const [discoveryResult, setDiscoveryResult] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [realTimeCleanup, setRealTimeCleanup] = reactExports.useState(null);
  const discoverCollections = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 [useDynamicCollections] Discovering collections...");
      let authToken;
      try {
        authToken = authService.getStoredToken() || void 0;
      } catch (error2) {
        console.warn("⚠️ [useDynamicCollections] Auth service not available, proceeding without token:", error2);
        authToken = void 0;
      }
      if (!authToken) {
        const fallbackToken = localStorage.getItem("firebase_id_token") || localStorage.getItem("auth_token") || localStorage.getItem("jwt_token");
        if (fallbackToken) {
          authToken = fallbackToken;
          console.log("🔑 [useDynamicCollections] Using fallback token from localStorage");
        } else {
          console.log("ℹ️ [useDynamicCollections] No auth token available, will use static collections");
        }
      }
      const result = yield dynamicCollectionDiscovery.discoverCollections(
        organizationId || user.organizationId || user.id,
        authToken
      );
      setDiscoveryResult(result);
      console.log(`✅ [useDynamicCollections] Loaded ${result.totalCollections} collections from ${result.source} source`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to discover collections";
      console.error("❌ [useDynamicCollections] Discovery failed:", err);
      setError(errorMessage);
      const staticCollections = dynamicCollectionDiscovery.getStaticCollections();
      setDiscoveryResult({
        collections: staticCollections,
        totalCollections: getAllCollections(staticCollections).length,
        lastUpdated: /* @__PURE__ */ new Date(),
        source: "static"
      });
    } finally {
      setLoading(false);
    }
  }), [user, organizationId]);
  reactExports.useEffect(() => {
    discoverCollections();
  }, [discoverCollections]);
  const refresh = reactExports.useCallback(() => __async(void 0, null, function* () {
    dynamicCollectionDiscovery.clearCache();
    yield discoverCollections();
  }), [discoverCollections]);
  const clearCache = reactExports.useCallback(() => {
    dynamicCollectionDiscovery.clearCache();
  }, []);
  const startRealTimeMonitoring = reactExports.useCallback(() => {
    if (realTimeCleanup) {
      console.log("🔄 [useDynamicCollections] Real-time monitoring already active");
      return;
    }
    console.log("🔄 [useDynamicCollections] Starting real-time collection monitoring...");
    let authToken;
    try {
      authToken = authService.getStoredToken() || void 0;
    } catch (error2) {
      console.warn("⚠️ [useDynamicCollections] Auth service not available, proceeding without token:", error2);
      authToken = void 0;
    }
    if (!authToken) {
      const fallbackToken = localStorage.getItem("firebase_id_token") || localStorage.getItem("auth_token") || localStorage.getItem("jwt_token");
      if (fallbackToken) {
        authToken = fallbackToken;
        console.log("🔑 [useDynamicCollections] Using fallback token from localStorage");
      } else {
        console.log("ℹ️ [useDynamicCollections] No auth token available, real-time monitoring will use static collections");
      }
    }
    const cleanup = dynamicCollectionDiscovery.setupRealTimeMonitoring(
      (user == null ? void 0 : user.organizationId) || (user == null ? void 0 : user.id),
      authToken,
      (newResult) => {
        console.log("🔄 [useDynamicCollections] Collections updated via real-time monitoring");
        setDiscoveryResult(newResult);
        setError(null);
      }
    );
    setRealTimeCleanup(() => cleanup);
  }, [realTimeCleanup, organizationId, user]);
  const stopRealTimeMonitoring = reactExports.useCallback(() => {
    if (realTimeCleanup) {
      console.log("🛑 [useDynamicCollections] Stopping real-time collection monitoring...");
      realTimeCleanup();
      setRealTimeCleanup(null);
    }
  }, [realTimeCleanup]);
  const triggerSync = reactExports.useCallback(() => __async(void 0, null, function* () {
    console.log("🔄 [useDynamicCollections] Manually triggering collection sync...");
    let authToken;
    try {
      authToken = authService.getStoredToken() || void 0;
    } catch (error2) {
      console.warn("⚠️ [useDynamicCollections] Auth service not available, proceeding without token:", error2);
      authToken = void 0;
    }
    if (!authToken) {
      const fallbackToken = localStorage.getItem("firebase_id_token") || localStorage.getItem("auth_token") || localStorage.getItem("jwt_token");
      if (fallbackToken) {
        authToken = fallbackToken;
        console.log("🔑 [useDynamicCollections] Using fallback token from localStorage");
      } else {
        console.log("ℹ️ [useDynamicCollections] No auth token available, sync will use static collections");
      }
    }
    yield dynamicCollectionDiscovery.triggerSync(authToken);
  }), []);
  const getCollectionsByCategoryBound = reactExports.useCallback((categoryName) => {
    if (!discoveryResult) return [];
    return getCollectionsByCategory(discoveryResult.collections, categoryName);
  }, [discoveryResult]);
  const getCategoryForCollectionBound = reactExports.useCallback((collectionName) => {
    if (!discoveryResult) return null;
    return getCategoryForCollection(discoveryResult.collections, collectionName);
  }, [discoveryResult]);
  const isValidCollectionBound = reactExports.useCallback((collectionName) => {
    if (!discoveryResult) return false;
    return isValidCollection(discoveryResult.collections, collectionName);
  }, [discoveryResult]);
  reactExports.useEffect(() => {
    return () => {
      if (realTimeCleanup) {
        realTimeCleanup();
      }
    };
  }, [realTimeCleanup]);
  return {
    // Collection data
    collections: (discoveryResult == null ? void 0 : discoveryResult.collections) || {},
    allCollections: discoveryResult ? getAllCollections(discoveryResult.collections) : [],
    totalCount: (discoveryResult == null ? void 0 : discoveryResult.totalCollections) || 0,
    // State management
    loading,
    error,
    lastUpdated: (discoveryResult == null ? void 0 : discoveryResult.lastUpdated) || null,
    source: (discoveryResult == null ? void 0 : discoveryResult.source) || "static",
    // Actions
    refresh,
    clearCache,
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    triggerSync,
    // Helper functions
    getCollectionsByCategory: getCollectionsByCategoryBound,
    getCategoryForCollection: getCategoryForCollectionBound,
    isValidCollection: isValidCollectionBound
  };
};
const useCollectionSearch = (options = {}) => {
  const {
    initialSearchQuery = "",
    initialCategory = "all",
    initialShowSelectedOnly = false,
    initialSortBy = "name",
    initialSortOrder = "asc",
    debounceMs = 300
  } = options;
  const [searchQuery, setSearchQuery] = reactExports.useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = reactExports.useState(initialCategory);
  const [showSelectedOnly, setShowSelectedOnly] = reactExports.useState(initialShowSelectedOnly);
  const [sortBy, setSortBy] = reactExports.useState(initialSortBy);
  const [sortOrder, setSortOrder] = reactExports.useState(initialSortOrder);
  const isFiltered = reactExports.useMemo(() => {
    return searchQuery.trim() !== "" || selectedCategory !== "all" || showSelectedOnly;
  }, [searchQuery, selectedCategory, showSelectedOnly]);
  const clearFilters = reactExports.useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setShowSelectedOnly(false);
  }, []);
  const resetToDefaults = reactExports.useCallback(() => {
    setSearchQuery(initialSearchQuery);
    setSelectedCategory(initialCategory);
    setShowSelectedOnly(initialShowSelectedOnly);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialSearchQuery, initialCategory, initialShowSelectedOnly, initialSortBy, initialSortOrder]);
  const actions = {
    setSearchQuery,
    setSelectedCategory,
    setShowSelectedOnly,
    setSortBy,
    setSortOrder,
    clearFilters,
    resetToDefaults
  };
  const state = {
    searchQuery,
    selectedCategory,
    showSelectedOnly,
    sortBy,
    sortOrder
  };
  return {
    state,
    actions,
    isFiltered
  };
};
const useFirebaseCollectionSearch = (collections, selectedCollections, options = {}) => {
  const { state, actions, isFiltered } = useCollectionSearch(options);
  const searchIndex = reactExports.useMemo(() => {
    const index = {};
    Object.entries(collections).forEach(([categoryName, category]) => {
      category.collections.forEach((collection2) => {
        const terms = [
          collection2.toLowerCase(),
          categoryName.toLowerCase(),
          category.description.toLowerCase(),
          // Add partial matches for better search
          ...collection2.toLowerCase().split("_"),
          ...collection2.toLowerCase().split(/(?=[A-Z])/),
          ...categoryName.toLowerCase().split(" ")
        ];
        terms.forEach((term) => {
          if (term.length > 1) {
            if (!index[term]) {
              index[term] = [];
            }
            if (!index[term].includes(collection2)) {
              index[term].push(collection2);
            }
          }
        });
      });
    });
    return index;
  }, [collections]);
  const filteredCollections = reactExports.useMemo(() => {
    let filtered = {};
    Object.entries(collections).forEach(([categoryName, category]) => {
      let categoryCollections = category.collections;
      if (state.searchQuery.trim()) {
        const query2 = state.searchQuery.toLowerCase().trim();
        const searchTerms = query2.split(" ").filter((term) => term.length > 0);
        categoryCollections = categoryCollections.filter((collection2) => {
          return searchTerms.every((term) => {
            var _a;
            if (collection2.toLowerCase().includes(term)) return true;
            if (categoryName.toLowerCase().includes(term)) return true;
            if (category.description.toLowerCase().includes(term)) return true;
            return ((_a = searchIndex[term]) == null ? void 0 : _a.includes(collection2)) || false;
          });
        });
      }
      if (state.selectedCategory && state.selectedCategory !== "all") {
        if (categoryName !== state.selectedCategory) {
          return;
        }
      }
      if (state.showSelectedOnly) {
        categoryCollections = categoryCollections.filter(
          (collection2) => selectedCollections.includes(collection2)
        );
      }
      if (categoryCollections.length > 0) {
        filtered[categoryName] = __spreadProps(__spreadValues({}, category), {
          collections: categoryCollections
        });
      }
    });
    return filtered;
  }, [collections, state, selectedCollections, searchIndex]);
  const getSearchSuggestions = reactExports.useCallback((query2, limit2 = 10) => {
    if (!query2.trim()) return [];
    const suggestions = /* @__PURE__ */ new Set();
    const searchTerms = query2.toLowerCase().trim().split(" ").filter((term) => term.length > 0);
    searchTerms.forEach((term) => {
      Object.values(collections).forEach((category) => {
        category.collections.forEach((collection2) => {
          if (collection2.toLowerCase().startsWith(term)) {
            suggestions.add(collection2);
          }
        });
      });
      Object.values(collections).forEach((category) => {
        category.collections.forEach((collection2) => {
          if (collection2.toLowerCase().includes(term) && !collection2.toLowerCase().startsWith(term)) {
            suggestions.add(collection2);
          }
        });
      });
    });
    return Array.from(suggestions).slice(0, limit2);
  }, [collections]);
  const getStatistics = reactExports.useCallback(() => {
    const totalAvailable = Object.values(collections).reduce((sum, category) => sum + category.collections.length, 0);
    const totalFiltered = Object.values(filteredCollections).reduce((sum, category) => sum + category.collections.length, 0);
    const selectedFiltered = Object.values(filteredCollections).reduce(
      (sum, category) => sum + category.collections.filter((c) => selectedCollections.includes(c)).length,
      0
    );
    return {
      totalAvailable,
      totalFiltered,
      selectedFiltered,
      totalSelected: selectedCollections.length,
      isFiltered
    };
  }, [collections, filteredCollections, selectedCollections, isFiltered]);
  return {
    state,
    actions,
    filteredCollections,
    getSearchSuggestions,
    getStatistics,
    isFiltered
  };
};
const CategoryRow = ({
  categoryName,
  category,
  selectedCollections,
  onCollectionToggle,
  onSelectAllInCategory,
  onDeselectAllInCategory,
  loading = false,
  expanded = true,
  onToggleExpanded
}) => {
  const selectedInCategory = category.collections.filter(
    (c) => selectedCollections.includes(c)
  );
  const allSelected = selectedInCategory.length === category.collections.length;
  const someSelected = selectedInCategory.length > 0 && selectedInCategory.length < category.collections.length;
  const handleToggleExpanded = () => {
    if (onToggleExpanded) {
      onToggleExpanded(categoryName);
    }
  };
  const handleSelectAll = () => {
    if (onSelectAllInCategory) {
      onSelectAllInCategory(categoryName, category.collections);
    }
  };
  const handleDeselectAll = () => {
    if (onDeselectAllInCategory) {
      onDeselectAllInCategory(categoryName, category.collections);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      TableRow,
      {
        sx: {
          backgroundColor: "action.hover",
          "&:hover": { backgroundColor: "action.selected" },
          cursor: "pointer"
        },
        onClick: handleToggleExpanded,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { padding: "checkbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              size: "small",
              onClick: handleToggleExpanded,
              disabled: loading,
              children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandLessIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {})
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryIcon, { fontSize: "small", color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: categoryName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: `${selectedInCategory.length}/${category.collections.length}`,
                size: "small",
                color: allSelected ? "success" : someSelected ? "warning" : "default",
                variant: "outlined"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: category.description }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `Select all ${categoryName} collections`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: (e) => {
                  e.stopPropagation();
                  handleSelectAll();
                },
                disabled: allSelected || loading,
                color: "primary",
                sx: {
                  opacity: allSelected ? 0.5 : 1,
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText"
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectAllIcon, { fontSize: "small" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `Deselect all ${categoryName} collections`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: (e) => {
                  e.stopPropagation();
                  handleDeselectAll();
                },
                disabled: selectedInCategory.length === 0 || loading,
                color: "secondary",
                sx: {
                  opacity: selectedInCategory.length === 0 ? 0.5 : 1,
                  "&:hover": {
                    backgroundColor: "secondary.main",
                    color: "secondary.contrastText"
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeselectAllIcon, { fontSize: "small" })
              }
            ) })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, sx: { py: 0, border: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collapse, { in: expanded, timeout: "auto", unmountOnExit: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, backgroundColor: "background.default" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { padding: "checkbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            indeterminate: someSelected,
            checked: allSelected,
            onChange: (e) => {
              if (e.target.checked) {
                handleSelectAll();
              } else {
                handleDeselectAll();
              }
            },
            disabled: loading
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600 }, children: "Collection Name" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600 }, children: "Status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600 }, children: "Actions" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: category.collections.map((collection2) => {
        const isSelected = selectedCollections.includes(collection2);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            hover: true,
            sx: {
              "&:hover": { backgroundColor: "action.hover" },
              cursor: "pointer"
            },
            onClick: () => onCollectionToggle(collection2),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { padding: "checkbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: isSelected,
                  onChange: () => onCollectionToggle(collection2),
                  disabled: loading,
                  color: "primary"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Typography,
                {
                  variant: "body2",
                  sx: {
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "primary.main" : "text.primary"
                  },
                  children: collection2
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: isSelected ? "Selected" : "Available",
                  size: "small",
                  color: isSelected ? "success" : "default",
                  variant: isSelected ? "filled" : "outlined"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormControlLabel,
                {
                  control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: isSelected,
                      onChange: () => onCollectionToggle(collection2),
                      disabled: loading,
                      size: "small"
                    }
                  ),
                  label: "",
                  sx: { m: 0 }
                }
              ) })
            ]
          },
          collection2
        );
      }) })
    ] }) }) }) }) })
  ] });
};
const CollapsibleCollectionTable = ({
  collections,
  selectedCollections,
  onCollectionToggle,
  onSelectAllInCategory,
  onDeselectAllInCategory,
  loading = false,
  compact = false,
  expandedCategories = [],
  onExpandedCategoriesChange
}) => {
  const selectionStats = reactExports.useMemo(() => {
    const totalCollections = Object.values(collections).reduce((sum, category) => sum + category.collections.length, 0);
    const selectedCount = Object.values(collections).reduce(
      (sum, category) => sum + category.collections.filter((c) => selectedCollections.includes(c)).length,
      0
    );
    return {
      totalCollections,
      selectedCollections: selectedCount
    };
  }, [collections, selectedCollections]);
  const [internalExpandedCategories, setInternalExpandedCategories] = reactExports.useState([]);
  const currentExpandedCategories = expandedCategories.length > 0 ? expandedCategories : internalExpandedCategories;
  const setExpandedCategories = onExpandedCategoriesChange || setInternalExpandedCategories;
  React.useEffect(() => {
    if (currentExpandedCategories.length === 0 && Object.keys(collections).length > 0) {
      setExpandedCategories(Object.keys(collections));
    }
  }, [collections, currentExpandedCategories.length, setExpandedCategories]);
  const handleToggleCategory = (categoryName) => {
    const newExpanded = currentExpandedCategories.includes(categoryName) ? currentExpandedCategories.filter((cat) => cat !== categoryName) : [...currentExpandedCategories, categoryName];
    setExpandedCategories(newExpanded);
  };
  const handleExpandAll = () => {
    setExpandedCategories(Object.keys(collections));
  };
  const handleCollapseAll = () => {
    setExpandedCategories([]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: "100%" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Paper,
      {
        elevation: 1,
        sx: {
          p: compact ? 1.5 : 2,
          mb: 2,
          backgroundColor: "background.paper",
          borderRadius: 2
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionsIcon, { color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Collection Selection" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { orientation: "vertical", flexItem: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryIcon, {}),
              label: `${selectionStats.selectedCollections} of ${selectionStats.totalCollections} selected`,
              color: "primary",
              variant: "outlined",
              size: "small"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Click category rows to expand/collapse collections" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, ml: "auto" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}),
                onClick: handleExpandAll,
                disabled: loading || currentExpandedCategories.length === Object.keys(collections).length,
                variant: "outlined",
                children: "Expand All"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandLessIcon, {}),
                onClick: handleCollapseAll,
                disabled: loading || currentExpandedCategories.length === 0,
                variant: "outlined",
                children: "Collapse All"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, elevation: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: compact ? "small" : "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { backgroundColor: "primary.main" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { padding: "checkbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { color: "primary.contrastText", fontWeight: 600 }, children: "Expand" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { color: "primary.contrastText", fontWeight: 600 }, children: "Category" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { color: "primary.contrastText", fontWeight: 600 }, children: "Description" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { color: "primary.contrastText", fontWeight: 600 }, children: "Actions" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Object.entries(collections).map(([categoryName, category]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        CategoryRow,
        {
          categoryName,
          category,
          selectedCollections,
          onCollectionToggle,
          onSelectAllInCategory,
          onDeselectAllInCategory,
          loading,
          expanded: currentExpandedCategories.includes(categoryName),
          onToggleExpanded: handleToggleCategory
        },
        categoryName
      )) })
    ] }) })
  ] });
};
const CollectionSearchFilter = ({
  collections,
  allCollections,
  selectedCollections,
  searchQuery,
  selectedCategory,
  showSelectedOnly,
  onSearchChange,
  onCategoryChange,
  onShowSelectedOnlyChange,
  onCollectionToggle,
  onSelectAll,
  onDeselectAll,
  onRefresh,
  onSelectAllInCategory,
  onDeselectAllInCategory,
  loading = false,
  error = null,
  totalCount = 0,
  selectedCount = 0,
  variant = "wizard",
  compact = false,
  layout = "cards",
  expandedCategories = [],
  onExpandedCategoriesChange
}) => {
  const filteredCollections = reactExports.useMemo(() => {
    let filtered = {};
    Object.entries(collections).forEach(([categoryName, category]) => {
      let categoryCollections = category.collections;
      if (searchQuery.trim()) {
        const query2 = searchQuery.toLowerCase().trim();
        categoryCollections = categoryCollections.filter(
          (collection2) => collection2.toLowerCase().includes(query2) || categoryName.toLowerCase().includes(query2) || category.description.toLowerCase().includes(query2)
        );
      }
      if (selectedCategory && selectedCategory !== "all") {
        if (categoryName !== selectedCategory) {
          return;
        }
      }
      if (showSelectedOnly) {
        categoryCollections = categoryCollections.filter(
          (collection2) => selectedCollections.includes(collection2)
        );
      }
      if (categoryCollections.length > 0) {
        filtered[categoryName] = __spreadProps(__spreadValues({}, category), {
          collections: categoryCollections
        });
      }
    });
    return filtered;
  }, [collections, searchQuery, selectedCategory, showSelectedOnly, selectedCollections]);
  const availableCategories = reactExports.useMemo(() => {
    return Object.keys(collections).map((categoryName) => ({
      value: categoryName,
      label: categoryName,
      count: collections[categoryName].collections.length
    }));
  }, [collections]);
  const selectionStats = reactExports.useMemo(() => {
    const totalFiltered = Object.values(filteredCollections).reduce((sum, category) => sum + category.collections.length, 0);
    const selectedFiltered = Object.values(filteredCollections).reduce(
      (sum, category) => sum + category.collections.filter((c) => selectedCollections.includes(c)).length,
      0
    );
    return {
      totalFiltered,
      selectedFiltered,
      totalAvailable: allCollections.length,
      totalSelected: selectedCollections.length
    };
  }, [filteredCollections, selectedCollections, allCollections]);
  const handleClearFilters = reactExports.useCallback(() => {
    onSearchChange("");
    onCategoryChange("all");
    onShowSelectedOnlyChange(false);
  }, [onSearchChange, onCategoryChange, onShowSelectedOnlyChange]);
  const handleSelectAllVisible = reactExports.useCallback(() => {
    const visibleCollections = Object.values(filteredCollections).flatMap((category) => category.collections);
    visibleCollections.forEach((collection2) => {
      if (!selectedCollections.includes(collection2)) {
        onCollectionToggle(collection2);
      }
    });
  }, [filteredCollections, selectedCollections, onCollectionToggle]);
  const handleDeselectAllVisible = reactExports.useCallback(() => {
    const visibleCollections = Object.values(filteredCollections).flatMap((category) => category.collections);
    visibleCollections.forEach((collection2) => {
      if (selectedCollections.includes(collection2)) {
        onCollectionToggle(collection2);
      }
    });
  }, [filteredCollections, selectedCollections, onCollectionToggle]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: "100%" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Paper,
      {
        elevation: variant === "dialog" ? 2 : 0,
        sx: {
          p: compact ? 2 : 3,
          mb: 2,
          backgroundColor: variant === "dialog" ? "background.paper" : "transparent",
          borderRadius: variant === "dialog" ? 2 : 0
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, alignItems: "center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                placeholder: "Search collections by name, category, or description...",
                value: searchQuery,
                onChange: (e) => onSearchChange(e.target.value),
                InputProps: {
                  startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, { sx: { color: "text.secondary" } }) }),
                  endAdornment: searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      size: "small",
                      onClick: () => onSearchChange(""),
                      edge: "end",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearIcon, {})
                    }
                  ) })
                },
                size: compact ? "small" : "medium",
                disabled: loading
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: compact ? "small" : "medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selectedCategory,
                  onChange: (e) => onCategoryChange(e.target.value),
                  disabled: loading,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "all", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryIcon, { fontSize: "small" }),
                      "All Categories (",
                      totalCount,
                      ")"
                    ] }) }),
                    availableCategories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: category.value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, width: "100%" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { flex: 1 }, children: category.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          label: category.count,
                          size: "small",
                          sx: { ml: "auto", height: 20, fontSize: "0.7rem" }
                        }
                      )
                    ] }) }, category.value))
                  ]
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Refresh collections", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  onClick: onRefresh,
                  disabled: loading,
                  size: compact ? "small" : "medium",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {})
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Clear all filters", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  onClick: handleClearFilters,
                  disabled: !searchQuery && selectedCategory === "all" && !showSelectedOnly,
                  size: compact ? "small" : "medium",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearIcon, {})
                }
              ) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: showSelectedOnly,
                    onChange: (e) => onShowSelectedOnlyChange(e.target.checked),
                    size: "small"
                  }
                ),
                label: "Show selected only"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { orientation: "vertical", flexItem: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectAllIcon, {}),
                  onClick: handleSelectAllVisible,
                  disabled: loading || selectionStats.selectedFiltered === selectionStats.totalFiltered,
                  children: "Select All Visible"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "small",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeselectAllIcon, {}),
                  onClick: handleDeselectAllVisible,
                  disabled: loading || selectionStats.selectedFiltered === 0,
                  children: "Deselect All Visible"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionsIcon, {}),
                label: `${selectionStats.totalSelected} of ${selectionStats.totalAvailable} selected`,
                color: "primary",
                variant: "outlined",
                size: "small"
              }
            ),
            searchQuery || selectedCategory !== "all" || showSelectedOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FilterList, {}),
                label: `${selectionStats.selectedFiltered} of ${selectionStats.totalFiltered} visible`,
                color: "secondary",
                variant: "outlined",
                size: "small"
              }
            ) : null
          ] })
        ]
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }),
    Object.keys(filteredCollections).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
      textAlign: "center",
      py: 4,
      color: "text.secondary"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionsIcon, { sx: { fontSize: 48, mb: 2, opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "No collections found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: searchQuery || selectedCategory !== "all" || showSelectedOnly ? "Try adjusting your search or filter criteria" : "No collections are available for selection" })
    ] }) : layout === "table" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollapsibleCollectionTable,
      {
        collections: filteredCollections,
        selectedCollections,
        onCollectionToggle,
        onSelectAllInCategory,
        onDeselectAllInCategory,
        loading,
        compact,
        expandedCategories,
        onExpandedCategoriesChange
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: Object.entries(filteredCollections).map(([categoryName, category]) => {
      const selectedInCategory = category.collections.filter(
        (c) => selectedCollections.includes(c)
      );
      const allSelected = selectedInCategory.length === category.collections.length;
      const someSelected = selectedInCategory.length > 0 && selectedInCategory.length < category.collections.length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          elevation: 1,
          sx: {
            p: 2,
            backgroundColor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { fontSize: "1.1rem" }, children: [
                  category.icon,
                  " ",
                  categoryName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: `${selectedInCategory.length}/${category.collections.length}`,
                    size: "small",
                    color: allSelected ? "success" : someSelected ? "warning" : "default",
                    variant: "outlined"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: {
                  color: "text.secondary",
                  maxWidth: "300px",
                  textAlign: "right"
                }, children: category.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 0.5, ml: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `Select all ${categoryName} collections`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      size: "small",
                      onClick: () => {
                        if (onSelectAllInCategory) {
                          onSelectAllInCategory(categoryName, category.collections);
                        }
                      },
                      disabled: allSelected || loading,
                      color: "primary",
                      sx: {
                        opacity: allSelected ? 0.5 : 1,
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "primary.contrastText"
                        }
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectAllIcon, { fontSize: "small" })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: `Deselect all ${categoryName} collections`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      size: "small",
                      onClick: () => {
                        if (onDeselectAllInCategory) {
                          onDeselectAllInCategory(categoryName, category.collections);
                        }
                      },
                      disabled: selectedInCategory.length === 0 || loading,
                      color: "secondary",
                      sx: {
                        opacity: selectedInCategory.length === 0 ? 0.5 : 1,
                        "&:hover": {
                          backgroundColor: "secondary.main",
                          color: "secondary.contrastText"
                        }
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeselectAllIcon, { fontSize: "small" })
                    }
                  ) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 1, children: category.collections.map((collection2) => {
              const isSelected = selectedCollections.includes(collection2);
              return /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Box,
                {
                  onClick: () => onCollectionToggle(collection2),
                  sx: {
                    p: 1.5,
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    borderRadius: 1,
                    backgroundColor: isSelected ? "primary.main" : "background.default",
                    color: isSelected ? "primary.contrastText" : "text.primary",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: isSelected ? "primary.dark" : "primary.light",
                      backgroundColor: isSelected ? "primary.dark" : "action.hover",
                      transform: "translateY(-1px)",
                      boxShadow: 2
                    },
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Checkbox,
                      {
                        checked: isSelected,
                        size: "small",
                        sx: {
                          color: isSelected ? "inherit" : "text.secondary",
                          "&.Mui-checked": {
                            color: "inherit"
                          }
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Typography,
                      {
                        variant: "body2",
                        sx: {
                          fontWeight: isSelected ? 600 : 400,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        },
                        children: collection2
                      }
                    )
                  ]
                }
              ) }, collection2);
            }) })
          ]
        },
        categoryName
      );
    }) })
  ] });
};
const STEPS$1 = [
  "Basic Information",
  "Cloud Provider Selection",
  "Authentication Setup",
  "Storage Configuration",
  "Collection Assignment",
  // New step for Firestore collection assignment
  "Advanced Options",
  "Review & Create"
];
const DEFAULT_FORM_DATA = {
  name: "",
  description: "",
  visibility: "private",
  tags: [],
  cloudProvider: "firestore",
  authentication: {},
  storage: {
    backend: "firestore"
  },
  schema: {
    // Use the unified Backbone Logic schema automatically
    template: "custom",
    customFields: []
  },
  collectionAssignment: {
    selectedCollections: [],
    includeSubcollections: false,
    dataFilters: [],
    organizationScope: true
    // Default to organization-scoped data for multi-tenancy
  },
  advanced: {
    encryption: false,
    compression: false,
    backup: true,
    versioning: false,
    accessLogging: false
  }
};
const DatasetCreationWizard = React.memo(({
  open,
  onClose,
  onSuccess,
  preselectedProvider,
  assignToProject
}) => {
  var _a, _b;
  const [activeStep, setActiveStep] = reactExports.useState(0);
  const [formData, setFormData] = reactExports.useState(DEFAULT_FORM_DATA);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [validationErrors, setValidationErrors] = reactExports.useState({});
  const [showCredentials, setShowCredentials] = reactExports.useState({});
  const [testingConnection, setTestingConnection] = reactExports.useState(false);
  const [connectionTestResult, setConnectionTestResult] = reactExports.useState(null);
  const [conflictCheck, setConflictCheck] = reactExports.useState(null);
  const [existingDatasets, setExistingDatasets] = reactExports.useState([]);
  const [loadingConflictCheck, setLoadingConflictCheck] = reactExports.useState(false);
  const [expandedCategories, setExpandedCategories] = reactExports.useState([]);
  const {
    collections: DASHBOARD_COLLECTIONS_BY_CATEGORY2,
    allCollections: ALL_DASHBOARD_COLLECTIONS2,
    loading: collectionsLoading,
    error: collectionsError,
    refresh: refreshCollections,
    startRealTimeMonitoring,
    stopRealTimeMonitoring
  } = useDynamicCollections();
  const {
    state: searchState,
    actions: searchActions
  } = useFirebaseCollectionSearch(
    DASHBOARD_COLLECTIONS_BY_CATEGORY2,
    ((_a = formData.collectionAssignment) == null ? void 0 : _a.selectedCollections) || [],
    {
      initialSearchQuery: "",
      initialCategory: "all",
      initialShowSelectedOnly: false
    }
  );
  const resetForm = reactExports.useCallback(() => {
    const selectedProvider = preselectedProvider || "firestore";
    const storageBackend = selectedProvider === "azure-blob" ? "azure" : selectedProvider;
    setFormData(__spreadProps(__spreadValues({}, DEFAULT_FORM_DATA), {
      cloudProvider: selectedProvider,
      storage: __spreadProps(__spreadValues({}, DEFAULT_FORM_DATA.storage), {
        backend: storageBackend
      })
    }));
    setActiveStep(0);
    setError(null);
    setValidationErrors({});
    setShowCredentials({});
    setConnectionTestResult(null);
  }, [preselectedProvider]);
  reactExports.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);
  reactExports.useEffect(() => {
    if (open) {
      console.log("🔄 [DatasetCreationWizard] Starting real-time collection monitoring...");
      startRealTimeMonitoring();
      return () => {
        console.log("🛑 [DatasetCreationWizard] Stopping real-time collection monitoring...");
        stopRealTimeMonitoring();
      };
    }
  }, [open, startRealTimeMonitoring, stopRealTimeMonitoring]);
  const updateFormData = reactExports.useCallback((updates) => {
    setFormData((prev) => __spreadValues(__spreadValues({}, prev), updates));
    const newErrors = __spreadValues({}, validationErrors);
    Object.keys(updates).forEach((key) => {
      delete newErrors[key];
    });
    setValidationErrors(newErrors);
  }, [validationErrors]);
  const validateStep = reactExports.useCallback((step) => {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
    const errors = {};
    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          errors.name = "Dataset name is required";
        }
        if (formData.name.length > 100) {
          errors.name = "Dataset name must be 100 characters or less";
        }
        break;
      case 1:
        if (!formData.cloudProvider) {
          errors.cloudProvider = "Please select a cloud provider";
        }
        break;
      case 2:
        if (formData.cloudProvider === "firestore" || formData.cloudProvider === "gcs") {
          if (!((_a2 = formData.authentication.projectId) == null ? void 0 : _a2.trim())) {
            errors.projectId = "Project ID is required for Google Cloud services";
          }
        }
        if (formData.cloudProvider === "s3" || formData.cloudProvider === "aws") {
          if (!((_b2 = formData.authentication.accessKeyId) == null ? void 0 : _b2.trim())) {
            errors.accessKeyId = "Access Key ID is required for AWS services";
          }
          if (!((_c = formData.authentication.secretAccessKey) == null ? void 0 : _c.trim())) {
            errors.secretAccessKey = "Secret Access Key is required for AWS services";
          }
        }
        if (formData.cloudProvider === "azure-blob") {
          if (!((_d = formData.authentication.connectionString) == null ? void 0 : _d.trim())) {
            errors.connectionString = "Connection string is required for Azure services";
          }
        }
        break;
      case 3:
        if (formData.cloudProvider === "gcs" && !((_e = formData.storage.gcsBucket) == null ? void 0 : _e.trim())) {
          errors.gcsBucket = "GCS bucket name is required";
        }
        if (formData.cloudProvider === "s3" && !((_f = formData.storage.s3Bucket) == null ? void 0 : _f.trim())) {
          errors.s3Bucket = "S3 bucket name is required";
        }
        if (formData.cloudProvider === "azure-blob" && !((_g = formData.storage.azureContainer) == null ? void 0 : _g.trim())) {
          errors.azureContainer = "Azure container name is required";
        }
        break;
      case 4:
        if (formData.cloudProvider === "firestore") {
          if (!((_i = (_h = formData.collectionAssignment) == null ? void 0 : _h.selectedCollections) == null ? void 0 : _i.length)) {
            errors.collections = "Please select at least one Firestore collection for this dataset";
          }
        }
        break;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  const handleNext = reactExports.useCallback(() => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, STEPS$1.length - 1));
    }
  }, [activeStep, validateStep]);
  const handleBack = reactExports.useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);
  const handleStepClick = reactExports.useCallback((step) => {
    if (step < activeStep) {
      setActiveStep(step);
    }
  }, [activeStep]);
  const toggleCredentialVisibility = reactExports.useCallback((field) => {
    setShowCredentials((prev) => __spreadProps(__spreadValues({}, prev), {
      [field]: !prev[field]
    }));
  }, []);
  const testConnection = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!formData.cloudProvider) return;
    setTestingConnection(true);
    setConnectionTestResult(null);
    try {
      yield new Promise((resolve) => setTimeout(resolve, 2e3));
      setConnectionTestResult({
        success: true,
        message: "Connection test successful!"
      });
    } catch (error2) {
      setConnectionTestResult({
        success: false,
        message: `Connection test failed: ${error2 instanceof Error ? error2.message : "Unknown error"}`
      });
    } finally {
      setTestingConnection(false);
    }
  }), [formData.cloudProvider]);
  const handleSubmit = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!validateStep(activeStep)) return;
    setIsLoading(true);
    setError(null);
    try {
      const newDataset = yield cloudProjectIntegration.createDataset({
        name: formData.name,
        description: formData.description,
        visibility: formData.visibility,
        tags: formData.tags,
        storage: formData.storage,
        schema: formData.schema,
        projectId: assignToProject || "default-project",
        // Include collection assignment for Firestore datasets
        collectionAssignment: formData.cloudProvider === "firestore" ? formData.collectionAssignment : void 0
      });
      if (newDataset) {
        onSuccess == null ? void 0 : onSuccess(newDataset);
        onClose == null ? void 0 : onClose();
      } else {
        setError("Failed to create dataset: No dataset returned");
      }
    } catch (error2) {
      setError(`Failed to create dataset: ${error2 instanceof Error ? error2.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }), [activeStep, validateStep, formData, onSuccess, onClose]);
  const loadExistingDatasets = reactExports.useCallback(() => __async(void 0, null, function* () {
    try {
      const datasets = yield cloudProjectIntegration.listDatasets();
      setExistingDatasets(datasets);
      console.log("✅ [DatasetCreationWizard] Loaded existing datasets for conflict analysis:", datasets.length);
    } catch (error2) {
      console.warn("⚠️ [DatasetCreationWizard] Failed to load existing datasets:", error2);
      setExistingDatasets([]);
    }
  }), []);
  const checkConflicts = reactExports.useCallback(() => __async(void 0, null, function* () {
    var _a2, _b2;
    if (formData.cloudProvider !== "firestore" || !((_b2 = (_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) == null ? void 0 : _b2.length)) {
      setConflictCheck(null);
      return;
    }
    setLoadingConflictCheck(true);
    try {
      const conflicts = yield datasetConflictAnalyzer.checkDatasetCreationConflicts(
        {
          name: formData.name,
          collectionAssignment: formData.collectionAssignment
        },
        existingDatasets
      );
      setConflictCheck(conflicts);
      console.log("✅ [DatasetCreationWizard] Conflict check complete:", conflicts);
    } catch (error2) {
      console.error("❌ [DatasetCreationWizard] Failed to check conflicts:", error2);
      setConflictCheck(null);
    } finally {
      setLoadingConflictCheck(false);
    }
  }), [formData.cloudProvider, formData.name, formData.collectionAssignment, existingDatasets]);
  const handleCollectionToggle = reactExports.useCallback((collection2) => {
    var _a2, _b2, _c, _d;
    const currentSelections = ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) || [];
    const newSelections = currentSelections.includes(collection2) ? currentSelections.filter((c) => c !== collection2) : [...currentSelections, collection2];
    updateFormData({
      collectionAssignment: __spreadProps(__spreadValues({}, formData.collectionAssignment), {
        selectedCollections: newSelections,
        includeSubcollections: ((_b2 = formData.collectionAssignment) == null ? void 0 : _b2.includeSubcollections) || false,
        dataFilters: ((_c = formData.collectionAssignment) == null ? void 0 : _c.dataFilters) || [],
        organizationScope: ((_d = formData.collectionAssignment) == null ? void 0 : _d.organizationScope) !== false
      })
    });
  }, [formData.collectionAssignment, updateFormData]);
  const handleSelectAll = reactExports.useCallback(() => __async(void 0, null, function* () {
    var _a2, _b2, _c, _d, _e, _f;
    try {
      const { datasetCollectionValidator } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { datasetCollectionValidator: datasetCollectionValidator2 } = yield import("./DatasetCollectionValidator-COtDSV9l.js");
        return { datasetCollectionValidator: datasetCollectionValidator2 };
      }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13]) : void 0);
      const allCollections = yield datasetCollectionValidator.getCollectionRecommendations("ALL_DATA");
      updateFormData({
        collectionAssignment: __spreadProps(__spreadValues({}, formData.collectionAssignment), {
          selectedCollections: allCollections,
          includeSubcollections: ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.includeSubcollections) || false,
          dataFilters: ((_b2 = formData.collectionAssignment) == null ? void 0 : _b2.dataFilters) || [],
          organizationScope: ((_c = formData.collectionAssignment) == null ? void 0 : _c.organizationScope) !== false
        })
      });
      console.log("✅ [DatasetCreationWizard] Selected all collections:", allCollections.length);
    } catch (error2) {
      console.warn("⚠️ [DatasetCreationWizard] Failed to get dynamic collections, using static fallback:", error2);
      updateFormData({
        collectionAssignment: __spreadProps(__spreadValues({}, formData.collectionAssignment), {
          selectedCollections: ALL_DASHBOARD_COLLECTIONS2,
          includeSubcollections: ((_d = formData.collectionAssignment) == null ? void 0 : _d.includeSubcollections) || false,
          dataFilters: ((_e = formData.collectionAssignment) == null ? void 0 : _e.dataFilters) || [],
          organizationScope: ((_f = formData.collectionAssignment) == null ? void 0 : _f.organizationScope) !== false
        })
      });
    }
  }), [formData.collectionAssignment, updateFormData]);
  const handleDeselectAll = reactExports.useCallback(() => {
    var _a2, _b2, _c;
    updateFormData({
      collectionAssignment: __spreadProps(__spreadValues({}, formData.collectionAssignment), {
        selectedCollections: [],
        includeSubcollections: ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.includeSubcollections) || false,
        dataFilters: ((_b2 = formData.collectionAssignment) == null ? void 0 : _b2.dataFilters) || [],
        organizationScope: ((_c = formData.collectionAssignment) == null ? void 0 : _c.organizationScope) !== false
      })
    });
  }, [formData.collectionAssignment, updateFormData]);
  const handleSelectAllInCategory = reactExports.useCallback((categoryName, categoryCollections) => {
    var _a2, _b2, _c, _d;
    const currentSelections = ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) || [];
    const newSelections = [.../* @__PURE__ */ new Set([...currentSelections, ...categoryCollections])];
    updateFormData({
      collectionAssignment: __spreadProps(__spreadValues({}, formData.collectionAssignment), {
        selectedCollections: newSelections,
        includeSubcollections: ((_b2 = formData.collectionAssignment) == null ? void 0 : _b2.includeSubcollections) || false,
        dataFilters: ((_c = formData.collectionAssignment) == null ? void 0 : _c.dataFilters) || [],
        organizationScope: ((_d = formData.collectionAssignment) == null ? void 0 : _d.organizationScope) !== false
      })
    });
  }, [formData.collectionAssignment, updateFormData]);
  const handleDeselectAllInCategory = reactExports.useCallback((categoryName, categoryCollections) => {
    var _a2, _b2, _c, _d;
    const currentSelections = ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) || [];
    const newSelections = currentSelections.filter((collection2) => !categoryCollections.includes(collection2));
    updateFormData({
      collectionAssignment: __spreadProps(__spreadValues({}, formData.collectionAssignment), {
        selectedCollections: newSelections,
        includeSubcollections: ((_b2 = formData.collectionAssignment) == null ? void 0 : _b2.includeSubcollections) || false,
        dataFilters: ((_c = formData.collectionAssignment) == null ? void 0 : _c.dataFilters) || [],
        organizationScope: ((_d = formData.collectionAssignment) == null ? void 0 : _d.organizationScope) !== false
      })
    });
  }, [formData.collectionAssignment, updateFormData]);
  reactExports.useEffect(() => {
    if (open) {
      loadExistingDatasets();
    }
  }, [open, loadExistingDatasets]);
  reactExports.useEffect(() => {
    var _a2, _b2;
    if (activeStep === 4 && ((_b2 = (_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) == null ? void 0 : _b2.length)) {
      const timeoutId = setTimeout(() => {
        checkConflicts();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [activeStep, (_b = formData.collectionAssignment) == null ? void 0 : _b.selectedCollections, checkConflicts]);
  const renderStepContent = reactExports.useCallback((step) => {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
    switch (step) {
      case 0:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Basic Information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Dataset Name",
                value: formData.name,
                onChange: (e) => updateFormData({ name: e.target.value }),
                error: !!validationErrors.name,
                helperText: validationErrors.name,
                required: true
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Description (Optional)",
                value: formData.description || "",
                onChange: (e) => updateFormData({ description: e.target.value }),
                multiline: true,
                rows: 3
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { children: "Visibility" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                RadioGroup,
                {
                  value: formData.visibility,
                  onChange: (e) => updateFormData({ visibility: e.target.value }),
                  row: true,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormControlLabel, { value: "private", control: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, {}), label: "Private" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormControlLabel, { value: "organization", control: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, {}), label: "Organization" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormControlLabel, { value: "public", control: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, {}), label: "Public" })
                  ]
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Tags (Optional)",
                value: ((_a2 = formData.tags) == null ? void 0 : _a2.join(", ")) || "",
                onChange: (e) => updateFormData({
                  tags: e.target.value.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0)
                }),
                placeholder: "tag1, tag2, tag3",
                helperText: "Comma-separated tags for organization"
              }
            ) })
          ] })
        ] });
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Cloud Provider Selection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: [
            { value: "firestore", label: "Firestore", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}), description: "Google Cloud Firestore" },
            { value: "gcs", label: "Google Cloud Storage", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}), description: "Google Cloud Storage" },
            { value: "s3", label: "Amazon S3", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}), description: "Amazon S3" },
            { value: "aws", label: "AWS Services", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}), description: "AWS Services" },
            { value: "azure-blob", label: "Azure Blob Storage", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}), description: "Microsoft Azure" },
            { value: "local", label: "Local Storage", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {}), description: "Local file system" }
          ].map((provider) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Card,
            {
              sx: {
                cursor: "pointer",
                border: formData.cloudProvider === provider.value ? "2px solid" : "1px solid",
                borderColor: formData.cloudProvider === provider.value ? "primary.main" : "divider",
                "&:hover": { borderColor: "primary.main" }
              },
              onClick: () => {
                const selectedProvider = provider.value;
                const storageBackend = selectedProvider === "azure-blob" ? "azure" : selectedProvider;
                updateFormData({
                  cloudProvider: selectedProvider,
                  storage: __spreadProps(__spreadValues({}, formData.storage), { backend: storageBackend })
                });
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", p: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 1 }, children: provider.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", sx: { fontWeight: 600 }, children: provider.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: provider.description })
              ] })
            }
          ) }, provider.value)) })
        ] });
      case 2:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Authentication Setup" }),
          formData.cloudProvider === "firestore" || formData.cloudProvider === "gcs" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Project ID",
                value: formData.authentication.projectId || "",
                onChange: (e) => updateFormData({
                  authentication: __spreadProps(__spreadValues({}, formData.authentication), { projectId: e.target.value })
                }),
                error: !!validationErrors.projectId,
                helperText: validationErrors.projectId,
                required: true
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Service Account Key (Optional)",
                value: formData.authentication.serviceAccountKey || "",
                onChange: (e) => updateFormData({
                  authentication: __spreadProps(__spreadValues({}, formData.authentication), { serviceAccountKey: e.target.value })
                }),
                multiline: true,
                rows: 4,
                placeholder: "Paste your service account JSON key here..."
              }
            ) })
          ] }) : formData.cloudProvider === "s3" || formData.cloudProvider === "aws" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Access Key ID",
                value: formData.authentication.accessKeyId || "",
                onChange: (e) => updateFormData({
                  authentication: __spreadProps(__spreadValues({}, formData.authentication), { accessKeyId: e.target.value })
                }),
                error: !!validationErrors.accessKeyId,
                helperText: validationErrors.accessKeyId,
                required: true
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Secret Access Key",
                value: formData.authentication.secretAccessKey || "",
                onChange: (e) => updateFormData({
                  authentication: __spreadProps(__spreadValues({}, formData.authentication), { secretAccessKey: e.target.value })
                }),
                error: !!validationErrors.secretAccessKey,
                helperText: validationErrors.secretAccessKey,
                required: true,
                type: showCredentials.secretAccessKey ? "text" : "password",
                InputProps: {
                  endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    IconButton,
                    {
                      onClick: () => toggleCredentialVisibility("secretAccessKey"),
                      edge: "end",
                      children: showCredentials.secretAccessKey ? /* @__PURE__ */ jsxRuntimeExports.jsx(VisibilityOff, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                    }
                  ) })
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Region",
                value: formData.authentication.region || "",
                onChange: (e) => updateFormData({
                  authentication: __spreadProps(__spreadValues({}, formData.authentication), { region: e.target.value })
                }),
                placeholder: "us-east-1"
              }
            ) })
          ] }) : formData.cloudProvider === "azure-blob" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Connection String",
              value: formData.authentication.connectionString || "",
              onChange: (e) => updateFormData({
                authentication: __spreadProps(__spreadValues({}, formData.authentication), { connectionString: e.target.value })
              }),
              error: !!validationErrors.connectionString,
              helperText: validationErrors.connectionString,
              required: true,
              multiline: true,
              rows: 3,
              placeholder: "DefaultEndpointsProtocol=https;AccountName=..."
            }
          ) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "No authentication required for local storage." }),
          formData.cloudProvider !== "local" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                onClick: testConnection,
                disabled: testingConnection,
                startIcon: testingConnection ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}),
                children: testingConnection ? "Testing Connection..." : "Test Connection"
              }
            ),
            connectionTestResult && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Alert,
              {
                severity: connectionTestResult.success ? "success" : "error",
                sx: { mt: 2 },
                children: connectionTestResult.message
              }
            )
          ] })
        ] });
      case 3:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Storage Configuration" }),
          formData.cloudProvider === "gcs" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "GCS Bucket Name",
                value: formData.storage.gcsBucket || "",
                onChange: (e) => updateFormData({
                  storage: __spreadProps(__spreadValues({}, formData.storage), { gcsBucket: e.target.value })
                }),
                error: !!validationErrors.gcsBucket,
                helperText: validationErrors.gcsBucket,
                required: true,
                placeholder: "my-dataset-bucket"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Prefix (Optional)",
                value: formData.storage.gcsPrefix || "",
                onChange: (e) => updateFormData({
                  storage: __spreadProps(__spreadValues({}, formData.storage), { gcsPrefix: e.target.value })
                }),
                placeholder: "datasets/",
                helperText: "Optional folder prefix for organizing datasets"
              }
            ) })
          ] }),
          formData.cloudProvider === "s3" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "S3 Bucket Name",
                value: formData.storage.s3Bucket || "",
                onChange: (e) => updateFormData({
                  storage: __spreadProps(__spreadValues({}, formData.storage), { s3Bucket: e.target.value })
                }),
                error: !!validationErrors.s3Bucket,
                helperText: validationErrors.s3Bucket,
                required: true,
                placeholder: "my-dataset-bucket"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Region",
                value: formData.storage.s3Region || "",
                onChange: (e) => updateFormData({
                  storage: __spreadProps(__spreadValues({}, formData.storage), { s3Region: e.target.value })
                }),
                placeholder: "us-east-1"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Prefix (Optional)",
                value: formData.storage.s3Prefix || "",
                onChange: (e) => updateFormData({
                  storage: __spreadProps(__spreadValues({}, formData.storage), { s3Prefix: e.target.value })
                }),
                placeholder: "datasets/",
                helperText: "Optional folder prefix for organizing datasets"
              }
            ) })
          ] }),
          formData.cloudProvider === "azure-blob" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Container Name",
                value: formData.storage.azureContainer || "",
                onChange: (e) => updateFormData({
                  storage: __spreadProps(__spreadValues({}, formData.storage), { azureContainer: e.target.value })
                }),
                error: !!validationErrors.azureContainer,
                helperText: validationErrors.azureContainer,
                required: true,
                placeholder: "datasets"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Prefix (Optional)",
                value: formData.storage.azurePrefix || "",
                onChange: (e) => updateFormData({
                  storage: __spreadProps(__spreadValues({}, formData.storage), { azurePrefix: e.target.value })
                }),
                placeholder: "datasets/",
                helperText: "Optional folder prefix for organizing datasets"
              }
            ) })
          ] }),
          formData.cloudProvider === "local" && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", children: "Local storage will be configured automatically based on your system settings." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mt: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 0.5 }, children: "Using Backbone Logic Unified Schema" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "The standard Backbone Logic schema will be automatically applied to this dataset. This ensures full compatibility with all application features and provides a consistent data structure." })
          ] })
        ] });
      case 4:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Collection Assignment" }),
          formData.cloudProvider === "firestore" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Select which Firestore collections this dataset should include. Data will be automatically scoped to your organization for security." }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              CollectionSearchFilter,
              {
                collections: DASHBOARD_COLLECTIONS_BY_CATEGORY2,
                allCollections: ALL_DASHBOARD_COLLECTIONS2,
                selectedCollections: ((_b2 = formData.collectionAssignment) == null ? void 0 : _b2.selectedCollections) || [],
                searchQuery: searchState.searchQuery,
                selectedCategory: searchState.selectedCategory,
                showSelectedOnly: searchState.showSelectedOnly,
                onSearchChange: searchActions.setSearchQuery,
                onCategoryChange: searchActions.setSelectedCategory,
                onShowSelectedOnlyChange: searchActions.setShowSelectedOnly,
                onCollectionToggle: handleCollectionToggle,
                onSelectAll: handleSelectAll,
                onDeselectAll: handleDeselectAll,
                onSelectAllInCategory: handleSelectAllInCategory,
                onDeselectAllInCategory: handleDeselectAllInCategory,
                onRefresh: refreshCollections,
                loading: collectionsLoading,
                error: collectionsError,
                totalCount: ALL_DASHBOARD_COLLECTIONS2.length,
                selectedCount: ((_d = (_c = formData.collectionAssignment) == null ? void 0 : _c.selectedCollections) == null ? void 0 : _d.length) || 0,
                variant: "wizard",
                compact: false,
                layout: "table",
                expandedCategories,
                onExpandedCategoriesChange: setExpandedCategories
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: ((_e = formData.collectionAssignment) == null ? void 0 : _e.includeSubcollections) || false,
                    onChange: (e) => {
                      var _a3, _b3, _c2;
                      return updateFormData({
                        collectionAssignment: {
                          selectedCollections: ((_a3 = formData.collectionAssignment) == null ? void 0 : _a3.selectedCollections) || [],
                          includeSubcollections: e.target.checked,
                          dataFilters: ((_b3 = formData.collectionAssignment) == null ? void 0 : _b3.dataFilters) || [],
                          organizationScope: ((_c2 = formData.collectionAssignment) == null ? void 0 : _c2.organizationScope) || false
                        }
                      });
                    }
                  }
                ),
                label: "Include Subcollections"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: ((_f = formData.collectionAssignment) == null ? void 0 : _f.organizationScope) !== false,
                    onChange: (e) => {
                      var _a3, _b3, _c2;
                      return updateFormData({
                        collectionAssignment: {
                          selectedCollections: ((_a3 = formData.collectionAssignment) == null ? void 0 : _a3.selectedCollections) || [],
                          includeSubcollections: ((_b3 = formData.collectionAssignment) == null ? void 0 : _b3.includeSubcollections) || false,
                          dataFilters: ((_c2 = formData.collectionAssignment) == null ? void 0 : _c2.dataFilters) || [],
                          organizationScope: e.target.checked
                        }
                      });
                    }
                  }
                ),
                label: "Organization Scoped Data (Recommended for Multi-Tenancy)"
              }
            ) }),
            (((_h = (_g = formData.collectionAssignment) == null ? void 0 : _g.selectedCollections) == null ? void 0 : _h.length) || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", gutterBottom: true, sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                "Selected Collections Preview",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: `${((_j = (_i = formData.collectionAssignment) == null ? void 0 : _i.selectedCollections) == null ? void 0 : _j.length) || 0} selected`,
                    size: "small",
                    color: "primary",
                    variant: "outlined"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: {
                p: 2,
                bgcolor: "rgba(25, 118, 210, 0.04)",
                border: "1px solid rgba(25, 118, 210, 0.12)",
                borderRadius: 2
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center"
              }, children: [
                (_l = (_k = formData.collectionAssignment) == null ? void 0 : _k.selectedCollections) == null ? void 0 : _l.map((collection2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, { fontSize: "small" }),
                    label: collection2,
                    variant: "filled",
                    color: "primary",
                    size: "small",
                    sx: {
                      bgcolor: "rgba(25, 118, 210, 0.08)",
                      color: "#ffffff",
                      border: "1px solid rgba(25, 118, 210, 0.2)",
                      "& .MuiChip-icon": {
                        color: "#ffffff"
                      },
                      "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.12)"
                      }
                    }
                  },
                  collection2
                )),
                ((_m = formData.collectionAssignment) == null ? void 0 : _m.organizationScope) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: "Organization Scoped",
                    size: "small",
                    color: "success",
                    variant: "outlined",
                    sx: {
                      ml: 1,
                      fontWeight: 600,
                      bgcolor: "rgba(46, 125, 50, 0.04)"
                    }
                  }
                )
              ] }) })
            ] }),
            loadingConflictCheck && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: "rgba(255, 255, 255, 0.05)", borderRadius: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Analyzing collection conflicts..." })
            ] }) }),
            conflictCheck && (conflictCheck.warnings.length > 0 || conflictCheck.suggestions.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", gutterBottom: true, sx: { color: "white", display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { fontSize: "small", color: "warning" }),
                "Smart Analysis Results"
              ] }),
              conflictCheck.warnings.map((warning, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Alert,
                {
                  severity: warning.severity,
                  sx: { mb: 1, bgcolor: "rgba(255, 255, 255, 0.05)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500, mb: 0.5 }, children: warning.message }),
                    warning.affectedDatasets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { display: "block", mb: 0.5 }, children: [
                      "Affected datasets: ",
                      warning.affectedDatasets.join(", ")
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { fontStyle: "italic" }, children: [
                      "💡 ",
                      warning.recommendation
                    ] })
                  ] })
                },
                index
              )),
              conflictCheck.suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "rgba(255, 255, 255, 0.8)", display: "block", mb: 1 }, children: "💡 Smart Suggestions:" }),
                conflictCheck.suggestions.map((suggestion, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 2, mb: 1, bgcolor: "rgba(79, 70, 229, 0.1)", border: "1px solid rgba(79, 70, 229, 0.3)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: suggestion.type.toUpperCase(),
                      size: "small",
                      sx: {
                        bgcolor: "rgba(79, 70, 229, 0.2)",
                        color: "#8b5cf6",
                        fontWeight: 600,
                        fontSize: "0.65rem"
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "white" }, children: suggestion.message })
                ] }) }, index))
              ] }),
              conflictCheck.hasConflicts && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mt: 2, bgcolor: "rgba(239, 68, 68, 0.1)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: "⚠️ High-priority conflicts detected. Please review and resolve before proceeding." }) })
            ] }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", children: "Collection assignment is only available for Firestore datasets. Please select Firestore as your cloud provider to configure collection assignment." })
        ] });
      case 5:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Advanced Options" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: ((_n = formData.advanced) == null ? void 0 : _n.encryption) || false,
                    onChange: (e) => updateFormData({
                      advanced: __spreadProps(__spreadValues({}, formData.advanced), { encryption: e.target.checked })
                    })
                  }
                ),
                label: "Enable Encryption"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: ((_o = formData.advanced) == null ? void 0 : _o.compression) || false,
                    onChange: (e) => updateFormData({
                      advanced: __spreadProps(__spreadValues({}, formData.advanced), { compression: e.target.checked })
                    })
                  }
                ),
                label: "Enable Compression"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: ((_p = formData.advanced) == null ? void 0 : _p.backup) || false,
                    onChange: (e) => updateFormData({
                      advanced: __spreadProps(__spreadValues({}, formData.advanced), { backup: e.target.checked })
                    })
                  }
                ),
                label: "Enable Backup"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: ((_q = formData.advanced) == null ? void 0 : _q.versioning) || false,
                    onChange: (e) => updateFormData({
                      advanced: __spreadProps(__spreadValues({}, formData.advanced), { versioning: e.target.checked })
                    })
                  }
                ),
                label: "Enable Versioning"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: ((_r = formData.advanced) == null ? void 0 : _r.accessLogging) || false,
                    onChange: (e) => updateFormData({
                      advanced: __spreadProps(__spreadValues({}, formData.advanced), { accessLogging: e.target.checked })
                    })
                  }
                ),
                label: "Enable Access Logging"
              }
            ) })
          ] })
        ] });
      case 6:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Review & Create" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3, mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Dataset Configuration Summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Name: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formData.name })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Provider: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formData.cloudProvider })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Visibility: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formData.visibility })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
                "Schema: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Backbone Logic Unified Schema" })
              ] }) }),
              formData.cloudProvider === "firestore" && ((_t = (_s = formData.collectionAssignment) == null ? void 0 : _s.selectedCollections) == null ? void 0 : _t.length) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Assigned Collections:" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }, children: formData.collectionAssignment.selectedCollections.map((collection2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: collection2,
                    size: "small",
                    color: "primary",
                    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, {})
                  },
                  collection2
                )) }),
                formData.collectionAssignment.organizationScope && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 1, display: "block" }, children: "✓ Data will be automatically scoped to your organization for security" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: "Please review your configuration before creating the dataset. You can go back to any step to make changes." })
        ] });
      default:
        return null;
    }
  }, [formData, validationErrors, showCredentials, updateFormData, toggleCredentialVisibility, testConnection]);
  const componentContent = reactExports.useMemo(() => {
    if (!open) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open,
        onClose,
        maxWidth: "lg",
        fullWidth: true,
        PaperProps: {
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            maxHeight: "90vh"
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
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, { color: "primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Create Dataset" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: onClose, size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { sx: { p: 3 }, children: [
            error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { activeStep, orientation: "horizontal", sx: { mb: 3 }, children: STEPS$1.map((label, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepLabel, { onClick: () => handleStepClick(index), sx: { cursor: "pointer" }, children: label }) }, label)) }),
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
                  activeStep === STEPS$1.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: handleSubmit,
                      variant: "contained",
                      disabled: isLoading || !formData.name.trim(),
                      startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                      sx: {
                        backgroundColor: "primary.main",
                        "&:hover": { backgroundColor: "primary.dark" }
                      },
                      children: isLoading ? "Creating Dataset..." : "Create Dataset"
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
  }, [open, onClose, formData, activeStep, isLoading, error, validationErrors, showCredentials, testingConnection, connectionTestResult, handleBack, handleNext, handleStepClick, handleSubmit, renderStepContent]);
  return componentContent;
});
const DASHBOARD_COLLECTIONS_BY_CATEGORY = {
  "Core System": {
    icon: "👥",
    description: "User management, organizations, and core system data",
    collections: [
      "users",
      "teamMembers",
      "organizations",
      "projects",
      "roles",
      "projectTeamMembers",
      "clients",
      "contacts",
      "test"
    ]
  },
  "Sessions & Workflows": {
    icon: "🎬",
    description: "Production sessions, workflows, and task management",
    collections: [
      "sessions",
      "sessionWorkflows",
      "sessionAssignments",
      "sessionParticipants",
      "workflowTemplates",
      "workflowDiagrams",
      "workflowInstances",
      "workflowSteps",
      "workflowAssignments",
      "sessionPhaseTransitions",
      "sessionReviews",
      "sessionQc",
      "sessionTasks",
      "demoSessions"
    ]
  },
  "Inventory & Equipment": {
    icon: "📦",
    description: "Equipment tracking, network management, and inventory systems",
    collections: [
      "inventoryItems",
      "inventory",
      "networkIPAssignments",
      "networkIPRanges",
      "networks",
      "inventoryHistory",
      "setupProfiles",
      "schemas",
      "schemaFields",
      "mapLayouts",
      "mapLocations",
      "inventoryMaps",
      "mapData",
      "ipRanges"
    ]
  },
  "Timecards & Scheduling": {
    icon: "⏰",
    description: "Time tracking, approvals, and scheduling systems",
    collections: [
      "timecard_configurations",
      "timecard_entries",
      "timecard_template_assignments",
      "timecard_templates",
      "user_timecards",
      "timecard_approvals"
    ]
  },
  "Media & Content": {
    icon: "🎥",
    description: "Media files, production tasks, and content management",
    collections: [
      "mediaFiles",
      "postProductionTasks",
      "stages",
      "notes",
      "reports",
      "callSheets",
      "callSheetTemplates",
      "dailyCallSheets",
      "callSheetPersonnel",
      "callSheetDepartments",
      "callSheetRoles",
      "callsheet_templates",
      "dailyCallSheetRecords"
    ]
  },
  "AI & Automation": {
    icon: "🤖",
    description: "AI agents, messaging, and automated systems",
    collections: [
      "aiAgents",
      "messages",
      "chats",
      "messageSessions",
      "notifications"
    ]
  },
  "Business & Licensing": {
    icon: "💼",
    description: "Licenses, subscriptions, payments, and business data",
    collections: [
      "licenses",
      "subscriptions",
      "payments",
      "userPreferences",
      "auditLogs",
      "audit_logs"
    ]
  },
  "Production Budget Management": {
    icon: "💰",
    description: "Budget tracking, schedules, and financial management",
    collections: [
      "pbmProjects",
      "pbmSchedules",
      "pbmPayscales",
      "pbmDailyStatus",
      "pbmBudgetCategories",
      "pbmFinancialSummary",
      "pbmAnalytics",
      "pbmEpisodes"
    ]
  },
  "Network Delivery & Deliverables": {
    icon: "📡",
    description: "Network delivery bibles, deliverables, and post-production workflows",
    collections: [
      "networkDeliveryBibles",
      "deliverables",
      "enhancedDeliverables",
      "networkDeliveryChats",
      "deliverySpecs",
      "deliveryTemplates",
      "deliveryTracking"
    ]
  },
  "Weather & Environment": {
    icon: "🌤️",
    description: "Weather data, forecasts, and environmental monitoring",
    collections: [
      "weatherData",
      "weatherTemplates",
      "weatherForecasts"
    ]
  },
  "System & Administration": {
    icon: "⚙️",
    description: "System administration, datasets, and data management",
    collections: [
      "datasetAssignments",
      "datasets",
      "edl_data",
      "roleSyncEvents",
      "schemas"
    ]
  }
};
const ALL_DASHBOARD_COLLECTIONS = Object.values(DASHBOARD_COLLECTIONS_BY_CATEGORY).flatMap((category) => category.collections);
const EditDatasetDialog = ({
  open,
  onClose,
  dataset,
  onDatasetUpdated,
  existingDatasets = []
}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const [formData, setFormData] = reactExports.useState({});
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [validationErrors, setValidationErrors] = reactExports.useState({});
  const [conflictCheck, setConflictCheck] = reactExports.useState(null);
  const [loadingConflictCheck, setLoadingConflictCheck] = reactExports.useState(false);
  const [expandedCategories, setExpandedCategories] = reactExports.useState([]);
  const {
    collections: DASHBOARD_COLLECTIONS_BY_CATEGORY2,
    allCollections: ALL_DASHBOARD_COLLECTIONS$1,
    loading: collectionsLoading,
    error: collectionsError,
    refresh: refreshCollections,
    startRealTimeMonitoring,
    stopRealTimeMonitoring
  } = useDynamicCollections();
  const {
    state: searchState,
    actions: searchActions
  } = useFirebaseCollectionSearch(
    DASHBOARD_COLLECTIONS_BY_CATEGORY2,
    ((_a = formData.collectionAssignment) == null ? void 0 : _a.selectedCollections) || [],
    {
      initialSearchQuery: "",
      initialCategory: "all",
      initialShowSelectedOnly: false
    }
  );
  reactExports.useEffect(() => {
    if (dataset && open) {
      setFormData({
        name: dataset.name,
        description: dataset.description,
        visibility: dataset.visibility,
        collectionAssignment: dataset.collectionAssignment || {
          selectedCollections: [],
          includeSubcollections: false,
          dataFilters: [],
          organizationScope: true
        }
      });
      setError(null);
      setValidationErrors({});
      setConflictCheck(null);
    }
  }, [dataset, open]);
  reactExports.useEffect(() => {
    if (open && dataset) {
      console.log("🔄 [EditDatasetDialog] Starting real-time collection monitoring...");
      startRealTimeMonitoring();
      return () => {
        console.log("🛑 [EditDatasetDialog] Stopping real-time collection monitoring...");
        stopRealTimeMonitoring();
      };
    }
  }, [open, dataset, startRealTimeMonitoring, stopRealTimeMonitoring]);
  const updateFormData = reactExports.useCallback((updates) => {
    setFormData((prev) => __spreadValues(__spreadValues({}, prev), updates));
  }, []);
  const checkConflicts = reactExports.useCallback(() => __async(void 0, null, function* () {
    var _a2, _b2;
    if (!dataset || !((_b2 = (_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) == null ? void 0 : _b2.length)) {
      setConflictCheck(null);
      return;
    }
    setLoadingConflictCheck(true);
    try {
      const otherDatasets = existingDatasets.filter((ds) => ds.id !== dataset.id);
      const conflicts = yield datasetConflictAnalyzer.checkDatasetCreationConflicts(
        {
          name: formData.name || dataset.name,
          collectionAssignment: formData.collectionAssignment
        },
        otherDatasets
      );
      setConflictCheck(conflicts);
      console.log("✅ [EditDatasetDialog] Conflict check complete:", conflicts);
    } catch (error2) {
      console.error("❌ [EditDatasetDialog] Failed to check conflicts:", error2);
      setConflictCheck(null);
    } finally {
      setLoadingConflictCheck(false);
    }
  }), [dataset, formData.name, formData.collectionAssignment, existingDatasets]);
  reactExports.useEffect(() => {
    var _a2, _b2;
    if (open && ((_b2 = (_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) == null ? void 0 : _b2.length)) {
      const timeoutId = setTimeout(() => {
        checkConflicts();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [open, (_b = formData.collectionAssignment) == null ? void 0 : _b.selectedCollections, checkConflicts]);
  const validateForm = reactExports.useCallback(() => {
    var _a2, _b2, _c2, _d2;
    const errors = {};
    if (!((_a2 = formData.name) == null ? void 0 : _a2.trim())) {
      errors.name = "Dataset name is required";
    }
    if (((_b2 = dataset == null ? void 0 : dataset.storage) == null ? void 0 : _b2.backend) === "firestore" && !((_d2 = (_c2 = formData.collectionAssignment) == null ? void 0 : _c2.selectedCollections) == null ? void 0 : _d2.length)) {
      errors.collections = "At least one collection must be selected for Firestore datasets";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, dataset]);
  const handleSave = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!dataset || !validateForm()) {
      return;
    }
    if (conflictCheck == null ? void 0 : conflictCheck.hasConflicts) {
      setError("Please resolve high-priority conflicts before saving");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log("💾 [EditDatasetDialog] Saving dataset updates:", formData);
      const updatedDataset = yield cloudProjectIntegration.updateDataset(dataset.id, {
        name: formData.name,
        description: formData.description,
        visibility: formData.visibility,
        collectionAssignment: formData.collectionAssignment
      });
      if (updatedDataset) {
        console.log("✅ [EditDatasetDialog] Dataset updated successfully");
        onDatasetUpdated == null ? void 0 : onDatasetUpdated(updatedDataset);
        onClose();
      } else {
        setError("Failed to update dataset: No response from server");
      }
    } catch (error2) {
      console.error("❌ [EditDatasetDialog] Failed to update dataset:", error2);
      setError(`Failed to update dataset: ${error2 instanceof Error ? error2.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }), [dataset, formData, validateForm, conflictCheck, onDatasetUpdated, onClose]);
  const handleCollectionChange = reactExports.useCallback((selectedCollections) => {
    var _a2, _b2, _c2;
    updateFormData({
      collectionAssignment: __spreadProps(__spreadValues({}, formData.collectionAssignment), {
        selectedCollections,
        includeSubcollections: ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.includeSubcollections) || false,
        dataFilters: ((_b2 = formData.collectionAssignment) == null ? void 0 : _b2.dataFilters) || [],
        organizationScope: ((_c2 = formData.collectionAssignment) == null ? void 0 : _c2.organizationScope) !== false
      })
    });
  }, [formData.collectionAssignment, updateFormData]);
  const handleCollectionToggle = reactExports.useCallback((collection2) => {
    var _a2;
    const currentSelections = ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) || [];
    const newSelections = currentSelections.includes(collection2) ? currentSelections.filter((c) => c !== collection2) : [...currentSelections, collection2];
    handleCollectionChange(newSelections);
  }, [formData.collectionAssignment, handleCollectionChange]);
  const handleSelectAll = reactExports.useCallback(() => __async(void 0, null, function* () {
    try {
      const { datasetCollectionValidator } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { datasetCollectionValidator: datasetCollectionValidator2 } = yield import("./DatasetCollectionValidator-COtDSV9l.js");
        return { datasetCollectionValidator: datasetCollectionValidator2 };
      }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13]) : void 0);
      const allCollections = yield datasetCollectionValidator.getCollectionRecommendations("ALL_DATA");
      handleCollectionChange(allCollections);
      console.log("✅ [EditDatasetDialog] Selected all collections:", allCollections.length);
    } catch (error2) {
      console.warn("⚠️ [EditDatasetDialog] Failed to get dynamic collections, using static fallback:", error2);
      handleCollectionChange(ALL_DASHBOARD_COLLECTIONS$1);
    }
  }), [handleCollectionChange]);
  const handleDeselectAll = reactExports.useCallback(() => {
    handleCollectionChange([]);
  }, [handleCollectionChange]);
  const handleSelectAllInCategory = reactExports.useCallback((categoryName, categoryCollections) => {
    var _a2;
    const currentSelections = ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) || [];
    const newSelections = [.../* @__PURE__ */ new Set([...currentSelections, ...categoryCollections])];
    handleCollectionChange(newSelections);
  }, [formData.collectionAssignment, handleCollectionChange]);
  const handleDeselectAllInCategory = reactExports.useCallback((categoryName, categoryCollections) => {
    var _a2;
    const currentSelections = ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) || [];
    const newSelections = currentSelections.filter((collection2) => !categoryCollections.includes(collection2));
    handleCollectionChange(newSelections);
  }, [formData.collectionAssignment, handleCollectionChange]);
  if (!dataset) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose,
      maxWidth: "lg",
      fullWidth: true,
      PaperProps: {
        sx: {
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          color: "white",
          borderRadius: 3,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          maxHeight: "90vh"
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: {
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { sx: { color: "#8b5cf6" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Edit Dataset" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Update dataset information and collection assignments" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { sx: { p: 3, overflow: "auto" }, children: [
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3, bgcolor: "rgba(239, 68, 68, 0.1)" }, children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { color: "primary" }),
              "Basic Information"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Dataset Name",
                value: formData.name || "",
                onChange: (e) => updateFormData({ name: e.target.value }),
                error: !!validationErrors.name,
                helperText: validationErrors.name,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" }
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Visibility" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: formData.visibility || "private",
                  onChange: (e) => updateFormData({ visibility: e.target.value }),
                  sx: {
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.5)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8b5cf6" }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "private", children: "Private" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "organization", children: "Organization" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "public", children: "Public" })
                  ]
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                multiline: true,
                rows: 3,
                label: "Description",
                value: formData.description || "",
                onChange: (e) => updateFormData({ description: e.target.value }),
                sx: {
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                    "&.Mui-focused fieldset": { borderColor: "#8b5cf6" }
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }
                }
              }
            ) }),
            ((_c = dataset.storage) == null ? void 0 : _c.backend) === "firestore" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2, borderColor: "rgba(255, 255, 255, 0.1)" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { color: "primary" }),
                  "Collection Assignment"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { color: "white", mb: 2 }, children: "Select Collections by Category" }),
                validationErrors.collections && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2, bgcolor: "rgba(239, 68, 68, 0.1)" }, children: validationErrors.collections }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CollectionSearchFilter,
                  {
                    collections: DASHBOARD_COLLECTIONS_BY_CATEGORY2,
                    allCollections: ALL_DASHBOARD_COLLECTIONS$1,
                    selectedCollections: ((_d = formData.collectionAssignment) == null ? void 0 : _d.selectedCollections) || [],
                    searchQuery: searchState.searchQuery,
                    selectedCategory: searchState.selectedCategory,
                    showSelectedOnly: searchState.showSelectedOnly,
                    onSearchChange: searchActions.setSearchQuery,
                    onCategoryChange: searchActions.setSelectedCategory,
                    onShowSelectedOnlyChange: searchActions.setShowSelectedOnly,
                    onCollectionToggle: handleCollectionToggle,
                    onSelectAll: handleSelectAll,
                    onDeselectAll: handleDeselectAll,
                    onSelectAllInCategory: handleSelectAllInCategory,
                    onDeselectAllInCategory: handleDeselectAllInCategory,
                    onRefresh: refreshCollections,
                    loading: collectionsLoading,
                    error: collectionsError,
                    totalCount: ALL_DASHBOARD_COLLECTIONS$1.length,
                    selectedCount: ((_f = (_e = formData.collectionAssignment) == null ? void 0 : _e.selectedCollections) == null ? void 0 : _f.length) || 0,
                    variant: "dialog",
                    compact: false,
                    layout: "table",
                    expandedCategories,
                    onExpandedCategoriesChange: setExpandedCategories
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormControlLabel,
                {
                  control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: ((_g = formData.collectionAssignment) == null ? void 0 : _g.organizationScope) !== false,
                      onChange: (e) => {
                        var _a2, _b2, _c2;
                        return updateFormData({
                          collectionAssignment: __spreadProps(__spreadValues({}, formData.collectionAssignment), {
                            organizationScope: e.target.checked,
                            selectedCollections: ((_a2 = formData.collectionAssignment) == null ? void 0 : _a2.selectedCollections) || [],
                            includeSubcollections: ((_b2 = formData.collectionAssignment) == null ? void 0 : _b2.includeSubcollections) || false,
                            dataFilters: ((_c2 = formData.collectionAssignment) == null ? void 0 : _c2.dataFilters) || []
                          })
                        });
                      },
                      sx: { color: "#8b5cf6" }
                    }
                  ),
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "white" }, children: "Organization Scoped Data" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "rgba(255, 255, 255, 0.6)" }, children: "Automatically filter data to current organization for multi-tenant isolation" })
                  ] })
                }
              ) }),
              ((_i = (_h = formData.collectionAssignment) == null ? void 0 : _h.selectedCollections) == null ? void 0 : _i.length) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", gutterBottom: true, sx: { display: "flex", alignItems: "center", gap: 1, color: "white" }, children: [
                  "Selected Collections Preview",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: `${formData.collectionAssignment.selectedCollections.length} selected`,
                      size: "small",
                      color: "primary",
                      variant: "outlined"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: {
                  p: 2,
                  bgcolor: "rgba(139, 92, 246, 0.08)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  borderRadius: 2
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center"
                }, children: [
                  formData.collectionAssignment.selectedCollections.map((collection2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, { fontSize: "small" }),
                      label: collection2,
                      variant: "filled",
                      color: "secondary",
                      size: "small",
                      sx: {
                        bgcolor: "rgba(139, 92, 246, 0.12)",
                        color: "#ffffff",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        "& .MuiChip-icon": {
                          color: "#ffffff"
                        },
                        "&:hover": {
                          bgcolor: "rgba(139, 92, 246, 0.16)"
                        }
                      }
                    },
                    collection2
                  )),
                  ((_j = formData.collectionAssignment) == null ? void 0 : _j.organizationScope) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: "Organization Scoped",
                      size: "small",
                      color: "success",
                      variant: "outlined",
                      sx: {
                        ml: 1,
                        fontWeight: 600,
                        bgcolor: "rgba(46, 125, 50, 0.04)"
                      }
                    }
                  )
                ] }) })
              ] }),
              loadingConflictCheck && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: "rgba(255, 255, 255, 0.05)", borderRadius: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Analyzing collection conflicts..." })
              ] }) }),
              conflictCheck && (conflictCheck.warnings.length > 0 || conflictCheck.suggestions.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { bgcolor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", gutterBottom: true, sx: { color: "white", display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { fontSize: "small", color: "warning" }),
                  "Smart Analysis Results"
                ] }),
                conflictCheck.warnings.map((warning, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Alert,
                  {
                    severity: warning.severity,
                    sx: { mb: 1, bgcolor: "rgba(255, 255, 255, 0.05)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: warning.message }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { fontStyle: "italic", display: "block", mt: 0.5 }, children: [
                        "💡 ",
                        warning.recommendation
                      ] })
                    ]
                  },
                  index
                )),
                conflictCheck.suggestions.map((suggestion, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 1, bgcolor: "rgba(79, 70, 229, 0.1)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    suggestion.type.toUpperCase(),
                    ":"
                  ] }),
                  " ",
                  suggestion.message
                ] }) }, index))
              ] }) }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: {
          p: 3,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          justifyContent: "space-between"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: onClose,
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, {}),
              sx: {
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "rgba(255, 255, 255, 0.8)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)"
                }
              },
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleSave,
              variant: "contained",
              startIcon: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, {}),
              disabled: isLoading || (conflictCheck == null ? void 0 : conflictCheck.hasConflicts),
              sx: {
                bgcolor: "#8b5cf6",
                "&:hover": { bgcolor: "#7c3aed" },
                "&:disabled": {
                  bgcolor: "rgba(139, 92, 246, 0.3)",
                  color: "rgba(255, 255, 255, 0.5)"
                }
              },
              children: isLoading ? "Saving..." : "Save Changes"
            }
          )
        ] })
      ]
    }
  );
};
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["ADMIN"] = "ADMIN";
  UserRole2["GUEST"] = "GUEST";
  UserRole2["MANAGER"] = "MANAGER";
  UserRole2["EXEC"] = "EXEC";
  UserRole2["POST_COORDINATOR"] = "POST_COORDINATOR";
  UserRole2["POST_PRODUCTION_SUPERVISOR"] = "POST_PRODUCTION_SUPERVISOR";
  UserRole2["MEDIA_MANAGER"] = "MEDIA_MANAGER";
  UserRole2["PRODUCER"] = "PRODUCER";
  UserRole2["ASSOCIATE_PRODUCER"] = "ASSOCIATE_PRODUCER";
  UserRole2["POST_PRODUCER"] = "POST_PRODUCER";
  UserRole2["LINE_PRODUCER"] = "LINE_PRODUCER";
  UserRole2["KEYNOTE_PRODUCER"] = "KEYNOTE_PRODUCER";
  UserRole2["KEYNOTE_PROD"] = "KEYNOTE_PROD";
  UserRole2["PRODUCTION_ASSISTANT"] = "PRODUCTION_ASSISTANT";
  UserRole2["POST_PA"] = "POST_PA";
  UserRole2["DIRECTOR"] = "DIRECTOR";
  UserRole2["ART_DIRECTOR"] = "ART_DIRECTOR";
  UserRole2["ASSIST_DIRECTOR"] = "ASSIST_DIRECTOR";
  UserRole2["EDITOR"] = "EDITOR";
  UserRole2["ASSISTANT_EDITOR"] = "ASSISTANT_EDITOR";
  UserRole2["CAMERA_OPERATOR"] = "CAMERA_OPERATOR";
  UserRole2["SOUND_ENGINEER"] = "SOUND_ENGINEER";
  UserRole2["LIGHTING_TECHNICIAN"] = "LIGHTING_TECHNICIAN";
  UserRole2["DIT"] = "DIT";
  UserRole2["TECH"] = "TECH";
  UserRole2["NETWORKING"] = "NETWORKING";
  UserRole2["COLORIST"] = "COLORIST";
  UserRole2["AUDIO_PRODUCTION"] = "AUDIO_PRODUCTION";
  UserRole2["AUDIO_POST"] = "AUDIO_POST";
  UserRole2["GFX_ARTIST"] = "GFX_ARTIST";
  UserRole2["KEYNOTE_POST"] = "KEYNOTE_POST";
  UserRole2["QC_SPECIALIST"] = "QC_SPECIALIST";
  return UserRole2;
})(UserRole || {});
const ENHANCED_INDUSTRY_TEMPLATES = {
  // ============================================================================
  // FILM & TELEVISION PRODUCTION (Enhanced with 2024 Standards)
  // ============================================================================
  [
    "FILM_TV"
    /* FILM_TV */
  ]: [
    {
      id: "executive-producer",
      name: "EXECUTIVE_PRODUCER",
      displayName: "Executive Producer",
      description: "Oversees entire production from development to distribution, manages financing and high-level creative decisions",
      industry: "FILM_TV",
      eventTypes: [
        "FEATURE_FILM",
        "TV_SERIES",
        "DOCUMENTARY"
        /* DOCUMENTARY */
      ],
      category: "Executive Leadership",
      hierarchy: 95,
      baseRole: UserRole.EXEC,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true, manage_post_tasks: true, access_media_library: true },
        postProduction: { manage_tasks: true, assign_post_roles: true, approve_final_cuts: true, manage_review_cycles: true, access_color_tools: true, manage_audio_tools: true, export_final_media: true },
        userManagement: { create_users: true, edit_users: true, delete_users: true, manage_roles: true, assign_permissions: true, view_user_activity: true },
        system: { access_settings: true, manage_integrations: true, view_system_logs: true, manage_ai_agents: true },
        reports: { create_reports: true, edit_reports: true, delete_reports: true, access_analytics: true, export_reports: true, manage_templates: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Secure financing and manage budgets",
        "Oversee creative vision and final approval",
        "Manage distribution and marketing strategy",
        "Coordinate with studios and investors",
        "Ensure legal compliance and contracts"
      ],
      requiredSkills: ["Leadership", "Finance", "Negotiation", "Strategic Planning", "Industry Knowledge"],
      reportingStructure: {
        manages: ["Producer", "Line Producer", "Director"]
      },
      tags: ["executive", "finance", "leadership", "strategy", "high-level"],
      isPopular: true,
      usageCount: 450,
      icon: "👑",
      color: "#1a237e",
      salaryRange: { min: 15e4, max: 5e5, currency: "USD" },
      experienceLevel: "Executive"
    },
    {
      id: "showrunner",
      name: "SHOWRUNNER",
      displayName: "Showrunner",
      description: "Head writer and executive producer for TV series, manages creative direction and day-to-day operations",
      industry: "FILM_TV",
      eventTypes: [
        "TV_SERIES"
        /* TV_SERIES */
      ],
      category: "Creative Leadership",
      hierarchy: 90,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true, manage_post_tasks: true, access_media_library: true },
        postProduction: { manage_tasks: true, assign_post_roles: true, approve_final_cuts: true, manage_review_cycles: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Oversee writing room and story development",
        "Manage creative vision for entire series",
        "Coordinate with network executives",
        "Supervise all aspects of production",
        "Ensure continuity across episodes"
      ],
      requiredSkills: ["Writing", "Leadership", "Creative Vision", "Team Management", "Industry Knowledge"],
      reportingStructure: {
        reportsTo: "Executive Producer",
        manages: ["Writer", "Director", "Producer"]
      },
      tags: ["creative", "writing", "tv", "leadership", "storytelling"],
      isPopular: true,
      usageCount: 280,
      icon: "📝",
      color: "#3f51b5",
      salaryRange: { min: 2e5, max: 1e6, currency: "USD" },
      experienceLevel: "Executive"
    },
    {
      id: "cinematographer-dp",
      name: "CINEMATOGRAPHER_DP",
      displayName: "Cinematographer (Director of Photography)",
      description: "Responsible for visual storytelling, camera work, lighting design, and overall visual aesthetic",
      industry: "FILM_TV",
      eventTypes: [
        "FEATURE_FILM",
        "TV_SERIES",
        "COMMERCIAL",
        "MUSIC_VIDEO"
        /* MUSIC_VIDEO */
      ],
      category: "Creative Technical",
      hierarchy: 75,
      baseRole: UserRole.CAMERA_OPERATOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, access_media_library: true },
        postProduction: { access_color_tools: true, manage_review_cycles: true },
        inventory: { create_assets: true, edit_assets: true, manage_checkouts: true, view_asset_reports: true }
      },
      raciLevel: "RESPONSIBLE",
      keyResponsibilities: [
        "Design visual style and cinematography",
        "Manage camera department and equipment",
        "Collaborate with director on visual storytelling",
        "Oversee lighting design and execution",
        "Ensure technical quality of footage"
      ],
      requiredSkills: ["Cinematography", "Lighting", "Camera Operation", "Visual Storytelling", "Technical Expertise"],
      reportingStructure: {
        reportsTo: "Director",
        manages: ["Camera Operator", "Gaffer", "1st AC", "2nd AC"]
      },
      tags: ["cinematography", "visual", "camera", "lighting", "technical"],
      isPopular: true,
      usageCount: 890,
      icon: "📹",
      color: "#795548",
      salaryRange: { min: 8e4, max: 3e5, currency: "USD" },
      experienceLevel: "Senior"
    }
  ],
  // ============================================================================
  // CORPORATE EVENTS & CONFERENCES (Research-Based)
  // ============================================================================
  [
    "CORPORATE_EVENTS"
    /* CORPORATE_EVENTS */
  ]: [
    {
      id: "event-director",
      name: "EVENT_DIRECTOR",
      displayName: "Event Director",
      description: "Oversees all aspects of corporate event planning, execution, and management",
      industry: "CORPORATE_EVENTS",
      eventTypes: [
        "CONFERENCE",
        "TRADE_SHOW",
        "PRODUCT_LAUNCH",
        "CORPORATE_VIDEO"
        /* CORPORATE_VIDEO */
      ],
      category: "Event Leadership",
      hierarchy: 85,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Develop event strategy and objectives",
        "Manage event budget and resources",
        "Coordinate with vendors and stakeholders",
        "Oversee event logistics and execution",
        "Ensure ROI and success metrics"
      ],
      requiredSkills: ["Event Planning", "Project Management", "Budget Management", "Vendor Relations", "Strategic Planning"],
      reportingStructure: {
        manages: ["Event Coordinator", "AV Technician", "Registration Manager"]
      },
      tags: ["events", "corporate", "planning", "management", "strategy"],
      isPopular: true,
      usageCount: 650,
      icon: "🎯",
      color: "#1976d2",
      salaryRange: { min: 7e4, max: 15e4, currency: "USD" },
      experienceLevel: "Senior"
    },
    {
      id: "av-production-manager",
      name: "AV_PRODUCTION_MANAGER",
      displayName: "AV Production Manager",
      description: "Manages all audio-visual aspects of corporate events including streaming, recording, and live production",
      industry: "CORPORATE_EVENTS",
      eventTypes: [
        "CONFERENCE",
        "WEBINAR",
        "VIRTUAL_EVENT",
        "PRODUCT_LAUNCH"
        /* PRODUCT_LAUNCH */
      ],
      category: "Technical Production",
      hierarchy: 70,
      baseRole: UserRole.TECH,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, access_media_library: true },
        postProduction: { manage_tasks: true, access_color_tools: true, manage_audio_tools: true, export_final_media: true },
        inventory: { create_assets: true, edit_assets: true, manage_checkouts: true, manage_ip_addresses: true },
        system: { access_settings: true, manage_integrations: true }
      },
      raciLevel: "RESPONSIBLE",
      keyResponsibilities: [
        "Design and implement AV systems",
        "Manage live streaming and recording",
        "Coordinate technical rehearsals",
        "Troubleshoot technical issues",
        "Ensure broadcast quality standards"
      ],
      requiredSkills: ["AV Technology", "Live Streaming", "Technical Troubleshooting", "Equipment Management", "Broadcast Standards"],
      reportingStructure: {
        reportsTo: "Event Director",
        manages: ["AV Technician", "Camera Operator", "Audio Engineer"]
      },
      tags: ["av", "technical", "streaming", "production", "broadcast"],
      isPopular: true,
      usageCount: 520,
      icon: "🎛️",
      color: "#546e7a",
      salaryRange: { min: 55e3, max: 12e4, currency: "USD" },
      experienceLevel: "Mid"
    }
  ],
  // ============================================================================
  // LIVE EVENTS & CONCERTS (Research-Based)
  // ============================================================================
  [
    "LIVE_EVENTS"
    /* LIVE_EVENTS */
  ]: [
    {
      id: "concert-director",
      name: "CONCERT_DIRECTOR",
      displayName: "Concert Director",
      description: "Oversees creative and technical direction for live concert productions and music events",
      industry: "LIVE_EVENTS",
      eventTypes: [
        "CONCERT",
        "FESTIVAL",
        "AWARDS_SHOW"
        /* AWARDS_SHOW */
      ],
      category: "Live Production",
      hierarchy: 88,
      baseRole: UserRole.DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        automation: { view_all_sessions: true, view_all_alerts: true, manage_automation: true, configure_settings: true },
        system: { access_settings: true, manage_integrations: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Direct live concert performances",
        "Coordinate with artists and management",
        "Oversee stage design and production",
        "Manage live broadcast elements",
        "Ensure audience experience quality"
      ],
      requiredSkills: ["Live Direction", "Music Industry Knowledge", "Stage Production", "Artist Relations", "Broadcast Direction"],
      reportingStructure: {
        manages: ["Stage Manager", "Technical Director", "Lighting Designer"]
      },
      tags: ["concert", "live", "music", "performance", "broadcast"],
      isPopular: true,
      usageCount: 380,
      icon: "🎤",
      color: "#d32f2f",
      salaryRange: { min: 8e4, max: 25e4, currency: "USD" },
      experienceLevel: "Senior"
    },
    {
      id: "festival-producer",
      name: "FESTIVAL_PRODUCER",
      displayName: "Festival Producer",
      description: "Manages multi-day festival productions including logistics, talent coordination, and audience experience",
      industry: "LIVE_EVENTS",
      eventTypes: [
        "FESTIVAL",
        "CONCERT"
        /* CONCERT */
      ],
      category: "Festival Management",
      hierarchy: 82,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Coordinate multiple stages and venues",
        "Manage artist logistics and hospitality",
        "Oversee festival operations and security",
        "Coordinate with local authorities",
        "Ensure festival brand and experience"
      ],
      requiredSkills: ["Festival Management", "Logistics Coordination", "Vendor Management", "Crisis Management", "Entertainment Industry"],
      reportingStructure: {
        manages: ["Stage Producer", "Operations Manager", "Artist Liaison"]
      },
      tags: ["festival", "multi-day", "logistics", "entertainment", "coordination"],
      isPopular: false,
      usageCount: 180,
      icon: "🎪",
      color: "#e91e63",
      salaryRange: { min: 6e4, max: 18e4, currency: "USD" },
      experienceLevel: "Senior"
    }
  ],
  // ============================================================================
  // SPORTS BROADCASTING (Research-Based)
  // ============================================================================
  [
    "SPORTS_BROADCAST"
    /* SPORTS_BROADCAST */
  ]: [
    {
      id: "sports-director",
      name: "SPORTS_DIRECTOR",
      displayName: "Sports Broadcast Director",
      description: "Directs live sports broadcasts, manages camera coverage, and coordinates real-time production decisions",
      industry: "SPORTS_BROADCAST",
      eventTypes: [
        "SPORTS_BROADCAST",
        "SPORTS_EVENT",
        "OLYMPICS"
        /* OLYMPICS */
      ],
      category: "Sports Production",
      hierarchy: 85,
      baseRole: UserRole.DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, delete_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        automation: { view_all_sessions: true, view_all_alerts: true, manage_automation: true, configure_settings: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Direct live sports coverage",
        "Coordinate multiple camera angles",
        "Manage instant replay systems",
        "Work with commentary teams",
        "Ensure broadcast quality and timing"
      ],
      requiredSkills: ["Sports Broadcasting", "Live Direction", "Multi-Camera Production", "Sports Knowledge", "Real-time Decision Making"],
      reportingStructure: {
        manages: ["Camera Operator", "Replay Operator", "Graphics Operator"]
      },
      tags: ["sports", "live", "broadcast", "real-time", "multi-camera"],
      isPopular: true,
      usageCount: 320,
      icon: "🏆",
      color: "#ff5722",
      salaryRange: { min: 7e4, max: 2e5, currency: "USD" },
      experienceLevel: "Senior"
    },
    {
      id: "sports-producer",
      name: "SPORTS_PRODUCER",
      displayName: "Sports Producer",
      description: "Produces sports content including pre-game, live coverage, and post-game analysis",
      industry: "SPORTS_BROADCAST",
      eventTypes: [
        "SPORTS_BROADCAST",
        "SPORTS_EVENT"
        /* SPORTS_EVENT */
      ],
      category: "Sports Production",
      hierarchy: 75,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        postProduction: { manage_tasks: true, approve_final_cuts: true, export_final_media: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: "RESPONSIBLE",
      keyResponsibilities: [
        "Plan sports broadcast content",
        "Coordinate with sports organizations",
        "Manage highlight packages",
        "Oversee graphics and statistics",
        "Coordinate talent and commentary"
      ],
      requiredSkills: ["Sports Production", "Content Planning", "Sports Industry Knowledge", "Broadcast Standards", "Team Coordination"],
      reportingStructure: {
        reportsTo: "Sports Director",
        manages: ["Associate Producer", "Graphics Coordinator", "Statistics Coordinator"]
      },
      tags: ["sports", "production", "content", "highlights", "coordination"],
      isPopular: true,
      usageCount: 420,
      icon: "⚽",
      color: "#4caf50",
      salaryRange: { min: 5e4, max: 15e4, currency: "USD" },
      experienceLevel: "Mid"
    }
  ],
  // ============================================================================
  // GAMING & ESPORTS (Research-Based)
  // ============================================================================
  [
    "GAMING_ESPORTS"
    /* GAMING_ESPORTS */
  ]: [
    {
      id: "esports-director",
      name: "ESPORTS_DIRECTOR",
      displayName: "Esports Tournament Director",
      description: "Oversees esports tournament production, player coordination, and broadcast management",
      industry: "GAMING_ESPORTS",
      eventTypes: [
        "ESPORTS_TOURNAMENT",
        "GAMING_STREAM",
        "GAME_LAUNCH"
        /* GAME_LAUNCH */
      ],
      category: "Esports Production",
      hierarchy: 80,
      baseRole: UserRole.DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        automation: { view_all_sessions: true, manage_automation: true, configure_settings: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Direct esports tournament broadcasts",
        "Coordinate with game developers",
        "Manage player and team logistics",
        "Oversee tournament format and rules",
        "Ensure competitive integrity"
      ],
      requiredSkills: ["Esports Knowledge", "Tournament Management", "Gaming Industry", "Broadcast Production", "Player Relations"],
      reportingStructure: {
        manages: ["Tournament Producer", "Broadcast Producer", "Player Coordinator"]
      },
      tags: ["esports", "gaming", "tournament", "competitive", "broadcast"],
      isPopular: true,
      usageCount: 250,
      icon: "🎮",
      color: "#673ab7",
      salaryRange: { min: 6e4, max: 18e4, currency: "USD" },
      experienceLevel: "Senior"
    },
    {
      id: "stream-producer",
      name: "STREAM_PRODUCER",
      displayName: "Gaming Stream Producer",
      description: "Produces gaming content for streaming platforms, manages creator partnerships, and audience engagement",
      industry: "GAMING_ESPORTS",
      eventTypes: [
        "GAMING_STREAM",
        "LIVE_STREAM"
        /* LIVE_STREAM */
      ],
      category: "Content Production",
      hierarchy: 65,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true },
        automation: { view_all_sessions: true, manage_automation: true },
        reports: { create_reports: true, access_analytics: true }
      },
      raciLevel: "RESPONSIBLE",
      keyResponsibilities: [
        "Produce gaming content for streams",
        "Manage creator relationships",
        "Coordinate sponsored content",
        "Analyze audience engagement",
        "Develop content strategies"
      ],
      requiredSkills: ["Content Production", "Gaming Knowledge", "Streaming Platforms", "Creator Relations", "Audience Analytics"],
      reportingStructure: {
        reportsTo: "Esports Director",
        manages: ["Content Creator", "Community Manager"]
      },
      tags: ["streaming", "content", "gaming", "creators", "engagement"],
      isPopular: false,
      usageCount: 180,
      icon: "📹",
      color: "#9c27b0",
      salaryRange: { min: 4e4, max: 1e5, currency: "USD" },
      experienceLevel: "Mid"
    }
  ],
  // ============================================================================
  // HEALTHCARE PROJECTS (Research-Based)
  // ============================================================================
  [
    "HEALTHCARE"
    /* HEALTHCARE */
  ]: [
    {
      id: "healthcare-project-manager",
      name: "HEALTHCARE_PROJECT_MANAGER",
      displayName: "Healthcare Project Manager",
      description: "Manages healthcare-related projects ensuring compliance with medical regulations and patient care standards",
      industry: "HEALTHCARE",
      eventTypes: [
        "TRAINING_VIDEO",
        "WEBINAR",
        "CONFERENCE"
        /* CONFERENCE */
      ],
      category: "Healthcare Management",
      hierarchy: 75,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Ensure HIPAA compliance in all projects",
        "Manage medical content accuracy",
        "Coordinate with healthcare professionals",
        "Oversee patient safety protocols",
        "Manage regulatory approvals"
      ],
      requiredSkills: ["Healthcare Regulations", "HIPAA Compliance", "Medical Knowledge", "Project Management", "Risk Management"],
      reportingStructure: {
        manages: ["Clinical Coordinator", "Compliance Officer"]
      },
      tags: ["healthcare", "compliance", "medical", "regulations", "safety"],
      isPopular: false,
      usageCount: 120,
      icon: "🏥",
      color: "#4caf50",
      salaryRange: { min: 7e4, max: 16e4, currency: "USD" },
      experienceLevel: "Senior"
    }
  ],
  // ============================================================================
  // IT & TECHNOLOGY (Research-Based)
  // ============================================================================
  [
    "IT_TECHNOLOGY"
    /* IT_TECHNOLOGY */
  ]: [
    {
      id: "it-project-manager",
      name: "IT_PROJECT_MANAGER",
      displayName: "IT Project Manager",
      description: "Manages technology projects including software development, system implementations, and digital transformations",
      industry: "IT_TECHNOLOGY",
      eventTypes: [
        "TRAINING_VIDEO",
        "WEBINAR",
        "PRODUCT_LAUNCH"
        /* PRODUCT_LAUNCH */
      ],
      category: "Technology Management",
      hierarchy: 75,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        system: { access_settings: true, manage_integrations: true, view_system_logs: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Manage software development lifecycles",
        "Coordinate technical teams and resources",
        "Ensure system security and compliance",
        "Oversee technology implementations",
        "Manage stakeholder communications"
      ],
      requiredSkills: ["Project Management", "Software Development", "System Architecture", "Agile Methodologies", "Technical Leadership"],
      reportingStructure: {
        manages: ["Software Developer", "System Administrator", "QA Engineer"]
      },
      tags: ["technology", "software", "development", "systems", "digital"],
      isPopular: true,
      usageCount: 680,
      icon: "💻",
      color: "#2196f3",
      salaryRange: { min: 8e4, max: 18e4, currency: "USD" },
      experienceLevel: "Senior"
    }
  ],
  // ============================================================================
  // MARKETING & ADVERTISING (Research-Based)
  // ============================================================================
  [
    "MARKETING_ADVERTISING"
    /* MARKETING_ADVERTISING */
  ]: [
    {
      id: "creative-director",
      name: "CREATIVE_DIRECTOR",
      displayName: "Creative Director",
      description: "Leads creative vision for marketing campaigns, oversees creative teams, and ensures brand consistency",
      industry: "MARKETING_ADVERTISING",
      eventTypes: [
        "COMMERCIAL",
        "CORPORATE_VIDEO",
        "PRODUCT_LAUNCH"
        /* PRODUCT_LAUNCH */
      ],
      category: "Creative Leadership",
      hierarchy: 85,
      baseRole: UserRole.ART_DIRECTOR,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true, approve_sessions: true },
        postProduction: { manage_tasks: true, approve_final_cuts: true, access_color_tools: true },
        userManagement: { assign_permissions: true, view_user_activity: true },
        reports: { create_reports: true, access_analytics: true, export_reports: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Develop creative concepts and campaigns",
        "Lead creative team and vision",
        "Ensure brand consistency across projects",
        "Present concepts to clients",
        "Oversee creative production process"
      ],
      requiredSkills: ["Creative Leadership", "Brand Strategy", "Design Thinking", "Team Management", "Client Relations"],
      reportingStructure: {
        manages: ["Art Director", "Copywriter", "Designer"]
      },
      tags: ["creative", "marketing", "branding", "campaigns", "leadership"],
      isPopular: true,
      usageCount: 540,
      icon: "🎨",
      color: "#ff9800",
      salaryRange: { min: 9e4, max: 25e4, currency: "USD" },
      experienceLevel: "Senior"
    }
  ],
  // ============================================================================
  // EDUCATION & TRAINING (Research-Based)
  // ============================================================================
  [
    "EDUCATION_TRAINING"
    /* EDUCATION_TRAINING */
  ]: [
    {
      id: "instructional-designer",
      name: "INSTRUCTIONAL_DESIGNER",
      displayName: "Instructional Designer",
      description: "Designs educational content and learning experiences for training videos and e-learning platforms",
      industry: "EDUCATION_TRAINING",
      eventTypes: [
        "TRAINING_VIDEO",
        "WEBINAR",
        "VIRTUAL_EVENT"
        /* VIRTUAL_EVENT */
      ],
      category: "Educational Design",
      hierarchy: 65,
      baseRole: UserRole.PRODUCER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true },
        postProduction: { manage_tasks: true, manage_review_cycles: true },
        reports: { create_reports: true, access_analytics: true }
      },
      raciLevel: "RESPONSIBLE",
      keyResponsibilities: [
        "Design learning objectives and outcomes",
        "Create educational content structure",
        "Develop assessment strategies",
        "Ensure pedagogical best practices",
        "Analyze learning effectiveness"
      ],
      requiredSkills: ["Instructional Design", "Educational Theory", "Content Development", "Learning Analytics", "Curriculum Design"],
      reportingStructure: {
        manages: ["Content Developer", "Educational Technologist"]
      },
      tags: ["education", "learning", "instructional", "content", "pedagogy"],
      isPopular: false,
      usageCount: 220,
      icon: "📚",
      color: "#4caf50",
      salaryRange: { min: 55e3, max: 12e4, currency: "USD" },
      experienceLevel: "Mid"
    }
  ],
  // ============================================================================
  // CONSTRUCTION & ENGINEERING (Research-Based)
  // ============================================================================
  [
    "CONSTRUCTION_ENGINEERING"
    /* CONSTRUCTION_ENGINEERING */
  ]: [
    {
      id: "construction-project-manager",
      name: "CONSTRUCTION_PROJECT_MANAGER",
      displayName: "Construction Project Manager",
      description: "Manages construction and engineering projects including documentation, safety compliance, and progress tracking",
      industry: "CONSTRUCTION_ENGINEERING",
      eventTypes: [
        "TRAINING_VIDEO",
        "CORPORATE_VIDEO",
        "DOCUMENTARY"
        /* DOCUMENTARY */
      ],
      category: "Construction Management",
      hierarchy: 80,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Ensure safety compliance and protocols",
        "Manage construction documentation",
        "Coordinate with engineering teams",
        "Oversee project timelines and budgets",
        "Ensure regulatory compliance"
      ],
      requiredSkills: ["Construction Management", "Safety Regulations", "Engineering Knowledge", "Project Planning", "Risk Management"],
      reportingStructure: {
        manages: ["Site Supervisor", "Safety Coordinator", "Documentation Specialist"]
      },
      tags: ["construction", "engineering", "safety", "compliance", "documentation"],
      isPopular: false,
      usageCount: 95,
      icon: "🏗️",
      color: "#795548",
      salaryRange: { min: 75e3, max: 17e4, currency: "USD" },
      experienceLevel: "Senior"
    }
  ],
  // ============================================================================
  // FINANCE & BANKING (Research-Based)
  // ============================================================================
  [
    "FINANCE_BANKING"
    /* FINANCE_BANKING */
  ]: [
    {
      id: "financial-project-manager",
      name: "FINANCIAL_PROJECT_MANAGER",
      displayName: "Financial Project Manager",
      description: "Manages financial services projects ensuring regulatory compliance and risk management",
      industry: "FINANCE_BANKING",
      eventTypes: [
        "TRAINING_VIDEO",
        "WEBINAR",
        "CORPORATE_VIDEO"
        /* CORPORATE_VIDEO */
      ],
      category: "Financial Management",
      hierarchy: 80,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true, export_reports: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Ensure financial regulatory compliance",
        "Manage risk assessment and mitigation",
        "Oversee financial data security",
        "Coordinate with compliance teams",
        "Manage stakeholder communications"
      ],
      requiredSkills: ["Financial Regulations", "Risk Management", "Compliance", "Financial Analysis", "Project Management"],
      reportingStructure: {
        manages: ["Compliance Analyst", "Risk Analyst", "Financial Analyst"]
      },
      tags: ["finance", "banking", "compliance", "risk", "regulations"],
      isPopular: false,
      usageCount: 85,
      icon: "🏦",
      color: "#4caf50",
      salaryRange: { min: 85e3, max: 2e5, currency: "USD" },
      experienceLevel: "Senior"
    }
  ],
  // ============================================================================
  // GOVERNMENT & PUBLIC SECTOR (Research-Based)
  // ============================================================================
  [
    "GOVERNMENT_PUBLIC"
    /* GOVERNMENT_PUBLIC */
  ]: [
    {
      id: "public-affairs-manager",
      name: "PUBLIC_AFFAIRS_MANAGER",
      displayName: "Public Affairs Manager",
      description: "Manages government and public sector communication projects ensuring transparency and public engagement",
      industry: "GOVERNMENT_PUBLIC",
      eventTypes: [
        "CORPORATE_VIDEO",
        "WEBINAR",
        "CONFERENCE"
        /* CONFERENCE */
      ],
      category: "Public Communications",
      hierarchy: 75,
      baseRole: UserRole.MANAGER,
      permissions: {
        sessions: { create_sessions: true, edit_sessions: true, manage_workflow_steps: true, assign_reviewers: true },
        reports: { create_reports: true, edit_reports: true, access_analytics: true },
        userManagement: { assign_permissions: true, view_user_activity: true }
      },
      raciLevel: "ACCOUNTABLE",
      keyResponsibilities: [
        "Ensure public transparency requirements",
        "Manage government communications",
        "Coordinate with public stakeholders",
        "Ensure accessibility compliance",
        "Manage public information requests"
      ],
      requiredSkills: ["Public Administration", "Government Regulations", "Public Communications", "Transparency Laws", "Stakeholder Management"],
      reportingStructure: {
        manages: ["Communications Specialist", "Public Information Officer"]
      },
      tags: ["government", "public", "transparency", "communications", "civic"],
      isPopular: false,
      usageCount: 65,
      icon: "🏛️",
      color: "#3f51b5",
      salaryRange: { min: 6e4, max: 14e4, currency: "USD" },
      experienceLevel: "Senior"
    }
  ]
};
const getAllEnhancedTemplates = () => {
  return Object.values(ENHANCED_INDUSTRY_TEMPLATES).flat();
};
const getPopularTemplates = () => {
  return getAllEnhancedTemplates().filter((template) => template.isPopular);
};
const searchTemplates = (query2) => {
  const lowercaseQuery = query2.toLowerCase();
  return getAllEnhancedTemplates().filter(
    (template) => template.displayName.toLowerCase().includes(lowercaseQuery) || template.description.toLowerCase().includes(lowercaseQuery) || template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) || template.keyResponsibilities.some((resp) => resp.toLowerCase().includes(lowercaseQuery))
  );
};
const ProjectRoleManagementDialog = ({
  open,
  onClose,
  projectId,
  projectName,
  organizationId
}) => {
  const [viewMode, setViewMode] = reactExports.useState("overview");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [success, setSuccess] = reactExports.useState(null);
  const [roles, setRoles] = reactExports.useState([]);
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [userCreatedRoles, setUserCreatedRoles] = reactExports.useState([]);
  const [templateSearch, setTemplateSearch] = reactExports.useState("");
  const [selectedIndustry, setSelectedIndustry] = reactExports.useState("all");
  const [showPopularOnly, setShowPopularOnly] = reactExports.useState(false);
  const [newRole, setNewRole] = reactExports.useState({
    name: "",
    displayName: "",
    description: "",
    category: "PRODUCTION",
    hierarchy: 50,
    permissions: {}
  });
  reactExports.useEffect(() => {
    if (open) {
      loadProjectRoles();
      loadTeamMembers();
      loadUserCreatedRoles();
    }
  }, [open, projectId]);
  const loadProjectRoles = () => __async(void 0, null, function* () {
    var _a, _b;
    try {
      setLoading(true);
      console.log("🔍 [RoleManagement] Loading project roles for project:", projectId);
      const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
      const currentUser = auth == null ? void 0 : auth.currentUser;
      if (!currentUser) {
        console.log("⚠️ [RoleManagement] No authenticated user");
        setError("Please log in to manage roles");
        return;
      }
      const token = yield currentUser.getIdToken();
      console.log("✅ [RoleManagement] Got auth token for roles");
      const response = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = yield response.json();
        console.log("✅ [RoleManagement] Loaded project roles:", ((_b = data.roles) == null ? void 0 : _b.length) || 0);
        setRoles(data.roles || []);
      } else {
        const errorData = yield response.json().catch(() => ({}));
        console.log("❌ [RoleManagement] Failed to load roles:", response.status, errorData);
        setError(`Failed to load project roles: ${errorData.error || "API Error"}`);
        setRoles([]);
      }
    } catch (err) {
      console.log("❌ [RoleManagement] Error loading roles:", err);
      setError("Failed to load project roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  });
  const loadTeamMembers = () => __async(void 0, null, function* () {
    var _a, _b;
    try {
      setLoading(true);
      console.log("🔍 [RoleManagement] Loading team members for project:", projectId);
      const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
      const currentUser = auth == null ? void 0 : auth.currentUser;
      if (!currentUser) {
        console.log("⚠️ [RoleManagement] No authenticated user");
        setError("Please log in to manage roles");
        return;
      }
      const token = yield currentUser.getIdToken();
      console.log("✅ [RoleManagement] Got auth token for user:", currentUser.email);
      const response = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/team-members`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = yield response.json();
        console.log("✅ [RoleManagement] Loaded team members:", ((_b = data.teamMembers) == null ? void 0 : _b.length) || 0);
        setTeamMembers(data.teamMembers || []);
      } else {
        const errorData = yield response.json().catch(() => ({}));
        console.log("❌ [RoleManagement] Failed to load team members:", response.status, errorData);
        setError(`Failed to load team members: ${errorData.error || "API Error"}`);
        setTeamMembers([]);
      }
    } catch (err) {
      console.log("⚠️ [RoleManagement] Error loading team members:", err);
      setError("Failed to load team members");
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  });
  const loadUserCreatedRoles = () => __async(void 0, null, function* () {
    var _a, _b;
    try {
      console.log("🔍 [RoleManagement] Loading user created roles");
      const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
      const currentUser = auth == null ? void 0 : auth.currentUser;
      if (!currentUser) {
        console.log("⚠️ [RoleManagement] No authenticated user for user roles");
        setUserCreatedRoles([]);
        return;
      }
      const token = yield currentUser.getIdToken();
      const response = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/user/custom-roles`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = yield response.json();
        console.log("✅ [RoleManagement] Loaded user created roles:", ((_b = data.roles) == null ? void 0 : _b.length) || 0);
        setUserCreatedRoles(data.roles || []);
      } else {
        const errorData = yield response.json().catch(() => ({}));
        console.log("❌ [RoleManagement] Failed to load user roles:", response.status, errorData);
        setUserCreatedRoles([]);
      }
    } catch (err) {
      console.log("❌ [RoleManagement] Error loading user roles:", err);
      setUserCreatedRoles([]);
    }
  });
  const handleCreateCustomRole = () => __async(void 0, null, function* () {
    var _a;
    try {
      setLoading(true);
      console.log("🔍 [RoleManagement] Creating custom role:", newRole);
      const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
      const currentUser = auth == null ? void 0 : auth.currentUser;
      if (!currentUser) {
        setError("Please log in to create roles");
        return;
      }
      const token = yield currentUser.getIdToken();
      const response = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRole)
      });
      if (response.ok) {
        const data = yield response.json();
        console.log("✅ [RoleManagement] Role created successfully:", data);
        setSuccess("Role created successfully!");
        setViewMode("overview");
        loadProjectRoles();
        loadUserCreatedRoles();
        setNewRole({
          name: "",
          displayName: "",
          description: "",
          category: "PRODUCTION",
          hierarchy: 50,
          permissions: {}
        });
      } else {
        const errorData = yield response.json().catch(() => ({}));
        console.log("❌ [RoleManagement] Failed to create role:", errorData);
        setError(errorData.error || "Failed to create role");
      }
    } catch (err) {
      console.log("❌ [RoleManagement] Error creating role:", err);
      setError("Failed to create role");
    } finally {
      setLoading(false);
    }
  });
  const handleUseTemplate = (template) => __async(void 0, null, function* () {
    var _a;
    try {
      setLoading(true);
      console.log("🔍 [RoleManagement] Using template:", template.displayName);
      const roleData = {
        name: template.name,
        displayName: template.displayName,
        description: template.description,
        category: template.category,
        hierarchy: template.hierarchy,
        permissions: template.permissions,
        isCustom: false,
        baseRole: template.baseRole
      };
      const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
      const currentUser = auth == null ? void 0 : auth.currentUser;
      if (!currentUser) {
        setError("Please log in to add roles");
        return;
      }
      const token = yield currentUser.getIdToken();
      const response = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(roleData)
      });
      if (response.ok) {
        const data = yield response.json();
        console.log("✅ [RoleManagement] Template role created successfully:", data);
        setSuccess(`Role "${template.displayName}" added to project!`);
        setViewMode("overview");
        loadProjectRoles();
      } else {
        const errorData = yield response.json().catch(() => ({}));
        console.log("❌ [RoleManagement] Failed to create template role:", errorData);
        setError(errorData.error || "Failed to add role from template");
      }
    } catch (err) {
      console.log("❌ [RoleManagement] Error using template:", err);
      setError("Failed to add role from template");
    } finally {
      setLoading(false);
    }
  });
  const handleAssignRole = (memberId, roleId) => __async(void 0, null, function* () {
    var _a;
    try {
      setLoading(true);
      console.log("🔍 [RoleManagement] Assigning role:", { memberId, roleId });
      const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
      const currentUser = auth == null ? void 0 : auth.currentUser;
      if (!currentUser) {
        setError("Please log in to assign roles");
        return;
      }
      const token = yield currentUser.getIdToken();
      const response = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/team-members/${memberId}/role`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ roleId })
      });
      if (response.ok) {
        const data = yield response.json();
        console.log("✅ [RoleManagement] Role assigned successfully:", data);
        setSuccess("Role assigned successfully!");
        loadTeamMembers();
      } else {
        const errorData = yield response.json().catch(() => ({}));
        console.log("❌ [RoleManagement] Failed to assign role:", errorData);
        setError(errorData.error || "Failed to assign role");
      }
    } catch (err) {
      console.log("❌ [RoleManagement] Error assigning role:", err);
      setError("Failed to assign role");
    } finally {
      setLoading(false);
    }
  });
  const handleUseUserCreatedRole = (role) => __async(void 0, null, function* () {
    var _a;
    try {
      setLoading(true);
      console.log("🔍 [RoleManagement] Using user created role:", role.displayName);
      const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
      const currentUser = auth == null ? void 0 : auth.currentUser;
      if (!currentUser) {
        setError("Please log in to add roles");
        return;
      }
      const token = yield currentUser.getIdToken();
      const roleData = {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        category: role.category,
        hierarchy: role.hierarchy,
        permissions: role.permissions,
        isCustom: true,
        baseRole: role.baseRole
      };
      const response = yield fetch(`https://us-central1-backbone-logic.cloudfunctions.net/api/projects/${projectId}/roles`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(roleData)
      });
      if (response.ok) {
        const data = yield response.json();
        console.log("✅ [RoleManagement] User role added successfully:", data);
        setSuccess(`Role "${role.displayName}" added to project!`);
        setViewMode("overview");
        loadProjectRoles();
      } else {
        const errorData = yield response.json().catch(() => ({}));
        console.log("❌ [RoleManagement] Failed to add user role:", errorData);
        setError(errorData.error || "Failed to add role to project");
      }
    } catch (err) {
      console.log("❌ [RoleManagement] Error using user role:", err);
      setError("Failed to add role to project");
    } finally {
      setLoading(false);
    }
  });
  const filteredTemplates = React.useMemo(() => {
    let templates = getAllEnhancedTemplates();
    console.log("🔍 [RoleTemplates] Total templates available:", templates.length);
    console.log("🔍 [RoleTemplates] Selected industry:", selectedIndustry);
    if (showPopularOnly) {
      templates = getPopularTemplates();
      console.log("🔍 [RoleTemplates] Popular templates:", templates.length);
    }
    if (selectedIndustry !== "all") {
      const beforeFilter = templates.length;
      templates = templates.filter((t) => t.industry === selectedIndustry);
      console.log(`🔍 [RoleTemplates] Filtered by industry ${selectedIndustry}: ${beforeFilter} → ${templates.length}`);
      const availableIndustries = getAllEnhancedTemplates().reduce((acc, t) => {
        acc[t.industry] = (acc[t.industry] || 0) + 1;
        return acc;
      }, {});
      console.log("🔍 [RoleTemplates] Available industries:", availableIndustries);
    }
    if (templateSearch.trim()) {
      const searchResults = searchTemplates(templateSearch);
      templates = templates.filter(
        (t) => searchResults.some((sr) => sr.id === t.id)
      );
      console.log("🔍 [RoleTemplates] After search filter:", templates.length);
    }
    return templates;
  }, [templateSearch, selectedIndustry, showPopularOnly]);
  const renderOverview = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            cursor: "pointer",
            border: "2px solid transparent",
            "&:hover": { boxShadow: 4, borderColor: "primary.main" }
          },
          onClick: () => setViewMode("create-custom"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", py: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, { sx: { fontSize: 40, color: "primary.main", mb: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Create Custom Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Define a new role with specific permissions" })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            cursor: "pointer",
            border: "2px solid transparent",
            "&:hover": { boxShadow: 4, borderColor: "secondary.main" }
          },
          onClick: () => setViewMode("browse-templates"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", py: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, { sx: { fontSize: 40, color: "secondary.main", mb: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Use Role Template" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Choose from 70+ pre-defined roles" })
          ] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            cursor: "pointer",
            border: "2px solid transparent",
            "&:hover": { boxShadow: 4, borderColor: "success.main" },
            opacity: userCreatedRoles.length === 0 ? 0.6 : 1
          },
          onClick: () => userCreatedRoles.length > 0 && setViewMode("user-created"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", py: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LightbulbIcon, { sx: { fontSize: 40, color: "success.main", mb: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Your Created Roles" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "Reuse roles you've created (",
              userCreatedRoles.length,
              ")"
            ] })
          ] })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
        "Current Project Roles (",
        roles.length,
        ")"
      ] }),
      roles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 3, textAlign: "center", bgcolor: "grey.50" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No roles defined yet. Create a custom role or use a template to get started." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: roles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { divider: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ListItemText,
          {
            primary: role.displayName,
            secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: role.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1, display: "flex", gap: 1, alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    label: role.category,
                    variant: "outlined"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    label: `Level ${role.hierarchy}`,
                    color: "primary",
                    variant: "outlined"
                  }
                ),
                role.isCustom && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    label: "Custom",
                    color: "secondary",
                    variant: "outlined"
                  }
                )
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItemSecondaryAction, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}) })
        ] })
      ] }, role.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 3 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}),
        "Team Member Assignments (",
        teamMembers.length,
        ")"
      ] }),
      teamMembers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 3, textAlign: "center", bgcolor: "grey.50" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No team members found. Invite members to your project first." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: teamMembers.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { divider: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { sx: { mr: 2 }, children: member.displayName.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ListItemText,
          {
            primary: member.displayName,
            secondary: member.email
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { size: "small", sx: { minWidth: 150 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: member.projectRoleId || "",
              label: "Role",
              onChange: (e) => handleAssignRole(member.id, e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "No Role" }) }),
                roles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: role.id, children: role.displayName }, role.id))
              ]
            }
          )
        ] }) })
      ] }, member.id)) })
    ] })
  ] });
  const renderCreateCustom = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3, display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}),
          onClick: () => setViewMode("overview"),
          variant: "outlined",
          size: "small",
          children: "Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Create Custom Role" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Role Name",
            value: newRole.displayName || "",
            onChange: (e) => setNewRole((prev) => __spreadProps(__spreadValues({}, prev), { displayName: e.target.value })),
            placeholder: "e.g., Senior Editor",
            sx: { mb: 2 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Description",
            multiline: true,
            rows: 3,
            value: newRole.description || "",
            onChange: (e) => setNewRole((prev) => __spreadProps(__spreadValues({}, prev), { description: e.target.value })),
            placeholder: "Describe the role's responsibilities...",
            sx: { mb: 2 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: newRole.category || "PRODUCTION",
              label: "Category",
              onChange: (e) => setNewRole((prev) => __spreadProps(__spreadValues({}, prev), { category: e.target.value })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PRODUCTION", children: "Production" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "POST_PRODUCTION", children: "Post-Production" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ADMINISTRATIVE", children: "Administrative" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CREATIVE", children: "Creative" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "TECHNICAL", children: "Technical" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { gutterBottom: true, children: [
            "Hierarchy Level: ",
            newRole.hierarchy
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Slider,
            {
              value: newRole.hierarchy || 50,
              onChange: (e, value) => setNewRole((prev) => __spreadProps(__spreadValues({}, prev), { hierarchy: value })),
              min: 1,
              max: 100,
              marks: [
                { value: 1, label: "Basic" },
                { value: 50, label: "Standard" },
                { value: 100, label: "Admin" }
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Permissions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, maxHeight: 400, overflow: "auto" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, {}),
              label: "Create & Edit Sessions"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, {}),
              label: "Manage Post-Production"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, {}),
              label: "Access Analytics"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, {}),
              label: "Manage Team"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FormControlLabel,
            {
              control: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, {}),
              label: "Project Settings"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 3, textAlign: "right" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          onClick: () => setViewMode("overview"),
          sx: { mr: 2 },
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          onClick: handleCreateCustomRole,
          disabled: !newRole.displayName || loading,
          children: "Create Role"
        }
      )
    ] })
  ] });
  const renderBrowseTemplates = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3, display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}),
          onClick: () => setViewMode("overview"),
          variant: "outlined",
          size: "small",
          children: "Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Browse Role Templates" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 2, mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, alignItems: "center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          size: "small",
          placeholder: "Search roles...",
          value: templateSearch,
          onChange: (e) => setTemplateSearch(e.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, { sx: { mr: 1, color: "text.secondary" } })
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Industry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: selectedIndustry,
            label: "Industry",
            onChange: (e) => setSelectedIndustry(e.target.value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "all", children: "All Industries" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "FILM_TV", children: "Film & TV" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CORPORATE_EVENTS", children: "Corporate Events" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "LIVE_EVENTS", children: "Live Events" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "SPORTS_BROADCAST", children: "Sports Broadcasting" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "GAMING_ESPORTS", children: "Gaming & Esports" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "HEALTHCARE", children: "Healthcare" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "IT_TECHNOLOGY", children: "IT & Technology" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "MARKETING_ADVERTISING", children: "Marketing & Advertising" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "EDUCATION_TRAINING", children: "Education & Training" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CONSTRUCTION_ENGINEERING", children: "Construction & Engineering" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "FINANCE_BANKING", children: "Finance & Banking" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "GOVERNMENT_PUBLIC", children: "Government & Public" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormControlLabel,
        {
          control: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: showPopularOnly,
              onChange: (e) => setShowPopularOnly(e.target.checked)
            }
          ),
          label: "Popular Only"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
        filteredTemplates.length,
        " roles"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: filteredTemplates.map((template) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: { height: "100%", display: "flex", flexDirection: "column" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { flexGrow: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", component: "div", noWrap: true, children: template.name }),
          template.isPopular && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Popular", color: "primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: template.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: template.industry, variant: "outlined" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: `Level ${template.hierarchy}`, variant: "outlined" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: template.experienceLevel, variant: "outlined" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
          "Used ",
          template.usageCount || 0,
          " times"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, pt: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          fullWidth: true,
          variant: "contained",
          size: "small",
          onClick: () => handleUseTemplate(template),
          disabled: loading,
          children: "Add to Project"
        }
      ) })
    ] }) }, template.id)) }),
    filteredTemplates.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 4, textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "No templates found matching your criteria." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          onClick: () => {
            setTemplateSearch("");
            setSelectedIndustry("all");
            setShowPopularOnly(false);
          },
          sx: { mt: 2 },
          children: "Clear Filters"
        }
      )
    ] })
  ] });
  const renderUserCreatedRoles = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3, display: "flex", alignItems: "center", gap: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}),
          onClick: () => setViewMode("overview"),
          variant: "outlined",
          size: "small",
          children: "Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Your Created Roles" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: userCreatedRoles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: { height: "100%", display: "flex", flexDirection: "column" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { flexGrow: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", component: "div", noWrap: true, children: role.displayName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: "Custom", color: "success" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: role.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: role.category, variant: "outlined" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: `Level ${role.hierarchy}`, variant: "outlined" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, pt: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          fullWidth: true,
          variant: "contained",
          size: "small",
          onClick: () => handleUseUserCreatedRole(role),
          disabled: loading,
          children: "Add to Project"
        }
      ) })
    ] }) }, role.id)) }),
    userCreatedRoles.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 4, textAlign: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "You haven't created any custom roles yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          onClick: () => setViewMode("create-custom"),
          sx: { mt: 2 },
          children: "Create Your First Role"
        }
      )
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose,
      maxWidth: "lg",
      fullWidth: true,
      PaperProps: {
        sx: { minHeight: "70vh" }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Security, {}),
          "Role Management - ",
          projectName
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error }),
          success && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccess(null), children: success }),
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }),
          viewMode === "overview" && renderOverview(),
          viewMode === "create-custom" && renderCreateCustom(),
          viewMode === "browse-templates" && renderBrowseTemplates(),
          viewMode === "user-created" && renderUserCreatedRoles()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, children: "Close" }) })
      ]
    }
  );
};
const DASHBOARD_ROLE_HIERARCHY = {
  // Administrative & Executive
  [
    "ADMIN"
    /* ADMIN */
  ]: 100,
  [
    "GUEST"
    /* GUEST */
  ]: 10,
  [
    "EXEC"
    /* EXEC */
  ]: 95,
  // Management Roles
  [
    "ACCOUNT_MANAGER"
    /* ACCOUNT_MANAGER */
  ]: 75,
  [
    "PROJECT_MANAGER"
    /* PROJECT_MANAGER */
  ]: 70,
  [
    "PRODUCTION_MANAGER"
    /* PRODUCTION_MANAGER */
  ]: 65,
  [
    "MANAGER"
    /* MANAGER */
  ]: 60,
  // Business & Analysis
  [
    "BUSINESS_ANALYST"
    /* BUSINESS_ANALYST */
  ]: 55,
  // Technical & Engineering
  [
    "DEVOPS_ENGINEER"
    /* DEVOPS_ENGINEER */
  ]: 50,
  [
    "NETWORK_ENGINEER"
    /* NETWORK_ENGINEER */
  ]: 45,
  [
    "SOUND_ENGINEER"
    /* SOUND_ENGINEER */
  ]: 40,
  [
    "LIGHTING_TECHNICIAN"
    /* LIGHTING_TECHNICIAN */
  ]: 35,
  [
    "DIT"
    /* DIT */
  ]: 35,
  [
    "TECH"
    /* TECH */
  ]: 30,
  [
    "NETWORKING"
    /* NETWORKING */
  ]: 30,
  // Creative & Artistic
  [
    "ART_DIRECTOR"
    /* ART_DIRECTOR */
  ]: 60,
  [
    "VFX_ARTIST"
    /* VFX_ARTIST */
  ]: 40,
  [
    "MOTION_GRAPHICS_ARTIST"
    /* MOTION_GRAPHICS_ARTIST */
  ]: 40,
  [
    "GFX_ARTIST"
    /* GFX_ARTIST */
  ]: 35,
  [
    "COLORIST"
    /* COLORIST */
  ]: 35,
  [
    "DIRECTOR"
    /* DIRECTOR */
  ]: 65,
  [
    "ASSIST_DIRECTOR"
    /* ASSIST_DIRECTOR */
  ]: 30,
  // Production Roles
  [
    "PRODUCER"
    /* PRODUCER */
  ]: 55,
  [
    "ASSOCIATE_PRODUCER"
    /* ASSOCIATE_PRODUCER */
  ]: 45,
  [
    "POST_PRODUCER"
    /* POST_PRODUCER */
  ]: 50,
  [
    "LINE_PRODUCER"
    /* LINE_PRODUCER */
  ]: 50,
  [
    "KEYNOTE_PRODUCER"
    /* KEYNOTE_PRODUCER */
  ]: 45,
  [
    "KEYNOTE_PROD"
    /* KEYNOTE_PROD */
  ]: 40,
  [
    "PRODUCTION_ASSISTANT"
    /* PRODUCTION_ASSISTANT */
  ]: 25,
  [
    "POST_PA"
    /* POST_PA */
  ]: 25,
  // Editorial & Post Production
  [
    "EDITOR"
    /* EDITOR */
  ]: 45,
  [
    "ASSISTANT_EDITOR"
    /* ASSISTANT_EDITOR */
  ]: 30,
  [
    "POST_COORDINATOR"
    /* POST_COORDINATOR */
  ]: 50,
  [
    "POST_PRODUCTION_SUPERVISOR"
    /* POST_PRODUCTION_SUPERVISOR */
  ]: 55,
  [
    "KEYNOTE_POST"
    /* KEYNOTE_POST */
  ]: 40,
  // Audio & Media
  [
    "AUDIO_PRODUCTION"
    /* AUDIO_PRODUCTION */
  ]: 40,
  [
    "AUDIO_POST"
    /* AUDIO_POST */
  ]: 35,
  [
    "MEDIA_MANAGER"
    /* MEDIA_MANAGER */
  ]: 50,
  // Technical Production
  [
    "CAMERA_OPERATOR"
    /* CAMERA_OPERATOR */
  ]: 35,
  [
    "QC_SPECIALIST"
    /* QC_SPECIALIST */
  ]: 30
};
const _EnhancedRoleBridgeService = class _EnhancedRoleBridgeService {
  constructor() {
    __publicField(this, "roleMappingCache", /* @__PURE__ */ new Map());
  }
  static getInstance() {
    if (!_EnhancedRoleBridgeService.instance) {
      _EnhancedRoleBridgeService.instance = new _EnhancedRoleBridgeService();
    }
    return _EnhancedRoleBridgeService.instance;
  }
  /**
   * Map licensing website role to Dashboard UserRole
   */
  mapLicensingRoleToDashboard(licensingRole, templateRole, organizationTier = "PRO") {
    console.log(`🔄 [RoleBridge] Mapping licensing role: ${licensingRole}${templateRole ? ` with template: ${templateRole.displayName}` : ""}`);
    const cacheKey = `${licensingRole}-${(templateRole == null ? void 0 : templateRole.id) || "basic"}-${organizationTier}`;
    if (this.roleMappingCache.has(cacheKey)) {
      return this.roleMappingCache.get(cacheKey);
    }
    let dashboardRole;
    let effectiveHierarchy;
    let isCustomMapping = false;
    if (templateRole) {
      const mappingResult = this.mapTemplateRoleToDashboard(templateRole, licensingRole);
      dashboardRole = mappingResult.dashboardRole;
      effectiveHierarchy = mappingResult.effectiveHierarchy;
      isCustomMapping = mappingResult.isCustomMapping;
    } else {
      const basicMapping = this.mapBasicLicensingRole(licensingRole);
      dashboardRole = basicMapping.dashboardRole;
      effectiveHierarchy = basicMapping.effectiveHierarchy;
    }
    effectiveHierarchy = this.applyTierRestrictions(effectiveHierarchy, organizationTier);
    const permissions = this.generateRolePermissions(dashboardRole, effectiveHierarchy, organizationTier);
    const mapping = {
      licensingRole,
      templateRole,
      dashboardRole,
      effectiveHierarchy,
      permissions,
      isCustomMapping
    };
    this.roleMappingCache.set(cacheKey, mapping);
    console.log(`✅ [RoleBridge] Mapped to Dashboard role: ${dashboardRole} (hierarchy: ${effectiveHierarchy})`);
    return mapping;
  }
  /**
   * Map template role to Dashboard UserRole using intelligent matching
   */
  mapTemplateRoleToDashboard(templateRole, licensingRole) {
    const templateName = templateRole.name.toUpperCase();
    templateRole.displayName.toUpperCase();
    for (const [dashboardRole, hierarchy] of Object.entries(DASHBOARD_ROLE_HIERARCHY)) {
      if (templateName.includes(dashboardRole) || dashboardRole.includes(templateName)) {
        return {
          dashboardRole,
          effectiveHierarchy: Math.max(templateRole.hierarchy, hierarchy),
          isCustomMapping: false
        };
      }
    }
    const semanticMapping = this.getSemanticRoleMapping(templateRole, licensingRole);
    if (semanticMapping) {
      return semanticMapping;
    }
    return this.getHierarchyBasedMapping(templateRole, licensingRole);
  }
  /**
   * Semantic role mapping based on role characteristics
   */
  getSemanticRoleMapping(templateRole, licensingRole) {
    const name = templateRole.displayName.toLowerCase();
    templateRole.keyResponsibilities.join(" ").toLowerCase();
    const hierarchy = templateRole.hierarchy;
    if (hierarchy >= 80 || name.includes("manager") || name.includes("supervisor") || name.includes("director")) {
      if (hierarchy >= 90) return { dashboardRole: "EXEC", effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes("post") || name.includes("production")) return { dashboardRole: "POST_PRODUCTION_SUPERVISOR", effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: "MANAGER", effectiveHierarchy: hierarchy, isCustomMapping: true };
    }
    if (name.includes("director") && !name.includes("assistant")) {
      return { dashboardRole: "DIRECTOR", effectiveHierarchy: hierarchy, isCustomMapping: true };
    }
    if (name.includes("editor")) {
      if (name.includes("assistant")) return { dashboardRole: "ASSISTANT_EDITOR", effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: "EDITOR", effectiveHierarchy: hierarchy, isCustomMapping: true };
    }
    if (name.includes("producer")) {
      if (name.includes("associate")) return { dashboardRole: "ASSOCIATE_PRODUCER", effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes("line")) return { dashboardRole: "LINE_PRODUCER", effectiveHierarchy: hierarchy, isCustomMapping: true };
      if (name.includes("post")) return { dashboardRole: "POST_PRODUCER", effectiveHierarchy: hierarchy, isCustomMapping: true };
      return { dashboardRole: "PRODUCER", effectiveHierarchy: hierarchy, isCustomMapping: true };
    }
    if (name.includes("camera")) return { dashboardRole: "CAMERA_OPERATOR", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes("sound") || name.includes("audio")) return { dashboardRole: "SOUND_ENGINEER", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes("lighting")) return { dashboardRole: "LIGHTING_TECHNICIAN", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes("color")) return { dashboardRole: "COLORIST", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes("graphics") || name.includes("gfx")) return { dashboardRole: "GFX_ARTIST", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes("qc") || name.includes("quality")) return { dashboardRole: "QC_SPECIALIST", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (name.includes("assistant") || name.includes("support") || hierarchy <= 20) {
      return { dashboardRole: "PRODUCTION_ASSISTANT", effectiveHierarchy: hierarchy, isCustomMapping: true };
    }
    return null;
  }
  /**
   * Hierarchy-based mapping fallback
   */
  getHierarchyBasedMapping(templateRole, licensingRole) {
    const hierarchy = templateRole.hierarchy;
    if (hierarchy >= 90) return { dashboardRole: "EXEC", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 80) return { dashboardRole: "MANAGER", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 60) return { dashboardRole: "PRODUCER", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 40) return { dashboardRole: "EDITOR", effectiveHierarchy: hierarchy, isCustomMapping: true };
    if (hierarchy >= 20) return { dashboardRole: "PRODUCTION_ASSISTANT", effectiveHierarchy: hierarchy, isCustomMapping: true };
    return { dashboardRole: "GUEST", effectiveHierarchy: hierarchy, isCustomMapping: true };
  }
  /**
   * Map basic licensing roles to Dashboard roles
   */
  mapBasicLicensingRole(licensingRole) {
    switch (licensingRole) {
      case TeamMemberRole.ADMIN:
        return { dashboardRole: "ADMIN", effectiveHierarchy: 100 };
      case TeamMemberRole.MEMBER:
        return { dashboardRole: "PRODUCER", effectiveHierarchy: 60 };
      default:
        return { dashboardRole: "GUEST", effectiveHierarchy: 10 };
    }
  }
  /**
   * Apply tier-based restrictions to hierarchy
   */
  applyTierRestrictions(hierarchy, tier) {
    switch (tier) {
      case "BASIC":
        return Math.min(hierarchy, 40);
      case "PRO":
        return Math.min(hierarchy, 80);
      case "ENTERPRISE":
        return hierarchy;
      default:
        return Math.min(hierarchy, 40);
    }
  }
  /**
   * Generate role permissions based on Dashboard role and hierarchy
   */
  generateRolePermissions(dashboardRole, hierarchy, tier) {
    const basePermissions = {
      canManageTeam: hierarchy >= 80,
      canManageProjects: hierarchy >= 60,
      canViewFinancials: hierarchy >= 70 && (tier === "PRO" || tier === "ENTERPRISE"),
      canEditContent: hierarchy >= 25,
      canApproveContent: hierarchy >= 40,
      canAccessReports: hierarchy >= 30,
      canManageSettings: hierarchy >= 90,
      hierarchyLevel: hierarchy
    };
    if (tier === "BASIC") {
      basePermissions.canViewFinancials = false;
      basePermissions.canManageSettings = false;
    }
    return basePermissions;
  }
  /**
   * Get available Dashboard roles for a licensing role and tier
   */
  getAvailableDashboardRoles(licensingRole, tier) {
    const maxHierarchy = this.applyTierRestrictions(100, tier);
    return Object.entries(DASHBOARD_ROLE_HIERARCHY).filter(([_, hierarchy]) => hierarchy <= maxHierarchy).map(([role, _]) => role);
  }
  /**
   * Validate role assignment compatibility
   */
  validateRoleAssignment(licensingRole, dashboardRole, tier) {
    const dashboardHierarchy = DASHBOARD_ROLE_HIERARCHY[dashboardRole];
    const maxAllowedHierarchy = this.applyTierRestrictions(100, tier);
    if (dashboardHierarchy > maxAllowedHierarchy) {
      return {
        isValid: false,
        reason: `Role ${dashboardRole} (hierarchy ${dashboardHierarchy}) exceeds maximum allowed for ${tier} tier (${maxAllowedHierarchy})`
      };
    }
    return { isValid: true };
  }
  /**
   * Clear role mapping cache
   */
  clearCache() {
    this.roleMappingCache.clear();
    console.log("🧹 [RoleBridge] Role mapping cache cleared");
  }
};
__publicField(_EnhancedRoleBridgeService, "instance");
let EnhancedRoleBridgeService = _EnhancedRoleBridgeService;
const _CrossAppRoleSyncService = class _CrossAppRoleSyncService {
  constructor() {
    __publicField(this, "roleBridgeService");
    __publicField(this, "syncListeners", /* @__PURE__ */ new Map());
    __publicField(this, "syncQueue", []);
    __publicField(this, "isProcessingQueue", false);
    __publicField(this, "config", {
      enableRealTimeSync: true,
      // Enabled now that collections are extended
      enableBidirectionalSync: true,
      conflictResolution: "hierarchy-based",
      batchSize: 10,
      retryAttempts: 3,
      syncTimeout: 3e4
    });
    this.roleBridgeService = EnhancedRoleBridgeService.getInstance();
    this.initializeSyncListeners();
  }
  static getInstance() {
    if (!_CrossAppRoleSyncService.instance) {
      _CrossAppRoleSyncService.instance = new _CrossAppRoleSyncService();
    }
    return _CrossAppRoleSyncService.instance;
  }
  /**
   * Initialize real-time sync listeners
   */
  initializeSyncListeners() {
    if (!this.config.enableRealTimeSync) return;
    console.log("🔄 [CrossAppSync] Initializing real-time sync listeners");
    const syncEventsRef = collection(db, "roleSyncEvents");
    const unsubscribe = onSnapshot(syncEventsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const syncEvent = __spreadValues({ id: change.doc.id }, change.doc.data());
          this.handleIncomingSyncEvent(syncEvent);
        }
      });
    });
    this.syncListeners.set("roleSyncEvents", unsubscribe);
  }
  /**
   * Sync role assignment from licensing website to Dashboard
   */
  syncRoleToLicensing(userId, projectId, organizationId, licensingRole, templateRole, assignedBy) {
    return __async(this, null, function* () {
      if (!this.config.enableRealTimeSync) {
        console.log(`⏸️ [CrossAppSync] Sync disabled, skipping role sync for: ${userId}`);
        return;
      }
      console.log(`🔄 [CrossAppSync] Syncing role to licensing: ${userId} -> ${licensingRole}`);
      try {
        const roleMapping = this.roleBridgeService.mapLicensingRoleToDashboard(
          licensingRole,
          templateRole,
          "PRO"
          // Could be dynamic based on organization tier
        );
        const syncEvent = {
          type: "ROLE_ASSIGNED",
          sourceApp: "licensing",
          targetApp: "dashboard",
          timestamp: /* @__PURE__ */ new Date(),
          userId,
          projectId,
          organizationId,
          data: {
            licensingRole,
            templateRole,
            dashboardRole: roleMapping.dashboardRole,
            hierarchy: roleMapping.effectiveHierarchy,
            permissions: roleMapping.permissions,
            roleMapping,
            assignedBy,
            reason: "Role assigned via licensing website wizard"
          },
          status: "pending"
        };
        yield this.addToSyncQueue(syncEvent);
        yield this.updateUserRoleMapping(userId, projectId, roleMapping);
        console.log(`✅ [CrossAppSync] Role sync initiated for user: ${userId}`);
      } catch (error) {
        console.error("❌ [CrossAppSync] Error syncing role to licensing:", error);
        throw error;
      }
    });
  }
  /**
   * Sync role assignment from Dashboard to licensing website
   */
  syncRoleFromDashboard(userId, projectId, organizationId, dashboardRole, hierarchy, assignedBy) {
    return __async(this, null, function* () {
      if (!this.config.enableRealTimeSync) {
        console.log(`⏸️ [CrossAppSync] Sync disabled, skipping Dashboard role sync for: ${userId}`);
        return;
      }
      console.log(`🔄 [CrossAppSync] Syncing role from Dashboard: ${userId} -> ${dashboardRole}`);
      try {
        const syncEvent = {
          type: "ROLE_ASSIGNED",
          sourceApp: "dashboard",
          targetApp: "licensing",
          timestamp: /* @__PURE__ */ new Date(),
          userId,
          projectId,
          organizationId,
          data: {
            dashboardRole,
            hierarchy,
            assignedBy,
            reason: "Role assigned via Dashboard application"
          },
          status: "pending"
        };
        yield this.addToSyncQueue(syncEvent);
        console.log(`✅ [CrossAppSync] Dashboard role sync initiated for user: ${userId}`);
      } catch (error) {
        console.error("❌ [CrossAppSync] Error syncing role from Dashboard:", error);
        throw error;
      }
    });
  }
  /**
   * Add sync event to queue
   */
  addToSyncQueue(syncEvent) {
    return __async(this, null, function* () {
      try {
        const docRef = yield addDoc(collection(db, "roleSyncEvents"), __spreadProps(__spreadValues({}, syncEvent), {
          timestamp: Timestamp.fromDate(syncEvent.timestamp)
        }));
        syncEvent.id = docRef.id;
        this.syncQueue.push(syncEvent);
        if (!this.isProcessingQueue) {
          this.processSyncQueue();
        }
      } catch (error) {
        console.error("❌ [CrossAppSync] Error adding to sync queue:", error);
        throw error;
      }
    });
  }
  /**
   * Process sync queue
   */
  processSyncQueue() {
    return __async(this, null, function* () {
      if (this.isProcessingQueue || this.syncQueue.length === 0) return;
      this.isProcessingQueue = true;
      console.log(`🔄 [CrossAppSync] Processing sync queue: ${this.syncQueue.length} events`);
      try {
        while (this.syncQueue.length > 0) {
          const batch = this.syncQueue.splice(0, this.config.batchSize);
          yield Promise.all(batch.map((event) => this.processSyncEvent(event)));
        }
      } catch (error) {
        console.error("❌ [CrossAppSync] Error processing sync queue:", error);
      } finally {
        this.isProcessingQueue = false;
      }
    });
  }
  /**
   * Process individual sync event
   */
  processSyncEvent(syncEvent) {
    return __async(this, null, function* () {
      console.log(`🔄 [CrossAppSync] Processing sync event: ${syncEvent.type} for user ${syncEvent.userId}`);
      try {
        yield this.updateSyncEventStatus(syncEvent.id, "processing");
        switch (syncEvent.type) {
          case "ROLE_ASSIGNED":
            yield this.processRoleAssignment(syncEvent);
            break;
          case "ROLE_UPDATED":
            yield this.processRoleUpdate(syncEvent);
            break;
          case "ROLE_REMOVED":
            yield this.processRoleRemoval(syncEvent);
            break;
          case "HIERARCHY_CHANGED":
            yield this.processHierarchyChange(syncEvent);
            break;
          case "PERMISSIONS_UPDATED":
            yield this.processPermissionsUpdate(syncEvent);
            break;
        }
        yield this.updateSyncEventStatus(syncEvent.id, "completed");
        console.log(`✅ [CrossAppSync] Sync event completed: ${syncEvent.id}`);
      } catch (error) {
        console.error(`❌ [CrossAppSync] Error processing sync event ${syncEvent.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        yield this.updateSyncEventStatus(syncEvent.id, "failed", errorMessage);
      }
    });
  }
  /**
   * Process role assignment sync
   */
  processRoleAssignment(syncEvent) {
    return __async(this, null, function* () {
      const { userId, projectId, data } = syncEvent;
      if (syncEvent.targetApp === "dashboard") {
        yield this.syncToDashboardApp(userId, projectId, data.roleMapping);
      } else if (syncEvent.targetApp === "licensing") {
        yield this.syncToLicensingApp(userId, projectId, data.dashboardRole, data.hierarchy);
      }
    });
  }
  /**
   * Sync role to Dashboard application (using existing collections)
   */
  syncToDashboardApp(userId, projectId, roleMapping) {
    return __async(this, null, function* () {
      var _a;
      console.log(`🎯 [CrossAppSync] Syncing to existing collections: ${userId} -> ${roleMapping.dashboardRole}`);
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = yield getDoc(userRef);
        const dashboardRoleData = {
          [projectId]: {
            dashboardRole: roleMapping.dashboardRole,
            hierarchy: roleMapping.effectiveHierarchy,
            permissions: roleMapping.permissions,
            licensingRole: roleMapping.licensingRole,
            templateRole: ((_a = roleMapping.templateRole) == null ? void 0 : _a.id) || null,
            syncedAt: Timestamp.now(),
            syncSource: "licensing"
          }
        };
        if (userDoc.exists()) {
          yield updateDoc(userRef, {
            [`dashboardRoleMappings.${projectId}`]: dashboardRoleData[projectId],
            lastRoleSync: Timestamp.now(),
            roleSystemVersion: "2.0"
          });
          console.log(`✅ [CrossAppSync] Updated user Dashboard role mapping: ${userId}`);
        } else {
          console.warn(`⚠️ [CrossAppSync] User document not found: ${userId}`);
          return;
        }
        const assignmentQuery = query(
          collection(db, "projectAssignments"),
          where("projectId", "==", projectId),
          where("userId", "==", userId),
          where("isActive", "==", true)
        );
        const assignmentSnapshot = yield getDocs(assignmentQuery);
        if (!assignmentSnapshot.empty) {
          const assignmentDoc = assignmentSnapshot.docs[0];
          yield updateDoc(assignmentDoc.ref, {
            dashboardRole: roleMapping.dashboardRole,
            hierarchyLevel: roleMapping.effectiveHierarchy,
            enhancedPermissions: roleMapping.permissions,
            syncMetadata: {
              lastSyncedAt: Timestamp.now(),
              syncSource: "licensing",
              syncVersion: "2.0"
            }
          });
          console.log(`✅ [CrossAppSync] Updated project assignment with Dashboard role: ${userId}`);
        } else {
          console.warn(`⚠️ [CrossAppSync] No active project assignment found for user ${userId} in project ${projectId}`);
        }
      } catch (error) {
        console.error(`❌ [CrossAppSync] Error syncing to existing collections for user ${userId}:`, error);
        throw error;
      }
    });
  }
  /**
   * Sync role to licensing application
   */
  syncToLicensingApp(userId, projectId, dashboardRole, hierarchy) {
    return __async(this, null, function* () {
      console.log(`🎯 [CrossAppSync] Syncing to Licensing: ${userId} -> ${dashboardRole}`);
      const assignmentRef = doc(db, "projectAssignments", `${projectId}-${userId}`);
      yield updateDoc(assignmentRef, {
        dashboardRole,
        hierarchy,
        syncedAt: Timestamp.now(),
        syncSource: "dashboard"
      });
    });
  }
  /**
   * Handle incoming sync event from other instances
   */
  handleIncomingSyncEvent(syncEvent) {
    return __async(this, null, function* () {
      if (syncEvent.status === "pending") {
        this.syncQueue.push(syncEvent);
        if (!this.isProcessingQueue) {
          this.processSyncQueue();
        }
      }
    });
  }
  /**
   * Update user role mapping
   */
  updateUserRoleMapping(userId, projectId, roleMapping) {
    return __async(this, null, function* () {
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = yield getDoc(userRef);
        const mappingData = __spreadProps(__spreadValues({}, roleMapping), {
          updatedAt: Timestamp.now()
        });
        if (userDoc.exists()) {
          yield updateDoc(userRef, {
            [`roleMappings.${projectId}`]: mappingData
          });
          console.log(`✅ [CrossAppSync] Updated role mapping for user: ${userId}`);
        } else {
          yield setDoc(userRef, {
            id: userId,
            roleMappings: {
              [projectId]: mappingData
            },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          console.log(`✅ [CrossAppSync] Created user with role mapping: ${userId}`);
        }
      } catch (error) {
        console.error(`❌ [CrossAppSync] Error updating role mapping for user ${userId}:`, error);
      }
    });
  }
  /**
   * Update sync event status
   */
  updateSyncEventStatus(eventId, status, error) {
    return __async(this, null, function* () {
      const eventRef = doc(db, "roleSyncEvents", eventId);
      const updateData = {
        status,
        updatedAt: Timestamp.now()
      };
      if (error) {
        updateData.error = error;
      }
      yield updateDoc(eventRef, updateData);
    });
  }
  /**
   * Process role update (placeholder)
   */
  processRoleUpdate(syncEvent) {
    return __async(this, null, function* () {
      console.log("🔄 [CrossAppSync] Processing role update:", syncEvent.id);
    });
  }
  /**
   * Process role removal (placeholder)
   */
  processRoleRemoval(syncEvent) {
    return __async(this, null, function* () {
      console.log("🔄 [CrossAppSync] Processing role removal:", syncEvent.id);
    });
  }
  /**
   * Process hierarchy change (placeholder)
   */
  processHierarchyChange(syncEvent) {
    return __async(this, null, function* () {
      console.log("🔄 [CrossAppSync] Processing hierarchy change:", syncEvent.id);
    });
  }
  /**
   * Process permissions update (placeholder)
   */
  processPermissionsUpdate(syncEvent) {
    return __async(this, null, function* () {
      console.log("🔄 [CrossAppSync] Processing permissions update:", syncEvent.id);
    });
  }
  /**
   * Configure sync settings
   */
  configureSyncSettings(config) {
    this.config = __spreadValues(__spreadValues({}, this.config), config);
    console.log("⚙️ [CrossAppSync] Sync configuration updated:", this.config);
    if (config.enableRealTimeSync && !this.syncListeners.has("roleSyncEvents")) {
      this.initializeSyncListeners();
    }
  }
  /**
   * Enable cross-app synchronization
   */
  enableSync() {
    this.configureSyncSettings({ enableRealTimeSync: true });
    console.log("✅ [CrossAppSync] Cross-app synchronization enabled");
  }
  /**
   * Disable cross-app synchronization
   */
  disableSync() {
    this.configureSyncSettings({ enableRealTimeSync: false });
    console.log("⏸️ [CrossAppSync] Cross-app synchronization disabled");
  }
  /**
   * Get sync status for a user/project
   */
  getSyncStatus(userId, projectId) {
    return __async(this, null, function* () {
      return [];
    });
  }
  /**
   * Cleanup sync listeners
   */
  cleanup() {
    this.syncListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.syncListeners.clear();
    console.log("🧹 [CrossAppSync] Sync listeners cleaned up");
  }
};
__publicField(_CrossAppRoleSyncService, "instance");
let CrossAppRoleSyncService = _CrossAppRoleSyncService;
const STEPS = [
  "Choose Action",
  "Select Members",
  "Assign Roles",
  "Review & Confirm"
];
const TeamRoleWizard = ({
  open,
  onClose,
  projectId,
  projectName,
  organizationId,
  onTeamMembersUpdated,
  existingProjectTeamMembers
}) => {
  const [activeStep, setActiveStep] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [success, setSuccess] = reactExports.useState(null);
  const [selectedAction, setSelectedAction] = reactExports.useState(null);
  const [availableMembers, setAvailableMembers] = reactExports.useState([]);
  const [selectedMembers, setSelectedMembers] = reactExports.useState([]);
  const [availableRoles, setAvailableRoles] = reactExports.useState([]);
  const [assignments, setAssignments] = reactExports.useState([]);
  const [existingTeamMembers, setExistingTeamMembers] = reactExports.useState([]);
  const [projectHasAdmin, setProjectHasAdmin] = reactExports.useState(false);
  const roleBridgeService = EnhancedRoleBridgeService.getInstance();
  const crossAppSyncService = CrossAppRoleSyncService.getInstance();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [roleFilter, setRoleFilter] = reactExports.useState("popular");
  const [selectedIndustry, setSelectedIndustry] = reactExports.useState("all");
  reactExports.useEffect(() => {
    if (open && projectId) {
      loadWizardData();
    }
  }, [open, projectId]);
  const loadWizardData = () => __async(void 0, null, function* () {
    setLoading(true);
    setError(null);
    try {
      yield loadExistingTeamMembers();
      yield Promise.all([
        loadAvailableMembers(),
        loadAvailableRoles()
      ]);
    } catch (err) {
      console.error("❌ [TeamRoleWizard] Error loading data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  });
  const loadExistingTeamMembers = () => __async(void 0, null, function* () {
    try {
      console.log(`🔍 [TeamRoleWizard] Loading existing team members for project: ${projectId}`);
      if (existingProjectTeamMembers && existingProjectTeamMembers.length > 0) {
        console.log(`✅ [TeamRoleWizard] Using ${existingProjectTeamMembers.length} existing team members from parent component`);
        console.log(`🔍 [TeamRoleWizard] Parent team members data:`, existingProjectTeamMembers);
        setExistingTeamMembers(existingProjectTeamMembers);
        const hasAdmin = existingProjectTeamMembers.some(
          (member) => member.role === "ADMIN" || member.role === TeamMemberRole.ADMIN || member.role === "ENTERPRISE"
        );
        setProjectHasAdmin(hasAdmin);
        console.log(`🛡️ [TeamRoleWizard] Project has admin: ${hasAdmin}`);
        return;
      }
      const teamMemberService = TeamMemberService.getInstance({
        isWebOnlyMode: true,
        apiBaseUrl: "/api"
      });
      try {
        const existingMembers = yield teamMemberService.getProjectTeamMembers(projectId);
        console.log(`✅ [TeamRoleWizard] Found ${existingMembers.length} existing team members from TeamMemberService`);
        console.log(`🔍 [TeamRoleWizard] Service team members data:`, existingMembers);
        setExistingTeamMembers(existingMembers);
        const hasAdmin = existingMembers.some(
          (member) => member.role === "ADMIN" || member.role === TeamMemberRole.ADMIN || member.role === "ENTERPRISE"
        );
        setProjectHasAdmin(hasAdmin);
        console.log(`🛡️ [TeamRoleWizard] Project has admin: ${hasAdmin}`);
      } catch (serviceError) {
        console.warn("⚠️ [TeamRoleWizard] TeamMemberService failed:", serviceError);
        setExistingTeamMembers([]);
        setProjectHasAdmin(false);
        console.log("⚠️ [TeamRoleWizard] Using empty team member list - filtering may not work correctly");
      }
    } catch (err) {
      console.error("❌ [TeamRoleWizard] Error loading existing team members:", err);
      setExistingTeamMembers([]);
      setProjectHasAdmin(false);
    }
  });
  const loadAvailableMembers = () => __async(void 0, null, function* () {
    try {
      console.log(`🔍 [TeamRoleWizard] Loading team members for project: ${projectId}`);
      const allMembers = yield unifiedDataService.getTeamMembersForOrganization();
      const assignedMemberIds = existingTeamMembers.map((member) => member.id || member.userId || member.memberId || member.firebaseUid);
      const assignedEmails = existingTeamMembers.map((member) => member.email).filter(Boolean);
      console.log(`🔍 [TeamRoleWizard] Found ${assignedMemberIds.length} already assigned member IDs:`, assignedMemberIds);
      console.log(`🔍 [TeamRoleWizard] Found ${assignedEmails.length} already assigned member emails:`, assignedEmails);
      console.log(`🔍 [TeamRoleWizard] Existing team members structure:`, existingTeamMembers);
      const availableMembers2 = allMembers.filter((member) => {
        const isAssignedById = assignedMemberIds.includes(member.id);
        const isAssignedByEmail = assignedEmails.includes(member.email);
        const isAssigned = isAssignedById || isAssignedByEmail;
        if (isAssigned) {
          console.log(`🚫 [TeamRoleWizard] Filtering out already assigned member: ${member.name || member.email} (ID: ${member.id}, Email: ${member.email})`);
        }
        return !isAssigned;
      });
      const members = availableMembers2.map((member) => ({
        id: member.id,
        name: member.name || `${member.firstName} ${member.lastName}`,
        email: member.email,
        tier: member.role || member.licenseType || "MEMBER",
        // Show role first, fallback to license type
        isSelected: false
      }));
      setAvailableMembers(members);
      console.log(`✅ [TeamRoleWizard] Loaded ${members.length} available team members (filtered out ${allMembers.length - availableMembers2.length} already assigned)`);
    } catch (err) {
      console.error("❌ [TeamRoleWizard] Error loading members:", err);
      setError(`Failed to load team members: ${err.message}`);
      setAvailableMembers([]);
    }
  });
  const loadAvailableRoles = () => __async(void 0, null, function* () {
    try {
      console.log(`🔍 [TeamRoleWizard] Loading roles for project: ${projectId}`);
      let roles = [
        {
          id: "basic-admin",
          name: "ADMIN",
          displayName: "Project Admin",
          description: "Full administrative access to the project",
          category: "MANAGEMENT",
          hierarchy: 100,
          isTemplate: false,
          isPopular: true
        },
        {
          id: "basic-manager",
          name: "MANAGER",
          displayName: "Project Manager",
          description: "Manage project tasks and team members",
          category: "MANAGEMENT",
          hierarchy: 80,
          isTemplate: false,
          isPopular: true
        },
        {
          id: "basic-doer",
          name: "MEMBER",
          displayName: "Team Member",
          description: "Standard team member with task execution access",
          category: "EXECUTION",
          hierarchy: 60,
          isTemplate: false,
          isPopular: true
        },
        {
          id: "basic-viewer",
          name: "VIEWER",
          displayName: "Viewer",
          description: "Read-only access to project information",
          category: "ACCESS",
          hierarchy: 20,
          isTemplate: false,
          isPopular: false
        }
      ];
      const allTemplates = getAllEnhancedTemplates();
      const enhancedTemplates = allTemplates.map((template) => ({
        id: `template-${template.id}`,
        name: template.name,
        displayName: template.displayName,
        description: template.description,
        category: template.category,
        hierarchy: template.hierarchy,
        isTemplate: true,
        isPopular: template.isPopular,
        industry: template.industry,
        tags: template.tags,
        usageCount: template.usageCount,
        icon: template.icon,
        color: template.color
      }));
      console.log(`🎭 [TeamRoleWizard] Loaded ${enhancedTemplates.length} enhanced role templates`);
      setAvailableRoles([...roles, ...enhancedTemplates]);
    } catch (err) {
      console.error("❌ [TeamRoleWizard] Error loading roles:", err);
      setAvailableRoles([]);
    }
  });
  const handleNext = () => {
    if (activeStep === 0 && !selectedAction) {
      setError("Please choose an action to continue");
      return;
    }
    if (activeStep === 1 && selectedMembers.length === 0) {
      setError("Please select at least one team member");
      return;
    }
    if (activeStep === 2) {
      const missingAssignments = selectedMembers.filter(
        (member) => !assignments.find((a) => a.memberId === member.id)
      );
      if (missingAssignments.length > 0) {
        setError(`Please assign roles to: ${missingAssignments.map((m) => m.name).join(", ")}`);
        return;
      }
      if (!projectHasAdmin) {
        const adminAssigned = assignments.some((assignment) => {
          const assignedRole = availableRoles.find((r) => r.id === assignment.roleId);
          return (assignedRole == null ? void 0 : assignedRole.name) === "ADMIN";
        });
        if (!adminAssigned) {
          setError("⚠️ This project needs an ADMIN! Please assign the ADMIN role to at least one team member before proceeding.");
          return;
        }
      }
    }
    setError(null);
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };
  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };
  const handleReset = () => {
    setActiveStep(0);
    setSelectedAction(null);
    setSelectedMembers([]);
    setAssignments([]);
    setError(null);
    setSuccess(null);
  };
  const handleMemberToggle = (member) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.id === member.id);
      if (isSelected) {
        setAssignments(
          (prevAssignments) => prevAssignments.filter((a) => a.memberId !== member.id)
        );
        return prev.filter((m) => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };
  const handleRoleAssignment = (memberId, roleId) => {
    setAssignments((prev) => {
      const existing = prev.find((a) => a.memberId === memberId);
      let newAssignments;
      if (existing) {
        newAssignments = prev.map((a) => a.memberId === memberId ? __spreadProps(__spreadValues({}, a), { roleId }) : a);
      } else {
        newAssignments = [...prev, { memberId, roleId }];
      }
      const assignedRole = availableRoles.find((r) => r.id === roleId);
      if ((assignedRole == null ? void 0 : assignedRole.name) === "ADMIN") {
        console.log("🛡️ [TeamRoleWizard] ADMIN role assigned - updating project admin status");
      }
      return newAssignments;
    });
  };
  const handleSubmit = () => __async(void 0, null, function* () {
    setLoading(true);
    setError(null);
    try {
      console.log(`🚀 [TeamRoleWizard] Starting assignment process for ${assignments.length} assignments`);
      const teamMemberService = TeamMemberService.getInstance({
        isWebOnlyMode: true,
        apiBaseUrl: "/api"
      });
      for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const role = availableRoles.find((r) => r.id === assignment.roleId);
        const member = selectedMembers.find((m) => m.id === assignment.memberId);
        console.log(`📋 [TeamRoleWizard] Processing assignment ${i + 1}/${assignments.length}: ${member == null ? void 0 : member.name} -> ${role == null ? void 0 : role.displayName}`);
        let roleName = TeamMemberRole.MEMBER;
        let dashboardRole = null;
        let licensingRole = TeamMemberRole.MEMBER;
        if ((role == null ? void 0 : role.name) === "ADMIN") {
          licensingRole = TeamMemberRole.ADMIN;
          roleName = TeamMemberRole.ADMIN;
        } else {
          licensingRole = TeamMemberRole.MEMBER;
          roleName = TeamMemberRole.MEMBER;
        }
        if ((role == null ? void 0 : role.isTemplate) && member) {
          console.log(`🎭 [TeamRoleWizard] Mapping template role: ${role.displayName}`);
          const templateRole = {
            id: role.id,
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            industry: "FILM_TV",
            // Default industry
            eventTypes: [],
            category: role.category,
            hierarchy: role.hierarchy,
            baseRole: "PRODUCER",
            // Default base role
            permissions: {},
            raciLevel: "RESPONSIBLE",
            keyResponsibilities: [],
            requiredSkills: [],
            reportingStructure: {},
            tags: role.tags || [],
            isPopular: role.isPopular || false,
            usageCount: role.usageCount || 0,
            icon: role.icon || "Person",
            color: role.color || "#1976d2",
            experienceLevel: "Mid"
          };
          const enhancedMapping = roleBridgeService.mapLicensingRoleToDashboard(
            licensingRole,
            templateRole,
            "PRO"
            // Default to PRO tier, could be dynamic based on organization
          );
          dashboardRole = enhancedMapping.dashboardRole;
          console.log(`✅ [TeamRoleWizard] Template mapped to Dashboard role: ${dashboardRole} (hierarchy: ${enhancedMapping.effectiveHierarchy})`);
          try {
            yield crossAppSyncService.syncRoleToLicensing(
              member.id,
              projectId,
              organizationId,
              licensingRole,
              templateRole,
              "licensing-wizard"
              // Assigned by
            );
            console.log(`🔄 [TeamRoleWizard] Role synced to Dashboard for: ${member.name}`);
          } catch (syncError) {
            console.warn("⚠️ [TeamRoleWizard] Failed to sync role to Dashboard:", syncError);
          }
        }
        console.log(`👥 [TeamRoleWizard] Adding team member to project: ${member == null ? void 0 : member.name} with role: ${roleName}`);
        try {
          const success2 = yield teamMemberService.addTeamMemberToProject(
            projectId,
            assignment.memberId,
            roleName
          );
          if (!success2) {
            throw new Error(`Failed to add ${(member == null ? void 0 : member.name) || "team member"} to project`);
          }
          console.log(`✅ [TeamRoleWizard] Successfully added ${member == null ? void 0 : member.name} to project`);
        } catch (memberError) {
          console.warn(`⚠️ [TeamRoleWizard] TeamMemberService failed, trying UnifiedDataService:`, memberError);
          try {
            yield unifiedDataService.addTeamMemberToProject(projectId, assignment.memberId, roleName);
            console.log(`✅ [TeamRoleWizard] Successfully added ${member == null ? void 0 : member.name} via UnifiedDataService`);
          } catch (fallbackError) {
            throw new Error(`Failed to add ${(member == null ? void 0 : member.name) || "team member"}: ${fallbackError.message}`);
          }
        }
      }
      console.log(`🎉 [TeamRoleWizard] All assignments completed successfully!`);
      setSuccess(`Successfully added ${selectedMembers.length} team member${selectedMembers.length !== 1 ? "s" : ""} to the project!`);
      if (onTeamMembersUpdated) {
        console.log("🔄 [TeamRoleWizard] Notifying parent component to refresh team members");
        onTeamMembersUpdated();
      }
      setTimeout(() => {
        onClose();
        handleReset();
      }, 2e3);
    } catch (err) {
      console.error("❌ [TeamRoleWizard] Error submitting:", err);
      setError(err.message || "Failed to add team members");
    } finally {
      setLoading(false);
    }
  });
  const filteredRoles = availableRoles.filter((role) => {
    var _a;
    if (role.name === "ADMIN") {
      const adminAlreadyAssigned = assignments.some((assignment) => {
        const assignedRole = availableRoles.find((r) => r.id === assignment.roleId);
        return (assignedRole == null ? void 0 : assignedRole.name) === "ADMIN";
      });
      if (projectHasAdmin || adminAlreadyAssigned) {
        return false;
      }
    }
    if (roleFilter === "templates") {
      if (!role.isTemplate) return false;
    } else if (roleFilter === "custom") {
      if (role.isTemplate) return false;
    } else if (roleFilter === "popular") {
      if (!role.isTemplate || !role.isPopular) return false;
    }
    if (selectedIndustry !== "all" && role.industry && role.industry !== selectedIndustry) {
      return false;
    }
    if (searchQuery.trim()) {
      const query2 = searchQuery.toLowerCase();
      const matchesName = role.displayName.toLowerCase().includes(query2);
      const matchesDescription = role.description.toLowerCase().includes(query2);
      const matchesTags = ((_a = role.tags) == null ? void 0 : _a.some((tag) => tag.toLowerCase().includes(query2))) || false;
      if (!matchesName && !matchesDescription && !matchesTags) {
        return false;
      }
    }
    return true;
  });
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "center", py: 4, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "What would you like to do?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 4 }, children: "Choose an action to get started with team management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, justifyContent: "center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                sx: {
                  cursor: "pointer",
                  border: selectedAction === "add-members" ? 2 : 1,
                  borderColor: selectedAction === "add-members" ? "primary.main" : "divider",
                  "&:hover": { borderColor: "primary.main" }
                },
                onClick: () => setSelectedAction("add-members"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", py: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, { sx: { fontSize: 48, color: "primary.main", mb: 2 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Add Team Members" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Add new team members to this project and assign them roles" })
                ] })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Card,
              {
                sx: {
                  cursor: "pointer",
                  border: selectedAction === "manage-roles" ? 2 : 1,
                  borderColor: selectedAction === "manage-roles" ? "primary.main" : "divider",
                  "&:hover": { borderColor: "primary.main" }
                },
                onClick: () => setSelectedAction("manage-roles"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center", py: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { sx: { fontSize: 48, color: "primary.main", mb: 2 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Manage Roles" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Create custom roles or use templates for your project" })
                ] })
              }
            ) })
          ] })
        ] });
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Select Team Members" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
            'Choose team members to add to "',
            projectName,
            '"'
          ] }),
          existingTeamMembers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Current Team:" }),
            " This project already has ",
            existingTeamMembers.length,
            " team member",
            existingTeamMembers.length !== 1 ? "s" : "",
            " assigned.",
            projectHasAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: " ✅ Project has an admin." }),
            !projectHasAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: " ⚠️ Project needs an admin to be assigned." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              placeholder: "Search team members...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              InputProps: {
                startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, { sx: { mr: 1, color: "text.secondary" } })
              },
              sx: { mb: 3 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: [
              "Available Team Members (",
              availableMembers.length,
              ")"
            ] }),
            availableMembers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No available team members found." }),
              existingTeamMembers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: " All organization members are already assigned to this project. To reassign a member, please remove them from the project first using the Project Details panel." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: " No team members are available in your organization. Please add team members to your organization first." })
            ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: availableMembers.filter(
              (member) => {
                var _a, _b;
                return ((_a = member.name) == null ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase())) || ((_b = member.email) == null ? void 0 : _b.toLowerCase().includes(searchQuery.toLowerCase()));
              }
            ).map((member) => {
              var _a, _b;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { divider: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemAvatar, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: member.avatar, children: ((_a = member.name) == null ? void 0 : _a.charAt(0)) || ((_b = member.email) == null ? void 0 : _b.charAt(0)) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ListItemText,
                  {
                    primary: member.name || member.email,
                    secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: member.email }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: member.tier, size: "small", sx: { mt: 0.5 } })
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: selectedMembers.some((m) => m.id === member.id),
                    onChange: () => handleMemberToggle(member)
                  }
                ) })
              ] }, member.id);
            }) })
          ] }) }),
          selectedMembers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: [
              "Selected Members (",
              selectedMembers.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", flexWrap: "wrap", gap: 1, children: selectedMembers.map((member) => {
              var _a, _b;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: member.name || member.email,
                  onDelete: () => handleMemberToggle(member),
                  avatar: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: member.avatar, children: ((_a = member.name) == null ? void 0 : _a.charAt(0)) || ((_b = member.email) == null ? void 0 : _b.charAt(0)) })
                },
                member.id
              );
            }) })
          ] }) })
        ] });
      case 2:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Assign Roles" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Assign roles to the selected team members from our comprehensive template library" }),
          !projectHasAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠️ ADMIN Required!" }),
            " This project doesn't have an administrator yet. You must assign the ADMIN role to at least one team member to proceed."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "50+ Professional Role Templates Available!" }),
            " Choose from industry-specific roles including Film & TV, Corporate, Live Events, Education, Sports, Streaming, Music, and Marketing. Popular templates are shown by default.",
            projectHasAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
              " ADMIN role is not available as this project already has an administrator."
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: roleFilter,
                    onChange: (e) => setRoleFilter(e.target.value),
                    label: "Role Type",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "popular", children: "Popular Templates" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "templates", children: "All Templates" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "custom", children: "Custom Roles" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "all", children: "All Roles" })
                    ]
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, size: "small", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Industry" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: selectedIndustry,
                    onChange: (e) => setSelectedIndustry(e.target.value),
                    label: "Industry",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "all", children: "All Industries" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "FILM_TV", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MovieIcon, { fontSize: "small" }),
                        "Film & TV"
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CORPORATE", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Business, { fontSize: "small" }),
                        "Corporate"
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "LIVE_EVENTS", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(EventIcon, { fontSize: "small" }),
                        "Live Events"
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "EDUCATION", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(School, { fontSize: "small" }),
                        "Education"
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "SPORTS", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SportsIcon, { fontSize: "small" }),
                        "Sports"
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "STREAMING", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TvIcon, { fontSize: "small" }),
                        "Streaming"
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "MUSIC", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MusicIcon, { fontSize: "small" }),
                        "Music"
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "MARKETING", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CampaignIcon, { fontSize: "small" }),
                        "Marketing"
                      ] }) })
                    ]
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  size: "small",
                  placeholder: "Search roles...",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                "Showing ",
                filteredRoles.length,
                " roles"
              ] }),
              roleFilter === "popular" && /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Popular", size: "small", color: "primary" }),
              selectedIndustry !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: selectedIndustry.replace("_", " "),
                  size: "small",
                  variant: "outlined",
                  onDelete: () => setSelectedIndustry("all")
                }
              ),
              searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: `"${searchQuery}"`,
                  size: "small",
                  variant: "outlined",
                  onDelete: () => setSearchQuery("")
                }
              )
            ] })
          ] }),
          selectedMembers.map((member) => {
            var _a, _b;
            const currentAssignment = assignments.find((a) => a.memberId === member.id);
            const assignedRole = currentAssignment ? filteredRoles.find((r) => r.id === currentAssignment.roleId) : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 2, mb: 2, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: member.avatar, children: ((_a = member.name) == null ? void 0 : _a.charAt(0)) || ((_b = member.email) == null ? void 0 : _b.charAt(0)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { flex: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", children: member.name || member.email }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: member.email })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Assign Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Select,
                  {
                    value: (currentAssignment == null ? void 0 : currentAssignment.roleId) || "",
                    onChange: (e) => handleRoleAssignment(member.id, e.target.value),
                    label: "Assign Role",
                    children: filteredRoles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      MenuItem,
                      {
                        value: role.id,
                        sx: __spreadValues({}, role.name === "ADMIN" && !projectHasAdmin && {
                          backgroundColor: "rgba(255, 152, 0, 0.1)",
                          border: "1px solid rgba(255, 152, 0, 0.3)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 152, 0, 0.2)"
                          }
                        }),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, width: "100%", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minWidth: 24 }, children: role.name === "ADMIN" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { fontSize: "small", color: "warning" }) : role.icon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { fontSize: "1.2em" }, children: role.icon }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { fontSize: "small", color: "action" }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { flex: 1, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, mb: 0.5, children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                Typography,
                                {
                                  variant: "body1",
                                  sx: {
                                    fontWeight: role.name === "ADMIN" ? 600 : 500,
                                    color: role.name === "ADMIN" && !projectHasAdmin ? "warning.main" : "inherit"
                                  },
                                  children: [
                                    role.displayName,
                                    role.name === "ADMIN" && !projectHasAdmin && " ⚠️ REQUIRED"
                                  ]
                                }
                              ),
                              role.isPopular && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { sx: { fontSize: 16, color: "orange" } }),
                              role.isTemplate && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Chip,
                                {
                                  label: "Template",
                                  size: "small",
                                  sx: { height: 16, fontSize: "0.65rem" }
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", display: "block", children: role.description }),
                            role.industry && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "primary.main", children: [
                              role.industry.replace("_", " "),
                              " • Level ",
                              role.hierarchy
                            ] }),
                            role.tags && role.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 0.5 }, children: role.tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Chip,
                              {
                                label: tag,
                                size: "small",
                                variant: "outlined",
                                sx: {
                                  height: 16,
                                  fontSize: "0.6rem",
                                  mr: 0.5,
                                  mb: 0.5
                                }
                              },
                              tag
                            )) })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "right", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Chip,
                              {
                                label: role.category,
                                size: "small",
                                variant: "outlined",
                                sx: { mb: 0.5 }
                              }
                            ),
                            role.usageCount && /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", display: "block", children: [
                              role.usageCount,
                              " uses"
                            ] })
                          ] })
                        ] })
                      },
                      role.id
                    ))
                  }
                )
              ] }),
              assignedRole && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", sx: { mt: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: assignedRole.displayName }),
                  " - Level ",
                  assignedRole.hierarchy
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", children: assignedRole.description })
              ] })
            ] }) }, member.id);
          })
        ] });
      case 3:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Review & Confirm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: "Review the team member assignments before confirming" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", gutterBottom: true, children: [
              "Project: ",
              projectName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 3 }, children: [
              "Adding ",
              selectedMembers.length,
              " team member",
              selectedMembers.length !== 1 ? "s" : ""
            ] }),
            selectedMembers.map((member) => {
              var _a, _b;
              const assignment = assignments.find((a) => a.memberId === member.id);
              const assignedRole = assignment ? availableRoles.find((r) => r.id === assignment.roleId) : null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 2, mb: 2, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: member.avatar, children: ((_a = member.name) == null ? void 0 : _a.charAt(0)) || ((_b = member.email) == null ? void 0 : _b.charAt(0)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { flex: 1, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: member.name || member.email }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: member.email })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { textAlign: "right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end", mb: 0.5, children: [
                    (assignedRole == null ? void 0 : assignedRole.icon) && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { sx: { fontSize: "1em" }, children: assignedRole.icon }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        label: (assignedRole == null ? void 0 : assignedRole.displayName) || "No Role",
                        color: assignedRole ? "primary" : "default",
                        size: "small"
                      }
                    ),
                    (assignedRole == null ? void 0 : assignedRole.isPopular) && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { sx: { fontSize: 14, color: "orange" } })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", display: "block", color: "text.secondary", children: [
                    (assignedRole == null ? void 0 : assignedRole.isTemplate) ? "Template Role" : "Custom Role",
                    " • Level ",
                    (assignedRole == null ? void 0 : assignedRole.hierarchy) || 0
                  ] }),
                  (assignedRole == null ? void 0 : assignedRole.industry) && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", display: "block", color: "primary.main", children: assignedRole.industry.replace("_", " ") }),
                  (assignedRole == null ? void 0 : assignedRole.tags) && assignedRole.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 0.5 }, children: assignedRole.tags.slice(0, 2).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: tag,
                      size: "small",
                      variant: "outlined",
                      sx: {
                        height: 14,
                        fontSize: "0.6rem",
                        mr: 0.5
                      }
                    },
                    tag
                  )) })
                ] })
              ] }, member.id);
            })
          ] }) })
        ] });
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
      PaperProps: {
        sx: { minHeight: "600px" }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Group, { color: "primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Team & Role Management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: projectName })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: onClose, size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloseIcon, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { activeStep, sx: { mb: 4 }, children: STEPS.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(Step, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepLabel, { children: label }) }, label)) }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, onClose: () => setError(null), children: error }),
          success && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 3 }, children: success }),
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { display: "flex", justifyContent: "center", py: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }),
          !loading && renderStepContent()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: { p: 3, pt: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onClose, disabled: loading, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { flex: 1 }),
          activeStep > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleBack,
              disabled: loading,
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowBack, {}),
              children: "Back"
            }
          ),
          activeStep < STEPS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              onClick: handleNext,
              disabled: loading,
              endIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowForward, {}),
              children: "Next"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              onClick: handleSubmit,
              disabled: loading || selectedMembers.length === 0,
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}),
              children: loading ? "Adding..." : "Add Team Members"
            }
          )
        ] })
      ]
    }
  );
};
const _ProjectRoleService = class _ProjectRoleService {
  constructor() {
    __publicField(this, "baseUrl", "https://us-central1-backbone-logic.cloudfunctions.net/api");
  }
  static getInstance() {
    if (!_ProjectRoleService.instance) {
      _ProjectRoleService.instance = new _ProjectRoleService();
    }
    return _ProjectRoleService.instance;
  }
  /**
   * Get available roles for team member assignment
   */
  getAvailableRoles(projectId) {
    return __async(this, null, function* () {
      var _a, _b;
      try {
        console.log(`🎭 [ProjectRoleService] Fetching available roles for project: ${projectId}`);
        let retries = 0;
        const maxRetries = 10;
        let token;
        while (retries < maxRetries) {
          const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
          const currentUser = auth == null ? void 0 : auth.currentUser;
          if (currentUser) {
            token = yield currentUser.getIdToken();
            break;
          }
          yield new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }
        if (!token) {
          throw new Error("User not authenticated - Firebase not ready");
        }
        const response = yield fetch(`${this.baseUrl}/projects/${projectId}/available-roles`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          const errorData = yield response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch available roles");
        }
        const data = yield response.json();
        console.log(`✅ [ProjectRoleService] Fetched ${((_b = data.data) == null ? void 0 : _b.length) || 0} available roles`);
        return data.data || [];
      } catch (error) {
        console.error("❌ [ProjectRoleService] Error fetching available roles:", error);
        throw error;
      }
    });
  }
  /**
   * Add team member to project with role
   */
  addTeamMemberToProject(projectId, teamMemberId, roleId) {
    return __async(this, null, function* () {
      var _a;
      try {
        console.log(`🎭 [ProjectRoleService] Adding team member ${teamMemberId} to project ${projectId} with role ${roleId}`);
        let retries = 0;
        const maxRetries = 10;
        let token;
        while (retries < maxRetries) {
          const auth = (_a = window.firebase) == null ? void 0 : _a.auth();
          const currentUser = auth == null ? void 0 : auth.currentUser;
          if (currentUser) {
            token = yield currentUser.getIdToken();
            break;
          }
          yield new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }
        if (!token) {
          throw new Error("User not authenticated - Firebase not ready");
        }
        const response = yield fetch(`${this.baseUrl}/projects/${projectId}/team-members`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            teamMemberId,
            roleId
          })
        });
        if (!response.ok) {
          const errorData = yield response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to add team member to project");
        }
        const data = yield response.json();
        console.log(`✅ [ProjectRoleService] Successfully added team member to project:`, data);
      } catch (error) {
        console.error("❌ [ProjectRoleService] Error adding team member to project:", error);
        throw error;
      }
    });
  }
  /**
   * Get role display color based on category
   */
  getRoleDisplayColor(category) {
    const colorMap = {
      "ADMINISTRATIVE": "#ef4444",
      // red
      "PRODUCTION": "#3b82f6",
      // blue
      "EDITORIAL": "#10b981",
      // emerald
      "TECHNICAL": "#f59e0b",
      // amber
      "CREATIVE": "#8b5cf6",
      // violet
      "MANAGEMENT": "#f97316",
      // orange
      "default": "#6b7280"
      // gray
    };
    return colorMap[category] || colorMap.default;
  }
  /**
   * Format role description with hierarchy info
   */
  formatRoleDescription(role) {
    const hierarchyText = role.hierarchy >= 80 ? "High-level" : role.hierarchy >= 50 ? "Mid-level" : "Entry-level";
    return `${role.description} (${hierarchyText} - ${role.hierarchy})`;
  }
};
__publicField(_ProjectRoleService, "instance");
let ProjectRoleService = _ProjectRoleService;
const projectRoleService = ProjectRoleService.getInstance();
const getCollaborationLimit = (user) => {
  var _a;
  if (!user) return 1;
  let totalActiveLicenses = 0;
  if (user.licenses && Array.isArray(user.licenses)) {
    const activeLicenses = user.licenses.filter(
      (license) => license.status === "ACTIVE" || license.status === "PENDING"
    );
    totalActiveLicenses += activeLicenses.length;
  }
  if ((_a = user.subscription) == null ? void 0 : _a.plan) {
    const plan = user.subscription.plan.toUpperCase();
    if (plan === "ENTERPRISE") {
      totalActiveLicenses += user.subscription.seats || 100;
    } else if (plan === "PRO" || plan === "PROFESSIONAL") {
      totalActiveLicenses += user.subscription.seats || 25;
    } else if (plan === "BASIC") {
      totalActiveLicenses += user.subscription.seats || 5;
    }
  }
  if (user.organizationId && !user.isTeamMember) {
    const orgLicenseCount = user.organizationLicenseCount || totalActiveLicenses;
    totalActiveLicenses = Math.max(totalActiveLicenses, orgLicenseCount);
  }
  const minLimit = 1;
  const maxLimit = 1e3;
  return Math.max(minLimit, Math.min(totalActiveLicenses, maxLimit));
};
const getProjectStatus = (project, teamMemberCount = 0, datasetCount = 0) => {
  return calculateEnhancedStatus(project, teamMemberCount, datasetCount);
};
const shouldEnableCollaboration = (project, teamMemberCount = 0) => {
  var _a;
  if (project.applicationMode === "shared_network") {
    return true;
  }
  if (teamMemberCount > 0) {
    return true;
  }
  if (((_a = project.settings) == null ? void 0 : _a.autoEnableCollaboration) !== false) {
    return true;
  }
  if (project.allowCollaboration === true) {
    return true;
  }
  return project.allowCollaboration !== false;
};
const calculateCompletionPercentage = (project, teamMemberCount = 0, datasetCount = 0) => {
  let completionScore = 0;
  let totalCriteria = 0;
  if (project.name && project.description) {
    completionScore += 20;
  } else if (project.name) {
    completionScore += 10;
  }
  totalCriteria += 20;
  if (teamMemberCount > 0) {
    completionScore += Math.min(30, teamMemberCount * 10);
  }
  totalCriteria += 30;
  if (datasetCount > 0) {
    completionScore += Math.min(25, datasetCount * 5);
  }
  totalCriteria += 25;
  if (project.lastAccessedAt) {
    const daysSinceAccess = ((/* @__PURE__ */ new Date()).getTime() - new Date(project.lastAccessedAt).getTime()) / (24 * 60 * 60 * 1e3);
    if (daysSinceAccess <= 1) {
      completionScore += 25;
    } else if (daysSinceAccess <= 7) {
      completionScore += 15;
    } else if (daysSinceAccess <= 30) {
      completionScore += 5;
    }
  }
  totalCriteria += 25;
  return Math.min(100, Math.round(completionScore / totalCriteria * 100));
};
const getStatusColorLocal = (status) => getStatusColor(status);
const getStatusIcon = (status) => {
  switch (status) {
    case "draft":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {});
    case "active":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, {});
    case "in-progress":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, {});
    case "completed":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {});
    case "archived":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveIcon, {});
    case "paused":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {});
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Info, {});
  }
};
const mapServiceProjectToComponentProject = (serviceProject, teamMemberCount = 0, datasetCount = 0, user) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
  console.log("🔍 [DashboardCloudProjectsBridge] Mapping project:", serviceProject.name);
  console.log("🔍 [DashboardCloudProjectsBridge] Raw project data:", serviceProject);
  console.log("🔍 [DashboardCloudProjectsBridge] Team member count:", teamMemberCount);
  console.log("🔍 [DashboardCloudProjectsBridge] Dataset count:", datasetCount);
  const projectStatus = getProjectStatus(serviceProject, teamMemberCount, datasetCount);
  const collaborationEnabled = shouldEnableCollaboration(serviceProject, teamMemberCount);
  const completionPercentage = calculateCompletionPercentage(serviceProject, teamMemberCount, datasetCount);
  const lastActivityAt = serviceProject.lastActivityAt || serviceProject.lastAccessedAt || serviceProject.updatedAt;
  console.log("🔍 [DashboardCloudProjectsBridge] Calculated status:", projectStatus);
  console.log("🔍 [DashboardCloudProjectsBridge] Collaboration enabled:", collaborationEnabled);
  console.log("🔍 [DashboardCloudProjectsBridge] Completion percentage:", completionPercentage);
  return {
    id: serviceProject.id,
    name: serviceProject.name,
    description: serviceProject.description,
    applicationMode: ((_a = serviceProject.settings) == null ? void 0 : _a.applicationMode) || "shared_network",
    // Default to shared_network for cloud projects
    storageBackend: ((_b = serviceProject.settings) == null ? void 0 : _b.storageBackend) || "firestore",
    gcsBucket: (_c = serviceProject.settings) == null ? void 0 : _c.gcsBucket,
    gcsPrefix: (_d = serviceProject.settings) == null ? void 0 : _d.gcsPrefix,
    s3Bucket: (_e = serviceProject.settings) == null ? void 0 : _e.s3Bucket,
    s3Region: (_f = serviceProject.settings) == null ? void 0 : _f.s3Region,
    s3Prefix: (_g = serviceProject.settings) == null ? void 0 : _g.s3Prefix,
    azureStorageAccount: (_h = serviceProject.settings) == null ? void 0 : _h.azureStorageAccount,
    azureContainer: (_i = serviceProject.settings) == null ? void 0 : _i.azureContainer,
    azurePrefix: (_j = serviceProject.settings) == null ? void 0 : _j.azurePrefix,
    lastAccessedAt: serviceProject.lastAccessedAt || (/* @__PURE__ */ new Date()).toISOString(),
    isActive: projectStatus !== "archived" && projectStatus !== "paused",
    isArchived: projectStatus === "archived",
    allowCollaboration: collaborationEnabled,
    maxCollaborators: ((_k = serviceProject.settings) == null ? void 0 : _k.maxCollaborators) || getCollaborationLimit(user),
    realTimeEnabled: ((_l = serviceProject.settings) == null ? void 0 : _l.realTimeEnabled) || collaborationEnabled,
    // Enable real-time if collaboration is enabled
    // Enhanced properties
    status: projectStatus,
    completionPercentage,
    lastActivityAt,
    teamMemberCount,
    collaborationEnabled,
    settings: __spreadProps(__spreadValues({}, serviceProject.settings), {
      autoEnableCollaboration: (_n = (_m = serviceProject.settings) == null ? void 0 : _m.autoEnableCollaboration) != null ? _n : true,
      // Default to true for cloud projects
      completionCriteria: __spreadValues({
        requiresDatasets: true,
        requiresTeamMembers: true,
        minimumActivity: 1
      }, (_o = serviceProject.settings) == null ? void 0 : _o.completionCriteria)
    }),
    teamMemberRole: (_q = (_p = serviceProject.teamMembers) == null ? void 0 : _p[0]) == null ? void 0 : _q.role,
    role: (_s = (_r = serviceProject.teamMembers) == null ? void 0 : _r[0]) == null ? void 0 : _s.role,
    assignedAt: (_u = (_t = serviceProject.teamMembers) == null ? void 0 : _t[0]) == null ? void 0 : _u.assignedAt,
    projectOwner: serviceProject.ownerId
  };
};
const DashboardCloudProjectsBridge = () => {
  var _a, _b, _c, _d;
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const [subscriptionData, setSubscriptionData] = reactExports.useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = reactExports.useState(false);
  const fetchSubscriptionData = reactExports.useCallback((organizationId) => __async(void 0, null, function* () {
    var _a2, _b2, _c2, _d2;
    if (subscriptionLoading) return;
    setSubscriptionLoading(true);
    try {
      console.log("🔍 [DashboardCloudProjectsBridge] Fetching subscription from Firestore for org:", organizationId);
      const { getFirestore, collection: collection2, query: query2, where: where2, getDocs: getDocs2, orderBy: orderBy2, limit: limit2 } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { getFirestore: getFirestore2, collection: collection3, query: query3, where: where3, getDocs: getDocs3, orderBy: orderBy22, limit: limit3 } = yield import("./index.esm-CjtNHFZy.js");
        return { getFirestore: getFirestore2, collection: collection3, query: query3, where: where3, getDocs: getDocs3, orderBy: orderBy22, limit: limit3 };
      }), true ? __vite__mapDeps([6,7]) : void 0);
      const { getAuth } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { getAuth: getAuth2 } = yield import("./index.esm-D5-7iBdy.js");
        return { getAuth: getAuth2 };
      }), true ? __vite__mapDeps([9,7]) : void 0);
      const db2 = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("No authenticated user for subscription fetch");
        return;
      }
      const subscriptionsQuery = query2(
        collection2(db2, "subscriptions"),
        where2("organizationId", "==", organizationId),
        orderBy2("createdAt", "desc"),
        limit2(1)
      );
      const subscriptionsSnapshot = yield getDocs2(subscriptionsQuery);
      if (!subscriptionsSnapshot.empty) {
        const subDoc = subscriptionsSnapshot.docs[0];
        const subData = subDoc.data();
        console.log("✅ [DashboardCloudProjectsBridge] Found subscription in Firestore:", {
          id: subDoc.id,
          tier: subData.tier,
          status: subData.status,
          organizationId: subData.organizationId
        });
        const subscription = {
          plan: ((_a2 = subData.tier) == null ? void 0 : _a2.toLowerCase()) || "basic",
          status: ((_b2 = subData.status) == null ? void 0 : _b2.toLowerCase()) || "active",
          currentPeriodEnd: ((_d2 = (_c2 = subData.currentPeriodEnd) == null ? void 0 : _c2.toDate) == null ? void 0 : _d2.call(_c2)) || subData.currentPeriodEnd
        };
        setSubscriptionData(subscription);
        localStorage.setItem("user_subscription", JSON.stringify(subscription));
      } else {
        console.log("⚠️ [DashboardCloudProjectsBridge] No subscription found in Firestore for org:", organizationId);
      }
    } catch (error2) {
      console.warn("Failed to fetch subscription from Firestore:", error2);
    } finally {
      setSubscriptionLoading(false);
    }
  }), [subscriptionLoading]);
  const getCompleteUser = reactExports.useCallback(() => {
    if (!user) return null;
    const storedUserStr = localStorage.getItem("auth_user");
    let mergedUser = __spreadValues({}, user);
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        mergedUser = __spreadProps(__spreadValues(__spreadValues({}, user), storedUser), {
          // Ensure these properties are explicitly set
          isTeamMember: storedUser.isTeamMember || user.isTeamMember || storedUser.role === "TEAM_MEMBER",
          organizationId: storedUser.organizationId || user.organizationId,
          memberRole: storedUser.memberRole || user.memberRole,
          memberStatus: storedUser.memberStatus || user.memberStatus,
          teamMemberData: storedUser.teamMemberData || user.teamMemberData
        });
      } catch (e) {
        console.warn("Failed to parse stored user from localStorage:", e);
      }
    }
    if (!mergedUser.subscription) {
      const subscriptionData2 = localStorage.getItem("user_subscription");
      if (subscriptionData2) {
        try {
          const parsed = JSON.parse(subscriptionData2);
          mergedUser.subscription = parsed;
        } catch (e) {
          console.warn("Failed to parse subscription data from localStorage:", e);
        }
      }
      const billingData = localStorage.getItem("user_billing");
      if (billingData && !mergedUser.subscription) {
        try {
          const parsed = JSON.parse(billingData);
          if (parsed.subscription) {
            mergedUser.subscription = parsed.subscription;
          }
        } catch (e) {
          console.warn("Failed to parse billing data from localStorage:", e);
        }
      }
    }
    if (subscriptionData) {
      mergedUser.subscription = subscriptionData;
    }
    if (!mergedUser.subscription && mergedUser.organizationId && !subscriptionLoading) {
      console.log("🔍 [DashboardCloudProjectsBridge] No subscription found in localStorage, fetching from Firestore for org:", mergedUser.organizationId);
      fetchSubscriptionData(mergedUser.organizationId);
    }
    return mergedUser;
  }, [user, subscriptionData, subscriptionLoading, fetchSubscriptionData]);
  const completeUser = reactExports.useMemo(() => getCompleteUser(), [getCompleteUser]);
  const isTeamMember = reactExports.useCallback(() => {
    if (!completeUser) return false;
    if (completeUser.memberRole === "OWNER" || completeUser.role === "SUPERADMIN" || completeUser.role === "ADMIN" || String(completeUser.role).includes("ENTERPRISE")) {
      return false;
    }
    const isExplicitTeamMember = completeUser.isTeamMember === true || completeUser.role === "TEAM_MEMBER";
    if (!isExplicitTeamMember) {
      const teamMemberData = localStorage.getItem("team_member_data");
      if (teamMemberData) {
        try {
          const parsed = JSON.parse(teamMemberData);
          if (parsed.memberRole === "OWNER" || parsed.role === "SUPERADMIN" || parsed.role === "ADMIN" || String(parsed.role).includes("ENTERPRISE")) {
            console.log("🔍 [DashboardCloudProjectsBridge] localStorage shows account owner - NOT a team member");
            return false;
          }
        } catch (e) {
          console.warn("Failed to parse team member data:", e);
        }
      }
    }
    return isExplicitTeamMember;
  }, [completeUser]);
  const canCreateProjects = reactExports.useMemo(() => {
    var _a2, _b2, _c2, _d2;
    if (!completeUser) {
      return false;
    }
    if (completeUser.memberRole === "ENTERPRISE_ADMIN" || completeUser.role === "ENTERPRISE_ADMIN" || String(completeUser.role).includes("ENTERPRISE")) {
      return true;
    }
    if (!isTeamMember()) {
      if (completeUser.role === "OWNER" || completeUser.memberRole === "OWNER") {
        return true;
      }
      const hasActiveSubscription = ((_a2 = completeUser.subscription) == null ? void 0 : _a2.status) === "ACTIVE" || ((_b2 = completeUser.subscription) == null ? void 0 : _b2.status) === "TRIALING" || completeUser.role === "SUPERADMIN" || completeUser.role === "ADMIN";
      if (hasActiveSubscription) {
        return true;
      } else {
        if (((_c2 = completeUser.subscription) == null ? void 0 : _c2.plan) && ["BASIC", "PRO", "ENTERPRISE"].includes(completeUser.subscription.plan)) {
          return true;
        }
        const isDemoUser = completeUser.isDemoUser || localStorage.getItem("demo_user_status") === "ACTIVE";
        if (isDemoUser) {
          return true;
        }
        return true;
      }
    }
    if (completeUser.memberRole === "ADMIN" || completeUser.role === "ADMIN") {
      return true;
    }
    const teamMemberData = localStorage.getItem("team_member_data");
    if (teamMemberData) {
      try {
        const parsed = JSON.parse(teamMemberData);
        if (parsed.role === "ADMIN" || parsed.memberRole === "ADMIN" || parsed.role === "TEAM_ADMIN") {
          return true;
        }
      } catch (e) {
        console.warn("Failed to parse team member data for permissions check:", e);
      }
    }
    if (completeUser.memberRole === "OWNER" || completeUser.role === "OWNER" || String(completeUser.memberRole).includes("OWNER")) {
      return true;
    }
    if (completeUser.role === "SUPERADMIN") {
      return true;
    }
    if (((_d2 = completeUser.subscription) == null ? void 0 : _d2.plan) && ["BASIC", "PRO", "ENTERPRISE"].includes(completeUser.subscription.plan)) {
      return true;
    }
    if (completeUser.subscription) {
      return true;
    }
    return false;
  }, [completeUser, isTeamMember]);
  const [projects, setProjects] = reactExports.useState([]);
  const [loading, setLocalLoading] = reactExports.useState(true);
  const [datasetCountsLoading, setDatasetCountsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [tab, setTab] = reactExports.useState(0);
  const [showCreateDialog, setShowCreateDialog] = reactExports.useState(false);
  const [showLaunchDialog, setShowLaunchDialog] = reactExports.useState(false);
  const [selectedProject, setSelectedProject] = reactExports.useState(null);
  reactExports.useEffect(() => {
    console.log("🔍 DashboardCloudProjectsBridge - selectedProject changed:", selectedProject == null ? void 0 : selectedProject.name, "open:", !!selectedProject);
  }, [selectedProject]);
  const [showCollectionWizard, setShowCollectionWizard] = reactExports.useState(false);
  const [projectDatasets, setProjectDatasets] = reactExports.useState([]);
  const [datasetsLoading, setDatasetsLoading] = reactExports.useState(false);
  const [availableDatasets, setAvailableDatasets] = reactExports.useState([]);
  const [organizationDatasets, setOrganizationDatasets] = reactExports.useState([]);
  const [organizationDatasetsLoading, setOrganizationDatasetsLoading] = reactExports.useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = reactExports.useState("");
  const [datasetBackendFilter, setDatasetBackendFilter] = reactExports.useState("all");
  const [datasetSearch, setDatasetSearch] = reactExports.useState("");
  const [projectDatasetCounts, setProjectDatasetCounts] = reactExports.useState({});
  const [uploading, setUploading] = reactExports.useState(false);
  const [uploadError, setUploadError] = reactExports.useState(null);
  const [uploadProgress, setUploadProgress] = reactExports.useState(0);
  const [showCreateDatasetWizard, setShowCreateDatasetWizard] = reactExports.useState(false);
  const [datasetWizardAssignToProject, setDatasetWizardAssignToProject] = reactExports.useState(null);
  const [showDatasetManagementDialog, setShowDatasetManagementDialog] = reactExports.useState(false);
  const [showDatasetInsightsDialog, setShowDatasetInsightsDialog] = reactExports.useState(false);
  const [datasetAnalysis, setDatasetAnalysis] = reactExports.useState(null);
  const [loadingDatasetAnalysis, setLoadingDatasetAnalysis] = reactExports.useState(false);
  const [showEditDatasetDialog, setShowEditDatasetDialog] = reactExports.useState(false);
  const [datasetToEdit, setDatasetToEdit] = reactExports.useState(null);
  const [selectedDatasetForManagement, setSelectedDatasetForManagement] = reactExports.useState(null);
  const [showDatasetCollectionsDialog, setShowDatasetCollectionsDialog] = reactExports.useState(false);
  const [showRoleManagementDialog, setShowRoleManagementDialog] = reactExports.useState(false);
  const [showTeamRoleWizard, setShowTeamRoleWizard] = reactExports.useState(false);
  const [projectTeamMembers, setProjectTeamMembers] = reactExports.useState([]);
  const [availableTeamMembers, setAvailableTeamMembers] = reactExports.useState([]);
  const [teamMembersLoading, setTeamMembersLoading] = reactExports.useState(false);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = reactExports.useState("");
  const [selectedTeamMemberRole, setSelectedTeamMemberRole] = reactExports.useState("");
  const [availableRoles, setAvailableRoles] = reactExports.useState([]);
  const [rolesLoading, setRolesLoading] = reactExports.useState(false);
  const [teamMemberSearch, setTeamMemberSearch] = reactExports.useState("");
  const [showAddTeamMemberDialog, setShowAddTeamMemberDialog] = reactExports.useState(false);
  const [addTeamMemberLoading, setAddTeamMemberLoading] = reactExports.useState(false);
  const [addTeamMemberError, setAddTeamMemberError] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [page, setPage] = reactExports.useState(0);
  const [rowsPerPage, setRowsPerPage] = reactExports.useState(10);
  const [showInfoPopover, setShowInfoPopover] = reactExports.useState(false);
  const [infoPopoverAnchor, setInfoPopoverAnchor] = reactExports.useState(null);
  const [orderBy, setOrderBy] = reactExports.useState("lastAccessedAt");
  const [order, setOrder] = reactExports.useState("desc");
  const [projectTeamMemberCounts, setProjectTeamMemberCounts] = reactExports.useState({});
  const [projectStatusUpdating, setProjectStatusUpdating] = reactExports.useState({});
  const [actionMenuAnchor, setActionMenuAnchor] = reactExports.useState({});
  const [actionsDropdownAnchor, setActionsDropdownAnchor] = reactExports.useState(null);
  const loadDatasetsForProject = reactExports.useCallback((project) => __async(void 0, null, function* () {
    try {
      setDatasetsLoading(true);
      console.log("🔍 [DashboardCloudProjectsBridge] Loading datasets for project:", project.id);
      const items = yield cloudProjectIntegration.getProjectDatasets(project.id);
      console.log("✅ [DashboardCloudProjectsBridge] Loaded assigned datasets:", items);
      setProjectDatasets(items);
      setProjectDatasetCounts((prev) => __spreadProps(__spreadValues({}, prev), { [project.id]: items.length }));
      try {
        const all = yield cloudProjectIntegration.listDatasets({
          backend: datasetBackendFilter === "all" ? void 0 : datasetBackendFilter,
          query: datasetSearch || void 0
        });
        console.log("✅ [DashboardCloudProjectsBridge] Loaded available datasets:", all);
        console.log("🔍 [DashboardCloudProjectsBridge] === DATASET DEBUG INFO ===");
        all.forEach((ds, index) => {
          var _a2;
          console.log(`🔍 [DashboardCloudProjectsBridge] Dataset ${index}:`, {
            id: ds.id,
            name: ds.name,
            organizationId: ds.organizationId,
            storage: ds.storage,
            idType: typeof ds.id,
            idLength: (_a2 = ds.id) == null ? void 0 : _a2.length,
            fullDataset: ds
          });
        });
        console.log("🔍 [DashboardCloudProjectsBridge] === END DATASET DEBUG ===");
        const invalidDatasets = all.filter((ds) => !ds.id || typeof ds.id !== "string" || ds.id.trim() === "");
        if (invalidDatasets.length > 0) {
          console.warn("⚠️ [DashboardCloudProjectsBridge] Found datasets with invalid IDs:", invalidDatasets);
        }
        const dataset001 = all.find((ds) => ds.id === "dataset-001");
        if (!dataset001) {
          console.warn("⚠️ [DashboardCloudProjectsBridge] dataset-001 NOT found in available datasets!");
          console.log("🔍 [DashboardCloudProjectsBridge] Available dataset IDs:", all.map((ds) => ds.id));
        } else {
          console.log("✅ [DashboardCloudProjectsBridge] dataset-001 found:", dataset001);
        }
        const labeled = all.map((ds) => {
          var _a2;
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
            __label: `${ds.name} ${getBackendLabel((_a2 = ds.storage) == null ? void 0 : _a2.backend)}`
          });
        });
        if (selectedDatasetId && !labeled.find((ds) => ds.id === selectedDatasetId)) {
          console.warn("⚠️ [DashboardCloudProjectsBridge] Clearing invalid selected dataset:", selectedDatasetId);
          setSelectedDatasetId("");
        }
        setAvailableDatasets(labeled);
      } catch (datasetError) {
        console.warn("⚠️ [DashboardCloudProjectsBridge] Failed to load available datasets, using empty list:", datasetError);
        setAvailableDatasets([]);
      }
    } catch (e) {
      console.error("❌ [DashboardCloudProjectsBridge] Failed to load datasets for project:", e);
      setProjectDatasets([]);
      setAvailableDatasets([]);
    } finally {
      setDatasetsLoading(false);
    }
  }), [datasetBackendFilter, datasetSearch]);
  const loadTeamMembersForProject = reactExports.useCallback((project) => __async(void 0, null, function* () {
    try {
      setTeamMembersLoading(true);
      console.log("🔍 [DashboardCloudProjectsBridge] Loading team members for project:", project.id);
      try {
        const assignedMembers = yield cloudProjectIntegration.getProjectTeamMembers(project.id);
        console.log("✅ [DashboardCloudProjectsBridge] Loaded assigned team members:", assignedMembers);
        setProjectTeamMembers(assignedMembers);
      } catch (assignedError) {
        console.warn("⚠️ [DashboardCloudProjectsBridge] Failed to load assigned team members, using empty list:", assignedError);
        setProjectTeamMembers([]);
      }
      try {
        const allLicensedMembers = yield cloudProjectIntegration.getLicensedTeamMembers({
          search: teamMemberSearch || void 0,
          excludeProjectId: project.id
          // Exclude already assigned members
        });
        console.log("✅ [DashboardCloudProjectsBridge] Loaded available team members:", allLicensedMembers);
        setAvailableTeamMembers(allLicensedMembers);
      } catch (licensedError) {
        console.warn("⚠️ [DashboardCloudProjectsBridge] Failed to load licensed team members, using empty list:", licensedError);
        setAvailableTeamMembers([]);
      }
    } catch (e) {
      console.error("❌ [DashboardCloudProjectsBridge] Failed to load team members for project:", e);
      setProjectTeamMembers([]);
      setAvailableTeamMembers([]);
    } finally {
      setTeamMembersLoading(false);
    }
  }), [teamMemberSearch]);
  reactExports.useEffect(() => {
    if (selectedProject) {
      console.log("🔄 [DashboardCloudProjectsBridge] Project selected, loading data...");
      void loadDatasetsForProject(selectedProject);
      void loadTeamMembersForProject(selectedProject);
    }
  }, [selectedProject, loadDatasetsForProject, loadTeamMembersForProject]);
  reactExports.useEffect(() => {
    if (selectedProject && showAddTeamMemberDialog && !rolesLoading && availableRoles.length === 0) {
      const loadRoles = () => __async(void 0, null, function* () {
        try {
          setRolesLoading(true);
          console.log("🎭 [DashboardCloudProjectsBridge] Loading available roles for project:", selectedProject.id);
          const roles = yield projectRoleService.getAvailableRoles(selectedProject.id);
          console.log(`✅ [DashboardCloudProjectsBridge] Found ${(roles == null ? void 0 : roles.length) || 0} available roles`);
          setAvailableRoles(roles || []);
          if (roles && roles.length > 0) {
            const defaultRole = roles.find((role) => role.name === "DO_ER") || roles[0];
            setSelectedTeamMemberRole(defaultRole.id);
          }
        } catch (error2) {
          console.error("❌ [DashboardCloudProjectsBridge] Failed to load available roles:", error2);
          setAvailableRoles([]);
        } finally {
          setRolesLoading(false);
        }
      });
      loadRoles();
    }
  }, [selectedProject, showAddTeamMemberDialog, rolesLoading, availableRoles.length]);
  reactExports.useEffect(() => {
    loadProjects();
    const onCreated = (e) => {
      loadProjects();
    };
    window.addEventListener("project:created", onCreated);
    return () => window.removeEventListener("project:created", onCreated);
  }, []);
  const getComparator = (order2, orderBy2) => {
    return order2 === "desc" ? (a, b) => descendingComparator(a, b, orderBy2) : (a, b) => -descendingComparator(a, b, orderBy2);
  };
  const descendingComparator = (a, b, orderBy2) => {
    const aValue = a[orderBy2];
    const bValue = b[orderBy2];
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    if (bValue < aValue) {
      return -1;
    }
    if (bValue > aValue) {
      return 1;
    }
    return 0;
  };
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const filteredProjects = reactExports.useMemo(() => {
    let filtered = projects;
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = projects.filter((project) => project.name.toLowerCase().includes(searchLower) || project.description && project.description.toLowerCase().includes(searchLower) || project.storageBackend.toLowerCase().includes(searchLower) || project.applicationMode.toLowerCase().includes(searchLower));
    }
    return filtered.sort(getComparator(order, orderBy));
  }, [projects, searchQuery, order, orderBy]);
  reactExports.useEffect(() => {
    setPage(0);
  }, [searchQuery]);
  const tabFilteredProjects = reactExports.useMemo(() => {
    console.log("🔍 [DashboardCloudProjectsBridge] Filtering projects for tab:", tab);
    console.log("🔍 [DashboardCloudProjectsBridge] All filtered projects:", filteredProjects);
    const filtered = filteredProjects.filter((project) => {
      const isActiveTab = tab === 0;
      const shouldShow = isActiveTab ? project.isActive && !project.isArchived : project.isArchived;
      console.log(`🔍 [DashboardCloudProjectsBridge] Project "${project.name}":`, {
        isActive: project.isActive,
        isArchived: project.isArchived,
        isActiveTab,
        shouldShow
      });
      return shouldShow;
    });
    console.log("🔍 [DashboardCloudProjectsBridge] Filtered projects for display:", filtered);
    return filtered;
  }, [filteredProjects, tab]);
  const paginatedProjects = reactExports.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return tabFilteredProjects.slice(startIndex, startIndex + rowsPerPage);
  }, [tabFilteredProjects, page, rowsPerPage]);
  reactExports.useEffect(() => {
    if (selectedProject && showAddTeamMemberDialog) {
      const timeoutId = setTimeout(() => {
        console.log("🔄 [DashboardCloudProjectsBridge] Team member search changed, refreshing...");
        void loadTeamMembersForProject(selectedProject);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [teamMemberSearch, selectedProject, showAddTeamMemberDialog, loadTeamMembersForProject]);
  reactExports.useCallback((projectList) => __async(void 0, null, function* () {
    try {
      console.log("🔍 [DashboardCloudProjectsBridge] Loading team member counts for all projects in batch...");
      const projectIds = projectList.map((project) => project.id);
      const teamMemberBatch = yield cloudProjectIntegration.getProjectTeamMembersBatch(projectIds).catch((error2) => {
        console.warn("⚠️ [DashboardCloudProjectsBridge] Failed to load team members in batch, falling back to individual calls:", error2);
        return {};
      });
      const newCounts = {};
      projectIds.forEach((projectId) => {
        var _a2;
        newCounts[projectId] = ((_a2 = teamMemberBatch[projectId]) == null ? void 0 : _a2.length) || 0;
      });
      setProjectTeamMemberCounts(newCounts);
      console.log("✅ [DashboardCloudProjectsBridge] Loaded team member counts for all projects:", newCounts);
    } catch (error2) {
      console.error("❌ [DashboardCloudProjectsBridge] Failed to load team member counts for all projects:", error2);
    }
  }), []);
  const loadDatasetCountsForAllProjects = reactExports.useCallback((projectList) => __async(void 0, null, function* () {
    try {
      console.log("🔍 [DashboardCloudProjectsBridge] Loading dataset counts for all projects...");
      setDatasetCountsLoading(true);
      const datasetCountPromises = projectList.map((project) => __async(void 0, null, function* () {
        try {
          const datasets = yield cloudProjectIntegration.getProjectDatasets(project.id);
          console.log(`🔍 [DashboardCloudProjectsBridge] Project "${project.name}" has ${datasets.length} assigned datasets`);
          return { projectId: project.id, count: datasets.length, success: true };
        } catch (error2) {
          console.warn(`⚠️ [DashboardCloudProjectsBridge] Failed to load datasets for project ${project.id}:`, error2);
          return { projectId: project.id, count: 0, success: false };
        }
      }));
      const datasetCounts = yield Promise.all(datasetCountPromises);
      const newCounts = {};
      let successCount = 0;
      datasetCounts.forEach(({ projectId, count, success }) => {
        newCounts[projectId] = count;
        if (success) successCount++;
      });
      setProjectDatasetCounts((prev) => __spreadValues(__spreadValues({}, prev), newCounts));
      console.log(`✅ [DashboardCloudProjectsBridge] Updated dataset counts for ${successCount}/${projectList.length} projects:`, newCounts);
    } catch (error2) {
      console.error("❌ [DashboardCloudProjectsBridge] Failed to load dataset counts for all projects:", error2);
    } finally {
      setDatasetCountsLoading(false);
    }
  }), []);
  const loadProjects = () => __async(void 0, null, function* () {
    try {
      setError(null);
      setLocalLoading(true);
      if (isTeamMember()) {
        try {
          console.log("🔍 [DashboardCloudProjectsBridge] Web-only mode: Fetching projects from Firestore...");
          const currentUser = user;
          if (!(currentUser == null ? void 0 : currentUser.organizationId)) {
            console.warn("⚠️ [DashboardCloudProjectsBridge] No organization ID found for user");
            throw new Error("No organization found for user");
          }
          const { db: db2 } = yield __vitePreload(() => __async(void 0, null, function* () {
            const { db: db3 } = yield import("./firebase-CshsU33q.js").then((n) => n.f);
            return { db: db3 };
          }), true ? __vite__mapDeps([8,1,2,3,4,5,7,6,9]) : void 0);
          const { collection: collection2, query: query2, where: where2, getDocs: getDocs2 } = yield __vitePreload(() => __async(void 0, null, function* () {
            const { collection: collection3, query: query3, where: where3, getDocs: getDocs3 } = yield import("./index.esm-CjtNHFZy.js");
            return { collection: collection3, query: query3, where: where3, getDocs: getDocs3 };
          }), true ? __vite__mapDeps([6,7]) : void 0);
          const projectsQuery = query2(
            collection2(db2, "projects"),
            where2("organizationId", "==", currentUser.organizationId)
          );
          const projectsSnapshot = yield getDocs2(projectsQuery);
          console.log(`🔍 [DashboardCloudProjectsBridge] Found ${projectsSnapshot.size} projects for organization: ${currentUser.organizationId}`);
          const teamMemberProjects = projectsSnapshot.docs.map((doc2) => __spreadProps(__spreadValues({
            id: doc2.id,
            projectId: doc2.id
          }, doc2.data()), {
            // Ensure required fields
            name: doc2.data().name || doc2.data().projectName || "Unnamed Project",
            projectName: doc2.data().name || doc2.data().projectName || "Unnamed Project",
            description: doc2.data().description || "",
            role: "MEMBER",
            // Default role for team members
            teamMemberRole: "MEMBER",
            isActive: doc2.data().isActive !== false,
            isArchived: doc2.data().isArchived === true,
            assignedAt: doc2.data().createdAt || (/* @__PURE__ */ new Date()).toISOString(),
            lastAccessed: doc2.data().lastAccessedAt || doc2.data().createdAt || (/* @__PURE__ */ new Date()).toISOString(),
            ownerName: doc2.data().ownerName || "Organization Owner"
          }));
          console.log("🔍 [DashboardCloudProjectsBridge] Team member projects from Firestore:", teamMemberProjects);
          const transformedProjects = teamMemberProjects.map((project) => {
            console.log("🔍 [DashboardCloudProjectsBridge] Transforming project:", project);
            const teamMemberCount = 1;
            const datasetCount = 0;
            const projectStatus = getProjectStatus(project, teamMemberCount, datasetCount);
            const collaborationEnabled = shouldEnableCollaboration(project, teamMemberCount);
            const completionPercentage = calculateCompletionPercentage(project, teamMemberCount, datasetCount);
            const transformed = {
              id: project.projectId || project.id,
              name: project.projectName || project.name || "Unnamed Project",
              description: project.description || "",
              applicationMode: "shared_network",
              // Team members always use network mode
              storageBackend: "firestore",
              // Always Firestore in webonly mode
              lastAccessedAt: project.lastAccessed || project.assignedAt || (/* @__PURE__ */ new Date()).toISOString(),
              isActive: projectStatus !== "archived" && projectStatus !== "paused",
              isArchived: projectStatus === "archived",
              allowCollaboration: collaborationEnabled,
              maxCollaborators: project.maxCollaborators || getCollaborationLimit(completeUser),
              realTimeEnabled: collaborationEnabled,
              // Enhanced properties
              status: projectStatus,
              completionPercentage,
              lastActivityAt: project.lastAccessed || project.assignedAt || (/* @__PURE__ */ new Date()).toISOString(),
              teamMemberCount,
              collaborationEnabled,
              settings: {
                autoEnableCollaboration: true,
                completionCriteria: {
                  requiresDatasets: true,
                  requiresTeamMembers: true,
                  minimumActivity: 1
                }
              },
              // Team member specific fields
              teamMemberRole: project.role || project.teamMemberRole || "MEMBER",
              role: project.role || project.teamMemberRole || "MEMBER",
              // Ensure both fields are set
              assignedAt: project.assignedAt,
              projectOwner: project.ownerName || "Organization Owner"
            };
            console.log("🔍 [DashboardCloudProjectsBridge] Transformed to:", transformed);
            return transformed;
          });
          setProjects(transformedProjects);
          loadDatasetCountsForAllProjects(transformedProjects).catch((error2) => {
            console.warn("⚠️ [DashboardCloudProjectsBridge] Background dataset count loading failed:", error2);
          });
        } catch (teamMemberError) {
          console.error("Failed to fetch team member projects:", teamMemberError);
          const teamMemberData = localStorage.getItem("team_member_data");
          if (teamMemberData) {
            try {
              const parsed = JSON.parse(teamMemberData);
              if (parsed.projectAccess && Array.isArray(parsed.projectAccess)) {
                const fallbackProjects = parsed.projectAccess.map((access) => {
                  const teamMemberCount = 1;
                  const datasetCount = 0;
                  const projectStatus = getProjectStatus(access, teamMemberCount, datasetCount);
                  const collaborationEnabled = shouldEnableCollaboration(access, teamMemberCount);
                  const completionPercentage = calculateCompletionPercentage(access, teamMemberCount, datasetCount);
                  return {
                    id: access.projectId,
                    name: access.projectName || "Unnamed Project",
                    description: access.description || "",
                    applicationMode: "shared_network",
                    storageBackend: "firestore",
                    lastAccessedAt: access.lastAccessed || (/* @__PURE__ */ new Date()).toISOString(),
                    isActive: projectStatus !== "archived" && projectStatus !== "paused",
                    isArchived: projectStatus === "archived",
                    allowCollaboration: collaborationEnabled,
                    maxCollaborators: getCollaborationLimit(completeUser),
                    realTimeEnabled: collaborationEnabled,
                    // Enhanced properties
                    status: projectStatus,
                    completionPercentage,
                    lastActivityAt: access.lastAccessed || (/* @__PURE__ */ new Date()).toISOString(),
                    teamMemberCount,
                    collaborationEnabled,
                    settings: {
                      autoEnableCollaboration: true,
                      completionCriteria: {
                        requiresDatasets: true,
                        requiresTeamMembers: true,
                        minimumActivity: 1
                      }
                    },
                    teamMemberRole: access.role || "MEMBER",
                    assignedAt: access.assignedAt,
                    projectOwner: "Organization Owner"
                  };
                });
                setProjects(fallbackProjects);
                loadDatasetCountsForAllProjects(fallbackProjects).catch((error2) => {
                  console.warn("⚠️ [DashboardCloudProjectsBridge] Background dataset count loading failed for fallback projects:", error2);
                });
                return;
              }
            } catch (parseError) {
              console.warn("Failed to parse fallback team member data:", parseError);
            }
          }
          const allKeys = Object.keys(localStorage);
          const teamMemberKeys = allKeys.filter(
            (key) => key.includes("team") || key.includes("member") || key.includes("project") || key.includes("assignment")
          );
          for (const key of teamMemberKeys) {
            try {
              const value = localStorage.getItem(key);
              if (value) {
                const parsed = JSON.parse(value);
                if (parsed.projects || parsed.projectAccess || parsed.assignments) {
                }
              }
            } catch (e) {
            }
          }
          setError("Unable to load your assigned projects. Please contact your administrator or try again later.");
          setProjects([]);
        }
      } else {
        console.log("🔍 [DashboardCloudProjectsBridge] Loading projects for account owner...");
        const serviceProjects = yield cloudProjectIntegration.getProjects();
        console.log("🔍 [DashboardCloudProjectsBridge] Raw service projects:", serviceProjects);
        console.log("🔍 [DashboardCloudProjectsBridge] Service projects count:", serviceProjects.length);
        console.log("🔍 [DashboardCloudProjectsBridge] Loading team member and dataset counts in batch...");
        const projectIds = serviceProjects.map((project) => project.id);
        const [teamMemberBatch, datasetCounts] = yield Promise.all([
          // Use batch method for team members
          cloudProjectIntegration.getProjectTeamMembersBatch(projectIds).catch((error2) => {
            console.warn("⚠️ [DashboardCloudProjectsBridge] Failed to load team members in batch, falling back to individual calls:", error2);
            return {};
          }),
          // Keep individual calls for datasets (already optimized)
          Promise.all(serviceProjects.map((project) => __async(void 0, null, function* () {
            try {
              const datasets = yield cloudProjectIntegration.getProjectDatasets(project.id);
              return { projectId: project.id, count: datasets.length };
            } catch (error2) {
              console.warn(`⚠️ [DashboardCloudProjectsBridge] Failed to load datasets for project ${project.id}:`, error2);
              return { projectId: project.id, count: 0 };
            }
          })))
        ]);
        const teamMemberCounts = projectIds.map((projectId) => {
          var _a2;
          return {
            projectId,
            count: ((_a2 = teamMemberBatch[projectId]) == null ? void 0 : _a2.length) || 0
          };
        });
        const teamMemberCountMap = {};
        const datasetCountMap = {};
        teamMemberCounts.forEach(({ projectId, count }) => {
          teamMemberCountMap[projectId] = count;
        });
        datasetCounts.forEach(({ projectId, count }) => {
          datasetCountMap[projectId] = count;
        });
        setProjectTeamMemberCounts(teamMemberCountMap);
        setProjectDatasetCounts(datasetCountMap);
        const cloudProjects = serviceProjects.map(
          (project) => mapServiceProjectToComponentProject(
            project,
            teamMemberCountMap[project.id] || 0,
            datasetCountMap[project.id] || 0,
            completeUser
          )
        );
        console.log("🔍 [DashboardCloudProjectsBridge] Mapped cloud projects with enhanced data:", cloudProjects);
        console.log("🔍 [DashboardCloudProjectsBridge] Mapped projects count:", cloudProjects.length);
        setProjects(cloudProjects);
        console.log("✅ [DashboardCloudProjectsBridge] Projects set in state with enhanced status and collaboration logic");
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError((err == null ? void 0 : err.message) || "Failed to load projects");
      setProjects([]);
    } finally {
      setLocalLoading(false);
    }
  });
  const handleLaunchWeb = () => __async(void 0, null, function* () {
    try {
      const url = "https://backbone-client.web.app/";
      let opened = false;
      try {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        opened = true;
      } catch (e) {
      }
      if (!opened) {
        window.location.href = url;
      }
    } catch (e) {
      console.error("Failed to launch web app", e);
      setError("Unable to open web app. Please try again.");
    }
  });
  const handleLaunchDesktop = () => {
    try {
      const scheme = "dashboardv14";
      const action = "open-app";
      const url = `${scheme}://${action}`;
      window.location.href = url;
    } catch (e) {
      console.error("Failed to open desktop deep link", e);
      setError("Unable to open Desktop app. Please ensure it is installed.");
    }
  };
  const handleCreateProject = () => {
    setShowCreateDialog(true);
  };
  const handleCreateCollection = () => {
    setShowCollectionWizard(true);
  };
  const handleCollectionCreated = (collectionName, template) => {
    console.log(`✅ Collection '${collectionName}' created successfully`);
    loadProjects();
    setSelectedProject(null);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleActionMenuOpen = (event, projectId) => {
    setActionMenuAnchor((prev) => __spreadProps(__spreadValues({}, prev), {
      [projectId]: event.currentTarget
    }));
  };
  const handleActionMenuClose = (projectId) => {
    setActionMenuAnchor((prev) => __spreadProps(__spreadValues({}, prev), {
      [projectId]: null
    }));
  };
  const handleActionsDropdownOpen = (event) => {
    setActionsDropdownAnchor(event.currentTarget);
  };
  const handleActionsDropdownClose = () => {
    setActionsDropdownAnchor(null);
  };
  const handleInfoPopoverOpen = (event) => {
    setInfoPopoverAnchor(event.currentTarget);
    setShowInfoPopover(true);
  };
  const handleInfoPopoverClose = () => {
    setShowInfoPopover(false);
    setInfoPopoverAnchor(null);
  };
  const handleProjectCreated = (projectId) => __async(void 0, null, function* () {
    setShowCreateDialog(false);
    yield loadProjects();
  });
  const updateProjectStatus = reactExports.useCallback((projectId, newStatus) => __async(void 0, null, function* () {
    try {
      setProjectStatusUpdating((prev) => __spreadProps(__spreadValues({}, prev), { [projectId]: true }));
      let mappedStatus;
      switch (newStatus) {
        case "draft":
          mappedStatus = "draft";
          break;
        case "active":
        case "in-progress":
        case "completed":
          mappedStatus = "active";
          break;
        case "archived":
        case "paused":
          mappedStatus = "archived";
          break;
        default:
          mappedStatus = "active";
      }
      yield cloudProjectIntegration.updateProject(projectId, {
        status: mappedStatus,
        // Cast to any to work with the service interface
        lastActivityAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: mappedStatus !== "archived",
        isArchived: mappedStatus === "archived",
        // Store the extended status in metadata for UI purposes
        metadata: {
          extendedStatus: newStatus,
          statusUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      yield loadProjects();
      console.log(`✅ [DashboardCloudProjectsBridge] Project ${projectId} status updated to ${newStatus} (mapped to ${mappedStatus})`);
    } catch (error2) {
      console.error(`❌ [DashboardCloudProjectsBridge] Failed to update project status:`, error2);
      setError(`Failed to update project status: ${error2 instanceof Error ? error2.message : "Unknown error"}`);
    } finally {
      setProjectStatusUpdating((prev) => __spreadProps(__spreadValues({}, prev), { [projectId]: false }));
    }
  }), []);
  const toggleProjectCollaboration = reactExports.useCallback((projectId, enable) => __async(void 0, null, function* () {
    try {
      setProjectStatusUpdating((prev) => __spreadProps(__spreadValues({}, prev), { [projectId]: true }));
      const maxCollaborators = getCollaborationLimit(completeUser);
      yield cloudProjectIntegration.updateProject(projectId, {
        settings: {
          allowCollaboration: enable,
          autoEnableCollaboration: enable,
          realTimeEnabled: enable,
          maxCollaborators: enable ? maxCollaborators : 1
        },
        allowCollaboration: enable,
        collaborationEnabled: enable,
        realTimeEnabled: enable,
        maxCollaborators: enable ? maxCollaborators : 1,
        lastActivityAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      yield loadProjects();
      console.log(`✅ [DashboardCloudProjectsBridge] Project ${projectId} collaboration ${enable ? "enabled" : "disabled"}`);
    } catch (error2) {
      console.error(`❌ [DashboardCloudProjectsBridge] Failed to toggle collaboration:`, error2);
      setError(`Failed to update collaboration settings: ${error2 instanceof Error ? error2.message : "Unknown error"}`);
    } finally {
      setProjectStatusUpdating((prev) => __spreadProps(__spreadValues({}, prev), { [projectId]: false }));
    }
  }), []);
  const getStorageIcon = (storageBackend) => {
    switch (storageBackend) {
      case "firestore":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {});
      case "gcs":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {});
    }
  };
  const getModeIcon = (mode) => {
    return mode === "standalone" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ComputerIcon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIcon, {});
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
  const statusCounts = countProjectsByStatus(projects, projectTeamMemberCounts, projectDatasetCounts);
  const activeProjects = projects.filter((p) => {
    const teamMemberCount = projectTeamMemberCounts[p.id] || 0;
    const datasetCount = projectDatasetCounts[p.id] || 0;
    const status = getProjectStatus(p, teamMemberCount, datasetCount);
    return status === "active" || status === "in-progress";
  });
  const archivedProjects = projects.filter((p) => {
    const teamMemberCount = projectTeamMemberCounts[p.id] || 0;
    const datasetCount = projectDatasetCounts[p.id] || 0;
    const status = getProjectStatus(p, teamMemberCount, datasetCount);
    return status === "archived";
  });
  const analyticsData = {
    totalProjects: projects.length,
    activeProjects: statusCounts.active + statusCounts["in-progress"],
    archivedProjects: statusCounts.archived,
    collaborativeProjects: projects.filter((p) => p.allowCollaboration).length,
    totalDatasets: Object.values(projectDatasetCounts).reduce((sum, count) => sum + count, 0),
    storageBreakdown: {
      firestore: projects.filter((p) => p.storageBackend === "firestore").length,
      gcs: projects.filter((p) => p.storageBackend === "gcs").length,
      s3: projects.filter((p) => p.storageBackend === "s3").length,
      local: projects.filter((p) => p.storageBackend === "local").length,
      azure: projects.filter((p) => p.storageBackend === "azure-blob").length
    },
    modeBreakdown: {
      standalone: projects.filter((p) => p.applicationMode === "standalone").length,
      network: projects.filter((p) => p.applicationMode === "shared_network").length
    }
  };
  const refreshDatasetCounts = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (projects.length > 0) {
      yield loadDatasetCountsForAllProjects(projects);
    }
  }), [projects, loadDatasetCountsForAllProjects]);
  const loadOrganizationDatasets = reactExports.useCallback(() => __async(void 0, null, function* () {
    try {
      setOrganizationDatasetsLoading(true);
      console.log("🔍 [DashboardCloudProjectsBridge] Loading organization datasets for management dialog...");
      const allDatasets = yield cloudProjectIntegration.getAllOrganizationDatasets();
      console.log("✅ [DashboardCloudProjectsBridge] Loaded organization datasets:", allDatasets);
      const labeled = allDatasets.map((ds) => {
        var _a2;
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
          __label: `${ds.name} ${getBackendLabel((_a2 = ds.storage) == null ? void 0 : _a2.backend)}`
        });
      });
      setOrganizationDatasets(labeled);
    } catch (error2) {
      console.error("❌ [DashboardCloudProjectsBridge] Failed to load organization datasets:", error2);
    } finally {
      setOrganizationDatasetsLoading(false);
    }
  }), []);
  reactExports.useEffect(() => {
    if (showDatasetManagementDialog) {
      loadOrganizationDatasets();
    }
  }, [showDatasetManagementDialog, loadOrganizationDatasets]);
  const loadDatasetAnalysis = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!(completeUser == null ? void 0 : completeUser.organizationId)) {
      console.warn("⚠️ [DashboardCloudProjectsBridge] No organization ID for dataset analysis");
      return;
    }
    setLoadingDatasetAnalysis(true);
    try {
      console.log("🔍 [DashboardCloudProjectsBridge] Loading dataset conflict analysis...");
      let allDatasets = organizationDatasets;
      if (allDatasets.length === 0) {
        console.log("🔄 [DashboardCloudProjectsBridge] Loading organization datasets for analysis...");
        allDatasets = yield cloudProjectIntegration.getAllOrganizationDatasets();
        allDatasets = allDatasets.map((ds) => {
          var _a2;
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
            __label: `${ds.name} ${getBackendLabel((_a2 = ds.storage) == null ? void 0 : _a2.backend)}`
          });
        });
      }
      console.log("📊 [DashboardCloudProjectsBridge] Analyzing datasets:", {
        totalDatasets: allDatasets.length,
        firestoreDatasets: allDatasets.filter((ds) => {
          var _a2;
          return ((_a2 = ds.storage) == null ? void 0 : _a2.backend) === "firestore";
        }).length,
        datasetsWithCollections: allDatasets.filter((ds) => {
          var _a2, _b2;
          return ((_b2 = (_a2 = ds.collectionAssignment) == null ? void 0 : _a2.selectedCollections) == null ? void 0 : _b2.length) > 0;
        }).length
      });
      const analysis = yield datasetConflictAnalyzer.analyzeOrganizationDatasets(
        completeUser.organizationId,
        allDatasets
      );
      setDatasetAnalysis(analysis);
      console.log("✅ [DashboardCloudProjectsBridge] Dataset analysis complete:", {
        datasets: analysis.totalDatasets,
        collections: analysis.totalCollections,
        overlaps: analysis.overlaps.length,
        healthScore: analysis.healthScore,
        recommendations: analysis.globalInsights.recommendations.length
      });
    } catch (error2) {
      console.error("❌ [DashboardCloudProjectsBridge] Failed to load dataset analysis:", error2);
      setDatasetAnalysis(null);
    } finally {
      setLoadingDatasetAnalysis(false);
    }
  }), [completeUser == null ? void 0 : completeUser.organizationId, organizationDatasets]);
  reactExports.useEffect(() => {
    if (showDatasetInsightsDialog) {
      loadDatasetAnalysis();
    }
  }, [showDatasetInsightsDialog, loadDatasetAnalysis]);
  const debugSubscriptionStatus = reactExports.useCallback(() => {
    if (!completeUser) {
      console.log("🔍 [DashboardCloudProjectsBridge] No user data available for subscription debug");
      return;
    }
    console.log("🔍 [DashboardCloudProjectsBridge] === SUBSCRIPTION DEBUG INFO ===");
    console.log("User ID:", completeUser.id);
    console.log("User Email:", completeUser.email);
    console.log("User Role:", completeUser.role);
    console.log("Member Role:", completeUser.memberRole);
    console.log("Is Team Member:", completeUser.isTeamMember);
    console.log("Organization ID:", completeUser.organizationId);
    console.log("Subscription Data:", completeUser.subscription);
    console.log("Demo User Status:", completeUser.isDemoUser);
    console.log("LocalStorage Demo Status:", localStorage.getItem("demo_user_status"));
    console.log("LocalStorage Subscription:", localStorage.getItem("user_subscription"));
    console.log("LocalStorage Billing:", localStorage.getItem("user_billing"));
    console.log("==========================================");
  }, [completeUser]);
  reactExports.useEffect(() => {
    if (completeUser && completeUser.id) {
      const debugKey = `subscription_debug_${completeUser.id}`;
      const hasLogged = sessionStorage.getItem(debugKey);
      if (!hasLogged) {
        debugSubscriptionStatus();
        sessionStorage.setItem(debugKey, "true");
      }
    }
  }, [completeUser, debugSubscriptionStatus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { py: 4, px: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", component: "h1", fontWeight: "bold", gutterBottom: true, children: isTeamMember() ? "My Assigned Projects" : "Cloud Projects" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: isTeamMember() ? canCreateProjects ? "Manage and collaborate on projects. As an admin, you can create new projects and access assigned ones." : "Access and collaborate on projects assigned to you by your team administrator" : "Manage your projects with Firebase and Google Cloud Storage integration. Available for all license tiers: Basic, Pro, and Enterprise." }),
        isTeamMember() && completeUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {}),
              label: `Team Member - ${completeUser.memberRole || "MEMBER"}`,
              color: "primary",
              size: "small",
              sx: {
                backgroundColor: "rgba(0, 212, 255, 0.1)",
                border: "1px solid rgba(0, 212, 255, 0.3)",
                color: "primary.main"
              }
            }
          ),
          completeUser.organizationId && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GroupAddIcon, {}),
              label: "Organization Access",
              color: "secondary",
              size: "small",
              sx: {
                backgroundColor: "rgba(156, 39, 176, 0.1)",
                border: "1px solid rgba(156, 39, 176, 0.3)",
                color: "secondary.main"
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Project Management Guide", arrow: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        IconButton,
        {
          onClick: handleInfoPopoverOpen,
          sx: {
            backgroundColor: "rgba(0, 212, 255, 0.1)",
            border: "1px solid rgba(0, 212, 255, 0.3)",
            color: "primary.main",
            "&:hover": {
              backgroundColor: "rgba(0, 212, 255, 0.2)",
              borderColor: "rgba(0, 212, 255, 0.5)",
              transform: "scale(1.05)"
            },
            transition: "all 0.2s ease-in-out"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(HelpIcon, {})
        }
      ) })
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [1, 2, 3, 4].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 60, height: 32, bgcolor: "grey.300", borderRadius: 1, mb: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 100, height: 16, bgcolor: "grey.200", borderRadius: 1 } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 40, height: 40, bgcolor: "grey.200", borderRadius: "50%" } })
    ] }) }) }) }, item)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        height: "100%",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: "bold", children: analyticsData.totalProjects }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.9 }, children: isTeamMember() ? "Assigned Projects" : "Total Projects" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, { sx: { fontSize: 40, opacity: 0.8 } })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            color: "white",
            height: "100%",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 25px rgba(17, 153, 142, 0.3)"
            }
          },
          onClick: () => setTab(0),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: "bold", children: analyticsData.activeProjects }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.9 }, children: "Active Projects" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { sx: { fontSize: 40, opacity: 0.8 } })
          ] }) })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          sx: {
            background: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
            color: "white",
            height: "100%",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 25px rgba(252, 74, 26, 0.3)"
            }
          },
          onClick: () => setTab(1),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: "bold", children: analyticsData.archivedProjects }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.9 }, children: "Archived Projects" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveIcon, { sx: { fontSize: 40, opacity: 0.8 } })
          ] }) })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        color: "white",
        height: "100%",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(79, 172, 254, 0.3)"
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: "bold", children: isTeamMember() && completeUser ? (completeUser.memberRole || "MEMBER").toUpperCase() : analyticsData.collaborativeProjects }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { opacity: 0.9 }, children: isTeamMember() ? "Your Role" : "Collaborative" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Group, { sx: { fontSize: 40, opacity: 0.8 } })
      ] }) }) }) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [1, 2].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, lg: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 24, height: 24, bgcolor: "grey.300", borderRadius: "50%" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 200, height: 20, bgcolor: "grey.300", borderRadius: 1 } })
      ] }),
      [1, 2, 3].map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 20, height: 20, bgcolor: "grey.200", borderRadius: "50%" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 80, height: 16, bgcolor: "grey.200", borderRadius: 1 } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { width: 40, height: 24, bgcolor: "grey.200", borderRadius: 1 } })
      ] }, row))
    ] }) }) }, item)) }) : null,
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 4 }, onClose: () => setError(null), children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        {
          value: tab,
          onChange: (_, newValue) => setTab(newValue),
          sx: { borderBottom: 1, borderColor: "divider" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: `Active Projects (${activeProjects.length})` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: `Archived (${archivedProjects.length})` })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        !canCreateProjects && completeUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          backgroundColor: "warning.light",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "warning.main"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { color: "warning" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "warning.dark", children: isTeamMember() ? "Contact your team administrator to create projects" : "Active subscription required to create projects" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertIcon, {}),
            onClick: handleActionsDropdownOpen,
            sx: {
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "white",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 6px 20px rgba(79, 70, 229, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #4338ca, #6d28d9)",
                boxShadow: "0 8px 25px rgba(79, 70, 229, 0.5)",
                transform: "translateY(-2px)"
              }
            },
            children: "Actions"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Menu,
          {
            anchorEl: actionsDropdownAnchor,
            open: Boolean(actionsDropdownAnchor),
            onClose: handleActionsDropdownClose,
            PaperProps: {
              sx: {
                backgroundColor: "rgba(30, 30, 30, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 2,
                minWidth: 200,
                "& .MuiMenuItem-root": {
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }
                }
              }
            },
            children: [
              canCreateProjects && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                MenuItem,
                {
                  onClick: () => {
                    handleActionsDropdownClose();
                    console.log("🚀 [DashboardCloudProjectsBridge] Create Project button clicked");
                    handleCreateProject();
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, { sx: { mr: 2 } }),
                    "Create Project"
                  ]
                }
              ),
              canCreateProjects && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                MenuItem,
                {
                  onClick: () => {
                    handleActionsDropdownClose();
                    console.log("🧙‍♂️ [DashboardCloudProjectsBridge] Create Collection button clicked");
                    handleCreateCollection();
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExtensionIcon, { sx: { mr: 2 } }),
                    "Create Collection"
                  ]
                }
              ),
              canCreateProjects && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                MenuItem,
                {
                  onClick: () => {
                    handleActionsDropdownClose();
                    console.log("🚀 [DashboardCloudProjectsBridge] Create Dataset button clicked");
                    setDatasetWizardAssignToProject(null);
                    setShowCreateDatasetWizard(true);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, { sx: { mr: 2 } }),
                    "Create Dataset"
                  ]
                }
              ),
              canCreateProjects && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                MenuItem,
                {
                  onClick: () => {
                    handleActionsDropdownClose();
                    console.log("🚀 [DashboardCloudProjectsBridge] Manage Datasets button clicked");
                    setShowDatasetManagementDialog(true);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { sx: { mr: 2 } }),
                    "Manage Datasets"
                  ]
                }
              ),
              canCreateProjects && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                MenuItem,
                {
                  onClick: () => {
                    handleActionsDropdownClose();
                    console.log("🚀 [DashboardCloudProjectsBridge] Dataset Insights button clicked");
                    setShowDatasetInsightsDialog(true);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, { sx: { mr: 2 } }),
                    "Dataset Insights"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { disabled: true, sx: { borderTop: "1px solid rgba(255, 255, 255, 0.1)", my: 1 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                MenuItem,
                {
                  onClick: () => {
                    handleActionsDropdownClose();
                    handleLaunchWeb();
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Launch, { sx: { mr: 2 } }),
                    "Launch Web App"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                MenuItem,
                {
                  onClick: () => {
                    handleActionsDropdownClose();
                    handleLaunchDesktop();
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Launch, { sx: { mr: 2 } }),
                    "Launch Desktop App"
                  ]
                }
              )
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4, display: "flex", gap: 3, alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          placeholder: "Search projects by name, description, storage backend, or mode...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          InputProps: {
            startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) })
          },
          sx: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: "primary.main"
              }
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          onClick: loadProjects,
          sx: { minWidth: "auto", px: 3 },
          title: "Refresh projects list",
          children: "Refresh"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      isTeamMember() && projects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3, p: 3, backgroundColor: "rgba(0, 212, 255, 0.1)", borderRadius: 2, border: "1px solid rgba(0, 212, 255, 0.3)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, { sx: { color: "primary.main", fontSize: 24 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "primary.main", sx: { fontWeight: 600, mb: 1 }, children: "Team Member Access" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
            "You have access to ",
            projects.length,
            " project",
            projects.length !== 1 ? "s" : "",
            " assigned by your team administrator. Click on any project to view details and launch the application."
          ] })
        ] })
      ] }) }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { textAlign: "center", py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Loading projects..." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 2, p: 2, backgroundColor: "primary.light", borderRadius: 2, color: "white" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
            "Found ",
            filteredProjects.filter(
              (project) => tab === 0 ? project.isActive && !project.isArchived : project.isArchived
            ).length,
            ' projects matching "',
            searchQuery,
            '"'
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "small",
              variant: "text",
              onClick: () => setSearchQuery(""),
              sx: { color: "white", textDecoration: "underline" },
              children: "Clear Search"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableContainer,
          {
            component: Paper,
            sx: {
              borderRadius: 2,
              overflow: "auto",
              boxShadow: 2,
              maxHeight: "70vh",
              width: "100%"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { sx: { width: "100%" }, stickyHeader: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { sx: { backgroundColor: "primary.main" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableSortLabel,
                  {
                    active: orderBy === "name",
                    direction: orderBy === "name" ? order : "asc",
                    onClick: () => handleRequestSort("name"),
                    sx: { color: "white", "& .MuiTableSortLabel-icon": { color: "white" } },
                    children: "Project"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableSortLabel,
                  {
                    active: orderBy === "status",
                    direction: orderBy === "status" ? order : "asc",
                    onClick: () => handleRequestSort("status"),
                    sx: { color: "white", "& .MuiTableSortLabel-icon": { color: "white" } },
                    children: "Status"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableSortLabel,
                  {
                    active: orderBy === "applicationMode",
                    direction: orderBy === "applicationMode" ? order : "asc",
                    onClick: () => handleRequestSort("applicationMode"),
                    sx: { color: "white", "& .MuiTableSortLabel-icon": { color: "white" } },
                    children: "Mode"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableSortLabel,
                  {
                    active: orderBy === "storageBackend",
                    direction: orderBy === "storageBackend" ? order : "asc",
                    onClick: () => handleRequestSort("storageBackend"),
                    sx: { color: "white", "& .MuiTableSortLabel-icon": { color: "white" } },
                    children: "Storage"
                  }
                ) }),
                isTeamMember() && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: "Your Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: "Team" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: "Datasets" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: "Collaboration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableSortLabel,
                  {
                    active: orderBy === "lastAccessedAt",
                    direction: orderBy === "lastAccessedAt" ? order : "asc",
                    onClick: () => handleRequestSort("lastAccessedAt"),
                    sx: { color: "white", "& .MuiTableSortLabel-icon": { color: "white" } },
                    children: "Last Accessed"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { sx: { color: "white", fontWeight: 600, fontSize: "0.875rem" }, children: "Actions" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: paginatedProjects.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TableRow,
                {
                  sx: {
                    "&:hover": {
                      backgroundColor: "action.hover",
                      cursor: "pointer"
                    },
                    "&:nth-of-type(odd)": { backgroundColor: "action.hover" }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 600, children: project.name }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        size: "small",
                        icon: getStatusIcon(project.status),
                        label: project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("-", " "),
                        color: getStatusColorLocal(project.status),
                        variant: "filled",
                        sx: { fontWeight: 600 }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        size: "small",
                        icon: getModeIcon(project.applicationMode),
                        label: project.applicationMode === "standalone" ? "Standalone" : "Network",
                        color: "primary",
                        variant: "outlined"
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        size: "small",
                        icon: getStorageIcon(project.storageBackend),
                        label: project.storageBackend,
                        variant: "outlined"
                      }
                    ) }),
                    isTeamMember() && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        size: "small",
                        label: project.teamMemberRole || project.role || "MEMBER",
                        color: "primary",
                        variant: "outlined",
                        sx: {
                          backgroundColor: "rgba(0, 212, 255, 0.1)",
                          borderColor: "rgba(0, 212, 255, 0.3)",
                          color: "primary.main",
                          fontWeight: 600
                        }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: typeof projectTeamMemberCounts[project.id] === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        size: "small",
                        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}),
                        label: `${projectTeamMemberCounts[project.id]} member${projectTeamMemberCounts[project.id] !== 1 ? "s" : ""}`,
                        variant: "outlined",
                        color: projectTeamMemberCounts[project.id] > 0 ? "primary" : "default",
                        title: `${projectTeamMemberCounts[project.id]} team members assigned to this project`
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "-" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: datasetCountsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Loading..." })
                    ] }) : typeof projectDatasetCounts[project.id] === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        size: "small",
                        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, {}),
                        label: `${projectDatasetCounts[project.id]} dataset${projectDatasetCounts[project.id] !== 1 ? "s" : ""}`,
                        variant: "outlined",
                        color: projectDatasetCounts[project.id] > 0 ? "secondary" : "default",
                        title: `${projectDatasetCounts[project.id]} datasets assigned to this project`
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "-" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: project.collaborationEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          size: "small",
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Group, {}),
                          label: "Enabled",
                          variant: "outlined",
                          color: "success",
                          sx: { fontWeight: 600 },
                          title: "Collaboration is enabled for this project"
                        }
                      ),
                      project.realTimeEnabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          size: "small",
                          label: "Real-time",
                          variant: "filled",
                          color: "info",
                          sx: { fontSize: "0.7rem", height: "20px" }
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Chip,
                      {
                        size: "small",
                        label: "Disabled",
                        variant: "outlined",
                        color: "default",
                        sx: { color: "text.secondary" }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: formatLastAccessed(project.lastAccessedAt) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "center" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        IconButton,
                        {
                          size: "small",
                          onClick: (event) => handleActionMenuOpen(event, project.id),
                          sx: {
                            color: "text.secondary",
                            "&:hover": {
                              backgroundColor: "action.hover",
                              color: "text.primary"
                            }
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertIcon, {})
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Menu,
                        {
                          anchorEl: actionMenuAnchor[project.id],
                          open: Boolean(actionMenuAnchor[project.id]),
                          onClose: () => handleActionMenuClose(project.id),
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "right"
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          PaperProps: {
                            sx: {
                              backgroundColor: "background.paper",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: 2,
                              minWidth: 200,
                              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                            }
                          },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              MenuItem,
                              {
                                onClick: () => {
                                  setSelectedProject(project);
                                  handleActionMenuClose(project.id);
                                },
                                sx: { py: 1.5 },
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, { sx: { mr: 2, fontSize: 20 } }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Details" })
                                ]
                              }
                            ),
                            project.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              MenuItem,
                              {
                                onClick: () => {
                                  updateProjectStatus(project.id, "active");
                                  handleActionMenuClose(project.id);
                                },
                                disabled: projectStatusUpdating[project.id],
                                sx: { py: 1.5 },
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, { sx: { mr: 2, fontSize: 20, color: "success.main" } }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Activate" })
                                ]
                              }
                            ),
                            project.status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              MenuItem,
                              {
                                onClick: () => {
                                  updateProjectStatus(project.id, "in-progress");
                                  handleActionMenuClose(project.id);
                                },
                                disabled: projectStatusUpdating[project.id],
                                sx: { py: 1.5 },
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, { sx: { mr: 2, fontSize: 20, color: "info.main" } }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Start" })
                                ]
                              }
                            ),
                            project.status === "in-progress" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              MenuItem,
                              {
                                onClick: () => {
                                  updateProjectStatus(project.id, "completed");
                                  handleActionMenuClose(project.id);
                                },
                                disabled: projectStatusUpdating[project.id],
                                sx: { py: 1.5 },
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, { sx: { mr: 2, fontSize: 20, color: "success.main" } }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Complete" })
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              MenuItem,
                              {
                                onClick: () => {
                                  toggleProjectCollaboration(project.id, !project.collaborationEnabled);
                                  handleActionMenuClose(project.id);
                                },
                                disabled: projectStatusUpdating[project.id],
                                sx: { py: 1.5 },
                                children: [
                                  project.collaborationEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(StopIcon, { sx: { mr: 2, fontSize: 20, color: "warning.main" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrow, { sx: { mr: 2, fontSize: 20, color: "success.main" } }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: project.collaborationEnabled ? "Disable Collab" : "Enable Collab" })
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              MenuItem,
                              {
                                onClick: () => __async(void 0, null, function* () {
                                  try {
                                    if (!project.isArchived) {
                                      yield updateProjectStatus(project.id, "archived");
                                    } else {
                                      yield updateProjectStatus(project.id, "active");
                                    }
                                    handleActionMenuClose(project.id);
                                  } catch (e) {
                                    console.error("Failed to toggle archive", e);
                                    setError("Failed to update project");
                                  }
                                }),
                                disabled: projectStatusUpdating[project.id],
                                sx: { py: 1.5 },
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveIcon, { sx: { mr: 2, fontSize: 20, color: project.isArchived ? "success.main" : "warning.main" } }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: !project.isArchived ? "Archive" : "Restore" })
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              MenuItem,
                              {
                                onClick: () => __async(void 0, null, function* () {
                                  try {
                                    const confirmDelete = window.confirm(
                                      `Are you sure you want to permanently delete "${project.name}"? This action cannot be undone and will remove all project data, datasets, and team member assignments.`
                                    );
                                    if (confirmDelete) {
                                      setLoading(true);
                                      const success = yield cloudProjectIntegration.deleteProject(project.id);
                                      if (success) {
                                        console.log(`✅ [DashboardCloudProjectsBridge] Project "${project.name}" deleted successfully`);
                                        yield loadProjects();
                                        setError(null);
                                      } else {
                                        setError(`Failed to delete project "${project.name}". Please try again.`);
                                      }
                                    }
                                    handleActionMenuClose(project.id);
                                  } catch (e) {
                                    console.error("Failed to delete project:", e);
                                    setError(`Failed to delete project "${project.name}": ${e instanceof Error ? e.message : "Unknown error"}`);
                                  } finally {
                                    setLoading(false);
                                  }
                                }),
                                sx: {
                                  py: 1.5,
                                  color: "error.main",
                                  "&:hover": {
                                    backgroundColor: "error.light",
                                    color: "error.dark"
                                  }
                                },
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { sx: { mr: 2, fontSize: 20 } }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Delete" })
                                ]
                              }
                            )
                          ]
                        }
                      )
                    ] }) })
                  ]
                },
                project.id
              )) })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TablePagination,
          {
            component: "div",
            count: tabFilteredProjects.length,
            page,
            onPageChange: handleChangePage,
            rowsPerPage,
            onRowsPerPageChange: handleChangeRowsPerPage,
            rowsPerPageOptions: [5, 10, 25, 50],
            sx: { mt: 2 }
          }
        )
      ] }),
      !loading && tabFilteredProjects.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, { sx: { fontSize: 64, color: "text.secondary", mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", gutterBottom: true, children: searchQuery ? "No projects found matching your search" : tab === 0 ? "No active projects yet" : "No archived projects" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: searchQuery ? "Try adjusting your search terms or browse all projects" : tab === 0 ? isTeamMember() ? canCreateProjects ? "No projects assigned yet. As a team admin, you can create new projects or wait for assignments from your organization administrator." : "No projects have been assigned to you yet. Contact your team administrator to get access to projects." : canCreateProjects ? "Create your first cloud project to get started with Firebase and GCS integration" : "You need an active subscription to create projects. Please upgrade your account or contact support." : "Archived projects will appear here" }),
        tab === 0 && !searchQuery && canCreateProjects && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
            onClick: handleCreateProject,
            size: "large",
            sx: {
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-2px)"
              },
              transition: "all 0.3s ease-in-out"
            },
            children: "Create Your First Project"
          }
        ),
        tab === 0 && !searchQuery && isTeamMember() && !canCreateProjects && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "💡 Team members without admin privileges cannot create projects. Projects must be assigned by your administrator." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              onClick: loadProjects,
              size: "large",
              sx: { mt: 1 },
              children: "Refresh Projects"
            }
          )
        ] }),
        tab === 0 && !searchQuery && !isTeamMember() && ((completeUser == null ? void 0 : completeUser.memberRole) === "ENTERPRISE_ADMIN" || (completeUser == null ? void 0 : completeUser.role) === "ENTERPRISE_ADMIN") && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "🎯 As an Enterprise Admin, you can create new projects and manage your organization's project portfolio." }) }),
        searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            onClick: () => setSearchQuery(""),
            size: "large",
            sx: { mr: 2 },
            children: "Clear Search"
          }
        )
      ] }),
      !loading && searchQuery && tabFilteredProjects.length === 0 && (tab === 0 ? activeProjects : archivedProjects).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", gutterBottom: true, children: "No projects match your search criteria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: "Try different search terms or browse all projects in this tab" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            onClick: () => setSearchQuery(""),
            size: "large",
            children: "Clear Search"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UnifiedProjectCreationDialog,
      {
        open: showCreateDialog,
        onClose: () => {
          setShowCreateDialog(false);
        },
        mode: "shared_network",
        onSuccess: handleProjectCreated,
        maxCollaborators: getCollaborationLimit(completeUser),
        onCreate: (options) => __async(void 0, null, function* () {
          const id = yield simplifiedStartupSequencer.createProject(options);
          return id;
        })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollectionCreationWizard,
      {
        open: showCollectionWizard,
        onClose: () => setShowCollectionWizard(false),
        onCollectionCreated: handleCollectionCreated
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProjectDetailsDialog,
      {
        open: !!selectedProject,
        project: selectedProject,
        onClose: () => setSelectedProject(null),
        onProjectUpdated: loadProjects,
        projectDatasets,
        availableDatasets,
        datasetsLoading,
        datasetSearch,
        datasetBackendFilter,
        selectedDatasetId,
        uploading,
        onLoadDatasetsForProject: loadDatasetsForProject,
        onSetDatasetSearch: setDatasetSearch,
        onSetDatasetBackendFilter: setDatasetBackendFilter,
        onSetSelectedDatasetId: setSelectedDatasetId,
        onSetError: setError,
        projectTeamMembers,
        teamMembersLoading,
        projectTeamMemberCounts,
        onLoadTeamMembersForProject: loadTeamMembersForProject,
        onShowTeamRoleWizard: () => setShowTeamRoleWizard(true),
        onShowCreateDatasetWizard: () => setShowCreateDatasetWizard(true),
        onShowDatasetManagementDialog: () => setShowDatasetManagementDialog(true),
        onShowDatasetInsightsDialog: () => setShowDatasetInsightsDialog(true)
      }
    ),
    "            ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DatasetCreationWizard,
      {
        open: showCreateDatasetWizard,
        onClose: () => {
          setShowCreateDatasetWizard(false);
          setDatasetWizardAssignToProject(null);
        },
        onSuccess: (dataset) => {
          if (selectedProject) {
            void loadDatasetsForProject(selectedProject);
          }
          void loadProjects();
        },
        assignToProject: datasetWizardAssignToProject || void 0
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: showAddTeamMemberDialog,
        onClose: () => setShowAddTeamMemberDialog(false),
        maxWidth: "sm",
        fullWidth: true,
        PaperProps: {
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DialogTitle,
            {
              sx: {
                background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                color: "white",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                p: 3
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Box,
                  {
                    sx: {
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, { sx: { color: "white" } })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 600 }, children: "Add Team Member" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)" }, children: "Add licensed team members to this project" })
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { sx: { p: 3, background: "transparent" }, children: [
            addTeamMemberError && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 3 }, children: addTeamMemberError }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)", mb: 2 }, children: "Search and select from your licensed team members:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                {
                  fullWidth: true,
                  placeholder: "Search team members by name or email...",
                  value: teamMemberSearch,
                  onChange: (e) => setTeamMemberSearch(e.target.value),
                  sx: {
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)"
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(139, 92, 246, 0.5)"
                      },
                      "& input::placeholder": {
                        color: "rgba(255, 255, 255, 0.5)",
                        opacity: 1
                      }
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Select Team Member" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: selectedTeamMemberId,
                    onChange: (e) => setSelectedTeamMemberId(e.target.value),
                    disabled: teamMembersLoading,
                    sx: {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.2)"
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(139, 92, 246, 0.5)"
                      },
                      "& .MuiSelect-icon": {
                        color: "rgba(255, 255, 255, 0.7)"
                      },
                      color: "white"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: teamMembersLoading ? "Loading team members..." : "Select a team member..." }) }),
                      !teamMembersLoading && availableTeamMembers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { component: "em", sx: { color: "rgba(255, 255, 255, 0.5)" }, children: teamMemberSearch ? "No team members found matching your search" : "No available team members found" }) }),
                      !teamMembersLoading && availableTeamMembers.map((member) => {
                        var _a2;
                        let memberDisplayName = "Unnamed User";
                        if (member.name) {
                          memberDisplayName = member.name;
                        } else if (member.fullName) {
                          memberDisplayName = member.fullName;
                        } else if (member.displayName) {
                          memberDisplayName = member.displayName;
                        } else if (member.firstName && member.lastName) {
                          memberDisplayName = `${member.firstName} ${member.lastName}`;
                        } else if (member.firstName) {
                          memberDisplayName = member.firstName;
                        } else if (member.lastName) {
                          memberDisplayName = member.lastName;
                        } else if (member.email) {
                          memberDisplayName = member.email.split("@")[0];
                        }
                        return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: member.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, width: "100%" }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Box,
                            {
                              sx: {
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "white"
                              },
                              children: ((_a2 = memberDisplayName.charAt(0)) == null ? void 0 : _a2.toUpperCase()) || "U"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flexGrow: 1 }, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500, color: "white" }, children: memberDisplayName }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: [
                              member.email,
                              " • ",
                              member.licenseType || "Licensed"
                            ] })
                          ] })
                        ] }) }, member.id);
                      })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Project Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Select,
                  {
                    value: selectedTeamMemberRole,
                    onChange: (e) => setSelectedTeamMemberRole(e.target.value),
                    disabled: rolesLoading,
                    sx: {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.2)"
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(139, 92, 246, 0.5)"
                      },
                      "& .MuiSelect-icon": {
                        color: "rgba(255, 255, 255, 0.7)"
                      },
                      color: "white"
                    },
                    children: rolesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16, sx: { color: "rgba(255, 255, 255, 0.6)" } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.6)" }, children: "Loading roles..." })
                    ] }) }) : availableRoles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.6)" }, children: "No roles available" }) }) : availableRoles.map((role) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: role.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 0.5 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500, color: "white" }, children: role.displayName }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Chip,
                          {
                            label: role.category,
                            size: "small",
                            sx: {
                              height: 16,
                              fontSize: "0.65rem",
                              backgroundColor: projectRoleService.getRoleDisplayColor(role.category),
                              color: "white"
                            }
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "rgba(255, 255, 255, 0.8)" }, children: projectRoleService.formatRoleDescription(role) })
                    ] }) }, role.id))
                  }
                )
              ] })
            ] }),
            availableTeamMembers.length === 0 && !teamMembersLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Box,
              {
                sx: {
                  p: 3,
                  textAlign: "center",
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px dashed rgba(255, 255, 255, 0.1)"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkIcon, { sx: { fontSize: 48, color: "rgba(255, 255, 255, 0.3)", mb: 2 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.5)" }, children: "No available team members found" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.4)", mt: 1 }, children: "Make sure team members have valid licenses and aren't already assigned to this project" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DialogActions,
            {
              sx: {
                p: 3,
                background: "rgba(255, 255, 255, 0.02)",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                justifyContent: "space-between"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: () => {
                      setShowAddTeamMemberDialog(false);
                      setSelectedTeamMemberId("");
                      setSelectedTeamMemberRole("");
                      setAvailableRoles([]);
                      setTeamMemberSearch("");
                      setAddTeamMemberError(null);
                    },
                    variant: "outlined",
                    disabled: addTeamMemberLoading,
                    sx: {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        backgroundColor: "rgba(255, 255, 255, 0.05)"
                      }
                    },
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "contained",
                    disabled: addTeamMemberLoading || !selectedTeamMemberId,
                    onClick: () => __async(void 0, null, function* () {
                      if (!selectedProject || !selectedTeamMemberId) return;
                      setAddTeamMemberError(null);
                      setAddTeamMemberLoading(true);
                      try {
                        yield projectRoleService.addTeamMemberToProject(
                          selectedProject.id,
                          selectedTeamMemberId,
                          selectedTeamMemberRole
                        );
                        yield loadTeamMembersForProject(selectedProject);
                        setShowAddTeamMemberDialog(false);
                        setSelectedTeamMemberId("");
                        setSelectedTeamMemberRole("");
                        setAvailableRoles([]);
                        setTeamMemberSearch("");
                      } catch (e) {
                        console.error("Failed to add team member:", e);
                        setAddTeamMemberError((e == null ? void 0 : e.message) || "Failed to add team member");
                      } finally {
                        setAddTeamMemberLoading(false);
                      }
                    }),
                    sx: {
                      background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                      color: "white",
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "0 6px 20px rgba(139, 92, 246, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                        boxShadow: "0 8px 25px rgba(139, 92, 246, 0.5)",
                        transform: "translateY(-2px)"
                      },
                      "&:disabled": {
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.3)",
                        boxShadow: "none"
                      }
                    },
                    children: addTeamMemberLoading ? "Adding..." : "Add Team Member"
                  }
                )
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: showDatasetManagementDialog,
        onClose: () => setShowDatasetManagementDialog(false),
        maxWidth: "lg",
        fullWidth: true,
        PaperProps: {
          sx: {
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxHeight: "80vh"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: {
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            pb: 2,
            fontSize: "1.5rem",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }, children: [
            "Dataset Management",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                onClick: () => {
                  setShowDatasetManagementDialog(false);
                  setShowCreateDatasetWizard(true);
                },
                sx: {
                  background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                  color: "white",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                    boxShadow: "0 6px 16px rgba(139, 92, 246, 0.5)",
                    transform: "translateY(-1px)"
                  }
                },
                children: "Create Dataset"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { p: 3, overflow: "auto" }, children: organizationDatasetsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "center", alignItems: "center", py: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: "rgba(255, 255, 255, 0.7)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { ml: 2, color: "rgba(255, 255, 255, 0.7)" }, children: "Loading datasets..." })
          ] }) : organizationDatasets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { sx: { fontSize: 64, color: "rgba(255, 255, 255, 0.5)", mb: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "No Datasets Found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)", mb: 3 }, children: "Create your first dataset to get started with data management." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { sx: { mr: 1 } }),
              "Available Datasets (",
              organizationDatasets.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: organizationDatasets.map((dataset) => {
              var _a2, _b2, _c2, _d2, _e, _f;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Card,
                {
                  sx: {
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 2,
                    color: "white",
                    position: "relative",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.08)",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)"
                    },
                    transition: "all 0.2s ease-in-out"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2, pb: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }, children: dataset.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: {
                      color: "rgba(255, 255, 255, 0.7)",
                      mb: 2,
                      minHeight: "2.5em",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }, children: dataset.description || "No description available" }),
                    ((_a2 = dataset.storage) == null ? void 0 : _a2.backend) === "firestore" && ((_c2 = (_b2 = dataset.collectionAssignment) == null ? void 0 : _b2.selectedCollections) == null ? void 0 : _c2.length) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: {
                        color: "rgba(255, 255, 255, 0.6)",
                        display: "block",
                        mb: 0.5,
                        fontWeight: 500
                      }, children: [
                        "Collections (",
                        dataset.collectionAssignment.selectedCollections.length,
                        "):"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 0.5 }, children: [
                        dataset.collectionAssignment.selectedCollections.slice(0, 2).map((collection2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Chip,
                          {
                            label: collection2,
                            size: "small",
                            sx: {
                              height: 18,
                              fontSize: "0.65rem",
                              backgroundColor: "rgba(79, 70, 229, 0.2)",
                              color: "#ffffff",
                              border: "1px solid rgba(79, 70, 229, 0.3)"
                            }
                          },
                          collection2
                        )),
                        dataset.collectionAssignment.selectedCollections.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Chip,
                          {
                            label: `+${dataset.collectionAssignment.selectedCollections.length - 2}`,
                            size: "small",
                            sx: {
                              height: 18,
                              fontSize: "0.65rem",
                              backgroundColor: "rgba(156, 163, 175, 0.2)",
                              color: "#9ca3af"
                            }
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          size: "small",
                          label: ((_e = (_d2 = dataset.__label) == null ? void 0 : _d2.match(/\((.*?)\)$/)) == null ? void 0 : _e[1]) || "Firestore",
                          variant: "outlined",
                          sx: {
                            borderColor: "rgba(255, 255, 255, 0.3)",
                            color: "rgba(255, 255, 255, 0.8)",
                            fontSize: "0.75rem"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Chip,
                        {
                          size: "small",
                          label: dataset.visibility || "private",
                          variant: "filled",
                          sx: {
                            backgroundColor: dataset.visibility === "public" ? "rgba(34, 197, 94, 0.2)" : dataset.visibility === "organization" ? "rgba(59, 130, 246, 0.2)" : "rgba(156, 163, 175, 0.2)",
                            color: dataset.visibility === "public" ? "#22c55e" : dataset.visibility === "organization" ? "#3b82f6" : "#9ca3af",
                            fontSize: "0.75rem"
                          }
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, flexWrap: "wrap" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          size: "small",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}),
                          onClick: (e) => {
                            e.stopPropagation();
                            console.log("✏️ [DashboardCloudProjectsBridge] Edit dataset clicked:", dataset.id);
                            setDatasetToEdit(dataset);
                            setShowEditDatasetDialog(true);
                          },
                          sx: {
                            borderColor: "rgba(139, 92, 246, 0.3)",
                            color: "#8b5cf6",
                            minWidth: "auto",
                            px: 1.5,
                            py: 0.5,
                            fontSize: "0.75rem",
                            "&:hover": {
                              borderColor: "#8b5cf6",
                              backgroundColor: "rgba(139, 92, 246, 0.1)"
                            }
                          },
                          children: "Edit"
                        }
                      ),
                      ((_f = dataset.storage) == null ? void 0 : _f.backend) === "firestore" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          size: "small",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, {}),
                          onClick: (e) => {
                            e.stopPropagation();
                            console.log("📊 [DashboardCloudProjectsBridge] View collections clicked:", dataset.id);
                            setSelectedDatasetForManagement(dataset);
                            setShowDatasetCollectionsDialog(true);
                          },
                          sx: {
                            borderColor: "rgba(59, 130, 246, 0.3)",
                            color: "#3b82f6",
                            minWidth: "auto",
                            px: 1.5,
                            py: 0.5,
                            fontSize: "0.75rem",
                            "&:hover": {
                              borderColor: "#3b82f6",
                              backgroundColor: "rgba(59, 130, 246, 0.1)"
                            }
                          },
                          children: "Collections"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "outlined",
                          size: "small",
                          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}),
                          onClick: (e) => __async(void 0, null, function* () {
                            e.stopPropagation();
                            const confirmDelete = window.confirm(
                              `Are you sure you want to delete dataset "${dataset.name}"? This action cannot be undone and will remove the dataset from all projects.`
                            );
                            if (confirmDelete) {
                              try {
                                console.log("🗑️ [DashboardCloudProjectsBridge] Deleting dataset:", dataset.id);
                                yield cloudProjectIntegration.deleteDataset(dataset.id);
                                console.log("✅ [DashboardCloudProjectsBridge] Dataset deleted successfully");
                                yield loadOrganizationDatasets();
                                yield refreshDatasetCounts();
                              } catch (error2) {
                                console.error("❌ [DashboardCloudProjectsBridge] Failed to delete dataset:", error2);
                                setError(`Failed to delete dataset: ${error2 instanceof Error ? error2.message : "Unknown error"}`);
                              }
                            }
                          }),
                          sx: {
                            borderColor: "rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                            minWidth: "auto",
                            px: 1.5,
                            py: 0.5,
                            fontSize: "0.75rem",
                            "&:hover": {
                              borderColor: "#ef4444",
                              backgroundColor: "rgba(239, 68, 68, 0.1)"
                            }
                          },
                          children: "Delete"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", sx: {
                      color: "rgba(255, 255, 255, 0.5)",
                      mt: 1,
                      display: "block"
                    }, children: [
                      "ID: ",
                      dataset.id
                    ] })
                  ] })
                }
              ) }, dataset.id);
            }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: {
            p: 3,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            justifyContent: "space-between"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: loadOrganizationDatasets,
                variant: "outlined",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                disabled: organizationDatasetsLoading,
                sx: {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.8)",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }
                },
                children: "Refresh"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setShowDatasetManagementDialog(false),
                variant: "outlined",
                sx: {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.8)",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }
                },
                children: "Close"
              }
            )
          ] })
        ]
      }
    ),
    selectedProject && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TeamRoleWizard,
      {
        open: showTeamRoleWizard,
        onClose: () => setShowTeamRoleWizard(false),
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        organizationId: (completeUser == null ? void 0 : completeUser.organizationId) || "",
        existingProjectTeamMembers: projectTeamMembers,
        onTeamMembersUpdated: () => {
          console.log("🔄 [DashboardCloudProjectsBridge] Refreshing team members after wizard update");
          if (selectedProject) {
            loadTeamMembersForProject(selectedProject);
          }
        }
      }
    ),
    selectedProject && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProjectRoleManagementDialog,
      {
        open: showRoleManagementDialog,
        onClose: () => setShowRoleManagementDialog(false),
        projectId: selectedProject.id,
        organizationId: (completeUser == null ? void 0 : completeUser.organizationId) || "",
        projectName: selectedProject.name
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: showDatasetInsightsDialog,
        onClose: () => setShowDatasetInsightsDialog(false),
        maxWidth: "lg",
        fullWidth: true,
        PaperProps: {
          sx: {
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxHeight: "90vh"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: {
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            pb: 2,
            fontSize: "1.5rem",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, { sx: { fontSize: 32, color: "#8b5cf6" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { fontWeight: 700 }, children: "Dataset Insights & Analysis" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Global overview of dataset organization and conflicts" })
              ] })
            ] }),
            datasetAnalysis && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: {
                color: datasetAnalysis.healthScore >= 80 ? "#10b981" : datasetAnalysis.healthScore >= 60 ? "#f59e0b" : "#ef4444",
                fontWeight: 700
              }, children: datasetAnalysis.healthScore }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "rgba(255, 255, 255, 0.6)" }, children: "Health Score" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { p: 3, overflow: "auto" }, children: loadingDatasetAnalysis ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "center", alignItems: "center", py: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { sx: { color: "#8b5cf6", mr: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", children: "Analyzing dataset organization..." })
          ] }) : datasetAnalysis ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4, p: 3, borderRadius: 2, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, { sx: { color: "#8b5cf6" } }),
                "Dataset Analysis Summary"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: { fontWeight: 700, color: "#667eea" }, children: datasetAnalysis.totalDatasets }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Total Datasets" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: { fontWeight: 700, color: "#f093fb" }, children: organizationDatasets.filter((ds) => {
                    var _a2;
                    return ((_a2 = ds.storage) == null ? void 0 : _a2.backend) === "firestore";
                  }).length }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Firestore Datasets" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: { fontWeight: 700, color: "#4facfe" }, children: datasetAnalysis.totalCollections }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Unique Collections" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: {
                    fontWeight: 700,
                    color: datasetAnalysis.overlaps.length > 0 ? "#fc4a1a" : "#11998e"
                  }, children: datasetAnalysis.overlaps.length }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Collection Overlaps" })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                textAlign: "center",
                p: 2
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: datasetAnalysis.totalDatasets }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Total Datasets" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: {
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                textAlign: "center",
                p: 2
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: datasetAnalysis.totalCollections }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Unique Collections" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: {
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                textAlign: "center",
                p: 2
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: datasetAnalysis.overlaps.length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Collection Overlaps" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: {
                background: datasetAnalysis.globalInsights.redundantAssignments.length > 0 ? "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)" : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                color: "white",
                textAlign: "center",
                p: 2
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: datasetAnalysis.globalInsights.redundantAssignments.length }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Redundancies" })
              ] }) })
            ] }),
            datasetAnalysis.overlaps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" }),
                "Collection Overlaps"
              ] }),
              datasetAnalysis.overlaps.map((overlap, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
                mb: 2,
                bgcolor: "rgba(255, 255, 255, 0.05)",
                border: `2px solid ${overlap.conflictLevel === "high" ? "#ef4444" : overlap.conflictLevel === "medium" ? "#f59e0b" : "#10b981"}`
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
                    overlap.collection
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: overlap.conflictLevel.toUpperCase(),
                      color: overlap.conflictLevel === "high" ? "error" : overlap.conflictLevel === "medium" ? "warning" : "success",
                      sx: { fontWeight: 600 }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { mb: 2 }, children: [
                  "Used by ",
                  overlap.datasets.length,
                  " datasets: ",
                  overlap.datasets.map((d) => d.name).join(", ")
                ] }),
                overlap.conflictReasons.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 2 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600, display: "block", mb: 1 }, children: "Issues:" }),
                  overlap.conflictReasons.map((reason, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "#ef4444", fontSize: "0.85rem" }, children: [
                    "• ",
                    reason
                  ] }, i))
                ] }),
                overlap.recommendations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { fontWeight: 600, display: "block", mb: 1 }, children: "Recommendations:" }),
                  overlap.recommendations.map((rec, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "#10b981", fontSize: "0.85rem" }, children: [
                    "💡 ",
                    rec
                  ] }, i))
                ] })
              ] }) }, index))
            ] }),
            datasetAnalysis.globalInsights.mostUsedCollections.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { color: "primary" }),
                "Most Used Collections"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: datasetAnalysis.globalInsights.mostUsedCollections.slice(0, 6).map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: { bgcolor: "rgba(255, 255, 255, 0.05)", p: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, { color: "primary" }),
                  item.collection
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: [
                  "Used by ",
                  item.count,
                  " dataset",
                  item.count !== 1 ? "s" : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 1 }, children: [
                  item.datasets.slice(0, 2).map((dataset, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: dataset,
                      size: "small",
                      sx: { mr: 0.5, mb: 0.5, fontSize: "0.7rem" }
                    },
                    i
                  )),
                  item.datasets.length > 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Chip,
                    {
                      label: `+${item.datasets.length - 2} more`,
                      size: "small",
                      sx: { fontSize: "0.7rem" }
                    }
                  )
                ] })
              ] }) }, index)) })
            ] }),
            datasetAnalysis.globalInsights.recommendations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { color: "info" }),
                "Optimization Recommendations"
              ] }),
              datasetAnalysis.globalInsights.recommendations.map((rec, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 1, bgcolor: "rgba(79, 70, 229, 0.1)" }, children: rec }, index))
            ] }),
            datasetAnalysis.overlaps.length === 0 && datasetAnalysis.globalInsights.redundantAssignments.length === 0 && datasetAnalysis.totalDatasets > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { sx: { fontSize: 64, color: "#10b981", mb: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { color: "#10b981", mb: 1 }, children: "Excellent Dataset Organization!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "No conflicts or redundancies detected. Your datasets are well-organized." })
            ] }),
            datasetAnalysis.totalDatasets === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { sx: { fontSize: 80, color: "rgba(255, 255, 255, 0.3)", mb: 3 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { mb: 2, color: "rgba(255, 255, 255, 0.8)" }, children: "No Datasets Found" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { color: "rgba(255, 255, 255, 0.6)", mb: 3, maxWidth: 400, mx: "auto" }, children: "Create your first dataset to start organizing your data and see detailed insights about collection usage and potential conflicts." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                  onClick: () => {
                    setShowDatasetInsightsDialog(false);
                    setShowCreateDatasetWizard(true);
                  },
                  sx: {
                    background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                    color: "white",
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                      boxShadow: "0 6px 20px rgba(139, 92, 246, 0.5)",
                      transform: "translateY(-2px)"
                    }
                  },
                  children: "Create Your First Dataset"
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Assessment, { sx: { fontSize: 80, color: "rgba(255, 255, 255, 0.3)", mb: 3 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", sx: { mb: 2, color: "rgba(255, 255, 255, 0.8)" }, children: "Dataset Analysis Unavailable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { color: "rgba(255, 255, 255, 0.6)", mb: 3, maxWidth: 400, mx: "auto" }, children: "Unable to load dataset analysis. This could be due to missing organization data or a temporary service issue." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, justifyContent: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                  onClick: loadDatasetAnalysis,
                  sx: {
                    borderColor: "rgba(139, 92, 246, 0.3)",
                    color: "#8b5cf6",
                    "&:hover": {
                      borderColor: "#8b5cf6",
                      backgroundColor: "rgba(139, 92, 246, 0.1)"
                    }
                  },
                  children: "Retry Analysis"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                  onClick: () => {
                    setShowDatasetInsightsDialog(false);
                    setShowCreateDatasetWizard(true);
                  },
                  sx: {
                    background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                    color: "white",
                    "&:hover": {
                      background: "linear-gradient(135deg, #7c3aed, #9333ea)"
                    }
                  },
                  children: "Create Dataset"
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: {
            p: 3,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            justifyContent: "space-between"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: loadDatasetAnalysis,
                variant: "outlined",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                disabled: loadingDatasetAnalysis,
                sx: {
                  borderColor: "rgba(139, 92, 246, 0.3)",
                  color: "#8b5cf6",
                  "&:hover": {
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.1)"
                  }
                },
                children: "Refresh Analysis"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setShowDatasetInsightsDialog(false),
                variant: "outlined",
                sx: {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }
                },
                children: "Close"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: showDatasetCollectionsDialog,
        onClose: () => {
          setShowDatasetCollectionsDialog(false);
          setSelectedDatasetForManagement(null);
        },
        maxWidth: "md",
        fullWidth: true,
        PaperProps: {
          sx: {
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            color: "white",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxHeight: "80vh"
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { sx: {
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            pb: 2,
            fontSize: "1.25rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 2
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, { sx: { color: "#3b82f6" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { fontWeight: 700 }, children: "Dataset Collections" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: (selectedDatasetForManagement == null ? void 0 : selectedDatasetForManagement.name) || "Dataset" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { sx: { p: 3 }, children: selectedDatasetForManagement && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3, p: 2, borderRadius: 2, background: "rgba(255, 255, 255, 0.05)" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { fontWeight: 600, mb: 1 }, children: selectedDatasetForManagement.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)", mb: 2 }, children: selectedDatasetForManagement.description || "No description available" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    label: ((_a = selectedDatasetForManagement.storage) == null ? void 0 : _a.backend) || "firestore",
                    sx: { backgroundColor: "rgba(79, 70, 229, 0.2)", color: "#a5b4fc" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    size: "small",
                    label: selectedDatasetForManagement.visibility || "private",
                    sx: { backgroundColor: "rgba(59, 130, 246, 0.2)", color: "#60a5fa" }
                  }
                )
              ] })
            ] }),
            ((_b = selectedDatasetForManagement.storage) == null ? void 0 : _b.backend) === "firestore" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { sx: { color: "#f59e0b" } }),
                "Firestore Collections"
              ] }),
              ((_d = (_c = selectedDatasetForManagement.collectionAssignment) == null ? void 0 : _c.selectedCollections) == null ? void 0 : _d.length) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)", mb: 2 }, children: [
                  "This dataset includes ",
                  selectedDatasetForManagement.collectionAssignment.selectedCollections.length,
                  " collection(s):"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 1, children: selectedDatasetForManagement.collectionAssignment.selectedCollections.map((collection2, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Box,
                  {
                    sx: {
                      p: 2,
                      borderRadius: 2,
                      background: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetIcon, { sx: { color: "#f59e0b", fontSize: 20 } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { fontWeight: 500 }, children: collection2 })
                    ]
                  }
                ) }, index)) }),
                selectedDatasetForManagement.collectionAssignment.organizationScope && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mt: 2, p: 2, borderRadius: 2, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "#10b981", display: "flex", alignItems: "center", gap: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Security, { sx: { fontSize: 16 } }),
                  "Organization scoped for data isolation"
                ] }) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { sx: { fontSize: 48, color: "rgba(245, 158, 11, 0.5)", mb: 2 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { color: "rgba(255, 255, 255, 0.7)", mb: 1 }, children: "No Collections Assigned" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.5)" }, children: "This Firestore dataset doesn't have any collections assigned yet." })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { sx: { fontSize: 48, color: "rgba(59, 130, 246, 0.5)", mb: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", sx: { color: "rgba(255, 255, 255, 0.7)", mb: 1 }, children: "Non-Firestore Dataset" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.5)" }, children: "Collection management is only available for Firestore datasets." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { sx: {
            p: 3,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            justifyContent: "space-between"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => {
                  if (selectedDatasetForManagement) {
                    setDatasetToEdit(selectedDatasetForManagement);
                    setShowEditDatasetDialog(true);
                    setShowDatasetCollectionsDialog(false);
                  }
                },
                variant: "outlined",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}),
                sx: {
                  borderColor: "rgba(139, 92, 246, 0.3)",
                  color: "#8b5cf6",
                  "&:hover": {
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139, 92, 246, 0.1)"
                  }
                },
                children: "Edit Dataset"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => {
                  setShowDatasetCollectionsDialog(false);
                  setSelectedDatasetForManagement(null);
                },
                variant: "outlined",
                sx: {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }
                },
                children: "Close"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EditDatasetDialog,
      {
        open: showEditDatasetDialog,
        onClose: () => {
          setShowEditDatasetDialog(false);
          setDatasetToEdit(null);
        },
        dataset: datasetToEdit,
        existingDatasets: organizationDatasets,
        onDatasetUpdated: (updatedDataset) => {
          console.log("✅ [DashboardCloudProjectsBridge] Dataset updated:", updatedDataset);
          if (selectedProject) {
            setProjectDatasets(
              (prev) => prev.map((ds) => ds.id === updatedDataset.id ? updatedDataset : ds)
            );
          }
          setOrganizationDatasets(
            (prev) => prev.map((ds) => ds.id === updatedDataset.id ? updatedDataset : ds)
          );
          if ((selectedDatasetForManagement == null ? void 0 : selectedDatasetForManagement.id) === updatedDataset.id) {
            setSelectedDatasetForManagement(updatedDataset);
          }
          if (showDatasetInsightsDialog) {
            loadDatasetAnalysis();
          }
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Popover,
      {
        open: showInfoPopover,
        anchorEl: infoPopoverAnchor,
        onClose: handleInfoPopoverClose,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left"
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "left"
        },
        PaperProps: {
          sx: {
            width: 800,
            maxWidth: "90vw",
            maxHeight: "80vh",
            overflow: "auto",
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(School, { sx: { color: "white", fontSize: 24 } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: "bold", gutterBottom: true, children: "Project Management Guide" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.7)" }, children: "Step-by-step instructions for effective project setup and management" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stepper, { orientation: "vertical", sx: { mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { active: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                StepLabel,
                {
                  StepIconComponent: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold"
                  }, children: "1" }),
                  sx: { color: "white" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "white", fontWeight: 600 }, children: "Create Your Project" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StepContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { pl: 2, pb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)", mb: 2 }, children: "Start by creating a new project with the proper configuration:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#10b981", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Click 'Create Project' button or use the Actions menu",
                        secondary: "Choose between Standalone (local) or Network (collaborative) mode"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#10b981", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Configure storage backend",
                        secondary: "Select Firestore for web-only projects, or GCS/S3 for file storage"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#10b981", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Set project name and description",
                        secondary: "Use descriptive names that clearly identify the project purpose"
                      }
                    )
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { active: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                StepLabel,
                {
                  StepIconComponent: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold"
                  }, children: "2" }),
                  sx: { color: "white" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "white", fontWeight: 600 }, children: "Create Datasets with Collections" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StepContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { pl: 2, pb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)", mb: 2 }, children: "Datasets organize your data and define which Firestore collections to use:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, { sx: { color: "#3b82f6", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Access Dataset Management from Actions menu",
                        secondary: "Click 'Dataset Management' to view and create datasets"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#3b82f6", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Create new dataset with 'Create Dataset' button",
                        secondary: "Configure dataset name, description, and visibility settings"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#3b82f6", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Select Firestore collections to include",
                        secondary: "Choose which collections from your Firestore database to include in this dataset"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#3b82f6", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Set dataset visibility and permissions",
                        secondary: "Configure whether dataset is private, organization-wide, or public"
                      }
                    )
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { active: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                StepLabel,
                {
                  StepIconComponent: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold"
                  }, children: "3" }),
                  sx: { color: "white" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "white", fontWeight: 600 }, children: "Assign Datasets to Projects" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StepContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { pl: 2, pb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)", mb: 2 }, children: "Connect your datasets to specific projects for organized data access:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkIcon, { sx: { color: "#f59e0b", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Click on any project in the table",
                        secondary: "This opens the project details and management options"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#f59e0b", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Use 'Assign Dataset' option",
                        secondary: "Select from available datasets to assign to this project"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#f59e0b", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Configure dataset permissions for the project",
                        secondary: "Set read/write permissions and access levels for team members"
                      }
                    )
                  ] })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Step, { active: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                StepLabel,
                {
                  StepIconComponent: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold"
                  }, children: "4" }),
                  sx: { color: "white" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { color: "white", fontWeight: 600 }, children: "Assign Team Members to Project Roles" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StepContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { pl: 2, pb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)", mb: 2 }, children: "Add team members and assign appropriate roles for collaboration:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { sx: { color: "#8b5cf6", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Access 'Team Management' from project actions",
                        secondary: "Click on a project, then select team management options"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#8b5cf6", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Add team members to the project",
                        secondary: "Search and select team members from your organization"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#8b5cf6", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Assign appropriate roles (Admin, Member, Viewer)",
                        secondary: "Set role-based permissions for project access and management"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { sx: { pl: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleOutlineIcon, { sx: { color: "#8b5cf6", fontSize: 20 } }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ListItemText,
                      {
                        primary: "Configure collaboration settings",
                        secondary: "Enable real-time collaboration and set collaboration limits"
                      }
                    )
                  ] })
                ] })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 3, borderColor: "rgba(255, 255, 255, 0.1)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { color: "white", fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LightbulbIcon, { sx: { color: "#fbbf24" } }),
              "Best Practices"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1, color: "#10b981" }, children: "Project Organization" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)" }, children: [
                  "• Use descriptive project names that clearly identify purpose",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "• Group related projects with consistent naming conventions",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "• Archive completed projects to keep active list clean"
                ] })
              ] }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1, color: "#3b82f6" }, children: "Dataset Management" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)" }, children: [
                  "• Create datasets for specific data types or use cases",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "• Use clear collection naming in Firestore",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "• Set appropriate visibility levels for data security"
                ] })
              ] }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1, color: "#8b5cf6" }, children: "Team Collaboration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)" }, children: [
                  "• Assign roles based on team member responsibilities",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "• Use Admin role sparingly for security",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "• Enable collaboration only when needed"
                ] })
              ] }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: {
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600, mb: 1, color: "#f59e0b" }, children: "Security & Access" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", sx: { color: "rgba(255, 255, 255, 0.8)" }, children: [
                  "• Review dataset visibility settings regularly",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "• Monitor team member access and roles",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "• Use organization-level permissions when appropriate"
                ] })
              ] }) }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mb: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { color: "white", fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Assignment, { sx: { color: "#ef4444" } }),
              "Quick Actions"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  fullWidth: true,
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                  onClick: () => {
                    handleInfoPopoverClose();
                    handleCreateProject();
                  },
                  sx: {
                    borderColor: "rgba(16, 185, 129, 0.3)",
                    color: "#10b981",
                    "&:hover": {
                      borderColor: "#10b981",
                      backgroundColor: "rgba(16, 185, 129, 0.1)"
                    }
                  },
                  children: "Create New Project"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  fullWidth: true,
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(StorageIcon, {}),
                  onClick: () => {
                    handleInfoPopoverClose();
                    setShowDatasetManagementDialog(true);
                  },
                  sx: {
                    borderColor: "rgba(59, 130, 246, 0.3)",
                    color: "#3b82f6",
                    "&:hover": {
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.1)"
                    }
                  },
                  children: "Manage Datasets"
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", sx: { color: "rgba(255, 255, 255, 0.6)" }, children: "Need more help? Contact support or check the documentation." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "text",
                onClick: handleInfoPopoverClose,
                sx: { color: "rgba(255, 255, 255, 0.8)" },
                children: "Close Guide"
              }
            )
          ] })
        ] })
      }
    )
  ] });
};
const DashboardCloudProjectsBridge$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DashboardCloudProjectsBridge,
  default: DashboardCloudProjectsBridge
}, Symbol.toStringTag, { value: "Module" }));
export {
  ALL_DASHBOARD_COLLECTIONS as A,
  DashboardCloudProjectsBridge$1 as D
};
