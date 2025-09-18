import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { firestoreService } from '../services/firestoreService.js';
import { UserSynchronizationService } from '../services/UserSynchronizationService.js';
import { PasswordUtil } from '../utils/password.js';
import { JwtUtil } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { ComplianceService } from '../services/complianceService.js';
import { EmailService } from '../services/emailService.js';
import { TOTPUtil } from '../utils/totp.js';
import { getAuth } from 'firebase-admin/auth';
import { 
  asyncHandler, 
  validationErrorHandler, 
  createApiError 
} from '../middleware/errorHandler.js';
import { 
  authenticateFirebaseToken,
  authenticateToken, 
  addRequestInfo,
  requireEmailVerification 
} from '../middleware/auth.js';
import { config } from '../config/index.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const router: Router = Router();

// Add request info to all auth routes
router.use(addRequestInfo);

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().isLength({ min: 2 }),
  body('acceptTerms').custom((v) => v === true || v === 'true'),
  body('acceptPrivacy').custom((v) => v === true || v === 'true'),
  // Address validation for KYC/billing purposes
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name required'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 required'),
  body('city').trim().notEmpty().withMessage('City required'),
  body('state').trim().notEmpty().withMessage('State/Province required'),
  body('postalCode').trim().notEmpty().withMessage('Postal code required'),
  body('country').isLength({ min: 2, max: 3 }).withMessage('Valid country code required'),
  body('company').optional().trim(),
  body('addressLine2').optional().trim(),
  body('phone').optional().trim(),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { 
    email, 
    password, 
    name,
    firstName,
    lastName,
    company,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phone
  } = req.body;
  const requestInfo = (req as any).requestInfo;

  // Validate address information using compliance service
  const addressData = {
    firstName,
    lastName,
    company,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country
  };

  const addressValidation = await ComplianceService.validateBillingAddress(addressData);
  if (!addressValidation.valid) {
    throw createApiError(`Invalid address: ${addressValidation.errors.join(', ')}`, 400);
  }

  // Use synchronized user creation to ensure Firebase Auth and Firestore consistency
  const syncResult = await UserSynchronizationService.createSynchronizedUser({
    email,
    password,
    name,
    firstName,
    lastName,
    role: 'USER'
  });

  if (!syncResult.success) {
    throw createApiError(syncResult.error || 'Failed to create user', 409);
  }

  const user = syncResult.user!;

  // Update user with additional registration data including address
  await firestoreService.updateUser(user.id, {
    termsAcceptedAt: new Date(),
    termsVersionAccepted: config.legal.termsVersion,
    privacyPolicyAcceptedAt: new Date(),
    privacyPolicyVersionAccepted: config.legal.privacyVersion,
    ipAddress: requestInfo.ip,
    userAgent: requestInfo.userAgent,
    registrationSource: 'website',
    // Store address information for KYC/billing purposes
    billingAddress: {
      ...addressData,
      phone,
      validated: true,
      validatedAt: new Date(),
      validationSource: 'registration',
    },
  });

  await ComplianceService.recordConsent(user.id, 'TERMS_OF_SERVICE', true, config.legal.termsVersion, requestInfo.ip, requestInfo.userAgent);
  await ComplianceService.recordConsent(user.id, 'PRIVACY_POLICY', true, config.legal.privacyVersion, requestInfo.ip, requestInfo.userAgent);

  // Firebase Auth automatically sends verification email - no custom token needed
  // User will receive Firebase's built-in verification email

  // Create default projects for the new user
  try {
    const defaults = [
      { name: 'Production', description: 'Primary production project' },
      { name: 'Accounting', description: 'Financial and accounting project' },
      { name: 'Admin', description: 'Administrative project' },
    ];
    await Promise.all(defaults.map((d) => firestoreService.createProject({
      ownerId: user.id,
      name: d.name,
      description: d.description,
      type: 'networked',
      applicationMode: 'shared_network',
      visibility: 'private',
      storageBackend: 'firestore',
      allowCollaboration: false,
      maxCollaborators: 10,
      realTimeEnabled: false,
    })));
  } catch (e) {
    // Non-blocking: projects can be created later if this fails
    logger.warn('Default project creation failed for new user', { userId: user.id, error: (e as any)?.message });
  }

  await ComplianceService.createAuditLog(user.id, 'REGISTER', 'User registered successfully', { email, name }, requestInfo);
  logger.info(`User registered successfully: ${email}`, { userId: user.id });

  // Return tokens so the client can pre-authenticate (Firebase Auth handles email verification)
  const tokens = JwtUtil.generateTokens({ userId: user.id, email: user.email, role: user.role });
  res.status(201).json({
    success: true,
    message: 'Registration successful! Firebase has sent a verification email to your inbox.',
    data: {
      user: { id: user.id, email: user.email, name: user.name, isEmailVerified: user.isEmailVerified },
      tokens,
    }
  });
  return;
}));

/**
 * Google OAuth login
 * Body: { idToken: string }
 */
router.post('/oauth/google', [body('idToken').notEmpty()], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { idToken } = req.body as { idToken: string };
  if (!config.google.clientId) throw createApiError('Google OAuth not configured', 500);

  const client = new OAuth2Client(config.google.clientId);
  let ticket;
  try {
    ticket = await client.verifyIdToken({ idToken, audience: config.google.clientId });
  } catch (e) {
    throw createApiError('Invalid Google ID token', 401);
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw createApiError('Google profile missing email', 400);

  const email = payload.email.toLowerCase();
  const name = payload.name || email.split('@')[0];
  const emailVerified = Boolean(payload.email_verified);

  let user = await firestoreService.getUserByEmail(email);
  if (!user) {
    // Create user with a random password; mark verified if provider verified
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const createdUser = await firestoreService.createUser({
      email,
      password: await PasswordUtil.hash(randomPassword),
      name,
      role: 'USER',
      isEmailVerified: emailVerified,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      privacyConsent: [],
      marketingConsent: false,
      dataProcessingConsent: false,
      termsAcceptedAt: new Date(),
      termsVersionAccepted: config.legal.termsVersion,
      privacyPolicyAcceptedAt: new Date(),
      privacyPolicyVersionAccepted: config.legal.privacyVersion,
      identityVerified: false,
      kycStatus: 'PENDING',
      registrationSource: 'google-oauth',
    });
    user = createdUser;

    // Create default projects for the new Google user
    try {
      const defaults = [
        { name: 'Production', description: 'Primary production project' },
        { name: 'Accounting', description: 'Financial and accounting project' },
        { name: 'Admin', description: 'Administrative project' },
      ];
      await Promise.all(defaults.map((d) => firestoreService.createProject({
        ownerId: user!.id,
        name: d.name,
        description: d.description,
        type: 'networked',
        applicationMode: 'shared_network',
        visibility: 'private',
        storageBackend: 'firestore',
        allowCollaboration: false,
        maxCollaborators: 10,
        realTimeEnabled: false,
      })));
    } catch (e) {
      logger.warn('Default project creation failed for Google user', { userId: user!.id, error: (e as any)?.message });
    }
  } else {
    // Update verification if Google says verified and we aren't yet
    if (emailVerified && !user.isEmailVerified) {
      await firestoreService.updateUser(user.id, { isEmailVerified: true });
    }
  }

  // Generate tokens
  const tokens = JwtUtil.generateTokens({ userId: user.id, email: user.email, role: user.role });
  await firestoreService.updateUser(user.id, { lastLoginAt: new Date() });
  await ComplianceService.createAuditLog(user.id, 'LOGIN', 'User logged in via Google OAuth', { email }, (req as any).requestInfo);

  const requiresLegalAcceptance = (user.termsVersionAccepted !== config.legal.termsVersion) || (user.privacyPolicyVersionAccepted !== config.legal.privacyVersion);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified },
      tokens,
      requiresLegalAcceptance,
      requiredVersions: { terms: config.legal.termsVersion, privacy: config.legal.privacyVersion },
    }
  });
  return;
}));

/**
 * Apple OAuth login
 * Body: { idToken?: string, code?: string, nonce?: string }
 * Supports direct ID token post from Apple or server-side exchange path later.
 */
router.post('/oauth/apple', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) throw createApiError('idToken is required', 400);
  if (!config.apple.clientId) throw createApiError('Apple Sign In not configured', 500);

  // Verify Apple ID token via JWKS
  // Lightweight verification approach: use apple-signin-auth library substitute inline via jwt decode + aud/sub checks is not acceptable here
  // We will use the Apple JWKS endpoint with jsonwebtoken for signature verification.
  const jwksUrl = 'https://appleid.apple.com/auth/keys';
  const jwt = await import('jsonwebtoken');
  const resKeys = await fetch(jwksUrl);
  const { keys } = await resKeys.json();

  const header = JSON.parse(Buffer.from(idToken.split('.')[0], 'base64').toString());
  const jwk = keys.find((k: any) => k.kid === header.kid);
  if (!jwk) throw createApiError('Invalid Apple token header', 401);

  // Convert JWK to PEM
  const getPem = (await import('jwk-to-pem')).default;
  const pem = getPem(jwk);
  let decoded: any;
  try {
    decoded = jwt.verify(idToken, pem, { algorithms: ['RS256'], audience: config.apple.clientId });
  } catch {
    throw createApiError('Invalid Apple ID token', 401);
  }

  const email = (decoded?.email || '').toLowerCase();
  if (!email) throw createApiError('Apple profile missing email', 400);
  const name = email.split('@')[0];

  let user = await firestoreService.getUserByEmail(email);
  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const createdUser = await firestoreService.createUser({
      email,
      password: await PasswordUtil.hash(randomPassword),
      name,
      role: 'USER',
      isEmailVerified: true, // Apple returns verified email
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      privacyConsent: [],
      marketingConsent: false,
      dataProcessingConsent: false,
      termsAcceptedAt: new Date(),
      termsVersionAccepted: config.legal.termsVersion,
      privacyPolicyAcceptedAt: new Date(),
      privacyPolicyVersionAccepted: config.legal.privacyVersion,
      identityVerified: false,
      kycStatus: 'PENDING',
      registrationSource: 'apple-oauth',
    });
    user = createdUser;

    // Create default projects for the new Apple user
    try {
      const defaults = [
        { name: 'Production', description: 'Primary production project' },
        { name: 'Accounting', description: 'Financial and accounting project' },
        { name: 'Admin', description: 'Administrative project' },
      ];
      await Promise.all(defaults.map((d) => firestoreService.createProject({
        ownerId: user!.id,
        name: d.name,
        description: d.description,
        type: 'networked',
        applicationMode: 'shared_network',
        visibility: 'private',
        storageBackend: 'firestore',
        allowCollaboration: false,
        maxCollaborators: 10,
        realTimeEnabled: false,
      })));
    } catch (e) {
      logger.warn('Default project creation failed for Apple user', { userId: user!.id, error: (e as any)?.message });
    }
  }

  const tokens = JwtUtil.generateTokens({ userId: user.id, email: user.email, role: user.role });
  await firestoreService.updateUser(user.id, { lastLoginAt: new Date() });
  await ComplianceService.createAuditLog(user.id, 'LOGIN', 'User logged in via Apple Sign In', { email }, (req as any).requestInfo);

  const requiresLegalAcceptance = (user.termsVersionAccepted !== config.legal.termsVersion) || (user.privacyPolicyVersionAccepted !== config.legal.privacyVersion);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified },
      tokens,
      requiresLegalAcceptance,
      requiredVersions: { terms: config.legal.termsVersion, privacy: config.legal.privacyVersion },
    }
  });
  return;
}));

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { email, password } = req.body;
  const requestInfo = (req as any).requestInfo;
  
  // For Firebase-only project, we should use Firebase Auth for login
  // This endpoint should redirect to Firebase Auth or handle Firebase Auth tokens
  // For now, let's return a message directing users to use Firebase Auth
  res.json({
    success: false,
    message: 'Please use Firebase Authentication for login. This endpoint is for Firebase Auth integration only.',
    firebaseAuth: true,
    redirectTo: '/auth/firebase-login'
  });
}));

router.post('/verify-2fa', [body('token').notEmpty()], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  const authHeader = req.headers.authorization;
  const interimToken = authHeader && authHeader.split(' ')[1];
  if (!interimToken) throw createApiError('Interim token required', 401);

  const payload = JwtUtil.verifyToken(interimToken);
  const user = await firestoreService.getUserById(payload.userId);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) throw createApiError('2FA not enabled', 400);

  let valid = TOTPUtil.verifyToken(user.twoFactorSecret, token);
  if (!valid) {
    const backupMatch = user.twoFactorBackupCodes?.includes(token);
    if (!backupMatch) throw createApiError('Invalid 2FA code', 401);
    await firestoreService.updateUser(user.id, { twoFactorBackupCodes: user.twoFactorBackupCodes.filter((c: string) => c !== token) });
  }

  const tokens = JwtUtil.generateTokens({ userId: user.id, email: user.email, role: user.role });
  res.json({ success: true, message: '2FA verified', data: { tokens, user: { id: user.id, email: user.email, name: user.name, role: user.role, isEmailVerified: user.isEmailVerified } } });
  return;
}));

router.post('/2fa/setup/initiate', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await firestoreService.getUserById(req.user!.id);
  if (!user) throw createApiError('User not found', 404);
  const secret = TOTPUtil.generateSecret(user.email, 'Dashboard v14');
  const qrCodeDataUrl = await TOTPUtil.generateQRCodeDataURL(secret.otpauth_url);
  await firestoreService.updateUser(user.id, { twoFactorTempSecret: secret.base32 });
  res.json({ success: true, data: { otpauthUrl: secret.otpauth_url, qrCodeDataUrl, secret: secret.base32 } });
  return;
}));

router.post('/2fa/setup/verify', [authenticateToken, body('token').notEmpty()], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  const user = await firestoreService.getUserById(req.user!.id);
  if (!user || !user.twoFactorTempSecret) throw createApiError('No 2FA setup in progress', 400);
  const valid = TOTPUtil.verifyToken(user.twoFactorTempSecret, token);
  if (!valid) throw createApiError('Invalid TOTP code', 401);
  const backupCodes = Array.from({ length: 8 }, () => Math.random().toString(36).slice(2, 10).toUpperCase());
  await firestoreService.updateUser(user.id, { twoFactorEnabled: true, twoFactorSecret: user.twoFactorTempSecret, twoFactorTempSecret: null as any, twoFactorBackupCodes: backupCodes });
  res.json({ success: true, message: '2FA enabled', data: { backupCodes } });
  return;
}));

router.post('/2fa/disable', [authenticateToken, body('password').optional()], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await firestoreService.getUserById(req.user!.id);
  if (!user) throw createApiError('User not found', 404);
  await firestoreService.updateUser(user.id, { twoFactorEnabled: false, twoFactorSecret: null as any, twoFactorTempSecret: null as any, twoFactorBackupCodes: [] });
  res.json({ success: true, message: '2FA disabled' });
  return;
}));

router.post('/refresh', [body('refreshToken').notEmpty()], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  try {
    const payload = JwtUtil.verifyToken(refreshToken);
    const user = await firestoreService.getUserById(payload.userId);
    if (!user) throw createApiError('User not found', 401);
    const tokens = JwtUtil.generateTokens({ userId: user.id, email: user.email, role: user.role });
    res.json({ success: true, data: { tokens } });
    return;
  } catch {
    throw createApiError('Invalid refresh token', 401);
  }
}));

// Firebase Auth handles email verification automatically
// This endpoint is kept for backward compatibility but now redirects to Firebase
router.post('/verify-email', [body('token').notEmpty()], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({ 
    success: false, 
    message: 'Email verification is now handled by Firebase Auth. Please check your email for the Firebase verification link.',
    firebaseAuth: true
  });
  return;
}));

// Firebase Auth handles email verification automatically
// This endpoint is kept for backward compatibility but now redirects to Firebase
router.get('/verify-email/:token', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({ 
    success: false, 
    message: 'Email verification is now handled by Firebase Auth. Please check your email for the Firebase verification link.',
    firebaseAuth: true
  });
  return;
}));

// Resend verification email using Firebase Auth
router.post('/resend-verification', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const requestInfo = (req as any).requestInfo;
  const user = await firestoreService.getUserById(req.user!.id);
  if (!user) throw createApiError('User not found', 404);
  if (user.isEmailVerified) {
    res.json({ success: true, message: 'Email already verified' });
    return;
  }

  try {
    // Use Firebase Auth to resend verification email
    await getAuth().generateEmailVerificationLink(user.email);
    
    await ComplianceService.createAuditLog(user.id, 'PROFILE_UPDATE', 'Firebase verification email resent', { email: user.email }, requestInfo);
    logger.info(`Firebase verification email resent to: ${user.email}`, { userId: user.id });
    res.json({ success: true, message: 'Firebase verification email sent successfully' });
    return;
  } catch (error) {
    logger.error('Failed to resend Firebase verification email', { userId: user.id, error });
    throw createApiError('Failed to resend verification email', 500);
  }
}));

// Development helper: fetch latest email verification token for a user (disabled in production)
router.get('/dev/email-token', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!config.isDevelopment) {
    res.status(404).json({ success: false, message: 'Not found' });
    return;
  }
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required' });
    return;
  }
  const user = await firestoreService.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: { token: user.emailVerifyToken || null, isEmailVerified: user.isEmailVerified } });
  return;
}));

router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  
  try {
    // Use Firebase Auth to send password reset email
    await getAuth().generatePasswordResetLink(email);
    
    // Log the request (we don't need to check if user exists for security)
    logger.info(`Firebase password reset email sent to: ${email}`);
    
    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent by Firebase.' });
    return;
  } catch (error) {
    logger.error('Failed to send Firebase password reset email', { email, error });
    // Still return success for security (don't reveal if email exists)
    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent by Firebase.' });
    return;
  }
}));

// Firebase Auth handles password reset automatically
// This endpoint is kept for backward compatibility but now redirects to Firebase
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({ 
    success: false, 
    message: 'Password reset is now handled by Firebase Auth. Please use the link sent to your email.',
    firebaseAuth: true
  });
  return;
}));

/**
 * Change password for authenticated user
 */
router.put('/change-password', [
  authenticateToken,
  requireEmailVerification,
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());

  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  const requestInfo = (req as any).requestInfo;
  const userId = req.user!.id;

  const user = await firestoreService.getUserById(userId);
  if (!user) throw createApiError('User not found', 404);

  const ok = await PasswordUtil.compare(currentPassword, user.password);
  if (!ok) throw createApiError('Current password is incorrect', 401, 'INVALID_CURRENT_PASSWORD');

  const passCheck = PasswordUtil.validate(newPassword);
  if (!passCheck.isValid) {
    throw createApiError('Password does not meet requirements', 400, 'WEAK_PASSWORD', { requirements: passCheck.errors });
  }

  const isSame = await PasswordUtil.compare(newPassword, user.password);
  if (isSame) throw createApiError('New password must be different from current password', 400);

  const hashed = await PasswordUtil.hash(newPassword);
  await firestoreService.updateUser(userId, { password: hashed });
  await ComplianceService.createAuditLog(userId, 'PASSWORD_CHANGE', 'Password changed successfully', {}, requestInfo);
  logger.info(`Password changed successfully for user: ${user.email}`, { userId });

  res.json({ success: true, message: 'Password changed successfully' });
  return;
}));

router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await firestoreService.getUserById(req.user!.id);
  if (!user) throw createApiError('User not found', 404);
  res.json({ success: true, data: { user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    kycStatus: user.kycStatus,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  } } });
  return;
}));

router.put('/me', [
  authenticateToken,
  requireEmailVerification,
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
], asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw validationErrorHandler(errors.array());
  const { name, email } = req.body;
  const requestInfo = (req as any).requestInfo;
  const userId = req.user!.id;

  const updates: any = {};
  if (name) updates.name = name;
  if (email) {
    const existing = await firestoreService.getUserByEmail(email);
    if (existing && existing.id !== userId) throw createApiError('Email already in use', 409);
    updates.email = email;
    updates.isEmailVerified = false;
  }

  await firestoreService.updateUser(userId, updates);
  await ComplianceService.createAuditLog(userId, 'PROFILE_UPDATE', 'User profile updated', { updatedFields: Object.keys(updates) }, requestInfo);

  if (email) {
    // Update email in Firebase Auth and send verification email
    try {
      const user = await firestoreService.getUserById(userId);
      if (user?.firebaseUid) {
        await getAuth().updateUser(user.firebaseUid, { email });
        await getAuth().generateEmailVerificationLink(email);
        logger.info('Firebase Auth email updated and verification sent', { userId, newEmail: email });
      }
    } catch (error) {
      logger.error('Failed to update email in Firebase Auth', { userId, newEmail: email, error });
      // Continue with Firestore update even if Firebase Auth fails
    }
  }

  const updatedUser = await firestoreService.getUserById(userId);
  res.json({ success: true, message: 'Profile updated successfully', data: { user: {
    id: updatedUser!.id,
    email: updatedUser!.email,
    name: updatedUser!.name,
    isEmailVerified: updatedUser!.isEmailVerified,
  } } });
  return;
}));

router.post('/logout', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const requestInfo = (req as any).requestInfo;
  const userId = req.user!.id;
  await ComplianceService.createAuditLog(userId, 'LOGOUT', 'User logged out', {}, requestInfo);
  res.json({ success: true, message: 'Logged out successfully' });
  return;
}));

// Firebase Auth synchronization endpoints
router.post('/sync-firebase-status', authenticateToken, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await firestoreService.getUserById(req.user!.id);
  if (!user?.firebaseUid) {
    res.json({ success: false, message: 'No Firebase UID found for user' });
    return;
  }

  try {
    const { FirebaseAuthSyncService } = await import('../services/FirebaseAuthSyncService.js');
    const syncResult = await FirebaseAuthSyncService.syncEmailVerificationStatus(user.firebaseUid);
    
    if (syncResult.success) {
      res.json({ 
        success: true, 
        message: 'Firebase Auth status synced successfully',
        data: { isEmailVerified: syncResult.isVerified }
      });
    } else {
      res.json({ 
        success: false, 
        message: `Failed to sync: ${syncResult.error}` 
      });
    }
  } catch (error) {
    logger.error('Failed to sync Firebase Auth status', { userId: req.user!.id, error });
    res.json({ success: false, message: 'Failed to sync Firebase Auth status' });
  }
  return;
}));

export { router as authRouter };
