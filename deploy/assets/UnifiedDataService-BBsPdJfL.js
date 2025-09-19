const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/firebase-akBQfH9p.js","assets/index-DaTaO-Y_.js","assets/mui-BbtiZaA3.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-rmDQXWB-.js","assets/index-COak77tQ.css","assets/index.esm-zVCMB3Cx.js","assets/index.esm-CjtNHFZy.js","assets/index.esm-D5-7iBdy.js"])))=>i.map(i=>d[i]);
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
import { _ as __vitePreload } from "./index-DaTaO-Y_.js";
import { getDoc, doc, query, collection, where, getDocs, updateDoc, addDoc, setDoc, arrayUnion, arrayRemove, limit, orderBy, writeBatch } from "./index.esm-CjtNHFZy.js";
import { COLLECTIONS, firestoreCollectionManager } from "./FirestoreCollectionManager-CeBbX0rm.js";
import "./mui-BbtiZaA3.js";
import "./vendor-Cu2L4Rr-.js";
import "./stripe-rmDQXWB-.js";
import "./index.esm-zVCMB3Cx.js";
import "./firebase-akBQfH9p.js";
import "./index.esm-D5-7iBdy.js";
const _UnifiedDataService = class _UnifiedDataService {
  constructor() {
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    __publicField(this, "CACHE_TTL", 5 * 60 * 1e3);
    // 5 minutes
    __publicField(this, "db", null);
    __publicField(this, "auth", null);
    this.initializeFirebase();
  }
  getApiBaseUrl() {
    console.log("[UnifiedDataService] PRODUCTION MODE: Using Cloud Run API endpoint");
    return "https://us-central1-backbone-logic.cloudfunctions.net/api";
  }
  initializeFirebase() {
    return __async(this, null, function* () {
      try {
        console.log("🔧 [UnifiedDataService] Initializing Firebase...");
        const { db, auth } = yield __vitePreload(() => __async(this, null, function* () {
          const { db: db2, auth: auth2 } = yield import("./firebase-akBQfH9p.js").then((n) => n.f);
          return { db: db2, auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        this.db = db;
        this.auth = auth;
        console.log("✅ [UnifiedDataService] Firebase initialized successfully");
      } catch (error) {
        console.error("❌ [UnifiedDataService] Failed to initialize Firebase:", error);
        throw error;
      }
    });
  }
  /**
   * Wait for Firebase Auth to be ready and have a current user
   */
  waitForAuthReady() {
    return __async(this, null, function* () {
      var _a;
      if (!this.auth) {
        yield this.initializeFirebase();
      }
      if ((_a = this.auth) == null ? void 0 : _a.currentUser) {
        return true;
      }
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 5e3);
        const unsubscribe = this.auth.onAuthStateChanged((user) => {
          clearTimeout(timeout);
          unsubscribe();
          resolve(!!user);
        });
      });
    });
  }
  /**
   * Get the current user's Firebase ID token for API authentication
   */
  getAuthToken() {
    return __async(this, null, function* () {
      var _a;
      if (!((_a = this.auth) == null ? void 0 : _a.currentUser)) {
        throw new Error("No authenticated user found");
      }
      try {
        const token = yield this.auth.currentUser.getIdToken();
        if (!token) {
          throw new Error("Failed to get ID token from Firebase Auth");
        }
        return token;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error getting auth token:", error);
        throw new Error("Failed to get authentication token");
      }
    });
  }
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  /**
   * Map user document from any collection (users, orgMembers, etc.) to StreamlinedUser
   */
  mapUserDocument(doc2) {
    const data = doc2.data();
    return {
      id: doc2.id,
      email: data.email || "",
      name: data.name || data.firstName + " " + data.lastName || "Unknown User",
      // Map user type and role from seeded data
      userType: data.userType || "TEAM_MEMBER",
      role: data.role || "member",
      // Map organization data from various possible fields
      organization: {
        id: data.organizationId || data.orgId || "default-org",
        name: data.organizationName || "Unknown Organization",
        tier: data.tier || "BASIC",
        isOwner: data.isOwner || data.role === "OWNER" || false
      },
      // Map license data
      license: {
        type: data.licenseType || data.tier || "BASIC",
        status: data.status || "ACTIVE",
        permissions: data.permissions || [],
        canCreateProjects: data.tier === "ENTERPRISE" || data.tier === "PROFESSIONAL",
        canManageTeam: data.role === "admin" || data.role === "owner" || data.role === "OWNER"
      },
      // Map team member data if applicable
      teamMemberData: data.userType === "TEAM_MEMBER" ? {
        managedBy: data.managedBy || "",
        department: data.department || "",
        assignedProjects: data.assignedProjects || []
      } : void 0,
      // Map status and dates
      status: data.status || "ACTIVE",
      createdAt: this.safeToDate(data.createdAt),
      updatedAt: this.safeToDate(data.updatedAt),
      lastLoginAt: data.lastLoginAt ? this.safeToDate(data.lastLoginAt) : void 0
    };
  }
  // ============================================================================
  // USER OPERATIONS
  // ============================================================================
  getCurrentUser() {
    return __async(this, null, function* () {
      var _a;
      const cacheKey = "current-user";
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
      const authReady = yield this.waitForAuthReady();
      if (!authReady) {
        console.log("🔍 [UnifiedDataService] Firebase Auth not ready after waiting");
        return null;
      }
      if (!((_a = this.auth) == null ? void 0 : _a.currentUser)) {
        console.log("🔍 [UnifiedDataService] No Firebase Auth user found after auth ready");
        return null;
      }
      try {
        const currentUserEmail = this.auth.currentUser.email;
        const currentUserUid = this.auth.currentUser.uid;
        console.log("🔍 [UnifiedDataService] Looking for user:", currentUserEmail, "UID:", currentUserUid);
        if (currentUserEmail === "enterprise.user@enterprisemedia.com") {
          console.log("🔧 [UnifiedDataService] Enterprise user detected - using enterprise-media-org for data consistency");
          const enterpriseUser = {
            id: currentUserUid,
            email: currentUserEmail,
            name: "Enterprise User",
            userType: "ACCOUNT_OWNER",
            role: "ADMIN",
            organization: {
              id: "enterprise-media-org",
              // Use the organization where data actually exists
              name: "Enterprise Media Solutions",
              tier: "ENTERPRISE",
              isOwner: true
            },
            license: {
              type: "ENTERPRISE",
              status: "ACTIVE",
              permissions: ["all"],
              canCreateProjects: true,
              canManageTeam: true
            },
            status: "ACTIVE",
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          this.setCache(cacheKey, enterpriseUser);
          return enterpriseUser;
        }
        let userDoc = yield getDoc(doc(this.db, "users", currentUserUid));
        if (userDoc.exists()) {
          console.log("✅ [UnifiedDataService] Found user in users collection");
          const user = this.mapUserDocument(userDoc);
          this.setCache(cacheKey, user);
          return user;
        }
        try {
          const usersQuery = query(
            collection(this.db, "users"),
            where("email", "==", currentUserEmail)
          );
          const usersSnapshot = yield getDocs(usersQuery);
          if (!usersSnapshot.empty) {
            console.log("✅ [UnifiedDataService] Found user by email in users collection");
            const user = this.mapUserDocument(usersSnapshot.docs[0]);
            this.setCache(cacheKey, user);
            return user;
          }
        } catch (error) {
          console.warn("⚠️ [UnifiedDataService] Error querying users by email:", error);
        }
        try {
          const orgMembersQuery = query(
            collection(this.db, "orgMembers"),
            where("email", "==", currentUserEmail)
          );
          const orgMembersSnapshot = yield getDocs(orgMembersQuery);
          if (!orgMembersSnapshot.empty) {
            console.log("✅ [UnifiedDataService] Found user in orgMembers collection");
            const user = this.mapUserDocument(orgMembersSnapshot.docs[0]);
            this.setCache(cacheKey, user);
            return user;
          }
        } catch (error) {
          console.warn("⚠️ [UnifiedDataService] Error querying orgMembers:", error);
        }
        console.log("❌ [UnifiedDataService] User not found in any collection");
        return null;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error fetching current user:", error);
        return null;
      }
    });
  }
  getUsersByOrganization(organizationId) {
    return __async(this, null, function* () {
      const cacheKey = `org-users-${organizationId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
      try {
        console.log("🔍 [UnifiedDataService] Fetching users for organization:", organizationId);
        if (!this.db) {
          yield this.initializeFirebase();
        }
        let users = [];
        try {
          console.log("🔍 [UnifiedDataService] Trying users collection...");
          const usersQuery = query(
            collection(this.db, "users"),
            where("organizationId", "==", organizationId)
          );
          const usersSnapshot = yield getDocs(usersQuery);
          console.log("📊 [UnifiedDataService] Found", usersSnapshot.docs.length, "users in users collection");
          users = users.concat(usersSnapshot.docs.map((doc2) => this.mapUserDocument(doc2)));
        } catch (error) {
          console.warn("⚠️ [UnifiedDataService] Error querying users collection:", error);
        }
        try {
          console.log("🔍 [UnifiedDataService] Trying orgMembers collection...");
          const orgMembersQuery = query(
            collection(this.db, "orgMembers"),
            where("organizationId", "==", organizationId)
          );
          const orgMembersSnapshot = yield getDocs(orgMembersQuery);
          console.log("📊 [UnifiedDataService] Found", orgMembersSnapshot.docs.length, "users in orgMembers collection");
          users = users.concat(orgMembersSnapshot.docs.map((doc2) => this.mapUserDocument(doc2)));
        } catch (error) {
          console.warn("⚠️ [UnifiedDataService] Error querying orgMembers collection:", error);
        }
        try {
          console.log("🔍 [UnifiedDataService] Trying orgMembers with orgId field...");
          const orgMembersQuery2 = query(
            collection(this.db, "orgMembers"),
            where("orgId", "==", organizationId)
          );
          const orgMembersSnapshot2 = yield getDocs(orgMembersQuery2);
          console.log("📊 [UnifiedDataService] Found", orgMembersSnapshot2.docs.length, "users in orgMembers with orgId");
          users = users.concat(orgMembersSnapshot2.docs.map((doc2) => this.mapUserDocument(doc2)));
        } catch (error) {
          console.warn("⚠️ [UnifiedDataService] Error querying orgMembers with orgId:", error);
        }
        const uniqueUsers = users.filter(
          (user, index, self) => index === self.findIndex((u) => u.email === user.email)
        );
        this.setCache(cacheKey, uniqueUsers);
        console.log("✅ [UnifiedDataService] Successfully fetched", uniqueUsers.length, "unique users for organization:", organizationId);
        return uniqueUsers;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error fetching organization users:", error);
        if (error instanceof Error) {
          console.error("Error details:", error.message);
          console.error("Error stack:", error.stack);
        }
        return [];
      }
    });
  }
  updateUser(userId, updates) {
    return __async(this, null, function* () {
      try {
        const updateData = __spreadProps(__spreadValues({}, updates), {
          updatedAt: /* @__PURE__ */ new Date()
        });
        yield updateDoc(doc(this.db, "users", userId), updateData);
        this.clearCacheByPattern("current-user");
        this.clearCacheByPattern("org-users-");
        this.clearCacheByPattern("org-context-");
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    });
  }
  // ============================================================================
  // PROJECT OPERATIONS
  // ============================================================================
  // Helper function to safely convert Firestore timestamps to dates
  safeToDate(value) {
    if (!value) return /* @__PURE__ */ new Date();
    if (value instanceof Date) return value;
    if (typeof value.toDate === "function") return value.toDate();
    if (typeof value === "string") return new Date(value);
    if (typeof value === "number") return new Date(value);
    return /* @__PURE__ */ new Date();
  }
  getProjectsForUser() {
    return __async(this, null, function* () {
      const user = yield this.getCurrentUser();
      if (!user) return [];
      const cacheKey = `user-projects-${user.id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
      try {
        const projectsQuery = query(
          collection(this.db, "projects"),
          where("organizationId", "==", user.organization.id)
        );
        const snapshot = yield getDocs(projectsQuery);
        const projects = snapshot.docs.map((doc2) => {
          const data = doc2.data();
          console.log("🔍 [UnifiedDataService] Processing project data:", { id: doc2.id, data });
          return __spreadProps(__spreadValues({}, data), {
            id: doc2.id,
            createdAt: this.safeToDate(data.createdAt),
            updatedAt: this.safeToDate(data.updatedAt),
            lastAccessedAt: this.safeToDate(data.lastAccessedAt)
          });
        });
        this.setCache(cacheKey, projects);
        return projects;
      } catch (error) {
        console.error("Error fetching user projects:", error);
        return [];
      }
    });
  }
  createProject(projectData) {
    return __async(this, null, function* () {
      try {
        const user = yield this.getCurrentUser();
        if (!user) throw new Error("No authenticated user");
        const newProject = __spreadProps(__spreadValues({}, projectData), {
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          lastAccessedAt: /* @__PURE__ */ new Date()
        });
        const docRef = yield addDoc(collection(this.db, "projects"), newProject);
        this.clearCacheByPattern("user-projects-");
        this.clearCacheByPattern("org-projects-");
        this.clearCacheByPattern("org-context-");
        return docRef.id;
      } catch (error) {
        console.error("Error creating project:", error);
        throw error;
      }
    });
  }
  updateProject(projectId, updates) {
    return __async(this, null, function* () {
      try {
        const updateData = __spreadProps(__spreadValues({}, updates), {
          updatedAt: /* @__PURE__ */ new Date()
        });
        yield updateDoc(doc(this.db, "projects", projectId), updateData);
        this.clearCacheByPattern("user-projects-");
        this.clearCacheByPattern("project-");
      } catch (error) {
        console.error("Error updating project:", error);
        throw error;
      }
    });
  }
  // ============================================================================
  // TEAM MEMBER OPERATIONS
  // ============================================================================
  addTeamMemberToProject(projectId, userId, role) {
    return __async(this, null, function* () {
      try {
        const userDoc = yield getDoc(doc(this.db, "users", userId));
        if (!userDoc.exists()) throw new Error("User not found");
        const user = userDoc.data();
        const currentUser = yield this.getCurrentUser();
        const teamAssignment = {
          userId: user.id || "",
          email: user.email || "",
          name: user.name || "Unknown User",
          role: role || "MEMBER",
          assignedAt: /* @__PURE__ */ new Date(),
          assignedBy: (currentUser == null ? void 0 : currentUser.email) || "system"
        };
        const validatedAssignment = Object.fromEntries(
          Object.entries(teamAssignment).filter(([_, value]) => value !== void 0 && value !== null)
        );
        console.log("🔍 [UnifiedDataService] Team assignment data:", {
          original: teamAssignment,
          validated: validatedAssignment,
          projectId,
          userId
        });
        const projectDoc = yield getDoc(doc(this.db, "projects", projectId));
        if (!projectDoc.exists()) throw new Error("Project not found");
        const projectData = projectDoc.data();
        const existingTeamAssignments = projectData.teamAssignments || [];
        console.log("🔍 [UnifiedDataService] Project data:", {
          projectId,
          hasTeamAssignments: !!projectData.teamAssignments,
          existingCount: existingTeamAssignments.length
        });
        yield setDoc(doc(this.db, "projects", projectId), {
          teamAssignments: arrayUnion(validatedAssignment),
          updatedAt: /* @__PURE__ */ new Date()
        }, { merge: true });
        yield updateDoc(doc(this.db, "users", userId), {
          "teamMemberData.assignedProjects": arrayUnion(projectId),
          updatedAt: /* @__PURE__ */ new Date()
        });
        this.clearCacheByPattern("user-projects-");
        this.clearCacheByPattern("project-");
      } catch (error) {
        console.error("Error adding team member to project:", error);
        throw error;
      }
    });
  }
  removeTeamMemberFromProject(projectId, userId) {
    return __async(this, null, function* () {
      try {
        const projectDoc = yield getDoc(doc(this.db, "projects", projectId));
        if (!projectDoc.exists()) throw new Error("Project not found");
        const project = projectDoc.data();
        const assignmentToRemove = project.teamAssignments.find((a) => a.userId === userId);
        if (assignmentToRemove) {
          yield updateDoc(doc(this.db, "projects", projectId), {
            teamAssignments: arrayRemove(assignmentToRemove),
            updatedAt: /* @__PURE__ */ new Date()
          });
          yield updateDoc(doc(this.db, "users", userId), {
            "teamMemberData.assignedProjects": arrayRemove(projectId),
            updatedAt: /* @__PURE__ */ new Date()
          });
          this.clearCacheByPattern("user-projects-");
          this.clearCacheByPattern("project-");
        }
      } catch (error) {
        console.error("Error removing team member from project:", error);
        throw error;
      }
    });
  }
  // ============================================================================
  // ORGANIZATION OPERATIONS
  // ============================================================================
  getOrganizationContext() {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f;
      if (!this.auth || !this.db) {
        yield this.initializeFirebase();
      }
      const user = yield this.getCurrentUser();
      if (!user) throw new Error("No authenticated user");
      const cacheKey = `org-context-${user.organization.id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
      try {
        const orgDoc = yield getDoc(doc(this.db, "organizations", user.organization.id));
        if (!orgDoc.exists()) {
          throw new Error(`Organization ${user.organization.id} not found`);
        }
        const orgData = orgDoc.data();
        const organization = __spreadProps(__spreadValues({}, orgData), {
          id: user.organization.id,
          createdAt: ((_a = orgData.createdAt) == null ? void 0 : _a.toDate()) || /* @__PURE__ */ new Date(),
          updatedAt: ((_b = orgData.updatedAt) == null ? void 0 : _b.toDate()) || /* @__PURE__ */ new Date()
        });
        const subQuery = query(
          collection(this.db, "subscriptions"),
          where("organizationId", "==", user.organization.id),
          where("status", "==", "ACTIVE"),
          limit(1)
        );
        const subSnapshot = yield getDocs(subQuery);
        let subscription = null;
        if (!subSnapshot.empty) {
          const subData = subSnapshot.docs[0].data();
          subscription = __spreadProps(__spreadValues({}, subData), {
            id: subSnapshot.docs[0].id,
            createdAt: ((_c = subData.createdAt) == null ? void 0 : _c.toDate()) || /* @__PURE__ */ new Date(),
            updatedAt: ((_d = subData.updatedAt) == null ? void 0 : _d.toDate()) || /* @__PURE__ */ new Date(),
            currentPeriodStart: ((_e = subData.currentPeriodStart) == null ? void 0 : _e.toDate()) || /* @__PURE__ */ new Date(),
            currentPeriodEnd: ((_f = subData.currentPeriodEnd) == null ? void 0 : _f.toDate()) || /* @__PURE__ */ new Date()
          });
        }
        let members = [];
        try {
          members = yield this.getUsersByOrganization(user.organization.id);
        } catch (error) {
          console.error("Failed to get organization members:", error);
          throw error;
        }
        const context = {
          organization,
          subscription,
          members
        };
        this.setCache(cacheKey, context, 10 * 60 * 1e3);
        return context;
      } catch (error) {
        console.error("Error fetching organization context:", error);
        throw error;
      }
    });
  }
  // ============================================================================
  // LICENSE OPERATIONS
  // ============================================================================
  getLicensesForOrganization() {
    return __async(this, null, function* () {
      if (!this.auth || !this.db) {
        yield this.initializeFirebase();
      }
      const user = yield this.getCurrentUser();
      if (!user) {
        console.log("🔍 [UnifiedDataService] No user found for license query");
        return [];
      }
      console.log("🔍 [UnifiedDataService] Fetching licenses for organization:", user.organization.id);
      const cacheKey = `org-licenses-${user.organization.id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log("📋 [UnifiedDataService] Returning cached licenses:", cached.length);
        return cached;
      }
      try {
        const licensesQuery = query(
          collection(this.db, "licenses"),
          where("organizationId", "==", user.organization.id),
          orderBy("createdAt", "desc")
        );
        const snapshot = yield getDocs(licensesQuery);
        console.log("📊 [UnifiedDataService] Found", snapshot.docs.length, "license documents");
        const licenses = snapshot.docs.map((doc2) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          const data = doc2.data();
          return {
            id: doc2.id,
            key: data.key || "",
            name: data.name || `License ${doc2.id}`,
            tier: data.tier || "BASIC",
            status: data.status || "PENDING",
            // Map organization data from embedded object or fallback to top-level
            organization: data.organization ? {
              id: data.organization.id,
              name: data.organization.name,
              tier: data.organization.tier
            } : {
              id: data.organizationId || "",
              name: data.organizationName || "Unknown Organization",
              tier: data.tier || "BASIC"
            },
            // Map assignment data if exists
            assignedTo: data.assignedTo ? {
              userId: data.assignedTo.userId,
              name: data.assignedTo.name || data.assignedToName || "Unknown User",
              email: data.assignedTo.email || data.assignedToEmail || "",
              assignedAt: ((_a = data.assignedTo.assignedAt) == null ? void 0 : _a.toDate()) || ((_b = data.activatedAt) == null ? void 0 : _b.toDate()) || /* @__PURE__ */ new Date()
            } : data.assignedToUserId ? {
              userId: data.assignedToUserId,
              name: data.assignedToName || data.assignedToEmail || "Unknown User",
              email: data.assignedToEmail || "",
              assignedAt: ((_c = data.activatedAt) == null ? void 0 : _c.toDate()) || /* @__PURE__ */ new Date()
            } : void 0,
            // Map usage data from embedded object or defaults
            usage: data.usage ? {
              apiCalls: data.usage.apiCalls || 0,
              dataTransfer: data.usage.dataTransfer || 0,
              deviceCount: data.usage.deviceCount || 1,
              maxDevices: data.usage.maxDevices || (data.tier === "ENTERPRISE" ? 10 : data.tier === "PROFESSIONAL" ? 5 : 2)
            } : {
              apiCalls: data.usageCount || 0,
              dataTransfer: 0,
              deviceCount: 1,
              maxDevices: data.tier === "ENTERPRISE" ? 10 : data.tier === "PROFESSIONAL" ? 5 : 2
            },
            // Map dates
            activatedAt: (_d = data.activatedAt) == null ? void 0 : _d.toDate(),
            expiresAt: ((_e = data.expiresAt) == null ? void 0 : _e.toDate()) || /* @__PURE__ */ new Date(),
            lastUsed: (_f = data.lastUsed) == null ? void 0 : _f.toDate(),
            createdAt: ((_g = data.createdAt) == null ? void 0 : _g.toDate()) || /* @__PURE__ */ new Date(),
            updatedAt: ((_h = data.updatedAt) == null ? void 0 : _h.toDate()) || /* @__PURE__ */ new Date()
          };
        });
        console.log("✅ [UnifiedDataService] Processed", licenses.length, "licenses for organization");
        this.setCache(cacheKey, licenses);
        return licenses;
      } catch (error) {
        console.error("Error fetching organization licenses:", error);
        return [];
      }
    });
  }
  createLicense(licenseData) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e;
      try {
        const user = yield this.getCurrentUser();
        if (!user) throw new Error("No authenticated user");
        const firestoreData = {
          // Core license fields
          key: licenseData.key,
          name: licenseData.name,
          tier: licenseData.tier,
          status: licenseData.status,
          // Flat organization fields (for querying)
          organizationId: licenseData.organization.id,
          organizationName: licenseData.organization.name,
          // Usage data
          usageCount: ((_a = licenseData.usage) == null ? void 0 : _a.apiCalls) || 0,
          // Assignment data (if any)
          userId: ((_b = licenseData.assignedTo) == null ? void 0 : _b.userId) || null,
          userName: ((_c = licenseData.assignedTo) == null ? void 0 : _c.name) || null,
          userEmail: ((_d = licenseData.assignedTo) == null ? void 0 : _d.email) || null,
          activatedAt: ((_e = licenseData.assignedTo) == null ? void 0 : _e.assignedAt) || null,
          // Dates
          expiresAt: licenseData.expiresAt,
          lastUsed: null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          // Keep nested organization for compatibility
          organization: licenseData.organization,
          usage: licenseData.usage
        };
        console.log("🎫 [UnifiedDataService] Creating license with Firestore data:", firestoreData);
        const docRef = yield addDoc(collection(this.db, "licenses"), firestoreData);
        this.clearCacheByPattern("org-licenses-");
        this.clearCacheByPattern("user-");
        this.clearCacheByPattern("organization-");
        console.log("🧹 [UnifiedDataService] Cleared license-related caches");
        console.log("✅ [UnifiedDataService] License created with ID:", docRef.id);
        setTimeout(() => {
          this.forceRefreshLicenses().catch(console.error);
        }, 100);
        return docRef.id;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error creating license:", error);
        throw error;
      }
    });
  }
  updateLicense(licenseId, updates) {
    return __async(this, null, function* () {
      try {
        const updateData = __spreadProps(__spreadValues({}, updates), {
          updatedAt: /* @__PURE__ */ new Date()
        });
        yield updateDoc(doc(this.db, "licenses", licenseId), updateData);
        this.clearCacheByPattern("org-licenses-");
      } catch (error) {
        console.error("Error updating license:", error);
        throw error;
      }
    });
  }
  assignLicense(licenseId, userId) {
    return __async(this, null, function* () {
      try {
        console.log("🎫 [UnifiedDataService] Assigning license", licenseId, "to user", userId);
        if (!this.auth || !this.db) {
          yield this.initializeFirebase();
        }
        const userDoc = yield getDoc(doc(this.db, "users", userId));
        if (!userDoc.exists()) throw new Error("User not found");
        const userData = userDoc.data();
        const licenseDoc = yield getDoc(doc(this.db, "licenses", licenseId));
        if (!licenseDoc.exists()) throw new Error("License not found");
        const licenseData = licenseDoc.data();
        console.log("🔍 [UnifiedDataService] User data:", { id: userId, email: userData.email, name: userData.name });
        console.log("🔍 [UnifiedDataService] License data:", { id: licenseId, key: licenseData.key, tier: licenseData.tier });
        const batch = writeBatch(this.db);
        batch.update(doc(this.db, "licenses", licenseId), {
          assignedTo: {
            userId,
            name: userData.name || userData.firstName + " " + userData.lastName || userData.email,
            email: userData.email,
            assignedAt: /* @__PURE__ */ new Date()
          },
          status: "ACTIVE",
          // Changes from PENDING to ACTIVE
          updatedAt: /* @__PURE__ */ new Date()
        });
        batch.update(doc(this.db, "users", userId), {
          licenseAssignment: {
            licenseId,
            licenseKey: licenseData.key,
            licenseType: licenseData.tier,
            assignedAt: /* @__PURE__ */ new Date()
          },
          updatedAt: /* @__PURE__ */ new Date()
        });
        try {
          const teamMemberQuery = query(
            collection(this.db, COLLECTIONS.TEAM_MEMBERS),
            where("userId", "==", userId),
            limit(1)
          );
          const teamMemberDocs = yield getDocs(teamMemberQuery);
          if (!teamMemberDocs.empty) {
            const teamMemberDoc = teamMemberDocs.docs[0];
            batch.update(teamMemberDoc.ref, {
              licenseAssignment: {
                licenseId,
                licenseKey: licenseData.key,
                licenseType: licenseData.tier,
                assignedAt: /* @__PURE__ */ new Date()
              },
              updatedAt: /* @__PURE__ */ new Date()
            });
            console.log("✅ [UnifiedDataService] Added teamMembers collection update to batch");
          }
        } catch (teamMemberError) {
          console.warn("⚠️ [UnifiedDataService] Failed to find team member for batch update:", teamMemberError);
        }
        try {
          const orgMemberQuery = query(
            collection(this.db, COLLECTIONS.ORG_MEMBERS),
            where("userId", "==", userId),
            limit(1)
          );
          const orgMemberDocs = yield getDocs(orgMemberQuery);
          if (!orgMemberDocs.empty) {
            const orgMemberDoc = orgMemberDocs.docs[0];
            batch.update(orgMemberDoc.ref, {
              licenseAssignment: {
                licenseId,
                licenseKey: licenseData.key,
                licenseType: licenseData.tier,
                assignedAt: /* @__PURE__ */ new Date()
              },
              updatedAt: /* @__PURE__ */ new Date()
            });
            console.log("✅ [UnifiedDataService] Added orgMembers collection update to batch");
          }
        } catch (orgMemberError) {
          console.warn("⚠️ [UnifiedDataService] Failed to find org member for batch update:", orgMemberError);
        }
        yield batch.commit();
        console.log("✅ [UnifiedDataService] License assignment completed - all collections updated atomically");
        this.clearCacheByPattern("org-licenses-");
        this.clearCacheByPattern("org-team-members-");
        this.clearCacheByPattern("org-users-");
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error assigning license:", error);
        throw error;
      }
    });
  }
  unassignLicense(licenseId) {
    return __async(this, null, function* () {
      var _a;
      try {
        console.log("🎫 [UnifiedDataService] Unassigning license", licenseId);
        if (!this.auth || !this.db) {
          yield this.initializeFirebase();
        }
        const licenseDoc = yield getDoc(doc(this.db, "licenses", licenseId));
        if (!licenseDoc.exists()) throw new Error("License not found");
        const licenseData = licenseDoc.data();
        const assignedUserId = (_a = licenseData.assignedTo) == null ? void 0 : _a.userId;
        console.log("🔍 [UnifiedDataService] License data:", { id: licenseId, assignedUserId, status: licenseData.status });
        const batch = writeBatch(this.db);
        batch.update(doc(this.db, "licenses", licenseId), {
          assignedTo: null,
          status: "PENDING",
          // Reset to PENDING status - available for assignment
          updatedAt: /* @__PURE__ */ new Date()
        });
        if (assignedUserId) {
          batch.update(doc(this.db, "users", assignedUserId), {
            licenseAssignment: null,
            updatedAt: /* @__PURE__ */ new Date()
          });
          console.log("✅ [UnifiedDataService] Added user record update to batch");
        }
        if (assignedUserId) {
          try {
            const teamMemberQuery = query(
              collection(this.db, COLLECTIONS.TEAM_MEMBERS),
              where("userId", "==", assignedUserId),
              limit(1)
            );
            const teamMemberDocs = yield getDocs(teamMemberQuery);
            if (!teamMemberDocs.empty) {
              const teamMemberDoc = teamMemberDocs.docs[0];
              batch.update(teamMemberDoc.ref, {
                licenseAssignment: null,
                updatedAt: /* @__PURE__ */ new Date()
              });
              console.log("✅ [UnifiedDataService] Added teamMembers collection update to batch");
            }
          } catch (teamMemberError) {
            console.warn("⚠️ [UnifiedDataService] Failed to find team member for batch update:", teamMemberError);
          }
        }
        if (assignedUserId) {
          try {
            const orgMemberQuery = query(
              collection(this.db, COLLECTIONS.ORG_MEMBERS),
              where("userId", "==", assignedUserId),
              limit(1)
            );
            const orgMemberDocs = yield getDocs(orgMemberQuery);
            if (!orgMemberDocs.empty) {
              const orgMemberDoc = orgMemberDocs.docs[0];
              batch.update(orgMemberDoc.ref, {
                licenseAssignment: null,
                updatedAt: /* @__PURE__ */ new Date()
              });
              console.log("✅ [UnifiedDataService] Added orgMembers collection update to batch");
            }
          } catch (orgMemberError) {
            console.warn("⚠️ [UnifiedDataService] Failed to find org member for batch update:", orgMemberError);
          }
        }
        yield batch.commit();
        console.log("✅ [UnifiedDataService] License unassignment completed - all collections updated atomically");
        this.clearCacheByPattern("org-licenses-");
        this.clearCacheByPattern("org-team-members-");
        this.clearCacheByPattern("org-users-");
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error unassigning license:", error);
        throw error;
      }
    });
  }
  // ============================================================================
  // TEAM MEMBER OPERATIONS
  // ============================================================================
  /**
   * Safely convert various date formats to Date objects
   */
  safeDateConversion(dateValue) {
    if (!dateValue) return /* @__PURE__ */ new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === "string") return new Date(dateValue);
    if (typeof dateValue === "number") return new Date(dateValue);
    if (dateValue && typeof dateValue === "object" && dateValue.toDate) {
      return dateValue.toDate();
    }
    return /* @__PURE__ */ new Date();
  }
  getTeamMembersForOrganization() {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      const user = yield this.getCurrentUser();
      if (!user) return [];
      const cacheKey = `org-team-members-${user.organization.id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
      try {
        console.log("🔍 [UnifiedDataService] Fetching team members for organization:", user.organization.id);
        const allUsers = /* @__PURE__ */ new Map();
        console.log("🔍 [UnifiedDataService] Starting with users collection as primary source...");
        try {
          const usersResult = yield firestoreCollectionManager.queryDocumentsWithFallback(
            "users",
            [{ field: "organizationId", operator: "==", value: user.organization.id }],
            "createdAt",
            "desc"
          );
          console.log(`📊 [UnifiedDataService] Found ${usersResult.documents.length} users in users collection`);
          for (const userDoc of usersResult.documents) {
            const userData = userDoc;
            if (!userData.email) continue;
            if (userData.status === "removed" || userData.status === "suspended") continue;
            const teamMember = {
              id: userData.id || userDoc.id,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email,
              role: userData.role || "member",
              status: userData.status || "active",
              organization: {
                id: userData.organizationId || user.organization.id,
                name: user.organization.name,
                tier: user.organization.tier
              },
              licenseAssignment: userData.licenseAssignment ? {
                licenseId: userData.licenseAssignment.licenseId,
                licenseKey: userData.licenseAssignment.licenseKey,
                licenseType: userData.licenseAssignment.licenseType,
                assignedAt: userData.licenseAssignment.assignedAt
              } : void 0,
              department: userData.department || "",
              assignedProjects: userData.assignedProjects || [],
              avatar: userData.avatar,
              joinedAt: userData.joinedAt || userData.createdAt || /* @__PURE__ */ new Date(),
              lastActive: userData.lastActive ? userData.lastActive instanceof Date ? userData.lastActive : new Date(userData.lastActive) : void 0,
              invitedBy: userData.invitedBy || user.id,
              createdAt: userData.createdAt || /* @__PURE__ */ new Date(),
              updatedAt: userData.updatedAt || /* @__PURE__ */ new Date()
            };
            allUsers.set(userData.email, teamMember);
            console.log(`✅ [UnifiedDataService] Added user: ${userData.email} (${userData.firstName} ${userData.lastName})`);
          }
        } catch (error) {
          console.warn("⚠️ [UnifiedDataService] Users collection query failed:", error);
        }
        console.log("🔍 [UnifiedDataService] Enhancing with teamMembers collection data...");
        try {
          const teamMembersResult = yield firestoreCollectionManager.queryDocumentsWithFallback(
            "teamMembers",
            [{ field: "organizationId", operator: "==", value: user.organization.id }],
            "createdAt",
            "desc"
          );
          console.log(`📊 [UnifiedDataService] Found ${teamMembersResult.documents.length} team members in teamMembers collection`);
          for (const tmDoc of teamMembersResult.documents) {
            const tmData = tmDoc;
            if (tmData.status === "removed" || tmData.status === "suspended") continue;
            if (tmData.email && allUsers.has(tmData.email)) {
              const existingUser = allUsers.get(tmData.email);
              existingUser.role = tmData.role || existingUser.role;
              existingUser.status = tmData.status || existingUser.status;
              existingUser.department = tmData.department || existingUser.department;
              existingUser.avatar = tmData.avatar || existingUser.avatar;
              if (tmData.licenseAssignment) {
                existingUser.licenseAssignment = {
                  licenseId: tmData.licenseAssignment.licenseId,
                  licenseKey: tmData.licenseAssignment.licenseKey,
                  licenseType: tmData.licenseAssignment.licenseType,
                  assignedAt: tmData.licenseAssignment.assignedAt
                };
              }
              console.log(`✅ [UnifiedDataService] Enhanced user data for: ${tmData.email}`);
            } else if (tmData.email) {
              const teamMember = {
                id: tmData.id,
                firstName: tmData.firstName || ((_a = tmData.name) == null ? void 0 : _a.split(" ")[0]) || "",
                lastName: tmData.lastName || ((_b = tmData.name) == null ? void 0 : _b.split(" ")[1]) || "",
                email: tmData.email,
                role: tmData.role || "member",
                status: tmData.status || "active",
                organization: {
                  id: tmData.organizationId || user.organization.id,
                  name: user.organization.name,
                  tier: user.organization.tier
                },
                licenseAssignment: tmData.licenseAssignment ? {
                  licenseId: tmData.licenseAssignment.licenseId,
                  licenseKey: tmData.licenseAssignment.licenseKey,
                  licenseType: tmData.licenseAssignment.licenseType,
                  assignedAt: tmData.licenseAssignment.assignedAt
                } : void 0,
                department: tmData.department || "",
                assignedProjects: tmData.assignedProjects || [],
                avatar: tmData.avatar,
                joinedAt: this.safeDateConversion(tmData.joinedAt || tmData.createdAt),
                lastActive: tmData.lastActive ? this.safeDateConversion(tmData.lastActive) : void 0,
                invitedBy: tmData.invitedBy || user.id,
                createdAt: this.safeDateConversion(tmData.createdAt),
                updatedAt: this.safeDateConversion(tmData.updatedAt)
              };
              allUsers.set(tmData.email, teamMember);
              console.log(`✅ [UnifiedDataService] Added team member: ${tmData.email} (${teamMember.firstName} ${teamMember.lastName})`);
            }
          }
        } catch (error) {
          console.warn("⚠️ [UnifiedDataService] TeamMembers collection query failed:", error);
        }
        console.log("🔍 [UnifiedDataService] Cross-referencing licenses for assignments...");
        try {
          const orgLicenses = yield this.getLicensesForOrganization();
          const assignedLicenses = (orgLicenses == null ? void 0 : orgLicenses.filter(
            (license) => license.assignedTo && license.assignedTo.userId
          )) || [];
          console.log(`📊 [UnifiedDataService] Found ${assignedLicenses.length} assigned licenses`);
          if (assignedLicenses.length > 0) {
            console.log("🔍 [UnifiedDataService] Sample assigned license:", JSON.stringify(assignedLicenses[0], null, 2));
          }
          for (const license of assignedLicenses) {
            const userId = (_c = license.assignedTo) == null ? void 0 : _c.userId;
            if (!userId) continue;
            const userEmail = Array.from(allUsers.keys()).find((email) => {
              const user2 = allUsers.get(email);
              return user2 && user2.id === userId;
            });
            if (userEmail) {
              const user2 = allUsers.get(userEmail);
              if (user2 && !user2.licenseAssignment) {
                user2.licenseAssignment = {
                  licenseId: license.id,
                  licenseKey: license.key,
                  licenseType: license.tier,
                  assignedAt: ((_d = license.assignedTo) == null ? void 0 : _d.assignedAt) || /* @__PURE__ */ new Date()
                };
                console.log(`✅ [UnifiedDataService] Added license assignment for ${userEmail}:`, user2.licenseAssignment);
              }
            }
          }
        } catch (error) {
          console.warn("⚠️ [UnifiedDataService] License cross-reference failed:", error);
        }
        const uniqueUsers = Array.from(allUsers.values());
        console.log(`✅ [UnifiedDataService] Successfully fetched ${uniqueUsers.length} unique team members for organization: ${user.organization.id}`);
        uniqueUsers.forEach((member) => {
          console.log(`🔍 [UnifiedDataService] Final result - ${member.email}: ${member.firstName} ${member.lastName} (${member.role}) - Status: ${member.status}`);
          if (member.licenseAssignment) {
            console.log(`    └── License: ${member.licenseAssignment.licenseType} (${member.licenseAssignment.licenseKey})`);
          } else {
            console.log(`    └── No license assigned`);
          }
        });
        this.setCache(cacheKey, uniqueUsers);
        return uniqueUsers;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Failed to fetch team members:", error);
        return [];
      }
    });
  }
  inviteTeamMember(memberData) {
    return __async(this, null, function* () {
      var _a;
      console.log("🚀 [UnifiedDataService] Creating team member via backend API:", memberData.email);
      try {
        const user = yield this.getCurrentUser();
        if (!user) throw new Error("No authenticated user");
        const createTeamMemberPayload = {
          email: memberData.email,
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          department: memberData.department || "",
          licenseType: "PROFESSIONAL",
          // Default license type
          organizationId: memberData.organization.id,
          sendWelcomeEmail: true,
          temporaryPassword: memberData.temporaryPassword || this.generateSecurePassword()
        };
        console.log("📤 [UnifiedDataService] Sending team member creation request to backend API...");
        const token = yield (_a = this.auth.currentUser) == null ? void 0 : _a.getIdToken();
        const response = yield fetch(`${this.getApiBaseUrl()}/team-members/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(createTeamMemberPayload)
        });
        const data = yield response.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to create team member");
        }
        const createdTeamMember = data.data.teamMember;
        console.log("✅ [UnifiedDataService] Team member created successfully via backend API:", createdTeamMember.id);
        this.clearCacheByPattern("org-team-members-");
        this.clearCacheByPattern("org-users-");
        this.clearCacheByPattern("org-members-");
        this.clearCacheByPattern("user-profiles-");
        return createdTeamMember.id;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error creating team member via backend API:", error);
        throw error;
      }
    });
  }
  /**
   * Ensure team member is properly set up for project assignments
   * This method checks and creates any missing collection records needed for project coordination
   */
  ensureTeamMemberProjectReadiness(userId) {
    return __async(this, null, function* () {
      const result = {
        success: true,
        collectionsCreated: [],
        collectionsFound: [],
        errors: []
      };
      try {
        console.log("🔍 [UnifiedDataService] Checking team member project readiness for userId:", userId);
        const userDoc = yield getDoc(doc(this.db, COLLECTIONS.USERS, userId));
        if (!userDoc.exists()) {
          result.errors.push("User record not found");
          result.success = false;
          return result;
        }
        const userData = userDoc.data();
        console.log("📋 [UnifiedDataService] Found user data:", userData);
        const requiredCollections = [
          {
            name: "teamMembers",
            collection: COLLECTIONS.TEAM_MEMBERS,
            createData: () => ({
              userId,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              name: `${userData.firstName} ${userData.lastName}`,
              role: userData.role || "member",
              status: userData.status || "active",
              organizationId: userData.organizationId,
              orgId: userData.organizationId,
              // Support both field names
              department: userData.department || "",
              isActive: true,
              firebaseUid: userData.firebaseUid || "",
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            })
          },
          {
            name: "orgMembers",
            collection: COLLECTIONS.ORG_MEMBERS,
            createData: () => ({
              organizationId: userData.organizationId,
              orgId: userData.organizationId,
              // Support both field names
              userId,
              email: userData.email,
              name: `${userData.firstName} ${userData.lastName}`,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role || "member",
              status: userData.status || "active",
              seatReserved: true,
              department: userData.department || "",
              invitedByUserId: "system",
              invitedAt: /* @__PURE__ */ new Date(),
              joinedAt: /* @__PURE__ */ new Date(),
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            })
          },
          {
            name: "userProfiles",
            collection: COLLECTIONS.USER_PROFILES,
            createData: () => ({
              userId,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              displayName: `${userData.firstName} ${userData.lastName}`,
              avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName + " " + userData.lastName)}&background=667eea&color=fff`,
              department: userData.department || "",
              position: "",
              phone: "",
              organizationId: userData.organizationId,
              role: userData.role || "member",
              status: userData.status || "active",
              bio: "",
              preferences: {},
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            })
          }
        ];
        for (const collectionConfig of requiredCollections) {
          try {
            const existingQuery = query(
              collection(this.db, collectionConfig.collection),
              where("userId", "==", userId),
              limit(1)
            );
            const existingDocs = yield getDocs(existingQuery);
            if (existingDocs.empty) {
              console.log(`📝 [UnifiedDataService] Creating missing ${collectionConfig.name} record for user ${userId}`);
              const docRef = yield addDoc(collection(this.db, collectionConfig.collection), collectionConfig.createData());
              result.collectionsCreated.push(`${collectionConfig.name} (${docRef.id})`);
              console.log(`✅ [UnifiedDataService] Created ${collectionConfig.name} record: ${docRef.id}`);
            } else {
              result.collectionsFound.push(collectionConfig.name);
              console.log(`✅ [UnifiedDataService] Found existing ${collectionConfig.name} record`);
            }
          } catch (error) {
            const errorMsg = `Failed to check/create ${collectionConfig.name}: ${error.message}`;
            result.errors.push(errorMsg);
            console.error(`❌ [UnifiedDataService] ${errorMsg}`, error);
          }
        }
        console.log("📊 [UnifiedDataService] Team member project readiness check complete:", result);
        return result;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Failed to ensure team member project readiness:", error);
        result.errors.push(`General error: ${error.message}`);
        result.success = false;
        return result;
      }
    });
  }
  // Helper method for password generation
  generateSecurePassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
  updateTeamMember(memberId, updates) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [UnifiedDataService] Updating team member:", memberId, updates);
        if (!this.auth || !this.db) {
          yield this.initializeFirebase();
        }
        const updateData = __spreadProps(__spreadValues({}, updates), {
          updatedAt: /* @__PURE__ */ new Date()
        });
        const batch = writeBatch(this.db);
        const userRef = doc(this.db, "users", memberId);
        batch.update(userRef, updateData);
        const teamMemberRef = doc(this.db, "teamMembers", memberId);
        batch.update(teamMemberRef, updateData);
        yield batch.commit();
        console.log("✅ [UnifiedDataService] Team member updated successfully in both collections");
        this.clearCacheByPattern("org-team-members-");
        this.clearCacheByPattern("org-users-");
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error updating team member:", error);
        throw error;
      }
    });
  }
  changeTeamMemberPassword(memberId, newPassword) {
    return __async(this, null, function* () {
      try {
        console.log("🔐 [UnifiedDataService] Changing password for member:", memberId);
        const response = yield fetch(`/api/team-members/${memberId}/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${yield this.getAuthToken()}`
          },
          body: JSON.stringify({ newPassword })
        });
        if (!response.ok) {
          const errorData = yield response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to change password: ${response.status}`);
        }
        console.log("✅ [UnifiedDataService] Password changed successfully");
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error changing password:", error);
        throw error;
      }
    });
  }
  removeTeamMember(memberId, organizationId) {
    return __async(this, null, function* () {
      try {
        console.log("👤 [UnifiedDataService] Starting Firebase-only team member removal:", memberId);
        const memberDoc = yield getDoc(doc(this.db, "users", memberId));
        if (!memberDoc.exists()) {
          const teamMemberDoc = yield getDoc(doc(this.db, "teamMembers", memberId));
          if (!teamMemberDoc.exists()) {
            throw new Error("Team member not found");
          }
        }
        const memberData = memberDoc.exists() ? memberDoc.data() : null;
        const orgId = organizationId || (memberData == null ? void 0 : memberData.organizationId);
        if (!orgId) {
          throw new Error("Organization ID is required for team member removal");
        }
        console.log("🔍 [UnifiedDataService] Team member organization:", orgId);
        console.log("🎫 [UnifiedDataService] Releasing assigned licenses...");
        const licensesSnapshot = yield getDocs(query(
          collection(this.db, "licenses"),
          where("assignedToUserId", "==", memberId),
          where("organizationId", "==", orgId)
        ));
        if (!licensesSnapshot.empty) {
          const batch2 = writeBatch(this.db);
          licensesSnapshot.docs.forEach((licenseDoc) => {
            const licenseRef = doc(this.db, "licenses", licenseDoc.id);
            batch2.update(licenseRef, {
              assignedToUserId: null,
              assignedToEmail: null,
              assignedAt: null,
              status: "ACTIVE",
              // Keep as ACTIVE but unassigned
              updatedAt: /* @__PURE__ */ new Date(),
              removedFrom: {
                userId: memberId,
                email: (memberData == null ? void 0 : memberData.email) || "unknown",
                removedAt: /* @__PURE__ */ new Date(),
                removedBy: "firebase-client"
              }
            });
          });
          yield batch2.commit();
          console.log(`✅ [UnifiedDataService] Released ${licensesSnapshot.docs.length} license(s) back to available pool`);
        }
        console.log("🗑️ [UnifiedDataService] Removing team member from collections...");
        const collectionsToClean = ["teamMembers", "users", "orgMembers"];
        const batch = writeBatch(this.db);
        for (const collectionName of collectionsToClean) {
          try {
            if (collectionName === "teamMembers") {
              const teamMemberRef = doc(this.db, "teamMembers", memberId);
              batch.delete(teamMemberRef);
            }
            if (collectionName === "users") {
              const userRef = doc(this.db, "users", memberId);
              batch.delete(userRef);
            }
            if (collectionName === "orgMembers") {
              const orgMembersQuery = query(
                collection(this.db, "orgMembers"),
                where("userId", "==", memberId),
                where("organizationId", "==", orgId)
              );
              const orgMembersSnapshot = yield getDocs(orgMembersQuery);
              orgMembersSnapshot.docs.forEach((doc2) => batch.delete(doc2.ref));
            }
          } catch (error) {
            console.warn(`⚠️ [UnifiedDataService] Error cleaning ${collectionName}:`, error);
          }
        }
        yield batch.commit();
        console.log("✅ [UnifiedDataService] Team member removed from all collections");
        this.clearCacheByPattern("org-team-members-");
        this.clearCacheByPattern("org-users-");
        this.clearCacheByPattern("org-licenses-");
        this.clearCacheByPattern("org-members-");
        this.clearCacheByPattern("project-team-members-");
        console.log("✅ [UnifiedDataService] Firebase-only team member removal completed");
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error removing team member:", error);
        throw error;
      }
    });
  }
  assignLicenseToTeamMember(memberId, licenseId, licenseKey, licenseType) {
    return __async(this, null, function* () {
      try {
        yield updateDoc(doc(this.db, "users", memberId), {
          licenseAssignment: {
            licenseId,
            licenseKey,
            licenseType,
            assignedAt: /* @__PURE__ */ new Date()
          },
          updatedAt: /* @__PURE__ */ new Date()
        });
        this.clearCacheByPattern("org-team-members-");
        this.clearCacheByPattern("org-licenses-");
      } catch (error) {
        console.error("Error assigning license to team member:", error);
        throw error;
      }
    });
  }
  // ============================================================================
  // DATASET OPERATIONS
  // ============================================================================
  getDatasetsForUser() {
    return __async(this, null, function* () {
      const user = yield this.getCurrentUser();
      if (!user) return [];
      const cacheKey = `user-datasets-${user.id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
      try {
        const datasetsQuery = query(
          collection(this.db, "datasets"),
          where("owner.organizationId", "==", user.organization.id),
          where("status", "==", "ACTIVE"),
          orderBy("updatedAt", "desc")
        );
        const snapshot = yield getDocs(datasetsQuery);
        const datasets = snapshot.docs.map((doc2) => {
          var _a, _b;
          const data = doc2.data();
          return __spreadProps(__spreadValues({}, data), {
            id: doc2.id,
            createdAt: ((_a = data.createdAt) == null ? void 0 : _a.toDate()) || /* @__PURE__ */ new Date(),
            updatedAt: ((_b = data.updatedAt) == null ? void 0 : _b.toDate()) || /* @__PURE__ */ new Date()
          });
        });
        this.setCache(cacheKey, datasets);
        return datasets;
      } catch (error) {
        console.error("Error fetching user datasets:", error);
        return [];
      }
    });
  }
  // ============================================================================
  // CACHING UTILITIES
  // ============================================================================
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }
  setCache(key, data, ttl = this.CACHE_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  clearAllCache() {
    this.cache.clear();
    console.log("🧹 [UnifiedDataService] All cache cleared");
  }
  // 🔧 NEW: Force refresh all license data
  forceRefreshLicenses() {
    return __async(this, null, function* () {
      console.log("🔄 [UnifiedDataService] Force refreshing license data...");
      this.clearCacheByPattern("org-licenses-");
      this.clearCacheByPattern("user-");
      this.clearCacheByPattern("organization-");
      yield this.getLicensesForOrganization();
      console.log("✅ [UnifiedDataService] License data force refreshed");
    });
  }
  /**
   * Clear cache for a specific user (useful when user changes)
   */
  clearUserCache(userId) {
    if (userId) {
      this.clearCacheByPattern("current-user");
      this.clearCacheByPattern(`org-users-${userId}`);
      this.clearCacheByPattern("org-context");
      this.clearCacheByPattern("org-licenses");
    } else {
      this.clearAllCache();
    }
  }
  // ============================================================================
  // COLLECTION NAME RESOLUTION UTILITIES
  // ============================================================================
  /**
   * Get the appropriate collection name with fallback support
   * This method helps transition from legacy snake_case to standardized camelCase
   */
  getCollectionName(primaryName) {
    return __async(this, null, function* () {
      const primaryCollectionName = COLLECTIONS[primaryName];
      try {
        const testQuery = query(collection(this.db, primaryCollectionName), limit(1));
        yield getDocs(testQuery);
        console.log(`✅ [UnifiedDataService] Using primary collection: ${primaryCollectionName}`);
        return primaryCollectionName;
      } catch (error) {
        const legacyKey = `${primaryName}_LEGACY`;
        if (COLLECTIONS[legacyKey]) {
          const legacyCollectionName = COLLECTIONS[legacyKey];
          try {
            const testQuery = query(collection(this.db, legacyCollectionName), limit(1));
            yield getDocs(testQuery);
            console.log(`⚠️ [UnifiedDataService] Falling back to legacy collection: ${legacyCollectionName}`);
            return legacyCollectionName;
          } catch (legacyError) {
            console.warn(`⚠️ [UnifiedDataService] Both primary and legacy collections failed for ${primaryName}`);
          }
        }
        console.warn(`⚠️ [UnifiedDataService] Using primary collection name despite access issues: ${primaryCollectionName}`);
        return primaryCollectionName;
      }
    });
  }
  // ============================================================================
  // PAYMENT & PURCHASE METHODS
  // ============================================================================
  // 🛒 License Purchase Methods
  purchaseLicenses(purchaseData) {
    return __async(this, null, function* () {
      try {
        const user = yield this.getCurrentUser();
        if (!user) throw new Error("No authenticated user");
        console.log("🛒 [UnifiedDataService] Starting license purchase:", purchaseData);
        const token = yield this.getAuthToken();
        const response = yield fetch(`${this.getApiBaseUrl()}/licenses/purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(purchaseData)
        });
        if (!response.ok) {
          const errorData = yield response.json();
          throw new Error(errorData.error || "Purchase failed");
        }
        const result = yield response.json();
        if (!result.success) {
          throw new Error(result.error || "Purchase failed");
        }
        console.log("✅ [UnifiedDataService] License purchase completed:", result.data);
        this.clearCacheByPattern("org-licenses-");
        this.clearCacheByPattern("user-");
        this.clearCacheByPattern("organization-");
        this.clearCacheByPattern("subscription-");
        this.clearCacheByPattern("invoice-");
        setTimeout(() => {
          this.forceRefreshLicenses();
        }, 1e3);
        return result.data;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error purchasing licenses:", error);
        throw new Error(`Failed to purchase licenses: ${error.message}`);
      }
    });
  }
  // 📄 Invoice Methods
  getInvoicesForOrganization() {
    return __async(this, null, function* () {
      var _a;
      try {
        const user = yield this.getCurrentUser();
        if (!((_a = user == null ? void 0 : user.organization) == null ? void 0 : _a.id)) {
          console.log("🔍 [UnifiedDataService] No organization context for invoices");
          return [];
        }
        const cacheKey = `org-invoices-${user.organization.id}`;
        const cached = this.getFromCache(cacheKey);
        if (cached && Array.isArray(cached)) {
          console.log("📋 [UnifiedDataService] Returning cached invoices");
          return cached;
        }
        console.log("📋 [UnifiedDataService] Fetching invoices for organization:", user.organization.id);
        const invoicesQuery = query(
          collection(this.db, "invoices"),
          where("organizationId", "==", user.organization.id),
          orderBy("createdAt", "desc")
        );
        const snapshot = yield getDocs(invoicesQuery);
        const invoices = snapshot.docs.map((doc2) => {
          var _a2, _b, _c, _d, _e, _f, _g, _h;
          return __spreadProps(__spreadValues({
            id: doc2.id
          }, doc2.data()), {
            createdAt: ((_b = (_a2 = doc2.data().createdAt) == null ? void 0 : _a2.toDate) == null ? void 0 : _b.call(_a2)) || new Date(doc2.data().createdAt),
            updatedAt: ((_d = (_c = doc2.data().updatedAt) == null ? void 0 : _c.toDate) == null ? void 0 : _d.call(_c)) || new Date(doc2.data().updatedAt),
            paidAt: ((_f = (_e = doc2.data().paidAt) == null ? void 0 : _e.toDate) == null ? void 0 : _f.call(_e)) || (doc2.data().paidAt ? new Date(doc2.data().paidAt) : null),
            dueDate: ((_h = (_g = doc2.data().dueDate) == null ? void 0 : _g.toDate) == null ? void 0 : _h.call(_g)) || new Date(doc2.data().dueDate)
          });
        });
        this.setCache(cacheKey, invoices);
        console.log(`✅ [UnifiedDataService] Found ${invoices.length} invoices`);
        return invoices;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error fetching invoices:", error);
        return [];
      }
    });
  }
  // 💰 Payment Methods
  getPaymentsForOrganization() {
    return __async(this, null, function* () {
      var _a;
      try {
        const user = yield this.getCurrentUser();
        if (!((_a = user == null ? void 0 : user.organization) == null ? void 0 : _a.id)) {
          console.log("🔍 [UnifiedDataService] No organization context for payments");
          return [];
        }
        const cacheKey = `org-payments-${user.organization.id}`;
        const cached = this.getFromCache(cacheKey);
        if (cached && Array.isArray(cached)) {
          console.log("💰 [UnifiedDataService] Returning cached payments");
          return cached;
        }
        console.log("💰 [UnifiedDataService] Fetching payments for organization:", user.organization.id);
        const paymentsQuery = query(
          collection(this.db, "payments"),
          where("organizationId", "==", user.organization.id),
          orderBy("createdAt", "desc")
        );
        const snapshot = yield getDocs(paymentsQuery);
        const payments = snapshot.docs.map((doc2) => {
          var _a2, _b, _c, _d, _e, _f;
          return __spreadProps(__spreadValues({
            id: doc2.id
          }, doc2.data()), {
            createdAt: ((_b = (_a2 = doc2.data().createdAt) == null ? void 0 : _a2.toDate) == null ? void 0 : _b.call(_a2)) || new Date(doc2.data().createdAt),
            updatedAt: ((_d = (_c = doc2.data().updatedAt) == null ? void 0 : _c.toDate) == null ? void 0 : _d.call(_c)) || new Date(doc2.data().updatedAt),
            processedAt: ((_f = (_e = doc2.data().processedAt) == null ? void 0 : _e.toDate) == null ? void 0 : _f.call(_e)) || (doc2.data().processedAt ? new Date(doc2.data().processedAt) : null)
          });
        });
        this.setCache(cacheKey, payments);
        console.log(`✅ [UnifiedDataService] Found ${payments.length} payments`);
        return payments;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error fetching payments:", error);
        return [];
      }
    });
  }
  // 📋 Subscription Methods
  getSubscriptionForOrganization() {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      try {
        const user = yield this.getCurrentUser();
        if (!((_a = user == null ? void 0 : user.organization) == null ? void 0 : _a.id)) {
          console.log("🔍 [UnifiedDataService] No organization context for subscription");
          return null;
        }
        const cacheKey = `org-subscription-${user.organization.id}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          console.log("📋 [UnifiedDataService] Returning cached subscription");
          return cached;
        }
        console.log("📋 [UnifiedDataService] Fetching subscription for organization:", user.organization.id);
        const subscriptionQuery = query(
          collection(this.db, "subscriptions"),
          where("organizationId", "==", user.organization.id),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const snapshot = yield getDocs(subscriptionQuery);
        if (snapshot.empty) {
          console.log("📋 [UnifiedDataService] No subscription found");
          return null;
        }
        const doc2 = snapshot.docs[0];
        const subscription = __spreadProps(__spreadValues({
          id: doc2.id
        }, doc2.data()), {
          createdAt: ((_c = (_b = doc2.data().createdAt) == null ? void 0 : _b.toDate) == null ? void 0 : _c.call(_b)) || new Date(doc2.data().createdAt),
          updatedAt: ((_e = (_d = doc2.data().updatedAt) == null ? void 0 : _d.toDate) == null ? void 0 : _e.call(_d)) || new Date(doc2.data().updatedAt),
          currentPeriodStart: ((_g = (_f = doc2.data().currentPeriodStart) == null ? void 0 : _f.toDate) == null ? void 0 : _g.call(_f)) || new Date(doc2.data().currentPeriodStart),
          currentPeriodEnd: ((_i = (_h = doc2.data().currentPeriodEnd) == null ? void 0 : _h.toDate) == null ? void 0 : _i.call(_h)) || new Date(doc2.data().currentPeriodEnd),
          activatedAt: ((_k = (_j = doc2.data().activatedAt) == null ? void 0 : _j.toDate) == null ? void 0 : _k.call(_j)) || (doc2.data().activatedAt ? new Date(doc2.data().activatedAt) : null)
        });
        this.setCache(cacheKey, subscription);
        console.log("✅ [UnifiedDataService] Found subscription:", subscription.id);
        return subscription;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error fetching subscription:", error);
        return null;
      }
    });
  }
  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================
  static getInstance() {
    if (!_UnifiedDataService.instance) {
      _UnifiedDataService.instance = new _UnifiedDataService();
    }
    return _UnifiedDataService.instance;
  }
  /**
   * Get license pools for the organization
   */
  getLicensePools() {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [UnifiedDataService] Fetching license pools...");
        const poolsSnapshot = yield getDocs(collection(this.db, "licensePools"));
        const pools = [];
        poolsSnapshot.docs.forEach((doc2) => {
          var _a, _b, _c, _d, _e, _f;
          const data = doc2.data();
          pools.push({
            id: doc2.id,
            tier: data.tier,
            totalLicenses: data.totalLicenses || 0,
            availableLicenses: data.availableLicenses || 0,
            assignedLicenses: data.assignedLicenses || 0,
            maxProjects: data.maxProjects || 0,
            maxCollaborators: data.maxCollaborators || 0,
            maxTeamMembers: data.maxTeamMembers || 0,
            features: data.features || [],
            createdAt: ((_c = (_b = (_a = data.createdAt) == null ? void 0 : _a.toDate) == null ? void 0 : _b.call(_a)) == null ? void 0 : _c.toISOString()) || (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: ((_f = (_e = (_d = data.updatedAt) == null ? void 0 : _d.toDate) == null ? void 0 : _e.call(_d)) == null ? void 0 : _f.toISOString()) || (/* @__PURE__ */ new Date()).toISOString()
          });
        });
        console.log(`✅ [UnifiedDataService] Found ${pools.length} license pools`);
        return pools;
      } catch (error) {
        console.error("❌ [UnifiedDataService] Error fetching license pools:", error);
        throw error;
      }
    });
  }
};
__publicField(_UnifiedDataService, "instance");
let UnifiedDataService = _UnifiedDataService;
const unifiedDataService = UnifiedDataService.getInstance();
export {
  unifiedDataService as default,
  unifiedDataService
};
