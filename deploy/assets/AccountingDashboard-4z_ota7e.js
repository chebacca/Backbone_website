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
import { j as jsxRuntimeExports, B as Box, T as Typography, d as Alert, aH as Tabs, aI as Tab, c as Paper, G as Grid, S as Stack, e as TextField, bu as ToggleButtonGroup, bv as ToggleButton, a9 as FormControl, aa as InputLabel, ab as Select, M as MenuItem, ac as ButtonGroup, a as Button, R as RefreshIcon, at as Download, bw as Print, bx as Save, by as Restore, D as Divider, bz as Autocomplete, bA as Map, bB as Launch, bC as Public, am as Table, an as TableHead, ao as TableRow, ap as TableCell, aq as TableBody, aC as Tooltip, g as IconButton, aj as Receipt, r as Chip, al as TableContainer, h as Visibility } from "./mui-Cc0LuBKd.js";
import { r as reactExports, e as useLocation, u as useNavigate } from "./vendor-Cu2L4Rr-.js";
import { c as api, e as endpoints } from "./index-_czX3gCs.js";
import "./stripe-CSTr_BWb.js";
const AccountingDashboard = () => {
  var _a, _b, _c, _d, _e;
  const [payments, setPayments] = reactExports.useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [tab, setTab] = reactExports.useState(0);
  const hashToTabIndex = reactExports.useMemo(() => ({
    "#overview": 0,
    "#payments": 1,
    "#tax": 2,
    "#filings": 3,
    "#kyc": 4,
    "#compliance": 5,
    "#terms": 6
  }), []);
  const tabIndexToHash = reactExports.useMemo(() => ({
    0: "overview",
    1: "payments",
    2: "tax",
    3: "filings",
    4: "kyc",
    5: "compliance",
    6: "terms"
  }), []);
  reactExports.useEffect(() => {
    const h = (location.hash || "").toLowerCase();
    if (h && Object.prototype.hasOwnProperty.call(hashToTabIndex, h)) {
      const idx = hashToTabIndex[h];
      if (idx !== tab) setTab(idx);
    } else if (!h) {
      if (tab !== 0) setTab(0);
      if (location.pathname.startsWith("/accounting")) {
        navigate("/accounting#overview", { replace: true });
      }
    }
  }, [location.hash]);
  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    const nextHash = tabIndexToHash[newValue];
    const desired = `#${nextHash}`;
    if ((location.hash || "").toLowerCase() !== desired) {
      navigate(`/accounting${desired}`, { replace: true });
    }
  };
  const [overview, setOverview] = reactExports.useState(null);
  const [taxSummary, setTaxSummary] = reactExports.useState(null);
  const [kyc, setKyc] = reactExports.useState([]);
  const [events, setEvents] = reactExports.useState([]);
  const [termsRows, setTermsRows] = reactExports.useState([]);
  const [pendingKycCount, setPendingKycCount] = reactExports.useState(0);
  const [filingFrom, setFilingFrom] = reactExports.useState("");
  const [filingTo, setFilingTo] = reactExports.useState("");
  const [filingScheme, setFilingScheme] = reactExports.useState("US_SALES_TAX");
  const [company, setCompany] = reactExports.useState({
    legalName: "",
    taxId: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "US",
    contactEmail: ""
  });
  const [filingPayments, setFilingPayments] = reactExports.useState([]);
  const [selectedStateCode, setSelectedStateCode] = reactExports.useState("NY");
  const [selectedCountryCode, setSelectedCountryCode] = reactExports.useState("US");
  const [preset, setPreset] = reactExports.useState(null);
  const US_STATES = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California", portal: "https://onlineservices.cdtfa.ca.gov" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida", portal: "https://floridarevenue.com/taxes/Pages/return_drt.aspx" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York", portal: "https://www.tax.ny.gov/online/" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas", portal: "https://comptroller.texas.gov/taxes/file-pay/" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington", portal: "https://secure.dor.wa.gov/" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
    { code: "DC", name: "District of Columbia" }
  ];
  reactExports.useEffect(() => {
    try {
      const stored = localStorage.getItem("filing_company_default");
      if (stored) setCompany(JSON.parse(stored));
    } catch (e) {
    }
    const today = /* @__PURE__ */ new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setFilingFrom(fmt(firstDayLastMonth));
    setFilingTo(fmt(lastDayLastMonth));
  }, []);
  const applyPeriodPreset = (preset2) => {
    const today = /* @__PURE__ */ new Date();
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const startOfMonth = (y, m) => new Date(y, m, 1);
    const endOfMonth = (y, m) => new Date(y, m + 1, 0);
    const startOfQuarter = (y, q) => new Date(y, q * 3, 1);
    const endOfQuarter = (y, q) => new Date(y, q * 3 + 3, 0);
    if (preset2 === "THIS_MONTH") {
      const from2 = startOfMonth(today.getFullYear(), today.getMonth());
      const to2 = endOfMonth(today.getFullYear(), today.getMonth());
      setFilingFrom(fmt(from2));
      setFilingTo(fmt(to2));
      return;
    }
    if (preset2 === "LAST_MONTH") {
      const from2 = startOfMonth(today.getFullYear(), today.getMonth() - 1);
      const to2 = endOfMonth(today.getFullYear(), today.getMonth() - 1);
      setFilingFrom(fmt(from2));
      setFilingTo(fmt(to2));
      return;
    }
    if (preset2 === "THIS_QUARTER") {
      const q = Math.floor(today.getMonth() / 3);
      const from2 = startOfQuarter(today.getFullYear(), q);
      const to2 = endOfQuarter(today.getFullYear(), q);
      setFilingFrom(fmt(from2));
      setFilingTo(fmt(to2));
      return;
    }
    if (preset2 === "LAST_QUARTER") {
      let q = Math.floor(today.getMonth() / 3) - 1;
      let y = today.getFullYear();
      if (q < 0) {
        q = 3;
        y -= 1;
      }
      const from2 = startOfQuarter(y, q);
      const to2 = endOfQuarter(y, q);
      setFilingFrom(fmt(from2));
      setFilingTo(fmt(to2));
      return;
    }
    if (preset2 === "YTD") {
      const from2 = new Date(today.getFullYear(), 0, 1);
      const to2 = today;
      setFilingFrom(fmt(from2));
      setFilingTo(fmt(to2));
      return;
    }
    if (preset2 === "LAST_YEAR") {
      const y = today.getFullYear() - 1;
      const from2 = new Date(y, 0, 1);
      const to2 = new Date(y, 11, 31);
      setFilingFrom(fmt(from2));
      setFilingTo(fmt(to2));
      return;
    }
  };
  const saveCompanyAsDefault = () => __async(void 0, null, function* () {
    try {
      localStorage.setItem("filing_company_default", JSON.stringify(company));
    } catch (e) {
    }
    try {
      yield api.post(endpoints.admin.companyFilingSave(), company);
    } catch (e) {
    }
  });
  const loadCompanyDefault = () => {
    try {
      const stored = localStorage.getItem("filing_company_default");
      if (stored) setCompany(JSON.parse(stored));
    } catch (e) {
    }
  };
  const fetchPayments = () => __async(void 0, null, function* () {
    var _a2, _b2;
    const res = yield api.get(endpoints.accounting.payments(), { params: { limit: 50 } });
    setPayments(((_b2 = (_a2 = res.data) == null ? void 0 : _a2.data) == null ? void 0 : _b2.payments) || []);
  });
  reactExports.useEffect(() => {
    const load = () => __async(void 0, null, function* () {
      var _a2, _b2, _c2, _d2, _e2, _f, _g, _h, _i, _j, _k, _l;
      fetchPayments();
      const [ov, tax, kycRes, ev, consentsLatest] = yield Promise.all([
        api.get("accounting/overview"),
        api.get("accounting/tax/summary"),
        api.get("accounting/kyc"),
        api.get("accounting/compliance-events"),
        api.get(endpoints.accounting.consentsLatest())
      ]);
      setOverview(((_a2 = ov.data) == null ? void 0 : _a2.data) || null);
      setTaxSummary(((_b2 = tax.data) == null ? void 0 : _b2.data) || null);
      setKyc(((_d2 = (_c2 = kycRes.data) == null ? void 0 : _c2.data) == null ? void 0 : _d2.users) || []);
      setEvents(((_f = (_e2 = ev.data) == null ? void 0 : _e2.data) == null ? void 0 : _f.events) || []);
      setTermsRows(((_h = (_g = consentsLatest.data) == null ? void 0 : _g.data) == null ? void 0 : _h.users) || []);
      const pendingCount = (((_j = (_i = kycRes.data) == null ? void 0 : _i.data) == null ? void 0 : _j.users) || []).filter((u) => String(u.kycStatus || "").toUpperCase() !== "COMPLETED").length;
      setPendingKycCount(pendingCount);
      try {
        const resCompany = yield api.get(endpoints.admin.companyFilingGet());
        const c = (_l = (_k = resCompany.data) == null ? void 0 : _k.data) == null ? void 0 : _l.company;
        if (c) setCompany((prev) => __spreadValues(__spreadValues({}, prev), c));
      } catch (e) {
      }
    });
    load();
  }, []);
  const exportPayments = () => __async(void 0, null, function* () {
    var _a2, _b2;
    const body = { from, to, includePII: false };
    const res = yield api.post(endpoints.accounting.exportPayments(), body);
    const rows = ((_b2 = (_a2 = res.data) == null ? void 0 : _a2.data) == null ? void 0 : _b2.rows) || [];
    const header = Object.keys(rows[0] || {}).join(",");
    const csv = [header, ...rows.map((r) => Object.values(r).map((v) => JSON.stringify(v != null ? v : "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${from || "all"}_${to || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
  const exportPaymentsForFiling = () => __async(void 0, null, function* () {
    var _a2, _b2;
    const body = { from: filingFrom, to: filingTo, includePII: false };
    const res = yield api.post(endpoints.accounting.exportPayments(), body);
    const rows = ((_b2 = (_a2 = res.data) == null ? void 0 : _a2.data) == null ? void 0 : _b2.rows) || [];
    const header = Object.keys(rows[0] || {}).join(",");
    const csv = [header, ...rows.map((r) => Object.values(r).map((v) => JSON.stringify(v != null ? v : "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${filingFrom || "all"}_${filingTo || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
  const refreshFilingSummary = () => __async(void 0, null, function* () {
    var _a2, _b2, _c2;
    const res = yield api.get("accounting/tax/summary", { params: { from: filingFrom || void 0, to: filingTo || void 0 } });
    setTaxSummary(((_a2 = res.data) == null ? void 0 : _a2.data) || null);
    const pay = yield api.get(endpoints.accounting.payments(), { params: { from: filingFrom || void 0, to: filingTo || void 0, limit: 500 } });
    setFilingPayments(((_c2 = (_b2 = pay.data) == null ? void 0 : _b2.data) == null ? void 0 : _c2.payments) || []);
  });
  const downloadJurisdictionCSV = () => {
    var _a2, _b2, _c2, _d2, _e2, _f;
    if (!taxSummary) return;
    const rows = [];
    if (filingScheme === "US_SALES_TAX") {
      const byJurisdiction = (taxSummary == null ? void 0 : taxSummary.byJurisdiction) || {};
      for (const [jurisdiction, v] of Object.entries(byJurisdiction)) {
        rows.push({
          jurisdiction,
          tax_cents: (_a2 = v.tax_cents) != null ? _a2 : 0,
          taxable_cents: (_b2 = v.taxable_cents) != null ? _b2 : 0,
          count: (_c2 = v.count) != null ? _c2 : 0
        });
      }
    } else {
      const byCountry = (taxSummary == null ? void 0 : taxSummary.byCountry) || {};
      for (const [country, v] of Object.entries(byCountry)) {
        rows.push({
          country,
          tax_cents: (_d2 = v.tax_cents) != null ? _d2 : 0,
          taxable_cents: (_e2 = v.taxable_cents) != null ? _e2 : 0,
          count: (_f = v.count) != null ? _f : 0
        });
      }
    }
    const header = Object.keys(rows[0] || {}).join(",");
    const csv = [header, ...rows.map((r) => Object.values(r).map((v) => JSON.stringify(v != null ? v : "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `filing_summary_${filingScheme}_${filingFrom || "all"}_${filingTo || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const printFilingCoverSheet = () => {
    const win = window.open("", "PRINT", "height=800,width=800");
    if (!win) return;
    const period = `${filingFrom || "Start"} to ${filingTo || "End"}`;
    const values = filingScheme === "US_SALES_TAX" ? (taxSummary == null ? void 0 : taxSummary.byJurisdiction) || {} : (taxSummary == null ? void 0 : taxSummary.byCountry) || {};
    const totals = Object.values(values).reduce((acc, v) => ({ tax: acc.tax + ((v == null ? void 0 : v.tax_cents) || 0), taxable: acc.taxable + ((v == null ? void 0 : v.taxable_cents) || 0), count: acc.count + ((v == null ? void 0 : v.count) || 0) }), { tax: 0, taxable: 0, count: 0 });
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Filing Cover Sheet</title>
      <style>body{font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding:24px;} h1,h2{margin:0 0 8px;} table{border-collapse: collapse; width:100%; margin-top:16px;} th,td{border:1px solid #ccc; padding:8px; text-align:left;} small{color:#666}</style>
    </head><body>
      <h1>Tax Filing Cover Sheet</h1>
      <small>Generated by Accounting Dashboard</small>
      <h2>Company</h2>
      <div>${company.legalName || "-"}</div>
      <div>${company.addressLine1 || ""} ${company.addressLine2 || ""}</div>
      <div>${company.city || ""} ${company.region || ""} ${company.postalCode || ""} ${company.country || ""}</div>
      <div>Tax ID: ${company.taxId || "-"}</div>
      <div>Contact: ${company.contactEmail || "-"}</div>
      <h2>Filing</h2>
      <div>Scheme: ${filingScheme}</div>
      <div>Period: ${period}</div>
      <table>
        <tr><th>Total Taxable</th><th>Total Tax</th><th>Transactions</th></tr>
        <tr><td>${(totals.taxable / 100).toLocaleString()}</td><td>${(totals.tax / 100).toLocaleString()}</td><td>${totals.count}</td></tr>
      </table>
      <p style="margin-top:16px">Attach the jurisdiction/member-state summary CSV and payments CSV for the filing period when submitting via your tax portal or provider.</p>
      <script>window.onload=function(){window.print(); setTimeout(()=>window.close(), 300);}<\/script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
  };
  const computeStateTotals = () => {
    var _a2, _b2, _c2;
    const totals = {};
    for (const p of filingPayments) {
      if (String(p.status).toUpperCase() !== "SUCCEEDED") continue;
      const state = ((_a2 = p.billingAddress) == null ? void 0 : _a2.state) || "UNKNOWN";
      const tax = (_b2 = p.taxAmount) != null ? _b2 : 0;
      const taxable = ((_c2 = p.amount) != null ? _c2 : 0) - tax;
      totals[state] = totals[state] || { taxable_cents: 0, tax_cents: 0, count: 0 };
      totals[state].taxable_cents += taxable;
      totals[state].tax_cents += tax;
      totals[state].count += 1;
    }
    return totals;
  };
  const printGenericStateWorksheet = (stateCode) => {
    const stateTotals = computeStateTotals();
    const st = stateTotals[stateCode] || { taxable_cents: 0, tax_cents: 0, count: 0 };
    const period = `${filingFrom || "Start"} to ${filingTo || "End"}`;
    const meta = US_STATES.find((s) => s.code === stateCode);
    const win = window.open("", "PRINT", "height=900,width=1000");
    if (!win) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${stateCode} Sales Tax Worksheet</title>
      <style>body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;} h1{margin:0 0 8px} table{border-collapse:collapse;width:100%;margin-top:16px;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} small{color:#666}</style>
    </head><body>
      <h1>${(meta == null ? void 0 : meta.name) || stateCode} Sales and Use Tax Return (Worksheet)</h1>
      <small>For reference only. Most states require e-filing via their tax portal.</small>
      <h2>Company</h2>
      <div>${company.legalName || "-"}</div>
      <div>${company.addressLine1 || ""} ${company.addressLine2 || ""}</div>
      <div>${company.city || ""} ${company.region || ""} ${company.postalCode || ""} ${company.country || ""}</div>
      <div>Tax ID: ${company.taxId || "-"}</div>
      <div>Contact: ${company.contactEmail || "-"}</div>
      <h2>Period: ${period}</h2>
      <table>
        <tr><th>Taxable sales (${stateCode})</th><td>${(st.taxable_cents / 100).toLocaleString()}</td></tr>
        <tr><th>Sales and use tax due (${stateCode})</th><td>${(st.tax_cents / 100).toLocaleString()}</td></tr>
        <tr><th>Transactions</th><td>${st.count}</td></tr>
      </table>
      ${(meta == null ? void 0 : meta.portal) ? `<p style="margin-top:16px">Portal: <a href="${meta.portal}" target="_blank" rel="noreferrer">${meta.portal}</a></p>` : ""}
      <script>window.onload=function(){window.print(); setTimeout(()=>window.close(), 300);}<\/script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
  };
  const printCountryWorksheet = (countryCode) => {
    const period = `${filingFrom || "Start"} to ${filingTo || "End"}`;
    const values = (taxSummary == null ? void 0 : taxSummary.byCountry) || {};
    const v = values[countryCode] || { tax_cents: 0, taxable_cents: 0, count: 0 };
    const win = window.open("", "PRINT", "height=900,width=1000");
    if (!win) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${countryCode} VAT/Sales Worksheet</title>
      <style>body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;} h1{margin:0 0 8px} table{border-collapse:collapse;width:100%;margin-top:16px;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} small{color:#666}</style>
    </head><body>
      <h1>${countryCode} Indirect Tax Worksheet</h1>
      <small>For reference only. File via your national portal (e.g., EU OSS, CRA GST/HST).</small>
      <h2>Company</h2>
      <div>${company.legalName || "-"}</div>
      <div>${company.addressLine1 || ""} ${company.addressLine2 || ""}</div>
      <div>${company.city || ""} ${company.region || ""} ${company.postalCode || ""} ${company.country || ""}</div>
      <div>Tax ID: ${company.taxId || "-"}</div>
      <div>Contact: ${company.contactEmail || "-"}</div>
      <h2>Period: ${period}</h2>
      <table>
        <tr><th>Taxable amount (${countryCode})</th><td>${(v.taxable_cents / 100).toLocaleString()}</td></tr>
        <tr><th>Tax due (${countryCode})</th><td>${(v.tax_cents / 100).toLocaleString()}</td></tr>
        <tr><th>Transactions</th><td>${v.count || 0}</td></tr>
      </table>
      <script>window.onload=function(){window.print(); setTimeout(()=>window.close(), 300);}<\/script>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, gutterBottom: true, children: "Accounting & Compliance" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: "Financial reporting, tax, KYC/AML, and regulatory oversight snapshot." }),
    pendingKycCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "warning", sx: { mb: 2 }, children: [
      pendingKycCount,
      " user",
      pendingKycCount === 1 ? "" : "s",
      " require KYC verification. Review the KYC tab for details."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onChange: handleTabChange, sx: { mb: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Payments" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Tax" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Filings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "KYC" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Compliance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Terms" })
    ] }),
    tab === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Filing Packet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "Filing Period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, sx: { mb: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "From (YYYY-MM-DD)", placeholder: "2025-01-01", value: filingFrom, onChange: (e) => setFilingFrom(e.target.value), size: "small" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "To (YYYY-MM-DD)", placeholder: "2025-12-31", value: filingTo, onChange: (e) => setFilingTo(e.target.value), size: "small" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ToggleButtonGroup,
            {
              exclusive: true,
              size: "small",
              value: preset,
              onChange: (_, v) => {
                setPreset(v);
                if (!v) return;
                const map = {
                  THIS_MONTH: "THIS_MONTH",
                  LAST_MONTH: "LAST_MONTH",
                  THIS_QUARTER: "THIS_QUARTER",
                  LAST_QUARTER: "LAST_QUARTER",
                  YTD: "YTD",
                  LAST_YEAR: "LAST_YEAR"
                };
                applyPeriodPreset(map[v]);
              },
              sx: { mb: 2, flexWrap: "wrap" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: "THIS_MONTH", children: "This Month" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: "LAST_MONTH", children: "Last Month" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: "THIS_QUARTER", children: "This Quarter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: "LAST_QUARTER", children: "Last Quarter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: "YTD", children: "YTD" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleButton, { value: "LAST_YEAR", children: "Last Year" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { size: "small", sx: { minWidth: 240 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { id: "scheme-label", children: "Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { labelId: "scheme-label", id: "scheme", value: filingScheme, label: "Scheme", onChange: (e) => setFilingScheme(e.target.value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "US_SALES_TAX", children: "US Sales Tax (state/county)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "EU_OSS", children: "EU OSS VAT (member state)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonGroup, { variant: "contained", size: "small", sx: { mt: 2, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { color: "inherit", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}), onClick: refreshFilingSummary, children: "Refresh" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { color: "primary", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}), onClick: downloadJurisdictionCSV, children: "Summary CSV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { color: "secondary", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, {}), onClick: exportPaymentsForFiling, children: "Payments CSV" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "Company Info (for cover sheet)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", label: "Legal Name", value: company.legalName, onChange: (e) => setCompany(__spreadProps(__spreadValues({}, company), { legalName: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", label: "Tax ID / VAT", value: company.taxId, onChange: (e) => setCompany(__spreadProps(__spreadValues({}, company), { taxId: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", label: "Contact Email", value: company.contactEmail, onChange: (e) => setCompany(__spreadProps(__spreadValues({}, company), { contactEmail: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", label: "Address Line 1", value: company.addressLine1, onChange: (e) => setCompany(__spreadProps(__spreadValues({}, company), { addressLine1: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", label: "Address Line 2", value: company.addressLine2, onChange: (e) => setCompany(__spreadProps(__spreadValues({}, company), { addressLine2: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", label: "City", value: company.city, onChange: (e) => setCompany(__spreadProps(__spreadValues({}, company), { city: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", label: "Region/State", value: company.region, onChange: (e) => setCompany(__spreadProps(__spreadValues({}, company), { region: e.target.value })) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { fullWidth: true, size: "small", label: "Postal Code", value: company.postalCode, onChange: (e) => setCompany(__spreadProps(__spreadValues({}, company), { postalCode: e.target.value })) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonGroup, { variant: "outlined", size: "small", sx: { mt: 2, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Print, {}), onClick: printFilingCoverSheet, children: "Cover Sheet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Save, {}), onClick: saveCompanyAsDefault, children: "Save Defaults" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Restore, {}), onClick: loadCompanyDefault, children: "Load Defaults" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "US State Worksheets" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Autocomplete,
                {
                  options: US_STATES,
                  getOptionLabel: (o) => `${o.code} — ${o.name}`,
                  value: US_STATES.find((s) => s.code === selectedStateCode) || null,
                  onChange: (_, v) => setSelectedStateCode((v == null ? void 0 : v.code) || "NY"),
                  renderInput: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, __spreadProps(__spreadValues({}, params), { label: "Select State", size: "small" })),
                  sx: { maxWidth: 400, mt: 1 }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonGroup, { size: "small", sx: { mt: 2, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Map, {}), onClick: () => printGenericStateWorksheet(selectedStateCode), children: "Print State Worksheet" }),
                ((_a = US_STATES.find((s) => s.code === selectedStateCode)) == null ? void 0 : _a.portal) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Launch, {}), onClick: () => window.open(US_STATES.find((s) => s.code === selectedStateCode).portal, "_blank", "noreferrer"), children: "Open Portal" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "International (Country) Worksheets" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Country Code (ISO alpha-2)", size: "small", value: selectedCountryCode, onChange: (e) => setSelectedCountryCode(e.target.value.toUpperCase()), sx: { maxWidth: 240, mt: 1 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ButtonGroup, { size: "small", sx: { mt: 2, flexWrap: "wrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Public, {}), onClick: () => printCountryWorksheet(selectedCountryCode), children: "Print Country Worksheet" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mt: 2 }, children: "For EU OSS, use scheme EU_OSS and the jurisdiction summary CSV; for Canada, file GST/HST per CRA portal." })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mt: 2 }, children: "This packet mirrors common filings used by SaaS: US Sales Tax returns (state/county totals) and EU OSS VAT returns (member-state totals). Attach the CSV summaries and payments export when filing via your tax portal or provider." })
    ] }) }),
    tab === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "Revenue (USD)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", children: ((((_b = overview == null ? void 0 : overview.totals) == null ? void 0 : _b.revenue_cents) || 0) / 100).toLocaleString() })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "Tax Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", children: ((((_c = overview == null ? void 0 : overview.totals) == null ? void 0 : _c.tax_cents) || 0) / 100).toLocaleString() })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "Payments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", children: ((_d = overview == null ? void 0 : overview.totals) == null ? void 0 : _d.paymentsCount) || 0 })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "KYC Completed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", children: ((_e = overview == null ? void 0 : overview.kycCounts) == null ? void 0 : _e.COMPLETED) || 0 })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Recent Payments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Tax" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Jurisdiction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: ((overview == null ? void 0 : overview.recentPayments) || []).map((p) => {
            var _a2, _b2, _c2;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: new Date(p.createdAt).toLocaleDateString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.stripeInvoiceId }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: ((_a2 = p.amount) != null ? _a2 : 0) / 100 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
                (((_b2 = p.taxAmount) != null ? _b2 : 0) / 100).toFixed(2),
                " (",
                (((_c2 = p.taxRate) != null ? _c2 : 0) * 100).toFixed(2),
                "%)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.jurisdiction }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 1 }, children: p.stripeInvoiceId && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "View in Stripe Dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  color: "primary",
                  onClick: () => window.open(`https://dashboard.stripe.com/invoices/${p.stripeInvoiceId}`, "_blank"),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { fontSize: "small" })
                }
              ) }) }) })
            ] }, p.id);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Tax by Jurisdiction" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1, flexWrap: "wrap", children: (overview == null ? void 0 : overview.taxByJurisdiction) && Object.entries(overview.taxByJurisdiction).map(([j, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: `${j}: ${(v / 100).toLocaleString()}` }, j)) })
      ] })
    ] }),
    tab === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: { xs: "column", sm: "row" }, spacing: 2, sx: { mb: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "From (YYYY-MM-DD)", placeholder: "2025-01-01", value: from, onChange: (e) => setFrom(e.target.value), size: "small" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "To (YYYY-MM-DD)", placeholder: "2025-12-31", value: to, onChange: (e) => setTo(e.target.value), size: "small" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "contained", onClick: exportPayments, children: "Export CSV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outlined", onClick: fetchPayments, children: "Refresh" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Currency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Tax" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Jurisdiction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "User Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Residency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: payments.map((p) => {
          var _a2, _b2, _c2, _d2, _e2, _f;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: new Date(p.createdAt).toLocaleDateString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.stripeInvoiceId }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: ((_a2 = p.amount) != null ? _a2 : 0) / 100 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.currency }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              (((_b2 = p.taxAmount) != null ? _b2 : 0) / 100).toFixed(2),
              " (",
              (((_c2 = p.taxRate) != null ? _c2 : 0) * 100).toFixed(2),
              "%)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: p.taxJurisdiction }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: (_d2 = p.user) == null ? void 0 : _d2.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: (_f = (_e2 = p.user) == null ? void 0 : _e2.taxInformation) == null ? void 0 : _f.taxResidency }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [
              p.stripeInvoiceId && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "View in Stripe Dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  color: "primary",
                  onClick: () => window.open(`https://dashboard.stripe.com/invoices/${p.stripeInvoiceId}`, "_blank"),
                  sx: {
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    },
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, {})
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "View Payment Details", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  color: "info",
                  onClick: () => {
                    alert(`Payment Details for ${p.id}`);
                  },
                  sx: {
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    },
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Visibility, {})
                }
              ) })
            ] }) })
          ] }, p.id);
        }) })
      ] }) })
    ] }),
    tab === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Tax Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "By Jurisdiction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Jurisdiction" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Tax" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Taxable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Count" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (taxSummary == null ? void 0 : taxSummary.byJurisdiction) && Object.entries(taxSummary.byJurisdiction).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: k }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: ((v.tax_cents || 0) / 100).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: ((v.taxable_cents || 0) / 100).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: v.count })
            ] }, k)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "overline", children: "By Country" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Country" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Tax" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Taxable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Count" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (taxSummary == null ? void 0 : taxSummary.byCountry) && Object.entries(taxSummary.byCountry).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: k }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: ((v.tax_cents || 0) / 100).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: ((v.taxable_cents || 0) / 100).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: v.count })
            ] }, k)) })
          ] })
        ] })
      ] })
    ] }) }),
    tab === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "KYC Overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Completed At" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Nationality" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Residence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Company" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: kyc.map((u) => {
          var _a2, _b2, _c2, _d2, _e2;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: u.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: u.kycStatus }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: u.kycCompletedAt ? new Date(u.kycCompletedAt).toLocaleDateString() : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              (_a2 = u.complianceProfile) == null ? void 0 : _a2.firstName,
              " ",
              (_b2 = u.complianceProfile) == null ? void 0 : _b2.lastName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: (_c2 = u.complianceProfile) == null ? void 0 : _c2.nationality }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: (_d2 = u.complianceProfile) == null ? void 0 : _d2.countryOfResidence }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: (_e2 = u.businessProfile) == null ? void 0 : _e2.companyName })
          ] }, u.id);
        }) })
      ] })
    ] }) }),
    tab === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Compliance Events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Severity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Description" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e.eventType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e.severity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: e.description })
        ] }, e.id)) })
      ] })
    ] }) }),
    tab === 6 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Terms & Privacy Acceptance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Terms Version" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Terms Accepted At" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Privacy Version" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Privacy Accepted At" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: termsRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.termsVersionAccepted || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.termsAcceptedAt ? new Date(r.termsAcceptedAt).toLocaleString() : "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.privacyPolicyVersionAccepted || "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.privacyPolicyAcceptedAt ? new Date(r.privacyPolicyAcceptedAt).toLocaleString() : "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", onClick: () => __async(void 0, null, function* () {
            var _a2, _b2;
            const res = yield api.get(endpoints.accounting.userConsentHistory(r.id), { params: { includePII: false } });
            const rows = ((_b2 = (_a2 = res.data) == null ? void 0 : _a2.data) == null ? void 0 : _b2.consents) || [];
            const header = Object.keys(rows[0] || {}).join(",");
            const csv = [header, ...rows.map((x) => Object.values(x).map((v) => JSON.stringify(v != null ? v : "")).join(","))].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `consent_history_${r.email}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }), children: "Export History" }) })
        ] }, r.id)) })
      ] })
    ] }) })
  ] });
};
export {
  AccountingDashboard as default
};
