# License Management (MPC)

## Enterprise Seat Model

- One seat equals one license per user per subscription; duplicates are prevented.
- PRO/ENTERPRISE licenses are issued just-in-time when an org invitation is accepted or a seat assignment action is executed.
- Licenses issued through enterprise flows include `organizationId`.
- Member removal revokes licenses tied to the organization’s subscription for that user.

## Duplicate Prevention

- Backend checks for existing `(userId, subscriptionId)` licenses before issuing; skips creation when a non-revoked license exists.

## Cleanup Runbook

- Command:
  - `pnpm -C server cleanup:licenses <email>`
- Behavior:
  - Revokes duplicate licenses per subscription; retains the newest valid (ACTIVE/PENDING preferred).
- Requirements:
  - Firebase Admin credentials via env or `gcloud auth application-default login` (ADC).

# License Management (MPC)

Generation
- Triggered post successful payment or admin bulk create
- `LicenseService.generateLicenses(userId, subscriptionId, tier, seatCount)`
- Per-seat licenses; tier-based features; expiry default 1 year; `maxActivations` varies by tier

Activation
- Endpoint: POST /licenses/activate { licenseKey, deviceInfo }
- Validations: key format, status, expiry, activation count
- Device fingerprint generated and stored; increments activation count
- Returns `cloudConfig` derived from tier and license

Validation & Details
- POST /licenses/validate → public for apps to check license validity
- GET /licenses/:licenseId → full details (auth required)

Usage Analytics
- Write to `UsageAnalytics` for activation, validation, downloads, etc.
- Summaries via `/licenses/analytics/:licenseId?` and subscription usage endpoints

Bulk Ops (Enterprise)
- Create bulk licenses for enterprise tier; optional assignment list
- Transfer ownership only for enterprise; resets to PENDING

SDK Downloads
- `GET /licenses/download-sdk/:licenseKey` list, `GET /licenses/download-sdk/:sdkId/:licenseKey` specific
- Requires valid license, returns secure download meta (in production, redirect to signed URL)

Security
- Never return full license keys in logs or analytics; mask with prefix+ellipsis
- Enforce ownership checks for user-facing operations
