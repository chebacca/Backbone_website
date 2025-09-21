const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/firebase-Cqr2XXGQ.js","assets/index-CEXEfs7Z.js","assets/mui-BbtiZaA3.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-rmDQXWB-.js","assets/index-COak77tQ.css","assets/index.esm-zVCMB3Cx.js","assets/index.esm-CjtNHFZy.js","assets/index.esm-D5-7iBdy.js","assets/UnifiedDataService-DeQVa7oC.js","assets/FirestoreCollectionManager-Te2efTV_.js"])))=>i.map(i=>d[i]);
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
import { _ as __vitePreload } from "./index-CEXEfs7Z.js";
const _FirestoreAdapter = class _FirestoreAdapter {
  constructor() {
    __publicField(this, "db");
    __publicField(this, "auth");
  }
  // Helper functions for array operations
  static arrayUnion(value) {
    return { _method: "arrayUnion", value };
  }
  static arrayRemove(value) {
    return { _method: "arrayRemove", value };
  }
  static getInstance() {
    if (!_FirestoreAdapter.instance) {
      _FirestoreAdapter.instance = new _FirestoreAdapter();
    }
    return _FirestoreAdapter.instance;
  }
  /**
   * Initialize Firestore adapter
   */
  initialize() {
    return __async(this, null, function* () {
      const firebase = yield __vitePreload(() => import("./firebase-Cqr2XXGQ.js").then((n) => n.f), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
      this.db = firebase.db;
      this.auth = firebase.auth;
    });
  }
  /**
   * Get the current authenticated user
   */
  getCurrentUser() {
    var _a;
    return (_a = this.auth) == null ? void 0 : _a.currentUser;
  }
  /**
   * Get a document by ID from a collection
   */
  getDocumentById(collectionName, docId) {
    return __async(this, null, function* () {
      try {
        const { doc, getDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, getDoc: getDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, getDoc: getDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const docRef = doc(this.db, collectionName, docId);
        const docSnap = yield getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return __spreadValues({
            id: docSnap.id
          }, this.convertFirestoreDates(data));
        }
        return null;
      } catch (error) {
        console.error(`❌ [FirestoreAdapter] Error getting document ${docId} from ${collectionName}:`, error);
        return null;
      }
    });
  }
  /**
   * Query documents from a collection
   */
  queryDocuments(_0) {
    return __async(this, arguments, function* (collectionName, queryConditions = []) {
      try {
        const { collection, query, where, getDocs } = yield __vitePreload(() => __async(this, null, function* () {
          const { collection: collection2, query: query2, where: where2, getDocs: getDocs2 } = yield import("./index.esm-CjtNHFZy.js");
          return { collection: collection2, query: query2, where: where2, getDocs: getDocs2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const collRef = collection(this.db, collectionName);
        let queryRef;
        if (queryConditions.length > 0) {
          let conditions = [];
          for (const condition of queryConditions) {
            conditions.push(where(condition.field, condition.operator, condition.value));
          }
          queryRef = query(collRef, ...conditions);
        } else {
          queryRef = query(collRef);
        }
        const snapshot = yield getDocs(queryRef);
        const results = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          results.push(__spreadValues({
            id: doc.id
          }, this.convertFirestoreDates(data)));
        });
        return results;
      } catch (error) {
        console.error(`❌ [FirestoreAdapter] Error querying ${collectionName}:`, error);
        return [];
      }
    });
  }
  /**
   * Create a document in a collection
   */
  createDocument(collectionName, data) {
    return __async(this, null, function* () {
      try {
        const { collection, addDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { collection: collection2, addDoc: addDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { collection: collection2, addDoc: addDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const cleanedData = this.cleanDocumentData(__spreadProps(__spreadValues({}, data), {
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }));
        const docRef = yield addDoc(collection(this.db, collectionName), cleanedData);
        return __spreadValues({
          id: docRef.id
        }, cleanedData);
      } catch (error) {
        console.error(`❌ [FirestoreAdapter] Error creating document in ${collectionName}:`, error);
        return null;
      }
    });
  }
  /**
   * Update a document in a collection with array operations
   */
  updateDocumentWithArrayOps(collectionName, docId, data) {
    return __async(this, null, function* () {
      try {
        const { doc, updateDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, updateDoc: updateDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, updateDoc: updateDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const { arrayUnion, arrayRemove } = yield __vitePreload(() => __async(this, null, function* () {
          const { arrayUnion: arrayUnion2, arrayRemove: arrayRemove2 } = yield import("./index.esm-CjtNHFZy.js");
          return { arrayUnion: arrayUnion2, arrayRemove: arrayRemove2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const processedData = {};
        for (const [key, value] of Object.entries(data)) {
          if (value && typeof value === "object" && value._method === "arrayUnion") {
            processedData[key] = arrayUnion(value.value);
          } else if (value && typeof value === "object" && value._method === "arrayRemove") {
            processedData[key] = arrayRemove(value.value);
          } else {
            processedData[key] = value;
          }
        }
        const cleanedData = this.cleanDocumentData(__spreadProps(__spreadValues({}, processedData), {
          updatedAt: /* @__PURE__ */ new Date()
        }));
        yield updateDoc(doc(this.db, collectionName, docId), cleanedData);
        return true;
      } catch (error) {
        console.error(`❌ [FirestoreAdapter] Error updating document ${docId} in ${collectionName} with array ops:`, error);
        return false;
      }
    });
  }
  /**
   * Update a document in a collection
   */
  updateDocument(collectionName, docId, data) {
    return __async(this, null, function* () {
      try {
        const { doc, updateDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, updateDoc: updateDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, updateDoc: updateDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const cleanedData = this.cleanDocumentData(__spreadProps(__spreadValues({}, data), {
          updatedAt: /* @__PURE__ */ new Date()
        }));
        yield updateDoc(doc(this.db, collectionName, docId), cleanedData);
        return true;
      } catch (error) {
        console.error(`❌ [FirestoreAdapter] Error updating document ${docId} in ${collectionName}:`, error);
        return false;
      }
    });
  }
  /**
   * Delete a document from a collection
   */
  deleteDocument(collectionName, docId) {
    return __async(this, null, function* () {
      try {
        const { doc, deleteDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, deleteDoc: deleteDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, deleteDoc: deleteDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        yield deleteDoc(doc(this.db, collectionName, docId));
        return true;
      } catch (error) {
        console.error(`❌ [FirestoreAdapter] Error deleting document ${docId} from ${collectionName}:`, error);
        return false;
      }
    });
  }
  /**
   * Clean document data for Firestore (remove undefined values)
   */
  cleanDocumentData(data) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === void 0) continue;
      if (value === null) {
        cleaned[key] = null;
        continue;
      }
      if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = this.cleanDocumentData(value);
        continue;
      }
      cleaned[key] = value;
    }
    return cleaned;
  }
  /**
   * Convert Firestore timestamps to ISO strings
   */
  convertFirestoreDates(data) {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === "object" && value.toDate && typeof value.toDate === "function") {
        converted[key] = value.toDate().toISOString();
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        converted[key] = this.convertFirestoreDates(value);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  }
};
__publicField(_FirestoreAdapter, "instance");
let FirestoreAdapter = _FirestoreAdapter;
class BaseService {
  constructor(config) {
    __publicField(this, "config");
    __publicField(this, "firestoreAdapter");
    this.config = config;
    this.firestoreAdapter = FirestoreAdapter.getInstance();
  }
  isWebOnlyMode() {
    return this.config.isWebOnlyMode;
  }
  getConfig() {
    return this.config;
  }
  /**
   * Make an API request
   */
  apiRequest(endpoint, method = "GET", body, customHeaders) {
    return __async(this, null, function* () {
      try {
        const baseUrl = this.config.apiBaseUrl || "/api";
        const url = `${baseUrl}/${endpoint.startsWith("/") ? endpoint.substring(1) : endpoint}`;
        const headers = __spreadValues({
          "Content-Type": "application/json"
        }, customHeaders);
        const options = {
          method,
          headers,
          credentials: "include"
        };
        if (body && (method === "POST" || method === "PATCH")) {
          options.body = JSON.stringify(body);
        }
        const response = yield fetch(url, options);
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return yield response.json();
        }
        return yield response.text();
      } catch (error) {
        console.error(`❌ [BaseService] API request failed for ${endpoint}:`, error);
        throw error;
      }
    });
  }
  /**
   * Handle errors consistently
   */
  handleError(error, context) {
    console.error(`❌ [${this.constructor.name}] Error in ${context}:`, error);
  }
}
var TeamMemberStatus = /* @__PURE__ */ ((TeamMemberStatus2) => {
  TeamMemberStatus2["ACTIVE"] = "ACTIVE";
  TeamMemberStatus2["INACTIVE"] = "INACTIVE";
  TeamMemberStatus2["PENDING"] = "PENDING";
  TeamMemberStatus2["DELETED"] = "DELETED";
  return TeamMemberStatus2;
})(TeamMemberStatus || {});
var TeamMemberRole = /* @__PURE__ */ ((TeamMemberRole2) => {
  TeamMemberRole2["ADMIN"] = "ADMIN";
  TeamMemberRole2["MEMBER"] = "MEMBER";
  return TeamMemberRole2;
})(TeamMemberRole || {});
var ProjectStatus = /* @__PURE__ */ ((ProjectStatus2) => {
  ProjectStatus2["ACTIVE"] = "active";
  ProjectStatus2["ARCHIVED"] = "archived";
  ProjectStatus2["DELETED"] = "deleted";
  ProjectStatus2["DRAFT"] = "draft";
  return ProjectStatus2;
})(ProjectStatus || {});
const _ProjectService = class _ProjectService extends BaseService {
  constructor(config) {
    super(config);
  }
  static getInstance(config) {
    if (!_ProjectService.instance) {
      _ProjectService.instance = new _ProjectService(config);
    }
    return _ProjectService.instance;
  }
  /**
   * Get all projects
   */
  getProjects() {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [ProjectService] Getting all projects");
        if (this.isWebOnlyMode()) {
          return yield this.getProjectsFromFirestore();
        }
        try {
          const result = yield this.apiRequest("projects");
          return result;
        } catch (error) {
          console.warn("⚠️ [ProjectService] API request failed, falling back to Firestore");
          return yield this.getProjectsFromFirestore();
        }
      } catch (error) {
        this.handleError(error, "getProjects");
        return [];
      }
    });
  }
  /**
   * Get a project by ID
   */
  getProject(projectId) {
    return __async(this, null, function* () {
      try {
        console.log(`🚀 [ProjectService] Getting project: ${projectId}`);
        if (this.isWebOnlyMode()) {
          return yield this.getProjectFromFirestore(projectId);
        }
        try {
          const result = yield this.apiRequest(`projects/${projectId}`);
          return result;
        } catch (error) {
          console.warn("⚠️ [ProjectService] API request failed, falling back to Firestore");
          return yield this.getProjectFromFirestore(projectId);
        }
      } catch (error) {
        this.handleError(error, `getProject(${projectId})`);
        return null;
      }
    });
  }
  /**
   * Create a new project
   */
  createProject(project) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [ProjectService] Creating new project");
        if (this.isWebOnlyMode()) {
          return yield this.createProjectInFirestore(project);
        }
        try {
          const result = yield this.apiRequest("projects", "POST", project);
          return result;
        } catch (error) {
          console.warn("⚠️ [ProjectService] API request failed, falling back to Firestore");
          return yield this.createProjectInFirestore(project);
        }
      } catch (error) {
        this.handleError(error, "createProject");
        return null;
      }
    });
  }
  /**
   * Update a project
   */
  updateProject(projectId, updates) {
    return __async(this, null, function* () {
      try {
        console.log(`🚀 [ProjectService] Updating project: ${projectId}`);
        if (this.isWebOnlyMode()) {
          return yield this.updateProjectInFirestore(projectId, updates);
        }
        try {
          const result = yield this.apiRequest(`projects/${projectId}`, "PATCH", updates);
          return result;
        } catch (error) {
          console.warn("⚠️ [ProjectService] API request failed, falling back to Firestore");
          return yield this.updateProjectInFirestore(projectId, updates);
        }
      } catch (error) {
        this.handleError(error, `updateProject(${projectId})`);
        return null;
      }
    });
  }
  /**
   * Archive a project
   */
  archiveProject(projectId) {
    return __async(this, null, function* () {
      try {
        console.log(`🚀 [ProjectService] Archiving project: ${projectId}`);
        if (this.isWebOnlyMode()) {
          return (yield this.updateProjectInFirestore(projectId, { status: ProjectStatus.ARCHIVED })) !== null;
        }
        try {
          yield this.apiRequest(`projects/${projectId}/archive`, "POST");
          return true;
        } catch (error) {
          console.warn("⚠️ [ProjectService] API request failed, falling back to Firestore");
          return (yield this.updateProjectInFirestore(projectId, { status: ProjectStatus.ARCHIVED })) !== null;
        }
      } catch (error) {
        this.handleError(error, `archiveProject(${projectId})`);
        return false;
      }
    });
  }
  /**
   * Restore a project from archive
   */
  restoreProject(projectId) {
    return __async(this, null, function* () {
      try {
        console.log(`🚀 [ProjectService] Restoring project: ${projectId}`);
        if (this.isWebOnlyMode()) {
          return (yield this.updateProjectInFirestore(projectId, { status: ProjectStatus.ACTIVE })) !== null;
        }
        try {
          yield this.apiRequest(`projects/${projectId}/restore`, "POST");
          return true;
        } catch (error) {
          console.warn("⚠️ [ProjectService] API request failed, falling back to Firestore");
          return (yield this.updateProjectInFirestore(projectId, { status: ProjectStatus.ACTIVE })) !== null;
        }
      } catch (error) {
        this.handleError(error, `restoreProject(${projectId})`);
        return false;
      }
    });
  }
  /**
   * Permanently delete a project
   */
  deleteProject(projectId) {
    return __async(this, null, function* () {
      try {
        console.log(`🗑️ [ProjectService] Deleting project: ${projectId}`);
        if (this.isWebOnlyMode()) {
          return yield this.deleteProjectFromFirestore(projectId);
        }
        try {
          yield this.apiRequest(`projects/${projectId}`, "DELETE");
          return true;
        } catch (error) {
          console.warn("⚠️ [ProjectService] API request failed, falling back to Firestore");
          return yield this.deleteProjectFromFirestore(projectId);
        }
      } catch (error) {
        this.handleError(error, `deleteProject(${projectId})`);
        return false;
      }
    });
  }
  /**
   * Get projects from Firestore
   */
  getProjectsFromFirestore() {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [ProjectService] Getting projects from Firestore");
        yield this.firestoreAdapter.initialize();
        const currentUser = this.firestoreAdapter.getCurrentUser();
        if (!currentUser) {
          console.log("❌ [ProjectService] No authenticated user found");
          return [];
        }
        let organizationId = null;
        try {
          const userDoc = yield this.firestoreAdapter.getDocumentById("users", currentUser.uid);
          if (userDoc && userDoc.organizationId) {
            organizationId = userDoc.organizationId;
            console.log("✅ [ProjectService] Found organization ID from user document:", organizationId);
          } else {
            const userByEmail = yield this.firestoreAdapter.queryDocuments("users", [
              { field: "email", operator: "==", value: currentUser.email }
            ]);
            if (userByEmail.length > 0 && userByEmail[0].organizationId) {
              organizationId = userByEmail[0].organizationId;
              console.log("✅ [ProjectService] Found organization ID from user email query:", organizationId);
            }
          }
        } catch (error) {
          console.warn("⚠️ [ProjectService] Error getting user organization:", error);
        }
        if (!organizationId) {
          console.log("❌ [ProjectService] No organization ID found for user");
          return [];
        }
        try {
          const projects = yield this.firestoreAdapter.queryDocuments("projects", [
            { field: "organizationId", operator: "==", value: organizationId }
          ]);
          console.log(`✅ [ProjectService] Found ${projects.length} projects for organization: ${organizationId}`);
          console.log("🔍 [ProjectService] Raw projects from Firestore:", projects);
          const sortedProjects = projects.sort((a, b) => {
            const dateA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
            const dateB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
            return dateB - dateA;
          });
          console.log("🔍 [ProjectService] Sorted projects:", sortedProjects);
          return sortedProjects;
        } catch (queryError) {
          if (queryError.message && queryError.message.includes("requires an index")) {
            console.warn("⚠️ [ProjectService] Missing Firestore index detected. Projects query requires composite index.");
            console.warn("📋 Required index: organizationId (Ascending) + createdAt (Ascending) + __name__ (Ascending)");
            console.warn("🔗 Create index at: https://console.firebase.google.com/v1/r/project/backbone-logic/firestore/indexes");
            console.warn("📝 Note: Index creation can take several minutes. Returning empty array for now.");
            return [];
          }
          throw queryError;
        }
      } catch (error) {
        this.handleError(error, "getProjectsFromFirestore");
        return [];
      }
    });
  }
  /**
   * Get a project from Firestore
   */
  getProjectFromFirestore(projectId) {
    return __async(this, null, function* () {
      try {
        console.log(`🔍 [ProjectService] Getting project from Firestore: ${projectId}`);
        yield this.firestoreAdapter.initialize();
        return yield this.firestoreAdapter.getDocumentById("projects", projectId);
      } catch (error) {
        this.handleError(error, `getProjectFromFirestore(${projectId})`);
        return null;
      }
    });
  }
  /**
   * Create a project in Firestore
   */
  createProjectInFirestore(project) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [ProjectService] Creating project in Firestore");
        yield this.firestoreAdapter.initialize();
        const currentUser = this.firestoreAdapter.getCurrentUser();
        if (!currentUser) {
          console.warn("⚠️ [ProjectService] No authenticated user for project creation");
          return null;
        }
        const newProject = __spreadProps(__spreadValues({}, project), {
          ownerId: project.ownerId || currentUser.uid,
          status: project.status || ProjectStatus.ACTIVE,
          teamMembers: project.teamMembers || []
        });
        return yield this.firestoreAdapter.createDocument("projects", newProject);
      } catch (error) {
        this.handleError(error, "createProjectInFirestore");
        return null;
      }
    });
  }
  /**
   * Update a project in Firestore
   */
  updateProjectInFirestore(projectId, updates) {
    return __async(this, null, function* () {
      try {
        console.log(`🔍 [ProjectService] Updating project in Firestore: ${projectId}`);
        yield this.firestoreAdapter.initialize();
        const existingProject = yield this.firestoreAdapter.getDocumentById("projects", projectId);
        if (!existingProject) {
          console.warn(`⚠️ [ProjectService] Project not found: ${projectId}`);
          return null;
        }
        const success = yield this.firestoreAdapter.updateDocument("projects", projectId, updates);
        if (success) {
          return __spreadProps(__spreadValues(__spreadValues({}, existingProject), updates), {
            id: projectId
          });
        }
        return null;
      } catch (error) {
        this.handleError(error, `updateProjectInFirestore(${projectId})`);
        return null;
      }
    });
  }
  /**
   * Permanently delete a project from Firestore
   */
  deleteProjectFromFirestore(projectId) {
    return __async(this, null, function* () {
      try {
        console.log(`🗑️ [ProjectService] Deleting project from Firestore: ${projectId}`);
        yield this.firestoreAdapter.initialize();
        const existingProject = yield this.firestoreAdapter.getDocumentById("projects", projectId);
        if (!existingProject) {
          console.warn(`⚠️ [ProjectService] Project not found for deletion: ${projectId}`);
          return false;
        }
        const success = yield this.firestoreAdapter.deleteDocument("projects", projectId);
        if (success) {
          console.log(`✅ [ProjectService] Project successfully deleted from Firestore: ${projectId}`);
          return true;
        }
        console.warn(`⚠️ [ProjectService] Failed to delete project from Firestore: ${projectId}`);
        return false;
      } catch (error) {
        this.handleError(error, `deleteProjectFromFirestore(${projectId})`);
        return false;
      }
    });
  }
};
__publicField(_ProjectService, "instance");
let ProjectService = _ProjectService;
const _TeamMemberService = class _TeamMemberService extends BaseService {
  constructor(config) {
    super(config);
  }
  static getInstance(config) {
    if (!_TeamMemberService.instance) {
      _TeamMemberService.instance = new _TeamMemberService(config);
    }
    return _TeamMemberService.instance;
  }
  /**
   * Get all licensed team members
   * Excludes members already assigned to the specified project
   */
  getLicensedTeamMembers(options) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [TeamMemberService] Getting licensed team members with options:", options);
        if (this.isWebOnlyMode()) {
          return yield this.getLicensedTeamMembersFromFirestore(options);
        }
        const params = new URLSearchParams();
        if (options == null ? void 0 : options.search) {
          params.append("search", options.search);
        }
        if (options == null ? void 0 : options.excludeProjectId) {
          params.append("excludeProjectId", options.excludeProjectId);
        }
        const endpoint = `team-members/licensed${params.toString() ? `?${params.toString()}` : ""}`;
        try {
          const result = yield this.apiRequest(endpoint);
          return result;
        } catch (error) {
          console.warn("⚠️ [TeamMemberService] API request failed, falling back to Firestore");
          return yield this.getLicensedTeamMembersFromFirestore(options);
        }
      } catch (error) {
        this.handleError(error, "getLicensedTeamMembers");
        return [];
      }
    });
  }
  /**
   * Get team members assigned to a specific project
   */
  getProjectTeamMembers(projectId) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [TeamMemberService] Getting team members for project:", projectId);
        if (this.isWebOnlyMode()) {
          return yield this.getProjectTeamMembersFromFirestore(projectId);
        }
        try {
          const result = yield this.apiRequest(`projects/${projectId}/team-members`);
          return result;
        } catch (error) {
          console.warn("⚠️ [TeamMemberService] API request failed, falling back to Firestore");
          return yield this.getProjectTeamMembersFromFirestore(projectId);
        }
      } catch (error) {
        this.handleError(error, `getProjectTeamMembers(${projectId})`);
        return [];
      }
    });
  }
  /**
   * 🚀 PERFORMANCE OPTIMIZATION: Get team members for multiple projects in batch
   * This reduces the number of Firestore calls by loading all team members at once
   */
  getProjectTeamMembersBatch(projectIds) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [TeamMemberService] Getting team members for projects in batch:", projectIds);
        if (this.isWebOnlyMode()) {
          return yield this.getProjectTeamMembersFromFirestoreBatch(projectIds);
        }
        const promises = projectIds.map((projectId) => __async(this, null, function* () {
          try {
            const result = yield this.apiRequest(`projects/${projectId}/team-members`);
            return { projectId, teamMembers: result };
          } catch (error) {
            console.warn(`⚠️ [TeamMemberService] API request failed for project ${projectId}, falling back to Firestore`);
            const teamMembers = yield this.getProjectTeamMembersFromFirestore(projectId);
            return { projectId, teamMembers };
          }
        }));
        const results = yield Promise.all(promises);
        const batchResult = {};
        results.forEach(({ projectId, teamMembers }) => {
          batchResult[projectId] = teamMembers;
        });
        return batchResult;
      } catch (error) {
        this.handleError(error, `getProjectTeamMembersBatch(${projectIds.join(", ")})`);
        return {};
      }
    });
  }
  /**
   * Add a team member to a project with a specific role
   */
  addTeamMemberToProject(_0, _1) {
    return __async(this, arguments, function* (projectId, teamMemberId, role = TeamMemberRole.MEMBER) {
      try {
        console.log("🚀 [TeamMemberService] Adding team member to project:", { projectId, teamMemberId, role });
        if (this.isWebOnlyMode()) {
          return yield this.addTeamMemberToProjectInFirestore(projectId, teamMemberId, role);
        }
        try {
          yield this.apiRequest(`projects/${projectId}/team-members`, "POST", {
            teamMemberId,
            role
          });
          return true;
        } catch (error) {
          console.warn("⚠️ [TeamMemberService] API request failed, falling back to Firestore");
          return yield this.addTeamMemberToProjectInFirestore(projectId, teamMemberId, role);
        }
      } catch (error) {
        this.handleError(error, `addTeamMemberToProject(${projectId}, ${teamMemberId})`);
        return false;
      }
    });
  }
  /**
   * Remove a team member from a project
   */
  removeTeamMemberFromProject(projectId, teamMemberId) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [TeamMemberService] Removing team member from project:", { projectId, teamMemberId });
        if (this.isWebOnlyMode()) {
          return yield this.removeTeamMemberFromProjectInFirestore(projectId, teamMemberId);
        }
        try {
          yield this.apiRequest(`projects/${projectId}/team-members/${teamMemberId}`, "DELETE");
          return true;
        } catch (error) {
          console.warn("⚠️ [TeamMemberService] API request failed, falling back to Firestore");
          return yield this.removeTeamMemberFromProjectInFirestore(projectId, teamMemberId);
        }
      } catch (error) {
        this.handleError(error, `removeTeamMemberFromProject(${projectId}, ${teamMemberId})`);
        return false;
      }
    });
  }
  /**
   * Update a team member's role in a project
   */
  updateTeamMemberRole(projectId, teamMemberId, role) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [TeamMemberService] Updating team member role:", { projectId, teamMemberId, role });
        if (this.isWebOnlyMode()) {
          return yield this.updateTeamMemberRoleInFirestore(projectId, teamMemberId, role);
        }
        try {
          yield this.apiRequest(`projects/${projectId}/team-members/${teamMemberId}/role`, "PATCH", { role });
          return true;
        } catch (error) {
          console.warn("⚠️ [TeamMemberService] API request failed, falling back to Firestore");
          return yield this.updateTeamMemberRoleInFirestore(projectId, teamMemberId, role);
        }
      } catch (error) {
        this.handleError(error, `updateTeamMemberRole(${projectId}, ${teamMemberId})`);
        return false;
      }
    });
  }
  /**
   * Validate team member credentials
   */
  validateTeamMemberCredentials(email, password) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [TeamMemberService] Validating team member credentials for:", email);
        if (this.isWebOnlyMode()) {
          return yield this.validateTeamMemberCredentialsFromFirestore(email, password);
        }
        try {
          const result = yield this.apiRequest("team-members/validate-credentials", "POST", {
            email,
            password
          });
          return result;
        } catch (error) {
          console.warn("⚠️ [TeamMemberService] API request failed, falling back to Firestore");
          return yield this.validateTeamMemberCredentialsFromFirestore(email, password);
        }
      } catch (error) {
        this.handleError(error, "validateTeamMemberCredentials");
        return {
          isValid: false,
          error: "Authentication failed"
        };
      }
    });
  }
  /**
   * Refresh team member data from Firestore
   * This can be called to force a refresh of team member data
   */
  refreshTeamMembers() {
    return __async(this, null, function* () {
      try {
        console.log("🔄 [TeamMemberService] Refreshing team member data...");
        console.log("✅ [TeamMemberService] Team member data refresh initiated");
      } catch (error) {
        console.error("❌ [TeamMemberService] Failed to refresh team member data:", error);
      }
    });
  }
  /**
   * Create a new team member with Firebase Authentication
   * This method creates both the team member document and Firebase Auth user
   * 
   * @example
   * ```typescript
   * // Get the service instance
   * const teamMemberService = ServiceFactory.getInstance().getTeamMemberService();
   * 
   * // Create a new team member with Firebase Auth
   * const result = await teamMemberService.createTeamMemberWithFirebaseAuth({
   *   email: 'john.doe@company.com',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   department: 'Engineering',
   *   licenseType: 'PROFESSIONAL',
   *   organizationId: 'org123',
   *   role: 'MEMBER',
   *   temporaryPassword: 'optional-custom-password' // Optional, auto-generated if not provided
   * });
   * 
   * if (result.success) {
   *   console.log('Team member created:', result.teamMember);
   *   console.log('Firebase UID:', result.firebaseUid);
   *   console.log('Temporary password:', result.temporaryPassword);
   * } else {
   *   console.error('Failed to create team member:', result.error);
   * }
   * ```
   * 
   * @param teamMemberData - Team member data including required fields
   * @returns Promise with creation result including Firebase UID and temporary password
   */
  createTeamMemberWithFirebaseAuth(teamMemberData) {
    return __async(this, null, function* () {
      try {
        console.log("🚀 [TeamMemberService] Creating team member with Firebase Auth:", teamMemberData);
        if (this.isWebOnlyMode()) {
          return yield this.createTeamMemberWithFirebaseAuthInFirestore(teamMemberData);
        }
        try {
          const result = yield this.apiRequest("team-members/create", "POST", teamMemberData);
          return result;
        } catch (error) {
          console.warn("⚠️ [TeamMemberService] API request failed, falling back to Firestore");
          return yield this.createTeamMemberWithFirebaseAuthInFirestore(teamMemberData);
        }
      } catch (error) {
        this.handleError(error, "createTeamMemberWithFirebaseAuth");
        return {
          success: false,
          error: "Failed to create team member with Firebase Auth"
        };
      }
    });
  }
  /**
   * Get licensed team members from Firestore
   */
  getLicensedTeamMembersFromFirestore(options) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [TeamMemberService] Fetching licensed team members from Firestore with options:", options);
        yield this.firestoreAdapter.initialize();
        const currentUser = this.firestoreAdapter.getCurrentUser();
        if (!currentUser) {
          console.log("❌ [TeamMemberService] No authenticated user found");
          return [];
        }
        let organizationId = null;
        try {
          const userDoc = yield this.firestoreAdapter.getDocumentById("users", currentUser.uid);
          if (userDoc && userDoc.organizationId) {
            organizationId = userDoc.organizationId;
            console.log("✅ [TeamMemberService] Found organization ID from user document:", organizationId);
          } else {
            const userByEmail = yield this.firestoreAdapter.queryDocuments("users", [
              { field: "email", operator: "==", value: currentUser.email }
            ]);
            if (userByEmail.length > 0 && userByEmail[0].organizationId) {
              organizationId = userByEmail[0].organizationId;
              console.log("✅ [TeamMemberService] Found organization ID from user email query:", organizationId);
            }
          }
        } catch (error) {
          console.warn("⚠️ [TeamMemberService] Error getting user organization:", error);
        }
        if (!organizationId) {
          console.log("❌ [TeamMemberService] No organization ID found for user");
          return [];
        }
        console.log("🏢 [TeamMemberService] Fetching team members for organization:", organizationId);
        console.log("🔍 [TeamMemberService] Using UnifiedDataService for enhanced team member fetching...");
        let activeMembers = [];
        try {
          const { unifiedDataService } = yield __vitePreload(() => __async(this, null, function* () {
            const { unifiedDataService: unifiedDataService2 } = yield import("./UnifiedDataService-DeQVa7oC.js");
            return { unifiedDataService: unifiedDataService2 };
          }), true ? __vite__mapDeps([9,1,2,3,4,5,7,6,10,0,8]) : void 0);
          const streamlinedTeamMembers = yield unifiedDataService.getTeamMembersForOrganization();
          console.log(`📊 [TeamMemberService] Found ${streamlinedTeamMembers.length} team members from UnifiedDataService`);
          activeMembers = streamlinedTeamMembers.filter((stm) => stm.status === "active").map((stm) => {
            var _a;
            const safeToISOString = (dateValue) => {
              if (!dateValue) return (/* @__PURE__ */ new Date()).toISOString();
              if (dateValue instanceof Date) return dateValue.toISOString();
              if (typeof dateValue === "string") return new Date(dateValue).toISOString();
              if (typeof dateValue === "number") return new Date(dateValue).toISOString();
              if (dateValue && typeof dateValue === "object" && dateValue.toDate) {
                return dateValue.toDate().toISOString();
              }
              return (/* @__PURE__ */ new Date()).toISOString();
            };
            return {
              id: stm.id,
              email: stm.email,
              firstName: stm.firstName,
              lastName: stm.lastName,
              name: `${stm.firstName} ${stm.lastName}`.trim() || stm.email,
              role: stm.role,
              status: TeamMemberStatus.ACTIVE,
              // Use proper enum value
              department: stm.department,
              organizationId: stm.organization.id,
              licenseType: ((_a = stm.licenseAssignment) == null ? void 0 : _a.licenseType) || "BASIC",
              assignedProjects: stm.assignedProjects,
              createdAt: safeToISOString(stm.createdAt),
              updatedAt: safeToISOString(stm.updatedAt),
              // Additional fields for compatibility
              isActive: true,
              joinedAt: safeToISOString(stm.joinedAt),
              lastActive: stm.lastActive ? safeToISOString(stm.lastActive) : void 0,
              invitedBy: stm.invitedBy,
              avatar: stm.avatar
            };
          });
          console.log(`✅ [TeamMemberService] Converted ${activeMembers.length} active team members from UnifiedDataService`);
        } catch (unifiedError) {
          console.warn("⚠️ [TeamMemberService] UnifiedDataService failed, falling back to direct Firestore query:", unifiedError);
          const teamMembers = yield this.firestoreAdapter.queryDocuments("teamMembers", [
            { field: "organizationId", operator: "==", value: organizationId }
          ]);
          console.log(`🔍 [TeamMemberService] Raw team members found: ${teamMembers.length}`);
          activeMembers = teamMembers.filter((member) => {
            var _a, _b;
            const status = ((_b = (_a = member.status) == null ? void 0 : _a.toUpperCase) == null ? void 0 : _b.call(_a)) || member.status || "UNKNOWN";
            if (status !== "ACTIVE" && status !== "active") {
              console.log(`⚠️ [TeamMemberService] Excluding team member ${member.email} with status: ${status}`);
              return false;
            }
            if (member.isActive === false) {
              console.log(`⚠️ [TeamMemberService] Excluding team member ${member.email} with isActive: false`);
              return false;
            }
            if (member.revokedAt || member.removedAt || member.suspendedAt) {
              console.log(`⚠️ [TeamMemberService] Excluding team member ${member.email} with revocation/removal dates`);
              return false;
            }
            return true;
          });
          console.log(`✅ [TeamMemberService] Active team members after filtering: ${activeMembers.length}`);
        }
        let assignedMemberIds = [];
        if (options == null ? void 0 : options.excludeProjectId) {
          try {
            const projectTeamMembers = yield this.getProjectTeamMembersFromFirestore(options.excludeProjectId);
            assignedMemberIds = projectTeamMembers.map((ptm) => ptm.teamMemberId);
            console.log(`🔍 [TeamMemberService] Excluding ${assignedMemberIds.length} already assigned team members`);
          } catch (error) {
            console.warn("⚠️ [TeamMemberService] Failed to get assigned team members:", error);
          }
        }
        let filteredMembers = activeMembers.filter((member) => {
          if (assignedMemberIds.includes(member.id)) {
            return false;
          }
          if (options == null ? void 0 : options.search) {
            const searchTerm = options.search.toLowerCase();
            const name = (member.name || "").toLowerCase();
            const firstName = (member.firstName || "").toLowerCase();
            const lastName = (member.lastName || "").toLowerCase();
            const email = (member.email || "").toLowerCase();
            return name.includes(searchTerm) || firstName.includes(searchTerm) || lastName.includes(searchTerm) || email.includes(searchTerm);
          }
          return true;
        });
        const mappedMembers = filteredMembers.map((member) => {
          let displayName = member.name;
          if (!displayName) {
            if (member.firstName && member.lastName) {
              displayName = `${member.firstName} ${member.lastName}`;
            } else if (member.firstName) {
              displayName = member.firstName;
            } else if (member.lastName) {
              displayName = member.lastName;
            } else if (member.email) {
              const emailParts = member.email.split("@");
              const username = emailParts[0];
              displayName = username.replace(/[._-]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
            } else {
              displayName = "Unknown User";
            }
          }
          let licenseType = member.licenseType;
          if (!licenseType) {
            licenseType = "professional";
          }
          return __spreadProps(__spreadValues({}, member), {
            name: displayName,
            licenseType,
            status: "active",
            // Use lowercase to match TeamMemberStatus enum
            isActive: true
            // Ensure isActive is always true for filtered members
          });
        });
        mappedMembers.sort((a, b) => {
          const nameA = (a.name || "").toLowerCase();
          const nameB = (b.name || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        console.log(`✅ [TeamMemberService] Final filtered and mapped team members: ${mappedMembers.length}`);
        return mappedMembers;
      } catch (error) {
        this.handleError(error, "getLicensedTeamMembersFromFirestore");
        return [];
      }
    });
  }
  /**
   * Get project team members from Firestore
   */
  getProjectTeamMembersFromFirestore(projectId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [TeamMemberService] Fetching team members from Firestore for project:", projectId);
        yield this.firestoreAdapter.initialize();
        const teamMembers = [];
        const project = yield this.firestoreAdapter.getDocumentById("projects", projectId);
        if (project) {
          const projectTeamMembers = project.teamMembers || [];
          for (const tm of projectTeamMembers) {
            teamMembers.push({
              id: tm.userId || tm.id,
              teamMemberId: tm.userId || tm.id,
              projectId,
              role: tm.role || "member",
              permissions: tm.permissions || ["read"],
              assignedAt: tm.assignedAt || (/* @__PURE__ */ new Date()).toISOString(),
              isActive: tm.isActive !== false,
              email: tm.email,
              name: tm.name || tm.email,
              status: tm.status || "active"
            });
          }
        }
        try {
          const projectTeamMembersCollection = yield this.firestoreAdapter.queryDocuments("projectTeamMembers", [
            { field: "projectId", operator: "==", value: projectId }
          ]);
          for (const ptm of projectTeamMembersCollection) {
            if (!teamMembers.find((tm) => tm.teamMemberId === ptm.teamMemberId)) {
              teamMembers.push(ptm);
            }
          }
        } catch (collectionError) {
          console.log("ℹ️ [TeamMemberService] projectTeamMembers collection not found or accessible");
        }
        const enrichedTeamMembers = [];
        for (const teamMember of teamMembers) {
          try {
            let fullProfile = null;
            try {
              fullProfile = yield this.firestoreAdapter.getDocumentById("teamMembers", teamMember.teamMemberId);
              if (fullProfile) {
                console.log("✅ [TeamMemberService] Found team member in teamMembers collection:", fullProfile.name || fullProfile.email);
              }
            } catch (teamMemberError) {
              console.log("🔍 [TeamMemberService] Team member not found in teamMembers, trying users collection...");
            }
            if (!fullProfile) {
              try {
                fullProfile = yield this.firestoreAdapter.getDocumentById("users", teamMember.teamMemberId);
                if (fullProfile) {
                  console.log("✅ [TeamMemberService] Found team member in users collection:", fullProfile.name || fullProfile.email);
                }
              } catch (userError) {
                console.log("🔍 [TeamMemberService] Team member not found in users collection either");
              }
            }
            if (fullProfile) {
              let displayName = "Unnamed User";
              if (fullProfile.name && fullProfile.name !== "Unnamed User") {
                displayName = fullProfile.name;
              } else if (fullProfile.firstName && fullProfile.lastName) {
                displayName = `${fullProfile.firstName} ${fullProfile.lastName}`;
              } else if (fullProfile.firstName) {
                displayName = fullProfile.firstName;
              } else if (fullProfile.lastName) {
                displayName = fullProfile.lastName;
              } else if (fullProfile.email) {
                const emailParts = fullProfile.email.split("@");
                displayName = emailParts[0].replace(/[._-]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
              }
              console.log("🔍 [TeamMemberService] Extracted display name:", displayName, "from profile:", {
                name: fullProfile.name,
                firstName: fullProfile.firstName,
                lastName: fullProfile.lastName,
                email: fullProfile.email
              });
              enrichedTeamMembers.push(__spreadProps(__spreadValues({}, teamMember), {
                name: displayName,
                email: fullProfile.email || teamMember.email || "No email",
                teamMember: __spreadProps(__spreadValues({}, fullProfile), {
                  name: displayName
                  // Ensure the nested teamMember also has the correct name
                })
              }));
            } else {
              console.warn("⚠️ [TeamMemberService] No profile found for team member:", teamMember.teamMemberId);
              enrichedTeamMembers.push(teamMember);
            }
          } catch (profileError) {
            console.warn("⚠️ [TeamMemberService] Failed to get full profile for team member:", teamMember.teamMemberId, profileError);
            enrichedTeamMembers.push(teamMember);
          }
        }
        console.log(`✅ [TeamMemberService] Found ${enrichedTeamMembers.length} team members for project ${projectId}`);
        return enrichedTeamMembers;
      } catch (error) {
        this.handleError(error, `getProjectTeamMembersFromFirestore(${projectId})`);
        return [];
      }
    });
  }
  /**
   * 🚀 PERFORMANCE OPTIMIZATION: Get team members for multiple projects from Firestore in batch
   * This reduces Firestore calls by loading all team members at once
   */
  getProjectTeamMembersFromFirestoreBatch(projectIds) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [TeamMemberService] Fetching team members from Firestore for projects in batch:", projectIds);
        yield this.firestoreAdapter.initialize();
        const batchResult = {};
        projectIds.forEach((projectId) => {
          batchResult[projectId] = [];
        });
        const projectPromises = projectIds.map((projectId) => __async(this, null, function* () {
          try {
            const project = yield this.firestoreAdapter.getDocumentById("projects", projectId);
            return { projectId, project };
          } catch (error) {
            console.warn(`⚠️ [TeamMemberService] Failed to get project ${projectId}:`, error);
            return { projectId, project: null };
          }
        }));
        const projects = yield Promise.all(projectPromises);
        const allTeamMemberIds = /* @__PURE__ */ new Set();
        const projectTeamMembersMap = /* @__PURE__ */ new Map();
        projects.forEach(({ projectId, project }) => {
          if (project) {
            const projectTeamMembers = project.teamMembers || [];
            projectTeamMembersMap.set(projectId, projectTeamMembers);
            projectTeamMembers.forEach((tm) => {
              const teamMemberId = tm.userId || tm.id;
              if (teamMemberId) {
                allTeamMemberIds.add(teamMemberId);
              }
            });
          }
        });
        try {
          const projectTeamMembersCollection = yield this.firestoreAdapter.queryDocuments("projectTeamMembers", [
            { field: "projectId", operator: "in", value: projectIds }
          ]);
          projectTeamMembersCollection.forEach((ptm) => {
            if (!projectTeamMembersMap.has(ptm.projectId)) {
              projectTeamMembersMap.set(ptm.projectId, []);
            }
            projectTeamMembersMap.get(ptm.projectId).push(ptm);
          });
        } catch (collectionError) {
          console.log("ℹ️ [TeamMemberService] projectTeamMembers collection not found or accessible");
        }
        const teamMemberProfiles = /* @__PURE__ */ new Map();
        if (allTeamMemberIds.size > 0) {
          try {
            const teamMemberPromises = Array.from(allTeamMemberIds).map((teamMemberId) => __async(this, null, function* () {
              try {
                const profile = yield this.firestoreAdapter.getDocumentById("teamMembers", teamMemberId);
                return { teamMemberId, profile };
              } catch (error) {
                console.warn(`⚠️ [TeamMemberService] Failed to get team member profile ${teamMemberId}:`, error);
                return { teamMemberId, profile: null };
              }
            }));
            const profiles = yield Promise.all(teamMemberPromises);
            profiles.forEach(({ teamMemberId, profile }) => {
              if (profile) {
                teamMemberProfiles.set(teamMemberId, profile);
              }
            });
          } catch (error) {
            console.warn("⚠️ [TeamMemberService] Failed to load team member profiles:", error);
          }
        }
        projectTeamMembersMap.forEach((projectTeamMembers, projectId) => {
          const enrichedTeamMembers = [];
          projectTeamMembers.forEach((tm) => {
            const teamMemberId = tm.userId || tm.id;
            const fullProfile = teamMemberProfiles.get(teamMemberId);
            if (fullProfile) {
              let displayName = fullProfile.name;
              if (!displayName && fullProfile.firstName && fullProfile.lastName) {
                displayName = `${fullProfile.firstName} ${fullProfile.lastName}`;
              } else if (!displayName && fullProfile.firstName) {
                displayName = fullProfile.firstName;
              } else if (!displayName && fullProfile.email) {
                const emailParts = fullProfile.email.split("@");
                displayName = emailParts[0].replace(/[._-]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
              }
              enrichedTeamMembers.push({
                id: teamMemberId,
                teamMemberId,
                projectId,
                role: tm.role || "member",
                permissions: tm.permissions || ["read"],
                assignedAt: tm.assignedAt || (/* @__PURE__ */ new Date()).toISOString(),
                isActive: tm.isActive !== false,
                email: fullProfile.email || tm.email || "No email",
                name: displayName || tm.name || tm.email || "Unknown",
                status: tm.status || "active",
                teamMember: __spreadProps(__spreadValues({}, fullProfile), {
                  name: displayName
                })
              });
            } else {
              enrichedTeamMembers.push({
                id: teamMemberId,
                teamMemberId,
                projectId,
                role: tm.role || "member",
                permissions: tm.permissions || ["read"],
                assignedAt: tm.assignedAt || (/* @__PURE__ */ new Date()).toISOString(),
                isActive: tm.isActive !== false,
                email: tm.email || "No email",
                name: tm.name || tm.email || "Unknown",
                status: tm.status || "active"
              });
            }
          });
          batchResult[projectId] = enrichedTeamMembers;
          console.log(`✅ [TeamMemberService] Found ${enrichedTeamMembers.length} team members for project ${projectId}`);
        });
        return batchResult;
      } catch (error) {
        this.handleError(error, `getProjectTeamMembersFromFirestoreBatch(${projectIds.join(", ")})`);
        return {};
      }
    });
  }
  /**
   * Add a team member to a project in Firestore
   */
  addTeamMemberToProjectInFirestore(projectId, teamMemberId, role) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [TeamMemberService] Adding team member to project in Firestore:", { projectId, teamMemberId, role });
        yield this.firestoreAdapter.initialize();
        let teamMemberProfile = null;
        teamMemberProfile = yield this.firestoreAdapter.getDocumentById("teamMembers", teamMemberId);
        if (!teamMemberProfile) {
          console.log("🔍 [TeamMemberService] Team member not found in teamMembers, trying users collection...");
          const userProfile = yield this.firestoreAdapter.getDocumentById("users", teamMemberId);
          if (userProfile) {
            teamMemberProfile = {
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name || `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim(),
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              role: userProfile.role || "MEMBER",
              licenseType: userProfile.licenseType || "BASIC",
              status: userProfile.status || "ACTIVE",
              organizationId: userProfile.organizationId,
              department: userProfile.department,
              company: userProfile.company,
              createdAt: userProfile.createdAt || /* @__PURE__ */ new Date(),
              updatedAt: userProfile.updatedAt || /* @__PURE__ */ new Date()
            };
            console.log("✅ [TeamMemberService] Found team member in users collection:", teamMemberProfile.name);
          }
        }
        if (!teamMemberProfile) {
          console.log("🔍 [TeamMemberService] Team member not found in users, trying orgMembers collection...");
          const orgMemberProfile = yield this.firestoreAdapter.getDocumentById("orgMembers", teamMemberId);
          if (orgMemberProfile) {
            teamMemberProfile = {
              id: orgMemberProfile.id,
              email: orgMemberProfile.email,
              name: orgMemberProfile.name || `${orgMemberProfile.firstName || ""} ${orgMemberProfile.lastName || ""}`.trim(),
              firstName: orgMemberProfile.firstName,
              lastName: orgMemberProfile.lastName,
              role: orgMemberProfile.role || "MEMBER",
              licenseType: orgMemberProfile.licenseType || "BASIC",
              status: orgMemberProfile.status || "ACTIVE",
              organizationId: orgMemberProfile.organizationId,
              department: orgMemberProfile.department,
              company: orgMemberProfile.company,
              createdAt: orgMemberProfile.createdAt || /* @__PURE__ */ new Date(),
              updatedAt: orgMemberProfile.updatedAt || /* @__PURE__ */ new Date()
            };
            console.log("✅ [TeamMemberService] Found team member in orgMembers collection:", teamMemberProfile.name);
          }
        }
        if (!teamMemberProfile) {
          console.warn("⚠️ [TeamMemberService] Team member not found in any collection:", teamMemberId);
          throw new Error(`Team member not found: ${teamMemberId}`);
        }
        if (role === TeamMemberRole.ADMIN) {
          const projectTeamMembers = yield this.getProjectTeamMembersFromFirestore(projectId);
          const hasAdmin = projectTeamMembers.some((m) => m.role === TeamMemberRole.ADMIN);
          if (hasAdmin) {
            console.warn("⚠️ [TeamMemberService] Only one Admin is allowed per project");
            throw new Error("Only one Admin is allowed per project. Please remove the existing Admin first.");
          }
        }
        const newAssignment = {
          projectId,
          teamMemberId,
          role,
          assignedBy: "system",
          // TODO: Get from auth context
          assignedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          isActive: true,
          // Store complete team member data for immediate display
          teamMemberName: teamMemberProfile.name || "Unknown User",
          teamMemberEmail: teamMemberProfile.email || "No email",
          teamMemberRole: teamMemberProfile.role || "MEMBER",
          teamMemberLicenseType: teamMemberProfile.licenseType || "BASIC"
        };
        const result = yield this.firestoreAdapter.createDocument("projectTeamMembers", newAssignment);
        return result !== null;
      } catch (error) {
        this.handleError(error, `addTeamMemberToProjectInFirestore(${projectId}, ${teamMemberId})`);
        return false;
      }
    });
  }
  /**
   * Remove a team member from a project in Firestore
   */
  removeTeamMemberFromProjectInFirestore(projectId, teamMemberId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [TeamMemberService] Removing team member from project in Firestore:", { projectId, teamMemberId });
        yield this.firestoreAdapter.initialize();
        const projectTeamMembers = yield this.firestoreAdapter.queryDocuments("projectTeamMembers", [
          { field: "projectId", operator: "==", value: projectId },
          { field: "teamMemberId", operator: "==", value: teamMemberId }
        ]);
        if (projectTeamMembers.length === 0) {
          console.warn("⚠️ [TeamMemberService] Team member not found in project");
          return false;
        }
        const success = yield this.firestoreAdapter.deleteDocument("projectTeamMembers", projectTeamMembers[0].id);
        return success;
      } catch (error) {
        this.handleError(error, `removeTeamMemberFromProjectInFirestore(${projectId}, ${teamMemberId})`);
        return false;
      }
    });
  }
  /**
   * Update a team member's role in a project in Firestore
   */
  updateTeamMemberRoleInFirestore(projectId, teamMemberId, role) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [TeamMemberService] Updating team member role in Firestore:", { projectId, teamMemberId, role });
        yield this.firestoreAdapter.initialize();
        const projectTeamMembers = yield this.firestoreAdapter.queryDocuments("projectTeamMembers", [
          { field: "projectId", operator: "==", value: projectId },
          { field: "teamMemberId", operator: "==", value: teamMemberId }
        ]);
        if (projectTeamMembers.length === 0) {
          console.warn("⚠️ [TeamMemberService] Team member not found in project");
          return false;
        }
        if (role === TeamMemberRole.ADMIN) {
          const allProjectTeamMembers = yield this.getProjectTeamMembersFromFirestore(projectId);
          const hasAdmin = allProjectTeamMembers.some((m) => m.role === TeamMemberRole.ADMIN && m.teamMemberId !== teamMemberId);
          if (hasAdmin) {
            console.warn("⚠️ [TeamMemberService] Only one Admin is allowed per project");
            throw new Error("Only one Admin is allowed per project. Please remove the existing Admin first.");
          }
        }
        const success = yield this.firestoreAdapter.updateDocument("projectTeamMembers", projectTeamMembers[0].id, {
          role,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        return success;
      } catch (error) {
        this.handleError(error, `updateTeamMemberRoleInFirestore(${projectId}, ${teamMemberId})`);
        return false;
      }
    });
  }
  /**
   * Validate team member credentials from Firestore
   */
  validateTeamMemberCredentialsFromFirestore(email, password) {
    return __async(this, null, function* () {
      try {
        yield this.firestoreAdapter.initialize();
        const teamMembers = yield this.firestoreAdapter.queryDocuments("teamMembers", [
          { field: "email", operator: "==", value: email }
        ]);
        if (teamMembers.length === 0) {
          return {
            isValid: false,
            error: "Team member not found"
          };
        }
        const teamMember = teamMembers[0];
        if (password.length < 1) {
          return {
            isValid: false,
            error: "Password is required"
          };
        }
        return {
          isValid: true,
          teamMember,
          projectAccess: []
          // Will be loaded when needed
        };
      } catch (error) {
        this.handleError(error, "validateTeamMemberCredentialsFromFirestore");
        return {
          isValid: false,
          error: "Authentication failed"
        };
      }
    });
  }
  /**
   * Create team member with Firebase Auth in Firestore
   */
  createTeamMemberWithFirebaseAuthInFirestore(teamMemberData) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [TeamMemberService] Creating team member with Firebase Auth in Firestore:", teamMemberData);
        yield this.firestoreAdapter.initialize();
        const { auth } = yield __vitePreload(() => __async(this, null, function* () {
          const { auth: auth2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
          return { auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        const { createUserWithEmailAndPassword } = yield __vitePreload(() => __async(this, null, function* () {
          const { createUserWithEmailAndPassword: createUserWithEmailAndPassword2 } = yield import("./index.esm-D5-7iBdy.js");
          return { createUserWithEmailAndPassword: createUserWithEmailAndPassword2 };
        }), true ? __vite__mapDeps([8,6]) : void 0);
        const temporaryPassword = teamMemberData.temporaryPassword || this.generateSecurePassword();
        let firebaseUser;
        try {
          const userCredential = yield createUserWithEmailAndPassword(
            auth,
            teamMemberData.email,
            temporaryPassword
          );
          firebaseUser = userCredential.user;
          console.log("✅ [TeamMemberService] Firebase Auth user created successfully:", firebaseUser.uid);
        } catch (authError) {
          if (authError.code === "auth/email-already-in-use") {
            return {
              success: false,
              error: "User with this email already exists in Firebase Authentication"
            };
          }
          throw authError;
        }
        const teamMemberDoc = {
          id: firebaseUser.uid,
          // Use Firebase UID as document ID
          email: teamMemberData.email,
          firstName: teamMemberData.firstName,
          lastName: teamMemberData.lastName,
          name: `${teamMemberData.firstName} ${teamMemberData.lastName}`,
          licenseType: teamMemberData.licenseType || "PROFESSIONAL",
          status: "ACTIVE",
          organizationId: teamMemberData.organizationId,
          department: teamMemberData.department,
          role: teamMemberData.role || "MEMBER",
          firebaseUid: firebaseUser.uid,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          isActive: true
        };
        const userDoc = {
          id: firebaseUser.uid,
          // Use Firebase UID as document ID
          email: teamMemberData.email,
          name: `${teamMemberData.firstName} ${teamMemberData.lastName}`,
          firstName: teamMemberData.firstName,
          lastName: teamMemberData.lastName,
          role: "TEAM_MEMBER",
          firebaseUid: firebaseUser.uid,
          isEmailVerified: false,
          twoFactorEnabled: false,
          twoFactorBackupCodes: [],
          privacyConsent: [],
          marketingConsent: false,
          dataProcessingConsent: false,
          identityVerified: false,
          kycStatus: "PENDING",
          isTeamMember: true,
          organizationId: teamMemberData.organizationId,
          memberRole: teamMemberData.role || "MEMBER",
          memberStatus: "ACTIVE",
          department: teamMemberData.department,
          licenseType: teamMemberData.licenseType || "PROFESSIONAL",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        let teamMemberResult = null;
        let userResult = null;
        teamMemberResult = yield this.firestoreAdapter.createDocument("teamMembers", teamMemberDoc);
        if (teamMemberResult) {
          userResult = yield this.firestoreAdapter.createDocument("users", userDoc);
        }
        if (!teamMemberResult || !userResult) {
          try {
            yield firebaseUser.delete();
            console.log("🔄 [TeamMemberService] Rolled back Firebase Auth user after Firestore failure");
          } catch (rollbackError) {
            console.error("❌ [TeamMemberService] Failed to rollback Firebase Auth user:", rollbackError);
          }
          return {
            success: false,
            error: "Failed to create required documents in Firestore"
          };
        }
        console.log("✅ [TeamMemberService] Team member created successfully in Firestore");
        return {
          success: true,
          teamMember: teamMemberDoc,
          firebaseUid: firebaseUser.uid,
          temporaryPassword
        };
      } catch (error) {
        this.handleError(error, "createTeamMemberWithFirebaseAuthInFirestore");
        return {
          success: false,
          error: (error == null ? void 0 : error.message) || "Failed to create team member with Firebase Auth"
        };
      }
    });
  }
  /**
   * Generate a secure temporary password
   */
  generateSecurePassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password.split("").sort(() => Math.random() - 0.5).join("");
  }
};
__publicField(_TeamMemberService, "instance");
let TeamMemberService = _TeamMemberService;
const _ServiceFactory = class _ServiceFactory {
  constructor() {
    __publicField(this, "config");
    __publicField(this, "projectService", null);
    // private datasetService: DatasetService | null = null;
    __publicField(this, "teamMemberService", null);
    this.config = {
      isWebOnlyMode: this.detectWebOnlyMode(),
      apiBaseUrl: "/api"
    };
    this.initializeFirestoreAdapter();
  }
  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!_ServiceFactory.instance) {
      _ServiceFactory.instance = new _ServiceFactory();
    }
    return _ServiceFactory.instance;
  }
  /**
   * Initialize the ServiceFactory with configuration
   */
  initialize(config) {
    this.config = __spreadValues(__spreadValues({}, this.config), config);
    console.log("🔧 [ServiceFactory] Initialized with config:", this.config);
    this.projectService = null;
    this.teamMemberService = null;
  }
  /**
   * Get ProjectService instance
   */
  getProjectService() {
    if (!this.projectService) {
      this.projectService = ProjectService.getInstance(this.config);
    }
    return this.projectService;
  }
  /**
   * Get DatasetService instance
   */
  // public getDatasetService(): DatasetService {
  //   if (!this.datasetService) {
  //     this.datasetService = DatasetService.getInstance(this.config);
  //   }
  //   return this.datasetService;
  // }
  /**
   * Get TeamMemberService instance
   */
  getTeamMemberService() {
    if (!this.teamMemberService) {
      this.teamMemberService = TeamMemberService.getInstance(this.config);
    }
    return this.teamMemberService;
  }
  /**
   * Check if running in webonly mode
   */
  detectWebOnlyMode() {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("webonly")) {
        return urlParams.get("webonly") === "true";
      }
      const storedMode = localStorage.getItem("webonly_mode");
      if (storedMode) {
        return storedMode === "true";
      }
      if (window.ENV && window.ENV.WEBONLY) {
        return window.ENV.WEBONLY === true;
      }
    }
    return true;
  }
  /**
   * Initialize Firestore adapter
   */
  initializeFirestoreAdapter() {
    return __async(this, null, function* () {
      try {
        const firestoreAdapter = FirestoreAdapter.getInstance();
        yield firestoreAdapter.initialize();
      } catch (error) {
        console.error("❌ [ServiceFactory] Failed to initialize Firestore adapter:", error);
      }
    });
  }
};
__publicField(_ServiceFactory, "instance");
let ServiceFactory = _ServiceFactory;
const _CloudProjectIntegrationService = class _CloudProjectIntegrationService {
  constructor() {
    __publicField(this, "serviceFactory");
    __publicField(this, "authTokenCallback", null);
    __publicField(this, "isInitialized", false);
    this.serviceFactory = ServiceFactory.getInstance();
    this.serviceFactory.initialize({
      isWebOnlyMode: this.isWebOnlyMode()
    });
  }
  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!_CloudProjectIntegrationService.instance) {
      _CloudProjectIntegrationService.instance = new _CloudProjectIntegrationService();
    }
    return _CloudProjectIntegrationService.instance;
  }
  /**
   * Check if running in webonly mode
   */
  isWebOnlyMode() {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("webonly")) {
        return urlParams.get("webonly") === "true";
      }
      const storedMode = localStorage.getItem("webonly_mode");
      if (storedMode) {
        return storedMode === "true";
      }
      if (window.ENV && window.ENV.WEBONLY) {
        return window.ENV.WEBONLY === true;
      }
    }
    return true;
  }
  /**
   * Set configuration for services
   */
  setConfig(config) {
    this.serviceFactory.initialize(config);
  }
  // PROJECT METHODS
  /**
   * Get all projects
   */
  getProjects() {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().getProjects();
    });
  }
  /**
   * Get projects for the current user
   * (Alias for getProjects for backward compatibility)
   */
  getUserProjects() {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().getProjects();
    });
  }
  /**
   * Get a project by ID
   */
  getProject(projectId) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().getProject(projectId);
    });
  }
  /**
   * Create a new project
   */
  createProject(project) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().createProject(project);
    });
  }
  /**
   * Create a new cloud project (alias for createProject for backward compatibility)
   */
  createCloudProject(project) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().createProject(project);
    });
  }
  /**
   * Create a project directly in Firestore (for backward compatibility)
   */
  createCloudProjectInFirestore(project) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().createProject(project);
    });
  }
  /**
   * Update a project
   */
  updateProject(projectId, updates) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().updateProject(projectId, updates);
    });
  }
  /**
   * Update a project directly in Firestore (for backward compatibility)
   */
  updateProjectInFirestore(projectId, updates) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().updateProject(projectId, updates);
    });
  }
  /**
   * Archive a project
   */
  archiveProject(projectId) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().archiveProject(projectId);
    });
  }
  /**
   * Archive a project directly in Firestore (for backward compatibility)
   */
  archiveProjectInFirestore(projectId) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().archiveProject(projectId);
    });
  }
  /**
   * Restore a project from archive
   */
  restoreProject(projectId) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().restoreProject(projectId);
    });
  }
  /**
   * Permanently delete a project
   */
  deleteProject(projectId) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getProjectService().deleteProject(projectId);
    });
  }
  // DATASET METHODS
  /**
   * List all datasets with optional filters
   */
  listDatasets(params) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Listing all datasets with params:", params);
        if (this.isWebOnlyMode()) {
          console.log("🔍 [CloudProjectIntegration] WebOnly mode - fetching all datasets from Firestore");
          return yield this.getAllDatasetsFromFirestore(params);
        }
        console.log("🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore");
        return yield this.getAllDatasetsFromFirestore(params);
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to list datasets:", error);
        return [];
      }
    });
  }
  /**
   * Create a new dataset
   */
  createDataset(input) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Creating dataset with input:", input);
        if (this.isWebOnlyMode()) {
          console.log("🔍 [CloudProjectIntegration] WebOnly mode - creating dataset in Firestore");
          return yield this.createDatasetInFirestore(input);
        }
        console.log("🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore");
        return yield this.createDatasetInFirestore(input);
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to create dataset:", error);
        throw error;
      }
    });
  }
  /**
   * Update an existing dataset with new collection assignments and other properties
   */
  updateDataset(datasetId, updates) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Updating dataset:", datasetId, "with updates:", updates);
        if (this.isWebOnlyMode()) {
          console.log("🔍 [CloudProjectIntegration] WebOnly mode - updating dataset in Firestore");
          return yield this.updateDatasetInFirestore(datasetId, updates);
        }
        console.log("🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore");
        return yield this.updateDatasetInFirestore(datasetId, updates);
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to update dataset:", error);
        throw error;
      }
    });
  }
  /**
   * Get datasets for a specific project
   */
  getProjectDatasets(projectId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Getting datasets for project:", projectId);
        if (this.isWebOnlyMode()) {
          console.log("🔍 [CloudProjectIntegration] WebOnly mode - fetching datasets from Firestore for project:", projectId);
          return yield this.getProjectDatasetsFromFirestore(projectId);
        }
        console.log("🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore");
        return yield this.getProjectDatasetsFromFirestore(projectId);
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to get project datasets:", error);
        return [];
      }
    });
  }
  /**
   * Assign a dataset to a project
   */
  assignDatasetToProject(projectId, datasetId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Assigning dataset to project:", { projectId, datasetId });
        if (this.isWebOnlyMode()) {
          console.log("🔍 [CloudProjectIntegration] WebOnly mode - assigning dataset to project in Firestore");
          return yield this.assignDatasetToProjectInFirestore(projectId, datasetId);
        }
        console.log("🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore");
        return yield this.assignDatasetToProjectInFirestore(projectId, datasetId);
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to assign dataset to project:", error);
        throw error;
      }
    });
  }
  /**
   * Unassign a dataset from a project
   */
  unassignDatasetFromProject(projectId, datasetId) {
    return __async(this, null, function* () {
      yield this.unassignDatasetFromProjectInFirestore(projectId, datasetId);
    });
  }
  /**
   * Unassign a dataset from a project directly in Firestore (webonly mode)
   */
  unassignDatasetFromProjectInFirestore(projectId, datasetId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Unassigning dataset from project in Firestore:", { projectId, datasetId });
        const { db } = yield __vitePreload(() => __async(this, null, function* () {
          const { db: db2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
          return { db: db2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        const { doc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, updateDoc: updateDoc2, getDoc: getDoc2, collection: collection2, query: query2, where: where2, getDocs: getDocs2, deleteDoc: deleteDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, updateDoc: updateDoc2, getDoc: getDoc2, collection: collection2, query: query2, where: where2, getDocs: getDocs2, deleteDoc: deleteDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const datasetRef = doc(db, "datasets", datasetId);
        const datasetDoc = yield getDoc(datasetRef);
        if (!datasetDoc.exists()) {
          throw new Error("Dataset not found");
        }
        const datasetData = datasetDoc.data();
        if (datasetData.projectId !== projectId) {
          console.log("⚠️ [CloudProjectIntegration] Dataset is not assigned to this project, but continuing cleanup...");
        }
        yield updateDoc(datasetRef, {
          projectId: null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log("✅ [CloudProjectIntegration] Cleared projectId from dataset");
        const projectDatasetQuery = query(
          collection(db, "project_datasets"),
          where("projectId", "==", projectId),
          where("datasetId", "==", datasetId)
        );
        const projectDatasetDocs = yield getDocs(projectDatasetQuery);
        console.log(`🔍 [CloudProjectIntegration] Found ${projectDatasetDocs.size} project_datasets links to remove`);
        const deletePromises = [];
        projectDatasetDocs.forEach((docSnapshot) => {
          console.log(`🗑️ [CloudProjectIntegration] Removing project_datasets link: ${docSnapshot.id}`);
          deletePromises.push(deleteDoc(docSnapshot.ref));
        });
        yield Promise.all(deletePromises);
        console.log(`✅ [CloudProjectIntegration] Removed ${deletePromises.length} project_datasets links`);
        const projectRef = doc(db, "projects", projectId);
        yield updateDoc(projectRef, {
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log("✅ [CloudProjectIntegration] Updated project timestamp");
        console.log("🎉 [CloudProjectIntegration] Successfully unassigned dataset from project");
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Error unassigning dataset from project:", error);
        throw error;
      }
    });
  }
  /**
   * Delete a dataset permanently
   */
  deleteDataset(datasetId) {
    return __async(this, null, function* () {
      try {
        console.log("🗑️ [CloudProjectIntegration] Deleting dataset:", datasetId);
        const { db } = yield __vitePreload(() => __async(this, null, function* () {
          const { db: db2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
          return { db: db2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        const { doc, getDoc, collection, query, where, getDocs, deleteDoc, writeBatch } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, getDoc: getDoc2, collection: collection2, query: query2, where: where2, getDocs: getDocs2, deleteDoc: deleteDoc2, writeBatch: writeBatch2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, getDoc: getDoc2, collection: collection2, query: query2, where: where2, getDocs: getDocs2, deleteDoc: deleteDoc2, writeBatch: writeBatch2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const datasetRef = doc(db, "datasets", datasetId);
        const datasetDoc = yield getDoc(datasetRef);
        if (!datasetDoc.exists()) {
          throw new Error("Dataset not found");
        }
        const datasetData = datasetDoc.data();
        console.log("🔍 [CloudProjectIntegration] Dataset found:", datasetData.name);
        const batch = writeBatch(db);
        const projectDatasetQuery = query(
          collection(db, "project_datasets"),
          where("datasetId", "==", datasetId)
        );
        const projectDatasetDocs = yield getDocs(projectDatasetQuery);
        console.log(`🔍 [CloudProjectIntegration] Found ${projectDatasetDocs.size} project_datasets links to remove`);
        projectDatasetDocs.forEach((docSnapshot) => {
          console.log("🗑️ [CloudProjectIntegration] Deleting project_datasets link:", docSnapshot.id);
          batch.delete(docSnapshot.ref);
        });
        batch.delete(datasetRef);
        yield batch.commit();
        console.log("✅ [CloudProjectIntegration] Dataset deleted successfully");
        return true;
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to delete dataset:", error);
        throw error;
      }
    });
  }
  /**
   * Clean up corrupted datasets
   */
  cleanupCorruptedDatasets() {
    return __async(this, null, function* () {
      return { cleaned: 0, errors: [] };
    });
  }
  /**
   * Create a dataset directly in Firestore (webonly mode)
   */
  createDatasetInFirestore(input) {
    return __async(this, null, function* () {
      var _a;
      try {
        console.log("🔍 [CloudProjectIntegration] Creating dataset in Firestore:", input);
        const { db, auth } = yield __vitePreload(() => __async(this, null, function* () {
          const { db: db2, auth: auth2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
          return { db: db2, auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        const { doc, setDoc, collection, getDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, setDoc: setDoc2, collection: collection2, getDoc: getDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, setDoc: setDoc2, collection: collection2, getDoc: getDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const currentUser = yield this.waitForFirebaseAuth();
        if (!currentUser) {
          console.warn("⚠️ [CloudProjectIntegration] Cannot create dataset - authentication required");
          throw new Error("Authentication required to create dataset");
        }
        const userDoc = yield getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        let organizationId = (userData == null ? void 0 : userData.organizationId) || input.organizationId;
        if (!organizationId) {
          try {
            const storedUser = localStorage.getItem("auth_user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              organizationId = (parsedUser == null ? void 0 : parsedUser.organizationId) || ((_a = parsedUser == null ? void 0 : parsedUser.teamMemberData) == null ? void 0 : _a.organizationId);
            }
          } catch (error) {
            console.warn("⚠️ [CloudProjectIntegration] Could not get organization ID from localStorage during creation:", error);
          }
        }
        if (!organizationId) {
          organizationId = currentUser.uid;
        }
        console.log("🔍 [CloudProjectIntegration] Creating dataset with organization ID:", {
          userId: currentUser.uid,
          organizationId,
          inputOrganizationId: input.organizationId,
          userDataOrganizationId: userData == null ? void 0 : userData.organizationId
        });
        const datasetRef = doc(collection(db, "datasets"));
        const now = /* @__PURE__ */ new Date();
        const collectionAssignment = input.collectionAssignment;
        const selectedCollections = (collectionAssignment == null ? void 0 : collectionAssignment.selectedCollections) || [];
        const datasetData = {
          id: datasetRef.id,
          name: input.name,
          description: input.description || "",
          visibility: input.visibility || "private",
          tags: input.tags || [],
          schema: input.schema || {},
          storage: input.storage || { backend: "firestore" },
          ownerId: currentUser.uid,
          organizationId,
          projectId: input.projectId || null,
          // 🔧 CRITICAL FIX: Include projectId
          status: "ACTIVE",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          lastAccessedAt: now.toISOString(),
          size: 0,
          fileCount: 0,
          // 🚨 CRITICAL FIX: Save collections in BOTH formats for compatibility
          collections: selectedCollections,
          // Dashboard expects this format
          collectionAssignment: collectionAssignment || null
          // Licensing website uses this format
        };
        yield setDoc(datasetRef, datasetData);
        console.log("✅ [CloudProjectIntegration] Dataset created successfully in Firestore:", datasetRef.id);
        return datasetData;
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to create dataset in Firestore:", error);
        throw error;
      }
    });
  }
  /**
   * Update an existing dataset in Firestore (webonly mode)
   */
  updateDatasetInFirestore(datasetId, updates) {
    return __async(this, null, function* () {
      var _a, _b;
      try {
        console.log("🔍 [CloudProjectIntegration] Updating dataset in Firestore:", datasetId);
        const { db, auth } = yield __vitePreload(() => __async(this, null, function* () {
          const { db: db2, auth: auth2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
          return { db: db2, auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        const { doc, getDoc, updateDoc, serverTimestamp } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, getDoc: getDoc2, updateDoc: updateDoc2, serverTimestamp: serverTimestamp2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, getDoc: getDoc2, updateDoc: updateDoc2, serverTimestamp: serverTimestamp2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const currentUser = yield this.waitForFirebaseAuth();
        if (!currentUser) {
          throw new Error("User not authenticated");
        }
        const datasetRef = doc(db, "datasets", datasetId);
        const currentDatasetDoc = yield getDoc(datasetRef);
        if (!currentDatasetDoc.exists()) {
          throw new Error("Dataset not found");
        }
        const currentDataset = currentDatasetDoc.data();
        const { doc: docFn } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: docFn2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: docFn2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const userDoc = yield getDoc(docFn(db, "users", currentUser.uid));
        const userData = userDoc.data();
        let userOrganizationId = userData == null ? void 0 : userData.organizationId;
        if (!userOrganizationId) {
          try {
            const storedUser = localStorage.getItem("auth_user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              userOrganizationId = (parsedUser == null ? void 0 : parsedUser.organizationId) || ((_a = parsedUser == null ? void 0 : parsedUser.teamMemberData) == null ? void 0 : _a.organizationId);
            }
          } catch (error) {
            console.warn("⚠️ [CloudProjectIntegration] Could not get organization ID from localStorage:", error);
          }
        }
        if (!userOrganizationId) {
          userOrganizationId = currentUser.uid;
        }
        console.log("🔍 [CloudProjectIntegration] Authorization check:", {
          datasetId,
          currentUserId: currentUser.uid,
          datasetOrganizationId: currentDataset.organizationId,
          userOrganizationId,
          userData
        });
        const hasPermission = currentDataset.organizationId === userOrganizationId || currentDataset.ownerId === currentUser.uid || !currentDataset.organizationId;
        if (!hasPermission) {
          console.error("❌ [CloudProjectIntegration] Authorization failed:", {
            reason: "Organization mismatch",
            datasetOrganizationId: currentDataset.organizationId,
            userOrganizationId,
            datasetOwnerId: currentDataset.ownerId,
            currentUserId: currentUser.uid
          });
          throw new Error("Unauthorized: Dataset belongs to different organization");
        }
        const updateData = __spreadProps(__spreadValues({}, updates), {
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        if ((_b = updateData.collectionAssignment) == null ? void 0 : _b.selectedCollections) {
          updateData.collections = updateData.collectionAssignment.selectedCollections;
        }
        delete updateData.id;
        delete updateData.ownerId;
        delete updateData.createdAt;
        console.log("🔄 [CloudProjectIntegration] Updating dataset with data:", updateData);
        yield updateDoc(datasetRef, updateData);
        const updatedDatasetDoc = yield getDoc(datasetRef);
        const updatedDataset = updatedDatasetDoc.data();
        console.log("✅ [CloudProjectIntegration] Dataset updated successfully in Firestore:", datasetId);
        return updatedDataset;
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to update dataset in Firestore:", error);
        throw error;
      }
    });
  }
  /**
   * Get datasets for a project from Firestore (webonly mode)
   * 🚨 CRITICAL FIX: Use project_datasets collection for proper linking
   * 🚀 PERFORMANCE OPTIMIZATION: Batch dataset queries to reduce Firestore calls
   */
  getProjectDatasetsFromFirestore(projectId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Getting datasets from Firestore for project:", projectId);
        const { db, auth } = yield __vitePreload(() => __async(this, null, function* () {
          const { db: db2, auth: auth2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
          return { db: db2, auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        const { collection, query, where, getDocs, doc, getDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { collection: collection2, query: query2, where: where2, getDocs: getDocs2, doc: doc2, getDoc: getDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { collection: collection2, query: query2, where: where2, getDocs: getDocs2, doc: doc2, getDoc: getDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const currentUser = yield this.waitForFirebaseAuth();
        if (!currentUser) {
          console.warn("⚠️ [CloudProjectIntegration] Cannot get project datasets - returning empty list");
          return [];
        }
        const projectDatasetQuery = query(
          collection(db, "project_datasets"),
          where("projectId", "==", projectId)
        );
        const projectDatasetSnapshot = yield getDocs(projectDatasetQuery);
        if (projectDatasetSnapshot.empty) {
          console.log(`✅ [CloudProjectIntegration] No dataset assignments found for project ${projectId}`);
          return [];
        }
        console.log(`🔍 [CloudProjectIntegration] Found ${projectDatasetSnapshot.size} dataset assignments for project ${projectId}`);
        const datasetIds = [];
        for (const linkDoc of projectDatasetSnapshot.docs) {
          const linkData = linkDoc.data();
          const datasetId = linkData.datasetId;
          if (datasetId) {
            datasetIds.push(datasetId);
          } else {
            console.warn("⚠️ [CloudProjectIntegration] Project dataset link missing datasetId:", linkDoc.id);
          }
        }
        if (datasetIds.length === 0) {
          return [];
        }
        const datasetPromises = datasetIds.map((datasetId) => __async(this, null, function* () {
          var _a, _b, _c, _d, _e, _f;
          try {
            const datasetDoc = yield getDoc(doc(db, "datasets", datasetId));
            if (datasetDoc.exists()) {
              const datasetData = datasetDoc.data();
              const dataset = {
                id: datasetDoc.id,
                name: datasetData.name || "Untitled Dataset",
                description: datasetData.description || "",
                projectId,
                // Set the project ID from the link
                type: datasetData.type || "general",
                status: datasetData.status || "active",
                createdAt: ((_c = (_b = (_a = datasetData.createdAt) == null ? void 0 : _a.toDate) == null ? void 0 : _b.call(_a)) == null ? void 0 : _c.toISOString()) || datasetData.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: ((_f = (_e = (_d = datasetData.updatedAt) == null ? void 0 : _d.toDate) == null ? void 0 : _e.call(_d)) == null ? void 0 : _f.toISOString()) || datasetData.updatedAt || (/* @__PURE__ */ new Date()).toISOString(),
                size: datasetData.size || 0,
                recordCount: datasetData.recordCount || 0,
                schema: datasetData.schema || {},
                tags: datasetData.tags || [],
                isPublic: datasetData.isPublic || false,
                ownerId: datasetData.ownerId,
                storage: datasetData.storage || { backend: "firestore" },
                visibility: datasetData.visibility || "private",
                // Include collection assignment data for compatibility
                collections: datasetData.collections || [],
                collectionAssignment: datasetData.collectionAssignment || null
              };
              console.log(`✅ [CloudProjectIntegration] Added dataset "${dataset.name}" (${dataset.id}) for project ${projectId}`);
              return dataset;
            } else {
              console.warn(`⚠️ [CloudProjectIntegration] Dataset ${datasetId} referenced in project_datasets but not found in datasets collection`);
              return null;
            }
          } catch (datasetError) {
            console.error(`❌ [CloudProjectIntegration] Failed to fetch dataset ${datasetId}:`, datasetError);
            return null;
          }
        }));
        const datasetResults = yield Promise.all(datasetPromises);
        const datasets = datasetResults.filter((dataset) => dataset !== null);
        datasets.sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        console.log(`✅ [CloudProjectIntegration] Successfully loaded ${datasets.length} datasets for project ${projectId} (parallel fetch)`);
        return datasets;
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to get datasets from Firestore:", error);
        return [];
      }
    });
  }
  /**
   * Get all datasets from Firestore (webonly mode)
   */
  getAllDatasetsFromFirestore(params) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Getting all datasets from Firestore with params:", params);
        const { db, auth } = yield __vitePreload(() => __async(this, null, function* () {
          const { db: db2, auth: auth2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
          return { db: db2, auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        const { collection, query, where, getDocs, orderBy } = yield __vitePreload(() => __async(this, null, function* () {
          const { collection: collection2, query: query2, where: where2, getDocs: getDocs2, orderBy: orderBy2 } = yield import("./index.esm-CjtNHFZy.js");
          return { collection: collection2, query: query2, where: where2, getDocs: getDocs2, orderBy: orderBy2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const currentUser = yield this.waitForFirebaseAuth();
        if (!currentUser) {
          console.warn("⚠️ [CloudProjectIntegration] Cannot get all datasets - returning empty list");
          return [];
        }
        const { doc, getDoc } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, getDoc: getDoc2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, getDoc: getDoc2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const userDoc = yield getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        const organizationId = (userData == null ? void 0 : userData.organizationId) || (params == null ? void 0 : params.organizationId);
        let datasetsQuery = query(
          collection(db, "datasets"),
          where("status", "==", "ACTIVE"),
          orderBy("updatedAt", "desc")
        );
        if (organizationId) {
          datasetsQuery = query(
            collection(db, "datasets"),
            where("organizationId", "==", organizationId),
            where("status", "==", "ACTIVE"),
            orderBy("updatedAt", "desc")
          );
        }
        const snapshot = yield getDocs(datasetsQuery);
        let datasets = snapshot.docs.map((doc2) => {
          const data = doc2.data();
          return __spreadProps(__spreadValues({}, data), {
            id: doc2.id
          });
        });
        if (params == null ? void 0 : params.visibility) {
          datasets = datasets.filter((dataset) => dataset.visibility === params.visibility);
        }
        if (params == null ? void 0 : params.query) {
          const searchQuery = params.query.toLowerCase();
          datasets = datasets.filter(
            (dataset) => dataset.name.toLowerCase().includes(searchQuery) || dataset.description && dataset.description.toLowerCase().includes(searchQuery)
          );
        }
        console.log(`✅ [CloudProjectIntegration] Found ${datasets.length} datasets`);
        return datasets;
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to get all datasets from Firestore:", error);
        return [];
      }
    });
  }
  /**
   * Get all datasets for the current organization (useful for dataset management dialog)
   */
  getAllOrganizationDatasets() {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [CloudProjectIntegration] Getting all datasets for organization");
        if (this.isWebOnlyMode()) {
          console.log("🔍 [CloudProjectIntegration] WebOnly mode - fetching all organization datasets from Firestore");
          return yield this.getAllDatasetsFromFirestore();
        }
        console.log("🔄 [CloudProjectIntegration] Non-webonly mode detected, falling back to Firestore");
        return yield this.getAllDatasetsFromFirestore();
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to get organization datasets:", error);
        return [];
      }
    });
  }
  /**
   * Assign a dataset to a project directly in Firestore (webonly mode)
   * 🚨 CRITICAL FIX: Include collection assignment data for Dashboard compatibility
   */
  assignDatasetToProjectInFirestore(projectId, datasetId) {
    return __async(this, null, function* () {
      var _a, _b;
      try {
        console.log("🔍 [CloudProjectIntegration] Assigning dataset to project in Firestore:", { projectId, datasetId });
        const { db } = yield __vitePreload(() => __async(this, null, function* () {
          const { db: db2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
          return { db: db2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        const { doc, updateDoc, getDoc, collection, addDoc, query, where, getDocs } = yield __vitePreload(() => __async(this, null, function* () {
          const { doc: doc2, updateDoc: updateDoc2, getDoc: getDoc2, collection: collection2, addDoc: addDoc2, query: query2, where: where2, getDocs: getDocs2 } = yield import("./index.esm-CjtNHFZy.js");
          return { doc: doc2, updateDoc: updateDoc2, getDoc: getDoc2, collection: collection2, addDoc: addDoc2, query: query2, where: where2, getDocs: getDocs2 };
        }), true ? __vite__mapDeps([7,6]) : void 0);
        const datasetRef = doc(db, "datasets", datasetId);
        const datasetDoc = yield getDoc(datasetRef);
        if (!datasetDoc.exists()) {
          throw new Error("Dataset not found");
        }
        const datasetData = datasetDoc.data();
        console.log("🔍 [CloudProjectIntegration] Dataset data:", {
          id: datasetId,
          name: datasetData == null ? void 0 : datasetData.name,
          collections: datasetData == null ? void 0 : datasetData.collections,
          collectionAssignment: datasetData == null ? void 0 : datasetData.collectionAssignment
        });
        const projectRef = doc(db, "projects", projectId);
        const projectDoc = yield getDoc(projectRef);
        if (!projectDoc.exists()) {
          throw new Error("Project not found");
        }
        const projectData = projectDoc.data();
        const organizationId = (projectData == null ? void 0 : projectData.organizationId) || (projectData == null ? void 0 : projectData.organization_id);
        console.log("🔍 [CloudProjectIntegration] Project data:", {
          id: projectId,
          name: projectData == null ? void 0 : projectData.name,
          organizationId
        });
        yield updateDoc(datasetRef, {
          projectId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        const existingAssignmentQuery = query(
          collection(db, "project_datasets"),
          where("projectId", "==", projectId),
          where("datasetId", "==", datasetId)
        );
        const existingAssignmentSnapshot = yield getDocs(existingAssignmentQuery);
        if (!existingAssignmentSnapshot.empty) {
          console.log("⚠️ [CloudProjectIntegration] Dataset already assigned to project, updating existing assignment");
          const existingDoc = existingAssignmentSnapshot.docs[0];
          const existingData = existingDoc.data();
          const collections = (datasetData == null ? void 0 : datasetData.collections) || ((_a = datasetData == null ? void 0 : datasetData.collectionAssignment) == null ? void 0 : _a.selectedCollections) || [];
          yield updateDoc(existingDoc.ref, {
            assignedCollections: collections,
            collectionAssignment: {
              selectedCollections: collections,
              assignmentMode: "EXCLUSIVE",
              priority: 1,
              routingEnabled: true
            },
            organizationId,
            tenantId: organizationId,
            isActive: true,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          console.log("✅ [CloudProjectIntegration] Updated existing dataset assignment with collection data");
        } else {
          console.log("🔍 [CloudProjectIntegration] Creating new dataset assignment with collection data");
          const collections = (datasetData == null ? void 0 : datasetData.collections) || ((_b = datasetData == null ? void 0 : datasetData.collectionAssignment) == null ? void 0 : _b.selectedCollections) || [];
          console.log("🔍 [CloudProjectIntegration] Extracted collections for assignment:", collections);
          const projectDatasetLink = {
            projectId,
            datasetId,
            addedByUserId: (datasetData == null ? void 0 : datasetData.ownerId) || "system",
            addedAt: (/* @__PURE__ */ new Date()).toISOString(),
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            // 🚨 CRITICAL FIX: Include collection assignment data for Dashboard compatibility
            assignedCollections: collections,
            collectionAssignment: {
              selectedCollections: collections,
              assignmentMode: "EXCLUSIVE",
              priority: 1,
              routingEnabled: true
            },
            organizationId,
            tenantId: organizationId,
            isActive: true
          };
          yield addDoc(collection(db, "project_datasets"), projectDatasetLink);
          console.log("✅ [CloudProjectIntegration] Created new dataset assignment with collection data");
        }
        yield updateDoc(projectRef, {
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log("✅ [CloudProjectIntegration] Dataset assigned to project successfully in Firestore");
      } catch (error) {
        console.error("❌ [CloudProjectIntegration] Failed to assign dataset to project in Firestore:", error);
        throw error;
      }
    });
  }
  // TEAM MEMBER METHODS
  /**
   * Get all licensed team members
   * Excludes members already assigned to the specified project
   */
  getLicensedTeamMembers(options) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getTeamMemberService().getLicensedTeamMembers(options);
    });
  }
  /**
   * Get team members assigned to a specific project
   */
  getProjectTeamMembers(projectId) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getTeamMemberService().getProjectTeamMembers(projectId);
    });
  }
  /**
   * 🚀 PERFORMANCE OPTIMIZATION: Get team members for multiple projects in batch
   * This reduces the number of Firestore calls by loading all team members at once
   */
  getProjectTeamMembersBatch(projectIds) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getTeamMemberService().getProjectTeamMembersBatch(projectIds);
    });
  }
  /**
   * Add a team member to a project with a specific role
   */
  addTeamMemberToProject(_0, _1) {
    return __async(this, arguments, function* (projectId, teamMemberId, role = TeamMemberRole.MEMBER) {
      yield this.serviceFactory.getTeamMemberService().addTeamMemberToProject(projectId, teamMemberId, role);
    });
  }
  /**
   * Remove a team member from a project
   */
  removeTeamMemberFromProject(projectId, teamMemberId) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getTeamMemberService().removeTeamMemberFromProject(projectId, teamMemberId);
    });
  }
  /**
   * Update a team member's role in a project
   */
  updateTeamMemberRole(projectId, teamMemberId, role) {
    return __async(this, null, function* () {
      yield this.serviceFactory.getTeamMemberService().updateTeamMemberRole(projectId, teamMemberId, role);
    });
  }
  /**
   * Validate team member credentials
   */
  validateTeamMemberCredentials(email, password) {
    return __async(this, null, function* () {
      return yield this.serviceFactory.getTeamMemberService().validateTeamMemberCredentials(email, password);
    });
  }
  // AUTHENTICATION METHODS
  /**
   * Set auth token callback
   */
  setAuthTokenCallback(callback) {
    this.authTokenCallback = callback;
  }
  /**
   * Set auth token
   */
  setAuthToken(token) {
    console.log("Setting auth token:", token);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
    if (this.authTokenCallback) {
      this.authTokenCallback();
    }
  }
  // UTILITY METHODS
  /**
   * Clean document data for Firestore (remove undefined values)
   */
  cleanDocumentData(data) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === void 0) continue;
      if (value === null) {
        cleaned[key] = null;
        continue;
      }
      if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = this.cleanDocumentData(value);
        continue;
      }
      cleaned[key] = value;
    }
    return cleaned;
  }
  /**
   * 🔧 CRITICAL FIX: Wait for Firebase Auth to be ready using event-driven approach
   * This prevents "No authenticated user" errors when Firebase Auth is still initializing
   */
  waitForFirebaseAuth(maxWaitTime = 5e3) {
    return __async(this, null, function* () {
      const { auth } = yield __vitePreload(() => __async(this, null, function* () {
        const { auth: auth2 } = yield import("./firebase-Cqr2XXGQ.js").then((n) => n.f);
        return { auth: auth2 };
      }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
      const { onAuthStateChanged } = yield __vitePreload(() => __async(this, null, function* () {
        const { onAuthStateChanged: onAuthStateChanged2 } = yield import("./index.esm-D5-7iBdy.js");
        return { onAuthStateChanged: onAuthStateChanged2 };
      }), true ? __vite__mapDeps([8,6]) : void 0);
      if (auth.currentUser) {
        return auth.currentUser;
      }
      console.log("⏳ [CloudProjectIntegration] Waiting for Firebase Auth initialization...");
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("⚠️ [CloudProjectIntegration] Firebase Auth timeout after waiting");
          resolve(null);
        }, maxWaitTime);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          clearTimeout(timeout);
          unsubscribe();
          if (user) {
            console.log("✅ [CloudProjectIntegration] Firebase Auth ready, user authenticated:", user.email);
          } else {
            console.log("ℹ️ [CloudProjectIntegration] Firebase Auth ready, but no user authenticated");
          }
          resolve(user);
        });
      });
    });
  }
};
__publicField(_CloudProjectIntegrationService, "instance");
let CloudProjectIntegrationService = _CloudProjectIntegrationService;
const cloudProjectIntegration = CloudProjectIntegrationService.getInstance();
if (typeof window !== "undefined") {
  window.cloudProjectIntegration = cloudProjectIntegration;
}
const CloudProjectIntegration = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  cloudProjectIntegration
}, Symbol.toStringTag, { value: "Module" }));
export {
  CloudProjectIntegration as C,
  TeamMemberRole as T,
  TeamMemberService as a,
  cloudProjectIntegration as c
};
