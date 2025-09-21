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
import { j as jsxRuntimeExports, B as Box, T as Typography, c as Paper, r as Chip, a as Button, x as List, y as ListItem, H as ListItemText, D as Divider } from "./mui-DKIosbOx.js";
import { r as reactExports, b as React } from "./vendor-Cu2L4Rr-.js";
import { c as cloudProjectIntegration } from "./CloudProjectIntegration-CDTEjiUC.js";
import "./index-DPkTu3FI.js";
import "./stripe-CqWXfGEZ.js";
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = {
  randomUUID
};
function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
const STORAGE_KEYS = {
  PENDING_PROJECTS: "offline_pending_projects",
  SYNC_QUEUE: "offline_sync_queue"
};
const _OfflineStorageManager = class _OfflineStorageManager {
  constructor() {
    __publicField(this, "dbName", "backbone_offline_storage");
    __publicField(this, "dbVersion", 1);
    __publicField(this, "db", null);
    __publicField(this, "initPromise", null);
    this.initPromise = this.initDatabase();
  }
  static getInstance() {
    if (!_OfflineStorageManager.instance) {
      _OfflineStorageManager.instance = new _OfflineStorageManager();
    }
    return _OfflineStorageManager.instance;
  }
  /**
   * Initialize IndexedDB
   */
  initDatabase() {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        try {
          if (!window.indexedDB) {
            console.warn("IndexedDB not supported - offline storage will be limited");
            resolve(false);
            return;
          }
          const request = window.indexedDB.open(this.dbName, this.dbVersion);
          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("projects")) {
              const projectsStore = db.createObjectStore("projects", { keyPath: "id" });
              projectsStore.createIndex("pendingSync", "pendingSync", { unique: false });
              projectsStore.createIndex("createdAt", "createdAt", { unique: false });
            }
            if (!db.objectStoreNames.contains("syncQueue")) {
              const syncQueueStore = db.createObjectStore("syncQueue", { keyPath: "id" });
              syncQueueStore.createIndex("type", "type", { unique: false });
              syncQueueStore.createIndex("createdAt", "createdAt", { unique: false });
            }
          };
          request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log("✅ IndexedDB initialized for offline storage");
            resolve(true);
          };
          request.onerror = (event) => {
            console.error("❌ Failed to initialize IndexedDB:", event);
            resolve(false);
          };
        } catch (error) {
          console.error("❌ Error initializing IndexedDB:", error);
          resolve(false);
        }
      });
    });
  }
  /**
   * Ensure database is initialized
   */
  ensureInitialized() {
    return __async(this, null, function* () {
      if (this.db) return true;
      if (this.initPromise) return this.initPromise;
      return this.initDatabase();
    });
  }
  /**
   * Store a project for offline use
   */
  storeOfflineProject(project) {
    return __async(this, null, function* () {
      yield this.ensureInitialized();
      if (!this.db) {
        try {
          const projects = this.getLocalStorageProjects();
          projects.push(project);
          localStorage.setItem(STORAGE_KEYS.PENDING_PROJECTS, JSON.stringify(projects));
          return project.id;
        } catch (error) {
          console.error("❌ Failed to store project in localStorage:", error);
          throw error;
        }
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(["projects"], "readwrite");
          const store = transaction.objectStore("projects");
          const request = store.put(project);
          request.onsuccess = () => {
            console.log("✅ Project stored offline:", project.id);
            resolve(project.id);
          };
          request.onerror = (event) => {
            console.error("❌ Failed to store project offline:", event);
            reject(new Error("Failed to store project offline"));
          };
        } catch (error) {
          console.error("❌ Error storing project offline:", error);
          reject(error);
        }
      });
    });
  }
  /**
   * Get all offline projects
   */
  getOfflineProjects() {
    return __async(this, null, function* () {
      yield this.ensureInitialized();
      if (!this.db) {
        return this.getLocalStorageProjects();
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(["projects"], "readonly");
          const store = transaction.objectStore("projects");
          const request = store.getAll();
          request.onsuccess = (event) => {
            const projects = event.target.result;
            resolve(projects);
          };
          request.onerror = (event) => {
            console.error("❌ Failed to get offline projects:", event);
            reject(new Error("Failed to get offline projects"));
          };
        } catch (error) {
          console.error("❌ Error getting offline projects:", error);
          reject(error);
        }
      });
    });
  }
  /**
   * Get offline projects from localStorage (fallback)
   */
  getLocalStorageProjects() {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEYS.PENDING_PROJECTS);
      return projectsJson ? JSON.parse(projectsJson) : [];
    } catch (error) {
      console.error("❌ Failed to get projects from localStorage:", error);
      return [];
    }
  }
  /**
   * Get pending sync projects
   */
  getPendingSyncProjects() {
    return __async(this, null, function* () {
      yield this.ensureInitialized();
      if (!this.db) {
        const projects = this.getLocalStorageProjects();
        return projects.filter((p) => p.pendingSync);
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(["projects"], "readonly");
          const store = transaction.objectStore("projects");
          const index = store.index("pendingSync");
          const request = index.getAll(IDBKeyRange.only(true));
          request.onsuccess = (event) => {
            const projects = event.target.result;
            resolve(projects);
          };
          request.onerror = (event) => {
            console.error("❌ Failed to get pending sync projects:", event);
            reject(new Error("Failed to get pending sync projects"));
          };
        } catch (error) {
          console.error("❌ Error getting pending sync projects:", error);
          reject(error);
        }
      });
    });
  }
  /**
   * Mark a project as synced
   */
  markProjectSynced(projectId, onlineId) {
    return __async(this, null, function* () {
      yield this.ensureInitialized();
      if (!this.db) {
        try {
          const projects = this.getLocalStorageProjects();
          const updatedProjects = projects.map((p) => {
            if (p.id === projectId) {
              return __spreadProps(__spreadValues({}, p), { pendingSync: false, onlineId });
            }
            return p;
          });
          localStorage.setItem(STORAGE_KEYS.PENDING_PROJECTS, JSON.stringify(updatedProjects));
        } catch (error) {
          console.error("❌ Failed to mark project as synced in localStorage:", error);
          throw error;
        }
        return;
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(["projects"], "readwrite");
          const store = transaction.objectStore("projects");
          const getRequest = store.get(projectId);
          getRequest.onsuccess = (event) => {
            const project = event.target.result;
            if (!project) {
              reject(new Error(`Project not found: ${projectId}`));
              return;
            }
            project.pendingSync = false;
            if (onlineId) {
              project.id = onlineId;
            }
            const updateRequest = store.put(project);
            updateRequest.onsuccess = () => {
              console.log("✅ Project marked as synced:", projectId);
              resolve();
            };
            updateRequest.onerror = (event2) => {
              console.error("❌ Failed to mark project as synced:", event2);
              reject(new Error("Failed to mark project as synced"));
            };
          };
          getRequest.onerror = (event) => {
            console.error("❌ Failed to get project for sync update:", event);
            reject(new Error("Failed to get project for sync update"));
          };
        } catch (error) {
          console.error("❌ Error marking project as synced:", error);
          reject(error);
        }
      });
    });
  }
  /**
   * Add item to sync queue
   */
  addToSyncQueue(item) {
    return __async(this, null, function* () {
      yield this.ensureInitialized();
      const queueItem = __spreadProps(__spreadValues({
        id: v4()
      }, item), {
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        attempts: 0
      });
      if (!this.db) {
        try {
          const queueJson = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
          const queue = queueJson ? JSON.parse(queueJson) : [];
          queue.push(queueItem);
          localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
          return queueItem.id;
        } catch (error) {
          console.error("❌ Failed to add to sync queue in localStorage:", error);
          throw error;
        }
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(["syncQueue"], "readwrite");
          const store = transaction.objectStore("syncQueue");
          const request = store.add(queueItem);
          request.onsuccess = () => {
            console.log("✅ Item added to sync queue:", queueItem.id);
            resolve(queueItem.id);
          };
          request.onerror = (event) => {
            console.error("❌ Failed to add item to sync queue:", event);
            reject(new Error("Failed to add item to sync queue"));
          };
        } catch (error) {
          console.error("❌ Error adding item to sync queue:", error);
          reject(error);
        }
      });
    });
  }
  /**
   * Get all sync queue items
   */
  getSyncQueue() {
    return __async(this, null, function* () {
      yield this.ensureInitialized();
      if (!this.db) {
        try {
          const queueJson = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
          return queueJson ? JSON.parse(queueJson) : [];
        } catch (error) {
          console.error("❌ Failed to get sync queue from localStorage:", error);
          return [];
        }
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(["syncQueue"], "readonly");
          const store = transaction.objectStore("syncQueue");
          const request = store.getAll();
          request.onsuccess = (event) => {
            const queue = event.target.result;
            resolve(queue);
          };
          request.onerror = (event) => {
            console.error("❌ Failed to get sync queue:", event);
            reject(new Error("Failed to get sync queue"));
          };
        } catch (error) {
          console.error("❌ Error getting sync queue:", error);
          reject(error);
        }
      });
    });
  }
  /**
   * Remove item from sync queue
   */
  removeFromSyncQueue(itemId) {
    return __async(this, null, function* () {
      yield this.ensureInitialized();
      if (!this.db) {
        try {
          const queueJson = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
          const queue = queueJson ? JSON.parse(queueJson) : [];
          const updatedQueue = queue.filter((item) => item.id !== itemId);
          localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
        } catch (error) {
          console.error("❌ Failed to remove from sync queue in localStorage:", error);
          throw error;
        }
        return;
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(["syncQueue"], "readwrite");
          const store = transaction.objectStore("syncQueue");
          const request = store.delete(itemId);
          request.onsuccess = () => {
            console.log("✅ Item removed from sync queue:", itemId);
            resolve();
          };
          request.onerror = (event) => {
            console.error("❌ Failed to remove item from sync queue:", event);
            reject(new Error("Failed to remove item from sync queue"));
          };
        } catch (error) {
          console.error("❌ Error removing item from sync queue:", error);
          reject(error);
        }
      });
    });
  }
  /**
   * Update sync attempt for queue item
   */
  updateSyncAttempt(itemId) {
    return __async(this, null, function* () {
      yield this.ensureInitialized();
      if (!this.db) {
        try {
          const queueJson = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
          const queue = queueJson ? JSON.parse(queueJson) : [];
          const updatedQueue = queue.map((item) => {
            if (item.id === itemId) {
              return __spreadProps(__spreadValues({}, item), {
                attempts: (item.attempts || 0) + 1,
                lastAttempt: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
            return item;
          });
          localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
        } catch (error) {
          console.error("❌ Failed to update sync attempt in localStorage:", error);
          throw error;
        }
        return;
      }
      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db.transaction(["syncQueue"], "readwrite");
          const store = transaction.objectStore("syncQueue");
          const getRequest = store.get(itemId);
          getRequest.onsuccess = (event) => {
            const item = event.target.result;
            if (!item) {
              reject(new Error(`Sync queue item not found: ${itemId}`));
              return;
            }
            item.attempts = (item.attempts || 0) + 1;
            item.lastAttempt = (/* @__PURE__ */ new Date()).toISOString();
            const updateRequest = store.put(item);
            updateRequest.onsuccess = () => {
              console.log("✅ Sync attempt updated for item:", itemId);
              resolve();
            };
            updateRequest.onerror = (event2) => {
              console.error("❌ Failed to update sync attempt:", event2);
              reject(new Error("Failed to update sync attempt"));
            };
          };
          getRequest.onerror = (event) => {
            console.error("❌ Failed to get sync queue item:", event);
            reject(new Error("Failed to get sync queue item"));
          };
        } catch (error) {
          console.error("❌ Error updating sync attempt:", error);
          reject(error);
        }
      });
    });
  }
};
__publicField(_OfflineStorageManager, "instance");
let OfflineStorageManager = _OfflineStorageManager;
const offlineStorageManager = OfflineStorageManager.getInstance();
const isOnline = () => {
  if (typeof navigator !== "undefined" && "onLine" in navigator) {
    return navigator.onLine;
  }
  return true;
};
const registerNetworkListeners = (onOnline, onOffline) => {
  if (typeof window === "undefined") return () => {
  };
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
};
const testNetworkConnectivity = () => __async(void 0, null, function* () {
  try {
    const testUrl = `https://backbone-logic.web.app/ping?_=${Date.now()}`;
    const response = yield fetch(testUrl, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-cache",
      headers: { "Cache-Control": "no-cache" },
      redirect: "error"
    });
    return true;
  } catch (error) {
    return false;
  }
});
const _SyncService = class _SyncService {
  constructor() {
    __publicField(this, "syncInProgress", false);
    __publicField(this, "networkListenerCleanup", null);
    __publicField(this, "syncInterval", null);
    this.setupNetworkListeners();
  }
  static getInstance() {
    if (!_SyncService.instance) {
      _SyncService.instance = new _SyncService();
    }
    return _SyncService.instance;
  }
  /**
   * Set up network listeners to trigger sync when online
   */
  setupNetworkListeners() {
    if (this.networkListenerCleanup) {
      this.networkListenerCleanup();
    }
    this.networkListenerCleanup = registerNetworkListeners(
      // onOnline
      () => {
        console.log("🌐 Network connection restored - starting sync");
        this.startSync();
      },
      // onOffline
      () => {
        console.log("📴 Network connection lost - pausing sync");
        this.pauseSync();
      }
    );
  }
  /**
   * Start periodic sync
   */
  startSync(immediate = true) {
    this.pauseSync();
    if (immediate) {
      this.syncOfflineData();
    }
    this.syncInterval = window.setInterval(() => {
      this.syncOfflineData();
    }, 5 * 60 * 1e3);
  }
  /**
   * Pause sync
   */
  pauseSync() {
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  /**
   * Sync offline data with Firestore
   */
  syncOfflineData() {
    return __async(this, null, function* () {
      if (this.syncInProgress) {
        console.log("⏳ Sync already in progress, skipping");
        return;
      }
      if (!isOnline()) {
        console.log("📴 Device is offline, skipping sync");
        return;
      }
      try {
        this.syncInProgress = true;
        const isConnected = yield testNetworkConnectivity();
        if (!isConnected) {
          console.log("📴 Network connectivity test failed, skipping sync");
          return;
        }
        console.log("🔄 Starting offline data sync");
        yield this.syncPendingProjects();
        yield this.processSyncQueue();
        console.log("✅ Offline data sync completed");
      } catch (error) {
        console.error("❌ Error during offline data sync:", error);
      } finally {
        this.syncInProgress = false;
      }
    });
  }
  /**
   * Sync pending projects
   */
  syncPendingProjects() {
    return __async(this, null, function* () {
      try {
        const pendingProjects = yield offlineStorageManager.getPendingSyncProjects();
        if (pendingProjects.length === 0) {
          console.log("✅ No pending projects to sync");
          return;
        }
        console.log(`🔄 Syncing ${pendingProjects.length} pending projects`);
        for (const project of pendingProjects) {
          try {
            const cloudProject = yield cloudProjectIntegration.createCloudProjectInFirestore(
              project.originalOptions
            );
            if (cloudProject && cloudProject.id) {
              yield offlineStorageManager.markProjectSynced(project.id, cloudProject.id);
              console.log(`✅ Project synced: ${project.id} -> ${cloudProject.id}`);
            } else {
              console.warn(`⚠️ Project sync failed: ${project.id} - no valid cloud project ID returned`);
            }
          } catch (error) {
            console.error(`❌ Failed to sync project ${project.id}:`, error);
          }
        }
      } catch (error) {
        console.error("❌ Error syncing pending projects:", error);
      }
    });
  }
  /**
   * Process sync queue
   */
  processSyncQueue() {
    return __async(this, null, function* () {
      try {
        const queue = yield offlineStorageManager.getSyncQueue();
        if (queue.length === 0) {
          console.log("✅ No items in sync queue");
          return;
        }
        console.log(`🔄 Processing ${queue.length} items in sync queue`);
        for (const item of queue) {
          try {
            yield this.processSyncQueueItem(item);
            yield offlineStorageManager.removeFromSyncQueue(item.id);
          } catch (error) {
            console.error(`❌ Failed to process sync queue item ${item.id}:`, error);
            yield offlineStorageManager.updateSyncAttempt(item.id);
          }
        }
      } catch (error) {
        console.error("❌ Error processing sync queue:", error);
      }
    });
  }
  /**
   * Process a single sync queue item
   */
  processSyncQueueItem(item) {
    return __async(this, null, function* () {
      switch (item.type) {
        case "project_create":
          yield cloudProjectIntegration.createCloudProjectInFirestore(item.data);
          break;
        case "project_update":
          yield cloudProjectIntegration.updateProjectInFirestore(item.data.id, item.data.updates);
          break;
        case "project_delete":
          yield cloudProjectIntegration.archiveProjectInFirestore(item.data.id);
          break;
        default:
          throw new Error(`Unknown sync queue item type: ${item.type}`);
      }
    });
  }
  /**
   * Force immediate sync
   */
  forceSyncNow() {
    return __async(this, null, function* () {
      if (!isOnline()) {
        console.log("📴 Device is offline, cannot force sync");
        return false;
      }
      try {
        yield this.syncOfflineData();
        return true;
      } catch (error) {
        console.error("❌ Error during forced sync:", error);
        return false;
      }
    });
  }
  /**
   * Clean up resources
   */
  cleanup() {
    this.pauseSync();
    if (this.networkListenerCleanup) {
      this.networkListenerCleanup();
      this.networkListenerCleanup = null;
    }
  }
};
__publicField(_SyncService, "instance");
let SyncService = _SyncService;
const syncService = SyncService.getInstance();
syncService.startSync(false);
const OfflineTestPage = () => {
  const [networkStatus, setNetworkStatus] = reactExports.useState(isOnline());
  const [projects, setProjects] = reactExports.useState([]);
  const [offlineProjects, setOfflineProjects] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [testResult, setTestResult] = reactExports.useState("");
  reactExports.useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const loadProjects = () => __async(void 0, null, function* () {
    setLoading(true);
    try {
      const allProjects = yield cloudProjectIntegration.getUserProjects();
      setProjects(allProjects);
      const offlineProjs = yield offlineStorageManager.getOfflineProjects();
      setOfflineProjects(offlineProjs);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  });
  const createTestProject = () => __async(void 0, null, function* () {
    setLoading(true);
    try {
      const projectName = `Test Project ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`;
      setTestResult(`Creating project: ${projectName}...`);
      const projectId = yield cloudProjectIntegration.createCloudProject({
        name: projectName,
        description: "Test project for offline creation",
        storageMode: "cloud",
        cloudConfig: {
          provider: "firestore"
        },
        collaborationSettings: {
          maxCollaborators: 5,
          enableRealTime: true,
          enableComments: true,
          enableFileSharing: true
        }
      });
      setTestResult(`Project created with ID: ${projectId}`);
      yield loadProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  });
  const forceSync = () => __async(void 0, null, function* () {
    setLoading(true);
    try {
      setTestResult("Syncing...");
      const result = yield syncService.forceSyncNow();
      setTestResult(`Sync ${result ? "succeeded" : "failed"}`);
      yield loadProjects();
    } catch (error) {
      console.error("Failed to sync:", error);
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  });
  reactExports.useEffect(() => {
    loadProjects();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, maxWidth: 800, mx: "auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "Offline Project Creation Test" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Network Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", mb: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: networkStatus ? "Online" : "Offline",
            color: networkStatus ? "success" : "error",
            sx: { mr: 2 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: networkStatus ? "You are online. Projects will be created in Firestore." : "You are offline. Projects will be created locally." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", gap: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            onClick: createTestProject,
            disabled: loading,
            children: "Create Test Project"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            onClick: forceSync,
            disabled: loading || !networkStatus,
            children: "Force Sync"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            onClick: loadProjects,
            disabled: loading,
            children: "Refresh"
          }
        )
      ] })
    ] }),
    testResult && /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 2, mb: 3, bgcolor: "info.light", color: "info.contrastText" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: testResult }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", gutterBottom: true, children: [
        "All Projects (",
        projects.length,
        ")"
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Loading..." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: projects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "No projects found" }) }) : projects.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: project.name,
              secondary: `ID: ${project.id} | Created: ${new Date(project.createdAt).toLocaleString()}`
            }
          ),
          project.id.startsWith("offline_") && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: "Offline",
              color: "warning",
              size: "small",
              sx: { mr: 1 }
            }
          ),
          project.pendingSync && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: "Pending Sync",
              color: "info",
              size: "small"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
      ] }, project.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", gutterBottom: true, children: [
        "Offline Projects (",
        offlineProjects.length,
        ")"
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Loading..." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: offlineProjects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: "No offline projects found" }) }) : offlineProjects.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: project.name,
              secondary: `ID: ${project.id} | Created: ${new Date(project.createdAt).toLocaleString()}`
            }
          ),
          project.pendingSync && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: "Pending Sync",
              color: "info",
              size: "small"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {})
      ] }, project.id)) })
    ] })
  ] });
};
export {
  OfflineTestPage as default
};
