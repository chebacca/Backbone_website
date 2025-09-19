const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/firebase-BTFXMplb.js","assets/index.esm-zVCMB3Cx.js","assets/index.esm-CjtNHFZy.js","assets/index.esm-BMygn4u3.js","assets/UnifiedDataService-1nEfiWl8.js","assets/FirestoreCollectionManager-DXFNI81i.js","assets/mui-BbtiZaA3.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-rmDQXWB-.js","assets/LandingPage-BaczG_9z.js","assets/Navigation-BKvPZcbH.js","assets/Footer-05O2RJ_T.js","assets/LoginPage-DQj2T2C_.js","assets/index.esm-aV5ahHn5.js","assets/notistack.esm-DLh02w5s.js","assets/BridgeAuthPage-DE-tPGui.js","assets/RegisterPage-BT0S0c6k.js","assets/ForgotPasswordPage-Dak052bM.js","assets/ResetPasswordPage-LSVX9B_z.js","assets/EmailVerificationPage-DXTinw1E.js","assets/PricingPage-CwyRw5tY.js","assets/TermsPage--kxdcs6w.js","assets/PrivacyPolicyPage-CmTShcuo.js","assets/SlaPage-C1DK9Xcf.js","assets/CookiePolicyPage-DK9i2Wgy.js","assets/CheckoutPage-EWtgxaRE.js","assets/DashboardLayout-B5qxAptr.js","assets/DashboardOverview-D3jKMUwo.js","assets/MetricCard-DT0TWtTD.js","assets/useStreamlinedData-z4hJHRxn.js","assets/DashboardCloudProjectsBridge-CAyYUp32.js","assets/CloudProjectIntegration-BXrZIhO_.js","assets/UnifiedProjectCreationDialog-jRLoEvxk.js","assets/LicensesPage-CcwDGqBz.js","assets/security-dashboard-DE_GSU9Q.js","assets/AnalyticsPage-B588_nUt.js","assets/BillingPage-U6Cqs9vf.js","assets/StreamlinedBillingPage-BlTuQ5xF.js","assets/SettingsPage-BHijnGNs.js","assets/EnhancedTeamPage-D1ijF9HD.js","assets/TestStreamlinedHooks-z6Kg86ou.js","assets/DownloadsPage-C435_XEG.js","assets/DocumentationPage-DWlRMj4q.js","assets/SupportPage-CQke8NXX.js","assets/InviteAcceptPage-uPGVjSmI.js","assets/AdminDashboard-DjoAWoz3.js","assets/AccountingDashboard-CS0r8nB5.js","assets/NotFoundPage-C92zwDex.js","assets/StartupWorkflow-DnDI_y9a.js","assets/OfflineTestPage-Cm8FuIYD.js","assets/TestInviteDialog-pJfi3kQ_.js","assets/TestTeamMemberCreation-B1Wa8YlG.js","assets/TestTeamMemberCreationSimple-CLFjkX9-.js"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
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
var __await = function(promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __asyncGenerator = (__this, __arguments, generator) => {
  var resume = (k, v, yes, no) => {
    try {
      var x = generator[k](v), isAwait = (v = x.value) instanceof __await, done = x.done;
      Promise.resolve(isAwait ? v[0] : v).then((y) => isAwait ? resume(k === "return" ? k : "next", v[1] ? { done: y.done, value: y.value } : y, yes, no) : yes({ value: y, done })).catch((e) => resume("throw", e, yes, no));
    } catch (e) {
      no(e);
    }
  }, method = (k) => it[k] = (x) => new Promise((yes, no) => resume(k, x, yes, no)), it = {};
  return generator = generator.apply(__this, __arguments), it[__knownSymbol("asyncIterator")] = () => it, method("next"), method("throw"), method("return"), it;
};
var __yieldStar = (value) => {
  var obj = value[__knownSymbol("asyncIterator")], isAwait = false, method, it = {};
  if (obj == null) {
    obj = value[__knownSymbol("iterator")]();
    method = (k) => it[k] = (x) => obj[k](x);
  } else {
    obj = obj.call(value);
    method = (k) => it[k] = (v) => {
      if (isAwait) {
        isAwait = false;
        if (k === "throw") throw v;
        return v;
      }
      isAwait = true;
      return {
        done: false,
        value: new __await(new Promise((resolve) => {
          var x = obj[k](v);
          if (!(x instanceof Object)) __typeError("Object expected");
          resolve(x);
        }), 1)
      };
    };
  }
  return it[__knownSymbol("iterator")] = () => it, method("next"), "throw" in obj ? method("throw") : it.throw = (x) => {
    throw x;
  }, "return" in obj && method("return"), it;
};
var __forAwait = (obj, it, method) => (it = obj[__knownSymbol("asyncIterator")]) ? it.call(obj) : (obj = obj[__knownSymbol("iterator")](), it = {}, method = (key, fn) => (fn = obj[key]) && (it[key] = (arg) => new Promise((yes, no, done) => (arg = fn.call(obj, arg), done = arg.done, Promise.resolve(arg.value).then((value) => yes({ value, done }), no)))), method("next"), method("return"), it);
import { j as jsxRuntimeExports, cK as Backdrop, B as Box, C as CircularProgress, T as Typography, b as Container, c as Paper, cL as ErrorOutline, d as Alert, a as Button, R as RefreshIcon, bA as Home, aU as BugReport, cM as createTheme, cN as ThemeProvider, cO as CssBaseline } from "./mui-BbtiZaA3.js";
import { d as reactDomExports, r as reactExports, N as Navigate, b as React, i as Routes, j as Route, B as BrowserRouter } from "./vendor-Cu2L4Rr-.js";
import { E as Elements } from "./stripe-rmDQXWB-.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var client = {};
var m = reactDomExports;
{
  client.createRoot = m.createRoot;
  client.hydrateRoot = m.hydrateRoot;
}
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
const LoadingContext = reactExports.createContext(void 0);
const useLoading = () => {
  const context = reactExports.useContext(LoadingContext);
  if (context === void 0) {
    console.warn("useLoading called outside of LoadingProvider, returning default values");
    return {
      isLoading: false,
      setLoading: () => {
      },
      // No-op function
      loadingMessage: void 0,
      setLoadingMessage: () => {
      }
      // No-op function
    };
  }
  return context;
};
const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [loadingMessage, setLoadingMessage] = reactExports.useState();
  const setLoading = (loading) => {
    setIsLoading(loading);
    if (!loading) {
      setLoadingMessage(void 0);
    }
  };
  const contextValue = {
    isLoading,
    setLoading,
    loadingMessage,
    setLoadingMessage
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(LoadingContext.Provider, { value: contextValue, children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Backdrop,
      {
        sx: {
          color: "#fff",
          zIndex: (theme2) => theme2.zIndex.drawer + 1,
          backgroundColor: "rgba(10, 10, 10, 0.8)",
          backdropFilter: "blur(4px)"
        },
        open: isLoading,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { color: "primary", size: 60 }),
          loadingMessage && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { marginTop: 2, fontSize: "1.1rem" }, children: loadingMessage })
        ] })
      }
    )
  ] });
};
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString = typeOfTest("string");
const isFunction = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m2, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction(thing[iterator]);
const utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$1.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$1.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  AxiosError$1.call(axiosError, error.message, code, config, request, response);
  axiosError.cause = error;
  axiosError.name = error.name;
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
const httpAdapter = null;
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new FormData();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$1.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  if (utils$1.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
const FormData$1 = typeof FormData !== "undefined" ? FormData : null;
const Blob$1 = typeof Blob !== "undefined" ? Blob : null;
const platform$1 = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: Blob$1
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = __spreadValues(__spreadValues({}, utils), platform$1);
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), __spreadValues({
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    }
  }, options));
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config = this || defaults;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils$1.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + "=" + encodeURIComponent(value)];
      utils$1.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
      utils$1.isString(path) && cookie.push("path=" + path);
      utils$1.isString(domain) && cookie.push("domain=" + domain);
      secure === true && cookie.push("secure");
      document.cookie = cookie.join("; ");
    },
    read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL2, relativeURL) {
  return relativeURL ? baseURL2.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL2;
}
function buildFullPath(baseURL2, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL2 && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL2, requestedURL);
  }
  return requestedURL;
}
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? __spreadValues({}, thing) : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils$1.forEach(Object.keys(__spreadValues(__spreadValues({}, config1), config2)), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
const resolveConfig = (config) => {
  const newConfig = mergeConfig$1({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  let contentType;
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if ((contentType = headers.getContentType()) !== false) {
      const [type, ...tokens] = contentType ? contentType.split(";").map((token) => token.trim()).filter(Boolean) : [];
      headers.setContentType([type || "multipart/form-data", ...tokens].join("; "));
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError() {
      reject(new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request));
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = function(iterable, chunkSize) {
  return __asyncGenerator(this, null, function* () {
    try {
      for (var iter = __forAwait(readStream(iterable)), more, temp, error; more = !(temp = yield new __await(iter.next())).done; more = false) {
        const chunk = temp.value;
        yield* __yieldStar(streamChunk(chunk, chunkSize));
      }
    } catch (temp) {
      error = [temp];
    } finally {
      try {
        more && (temp = iter.return) && (yield new __await(temp.call(iter)));
      } finally {
        if (error)
          throw error[0];
      }
    }
  });
};
const readStream = function(stream) {
  return __asyncGenerator(this, null, function* () {
    if (stream[Symbol.asyncIterator]) {
      yield* __yieldStar(stream);
      return;
    }
    const reader = stream.getReader();
    try {
      for (; ; ) {
        const { done, value } = yield new __await(reader.read());
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      yield new __await(reader.cancel());
    }
  });
};
const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    pull(controller) {
      return __async(this, null, function* () {
        try {
          const { done: done2, value } = yield iterator2.next();
          if (done2) {
            _onFinish();
            controller.close();
            return;
          }
          let len = value.byteLength;
          if (onProgress) {
            let loadedBytes = bytes += len;
            onProgress(loadedBytes);
          }
          controller.enqueue(new Uint8Array(value));
        } catch (err) {
          _onFinish(err);
          throw err;
        }
      });
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const isFetchSupported = typeof fetch === "function" && typeof Request === "function" && typeof Response === "function";
const isReadableStreamSupported = isFetchSupported && typeof ReadableStream === "function";
const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : (str) => __async(void 0, null, function* () {
  return new Uint8Array(yield new Response(str).arrayBuffer());
}));
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const supportsRequestStream = isReadableStreamSupported && test(() => {
  let duplexAccessed = false;
  const hasContentType = new Request(platform.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      duplexAccessed = true;
      return "half";
    }
  }).headers.has("Content-Type");
  return duplexAccessed && !hasContentType;
});
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const supportsResponseStream = isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
const resolvers = {
  stream: supportsResponseStream && ((res) => res.body)
};
isFetchSupported && ((res) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
    !resolvers[type] && (resolvers[type] = utils$1.isFunction(res[type]) ? (res2) => res2[type]() : (_, config) => {
      throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
    });
  });
})(new Response());
const getBodyLength = (body) => __async(void 0, null, function* () {
  if (body == null) {
    return 0;
  }
  if (utils$1.isBlob(body)) {
    return body.size;
  }
  if (utils$1.isSpecCompliantForm(body)) {
    const _request = new Request(platform.origin, {
      method: "POST",
      body
    });
    return (yield _request.arrayBuffer()).byteLength;
  }
  if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
    return body.byteLength;
  }
  if (utils$1.isURLSearchParams(body)) {
    body = body + "";
  }
  if (utils$1.isString(body)) {
    return (yield encodeText(body)).byteLength;
  }
});
const resolveBodyLength = (headers, body) => __async(void 0, null, function* () {
  const length = utils$1.toFiniteNumber(headers.getContentLength());
  return length == null ? getBodyLength(body) : length;
});
const fetchAdapter = isFetchSupported && ((config) => __async(void 0, null, function* () {
  let {
    url,
    method,
    data,
    signal,
    cancelToken,
    timeout,
    onDownloadProgress,
    onUploadProgress,
    responseType,
    headers,
    withCredentials = "same-origin",
    fetchOptions
  } = resolveConfig(config);
  responseType = responseType ? (responseType + "").toLowerCase() : "text";
  let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
  let request;
  const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
    composedSignal.unsubscribe();
  });
  let requestContentLength;
  try {
    if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = yield resolveBodyLength(headers, data)) !== 0) {
      let _request = new Request(url, {
        method: "POST",
        body: data,
        duplex: "half"
      });
      let contentTypeHeader;
      if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
        headers.setContentType(contentTypeHeader);
      }
      if (_request.body) {
        const [onProgress, flush] = progressEventDecorator(
          requestContentLength,
          progressEventReducer(asyncDecorator(onUploadProgress))
        );
        data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
      }
    }
    if (!utils$1.isString(withCredentials)) {
      withCredentials = withCredentials ? "include" : "omit";
    }
    const isCredentialsSupported = "credentials" in Request.prototype;
    request = new Request(url, __spreadProps(__spreadValues({}, fetchOptions), {
      signal: composedSignal,
      method: method.toUpperCase(),
      headers: headers.normalize().toJSON(),
      body: data,
      duplex: "half",
      credentials: isCredentialsSupported ? withCredentials : void 0
    }));
    let response = yield fetch(request, fetchOptions);
    const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
    if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
      const options = {};
      ["status", "statusText", "headers"].forEach((prop) => {
        options[prop] = response[prop];
      });
      const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
      const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
        responseContentLength,
        progressEventReducer(asyncDecorator(onDownloadProgress), true)
      ) || [];
      response = new Response(
        trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
          flush && flush();
          unsubscribe && unsubscribe();
        }),
        options
      );
    }
    responseType = responseType || "text";
    let responseData = yield resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
    !isStreamResponse && unsubscribe && unsubscribe();
    return yield new Promise((resolve, reject) => {
      settle(resolve, reject, {
        data: responseData,
        headers: AxiosHeaders$1.from(response.headers),
        status: response.status,
        statusText: response.statusText,
        config,
        request
      });
    });
  } catch (err) {
    unsubscribe && unsubscribe();
    if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
      throw Object.assign(
        new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request),
        {
          cause: err.cause || err
        }
      );
    }
    throw AxiosError$1.from(err, err && err.code, config, request);
  }
}));
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: fetchAdapter
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
const adapters = {
  getAdapter: (adapters2) => {
    adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
    const { length } = adapters2;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters2[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === void 0) {
          throw new AxiosError$1(`Unknown adapter '${id}'`);
        }
      }
      if (adapter) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError$1(
        `There is no suitable adapter to dispatch the request ` + s,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter;
  },
  adapters: knownAdapters
};
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError$1(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders$1.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const VERSION$1 = "1.11.0";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators$1[type] = function validator2(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  request(configOrUrl, config) {
    return __async(this, null, function* () {
      try {
        return yield this._request(configOrUrl, config);
      } catch (err) {
        if (err instanceof Error) {
          let dummy = {};
          Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
          const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
          try {
            if (!err.stack) {
              err.stack = stack;
            } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
              err.stack += "\n" + stack;
            }
          } catch (e) {
          }
        }
        throw err;
      }
    });
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig$1(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i = 0;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url, config) {
    return this.request(mergeConfig$1(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
const getBaseURL = () => {
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  if (isLocalhost) {
    const apiUrl = "http://localhost:5001/backbone-logic/us-central1/api";
    console.log("[api] EMULATOR MODE: Using local Functions emulator");
    console.log(`[api] baseURL = ${apiUrl} mode = emulator (local development)`);
    return apiUrl;
  } else {
    const apiUrl = "https://us-central1-backbone-logic.cloudfunctions.net/api";
    console.log("[api] PRODUCTION MODE: Using Cloud Run API endpoint");
    console.log(`[api] baseURL = ${apiUrl} mode = production (web-only)`);
    return apiUrl;
  }
};
const baseURL = getBaseURL();
const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem("auth_token");
  },
  setAccessToken(token) {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  },
  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  },
  setRefreshToken(token) {
    if (token) localStorage.setItem("refresh_token", token);
    else localStorage.removeItem("refresh_token");
  },
  clearAll() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
  }
};
console.info("[api] baseURL =", baseURL, "mode = production (web-only)");
const createApiInstance = () => {
  const instance = axios.create({
    baseURL,
    timeout: 15e3,
    // Increased timeout for Firebase Functions
    headers: {
      "Content-Type": "application/json"
    }
  });
  instance.interceptors.request.use(
    (config) => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  let isRefreshing = false;
  let pendingRequests = [];
  const processQueue = (newToken) => {
    pendingRequests.forEach((cb) => cb(newToken));
    pendingRequests = [];
  };
  const refreshAccessToken = () => __async(void 0, null, function* () {
    var _a, _b, _c, _d;
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const res = yield axios.post(
        `${baseURL.replace(/\/$/, "")}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" }, timeout: 15e3 }
      );
      if (((_a = res.data) == null ? void 0 : _a.success) && ((_d = (_c = (_b = res.data) == null ? void 0 : _b.data) == null ? void 0 : _c.tokens) == null ? void 0 : _d.accessToken)) {
        const accessToken = res.data.data.tokens.accessToken;
        const nextRefresh = res.data.data.tokens.refreshToken;
        tokenStorage.setAccessToken(accessToken);
        if (nextRefresh) tokenStorage.setRefreshToken(nextRefresh);
        return { accessToken, refreshToken: nextRefresh };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
  instance.interceptors.response.use(
    (response) => response,
    (error) => __async(void 0, null, function* () {
      const originalRequest = error.config;
      if (!error.response || error.response.status !== 401) {
        return Promise.reject(error);
      }
      const url = (originalRequest.url || "").toString();
      const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/verify-2fa") || url.includes("/auth/refresh") || url.includes("/auth/register");
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }
      const isProfileRequest = url.includes("/auth/me") || url.includes("/auth/profile");
      if (isProfileRequest && !tokenStorage.getAccessToken()) {
        return Promise.reject(error);
      }
      if (originalRequest._retry) {
        if (tokenStorage.getAccessToken()) {
          tokenStorage.clearAll();
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }, 100);
        }
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            try {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              originalRequest._retry = true;
              resolve(instance(originalRequest));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      isRefreshing = true;
      const newTokens = yield refreshAccessToken();
      isRefreshing = false;
      if (!(newTokens == null ? void 0 : newTokens.accessToken)) {
        processQueue(null);
        if (tokenStorage.getAccessToken()) {
          tokenStorage.clearAll();
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }, 100);
        }
        return Promise.reject(error);
      }
      processQueue(newTokens.accessToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      originalRequest._retry = true;
      return instance(originalRequest);
    })
  );
  return instance;
};
const api = createApiInstance();
const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    var _a, _b, _c, _d;
    if (error.response) {
      return {
        message: ((_a = error.response.data) == null ? void 0 : _a.message) || ((_b = error.response.data) == null ? void 0 : _b.error) || "Server error occurred",
        status: error.response.status,
        code: (_c = error.response.data) == null ? void 0 : _c.code,
        details: (_d = error.response.data) == null ? void 0 : _d.details
      };
    } else if (error.request) {
      return {
        message: "Network error - please check your connection",
        status: 0
      };
    } else {
      return {
        message: error.message || "An unexpected error occurred"
      };
    }
  },
  // Create request with loading state
  withLoading: (request, setLoading) => __async(void 0, null, function* () {
    try {
      setLoading == null ? void 0 : setLoading(true);
      const response = yield request();
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || response.data.error || "Request failed");
      }
    } catch (error) {
      throw apiUtils.handleError(error);
    } finally {
      setLoading == null ? void 0 : setLoading(false);
    }
  }),
  // Upload file with progress
  uploadFile: (endpoint, file, onProgress) => __async(void 0, null, function* () {
    const formData = new FormData();
    formData.append("file", file);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(progressEvent.loaded * 100 / progressEvent.total);
          onProgress(progress);
        }
      }
    };
    const response = yield api.post(endpoint, formData, config);
    return response.data;
  }),
  // Download file
  downloadFile: (url, filename) => __async(void 0, null, function* () {
    const response = yield api.get(url, {
      responseType: "blob"
    });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  })
};
const endpoints = {
  // Auth endpoints
  auth: {
    login: () => "auth/login",
    verify2FA: () => "auth/verify-2fa",
    register: () => "auth/register",
    logout: () => "auth/logout",
    profile: () => "auth/me",
    refresh: () => "auth/refresh",
    verifyEmail: (token) => `auth/verify-email/${token}`,
    resendVerification: () => "auth/resend-verification",
    forgotPassword: () => "auth/forgot-password",
    resetPassword: (token) => `auth/reset-password/${token}`,
    validateToken: () => "auth/validate-token",
    twoFASetupInitiate: () => "auth/2fa/setup/initiate",
    twoFASetupVerify: () => "auth/2fa/setup/verify",
    twoFADisable: () => "auth/2fa/disable",
    oauthGoogle: () => "auth/oauth/google",
    oauthApple: () => "auth/oauth/apple",
    changePassword: () => "auth/change-password"
  },
  // Payment endpoints
  payments: {
    pricing: () => "payments/pricing",
    createSubscription: () => "payments/create-subscription",
    history: () => "payments/history",
    details: (paymentId) => `payments/${paymentId}`,
    cancelSubscription: (subscriptionId) => `payments/cancel-subscription/${subscriptionId}`,
    updatePaymentMethod: (subscriptionId) => `payments/payment-method/${subscriptionId}`,
    calculateTax: () => "payments/calculate-tax",
    webhook: () => "payments/webhook"
  },
  // Invoice endpoints
  invoices: {
    list: () => "invoices",
    details: (invoiceId) => `invoices/${invoiceId}`,
    create: () => "invoices",
    updateStatus: (invoiceId) => `invoices/${invoiceId}/status`,
    delete: (invoiceId) => `invoices/${invoiceId}`
  },
  // License endpoints
  licenses: {
    myLicenses: () => "licenses/my-licenses",
    activate: () => "licenses/activate",
    deactivate: () => "licenses/deactivate",
    validate: () => "licenses/validate",
    details: (licenseId) => `licenses/${licenseId}`,
    assign: (licenseId) => `licenses/${licenseId}/assign`,
    downloadSDK: (licenseKey) => `licenses/download-sdk/${licenseKey}`,
    downloadSpecificSDK: (sdkId, licenseKey) => `licenses/download-sdk/${sdkId}/${licenseKey}`,
    analytics: (licenseId) => `licenses/analytics${licenseId ? `/${licenseId}` : ""}`,
    transfer: () => "licenses/transfer",
    bulkCreate: () => "licenses/bulk/create",
    sdkVersions: () => "licenses/sdk/versions",
    reportIssue: () => "licenses/report-issue",
    usage: (licenseKey) => `licenses/usage/${licenseKey}`
  },
  // Subscription endpoints
  subscriptions: {
    mySubscriptions: () => "subscriptions/my-subscriptions",
    details: (subscriptionId) => `subscriptions/${subscriptionId}`,
    update: (subscriptionId) => `subscriptions/${subscriptionId}`,
    cancel: (subscriptionId) => `subscriptions/${subscriptionId}/cancel`,
    reactivate: (subscriptionId) => `subscriptions/${subscriptionId}/reactivate`,
    invoices: (subscriptionId) => `subscriptions/${subscriptionId}/invoices`,
    usage: (subscriptionId) => `subscriptions/${subscriptionId}/usage`,
    updatePaymentMethod: (subscriptionId) => `subscriptions/${subscriptionId}/payment-method`,
    billingHistory: (subscriptionId) => `subscriptions/${subscriptionId}/billing-history`,
    previewChanges: (subscriptionId) => `subscriptions/${subscriptionId}/preview-changes`,
    renewal: (subscriptionId) => `subscriptions/${subscriptionId}/renewal`,
    addSeats: (subscriptionId) => `subscriptions/${subscriptionId}/add-seats`
  },
  // Organization endpoints (Pro/Enterprise team management)
  organizations: {
    my: () => "organizations/my",
    context: () => "organizations/my/context",
    invite: (orgId) => `organizations/${orgId}/invitations`,
    acceptInvitation: () => "organizations/invitations/accept",
    removeMember: (orgId, memberId) => `organizations/${orgId}/members/${memberId}/remove`,
    updateMember: (orgId, memberId) => `organizations/${orgId}/members/${memberId}`,
    setMemberPassword: (orgId, memberId) => `organizations/${orgId}/members/${memberId}/password`
  },
  // Team Member endpoints (automated creation and management)
  teamMembers: {
    create: () => "team-members/create",
    bulkCreate: () => "team-members/bulk-create",
    resetPassword: (id) => `team-members/${id}/reset-password`,
    verify: (id) => `team-members/${id}/verify`,
    disable: (id) => `team-members/${id}/disable`,
    enable: (id) => `team-members/${id}/enable`,
    auth: {
      login: () => "team-members/auth/login"
    }
  },
  // User endpoints
  users: {
    updateBillingAddress: () => "users/billing-address",
    updateTaxInformation: () => "users/tax-information",
    updateBusinessProfile: () => "users/business-profile",
    kycVerify: () => "users/kyc/verify",
    consent: () => "users/consent",
    consentHistory: () => "users/consent-history",
    auditLog: () => "users/audit-log",
    exportData: () => "users/export-data",
    requestDeletion: () => "users/request-deletion",
    statistics: () => "users/statistics",
    notifications: () => "users/notifications"
  },
  // Admin endpoints
  admin: {
    dashboardStats: () => "admin/dashboard-stats",
    users: () => "admin/users",
    userDetails: (userId) => `admin/users/${userId}`,
    updateUser: (userId) => `admin/users/${userId}`,
    subscriptions: () => "admin/subscriptions",
    licenses: () => "admin/licenses",
    revokeLicense: (licenseId) => `admin/licenses/${licenseId}/revoke`,
    createLicense: () => "admin/licenses/create",
    complianceEvents: () => "admin/compliance-events",
    resolveComplianceEvent: (eventId) => `admin/compliance-events/${eventId}/resolve`,
    paymentAnalytics: () => "admin/analytics/payments",
    licenseAnalytics: () => "admin/analytics/licenses",
    generateReport: () => "admin/reports/compliance",
    createEnterpriseCustomer: () => "admin/enterprise/customers",
    systemHealth: () => "admin/system/health",
    payments: () => "admin/payments",
    paymentDetails: (paymentId) => `admin/payments/${paymentId}`,
    companyFilingGet: () => "admin/settings/company-filing",
    companyFilingSave: () => "admin/settings/company-filing"
  },
  // Dataset endpoints
  datasets: {
    list: () => "datasets",
    create: () => "datasets",
    details: (datasetId) => `datasets/${datasetId}`,
    update: (datasetId) => `datasets/${datasetId}`,
    remove: (datasetId) => `datasets/${datasetId}`,
    projectDatasets: (projectId) => `datasets/project/${projectId}`,
    assignToProject: (projectId, datasetId) => `datasets/project/${projectId}/${datasetId}`,
    unassignFromProject: (projectId, datasetId) => `datasets/project/${projectId}/${datasetId}`
  },
  // Accounting endpoints
  accounting: {
    payments: () => "accounting/payments",
    exportPayments: () => "accounting/payments/export",
    kyc: () => "accounting/kyc",
    consentsLatest: () => "accounting/consents/latest",
    userConsentHistory: (userId) => `accounting/users/${userId}/consent-history`
  },
  // Webhook endpoints
  webhooks: {
    stripe: () => "/webhooks/stripe",
    sendgrid: () => "/webhooks/sendgrid",
    test: () => "/webhooks/test",
    health: () => "/webhooks/health",
    retryFailed: () => "/webhooks/retry-failed"
  }
};
const authService = {
  /**
   * Login user
   */
  login(email, password) {
    return __async(this, null, function* () {
      try {
        const { auth } = yield __vitePreload(() => __async(this, null, function* () {
          const { auth: auth2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
          return { auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const { signInWithEmailAndPassword } = yield __vitePreload(() => __async(this, null, function* () {
          const { signInWithEmailAndPassword: signInWithEmailAndPassword2 } = yield import("./index.esm-BMygn4u3.js");
          return { signInWithEmailAndPassword: signInWithEmailAndPassword2 };
        }), true ? __vite__mapDeps([3,1]) : void 0);
        const userCredential = yield signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const { loadUserFromFirestore } = yield __vitePreload(() => __async(this, null, function* () {
          const { loadUserFromFirestore: loadUserFromFirestore2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
          return { loadUserFromFirestore: loadUserFromFirestore2 };
        }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const userData = yield loadUserFromFirestore(firebaseUser);
        return {
          user: userData,
          token: yield firebaseUser.getIdToken(),
          // Firebase ID token
          refreshToken: yield firebaseUser.getIdToken(true)
          // Force refresh
        };
      } catch (error) {
        console.error("Firebase Auth login failed:", error);
        throw new Error(error.message || "Login failed");
      }
    });
  },
  /**
   * Login with Google ID token
   */
  loginWithGoogle(idToken) {
    return __async(this, null, function* () {
      var _a, _b;
      const response = yield api.post(endpoints.auth.oauthGoogle(), { idToken });
      if (!response.data.success) {
        throw new Error(response.data.message || "Google login failed");
      }
      const data = response.data.data;
      return {
        user: data.user,
        token: (_a = data.tokens) == null ? void 0 : _a.accessToken,
        refreshToken: (_b = data.tokens) == null ? void 0 : _b.refreshToken
      };
    });
  },
  /**
   * Login with Apple ID token
   */
  loginWithApple(idToken) {
    return __async(this, null, function* () {
      var _a, _b;
      const response = yield api.post(endpoints.auth.oauthApple(), { idToken });
      if (!response.data.success) {
        throw new Error(response.data.message || "Apple login failed");
      }
      const data = response.data.data;
      return {
        user: data.user,
        token: (_a = data.tokens) == null ? void 0 : _a.accessToken,
        refreshToken: (_b = data.tokens) == null ? void 0 : _b.refreshToken
      };
    });
  },
  verify2FA(interimToken, code) {
    return __async(this, null, function* () {
      var _a, _b;
      const response = yield api.post(
        endpoints.auth.verify2FA(),
        { token: code },
        { headers: { Authorization: `Bearer ${interimToken}` } }
      );
      if (response.data.success) {
        const data = response.data.data;
        return {
          user: data.user,
          token: (_a = data.tokens) == null ? void 0 : _a.accessToken,
          refreshToken: (_b = data.tokens) == null ? void 0 : _b.refreshToken
        };
      } else {
        throw new Error(response.data.message || "2FA verification failed");
      }
    });
  },
  twoFASetupInitiate() {
    return __async(this, null, function* () {
      const response = yield api.post(endpoints.auth.twoFASetupInitiate());
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to initiate 2FA");
    });
  },
  twoFASetupVerify(code) {
    return __async(this, null, function* () {
      const response = yield api.post(endpoints.auth.twoFASetupVerify(), { token: code });
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to enable 2FA");
    });
  },
  twoFADisable() {
    return __async(this, null, function* () {
      const response = yield api.post(endpoints.auth.twoFADisable());
      if (!response.data.success) throw new Error(response.data.message || "Failed to disable 2FA");
    });
  },
  changePassword(currentPassword, newPassword) {
    return __async(this, null, function* () {
      const response = yield api.put(endpoints.auth.changePassword(), { currentPassword, newPassword });
      if (response.data.success) {
        return { message: response.data.message || "Password changed successfully" };
      }
      throw new Error(response.data.message || "Failed to change password");
    });
  },
  /**
   * Register new user
   */
  register(userData) {
    return __async(this, null, function* () {
      var _a, _b;
      const response = yield api.post(endpoints.auth.register(), userData);
      if (response.data.success) {
        const data = response.data.data;
        return {
          user: data.user,
          token: ((_a = data.tokens) == null ? void 0 : _a.accessToken) || data.token,
          refreshToken: (_b = data.tokens) == null ? void 0 : _b.refreshToken,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    });
  },
  /**
   * Logout user
   */
  logout() {
    return __async(this, null, function* () {
      try {
        yield api.post(endpoints.auth.logout());
      } catch (error) {
        console.warn("Logout server call failed:", error);
      }
    });
  },
  /**
   * Get current user profile
   */
  getProfile() {
    return __async(this, null, function* () {
      const response = yield api.get(endpoints.auth.profile());
      if (response.data.success) {
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || "Failed to get profile");
      }
    });
  },
  /**
   * Validate token
   */
  validateToken(token) {
    return __async(this, null, function* () {
      const response = yield api.get(endpoints.auth.profile(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || "Token validation failed");
      }
    });
  },
  /**
   * Verify email with token
   */
  verifyEmail(token) {
    return __async(this, null, function* () {
      const response = yield api.get(endpoints.auth.verifyEmail(token));
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Email verification failed");
      }
    });
  },
  /**
   * Resend email verification
   */
  resendVerification() {
    return __async(this, null, function* () {
      const response = yield api.post(endpoints.auth.resendVerification());
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to resend verification");
      }
    });
  },
  /**
   * Request password reset
   */
  forgotPassword(email) {
    return __async(this, null, function* () {
      const response = yield api.post(endpoints.auth.forgotPassword(), {
        email
      });
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to send reset email");
      }
    });
  },
  /**
   * Reset password with token
   */
  resetPassword(token, password) {
    return __async(this, null, function* () {
      const response = yield api.post(endpoints.auth.resetPassword(token), {
        password
      });
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Password reset failed");
      }
    });
  },
  /**
   * Update user profile
   */
  updateProfile(updates) {
    return __async(this, null, function* () {
      const response = yield api.put(endpoints.auth.profile(), updates);
      if (response.data.success) {
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || "Profile update failed");
      }
    });
  },
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("auth_user");
    return !!(token && user);
  },
  /**
   * Get stored user data
   */
  getStoredUser() {
    try {
      const userStr = localStorage.getItem("auth_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      return null;
    }
  },
  /**
   * Get stored token
   */
  getStoredToken() {
    return localStorage.getItem("auth_token");
  },
  getStoredRefreshToken() {
    return localStorage.getItem("refresh_token");
  },
  /**
   * Clear stored auth data
   */
  clearStoredAuth() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
  }
};
const authService$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  authService
}, Symbol.toStringTag, { value: "Module" }));
const AuthContext = reactExports.createContext(void 0);
const useAuth = () => {
  const context = reactExports.useContext(AuthContext);
  if (context === void 0) {
    console.warn("useAuth called outside of AuthProvider, returning default values");
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      token: null,
      login: () => __async(void 0, null, function* () {
        throw new Error("Auth not initialized");
      }),
      register: () => __async(void 0, null, function* () {
        throw new Error("Auth not initialized");
      }),
      logout: () => {
      },
      refreshUser: () => __async(void 0, null, function* () {
      }),
      updateUser: () => {
      },
      loginWithGoogle: () => __async(void 0, null, function* () {
        throw new Error("Auth not initialized");
      }),
      loginWithApple: () => __async(void 0, null, function* () {
        throw new Error("Auth not initialized");
      }),
      hasActiveLicense: () => false,
      hasActiveSubscription: () => false,
      getTempCredentials: () => null
    };
  }
  return context;
};
const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = reactExports.useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  });
  const { setLoading } = useLoading();
  reactExports.useEffect(() => {
    const initializeAuth = () => __async(void 0, null, function* () {
      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("auth_user");
        if (token && userStr) {
          let userData;
          try {
            userData = JSON.parse(userStr);
          } catch (parseError) {
            console.warn("Failed to parse stored user data, clearing invalid data");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            setAuthState((prev) => __spreadProps(__spreadValues({}, prev), { isLoading: false }));
            return;
          }
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            token
          });
          try {
            console.log("🔑 [Auth] Validating stored token with server...");
            const validatedUser = yield authService.validateToken(token);
            setAuthState({
              user: validatedUser,
              isAuthenticated: true,
              isLoading: false,
              token
            });
            localStorage.setItem("auth_user", JSON.stringify(validatedUser));
            try {
              console.log("🔑 [Auth] Restoring Firebase Auth session for existing user...");
              if (!validatedUser || !validatedUser.email) {
                console.warn("⚠️ [Auth] Invalid validatedUser object - missing email property:", validatedUser);
                return;
              }
              const { tryRestoreFirebaseSession, isEmailAuthenticated } = yield __vitePreload(() => __async(void 0, null, function* () {
                const { tryRestoreFirebaseSession: tryRestoreFirebaseSession2, isEmailAuthenticated: isEmailAuthenticated2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
                return { tryRestoreFirebaseSession: tryRestoreFirebaseSession2, isEmailAuthenticated: isEmailAuthenticated2 };
              }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
              const firebaseSessionRestored = yield tryRestoreFirebaseSession(validatedUser.email);
              if (firebaseSessionRestored) {
                console.log("✅ [Auth] Firebase Auth session restored successfully");
              } else if (isEmailAuthenticated(validatedUser.email)) {
                console.log("✅ [Auth] Firebase Auth user already authenticated:", validatedUser.email);
              } else {
                const tempCredentials = localStorage.getItem("temp_credentials");
                if (tempCredentials) {
                  try {
                    const { email, password } = JSON.parse(tempCredentials);
                    const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
                      const { auth: auth2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
                      return { auth: auth2 };
                    }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
                    const { signInWithEmailAndPassword } = yield __vitePreload(() => __async(void 0, null, function* () {
                      const { signInWithEmailAndPassword: signInWithEmailAndPassword2 } = yield import("./index.esm-BMygn4u3.js");
                      return { signInWithEmailAndPassword: signInWithEmailAndPassword2 };
                    }), true ? __vite__mapDeps([3,1]) : void 0);
                    yield signInWithEmailAndPassword(auth, email, password);
                    console.log("✅ [Auth] Firebase Auth restored with stored credentials");
                  } catch (firebaseError) {
                    console.warn("⚠️ [Auth] Failed to restore Firebase Auth with stored credentials:", firebaseError);
                  }
                }
              }
            } catch (firebaseError) {
              console.warn("⚠️ [Auth] Firebase Auth restoration failed:", firebaseError);
            }
          } catch (error) {
            console.error("❌ [Auth] Token validation failed:", error);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("temp_credentials");
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              token: null
            });
          }
        } else {
          console.log("🔑 [Auth] No stored auth data, setting loading to false");
          setAuthState((prev) => __spreadProps(__spreadValues({}, prev), { isLoading: false }));
          try {
            const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
              const { auth: auth2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
              return { auth: auth2 };
            }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
            const { onAuthStateChanged } = yield __vitePreload(() => __async(void 0, null, function* () {
              const { onAuthStateChanged: onAuthStateChanged2 } = yield import("./index.esm-BMygn4u3.js");
              return { onAuthStateChanged: onAuthStateChanged2 };
            }), true ? __vite__mapDeps([3,1]) : void 0);
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => __async(void 0, null, function* () {
              var _a;
              if (firebaseUser) {
                console.log("🔑 [Auth] Firebase Auth user detected during initialization:", firebaseUser.email);
                try {
                  const { loadUserFromFirestore } = yield __vitePreload(() => __async(void 0, null, function* () {
                    const { loadUserFromFirestore: loadUserFromFirestore2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
                    return { loadUserFromFirestore: loadUserFromFirestore2 };
                  }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
                  const userProfile = yield loadUserFromFirestore(firebaseUser);
                  setAuthState({
                    user: userProfile,
                    isAuthenticated: true,
                    isLoading: false,
                    token: null
                    // No API token needed in web-only mode
                  });
                  localStorage.setItem("auth_user", JSON.stringify(userProfile));
                  console.log("✅ [Auth] Updated auth state with Firestore user data during init:", userProfile.email);
                } catch (profileError) {
                  console.warn("⚠️ [Auth] Failed to get user profile from Firestore during init:", profileError);
                  const fallbackUser = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    name: firebaseUser.displayName || ((_a = firebaseUser.email) == null ? void 0 : _a.split("@")[0]) || "User",
                    role: "USER",
                    firebaseUid: firebaseUser.uid
                  };
                  setAuthState({
                    user: fallbackUser,
                    isAuthenticated: true,
                    isLoading: false,
                    token: null
                  });
                }
              }
            }));
            return () => unsubscribe();
          } catch (firebaseError) {
            console.warn("⚠️ [Auth] Firebase Auth check failed:", firebaseError);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
      }
    });
    initializeAuth();
  }, []);
  reactExports.useEffect(() => {
    let unsubscribe;
    const setupFirebaseAuthListener = () => __async(void 0, null, function* () {
      try {
        const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { auth: auth2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
          return { auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const { onAuthStateChanged } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { onAuthStateChanged: onAuthStateChanged2 } = yield import("./index.esm-BMygn4u3.js");
          return { onAuthStateChanged: onAuthStateChanged2 };
        }), true ? __vite__mapDeps([3,1]) : void 0);
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => __async(void 0, null, function* () {
          var _a;
          if (firebaseUser) {
            console.log("🔑 [Auth] Firebase Auth user detected, updating local state:", firebaseUser.email);
            try {
              const { unifiedDataService } = yield __vitePreload(() => __async(void 0, null, function* () {
                const { unifiedDataService: unifiedDataService2 } = yield import("./UnifiedDataService-1nEfiWl8.js");
                return { unifiedDataService: unifiedDataService2 };
              }), true ? __vite__mapDeps([4,2,1,5,0,3,6,7,8]) : void 0);
              unifiedDataService.clearUserCache(firebaseUser.uid);
              console.log("🧹 [Auth] Cleared UnifiedDataService cache for new user");
            } catch (cacheError) {
              console.warn("⚠️ [Auth] Failed to clear UnifiedDataService cache:", cacheError);
            }
            if (!authState.user || !authState.isAuthenticated) {
              try {
                console.log("🔍 [Auth] Loading user data from Firestore for:", firebaseUser.email);
                const { loadUserFromFirestore } = yield __vitePreload(() => __async(void 0, null, function* () {
                  const { loadUserFromFirestore: loadUserFromFirestore2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
                  return { loadUserFromFirestore: loadUserFromFirestore2 };
                }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
                const userProfile = yield loadUserFromFirestore(firebaseUser);
                setAuthState((prev) => __spreadProps(__spreadValues({}, prev), {
                  user: userProfile,
                  isAuthenticated: true,
                  isLoading: false
                }));
                localStorage.setItem("auth_user", JSON.stringify(userProfile));
                console.log("✅ [Auth] Updated auth state with complete Firestore user data:", userProfile.email);
              } catch (firestoreError) {
                console.warn("⚠️ [Auth] Failed to load user data from Firestore:", firestoreError);
                const fallbackUser = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  name: firebaseUser.displayName || ((_a = firebaseUser.email) == null ? void 0 : _a.split("@")[0]) || "User",
                  role: "USER",
                  firebaseUid: firebaseUser.uid
                };
                setAuthState((prev) => __spreadProps(__spreadValues({}, prev), {
                  user: fallbackUser,
                  isAuthenticated: true,
                  isLoading: false
                }));
              }
            } else {
              setAuthState((prev) => __spreadProps(__spreadValues({}, prev), {
                user: prev.user ? __spreadProps(__spreadValues({}, prev.user), { firebaseUid: firebaseUser.uid }) : prev.user,
                isAuthenticated: true
              }));
            }
          } else if (!firebaseUser && authState.isAuthenticated) {
            console.log("🔑 [Auth] Firebase Auth user signed out, updating local state");
            setAuthState((prev) => __spreadProps(__spreadValues({}, prev), {
              isAuthenticated: false,
              user: null
            }));
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("temp_credentials");
            try {
              const { unifiedDataService } = yield __vitePreload(() => __async(void 0, null, function* () {
                const { unifiedDataService: unifiedDataService2 } = yield import("./UnifiedDataService-1nEfiWl8.js");
                return { unifiedDataService: unifiedDataService2 };
              }), true ? __vite__mapDeps([4,2,1,5,0,3,6,7,8]) : void 0);
              unifiedDataService.clearAllCache();
              console.log("🧹 [Auth] Cleared all UnifiedDataService cache on sign out");
            } catch (cacheError) {
              console.warn("⚠️ [Auth] Failed to clear UnifiedDataService cache on sign out:", cacheError);
            }
          }
        }));
      } catch (error) {
        console.warn("⚠️ [Auth] Failed to setup Firebase Auth listener:", error);
      }
    });
    setupFirebaseAuthListener();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authState.isAuthenticated]);
  const login = (email, password) => __async(void 0, null, function* () {
    var _a;
    setLoading(true);
    try {
      const response = yield authService.login(email, password);
      if ((response == null ? void 0 : response.requires2FA) && (response == null ? void 0 : response.interimToken)) {
        throw { requires2FA: true, interimToken: response.interimToken };
      }
      localStorage.setItem("auth_token", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refresh_token", response.refreshToken);
      }
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      try {
        console.log("🔑 [Auth] Attempting Firebase Auth authentication for email/password user...");
        const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { auth: auth2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
          return { auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const { signInWithEmailAndPassword } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { signInWithEmailAndPassword: signInWithEmailAndPassword2 } = yield import("./index.esm-BMygn4u3.js");
          return { signInWithEmailAndPassword: signInWithEmailAndPassword2 };
        }), true ? __vite__mapDeps([3,1]) : void 0);
        yield signInWithEmailAndPassword(auth, email, password);
        console.log("✅ [Auth] Successfully authenticated with Firebase Auth for email/password user");
        const firebaseUid = (_a = auth.currentUser) == null ? void 0 : _a.uid;
        if (firebaseUid) {
          response.user.firebaseUid = firebaseUid;
          console.log("🔗 [Auth] Stored Firebase UID for email/password user:", firebaseUid);
        }
      } catch (firebaseError) {
        if (firebaseError.code === "auth/user-not-found") {
          console.log("ℹ️ [Auth] User not found in Firebase Auth - this is expected for some users");
          console.log("ℹ️ [Auth] User will still have access to backend API but limited Firestore access");
        } else if (firebaseError.code === "auth/invalid-credential") {
          console.log("ℹ️ [Auth] Invalid credentials for Firebase Auth - user may not have Firebase Auth account");
          console.log("ℹ️ [Auth] User will still have access to backend API but limited Firestore access");
        } else if (firebaseError.code === "auth/wrong-password") {
          console.log("ℹ️ [Auth] Wrong password for Firebase Auth - user may not have Firebase Auth account");
          console.log("ℹ️ [Auth] User will still have access to backend API but limited Firestore access");
        } else {
          console.error("❌ [Auth] Unexpected Firebase Auth error:", firebaseError.code, firebaseError.message);
          console.warn("⚠️ [Auth] Firestore access will be limited without Firebase Auth");
        }
      }
      try {
        const { unifiedDataService } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { unifiedDataService: unifiedDataService2 } = yield import("./UnifiedDataService-1nEfiWl8.js");
          return { unifiedDataService: unifiedDataService2 };
        }), true ? __vite__mapDeps([4,2,1,5,0,3,6,7,8]) : void 0);
        unifiedDataService.clearAllCache();
        console.log("🧹 [Auth] Cleared UnifiedDataService cache for new login");
      } catch (cacheError) {
        console.warn("⚠️ [Auth] Failed to clear UnifiedDataService cache for new login:", cacheError);
      }
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
        // Store temporary credentials for Firebase Auth restoration
        tempCredentials: { email, password }
      });
      localStorage.setItem("temp_credentials", JSON.stringify({ email, password }));
      if (response == null ? void 0 : response.requiresLegalAcceptance) {
        localStorage.setItem("legal_acceptance_required", "true");
      } else {
        localStorage.removeItem("legal_acceptance_required");
      }
      return response.user;
    } catch (error) {
      setAuthState((prev) => __spreadProps(__spreadValues({}, prev), { isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
  });
  const loginWithGoogle = (idToken) => __async(void 0, null, function* () {
    var _a;
    setLoading(true);
    try {
      const response = yield authService.loginWithGoogle(idToken);
      localStorage.setItem("auth_token", response.token);
      if (response.refreshToken) localStorage.setItem("refresh_token", response.refreshToken);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      try {
        console.log("🔑 [Auth] Authenticating with Firebase Auth for Google user...");
        const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { auth: auth2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
          return { auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const { signInWithEmailAndPassword } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { signInWithEmailAndPassword: signInWithEmailAndPassword2 } = yield import("./index.esm-BMygn4u3.js");
          return { signInWithEmailAndPassword: signInWithEmailAndPassword2 };
        }), true ? __vite__mapDeps([3,1]) : void 0);
        if (response.user.email) {
          try {
            yield signInWithEmailAndPassword(auth, response.user.email, "google-user-temp-password");
            console.log("✅ [Auth] Successfully authenticated with Firebase Auth for Google user");
            const firebaseUid = (_a = auth.currentUser) == null ? void 0 : _a.uid;
            if (firebaseUid) {
              response.user.firebaseUid = firebaseUid;
              console.log("🔗 [Auth] Stored Firebase UID for Google user:", firebaseUid);
            }
          } catch (firebaseError) {
            console.warn("⚠️ [Auth] Failed to authenticate with Firebase Auth for Google user:", firebaseError);
            console.log("ℹ️ [Auth] Firestore access may be limited without Firebase Auth");
          }
        }
      } catch (firebaseError) {
        console.warn("⚠️ [Auth] Failed to authenticate with Firebase Auth for Google user:", firebaseError);
        console.log("ℹ️ [Auth] Firestore access may be limited without Firebase Auth");
      }
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
        // Store temporary credentials for Firebase Auth (if available)
        tempCredentials: response.user.email ? { email: response.user.email, password: "google-user-temp-password" } : void 0
      });
      localStorage.removeItem("legal_acceptance_required");
      return response.user;
    } catch (error) {
      setAuthState((prev) => __spreadProps(__spreadValues({}, prev), { isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
  });
  const loginWithApple = (idToken) => __async(void 0, null, function* () {
    var _a;
    setLoading(true);
    try {
      const response = yield authService.loginWithApple(idToken);
      localStorage.setItem("auth_token", response.token);
      if (response.refreshToken) localStorage.setItem("refresh_token", response.refreshToken);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      try {
        console.log("🔑 [Auth] Authenticating with Firebase Auth for Apple user...");
        const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { auth: auth2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
          return { auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const { signInWithEmailAndPassword } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { signInWithEmailAndPassword: signInWithEmailAndPassword2 } = yield import("./index.esm-BMygn4u3.js");
          return { signInWithEmailAndPassword: signInWithEmailAndPassword2 };
        }), true ? __vite__mapDeps([3,1]) : void 0);
        if (response.user.email) {
          try {
            yield signInWithEmailAndPassword(auth, response.user.email, "apple-user-temp-password");
            console.log("✅ [Auth] Successfully authenticated with Firebase Auth for Apple user");
            const firebaseUid = (_a = auth.currentUser) == null ? void 0 : _a.uid;
            if (firebaseUid) {
              response.user.firebaseUid = firebaseUid;
              console.log("🔗 [Auth] Stored Firebase UID for Apple user:", firebaseUid);
            }
          } catch (firebaseError) {
            console.warn("⚠️ [Auth] Failed to authenticate with Firebase Auth for Apple user:", firebaseError);
            console.log("ℹ️ [Auth] Firestore access may be limited without Firebase Auth");
          }
        }
      } catch (firebaseError) {
        console.warn("⚠️ [Auth] Failed to authenticate with Firebase Auth for Apple user:", firebaseError);
        console.log("ℹ️ [Auth] Firestore access may be limited without Firebase Auth");
      }
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
        // Store temporary credentials for Firebase Auth (if available)
        tempCredentials: response.user.email ? { email: response.user.email, password: "apple-user-temp-password" } : void 0
      });
      localStorage.removeItem("legal_acceptance_required");
      return response.user;
    } catch (error) {
      setAuthState((prev) => __spreadProps(__spreadValues({}, prev), { isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
  });
  const register = (userData) => __async(void 0, null, function* () {
    setLoading(true);
    try {
      const response = yield authService.register(userData);
      localStorage.setItem("auth_token", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refresh_token", response.refreshToken);
      }
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token
      });
      localStorage.removeItem("legal_acceptance_required");
    } catch (error) {
      setAuthState((prev) => __spreadProps(__spreadValues({}, prev), { isLoading: false }));
      throw error;
    } finally {
      setLoading(false);
    }
  });
  const logout = () => __async(void 0, null, function* () {
    try {
      const { unifiedDataService } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { unifiedDataService: unifiedDataService2 } = yield import("./UnifiedDataService-1nEfiWl8.js");
        return { unifiedDataService: unifiedDataService2 };
      }), true ? __vite__mapDeps([4,2,1,5,0,3,6,7,8]) : void 0);
      unifiedDataService.clearAllCache();
      console.log("🧹 [Auth] Cleared UnifiedDataService cache on logout");
    } catch (cacheError) {
      console.warn("⚠️ [Auth] Failed to clear UnifiedDataService cache on logout:", cacheError);
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("temp_credentials");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      tempCredentials: void 0
    });
    (() => __async(void 0, null, function* () {
      try {
        const { auth } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { auth: auth2 } = yield import("./firebase-BTFXMplb.js").then((n) => n.f);
          return { auth: auth2 };
        }), true ? __vite__mapDeps([0,1,2,3]) : void 0);
        const { signOut } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { signOut: signOut2 } = yield import("./index.esm-BMygn4u3.js");
          return { signOut: signOut2 };
        }), true ? __vite__mapDeps([3,1]) : void 0);
        yield signOut(auth);
        console.log("✅ [Auth] Signed out from Firebase Auth");
      } catch (error) {
        console.warn("⚠️ [Auth] Failed to sign out from Firebase Auth:", error);
      }
    }))();
    if (authState.token) {
      authService.logout().catch(console.error);
    }
  });
  const refreshUser = () => __async(void 0, null, function* () {
    if (!authState.token) return;
    try {
      const user = yield authService.getProfile();
      localStorage.setItem("auth_user", JSON.stringify(user));
      setAuthState((prev) => __spreadProps(__spreadValues({}, prev), {
        user
      }));
      try {
        const { unifiedDataService } = yield __vitePreload(() => __async(void 0, null, function* () {
          const { unifiedDataService: unifiedDataService2 } = yield import("./UnifiedDataService-1nEfiWl8.js");
          return { unifiedDataService: unifiedDataService2 };
        }), true ? __vite__mapDeps([4,2,1,5,0,3,6,7,8]) : void 0);
        unifiedDataService.clearUserCache(user.id);
        console.log("🧹 [Auth] Cleared UnifiedDataService cache for refreshed user");
      } catch (cacheError) {
        console.warn("⚠️ [Auth] Failed to clear UnifiedDataService cache for refreshed user:", cacheError);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      yield logout();
    }
  });
  const updateUser = (userData) => {
    if (!authState.user) return;
    const updatedUser = __spreadValues(__spreadValues({}, authState.user), userData);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    setAuthState((prev) => __spreadProps(__spreadValues({}, prev), {
      user: updatedUser
    }));
  };
  const hasActiveLicense = () => {
    if (!authState.user) return false;
    if (authState.user.licenses && authState.user.licenses.length > 0) {
      return authState.user.licenses.some(
        (license) => license.status === "ACTIVE" && new Date(license.expiresAt) > /* @__PURE__ */ new Date()
      );
    }
    return false;
  };
  const hasActiveSubscription = () => {
    if (!authState.user) return false;
    if (authState.user.subscription) {
      return authState.user.subscription.status === "ACTIVE" || authState.user.subscription.status === "TRIALING";
    }
    return false;
  };
  const getTempCredentials = () => {
    if (authState.tempCredentials) {
      return authState.tempCredentials;
    }
    return null;
  };
  const contextValue = __spreadProps(__spreadValues({}, authState), {
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    logout,
    refreshUser,
    updateUser,
    hasActiveLicense,
    hasActiveSubscription,
    getTempCredentials
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value: contextValue, children });
};
const LoadingSpinner = ({
  message = "Loading...",
  size = 60,
  fullScreen = true
}) => {
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CircularProgress,
      {
        size,
        sx: {
          color: "primary.main",
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round"
          }
        }
      }
    ),
    message && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Typography,
      {
        variant: "body1",
        color: "text.secondary",
        textAlign: "center",
        children: message
      }
    )
  ] });
  if (fullScreen) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "background.default", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }, children: content });
  }
  return content;
};
const __vite_import_meta_env__ = {};
class ErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    __publicField(this, "clearCorruptedStorage", () => {
      try {
        console.log("🧹 Clearing potentially corrupted storage...");
        if (typeof localStorage !== "undefined") {
          localStorage.clear();
          console.log("✅ localStorage cleared");
        }
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.clear();
          console.log("✅ sessionStorage cleared");
        }
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
            console.log("✅ Cache cleared");
          });
        }
      } catch (error) {
        console.error("❌ Failed to clear storage:", error);
      }
    });
    __publicField(this, "handleReload", () => {
      this.setState({ isRecovering: true });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
    __publicField(this, "handleGoHome", () => {
      this.setState({ isRecovering: true });
      window.location.href = "/";
    });
    __publicField(this, "handleReset", () => {
      this.setState({
        hasError: false,
        error: void 0,
        errorInfo: void 0,
        isRecovering: false
      });
    });
    this.state = { hasError: false, isRecovering: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error, isRecovering: false };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    if (error.message.includes("Error #301") || error.message.includes("invariant=301")) {
      console.warn("🚨 React Error #301 detected - This is usually caused by browser extensions or build optimizations");
      console.warn("The application will continue to function normally");
      return;
    }
    if (error.message.includes("Error #130") || error.message.includes("object")) {
      console.warn("🔍 Detected React Error #130 - Object Serialization Issue");
      this.clearCorruptedStorage();
    }
    this.setState({
      error,
      errorInfo
    });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    if (__vite_import_meta_env__ && true) {
      console.error("Production error:", { error, errorInfo });
    }
  }
  render() {
    var _a, _b, _c, _d;
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const isReactError301 = ((_a = this.state.error) == null ? void 0 : _a.message.includes("Error #301")) || ((_b = this.state.error) == null ? void 0 : _b.message.includes("invariant=301"));
      const isReactError130 = ((_c = this.state.error) == null ? void 0 : _c.message.includes("Error #130")) || ((_d = this.state.error) == null ? void 0 : _d.message.includes("object"));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: {
        minHeight: "100vh",
        backgroundColor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Paper,
        {
          elevation: 3,
          sx: {
            p: 4,
            textAlign: "center",
            backgroundColor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ErrorOutline,
              {
                sx: {
                  fontSize: 80,
                  color: "error.main",
                  mb: 2
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: isReactError301 ? "React Instance Conflict Detected" : "Something went wrong" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", paragraph: true, children: isReactError301 ? "A React instance conflict has been detected. This usually happens when multiple versions of React are running simultaneously." : isReactError130 ? "An object serialization error has occurred. This usually indicates corrupted data in your browser storage." : "We apologize for the inconvenience. An unexpected error has occurred." }),
            isReactError301 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "warning", sx: { mb: 3, textAlign: "left" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "React Error #301:" }),
                " Multiple React instances detected. This can happen when:"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "error-list", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Multiple React versions are loaded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Third-party libraries include their own React" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Browser extensions interfere with React" })
              ] })
            ] }),
            isReactError130 && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3, textAlign: "left" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "React Error #130:" }),
              " Object serialization issue detected. Your browser storage has been cleared to resolve this issue."
            ] }) }),
            false,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "contained",
                  startIcon: this.state.isRecovering ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                  onClick: this.handleReload,
                  disabled: this.state.isRecovering,
                  sx: { minWidth: 120 },
                  children: this.state.isRecovering ? "Recovering..." : "Reload Page"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Home, {}),
                  onClick: this.handleGoHome,
                  disabled: this.state.isRecovering,
                  sx: { minWidth: 120 },
                  children: "Go Home"
                }
              ),
              !isReactError301 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outlined",
                  startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(BugReport, {}),
                  onClick: this.handleReset,
                  disabled: this.state.isRecovering,
                  sx: { minWidth: 120 },
                  children: "Try Again"
                }
              )
            ] }),
            isReactError301 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { mt: 3, p: 2, backgroundColor: "info.light", borderRadius: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "info.contrastText", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Need help?" }),
                " If this error persists, try:"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "error-list-info", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Refreshing the page" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Clearing browser cache and cookies" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Disabling browser extensions temporarily" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Using a different browser" })
              ] })
            ] })
          ]
        }
      ) }) });
    }
    return this.props.children;
  }
}
const colors = {
  // Primary colors (Blue gradient inspired by Dashboard v14)
  primary: {
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#2196f3",
    600: "#1e88e5",
    700: "#1976d2",
    800: "#1565c0",
    900: "#0d47a1",
    main: "#00d4ff",
    dark: "#0099cc",
    light: "#33ddff",
    contrastText: "#000000"
  },
  // Secondary colors (Purple accent)
  secondary: {
    50: "#f3e5f5",
    100: "#e1bee7",
    200: "#ce93d8",
    300: "#ba68c8",
    400: "#ab47bc",
    500: "#9c27b0",
    600: "#8e24aa",
    700: "#7b1fa2",
    800: "#6a1b9a",
    900: "#4a148c",
    main: "#764ba2",
    dark: "#512e70",
    light: "#9575cd",
    contrastText: "#ffffff"
  },
  // Dark theme colors
  background: {
    default: "#0a0a0a",
    paper: "#1a1a2e",
    elevated: "#16213e"
  },
  // Text colors
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(255, 255, 255, 0.5)"
  },
  // Success, error, warning, info
  success: {
    main: "#4caf50",
    dark: "#388e3c",
    light: "#81c784"
  },
  error: {
    main: "#f44336",
    dark: "#d32f2f",
    light: "#ef5350"
  },
  warning: {
    main: "#ff9800",
    dark: "#f57c00",
    light: "#ffb74d"
  },
  info: {
    main: "#2196f3",
    dark: "#1976d2",
    light: "#64b5f6"
  }
};
const typography = {
  fontFamily: [
    "Inter",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif"
  ].join(","),
  h1: {
    fontSize: "3.5rem",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.02em"
  },
  h2: {
    fontSize: "2.5rem",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "-0.01em"
  },
  h3: {
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: 1.4
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.4
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 500,
    lineHeight: 1.5
  },
  h6: {
    fontSize: "1.125rem",
    fontWeight: 500,
    lineHeight: 1.5
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.6
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.6
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 500,
    textTransform: "none",
    letterSpacing: "0.02em"
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.4
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em"
  }
};
const components = {
  // Button overrides
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        padding: "12px 24px",
        fontSize: "0.875rem",
        fontWeight: 500,
        textTransform: "none",
        boxShadow: "none",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0, 212, 255, 0.3)",
          transform: "translateY(-1px)"
        }
      },
      containedPrimary: {
        background: "linear-gradient(135deg, #00d4ff 0%, #667eea 100%)",
        color: "#000000",
        "&:hover": {
          background: "linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)"
        }
      },
      outlinedPrimary: {
        borderColor: colors.primary.main,
        color: colors.primary.main,
        "&:hover": {
          borderColor: colors.primary.light,
          backgroundColor: "rgba(0, 212, 255, 0.1)"
        }
      }
    }
  },
  // Card overrides
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: colors.background.paper,
        backgroundImage: "none",
        borderRadius: 0,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)"
        }
      }
    }
  },
  // Paper overrides
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: colors.background.paper,
        backgroundImage: "none"
      },
      elevation1: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
      },
      elevation2: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
      },
      elevation3: {
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)"
      }
    }
  },
  // AppBar overrides
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: "rgba(26, 26, 46, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 20px rgba(0, 0, 0, 0.3)"
      }
    }
  },
  // TextField overrides
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          "& fieldset": {
            borderColor: "rgba(255, 255, 255, 0.2)"
          },
          "&:hover fieldset": {
            borderColor: "rgba(255, 255, 255, 0.3)"
          },
          "&.Mui-focused fieldset": {
            borderColor: colors.primary.main,
            borderWidth: 2
          }
        },
        "& .MuiInputLabel-root": {
          color: "rgba(255, 255, 255, 0.7)",
          "&.Mui-focused": {
            color: colors.primary.main
          }
        }
      }
    }
  },
  // Chip overrides
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        fontWeight: 500
      },
      colorPrimary: {
        backgroundColor: "rgba(0, 212, 255, 0.2)",
        color: colors.primary.main
      }
    }
  },
  // Dialog overrides
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        backgroundColor: colors.background.paper
      }
    }
  },
  // Menu overrides
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        backgroundColor: colors.background.elevated,
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }
    }
  },
  // List overrides
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        margin: "2px 0",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.05)"
        }
      }
    }
  },
  // Tab overrides
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.875rem",
        minHeight: 48
      }
    }
  },
  // Data Grid overrides
  MuiDataGrid: {
    styleOverrides: {
      root: {
        border: "none",
        backgroundColor: colors.background.paper,
        "& .MuiDataGrid-cell": {
          borderColor: "rgba(255, 255, 255, 0.1)"
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: colors.background.elevated,
          borderColor: "rgba(255, 255, 255, 0.1)"
        },
        "& .MuiDataGrid-footerContainer": {
          borderColor: "rgba(255, 255, 255, 0.1)"
        }
      }
    }
  }
};
const themeOptions = {
  palette: {
    mode: "dark",
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info
  },
  typography,
  components,
  shape: {
    borderRadius: 0
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  shadows: [
    "none",
    "0 2px 8px rgba(0, 0, 0, 0.2)",
    "0 4px 12px rgba(0, 0, 0, 0.3)",
    "0 6px 16px rgba(0, 0, 0, 0.4)",
    "0 8px 20px rgba(0, 0, 0, 0.5)",
    "0 10px 24px rgba(0, 0, 0, 0.6)",
    "0 12px 28px rgba(0, 0, 0, 0.7)",
    "0 14px 32px rgba(0, 0, 0, 0.8)",
    "0 16px 36px rgba(0, 0, 0, 0.9)",
    "0 18px 40px rgba(0, 0, 0, 1)",
    "0 20px 44px rgba(0, 0, 0, 1)",
    "0 22px 48px rgba(0, 0, 0, 1)",
    "0 24px 52px rgba(0, 0, 0, 1)",
    "0 26px 56px rgba(0, 0, 0, 1)",
    "0 28px 60px rgba(0, 0, 0, 1)",
    "0 30px 64px rgba(0, 0, 0, 1)",
    "0 32px 68px rgba(0, 0, 0, 1)",
    "0 34px 72px rgba(0, 0, 0, 1)",
    "0 36px 76px rgba(0, 0, 0, 1)",
    "0 38px 80px rgba(0, 0, 0, 1)",
    "0 40px 84px rgba(0, 0, 0, 1)",
    "0 42px 88px rgba(0, 0, 0, 1)",
    "0 44px 92px rgba(0, 0, 0, 1)",
    "0 46px 96px rgba(0, 0, 0, 1)",
    "0 48px 100px rgba(0, 0, 0, 1)"
  ]
};
const theme = createTheme(themeOptions);
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["ORGANIZATION_OWNER"] = "ORGANIZATION_OWNER";
  UserRole2["ADMIN"] = "ADMIN";
  UserRole2["ORG_ADMIN"] = "ORG_ADMIN";
  UserRole2["MEMBER"] = "MEMBER";
  UserRole2["ACCOUNTING"] = "ACCOUNTING";
  UserRole2["SUPERADMIN"] = "SUPERADMIN";
  UserRole2["USER"] = "USER";
  UserRole2["ENTERPRISE_ADMIN"] = "ENTERPRISE_ADMIN";
  return UserRole2;
})(UserRole || {});
const ROLE_PERMISSIONS = {
  [
    "ORGANIZATION_OWNER"
    /* ORGANIZATION_OWNER */
  ]: {
    role: "ORGANIZATION_OWNER",
    level: 100,
    permissions: [
      // Full dashboard access
      "view:overview",
      "view:licenses",
      "view:cloud_projects",
      "view:team_management",
      "view:billing",
      "view:analytics",
      "view:downloads",
      "view:settings",
      // Full management access
      "manage:organization",
      "manage:team_members",
      "manage:licenses",
      "manage:billing",
      "create:users",
      "edit:users",
      "delete:users",
      "manage:user_roles",
      // Financial access
      "view:financial_data",
      "manage:payments",
      "view:accounting",
      // System access
      "access:admin_panel",
      "access:security_center",
      "access:compliance"
      /* ACCESS_COMPLIANCE */
    ],
    navigationItems: [
      "overview",
      "licenses",
      "cloud-projects",
      "team-management",
      "billing",
      "analytics",
      "downloads",
      "organization",
      "security",
      "compliance",
      "settings"
    ],
    description: "Full access to all features including billing and licensing management"
  },
  [
    "ADMIN"
    /* ADMIN */
  ]: {
    role: "ADMIN",
    level: 90,
    permissions: [
      // Dashboard access (no billing)
      "view:overview",
      "view:licenses",
      "view:cloud_projects",
      "view:team_management",
      "view:analytics",
      "view:downloads",
      "view:settings",
      // Management access (no billing)
      "manage:team_members",
      "manage:licenses",
      "create:users",
      "edit:users",
      "manage:user_roles",
      // System access
      "access:security_center",
      "access:compliance"
      /* ACCESS_COMPLIANCE */
    ],
    navigationItems: [
      "overview",
      "licenses",
      "cloud-projects",
      "team-management",
      "analytics",
      "downloads",
      "security",
      "compliance",
      "settings"
    ],
    description: "Administrative access to manage team and licenses, but no billing access"
  },
  [
    "ORG_ADMIN"
    /* ORG_ADMIN */
  ]: {
    role: "ORG_ADMIN",
    level: 90,
    permissions: [
      // Dashboard access (no billing)
      "view:overview",
      "view:licenses",
      "view:cloud_projects",
      "view:team_management",
      "view:analytics",
      "view:downloads",
      "view:settings",
      // Management access (no billing)
      "manage:team_members",
      "manage:licenses",
      "create:users",
      "edit:users",
      "manage:user_roles",
      // System access
      "access:security_center",
      "access:compliance"
      /* ACCESS_COMPLIANCE */
    ],
    navigationItems: [
      "overview",
      "licenses",
      "cloud-projects",
      "team-management",
      "analytics",
      "downloads",
      "security",
      "compliance",
      "settings"
    ],
    description: "Organization administrative access to manage team and licenses, but no billing access"
  },
  [
    "MEMBER"
    /* MEMBER */
  ]: {
    role: "MEMBER",
    level: 50,
    permissions: [
      // Limited dashboard access
      "view:cloud_projects",
      "view:team_management",
      "view:settings"
      /* VIEW_SETTINGS */
    ],
    navigationItems: [
      "cloud-projects",
      "team-management",
      "settings"
    ],
    description: "Basic access to cloud projects and team management only"
  },
  [
    "ACCOUNTING"
    /* ACCOUNTING */
  ]: {
    role: "ACCOUNTING",
    level: 80,
    permissions: [
      // Financial access only
      "view:financial_data",
      "manage:payments",
      "view:accounting",
      "view:billing",
      "view:settings"
      /* VIEW_SETTINGS */
    ],
    navigationItems: [
      "accounting",
      "billing",
      "settings"
    ],
    description: "Access to accounting and financial data only"
  },
  // Legacy role mappings
  [
    "SUPERADMIN"
    /* SUPERADMIN */
  ]: {
    role: "SUPERADMIN",
    level: 100,
    permissions: [
      "view:overview",
      "view:licenses",
      "view:cloud_projects",
      "view:team_management",
      "view:analytics",
      "view:downloads",
      "view:settings",
      "access:admin_panel",
      "view:accounting"
      /* VIEW_ACCOUNTING */
    ],
    navigationItems: [
      "overview",
      "licenses",
      "cloud-projects",
      "team-management",
      "analytics",
      "downloads",
      "admin",
      "accounting",
      "settings"
    ],
    description: "Legacy super admin role - maps to ORGANIZATION_OWNER"
  },
  [
    "USER"
    /* USER */
  ]: {
    role: "USER",
    level: 50,
    permissions: [
      "view:cloud_projects",
      "view:team_management",
      "view:settings"
      /* VIEW_SETTINGS */
    ],
    navigationItems: [
      "cloud-projects",
      "team-management",
      "settings"
    ],
    description: "Legacy user role - maps to MEMBER"
  },
  [
    "ENTERPRISE_ADMIN"
    /* ENTERPRISE_ADMIN */
  ]: {
    role: "ENTERPRISE_ADMIN",
    level: 90,
    permissions: [
      "view:overview",
      "view:licenses",
      "view:cloud_projects",
      "view:team_management",
      "view:analytics",
      "view:downloads",
      "view:settings",
      "manage:team_members",
      "manage:licenses",
      "create:users",
      "edit:users",
      "manage:user_roles"
      /* MANAGE_USER_ROLES */
    ],
    navigationItems: [
      "overview",
      "licenses",
      "cloud-projects",
      "team-management",
      "analytics",
      "downloads",
      "settings"
    ],
    description: "Legacy enterprise admin role - maps to ADMIN"
  }
};
const NAVIGATION_ITEMS = [
  {
    id: "overview",
    text: "Overview",
    icon: "Dashboard",
    path: "/dashboard",
    requiredPermission: "view:overview",
    description: "Dashboard overview and statistics"
  },
  {
    id: "licenses",
    text: "Licenses",
    icon: "CardMembership",
    path: "/dashboard/licenses",
    requiredPermission: "view:licenses",
    description: "License management and tracking"
  },
  {
    id: "cloud-projects",
    text: "Cloud Projects",
    icon: "Analytics",
    path: "/dashboard/cloud-projects",
    requiredPermission: "view:cloud_projects",
    description: "Cloud project management"
  },
  {
    id: "team-management",
    text: "Team Management",
    icon: "Group",
    path: "/dashboard/team",
    requiredPermission: "view:team_management",
    description: "Team member management"
  },
  {
    id: "billing",
    text: "Billing & Payments",
    icon: "Payment",
    path: "/dashboard/billing",
    requiredPermission: "view:billing",
    requiredRole: "ORGANIZATION_OWNER",
    description: "Billing and payment management (Owner only)"
  },
  {
    id: "analytics",
    text: "Usage Analytics",
    icon: "Receipt",
    path: "/dashboard/analytics",
    requiredPermission: "view:analytics",
    description: "Usage analytics and reporting"
  },
  {
    id: "downloads",
    text: "Downloads",
    icon: "Download",
    path: "/dashboard/downloads",
    requiredPermission: "view:downloads",
    description: "SDK and documentation downloads"
  },
  {
    id: "organization",
    text: "Organization",
    icon: "Business",
    path: "/dashboard/organization",
    requiredPermission: "manage:organization",
    requiredRole: "ORGANIZATION_OWNER",
    description: "Organization settings (Owner only)"
  },
  {
    id: "security",
    text: "Security Center",
    icon: "Security",
    path: "/dashboard/security",
    requiredPermission: "access:security_center",
    description: "Security and compliance management"
  },
  {
    id: "compliance",
    text: "Compliance",
    icon: "Security",
    path: "/dashboard/compliance",
    requiredPermission: "access:compliance",
    description: "Compliance and audit management"
  },
  {
    id: "accounting",
    text: "Accounting",
    icon: "AccountBalance",
    path: "/accounting",
    requiredPermission: "view:accounting",
    requiredRole: "ACCOUNTING",
    description: "Accounting and financial management"
  },
  {
    id: "admin",
    text: "Admin Panel",
    icon: "AdminPanelSettings",
    path: "/admin",
    requiredPermission: "access:admin_panel",
    requiredRole: "ORGANIZATION_OWNER",
    description: "System administration (Owner only)"
  },
  {
    id: "settings",
    text: "Settings",
    icon: "Settings",
    path: "/dashboard/settings",
    requiredPermission: "view:settings",
    description: "User and account settings"
  }
];
class RoleBasedAccessControl {
  /**
   * Get user role with fallback mapping
   */
  static getUserRole(user) {
    if (!user) return "MEMBER";
    const role = String(user.role || user.memberRole || "").toUpperCase();
    if (Object.values(UserRole).includes(role)) {
      return role;
    }
    switch (role) {
      case "OWNER":
      case "ORGANIZATION_OWNER":
        return "ORGANIZATION_OWNER";
      case "ADMIN":
      case "ENTERPRISE_ADMIN":
        return "ADMIN";
      case "ORG_ADMIN":
        return "ORG_ADMIN";
      case "ACCOUNTING":
        return "ACCOUNTING";
      case "MEMBER":
      case "USER":
      default:
        return "MEMBER";
    }
  }
  /**
   * Check if user has specific permission
   */
  static hasPermission(user, permission) {
    const userRole = this.getUserRole(user);
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.permissions.includes(permission);
  }
  /**
   * Check if user has specific role
   */
  static hasRole(user, role) {
    return this.getUserRole(user) === role;
  }
  /**
   * Check if user has minimum role level
   */
  static hasMinimumRoleLevel(user, minLevel) {
    const userRole = this.getUserRole(user);
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.level >= minLevel;
  }
  /**
   * Get user's accessible navigation items
   */
  static getAccessibleNavigationItems(user) {
    const userRole = this.getUserRole(user);
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    console.log("🔍 [RBAC] getUserRole result:", userRole);
    console.log("🔍 [RBAC] Role permissions:", rolePermissions);
    console.log("🔍 [RBAC] Available navigation items:", NAVIGATION_ITEMS.length);
    const accessibleItems = NAVIGATION_ITEMS.filter((item) => {
      const hasPermission = this.hasPermission(user, item.requiredPermission);
      const hasRole = !item.requiredRole || this.hasRole(user, item.requiredRole);
      console.log(`🔍 [RBAC] Item ${item.id}: hasPermission=${hasPermission}, hasRole=${hasRole}, requiredPermission=${item.requiredPermission}, requiredRole=${item.requiredRole}`);
      return hasPermission && hasRole;
    });
    console.log("🔍 [RBAC] Final accessible items:", accessibleItems.map((item) => item.id));
    return accessibleItems;
  }
  /**
   * Check if user can access specific page
   */
  static canAccessPage(user, pageId) {
    const accessibleItems = this.getAccessibleNavigationItems(user);
    return accessibleItems.some((item) => item.id === pageId);
  }
  /**
   * Get user's role information
   */
  static getUserRoleInfo(user) {
    const userRole = this.getUserRole(user);
    return ROLE_PERMISSIONS[userRole];
  }
  /**
   * Check if user is organization owner
   */
  static isOrganizationOwner(user) {
    return this.hasRole(
      user,
      "ORGANIZATION_OWNER"
      /* ORGANIZATION_OWNER */
    );
  }
  /**
   * Check if user is admin or higher
   */
  static isAdminOrHigher(user) {
    return this.hasMinimumRoleLevel(user, 90);
  }
  /**
   * Check if user is member or higher
   */
  static isMemberOrHigher(user) {
    return this.hasMinimumRoleLevel(user, 50);
  }
}
const ProtectedRoute = ({
  children,
  // requireEmailVerification is reserved for future use
  requireEmailVerification = false,
  requireAdmin = false,
  requireAccounting = false,
  requirePermission,
  requireRole,
  requireMinimumRoleLevel
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
  }
  if (requireAdmin) {
    if (!RoleBasedAccessControl.isAdminOrHigher(user)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
    }
  }
  if (requireAccounting) {
    if (!RoleBasedAccessControl.hasRole(user, UserRole.ACCOUNTING)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
    }
  }
  if (requirePermission && !RoleBasedAccessControl.hasPermission(user, requirePermission)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
  }
  if (requireRole && !RoleBasedAccessControl.hasRole(user, requireRole)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
  }
  if (requireMinimumRoleLevel && !RoleBasedAccessControl.hasMinimumRoleLevel(user, requireMinimumRoleLevel)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
};
const clearAuthWarnings = () => {
  if (typeof window === "undefined") return;
  try {
    const hadWarning = localStorage.getItem("firebase_auth_required") === "true";
    const hadEmail = localStorage.getItem("firebase_auth_email");
    localStorage.removeItem("firebase_auth_required");
    localStorage.removeItem("firebase_auth_email");
    if (hadWarning || hadEmail) {
      console.log("✅ Auth warnings cleared from localStorage:", { hadWarning, hadEmail });
    } else {
      console.log("ℹ️ No auth warnings found in localStorage");
    }
  } catch (error) {
    console.warn("Failed to clear auth warnings:", error);
  }
};
clearAuthWarnings();
const LandingPage = React.lazy(() => __vitePreload(() => import("./LandingPage-BaczG_9z.js"), true ? __vite__mapDeps([9,6,7,10,11,8]) : void 0));
const LoginPage = React.lazy(() => __vitePreload(() => import("./LoginPage-DQj2T2C_.js"), true ? __vite__mapDeps([12,6,7,13,14,8]) : void 0));
const BridgeAuthPage = React.lazy(() => __vitePreload(() => import("./BridgeAuthPage-DE-tPGui.js"), true ? __vite__mapDeps([15,6,7]) : void 0));
const RegisterPage = React.lazy(() => __vitePreload(() => import("./RegisterPage-BT0S0c6k.js"), true ? __vite__mapDeps([16,6,7,13,14,8]) : void 0));
const ForgotPasswordPage = React.lazy(() => __vitePreload(() => import("./ForgotPasswordPage-Dak052bM.js"), true ? __vite__mapDeps([17,6,7,13,14,8]) : void 0));
const ResetPasswordPage = React.lazy(() => __vitePreload(() => import("./ResetPasswordPage-LSVX9B_z.js"), true ? __vite__mapDeps([18,6,7,13,14,8]) : void 0));
const EmailVerificationPage = React.lazy(() => __vitePreload(() => import("./EmailVerificationPage-DXTinw1E.js"), true ? __vite__mapDeps([19,6,7,14,8]) : void 0));
const PricingPage = React.lazy(() => __vitePreload(() => import("./PricingPage-CwyRw5tY.js"), true ? __vite__mapDeps([20,6,7,10,11,8]) : void 0));
const TermsPage = React.lazy(() => __vitePreload(() => import("./TermsPage--kxdcs6w.js"), true ? __vite__mapDeps([21,6,7,10,11,8]) : void 0));
const PrivacyPolicyPage = React.lazy(() => __vitePreload(() => import("./PrivacyPolicyPage-CmTShcuo.js"), true ? __vite__mapDeps([22,6,7,10,11,8]) : void 0));
const SlaPage = React.lazy(() => __vitePreload(() => import("./SlaPage-C1DK9Xcf.js"), true ? __vite__mapDeps([23,6,7,10,11,8]) : void 0));
const CookiePolicyPage = React.lazy(() => __vitePreload(() => import("./CookiePolicyPage-DK9i2Wgy.js"), true ? __vite__mapDeps([24,6,7,10,11,8]) : void 0));
const CheckoutPage = React.lazy(() => __vitePreload(() => import("./CheckoutPage-EWtgxaRE.js"), true ? __vite__mapDeps([25,6,7,14,10,13,8]) : void 0));
const DashboardLayout = React.lazy(() => __vitePreload(() => import("./DashboardLayout-B5qxAptr.js"), true ? __vite__mapDeps([26,6,7,8]) : void 0));
const DashboardOverview = React.lazy(() => __vitePreload(() => import("./DashboardOverview-D3jKMUwo.js"), true ? __vite__mapDeps([27,6,7,0,1,2,3,28,29,4,5,8]) : void 0));
const DashboardCloudProjectsBridge = React.lazy(() => __vitePreload(() => import("./DashboardCloudProjectsBridge-CAyYUp32.js").then((n) => n.D), true ? __vite__mapDeps([30,6,7,2,1,0,3,31,32,4,5,8]) : void 0));
const LicensesPage = React.lazy(() => __vitePreload(() => import("./LicensesPage-CcwDGqBz.js"), true ? __vite__mapDeps([33,6,7,29,4,2,1,5,0,3,8,14]) : void 0));
const SecurityDashboardPage = React.lazy(() => __vitePreload(() => import("./security-dashboard-DE_GSU9Q.js"), true ? __vite__mapDeps([34,6,7,3,1,8]) : void 0));
const AnalyticsPage = React.lazy(() => __vitePreload(() => import("./AnalyticsPage-B588_nUt.js"), true ? __vite__mapDeps([35,6,7,29,4,2,1,5,0,3,8,28]) : void 0));
React.lazy(() => __vitePreload(() => import("./BillingPage-U6Cqs9vf.js"), true ? __vite__mapDeps([36,6,7,14,29,4,2,1,5,0,3,8,28]) : void 0));
const StreamlinedBillingPage = React.lazy(() => __vitePreload(() => import("./StreamlinedBillingPage-BlTuQ5xF.js"), true ? __vite__mapDeps([37,6,7,14,29,4,2,1,5,0,3,8,28]) : void 0));
const SettingsPage = React.lazy(() => __vitePreload(() => import("./SettingsPage-BHijnGNs.js"), true ? __vite__mapDeps([38,6,7,14,8]) : void 0));
const TeamPage = React.lazy(() => __vitePreload(() => import("./EnhancedTeamPage-D1ijF9HD.js"), true ? __vite__mapDeps([39,6,7,14,29,4,2,1,5,0,3,8,28]) : void 0));
const TestStreamlinedHooks = React.lazy(() => __vitePreload(() => import("./TestStreamlinedHooks-z6Kg86ou.js"), true ? __vite__mapDeps([40,6,7,29,4,2,1,5,0,3,8]) : void 0));
const DownloadsPage = React.lazy(() => __vitePreload(() => import("./DownloadsPage-C435_XEG.js"), true ? __vite__mapDeps([41,6,7,14,29,4,2,1,5,0,3,8]) : void 0));
const DocumentationPage = React.lazy(() => __vitePreload(() => import("./DocumentationPage-DWlRMj4q.js"), true ? __vite__mapDeps([42,6,7,14,10,11,8]) : void 0));
const SupportPage = React.lazy(() => __vitePreload(() => import("./SupportPage-CQke8NXX.js"), true ? __vite__mapDeps([43,6,7,14,10,11,8]) : void 0));
const InviteAcceptPage = React.lazy(() => __vitePreload(() => import("./InviteAcceptPage-uPGVjSmI.js"), true ? __vite__mapDeps([44,6,7,14,8]) : void 0));
const AdminDashboard = React.lazy(() => __vitePreload(() => import("./AdminDashboard-DjoAWoz3.js"), true ? __vite__mapDeps([45,6,7,14,2,1,0,3,5,8]) : void 0));
const AccountingDashboard = React.lazy(() => __vitePreload(() => import("./AccountingDashboard-CS0r8nB5.js"), true ? __vite__mapDeps([46,6,7,8]) : void 0));
const NotFoundPage = React.lazy(() => __vitePreload(() => import("./NotFoundPage-C92zwDex.js"), true ? __vite__mapDeps([47,6,7]) : void 0));
const StartupWorkflow = React.lazy(() => __vitePreload(() => import("./StartupWorkflow-DnDI_y9a.js"), true ? __vite__mapDeps([48,6,7,32,31,12,13,14,8]) : void 0));
const OfflineTestPage = React.lazy(() => __vitePreload(() => import("./OfflineTestPage-Cm8FuIYD.js"), true ? __vite__mapDeps([49,6,7,31,8]) : void 0));
const TestInviteDialog = React.lazy(() => __vitePreload(() => import("./TestInviteDialog-pJfi3kQ_.js"), true ? __vite__mapDeps([50,6,7,14,8]) : void 0));
const TestTeamMemberCreation = React.lazy(() => __vitePreload(() => import("./TestTeamMemberCreation-B1Wa8YlG.js"), true ? __vite__mapDeps([51,6,7,14,29,4,2,1,5,0,3,8]) : void 0));
const TestTeamMemberCreationSimple = React.lazy(() => __vitePreload(() => import("./TestTeamMemberCreationSimple-CLFjkX9-.js"), true ? __vite__mapDeps([52,6,7,14,8]) : void 0));
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  }
  if (isAuthenticated) {
    const roleUpper = String((user == null ? void 0 : user.role) || "").toUpperCase();
    if (roleUpper === "SUPERADMIN") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/admin", replace: true });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
};
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemeProvider, { theme, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CssBaseline, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { minHeight: "100vh", backgroundColor: "background.default", color: "text.primary" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Routes, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/", element: /* @__PURE__ */ jsxRuntimeExports.jsx(LandingPage, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/pricing", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PricingPage, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/startup", element: /* @__PURE__ */ jsxRuntimeExports.jsx(StartupWorkflow, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/test/offline", element: /* @__PURE__ */ jsxRuntimeExports.jsx(OfflineTestPage, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/test/invite-dialog", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TestInviteDialog, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/test/team-member-creation", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TestTeamMemberCreation, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/test/team-member-simple", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TestTeamMemberCreationSimple, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/login",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoginPage, {}) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/auth/bridge",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(BridgeAuthPage, {})
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/register",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RegisterPage, {}) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/forgot-password",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForgotPasswordPage, {}) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/reset-password/:token",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResetPasswordPage, {}) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/verify-email",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailVerificationPage, {})
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/verify-email/:token",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailVerificationPage, {})
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/checkout",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckoutPage, {}) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/invite/accept",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(InviteAcceptPage, {}) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/documentation",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentationPage, {})
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/support",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(SupportPage, {})
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/terms", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TermsPage, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/privacy", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PrivacyPolicyPage, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/sla", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SlaPage, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/cookies", element: /* @__PURE__ */ jsxRuntimeExports.jsx(CookiePolicyPage, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Route,
        {
          path: "/dashboard",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, {}) }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { index: true, element: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardOverview, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "analytics", element: /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Route,
              {
                path: "billing",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(StreamlinedBillingPage, {})
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "team", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TeamPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "downloads", element: /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadsPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "settings", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "licenses", element: /* @__PURE__ */ jsxRuntimeExports.jsx(LicensesPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "cloud-projects", element: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCloudProjectsBridge, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "documentation", element: /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentationPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "support", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SupportPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "startup", element: /* @__PURE__ */ jsxRuntimeExports.jsx(StartupWorkflow, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "test-streamlined", element: /* @__PURE__ */ jsxRuntimeExports.jsx(TestStreamlinedHooks, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "organization", element: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Organization (Coming Soon)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "security", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityDashboardPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "compliance", element: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Compliance (Coming Soon)" }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/admin",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { requireAdmin: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, {}) }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { index: true, element: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, {}) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/accounting",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { requireAccounting: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardLayout, {}) }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { index: true, element: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountingDashboard, {}) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "*", element: /* @__PURE__ */ jsxRuntimeExports.jsx(NotFoundPage, {}) })
    ] }) }) }) })
  ] });
}
const stripePromise = Promise.resolve(null);
const StripeContext = reactExports.createContext(void 0);
const StripeProvider = ({ children }) => {
  const contextValue = {
    stripe: stripePromise
  };
  const options = {
    // Add global Stripe options here
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#00d4ff",
        colorBackground: "#1a1a2e",
        colorText: "#ffffff",
        colorDanger: "#f44336",
        fontFamily: "Inter, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px"
      },
      rules: {
        ".Input": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#ffffff"
        },
        ".Input:focus": {
          borderColor: "#00d4ff",
          boxShadow: "0 0 0 2px rgba(0, 212, 255, 0.2)"
        },
        ".Label": {
          color: "rgba(255, 255, 255, 0.7)",
          fontWeight: "500"
        },
        ".Tab": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#ffffff"
        },
        ".Tab:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)"
        },
        ".Tab--selected": {
          backgroundColor: "rgba(0, 212, 255, 0.1)",
          borderColor: "#00d4ff"
        }
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StripeContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Elements, { stripe: stripePromise, options, children }) });
};
window.addEventListener("error", (event) => {
  if (event.error && event.error.message && (event.error.message.includes("Error #301") || event.error.message.includes("invariant=301"))) {
    console.warn("🚨 React Error #301 caught by global handler - suppressing error display");
    event.preventDefault();
    return false;
  }
});
window.addEventListener("error", (event) => {
  if (event.error && event.error.message && (event.error.message.includes("Error #301") || event.error.message.includes("invariant=301"))) {
    console.warn("🚨 React Error #301 caught by global handler - suppressing error display");
    event.preventDefault();
    return false;
  }
});
const root = client.createRoot(document.getElementById("root"));
root.render(
  /* @__PURE__ */ jsxRuntimeExports.jsxs(BrowserRouter, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CssBaseline, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StripeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) }) }) })
  ] })
);
export {
  ErrorBoundary as E,
  RoleBasedAccessControl as R,
  __vitePreload as _,
  useLoading as a,
  authService as b,
  api as c,
  apiUtils as d,
  endpoints as e,
  authService$1 as f,
  useAuth as u
};
