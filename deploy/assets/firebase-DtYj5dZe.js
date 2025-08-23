const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index.esm-Cicvjgiv.js","assets/index.esm-B6Q1BJpE.js"])))=>i.map(i=>d[i]);
import{_ as c}from"./index-zdd3rs0b.js";import{r as u,i as l}from"./index.esm-B6Q1BJpE.js";import{getFirestore as n}from"./index.esm-D6OvRmrs.js";import{getAuth as s}from"./index.esm-Cicvjgiv.js";import"./mui-CbJLuC6G.js";import"./vendor-CjD1bmmO.js";import"./stripe-iaBWsbMy.js";var p="firebase",d="12.1.0";/**
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
 */u(p,d,"app");const t={},f=()=>typeof window<"u"&&window.FIREBASE_CONFIG?window.FIREBASE_CONFIG:{apiKey:(t==null?void 0:t.VITE_FIREBASE_API_KEY)||"AIzaSyDFnIzSYCdPsDDdvP1lympVxEeUn0AQhWs",authDomain:"backbone-logic.firebaseapp.com",projectId:"backbone-logic",storageBucket:"backbone-logic.firebasestorage.app",messagingSenderId:"749245129278",appId:"1:749245129278:web:dfa5647101ea160a3b276f",measurementId:"G-8SZRDQ4XVR"},g=f();let i;try{i=l(g),console.log("🔥 [Firebase] App initialized successfully")}catch(e){console.log("ℹ️ [Firebase] App already initialized or error:",e)}const P=i?n(i):n(),o=i?s(i):s();function b(){if(!(typeof window>"u"))try{console.log("ℹ️ [Firebase] Skipping client-side CSP override - relying on Firebase hosting CSP");const e=document.querySelector('meta[http-equiv="Content-Security-Policy"]');e&&(e.remove(),console.log("🧹 [Firebase] Removed conflicting client-side CSP meta tag"))}catch(e){console.warn("⚠️ [Firebase] Failed to clean up CSP:",e)}}b();typeof window<"u"&&(window.FIREBASE_IGNORE_UNDEFINED_PROPERTIES=!0);console.log("🌐 [Firebase] Licensing website mode: production (web-only) - no emulators");const R=()=>!0,m=e=>{var r;return((r=o.currentUser)==null?void 0:r.email)===e},h=async e=>{try{if(m(e))return!0;if(o.currentUser&&o.currentUser.email!==e){const{signOut:r}=await c(async()=>{const{signOut:a}=await import("./index.esm-Cicvjgiv.js");return{signOut:a}},__vite__mapDeps([0,1]));await r(o)}return!1}catch{return!1}};export{i as app,o as auth,P as db,o as firebaseAuth,P as firestore,b as fixCSPIssues,m as isEmailAuthenticated,R as isWebOnlyMode,h as tryRestoreFirebaseSession};
