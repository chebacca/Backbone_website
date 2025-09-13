const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.esm-CiRfLMBX.js","assets/index.esm-BANGvNYi.js","assets/FirestoreCollectionManager-uGzEW2PH.js","assets/index-Cel-ZAK4.js","assets/mui-Bvn6i01d.js","assets/vendor-CjD1bmmO.js","assets/stripe-DxIjm7uF.js","assets/index-CBai7h7s.css","assets/index.esm-9jaBBmwp.js"])))=>i.map(i=>d[i]);
import{_ as C}from"./index-Cel-ZAK4.js";import{r as O,_ as G,C as re,a as K,g as W,b as Y,c as Q,d as ae,i as ce,p as le,u as ue,S as de,F as me,e as Te,f as X,h as B,D as Re,j as ye,k as Fe,l as ke,m as Ie}from"./index.esm-BANGvNYi.js";import{getFirestore as z,query as k,collection as F,where as g,getDocs as I,getDoc as P,doc as v,orderBy as De,addDoc as Ne,deleteDoc as ve,connectFirestoreEmulator as Ce}from"./index.esm-9jaBBmwp.js";import{getAuth as q,connectAuthEmulator as Oe}from"./index.esm-CiRfLMBX.js";import"./mui-Bvn6i01d.js";import"./vendor-CjD1bmmO.js";import"./stripe-DxIjm7uF.js";var Pe="firebase",Se="12.1.0";/**
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
 */O(Pe,Se,"app");const Ue=Object.freeze(Object.defineProperty({__proto__:null,FirebaseError:me,SDK_VERSION:de,_DEFAULT_ENTRY_NAME:Re,_addComponent:ye,_apps:Fe,_components:ke,_getProvider:Y,_isFirebaseServerApp:K,_registerComponent:G,_serverApps:Ie,getApp:W,getApps:B,initializeApp:X,registerVersion:O},Symbol.toStringTag,{value:"Module"}));/**
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
 */const pe="functions";/**
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
 */class Me{constructor(e,s,n,o){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,K(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=s.getImmediate({optional:!0}),this.messaging=n.getImmediate({optional:!0}),this.auth||s.get().then(i=>this.auth=i,()=>{}),this.messaging||n.get().then(i=>this.messaging=i,()=>{}),this.appCheck||o==null||o.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const s=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return s.error?null:s.token}return null}async getContext(e){const s=await this.getAuthToken(),n=await this.getMessagingToken(),o=await this.getAppCheckToken(e);return{authToken:s,messagingToken:n,appCheckToken:o}}}/**
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
 */const H="us-central1";class xe{constructor(e,s,n,o,i=H,r=(...a)=>fetch(...a)){this.app=e,this.fetchImpl=r,this.emulatorOrigin=null,this.contextProvider=new Me(e,s,n,o),this.cancelAllRequests=new Promise(a=>{this.deleteService=()=>Promise.resolve(a())});try{const a=new URL(i);this.customDomain=a.origin+(a.pathname==="/"?"":a.pathname),this.region=H}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(e){const s=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${s}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${s}.cloudfunctions.net/${e}`}}function Le(t,e,s){const n=ce(e);t.emulatorOrigin=`http${n?"s":""}://${e}:${s}`,n&&(le(t.emulatorOrigin),ue("Functions",!0))}const Z="@firebase/functions",J="0.13.0";/**
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
 */const $e="auth-internal",Ve="app-check-internal",je="messaging-internal";function Be(t){const e=(s,{instanceIdentifier:n})=>{const o=s.getProvider("app").getImmediate(),i=s.getProvider($e),r=s.getProvider(je),a=s.getProvider(Ve);return new xe(o,i,r,a,n)};G(new re(pe,e,"PUBLIC").setMultipleInstances(!0)),O(Z,J,t),O(Z,J,"esm2020")}/**
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
 */function ze(t=W(),e=H){const n=Y(Q(t),pe).getImmediate({identifier:e}),o=ae("functions");return o&&he(n,...o),n}function he(t,e,s){Le(Q(t),e,s)}Be();/**
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
 */const ge="firebasestorage.googleapis.com",qe="storageBucket",He=2*60*1e3,Ge=10*60*1e3;/**
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
 */class R extends me{constructor(e,s,n=0){super(V(e),`Firebase Storage: ${s} (${V(e)})`),this.status_=n,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,R.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return V(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var T;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(T||(T={}));function V(t){return"storage/"+t}function Ke(){const t="An unknown error occurred, please check the error payload for server response.";return new R(T.UNKNOWN,t)}function We(){return new R(T.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function Ye(){return new R(T.CANCELED,"User canceled the upload/download.")}function Qe(t){return new R(T.INVALID_URL,"Invalid URL '"+t+"'.")}function Xe(t){return new R(T.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function ee(t){return new R(T.INVALID_ARGUMENT,t)}function fe(){return new R(T.APP_DELETED,"The Firebase app was deleted.")}function Ze(t){return new R(T.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}/**
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
 */class E{constructor(e,s){this.bucket=e,this.path_=s}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,s){let n;try{n=E.makeFromUrl(e,s)}catch{return new E(e,"")}if(n.path==="")return n;throw Xe(e)}static makeFromUrl(e,s){let n=null;const o="([A-Za-z0-9.\\-_]+)";function i(w){w.path.charAt(w.path.length-1)==="/"&&(w.path_=w.path_.slice(0,-1))}const r="(/(.*))?$",a=new RegExp("^gs://"+o+r,"i"),u={bucket:1,path:3};function d(w){w.path_=decodeURIComponent(w.path)}const c="v[A-Za-z0-9_]+",l=s.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",_=new RegExp(`^https?://${l}/${c}/b/${o}/o${p}`,"i"),b={bucket:1,path:3},y=s===ge?"(?:storage.googleapis.com|storage.cloud.google.com)":s,f="([^?#]*)",D=new RegExp(`^https?://${y}/${o}/${f}`,"i"),N=[{regex:a,indices:u,postModify:i},{regex:_,indices:b,postModify:d},{regex:D,indices:{bucket:1,path:2},postModify:d}];for(let w=0;w<N.length;w++){const S=N[w],L=S.regex.exec(e);if(L){const Ae=L[S.indices.bucket];let $=L[S.indices.path];$||($=""),n=new E(Ae,$),S.postModify(n);break}}if(n==null)throw Qe(e);return n}}class Je{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
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
 */function et(t,e,s){let n=1,o=null,i=null,r=!1,a=0;function u(){return a===2}let d=!1;function c(...f){d||(d=!0,e.apply(null,f))}function l(f){o=setTimeout(()=>{o=null,t(_,u())},f)}function p(){i&&clearTimeout(i)}function _(f,...D){if(d){p();return}if(f){p(),c.call(null,f,...D);return}if(u()||r){p(),c.call(null,f,...D);return}n<64&&(n*=2);let N;a===1?(a=2,N=0):N=(n+Math.random())*1e3,l(N)}let b=!1;function y(f){b||(b=!0,p(),!d&&(o!==null?(f||(a=2),clearTimeout(o),l(0)):f||(a=1)))}return l(0),i=setTimeout(()=>{r=!0,y(!0)},s),y}function tt(t){t(!1)}/**
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
 */function st(t){return t!==void 0}function te(t,e,s,n){if(n<e)throw ee(`Invalid value for '${t}'. Expected ${e} or greater.`);if(n>s)throw ee(`Invalid value for '${t}'. Expected ${s} or less.`)}function nt(t){const e=encodeURIComponent;let s="?";for(const n in t)if(t.hasOwnProperty(n)){const o=e(n)+"="+e(t[n]);s=s+o+"&"}return s=s.slice(0,-1),s}var M;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(M||(M={}));/**
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
 */function ot(t,e){const s=t>=500&&t<600,o=[408,429].indexOf(t)!==-1,i=e.indexOf(t)!==-1;return s||o||i}/**
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
 */class it{constructor(e,s,n,o,i,r,a,u,d,c,l,p=!0,_=!1){this.url_=e,this.method_=s,this.headers_=n,this.body_=o,this.successCodes_=i,this.additionalRetryCodes_=r,this.callback_=a,this.errorCallback_=u,this.timeout_=d,this.progressCallback_=c,this.connectionFactory_=l,this.retry=p,this.isUsingEmulator=_,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((b,y)=>{this.resolve_=b,this.reject_=y,this.start_()})}start_(){const e=(n,o)=>{if(o){n(!1,new U(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const r=a=>{const u=a.loaded,d=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,d)};this.progressCallback_!==null&&i.addUploadProgressListener(r),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(r),this.pendingConnection_=null;const a=i.getErrorCode()===M.NO_ERROR,u=i.getStatus();if(!a||ot(u,this.additionalRetryCodes_)&&this.retry){const c=i.getErrorCode()===M.ABORT;n(!1,new U(!1,null,c));return}const d=this.successCodes_.indexOf(u)!==-1;n(!0,new U(d,i))})},s=(n,o)=>{const i=this.resolve_,r=this.reject_,a=o.connection;if(o.wasSuccessCode)try{const u=this.callback_(a,a.getResponse());st(u)?i(u):i()}catch(u){r(u)}else if(a!==null){const u=Ke();u.serverResponse=a.getErrorText(),this.errorCallback_?r(this.errorCallback_(a,u)):r(u)}else if(o.canceled){const u=this.appDelete_?fe():Ye();r(u)}else{const u=We();r(u)}};this.canceled_?s(!1,new U(!1,null,!0)):this.backoffId_=et(e,s,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&tt(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class U{constructor(e,s,n){this.wasSuccessCode=e,this.connection=s,this.canceled=!!n}}function rt(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function at(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function ct(t,e){e&&(t["X-Firebase-GMPID"]=e)}function lt(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function ut(t,e,s,n,o,i,r=!0,a=!1){const u=nt(t.urlParams),d=t.url+u,c=Object.assign({},t.headers);return ct(c,e),rt(c,s),at(c,i),lt(c,n),new it(d,t.method,c,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,o,r,a)}/**
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
 */function dt(t){if(t.length===0)return null;const e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function mt(t){const e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}/**
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
 */class x{constructor(e,s){this._service=e,s instanceof E?this._location=s:this._location=E.makeFromUrl(s,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,s){return new x(e,s)}get root(){const e=new E(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return mt(this._location.path)}get storage(){return this._service}get parent(){const e=dt(this._location.path);if(e===null)return null;const s=new E(this._location.bucket,e);return new x(this._service,s)}_throwIfRoot(e){if(this._location.path==="")throw Ze(e)}}function se(t,e){const s=e==null?void 0:e[qe];return s==null?null:E.makeFromBucketSpec(s,t)}function pt(t,e,s,n={}){t.host=`${e}:${s}`;const o=ce(e);o&&(le(`https://${t.host}/b`),ue("Storage",!0)),t._isUsingEmulator=!0,t._protocol=o?"https":"http";const{mockUserToken:i}=n;i&&(t._overrideAuthToken=typeof i=="string"?i:Te(i,t.app.options.projectId))}class ht{constructor(e,s,n,o,i,r=!1){this.app=e,this._authProvider=s,this._appCheckProvider=n,this._url=o,this._firebaseVersion=i,this._isUsingEmulator=r,this._bucket=null,this._host=ge,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=He,this._maxUploadRetryTime=Ge,this._requests=new Set,o!=null?this._bucket=E.makeFromBucketSpec(o,this._host):this._bucket=se(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=E.makeFromBucketSpec(this._url,e):this._bucket=se(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){te("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){te("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const s=await e.getToken();if(s!==null)return s.accessToken}return null}async _getAppCheckToken(){if(K(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new x(this,e)}_makeRequest(e,s,n,o,i=!0){if(this._deleted)return new Je(fe());{const r=ut(e,this._appId,n,o,s,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(r),r.getPromise().then(()=>this._requests.delete(r),()=>this._requests.delete(r)),r}}async makeRequestWithTokens(e,s){const[n,o]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,s,n,o).getPromise()}}const ne="@firebase/storage",oe="0.14.0";/**
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
 */const _e="storage";function gt(t=W(),e){t=Q(t);const n=Y(t,_e).getImmediate({identifier:e}),o=ae("storage");return o&&be(n,...o),n}function be(t,e,s,n={}){pt(t,e,s,n)}function ft(t,{instanceIdentifier:e}){const s=t.getProvider("app").getImmediate(),n=t.getProvider("auth-internal"),o=t.getProvider("app-check-internal");return new ht(s,n,o,e,de)}function _t(){G(new re(_e,ft,"PUBLIC").setMultipleInstances(!0)),O(ne,oe,""),O(ne,oe,"esm2020")}_t();const j={},bt=()=>typeof window<"u"&&window.FIREBASE_CONFIG?window.FIREBASE_CONFIG:{apiKey:(j==null?void 0:j.VITE_FIREBASE_API_KEY)||"AIzaSyDFnIzSYCdPsDDdvP1lympVxEeUn0AQhWs",authDomain:"backbone-logic.firebaseapp.com",projectId:"backbone-logic",databaseURL:"https://backbone-logic-default-rtdb.firebaseio.com",storageBucket:"backbone-logic.firebasestorage.app",messagingSenderId:"749245129278",appId:"1:749245129278:web:dfa5647101ea160a3b276f",measurementId:"G-8SZRDQ4XVR"},we=bt();let m;if(typeof window<"u"&&window.firebaseApp)console.log("🔥 [Firebase] Using globally initialized Firebase app"),m=window.firebaseApp;else{const t=B();if(t.length>0)m=t[0],console.log("🔥 [Firebase] Using existing Firebase app:",m.name),typeof window<"u"&&(window.firebaseApp=m);else try{m=X(we),console.log("🔥 [Firebase] App initialized successfully"),typeof window<"u"&&(window.firebaseApp=m)}catch(e){console.error("❌ [Firebase] Failed to initialize app:",e);const s=B();s.length>0&&(m=s[0],console.log("🔥 [Firebase] Using fallback existing app:",m.name))}}async function wt(){if(m)return m;if(typeof window<"u"&&window.firebaseApp)return m=window.firebaseApp,console.log("✅ [Firebase] Found global app instance"),m;try{const{getApps:t}=await C(async()=>{const{getApps:s}=await Promise.resolve().then(()=>Ue);return{getApps:s}},void 0),e=t();if(e.length>0)return m=e[0],console.log("✅ [Firebase] Using existing app instance"),typeof window<"u"&&(window.firebaseApp=m),m}catch(t){console.warn("⚠️ [Firebase] Failed to get existing apps:",t)}try{return m=X(we,"fallback"),console.log("✅ [Firebase] Created fallback app instance"),typeof window<"u"&&(window.firebaseApp=m),m}catch(t){throw console.error("❌ [Firebase] Failed to create fallback app:",t),new Error("Failed to initialize Firebase app")}}const h=m?z(m):z(),A=m?q(m):q(),Et=typeof window<"u"&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1");if(Et&&m){console.log("🔧 [FIREBASE SERVICE] Connecting to Firebase emulators...");try{Oe(A,"http://localhost:9099",{disableWarnings:!0}),console.log("✅ [FIREBASE SERVICE] Connected to SHARED Auth Emulator (port 9099)"),Ce(h,"localhost",8080),console.log("✅ [FIREBASE SERVICE] Connected to SHARED Firestore Emulator (port 8080)");const t=ze(m);he(t,"localhost",5001),console.log("✅ [FIREBASE SERVICE] Connected to SHARED Functions Emulator (port 5001)");const e=gt(m);be(e,"localhost",9199),console.log("✅ [FIREBASE SERVICE] Connected to SHARED Storage Emulator (port 9199)"),console.log("🎉 [FIREBASE SERVICE] All emulators connected successfully!")}catch(t){console.warn("⚠️ [FIREBASE SERVICE] Emulators may already be connected:",(t==null?void 0:t.message)||t)}}A&&C(async()=>{const{setPersistence:t,browserLocalPersistence:e}=await import("./index.esm-CiRfLMBX.js");return{setPersistence:t,browserLocalPersistence:e}},__vite__mapDeps([0,1])).then(({setPersistence:t,browserLocalPersistence:e})=>{t(A,e).catch(s=>{console.warn("⚠️ [Firebase] Failed to set auth persistence:",s)})}).catch(t=>{console.warn("⚠️ [Firebase] Failed to import auth persistence:",t)});async function vt(){const t=await wt();return{app:t,db:z(t),auth:q(t)}}function At(){if(!(typeof window>"u"))try{console.log("ℹ️ [Firebase] Skipping client-side CSP override - relying on Firebase hosting CSP");const t=document.querySelector('meta[http-equiv="Content-Security-Policy"]');t&&(t.remove(),console.log("🧹 [Firebase] Removed conflicting client-side CSP meta tag"))}catch(t){console.warn("⚠️ [Firebase] Failed to clean up CSP:",t)}}At();typeof window<"u"&&(window.FIREBASE_IGNORE_UNDEFINED_PROPERTIES=!0);console.log("🌐 [Firebase] Licensing website mode: production (web-only) - no emulators");const Ct=()=>!0;let ie=!1;const Ot=async()=>{if(!ie)try{const{firestoreCollectionManager:t}=await C(async()=>{const{firestoreCollectionManager:e}=await import("./FirestoreCollectionManager-uGzEW2PH.js");return{firestoreCollectionManager:e}},__vite__mapDeps([2,3,4,5,6,7,8,1,0]));await t.initializeCollections(),ie=!0,console.log("✅ [Firebase] Collection manager initialized")}catch(t){console.error("❌ [Firebase] Failed to initialize collection manager:",t)}},Pt=()=>A.currentUser!==null,St=()=>A.currentUser,Tt=t=>{var e;return((e=A.currentUser)==null?void 0:e.email)===t},Ut=async t=>{var e,s;try{const{doc:n,getDoc:o,query:i,collection:r,where:a,getDocs:u}=await C(async()=>{const{doc:p,getDoc:_,query:b,collection:y,where:f,getDocs:D}=await import("./index.esm-9jaBBmwp.js");return{doc:p,getDoc:_,query:b,collection:y,where:f,getDocs:D}},__vite__mapDeps([8,1]));let d=await o(n(h,"users",t.uid)),c=null,l=null;if(d.exists())c=d.data(),l=d.id,console.log("✅ [Firebase] Found user by Firebase UID:",c.email);else{const p=i(r(h,"users"),a("email","==",t.email)),_=await u(p);_.empty||(c=_.docs[0].data(),l=_.docs[0].id,console.log("✅ [Firebase] Found user by email:",c.email))}return c&&l?{id:l,email:c.email,name:c.name||c.displayName||t.displayName||c.email.split("@")[0],role:c.role||"USER",organizationId:c.organizationId,isTeamMember:c.isTeamMember,memberRole:c.memberRole,memberStatus:c.memberStatus,firebaseUid:t.uid,subscription:c.subscription,licenses:c.licenses,teamMemberData:c.teamMemberData}:{id:t.uid,email:t.email||"",name:t.displayName||((e=t.email)==null?void 0:e.split("@")[0])||"User",role:"USER",firebaseUid:t.uid}}catch(n){return console.warn("⚠️ [Firebase] Failed to load user from Firestore:",n),{id:t.uid,email:t.email||"",name:t.displayName||((s=t.email)==null?void 0:s.split("@")[0])||"User",role:"USER",firebaseUid:t.uid}}},Mt=async t=>{try{if(console.log("🔑 [Firebase] Attempting to restore Firebase Auth session for:",t),Tt(t))return console.log("✅ [Firebase] User already authenticated with correct email"),!0;if(A.currentUser&&A.currentUser.email!==t){console.log("🔄 [Firebase] Different user authenticated, signing out first");const{signOut:e}=await C(async()=>{const{signOut:s}=await import("./index.esm-CiRfLMBX.js");return{signOut:s}},__vite__mapDeps([0,1]));await e(A)}try{const e=localStorage.getItem("temp_credentials");if(e){const s=JSON.parse(e);if(s.email===t&&s.password){console.log("🔑 [Firebase] Attempting to restore Firebase Auth session with stored credentials");const{signInWithEmailAndPassword:n}=await C(async()=>{const{signInWithEmailAndPassword:o}=await import("./index.esm-CiRfLMBX.js");return{signInWithEmailAndPassword:o}},__vite__mapDeps([0,1]));return await n(A,t,s.password),console.log("✅ [Firebase] Firebase Auth session restored successfully"),!0}}}catch(e){console.warn("⚠️ [Firebase] Could not restore session with stored credentials:",e)}return console.log("ℹ️ [Firebase] No stored credentials available for session restoration"),!1}catch(e){return console.warn("⚠️ [Firebase] Error during session restoration:",e),!1}};class xt{static async getOrganizationsForUser(e){try{console.log("🔍 [Firebase] Getting organizations for user:",e);const s=k(F(h,"organizations"),g("ownerUserId","==",e)),n=await I(s),o=k(F(h,"org_members"),g("userId","==",e),g("status","==","ACTIVE")),i=await I(o),r=new Set,a=[];n.forEach(u=>{const d={id:u.id,...u.data()};a.push(d),r.add(u.id)});for(const u of i.docs){const c=u.data().orgId;if(!r.has(c)){const l=await P(v(h,"organizations",c));if(l.exists()){const p={id:l.id,...l.data()};a.push(p),r.add(c)}}}return console.log("✅ [Firebase] Found organizations:",a.length),a}catch(s){return console.error("❌ [Firebase] Error getting organizations:",s),[]}}static async getOrgMembers(e){try{console.log("🔍 [Firebase] Getting org members for:",e);const s=k(F(h,"org_members"),g("orgId","==",e),g("status","==","ACTIVE"),De("createdAt","desc")),n=await I(s),o=[];return n.forEach(i=>{const r=i.data();let a=r.name;a||(r.firstName&&r.lastName?a=`${r.firstName} ${r.lastName}`:r.firstName?a=r.firstName:r.lastName?a=r.lastName:r.email?a=r.email.split("@")[0].replace(/[._-]/g," ").split(" ").map(l=>l.charAt(0).toUpperCase()+l.slice(1).toLowerCase()).join(" "):a="Unknown User");const u={id:i.id,...r,name:a};o.push(u)}),console.log("✅ [Firebase] Found org members:",o.length),o}catch(s){return console.error("❌ [Firebase] Error getting org members:",s),[]}}static async getProjectTeamMembers(e){try{console.log("🔍 [Firebase] Getting project team members for:",e);const s=k(F(h,"projectTeamMembers"),g("projectId","==",e),g("isActive","==",!0)),n=await I(s),o=[];for(const i of n.docs){const r=i.data();let a;try{const d=await P(v(h,"org_members",r.teamMemberId));if(d.exists()){const c=d.data();let l=c.name;l||(c.firstName&&c.lastName?l=`${c.firstName} ${c.lastName}`:c.firstName?l=c.firstName:c.lastName?l=c.lastName:c.email?l=c.email.split("@")[0].replace(/[._-]/g," ").split(" ").map(b=>b.charAt(0).toUpperCase()+b.slice(1).toLowerCase()).join(" "):l="Unknown User"),a={id:d.id,...c,name:l}}}catch(d){console.warn("Failed to get team member details:",d)}const u={id:i.id,...r,teamMember:a};o.push(u)}return console.log("✅ [Firebase] Found project team members:",o.length),o}catch(s){return console.error("❌ [Firebase] Error getting project team members:",s),[]}}static async addTeamMemberToProject(e,s,n="DO_ER"){try{console.log("🔍 [Firebase] Adding team member to project:",{projectId:e,teamMemberId:s,role:n});let o=!1,i=null;try{const l=await P(v(h,"teamMembers",s));l.exists()&&(o=!0,i=l.data(),console.log("✅ [Firebase] Found team member in teamMembers collection"))}catch{console.log("🔍 [Firebase] Team member not found in teamMembers, checking other collections...")}if(!o)try{const l=await P(v(h,"users",s));l.exists()&&(o=!0,i=l.data(),console.log("✅ [Firebase] Found team member in users collection"))}catch{console.log("🔍 [Firebase] Team member not found in users collection...")}if(!o)try{const l=await P(v(h,"orgMembers",s));l.exists()&&(o=!0,i=l.data(),console.log("✅ [Firebase] Found team member in orgMembers collection"))}catch{console.log("🔍 [Firebase] Team member not found in orgMembers collection...")}if(!o)throw new Error(`Team member not found in any collection: ${s}`);const r=k(F(h,"projectTeamMembers"),g("projectId","==",e),g("teamMemberId","==",s),g("isActive","==",!0));if(!(await I(r)).empty)throw new Error("Team member is already assigned to this project");if(n==="ADMIN"){const l=k(F(h,"projectTeamMembers"),g("projectId","==",e),g("role","==","ADMIN"),g("isActive","==",!0));if(!(await I(l)).empty)throw new Error("Only one Admin is allowed per project. Please remove the existing Admin first.")}const u={projectId:e,teamMemberId:s,role:n,assignedAt:new Date,assignedBy:"current_user",isActive:!0},d=Object.fromEntries(Object.entries(u).filter(([l,p])=>p!=null)),c=await Ne(F(h,"projectTeamMembers"),d);return console.log("✅ [Firebase] Team member added successfully:",c.id),{id:c.id,...u}}catch(o){throw console.error("❌ [Firebase] Error adding team member:",o),o}}static async removeTeamMemberFromProject(e,s){try{console.log("🔍 [Firebase] Removing team member from project:",{projectId:e,teamMemberId:s});const n=k(F(h,"projectTeamMembers"),g("projectId","==",e),g("teamMemberId","==",s),g("isActive","==",!0)),o=await I(n);for(const i of o.docs)await ve(v(h,"projectTeamMembers",i.id));console.log("✅ [Firebase] Team member removed successfully")}catch(n){throw console.error("❌ [Firebase] Error removing team member:",n),n}}}export{xt as FirebaseTeamMemberService,m as app,A as auth,h as db,xt as default,A as firebaseAuth,h as firestore,At as fixCSPIssues,St as getCurrentFirebaseUser,vt as getInitializedServices,Ot as initializeFirebaseCollections,Tt as isEmailAuthenticated,Pt as isUserAuthenticated,Ct as isWebOnlyMode,Ut as loadUserFromFirestore,Mt as tryRestoreFirebaseSession};
