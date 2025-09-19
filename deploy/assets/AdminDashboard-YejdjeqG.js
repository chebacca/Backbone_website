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
import { j as jsxRuntimeExports, B as Box, aQ as DashboardIcon, T as Typography, r as Chip, G as Grid, t as Card, v as CardContent, a0 as PeopleIcon, bS as LicenseIcon, a4 as PaymentIcon, _ as WarningIcon, c as Paper, aG as Tabs, aH as Tab, e as TextField, I as InputAdornment, g as IconButton, bT as ClearIcon, b3 as SearchIcon, a as Button, M as MenuItem, ak as TableContainer, al as Table, am as TableHead, an as TableRow, ao as TableCell, ap as TableBody, bR as EditIcon, az as DeleteIcon, U as ExpandMoreIcon, bU as FolderIcon, bV as Collapse, at as Dialog, au as DialogTitle, av as DialogContent, a8 as FormControl, a9 as InputLabel, aa as Select, aw as DialogActions, bW as Popover, d as Alert, o as ErrorIcon, p as CheckCircleIcon } from "./mui-BbtiZaA3.js";
import { u as useNavigate, e as useLocation, r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { u as useSnackbar } from "./notistack.esm-DLh02w5s.js";
import { c as api, e as endpoints, u as useAuth } from "./index-CGUdwdHH.js";
import { query, collection, getDocs, where, orderBy, limit, getDoc, doc, Timestamp, updateDoc } from "./index.esm-CjtNHFZy.js";
import { i as isWebOnlyMode, d as db } from "./firebase-DS3VPk7E.js";
import { COLLECTIONS } from "./FirestoreCollectionManager-W6vYwJuE.js";
import "./stripe-rmDQXWB-.js";
import "./index.esm-zVCMB3Cx.js";
import "./index.esm-BMygn4u3.js";
class AdminDashboardService {
  /**
   * Check if we're in webonly mode
   */
  static isWebOnlyMode() {
    return isWebOnlyMode();
  }
  /**
   * Get admin dashboard statistics
   */
  static getDashboardStats() {
    return __async(this, null, function* () {
      const webOnlyMode = this.isWebOnlyMode();
      console.log(`🔍 [AdminDashboardService] Mode detection: webOnlyMode=${webOnlyMode}, hostname=${window.location.hostname}`);
      if (webOnlyMode) {
        console.log("📊 [AdminDashboardService] Using Firestore direct access (webonly mode)");
        return this.getDashboardStatsFromFirestore();
      } else {
        console.log("🌐 [AdminDashboardService] Using API endpoints (non-webonly mode)");
        return this.getDashboardStatsFromAPI();
      }
    });
  }
  /**
   * Get dashboard stats from Firestore (webonly mode)
   */
  static getDashboardStatsFromFirestore() {
    return __async(this, null, function* () {
      try {
        const usersQuery = query(collection(db, COLLECTIONS.USERS));
        const usersSnapshot = yield getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;
        const subscriptionsQuery = query(
          collection(db, COLLECTIONS.SUBSCRIPTIONS),
          where("status", "==", "ACTIVE")
        );
        const subscriptionsSnapshot = yield getDocs(subscriptionsQuery);
        const activeSubscriptions = subscriptionsSnapshot.size;
        let totalRevenue = 0;
        const recentPayments = [];
        try {
          const paymentsQuery = query(
            collection(db, COLLECTIONS.PAYMENTS),
            where("status", "==", "succeeded"),
            orderBy("createdAt", "desc"),
            limit(10)
          );
          const paymentsSnapshot = yield getDocs(paymentsQuery);
          paymentsSnapshot.forEach((doc2) => {
            const paymentData = doc2.data();
            const payment = __spreadValues({ id: doc2.id }, paymentData);
            recentPayments.push(payment);
            if (paymentData.amount && typeof paymentData.amount === "number") {
              totalRevenue += paymentData.amount;
            }
          });
        } catch (error) {
          console.warn("⚠️ [AdminDashboardService] Could not fetch from PAYMENTS collection:", error);
        }
        try {
          const invoicesQuery = query(
            collection(db, COLLECTIONS.INVOICES),
            orderBy("createdAt", "desc"),
            limit(10)
          );
          const invoicesSnapshot = yield getDocs(invoicesQuery);
          invoicesSnapshot.forEach((doc2) => {
            const invoice = __spreadValues({ id: doc2.id }, doc2.data());
            recentPayments.push(invoice);
          });
        } catch (error) {
          console.warn("⚠️ [AdminDashboardService] Could not fetch from INVOICES collection:", error);
        }
        totalRevenue = 0;
        try {
          const allPaymentsQuery = query(
            collection(db, COLLECTIONS.PAYMENTS),
            where("status", "==", "succeeded")
          );
          const allPaymentsSnapshot = yield getDocs(allPaymentsQuery);
          allPaymentsSnapshot.forEach((doc2) => {
            const payment = doc2.data();
            if (payment.amount && typeof payment.amount === "number") {
              totalRevenue += payment.amount;
            }
          });
          console.log(`💰 [AdminDashboardService] Revenue from ${allPaymentsSnapshot.size} payments: $${totalRevenue}`);
        } catch (error) {
          console.warn("⚠️ [AdminDashboardService] Could not fetch all payments:", error);
          try {
            const allInvoicesQuery = query(
              collection(db, COLLECTIONS.INVOICES),
              where("status", "==", "succeeded")
            );
            const allInvoicesSnapshot = yield getDocs(allInvoicesQuery);
            allInvoicesSnapshot.forEach((doc2) => {
              const invoice = doc2.data();
              if (invoice.amount && typeof invoice.amount === "number") {
                totalRevenue += invoice.amount;
              }
            });
            console.log(`💰 [AdminDashboardService] Fallback revenue from ${allInvoicesSnapshot.size} invoices: $${totalRevenue}`);
          } catch (invoiceError) {
            console.warn("⚠️ [AdminDashboardService] Could not fetch invoices either:", invoiceError);
          }
        }
        return {
          totalUsers,
          activeSubscriptions,
          totalRevenue,
          pendingApprovals: 0,
          // TODO: Implement if needed
          systemHealth: "healthy",
          recentPayments
        };
      } catch (error) {
        console.error("Error getting dashboard stats from Firestore:", error);
        return {
          totalUsers: 0,
          activeSubscriptions: 0,
          totalRevenue: 0,
          pendingApprovals: 0,
          systemHealth: "error"
        };
      }
    });
  }
  /**
   * Get dashboard stats from API (non-webonly mode)
   */
  static getDashboardStatsFromAPI() {
    return __async(this, null, function* () {
      var _a, _b;
      try {
        const response = yield api.get(endpoints.admin.dashboardStats());
        const stats = ((_b = (_a = response.data) == null ? void 0 : _a.data) == null ? void 0 : _b.stats) || {};
        console.log("🌐 [AdminDashboardService] Raw API response:", JSON.stringify(stats, null, 2));
        console.log(`💰 [AdminDashboardService] API totalRevenue: ${stats.totalRevenue} (type: ${typeof stats.totalRevenue})`);
        const result = {
          totalUsers: stats.totalUsers || 0,
          activeSubscriptions: stats.activeSubscriptions || 0,
          totalRevenue: stats.totalRevenue || 0,
          // Revenue is already in dollars
          pendingApprovals: stats.pendingApprovals || 0,
          systemHealth: stats.systemHealth || "healthy",
          recentPayments: stats.recentPayments || []
        };
        console.log("📊 [AdminDashboardService] Processed API result:", JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting dashboard stats from API:", error);
        throw error;
      }
    });
  }
  /**
   * Get all users for admin management
   */
  static getUsers(page = 1, limit2 = 100) {
    return __async(this, null, function* () {
      if (this.isWebOnlyMode()) {
        return this.getUsersFromFirestore(page, limit2);
      } else {
        return this.getUsersFromAPI(page, limit2);
      }
    });
  }
  /**
   * Get users from Firestore (webonly mode)
   */
  static getUsersFromFirestore(page, limit$1) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      try {
        let usersQuery = query(
          collection(db, COLLECTIONS.USERS),
          orderBy("createdAt", "desc"),
          limit(limit$1)
        );
        if (page > 1) {
        }
        const usersSnapshot = yield getDocs(usersQuery);
        const users = [];
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const subscriptionsQuery = query(
            collection(db, COLLECTIONS.SUBSCRIPTIONS),
            where("userId", "==", userDoc.id),
            where("status", "==", "ACTIVE")
          );
          const subscriptionsSnapshot = yield getDocs(subscriptionsQuery);
          const subscriptions = [];
          subscriptionsSnapshot.forEach((subDoc) => {
            subscriptions.push(__spreadValues({ id: subDoc.id }, subDoc.data()));
          });
          const user = {
            id: userDoc.id,
            email: userData.email || "",
            firstName: userData.firstName || ((_a = userData.name) == null ? void 0 : _a.split(" ")[0]) || "",
            lastName: userData.lastName || ((_b = userData.name) == null ? void 0 : _b.split(" ").slice(1).join(" ")) || "",
            name: userData.name || `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
            role: userData.role || "USER",
            status: userData.status || "active",
            subscription: (_c = subscriptions[0]) == null ? void 0 : _c.tier,
            lastLogin: userData.lastLoginAt || userData.updatedAt || userData.createdAt,
            createdAt: userData.createdAt,
            subscriptions
          };
          users.push(user);
        }
        return {
          users,
          pagination: {
            page,
            limit: limit$1,
            total: users.length,
            pages: 1
            // Simplified for now
          }
        };
      } catch (error) {
        console.error("Error getting users from Firestore:", error);
        return { users: [] };
      }
    });
  }
  /**
   * Get users from API (non-webonly mode)
   */
  static getUsersFromAPI(page, limit2) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      try {
        const response = yield api.get(`${endpoints.admin.users()}?page=${page}&limit=${limit2}`);
        const usersData = ((_b = (_a = response.data) == null ? void 0 : _a.data) == null ? void 0 : _b.users) || [];
        const pagination = (_d = (_c = response.data) == null ? void 0 : _c.data) == null ? void 0 : _d.pagination;
        const users = usersData.map((u) => {
          var _a2, _b2, _c2, _d2, _e;
          return {
            id: u.id,
            email: u.email,
            firstName: ((_a2 = u.name) == null ? void 0 : _a2.split(" ")[0]) || "",
            lastName: ((_b2 = u.name) == null ? void 0 : _b2.split(" ").slice(1).join(" ")) || "",
            name: u.name,
            role: u.role,
            status: ((_c2 = u.status) == null ? void 0 : _c2.toLowerCase()) || "active",
            subscription: (_e = (_d2 = u.subscriptions) == null ? void 0 : _d2[0]) == null ? void 0 : _e.tier,
            lastLogin: u.lastLoginAt || (/* @__PURE__ */ new Date()).toISOString(),
            createdAt: u.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
            subscriptions: u.subscriptions || []
          };
        });
        return { users, pagination };
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting users from API:", error);
        throw error;
      }
    });
  }
  /**
   * Get user details including subscriptions and licenses
   */
  static getUserDetails(userId) {
    return __async(this, null, function* () {
      if (this.isWebOnlyMode()) {
        return this.getUserDetailsFromFirestore(userId);
      } else {
        return this.getUserDetailsFromAPI(userId);
      }
    });
  }
  /**
   * Get user details from Firestore (webonly mode)
   */
  static getUserDetailsFromFirestore(userId) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      try {
        console.log("🔍 [AdminDashboardService] Getting user details from Firestore:", userId);
        const userDoc = yield getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (!userDoc.exists()) {
          throw new Error("User not found");
        }
        const userData = userDoc.data();
        const subscriptionsQuery = query(
          collection(db, COLLECTIONS.SUBSCRIPTIONS),
          where("userId", "==", userId)
        );
        const subscriptionsSnapshot = yield getDocs(subscriptionsQuery);
        const subscriptions = [];
        subscriptionsSnapshot.forEach((subDoc) => {
          subscriptions.push(__spreadValues({ id: subDoc.id }, subDoc.data()));
        });
        const licensesQuery = query(
          collection(db, COLLECTIONS.LICENSES),
          where("userId", "==", userId)
        );
        const licensesSnapshot = yield getDocs(licensesQuery);
        const licenses = [];
        licensesSnapshot.forEach((licenseDoc) => {
          const licenseData = licenseDoc.data();
          licenses.push({
            id: licenseDoc.id,
            key: licenseData.key || "",
            userId: licenseData.userId || userId,
            userEmail: userData.email || "",
            tier: licenseData.tier || "BASIC",
            status: licenseData.status || "active",
            activatedAt: licenseData.activatedAt || licenseData.createdAt,
            expiresAt: licenseData.expiresAt || licenseData.createdAt,
            lastUsed: licenseData.updatedAt || licenseData.createdAt
          });
        });
        const user = {
          id: userDoc.id,
          email: userData.email || "",
          firstName: userData.firstName || ((_a = userData.name) == null ? void 0 : _a.split(" ")[0]) || "",
          lastName: userData.lastName || ((_b = userData.name) == null ? void 0 : _b.split(" ").slice(1).join(" ")) || "",
          name: userData.name || `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
          role: userData.role || "USER",
          status: userData.status || "active",
          subscription: (_c = subscriptions[0]) == null ? void 0 : _c.tier,
          lastLogin: userData.lastLoginAt || userData.updatedAt || userData.createdAt,
          createdAt: userData.createdAt,
          subscriptions
        };
        console.log("✅ [AdminDashboardService] User details retrieved from Firestore");
        return { user, subscriptions, licenses };
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting user details from Firestore:", error);
        throw error;
      }
    });
  }
  /**
   * Get user details from API (non-webonly mode)
   */
  static getUserDetailsFromAPI(userId) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const response = yield api.get(endpoints.admin.userDetails(userId));
        const data = ((_a = response.data) == null ? void 0 : _a.data) || {};
        const userData = data.user || {};
        const subscriptions = ((_b = data.user) == null ? void 0 : _b.subscriptions) || [];
        const licenses = (((_c = data.user) == null ? void 0 : _c.licenses) || []).map((l) => ({
          id: l.id,
          key: l.key,
          userId: l.userId || userId,
          userEmail: userData.email,
          tier: l.tier,
          status: l.status,
          activatedAt: l.activatedAt || l.createdAt,
          expiresAt: l.expiresAt || l.createdAt,
          lastUsed: l.updatedAt || l.createdAt
        }));
        const user = {
          id: userData.id || userId,
          email: userData.email || "",
          firstName: userData.firstName || ((_d = userData.name) == null ? void 0 : _d.split(" ")[0]) || "",
          lastName: userData.lastName || ((_e = userData.name) == null ? void 0 : _e.split(" ").slice(1).join(" ")) || "",
          name: userData.name,
          role: userData.role || "USER",
          status: ((_f = userData.status) == null ? void 0 : _f.toLowerCase()) || "active",
          subscription: (_g = subscriptions[0]) == null ? void 0 : _g.tier,
          lastLogin: userData.lastLoginAt || (/* @__PURE__ */ new Date()).toISOString(),
          createdAt: userData.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          subscriptions
        };
        return { user, subscriptions, licenses };
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting user details from API:", error);
        throw error;
      }
    });
  }
  /**
   * Update user information
   */
  static updateUser(userId, updates) {
    return __async(this, null, function* () {
      if (this.isWebOnlyMode()) {
        return this.updateUserInFirestore(userId, updates);
      } else {
        return this.updateUserViaAPI(userId, updates);
      }
    });
  }
  /**
   * Update user in Firestore (webonly mode)
   */
  static updateUserInFirestore(userId, updates) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [AdminDashboardService] Updating user in Firestore:", userId, updates);
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const updateData = {
          updatedAt: Timestamp.now()
        };
        if (updates.role) {
          updateData.role = updates.role;
        }
        if (updates.status) {
          updateData.status = updates.status.toLowerCase();
        }
        yield updateDoc(userRef, updateData);
        console.log("✅ [AdminDashboardService] User updated in Firestore");
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error updating user in Firestore:", error);
        throw error;
      }
    });
  }
  /**
   * Update user via API (non-webonly mode)
   */
  static updateUserViaAPI(userId, updates) {
    return __async(this, null, function* () {
      var _a;
      try {
        yield api.put(endpoints.admin.updateUser(userId), {
          role: updates.role,
          status: (_a = updates.status) == null ? void 0 : _a.toUpperCase()
        });
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error updating user via API:", error);
        throw error;
      }
    });
  }
  /**
   * Get payments for admin review
   */
  static getPayments(page = 1, limit2 = 100, filters) {
    return __async(this, null, function* () {
      if (this.isWebOnlyMode()) {
        return this.getPaymentsFromFirestore(page, limit2, filters);
      } else {
        return this.getPaymentsFromAPI(page, limit2, filters);
      }
    });
  }
  /**
   * Get payments from Firestore (webonly mode)
   */
  static getPaymentsFromFirestore(page, limit$1, filters) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [AdminDashboardService] Getting payments from Firestore...");
        const allPayments = [];
        try {
          let paymentsQuery = query(
            collection(db, COLLECTIONS.PAYMENTS),
            orderBy("createdAt", "desc"),
            limit(limit$1)
          );
          if (filters == null ? void 0 : filters.status) {
            paymentsQuery = query(paymentsQuery, where("status", "==", filters.status));
          }
          const paymentsSnapshot = yield getDocs(paymentsQuery);
          for (const paymentDoc of paymentsSnapshot.docs) {
            const paymentData = paymentDoc.data();
            let user = {};
            if (paymentData.userId) {
              try {
                const userDoc = yield getDoc(doc(db, COLLECTIONS.USERS, paymentData.userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  user = {
                    email: userData.email,
                    name: userData.name || `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
                  };
                }
              } catch (error) {
                console.warn("Could not fetch user data for payment:", paymentDoc.id);
              }
            }
            const payment = {
              id: paymentDoc.id,
              amount: paymentData.amount || 0,
              status: paymentData.status || "unknown",
              createdAt: paymentData.createdAt,
              user,
              subscription: paymentData.subscription || {}
            };
            allPayments.push(payment);
          }
          console.log("✅ [AdminDashboardService] Payments retrieved from PAYMENTS collection:", paymentsSnapshot.size);
        } catch (error) {
          console.warn("⚠️ [AdminDashboardService] Could not fetch from PAYMENTS collection:", error);
        }
        console.log("ℹ️ [AdminDashboardService] Skipping INVOICES collection - using PAYMENTS only for accurate data");
        allPayments.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        const startIndex = (page - 1) * limit$1;
        const endIndex = startIndex + limit$1;
        const paginatedPayments = allPayments.slice(startIndex, endIndex);
        console.log("✅ [AdminDashboardService] Total payments/invoices retrieved:", allPayments.length);
        return {
          payments: paginatedPayments,
          pagination: {
            page,
            limit: limit$1,
            total: allPayments.length,
            pages: Math.ceil(allPayments.length / limit$1)
          }
        };
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting payments from Firestore:", error);
        return { payments: [] };
      }
    });
  }
  /**
   * Get payments from API (non-webonly mode)
   */
  static getPaymentsFromAPI(page, limit2, filters) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit2));
        if (filters == null ? void 0 : filters.status) params.set("status", filters.status);
        if (filters == null ? void 0 : filters.email) params.set("email", filters.email);
        if (filters == null ? void 0 : filters.from) params.set("from", filters.from);
        if (filters == null ? void 0 : filters.to) params.set("to", filters.to);
        const response = yield api.get(`${endpoints.admin.payments()}?${params.toString()}`);
        const paymentsData = ((_b = (_a = response.data) == null ? void 0 : _a.data) == null ? void 0 : _b.payments) || [];
        const pagination = (_d = (_c = response.data) == null ? void 0 : _c.data) == null ? void 0 : _d.pagination;
        const payments = paymentsData.map((p) => ({
          id: p.id,
          amount: p.amount || 0,
          status: p.status || "unknown",
          createdAt: p.createdAt,
          user: p.user || {},
          subscription: p.subscription || {}
        }));
        return { payments, pagination };
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting payments from API:", error);
        throw error;
      }
    });
  }
  /**
   * Get system health status
   */
  static getSystemHealth() {
    return __async(this, null, function* () {
      if (this.isWebOnlyMode()) {
        return this.getSystemHealthFromFirestore();
      } else {
        return this.getSystemHealthFromAPI();
      }
    });
  }
  /**
   * Get system health from Firestore (webonly mode)
   */
  static getSystemHealthFromFirestore() {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [AdminDashboardService] Checking system health from Firestore...");
        const startTime = Date.now();
        const testQuery = query(collection(db, COLLECTIONS.USERS), limit(1));
        yield getDocs(testQuery);
        const dbResponseTime = Date.now() - startTime;
        const health = {
          overall: "healthy",
          checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
          database: {
            status: dbResponseTime < 1e3 ? "healthy" : dbResponseTime < 3e3 ? "degraded" : "unhealthy",
            responseTimeMs: dbResponseTime,
            message: `Database responding in ${dbResponseTime}ms`
          },
          email: {
            status: "healthy",
            // Assume healthy in webonly mode
            message: "Email service status unknown in webonly mode"
          },
          payment: {
            status: "healthy",
            // Assume healthy in webonly mode
            message: "Payment service status unknown in webonly mode"
          }
        };
        const statuses = [health.database.status, health.email.status, health.payment.status];
        if (statuses.includes("unhealthy")) {
          health.overall = "unhealthy";
        } else if (statuses.includes("degraded")) {
          health.overall = "degraded";
        }
        console.log("✅ [AdminDashboardService] System health checked from Firestore");
        return health;
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error checking system health from Firestore:", error);
        return {
          overall: "unhealthy",
          checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
          database: {
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error"
          },
          email: {
            status: "disabled",
            message: "Cannot check email service in webonly mode"
          },
          payment: {
            status: "disabled",
            message: "Cannot check payment service in webonly mode"
          }
        };
      }
    });
  }
  /**
   * Get system health from API (non-webonly mode)
   */
  static getSystemHealthFromAPI() {
    return __async(this, null, function* () {
      var _a, _b, _c;
      try {
        const response = yield api.get(endpoints.admin.systemHealth());
        const healthData = ((_b = (_a = response.data) == null ? void 0 : _a.data) == null ? void 0 : _b.health) || ((_c = response.data) == null ? void 0 : _c.data);
        return {
          overall: (healthData == null ? void 0 : healthData.overall) || (healthData == null ? void 0 : healthData.status) || "healthy",
          checkedAt: (healthData == null ? void 0 : healthData.checkedAt) || (/* @__PURE__ */ new Date()).toISOString(),
          database: (healthData == null ? void 0 : healthData.database) || { status: "healthy" },
          email: (healthData == null ? void 0 : healthData.email) || { status: "healthy" },
          payment: (healthData == null ? void 0 : healthData.payment) || { status: "healthy" }
        };
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting system health from API:", error);
        throw error;
      }
    });
  }
  /**
   * Get payment details
   */
  static getPaymentDetails(paymentId) {
    return __async(this, null, function* () {
      if (this.isWebOnlyMode()) {
        return this.getPaymentDetailsFromFirestore(paymentId);
      } else {
        return this.getPaymentDetailsFromAPI(paymentId);
      }
    });
  }
  /**
   * Get payment details from Firestore (webonly mode)
   */
  static getPaymentDetailsFromFirestore(paymentId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [AdminDashboardService] Getting payment details from Firestore:", paymentId);
        const paymentDoc = yield getDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId));
        if (!paymentDoc.exists()) {
          throw new Error("Payment not found");
        }
        const paymentData = paymentDoc.data();
        let user = {};
        if (paymentData.userId) {
          const userDoc = yield getDoc(doc(db, COLLECTIONS.USERS, paymentData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            user = {
              email: userData.email,
              name: userData.name || `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
            };
          }
        }
        const payment = {
          id: paymentDoc.id,
          amount: paymentData.amount || 0,
          status: paymentData.status || "unknown",
          createdAt: paymentData.createdAt,
          user,
          subscription: paymentData.subscription || {}
        };
        const licenses = [];
        if (paymentData.userId) {
          const licensesQuery = query(
            collection(db, COLLECTIONS.LICENSES),
            where("userId", "==", paymentData.userId)
          );
          const licensesSnapshot = yield getDocs(licensesQuery);
          licensesSnapshot.forEach((licenseDoc) => {
            const licenseData = licenseDoc.data();
            licenses.push({
              id: licenseDoc.id,
              key: licenseData.key || "",
              userId: licenseData.userId || paymentData.userId,
              userEmail: user.email || "",
              tier: licenseData.tier || "BASIC",
              status: licenseData.status || "active",
              activatedAt: licenseData.activatedAt || licenseData.createdAt,
              expiresAt: licenseData.expiresAt || licenseData.createdAt,
              lastUsed: licenseData.updatedAt || licenseData.createdAt
            });
          });
        }
        console.log("✅ [AdminDashboardService] Payment details retrieved from Firestore");
        return { payment, licenses };
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting payment details from Firestore:", error);
        throw error;
      }
    });
  }
  /**
   * Get payment details from API (non-webonly mode)
   */
  static getPaymentDetailsFromAPI(paymentId) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const response = yield api.get(endpoints.admin.paymentDetails(paymentId));
        const data = ((_a = response.data) == null ? void 0 : _a.data) || {};
        const payment = {
          id: ((_b = data.payment) == null ? void 0 : _b.id) || paymentId,
          amount: ((_c = data.payment) == null ? void 0 : _c.amount) || 0,
          status: ((_d = data.payment) == null ? void 0 : _d.status) || "unknown",
          createdAt: (_e = data.payment) == null ? void 0 : _e.createdAt,
          user: ((_f = data.payment) == null ? void 0 : _f.user) || {},
          subscription: ((_g = data.payment) == null ? void 0 : _g.subscription) || {}
        };
        const licenses = (data.licenses || []).map((l) => {
          var _a2;
          return {
            id: l.id,
            key: l.key,
            userId: l.userId,
            userEmail: l.userEmail || ((_a2 = payment.user) == null ? void 0 : _a2.email) || "",
            tier: l.tier,
            status: l.status,
            activatedAt: l.activatedAt || l.createdAt,
            expiresAt: l.expiresAt || l.createdAt,
            lastUsed: l.updatedAt || l.createdAt
          };
        });
        return { payment, licenses };
      } catch (error) {
        console.error("❌ [AdminDashboardService] Error getting payment details from API:", error);
        throw error;
      }
    });
  }
}
const SubsystemCard = ({ title, data }) => {
  const color = (data == null ? void 0 : data.status) === "healthy" ? "success" : (data == null ? void 0 : data.status) === "degraded" ? "warning" : (data == null ? void 0 : data.status) === "unhealthy" ? "error" : "default";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: ((data == null ? void 0 : data.status) || "unknown").toUpperCase(), color })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
        "Response time: ",
        (data == null ? void 0 : data.responseTimeMs) != null ? `${data.responseTimeMs} ms` : "—"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: (data == null ? void 0 : data.message) || "" }) }),
      (data == null ? void 0 : data.error) && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "warning", children: data.error }) })
    ] })
  ] }) });
};
const AdminDashboard = () => {
  var _a, _b;
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = reactExports.useState(0);
  const [stats, setStats] = reactExports.useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    systemHealth: "healthy"
  });
  const [users, setUsers] = reactExports.useState([]);
  const [usersFilters, setUsersFilters] = reactExports.useState({});
  const [recentPayments, setRecentPayments] = reactExports.useState([]);
  const [payments, setPayments] = reactExports.useState([]);
  const [paymentsPage, setPaymentsPage] = reactExports.useState(1);
  const [paymentsTotalPages, setPaymentsTotalPages] = reactExports.useState(1);
  const [paymentsFilters, setPaymentsFilters] = reactExports.useState({});
  const [expandedFolders, setExpandedFolders] = reactExports.useState(/* @__PURE__ */ new Set());
  const [detailsOpen, setDetailsOpen] = reactExports.useState(false);
  const [detailsData, setDetailsData] = reactExports.useState({});
  const [selectedUser, setSelectedUser] = reactExports.useState(null);
  const [userDialogOpen, setUserDialogOpen] = reactExports.useState(false);
  const [userSeatDialogOpen, setUserSeatDialogOpen] = reactExports.useState(false);
  const [userSeatSubscription, setUserSeatSubscription] = reactExports.useState(null);
  const [userSeatInput, setUserSeatInput] = reactExports.useState(0);
  const [addDialogOpen, setAddDialogOpen] = reactExports.useState(false);
  const [addForm, setAddForm] = reactExports.useState({ userId: "", subscriptionId: "", tier: "PRO", seats: 1 });
  const [userSubscriptions, setUserSubscriptions] = reactExports.useState([]);
  const [systemHealth, setSystemHealth] = reactExports.useState(null);
  const [healthLoading, setHealthLoading] = reactExports.useState(false);
  const [usersSearch, setUsersSearch] = reactExports.useState("");
  const [paymentsSearch, setPaymentsSearch] = reactExports.useState("");
  const [licensesSearch, setLicensesSearch] = reactExports.useState("");
  const [licensesFilters, setLicensesFilters] = reactExports.useState({});
  const [licensesAnchorEl, setLicensesAnchorEl] = reactExports.useState(null);
  const [licensesPopoverUser, setLicensesPopoverUser] = reactExports.useState(null);
  const [userLicenses, setUserLicenses] = reactExports.useState([]);
  const [userLicensesLoading, setUserLicensesLoading] = reactExports.useState(false);
  const filteredUsers = reactExports.useMemo(() => {
    const searchTerm = usersSearch.trim().toLowerCase();
    return users.filter((user2) => {
      if (!searchTerm) return true;
      return user2.firstName.toLowerCase().includes(searchTerm) || user2.lastName.toLowerCase().includes(searchTerm) || user2.email.toLowerCase().includes(searchTerm) || user2.role.toLowerCase().includes(searchTerm) || user2.status.toLowerCase().includes(searchTerm) || user2.subscription && user2.subscription.toLowerCase().includes(searchTerm);
    }).filter((user2) => usersFilters.role ? user2.role === usersFilters.role : true).filter((user2) => usersFilters.status ? user2.status === usersFilters.status.toLowerCase() : true).filter((user2) => usersFilters.tier ? (user2.subscription || "").toUpperCase() === usersFilters.tier : true);
  }, [users, usersSearch, usersFilters]);
  const filteredLicenses = reactExports.useMemo(() => {
    const searchTerm = licensesSearch.trim().toLowerCase();
    return users.filter((user2) => user2.subscription).filter((user2) => {
      if (!searchTerm) return true;
      return user2.firstName.toLowerCase().includes(searchTerm) || user2.lastName.toLowerCase().includes(searchTerm) || user2.email.toLowerCase().includes(searchTerm) || user2.subscription && user2.subscription.toLowerCase().includes(searchTerm);
    }).filter((user2) => licensesFilters.tier ? (user2.subscription || "").toUpperCase() === licensesFilters.tier : true).filter((user2) => licensesFilters.status ? user2.status === licensesFilters.status : true);
  }, [users, licensesSearch, licensesFilters]);
  const parseDate = (value) => {
    if (!value) return /* @__PURE__ */ new Date(NaN);
    if (typeof value === "string") return new Date(value);
    if (value instanceof Date) return value;
    if (typeof value === "object" && value !== null) {
      if (typeof value._seconds === "number") {
        return new Date(value._seconds * 1e3);
      }
      if (typeof value.seconds === "number") {
        return new Date(value.seconds * 1e3);
      }
      if (typeof value.toDate === "function") {
        try {
          return value.toDate();
        } catch (e) {
        }
      }
    }
    return new Date(value);
  };
  const formatCurrency = (amount) => {
    const dollars = typeof amount === "number" ? amount : 0;
    return `$${dollars.toFixed(2)}`;
  };
  const filteredPayments = reactExports.useMemo(() => {
    if (!paymentsSearch.trim()) return payments;
    const searchTerm = paymentsSearch.toLowerCase();
    return payments.filter(
      (payment) => {
        var _a2, _b2;
        return payment.id.toLowerCase().includes(searchTerm) || ((_a2 = payment.user) == null ? void 0 : _a2.email) && payment.user.email.toLowerCase().includes(searchTerm) || ((_b2 = payment.subscription) == null ? void 0 : _b2.tier) && payment.subscription.tier.toLowerCase().includes(searchTerm) || payment.status.toLowerCase().includes(searchTerm) || parseDate(payment.createdAt).toLocaleDateString().toLowerCase().includes(searchTerm) || formatCurrency(payment.amount).toLowerCase().includes(searchTerm);
      }
    );
  }, [payments, paymentsSearch]);
  const groupedPayments = reactExports.useMemo(() => {
    if (!filteredPayments || filteredPayments.length === 0) return {};
    const groups = {};
    filteredPayments.forEach((payment) => {
      var _a2;
      const userEmail = ((_a2 = payment.user) == null ? void 0 : _a2.email) || "Unknown User";
      if (!groups[userEmail]) {
        groups[userEmail] = [];
      }
      groups[userEmail].push(payment);
    });
    Object.keys(groups).forEach((userEmail) => {
      groups[userEmail].sort((a, b) => {
        var _a2, _b2;
        const dateA = new Date(((_a2 = a.createdAt) == null ? void 0 : _a2.seconds) * 1e3 || 0);
        const dateB = new Date(((_b2 = b.createdAt) == null ? void 0 : _b2.seconds) * 1e3 || 0);
        return dateB.getTime() - dateA.getTime();
      });
    });
    return groups;
  }, [filteredPayments]);
  const groupedPaymentsForDisplay = reactExports.useMemo(() => {
    if (!filteredPayments || filteredPayments.length === 0) return [];
    const groups = [];
    Object.entries(groupedPayments).forEach(([userEmail, userPayments]) => {
      var _a2, _b2;
      const totalAmount = userPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const userName = ((_b2 = (_a2 = userPayments[0]) == null ? void 0 : _a2.user) == null ? void 0 : _b2.name) || userEmail;
      groups.push({
        userEmail,
        userName,
        payments: userPayments,
        totalAmount,
        paymentCount: userPayments.length
      });
    });
    groups.sort((a, b) => b.totalAmount - a.totalAmount);
    return groups;
  }, [groupedPayments, filteredPayments]);
  const clearUsersSearch = () => setUsersSearch("");
  const clearPaymentsSearch = () => setPaymentsSearch("");
  const clearLicensesSearch = () => setLicensesSearch("");
  const toggleFolder = (userEmail) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userEmail)) {
        newSet.delete(userEmail);
      } else {
        newSet.add(userEmail);
      }
      return newSet;
    });
  };
  const expandAllFolders = () => {
    const allEmails = groupedPaymentsForDisplay.map((group) => group.userEmail);
    setExpandedFolders(new Set(allEmails));
  };
  const collapseAllFolders = () => {
    setExpandedFolders(/* @__PURE__ */ new Set());
  };
  const openUserLicensesPopover = (event, userRow) => __async(void 0, null, function* () {
    event.stopPropagation();
    event.preventDefault();
    setLicensesAnchorEl(event.currentTarget);
    setLicensesPopoverUser(userRow);
    setUserLicenses([]);
    setUserLicensesLoading(true);
    try {
      const result = yield AdminDashboardService.getUserDetails(userRow.id);
      const allLicenses = result.licenses.map((l) => ({
        id: l.id,
        key: l.key,
        userId: l.userId,
        userEmail: l.userEmail,
        tier: l.tier,
        status: l.status === "inactive" ? "suspended" : l.status,
        activatedAt: new Date(parseDate(l.activatedAt)).toISOString(),
        expiresAt: new Date(parseDate(l.expiresAt)).toISOString(),
        lastUsed: new Date(parseDate(l.lastUsed)).toISOString()
      }));
      const sorted = allLicenses.sort((a, b) => {
        const aActive = a.status === "active" ? 0 : 1;
        const bActive = b.status === "active" ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        return new Date(b.activatedAt).getTime() - new Date(a.activatedAt).getTime();
      });
      setUserLicenses(sorted);
    } catch (e) {
      console.error("Error loading user licenses:", e);
      enqueueSnackbar((e == null ? void 0 : e.message) || "Failed to load licenses", { variant: "error" });
      setUserLicenses([]);
    } finally {
      setUserLicensesLoading(false);
    }
  });
  const closeUserLicensesPopover = () => {
    setLicensesAnchorEl(null);
    setLicensesPopoverUser(null);
    setUserLicenses([]);
  };
  reactExports.useEffect(() => {
    let isMounted = true;
    (() => __async(void 0, null, function* () {
      try {
        const roleUpper = String((user == null ? void 0 : user.role) || "").toUpperCase();
        if (roleUpper !== "SUPERADMIN") {
          setUsers([]);
          setStats((s) => __spreadProps(__spreadValues({}, s), { systemHealth: "warning" }));
          return;
        }
        const [usersResult, statsResult, healthResult] = yield Promise.all([
          AdminDashboardService.getUsers(1, 100),
          AdminDashboardService.getDashboardStats(),
          AdminDashboardService.getSystemHealth()
        ]);
        if (!isMounted) return;
        setUsers(usersResult.users.map((u) => {
          var _a2, _b2;
          return {
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            status: ((_b2 = (_a2 = u.status) == null ? void 0 : _a2.toLowerCase) == null ? void 0 : _b2.call(_a2)) || "active",
            subscription: u.subscription,
            lastLogin: u.lastLogin,
            createdAt: u.createdAt
          };
        }));
        setStats({
          totalUsers: statsResult.totalUsers,
          activeSubscriptions: statsResult.activeSubscriptions,
          totalRevenue: statsResult.totalRevenue,
          // Already converted to dollars in service
          pendingApprovals: statsResult.pendingApprovals,
          systemHealth: statsResult.systemHealth === "healthy" ? "healthy" : statsResult.systemHealth === "warning" ? "warning" : "error"
        });
        setSystemHealth({
          overall: healthResult.overall,
          checkedAt: healthResult.checkedAt,
          database: healthResult.database,
          email: healthResult.email,
          payment: healthResult.payment
        });
        setRecentPayments(statsResult.recentPayments || []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Admin Dashboard data loading error:", error);
        setUsers([]);
        setStats((s) => __spreadProps(__spreadValues({}, s), { systemHealth: "error" }));
        setRecentPayments([]);
        setSystemHealth(null);
      }
    }))();
    return () => {
      isMounted = false;
    };
  }, [user == null ? void 0 : user.role]);
  const refreshHealth = () => __async(void 0, null, function* () {
    try {
      setHealthLoading(true);
      const healthResult = yield AdminDashboardService.getSystemHealth();
      setSystemHealth({
        overall: healthResult.overall,
        checkedAt: healthResult.checkedAt,
        database: healthResult.database,
        email: healthResult.email,
        payment: healthResult.payment
      });
      setStats((s) => __spreadProps(__spreadValues({}, s), {
        systemHealth: healthResult.overall === "healthy" ? "healthy" : healthResult.overall === "degraded" ? "warning" : "error"
      }));
    } catch (error) {
      console.error("Error refreshing health:", error);
      setSystemHealth(null);
      setStats((s) => __spreadProps(__spreadValues({}, s), { systemHealth: "error" }));
    } finally {
      setHealthLoading(false);
    }
  });
  const fetchPayments = (page = 1) => __async(void 0, null, function* () {
    var _a2, _b2;
    try {
      const filters = {};
      if (paymentsFilters.status) filters.status = paymentsFilters.status;
      if (paymentsFilters.email) filters.email = paymentsFilters.email;
      if (paymentsFilters.from) filters.from = paymentsFilters.from;
      if (paymentsFilters.to) filters.to = paymentsFilters.to;
      const result = yield AdminDashboardService.getPayments(page, 100, filters);
      setPayments(result.payments);
      setPaymentsPage(((_a2 = result.pagination) == null ? void 0 : _a2.page) || page);
      setPaymentsTotalPages(((_b2 = result.pagination) == null ? void 0 : _b2.pages) || 1);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    }
  });
  reactExports.useEffect(() => {
    const roleUpper = String((user == null ? void 0 : user.role) || "").toUpperCase();
    const isSuperAdmin = roleUpper === "SUPERADMIN";
    if (!isSuperAdmin) return;
    if (activeTab !== 1) return;
    fetchPayments(paymentsPage).catch(() => {
    });
  }, [activeTab, paymentsPage, paymentsFilters, user == null ? void 0 : user.role]);
  const openPaymentDetails = (paymentId) => __async(void 0, null, function* () {
    try {
      const result = yield AdminDashboardService.getPaymentDetails(paymentId);
      setDetailsData({ payment: result.payment, licenses: result.licenses });
      setDetailsOpen(true);
    } catch (e) {
      console.error("Error loading payment details:", e);
      enqueueSnackbar("Failed to load payment details", { variant: "error" });
    }
  });
  const handleUserEdit = (user2) => {
    setSelectedUser(user2);
    setUserDialogOpen(true);
  };
  const handleUserSave = () => __async(void 0, null, function* () {
    try {
      if (!selectedUser) return;
      yield AdminDashboardService.updateUser(selectedUser.id, {
        role: selectedUser.role,
        status: selectedUser.status
      });
      enqueueSnackbar("User updated successfully", { variant: "success" });
      setUserDialogOpen(false);
      setSelectedUser(null);
      const usersResult = yield AdminDashboardService.getUsers(1, 100);
      setUsers(usersResult.users.map((u) => {
        var _a2, _b2;
        return {
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          status: ((_b2 = (_a2 = u.status) == null ? void 0 : _a2.toLowerCase) == null ? void 0 : _b2.call(_a2)) || "active",
          subscription: u.subscription,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt
        };
      }));
    } catch (e) {
      console.error("Error updating user:", e);
      enqueueSnackbar((e == null ? void 0 : e.message) || "Failed to update user", { variant: "error" });
    }
  });
  const openUserSeatDialog = (user2) => __async(void 0, null, function* () {
    try {
      const result = yield AdminDashboardService.getUserDetails(user2.id);
      const subs = result.subscriptions || [];
      const active = subs.find((s) => s.status === "ACTIVE" && (String(s.tier).toUpperCase() === "PRO" || String(s.tier).toUpperCase() === "ENTERPRISE"));
      if (!active) {
        enqueueSnackbar("No active PRO/ENTERPRISE subscription for this user", { variant: "warning" });
        return;
      }
      setUserSeatSubscription({ id: active.id, tier: String(active.tier).toUpperCase(), seats: Number(active.seats || 0) });
      setUserSeatInput(Number(active.seats || 0));
      setUserSeatDialogOpen(true);
    } catch (e) {
      console.error("Error loading subscription:", e);
      enqueueSnackbar((e == null ? void 0 : e.message) || "Failed to load subscription", { variant: "error" });
    }
  });
  const saveUserSeatDialog = () => __async(void 0, null, function* () {
    var _a2, _b2;
    if (!userSeatSubscription) return;
    try {
      const tier = userSeatSubscription.tier;
      const requested = Number(userSeatInput || 0);
      if (tier === "BASIC" && requested !== 1) {
        enqueueSnackbar("Basic plan supports exactly 1 seat.", { variant: "warning" });
        return;
      }
      if (tier === "PRO" && (requested < 1 || requested > 50)) {
        enqueueSnackbar("Pro plan seats must be between 1 and 50.", { variant: "warning" });
        return;
      }
      if (tier === "ENTERPRISE" && requested < 10) {
        enqueueSnackbar("Enterprise requires minimum 10 seats.", { variant: "warning" });
        return;
      }
      yield api.put(endpoints.subscriptions.update(userSeatSubscription.id), { seats: requested });
      setUserSeatSubscription(__spreadProps(__spreadValues({}, userSeatSubscription), { seats: requested }));
      enqueueSnackbar("Seats updated successfully", { variant: "success" });
      setUserSeatDialogOpen(false);
    } catch (e) {
      enqueueSnackbar(((_b2 = (_a2 = e == null ? void 0 : e.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || (e == null ? void 0 : e.message) || "Failed to update seats", { variant: "error" });
    }
  });
  const openAddDialog = () => __async(void 0, null, function* () {
    setAddDialogOpen(true);
  });
  const onUserSelect = (uid) => __async(void 0, null, function* () {
    setAddForm((prev) => __spreadProps(__spreadValues({}, prev), { userId: uid, subscriptionId: "" }));
    if (uid) {
      try {
        const result = yield AdminDashboardService.getUserDetails(uid);
        const subs = result.subscriptions || [];
        setUserSubscriptions(subs.filter((s) => s.status === "ACTIVE"));
      } catch (error) {
        console.error("Error loading user subscriptions:", error);
        setUserSubscriptions([]);
      }
    } else {
      setUserSubscriptions([]);
    }
  });
  const submitAdd = () => __async(void 0, null, function* () {
    try {
      yield api.post(endpoints.admin.createLicense(), addForm);
      enqueueSnackbar("License(s) created", { variant: "success" });
      setAddDialogOpen(false);
    } catch (e) {
      enqueueSnackbar((e == null ? void 0 : e.message) || "Failed to create license", { variant: "error" });
    }
  });
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };
  const getRoleColor = (role) => {
    switch (String(role || "").toUpperCase()) {
      case "SUPERADMIN":
        return "secondary";
      case "ADMIN":
        return "primary";
      default:
        return "default";
    }
  };
  const getTierColor = (tier) => {
    switch (String(tier || "").toUpperCase()) {
      case "ENTERPRISE":
        return "secondary";
      case "PRO":
        return "success";
      case "BASIC":
        return "default";
      default:
        return "default";
    }
  };
  const getTierVariant = (tier) => {
    return String(tier || "").toUpperCase() === "BASIC" ? "outlined" : "filled";
  };
  const getHealthColor = (health) => {
    switch (health) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };
  const getHealthIcon = (health) => {
    switch (health) {
      case "healthy":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {});
      case "warning":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {});
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorIcon, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {});
    }
  };
  reactExports.useEffect(() => {
    const hash = (location.hash || "").toLowerCase();
    const map = {
      "#users": 0,
      "#licenses": 1,
      "#invoices": 2,
      "#system": 3,
      "#system-health": 3
    };
    if (hash && map[hash] != null && map[hash] !== activeTab) {
      setActiveTab(map[hash]);
    }
  }, [location.hash]);
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    const reverseMap = {
      0: "users",
      1: "licenses",
      2: "invoices",
      3: "system"
    };
    const next = reverseMap[newValue] || "users";
    if ((location.hash || "").toLowerCase() !== `#${next}`) {
      navigate(`/admin#${next}`, { replace: true });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { pb: 4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out forwards", "@keyframes fadeInUp": { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } } }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, { sx: { fontSize: 32, color: "primary.main" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: "Admin Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            icon: getHealthIcon(stats.systemHealth),
            label: `System ${stats.systemHealth}`,
            color: getHealthColor(stats.systemHealth),
            size: "small"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out 0.1s forwards" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            sx: {
              background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)",
              border: "1px solid rgba(0, 212, 255, 0.2)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PeopleIcon, { sx: { color: "primary.main" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "Total Users" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: { fontWeight: 700, color: "primary.main" }, children: stats.totalUsers.toLocaleString() })
            ] })
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out 0.2s forwards" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            sx: {
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseIcon, { sx: { color: "secondary.main" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "Active Subscriptions" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: { fontWeight: 700 }, children: stats.activeSubscriptions.toLocaleString() })
            ] })
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out 0.3s forwards" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            sx: {
              background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)",
              border: "1px solid rgba(76, 175, 80, 0.2)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, { sx: { color: "success.main" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "Total Revenue" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h3", sx: { fontWeight: 700, color: "success.main" }, children: [
                "$",
                stats.totalRevenue.toLocaleString()
              ] })
            ] })
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, lg: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out 0.4s forwards" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            sx: {
              background: "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)",
              border: "1px solid rgba(255, 152, 0, 0.2)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { sx: { color: "warning.main" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", color: "text.secondary", children: "Pending Approvals" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h3", sx: { fontWeight: 700, color: "warning.main" }, children: stats.pendingApprovals })
            ] })
          }
        ) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        {
          value: activeTab,
          onChange: handleTabChange,
          sx: {
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Users" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Licenses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Invoices" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "System Health" })
          ]
        }
      ) }),
      activeTab === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out forwards" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2, mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                placeholder: "Search users by name, email, role, status, or subscription...",
                value: usersSearch,
                onChange: (e) => setUsersSearch(e.target.value),
                size: "small",
                sx: { flexGrow: 1, maxWidth: 600 },
                InputProps: {
                  startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) }),
                  endAdornment: usersSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: clearUsersSearch, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearIcon, {}) }) })
                }
              }
            ),
            usersSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: `${filteredUsers.length} of ${users.length} users found`,
                color: "primary",
                variant: "outlined"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: openAddDialog, children: "Add License" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TextField,
              {
                label: "Role",
                select: true,
                size: "small",
                value: usersFilters.role || "",
                onChange: (e) => setUsersFilters((f) => __spreadProps(__spreadValues({}, f), { role: e.target.value || void 0 })),
                sx: { minWidth: 120 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "USER", children: "USER" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ADMIN", children: "ADMIN" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "SUPERADMIN", children: "SUPERADMIN" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TextField,
              {
                label: "Status",
                select: true,
                size: "small",
                value: usersFilters.status || "",
                onChange: (e) => setUsersFilters((f) => __spreadProps(__spreadValues({}, f), { status: e.target.value || void 0 })),
                sx: { minWidth: 120 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "active", children: "ACTIVE" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "suspended", children: "SUSPENDED" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TextField,
              {
                label: "Subscription Tier",
                select: true,
                size: "small",
                value: usersFilters.tier || "",
                onChange: (e) => setUsersFilters((f) => __spreadProps(__spreadValues({}, f), { tier: e.target.value || void 0 })),
                sx: { minWidth: 140 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "BASIC", children: "BASIC" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PRO", children: "PRO" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ENTERPRISE", children: "ENTERPRISE" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", children: "Apply Filters" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setUsersFilters({}), children: "Clear" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Subscription" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Last Login" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredUsers.length > 0 ? filteredUsers.map((user2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", children: [
                user2.firstName,
                " ",
                user2.lastName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: user2.email })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: user2.role,
                size: "small",
                color: getRoleColor(user2.role)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: user2.status,
                size: "small",
                color: getStatusColor(user2.status)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: user2.subscription && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: user2.subscription,
                size: "small",
                color: getTierColor(user2.subscription),
                variant: getTierVariant(user2.subscription)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: new Date(user2.lastLogin).toLocaleDateString() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: () => handleUserEdit(user2),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {})
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: (e) => openUserLicensesPopover(e, user2), title: "View user licenses", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: (e) => {
                e.stopPropagation();
                openUserSeatDialog(user2);
              }, title: "Manage seats", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}) })
            ] })
          ] }, user2.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: usersSearch ? "No users found matching your search criteria." : "No users available." }) }) }) }) })
        ] }) })
      ] }),
      activeTab === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out forwards" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2, mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                placeholder: "Search licenses by user, tier, status, or subscription...",
                value: licensesSearch,
                onChange: (e) => setLicensesSearch(e.target.value),
                size: "small",
                sx: { flexGrow: 1, maxWidth: 600 },
                InputProps: {
                  startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) }),
                  endAdornment: licensesSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: clearLicensesSearch, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearIcon, {}) }) })
                }
              }
            ),
            licensesSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: `${filteredLicenses.length} of ${users.filter((u) => u.subscription).length} licenses found`,
                color: "primary",
                variant: "outlined"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: openAddDialog, children: "Add License" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TextField,
              {
                label: "Subscription Tier",
                select: true,
                size: "small",
                value: licensesFilters.tier || "",
                onChange: (e) => setLicensesFilters((f) => __spreadProps(__spreadValues({}, f), { tier: e.target.value || void 0 })),
                sx: { minWidth: 160 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "BASIC", children: "BASIC" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PRO", children: "PRO" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ENTERPRISE", children: "ENTERPRISE" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TextField,
              {
                label: "Status",
                select: true,
                size: "small",
                value: licensesFilters.status || "",
                onChange: (e) => setLicensesFilters((f) => __spreadProps(__spreadValues({}, f), { status: e.target.value || void 0 })),
                sx: { minWidth: 160 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "active", children: "ACTIVE" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "expired", children: "EXPIRED" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "suspended", children: "SUSPENDED" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "pending", children: "PENDING" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", children: "Apply Filters" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setLicensesFilters({}), children: "Clear" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Subscription Tier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Seats" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Activated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Expires" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredLicenses.length > 0 ? filteredLicenses.map((user2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", children: [
                user2.firstName,
                " ",
                user2.lastName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: user2.email })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: user2.subscription,
                size: "small",
                color: getTierColor(user2.subscription),
                variant: getTierVariant(user2.subscription)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: user2.status,
                size: "small",
                color: getStatusColor(user2.status)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "-" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: new Date(user2.lastLogin).toLocaleDateString() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "-" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  onClick: () => handleUserEdit(user2),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {})
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: (e) => openUserLicensesPopover(e, user2), title: "View user licenses", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: (e) => {
                e.stopPropagation();
                openUserSeatDialog(user2);
              }, title: "Manage seats", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}) })
            ] })
          ] }, user2.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, align: "center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { py: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: licensesSearch ? "No licenses found matching your search criteria." : "No users with subscriptions found." }) }) }) }) })
        ] }) })
      ] }),
      activeTab === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out forwards" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2, mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2, mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                placeholder: "Search payments by ID, email, tier, status, amount, or date...",
                value: paymentsSearch,
                onChange: (e) => setPaymentsSearch(e.target.value),
                size: "small",
                sx: { flexGrow: 1, maxWidth: 600 },
                InputProps: {
                  startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) }),
                  endAdornment: paymentsSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(InputAdornment, { position: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", onClick: clearPaymentsSearch, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearIcon, {}) }) })
                }
              }
            ),
            paymentsSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: `${filteredPayments.length} of ${payments.length} payments found`,
                color: "primary",
                variant: "outlined"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "Filter by Email",
                size: "small",
                value: paymentsFilters.email || "",
                onChange: (e) => setPaymentsFilters((f) => __spreadProps(__spreadValues({}, f), { email: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "From",
                size: "small",
                type: "date",
                InputLabelProps: { shrink: true },
                value: paymentsFilters.from || "",
                onChange: (e) => setPaymentsFilters((f) => __spreadProps(__spreadValues({}, f), { from: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                label: "To",
                size: "small",
                type: "date",
                InputLabelProps: { shrink: true },
                value: paymentsFilters.to || "",
                onChange: (e) => setPaymentsFilters((f) => __spreadProps(__spreadValues({}, f), { to: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TextField,
              {
                label: "Status",
                select: true,
                size: "small",
                value: paymentsFilters.status || "",
                onChange: (e) => setPaymentsFilters((f) => __spreadProps(__spreadValues({}, f), { status: e.target.value || void 0 })),
                sx: { minWidth: 160 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "All" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "SUCCEEDED", children: "SUCCEEDED" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PENDING", children: "PENDING" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "FAILED", children: "FAILED" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "REFUNDED", children: "REFUNDED" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", onClick: () => fetchPayments(1), children: "Apply Filters" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, mb: 2, justifyContent: "flex-end" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                variant: "contained",
                onClick: expandAllFolders,
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, {}),
                sx: {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: "medium",
                  borderRadius: "8px",
                  textTransform: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transform: "translateY(-1px)"
                  },
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                },
                children: "Expand All"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "small",
                variant: "outlined",
                onClick: collapseAllFolders,
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMoreIcon, { sx: { transform: "rotate(180deg)" } }),
                sx: {
                  color: "primary.main",
                  borderColor: "primary.main",
                  fontWeight: "medium",
                  borderRadius: "8px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "primary.light",
                    borderColor: "primary.main",
                    color: "primary.contrastText",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transform: "translateY(-1px)"
                  },
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                },
                children: "Collapse All"
              }
            )
          ] }),
          groupedPaymentsForDisplay.length > 0 ? groupedPaymentsForDisplay.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Paper,
            {
              sx: {
                mb: 3,
                border: "1px solid",
                borderColor: "primary.main",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                  transform: "translateY(-2px)"
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Box,
                  {
                    sx: {
                      p: 2,
                      background: "linear-gradient(135deg, primary.main 0%, primary.dark 100%)",
                      color: "primary.contrastText",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      "&:hover": {
                        background: "linear-gradient(135deg, primary.dark 0%, primary.main 100%)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      borderRadius: "8px 8px 0 0"
                    },
                    onClick: () => toggleFolder(group.userEmail),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          FolderIcon,
                          {
                            sx: {
                              fontSize: "1.8rem",
                              color: "#ffffff",
                              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))"
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Typography,
                          {
                            variant: "h6",
                            fontWeight: "bold",
                            sx: {
                              color: "#ffffff",
                              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                              letterSpacing: "0.02em"
                            },
                            children: group.userName
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Chip,
                          {
                            label: `${group.paymentCount} payments`,
                            color: "secondary",
                            variant: "filled",
                            sx: {
                              color: "#ffffff",
                              fontWeight: "medium",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                              backgroundColor: "rgba(255,255,255,0.2)",
                              border: "1px solid rgba(255,255,255,0.3)"
                            }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Typography,
                          {
                            variant: "body1",
                            fontWeight: "bold",
                            sx: {
                              color: "#ffffff",
                              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                              backgroundColor: "rgba(255,255,255,0.15)",
                              borderRadius: "4px",
                              px: 1.5,
                              py: 0.5
                            },
                            children: [
                              "Total: ",
                              formatCurrency(group.totalAmount)
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        ExpandMoreIcon,
                        {
                          sx: {
                            transform: expandedFolders.has(group.userEmail) ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                            color: "#ffffff",
                            fontSize: "1.8rem",
                            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))",
                            "&:hover": {
                              transform: expandedFolders.has(group.userEmail) ? "rotate(180deg) scale(1.1)" : "rotate(0deg) scale(1.1)",
                              filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.3))"
                            }
                          }
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Collapse, { in: expandedFolders.has(group.userEmail), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TableContainer,
                  {
                    sx: {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      borderRadius: "0 0 8px 8px",
                      overflow: "hidden"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Table,
                      {
                        size: "small",
                        sx: {
                          "& .MuiTableCell-root": {
                            borderColor: "divider"
                          }
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            TableRow,
                            {
                              sx: {
                                backgroundColor: "primary.light",
                                "& .MuiTableCell-head": {
                                  color: "primary.contrastText",
                                  fontWeight: "bold",
                                  fontSize: "0.875rem"
                                }
                              },
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Payment ID" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Type" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "User" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Tier" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Amount" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Date" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Details" })
                              ]
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: group.payments.map((payment) => {
                            var _a2, _b2, _c, _d, _e;
                            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              TableRow,
                              {
                                sx: {
                                  "&:hover": {
                                    backgroundColor: "action.hover",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    transition: "all 0.2s ease-in-out"
                                  },
                                  transition: "all 0.2s ease-in-out",
                                  cursor: "pointer"
                                },
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontFamily: "monospace", children: payment.id }) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Chip,
                                    {
                                      size: "small",
                                      label: "Payment",
                                      color: "success",
                                      variant: "outlined",
                                      sx: { fontWeight: "bold" }
                                    }
                                  ) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: ((_a2 = payment.user) == null ? void 0 : _a2.email) || "—" }) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Chip,
                                    {
                                      size: "small",
                                      label: ((_b2 = payment.subscription) == null ? void 0 : _b2.tier) || "—",
                                      color: getTierColor((_c = payment.subscription) == null ? void 0 : _c.tier),
                                      variant: getTierVariant((_d = payment.subscription) == null ? void 0 : _d.tier)
                                    }
                                  ) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: formatCurrency(payment.amount) }) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: payment.status, color: payment.status === "succeeded" ? "success" : payment.status === "FAILED" ? "error" : "default" }) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: ((_e = payment.createdAt) == null ? void 0 : _e.seconds) ? new Date(payment.createdAt.seconds * 1e3).toLocaleDateString() : "—" }) }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Button,
                                    {
                                      size: "small",
                                      variant: "contained",
                                      onClick: () => openPaymentDetails(payment.id),
                                      sx: {
                                        backgroundColor: "primary.main",
                                        color: "primary.contrastText",
                                        "&:hover": {
                                          backgroundColor: "primary.dark",
                                          transform: "translateY(-1px)",
                                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                                        },
                                        "&:active": {
                                          transform: "translateY(0px)",
                                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                                        },
                                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                        fontWeight: "medium",
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        px: 2
                                      },
                                      children: "Open"
                                    }
                                  ) })
                                ]
                              },
                              payment.id
                            );
                          }) })
                        ]
                      }
                    )
                  }
                ) })
              ]
            },
            group.userEmail
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx(Paper, { sx: { p: 4, textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "No payments available." }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1, justifyContent: "flex-end", mt: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: paymentsPage <= 1, onClick: () => setPaymentsPage((p) => Math.max(1, p - 1)), children: "Prev" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `Page ${paymentsPage} of ${paymentsTotalPages}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: paymentsPage >= paymentsTotalPages, onClick: () => setPaymentsPage((p) => Math.min(paymentsTotalPages, p + 1)), children: "Next" })
        ] })
      ] }),
      activeTab === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { opacity: 0, transform: "translateY(20px)", animation: "fadeInUp 0.6s ease-out forwards" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "System Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: `Overall: ${((systemHealth == null ? void 0 : systemHealth.overall) || "unknown").toUpperCase()}`,
                color: (systemHealth == null ? void 0 : systemHealth.overall) === "healthy" ? "success" : (systemHealth == null ? void 0 : systemHealth.overall) === "degraded" ? "warning" : (systemHealth == null ? void 0 : systemHealth.overall) === "unhealthy" ? "error" : "default"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", onClick: refreshHealth, disabled: healthLoading, children: healthLoading ? "Refreshing…" : "Refresh" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubsystemCard, { title: "Database", data: systemHealth == null ? void 0 : systemHealth.database }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubsystemCard, { title: "Email (SendGrid)", data: systemHealth == null ? void 0 : systemHealth.email }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubsystemCard, { title: "Payments (Stripe)", data: systemHealth == null ? void 0 : systemHealth.payment }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SubsystemCard, { title: "Webhooks", data: systemHealth == null ? void 0 : systemHealth.webhooks }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Recent Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "Checked at: ",
              (systemHealth == null ? void 0 : systemHealth.checkedAt) ? new Date(systemHealth.checkedAt).toLocaleString() : "—"
            ] }),
            ((_a = systemHealth == null ? void 0 : systemHealth.webhooks) == null ? void 0 : _a.metrics) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                "Recent webhooks (24h): ",
                systemHealth.webhooks.metrics.recentWebhooks
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                "Failed webhooks: ",
                systemHealth.webhooks.metrics.failedWebhooks
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No metrics available" })
          ] })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: userDialogOpen,
        onClose: () => setUserDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: selectedUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mt: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "First Name",
                value: selectedUser.firstName,
                disabled: true
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Last Name",
                value: selectedUser.lastName,
                disabled: true
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                label: "Email",
                value: selectedUser.email,
                disabled: true
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selectedUser.role,
                  label: "Role",
                  inputProps: {
                    "aria-label": "Select user role",
                    title: "Choose the user role"
                  },
                  onChange: (e) => setSelectedUser((u) => u ? __spreadProps(__spreadValues({}, u), { role: String(e.target.value) }) : u),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "USER", children: "User" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ADMIN", children: "Admin" })
                  ]
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: "Role is enforced by active subscription tier: BASIC → User; PRO/ENTERPRISE → Admin. Elevation to SuperAdmin is not allowed via UI." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selectedUser.status,
                  label: "Status",
                  inputProps: {
                    "aria-label": "Select user status",
                    title: "Choose the user status"
                  },
                  onChange: (e) => setSelectedUser((u) => u ? __spreadProps(__spreadValues({}, u), { status: String(e.target.value) }) : u),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "suspended", children: "Suspended" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "pending", children: "Pending" })
                  ]
                }
              )
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setUserDialogOpen(false), children: "Cancel" }),
            selectedUser && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => openUserSeatDialog(selectedUser), children: "Manage Seats" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleUserSave, variant: "contained", children: "Save Changes" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: detailsOpen, onClose: () => setDetailsOpen(false), maxWidth: "md", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Payment Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: detailsData.payment ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `ID: ${detailsData.payment.id}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `User: ${((_b = detailsData.payment.user) == null ? void 0 : _b.email) || "—"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `Amount: $${(detailsData.payment.amount / 100).toFixed(2)}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `Status: ${detailsData.payment.status}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `Date: ${new Date(detailsData.payment.createdAt).toLocaleString()}` }),
          detailsData.payment.receiptUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "outlined", onClick: () => window.open(detailsData.payment.receiptUrl, "_blank"), children: "View Invoice" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", children: "Related Licenses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "License Key" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Activated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Expires" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (detailsData.licenses || []).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontFamily: "monospace", children: l.key }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: l.status, color: getStatusColor(String(l.status).toLowerCase()) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: l.activatedAt ? new Date(l.activatedAt).toLocaleDateString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : "—" })
          ] }, l.id)) })
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No details." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDetailsOpen(false), children: "Close" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Popover,
      {
        open: Boolean(licensesAnchorEl),
        anchorEl: licensesAnchorEl,
        onClose: closeUserLicensesPopover,
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        transformOrigin: { vertical: "top", horizontal: "left" },
        PaperProps: { sx: { p: 2, maxWidth: 560 } },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LicenseIcon, { fontSize: "small", color: "action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", children: (licensesPopoverUser == null ? void 0 : licensesPopoverUser.email) || "Licenses" })
          ] }),
          userLicensesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Loading..." }) : userLicenses.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "License Key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Tier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Expires" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: userLicenses.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontFamily: "monospace", children: l.key }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: l.tier, color: getTierColor(l.tier), variant: getTierVariant(l.tier) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { size: "small", label: l.status, color: getStatusColor(l.status) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: new Date(l.expiresAt).toLocaleDateString() }) })
            ] }, l.id)) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No licenses found for this user." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: addDialogOpen,
        onClose: () => setAddDialogOpen(false),
        maxWidth: "sm",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add License" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mt: 0.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                select: true,
                fullWidth: true,
                label: "User",
                value: addForm.userId,
                onChange: (e) => onUserSelect(e.target.value),
                children: users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: u.id, children: u.email }, u.id))
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                select: true,
                fullWidth: true,
                label: "Subscription",
                value: addForm.subscriptionId,
                onChange: (e) => setAddForm((prev) => __spreadProps(__spreadValues({}, prev), { subscriptionId: e.target.value })),
                disabled: !userSubscriptions.length,
                children: userSubscriptions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: s.id, children: [
                  s.tier,
                  " — seats ",
                  s.seats
                ] }, s.id))
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TextField,
              {
                select: true,
                fullWidth: true,
                label: "Tier",
                value: addForm.tier,
                onChange: (e) => setAddForm((prev) => __spreadProps(__spreadValues({}, prev), { tier: e.target.value })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "BASIC", children: "BASIC" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "PRO", children: "PRO" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "ENTERPRISE", children: "ENTERPRISE" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                type: "number",
                label: "Seats",
                inputProps: { min: 1, max: 1e3 },
                value: addForm.seats,
                onChange: (e) => setAddForm((prev) => __spreadProps(__spreadValues({}, prev), { seats: Math.max(1, Math.min(1e3, parseInt(e.target.value) || 1)) }))
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setAddDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: submitAdd, disabled: !addForm.userId || !addForm.subscriptionId, children: "Create" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: userSeatDialogOpen,
        onClose: () => setUserSeatDialogOpen(false),
        maxWidth: "xs",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Manage Seats" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: userSeatSubscription ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mt: 0.5 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "info", children: [
              userSeatSubscription.tier,
              " subscription"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextField,
              {
                fullWidth: true,
                type: "number",
                label: "Total Seats",
                value: userSeatInput,
                onChange: (e) => setUserSeatInput(parseInt(e.target.value || "0", 10)),
                inputProps: { min: 1, max: userSeatSubscription.tier === "PRO" ? 50 : 1e3 }
              }
            ) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "No active subscription found." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setUserSeatDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveUserSeatDialog, variant: "contained", disabled: !userSeatSubscription, children: "Save" })
          ] })
        ]
      }
    )
  ] }) });
};
export {
  AdminDashboard as default
};
