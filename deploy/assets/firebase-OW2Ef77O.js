const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.esm-BMygn4u3.js","assets/index.esm-zVCMB3Cx.js","assets/FirestoreCollectionManager-C4RhxpKp.js","assets/index-Dd1DWJhm.js","assets/mui-BbtiZaA3.js","assets/vendor-Cu2L4Rr-.js","assets/stripe-rmDQXWB-.js","assets/index-COak77tQ.css","assets/index.esm-CjtNHFZy.js"])))=>i.map(i=>d[i]);
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
import { _ as __vitePreload } from "./index-Dd1DWJhm.js";
import { r as registerVersion, g as getApp, _ as _getProvider, a as getModularInstance, b as getDefaultEmulatorHostnameAndPort, i as isCloudWorkstation, p as pingServer, u as updateEmulatorBanner, F as FirebaseError, c as _registerComponent, C as Component, d as _isFirebaseServerApp, S as SDK_VERSION, e as createMockUserToken, f as initializeApp, h as getApps, D as DEFAULT_ENTRY_NAME, j as _addComponent, k as _apps, l as _components, m as _serverApps } from "./index.esm-zVCMB3Cx.js";
import { getFirestore, query, collection, where, getDocs, getDoc, doc, orderBy, addDoc, deleteDoc, connectFirestoreEmulator } from "./index.esm-CjtNHFZy.js";
import { getAuth, connectAuthEmulator } from "./index.esm-BMygn4u3.js";
var name$2 = "firebase";
var version$2 = "12.1.0";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
registerVersion(name$2, version$2, "app");
const index_esm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FirebaseError,
  SDK_VERSION,
  _DEFAULT_ENTRY_NAME: DEFAULT_ENTRY_NAME,
  _addComponent,
  _apps,
  _components,
  _getProvider,
  _isFirebaseServerApp,
  _registerComponent,
  _serverApps,
  getApp,
  getApps,
  initializeApp,
  registerVersion
}, Symbol.toStringTag, { value: "Module" }));
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const LONG_TYPE = "type.googleapis.com/google.protobuf.Int64Value";
const UNSIGNED_LONG_TYPE = "type.googleapis.com/google.protobuf.UInt64Value";
function mapValues(o, f) {
  const result = {};
  for (const key in o) {
    if (o.hasOwnProperty(key)) {
      result[key] = f(o[key]);
    }
  }
  return result;
}
function encode(data) {
  if (data == null) {
    return null;
  }
  if (data instanceof Number) {
    data = data.valueOf();
  }
  if (typeof data === "number" && isFinite(data)) {
    return data;
  }
  if (data === true || data === false) {
    return data;
  }
  if (Object.prototype.toString.call(data) === "[object String]") {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (Array.isArray(data)) {
    return data.map((x) => encode(x));
  }
  if (typeof data === "function" || typeof data === "object") {
    return mapValues(data, (x) => encode(x));
  }
  throw new Error("Data cannot be encoded in JSON: " + data);
}
function decode(json) {
  if (json == null) {
    return json;
  }
  if (json["@type"]) {
    switch (json["@type"]) {
      case LONG_TYPE:
      case UNSIGNED_LONG_TYPE: {
        const value = Number(json["value"]);
        if (isNaN(value)) {
          throw new Error("Data cannot be decoded from JSON: " + json);
        }
        return value;
      }
      default: {
        throw new Error("Data cannot be decoded from JSON: " + json);
      }
    }
  }
  if (Array.isArray(json)) {
    return json.map((x) => decode(x));
  }
  if (typeof json === "function" || typeof json === "object") {
    return mapValues(json, (x) => decode(x));
  }
  return json;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const FUNCTIONS_TYPE = "functions";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const errorCodeMap = {
  OK: "ok",
  CANCELLED: "cancelled",
  UNKNOWN: "unknown",
  INVALID_ARGUMENT: "invalid-argument",
  DEADLINE_EXCEEDED: "deadline-exceeded",
  NOT_FOUND: "not-found",
  ALREADY_EXISTS: "already-exists",
  PERMISSION_DENIED: "permission-denied",
  UNAUTHENTICATED: "unauthenticated",
  RESOURCE_EXHAUSTED: "resource-exhausted",
  FAILED_PRECONDITION: "failed-precondition",
  ABORTED: "aborted",
  OUT_OF_RANGE: "out-of-range",
  UNIMPLEMENTED: "unimplemented",
  INTERNAL: "internal",
  UNAVAILABLE: "unavailable",
  DATA_LOSS: "data-loss"
};
class FunctionsError extends FirebaseError {
  /**
   * Constructs a new instance of the `FunctionsError` class.
   */
  constructor(code, message, details) {
    super(`${FUNCTIONS_TYPE}/${code}`, message || "");
    this.details = details;
    Object.setPrototypeOf(this, FunctionsError.prototype);
  }
}
function codeForHTTPStatus(status) {
  if (status >= 200 && status < 300) {
    return "ok";
  }
  switch (status) {
    case 0:
      return "internal";
    case 400:
      return "invalid-argument";
    case 401:
      return "unauthenticated";
    case 403:
      return "permission-denied";
    case 404:
      return "not-found";
    case 409:
      return "aborted";
    case 429:
      return "resource-exhausted";
    case 499:
      return "cancelled";
    case 500:
      return "internal";
    case 501:
      return "unimplemented";
    case 503:
      return "unavailable";
    case 504:
      return "deadline-exceeded";
  }
  return "unknown";
}
function _errorForResponse(status, bodyJSON) {
  let code = codeForHTTPStatus(status);
  let description = code;
  let details = void 0;
  try {
    const errorJSON = bodyJSON && bodyJSON.error;
    if (errorJSON) {
      const status2 = errorJSON.status;
      if (typeof status2 === "string") {
        if (!errorCodeMap[status2]) {
          return new FunctionsError("internal", "internal");
        }
        code = errorCodeMap[status2];
        description = status2;
      }
      const message = errorJSON.message;
      if (typeof message === "string") {
        description = message;
      }
      details = errorJSON.details;
      if (details !== void 0) {
        details = decode(details);
      }
    }
  } catch (e) {
  }
  if (code === "ok") {
    return null;
  }
  return new FunctionsError(code, description, details);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ContextProvider {
  constructor(app2, authProvider, messagingProvider, appCheckProvider) {
    this.app = app2;
    this.auth = null;
    this.messaging = null;
    this.appCheck = null;
    this.serverAppAppCheckToken = null;
    if (_isFirebaseServerApp(app2) && app2.settings.appCheckToken) {
      this.serverAppAppCheckToken = app2.settings.appCheckToken;
    }
    this.auth = authProvider.getImmediate({ optional: true });
    this.messaging = messagingProvider.getImmediate({
      optional: true
    });
    if (!this.auth) {
      authProvider.get().then((auth2) => this.auth = auth2, () => {
      });
    }
    if (!this.messaging) {
      messagingProvider.get().then((messaging) => this.messaging = messaging, () => {
      });
    }
    if (!this.appCheck) {
      appCheckProvider == null ? void 0 : appCheckProvider.get().then((appCheck) => this.appCheck = appCheck, () => {
      });
    }
  }
  getAuthToken() {
    return __async(this, null, function* () {
      if (!this.auth) {
        return void 0;
      }
      try {
        const token = yield this.auth.getToken();
        return token == null ? void 0 : token.accessToken;
      } catch (e) {
        return void 0;
      }
    });
  }
  getMessagingToken() {
    return __async(this, null, function* () {
      if (!this.messaging || !("Notification" in self) || Notification.permission !== "granted") {
        return void 0;
      }
      try {
        return yield this.messaging.getToken();
      } catch (e) {
        return void 0;
      }
    });
  }
  getAppCheckToken(limitedUseAppCheckTokens) {
    return __async(this, null, function* () {
      if (this.serverAppAppCheckToken) {
        return this.serverAppAppCheckToken;
      }
      if (this.appCheck) {
        const result = limitedUseAppCheckTokens ? yield this.appCheck.getLimitedUseToken() : yield this.appCheck.getToken();
        if (result.error) {
          return null;
        }
        return result.token;
      }
      return null;
    });
  }
  getContext(limitedUseAppCheckTokens) {
    return __async(this, null, function* () {
      const authToken = yield this.getAuthToken();
      const messagingToken = yield this.getMessagingToken();
      const appCheckToken = yield this.getAppCheckToken(limitedUseAppCheckTokens);
      return { authToken, messagingToken, appCheckToken };
    });
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_REGION = "us-central1";
const responseLineRE = /^data: (.*?)(?:\n|$)/;
function failAfter(millis) {
  let timer = null;
  return {
    promise: new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new FunctionsError("deadline-exceeded", "deadline-exceeded"));
      }, millis);
    }),
    cancel: () => {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };
}
class FunctionsService {
  /**
   * Creates a new Functions service for the given app.
   * @param app - The FirebaseApp to use.
   */
  constructor(app2, authProvider, messagingProvider, appCheckProvider, regionOrCustomDomain = DEFAULT_REGION, fetchImpl = (...args) => fetch(...args)) {
    this.app = app2;
    this.fetchImpl = fetchImpl;
    this.emulatorOrigin = null;
    this.contextProvider = new ContextProvider(app2, authProvider, messagingProvider, appCheckProvider);
    this.cancelAllRequests = new Promise((resolve) => {
      this.deleteService = () => {
        return Promise.resolve(resolve());
      };
    });
    try {
      const url = new URL(regionOrCustomDomain);
      this.customDomain = url.origin + (url.pathname === "/" ? "" : url.pathname);
      this.region = DEFAULT_REGION;
    } catch (e) {
      this.customDomain = null;
      this.region = regionOrCustomDomain;
    }
  }
  _delete() {
    return this.deleteService();
  }
  /**
   * Returns the URL for a callable with the given name.
   * @param name - The name of the callable.
   * @internal
   */
  _url(name2) {
    const projectId = this.app.options.projectId;
    if (this.emulatorOrigin !== null) {
      const origin = this.emulatorOrigin;
      return `${origin}/${projectId}/${this.region}/${name2}`;
    }
    if (this.customDomain !== null) {
      return `${this.customDomain}/${name2}`;
    }
    return `https://${this.region}-${projectId}.cloudfunctions.net/${name2}`;
  }
}
function connectFunctionsEmulator$1(functionsInstance, host, port) {
  const useSsl = isCloudWorkstation(host);
  functionsInstance.emulatorOrigin = `http${useSsl ? "s" : ""}://${host}:${port}`;
  if (useSsl) {
    void pingServer(functionsInstance.emulatorOrigin);
    updateEmulatorBanner("Functions", true);
  }
}
function httpsCallable$1(functionsInstance, name2, options) {
  const callable = (data) => {
    return call(functionsInstance, name2, data, {});
  };
  callable.stream = (data, options2) => {
    return stream(functionsInstance, name2, data, options2);
  };
  return callable;
}
function postJSON(url, body, headers, fetchImpl) {
  return __async(this, null, function* () {
    headers["Content-Type"] = "application/json";
    let response;
    try {
      response = yield fetchImpl(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers
      });
    } catch (e) {
      return {
        status: 0,
        json: null
      };
    }
    let json = null;
    try {
      json = yield response.json();
    } catch (e) {
    }
    return {
      status: response.status,
      json
    };
  });
}
function makeAuthHeaders(functionsInstance, options) {
  return __async(this, null, function* () {
    const headers = {};
    const context = yield functionsInstance.contextProvider.getContext(options.limitedUseAppCheckTokens);
    if (context.authToken) {
      headers["Authorization"] = "Bearer " + context.authToken;
    }
    if (context.messagingToken) {
      headers["Firebase-Instance-ID-Token"] = context.messagingToken;
    }
    if (context.appCheckToken !== null) {
      headers["X-Firebase-AppCheck"] = context.appCheckToken;
    }
    return headers;
  });
}
function call(functionsInstance, name2, data, options) {
  const url = functionsInstance._url(name2);
  return callAtURL(functionsInstance, url, data, options);
}
function callAtURL(functionsInstance, url, data, options) {
  return __async(this, null, function* () {
    data = encode(data);
    const body = { data };
    const headers = yield makeAuthHeaders(functionsInstance, options);
    const timeout = options.timeout || 7e4;
    const failAfterHandle = failAfter(timeout);
    const response = yield Promise.race([
      postJSON(url, body, headers, functionsInstance.fetchImpl),
      failAfterHandle.promise,
      functionsInstance.cancelAllRequests
    ]);
    failAfterHandle.cancel();
    if (!response) {
      throw new FunctionsError("cancelled", "Firebase Functions instance was deleted.");
    }
    const error = _errorForResponse(response.status, response.json);
    if (error) {
      throw error;
    }
    if (!response.json) {
      throw new FunctionsError("internal", "Response is not valid JSON object.");
    }
    let responseData = response.json.data;
    if (typeof responseData === "undefined") {
      responseData = response.json.result;
    }
    if (typeof responseData === "undefined") {
      throw new FunctionsError("internal", "Response is missing data field.");
    }
    const decodedData = decode(responseData);
    return { data: decodedData };
  });
}
function stream(functionsInstance, name2, data, options) {
  const url = functionsInstance._url(name2);
  return streamAtURL(functionsInstance, url, data, options || {});
}
function streamAtURL(functionsInstance, url, data, options) {
  return __async(this, null, function* () {
    var _a;
    data = encode(data);
    const body = { data };
    const headers = yield makeAuthHeaders(functionsInstance, options);
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "text/event-stream";
    let response;
    try {
      response = yield functionsInstance.fetchImpl(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers,
        signal: options == null ? void 0 : options.signal
      });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        const error2 = new FunctionsError("cancelled", "Request was cancelled.");
        return {
          data: Promise.reject(error2),
          stream: {
            [Symbol.asyncIterator]() {
              return {
                next() {
                  return Promise.reject(error2);
                }
              };
            }
          }
        };
      }
      const error = _errorForResponse(0, null);
      return {
        data: Promise.reject(error),
        // Return an empty async iterator
        stream: {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return Promise.reject(error);
              }
            };
          }
        }
      };
    }
    let resultResolver;
    let resultRejecter;
    const resultPromise = new Promise((resolve, reject) => {
      resultResolver = resolve;
      resultRejecter = reject;
    });
    (_a = options == null ? void 0 : options.signal) == null ? void 0 : _a.addEventListener("abort", () => {
      const error = new FunctionsError("cancelled", "Request was cancelled.");
      resultRejecter(error);
    });
    const reader = response.body.getReader();
    const rstream = createResponseStream(reader, resultResolver, resultRejecter, options == null ? void 0 : options.signal);
    return {
      stream: {
        [Symbol.asyncIterator]() {
          const rreader = rstream.getReader();
          return {
            next() {
              return __async(this, null, function* () {
                const { value, done } = yield rreader.read();
                return { value, done };
              });
            },
            return() {
              return __async(this, null, function* () {
                yield rreader.cancel();
                return { done: true, value: void 0 };
              });
            }
          };
        }
      },
      data: resultPromise
    };
  });
}
function createResponseStream(reader, resultResolver, resultRejecter, signal) {
  const processLine = (line, controller) => {
    const match = line.match(responseLineRE);
    if (!match) {
      return;
    }
    const data = match[1];
    try {
      const jsonData = JSON.parse(data);
      if ("result" in jsonData) {
        resultResolver(decode(jsonData.result));
        return;
      }
      if ("message" in jsonData) {
        controller.enqueue(decode(jsonData.message));
        return;
      }
      if ("error" in jsonData) {
        const error = _errorForResponse(0, jsonData);
        controller.error(error);
        resultRejecter(error);
        return;
      }
    } catch (error) {
      if (error instanceof FunctionsError) {
        controller.error(error);
        resultRejecter(error);
        return;
      }
    }
  };
  const decoder = new TextDecoder();
  return new ReadableStream({
    start(controller) {
      let currentText = "";
      return pump();
      function pump() {
        return __async(this, null, function* () {
          if (signal == null ? void 0 : signal.aborted) {
            const error = new FunctionsError("cancelled", "Request was cancelled");
            controller.error(error);
            resultRejecter(error);
            return Promise.resolve();
          }
          try {
            const { value, done } = yield reader.read();
            if (done) {
              if (currentText.trim()) {
                processLine(currentText.trim(), controller);
              }
              controller.close();
              return;
            }
            if (signal == null ? void 0 : signal.aborted) {
              const error = new FunctionsError("cancelled", "Request was cancelled");
              controller.error(error);
              resultRejecter(error);
              yield reader.cancel();
              return;
            }
            currentText += decoder.decode(value, { stream: true });
            const lines = currentText.split("\n");
            currentText = lines.pop() || "";
            for (const line of lines) {
              if (line.trim()) {
                processLine(line.trim(), controller);
              }
            }
            return pump();
          } catch (error) {
            const functionsError = error instanceof FunctionsError ? error : _errorForResponse(0, null);
            controller.error(functionsError);
            resultRejecter(functionsError);
          }
        });
      }
    },
    cancel() {
      return reader.cancel();
    }
  });
}
const name$1 = "@firebase/functions";
const version$1 = "0.13.0";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const AUTH_INTERNAL_NAME = "auth-internal";
const APP_CHECK_INTERNAL_NAME = "app-check-internal";
const MESSAGING_INTERNAL_NAME = "messaging-internal";
function registerFunctions(variant) {
  const factory2 = (container, { instanceIdentifier: regionOrCustomDomain }) => {
    const app2 = container.getProvider("app").getImmediate();
    const authProvider = container.getProvider(AUTH_INTERNAL_NAME);
    const messagingProvider = container.getProvider(MESSAGING_INTERNAL_NAME);
    const appCheckProvider = container.getProvider(APP_CHECK_INTERNAL_NAME);
    return new FunctionsService(app2, authProvider, messagingProvider, appCheckProvider, regionOrCustomDomain);
  };
  _registerComponent(new Component(
    FUNCTIONS_TYPE,
    factory2,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setMultipleInstances(true));
  registerVersion(name$1, version$1, variant);
  registerVersion(name$1, version$1, "esm2020");
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getFunctions(app2 = getApp(), regionOrCustomDomain = DEFAULT_REGION) {
  const functionsProvider = _getProvider(getModularInstance(app2), FUNCTIONS_TYPE);
  const functionsInstance = functionsProvider.getImmediate({
    identifier: regionOrCustomDomain
  });
  const emulator = getDefaultEmulatorHostnameAndPort("functions");
  if (emulator) {
    connectFunctionsEmulator(functionsInstance, ...emulator);
  }
  return functionsInstance;
}
function connectFunctionsEmulator(functionsInstance, host, port) {
  connectFunctionsEmulator$1(getModularInstance(functionsInstance), host, port);
}
function httpsCallable(functionsInstance, name2, options) {
  return httpsCallable$1(getModularInstance(functionsInstance), name2);
}
registerFunctions();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_HOST = "firebasestorage.googleapis.com";
const CONFIG_STORAGE_BUCKET_KEY = "storageBucket";
const DEFAULT_MAX_OPERATION_RETRY_TIME = 2 * 60 * 1e3;
const DEFAULT_MAX_UPLOAD_RETRY_TIME = 10 * 60 * 1e3;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class StorageError extends FirebaseError {
  /**
   * @param code - A `StorageErrorCode` string to be prefixed with 'storage/' and
   *  added to the end of the message.
   * @param message  - Error message.
   * @param status_ - Corresponding HTTP Status Code
   */
  constructor(code, message, status_ = 0) {
    super(prependCode(code), `Firebase Storage: ${message} (${prependCode(code)})`);
    this.status_ = status_;
    this.customData = { serverResponse: null };
    this._baseMessage = this.message;
    Object.setPrototypeOf(this, StorageError.prototype);
  }
  get status() {
    return this.status_;
  }
  set status(status) {
    this.status_ = status;
  }
  /**
   * Compares a `StorageErrorCode` against this error's code, filtering out the prefix.
   */
  _codeEquals(code) {
    return prependCode(code) === this.code;
  }
  /**
   * Optional response message that was added by the server.
   */
  get serverResponse() {
    return this.customData.serverResponse;
  }
  set serverResponse(serverResponse) {
    this.customData.serverResponse = serverResponse;
    if (this.customData.serverResponse) {
      this.message = `${this._baseMessage}
${this.customData.serverResponse}`;
    } else {
      this.message = this._baseMessage;
    }
  }
}
var StorageErrorCode;
(function(StorageErrorCode2) {
  StorageErrorCode2["UNKNOWN"] = "unknown";
  StorageErrorCode2["OBJECT_NOT_FOUND"] = "object-not-found";
  StorageErrorCode2["BUCKET_NOT_FOUND"] = "bucket-not-found";
  StorageErrorCode2["PROJECT_NOT_FOUND"] = "project-not-found";
  StorageErrorCode2["QUOTA_EXCEEDED"] = "quota-exceeded";
  StorageErrorCode2["UNAUTHENTICATED"] = "unauthenticated";
  StorageErrorCode2["UNAUTHORIZED"] = "unauthorized";
  StorageErrorCode2["UNAUTHORIZED_APP"] = "unauthorized-app";
  StorageErrorCode2["RETRY_LIMIT_EXCEEDED"] = "retry-limit-exceeded";
  StorageErrorCode2["INVALID_CHECKSUM"] = "invalid-checksum";
  StorageErrorCode2["CANCELED"] = "canceled";
  StorageErrorCode2["INVALID_EVENT_NAME"] = "invalid-event-name";
  StorageErrorCode2["INVALID_URL"] = "invalid-url";
  StorageErrorCode2["INVALID_DEFAULT_BUCKET"] = "invalid-default-bucket";
  StorageErrorCode2["NO_DEFAULT_BUCKET"] = "no-default-bucket";
  StorageErrorCode2["CANNOT_SLICE_BLOB"] = "cannot-slice-blob";
  StorageErrorCode2["SERVER_FILE_WRONG_SIZE"] = "server-file-wrong-size";
  StorageErrorCode2["NO_DOWNLOAD_URL"] = "no-download-url";
  StorageErrorCode2["INVALID_ARGUMENT"] = "invalid-argument";
  StorageErrorCode2["INVALID_ARGUMENT_COUNT"] = "invalid-argument-count";
  StorageErrorCode2["APP_DELETED"] = "app-deleted";
  StorageErrorCode2["INVALID_ROOT_OPERATION"] = "invalid-root-operation";
  StorageErrorCode2["INVALID_FORMAT"] = "invalid-format";
  StorageErrorCode2["INTERNAL_ERROR"] = "internal-error";
  StorageErrorCode2["UNSUPPORTED_ENVIRONMENT"] = "unsupported-environment";
})(StorageErrorCode || (StorageErrorCode = {}));
function prependCode(code) {
  return "storage/" + code;
}
function unknown() {
  const message = "An unknown error occurred, please check the error payload for server response.";
  return new StorageError(StorageErrorCode.UNKNOWN, message);
}
function retryLimitExceeded() {
  return new StorageError(StorageErrorCode.RETRY_LIMIT_EXCEEDED, "Max retry time for operation exceeded, please try again.");
}
function canceled() {
  return new StorageError(StorageErrorCode.CANCELED, "User canceled the upload/download.");
}
function invalidUrl(url) {
  return new StorageError(StorageErrorCode.INVALID_URL, "Invalid URL '" + url + "'.");
}
function invalidDefaultBucket(bucket) {
  return new StorageError(StorageErrorCode.INVALID_DEFAULT_BUCKET, "Invalid default bucket '" + bucket + "'.");
}
function invalidArgument(message) {
  return new StorageError(StorageErrorCode.INVALID_ARGUMENT, message);
}
function appDeleted() {
  return new StorageError(StorageErrorCode.APP_DELETED, "The Firebase app was deleted.");
}
function invalidRootOperation(name2) {
  return new StorageError(StorageErrorCode.INVALID_ROOT_OPERATION, "The operation '" + name2 + "' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Location {
  constructor(bucket, path) {
    this.bucket = bucket;
    this.path_ = path;
  }
  get path() {
    return this.path_;
  }
  get isRoot() {
    return this.path.length === 0;
  }
  fullServerUrl() {
    const encode2 = encodeURIComponent;
    return "/b/" + encode2(this.bucket) + "/o/" + encode2(this.path);
  }
  bucketOnlyServerUrl() {
    const encode2 = encodeURIComponent;
    return "/b/" + encode2(this.bucket) + "/o";
  }
  static makeFromBucketSpec(bucketString, host) {
    let bucketLocation;
    try {
      bucketLocation = Location.makeFromUrl(bucketString, host);
    } catch (e) {
      return new Location(bucketString, "");
    }
    if (bucketLocation.path === "") {
      return bucketLocation;
    } else {
      throw invalidDefaultBucket(bucketString);
    }
  }
  static makeFromUrl(url, host) {
    let location = null;
    const bucketDomain = "([A-Za-z0-9.\\-_]+)";
    function gsModify(loc) {
      if (loc.path.charAt(loc.path.length - 1) === "/") {
        loc.path_ = loc.path_.slice(0, -1);
      }
    }
    const gsPath = "(/(.*))?$";
    const gsRegex = new RegExp("^gs://" + bucketDomain + gsPath, "i");
    const gsIndices = { bucket: 1, path: 3 };
    function httpModify(loc) {
      loc.path_ = decodeURIComponent(loc.path);
    }
    const version2 = "v[A-Za-z0-9_]+";
    const firebaseStorageHost = host.replace(/[.]/g, "\\.");
    const firebaseStoragePath = "(/([^?#]*).*)?$";
    const firebaseStorageRegExp = new RegExp(`^https?://${firebaseStorageHost}/${version2}/b/${bucketDomain}/o${firebaseStoragePath}`, "i");
    const firebaseStorageIndices = { bucket: 1, path: 3 };
    const cloudStorageHost = host === DEFAULT_HOST ? "(?:storage.googleapis.com|storage.cloud.google.com)" : host;
    const cloudStoragePath = "([^?#]*)";
    const cloudStorageRegExp = new RegExp(`^https?://${cloudStorageHost}/${bucketDomain}/${cloudStoragePath}`, "i");
    const cloudStorageIndices = { bucket: 1, path: 2 };
    const groups = [
      { regex: gsRegex, indices: gsIndices, postModify: gsModify },
      {
        regex: firebaseStorageRegExp,
        indices: firebaseStorageIndices,
        postModify: httpModify
      },
      {
        regex: cloudStorageRegExp,
        indices: cloudStorageIndices,
        postModify: httpModify
      }
    ];
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const captures = group.regex.exec(url);
      if (captures) {
        const bucketValue = captures[group.indices.bucket];
        let pathValue = captures[group.indices.path];
        if (!pathValue) {
          pathValue = "";
        }
        location = new Location(bucketValue, pathValue);
        group.postModify(location);
        break;
      }
    }
    if (location == null) {
      throw invalidUrl(url);
    }
    return location;
  }
}
class FailRequest {
  constructor(error) {
    this.promise_ = Promise.reject(error);
  }
  /** @inheritDoc */
  getPromise() {
    return this.promise_;
  }
  /** @inheritDoc */
  cancel(_appDelete = false) {
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function start(doRequest, backoffCompleteCb, timeout) {
  let waitSeconds = 1;
  let retryTimeoutId = null;
  let globalTimeoutId = null;
  let hitTimeout = false;
  let cancelState = 0;
  function canceled2() {
    return cancelState === 2;
  }
  let triggeredCallback = false;
  function triggerCallback(...args) {
    if (!triggeredCallback) {
      triggeredCallback = true;
      backoffCompleteCb.apply(null, args);
    }
  }
  function callWithDelay(millis) {
    retryTimeoutId = setTimeout(() => {
      retryTimeoutId = null;
      doRequest(responseHandler, canceled2());
    }, millis);
  }
  function clearGlobalTimeout() {
    if (globalTimeoutId) {
      clearTimeout(globalTimeoutId);
    }
  }
  function responseHandler(success, ...args) {
    if (triggeredCallback) {
      clearGlobalTimeout();
      return;
    }
    if (success) {
      clearGlobalTimeout();
      triggerCallback.call(null, success, ...args);
      return;
    }
    const mustStop = canceled2() || hitTimeout;
    if (mustStop) {
      clearGlobalTimeout();
      triggerCallback.call(null, success, ...args);
      return;
    }
    if (waitSeconds < 64) {
      waitSeconds *= 2;
    }
    let waitMillis;
    if (cancelState === 1) {
      cancelState = 2;
      waitMillis = 0;
    } else {
      waitMillis = (waitSeconds + Math.random()) * 1e3;
    }
    callWithDelay(waitMillis);
  }
  let stopped = false;
  function stop2(wasTimeout) {
    if (stopped) {
      return;
    }
    stopped = true;
    clearGlobalTimeout();
    if (triggeredCallback) {
      return;
    }
    if (retryTimeoutId !== null) {
      if (!wasTimeout) {
        cancelState = 2;
      }
      clearTimeout(retryTimeoutId);
      callWithDelay(0);
    } else {
      if (!wasTimeout) {
        cancelState = 1;
      }
    }
  }
  callWithDelay(0);
  globalTimeoutId = setTimeout(() => {
    hitTimeout = true;
    stop2(true);
  }, timeout);
  return stop2;
}
function stop(id) {
  id(false);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function isJustDef(p) {
  return p !== void 0;
}
function validateNumber(argument, minValue, maxValue, value) {
  if (value < minValue) {
    throw invalidArgument(`Invalid value for '${argument}'. Expected ${minValue} or greater.`);
  }
  if (value > maxValue) {
    throw invalidArgument(`Invalid value for '${argument}'. Expected ${maxValue} or less.`);
  }
}
function makeQueryString(params) {
  const encode2 = encodeURIComponent;
  let queryPart = "?";
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const nextPart = encode2(key) + "=" + encode2(params[key]);
      queryPart = queryPart + nextPart + "&";
    }
  }
  queryPart = queryPart.slice(0, -1);
  return queryPart;
}
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["NO_ERROR"] = 0] = "NO_ERROR";
  ErrorCode2[ErrorCode2["NETWORK_ERROR"] = 1] = "NETWORK_ERROR";
  ErrorCode2[ErrorCode2["ABORT"] = 2] = "ABORT";
})(ErrorCode || (ErrorCode = {}));
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function isRetryStatusCode(status, additionalRetryCodes) {
  const isFiveHundredCode = status >= 500 && status < 600;
  const extraRetryCodes = [
    // Request Timeout: web server didn't receive full request in time.
    408,
    // Too Many Requests: you're getting rate-limited, basically.
    429
  ];
  const isExtraRetryCode = extraRetryCodes.indexOf(status) !== -1;
  const isAdditionalRetryCode = additionalRetryCodes.indexOf(status) !== -1;
  return isFiveHundredCode || isExtraRetryCode || isAdditionalRetryCode;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class NetworkRequest {
  constructor(url_, method_, headers_, body_, successCodes_, additionalRetryCodes_, callback_, errorCallback_, timeout_, progressCallback_, connectionFactory_, retry = true, isUsingEmulator = false) {
    this.url_ = url_;
    this.method_ = method_;
    this.headers_ = headers_;
    this.body_ = body_;
    this.successCodes_ = successCodes_;
    this.additionalRetryCodes_ = additionalRetryCodes_;
    this.callback_ = callback_;
    this.errorCallback_ = errorCallback_;
    this.timeout_ = timeout_;
    this.progressCallback_ = progressCallback_;
    this.connectionFactory_ = connectionFactory_;
    this.retry = retry;
    this.isUsingEmulator = isUsingEmulator;
    this.pendingConnection_ = null;
    this.backoffId_ = null;
    this.canceled_ = false;
    this.appDelete_ = false;
    this.promise_ = new Promise((resolve, reject) => {
      this.resolve_ = resolve;
      this.reject_ = reject;
      this.start_();
    });
  }
  /**
   * Actually starts the retry loop.
   */
  start_() {
    const doTheRequest = (backoffCallback, canceled2) => {
      if (canceled2) {
        backoffCallback(false, new RequestEndStatus(false, null, true));
        return;
      }
      const connection = this.connectionFactory_();
      this.pendingConnection_ = connection;
      const progressListener = (progressEvent) => {
        const loaded = progressEvent.loaded;
        const total = progressEvent.lengthComputable ? progressEvent.total : -1;
        if (this.progressCallback_ !== null) {
          this.progressCallback_(loaded, total);
        }
      };
      if (this.progressCallback_ !== null) {
        connection.addUploadProgressListener(progressListener);
      }
      connection.send(this.url_, this.method_, this.isUsingEmulator, this.body_, this.headers_).then(() => {
        if (this.progressCallback_ !== null) {
          connection.removeUploadProgressListener(progressListener);
        }
        this.pendingConnection_ = null;
        const hitServer = connection.getErrorCode() === ErrorCode.NO_ERROR;
        const status = connection.getStatus();
        if (!hitServer || isRetryStatusCode(status, this.additionalRetryCodes_) && this.retry) {
          const wasCanceled = connection.getErrorCode() === ErrorCode.ABORT;
          backoffCallback(false, new RequestEndStatus(false, null, wasCanceled));
          return;
        }
        const successCode = this.successCodes_.indexOf(status) !== -1;
        backoffCallback(true, new RequestEndStatus(successCode, connection));
      });
    };
    const backoffDone = (requestWentThrough, status) => {
      const resolve = this.resolve_;
      const reject = this.reject_;
      const connection = status.connection;
      if (status.wasSuccessCode) {
        try {
          const result = this.callback_(connection, connection.getResponse());
          if (isJustDef(result)) {
            resolve(result);
          } else {
            resolve();
          }
        } catch (e) {
          reject(e);
        }
      } else {
        if (connection !== null) {
          const err = unknown();
          err.serverResponse = connection.getErrorText();
          if (this.errorCallback_) {
            reject(this.errorCallback_(connection, err));
          } else {
            reject(err);
          }
        } else {
          if (status.canceled) {
            const err = this.appDelete_ ? appDeleted() : canceled();
            reject(err);
          } else {
            const err = retryLimitExceeded();
            reject(err);
          }
        }
      }
    };
    if (this.canceled_) {
      backoffDone(false, new RequestEndStatus(false, null, true));
    } else {
      this.backoffId_ = start(doTheRequest, backoffDone, this.timeout_);
    }
  }
  /** @inheritDoc */
  getPromise() {
    return this.promise_;
  }
  /** @inheritDoc */
  cancel(appDelete) {
    this.canceled_ = true;
    this.appDelete_ = appDelete || false;
    if (this.backoffId_ !== null) {
      stop(this.backoffId_);
    }
    if (this.pendingConnection_ !== null) {
      this.pendingConnection_.abort();
    }
  }
}
class RequestEndStatus {
  constructor(wasSuccessCode, connection, canceled2) {
    this.wasSuccessCode = wasSuccessCode;
    this.connection = connection;
    this.canceled = !!canceled2;
  }
}
function addAuthHeader_(headers, authToken) {
  if (authToken !== null && authToken.length > 0) {
    headers["Authorization"] = "Firebase " + authToken;
  }
}
function addVersionHeader_(headers, firebaseVersion) {
  headers["X-Firebase-Storage-Version"] = "webjs/" + (firebaseVersion != null ? firebaseVersion : "AppManager");
}
function addGmpidHeader_(headers, appId) {
  if (appId) {
    headers["X-Firebase-GMPID"] = appId;
  }
}
function addAppCheckHeader_(headers, appCheckToken) {
  if (appCheckToken !== null) {
    headers["X-Firebase-AppCheck"] = appCheckToken;
  }
}
function makeRequest(requestInfo, appId, authToken, appCheckToken, requestFactory, firebaseVersion, retry = true, isUsingEmulator = false) {
  const queryPart = makeQueryString(requestInfo.urlParams);
  const url = requestInfo.url + queryPart;
  const headers = Object.assign({}, requestInfo.headers);
  addGmpidHeader_(headers, appId);
  addAuthHeader_(headers, authToken);
  addVersionHeader_(headers, firebaseVersion);
  addAppCheckHeader_(headers, appCheckToken);
  return new NetworkRequest(url, requestInfo.method, headers, requestInfo.body, requestInfo.successCodes, requestInfo.additionalRetryCodes, requestInfo.handler, requestInfo.errorHandler, requestInfo.timeout, requestInfo.progressCallback, requestFactory, retry, isUsingEmulator);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function parent(path) {
  if (path.length === 0) {
    return null;
  }
  const index = path.lastIndexOf("/");
  if (index === -1) {
    return "";
  }
  const newPath = path.slice(0, index);
  return newPath;
}
function lastComponent(path) {
  const index = path.lastIndexOf("/", path.length - 2);
  if (index === -1) {
    return path;
  } else {
    return path.slice(index + 1);
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Reference {
  constructor(_service, location) {
    this._service = _service;
    if (location instanceof Location) {
      this._location = location;
    } else {
      this._location = Location.makeFromUrl(location, _service.host);
    }
  }
  /**
   * Returns the URL for the bucket and path this object references,
   *     in the form gs://<bucket>/<object-path>
   * @override
   */
  toString() {
    return "gs://" + this._location.bucket + "/" + this._location.path;
  }
  _newRef(service, location) {
    return new Reference(service, location);
  }
  /**
   * A reference to the root of this object's bucket.
   */
  get root() {
    const location = new Location(this._location.bucket, "");
    return this._newRef(this._service, location);
  }
  /**
   * The name of the bucket containing this reference's object.
   */
  get bucket() {
    return this._location.bucket;
  }
  /**
   * The full path of this object.
   */
  get fullPath() {
    return this._location.path;
  }
  /**
   * The short name of this object, which is the last component of the full path.
   * For example, if fullPath is 'full/path/image.png', name is 'image.png'.
   */
  get name() {
    return lastComponent(this._location.path);
  }
  /**
   * The `StorageService` instance this `StorageReference` is associated with.
   */
  get storage() {
    return this._service;
  }
  /**
   * A `StorageReference` pointing to the parent location of this `StorageReference`, or null if
   * this reference is the root.
   */
  get parent() {
    const newPath = parent(this._location.path);
    if (newPath === null) {
      return null;
    }
    const location = new Location(this._location.bucket, newPath);
    return new Reference(this._service, location);
  }
  /**
   * Utility function to throw an error in methods that do not accept a root reference.
   */
  _throwIfRoot(name2) {
    if (this._location.path === "") {
      throw invalidRootOperation(name2);
    }
  }
}
function extractBucket(host, config) {
  const bucketString = config == null ? void 0 : config[CONFIG_STORAGE_BUCKET_KEY];
  if (bucketString == null) {
    return null;
  }
  return Location.makeFromBucketSpec(bucketString, host);
}
function connectStorageEmulator$1(storage, host, port, options = {}) {
  storage.host = `${host}:${port}`;
  const useSsl = isCloudWorkstation(host);
  if (useSsl) {
    void pingServer(`https://${storage.host}/b`);
    updateEmulatorBanner("Storage", true);
  }
  storage._isUsingEmulator = true;
  storage._protocol = useSsl ? "https" : "http";
  const { mockUserToken } = options;
  if (mockUserToken) {
    storage._overrideAuthToken = typeof mockUserToken === "string" ? mockUserToken : createMockUserToken(mockUserToken, storage.app.options.projectId);
  }
}
class FirebaseStorageImpl {
  constructor(app2, _authProvider, _appCheckProvider, _url, _firebaseVersion, _isUsingEmulator = false) {
    this.app = app2;
    this._authProvider = _authProvider;
    this._appCheckProvider = _appCheckProvider;
    this._url = _url;
    this._firebaseVersion = _firebaseVersion;
    this._isUsingEmulator = _isUsingEmulator;
    this._bucket = null;
    this._host = DEFAULT_HOST;
    this._protocol = "https";
    this._appId = null;
    this._deleted = false;
    this._maxOperationRetryTime = DEFAULT_MAX_OPERATION_RETRY_TIME;
    this._maxUploadRetryTime = DEFAULT_MAX_UPLOAD_RETRY_TIME;
    this._requests = /* @__PURE__ */ new Set();
    if (_url != null) {
      this._bucket = Location.makeFromBucketSpec(_url, this._host);
    } else {
      this._bucket = extractBucket(this._host, this.app.options);
    }
  }
  /**
   * The host string for this service, in the form of `host` or
   * `host:port`.
   */
  get host() {
    return this._host;
  }
  set host(host) {
    this._host = host;
    if (this._url != null) {
      this._bucket = Location.makeFromBucketSpec(this._url, host);
    } else {
      this._bucket = extractBucket(host, this.app.options);
    }
  }
  /**
   * The maximum time to retry uploads in milliseconds.
   */
  get maxUploadRetryTime() {
    return this._maxUploadRetryTime;
  }
  set maxUploadRetryTime(time) {
    validateNumber(
      "time",
      /* minValue=*/
      0,
      /* maxValue= */
      Number.POSITIVE_INFINITY,
      time
    );
    this._maxUploadRetryTime = time;
  }
  /**
   * The maximum time to retry operations other than uploads or downloads in
   * milliseconds.
   */
  get maxOperationRetryTime() {
    return this._maxOperationRetryTime;
  }
  set maxOperationRetryTime(time) {
    validateNumber(
      "time",
      /* minValue=*/
      0,
      /* maxValue= */
      Number.POSITIVE_INFINITY,
      time
    );
    this._maxOperationRetryTime = time;
  }
  _getAuthToken() {
    return __async(this, null, function* () {
      if (this._overrideAuthToken) {
        return this._overrideAuthToken;
      }
      const auth2 = this._authProvider.getImmediate({ optional: true });
      if (auth2) {
        const tokenData = yield auth2.getToken();
        if (tokenData !== null) {
          return tokenData.accessToken;
        }
      }
      return null;
    });
  }
  _getAppCheckToken() {
    return __async(this, null, function* () {
      if (_isFirebaseServerApp(this.app) && this.app.settings.appCheckToken) {
        return this.app.settings.appCheckToken;
      }
      const appCheck = this._appCheckProvider.getImmediate({ optional: true });
      if (appCheck) {
        const result = yield appCheck.getToken();
        return result.token;
      }
      return null;
    });
  }
  /**
   * Stop running requests and prevent more from being created.
   */
  _delete() {
    if (!this._deleted) {
      this._deleted = true;
      this._requests.forEach((request) => request.cancel());
      this._requests.clear();
    }
    return Promise.resolve();
  }
  /**
   * Returns a new firebaseStorage.Reference object referencing this StorageService
   * at the given Location.
   */
  _makeStorageReference(loc) {
    return new Reference(this, loc);
  }
  /**
   * @param requestInfo - HTTP RequestInfo object
   * @param authToken - Firebase auth token
   */
  _makeRequest(requestInfo, requestFactory, authToken, appCheckToken, retry = true) {
    if (!this._deleted) {
      const request = makeRequest(requestInfo, this._appId, authToken, appCheckToken, requestFactory, this._firebaseVersion, retry, this._isUsingEmulator);
      this._requests.add(request);
      request.getPromise().then(() => this._requests.delete(request), () => this._requests.delete(request));
      return request;
    } else {
      return new FailRequest(appDeleted());
    }
  }
  makeRequestWithTokens(requestInfo, requestFactory) {
    return __async(this, null, function* () {
      const [authToken, appCheckToken] = yield Promise.all([
        this._getAuthToken(),
        this._getAppCheckToken()
      ]);
      return this._makeRequest(requestInfo, requestFactory, authToken, appCheckToken).getPromise();
    });
  }
}
const name = "@firebase/storage";
const version = "0.14.0";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const STORAGE_TYPE = "storage";
function getStorage(app2 = getApp(), bucketUrl) {
  app2 = getModularInstance(app2);
  const storageProvider = _getProvider(app2, STORAGE_TYPE);
  const storageInstance = storageProvider.getImmediate({
    identifier: bucketUrl
  });
  const emulator = getDefaultEmulatorHostnameAndPort("storage");
  if (emulator) {
    connectStorageEmulator(storageInstance, ...emulator);
  }
  return storageInstance;
}
function connectStorageEmulator(storage, host, port, options = {}) {
  connectStorageEmulator$1(storage, host, port, options);
}
function factory(container, { instanceIdentifier: url }) {
  const app2 = container.getProvider("app").getImmediate();
  const authProvider = container.getProvider("auth-internal");
  const appCheckProvider = container.getProvider("app-check-internal");
  return new FirebaseStorageImpl(app2, authProvider, appCheckProvider, url, SDK_VERSION);
}
function registerStorage() {
  _registerComponent(new Component(
    STORAGE_TYPE,
    factory,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setMultipleInstances(true));
  registerVersion(name, version, "");
  registerVersion(name, version, "esm2020");
}
registerStorage();
const __vite_import_meta_env__ = {};
const getFirebaseConfig = () => {
  if (typeof window !== "undefined" && window.FIREBASE_CONFIG) {
    return window.FIREBASE_CONFIG;
  }
  const envApiKey = __vite_import_meta_env__ == null ? void 0 : __vite_import_meta_env__.VITE_FIREBASE_API_KEY;
  return {
    apiKey: envApiKey || "AIzaSyDFnIzSYCdPsDDdvP1lympVxEeUn0AQhWs",
    authDomain: "backbone-logic.firebaseapp.com",
    projectId: "backbone-logic",
    databaseURL: "https://backbone-logic-default-rtdb.firebaseio.com",
    storageBucket: "backbone-logic.firebasestorage.app",
    messagingSenderId: "749245129278",
    appId: "1:749245129278:web:dfa5647101ea160a3b276f",
    measurementId: "G-8SZRDQ4XVR"
  };
};
const firebaseConfig = getFirebaseConfig();
let app;
if (typeof window !== "undefined" && window.firebaseApp) {
  console.log("🔥 [Firebase] Using globally initialized Firebase app");
  app = window.firebaseApp;
} else {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log("🔥 [Firebase] Using existing Firebase app:", app.name);
    if (typeof window !== "undefined") {
      window.firebaseApp = app;
    }
  } else {
    try {
      app = initializeApp(firebaseConfig);
      console.log("🔥 [Firebase] App initialized successfully");
      if (typeof window !== "undefined") {
        window.firebaseApp = app;
      }
    } catch (error) {
      console.error("❌ [Firebase] Failed to initialize app:", error);
      const fallbackApps = getApps();
      if (fallbackApps.length > 0) {
        app = fallbackApps[0];
        console.log("🔥 [Firebase] Using fallback existing app:", app.name);
      }
    }
  }
}
function ensureAppInitialized() {
  return __async(this, null, function* () {
    if (app) return app;
    if (typeof window !== "undefined" && window.firebaseApp) {
      app = window.firebaseApp;
      console.log("✅ [Firebase] Found global app instance");
      return app;
    }
    try {
      const { getApps: getApps2 } = yield __vitePreload(() => __async(this, null, function* () {
        const { getApps: getApps22 } = yield Promise.resolve().then(() => index_esm);
        return { getApps: getApps22 };
      }), true ? void 0 : void 0);
      const apps = getApps2();
      if (apps.length > 0) {
        app = apps[0];
        console.log("✅ [Firebase] Using existing app instance");
        if (typeof window !== "undefined") {
          window.firebaseApp = app;
        }
        return app;
      }
    } catch (importError) {
      console.warn("⚠️ [Firebase] Failed to get existing apps:", importError);
    }
    try {
      app = initializeApp(firebaseConfig, "fallback");
      console.log("✅ [Firebase] Created fallback app instance");
      if (typeof window !== "undefined") {
        window.firebaseApp = app;
      }
      return app;
    } catch (fallbackError) {
      console.error("❌ [Firebase] Failed to create fallback app:", fallbackError);
      throw new Error("Failed to initialize Firebase app");
    }
  });
}
const db = app ? getFirestore(app) : getFirestore();
const auth = app ? getAuth(app) : getAuth();
const isEmulator = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
if (isEmulator && app) {
  console.log("🔧 [FIREBASE SERVICE] Connecting to Firebase emulators...");
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    console.log("✅ [FIREBASE SERVICE] Connected to SHARED Auth Emulator (port 9099)");
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("✅ [FIREBASE SERVICE] Connected to SHARED Firestore Emulator (port 8080)");
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("✅ [FIREBASE SERVICE] Connected to SHARED Functions Emulator (port 5001)");
    const storage = getStorage(app);
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("✅ [FIREBASE SERVICE] Connected to SHARED Storage Emulator (port 9199)");
    console.log("🎉 [FIREBASE SERVICE] All emulators connected successfully!");
  } catch (error) {
    console.warn("⚠️ [FIREBASE SERVICE] Emulators may already be connected:", (error == null ? void 0 : error.message) || error);
  }
}
if (auth) {
  __vitePreload(() => __async(void 0, null, function* () {
    const { setPersistence, browserLocalPersistence } = yield import("./index.esm-BMygn4u3.js");
    return { setPersistence, browserLocalPersistence };
  }), true ? __vite__mapDeps([0,1]) : void 0).then(({ setPersistence, browserLocalPersistence }) => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn("⚠️ [Firebase] Failed to set auth persistence:", error);
    });
  }).catch((error) => {
    console.warn("⚠️ [Firebase] Failed to import auth persistence:", error);
  });
}
function getInitializedServices() {
  return __async(this, null, function* () {
    const initializedApp = yield ensureAppInitialized();
    return {
      app: initializedApp,
      db: getFirestore(initializedApp),
      auth: getAuth(initializedApp)
    };
  });
}
function fixCSPIssues() {
  if (typeof window === "undefined") return;
  try {
    console.log("ℹ️ [Firebase] Skipping client-side CSP override - relying on Firebase hosting CSP");
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
      console.log("🧹 [Firebase] Removed conflicting client-side CSP meta tag");
    }
  } catch (error) {
    console.warn("⚠️ [Firebase] Failed to clean up CSP:", error);
  }
}
fixCSPIssues();
if (typeof window !== "undefined") {
  window.FIREBASE_IGNORE_UNDEFINED_PROPERTIES = true;
}
console.log("🌐 [Firebase] Licensing website mode: production (web-only) - no emulators");
const isWebOnlyMode = () => {
  return true;
};
let collectionManagerInitialized = false;
const initializeFirebaseCollections = () => __async(void 0, null, function* () {
  if (collectionManagerInitialized) return;
  try {
    const { firestoreCollectionManager } = yield __vitePreload(() => __async(void 0, null, function* () {
      const { firestoreCollectionManager: firestoreCollectionManager2 } = yield import("./FirestoreCollectionManager-C4RhxpKp.js");
      return { firestoreCollectionManager: firestoreCollectionManager2 };
    }), true ? __vite__mapDeps([2,3,4,5,6,7,8,1,0]) : void 0);
    yield firestoreCollectionManager.initializeCollections();
    collectionManagerInitialized = true;
    console.log("✅ [Firebase] Collection manager initialized");
  } catch (error) {
    console.error("❌ [Firebase] Failed to initialize collection manager:", error);
  }
});
const isUserAuthenticated = () => {
  return auth.currentUser !== null;
};
const getCurrentFirebaseUser = () => {
  return auth.currentUser;
};
const isEmailAuthenticated = (email) => {
  var _a;
  try {
    return ((_a = auth == null ? void 0 : auth.currentUser) == null ? void 0 : _a.email) === email;
  } catch (error) {
    console.warn("⚠️ [Firebase] Error checking email authentication:", error);
    return false;
  }
};
const loadUserFromFirestore = (firebaseUser) => __async(void 0, null, function* () {
  var _a, _b;
  try {
    const { doc: doc2, getDoc: getDoc2, query: query2, collection: collection2, where: where2, getDocs: getDocs2 } = yield __vitePreload(() => __async(void 0, null, function* () {
      const { doc: doc22, getDoc: getDoc22, query: query22, collection: collection22, where: where22, getDocs: getDocs22 } = yield import("./index.esm-CjtNHFZy.js");
      return { doc: doc22, getDoc: getDoc22, query: query22, collection: collection22, where: where22, getDocs: getDocs22 };
    }), true ? __vite__mapDeps([8,1]) : void 0);
    let userDoc = yield getDoc2(doc2(db, "users", firebaseUser.uid));
    let userData = null;
    let userId = null;
    if (userDoc.exists()) {
      userData = userDoc.data();
      userId = userDoc.id;
      console.log("✅ [Firebase] Found user by Firebase UID:", userData.email);
    } else {
      const userQuery = query2(collection2(db, "users"), where2("email", "==", firebaseUser.email));
      const userQuerySnap = yield getDocs2(userQuery);
      if (!userQuerySnap.empty) {
        userData = userQuerySnap.docs[0].data();
        userId = userQuerySnap.docs[0].id;
        console.log("✅ [Firebase] Found user by email:", userData.email);
      }
    }
    if (userData && userId) {
      return {
        id: userId,
        email: userData.email,
        name: userData.name || userData.displayName || firebaseUser.displayName || userData.email.split("@")[0],
        role: userData.role || "USER",
        organizationId: userData.organizationId,
        isTeamMember: userData.isTeamMember,
        memberRole: userData.memberRole,
        memberStatus: userData.memberStatus,
        firebaseUid: firebaseUser.uid,
        // Add subscription and license data if available
        subscription: userData.subscription,
        licenses: userData.licenses,
        teamMemberData: userData.teamMemberData
      };
    }
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || ((_a = firebaseUser.email) == null ? void 0 : _a.split("@")[0]) || "User",
      role: "USER",
      firebaseUid: firebaseUser.uid
    };
  } catch (error) {
    console.warn("⚠️ [Firebase] Failed to load user from Firestore:", error);
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || ((_b = firebaseUser.email) == null ? void 0 : _b.split("@")[0]) || "User",
      role: "USER",
      firebaseUid: firebaseUser.uid
    };
  }
});
const tryRestoreFirebaseSession = (email) => __async(void 0, null, function* () {
  try {
    console.log("🔑 [Firebase] Attempting to restore Firebase Auth session for:", email);
    if (!email || typeof email !== "string") {
      console.warn("⚠️ [Firebase] Invalid email parameter for session restoration:", email);
      return false;
    }
    if (isEmailAuthenticated(email)) {
      console.log("✅ [Firebase] User already authenticated with correct email");
      return true;
    }
    if ((auth == null ? void 0 : auth.currentUser) && auth.currentUser.email !== email) {
      console.log("🔄 [Firebase] Different user authenticated, signing out first");
      const { signOut } = yield __vitePreload(() => __async(void 0, null, function* () {
        const { signOut: signOut2 } = yield import("./index.esm-BMygn4u3.js");
        return { signOut: signOut2 };
      }), true ? __vite__mapDeps([0,1]) : void 0);
      yield signOut(auth);
    }
    try {
      const tempCredentials = localStorage.getItem("temp_credentials");
      if (tempCredentials) {
        const credentials = JSON.parse(tempCredentials);
        if (credentials.email === email && credentials.password) {
          console.log("🔑 [Firebase] Attempting to restore Firebase Auth session with stored credentials");
          const { signInWithEmailAndPassword } = yield __vitePreload(() => __async(void 0, null, function* () {
            const { signInWithEmailAndPassword: signInWithEmailAndPassword2 } = yield import("./index.esm-BMygn4u3.js");
            return { signInWithEmailAndPassword: signInWithEmailAndPassword2 };
          }), true ? __vite__mapDeps([0,1]) : void 0);
          yield signInWithEmailAndPassword(auth, email, credentials.password);
          console.log("✅ [Firebase] Firebase Auth session restored successfully");
          return true;
        }
      }
    } catch (credError) {
      console.warn("⚠️ [Firebase] Could not restore session with stored credentials:", credError);
    }
    console.log("ℹ️ [Firebase] No stored credentials available for session restoration");
    return false;
  } catch (error) {
    console.warn("⚠️ [Firebase] Error during session restoration:", error);
    return false;
  }
});
class FirebaseTeamMemberService {
  /**
   * Get organizations for a user
   */
  static getOrganizationsForUser(userId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [Firebase] Getting organizations for user:", userId);
        const ownerQuery = query(
          collection(db, "organizations"),
          where("ownerUserId", "==", userId)
        );
        const ownerSnapshot = yield getDocs(ownerQuery);
        const memberQuery = query(
          collection(db, "org_members"),
          where("userId", "==", userId),
          where("status", "==", "ACTIVE")
        );
        const memberSnapshot = yield getDocs(memberQuery);
        const orgIds = /* @__PURE__ */ new Set();
        const organizations = [];
        ownerSnapshot.forEach((doc2) => {
          const org = __spreadValues({ id: doc2.id }, doc2.data());
          organizations.push(org);
          orgIds.add(doc2.id);
        });
        for (const memberDoc of memberSnapshot.docs) {
          const memberData = memberDoc.data();
          const orgId = memberData.orgId;
          if (!orgIds.has(orgId)) {
            const orgDoc = yield getDoc(doc(db, "organizations", orgId));
            if (orgDoc.exists()) {
              const org = __spreadValues({ id: orgDoc.id }, orgDoc.data());
              organizations.push(org);
              orgIds.add(orgId);
            }
          }
        }
        console.log("✅ [Firebase] Found organizations:", organizations.length);
        return organizations;
      } catch (error) {
        console.error("❌ [Firebase] Error getting organizations:", error);
        return [];
      }
    });
  }
  /**
   * Get organization members (licensed team members)
   */
  static getOrgMembers(orgId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [Firebase] Getting org members for:", orgId);
        const q = query(
          collection(db, "org_members"),
          where("orgId", "==", orgId),
          where("status", "==", "ACTIVE"),
          orderBy("createdAt", "desc")
        );
        const snapshot = yield getDocs(q);
        const members = [];
        snapshot.forEach((doc2) => {
          const memberData = doc2.data();
          let displayName = memberData.name;
          if (!displayName) {
            if (memberData.firstName && memberData.lastName) {
              displayName = `${memberData.firstName} ${memberData.lastName}`;
            } else if (memberData.firstName) {
              displayName = memberData.firstName;
            } else if (memberData.lastName) {
              displayName = memberData.lastName;
            } else if (memberData.email) {
              const emailParts = memberData.email.split("@");
              const username = emailParts[0];
              displayName = username.replace(/[._-]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
            } else {
              displayName = "Unknown User";
            }
          }
          const member = __spreadProps(__spreadValues({
            id: doc2.id
          }, memberData), {
            name: displayName
          });
          members.push(member);
        });
        console.log("✅ [Firebase] Found org members:", members.length);
        return members;
      } catch (error) {
        console.error("❌ [Firebase] Error getting org members:", error);
        return [];
      }
    });
  }
  /**
   * Get team members assigned to a project
   */
  static getProjectTeamMembers(projectId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [Firebase] Getting project team members for:", projectId);
        const q = query(
          collection(db, "projectTeamMembers"),
          where("projectId", "==", projectId),
          where("isActive", "==", true)
        );
        const snapshot = yield getDocs(q);
        const projectMembers = [];
        for (const docSnap of snapshot.docs) {
          const memberData = docSnap.data();
          let teamMember;
          try {
            const teamMemberDoc = yield getDoc(doc(db, "org_members", memberData.teamMemberId));
            if (teamMemberDoc.exists()) {
              const tmData = teamMemberDoc.data();
              let displayName = tmData.name;
              if (!displayName) {
                if (tmData.firstName && tmData.lastName) {
                  displayName = `${tmData.firstName} ${tmData.lastName}`;
                } else if (tmData.firstName) {
                  displayName = tmData.firstName;
                } else if (tmData.lastName) {
                  displayName = tmData.lastName;
                } else if (tmData.email) {
                  const emailParts = tmData.email.split("@");
                  const username = emailParts[0];
                  displayName = username.replace(/[._-]/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
                } else {
                  displayName = "Unknown User";
                }
              }
              teamMember = __spreadProps(__spreadValues({
                id: teamMemberDoc.id
              }, tmData), {
                name: displayName
              });
            }
          } catch (error) {
            console.warn("Failed to get team member details:", error);
          }
          const projectMember = __spreadProps(__spreadValues({
            id: docSnap.id
          }, memberData), {
            teamMember
          });
          projectMembers.push(projectMember);
        }
        console.log("✅ [Firebase] Found project team members:", projectMembers.length);
        return projectMembers;
      } catch (error) {
        console.error("❌ [Firebase] Error getting project team members:", error);
        return [];
      }
    });
  }
  /**
   * Add a team member to a project
   */
  static addTeamMemberToProject(projectId, teamMemberId, role = "DO_ER") {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [Firebase] Adding team member to project:", { projectId, teamMemberId, role });
        let teamMemberExists = false;
        let teamMemberData = null;
        try {
          const teamMemberDoc = yield getDoc(doc(db, "teamMembers", teamMemberId));
          if (teamMemberDoc.exists()) {
            teamMemberExists = true;
            teamMemberData = teamMemberDoc.data();
            console.log("✅ [Firebase] Found team member in teamMembers collection");
          }
        } catch (error) {
          console.log("🔍 [Firebase] Team member not found in teamMembers, checking other collections...");
        }
        if (!teamMemberExists) {
          try {
            const userDoc = yield getDoc(doc(db, "users", teamMemberId));
            if (userDoc.exists()) {
              teamMemberExists = true;
              teamMemberData = userDoc.data();
              console.log("✅ [Firebase] Found team member in users collection");
            }
          } catch (error) {
            console.log("🔍 [Firebase] Team member not found in users collection...");
          }
        }
        if (!teamMemberExists) {
          try {
            const orgMemberDoc = yield getDoc(doc(db, "orgMembers", teamMemberId));
            if (orgMemberDoc.exists()) {
              teamMemberExists = true;
              teamMemberData = orgMemberDoc.data();
              console.log("✅ [Firebase] Found team member in orgMembers collection");
            }
          } catch (error) {
            console.log("🔍 [Firebase] Team member not found in orgMembers collection...");
          }
        }
        if (!teamMemberExists) {
          throw new Error(`Team member not found in any collection: ${teamMemberId}`);
        }
        const existingQuery = query(
          collection(db, "projectTeamMembers"),
          where("projectId", "==", projectId),
          where("teamMemberId", "==", teamMemberId),
          where("isActive", "==", true)
        );
        const existingSnapshot = yield getDocs(existingQuery);
        if (!existingSnapshot.empty) {
          throw new Error("Team member is already assigned to this project");
        }
        if (role === "ADMIN") {
          const adminQuery = query(
            collection(db, "projectTeamMembers"),
            where("projectId", "==", projectId),
            where("role", "==", "ADMIN"),
            where("isActive", "==", true)
          );
          const adminSnapshot = yield getDocs(adminQuery);
          if (!adminSnapshot.empty) {
            throw new Error("Only one Admin is allowed per project. Please remove the existing Admin first.");
          }
        }
        const projectTeamMember = {
          projectId,
          teamMemberId,
          role,
          assignedAt: /* @__PURE__ */ new Date(),
          assignedBy: "current_user",
          // TODO: Get from auth context
          isActive: true
        };
        const cleanedData = Object.fromEntries(
          Object.entries(projectTeamMember).filter(([_, value]) => value !== void 0 && value !== null)
        );
        const docRef = yield addDoc(collection(db, "projectTeamMembers"), cleanedData);
        console.log("✅ [Firebase] Team member added successfully:", docRef.id);
        return __spreadValues({
          id: docRef.id
        }, projectTeamMember);
      } catch (error) {
        console.error("❌ [Firebase] Error adding team member:", error);
        throw error;
      }
    });
  }
  /**
   * Remove a team member from a project
   */
  static removeTeamMemberFromProject(projectId, teamMemberId) {
    return __async(this, null, function* () {
      try {
        console.log("🔍 [Firebase] Removing team member from project:", { projectId, teamMemberId });
        const q = query(
          collection(db, "projectTeamMembers"),
          where("projectId", "==", projectId),
          where("teamMemberId", "==", teamMemberId),
          where("isActive", "==", true)
        );
        const snapshot = yield getDocs(q);
        for (const docSnap of snapshot.docs) {
          yield deleteDoc(doc(db, "projectTeamMembers", docSnap.id));
        }
        console.log("✅ [Firebase] Team member removed successfully");
      } catch (error) {
        console.error("❌ [Firebase] Error removing team member:", error);
        throw error;
      }
    });
  }
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FirebaseTeamMemberService,
  get app() {
    return app;
  },
  auth,
  db,
  default: FirebaseTeamMemberService,
  firebaseAuth: auth,
  firestore: db,
  fixCSPIssues,
  getCurrentFirebaseUser,
  getInitializedServices,
  initializeFirebaseCollections,
  isEmailAuthenticated,
  isUserAuthenticated,
  isWebOnlyMode,
  loadUserFromFirestore,
  tryRestoreFirebaseSession
}, Symbol.toStringTag, { value: "Module" }));
export {
  auth as a,
  db as d,
  firebase as f,
  getFunctions as g,
  httpsCallable as h,
  isWebOnlyMode as i
};
