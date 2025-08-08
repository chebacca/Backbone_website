import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma.js';
import { PasswordUtil } from '../utils/password.js';
import { JwtUtil } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { ComplianceService } from '../services/complianceService.js';
import { EmailService } from '../services/emailService.js';
import { TOTPUtil } from '../utils/totp.js';
import { 
  asyncHandler, 
  validationErrorHandler, 
  createApiError 
} from '../middleware/errorHandler.js';
import { 
  authenticateToken, 
  addRequestInfo,
  requireEmailVerification 
} from '../middleware/auth.js';

const router: Router = Router();

// Add request info to all auth routes
router.use(addRequestInfo);

/**
 * Register new user
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  // Accept boolean true or string 'true'
  body('acceptTerms').custom((v) => v === true || v === 'true').withMessage('Terms of service must be accepted'),
  body('acceptPrivacy').custom((v) => v === true || v === 'true').withMessage('Privacy policy must be accepted'),
  // Optional fields for compliance
  body('businessProfile.companyName').optional().trim(),
  body('businessProfile.companyType').optional().isIn([
    'SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'NON_PROFIT', 'GOVERNMENT', 'OTHER'
  ]),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { email, password, name, acceptTerms, acceptPrivacy, businessProfile } = req.body;
  const requestInfo = (req as any).requestInfo;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createApiError('User with this email already exists', 409);
  }

  // Validate password strength
  const passwordValidation = PasswordUtil.validate(password);
  if (!passwordValidation.isValid) {
    throw createApiError('Password does not meet requirements', 400, 'WEAK_PASSWORD', {
      requirements: passwordValidation.errors,
    });
  }

  // Hash password
  const hashedPassword = await PasswordUtil.hash(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      termsAcceptedAt: new Date(),
      privacyPolicyAcceptedAt: new Date(),
      ipAddress: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      registrationSource: 'website',
    },
  });

  // Create business profile if provided
  if (businessProfile?.companyName) {
    await prisma.businessProfile.create({
      data: {
        userId: user.id,
        companyName: businessProfile.companyName,
        companyType: businessProfile.companyType || 'OTHER',
        incorporationCountry: businessProfile.country || 'US',
        businessDescription: businessProfile.description,
      },
    });
  }

  // Record consent
  await ComplianceService.recordConsent(
    user.id,
    'TERMS_OF_SERVICE',
    true,
    '1.0',
    requestInfo.ip,
    requestInfo.userAgent
  );

  await ComplianceService.recordConsent(
    user.id,
    'PRIVACY_POLICY',
    true,
    '1.0',
    requestInfo.ip,
    requestInfo.userAgent
  );

  // Generate email verification token
  const verificationToken = JwtUtil.generateActivationToken(user.id);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken: verificationToken },
  });

  // Send welcome email with verification (do not fail registration if email fails)
  try {
    await EmailService.sendWelcomeEmail(user, verificationToken);
  } catch (e) {
    // Already handled inside EmailService; proceed
  }

  // Create audit log
  await ComplianceService.createAuditLog(
    user.id,
    'REGISTER',
    'User registered successfully',
    {
      email,
      name,
      hasBusinessProfile: !!businessProfile?.companyName,
    },
    requestInfo
  );

  logger.info(`User registered successfully: ${email}`, {
    userId: user.id,
    hasBusinessProfile: !!businessProfile?.companyName,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
}));

/**
 * Login user
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { email, password } = req.body;
  const requestInfo = (req as any).requestInfo;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: {
          licenses: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
  });

  if (!user) {
    throw createApiError('Invalid credentials', 401);
  }

  // Verify password
  const isValidPassword = await PasswordUtil.compare(password, user.password);
  if (!isValidPassword) {
    throw createApiError('Invalid credentials', 401);
  }

  // If user has 2FA enabled, require TOTP verification
  if ((user as any).twoFactorEnabled) {
    // issue a temporary token for second step (no full access)
    const interimToken = JwtUtil.generateInterimToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await ComplianceService.createAuditLog(
      user.id,
      'LOGIN',
      '2FA challenge issued',
      { email, twoFactor: true },
      requestInfo
    );

    return res.status(200).json({
      success: true,
      message: 'TOTP required',
      data: {
        requires2FA: true,
        interimToken,
      },
    });
  }

  // Generate tokens
  const tokens = JwtUtil.generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Create audit log
  await ComplianceService.createAuditLog(
    user.id,
    'LOGIN',
    'User logged in successfully',
    {
      email,
      subscriptionCount: user.subscriptions.length,
    },
    requestInfo
  );

  logger.info(`User logged in successfully: ${email}`, {
    userId: user.id,
  });

  return res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      tokens,
      subscriptions: user.subscriptions.map(sub => ({
        id: sub.id,
        tier: sub.tier,
        status: sub.status,
        seats: sub.seats,
        currentPeriodEnd: sub.currentPeriodEnd,
        licenses: sub.licenses.map(license => ({
          id: license.id,
          key: license.key,
          status: license.status,
          tier: license.tier,
        })),
      })),
    },
  });
}));

/**
 * Verify TOTP for 2FA login
 */
router.post('/verify-2fa', [
  body('token').notEmpty().withMessage('TOTP code required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const authHeader = req.headers.authorization;
  const interimToken = authHeader && authHeader.split(' ')[1];

  if (!interimToken) {
    throw createApiError('Interim token required', 401);
  }

  const payload = JwtUtil.verifyToken(interimToken);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw createApiError('2FA not enabled', 400);
  }

  let valid = TOTPUtil.verifyToken(user.twoFactorSecret, token);
  if (!valid) {
    // Check backup codes
    const backupMatch = user.twoFactorBackupCodes?.includes(token);
    if (!backupMatch) {
      throw createApiError('Invalid 2FA code', 401);
    }
    // consume the backup code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorBackupCodes: user.twoFactorBackupCodes.filter((c: string) => c !== token),
      },
    });
  }

  const tokens = JwtUtil.generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return res.json({
    success: true,
    message: '2FA verified',
    data: {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
}));

/**
 * 2FA setup - initiate (generate secret and QR)
 */
router.post('/2fa/setup/initiate', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw createApiError('User not found', 404);

  const secret = TOTPUtil.generateSecret(user.email, 'Dashboard v14');
  const qrCodeDataUrl = await TOTPUtil.generateQRCodeDataURL(secret.otpauth_url);

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorTempSecret: secret.base32 },
  });

  return res.json({
    success: true,
    data: {
      otpauthUrl: secret.otpauth_url,
      qrCodeDataUrl,
      secret: secret.base32,
    },
  });
}));

/**
 * 2FA setup - verify and enable
 */
router.post('/2fa/setup/verify', [
  authenticateToken,
  body('token').notEmpty().withMessage('TOTP code required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || !user.twoFactorTempSecret) throw createApiError('No 2FA setup in progress', 400);

  const valid = TOTPUtil.verifyToken(user.twoFactorTempSecret, token);
  if (!valid) throw createApiError('Invalid TOTP code', 401);

  // Generate backup codes
  const backupCodes = Array.from({ length: 8 }, () => Math.random().toString(36).slice(2, 10).toUpperCase());

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: user.twoFactorTempSecret,
      twoFactorTempSecret: null,
      twoFactorBackupCodes: backupCodes,
    },
  });

  return res.json({ success: true, message: '2FA enabled', data: { backupCodes } });
}));

/**
 * 2FA disable
 */
router.post('/2fa/disable', [authenticateToken, body('password').optional()], asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw createApiError('User not found', 404);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorTempSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  return res.json({ success: true, message: '2FA disabled' });
}));

/**
 * Refresh token
 */
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const payload = JwtUtil.verifyToken(refreshToken);
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw createApiError('User not found', 401);
    }

    // Generate new tokens
    const tokens = JwtUtil.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    throw createApiError('Invalid refresh token', 401);
  }
}));

/**
 * Verify email
 */
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const requestInfo = (req as any).requestInfo;

  try {
    // Verify token
    const { userId } = JwtUtil.verifyActivationToken(token);
    
    // Find user with matching token
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        emailVerifyToken: token,
        isEmailVerified: false,
      },
    });

    if (!user) {
      throw createApiError('Invalid or expired verification token', 400);
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });

    // Create audit log
    await ComplianceService.createAuditLog(
      user.id,
      'PROFILE_UPDATE',
      'Email verified successfully',
      { email: user.email },
      requestInfo
    );

    logger.info(`Email verified successfully: ${user.email}`, {
      userId: user.id,
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    throw createApiError('Invalid or expired verification token', 400);
  }
}));

/**
 * Request password reset
 */
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
], asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const requestInfo = (req as any).requestInfo;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // Generate password reset token
  const resetToken = JwtUtil.generatePasswordResetToken(user.id);
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  });

  // Send password reset email
  await EmailService.sendPasswordResetEmail(user, resetToken);

  // Create audit log
  await ComplianceService.createAuditLog(
    user.id,
    'PASSWORD_CHANGE',
    'Password reset requested',
    { email },
    requestInfo
  );

  return res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
}));

/**
 * Reset password
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const requestInfo = (req as any).requestInfo;

  // Validate password strength
  const passwordValidation = PasswordUtil.validate(password);
  if (!passwordValidation.isValid) {
    throw createApiError('Password does not meet requirements', 400, 'WEAK_PASSWORD', {
      requirements: passwordValidation.errors,
    });
  }

  try {
    // Verify token
    const { userId } = JwtUtil.verifyPasswordResetToken(token);
    
    // Find user with matching token
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw createApiError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await PasswordUtil.hash(password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Create audit log
    await ComplianceService.createAuditLog(
      user.id,
      'PASSWORD_CHANGE',
      'Password reset successfully',
      { email: user.email },
      requestInfo
    );

    logger.info(`Password reset successfully: ${user.email}`, {
      userId: user.id,
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    throw createApiError('Invalid or expired reset token', 400);
  }
}));

/**
 * Get current user profile
 */
router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      subscriptions: {
        include: {
          licenses: {
            where: { status: { in: ['ACTIVE', 'PENDING'] } },
          },
        },
      },
      complianceProfile: true,
      billingAddress: true,
      businessProfile: true,
    },
  });

  if (!user) {
    throw createApiError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        kycStatus: user.kycStatus,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      subscriptions: user.subscriptions,
      complianceProfile: user.complianceProfile,
      billingAddress: user.billingAddress,
      businessProfile: user.businessProfile,
    },
  });
}));

/**
 * Update user profile
 */
router.put('/me', [
  authenticateToken,
  requireEmailVerification,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { name, email } = req.body;
  const requestInfo = (req as any).requestInfo;
  const userId = req.user!.id;

  const updateData: any = {};
  if (name) updateData.name = name;
  if (email) {
    // Check if email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw createApiError('Email already in use', 409);
    }

    updateData.email = email;
    updateData.isEmailVerified = false; // Require re-verification for new email
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'PROFILE_UPDATE',
    'User profile updated',
    { updatedFields: Object.keys(updateData) },
    requestInfo
  );

  // If email changed, send new verification
  if (email) {
    const verificationToken = JwtUtil.generateActivationToken(userId);
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken: verificationToken },
    });
    
    await EmailService.sendWelcomeEmail(user, verificationToken);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
}));

/**
 * Logout (client-side only, but log the event)
 */
router.post('/logout', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const requestInfo = (req as any).requestInfo;
  const userId = req.user!.id;

  // Create audit log
  await ComplianceService.createAuditLog(
    userId,
    'LOGOUT',
    'User logged out',
    {},
    requestInfo
  );

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

export { router as authRouter };
