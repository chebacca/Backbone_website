# Callsheet: Two-Factor Authentication (2FA)

## Quick Checks
- Dependencies: `speakeasy`, `qrcode`, `@types/speakeasy`, `@types/qrcode` installed
- Database: `twoFactorEnabled`, `twoFactorSecret`, `twoFactorTempSecret`, `twoFactorBackupCodes` fields exist
- Environment: JWT secrets configured, TOTP window settings

## Common Issues

### Login Flow
**Symptoms**: Login returns `{ requires2FA: true, interimToken }` but verification fails
- Check interim token expiry (5 minutes)
- Verify TOTP code format (6 digits)
- Ensure authenticator app time sync is accurate
- Check backup code format and single-use status

**Server Logs**:
- Look for `totp.ts` validation errors
- Check JWT interim token generation/validation
- Verify user record has `twoFactorEnabled: true`

### Setup Flow
**Symptoms**: QR code doesn't scan or verification fails during setup
- Check QR code data URL generation in `totp.ts`
- Verify `otpauthUrl` format includes app name and user email
- Ensure `twoFactorTempSecret` is stored during initiate
- Check TOTP window (1 step skew) for time tolerance

**Database**:
- `twoFactorTempSecret` should be set during initiate
- `twoFactorSecret` should be set after successful verification
- `twoFactorBackupCodes` should contain 8 codes after setup

### Backup Codes
**Symptoms**: Backup code verification fails
- Check code format (8 characters, alphanumeric)
- Verify code hasn't been used before (single-use)
- Ensure codes are removed from array after use
- Check case sensitivity in validation

### Client Issues
**Symptoms**: 2FA challenge not showing or tokens not stored
- Check login response handling in `AuthContext`
- Verify `{ requires2FA, interimToken }` is caught and handled
- Ensure `verify2FA` call includes interim token in Authorization header
- Check localStorage token storage after successful verification

## Resolution Steps

1. **Time Sync Issues**: Advise user to sync authenticator app time
2. **Expired Interim Token**: User must re-login to get new interim token
3. **Used Backup Code**: Generate new backup codes or use different code
4. **QR Code Issues**: Regenerate QR code or manually enter secret
5. **Client State**: Clear localStorage and re-login if tokens corrupted

## Testing Commands
```bash
# Check dependencies
pnpm list speakeasy qrcode @types/speakeasy @types/qrcode

# Verify database schema
pnpm -C server prisma db pull

# Test 2FA endpoints
curl -X POST /api/auth/2fa/setup/initiate -H "Authorization: Bearer <token>"
curl -X POST /api/auth/verify-2fa -H "Authorization: Bearer <interimToken>" -d '{"token":"123456"}'
```

## Security Notes
- Never log full TOTP secrets or backup codes
- Interim tokens should be short-lived (5 minutes)
- Backup codes are single-use and removed after verification
- QR codes should include app name for proper labeling
