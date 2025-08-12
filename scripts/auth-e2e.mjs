#!/usr/bin/env node
// E2E auth + license test script (Node 18+)
// Usage:
//   node scripts/auth-e2e.mjs --email you@example.com --password 'yourpass' [--api https://...]

const args = (() => {
  const out = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    const k = process.argv[i]?.replace(/^--/, '');
    const v = process.argv[i + 1];
    if (!k) continue;
    out[k] = v;
  }
  return out;
})();

const API = args.api || process.env.API || 'https://us-central1-backbone-logic.cloudfunctions.net/api';
const EMAIL = args.email || process.env.EMAIL;
const PASSWORD = args.password || process.env.PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Missing credentials. Provide --email and --password or set EMAIL/PASSWORD env vars.');
  process.exit(2);
}

const json = (o) => JSON.stringify(o, null, 2);

async function main() {
  console.log('Using API:', API);

  // 1) Login
  console.log('\n1) POST /auth/login');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const login = await loginRes.json();
  console.log(json(login));
  if (!login.success) throw new Error('Login failed');
  const tokens = login.data?.tokens || {};
  const accessToken = tokens.accessToken;
  const refreshToken = tokens.refreshToken;
  if (!accessToken) throw new Error('Missing access token');

  // 2) Me
  console.log('\n2) GET /auth/me');
  const meRes = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  console.log(json(await meRes.json()));

  // 3) My licenses
  console.log('\n3) GET /licenses/my-licenses');
  const mlRes = await fetch(`${API}/licenses/my-licenses`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const ml = await mlRes.json();
  console.log(json(ml));
  const licenses = ml.data?.licenses || [];
  const license = licenses.find((l) => l.status === 'ACTIVE') || licenses.find((l) => l.status === 'PENDING') || licenses[0];
  const licenseKey = license?.key;
  if (!licenseKey) {
    console.warn('No license found; skipping activation/validation.');
  } else {
    // 4) Activate
    console.log('\n4) POST /licenses/activate');
    const deviceInfo = {
      platform: process.platform || 'unknown',
      version: process.version,
      deviceId: (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`),
      deviceName: 'Backbone Station',
      architecture: process.arch,
    };
    const actRes = await fetch(`${API}/licenses/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ licenseKey, deviceInfo })
    });
    console.log(json(await actRes.json()));

    // 5) Validate same device
    console.log('\n5) POST /licenses/validate (same device)');
    const val1 = await fetch(`${API}/licenses/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, deviceInfo })
    });
    console.log(json(await val1.json()));

    // 6) Validate different device
    console.log('\n6) POST /licenses/validate (different device)');
    const deviceInfo2 = { ...deviceInfo, deviceId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-DIFF` };
    const val2 = await fetch(`${API}/licenses/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, deviceInfo: deviceInfo2 })
    });
    console.log(json(await val2.json()));
  }

  // 7) Refresh
  if (refreshToken) {
    console.log('\n7) POST /auth/refresh');
    const refRes = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    console.log(json(await refRes.json()));
  } else {
    console.log('\n7) No refresh token returned; skipping refresh test');
  }
}

main().catch((e) => {
  console.error('E2E test failed:', e.message);
  process.exit(1);
});


