var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
import { A as ALL_DASHBOARD_COLLECTIONS } from "./DashboardCloudProjectsBridge-P3PlxSZv.js";
import "./index-N0qG1a_W.js";
import "./mui-BbtiZaA3.js";
import "./vendor-Cu2L4Rr-.js";
import "./stripe-rmDQXWB-.js";
import "./index.esm-CjtNHFZy.js";
import "./index.esm-zVCMB3Cx.js";
import "./firebase-CfkDefN0.js";
import "./index.esm-D5-7iBdy.js";
import "./CloudProjectIntegration-DP_shNeV.js";
import "./UnifiedProjectCreationDialog-D-tTB0On.js";
import "./UnifiedDataService-BOoHv043.js";
import "./FirestoreCollectionManager-No2fuO8O.js";
const _DatasetCollectionValidator = class _DatasetCollectionValidator {
  // 5 minutes
  constructor() {
    __publicField(this, "dynamicDiscovery");
    __publicField(this, "cachedCollections", null);
    __publicField(this, "lastCacheUpdate", 0);
    __publicField(this, "CACHE_DURATION", 5 * 60 * 1e3);
    this.dynamicDiscovery = new DynamicCollectionDiscovery();
  }
  static getInstance() {
    if (!_DatasetCollectionValidator.instance) {
      _DatasetCollectionValidator.instance = new _DatasetCollectionValidator();
    }
    return _DatasetCollectionValidator.instance;
  }
  /**
   * Get all available collections (with caching)
   */
  getAllAvailableCollections() {
    return __async(this, null, function* () {
      const now = Date.now();
      if (this.cachedCollections && now - this.lastCacheUpdate < this.CACHE_DURATION) {
        return this.cachedCollections;
      }
      try {
        const discoveryResult = yield this.dynamicDiscovery.discoverCollections();
        if (discoveryResult.success && discoveryResult.collections.length > 0) {
          this.cachedCollections = discoveryResult.collections;
          this.lastCacheUpdate = now;
          console.log("🔍 [DatasetCollectionValidator] Using dynamic collections:", this.cachedCollections.length);
          return this.cachedCollections;
        }
      } catch (error) {
        console.warn("⚠️ [DatasetCollectionValidator] Dynamic discovery failed, using static collections:", error);
      }
      this.cachedCollections = ALL_DASHBOARD_COLLECTIONS;
      this.lastCacheUpdate = now;
      console.log("🔍 [DatasetCollectionValidator] Using static collections:", this.cachedCollections.length);
      return this.cachedCollections;
    });
  }
  /**
   * Validate dataset collection assignments
   */
  validateDatasetCollections(_0) {
    return __async(this, arguments, function* (datasetCollections, options = {}) {
      const allAvailableCollections = yield this.getAllAvailableCollections();
      const expectedCollections = allAvailableCollections;
      const missingCollections = expectedCollections.filter(
        (collection) => !datasetCollections.includes(collection)
      );
      const extraCollections = datasetCollections.filter(
        (collection) => !expectedCollections.includes(collection)
      );
      const isValid = missingCollections.length === 0 && extraCollections.length === 0;
      const recommendations = [];
      if (missingCollections.length > 0) {
        recommendations.push(`Add ${missingCollections.length} missing collections: ${missingCollections.slice(0, 5).join(", ")}${missingCollections.length > 5 ? "..." : ""}`);
      }
      if (extraCollections.length > 0) {
        recommendations.push(`Remove ${extraCollections.length} invalid collections: ${extraCollections.slice(0, 5).join(", ")}${extraCollections.length > 5 ? "..." : ""}`);
      }
      if (datasetCollections.length < expectedCollections.length * 0.8) {
        recommendations.push('Consider using "Select All" to ensure complete data access');
      }
      return {
        isValid,
        missingCollections,
        extraCollections,
        totalCollections: datasetCollections.length,
        expectedCollections: expectedCollections.length,
        recommendations
      };
    });
  }
  /**
   * Sync dataset collections to include all available collections
   */
  syncDatasetCollections(_0) {
    return __async(this, arguments, function* (currentCollections, options = {}) {
      const allAvailableCollections = yield this.getAllAvailableCollections();
      let syncedCollections = [...currentCollections];
      if (options.addMissingCollections !== false) {
        const missingCollections = allAvailableCollections.filter(
          (collection) => !currentCollections.includes(collection)
        );
        syncedCollections = [...syncedCollections, ...missingCollections];
        if (missingCollections.length > 0) {
          console.log("✅ [DatasetCollectionValidator] Added missing collections:", missingCollections.length);
        }
      }
      if (options.removeExtraCollections) {
        const validCollections = syncedCollections.filter(
          (collection) => allAvailableCollections.includes(collection)
        );
        const removedCount = syncedCollections.length - validCollections.length;
        syncedCollections = validCollections;
        if (removedCount > 0) {
          console.log("✅ [DatasetCollectionValidator] Removed invalid collections:", removedCount);
        }
      }
      return syncedCollections;
    });
  }
  /**
   * Get collection assignment recommendations for a dataset
   */
  getCollectionRecommendations(datasetType = "ALL_DATA") {
    return __async(this, null, function* () {
      const allAvailableCollections = yield this.getAllAvailableCollections();
      switch (datasetType) {
        case "ALL_DATA":
          return allAvailableCollections;
        case "CUSTOM":
          return allAvailableCollections.filter(
            (collection) => !["audit_logs", "roleSyncEvents", "datasetAssignments"].includes(collection)
          );
        case "SPECIFIC":
          return allAvailableCollections.filter(
            (collection) => ["users", "projects", "sessions", "inventoryItems", "organizations"].includes(collection)
          );
        default:
          return allAvailableCollections;
      }
    });
  }
  /**
   * Check if a dataset needs collection synchronization
   */
  needsSync(datasetCollections) {
    return __async(this, null, function* () {
      const validation = yield this.validateDatasetCollections(datasetCollections);
      return !validation.isValid;
    });
  }
  /**
   * Get collection statistics
   */
  getCollectionStats() {
    return __async(this, null, function* () {
      const allAvailableCollections = yield this.getAllAvailableCollections();
      return {
        totalAvailable: allAvailableCollections.length,
        totalAssigned: 0,
        // This would be passed from the dataset
        coveragePercentage: 0,
        // This would be calculated
        missingCount: 0,
        // This would be calculated
        extraCount: 0
        // This would be calculated
      };
    });
  }
  /**
   * Force refresh of collection cache
   */
  refreshCollectionCache() {
    return __async(this, null, function* () {
      this.cachedCollections = null;
      this.lastCacheUpdate = 0;
      yield this.getAllAvailableCollections();
      console.log("🔄 [DatasetCollectionValidator] Collection cache refreshed");
    });
  }
};
__publicField(_DatasetCollectionValidator, "instance");
let DatasetCollectionValidator = _DatasetCollectionValidator;
const datasetCollectionValidator = DatasetCollectionValidator.getInstance();
export {
  DatasetCollectionValidator,
  datasetCollectionValidator
};
