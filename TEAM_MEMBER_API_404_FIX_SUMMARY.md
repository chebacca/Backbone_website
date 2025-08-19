# Team Member API 404 Fix - Summary

## Problem
The `DashboardCloudProjectsBridge` component was receiving 404 errors when trying to call:
- `/api/getProjectTeamMembers?projectId={id}`
- `/api/getLicensedTeamMembers?excludeProjectId={id}`

## Root Cause
The API endpoints existed in the server routes at `/api/team-members/getProjectTeamMembers` and `/api/team-members/getLicensedTeamMembers`, but the client was calling them at the root `/api/` level.

## Solution
Added direct API endpoints at the root level in `server/src/index.ts`:

### 1. `/api/getProjectTeamMembers`
- **Method**: GET
- **Parameters**: `projectId` (query string)
- **Authentication**: Bearer token required
- **Functionality**: Returns team members assigned to a specific project
- **Authorization**: Ensures user can access the requested project

### 2. `/api/getLicensedTeamMembers`
- **Method**: GET
- **Parameters**: `excludeProjectId` (optional query string)
- **Authentication**: Bearer token required
- **Functionality**: Returns all licensed team members, optionally excluding those already assigned to a specific project
- **Authorization**: Based on user's organization membership

## Implementation Details

### Authentication
- Uses JWT token verification via `JwtUtil.verifyToken()`
- Extracts `userId` from JWT payload
- Returns 401 for invalid/missing tokens

### Error Handling
- **400**: Missing required parameters (e.g., projectId)
- **401**: Invalid or missing authentication
- **404**: Project not found or user lacks access
- **500**: Server errors

### Data Flow
1. Verify JWT token and extract user ID
2. For project team members: authorize project access, fetch team members
3. For licensed team members: get user's organization, fetch active members, apply exclusions

## Files Modified
- `server/src/index.ts` - Added new API endpoints
- `server/src/utils/jwt.ts` - Imported for token verification

## Testing

### Local Testing
```bash
# Test unauthorized access (should return 401)
curl -H "Content-Type: application/json" \
  "http://localhost:3001/api/getProjectTeamMembers?projectId=test"

# Test missing project ID (should return 400)
curl -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  "http://localhost:3001/api/getProjectTeamMembers"

# Test with valid token and project ID
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "http://localhost:3001/api/getProjectTeamMembers?projectId=YOUR_PROJECT_ID"
```

### Production Testing
```bash
# Test deployed endpoints
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "https://backbone-logic.web.app/api/getProjectTeamMembers?projectId=YOUR_PROJECT_ID"

curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "https://backbone-logic.web.app/api/getLicensedTeamMembers?excludeProjectId=YOUR_PROJECT_ID"
```

## Test Scripts Created
1. **`scripts/test-team-member-apis.sh`** - Comprehensive test script with colored output
2. **`scripts/curl-test-team-apis.sh`** - Quick curl test script
3. **`fix-team-member-apis-and-deploy.sh`** - Build and deploy script

## Deployment Status
✅ **Successfully deployed to Firebase**
- **Project**: backbone-logic
- **Hosting URL**: https://backbone-logic.web.app
- **Functions URL**: https://api-oup5qxogca-uc.a.run.app

## Expected Results
- No more 404 errors for team member API calls
- Proper authentication and authorization
- Correct error responses for invalid requests
- Seamless integration with existing DashboardCloudProjectsBridge component

## Next Steps
1. Test the deployed endpoints with real authentication tokens
2. Verify the DashboardCloudProjectsBridge component works without errors
3. Monitor logs for any remaining issues
4. Consider adding rate limiting or additional security measures if needed

## Notes
- The fix maintains backward compatibility with existing routes
- All existing functionality is preserved
- The solution follows the same authentication and authorization patterns used elsewhere in the application
