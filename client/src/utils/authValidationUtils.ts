/**
 * 🔧 AUTHENTICATION VALIDATION UTILITIES
 * 
 * Provides validation functions to prevent authentication errors
 * caused by invalid or corrupted user data in localStorage.
 */

export interface UserDataValidationResult {
  isValid: boolean;
  errors: string[];
  userData?: any;
}

/**
 * Validate user object to ensure it has required properties
 */
export function validateUserObject(userData: any): boolean {
  if (!userData) {
    console.warn('⚠️ [Auth] User data is null or undefined');
    return false;
  }
  
  if (typeof userData !== 'object') {
    console.warn('⚠️ [Auth] User data is not an object:', typeof userData);
    return false;
  }
  
  // Check for required email property
  if (!userData.email || typeof userData.email !== 'string') {
    console.warn('⚠️ [Auth] User data missing valid email property:', userData.email);
    return false;
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    console.warn('⚠️ [Auth] User data has invalid email format:', userData.email);
    return false;
  }
  
  // Check for other essential properties
  if (!userData.id && !userData.uid) {
    console.warn('⚠️ [Auth] User data missing id/uid property');
    return false;
  }
  
  console.log('✅ [Auth] User data validation passed for:', userData.email);
  return true;
}

/**
 * Safely parse and validate user data from localStorage
 */
export function safeParseUserData(userDataStr: string | null): UserDataValidationResult {
  if (!userDataStr) {
    return { isValid: false, errors: ['No user data string provided'] };
  }
  
  try {
    const userData = JSON.parse(userDataStr);
    const isValid = validateUserObject(userData);
    return { isValid, errors: [], userData };
  } catch (parseError) {
    const error = parseError instanceof Error ? parseError.message : 'Unknown parse error';
    return { isValid: false, errors: [`Failed to parse user data: ${error}`] };
  }
}

/**
 * Clean up invalid user data from localStorage
 */
export function cleanupInvalidUserData(): void {
  console.log('🔧 [AuthValidation] Cleaning up invalid user data from localStorage');
  
  const keysToClean = [
    'current_user',
    'team_member',
    'unified_user',
    'auth_user',
    'auth_token',
    'firebase_user_email',
    'firebase_user_uid',
    'current_user_email',
    'current_user_id',
    'is_authenticated',
    'firebase_authenticated'
  ];
  
  keysToClean.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ [AuthValidation] Invalid user data cleaned up');
}

/**
 * Restore user data with validation
 */
export function restoreValidatedUserData(): UserDataValidationResult | null {
  console.log('🔑 [AuthValidation] Attempting to restore validated user data...');
  
  const possibleKeys = ['auth_user', 'current_user', 'team_member', 'unified_user'];
  
  for (const key of possibleKeys) {
    const userDataStr = localStorage.getItem(key);
    if (userDataStr) {
      const validationResult = safeParseUserData(userDataStr);
      
      if (validationResult.isValid) {
        console.log(`✅ [AuthValidation] Valid user data found in ${key}:`, validationResult.userData?.email);
        return validationResult;
      } else {
        console.warn(`⚠️ [AuthValidation] Invalid user data in ${key}:`, validationResult.errors);
      }
    }
  }
  
  console.log('⚠️ [AuthValidation] No valid user data found in localStorage');
  return null;
}

/**
 * Create a safe user object with defaults for missing properties
 */
export function createSafeUserObject(userData: any): any {
  if (!userData) {
    return null;
  }
  
  return {
    id: userData.id || userData.uid || 'unknown-user',
    uid: userData.uid || userData.id || 'unknown-user',
    firebaseUid: userData.firebaseUid || userData.id || userData.uid || 'unknown-user',
    email: userData.email || 'unknown@example.com',
    name: userData.name || userData.displayName || userData.email?.split('@')[0] || 'Unknown User',
    role: userData.role || 'USER',
    organizationId: userData.organizationId || 'unknown-org',
    isTeamMember: Boolean(userData.isTeamMember),
    isOrganizationOwner: Boolean(userData.isOrganizationOwner),
    licenseType: userData.licenseType || 'BASIC',
    projectAccess: Array.isArray(userData.projectAccess) ? userData.projectAccess : [],
    permissions: Array.isArray(userData.permissions) ? userData.permissions : [],
    teamMemberRole: userData.teamMemberRole || undefined,
    dashboardRole: userData.dashboardRole || undefined,
    teamMemberHierarchy: userData.teamMemberHierarchy || 0,
    dashboardHierarchy: userData.dashboardHierarchy || 0,
    effectiveHierarchy: userData.effectiveHierarchy || 0,
    projectAssignments: userData.projectAssignments || {}
  };
}
