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
import { j as jsxRuntimeExports, B as Box, T as Typography, d as Alert, G as Grid, aD as Skeleton, Z as AlertTitle, a as Button, bB as PersonAddIcon, C as CircularProgress, as as Download, ca as Upload, a0 as PeopleIcon, p as CheckCircleIcon, a1 as Schedule, bS as LicenseIcon, t as Card, v as CardContent, e as TextField, I as InputAdornment, b3 as SearchIcon, cb as FilterList, bO as CardHeader, a8 as FormControl, a9 as InputLabel, aa as Select, M as MenuItem, ak as TableContainer, c as Paper, al as Table, am as TableHead, an as TableRow, ao as TableCell, l as Checkbox, ap as TableBody, ae as Avatar, r as Chip, g as IconButton, aq as MoreVertIcon, cc as Pagination, at as Dialog, au as DialogTitle, av as DialogContent, aw as DialogActions, ar as Menu, y as ListItemIcon, bR as EditIcon, E as Email, u as Star, L as Lock, D as Divider, az as DeleteIcon } from "./mui-DBh4ciAv.js";
import { b as React, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { b as useCurrentUser, c as useOrganizationContext, a as useOrganizationTeamMembers, u as useOrganizationLicenses, d as useUserProjects, i as useInviteTeamMember, j as useUpdateTeamMember, k as useRemoveTeamMember, g as useAssignLicense, h as useUnassignLicense, l as useChangeTeamMemberPassword } from "./useStreamlinedData-C0IYP3sz.js";
import { M as MetricCard } from "./MetricCard-CeL-i_3s.js";
import { S as SimpleInviteTeamMemberDialog } from "./SimpleInviteTeamMemberDialog-CtmyXlKf.js";
import "./UnifiedDataService-VLp7iWzW.js";
import "./index-BMgPxnVi.js";
import "./stripe-iYh_bQi1.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./FirestoreCollectionManager-G36Dp8-r.js";
import "./firebase-DfhFqHuK.js";
import "./index.esm-BMygn4u3.js";
const _CSVService = class _CSVService {
  static getInstance() {
    if (!_CSVService.instance) {
      _CSVService.instance = new _CSVService();
    }
    return _CSVService.instance;
  }
  /**
   * Export team members to CSV
   */
  exportTeamMembers(_0) {
    return __async(this, arguments, function* (teamMembers, options = {}) {
      const {
        includeInactive = false,
        includePassword = false,
        includeAuditInfo = false,
        customFields = []
      } = options;
      let filteredMembers = teamMembers;
      if (!includeInactive) {
        filteredMembers = teamMembers.filter((member) => member.status === "active");
      }
      const headers = [
        "Email",
        "First Name",
        "Last Name",
        "Role",
        "Status",
        "Department",
        "Position",
        "Phone",
        "License Type",
        "Organization ID",
        "Created At",
        "Last Active"
      ];
      if (includePassword) {
        headers.splice(4, 0, "Password");
      }
      if (includeAuditInfo) {
        headers.push("Created By", "Updated At", "Updated By");
      }
      customFields.forEach((field) => {
        if (!headers.includes(field)) {
          headers.push(field);
        }
      });
      const csvRows = filteredMembers.map((member) => {
        const row = [
          member.email || "",
          member.firstName || "",
          member.lastName || "",
          member.role || "",
          member.status || "",
          member.department || "",
          member.position || "",
          member.phone || "",
          member.licenseType || "",
          member.organizationId || "",
          member.createdAt ? new Date(member.createdAt).toISOString() : "",
          member.lastActive ? new Date(member.lastActive).toISOString() : ""
        ];
        if (includePassword) {
          row.splice(4, 0, member.password || "");
        }
        if (includeAuditInfo) {
          row.push(
            member.createdBy || "",
            member.updatedAt ? new Date(member.updatedAt).toISOString() : "",
            member.updatedBy || ""
          );
        }
        customFields.forEach((field) => {
          const value = member[field];
          row.push(typeof value === "string" ? value : value ? String(value) : "");
        });
        return row;
      });
      const csvContent = [
        headers.join(","),
        ...csvRows.map(
          (row) => row.map(
            (cell) => typeof cell === "string" && cell.includes(",") ? `"${cell.replace(/"/g, '""')}"` : cell
          ).join(",")
        )
      ].join("\n");
      return csvContent;
    });
  }
  /**
   * Import team members from CSV
   */
  importTeamMembers(csvContent, organizationId, onProgress) {
    return __async(this, null, function* () {
      const lines = csvContent.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        return {
          success: false,
          totalRows: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: [{ row: 0, field: "general", value: "", error: "CSV file is empty or invalid" }],
          importedMembers: []
        };
      }
      const headers = this.parseCSVLine(lines[0]);
      const dataRows = lines.slice(1);
      const errors = [];
      const importedMembers = [];
      const requiredHeaders = ["Email", "First Name", "Last Name", "Role"];
      const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
      if (missingHeaders.length > 0) {
        return {
          success: false,
          totalRows: dataRows.length,
          successfulImports: 0,
          failedImports: dataRows.length,
          errors: [{
            row: 0,
            field: "headers",
            value: missingHeaders.join(", "),
            error: `Missing required headers: ${missingHeaders.join(", ")}`
          }],
          importedMembers: []
        };
      }
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowData = this.parseCSVLine(row);
        if (onProgress) {
          onProgress(Math.round((i + 1) / dataRows.length * 100));
        }
        try {
          const member = this.validateAndCreateTeamMember(rowData, headers, organizationId, i + 2);
          if (member) {
            importedMembers.push(member);
          }
        } catch (error) {
          errors.push({
            row: i + 2,
            field: "general",
            value: row,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }
      return {
        success: errors.length === 0,
        totalRows: dataRows.length,
        successfulImports: importedMembers.length,
        failedImports: errors.length,
        errors,
        importedMembers
      };
    });
  }
  /**
   * Parse a CSV line handling quoted fields
   */
  parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
  /**
   * Validate and create team member from CSV row data
   */
  validateAndCreateTeamMember(rowData, headers, organizationId, rowNumber) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const errors = [];
    const fieldMap = {};
    headers.forEach((header, index) => {
      fieldMap[header.toLowerCase()] = rowData[index] || "";
    });
    const email = (_a = fieldMap["email"]) == null ? void 0 : _a.trim();
    const firstName = (_b = fieldMap["first name"]) == null ? void 0 : _b.trim();
    const lastName = (_c = fieldMap["last name"]) == null ? void 0 : _c.trim();
    const role = (_d = fieldMap["role"]) == null ? void 0 : _d.trim();
    if (!email) {
      errors.push({ row: rowNumber, field: "email", value: "", error: "Email is required" });
    } else if (!this.isValidEmail(email)) {
      errors.push({ row: rowNumber, field: "email", value: email, error: "Invalid email format" });
    }
    if (!firstName) {
      errors.push({ row: rowNumber, field: "first name", value: "", error: "First name is required" });
    }
    if (!lastName) {
      errors.push({ row: rowNumber, field: "last name", value: "", error: "Last name is required" });
    }
    if (!role) {
      errors.push({ row: rowNumber, field: "role", value: "", error: "Role is required" });
    } else if (!["admin", "member", "viewer", "owner"].includes(role.toLowerCase())) {
      errors.push({ row: rowNumber, field: "role", value: role, error: "Invalid role. Must be admin, member, viewer, or owner" });
    }
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.map((e) => e.error).join(", ")}`);
    }
    const teamMember = {
      id: "",
      // Will be generated by the service
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: role.toLowerCase(),
      status: "pending",
      organization: {
        id: organizationId,
        name: "",
        tier: "BASIC"
      },
      organizationId,
      department: ((_e = fieldMap["department"]) == null ? void 0 : _e.trim()) || "",
      position: ((_f = fieldMap["position"]) == null ? void 0 : _f.trim()) || "",
      phone: ((_g = fieldMap["phone"]) == null ? void 0 : _g.trim()) || "",
      licenseType: ((_h = fieldMap["license type"]) == null ? void 0 : _h.trim()) || "BASIC",
      assignedProjects: [],
      joinedAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      lastActive: fieldMap["last active"] ? new Date(fieldMap["last active"]) : void 0
    };
    return teamMember;
  }
  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  /**
   * Download CSV file
   */
  downloadCSV(csvContent, filename = "team-members.csv") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  /**
   * Generate CSV template
   */
  generateTemplate() {
    const headers = [
      "Email",
      "First Name",
      "Last Name",
      "Role",
      "Status",
      "Department",
      "Position",
      "Phone",
      "License Type"
    ];
    const sampleData = [
      "john.doe@example.com",
      "John",
      "Doe",
      "member",
      "active",
      "Engineering",
      "Software Developer",
      "+1-555-0123",
      "PROFESSIONAL"
    ];
    return [
      headers.join(","),
      sampleData.join(",")
    ].join("\n");
  }
};
__publicField(_CSVService, "instance");
let CSVService = _CSVService;
const csvService = CSVService.getInstance();
const _TeamMemberFilterService = class _TeamMemberFilterService {
  static getInstance() {
    if (!_TeamMemberFilterService.instance) {
      _TeamMemberFilterService.instance = new _TeamMemberFilterService();
    }
    return _TeamMemberFilterService.instance;
  }
  /**
   * Filter and search team members with advanced criteria
   */
  filterTeamMembers(members, criteria, sortOptions, pagination) {
    let filteredMembers = [...members];
    if (criteria.search) {
      filteredMembers = this.applySearchFilter(filteredMembers, criteria.search);
    }
    if (criteria.role && criteria.role.length > 0) {
      filteredMembers = filteredMembers.filter(
        (member) => criteria.role.includes(member.role)
      );
    }
    if (criteria.status && criteria.status.length > 0) {
      filteredMembers = filteredMembers.filter(
        (member) => criteria.status.includes(member.status)
      );
    }
    if (criteria.department && criteria.department.length > 0) {
      filteredMembers = filteredMembers.filter(
        (member) => member.department && criteria.department.includes(member.department)
      );
    }
    if (criteria.licenseType && criteria.licenseType.length > 0) {
      filteredMembers = filteredMembers.filter(
        (member) => member.licenseType && criteria.licenseType.includes(member.licenseType)
      );
    }
    if (criteria.dateRange) {
      filteredMembers = this.applyDateRangeFilter(filteredMembers, criteria.dateRange);
    }
    if (criteria.hasLicense !== void 0) {
      filteredMembers = filteredMembers.filter(
        (member) => criteria.hasLicense ? !!member.licenseType : !member.licenseType
      );
    }
    if (criteria.isActive !== void 0) {
      filteredMembers = filteredMembers.filter(
        (member) => criteria.isActive ? member.status === "active" : member.status !== "active"
      );
    }
    if (criteria.customFields) {
      filteredMembers = this.applyCustomFieldFilters(filteredMembers, criteria.customFields);
    }
    if (sortOptions) {
      filteredMembers = this.applySorting(filteredMembers, sortOptions);
    }
    const totalCount = members.length;
    const filteredCount = filteredMembers.length;
    let paginatedMembers = filteredMembers;
    let hasMore = false;
    let pageInfo = {
      currentPage: 1,
      totalPages: 1,
      pageSize: filteredCount,
      totalItems: filteredCount
    };
    if (pagination) {
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      paginatedMembers = filteredMembers.slice(startIndex, endIndex);
      hasMore = endIndex < filteredCount;
      pageInfo = {
        currentPage: pagination.page,
        totalPages: Math.ceil(filteredCount / pagination.pageSize),
        pageSize: pagination.pageSize,
        totalItems: filteredCount
      };
    }
    return {
      filteredMembers: paginatedMembers,
      totalCount,
      filteredCount,
      hasMore,
      pageInfo
    };
  }
  /**
   * Apply search filter across multiple fields
   */
  applySearchFilter(members, searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    return members.filter((member) => {
      const searchableFields = [
        member.email,
        member.firstName,
        member.lastName,
        member.department,
        member.position,
        member.phone,
        member.role,
        member.status,
        member.licenseType
      ];
      return searchableFields.some(
        (field) => field && field.toLowerCase().includes(searchLower)
      );
    });
  }
  /**
   * Apply date range filter
   */
  applyDateRangeFilter(members, dateRange) {
    if (!dateRange) return members;
    return members.filter((member) => {
      const fieldValue = member[dateRange.field];
      if (!fieldValue) return false;
      const date = new Date(fieldValue);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }
  /**
   * Apply custom field filters
   */
  applyCustomFieldFilters(members, customFields) {
    return members.filter((member) => {
      return Object.entries(customFields).every(([field, value]) => {
        const memberValue = member[field];
        if (value === null || value === void 0) {
          return memberValue === value;
        }
        if (typeof value === "string") {
          return memberValue && String(memberValue).toLowerCase().includes(value.toLowerCase());
        }
        return memberValue === value;
      });
    });
  }
  /**
   * Apply sorting to filtered members
   */
  applySorting(members, sortOptions) {
    return members.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];
      if (aValue === void 0 && bValue === void 0) return 0;
      if (aValue === void 0) return sortOptions.direction === "asc" ? 1 : -1;
      if (bValue === void 0) return sortOptions.direction === "asc" ? -1 : 1;
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      return sortOptions.direction === "asc" ? comparison : -comparison;
    });
  }
  /**
   * Get available filter options from team members
   */
  getFilterOptions(members) {
    const roles = [...new Set(members.map((m) => m.role))].sort();
    const statuses = [...new Set(members.map((m) => m.status))].sort();
    const departments = [...new Set(members.map((m) => m.department).filter(Boolean))].sort();
    const licenseTypes = [...new Set(members.map((m) => m.licenseType).filter(Boolean))].sort();
    return {
      roles,
      statuses,
      departments,
      licenseTypes,
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.status === "active").length,
      pendingMembers: members.filter((m) => m.status === "pending").length,
      licensedMembers: members.filter((m) => m.licenseType).length
    };
  }
  /**
   * Get quick filter presets
   */
  getQuickFilters() {
    return {
      all: { label: "All Members", criteria: {} },
      active: {
        label: "Active Members",
        criteria: { isActive: true }
      },
      pending: {
        label: "Pending Invites",
        criteria: { status: ["pending"] }
      },
      admins: {
        label: "Administrators",
        criteria: { role: ["admin", "owner"] }
      },
      licensed: {
        label: "Licensed Members",
        criteria: { hasLicense: true }
      },
      recent: {
        label: "Recently Added",
        criteria: {
          dateRange: {
            field: "createdAt",
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
            // Last 30 days
          }
        }
      }
    };
  }
};
__publicField(_TeamMemberFilterService, "instance");
let TeamMemberFilterService = _TeamMemberFilterService;
const teamMemberFilterService = TeamMemberFilterService.getInstance();
const EnhancedTeamPage = React.memo(() => {
  var _a, _b;
  const { enqueueSnackbar } = useSnackbar();
  const [selectedMembers, setSelectedMembers] = reactExports.useState([]);
  const [filterCriteria, setFilterCriteria] = reactExports.useState({});
  const [sortOptions, setSortOptions] = reactExports.useState({ field: "createdAt", direction: "desc" });
  const [pagination, setPagination] = reactExports.useState({ page: 1, pageSize: 25 });
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const [showCSVImport, setShowCSVImport] = reactExports.useState(false);
  const [showCSVExport, setShowCSVExport] = reactExports.useState(false);
  const [csvImportResult, setCsvImportResult] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [anchorEl, setAnchorEl] = reactExports.useState(null);
  const [selectedMember, setSelectedMember] = reactExports.useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = reactExports.useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = reactExports.useState(false);
  const [assignLicenseDialogOpen, setAssignLicenseDialogOpen] = reactExports.useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = reactExports.useState(false);
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = reactExports.useState(false);
  const [editFormData, setEditFormData] = reactExports.useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "member",
    status: "active",
    department: "",
    position: "",
    phone: ""
  });
  const [passwordFormData, setPasswordFormData] = reactExports.useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [selectedLicenseId, setSelectedLicenseId] = reactExports.useState("");
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  const { data: orgContext, loading: orgLoading, error: orgError } = useOrganizationContext();
  const { data: teamMembers, loading: teamLoading, error: teamError, refetch: refetchTeamMembers } = useOrganizationTeamMembers();
  const { data: licenses, refetch: refetchLicenses } = useOrganizationLicenses();
  useUserProjects();
  const inviteTeamMember = useInviteTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const removeTeamMember = useRemoveTeamMember();
  const assignLicense = useAssignLicense();
  useUnassignLicense();
  const changeTeamMemberPassword = useChangeTeamMemberPassword();
  const filteredMembers = reactExports.useMemo(() => {
    if (!teamMembers || !Array.isArray(teamMembers)) return [];
    try {
      const criteria = __spreadProps(__spreadValues({}, filterCriteria), {
        search: searchQuery || void 0
      });
      const result = teamMemberFilterService.filterTeamMembers(
        teamMembers,
        criteria,
        sortOptions,
        pagination
      );
      return result.filteredMembers || [];
    } catch (error) {
      console.error("Error filtering team members:", error);
      return teamMembers || [];
    }
  }, [teamMembers, filterCriteria, searchQuery, sortOptions, pagination]);
  const teamStats = reactExports.useMemo(() => {
    if (!teamMembers || !Array.isArray(teamMembers)) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        availableLicenses: 0,
        totalLicenses: 0,
        assignedLicenses: 0
      };
    }
    try {
      const totalMembers = teamMembers.length;
      const activeMembers = teamMembers.filter((m) => (m == null ? void 0 : m.status) === "active").length;
      const pendingInvites = teamMembers.filter((m) => (m == null ? void 0 : m.status) === "pending").length;
      const assignedLicenses = teamMembers.filter((m) => (m == null ? void 0 : m.licenseType) && m.licenseType !== "BASIC").length;
      const totalLicenses = (licenses == null ? void 0 : licenses.length) || 0;
      const availableLicenses = Math.max(0, totalLicenses - assignedLicenses);
      return {
        totalMembers,
        activeMembers,
        pendingInvites,
        availableLicenses,
        totalLicenses,
        assignedLicenses
      };
    } catch (error) {
      console.error("Error calculating team statistics:", error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        availableLicenses: 0,
        totalLicenses: 0,
        assignedLicenses: 0
      };
    }
  }, [teamMembers, licenses]);
  const handleCSVExport = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!teamMembers || teamMembers.length === 0) {
      enqueueSnackbar("No team members to export", { variant: "warning" });
      return;
    }
    try {
      setIsLoading(true);
      const csvContent = yield csvService.exportTeamMembers(teamMembers, {
        includeInactive: true,
        includeAuditInfo: true
      });
      csvService.downloadCSV(csvContent, `team-members-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
      enqueueSnackbar("Team members exported successfully", { variant: "success" });
    } catch (error) {
      console.error("Failed to export CSV:", error);
      enqueueSnackbar("Failed to export CSV", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }), [teamMembers, enqueueSnackbar]);
  const handleCSVImport = reactExports.useCallback((file) => __async(void 0, null, function* () {
    var _a2;
    if (!((_a2 = orgContext == null ? void 0 : orgContext.organization) == null ? void 0 : _a2.id)) {
      enqueueSnackbar("Organization not found", { variant: "error" });
      return;
    }
    try {
      setIsLoading(true);
      const csvContent = yield file.text();
      const result = yield csvService.importTeamMembers(
        csvContent,
        orgContext.organization.id,
        (progress) => {
          console.log("CSV Import Progress:", progress);
        }
      );
      setCsvImportResult(result);
      if (result.success) {
        enqueueSnackbar(`Successfully imported ${result.successfulImports} team members`, { variant: "success" });
        refetchTeamMembers();
      } else {
        enqueueSnackbar(`Import completed with ${result.failedImports} errors`, { variant: "warning" });
      }
    } catch (error) {
      console.error("Failed to import CSV:", error);
      enqueueSnackbar("Failed to import CSV", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }), [(_a = orgContext == null ? void 0 : orgContext.organization) == null ? void 0 : _a.id, enqueueSnackbar, refetchTeamMembers]);
  const handleMenuClick = reactExports.useCallback((event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  }, []);
  const handleMenuClose = reactExports.useCallback(() => {
    setAnchorEl(null);
    setSelectedMember(null);
  }, []);
  const handleEditMember = reactExports.useCallback((member) => {
    setSelectedMember(member);
    setEditFormData({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email || "",
      role: member.role || "member",
      status: member.status || "active",
      department: member.department || "",
      position: member.position || "",
      phone: member.phone || ""
    });
    handleMenuClose();
    setEditMemberDialogOpen(true);
  }, []);
  const handleDeleteMember = reactExports.useCallback((member) => {
    setSelectedMember(member);
    handleMenuClose();
    setDeleteMemberDialogOpen(true);
  }, []);
  const handleAssignLicense = reactExports.useCallback((member) => {
    setSelectedMember(member);
    setSelectedLicenseId("");
    handleMenuClose();
    setAssignLicenseDialogOpen(true);
  }, []);
  const handleChangePassword = reactExports.useCallback((member) => {
    setSelectedMember(member);
    setPasswordFormData({
      newPassword: "",
      confirmPassword: ""
    });
    handleMenuClose();
    setChangePasswordDialogOpen(true);
  }, []);
  const handleResendInvite = reactExports.useCallback((member) => __async(void 0, null, function* () {
    var _a2, _b2;
    try {
      inviteTeamMember.mutate({
        email: member.email,
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        role: member.role || "member",
        status: member.status || "pending",
        department: member.department || "",
        position: member.position || "",
        phone: member.phone || "",
        organization: member.organization || {
          id: ((_a2 = orgContext == null ? void 0 : orgContext.organization) == null ? void 0 : _a2.id) || "",
          name: ((_b2 = orgContext == null ? void 0 : orgContext.organization) == null ? void 0 : _b2.name) || "",
          tier: "professional"
        },
        assignedProjects: member.assignedProjects || []
      });
      handleMenuClose();
      enqueueSnackbar("Invitation resent successfully", { variant: "success" });
    } catch (error) {
      console.error("Failed to resend invite:", error);
      enqueueSnackbar("Failed to resend invitation", { variant: "error" });
    }
  }), [inviteTeamMember, enqueueSnackbar, orgContext]);
  const handleSaveEditMember = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!selectedMember) return;
    try {
      updateTeamMember.mutate({
        memberId: selectedMember.id,
        updates: editFormData
      });
      setEditMemberDialogOpen(false);
      enqueueSnackbar("Team member updated successfully", { variant: "success" });
      refetchTeamMembers();
    } catch (error) {
      console.error("Failed to update team member:", error);
      enqueueSnackbar("Failed to update team member", { variant: "error" });
    }
  }), [selectedMember, editFormData, updateTeamMember, enqueueSnackbar, refetchTeamMembers]);
  const handleConfirmDeleteMember = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!selectedMember) return;
    try {
      removeTeamMember.mutate({ memberId: selectedMember.id });
      setDeleteMemberDialogOpen(false);
      enqueueSnackbar("Team member removed successfully", { variant: "success" });
      refetchTeamMembers();
    } catch (error) {
      console.error("Failed to remove team member:", error);
      enqueueSnackbar("Failed to remove team member", { variant: "error" });
    }
  }), [selectedMember, removeTeamMember, enqueueSnackbar, refetchTeamMembers]);
  const handleAssignLicenseToMember = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!selectedMember || !selectedLicenseId) return;
    try {
      assignLicense.mutate({
        licenseId: selectedLicenseId,
        userId: selectedMember.id
      });
      setAssignLicenseDialogOpen(false);
      enqueueSnackbar("License assigned successfully", { variant: "success" });
      refetchTeamMembers();
    } catch (error) {
      console.error("Failed to assign license:", error);
      enqueueSnackbar("Failed to assign license", { variant: "error" });
    }
  }), [selectedMember, selectedLicenseId, assignLicense, enqueueSnackbar, refetchTeamMembers]);
  const handleChangeMemberPassword = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!selectedMember || !passwordFormData.newPassword) return;
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return;
    }
    if (passwordFormData.newPassword.length < 8) {
      enqueueSnackbar("Password must be at least 8 characters long", { variant: "error" });
      return;
    }
    try {
      changeTeamMemberPassword.mutate({
        memberId: selectedMember.id,
        newPassword: passwordFormData.newPassword
      });
      setChangePasswordDialogOpen(false);
      enqueueSnackbar("Password changed successfully", { variant: "success" });
    } catch (error) {
      console.error("Failed to change password:", error);
      enqueueSnackbar("Failed to change password", { variant: "error" });
    }
  }), [selectedMember, passwordFormData, changeTeamMemberPassword, enqueueSnackbar]);
  const handleMemberSelection = (memberId, selected) => {
    if (selected) {
      setSelectedMembers((prev) => [...prev, memberId]);
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    }
  };
  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };
  const handleFilterChange = (newCriteria) => {
    setFilterCriteria(newCriteria);
    setPagination((prev) => __spreadProps(__spreadValues({}, prev), { page: 1 }));
  };
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };
  if (!currentUser) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "Team Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", children: "Please log in to access team management features." })
    ] });
  }
  if (userLoading || orgLoading || teamLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "Team Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { variant: "rectangular", height: 120 }) }, i)) })
    ] });
  }
  if (userError || orgError || teamError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "error", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Error Loading Team Data" }),
      userError || orgError || teamError || "Unknown error occurred"
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", component: "h1", children: "Team Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PersonAddIcon, {}),
            onClick: () => {
              console.log("🔍 [EnhancedTeamPage] Invite Member button clicked");
              setInviteDialogOpen(true);
            },
            sx: {
              background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
              color: "#000",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #00b8e6 0%, #5a6fd8 100%)"
              }
            },
            children: "Invite Member"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            startIcon: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}),
            onClick: handleCSVExport,
            disabled: isLoading || !teamMembers || teamMembers.length === 0,
            children: "Export CSV"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, {}),
            onClick: () => setShowCSVImport(true),
            disabled: isLoading,
            children: "Import CSV"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Total Members",
          value: teamStats.totalMembers,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, {}),
          color: "primary"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Active Members",
          value: teamStats.activeMembers,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
          color: "success"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Pending Invites",
          value: teamStats.pendingInvites,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Schedule, {}),
          color: "warning"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          title: "Available Licenses",
          value: teamStats.availableLicenses,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseIcon, {}),
          color: "primary"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 3, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            placeholder: "Search team members...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            InputProps: {
              startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) })
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(FilterList, {}),
            onClick: () => setShowFilters(!showFilters),
            children: "Filters"
          }
        )
      ] }),
      showFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { sx: { mb: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { title: "Advanced Filters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                multiple: true,
                value: filterCriteria.role || [],
                onChange: (e) => handleFilterChange(__spreadProps(__spreadValues({}, filterCriteria), {
                  role: e.target.value
                })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "admin", children: "Admin" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "member", children: "Member" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "viewer", children: "Viewer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "owner", children: "Owner" })
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                multiple: true,
                value: filterCriteria.status || [],
                onChange: (e) => handleFilterChange(__spreadProps(__spreadValues({}, filterCriteria), {
                  status: e.target.value
                })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "active", children: "Active" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "pending", children: "Pending" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "suspended", children: "Suspended" })
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Department" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Select,
              {
                multiple: true,
                value: filterCriteria.department || [],
                onChange: (e) => handleFilterChange(__spreadProps(__spreadValues({}, filterCriteria), {
                  department: e.target.value
                }))
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "License Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                multiple: true,
                value: filterCriteria.licenseType || [],
                onChange: (e) => handleFilterChange(__spreadProps(__spreadValues({}, filterCriteria), {
                  licenseType: e.target.value
                })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "BASIC", children: "Basic" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PROFESSIONAL", children: "Professional" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ENTERPRISE", children: "Enterprise" })
                ]
              }
            )
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { padding: "checkbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              indeterminate: selectedMembers.length > 0 && selectedMembers.length < filteredMembers.length,
              checked: filteredMembers.length > 0 && selectedMembers.length === filteredMembers.length,
              onChange: (e) => handleSelectAll(e.target.checked)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Department" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "License" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Last Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredMembers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No team members found" }) }) }) : filteredMembers.map((member) => {
          var _a2, _b2;
          if (!member || !member.id) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { padding: "checkbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: selectedMembers.includes(member.id),
                onChange: (e) => handleMemberSelection(member.id, e.target.checked)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { children: [
                ((_a2 = member.firstName) == null ? void 0 : _a2[0]) || "?",
                ((_b2 = member.lastName) == null ? void 0 : _b2[0]) || "?"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", children: [
                  member.firstName || "Unknown",
                  " ",
                  member.lastName || "User"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: member.email || "No email" })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: member.role || "member",
                color: member.role === "admin" ? "primary" : "default",
                size: "small"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: member.status || "unknown",
                color: member.status === "active" ? "success" : "default",
                size: "small"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: member.department || "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: member.licenseType ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: member.licenseType,
                color: "info",
                size: "small"
              }
            ) : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: member.lastActive ? new Date(member.lastActive).toLocaleDateString() : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: (event) => handleMenuClick(event, member),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoreVertIcon, {})
              }
            ) })
          ] }, member.id);
        }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", mt: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Pagination,
        {
          count: Math.ceil(filteredMembers.length / pagination.pageSize),
          page: pagination.page,
          onChange: (e, page) => handlePaginationChange(__spreadProps(__spreadValues({}, pagination), { page })),
          color: "primary"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: showCSVImport, onClose: () => setShowCSVImport(false), maxWidth: "md", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Import Team Members from CSV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outlined",
            component: "label",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, {}),
            fullWidth: true,
            children: [
              "Choose CSV File",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "file",
                  accept: ".csv",
                  hidden: true,
                  onChange: (e) => {
                    var _a2;
                    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
                    if (file) handleCSVImport(file);
                  }
                }
              )
            ]
          }
        ) }),
        csvImportResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: csvImportResult.success ? "success" : "warning", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertTitle, { children: [
            "Import ",
            csvImportResult.success ? "Successful" : "Completed with Errors"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
            "Processed: ",
            csvImportResult.totalRows,
            " rows"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
            "Successful: ",
            csvImportResult.successfulImports
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
            "Failed: ",
            csvImportResult.failedImports
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setShowCSVImport(false), children: "Close" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Menu,
      {
        anchorEl,
        open: Boolean(anchorEl),
        onClose: handleMenuClose,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right"
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "right"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => selectedMember && handleEditMember(selectedMember), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {}) }),
            "Edit Member"
          ] }),
          ((_b = selectedMember == null ? void 0 : selectedMember.status) == null ? void 0 : _b.toLowerCase()) === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => selectedMember && handleResendInvite(selectedMember), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Email, {}) }),
            "Resend Invite"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => selectedMember && handleAssignLicense(selectedMember), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, {}) }),
            "Assign License"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { onClick: () => selectedMember && handleChangePassword(selectedMember), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, {}) }),
            "Change Password"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MenuItem,
            {
              onClick: () => selectedMember && handleDeleteMember(selectedMember),
              sx: { color: "error.main" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { sx: { color: "error.main" } }) }),
                "Remove Member"
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: editMemberDialogOpen, onClose: () => setEditMemberDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Team Member" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "First Name",
            value: editFormData.firstName,
            onChange: (e) => setEditFormData(__spreadProps(__spreadValues({}, editFormData), { firstName: e.target.value })),
            fullWidth: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Last Name",
            value: editFormData.lastName,
            onChange: (e) => setEditFormData(__spreadProps(__spreadValues({}, editFormData), { lastName: e.target.value })),
            fullWidth: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Email",
            type: "email",
            value: editFormData.email,
            onChange: (e) => setEditFormData(__spreadProps(__spreadValues({}, editFormData), { email: e.target.value })),
            fullWidth: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: editFormData.role,
              onChange: (e) => setEditFormData(__spreadProps(__spreadValues({}, editFormData), { role: e.target.value })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "admin", children: "Admin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "member", children: "Member" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "viewer", children: "Viewer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "owner", children: "Owner" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: editFormData.status,
              onChange: (e) => setEditFormData(__spreadProps(__spreadValues({}, editFormData), { status: e.target.value })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "active", children: "Active" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "suspended", children: "Suspended" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "removed", children: "Removed" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Department",
            value: editFormData.department,
            onChange: (e) => setEditFormData(__spreadProps(__spreadValues({}, editFormData), { department: e.target.value })),
            fullWidth: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Position",
            value: editFormData.position,
            onChange: (e) => setEditFormData(__spreadProps(__spreadValues({}, editFormData), { position: e.target.value })),
            fullWidth: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Phone",
            value: editFormData.phone,
            onChange: (e) => setEditFormData(__spreadProps(__spreadValues({}, editFormData), { phone: e.target.value })),
            fullWidth: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setEditMemberDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSaveEditMember,
            variant: "contained",
            disabled: updateTeamMember.loading,
            children: updateTeamMember.loading ? "Saving..." : "Save Changes"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: assignLicenseDialogOpen, onClose: () => setAssignLicenseDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Assign License" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [
          "Assign a license to ",
          selectedMember == null ? void 0 : selectedMember.firstName,
          " ",
          selectedMember == null ? void 0 : selectedMember.lastName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Select License" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Select,
            {
              value: selectedLicenseId,
              onChange: (e) => setSelectedLicenseId(e.target.value),
              children: licenses == null ? void 0 : licenses.filter((license) => !license.assignedTo).map((license) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: license.id, children: [
                license.tier,
                " - ",
                license.key
              ] }, license.id))
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setAssignLicenseDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleAssignLicenseToMember,
            variant: "contained",
            disabled: !selectedLicenseId || assignLicense.loading,
            children: assignLicense.loading ? "Assigning..." : "Assign License"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: changePasswordDialogOpen, onClose: () => setChangePasswordDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Change Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
          "Change password for ",
          selectedMember == null ? void 0 : selectedMember.firstName,
          " ",
          selectedMember == null ? void 0 : selectedMember.lastName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "New Password",
            type: "password",
            value: passwordFormData.newPassword,
            onChange: (e) => setPasswordFormData(__spreadProps(__spreadValues({}, passwordFormData), { newPassword: e.target.value })),
            fullWidth: true,
            helperText: "Password must be at least 8 characters long"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Confirm Password",
            type: "password",
            value: passwordFormData.confirmPassword,
            onChange: (e) => setPasswordFormData(__spreadProps(__spreadValues({}, passwordFormData), { confirmPassword: e.target.value })),
            fullWidth: true
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setChangePasswordDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleChangeMemberPassword,
            variant: "contained",
            disabled: !passwordFormData.newPassword || !passwordFormData.confirmPassword || changeTeamMemberPassword.loading,
            children: changeTeamMemberPassword.loading ? "Changing..." : "Change Password"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: deleteMemberDialogOpen, onClose: () => setDeleteMemberDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Team Member" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "warning", sx: { mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Warning" }),
          "This action cannot be undone. The team member will be permanently removed from your organization."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
          "Are you sure you want to remove ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            selectedMember == null ? void 0 : selectedMember.firstName,
            " ",
            selectedMember == null ? void 0 : selectedMember.lastName
          ] }),
          " from the team?"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDeleteMemberDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleConfirmDeleteMember,
            variant: "contained",
            color: "error",
            disabled: removeTeamMember.loading,
            children: removeTeamMember.loading ? "Removing..." : "Remove Member"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SimpleInviteTeamMemberDialog,
      {
        open: inviteDialogOpen,
        onClose: () => setInviteDialogOpen(false),
        onSuccess: (teamMember) => {
          console.log("✅ [EnhancedTeamPage] Team member created successfully:", teamMember);
          refetchTeamMembers();
          refetchLicenses();
        },
        currentUser,
        organization: orgContext,
        availableLicenses: (licenses == null ? void 0 : licenses.filter(
          (l) => (l.status === "PENDING" || l.status === "ACTIVE") && !l.assignedTo
        )) || []
      }
    )
  ] });
});
export {
  EnhancedTeamPage as default
};
