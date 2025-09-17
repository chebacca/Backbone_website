const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.esm-e-DuI42t.js","assets/index.esm-Dkmm1Qng.js","assets/FirestoreCollectionManager-BIeozf7c.js","assets/index-DAWnePqa.js","assets/mui-L6QpU7G9.js","assets/vendor-CjD1bmmO.js","assets/stripe-DjH5xBT-.js","assets/index-CBai7h7s.css","assets/index.esm-DdZh2hq1.js"])))=>i.map(i=>d[i]);
import{_ as S}from"./index-DAWnePqa.js";import{r as C,g as J,_ as Q,a as B,b as he,i as fe,p as ge,u as be,F as Z,c as ee,C as _e,d as te,S as we,e as Se,f as ne,h as K,D as Ce,j as Pe,k as Ue,l as xe,m as Me}from"./index.esm-Dkmm1Qng.js";import{getFirestore as W,query as I,collection as F,where as b,getDocs as N,getDoc as U,doc as v,orderBy as Le,addDoc as $e,deleteDoc as Ve,connectFirestoreEmulator as je}from"./index.esm-DdZh2hq1.js";import{getAuth as Y,connectAuthEmulator as Be}from"./index.esm-e-DuI42t.js";var ze="firebase",qe="12.1.0";/**
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
 */C(ze,qe,"app");const He=Object.freeze(Object.defineProperty({__proto__:null,FirebaseError:Z,SDK_VERSION:we,_DEFAULT_ENTRY_NAME:Ce,_addComponent:Pe,_apps:Ue,_components:xe,_getProvider:Q,_isFirebaseServerApp:te,_registerComponent:ee,_serverApps:Me,getApp:J,getApps:K,initializeApp:ne,registerVersion:C},Symbol.toStringTag,{value:"Module"}));/**
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
 */const Ge="type.googleapis.com/google.protobuf.Int64Value",Ke="type.googleapis.com/google.protobuf.UInt64Value";function Ee(e,t){const n={};for(const r in e)e.hasOwnProperty(r)&&(n[r]=t(e[r]));return n}function L(e){if(e==null)return null;if(e instanceof Number&&(e=e.valueOf()),typeof e=="number"&&isFinite(e)||e===!0||e===!1||Object.prototype.toString.call(e)==="[object String]")return e;if(e instanceof Date)return e.toISOString();if(Array.isArray(e))return e.map(t=>L(t));if(typeof e=="function"||typeof e=="object")return Ee(e,t=>L(t));throw new Error("Data cannot be encoded in JSON: "+e)}function P(e){if(e==null)return e;if(e["@type"])switch(e["@type"]){case Ge:case Ke:{const t=Number(e.value);if(isNaN(t))throw new Error("Data cannot be decoded from JSON: "+e);return t}default:throw new Error("Data cannot be decoded from JSON: "+e)}return Array.isArray(e)?e.map(t=>P(t)):typeof e=="function"||typeof e=="object"?Ee(e,t=>P(t)):e}/**
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
 */const re="functions";/**
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
 */const se={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class w extends Z{constructor(t,n,r){super(`${re}/${t}`,n||""),this.details=r,Object.setPrototypeOf(this,w.prototype)}}function We(e){if(e>=200&&e<300)return"ok";switch(e){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function $(e,t){let n=We(e),r=n,s;try{const o=t&&t.error;if(o){const a=o.status;if(typeof a=="string"){if(!se[a])return new w("internal","internal");n=se[a],r=a}const c=o.message;typeof c=="string"&&(r=c),s=o.details,s!==void 0&&(s=P(s))}}catch{}return n==="ok"?null:new w(n,r,s)}/**
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
 */class Ye{constructor(t,n,r,s){this.app=t,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,te(t)&&t.settings.appCheckToken&&(this.serverAppAppCheckToken=t.settings.appCheckToken),this.auth=n.getImmediate({optional:!0}),this.messaging=r.getImmediate({optional:!0}),this.auth||n.get().then(o=>this.auth=o,()=>{}),this.messaging||r.get().then(o=>this.messaging=o,()=>{}),this.appCheck||s==null||s.get().then(o=>this.appCheck=o,()=>{})}async getAuthToken(){if(this.auth)try{const t=await this.auth.getToken();return t==null?void 0:t.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(t){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const n=t?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return n.error?null:n.token}return null}async getContext(t){const n=await this.getAuthToken(),r=await this.getMessagingToken(),s=await this.getAppCheckToken(t);return{authToken:n,messagingToken:r,appCheckToken:s}}}/**
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
 */const X="us-central1",Xe=/^data: (.*?)(?:\n|$)/;function Je(e){let t=null;return{promise:new Promise((n,r)=>{t=setTimeout(()=>{r(new w("deadline-exceeded","deadline-exceeded"))},e)}),cancel:()=>{t&&clearTimeout(t)}}}class Qe{constructor(t,n,r,s,o=X,a=(...c)=>fetch(...c)){this.app=t,this.fetchImpl=a,this.emulatorOrigin=null,this.contextProvider=new Ye(t,n,r,s),this.cancelAllRequests=new Promise(c=>{this.deleteService=()=>Promise.resolve(c())});try{const c=new URL(o);this.customDomain=c.origin+(c.pathname==="/"?"":c.pathname),this.region=X}catch{this.customDomain=null,this.region=o}}_delete(){return this.deleteService()}_url(t){const n=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${n}/${this.region}/${t}`:this.customDomain!==null?`${this.customDomain}/${t}`:`https://${this.region}-${n}.cloudfunctions.net/${t}`}}function Ze(e,t,n){const r=fe(t);e.emulatorOrigin=`http${r?"s":""}://${t}:${n}`,r&&(ge(e.emulatorOrigin),be("Functions",!0))}function et(e,t,n){const r=s=>nt(e,t,s,{});return r.stream=(s,o)=>st(e,t,s,o),r}async function tt(e,t,n,r){n["Content-Type"]="application/json";let s;try{s=await r(e,{method:"POST",body:JSON.stringify(t),headers:n})}catch{return{status:0,json:null}}let o=null;try{o=await s.json()}catch{}return{status:s.status,json:o}}async function ye(e,t){const n={},r=await e.contextProvider.getContext(t.limitedUseAppCheckTokens);return r.authToken&&(n.Authorization="Bearer "+r.authToken),r.messagingToken&&(n["Firebase-Instance-ID-Token"]=r.messagingToken),r.appCheckToken!==null&&(n["X-Firebase-AppCheck"]=r.appCheckToken),n}function nt(e,t,n,r){const s=e._url(t);return rt(e,s,n,r)}async function rt(e,t,n,r){n=L(n);const s={data:n},o=await ye(e,r),a=r.timeout||7e4,c=Je(a),l=await Promise.race([tt(t,s,o,e.fetchImpl),c.promise,e.cancelAllRequests]);if(c.cancel(),!l)throw new w("cancelled","Firebase Functions instance was deleted.");const d=$(l.status,l.json);if(d)throw d;if(!l.json)throw new w("internal","Response is not valid JSON object.");let i=l.json.data;if(typeof i>"u"&&(i=l.json.result),typeof i>"u")throw new w("internal","Response is missing data field.");return{data:P(i)}}function st(e,t,n,r){const s=e._url(t);return ot(e,s,n,r||{})}async function ot(e,t,n,r){var m;n=L(n);const s={data:n},o=await ye(e,r);o["Content-Type"]="application/json",o.Accept="text/event-stream";let a;try{a=await e.fetchImpl(t,{method:"POST",body:JSON.stringify(s),headers:o,signal:r==null?void 0:r.signal})}catch(h){if(h instanceof Error&&h.name==="AbortError"){const E=new w("cancelled","Request was cancelled.");return{data:Promise.reject(E),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(E)}}}}}}const g=$(0,null);return{data:Promise.reject(g),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(g)}}}}}}let c,l;const d=new Promise((h,g)=>{c=h,l=g});(m=r==null?void 0:r.signal)==null||m.addEventListener("abort",()=>{const h=new w("cancelled","Request was cancelled.");l(h)});const i=a.body.getReader(),u=it(i,c,l,r==null?void 0:r.signal);return{stream:{[Symbol.asyncIterator](){const h=u.getReader();return{async next(){const{value:g,done:E}=await h.read();return{value:g,done:E}},async return(){return await h.cancel(),{done:!0,value:void 0}}}}},data:d}}function it(e,t,n,r){const s=(a,c)=>{const l=a.match(Xe);if(!l)return;const d=l[1];try{const i=JSON.parse(d);if("result"in i){t(P(i.result));return}if("message"in i){c.enqueue(P(i.message));return}if("error"in i){const u=$(0,i);c.error(u),n(u);return}}catch(i){if(i instanceof w){c.error(i),n(i);return}}},o=new TextDecoder;return new ReadableStream({start(a){let c="";return l();async function l(){if(r!=null&&r.aborted){const d=new w("cancelled","Request was cancelled");return a.error(d),n(d),Promise.resolve()}try{const{value:d,done:i}=await e.read();if(i){c.trim()&&s(c.trim(),a),a.close();return}if(r!=null&&r.aborted){const m=new w("cancelled","Request was cancelled");a.error(m),n(m),await e.cancel();return}c+=o.decode(d,{stream:!0});const u=c.split(`
`);c=u.pop()||"";for(const m of u)m.trim()&&s(m.trim(),a);return l()}catch(d){const i=d instanceof w?d:$(0,null);a.error(i),n(i)}}},cancel(){return e.cancel()}})}const oe="@firebase/functions",ie="0.13.0";/**
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
 */const at="auth-internal",ct="app-check-internal",lt="messaging-internal";function ut(e){const t=(n,{instanceIdentifier:r})=>{const s=n.getProvider("app").getImmediate(),o=n.getProvider(at),a=n.getProvider(lt),c=n.getProvider(ct);return new Qe(s,o,a,c,r)};ee(new _e(re,t,"PUBLIC").setMultipleInstances(!0)),C(oe,ie,e),C(oe,ie,"esm2020")}/**
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
 */function dt(e=J(),t=X){const r=Q(B(e),re).getImmediate({identifier:t}),s=he("functions");return s&&Ae(r,...s),r}function Ae(e,t,n){Ze(B(e),t,n)}function en(e,t,n){return et(B(e),t)}ut();/**
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
 */const Te="firebasestorage.googleapis.com",mt="storageBucket",pt=2*60*1e3,ht=10*60*1e3;/**
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
 */class k extends Z{constructor(t,n,r=0){super(H(t),`Firebase Storage: ${n} (${H(t)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,k.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return H(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var R;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(R||(R={}));function H(e){return"storage/"+e}function ft(){const e="An unknown error occurred, please check the error payload for server response.";return new k(R.UNKNOWN,e)}function gt(){return new k(R.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function bt(){return new k(R.CANCELED,"User canceled the upload/download.")}function _t(e){return new k(R.INVALID_URL,"Invalid URL '"+e+"'.")}function wt(e){return new k(R.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function ae(e){return new k(R.INVALID_ARGUMENT,e)}function Re(){return new k(R.APP_DELETED,"The Firebase app was deleted.")}function Et(e){return new k(R.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}/**
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
 */class T{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let r;try{r=T.makeFromUrl(t,n)}catch{return new T(t,"")}if(r.path==="")return r;throw wt(t)}static makeFromUrl(t,n){let r=null;const s="([A-Za-z0-9.\\-_]+)";function o(A){A.path.charAt(A.path.length-1)==="/"&&(A.path_=A.path_.slice(0,-1))}const a="(/(.*))?$",c=new RegExp("^gs://"+s+a,"i"),l={bucket:1,path:3};function d(A){A.path_=decodeURIComponent(A.path)}const i="v[A-Za-z0-9_]+",u=n.replace(/[.]/g,"\\."),m="(/([^?#]*).*)?$",h=new RegExp(`^https?://${u}/${i}/b/${s}/o${m}`,"i"),g={bucket:1,path:3},E=n===Te?"(?:storage.googleapis.com|storage.cloud.google.com)":n,_="([^?#]*)",D=new RegExp(`^https?://${E}/${s}/${_}`,"i"),O=[{regex:c,indices:l,postModify:o},{regex:h,indices:g,postModify:d},{regex:D,indices:{bucket:1,path:2},postModify:d}];for(let A=0;A<O.length;A++){const x=O[A],z=x.regex.exec(t);if(z){const ve=z[x.indices.bucket];let q=z[x.indices.path];q||(q=""),r=new T(ve,q),x.postModify(r);break}}if(r==null)throw _t(t);return r}}class yt{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
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
 */function At(e,t,n){let r=1,s=null,o=null,a=!1,c=0;function l(){return c===2}let d=!1;function i(..._){d||(d=!0,t.apply(null,_))}function u(_){s=setTimeout(()=>{s=null,e(h,l())},_)}function m(){o&&clearTimeout(o)}function h(_,...D){if(d){m();return}if(_){m(),i.call(null,_,...D);return}if(l()||a){m(),i.call(null,_,...D);return}r<64&&(r*=2);let O;c===1?(c=2,O=0):O=(r+Math.random())*1e3,u(O)}let g=!1;function E(_){g||(g=!0,m(),!d&&(s!==null?(_||(c=2),clearTimeout(s),u(0)):_||(c=1)))}return u(0),o=setTimeout(()=>{a=!0,E(!0)},n),E}function Tt(e){e(!1)}/**
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
 */function Rt(e){return e!==void 0}function ce(e,t,n,r){if(r<t)throw ae(`Invalid value for '${e}'. Expected ${t} or greater.`);if(r>n)throw ae(`Invalid value for '${e}'. Expected ${n} or less.`)}function kt(e){const t=encodeURIComponent;let n="?";for(const r in e)if(e.hasOwnProperty(r)){const s=t(r)+"="+t(e[r]);n=n+s+"&"}return n=n.slice(0,-1),n}var V;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(V||(V={}));/**
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
 */function Ft(e,t){const n=e>=500&&e<600,s=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||s||o}/**
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
 */class It{constructor(t,n,r,s,o,a,c,l,d,i,u,m=!0,h=!1){this.url_=t,this.method_=n,this.headers_=r,this.body_=s,this.successCodes_=o,this.additionalRetryCodes_=a,this.callback_=c,this.errorCallback_=l,this.timeout_=d,this.progressCallback_=i,this.connectionFactory_=u,this.retry=m,this.isUsingEmulator=h,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((g,E)=>{this.resolve_=g,this.reject_=E,this.start_()})}start_(){const t=(r,s)=>{if(s){r(!1,new M(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const a=c=>{const l=c.loaded,d=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,d)};this.progressCallback_!==null&&o.addUploadProgressListener(a),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(a),this.pendingConnection_=null;const c=o.getErrorCode()===V.NO_ERROR,l=o.getStatus();if(!c||Ft(l,this.additionalRetryCodes_)&&this.retry){const i=o.getErrorCode()===V.ABORT;r(!1,new M(!1,null,i));return}const d=this.successCodes_.indexOf(l)!==-1;r(!0,new M(d,o))})},n=(r,s)=>{const o=this.resolve_,a=this.reject_,c=s.connection;if(s.wasSuccessCode)try{const l=this.callback_(c,c.getResponse());Rt(l)?o(l):o()}catch(l){a(l)}else if(c!==null){const l=ft();l.serverResponse=c.getErrorText(),this.errorCallback_?a(this.errorCallback_(c,l)):a(l)}else if(s.canceled){const l=this.appDelete_?Re():bt();a(l)}else{const l=gt();a(l)}};this.canceled_?n(!1,new M(!1,null,!0)):this.backoffId_=At(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&Tt(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class M{constructor(t,n,r){this.wasSuccessCode=t,this.connection=n,this.canceled=!!r}}function Nt(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function Dt(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function Ot(e,t){t&&(e["X-Firebase-GMPID"]=t)}function vt(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function St(e,t,n,r,s,o,a=!0,c=!1){const l=kt(e.urlParams),d=e.url+l,i=Object.assign({},e.headers);return Ot(i,t),Nt(i,n),Dt(i,o),vt(i,r),new It(d,e.method,i,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,s,a,c)}/**
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
 */function Ct(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function Pt(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
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
 */class j{constructor(t,n){this._service=t,n instanceof T?this._location=n:this._location=T.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new j(t,n)}get root(){const t=new T(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Pt(this._location.path)}get storage(){return this._service}get parent(){const t=Ct(this._location.path);if(t===null)return null;const n=new T(this._location.bucket,t);return new j(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw Et(t)}}function le(e,t){const n=t==null?void 0:t[mt];return n==null?null:T.makeFromBucketSpec(n,e)}function Ut(e,t,n,r={}){e.host=`${t}:${n}`;const s=fe(t);s&&(ge(`https://${e.host}/b`),be("Storage",!0)),e._isUsingEmulator=!0,e._protocol=s?"https":"http";const{mockUserToken:o}=r;o&&(e._overrideAuthToken=typeof o=="string"?o:Se(o,e.app.options.projectId))}class xt{constructor(t,n,r,s,o,a=!1){this.app=t,this._authProvider=n,this._appCheckProvider=r,this._url=s,this._firebaseVersion=o,this._isUsingEmulator=a,this._bucket=null,this._host=Te,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=pt,this._maxUploadRetryTime=ht,this._requests=new Set,s!=null?this._bucket=T.makeFromBucketSpec(s,this._host):this._bucket=le(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=T.makeFromBucketSpec(this._url,t):this._bucket=le(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){ce("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){ce("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(te(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new j(this,t)}_makeRequest(t,n,r,s,o=!0){if(this._deleted)return new yt(Re());{const a=St(t,this._appId,r,s,n,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(a),a.getPromise().then(()=>this._requests.delete(a),()=>this._requests.delete(a)),a}}async makeRequestWithTokens(t,n){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,r,s).getPromise()}}const ue="@firebase/storage",de="0.14.0";/**
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
 */const ke="storage";function Mt(e=J(),t){e=B(e);const r=Q(e,ke).getImmediate({identifier:t}),s=he("storage");return s&&Fe(r,...s),r}function Fe(e,t,n,r={}){Ut(e,t,n,r)}function Lt(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),r=e.getProvider("auth-internal"),s=e.getProvider("app-check-internal");return new xt(n,r,s,t,we)}function $t(){ee(new _e(ke,Lt,"PUBLIC").setMultipleInstances(!0)),C(ue,de,""),C(ue,de,"esm2020")}$t();const G={},Vt=()=>typeof window<"u"&&window.FIREBASE_CONFIG?window.FIREBASE_CONFIG:{apiKey:(G==null?void 0:G.VITE_FIREBASE_API_KEY)||"AIzaSyDFnIzSYCdPsDDdvP1lympVxEeUn0AQhWs",authDomain:"backbone-logic.firebaseapp.com",projectId:"backbone-logic",databaseURL:"https://backbone-logic-default-rtdb.firebaseio.com",storageBucket:"backbone-logic.firebasestorage.app",messagingSenderId:"749245129278",appId:"1:749245129278:web:dfa5647101ea160a3b276f",measurementId:"G-8SZRDQ4XVR"},Ie=Vt();let p;if(typeof window<"u"&&window.firebaseApp)console.log("🔥 [Firebase] Using globally initialized Firebase app"),p=window.firebaseApp;else{const e=K();if(e.length>0)p=e[0],console.log("🔥 [Firebase] Using existing Firebase app:",p.name),typeof window<"u"&&(window.firebaseApp=p);else try{p=ne(Ie),console.log("🔥 [Firebase] App initialized successfully"),typeof window<"u"&&(window.firebaseApp=p)}catch(t){console.error("❌ [Firebase] Failed to initialize app:",t);const n=K();n.length>0&&(p=n[0],console.log("🔥 [Firebase] Using fallback existing app:",p.name))}}async function jt(){if(p)return p;if(typeof window<"u"&&window.firebaseApp)return p=window.firebaseApp,console.log("✅ [Firebase] Found global app instance"),p;try{const{getApps:e}=await S(async()=>{const{getApps:n}=await Promise.resolve().then(()=>He);return{getApps:n}},void 0),t=e();if(t.length>0)return p=t[0],console.log("✅ [Firebase] Using existing app instance"),typeof window<"u"&&(window.firebaseApp=p),p}catch(e){console.warn("⚠️ [Firebase] Failed to get existing apps:",e)}try{return p=ne(Ie,"fallback"),console.log("✅ [Firebase] Created fallback app instance"),typeof window<"u"&&(window.firebaseApp=p),p}catch(e){throw console.error("❌ [Firebase] Failed to create fallback app:",e),new Error("Failed to initialize Firebase app")}}const f=p?W(p):W(),y=p?Y(p):Y(),Bt=typeof window<"u"&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1");if(Bt&&p){console.log("🔧 [FIREBASE SERVICE] Connecting to Firebase emulators...");try{Be(y,"http://localhost:9099",{disableWarnings:!0}),console.log("✅ [FIREBASE SERVICE] Connected to SHARED Auth Emulator (port 9099)"),je(f,"localhost",8080),console.log("✅ [FIREBASE SERVICE] Connected to SHARED Firestore Emulator (port 8080)");const e=dt(p);Ae(e,"localhost",5001),console.log("✅ [FIREBASE SERVICE] Connected to SHARED Functions Emulator (port 5001)");const t=Mt(p);Fe(t,"localhost",9199),console.log("✅ [FIREBASE SERVICE] Connected to SHARED Storage Emulator (port 9199)"),console.log("🎉 [FIREBASE SERVICE] All emulators connected successfully!")}catch(e){console.warn("⚠️ [FIREBASE SERVICE] Emulators may already be connected:",(e==null?void 0:e.message)||e)}}y&&S(async()=>{const{setPersistence:e,browserLocalPersistence:t}=await import("./index.esm-e-DuI42t.js");return{setPersistence:e,browserLocalPersistence:t}},__vite__mapDeps([0,1])).then(({setPersistence:e,browserLocalPersistence:t})=>{e(y,t).catch(n=>{console.warn("⚠️ [Firebase] Failed to set auth persistence:",n)})}).catch(e=>{console.warn("⚠️ [Firebase] Failed to import auth persistence:",e)});async function zt(){const e=await jt();return{app:e,db:W(e),auth:Y(e)}}function Ne(){if(!(typeof window>"u"))try{console.log("ℹ️ [Firebase] Skipping client-side CSP override - relying on Firebase hosting CSP");const e=document.querySelector('meta[http-equiv="Content-Security-Policy"]');e&&(e.remove(),console.log("🧹 [Firebase] Removed conflicting client-side CSP meta tag"))}catch(e){console.warn("⚠️ [Firebase] Failed to clean up CSP:",e)}}Ne();typeof window<"u"&&(window.FIREBASE_IGNORE_UNDEFINED_PROPERTIES=!0);console.log("🌐 [Firebase] Licensing website mode: production (web-only) - no emulators");const qt=()=>!0;let me=!1;const Ht=async()=>{if(!me)try{const{firestoreCollectionManager:e}=await S(async()=>{const{firestoreCollectionManager:t}=await import("./FirestoreCollectionManager-BIeozf7c.js");return{firestoreCollectionManager:t}},__vite__mapDeps([2,3,4,5,6,7,8,1,0]));await e.initializeCollections(),me=!0,console.log("✅ [Firebase] Collection manager initialized")}catch(e){console.error("❌ [Firebase] Failed to initialize collection manager:",e)}},Gt=()=>y.currentUser!==null,Kt=()=>y.currentUser,De=e=>{var t;return((t=y.currentUser)==null?void 0:t.email)===e},Wt=async e=>{var t,n;try{const{doc:r,getDoc:s,query:o,collection:a,where:c,getDocs:l}=await S(async()=>{const{doc:m,getDoc:h,query:g,collection:E,where:_,getDocs:D}=await import("./index.esm-DdZh2hq1.js");return{doc:m,getDoc:h,query:g,collection:E,where:_,getDocs:D}},__vite__mapDeps([8,1]));let d=await s(r(f,"users",e.uid)),i=null,u=null;if(d.exists())i=d.data(),u=d.id,console.log("✅ [Firebase] Found user by Firebase UID:",i.email);else{const m=o(a(f,"users"),c("email","==",e.email)),h=await l(m);h.empty||(i=h.docs[0].data(),u=h.docs[0].id,console.log("✅ [Firebase] Found user by email:",i.email))}return i&&u?{id:u,email:i.email,name:i.name||i.displayName||e.displayName||i.email.split("@")[0],role:i.role||"USER",organizationId:i.organizationId,isTeamMember:i.isTeamMember,memberRole:i.memberRole,memberStatus:i.memberStatus,firebaseUid:e.uid,subscription:i.subscription,licenses:i.licenses,teamMemberData:i.teamMemberData}:{id:e.uid,email:e.email||"",name:e.displayName||((t=e.email)==null?void 0:t.split("@")[0])||"User",role:"USER",firebaseUid:e.uid}}catch(r){return console.warn("⚠️ [Firebase] Failed to load user from Firestore:",r),{id:e.uid,email:e.email||"",name:e.displayName||((n=e.email)==null?void 0:n.split("@")[0])||"User",role:"USER",firebaseUid:e.uid}}},Yt=async e=>{try{if(console.log("🔑 [Firebase] Attempting to restore Firebase Auth session for:",e),De(e))return console.log("✅ [Firebase] User already authenticated with correct email"),!0;if(y.currentUser&&y.currentUser.email!==e){console.log("🔄 [Firebase] Different user authenticated, signing out first");const{signOut:t}=await S(async()=>{const{signOut:n}=await import("./index.esm-e-DuI42t.js");return{signOut:n}},__vite__mapDeps([0,1]));await t(y)}try{const t=localStorage.getItem("temp_credentials");if(t){const n=JSON.parse(t);if(n.email===e&&n.password){console.log("🔑 [Firebase] Attempting to restore Firebase Auth session with stored credentials");const{signInWithEmailAndPassword:r}=await S(async()=>{const{signInWithEmailAndPassword:s}=await import("./index.esm-e-DuI42t.js");return{signInWithEmailAndPassword:s}},__vite__mapDeps([0,1]));return await r(y,e,n.password),console.log("✅ [Firebase] Firebase Auth session restored successfully"),!0}}}catch(t){console.warn("⚠️ [Firebase] Could not restore session with stored credentials:",t)}return console.log("ℹ️ [Firebase] No stored credentials available for session restoration"),!1}catch(t){return console.warn("⚠️ [Firebase] Error during session restoration:",t),!1}};class pe{static async getOrganizationsForUser(t){try{console.log("🔍 [Firebase] Getting organizations for user:",t);const n=I(F(f,"organizations"),b("ownerUserId","==",t)),r=await N(n),s=I(F(f,"org_members"),b("userId","==",t),b("status","==","ACTIVE")),o=await N(s),a=new Set,c=[];r.forEach(l=>{const d={id:l.id,...l.data()};c.push(d),a.add(l.id)});for(const l of o.docs){const i=l.data().orgId;if(!a.has(i)){const u=await U(v(f,"organizations",i));if(u.exists()){const m={id:u.id,...u.data()};c.push(m),a.add(i)}}}return console.log("✅ [Firebase] Found organizations:",c.length),c}catch(n){return console.error("❌ [Firebase] Error getting organizations:",n),[]}}static async getOrgMembers(t){try{console.log("🔍 [Firebase] Getting org members for:",t);const n=I(F(f,"org_members"),b("orgId","==",t),b("status","==","ACTIVE"),Le("createdAt","desc")),r=await N(n),s=[];return r.forEach(o=>{const a=o.data();let c=a.name;c||(a.firstName&&a.lastName?c=`${a.firstName} ${a.lastName}`:a.firstName?c=a.firstName:a.lastName?c=a.lastName:a.email?c=a.email.split("@")[0].replace(/[._-]/g," ").split(" ").map(u=>u.charAt(0).toUpperCase()+u.slice(1).toLowerCase()).join(" "):c="Unknown User");const l={id:o.id,...a,name:c};s.push(l)}),console.log("✅ [Firebase] Found org members:",s.length),s}catch(n){return console.error("❌ [Firebase] Error getting org members:",n),[]}}static async getProjectTeamMembers(t){try{console.log("🔍 [Firebase] Getting project team members for:",t);const n=I(F(f,"projectTeamMembers"),b("projectId","==",t),b("isActive","==",!0)),r=await N(n),s=[];for(const o of r.docs){const a=o.data();let c;try{const d=await U(v(f,"org_members",a.teamMemberId));if(d.exists()){const i=d.data();let u=i.name;u||(i.firstName&&i.lastName?u=`${i.firstName} ${i.lastName}`:i.firstName?u=i.firstName:i.lastName?u=i.lastName:i.email?u=i.email.split("@")[0].replace(/[._-]/g," ").split(" ").map(g=>g.charAt(0).toUpperCase()+g.slice(1).toLowerCase()).join(" "):u="Unknown User"),c={id:d.id,...i,name:u}}}catch(d){console.warn("Failed to get team member details:",d)}const l={id:o.id,...a,teamMember:c};s.push(l)}return console.log("✅ [Firebase] Found project team members:",s.length),s}catch(n){return console.error("❌ [Firebase] Error getting project team members:",n),[]}}static async addTeamMemberToProject(t,n,r="DO_ER"){try{console.log("🔍 [Firebase] Adding team member to project:",{projectId:t,teamMemberId:n,role:r});let s=!1,o=null;try{const u=await U(v(f,"teamMembers",n));u.exists()&&(s=!0,o=u.data(),console.log("✅ [Firebase] Found team member in teamMembers collection"))}catch{console.log("🔍 [Firebase] Team member not found in teamMembers, checking other collections...")}if(!s)try{const u=await U(v(f,"users",n));u.exists()&&(s=!0,o=u.data(),console.log("✅ [Firebase] Found team member in users collection"))}catch{console.log("🔍 [Firebase] Team member not found in users collection...")}if(!s)try{const u=await U(v(f,"orgMembers",n));u.exists()&&(s=!0,o=u.data(),console.log("✅ [Firebase] Found team member in orgMembers collection"))}catch{console.log("🔍 [Firebase] Team member not found in orgMembers collection...")}if(!s)throw new Error(`Team member not found in any collection: ${n}`);const a=I(F(f,"projectTeamMembers"),b("projectId","==",t),b("teamMemberId","==",n),b("isActive","==",!0));if(!(await N(a)).empty)throw new Error("Team member is already assigned to this project");if(r==="ADMIN"){const u=I(F(f,"projectTeamMembers"),b("projectId","==",t),b("role","==","ADMIN"),b("isActive","==",!0));if(!(await N(u)).empty)throw new Error("Only one Admin is allowed per project. Please remove the existing Admin first.")}const l={projectId:t,teamMemberId:n,role:r,assignedAt:new Date,assignedBy:"current_user",isActive:!0},d=Object.fromEntries(Object.entries(l).filter(([u,m])=>m!=null)),i=await $e(F(f,"projectTeamMembers"),d);return console.log("✅ [Firebase] Team member added successfully:",i.id),{id:i.id,...l}}catch(s){throw console.error("❌ [Firebase] Error adding team member:",s),s}}static async removeTeamMemberFromProject(t,n){try{console.log("🔍 [Firebase] Removing team member from project:",{projectId:t,teamMemberId:n});const r=I(F(f,"projectTeamMembers"),b("projectId","==",t),b("teamMemberId","==",n),b("isActive","==",!0)),s=await N(r);for(const o of s.docs)await Ve(v(f,"projectTeamMembers",o.id));console.log("✅ [Firebase] Team member removed successfully")}catch(r){throw console.error("❌ [Firebase] Error removing team member:",r),r}}}const tn=Object.freeze(Object.defineProperty({__proto__:null,FirebaseTeamMemberService:pe,get app(){return p},auth:y,db:f,default:pe,firebaseAuth:y,firestore:f,fixCSPIssues:Ne,getCurrentFirebaseUser:Kt,getInitializedServices:zt,initializeFirebaseCollections:Ht,isEmailAuthenticated:De,isUserAuthenticated:Gt,isWebOnlyMode:qt,loadUserFromFirestore:Wt,tryRestoreFirebaseSession:Yt},Symbol.toStringTag,{value:"Module"}));export{f as d,tn as f,dt as g,en as h,qt as i};
