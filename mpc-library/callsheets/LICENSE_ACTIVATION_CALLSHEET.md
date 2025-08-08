# Callsheet: License Activation

Symptoms
- Activation fails with format/status/expired/max activations errors
- SDK download denied

Checklist
- Validate license key format (prefix/length rules)
- License.status is PENDING or ACTIVE; not EXPIRED/REVOKED
- Not beyond maxActivations; device fingerprint stable
- Subscription status ACTIVE and within period

Server
- Inspect LicenseService.activateLicense logs
- Ensure deviceInfo fields present (platform, version, deviceId)

DB
- Check license record: activationCount, maxActivations, expiresAt
- UsageAnalytics entries created on success

Resolution
- For exceeded activations, advise deactivation first
- For expired license, renew subscription or reissue
