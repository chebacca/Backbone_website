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
