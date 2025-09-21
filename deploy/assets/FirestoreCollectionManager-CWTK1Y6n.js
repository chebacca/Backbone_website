const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/firebase-roGnv0IS.js","assets/index-DTMyJ3rt.js","assets/mui-DJqJu8cJ.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-BZOVZ1Et.js","assets/index-COak77tQ.css","assets/index.esm-zVCMB3Cx.js","assets/index.esm-CjtNHFZy.js","assets/index.esm-D5-7iBdy.js"])))=>i.map(i=>d[i]);
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
import { _ as __vitePreload } from "./index-DTMyJ3rt.js";
import { collection, query, limit, getDocs, doc, Timestamp, addDoc, updateDoc, deleteDoc, getDoc, where, orderBy, writeBatch, onSnapshot } from "./index.esm-CjtNHFZy.js";
import { d as db } from "./firebase-roGnv0IS.js";
import "./mui-DJqJu8cJ.js";
import "./vendor-Cu2L4Rr-.js";
import "./stripe-BZOVZ1Et.js";
import "./index.esm-zVCMB3Cx.js";
import "./index.esm-D5-7iBdy.js";
const COLLECTIONS = {
  // Core User Management
  USERS: "users",
  USER_PROFILES: "userProfiles",
  USER_SETTINGS: "userSettings",
  // Standardized from 'user_settingss'
  USER_SETTINGS_LEGACY: "user_settingss",
  // Legacy with typo preserved
  USER_TIME_CARDS: "userTimeCards",
  // Standardized from 'user_time_cards'
  USER_TIME_CARDS_LEGACY: "user_time_cards",
  // Legacy collection
  // Organization & Team Management - STANDARDIZED TO CAMELCASE
  ORGANIZATIONS: "organizations",
  ORG_MEMBERS: "orgMembers",
  // STANDARDIZED from 'org_members'
  ORG_MEMBERS_LEGACY: "org_members",
  // Legacy snake_case collection
  TEAM_MEMBERS: "teamMembers",
  // Already camelCase
  TEAM_MEMBERS_LEGACY: "team_members",
  // Legacy snake_case collection
  // Project Management - STANDARDIZED TO CAMELCASE
  PROJECTS: "projects",
  PROJECT_TEAM_MEMBERS: "projectTeamMembers",
  // STANDARDIZED from 'project_team_members'
  PROJECT_TEAM_MEMBERS_LEGACY: "project_team_members",
  // Legacy snake_case collection
  PROJECT_PARTICIPANTS: "projectParticipants",
  // Standardized from 'project_participants'
  PROJECT_PARTICIPANTS_LEGACY: "project_participants",
  // Legacy collection
  DATASETS: "datasets",
  // Licensing & Payments
  LICENSES: "licenses",
  SUBSCRIPTIONS: "subscriptions",
  PAYMENTS: "payments",
  INVOICES: "invoices",
  INVOICE_PAYMENTS: "invoice_payments",
  // Activity & Monitoring
  ACTIVITIES: "activities",
  AUDIT_LOG: "audit_log",
  AUDIT_LOGS: "auditLogs",
  // Alternative naming
  SESSIONS: "sessions",
  USAGE_ANALYTICS: "usage_analytics",
  // System & Configuration
  SYSTEM_SETTINGS: "systemSettings",
  SDK_VERSIONS: "sdkVersions",
  WEBHOOK_EVENTS: "webhookEvents",
  WEBHOOK_EVENTS_ALT: "webhook_events",
  // Communication & Notifications
  NOTIFICATIONS: "notifications",
  PRIVACY_CONSENTS: "privacy_consents",
  // Delivery & Logging
  LICENSE_DELIVERY_LOGS: "license_delivery_logs",
  // Workflow & Diagrams
  WORKFLOW_DIAGRAMS: "workflowDiagrams",
  // Standardized from 'workflow_diagrams'
  WORKFLOW_DIAGRAMS_LEGACY: "workflow_diagrams",
  // Legacy collection
  // Network Delivery & Deliverables Collections
  NETWORK_DELIVERY_BIBLES: "networkDeliveryBibles",
  DELIVERABLES: "deliverables",
  NETWORK_DELIVERY_CHATS: "networkDeliveryChats",
  DELIVERY_SPECS: "deliverySpecs",
  DELIVERY_TEMPLATES: "deliveryTemplates",
  DELIVERY_TRACKING: "deliveryTracking",
  // Additional Production Collections
  SESSION_WORKFLOWS: "sessionWorkflows",
  SESSION_ASSIGNMENTS: "sessionAssignments",
  SESSION_PARTICIPANTS: "sessionParticipants",
  WORKFLOW_TEMPLATES: "workflowTemplates",
  WORKFLOW_INSTANCES: "workflowInstances",
  WORKFLOW_STEPS: "workflowSteps",
  WORKFLOW_ASSIGNMENTS: "workflowAssignments",
  SESSION_PHASE_TRANSITIONS: "sessionPhaseTransitions",
  SESSION_REVIEWS: "sessionReviews",
  SESSION_QC: "sessionQc",
  SESSION_TASKS: "sessionTasks",
  DEMO_SESSIONS: "demoSessions",
  // Inventory & Equipment Collections
  INVENTORY_ITEMS: "inventoryItems",
  INVENTORY: "inventory",
  NETWORK_IP_ASSIGNMENTS: "networkIPAssignments",
  NETWORK_IP_RANGES: "networkIPRanges",
  NETWORKS: "networks",
  INVENTORY_HISTORY: "inventoryHistory",
  SETUP_PROFILES: "setupProfiles",
  SCHEMAS: "schemas",
  SCHEMA_FIELDS: "schemaFields",
  MAP_LAYOUTS: "mapLayouts",
  MAP_LOCATIONS: "mapLocations",
  INVENTORY_MAPS: "inventoryMaps",
  MAP_DATA: "mapData",
  // Timecard Collections
  TIMECARD_ENTRIES: "timecard_entries",
  USER_TIMECARDS: "user_timecards",
  TIMECARD_APPROVALS: "timecard_approvals",
  TIMECARD_TEMPLATES: "timecard_templates",
  // Media & Content Collections
  MEDIA_FILES: "mediaFiles",
  POST_PRODUCTION_TASKS: "postProductionTasks",
  STAGES: "stages",
  NOTES: "notes",
  REPORTS: "reports",
  CALL_SHEETS: "callSheets",
  // AI & Automation Collections
  AI_AGENTS: "aiAgents",
  MESSAGES: "messages",
  CHATS: "chats",
  MESSAGE_SESSIONS: "messageSessions",
  // PBM Collections
  PBM_PROJECTS: "pbmProjects",
  PBM_SCHEDULES: "pbmSchedules",
  PBM_PAYSCALES: "pbmPayscales",
  PBM_DAILY_STATUS: "pbmDailyStatus"
};
const COLLECTION_MAPPINGS = {
  // Primary collections (camelCase) with fallback to legacy (snake_case)
  orgMembers: ["orgMembers", "org_members"],
  teamMembers: ["teamMembers", "team_members"],
  projectTeamMembers: ["projectTeamMembers", "project_team_members"],
  projectParticipants: ["projectParticipants", "project_participants"],
  userSettings: ["userSettings", "user_settingss"],
  // Note: legacy has typo
  userTimeCards: ["userTimeCards", "user_time_cards"],
  workflowDiagrams: ["workflowDiagrams", "workflow_diagrams"],
  auditLogs: ["auditLogs", "audit_log"],
  webhookEvents: ["webhookEvents", "webhook_events"],
  usageAnalytics: ["usageAnalytics", "usage_analytics"],
  privacyConsents: ["privacyConsents", "privacy_consents"],
  licenseDeliveryLogs: ["licenseDeliveryLogs", "license_delivery_logs"]
};
const _FirestoreCollectionManager = class _FirestoreCollectionManager {
  static getInstance() {
    if (!_FirestoreCollectionManager.instance) {
      _FirestoreCollectionManager.instance = new _FirestoreCollectionManager();
    }
    return _FirestoreCollectionManager.instance;
  }
  /**
   * Check if we're in webonly mode
   * Licensing website is ALWAYS in web-only mode
   */
  isWebOnlyMode() {
    return true;
  }
  /**
   * Get collection reference with proper typing and fallback support
   */
  getCollection(collectionName) {
    return collection(db, collectionName);
  }
  /**
   * Get collection with automatic fallback to legacy naming
   * This method tries the primary (camelCase) collection first, then falls back to legacy (snake_case)
   */
  getCollectionWithFallback(primaryCollectionName) {
    return __async(this, null, function* () {
      const mappingKey = primaryCollectionName;
      const possibleNames = COLLECTION_MAPPINGS[mappingKey] || [primaryCollectionName];
      for (let i = 0; i < possibleNames.length; i++) {
        const collectionName = possibleNames[i];
        const isLegacy = i > 0;
        try {
          const collectionRef = this.getCollection(collectionName);
          const testQuery = query(collectionRef, limit(1));
          yield getDocs(testQuery);
          console.log(`✅ [FirestoreCollectionManager] Using ${isLegacy ? "legacy" : "primary"} collection: '${collectionName}'`);
          return { collection: collectionRef, collectionName, isLegacy };
        } catch (error) {
          console.warn(`⚠️ [FirestoreCollectionManager] Collection '${collectionName}' not accessible, trying next...`);
          continue;
        }
      }
      const primaryCollection = this.getCollection(possibleNames[0]);
      console.warn(`⚠️ [FirestoreCollectionManager] No accessible collections found, using primary: '${possibleNames[0]}'`);
      return { collection: primaryCollection, collectionName: possibleNames[0], isLegacy: false };
    });
  }
  /**
   * Get document reference with proper typing
   */
  getDocument(collectionName, docId) {
    return doc(db, collectionName, docId);
  }
  /**
   * Initialize all required collections and ensure they exist
   */
  initializeCollections() {
    return __async(this, null, function* () {
      console.log("🔧 [FirestoreCollectionManager] Initializing Firestore collections...");
      try {
        const { auth } = yield __vitePreload(() => __async(this, null, function* () {
          const { auth: auth2 } = yield import("./firebase-roGnv0IS.js").then((n) => n.f);
          return { auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8]) : void 0);
        if (!auth.currentUser && this.isWebOnlyMode()) {
          console.warn("⚠️ [FirestoreCollectionManager] No authenticated user - some operations may fail");
          return;
        }
        const coreCollections = [
          COLLECTIONS.USERS,
          COLLECTIONS.ORGANIZATIONS,
          COLLECTIONS.ORG_MEMBERS,
          COLLECTIONS.PROJECTS,
          COLLECTIONS.LICENSES,
          COLLECTIONS.TEAM_MEMBERS,
          COLLECTIONS.PROJECT_TEAM_MEMBERS
        ];
        for (const collectionName of coreCollections) {
          try {
            const collectionRef = this.getCollection(collectionName);
            const testQuery = query(collectionRef, limit(1));
            yield getDocs(testQuery);
            console.log(`✅ [FirestoreCollectionManager] Collection '${collectionName}' is accessible`);
          } catch (error) {
            console.warn(`⚠️ [FirestoreCollectionManager] Collection '${collectionName}' may not be accessible:`, error);
          }
        }
        console.log("✅ [FirestoreCollectionManager] Collection initialization completed");
      } catch (error) {
        console.error("❌ [FirestoreCollectionManager] Failed to initialize collections:", error);
      }
    });
  }
  /**
   * Clean document data by removing undefined and null values
   * This prevents Firestore errors when creating/updating documents
   */
  cleanDocumentData(data) {
    if (typeof data !== "object" || data === null) {
      return data;
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.cleanDocumentData(item));
    }
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== void 0 && value !== null) {
        cleaned[key] = this.cleanDocumentData(value);
      }
    }
    return cleaned;
  }
  /**
   * Create a new document in a collection
   */
  createDocument(collectionName, data) {
    return __async(this, null, function* () {
      try {
        const collectionRef = this.getCollection(collectionName);
        const now = Timestamp.now();
        const docData = __spreadProps(__spreadValues({}, data), {
          createdAt: data.createdAt || now,
          updatedAt: data.updatedAt || now
        });
        const cleanedData = this.cleanDocumentData(docData);
        const docRef = yield addDoc(collectionRef, cleanedData);
        console.log(`✅ [FirestoreCollectionManager] Created document in '${collectionName}':`, docRef.id);
        return docRef.id;
      } catch (error) {
        console.error(`❌ [FirestoreCollectionManager] Failed to create document in '${collectionName}':`, error);
        throw error;
      }
    });
  }
  /**
   * Update a document in a collection
   */
  updateDocument(collectionName, docId, data) {
    return __async(this, null, function* () {
      try {
        const docRef = this.getDocument(collectionName, docId);
        const updateData = __spreadProps(__spreadValues({}, data), {
          updatedAt: data.updatedAt || Timestamp.now()
        });
        const cleanedData = this.cleanDocumentData(updateData);
        yield updateDoc(docRef, cleanedData);
        console.log(`✅ [FirestoreCollectionManager] Updated document in '${collectionName}':`, docId);
      } catch (error) {
        console.error(`❌ [FirestoreCollectionManager] Failed to update document in '${collectionName}':`, error);
        throw error;
      }
    });
  }
  /**
   * Delete a document from a collection
   */
  deleteDocument(collectionName, docId) {
    return __async(this, null, function* () {
      try {
        const docRef = this.getDocument(collectionName, docId);
        yield deleteDoc(docRef);
        console.log(`✅ [FirestoreCollectionManager] Deleted document from '${collectionName}':`, docId);
      } catch (error) {
        console.error(`❌ [FirestoreCollectionManager] Failed to delete document from '${collectionName}':`, error);
        throw error;
      }
    });
  }
  /**
   * Get a single document by ID
   */
  getDocumentById(collectionName, docId) {
    return __async(this, null, function* () {
      try {
        const docRef = this.getDocument(collectionName, docId);
        const docSnap = yield getDoc(docRef);
        if (docSnap.exists()) {
          return __spreadValues({ id: docSnap.id }, docSnap.data());
        }
        return null;
      } catch (error) {
        console.error(`❌ [FirestoreCollectionManager] Failed to get document from '${collectionName}':`, error);
        throw error;
      }
    });
  }
  /**
   * Query documents with filters
   */
  queryDocuments(_0) {
    return __async(this, arguments, function* (collectionName, filters = [], orderByField, orderDirection = "desc", limitCount) {
      var _a;
      try {
        const collectionRef = this.getCollection(collectionName);
        let q = query(collectionRef);
        for (const filter of filters) {
          q = query(q, where(filter.field, filter.operator, filter.value));
        }
        if (orderByField) {
          q = query(q, orderBy(orderByField, orderDirection));
        }
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        const querySnapshot = yield getDocs(q);
        const documents = [];
        querySnapshot.forEach((doc2) => {
          documents.push(__spreadValues({ id: doc2.id }, doc2.data()));
        });
        return documents;
      } catch (error) {
        if ((error == null ? void 0 : error.code) === "failed-precondition" && ((_a = error == null ? void 0 : error.message) == null ? void 0 : _a.includes("index"))) {
          console.warn(`⚠️ [FirestoreCollectionManager] Index missing for '${collectionName}', trying simpler query...`);
          try {
            const collectionRef = this.getCollection(collectionName);
            let q = query(collectionRef);
            for (const filter of filters) {
              q = query(q, where(filter.field, filter.operator, filter.value));
            }
            if (limitCount) {
              q = query(q, limit(limitCount));
            }
            const querySnapshot = yield getDocs(q);
            const documents = [];
            querySnapshot.forEach((doc2) => {
              documents.push(__spreadValues({ id: doc2.id }, doc2.data()));
            });
            if (orderByField && documents.length > 0) {
              documents.sort((a, b) => {
                const aVal = a[orderByField];
                const bVal = b[orderByField];
                if (orderDirection === "desc") {
                  return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                } else {
                  return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                }
              });
            }
            console.log(`✅ [FirestoreCollectionManager] Fallback query successful for '${collectionName}': ${documents.length} documents`);
            return documents;
          } catch (fallbackError) {
            console.error(`❌ [FirestoreCollectionManager] Fallback query also failed for '${collectionName}':`, fallbackError);
            throw fallbackError;
          }
        }
        console.error(`❌ [FirestoreCollectionManager] Failed to query documents from '${collectionName}':`, error);
        throw error;
      }
    });
  }
  /**
   * Query documents with automatic fallback to legacy collections
   * This method tries the primary collection first, then falls back to legacy naming
   */
  queryDocumentsWithFallback(_0) {
    return __async(this, arguments, function* (primaryCollectionName, filters = [], orderByField, orderDirection = "desc", limitCount) {
      const mappingKey = primaryCollectionName;
      const possibleNames = COLLECTION_MAPPINGS[mappingKey] || [primaryCollectionName];
      let lastError = null;
      for (let i = 0; i < possibleNames.length; i++) {
        const collectionName = possibleNames[i];
        const isLegacy = i > 0;
        try {
          const documents = yield this.queryDocuments(
            collectionName,
            filters,
            orderByField,
            orderDirection,
            limitCount
          );
          console.log(`✅ [FirestoreCollectionManager] Successfully queried ${isLegacy ? "legacy" : "primary"} collection '${collectionName}': ${documents.length} documents`);
          return { documents, collectionUsed: collectionName, isLegacy };
        } catch (error) {
          console.warn(`⚠️ [FirestoreCollectionManager] Failed to query '${collectionName}', trying next...`, error);
          lastError = error;
          continue;
        }
      }
      console.error(`❌ [FirestoreCollectionManager] All collection queries failed for '${primaryCollectionName}'`);
      throw lastError || new Error(`No accessible collections found for '${primaryCollectionName}'`);
    });
  }
  /**
   * Batch operations for multiple documents
   */
  batchOperations(operations) {
    return __async(this, null, function* () {
      try {
        const batch = writeBatch(db);
        const now = Timestamp.now();
        for (const operation of operations) {
          switch (operation.type) {
            case "create":
              if (operation.data) {
                const docRef = doc(this.getCollection(operation.collection));
                batch.set(docRef, __spreadProps(__spreadValues({}, operation.data), {
                  createdAt: operation.data.createdAt || now,
                  updatedAt: operation.data.updatedAt || now
                }));
              }
              break;
            case "update":
              if (operation.docId && operation.data) {
                const docRef = this.getDocument(operation.collection, operation.docId);
                batch.update(docRef, __spreadProps(__spreadValues({}, operation.data), {
                  updatedAt: operation.data.updatedAt || now
                }));
              }
              break;
            case "delete":
              if (operation.docId) {
                const docRef = this.getDocument(operation.collection, operation.docId);
                batch.delete(docRef);
              }
              break;
          }
        }
        yield batch.commit();
        console.log(`✅ [FirestoreCollectionManager] Completed batch operations:`, operations.length);
      } catch (error) {
        console.error("❌ [FirestoreCollectionManager] Failed to execute batch operations:", error);
        throw error;
      }
    });
  }
  /**
   * Set up real-time listener for a collection
   */
  subscribeToCollection(collectionName, callback, filters = [], orderByField, orderDirection = "desc", limitCount) {
    try {
      const collectionRef = this.getCollection(collectionName);
      let q = query(collectionRef);
      for (const filter of filters) {
        q = query(q, where(filter.field, filter.operator, filter.value));
      }
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc2) => {
          documents.push(__spreadValues({ id: doc2.id }, doc2.data()));
        });
        callback(documents);
      }, (error) => {
        console.error(`❌ [FirestoreCollectionManager] Subscription error for '${collectionName}':`, error);
      });
      console.log(`✅ [FirestoreCollectionManager] Set up subscription for '${collectionName}'`);
      return unsubscribe;
    } catch (error) {
      console.error(`❌ [FirestoreCollectionManager] Failed to set up subscription for '${collectionName}':`, error);
      return () => {
      };
    }
  }
  /**
   * Validate collection access and permissions
   */
  validateCollectionAccess(collectionName) {
    return __async(this, null, function* () {
      try {
        const collectionRef = this.getCollection(collectionName);
        const testQuery = query(collectionRef, limit(1));
        yield getDocs(testQuery);
        return true;
      } catch (error) {
        console.warn(`⚠️ [FirestoreCollectionManager] No access to collection '${collectionName}':`, error);
        return false;
      }
    });
  }
  /**
   * Get collection statistics
   */
  getCollectionStats(collectionName) {
    return __async(this, null, function* () {
      try {
        const accessible = yield this.validateCollectionAccess(collectionName);
        if (!accessible) {
          return { accessible: false };
        }
        const documents = yield this.queryDocuments(collectionName, [], "updatedAt", "desc", 100);
        return {
          accessible: true,
          documentCount: documents.length,
          lastUpdated: documents.length > 0 && documents[0].updatedAt ? new Date(documents[0].updatedAt.toDate ? documents[0].updatedAt.toDate() : documents[0].updatedAt) : void 0
        };
      } catch (error) {
        console.error(`❌ [FirestoreCollectionManager] Failed to get stats for '${collectionName}':`, error);
        return { accessible: false };
      }
    });
  }
};
__publicField(_FirestoreCollectionManager, "instance");
let FirestoreCollectionManager = _FirestoreCollectionManager;
const firestoreCollectionManager = FirestoreCollectionManager.getInstance();
export {
  COLLECTIONS,
  COLLECTION_MAPPINGS,
  FirestoreCollectionManager,
  FirestoreCollectionManager as default,
  firestoreCollectionManager
};
